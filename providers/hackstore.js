const TMDB_API_KEY_HS = "439c478a771f35c05022f9feabcca01c";
const HACKSTORE_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

function normalizarHS(s = "") {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function slugConAnio(titulo, anio) {
  const base = normalizarHS(titulo).replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return anio ? `${base}-${anio}` : base;
}

function normalizeSlugHS(titulo) {
  if (!titulo) return "";
  return titulo.toLowerCase()
    .replace(/[\u00e1\u00e0\u00e4\u00e2]/g, "a")
    .replace(/[\u00e9\u00e8\u00eb\u00ea]/g, "e")
    .replace(/[\u00ed\u00ec\u00ef\u00ee]/g, "i")
    .replace(/[\u00f3\u00f2\u00f6\u00f4]/g, "o")
    .replace(/[\u00fa\u00f9\u00fc\u00fb]/g, "u")
    .replace(/\u00f1/g, "n")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function nombreServidorHS(url) {
  if (url.includes("goodstream")) return "GoodStream";
  if (url.includes("hlswish") || url.includes("streamwish")) return "StreamWish";
  if (url.includes("voe")) return "VOE";
  if (url.includes("vimeos")) return "Vimeos";
  if (url.includes("filemoon")) return "Filemoon";
  return "Online";
}

function detectarCalidadHS(url) {
  const patronesCalidad = {
    vimeos: { h: "720p", n: "480p" },
    goodstream: { x: "1080p", h: "720p", n: "480p", l: "360p" },
    vidhide: { n: "720p", l: "480p" },
    streamwish: { x: "1080p", h: "1080p", n: "720p", l: "480p" },
    voe: { n: "720p", l: "360p" },
  };
  const ordenLetras = ["x", "o", "h", "n", "l"];
  let mapa = null;
  if (url.includes("vimeos")) mapa = patronesCalidad.vimeos;
  else if (url.includes("goodstream")) mapa = patronesCalidad.goodstream;
  else if (url.includes("cloudwindow-route")) mapa = patronesCalidad.voe;
  else if (url.includes("minochinos") || url.includes("vidhide") || url.includes("dintezuvio") || url.includes("dramiyos")) mapa = patronesCalidad.vidhide;
  else if (url.includes("premilkyway") || url.includes("hlswish") || url.includes("vibuxer") || url.includes("streamwish")) mapa = patronesCalidad.streamwish;

  if (mapa) {
    const m = url.match(/_,([a-z,]+),\.urlset/);
    if (m) {
      const letras = m[1].split(",").filter(Boolean);
      for (const letra of ordenLetras) {
        if (letras.includes(letra) && mapa[letra]) return mapa[letra];
      }
    }
  }
  const m2 = url.match(/[_\-\/](\d{3,4})p/);
  return m2 ? m2[1] + "p" : "Unknown";
}

function calidadDesdeResolucion(ancho, alto) {
  if (ancho >= 3840 || alto >= 2160) return "4K";
  if (ancho >= 1920 || alto >= 1080) return "1080p";
  if (ancho >= 1280 || alto >= 720) return "720p";
  if (ancho >= 854 || alto >= 480) return "480p";
  return "360p";
}

async function calidadDesdeM3u8(url, headers = {}) {
  try {
    const texto = await (await fetch(url, { headers, redirect: "follow" })).text();
    if (!texto.includes("#EXT-X-STREAM-INF")) {
      const m = url.match(/[_-](\d{3,4})p/);
      return m ? m[1] + "p" : "Unknown";
    }
    let mejorAncho = 0, mejorAlto = 0;
    for (const linea of texto.split("\n")) {
      const m = linea.match(/RESOLUTION=(\d+)x(\d+)/);
      if (m) {
        const alto = parseInt(m[2]);
        if (alto > mejorAlto) { mejorAlto = alto; mejorAncho = parseInt(m[1]); }
      }
    }
    return mejorAlto > 0 ? calidadDesdeResolucion(mejorAncho, mejorAlto) : "Unknown";
  } catch (e) {
    return "Unknown";
  }
}

async function calidadFinal(url, headers = {}) {
  const directa = detectarCalidadHS(url);
  return directa !== "Unknown" ? directa : calidadDesdeM3u8(url, headers);
}

async function resolverGoodStream(url) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": HACKSTORE_UA, Referer: "https://goodstream.one", Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" }, redirect: "follow" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const texto = await res.text();
    const m = texto.match(/file:\s*"([^"]+)"/);
    if (!m) return null;
    const urlFinal = m[1];
    return { url: urlFinal, quality: detectarCalidadHS(urlFinal), headers: { Referer: url, Origin: "https://goodstream.one", "User-Agent": HACKSTORE_UA } };
  } catch (e) {
    return null;
  }
}

