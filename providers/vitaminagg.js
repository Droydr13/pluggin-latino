const CryptoJS = require("crypto-js");

const VITAMINAGG_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const AES_KEY_VGG = CryptoJS.enc.Utf8.parse("kiemtienmua911ca");
const AES_IV_VGG = CryptoJS.enc.Utf8.parse("1234567890oiuytr");
const TMDB_API_KEY_VGG = "439c478a771f35c05022f9feabcca01c";

const HOST_SERIES_PATH_VGG = {
  "vitaminagg.vip": "serie",
  "anime.vitaminagg.vip": "anime",
  "hentai.vitaminagg.vip": "serie",
};

function timeoutSignalVGG(ms) {
  try {
    if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") return AbortSignal.timeout(ms);
  } catch (e) {}
  return undefined;
}

function getOriginVGG(url) {
  const m = url.match(/^([a-z]+:\/\/[^\/]+)/i);
  return m ? m[1] : url;
}

function decryptVGG(hexCiphertext) {
  try {
    const cleaned = (hexCiphertext.match(/[\da-f]{2}/gi) || []).join("");
    const ciphertextWords = CryptoJS.enc.Hex.parse(cleaned);
    const ciphertextBase64 = CryptoJS.enc.Base64.stringify(ciphertextWords);
    const decrypted = CryptoJS.AES.decrypt(ciphertextBase64, AES_KEY_VGG, { iv: AES_IV_VGG, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    return null;
  }
}

function slugifyVGG(title) {
  return title.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "y")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function getStreams(tmdbId, mediaType, season, episode, title, host) {
  let targetTitle = title;
  if (!targetTitle) {
    try {
      const tmdbRes = await fetch(`https://api.themoviedb.org/3/${mediaType}/${tmdbId}?api_key=${TMDB_API_KEY_VGG}&language=es-MX`, { signal: timeoutSignalVGG(10000) }).then((r) => r.json());
      targetTitle = mediaType === "movie" ? tmdbRes.title : tmdbRes.name;
    } catch (e) {}
  }
  if (!targetTitle) return [];
  title = targetTitle;

  const hostsToTry = host ? [host] : ["vitaminagg.vip", "anime.vitaminagg.vip"];

  for (const siteHost of hostsToTry) {
    const siteBase = `https://${siteHost}`;
    const seriesPath = HOST_SERIES_PATH_VGG[siteHost] || "serie";

    try {
      const targetSlug = slugifyVGG(title);
      let pageUrl = "";

      const searchUrl = `${siteBase}/?s=${encodeURIComponent(title)}`;
      let searchHtml = "";
      try {
        const searchRes = await fetch(searchUrl, { headers: { "User-Agent": VITAMINAGG_UA }, signal: timeoutSignalVGG(15000) });
        if (searchRes.ok) searchHtml = await searchRes.text();
      } catch (err) {}

      const escapedHost = siteHost.replace(/\./g, "\\.");
      const linkPattern = mediaType === "movie"
        ? new RegExp(`href="(https?:\\/\\/${escapedHost}\\/movie\\/([^/"]+)\\/?)"`, "g")
        : new RegExp(`href="(https?:\\/\\/${escapedHost}\\/${seriesPath}\\/([^/"]+)\\/?)"`, "g");

      let match;
      let matchedUrl = null;
      if (searchHtml) {
        while ((match = linkPattern.exec(searchHtml)) !== null) {
          const url = match[1];
          const slug = match[2];
          if (slug.includes(targetSlug) || targetSlug.includes(slug)) { matchedUrl = url; break; }
        }
      }

      if (matchedUrl) {
        pageUrl = matchedUrl;
      } else {
        pageUrl = mediaType === "movie" ? `${siteBase}/movie/${targetSlug}/` : `${siteBase}/${seriesPath}/${targetSlug}/`;
      }

      if (mediaType === "tv") {
        const seasonPadded = String(season).padStart(2, "0");
        const episodePadded = String(episode).padStart(2, "0");
        const seriesSlugMatch = pageUrl.match(new RegExp(`\\/${seriesPath}\\/([^/]+)\\/?`));
        const seriesSlug = seriesSlugMatch ? seriesSlugMatch[1] : targetSlug;
        pageUrl = `${siteBase}/episodes/${seriesSlug}-s${seasonPadded}x${episodePadded}/`;
      }

      const pageRes = await fetch(pageUrl, { headers: { "User-Agent": VITAMINAGG_UA }, signal: timeoutSignalVGG(15000) });
      if (!pageRes.ok) continue;
      const pageHtml = await pageRes.text();

      const playerViewMatch = pageHtml.match(/class=["'][^"']*plyer__view[^"']*["']\s+data-post-id=["'](\d+)["']/i);
      if (!playerViewMatch) continue;
      const postId = playerViewMatch[1];

      const pageHost = getOriginVGG(pageUrl);
      const playerUrl = `${pageHost}/wstrm-player?id=${postId}&plyer-id=opcion-1`;
      const playerHtml = await fetch(playerUrl, { headers: { "User-Agent": VITAMINAGG_UA, Referer: pageUrl }, signal: timeoutSignalVGG(15000) }).then((r) => r.text());

      const srcMatch = playerHtml.match(/data-src=["']([^"']+)["']/);
      if (!srcMatch) continue;

      const [videoBackendUrlRaw, videoHash] = srcMatch[1].split("#");
      if (!videoHash) continue;

      const videoBackendUrl = videoBackendUrlRaw.replace(/\/$/, "");
      const videoApiUrl = `${videoBackendUrl}/api/v1/video?id=${videoHash}&w=1920&h=1080&r=vitaminagg.vip`;
      const videoRes = await fetch(videoApiUrl, { headers: { "User-Agent": VITAMINAGG_UA, Referer: `${videoBackendUrl}/` }, signal: timeoutSignalVGG(15000) });
      if (!videoRes.ok) continue;

      const encryptedText = await videoRes.text();
      const decryptedText = decryptVGG(encryptedText);
      if (!decryptedText) continue;

      const videoData = JSON.parse(decryptedText);
      const streams = [];

      if (videoData.source) {
        streams.push({
          name: "VitaminaGG",
          title: `${videoData.title || title} \u00b7 Directo`,
          url: videoData.source,
          quality: "1080p",
          headers: { "User-Agent": VITAMINAGG_UA, Referer: `${videoBackendUrl}/`, Origin: videoBackendUrl },
        });
      }
      if (videoData.cf) {
        streams.push({
          name: "VitaminaGG",
          title: `${videoData.title || title} \u00b7 Cloudflare`,
          url: videoData.cf,
          quality: "1080p",
          headers: { "User-Agent": VITAMINAGG_UA, Referer: `${videoBackendUrl}/`, Origin: videoBackendUrl },
        });
      }

      if (streams.length > 0) return streams;
    } catch (e) {
      console.log("[VitaminaGG] Error en " + siteHost + ": " + e.message);
    }
  }

  return [];
}

module.exports = { getStreams };
