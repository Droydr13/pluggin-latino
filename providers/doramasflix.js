// providers/doramasflix.js
//
// DoramasFlix para Nuvio -- dos caminos:
//   1) PRINCIPAL: la API GraphQL interna del sitio (doraflix.fluxcedene.net),
//      que encontramos revisando el provider de CloudStream. Busca por
//      texto y devuelve los links_online directo, sin decodificar nada.
//   2) RESPALDO: si la API falla o no encuentra nada, se cae al scraper
//      HTML propio (el que ya venia probado a mano) -- decodifica el JWT
//      de embedshortener.co y tiene un resolutor por host (Uqload, OkRu,
//      Doodstream, Streamtape, VOE, Primeload, generico).
'use strict';

var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };// providers/doramasflix.js
//
// DoramasFlix para Nuvio -- dos caminos:
//   1) PRINCIPAL: la API GraphQL interna del sitio (doraflix.fluxcedene.net),
//      que encontramos revisando el provider de CloudStream. Busca por
//      texto y devuelve los links_online directo, sin decodificar nada.
//   2) RESPALDO: si la API falla o no encuentra nada, se cae al scraper
//      HTML propio (el que ya venia probado a mano) -- decodifica el JWT
//      de embedshortener.co y tiene un resolutor por host (Uqload, OkRu,
//      Doodstream, Streamtape, VOE, Primeload, generico).
'use strict';

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


var DORAMASFLIX_BASE = 'https://doramasflix.co';
var DORAMASFLIX_GQL = 'https://doraflix.fluxcedene.net/api/gql';
var DORAMASFLIX_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function dfHttpGet(url, extraHeaders) {
  var axios3 = require('axios');
  return axios3.get(url, {
    headers: Object.assign({ 'User-Agent': DORAMASFLIX_UA, 'Referer': DORAMASFLIX_BASE + '/' }, extraHeaders || {}),
    timeout: 15000,
    validateStatus: null,
  }).then(function (res) { return res.status === 200 ? res.data : null; }).catch(function () { return null; });
}

function dfGql(operationName, query, variables) {
  var axios3 = require('axios');
  var body = JSON.stringify({ operationName: operationName, query: query, variables: variables });
  return axios3.post(DORAMASFLIX_GQL, body, {
    headers: { 'User-Agent': DORAMASFLIX_UA, 'Content-Type': 'application/json; charset=utf-8' },
    timeout: 15000,
    validateStatus: null,
  }).then(function (res) { return res.status === 200 ? res.data : null; }).catch(function () { return null; });
}

// ==================== CAMINO PRINCIPAL: API GraphQL ====================

function gqlSearchAll(texto) {
  var query = 'query searchAll($input: String!) {\n  searchDorama(input: $input, limit: 5) {\n    _id\n slug\n name\n name_es\n poster_path\n isTVShow\n poster\n __typename\n  }\n  searchMovie(input: $input, limit: 5) {\n    _id\n name\n name_es\n slug\n poster_path\n poster\n __typename\n  }\n}\n';
  return dfGql('searchAll', query, { input: texto }).then(function (r) {
    return r && r.data ? { doramas: r.data.searchDorama || [], movies: r.data.searchMovie || [] } : { doramas: [], movies: [] };
  });
}

function gqlListSeasons(serieId) {
  var query = 'query listSeasons($serie_id: MongoID!) {\n  listSeasons(sort: NUMBER_ASC, filter: {serie_id: $serie_id}) {\n    slug\n season_number\n poster_path\n air_date\n serie_name\n poster\n backdrop\n __typename\n  }\n}\n';
  return dfGql('listSeasons', query, { serie_id: serieId }).then(function (r) {
    return (r && r.data && r.data.listSeasons) || [];
  });
}

function gqlListEpisodes(serieId, seasonNumber) {
  var query = 'query listEpisodesPagination($page: Int!, $serie_id: MongoID!, $season_number: Float!) {\n  paginationEpisode(\n    page: $page\n    perPage: 1000\n    sort: NUMBER_ASC\n    filter: {type_serie: "dorama", serie_id: $serie_id, season_number: $season_number}\n  ) {\n       items {\n      _id\n      name\n      still_path\n   overview\n   episode_number\n      season_number\n      air_date\n      slug\n      serie_id\n   season_poster\n      serie_poster\n      poster\n      backdrop\n      __typename\n    }\n    pageInfo {\n      hasNextPage\n      __typename\n    }\n    __typename\n  }\n}\n';
  return dfGql('listEpisodesPagination', query, { page: 1, serie_id: serieId, season_number: seasonNumber }).then(function (r) {
    return (r && r.data && r.data.paginationEpisode && r.data.paginationEpisode.items) || [];
  });
}

function gqlGetEpisodeLinks(episodeSlug) {
  var query = 'query GetEpisodeLinks($episode_slug: String!) {\n  detailEpisode(filter: {slug: $episode_slug, type_serie: "dorama"}) {\n    links_online\n   }\n}\n';
  return dfGql('GetEpisodeLinks', query, { episode_slug: episodeSlug }).then(function (r) {
    return (r && r.data && r.data.detailEpisode && r.data.detailEpisode.links_online) || [];
  });
}

function gqlDetailMovie(slug) {
  var query = 'query detailMovieExtra($slug: String!) {\n  detailMovie(filter: {slug: $slug}) {\n    name\n name_es\n overview\n languages\n popularity\n  poster_path\n poster\n  backdrop_path\n    backdrop\n    links_online\n    __typename\n genres {\n      name\n      slug\n      __typename\n    }\n labels {\n      name\n      slug\n      __typename\n    }\n  }\n}\n';
  return dfGql('detailMovieExtra', query, { slug: slug }).then(function (r) {
    return r && r.data ? r.data.detailMovie : null;
  });
}

var IDIOMA_POR_ID = { '13109': 'Coreano', '13110': 'Japones', '13111': 'Mandarin', '13112': 'Tailandes', '37': 'Castellano', '38': 'Latino', '192': 'Subtitulado' };

