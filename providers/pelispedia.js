function __makeUrlLike(urlStr) {
  var originMatch = urlStr.match(/^([a-z]+:\/\/[^\/]+)/i);
  var origin = originMatch ? originMatch[1] : urlStr;
  var hostnameMatch = urlStr.match(/^[a-z]+:\/\/([^\/:?#]+)/i);
  var hostname = hostnameMatch ? hostnameMatch[1] : "";
  return { origin: origin, hostname: hostname };
}

const CryptoJS = require("crypto-js");

const TMDB_API_KEY_PP = "439c478a771f35c05022f9feabcca01c";
const PP_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function timeoutSignalPP(ms) {
  try {
    if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") return AbortSignal.timeout(ms);
  } catch (e) {}
  return undefined;
}

async function fetchTextPP(url, referer) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": PP_UA, Referer: referer || "https://pelispedia.mov/" }, signal: timeoutSignalPP(15000) });
    return await res.text();
  } catch (e) {
    return "";
  }
}

function normalizeTitlePP(t) {
  if (!t) return "";
  return t.toLowerCase()
    .replace(/[\u00e1\u00e0\u00e4\u00e2]/g, "a")
    .replace(/[\u00e9\u00e8\u00eb\u00ea]/g, "e")
    .replace(/[\u00ed\u00ec\u00ef\u00ee]/g, "i")
    .replace(/[\u00f3\u00f2\u00f6\u00f4]/g, "o")
    .replace(/[\u00fa\u00f9\u00fc\u00fb]/g, "u")
    .replace(/\u00f1/g, "n")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeBase64PP(input) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  let str = String(input).replace(/=+$/, "");
  let output = "";
  for (let bc = 0, bs, buffer, idx = 0; buffer = str.charAt(idx++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
    buffer = chars.indexOf(buffer);
  }
  return output;
}

async function resolveVOE_PP(url) {
  try {
    let html = await fetchTextPP(url, url);
    if (html.includes("Redirecting") || html.length < 1500) {
      const rm = html.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/i);
      if (rm) html = await fetchTextPP(rm[1], url);
    }
    const jsonMatch = html.match(/<script type="application\/json">([\s\S]*?)<\/script>/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1].trim());
        let encText = Array.isArray(parsed) ? parsed[0] : parsed;
        if (typeof encText !== "string") return null;
        let rot13 = encText.replace(/[a-zA-Z]/g, (c) => String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26));
        const noise = ["@$", "^^", "~@", "%?", "*~", "!!", "#&"];
        for (const n of noise) rot13 = rot13.split(n).join("");
        let b64_1 = decodeBase64PP(rot13);
        let shifted = "";
        for (let i = 0; i < b64_1.length; i++) shifted += String.fromCharCode(b64_1.charCodeAt(i) - 3);
        let reversed = shifted.split("").reverse().join("");
        let data = JSON.parse(decodeBase64PP(reversed));
        if (data && data.source) return { url: data.source, quality: "1080p", headers: { "User-Agent": PP_UA, Referer: url } };
      } catch (ex) {}
    }
    const m3u8Match = html.match(/["'](https?:\/\/[^"']+?\.m3u8[^"']*?)["']/i);
    if (m3u8Match) return { url: m3u8Match[1], quality: "1080p", headers: { "User-Agent": PP_UA, Referer: url } };
    return null;
  } catch (e) {
    return null;
  }
}

function decryptGCM_PP(key, iv, ciphertextWithTag) {
  try {
    const tagSize = 16;
    const ciphertext = ciphertextWithTag.slice(0, -tagSize);
    const keyWA = CryptoJS.lib.WordArray.create(key);
    const ivCounter = new Uint8Array(16);
    ivCounter.set(iv, 0);
    ivCounter[15] = 2;
    const ivWA = CryptoJS.lib.WordArray.create(ivCounter);
    const decrypted = CryptoJS.AES.decrypt({ ciphertext: CryptoJS.lib.WordArray.create(ciphertext) }, keyWA, { iv: ivWA, mode: CryptoJS.mode.CTR, padding: CryptoJS.pad.NoPadding });
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    return null;
  }
}

