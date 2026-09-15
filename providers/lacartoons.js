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
const BASE_URL = "https://lacartoons.com";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const TMDB_API_KEY_LC = "439c478a771f35c05022f9feabcca01c";
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
function fetchHTML(url, opts) {
  return __async(this, null, function* () {
    const o = Object.assign({ headers: { "User-Agent": UA } }, opts, { signal: timeoutSignal(15e3) });
    const res = yield fetch(url, o);
    return res.text();
  });
}
function normalizarLC(s) {
  return (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
function getTmdbTitleLC(tmdbId, mediaType) {
  return __async(this, null, function* () {
    const type = mediaType === "movie" ? "movie" : "tv";
    const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_API_KEY_LC}&language=es-MX`;
    try {
      const res = yield fetch(url, { signal: timeoutSignal(1e4) });
      const data = yield res.json();
      return type === "movie" ? data.title || data.original_title : data.name || data.original_name;
    } catch (e) {
      return null;
    }
  });
}
function extraerResultadosBusqueda(html) {
  const resultados = [];
  const regex = /<a\s+([^>]*href=["']([^"']+)["'][^>]*)>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = regex.exec(html)) !== null) {
    const bloque = m[3];
    const nombreMatch = bloque.match(/nombre-serie[^>]*>([^<]+)</i);
    if (!nombreMatch) continue;
    resultados.push({ href: m[2], title: nombreMatch[1].trim() });
  }
  return resultados;
}
function buscarSerie(title) {
  return __async(this, null, function* () {
    const html = yield fetchHTML(`${BASE_URL}/?Titulo=${encodeURIComponent(title)}`);
    const resultados = extraerResultadosBusqueda(html);
    if (!resultados.length) return null;
    const tituloNorm = normalizarLC(title);
    const match = resultados.find((r) => normalizarLC(r.title) === tituloNorm) || resultados[0];
    return match.href.startsWith("http") ? match.href : BASE_URL + "/" + match.href.replace(/^\//, "");
  });
}
function extraerEpisodios(html) {
  const episodios = [];
  const seccionIdx = html.indexOf("listas-de-episodion");
  const zona = seccionIdx !== -1 ? html.slice(seccionIdx) : html;
  const regex = /<a\s+([^>]*href=["']([^"']+)["'][^>]*)>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = regex.exec(zona)) !== null) {
    const href = m[2];
    const texto = m[3].replace(/<[^>]+>/g, "").trim();
    const seasonMatch = href.match(/[?&]t=(\d+)/);
    const epMatch = texto.match(/[Cc]apitulo.(\d+)/);
    if (!seasonMatch || !epMatch) continue;
    episodios.push({
      season: parseInt(seasonMatch[1]),
      episode: parseInt(epMatch[1]),
      href: href.startsWith("http") ? href : BASE_URL + "/" + href.replace(/^\//, "")
    });
  }
  return episodios;
}
const HOST_ALIASES = [
  [/^https:\/\/short\.ink\//i, "https://abysscdn.com/?v="],
  [/^https:\/\/hglink\.to/i, "https://streamwish.to"],
  [/^https:\/\/swdyu\.com/i, "https://streamwish.to"],
  [/^https:\/\/cybervynx\.com/i, "https://streamwish.to"],
  [/^https:\/\/dumbalag\.com/i, "https://streamwish.to"],
  [/^https:\/\/mivalyo\.com/i, "https://vidhidepro.com"],
  [/^https:\/\/dinisglows\.com/i, "https://vidhidepro.com"],
  [/^https:\/\/dhtpre\.com/i, "https://vidhidepro.com"],
  [/^https:\/\/filemoon\.link/i, "https://filemoon.sx"],
  [/^https:\/\/sblona\.com/i, "https://watchsb.com"],
  [/^https:\/\/lulu\.st/i, "https://lulustream.com"],
  [/^https:\/\/uqload\.io/i, "https://uqload.com"],
  [/^https:\/\/do7go\.com/i, "https://dood.la"]
];
function normalizarHostEmbed(url) {
  for (const [patron, reemplazo] of HOST_ALIASES) {
    if (patron.test(url)) return url.replace(patron, reemplazo);
  }
  return url;
}
function getOrigin(url) {
  const m = url.match(/^([a-z]+:\/\/[^\/]+)/i);
  return m ? m[1] : url;
}
function findEmbedUrl(epUrl) {
  return __async(this, null, function* () {
    const html = yield fetchHTML(epUrl);
    let embedSrc = null;
    const seccionIdx = html.indexOf("serie-video-informacion");
    if (seccionIdx !== -1) {
      const m = html.slice(seccionIdx).match(/<iframe[^>]+src=["']([^"']+)["']/i);
      if (m) embedSrc = m[1].startsWith("http") ? m[1] : BASE_URL + m[1];
    }
    if (!embedSrc) {
      const iframeRegex = /<iframe[^>]+src=["']([^"']+)["']/gi;
      let m2;
      while ((m2 = iframeRegex.exec(html)) !== null) {
        if (!m2[1].includes("google") && !m2[1].includes("facebook")) {
          embedSrc = m2[1];
          break;
        }
      }
    }
    return embedSrc ? normalizarHostEmbed(embedSrc) : null;
  });
}
function resolveGenerico(embedUrl) {
  return __async(this, null, function* () {
    const html = yield fetchHTML(embedUrl, { headers: { Referer: BASE_URL, "User-Agent": UA } });
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
    return null;
  });
}
function debugStream(mensaje) {
  return [{
    name: "[DEBUG] " + mensaje,
    title: "[DEBUG] " + mensaje,
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  }];
}
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      const title = yield getTmdbTitleLC(tmdbId, mediaType);
      if (!title) return debugStream("No se pudo obtener el titulo desde TMDB para " + tmdbId);
      const serieUrl = yield buscarSerie(title);
      if (!serieUrl) return debugStream('"' + title + '" no aparecio en la busqueda de lacartoons.com');
      const html = yield fetchHTML(serieUrl);
      const episodios = extraerEpisodios(html);
      if (!episodios.length) return debugStream("Serie encontrada (" + serieUrl + ") pero no se pudo leer la lista de episodios");
      const seasonNum = parseInt(season) || 1;
      const epNum = parseInt(episode) || 1;
      const match = episodios.find((e) => e.season === seasonNum && e.episode === epNum);
      if (!match) return debugStream("Serie encontrada, pero no hay S" + seasonNum + "E" + epNum + " en la pagina");
      const embedSrc = yield findEmbedUrl(match.href);
      if (!embedSrc) return debugStream("Se encontro el capitulo (" + match.href + ") pero no hay iframe de reproductor");
      const resultado = yield resolveGenerico(embedSrc);
      if (!resultado) return debugStream("Reproductor encontrado (" + embedSrc + ") pero no se pudo extraer el video real");
      return [{
        name: "LACartoons",
        title: "LACartoons - Espa\xF1ol Latino",
        url: resultado.url,
        quality: "HD",
        headers: { "User-Agent": UA, Referer: resultado.referer }
      }];
    } catch (e) {
      return debugStream("ERROR: " + e.message);
    }
  });
}
module.exports = { getStreams };
