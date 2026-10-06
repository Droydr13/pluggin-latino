const CryptoJS = require('crypto-js');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36';
const RELOJ = typeof setTimeout === 'function';
const PRESUPUESTO = RELOJ ? 42000 : 25000;
const CIERRE = RELOJ ? 50000 : 40000;
let inicio = Date.now();

function esperar(ms) {
  return RELOJ ? new Promise((r) => setTimeout(r, ms)) : Promise.resolve();
}

function transcurrido() {
  return Date.now() - inicio;
}

function restante() {
  return PRESUPUESTO - transcurrido();
}

function conLimite(promesa, ms, valor) {
  let listo = false;
  const fin = Date.now() + ms;
  const trabajo = Promise.resolve(promesa).then((v) => {
    listo = true;
    return v;
  }, () => {
    listo = true;
    return valor;
  });
  if (!RELOJ) return trabajo;
  const reloj = (async () => {
    while (!listo && Date.now() < fin) await esperar(Math.max(1, Math.min(250, fin - Date.now())));
    return valor;
  })();
  return Promise.race([trabajo, reloj]);
}

async function traer(url, opciones) {
  if (typeof __native_fetch !== 'function') return fetch(url, opciones);
  const cabeceras = {};
  for (const k of Object.keys(opciones.headers || {})) cabeceras[k] = String(opciones.headers[k]);
  const cuerpo = opciones.body === undefined || opciones.body === null ? null : String(opciones.body);
  const crudo = await __native_fetch(url, String(opciones.method || 'GET').toUpperCase(), JSON.stringify(cabeceras), cuerpo === null ? 'none' : 'text', cuerpo || '', opciones.redirect !== 'manual');
  const d = JSON.parse(crudo);
  const h = d.headers || {};
  return {
    ok: !!d.ok,
    status: d.status,
    statusText: d.statusText,
    url: d.url || url,
    tam: (d.body || '').length,
    escudo: d.status >= 400 && /just a moment|cf-chl|challenge-platform|cf_chl|attention required/i.test(String(d.body || '').slice(0, 6000)),
    headers: { get: (n) => h[String(n).toLowerCase()] || null },
    text: () => Promise.resolve(d.body || ''),
    json: () => {
      try {
        return Promise.resolve(d.body ? JSON.parse(d.body) : null);
      } catch (e) {
        return Promise.resolve(null);
      }
    }
  };
}

const caidos = new Set();
let registro = [];

function anotar(t) {
  if (registro.length < 80) registro.push(String(t).replace(/\s+/g, ' ').trim());
}

function rutaCorta(url) {
  return String(url || '').replace(/^https?:\/\/(?:www\.)?/i, '').replace(/[?&]api_key=[^&]+/, '').slice(0, 75);
}

function peso(n) {
  return n < 1024 ? `${n}B` : `${Math.round(n / 1024)}KB`;
}

