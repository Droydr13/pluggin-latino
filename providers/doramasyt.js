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
const DORAMASYT_BASE = "https://doramasyt.com";
const DORAMASYT_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const TMDB_API_KEY_DY = "439c478a771f35c05022f9feabcca01c";
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
    const o = Object.assign({ headers: { "User-Agent": DORAMASYT_UA } }, opts, { signal: timeoutSignal(opts && opts.timeoutMs || 15e3) });
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
function normalizarDY(s) {
  return (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
function getTmdbTitleDY(tmdbId, mediaType) {
  return __async(this, null, function* () {
    const type = mediaType === "movie" ? "movie" : "tv";
    const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_API_KEY_DY}&language=es-MX`;
    try {
      const res = yield fetch(url, { signal: timeoutSignal(1e4) });
      const data = yield res.json();
      return type === "movie" ? data.title || data.original_title : data.name || data.original_name;
    } catch (e) {
      return null;
    }
  });
}
function fixHostsLinksDY(url) {
  return url.replace("https://hglink.to", "https://streamwish.to").replace("https://swdyu.com", "https://streamwish.to").replace("https://mivalyo.com", "https://vidhidepro.com").replace("https://filemoon.link", "https://filemoon.sx").replace("https://sblona.com", "https://watchsb.com");
}
const SERVIDORES_DY = { mxdrop: "Mixdrop", listeamed: "Vidguard", luluvdo: "Lulustream", dhcplay: "Streamwish", vide0: "Doodstream" };
function extraerResultadosDY(html) {
  const resultados = [];
  for (const claseCard of ["ficha_efecto", "col"]) {
    const regex = new RegExp(`<li[^>]*class="[^"]*${claseCard}[^"]*"[\\s\\S]{0,400}?<a\\s+href="([^"]+)"[\\s\\S]{0,300}?<h3[^>]*>([^<]+)<\\/h3>`, "gi");
    let m;
    while ((m = regex.exec(html)) !== null) resultados.push({ href: m[1], title: m[2].trim() });
    if (resultados.length) break;
  }
  return resultados;
}
function armarUrlPorPatron(targetHref, epNum) {
  return `${targetHref.replace("-sub-espanol", "").replace("/dorama/", "/ver/")}-episodio-${epNum}`;
}
function obtenerEpisodioViaApi(targetHref, epNum) {
  return __async(this, null, function* () {
    const html = yield fetchText(targetHref);
    const ajaxMatch = html.match(/class="[^"]*caplist[^"]*"[^>]*data-ajax="([^"]+)"/);
    const tokenMatch = html.match(/name="csrf-token"\s+content="([^"]+)"/);
    if (!ajaxMatch || !tokenMatch) return null;
    const serieId = ajaxMatch[1].split("/").pop();
    const apiUrl = `${DORAMASYT_BASE}/ajax/caplist/${serieId}`;
    const res = yield fetch(apiUrl, {
      method: "POST",
      headers: { "User-Agent": DORAMASYT_UA, "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8", Referer: targetHref },
      body: new URLSearchParams({ _token: tokenMatch[1], p: "1" }).toString(),
      signal: timeoutSignal(15e3)
    });
    const data = yield res.json();
    const caps = data && data.caps || [];
    const cap = caps.find((c) => parseInt(c.episodio) === epNum);
    return cap ? cap.url : null;
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
function resolveGenerico(embedUrl) {
  return __async(this, null, function* () {
    try {
      const html = yield fetchText(embedUrl, { headers: { Referer: DORAMASYT_BASE, "User-Agent": DORAMASYT_UA } });
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
function resolverBlobCifrado(dataPlayer) {
  return __async(this, null, function* () {
    const url = `${DORAMASYT_BASE}/reproductor?video=${dataPlayer}`;
    const html = yield fetchText(url, { headers: { Referer: DORAMASYT_BASE } });
    const m = html.match(/<iframe[^>]+src="([^"]+)"/);
    return m ? m[1] : null;
  });
}
function nombreDesdeHost(url) {
  const m = url.match(/^[a-z]+:\/\/([^\/:?#]+)/i);
  const host = m ? m[1].replace(/^www\./, "") : "";
  const base = host.split(".")[0];
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : "DoramasYT";
}
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      const title = yield getTmdbTitleDY(tmdbId, mediaType);
      if (!title) return [];
      const tituloNorm = normalizarDY(title);
      const searchHtml = yield fetchText(`${DORAMASYT_BASE}/buscar?q=${encodeURIComponent(title)}`);
      const resultados = extraerResultadosDY(searchHtml);
      if (!resultados.length) return [];
      const match = resultados.find((r) => normalizarDY(r.title) === tituloNorm) || resultados[0];
      const matchTitleLower = (match.title || "").toLowerCase();
      const idiomaDY = matchTitleLower.includes("latino") ? "Latino" : matchTitleLower.includes("castellano") ? "Castellano" : "VOSE";
      const targetHref = match.href.startsWith("http") ? match.href : DORAMASYT_BASE + "/" + match.href.replace(/^\//, "");
      let episodeUrl = targetHref;
      if (mediaType !== "movie" && episode) {
        const epNum = parseInt(episode);
        episodeUrl = armarUrlPorPatron(targetHref, epNum);
        try {
          const check = yield fetch(episodeUrl, { method: "HEAD", headers: { "User-Agent": DORAMASYT_UA }, signal: timeoutSignal(8e3) });
          if (!check.ok) throw new Error("patron no valido");
        } catch (e) {
          try {
            const urlApi = yield obtenerEpisodioViaApi(targetHref, epNum);
            if (urlApi) episodeUrl = urlApi.startsWith("http") ? urlApi : DORAMASYT_BASE + "/" + urlApi.replace(/^\//, "");
          } catch (e2) {
          }
        }
      }
      const html = yield fetchText(episodeUrl);
      const rawEntries = [];
      const regex = /<li[^>]*>[\s\S]{0,200}?class="[^"]*play-video[^"]*"[^>]*data-player="([^"]+)"[^>]*>([\s\S]*?)<\/button>/gi;
      let m;
      while ((m = regex.exec(html)) !== null) {
        rawEntries.push({ dataPlayer: m[1], texto: m[2].replace(/<[^>]+>/g, "").trim() });
      }
      const resueltos = [];
      yield Promise.all(rawEntries.map((_0) => __async(null, [_0], function* ({ dataPlayer, texto }) {
        try {
          let embedUrl = null;
          if (dataPlayer.includes("eyJpdi")) {
            embedUrl = yield resolverBlobCifrado(dataPlayer);
          } else {
            try {
              const decoded = base64DecodeUtf8(dataPlayer);
              embedUrl = decoded.startsWith("http") ? decoded.replace("https://monoschinos2.com/reproductor?url=", "") : null;
            } catch (e) {
            }
            if (!embedUrl && dataPlayer.startsWith("http")) embedUrl = dataPlayer;
          }
          if (!embedUrl) return;
          const fixedUrl = fixHostsLinksDY(embedUrl);
          const resultado = yield resolveGenerico(fixedUrl);
          if (resultado) {
            const nombreServidor = SERVIDORES_DY[texto.toLowerCase()] || nombreDesdeHost(fixedUrl);
            resueltos.push({
              name: "DoramasYT",
              title: `${idiomaDY} \xB7 HD \xB7 ${nombreServidor}`,
              url: resultado.url,
              quality: "HD",
              headers: { "User-Agent": DORAMASYT_UA, Referer: resultado.referer }
            });
          }
        } catch (e) {
        }
      })));
      return resueltos;
    } catch (e) {
      console.log("[DoramasYT] Error: " + e.message);
      return [];
    }
  });
}
module.exports = { getStreams };
