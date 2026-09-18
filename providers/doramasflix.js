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
const DORAMASFLIX_BASE = "https://doramasflix.co";
const DORAMASFLIX_GQL = "https://doraflix.fluxcedene.net/api/gql";
const DORAMASFLIX_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const TMDB_API_KEY_DF = "439c478a771f35c05022f9feabcca01c";
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
    const o = Object.assign({}, opts, { signal: timeoutSignal(opts && opts.timeoutMs || 15e3) });
    delete o.timeoutMs;
    const res = yield fetch(url, o);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
  });
}
function fetchJson(url, opts) {
  return __async(this, null, function* () {
    const o = Object.assign({}, opts, { signal: timeoutSignal(opts && opts.timeoutMs || 15e3) });
    delete o.timeoutMs;
    const res = yield fetch(url, o);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
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
function base64UrlDecode(str) {
  const estandar = str.replace(/-/g, "+").replace(/_/g, "/");
  return base64DecodeUtf8(estandar);
}
function getOrigin(url) {
  const m = url.match(/^([a-z]+:\/\/[^\/]+)/i);
  return m ? m[1] : url;
}
function getHostname(url) {
  const m = url.match(/^[a-z]+:\/\/([^\/:?#]+)/i);
  return m ? m[1] : "";
}
function getTmdbInfoDF(tmdbId, mediaType) {
  return __async(this, null, function* () {
    const type = mediaType === "movie" ? "movie" : "tv";
    const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_API_KEY_DF}&language=es-MX`;
    try {
      const data = yield fetchJson(url, { timeoutMs: 1e4 });
      const title = type === "movie" ? data.title || data.original_title : data.name || data.original_name;
      const year = ((type === "movie" ? data.release_date : data.first_air_date) || "").slice(0, 4);
      return { title, year };
    } catch (e) {
      return { title: null, year: null };
    }
  });
}
function normalizarDF(s) {
  return (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
function dfGql(operationName, query, variables) {
  return __async(this, null, function* () {
    try {
      return yield fetchJson(DORAMASFLIX_GQL, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8", "User-Agent": DORAMASFLIX_UA },
        body: JSON.stringify({ operationName, query, variables }),
        timeoutMs: 15e3
      });
    } catch (e) {
      return null;
    }
  });
}
const IDIOMA_POR_ID = { "13109": "Coreano", "13110": "Japones", "13111": "Mandarin", "13112": "Tailandes", "37": "Castellano", "38": "Latino", "192": "Subtitulado" };
function gqlSearchAll(texto) {
  return __async(this, null, function* () {
    const query = `query searchAll($input: String!) {
    searchDorama(input: $input, limit: 5) { _id slug name name_es poster_path isTVShow poster }
    searchMovie(input: $input, limit: 5) { _id name name_es slug poster_path poster }
  }`;
    const r = yield dfGql("searchAll", query, { input: texto });
    return r && r.data ? { doramas: r.data.searchDorama || [], movies: r.data.searchMovie || [] } : { doramas: [], movies: [] };
  });
}
function gqlListSeasons(serieId) {
  return __async(this, null, function* () {
    const query = `query listSeasons($serie_id: MongoID!) {
    listSeasons(sort: NUMBER_ASC, filter: {serie_id: $serie_id}) { slug season_number }
  }`;
    const r = yield dfGql("listSeasons", query, { serie_id: serieId });
    return r && r.data && r.data.listSeasons || [];
  });
}
function gqlListEpisodes(serieId, seasonNumber) {
  return __async(this, null, function* () {
    const query = `query listEpisodesPagination($page: Int!, $serie_id: MongoID!, $season_number: Float!) {
    paginationEpisode(page: $page, perPage: 1000, sort: NUMBER_ASC, filter: {type_serie: "dorama", serie_id: $serie_id, season_number: $season_number}) {
      items { _id episode_number season_number slug }
    }
  }`;
    const r = yield dfGql("listEpisodesPagination", query, { page: 1, serie_id: serieId, season_number: seasonNumber });
    return r && r.data && r.data.paginationEpisode && r.data.paginationEpisode.items || [];
  });
}
function gqlGetEpisodeLinks(episodeSlug) {
  return __async(this, null, function* () {
    const query = `query GetEpisodeLinks($episode_slug: String!) {
    detailEpisode(filter: {slug: $episode_slug, type_serie: "dorama"}) { links_online }
  }`;
    const r = yield dfGql("GetEpisodeLinks", query, { episode_slug: episodeSlug });
    return r && r.data && r.data.detailEpisode && r.data.detailEpisode.links_online || [];
  });
}
function gqlDetailMovie(slug) {
  return __async(this, null, function* () {
    const query = `query detailMovieExtra($slug: String!) {
    detailMovie(filter: {slug: $slug}) { name name_es links_online }
  }`;
    const r = yield dfGql("detailMovieExtra", query, { slug });
    return r && r.data ? r.data.detailMovie : null;
  });
}
function intentarGraphQL(mediaType, title, season, episode) {
  return __async(this, null, function* () {
    const isMovie = mediaType === "movie" || mediaType === "movies";
    const busqueda = yield gqlSearchAll(title);
    const candidatos = isMovie ? busqueda.movies : busqueda.doramas;
    if (!candidatos.length) return [];
    const tituloNorm = normalizarDF(title);
    const best = candidatos.find(
      (c) => c.name && normalizarDF(c.name) === tituloNorm || c.name_es && normalizarDF(c.name_es) === tituloNorm
    ) || candidatos[0];
    let linksOnline = [];
    if (isMovie) {
      const detalle = yield gqlDetailMovie(best.slug);
      linksOnline = detalle && detalle.links_online || [];
    } else {
      const seasons = yield gqlListSeasons(best._id);
      const seasonNum = parseInt(season) || 1;
      const seasonMatch = seasons.find((s) => s.season_number === seasonNum);
      if (!seasonMatch) return [];
      const episodes = yield gqlListEpisodes(best._id, seasonNum);
      const epNum = parseInt(episode) || 1;
      const epMatch = episodes.find((e) => e.episode_number === epNum);
      if (!epMatch) return [];
      linksOnline = yield gqlGetEpisodeLinks(epMatch.slug);
    }
    if (!linksOnline.length) return [];
    const resueltos = [];
    yield Promise.all(linksOnline.map((entrada) => __async(null, null, function* () {
      if (!entrada.link) return;
      try {
        const link = fixHostsLinks(entrada.link);
        const extractor = elegirExtractor(entrada.server, link);
        const resultado = yield extractor(link);
        if (resultado) {
          resueltos.push({
            name: "Doramasflix",
            title: `${IDIOMA_POR_ID[entrada.lang] || entrada.lang || "Latino"} \xB7 ${formatQuality(resultado.url) || "HD"} \xB7 Doramasflix`,
            url: resultado.url,
            quality: formatQuality(resultado.url) || "HD",
            headers: { "User-Agent": DORAMASFLIX_UA, Referer: resultado.referer }
          });
        }
      } catch (e) {
      }
    })));
    return resueltos;
  });
}
function slugifyDF(str) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
}
function decodeEmbedShortenerLink(embedShortenerUrl) {
  try {
    const m = embedShortenerUrl.match(/embedshortener\.co\/e\/([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)/);
    if (!m) return null;
    let payloadB64 = m[1].split(".")[1];
    payloadB64 += "=".repeat((4 - payloadB64.length % 4) % 4);
    const payload = JSON.parse(base64UrlDecode(payloadB64));
    let linkB64 = payload.link;
    linkB64 += "=".repeat((4 - linkB64.length % 4) % 4);
    return base64DecodeUtf8(linkB64);
  } catch (e) {
    return null;
  }
}
function extractServersDF(html) {
  const nombres = Array.from(html.matchAll(/\\"name\\":\\"([^\\]+)\\",\\"code_flix\\":\\"(\d+)\\"/g)).map((m) => ({ name: m[1], codeFlix: m[2] }));
  const jwts = Array.from(html.matchAll(/embedshortener\.co\/e\/([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)/g)).map((m) => m[1]);
  const linkPorServer = {};
  jwts.forEach((jwt) => {
    const linkReal = decodeEmbedShortenerLink("https://embedshortener.co/e/" + jwt);
    if (!linkReal) return;
    try {
      let payloadB64 = jwt.split(".")[1];
      payloadB64 += "=".repeat((4 - payloadB64.length % 4) % 4);
      const payload = JSON.parse(base64UrlDecode(payloadB64));
      linkPorServer[payload.server] = linkReal;
    } catch (e) {
    }
  });
  return nombres.map((n) => ({ name: n.name, embedUrl: linkPorServer[n.codeFlix] || null })).filter((s) => s.embedUrl);
}
const DORAMASFLIX_MOVIE_ACTION = "401316cb0a8d40ce7c6050c9eb9f73d896da2c8abf";
function parseFlightResponse(texto) {
  const valores = [];
  texto.split("\n").forEach((linea) => {
    const m = linea.match(/^\d+:(.+)$/);
    if (!m) return;
    try {
      valores.push(JSON.parse(m[1]));
    } catch (e) {
    }
  });
  for (const val of valores) {
    if (Array.isArray(val) && val.some((x) => x && typeof x === "object" && x.link)) {
      return val.filter((x) => x && x.link);
    }
  }
  return [];
}
function nombreDesdeHost(url) {
  const host = getHostname(url).replace(/^www\./, "");
  const base = host.split(".")[0];
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : "Doramasflix";
}
function obtenerServidoresPelicula(html, slug) {
  return __async(this, null, function* () {
    const slugEscapado = slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const idMatch = html.match(new RegExp('\\\\"_id\\\\":\\\\"([a-f0-9]{24})\\\\",\\\\"name\\\\":\\\\"[^\\\\]*\\\\",\\\\"slug\\\\":\\\\"' + slugEscapado + '\\\\"'));
    if (!idMatch) return [];
    const movieId = idMatch[1];
    try {
      const texto = yield fetchText(`${DORAMASFLIX_BASE}/peliculas/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=UTF-8", Accept: "text/x-component", "Next-Action": DORAMASFLIX_MOVIE_ACTION, Referer: `${DORAMASFLIX_BASE}/peliculas/${slug}`, Origin: DORAMASFLIX_BASE, "User-Agent": DORAMASFLIX_UA },
        body: JSON.stringify([{ movie_id: movieId }]),
        timeoutMs: 15e3
      });
      const entradas = parseFlightResponse(texto);
      return entradas.map((e) => {
        const embedUrl = decodeEmbedShortenerLink(e.link);
        return embedUrl ? { name: nombreDesdeHost(embedUrl), embedUrl } : null;
      }).filter(Boolean);
    } catch (e) {
      return [];
    }
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
function resolveUqload(embedUrl) {
  return __async(this, null, function* () {
    try {
      const html = yield fetchText(embedUrl, { headers: { Referer: DORAMASFLIX_BASE, "User-Agent": DORAMASFLIX_UA } });
      const candidatos = [html, unpackJS(html)].filter(Boolean);
      for (const c of candidatos) {
        const m = c.match(/sources:\s*\[\s*\{\s*file:\s*"([^"]+)"/) || c.match(/sources:\s*\["([^"]+)"/);
        if (m) return { url: m[1], referer: getOrigin(embedUrl) + "/" };
      }
      return null;
    } catch (e) {
      return null;
    }
  });
}
function resolveOkRu(embedUrl) {
  return __async(this, null, function* () {
    try {
      const html = yield fetchText(embedUrl, { headers: { Referer: DORAMASFLIX_BASE, "User-Agent": DORAMASFLIX_UA } });
      const m = html.match(/data-options="([^"]+)"/);
      if (!m) return null;
      const opts = JSON.parse(m[1].replace(/&quot;/g, '"'));
      const metadataStr = opts.metadata || opts.flashvars && opts.flashvars.metadata || "{}";
      const metadata = typeof metadataStr === "string" ? JSON.parse(metadataStr) : metadataStr;
      const videos = metadata.videos || [];
      if (!videos.length) return null;
      const orden = ["ultra", "quad", "full", "hd", "sd", "low", "lowest", "mobile"];
      videos.sort((a, b) => orden.indexOf(a.name) - orden.indexOf(b.name));
      return { url: videos[0].url, referer: "https://ok.ru/" };
    } catch (e) {
      return null;
    }
  });
}
function resolveDoodstream(embedUrl) {
  return __async(this, null, function* () {
    try {
      const html = yield fetchText(embedUrl, { headers: { Referer: embedUrl, "User-Agent": DORAMASFLIX_UA } });
      const passMd5Match = html.match(/\$\.get\('([^']*\/pass_md5\/[^']*)'/);
      const tokenMatch = html.match(/token=([a-zA-Z0-9]+)/);
      if (!passMd5Match || !tokenMatch) return null;
      let passMd5Url = passMd5Match[1];
      if (!passMd5Url.startsWith("http")) passMd5Url = getOrigin(embedUrl) + passMd5Url;
      const token = tokenMatch[1];
      const videoBaseUrl = (yield fetchText(passMd5Url, { headers: { Referer: embedUrl, "User-Agent": DORAMASFLIX_UA } })).trim();
      if (!videoBaseUrl) return null;
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let randomStr = "";
      for (let i = 0; i < 10; i++) randomStr += chars[Math.floor(Math.random() * 62)];
      const expiry = Math.floor(Date.now() / 1e3);
      return { url: `${videoBaseUrl}${randomStr}?token=${token}&expiry=${expiry}`, referer: getOrigin(embedUrl) + "/" };
    } catch (e) {
      return null;
    }
  });
}
function resolveStreamtape(embedUrl) {
  return __async(this, null, function* () {
    try {
      const videoPageUrl = embedUrl.replace("/e/", "/v/");
      const html = yield fetchText(videoPageUrl, { headers: { Referer: DORAMASFLIX_BASE, "User-Agent": DORAMASFLIX_UA } });
      const norobotMatch = html.match(/document\.getElementById\('norobotlink'\)\.innerHTML = (.+?);/);
      if (!norobotMatch) return null;
      const tokenMatch = norobotMatch[1].match(/token=([^&']+)/);
      if (!tokenMatch) return null;
      const token = tokenMatch[1];
      const idMatch = html.match(/id\s*=\s*["']i[d\w]*link["'][^>]*>([^<]+)</);
      if (!idMatch) return null;
      const path = idMatch[1].trim().replace(/^\/+/, "");
      let url = path.startsWith("http") ? path : "https://" + path;
      if (!/[?&]token=/.test(url)) url += (url.includes("?") ? "&" : "?") + "token=" + token;
      return { url, referer: getOrigin(embedUrl) + "/" };
    } catch (e) {
      return null;
    }
  });
}
const VOE_JUNK_PARTS = ["@$", "^^", "~@", "%?", "*~", "!!", "#&"];
function voeRot13(str) {
  return str.replace(/[a-zA-Z]/g, (c) => {
    const code = c.charCodeAt(0);
    const base = code >= 97 ? 97 : 65;
    return String.fromCharCode((code - base + 13) % 26 + base);
  });
}
function voeDecode(encoded) {
  let step2 = voeRot13(encoded);
  VOE_JUNK_PARTS.forEach((junk) => {
    step2 = step2.split(junk).join("_");
  });
  step2 = step2.split("_").join("");
  const step3 = base64DecodeUtf8(step2);
  const step4 = step3.split("").map((c) => String.fromCharCode(c.charCodeAt(0) - 3)).join("");
  const step5 = base64DecodeUtf8(step4.split("").reverse().join(""));
  return JSON.parse(step5);
}
function resolveVoe(embedUrl) {
  return __async(this, null, function* () {
    try {
      let extraerDe2 = function(html2) {
        const bloques = Array.from(html2.matchAll(/<script\s+type=["']application\/json["']>([\s\S]*?)<\/script>/g)).map((m) => m[1]);
        for (const b of bloques) {
          try {
            const decoded = voeDecode(JSON.parse(b.trim()));
            if (decoded.source) return decoded.source;
          } catch (e) {
          }
        }
        const m2 = html2.match(/var a168c='([^']+)'/);
        if (m2) {
          try {
            const decoded2 = voeDecode(m2[1]);
            if (decoded2.source) return decoded2.source;
          } catch (e) {
          }
        }
        const m3 = html2.match(/'hls':\s*'([^']+)'/);
        if (m3) return m3[1];
        return null;
      };
      var extraerDe = extraerDe2;
      let html = yield fetchText(embedUrl, { headers: { Referer: DORAMASFLIX_BASE, "User-Agent": DORAMASFLIX_UA } });
      let source = extraerDe2(html);
      if (!source) {
        const redirectMatch = html.match(/['"](\s*https?:\/\/[^'"<>\s]+\/e\/[^'"<>\s]+)['"]/);
        if (redirectMatch) {
          html = yield fetchText(redirectMatch[1].trim(), { headers: { Referer: DORAMASFLIX_BASE, "User-Agent": DORAMASFLIX_UA } });
          source = extraerDe2(html);
        }
      }
      if (!source) return null;
      return { url: source, referer: getOrigin(embedUrl) + "/" };
    } catch (e) {
      return null;
    }
  });
}
function resolvePrimeload(embedUrl) {
  return __async(this, null, function* () {
    try {
      const html = yield fetchText(embedUrl, { headers: { Referer: DORAMASFLIX_BASE, "User-Agent": DORAMASFLIX_UA } });
      const iframeMatch = html.match(/<iframe[^>]+id=["']sf-player-frame["'][^>]+src=["']([^"']+)["']/) || html.match(/<iframe[^>]+src=["']([^"']+)["']/);
      if (!iframeMatch) return null;
      let playerUrl = iframeMatch[1];
      if (playerUrl.startsWith("//")) playerUrl = "https:" + playerUrl;
      return yield resolveGenerico(playerUrl);
    } catch (e) {
      return null;
    }
  });
}
function resolveGenerico(embedUrl) {
  return __async(this, null, function* () {
    try {
      const html = yield fetchText(embedUrl, { headers: { Referer: DORAMASFLIX_BASE, "User-Agent": DORAMASFLIX_UA } });
      const patrones = [
        /sources:\s*\[\s*\{\s*file:\s*"([^"]+)"/,
        /source:\s*"([^"]+\.m3u8[^"]*)"/,
        /file:\s*"([^"]+\.m3u8[^"]*)"/,
        /"file":"([^"]+\.m3u8[^"]*)"/,
        /src:\s*"([^"]+\.m3u8[^"]*)"/,
        /https?:\/\/[^\s"'\\<>]+\.m3u8[^\s"'\\<>]*/,
        /file:\s*"([^"]+\.mp4[^"]*)"/,
        /https?:\/\/[^\s"'\\<>]+\.mp4[^\s"'\\<>]*/
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
function fixHostsLinks(url) {
  return url.replace("https://hglink.to", "https://streamwish.to").replace("https://swdyu.com", "https://streamwish.to").replace("https://cybervynx.com", "https://streamwish.to").replace("https://dumbalag.com", "https://streamwish.to").replace("https://mivalyo.com", "https://vidhidepro.com").replace("https://dinisglows.com", "https://vidhidepro.com").replace("https://dhtpre.com", "https://vidhidepro.com").replace("https://filemoon.link", "https://filemoon.sx").replace("https://sblona.com", "https://watchsb.com").replace("https://lulu.st", "https://lulustream.com").replace("https://uqload.io", "https://uqload.com").replace("https://uqload.cx", "https://uqload.com").replace("https://do7go.com", "https://dood.la");
}
function elegirExtractor(name, embedUrl) {
  const n = (name || "").toLowerCase();
  if (n === "uqload") return resolveUqload;
  if (n === "ok") return resolveOkRu;
  if (n === "voe") return resolveVoe;
  if (n === "dood") return resolveDoodstream;
  if (n === "streamtape") return resolveStreamtape;
  if (n === "primeload") return resolvePrimeload;
  const host = getHostname(embedUrl).toLowerCase();
  if (host.includes("uqload")) return resolveUqload;
  if (host.includes("ok.ru")) return resolveOkRu;
  if (host.includes("voe.")) return resolveVoe;
  if (host.includes("streamtape")) return resolveStreamtape;
  return resolveGenerico;
}
function formatQuality(url) {
  if (/2160|4k/i.test(url)) return "4K";
  if (/1080/.test(url)) return "1080p";
  if (/720/.test(url)) return "720p";
  if (/480/.test(url)) return "480p";
  return "";
}
function findDoramasflixPageHTML(mediaType, season, episode, title) {
  return __async(this, null, function* () {
    const isMovie = mediaType === "movie" || mediaType === "movies";
    const slug = slugifyDF(title);
    if (!slug) return null;
    const url = isMovie ? `${DORAMASFLIX_BASE}/peliculas/${slug}` : `${DORAMASFLIX_BASE}/capitulos/${slug}-${season || 1}x${episode || 1}`;
    try {
      const html = yield fetchText(url, { headers: { "User-Agent": DORAMASFLIX_UA, Referer: DORAMASFLIX_BASE } });
      if (!isMovie) {
        const servidores = extractServersDF(html);
        if (servidores.length > 0) return { html, url, slug };
        return null;
      }
      const slugEscapado = slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const esLaPeliculaCorrecta = new RegExp('\\\\"_id\\\\":\\\\"[a-f0-9]{24}\\\\",\\\\"name\\\\":\\\\"[^\\\\]*\\\\",\\\\"slug\\\\":\\\\"' + slugEscapado + '\\\\"').test(html);
      return esLaPeliculaCorrecta ? { html, url, slug } : null;
    } catch (e) {
      return null;
    }
  });
}
function intentarHTML(mediaType, title, season, episode) {
  return __async(this, null, function* () {
    const isMovie = mediaType === "movie" || mediaType === "movies";
    const pagina = yield findDoramasflixPageHTML(mediaType, season, episode, title);
    if (!pagina) return [];
    const servidores = isMovie ? yield obtenerServidoresPelicula(pagina.html, pagina.slug) : extractServersDF(pagina.html);
    if (!servidores.length) return [];
    const resueltos = [];
    yield Promise.all(servidores.map((s) => __async(null, null, function* () {
      try {
        const extractor = elegirExtractor(s.name, s.embedUrl);
        const resultado = yield extractor(s.embedUrl);
        if (resultado) {
          resueltos.push({
            name: "Doramasflix",
            title: `Latino \xB7 ${formatQuality(resultado.url) || "HD"} \xB7 ${s.name}`,
            url: resultado.url,
            quality: formatQuality(resultado.url) || "HD",
            headers: { "User-Agent": DORAMASFLIX_UA, Referer: resultado.referer }
          });
        }
      } catch (e) {
      }
    })));
    return resueltos;
  });
}
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    const info = yield getTmdbInfoDF(tmdbId, mediaType);
    const title = info.title;
    if (!title) return [];
    try {
      const streams = yield intentarGraphQL(mediaType, title, season, episode);
      if (streams && streams.length) return streams;
    } catch (e) {
      console.log("[Doramasflix] GraphQL fallo: " + e.message);
    }
    try {
      const streams2 = yield intentarHTML(mediaType, title, season, episode);
      if (streams2 && streams2.length) return streams2;
    } catch (e2) {
      console.log("[Doramasflix] Respaldo HTML tambien fallo: " + e2.message);
    }
    return [];
  });
}
module.exports = { getStreams };
