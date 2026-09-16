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
const PELIFLIX_HTML_BASE = "https://pelisflixhd.blog";
const PELIFLIX_GQL_A = "https://doraflix.fluxcedene.net/api/gql";
const PELIFLIX_GQL_B = "https://fluxcedene.net/api/gql";
const PELIFLIX_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const TMDB_API_KEY_PF = "439c478a771f35c05022f9feabcca01c";
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
    const o = Object.assign({ headers: { "User-Agent": PELIFLIX_UA } }, opts, { signal: timeoutSignal(opts && opts.timeoutMs || 15e3) });
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
function getOrigin(url) {
  const m = url.match(/^([a-z]+:\/\/[^\/]+)/i);
  return m ? m[1] : url;
}
function normalizarPF(s) {
  return (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
function getTmdbTitlePF(tmdbId) {
  return __async(this, null, function* () {
    const url = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY_PF}&language=es-MX`;
    try {
      const res = yield fetch(url, { signal: timeoutSignal(1e4) });
      const data = yield res.json();
      return data.title || data.original_title;
    } catch (e) {
      return null;
    }
  });
}
function pfGql(endpoint, operationName, query, variables, headersExtra) {
  return __async(this, null, function* () {
    try {
      const res = yield fetch(endpoint, {
        method: "POST",
        headers: Object.assign({ "User-Agent": PELIFLIX_UA, "Content-Type": "application/json; charset=utf-8" }, headersExtra || {}),
        body: JSON.stringify({ operationName, query, variables }),
        signal: timeoutSignal(15e3)
      });
      if (!res.ok) return null;
      return res.json();
    } catch (e) {
      return null;
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
function resolveOkRu(embedUrl) {
  return __async(this, null, function* () {
    const html = yield fetchText(embedUrl, { headers: { Referer: PELIFLIX_HTML_BASE, "User-Agent": PELIFLIX_UA } });
    const dataMatch = html.match(/data-options="([^"]+)"/);
    if (!dataMatch) throw new Error("sin data-options en ok.ru");
    const decoded = dataMatch[1].replace(/&quot;/g, '"');
    const json = JSON.parse(decoded);
    const metadataStr = json.flashvars && json.flashvars.metadata;
    if (!metadataStr) throw new Error("sin metadata en ok.ru");
    const metadata = JSON.parse(metadataStr);
    const videos = metadata.videos || [];
    const orden = { ultra: 5, quad: 4, full: 3, hd: 2, sd: 1, low: 0, lowest: -1, mobile: -2 };
    videos.sort((a, b) => (orden[b.name] || 0) - (orden[a.name] || 0));
    if (!videos.length) throw new Error("ok.ru sin videos");
    return { url: videos[0].url.replace(/\\u0026/g, "&"), quality: (videos[0].name || "HD").toUpperCase() };
  });
}
function resolveGenerico(embedUrl) {
  return __async(this, null, function* () {
    try {
      if (embedUrl.includes("ok.ru") || embedUrl.includes("odnoklassniki")) {
        const r = yield resolveOkRu(embedUrl);
        return { url: r.url, referer: getOrigin(embedUrl) + "/" };
      }
      const html = yield fetchText(embedUrl, { headers: { Referer: PELIFLIX_HTML_BASE, "User-Agent": PELIFLIX_UA } });
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
function resolverLista(entradas, obtenerLink) {
  return __async(this, null, function* () {
    const resueltos = [];
    yield Promise.all(entradas.map((entrada) => __async(null, null, function* () {
      try {
        const rawUrl = obtenerLink(entrada);
        if (!rawUrl) return;
        const r = yield resolveGenerico(rawUrl);
        if (r) {
          resueltos.push({
            name: "PeliculasFlix",
            title: `${entrada.lang || "Latino"} \xB7 HD`,
            url: r.url,
            quality: "HD",
            headers: { "User-Agent": PELIFLIX_UA, Referer: r.referer }
          });
        }
      } catch (e) {
      }
    })));
    return resueltos;
  });
}
function intentarGraphQLPropio(title) {
  return __async(this, null, function* () {
    const queryBusqueda = `query searchFilm($input: String!) { searchFilm(input: $input, limit: 5) { _id slug title name name_es poster_path poster __typename } }`;
    const rBusqueda = yield pfGql(PELIFLIX_GQL_A, "searchFilm", queryBusqueda, { input: title });
    const candidatos = rBusqueda && rBusqueda.data && rBusqueda.data.searchFilm || [];
    if (!candidatos.length) return [];
    const tituloNorm = normalizarPF(title);
    const best = candidatos.find((c) => normalizarPF(c.title || c.name || "") === tituloNorm) || candidatos[0];
    const queryDetalle = `query detailFilm($slug: String!) { detailFilm(filter: {slug: $slug}) { name title name_es links_online { server lang link } } }`;
    const rDetalle = yield pfGql(PELIFLIX_GQL_A, "detailFilm", queryDetalle, { slug: best.slug });
    const linksOnline = rDetalle && rDetalle.data && rDetalle.data.detailFilm && rDetalle.data.detailFilm.links_online || [];
    if (!linksOnline.length) return [];
    return resolverLista(linksOnline, (e) => e.link);
  });
}
function intentarGraphQLKodi(title) {
  return __async(this, null, function* () {
    const queryBusqueda = `query searchAll($input: String!) { searchFilm(input: $input, limit: 10) { _id slug title name overview languages name_es poster_path poster __typename } }`;
    const rBusqueda = yield pfGql(PELIFLIX_GQL_B, "searchAll", queryBusqueda, { input: title });
    const candidatos = rBusqueda && rBusqueda.data && rBusqueda.data.searchFilm || [];
    if (!candidatos.length) return [];
    const tituloNorm = normalizarPF(title);
    const best = candidatos.find((c) => normalizarPF(c.title || c.name || "") === tituloNorm) || candidatos[0];
    const queryDetalle = `query detailFilm($slug: String!) { detailFilm(filter: {slug: $slug}) { name title name_es links_online { _id server lang link page __typename } } }`;
    const rDetalle = yield pfGql(PELIFLIX_GQL_B, "detailFilm", queryDetalle, { slug: best.slug });
    const linksOnline = rDetalle && rDetalle.data && rDetalle.data.detailFilm && rDetalle.data.detailFilm.links_online || [];
    if (!linksOnline.length) return [];
    return resolverLista(linksOnline, (e) => e.link);
  });
}
function intentarHTML(title) {
  return __async(this, null, function* () {
    const searchUrl = `${PELIFLIX_HTML_BASE}/busqueda/${encodeURIComponent(title)}`;
    const html = yield fetchText(searchUrl);
    const tituloNorm = normalizarPF(title);
    const regex = /<div[^>]*class="[^"]*movie-item[^"]*"[\s\S]{0,50}?<a\s+href="([^"]+)"[\s\S]{0,300}?class="[^"]*item-detail[^"]*"[^>]*>\s*<p[^>]*>([^<]+)</gi;
    const candidatos = [];
    let m;
    while ((m = regex.exec(html)) !== null) candidatos.push({ href: m[1], title: m[2].trim() });
    if (!candidatos.length) return [];
    const match = candidatos.find((c) => c.href.includes("/pelicula/") && normalizarPF(c.title) === tituloNorm) || candidatos.find((c) => c.href.includes("/pelicula/")) || candidatos[0];
    if (!match) return [];
    const htmlPagina = yield fetchText(match.href);
    const entradas = [];
    const regexServer = /<li[^>]*data-server="([^"]+)"/g;
    let m2;
    while ((m2 = regexServer.exec(htmlPagina)) !== null) {
      try {
        entradas.push({ link: base64DecodeUtf8(m2[1]), lang: "Latino" });
      } catch (e) {
      }
    }
    if (!entradas.length) return [];
    return resolverLista(entradas, (e) => e.link);
  });
}
function getStreams(tmdbId, mediaType) {
  return __async(this, null, function* () {
    if (mediaType !== "movie") return [];
    try {
      const title = yield getTmdbTitlePF(tmdbId);
      if (!title) return [];
      let resueltos = [];
      try {
        resueltos = yield intentarGraphQLPropio(title);
      } catch (e) {
      }
      if (!resueltos.length) {
        try {
          resueltos = yield intentarGraphQLKodi(title);
        } catch (e) {
        }
      }
      if (!resueltos.length) {
        try {
          resueltos = yield intentarHTML(title);
        } catch (e) {
        }
      }
      return resueltos;
    } catch (e) {
      console.log("[PeliculasFlix] Error: " + e.message);
      return [];
    }
  });
}
module.exports = { getStreams };
