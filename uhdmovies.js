if (typeof setTimeout === "undefined") {
  globalThis.setTimeout = function(fn, ms) {
    if (typeof fn === "function" && (Number(ms) || 0) < 5e3) Promise.resolve().then(fn);
    return 0;
  };
  globalThis.clearTimeout = function() {
  };
}
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
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
var import_cheerio_without_node_native2 = __toESM(require("cheerio-without-node-native"));
var DOMAINS_URL = "https://raw.githubusercontent.com/phisher98/TVVVV/refs/heads/main/domains.json";
var FALLBACK_DOMAIN = "https://uhdmovies.my";
var TMDB_API_KEY = "1865f43a0549ca50d341dd9ab8b29f49";
var TMDB_BASE_URL = "https://api.themoviedb.org/3";
var HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "Accept-Language": "en-US,en;q=0.9",
  "Cache-Control": "max-age=0",
  "Connection": "keep-alive",
  "Upgrade-Insecure-Requests": "1"
};
var import_cheerio_without_node_native = __toESM(require("cheerio-without-node-native"));
var cachedDomain = "";
function getMainUrl() {
  return __async(this, null, function* () {
    if (cachedDomain)
      return cachedDomain;
    try {
      const response = yield fetch(DOMAINS_URL, { headers: { "User-Agent": "Mozilla/5.0" } });
      const data = yield response.json();
      cachedDomain = String(data["UHDMovies"] || FALLBACK_DOMAIN).replace(/\/$/, "");
      return cachedDomain;
    } catch (e) {
      return FALLBACK_DOMAIN;
    }
  });
}
function getBaseUrl(url) {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.host}`;
  } catch (e) {
    return "";
  }
}
function fixUrl(url, domain) {
  if (!url)
    return "";
  if (url.startsWith("http"))
    return url;
  if (url.startsWith("//"))
    return `https:${url}`;
  if (url.startsWith("/"))
    return domain + url;
  return `${domain}/${url}`;
}
function bypassHrefli(url) {
  return __async(this, null, function* () {
    var _a, _b, _c, _d;
    const host = getBaseUrl(url);
    const cookies =   new Map();
    function absorbCookies(response) {
      var _a2, _b2;
      let setCookie = "";
      try {
        const allCookies = (_b2 = (_a2 = response.headers).getSetCookie) == null ? void 0 : _b2.call(_a2);
        if (Array.isArray(allCookies))
          setCookie = allCookies.join("\n");
      } catch (_) {
      }
      if (!setCookie)
        setCookie = response.headers.get("set-cookie") || "";
      for (const item of setCookie.split(/\n|,(?=[^;,]+=)/)) {
        const pair = item.split(";")[0].trim();
        const separator = pair.indexOf("=");
        if (separator <= 0)
          continue;
        const name = pair.slice(0, separator).trim();
        const value = pair.slice(separator + 1).trim();
        if (!value || value.toLowerCase() === "deleted")
          cookies.delete(name);
        else
          cookies.set(name, value);
      }
    }
    function cookieHeader(extra = {}) {
      const values = new Map(cookies);
      for (const [name, value] of Object.entries(extra)) {
        if (value)
          values.set(name, value);
      }
      return Array.from(values, ([name, value]) => `${name}=${value}`).join("; ");
    }
    function request(_0) {
      return __async(this, arguments, function* (requestUrl, options = {}) {
        const headers = __spreadValues(__spreadValues({}, HEADERS), options.headers || {});
        const cookie = cookieHeader();
        if (cookie)
          headers.Cookie = cookie;
        const response = yield fetch(requestUrl, __spreadProps(__spreadValues({}, options), { headers }));
        absorbCookies(response);
        return response;
      });
    }
    try {
      let currentUrl = url;
      let response = yield request(currentUrl);
      let html = yield response.text();
      let lastFormData = {};
      for (let step = 0; step < 5; step++) {
        const $2 = import_cheerio_without_node_native.default.load(html);
        const form = $2("form#landing").first();
        const action = form.attr("action");
        if (!action)
          break;
        const formData = {};
        form.find("input[name]").each((_, el) => {
          const name = $2(el).attr("name");
          if (name)
            formData[name] = $2(el).attr("value") || "";
        });
        if (Object.keys(formData).length === 0)
          break;
        lastFormData = formData;
        currentUrl = new URL(action, currentUrl).toString();
        response = yield request(currentUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Referer": response.url || currentUrl
          },
          body: new URLSearchParams(formData).toString()
        });
        html = yield response.text();
        if (!import_cheerio_without_node_native.default.load(html)("form#landing").length)
          break;
      }
      const $ = import_cheerio_without_node_native.default.load(html);
      let redirectUrl = $("meta[http-equiv='refresh']").attr("content") || "";
      redirectUrl = ((_a = redirectUrl.match(/url\s*=\s*['\"]?([^'\";]+)/i)) == null ? void 0 : _a[1]) || "";
      if (!redirectUrl) {
        const goMatch = html.match(/[?&]go=([^"'&\s]+)/i);
        if (goMatch) {
          const skToken = decodeURIComponent(goMatch[1]);
          const wpHttp2 = lastFormData._wp_http2 || "";
          if (wpHttp2)
            cookies.set(skToken, wpHttp2);
          response = yield request(`${host}?go=${encodeURIComponent(skToken)}`);
          html = yield response.text();
          const $go = import_cheerio_without_node_native.default.load(html);
          redirectUrl = $go("meta[http-equiv='refresh']").attr("content") || "";
          redirectUrl = ((_b = redirectUrl.match(/url\s*=\s*['\"]?([^'\";]+)/i)) == null ? void 0 : _b[1]) || "";
        }
      }
      if (!redirectUrl) {
        redirectUrl = ((_c = html.match(/(?:location(?:\.href)?\s*=|replace\()\s*['\"]([^'\"]+)['\"]/i)) == null ? void 0 : _c[1]) || "";
      }
      if (!redirectUrl)
        return null;
      const driveUrl = new URL(redirectUrl.trim(), response.url || currentUrl).toString();
      const driveRes = yield request(driveUrl);
      const driveHtml = yield driveRes.text();
      const path = (_d = driveHtml.match(/replace\(\s*['\"]([^'\"]+)['\"]\s*\)/i)) == null ? void 0 : _d[1];
      if (!path || path === "/404")
        return null;
      return new URL(path, driveRes.url || driveUrl).toString();
    } catch (e) {
      console.log("[UHDMovies] Hrefli bypass failed:", e.message);
      return null;
    }
  });
}
function fetchTmdbDetails(tmdbId, mediaType) {
  return __async(this, null, function* () {
    var _a;
    try {
      const url = `${TMDB_BASE_URL}/${mediaType}/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=external_ids`;
      const res = yield fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json"
        }
      });
      if (!res.ok)
        return null;
      const data = yield res.json();
      return {
        title: mediaType === "movie" ? data.title || data.original_title : data.name || data.original_name,
        originalTitle: mediaType === "movie" ? data.original_title : data.original_name,
        year: (data.release_date || data.first_air_date || "").substring(0, 4),
        imdbId: (_a = data.external_ids) == null ? void 0 : _a.imdb_id
      };
    } catch (e) {
      return null;
    }
  });
}
function getIndexQuality(str) {
  if (!str)
    return "Unknown";
  const match = str.match(/(\d{3,4})[pP]/);
  if (match)
    return match[1] + "p";
  if (str.toUpperCase().includes("4K") || str.toUpperCase().includes("UHD"))
    return "2160p";
  return "Unknown";
}
function extractVideoSeed(finallink) {
  return __async(this, null, function* () {
    try {
      const urlObj = new URL(finallink);
      const host = urlObj.host || "video-seed.xyz";
      const token = finallink.split("?url=")[1];
      if (!token)
        return null;
      const res = yield fetch(`https://${host}/api`, {
        method: "POST",
        headers: __spreadProps(__spreadValues({}, HEADERS), {
          "Content-Type": "application/x-www-form-urlencoded",
          "x-token": host,
          "Referer": finallink
        }),
        body: `keys=${encodeURIComponent(token)}`
      });
      const text = yield res.text();
      const urlMatch = text.match(/url":"([^"]+)"/);
      return urlMatch ? urlMatch[1].replace(/\\\//g, "/") : null;
    } catch (e) {
      return null;
    }
  });
}
function extractDriveseedPage(url) {
  return __async(this, null, function* () {
    const streams = [];
    try {
      let pageUrl = url;
      if (url.includes("r?key=")) {
        const res2 = yield fetch(url, { headers: HEADERS });
        const html2 = yield res2.text();
        const redirectMatch = html2.match(/replace\("([^"]+)"\)/);
        if (redirectMatch) {
          pageUrl = fixUrl(redirectMatch[1], getBaseUrl(url));
        }
      }
      const res = yield fetch(pageUrl, { headers: HEADERS });
      const html = yield res.text();
      const $ = import_cheerio_without_node_native.default.load(html);
      const baseDomain = getBaseUrl(pageUrl);
      const qualityText = $("li.list-group-item").first().text() || "";
      const size = $("li:nth-child(3)").text().replace("Size : ", "").trim();
      const quality = getIndexQuality(qualityText);
      const elements = $("div.text-center > a").get();
      for (const el of elements) {
        const text = $(el).text().toLowerCase();
        const href = $(el).attr("href");
        if (!href)
          continue;
        if (text.includes("instant download")) {
          const instantRes = yield fetch(fixUrl(href, baseDomain), { headers: HEADERS, redirect: "follow" });
          if (instantRes.url && instantRes.url.includes("url=")) {
            streams.push({ name: "Driveseed Instant", url: instantRes.url.split("url=")[1], quality, size });
          }
        } else if (text.includes("resume cloud")) {
          const cloudRes = yield fetch(fixUrl(href, baseDomain), { headers: HEADERS });
          const cloudHtml = yield cloudRes.text();
          const link = import_cheerio_without_node_native.default.load(cloudHtml)("a.btn-success").first().attr("href");
          if (link)
            streams.push({ name: "Driveseed Cloud", url: link, quality, size });
        } else if (text.includes("cloud download")) {
          streams.push({ name: "Driveseed Cloud", url: fixUrl(href, baseDomain), quality, size });
        }
      }
    } catch (e) {
    }
    return streams;
  });
}
function normalizeTitle(value) {
  return String(value || "").toLowerCase().replace(/\[[^\]]*\]|\([^)]*\)/g, " ").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}
