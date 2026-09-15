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
const RCN_BASE = "https://unity.tbxapis.com/v0";
const RCN_CLIENT_ID = "801ca66694329da3ba697f38c94bf0a1";
const RCN_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const TMDB_API_KEY_RCN = "439c478a771f35c05022f9feabcca01c";
function normalizarRCN(s) {
  return (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
function getTmdbTitleRCN(tmdbId, mediaType) {
  return __async(this, null, function* () {
    const type = mediaType === "movie" ? "movie" : "tv";
    const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_API_KEY_RCN}&language=es-MX`;
    try {
      const r = yield axios.get(url, { timeout: 1e4 });
      const data = r.data;
      return type === "movie" ? data.title || data.original_title : data.name || data.original_name;
    } catch (e) {
      return null;
    }
  });
}
function rcnPublicAuth() {
  return __async(this, null, function* () {
    const url = `${RCN_BASE}/auth/public?v=${Date.now()}`;
    const res = yield axios.post(url, {
      auth: { sub: RCN_CLIENT_ID, country: "CO", currentProfile: null, device: null, language: "es" }
    }, { headers: { Accept: "application/json", "Content-Type": "application/json", "User-Agent": RCN_UA }, timeout: 1e4 });
    const token = res.data && res.data.token && res.data.token.access_token;
    if (!token) throw new Error("RCN: auth publica sin access_token");
    return token;
  });
}
function rcnRequest(path) {
  return __async(this, null, function* () {
    const jwt = yield rcnPublicAuth();
    return axios.get(`${RCN_BASE}${path}`, {
      headers: { Accept: "application/json", Authorization: `JWT ${jwt}`, "User-Agent": RCN_UA },
      timeout: 15e3
    });
  });
}
function rcnSearchContent(title, contentType) {
  return __async(this, null, function* () {
    const q = `contentType=${contentType}&text=${encodeURIComponent(title)}&page=1&pageSize=10`;
    const res = yield rcnRequest(`/contents?${q}`);
    return res.data && res.data.result || [];
  });
}
function rcnFindEncodings(value) {
  const results = [];
  function visit(current) {
    if (!current || typeof current !== "object") return;
    if (Array.isArray(current)) {
      current.forEach(visit);
      return;
    }
    if (current.type === "media" && typeof current.url === "string" && (current.extension === "m3u8" || current.extension === "mpd")) {
      results.push(current);
    }
    const values = Object.keys(current).map((k) => current[k]);
    values.forEach(visit);
  }
  visit(value);
  return results;
}
function rcnGetPlayback(contentId) {
  return __async(this, null, function* () {
    const jwt = yield rcnPublicAuth();
    const res = yield axios.get(`${RCN_BASE}/contents/${encodeURIComponent(contentId)}/url?network=RCN`, {
      headers: { Accept: "application/json", Authorization: `JWT ${jwt}`, "User-Agent": RCN_UA },
      timeout: 15e3
    });
    const data = res.data || {};
    const encodings = rcnFindEncodings(data);
    const usable = encodings.filter((e) => e.hasDRM === false && typeof e.url === "string");
    const hls = usable.filter((e) => e.extension === "m3u8")[0];
    const dash = usable.filter((e) => e.extension === "mpd")[0];
    const selected = hls || dash;
    if (!selected || !selected.url) throw new Error(`RCN: sin encoding no-DRM utilizable (${encodings.length} encontrados)`);
    return {
      url: selected.url,
      quality: selected.height ? `${selected.height}p` : "1080p",
      dubbed: selected.dubbed || false
    };
  });
}
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      const title = yield getTmdbTitleRCN(tmdbId, mediaType);
      if (!title) return [];
      const isMovie = mediaType === "movie";
      const contentType = isMovie ? "MOVIE" : "SERIE";
      const candidatos = yield rcnSearchContent(title, contentType);
      if (!candidatos.length) return [];
      const tituloNorm = normalizarRCN(title);
      const match = candidatos.find((c) => normalizarRCN(c.title || c.name || "") === tituloNorm) || candidatos[0];
      let contentIdParaPlayback = match.id;
      if (!isMovie) {
        if (!season || !episode) return [];
        const seasonNum = parseInt(season);
        const epNum = parseInt(episode);
        const temporada = (match.episodesBySeason || []).find((s) => s.season === seasonNum);
        if (!temporada || !temporada.episodes || !temporada.episodes[epNum - 1]) return [];
        contentIdParaPlayback = temporada.episodes[epNum - 1];
      }
      const playback = yield rcnGetPlayback(contentIdParaPlayback);
      const idioma = playback.dubbed ? "Espa\xF1ol" : "Latino";
      const displayQuality = `RCN \xB7 ${idioma} \xB7 ${playback.quality}`;
      return [{
        name: "RCN",
        title: displayQuality,
        url: playback.url,
        quality: displayQuality,
        headers: { "User-Agent": RCN_UA }
      }];
    } catch (e) {
      console.log("[RCN] Error: " + e.message);
      return [{
        name: "[RCN] Error: " + e.message,
        title: String(e && e.stack || e && e.message || e).slice(0, 300),
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        headers: {}
      }];
    }
  });
}
module.exports = { getStreams };
