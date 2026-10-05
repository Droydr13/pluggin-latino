const CryptoJS = require('crypto-js');

const FUENTE = 'MovieBox';
const TMDB_KEY = '1865f43a0549ca50d341dd9ab8b29f49';
const API = 'https://api3.aoneroom.com';
const HOSTS = ['api6.aoneroom.com', 'api5.aoneroom.com', 'api4.aoneroom.com', 'api4sg.aoneroom.com', 'api3.aoneroom.com'];
const WEB = 'https://moviebox.ph';
const UA_WEB = 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Mobile Safari/537.36';
const TOKEN_URL = 'https://apig.inmoviebox.com/wefeed-mobile-bff/tab/ranking-list?tabId=0&categoryType=4516404531735022304&page=1&perPage=1';
const PAQUETE = { package_name: 'com.community.mbox.in', version_name: '4.0.03.0920.03', version_code: 50020130 };
const MODELOS = {
  Samsung: ['SM-S918B', 'SM-A528B', 'SM-M336B'],
  Xiaomi: ['2201117TI', 'M2012K11AI', 'Redmi Note 11'],
  OnePlus: ['LE2111', 'CPH2449', 'IN2023'],
  Google: ['Pixel 6', 'Pixel 7', 'Pixel 8'],
  Realme: ['RMX3085', 'RMX3360', 'RMX3551']
};
const CLAVE = CryptoJS.enc.Base64.parse(CryptoJS.enc.Base64.parse('NzZpUmwwN3MweFNOOWpxbUVXQXQ3OUVCSlp1bElRSXNWNjRGWnIyTw==').toString(CryptoJS.enc.Utf8));
const ESPANOL = /espa[nñ]ol|spanish|latin|castellano|castilian|\bes(?:[-_][a-z0-9]+)?\b/i;

let dispositivo = '';
let marca = '';
let modelo = '';
let token = '';

