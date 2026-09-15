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
const AREADOC_BASE = "https://www.area-documental.com";
const AREADOC_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const TMDB_API_KEY_AD = "439c478a771f35c05022f9feabcca01c";
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
function fetchConCookies(url, opts) {
  return __async(this, null, function* () {
    const o = Object.assign({ headers: { "User-Agent": AREADOC_UA } }, opts, { signal: timeoutSignal(opts && opts.timeoutMs || 15e3) });
    delete o.timeoutMs;
    const res = yield fetch(url, o);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = yield res.text();
    let setCookie = null;
    try {
      if (res.headers && typeof res.headers.getSetCookie === "function") {
        const arr = res.headers.getSetCookie();
        setCookie = arr && arr.find((c) => c.includes("PHPSESSID")) || null;
      } else if (res.headers && typeof res.headers.get === "function") {
        setCookie = res.headers.get("set-cookie");
      }
    } catch (e) {
    }
    return { html, setCookie };
  });
}
function normalizarAD(s) {
  return (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
function getTmdbTitleAD(tmdbId, mediaType) {
  return __async(this, null, function* () {
    const type = mediaType === "movie" ? "movie" : "tv";
    const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_API_KEY_AD}&language=es-MX`;
    try {
      const res = yield fetch(url, { signal: timeoutSignal(1e4) });
      const data = yield res.json();
      return type === "movie" ? data.title || data.original_title : data.name || data.original_name;
    } catch (e) {
      return null;
    }
  });
}
function extraerResultadosAD(html) {
  const resultados = [];
  const regex = /class=imagen[\s\S]{0,50}?href=([^\s>]+)>[\s\S]{0,300}?title=([^\/]+?)\/>/gi;
  let m;
  while ((m = regex.exec(html)) !== null) {
    resultados.push({ href: m[1].replace(/["'()]/g, ""), title: m[2].replace(/["'()]/g, "").trim() });
  }
  if (resultados.length) return resultados;
  const regex2 = /<div id="peliculas">[\s\S]*?a href="([^"]+)"[\s\S]*?target="_blank">([^<]+)<\/a>/gi;
  while ((m = regex2.exec(html)) !== null) resultados.push({ href: m[1], title: m[2].trim() });
  return resultados;
}
function buscarAD(title) {
  return __async(this, null, function* () {
    const intentos = [
      `${AREADOC_BASE}/resultados/buscar=${encodeURIComponent(title)}/`,
      `${AREADOC_BASE}/resultados.php?buscar=${encodeURIComponent(title)}&genero=`
    ];
    for (const url of intentos) {
      try {
        const { html } = yield fetchConCookies(url);
        const resultados = extraerResultadosAD(html);
        if (resultados.length) return resultados;
      } catch (e) {
      }
    }
    return [];
  });
}
function extraerVideoUrl(html) {
  const bloqueKodi = html.match(/title[\s\S]*?track/);
  if (bloqueKodi) {
    const m = bloqueKodi[0].match(/file:\s*"([^"]+)"/);
    if (m) return m[1];
  }
  const bloqueViejo = html.match(/jwplayer\('myElement'\)\.setup\(([\s\S]*?)\);/);
  if (bloqueViejo) {
    const m = bloqueViejo[1].match(/file:\s*"([^"]+)"/);
    if (m) return m[1];
  }
  const generico = html.match(/file:\s*"([^"]+)"/);
  return generico ? generico[1] : null;
}
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      const title = yield getTmdbTitleAD(tmdbId, mediaType);
      if (!title) return [];
      const resultados = yield buscarAD(title);
      if (!resultados.length) return [];
      const tituloNorm = normalizarAD(title);
      const match = resultados.find((r) => normalizarAD(r.title) === tituloNorm) || resultados[0];
      const targetHref = match.href.startsWith("http") ? match.href : AREADOC_BASE + "/" + match.href.replace(/^\//, "");
      let videoPageUrl = targetHref;
      if (season && episode) {
        const { html } = yield fetchConCookies(targetHref);
        const serieLinkMatch = html.match(/href="([^"]*resultados-serie\.php\?buscar=([^"&]+)[^"]*)"/);
        if (serieLinkMatch) {
          const nombreSerie = decodeURIComponent(serieLinkMatch[2]);
          const { html: htmlSerie } = yield fetchConCookies(`${AREADOC_BASE}/resultados-serie.php?buscar=${encodeURIComponent(nombreSerie)}&genero=`);
          const epNum = parseInt(episode);
          const epRegex = /href="([^"]+)"[^>]*>[\s\S]{0,100}?[Ee]p\w*\s*(\d+)/g;
          let epMatch;
          while ((epMatch = epRegex.exec(htmlSerie)) !== null) {
            if (parseInt(epMatch[2]) === epNum) {
              videoPageUrl = epMatch[1].startsWith("http") ? epMatch[1] : AREADOC_BASE + "/" + epMatch[1].replace(/^\//, "");
              break;
            }
          }
        }
      }
      const { html: htmlVideo, setCookie } = yield fetchConCookies(videoPageUrl);
      const videoUrl = extraerVideoUrl(htmlVideo);
      if (!videoUrl) return [];
      const headers = { "User-Agent": AREADOC_UA, Referer: videoPageUrl };
      if (setCookie) {
        const phpSessMatch = setCookie.match(/PHPSESSID=([^;]+)/);
        if (phpSessMatch) headers["Cookie"] = `PHPSESSID=${phpSessMatch[1]}`;
      }
      return [{
        name: "AreaDocumental",
        title: "720p \xB7 Directo",
        url: videoUrl,
        quality: "720p",
        headers
      }];
    } catch (e) {
      console.log("[AreaDocumental] Error: " + e.message);
      return [];
    }
  });
}
module.exports = { getStreams };
