var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const JKANIME_BASE = "https://jkanime.net";
const JKANIME_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const TMDB_API_KEY_JK = "439c478a771f35c05022f9feabcca01c";
function timeoutSignal(ms) {
  try {
    if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") return AbortSignal.timeout(ms);
  } catch (e) {
  }
  try {
    if (typeof AbortController === "function" && typeof setTimeout === "function") {
      const c = new AbortController();
      setTimeout(() => {
        try {
          c.abort();
        } catch (e) {
        }
      }, ms);
      return c.signal;
    }
  } catch (e) {
  }
  return void 0;
}
function fetchText(url, opts) {
  return __async(this, null, function* () {
    const o = Object.assign({ headers: { "User-Agent": JKANIME_UA } }, opts, { signal: timeoutSignal(opts && opts.timeoutMs || 15e3) });
    delete o.timeoutMs;
    const res = yield fetch(url, o);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
  });
}
function base64DecodeUtf8(str) {
  const binary = atob(str);
  let percentEncoded = "";
  for (let i = 0; i < binary.length; i++) {
    const hex = binary.charCodeAt(i).toString(16);
    percentEncoded += "%" + (hex.length === 1 ? "0" + hex : hex);
  }
  try {
    return decodeURIComponent(percentEncoded);
  } catch (e) {
    return binary;
  }
}
function getOrigin(url) {
  const m = url.match(/^([a-z]+:\/\/[^\/]+)/i);
  return m ? m[1] : url;
}
function normalizarJK(s) {
  return (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
function getTmdbTitleJK(tmdbId, mediaType) {
  return __async(this, null, function* () {
    const type = mediaType === "movie" ? "movie" : "tv";
    const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_API_KEY_JK}&language=es-MX`;
    try {
      const res = yield fetch(url, { signal: timeoutSignal(1e4) });
      const data = yield res.json();
      return type === "movie" ? data.title || data.original_title : data.name || data.original_name;
    } catch (e) {
      return null;
    }
  });
}
function fixHostsLinksJK(url) {
  return url.replace("https://hglink.to", "https://streamwish.to").replace("https://swdyu.com", "https://streamwish.to").replace("https://mivalyo.com", "https://vidhidepro.com").replace("https://filemoon.link", "https://filemoon.sx").replace("https://sblona.com", "https://watchsb.com");
}
function extraerResultadosBusqueda(html) {
  const resultados = [];
  const regex = /<div class="anime__item">[\s\S]*?<a\s+href="([^"]+)"[\s\S]*?class="title"[^>]*>([^<]+)</gi;
  let m;
  while ((m = regex.exec(html)) !== null) {
    resultados.push({ href: m[1], title: m[2].trim() });
  }
  return resultados;
}
function unpackJS(code) {
  const m = code.match(new RegExp("eval\\(function\\(p,a,c,k,e,d\\)\\{.*?\\}\\('(.*)',(\\d+),(\\d+),'(.*?)'\\.split\\('\\|'\\)", "s"));
  if (!m) return null;
  try {
    const radix = parseInt(m[2], 10);
    const dict = m[4].split("|");
    const payload = m[1].replace(/\\'/g, "'");
    return payload.replace(/\b\w+\b/g, (word) => {
      const idx = parseInt(word, radix);
      return !isNaN(idx) && dict[idx] !== void 0 && dict[idx] !== "" ? dict[idx] : word;
    });
  } catch (e) {
    return null;
  }
}
function resolveGenerico(embedUrl) {
  return __async(this, null, function* () {
    try {
      const html = yield fetchText(embedUrl, { headers: { Referer: JKANIME_BASE, "User-Agent": JKANIME_UA } });
      const patrones = [
        /sources:\s*\[\s*\{\s*file:\s*"([^"]+)"/,
        /file:\s*"([^"]+\.m3u8[^"]*)"/,
        /"file":"([^"]+\.m3u8[^"]*)"/,
        /src:\s*"([^"]+\.m3u8[^"]*)"/,
        /https?:\/\/[^\s"'\\<>]+\.m3u8[^\s"'\\<>]*/,
        /file:\s*"([^"]+\.mp4[^"]*)"/
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
    } catch (e) {
      return null;
    }
  });
}
function nombreDesdeHost(url) {
  const m = url.match(/^[a-z]+:\/\/([^\/:?#]+)/i);
  const host = m ? m[1].replace(/^www\./, "") : "";
  const base = host.split(".")[0];
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : "JKAnime";
}
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      const title = yield getTmdbTitleJK(tmdbId, mediaType);
      if (!title) return [];
      const tituloNorm = normalizarJK(title);
      const searchHtml = yield fetchText(`${JKANIME_BASE}/buscar/${encodeURIComponent(title)}`);
      const resultados = extraerResultadosBusqueda(searchHtml);
      if (!resultados.length) return [];
      const match = resultados.find((r) => normalizarJK(r.title) === tituloNorm) || resultados[0];
      const targetHref = match.href.startsWith("http") ? match.href : JKANIME_BASE + "/" + match.href.replace(/^\//, "");
      const epNum = mediaType !== "movie" && episode ? parseInt(episode) : 1;
      const episodeUrl = `${targetHref.replace(/\/$/, "")}/${epNum}`;
      const html = yield fetchText(episodeUrl);
      const rawEntries = [];
      const IDIOMAS_JK = { "3": "Latino", "1": "VOSE" };
      const serversMatch = html.match(/var servers = \[([\s\S]*?)\];/);
      if (serversMatch) {
        try {
          const lista = JSON.parse("[" + serversMatch[1] + "]");
          lista.forEach((s) => {
            if (!s.remote) return;
            try {
              rawEntries.push({ url: base64DecodeUtf8(s.remote), idioma: IDIOMAS_JK[String(s.lang)] || "VOSE" });
            } catch (e) {
            }
          });
        } catch (e) {
        }
      }
      const resueltos = [];
      yield Promise.all(rawEntries.map(({ url: u, idioma }) => __async(null, null, function* () {
        try {
          const fixedUrl = fixHostsLinksJK(u);
          const resultado = yield resolveGenerico(fixedUrl);
          if (resultado) {
            resueltos.push({
              name: "JKAnime",
              title: `${idioma} \xB7 HD \xB7 ${nombreDesdeHost(fixedUrl)}`,
              url: resultado.url,
              quality: "HD",
              headers: { "User-Agent": JKANIME_UA, Referer: resultado.referer }
            });
          }
        } catch (e) {
        }
      })));
      return resueltos;
    } catch (e) {
      console.log("[JKAnime] Error: " + e.message);
      return [];
    }
  });
}
module.exports = { getStreams };
