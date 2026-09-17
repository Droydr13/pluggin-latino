const REYDONGHUA_BASE = "https://reydonghua.org";
const REYDONGHUA_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const TMDB_API_KEY_RD = "439c478a771f35c05022f9feabcca01c";

function timeoutSignalRD(ms) {
  try {
    if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") return AbortSignal.timeout(ms);
  } catch (e) {}
  return undefined;
}

async function fetchTextRD(url, opts) {
  const o = Object.assign({ headers: { "User-Agent": REYDONGHUA_UA } }, opts, { signal: timeoutSignalRD((opts && opts.timeoutMs) || 15000) });
  delete o.timeoutMs;
  const res = await fetch(url, o);
  const setCookie = res.headers.get("set-cookie") || "";
  const texto = await res.text();
  return { texto, setCookie, ok: res.ok };
}

function normalizarRD(s) {
  return (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

async function getTmdbTitleRD(tmdbId, mediaType) {
  const type = mediaType === "movie" ? "movie" : "tv";
  const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_API_KEY_RD}&language=es-MX`;
  try {
    const res = await fetch(url, { signal: timeoutSignalRD(10000) });
    const data = await res.json();
    return type === "movie" ? (data.title || data.original_title) : (data.name || data.original_name);
  } catch (e) {
    return null;
  }
}

function fixHostsLinksRD(url) {
  return url
    .replace("https://playerwish.com", "https://streamwish.to")
    .replace("https://hglink.to", "https://streamwish.to")
    .replace("https://swdyu.com", "https://streamwish.to")
    .replace("https://cybervynx.com", "https://streamwish.to")
    .replace("https://dumbalag.com", "https://streamwish.to")
    .replace("https://mivalyo.com", "https://vidhidepro.com")
    .replace("https://dinisglows.com", "https://vidhidepro.com")
    .replace("https://dhtpre.com", "https://vidhidepro.com")
    .replace("https://filemoon.link", "https://filemoon.sx");
}

function base64DecodeUtf8RD(str) {
  const binary = atob(str);
  let percentEncoded = "";
  for (let i = 0; i < binary.length; i++) {
    const hex = binary.charCodeAt(i).toString(16);
    percentEncoded += "%" + (hex.length === 1 ? "0" + hex : hex);
  }
  try { return decodeURIComponent(percentEncoded); } catch (e) { return binary; }
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

async function resolveGenericoRD(embedUrl) {
  try {
    const { texto } = await fetchTextRD(embedUrl, { headers: { Referer: REYDONGHUA_BASE, "User-Agent": REYDONGHUA_UA } });
    const patrones = [
      /sources:\s*\[\s*\{\s*file:\s*"([^"]+)"/,
      /file:\s*"([^"]+\.m3u8[^"]*)"/,
      /"file":"([^"]+\.m3u8[^"]*)"/,
      /src:\s*"([^"]+\.m3u8[^"]*)"/,
      /https?:\/\/[^\s"'\\<>]+\.m3u8[^\s"'\\<>]*/,
      /file:\s*"([^"]+\.mp4[^"]*)"/,
    ];
    for (const p of patrones) {
      const m = texto.match(p);
      if (m) return { url: m[1] || m[0], referer: getOrigin(embedUrl) + "/" };
    }
    const unpacked = unpackJS(texto);
    if (unpacked) {
      for (const p of patrones) {
        const m2 = unpacked.match(p);
        if (m2) return { url: m2[1] || m2[0], referer: getOrigin(embedUrl) + "/" };
      }
    }
    return null;
  } catch (e) { return null; }
}

function nombreDesdeHostRD(url) {
  const m = url.match(/^[a-z]+:\/\/([^\/:?#]+)/i);
  const host = m ? m[1].replace(/^www\./, "") : "";
  const base = host.split(".")[0];
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : "ReyDonghua";
}

async function getStreams(tmdbId, mediaType, season, episode) {
  try {
    const title = await getTmdbTitleRD(tmdbId, mediaType);
    if (!title) return [];
    const tituloNorm = normalizarRD(title);

    const { texto: searchHtml } = await fetchTextRD(`${REYDONGHUA_BASE}/buscar?q=${encodeURIComponent(title)}`);
    let targetHref = null;
    const liRegex = /<li[^>]*class="[^"]*col[^"]*"[\s\S]{0,400}?<a\s+[^>]*href="([^"]+)"[\s\S]{0,300}?<h2[^>]*>([^<]+)<\/h2>/gi;
    let m;
    while ((m = liRegex.exec(searchHtml)) !== null) {
      if (normalizarRD(m[2]) === tituloNorm) { targetHref = m[1]; break; }
      if (!targetHref) targetHref = m[1];
    }
    if (!targetHref) return [];

    const { texto: showHtml, setCookie: setCookie1 } = await fetchTextRD(targetHref);
    const cookies1 = setCookie1.split(";")[0] || "";
    const token = (showHtml.match(/<meta[^>]*name="csrf-token"[^>]*content="([^"]+)"/) || [])[1] || "";
    const caplist = (showHtml.match(/class="[^"]*caplist[^"]*"[^>]*data-ajax="([^"]+)"/) || [])[1];
    if (!caplist) return [];

    const postHeaders = {
      "User-Agent": REYDONGHUA_UA,
      Referer: targetHref,
      "X-Requested-With": "XMLHttpRequest",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      Cookie: cookies1,
    };
    const { texto: paginateTexto, setCookie: setCookie2 } = await fetchTextRD(caplist, {
      method: "POST",
      headers: postHeaders,
      body: new URLSearchParams({ _token: token, p: "1", order: "1" }).toString(),
    });
    const cookies2 = setCookie2.split(";")[0] || cookies1;
    const paginateUrl = JSON.parse(paginateTexto).paginate_url;

    const { texto: capsTexto } = await fetchTextRD(paginateUrl, {
      method: "POST",
      headers: Object.assign({}, postHeaders, { Cookie: cookies2 }),
      body: new URLSearchParams({ _token: token, p: "1", order: "1" }).toString(),
    });
    const capsData = JSON.parse(capsTexto);
    const caps = capsData.caps || [];
    const epNum = mediaType !== "movie" && episode ? parseInt(episode) : 1;
    const epMatch = caps.find((c) => c.episodio === epNum);
    if (!epMatch || !epMatch.url) return [];

    const { texto: epHtml } = await fetchTextRD(epMatch.url, { headers: { Cookie: cookies2 } });
    const rawUrls = [];
    const btnRegex = /<li[^>]*>[\s\S]{0,200}?class="[^"]*play-video[^"]*"[^>]*data-player="([^"]+)"/gi;
    let m2;
    while ((m2 = btnRegex.exec(epHtml)) !== null) {
      try { rawUrls.push(fixHostsLinksRD(base64DecodeUtf8RD(m2[1]))); } catch (e) {}
    }

    const resueltos = [];
    await Promise.all(rawUrls.map(async (u) => {
      try {
        const r = await resolveGenericoRD(u);
        if (r) {
          resueltos.push({
            name: "ReyDonghua",
            title: `${nombreDesdeHostRD(u)} \u00b7 HD`,
            url: r.url,
            quality: "HD",
            headers: { "User-Agent": REYDONGHUA_UA, Referer: r.referer },
          });
        }
      } catch (e) {}
    }));

    return resueltos;
  } catch (e) {
    console.log("[ReyDonghua] Error: " + e.message);
    return [];
  }
}

module.exports = { getStreams };
