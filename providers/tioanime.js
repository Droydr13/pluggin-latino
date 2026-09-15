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
const TIOANIME_BASE = "https://tioanime.com";
const TIOANIME_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const TMDB_API_KEY_TA = "439c478a771f35c05022f9feabcca01c";
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
    const o = Object.assign({ headers: { "User-Agent": TIOANIME_UA } }, opts, { signal: timeoutSignal(opts && opts.timeoutMs || 15e3) });
    delete o.timeoutMs;
    const res = yield fetch(url, o);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
  });
}
function getOrigin(url) {
  const m = url.match(/^([a-z]+:\/\/[^\/]+)/i);
  return m ? m[1] : url;
}
function normalizarTA(s) {
  return (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
function getTmdbTitleTA(tmdbId, mediaType) {
  return __async(this, null, function* () {
    const type = mediaType === "movie" ? "movie" : "tv";
    const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_API_KEY_TA}&language=es-MX`;
    try {
      const res = yield fetch(url, { signal: timeoutSignal(1e4) });
      const data = yield res.json();
      return type === "movie" ? data.title || data.original_title : data.name || data.original_name;
    } catch (e) {
      return null;
    }
  });
}
function parseJsLiteral(str) {
  return Function('"use strict"; return (' + str + ")")();
}
function extraerResultadosTA(html) {
  const resultados = [];
  const regex = /<article class="anime">[\s\S]*?href="([^"]+)"[\s\S]*?<h3[^>]*>([^<]+)<\/h3>/g;
  let m;
  while ((m = regex.exec(html)) !== null) {
    resultados.push({ href: m[1], title: m[2].trim() });
  }
  return resultados;
}
function buscarTA(title) {
  return __async(this, null, function* () {
    const html = yield fetchText(`${TIOANIME_BASE}/directorio?q=${encodeURIComponent(title).replace(/%20/g, "+")}`);
    return extraerResultadosTA(html);
  });
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
      const html = yield fetchText(embedUrl, { headers: { Referer: TIOANIME_BASE, "User-Agent": TIOANIME_UA } });
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
function resolveUmi(rawUrl) {
  return __async(this, null, function* () {
    try {
      const ajaxUrl = rawUrl.replace("gocdn.html#", "gocdn.php?v=");
      const res = yield fetch(ajaxUrl, {
        headers: { "x-requested-with": "XMLHttpRequest", Referer: TIOANIME_BASE, "User-Agent": TIOANIME_UA },
        signal: timeoutSignal(15e3)
      });
      const data = yield res.json();
      if (data && data.file) return { url: data.file, referer: getOrigin(rawUrl) + "/" };
      return null;
    } catch (e) {
      return null;
    }
  });
}
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      const title = yield getTmdbTitleTA(tmdbId, mediaType);
      if (!title) return [];
      const resultados = yield buscarTA(title);
      if (!resultados.length) return [];
      const tituloNorm = normalizarTA(title);
      const match = resultados.find((r) => normalizarTA(r.title) === tituloNorm) || resultados[0];
      const animeUrl = match.href.startsWith("http") ? match.href : TIOANIME_BASE + "/" + match.href.replace(/^\//, "");
      const htmlAnime = yield fetchText(animeUrl);
      const infoMatch = htmlAnime.match(/var anime_info\s*=\s*(\[.*?\])/);
      const episodesMatch = htmlAnime.match(/var episodes\s*=\s*(\[.*?\])/);
      if (!infoMatch || !episodesMatch) return [];
      const animeInfo = parseJsLiteral(infoMatch[1]);
      const episodesList = parseJsLiteral(episodesMatch[1]);
      const slug = animeInfo[1];
      if (!slug || !episodesList.length) return [];
      const epNum = mediaType === "movie" ? 1 : parseInt(episode) || 1;
      if (!episodesList.includes(epNum)) return [];
      const episodeUrl = `${TIOANIME_BASE}/ver/${slug}-${epNum}`;
      const htmlEpisodio = yield fetchText(episodeUrl);
      const videosMatch = htmlEpisodio.match(/var videos\s*=\s*(\[[\s\S]*?\]);/);
      if (!videosMatch) return [];
      const videos = parseJsLiteral(videosMatch[1].replace(/\\\//g, "/"));
      const resueltos = [];
      yield Promise.all(videos.map((_0) => __async(null, [_0], function* ([servidor, rawUrl]) {
        try {
          const url = (rawUrl || "").replace(/\\\//g, "/");
          if (!url) return;
          const nombreServidor = (servidor || "servidor").toLowerCase();
          let resultado = null;
          if (nombreServidor === "umi") {
            resultado = yield resolveUmi(url);
          } else if (url.startsWith("http")) {
            resultado = yield resolveGenerico(url);
          }
          if (resultado) {
            resueltos.push({
              name: "TioAnime",
              title: `${servidor} \xB7 VOSE`,
              url: resultado.url,
              quality: "HD",
              headers: { "User-Agent": TIOANIME_UA, Referer: resultado.referer }
            });
          }
        } catch (e) {
        }
      })));
      return resueltos;
    } catch (e) {
      console.log("[TioAnime] Error: " + e.message);
      return [];
    }
  });
}
module.exports = { getStreams };
