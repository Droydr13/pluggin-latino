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
const axios = require("axios");
const cheerio = require("cheerio-without-node-native");
const DOCUMANIATV_BASE = "https://www.documaniatv.com";
const DOCUMANIATV_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const TMDB_API_KEY_DT = "439c478a771f35c05022f9feabcca01c";
function getTmdbTitleDT(tmdbId, mediaType) {
  return __async(this, null, function* () {
    const type = mediaType === "movie" ? "movie" : "tv";
    const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_API_KEY_DT}&language=es-MX`;
    try {
      const r = yield axios.get(url);
      const data = r.data;
      return type === "movie" ? data.title || data.original_title : data.name || data.original_name;
    } catch (e) {
      return null;
    }
  });
}
function dtGet(url, opts) {
  return __async(this, null, function* () {
    return axios.get(url, Object.assign({ headers: { "User-Agent": DOCUMANIATV_UA } }, opts || {}));
  });
}
function normalizarDT(s) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
function extraerUrlVideo(texto) {
  const m = texto.match(/"src"\s*:\s*"([^"]+)"/) || texto.match(/file:\s*"([^"]+)"/) || texto.match(/https?:\/\/[^\s"']+\.mp4[^\s"']*/);
  return m ? m[1] || m[0] : null;
}
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      const title = yield getTmdbTitleDT(tmdbId, mediaType);
      if (!title) return [];
      const tituloNorm = normalizarDT(title);
      const searchRes = yield axios.post(
        DOCUMANIATV_BASE + "/ajax_search.php",
        "queryString=" + encodeURIComponent(title),
        { headers: { "User-Agent": DOCUMANIATV_UA, "X-Requested-With": "XMLHttpRequest", "Content-Type": "application/x-www-form-urlencoded" } }
      );
      const $ = cheerio.load(searchRes.data);
      let targetHref = null;
      $("li").each(function() {
        if (targetHref) return;
        const a = $(this).find("a").first();
        const href = a.attr("href");
        if (!href || href.indexOf("video_") === -1) return;
        const t = a.text().trim();
        if (!targetHref || normalizarDT(t) === tituloNorm) {
          targetHref = href.startsWith("http") ? href : DOCUMANIATV_BASE + href;
        }
      });
      if (!targetHref) return [];
      const pageRes = yield dtGet(targetHref);
      const html = pageRes.data;
      const scriptMatch = html.match(/<script[^>]*>([^<]*pm_video_data[^<]*)<\/script>/);
      if (!scriptMatch) return [];
      const videoIdMatch = scriptMatch[1].match(/uniq_id:\s*"([^"]+)"/);
      if (!videoIdMatch) return [];
      const videoId = videoIdMatch[1];
      const embedRes = yield dtGet(DOCUMANIATV_BASE + "/embed/" + videoId);
      const setCookie = embedRes.headers["set-cookie"] || [];
      const cookies = setCookie.map((c) => c.split(";")[0]).join("; ");
      const jsonRes = yield dtGet(DOCUMANIATV_BASE + "/json/" + videoId, {
        headers: {
          "Referer": DOCUMANIATV_BASE + "/embed/" + videoId,
          "X-Requested-With": "XMLHttpRequest",
          "User-Agent": DOCUMANIATV_UA,
          "Cookie": cookies
        }
      });
      const texto = typeof jsonRes.data === "string" ? jsonRes.data : JSON.stringify(jsonRes.data);
      let finalUrl = extraerUrlVideo(texto);
      if (!finalUrl) {
        try {
          const jsRes = yield dtGet(DOCUMANIATV_BASE + "/docuplayer/v1/" + videoId + ".js", {
            headers: { "Referer": DOCUMANIATV_BASE + "/embed/" + videoId, "User-Agent": DOCUMANIATV_UA, "Cookie": cookies }
          });
          finalUrl = extraerUrlVideo(jsRes.data);
        } catch (e) {
          finalUrl = null;
        }
      }
      if (!finalUrl) return [];
      finalUrl = finalUrl.replace(/\\\//g, "/");
      return [{
        name: "DocumaniaTV",
        title: "720p \xB7 Directo",
        url: finalUrl,
        quality: "720p",
        headers: { "User-Agent": DOCUMANIATV_UA, Referer: DOCUMANIATV_BASE + "/" }
      }];
    } catch (e) {
      console.log("[DocumaniaTV] Error: " + e.message);
      return [{ name: "[DocumaniaTV] Error: " + e.message, title: String((e && e.stack) || (e && e.message) || e).slice(0, 300), url: "https://example.com/debug-error.mp4" }];
    }
  });
}
module.exports = { getStreams };
