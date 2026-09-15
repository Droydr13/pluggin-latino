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
const CryptoJS = require("crypto-js");
const EPYS_BASE = "https://entrepeliculasyseries.nz";
const EPYS_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const TMDB_API_KEY_EPYS = "439c478a771f35c05022f9feabcca01c";
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
    const o = Object.assign({ headers: { "User-Agent": EPYS_UA } }, opts, { signal: timeoutSignal(opts && opts.timeoutMs || 15e3) });
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
function normalizarEPYS(s) {
  return (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
function getTmdbTitleEPYS(tmdbId, mediaType) {
  return __async(this, null, function* () {
    const type = mediaType === "movie" ? "movie" : "tv";
    const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_API_KEY_EPYS}&language=es-MX`;
    try {
      const res = yield fetch(url, { signal: timeoutSignal(1e4) });
      const data = yield res.json();
      return type === "movie" ? data.title || data.original_title : data.name || data.original_name;
    } catch (e) {
      return null;
    }
  });
}
function fixHostsLinksEPYS(url) {
  return url.replace("https://hglink.to", "https://streamwish.to").replace("https://swdyu.com", "https://streamwish.to").replace("https://cybervynx.com", "https://streamwish.to").replace("https://dumbalag.com", "https://streamwish.to").replace("https://mivalyo.com", "https://vidhidepro.com").replace("https://dinisglows.com", "https://vidhidepro.com").replace("https://dhtpre.com", "https://vidhidepro.com").replace("https://filemoon.link", "https://filemoon.sx").replace("https://sblona.com", "https://watchsb.com").replace("https://lulu.st", "https://lulustream.com").replace("https://uqload.io", "https://uqload.com").replace("https://do7go.com", "https://dood.la");
}
function pkcs7KeyFix(keyWA) {
  if ([16, 24, 32].includes(keyWA.sigBytes)) return keyWA;
  const targetWords = 8;
  const newWords = keyWA.words.slice(0, targetWords);
  while (newWords.length < targetWords) newWords.push(0);
  return CryptoJS.lib.WordArray.create(newWords, 32);
}
function crylink(b64Link, key) {
  try {
    const encryptedFull = CryptoJS.enc.Base64.parse(b64Link);
    const keyWA = pkcs7KeyFix(CryptoJS.enc.Utf8.parse(key));
    const ivWords = encryptedFull.words.slice(0, 4);
    const ivWA = CryptoJS.lib.WordArray.create(ivWords, 16);
    const cipherWords = encryptedFull.words.slice(4);
    const cipherWA = CryptoJS.lib.WordArray.create(cipherWords, encryptedFull.sigBytes - 16);
    const decrypted = CryptoJS.AES.decrypt({ ciphertext: cipherWA }, keyWA, { iv: ivWA, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    const texto = decrypted.toString(CryptoJS.enc.Utf8);
    return texto || null;
  } catch (e) {
    return null;
  }
}
function resolverEmbed69(embedUrl) {
  return __async(this, null, function* () {
    const html = yield fetchText(embedUrl, { headers: { Referer: EPYS_BASE, "User-Agent": EPYS_UA } });
    const claveMatch = html.match(/decryptLink\(server\.link,\s*'(.+?)'\),/);
    if (!claveMatch) return [];
    const clave = claveMatch[1];
    const dataLinkMatch = html.match(/dataLink\s*=\s*([^;]+)/);
    if (!dataLinkMatch) return [];
    let dataLinkStr = dataLinkMatch[1].replace(/\\\//g, "/");
    let dataLink;
    try {
      dataLink = Function('"use strict"; return (' + dataLinkStr + ")")();
    } catch (e) {
      return [];
    }
    const resultados = [];
    for (const langSection of dataLink) {
      const idioma = { "0": "Latino", "1": "Castellano", "2": "Subtitulado" }[langSection.video_language] || langSection.video_language || "Latino";
      for (const embed of langSection.sortedEmbeds || []) {
        if (embed.servername === "download") continue;
        const urlReal = crylink(embed.link, clave);
        if (urlReal) resultados.push({ url: urlReal, idioma });
      }
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
      const html = yield fetchText(embedUrl, { headers: { Referer: EPYS_BASE, "User-Agent": EPYS_UA } });
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
function buscarEpys(title, isMovie) {
  return __async(this, null, function* () {
    const html = yield fetchText(`${EPYS_BASE}/${isMovie ? "peliculas" : "series"}/?page=1&s=${encodeURIComponent(title)}`);
    const tituloNorm = normalizarEPYS(title);
    const regex = /<article[^>]*class="[^"]*post[^"]*"[\s\S]*?href="([^"]+)"[\s\S]*?<h[23][^>]*>([^<]+)<\/h[23]>/gi;
    let best = null, bestExact = null, m;
    while ((m = regex.exec(html)) !== null) {
      const href = m[1], texto = m[2].trim();
      if (!best) best = href;
      if (normalizarEPYS(texto) === tituloNorm) {
        bestExact = href;
        break;
      }
    }
    return bestExact || best;
  });
}
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      const title = yield getTmdbTitleEPYS(tmdbId, mediaType);
      if (!title) return [];
      const isMovie = mediaType === "movie";
      const targetHref = yield buscarEpys(title, isMovie);
      if (!targetHref) return [];
      const targetUrl = targetHref.startsWith("http") ? targetHref : EPYS_BASE + "/" + targetHref.replace(/^\//, "");
      let episodePageUrl = targetUrl;
      if (!isMovie) {
        if (!season || !episode) return [];
        const seasonNum = parseInt(season);
        const html2 = yield fetchText(targetUrl);
        const seasonId = `season-${seasonNum - 1}`;
        const seasonBlockMatch = html2.match(new RegExp(`id="${seasonId}"[\\s\\S]*?(?=id="season-\\d+"|$)`));
        const zona = seasonBlockMatch ? seasonBlockMatch[0] : html2;
        const epRegex = /<a\s+[^>]*href="([^"]+)"[^>]*>[\s\S]{0,200}?<div[^>]*>([^<]*)<\/div>/gi;
        let epMatch, targetEpHref = null;
        while ((epMatch = epRegex.exec(zona)) !== null) {
          const numTexto = epMatch[2].trim().split(" ").pop();
          if (parseInt(numTexto) === parseInt(episode)) {
            targetEpHref = epMatch[1];
            break;
          }
        }
        if (!targetEpHref) return [];
        episodePageUrl = targetEpHref.startsWith("http") ? targetEpHref : EPYS_BASE + "/" + targetEpHref.replace(/^\//, "");
      }
      const html = yield fetchText(episodePageUrl);
      const iframeRegex = /<div[^>]*class="[^"]*player-frame[^"]*"[\s\S]{0,300}?<iframe[^>]+src="([^"]+)"/gi;
      const embeds = [];
      let m;
      while ((m = iframeRegex.exec(html)) !== null) embeds.push(m[1]);
      if (!embeds.length) return [];
      const resueltos = [];
      yield Promise.all(embeds.map((rawUrl) => __async(null, null, function* () {
        try {
          let embedUrl = rawUrl.startsWith("http") ? rawUrl : EPYS_BASE + rawUrl;
          if (embedUrl.includes("/uqlink.")) {
            const idMatch = embedUrl.match(/id=([A-Za-z0-9]+)/);
            if (idMatch) {
              const r2 = yield resolveGenerico(`https://uqload.com/embed-${idMatch[1]}.html`);
              if (r2) resueltos.push({ name: "EntrePeliculasYSeries", title: `Latino \xB7 ${r2.url.includes(".m3u8") ? "HD" : "HD"}`, url: r2.url, quality: "HD", headers: { "User-Agent": EPYS_UA, Referer: r2.referer } });
            }
            return;
          }
          if (embedUrl.includes("waaw")) {
            const r2 = yield resolveGenerico(embedUrl);
            if (r2) resueltos.push({ name: "EntrePeliculasYSeries", title: "Latino \xB7 HD", url: r2.url, quality: "HD", headers: { "User-Agent": EPYS_UA, Referer: r2.referer } });
            return;
          }
          if (embedUrl.includes("embed69") || embedUrl.includes("vidurl")) {
            const items = yield resolverEmbed69(embedUrl);
            yield Promise.all(items.map((item) => __async(null, null, function* () {
              try {
                const fixedUrl = fixHostsLinksEPYS(item.url);
                const r2 = yield resolveGenerico(fixedUrl);
                const finalUrl = r2 ? r2.url : fixedUrl;
                resueltos.push({
                  name: "EntrePeliculasYSeries",
                  title: `${item.idioma} \xB7 HD`,
                  url: finalUrl,
                  quality: "HD",
                  headers: { "User-Agent": EPYS_UA, Referer: r2 ? r2.referer : getOrigin(fixedUrl) + "/" }
                });
              } catch (e) {
              }
            })));
            return;
          }
          const r = yield resolveGenerico(fixHostsLinksEPYS(embedUrl));
          if (r) resueltos.push({ name: "EntrePeliculasYSeries", title: "Latino \xB7 HD", url: r.url, quality: "HD", headers: { "User-Agent": EPYS_UA, Referer: r.referer } });
        } catch (e) {
        }
      })));
      return resueltos;
    } catch (e) {
      console.log("[Entrepeliculasyseries] Error: " + e.message);
      return [];
    }
  });
}
module.exports = { getStreams };
