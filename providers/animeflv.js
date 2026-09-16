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
const ANIMEFLV_BASE = "https://www3.animeflv.net";
const ANIMEFLV_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const TMDB_API_KEY_AFLV = "439c478a771f35c05022f9feabcca01c";
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
    const o = Object.assign({ headers: { "User-Agent": ANIMEFLV_UA } }, opts, { signal: timeoutSignal(opts && opts.timeoutMs || 15e3) });
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
function normalizarAFLV(s) {
  return (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
function getTmdbTitleAFLV(tmdbId, mediaType) {
  return __async(this, null, function* () {
    const type = mediaType === "movie" ? "movie" : "tv";
    const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_API_KEY_AFLV}&language=es-MX`;
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
function buscarApiAFLV(title) {
  return __async(this, null, function* () {
    const res = yield fetch(`${ANIMEFLV_BASE}/api/animes/search`, {
      method: "POST",
      headers: { "User-Agent": ANIMEFLV_UA, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ value: title, limit: "100" }).toString(),
      signal: timeoutSignal(15e3)
    });
    const data = yield res.json();
    return Array.isArray(data) ? data : [];
  });
}
function buscarHtmlAFLV(title) {
  return __async(this, null, function* () {
    const html = yield fetchText(`${ANIMEFLV_BASE}/browse?q=${encodeURIComponent(title)}`);
    const resultados = [];
    const regex = /<ul class="ListAnimes[^>]*>[\s\S]*?<\/ul>/;
    const bloque = html.match(regex);
    if (!bloque) return resultados;
    const itemRegex = /<article[\s\S]*?href="([^"]+)"[\s\S]*?<h3[^>]*>([^<]+)<\/h3>/gi;
    let m;
    while ((m = itemRegex.exec(bloque[0])) !== null) {
      resultados.push({ href: m[1], title: m[2].trim() });
    }
    return resultados;
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
      const html = yield fetchText(embedUrl, { headers: { Referer: ANIMEFLV_BASE, "User-Agent": ANIMEFLV_UA } });
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
function resolverUrlEspecialAFLV(rawUrl) {
  return __async(this, null, function* () {
    let url = rawUrl.replace("embedsito", "fembed");
    if (url.includes("redirector")) {
      const html = yield fetchText(url, { headers: { Referer: ANIMEFLV_BASE, "User-Agent": ANIMEFLV_UA } });
      const m = html.match(/window\.location\.href\s*=\s*"([^"]+)"/);
      if (m) url = m[1];
    } else if (url.includes("animeflv.net/embed") || url.includes("gocdn.html")) {
      const apiUrl = url.replace("embed", "check").replace("gocdn.html#", "gocdn.php?v=");
      try {
        const res = yield fetch(apiUrl, { headers: { Referer: ANIMEFLV_BASE, "User-Agent": ANIMEFLV_UA }, signal: timeoutSignal(15e3) });
        const json = yield res.json();
        if (json && json.file) return { url: json.file, esDirecto: true };
      } catch (e) {
      }
      return null;
    }
    return { url, esDirecto: false };
  });
}
function nombreDesdeHost(url) {
  const m = url.match(/^[a-z]+:\/\/([^\/:?#]+)/i);
  const host = m ? m[1].replace(/^www\./, "") : "";
  const base = host.split(".")[0];
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : "AnimeFLV";
}
const IDIOMAS_AFLV = { LAT: "Latino", SUB: "VOSE" };
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      const title = yield getTmdbTitleAFLV(tmdbId, mediaType);
      if (!title) return [];
      const tituloNorm = normalizarAFLV(title);
      const epNum = mediaType === "movie" ? 1 : parseInt(episode) || 1;
      let slug = null;
      try {
        const resultadosApi = yield buscarApiAFLV(title);
        if (resultadosApi.length) {
          const best = resultadosApi.find((r) => normalizarAFLV(r.title) === tituloNorm) || resultadosApi[0];
          if (best) slug = best.slug;
        }
      } catch (e) {
      }
      let episodeUrl = null;
      if (slug) {
        const animeUrl = `${ANIMEFLV_BASE}/anime/${slug}`;
        try {
          const htmlAnime = yield fetchText(animeUrl);
          const infoMatch = htmlAnime.match(/anime_info = \[(.*?)\];/);
          const episodesMatch = htmlAnime.match(/var episodes = (\[.*?\]);/);
          if (infoMatch && episodesMatch) {
            const animeInfo = parseJsLiteral("[" + infoMatch[1] + "]");
            const episodesList = parseJsLiteral(episodesMatch[1]);
            const slugReal = animeInfo[2] || slug;
            const existe = episodesList.some((e) => (Array.isArray(e) ? e[0] : e) === epNum);
            if (existe) episodeUrl = `${ANIMEFLV_BASE}/ver/${slugReal}-${epNum}`;
          }
        } catch (e) {
        }
        if (!episodeUrl) episodeUrl = `${ANIMEFLV_BASE}/ver/${slug}-${epNum}`;
      }
      if (!episodeUrl) {
        const resultadosHtml = yield buscarHtmlAFLV(title);
        if (!resultadosHtml.length) return [];
        const match = resultadosHtml.find((r) => normalizarAFLV(r.title) === tituloNorm) || resultadosHtml[0];
        const targetHref = match.href.startsWith("http") ? match.href : ANIMEFLV_BASE + match.href;
        episodeUrl = targetHref.replace("/anime/", "/ver/") + "-" + epNum;
      }
      const html = yield fetchText(episodeUrl);
      const videosMatch = html.match(/var videos = (\{[\s\S]*?\});/);
      if (!videosMatch) return [];
      let videosJson;
      try {
        videosJson = JSON.parse(videosMatch[1]);
      } catch (e) {
        return [];
      }
      const entradas = [];
      for (const [idiomaCode, lista] of Object.entries(videosJson)) {
        const idioma = IDIOMAS_AFLV[idiomaCode] || idiomaCode;
        for (const item of lista || []) {
          if (item && item.code) entradas.push({ url: item.code, idioma });
        }
      }
      if (!entradas.length) return [];
      const resueltos = [];
      yield Promise.all(entradas.map((_0) => __async(null, [_0], function* ({ url, idioma }) {
        try {
          if (!url.startsWith("http")) return;
          const especial = yield resolverUrlEspecialAFLV(url);
          if (!especial) return;
          let finalUrl = especial.url;
          let referer = ANIMEFLV_BASE + "/";
          if (!especial.esDirecto) {
            const r = yield resolveGenerico(especial.url);
            if (!r) return;
            finalUrl = r.url;
            referer = r.referer;
          }
          resueltos.push({
            name: "AnimeFLV",
            title: `${nombreDesdeHost(url)} \xB7 ${idioma}`,
            url: finalUrl,
            quality: "HD",
            headers: { "User-Agent": ANIMEFLV_UA, Referer: referer }
          });
        } catch (e) {
        }
      })));
      return resueltos;
    } catch (e) {
      console.log("[AnimeFLV] Error: " + e.message);
      return [];
    }
  });
}
module.exports = { getStreams };