function decodeAtobSafe(s) {
  try {
    return typeof atob !== "undefined" ? atob(s) : Buffer.from(s, "base64").toString("utf8");
  } catch (e) {
    return null;
  }
}

function voeDecode(texto, arrayStr) {
  try {
    const reemplazos = arrayStr.replace(/^\[|\]$/g, "").split("','").map((s) => s.replace(/^'+|'+$/g, "")).map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    let rotado = "";
    for (const ch of texto) {
      let code = ch.charCodeAt(0);
      if (code > 64 && code < 91) code = (code - 52) % 26 + 65;
      else if (code > 96 && code < 123) code = (code - 84) % 26 + 97;
      rotado += String.fromCharCode(code);
    }
    for (const r of reemplazos) rotado = rotado.replace(new RegExp(r, "g"), "_");
    rotado = rotado.split("_").join("");
    const paso1 = decodeAtobSafe(rotado);
    if (!paso1) return null;
    let corrido = "";
    for (let i = 0; i < paso1.length; i++) corrido += String.fromCharCode((paso1.charCodeAt(i) - 3 + 256) % 256);
    const invertido = corrido.split("").reverse().join("");
    const paso2 = decodeAtobSafe(invertido);
    return paso2 ? JSON.parse(paso2) : null;
  } catch (e) {
    return null;
  }
}

