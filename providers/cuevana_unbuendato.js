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
const CUEVANA_MIRRORS = [
  "https://wv3.cuevana3.eu",
  "https://www.cuevana2.run",
  "https://www.cuevana2espanol.net"
];
const CUEVANA_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const TMDB_API_KEY_CU = "439c478a771f35c05022f9feabcca01c";
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
    const o = Object.assign({ headers: { "User-Agent": CUEVANA_UA } }, opts, { signal: timeoutSignal(opts && opts.timeoutMs || 15e3) });
    delete o.timeoutMs;
    const res = yield fetch(url, o);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
  });
}
function getOrigin(url) {
  const m = url.match(/^([a-z]+:\/\/[^\/]+)/i);
  return m ? m[1] : url;
}
function getTmdbInfoCuevana(tmdbId, mediaType) {
  return __async(this, null, function* () {
    const type = mediaType === "movie" ? "movie" : "tv";
    const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_API_KEY_CU}&language=es-MX`;
    try {
      const res = yield fetch(url, { signal: timeoutSignal(1e4) });
      const data = yield res.json();
      return type === "movie" ? data.title || data.original_title : data.name || data.original_name;
    } catch (e) {
      return null;
    }
  });
}
function extraerNextData(html) {
  const patrones = [
    /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/,
    /<script type="application\/json">([\s\S]*?)<\/script><script/
  ];
  for (const p of patrones) {
    const m = html.match(p);
    if (m) {
      try {
        return JSON.parse(m[1]);
      } catch (e) {
      }
    }
  }
  return null;
}
function getPageProps(nextData) {
  return nextData && nextData.props && nextData.props.pageProps || null;
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
function resolveGenerico(embedUrl, referer) {
  return __async(this, null, function* () {
    try {
      const html = yield fetchText(embedUrl, { headers: { Referer: referer, "User-Agent": CUEVANA_UA } });
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
const SERVIDORES_RENOMBRAR = { drive: "gvideo", fembed: "fembed", player: "oprem", openplay: "oprem", embed: "mystream" };
const SERVIDORES_IGNORAR = ["waaw", "jetload"];
function extraerPlayersDelJson(pageProps, esPelicula) {
  const contenedor = esPelicula ? pageProps.post : pageProps.episode;
  const players = contenedor && contenedor.players;
  if (!players) return [];
  const resultado = [];
  for (const idioma of Object.keys(players)) {
    if (!/latino|espa|castellano/i.test(idioma)) continue;
    for (const info of players[idioma] || []) {
      let servidor = (info.cyberlocker || "").toLowerCase();
      if (!servidor || !info.result) continue;
      if (SERVIDORES_IGNORAR.includes(servidor)) continue;
      if (SERVIDORES_RENOMBRAR[servidor]) servidor = SERVIDORES_RENOMBRAR[servidor];
      resultado.push({ servidor, url: info.result, idioma });
    }
  }
  return resultado;
}
function intentarMirror(base, title, isMovie, season, episode) {
  return __async(this, null, function* () {
    const html = yield fetchText(`${base}/search?q=${encodeURIComponent(title)}`);
    const regex = /<a\s+href="([^"]+)"[^>]*class="[^"]*TPostMv[^"]*"|class="[^"]*TPostMv[^"]*"[^>]*>[\s\S]{0,20}?<a\s+href="([^"]+)"/gi;
    const candidatos = [];
    let m;
    while ((m = regex.exec(html)) !== null) candidatos.push(m[1] || m[2]);
    if (!candidatos.length) return [];
    const targetHref = candidatos.find((h) => isMovie ? h.includes("/pelicula/") : h.includes("/serie/"));
    if (!targetHref) return [];
    const showUrl = targetHref.startsWith("http") ? targetHref : base + "/" + targetHref.replace(/^\//, "");
    const htmlShow = yield fetchText(showUrl);
    const nextDataShow = extraerNextData(htmlShow);
    const pagePropsShow = getPageProps(nextDataShow);
    if (!pagePropsShow) return [];
    if (isMovie) {
      const players2 = extraerPlayersDelJson(pagePropsShow, true);
      return players2.length ? { players: players2, referer: base + "/" } : [];
    }
    const serie = pagePropsShow.post || pagePropsShow.thisSerie;
    const temporadas = serie && serie.seasons;
    if (!temporadas) return [];
    const temporada = temporadas.find((s) => s.number === parseInt(season));
    const ep = temporada && (temporada.episodes || []).find((e) => e.number === parseInt(episode));
    if (!ep) return [];
    let episodeUrl;
    if (ep.url && ep.url.slug) {
      episodeUrl = base + "/" + ep.url.slug.replace("series/", "serie/").replace("seasons/", "temporada/").replace("episodes/", "episodio/");
    } else {
      episodeUrl = `${showUrl}/seasons/${season}/episodes/${episode}`;
    }
    const htmlEpisodio = yield fetchText(episodeUrl);
    const nextDataEp = extraerNextData(htmlEpisodio);
    const pagePropsEp = getPageProps(nextDataEp);
    if (!pagePropsEp) return [];
    const players = extraerPlayersDelJson(pagePropsEp, false);
    return players.length ? { players, referer: base + "/" } : [];
  });
}
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    const isMovie = mediaType === "movie";
    const title = yield getTmdbInfoCuevana(tmdbId, mediaType);
    if (!title) return [];
    if (!isMovie && (!season || !episode)) return [];
    for (const base of CUEVANA_MIRRORS) {
      try {
        const resultado = yield intentarMirror(base, title, isMovie, season, episode);
        if (!resultado || !resultado.players || !resultado.players.length) continue;
        const resueltos = [];
        yield Promise.all(resultado.players.map((p) => __async(null, null, function* () {
          try {
            const r = yield resolveGenerico(p.url, resultado.referer);
            const finalUrl = r ? r.url : p.url;
            resueltos.push({
              name: "Cuevana",
              title: `${p.servidor} \xB7 HD`,
              url: finalUrl,
              quality: "HD",
              headers: { "User-Agent": CUEVANA_UA, Referer: r ? r.referer : resultado.referer }
            });
          } catch (e) {
          }
        })));
        if (resueltos.length) return resueltos;
      } catch (e) {
        continue;
      }
    }
    return [];
  });
}
module.exports = { getStreams };
