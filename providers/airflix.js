// Airflix Scraper for Nuvio Local Scrapers

const PROVIDER_NAME = "Airflix";
const STREAM_API    = "https://streamdata.vaplayer.ru/api.php";
const TMDB_KEY      = "1c29a5198ee1854bd5eb45dbe8d17d92";

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"
};

// ===== TMDB =====

const getTMDBInfo = async (tmdbId, mediaType) => {
  const type = mediaType === "movie" ? "movie" : "tv";
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_KEY}`,
      { headers: HEADERS }
    );
    const data = await res.json();
    return {
      title: data.name || data.title || "",
      year:  (data.first_air_date || data.release_date || "").split("-")[0]
    };
  } catch {
    return { title: "", year: "" };
  }
};

// ===== MAIN =====

const getStreams = async (tmdbId, mediaType, season, episode) => {
  const isMovie = mediaType === "movie";
  const s = season  || 1;
  const e = episode || 1;

  console.log(`[Airflix] tmdbId=${tmdbId} type=${mediaType}${isMovie ? "" : ` S${s}E${e}`}`);

  try {
    const [info] = await Promise.all([getTMDBInfo(tmdbId, mediaType)]);

    // Build API URL
    let apiUrl = `${STREAM_API}?tmdb=${tmdbId}&type=${isMovie ? "movie" : "tv"}`;
    if (!isMovie) apiUrl += `&season=${s}&episode=${e}`;

    console.log(`[Airflix] Fetching: ${apiUrl}`);

    const res  = await fetch(apiUrl, { headers: HEADERS });
    const data = await res.json();

    if (!data || data.status_code !== "200" || !data.data) {
      throw new Error(`API returned status ${data?.status_code || "unknown"}`);
    }

    const urls     = data.data.stream_urls || [];
    const rawSubs  = data.data.default_subs || [];

    if (urls.length === 0) throw new Error("No stream URLs in response");

    // Pick English subtitle
    const engSub = rawSubs.find(sub => {
      const lang = typeof sub === "string"
        ? sub.toLowerCase()
        : (sub.label || sub.language || sub.lang || "").toLowerCase();
      return lang.includes("eng");
    });
    const subtitleUrl = engSub
      ? (typeof engSub === "string" ? engSub : engSub.url || engSub.file || "")
      : (rawSubs.length > 0
          ? (typeof rawSubs[0] === "string" ? rawSubs[0] : rawSubs[0].url || "")
          : "");

    const streamTitle = `${info.title || `TMDB ${tmdbId}`}` +
      (isMovie ? "" : ` S${String(s).padStart(2,"0")}E${String(e).padStart(2,"0")}`) +
      (info.year ? ` (${info.year})` : "");

    const streams = urls.map((url, idx) => ({
      name:    `${PROVIDER_NAME} [Server ${idx + 1}] - Auto`,
      title:   streamTitle,
      url:     url,
      quality: "Auto",
      headers: HEADERS,
      subtitles: subtitleUrl ? [{ url: subtitleUrl, lang: "English" }] : []
    }));

    console.log(`[Airflix] ${streams.length} stream(s) found`);
    return streams;

  } catch (err) {
    console.error(`[Airflix] Fatal: ${err.message}`);
    return [];
  }
};

module.exports = { getStreams };
