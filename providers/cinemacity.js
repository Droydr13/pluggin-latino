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
const MAIN_URL = "https://cinemacity.cc";
const TMDB_API_KEY = "1865f43a0549ca50d341dd9ab8b29f49";
const CINEMACITY_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
function timeoutSignal(ms) {
  try {
    if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") return AbortSignal.timeout(ms);
  } catch (e) {
  }
  return void 0;
}
function fetchText(url, opts) {
  return __async(this, null, function* () {
    const o = Object.assign({ headers: { "User-Agent": CINEMACITY_UA } }, opts, { signal: timeoutSignal(opts && opts.timeoutMs || 15e3) });
    delete o.timeoutMs;
    const res = yield fetch(url, o);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
  });
}
function extractQuality(url) {
  const low = (url || "").toLowerCase();
  if (low.includes("2160p") || low.includes("4k")) return "4K";
  if (low.includes("1080p")) return "1080p";
  if (low.includes("720p")) return "720p";
  if (low.includes("480p")) return "480p";
  if (low.includes("360p")) return "360p";
  return "HD";
}
function extraerListado(html) {
  const resultados = [];
  const regex = /<div[^>]*class="[^"]*dar-short_item[^"]*"[\s\S]{0,600}?<a\s+[^>]*href="([^"]+\.html[^"]*)"[^>]*>([^<]*)</gi;
  let m;
  while ((m = regex.exec(html)) !== null) {
    resultados.push({ href: m[1], title: m[2].split("(")[0].trim() });
  }
  return resultados;
}
function getStreams(tmdbId, mediaType, season, episode, title) {
  return __async(this, null, function* () {
    try {
      const HEADERS = {
        "User-Agent": CINEMACITY_UA,
        Cookie: "dle_user_id=32729; dle_password=894171c6a8dab18ee594d5c652009a35;",
        Referer: "https://cinemacity.cc/"
      };
      const tmdbUrl = `https://api.themoviedb.org/3/${mediaType === "tv" ? "tv" : "movie"}/${tmdbId}?api_key=${TMDB_API_KEY}`;
      const tmdbRes = yield fetch(tmdbUrl, { signal: timeoutSignal(1e4) }).catch(() => null);
      if (!tmdbRes || !tmdbRes.ok) return [];
      const mediaInfo = yield tmdbRes.json();
      const searchTitle = mediaInfo.title || mediaInfo.name || title;
      if (!searchTitle) return [];
      const searchUrl = `${MAIN_URL}/?do=search&subaction=search&search_start=0&full_search=0&story=${encodeURIComponent(searchTitle)}`;
      const searchHtml = yield fetchText(searchUrl, { headers: HEADERS }).catch(() => null);
      let mediaUrl = null;
      if (searchHtml) {
        const targetTitle = searchTitle.toLowerCase();
        for (const item of extraerListado(searchHtml)) {
          const foundTitle = item.title.toLowerCase();
          if (foundTitle === targetTitle || foundTitle.includes(targetTitle) || targetTitle.includes(foundTitle)) {
            mediaUrl = item.href;
            break;
          }
        }
      }
      if (!mediaUrl) {
        const homeHtml = yield fetchText(MAIN_URL, { headers: HEADERS }).catch(() => null);
        if (homeHtml) {
          const targetTitle = searchTitle.toLowerCase();
          for (const item of extraerListado(homeHtml)) {
            if (item.title.toLowerCase() === targetTitle) {
              mediaUrl = item.href;
              break;
            }
          }
        }
      }
      if (!mediaUrl) return [];
      const pageHtml = yield fetchText(mediaUrl, { headers: HEADERS }).catch(() => null);
      if (!pageHtml) return [];
      let fileData = null;
      const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
      let mScript;
      while ((mScript = scriptRegex.exec(pageHtml)) !== null) {
        if (fileData) break;
        const htmlStr = mScript[1];
        if (!htmlStr || !htmlStr.includes("atob")) continue;
        const regex = /atob\s*\(\s*(['"])(.*?)\1\s*\)/g;
        let match;
        while ((match = regex.exec(htmlStr)) !== null) {
          try {
            const decoded = CryptoJS.enc.Base64.parse(match[2]).toString(CryptoJS.enc.Utf8);
            const fileMatch = decoded.match(new RegExp(`file\\s*:\\s*(['"])(.*?)\\1`, "s")) || decoded.match(new RegExp("file\\s*:\\s*(\\[.*?\\])", "s"));
            if (fileMatch) {
              let rawFile = fileMatch[2] || fileMatch[1];
              if (rawFile && rawFile.length > 5) {
                if (rawFile.startsWith("[") || rawFile.startsWith("{")) {
                  try {
                    fileData = JSON.parse(rawFile.replace(/\\(.)/g, "$1"));
                  } catch (e) {
                    try {
                      fileData = JSON.parse(rawFile);
                    } catch (e2) {
                      fileData = rawFile;
                    }
                  }
                } else {
                  fileData = rawFile;
                }
                if (fileData) break;
              }
            }
          } catch (e) {
          }
        }
      }
      if (!fileData) return [];
      const streams = [];
      const addStream = (url, qualityLabel) => {
        if (!url || !url.startsWith("http") || url.length < 15) return;
        const lowerLang = (qualityLabel || "").toLowerCase();
        if (lowerLang.includes("sub") || lowerLang.includes("castellano") || lowerLang.includes("esp") || lowerLang.includes("vose")) return;
        let finalUrl = url;
        if (!finalUrl.includes(".m3u8") && !finalUrl.includes(".mp4")) finalUrl += "#.m3u8";
        streams.push({
          name: "CinemaCity",
          title: `Latino \xB7 ${extractQuality(url)}`,
          url: finalUrl,
          quality: extractQuality(url),
          headers: Object.assign({}, HEADERS, { "User-Agent": CINEMACITY_UA })
        });
      };
      const processStr = (str) => {
        if (str.includes(".urlset/master.m3u8")) {
          addStream(str, "Latino");
        } else {
          const urls = str.includes("[") ? str.split(",") : [str];
          urls.forEach((u) => {
            const m = u.match(/\[(.*?)\](.*)/);
            if (m) addStream(m[2], m[1]);
            else addStream(u, "Latino");
          });
        }
      };
      if (mediaType === "movie") {
        if (Array.isArray(fileData)) {
          const obj = fileData.find((f) => !f.folder && f.file) || fileData[0];
          if (obj && obj.file) processStr(obj.file);
        } else if (typeof fileData === "string") {
          processStr(fileData);
        }
      } else {
        if (Array.isArray(fileData)) {
          const sLabel = `Season ${season}`;
          const sObj = fileData.find((s) => (s.title || "").includes(sLabel) || (s.title || "").includes(`S${season}`));
          if (sObj && sObj.folder) {
            const eLabel = `Episode ${episode}`;
            const eObj = sObj.folder.find((e) => (e.title || "").includes(eLabel) || (e.title || "").includes(`E${episode}`));
            if (eObj && eObj.file) processStr(eObj.file);
          }
        }
      }
      return streams;
    } catch (e) {
      console.log("[CinemaCity] Error: " + e.message);
      return [];
    }
  });
}
module.exports = { getStreams };
