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
function resolveOkRu(embedUrl) {
  return __async(this, null, function* () {
    const html = yield fetchText(embedUrl, { headers: { Referer: "https://ok.ru/" } });
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
    return { url: videos[0].url.replace(/\\u0026/g, "&"), referer: "https://ok.ru/" };
  });
}
const BLACKLIST_UNBUENDATO = ["netu", "waaw", "hqq", "mixdrop"];
function intentarApiUnbuendato(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    const rawId = String(tmdbId).split(":")[0];
    const isMovie = mediaType === "movie";
    let apiUrl = `https://cuevana.unbuendato.com/?id=${rawId}`;
    if (!isMovie && season && episode) apiUrl += `&season=${season}&episode=${episode}`;
    const res = yield fetch(apiUrl, { headers: { "User-Agent": CUEVANA_UA }, signal: timeoutSignal(1e4) });
    const data = yield res.json();
    if (!data || !data.success || !data.languages) return [];
    const entradas = [];
    for (const [langKey, servers] of Object.entries(data.languages)) {
      const lKey = langKey.toLowerCase();
      if (!lKey.includes("latino") && !lKey.includes("espa\xF1ol") && !lKey.includes("castellano")) continue;
      for (const [serverKey, url] of Object.entries(servers)) {
        if (!url) continue;
        const sKey = serverKey.toLowerCase();
        if (BLACKLIST_UNBUENDATO.some((b) => sKey.includes(b) || url.includes(b))) continue;
        entradas.push({ url, servidor: serverKey, idioma: lKey.includes("latino") ? "Latino" : "Castellano" });
      }
    }
    if (!entradas.length) return [];
    const vistos = /* @__PURE__ */ new Set();
    const resueltos = [];
    yield Promise.all(entradas.map((e) => __async(null, null, function* () {
      if (vistos.has(e.url)) return;
      vistos.add(e.url);
      try {
        const r = e.url.includes("ok.ru") ? yield resolveOkRu(e.url) : yield resolveGenerico(e.url, "https://cuevana.unbuendato.com/");
        if (r) {
          resueltos.push({ name: "Cuevana", title: `${e.servidor} \xB7 ${e.idioma}`, url: r.url, quality: "HD", headers: { "User-Agent": CUEVANA_UA, Referer: r.referer } });
        }
      } catch (err) {
      }
    })));
    return resueltos;
  });
}
function intentarSubmenuWv3(title, isMovie, season, episode) {
  return __async(this, null, function* () {
    const base = "https://wv3.cuevana3.eu";
    const html = yield fetchText(`${base}/search?q=${encodeURIComponent(title)}`);
    const regex = /<a\s+href="([^"]+)"[^>]*class="[^"]*TPostMv[^"]*"|class="[^"]*TPostMv[^"]*"[^>]*>[\s\S]{0,20}?<a\s+href="([^"]+)"/gi;
    let targetHref = null, m;
    while ((m = regex.exec(html)) !== null) {
      const href = m[1] || m[2];
      const esSerie = href.includes("/serie/");
      if (isMovie && esSerie) continue;
      if (!isMovie && !esSerie) continue;
      targetHref = href;
      break;
    }
    if (!targetHref) return [];
    const showUrl = targetHref.startsWith("http") ? targetHref : base + "/" + targetHref.replace(/^\//, "");
    let targetUrl = showUrl;
    if (!isMovie && season && episode) {
      const htmlShow = yield fetchText(showUrl);
      const nextData = extraerNextData(htmlShow);
      const pageProps = getPageProps(nextData);
      const serie = pageProps && (pageProps.post || pageProps.thisSerie);
      const temporada = serie && serie.seasons && serie.seasons.find((s) => s.number === parseInt(season));
      const ep = temporada && (temporada.episodes || []).find((e) => e.number === parseInt(episode));
      if (ep && ep.url && ep.url.slug) {
        targetUrl = base + "/" + ep.url.slug.replace("series/", "serie/").replace("seasons/", "temporada/").replace("episodes/", "episodio/");
      }
    }
    const htmlContent = yield fetchText(targetUrl);
    const bloques = htmlContent.split(/(?=<li[^>]*class="[^"]*open_submenu[^"]*")/i).slice(1);
    const promesasSubmenu = [];
    for (const bloque of bloques) {
      const cabecera = bloque.slice(0, 150).toLowerCase();
      if (!cabecera.includes("latino") && !cabecera.includes("espa\xF1ol") && !cabecera.includes("castellano")) continue;
      const dataTrRegex = /class="[^"]*clili[^"]*"[^>]*data-tr="([^"]+)"/gi;
      let mTr;
      while ((mTr = dataTrRegex.exec(bloque)) !== null) {
        const dataTr = mTr[1];
        const iframeUrl = dataTr.startsWith("http") ? dataTr : base + "/" + dataTr.replace(/^\//, "");
        promesasSubmenu.push(
          fetchText(iframeUrl).then((htmlIframe) => {
            const mUrl = htmlIframe.match(/var url = '([^']+)'/);
            return mUrl ? mUrl[1] : null;
          }).catch(() => null)
        );
      }
    }
    const urls = (yield Promise.all(promesasSubmenu)).filter(Boolean);
    if (!urls.length) return [];
    const resueltos = [];
    yield Promise.all(urls.map((u) => __async(null, null, function* () {
      try {
        const r = u.includes("ok.ru") ? yield resolveOkRu(u) : yield resolveGenerico(u, base + "/");
        if (r) resueltos.push({ name: "Cuevana", title: `HD \xB7 Latino`, url: r.url, quality: "HD", headers: { "User-Agent": CUEVANA_UA, Referer: r.referer } });
      } catch (e) {
      }
    })));
    return resueltos;
  });
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
    if (!isMovie && (!season || !episode)) return [];
    try {
      const r1 = yield intentarApiUnbuendato(tmdbId, mediaType, season, episode);
      if (r1.length) return r1;
    } catch (e) {
    }
    const title = yield getTmdbInfoCuevana(tmdbId, mediaType);
    if (!title) return [];
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
    try {
      const r3 = yield intentarSubmenuWv3(title, isMovie, season, episode);
      if (r3.length) return r3;
    } catch (e) {
    }
    return [];
  });
}
module.exports = { getStreams };
