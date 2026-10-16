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

async function paginaVoe(url, opciones) {
  const r = await pedir(url, opciones);
  if (!r || !r.ok) return { html: '', galletas: '', url };
  let html = '';
  try {
    html = (await conLimite(r.text(), 10000, '')) || '';
  } catch (e) {}
  return { html, galletas: cookies(r), url: r.url || url };
}

function unirGalletas(...listas) {
  const todas = new Map();
  for (const lista of listas) {
    for (const par of String(lista || '').split(/;\s*/)) {
      const corte = par.indexOf('=');
      if (corte > 0) todas.set(par.slice(0, corte).trim(), par.slice(corte + 1));
    }
  }
  return [...todas].map(([k, v]) => `${k}=${v}`).join('; ');
}

function bytesHex(hex) {
  const salida = [];
  for (let i = 0; i + 1 < hex.length; i += 2) salida.push(parseInt(hex.slice(i, i + 2), 16));
  return salida;
}

function hexBytes(bytes) {
  let t = '';
  for (const b of bytes) t += (b < 16 ? '0' : '') + b.toString(16);
  return t;
}

function datoAltcha(textoReto, clave) {
  const m = textoReto.match(new RegExp(`"${clave}"\\s*:\\s*(?:"([^"]*)"|(\\d+))`));
  return m ? (m[1] !== undefined ? m[1].replace(/\\\//g, '/') : m[2]) : '';
}

function resolverAltcha(textoReto) {
  const algoritmo = datoAltcha(textoReto, 'algorithm');
  if (algoritmo && !/pbkdf2\/sha-?256/i.test(algoritmo)) return null;
  const nonce = datoAltcha(textoReto, 'nonce');
  const sal = datoAltcha(textoReto, 'salt');
  const prefijo = datoAltcha(textoReto, 'keyPrefix').toLowerCase();
  const costo = parseInt(datoAltcha(textoReto, 'cost'), 10) || 0;
  const largo = parseInt(datoAltcha(textoReto, 'keyLength'), 10) || 32;
  if (!/^[0-9a-f]+$/i.test(nonce) || !/^[0-9a-f]+$/i.test(sal) || !/^[0-9a-f]+$/.test(prefijo) || costo <= 0) return null;
  const nativo = typeof __crypto_pbkdf2_hex === 'function';
  const comienzo = Date.now();
  const tope = nativo ? Math.max(4000, restante() - 12000) : RELOJ ? 9000 : 6000;
  const salBytes = bytesHex(sal);
  const nonceBytes = bytesHex(nonce);
  for (let contador = 0; contador < 50000; contador++) {
    if (Date.now() - comienzo > tope) break;
    const cuenta = [(contador >>> 24) & 255, (contador >>> 16) & 255, (contador >>> 8) & 255, contador & 255];
    let clave = '';
    try {
      clave = nativo ? String(__crypto_pbkdf2_hex(nonce + hexBytes(cuenta), sal, costo, largo * 8, 'SHA256') || '').toLowerCase() : hexBytes(pbkdf2Js(nonceBytes.concat(cuenta), salBytes, costo, largo));
    } catch (e) {
      return null;
    }
    if (clave.startsWith(prefijo)) {
      anotar(`Voe: desafío resuelto con ${contador + 1} intentos en ${((Date.now() - comienzo) / 1000).toFixed(1)}s`);
      return { contador, clave };
    }
    if (!nativo && contador === 0 && (Date.now() - comienzo) * Math.min(Math.pow(16, prefijo.length), 1024) / 2 > tope * 4) break;
  }
  anotar(`Voe: desafío sin resolver en ${((Date.now() - comienzo) / 1000).toFixed(1)}s (costo ${costo})`);
  return null;
}

async function pasarAltchaVoe(pagina) {
  const ficha = (pagina.html.match(/<input[^>]+name=["']_token["'][^>]*>/i) || [''])[0];
  const token = entidades((ficha.match(/value=["']([^"']*)["']/i) || [])[1] || '');
  const widget = (pagina.html.match(/<altcha-widget\b[^>]*>/i) || [''])[0];
  const reto = entidades((widget.match(/\bchallenge(?:-?url)?=["']([^"']+)["']/i) || [])[1] || '').trim();
  if (!token || !reto) return null;
  let galletas = pagina.galletas;
  let textoReto = reto.startsWith('{') ? reto : '';
  if (!textoReto) {
    const r = await pedir(absoluta(reto, pagina.url), { headers: Object.assign({ Referer: pagina.url, Accept: 'application/json, text/plain, */*' }, galletas ? { Cookie: galletas } : {}) });
    if (!r || !r.ok) return null;
    galletas = unirGalletas(galletas, cookies(r));
    textoReto = (await conLimite(r.text(), 10000, '')) || '';
  }
  const solucion = resolverAltcha(textoReto);
  if (!solucion) return null;
  let parametros = (textoReto.match(/"parameters"\s*:\s*(\{[^{}]*\})/) || [])[1];
  if (!parametros) {
    try {
      parametros = JSON.stringify(JSON.parse(textoReto).parameters);
    } catch (e) {}
  }
  const firma = (textoReto.match(/"signature"\s*:\s*"([^"]+)"/) || [])[1];
  if (!parametros || !firma) return null;
  const carga = btoa(`{"challenge":{"parameters":${parametros},"signature":"${firma}"},"solution":{"counter":${solucion.contador},"derivedKey":"${solucion.clave}","time":1}}`);
  const casa = origen(pagina.url);
  for (const valor of [encodeURIComponent(carga), encodeURIComponent(encodeURIComponent(carga))]) {
    const r = await pedir(pagina.url, {
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/x-www-form-urlencoded', Origin: casa, Referer: pagina.url }, galletas ? { Cookie: galletas } : {}),
      body: `_token=${encodeURIComponent(token)}&access=0&altcha=${valor}`
    });
    if (!r || !r.ok) continue;
    const html = (await conLimite(r.text(), 10000, '')) || '';
    if (/<script type="application\/json">/i.test(html)) return { html, galletas: unirGalletas(galletas, cookies(r)), url: r.url || pagina.url };
  }
  return null;
}

async function resolverVoe(url, referer) {
  let actual = url;
  let html = '';
  let pagina = null;
  for (let i = 0; i < 3; i++) {
    pagina = await paginaVoe(actual, { headers: { Referer: i === 0 && referer ? referer : actual } });
    html = pagina.html;
    const salto = html.length < 4000 && html.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/i);
    if (!salto) break;
    actual = absoluta(salto[1], actual);
  }
  if (!html) return [];
  if (/altcha-widget/i.test(html) && !/<script type="application\/json">/i.test(html)) {
    const pasada = await pasarAltchaVoe(pagina);
    if (!pasada) return [];
    html = pasada.html;
    actual = pasada.url;
  }
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

const SHA_INICIAL = Int32Array.from([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]);

function comprimirSha(estado, bloque, salida) {
  const m = SHA_M;
  for (let i = 0; i < 16; i++) m[i] = bloque[i];
  for (let i = 16; i < 64; i++) {
    const x = m[i - 15];
    const y = m[i - 2];
    m[i] = (m[i - 16] + (((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3)) + m[i - 7] + (((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10))) | 0;
  }
  let a = estado[0], b = estado[1], c = estado[2], d = estado[3], e = estado[4], f = estado[5], g = estado[6], h = estado[7];
  for (let i = 0; i < 64; i++) {
    const t1 = (h + (((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7))) + ((e & f) ^ (~e & g)) + SHA_K[i] + m[i]) | 0;
    const t2 = ((((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10))) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
    h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
  }
  salida[0] = (estado[0] + a) | 0; salida[1] = (estado[1] + b) | 0; salida[2] = (estado[2] + c) | 0; salida[3] = (estado[3] + d) | 0;
  salida[4] = (estado[4] + e) | 0; salida[5] = (estado[5] + f) | 0; salida[6] = (estado[6] + g) | 0; salida[7] = (estado[7] + h) | 0;
}

function palabrasDeBytes(bytes, total) {
  const w = new Int32Array(total);
  for (let i = 0; i < bytes.length; i++) w[i >> 2] |= bytes[i] << (24 - (i & 3) * 8);
  return w;
}

function shaBytes(bytes) {
  const largo = bytes.length;
  const total = ((largo + 9 + 63) >> 6) << 4;
  const w = palabrasDeBytes(bytes, total);
  w[largo >> 2] |= 0x80 << (24 - (largo & 3) * 8);
  w[total - 1] = largo * 8;
  const estado = Int32Array.from(SHA_INICIAL);
  for (let i = 0; i < total; i += 16) comprimirSha(estado, w.subarray(i, i + 16), estado);
  const salida = [];
  for (let i = 0; i < 32; i++) salida.push((estado[i >> 2] >>> (24 - (i & 3) * 8)) & 255);
  return salida;
}

function pbkdf2Js(clave, sal, iteraciones, largo) {
  const k = clave.length > 64 ? shaBytes(clave) : clave;
  const interno = new Int32Array(16);
  const externo = new Int32Array(16);
  for (let i = 0; i < 64; i++) {
    const v = i < k.length ? k[i] : 0;
    interno[i >> 2] |= (v ^ 0x36) << (24 - (i & 3) * 8);
    externo[i >> 2] |= (v ^ 0x5c) << (24 - (i & 3) * 8);
  }
  const estadoI = new Int32Array(8);
  const estadoE = new Int32Array(8);
  comprimirSha(SHA_INICIAL, interno, estadoI);
  comprimirSha(SHA_INICIAL, externo, estadoE);
  const bloque = new Int32Array(16);
  bloque[8] = 0x80000000;
  bloque[15] = 768;
  const medio = new Int32Array(8);
  const u = new Int32Array(8);
  const salida = [];
  for (let n = 1; salida.length < largo; n++) {
    const primero = sal.concat([(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]);
    const total = ((primero.length + 9 + 63) >> 6) << 4;
    const w = palabrasDeBytes(primero, total);
    w[primero.length >> 2] |= 0x80 << (24 - (primero.length & 3) * 8);
    w[total - 1] = (primero.length + 64) * 8;
    const estado = Int32Array.from(estadoI);
    for (let i = 0; i < total; i += 16) comprimirSha(estado, w.subarray(i, i + 16), estado);
    for (let i = 0; i < 8; i++) bloque[i] = estado[i];
    comprimirSha(estadoE, bloque, u);
    const t = Int32Array.from(u);
    for (let it = 1; it < iteraciones; it++) {
      for (let i = 0; i < 8; i++) bloque[i] = u[i];
      comprimirSha(estadoI, bloque, medio);
      for (let i = 0; i < 8; i++) bloque[i] = medio[i];
      comprimirSha(estadoE, bloque, u);
      for (let i = 0; i < 8; i++) t[i] ^= u[i];
    }
    for (let i = 0; i < 32 && salida.length < largo; i++) salida.push((t[i >> 2] >>> (24 - (i & 3) * 8)) & 255);
  }
  return salida;
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
  const ids = [id];
  if (!/^x/i.test(id)) {
    const datos = await texto(`https://geo.dailymotion.com/videos/${id}`, { headers: { Accept: 'application/json', Referer: 'https://geo.dailymotion.com/' } });
    const xid = (datos.match(/"xid"\s*:\s*"(x[a-z0-9]+)"/i) || datos.match(/"id"\s*:\s*"(x[a-z0-9]+)"/i) || [])[1];
    if (xid) ids.push(xid);
  }
  for (const v of ids) {
    for (const extra of ['', '?app=com.dailymotion.neon']) {
      const meta = await json(`https://www.dailymotion.com/player/metadata/video/${v}${extra}`);
      const auto = meta && meta.qualities && meta.qualities.auto && meta.qualities.auto[0];
      if (auto && auto.url) return enlace(auto.url, 'Dailymotion', { 'User-Agent': UA });
    }
  }
  return [];
}

async function resolverRumble(url) {
  const id = (url.match(/rumble\.com\/embed\/(?:[0-9a-z]+\.)?([0-9a-z]+)/i) || [])[1];
  if (!id) return [];
  const datos = await json(`https://rumble.com/embedJS/u3/?request=video&ver=2&v=${id}`, { headers: { Accept: 'application/json', Referer: url } });
  const ua = (datos && datos.ua) || {};
  const cabeceras = { Referer: 'https://rumble.com/', 'User-Agent': UA };
  const lista = (v) => (Array.isArray(v) ? v : v && typeof v === 'object' ? Object.keys(v).map((k) => Object.assign({ alto: parseInt(k, 10) || 0 }, v[k])) : []);
  const hls = lista(ua.hls).find((x) => x && x.url);
  if (hls) return enlace(hls.url, 'Rumble', cabeceras);
  const mp4 = lista(ua.mp4).filter((x) => x && x.url).sort((a, b) => ((b.meta && b.meta.h) || b.alto) - ((a.meta && a.meta.h) || a.alto))[0];
  if (mp4) return enlace(mp4.url, 'Rumble', cabeceras, etiquetaAltura((mp4.meta && mp4.meta.h) || mp4.alto));
  const html = await texto(url, { headers: { Referer: 'https://rumble.com/' } });
  const m = html.replace(/\\\//g, '/').match(/https:\/\/rumble\.com\/hls-vod\/[^"'\s]+playlist\.m3u8[^"'\s]*/);
  return enlace(m && m[0], 'Rumble', cabeceras);
}

async function resolverPixeldrain(url) {
  const id = (url.match(/\/(?:u|l|api\/file)\/([\w-]+)/) || [])[1];
  return id ? enlace(`https://pixeldrain.com/api/file/${id}?download`, 'Pixeldrain', { 'User-Agent': UA }) : [];
}

async function resolverSendvid(url) {
  const html = await texto(url);
  if (/temporarily unavailable|temporalmente no disponible|no longer available|has been removed|video not found|video_unavailable|was deleted/i.test(html)) return [];
  const m = html.match(/property=["']og:video(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i) || html.match(/<source[^>]+src=["']([^"']+)["']/i);
  if (m && /unavailable|removed|placeholder|deleted/i.test(m[1])) return [];
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
  [/rumble\.com/i, 'Rumble', (u) => resolverRumble(u)],
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
  const h = dominio(u);
  const servidor = LIGEROS.find(([patron]) => patron.test(h));
  if (/\.(m3u8|mp4)(\?|#|$)/i.test(u) && !(servidor && /\/(?:e|v|embed)\//i.test(u))) return enlace(u, nombreServidor(u), referer ? { Referer: referer, 'User-Agent': UA } : { 'User-Agent': UA });
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
    if (/\.(m3u8|mp4|mkv)(\?|#|$)/i.test(u) && !(servidor && servidor[0] && /\/(?:e|v|embed)\//i.test(u))) {
      salida = enlace(u, nombreServidor(u), referer ? { Referer: referer, 'User-Agent': UA } : { 'User-Agent': UA });
    } else if (servidor) {
      salida = await servidor[2](u, referer);
      if (!salida.length && servidor[1] !== 'Sendvid') salida = await resolverGenerico(u, servidor[1] || nombreServidor(u), referer, nivel);
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
    paises: [].concat(a.origin_country || b.origin_country || [], ((a.production_countries || b.production_countries || []).map((x) => x.iso_3166_1))).filter(Boolean),
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

const TELE = typeof __plugin_sleep !== 'function' && typeof __cheerio_load === 'function';

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
  if (TELE) {
    s.size = [s.quality, s.size].filter(Boolean).join(' • ');
    s.quality = s.name;
  }
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

function muestra(html, patron, ancho) {
  const t = String(html || '');
  const m = patron.exec(t);
  if (!m) return '';
  const desde = Math.max(0, m.index - Math.floor((ancho || 160) / 3));
  return t.slice(desde, desde + (ancho || 160)).replace(/\s+/g, ' ').trim();
}

function contar(html, patron) {
  return (String(html || '').match(patron) || []).length;
}

function tarjetaRastro(fuente, agotado) {
  let lineas = registro.slice();
  if (lineas.length > 22) lineas = lineas.slice(0, 10).concat(['…'], lineas.slice(-11));
  if (agotado) lineas.push('se acabó el tiempo antes de terminar');
  const texto = lineas.length ? lineas.map((l) => `› ${l}`).join('\n') : 'no se hizo ninguna petición';
  return [{
    name: `${fuente} (Diagnóstico)`,
    title: texto,
    url: 'https://example.com/diagnostico',
    quality: texto,
    provider: fuente
  }];
}

const CURVA = {
  p: BigInt('0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff'),
  n: BigInt('0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551'),
  x: BigInt('0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296'),
  y: BigInt('0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5')
};
const CERO = BigInt(0);
const UNO = BigInt(1);
const DOS = BigInt(2);
const TRES = BigInt(3);
const CUATRO = BigInt(4);
const OCHO = BigInt(8);
let dispositivoLuna = '';
let visorLuna = '';
let llaveLuna = null;
let paseLuna = null;
let pendienteLuna = null;
const UA_LUNA = 'Mozilla/5.0 (Linux; Android 16; Pixel 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Mobile Safari/537.36';
const NAVEGADOR_LUNA = {
  'User-Agent': UA_LUNA,
  'Accept-Language': 'es-ES,es;q=0.9',
  'sec-ch-ua': '"Chromium";v="152", "Not?A_Brand";v="24", "Google Chrome";v="152"',
  'sec-ch-ua-mobile': '?1',
  'sec-ch-ua-platform': '"Android"',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-origin'
};
const CLIENTE_LUNA = {
  user_agent: UA_LUNA,
  architecture: '',
  bitness: '64',
  platform: 'Android',
  platform_version: '16',
  model: 'Pixel 10',
  ua_full_version: '152.0.7977.132',
  brand_full_versions: [{ brand: 'Chromium', version: '152.0.7977.132' }, { brand: 'Not?A_Brand', version: '24.0.0.0' }, { brand: 'Google Chrome', version: '152.0.7977.132' }],
  pixel_ratio: 0.9004614353179932,
  screen_width: 1517,
  screen_height: 852,
  color_depth: 24,
  languages: ['es-ES', 'es'],
  timezone: 'America/Mexico_City',
  hardware_concurrency: 4,
  device_memory: 4,
  touch_points: 1,
  webgl_vendor: 'Google Inc. (Intel)',
  webgl_renderer: 'ANGLE (Intel, Mesa Intel(R) UHD Graphics 600 (GLK 2), OpenGL ES 3.2)',
  canvas_hash: 'ziArhzCs61c8-4NE3RN9IokSDXygiLWfYAWc4_nSyI8',
  audio_hash: 'Q6FIrN6OYk4-8qILTIDrwcAVs_cBZ_9oao7-UJIYBF0',
  webgl_params_hash: 'nDMFz00r2AnRtyhZ4DxXxt7qXk5rtn0Jc-5QCeoiE4I',
  fonts_hash: 'MJLQMnY3gnWbA-3d1lqZ6ZzwSkuSoT1eVkUYUCVibSo',
  codecs_hash: 'qJye5DfMLC0co_nw835Vyx_VcUOEnA01Coov9OtwHZs',
  media_devices: 'ai1ao1vi1',
  pointer_type: 'coarse,touch',
  extra: { vendor: 'Google Inc.', appVersion: UA_LUNA.replace(/^Mozilla\//, '') }
};

function resto(a, m) {
  const r = a % m;
  return r < CERO ? r + m : r;
}

function potencia(base, exponente, m) {
  let r = UNO;
  let b = resto(base, m);
  let e = exponente;
  while (e > CERO) {
    if (e & UNO) r = (r * b) % m;
    b = (b * b) % m;
    e >>= UNO;
  }
  return r;
}

function inversoMod(a, m) {
  return potencia(a, m - DOS, m);
}

function doblar(q) {
  const { p } = CURVA;
  if (!q || q[1] === CERO) return null;
  const [x, y, z] = q;
  const delta = (z * z) % p;
  const gamma = (y * y) % p;
  const beta = (x * gamma) % p;
  const alfa = resto(TRES * (x - delta) * (x + delta), p);
  const x3 = resto(alfa * alfa - OCHO * beta, p);
  const z3 = resto((y + z) * (y + z) - gamma - delta, p);
  const y3 = resto(alfa * (CUATRO * beta - x3) - OCHO * gamma * gamma, p);
  return [x3, y3, z3];
}

function sumar(a, b) {
  const { p } = CURVA;
  if (!a) return b;
  if (!b) return a;
  const z1 = (a[2] * a[2]) % p;
  const z2 = (b[2] * b[2]) % p;
  const u1 = (a[0] * z2) % p;
  const u2 = (b[0] * z1) % p;
  const s1 = (((a[1] * z2) % p) * b[2]) % p;
  const s2 = (((b[1] * z1) % p) * a[2]) % p;
  if (u1 === u2) return s1 === s2 ? doblar(a) : null;
  const h = resto(u2 - u1, p);
  const r = resto(s2 - s1, p);
  const h2 = (h * h) % p;
  const h3 = (h2 * h) % p;
  const x3 = resto(r * r - h3 - DOS * u1 * h2, p);
  const y3 = resto(r * (u1 * h2 - x3) - s1 * h3, p);
  const z3 = (((h * a[2]) % p) * b[2]) % p;
  return [x3, y3, z3];
}

function multiplicar(k) {
  let r = null;
  let q = [CURVA.x, CURVA.y, UNO];
  let e = k;
  while (e > CERO) {
    if (e & UNO) r = sumar(r, q);
    q = doblar(q);
    e >>= UNO;
  }
  if (!r) return null;
  const zi = inversoMod(r[2], CURVA.p);
  const zi2 = (zi * zi) % CURVA.p;
  return [(r[0] * zi2) % CURVA.p, (((r[1] * zi2) % CURVA.p) * zi) % CURVA.p];
}

function hexAzar(bytes) {
  let t = '';
  for (let i = 0; i < bytes; i++) t += Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
  return t;
}

function escalarAzar() {
  return resto(BigInt(`0x${hexAzar(40)}`), CURVA.n - UNO) + UNO;
}

function hex32(v) {
  return v.toString(16).padStart(64, '0');
}

function base64Url(palabras) {
  return palabras.toString(CryptoJS.enc.Base64).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function hexUrl(hex) {
  return base64Url(CryptoJS.enc.Hex.parse(hex));
}

function idLuna() {
  return hexUrl(hexAzar(16));
}

function firmarLuna(texto) {
  if (!llaveLuna) {
    const nueva = escalarAzar();
    llaveLuna = { privada: nueva, publica: multiplicar(nueva) };
  }
  const { privada, publica } = llaveLuna;
  const e = BigInt(`0x${CryptoJS.SHA256(CryptoJS.enc.Utf8.parse(texto)).toString(CryptoJS.enc.Hex)}`);
  for (let intento = 0; intento < 8; intento++) {
    const k = escalarAzar();
    const punto = multiplicar(k);
    const r = resto(punto[0], CURVA.n);
    if (r === CERO) continue;
    const s = resto(inversoMod(k, CURVA.n) * (e + r * privada), CURVA.n);
    if (s === CERO) continue;
    return {
      firma: hexUrl(hex32(r) + hex32(s)),
      clave: { crv: 'P-256', ext: true, key_ops: ['verify'], kty: 'EC', x: hexUrl(hex32(publica[0])), y: hexUrl(hex32(publica[1])) }
    };
  }
  return null;
}

function abrirLuna(datos) {
  const partes = (datos.key_parts || []).map(bytesBase64Url);
  const cortas = partes.filter((x) => x.sigBytes === 16);
  if (cortas.length < 2 || !datos.iv || !datos.payload) return '';
  const clave = cortas[0].clone().concat(cortas[1]);
  const vector = bytesBase64Url(datos.iv);
  if (vector.sigBytes !== 12) return '';
  const todo = bytesBase64Url(datos.payload);
  try {
    if (CryptoJS.mode.CTR) {
      const contador = vector.clone().concat(CryptoJS.lib.WordArray.create([2], 4));
      const cifrado = CryptoJS.lib.WordArray.create(todo.words.slice(0, Math.ceil((todo.sigBytes - 16) / 4)), todo.sigBytes - 16);
      return CryptoJS.AES.decrypt({ ciphertext: cifrado }, clave, { iv: contador, mode: CryptoJS.mode.CTR, padding: CryptoJS.pad.NoPadding }).toString(CryptoJS.enc.Utf8);
    }
    if (CryptoJS.mode.GCM) return CryptoJS.AES.decrypt({ ciphertext: todo }, clave, { iv: vector, mode: CryptoJS.mode.GCM, padding: CryptoJS.pad.NoPadding }).toString(CryptoJS.enc.Utf8);
  } catch (e) {
    return '';
  }
  return '';
}

const TABLA_LUNA = new Int32Array(512);

function hashLuna(texto) {
  let a = 1779033703 | 0;
  let b = 3144134277 | 0;
  let c = 1013904242 | 0;
  let d = 2773480762 | 0;
  let x;
  for (let i = 0; i < texto.length; i++) {
    a = (a + (texto.charCodeAt(i) & 255)) | 0;
    a = (a << 7) | (a >>> 25);
    a = (a + b) | 0; x = d ^ a; d = (x << 16) | (x >>> 16);
    c = (c + d) | 0; x = b ^ c; b = (x << 12) | (x >>> 20);
    a = (a + b) | 0; x = d ^ a; d = (x << 8) | (x >>> 24);
    c = (c + d) | 0; x = b ^ c; b = (x << 7) | (x >>> 25);
  }
  for (let i = 0; i < 8; i++) {
    a = (a + b) | 0; x = d ^ a; d = (x << 16) | (x >>> 16);
    c = (c + d) | 0; x = b ^ c; b = (x << 12) | (x >>> 20);
    a = (a + b) | 0; x = d ^ a; d = (x << 8) | (x >>> 24);
    c = (c + d) | 0; x = b ^ c; b = (x << 7) | (x >>> 25);
  }
  const r = TABLA_LUNA;
  for (let i = 0; i < 512; i++) {
    a = (a + b) | 0; x = d ^ a; d = (x << 16) | (x >>> 16);
    c = (c + d) | 0; x = b ^ c; b = (x << 12) | (x >>> 20);
    a = (a + b) | 0; x = d ^ a; d = (x << 8) | (x >>> 24);
    c = (c + d) | 0; x = b ^ c; b = (x << 7) | (x >>> 25);
    r[i] = a ^ c;
  }
  for (let vuelta = 0; vuelta < 2; vuelta++) {
    for (let s = 0; s < 512; s++) {
      let v = (r[s] + r[r[s] & 511]) | 0;
      v = (v << 13) | (v >>> 19);
      v ^= Math.imul(r[(s + 1) & 511], -1640531535);
      r[s] = v;
      a ^= v;
      a = (a + b) | 0; x = d ^ a; d = (x << 16) | (x >>> 16);
      c = (c + d) | 0; x = b ^ c; b = (x << 12) | (x >>> 20);
      a = (a + b) | 0; x = d ^ a; d = (x << 8) | (x >>> 24);
      c = (c + d) | 0; x = b ^ c; b = (x << 7) | (x >>> 25);
    }
  }
  const salida = [];
  for (let i = 0; i < 8; i++) {
    a = (a + b) | 0; x = d ^ a; d = (x << 16) | (x >>> 16);
    c = (c + d) | 0; x = b ^ c; b = (x << 12) | (x >>> 20);
    a = (a + b) | 0; x = d ^ a; d = (x << 8) | (x >>> 24);
    c = (c + d) | 0; x = b ^ c; b = (x << 7) | (x >>> 25);
    let s = a;
    const base = i * 64;
    for (let k = 0; k < 64; k++) {
      const v = r[base + k];
      s = (s + v) | 0;
      s = (s << 5) | (s >>> 27);
      s ^= Math.imul(v, -2048144777);
    }
    salida.push((s ^ c) >>> 0);
  }
  return salida;
}

function cerosLuna(p) {
  let n = 0;
  for (let i = 0; i < p.length; i++) {
    if (p[i] === 0) {
      n += 32;
      continue;
    }
    return n + Math.clz32(p[i]);
  }
  return n;
}

async function trabajoLuna(tarea, tope) {
  if (!(tarea.dificultad > 0)) return '0';
  const prefijo = `${tarea.nonce}:`;
  const comienzo = Date.now();
  for (let n = tarea.siguiente; ; n++) {
    if (cerosLuna(hashLuna(prefijo + n)) >= tarea.dificultad) return String(n);
    if ((n & 1023) === 1023) {
      tarea.siguiente = n + 1;
      if (Date.now() - comienzo > tope) return null;
      if (RELOJ) await esperar(0);
    }
  }
}

async function captchaLuna(baseMarco, codigo, huella, cabeceras, pasos) {
  let tarea = pendienteLuna && pendienteLuna.base === baseMarco && Date.now() < pendienteLuna.vence ? pendienteLuna : null;
  if (tarea) {
    pasos.push(`retomando prueba desde ${tarea.siguiente}`);
  } else {
    const reto = await enviarLuna(`${baseMarco}/api/videos/${codigo}/embed/captcha`, { fingerprint: huella }, cabeceras, pasos);
    if (!reto || !reto.pow_token) return '';
    tarea = { base: baseMarco, codigo, token: reto.pow_token, nonce: String(reto.pow_nonce || ''), dificultad: Number(reto.pow_difficulty) || 0, siguiente: 0, vence: Date.now() + (Number(reto.expires_in) || 25) * 1000 - 4000 };
    pendienteLuna = tarea;
  }
  const tope = Math.max(3000, Math.min(tarea.vence - Date.now(), restante() - 8000));
  const comienzo = Date.now();
  const desde = tarea.siguiente;
  const solucion = await trabajoLuna(tarea, tope);
  pasos.push(`prueba ${tarea.dificultad} ${solucion === null ? 'sin resolver' : 'resuelta'} en ${((Date.now() - comienzo) / 1000).toFixed(1)}s (${(solucion === null ? tarea.siguiente : Number(solucion) + 1) - desde} intentos)`);
  if (solucion === null) return '';
  pendienteLuna = null;
  const r = await enviarLuna(`${baseMarco}/api/videos/${tarea.codigo}/embed/captcha/verify`, { pow_token: tarea.token, solution: solucion, fingerprint: huella }, cabeceras, pasos);
  if (!r || r.status !== 'ok' || !r.token) return '';
  paseLuna = { token: r.token, vence: Date.now() + Math.max(60, (Number(r.expires_in) || 600) - 30) * 1000 };
  return r.token;
}

function paseCompartido(baseMarco, codigo, huella, cabeceras, pasos) {
  if (paseLuna && paseLuna.token && Date.now() < paseLuna.vence) return Promise.resolve(paseLuna.token);
  if (paseLuna && paseLuna.promesa) {
    pasos.push('esperando la prueba de otro servidor');
    return paseLuna.promesa;
  }
  const promesa = captchaLuna(baseMarco, codigo, huella, cabeceras, pasos).catch(() => '');
  paseLuna = { promesa };
  promesa.then((t) => {
    if (!t && paseLuna && paseLuna.promesa === promesa) paseLuna = null;
  });
  return promesa;
}

async function enviarLuna(url, cuerpo, cabeceras, pasos) {
  const r = await pedir(url, { method: 'POST', headers: Object.assign({ Accept: '*/*' }, NAVEGADOR_LUNA, cuerpo === '' ? {} : { 'Content-Type': 'application/json' }, cabeceras), body: cuerpo === '' ? '' : JSON.stringify(cuerpo) });
  const paso = url.replace(/^.*\/api\/videos\//, '').replace(/^[\w-]+\/embed\//, '').replace(/^access\//, '');
  if (!r || !r.status) {
    pasos.push(`${paso} sin respuesta`);
    return null;
  }
  const texto = (await conLimite(r.text(), 10000, '')) || '';
  if (!r.ok) {
    pasos.push(`${paso} ${r.status} ${texto.replace(/\s+/g, ' ').slice(0, 60)}`);
    return null;
  }
  pasos.push(`${paso} ok`);
  try {
    return JSON.parse(texto);
  } catch (e) {
    return null;
  }
}

async function resolverLuna(url) {
  const m = url.match(/\/(?:e|d|download)\/([a-zA-Z0-9]+)/);
  if (!m) return [];
  const pasos = [];
  const base = origen(url);
  const embed = `${base}/e/${m[1]}`;
  const detalle = await json(`${base}/api/videos/${m[1]}/embed/details`, { headers: Object.assign({}, NAVEGADOR_LUNA, { Accept: '*/*', Referer: embed, 'X-Embed-Parent': embed }) });
  const marco = detalle && detalle.embed_frame_url;
  if (!marco) {
    anotar(`Filemoon ${m[1]}: sin marco`);
    return [];
  }
  const baseMarco = origen(marco);
  const cabeceras = { Referer: marco, Origin: baseMarco };
  let acceso = null;
  for (let vuelta = 0; vuelta < 3; vuelta++) {
    const reto = await enviarLuna(`${baseMarco}/api/videos/access/challenge`, '', cabeceras, pasos);
    if (!reto || !reto.nonce || !reto.challenge_id) break;
    const prueba = firmarLuna(reto.nonce);
    if (!prueba) break;
    const conocido = visorLuna && dispositivoLuna;
    const respuesta = await enviarLuna(`${baseMarco}/api/videos/access/attest`, {
      viewer_id: conocido ? visorLuna : '',
      device_id: conocido ? dispositivoLuna : '',
      challenge_id: reto.challenge_id,
      nonce: reto.nonce,
      signature: prueba.firma,
      public_key: prueba.clave,
      client: CLIENTE_LUNA,
      storage: conocido ? { local_storage: visorLuna, indexed_db: `${visorLuna}:${dispositivoLuna}`, cache_storage: `${visorLuna}:${dispositivoLuna}` } : {},
      attributes: { entropy: 'high' }
    }, cabeceras, pasos);
    if (!respuesta || !respuesta.token) break;
    acceso = respuesta;
    if (respuesta.viewer_id) visorLuna = respuesta.viewer_id;
    if (respuesta.device_id) dispositivoLuna = respuesta.device_id;
    pasos.push(`confianza ${Math.round((Number(respuesta.confidence) || 0) * 100)}%`);
    if (conocido && Number(respuesta.confidence) >= 0.85) break;
    if (vuelta > 0 && !conocido) break;
  }
  if (!acceso) {
    anotar(`Filemoon ${m[1]}: sin permiso · ${pasos.join(' → ')}`);
    return [];
  }
  const visor = visorLuna;
  const equipo = dispositivoLuna;
  const huella = { token: acceso.token, viewer_id: acceso.viewer_id || visor, device_id: acceso.device_id || equipo, confidence: acceso.confidence };
  const cabecerasVideo = Object.assign({ 'X-Embed-Parent': embed }, cabeceras);
  const guardado = paseLuna && paseLuna.token && Date.now() < paseLuna.vence ? paseLuna.token : '';
  if (guardado) pasos.push('pase guardado');
  let play = await enviarLuna(`${baseMarco}/api/videos/${m[1]}/embed/playback`, { fingerprint: huella }, guardado ? Object.assign({ 'X-Captcha-Token': guardado }, cabecerasVideo) : cabecerasVideo, pasos);
  if ((!play || !play.playback) && guardado) paseLuna = null;
  if (!play || !play.playback) {
    const pase = await paseCompartido(baseMarco, m[1], huella, cabecerasVideo, pasos);
    if (pase) play = await enviarLuna(`${baseMarco}/api/videos/${m[1]}/embed/playback`, { fingerprint: huella }, Object.assign({ 'X-Captcha-Token': pase }, cabecerasVideo), pasos);
  }
  if (!play || !play.playback) {
    anotar(`Filemoon ${m[1]}: ${pasos.join(' → ')}`);
    return [];
  }
  const claro = abrirLuna(play.playback);
  let fuentes = [];
  try {
    const datos = JSON.parse(claro.replace(/^﻿/, ''));
    fuentes = [].concat(datos.sources || datos.source || []);
  } catch (e) {
    anotar(`Filemoon ${m[1]}: no se pudo descifrar`);
    return [];
  }
  anotar(`Filemoon ${m[1]}: ${pasos.join(' → ')} → video listo`);
  const fuente = fuentes.find((f) => f && /m3u8/.test(f.url || '')) || fuentes[0];
  const destino = typeof fuente === 'string' ? fuente : fuente && fuente.url;
  return enlace(destino, 'Filemoon', { Referer: `${baseMarco}/`, Origin: baseMarco, 'User-Agent': UA_LUNA }, calidadTexto(fuente && fuente.label));
}

const FUENTE = 'PelisGo';
const BASE = 'https://pelisgo.online';
const EVITAR = /youtube|youtu\.be|pixeldrain/i;
let paginaVacia = false;
const NAVEGADOR = {
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
  'Accept-Language': 'es-US,es;q=0.9,en-US;q=0.8,en;q=0.7,es-419;q=0.6',
  'sec-ch-ua': '"Chromium";v="137", "Not-A.Brand";v="24", "Google Chrome";v="137"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1'
};

function campo(obj, nombre) {
  return ((obj.match(new RegExp(`${nombre}[\\\\"' ]+:[\\\\"' ]+([^\\\\"',}]+)`, 'i')) || [])[1] || '').trim();
}

function slugSitio(t) {
  return String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s-]/gi, '').toLowerCase().trim().replace(/\s+/g, '-');
}

function ruta(tipo, s, temporada, episodio) {
  return tipo === 'movie' ? `${BASE}/movies/${s}` : `${BASE}/series/${s}/temporada/${temporada}/episodio/${episodio}`;
}

function conServidores(html) {
  return html && /server[\\"' ]+:/.test(html) ? html : '';
}

let mostrado = false;

async function crudo(url, opciones) {
  const r = await pedir(url, opciones);
  if (!r || !r.status) return { status: 0, html: '' };
  return { status: r.status, html: (await conLimite(r.text(), 10000, '')) || '' };
}

async function revisar(url) {
  const a = await crudo(url, { sinCabeceras: true });
  if (conServidores(a.html)) {
    anotar(`servidores en la página: ${contar(a.html, /\{[^{}]*?server[\\"' ]+:/gi)}`);
    return a.html;
  }
  if (a.status !== 200) return '';
  const b = await crudo(url, { sinCabeceras: true, headers: { RSC: '1' } });
  if (conServidores(b.html)) return b.html;
  if (!mostrado) {
    mostrado = true;
    anotar(`página sin servidores · contiene "404": ${/404/.test(a.html) ? 'sí' : 'no'} · tplayer ${contar(a.html, /tplayer/gi)} · pixeldrain ${contar(a.html, /pixeldrain/gi)} · filemoon ${contar(a.html, /filemoon/gi)}`);
    anotar(`muestra: ${muestra(a.html, /magi|pixeldrain|filemoon|tplayer|servidor|"server/i, 220) || muestra(a.html, /<title/i, 160) || 'vacía'}`);
  }
  return '';
}

async function tplayer(url) {
  const id = (url.match(/\/embed\/([\w-]+)/) || [])[1];
  if (!id) return null;
  const base = origen(url);
  const cabeceras = Object.assign({}, NAVEGADOR, { Referer: url, Origin: base, 'X-Requested-With': 'XMLHttpRequest' });
  const r = await pedir(url, { headers: cabeceras });
  const galletas = r ? cookies(r) : '';
  const pagina = r && r.ok ? (await conLimite(r.text(), 10000, '')) || '' : '';
  const api = `${base}/api/resolve/${id}`;
  let d = await json(api, { headers: cabeceras });
  if ((!d || !d.success || !d.streamUrl) && galletas) d = await json(api, { headers: Object.assign({}, cabeceras, { Cookie: galletas }) });
  const headers = { 'User-Agent': UA, Referer: url, Origin: base };
  if (galletas) headers.Cookie = galletas;
  if (!d || !d.success || !d.streamUrl) {
    anotar(`tplayer: ${d ? JSON.stringify(d).slice(0, 110) : 'la API no devolvió JSON'}`);
    const video = buscarVideo(pagina, url);
    return video ? { url: video, directo: true, headers } : null;
  }
  const video = absoluta(d.streamUrl, base);
  return { url: /\.(m3u8|mp4)/i.test(video) ? video : `${video}#.mp4`, directo: true, headers };
}

async function servidores(html) {
  const objetos = html.match(/\{[^{}]*?server[\\"' ]+:[^{}]*?\}/gi) || [];
  anotar(`servidores: ${objetos.map((o) => `${campo(o, 'server')} ${dominio(campo(o, '(?:url|download)').replace(/\\/g, '')) || '?'}`).join(' | ').slice(0, 160) || 'ninguno'}`);
  const vistos = new Set();
  const tareas = objetos.map(async (obj) => {
    const servidor = campo(obj, 'server');
    let url = campo(obj, '(?:url|download)').replace(/\\/g, '');
    if (!servidor || !url) return null;
    if (/\/download\//.test(url)) {
      const r = await json(`${BASE}/api/download/${url.split('/').pop()}`, { headers: Object.assign({}, NAVEGADOR, { Referer: `${BASE}/`, Origin: BASE, 'X-Requested-With': 'XMLHttpRequest' }) });
      if (!r || !r.url) anotar(`descarga ${servidor}: ${r ? JSON.stringify(r).slice(0, 100) : 'la API no devolvió JSON'}`);
      url = (r && r.url) || '';
    }
    if (!/^https?:/.test(url) || vistos.has(url)) return null;
    vistos.add(url);
    const audio = audioDe(campo(obj, 'language')) || 'Latino';
    const calidad = calidadTexto(campo(obj, 'quality'));
    if (/tplayer\./i.test(url)) {
      const d = await tplayer(url).catch(() => null);
      return d ? Object.assign(d, { audio, calidad, servidor: servidor || 'Magi' }) : null;
    }
    if (/pixeldrain/i.test(url)) return null;
    return { url, audio, calidad, servidor, referer: `${BASE}/` };
  });
  return (await Promise.all(tareas)).filter(Boolean);
}

async function titulosSitio(datos, tipo) {
  const es = await json(`https://api.themoviedb.org/3/${tipo}/${datos.id}?api_key=${TMDB_KEY}&language=es-ES`);
  return [...new Set([datos.titulo, es && (es.title || es.name), datos.ingles, datos.original].concat((datos.alternos || []).map((x) => x.titulo)).filter(Boolean))];
}

async function paginaDirecta(datos, tipo, temporada, episodio) {
  const titulos = await titulosSitio(datos, tipo);
  const candidatos = [];
  for (const t of titulos) {
    const s = slugSitio(t);
    if (s) candidatos.push(s, s.replace(/-\d{4}$/, ''));
  }
  for (const s of [...new Set(candidatos)].filter(Boolean).slice(0, 16)) {
    if (restante() < 20000) break;
    const html = await revisar(ruta(tipo, s, temporada, episodio));
    if (html) return html;
  }
  for (const t of titulos.slice(0, 3)) {
    if (restante() < 15000) break;
    const html = (await crudo(`${BASE}/search?q=${encodeURIComponent(t)}`, { sinCabeceras: true })).html;
    const patron = /href=[\\"']+([^"'\\]*\/(movies|series)\/([\w-]+))[\\"']+/gi;
    let mejor = '';
    let puntos = 0;
    let total = 0;
    let m;
    while ((m = patron.exec(html))) {
      total++;
      if ((tipo === 'movie') !== (m[2] === 'movies')) continue;
      const p = parecido(m[3].replace(/-/g, ' '), t);
      if (p > puntos) {
        puntos = p;
        mejor = m[3];
      }
    }
    anotar(`búsqueda "${t}": ${total} enlaces · mejor ${mejor || 'ninguno'} (${puntos.toFixed(2)})`);
    if (mejor && puntos > 0.7) {
      const pagina = await revisar(ruta(tipo, mejor, temporada, episodio));
      if (pagina) return pagina;
    }
  }
  return '';
}

async function paginaNavegador(datos, tipo, temporada, episodio) {
  const candidatos = [];
  for (const t of titulosPosibles(datos)) {
    const s = slug(t);
    if (s) candidatos.push(s, `${s}-${datos.anio}`);
  }
  for (const s of [...new Set(candidatos)]) {
    const html = conServidores(await texto(ruta(tipo, s, temporada, episodio), { headers: NAVEGADOR }));
    if (html) return html;
  }
  return '';
}


let sesion = null;

function cabecerasApi(referer, sid) {
  const cabeceras = { Accept: '*/*', Referer: referer || `${BASE}/`, 'Cache-Control': 'no-cache', Pragma: 'no-cache' };
  if (sid) cabeceras['x-session-id'] = sid;
  return cabeceras;
}

function sesionApi(referer) {
  if (!sesion || Date.now() >= sesion.vence) sesion = { vence: Date.now() + 540000, promesa: sincronizar(referer) };
  return sesion.promesa;
}

async function sincronizar(referer) {
  const r = await json(`${BASE}/api/session/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: '*/*', Origin: BASE, Referer: referer || `${BASE}/`, 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
    body: ''
  });
  const valor = r && (r.sid || r.sessionId || r.token);
  anotar(`sesión: ${valor ? 'lista' : 'sin respuesta'}`);
  if (!valor) sesion = null;
  return valor || '';
}

function vuelo(html) {
  const crudo = String(html || '');
  let salida = '';
  for (const m of crudo.matchAll(/self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g)) {
    try {
      salida += JSON.parse(`"${m[1]}"`);
    } catch (e) {}
  }
  return salida || crudo;
}

function tipoSitio(tipo) {
  return tipo === 'movie' ? /^movie|pelicula/i : /^serie|^tv|show/i;
}

async function buscar(datos, tipo) {
  const patron = tipoSitio(tipo);
  let mejor = null;
  let puntos = 0;
  for (const t of titulosPosibles(datos)) {
    const r = await json(`${BASE}/api/search?q=${encodeURIComponent(t)}&limit=12`, { headers: cabecerasApi(`${BASE}/search?q=${encodeURIComponent(t)}`) });
    const lista = (r && (r.results || r.data)) || [];
    for (const c of lista) {
      if (!c || !c.slug || (c.type && !patron.test(c.type))) continue;
      let s = 0;
      for (const x of titulosPosibles(datos)) for (const v of [c.title, String(c.title || '').split(/\s*[:|–—-]\s+/)[0]]) s = Math.max(s, parecido(v, x));
      if (c.year && datos.anio) s += Math.abs(Number(c.year) - Number(datos.anio)) <= 1 ? 0.15 : -0.3;
      if (s > puntos) {
        puntos = s;
        mejor = c;
      }
    }
    anotar(`búsqueda "${t}": ${lista.length} resultados${mejor ? ` · mejor: ${mejor.title} (${puntos.toFixed(2)})` : ''}`);
    if (mejor && puntos >= 1) break;
  }
  if (mejor && puntos >= 0.8) return mejor;
  for (const t of titulosPosibles(datos)) {
    const nombre = slug(t);
    if (!nombre) continue;
    const ruta = tipo === 'movie' ? `${BASE}/movies/${nombre}` : `${BASE}/series/${nombre}`;
    const html = await texto(ruta, { headers: { Referer: `${BASE}/` } });
    if (!html) continue;
    const datosPagina = vuelo(html);
    const id = tipo === 'movie' ? (datosPagina.match(/"id":"(c[a-z0-9]{20,})","type":"movie"/) || [])[1] : '';
    anotar(`dirección directa ${rutaCorta(ruta)}${id ? ` · id ${id}` : ''}`);
    if (tipo === 'tv' || id || enlacesPagina(datosPagina).length) return { slug: nombre, id, title: t };
  }
  return null;
}

function arreglo(texto, clave) {
  const inicio = texto.indexOf(`"${clave}":[`);
  if (inicio < 0) return null;
  let i = texto.indexOf('[', inicio);
  const desde = i;
  let nivel = 0;
  let enCadena = false;
  for (; i < texto.length; i++) {
    const c = texto[i];
    if (enCadena) {
      if (c === '\\') i++;
      else if (c === '"') enCadena = false;
      continue;
    }
    if (c === '"') enCadena = true;
    else if (c === '[') nivel++;
    else if (c === ']' && --nivel === 0) {
      try {
        return JSON.parse(texto.slice(desde, i + 1));
      } catch (e) {
        return null;
      }
    }
  }
  return null;
}

function momento(id) {
  return /^c[a-z0-9]{8}/.test(id || '') ? parseInt(id.slice(1, 9), 36) : 0;
}

function idiomaVideo(video, descargas) {
  const t = momento(video.id);
  let cercano = null;
  let distancia = Infinity;
  for (const d of descargas) {
    const x = momento(d.id);
    if (t && x && Math.abs(x - t) < distancia) {
      distancia = Math.abs(x - t);
      cercano = d;
    }
  }
  if (cercano && distancia <= 43200000) return cercano.language || '';
  const idiomas = [...new Set(descargas.map((d) => idiomaPelisGo(d.language)))];
  return idiomas.length === 1 ? idiomas[0] : '';
}

async function episodioSerie(serie, temporada, episodio) {
  const ficha = `${BASE}/series/${serie.slug}`;
  const temporadas = arreglo(vuelo(await texto(ficha, { headers: { Referer: `${BASE}/` } })), 'seasons') || [];
  const t = temporadas.find((x) => x && Number(x.number) === temporada);
  const e = t && (t.episodes || []).find((x) => x && Number(x.number) === episodio);
  anotar(`serie: ${temporadas.length} temporadas · T${temporada}E${episodio}: ${(e && e.id) || 'sin id'}`);
  if (!e || !e.id) return null;
  const todas = (e.downloadLinks || []).filter((d) => d && d.url);
  const videos = (e.videoLinks || []).filter((v) => v && /^https?:/.test(v.url || '')).map((v) => ({ url: v.url, server: '', language: idiomaVideo(v, todas), quality: '' }));
  return { id: e.id, pagina: `${ficha}/temporada/${temporada}/episodio/${episodio}`, videos };
}

async function idEpisodio(serie, temporada, episodio) {
  const pagina = `${BASE}/series/${serie.slug}/temporada/${temporada}/episodio/${episodio}`;
  const datos = vuelo(await texto(pagina, { headers: { Referer: `${BASE}/series/${serie.slug}` } }));
  const id = (datos.match(/"episodeId":"(c[a-z0-9]{20,})"/) || [])[1];
  anotar(`episodio T${temporada}E${episodio}: ${id || 'sin id'}`);
  return id ? { id, pagina } : null;
}

function enlacesPagina(datos) {
  const lista = [];
  for (const m of datos.matchAll(/\{[^{}]*"server":"[^{}]*\}/g)) {
    const valor = (clave) => ((m[0].match(new RegExp(`"${clave}":"([^"]*)"`)) || [])[1] || '').replace(/\\\//g, '/');
    const url = valor('url');
    if (/^https?:/.test(url)) lista.push({ url, server: valor('server'), language: valor('language'), quality: valor('quality') });
  }
  return lista;
}

function idiomaPelisGo(t) {
  const s = normalizar(t);
  if (/castellano|espana|^es$|spain/.test(s)) return 'Castellano';
  if (/subtitulad|vose|ingles|english|original|sub|japon|japan|corean|korean|chino|chinese/.test(s)) return 'Subtitulado';
  return 'Latino';
}

async function unEnlace(e, pagina) {
  const url = String(e.url || '').trim();
  if (!/^https?:\/\//.test(url) || EVITAR.test(`${url} ${e.server || ''}`)) return [];
  const audio = idiomaPelisGo(e.language);
  const nombre = `${e.server || dominio(url)} ${audio}`;
  if (/\.m3u8(\?|$)/i.test(url)) {
    const cabeceras = { Referer: `${BASE}/`, Origin: BASE, 'User-Agent': UA };
    const maestro = await texto(url, { headers: cabeceras, limite: 8000 });
    if (!/#EXTM3U/.test(maestro)) {
      anotar(`${nombre}: sin archivo`);
      return [];
    }
    let alto = 0;
    for (const m of maestro.matchAll(/RESOLUTION=\d+x(\d+)/gi)) alto = Math.max(alto, parseInt(m[1], 10));
    return [{ url, audio, directo: true, servidor: e.server || 'Directo', headers: cabeceras, calidad: etiquetaAltura(alto) || calidadTexto(e.quality) }];
  }
  if (/filemoon|byse/i.test(`${url} ${e.server || ''}`)) {
    const lunas = await resolverLuna(url).catch((err) => {
      anotar(`${nombre}: ${err.message}`);
      return [];
    });
    if (lunas.length) return lunas.map((l) => ({ url: l.url, audio, directo: true, servidor: 'Filemoon', headers: l.headers, calidad: l.calidad || calidadTexto(e.quality) }));
    anotar(`${nombre}: no se pudo abrir`);
    return [];
  }
  if (/tplayer\./i.test(url)) {
    const d = await tplayer(url).catch(() => null);
    return d ? [Object.assign(d, { audio, calidad: calidadTexto(e.quality), servidor: e.server || 'Magi' })] : [];
  }
  return [{ url, audio, referer: pagina, calidad: calidadTexto(e.quality) }];
}

async function lista(enlaces, pagina) {
  anotar(`servidores: ${enlaces.map((e) => `${e.server || dominio(e.url)} ${idiomaPelisGo(e.language)}`).join(' · ').slice(0, 200)}`);
  const grupos = await Promise.all(enlaces.map((e) => unEnlace(e, pagina).catch(() => [])));
  return [].concat(...grupos);
}

async function pedirApi(url, pagina, clave, intento) {
  const sid = await sesionApi(pagina);
  const r = await pedir(url, { headers: cabecerasApi(pagina, sid) });
  if (!r || !r.status) return [];
  const cuerpo = (await conLimite(r.text(), 10000, '')) || '';
  if (!r.ok) {
    anotar(`respuesta de la API: ${cuerpo.replace(/\s+/g, ' ').slice(0, 90) || 'vacía'}`);
    if ((r.status === 401 || r.status === 403) && sid && !intento) {
      sesion = null;
      return pedirApi(url, pagina, clave, true);
    }
    return [];
  }
  try {
    const d = JSON.parse(cuerpo);
    return (d && d[clave || 'links']) || [];
  } catch (e) {
    return [];
  }
}

async function metodoApi(datos, tipo, temporada, episodio) {
  const elegido = await buscar(datos, tipo);
  if (!elegido) return [];
  let pagina = '';
  let api = '';
  let videos = [];
  if (tipo === 'movie') {
    pagina = `${BASE}/movies/${elegido.slug}`;
    if (elegido.id) api = `${BASE}/api/movies/${elegido.id}/stream`;
  } else {
    const ep = (await episodioSerie(elegido, temporada, episodio)) || (await idEpisodio(elegido, temporada, episodio));
    if (!ep) return [];
    pagina = ep.pagina;
    api = `${BASE}/api/series/episode/${ep.id}/stream`;
    videos = ep.videos || [];
  }
  let enlaces = [];
  if (api) {
    enlaces = await pedirApi(api, pagina);
    anotar(`enlaces de la API: ${enlaces.length}`);
  }
  if (!enlaces.length && videos.length) {
    enlaces = videos;
    anotar(`enlaces de la ficha de la serie: ${videos.length}`);
  }
  if (!enlaces.length) {
    const datosPagina = vuelo(await texto(pagina, { headers: { Referer: `${BASE}/` } }));
    enlaces = enlacesPagina(datosPagina);
    paginaVacia = !/"server"\s*:/.test(datosPagina);
    anotar(`enlaces en la página: ${enlaces.length}`);
  }
  const vistos = new Set(enlaces.map((e) => e.url));
  return await lista(enlaces, pagina);
}

async function getStreams(tmdbId, mediaType, season, episode) {
  paginaVacia = false;
  mostrado = false;
  try {
    const tipo = mediaType === 'movie' ? 'movie' : 'tv';
    const datos = await datosTmdb(tmdbId, tipo);
    if (!datos) return [];
    const temporada = Number(season) || 1;
    const episodio = Number(episode) || 1;
    const titulo = encabezado(datos, tipo, temporada, episodio);
    const items = await metodoApi(datos, tipo, temporada, episodio).catch((e) => {
      anotar(`error: ${e.message}`);
      return [];
    });
    if (items.length) {
      const salida = await armar(items, titulo, FUENTE);
      anotar(`tarjetas: ${salida.length} de ${items.length} servidores · ${salida.map((t) => t.name).join(', ').slice(0, 160)}`);
      if (salida.length) return salida;
    }
    if (paginaVacia) return [];
    return await enOrden([
      () => paginaDirecta(datos, tipo, temporada, episodio).then((html) => (html ? servidores(html) : [])),
      () => paginaNavegador(datos, tipo, temporada, episodio).then((html) => (html ? servidores(html) : []))
    ], (grupo) => armar(grupo, titulo, FUENTE, true));
  } catch (e) {
    anotar(`error: ${e.message}`);
    return [];
  }
}

module.exports = { getStreams: limitar(getStreams) };
