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
const ANIMEJL_BASE = "https://www.anime-jl.net";
const ANIMEJL_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const TMDB_API_KEY_AJ = "439c478a771f35c05022f9feabcca01c";
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
    const o = Object.assign({ headers: { "User-Agent": ANIMEJL_UA } }, opts, { signal: timeoutSignal(opts && opts.timeoutMs || 15e3) });
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
function normalizarAJ(s) {
  return (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
function getTmdbTitleAJ(tmdbId, mediaType) {
  return __async(this, null, function* () {
    const type = mediaType === "movie" ? "movie" : "tv";
    const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_API_KEY_AJ}&language=es-MX`;
    try {
      const res = yield fetch(url, { signal: timeoutSignal(1e4) });
      const data = yield res.json();
      return type === "movie" ? data.title || data.original_title : data.name || data.original_name;
    } catch (e) {
      return null;
    }
  });
}
function extraerResultadosAJ(html) {
  const resultados = [];
  const regex = /<li[^>]*>[\s\S]{0,50}?<article[^>]*class="[^"]*Anime[^"]*"[\s\S]{0,300}?<a\s+[^>]*href="([^"]+)"[\s\S]{0,300}?<h3[^>]*class="[^"]*Title[^"]*"[^>]*>([^<]+)<\/h3>/gi;
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
      const html = yield fetchText(embedUrl, { headers: { Referer: ANIMEJL_BASE, "User-Agent": ANIMEJL_UA } });
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
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : "AnimeJL";
}
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      const title = yield getTmdbTitleAJ(tmdbId, mediaType);
      if (!title) return [];
      const tituloNorm = normalizarAJ(title);
      const htmlSearch = yield fetchText(`${ANIMEJL_BASE}/animes?q=${encodeURIComponent(title)}`);
      const resultados = extraerResultadosAJ(htmlSearch);
      if (!resultados.length) return [];
      const match = resultados.find((r) => normalizarAJ(r.title) === tituloNorm) || resultados[0];
      const targetHref = match.href.startsWith("http") ? match.href : ANIMEJL_BASE + match.href;
      const hrefLower = targetHref.toLowerCase();
      const idiomaAJ = hrefLower.includes("-latino") ? "Latino" : hrefLower.includes("-castellano") ? "Castellano" : "VOSE";
      const htmlShow = yield fetchText(targetHref);
      const episodesMatch = htmlShow.match(/var\s*episodes\s*=\s*(\[[\s\S]*?\]);/);
      if (!episodesMatch) return [];
      let episodesList;
      try {
        episodesList = JSON.parse(episodesMatch[1].replace(/,\s*\]/g, "]"));
      } catch (e) {
        return [];
      }
      const epNum = mediaType === "movie" ? 1 : parseInt(episode) || 1;
      const found = episodesList.find((e) => parseInt(e[0]) === epNum);
      if (!found) return [];
      const epUrl = `${targetHref}/${found[1]}`;
      const htmlEp = yield fetchText(epUrl);
      const videoRegex = /video\[\d+\]\s*=\s*'([^']+)'/g;
      const videoEntries = [];
      let mVideo;
      while ((mVideo = videoRegex.exec(htmlEp)) !== null) videoEntries.push(mVideo[1]);
      if (!videoEntries.length) return [];
      const resueltos = [];
      yield Promise.all(videoEntries.map((u) => __async(null, null, function* () {
        try {
          const resultado = yield resolveGenerico(u);
          if (resultado) {
            resueltos.push({
              name: "AnimeJL",
              title: `${idiomaAJ} \xB7 HD \xB7 ${nombreDesdeHost(u)}`,
              url: resultado.url,
              quality: "HD",
              headers: { "User-Agent": ANIMEJL_UA, Referer: resultado.referer }
            });
          }
        } catch (e) {
        }
      })));
      return resueltos;
    } catch (e) {
      console.log("[AnimeJL] Error: " + e.message);
      return [];
    }
  });
}
module.exports = { getStreams };