function base64UrlDecodePP(input) {
  let s = input.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  return new Uint8Array(bin.split("").map((c) => c.charCodeAt(0)));
}

async function decryptBysePP(playback) {
  try {
    const keyArr = [];
    for (const p of playback.key_parts) base64UrlDecodePP(p).forEach((b) => keyArr.push(b));
    const key = new Uint8Array(keyArr);
    const iv = base64UrlDecodePP(playback.iv);
    const ciphertextWithTag = base64UrlDecodePP(playback.payload);
    if (typeof crypto !== "undefined" && crypto.subtle) {
      try {
        const cryptoKey = await crypto.subtle.importKey("raw", key, "AES-GCM", false, ["decrypt"]);
        const decryptedArr = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, cryptoKey, ciphertextWithTag);
        return JSON.parse(new TextDecoder().decode(decryptedArr));
      } catch (e) {}
    }
    const decryptedStr = decryptGCM_PP(key, iv, ciphertextWithTag);
    return decryptedStr ? JSON.parse(decryptedStr) : null;
  } catch (e) {
    return null;
  }
}

async function resolveFilemoon_PP(url) {
  try {
    const origin = __makeUrlLike(url).origin;
    const idMatch = url.match(/\/e\/([a-zA-Z0-9]+)/);
    if (!idMatch) return null;
    const id = idMatch[1];
    try {
      const apiRes = await fetch(`https://${__makeUrlLike(url).hostname}/api/videos/${id}`, { headers: { "User-Agent": PP_UA, Referer: url }, signal: timeoutSignalPP(15000) });
      const data = await apiRes.json();
      if (data.playback) {
        const decrypted = await decryptBysePP(data.playback);
        if (decrypted && decrypted.sources) {
          const best = decrypted.sources[0];
          return { url: best.url, quality: best.height ? `${best.height}p` : "1080p", headers: { "User-Agent": PP_UA, Referer: origin + "/", Origin: origin } };
        }
      }
    } catch (e) {}
    const html = await fetchTextPP(url, url);
    const fm = html.match(/file\s*:\s*["']([^"']+\.m3u8[^"']*)["']/);
    if (fm) return { url: fm[1], quality: "1080p", headers: { "User-Agent": PP_UA, Referer: origin + "/", Origin: origin } };
    return null;
  } catch (e) {
    return null;
  }
}

function unpackPP(p, a, c, k) {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const decode = (r) => {
    let res = 0;
    for (let l = 0; l < r.length; l++) {
      let s = chars.indexOf(r[l]);
      if (s === -1) return NaN;
      res = res * a + s;
    }
    return res;
  };
  return p.replace(/\b([0-9a-zA-Z]+)\b/g, (match) => {
    let val = decode(match);
    return isNaN(val) || val >= k.length ? match : k[val] || match;
  });
}

const DOMAIN_MAP_PP = { "hglink.to": "vibuxer.com" };

async function resolveHLSWish_PP(url) {
  try {
    let targetUrl = url;
    for (const [old, replacement] of Object.entries(DOMAIN_MAP_PP)) {
      if (targetUrl.includes(old)) { targetUrl = targetUrl.replace(old, replacement); break; }
    }
    const origin = __makeUrlLike(targetUrl).origin;
    const html = await fetchTextPP(targetUrl, origin + "/");
    let finalUrl = null;
    const fileMatch = html.match(/file\s*:\s*["']([^"']+)["']/i);
    if (fileMatch) {
      finalUrl = fileMatch[1];
      if (finalUrl.startsWith("/")) finalUrl = origin + finalUrl;
    }
    if (!finalUrl) {
      const packedMatch = html.match(/eval\(function\(p,a,c,k,e,[a-z]\)\{[\s\S]*?\}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/);
      if (packedMatch) {
        const unpacked = unpackPP(packedMatch[1], parseInt(packedMatch[2]), parseInt(packedMatch[3]), packedMatch[4].split("|"));
        const m3u8Match = unpacked.match(/["']([^"']{30,}\.m3u8[^"']*)['"]/i);
        if (m3u8Match) {
          finalUrl = m3u8Match[1];
          if (finalUrl.startsWith("/")) finalUrl = origin + finalUrl;
        }
      }
    }
    if (finalUrl) return { url: finalUrl, quality: "1080p", headers: { "User-Agent": PP_UA, Referer: origin + "/" } };
    return null;
  } catch (e) {
    return null;
  }
}

function unpackVidHidePP(script) {
  try {
    const match = script.match(/eval\(function\(p,a,c,k,e,[rd]\)\{.*?\}\s*\('([\s\S]*?)',\s*(\d+),\s*(\d+),\s*'([\s\S]*?)'\.split\('\|'\)/);
    if (!match) return null;
    let [, p, a, , k] = match;
    a = parseInt(a);
    const kArr = k.split("|");
    const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
    const decode = (l, s) => {
      let res = "";
      for (; l > 0;) { res = chars[l % s] + res; l = Math.floor(l / s); }
      return res || "0";
    };
    return p.replace(/\b\w+\b/g, (l) => {
      const s = parseInt(l, 36);
      return s < kArr.length && kArr[s] ? kArr[s] : decode(s, a);
    });
  } catch (e) {
    return null;
  }
}

async function resolveVidHide_PP(url) {
  try {
    const origin = __makeUrlLike(url).origin;
    const html = await fetchTextPP(url, origin + "/");
    const packedMatch = html.match(/eval\(function\(p,a,c,k,e,[rd]\)[\s\S]*?\.split\('\|'\)[^\)]*\)\)/);
    if (!packedMatch) return null;
    const unpacked = unpackVidHidePP(packedMatch[0]);
    if (!unpacked) return null;
    const hlsMatch = unpacked.match(/"hls[24]"\s*:\s*"([^"]+)"/);
    if (!hlsMatch) return null;
    let finalUrl = hlsMatch[1];
    if (!finalUrl.startsWith("http")) finalUrl = origin + finalUrl;
    return { url: finalUrl, quality: "1080p", headers: { "User-Agent": PP_UA, Referer: origin + "/", Origin: origin } };
  } catch (e) {
    return null;
  }
}

async function resolveUqload_PP(url) {
  try {
    let html = await fetchTextPP(url, "https://xupalace.org/");
    if (html.length < 100 && (html.includes("restricted") || html.includes("domain"))) {
      html = await fetchTextPP(url, "https://pelispedia.mov/");
    }
    return parseHtmlPP(html, url);
  } catch (e) {
    return null;
  }
}

function parseHtmlPP(html, url) {
  const videoMatch = html.match(/sources:\s*\[\s*["']([^"']+)["']/i) || html.match(/sources:\s*\[\s*\{\s*src:\s*["']([^"']+)["']/i) || html.match(/src:\s*["']([^"']+)["']/i) || html.match(/["'](https?:\/\/[^"']+\.(mp4|m3u8)[^"']*)["']/i);
  if (videoMatch) {
    const videoUrl = videoMatch[1].startsWith("//") ? "https:" + videoMatch[1] : videoMatch[1];
    return { url: videoUrl, quality: "HD", headers: { "User-Agent": PP_UA, Referer: url } };
  }
  return null;
}

const RESOLVER_MAP_PP = {
  "voe.sx": resolveVOE_PP,
  "voe.un": resolveVOE_PP,
  "hglink.to": resolveHLSWish_PP,
  "streamwish.com": resolveHLSWish_PP,
  "streamwish.to": resolveHLSWish_PP,
  "wishembed.online": resolveHLSWish_PP,
  "filelions.com": resolveHLSWish_PP,
  "bysedikamoum.com": resolveFilemoon_PP,
  "filemoon.sx": resolveFilemoon_PP,
  "filemoon.to": resolveFilemoon_PP,
  "moonembed.pro": resolveFilemoon_PP,
  "dintezuvio.com": resolveVidHide_PP,
  "vidhide.com": resolveVidHide_PP,
  "vidhide.pro": resolveVidHide_PP,
  "vidhide.bz": resolveVidHide_PP,
  "vidhide.stream": resolveVidHide_PP,
  "vidhide.vip": resolveVidHide_PP,
  "vidhide.to": resolveVidHide_PP,
  "uqload.to": resolveUqload_PP,
  "uqload.com": resolveUqload_PP,
  "uqload.io": resolveUqload_PP,
  "uqload.is": resolveUqload_PP,
  "uqload.cc": resolveUqload_PP,
  "minochinos.com": resolveVidHide_PP,
  "audinifer.com": resolveHLSWish_PP,
  "pstream.org": resolveHLSWish_PP,
};

const SERVER_LABELS_PP = {
  voe: "VOE", hglink: "StreamWish", streamwish: "StreamWish", hanerix: "StreamWish", wishembed: "StreamWish", filelions: "StreamWish",
  bysedikamoum: "Filemoon", filemoon: "Filemoon", moonembed: "Filemoon", minochinos: "VidHide", dintezuvio: "VidHide", vidhide: "VidHide", uqload: "Uqload",
};

function decodeJwtPayloadPP(token) {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    let payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    payload += "=".repeat((4 - payload.length % 4) % 4);
    return JSON.parse(atob(payload));
  } catch (e) {
    return null;
  }
}

async function resolveEmbed69PP(embedUrl) {
  try {
    const html = await fetchTextPP(embedUrl, "https://pelispedia.mov/");
    const jwtRegex = /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g;
    const uniqueTokens = new Set();
    let m;
    while ((m = jwtRegex.exec(html)) !== null) uniqueTokens.add(m[0]);
    const results = [];
    for (const token of uniqueTokens) {
      if (token.length < 50) continue;
      const payload = decodeJwtPayloadPP(token);
      if (payload && payload.link) {
        for (const [pattern, resolver] of Object.entries(RESOLVER_MAP_PP)) {
          if (payload.link.includes(pattern)) {
            const r = await resolver(payload.link);
            if (r && r.url) {
              const rawName = pattern.split(".")[0];
              results.push(Object.assign({}, r, { servername: SERVER_LABELS_PP[rawName] || rawName }));
              break;
            }
          }
        }
      }
    }
    return results;
  } catch (e) {
    return [];
  }
}

async function extractStreamsPP(url) {
  const html = await fetchTextPP(url, "https://pelispedia.mov/");
  if (!html) return [];
  const streams = [];
  const seenUrls = new Set();

  const bloqueRegex = /id="options-\d+"[\s\S]{0,50}?<iframe[^>]+src="([^"]+)"/gi;
  const iframesEncontrados = [];
  let m;
  while ((m = bloqueRegex.exec(html)) !== null) iframesEncontrados.push(m[1]);

  const spanRegex = /<span[^>]*class="[^"]*server[^"]*"[^>]*>([^<]*)<\/span>/gi;
  const idiomasEncontrados = [];
  while ((m = spanRegex.exec(html)) !== null) idiomasEncontrados.push(m[1].trim().replace(/-/g, ""));

  iframesEncontrados.forEach((iframeUrl, i) => {
    if (!seenUrls.has(iframeUrl)) {
      seenUrls.add(iframeUrl);
      streams.push({ servername: "Servidor", url: iframeUrl, language: idiomasEncontrados[i] || "Latino", quality: "1080p", necesitaSegundaEtapa: true });
    }
  });

  if (!streams.length) {
    const playerRegex = /<div[^>]*class="[^"]*player-content[^"]*"[\s\S]*?<iframe[^>]+src="([^"]+)"/gi;
    while ((m = playerRegex.exec(html)) !== null) {
      const iframeUrl = m[1];
      if (!seenUrls.has(iframeUrl)) {
        seenUrls.add(iframeUrl);
        streams.push({ servername: "Servidor", url: iframeUrl, language: "Latino", quality: "1080p" });
      }
    }
  }

  if (!streams.length) {
    const genericRegex = /<iframe[^>]+src="([^"]+)"/gi;
    while ((m = genericRegex.exec(html)) !== null) {
      const iframeUrl = m[1];
      if ((iframeUrl.includes("embed69") || iframeUrl.includes("xupalace")) && !seenUrls.has(iframeUrl)) {
        seenUrls.add(iframeUrl);
        streams.push({ servername: iframeUrl.includes("embed69") ? "Embed69" : "Servidor", url: iframeUrl, language: "Latino", quality: "1080p" });
      }
    }
  }

  const resueltos = [];
  for (const s of streams) {
    if (s.necesitaSegundaEtapa) {
      const htmlIntermedio = await fetchTextPP(s.url, url);
      const vm = htmlIntermedio.match(/<div[^>]*class="[^"]*Video[^"]*"[\s\S]{0,100}?<iframe[^>]+src="([^"]+)"/i);
      if (vm) resueltos.push(Object.assign({}, s, { url: vm[1], necesitaSegundaEtapa: undefined }));
    } else {
      resueltos.push(s);
    }
  }
  return resueltos;
}

