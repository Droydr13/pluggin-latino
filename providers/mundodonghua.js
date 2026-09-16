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
const MUNDODONGHUA_BASE = "https://www.mundodonghua.com";
const MUNDODONGHUA_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const TMDB_API_KEY_MD = "439c478a771f35c05022f9feabcca01c";
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
    const o = Object.assign({ headers: { "User-Agent": MUNDODONGHUA_UA } }, opts, { signal: timeoutSignal(opts && opts.timeoutMs || 15e3) });
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
function normalizarMD(s) {
  return (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
function getTmdbTitleMD(tmdbId, mediaType) {
  return __async(this, null, function* () {
    const type = mediaType === "movie" ? "movie" : "tv";
    const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_API_KEY_MD}&language=es-MX`;
    try {
      const res = yield fetch(url, { signal: timeoutSignal(1e4) });
      const data = yield res.json();
      return type === "movie" ? data.title || data.original_title : data.name || data.original_name;
    } catch (e) {
      return null;
    }
  });
}
function buscarMD(title) {
  return __async(this, null, function* () {
    const texto = title.replace(/ /g, "+");
    const html = yield fetchText(`${MUNDODONGHUA_BASE}/busquedas/${texto}`);
    return extraerListado(html);
  });
}
function extraerListado(html) {
  const resultados = [];
  const regex = /<div[^>]*class="[^"]*item col-lg-\d[^"]*"[\s\S]{0,300}?<a\s+href="([^"]+)"[\s\S]{0,300}?<h5[^>]*>([^<]+)<\/h5>/gi;
  let m;
  while ((m = regex.exec(html)) !== null) {
    resultados.push({ href: m[1], title: m[2].trim() });
  }
  return resultados;
}
function extraerEpisodios(html) {
  const episodios = [];
  const bloque = html.match(/<ul[^>]*class="[^"]*donghua-list[^"]*"[\s\S]*?<\/ul>/i);
  if (!bloque) return episodios;
  const regex = /<a\s+[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = regex.exec(bloque[0])) !== null) {
    const texto = m[2].replace(/<[^>]+>/g, "").trim();
    const epMatch = texto.match(/(\d+)\s*$/);
    if (!epMatch) continue;
    episodios.push({ href: m[1], episodio: parseInt(epMatch[1]) });
  }
  return episodios;
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
function getOrigin(url) {
  const m = url.match(/^([a-z]+:\/\/[^\/]+)/i);
  return m ? m[1] : url;
}
function unpackAllJS(html) {
  const bloques = [];
  const regex = /eval\(function\(p,a,c,k,e,d\)\{.*?\}\('.*?',\d+,\d+,'.*?'\.split\('\|'\)[\s\S]*?\)\)/g;
  let m;
  while ((m = regex.exec(html)) !== null) {
    const u = unpackJS(m[0]);
    if (u) bloques.push(u);
  }
  return bloques;
}
function resolverSlugMD(slug, referer) {
  return __async(this, null, function* () {
    const url = `${MUNDODONGHUA_BASE}/api_donghua.php?slug=${slug}`;
    try {
      const res = yield fetch(url, { headers: { Referer: referer, "User-Agent": MUNDODONGHUA_UA }, signal: timeoutSignal(15e3) });
      const json = yield res.json();
      const data = Array.isArray(json) ? json[0] : json;
      if (!data) return null;
      if (data.url) {
        const dmId = base64DecodeUtf8(data.url);
        return { url: `https://www.dailymotion.com/video/${dmId}`, esDailymotion: true };
      }
      if (data.source && data.source[0] && data.source[0].file) {
        let fileUrl = data.source[0].file;
        if (!fileUrl.startsWith("http")) fileUrl = "http:" + fileUrl;
        return { url: fileUrl, esDailymotion: false };
      }
      return null;
    } catch (e) {
      return null;
    }
  });
}
function resolverDailymotion(watchUrl) {
  return __async(this, null, function* () {
    try {
      const videoId = watchUrl.split("/").pop();
      const embedUrl = `https://www.dailymotion.com/embed/video/${videoId}`;
      const html = yield fetchText(embedUrl, { headers: { Referer: "https://www.dailymotion.com/", "User-Agent": MUNDODONGHUA_UA } });
      const m = html.match(/"qualities"\s*:\s*\{[^}]*"auto"\s*:\s*\[\s*\{\s*"type"\s*:\s*"[^"]*"\s*,\s*"url"\s*:\s*"([^"]+)"/) || html.match(/https?:\/\/[^"'\\]+\.m3u8[^"'\\]*/);
      if (!m) return null;
      const url = (m[1] || m[0]).replace(/\\\//g, "/");
      return { url, referer: "https://www.dailymotion.com/" };
    } catch (e) {
      return null;
    }
  });
}
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      const title = yield getTmdbTitleMD(tmdbId, mediaType);
      if (!title) return [];
      const tituloNorm = normalizarMD(title);
      const resultados = yield buscarMD(title);
      if (!resultados.length) return [];
      const match = resultados.find((r) => normalizarMD(r.title) === tituloNorm) || resultados[0];
      const targetHref = match.href.startsWith("http") ? match.href : MUNDODONGHUA_BASE + "/" + match.href.replace(/^\//, "");
      let episodeUrl = targetHref;
      if (mediaType !== "movie" && episode) {
        const epNum = parseInt(episode);
        const htmlShow = yield fetchText(targetHref);
        const episodios = extraerEpisodios(htmlShow);
        const epMatch = episodios.find((e) => e.episodio === epNum);
        if (!epMatch) return [];
        episodeUrl = epMatch.href.startsWith("http") ? epMatch.href : MUNDODONGHUA_BASE + "/" + epMatch.href.replace(/^\//, "");
      }
      const html = yield fetchText(episodeUrl);
      const bloquesDesempacados = unpackAllJS(html);
      if (!bloquesDesempacados.length) return [];
      const resueltos = [];
      if (bloquesDesempacados.length > 1) {
        for (const bloque of bloquesDesempacados) {
          const m = bloque.match(/file(?:"|:)"([^"]+)/);
          if (!m) continue;
          let url = m[1];
          if (!url.startsWith("http")) url = "http:" + url;
          resueltos.push({ name: "MundoDonghua", title: "VOSE \xB7 HD", url, quality: "HD", headers: { "User-Agent": MUNDODONGHUA_UA, Referer: getOrigin(episodeUrl) + "/" } });
        }
      } else {
        const unico = bloquesDesempacados[0];
        const slugs = [...unico.matchAll(/"slug":"([^"]+)"/g)].map((m) => m[1]);
        if (slugs.length) {
          yield Promise.all(slugs.map((slug) => __async(null, null, function* () {
            const resultado = yield resolverSlugMD(slug, episodeUrl);
            if (!resultado) return;
            if (resultado.esDailymotion) {
              const dm = yield resolverDailymotion(resultado.url);
              if (dm) resueltos.push({ name: "MundoDonghua", title: "VOSE \xB7 Dailymotion", url: dm.url, quality: "HD", headers: { "User-Agent": MUNDODONGHUA_UA, Referer: dm.referer } });
            } else {
              resueltos.push({ name: "MundoDonghua", title: "VOSE \xB7 HD", url: resultado.url, quality: "HD", headers: { "User-Agent": MUNDODONGHUA_UA, Referer: getOrigin(episodeUrl) + "/" } });
            }
          })));
        } else {
          const m = unico.match(/file(?:"|:)"([^"]+)/);
          if (m) {
            let url = m[1];
            if (!url.startsWith("http")) url = "http:" + url;
            resueltos.push({ name: "MundoDonghua", title: "VOSE \xB7 HD", url, quality: "HD", headers: { "User-Agent": MUNDODONGHUA_UA, Referer: getOrigin(episodeUrl) + "/" } });
          }
        }
      }
      return resueltos;
    } catch (e) {
      console.log("[MundoDonghua] Error: " + e.message);
      return [];
    }
  });
}
module.exports = { getStreams };
