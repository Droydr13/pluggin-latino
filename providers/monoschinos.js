const TMDB_API_KEY_MC = "439c478a771f35c05022f9feabcca01c";
const MC_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function timeoutSignalMC(ms) {
  try {
    if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") return AbortSignal.timeout(ms);
  } catch (e) {}
  return undefined;
}

async function fetchTextMC(url, opts) {
  const o = Object.assign({ headers: { "User-Agent": MC_UA } }, opts, { signal: timeoutSignalMC((opts && opts.timeoutMs) || 15000) });
  delete o.timeoutMs;
  const res = await fetch(url, o);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

function normalizarMC(s) {
  return (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

async function getTmdbTitleMC(tmdbId, mediaType) {
  const type = mediaType === "movie" ? "movie" : "tv";
  const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_API_KEY_MC}&language=es-MX`;
  try {
    const res = await fetch(url, { signal: timeoutSignalMC(10000) });
    const data = await res.json();
    return type === "movie" ? (data.title || data.original_title) : (data.name || data.original_name);
  } catch (e) {
    return null;
  }
}

function getOrigin(url) {
  const m = url.match(/^([a-z]+:\/\/[^\/]+)/i);
  return m ? m[1] : url;
}

function unpackJS(code) {
  const m = code.match(/eval\(function\(p,a,c,k,e,d\)\{.*?\}\('(.*)',(\d+),(\d+),'(.*?)'\.split\('\|'\)/s);
  if (!m) return null;
  try {
    const radix = parseInt(m[2], 10);
    const dict = m[4].split("|");
    const payload = m[1].replace(/\\'/g, "'");
    return payload.replace(/\b\w+\b/g, (word) => {
      const idx = parseInt(word, radix);
      return (!isNaN(idx) && dict[idx] !== undefined && dict[idx] !== "") ? dict[idx] : word;
    });
  } catch (e) { return null; }
}

async function resolveGenericoMC(embedUrl) {
  try {
    const html = await fetchTextMC(embedUrl, { headers: { Referer: embedUrl } });
    const patrones = [
      /sources:\s*\[\s*\{\s*file:\s*"([^"]+)"/,
      /file:\s*"([^"]+\.m3u8[^"]*)"/,
      /"file":"([^"]+\.m3u8[^"]*)"/,
      /src:\s*"([^"]+\.m3u8[^"]*)"/,
      /https?:\/\/[^\s"'\\<>]+\.m3u8[^\s"'\\<>]*/,
      /file:\s*"([^"]+\.mp4[^"]*)"/,
    ];
    for (const p of patrones) {
      const m = html.match(p);
      if (m) return { url: m[1] || m[0], referer: getOrigin(embedUrl) + "/" };
    }
    const unpacked = unpackJS(html);
    if (unpacked) {
      for (const p of patrones) {
        const m2 = unpacked.match(p);
        if (m2) return { url: m2[1] || m2[0], referer: getOrigin(embedUrl) + "/" };
      }
    }
    return null;
  } catch (e) { return null; }
}

async function resolverServidorMC(url, servidor) {
  try {
    const embed69 = require("./embed69.js");
    if (embed69 && typeof embed69.resolveEmbed === "function") {
      const r = await embed69.resolveEmbed(url, servidor);
      if (r && r.url) return r;
    }
  } catch (e) {}
  return resolveGenericoMC(url);
}

const MC_HOST_NUEVO = "https://vww.monoschinos2.net";

async function buscarSitioNuevo(titulo) {
  const html = await fetchTextMC(`${MC_HOST_NUEVO}/animes?buscar=${encodeURIComponent(titulo)}`, { headers: { Referer: MC_HOST_NUEVO + "/" } });
  const ns = normalizarMC(titulo);
  const bloqueRegex = /ficha_efecto">([\s\S]*?)<\/li>/gi;
  let m;
  while ((m = bloqueRegex.exec(html)) !== null) {
    const bloque = m[1];
    const tituloMatch = bloque.match(/title="([^"]*)"/);
    const hrefMatch = bloque.match(/href="([^"]*)"/);
    if (!tituloMatch || !hrefMatch) continue;
    const cleanTitle = tituloMatch[1].replace("Ver Anime", "").replace("Online Gratis", "").replace(/&quot;|&amp;|&#039;/g, "").trim();
    const cn = normalizarMC(cleanTitle);
    if (cn.includes(ns) || ns.includes(cn)) return hrefMatch[1].replace("./", MC_HOST_NUEVO + "/");
  }
  return null;
}

async function obtenerEpisodioNuevo(seriesUrl, episode) {
  const html = await fetchTextMC(seriesUrl, { headers: { Referer: MC_HOST_NUEVO + "/" } });
  const dataI = (html.match(/data-i="([^"]+)"/) || [])[1];
  const dataU = (html.match(/data-u="([^"]+)"/) || [])[1];
  if (!dataI || !dataU) return null;

  const postBody = `acc=episodes&i=${encodeURIComponent(dataI)}&u=${encodeURIComponent(dataU)}&p=1`;
  const ajaxHtml = await fetchTextMC(`${MC_HOST_NUEVO}/ajax_pagination`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "X-Requested-With": "XMLHttpRequest", Referer: seriesUrl },
    body: postBody,
  });

  const targetEp = String(parseInt(episode, 10));
  const articuloRegex = /<article>([\s\S]*?)<\/article>/gi;
  let m;
  while ((m = articuloRegex.exec(ajaxHtml)) !== null) {
    const articulo = m[1];
    const epUrl = (articulo.match(/href="([^"]+)"/) || [])[1] || "";
    const altMatch = articulo.match(/alt="[^"]*episodio\s*(\d+)/i) || articulo.match(/alt="[^"]*capitulo\s*(\d+)/i);
    const epNum = altMatch ? altMatch[1] : "";
    if (epUrl && epNum === targetEp) return epUrl;
  }
  return null;
}

async function obtenerEmbedsNuevo(episodeUrl) {
  const html = await fetchTextMC(episodeUrl, { headers: { Referer: MC_HOST_NUEVO + "/" } });
  const embeds = [];

  const directRegex = /target="_blank"\s+href="(https?:\/\/[^"]+)"/gi;
  let m;
  while ((m = directRegex.exec(html)) !== null) {
    if (!/rpmplayer\./.test(m[1])) embeds.push(m[1]);
  }

  const encryptMatch = html.match(/data-encrypt="([^"]+)"/);
  if (encryptMatch) {
    const postBody = `acc=opt&i=${encodeURIComponent(encryptMatch[1])}`;
    const ajaxHtml = await fetchTextMC(`${MC_HOST_NUEVO}/ajax_pagination`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "X-Requested-With": "XMLHttpRequest", Referer: episodeUrl },
      body: postBody,
    });
    const dataPlayerRegex = /data-player="([^"]+)"/gi;
    let m2;
    while ((m2 = dataPlayerRegex.exec(ajaxHtml)) !== null) {
      try {
        const url = atob(m2[1]);
        if (url.startsWith("http") && !/rpmplayer\./.test(url)) embeds.push(url);
      } catch (e) {}
    }
  }

  return [...new Set(embeds)];
}

async function intentarMetodoNuevo(title, mediaType, episode) {
  const seriesUrl = await buscarSitioNuevo(title);
  if (!seriesUrl) return [];

  let pageUrl = seriesUrl;
  if (mediaType !== "movie" && episode) {
    const epUrl = await obtenerEpisodioNuevo(seriesUrl, episode);
    if (!epUrl) return [];
    pageUrl = epUrl;
  }

  const embeds = await obtenerEmbedsNuevo(pageUrl);
  if (!embeds.length) return [];

  const resueltos = [];
  await Promise.all(embeds.map(async (embedUrl) => {
    const servidor = (embedUrl.match(/:\/\/(?:www\.)?([^.]+)\./) || [])[1] || "?";
    const r = await resolverServidorMC(embedUrl, servidor).catch(() => null);
    if (r && r.url) {
      resueltos.push({
        name: "Monoschinos",
        title: `${servidor} \u00b7 HD`,
        url: r.url,
        quality: r.quality || "HD",
        headers: { Referer: r.referer || embedUrl, "User-Agent": MC_UA },
      });
    }
  }));
  return resueltos;
}

const MC_HOST_VIEJO = "https://monoschinos.st";

async function intentarMetodoViejo(title, mediaType, episode) {
  const tituloNorm = normalizarMC(title);
  const searchHtml = await fetchTextMC(`${MC_HOST_VIEJO}/buscar?q=${encodeURIComponent(title)}`);
  let targetHref = null;
  const itemRegex = /<a\s+[^>]*href="([^"]+)"[^>]*>[\s\S]{0,300}?<h3[^>]*>([^<]+)<\/h3>/gi;
  let m;
  while ((m = itemRegex.exec(searchHtml)) !== null) {
    if (normalizarMC(m[2]) === tituloNorm) { targetHref = m[1]; break; }
    if (!targetHref) targetHref = m[1];
  }
  if (!targetHref) return [];
  if (!targetHref.startsWith("http")) targetHref = MC_HOST_VIEJO + targetHref;

  let episodeUrl = targetHref;
  if (mediaType !== "movie" && episode) {
    episodeUrl = `${targetHref.replace("-sub-espanol", "").replace("/anime/", "/ver/")}-episodio-${parseInt(episode)}`;
  }

  const epHtml = await fetchTextMC(episodeUrl);
  const rawUrls = [];
  const btnRegex = /<button[^>]*class="[^"]*play-video[^"]*"[^>]*data-player="([^"]+)"/gi;
  let m2;
  while ((m2 = btnRegex.exec(epHtml)) !== null) {
    try { rawUrls.push(atob(m2[1])); } catch (e) {}
  }

  const resueltos = [];
  await Promise.all(rawUrls.map(async (u) => {
    const r = await resolveGenericoMC(u).catch(() => null);
    if (r && r.url) {
      resueltos.push({
        name: "Monoschinos",
        title: `${getOrigin(u).replace(/^https?:\/\//, "")} \u00b7 HD`,
        url: r.url,
        quality: "HD",
        headers: { Referer: r.referer, "User-Agent": MC_UA },
      });
    }
  }));
  return resueltos;
}

async function getStreams(tmdbId, mediaType, season, episode) {
  try {
    const title = await getTmdbTitleMC(tmdbId, mediaType);
    if (!title) return [];

    const primerIntento = await intentarMetodoNuevo(title, mediaType, episode).catch(() => []);
    if (primerIntento.length) return primerIntento;
    return await intentarMetodoViejo(title, mediaType, episode).catch(() => []);
  } catch (e) {
    console.log("[Monoschinos] Error: " + e.message);
    return [];
  }
}

module.exports = { getStreams };
