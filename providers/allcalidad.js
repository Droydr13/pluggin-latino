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
const ALLCALIDAD_BASE = "https://allcalidad.re";
const ALLCALIDAD_API = ALLCALIDAD_BASE + "/api/rest";
const TMDB_API_KEY_AC = "439c478a771f35c05022f9feabcca01c";
const AC_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
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
function fetchJson(url, opts) {
  return __async(this, null, function* () {
    const o = Object.assign({ headers: { "User-Agent": AC_UA } }, opts, { signal: timeoutSignal(opts && opts.timeoutMs || 15e3) });
    delete o.timeoutMs;
    const res = yield fetch(url, o);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });
}
function acFetchJson(url) {
  return __async(this, null, function* () {
    try {
      return yield fetchJson(url);
    } catch (e) {
      return null;
    }
  });
}
function getOrigin(url) {
  const m = url.match(/^([a-z]+:\/\/[^\/]+)/i);
  return m ? m[1] : url;
}
function normalizarAC(s) {
  return (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
function getTmdbTitleAC(tmdbId, mediaType) {
  return __async(this, null, function* () {
    const type = mediaType === "movie" ? "movie" : "tv";
    const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_API_KEY_AC}&language=es-MX`;
    try {
      const res = yield fetch(url, { signal: timeoutSignal(1e4) });
      const data = yield res.json();
      const tituloEs = type === "movie" ? data.title || data.original_title : data.name || data.original_name;
      const tituloOriginal = type === "movie" ? data.original_title : data.original_name;
      return { tituloEs, tituloOriginal };
    } catch (e) {
      return null;
    }
  });
}
const STOP_WORDS_AC = /* @__PURE__ */ new Set(["the", "and", "for", "with", "from", "this", "that", "los", "las", "del", "una", "uno", "de", "la", "el", "en", "con", "por", "para"]);
function limpiarRuidoAC(s) {
  return s.replace(/\([^)]*\)/g, " ").replace(/\[[^\]]*\]/g, " ").replace(/\b(latino|castellano|subtitulado|sub espanol|hd|4k|temporada\s*\d+)\b/gi, " ").replace(/\b(19|20)\d{2}\b/g, " ").replace(/\s+/g, " ").trim();
}
function similitud(a, b) {
  a = limpiarRuidoAC(a);
  b = limpiarRuidoAC(b);
  if (a === b) return 1;
  if (!a.length || !b.length) return 0;
  let puntajeSubstring = 0;
  const [corto, largo] = a.length <= b.length ? [a, b] : [b, a];
  if (largo.includes(corto)) puntajeSubstring = corto.length / largo.length;
  const palabrasA = new Set(a.split(/\s+/).filter((p) => p.length > 2 && !STOP_WORDS_AC.has(p)));
  const palabrasB = new Set(b.split(/\s+/).filter((p) => p.length > 2 && !STOP_WORDS_AC.has(p)));
  let puntajePalabras = 0;
  if (palabrasA.size && palabrasB.size) {
    let coincidencias = 0;
    for (const p of palabrasA) if (palabrasB.has(p)) coincidencias++;
    puntajePalabras = coincidencias / Math.max(palabrasA.size, palabrasB.size);
  }
  return Math.max(puntajeSubstring, puntajePalabras);
}
function mejorCoincidencia(posts, candidatosTitulo) {
  let mejor = null, mejorPuntaje = 0;
  for (const post of posts) {
    if (!post.title) continue;
    const tituloPost = normalizarAC(post.title);
    for (const candidato of candidatosTitulo) {
      if (!candidato) continue;
      const puntaje = similitud(tituloPost, normalizarAC(candidato));
      if (puntaje > mejorPuntaje) { mejorPuntaje = puntaje; mejor = post; }
    }
  }
  // Umbral: si ni el mejor resultado se parece razonablemente (la mitad
  // de las palabras en comun, o uno es substring del otro con buena
  // proporcion), mejor no devolver nada que devolver contenido
  // equivocado -- que es justo lo que se estaba reportando.
  return mejorPuntaje >= 0.5 ? mejor : null;
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
      const res = yield fetch(embedUrl, { headers: { Referer: ALLCALIDAD_BASE, "User-Agent": AC_UA }, signal: timeoutSignal(15e3) });
      const html = yield res.text();
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
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      const titulos = yield getTmdbTitleAC(tmdbId, mediaType);
      if (!titulos || !titulos.tituloEs) return [];
      const isMovie = mediaType === "movie" || mediaType === "movies";
      const postTypes = isMovie ? "movies" : "tvshows,animes";
      const buscar = yield acFetchJson(`${ALLCALIDAD_API}/search?query=${encodeURIComponent(titulos.tituloEs)}&page=1&post_type=${postTypes}&posts_per_page=24`);
      let posts = buscar && buscar.data && buscar.data.posts || [];
      // Si buscar por el titulo en espanol no trajo nada, se intenta de
      // nuevo con el titulo original (a veces el sitio solo indexa uno
      // de los dos).
      if (!posts.length && titulos.tituloOriginal && titulos.tituloOriginal !== titulos.tituloEs) {
        const buscar2 = yield acFetchJson(`${ALLCALIDAD_API}/search?query=${encodeURIComponent(titulos.tituloOriginal)}&page=1&post_type=${postTypes}&posts_per_page=24`);
        posts = buscar2 && buscar2.data && buscar2.data.posts || [];
      }
      if (!posts.length) return [];
      const best = mejorCoincidencia(posts, [titulos.tituloEs, titulos.tituloOriginal]);
      if (!best) return [];
      let postIdParaPlayer = best._id;
      if (!isMovie && season && episode) {
        const epsResp = yield acFetchJson(`${ALLCALIDAD_API}/episodes?post_id=${best._id}`);
        const eps = epsResp && epsResp.data || [];
        const ep = eps.find((e) => e.season_number === parseInt(season) && e.episode_number === parseInt(episode));
        if (!ep) return [];
        postIdParaPlayer = ep._id;
      }
      const playerResp = yield acFetchJson(`${ALLCALIDAD_API}/player?post_id=${postIdParaPlayer}&_any=1`);
      const embeds = playerResp && playerResp.data && playerResp.data.embeds || [];
      if (!embeds.length) return [];
      const resueltos = [];
      yield Promise.all(embeds.map((embed) => __async(null, null, function* () {
        if (!embed.url || !embed.url.startsWith("http")) return;
        try {
          const resultado = yield resolveGenerico(embed.url);
          if (resultado) {
            const langAC = (embed.lang && String(embed.lang).trim()) || "Latino";
            const qualityAC = (embed.quality && String(embed.quality).trim()) || "HD";
            resueltos.push({
              name: "AllCalidad",
              title: `${langAC} \xB7 ${qualityAC}`,
              url: resultado.url,
              quality: qualityAC,
              headers: { "User-Agent": AC_UA, Referer: resultado.referer }
            });
          }
        } catch (e) {
        }
      })));
      return resueltos;
    } catch (e) {
      console.log("[AllCalidad] Error: " + e.message);
      return [];
    }
  });
}
module.exports = { getStreams };