async function getTmdbTitlePP(tmdbId, mediaType) {
  const type = mediaType === "movie" ? "movie" : "tv";
  const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_API_KEY_PP}&language=es-MX`;
  try {
    const res = await fetch(url, { signal: timeoutSignalPP(10000) });
    const data = await res.json();
    return type === "movie" ? (data.title || data.original_title) : (data.name || data.original_name);
  } catch (e) {
    return null;
  }
}

async function buscarEnDominioPP(dominioBase, title, season, episode) {
  const url = `${dominioBase}/search?s=${normalizeTitlePP(title).replace(/\s+/g, "+")}`;
  const html = await fetchTextPP(url, dominioBase + "/");
  const re = new RegExp(`href="(${dominioBase.replace(/\./g, "\\.")}\\/(pelicula|serie)\\/([^"]+))"`, "gi");
  const m = re.exec(html);
  if (!m) return null;
  if (m[2] === "serie") return `${dominioBase}/serie/${m[3]}/temporada/${season || 1}/capitulo/${episode || 1}`;
  return m[1];
}

async function getStreams(tmdbId, mediaType, season, episode) {
  try {
    const title = await getTmdbTitlePP(tmdbId, mediaType);
    if (!title) return [];

    let targetUrl = await buscarEnDominioPP("https://pelispedia.mov", title, season, episode);
    if (!targetUrl) targetUrl = await buscarEnDominioPP("https://pelispedia.is", title, season, episode);
    if (!targetUrl) return [];

    const rawEmbeds = await extractStreamsPP(targetUrl);
    const streams = [];
    for (const embed of rawEmbeds) {
      let resolved = null;
      if (embed.url.includes("embed69.org")) {
        resolved = await resolveEmbed69PP(embed.url);
      } else {
        for (const [pattern, resolver] of Object.entries(RESOLVER_MAP_PP)) {
          if (embed.url.includes(pattern)) { resolved = await resolver(embed.url); break; }
        }
      }
      if (resolved) {
        const results = Array.isArray(resolved) ? resolved : [resolved];
        results.forEach((r) => {
          if (r.url) {
            streams.push({
              name: "Pelispedia",
              title: `${r.quality || "1080p"} \u00b7 ${embed.language || "Latino"} \u00b7 ${r.servername || embed.servername || "Server"}`,
              url: r.url,
              headers: r.headers || { "User-Agent": PP_UA, Referer: embed.url },
            });
          }
        });
      }
    }
    return streams;
  } catch (e) {
    console.log("[PelisPedia] Error: " + e.message);
    return [];
  }
}

module.exports = { getStreams };