function azar(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

function prepararDispositivo() {
  if (dispositivo) return;
  for (let i = 0; i < 32; i++) dispositivo += '0123456789abcdef'[Math.floor(Math.random() * 16)];
  marca = azar(Object.keys(MODELOS));
  modelo = azar(MODELOS[marca]);
}

function vencimiento(jwt) {
  try {
    let parte = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    while (parte.length % 4) parte += '=';
    return JSON.parse(CryptoJS.enc.Base64.parse(parte).toString(CryptoJS.enc.Utf8)).exp || 0;
  } catch (e) {
    return 0;
  }
}

function tokenVigente(t) {
  return !!t && vencimiento(t) > Date.now() / 1000 + 3600;
}

function md5(valor) {
  return CryptoJS.MD5(valor).toString(CryptoJS.enc.Hex);
}

function separarUrl(url) {
  const sinHost = url.replace(/^https?:\/\/[^/]+/, '');
  const corte = sinHost.indexOf('?');
  const ruta = corte === -1 ? sinHost : sinHost.slice(0, corte);
  const consulta = corte === -1 ? '' : sinHost.slice(corte + 1);
  return { ruta, consulta };
}

function urlCanonica(url) {
  const { ruta, consulta } = separarUrl(url);
  if (!consulta) return ruta;
  const pares = consulta.split('&').filter(Boolean).map((par) => {
    const i = par.indexOf('=');
    const clave = decodeURIComponent(i === -1 ? par : par.slice(0, i));
    const valor = i === -1 ? '' : decodeURIComponent(par.slice(i + 1));
    return [clave, valor];
  });
  pares.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  return ruta + '?' + pares.map(([c, v]) => `${c}=${v}`).join('&');
}

function firma(metodo, accept, tipo, url, cuerpo, momento) {
  let hash = '';
  let largo = '';
  if (cuerpo) {
    const bytes = CryptoJS.enc.Utf8.parse(cuerpo);
    hash = md5(bytes);
    largo = String(bytes.sigBytes);
  }
  const canonico = [metodo.toUpperCase(), accept || '', tipo || '', largo, String(momento), hash, urlCanonica(url)].join('\n');
  const sello = CryptoJS.HmacMD5(canonico, CLAVE).toString(CryptoJS.enc.Base64);
  return `${momento}|2|${sello}`;
}

function guardarToken(respuesta) {
  const usuario = respuesta.headers.get('x-user');
  if (!usuario) return;
  try {
    const t = JSON.parse(usuario).token;
    if (tokenVigente(t)) token = t;
  } catch (e) {}
}

async function pedir(metodo, url, cuerpo, extras, sinToken) {
  prepararDispositivo();
  const momento = Date.now();
  const accept = (extras && extras.Accept) || 'application/json';
  const tipo = (extras && extras['Content-Type']) || (cuerpo ? 'application/json; charset=utf-8' : 'application/json');
  const cabeceras = Object.assign({
    Accept: accept,
    'Content-Type': tipo,
    'x-client-token': `${momento},${md5(String(momento).split('').reverse().join(''))}`,
    'x-tr-signature': firma(metodo, accept, tipo, url, cuerpo, momento),
    'User-Agent': `${PAQUETE.package_name}/${PAQUETE.version_code} (Linux; U; Android 14; en_IN; ${modelo}; Build/UD1A.230803.041; Cronet/145.0.7582.0)`,
    'x-client-info': JSON.stringify(Object.assign({}, PAQUETE, {
      os: 'android',
      os_version: '14',
      device_id: dispositivo,
      install_store: 'official',
      gaid: '1b2212c1-dadf-43c3-a0c8-bd6ce48ae22d',
      brand: marca.toLowerCase(),
      model: modelo,
      system_language: 'en',
      net: 'NETWORK_WIFI',
      region: 'IN',
      timezone: 'Asia/Calcutta',
      sp_code: ''
    })),
    'x-client-status': '0'
  }, extras || {});
  if (!sinToken) {
    const t = await obtenerToken();
    if (t) cabeceras.Authorization = `Bearer ${t}`;
  }
  const opciones = { method: metodo, headers: cabeceras };
  if (cuerpo) opciones.body = cuerpo;
  const host = url.replace(/^https?:\/\//, '').split('/')[0];
  const hosts = HOSTS.includes(host) ? [host].concat(HOSTS.filter((h) => h !== host)).slice(0, 3) : [host];
  for (let i = 0; i < hosts.length; i++) {
    try {
      const respuesta = await fetch(url.replace(host, hosts[i]), opciones);
      if (!respuesta.ok) {
        if ((respuesta.status === 403 || respuesta.status === 429 || respuesta.status >= 500) && i + 1 < hosts.length) continue;
        return null;
      }
      const texto = await respuesta.text();
      guardarToken(respuesta);
      try {
        return { datos: JSON.parse(texto), cabeceras: respuesta.headers };
      } catch (e) {
        return { datos: texto, cabeceras: respuesta.headers };
      }
    } catch (e) {
      if (i + 1 === hosts.length) return null;
    }
  }
  return null;
}

async function obtenerToken() {
  if (tokenVigente(token)) return token;
  await pedir('GET', TOKEN_URL, null, {}, true);
  return token || '';
}

async function datosTmdb(tmdbId, tipo) {
  const base = `https://api.themoviedb.org/3/${tipo}/${tmdbId}?api_key=${TMDB_KEY}`;
  const [ingles, espanol] = await Promise.all([
    fetch(base).then((r) => r.json()).catch(() => null),
    fetch(`${base}&language=es-MX`).then((r) => r.json()).catch(() => null)
  ]);
  if (!ingles && !espanol) return null;
  const en = ingles || {};
  const es = espanol || {};
  return {
    busqueda: en.title || en.name || es.original_title || es.original_name || '',
    original: en.original_title || en.original_name || '',
    mostrar: es.title || es.name || en.title || en.name || '',
    anio: String(en.release_date || en.first_air_date || es.release_date || es.first_air_date || '').slice(0, 4)
  };
}

function normalizar(texto) {
  return String(texto || '')
    .replace(/\[[^\]]*\]|\([^)]*\)/g, ' ')
    .replace(/\b(dub|dubbed|hd|4k|hindi|tamil|telugu|dual audio)\b/gi, ' ')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function buscar(titulo) {
  const cuerpo = JSON.stringify({ page: 1, perPage: 20, keyword: titulo, restrictKid: 1 });
  const respuesta = await pedir('POST', `${API}/wefeed-mobile-bff/subject-api/search/v2`, cuerpo);
  const grupos = respuesta && respuesta.datos && respuesta.datos.data && respuesta.datos.data.results;
  if (!Array.isArray(grupos)) return [];
  return grupos.reduce((todos, grupo) => todos.concat(grupo.subjects || []), []);
}

function elegir(candidatos, titulo, anio, tipo) {
  const objetivo = normalizar(titulo);
  const tipoBuscado = tipo === 'movie' ? 1 : 2;
  let mejor = null;
  let puntos = 0;
  for (const c of candidatos) {
    if (c.subjectType !== tipoBuscado) continue;
    const nombre = normalizar(c.title);
    const suAnio = String(c.year || c.releaseDate || '').slice(0, 4);
    let p = 0;
    if (nombre === objetivo) p += 50;
    else if (nombre.includes(objetivo) || objetivo.includes(nombre)) p += 15;
    if (anio && suAnio === anio) p += 35;
    if (p > puntos) {
      puntos = p;
      mejor = c;
    }
  }
  return puntos >= 40 ? mejor : null;
}

function paginaWeb(sujeto) {
  let ruta = [sujeto.detailPath, sujeto.detail_path, sujeto.path, sujeto.slug].find((v) => typeof v === 'string' && v.trim());
  let web = WEB;
  for (const valor of [sujeto.detailDomain, sujeto.webDomain, sujeto.webUrl, sujeto.detailUrl, sujeto.shareUrl]) {
    if (typeof valor !== 'string' || !valor) continue;
    const m = (valor.startsWith('http') ? valor : `https://${valor}`).match(/^(https?:\/\/[^/]+)(\/[^?#]*)?/);
    if (!m) continue;
    if (!/aoneroom\.com$/.test(m[1])) web = m[1];
    if (!ruta && m[2] && m[2] !== '/') ruta = m[2];
    break;
  }
  if (!ruta) return { web, ruta: '', referer: `${web}/` };
  ruta = ruta.replace(/^\/+/, '').replace(/^movies\//, '');
  return { web, ruta, referer: `${web}/movies/${ruta}` };
}

function recolectar(play) {
  const lista = Array.isArray(play && play.streams) ? play.streams.slice() : [];
  for (const [clave, formato] of [['netDash', 'DASH'], ['netHls', 'HLS']]) {
    const valor = play && (play[clave] != null ? play[clave] : play.data && play.data[clave]);
    for (const item of Array.isArray(valor) ? valor : valor ? [valor] : []) {
      if (typeof item === 'string') {
        lista.push({ url: item, format: formato });
      } else if (item && typeof item === 'object') {
        if (item.url || item.playUrl || item.resourceLink || item.streamUrl) {
          lista.push(Object.assign({}, item, { format: item.format || formato }));
        } else {
          for (const [resolucion, url] of Object.entries(item)) {
            if (typeof url === 'string' && /^https?:\/\//i.test(url)) lista.push({ url, resolution: resolucion, format: formato });
            else if (url && typeof url === 'object') lista.push(Object.assign({}, url, { resolution: url.resolution || resolucion, format: url.format || formato }));
          }
        }
      }
    }
  }
  const vistos = new Set();
  return lista.filter((s) => {
    const url = s && (s.url || s.playUrl || s.resourceLink || s.streamUrl);
    if (!url || vistos.has(url)) return false;
    vistos.add(url);
    return true;
  });
}

function base64Normal(texto, reemplazos) {
  let b = texto;
  for (const [de, a] of reemplazos) b = b.split(de).join(a);
  while (b.length % 4) b += '=';
  return CryptoJS.enc.Base64.parse(b).toString(CryptoJS.enc.Utf8);
}

function urlDePoliza(cookie) {
  if (!cookie || typeof cookie !== 'string') return null;
  const borde = cookie.match(/Edge-Cache-Cookie=urlprefix=([^:;\s]+)/);
  if (borde) {
    try {
      const prefijo = base64Normal(borde[1], [['_', '/'], ['-', '+']]).replace(/\/+$/, '');
      if (prefijo) return `${prefijo}/index.mpd`;
    } catch (e) {}
  }
  const cf = cookie.match(/CloudFront-Policy=([^;]+)/);
  if (cf) {
    try {
      let json = '';
      try {
        json = base64Normal(cf[1].replace(/=+$/, ''), [['-', '+'], ['~', '/'], ['_', '=']]);
      } catch (e) {
        json = base64Normal(cf[1], [['-', '+'], ['_', '/']]);
      }
      const recurso = JSON.parse(json).Statement[0].Resource;
      if (typeof recurso === 'string') {
        const limpio = recurso.replace(/[*/]+$/, '');
        return /\.mpd$/i.test(limpio) ? limpio : `${limpio}/index.mpd`;
      }
    } catch (e) {}
  }
  return null;
}

function idioma(texto) {
  const t = String(texto || '');
  if (/latin|latino|419|m[eé]xic/i.test(t)) return 'Latino';
  if (/castellano|castilian|espa[nñ]a|spain/i.test(t)) return 'Castellano';
  return 'Español';
}

function esEspanol(texto) {
  return ESPANOL.test(String(texto || ''));
}

function tamano(valor) {
  const bytes = Number(valor);
  if (!bytes || bytes < 1024 * 1024) return '';
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  return `${Math.round(bytes / (1024 * 1024))} MB`;
}

function calidad(valor) {
  const m = String(valor || '').match(/(\d{3,4})/);
  return m ? `${m[1]}p` : 'Auto';
}

function tarjeta(titulo, cal, audio, peso, url, cabeceras) {
  const s = { name: FUENTE, title: titulo, url, quality: `Calidad: ${cal}`, language: `Audio: ${audio}`, headers: cabeceras, provider: FUENTE };
  if (peso) s.size = `Tamaño: ${peso}`;
  return s;
}

function idiomasEnEspanol(sujeto, subjectId) {
  const elegidos = [];
  let original = '';
  for (const doblaje of Array.isArray(sujeto.dubs) ? sujeto.dubs : []) {
    const nombre = [doblaje.lanName, doblaje.lanCode, doblaje.language, doblaje.lan].filter(Boolean).join(' ');
    if (String(doblaje.subjectId) === String(subjectId)) original = nombre;
    else if (esEspanol(nombre)) elegidos.push({ id: doblaje.subjectId, idioma: nombre });
  }
  if (esEspanol(original)) elegidos.unshift({ id: subjectId, idioma: original });
  return elegidos;
}

async function enlaces(subjectId, temporada, episodio, titulo) {
  const detalle = await pedir('GET', `${API}/wefeed-mobile-bff/subject-api/get?subjectId=${subjectId}`);
  const sujeto = detalle && detalle.datos && detalle.datos.data;
  if (!sujeto) return [];
  const pagina = paginaWeb(sujeto);
  const versiones = idiomasEnEspanol(sujeto, subjectId);
  if (!versiones.length) return [];
  const cabecerasWeb = {
    Origin: pagina.web,
    Referer: pagina.referer,
    'User-Agent': UA_WEB,
    'x-request-lang': 'en',
    'x-vip-restrict': '0',
    'x-no-high-risk-restrict': '0'
  };
  const salida = [];
  for (const version of versiones) {
    try {
      let consulta = `subjectId=${encodeURIComponent(version.id)}&se=${temporada}&ep=${episodio}&streamSignType=1`;
      if (pagina.ruta) consulta += `&detailPath=${encodeURIComponent(pagina.ruta)}`;
      consulta += `&${encodeURIComponent('supportCodecs[hevc]')}=1&${encodeURIComponent('supportCodecs[h264]')}=1`;
      const play = await pedir('GET', `${API}/wefeed-mobile-bff/subject-api/play-info?${consulta}`, null, cabecerasWeb);
      const datos = play && play.datos && play.datos.data;
      if (!datos) continue;
      let encontrados = 0;
      for (const s of recolectar(datos)) {
        const original = s.url || s.playUrl || s.resourceLink || s.streamUrl || '';
        const cookie = s.signCookie || null;
        const url = urlDePoliza(cookie) || original;
        if (!url || url.includes('b164fbfb4347792950bdfbfb563d39d9')) continue;
        if (url === original && original.includes('/other/2026/09/')) continue;
        const etiqueta = [s.languageName, s.lanName, s.language, s.lan].filter(Boolean).join(' ');
        const cabeceras = Object.assign({}, cabecerasWeb);
        if (cookie) cabeceras[s.signHeaderKey || s.sign_header_key || 'Cookie'] = cookie;
        salida.push(tarjeta(titulo, calidad(s.resolutions || s.resolution || s.quality), idioma(esEspanol(etiqueta) ? etiqueta : version.idioma), tamano(s.size), url, cabeceras));
        encontrados++;
      }
      if (encontrados) continue;
      const detectores = Array.isArray(datos.resourceDetectors) ? datos.resourceDetectors : sujeto.resourceDetectors;
      for (const detector of Array.isArray(detectores) ? detectores : []) {
        for (const video of Array.isArray(detector.resolutionList) ? detector.resolutionList : []) {
          if (!video.resourceLink) continue;
          const se = video.se != null ? video.se : 0;
          const ep = video.ep != null ? video.ep : 0;
          if ((temporada > 0 || episodio > 0) && (se !== temporada || ep !== episodio)) continue;
          salida.push(tarjeta(titulo, calidad(video.resolution), idioma(version.idioma), tamano(video.size), video.resourceLink, Object.assign({}, cabecerasWeb)));
        }
      }
    } catch (e) {
      console.log(`[MovieBox] ${e.message}`);
    }
  }
  const orden = (s) => (/Latino/.test(s.language) ? 10000 : 0) + (Number((s.quality.match(/(\d{3,4})p/) || [])[1]) || 0);
  return salida.sort((a, b) => orden(b) - orden(a));
}

async function getStreams(tmdbId, mediaType, season, episode) {
  try {
    const tipo = mediaType === 'movie' ? 'movie' : 'tv';
    const datos = await datosTmdb(tmdbId, tipo);
    if (!datos || !datos.busqueda) return [];
    let candidatos = await buscar(datos.busqueda);
    let elegido = elegir(candidatos, datos.busqueda, datos.anio, tipo);
    if (!elegido && datos.original && datos.original !== datos.busqueda) {
      candidatos = await buscar(datos.original);
      elegido = elegir(candidatos, datos.original, datos.anio, tipo);
    }
    if (!elegido) return [];
    const temporada = tipo === 'tv' ? Number(season) || 1 : 0;
    const episodio = tipo === 'tv' ? Number(episode) || 1 : 0;
    const titulo = tipo === 'tv' ? `${datos.mostrar} - T${temporada} E${episodio}` : `${datos.mostrar}${datos.anio ? ` (${datos.anio})` : ''}`;
    return await enlaces(elegido.subjectId, temporada, episodio, titulo);
  } catch (e) {
    console.log(`[MovieBox] ${e.message}`);
    return [];
  }
}

module.exports = { getStreams };