function getStreams(tmdbId, mediaType, seasonNum = 1, episodeNum = 1) {
  return __async(this, null, function* () {
    console.log(`[UHDMovies] Querying streams for TMDB: ${tmdbId}, Type: ${mediaType}`);
    const details = yield fetchTmdbDetails(tmdbId, mediaType);
    if (!details)
      return [];
    const mainUrl = yield getMainUrl();
    try {
      let targetUrl = "";
      const searchTitles = [...new Set([details.title, details.originalTitle].filter(Boolean))];
      for (const query of searchTitles) {
        const searchUrl = `${mainUrl}/?s=${encodeURIComponent(query)}`;
        const searchRes = yield fetch(searchUrl, { headers: __spreadProps(__spreadValues({}, HEADERS), { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }) });
        if (!searchRes.ok)
          continue;
        const $search = import_cheerio_without_node_native2.default.load(yield searchRes.text());
        const normalizedSearchTitle = normalizeTitle(query);
        $search("article.gridlove-post, article.latestPost").each((i, el) => {
          const title = $search(el).find("h1.sanket, h2.title a").text() || $search(el).find("a").attr("title") || "";
          const href = $search(el).find("div.entry-image > a, h2.title a, a").first().attr("href");
          const normalizedResultTitle = normalizeTitle(title);
          const titleMatches = normalizedResultTitle && normalizedSearchTitle && (normalizedResultTitle === normalizedSearchTitle || normalizedResultTitle.includes(normalizedSearchTitle) || normalizedSearchTitle.includes(normalizedResultTitle));
          const imdbMatches = details.imdbId && title.includes(details.imdbId);
          if (href && (titleMatches || imdbMatches)) {
            targetUrl = href;
            return false;
          }
        });
        if (targetUrl)
          break;
      }
      if (!targetUrl) {
        console.log("[UHDMovies] No search result found");
        return [];
      }
      const pageRes = yield fetch(targetUrl, { headers: __spreadProps(__spreadValues({}, HEADERS), { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }) });
      const pageHtml = yield pageRes.text();
      const $ = import_cheerio_without_node_native2.default.load(pageHtml);
      const allStreams = [];
      if (mediaType === "movie") {
        const iframeRegex = /\[.*\]/;
        $("div.entry-content > p, div.entry-content > div").each((i, el) => {
          const text = $(el).text();
          if (iframeRegex.test(text)) {
            const quality = getIndexQuality(text);
            const nextHref = $(el).next().find("a.maxbutton-1, a.maxbutton").attr("href") || $(el).find("a.maxbutton-1, a.maxbutton").attr("href");
            if (nextHref) {
              allStreams.push({ url: nextHref, quality });
            }
          }
        });
      } else {
        const episodesMap = {};
        let currentSeason = seasonNum;
        $("pre, p, a, h3").each((i, el) => {
          const text = $(el).text().trim();
          const seasonMatch = text.match(/(?:season\s*|S)(\d+)/i);
          if (seasonMatch && text.length < 20) {
            currentSeason = parseInt(seasonMatch[1]);
          }
          if (($(el).is("a") || $(el).find("a").length > 0) && text.toLowerCase().includes("episode")) {
            if (text.toLowerCase().includes("zip"))
              return;
            const epMatch = text.match(/Episode\s*(\d+)/i);
            if (epMatch) {
              const realEp = parseInt(epMatch[1]);
              const epUrl = $(el).is("a") ? $(el).attr("href") : $(el).find("a").attr("href");
              if (epUrl) {
                const key = `${currentSeason}-${realEp}`;
                if (!episodesMap[key])
                  episodesMap[key] = [];
                episodesMap[key].push(epUrl);
              }
            }
          }
        });
        const targetKey = `${seasonNum}-${episodeNum}`;
        const urls = episodesMap[targetKey] || [];
        urls.forEach((url) => {
          allStreams.push({ url, quality: "Unknown" });
        });
      }
      const finalResults = [];
      for (const item of allStreams) {
        let finalLink = item.url;
        if (finalLink.includes("unblockedgames")) {
          finalLink = yield bypassHrefli(finalLink);
        }
        if (finalLink) {
          if (finalLink.includes("driveseed") || finalLink.includes("driveleech")) {
            const streams = yield extractDriveseedPage(finalLink);
            finalResults.push(...streams.map((s) => __spreadProps(__spreadValues({}, s), {
              name: "UHDMovies [Driveseed]",
              title: `UHDMovies - ${s.quality} ${s.size ? `[${s.size}]` : ""}`,
              quality: s.quality || item.quality,
              provider: "uhdmovies"
            })));
          } else if (finalLink.includes("video-seed")) {
            const streamUrl = yield extractVideoSeed(finalLink);
            if (streamUrl) {
              finalResults.push({
                name: "UHDMovies [VideoSeed]",
                title: `UHDMovies - ${item.quality}`,
                url: streamUrl,
                quality: item.quality,
                provider: "uhdmovies"
              });
            }
          } else {
            finalResults.push({
              name: "UHDMovies",
              title: `UHDMovies - ${item.quality}`,
              url: finalLink,
              quality: item.quality,
              provider: "uhdmovies"
            });
          }
        }
      }
      return finalResults;
    } catch (e) {
      console.error("[UHDMovies] Error:", e.message);
      return [];
    }
  });
}
module.exports = { getStreams };
;
(function() {
  async function adaptar(s, contexto) {
    const headers = cabecerasDe(s);
    const texto = [s.name, s.title, s.description, s.language, s.fileName, s.filename].filter(Boolean).join(" ");
    let audio = idiomaDe(texto);
    if (!audio) audio = textoAudios(await audiosHls(s.url, headers));
    if (!audio) audio = await idiomaOriginal(contexto);
    if (!audio) return null;
    const nombre = limpiar(s.name);
    return tarjeta({ fuente: "UHDMovies", servidor: ((n) => (n.match(/\[([^\]]+)\]/) || [])[1] || "")(nombre), calidad: calidadDe(s.quality || nombre), tamano: tamanoDe(String(s.size || "") + " " + String(s.title || "")), audio, url: s.url, headers, subtitles: s.subtitles, titulo: String(s.title || "").split("\n")[0] });
  }
  const original = module.exports && module.exports.getStreams;
  if (typeof original !== "function") return;
  const TELE = typeof __plugin_sleep !== "function" && typeof __cheerio_load === "function";
  const ESPANOL = /(^|[^a-z])(latino|latin|latam|spanish|espa[nñ]ol|castellano|castilian|spa|esp|es-419|es-mx|es-la|es-es|es_419|es_es)([^a-z]|$)/i;
  const CASTELLANO = /castellano|castilian|es-es|es_es|spain|espa[nñ]a|\bcast\b/i;
  function limpiar(t) {
    return String(t || "").replace(/[\u200b\ufeff]/g, "").trim();
  }
  function idiomaDe(texto) {
    const t = limpiar(texto);
    if (!t || !ESPANOL.test(t)) return "";
    return CASTELLANO.test(t) ? "Castellano" : "Latino";
  }
  function calidadDe(texto) {
    const t = limpiar(texto);
    if (/2160|\b4k\b/i.test(t)) return "4K";
    const m = t.match(/(\d{3,4})\s*p?/i);
    if (m && Number(m[1]) >= 240 && Number(m[1]) <= 4320) return `${m[1]}p`;
    if (/\bhd\b/i.test(t)) return "HD";
    return "Auto";
  }
  function cabecerasDe(s) {
    if (s && s.headers && Object.keys(s.headers).length) return s.headers;
    const h = s && s.behaviorHints && s.behaviorHints.proxyHeaders && s.behaviorHints.proxyHeaders.request;
    return h && Object.keys(h).length ? h : null;
  }
  function tarjeta(d) {
    const nombre = d.servidor ? `${d.fuente} (${d.servidor})` : d.fuente;
    const s = { name: nombre, title: limpiar(d.titulo) || nombre, url: d.url, quality: `Calidad: ${d.calidad || "Auto"}`, provider: d.fuente };
    if (d.tamano) s.size = `Tama\xF1o: ${d.tamano}`;
    if (d.audio) s.language = `Audio: ${d.audio}`;
    if (TELE) {
      s.size = [s.quality, s.size].filter(Boolean).join(" \u2022 ");
      s.quality = s.name;
    }
    if (d.headers && Object.keys(d.headers).length) s.headers = d.headers;
    if (d.subtitles && d.subtitles.length) s.subtitles = d.subtitles;
    if (d.infoHash) s.infoHash = d.infoHash;
    return s;
  }
  function nombreAudio(atributos) {
    const idioma = (atributos.match(/LANGUAGE="([^"]*)"/i) || [])[1] || "";
    const nombre = (atributos.match(/NAME="([^"]*)"/i) || [])[1] || "";
    if (/^(es|spa)$/i.test(idioma)) return CASTELLANO.test(nombre) ? "Castellano" : "Latino";
    return idiomaDe(`${idioma} ${nombre}`);
  }
  async function audiosHls(url, headers) {
    if (!/\.m3u8|\/hls|master|playlist/i.test(String(url || ""))) return [];
    try {
      const r = await fetch(url, { headers: headers || {} });
      if (!r || !r.ok) return [];
      const texto = await r.text();
      const lista = [];
      for (const linea of String(texto || "").split(/\r?\n/)) {
        if (!/^#EXT-X-MEDIA:/i.test(linea) || !/TYPE=AUDIO/i.test(linea)) continue;
        const idioma = nombreAudio(linea);
        if (idioma && !lista.includes(idioma)) lista.push(idioma);
      }
      return lista;
    } catch (e) {
      return [];
    }
  }
  const originales = {};
  async function idiomaOriginal(contexto) {
    const id = String(contexto && contexto.tmdbId || "").replace(/\D/g, "");
    if (!id) return "";
    const tipo = contexto.tipo === "tv" || contexto.tipo === "series" ? "tv" : "movie";
    const clave = `${tipo}/${id}`;
    if (!(clave in originales)) {
      originales[clave] = (async () => {
        try {
          const r = await fetch(`https://api.themoviedb.org/3/${clave}?api_key=439c478a771f35c05022f9feabcca01c`);
          const d = r && r.ok ? await r.json() : null;
          const codigo = String(d && d.original_language || "").toLowerCase();
          const paises = [].concat(d && d.origin_country || [], (d && d.production_countries || []).map((x) => x.iso_3166_1));
          if (codigo === "es") return paises.length && paises.every((p) => p === "ES") ? "Castellano" : "Latino";
          return "";
        } catch (e) {
          return "";
        }
      })();
    }
    return originales[clave];
  }
  function textoAudios(lista) {
    return lista.join(", ");
  }
  function tamanoDe(texto) {
    const m = limpiar(texto).match(/(\d+(?:[.,]\d+)?)\s*(GB|MB|GiB|MiB)/i);
    return m ? `${m[1].replace(",", ".")} ${m[2].toUpperCase().replace("I", "")}` : "";
  }
  function lineaCon(texto, simbolo) {
    return String(texto || "").split("\n").find((l) => l.includes(simbolo)) || "";
  }
  module.exports.getStreams = async function() {
    const contexto = { tmdbId: arguments[0], tipo: arguments[1] };
    let lista = [];
    try {
      lista = await original.apply(this, arguments) || [];
    } catch (e) {
      lista = [];
    }
    const salida = [];
    const vistos =   new Set();
    for (const s of Array.isArray(lista) ? lista : []) {
      if (!s || !s.url) continue;
      let t = null;
      try {
        t = await adaptar(s, contexto);
      } catch (e) {
        t = null;
      }
      if (t && !vistos.has(t.url + t.name + (t.language || ""))) {
        vistos.add(t.url + t.name + (t.language || ""));
        salida.push(t);
      }
    }
    return salida;
  };
})();