async function resolverVOE(url) {
  try {
    let res = await fetch(url, { method: "GET", headers: { "User-Agent": HACKSTORE_UA, Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", Referer: url }, redirect: "follow" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    let texto = await res.text();

    if (/permanentToken/i.test(texto)) {
      const m = texto.match(/window\.location\.href\s*=\s*'([^']+)'/i);
      if (m) {
        const res2 = await fetch(m[1], { headers: { "User-Agent": HACKSTORE_UA, Referer: url }, redirect: "follow" });
        if (res2.ok) texto = await res2.text();
      }
    }

    const bloque = texto.match(/json">\s*\[\s*['"]([^'"]+)['"]\s*\]\s*<\/script>\s*<script[^>]*src=['"]([^'"]+)['"]/i);
    if (bloque) {
      const encoded = bloque[1];
      const loaderUrl = bloque[2].startsWith("http") ? bloque[2] : new URL(bloque[2], url).href;
      const loaderRes = await fetch(loaderUrl, { headers: { "User-Agent": HACKSTORE_UA, Referer: url }, redirect: "follow" });
      const loaderTexto = loaderRes.ok ? await loaderRes.text() : "";
      const arrayMatch = loaderTexto.match(/(\[(?:'[^']{1,10}'[\s,]*){4,12}\])/i) || loaderTexto.match(/(\[(?:"[^"]{1,10}"[,\s]*){4,12}\])/i);
      if (arrayMatch) {
        const datos = voeDecode(encoded, arrayMatch[1]);
        if (datos && (datos.source || datos.direct_access_url)) {
          const urlFinal = datos.source || datos.direct_access_url;
          return { url: urlFinal, quality: detectarCalidadHS(urlFinal), headers: { Referer: url } };
        }
      }
    }

    const patronesInline = [/(?:mp4|hls)'\s*:\s*'([^']+)'/gi, /(?:mp4|hls)"\s*:\s*"([^"]+)"/gi];
    for (const patron of patronesInline) {
      let m;
      while ((m = patron.exec(texto)) !== null) {
        let urlFinal = m[1];
        if (!urlFinal) continue;
        if (urlFinal.startsWith("aHR0")) {
          try { urlFinal = atob(urlFinal); } catch (e) {}
        }
        return { url: urlFinal, quality: detectarCalidadHS(urlFinal), headers: { Referer: url } };
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}

function decodeCharCipher(texto, radix, diccionario) {
  const alfabeto = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const decodificar = (chunk) => {
    let valor = 0;
    for (let i = 0; i < chunk.length; i++) {
      const idx = alfabeto.indexOf(chunk[i]);
      if (idx === -1) return NaN;
      valor = valor * radix + idx;
    }
    return valor;
  };
  return texto.replace(/\b([0-9a-zA-Z]+)\b/g, (chunk) => {
    const idx = decodificar(chunk);
    return isNaN(idx) || idx >= diccionario.length ? chunk : (diccionario[idx] && diccionario[idx] !== "" ? diccionario[idx] : chunk);
  });
}

function extraerM3u8DeTexto(texto, base) {
  const bloqueHls = texto.match(/\{[^{}]*"hls[234]"\s*:\s*"([^"]+)"[^{}]*\}/);
  if (bloqueHls) {
    try {
      const json = JSON.parse(bloqueHls[0].replace(/(\w+)\s*:/g, '"$1":'));
      const url = json.hls4 || json.hls3 || json.hls2;
      if (url) return url.startsWith("/") ? base + url : url;
    } catch (e) {
      const m = bloqueHls[0].match(/"hls[234]"\s*:\s*"([^"]+\.m3u8[^"]*)"/);
      if (m) return m[1].startsWith("/") ? base + m[1] : m[1];
    }
  }
  const m2 = texto.match(/["']([^"']{30,}\.m3u8[^"']*)['"]/i);
  if (m2) return m2[1].startsWith("/") ? base + m2[1] : m2[1];
  return null;
}

const HOSTS_ALTERNOS_HS = { "hglink.to": "vibuxer.com" };

async function resolverHLSWish(url) {
  try {
    let urlBase = url;
    for (const [origen, destino] of Object.entries(HOSTS_ALTERNOS_HS)) {
      if (urlBase.includes(origen)) { urlBase = urlBase.replace(origen, destino); break; }
    }
    const origin = (urlBase.match(/^(https?:\/\/[^/]+)/) || [])[1] || "https://hlswish.com";

    const res = await fetch(urlBase, { headers: { "User-Agent": HACKSTORE_UA, Referer: "https://embed69.org/", Origin: "https://embed69.org", Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", "Accept-Language": "es-MX,es;q=0.9" }, redirect: "follow" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const texto = await res.text();

    const fileMatch = texto.match(/file\s*:\s*["']([^"']+)["']/i);
    if (fileMatch) {
      let urlFinal = fileMatch[1];
      if (urlFinal.startsWith("/")) urlFinal = origin + urlFinal;
      if (urlFinal.includes("vibuxer.com/stream/")) {
        try {
          const redirectRes = await fetch(urlFinal, { headers: { "User-Agent": HACKSTORE_UA, Referer: origin + "/" }, redirect: "follow" });
          if (redirectRes.url && redirectRes.url.includes(".m3u8")) urlFinal = redirectRes.url;
        } catch (e) {}
      }
      return { url: urlFinal, quality: await calidadFinal(urlFinal), headers: { "User-Agent": HACKSTORE_UA, Referer: origin + "/" } };
    }

    const empaquetado = texto.match(/eval\(function\(p,a,c,k,e,[a-z]\)\{[^}]+\}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/);
    if (empaquetado) {
      const desempaquetado = decodeCharCipher(empaquetado[1], parseInt(empaquetado[2]), empaquetado[4].split("|"));
      const urlFinal = extraerM3u8DeTexto(desempaquetado, origin);
      if (urlFinal) return { url: urlFinal, quality: await calidadFinal(urlFinal), headers: { "User-Agent": HACKSTORE_UA, Referer: origin + "/" } };
    }

    const directo = texto.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
    if (directo) return { url: directo[0], quality: await calidadFinal(directo[0]), headers: { "User-Agent": HACKSTORE_UA, Referer: origin + "/" } };
    return null;
  } catch (e) {
    return null;
  }
}

async function resolverVimeos(url) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": HACKSTORE_UA, Referer: "https://vimeos.net/", Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" }, redirect: "follow" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const texto = await res.text();
    const empaquetado = texto.match(/eval\(function\(p,a,c,k,e,[dr]\)\{[\s\S]+?\}\('([\s\S]+?)',(\d+),(\d+),'([\s\S]+?)'\.split\('\|'\)/);
    if (!empaquetado) return null;
    const desempaquetado = decodeCharCipher(empaquetado[1], parseInt(empaquetado[2]), empaquetado[4].split("|"));
    const m = desempaquetado.match(/["']([^"']+\.m3u8[^"']*)['"]/i);
    if (!m) return null;
    return { url: m[1], quality: detectarCalidadHS(m[1]), headers: { "User-Agent": HACKSTORE_UA, Referer: "https://vimeos.net/" } };
  } catch (e) {
    return null;
  }
}

const RESOLUTORES_HS = {
  "goodstream.one": resolverGoodStream,
  "hlswish.com": resolverHLSWish,
  "streamwish.com": resolverHLSWish,
  "streamwish.to": resolverHLSWish,
  "strwish.com": resolverHLSWish,
  "voe.sx": resolverVOE,
  "vimeos.net": resolverVimeos,
};

function elegirResolutor(url) {
  for (const [host, resolver] of Object.entries(RESOLUTORES_HS)) {
    if (url.includes(host)) return resolver;
  }
  return null;
}

async function resolverEmbedHS(embed) {
  try {
    const resolver = elegirResolutor(embed.url);
    if (!resolver) return null;
    const resultado = await resolver(embed.url);
    if (!resultado || !resultado.url) return null;
    const calidad = resultado.quality || "Unknown";
    return {
      name: "Hackstore",
      title: `${embed.lang} \u00b7 ${calidad} \u00b7 ${nombreServidorHS(embed.url)}`,
      quality: calidad,
      url: resultado.url,
      headers: resultado.headers || {},
    };
  } catch (e) {
    return null;
  }
}

async function fetchJsonHS(url) {
  const res = await fetch(url, { headers: { "User-Agent": HACKSTORE_UA, Accept: "application/json" }, redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function getTmdbInfoBasico(tmdbId, mediaType) {
  const url = `https://api.themoviedb.org/3/${mediaType === "movie" ? "movie" : "tv"}/${tmdbId}?api_key=${TMDB_API_KEY_HS}&language=es-MX`;
  const data = await fetchJsonHS(url);
  const fecha = mediaType === "movie" ? data.release_date : data.first_air_date;
  return { title: mediaType === "movie" ? data.title : data.name, year: fecha ? fecha.slice(0, 4) : "", seasons: data.number_of_seasons || 0 };
}

async function intentarMetodoHackStore2Com(tmdbId, mediaType, season, episode) {
  const base = "https://hackstore2.com";
  const apiBase = `${base}/api/rest`;
  const info = await getTmdbInfoBasico(tmdbId, mediaType);
  if (!info) return [];

  let postId;
  if (mediaType === "movie") {
    const slug = slugConAnio(info.title, info.year);
    const res = await fetchJsonHS(`${apiBase}/single?post_name=${slug}&post_type=movies`);
    postId = (res && res.data && res.data._id) || null;
  } else {
    const slug = `${slugConAnio(info.title)}-temporada-${season}-episodio-${episode}`;
    const res = await fetchJsonHS(`${apiBase}/single?post_name=${slug}&post_type=episodes`);
    postId = (res && res.data && res.data.episode && res.data.episode._id) || null;
  }
  if (!postId) return [];

  const playerRes = await fetchJsonHS(`${apiBase}/player?post_id=${postId}`);
  const embeds = (playerRes && playerRes.data) || [];
  if (!embeds.length) return [];

  const resultados = await Promise.allSettled(embeds.map((e) => resolverEmbedHS({ ...e, lang: e.lang || "LAT" })));
  return resultados.filter((r) => r.status === "fulfilled" && r.value !== null).map((r) => r.value);
}

async function getTmdbTituloIdioma(tmdbId, mediaType, language) {
  const cleanId = tmdbId.toString().split(":")[0];
  const type = mediaType === "movie" || mediaType === "movies" ? "movie" : "tv";
  try {
    let data;
    if (cleanId.startsWith("tt")) {
      const url = `https://api.themoviedb.org/3/find/${cleanId}?api_key=${TMDB_API_KEY_HS}&external_source=imdb_id&language=${language}`;
      data = await fetchJsonHS(url);
      const resultado = type === "movie" ? (data.movie_results && data.movie_results[0]) : ((data.tv_results && data.tv_results[0]) || (data.movie_results && data.movie_results[0]));
      return resultado ? (resultado.name || resultado.title) : null;
    }
    const url = `https://api.themoviedb.org/3/${type}/${cleanId}?api_key=${TMDB_API_KEY_HS}&language=${language}`;
    data = await fetchJsonHS(url);
    return data.name || data.title || null;
  } catch (e) {
    return null;
  }
}

async function getTmdbAliasesHS(tmdbId, mediaType) {
  const titulos = new Set();
  const cleanId = tmdbId.toString().split(":")[0];
  const type = mediaType === "movie" || mediaType === "movies" ? "movie" : "tv";
  try {
    const [enTitle, esTitle] = await Promise.all([
      getTmdbTituloIdioma(cleanId, type, "en-US"),
      getTmdbTituloIdioma(cleanId, type, "es-MX"),
    ]);
    if (enTitle) titulos.add(enTitle);
    if (esTitle) titulos.add(esTitle);
    const altUrl = `https://api.themoviedb.org/3/${type}/${cleanId}/alternative_titles?api_key=${TMDB_API_KEY_HS}`;
    const data = await fetchJsonHS(altUrl);
    const altResults = data.titles || data.results || [];
    altResults.forEach((item) => { if (item.title) titulos.add(item.title); });
    return Array.from(titulos);
  } catch (e) {
    return Array.from(titulos);
  }
}

async function intentarMetodoHackStoreMx(tmdbId, mediaType, season, episode, query) {
  const BASE_URL = "https://hackstore.mx";
  const [info, aliases] = await Promise.all([
    getTmdbInfoBasico(tmdbId, mediaType).catch(() => null),
    getTmdbAliasesHS(tmdbId, mediaType),
  ]);

  const anio = (info && info.year) || "";
  const titulosBase = new Set();
  if (query) titulosBase.add(query);
  if (info && info.title) titulosBase.add(info.title);
  aliases.forEach((a) => titulosBase.add(a));

  const slugsAProbar = [];
  for (const t of titulosBase) {
    const slug = normalizeSlugHS(t);
    if (!slug) continue;
    if (anio) slugsAProbar.push(`${slug}-${anio}`);
    slugsAProbar.push(slug);
  }
  const slugsUnicos = [...new Set(slugsAProbar)].slice(0, 6);
  const postType = mediaType === "movie" || mediaType === "movies" ? "movies" : "tvshows";

  const resultadosId = await Promise.all(slugsUnicos.map(async (slug) => {
    try {
      const res = await fetchJsonHS(`${BASE_URL}/wp-api/v1/single/${postType}?slug=${slug}&postType=${postType}`);
      if (res && res.data && res.data._id) return { slug, id: res.data._id };
    } catch (e) {}
    return null;
  }));
  const match = resultadosId.find((r) => r !== null);
  if (!match) return [];
  let targetId = match.id;

  if (postType === "tvshows") {
    const epRes = await fetchJsonHS(`${BASE_URL}/wp-api/v1/single/episodes/list?_id=${targetId}&season=${season}&page=1&postsPerPage=200`);
    const epPosts = (epRes && epRes.data && epRes.data.posts) || [];
    const epObj = epPosts.find((p) => p.season_number == season && p.episode_number == episode);
    if (!epObj || !epObj._id) return [];
    targetId = epObj._id;
  }

  const playerResponse = await fetchJsonHS(`${BASE_URL}/wp-api/v1/player?postId=${targetId}`);
  const embeds = ((playerResponse && playerResponse.data && playerResponse.data.embeds) || []).slice(0, 15);
  if (!embeds.length) return [];

  const candidatos = await Promise.all(embeds.map(async (e) => {
    const lang = (e.lang || "Latino").toLowerCase();
    if (lang.includes("sub") || lang.includes("vose") || lang.includes("eng") || lang.includes("espana")) return null;
    if (!e.url || e.url.includes("la.movie")) return null;
    return resolverEmbedHS({ url: e.url, lang: e.lang || "LAT" });
  }));
  return candidatos.filter(Boolean);
}

async function getStreams(tmdbId, mediaType, season, episode, query) {
  try {
    const primerIntento = await intentarMetodoHackStore2Com(tmdbId, mediaType, season, episode).catch(() => []);
    if (primerIntento.length) return primerIntento;
    return await intentarMetodoHackStoreMx(tmdbId, mediaType, season, episode, query).catch(() => []);
  } catch (e) {
    return [];
  }
}

module.exports = { getStreams };