async function pedir(url, opciones) {
  const host = String(url || '').replace(/^https?:\/\//i, '').split(/[/?#]/)[0].toLowerCase();
  const metodo = String((opciones && opciones.method) || 'GET').toUpperCase();
  if (caidos.has(host) || restante() <= 0) {
    anotar(`${metodo} ${rutaCorta(url)} → omitido`);
    return null;
  }
  const comienzo = Date.now();
  const r = await pedirCrudo(url, opciones);
  const estado = !r ? 'tiempo agotado' : !r.status ? `error de red${r.statusText ? ` (${String(r.statusText).slice(0, 40)})` : ''}` : r.status;
  const marca = opciones && opciones.headers && opciones.headers.RSC ? ' (RSC)' : '';
  if (!(r && r.ok && /themoviedb/.test(host))) anotar(`${metodo}${marca} ${rutaCorta(url)} → ${estado}${r && r.status && r.tam !== undefined ? ` · ${peso(r.tam)}` : ''}${r && r.escudo ? ' · Cloudflare' : ''} · ${((Date.now() - comienzo) / 1000).toFixed(1)}s${r && r.status && r.url && rutaCorta(r.url) !== rutaCorta(url) ? ` → ${rutaCorta(r.url).slice(0, 45)}` : ''}`);
  if (r && !r.status) {
    caidos.add(host);
    return null;
  }
  return r;
}

async function pedirCrudo(url, opciones) {
  const o = Object.assign({}, opciones || {});
  const limite = Math.min(o.limite || CIERRE, CIERRE - transcurrido());
  const sinCabeceras = o.sinCabeceras;
  delete o.limite;
  delete o.sinCabeceras;
  o.headers = sinCabeceras ? Object.assign({}, o.headers || {}) : Object.assign({
    'User-Agent': UA,
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'es-MX,es;q=0.9,en;q=0.8'
  }, o.headers || {});
  return conLimite(traer(url, o).catch((e) => ({ status: 0, statusText: e && e.message })), limite, null);
}

async function texto(url, opciones) {
  const r = await pedir(url, opciones);
  if (!r || !r.ok) return '';
  try {
    return (await conLimite(r.text(), 10000, '')) || '';
  } catch (e) {
    return '';
  }
}

async function json(url, opciones) {
  const t = await texto(url, opciones);
  if (!t) return null;
  try {
    return JSON.parse(t);
  } catch (e) {
    return null;
  }
}

function cookies(respuesta) {
  const crudo = respuesta && respuesta.headers && respuesta.headers.get('set-cookie');
  if (!crudo) return '';
  return crudo.split(/,(?=\s*[A-Za-z0-9_.\-]+=)|\n/).map((c) => c.split(';')[0].trim()).filter((c) => c.includes('=')).join('; ');
}

function conClases(html, clases) {
  const cuerpo = String(html || '');
  const inicios = [];
  const patron = /<[a-z][a-z0-9]*\b[^>]*?\bclass\s*=\s*["']([^"']*)["'][^>]*>/gi;
  let m;
  while ((m = patron.exec(cuerpo))) {
    const tiene = m[1].split(/\s+/);
    if (clases.every((c) => tiene.includes(c))) inicios.push(m.index);
  }
  return inicios.map((inicio, i) => cuerpo.slice(inicio, i + 1 < inicios.length ? inicios[i + 1] : cuerpo.length));
}

function origen(url) {
  const m = String(url || '').match(/^(https?:\/\/[^/?#]+)/i);
  return m ? m[1] : '';
}

function dominio(url) {
  const m = String(url || '').match(/^(?:https?:)?\/\/([^/?#:]+)/i);
  return m ? m[1].toLowerCase() : '';
}

const ENTIDADES = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ', ntilde: 'ñ', Ntilde: 'Ñ', aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú', Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú', uuml: 'ü', iexcl: '¡', iquest: '¿' };

function entidades(t) {
  return String(t || '')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(parseInt(d, 10)))
    .replace(/&([a-z]+);/gi, (x, n) => (n in ENTIDADES ? ENTIDADES[n] : x));
}

function absoluta(url, base) {
  if (!url) return '';
  const u = entidades(String(url).trim().replace(/\\\//g, '/'));
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith('//')) return `https:${u}`;
  if (u.startsWith('/')) return origen(base) + u;
  const b = String(base || '').replace(/[?#].*$/, '');
  return (/^https?:\/\/[^/]+$/i.test(b) ? `${b}/` : b.replace(/[^/]*$/, '')) + u;
}

function limpiarHtml(t) {
  return entidades(String(t || '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function normalizar(t) {
  return String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/&/g, ' y ').replace(/[^a-z0-9]+/g, ' ').trim();
}

function desempacar(html) {
  const salida = [];
  const patron = /eval\(function\(p,a,c,k,e,[a-z]\)\{[\s\S]*?\}\s*\(\s*'((?:[^'\\]|\\.)*)'\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'((?:[^'\\]|\\.)*)'\.split\('\|'\)/g;
  const digitos = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let m;
  while ((m = patron.exec(String(html || '')))) {
    const base = parseInt(m[2], 10);
    const palabras = m[4].split('|');
    const valor = (t) => {
      let n = 0;
      for (const ch of t) {
        const v = digitos.indexOf(ch);
        if (v < 0 || v >= base) return -1;
        n = n * base + v;
      }
      return n;
    };
    salida.push(m[1].replace(/\\'/g, "'").replace(/\b\w+\b/g, (t) => {
      const i = valor(t);
      return i >= 0 && i < palabras.length && palabras[i] ? palabras[i] : t;
    }));
  }
  return salida.join('\n');
}

function etiquetaAltura(alto) {
  const h = parseInt(alto, 10) || 0;
  if (!h) return '';
  if (h >= 2000) return '4K';
  if (h >= 1400) return '1440p';
  if (h >= 1000) return '1080p';
  if (h >= 700) return '720p';
  if (h >= 470) return '480p';
  if (h >= 350) return '360p';
  return `${h}p`;
}

function calidadTexto(t) {
  const s = String(t || '');
  if (/2160|4k|uhd/i.test(s)) return '4K';
  const m = s.match(/(1440|1080|720|480|360|240)\s*p?/i);
  return m ? `${m[1]}p` : '';
}

async function calidadHls(url, headers) {
  if (!/m3u8|\/hls|master|playlist|\.txt/i.test(url) || restante() < 8000) return '';
  const t = await texto(url, { headers, limite: 5000 });
  let alto = 0;
  const patron = /RESOLUTION=\d+x(\d+)/gi;
  let m;
  while ((m = patron.exec(t))) alto = Math.max(alto, parseInt(m[1], 10));
  return etiquetaAltura(alto);
}

function enlace(url, servidor, headers, calidad) {
  if (!url || !/^https?:\/\//i.test(url)) return [];
  return [{ url, servidor, headers: headers || {}, calidad: calidad || '' }];
}

function buscarVideo(t, base) {
  const fuentes = [
    /["']?hls[24]["']?\s*:\s*["']([^"']+)["']/i,
    /sources\s*:\s*\[\s*\{\s*(?:src|file)\s*:\s*["']([^"']+)["']/i,
    /file\s*:\s*["']([^"']+\.(?:m3u8|mp4|txt)[^"']*)["']/i,
    /["']file["']\s*:\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/i,
    /sources\s*:\s*\[\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/i,
    /src\s*:\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/i,
    /["'](https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)["']/i,
    /["'](https?:\/\/[^"'\s]+\.mp4[^"'\s]*)["']/i
  ];
  for (const f of fuentes) {
    const m = String(t || '').match(f);
    if (m) return absoluta(m[1], base);
  }
  return '';
}

function atobSeguro(t) {
  try {
    return atob(String(t || '').replace(/\s+/g, ''));
  } catch (e) {
    return '';
  }
}

function descifrarVoe(cifrado, ruidos) {
  let t = cifrado.replace(/[a-zA-Z]/g, (c) => {
    const tope = c <= 'Z' ? 90 : 122;
    const n = c.charCodeAt(0) + 13;
    return String.fromCharCode(n <= tope ? n : n - 26);
  });
  for (const ruido of ruidos || ['@$', '^^', '~@', '%?', '*~', '!!', '#&']) t = t.split(ruido).join('');
  const paso = atobSeguro(t);
  if (!paso) return null;
  let movido = '';
  for (let i = 0; i < paso.length; i++) movido += String.fromCharCode(paso.charCodeAt(i) - 3);
  const final = atobSeguro(movido.split('').reverse().join(''));
  try {
    return JSON.parse(final);
  } catch (e) {
    return null;
  }
}

async function resolverVoe(url, referer) {
  let actual = url;
  let html = '';
  for (let i = 0; i < 3; i++) {
    html = await texto(actual, { headers: { Referer: i === 0 && referer ? referer : actual } });
    const salto = html.length < 4000 && html.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/i);
    if (!salto) break;
    actual = absoluta(salto[1], actual);
  }
  if (!html) return [];
  const bloque = html.match(/<script type="application\/json">([\s\S]*?)<\/script>(?:\s*<script[^>]*src=["']([^"']+)["'])?/i);
  if (bloque) {
    let cifrado = '';
    try {
      const dato = JSON.parse(bloque[1].trim());
      cifrado = Array.isArray(dato) ? dato[0] : dato;
    } catch (e) {}
    let datos = cifrado ? descifrarVoe(cifrado) : null;
    if (!datos && cifrado && bloque[2]) {
      const cargador = await texto(absoluta(bloque[2], actual), { headers: { Referer: actual } });
      const lista = (cargador.match(/\[(?:\s*'[^']{1,10}'\s*,?){4,12}\]/) || cargador.match(/\[(?:\s*"[^"]{1,10}"\s*,?){4,12}\]/) || [])[0];
      if (lista) datos = descifrarVoe(cifrado, (lista.match(/['"]([^'"]{1,10})['"]/g) || []).map((x) => x.slice(1, -1)));
    }
    const video = datos && (datos.source || datos.direct_access_url);
    if (video) return enlace(video, 'Voe', { Referer: actual, 'User-Agent': UA });
  }
  const directo = html.match(/['"]hls['"]\s*:\s*['"]([^'"]+)['"]/i);
  if (directo) {
    const v = /^aHR0/.test(directo[1]) ? atobSeguro(directo[1]) : directo[1];
    return enlace(v, 'Voe', { Referer: actual, 'User-Agent': UA });
  }
  return enlace(buscarVideo(html, actual), 'Voe', { Referer: actual, 'User-Agent': UA });
}

async function resolverEmpaquetado(url, servidor, referer, siguiendo) {
  const propio = `${origen(url)}/`;
  for (const ref of [...new Set([referer || propio, propio])]) {
    const html = await texto(url, { headers: { Referer: ref } });
    if (!html) continue;
    const codigo = `${desempacar(html)}\n${html}`;
    const links = codigo.match(/links\s*=\s*(\{[^}]+\})/);
    let video = '';
    if (links) {
      try {
        const o = JSON.parse(links[1].replace(/'/g, '"'));
        video = o.hls4 || o.hls3 || o.hls2 || o.hls || '';
      } catch (e) {}
    }
    video = absoluta(video || buscarVideo(codigo, url), url);
    if (video) return enlace(video, servidor, { Referer: propio, Origin: origen(url), 'User-Agent': UA });
    const marco = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    if (marco && !siguiendo) return resolverEmpaquetado(absoluta(marco[1], url), servidor, url, true);
  }
  return [];
}

async function resolverStreamwish(url, referer) {
  const propio = await resolverEmpaquetado(url, 'StreamWish', referer);
  if (propio.length) return propio;
  const id = url.replace(/[?#].*$/, '').split('/').filter(Boolean).pop().replace(/\.html$/, '');
  const espejos = [`https://hglink.to/e/${id}`, `https://streamwish.to/e/${id}`, `https://vibuxer.com/e/${id}`].filter((e) => dominio(e) !== dominio(url));
  const listas = await Promise.all(espejos.map((e) => resolverEmpaquetado(e, 'StreamWish', referer, true)));
  return listas.find((l) => l.length) || [];
}

const SHA_K = Int32Array.from([0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2]);

const SHA_M = new Int32Array(64);

function sha256Palabras(texto) {
  const largo = texto.length;
  const bloques = ((largo + 9 + 63) >> 6) << 4;
  const w = new Int32Array(bloques);
  for (let i = 0; i < largo; i++) w[i >> 2] |= (texto.charCodeAt(i) & 255) << (24 - (i & 3) * 8);
  w[largo >> 2] |= 0x80 << (24 - (largo & 3) * 8);
  w[bloques - 1] = largo * 8;
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a, h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
  const m = SHA_M;
  for (let b = 0; b < bloques; b += 16) {
    for (let i = 0; i < 16; i++) m[i] = w[b + i] | 0;
    for (let i = 16; i < 64; i++) {
      const x = m[i - 15];
      const y = m[i - 2];
      const s0 = ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
      const s1 = ((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10);
      m[i] = (m[i - 16] + s0 + m[i - 7] + s1) | 0;
    }
    let a = h0, bb = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let i = 0; i < 64; i++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const t1 = (h + S1 + ((e & f) ^ (~e & g)) + SHA_K[i] + m[i]) | 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const t2 = (S0 + ((a & bb) ^ (a & c) ^ (bb & c))) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = bb; bb = a; a = (t1 + t2) | 0;
    }
    h0 = (h0 + a) | 0; h1 = (h1 + bb) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0; h4 = (h4 + e) | 0; h5 = (h5 + f) | 0; h6 = (h6 + g) | 0; h7 = (h7 + h) | 0;
  }
  return [h0, h1, h2, h3, h4, h5, h6, h7];
}

function nonceTrabajo(reto, dificultad) {
  for (let n = 0; n < 20000000; n++) {
    const p = sha256Palabras(reto + n);
    let ok = true;
    for (let i = 0; i < dificultad && ok; i++) {
      if (((p[i >> 3] >>> (28 - (i & 7) * 4)) & 15) !== 0) ok = false;
    }
    if (ok) return n;
  }
  return -1;
}

function audioCodigo(codigo) {
  return { LAT: 'Latino', ESP: 'Castellano', CAS: 'Castellano', SUB: 'Subtitulado', '0': 'Latino', '1': 'Castellano', '2': 'Subtitulado' }[String(codigo).toUpperCase()] || '';
}

async function abrirEmbed69(url, referer) {
  return leerEmbed69(await texto(url, { headers: { Referer: referer || 'https://sololatino.net/' } }));
}

function leerEmbed69(html) {
  const bloque = html.match(/dataLink\s*=\s*(\[[\s\S]*?\]);/);
  if (!bloque) return [];
  let grupos = [];
  try {
    grupos = JSON.parse(bloque[1]);
  } catch (e) {
    return [];
  }
  const reto = (html.match(/POW_CHALLENGE\s*=\s*'([^']+)'/) || [])[1];
  const sal = (html.match(/POW_SALT\s*=\s*'([^']+)'/) || [])[1];
  const dificultad = parseInt((html.match(/POW_DIFFICULTY\s*=\s*(\d+)/) || [])[1], 10);
  let clave = null;
  if (reto && sal && dificultad) {
    const n = nonceTrabajo(reto, dificultad);
    if (n < 0) return [];
    clave = CryptoJS.SHA256(reto + n + sal);
  }
  const salida = [];
  for (const g of grupos) {
    const audio = audioCodigo(g.video_language);
    for (const e of g.sortedEmbeds || []) {
      if (!e.link || e.servername === 'download') continue;
      let destino = e.link;
      if (clave) {
        try {
          const crudo = CryptoJS.enc.Base64.parse(e.link);
          const vector = CryptoJS.lib.WordArray.create(crudo.words.slice(0, 4), 16);
          const cuerpo = CryptoJS.lib.WordArray.create(crudo.words.slice(4), crudo.sigBytes - 16);
          destino = CryptoJS.AES.decrypt({ ciphertext: cuerpo }, clave, { iv: vector, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }).toString(CryptoJS.enc.Utf8);
        } catch (err) {
          destino = '';
        }
      }
      if (/^https?:\/\//.test(destino)) salida.push({ url: destino, audio });
    }
  }
  return salida;
}

async function abrirXupalace(url) {
  return leerXupalace(await texto(url, { headers: { Referer: 'https://xupalace.org/' } }));
}

function leerXupalace(html) {
  const salida = [];
  const patron = /go_to_player(?:Vast)?\('(https?:\/\/[^']+)'[^)]*\)[^<]*?(?:data-lang="(\d+)")?/g;
  let m;
  while ((m = patron.exec(html))) salida.push({ url: m[1], audio: m[2] != null ? audioCodigo(m[2]) : '' });
  return salida;
}

function bytesBase64Url(t) {
  let b = String(t || '').replace(/-/g, '+').replace(/_/g, '/');
  while (b.length % 4) b += '=';
  return CryptoJS.enc.Base64.parse(b);
}

async function resolverByse(url) {
  const base = origen(url);
  const codigo = url.replace(/[?#].*$/, '').replace(/\/+$/, '').split('/').pop();
  const detalle = await json(`${base}/api/videos/${codigo}/embed/details`, { headers: { Referer: url, 'X-Requested-With': 'XMLHttpRequest' } });
  const marco = detalle && detalle.embed_frame_url;
  if (!marco) return resolverEmpaquetado(url, 'Filemoon');
  const baseMarco = origen(marco);
  const codigoMarco = marco.replace(/[?#].*$/, '').replace(/\/+$/, '').split('/').pop();
  const play = await json(`${baseMarco}/api/videos/${codigoMarco}/embed/playback`, {
    headers: { Accept: '*/*', Referer: marco, 'X-Embed-Parent': url, 'Accept-Language': 'en-US,en;q=0.5' }
  });
  const p = play && play.playback;
  if (!p || !p.key_parts || !p.payload || !p.iv) return [];
  try {
    const clave = bytesBase64Url(p.key_parts[0]).concat(bytesBase64Url(p.key_parts[1]));
    const claro = CryptoJS.AES.decrypt({ ciphertext: bytesBase64Url(p.payload) }, clave, { iv: bytesBase64Url(p.iv), mode: CryptoJS.mode.GCM, padding: CryptoJS.pad.NoPadding }).toString(CryptoJS.enc.Utf8);
    const datos = JSON.parse(claro.replace(/^\uFEFF/, ''));
    const fuente = datos.sources && datos.sources[0];
    return enlace(fuente && fuente.url, 'Filemoon', { Referer: `${base}/`, 'User-Agent': UA }, calidadTexto(fuente && fuente.label));
  } catch (e) {
    return [];
  }
}

async function resolverDood(url, referer) {
  const embed = url.replace(/\/(d|f|download)\//, '/e/');
  const html = await texto(embed, { headers: { Referer: referer || embed } });
  const m = html.match(/\/pass_md5\/[\w-]+\/([\w-]+)/);
  if (!m) return [];
  const base = origen(embed);
  const prefijo = await texto(base + m[0], { headers: { Referer: embed } });
  if (!/^https?:/.test(prefijo)) return [];
  let azar = '';
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 10; i++) azar += letras[Math.floor(Math.random() * letras.length)];
  return enlace(`${prefijo}${azar}?token=${m[1]}&expiry=${Date.now()}`, 'Doodstream', { Referer: `${base}/`, 'User-Agent': UA });
}

async function resolverStreamtape(url) {
  const html = await texto(url.replace('/v/', '/e/'));
  const m = html.match(/getElementById\(['"](?:robotlink|ideoooolink|botlink)['"]\)\.innerHTML\s*=\s*['"]([^'"]+)['"]\s*\+\s*\(?['"]([^'"]+)['"]\)?(?:\.substring\((\d+)\))?(?:\.substring\((\d+)\))?/);
  if (!m) return [];
  let resto = m[2];
  if (m[3]) resto = resto.substring(parseInt(m[3], 10));
  if (m[4]) resto = resto.substring(parseInt(m[4], 10));
  return enlace(`https:${m[1]}${resto}&stream=1`.replace('https:https:', 'https:'), 'Streamtape', { Referer: 'https://streamtape.com/', 'User-Agent': UA }, '');
}

async function resolverUqload(url, referer) {
  const embed = /embed-/.test(url) ? url : url.replace(/\.(?:com|co|io|net|ws|to|cx|bz)\/(?!embed-)/, (s) => `${s}embed-`);
  const html = await texto(embed, { headers: { Referer: referer || embed } });
  const m = html.match(/sources\s*:\s*\[\s*["']([^"']+)["']/);
  return enlace(m && m[1], 'Uqload', { Referer: `${origen(embed)}/`, 'User-Agent': UA });
}

async function resolverOkru(url) {
  const id = (url.match(/(?:videoembed|video)\/([\d-]+)/) || [])[1];
  if (!id) return [];
  const html = await texto(`https://ok.ru/videoembed/${id}`);
  const m = html.match(/data-options=(["'])(\{[\s\S]+?\})\1/);
  if (!m) return [];
  const cab = { Referer: 'https://ok.ru/', 'User-Agent': UA };
  try {
    const opciones = JSON.parse(entidades(m[2]));
    if (opciones.isExternalPlayer) return [];
    const variables = opciones.flashvars || {};
    let meta = null;
    if (variables.metadata) {
      meta = typeof variables.metadata === 'string' ? JSON.parse(variables.metadata) : variables.metadata;
    } else if (variables.metadataUrl) {
      meta = await json(decodeURIComponent(variables.metadataUrl), {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', Referer: 'https://ok.ru/' },
        body: variables.location ? `st.location=${encodeURIComponent(variables.location)}` : ''
      });
    }
    if (!meta) return [];
    const orden = { ultra: '4K', quad: '1440p', full: '1080p', hd: '720p', sd: '480p', low: '360p', lowest: '240p', mobile: '144p' };
    const videos = (meta.videos || []).filter((v) => v.url && orden[v.name]);
    if (videos.length) {
      videos.sort((a, b) => pesoOk(orden[b.name]) - pesoOk(orden[a.name]));
      return enlace(absoluta(videos[0].url, 'https://ok.ru/'), 'OK.ru', cab, orden[videos[0].name]);
    }
    return enlace(meta.hlsManifestUrl || meta.ondemandHls, 'OK.ru', cab);
  } catch (e) {
    return [];
  }
}

function pesoOk(c) {
  return c === '4K' ? 2160 : parseInt(c, 10) || 0;
}

async function resolverVimeos(url, referer) {
  const embed = /embed-/.test(url) ? url : url.replace(/vimeos\.net\//, 'vimeos.net/embed-');
  const casa = origen(embed);
  const cabeceras = { Referer: `${casa}/`, Origin: casa, 'User-Agent': UA };
  let ultimo = '';
  for (let intento = 0; intento < 3; intento++) {
    const html = await texto(embed, { headers: { Referer: referer || 'https://la.movie/tv/' } });
    const codigo = `${desempacar(html)}\n${html}`;
    const video = (codigo.match(/file\s*:\s*["']([^"']+\.m3u8[^"']*)["']/) || codigo.match(/["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/) || [])[1];
    if (video) {
      ultimo = absoluta(video, embed);
      if (!/[?&]i=/.test(ultimo) || /[?&]i=0\.0(&|$)/.test(ultimo)) break;
    }
    await esperar(400);
  }
  return enlace(ultimo, 'Vimeos', cabeceras);
}

async function resolverMixdrop(url, referer) {
  const embed = url.replace('/f/', '/e/');
  const html = await texto(embed, { headers: { Referer: referer || embed } });
  const codigo = desempacar(html);
  const m = codigo.match(/MDCore\.wurl\s*=\s*["']([^"']+)["']/);
  return enlace(m && absoluta(m[1], embed), 'Mixdrop', { Referer: `${origen(embed)}/`, 'User-Agent': UA });
}

async function resolverGenerico(url, servidor, referer, profundidad) {
  const html = await texto(url, { headers: { Referer: referer || `${origen(url)}/` } });
  if (!html) return [];
  if ((profundidad || 0) < 2 && /dataLink\s*=\s*\[/.test(html)) return resolverAgregado(leerEmbed69(html), url, profundidad || 0);
  if ((profundidad || 0) < 2 && /go_to_player/.test(html)) return resolverAgregado(leerXupalace(html), url, profundidad || 0);
  if (/<script type="application\/json">/i.test(html)) {
    const voe = await resolverVoe(url);
    if (voe.length) return voe;
  }
  const codigo = `${desempacar(html)}\n${html}`;
  const video = buscarVideo(codigo, url) || (html.match(/<meta[^>]+property=["']og:video(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i) || [])[1];
  if (!video) {
    const marco = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    if (marco && (profundidad || 0) < 2) return resolver(absoluta(marco[1], url), url, (profundidad || 0) + 1);
  }
  return enlace(absoluta(video, url), servidor, { Referer: `${origen(url)}/`, 'User-Agent': UA });
}

async function resolverVidmoly(url) {
  const html = await texto(url, { headers: { Referer: 'https://vidmoly.me/' } });
  const marco = html.match(/<iframe[^>]+src=["']([^"']*(?:embed-|vidmoly\.biz)[^"']*)["']/i);
  const pagina = marco ? await texto(absoluta(marco[1], url), { headers: { Referer: url } }) : html;
  const m = pagina.match(/file\s*:\s*["']([^"']+)["']/);
  return enlace(m && m[1], 'VidMoly', { Referer: 'https://vidmoly.me/', 'User-Agent': UA });
}

const COMPLEMENTO_RPM = '\nfunction re(n,e){const t=sa();return re=function(s,i){return s=s-109,t[s]},re(n,e)}\nfunction p(...g){return String.fromCodePoint(...g)}\nfunction v(g,b){return g.codePointAt(b)||0}\nfunction S(g){return __utf8Encode(g)}\nT=()=>{const g=re,b=window[g(263)][g(585)],P="10",k=110,U=1;let M="";const B=v("\u1D5F")[g(321)]()[g(199)]("");for(let de=0;de<B.length;de++)M+=p(P+B[de]);M+=p(v(b,P/10)),M+=M[g(336)](1,3),M+=p(k,k-1,k+7);const se=g(370)[g(199)]("");return M+=p(se[3]+se[2],se[1]+se[2]),M+=p(se[0]*U+U+se[3],se[0]*U+U+se[3]),M+=p(se[3]*P+se[3]*U,se[g(580)]()[g(364)]("")[g(336)](0,2)),S(M)}\nC=()=>{const g=re,b=window[g(263)][g(585)],P=b+"//",k=window.location[g(217)],U=b[g(316)]*P[g(316)],M=1;let B="";for(let me=M;me<10;me++)B+=p(me+U);let se="";se=M+se+M+se+M;const de=se[g(316)]*v(k),Ie=se*M+b.length,I=Ie+4,j=v(b,M),oe=j*M-2;return B+=p(U,se,de,Ie,I,j,oe),S(B)}\n';
const codigoRpm = {};

function bytesUtf8(t) {
  const bytes = [];
  for (let i = 0; i < t.length; i++) {
    const c = t.codePointAt(i);
    if (c > 65535) i++;
    if (c < 128) bytes.push(c);
    else if (c < 2048) bytes.push(192 | (c >> 6), 128 | (c & 63));
    else if (c < 65536) bytes.push(224 | (c >> 12), 128 | ((c >> 6) & 63), 128 | (c & 63));
    else bytes.push(240 | (c >> 18), 128 | ((c >> 12) & 63), 128 | ((c >> 6) & 63), 128 | (c & 63));
  }
  return bytes;
}

function hexDe(bytes) {
  return bytes.map((b) => (`0${(b & 255).toString(16)}`).slice(-2)).join('');
}

async function clavesRpm(base, hash) {
  if (!codigoRpm[base]) {
    const html = await texto(`${base}/`);
    const ruta = (html.match(/src=["'](\/assets\/index-[\w-]+\.js)["']/) || [])[1];
    if (!ruta) return null;
    const js = await texto(`${base}${ruta}`, { headers: { Referer: `${base}/` } });
    const inicio = js.indexOf('function sa(){');
    if (inicio < 0) return null;
    const fin = js.slice(inicio).match(/}\)\(sa,\s*\d+\s*\);/);
    if (!fin) return null;
    codigoRpm[base] = js.slice(inicio, inicio + fin.index + fin[0].length) + COMPLEMENTO_RPM;
  }
  try {
    const ventana = { location: { protocol: 'https:', hash: `#${hash}` } };
    const r = new Function('window', '__utf8Encode', 'parseInt', 'String', `${codigoRpm[base]}\nreturn { T: T(), C: C() };`)(ventana, bytesUtf8, parseInt, String);
    return { clave: CryptoJS.enc.Hex.parse(hexDe(r.T.slice(0, 16))), vector: CryptoJS.enc.Hex.parse(hexDe(r.C.slice(0, 16))) };
  } catch (e) {
    return null;
  }
}

function abrirHexRpm(cifrado, clave, vector) {
  try {
    const claro = CryptoJS.AES.decrypt({ ciphertext: CryptoJS.enc.Hex.parse(cifrado) }, clave, { iv: vector, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }).toString(CryptoJS.enc.Utf8);
    return claro && claro.includes('{') ? claro : '';
  } catch (e) {
    return '';
  }
}

async function listaViva(url, headers) {
  const maestro = await texto(url, { headers });
  if (!/#EXTM3U/i.test(maestro)) return false;
  const hijo = maestro.split(/\r?\n/).find((l) => l.trim() && !l.startsWith('#'));
  if (!hijo) return true;
  return /#EXTM3U/i.test(await texto(absoluta(hijo.trim(), url), { headers }));
}

async function resolverVidstack(url, referer) {
  const base = origen(url);
  const id = url.includes('#') ? url.split('#').pop().replace(/^\//, '').split('&')[0] : ((url.match(/[?&]id=([^&#]+)/) || [])[1] || url.replace(/[?#].*$/, '').split('/').filter(Boolean).pop());
  const fija = CryptoJS.enc.Utf8.parse('kiemtienmua911ca');
  const cabeceras = { Referer: `${base}/`, Origin: base, 'User-Agent': UA };
  const hex = (await texto(`${base}/api/v1/video?id=${encodeURIComponent(id)}&w=1920&h=1080&r=${dominio(referer || '')}`, { headers: cabeceras })).trim();
  let claro = '';
  if (/^[0-9a-f]+$/i.test(hex)) {
    claro = abrirHexRpm(hex, fija, CryptoJS.enc.Utf8.parse('1234567890oiuytr')) || abrirHexRpm(hex, fija, CryptoJS.enc.Utf8.parse('0123456789abcdef'));
    if (!claro) {
      const dinamicas = await clavesRpm(base, id);
      if (dinamicas) claro = abrirHexRpm(hex, dinamicas.clave, dinamicas.vector);
    }
  }
  if (!claro) {
    const r = await json(`${base}/api/v1/video`, {
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest' }, cabeceras),
      body: `url=${encodeURIComponent(id)}`
    });
    if (r && r.payload) {
      try {
        claro = CryptoJS.AES.decrypt(r.payload, fija, { iv: CryptoJS.enc.Utf8.parse('1234567890oiuytr'), mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }).toString(CryptoJS.enc.Utf8);
      } catch (e) {}
    }
  }
  if (!claro) return [];
  let d = {};
  try {
    d = JSON.parse(claro);
  } catch (e) {
    d = { source: ((claro.match(/"source"\s*:\s*"([^"]+)"/) || [])[1] || '') };
  }
  const candidatos = [d.source, d.cfNative, d.hlsVideoTiktok, d.url, d.sources && d.sources[0] && d.sources[0].file]
    .filter(Boolean)
    .map((v) => absoluta(String(v).replace(/\\\//g, '/'), base))
    .map((v) => (/\.txt(\?|$)/.test(v) ? `${v}#index.m3u8` : v));
  const unicos = [...new Set(candidatos)];
  if (unicos.length > 1) {
    for (const c of unicos) {
      if (await listaViva(c, cabeceras)) return enlace(c, 'Rpmvid', cabeceras);
    }
  }
  return enlace(unicos[0], 'Rpmvid', cabeceras);
}

async function resolverDailymotion(url) {
  const id = (url.match(/(?:video\/|video=|dai\.ly\/)([a-z0-9]+)/i) || [])[1];
  if (!id) return [];
  const meta = await json(`https://www.dailymotion.com/player/metadata/video/${id}`);
  const auto = meta && meta.qualities && meta.qualities.auto && meta.qualities.auto[0];
  return enlace(auto && auto.url, 'Dailymotion', { 'User-Agent': UA });
}

async function resolverPixeldrain(url) {
  const id = (url.match(/\/(?:u|l|api\/file)\/([\w-]+)/) || [])[1];
  return id ? enlace(`https://pixeldrain.com/api/file/${id}?download`, 'Pixeldrain', { 'User-Agent': UA }) : [];
}

async function resolverSendvid(url) {
  const html = await texto(url);
  const m = html.match(/property=["']og:video(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i) || html.match(/<source[^>]+src=["']([^"']+)["']/i);
  return enlace(m && m[1], 'Sendvid', { Referer: url, 'User-Agent': UA });
}

async function resolverYourupload(url) {
  const html = await texto(url.replace('/watch/', '/embed/'));
  const m = html.match(/file\s*:\s*['"]([^'"]+)['"]/) || html.match(/property=["']og:video["'][^>]+content=["']([^"']+)["']/i);
  return enlace(m && m[1], 'YourUpload', { Referer: 'https://www.yourupload.com/', 'User-Agent': UA });
}

async function resolverNupload(url) {
  if (!/\/watch\//.test(url)) return resolverGenerico(url, 'Nupload', '', 1);
  const casa = origen(url);
  const html = await texto(url, { headers: { Referer: `${casa}/` } });
  const arreglo = (html.match(/(\w+)\.forEach\s*\([^}]*?atob/) || html.match(/(\w+)\.forEach\s*\(/) || [])[1];
  const sesz = (html.match(/sesz\s*=\s*["']([^"']+)/) || [])[1];
  if (!arreglo || !sesz) return [];
  const desfase = parseInt((html.match(new RegExp(`${arreglo}\\.forEach[^-]+-\\s*(\\d+)`)) || html.match(/parseInt\(.*?replace\(.*?(\d+)/) || [])[1], 10);
  const definicion = html.match(new RegExp(`var\\s+${arreglo}\\s*=\\s*\\[([^\\]]+)\\]`));
  if (!desfase || !definicion) return [];
  const base = (definicion[1].match(/["'][^"']+["']/g) || []).map((x) => {
    const n = parseInt(atobSeguro(x.slice(1, -1)).replace(/\D/g, ''), 10);
    return isNaN(n) ? '' : String.fromCharCode(n - desfase);
  }).join('');
  if (!/^https?:\/\//.test(base)) return [];
  const headers = { Origin: casa, Referer: `${casa}/`, 'User-Agent': UA };
  let destino = `${base}?s=${sesz}`;
  const r = await pedir(destino, { headers });
  if (r && r.ok && r.url) destino = r.url;
  return enlace(destino, 'Nupload', headers);
}

const SERVIDORES = [
  [/voe\.sx|voe-unblock|voeunbl|voeun|v-o-e|voe\./i, 'Voe', (u, r) => resolverVoe(u, r)],
  [/filemoon|moonplayer|kerapoxy|byse|bysezoxexe|bysezejataos|byse[a-z]*|f16px|filemooon|1azayf|smdfs40r/i, 'Filemoon', (u) => resolverByse(u)],
  [/streamwish|swdyu|wishembed|playerwish|strwish|swhoi|wishfast|sfastwish|hlswish|embedwish|awish|dwish|streamhg|hglink|habetar|mwish|kswplayer|swiftplayers|hanerix|cdnwish|flaswish|obeywish|davioad|jodwish|ghbrisk|dhcplay|iplayerhls|cybervynx|dumbalag|wishonly|streamwishplayer|asnwish|nekowish|neko-stream|multimovies|streamhls|vibuxer|hlswish/i, 'StreamWish', (u, r) => resolverStreamwish(u, r)],
  [/vidhide|filelions|ryderjet|dintezuvio|mivalyo|dhtpre|peytonepre|smoothpre|vidhidepre|louishide|lylxan|movearnpre|kinoger|alions|azipcdn|nikaplayer|fviplions|vidhidevip|niikaplayerr|callistanise|dinisglows|vidhideplus|vidhidehub|dingtezuni|minochinos/i, 'VidHide', (u, r) => resolverEmpaquetado(u, 'VidHide', r)],
  [/dood|d0000d|d000d|ds2play|ds2video|dooood|doods|do0od|vide0|vidply|all3do|dood\.|d-s\.io|dsvplay|myvidplay|playmogo|do7go/i, 'Doodstream', (u, r) => resolverDood(u, r)],
  [/streamtape|strtape|stape|tapecontent|streamta\.pe|strcloud|streamadblock/i, 'Streamtape', (u) => resolverStreamtape(u)],
  [/uqload|uqloads/i, 'Uqload', (u, r) => resolverUqload(u, r)],
  [/ok\.ru|odnoklassniki/i, 'OK.ru', (u) => resolverOkru(u)],
  [/mixdrop|mxdrop|mixdroop|m1xdrop|mdbekjwqa|mdfx9dc8n/i, 'Mixdrop', (u, r) => resolverMixdrop(u, r)],
  [/vidmoly/i, 'VidMoly', (u) => resolverVidmoly(u)],
  [/rpmvid|rpmplay|rpmshare|upns\.|vidstack|cubeembed|uns\.bio|p2pplay|4meplayer|p2pstream|strp2p/i, 'Rpmvid', (u, r) => resolverVidstack(u, r)],
  [/dailymotion|dai\.ly/i, 'Dailymotion', (u) => resolverDailymotion(u)],
  [/pixeldrain/i, 'Pixeldrain', (u) => resolverPixeldrain(u)],
  [/sendvid/i, 'Sendvid', (u) => resolverSendvid(u)],
  [/yourupload/i, 'YourUpload', (u) => resolverYourupload(u)],
  [/fastream/i, 'Fastream', (u, r) => resolverEmpaquetado(u, 'Fastream', r)],
  [/nupload/i, 'Nupload', (u) => resolverNupload(u)],
  [/zilla-networks/i, 'PlayerZilla', (u) => enlace(u.replace('/play/', '/m3u8/'), 'PlayerZilla', { Referer: 'https://animeav1.com/', 'User-Agent': UA })],
  [/goodstream/i, 'GoodStream', (u, r) => resolverGenerico(u, 'GoodStream', r, 1)],
  [/vimeos/i, 'Vimeos', (u, r) => resolverVimeos(u, r)],
  [/lulustream|luluvdo|lulu\.st|luluvid/i, 'LuluStream', (u, r) => resolverEmpaquetado(u, 'LuluStream', r)],
  [/mp4upload/i, 'Mp4Upload', (u, r) => resolverGenerico(u.replace(/mp4upload\.com\/(?!embed-)/, 'mp4upload.com/embed-'), 'Mp4Upload', r, 1)],
  [/upstream/i, 'Upstream', (u, r) => resolverEmpaquetado(u, 'Upstream', r)],
  [/streamsilk|savefiles|vembed|vidguard|listeamed|bembed|embedseek|tplayer|turbovid|vidsonic|vidnest|dropcdn|barmonrey/i, '', (u, r) => resolverGenerico(u, nombreServidor(u), r, 1)]
];

const CALIDADES_URLSET = {
  vimeos: { h: '720p', n: '480p' },
  goodstream: { x: '1080p', h: '720p', n: '480p', l: '360p' },
  vidhide: { n: '720p', l: '480p' },
  wish: { x: '1080p', h: '1080p', n: '720p', l: '480p' },
  voe: { n: '720p', l: '360p' }
};

function calidadUrlset(url) {
  const familia = /vimeos/.test(url) ? 'vimeos' : /goodstream/.test(url) ? 'goodstream' : /cloudwindow-route/.test(url) ? 'voe' : /minochinos|vidhide|dintezuvio|dramiyos/.test(url) ? 'vidhide' : /premilkyway|hlswish|vibuxer|streamwish/.test(url) ? 'wish' : '';
  const m = String(url || '').match(/_,([a-z,]+),\.urlset/);
  if (familia && m) {
    const partes = m[1].split(',');
    for (const letra of ['x', 'o', 'h', 'n', 'l']) if (partes.includes(letra) && CALIDADES_URLSET[familia][letra]) return CALIDADES_URLSET[familia][letra];
  }
  return calidadTexto((String(url || '').match(/[_\-/](\d{3,4})p/) || [])[0] || '');
}

async function ligeroWish(url, referer) {
  const destino = url.replace('hglink.to', 'vibuxer.com');
  const casa = origen(destino);
  for (const ref of [...new Set([referer || 'https://embed69.org/', 'https://embed69.org/'])]) {
    const html = await texto(destino, { headers: { Referer: ref, Origin: origen(ref), 'Accept-Language': 'es-MX,es;q=0.9' } });
    if (!html) continue;
    const codigo = `${desempacar(html)}\n${html}`;
    let video = (html.match(/file\s*:\s*["']([^"']+)["']/i) || [])[1] || '';
    if (!video) {
      const bloque = codigo.match(/\{[^{}]*["']?hls[234]["']?\s*:\s*["']([^"']+)["'][^{}]*\}/);
      if (bloque) {
        const opciones = {};
        const par = /["']?(hls[234])["']?\s*:\s*["']([^"']+)["']/g;
        let m;
        while ((m = par.exec(bloque[0]))) opciones[m[1]] = m[2];
        video = opciones.hls4 || opciones.hls3 || opciones.hls2 || '';
      }
    }
    if (!video) video = (codigo.match(/["']([^"']{30,}\.m3u8[^"']*)["']/i) || [])[1] || '';
    if (video) return enlace(absoluta(video, destino), 'StreamWish', { 'User-Agent': UA, Referer: `${casa}/` });
  }
  return [];
}

async function ligeroGoodstream(url) {
  const html = await texto(url, { headers: { Referer: 'https://goodstream.one' } });
  const video = (html.match(/file:\s*"([^"]+)"/) || [])[1];
  return enlace(video, 'GoodStream', { Referer: url, Origin: 'https://goodstream.one', 'User-Agent': UA });
}

async function ligeroLacloud(url, referer) {
  const html = await texto(url, { headers: { Referer: referer || `${origen(url)}/` } });
  const video = (html.match(/const src\s*=\s*["']([^"']+)["']/) || [])[1];
  return enlace(video, 'LaCloud', { Referer: url, 'User-Agent': UA });
}

async function ligeroWaaw(url, referer) {
  const e = url.replace('/f/', '/e/');
  const html = await texto(e, { headers: { Referer: referer || `${origen(e)}/` } });
  const video = (html.match(/https?:\/\/[^\s"'<>\\]+\.m3u8[^\s"'<>\\]*/i) || [])[0] || (html.match(/file\s*:\s*["']([^"']+)["']/i) || [])[1];
  return enlace(video, 'Netu', { 'User-Agent': UA, Referer: e });
}

const LIGEROS = [
  [/goodstream/i, 'GoodStream', (u) => ligeroGoodstream(u)],
  [/hlswish|streamwish|strwish|vibuxer|hglink|swdyu|cybervynx|dumbalag|premilkyway/i, 'StreamWish', (u, r) => ligeroWish(u, r)],
  [/voe\.sx|voe-unblock|voeunbl/i, 'Voe', (u, r) => resolverVoe(u, r)],
  [/vimeos/i, 'Vimeos', (u, r) => resolverVimeos(u, r)],
  [/lacloud/i, 'LaCloud', (u, r) => ligeroLacloud(u, r)],
  [/earnvids|earnl\.|vidnova|streamfort/i, 'EarnVids', (u, r) => resolverEmpaquetado(u, 'EarnVids', r, true)],
  [/vidhide|filelions|minochinos|dintezuvio|dramiyos|dhtpre|mivalyo|dingtezuni|ryderjet|peytonepre|smoothpre/i, 'VidHide', (u, r) => resolverEmpaquetado(u, 'VidHide', r, true)],
  [/dood|d0000d|ds2play|ds2video|dsvplay|myvidplay|do7go/i, 'Doodstream', (u, r) => resolverDood(u.replace('dsvplay.com', 'd0000d.com'), r)],
  [/uqload/i, 'Uqload', (u, r) => resolverUqload(u, r)],
  [/filemoon|bysezejataos|bysezoxexe|bysebuho|byse\./i, 'Filemoon', (u) => resolverByse(u)],
  [/streamtape|strtape|stape/i, 'Streamtape', (u) => resolverStreamtape(u)],
  [/mixdrop|mxdrop|m1xdrop/i, 'Mixdrop', (u, r) => resolverMixdrop(u, r)],
  [/ok\.ru/i, 'OK.ru', (u) => resolverOkru(u)],
  [/fastream/i, 'Fastream', (u, r) => resolverEmpaquetado(u, 'Fastream', r, true)]
];

async function resolverLigero(url, referer) {
  const u = absoluta(url, referer || '');
  if (/\.(m3u8|mp4)(\?|#|$)/i.test(u)) return enlace(u, nombreServidor(u), referer ? { Referer: referer, 'User-Agent': UA } : { 'User-Agent': UA });
  const h = dominio(u);
  const servidor = LIGEROS.find(([patron]) => patron.test(h));
  if (!servidor) return [];
  let salida = [];
  try {
    salida = await servidor[2](u, referer);
  } catch (e) {
    salida = [];
  }
  for (const s of salida) {
    s.servidor = servidor[1];
    if (!s.calidad) s.calidad = calidadUrlset(s.url);
    if (!s.calidad && restante() > 15000) s.calidad = await calidadHls(s.url, s.headers);
  }
  return salida;
}

function nombreServidor(url) {
  const h = dominio(url).replace(/^www\./, '');
  for (const [patron, nombre] of SERVIDORES) if (nombre && patron.test(h)) return nombre;
  const partes = h.split('.');
  const n = partes.length > 1 ? partes[partes.length - 2] : h;
  return n ? n.charAt(0).toUpperCase() + n.slice(1) : 'Directo';
}

async function resolverAgregado(internos, origenUrl, profundidad) {
  const listas = await Promise.all(internos.map(async (x) => {
    const r = await resolver(x.url, origenUrl, profundidad + 1);
    return r.map((s) => Object.assign(s, { audio: s.audio || x.audio }));
  }));
  return [].concat(...listas);
}

async function resolver(url, referer, profundidad) {
  const nivel = profundidad || 0;
  if (!url || nivel > 2) return [];
  const u = absoluta(url, referer || '');
  const uq = u.match(/uqlink\.php\?id=([A-Za-z0-9]+)/);
  if (uq) return resolver(`https://uqload.com/embed-${uq[1]}.html`, referer, nivel + 1);
  const h = dominio(u);
  let salida = [];
  try {
    if (/embed69\./.test(h)) return await resolverAgregado(await abrirEmbed69(u, referer), u, nivel);
    if (/xupalace\./.test(h) && /\/video\//.test(u)) return await resolverAgregado(await abrirXupalace(u), u, nivel);
    const servidor = SERVIDORES.find(([patron]) => patron.test(h)) || (/^https?:\/\/[^/]+\/?#[\w-]+$/.test(u) ? [null, 'Rpmvid', resolverVidstack] : null);
    if (/\.(m3u8|mp4|mkv)(\?|#|$)/i.test(u)) {
      salida = enlace(u, nombreServidor(u), referer ? { Referer: referer, 'User-Agent': UA } : { 'User-Agent': UA });
    } else if (servidor) {
      salida = await servidor[2](u, referer);
      if (!salida.length) salida = await resolverGenerico(u, servidor[1] || nombreServidor(u), referer, nivel);
    } else {
      salida = await resolverGenerico(u, nombreServidor(u), referer, nivel);
    }
  } catch (e) {
    salida = [];
  }
  await Promise.all(salida.map(async (s) => {
    if (!s.calidad) s.calidad = (await calidadHls(s.url, s.headers)) || calidadTexto(s.url);
  }));
  return salida;
}

const TMDB_KEY = '439c478a771f35c05022f9feabcca01c';

async function datosTmdb(tmdbId, tipo) {
  let id = String(tmdbId || '').trim();
  if (/^tt\d+$/.test(id)) {
    const f = await json(`https://api.themoviedb.org/3/find/${id}?api_key=${TMDB_KEY}&external_source=imdb_id`);
    const r = f && (tipo === 'movie' ? f.movie_results : f.tv_results);
    if (!r || !r[0]) return null;
    id = String(r[0].id);
  }
  const ruta = `https://api.themoviedb.org/3/${tipo}/${id}?api_key=${TMDB_KEY}`;
  const [es, en] = await Promise.all([
    json(`${ruta}&language=es-MX&append_to_response=external_ids,alternative_titles`),
    json(`${ruta}&language=en-US`)
  ]);
  if (!es && !en) return null;
  const a = es || {};
  const b = en || {};
  return {
    id,
    titulo: a.title || a.name || b.title || b.name || '',
    ingles: b.title || b.name || '',
    original: a.original_title || a.original_name || b.original_title || b.original_name || '',
    anio: String(a.release_date || a.first_air_date || b.release_date || b.first_air_date || '').slice(0, 4),
    imdb: (a.external_ids && a.external_ids.imdb_id) || a.imdb_id || b.imdb_id || '',
    alternos: ((a.alternative_titles && (a.alternative_titles.results || a.alternative_titles.titles)) || []).map((x) => ({ pais: x.iso_3166_1 || '', titulo: x.title || '' })),
    temporadas: (a.seasons || b.seasons || []).map((x) => ({ numero: Number(x.season_number), episodios: Number(x.episode_count) || 0 }))
  };
}

function encabezado(datos, tipo, temporada, episodio) {
  if (tipo === 'tv') return `${datos.titulo} - T${temporada} E${episodio}`;
  return datos.anio ? `${datos.titulo} (${datos.anio})` : datos.titulo;
}

function slug(t) {
  return normalizar(t).replace(/\s+/g, '-');
}

function titulosPosibles(datos) {
  const vistos = new Set();
  return [datos.titulo, datos.ingles, datos.original].filter((t) => {
    const n = normalizar(t);
    if (!n || vistos.has(n)) return false;
    vistos.add(n);
    return true;
  });
}

const RELLENO = new Set(['ver', 'online', 'gratis', 'latino', 'castellano', 'subtitulado', 'espanol', 'audio', 'hd', 'full', 'completa', 'pelicula', 'serie']);
const VACIAS = new Set(['the', 'and', 'of', 'a', 'el', 'la', 'los', 'las', 'de', 'del', 'y', 'en', 'un', 'una']);

function limpiarTitulo(t) {
  const n = normalizar(String(t || '').replace(/\([^)]*\)|\[[^\]]*\]/g, ' '));
  const limpio = n.split(' ').filter((p) => !RELLENO.has(p)).join(' ');
  return limpio || n;
}

function parecido(a, b) {
  const x = limpiarTitulo(a);
  const y = limpiarTitulo(b);
  if (!x || !y) return 0;
  if (x === y) return 1;
  const [corto, largo] = x.length <= y.length ? [x, y] : [y, x];
  const contiene = ` ${largo} `.includes(` ${corto} `) ? 0.6 + (0.4 * corto.length) / largo.length : 0;
  const px = new Set(x.split(' ').filter((p) => !VACIAS.has(p)));
  const py = new Set(y.split(' ').filter((p) => !VACIAS.has(p)));
  let comunes = 0;
  for (const p of px) if (py.has(p)) comunes++;
  const palabras = px.size && py.size ? comunes / Math.max(px.size, py.size) : 0;
  return Math.max(contiene, palabras);
}

function audioDe(t) {
  const s = normalizar(t);
  if (!s) return '';
  if (/latino|\blat\b|latam|mexic|\bmx\b|419|doblaje latino/.test(s)) return 'Latino';
  if (/castellano|espana|\bcast\b|\besp\b|\bes es\b/.test(s)) return 'Castellano';
  if (/subtitulad|\bvose\b|\bsub\b|\bsubs\b|\bvo\b|japones|ingles|english|original/.test(s)) return 'Subtitulado';
  if (/espanol|spanish/.test(s)) return 'Español';
  return '';
}

function tarjeta(info) {
  const s = {
    name: info.servidor ? `${info.fuente} (${info.servidor})` : info.fuente,
    title: info.titulo,
    url: info.url,
    quality: `Calidad: ${info.calidad || 'Auto'}`,
    provider: info.fuente
  };
  if (info.tamano) s.size = `Tamaño: ${info.tamano}`;
  if (info.audio) s.language = `Audio: ${info.audio}`;
  if (info.headers && Object.keys(info.headers).length) s.headers = info.headers;
  return s;
}

function pesoCalidad(c) {
  if (/4k/i.test(c)) return 2160;
  return Number((String(c || '').match(/(\d{3,4})p/i) || [])[1]) || 0;
}

function pesoAudio(a) {
  return { Latino: 3, 'Español': 2, Castellano: 1 }[a] || 0;
}

async function directo(item) {
  const salida = enlace(item.url, item.servidor || nombreServidor(item.url), item.headers || { 'User-Agent': UA }, item.calidad || '');
  for (const s of salida) if (!s.calidad) s.calidad = (await calidadHls(s.url, s.headers)) || calidadTexto(s.url);
  return salida;
}

async function armar(lista, titulo, fuente, ligero) {
  const vistos = new Set();
  const resolverItem = (item) => (item.directo ? directo(item) : ligero ? resolverLigero(item.url, item.referer) : resolver(item.url, item.referer));
  const resultados = await Promise.all(lista.map((item) => conLimite(resolverItem(item).then((salida) => salida.map((s) => Object.assign({}, s, {
    audio: s.audio || item.audio || '',
    calidad: s.calidad || item.calidad || '',
    tamano: s.tamano || item.tamano || '',
    servidorSitio: item.servidor || ''
  }))), Math.max(1000, CIERRE - 6000 - transcurrido()), [])));
  const tarjetas = [];
  for (const s of [].concat(...resultados)) {
    if (!s.url || vistos.has(s.url)) continue;
    vistos.add(s.url);
    tarjetas.push({
      orden: pesoAudio(s.audio) * 10000 + pesoCalidad(s.calidad),
      t: tarjeta({ titulo, calidad: s.calidad, audio: s.audio, tamano: s.tamano, fuente, servidor: s.servidor || s.servidorSitio, url: s.url, headers: s.headers })
    });
  }
  return tarjetas.sort((a, b) => b.orden - a.orden).map((x) => x.t);
}

async function enCadena(tareas, procesar) {
  const pendientes = tareas.map((tarea) => Promise.resolve().then(tarea).catch(() => []));
  for (const pendiente of pendientes) {
    const lista = await pendiente;
    if (!lista || !lista.length) continue;
    const salida = await procesar(lista);
    if (salida.length) return salida;
  }
  return [];
}

async function enOrden(tareas, procesar) {
  for (const tarea of tareas) {
    const lista = await Promise.resolve().then(tarea).catch(() => []);
    if (!lista || !lista.length) continue;
    const salida = await procesar(lista);
    if (salida.length) return salida;
  }
  return [];
}

function limitar(buscador, respaldo) {
  return (...argumentos) => {
    inicio = Date.now();
    caidos.clear();
    registro = [];
    const trabajo = conLimite(Promise.resolve().then(() => buscador(...argumentos)), CIERRE, null);
    return respaldo ? trabajo.then((salida) => (salida && salida.length ? salida : respaldo(salida === null))) : trabajo.then((salida) => salida || []);
  };
}

function etiquetasOpciones(html) {
  const etiquetas = {};
  const patron = /href=["']#options-(\d+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = patron.exec(html))) {
    const servidor = (m[2].match(/class=["'][^"']*server[^"']*["'][^>]*>([\s\S]*?)<\/span>/i) || [])[1];
    etiquetas[m[1]] = limpiarHtml(servidor || m[2]);
  }
  return etiquetas;
}

async function marcoReal(url, referer) {
  const html = await texto(url, { headers: { Referer: referer } });
  const dentro = html.match(/class=["'][^"']*Video[^"']*["'][\s\S]{0,300}?<iframe[^>]+src=["']([^"']+)["']/i);
  const cualquiera = html.match(/<iframe[^>]+src=["'](https?:\/\/[^"']+)["']/i);
  const destino = (dentro || cualquiera || [])[1];
  return destino ? absoluta(destino, url) : '';
}

async function opcionesToro(html, pagina) {
  const etiquetas = etiquetasOpciones(html);
  const vistos = new Set();
  const marcos = [];
  const patron = /id=["']options-(\d+)["'][\s\S]{0,400}?<iframe[^>]+?(?:data-src|src)=["']([^"']+)["']/gi;
  let m;
  while ((m = patron.exec(html))) {
    const url = absoluta(m[2], pagina);
    if (!vistos.has(url)) {
      vistos.add(url);
      marcos.push({ url, etiqueta: etiquetas[m[1]] || '' });
    }
  }
  if (!marcos.length) {
    const suelto = /<iframe[^>]+?(?:data-src|src)=["']([^"']*trembed=[^"']+)["']/gi;
    while ((m = suelto.exec(html))) {
      const url = absoluta(m[1], pagina);
      if (!vistos.has(url)) {
        vistos.add(url);
        marcos.push({ url, etiqueta: '' });
      }
    }
  }
  const lista = await Promise.all(marcos.map(async (x) => {
    const destino = /trembed=/.test(x.url) ? await marcoReal(x.url, pagina) : x.url;
    if (!destino) return null;
    const partes = x.etiqueta.split(/\s*[-|·]\s*/);
    const audio = partes.map(audioDe).find(Boolean) || '';
    const servidor = partes.find((p) => p && !audioDe(p) && !/^\d+\.?$/.test(p) && !/opci[oó]n/i.test(p)) || '';
    return { url: destino, audio, servidor, referer: pagina };
  }));
  return lista.filter(Boolean);
}

async function episodioAjax(base, pagina, html, temporada, episodio) {
  const post = (html.match(/data-post=["'](\d+)["']/) || [])[1];
  if (!post) return null;
  const cuerpo = `action=action_select_season&season=${temporada}&post=${post}`;
  const respuesta = await texto(`${base}/wp-admin/admin-ajax.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest', Origin: base, Referer: pagina },
    body: cuerpo
  });
  const patron = /href=["']([^"']+)["']/gi;
  let m;
  while ((m = patron.exec(respuesta))) {
    const href = m[1];
    const n = href.match(/temporada-(\d+)-capitulo-(\d+)/i) || href.match(/temporada\/(\d+)\/capitulo\/(\d+)/i) || href.replace(/-capitulo-/i, 'x').match(/(\d+)x(\d+)/);
    if (n && Number(n[1]) === temporada && Number(n[2]) === episodio) return absoluta(href, base);
  }
  return null;
}

const ROMANOS = { ii: 2, iii: 3, iv: 4, v: 5, vi: 6 };

function esLatino(t) {
  const s = String(t || '').trim();
  if (!s) return false;
  return s.replace(/[^\u0000-\u024f]/g, '').length >= s.length * 0.8;
}

function titulosAnime(datos) {
  const alternos = datos.alternos || [];
  const orden = [
    ...alternos.filter((x) => ['JP', 'CN', 'KR'].includes(x.pais)).map((x) => x.titulo),
    datos.original,
    datos.ingles,
    datos.titulo,
    ...alternos.filter((x) => ['US', 'GB', 'MX', 'ES'].includes(x.pais)).map((x) => x.titulo)
  ];
  const vistos = new Set();
  return orden.filter((t) => {
    const n = normalizar(t);
    if (!n || !esLatino(t) || vistos.has(n)) return false;
    vistos.add(n);
    return true;
  }).slice(0, 4);
}

function doblajeDe(nombre) {
  const s = normalizar(nombre);
  if (/\blatino\b/.test(s)) return 'Latino';
  if (/\bcastellano\b/.test(s)) return 'Castellano';
  return 'Subtitulado';
}

function temporadaDe(nombre) {
  const s = normalizar(nombre);
  const m = s.match(/(?:season|temporada|part|parte|cour)\s*(\d+)/) || s.match(/\b(\d+)(?:st|nd|rd|th)\s+season/) || s.match(/\s(\d{1,2})$/);
  if (m) return Number(m[1]);
  const r = s.match(/\b(ii|iii|iv|v|vi)$/);
  return r ? ROMANOS[r[1]] : 1;
}

function nombreBase(nombre) {
  return normalizar(nombre)
    .replace(/\b(?:audio\s+)?(?:latino|castellano|doblaje|sub\s+espanol|espanol)\b/g, ' ')
    .replace(/(?:season|temporada|part|parte|cour)\s*\d+/g, ' ')
    .replace(/\b\d+(?:st|nd|rd|th)\s+season/g, ' ')
    .replace(/\s\d{1,2}$/, ' ')
    .replace(/\b(?:ii|iii|iv|v|vi)$/, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function episodioAbsoluto(datos, temporada, episodio) {
  if (temporada <= 1) return episodio;
  const previas = (datos.temporadas || []).filter((t) => t.numero >= 1 && t.numero < temporada);
  if (previas.length < temporada - 1) return 0;
  return previas.reduce((n, t) => n + t.episodios, 0) + episodio;
}

async function elegirAnime(buscar, datos, tipo, temporada, episodio) {
  const absoluto = tipo === 'tv' ? episodioAbsoluto(datos, temporada, episodio) : 1;
  const mejores = {};
  for (const consulta of titulosAnime(datos)) {
    const resultados = await buscar(consulta).catch(() => []);
    for (const r of resultados) {
      if (!r || !r.url || !r.nombre) continue;
      const audio = r.audio || doblajeDe(r.nombre);
      const sinDoblaje = normalizar(r.nombre).replace(/\b(?:audio\s+)?(?:latino|castellano|doblaje|sub\s+espanol|espanol)\b/g, ' ').replace(/\s+/g, ' ').trim();
      const exacto = [consulta, datos.titulo, datos.ingles].some((t) => normalizar(t) === sinDoblaje);
      const puntos = exacto ? 1 : Math.max(parecido(nombreBase(r.nombre), consulta), parecido(nombreBase(r.nombre), datos.titulo), parecido(nombreBase(r.nombre), datos.ingles));
      if (puntos < 0.8) continue;
      const suya = exacto ? 1 : temporadaDe(r.nombre);
      let numero = 0;
      let extra = 0;
      if (tipo === 'movie') {
        numero = 1;
        extra = /pelicula|movie|film/.test(normalizar(r.nombre)) ? 0.1 : 0;
      } else if (suya === temporada) {
        numero = episodio;
        extra = 0.2;
      } else if (suya === 1 && temporada > 1 && absoluto) {
        numero = absoluto;
      }
      if (!numero) continue;
      const total = puntos + extra;
      const grupo = mejores[audio] || (mejores[audio] = []);
      if (!grupo.some((x) => x.url === r.url)) grupo.push({ url: r.url, audio, numero, total });
    }
    const sub = mejores.Subtitulado;
    if (sub && sub.some((x) => x.total >= 1.2)) break;
  }
  return Object.values(mejores).map((grupo) => grupo.sort((a, b) => b.total - a.total).slice(0, 3));
}

async function flujoAnime(sitio, tmdbId, mediaType, season, episode) {
  const tipo = mediaType === 'movie' ? 'movie' : 'tv';
  const datos = await datosTmdb(tmdbId, tipo);
  if (!datos) return [];
  const temporada = tipo === 'tv' ? Number(season) || 1 : 1;
  const episodio = tipo === 'tv' ? Number(episode) || 1 : 1;
  const elegidos = await elegirAnime(sitio.buscar, datos, tipo, temporada, episodio);
  const listas = await Promise.all(elegidos.map(async (grupo) => {
    for (const c of grupo) {
      const pagina = await sitio.episodio(c.url, c.numero).catch(() => null);
      if (!pagina) continue;
      const enlaces = await sitio.enlaces(pagina).catch(() => []);
      if (enlaces.length) return enlaces.map((e) => Object.assign({ referer: pagina }, e, { audio: e.audio || c.audio }));
    }
    return [];
  }));
  return armar([].concat(...listas), encabezado(datos, tipo, temporada, episodio), sitio.fuente);
}

const FUENTE = 'Henaojara';
const NUEVO = 'https://ww1.henaojara.net';
const CLASICO = 'https://henaojara.com';
const EVITAR = /mega\.nz|mega\.co|hqq|netuplayer|krakenfiles|hj\.henaojara\.com|streamhj\.top/i;

async function buscarNuevo(consulta) {
  const html = await texto(`${NUEVO}/animes?buscar=${encodeURIComponent(consulta).replace(/%20/g, '+')}`, { headers: { Referer: `${NUEVO}/` } });
  const lista = [];
  for (const art of html.split(/<article\b/i).slice(1)) {
    const href = ((art.match(/<a[^>]+href=["']([^"']+)["']/i) || [])[1] || '').replace(/^\.\//, '/');
    if (!/^\/anime\//.test(href)) continue;
    const nombre = limpiarHtml((art.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i) || [])[1]) || entidades((art.match(/<img[^>]+alt=["']([^"']+)["']/i) || [])[1] || '');
    const clase = limpiarHtml((art.match(/<figure[\s\S]*?<a[^>]*>[\s\S]*?<b[^>]*>([\s\S]*?)<\/b>/i) || [])[1]);
    lista.push({ nombre: /pel.cula/i.test(clase) && !/pel.cula|movie/i.test(nombre) ? `${nombre} Pelicula` : nombre, url: `${NUEVO}${href}` });
  }
  return lista;
}

async function buscarClasico(consulta) {
  const html = await texto(`${CLASICO}/?s=${encodeURIComponent(consulta).replace(/%20/g, '+')}`, { headers: { Referer: `${CLASICO}/` } });
  const zona = (html.match(/class=["'][^"']*MovieList[\s\S]*?<\/ul>/i) || [''])[0];
  const lista = [];
  for (const li of zona.split(/<li\b/i).slice(1)) {
    const href = (li.match(/<a[^>]+href=["']([^"']+)["']/i) || [])[1];
    const nombre = limpiarHtml((li.match(/class=["'][^"']*Title[^"']*["'][^>]*>([\s\S]*?)<\//i) || li.match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/i) || [])[1]);
    if (href && nombre) lista.push({ nombre, url: absoluta(href, CLASICO) });
  }
  return lista;
}

async function buscar(consulta) {
  const [a, b] = await Promise.all([buscarNuevo(consulta).catch(() => []), buscarClasico(consulta).catch(() => [])]);
  return a.concat(b);
}

async function episodio(url, numero) {
  if (url.startsWith(NUEVO)) {
    const nombre = url.replace(/\/+$/, '').split('/').pop();
    return `${NUEVO}/ver/${nombre}-${numero}`;
  }
  const html = await texto(url, { headers: { Referer: `${CLASICO}/` } });
  let otro = null;
  const patron = /href=["']([^"']*?-(\d+)x(\d+)\/?)["']/gi;
  let m;
  while ((m = patron.exec(html))) {
    if (Number(m[3]) !== numero) continue;
    if (Number(m[2]) === 1) return absoluta(m[1], CLASICO);
    if (!otro) otro = absoluta(m[1], CLASICO);
  }
  return otro || (numero === 1 ? url : null);
}

function hexATexto(hex) {
  let salida = '';
  for (let i = 0; i + 1 < hex.length; i += 2) salida += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return salida;
}

async function enlacesNuevo(pagina) {
  let actual = pagina;
  let html = await texto(actual, { headers: { Referer: `${NUEVO}/` } });
  if (!/data-encrypt|data-dwn/.test(html)) {
    const sinNumero = pagina.replace(/-\d+$/, '');
    if (sinNumero !== pagina) {
      const otra = await texto(sinNumero, { headers: { Referer: `${NUEVO}/` } });
      if (/data-encrypt|data-dwn/.test(otra)) {
        html = otra;
        actual = sinNumero;
      }
    }
  }
  const urls = [];
  const cifrado = (html.match(/class=["'][^"']*\bopt\b[^"']*["'][^>]*data-encrypt=["']([^"']+)["']/i) || html.match(/data-encrypt=["']([^"']+)["']/i) || [])[1];
  if (cifrado) {
    const servidores = await texto(`${NUEVO}/hj`, {
      method: 'POST',
      headers: { Accept: '*/*', 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest', Referer: actual },
      body: `acc=opt&i=${encodeURIComponent(cifrado)}`
    });
    const patron = /encrypt=["']([0-9a-fA-F]+)["']/g;
    let m;
    while ((m = patron.exec(servidores))) urls.push(hexATexto(m[1]));
  }
  const descargas = (html.match(/data-dwn=["']([^"']+)["']/i) || [])[1];
  if (descargas) {
    try {
      for (const u of JSON.parse(entidades(descargas))) urls.push(u);
    } catch (e) {}
  }
  return urls.filter((u) => /^https?:/.test(u) && !EVITAR.test(u)).map((url) => ({ url, referer: `${NUEVO}/` }));
}

async function enlacesClasico(pagina) {
  const html = await texto(pagina, { headers: { Referer: `${CLASICO}/` } });
  const tareas = [];
  const patron = /class=["'][^"']*TPlayerTb[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi;
  let m;
  while ((m = patron.exec(html))) {
    const contenido = entidades(m[1]);
    const marco = (contenido.match(/<iframe[^>]+src=["']([^"']+)["']/i) || [])[1];
    if (!marco) continue;
    const url = absoluta(marco, pagina);
    tareas.push((async () => {
      const real = /henaojara\./i.test(dominio(url)) ? await marcoReal(url, pagina) : url;
      return real && !EVITAR.test(real) && !/multiplayer/i.test(real) ? { url: real, referer: `${CLASICO}/` } : null;
    })().catch(() => null));
  }
  return (await Promise.all(tareas)).filter(Boolean);
}

async function enlaces(pagina) {
  return pagina.startsWith(NUEVO) ? enlacesNuevo(pagina) : enlacesClasico(pagina);
}

async function getStreams(tmdbId, mediaType, season, episode) {
  try {
    return await flujoAnime({ fuente: FUENTE, buscar, episodio, enlaces }, tmdbId, mediaType, season, episode);
  } catch (e) {
    console.log(`[${FUENTE}] ${e.message}`);
    return [];
  }
}

module.exports = { getStreams: limitar(getStreams) };