function normalizarTituloDF(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function intentarGraphQL(mediaType, title, year, season, episode) {
  return __async(this, null, function* () {
    var isMovie = mediaType === 'movie' || mediaType === 'movies';
    var busqueda = yield gqlSearchAll(title);
    var candidatos = isMovie ? busqueda.movies : busqueda.doramas;
    if (!candidatos.length) return [];

    var tituloNorm = normalizarTituloDF(title);
    var best = candidatos.find(function (c) {
      return (c.name && normalizarTituloDF(c.name) === tituloNorm) || (c.name_es && normalizarTituloDF(c.name_es) === tituloNorm);
    }) || candidatos[0];

    var linksOnline = [];
    if (isMovie) {
      var detalle = yield gqlDetailMovie(best.slug);
      linksOnline = (detalle && detalle.links_online) || [];
    } else {
      var seasons = yield gqlListSeasons(best._id);
      var seasonNum = parseInt(season) || 1;
      var seasonMatch = seasons.find(function (s) { return s.season_number === seasonNum; });
      if (!seasonMatch) return [];
      var episodes = yield gqlListEpisodes(best._id, seasonNum);
      var epNum = parseInt(episode) || 1;
      var epMatch = episodes.find(function (e) { return e.episode_number === epNum; });
      if (!epMatch) return [];
      linksOnline = yield gqlGetEpisodeLinks(epMatch.slug);
    }
    if (!linksOnline.length) return [];

    var resueltos = [];
    yield Promise.all(linksOnline.map(function (entrada) {
      if (!entrada.link) return Promise.resolve();
      var link = fixHostsLinksDF(entrada.link);
      var extractor = elegirExtractorDF(entrada.server, link);
      return extractor(link).then(function (resultado) {
        if (resultado) {
          resueltos.push({
            name: 'Doramasflix',
            title: (IDIOMA_POR_ID[entrada.lang] || entrada.lang || 'Latino') + ' \xB7 ' + (formatQualityDF(resultado.url) || 'HD'),
            url: resultado.url,
            headers: { 'User-Agent': DORAMASFLIX_UA, 'Referer': resultado.referer, 'Origin': (new URL(resultado.referer)).origin },
          });
        }
      }).catch(function () {});
    }));
    return resueltos;
  });
}

// ==================== RESPALDO: scraper HTML propio ====================
// Portado tal cual del scraper standalone que ya tenia probado a mano
// (decodificacion de embedshortener.co, resolutores por host).

function slugifyDF(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
}

function decodeEmbedShortenerLink(embedShortenerUrl) {
  try {
    var m = embedShortenerUrl.match(/embedshortener\.co\/e\/([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)/);
    if (!m) return null;
    var payloadB64 = m[1].split('.')[1];
    payloadB64 += '='.repeat((4 - payloadB64.length % 4) % 4);
    var payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    var linkB64 = payload.link;
    linkB64 += '='.repeat((4 - linkB64.length % 4) % 4);
    return Buffer.from(linkB64, 'base64').toString('utf8');
  } catch (e) { return null; }
}

function extractServersDF(html) {
  var nombres = Array.from(html.matchAll(/\\"name\\":\\"([^\\]+)\\",\\"code_flix\\":\\"(\d+)\\"/g)).map(function (m) { return { name: m[1], codeFlix: m[2] }; });
  var jwts = Array.from(html.matchAll(/embedshortener\.co\/e\/([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)/g)).map(function (m) { return m[1]; });
  var linkPorServer = {};
  jwts.forEach(function (jwt) {
    var linkReal = decodeEmbedShortenerLink('https://embedshortener.co/e/' + jwt);
    if (!linkReal) return;
    try {
      var payloadB64 = jwt.split('.')[1];
      payloadB64 += '='.repeat((4 - payloadB64.length % 4) % 4);
      var payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
      linkPorServer[payload.server] = linkReal;
    } catch (e) {}
  });
  return nombres.map(function (n) { return { name: n.name, embedUrl: linkPorServer[n.codeFlix] || null }; }).filter(function (s) { return s.embedUrl; });
}

var DORAMASFLIX_MOVIE_ACTION = '401316cb0a8d40ce7c6050c9eb9f73d896da2c8abf';

function parseFlightResponse(texto) {
  var valores = [];
  texto.split('\n').forEach(function (linea) {
    var m = linea.match(/^\d+:(.+)$/);
    if (!m) return;
    try { valores.push(JSON.parse(m[1])); } catch (e) {}
  });
  for (var i = 0; i < valores.length; i++) {
    var val = valores[i];
    if (Array.isArray(val) && val.some(function (x) { return x && typeof x === 'object' && x.link; })) {
      return val.filter(function (x) { return x && x.link; });
    }
  }
  return [];
}

function nombreDesdeHost(url) {
  try {
    var host = new URL(url).hostname.replace(/^www\./, '');
    var base = host.split('.')[0];
    return base.charAt(0).toUpperCase() + base.slice(1);
  } catch (e) { return 'Doramasflix'; }
}

function obtenerServidoresPelicula(html, slug) {
  return __async(this, null, function* () {
    var slugEscapado = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var idMatch = html.match(new RegExp('\\\\"_id\\\\":\\\\"([a-f0-9]{24})\\\\",\\\\"name\\\\":\\\\"[^\\\\]*\\\\",\\\\"slug\\\\":\\\\"' + slugEscapado + '\\\\"'));
    if (!idMatch) return [];
    var movieId = idMatch[1];
    var axios3 = require('axios');
    try {
      var res = yield axios3.post(
        DORAMASFLIX_BASE + '/peliculas/' + slug,
        JSON.stringify([{ movie_id: movieId }]),
        { headers: { 'User-Agent': DORAMASFLIX_UA, 'Content-Type': 'text/plain;charset=UTF-8', 'Accept': 'text/x-component', 'Next-Action': DORAMASFLIX_MOVIE_ACTION, 'Referer': DORAMASFLIX_BASE + '/peliculas/' + slug, 'Origin': DORAMASFLIX_BASE }, timeout: 15000, validateStatus: null }
      );
      if (res.status !== 200) return [];
      var texto = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
      var entradas = parseFlightResponse(texto);
      return entradas.map(function (e) {
        var embedUrl = decodeEmbedShortenerLink(e.link);
        return embedUrl ? { name: nombreDesdeHost(embedUrl), embedUrl: embedUrl } : null;
      }).filter(Boolean);
    } catch (e) { return []; }
  });
}

function unpackJS(code) {
  var m = code.match(/eval\(function\(p,a,c,k,e,d\)\{.*?\}\('(.*)',(\d+),(\d+),'(.*?)'\.split\('\|'\)/s);
  if (!m) return null;
  try {
    var payload0 = m[1], radixStr = m[2], dictStr = m[4];
    var radix = parseInt(radixStr, 10);
    var dict = dictStr.split('|');
    var payload = payload0.replace(/\\'/g, "'");
    return payload.replace(/\b\w+\b/g, function (word) {
      var idx = parseInt(word, radix);
      return (!isNaN(idx) && dict[idx] !== undefined && dict[idx] !== '') ? dict[idx] : word;
    });
  } catch (e) { return null; }
}

function resolveUqload(embedUrl) {
  return __async(this, null, function* () {
    var html = yield dfHttpGet(embedUrl, { Referer: DORAMASFLIX_BASE });
    if (!html) return null;
    var candidatos = [html, unpackJS(html)].filter(Boolean);
    for (var i = 0; i < candidatos.length; i++) {
      var m = candidatos[i].match(/sources:\s*\[\s*\{\s*file:\s*"([^"]+)"/) || candidatos[i].match(/sources:\s*\["([^"]+)"/);
      if (m) return { url: m[1], referer: new URL(embedUrl).origin + '/' };
    }
    return null;
  });
}

function resolveOkRu(embedUrl) {
  return __async(this, null, function* () {
    var html = yield dfHttpGet(embedUrl, { Referer: DORAMASFLIX_BASE });
    if (!html) return null;
    try {
      var cheerio3 = require('cheerio-without-node-native');
      var $ = cheerio3.load(html);
      var dataOptions = $('[data-options]').attr('data-options') || $('.vid-video_box').attr('data-options');
      if (!dataOptions) return null;
      var opts = JSON.parse(dataOptions.replace(/&quot;/g, '"'));
      var metadataStr = opts.metadata || (opts.flashvars && opts.flashvars.metadata) || '{}';
      var metadata = typeof metadataStr === 'string' ? JSON.parse(metadataStr) : metadataStr;
      var videos = metadata.videos || [];
      if (!videos.length) return null;
      var orden = ['ultra', 'quad', 'full', 'hd', 'sd', 'low', 'lowest', 'mobile'];
      videos.sort(function (a, b) { return orden.indexOf(a.name) - orden.indexOf(b.name); });
      return { url: videos[0].url, referer: 'https://ok.ru/' };
    } catch (e) { return null; }
  });
}

function resolveDoodstream(embedUrl) {
  return __async(this, null, function* () {
    var html = yield dfHttpGet(embedUrl, { Referer: embedUrl });
    if (!html) return null;
    try {
      var passMd5Match = html.match(/\$\.get\('([^']*\/pass_md5\/[^']*)'/);
      var tokenMatch = html.match(/token=([a-zA-Z0-9]+)/);
      if (!passMd5Match || !tokenMatch) return null;
      var passMd5Url = passMd5Match[1];
      if (!passMd5Url.startsWith('http')) passMd5Url = new URL(passMd5Url, embedUrl).href;
      var token = tokenMatch[1];
      var videoBaseUrl = (yield dfHttpGet(passMd5Url, { Referer: embedUrl })) || '';
      videoBaseUrl = ('' + videoBaseUrl).trim();
      if (!videoBaseUrl) return null;
      var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var randomStr = '';
      for (var i = 0; i < 10; i++) randomStr += chars[Math.floor(Math.random() * 62)];
      var expiry = Math.floor(Date.now() / 1000);
      return { url: videoBaseUrl + randomStr + '?token=' + token + '&expiry=' + expiry, referer: new URL(embedUrl).origin + '/' };
    } catch (e) { return null; }
  });
}

function resolveStreamtape(embedUrl) {
  return __async(this, null, function* () {
    var videoPageUrl = embedUrl.replace('/e/', '/v/');
    var html = yield dfHttpGet(videoPageUrl, { Referer: DORAMASFLIX_BASE });
    if (!html) return null;
    try {
      var norobotMatch = html.match(/document\.getElementById\('norobotlink'\)\.innerHTML = (.+?);/);
      if (!norobotMatch) return null;
      var tokenMatch = norobotMatch[1].match(/token=([^&']+)/);
      if (!tokenMatch) return null;
      var token = tokenMatch[1];
      var idMatch = html.match(/id\s*=\s*["']i[d\w]*link["'][^>]*>([^<]+)</);
      if (!idMatch) return null;
      var path = idMatch[1].trim().replace(/^\/+/, '');
      var url = path.startsWith('http') ? path : 'https://' + path;
      if (!/[?&]token=/.test(url)) url += (url.includes('?') ? '&' : '?') + 'token=' + token;
      return { url: url, referer: new URL(embedUrl).origin + '/' };
    } catch (e) { return null; }
  });
}

var VOE_JUNK_PARTS = ['@$', '^^', '~@', '%?', '*~', '!!', '#&'];
function voeRot13(str) {
  return str.replace(/[a-zA-Z]/g, function (c) {
    var code = c.charCodeAt(0);
    var base = code >= 97 ? 97 : 65;
    return String.fromCharCode((code - base + 13) % 26 + base);
  });
}
function voeDecode(encoded) {
  var step1 = voeRot13(encoded);
  var step2 = step1;
  VOE_JUNK_PARTS.forEach(function (junk) { step2 = step2.split(junk).join('_'); });
  step2 = step2.split('_').join('');
  var step3 = Buffer.from(step2, 'base64').toString('utf8');
  var step4 = step3.split('').map(function (c) { return String.fromCharCode(c.charCodeAt(0) - 3); }).join('');
  var step5 = Buffer.from(step4.split('').reverse().join(''), 'base64').toString('utf8');
  return JSON.parse(step5);
}
function resolveVoe(embedUrl) {
  return __async(this, null, function* () {
    var html = yield dfHttpGet(embedUrl, { Referer: DORAMASFLIX_BASE });
    if (!html) return null;

    function extraerDe(html2) {
      var bloques = Array.from(html2.matchAll(/<script\s+type=["']application\/json["']>([\s\S]*?)<\/script>/g)).map(function (m) { return m[1]; });
      for (var i = 0; i < bloques.length; i++) {
        try {
          var textoPlano = JSON.parse(bloques[i].trim());
          var decoded = voeDecode(textoPlano);
          if (decoded.source) return decoded.source;
        } catch (e) {}
      }
      var m2 = html2.match(/var a168c='([^']+)'/);
      if (m2) {
        try {
          var decoded2 = voeDecode(m2[1]);
          if (decoded2.source) return decoded2.source;
        } catch (e) {}
      }
      var m3 = html2.match(/'hls':\s*'([^']+)'/);
      if (m3) return m3[1];
      return null;
    }

    var source = extraerDe(html);
    if (!source) {
      var redirectMatch = html.match(/['"](\s*https?:\/\/[^'"<>\s]+\/e\/[^'"<>\s]+)['"]/);
      if (redirectMatch) {
        html = yield dfHttpGet(redirectMatch[1].trim(), { Referer: DORAMASFLIX_BASE });
        if (html) source = extraerDe(html);
      }
    }
    if (!source) return null;
    return { url: source, referer: new URL(embedUrl).origin + '/' };
  });
}

function resolvePrimeload(embedUrl) {
  return __async(this, null, function* () {
    var html = yield dfHttpGet(embedUrl, { Referer: DORAMASFLIX_BASE });
    if (!html) return null;
    var iframeMatch = html.match(/<iframe[^>]+id=["']sf-player-frame["'][^>]+src=["']([^"']+)["']/) || html.match(/<iframe[^>]+src=["']([^"']+)["']/);
    if (!iframeMatch) return null;
    var playerUrl = iframeMatch[1];
    if (playerUrl.startsWith('//')) playerUrl = 'https:' + playerUrl;
    return yield resolveGenerico(playerUrl);
  });
}

function resolveGenerico(embedUrl) {
  return __async(this, null, function* () {
    var html = yield dfHttpGet(embedUrl, { Referer: DORAMASFLIX_BASE });
    if (!html) return null;
    var patrones = [
      /sources:\s*\[\s*\{\s*file:\s*"([^"]+)"/,
      /source:\s*"([^"]+\.m3u8[^"]*)"/,
      /file:\s*"([^"]+\.m3u8[^"]*)"/,
      /"file":"([^"]+\.m3u8[^"]*)"/,
      /src:\s*"([^"]+\.m3u8[^"]*)"/,
      /https?:\/\/[^\s"'\\<>]+\.m3u8[^\s"'\\<>]*/,
      /file:\s*"([^"]+\.mp4[^"]*)"/,
      /https?:\/\/[^\s"'\\<>]+\.mp4[^\s"'\\<>]*/,
    ];
    for (var i = 0; i < patrones.length; i++) {
      var m = html.match(patrones[i]);
      if (m) return { url: m[1] || m[0], referer: new URL(embedUrl).origin + '/' };
    }
    var unpacked = unpackJS(html);
    if (unpacked) {
      for (var j = 0; j < patrones.length; j++) {
        var m2 = unpacked.match(patrones[j]);
        if (m2) return { url: m2[1] || m2[0], referer: new URL(embedUrl).origin + '/' };
      }
    }
    return null;
  });
}

function fixHostsLinksDF(url) {
  return url
    .replace('https://hglink.to', 'https://streamwish.to')
    .replace('https://swdyu.com', 'https://streamwish.to')
    .replace('https://cybervynx.com', 'https://streamwish.to')
    .replace('https://dumbalag.com', 'https://streamwish.to')
    .replace('https://mivalyo.com', 'https://vidhidepro.com')
    .replace('https://dinisglows.com', 'https://vidhidepro.com')
    .replace('https://dhtpre.com', 'https://vidhidepro.com')
    .replace('https://filemoon.link', 'https://filemoon.sx')
    .replace('https://sblona.com', 'https://watchsb.com')
    .replace('https://lulu.st', 'https://lulustream.com')
    .replace('https://uqload.io', 'https://uqload.com')
    .replace('https://uqload.cx', 'https://uqload.com')
    .replace('https://do7go.com', 'https://dood.la');
}

function elegirExtractorDF(name, embedUrl) {
  var n = (name || '').toLowerCase();
  if (n === 'uqload') return resolveUqload;
  if (n === 'ok') return resolveOkRu;
  if (n === 'voe') return resolveVoe;
  if (n === 'dood') return resolveDoodstream;
  if (n === 'streamtape') return resolveStreamtape;
  if (n === 'primeload') return resolvePrimeload;
  try {
    var host = new URL(embedUrl).hostname.toLowerCase();
    if (host.includes('uqload')) return resolveUqload;
    if (host.includes('ok.ru')) return resolveOkRu;
    if (host.includes('voe.')) return resolveVoe;
    if (host.includes('streamtape')) return resolveStreamtape;
  } catch (e) {}
  return resolveGenerico;
}

function formatQualityDF(url) {
  if (/2160|4k/i.test(url)) return '4K';
  if (/1080/.test(url)) return '1080p';
  if (/720/.test(url)) return '720p';
  if (/480/.test(url)) return '480p';
  return '';
}

function findDoramasflixPageHTML(mediaType, season, episode, allTitles) {
  return __async(this, null, function* () {
    var isMovie = mediaType === 'movie' || mediaType === 'movies';
    var probados = {};
    for (var i = 0; i < allTitles.length; i++) {
      var slug = slugifyDF(allTitles[i]);
      if (!slug || probados[slug]) continue;
      probados[slug] = true;
      var url = isMovie ? (DORAMASFLIX_BASE + '/peliculas/' + slug) : (DORAMASFLIX_BASE + '/capitulos/' + slug + '-' + (season || 1) + 'x' + (episode || 1));
      var html = yield dfHttpGet(url);
      if (!html) continue;
      if (!isMovie) {
        var servidores = extractServersDF(html);
        if (servidores.length > 0) return { html: html, url: url, slug: slug };
      } else {
        var slugEscapado = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        var esLaPeliculaCorrecta = new RegExp('\\\\"_id\\\\":\\\\"[a-f0-9]{24}\\\\",\\\\"name\\\\":\\\\"[^\\\\]*\\\\",\\\\"slug\\\\":\\\\"' + slugEscapado + '\\\\"').test(html);
        if (esLaPeliculaCorrecta) return { html: html, url: url, slug: slug };
      }
    }
    return null;
  });
}

function intentarHTML(mediaType, title, season, episode) {
  return __async(this, null, function* () {
    var isMovie = mediaType === 'movie' || mediaType === 'movies';
    var pagina = yield findDoramasflixPageHTML(mediaType, season, episode, [title]);
    if (!pagina) return [];

    var servidores;
    if (isMovie) {
      servidores = yield obtenerServidoresPelicula(pagina.html, pagina.slug);
    } else {
      servidores = extractServersDF(pagina.html);
    }
    if (!servidores.length) return [];

    var resueltos = [];
    yield Promise.all(servidores.map(function (s) {
      var extractor = elegirExtractorDF(s.name, s.embedUrl);
      return extractor(s.embedUrl).then(function (resultado) {
        if (resultado) {
          resueltos.push({
            name: 'Doramasflix',
            title: s.name + ' \xB7 ' + (formatQualityDF(resultado.url) || 'HD'),
            url: resultado.url,
            headers: { 'User-Agent': DORAMASFLIX_UA, Referer: resultado.referer, Origin: (new URL(resultado.referer)).origin },
          });
        }
      }).catch(function () {});
    }));
    return resueltos;
  });
}

function getStreams(tmdbId, mediaType, season, episode, title, year) {
  return __async(this, null, function* () {
    if (!title) return [];
    try {
      var streams = yield intentarGraphQL(mediaType, title, year, season, episode);
      if (streams && streams.length) return streams;
    } catch (e) {
      console.log('[Doramasflix] GraphQL fallo: ' + e.message);
    }
    try {
      var streams2 = yield intentarHTML(mediaType, title, season, episode);
      return streams2 || [];
    } catch (e2) {
      console.log('[Doramasflix] Respaldo HTML tambien fallo: ' + e2.message);
      return [];
    }
  });
}

module.exports = { getStreams: getStreams };
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


var DORAMASFLIX_BASE = 'https://doramasflix.co';
var DORAMASFLIX_GQL = 'https://doraflix.fluxcedene.net/api/gql';
var DORAMASFLIX_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function dfHttpGet(url, extraHeaders) {
  var axios3 = require('axios');
  return axios3.get(url, {
    headers: Object.assign({ 'User-Agent': DORAMASFLIX_UA, 'Referer': DORAMASFLIX_BASE + '/' }, extraHeaders || {}),
    timeout: 15000,
    validateStatus: null,
  }).then(function (res) { return res.status === 200 ? res.data : null; }).catch(function () { return null; });
}

function dfGql(operationName, query, variables) {
  var axios3 = require('axios');
  var body = JSON.stringify({ operationName: operationName, query: query, variables: variables });
  return axios3.post(DORAMASFLIX_GQL, body, {
    headers: { 'User-Agent': DORAMASFLIX_UA, 'Content-Type': 'application/json; charset=utf-8' },
    timeout: 15000,
    validateStatus: null,
  }).then(function (res) { return res.status === 200 ? res.data : null; }).catch(function () { return null; });
}

// ==================== CAMINO PRINCIPAL: API GraphQL ====================

function gqlSearchAll(texto) {
  var query = 'query searchAll($input: String!) {\n  searchDorama(input: $input, limit: 5) {\n    _id\n slug\n name\n name_es\n poster_path\n isTVShow\n poster\n __typename\n  }\n  searchMovie(input: $input, limit: 5) {\n    _id\n name\n name_es\n slug\n poster_path\n poster\n __typename\n  }\n}\n';
  return dfGql('searchAll', query, { input: texto }).then(function (r) {
    return r && r.data ? { doramas: r.data.searchDorama || [], movies: r.data.searchMovie || [] } : { doramas: [], movies: [] };
  });
}

function gqlListSeasons(serieId) {
  var query = 'query listSeasons($serie_id: MongoID!) {\n  listSeasons(sort: NUMBER_ASC, filter: {serie_id: $serie_id}) {\n    slug\n season_number\n poster_path\n air_date\n serie_name\n poster\n backdrop\n __typename\n  }\n}\n';
  return dfGql('listSeasons', query, { serie_id: serieId }).then(function (r) {
    return (r && r.data && r.data.listSeasons) || [];
  });
}

function gqlListEpisodes(serieId, seasonNumber) {
  var query = 'query listEpisodesPagination($page: Int!, $serie_id: MongoID!, $season_number: Float!) {\n  paginationEpisode(\n    page: $page\n    perPage: 1000\n    sort: NUMBER_ASC\n    filter: {type_serie: "dorama", serie_id: $serie_id, season_number: $season_number}\n  ) {\n       items {\n      _id\n      name\n      still_path\n   overview\n   episode_number\n      season_number\n      air_date\n      slug\n      serie_id\n   season_poster\n      serie_poster\n      poster\n      backdrop\n      __typename\n    }\n    pageInfo {\n      hasNextPage\n      __typename\n    }\n    __typename\n  }\n}\n';
  return dfGql('listEpisodesPagination', query, { page: 1, serie_id: serieId, season_number: seasonNumber }).then(function (r) {
    return (r && r.data && r.data.paginationEpisode && r.data.paginationEpisode.items) || [];
  });
}

function gqlGetEpisodeLinks(episodeSlug) {
  var query = 'query GetEpisodeLinks($episode_slug: String!) {\n  detailEpisode(filter: {slug: $episode_slug, type_serie: "dorama"}) {\n    links_online\n   }\n}\n';
  return dfGql('GetEpisodeLinks', query, { episode_slug: episodeSlug }).then(function (r) {
    return (r && r.data && r.data.detailEpisode && r.data.detailEpisode.links_online) || [];
  });
}

function gqlDetailMovie(slug) {
  var query = 'query detailMovieExtra($slug: String!) {\n  detailMovie(filter: {slug: $slug}) {\n    name\n name_es\n overview\n languages\n popularity\n  poster_path\n poster\n  backdrop_path\n    backdrop\n    links_online\n    __typename\n genres {\n      name\n      slug\n      __typename\n    }\n labels {\n      name\n      slug\n      __typename\n    }\n  }\n}\n';
  return dfGql('detailMovieExtra', query, { slug: slug }).then(function (r) {
    return r && r.data ? r.data.detailMovie : null;
  });
}

var IDIOMA_POR_ID = { '13109': 'Coreano', '13110': 'Japones', '13111': 'Mandarin', '13112': 'Tailandes', '37': 'Castellano', '38': 'Latino', '192': 'Subtitulado' };

function normalizarTituloDF(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function intentarGraphQL(mediaType, title, year, season, episode) {
  return __async(this, null, function* () {
    var isMovie = mediaType === 'movie' || mediaType === 'movies';
    var busqueda = yield gqlSearchAll(title);
    var candidatos = isMovie ? busqueda.movies : busqueda.doramas;
    if (!candidatos.length) return [];

    var tituloNorm = normalizarTituloDF(title);
    var best = candidatos.find(function (c) {
      return (c.name && normalizarTituloDF(c.name) === tituloNorm) || (c.name_es && normalizarTituloDF(c.name_es) === tituloNorm);
    }) || candidatos[0];

    var linksOnline = [];
    if (isMovie) {
      var detalle = yield gqlDetailMovie(best.slug);
      linksOnline = (detalle && detalle.links_online) || [];
    } else {
      var seasons = yield gqlListSeasons(best._id);
      var seasonNum = parseInt(season) || 1;
      var seasonMatch = seasons.find(function (s) { return s.season_number === seasonNum; });
      if (!seasonMatch) return [];
      var episodes = yield gqlListEpisodes(best._id, seasonNum);
      var epNum = parseInt(episode) || 1;
      var epMatch = episodes.find(function (e) { return e.episode_number === epNum; });
      if (!epMatch) return [];
      linksOnline = yield gqlGetEpisodeLinks(epMatch.slug);
    }
    if (!linksOnline.length) return [];

    var resueltos = [];
    yield Promise.all(linksOnline.map(function (entrada) {
      if (!entrada.link) return Promise.resolve();
      var link = fixHostsLinksDF(entrada.link);
      var extractor = elegirExtractorDF(entrada.server, link);
      return extractor(link).then(function (resultado) {
        if (resultado) {
          resueltos.push({
            name: 'Doramasflix',
            title: (IDIOMA_POR_ID[entrada.lang] || entrada.lang || 'Latino') + ' \xB7 ' + (formatQualityDF(resultado.url) || 'HD'),
            url: resultado.url,
            headers: { 'User-Agent': DORAMASFLIX_UA, 'Referer': resultado.referer, 'Origin': (new URL(resultado.referer)).origin },
          });
        }
      }).catch(function () {});
    }));
    return resueltos;
  });
}

// ==================== RESPALDO: scraper HTML propio ====================
// Portado tal cual del scraper standalone que ya tenia probado a mano
// (decodificacion de embedshortener.co, resolutores por host).

function slugifyDF(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
}

function decodeEmbedShortenerLink(embedShortenerUrl) {
  try {
    var m = embedShortenerUrl.match(/embedshortener\.co\/e\/([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)/);
    if (!m) return null;
    var payloadB64 = m[1].split('.')[1];
    payloadB64 += '='.repeat((4 - payloadB64.length % 4) % 4);
    var payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    var linkB64 = payload.link;
    linkB64 += '='.repeat((4 - linkB64.length % 4) % 4);
    return Buffer.from(linkB64, 'base64').toString('utf8');
  } catch (e) { return null; }
}

function extractServersDF(html) {
  var nombres = Array.from(html.matchAll(/\\"name\\":\\"([^\\]+)\\",\\"code_flix\\":\\"(\d+)\\"/g)).map(function (m) { return { name: m[1], codeFlix: m[2] }; });
  var jwts = Array.from(html.matchAll(/embedshortener\.co\/e\/([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)/g)).map(function (m) { return m[1]; });
  var linkPorServer = {};
  jwts.forEach(function (jwt) {
    var linkReal = decodeEmbedShortenerLink('https://embedshortener.co/e/' + jwt);
    if (!linkReal) return;
    try {
      var payloadB64 = jwt.split('.')[1];
      payloadB64 += '='.repeat((4 - payloadB64.length % 4) % 4);
      var payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
      linkPorServer[payload.server] = linkReal;
    } catch (e) {}
  });
  return nombres.map(function (n) { return { name: n.name, embedUrl: linkPorServer[n.codeFlix] || null }; }).filter(function (s) { return s.embedUrl; });
}

var DORAMASFLIX_MOVIE_ACTION = '401316cb0a8d40ce7c6050c9eb9f73d896da2c8abf';

function parseFlightResponse(texto) {
  var valores = [];
  texto.split('\n').forEach(function (linea) {
    var m = linea.match(/^\d+:(.+)$/);
    if (!m) return;
    try { valores.push(JSON.parse(m[1])); } catch (e) {}
  });
  for (var i = 0; i < valores.length; i++) {
    var val = valores[i];
    if (Array.isArray(val) && val.some(function (x) { return x && typeof x === 'object' && x.link; })) {
      return val.filter(function (x) { return x && x.link; });
    }
  }
  return [];
}

function nombreDesdeHost(url) {
  try {
    var host = new URL(url).hostname.replace(/^www\./, '');
    var base = host.split('.')[0];
    return base.charAt(0).toUpperCase() + base.slice(1);
  } catch (e) { return 'Doramasflix'; }
}

function obtenerServidoresPelicula(html, slug) {
  return __async(this, null, function* () {
    var slugEscapado = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var idMatch = html.match(new RegExp('\\\\"_id\\\\":\\\\"([a-f0-9]{24})\\\\",\\\\"name\\\\":\\\\"[^\\\\]*\\\\",\\\\"slug\\\\":\\\\"' + slugEscapado + '\\\\"'));
    if (!idMatch) return [];
    var movieId = idMatch[1];
    var axios3 = require('axios');
    try {
      var res = yield axios3.post(
        DORAMASFLIX_BASE + '/peliculas/' + slug,
        JSON.stringify([{ movie_id: movieId }]),
        { headers: { 'User-Agent': DORAMASFLIX_UA, 'Content-Type': 'text/plain;charset=UTF-8', 'Accept': 'text/x-component', 'Next-Action': DORAMASFLIX_MOVIE_ACTION, 'Referer': DORAMASFLIX_BASE + '/peliculas/' + slug, 'Origin': DORAMASFLIX_BASE }, timeout: 15000, validateStatus: null }
      );
      if (res.status !== 200) return [];
      var texto = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
      var entradas = parseFlightResponse(texto);
      return entradas.map(function (e) {
        var embedUrl = decodeEmbedShortenerLink(e.link);
        return embedUrl ? { name: nombreDesdeHost(embedUrl), embedUrl: embedUrl } : null;
      }).filter(Boolean);
    } catch (e) { return []; }
  });
}

function unpackJS(code) {
  var m = code.match(/eval\(function\(p,a,c,k,e,d\)\{.*?\}\('(.*)',(\d+),(\d+),'(.*?)'\.split\('\|'\)/s);
  if (!m) return null;
  try {
    var payload0 = m[1], radixStr = m[2], dictStr = m[4];
    var radix = parseInt(radixStr, 10);
    var dict = dictStr.split('|');
    var payload = payload0.replace(/\\'/g, "'");
    return payload.replace(/\b\w+\b/g, function (word) {
      var idx = parseInt(word, radix);
      return (!isNaN(idx) && dict[idx] !== undefined && dict[idx] !== '') ? dict[idx] : word;
    });
  } catch (e) { return null; }
}

function resolveUqload(embedUrl) {
  return __async(this, null, function* () {
    var html = yield dfHttpGet(embedUrl, { Referer: DORAMASFLIX_BASE });
    if (!html) return null;
    var candidatos = [html, unpackJS(html)].filter(Boolean);
    for (var i = 0; i < candidatos.length; i++) {
      var m = candidatos[i].match(/sources:\s*\[\s*\{\s*file:\s*"([^"]+)"/) || candidatos[i].match(/sources:\s*\["([^"]+)"/);
      if (m) return { url: m[1], referer: new URL(embedUrl).origin + '/' };
    }
    return null;
  });
}

function resolveOkRu(embedUrl) {
  return __async(this, null, function* () {
    var html = yield dfHttpGet(embedUrl, { Referer: DORAMASFLIX_BASE });
    if (!html) return null;
    try {
      var cheerio3 = require('cheerio-without-node-native');
      var $ = cheerio3.load(html);
      var dataOptions = $('[data-options]').attr('data-options') || $('.vid-video_box').attr('data-options');
      if (!dataOptions) return null;
      var opts = JSON.parse(dataOptions.replace(/&quot;/g, '"'));
      var metadataStr = opts.metadata || (opts.flashvars && opts.flashvars.metadata) || '{}';
      var metadata = typeof metadataStr === 'string' ? JSON.parse(metadataStr) : metadataStr;
      var videos = metadata.videos || [];
      if (!videos.length) return null;
      var orden = ['ultra', 'quad', 'full', 'hd', 'sd', 'low', 'lowest', 'mobile'];
      videos.sort(function (a, b) { return orden.indexOf(a.name) - orden.indexOf(b.name); });
      return { url: videos[0].url, referer: 'https://ok.ru/' };
    } catch (e) { return null; }
  });
}

function resolveDoodstream(embedUrl) {
  return __async(this, null, function* () {
    var html = yield dfHttpGet(embedUrl, { Referer: embedUrl });
    if (!html) return null;
    try {
      var passMd5Match = html.match(/\$\.get\('([^']*\/pass_md5\/[^']*)'/);
      var tokenMatch = html.match(/token=([a-zA-Z0-9]+)/);
      if (!passMd5Match || !tokenMatch) return null;
      var passMd5Url = passMd5Match[1];
      if (!passMd5Url.startsWith('http')) passMd5Url = new URL(passMd5Url, embedUrl).href;
      var token = tokenMatch[1];
      var videoBaseUrl = (yield dfHttpGet(passMd5Url, { Referer: embedUrl })) || '';
      videoBaseUrl = ('' + videoBaseUrl).trim();
      if (!videoBaseUrl) return null;
      var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var randomStr = '';
      for (var i = 0; i < 10; i++) randomStr += chars[Math.floor(Math.random() * 62)];
      var expiry = Math.floor(Date.now() / 1000);
      return { url: videoBaseUrl + randomStr + '?token=' + token + '&expiry=' + expiry, referer: new URL(embedUrl).origin + '/' };
    } catch (e) { return null; }
  });
}

function resolveStreamtape(embedUrl) {
  return __async(this, null, function* () {
    var videoPageUrl = embedUrl.replace('/e/', '/v/');
    var html = yield dfHttpGet(videoPageUrl, { Referer: DORAMASFLIX_BASE });
    if (!html) return null;
    try {
      var norobotMatch = html.match(/document\.getElementById\('norobotlink'\)\.innerHTML = (.+?);/);
      if (!norobotMatch) return null;
      var tokenMatch = norobotMatch[1].match(/token=([^&']+)/);
      if (!tokenMatch) return null;
      var token = tokenMatch[1];
      var idMatch = html.match(/id\s*=\s*["']i[d\w]*link["'][^>]*>([^<]+)</);
      if (!idMatch) return null;
      var path = idMatch[1].trim().replace(/^\/+/, '');
      var url = path.startsWith('http') ? path : 'https://' + path;
      if (!/[?&]token=/.test(url)) url += (url.includes('?') ? '&' : '?') + 'token=' + token;
      return { url: url, referer: new URL(embedUrl).origin + '/' };
    } catch (e) { return null; }
  });
}

var VOE_JUNK_PARTS = ['@$', '^^', '~@', '%?', '*~', '!!', '#&'];
function voeRot13(str) {
  return str.replace(/[a-zA-Z]/g, function (c) {
    var code = c.charCodeAt(0);
    var base = code >= 97 ? 97 : 65;
    return String.fromCharCode((code - base + 13) % 26 + base);
  });
}
function voeDecode(encoded) {
  var step1 = voeRot13(encoded);
  var step2 = step1;
  VOE_JUNK_PARTS.forEach(function (junk) { step2 = step2.split(junk).join('_'); });
  step2 = step2.split('_').join('');
  var step3 = Buffer.from(step2, 'base64').toString('utf8');
  var step4 = step3.split('').map(function (c) { return String.fromCharCode(c.charCodeAt(0) - 3); }).join('');
  var step5 = Buffer.from(step4.split('').reverse().join(''), 'base64').toString('utf8');
  return JSON.parse(step5);
}
function resolveVoe(embedUrl) {
  return __async(this, null, function* () {
    var html = yield dfHttpGet(embedUrl, { Referer: DORAMASFLIX_BASE });
    if (!html) return null;

    function extraerDe(html2) {
      var bloques = Array.from(html2.matchAll(/<script\s+type=["']application\/json["']>([\s\S]*?)<\/script>/g)).map(function (m) { return m[1]; });
      for (var i = 0; i < bloques.length; i++) {
        try {
          var textoPlano = JSON.parse(bloques[i].trim());
          var decoded = voeDecode(textoPlano);
          if (decoded.source) return decoded.source;
        } catch (e) {}
      }
      var m2 = html2.match(/var a168c='([^']+)'/);
      if (m2) {
        try {
          var decoded2 = voeDecode(m2[1]);
          if (decoded2.source) return decoded2.source;
        } catch (e) {}
      }
      var m3 = html2.match(/'hls':\s*'([^']+)'/);
      if (m3) return m3[1];
      return null;
    }

    var source = extraerDe(html);
    if (!source) {
      var redirectMatch = html.match(/['"](\s*https?:\/\/[^'"<>\s]+\/e\/[^'"<>\s]+)['"]/);
      if (redirectMatch) {
        html = yield dfHttpGet(redirectMatch[1].trim(), { Referer: DORAMASFLIX_BASE });
        if (html) source = extraerDe(html);
      }
    }
    if (!source) return null;
    return { url: source, referer: new URL(embedUrl).origin + '/' };
  });
}

function resolvePrimeload(embedUrl) {
  return __async(this, null, function* () {
    var html = yield dfHttpGet(embedUrl, { Referer: DORAMASFLIX_BASE });
    if (!html) return null;
    var iframeMatch = html.match(/<iframe[^>]+id=["']sf-player-frame["'][^>]+src=["']([^"']+)["']/) || html.match(/<iframe[^>]+src=["']([^"']+)["']/);
    if (!iframeMatch) return null;
    var playerUrl = iframeMatch[1];
    if (playerUrl.startsWith('//')) playerUrl = 'https:' + playerUrl;
    return yield resolveGenerico(playerUrl);
  });
}

function resolveGenerico(embedUrl) {
  return __async(this, null, function* () {
    var html = yield dfHttpGet(embedUrl, { Referer: DORAMASFLIX_BASE });
    if (!html) return null;
    var patrones = [
      /sources:\s*\[\s*\{\s*file:\s*"([^"]+)"/,
      /source:\s*"([^"]+\.m3u8[^"]*)"/,
      /file:\s*"([^"]+\.m3u8[^"]*)"/,
      /"file":"([^"]+\.m3u8[^"]*)"/,
      /src:\s*"([^"]+\.m3u8[^"]*)"/,
      /https?:\/\/[^\s"'\\<>]+\.m3u8[^\s"'\\<>]*/,
      /file:\s*"([^"]+\.mp4[^"]*)"/,
      /https?:\/\/[^\s"'\\<>]+\.mp4[^\s"'\\<>]*/,
    ];
    for (var i = 0; i < patrones.length; i++) {
      var m = html.match(patrones[i]);
      if (m) return { url: m[1] || m[0], referer: new URL(embedUrl).origin + '/' };
    }
    var unpacked = unpackJS(html);
    if (unpacked) {
      for (var j = 0; j < patrones.length; j++) {
        var m2 = unpacked.match(patrones[j]);
        if (m2) return { url: m2[1] || m2[0], referer: new URL(embedUrl).origin + '/' };
      }
    }
    return null;
  });
}

function fixHostsLinksDF(url) {
  return url
    .replace('https://hglink.to', 'https://streamwish.to')
    .replace('https://swdyu.com', 'https://streamwish.to')
    .replace('https://cybervynx.com', 'https://streamwish.to')
    .replace('https://dumbalag.com', 'https://streamwish.to')
    .replace('https://mivalyo.com', 'https://vidhidepro.com')
    .replace('https://dinisglows.com', 'https://vidhidepro.com')
    .replace('https://dhtpre.com', 'https://vidhidepro.com')
    .replace('https://filemoon.link', 'https://filemoon.sx')
    .replace('https://sblona.com', 'https://watchsb.com')
    .replace('https://lulu.st', 'https://lulustream.com')
    .replace('https://uqload.io', 'https://uqload.com')
    .replace('https://uqload.cx', 'https://uqload.com')
    .replace('https://do7go.com', 'https://dood.la');
}

function elegirExtractorDF(name, embedUrl) {
  var n = (name || '').toLowerCase();
  if (n === 'uqload') return resolveUqload;
  if (n === 'ok') return resolveOkRu;
  if (n === 'voe') return resolveVoe;
  if (n === 'dood') return resolveDoodstream;
  if (n === 'streamtape') return resolveStreamtape;
  if (n === 'primeload') return resolvePrimeload;
  try {
    var host = new URL(embedUrl).hostname.toLowerCase();
    if (host.includes('uqload')) return resolveUqload;
    if (host.includes('ok.ru')) return resolveOkRu;
    if (host.includes('voe.')) return resolveVoe;
    if (host.includes('streamtape')) return resolveStreamtape;
  } catch (e) {}
  return resolveGenerico;
}

function formatQualityDF(url) {
  if (/2160|4k/i.test(url)) return '4K';
  if (/1080/.test(url)) return '1080p';
  if (/720/.test(url)) return '720p';
  if (/480/.test(url)) return '480p';
  return '';
}

function findDoramasflixPageHTML(mediaType, season, episode, allTitles) {
  return __async(this, null, function* () {
    var isMovie = mediaType === 'movie' || mediaType === 'movies';
    var probados = {};
    for (var i = 0; i < allTitles.length; i++) {
      var slug = slugifyDF(allTitles[i]);
      if (!slug || probados[slug]) continue;
      probados[slug] = true;
      var url = isMovie ? (DORAMASFLIX_BASE + '/peliculas/' + slug) : (DORAMASFLIX_BASE + '/capitulos/' + slug + '-' + (season || 1) + 'x' + (episode || 1));
      var html = yield dfHttpGet(url);
      if (!html) continue;
      if (!isMovie) {
        var servidores = extractServersDF(html);
        if (servidores.length > 0) return { html: html, url: url, slug: slug };
      } else {
        var slugEscapado = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        var esLaPeliculaCorrecta = new RegExp('\\\\"_id\\\\":\\\\"[a-f0-9]{24}\\\\",\\\\"name\\\\":\\\\"[^\\\\]*\\\\",\\\\"slug\\\\":\\\\"' + slugEscapado + '\\\\"').test(html);
        if (esLaPeliculaCorrecta) return { html: html, url: url, slug: slug };
      }
    }
    return null;
  });
}

function intentarHTML(mediaType, title, season, episode) {
  return __async(this, null, function* () {
    var isMovie = mediaType === 'movie' || mediaType === 'movies';
    var pagina = yield findDoramasflixPageHTML(mediaType, season, episode, [title]);
    if (!pagina) return [];

    var servidores;
    if (isMovie) {
      servidores = yield obtenerServidoresPelicula(pagina.html, pagina.slug);
    } else {
      servidores = extractServersDF(pagina.html);
    }
    if (!servidores.length) return [];

    var resueltos = [];
    yield Promise.all(servidores.map(function (s) {
      var extractor = elegirExtractorDF(s.name, s.embedUrl);
      return extractor(s.embedUrl).then(function (resultado) {
        if (resultado) {
          resueltos.push({
            name: 'Doramasflix',
            title: s.name + ' \xB7 ' + (formatQualityDF(resultado.url) || 'HD'),
            url: resultado.url,
            headers: { 'User-Agent': DORAMASFLIX_UA, Referer: resultado.referer, Origin: (new URL(resultado.referer)).origin },
          });
        }
      }).catch(function () {});
    }));
    return resueltos;
  });
}

function getStreams(tmdbId, mediaType, season, episode, title, year) {
  return __async(this, null, function* () {
    if (!title) return [];
    try {
      var streams = yield intentarGraphQL(mediaType, title, year, season, episode);
      if (streams && streams.length) return streams;
    } catch (e) {
      console.log('[Doramasflix] GraphQL fallo: ' + e.message);
    }
    try {
      var streams2 = yield intentarHTML(mediaType, title, season, episode);
      return streams2 || [];
    } catch (e2) {
      console.log('[Doramasflix] Respaldo HTML tambien fallo: ' + e2.message);
      return [];
    }
  });
}

module.exports = { getStreams: getStreams };
