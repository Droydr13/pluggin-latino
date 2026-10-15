var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod2) => function __require() {
  return mod2 || (0, cb[__getOwnPropNames(cb)[0]])((mod2 = { exports: {} }).exports, mod2), mod2.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod2) => __copyProps(__defProp({}, "__esModule", { value: true }), mod2);
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/utils/goodstream.js
var require_goodstream = __commonJS({
  "src/utils/goodstream.js"(exports2, module2) {
    var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36";
    function extractQuality(url) {
      if (!url)
        return "HD";
      var match = url.match(/[_\-\/](\d{3,4})p/);
      return match ? match[1] + "p" : "HD";
    }
    async function resolve2(url) {
      try {
        console.log("[GoodStream] Resolviendo: " + url);
        var res = await fetch(url, {
          headers: {
            "User-Agent": UA2,
            "Referer": "https://goodstream.one/",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
          },
          redirect: "follow"
        });
        if (!res.ok)
          throw new Error("HTTP " + res.status);
        var html = await res.text();
        var match = html.match(/file:\s*"([^"]+)"/);
        if (!match) {
          console.log('[GoodStream] No se encontr\xF3 patr\xF3n file:"..."');
          return null;
        }
        var streamUrl = match[1];
        var quality = extractQuality(streamUrl);
        console.log("[GoodStream] URL encontrada (" + quality + "): " + streamUrl.substring(0, 80) + "...");
        return {
          url: streamUrl,
          quality,
          headers: {
            "Referer": url,
            "Origin": "https://goodstream.one",
            "User-Agent": UA2
          }
        };
      } catch (err) {
        console.log("[GoodStream] Error: " + err.message);
        return null;
      }
    }
    module2.exports = { resolve: resolve2 };
  }
});

// src/utils/vimeos.js
var require_vimeos = __commonJS({
  "src/utils/vimeos.js"(exports2, module2) {
    var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
    function getQuality(url) {
      if (!url)
        return "HD";
      var m = url.match(/[_\-\/](\d{3,4})p/);
      return m ? m[1] + "p" : "HD";
    }
    async function resolve2(url) {
      try {
        console.log("[Vimeos] Resolviendo: " + url);
        var res = await fetch(url, {
          headers: {
            "User-Agent": UA2,
            "Referer": "https://vimeos.net/",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
          },
          redirect: "follow"
        });
        if (!res.ok)
          throw new Error("HTTP " + res.status);
        var html = await res.text();
        var packMatch = html.match(/eval\(function\(p,a,c,k,e,[dr]\)\{[\s\S]+?\}\('([\s\S]+?)',(\d+),(\d+),'([\s\S]+?)'\.split\('\|'\)/);
        if (packMatch) {
          let unbase2 = function(str) {
            var r = 0;
            for (var i = 0; i < str.length; i++) {
              r = r * radix + chars.indexOf(str[i]);
            }
            return r;
          };
          var unbase = unbase2;
          var payload = packMatch[1];
          var radix = parseInt(packMatch[2]);
          var symtab = packMatch[4].split("|");
          var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
          var unpacked = payload.replace(/\b([0-9a-zA-Z]+)\b/g, function(token) {
            var idx = unbase2(token);
            return idx >= 0 && idx < symtab.length && symtab[idx] !== "" ? symtab[idx] : token;
          });
          var m3u8Match = unpacked.match(/["']([^"']+\.m3u8[^"']*)["']/i);
          if (m3u8Match) {
            var streamUrl = m3u8Match[1];
            var quality = getQuality(streamUrl);
            console.log("[Vimeos] URL encontrada (" + quality + "): " + streamUrl.substring(0, 80) + "...");
            return {
              url: streamUrl,
              quality,
              headers: {
                "User-Agent": UA2,
                "Referer": "https://vimeos.net/"
              }
            };
          }
        }
        console.log("[Vimeos] No se encontr\xF3 URL");
        return null;
      } catch (err) {
        console.log("[Vimeos] Error: " + err.message);
        return null;
      }
    }
    module2.exports = { resolve: resolve2 };
  }
});

// src/utils/common.js
var require_common = __commonJS({
  "src/utils/common.js"(exports2, module2) {
    var G = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
    function X(e, t) {
      return e >= 3840 || t >= 2160 ? "4K" : e >= 1920 || t >= 1080 ? "1080p" : e >= 1280 || t >= 720 ? "720p" : e >= 854 || t >= 480 ? "480p" : "360p";
    }
    async function g(e, t = {}) {
      try {
        let response = await fetch(e, { headers: { "User-Agent": G, ...t }, redirect: "follow" });
        let i = await response.text();
        if (!i.includes("#EXT-X-STREAM-INF")) {
          let c = e.match(/[_-](\d{3,4})p/);
          return c ? `${c[1]}p` : "1080p";
        }
        let s = 0, r = 0, u = i.split(`
`);
        for (let c of u) {
          let o = c.match(/RESOLUTION=(\d+)x(\d+)/);
          if (o) {
            let l = parseInt(o[1]), f = parseInt(o[2]);
            f > r && (r = f, s = l);
          }
        }
        return r > 0 ? X(s, r) : "1080p";
      } catch (a) {
        return "1080p";
      }
    }
    function get2(url, extraHeaders) {
      var headers = Object.assign({ "User-Agent": G }, extraHeaders || {});
      return fetch(url, { headers, redirect: "follow" }).then(function(res) {
        if (!res.ok)
          throw new Error("HTTP " + res.status + " for " + url);
        var ct = res.headers.get("content-type") || "";
        if (ct.indexOf("json") !== -1)
          return res.json();
        return res.text();
      });
    }
    module2.exports = { g, get: get2 };
  }
});

// src/utils/hlswish.js
var require_hlswish = __commonJS({
  "src/utils/hlswish.js"(exports2, module2) {
    var { g } = require_common();
    var w = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
    function Z(e, t, n) {
      let a = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", i = (s) => {
        let r = 0;
        for (let u = 0; u < s.length; u++) {
          let c = a.indexOf(s[u]);
          if (c === -1)
            return NaN;
          r = r * t + c;
        }
        return r;
      };
      return e.replace(/\b([0-9a-zA-Z]+)\b/g, (s) => {
        let r = i(s);
        return isNaN(r) || r >= n.length ? s : n[r] && n[r] !== "" ? n[r] : s;
      });
    }
    function Y(e, t) {
      let n = e.match(/\{[^{}]*"hls[234]"\s*:\s*"([^"]+)"[^{}]*\}/);
      if (n)
        try {
          let i = n[0].replace(/(\w+)\s*:/g, '"$1":'), s = JSON.parse(i), r = s.hls4 || s.hls3 || s.hls2;
          if (r)
            return r.startsWith("/") ? t + r : r;
        } catch (i) {
          let s = n[0].match(/"hls[234]"\s*:\s*"([^"]+\.m3u8[^"]*)"/);
          if (s) {
            let r = s[1];
            return r.startsWith("/") ? t + r : r;
          }
        }
      let a = e.match(/["']([^"']{30,}\.m3u8[^"']*)['"]/i);
      if (a) {
        let i = a[1];
        return i.startsWith("/") ? t + i : i;
      }
      return null;
    }
    var ee = { "hglink.to": "vibuxer.com", "streamwish.to": "playnixes.com" };
    async function x(e) {
      try {
        let n = e;
        for (let [o, l] of Object.entries(ee))
          if (n.includes(o)) {
            n = n.replace(o, l);
            break;
          }
        let a = (n.match(/^(https?:\/\/[^/]+)/) || [])[1] || "https://hlswish.com";
        console.log(`[HLSWish] Resolviendo: ${e}`);
        let i = await fetch(n, { headers: { "User-Agent": w, Referer: a + "/", Origin: a, Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", "Accept-Language": "es-MX,es;q=0.9" }, redirect: "follow" });
        if (!i.ok)
          throw new Error(`HTTP ${i.status}`);
        let s = await i.text(), r = s.match(/file\s*:\s*["']([^"']+)["']/i);
        if (r) {
          let o = r[1];
          if (o.startsWith("/") && (o = a + o), o.includes("vibuxer.com/stream/")) {
            try {
              let f = (await fetch(o, { headers: { "User-Agent": w, Referer: a + "/" }, redirect: "follow" })).url;
              if (f && f.includes(".m3u8"))
                o = f;
            } catch (l) {
            }
          }
          return { url: o, quality: "1080p", headers: { "User-Agent": w, Referer: a + "/" } };
        }
        let u = s.match(/eval\(function\(p,a,c,k,e,[a-z]\)\{[^}]+\}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/);
        if (u) {
          let o = Z(u[1], parseInt(u[2]), u[4].split("|")), l = Y(o, a);
          if (l)
            return { url: l, quality: "1080p", headers: { "User-Agent": w, Referer: a + "/" } };
        }
        let c = s.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
        return c ? { url: c[0], quality: "1080p", headers: { "User-Agent": w, Referer: a + "/" } } : null;
      } catch (n) {
        return console.log(`[HLSWish] Error: ${n.message}`), null;
      }
    }
    module2.exports = { resolve: x };
  }
});

// src/utils/voe.js
var require_voe = __commonJS({
  "src/utils/voe.js"(exports2, module2) {
    function O(e) {
      try {
        return typeof atob != "undefined" ? atob(e) : Buffer.from(e, "base64").toString("utf8");
      } catch (t) {
        return null;
      }
    }
    function J(e, t) {
      try {
        let a = t.replace(/^\[|\]$/g, "").split("','").map((o) => o.replace(/^'+|'+$/g, "")).map((o) => o.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), i = "";
        for (let o of e) {
          let l = o.charCodeAt(0);
          l > 64 && l < 91 ? l = (l - 52) % 26 + 65 : l > 96 && l < 123 && (l = (l - 84) % 26 + 97), i += String.fromCharCode(l);
        }
        for (let o of a)
          i = i.replace(new RegExp(o, "g"), "_");
        i = i.split("_").join("");
        let s = O(i);
        if (!s)
          return null;
        let r = "";
        for (let o = 0; o < s.length; o++)
          r += String.fromCharCode((s.charCodeAt(o) - 3 + 256) % 256);
        let u = r.split("").reverse().join(""), c = O(u);
        return c ? JSON.parse(c) : null;
      } catch (n) {
        return console.log("[VOE] voeDecode error:", n.message), null;
      }
    }
    var Q = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
    async function E(e, t = {}) {
      return await fetch(e, { method: "GET", headers: { "User-Agent": Q, Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", ...t }, redirect: "follow" });
    }
    var { g } = require_common();
    async function N(e) {
      try {
        console.log(`[VOE] Resolviendo: ${e}`);
        let t = await E(e, { Referer: e });
        if (!t.ok) {
          console.log(`[VOE] Error de red: HTTP ${t.status}`);
          throw new Error(`HTTP ${t.status}`);
        }
        let n = await t.text();
        if (/permanentToken/i.test(n)) {
          console.log(`[VOE] Se detect\xF3 permanentToken, siguiendo redirecci\xF3n interna...`);
          let c = n.match(/window\.location\.href\s*=\s*'([^']+)'/i);
          if (c) {
            console.log(`[VOE] Redirecci\xF3n interna a: ${c[1]}`);
            let o = await E(c[1], { Referer: e });
            if (o.ok) {
              n = await o.text();
            } else {
              console.log(`[VOE] Error al seguir redirecci\xF3n interna: HTTP ${o.status}`);
            }
          }
        }
        let a = n.match(/json">\s*\[\s*['"]([^'"]+)['"]\s*\]\s*<\/script>\s*<script[^>]*src=['"]([^'"]+)['"]/i);
        if (a) {
          console.log(`[VOE] Encontrado bloque JSON y tag script de desencriptaci\xF3n.`);
          let c = a[1], o = a[2].startsWith("http") ? a[2] : new URL(a[2], e).href;
          console.log(`[VOE] Cargando script de desencriptaci\xF3n desde: ${o}`);
          let l = await E(o, { Referer: e }), f = l.ok ? await l.text() : "";
          if (!l.ok) {
            console.log(`[VOE] Error cargando script de desencriptaci\xF3n: HTTP ${l.status}`);
          }
          let h = f.match(/(\[(?:'[^']{1,10}'[\s,]*){4,12}\])/i) || f.match(/(\[(?:"[^"]{1,10}"[,\s]*){4,12}\])/i);
          if (h) {
            console.log(`[VOE] Claves encontradas en script JS: ${h[1]}. Iniciando decodificaci\xF3n...`);
            let d = J(c, h[1]);
            console.log(`[VOE] Resultado de decodificaci\xF3n:`, d ? "\xC9xito (objeto obtenido)" : "Fallo (null)");
            if (d && (d.source || d.direct_access_url)) {
              let m = d.source || d.direct_access_url, $ = await g(m, { Referer: e });
              console.log(`[VOE] URL final obtenida: ${m} | Calidad: ${$}`);
              return { url: m, quality: $, headers: { Referer: e } };
            }
          } else {
            console.log(`[VOE] No se encontraron las claves de decodificaci\xF3n en el script JS.`);
          }
        } else {
          console.log(`[VOE] No se encontr\xF3 estructura JSON + script est\xE1ndar. Intentando buscar streams crudos en HTML...`);
        }
        let i = /(?:mp4|hls)'\s*:\s*'([^']+)'/gi, s = /(?:mp4|hls)"\s*:\s*"([^"]+)"/gi, r = [], u;
        while ((u = i.exec(n)) !== null)
          r.push(u);
        while ((u = s.exec(n)) !== null)
          r.push(u);
        console.log(`[VOE] Coincidencias de streams crudos encontradas: ${r.length}`);
        for (let c of r) {
          let o = c[1];
          if (!o)
            continue;
          let l = o;
          if (l.startsWith("aHR0")) {
            try {
              l = atob(l);
              console.log(`[VOE] Decodificada URL en Base64: ${l}`);
            } catch (f) {
              console.log(`[VOE] Error al decodificar Base64: ${f.message}`);
            }
          }
          console.log(`[VOE] URL cruda final: ${l}`);
          return { url: l, quality: await g(l, { Referer: e }), headers: { Referer: e } };
        }
        console.log(`[VOE] No se pudo resolver ning\xFAn stream para: ${e}`);
        return null;
      } catch (t) {
        console.log(`[VOE] Error cr\xEDtico en resolvedor para ${e}: ${t.message}
Stack: ${t.stack}`);
        return null;
      }
    }
    module2.exports = { resolve: N, decode: J };
  }
});

// node_modules/@noble/ciphers/utils.js
function isBytes(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in a && a.BYTES_PER_ELEMENT === 1;
}
function abool(b) {
  if (typeof b !== "boolean")
    throw new TypeError(`boolean expected, not ${b}`);
}
function anumber(n) {
  if (typeof n !== "number")
    throw new TypeError("number expected, got " + typeof n);
  if (!Number.isSafeInteger(n) || n < 0)
    throw new RangeError("positive integer expected, got " + n);
}
function abytes(value, length, title = "") {
  const bytes = isBytes(value);
  const len = value?.length;
  const needsLen = length !== void 0;
  if (!bytes || needsLen && len !== length) {
    const prefix = title && `"${title}" `;
    const ofLen = needsLen ? ` of length ${length}` : "";
    const got = bytes ? `length=${len}` : `type=${typeof value}`;
    const message = prefix + "expected Uint8Array" + ofLen + ", got " + got;
    if (!bytes)
      throw new TypeError(message);
    throw new RangeError(message);
  }
  return value;
}
function aexists(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance.finished)
    throw new Error("Hash#digest() has already been called");
}
function aoutput(out, instance, onlyAligned = false) {
  abytes(out, void 0, "output");
  const min = instance.outputLen;
  if (out.length < min) {
    throw new RangeError("digestInto() expects output buffer of length at least " + min);
  }
  if (onlyAligned && !isAligned32(out))
    throw new Error("invalid output, must be aligned");
}
function u8(arr) {
  return new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
}
function u32(arr) {
  return new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
}
function clean(...arrays) {
  for (let i = 0; i < arrays.length; i++) {
    arrays[i].fill(0);
  }
}
function createView(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
function overlapBytes(a, b) {
  if (!a.byteLength || !b.byteLength)
    return false;
  return a.buffer === b.buffer && // best we can do, may fail with an obscure Proxy
  a.byteOffset < b.byteOffset + b.byteLength && // a starts before b end
  b.byteOffset < a.byteOffset + a.byteLength;
}
function complexOverlapBytes(input, output) {
  if (overlapBytes(input, output) && input.byteOffset < output.byteOffset)
    throw new Error("complex overlap of input and output is not supported");
}
function concatBytes(...arrays) {
  let sum = 0;
  for (let i = 0; i < arrays.length; i++) {
    const a = arrays[i];
    abytes(a);
    sum += a.length;
  }
  const res = new Uint8Array(sum);
  for (let i = 0, pad = 0; i < arrays.length; i++) {
    const a = arrays[i];
    res.set(a, pad);
    pad += a.length;
  }
  return res;
}
function equalBytes(a, b) {
  if (a.length !== b.length)
    return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++)
    diff |= a[i] ^ b[i];
  return diff === 0;
}
function wrapMacConstructor(keyLen, macCons, fromMsg) {
  const mac = macCons;
  const getArgs = fromMsg || (() => []);
  const macC = (msg, key) => mac(key, ...getArgs(msg)).update(msg).digest();
  const tmp = mac(new Uint8Array(keyLen), ...getArgs(new Uint8Array(0)));
  macC.outputLen = tmp.outputLen;
  macC.blockLen = tmp.blockLen;
  macC.create = (key, ...args) => mac(key, ...args);
  return macC;
}
function getOutput(expectedLength, out, onlyAligned = true) {
  if (out === void 0)
    return new Uint8Array(expectedLength);
  abytes(out, void 0, "output");
  if (out.length !== expectedLength)
    throw new Error('"output" expected Uint8Array of length ' + expectedLength + ", got: " + out.length);
  if (onlyAligned && !isAligned32(out))
    throw new Error("invalid output, must be aligned");
  return out;
}
function u64Lengths(dataLength, aadLength, isLE2) {
  anumber(dataLength);
  anumber(aadLength);
  abool(isLE2);
  const num = new Uint8Array(16);
  const view = createView(num);
  view.setBigUint64(0, BigInt(aadLength), isLE2);
  view.setBigUint64(8, BigInt(dataLength), isLE2);
  return num;
}
function isAligned32(bytes) {
  return bytes.byteOffset % 4 === 0;
}
function copyBytes(bytes) {
  return Uint8Array.from(abytes(bytes));
}
var isLE, byteSwap, swap8IfBE, byteSwap32, swap32IfBE, wrapCipher;
var init_utils = __esm({
  "node_modules/@noble/ciphers/utils.js"() {
    isLE = /* @__PURE__ */ (() => new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68)();
    byteSwap = (word) => word << 24 & 4278190080 | word << 8 & 16711680 | word >>> 8 & 65280 | word >>> 24 & 255;
    swap8IfBE = isLE ? (n) => n : (n) => byteSwap(n) >>> 0;
    byteSwap32 = (arr) => {
      for (let i = 0; i < arr.length; i++)
        arr[i] = byteSwap(arr[i]);
      return arr;
    };
    swap32IfBE = isLE ? (u) => u : byteSwap32;
    wrapCipher = /* @__NO_SIDE_EFFECTS__ */ (params, constructor) => {
      function wrappedCipher(key, ...args) {
        abytes(key, void 0, "key");
        if (params.nonceLength !== void 0) {
          const nonce = args[0];
          abytes(nonce, params.varSizeNonce ? void 0 : params.nonceLength, "nonce");
        }
        const tagl = params.tagLength;
        if (tagl && args[1] !== void 0)
          abytes(args[1], void 0, "AAD");
        const cipher = constructor(key, ...args);
        const checkOutput = (fnLength, output) => {
          if (output !== void 0) {
            if (fnLength !== 2)
              throw new Error("cipher output not supported");
            abytes(output, void 0, "output");
          }
        };
        let called = false;
        const wrCipher = {
          encrypt(data, output) {
            if (called)
              throw new Error("cannot encrypt() twice with same key + nonce");
            called = true;
            abytes(data);
            checkOutput(cipher.encrypt.length, output);
            return cipher.encrypt(data, output);
          },
          decrypt(data, output) {
            abytes(data);
            if (tagl && data.length < tagl)
              throw new Error('"ciphertext" expected length bigger than tagLength=' + tagl);
            checkOutput(cipher.decrypt.length, output);
            return cipher.decrypt(data, output);
          }
        };
        return wrCipher;
      }
      Object.assign(wrappedCipher, params);
      return wrappedCipher;
    };
  }
});

// node_modules/@noble/ciphers/_polyval.js
function _toGHASHKey(k) {
  k.reverse();
  const hiBit = k[15] & 1;
  let carry = 0;
  for (let i = 0; i < k.length; i++) {
    const t = k[i];
    k[i] = t >>> 1 | carry;
    carry = (t & 1) << 7;
  }
  k[0] ^= -hiBit & 225;
  return k;
}
var BLOCK_SIZE, ZEROS16, ZEROS32, POLY, mul2, swapLE, swap8IfLE, estimateWindow, GHASH, Polyval, ghash, polyval;
var init_polyval = __esm({
  "node_modules/@noble/ciphers/_polyval.js"() {
    init_utils();
    BLOCK_SIZE = 16;
    ZEROS16 = /* @__PURE__ */ new Uint8Array(16);
    ZEROS32 = /* @__PURE__ */ u32(ZEROS16);
    POLY = 225;
    mul2 = (s0, s1, s2, s3) => {
      const hiBit = s3 & 1;
      return {
        s3: s2 << 31 | s3 >>> 1,
        s2: s1 << 31 | s2 >>> 1,
        s1: s0 << 31 | s1 >>> 1,
        // NIST SP 800-38D Â§6.3 applies `V >> 1` and XORs R on carry. In this
        // 4x32-bit split, R = 0xe1 || 0^120 lives in the top byte of s0.
        s0: s0 >>> 1 ^ POLY << 24 & -(hiBit & 1)
        // reduce % poly
      };
    };
    swapLE = (n) => (n >>> 0 & 255) << 24 | (n >>> 8 & 255) << 16 | (n >>> 16 & 255) << 8 | n >>> 24 & 255 | 0;
    swap8IfLE = (n) => swap8IfBE(swapLE(n));
    estimateWindow = (bytes) => {
      if (bytes > 64 * 1024)
        return 8;
      if (bytes > 1024)
        return 4;
      return 2;
    };
    GHASH = class {
      // We select bits per window adaptively based on expectedLength
      constructor(key, expectedLength) {
        __publicField(this, "blockLen", BLOCK_SIZE);
        __publicField(this, "outputLen", BLOCK_SIZE);
        __publicField(this, "s0", 0);
        __publicField(this, "s1", 0);
        __publicField(this, "s2", 0);
        __publicField(this, "s3", 0);
        __publicField(this, "finished", false);
        __publicField(this, "destroyed", false);
        __publicField(this, "t");
        __publicField(this, "W");
        __publicField(this, "windowSize");
        abytes(key, 16, "key");
        key = copyBytes(key);
        const kView = createView(key);
        let k0 = kView.getUint32(0, false);
        let k1 = kView.getUint32(4, false);
        let k2 = kView.getUint32(8, false);
        let k3 = kView.getUint32(12, false);
        const doubles = [];
        for (let i = 0; i < 128; i++) {
          doubles.push({ s0: swapLE(k0), s1: swapLE(k1), s2: swapLE(k2), s3: swapLE(k3) });
          ({ s0: k0, s1: k1, s2: k2, s3: k3 } = mul2(k0, k1, k2, k3));
        }
        const W = estimateWindow(expectedLength || 1024);
        if (![1, 2, 4, 8].includes(W))
          throw new Error("ghash: invalid window size, expected 2, 4 or 8");
        this.W = W;
        const bits = 128;
        const windows = bits / W;
        const windowSize = this.windowSize = 2 ** W;
        const items = [];
        for (let w = 0; w < windows; w++) {
          for (let byte = 0; byte < windowSize; byte++) {
            let s0 = 0, s1 = 0, s2 = 0, s3 = 0;
            for (let j = 0; j < W; j++) {
              const bit = byte >>> W - j - 1 & 1;
              if (!bit)
                continue;
              const { s0: d0, s1: d1, s2: d2, s3: d3 } = doubles[W * w + j];
              s0 ^= d0, s1 ^= d1, s2 ^= d2, s3 ^= d3;
            }
            items.push({ s0, s1, s2, s3 });
          }
        }
        this.t = items;
      }
      _updateBlock(s0, s1, s2, s3) {
        s0 ^= this.s0, s1 ^= this.s1, s2 ^= this.s2, s3 ^= this.s3;
        const { W, t, windowSize } = this;
        let o0 = 0, o1 = 0, o2 = 0, o3 = 0;
        const mask = (1 << W) - 1;
        let w = 0;
        for (const num of [s0, s1, s2, s3]) {
          for (let bytePos = 0; bytePos < 4; bytePos++) {
            const byte = num >>> 8 * bytePos & 255;
            for (let bitPos = 8 / W - 1; bitPos >= 0; bitPos--) {
              const bit = byte >>> W * bitPos & mask;
              const { s0: e0, s1: e1, s2: e2, s3: e3 } = t[w * windowSize + bit];
              o0 ^= e0, o1 ^= e1, o2 ^= e2, o3 ^= e3;
              w += 1;
            }
          }
        }
        this.s0 = o0;
        this.s1 = o1;
        this.s2 = o2;
        this.s3 = o3;
      }
      update(data) {
        aexists(this);
        abytes(data);
        data = copyBytes(data);
        const b32 = u32(data);
        const blocks = Math.floor(data.length / BLOCK_SIZE);
        const left = data.length % BLOCK_SIZE;
        for (let i = 0; i < blocks; i++) {
          this._updateBlock(swap8IfBE(b32[i * 4 + 0]), swap8IfBE(b32[i * 4 + 1]), swap8IfBE(b32[i * 4 + 2]), swap8IfBE(b32[i * 4 + 3]));
        }
        if (left) {
          ZEROS16.set(data.subarray(blocks * BLOCK_SIZE));
          this._updateBlock(swap8IfBE(ZEROS32[0]), swap8IfBE(ZEROS32[1]), swap8IfBE(ZEROS32[2]), swap8IfBE(ZEROS32[3]));
          clean(ZEROS32);
        }
        return this;
      }
      destroy() {
        this.destroyed = true;
        const { t } = this;
        for (const elm of t) {
          elm.s0 = 0, elm.s1 = 0, elm.s2 = 0, elm.s3 = 0;
        }
      }
      digestInto(out) {
        aexists(this);
        aoutput(out, this, true);
        this.finished = true;
        const { s0, s1, s2, s3 } = this;
        const o32 = u32(out);
        o32[0] = s0;
        o32[1] = s1;
        o32[2] = s2;
        o32[3] = s3;
        swap32IfBE(o32);
      }
      digest() {
        const res = new Uint8Array(BLOCK_SIZE);
        this.digestInto(res);
        this.destroy();
        return res;
      }
    };
    Polyval = class extends GHASH {
      constructor(key, expectedLength) {
        abytes(key);
        const ghKey = _toGHASHKey(copyBytes(key));
        super(ghKey, expectedLength);
        clean(ghKey);
      }
      update(data) {
        aexists(this);
        abytes(data);
        data = copyBytes(data);
        const b32 = u32(data);
        const left = data.length % BLOCK_SIZE;
        const blocks = Math.floor(data.length / BLOCK_SIZE);
        for (let i = 0; i < blocks; i++) {
          this._updateBlock(swap8IfLE(b32[i * 4 + 3]), swap8IfLE(b32[i * 4 + 2]), swap8IfLE(b32[i * 4 + 1]), swap8IfLE(b32[i * 4 + 0]));
        }
        if (left) {
          ZEROS16.set(data.subarray(blocks * BLOCK_SIZE));
          this._updateBlock(swap8IfLE(ZEROS32[3]), swap8IfLE(ZEROS32[2]), swap8IfLE(ZEROS32[1]), swap8IfLE(ZEROS32[0]));
          clean(ZEROS32);
        }
        return this;
      }
      digestInto(out) {
        aexists(this);
        aoutput(out, this, true);
        this.finished = true;
        const view = out.subarray(0, this.outputLen);
        const { s0, s1, s2, s3 } = this;
        const o32 = u32(view);
        o32[0] = s0;
        o32[1] = s1;
        o32[2] = s2;
        o32[3] = s3;
        swap32IfBE(o32);
        view.reverse();
      }
    };
    ghash = /* @__PURE__ */ wrapMacConstructor(16, (key, expectedLength) => new GHASH(key, expectedLength), (msg) => [msg.length]);
    polyval = /* @__PURE__ */ wrapMacConstructor(16, (key, expectedLength) => new Polyval(key, expectedLength), (msg) => [msg.length]);
  }
});

// node_modules/@noble/ciphers/aes.js
var aes_exports = {};
__export(aes_exports, {
  __TESTS: () => __TESTS,
  aeskw: () => aeskw,
  aeskwp: () => aeskwp,
  aessiv: () => aessiv2,
  cbc: () => cbc,
  cfb: () => cfb,
  cmac: () => cmac,
  ctr: () => ctr,
  ecb: () => ecb,
  gcm: () => gcm,
  gcmsiv: () => gcmsiv,
  rngAesCtrDrbg128: () => rngAesCtrDrbg128,
  rngAesCtrDrbg256: () => rngAesCtrDrbg256,
  siv: () => siv,
  unsafe: () => unsafe
});
function validateKeyLength(key) {
  if (![16, 24, 32].includes(key.length))
    throw new Error('"aes key" expected Uint8Array of length 16/24/32, got length=' + key.length);
}
function mul22(n) {
  return n << 1 ^ POLY2 & -(n >> 7);
}
function mul(a, b) {
  let res = 0;
  for (; b > 0; b >>= 1) {
    res ^= a & -(b & 1);
    a = mul22(a);
  }
  return res;
}
function genTtable(sbox2, fn) {
  if (sbox2.length !== 256)
    throw new Error("Wrong sbox length");
  const T0 = new Uint32Array(256).map((_, j) => fn(sbox2[j]));
  const T1 = T0.map(rotl32_8);
  const T2 = T1.map(rotl32_8);
  const T3 = T2.map(rotl32_8);
  const T01 = new Uint32Array(256 * 256);
  const T23 = new Uint32Array(256 * 256);
  const sbox22 = new Uint16Array(256 * 256);
  for (let i = 0; i < 256; i++) {
    for (let j = 0; j < 256; j++) {
      const idx = i * 256 + j;
      T01[idx] = T0[i] ^ T1[j];
      T23[idx] = T2[i] ^ T3[j];
      sbox22[idx] = sbox2[i] << 8 | sbox2[j];
    }
  }
  return { sbox: sbox2, sbox2: sbox22, T0, T1, T2, T3, T01, T23 };
}
function expandKeyLE(key) {
  abytes(key);
  const len = key.length;
  validateKeyLength(key);
  const { sbox2 } = tableEncoding;
  const toClean = [];
  if (!isLE || !isAligned32(key))
    toClean.push(key = copyBytes(key));
  const k32 = swap32IfBE(u32(key));
  const Nk = k32.length;
  const subByte = (n) => applySbox(sbox2, n, n, n, n);
  const xk = new Uint32Array(len + 28);
  xk.set(k32);
  for (let i = Nk; i < xk.length; i++) {
    let t = xk[i - 1];
    if (i % Nk === 0)
      t = subByte(rotr32_8(t)) ^ xPowers[i / Nk - 1];
    else if (Nk > 6 && i % Nk === 4)
      t = subByte(t);
    xk[i] = xk[i - Nk] ^ t;
  }
  clean(...toClean);
  return xk;
}
function expandKeyDecLE(key) {
  const encKey = expandKeyLE(key);
  const xk = encKey.slice();
  const Nk = encKey.length;
  const { sbox2 } = tableEncoding;
  const { T0, T1, T2, T3 } = tableDecoding;
  for (let i = 0; i < Nk; i += 4) {
    for (let j = 0; j < 4; j++)
      xk[i + j] = encKey[Nk - i - 4 + j];
  }
  clean(encKey);
  for (let i = 4; i < Nk - 4; i++) {
    const x = xk[i];
    const w = applySbox(sbox2, x, x, x, x);
    xk[i] = T0[w & 255] ^ T1[w >>> 8 & 255] ^ T2[w >>> 16 & 255] ^ T3[w >>> 24];
  }
  return xk;
}
function apply0123(T01, T23, s0, s1, s2, s3) {
  return T01[s0 << 8 & 65280 | s1 >>> 8 & 255] ^ T23[s2 >>> 8 & 65280 | s3 >>> 24 & 255];
}
function applySbox(sbox2, s0, s1, s2, s3) {
  return sbox2[s0 & 255 | s1 & 65280] | sbox2[s2 >>> 16 & 255 | s3 >>> 16 & 65280] << 16;
}
function encrypt(xk, s0, s1, s2, s3) {
  const { sbox2, T01, T23 } = tableEncoding;
  let k = 0;
  s0 ^= xk[k++], s1 ^= xk[k++], s2 ^= xk[k++], s3 ^= xk[k++];
  const rounds = xk.length / 4 - 2;
  for (let i = 0; i < rounds; i++) {
    const t02 = xk[k++] ^ apply0123(T01, T23, s0, s1, s2, s3);
    const t12 = xk[k++] ^ apply0123(T01, T23, s1, s2, s3, s0);
    const t22 = xk[k++] ^ apply0123(T01, T23, s2, s3, s0, s1);
    const t32 = xk[k++] ^ apply0123(T01, T23, s3, s0, s1, s2);
    s0 = t02, s1 = t12, s2 = t22, s3 = t32;
  }
  const t0 = xk[k++] ^ applySbox(sbox2, s0, s1, s2, s3);
  const t1 = xk[k++] ^ applySbox(sbox2, s1, s2, s3, s0);
  const t2 = xk[k++] ^ applySbox(sbox2, s2, s3, s0, s1);
  const t3 = xk[k++] ^ applySbox(sbox2, s3, s0, s1, s2);
  return { s0: t0, s1: t1, s2: t2, s3: t3 };
}
function decrypt(xk, s0, s1, s2, s3) {
  const { sbox2, T01, T23 } = tableDecoding;
  let k = 0;
  s0 ^= xk[k++], s1 ^= xk[k++], s2 ^= xk[k++], s3 ^= xk[k++];
  const rounds = xk.length / 4 - 2;
  for (let i = 0; i < rounds; i++) {
    const t02 = xk[k++] ^ apply0123(T01, T23, s0, s3, s2, s1);
    const t12 = xk[k++] ^ apply0123(T01, T23, s1, s0, s3, s2);
    const t22 = xk[k++] ^ apply0123(T01, T23, s2, s1, s0, s3);
    const t32 = xk[k++] ^ apply0123(T01, T23, s3, s2, s1, s0);
    s0 = t02, s1 = t12, s2 = t22, s3 = t32;
  }
  const t0 = xk[k++] ^ applySbox(sbox2, s0, s3, s2, s1);
  const t1 = xk[k++] ^ applySbox(sbox2, s1, s0, s3, s2);
  const t2 = xk[k++] ^ applySbox(sbox2, s2, s1, s0, s3);
  const t3 = xk[k++] ^ applySbox(sbox2, s3, s2, s1, s0);
  return { s0: t0, s1: t1, s2: t2, s3: t3 };
}
function ctrCounter(xk, nonce, src, dst) {
  abytes(nonce, BLOCK_SIZE2, "nonce");
  abytes(src);
  const srcLen = src.length;
  dst = getOutput(srcLen, dst);
  complexOverlapBytes(src, dst);
  const ctr2 = nonce;
  const c32 = u32(ctr2);
  const src32 = u32(src);
  const dst32 = u32(dst);
  let { s0, s1, s2, s3 } = encrypt(xk, swap8IfBE(c32[0]), swap8IfBE(c32[1]), swap8IfBE(c32[2]), swap8IfBE(c32[3]));
  for (let i = 0; i + 4 <= src32.length; i += 4) {
    dst32[i + 0] = src32[i + 0] ^ swap8IfBE(s0);
    dst32[i + 1] = src32[i + 1] ^ swap8IfBE(s1);
    dst32[i + 2] = src32[i + 2] ^ swap8IfBE(s2);
    dst32[i + 3] = src32[i + 3] ^ swap8IfBE(s3);
    incBytes(ctr2, false, 1);
    ({ s0, s1, s2, s3 } = encrypt(xk, swap8IfBE(c32[0]), swap8IfBE(c32[1]), swap8IfBE(c32[2]), swap8IfBE(c32[3])));
  }
  const start = BLOCK_SIZE2 * Math.floor(src32.length / BLOCK_SIZE32);
  if (start < srcLen) {
    const b32 = new Uint32Array([s0, s1, s2, s3]);
    swap32IfBE(b32);
    const buf = u8(b32);
    for (let i = start, pos = 0; i < srcLen; i++, pos++)
      dst[i] = src[i] ^ buf[pos];
    clean(b32);
  }
  return dst;
}
function ctr32(xk, isLE2, nonce, src, dst) {
  abytes(nonce, BLOCK_SIZE2, "nonce");
  abytes(src);
  dst = getOutput(src.length, dst);
  const ctr2 = nonce;
  const c32 = u32(ctr2);
  const view = createView(ctr2);
  const src32 = u32(src);
  const dst32 = u32(dst);
  const ctrPos = isLE2 ? 0 : 12;
  const srcLen = src.length;
  let ctrNum = view.getUint32(ctrPos, isLE2);
  let { s0, s1, s2, s3 } = encrypt(xk, swap8IfBE(c32[0]), swap8IfBE(c32[1]), swap8IfBE(c32[2]), swap8IfBE(c32[3]));
  for (let i = 0; i + 4 <= src32.length; i += 4) {
    dst32[i + 0] = src32[i + 0] ^ swap8IfBE(s0);
    dst32[i + 1] = src32[i + 1] ^ swap8IfBE(s1);
    dst32[i + 2] = src32[i + 2] ^ swap8IfBE(s2);
    dst32[i + 3] = src32[i + 3] ^ swap8IfBE(s3);
    ctrNum = ctrNum + 1 >>> 0;
    view.setUint32(ctrPos, ctrNum, isLE2);
    ({ s0, s1, s2, s3 } = encrypt(xk, swap8IfBE(c32[0]), swap8IfBE(c32[1]), swap8IfBE(c32[2]), swap8IfBE(c32[3])));
  }
  const start = BLOCK_SIZE2 * Math.floor(src32.length / BLOCK_SIZE32);
  if (start < srcLen) {
    const b32 = new Uint32Array([s0, s1, s2, s3]);
    swap32IfBE(b32);
    const buf = u8(b32);
    for (let i = start, pos = 0; i < srcLen; i++, pos++)
      dst[i] = src[i] ^ buf[pos];
    clean(b32);
  }
  return dst;
}
function validateBlockDecrypt(data) {
  abytes(data);
  if (data.length % BLOCK_SIZE2 !== 0) {
    throw new Error("aes-(cbc/ecb).decrypt ciphertext should consist of blocks with size " + BLOCK_SIZE2);
  }
}
function validateBlockEncrypt(plaintext, pkcs5, dst) {
  abytes(plaintext);
  let outLen = plaintext.length;
  const remaining = outLen % BLOCK_SIZE2;
  if (!pkcs5 && remaining !== 0)
    throw new Error("aec/(cbc-ecb): unpadded plaintext with disabled padding");
  if (pkcs5) {
    let left = BLOCK_SIZE2 - remaining;
    if (!left)
      left = BLOCK_SIZE2;
    outLen = outLen + left;
  }
  dst = getOutput(outLen, dst);
  complexOverlapBytes(plaintext, dst);
  if (!isLE || !isAligned32(plaintext))
    plaintext = copyBytes(plaintext);
  const b = u32(plaintext);
  swap32IfBE(b);
  const o = u32(dst);
  return { b, o, out: dst };
}
function validatePKCS(data, pkcs5) {
  if (!pkcs5)
    return data;
  const len = data.length;
  if (len === 0)
    throw new Error("aes/pkcs7: empty ciphertext not allowed");
  const lastByte = data[len - 1];
  let valid = 1;
  valid &= lastByte - 1 >>> 31 ^ 1;
  valid &= 16 - lastByte >>> 31 ^ 1;
  for (let i = 0; i < 16; i++) {
    const shouldCheck = i - lastByte >>> 31;
    const eq = (data[len - 1 - i] ^ lastByte) === 0 ? 1 : 0;
    valid &= eq | shouldCheck ^ 1;
  }
  if (!valid)
    throw new Error("aes/pkcs7: wrong padding");
  return data.subarray(0, len - lastByte);
}
function padPCKS(left) {
  const tmp = new Uint8Array(16);
  const tmp32 = u32(tmp);
  tmp.set(left);
  const paddingByte = BLOCK_SIZE2 - left.length;
  for (let i = BLOCK_SIZE2 - paddingByte; i < BLOCK_SIZE2; i++)
    tmp[i] = paddingByte;
  return tmp32;
}
function computeTag(fn, isLE2, key, data, AAD) {
  const aadLength = AAD ? AAD.length : 0;
  const h = fn.create(key, data.length + aadLength);
  if (AAD)
    h.update(AAD);
  const num = u64Lengths(8 * data.length, 8 * aadLength, isLE2);
  h.update(data);
  h.update(num);
  const res = h.digest();
  clean(num);
  return res;
}
function isBytes32(a) {
  return a instanceof Uint32Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint32Array";
}
function encryptBlock(xk, block) {
  abytes(block, 16, "block");
  if (!isBytes32(xk))
    throw new Error("_encryptBlock accepts result of expandKeyLE");
  const b32 = u32(block);
  swap32IfBE(b32);
  let { s0, s1, s2, s3 } = encrypt(xk, b32[0], b32[1], b32[2], b32[3]);
  b32[0] = s0, b32[1] = s1, b32[2] = s2, b32[3] = s3;
  swap32IfBE(b32);
  return block;
}
function decryptBlock(xk, block) {
  abytes(block, 16, "block");
  if (!isBytes32(xk))
    throw new Error("_decryptBlock accepts result of expandKeyLE");
  const b32 = u32(block);
  swap32IfBE(b32);
  let { s0, s1, s2, s3 } = decrypt(xk, b32[0], b32[1], b32[2], b32[3]);
  b32[0] = s0, b32[1] = s1, b32[2] = s2, b32[3] = s3;
  swap32IfBE(b32);
  return block;
}
function dbl(block) {
  let carry = 0;
  for (let i = BLOCK_SIZE2 - 1; i >= 0; i--) {
    const newCarry = (block[i] & 128) >>> 7;
    block[i] = block[i] << 1 | carry;
    carry = newCarry;
  }
  if (carry) {
    block[BLOCK_SIZE2 - 1] ^= 135;
  }
  return block;
}
function xorBlock(a, b) {
  if (a.length !== b.length)
    throw new Error("xorBlock: blocks must have same length");
  for (let i = 0; i < a.length; i++) {
    a[i] = a[i] ^ b[i];
  }
  return a;
}
function xorend(a, b) {
  if (b.length > a.length) {
    throw new Error("xorend: len(B) must be less than or equal to len(A)");
  }
  const offset = a.length - b.length;
  for (let i = 0; i < b.length; i++) {
    a[offset + i] = a[offset + i] ^ b[i];
  }
  return a;
}
function s2v(key, strings) {
  validateKeyLength(key);
  const len = strings.length;
  if (len > 127) {
    throw new Error("s2v: number of input strings must be less than or equal to 127");
  }
  if (len === 0)
    return cmac(ONE_BLOCK, key);
  let d = cmac(EMPTY_BLOCK, key);
  for (let i = 0; i < len - 1; i++) {
    dbl(d);
    const cmacResult = cmac(strings[i], key);
    xorBlock(d, cmacResult);
    clean(cmacResult);
  }
  const s_n = strings[len - 1];
  abytes(s_n);
  let t;
  if (s_n.byteLength >= BLOCK_SIZE2) {
    t = xorend(Uint8Array.from(s_n), d);
  } else {
    const paddedSn = new Uint8Array(BLOCK_SIZE2);
    paddedSn.set(s_n);
    paddedSn[s_n.length] = 128;
    t = xorBlock(dbl(d), paddedSn);
    clean(paddedSn);
  }
  const result = cmac(t, key);
  clean(d, t);
  return result;
}
var BLOCK_SIZE2, BLOCK_SIZE32, EMPTY_BLOCK, ONE_BLOCK, POLY2, incBytes, sbox, invSbox, rotr32_8, rotl32_8, tableEncoding, tableDecoding, xPowers, ctr, ecb, cbc, cfb, gcm, limit, gcmsiv, AESW, AESKW_IV, aeskw, AESKWP_IV, aeskwp, _AesCtrDRBG, createAesDrbg, rngAesCtrDrbg128, rngAesCtrDrbg256, _CMAC, cmac, siv, aessiv2, unsafe, __TESTS;
var init_aes = __esm({
  "node_modules/@noble/ciphers/aes.js"() {
    init_polyval();
    init_utils();
    BLOCK_SIZE2 = 16;
    BLOCK_SIZE32 = 4;
    EMPTY_BLOCK = /* @__PURE__ */ new Uint8Array(BLOCK_SIZE2);
    ONE_BLOCK = /* @__PURE__ */ Uint8Array.from([
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1
    ]);
    POLY2 = 283;
    incBytes = (data, isLE2, carry = 1) => {
      if (!Number.isSafeInteger(carry) || carry > 4294967040)
        throw new Error("incBytes: wrong carry " + carry);
      abytes(data);
      for (let i = 0; i < data.length; i++) {
        const pos = !isLE2 ? data.length - 1 - i : i;
        carry = carry + (data[pos] & 255) | 0;
        data[pos] = carry & 255;
        carry >>>= 8;
      }
    };
    sbox = /* @__PURE__ */ (() => {
      const t = new Uint8Array(256);
      for (let i = 0, x = 1; i < 256; i++, x ^= mul22(x))
        t[i] = x;
      const box = new Uint8Array(256);
      box[0] = 99;
      for (let i = 0; i < 255; i++) {
        let x = t[255 - i];
        x |= x << 8;
        box[t[i]] = (x ^ x >> 4 ^ x >> 5 ^ x >> 6 ^ x >> 7 ^ 99) & 255;
      }
      clean(t);
      return box;
    })();
    invSbox = /* @__PURE__ */ sbox.map((_, j) => sbox.indexOf(j));
    rotr32_8 = (n) => n << 24 | n >>> 8;
    rotl32_8 = (n) => n << 8 | n >>> 24;
    tableEncoding = /* @__PURE__ */ genTtable(sbox, (s) => mul(s, 3) << 24 | s << 16 | s << 8 | mul(s, 2));
    tableDecoding = /* @__PURE__ */ genTtable(invSbox, (s) => mul(s, 11) << 24 | mul(s, 13) << 16 | mul(s, 9) << 8 | mul(s, 14));
    xPowers = /* @__PURE__ */ (() => {
      const p = new Uint8Array(16);
      for (let i = 0, x = 1; i < 16; i++, x = mul22(x))
        p[i] = x;
      return p;
    })();
    ctr = /* @__PURE__ */ wrapCipher({ blockSize: 16, nonceLength: 16 }, function aesctr(key, nonce) {
      function processCtr(buf, dst) {
        abytes(buf);
        if (dst !== void 0) {
          abytes(dst);
          if (!isAligned32(dst))
            throw new Error("unaligned destination");
        }
        const xk = expandKeyLE(key);
        const n = copyBytes(nonce);
        const toClean = [xk, n];
        if (!isAligned32(buf))
          toClean.push(buf = copyBytes(buf));
        const out = ctrCounter(xk, n, buf, dst);
        clean(...toClean);
        return out;
      }
      return {
        encrypt: (plaintext, dst) => processCtr(plaintext, dst),
        decrypt: (ciphertext, dst) => processCtr(ciphertext, dst)
      };
    });
    ecb = /* @__PURE__ */ wrapCipher({ blockSize: 16 }, function aesecb(key, opts = {}) {
      const pkcs5 = !opts.disablePadding;
      return {
        encrypt(plaintext, dst) {
          const { b, o, out: _out } = validateBlockEncrypt(plaintext, pkcs5, dst);
          const xk = expandKeyLE(key);
          let i = 0;
          for (; i + 4 <= b.length; ) {
            const { s0, s1, s2, s3 } = encrypt(xk, b[i + 0], b[i + 1], b[i + 2], b[i + 3]);
            o[i++] = s0, o[i++] = s1, o[i++] = s2, o[i++] = s3;
          }
          if (pkcs5) {
            const tmp32 = padPCKS(plaintext.subarray(i * 4));
            swap32IfBE(tmp32);
            const { s0, s1, s2, s3 } = encrypt(xk, tmp32[0], tmp32[1], tmp32[2], tmp32[3]);
            o[i++] = s0, o[i++] = s1, o[i++] = s2, o[i++] = s3;
          }
          swap32IfBE(o);
          clean(xk);
          return _out;
        },
        decrypt(ciphertext, dst) {
          validateBlockDecrypt(ciphertext);
          const xk = expandKeyDecLE(key);
          dst = getOutput(ciphertext.length, dst);
          const toClean = [xk];
          complexOverlapBytes(ciphertext, dst);
          if (!isLE || !isAligned32(ciphertext))
            toClean.push(ciphertext = copyBytes(ciphertext));
          const b = u32(ciphertext);
          const o = u32(dst);
          swap32IfBE(b);
          for (let i = 0; i + 4 <= b.length; ) {
            const { s0, s1, s2, s3 } = decrypt(xk, b[i + 0], b[i + 1], b[i + 2], b[i + 3]);
            o[i++] = s0, o[i++] = s1, o[i++] = s2, o[i++] = s3;
          }
          swap32IfBE(o);
          clean(...toClean);
          return validatePKCS(dst, pkcs5);
        }
      };
    });
    cbc = /* @__PURE__ */ wrapCipher({ blockSize: 16, nonceLength: 16 }, function aescbc(key, iv, opts = {}) {
      const pkcs5 = !opts.disablePadding;
      return {
        encrypt(plaintext, dst) {
          const xk = expandKeyLE(key);
          const { b, o, out: _out } = validateBlockEncrypt(plaintext, pkcs5, dst);
          let _iv = iv;
          const toClean = [xk];
          if (!isLE || !isAligned32(_iv))
            toClean.push(_iv = copyBytes(_iv));
          const n32 = u32(_iv);
          swap32IfBE(n32);
          let s0 = n32[0], s1 = n32[1], s2 = n32[2], s3 = n32[3];
          let i = 0;
          for (; i + 4 <= b.length; ) {
            s0 ^= b[i + 0], s1 ^= b[i + 1], s2 ^= b[i + 2], s3 ^= b[i + 3];
            ({ s0, s1, s2, s3 } = encrypt(xk, s0, s1, s2, s3));
            o[i++] = s0, o[i++] = s1, o[i++] = s2, o[i++] = s3;
          }
          if (pkcs5) {
            const tmp32 = padPCKS(plaintext.subarray(i * 4));
            swap32IfBE(tmp32);
            s0 ^= tmp32[0], s1 ^= tmp32[1], s2 ^= tmp32[2], s3 ^= tmp32[3];
            ({ s0, s1, s2, s3 } = encrypt(xk, s0, s1, s2, s3));
            o[i++] = s0, o[i++] = s1, o[i++] = s2, o[i++] = s3;
          }
          swap32IfBE(o);
          clean(...toClean);
          return _out;
        },
        decrypt(ciphertext, dst) {
          validateBlockDecrypt(ciphertext);
          const xk = expandKeyDecLE(key);
          let _iv = iv;
          const toClean = [xk];
          if (!isLE || !isAligned32(_iv))
            toClean.push(_iv = copyBytes(_iv));
          const n32 = u32(_iv);
          swap32IfBE(n32);
          dst = getOutput(ciphertext.length, dst);
          complexOverlapBytes(ciphertext, dst);
          if (!isLE || !isAligned32(ciphertext))
            toClean.push(ciphertext = copyBytes(ciphertext));
          const b = u32(ciphertext);
          const o = u32(dst);
          swap32IfBE(b);
          let s0 = n32[0], s1 = n32[1], s2 = n32[2], s3 = n32[3];
          for (let i = 0; i + 4 <= b.length; ) {
            const ps0 = s0, ps1 = s1, ps2 = s2, ps3 = s3;
            s0 = b[i + 0], s1 = b[i + 1], s2 = b[i + 2], s3 = b[i + 3];
            const { s0: o0, s1: o1, s2: o2, s3: o3 } = decrypt(xk, s0, s1, s2, s3);
            o[i++] = o0 ^ ps0, o[i++] = o1 ^ ps1, o[i++] = o2 ^ ps2, o[i++] = o3 ^ ps3;
          }
          swap32IfBE(o);
          clean(...toClean);
          return validatePKCS(dst, pkcs5);
        }
      };
    });
    cfb = /* @__PURE__ */ wrapCipher({ blockSize: 16, nonceLength: 16 }, function aescfb(key, iv) {
      function processCfb(src, isEncrypt, dst) {
        abytes(src);
        const srcLen = src.length;
        dst = getOutput(srcLen, dst);
        if (overlapBytes(src, dst))
          throw new Error("overlapping src and dst not supported.");
        const xk = expandKeyLE(key);
        let _iv = iv;
        const toClean = [xk];
        if (!isLE || !isAligned32(_iv))
          toClean.push(_iv = copyBytes(_iv));
        if (!isLE || !isAligned32(src))
          toClean.push(src = copyBytes(src));
        const src32 = u32(src);
        const dst32 = u32(dst);
        const next32 = isEncrypt ? dst32 : src32;
        const n32 = u32(_iv);
        swap32IfBE(src32);
        swap32IfBE(n32);
        let s0 = n32[0], s1 = n32[1], s2 = n32[2], s3 = n32[3];
        for (let i = 0; i + 4 <= src32.length; ) {
          const { s0: e0, s1: e1, s2: e2, s3: e3 } = encrypt(xk, s0, s1, s2, s3);
          dst32[i + 0] = src32[i + 0] ^ e0;
          dst32[i + 1] = src32[i + 1] ^ e1;
          dst32[i + 2] = src32[i + 2] ^ e2;
          dst32[i + 3] = src32[i + 3] ^ e3;
          s0 = next32[i++], s1 = next32[i++], s2 = next32[i++], s3 = next32[i++];
        }
        const start = BLOCK_SIZE2 * Math.floor(src32.length / BLOCK_SIZE32);
        if (start < srcLen) {
          ({ s0, s1, s2, s3 } = encrypt(xk, s0, s1, s2, s3));
          const tmp = new Uint32Array([s0, s1, s2, s3]);
          swap32IfBE(tmp);
          const buf = u8(tmp);
          for (let i = start, pos = 0; i < srcLen; i++, pos++)
            dst[i] = src[i] ^ buf[pos];
          clean(buf);
        }
        swap32IfBE(dst32);
        clean(...toClean);
        return dst;
      }
      return {
        encrypt: (plaintext, dst) => processCfb(plaintext, true, dst),
        decrypt: (ciphertext, dst) => processCfb(ciphertext, false, dst)
      };
    });
    gcm = /* @__PURE__ */ wrapCipher({ blockSize: 16, nonceLength: 12, tagLength: 16, varSizeNonce: true }, function aesgcm(key, nonce, AAD) {
      if (nonce.length < 8)
        throw new Error("aes/gcm: invalid nonce length");
      const tagLength = 16;
      function _computeTag(authKey, tagMask, data) {
        const tag = computeTag(ghash, false, authKey, data, AAD);
        for (let i = 0; i < tagMask.length; i++)
          tag[i] ^= tagMask[i];
        return tag;
      }
      function deriveKeys() {
        const xk = expandKeyLE(key);
        const authKey = EMPTY_BLOCK.slice();
        const counter = EMPTY_BLOCK.slice();
        ctr32(xk, false, counter, counter, authKey);
        if (nonce.length === 12) {
          counter.set(nonce);
        } else {
          const nonceLen = EMPTY_BLOCK.slice();
          const view = createView(nonceLen);
          view.setBigUint64(8, BigInt(nonce.length * 8), false);
          const g = ghash.create(authKey).update(nonce).update(nonceLen);
          g.digestInto(counter);
          g.destroy();
        }
        const tagMask = ctr32(xk, false, counter, EMPTY_BLOCK);
        return { xk, authKey, counter, tagMask };
      }
      return {
        encrypt(plaintext) {
          const { xk, authKey, counter, tagMask } = deriveKeys();
          const out = new Uint8Array(plaintext.length + tagLength);
          const toClean = [xk, authKey, counter, tagMask];
          if (!isAligned32(plaintext))
            toClean.push(plaintext = copyBytes(plaintext));
          ctr32(xk, false, counter, plaintext, out.subarray(0, plaintext.length));
          const tag = _computeTag(authKey, tagMask, out.subarray(0, out.length - tagLength));
          toClean.push(tag);
          out.set(tag, plaintext.length);
          clean(...toClean);
          return out;
        },
        decrypt(ciphertext) {
          const { xk, authKey, counter, tagMask } = deriveKeys();
          const toClean = [xk, authKey, tagMask, counter];
          if (!isAligned32(ciphertext))
            toClean.push(ciphertext = copyBytes(ciphertext));
          const data = ciphertext.subarray(0, -tagLength);
          const passedTag = ciphertext.subarray(-tagLength);
          const tag = _computeTag(authKey, tagMask, data);
          toClean.push(tag);
          if (!equalBytes(tag, passedTag)) {
            clean(...toClean);
            throw new Error("aes/gcm: invalid ghash tag");
          }
          const out = ctr32(xk, false, counter, data);
          clean(...toClean);
          return out;
        }
      };
    });
    limit = (name, min, max) => (value) => {
      if (!Number.isSafeInteger(value) || min > value || value > max) {
        const minmax = "[" + min + ".." + max + "]";
        throw new Error("" + name + ": expected value in range " + minmax + ", got " + value);
      }
    };
    gcmsiv = /* @__PURE__ */ wrapCipher({ blockSize: 16, nonceLength: 12, tagLength: 16, varSizeNonce: true }, function aessiv(key, nonce, AAD) {
      const tagLength = 16;
      const AAD_LIMIT = limit("AAD", 0, 2 ** 36);
      const PLAIN_LIMIT = limit("plaintext", 0, 2 ** 36);
      const NONCE_LIMIT = limit("nonce", 12, 12);
      const CIPHER_LIMIT = limit("ciphertext", 16, 2 ** 36 + 16);
      abytes(key);
      validateKeyLength(key);
      NONCE_LIMIT(nonce.length);
      if (AAD !== void 0)
        AAD_LIMIT(AAD.length);
      function deriveKeys() {
        const xk = expandKeyLE(key);
        const encKey = new Uint8Array(key.length);
        const authKey = new Uint8Array(16);
        const toClean = [xk, encKey];
        let _nonce = nonce;
        if (!isLE || !isAligned32(_nonce))
          toClean.push(_nonce = copyBytes(_nonce));
        const n32 = u32(_nonce);
        swap32IfBE(n32);
        let s0 = 0, s1 = n32[0], s2 = n32[1], s3 = n32[2];
        let counter = 0;
        for (const derivedKey of [authKey, encKey].map(u32)) {
          const d32 = u32(derivedKey);
          for (let i = 0; i < d32.length; i += 2) {
            const { s0: o0, s1: o1 } = encrypt(xk, s0, s1, s2, s3);
            d32[i + 0] = o0;
            d32[i + 1] = o1;
            s0 = ++counter;
          }
          swap32IfBE(d32);
        }
        const res = { authKey, encKey: expandKeyLE(encKey) };
        clean(...toClean);
        return res;
      }
      function _computeTag(encKey, authKey, data) {
        const tag = computeTag(polyval, true, authKey, data, AAD);
        for (let i = 0; i < 12; i++)
          tag[i] ^= nonce[i];
        tag[15] &= 127;
        const t32 = u32(tag);
        swap32IfBE(t32);
        let s0 = t32[0], s1 = t32[1], s2 = t32[2], s3 = t32[3];
        ({ s0, s1, s2, s3 } = encrypt(encKey, s0, s1, s2, s3));
        t32[0] = s0, t32[1] = s1, t32[2] = s2, t32[3] = s3;
        swap32IfBE(t32);
        return tag;
      }
      function processSiv(encKey, tag, input) {
        let block = copyBytes(tag);
        block[15] |= 128;
        const res = ctr32(encKey, true, block, input);
        clean(block);
        return res;
      }
      return {
        encrypt(plaintext) {
          PLAIN_LIMIT(plaintext.length);
          const { encKey, authKey } = deriveKeys();
          const tag = _computeTag(encKey, authKey, plaintext);
          const toClean = [encKey, authKey, tag];
          if (!isAligned32(plaintext))
            toClean.push(plaintext = copyBytes(plaintext));
          const out = new Uint8Array(plaintext.length + tagLength);
          out.set(tag, plaintext.length);
          out.set(processSiv(encKey, tag, plaintext));
          clean(...toClean);
          return out;
        },
        decrypt(ciphertext) {
          CIPHER_LIMIT(ciphertext.length);
          const tag = ciphertext.subarray(-tagLength);
          const { encKey, authKey } = deriveKeys();
          const toClean = [encKey, authKey];
          if (!isAligned32(ciphertext))
            toClean.push(ciphertext = copyBytes(ciphertext));
          const plaintext = processSiv(encKey, tag, ciphertext.subarray(0, -tagLength));
          const expectedTag = _computeTag(encKey, authKey, plaintext);
          toClean.push(expectedTag);
          if (!equalBytes(tag, expectedTag)) {
            clean(...toClean);
            throw new Error("invalid polyval tag");
          }
          clean(...toClean);
          return plaintext;
        }
      };
    });
    AESW = {
      /*
      High-level pseudocode:
      ```
      A: u64 = IV
      out = []
      for (let i=0, ctr = 0; i<6; i++) {
        for (const chunk of chunks(plaintext, 8)) {
          A ^= swapEndianess(ctr++)
          [A, res] = chunks(encrypt(A || chunk), 8);
          out ||= res
        }
      }
      out = A || out
      ```
      Decrypt is the same, but reversed.
      */
      encrypt(kek, out) {
        if (out.length >= 2 ** 32)
          throw new Error("plaintext should be less than 4gb");
        const xk = expandKeyLE(kek);
        if (out.length === 16)
          encryptBlock(xk, out);
        else {
          const o32 = u32(out);
          swap32IfBE(o32);
          let a0 = o32[0], a1 = o32[1];
          for (let j = 0, ctr2 = 1; j < 6; j++) {
            for (let pos = 2; pos < o32.length; pos += 2, ctr2++) {
              const { s0, s1, s2, s3 } = encrypt(xk, a0, a1, o32[pos], o32[pos + 1]);
              a0 = s0, a1 = s1 ^ byteSwap(ctr2), o32[pos] = s2, o32[pos + 1] = s3;
            }
          }
          o32[0] = a0, o32[1] = a1;
          swap32IfBE(o32);
        }
        xk.fill(0);
      },
      decrypt(kek, out) {
        if (out.length - 8 >= 2 ** 32)
          throw new Error("ciphertext should be less than 4gb");
        const xk = expandKeyDecLE(kek);
        const chunks = out.length / 8 - 1;
        if (chunks === 1)
          decryptBlock(xk, out);
        else {
          const o32 = u32(out);
          swap32IfBE(o32);
          let a0 = o32[0], a1 = o32[1];
          for (let j = 0, ctr2 = chunks * 6; j < 6; j++) {
            for (let pos = chunks * 2; pos >= 1; pos -= 2, ctr2--) {
              a1 ^= byteSwap(ctr2);
              const { s0, s1, s2, s3 } = decrypt(xk, a0, a1, o32[pos], o32[pos + 1]);
              a0 = s0, a1 = s1, o32[pos] = s2, o32[pos + 1] = s3;
            }
          }
          o32[0] = a0, o32[1] = a1;
          swap32IfBE(o32);
        }
        xk.fill(0);
      }
    };
    AESKW_IV = /* @__PURE__ */ new Uint8Array(8).fill(166);
    aeskw = /* @__PURE__ */ wrapCipher({ blockSize: 8 }, (kek) => ({
      encrypt(plaintext) {
        if (!plaintext.length || plaintext.length % 8 !== 0)
          throw new Error("invalid plaintext length");
        if (plaintext.length === 8)
          throw new Error("8-byte keys not allowed in AESKW, use AESKWP instead");
        const out = concatBytes(AESKW_IV, plaintext);
        AESW.encrypt(kek, out);
        return out;
      },
      decrypt(ciphertext) {
        if (ciphertext.length % 8 !== 0 || ciphertext.length < 3 * 8)
          throw new Error("invalid ciphertext length");
        const out = copyBytes(ciphertext);
        AESW.decrypt(kek, out);
        if (!equalBytes(out.subarray(0, 8), AESKW_IV))
          throw new Error("integrity check failed");
        out.subarray(0, 8).fill(0);
        return out.subarray(8);
      }
    }));
    AESKWP_IV = 2790873510;
    aeskwp = /* @__PURE__ */ wrapCipher({ blockSize: 8 }, (kek) => ({
      encrypt(plaintext) {
        if (!plaintext.length)
          throw new Error("invalid plaintext length");
        const padded = Math.ceil(plaintext.length / 8) * 8;
        const out = new Uint8Array(8 + padded);
        out.set(plaintext, 8);
        const out32 = u32(out);
        out32[0] = swap8IfBE(AESKWP_IV);
        out32[1] = swap8IfBE(byteSwap(plaintext.length));
        AESW.encrypt(kek, out);
        return out;
      },
      decrypt(ciphertext) {
        if (ciphertext.length < 16)
          throw new Error("invalid ciphertext length");
        const out = copyBytes(ciphertext);
        const o32 = u32(out);
        AESW.decrypt(kek, out);
        const len = byteSwap(swap8IfBE(o32[1])) >>> 0;
        const padded = Math.ceil(len / 8) * 8;
        if (swap8IfBE(o32[0]) !== AESKWP_IV || out.length - 8 !== padded)
          throw new Error("integrity check failed");
        for (let i = len; i < padded; i++)
          if (out[8 + i] !== 0)
            throw new Error("integrity check failed");
        out.subarray(0, 8).fill(0);
        return out.subarray(8, 8 + len);
      }
    }));
    _AesCtrDRBG = class {
      constructor(keyLen, seed, personalization) {
        __publicField(this, "blockLen");
        __publicField(this, "key");
        __publicField(this, "nonce");
        __publicField(this, "state");
        __publicField(this, "reseedCnt");
        this.blockLen = ctr.blockSize;
        const keyLenBytes = keyLen / 8;
        const nonceLen = 16;
        this.state = new Uint8Array(keyLenBytes + nonceLen);
        this.key = this.state.subarray(0, keyLenBytes);
        this.nonce = this.state.subarray(keyLenBytes, keyLenBytes + nonceLen);
        this.reseedCnt = 1;
        incBytes(this.nonce, false, 1);
        this.addEntropy(seed, personalization);
      }
      update(data) {
        ctr(this.key, this.nonce).encrypt(new Uint8Array(this.state.length), this.state);
        if (data) {
          abytes(data);
          for (let i = 0; i < data.length; i++)
            this.state[i] ^= data[i];
        }
        incBytes(this.nonce, false, 1);
      }
      // Optional `info` is additional input XORed into the reseed block and is
      // limited to the internal state width.
      addEntropy(seed, info) {
        abytes(seed, this.state.length, "seed");
        const _seed = seed.slice();
        if (info) {
          abytes(info);
          if (info.length > _seed.length)
            throw new Error("info length is too big");
          for (let i = 0; i < info.length; i++)
            _seed[i] ^= info[i];
        }
        this.update(_seed);
        _seed.fill(0);
        this.reseedCnt = 1;
      }
      // Optional `info` is additional input for the pre/post-update steps; bytes
      // SP 800-90A Rev. 1 CTR_DRBG without a derivation function limits
      // additional_input to seedlen, which is exactly this internal state width.
      randomBytes(len, info) {
        anumber(len);
        if (len > 2 ** 16)
          throw new Error("requested output is too big");
        if (this.reseedCnt > 2 ** 48)
          throw new Error("entropy exhausted");
        if (info) {
          abytes(info);
          if (info.length > this.state.length)
            throw new Error("info length is too big");
          this.update(info);
        }
        const res = new Uint8Array(len);
        ctr(this.key, this.nonce).encrypt(res, res);
        incBytes(this.nonce, false, Math.ceil(len / this.blockLen));
        this.update(info);
        this.reseedCnt++;
        return res;
      }
      // Zeroes the current state and resets the counter, but does not make the
      // instance unusable: later calls continue from the zeroed state.
      clean() {
        this.state.fill(0);
        this.reseedCnt = 0;
      }
    };
    createAesDrbg = (keyLen) => {
      return (seed, personalization = void 0) => new _AesCtrDRBG(keyLen, seed, personalization);
    };
    rngAesCtrDrbg128 = /* @__PURE__ */ createAesDrbg(128);
    rngAesCtrDrbg256 = /* @__PURE__ */ createAesDrbg(256);
    _CMAC = class {
      constructor(key) {
        __publicField(this, "blockLen", BLOCK_SIZE2);
        __publicField(this, "outputLen", BLOCK_SIZE2);
        // CMAC can only decide between `K1` and `K2` once the true final block is known,
        // so updates process older blocks eagerly but keep one pending block buffered.
        __publicField(this, "buffer");
        __publicField(this, "pos");
        __publicField(this, "finished");
        __publicField(this, "destroyed");
        __publicField(this, "k1");
        __publicField(this, "k2");
        __publicField(this, "x");
        __publicField(this, "xk");
        abytes(key);
        validateKeyLength(key);
        this.xk = expandKeyLE(key);
        this.buffer = new Uint8Array(BLOCK_SIZE2);
        this.pos = 0;
        this.finished = false;
        this.destroyed = false;
        this.x = new Uint8Array(BLOCK_SIZE2);
        const L = new Uint8Array(BLOCK_SIZE2);
        encryptBlock(this.xk, L);
        this.k1 = dbl(L);
        this.k2 = dbl(new Uint8Array(this.k1));
      }
      process(data) {
        xorBlock(this.x, data);
        encryptBlock(this.xk, this.x);
      }
      update(data) {
        if (this.destroyed)
          throw new Error("Hash instance has been destroyed");
        if (this.finished)
          throw new Error("Hash#digest() has already been called");
        abytes(data);
        let pos = 0;
        if (this.pos) {
          const take = Math.min(BLOCK_SIZE2 - this.pos, data.length);
          this.buffer.set(data.subarray(0, take), this.pos);
          this.pos += take;
          pos = take;
          if (this.pos === BLOCK_SIZE2 && pos < data.length) {
            this.process(this.buffer);
            this.pos = 0;
          }
        }
        while (pos + BLOCK_SIZE2 < data.length) {
          this.process(data.subarray(pos, pos + BLOCK_SIZE2));
          pos += BLOCK_SIZE2;
        }
        if (pos < data.length) {
          this.buffer.set(data.subarray(pos), 0);
          this.pos = data.length - pos;
        }
        return this;
      }
      // See {@link https://www.rfc-editor.org/rfc/rfc4493.html#section-2.4 | RFC 4493 Section 2.4}.
      digestInto(out) {
        if (this.destroyed)
          throw new Error("Hash instance has been destroyed");
        if (this.finished)
          throw new Error("Hash#digest() has already been called");
        aoutput(out, this, true);
        this.finished = true;
        const view = out.subarray(0, this.outputLen);
        let last = new Uint8Array(BLOCK_SIZE2);
        if (this.pos === BLOCK_SIZE2) {
          last.set(this.buffer);
          xorBlock(last, this.k1);
        } else {
          last.set(this.buffer.subarray(0, this.pos));
          last[this.pos] = 128;
          xorBlock(last, this.k2);
        }
        view.set(this.x);
        xorBlock(view, last);
        encryptBlock(this.xk, view);
        clean(last);
      }
      digest() {
        const { buffer, outputLen } = this;
        this.digestInto(buffer);
        const res = buffer.slice(0, outputLen);
        this.destroy();
        return res;
      }
      destroy() {
        const { buffer, destroyed, x, xk, k1, k2 } = this;
        if (destroyed)
          return;
        this.destroyed = true;
        clean(buffer, x, xk, k1, k2);
      }
    };
    cmac = /* @__PURE__ */ wrapMacConstructor(16, (key) => new _CMAC(key));
    siv = () => {
      throw new Error('"siv" from v1 is now "gcmsiv"');
    };
    aessiv2 = /* @__PURE__ */ wrapCipher({ blockSize: 16, tagLength: 16 }, function aessiv3(key, ...AAD) {
      const PLAIN_LIMIT = limit("plaintext", 0, 2 ** 132);
      const CIPHER_LIMIT = limit("ciphertext", 16, 2 ** 132 + 16);
      if (AAD.length > 126) {
        throw new Error('"AAD" number of elements must be less than or equal to 126');
      }
      AAD.forEach((aad) => abytes(aad));
      abytes(key);
      if (![32, 48, 64].includes(key.length))
        throw new Error('"aes key" expected Uint8Array of length 32/48/64, got length=' + key.length);
      const k1 = key.subarray(0, key.length / 2);
      const k2 = key.subarray(key.length / 2);
      return {
        // {@link https://datatracker.ietf.org/doc/html/rfc5297.html#section-2.6 | RFC 5297 Section 2.6}
        encrypt(plaintext) {
          PLAIN_LIMIT(plaintext.length);
          const v = s2v(k1, [...AAD, plaintext]);
          const q = Uint8Array.from(v);
          q[8] &= 127;
          q[12] &= 127;
          const c = ctr(k2, q).encrypt(plaintext);
          return concatBytes(v, c);
        },
        // {@link https://datatracker.ietf.org/doc/html/rfc5297.html#section-2.7 | RFC 5297 Section 2.7}
        decrypt(ciphertext) {
          CIPHER_LIMIT(ciphertext.length);
          const v = ciphertext.subarray(0, BLOCK_SIZE2);
          const c = ciphertext.subarray(BLOCK_SIZE2);
          const q = Uint8Array.from(v);
          q[8] &= 127;
          q[12] &= 127;
          const p = ctr(k2, q).decrypt(c);
          const t = s2v(k1, [...AAD, p]);
          if (equalBytes(t, v)) {
            return p;
          } else {
            throw new Error("invalid siv tag");
          }
        }
      };
    });
    unsafe = /* @__PURE__ */ Object.freeze({
      expandKeyLE,
      expandKeyDecLE,
      encrypt,
      decrypt,
      encryptBlock,
      decryptBlock,
      ctrCounter,
      ctr32,
      dbl,
      xorBlock,
      xorend,
      s2v
    });
    __TESTS = /* @__PURE__ */ Object.freeze({
      incBytes
    });
  }
});

// node_modules/@noble/hashes/utils.js
function isBytes2(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in a && a.BYTES_PER_ELEMENT === 1;
}
function anumber2(n, title = "") {
  if (typeof n !== "number") {
    const prefix = title && `"${title}" `;
    throw new TypeError(`${prefix}expected number, got ${typeof n}`);
  }
  if (!Number.isSafeInteger(n) || n < 0) {
    const prefix = title && `"${title}" `;
    throw new RangeError(`${prefix}expected integer >= 0, got ${n}`);
  }
}
function abytes2(value, length, title = "") {
  const bytes = isBytes2(value);
  const len = value?.length;
  const needsLen = length !== void 0;
  if (!bytes || needsLen && len !== length) {
    const prefix = title && `"${title}" `;
    const ofLen = needsLen ? ` of length ${length}` : "";
    const got = bytes ? `length=${len}` : `type=${typeof value}`;
    const message = prefix + "expected Uint8Array" + ofLen + ", got " + got;
    if (!bytes)
      throw new TypeError(message);
    throw new RangeError(message);
  }
  return value;
}
function ahash(h) {
  if (typeof h !== "function" || typeof h.create !== "function")
    throw new TypeError("Hash must wrapped by utils.createHasher");
  anumber2(h.outputLen);
  anumber2(h.blockLen);
  if (h.outputLen < 1)
    throw new Error('"outputLen" must be >= 1');
  if (h.blockLen < 1)
    throw new Error('"blockLen" must be >= 1');
}
function aexists2(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance.finished)
    throw new Error("Hash#digest() has already been called");
}
function aoutput2(out, instance) {
  abytes2(out, void 0, "digestInto() output");
  const min = instance.outputLen;
  if (out.length < min) {
    throw new RangeError('"digestInto() output" expected to be of length >=' + min);
  }
}
function clean2(...arrays) {
  for (let i = 0; i < arrays.length; i++) {
    arrays[i].fill(0);
  }
}
function createView2(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
function rotr(word, shift) {
  return word << 32 - shift | word >>> shift;
}
function bytesToHex(bytes) {
  abytes2(bytes);
  if (hasHexBuiltin)
    return bytes.toHex();
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += hexes[bytes[i]];
  }
  return hex;
}
function asciiToBase16(ch) {
  if (ch >= asciis._0 && ch <= asciis._9)
    return ch - asciis._0;
  if (ch >= asciis.A && ch <= asciis.F)
    return ch - (asciis.A - 10);
  if (ch >= asciis.a && ch <= asciis.f)
    return ch - (asciis.a - 10);
  return;
}
function hexToBytes(hex) {
  if (typeof hex !== "string")
    throw new TypeError("hex string expected, got " + typeof hex);
  if (hasHexBuiltin) {
    try {
      return Uint8Array.fromHex(hex);
    } catch (error) {
      if (error instanceof SyntaxError)
        throw new RangeError(error.message);
      throw error;
    }
  }
  const hl = hex.length;
  const al = hl / 2;
  if (hl % 2)
    throw new RangeError("hex string expected, got unpadded hex of length " + hl);
  const array = new Uint8Array(al);
  for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
    const n1 = asciiToBase16(hex.charCodeAt(hi));
    const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
    if (n1 === void 0 || n2 === void 0) {
      const char = hex[hi] + hex[hi + 1];
      throw new RangeError('hex string expected, got non-hex character "' + char + '" at index ' + hi);
    }
    array[ai] = n1 * 16 + n2;
  }
  return array;
}
function utf8ToBytes(str) {
  if (typeof str !== "string")
    throw new TypeError("string expected");
  return new Uint8Array(new TextEncoder().encode(str));
}
function concatBytes2(...arrays) {
  let sum = 0;
  for (let i = 0; i < arrays.length; i++) {
    const a = arrays[i];
    abytes2(a);
    sum += a.length;
  }
  const res = new Uint8Array(sum);
  for (let i = 0, pad = 0; i < arrays.length; i++) {
    const a = arrays[i];
    res.set(a, pad);
    pad += a.length;
  }
  return res;
}
function createHasher(hashCons, info = {}) {
  const hashC = (msg, opts) => hashCons(opts).update(msg).digest();
  const tmp = hashCons(void 0);
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.canXOF = tmp.canXOF;
  hashC.create = (opts) => hashCons(opts);
  Object.assign(hashC, info);
  return Object.freeze(hashC);
}
function randomBytes(bytesLength = 32) {
  anumber2(bytesLength, "bytesLength");
  const cr = typeof globalThis === "object" ? globalThis.crypto : null;
  if (typeof cr?.getRandomValues !== "function")
    throw new Error("crypto.getRandomValues must be defined");
  if (bytesLength > 65536)
    throw new RangeError(`"bytesLength" expected <= 65536, got ${bytesLength}`);
  return cr.getRandomValues(new Uint8Array(bytesLength));
}
var hasHexBuiltin, hexes, asciis, oidNist;
var init_utils2 = __esm({
  "node_modules/@noble/hashes/utils.js"() {
    hasHexBuiltin = /* @__PURE__ */ (() => (
      // @ts-ignore
      typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function"
    ))();
    hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
    asciis = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
    oidNist = (suffix) => ({
      // Current NIST hashAlgs suffixes used here fit in one DER subidentifier octet.
      // Larger suffix values would need base-128 OID encoding and a different length byte.
      oid: Uint8Array.from([6, 9, 96, 134, 72, 1, 101, 3, 4, 2, suffix])
    });
  }
});

// node_modules/@noble/hashes/_md.js
function Chi(a, b, c) {
  return a & b ^ ~a & c;
}
function Maj(a, b, c) {
  return a & b ^ a & c ^ b & c;
}
var HashMD, SHA256_IV, SHA224_IV, SHA384_IV, SHA512_IV;
var init_md = __esm({
  "node_modules/@noble/hashes/_md.js"() {
    init_utils2();
    HashMD = class {
      constructor(blockLen, outputLen, padOffset, isLE2) {
        __publicField(this, "blockLen");
        __publicField(this, "outputLen");
        __publicField(this, "canXOF", false);
        __publicField(this, "padOffset");
        __publicField(this, "isLE");
        // For partial updates less than block size
        __publicField(this, "buffer");
        __publicField(this, "view");
        __publicField(this, "finished", false);
        __publicField(this, "length", 0);
        __publicField(this, "pos", 0);
        __publicField(this, "destroyed", false);
        this.blockLen = blockLen;
        this.outputLen = outputLen;
        this.padOffset = padOffset;
        this.isLE = isLE2;
        this.buffer = new Uint8Array(blockLen);
        this.view = createView2(this.buffer);
      }
      update(data) {
        aexists2(this);
        abytes2(data);
        const { view, buffer, blockLen } = this;
        const len = data.length;
        for (let pos = 0; pos < len; ) {
          const take = Math.min(blockLen - this.pos, len - pos);
          if (take === blockLen) {
            const dataView = createView2(data);
            for (; blockLen <= len - pos; pos += blockLen)
              this.process(dataView, pos);
            continue;
          }
          buffer.set(data.subarray(pos, pos + take), this.pos);
          this.pos += take;
          pos += take;
          if (this.pos === blockLen) {
            this.process(view, 0);
            this.pos = 0;
          }
        }
        this.length += data.length;
        this.roundClean();
        return this;
      }
      digestInto(out) {
        aexists2(this);
        aoutput2(out, this);
        this.finished = true;
        const { buffer, view, blockLen, isLE: isLE2 } = this;
        let { pos } = this;
        buffer[pos++] = 128;
        clean2(this.buffer.subarray(pos));
        if (this.padOffset > blockLen - pos) {
          this.process(view, 0);
          pos = 0;
        }
        for (let i = pos; i < blockLen; i++)
          buffer[i] = 0;
        view.setBigUint64(blockLen - 8, BigInt(this.length * 8), isLE2);
        this.process(view, 0);
        const oview = createView2(out);
        const len = this.outputLen;
        if (len % 4)
          throw new Error("_sha2: outputLen must be aligned to 32bit");
        const outLen = len / 4;
        const state = this.get();
        if (outLen > state.length)
          throw new Error("_sha2: outputLen bigger than state");
        for (let i = 0; i < outLen; i++)
          oview.setUint32(4 * i, state[i], isLE2);
      }
      digest() {
        const { buffer, outputLen } = this;
        this.digestInto(buffer);
        const res = buffer.slice(0, outputLen);
        this.destroy();
        return res;
      }
      _cloneInto(to) {
        to || (to = new this.constructor());
        to.set(...this.get());
        const { blockLen, buffer, length, finished, destroyed, pos } = this;
        to.destroyed = destroyed;
        to.finished = finished;
        to.length = length;
        to.pos = pos;
        if (length % blockLen)
          to.buffer.set(buffer);
        return to;
      }
      clone() {
        return this._cloneInto();
      }
    };
    SHA256_IV = /* @__PURE__ */ Uint32Array.from([
      1779033703,
      3144134277,
      1013904242,
      2773480762,
      1359893119,
      2600822924,
      528734635,
      1541459225
    ]);
    SHA224_IV = /* @__PURE__ */ Uint32Array.from([
      3238371032,
      914150663,
      812702999,
      4144912697,
      4290775857,
      1750603025,
      1694076839,
      3204075428
    ]);
    SHA384_IV = /* @__PURE__ */ Uint32Array.from([
      3418070365,
      3238371032,
      1654270250,
      914150663,
      2438529370,
      812702999,
      355462360,
      4144912697,
      1731405415,
      4290775857,
      2394180231,
      1750603025,
      3675008525,
      1694076839,
      1203062813,
      3204075428
    ]);
    SHA512_IV = /* @__PURE__ */ Uint32Array.from([
      1779033703,
      4089235720,
      3144134277,
      2227873595,
      1013904242,
      4271175723,
      2773480762,
      1595750129,
      1359893119,
      2917565137,
      2600822924,
      725511199,
      528734635,
      4215389547,
      1541459225,
      327033209
    ]);
  }
});

// node_modules/@noble/hashes/_u64.js
function fromBig(n, le = false) {
  if (le)
    return { h: Number(n & U32_MASK64), l: Number(n >> _32n & U32_MASK64) };
  return { h: Number(n >> _32n & U32_MASK64) | 0, l: Number(n & U32_MASK64) | 0 };
}
function split(lst, le = false) {
  const len = lst.length;
  let Ah = new Uint32Array(len);
  let Al = new Uint32Array(len);
  for (let i = 0; i < len; i++) {
    const { h, l } = fromBig(lst[i], le);
    [Ah[i], Al[i]] = [h, l];
  }
  return [Ah, Al];
}
function add(Ah, Al, Bh, Bl) {
  const l = (Al >>> 0) + (Bl >>> 0);
  return { h: Ah + Bh + (l / 2 ** 32 | 0) | 0, l: l | 0 };
}
var U32_MASK64, _32n, shrSH, shrSL, rotrSH, rotrSL, rotrBH, rotrBL, add3L, add3H, add4L, add4H, add5L, add5H;
var init_u64 = __esm({
  "node_modules/@noble/hashes/_u64.js"() {
    U32_MASK64 = /* @__PURE__ */ BigInt(2 ** 32 - 1);
    _32n = /* @__PURE__ */ BigInt(32);
    shrSH = (h, _l, s) => h >>> s;
    shrSL = (h, l, s) => h << 32 - s | l >>> s;
    rotrSH = (h, l, s) => h >>> s | l << 32 - s;
    rotrSL = (h, l, s) => h << 32 - s | l >>> s;
    rotrBH = (h, l, s) => h << 64 - s | l >>> s - 32;
    rotrBL = (h, l, s) => h >>> s - 32 | l << 64 - s;
    add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
    add3H = (low, Ah, Bh, Ch) => Ah + Bh + Ch + (low / 2 ** 32 | 0) | 0;
    add4L = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
    add4H = (low, Ah, Bh, Ch, Dh) => Ah + Bh + Ch + Dh + (low / 2 ** 32 | 0) | 0;
    add5L = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
    add5H = (low, Ah, Bh, Ch, Dh, Eh) => Ah + Bh + Ch + Dh + Eh + (low / 2 ** 32 | 0) | 0;
  }
});

// node_modules/@noble/hashes/sha2.js
var sha2_exports = {};
__export(sha2_exports, {
  _SHA224: () => _SHA224,
  _SHA256: () => _SHA256,
  _SHA384: () => _SHA384,
  _SHA512: () => _SHA512,
  _SHA512_224: () => _SHA512_224,
  _SHA512_256: () => _SHA512_256,
  sha224: () => sha224,
  sha256: () => sha256,
  sha384: () => sha384,
  sha512: () => sha512,
  sha512_224: () => sha512_224,
  sha512_256: () => sha512_256
});
var SHA256_K, SHA256_W, SHA2_32B, _SHA256, _SHA224, K512, SHA512_Kh, SHA512_Kl, SHA512_W_H, SHA512_W_L, SHA2_64B, _SHA512, _SHA384, T224_IV, T256_IV, _SHA512_224, _SHA512_256, sha256, sha224, sha512, sha384, sha512_256, sha512_224;
var init_sha2 = __esm({
  "node_modules/@noble/hashes/sha2.js"() {
    init_md();
    init_u64();
    init_utils2();
    SHA256_K = /* @__PURE__ */ Uint32Array.from([
      1116352408,
      1899447441,
      3049323471,
      3921009573,
      961987163,
      1508970993,
      2453635748,
      2870763221,
      3624381080,
      310598401,
      607225278,
      1426881987,
      1925078388,
      2162078206,
      2614888103,
      3248222580,
      3835390401,
      4022224774,
      264347078,
      604807628,
      770255983,
      1249150122,
      1555081692,
      1996064986,
      2554220882,
      2821834349,
      2952996808,
      3210313671,
      3336571891,
      3584528711,
      113926993,
      338241895,
      666307205,
      773529912,
      1294757372,
      1396182291,
      1695183700,
      1986661051,
      2177026350,
      2456956037,
      2730485921,
      2820302411,
      3259730800,
      3345764771,
      3516065817,
      3600352804,
      4094571909,
      275423344,
      430227734,
      506948616,
      659060556,
      883997877,
      958139571,
      1322822218,
      1537002063,
      1747873779,
      1955562222,
      2024104815,
      2227730452,
      2361852424,
      2428436474,
      2756734187,
      3204031479,
      3329325298
    ]);
    SHA256_W = /* @__PURE__ */ new Uint32Array(64);
    SHA2_32B = class extends HashMD {
      constructor(outputLen) {
        super(64, outputLen, 8, false);
      }
      get() {
        const { A, B, C, D, E, F, G, H } = this;
        return [A, B, C, D, E, F, G, H];
      }
      // prettier-ignore
      set(A, B, C, D, E, F, G, H) {
        this.A = A | 0;
        this.B = B | 0;
        this.C = C | 0;
        this.D = D | 0;
        this.E = E | 0;
        this.F = F | 0;
        this.G = G | 0;
        this.H = H | 0;
      }
      process(view, offset) {
        for (let i = 0; i < 16; i++, offset += 4)
          SHA256_W[i] = view.getUint32(offset, false);
        for (let i = 16; i < 64; i++) {
          const W15 = SHA256_W[i - 15];
          const W2 = SHA256_W[i - 2];
          const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
          const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
          SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
        }
        let { A, B, C, D, E, F, G, H } = this;
        for (let i = 0; i < 64; i++) {
          const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
          const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
          const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
          const T2 = sigma0 + Maj(A, B, C) | 0;
          H = G;
          G = F;
          F = E;
          E = D + T1 | 0;
          D = C;
          C = B;
          B = A;
          A = T1 + T2 | 0;
        }
        A = A + this.A | 0;
        B = B + this.B | 0;
        C = C + this.C | 0;
        D = D + this.D | 0;
        E = E + this.E | 0;
        F = F + this.F | 0;
        G = G + this.G | 0;
        H = H + this.H | 0;
        this.set(A, B, C, D, E, F, G, H);
      }
      roundClean() {
        clean2(SHA256_W);
      }
      destroy() {
        this.destroyed = true;
        this.set(0, 0, 0, 0, 0, 0, 0, 0);
        clean2(this.buffer);
      }
    };
    _SHA256 = class extends SHA2_32B {
      constructor() {
        super(32);
        // We cannot use array here since array allows indexing by variable
        // which means optimizer/compiler cannot use registers.
        __publicField(this, "A", SHA256_IV[0] | 0);
        __publicField(this, "B", SHA256_IV[1] | 0);
        __publicField(this, "C", SHA256_IV[2] | 0);
        __publicField(this, "D", SHA256_IV[3] | 0);
        __publicField(this, "E", SHA256_IV[4] | 0);
        __publicField(this, "F", SHA256_IV[5] | 0);
        __publicField(this, "G", SHA256_IV[6] | 0);
        __publicField(this, "H", SHA256_IV[7] | 0);
      }
    };
    _SHA224 = class extends SHA2_32B {
      constructor() {
        super(28);
        __publicField(this, "A", SHA224_IV[0] | 0);
        __publicField(this, "B", SHA224_IV[1] | 0);
        __publicField(this, "C", SHA224_IV[2] | 0);
        __publicField(this, "D", SHA224_IV[3] | 0);
        __publicField(this, "E", SHA224_IV[4] | 0);
        __publicField(this, "F", SHA224_IV[5] | 0);
        __publicField(this, "G", SHA224_IV[6] | 0);
        __publicField(this, "H", SHA224_IV[7] | 0);
      }
    };
    K512 = /* @__PURE__ */ (() => split([
      "0x428a2f98d728ae22",
      "0x7137449123ef65cd",
      "0xb5c0fbcfec4d3b2f",
      "0xe9b5dba58189dbbc",
      "0x3956c25bf348b538",
      "0x59f111f1b605d019",
      "0x923f82a4af194f9b",
      "0xab1c5ed5da6d8118",
      "0xd807aa98a3030242",
      "0x12835b0145706fbe",
      "0x243185be4ee4b28c",
      "0x550c7dc3d5ffb4e2",
      "0x72be5d74f27b896f",
      "0x80deb1fe3b1696b1",
      "0x9bdc06a725c71235",
      "0xc19bf174cf692694",
      "0xe49b69c19ef14ad2",
      "0xefbe4786384f25e3",
      "0x0fc19dc68b8cd5b5",
      "0x240ca1cc77ac9c65",
      "0x2de92c6f592b0275",
      "0x4a7484aa6ea6e483",
      "0x5cb0a9dcbd41fbd4",
      "0x76f988da831153b5",
      "0x983e5152ee66dfab",
      "0xa831c66d2db43210",
      "0xb00327c898fb213f",
      "0xbf597fc7beef0ee4",
      "0xc6e00bf33da88fc2",
      "0xd5a79147930aa725",
      "0x06ca6351e003826f",
      "0x142929670a0e6e70",
      "0x27b70a8546d22ffc",
      "0x2e1b21385c26c926",
      "0x4d2c6dfc5ac42aed",
      "0x53380d139d95b3df",
      "0x650a73548baf63de",
      "0x766a0abb3c77b2a8",
      "0x81c2c92e47edaee6",
      "0x92722c851482353b",
      "0xa2bfe8a14cf10364",
      "0xa81a664bbc423001",
      "0xc24b8b70d0f89791",
      "0xc76c51a30654be30",
      "0xd192e819d6ef5218",
      "0xd69906245565a910",
      "0xf40e35855771202a",
      "0x106aa07032bbd1b8",
      "0x19a4c116b8d2d0c8",
      "0x1e376c085141ab53",
      "0x2748774cdf8eeb99",
      "0x34b0bcb5e19b48a8",
      "0x391c0cb3c5c95a63",
      "0x4ed8aa4ae3418acb",
      "0x5b9cca4f7763e373",
      "0x682e6ff3d6b2b8a3",
      "0x748f82ee5defb2fc",
      "0x78a5636f43172f60",
      "0x84c87814a1f0ab72",
      "0x8cc702081a6439ec",
      "0x90befffa23631e28",
      "0xa4506cebde82bde9",
      "0xbef9a3f7b2c67915",
      "0xc67178f2e372532b",
      "0xca273eceea26619c",
      "0xd186b8c721c0c207",
      "0xeada7dd6cde0eb1e",
      "0xf57d4f7fee6ed178",
      "0x06f067aa72176fba",
      "0x0a637dc5a2c898a6",
      "0x113f9804bef90dae",
      "0x1b710b35131c471b",
      "0x28db77f523047d84",
      "0x32caab7b40c72493",
      "0x3c9ebe0a15c9bebc",
      "0x431d67c49c100d4c",
      "0x4cc5d4becb3e42b6",
      "0x597f299cfc657e2a",
      "0x5fcb6fab3ad6faec",
      "0x6c44198c4a475817"
    ].map((n) => BigInt(n))))();
    SHA512_Kh = /* @__PURE__ */ (() => K512[0])();
    SHA512_Kl = /* @__PURE__ */ (() => K512[1])();
    SHA512_W_H = /* @__PURE__ */ new Uint32Array(80);
    SHA512_W_L = /* @__PURE__ */ new Uint32Array(80);
    SHA2_64B = class extends HashMD {
      constructor(outputLen) {
        super(128, outputLen, 16, false);
      }
      // prettier-ignore
      get() {
        const { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
        return [Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl];
      }
      // prettier-ignore
      set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl) {
        this.Ah = Ah | 0;
        this.Al = Al | 0;
        this.Bh = Bh | 0;
        this.Bl = Bl | 0;
        this.Ch = Ch | 0;
        this.Cl = Cl | 0;
        this.Dh = Dh | 0;
        this.Dl = Dl | 0;
        this.Eh = Eh | 0;
        this.El = El | 0;
        this.Fh = Fh | 0;
        this.Fl = Fl | 0;
        this.Gh = Gh | 0;
        this.Gl = Gl | 0;
        this.Hh = Hh | 0;
        this.Hl = Hl | 0;
      }
      process(view, offset) {
        for (let i = 0; i < 16; i++, offset += 4) {
          SHA512_W_H[i] = view.getUint32(offset);
          SHA512_W_L[i] = view.getUint32(offset += 4);
        }
        for (let i = 16; i < 80; i++) {
          const W15h = SHA512_W_H[i - 15] | 0;
          const W15l = SHA512_W_L[i - 15] | 0;
          const s0h = rotrSH(W15h, W15l, 1) ^ rotrSH(W15h, W15l, 8) ^ shrSH(W15h, W15l, 7);
          const s0l = rotrSL(W15h, W15l, 1) ^ rotrSL(W15h, W15l, 8) ^ shrSL(W15h, W15l, 7);
          const W2h = SHA512_W_H[i - 2] | 0;
          const W2l = SHA512_W_L[i - 2] | 0;
          const s1h = rotrSH(W2h, W2l, 19) ^ rotrBH(W2h, W2l, 61) ^ shrSH(W2h, W2l, 6);
          const s1l = rotrSL(W2h, W2l, 19) ^ rotrBL(W2h, W2l, 61) ^ shrSL(W2h, W2l, 6);
          const SUMl = add4L(s0l, s1l, SHA512_W_L[i - 7], SHA512_W_L[i - 16]);
          const SUMh = add4H(SUMl, s0h, s1h, SHA512_W_H[i - 7], SHA512_W_H[i - 16]);
          SHA512_W_H[i] = SUMh | 0;
          SHA512_W_L[i] = SUMl | 0;
        }
        let { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
        for (let i = 0; i < 80; i++) {
          const sigma1h = rotrSH(Eh, El, 14) ^ rotrSH(Eh, El, 18) ^ rotrBH(Eh, El, 41);
          const sigma1l = rotrSL(Eh, El, 14) ^ rotrSL(Eh, El, 18) ^ rotrBL(Eh, El, 41);
          const CHIh = Eh & Fh ^ ~Eh & Gh;
          const CHIl = El & Fl ^ ~El & Gl;
          const T1ll = add5L(Hl, sigma1l, CHIl, SHA512_Kl[i], SHA512_W_L[i]);
          const T1h = add5H(T1ll, Hh, sigma1h, CHIh, SHA512_Kh[i], SHA512_W_H[i]);
          const T1l = T1ll | 0;
          const sigma0h = rotrSH(Ah, Al, 28) ^ rotrBH(Ah, Al, 34) ^ rotrBH(Ah, Al, 39);
          const sigma0l = rotrSL(Ah, Al, 28) ^ rotrBL(Ah, Al, 34) ^ rotrBL(Ah, Al, 39);
          const MAJh = Ah & Bh ^ Ah & Ch ^ Bh & Ch;
          const MAJl = Al & Bl ^ Al & Cl ^ Bl & Cl;
          Hh = Gh | 0;
          Hl = Gl | 0;
          Gh = Fh | 0;
          Gl = Fl | 0;
          Fh = Eh | 0;
          Fl = El | 0;
          ({ h: Eh, l: El } = add(Dh | 0, Dl | 0, T1h | 0, T1l | 0));
          Dh = Ch | 0;
          Dl = Cl | 0;
          Ch = Bh | 0;
          Cl = Bl | 0;
          Bh = Ah | 0;
          Bl = Al | 0;
          const All = add3L(T1l, sigma0l, MAJl);
          Ah = add3H(All, T1h, sigma0h, MAJh);
          Al = All | 0;
        }
        ({ h: Ah, l: Al } = add(this.Ah | 0, this.Al | 0, Ah | 0, Al | 0));
        ({ h: Bh, l: Bl } = add(this.Bh | 0, this.Bl | 0, Bh | 0, Bl | 0));
        ({ h: Ch, l: Cl } = add(this.Ch | 0, this.Cl | 0, Ch | 0, Cl | 0));
        ({ h: Dh, l: Dl } = add(this.Dh | 0, this.Dl | 0, Dh | 0, Dl | 0));
        ({ h: Eh, l: El } = add(this.Eh | 0, this.El | 0, Eh | 0, El | 0));
        ({ h: Fh, l: Fl } = add(this.Fh | 0, this.Fl | 0, Fh | 0, Fl | 0));
        ({ h: Gh, l: Gl } = add(this.Gh | 0, this.Gl | 0, Gh | 0, Gl | 0));
        ({ h: Hh, l: Hl } = add(this.Hh | 0, this.Hl | 0, Hh | 0, Hl | 0));
        this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
      }
      roundClean() {
        clean2(SHA512_W_H, SHA512_W_L);
      }
      destroy() {
        this.destroyed = true;
        clean2(this.buffer);
        this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
      }
    };
    _SHA512 = class extends SHA2_64B {
      constructor() {
        super(64);
        __publicField(this, "Ah", SHA512_IV[0] | 0);
        __publicField(this, "Al", SHA512_IV[1] | 0);
        __publicField(this, "Bh", SHA512_IV[2] | 0);
        __publicField(this, "Bl", SHA512_IV[3] | 0);
        __publicField(this, "Ch", SHA512_IV[4] | 0);
        __publicField(this, "Cl", SHA512_IV[5] | 0);
        __publicField(this, "Dh", SHA512_IV[6] | 0);
        __publicField(this, "Dl", SHA512_IV[7] | 0);
        __publicField(this, "Eh", SHA512_IV[8] | 0);
        __publicField(this, "El", SHA512_IV[9] | 0);
        __publicField(this, "Fh", SHA512_IV[10] | 0);
        __publicField(this, "Fl", SHA512_IV[11] | 0);
        __publicField(this, "Gh", SHA512_IV[12] | 0);
        __publicField(this, "Gl", SHA512_IV[13] | 0);
        __publicField(this, "Hh", SHA512_IV[14] | 0);
        __publicField(this, "Hl", SHA512_IV[15] | 0);
      }
    };
    _SHA384 = class extends SHA2_64B {
      constructor() {
        super(48);
        __publicField(this, "Ah", SHA384_IV[0] | 0);
        __publicField(this, "Al", SHA384_IV[1] | 0);
        __publicField(this, "Bh", SHA384_IV[2] | 0);
        __publicField(this, "Bl", SHA384_IV[3] | 0);
        __publicField(this, "Ch", SHA384_IV[4] | 0);
        __publicField(this, "Cl", SHA384_IV[5] | 0);
        __publicField(this, "Dh", SHA384_IV[6] | 0);
        __publicField(this, "Dl", SHA384_IV[7] | 0);
        __publicField(this, "Eh", SHA384_IV[8] | 0);
        __publicField(this, "El", SHA384_IV[9] | 0);
        __publicField(this, "Fh", SHA384_IV[10] | 0);
        __publicField(this, "Fl", SHA384_IV[11] | 0);
        __publicField(this, "Gh", SHA384_IV[12] | 0);
        __publicField(this, "Gl", SHA384_IV[13] | 0);
        __publicField(this, "Hh", SHA384_IV[14] | 0);
        __publicField(this, "Hl", SHA384_IV[15] | 0);
      }
    };
    T224_IV = /* @__PURE__ */ Uint32Array.from([
      2352822216,
      424955298,
      1944164710,
      2312950998,
      502970286,
      855612546,
      1738396948,
      1479516111,
      258812777,
      2077511080,
      2011393907,
      79989058,
      1067287976,
      1780299464,
      286451373,
      2446758561
    ]);
    T256_IV = /* @__PURE__ */ Uint32Array.from([
      573645204,
      4230739756,
      2673172387,
      3360449730,
      596883563,
      1867755857,
      2520282905,
      1497426621,
      2519219938,
      2827943907,
      3193839141,
      1401305490,
      721525244,
      746961066,
      246885852,
      2177182882
    ]);
    _SHA512_224 = class extends SHA2_64B {
      constructor() {
        super(28);
        __publicField(this, "Ah", T224_IV[0] | 0);
        __publicField(this, "Al", T224_IV[1] | 0);
        __publicField(this, "Bh", T224_IV[2] | 0);
        __publicField(this, "Bl", T224_IV[3] | 0);
        __publicField(this, "Ch", T224_IV[4] | 0);
        __publicField(this, "Cl", T224_IV[5] | 0);
        __publicField(this, "Dh", T224_IV[6] | 0);
        __publicField(this, "Dl", T224_IV[7] | 0);
        __publicField(this, "Eh", T224_IV[8] | 0);
        __publicField(this, "El", T224_IV[9] | 0);
        __publicField(this, "Fh", T224_IV[10] | 0);
        __publicField(this, "Fl", T224_IV[11] | 0);
        __publicField(this, "Gh", T224_IV[12] | 0);
        __publicField(this, "Gl", T224_IV[13] | 0);
        __publicField(this, "Hh", T224_IV[14] | 0);
        __publicField(this, "Hl", T224_IV[15] | 0);
      }
    };
    _SHA512_256 = class extends SHA2_64B {
      constructor() {
        super(32);
        __publicField(this, "Ah", T256_IV[0] | 0);
        __publicField(this, "Al", T256_IV[1] | 0);
        __publicField(this, "Bh", T256_IV[2] | 0);
        __publicField(this, "Bl", T256_IV[3] | 0);
        __publicField(this, "Ch", T256_IV[4] | 0);
        __publicField(this, "Cl", T256_IV[5] | 0);
        __publicField(this, "Dh", T256_IV[6] | 0);
        __publicField(this, "Dl", T256_IV[7] | 0);
        __publicField(this, "Eh", T256_IV[8] | 0);
        __publicField(this, "El", T256_IV[9] | 0);
        __publicField(this, "Fh", T256_IV[10] | 0);
        __publicField(this, "Fl", T256_IV[11] | 0);
        __publicField(this, "Gh", T256_IV[12] | 0);
        __publicField(this, "Gl", T256_IV[13] | 0);
        __publicField(this, "Hh", T256_IV[14] | 0);
        __publicField(this, "Hl", T256_IV[15] | 0);
      }
    };
    sha256 = /* @__PURE__ */ createHasher(
      () => new _SHA256(),
      /* @__PURE__ */ oidNist(1)
    );
    sha224 = /* @__PURE__ */ createHasher(
      () => new _SHA224(),
      /* @__PURE__ */ oidNist(4)
    );
    sha512 = /* @__PURE__ */ createHasher(
      () => new _SHA512(),
      /* @__PURE__ */ oidNist(3)
    );
    sha384 = /* @__PURE__ */ createHasher(
      () => new _SHA384(),
      /* @__PURE__ */ oidNist(2)
    );
    sha512_256 = /* @__PURE__ */ createHasher(
      () => new _SHA512_256(),
      /* @__PURE__ */ oidNist(6)
    );
    sha512_224 = /* @__PURE__ */ createHasher(
      () => new _SHA512_224(),
      /* @__PURE__ */ oidNist(5)
    );
  }
});

// node_modules/@noble/curves/utils.js
function abool2(value, title = "") {
  if (typeof value !== "boolean") {
    const prefix = title && `"${title}" `;
    throw new TypeError(prefix + "expected boolean, got type=" + typeof value);
  }
  return value;
}
function abignumber(n) {
  if (typeof n === "bigint") {
    if (!isPosBig(n))
      throw new RangeError("positive bigint expected, got " + n);
  } else
    anumber3(n);
  return n;
}
function asafenumber(value, title = "") {
  if (typeof value !== "number") {
    const prefix = title && `"${title}" `;
    throw new TypeError(prefix + "expected number, got type=" + typeof value);
  }
  if (!Number.isSafeInteger(value)) {
    const prefix = title && `"${title}" `;
    throw new RangeError(prefix + "expected safe integer, got " + value);
  }
}
function numberToHexUnpadded(num) {
  const hex = abignumber(num).toString(16);
  return hex.length & 1 ? "0" + hex : hex;
}
function hexToNumber(hex) {
  if (typeof hex !== "string")
    throw new TypeError("hex string expected, got " + typeof hex);
  return hex === "" ? _0n : BigInt("0x" + hex);
}
function bytesToNumberBE(bytes) {
  return hexToNumber(bytesToHex(bytes));
}
function bytesToNumberLE(bytes) {
  return hexToNumber(bytesToHex(copyBytes2(abytes2(bytes)).reverse()));
}
function numberToBytesBE(n, len) {
  anumber2(len);
  if (len === 0)
    throw new RangeError("zero length");
  n = abignumber(n);
  const hex = n.toString(16);
  if (hex.length > len * 2)
    throw new RangeError("number too large");
  return hexToBytes(hex.padStart(len * 2, "0"));
}
function numberToBytesLE(n, len) {
  return numberToBytesBE(n, len).reverse();
}
function copyBytes2(bytes) {
  return Uint8Array.from(abytes3(bytes));
}
function asciiToBytes(ascii) {
  if (typeof ascii !== "string")
    throw new TypeError("ascii string expected, got " + typeof ascii);
  return Uint8Array.from(ascii, (c, i) => {
    const charCode = c.charCodeAt(0);
    if (c.length !== 1 || charCode > 127) {
      throw new RangeError(`string contains non-ASCII character "${ascii[i]}" with code ${charCode} at position ${i}`);
    }
    return charCode;
  });
}
function inRange(n, min, max) {
  return isPosBig(n) && isPosBig(min) && isPosBig(max) && min <= n && n < max;
}
function aInRange(title, n, min, max) {
  if (!inRange(n, min, max))
    throw new RangeError("expected valid " + title + ": " + min + " <= n < " + max + ", got " + n);
}
function bitLen(n) {
  if (n < _0n)
    throw new Error("expected non-negative bigint, got " + n);
  let len;
  for (len = 0; n > _0n; n >>= _1n, len += 1)
    ;
  return len;
}
function createHmacDrbg(hashLen, qByteLen, hmacFn) {
  anumber2(hashLen, "hashLen");
  anumber2(qByteLen, "qByteLen");
  if (typeof hmacFn !== "function")
    throw new TypeError("hmacFn must be a function");
  const u8n = (len) => new Uint8Array(len);
  const NULL = Uint8Array.of();
  const byte0 = Uint8Array.of(0);
  const byte1 = Uint8Array.of(1);
  const _maxDrbgIters = 1e3;
  let v = u8n(hashLen);
  let k = u8n(hashLen);
  let i = 0;
  const reset = () => {
    v.fill(1);
    k.fill(0);
    i = 0;
  };
  const h = (...msgs) => hmacFn(k, concatBytes3(v, ...msgs));
  const reseed = (seed = NULL) => {
    k = h(byte0, seed);
    v = h();
    if (seed.length === 0)
      return;
    k = h(byte1, seed);
    v = h();
  };
  const gen = () => {
    if (i++ >= _maxDrbgIters)
      throw new Error("drbg: tried max amount of iterations");
    let len = 0;
    const out = [];
    while (len < qByteLen) {
      v = h();
      const sl = v.slice();
      out.push(sl);
      len += v.length;
    }
    return concatBytes3(...out);
  };
  const genUntil = (seed, pred) => {
    reset();
    reseed(seed);
    let res = void 0;
    while ((res = pred(gen())) === void 0)
      reseed();
    reset();
    return res;
  };
  return genUntil;
}
function validateObject(object, fields = {}, optFields = {}) {
  if (Object.prototype.toString.call(object) !== "[object Object]")
    throw new TypeError("expected valid options object");
  function checkField(fieldName, expectedType, isOpt) {
    if (!isOpt && expectedType !== "function" && !Object.hasOwn(object, fieldName))
      throw new TypeError(`param "${fieldName}" is invalid: expected own property`);
    const val = object[fieldName];
    if (isOpt && val === void 0)
      return;
    const current = typeof val;
    if (current !== expectedType || val === null)
      throw new TypeError(`param "${fieldName}" is invalid: expected ${expectedType}, got ${current}`);
  }
  const iter = (f, isOpt) => Object.entries(f).forEach(([k, v]) => checkField(k, v, isOpt));
  iter(fields, false);
  iter(optFields, true);
}
var abytes3, anumber3, bytesToHex2, concatBytes3, hexToBytes2, isBytes3, randomBytes2, _0n, _1n, isPosBig, bitMask;
var init_utils3 = __esm({
  "node_modules/@noble/curves/utils.js"() {
    init_utils2();
    abytes3 = (value, length, title) => abytes2(value, length, title);
    anumber3 = anumber2;
    bytesToHex2 = bytesToHex;
    concatBytes3 = (...arrays) => concatBytes2(...arrays);
    hexToBytes2 = (hex) => hexToBytes(hex);
    isBytes3 = isBytes2;
    randomBytes2 = (bytesLength) => randomBytes(bytesLength);
    _0n = /* @__PURE__ */ BigInt(0);
    _1n = /* @__PURE__ */ BigInt(1);
    isPosBig = (n) => typeof n === "bigint" && _0n <= n;
    bitMask = (n) => (_1n << BigInt(n)) - _1n;
  }
});

// node_modules/@noble/curves/abstract/modular.js
function mod(a, b) {
  if (b <= _0n2)
    throw new Error("mod: expected positive modulus, got " + b);
  const result = a % b;
  return result >= _0n2 ? result : b + result;
}
function invert(number, modulo) {
  if (number === _0n2)
    throw new Error("invert: expected non-zero number");
  if (modulo <= _0n2)
    throw new Error("invert: expected positive modulus, got " + modulo);
  let a = mod(number, modulo);
  let b = modulo;
  let x = _0n2, y = _1n2, u = _1n2, v = _0n2;
  while (a !== _0n2) {
    const q = b / a;
    const r = b - a * q;
    const m = x - u * q;
    const n = y - v * q;
    b = a, a = r, x = u, y = v, u = m, v = n;
  }
  const gcd = b;
  if (gcd !== _1n2)
    throw new Error("invert: does not exist");
  return mod(x, modulo);
}
function assertIsSquare(Fp, root, n) {
  const F = Fp;
  if (!F.eql(F.sqr(root), n))
    throw new Error("Cannot find square root");
}
function sqrt3mod4(Fp, n) {
  const F = Fp;
  const p1div4 = (F.ORDER + _1n2) / _4n;
  const root = F.pow(n, p1div4);
  assertIsSquare(F, root, n);
  return root;
}
function sqrt5mod8(Fp, n) {
  const F = Fp;
  const p5div8 = (F.ORDER - _5n) / _8n;
  const n2 = F.mul(n, _2n);
  const v = F.pow(n2, p5div8);
  const nv = F.mul(n, v);
  const i = F.mul(F.mul(nv, _2n), v);
  const root = F.mul(nv, F.sub(i, F.ONE));
  assertIsSquare(F, root, n);
  return root;
}
function sqrt9mod16(P) {
  const Fp_ = Field(P);
  const tn = tonelliShanks(P);
  const c1 = tn(Fp_, Fp_.neg(Fp_.ONE));
  const c2 = tn(Fp_, c1);
  const c3 = tn(Fp_, Fp_.neg(c1));
  const c4 = (P + _7n) / _16n;
  return (Fp, n) => {
    const F = Fp;
    let tv1 = F.pow(n, c4);
    let tv2 = F.mul(tv1, c1);
    const tv3 = F.mul(tv1, c2);
    const tv4 = F.mul(tv1, c3);
    const e1 = F.eql(F.sqr(tv2), n);
    const e2 = F.eql(F.sqr(tv3), n);
    tv1 = F.cmov(tv1, tv2, e1);
    tv2 = F.cmov(tv4, tv3, e2);
    const e3 = F.eql(F.sqr(tv2), n);
    const root = F.cmov(tv1, tv2, e3);
    assertIsSquare(F, root, n);
    return root;
  };
}
function tonelliShanks(P) {
  if (P < _3n)
    throw new Error("sqrt is not defined for small field");
  let Q = P - _1n2;
  let S = 0;
  while (Q % _2n === _0n2) {
    Q /= _2n;
    S++;
  }
  let Z = _2n;
  const _Fp = Field(P);
  while (FpLegendre(_Fp, Z) === 1) {
    if (Z++ > 1e3)
      throw new Error("Cannot find square root: probably non-prime P");
  }
  if (S === 1)
    return sqrt3mod4;
  let cc = _Fp.pow(Z, Q);
  const Q1div2 = (Q + _1n2) / _2n;
  return function tonelliSlow(Fp, n) {
    const F = Fp;
    if (F.is0(n))
      return n;
    if (FpLegendre(F, n) !== 1)
      throw new Error("Cannot find square root");
    let M = S;
    let c = F.mul(F.ONE, cc);
    let t = F.pow(n, Q);
    let R = F.pow(n, Q1div2);
    while (!F.eql(t, F.ONE)) {
      if (F.is0(t))
        return F.ZERO;
      let i = 1;
      let t_tmp = F.sqr(t);
      while (!F.eql(t_tmp, F.ONE)) {
        i++;
        t_tmp = F.sqr(t_tmp);
        if (i === M)
          throw new Error("Cannot find square root");
      }
      const exponent = _1n2 << BigInt(M - i - 1);
      const b = F.pow(c, exponent);
      M = i;
      c = F.sqr(b);
      t = F.mul(t, c);
      R = F.mul(R, b);
    }
    return R;
  };
}
function FpSqrt(P) {
  if (P % _4n === _3n)
    return sqrt3mod4;
  if (P % _8n === _5n)
    return sqrt5mod8;
  if (P % _16n === _9n)
    return sqrt9mod16(P);
  return tonelliShanks(P);
}
function validateField(field) {
  const initial = {
    ORDER: "bigint",
    BYTES: "number",
    BITS: "number"
  };
  const opts = FIELD_FIELDS.reduce((map, val) => {
    map[val] = "function";
    return map;
  }, initial);
  validateObject(field, opts);
  asafenumber(field.BYTES, "BYTES");
  asafenumber(field.BITS, "BITS");
  if (field.BYTES < 1 || field.BITS < 1)
    throw new Error("invalid field: expected BYTES/BITS > 0");
  if (field.ORDER <= _1n2)
    throw new Error("invalid field: expected ORDER > 1, got " + field.ORDER);
  return field;
}
function FpPow(Fp, num, power) {
  const F = Fp;
  if (power < _0n2)
    throw new Error("invalid exponent, negatives unsupported");
  if (power === _0n2)
    return F.ONE;
  if (power === _1n2)
    return num;
  let p = F.ONE;
  let d = num;
  while (power > _0n2) {
    if (power & _1n2)
      p = F.mul(p, d);
    d = F.sqr(d);
    power >>= _1n2;
  }
  return p;
}
function FpInvertBatch(Fp, nums, passZero = false) {
  const F = Fp;
  const inverted = new Array(nums.length).fill(passZero ? F.ZERO : void 0);
  const multipliedAcc = nums.reduce((acc, num, i) => {
    if (F.is0(num))
      return acc;
    inverted[i] = acc;
    return F.mul(acc, num);
  }, F.ONE);
  const invertedAcc = F.inv(multipliedAcc);
  nums.reduceRight((acc, num, i) => {
    if (F.is0(num))
      return acc;
    inverted[i] = F.mul(acc, inverted[i]);
    return F.mul(acc, num);
  }, invertedAcc);
  return inverted;
}
function FpLegendre(Fp, n) {
  const F = Fp;
  const p1mod2 = (F.ORDER - _1n2) / _2n;
  const powered = F.pow(n, p1mod2);
  const yes = F.eql(powered, F.ONE);
  const zero = F.eql(powered, F.ZERO);
  const no = F.eql(powered, F.neg(F.ONE));
  if (!yes && !zero && !no)
    throw new Error("invalid Legendre symbol result");
  return yes ? 1 : zero ? 0 : -1;
}
function FpIsSquare(Fp, n) {
  const l = FpLegendre(Fp, n);
  return l !== -1;
}
function nLength(n, nBitLength) {
  if (nBitLength !== void 0)
    anumber3(nBitLength);
  if (n <= _0n2)
    throw new Error("invalid n length: expected positive n, got " + n);
  if (nBitLength !== void 0 && nBitLength < 1)
    throw new Error("invalid n length: expected positive bit length, got " + nBitLength);
  const bits = bitLen(n);
  if (nBitLength !== void 0 && nBitLength < bits)
    throw new Error(`invalid n length: expected bit length (${bits}) >= n.length (${nBitLength})`);
  const _nBitLength = nBitLength !== void 0 ? nBitLength : bits;
  const nByteLength = Math.ceil(_nBitLength / 8);
  return { nBitLength: _nBitLength, nByteLength };
}
function Field(ORDER, opts = {}) {
  return new _Field(ORDER, opts);
}
function getFieldBytesLength(fieldOrder) {
  if (typeof fieldOrder !== "bigint")
    throw new Error("field order must be bigint");
  if (fieldOrder <= _1n2)
    throw new Error("field order must be greater than 1");
  const bitLength = bitLen(fieldOrder - _1n2);
  return Math.ceil(bitLength / 8);
}
function getMinHashLength(fieldOrder) {
  const length = getFieldBytesLength(fieldOrder);
  return length + Math.ceil(length / 2);
}
function mapHashToField(key, fieldOrder, isLE2 = false) {
  abytes3(key);
  const len = key.length;
  const fieldLen = getFieldBytesLength(fieldOrder);
  const minLen = Math.max(getMinHashLength(fieldOrder), 16);
  if (len < minLen || len > 1024)
    throw new Error("expected " + minLen + "-1024 bytes of input, got " + len);
  const num = isLE2 ? bytesToNumberLE(key) : bytesToNumberBE(key);
  const reduced = mod(num, fieldOrder - _1n2) + _1n2;
  return isLE2 ? numberToBytesLE(reduced, fieldLen) : numberToBytesBE(reduced, fieldLen);
}
var _0n2, _1n2, _2n, _3n, _4n, _5n, _7n, _8n, _9n, _16n, FIELD_FIELDS, FIELD_SQRT, _Field;
var init_modular = __esm({
  "node_modules/@noble/curves/abstract/modular.js"() {
    init_utils3();
    _0n2 = /* @__PURE__ */ BigInt(0);
    _1n2 = /* @__PURE__ */ BigInt(1);
    _2n = /* @__PURE__ */ BigInt(2);
    _3n = /* @__PURE__ */ BigInt(3);
    _4n = /* @__PURE__ */ BigInt(4);
    _5n = /* @__PURE__ */ BigInt(5);
    _7n = /* @__PURE__ */ BigInt(7);
    _8n = /* @__PURE__ */ BigInt(8);
    _9n = /* @__PURE__ */ BigInt(9);
    _16n = /* @__PURE__ */ BigInt(16);
    FIELD_FIELDS = [
      "create",
      "isValid",
      "is0",
      "neg",
      "inv",
      "sqrt",
      "sqr",
      "eql",
      "add",
      "sub",
      "mul",
      "pow",
      "div",
      "addN",
      "subN",
      "mulN",
      "sqrN"
    ];
    FIELD_SQRT = /* @__PURE__ */ new WeakMap();
    _Field = class {
      constructor(ORDER, opts = {}) {
        __publicField(this, "ORDER");
        __publicField(this, "BITS");
        __publicField(this, "BYTES");
        __publicField(this, "isLE");
        __publicField(this, "ZERO", _0n2);
        __publicField(this, "ONE", _1n2);
        __publicField(this, "_lengths");
        __publicField(this, "_mod");
        if (ORDER <= _1n2)
          throw new Error("invalid field: expected ORDER > 1, got " + ORDER);
        let _nbitLength = void 0;
        this.isLE = false;
        if (opts != null && typeof opts === "object") {
          if (typeof opts.BITS === "number")
            _nbitLength = opts.BITS;
          if (typeof opts.sqrt === "function")
            Object.defineProperty(this, "sqrt", { value: opts.sqrt, enumerable: true });
          if (typeof opts.isLE === "boolean")
            this.isLE = opts.isLE;
          if (opts.allowedLengths)
            this._lengths = Object.freeze(opts.allowedLengths.slice());
          if (typeof opts.modFromBytes === "boolean")
            this._mod = opts.modFromBytes;
        }
        const { nBitLength, nByteLength } = nLength(ORDER, _nbitLength);
        if (nByteLength > 2048)
          throw new Error("invalid field: expected ORDER of <= 2048 bytes");
        this.ORDER = ORDER;
        this.BITS = nBitLength;
        this.BYTES = nByteLength;
        Object.freeze(this);
      }
      create(num) {
        return mod(num, this.ORDER);
      }
      isValid(num) {
        if (typeof num !== "bigint")
          throw new TypeError("invalid field element: expected bigint, got " + typeof num);
        return _0n2 <= num && num < this.ORDER;
      }
      is0(num) {
        return num === _0n2;
      }
      // is valid and invertible
      isValidNot0(num) {
        return !this.is0(num) && this.isValid(num);
      }
      isOdd(num) {
        return (num & _1n2) === _1n2;
      }
      neg(num) {
        return mod(-num, this.ORDER);
      }
      eql(lhs, rhs) {
        return lhs === rhs;
      }
      sqr(num) {
        return mod(num * num, this.ORDER);
      }
      add(lhs, rhs) {
        return mod(lhs + rhs, this.ORDER);
      }
      sub(lhs, rhs) {
        return mod(lhs - rhs, this.ORDER);
      }
      mul(lhs, rhs) {
        return mod(lhs * rhs, this.ORDER);
      }
      pow(num, power) {
        return FpPow(this, num, power);
      }
      div(lhs, rhs) {
        return mod(lhs * invert(rhs, this.ORDER), this.ORDER);
      }
      // Same as above, but doesn't normalize
      sqrN(num) {
        return num * num;
      }
      addN(lhs, rhs) {
        return lhs + rhs;
      }
      subN(lhs, rhs) {
        return lhs - rhs;
      }
      mulN(lhs, rhs) {
        return lhs * rhs;
      }
      inv(num) {
        return invert(num, this.ORDER);
      }
      sqrt(num) {
        let sqrt = FIELD_SQRT.get(this);
        if (!sqrt)
          FIELD_SQRT.set(this, sqrt = FpSqrt(this.ORDER));
        return sqrt(this, num);
      }
      toBytes(num) {
        return this.isLE ? numberToBytesLE(num, this.BYTES) : numberToBytesBE(num, this.BYTES);
      }
      fromBytes(bytes, skipValidation = false) {
        abytes3(bytes);
        const { _lengths: allowedLengths, BYTES, isLE: isLE2, ORDER, _mod: modFromBytes } = this;
        if (allowedLengths) {
          if (bytes.length < 1 || !allowedLengths.includes(bytes.length) || bytes.length > BYTES) {
            throw new Error("Field.fromBytes: expected " + allowedLengths + " bytes, got " + bytes.length);
          }
          const padded = new Uint8Array(BYTES);
          padded.set(bytes, isLE2 ? 0 : padded.length - bytes.length);
          bytes = padded;
        }
        if (bytes.length !== BYTES)
          throw new Error("Field.fromBytes: expected " + BYTES + " bytes, got " + bytes.length);
        let scalar = isLE2 ? bytesToNumberLE(bytes) : bytesToNumberBE(bytes);
        if (modFromBytes)
          scalar = mod(scalar, ORDER);
        if (!skipValidation) {
          if (!this.isValid(scalar))
            throw new Error("invalid field element: outside of range 0..ORDER");
        }
        return scalar;
      }
      // TODO: we don't need it here, move out to separate fn
      invertBatch(lst) {
        return FpInvertBatch(this, lst);
      }
      // We can't move this out because Fp6, Fp12 implement it
      // and it's unclear what to return in there.
      cmov(a, b, condition) {
        abool2(condition, "condition");
        return condition ? b : a;
      }
    };
    Object.freeze(_Field.prototype);
  }
});

// node_modules/@noble/curves/abstract/curve.js
function validatePointCons(Point) {
  const pc = Point;
  if (typeof pc !== "function")
    throw new TypeError("Point must be a constructor");
  validateObject({
    Fp: pc.Fp,
    Fn: pc.Fn,
    fromAffine: pc.fromAffine,
    fromBytes: pc.fromBytes,
    fromHex: pc.fromHex
  }, {
    Fp: "object",
    Fn: "object",
    fromAffine: "function",
    fromBytes: "function",
    fromHex: "function"
  });
  validateField(pc.Fp);
  validateField(pc.Fn);
}
function negateCt(condition, item) {
  const neg = item.negate();
  return condition ? neg : item;
}
function normalizeZ(c, points) {
  const invertedZs = FpInvertBatch(c.Fp, points.map((p) => p.Z));
  return points.map((p, i) => c.fromAffine(p.toAffine(invertedZs[i])));
}
function validateW(W, bits) {
  if (!Number.isSafeInteger(W) || W <= 0 || W > bits)
    throw new Error("invalid window size, expected [1.." + bits + "], got W=" + W);
}
function calcWOpts(W, scalarBits) {
  validateW(W, scalarBits);
  const windows = Math.ceil(scalarBits / W) + 1;
  const windowSize = 2 ** (W - 1);
  const maxNumber = 2 ** W;
  const mask = bitMask(W);
  const shiftBy = BigInt(W);
  return { windows, windowSize, mask, maxNumber, shiftBy };
}
function calcOffsets(n, window2, wOpts) {
  const { windowSize, mask, maxNumber, shiftBy } = wOpts;
  let wbits = Number(n & mask);
  let nextN = n >> shiftBy;
  if (wbits > windowSize) {
    wbits -= maxNumber;
    nextN += _1n3;
  }
  const offsetStart = window2 * windowSize;
  const offset = offsetStart + Math.abs(wbits) - 1;
  const isZero = wbits === 0;
  const isNeg = wbits < 0;
  const isNegF = window2 % 2 !== 0;
  const offsetF = offsetStart;
  return { nextN, offset, isZero, isNeg, isNegF, offsetF };
}
function validateMSMPoints(points, c) {
  if (!Array.isArray(points))
    throw new Error("array expected");
  points.forEach((p, i) => {
    if (!(p instanceof c))
      throw new Error("invalid point at index " + i);
  });
}
function validateMSMScalars(scalars, field) {
  if (!Array.isArray(scalars))
    throw new Error("array of scalars expected");
  scalars.forEach((s, i) => {
    if (!field.isValid(s))
      throw new Error("invalid scalar at index " + i);
  });
}
function getW(P) {
  return pointWindowSizes.get(P) || 1;
}
function assert0(n) {
  if (n !== _0n3)
    throw new Error("invalid wNAF");
}
function mulEndoUnsafe(Point, point, k1, k2) {
  let acc = point;
  let p1 = Point.ZERO;
  let p2 = Point.ZERO;
  while (k1 > _0n3 || k2 > _0n3) {
    if (k1 & _1n3)
      p1 = p1.add(acc);
    if (k2 & _1n3)
      p2 = p2.add(acc);
    acc = acc.double();
    k1 >>= _1n3;
    k2 >>= _1n3;
  }
  return { p1, p2 };
}
function pippenger(c, points, scalars) {
  const fieldN = c.Fn;
  validateMSMPoints(points, c);
  validateMSMScalars(scalars, fieldN);
  const plength = points.length;
  const slength = scalars.length;
  if (plength !== slength)
    throw new Error("arrays of points and scalars must have equal length");
  const zero = c.ZERO;
  const wbits = bitLen(BigInt(plength));
  let windowSize = 1;
  if (wbits > 12)
    windowSize = wbits - 3;
  else if (wbits > 4)
    windowSize = wbits - 2;
  else if (wbits > 0)
    windowSize = 2;
  const MASK = bitMask(windowSize);
  const buckets = new Array(Number(MASK) + 1).fill(zero);
  const lastBits = Math.floor((fieldN.BITS - 1) / windowSize) * windowSize;
  let sum = zero;
  for (let i = lastBits; i >= 0; i -= windowSize) {
    buckets.fill(zero);
    for (let j = 0; j < slength; j++) {
      const scalar = scalars[j];
      const wbits2 = Number(scalar >> BigInt(i) & MASK);
      buckets[wbits2] = buckets[wbits2].add(points[j]);
    }
    let resI = zero;
    for (let j = buckets.length - 1, sumI = zero; j > 0; j--) {
      sumI = sumI.add(buckets[j]);
      resI = resI.add(sumI);
    }
    sum = sum.add(resI);
    if (i !== 0)
      for (let j = 0; j < windowSize; j++)
        sum = sum.double();
  }
  return sum;
}
function createField(order, field, isLE2) {
  if (field) {
    if (field.ORDER !== order)
      throw new Error("Field.ORDER must match order: Fp == p, Fn == n");
    validateField(field);
    return field;
  } else {
    return Field(order, { isLE: isLE2 });
  }
}
function createCurveFields(type, CURVE, curveOpts = {}, FpFnLE) {
  if (FpFnLE === void 0)
    FpFnLE = type === "edwards";
  if (!CURVE || typeof CURVE !== "object")
    throw new Error(`expected valid ${type} CURVE object`);
  for (const p of ["p", "n", "h"]) {
    const val = CURVE[p];
    if (!(typeof val === "bigint" && val > _0n3))
      throw new Error(`CURVE.${p} must be positive bigint`);
  }
  const Fp = createField(CURVE.p, curveOpts.Fp, FpFnLE);
  const Fn = createField(CURVE.n, curveOpts.Fn, FpFnLE);
  const _b = type === "weierstrass" ? "b" : "d";
  const params = ["Gx", "Gy", "a", _b];
  for (const p of params) {
    if (!Fp.isValid(CURVE[p]))
      throw new Error(`CURVE.${p} must be valid field element of CURVE.Fp`);
  }
  CURVE = Object.freeze(Object.assign({}, CURVE));
  return { CURVE, Fp, Fn };
}
function createKeygen(randomSecretKey, getPublicKey) {
  return function keygen(seed) {
    const secretKey = randomSecretKey(seed);
    return { secretKey, publicKey: getPublicKey(secretKey) };
  };
}
var _0n3, _1n3, pointPrecomputes, pointWindowSizes, wNAF;
var init_curve = __esm({
  "node_modules/@noble/curves/abstract/curve.js"() {
    init_utils3();
    init_modular();
    _0n3 = /* @__PURE__ */ BigInt(0);
    _1n3 = /* @__PURE__ */ BigInt(1);
    pointPrecomputes = /* @__PURE__ */ new WeakMap();
    pointWindowSizes = /* @__PURE__ */ new WeakMap();
    wNAF = class {
      // Parametrized with a given Point class (not individual point)
      constructor(Point, bits) {
        __publicField(this, "BASE");
        __publicField(this, "ZERO");
        __publicField(this, "Fn");
        __publicField(this, "bits");
        this.BASE = Point.BASE;
        this.ZERO = Point.ZERO;
        this.Fn = Point.Fn;
        this.bits = bits;
      }
      // non-const time multiplication ladder
      _unsafeLadder(elm, n, p = this.ZERO) {
        let d = elm;
        while (n > _0n3) {
          if (n & _1n3)
            p = p.add(d);
          d = d.double();
          n >>= _1n3;
        }
        return p;
      }
      /**
       * Creates a wNAF precomputation window. Used for caching.
       * Default window size is set by `utils.precompute()` and is equal to 8.
       * Number of precomputed points depends on the curve size:
       * 2^(ð‘Šâˆ’1) * (Math.ceil(ð‘› / ð‘Š) + 1), where:
       * - ð‘Š is the window size
       * - ð‘› is the bitlength of the curve order.
       * For a 256-bit curve and window size 8, the number of precomputed points is 128 * 33 = 4224.
       * @param point - Point instance
       * @param W - window size
       * @returns precomputed point tables flattened to a single array
       */
      precomputeWindow(point, W) {
        const { windows, windowSize } = calcWOpts(W, this.bits);
        const points = [];
        let p = point;
        let base = p;
        for (let window2 = 0; window2 < windows; window2++) {
          base = p;
          points.push(base);
          for (let i = 1; i < windowSize; i++) {
            base = base.add(p);
            points.push(base);
          }
          p = base.double();
        }
        return points;
      }
      /**
       * Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
       * More compact implementation:
       * https://github.com/paulmillr/noble-secp256k1/blob/47cb1669b6e506ad66b35fe7d76132ae97465da2/index.ts#L502-L541
       * @returns real and fake (for const-time) points
       */
      wNAF(W, precomputes, n) {
        if (!this.Fn.isValid(n))
          throw new Error("invalid scalar");
        let p = this.ZERO;
        let f = this.BASE;
        const wo = calcWOpts(W, this.bits);
        for (let window2 = 0; window2 < wo.windows; window2++) {
          const { nextN, offset, isZero, isNeg, isNegF, offsetF } = calcOffsets(n, window2, wo);
          n = nextN;
          if (isZero) {
            f = f.add(negateCt(isNegF, precomputes[offsetF]));
          } else {
            p = p.add(negateCt(isNeg, precomputes[offset]));
          }
        }
        assert0(n);
        return { p, f };
      }
      /**
       * Implements unsafe EC multiplication using precomputed tables
       * and w-ary non-adjacent form.
       * @param acc - accumulator point to add result of multiplication
       * @returns point
       */
      wNAFUnsafe(W, precomputes, n, acc = this.ZERO) {
        const wo = calcWOpts(W, this.bits);
        for (let window2 = 0; window2 < wo.windows; window2++) {
          if (n === _0n3)
            break;
          const { nextN, offset, isZero, isNeg } = calcOffsets(n, window2, wo);
          n = nextN;
          if (isZero) {
            continue;
          } else {
            const item = precomputes[offset];
            acc = acc.add(isNeg ? item.negate() : item);
          }
        }
        assert0(n);
        return acc;
      }
      getPrecomputes(W, point, transform) {
        let comp = pointPrecomputes.get(point);
        if (!comp) {
          comp = this.precomputeWindow(point, W);
          if (W !== 1) {
            if (typeof transform === "function")
              comp = transform(comp);
            pointPrecomputes.set(point, comp);
          }
        }
        return comp;
      }
      cached(point, scalar, transform) {
        const W = getW(point);
        return this.wNAF(W, this.getPrecomputes(W, point, transform), scalar);
      }
      unsafe(point, scalar, transform, prev) {
        const W = getW(point);
        if (W === 1)
          return this._unsafeLadder(point, scalar, prev);
        return this.wNAFUnsafe(W, this.getPrecomputes(W, point, transform), scalar, prev);
      }
      // We calculate precomputes for elliptic curve point multiplication
      // using windowed method. This specifies window size and
      // stores precomputed values. Usually only base point would be precomputed.
      createCache(P, W) {
        validateW(W, this.bits);
        pointWindowSizes.set(P, W);
        pointPrecomputes.delete(P);
      }
      hasCache(elm) {
        return getW(elm) !== 1;
      }
    };
  }
});

// node_modules/@noble/curves/abstract/fft.js
function checkU32(n) {
  if (!Number.isSafeInteger(n) || n < 0 || n > 4294967295)
    throw new Error("wrong u32 integer:" + n);
  return n;
}
function nextPowerOfTwo(n) {
  checkU32(n);
  if (n <= 1)
    return 1;
  if (n > 2147483648)
    throw new Error("nextPowerOfTwo overflow: result does not fit u32");
  return 1 << log2(n - 1) + 1 >>> 0;
}
function log2(n) {
  checkU32(n);
  return 31 - Math.clz32(n);
}
function poly(field, roots, create, fft, length) {
  const F = field;
  const _create = create || ((len, elm) => new Array(len).fill(elm ?? F.ZERO));
  const isPoly = (x) => {
    if (Array.isArray(x))
      return true;
    if (!ArrayBuffer.isView(x))
      return false;
    const v = x;
    return typeof v.length === "number" && typeof v.slice === "function" && typeof v[Symbol.iterator] === "function";
  };
  const checkLength = (...lst) => {
    if (!lst.length)
      return 0;
    for (const i of lst)
      if (!isPoly(i))
        throw new Error("poly: not polynomial: " + i);
    const L = lst[0].length;
    for (let i = 1; i < lst.length; i++)
      if (lst[i].length !== L)
        throw new Error(`poly: mismatched lengths ${L} vs ${lst[i].length}`);
    if (length !== void 0 && L !== length)
      throw new Error(`poly: expected fixed length ${length}, got ${L}`);
    return L;
  };
  function findOmegaIndex(x, n, brp = false) {
    const bits = log2(n);
    const omega = brp ? roots.brp(bits) : roots.roots(bits);
    for (let i = 0; i < n; i++)
      if (F.eql(x, omega[i]))
        return i;
    return -1;
  }
  return {
    roots,
    create: _create,
    length,
    extend: (a, len) => {
      checkLength(a);
      const out = _create(len, F.ZERO);
      for (let i = 0; i < Math.min(a.length, len); i++)
        out[i] = a[i];
      return out;
    },
    degree: (a) => {
      checkLength(a);
      for (let i = a.length - 1; i >= 0; i--)
        if (!F.is0(a[i]))
          return i;
      return -1;
    },
    add: (a, b) => {
      const len = checkLength(a, b);
      const out = _create(len);
      for (let i = 0; i < len; i++)
        out[i] = F.add(a[i], b[i]);
      return out;
    },
    sub: (a, b) => {
      const len = checkLength(a, b);
      const out = _create(len);
      for (let i = 0; i < len; i++)
        out[i] = F.sub(a[i], b[i]);
      return out;
    },
    dot: (a, b) => {
      const len = checkLength(a, b);
      const out = _create(len);
      for (let i = 0; i < len; i++)
        out[i] = F.mul(a[i], b[i]);
      return out;
    },
    mul: (a, b) => {
      if (isPoly(b)) {
        const len = checkLength(a, b);
        if (fft) {
          const A = fft.direct(a, false, true);
          const B = fft.direct(b, false, true);
          for (let i = 0; i < A.length; i++)
            A[i] = F.mul(A[i], B[i]);
          return fft.inverse(A, true, false);
        } else {
          const res = _create(len);
          for (let i = 0; i < len; i++) {
            for (let j = 0; j < len; j++) {
              const k = (i + j) % len;
              res[k] = F.add(res[k], F.mul(a[i], b[j]));
            }
          }
          return res;
        }
      } else {
        const out = _create(checkLength(a));
        for (let i = 0; i < out.length; i++)
          out[i] = F.mul(a[i], b);
        return out;
      }
    },
    convolve(a, b) {
      const len = nextPowerOfTwo(a.length + b.length - 1);
      return this.mul(this.extend(a, len), this.extend(b, len));
    },
    shift(p, factor) {
      const out = _create(checkLength(p));
      out[0] = p[0];
      for (let i = 1, power = F.ONE; i < p.length; i++) {
        power = F.mul(power, factor);
        out[i] = F.mul(p[i], power);
      }
      return out;
    },
    clone: (a) => {
      checkLength(a);
      const out = _create(a.length);
      for (let i = 0; i < a.length; i++)
        out[i] = a[i];
      return out;
    },
    eval: (a, basis) => {
      checkLength(a, basis);
      let acc = F.ZERO;
      for (let i = 0; i < a.length; i++)
        acc = F.add(acc, F.mul(a[i], basis[i]));
      return acc;
    },
    monomial: {
      basis: (x, n) => {
        const out = _create(n);
        let pow = F.ONE;
        for (let i = 0; i < n; i++) {
          out[i] = pow;
          pow = F.mul(pow, x);
        }
        return out;
      },
      eval: (a, x) => {
        checkLength(a);
        let acc = F.ZERO;
        for (let i = a.length - 1; i >= 0; i--)
          acc = F.add(F.mul(acc, x), a[i]);
        return acc;
      }
    },
    lagrange: {
      basis: (x, n, brp = false, weights) => {
        const bits = log2(n);
        const cache = weights || (brp ? roots.brp(bits) : roots.roots(bits));
        const out = _create(n);
        const idx = findOmegaIndex(x, n, brp);
        if (idx !== -1) {
          out[idx] = F.ONE;
          return out;
        }
        const tm = F.pow(x, BigInt(n));
        const c = F.mul(F.sub(tm, F.ONE), F.inv(BigInt(n)));
        const denom = _create(n);
        for (let i = 0; i < n; i++)
          denom[i] = F.sub(x, cache[i]);
        const inv = F.invertBatch(denom);
        for (let i = 0; i < n; i++)
          out[i] = F.mul(c, F.mul(cache[i], inv[i]));
        return out;
      },
      eval(a, x, brp = false) {
        checkLength(a);
        const idx = findOmegaIndex(x, a.length, brp);
        if (idx !== -1)
          return a[idx];
        const L = this.basis(x, a.length, brp);
        let acc = F.ZERO;
        for (let i = 0; i < a.length; i++)
          if (!F.is0(a[i]))
            acc = F.add(acc, F.mul(a[i], L[i]));
        return acc;
      }
    },
    vanishing(roots2) {
      checkLength(roots2);
      const out = _create(roots2.length + 1, F.ZERO);
      out[0] = F.ONE;
      for (const r of roots2) {
        const neg = F.neg(r);
        for (let j = out.length - 1; j > 0; j--)
          out[j] = F.add(F.mul(out[j], neg), out[j - 1]);
        out[0] = F.mul(out[0], neg);
      }
      return out;
    }
  };
}
var init_fft = __esm({
  "node_modules/@noble/curves/abstract/fft.js"() {
  }
});

// node_modules/@noble/curves/abstract/hash-to-curve.js
function i2osp(value, length) {
  asafenumber(value);
  asafenumber(length);
  if (length < 0 || length > 4)
    throw new Error("invalid I2OSP length: " + length);
  if (value < 0 || value > 2 ** (8 * length) - 1)
    throw new Error("invalid I2OSP input: " + value);
  const res = Array.from({ length }).fill(0);
  for (let i = length - 1; i >= 0; i--) {
    res[i] = value & 255;
    value >>>= 8;
  }
  return new Uint8Array(res);
}
function strxor(a, b) {
  const arr = new Uint8Array(a.length);
  for (let i = 0; i < a.length; i++) {
    arr[i] = a[i] ^ b[i];
  }
  return arr;
}
function normDST(DST) {
  if (!isBytes3(DST) && typeof DST !== "string")
    throw new Error("DST must be Uint8Array or ascii string");
  const dst = typeof DST === "string" ? asciiToBytes(DST) : DST;
  if (dst.length === 0)
    throw new Error("DST must be non-empty");
  return dst;
}
function expand_message_xmd(msg, DST, lenInBytes, H) {
  abytes3(msg);
  asafenumber(lenInBytes);
  DST = normDST(DST);
  if (DST.length > 255)
    DST = H(concatBytes3(asciiToBytes("H2C-OVERSIZE-DST-"), DST));
  const { outputLen: b_in_bytes, blockLen: r_in_bytes } = H;
  const ell = Math.ceil(lenInBytes / b_in_bytes);
  if (lenInBytes > 65535 || ell > 255)
    throw new Error("expand_message_xmd: invalid lenInBytes");
  const DST_prime = concatBytes3(DST, i2osp(DST.length, 1));
  const Z_pad = new Uint8Array(r_in_bytes);
  const l_i_b_str = i2osp(lenInBytes, 2);
  const b = new Array(ell);
  const b_0 = H(concatBytes3(Z_pad, msg, l_i_b_str, i2osp(0, 1), DST_prime));
  b[0] = H(concatBytes3(b_0, i2osp(1, 1), DST_prime));
  for (let i = 1; i < ell; i++) {
    const args = [strxor(b_0, b[i - 1]), i2osp(i + 1, 1), DST_prime];
    b[i] = H(concatBytes3(...args));
  }
  const pseudo_random_bytes = concatBytes3(...b);
  return pseudo_random_bytes.slice(0, lenInBytes);
}
function expand_message_xof(msg, DST, lenInBytes, k, H) {
  abytes3(msg);
  asafenumber(lenInBytes);
  DST = normDST(DST);
  if (DST.length > 255) {
    const dkLen = Math.ceil(2 * k / 8);
    DST = H.create({ dkLen }).update(asciiToBytes("H2C-OVERSIZE-DST-")).update(DST).digest();
  }
  if (lenInBytes > 65535 || DST.length > 255)
    throw new Error("expand_message_xof: invalid lenInBytes");
  return H.create({ dkLen: lenInBytes }).update(msg).update(i2osp(lenInBytes, 2)).update(DST).update(i2osp(DST.length, 1)).digest();
}
function hash_to_field(msg, count, options) {
  validateObject(options, {
    p: "bigint",
    m: "number",
    k: "number",
    hash: "function"
  });
  const { p, k, m, hash, expand, DST } = options;
  asafenumber(hash.outputLen, "valid hash");
  abytes3(msg);
  asafenumber(count);
  if (count < 1)
    throw new Error("hash_to_field: expected count >= 1");
  if (m < 1)
    throw new Error("hash_to_field: expected m >= 1");
  const log2p = p.toString(2).length;
  const L = Math.ceil((log2p + k) / 8);
  const len_in_bytes = count * m * L;
  let prb;
  if (expand === "xmd") {
    prb = expand_message_xmd(msg, DST, len_in_bytes, hash);
  } else if (expand === "xof") {
    prb = expand_message_xof(msg, DST, len_in_bytes, k, hash);
  } else if (expand === "_internal_pass") {
    prb = msg;
  } else {
    throw new Error('expand must be "xmd" or "xof"');
  }
  const u = new Array(count);
  for (let i = 0; i < count; i++) {
    const e = new Array(m);
    for (let j = 0; j < m; j++) {
      const elm_offset = L * (j + i * m);
      const tv = prb.subarray(elm_offset, elm_offset + L);
      e[j] = mod(os2ip(tv), p);
    }
    u[i] = e;
  }
  return u;
}
function createHasher2(Point, mapToCurve, defaults) {
  if (typeof mapToCurve !== "function")
    throw new Error("mapToCurve() must be defined");
  const snapshot = (src) => Object.freeze({
    ...src,
    DST: isBytes3(src.DST) ? copyBytes2(src.DST) : src.DST,
    ...src.encodeDST === void 0 ? {} : { encodeDST: isBytes3(src.encodeDST) ? copyBytes2(src.encodeDST) : src.encodeDST }
  });
  const safeDefaults = snapshot(defaults);
  function map(num) {
    return Point.fromAffine(mapToCurve(num));
  }
  function clear(initial) {
    const P = initial.clearCofactor();
    if (P.equals(Point.ZERO))
      return Point.ZERO;
    P.assertValidity();
    return P;
  }
  return Object.freeze({
    get defaults() {
      return snapshot(safeDefaults);
    },
    Point,
    hashToCurve(msg, options) {
      const opts = Object.assign({}, safeDefaults, options);
      const u = hash_to_field(msg, 2, opts);
      const u0 = map(u[0]);
      const u1 = map(u[1]);
      return clear(u0.add(u1));
    },
    encodeToCurve(msg, options) {
      const optsDst = safeDefaults.encodeDST ? { DST: safeDefaults.encodeDST } : {};
      const opts = Object.assign({}, safeDefaults, optsDst, options);
      const u = hash_to_field(msg, 1, opts);
      const u0 = map(u[0]);
      return clear(u0);
    },
    /** See {@link H2CHasher} */
    mapToCurve(scalars) {
      if (safeDefaults.m === 1) {
        if (typeof scalars !== "bigint")
          throw new Error("expected bigint (m=1)");
        return clear(map([scalars]));
      }
      if (!Array.isArray(scalars))
        throw new Error("expected array of bigints");
      for (const i of scalars)
        if (typeof i !== "bigint")
          throw new Error("expected array of bigints");
      return clear(map(scalars));
    },
    // hash_to_scalar can produce 0: https://www.rfc-editor.org/errata/eid8393
    // RFC 9380, draft-irtf-cfrg-bbs-signatures-08. Default scalar DST is the shared generic
    // `HashToScalar-` prefix above unless the caller overrides it per invocation.
    hashToScalar(msg, options) {
      const N = Point.Fn.ORDER;
      const opts = Object.assign({}, safeDefaults, { p: N, m: 1, DST: _DST_scalar }, options);
      return hash_to_field(msg, 1, opts)[0][0];
    }
  });
}
var os2ip, _DST_scalar;
var init_hash_to_curve = __esm({
  "node_modules/@noble/curves/abstract/hash-to-curve.js"() {
    init_utils3();
    init_modular();
    os2ip = bytesToNumberBE;
    _DST_scalar = "HashToScalar-";
  }
});

// node_modules/@noble/curves/abstract/frost.js
function createFROST(opts) {
  validateObject(opts, {
    name: "string",
    hash: "function"
  }, {
    hashToScalar: "function",
    validatePoint: "function",
    parsePublicKey: "function",
    adjustScalar: "function",
    adjustPoint: "function",
    challenge: "function",
    adjustNonces: "function",
    adjustSecret: "function",
    adjustPublic: "function",
    adjustGroupCommitmentShare: "function",
    adjustDKG: "function"
  });
  validatePointCons(opts.Point);
  const { Point } = opts;
  const Fn = opts.Fn === void 0 ? Point.Fn : opts.Fn;
  const hashBytes = opts.hash;
  const hashToScalar = opts.hashToScalar === void 0 ? (msg, opts2 = { DST: new Uint8Array() }) => {
    const t = hashBytes(concatBytes3(opts2.DST, msg));
    return Fn.create(Fn.isLE ? bytesToNumberLE(t) : bytesToNumberBE(t));
  } : opts.hashToScalar;
  const H1Prefix = utf8ToBytes(opts.H1 !== void 0 ? opts.H1 : opts.name + "rho");
  const H2Prefix = utf8ToBytes(opts.H2 !== void 0 ? opts.H2 : opts.name + "chal");
  const H3Prefix = utf8ToBytes(opts.H3 !== void 0 ? opts.H3 : opts.name + "nonce");
  const H4Prefix = utf8ToBytes(opts.H4 !== void 0 ? opts.H4 : opts.name + "msg");
  const H5Prefix = utf8ToBytes(opts.H5 !== void 0 ? opts.H5 : opts.name + "com");
  const HDKGPrefix = utf8ToBytes(opts.HDKG !== void 0 ? opts.HDKG : opts.name + "dkg");
  const HIDPrefix = utf8ToBytes(opts.HID !== void 0 ? opts.HID : opts.name + "id");
  const H1 = (msg) => hashToScalar(msg, { DST: H1Prefix });
  const H2 = (msg) => hashToScalar(msg, { DST: H2Prefix });
  const H3 = (msg) => hashToScalar(msg, { DST: H3Prefix });
  const H4 = (msg) => hashBytes(concatBytes3(H4Prefix, msg));
  const H5 = (msg) => hashBytes(concatBytes3(H5Prefix, msg));
  const HDKG = (msg) => hashToScalar(msg, { DST: HDKGPrefix });
  const HID = (msg) => hashToScalar(msg, { DST: HIDPrefix });
  const randomScalar = (rng = randomBytes2) => {
    const t = mapHashToField(rng(getMinHashLength(Fn.ORDER)), Fn.ORDER, Fn.isLE);
    return Fn.isLE ? bytesToNumberLE(t) : bytesToNumberBE(t);
  };
  const serializePoint = (p) => p.toBytes();
  const parsePoint = (bytes) => {
    const p = Point.fromBytes(bytes);
    if (opts.validatePoint)
      opts.validatePoint(p);
    return p;
  };
  const nonceCommitments = (identifier, nonces) => ({
    identifier,
    hiding: serializePoint(Point.BASE.multiply(Fn.fromBytes(nonces.hiding))),
    binding: serializePoint(Point.BASE.multiply(Fn.fromBytes(nonces.binding)))
  });
  const adjustPoint = opts.adjustPoint === void 0 ? (n) => n : opts.adjustPoint;
  const validateIdentifier = (n) => {
    if (!Fn.isValid(n) || Fn.is0(n))
      throw new Error("Invalid identifier " + n);
    return n;
  };
  const serializeIdentifier = (id) => bytesToHex2(Fn.toBytes(validateIdentifier(id)));
  const parseIdentifier = (id) => {
    const n = validateIdentifier(Fn.fromBytes(hexToBytes2(id)));
    if (serializeIdentifier(n) !== id)
      throw new Error("expected canonical identifier hex");
    return n;
  };
  const Signature = {
    // RFC 9591 Appendix A encodes signatures canonically as
    // SerializeElement(R) || SerializeScalar(z).
    encode: (R, z) => {
      let res = concatBytes3(serializePoint(R), Fn.toBytes(z));
      if (opts.adjustTx)
        res = opts.adjustTx.encode(res);
      return res;
    },
    decode: (sig) => {
      if (opts.adjustTx)
        sig = opts.adjustTx.decode(sig);
      const R = parsePoint(sig.subarray(0, -Fn.BYTES));
      const z = Fn.fromBytes(sig.subarray(-Fn.BYTES));
      return { R, z };
    }
  };
  const genPointScalarPair = (rng = randomBytes2) => {
    let n = randomScalar(rng);
    if (opts.adjustScalar)
      n = opts.adjustScalar(n);
    let p = Point.BASE.multiply(n);
    return { scalar: n, point: p };
  };
  const nrErr = "roots are unavailable in FROST polynomial mode";
  const noRoots = {
    info: { G: Fn.ZERO, oddFactor: Fn.ZERO, powerOfTwo: 0 },
    roots() {
      throw new Error(nrErr);
    },
    brp() {
      throw new Error(nrErr);
    },
    inverse() {
      throw new Error(nrErr);
    },
    omega() {
      throw new Error(nrErr);
    },
    clear() {
    }
  };
  const Poly = poly(Fn, noRoots);
  const msm = (points, scalars) => pippenger(Point, points, scalars);
  const polynomialEvaluate = (x, coeffs) => {
    if (!coeffs.length)
      throw new Error("empty coefficients");
    return Poly.monomial.eval(coeffs, x);
  };
  const deriveInterpolatingValue = (L, xi) => {
    const err = "invalid parameters";
    if (!L.some((x) => Fn.eql(x, xi)))
      throw new Error(err);
    const Lset = new Set(L);
    if (Lset.size !== L.length)
      throw new Error(err);
    if (!Lset.has(xi))
      throw new Error(err);
    let num = Fn.ONE;
    let den = Fn.ONE;
    for (const x of L) {
      if (Fn.eql(x, xi))
        continue;
      num = Fn.mul(num, x);
      den = Fn.mul(den, Fn.sub(x, xi));
    }
    return Fn.div(num, den);
  };
  const evalutateVSS = (identifier, commitment) => {
    const monomial = Poly.monomial.basis(identifier, commitment.length);
    return msm(commitment, monomial);
  };
  const generateSecretPolynomial = (signers, secret, coeffs, rng = randomBytes2) => {
    validateSigners(signers);
    const secretScalar = secret === void 0 ? randomScalar(rng) : Fn.fromBytes(secret);
    if (!coeffs) {
      coeffs = [];
      for (let i = 0; i < signers.min - 1; i++)
        coeffs.push(randomScalar(rng));
    }
    if (coeffs.length !== signers.min - 1)
      throw new Error("wrong coefficients length");
    const coefficients = [secretScalar, ...coeffs];
    const commitment = coefficients.map((i) => Point.BASE.multiply(i));
    return { coefficients, commitment, secret: secretScalar };
  };
  const ProofOfKnowledge = {
    challenge: (id, verKey, R) => HDKG(concatBytes3(Fn.toBytes(id), serializePoint(verKey), serializePoint(R))),
    compute(id, coefficents, commitments, rng = randomBytes2) {
      if (coefficents.length < 1)
        throw new Error("coefficients should have at least one element");
      const { point: R, scalar: k } = genPointScalarPair(rng);
      const verKey = commitments[0];
      const c = this.challenge(id, verKey, R);
      const mu = Fn.add(k, Fn.mul(coefficents[0], c));
      return Signature.encode(R, mu);
    },
    validate(id, commitment, proof) {
      if (commitment.length < 1)
        throw new Error("commitment should have at least one element");
      const { R, z } = Signature.decode(proof);
      const phi = parsePoint(commitment[0]);
      const c = this.challenge(id, phi, R);
      if (!R.equals(Point.BASE.multiply(z).subtract(phi.multiply(c))))
        throw new Error("invalid proof of knowledge");
    }
  };
  const Basic = {
    challenge: (R, PK, msg) => {
      if (opts.challenge)
        return opts.challenge(R, PK, msg);
      return H2(concatBytes3(serializePoint(R), serializePoint(PK), msg));
    },
    sign(msg, sk, rng = randomBytes2) {
      const { point: R, scalar: r } = genPointScalarPair(rng);
      const PK = Point.BASE.multiply(sk);
      const c = this.challenge(R, PK, msg);
      const z = Fn.add(r, Fn.mul(c, sk));
      return [R, z];
    },
    verify(msg, R, z, PK) {
      if (opts.adjustPoint)
        PK = opts.adjustPoint(PK);
      if (opts.adjustPoint)
        R = opts.adjustPoint(R);
      const c = this.challenge(R, PK, msg);
      const zB = Point.BASE.multiply(z);
      const cA = PK.multiply(c);
      let check = zB.subtract(cA).subtract(R);
      if (check.clearCofactor)
        check = check.clearCofactor();
      return Point.ZERO.equals(check);
    }
  };
  const validateSecretShare = (identifier, commitment, signingShare) => {
    if (!Point.BASE.multiply(signingShare).equals(evalutateVSS(identifier, commitment)))
      throw new Error("invalid secret share");
  };
  const Identifier = {
    fromNumber(n) {
      if (!Number.isSafeInteger(n))
        throw new Error("expected safe interger");
      return serializeIdentifier(BigInt(n));
    },
    // Not in spec, but in FROST implementation,
    // seems useful and nice, no need to sync identifiers (would require more interactions)
    derive(s) {
      if (typeof s !== "string")
        throw new Error("wrong identifier string: " + s);
      return serializeIdentifier(HID(utf8ToBytes(s)));
    }
  };
  const generateNonce = (secret, rng = randomBytes2) => H3(concatBytes3(rng(32), Fn.toBytes(secret)));
  const getGroupCommitment = (GPK, commitmentList, msg) => {
    const CL = commitmentList.map((i) => [
      i.identifier,
      parseIdentifier(i.identifier),
      parsePoint(i.hiding),
      parsePoint(i.binding)
    ]);
    CL.sort((a, b) => a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0);
    const Cbytes = [];
    for (const [_, id, hC, bC] of CL)
      Cbytes.push(Fn.toBytes(id), serializePoint(hC), serializePoint(bC));
    const encodedCommitmentHash = H5(concatBytes3(...Cbytes));
    const rhoPrefix = concatBytes3(serializePoint(GPK), H4(msg), encodedCommitmentHash);
    const bindingFactors = {};
    for (const [i, id] of CL) {
      bindingFactors[i] = H1(concatBytes3(rhoPrefix, Fn.toBytes(id)));
    }
    const points = [];
    const scalars = [];
    for (const [i, _, hC, bC] of CL) {
      if (Point.ZERO.equals(hC) || Point.ZERO.equals(bC))
        throw new Error("infinity commitment");
      points.push(hC, bC);
      scalars.push(Fn.ONE, bindingFactors[i]);
    }
    const groupCommitment = msm(points, scalars);
    const identifiers = CL.map((i) => i[1]);
    return { identifiers, groupCommitment, bindingFactors };
  };
  const prepareShare = (PK, commitmentList, msg, identifier) => {
    const GPK = adjustPoint(parsePoint(PK));
    const id = parseIdentifier(identifier);
    const { identifiers, groupCommitment, bindingFactors } = getGroupCommitment(GPK, commitmentList, msg);
    const bindingFactor = bindingFactors[identifier];
    const lambda = deriveInterpolatingValue(identifiers, id);
    const challenge = Basic.challenge(groupCommitment, GPK, msg);
    return { lambda, challenge, bindingFactor, groupCommitment };
  };
  Object.freeze(Identifier);
  const frost = {
    Identifier,
    // DKG is Distributed Key Generation, not Trusted Dealer Key Generation.
    DKG: Object.freeze({
      // NOTE: we allow to pass secret scalar from user side,
      // this way it can be derived, instead of random generation
      round1: (id, signers, secret, rng = randomBytes2) => {
        validateSigners(signers);
        const idNum = parseIdentifier(id);
        const { coefficients, commitment } = generateSecretPolynomial(signers, secret, void 0, rng);
        const proofOfKnowledge = ProofOfKnowledge.compute(idNum, coefficients, commitment, rng);
        const commitmentBytes = commitment.map(serializePoint);
        const round1Public = {
          identifier: serializeIdentifier(idNum),
          commitment: commitmentBytes,
          proofOfKnowledge
        };
        const round1Secret = {
          identifier: idNum,
          coefficients,
          commitment: commitment.map(serializePoint),
          // Copy threshold metadata instead of retaining the caller-owned object by reference.
          signers: { min: signers.min, max: signers.max },
          step: 1
        };
        return { public: round1Public, secret: round1Secret };
      },
      round2: (secret, others) => {
        if (others.length !== secret.signers.max - 1)
          throw new Error("wrong number of round1 packages");
        if (!secret.coefficients || secret.step === 3)
          throw new Error("round3 package used in round2");
        const res = {};
        for (const p of others) {
          if (p.commitment.length !== secret.signers.min)
            throw new Error("wrong number of commitments");
          const id = parseIdentifier(p.identifier);
          if (id === secret.identifier)
            throw new Error("duplicate id=" + serializeIdentifier(id));
          ProofOfKnowledge.validate(id, p.commitment, p.proofOfKnowledge);
          for (const c of p.commitment)
            parsePoint(c);
          if (res[p.identifier])
            throw new Error("Duplicate id=" + id);
          const signingShare = Fn.toBytes(polynomialEvaluate(id, secret.coefficients));
          res[p.identifier] = {
            identifier: serializeIdentifier(secret.identifier),
            signingShare
          };
        }
        secret.step = 2;
        return res;
      },
      round3: (secret, round1, round2) => {
        if (round1.length !== secret.signers.max - 1)
          throw new Error("wrong length of round1 packages");
        if (!secret.coefficients || secret.step !== 2)
          throw new Error("round2 package used in round3");
        if (round2.length !== round1.length)
          throw new Error("wrong length of round2 packages");
        const merged = {};
        for (const r1 of round1) {
          if (!r1.identifier || !r1.commitment)
            throw new Error("wrong round1 share");
          merged[r1.identifier] = { ...r1 };
        }
        for (const r2 of round2) {
          if (!r2.identifier || !r2.signingShare)
            throw new Error("wrong round2 share");
          if (!merged[r2.identifier])
            throw new Error("round1 share for " + r2.identifier + " is missing");
          merged[r2.identifier].signingShare = r2.signingShare;
        }
        if (Object.keys(merged).length !== round1.length)
          throw new Error("mismatch identifiers between rounds");
        let signingShare = Fn.ZERO;
        if (secret.commitment.length !== secret.signers.min)
          throw new Error("wrong commitments length");
        const localCommitment = secret.commitment.map(parsePoint);
        const localShare = polynomialEvaluate(secret.identifier, secret.coefficients);
        validateSecretShare(secret.identifier, localCommitment, localShare);
        const localCommitmentBytes = localCommitment.map(serializePoint);
        const commitments = {
          [serializeIdentifier(secret.identifier)]: localCommitmentBytes
        };
        for (const k in merged) {
          const v = merged[k];
          if (!v.signingShare || !v.commitment)
            throw new Error("mismatch identifiers");
          const id = parseIdentifier(k);
          const signingSharePart = Fn.fromBytes(v.signingShare);
          const commitment = v.commitment.map(parsePoint);
          validateSecretShare(secret.identifier, commitment, signingSharePart);
          signingShare = Fn.add(signingShare, signingSharePart);
          const idSer = serializeIdentifier(id);
          if (commitments[idSer])
            throw new Error("duplicated id=" + idSer);
          commitments[idSer] = v.commitment;
        }
        signingShare = Fn.add(signingShare, localShare);
        const mergedCommitment = new Array(secret.signers.min).fill(Point.ZERO);
        for (const k in commitments) {
          const v = commitments[k];
          if (v.length !== secret.signers.min)
            throw new Error("wrong commitments length");
          for (let i = 0; i < v.length; i++)
            mergedCommitment[i] = mergedCommitment[i].add(parsePoint(v[i]));
        }
        const mergedCommitmentBytes = mergedCommitment.map(serializePoint);
        const verifyingShares = {};
        for (const k in commitments)
          verifyingShares[k] = serializePoint(evalutateVSS(parseIdentifier(k), mergedCommitment));
        let res = {
          public: {
            signers: { min: secret.signers.min, max: secret.signers.max },
            commitments: mergedCommitmentBytes,
            verifyingShares: Object.fromEntries(Object.entries(verifyingShares).map(([k, v]) => [k, v.slice()]))
          },
          secret: {
            identifier: serializeIdentifier(secret.identifier),
            signingShare: Fn.toBytes(signingShare)
          }
        };
        if (opts.adjustDKG)
          res = opts.adjustDKG(res);
        for (let i = 0; i < secret.coefficients.length; i++)
          secret.coefficients[i] -= secret.coefficients[i];
        delete secret.coefficients;
        secret.step = 3;
        return res;
      },
      clean(secret) {
        secret.identifier -= secret.identifier;
        if (secret.coefficients) {
          for (let i = 0; i < secret.coefficients.length; i++)
            secret.coefficients[i] -= secret.coefficients[i];
        }
        secret.step = 3;
      }
    }),
    // Trusted dealer setup
    // Generates keys for all participants
    trustedDealer(signers, identifiers, secret, rng = randomBytes2) {
      validateSigners(signers);
      if (identifiers === void 0) {
        identifiers = [];
        for (let i = 1; i <= signers.max; i++)
          identifiers.push(Identifier.fromNumber(i));
      } else {
        if (!Array.isArray(identifiers) || identifiers.length !== signers.max)
          throw new Error("identifiers should be array of " + signers.max);
      }
      const identifierNums = {};
      for (const id of identifiers) {
        const idNum = parseIdentifier(id);
        if (id in identifierNums)
          throw new Error("duplicated id=" + id);
        identifierNums[id] = idNum;
      }
      const sp = generateSecretPolynomial(signers, secret, void 0, rng);
      const commitmentBytes = sp.commitment.map(serializePoint);
      const secretShares = {};
      const verifyingShares = {};
      for (const id of identifiers) {
        const signingShare = polynomialEvaluate(identifierNums[id], sp.coefficients);
        verifyingShares[id] = serializePoint(Point.BASE.multiply(signingShare));
        secretShares[id] = {
          identifier: id,
          signingShare: Fn.toBytes(signingShare)
        };
      }
      return {
        public: {
          signers: { min: signers.min, max: signers.max },
          commitments: commitmentBytes,
          verifyingShares
        },
        secretShares
      };
    },
    // Validate secret (from trusted dealer or DKG)
    validateSecret(secret, pub) {
      const id = parseIdentifier(secret.identifier);
      const commitment = pub.commitments.map(parsePoint);
      const signingShare = Fn.fromBytes(secret.signingShare);
      validateSecretShare(id, commitment, signingShare);
    },
    // Actual signing
    // Round 1: each participant commit to nonces
    // Nonces kept private, commitments sent to coordinator (or every other participant)
    // NOTE: we don't need the message at this point, which lets a coordinator
    // keep multiple nonce commitments per participant in advance and skip
    // round1 for signing.
    // But then each participant needs to remember generated shares
    commit(secret, rng = randomBytes2) {
      const secretScalar = Fn.fromBytes(secret.signingShare);
      const hiding = generateNonce(secretScalar, rng);
      const binding = generateNonce(secretScalar, rng);
      const nonces = { hiding: Fn.toBytes(hiding), binding: Fn.toBytes(binding) };
      return { nonces, commitments: nonceCommitments(secret.identifier, nonces) };
    },
    // Round2: sign. Each participant creates a signature share from the secret
    // and the selected nonce commitments.
    signShare(secret, pub, nonces, commitmentList, msg) {
      validateCommitmentsNum(pub.signers, commitmentList.length);
      const hidingNonce0 = Fn.fromBytes(nonces.hiding);
      const bindingNonce0 = Fn.fromBytes(nonces.binding);
      if (Fn.is0(hidingNonce0) || Fn.is0(bindingNonce0))
        throw new Error("signing nonces already used");
      const expectedCommitment = {
        identifier: secret.identifier,
        hiding: serializePoint(Point.BASE.multiply(hidingNonce0)),
        binding: serializePoint(Point.BASE.multiply(bindingNonce0))
      };
      const commitment = commitmentList.find((i) => i.identifier === secret.identifier);
      if (!commitment)
        throw new Error("missing signer commitment");
      if (bytesToHex2(commitment.hiding) !== bytesToHex2(expectedCommitment.hiding) || bytesToHex2(commitment.binding) !== bytesToHex2(expectedCommitment.binding))
        throw new Error("incorrect signer commitment");
      if (opts.adjustSecret)
        secret = opts.adjustSecret(secret, pub);
      if (opts.adjustPublic)
        pub = opts.adjustPublic(pub);
      const SK = Fn.fromBytes(secret.signingShare);
      const { lambda, challenge, bindingFactor, groupCommitment } = prepareShare(pub.commitments[0], commitmentList, msg, secret.identifier);
      const N = opts.adjustNonces ? opts.adjustNonces(groupCommitment, nonces) : nonces;
      const hidingNonce = opts.adjustNonces ? Fn.fromBytes(N.hiding) : hidingNonce0;
      const bindingNonce = opts.adjustNonces ? Fn.fromBytes(N.binding) : bindingNonce0;
      const t = Fn.mul(Fn.mul(lambda, SK), challenge);
      const t2 = Fn.mul(bindingNonce, bindingFactor);
      const r = Fn.toBytes(Fn.add(Fn.add(hidingNonce, t2), t));
      nonces.hiding.fill(0);
      nonces.binding.fill(0);
      return r;
    },
    // Each participant (or coordinator) can verify signatures from other participants
    verifyShare(pub, commitmentList, msg, identifier, sigShare) {
      if (opts.adjustPublic)
        pub = opts.adjustPublic(pub);
      const comm = commitmentList.find((i) => i.identifier === identifier);
      if (!comm)
        throw new Error("cannot find identifier commitment");
      const PK = parsePoint(pub.verifyingShares[identifier]);
      const hidingNonceCommitment = parsePoint(comm.hiding);
      const bindingNonceCommitment = parsePoint(comm.binding);
      const { lambda, challenge, bindingFactor, groupCommitment } = prepareShare(pub.commitments[0], commitmentList, msg, identifier);
      let commShare = hidingNonceCommitment.add(bindingNonceCommitment.multiply(bindingFactor));
      if (opts.adjustGroupCommitmentShare)
        commShare = opts.adjustGroupCommitmentShare(groupCommitment, commShare);
      const l = Point.BASE.multiply(Fn.fromBytes(sigShare));
      const r = commShare.add(PK.multiply(Fn.mul(challenge, lambda)));
      return l.equals(r);
    },
    // Aggregate multiple signature shares into groupSignature
    aggregate(pub, commitmentList, msg, sigShares) {
      if (opts.adjustPublic)
        pub = opts.adjustPublic(pub);
      try {
        validateCommitmentsNum(pub.signers, commitmentList.length);
      } catch {
        throw new AggErr("aggregation failed", []);
      }
      const ids = commitmentList.map((i) => i.identifier);
      if (ids.length !== Object.keys(sigShares).length)
        throw new AggErr("aggregation failed", []);
      for (const id of ids) {
        if (!(id in sigShares) || !(id in pub.verifyingShares))
          throw new AggErr("aggregation failed", []);
      }
      const GPK = parsePoint(pub.commitments[0]);
      const { groupCommitment } = getGroupCommitment(GPK, commitmentList, msg);
      let z = Fn.ZERO;
      for (const id of ids)
        z = Fn.add(z, Fn.fromBytes(sigShares[id]));
      if (!Basic.verify(msg, groupCommitment, z, GPK)) {
        const cheaters = [];
        for (const id of ids) {
          if (!this.verifyShare(pub, commitmentList, msg, id, sigShares[id]))
            cheaters.push(id);
        }
        throw new AggErr("aggregation failed", cheaters);
      }
      return Signature.encode(groupCommitment, z);
    },
    // Basic sign/verify using single key
    sign(msg, secretKey) {
      let sk = Fn.fromBytes(secretKey);
      if (opts.adjustScalar)
        sk = opts.adjustScalar(sk);
      const [R, z] = Basic.sign(msg, sk);
      return Signature.encode(R, z);
    },
    verify(sig, msg, publicKey) {
      const PK = opts.parsePublicKey ? opts.parsePublicKey(publicKey) : parsePoint(publicKey);
      const { R, z } = Signature.decode(sig);
      return Basic.verify(msg, R, z, PK);
    },
    // Combine multiple secret shares to restore secret
    combineSecret(shares, signers) {
      validateSigners(signers);
      if (!Array.isArray(shares) || shares.length < signers.min)
        throw new Error("wrong secret shares array");
      const points = [];
      const seen = {};
      for (const s of shares) {
        const idNum = parseIdentifier(s.identifier);
        const id = serializeIdentifier(idNum);
        if (seen[id])
          throw new Error("duplicated id=" + id);
        seen[id] = true;
        points.push([idNum, Fn.fromBytes(s.signingShare)]);
      }
      const xCoords = points.map(([x]) => x);
      let res = Fn.ZERO;
      for (const [x, y] of points)
        res = Fn.add(res, Fn.mul(y, deriveInterpolatingValue(xCoords, x)));
      return Fn.toBytes(res);
    },
    // Utils
    utils: Object.freeze({
      Fn,
      // NOTE: we re-export it here because it may be different from Point.Fn (ed448 is fun!)
      // Test RNG overrides still go through noble's non-zero scalar derivation; this is not a raw
      // "bytes become scalar" escape hatch.
      randomScalar: (rng = randomBytes2) => Fn.toBytes(genPointScalarPair(rng).scalar),
      generateSecretPolynomial: (signers, secret, coeffs, rng) => {
        const res = generateSecretPolynomial(signers, secret, coeffs, rng);
        return { ...res, commitment: res.commitment.map(serializePoint) };
      }
    })
  };
  return Object.freeze(frost);
}
var validateSigners, validateCommitmentsNum, AggErr;
var init_frost = __esm({
  "node_modules/@noble/curves/abstract/frost.js"() {
    init_utils2();
    init_utils3();
    init_curve();
    init_fft();
    init_modular();
    validateSigners = (signers) => {
      if (!Number.isSafeInteger(signers.min) || !Number.isSafeInteger(signers.max))
        throw new Error("Wrong signers info: min=" + signers.min + " max=" + signers.max);
      if (signers.min < 2 || signers.max < 2 || signers.min > signers.max)
        throw new Error("Wrong signers info: min=" + signers.min + " max=" + signers.max);
    };
    validateCommitmentsNum = (signers, len) => {
      if (len < signers.min || len > signers.max)
        throw new Error("Wrong number of commitments=" + len);
    };
    AggErr = class extends Error {
      constructor(msg, cheaters) {
        super(msg);
        // Empty means aggregation failed before per-share verification could attribute a signer.
        __publicField(this, "cheaters");
        this.cheaters = cheaters;
      }
    };
  }
});

// node_modules/@noble/curves/abstract/oprf.js
function createOPRF(opts) {
  validateObject(opts, {
    name: "string",
    hash: "function",
    hashToScalar: "function",
    hashToGroup: "function"
  });
  validatePointCons(opts.Point);
  const { name, Point, hash } = opts;
  const { Fn } = Point;
  const hashToGroup = (msg, ctx) => opts.hashToGroup(msg, {
    DST: concatBytes3(asciiToBytes("HashToGroup-"), ctx)
  });
  const hashToScalarPrefixed = (msg, ctx) => opts.hashToScalar(msg, { DST: concatBytes3(_DST_scalarBytes, ctx) });
  const randomScalar = (rng = randomBytes2) => {
    const t = mapHashToField(rng(getMinHashLength(Fn.ORDER)), Fn.ORDER, Fn.isLE);
    return Fn.isLE ? bytesToNumberLE(t) : bytesToNumberBE(t);
  };
  const msm = (points, scalars) => pippenger(Point, points, scalars);
  const getCtx = (mode) => concatBytes3(asciiToBytes("OPRFV1-"), new Uint8Array([mode]), asciiToBytes("-" + name));
  const ctxOPRF = getCtx(0);
  const ctxVOPRF = getCtx(1);
  const ctxPOPRF = getCtx(2);
  function encode(...args) {
    const res2 = [];
    for (const a of args) {
      if (typeof a === "number")
        res2.push(numberToBytesBE(a, 2));
      else if (typeof a === "string")
        res2.push(asciiToBytes(a));
      else {
        abytes3(a);
        res2.push(numberToBytesBE(a.length, 2), a);
      }
    }
    return concatBytes3(...res2);
  }
  const inputBytes = (title, bytes) => {
    abytes3(bytes, void 0, title);
    if (bytes.length > 65535)
      throw new Error(`"${title}" expected Uint8Array of length <= 65535, got length=${bytes.length}`);
    return bytes;
  };
  const hashInput = (...bytes) => hash(encode(...bytes, "Finalize"));
  function getTranscripts(B, C, D, ctx) {
    const Bm = B.toBytes();
    const seed = hash(encode(Bm, concatBytes3(asciiToBytes("Seed-"), ctx)));
    const res2 = [];
    for (let i = 0; i < C.length; i++) {
      const Ci = C[i].toBytes();
      const Di = D[i].toBytes();
      const di = hashToScalarPrefixed(encode(seed, i, Ci, Di, "Composite"), ctx);
      res2.push(di);
    }
    return res2;
  }
  function computeComposites(B, C, D, ctx) {
    const T = getTranscripts(B, C, D, ctx);
    const M = msm(C, T);
    const Z = msm(D, T);
    return { M, Z };
  }
  function computeCompositesFast(k, B, C, D, ctx) {
    const T = getTranscripts(B, C, D, ctx);
    const M = msm(C, T);
    const Z = M.multiply(k);
    return { M, Z };
  }
  function challengeTranscript(B, M, Z, t2, t3, ctx) {
    const [Bm, a0, a1, a2, a3] = [B, M, Z, t2, t3].map((i) => i.toBytes());
    return hashToScalarPrefixed(encode(Bm, a0, a1, a2, a3, "Challenge"), ctx);
  }
  function generateProof(ctx, k, B, C, D, rng) {
    const { M, Z } = computeCompositesFast(k, B, C, D, ctx);
    const r = randomScalar(rng);
    const t2 = Point.BASE.multiply(r);
    const t3 = M.multiply(r);
    const c = challengeTranscript(B, M, Z, t2, t3, ctx);
    const s = Fn.sub(r, Fn.mul(c, k));
    return concatBytes3(...[c, s].map((i) => Fn.toBytes(i)));
  }
  function verifyProof(ctx, B, C, D, proof) {
    abytes3(proof, 2 * Fn.BYTES);
    const { M, Z } = computeComposites(B, C, D, ctx);
    const [c, s] = [proof.subarray(0, Fn.BYTES), proof.subarray(Fn.BYTES)].map((f) => Fn.fromBytes(f));
    const t2 = Point.BASE.multiply(s).add(B.multiply(c));
    const t3 = M.multiply(s).add(Z.multiply(c));
    const expectedC = challengeTranscript(B, M, Z, t2, t3, ctx);
    if (!Fn.eql(c, expectedC))
      throw new Error("proof verification failed");
  }
  function generateKeyPair() {
    const skS = randomScalar();
    const pkS = Point.BASE.multiply(skS);
    return { secretKey: Fn.toBytes(skS), publicKey: pkS.toBytes() };
  }
  function deriveKeyPair(ctx, seed, info) {
    abytes3(seed, 32, "seed");
    info = inputBytes("keyInfo", info);
    const dst = concatBytes3(asciiToBytes("DeriveKeyPair"), ctx);
    const msg = concatBytes3(seed, encode(info), Uint8Array.of(0));
    for (let counter = 0; counter <= 255; counter++) {
      msg[msg.length - 1] = counter;
      const skS = opts.hashToScalar(msg, { DST: dst });
      if (Fn.is0(skS))
        continue;
      return {
        secretKey: Fn.toBytes(skS),
        publicKey: Point.BASE.multiply(skS).toBytes()
      };
    }
    throw new Error("Cannot derive key");
  }
  const wirePoint = (label, bytes) => {
    const point = Point.fromBytes(bytes);
    if (point.equals(Point.ZERO))
      throw new Error(label + " point at infinity");
    return point;
  };
  function blind(ctx, input, rng = randomBytes2) {
    input = inputBytes("input", input);
    const blind2 = randomScalar(rng);
    const inputPoint = hashToGroup(input, ctx);
    if (inputPoint.equals(Point.ZERO))
      throw new Error("Input point at infinity");
    const blinded = inputPoint.multiply(blind2);
    return { blind: Fn.toBytes(blind2), blinded: blinded.toBytes() };
  }
  function evaluate(ctx, secretKey, input) {
    input = inputBytes("input", input);
    const skS = Fn.fromBytes(secretKey);
    const inputPoint = hashToGroup(input, ctx);
    if (inputPoint.equals(Point.ZERO))
      throw new Error("Input point at infinity");
    const unblinded = inputPoint.multiply(skS).toBytes();
    return hashInput(input, unblinded);
  }
  const oprf = Object.freeze({
    generateKeyPair,
    deriveKeyPair: (seed, keyInfo) => deriveKeyPair(ctxOPRF, seed, keyInfo),
    blind: (input, rng = randomBytes2) => blind(ctxOPRF, input, rng),
    blindEvaluate(secretKey, blindedPoint) {
      const skS = Fn.fromBytes(secretKey);
      const elm = wirePoint("blinded", blindedPoint);
      return elm.multiply(skS).toBytes();
    },
    finalize(input, blindBytes, evaluatedBytes) {
      input = inputBytes("input", input);
      const blind2 = Fn.fromBytes(blindBytes);
      const evalPoint = wirePoint("evaluated", evaluatedBytes);
      const unblinded = evalPoint.multiply(Fn.inv(blind2)).toBytes();
      return hashInput(input, unblinded);
    },
    evaluate: (secretKey, input) => evaluate(ctxOPRF, secretKey, input)
  });
  const voprf = Object.freeze({
    generateKeyPair,
    deriveKeyPair: (seed, keyInfo) => deriveKeyPair(ctxVOPRF, seed, keyInfo),
    blind: (input, rng = randomBytes2) => blind(ctxVOPRF, input, rng),
    blindEvaluateBatch(secretKey, publicKey, blinded, rng = randomBytes2) {
      if (!Array.isArray(blinded))
        throw new Error("expected array");
      const skS = Fn.fromBytes(secretKey);
      const pkS = wirePoint("public key", publicKey);
      const blindedPoints = blinded.map((i) => wirePoint("blinded", i));
      const evaluated = blindedPoints.map((i) => i.multiply(skS));
      const proof = generateProof(ctxVOPRF, skS, pkS, blindedPoints, evaluated, rng);
      return { evaluated: evaluated.map((i) => i.toBytes()), proof };
    },
    blindEvaluate(secretKey, publicKey, blinded, rng = randomBytes2) {
      const res2 = this.blindEvaluateBatch(secretKey, publicKey, [blinded], rng);
      return { evaluated: res2.evaluated[0], proof: res2.proof };
    },
    finalizeBatch(items, publicKey, proof) {
      if (!Array.isArray(items))
        throw new Error("expected array");
      const pkS = wirePoint("public key", publicKey);
      const blindedPoints = items.map((i) => wirePoint("blinded", i.blinded));
      const evalPoints = items.map((i) => wirePoint("evaluated", i.evaluated));
      verifyProof(ctxVOPRF, pkS, blindedPoints, evalPoints, proof);
      return items.map((i) => oprf.finalize(i.input, i.blind, i.evaluated));
    },
    finalize(input, blind2, evaluated, blinded, publicKey, proof) {
      return this.finalizeBatch([{ input, blind: blind2, evaluated, blinded }], publicKey, proof)[0];
    },
    evaluate: (secretKey, input) => evaluate(ctxVOPRF, secretKey, input)
  });
  const poprf = (info) => {
    info = inputBytes("info", info);
    const m = hashToScalarPrefixed(encode("Info", info), ctxPOPRF);
    const T = Point.BASE.multiply(m);
    return Object.freeze({
      generateKeyPair,
      deriveKeyPair: (seed, keyInfo) => deriveKeyPair(ctxPOPRF, seed, keyInfo),
      blind(input, publicKey, rng = randomBytes2) {
        input = inputBytes("input", input);
        const pkS = wirePoint("public key", publicKey);
        const tweakedKey = T.add(pkS);
        if (tweakedKey.equals(Point.ZERO))
          throw new Error("tweakedKey point at infinity");
        const blind2 = randomScalar(rng);
        const inputPoint = hashToGroup(input, ctxPOPRF);
        if (inputPoint.equals(Point.ZERO))
          throw new Error("Input point at infinity");
        const blindedPoint = inputPoint.multiply(blind2);
        return {
          blind: Fn.toBytes(blind2),
          blinded: blindedPoint.toBytes(),
          tweakedKey: tweakedKey.toBytes()
        };
      },
      blindEvaluateBatch(secretKey, blinded, rng = randomBytes2) {
        if (!Array.isArray(blinded))
          throw new Error("expected array");
        const skS = Fn.fromBytes(secretKey);
        const t = Fn.add(skS, m);
        const invT = Fn.inv(t);
        const blindedPoints = blinded.map((i) => wirePoint("blinded", i));
        const evalPoints = blindedPoints.map((i) => i.multiply(invT));
        const tweakedKey = Point.BASE.multiply(t);
        const proof = generateProof(ctxPOPRF, t, tweakedKey, evalPoints, blindedPoints, rng);
        return { evaluated: evalPoints.map((i) => i.toBytes()), proof };
      },
      blindEvaluate(secretKey, blinded, rng = randomBytes2) {
        const res2 = this.blindEvaluateBatch(secretKey, [blinded], rng);
        return { evaluated: res2.evaluated[0], proof: res2.proof };
      },
      finalizeBatch(items, proof, tweakedKey) {
        if (!Array.isArray(items))
          throw new Error("expected array");
        const inputs = items.map((i) => inputBytes("input", i.input));
        const evalPoints = items.map((i) => wirePoint("evaluated", i.evaluated));
        verifyProof(ctxPOPRF, wirePoint("tweakedKey", tweakedKey), evalPoints, items.map((i) => wirePoint("blinded", i.blinded)), proof);
        return items.map((i, j) => {
          const blind2 = Fn.fromBytes(i.blind);
          const point = evalPoints[j].multiply(Fn.inv(blind2)).toBytes();
          return hashInput(inputs[j], info, point);
        });
      },
      finalize(input, blind2, evaluated, blinded, proof, tweakedKey) {
        return this.finalizeBatch([{ input, blind: blind2, evaluated, blinded }], proof, tweakedKey)[0];
      },
      evaluate(secretKey, input) {
        input = inputBytes("input", input);
        const skS = Fn.fromBytes(secretKey);
        const inputPoint = hashToGroup(input, ctxPOPRF);
        if (inputPoint.equals(Point.ZERO))
          throw new Error("Input point at infinity");
        const t = Fn.add(skS, m);
        const invT = Fn.inv(t);
        const unblinded = inputPoint.multiply(invT).toBytes();
        return hashInput(input, info, unblinded);
      }
    });
  };
  const res = { name, oprf, voprf, poprf, __tests: Object.freeze({ Fn }) };
  return Object.freeze(res);
}
var _DST_scalarBytes;
var init_oprf = __esm({
  "node_modules/@noble/curves/abstract/oprf.js"() {
    init_utils3();
    init_curve();
    init_hash_to_curve();
    init_modular();
    _DST_scalarBytes = /* @__PURE__ */ asciiToBytes(_DST_scalar);
  }
});

// node_modules/@noble/hashes/hmac.js
var _HMAC, hmac;
var init_hmac = __esm({
  "node_modules/@noble/hashes/hmac.js"() {
    init_utils2();
    _HMAC = class {
      constructor(hash, key) {
        __publicField(this, "oHash");
        __publicField(this, "iHash");
        __publicField(this, "blockLen");
        __publicField(this, "outputLen");
        __publicField(this, "canXOF", false);
        __publicField(this, "finished", false);
        __publicField(this, "destroyed", false);
        ahash(hash);
        abytes2(key, void 0, "key");
        this.iHash = hash.create();
        if (typeof this.iHash.update !== "function")
          throw new Error("Expected instance of class which extends utils.Hash");
        this.blockLen = this.iHash.blockLen;
        this.outputLen = this.iHash.outputLen;
        const blockLen = this.blockLen;
        const pad = new Uint8Array(blockLen);
        pad.set(key.length > blockLen ? hash.create().update(key).digest() : key);
        for (let i = 0; i < pad.length; i++)
          pad[i] ^= 54;
        this.iHash.update(pad);
        this.oHash = hash.create();
        for (let i = 0; i < pad.length; i++)
          pad[i] ^= 54 ^ 92;
        this.oHash.update(pad);
        clean2(pad);
      }
      update(buf) {
        aexists2(this);
        this.iHash.update(buf);
        return this;
      }
      digestInto(out) {
        aexists2(this);
        aoutput2(out, this);
        this.finished = true;
        const buf = out.subarray(0, this.outputLen);
        this.iHash.digestInto(buf);
        this.oHash.update(buf);
        this.oHash.digestInto(buf);
        this.destroy();
      }
      digest() {
        const out = new Uint8Array(this.oHash.outputLen);
        this.digestInto(out);
        return out;
      }
      _cloneInto(to) {
        to || (to = Object.create(Object.getPrototypeOf(this), {}));
        const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
        to = to;
        to.finished = finished;
        to.destroyed = destroyed;
        to.blockLen = blockLen;
        to.outputLen = outputLen;
        to.oHash = oHash._cloneInto(to.oHash);
        to.iHash = iHash._cloneInto(to.iHash);
        return to;
      }
      clone() {
        return this._cloneInto();
      }
      destroy() {
        this.destroyed = true;
        this.oHash.destroy();
        this.iHash.destroy();
      }
    };
    hmac = /* @__PURE__ */ (() => {
      const hmac_ = (hash, key, message) => new _HMAC(hash, key).update(message).digest();
      hmac_.create = (hash, key) => new _HMAC(hash, key);
      return hmac_;
    })();
  }
});

// node_modules/@noble/curves/abstract/weierstrass.js
function _splitEndoScalar(k, basis, n) {
  aInRange("scalar", k, _0n4, n);
  const [[a1, b1], [a2, b2]] = basis;
  const c1 = divNearest(b2 * k, n);
  const c2 = divNearest(-b1 * k, n);
  let k1 = k - c1 * a1 - c2 * a2;
  let k2 = -c1 * b1 - c2 * b2;
  const k1neg = k1 < _0n4;
  const k2neg = k2 < _0n4;
  if (k1neg)
    k1 = -k1;
  if (k2neg)
    k2 = -k2;
  const MAX_NUM = bitMask(Math.ceil(bitLen(n) / 2)) + _1n4;
  if (k1 < _0n4 || k1 >= MAX_NUM || k2 < _0n4 || k2 >= MAX_NUM) {
    throw new Error("splitScalar (endomorphism): failed for k");
  }
  return { k1neg, k1, k2neg, k2 };
}
function validateSigFormat(format) {
  if (!["compact", "recovered", "der"].includes(format))
    throw new Error('Signature format must be "compact", "recovered", or "der"');
  return format;
}
function validateSigOpts(opts, def) {
  validateObject(opts);
  const optsn = {};
  for (let optName of Object.keys(def)) {
    optsn[optName] = opts[optName] === void 0 ? def[optName] : opts[optName];
  }
  abool2(optsn.lowS, "lowS");
  abool2(optsn.prehash, "prehash");
  if (optsn.format !== void 0)
    validateSigFormat(optsn.format);
  return optsn;
}
function weierstrass(params, extraOpts = {}) {
  const validated = createCurveFields("weierstrass", params, extraOpts);
  const Fp = validated.Fp;
  const Fn = validated.Fn;
  let CURVE = validated.CURVE;
  const { h: cofactor, n: CURVE_ORDER } = CURVE;
  validateObject(extraOpts, {}, {
    allowInfinityPoint: "boolean",
    clearCofactor: "function",
    isTorsionFree: "function",
    fromBytes: "function",
    toBytes: "function",
    endo: "object"
  });
  const { endo, allowInfinityPoint } = extraOpts;
  if (endo) {
    if (!Fp.is0(CURVE.a) || typeof endo.beta !== "bigint" || !Array.isArray(endo.basises)) {
      throw new Error('invalid endo: expected "beta": bigint and "basises": array');
    }
  }
  const lengths = getWLengths(Fp, Fn);
  function assertCompressionIsSupported() {
    if (!Fp.isOdd)
      throw new Error("compression is not supported: Field does not have .isOdd()");
  }
  function pointToBytes(_c, point, isCompressed) {
    if (allowInfinityPoint && point.is0())
      return Uint8Array.of(0);
    const { x, y } = point.toAffine();
    const bx = Fp.toBytes(x);
    abool2(isCompressed, "isCompressed");
    if (isCompressed) {
      assertCompressionIsSupported();
      const hasEvenY = !Fp.isOdd(y);
      return concatBytes3(pprefix(hasEvenY), bx);
    } else {
      return concatBytes3(Uint8Array.of(4), bx, Fp.toBytes(y));
    }
  }
  function pointFromBytes(bytes) {
    abytes3(bytes, void 0, "Point");
    const { publicKey: comp, publicKeyUncompressed: uncomp } = lengths;
    const length = bytes.length;
    const head = bytes[0];
    const tail = bytes.subarray(1);
    if (allowInfinityPoint && length === 1 && head === 0)
      return { x: Fp.ZERO, y: Fp.ZERO };
    if (length === comp && (head === 2 || head === 3)) {
      const x = Fp.fromBytes(tail);
      if (!Fp.isValid(x))
        throw new Error("bad point: is not on curve, wrong x");
      const y2 = weierstrassEquation(x);
      let y;
      try {
        y = Fp.sqrt(y2);
      } catch (sqrtError) {
        const err = sqrtError instanceof Error ? ": " + sqrtError.message : "";
        throw new Error("bad point: is not on curve, sqrt error" + err);
      }
      assertCompressionIsSupported();
      const evenY = Fp.isOdd(y);
      const evenH = (head & 1) === 1;
      if (evenH !== evenY)
        y = Fp.neg(y);
      return { x, y };
    } else if (length === uncomp && head === 4) {
      const L = Fp.BYTES;
      const x = Fp.fromBytes(tail.subarray(0, L));
      const y = Fp.fromBytes(tail.subarray(L, L * 2));
      if (!isValidXY(x, y))
        throw new Error("bad point: is not on curve");
      return { x, y };
    } else {
      throw new Error(`bad point: got length ${length}, expected compressed=${comp} or uncompressed=${uncomp}`);
    }
  }
  const encodePoint = extraOpts.toBytes === void 0 ? pointToBytes : extraOpts.toBytes;
  const decodePoint = extraOpts.fromBytes === void 0 ? pointFromBytes : extraOpts.fromBytes;
  function weierstrassEquation(x) {
    const x2 = Fp.sqr(x);
    const x3 = Fp.mul(x2, x);
    return Fp.add(Fp.add(x3, Fp.mul(x, CURVE.a)), CURVE.b);
  }
  function isValidXY(x, y) {
    const left = Fp.sqr(y);
    const right = weierstrassEquation(x);
    return Fp.eql(left, right);
  }
  if (!isValidXY(CURVE.Gx, CURVE.Gy))
    throw new Error("bad curve params: generator point");
  const _4a3 = Fp.mul(Fp.pow(CURVE.a, _3n2), _4n2);
  const _27b2 = Fp.mul(Fp.sqr(CURVE.b), BigInt(27));
  if (Fp.is0(Fp.add(_4a3, _27b2)))
    throw new Error("bad curve params: a or b");
  function acoord(title, n, banZero = false) {
    if (!Fp.isValid(n) || banZero && Fp.is0(n))
      throw new Error(`bad point coordinate ${title}`);
    return n;
  }
  function aprjpoint(other) {
    if (!(other instanceof Point))
      throw new Error("Weierstrass Point expected");
  }
  function splitEndoScalarN(k) {
    if (!endo || !endo.basises)
      throw new Error("no endo");
    return _splitEndoScalar(k, endo.basises, Fn.ORDER);
  }
  function finishEndo(endoBeta, k1p, k2p, k1neg, k2neg) {
    k2p = new Point(Fp.mul(k2p.X, endoBeta), k2p.Y, k2p.Z);
    k1p = negateCt(k1neg, k1p);
    k2p = negateCt(k2neg, k2p);
    return k1p.add(k2p);
  }
  const _Point = class _Point {
    /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
    constructor(X, Y, Z) {
      __publicField(this, "X");
      __publicField(this, "Y");
      __publicField(this, "Z");
      this.X = acoord("x", X);
      this.Y = acoord("y", Y, true);
      this.Z = acoord("z", Z);
      Object.freeze(this);
    }
    static CURVE() {
      return CURVE;
    }
    /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
    static fromAffine(p) {
      const { x, y } = p || {};
      if (!p || !Fp.isValid(x) || !Fp.isValid(y))
        throw new Error("invalid affine point");
      if (p instanceof _Point)
        throw new Error("projective point not allowed");
      if (Fp.is0(x) && Fp.is0(y))
        return _Point.ZERO;
      return new _Point(x, y, Fp.ONE);
    }
    static fromBytes(bytes) {
      const P = _Point.fromAffine(decodePoint(abytes3(bytes, void 0, "point")));
      P.assertValidity();
      return P;
    }
    static fromHex(hex) {
      return _Point.fromBytes(hexToBytes2(hex));
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    /**
     *
     * @param windowSize
     * @param isLazy - true will defer table computation until the first multiplication
     * @returns
     */
    precompute(windowSize = 8, isLazy = true) {
      wnaf.createCache(this, windowSize);
      if (!isLazy)
        this.multiply(_3n2);
      return this;
    }
    // TODO: return `this`
    /** A point on curve is valid if it conforms to equation. */
    assertValidity() {
      const p = this;
      if (p.is0()) {
        if (extraOpts.allowInfinityPoint && Fp.is0(p.X) && Fp.eql(p.Y, Fp.ONE) && Fp.is0(p.Z))
          return;
        throw new Error("bad point: ZERO");
      }
      const { x, y } = p.toAffine();
      if (!Fp.isValid(x) || !Fp.isValid(y))
        throw new Error("bad point: x or y not field elements");
      if (!isValidXY(x, y))
        throw new Error("bad point: equation left != right");
      if (!p.isTorsionFree())
        throw new Error("bad point: not in prime-order subgroup");
    }
    hasEvenY() {
      const { y } = this.toAffine();
      if (!Fp.isOdd)
        throw new Error("Field doesn't support isOdd");
      return !Fp.isOdd(y);
    }
    /** Compare one point to another. */
    equals(other) {
      aprjpoint(other);
      const { X: X1, Y: Y1, Z: Z1 } = this;
      const { X: X2, Y: Y2, Z: Z2 } = other;
      const U1 = Fp.eql(Fp.mul(X1, Z2), Fp.mul(X2, Z1));
      const U2 = Fp.eql(Fp.mul(Y1, Z2), Fp.mul(Y2, Z1));
      return U1 && U2;
    }
    /** Flips point to one corresponding to (x, -y) in Affine coordinates. */
    negate() {
      return new _Point(this.X, Fp.neg(this.Y), this.Z);
    }
    // Renes-Costello-Batina exception-free doubling formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 3
    // Cost: 8M + 3S + 3*a + 2*b3 + 15add.
    double() {
      const { a, b } = CURVE;
      const b3 = Fp.mul(b, _3n2);
      const { X: X1, Y: Y1, Z: Z1 } = this;
      let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
      let t0 = Fp.mul(X1, X1);
      let t1 = Fp.mul(Y1, Y1);
      let t2 = Fp.mul(Z1, Z1);
      let t3 = Fp.mul(X1, Y1);
      t3 = Fp.add(t3, t3);
      Z3 = Fp.mul(X1, Z1);
      Z3 = Fp.add(Z3, Z3);
      X3 = Fp.mul(a, Z3);
      Y3 = Fp.mul(b3, t2);
      Y3 = Fp.add(X3, Y3);
      X3 = Fp.sub(t1, Y3);
      Y3 = Fp.add(t1, Y3);
      Y3 = Fp.mul(X3, Y3);
      X3 = Fp.mul(t3, X3);
      Z3 = Fp.mul(b3, Z3);
      t2 = Fp.mul(a, t2);
      t3 = Fp.sub(t0, t2);
      t3 = Fp.mul(a, t3);
      t3 = Fp.add(t3, Z3);
      Z3 = Fp.add(t0, t0);
      t0 = Fp.add(Z3, t0);
      t0 = Fp.add(t0, t2);
      t0 = Fp.mul(t0, t3);
      Y3 = Fp.add(Y3, t0);
      t2 = Fp.mul(Y1, Z1);
      t2 = Fp.add(t2, t2);
      t0 = Fp.mul(t2, t3);
      X3 = Fp.sub(X3, t0);
      Z3 = Fp.mul(t2, t1);
      Z3 = Fp.add(Z3, Z3);
      Z3 = Fp.add(Z3, Z3);
      return new _Point(X3, Y3, Z3);
    }
    // Renes-Costello-Batina exception-free addition formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 1
    // Cost: 12M + 0S + 3*a + 3*b3 + 23add.
    add(other) {
      aprjpoint(other);
      const { X: X1, Y: Y1, Z: Z1 } = this;
      const { X: X2, Y: Y2, Z: Z2 } = other;
      let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
      const a = CURVE.a;
      const b3 = Fp.mul(CURVE.b, _3n2);
      let t0 = Fp.mul(X1, X2);
      let t1 = Fp.mul(Y1, Y2);
      let t2 = Fp.mul(Z1, Z2);
      let t3 = Fp.add(X1, Y1);
      let t4 = Fp.add(X2, Y2);
      t3 = Fp.mul(t3, t4);
      t4 = Fp.add(t0, t1);
      t3 = Fp.sub(t3, t4);
      t4 = Fp.add(X1, Z1);
      let t5 = Fp.add(X2, Z2);
      t4 = Fp.mul(t4, t5);
      t5 = Fp.add(t0, t2);
      t4 = Fp.sub(t4, t5);
      t5 = Fp.add(Y1, Z1);
      X3 = Fp.add(Y2, Z2);
      t5 = Fp.mul(t5, X3);
      X3 = Fp.add(t1, t2);
      t5 = Fp.sub(t5, X3);
      Z3 = Fp.mul(a, t4);
      X3 = Fp.mul(b3, t2);
      Z3 = Fp.add(X3, Z3);
      X3 = Fp.sub(t1, Z3);
      Z3 = Fp.add(t1, Z3);
      Y3 = Fp.mul(X3, Z3);
      t1 = Fp.add(t0, t0);
      t1 = Fp.add(t1, t0);
      t2 = Fp.mul(a, t2);
      t4 = Fp.mul(b3, t4);
      t1 = Fp.add(t1, t2);
      t2 = Fp.sub(t0, t2);
      t2 = Fp.mul(a, t2);
      t4 = Fp.add(t4, t2);
      t0 = Fp.mul(t1, t4);
      Y3 = Fp.add(Y3, t0);
      t0 = Fp.mul(t5, t4);
      X3 = Fp.mul(t3, X3);
      X3 = Fp.sub(X3, t0);
      t0 = Fp.mul(t3, t1);
      Z3 = Fp.mul(t5, Z3);
      Z3 = Fp.add(Z3, t0);
      return new _Point(X3, Y3, Z3);
    }
    subtract(other) {
      aprjpoint(other);
      return this.add(other.negate());
    }
    is0() {
      return this.equals(_Point.ZERO);
    }
    /**
     * Constant time multiplication.
     * Uses wNAF method. Windowed method may be 10% faster,
     * but takes 2x longer to generate and consumes 2x memory.
     * Uses precomputes when available.
     * Uses endomorphism for Koblitz curves.
     * @param scalar - by which the point would be multiplied
     * @returns New point
     */
    multiply(scalar) {
      const { endo: endo2 } = extraOpts;
      if (!Fn.isValidNot0(scalar))
        throw new RangeError("invalid scalar: out of range");
      let point, fake;
      const mul3 = (n) => wnaf.cached(this, n, (p) => normalizeZ(_Point, p));
      if (endo2) {
        const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(scalar);
        const { p: k1p, f: k1f } = mul3(k1);
        const { p: k2p, f: k2f } = mul3(k2);
        fake = k1f.add(k2f);
        point = finishEndo(endo2.beta, k1p, k2p, k1neg, k2neg);
      } else {
        const { p, f } = mul3(scalar);
        point = p;
        fake = f;
      }
      return normalizeZ(_Point, [point, fake])[0];
    }
    /**
     * Non-constant-time multiplication. Uses double-and-add algorithm.
     * It's faster, but should only be used when you don't care about
     * an exposed secret key e.g. sig verification, which works over *public* keys.
     */
    multiplyUnsafe(scalar) {
      const { endo: endo2 } = extraOpts;
      const p = this;
      const sc = scalar;
      if (!Fn.isValid(sc))
        throw new RangeError("invalid scalar: out of range");
      if (sc === _0n4 || p.is0())
        return _Point.ZERO;
      if (sc === _1n4)
        return p;
      if (wnaf.hasCache(this))
        return this.multiply(sc);
      if (endo2) {
        const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(sc);
        const { p1, p2 } = mulEndoUnsafe(_Point, p, k1, k2);
        return finishEndo(endo2.beta, p1, p2, k1neg, k2neg);
      } else {
        return wnaf.unsafe(p, sc);
      }
    }
    /**
     * Converts Projective point to affine (x, y) coordinates.
     * (X, Y, Z) âˆ‹ (x=X/Z, y=Y/Z).
     * @param invertedZ - Z^-1 (inverted zero) - optional, precomputation is useful for invertBatch
     */
    toAffine(invertedZ) {
      const p = this;
      let iz = invertedZ;
      const { X, Y, Z } = p;
      if (Fp.eql(Z, Fp.ONE))
        return { x: X, y: Y };
      const is0 = p.is0();
      if (iz == null)
        iz = is0 ? Fp.ONE : Fp.inv(Z);
      const x = Fp.mul(X, iz);
      const y = Fp.mul(Y, iz);
      const zz = Fp.mul(Z, iz);
      if (is0)
        return { x: Fp.ZERO, y: Fp.ZERO };
      if (!Fp.eql(zz, Fp.ONE))
        throw new Error("invZ was invalid");
      return { x, y };
    }
    /**
     * Checks whether Point is free of torsion elements (is in prime subgroup).
     * Always torsion-free for cofactor=1 curves.
     */
    isTorsionFree() {
      const { isTorsionFree } = extraOpts;
      if (cofactor === _1n4)
        return true;
      if (isTorsionFree)
        return isTorsionFree(_Point, this);
      return wnaf.unsafe(this, CURVE_ORDER).is0();
    }
    clearCofactor() {
      const { clearCofactor } = extraOpts;
      if (cofactor === _1n4)
        return this;
      if (clearCofactor)
        return clearCofactor(_Point, this);
      return this.multiplyUnsafe(cofactor);
    }
    isSmallOrder() {
      if (cofactor === _1n4)
        return this.is0();
      return this.clearCofactor().is0();
    }
    toBytes(isCompressed = true) {
      abool2(isCompressed, "isCompressed");
      this.assertValidity();
      return encodePoint(_Point, this, isCompressed);
    }
    toHex(isCompressed = true) {
      return bytesToHex2(this.toBytes(isCompressed));
    }
    toString() {
      return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
    }
  };
  // base / generator point
  __publicField(_Point, "BASE", new _Point(CURVE.Gx, CURVE.Gy, Fp.ONE));
  // zero / infinity / identity point
  __publicField(_Point, "ZERO", new _Point(Fp.ZERO, Fp.ONE, Fp.ZERO));
  // 0, 1, 0
  // math field
  __publicField(_Point, "Fp", Fp);
  // scalar field
  __publicField(_Point, "Fn", Fn);
  let Point = _Point;
  const bits = Fn.BITS;
  const wnaf = new wNAF(Point, extraOpts.endo ? Math.ceil(bits / 2) : bits);
  if (bits >= 8)
    Point.BASE.precompute(8);
  Object.freeze(Point.prototype);
  Object.freeze(Point);
  return Point;
}
function pprefix(hasEvenY) {
  return Uint8Array.of(hasEvenY ? 2 : 3);
}
function SWUFpSqrtRatio(Fp, Z) {
  const F = validateField(Fp);
  const q = F.ORDER;
  let l = _0n4;
  for (let o = q - _1n4; o % _2n2 === _0n4; o /= _2n2)
    l += _1n4;
  const c1 = l;
  const _2n_pow_c1_1 = _2n2 << c1 - _1n4 - _1n4;
  const _2n_pow_c1 = _2n_pow_c1_1 * _2n2;
  const c2 = (q - _1n4) / _2n_pow_c1;
  const c3 = (c2 - _1n4) / _2n2;
  const c4 = _2n_pow_c1 - _1n4;
  const c5 = _2n_pow_c1_1;
  const c6 = F.pow(Z, c2);
  const c7 = F.pow(Z, (c2 + _1n4) / _2n2);
  let sqrtRatio = (u, v) => {
    let tv1 = c6;
    let tv2 = F.pow(v, c4);
    let tv3 = F.sqr(tv2);
    tv3 = F.mul(tv3, v);
    let tv5 = F.mul(u, tv3);
    tv5 = F.pow(tv5, c3);
    tv5 = F.mul(tv5, tv2);
    tv2 = F.mul(tv5, v);
    tv3 = F.mul(tv5, u);
    let tv4 = F.mul(tv3, tv2);
    tv5 = F.pow(tv4, c5);
    let isQR = F.eql(tv5, F.ONE);
    tv2 = F.mul(tv3, c7);
    tv5 = F.mul(tv4, tv1);
    tv3 = F.cmov(tv2, tv3, isQR);
    tv4 = F.cmov(tv5, tv4, isQR);
    for (let i = c1; i > _1n4; i--) {
      let tv52 = i - _2n2;
      tv52 = _2n2 << tv52 - _1n4;
      let tvv5 = F.pow(tv4, tv52);
      const e1 = F.eql(tvv5, F.ONE);
      tv2 = F.mul(tv3, tv1);
      tv1 = F.mul(tv1, tv1);
      tvv5 = F.mul(tv4, tv1);
      tv3 = F.cmov(tv2, tv3, e1);
      tv4 = F.cmov(tvv5, tv4, e1);
    }
    return { isValid: !F.is0(v) && (isQR || F.is0(u)), value: tv3 };
  };
  if (F.ORDER % _4n2 === _3n2) {
    const c12 = (F.ORDER - _3n2) / _4n2;
    const c22 = F.sqrt(F.neg(Z));
    sqrtRatio = (u, v) => {
      let tv1 = F.sqr(v);
      const tv2 = F.mul(u, v);
      tv1 = F.mul(tv1, tv2);
      let y1 = F.pow(tv1, c12);
      y1 = F.mul(y1, tv2);
      const y2 = F.mul(y1, c22);
      const tv3 = F.mul(F.sqr(y1), v);
      const isQR = F.eql(tv3, u);
      let y = F.cmov(y2, y1, isQR);
      return { isValid: !F.is0(v) && isQR, value: y };
    };
  }
  return sqrtRatio;
}
function mapToCurveSimpleSWU(Fp, opts) {
  const F = validateField(Fp);
  const { A, B, Z } = opts;
  if (!F.isValidNot0(A) || !F.isValidNot0(B) || !F.isValid(Z))
    throw new Error("mapToCurveSimpleSWU: invalid opts");
  if (F.eql(Z, F.neg(F.ONE)) || FpIsSquare(F, Z))
    throw new Error("mapToCurveSimpleSWU: invalid opts");
  const x = F.mul(B, F.inv(F.mul(Z, A)));
  const gx = F.add(F.add(F.mul(F.sqr(x), x), F.mul(A, x)), B);
  if (!FpIsSquare(F, gx))
    throw new Error("mapToCurveSimpleSWU: invalid opts");
  const sqrtRatio = SWUFpSqrtRatio(F, Z);
  if (!F.isOdd)
    throw new Error("Field does not have .isOdd()");
  return (u) => {
    let tv1, tv2, tv3, tv4, tv5, tv6, x2, y;
    tv1 = F.sqr(u);
    tv1 = F.mul(tv1, Z);
    tv2 = F.sqr(tv1);
    tv2 = F.add(tv2, tv1);
    tv3 = F.add(tv2, F.ONE);
    tv3 = F.mul(tv3, B);
    tv4 = F.cmov(Z, F.neg(tv2), !F.eql(tv2, F.ZERO));
    tv4 = F.mul(tv4, A);
    tv2 = F.sqr(tv3);
    tv6 = F.sqr(tv4);
    tv5 = F.mul(tv6, A);
    tv2 = F.add(tv2, tv5);
    tv2 = F.mul(tv2, tv3);
    tv6 = F.mul(tv6, tv4);
    tv5 = F.mul(tv6, B);
    tv2 = F.add(tv2, tv5);
    x2 = F.mul(tv1, tv3);
    const { isValid, value } = sqrtRatio(tv2, tv6);
    y = F.mul(tv1, u);
    y = F.mul(y, value);
    x2 = F.cmov(x2, tv3, isValid);
    y = F.cmov(y, value, isValid);
    const e1 = F.isOdd(u) === F.isOdd(y);
    y = F.cmov(F.neg(y), y, e1);
    const tv4_inv = FpInvertBatch(F, [tv4], true)[0];
    x2 = F.mul(x2, tv4_inv);
    return { x: x2, y };
  };
}
function getWLengths(Fp, Fn) {
  return {
    secretKey: Fn.BYTES,
    publicKey: 1 + Fp.BYTES,
    publicKeyUncompressed: 1 + 2 * Fp.BYTES,
    publicKeyHasPrefix: true,
    // Raw compact `(r || s)` signature width; DER and recovered signatures use
    // different lengths outside this helper.
    signature: 2 * Fn.BYTES
  };
}
function ecdh(Point, ecdhOpts = {}) {
  const { Fn } = Point;
  const randomBytes_ = ecdhOpts.randomBytes === void 0 ? randomBytes2 : ecdhOpts.randomBytes;
  const lengths = Object.assign(getWLengths(Point.Fp, Fn), {
    seed: Math.max(getMinHashLength(Fn.ORDER), 16)
  });
  function isValidSecretKey(secretKey) {
    try {
      const num = Fn.fromBytes(secretKey);
      return Fn.isValidNot0(num);
    } catch (error) {
      return false;
    }
  }
  function isValidPublicKey(publicKey, isCompressed) {
    const { publicKey: comp, publicKeyUncompressed } = lengths;
    try {
      const l = publicKey.length;
      if (isCompressed === true && l !== comp)
        return false;
      if (isCompressed === false && l !== publicKeyUncompressed)
        return false;
      return !!Point.fromBytes(publicKey);
    } catch (error) {
      return false;
    }
  }
  function randomSecretKey(seed) {
    seed = seed === void 0 ? randomBytes_(lengths.seed) : seed;
    return mapHashToField(abytes3(seed, lengths.seed, "seed"), Fn.ORDER);
  }
  function getPublicKey(secretKey, isCompressed = true) {
    return Point.BASE.multiply(Fn.fromBytes(secretKey)).toBytes(isCompressed);
  }
  function isProbPub(item) {
    const { secretKey, publicKey, publicKeyUncompressed } = lengths;
    const allowedLengths = Fn._lengths;
    if (!isBytes3(item))
      return void 0;
    const l = abytes3(item, void 0, "key").length;
    const isPub = l === publicKey || l === publicKeyUncompressed;
    const isSec = l === secretKey || !!allowedLengths?.includes(l);
    if (isPub && isSec)
      return void 0;
    return isPub;
  }
  function getSharedSecret(secretKeyA, publicKeyB, isCompressed = true) {
    if (isProbPub(secretKeyA) === true)
      throw new Error("first arg must be private key");
    if (isProbPub(publicKeyB) === false)
      throw new Error("second arg must be public key");
    const s = Fn.fromBytes(secretKeyA);
    const b = Point.fromBytes(publicKeyB);
    return b.multiply(s).toBytes(isCompressed);
  }
  const utils = {
    isValidSecretKey,
    isValidPublicKey,
    randomSecretKey
  };
  const keygen = createKeygen(randomSecretKey, getPublicKey);
  Object.freeze(utils);
  Object.freeze(lengths);
  return Object.freeze({ getPublicKey, getSharedSecret, keygen, Point, utils, lengths });
}
function ecdsa(Point, hash, ecdsaOpts = {}) {
  const hash_ = hash;
  ahash(hash_);
  validateObject(ecdsaOpts, {}, {
    hmac: "function",
    lowS: "boolean",
    randomBytes: "function",
    bits2int: "function",
    bits2int_modN: "function"
  });
  ecdsaOpts = Object.assign({}, ecdsaOpts);
  const randomBytes3 = ecdsaOpts.randomBytes === void 0 ? randomBytes2 : ecdsaOpts.randomBytes;
  const hmac2 = ecdsaOpts.hmac === void 0 ? (key, msg) => hmac(hash_, key, msg) : ecdsaOpts.hmac;
  const { Fp, Fn } = Point;
  const { ORDER: CURVE_ORDER, BITS: fnBits } = Fn;
  const { keygen, getPublicKey, getSharedSecret, utils, lengths } = ecdh(Point, ecdsaOpts);
  const defaultSigOpts = {
    prehash: true,
    lowS: typeof ecdsaOpts.lowS === "boolean" ? ecdsaOpts.lowS : true,
    format: "compact",
    extraEntropy: false
  };
  const hasLargeRecoveryLifts = CURVE_ORDER * _2n2 + _1n4 < Fp.ORDER;
  function isBiggerThanHalfOrder(number) {
    const HALF = CURVE_ORDER >> _1n4;
    return number > HALF;
  }
  function validateRS(title, num) {
    if (!Fn.isValidNot0(num))
      throw new Error(`invalid signature ${title}: out of range 1..Point.Fn.ORDER`);
    return num;
  }
  function assertRecoverableCurve() {
    if (hasLargeRecoveryLifts)
      throw new Error('"recovered" sig type is not supported for cofactor >2 curves');
  }
  function validateSigLength(bytes, format) {
    validateSigFormat(format);
    const size = lengths.signature;
    const sizer = format === "compact" ? size : format === "recovered" ? size + 1 : void 0;
    return abytes3(bytes, sizer);
  }
  class Signature {
    constructor(r, s, recovery) {
      __publicField(this, "r");
      __publicField(this, "s");
      __publicField(this, "recovery");
      this.r = validateRS("r", r);
      this.s = validateRS("s", s);
      if (recovery != null) {
        assertRecoverableCurve();
        if (![0, 1, 2, 3].includes(recovery))
          throw new Error("invalid recovery id");
        this.recovery = recovery;
      }
      Object.freeze(this);
    }
    static fromBytes(bytes, format = defaultSigOpts.format) {
      validateSigLength(bytes, format);
      let recid;
      if (format === "der") {
        const { r: r2, s: s2 } = DER.toSig(abytes3(bytes));
        return new Signature(r2, s2);
      }
      if (format === "recovered") {
        recid = bytes[0];
        format = "compact";
        bytes = bytes.subarray(1);
      }
      const L = lengths.signature / 2;
      const r = bytes.subarray(0, L);
      const s = bytes.subarray(L, L * 2);
      return new Signature(Fn.fromBytes(r), Fn.fromBytes(s), recid);
    }
    static fromHex(hex, format) {
      return this.fromBytes(hexToBytes2(hex), format);
    }
    assertRecovery() {
      const { recovery } = this;
      if (recovery == null)
        throw new Error("invalid recovery id: must be present");
      return recovery;
    }
    addRecoveryBit(recovery) {
      return new Signature(this.r, this.s, recovery);
    }
    // Unlike the top-level helper below, this method expects a digest that has
    // already been hashed to the curve's message representative.
    recoverPublicKey(messageHash) {
      const { r, s } = this;
      const recovery = this.assertRecovery();
      const radj = recovery === 2 || recovery === 3 ? r + CURVE_ORDER : r;
      if (!Fp.isValid(radj))
        throw new Error("invalid recovery id: sig.r+curve.n != R.x");
      const x = Fp.toBytes(radj);
      const R = Point.fromBytes(concatBytes3(pprefix((recovery & 1) === 0), x));
      const ir = Fn.inv(radj);
      const h = bits2int_modN(abytes3(messageHash, void 0, "msgHash"));
      const u1 = Fn.create(-h * ir);
      const u2 = Fn.create(s * ir);
      const Q = Point.BASE.multiplyUnsafe(u1).add(R.multiplyUnsafe(u2));
      if (Q.is0())
        throw new Error("invalid recovery: point at infinify");
      Q.assertValidity();
      return Q;
    }
    // Signatures should be low-s, to prevent malleability.
    hasHighS() {
      return isBiggerThanHalfOrder(this.s);
    }
    toBytes(format = defaultSigOpts.format) {
      validateSigFormat(format);
      if (format === "der")
        return hexToBytes2(DER.hexFromSig(this));
      const { r, s } = this;
      const rb = Fn.toBytes(r);
      const sb = Fn.toBytes(s);
      if (format === "recovered") {
        assertRecoverableCurve();
        return concatBytes3(Uint8Array.of(this.assertRecovery()), rb, sb);
      }
      return concatBytes3(rb, sb);
    }
    toHex(format) {
      return bytesToHex2(this.toBytes(format));
    }
  }
  Object.freeze(Signature.prototype);
  Object.freeze(Signature);
  const bits2int = ecdsaOpts.bits2int === void 0 ? function bits2int_def(bytes) {
    if (bytes.length > 8192)
      throw new Error("input is too large");
    const num = bytesToNumberBE(bytes);
    const delta = bytes.length * 8 - fnBits;
    return delta > 0 ? num >> BigInt(delta) : num;
  } : ecdsaOpts.bits2int;
  const bits2int_modN = ecdsaOpts.bits2int_modN === void 0 ? function bits2int_modN_def(bytes) {
    return Fn.create(bits2int(bytes));
  } : ecdsaOpts.bits2int_modN;
  const ORDER_MASK = bitMask(fnBits);
  function int2octets(num) {
    aInRange("num < 2^" + fnBits, num, _0n4, ORDER_MASK);
    return Fn.toBytes(num);
  }
  function validateMsgAndHash(message, prehash) {
    abytes3(message, void 0, "message");
    return prehash ? abytes3(hash_(message), void 0, "prehashed message") : message;
  }
  function prepSig(message, secretKey, opts) {
    const { lowS, prehash, extraEntropy } = validateSigOpts(opts, defaultSigOpts);
    message = validateMsgAndHash(message, prehash);
    const h1int = bits2int_modN(message);
    const d = Fn.fromBytes(secretKey);
    if (!Fn.isValidNot0(d))
      throw new Error("invalid private key");
    const seedArgs = [int2octets(d), int2octets(h1int)];
    if (extraEntropy != null && extraEntropy !== false) {
      const e = extraEntropy === true ? randomBytes3(lengths.secretKey) : extraEntropy;
      seedArgs.push(abytes3(e, void 0, "extraEntropy"));
    }
    const seed = concatBytes3(...seedArgs);
    const m = h1int;
    function k2sig(kBytes) {
      const k = bits2int(kBytes);
      if (!Fn.isValidNot0(k))
        return;
      const ik = Fn.inv(k);
      const q = Point.BASE.multiply(k).toAffine();
      const r = Fn.create(q.x);
      if (r === _0n4)
        return;
      const s = Fn.create(ik * Fn.create(m + r * d));
      if (s === _0n4)
        return;
      let recovery = (q.x === r ? 0 : 2) | Number(q.y & _1n4);
      let normS = s;
      if (lowS && isBiggerThanHalfOrder(s)) {
        normS = Fn.neg(s);
        recovery ^= 1;
      }
      return new Signature(r, normS, hasLargeRecoveryLifts ? void 0 : recovery);
    }
    return { seed, k2sig };
  }
  function sign(message, secretKey, opts = {}) {
    const { seed, k2sig } = prepSig(message, secretKey, opts);
    const drbg = createHmacDrbg(hash_.outputLen, Fn.BYTES, hmac2);
    const sig = drbg(seed, k2sig);
    return sig.toBytes(opts.format);
  }
  function verify(signature, message, publicKey, opts = {}) {
    const { lowS, prehash, format } = validateSigOpts(opts, defaultSigOpts);
    publicKey = abytes3(publicKey, void 0, "publicKey");
    message = validateMsgAndHash(message, prehash);
    if (!isBytes3(signature)) {
      const end = signature instanceof Signature ? ", use sig.toBytes()" : "";
      throw new Error("verify expects Uint8Array signature" + end);
    }
    validateSigLength(signature, format);
    try {
      const sig = Signature.fromBytes(signature, format);
      const P = Point.fromBytes(publicKey);
      if (lowS && sig.hasHighS())
        return false;
      const { r, s } = sig;
      const h = bits2int_modN(message);
      const is = Fn.inv(s);
      const u1 = Fn.create(h * is);
      const u2 = Fn.create(r * is);
      const R = Point.BASE.multiplyUnsafe(u1).add(P.multiplyUnsafe(u2));
      if (R.is0())
        return false;
      const v = Fn.create(R.x);
      return v === r;
    } catch (e) {
      return false;
    }
  }
  function recoverPublicKey(signature, message, opts = {}) {
    const { prehash } = validateSigOpts(opts, defaultSigOpts);
    message = validateMsgAndHash(message, prehash);
    return Signature.fromBytes(signature, "recovered").recoverPublicKey(message).toBytes();
  }
  return Object.freeze({
    keygen,
    getPublicKey,
    getSharedSecret,
    utils,
    lengths,
    Point,
    sign,
    verify,
    recoverPublicKey,
    Signature,
    hash: hash_
  });
}
var divNearest, DERErr, DER, _0n4, _1n4, _2n2, _3n2, _4n2;
var init_weierstrass = __esm({
  "node_modules/@noble/curves/abstract/weierstrass.js"() {
    init_hmac();
    init_utils2();
    init_utils3();
    init_curve();
    init_modular();
    divNearest = (num, den) => (num + (num >= 0 ? den : -den) / _2n2) / den;
    DERErr = class extends Error {
      constructor(m = "") {
        super(m);
      }
    };
    DER = {
      // asn.1 DER encoding utils
      Err: DERErr,
      // Basic building block is TLV (Tag-Length-Value)
      _tlv: {
        encode: (tag, data) => {
          const { Err: E } = DER;
          asafenumber(tag, "tag");
          if (tag < 0 || tag > 255)
            throw new E("tlv.encode: wrong tag");
          if (typeof data !== "string")
            throw new TypeError('"data" expected string, got type=' + typeof data);
          if (data.length & 1)
            throw new E("tlv.encode: unpadded data");
          const dataLen = data.length / 2;
          const len = numberToHexUnpadded(dataLen);
          if (len.length / 2 & 128)
            throw new E("tlv.encode: long form length too big");
          const lenLen = dataLen > 127 ? numberToHexUnpadded(len.length / 2 | 128) : "";
          const t = numberToHexUnpadded(tag);
          return t + lenLen + len + data;
        },
        // v - value, l - left bytes (unparsed)
        decode(tag, data) {
          const { Err: E } = DER;
          data = abytes3(data, void 0, "DER data");
          let pos = 0;
          if (tag < 0 || tag > 255)
            throw new E("tlv.encode: wrong tag");
          if (data.length < 2 || data[pos++] !== tag)
            throw new E("tlv.decode: wrong tlv");
          const first = data[pos++];
          const isLong = !!(first & 128);
          let length = 0;
          if (!isLong)
            length = first;
          else {
            const lenLen = first & 127;
            if (!lenLen)
              throw new E("tlv.decode(long): indefinite length not supported");
            if (lenLen > 4)
              throw new E("tlv.decode(long): byte length is too big");
            const lengthBytes = data.subarray(pos, pos + lenLen);
            if (lengthBytes.length !== lenLen)
              throw new E("tlv.decode: length bytes not complete");
            if (lengthBytes[0] === 0)
              throw new E("tlv.decode(long): zero leftmost byte");
            for (const b of lengthBytes)
              length = length << 8 | b;
            pos += lenLen;
            if (length < 128)
              throw new E("tlv.decode(long): not minimal encoding");
          }
          const v = data.subarray(pos, pos + length);
          if (v.length !== length)
            throw new E("tlv.decode: wrong value length");
          return { v, l: data.subarray(pos + length) };
        }
      },
      // https://crypto.stackexchange.com/a/57734 Leftmost bit of first byte is 'negative' flag,
      // since we always use positive integers here. It must always be empty:
      // - add zero byte if exists
      // - if next byte doesn't have a flag, leading zero is not allowed (minimal encoding)
      _int: {
        encode(num) {
          const { Err: E } = DER;
          abignumber(num);
          if (num < _0n4)
            throw new E("integer: negative integers are not allowed");
          let hex = numberToHexUnpadded(num);
          if (Number.parseInt(hex[0], 16) & 8)
            hex = "00" + hex;
          if (hex.length & 1)
            throw new E("unexpected DER parsing assertion: unpadded hex");
          return hex;
        },
        decode(data) {
          const { Err: E } = DER;
          if (data.length < 1)
            throw new E("invalid signature integer: empty");
          if (data[0] & 128)
            throw new E("invalid signature integer: negative");
          if (data.length > 1 && data[0] === 0 && !(data[1] & 128))
            throw new E("invalid signature integer: unnecessary leading zero");
          return bytesToNumberBE(data);
        }
      },
      toSig(bytes) {
        const { Err: E, _int: int, _tlv: tlv } = DER;
        const data = abytes3(bytes, void 0, "signature");
        const { v: seqBytes, l: seqLeftBytes } = tlv.decode(48, data);
        if (seqLeftBytes.length)
          throw new E("invalid signature: left bytes after parsing");
        const { v: rBytes, l: rLeftBytes } = tlv.decode(2, seqBytes);
        const { v: sBytes, l: sLeftBytes } = tlv.decode(2, rLeftBytes);
        if (sLeftBytes.length)
          throw new E("invalid signature: left bytes after parsing");
        return { r: int.decode(rBytes), s: int.decode(sBytes) };
      },
      hexFromSig(sig) {
        const { _tlv: tlv, _int: int } = DER;
        const rs = tlv.encode(2, int.encode(sig.r));
        const ss = tlv.encode(2, int.encode(sig.s));
        const seq = rs + ss;
        return tlv.encode(48, seq);
      }
    };
    Object.freeze(DER._tlv);
    Object.freeze(DER._int);
    Object.freeze(DER);
    _0n4 = /* @__PURE__ */ BigInt(0);
    _1n4 = /* @__PURE__ */ BigInt(1);
    _2n2 = /* @__PURE__ */ BigInt(2);
    _3n2 = /* @__PURE__ */ BigInt(3);
    _4n2 = /* @__PURE__ */ BigInt(4);
  }
});

// node_modules/@noble/curves/nist.js
var nist_exports = {};
__export(nist_exports, {
  p256: () => p256,
  p256_FROST: () => p256_FROST,
  p256_hasher: () => p256_hasher,
  p256_oprf: () => p256_oprf,
  p384: () => p384,
  p384_hasher: () => p384_hasher,
  p384_oprf: () => p384_oprf,
  p521: () => p521,
  p521_hasher: () => p521_hasher,
  p521_oprf: () => p521_oprf
});
function createSWU(Point, opts) {
  let map;
  return (scalars) => (map || (map = mapToCurveSimpleSWU(Point.Fp, opts)))(scalars[0]);
}
var p256_CURVE, p384_CURVE, p521_CURVE, p256_Point, p256, p256_hasher, p256_oprf, p256_FROST, p384_Point, p384, p384_hasher, p384_oprf, p521_Point, p521, p521_hasher, p521_oprf;
var init_nist = __esm({
  "node_modules/@noble/curves/nist.js"() {
    init_sha2();
    init_frost();
    init_hash_to_curve();
    init_oprf();
    init_weierstrass();
    p256_CURVE = /* @__PURE__ */ (() => ({
      p: BigInt("0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff"),
      n: BigInt("0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551"),
      h: BigInt(1),
      a: BigInt("0xffffffff00000001000000000000000000000000fffffffffffffffffffffffc"),
      b: BigInt("0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b"),
      Gx: BigInt("0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296"),
      Gy: BigInt("0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5")
    }))();
    p384_CURVE = /* @__PURE__ */ (() => ({
      p: BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffeffffffff0000000000000000ffffffff"),
      n: BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffc7634d81f4372ddf581a0db248b0a77aecec196accc52973"),
      h: BigInt(1),
      a: BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffeffffffff0000000000000000fffffffc"),
      b: BigInt("0xb3312fa7e23ee7e4988e056be3f82d19181d9c6efe8141120314088f5013875ac656398d8a2ed19d2a85c8edd3ec2aef"),
      Gx: BigInt("0xaa87ca22be8b05378eb1c71ef320ad746e1d3b628ba79b9859f741e082542a385502f25dbf55296c3a545e3872760ab7"),
      Gy: BigInt("0x3617de4a96262c6f5d9e98bf9292dc29f8f41dbd289a147ce9da3113b5f0b8c00a60b1ce1d7e819d7a431d7c90ea0e5f")
    }))();
    p521_CURVE = /* @__PURE__ */ (() => ({
      p: BigInt("0x1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
      n: BigInt("0x01fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffa51868783bf2f966b7fcc0148f709a5d03bb5c9b8899c47aebb6fb71e91386409"),
      h: BigInt(1),
      a: BigInt("0x1fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc"),
      b: BigInt("0x0051953eb9618e1c9a1f929a21a0b68540eea2da725b99b315f3b8b489918ef109e156193951ec7e937b1652c0bd3bb1bf073573df883d2c34f1ef451fd46b503f00"),
      Gx: BigInt("0x00c6858e06b70404e9cd9e3ecb662395b4429c648139053fb521f828af606b4d3dbaa14b5e77efe75928fe1dc127a2ffa8de3348b3c1856a429bf97e7e31c2e5bd66"),
      Gy: BigInt("0x011839296a789a3bc0045c8a5fb42c7d1bd998f54449579b446817afbd17273e662c97ee72995ef42640c550b9013fad0761353c7086a272c24088be94769fd16650")
    }))();
    p256_Point = /* @__PURE__ */ weierstrass(p256_CURVE);
    p256 = /* @__PURE__ */ ecdsa(p256_Point, sha256);
    p256_hasher = /* @__PURE__ */ (() => {
      return createHasher2(p256_Point, createSWU(p256_Point, {
        A: p256_CURVE.a,
        B: p256_CURVE.b,
        Z: p256_Point.Fp.create(BigInt("-10"))
      }), {
        DST: "P256_XMD:SHA-256_SSWU_RO_",
        encodeDST: "P256_XMD:SHA-256_SSWU_NU_",
        p: p256_CURVE.p,
        m: 1,
        k: 128,
        expand: "xmd",
        hash: sha256
      });
    })();
    p256_oprf = /* @__PURE__ */ (() => createOPRF({
      name: "P256-SHA256",
      Point: p256_Point,
      hash: sha256,
      hashToGroup: p256_hasher.hashToCurve,
      hashToScalar: p256_hasher.hashToScalar
    }))();
    p256_FROST = /* @__PURE__ */ (() => createFROST({
      name: "FROST-P256-SHA256-v1",
      Point: p256_Point,
      hashToScalar: p256_hasher.hashToScalar,
      hash: sha256
    }))();
    p384_Point = /* @__PURE__ */ weierstrass(p384_CURVE);
    p384 = /* @__PURE__ */ ecdsa(p384_Point, sha384);
    p384_hasher = /* @__PURE__ */ (() => {
      return createHasher2(p384_Point, createSWU(p384_Point, {
        A: p384_CURVE.a,
        B: p384_CURVE.b,
        Z: p384_Point.Fp.create(BigInt("-12"))
      }), {
        DST: "P384_XMD:SHA-384_SSWU_RO_",
        encodeDST: "P384_XMD:SHA-384_SSWU_NU_",
        p: p384_CURVE.p,
        m: 1,
        k: 192,
        expand: "xmd",
        hash: sha384
      });
    })();
    p384_oprf = /* @__PURE__ */ (() => createOPRF({
      name: "P384-SHA384",
      Point: p384_Point,
      hash: sha384,
      hashToGroup: p384_hasher.hashToCurve,
      hashToScalar: p384_hasher.hashToScalar
    }))();
    p521_Point = /* @__PURE__ */ weierstrass(p521_CURVE);
    p521 = /* @__PURE__ */ ecdsa(p521_Point, sha512);
    p521_hasher = /* @__PURE__ */ (() => {
      return createHasher2(p521_Point, createSWU(p521_Point, {
        A: p521_CURVE.a,
        B: p521_CURVE.b,
        Z: p521_Point.Fp.create(BigInt("-4"))
      }), {
        DST: "P521_XMD:SHA-512_SSWU_RO_",
        encodeDST: "P521_XMD:SHA-512_SSWU_NU_",
        p: p521_CURVE.p,
        m: 1,
        k: 256,
        expand: "xmd",
        hash: sha512
      });
    })();
    p521_oprf = /* @__PURE__ */ (() => createOPRF({
      name: "P521-SHA512",
      Point: p521_Point,
      hash: sha512,
      hashToGroup: p521_hasher.hashToCurve,
      hashToScalar: p521_hasher.hashToScalar
      // produces L=98 just like in RFC
    }))();
  }
});

// src/utils/filemoon.js
var require_filemoon = __commonJS({
  "src/utils/filemoon.js"(exports2, module2) {
    if (typeof TextEncoder === "undefined") {
      globalThis.TextEncoder = function TextEncoder2() {
      };
      globalThis.TextEncoder.prototype.encode = function(str) {
        const bytes = [];
        for (let i = 0; i < str.length; i++) {
          const c = str.charCodeAt(i);
          if (c < 128) {
            bytes.push(c);
          } else if (c < 2048) {
            bytes.push(192 | c >> 6, 128 | c & 63);
          } else {
            bytes.push(224 | c >> 12, 128 | c >> 6 & 63, 128 | c & 63);
          }
        }
        return new Uint8Array(bytes);
      };
    }
    if (typeof globalThis.crypto === "undefined") {
      globalThis.crypto = {};
    }
    if (!globalThis.crypto.getRandomValues) {
      globalThis.crypto.getRandomValues = function(buffer) {
        for (let i = 0; i < buffer.length; i++) {
          buffer[i] = Math.floor(Math.random() * 256);
        }
        return buffer;
      };
    }
    var BASE_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    try {
      const { gcm: nobleGcm } = (init_aes(), __toCommonJS(aes_exports));
      globalThis.__gcm = nobleGcm;
      const { sha256: nobleSha256 } = (init_sha2(), __toCommonJS(sha2_exports));
      globalThis.__sha256 = nobleSha256;
      console.log("[FileMoon] Crypto modules OK");
    } catch (e) {
      console.log(`[FileMoon] Crypto load error: ${e.message}`);
      globalThis.__gcm = null;
      globalThis.__sha256 = null;
    }
    function b64uDecode(str) {
      str = str.replace(/-/g, "+").replace(/_/g, "/");
      while (str.length % 4 !== 0)
        str += "=";
      const binary = typeof atob !== "undefined" ? atob(str) : Buffer.from(str, "base64").toString("binary");
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++)
        bytes[i] = binary.charCodeAt(i);
      return bytes;
    }
    function b64uEncode(bytes) {
      let binary = "";
      for (let i = 0; i < bytes.length; i++)
        binary += String.fromCharCode(bytes[i]);
      const b64 = typeof btoa !== "undefined" ? btoa(binary) : Buffer.from(binary, "binary").toString("base64");
      return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    }
    function utf8Decode(bytes) {
      let str = "", i = 0;
      while (i < bytes.length) {
        const c = bytes[i];
        if (c < 128) {
          str += String.fromCharCode(c);
          i++;
        } else if (c < 224) {
          str += String.fromCharCode((c & 31) << 6 | bytes[i + 1] & 63);
          i += 2;
        } else {
          str += String.fromCharCode((c & 15) << 12 | (bytes[i + 1] & 63) << 6 | bytes[i + 2] & 63);
          i += 3;
        }
      }
      return str;
    }
    function generateUUID() {
      return "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx".replace(/[x]/g, () => Math.floor(Math.random() * 16).toString(16));
    }
    function derToRaw64(der) {
      const buf = der instanceof Uint8Array ? der : new Uint8Array(der);
      let offset = 2;
      if (buf[1] === 129)
        offset = 3;
      const rLen = buf[offset + 1];
      let r = buf.slice(offset + 2, offset + 2 + rLen);
      offset += 2 + rLen;
      const sLen = buf[offset + 1];
      let s = buf.slice(offset + 2, offset + 2 + sLen);
      while (r.length > 32 && r[0] === 0)
        r = r.slice(1);
      while (s.length > 32 && s[0] === 0)
        s = s.slice(1);
      const raw = new Uint8Array(64);
      raw.set(r, 32 - r.length);
      raw.set(s, 64 - s.length);
      return raw;
    }
    async function postJSON(url, body, headers = {}) {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "User-Agent": BASE_UA, ...headers },
        body: JSON.stringify(body)
      });
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${txt.substring(0, 200)}`);
      }
      return resp.json();
    }
    async function getJSON(url, headers = {}) {
      const resp = await fetch(url, { headers: { "User-Agent": BASE_UA, ...headers } });
      if (!resp.ok)
        throw new Error(`HTTP ${resp.status} en ${url}`);
      return resp.json();
    }
    async function generateAttestation(nonce) {
      function utf8EncodeStr(s) {
        const b = [];
        for (let i = 0; i < s.length; i++) {
          const c = s.charCodeAt(i);
          if (c < 128)
            b.push(c);
          else if (c < 2048)
            b.push(192 | c >> 6, 128 | c & 63);
          else
            b.push(224 | c >> 12, 128 | c >> 6 & 63, 128 | c & 63);
        }
        return new Uint8Array(b);
      }
      const subtle = false;
      console.log(`[FileMoon] Attest: crypto=${typeof globalThis.crypto}, subtle=${!!subtle}`);
      if (subtle) {
        try {
          const keyPair = await subtle.generateKey(
            { name: "ECDSA", namedCurve: "P-256" },
            true,
            ["sign", "verify"]
          );
          const nonceBytes = typeof TextEncoder !== "undefined" ? new TextEncoder().encode(nonce) : utf8EncodeStr(nonce);
          const derSig = await subtle.sign({ name: "ECDSA", hash: "SHA-256" }, keyPair.privateKey, nonceBytes);
          const sigBytes = new Uint8Array(derSig);
          const rawSig = sigBytes.length === 64 ? sigBytes : derToRaw64(sigBytes);
          const jwk = await subtle.exportKey("jwk", keyPair.publicKey);
          return {
            signature: b64uEncode(rawSig),
            publicKey: { crv: "P-256", ext: true, key_ops: ["verify"], kty: "EC", x: jwk.x, y: jwk.y }
          };
        } catch (e) {
          console.log(`[FileMoon] WebCrypto failed: ${e.message}, trying noble fallback...`);
        }
      }
      console.log("[FileMoon] Attestation via noble/curves (fallback)");
      try {
        const { p256: p2562 } = (init_nist(), __toCommonJS(nist_exports));
        const privKey = p2562.utils.randomSecretKey();
        const pubRaw = p2562.getPublicKey(privKey, false);
        const x = new Uint8Array(32);
        x.set(pubRaw.slice(1, 33), 32 - 32);
        const y = new Uint8Array(32);
        y.set(pubRaw.slice(33, 65), 32 - 32);
        const nonceBytes = utf8EncodeStr(nonce);
        const rawSig = p2562.sign(nonceBytes, privKey);
        const result = {
          signature: b64uEncode(rawSig),
          publicKey: { crv: "P-256", ext: true, key_ops: ["verify"], kty: "EC", x: b64uEncode(x), y: b64uEncode(y) }
        };
        console.log(`[FileMoon] noble attestation OK (sig=${rawSig.length}B)`);
        return result;
      } catch (e) {
        console.log(`[FileMoon] noble/curves error: ${e.message}`);
        throw e;
      }
    }
    function decryptPlayback(playbackData) {
      console.log(`[FileMoon] decrypt: parts=${playbackData.key_parts.length}, payload=${playbackData.payload.length}B`);
      const iv = b64uDecode(playbackData.iv);
      const payload = b64uDecode(playbackData.payload);
      const allParts = playbackData.key_parts.map((kp) => b64uDecode(kp));
      const sha256Fn = globalThis.__sha256;
      if (!sha256Fn)
        throw new Error("SHA256 not available");
      const keyAttempts = [];
      const shortParts = allParts.filter((p) => p.length === 16);
      if (shortParts.length >= 2) {
        const k = new Uint8Array(32);
        k.set(shortParts[0], 0);
        k.set(shortParts[1], 16);
        keyAttempts.push({ key: k, desc: `short16[0]+[1] (${shortParts[0].length}+${shortParts[1].length}B)` });
      }
      if (allParts.length >= 2) {
        const concat48 = new Uint8Array(allParts[0].length + allParts[1].length);
        concat48.set(allParts[0], 0);
        concat48.set(allParts[1], allParts[0].length);
        const hash = sha256Fn(concat48);
        keyAttempts.push({ key: hash, desc: `SHA256(p[0]+p[1]) (${allParts[0].length}+${allParts[1].length}B)` });
        if (concat48.length === 16 || concat48.length === 24 || concat48.length === 32) {
          keyAttempts.push({ key: concat48, desc: `p[0]+p[1] raw (${concat48.length}B)` });
        }
      }
      if (shortParts.length >= 2) {
        const concat32 = new Uint8Array(32);
        concat32.set(shortParts[0], 0);
        concat32.set(shortParts[1], 16);
        const hash = sha256Fn(concat32);
        keyAttempts.push({ key: hash, desc: `SHA256(short16[0]+[1]) (32B->32B)` });
      }
      if (shortParts.length >= 2) {
        try {
          const h1 = sha256Fn(shortParts[0]);
          const h2 = sha256Fn(shortParts[1]);
          const k = new Uint8Array(64);
          k.set(h1, 0);
          k.set(h2, 32);
          keyAttempts.push({ key: k, desc: `SHA256(s[0])+SHA256(s[1]) (64B)` });
        } catch (e) {
        }
      }
      if (allParts.length > 0) {
        const totalLen = allParts.reduce((s, p) => s + p.length, 0);
        const allConcat = new Uint8Array(totalLen);
        let offset = 0;
        for (const p of allParts) {
          allConcat.set(p, offset);
          offset += p.length;
        }
        const hash = sha256Fn(allConcat);
        keyAttempts.push({ key: hash, desc: `SHA256(all ${allParts.length} parts, ${totalLen}B)` });
      }
      let lastError = null;
      for (const { key, desc } of keyAttempts) {
        try {
          const cipher = globalThis.__gcm(key, iv);
          const decrypted = cipher.decrypt(payload);
          console.log(`[FileMoon] \u2705 key: ${desc}`);
          const json = utf8Decode(decrypted);
          const parsed = JSON.parse(json);
          const sources = parsed.sources || parsed.source;
          if (Array.isArray(sources) && sources.length > 0) {
            return sources[0].url;
          }
          if (typeof sources === "string") {
            return sources;
          }
          throw new Error("No sources in decrypted payload");
        } catch (e) {
          lastError = e;
        }
      }
      console.log(`[FileMoon] All ${keyAttempts.length} key attempts failed`);
      throw lastError || new Error("No key worked");
    }
    var _byseDeviceId = generateUUID();
    async function resolveFileMoon(url) {
      try {
        console.log(`[FileMoon] Resolviendo: ${url}`);
        const matcher = url.match(/\/(e|d)\/([a-zA-Z0-9]+)/);
        if (!matcher)
          throw new Error("No videoId en URL");
        const linkType = matcher[1];
        const videoId = matcher[2];
        const currentDomain = (url.match(/^(https?:\/\/[^/]+)/) || [])[1];
        if (!currentDomain)
          throw new Error("No currentDomain");
        const details = await getJSON(`${currentDomain}/api/videos/${videoId}/embed/details`);
        const embedFrameUrl = details.embed_frame_url;
        if (!embedFrameUrl)
          throw new Error("No embed_frame_url");
        const playbackDomain = (embedFrameUrl.match(/^(https?:\/\/[^/]+)/) || [])[1];
        if (!playbackDomain)
          throw new Error("No playbackDomain");
        const authHeaders = { "Referer": embedFrameUrl, "Origin": playbackDomain };
        const challenge = await postJSON(`${playbackDomain}/api/videos/access/challenge`, {}, authHeaders);
        const challengeId = challenge.challenge_id;
        const nonce = challenge.nonce;
        if (!challengeId || !nonce)
          throw new Error("No challengeId/nonce");
        const viewerId = generateUUID();
        let signature, publicKey;
        try {
          ({ signature, publicKey } = await generateAttestation(nonce));
        } catch (attestErr) {
          console.log(`[FileMoon] attest error: ${attestErr.message}`);
          throw attestErr;
        }
        const attestPayload = {
          viewer_id: viewerId,
          device_id: _byseDeviceId,
          challenge_id: challengeId,
          nonce,
          signature,
          public_key: publicKey,
          client: {
            user_agent: BASE_UA,
            architecture: "x86",
            bitness: "64",
            platform: "Windows",
            platform_version: "10.0.0",
            pixel_ratio: 1,
            screen_width: 1920,
            screen_height: 1080,
            languages: ["en-US"]
          },
          storage: {
            cookie: viewerId,
            local_storage: viewerId,
            indexed_db: `${viewerId}:${_byseDeviceId}`,
            cache_storage: `${viewerId}:${_byseDeviceId}`
          },
          attributes: { entropy: "high" }
        };
        const attest = await postJSON(`${playbackDomain}/api/videos/access/attest`, attestPayload, authHeaders);
        const token = attest.token;
        const confidence = attest.confidence;
        if (!token)
          throw new Error("No attest token");
        const finalViewerId = attest.viewer_id || viewerId;
        const finalDeviceId = attest.device_id || _byseDeviceId;
        if (attest.device_id)
          _byseDeviceId = attest.device_id;
        const playbackResp = await postJSON(
          `${playbackDomain}/api/videos/${videoId}/embed/playback`,
          { fingerprint: { token, viewer_id: finalViewerId, device_id: finalDeviceId, confidence } },
          { ...authHeaders, "X-Embed-Parent": linkType === "e" ? url : "" }
        );
        if (!playbackResp.playback)
          throw new Error("No playback data");
        const sourceUrl = decryptPlayback(playbackResp.playback);
        const finalOrigin = currentDomain || playbackDomain;
        return {
          url: sourceUrl,
          quality: "1080p",
          headers: { Referer: embedFrameUrl, "User-Agent": BASE_UA, Origin: finalOrigin }
        };
      } catch (e) {
        console.log(`[FileMoon] Error: ${e.message}`);
        return null;
      }
    }
    module2.exports = { resolveFileMoon };
  }
});

// src/utils/vidhide.js
var require_vidhide = __commonJS({
  "src/utils/vidhide.js"(exports2, module2) {
    async function resolve2(url) {
      try {
        let unpack2 = function(e) {
          let o = e.match(/eval\(function\(p,a,c,k,e,[rd]\)\{.*?\}\s*\('([\s\S]*?)',\s*(\d+),\s*(\d+),\s*'([\s\S]*?)'\.split\('\|'\)/);
          if (!o)
            return null;
          let [, t2, l, s2, c] = o;
          l = parseInt(l);
          s2 = parseInt(s2);
          c = c.split("|");
          let i = (u, r) => {
            let n = "0123456789abcdefghijklmnopqrstuvwxyz", a = "";
            for (; u > 0; ) {
              a = n[u % r] + a;
              u = Math.floor(u / r);
            }
            return a || "0";
          };
          return t2 = t2.replace(/\b\w+\b/g, (u) => {
            let r = parseInt(u, 36);
            return r < c.length && c[r] ? c[r] : i(r, l);
          }), t2;
        };
        var unpack = unpack2;
        const I = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
        console.log(`[VidHide] Resolviendo: ${url}`);
        let t = await fetch(url, {
          method: "GET",
          headers: {
            "User-Agent": I,
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            Referer: "https://embed69.org/"
          },
          redirect: "follow"
        });
        if (!t.ok)
          throw new Error(`HTTP ${t.status}`);
        let text = await t.text();
        let s = text.match(/eval\(function\(p,a,c,k,e,[rd]\)[\s\S]*?\.split\('\|'\)[^\)]*\)\)/);
        if (!s) {
          console.log("[VidHide] No se encontr\xF3 bloque eval");
          return null;
        }
        let unpacked = unpack2(s[0]);
        if (!unpacked) {
          console.log("[VidHide] No se pudo desempacar");
          return null;
        }
        let hlsMatch = unpacked.match(/"hls4"\s*:\s*"([^"]+)"/) || unpacked.match(/"hls2"\s*:\s*"([^"]+)"/);
        let hlsUrl = hlsMatch ? hlsMatch[1] : null;
        if (!hlsUrl) {
          console.log("[VidHide] No se encontr\xF3 hls4/hls2");
          return null;
        }
        let origin = new URL(url).origin;
        let finalUrl = hlsUrl.startsWith("http") ? hlsUrl : `${origin}${hlsUrl}`;
        console.log(`[VidHide] URL encontrada: ${finalUrl.substring(0, 80)}...`);
        return {
          url: finalUrl,
          quality: "1080p",
          // VidHide suele devolver 1080p o HLS
          headers: { "User-Agent": I, Referer: `${origin}/`, Origin: origin }
        };
      } catch (e) {
        console.log(`[VidHide] Error: ${e.message}`);
        return null;
      }
    }
    module2.exports = { resolve: resolve2 };
  }
});

// src/utils/playmogo.js
var require_playmogo = __commonJS({
  "src/utils/playmogo.js"(exports, module) {
    var exec = null;
    var fs = null;
    var path = null;
    var os = null;
    if (typeof globalThis !== "undefined" && typeof process !== "undefined" && process.versions && process.versions.node) {
      try {
        const req = eval("require");
        exec = req("child_process").exec;
        fs = req("fs");
        path = req("path");
        os = req("os");
      } catch (e) {
      }
    }
    var COMMON_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    function curlGetWithCookies(url, referer, cookieFile, extraHeaders = []) {
      return new Promise((resolve2, reject) => {
        let headersStr = extraHeaders.map((h) => `-H "${h}"`).join(" ");
        const cmd = `curl -s -L -w "\\n%{url_effective}" -A "${COMMON_UA}" -H "Referer: ${referer}" -b "${cookieFile}" -c "${cookieFile}" ${headersStr} "${url}"`;
        exec(cmd, { maxBuffer: 1024 * 1024 * 5 }, (err, stdout, stderr) => {
          if (err) {
            reject(err);
          } else {
            const lines = stdout.split("\n");
            const effectiveUrl = lines[lines.length - 1].trim();
            const body = lines.slice(0, lines.length - 1).join("\n");
            resolve2({ body, effectiveUrl });
          }
        });
      });
    }
    async function resolve(url) {
      if (exec && fs && path && os) {
        const cookieFile = path.join(os.tmpdir(), `dood_cookies_${Date.now()}_${Math.floor(Math.random() * 1e3)}.txt`);
        try {
          console.log(`[DoodStream] Resolviendo con curl (PC): ${url}`);
          const { body: html, effectiveUrl } = await curlGetWithCookies(url, "https://cuevana.unbuendato.com/", cookieFile);
          if (!html || html.length < 500) {
            console.log(`[DoodStream] HTML obtenido demasiado corto o vac\xEDo, no se puede resolver`);
            return null;
          }
          const finalUrlObj = new URL(effectiveUrl);
          const finalHost = `${finalUrlObj.protocol}//${finalUrlObj.host}`;
          const md5Regex = /\/pass_md5\/([^/]*)\/([^/']*)/;
          const md5Match = html.match(md5Regex);
          if (!md5Match) {
            console.log(`[DoodStream] No se encontr\xF3 pass_md5 en el HTML de ${effectiveUrl}`);
            return null;
          }
          const expiry = md5Match[1];
          const token = md5Match[2];
          const md5Url = `${finalHost}/pass_md5/${expiry}/${token}`;
          await new Promise((r) => setTimeout(r, 1e3));
          const { body: baseLinkRaw } = await curlGetWithCookies(md5Url, effectiveUrl, cookieFile, [
            "X-Requested-With: XMLHttpRequest",
            "Accept: */*",
            "Accept-Language: es-ES,es;q=0.9"
          ]);
          const baseLink = baseLinkRaw.trim();
          if (!baseLink || baseLink.includes("RELOAD")) {
            console.log(`[DoodStream] pass_md5 fall\xF3. Retorno baseLink: "${baseLink}"`);
            return null;
          }
          const randomChars = "abcdefghijklmnopqrstuvwxyz0123456789";
          let randStr = "";
          for (let i = 0; i < 10; i++) {
            randStr += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
          }
          const directLink = `${baseLink}${randStr}?token=${token}&expiry=${expiry}000`;
          return {
            url: directLink,
            quality: "720p",
            headers: {
              "User-Agent": COMMON_UA,
              "Referer": finalHost + "/"
            }
          };
        } catch (e) {
          console.log(`[DoodStream] Error (PC): ${e.message}`);
          return null;
        } finally {
          try {
            if (fs.existsSync(cookieFile)) {
              fs.unlinkSync(cookieFile);
            }
          } catch (err) {
          }
        }
      } else {
        try {
          console.log(`[DoodStream] Resolviendo con fetch nativo (Celular): ${url}`);
          let embedUrl = url.replace("doply.net", "myvidplay.com");
          const headers = {
            "User-Agent": COMMON_UA,
            "Referer": "https://cuevana.unbuendato.com/"
          };
          const resp = await fetch(embedUrl, { headers, redirect: "follow" });
          if (!resp.ok) {
            console.log(`[DoodStream] Fall\xF3 fetch inicial: HTTP ${resp.status}`);
            return null;
          }
          const html = await resp.text();
          const effectiveUrl = resp.url || embedUrl;
          const finalUrlObj = new URL(effectiveUrl);
          const finalHost = `${finalUrlObj.protocol}//${finalUrlObj.host}`;
          const md5Regex = /\/pass_md5\/([^/]*)\/([^/']*)/;
          const md5Match = html.match(md5Regex);
          if (!md5Match) {
            console.log(`[DoodStream] No se encontr\xF3 pass_md5`);
            return null;
          }
          const expiry = md5Match[1];
          const token = md5Match[2];
          const md5Url = `${finalHost}/pass_md5/${expiry}/${token}`;
          const md5Resp = await fetch(md5Url, {
            headers: {
              "User-Agent": COMMON_UA,
              "Referer": effectiveUrl,
              "X-Requested-With": "XMLHttpRequest"
            }
          });
          if (!md5Resp.ok) {
            console.log(`[DoodStream] Fall\xF3 petici\xF3n pass_md5: HTTP ${md5Resp.status}`);
            return null;
          }
          const baseLink = (await md5Resp.text()).trim();
          if (!baseLink || baseLink.includes("RELOAD")) {
            console.log(`[DoodStream] Respuesta de pass_md5 inv\xE1lida en celular`);
            return null;
          }
          const randomChars = "abcdefghijklmnopqrstuvwxyz0123456789";
          let randStr = "";
          for (let i = 0; i < 10; i++) {
            randStr += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
          }
          const directLink = `${baseLink}${randStr}?token=${token}&expiry=${expiry}000`;
          return {
            url: directLink,
            quality: "720p",
            headers: {
              "User-Agent": COMMON_UA,
              "Referer": finalHost + "/"
            }
          };
        } catch (e) {
          console.log(`[DoodStream] Error (Celular): ${e.message}`);
          return null;
        }
      }
    }
    module.exports = { resolve };
  }
});

// src/utils/lacloud.js
var require_lacloud = __commonJS({
  "src/utils/lacloud.js"(exports2, module2) {
    var { get: get2 } = require_common();
    function resolve2(embedUrl) {
      return get2(embedUrl).then(function(html) {
        var m = html.match(/const src\s*=\s*["']([^"']+)["']/);
        if (m) {
          return {
            url: m[1],
            quality: "1080p",
            verified: true,
            headers: { "Referer": embedUrl }
          };
        }
        return null;
      });
    }
    module2.exports = { resolve: resolve2 };
  }
});

// src/utils/packer.js
var require_packer = __commonJS({
  "src/utils/packer.js"(exports2, module2) {
    var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    function get2(url, extraHeaders) {
      var headers = Object.assign({ "User-Agent": UA2 }, extraHeaders || {});
      return fetch(url, { headers, redirect: "follow" }).then(function(res) {
        if (!res.ok)
          throw new Error("HTTP " + res.status + " for " + url);
        var ct = res.headers.get("content-type") || "";
        if (ct.indexOf("json") !== -1)
          return res.json();
        return res.text();
      });
    }
    function unpack(payload, radix, symtab) {
      var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      var unbase = function(str) {
        var result = 0;
        for (var i = 0; i < str.length; i++) {
          var pos = chars.indexOf(str[i]);
          if (pos === -1)
            return NaN;
          result = result * radix + pos;
        }
        return result;
      };
      return payload.replace(/\b([0-9a-zA-Z]+)\b/g, function(match) {
        var idx = unbase(match);
        if (isNaN(idx) || idx >= symtab.length)
          return match;
        return symtab[idx] && symtab[idx] !== "" ? symtab[idx] : match;
      });
    }
    function resolve2(embedUrl) {
      return get2(embedUrl, { "Referer": "https://lamovie.cc/" }).then(function(html) {
        try {
          var packedMatch = html.match(/eval\(function\(p,a,c,k,e,[a-z]\)\{[\s\S]*?\}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*[']([\s\S]+?)[']\.split\([']\|[']\)/);
          if (!packedMatch)
            return null;
          var unpacked = unpack(packedMatch[1], parseInt(packedMatch[2]), packedMatch[4].split("|"));
          var streamMatch = unpacked.match(/["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/) || unpacked.match(/["'](\/[^"']+\.m3u8[^"']*)["']/) || unpacked.match(/file\s*:\s*["']([^"']+\.m3u8[^"']*)["']/);
          if (streamMatch) {
            var hlsLink = streamMatch[1];
            if (hlsLink.startsWith("/")) {
              var baseUrl = embedUrl.match(/^(https?:\/\/[^/]+)/)[1];
              hlsLink = baseUrl + hlsLink;
            }
            return {
              url: hlsLink,
              quality: "1080p",
              verified: true,
              headers: { "Referer": embedUrl, "User-Agent": UA2 }
            };
          }
        } catch (e) {
          console.log("[Packer] Error: " + e.message);
        }
        return null;
      });
    }
    module2.exports = { resolve: resolve2 };
  }
});

// src/utils/tplayer.js
var require_tplayer = __commonJS({
  "src/utils/tplayer.js"(exports2, module2) {
    var { get: get2 } = require_common();
    function resolve2(embedUrl) {
      const m = embedUrl.match(/\/embed\/([a-zA-Z0-9_-]+)/);
      if (!m)
        return Promise.resolve(null);
      const hash = m[1];
      const baseUrl = "https://tplayer.pelisgo.online";
      const resolveUrl = `${baseUrl}/api/resolve/${hash}`;
      return get2(resolveUrl, {
        "Referer": embedUrl
      }).then(function(data) {
        if (data && data.success && data.streamUrl) {
          const finalUrl = data.streamUrl.startsWith("http") ? data.streamUrl : `${baseUrl}${data.streamUrl}`;
          return {
            url: finalUrl,
            quality: "1080p",
            verified: true,
            headers: {
              "Referer": embedUrl,
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
          };
        }
        return null;
      }).catch(function(err) {
        console.log("[TPlayer] Error resolviendo:", err.message);
        return null;
      });
    }
    module2.exports = { resolve: resolve2 };
  }
});

// src/utils/gdrive.js
var require_gdrive = __commonJS({
  "src/utils/gdrive.js"(exports2, module2) {
    function resolve2(embedUrl) {
      const m = embedUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/) || embedUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (!m)
        return Promise.resolve(null);
      const fileId = m[1];
      const initialUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download`;
      return fetch(initialUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        redirect: "manual"
      }).then(function(res) {
        if (res.status === 303 || res.status === 302) {
          const loc = res.headers.get("location");
          if (loc)
            return loc;
        }
        return res.text().then(function(html) {
          const confirmMatch = html.match(/name="confirm"\s+value="([^"]+)"/i);
          const uuidMatch = html.match(/name="uuid"\s+value="([^"]+)"/i);
          if (confirmMatch && uuidMatch) {
            return `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=${confirmMatch[1]}&uuid=${uuidMatch[1]}`;
          }
          return initialUrl;
        });
      }).then(function(finalUrl) {
        return {
          url: finalUrl,
          quality: "4K",
          verified: true,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          }
        };
      }).catch(function(err) {
        console.log("[GDrive] Error resolviendo:", err.message);
        return null;
      });
    }
    module2.exports = { resolve: resolve2 };
  }
});

// src/utils/pixeldrain.js
var require_pixeldrain = __commonJS({
  "src/utils/pixeldrain.js"(exports2, module2) {
    function resolve2(embedUrl) {
      const m = embedUrl.match(/\/u\/([a-zA-Z0-9_-]+)/);
      if (!m)
        return Promise.resolve(null);
      const fileId = m[1];
      const directUrl = `https://pixeldrain.com/api/file/${fileId}`;
      return Promise.resolve({
        url: directUrl,
        quality: "1080p",
        verified: true,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
    }
    module2.exports = { resolve: resolve2 };
  }
});

// src/utils/keki.js
var require_keki = __commonJS({
  "src/utils/keki.js"(exports2, module2) {
    var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    var REFERER = "https://lulustream.com/";
    function unpack(payload, radix, symtab) {
      var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      var unbase = function(str) {
        var result = 0;
        for (var i = 0; i < str.length; i++) {
          var pos = chars.indexOf(str[i]);
          if (pos === -1)
            return NaN;
          result = result * radix + pos;
        }
        return result;
      };
      return payload.replace(/\b([0-9a-zA-Z]+)\b/g, function(match) {
        var idx = unbase(match);
        if (isNaN(idx) || idx >= symtab.length)
          return match;
        return symtab[idx] && symtab[idx] !== "" ? symtab[idx] : match;
      });
    }
    async function extractFromEmbed(embedUrl) {
      console.log(`[KeKi] Visitando embed: ${embedUrl}`);
      const res = await fetch(embedUrl, {
        headers: { "User-Agent": UA2, Referer: REFERER },
        redirect: "follow"
      });
      if (!res.ok)
        return null;
      const html = await res.text();
      const packedMatch = html.match(/eval\(function\(p,a,c,k,e,[a-z]\)\{[\s\S]*?\}\s*\('([\s\S]+?)',\s*(\d+),\s*\d+,\s*'([\s\S]+?)'\.split\('\|'\)/);
      if (packedMatch) {
        try {
          const unpacked = unpack(packedMatch[1], parseInt(packedMatch[2]), packedMatch[3].split("|"));
          console.log(`[KeKi] JS desofuscado, buscando m3u8...`);
          const streamMatch = unpacked.match(/["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/) || unpacked.match(/file\s*:\s*["']([^"']+\.m3u8[^"']*)["']/);
          if (streamMatch) {
            let hlsUrl = streamMatch[1];
            if (hlsUrl.startsWith("/")) {
              const base = embedUrl.match(/^(https?:\/\/[^/]+)/)[1];
              hlsUrl = base + hlsUrl;
            }
            console.log(`[KeKi] M3U8 fresco obtenido del embed \u2713`);
            return {
              url: hlsUrl,
              quality: "HD",
              headers: { "User-Agent": UA2, Referer: REFERER }
            };
          }
        } catch (e) {
          console.log(`[KeKi] Error desofuscando: ${e.message}`);
        }
      }
      const m3u8Match = html.match(/https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/i);
      if (m3u8Match) {
        return {
          url: m3u8Match[0],
          quality: "HD",
          headers: { "User-Agent": UA2, Referer: REFERER }
        };
      }
      const fileMatch = html.match(/file["']?\s*:\s*["']([^"']+)["']/i);
      if (fileMatch) {
        return {
          url: fileMatch[1],
          quality: "HD",
          headers: { "User-Agent": UA2, Referer: REFERER }
        };
      }
      return null;
    }
    async function resolve2(url) {
      try {
        console.log(`[KeKi] Resolviendo: ${url}`);
        if (url.match(/\/[ev]\//i)) {
          return await extractFromEmbed(url);
        }
        if (url.includes(".m3u8")) {
          const frMatch = url.match(/[?&]fr=([^&]+)/);
          if (frMatch) {
            const fileId = frMatch[1];
            const embedUrl = `https://luluvdo.com/e/${fileId}`;
            console.log(`[KeKi] URL CDN directa, obteniendo token fresco via embed: ${embedUrl}`);
            const result = await extractFromEmbed(embedUrl);
            if (result)
              return result;
          }
          return {
            url,
            quality: "HD",
            headers: { "User-Agent": UA2, Referer: REFERER }
          };
        }
        return await extractFromEmbed(url);
      } catch (err) {
        console.log(`[KeKi] Error: ${err.message}`);
        return null;
      }
    }
    module2.exports = { resolve: resolve2 };
  }
});

// src/utils/lulustream.js
var require_lulustream = __commonJS({
  "src/utils/lulustream.js"(exports2, module2) {
    var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    var REFERER = "https://lulustream.com/";
    function unpack(payload, radix, symtab) {
      var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      var unbase = function(str) {
        var result = 0;
        for (var i = 0; i < str.length; i++) {
          var pos = chars.indexOf(str[i]);
          if (pos === -1)
            return NaN;
          result = result * radix + pos;
        }
        return result;
      };
      return payload.replace(/\b([0-9a-zA-Z]+)\b/g, function(match) {
        var idx = unbase(match);
        if (isNaN(idx) || idx >= symtab.length)
          return match;
        return symtab[idx] && symtab[idx] !== "" ? symtab[idx] : match;
      });
    }
    async function extractFromEmbed(embedUrl) {
      console.log(`[Lulustream] Visitando embed: ${embedUrl}`);
      const res = await fetch(embedUrl, {
        headers: { "User-Agent": UA2, Referer: REFERER },
        redirect: "follow"
      });
      if (!res.ok)
        return null;
      const html = await res.text();
      const packedMatch = html.match(/eval\(function\(p,a,c,k,e,[a-z]\)\{[\s\S]*?\}\s*\('([\s\S]+?)',\s*(\d+),\s*\d+,\s*'([\s\S]+?)'\.split\('\|'\)/);
      if (packedMatch) {
        try {
          const unpacked = unpack(packedMatch[1], parseInt(packedMatch[2]), packedMatch[3].split("|"));
          console.log(`[Lulustream] JS desofuscado, buscando m3u8...`);
          const streamMatch = unpacked.match(/["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/) || unpacked.match(/file\s*:\s*["']([^"']+\.m3u8[^"']*)["']/);
          if (streamMatch) {
            let hlsUrl = streamMatch[1];
            if (hlsUrl.startsWith("/")) {
              const base = embedUrl.match(/^(https?:\/\/[^/]+)/)[1];
              hlsUrl = base + hlsUrl;
            }
            console.log(`[Lulustream] M3U8 fresco obtenido del embed \u2713`);
            return {
              url: hlsUrl,
              quality: "HD",
              headers: { "User-Agent": UA2, Referer: REFERER }
            };
          }
        } catch (e) {
          console.log(`[Lulustream] Error desofuscando: ${e.message}`);
        }
      }
      const m3u8Match = html.match(/https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/i);
      if (m3u8Match) {
        return {
          url: m3u8Match[0],
          quality: "HD",
          headers: { "User-Agent": UA2, Referer: REFERER }
        };
      }
      const fileMatch = html.match(/file["']?\s*:\s*["']([^"']+)["']/i);
      if (fileMatch) {
        return {
          url: fileMatch[1],
          quality: "HD",
          headers: { "User-Agent": UA2, Referer: REFERER }
        };
      }
      return null;
    }
    async function resolve2(url) {
      try {
        console.log(`[Lulustream] Resolviendo: ${url}`);
        if (url.match(/\/[ev]\//i)) {
          return await extractFromEmbed(url);
        }
        if (url.includes(".m3u8")) {
          const frMatch = url.match(/[?&]fr=([^&]+)/);
          if (frMatch) {
            const fileId = frMatch[1];
            const embedUrl = `https://luluvdo.com/e/${fileId}`;
            console.log(`[Lulustream] URL CDN directa, obteniendo token fresco via embed: ${embedUrl}`);
            const result = await extractFromEmbed(embedUrl);
            if (result)
              return result;
          }
          return {
            url,
            quality: "HD",
            headers: { "User-Agent": UA2, Referer: REFERER }
          };
        }
        return await extractFromEmbed(url);
      } catch (err) {
        console.log(`[Lulustream] Error: ${err.message}`);
        return null;
      }
    }
    module2.exports = { resolve: resolve2 };
  }
});

// src/utils/fastream.js
var require_fastream = __commonJS({
  "src/utils/fastream.js"(exports2, module2) {
    var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    function unpackPacker(data) {
      const match = data.match(/eval\(function\(p,a,c,k,e,d\)\{.*?\}\('([\s\S]*?)',(\d+),(\d+),'([\s\S]*?)'\.split\('\|'\)\)\)/);
      if (!match)
        return null;
      let [, p, a, c, k] = match;
      a = parseInt(a);
      c = parseInt(c);
      k = k.split("|");
      while (c--) {
        if (k[c])
          p = p.replace(new RegExp("\\b" + c.toString(a) + "\\b", "g"), k[c]);
      }
      return p;
    }
    async function detectQuality2(m3u8Url, headers = {}) {
      try {
        const res = await fetch(m3u8Url, { headers: { "User-Agent": UA2, ...headers }, redirect: "follow" });
        const data = await res.text();
        if (!data.includes("#EXT-X-STREAM-INF")) {
          const match = m3u8Url.match(/[_-](\d{3,4})p/);
          return match ? match[1] + "p" : "1080p";
        }
        let bestHeight = 0;
        for (const line of data.split("\n")) {
          const m = line.match(/RESOLUTION=\d+x(\d+)/);
          if (m) {
            const h = parseInt(m[1]);
            if (h > bestHeight)
              bestHeight = h;
          }
        }
        if (bestHeight >= 2160)
          return "4K";
        if (bestHeight >= 1080)
          return "1080p";
        if (bestHeight >= 720)
          return "720p";
        if (bestHeight >= 480)
          return "480p";
        return bestHeight > 0 ? bestHeight + "p" : "1080p";
      } catch (e) {
        return "1080p";
      }
    }
    async function resolve2(url) {
      try {
        const res = await fetch(url, {
          headers: { "User-Agent": UA2, "Referer": "https://www3.seriesmetro.net/" },
          redirect: "follow"
        });
        const data = await res.text();
        const unpacked = unpackPacker(data);
        if (!unpacked)
          return null;
        const m3u8 = unpacked.match(/file:"(https?:\/\/[^"]+\.m3u8[^"]*)"/);
        if (!m3u8)
          return null;
        const quality = await detectQuality2(m3u8[1], { "Referer": "https://fastream.to/" });
        return {
          url: m3u8[1],
          quality,
          headers: { "User-Agent": UA2, "Referer": "https://fastream.to/" }
        };
      } catch (e) {
        return null;
      }
    }
    module2.exports = { resolve: resolve2 };
  }
});

// src/utils/okru.js
var require_okru = __commonJS({
  "src/utils/okru.js"(exports2, module2) {
    var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
    async function resolve2(embedUrl) {
      try {
        console.log(`[OkRu] Resolviendo: ${embedUrl}`);
        const res = await fetch(embedUrl, {
          headers: { "User-Agent": UA2, "Accept": "text/html", "Referer": "https://ok.ru/" },
          redirect: "follow"
        });
        if (!res.ok)
          return null;
        let data = await res.text();
        if (data.includes("copyrightsRestricted") || data.includes("COPYRIGHTS_RESTRICTED") || data.includes("LIMITED_ACCESS") || data.includes("notFound") || !data.includes("urls")) {
          return null;
        }
        data = data.replace(/\\&quot;/g, '"').replace(/\\u0026/g, "&").replace(/\\/g, "");
        const matches = [...data.matchAll(/"name":"([^"]+)","url":"([^"]+)"/g)];
        const QUALITY_ORDER = ["full", "hd", "sd", "low", "lowest"];
        const videos = matches.map((m) => ({ type: m[1], url: m[2] })).filter((v) => !v.type.toLowerCase().includes("mobile") && v.url.startsWith("http"));
        if (videos.length === 0)
          return null;
        videos.sort((a, b) => {
          const ai = QUALITY_ORDER.findIndex((q) => a.type.toLowerCase().includes(q));
          const bi = QUALITY_ORDER.findIndex((q) => b.type.toLowerCase().includes(q));
          return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
        });
        return {
          url: videos[0].url,
          headers: { "User-Agent": UA2, "Referer": "https://ok.ru/" }
        };
      } catch (e) {
        return null;
      }
    }
    module2.exports = { resolve: resolve2 };
  }
});

// src/utils/buzzheavier.js
var require_buzzheavier = __commonJS({
  "src/utils/buzzheavier.js"(exports2, module2) {
    var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
    async function resolve2(url) {
      try {
        const cleanUrl = url.split("|")[0].replace(/\/$/, "");
        const domain = new URL(cleanUrl).hostname;
        const downloadUrl = cleanUrl + "/download";
        console.log(`[Buzzheavier] Resolviendo: ${cleanUrl}`);
        const headers = {
          "User-Agent": UA2,
          "Referer": cleanUrl,
          "hx-current-url": cleanUrl,
          "hx-request": "true",
          "Accept": "*/*"
        };
        const headRes = await fetch(downloadUrl, {
          method: "HEAD",
          headers,
          redirect: "manual"
        });
        const hxRedirect = headRes.headers.get("hx-redirect");
        if (hxRedirect) {
          let finalUrl = hxRedirect;
          if (hxRedirect.startsWith("/dl/"))
            finalUrl = "https://" + domain + hxRedirect;
          return {
            url: finalUrl + "#.mp4",
            isDirect: true,
            headers: {
              "User-Agent": UA2,
              "Referer": cleanUrl,
              "sec-ch-ua": '"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"',
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": '"Windows"',
              "sec-fetch-dest": "document",
              "sec-fetch-mode": "navigate",
              "sec-fetch-site": "cross-site",
              "upgrade-insecure-requests": "1"
            }
          };
        }
        const id = cleanUrl.split("/").pop();
        return {
          url: "https://buzzheavier.com/v/" + id + "/video.mp4#.mp4",
          isDirect: true,
          headers: { "User-Agent": UA2, "Referer": cleanUrl }
        };
      } catch (e) {
        return null;
      }
    }
    module2.exports = { resolve: resolve2 };
  }
});

// src/utils/turbovid.js
var require_turbovid = __commonJS({
  "src/utils/turbovid.js"(exports2, module2) {
    var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
    async function resolve2(embedUrl) {
      try {
        const res = await fetch(embedUrl, {
          headers: { "User-Agent": UA2, "Referer": "https://www.fuegocine.com/" },
          redirect: "follow"
        });
        if (!res.ok)
          return null;
        const html = await res.text();
        const hashMatch = html.match(/data-hash="([^"]+\.m3u8[^"]*)"/);
        if (hashMatch) {
          return {
            url: hashMatch[1],
            headers: { "Referer": embedUrl }
          };
        }
        return null;
      } catch (e) {
        return null;
      }
    }
    module2.exports = { resolve: resolve2 };
  }
});

// (disabled):crypto
var require_crypto = __commonJS({
  "(disabled):crypto"() {
  }
});

// node_modules/crypto-js/core.js
var require_core = __commonJS({
  "node_modules/crypto-js/core.js"(exports2, module2) {
    (function(root, factory) {
      if (typeof exports2 === "object") {
        module2.exports = exports2 = factory();
      } else if (typeof define === "function" && define.amd) {
        define([], factory);
      } else {
        root.CryptoJS = factory();
      }
    })(exports2, function() {
      var CryptoJS = CryptoJS || function(Math2, undefined2) {
        var crypto;
        if (typeof window !== "undefined" && window.crypto) {
          crypto = window.crypto;
        }
        if (typeof self !== "undefined" && self.crypto) {
          crypto = self.crypto;
        }
        if (typeof globalThis !== "undefined" && globalThis.crypto) {
          crypto = globalThis.crypto;
        }
        if (!crypto && typeof window !== "undefined" && window.msCrypto) {
          crypto = window.msCrypto;
        }
        if (!crypto && typeof global !== "undefined" && global.crypto) {
          crypto = global.crypto;
        }
        if (!crypto && typeof require === "function") {
          try {
            crypto = require_crypto();
          } catch (err) {
          }
        }
        var cryptoSecureRandomInt = function() {
          if (crypto) {
            if (typeof crypto.getRandomValues === "function") {
              try {
                return crypto.getRandomValues(new Uint32Array(1))[0];
              } catch (err) {
              }
            }
            if (typeof crypto.randomBytes === "function") {
              try {
                return crypto.randomBytes(4).readInt32LE();
              } catch (err) {
              }
            }
          }
          throw new Error("Native crypto module could not be used to get secure random number.");
        };
        var create = Object.create || /* @__PURE__ */ function() {
          function F() {
          }
          return function(obj) {
            var subtype;
            F.prototype = obj;
            subtype = new F();
            F.prototype = null;
            return subtype;
          };
        }();
        var C = {};
        var C_lib = C.lib = {};
        var Base = C_lib.Base = /* @__PURE__ */ function() {
          return {
            /**
             * Creates a new object that inherits from this object.
             *
             * @param {Object} overrides Properties to copy into the new object.
             *
             * @return {Object} The new object.
             *
             * @static
             *
             * @example
             *
             *     var MyType = CryptoJS.lib.Base.extend({
             *         field: 'value',
             *
             *         method: function () {
             *         }
             *     });
             */
            extend: function(overrides) {
              var subtype = create(this);
              if (overrides) {
                subtype.mixIn(overrides);
              }
              if (!subtype.hasOwnProperty("init") || this.init === subtype.init) {
                subtype.init = function() {
                  subtype.$super.init.apply(this, arguments);
                };
              }
              subtype.init.prototype = subtype;
              subtype.$super = this;
              return subtype;
            },
            /**
             * Extends this object and runs the init method.
             * Arguments to create() will be passed to init().
             *
             * @return {Object} The new object.
             *
             * @static
             *
             * @example
             *
             *     var instance = MyType.create();
             */
            create: function() {
              var instance = this.extend();
              instance.init.apply(instance, arguments);
              return instance;
            },
            /**
             * Initializes a newly created object.
             * Override this method to add some logic when your objects are created.
             *
             * @example
             *
             *     var MyType = CryptoJS.lib.Base.extend({
             *         init: function () {
             *             // ...
             *         }
             *     });
             */
            init: function() {
            },
            /**
             * Copies properties into this object.
             *
             * @param {Object} properties The properties to mix in.
             *
             * @example
             *
             *     MyType.mixIn({
             *         field: 'value'
             *     });
             */
            mixIn: function(properties) {
              for (var propertyName in properties) {
                if (properties.hasOwnProperty(propertyName)) {
                  this[propertyName] = properties[propertyName];
                }
              }
              if (properties.hasOwnProperty("toString")) {
                this.toString = properties.toString;
              }
            },
            /**
             * Creates a copy of this object.
             *
             * @return {Object} The clone.
             *
             * @example
             *
             *     var clone = instance.clone();
             */
            clone: function() {
              return this.init.prototype.extend(this);
            }
          };
        }();
        var WordArray = C_lib.WordArray = Base.extend({
          /**
           * Initializes a newly created word array.
           *
           * @param {Array} words (Optional) An array of 32-bit words.
           * @param {number} sigBytes (Optional) The number of significant bytes in the words.
           *
           * @example
           *
           *     var wordArray = CryptoJS.lib.WordArray.create();
           *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
           *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
           */
          init: function(words, sigBytes) {
            words = this.words = words || [];
            if (sigBytes != undefined2) {
              this.sigBytes = sigBytes;
            } else {
              this.sigBytes = words.length * 4;
            }
          },
          /**
           * Converts this word array to a string.
           *
           * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
           *
           * @return {string} The stringified word array.
           *
           * @example
           *
           *     var string = wordArray + '';
           *     var string = wordArray.toString();
           *     var string = wordArray.toString(CryptoJS.enc.Utf8);
           */
          toString: function(encoder) {
            return (encoder || Hex).stringify(this);
          },
          /**
           * Concatenates a word array to this word array.
           *
           * @param {WordArray} wordArray The word array to append.
           *
           * @return {WordArray} This word array.
           *
           * @example
           *
           *     wordArray1.concat(wordArray2);
           */
          concat: function(wordArray) {
            var thisWords = this.words;
            var thatWords = wordArray.words;
            var thisSigBytes = this.sigBytes;
            var thatSigBytes = wordArray.sigBytes;
            this.clamp();
            if (thisSigBytes % 4) {
              for (var i = 0; i < thatSigBytes; i++) {
                var thatByte = thatWords[i >>> 2] >>> 24 - i % 4 * 8 & 255;
                thisWords[thisSigBytes + i >>> 2] |= thatByte << 24 - (thisSigBytes + i) % 4 * 8;
              }
            } else {
              for (var j = 0; j < thatSigBytes; j += 4) {
                thisWords[thisSigBytes + j >>> 2] = thatWords[j >>> 2];
              }
            }
            this.sigBytes += thatSigBytes;
            return this;
          },
          /**
           * Removes insignificant bits.
           *
           * @example
           *
           *     wordArray.clamp();
           */
          clamp: function() {
            var words = this.words;
            var sigBytes = this.sigBytes;
            words[sigBytes >>> 2] &= 4294967295 << 32 - sigBytes % 4 * 8;
            words.length = Math2.ceil(sigBytes / 4);
          },
          /**
           * Creates a copy of this word array.
           *
           * @return {WordArray} The clone.
           *
           * @example
           *
           *     var clone = wordArray.clone();
           */
          clone: function() {
            var clone = Base.clone.call(this);
            clone.words = this.words.slice(0);
            return clone;
          },
          /**
           * Creates a word array filled with random bytes.
           *
           * @param {number} nBytes The number of random bytes to generate.
           *
           * @return {WordArray} The random word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.lib.WordArray.random(16);
           */
          random: function(nBytes) {
            var words = [];
            for (var i = 0; i < nBytes; i += 4) {
              words.push(cryptoSecureRandomInt());
            }
            return new WordArray.init(words, nBytes);
          }
        });
        var C_enc = C.enc = {};
        var Hex = C_enc.Hex = {
          /**
           * Converts a word array to a hex string.
           *
           * @param {WordArray} wordArray The word array.
           *
           * @return {string} The hex string.
           *
           * @static
           *
           * @example
           *
           *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
           */
          stringify: function(wordArray) {
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;
            var hexChars = [];
            for (var i = 0; i < sigBytes; i++) {
              var bite = words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
              hexChars.push((bite >>> 4).toString(16));
              hexChars.push((bite & 15).toString(16));
            }
            return hexChars.join("");
          },
          /**
           * Converts a hex string to a word array.
           *
           * @param {string} hexStr The hex string.
           *
           * @return {WordArray} The word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
           */
          parse: function(hexStr) {
            var hexStrLength = hexStr.length;
            var words = [];
            for (var i = 0; i < hexStrLength; i += 2) {
              words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << 24 - i % 8 * 4;
            }
            return new WordArray.init(words, hexStrLength / 2);
          }
        };
        var Latin1 = C_enc.Latin1 = {
          /**
           * Converts a word array to a Latin1 string.
           *
           * @param {WordArray} wordArray The word array.
           *
           * @return {string} The Latin1 string.
           *
           * @static
           *
           * @example
           *
           *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
           */
          stringify: function(wordArray) {
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;
            var latin1Chars = [];
            for (var i = 0; i < sigBytes; i++) {
              var bite = words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
              latin1Chars.push(String.fromCharCode(bite));
            }
            return latin1Chars.join("");
          },
          /**
           * Converts a Latin1 string to a word array.
           *
           * @param {string} latin1Str The Latin1 string.
           *
           * @return {WordArray} The word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
           */
          parse: function(latin1Str) {
            var latin1StrLength = latin1Str.length;
            var words = [];
            for (var i = 0; i < latin1StrLength; i++) {
              words[i >>> 2] |= (latin1Str.charCodeAt(i) & 255) << 24 - i % 4 * 8;
            }
            return new WordArray.init(words, latin1StrLength);
          }
        };
        var Utf8 = C_enc.Utf8 = {
          /**
           * Converts a word array to a UTF-8 string.
           *
           * @param {WordArray} wordArray The word array.
           *
           * @return {string} The UTF-8 string.
           *
           * @static
           *
           * @example
           *
           *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
           */
          stringify: function(wordArray) {
            try {
              return decodeURIComponent(escape(Latin1.stringify(wordArray)));
            } catch (e) {
              throw new Error("Malformed UTF-8 data");
            }
          },
          /**
           * Converts a UTF-8 string to a word array.
           *
           * @param {string} utf8Str The UTF-8 string.
           *
           * @return {WordArray} The word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
           */
          parse: function(utf8Str) {
            return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
          }
        };
        var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
          /**
           * Resets this block algorithm's data buffer to its initial state.
           *
           * @example
           *
           *     bufferedBlockAlgorithm.reset();
           */
          reset: function() {
            this._data = new WordArray.init();
            this._nDataBytes = 0;
          },
          /**
           * Adds new data to this block algorithm's buffer.
           *
           * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
           *
           * @example
           *
           *     bufferedBlockAlgorithm._append('data');
           *     bufferedBlockAlgorithm._append(wordArray);
           */
          _append: function(data) {
            if (typeof data == "string") {
              data = Utf8.parse(data);
            }
            this._data.concat(data);
            this._nDataBytes += data.sigBytes;
          },
          /**
           * Processes available data blocks.
           *
           * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
           *
           * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
           *
           * @return {WordArray} The processed data.
           *
           * @example
           *
           *     var processedData = bufferedBlockAlgorithm._process();
           *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
           */
          _process: function(doFlush) {
            var processedWords;
            var data = this._data;
            var dataWords = data.words;
            var dataSigBytes = data.sigBytes;
            var blockSize = this.blockSize;
            var blockSizeBytes = blockSize * 4;
            var nBlocksReady = dataSigBytes / blockSizeBytes;
            if (doFlush) {
              nBlocksReady = Math2.ceil(nBlocksReady);
            } else {
              nBlocksReady = Math2.max((nBlocksReady | 0) - this._minBufferSize, 0);
            }
            var nWordsReady = nBlocksReady * blockSize;
            var nBytesReady = Math2.min(nWordsReady * 4, dataSigBytes);
            if (nWordsReady) {
              for (var offset = 0; offset < nWordsReady; offset += blockSize) {
                this._doProcessBlock(dataWords, offset);
              }
              processedWords = dataWords.splice(0, nWordsReady);
              data.sigBytes -= nBytesReady;
            }
            return new WordArray.init(processedWords, nBytesReady);
          },
          /**
           * Creates a copy of this object.
           *
           * @return {Object} The clone.
           *
           * @example
           *
           *     var clone = bufferedBlockAlgorithm.clone();
           */
          clone: function() {
            var clone = Base.clone.call(this);
            clone._data = this._data.clone();
            return clone;
          },
          _minBufferSize: 0
        });
        var Hasher = C_lib.Hasher = BufferedBlockAlgorithm.extend({
          /**
           * Configuration options.
           */
          cfg: Base.extend(),
          /**
           * Initializes a newly created hasher.
           *
           * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
           *
           * @example
           *
           *     var hasher = CryptoJS.algo.SHA256.create();
           */
          init: function(cfg) {
            this.cfg = this.cfg.extend(cfg);
            this.reset();
          },
          /**
           * Resets this hasher to its initial state.
           *
           * @example
           *
           *     hasher.reset();
           */
          reset: function() {
            BufferedBlockAlgorithm.reset.call(this);
            this._doReset();
          },
          /**
           * Updates this hasher with a message.
           *
           * @param {WordArray|string} messageUpdate The message to append.
           *
           * @return {Hasher} This hasher.
           *
           * @example
           *
           *     hasher.update('message');
           *     hasher.update(wordArray);
           */
          update: function(messageUpdate) {
            this._append(messageUpdate);
            this._process();
            return this;
          },
          /**
           * Finalizes the hash computation.
           * Note that the finalize operation is effectively a destructive, read-once operation.
           *
           * @param {WordArray|string} messageUpdate (Optional) A final message update.
           *
           * @return {WordArray} The hash.
           *
           * @example
           *
           *     var hash = hasher.finalize();
           *     var hash = hasher.finalize('message');
           *     var hash = hasher.finalize(wordArray);
           */
          finalize: function(messageUpdate) {
            if (messageUpdate) {
              this._append(messageUpdate);
            }
            var hash = this._doFinalize();
            return hash;
          },
          blockSize: 512 / 32,
          /**
           * Creates a shortcut function to a hasher's object interface.
           *
           * @param {Hasher} hasher The hasher to create a helper for.
           *
           * @return {Function} The shortcut function.
           *
           * @static
           *
           * @example
           *
           *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
           */
          _createHelper: function(hasher) {
            return function(message, cfg) {
              return new hasher.init(cfg).finalize(message);
            };
          },
          /**
           * Creates a shortcut function to the HMAC's object interface.
           *
           * @param {Hasher} hasher The hasher to use in this HMAC helper.
           *
           * @return {Function} The shortcut function.
           *
           * @static
           *
           * @example
           *
           *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
           */
          _createHmacHelper: function(hasher) {
            return function(message, key) {
              return new C_algo.HMAC.init(hasher, key).finalize(message);
            };
          }
        });
        var C_algo = C.algo = {};
        return C;
      }(Math);
      return CryptoJS;
    });
  }
});

// node_modules/crypto-js/x64-core.js
var require_x64_core = __commonJS({
  "node_modules/crypto-js/x64-core.js"(exports2, module2) {
    (function(root, factory) {
      if (typeof exports2 === "object") {
        module2.exports = exports2 = factory(require_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports2, function(CryptoJS) {
      (function(undefined2) {
        var C = CryptoJS;
        var C_lib = C.lib;
        var Base = C_lib.Base;
        var X32WordArray = C_lib.WordArray;
        var C_x64 = C.x64 = {};
        var X64Word = C_x64.Word = Base.extend({
          /**
           * Initializes a newly created 64-bit word.
           *
           * @param {number} high The high 32 bits.
           * @param {number} low The low 32 bits.
           *
           * @example
           *
           *     var x64Word = CryptoJS.x64.Word.create(0x00010203, 0x04050607);
           */
          init: function(high, low) {
            this.high = high;
            this.low = low;
          }
          /**
           * Bitwise NOTs this word.
           *
           * @return {X64Word} A new x64-Word object after negating.
           *
           * @example
           *
           *     var negated = x64Word.not();
           */
          // not: function () {
          // var high = ~this.high;
          // var low = ~this.low;
          // return X64Word.create(high, low);
          // },
          /**
           * Bitwise ANDs this word with the passed word.
           *
           * @param {X64Word} word The x64-Word to AND with this word.
           *
           * @return {X64Word} A new x64-Word object after ANDing.
           *
           * @example
           *
           *     var anded = x64Word.and(anotherX64Word);
           */
          // and: function (word) {
          // var high = this.high & word.high;
          // var low = this.low & word.low;
          // return X64Word.create(high, low);
          // },
          /**
           * Bitwise ORs this word with the passed word.
           *
           * @param {X64Word} word The x64-Word to OR with this word.
           *
           * @return {X64Word} A new x64-Word object after ORing.
           *
           * @example
           *
           *     var ored = x64Word.or(anotherX64Word);
           */
          // or: function (word) {
          // var high = this.high | word.high;
          // var low = this.low | word.low;
          // return X64Word.create(high, low);
          // },
          /**
           * Bitwise XORs this word with the passed word.
           *
           * @param {X64Word} word The x64-Word to XOR with this word.
           *
           * @return {X64Word} A new x64-Word object after XORing.
           *
           * @example
           *
           *     var xored = x64Word.xor(anotherX64Word);
           */
          // xor: function (word) {
          // var high = this.high ^ word.high;
          // var low = this.low ^ word.low;
          // return X64Word.create(high, low);
          // },
          /**
           * Shifts this word n bits to the left.
           *
           * @param {number} n The number of bits to shift.
           *
           * @return {X64Word} A new x64-Word object after shifting.
           *
           * @example
           *
           *     var shifted = x64Word.shiftL(25);
           */
          // shiftL: function (n) {
          // if (n < 32) {
          // var high = (this.high << n) | (this.low >>> (32 - n));
          // var low = this.low << n;
          // } else {
          // var high = this.low << (n - 32);
          // var low = 0;
          // }
          // return X64Word.create(high, low);
          // },
          /**
           * Shifts this word n bits to the right.
           *
           * @param {number} n The number of bits to shift.
           *
           * @return {X64Word} A new x64-Word object after shifting.
           *
           * @example
           *
           *     var shifted = x64Word.shiftR(7);
           */
          // shiftR: function (n) {
          // if (n < 32) {
          // var low = (this.low >>> n) | (this.high << (32 - n));
          // var high = this.high >>> n;
          // } else {
          // var low = this.high >>> (n - 32);
          // var high = 0;
          // }
          // return X64Word.create(high, low);
          // },
          /**
           * Rotates this word n bits to the left.
           *
           * @param {number} n The number of bits to rotate.
           *
           * @return {X64Word} A new x64-Word object after rotating.
           *
           * @example
           *
           *     var rotated = x64Word.rotL(25);
           */
          // rotL: function (n) {
          // return this.shiftL(n).or(this.shiftR(64 - n));
          // },
          /**
           * Rotates this word n bits to the right.
           *
           * @param {number} n The number of bits to rotate.
           *
           * @return {X64Word} A new x64-Word object after rotating.
           *
           * @example
           *
           *     var rotated = x64Word.rotR(7);
           */
          // rotR: function (n) {
          // return this.shiftR(n).or(this.shiftL(64 - n));
          // },
          /**
           * Adds this word with the passed word.
           *
           * @param {X64Word} word The x64-Word to add with this word.
           *
           * @return {X64Word} A new x64-Word object after adding.
           *
           * @example
           *
           *     var added = x64Word.add(anotherX64Word);
           */
          // add: function (word) {
          // var low = (this.low + word.low) | 0;
          // var carry = (low >>> 0) < (this.low >>> 0) ? 1 : 0;
          // var high = (this.high + word.high + carry) | 0;
          // return X64Word.create(high, low);
          // }
        });
        var X64WordArray = C_x64.WordArray = Base.extend({
          /**
           * Initializes a newly created word array.
           *
           * @param {Array} words (Optional) An array of CryptoJS.x64.Word objects.
           * @param {number} sigBytes (Optional) The number of significant bytes in the words.
           *
           * @example
           *
           *     var wordArray = CryptoJS.x64.WordArray.create();
           *
           *     var wordArray = CryptoJS.x64.WordArray.create([
           *         CryptoJS.x64.Word.create(0x00010203, 0x04050607),
           *         CryptoJS.x64.Word.create(0x18191a1b, 0x1c1d1e1f)
           *     ]);
           *
           *     var wordArray = CryptoJS.x64.WordArray.create([
           *         CryptoJS.x64.Word.create(0x00010203, 0x04050607),
           *         CryptoJS.x64.Word.create(0x18191a1b, 0x1c1d1e1f)
           *     ], 10);
           */
          init: function(words, sigBytes) {
            words = this.words = words || [];
            if (sigBytes != undefined2) {
              this.sigBytes = sigBytes;
            } else {
              this.sigBytes = words.length * 8;
            }
          },
          /**
           * Converts this 64-bit word array to a 32-bit word array.
           *
           * @return {CryptoJS.lib.WordArray} This word array's data as a 32-bit word array.
           *
           * @example
           *
           *     var x32WordArray = x64WordArray.toX32();
           */
          toX32: function() {
            var x64Words = this.words;
            var x64WordsLength = x64Words.length;
            var x32Words = [];
            for (var i = 0; i < x64WordsLength; i++) {
              var x64Word = x64Words[i];
              x32Words.push(x64Word.high);
              x32Words.push(x64Word.low);
            }
            return X32WordArray.create(x32Words, this.sigBytes);
          },
          /**
           * Creates a copy of this word array.
           *
           * @return {X64WordArray} The clone.
           *
           * @example
           *
           *     var clone = x64WordArray.clone();
           */
          clone: function() {
            var clone = Base.clone.call(this);
            var words = clone.words = this.words.slice(0);
            var wordsLength = words.length;
            for (var i = 0; i < wordsLength; i++) {
              words[i] = words[i].clone();
            }
            return clone;
          }
        });
      })();
      return CryptoJS;
    });
  }
});

// node_modules/crypto-js/lib-typedarrays.js
var require_lib_typedarrays = __commonJS({
  "node_modules/crypto-js/lib-typedarrays.js"(exports2, module2) {
    (function(root, factory) {
      if (typeof exports2 === "object") {
        module2.exports = exports2 = factory(require_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports2, function(CryptoJS) {
      (function() {
        if (typeof ArrayBuffer != "function") {
          return;
        }
        var C = CryptoJS;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var superInit = WordArray.init;
        var subInit = WordArray.init = function(typedArray) {
          if (typedArray instanceof ArrayBuffer) {
            typedArray = new Uint8Array(typedArray);
          }
          if (typedArray instanceof Int8Array || typeof Uint8ClampedArray !== "undefined" && typedArray instanceof Uint8ClampedArray || typedArray instanceof Int16Array || typedArray instanceof Uint16Array || typedArray instanceof Int32Array || typedArray instanceof Uint32Array || typedArray instanceof Float32Array || typedArray instanceof Float64Array) {
            typedArray = new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength);
          }
          if (typedArray instanceof Uint8Array) {
            var typedArrayByteLength = typedArray.byteLength;
            var words = [];
            for (var i = 0; i < typedArrayByteLength; i++) {
              words[i >>> 2] |= typedArray[i] << 24 - i % 4 * 8;
            }
            superInit.call(this, words, typedArrayByteLength);
          } else {
            superInit.apply(this, arguments);
          }
        };
        subInit.prototype = WordArray;
      })();
      return CryptoJS.lib.WordArray;
    });
  }
});

// node_modules/crypto-js/enc-utf16.js
var require_enc_utf16 = __commonJS({
  "node_modules/crypto-js/enc-utf16.js"(exports2, module2) {
    (function(root, factory) {
      if (typeof exports2 === "object") {
        module2.exports = exports2 = factory(require_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports2, function(CryptoJS) {
      (function() {
        var C = CryptoJS;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var C_enc = C.enc;
        var Utf16BE = C_enc.Utf16 = C_enc.Utf16BE = {
          /**
           * Converts a word array to a UTF-16 BE string.
           *
           * @param {WordArray} wordArray The word array.
           *
           * @return {string} The UTF-16 BE string.
           *
           * @static
           *
           * @example
           *
           *     var utf16String = CryptoJS.enc.Utf16.stringify(wordArray);
           */
          stringify: function(wordArray) {
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;
            var utf16Chars = [];
            for (var i = 0; i < sigBytes; i += 2) {
              var codePoint = words[i >>> 2] >>> 16 - i % 4 * 8 & 65535;
              utf16Chars.push(String.fromCharCode(codePoint));
            }
            return utf16Chars.join("");
          },
          /**
           * Converts a UTF-16 BE string to a word array.
           *
           * @param {string} utf16Str The UTF-16 BE string.
           *
           * @return {WordArray} The word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.enc.Utf16.parse(utf16String);
           */
          parse: function(utf16Str) {
            var utf16StrLength = utf16Str.length;
            var words = [];
            for (var i = 0; i < utf16StrLength; i++) {
              words[i >>> 1] |= utf16Str.charCodeAt(i) << 16 - i % 2 * 16;
            }
            return WordArray.create(words, utf16StrLength * 2);
          }
        };
        C_enc.Utf16LE = {
          /**
           * Converts a word array to a UTF-16 LE string.
           *
           * @param {WordArray} wordArray The word array.
           *
           * @return {string} The UTF-16 LE string.
           *
           * @static
           *
           * @example
           *
           *     var utf16Str = CryptoJS.enc.Utf16LE.stringify(wordArray);
           */
          stringify: function(wordArray) {
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;
            var utf16Chars = [];
            for (var i = 0; i < sigBytes; i += 2) {
              var codePoint = swapEndian(words[i >>> 2] >>> 16 - i % 4 * 8 & 65535);
              utf16Chars.push(String.fromCharCode(codePoint));
            }
            return utf16Chars.join("");
          },
          /**
           * Converts a UTF-16 LE string to a word array.
           *
           * @param {string} utf16Str The UTF-16 LE string.
           *
           * @return {WordArray} The word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.enc.Utf16LE.parse(utf16Str);
           */
          parse: function(utf16Str) {
            var utf16StrLength = utf16Str.length;
            var words = [];
            for (var i = 0; i < utf16StrLength; i++) {
              words[i >>> 1] |= swapEndian(utf16Str.charCodeAt(i) << 16 - i % 2 * 16);
            }
            return WordArray.create(words, utf16StrLength * 2);
          }
        };
        function swapEndian(word) {
          return word << 8 & 4278255360 | word >>> 8 & 16711935;
        }
      })();
      return CryptoJS.enc.Utf16;
    });
  }
});

// node_modules/crypto-js/enc-base64.js
var require_enc_base64 = __commonJS({
  "node_modules/crypto-js/enc-base64.js"(exports2, module2) {
    (function(root, factory) {
      if (typeof exports2 === "object") {
        module2.exports = exports2 = factory(require_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports2, function(CryptoJS) {
      (function() {
        var C = CryptoJS;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var C_enc = C.enc;
        var Base64 = C_enc.Base64 = {
          /**
           * Converts a word array to a Base64 string.
           *
           * @param {WordArray} wordArray The word array.
           *
           * @return {string} The Base64 string.
           *
           * @static
           *
           * @example
           *
           *     var base64String = CryptoJS.enc.Base64.stringify(wordArray);
           */
          stringify: function(wordArray) {
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;
            var map = this._map;
            wordArray.clamp();
            var base64Chars = [];
            for (var i = 0; i < sigBytes; i += 3) {
              var byte1 = words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
              var byte2 = words[i + 1 >>> 2] >>> 24 - (i + 1) % 4 * 8 & 255;
              var byte3 = words[i + 2 >>> 2] >>> 24 - (i + 2) % 4 * 8 & 255;
              var triplet = byte1 << 16 | byte2 << 8 | byte3;
              for (var j = 0; j < 4 && i + j * 0.75 < sigBytes; j++) {
                base64Chars.push(map.charAt(triplet >>> 6 * (3 - j) & 63));
              }
            }
            var paddingChar = map.charAt(64);
            if (paddingChar) {
              while (base64Chars.length % 4) {
                base64Chars.push(paddingChar);
              }
            }
            return base64Chars.join("");
          },
          /**
           * Converts a Base64 string to a word array.
           *
           * @param {string} base64Str The Base64 string.
           *
           * @return {WordArray} The word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.enc.Base64.parse(base64String);
           */
          parse: function(base64Str) {
            var base64StrLength = base64Str.length;
            var map = this._map;
            var reverseMap = this._reverseMap;
            if (!reverseMap) {
              reverseMap = this._reverseMap = [];
              for (var j = 0; j < map.length; j++) {
                reverseMap[map.charCodeAt(j)] = j;
              }
            }
            var paddingChar = map.charAt(64);
            if (paddingChar) {
              var paddingIndex = base64Str.indexOf(paddingChar);
              if (paddingIndex !== -1) {
                base64StrLength = paddingIndex;
              }
            }
            return parseLoop(base64Str, base64StrLength, reverseMap);
          },
          _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
        };
        function parseLoop(base64Str, base64StrLength, reverseMap) {
          var words = [];
          var nBytes = 0;
          for (var i = 0; i < base64StrLength; i++) {
            if (i % 4) {
              var bits1 = reverseMap[base64Str.charCodeAt(i - 1)] << i % 4 * 2;
              var bits2 = reverseMap[base64Str.charCodeAt(i)] >>> 6 - i % 4 * 2;
              var bitsCombined = bits1 | bits2;
              words[nBytes >>> 2] |= bitsCombined << 24 - nBytes % 4 * 8;
              nBytes++;
            }
          }
          return WordArray.create(words, nBytes);
        }
      })();
      return CryptoJS.enc.Base64;
    });
  }
});

// node_modules/crypto-js/enc-base64url.js
var require_enc_base64url = __commonJS({
  "node_modules/crypto-js/enc-base64url.js"(exports2, module2) {
    (function(root, factory) {
      if (typeof exports2 === "object") {
        module2.exports = exports2 = factory(require_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports2, function(CryptoJS) {
      (function() {
        var C = CryptoJS;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var C_enc = C.enc;
        var Base64url = C_enc.Base64url = {
          /**
           * Converts a word array to a Base64url string.
           *
           * @param {WordArray} wordArray The word array.
           *
           * @param {boolean} urlSafe Whether to use url safe
           *
           * @return {string} The Base64url string.
           *
           * @static
           *
           * @example
           *
           *     var base64String = CryptoJS.enc.Base64url.stringify(wordArray);
           */
          stringify: function(wordArray, urlSafe) {
            if (urlSafe === void 0) {
              urlSafe = true;
            }
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;
            var map = urlSafe ? this._safe_map : this._map;
            wordArray.clamp();
            var base64Chars = [];
            for (var i = 0; i < sigBytes; i += 3) {
              var byte1 = words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
              var byte2 = words[i + 1 >>> 2] >>> 24 - (i + 1) % 4 * 8 & 255;
              var byte3 = words[i + 2 >>> 2] >>> 24 - (i + 2) % 4 * 8 & 255;
              var triplet = byte1 << 16 | byte2 << 8 | byte3;
              for (var j = 0; j < 4 && i + j * 0.75 < sigBytes; j++) {
                base64Chars.push(map.charAt(triplet >>> 6 * (3 - j) & 63));
              }
            }
            var paddingChar = map.charAt(64);
            if (paddingChar) {
              while (base64Chars.length % 4) {
                base64Chars.push(paddingChar);
              }
            }
            return base64Chars.join("");
          },
          /**
           * Converts a Base64url string to a word array.
           *
           * @param {string} base64Str The Base64url string.
           *
           * @param {boolean} urlSafe Whether to use url safe
           *
           * @return {WordArray} The word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.enc.Base64url.parse(base64String);
           */
          parse: function(base64Str, urlSafe) {
            if (urlSafe === void 0) {
              urlSafe = true;
            }
            var base64StrLength = base64Str.length;
            var map = urlSafe ? this._safe_map : this._map;
            var reverseMap = this._reverseMap;
            if (!reverseMap) {
              reverseMap = this._reverseMap = [];
              for (var j = 0; j < map.length; j++) {
                reverseMap[map.charCodeAt(j)] = j;
              }
            }
            var paddingChar = map.charAt(64);
            if (paddingChar) {
              var paddingIndex = base64Str.indexOf(paddingChar);
              if (paddingIndex !== -1) {
                base64StrLength = paddingIndex;
              }
            }
            return parseLoop(base64Str, base64StrLength, reverseMap);
          },
          _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
          _safe_map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
        };
        function parseLoop(base64Str, base64StrLength, reverseMap) {
          var words = [];
          var nBytes = 0;
          for (var i = 0; i < base64StrLength; i++) {
            if (i % 4) {
              var bits1 = reverseMap[base64Str.charCodeAt(i - 1)] << i % 4 * 2;
              var bits2 = reverseMap[base64Str.charCodeAt(i)] >>> 6 - i % 4 * 2;
              var bitsCombined = bits1 | bits2;
              words[nBytes >>> 2] |= bitsCombined << 24 - nBytes % 4 * 8;
              nBytes++;
            }
          }
          return WordArray.create(words, nBytes);
        }
      })();
      return CryptoJS.enc.Base64url;
    });
  }
});

// node_modules/crypto-js/md5.js
var require_md5 = __commonJS({
  "node_modules/crypto-js/md5.js"(exports2, module2) {
    (function(root, factory) {
      if (typeof exports2 === "object") {
        module2.exports = exports2 = factory(require_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports2, function(CryptoJS) {
      (function(Math2) {
        var C = CryptoJS;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var Hasher = C_lib.Hasher;
        var C_algo = C.algo;
        var T = [];
        (function() {
          for (var i = 0; i < 64; i++) {
            T[i] = Math2.abs(Math2.sin(i + 1)) * 4294967296 | 0;
          }
        })();
        var MD5 = C_algo.MD5 = Hasher.extend({
          _doReset: function() {
            this._hash = new WordArray.init([
              1732584193,
              4023233417,
              2562383102,
              271733878
            ]);
          },
          _doProcessBlock: function(M, offset) {
            for (var i = 0; i < 16; i++) {
              var offset_i = offset + i;
              var M_offset_i = M[offset_i];
              M[offset_i] = (M_offset_i << 8 | M_offset_i >>> 24) & 16711935 | (M_offset_i << 24 | M_offset_i >>> 8) & 4278255360;
            }
            var H = this._hash.words;
            var M_offset_0 = M[offset + 0];
            var M_offset_1 = M[offset + 1];
            var M_offset_2 = M[offset + 2];
            var M_offset_3 = M[offset + 3];
            var M_offset_4 = M[offset + 4];
            var M_offset_5 = M[offset + 5];
            var M_offset_6 = M[offset + 6];
            var M_offset_7 = M[offset + 7];
            var M_offset_8 = M[offset + 8];
            var M_offset_9 = M[offset + 9];
            var M_offset_10 = M[offset + 10];
            var M_offset_11 = M[offset + 11];
            var M_offset_12 = M[offset + 12];
            var M_offset_13 = M[offset + 13];
            var M_offset_14 = M[offset + 14];
            var M_offset_15 = M[offset + 15];
            var a = H[0];
            var b = H[1];
            var c = H[2];
            var d = H[3];
            a = FF(a, b, c, d, M_offset_0, 7, T[0]);
            d = FF(d, a, b, c, M_offset_1, 12, T[1]);
            c = FF(c, d, a, b, M_offset_2, 17, T[2]);
            b = FF(b, c, d, a, M_offset_3, 22, T[3]);
            a = FF(a, b, c, d, M_offset_4, 7, T[4]);
            d = FF(d, a, b, c, M_offset_5, 12, T[5]);
            c = FF(c, d, a, b, M_offset_6, 17, T[6]);
            b = FF(b, c, d, a, M_offset_7, 22, T[7]);
            a = FF(a, b, c, d, M_offset_8, 7, T[8]);
            d = FF(d, a, b, c, M_offset_9, 12, T[9]);
            c = FF(c, d, a, b, M_offset_10, 17, T[10]);
            b = FF(b, c, d, a, M_offset_11, 22, T[11]);
            a = FF(a, b, c, d, M_offset_12, 7, T[12]);
            d = FF(d, a, b, c, M_offset_13, 12, T[13]);
            c = FF(c, d, a, b, M_offset_14, 17, T[14]);
            b = FF(b, c, d, a, M_offset_15, 22, T[15]);
            a = GG(a, b, c, d, M_offset_1, 5, T[16]);
            d = GG(d, a, b, c, M_offset_6, 9, T[17]);
            c = GG(c, d, a, b, M_offset_11, 14, T[18]);
            b = GG(b, c, d, a, M_offset_0, 20, T[19]);
            a = GG(a, b, c, d, M_offset_5, 5, T[20]);
            d = GG(d, a, b, c, M_offset_10, 9, T[21]);
            c = GG(c, d, a, b, M_offset_15, 14, T[22]);
            b = GG(b, c, d, a, M_offset_4, 20, T[23]);
            a = GG(a, b, c, d, M_offset_9, 5, T[24]);
            d = GG(d, a, b, c, M_offset_14, 9, T[25]);
            c = GG(c, d, a, b, M_offset_3, 14, T[26]);
            b = GG(b, c, d, a, M_offset_8, 20, T[27]);
            a = GG(a, b, c, d, M_offset_13, 5, T[28]);
            d = GG(d, a, b, c, M_offset_2, 9, T[29]);
            c = GG(c, d, a, b, M_offset_7, 14, T[30]);
            b = GG(b, c, d, a, M_offset_12, 20, T[31]);
            a = HH(a, b, c, d, M_offset_5, 4, T[32]);
            d = HH(d, a, b, c, M_offset_8, 11, T[33]);
            c = HH(c, d, a, b, M_offset_11, 16, T[34]);
            b = HH(b, c, d, a, M_offset_14, 23, T[35]);
            a = HH(a, b, c, d, M_offset_1, 4, T[36]);
            d = HH(d, a, b, c, M_offset_4, 11, T[37]);
            c = HH(c, d, a, b, M_offset_7, 16, T[38]);
            b = HH(b, c, d, a, M_offset_10, 23, T[39]);
            a = HH(a, b, c, d, M_offset_13, 4, T[40]);
            d = HH(d, a, b, c, M_offset_0, 11, T[41]);
            c = HH(c, d, a, b, M_offset_3, 16, T[42]);
            b = HH(b, c, d, a, M_offset_6, 23, T[43]);
            a = HH(a, b, c, d, M_offset_9, 4, T[44]);
            d = HH(d, a, b, c, M_offset_12, 11, T[45]);
            c = HH(c, d, a, b, M_offset_15, 16, T[46]);
            b = HH(b, c, d, a, M_offset_2, 23, T[47]);
            a = II(a, b, c, d, M_offset_0, 6, T[48]);
            d = II(d, a, b, c, M_offset_7, 10, T[49]);
            c = II(c, d, a, b, M_offset_14, 15, T[50]);
            b = II(b, c, d, a, M_offset_5, 21, T[51]);
            a = II(a, b, c, d, M_offset_12, 6, T[52]);
            d = II(d, a, b, c, M_offset_3, 10, T[53]);
            c = II(c, d, a, b, M_offset_10, 15, T[54]);
            b = II(b, c, d, a, M_offset_1, 21, T[55]);
            a = II(a, b, c, d, M_offset_8, 6, T[56]);
            d = II(d, a, b, c, M_offset_15, 10, T[57]);
            c = II(c, d, a, b, M_offset_6, 15, T[58]);
            b = II(b, c, d, a, M_offset_13, 21, T[59]);
            a = II(a, b, c, d, M_offset_4, 6, T[60]);
            d = II(d, a, b, c, M_offset_11, 10, T[61]);
            c = II(c, d, a, b, M_offset_2, 15, T[62]);
            b = II(b, c, d, a, M_offset_9, 21, T[63]);
            H[0] = H[0] + a | 0;
            H[1] = H[1] + b | 0;
            H[2] = H[2] + c | 0;
            H[3] = H[3] + d | 0;
          },
          _doFinalize: function() {
            var data = this._data;
            var dataWords = data.words;
            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = data.sigBytes * 8;
            dataWords[nBitsLeft >>> 5] |= 128 << 24 - nBitsLeft % 32;
            var nBitsTotalH = Math2.floor(nBitsTotal / 4294967296);
            var nBitsTotalL = nBitsTotal;
            dataWords[(nBitsLeft + 64 >>> 9 << 4) + 15] = (nBitsTotalH << 8 | nBitsTotalH >>> 24) & 16711935 | (nBitsTotalH << 24 | nBitsTotalH >>> 8) & 4278255360;
            dataWords[(nBitsLeft + 64 >>> 9 << 4) + 14] = (nBitsTotalL << 8 | nBitsTotalL >>> 24) & 16711935 | (nBitsTotalL << 24 | nBitsTotalL >>> 8) & 4278255360;
            data.sigBytes = (dataWords.length + 1) * 4;
            this._process();
            var hash = this._hash;
            var H = hash.words;
            for (var i = 0; i < 4; i++) {
              var H_i = H[i];
              H[i] = (H_i << 8 | H_i >>> 24) & 16711935 | (H_i << 24 | H_i >>> 8) & 4278255360;
            }
            return hash;
          },
          clone: function() {
            var clone = Hasher.clone.call(this);
            clone._hash = this._hash.clone();
            return clone;
          }
        });
        function FF(a, b, c, d, x, s, t) {
          var n = a + (b & c | ~b & d) + x + t;
          return (n << s | n >>> 32 - s) + b;
        }
        function GG(a, b, c, d, x, s, t) {
          var n = a + (b & d | c & ~d) + x + t;
          return (n << s | n >>> 32 - s) + b;
        }
        function HH(a, b, c, d, x, s, t) {
          var n = a + (b ^ c ^ d) + x + t;
          return (n << s | n >>> 32 - s) + b;
        }
        function II(a, b, c, d, x, s, t) {
          var n = a + (c ^ (b | ~d)) + x + t;
          return (n << s | n >>> 32 - s) + b;
        }
        C.MD5 = Hasher._createHelper(MD5);
        C.HmacMD5 = Hasher._createHmacHelper(MD5);
      })(Math);
      return CryptoJS.MD5;
    });
  }
});

// node_modules/crypto-js/sha1.js
var require_sha1 = __commonJS({
  "node_modules/crypto-js/sha1.js"(exports2, module2) {
    (function(root, factory) {
      if (typeof exports2 === "object") {
        module2.exports = exports2 = factory(require_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports2, function(CryptoJS) {
      (function() {
        var C = CryptoJS;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var Hasher = C_lib.Hasher;
        var C_algo = C.algo;
        var W = [];
        var SHA1 = C_algo.SHA1 = Hasher.extend({
          _doReset: function() {
            this._hash = new WordArray.init([
              1732584193,
              4023233417,
              2562383102,
              271733878,
              3285377520
            ]);
          },
          _doProcessBlock: function(M, offset) {
            var H = this._hash.words;
            var a = H[0];
            var b = H[1];
            var c = H[2];
            var d = H[3];
            var e = H[4];
            for (var i = 0; i < 80; i++) {
              if (i < 16) {
                W[i] = M[offset + i] | 0;
              } else {
                var n = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
                W[i] = n << 1 | n >>> 31;
              }
              var t = (a << 5 | a >>> 27) + e + W[i];
              if (i < 20) {
                t += (b & c | ~b & d) + 1518500249;
              } else if (i < 40) {
                t += (b ^ c ^ d) + 1859775393;
              } else if (i < 60) {
                t += (b & c | b & d | c & d) - 1894007588;
              } else {
                t += (b ^ c ^ d) - 899497514;
              }
              e = d;
              d = c;
              c = b << 30 | b >>> 2;
              b = a;
              a = t;
            }
            H[0] = H[0] + a | 0;
            H[1] = H[1] + b | 0;
            H[2] = H[2] + c | 0;
            H[3] = H[3] + d | 0;
            H[4] = H[4] + e | 0;
          },
          _doFinalize: function() {
            var data = this._data;
            var dataWords = data.words;
            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = data.sigBytes * 8;
            dataWords[nBitsLeft >>> 5] |= 128 << 24 - nBitsLeft % 32;
            dataWords[(nBitsLeft + 64 >>> 9 << 4) + 14] = Math.floor(nBitsTotal / 4294967296);
            dataWords[(nBitsLeft + 64 >>> 9 << 4) + 15] = nBitsTotal;
            data.sigBytes = dataWords.length * 4;
            this._process();
            return this._hash;
          },
          clone: function() {
            var clone = Hasher.clone.call(this);
            clone._hash = this._hash.clone();
            return clone;
          }
        });
        C.SHA1 = Hasher._createHelper(SHA1);
        C.HmacSHA1 = Hasher._createHmacHelper(SHA1);
      })();
      return CryptoJS.SHA1;
    });
  }
});

// node_modules/crypto-js/sha256.js
var require_sha256 = __commonJS({
  "node_modules/crypto-js/sha256.js"(exports2, module2) {
    (function(root, factory) {
      if (typeof exports2 === "object") {
        module2.exports = exports2 = factory(require_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports2, function(CryptoJS) {
      (function(Math2) {
        var C = CryptoJS;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var Hasher = C_lib.Hasher;
        var C_algo = C.algo;
        var H = [];
        var K = [];
        (function() {
          function isPrime(n2) {
            var sqrtN = Math2.sqrt(n2);
            for (var factor = 2; factor <= sqrtN; factor++) {
              if (!(n2 % factor)) {
                return false;
              }
            }
            return true;
          }
          function getFractionalBits(n2) {
            return (n2 - (n2 | 0)) * 4294967296 | 0;
          }
          var n = 2;
          var nPrime = 0;
          while (nPrime < 64) {
            if (isPrime(n)) {
              if (nPrime < 8) {
                H[nPrime] = getFractionalBits(Math2.pow(n, 1 / 2));
              }
              K[nPrime] = getFractionalBits(Math2.pow(n, 1 / 3));
              nPrime++;
            }
            n++;
          }
        })();
        var W = [];
        var SHA256 = C_algo.SHA256 = Hasher.extend({
          _doReset: function() {
            this._hash = new WordArray.init(H.slice(0));
          },
          _doProcessBlock: function(M, offset) {
            var H2 = this._hash.words;
            var a = H2[0];
            var b = H2[1];
            var c = H2[2];
            var d = H2[3];
            var e = H2[4];
            var f = H2[5];
            var g = H2[6];
            var h = H2[7];
            for (var i = 0; i < 64; i++) {
              if (i < 16) {
                W[i] = M[offset + i] | 0;
              } else {
                var gamma0x = W[i - 15];
                var gamma0 = (gamma0x << 25 | gamma0x >>> 7) ^ (gamma0x << 14 | gamma0x >>> 18) ^ gamma0x >>> 3;
                var gamma1x = W[i - 2];
                var gamma1 = (gamma1x << 15 | gamma1x >>> 17) ^ (gamma1x << 13 | gamma1x >>> 19) ^ gamma1x >>> 10;
                W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16];
              }
              var ch = e & f ^ ~e & g;
              var maj = a & b ^ a & c ^ b & c;
              var sigma0 = (a << 30 | a >>> 2) ^ (a << 19 | a >>> 13) ^ (a << 10 | a >>> 22);
              var sigma1 = (e << 26 | e >>> 6) ^ (e << 21 | e >>> 11) ^ (e << 7 | e >>> 25);
              var t1 = h + sigma1 + ch + K[i] + W[i];
              var t2 = sigma0 + maj;
              h = g;
              g = f;
              f = e;
              e = d + t1 | 0;
              d = c;
              c = b;
              b = a;
              a = t1 + t2 | 0;
            }
            H2[0] = H2[0] + a | 0;
            H2[1] = H2[1] + b | 0;
            H2[2] = H2[2] + c | 0;
            H2[3] = H2[3] + d | 0;
            H2[4] = H2[4] + e | 0;
            H2[5] = H2[5] + f | 0;
            H2[6] = H2[6] + g | 0;
            H2[7] = H2[7] + h | 0;
          },
          _doFinalize: function() {
            var data = this._data;
            var dataWords = data.words;
            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = data.sigBytes * 8;
            dataWords[nBitsLeft >>> 5] |= 128 << 24 - nBitsLeft % 32;
            dataWords[(nBitsLeft + 64 >>> 9 << 4) + 14] = Math2.floor(nBitsTotal / 4294967296);
            dataWords[(nBitsLeft + 64 >>> 9 << 4) + 15] = nBitsTotal;
            data.sigBytes = dataWords.length * 4;
            this._process();
            return this._hash;
          },
          clone: function() {
            var clone = Hasher.clone.call(this);
            clone._hash = this._hash.clone();
            return clone;
          }
        });
        C.SHA256 = Hasher._createHelper(SHA256);
        C.HmacSHA256 = Hasher._createHmacHelper(SHA256);
      })(Math);
      return CryptoJS.SHA256;
    });
  }
});

// node_modules/crypto-js/sha224.js
var require_sha224 = __commonJS({
  "node_modules/crypto-js/sha224.js"(exports2, module2) {
    (function(root, factory, undef) {
      if (typeof exports2 === "object") {
        module2.exports = exports2 = factory(require_core(), require_sha256());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./sha256"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports2, function(CryptoJS) {
      (function() {
        var C = CryptoJS;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var C_algo = C.algo;
        var SHA256 = C_algo.SHA256;
        var SHA224 = C_algo.SHA224 = SHA256.extend({
          _doReset: function() {
            this._hash = new WordArray.init([
              3238371032,
              914150663,
              812702999,
              4144912697,
              4290775857,
              1750603025,
              1694076839,
              3204075428
            ]);
          },
          _doFinalize: function() {
            var hash = SHA256._doFinalize.call(this);
            hash.sigBytes -= 4;
            return hash;
          }
        });
        C.SHA224 = SHA256._createHelper(SHA224);
        C.HmacSHA224 = SHA256._createHmacHelper(SHA224);
      })();
      return CryptoJS.SHA224;
    });
  }
});

// node_modules/crypto-js/sha512.js
var require_sha512 = __commonJS({
  "node_modules/crypto-js/sha512.js"(exports2, module2) {
    (function(root, factory, undef) {
      if (typeof exports2 === "object") {
        module2.exports = exports2 = factory(require_core(), require_x64_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./x64-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports2, function(CryptoJS) {
      (function() {
        var C = CryptoJS;
        var C_lib = C.lib;
        var Hasher = C_lib.Hasher;
        var C_x64 = C.x64;
        var X64Word = C_x64.Word;
        var X64WordArray = C_x64.WordArray;
        var C_algo = C.algo;
        function X64Word_create() {
          return X64Word.create.apply(X64Word, arguments);
        }
        var K = [
          X64Word_create(1116352408, 3609767458),
          X64Word_create(1899447441, 602891725),
          X64Word_create(3049323471, 3964484399),
          X64Word_create(3921009573, 2173295548),
          X64Word_create(961987163, 4081628472),
          X64Word_create(1508970993, 3053834265),
          X64Word_create(2453635748, 2937671579),
          X64Word_create(2870763221, 3664609560),
          X64Word_create(3624381080, 2734883394),
          X64Word_create(310598401, 1164996542),
          X64Word_create(607225278, 1323610764),
          X64Word_create(1426881987, 3590304994),
          X64Word_create(1925078388, 4068182383),
          X64Word_create(2162078206, 991336113),
          X64Word_create(2614888103, 633803317),
          X64Word_create(3248222580, 3479774868),
          X64Word_create(3835390401, 2666613458),
          X64Word_create(4022224774, 944711139),
          X64Word_create(264347078, 2341262773),
          X64Word_create(604807628, 2007800933),
          X64Word_create(770255983, 1495990901),
          X64Word_create(1249150122, 1856431235),
          X64Word_create(1555081692, 3175218132),
          X64Word_create(1996064986, 2198950837),
          X64Word_create(2554220882, 3999719339),
          X64Word_create(2821834349, 766784016),
          X64Word_create(2952996808, 2566594879),
          X64Word_create(3210313671, 3203337956),
          X64Word_create(3336571891, 1034457026),
          X64Word_create(3584528711, 2466948901),
          X64Word_create(113926993, 3758326383),
          X64Word_create(338241895, 168717936),
          X64Word_create(666307205, 1188179964),
          X64Word_create(773529912, 1546045734),
          X64Word_create(1294757372, 1522805485),
          X64Word_create(1396182291, 2643833823),
          X64Word_create(1695183700, 2343527390),
          X64Word_create(1986661051, 1014477480),
          X64Word_create(2177026350, 1206759142),
          X64Word_create(2456956037, 344077627),
          X64Word_create(2730485921, 1290863460),
          X64Word_create(2820302411, 3158454273),
          X64Word_create(3259730800, 3505952657),
          X64Word_create(3345764771, 106217008),
          X64Word_create(3516065817, 3606008344),
          X64Word_create(3600352804, 1432725776),
          X64Word_create(4094571909, 1467031594),
          X64Word_create(275423344, 851169720),
          X64Word_create(430227734, 3100823752),
          X64Word_create(506948616, 1363258195),
          X64Word_create(659060556, 3750685593),
          X64Word_create(883997877, 3785050280),
          X64Word_create(958139571, 3318307427),
          X64Word_create(1322822218, 3812723403),
          X64Word_create(1537002063, 2003034995),
          X64Word_create(1747873779, 3602036899),
          X64Word_create(1955562222, 1575990012),
          X64Word_create(2024104815, 1125592928),
          X64Word_create(2227730452, 2716904306),
          X64Word_create(2361852424, 442776044),
          X64Word_create(2428436474, 593698344),
          X64Word_create(2756734187, 3733110249),
          X64Word_create(3204031479, 2999351573),
          X64Word_create(3329325298, 3815920427),
          X64Word_create(3391569614, 3928383900),
          X64Word_create(3515267271, 566280711),
          X64Word_create(3940187606, 3454069534),
          X64Word_create(4118630271, 4000239992),
          X64Word_create(116418474, 1914138554),
          X64Word_create(174292421, 2731055270),
          X64Word_create(289380356, 3203993006),
          X64Word_create(460393269, 320620315),
          X64Word_create(685471733, 587496836),
          X64Word_create(852142971, 1086792851),
          X64Word_create(1017036298, 365543100),
          X64Word_create(1126000580, 2618297676),
          X64Word_create(1288033470, 3409855158),
          X64Word_create(1501505948, 4234509866),
          X64Word_create(1607167915, 987167468),
          X64Word_create(1816402316, 1246189591)
        ];
        var W = [];
        (function() {
          for (var i = 0; i < 80; i++) {
            W[i] = X64Word_create();
          }
        })();
        var SHA512 = C_algo.SHA512 = Hasher.extend({
          _doReset: function() {
            this._hash = new X64WordArray.init([
              new X64Word.init(1779033703, 4089235720),
              new X64Word.init(3144134277, 2227873595),
              new X64Word.init(1013904242, 4271175723),
              new X64Word.init(2773480762, 1595750129),
              new X64Word.init(1359893119, 2917565137),
              new X64Word.init(2600822924, 725511199),
              new X64Word.init(528734635, 4215389547),
              new X64Word.init(1541459225, 327033209)
            ]);
          },
          _doProcessBlock: function(M, offset) {
            var H = this._hash.words;
            var H0 = H[0];
            var H1 = H[1];
            var H2 = H[2];
            var H3 = H[3];
            var H4 = H[4];
            var H5 = H[5];
            var H6 = H[6];
            var H7 = H[7];
            var H0h = H0.high;
            var H0l = H0.low;
            var H1h = H1.high;
            var H1l = H1.low;
            var H2h = H2.high;
            var H2l = H2.low;
            var H3h = H3.high;
            var H3l = H3.low;
            var H4h = H4.high;
            var H4l = H4.low;
            var H5h = H5.high;
            var H5l = H5.low;
            var H6h = H6.high;
            var H6l = H6.low;
            var H7h = H7.high;
            var H7l = H7.low;
            var ah = H0h;
            var al = H0l;
            var bh = H1h;
            var bl = H1l;
            var ch = H2h;
            var cl = H2l;
            var dh = H3h;
            var dl = H3l;
            var eh = H4h;
            var el = H4l;
            var fh = H5h;
            var fl = H5l;
            var gh = H6h;
            var gl = H6l;
            var hh = H7h;
            var hl = H7l;
            for (var i = 0; i < 80; i++) {
              var Wil;
              var Wih;
              var Wi = W[i];
              if (i < 16) {
                Wih = Wi.high = M[offset + i * 2] | 0;
                Wil = Wi.low = M[offset + i * 2 + 1] | 0;
              } else {
                var gamma0x = W[i - 15];
                var gamma0xh = gamma0x.high;
                var gamma0xl = gamma0x.low;
                var gamma0h = (gamma0xh >>> 1 | gamma0xl << 31) ^ (gamma0xh >>> 8 | gamma0xl << 24) ^ gamma0xh >>> 7;
                var gamma0l = (gamma0xl >>> 1 | gamma0xh << 31) ^ (gamma0xl >>> 8 | gamma0xh << 24) ^ (gamma0xl >>> 7 | gamma0xh << 25);
                var gamma1x = W[i - 2];
                var gamma1xh = gamma1x.high;
                var gamma1xl = gamma1x.low;
                var gamma1h = (gamma1xh >>> 19 | gamma1xl << 13) ^ (gamma1xh << 3 | gamma1xl >>> 29) ^ gamma1xh >>> 6;
                var gamma1l = (gamma1xl >>> 19 | gamma1xh << 13) ^ (gamma1xl << 3 | gamma1xh >>> 29) ^ (gamma1xl >>> 6 | gamma1xh << 26);
                var Wi7 = W[i - 7];
                var Wi7h = Wi7.high;
                var Wi7l = Wi7.low;
                var Wi16 = W[i - 16];
                var Wi16h = Wi16.high;
                var Wi16l = Wi16.low;
                Wil = gamma0l + Wi7l;
                Wih = gamma0h + Wi7h + (Wil >>> 0 < gamma0l >>> 0 ? 1 : 0);
                Wil = Wil + gamma1l;
                Wih = Wih + gamma1h + (Wil >>> 0 < gamma1l >>> 0 ? 1 : 0);
                Wil = Wil + Wi16l;
                Wih = Wih + Wi16h + (Wil >>> 0 < Wi16l >>> 0 ? 1 : 0);
                Wi.high = Wih;
                Wi.low = Wil;
              }
              var chh = eh & fh ^ ~eh & gh;
              var chl = el & fl ^ ~el & gl;
              var majh = ah & bh ^ ah & ch ^ bh & ch;
              var majl = al & bl ^ al & cl ^ bl & cl;
              var sigma0h = (ah >>> 28 | al << 4) ^ (ah << 30 | al >>> 2) ^ (ah << 25 | al >>> 7);
              var sigma0l = (al >>> 28 | ah << 4) ^ (al << 30 | ah >>> 2) ^ (al << 25 | ah >>> 7);
              var sigma1h = (eh >>> 14 | el << 18) ^ (eh >>> 18 | el << 14) ^ (eh << 23 | el >>> 9);
              var sigma1l = (el >>> 14 | eh << 18) ^ (el >>> 18 | eh << 14) ^ (el << 23 | eh >>> 9);
              var Ki = K[i];
              var Kih = Ki.high;
              var Kil = Ki.low;
              var t1l = hl + sigma1l;
              var t1h = hh + sigma1h + (t1l >>> 0 < hl >>> 0 ? 1 : 0);
              var t1l = t1l + chl;
              var t1h = t1h + chh + (t1l >>> 0 < chl >>> 0 ? 1 : 0);
              var t1l = t1l + Kil;
              var t1h = t1h + Kih + (t1l >>> 0 < Kil >>> 0 ? 1 : 0);
              var t1l = t1l + Wil;
              var t1h = t1h + Wih + (t1l >>> 0 < Wil >>> 0 ? 1 : 0);
              var t2l = sigma0l + majl;
              var t2h = sigma0h + majh + (t2l >>> 0 < sigma0l >>> 0 ? 1 : 0);
              hh = gh;
              hl = gl;
              gh = fh;
              gl = fl;
              fh = eh;
              fl = el;
              el = dl + t1l | 0;
              eh = dh + t1h + (el >>> 0 < dl >>> 0 ? 1 : 0) | 0;
              dh = ch;
              dl = cl;
              ch = bh;
              cl = bl;
              bh = ah;
              bl = al;
              al = t1l + t2l | 0;
              ah = t1h + t2h + (al >>> 0 < t1l >>> 0 ? 1 : 0) | 0;
            }
            H0l = H0.low = H0l + al;
            H0.high = H0h + ah + (H0l >>> 0 < al >>> 0 ? 1 : 0);
            H1l = H1.low = H1l + bl;
            H1.high = H1h + bh + (H1l >>> 0 < bl >>> 0 ? 1 : 0);
            H2l = H2.low = H2l + cl;
            H2.high = H2h + ch + (H2l >>> 0 < cl >>> 0 ? 1 : 0);
            H3l = H3.low = H3l + dl;
            H3.high = H3h + dh + (H3l >>> 0 < dl >>> 0 ? 1 : 0);
            H4l = H4.low = H4l + el;
            H4.high = H4h + eh + (H4l >>> 0 < el >>> 0 ? 1 : 0);
            H5l = H5.low = H5l + fl;
            H5.high = H5h + fh + (H5l >>> 0 < fl >>> 0 ? 1 : 0);
            H6l = H6.low = H6l + gl;
            H6.high = H6h + gh + (H6l >>> 0 < gl >>> 0 ? 1 : 0);
            H7l = H7.low = H7l + hl;
            H7.high = H7h + hh + (H7l >>> 0 < hl >>> 0 ? 1 : 0);
          },
          _doFinalize: function() {
            var data = this._data;
            var dataWords = data.words;
            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = data.sigBytes * 8;
            dataWords[nBitsLeft >>> 5] |= 128 << 24 - nBitsLeft % 32;
            dataWords[(nBitsLeft + 128 >>> 10 << 5) + 30] = Math.floor(nBitsTotal / 4294967296);
            dataWords[(nBitsLeft + 128 >>> 10 << 5) + 31] = nBitsTotal;
            data.sigBytes = dataWords.length * 4;
            this._process();
            var hash = this._hash.toX32();
            return hash;
          },
          clone: function() {
            var clone = Hasher.clone.call(this);
            clone._hash = this._hash.clone();
            return clone;
          },
          blockSize: 1024 / 32
        });
        C.SHA512 = Hasher._createHelper(SHA512);
        C.HmacSHA512 = Hasher._createHmacHelper(SHA512);
      })();
      return CryptoJS.SHA512;
    });
  }
});

// node_modules/crypto-js/sha384.js
var require_sha384 = __commonJS({
  "node_modules/crypto-js/sha384.js"(exports2, module2) {
    (function(root, factory, undef) {
      if (typeof exports2 === "object") {
        module2.exports = exports2 = factory(require_core(), require_x64_core(), require_sha512());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./x64-core", "./sha512"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports2, function(CryptoJS) {
      (function() {
        var C = CryptoJS;
        var C_x64 = C.x64;
        var X64Word = C_x64.Word;
        var X64WordArray = C_x64.WordArray;
        var C_algo = C.algo;
        var SHA512 = C_algo.SHA512;
        var SHA384 = C_algo.SHA384 = SHA512.extend({
          _doReset: function() {
            this._hash = new X64WordArray.init([
              new X64Word.init(3418070365, 3238371032),
              new X64Word.init(1654270250, 914150663),
              new X64Word.init(2438529370, 812702999),
              new X64Word.init(355462360, 4144912697),
              new X64Word.init(1731405415, 4290775857),
              new X64Word.init(2394180231, 1750603025),
              new X64Word.init(3675008525, 1694076839),
              new X64Word.init(1203062813, 3204075428)
            ]);
          },
          _doFinalize: function() {
            var hash = SHA512._doFinalize.call(this);
            hash.sigBytes -= 16;
            return hash;
          }
        });
        C.SHA384 = SHA512._createHelper(SHA384);
        C.HmacSHA384 = SHA512._createHmacHelper(SHA384);
      })();
      return CryptoJS.SHA384;
    });
  }
});

// node_modules/crypto-js/sha3.js
var require_sha3 = __commonJS({
  "node_modules/crypto-js/sha3.js"(exports2, module2) {
    (function(root, factory, undef) {
      if (typeof exports2 === "object") {
        module2.exports = exports2 = factory(require_core(), require_x64_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./x64-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports2, function(CryptoJS) {
      (function(Math2) {
        var C = CryptoJS;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var Hasher = C_lib.Hasher;
        var C_x64 = C.x64;
        var X64Word = C_x64.Word;
        var C_algo = C.algo;
        var RHO_OFFSETS = [];
        var PI_INDEXES = [];
        var ROUND_CONSTANTS = [];
        (function() {
          var x = 1, y = 0;
          for (var t = 0; t < 24; t++) {
            RHO_OFFSETS[x + 5 * y] = (t + 1) * (t + 2) / 2 % 64;
            var newX = y % 5;
            var newY = (2 * x + 3 * y) % 5;
            x = newX;
            y = newY;
          }
          for (var x = 0; x < 5; x++) {
            for (var y = 0; y < 5; y++) {
              PI_INDEXES[x + 5 * y] = y + (2 * x + 3 * y) % 5 * 5;
            }
          }
          var LFSR = 1;
          for (var i = 0; i < 24; i++) {
            var roundConstantMsw = 0;
            var roundConstantLsw = 0;
            for (var j = 0; j < 7; j++) {
              if (LFSR & 1) {
                var bitPosition = (1 << j) - 1;
                if (bitPosition < 32) {
                  roundConstantLsw ^= 1 << bitPosition;
                } else {
                  roundConstantMsw ^= 1 << bitPosition - 32;
                }
              }
              if (LFSR & 128) {
                LFSR = LFSR << 1 ^ 113;
              } else {
                LFSR <<= 1;
              }
            }
            ROUND_CONSTANTS[i] = X64Word.create(roundConstantMsw, roundConstantLsw);
          }
        })();
        var T = [];
        (function() {
          for (var i = 0; i < 25; i++) {
            T[i] = X64Word.create();
          }
        })();
        var SHA3 = C_algo.SHA3 = Hasher.extend({
          /**
           * Configuration options.
           *
           * @property {number} outputLength
           *   The desired number of bits in the output hash.
           *   Only values permitted are: 224, 256, 384, 512.
           *   Default: 512
           */
          cfg: Hasher.cfg.extend({
            outputLength: 512
          }),
          _doReset: function() {
            var state = this._state = [];
            for (var i = 0; i < 25; i++) {
              state[i] = new X64Word.init();
            }
            this.blockSize = (1600 - 2 * this.cfg.outputLength) / 32;
          },
          _doProcessBlock: function(M, offset) {
            var state = this._state;
            var nBlockSizeLanes = this.blockSize / 2;
            for (var i = 0; i < nBlockSizeLanes; i++) {
              var M2i = M[offset + 2 * i];
              var M2i1 = M[offset + 2 * i + 1];
              M2i = (M2i << 8 | M2i >>> 24) & 16711935 | (M2i << 24 | M2i >>> 8) & 4278255360;
              M2i1 = (M2i1 << 8 | M2i1 >>> 24) & 16711935 | (M2i1 << 24 | M2i1 >>> 8) & 4278255360;
              var lane = state[i];
              lane.high ^= M2i1;
              lane.low ^= M2i;
            }
            for (var round = 0; round < 24; round++) {
              for (var x = 0; x < 5; x++) {
                var tMsw = 0, tLsw = 0;
                for (var y = 0; y < 5; y++) {
                  var lane = state[x + 5 * y];
                  tMsw ^= lane.high;
                  tLsw ^= lane.low;
                }
                var Tx = T[x];
                Tx.high = tMsw;
                Tx.low = tLsw;
              }
              for (var x = 0; x < 5; x++) {
                var Tx4 = T[(x + 4) % 5];
                var Tx1 = T[(x + 1) % 5];
                var Tx1Msw = Tx1.high;
                var Tx1Lsw = Tx1.low;
                var tMsw = Tx4.high ^ (Tx1Msw << 1 | Tx1Lsw >>> 31);
                var tLsw = Tx4.low ^ (Tx1Lsw << 1 | Tx1Msw >>> 31);
                for (var y = 0; y < 5; y++) {
                  var lane = state[x + 5 * y];
                  lane.high ^= tMsw;
                  lane.low ^= tLsw;
                }
              }
              for (var laneIndex = 1; laneIndex < 25; laneIndex++) {
                var tMsw;
                var tLsw;
                var lane = state[laneIndex];
                var laneMsw = lane.high;
                var laneLsw = lane.low;
                var rhoOffset = RHO_OFFSETS[laneIndex];
                if (rhoOffset < 32) {
                  tMsw = laneMsw << rhoOffset | laneLsw >>> 32 - rhoOffset;
                  tLsw = laneLsw << rhoOffset | laneMsw >>> 32 - rhoOffset;
                } else {
                  tMsw = laneLsw << rhoOffset - 32 | laneMsw >>> 64 - rhoOffset;
                  tLsw = laneMsw << rhoOffset - 32 | laneLsw >>> 64 - rhoOffset;
                }
                var TPiLane = T[PI_INDEXES[laneIndex]];
                TPiLane.high = tMsw;
                TPiLane.low = tLsw;
              }
              var T0 = T[0];
              var state0 = state[0];
              T0.high = state0.high;
              T0.low = state0.low;
              for (var x = 0; x < 5; x++) {
                for (var y = 0; y < 5; y++) {
                  var laneIndex = x + 5 * y;
                  var lane = state[laneIndex];
                  var TLane = T[laneIndex];
                  var Tx1Lane = T[(x + 1) % 5 + 5 * y];
                  var Tx2Lane = T[(x + 2) % 5 + 5 * y];
                  lane.high = TLane.high ^ ~Tx1Lane.high & Tx2Lane.high;
                  lane.low = TLane.low ^ ~Tx1Lane.low & Tx2Lane.low;
                }
              }
              var lane = state[0];
              var roundConstant = ROUND_CONSTANTS[round];
              lane.high ^= roundConstant.high;
              lane.low ^= roundConstant.low;
            }
          },
          _doFinalize: function() {
            var data = this._data;
            var dataWords = data.words;
            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = data.sigBytes * 8;
            var blockSizeBits = this.blockSize * 32;
            dataWords[nBitsLeft >>> 5] |= 1 << 24 - nBitsLeft % 32;
            dataWords[(Math2.ceil((nBitsLeft + 1) / blockSizeBits) * blockSizeBits >>> 5) - 1] |= 128;
            data.sigBytes = dataWords.length * 4;
            this._process();
            var state = this._state;
            var outputLengthBytes = this.cfg.outputLength / 8;
            var outputLengthLanes = outputLengthBytes / 8;
            var hashWords = [];
            for (var i = 0; i < outputLengthLanes; i++) {
              var lane = state[i];
              var laneMsw = lane.high;
              var laneLsw = lane.low;
              laneMsw = (laneMsw << 8 | laneMsw >>> 24) & 16711935 | (laneMsw << 24 | laneMsw >>> 8) & 4278255360;
              laneLsw = (laneLsw << 8 | laneLsw >>> 24) & 16711935 | (laneLsw << 24 | laneLsw >>> 8) & 4278255360;
              hashWords.push(laneLsw);
              hashWords.push(laneMsw);
            }
            return new WordArray.init(hashWords, outputLengthBytes);
          },
          clone: function() {
            var clone = Hasher.clone.call(this);
            var state = clone._state = this._state.slice(0);
            for (var i = 0; i < 25; i++) {
              state[i] = state[i].clone();
            }
            return clone;
          }
        });
        C.SHA3 = Hasher._createHelper(SHA3);
        C.HmacSHA3 = Hasher._createHmacHelper(SHA3);
      })(Math);
      return CryptoJS.SHA3;
    });
  }
});

// node_modules/crypto-js/ripemd160.js
var require_ripemd160 = __commonJS({
  "node_modules/crypto-js/ripemd160.js"(exports2, module2) {
    (function(root, factory) {
      if (typeof exports2 === "object") {
        module2.exports = exports2 = factory(require_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports2, function(CryptoJS) {
      (function(Math2) {
        var C = CryptoJS;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var Hasher = C_lib.Hasher;
        var C_algo = C.algo;
        var _zl = WordArray.create([
          0,
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          15,
          7,
          4,
          13,
          1,
          10,
          6,
          15,
          3,
          12,
          0,
          9,
          5,
          2,
          14,
          11,
          8,
          3,
          10,
          14,
          4,
          9,
          15,
          8,
          1,
          2,
          7,
          0,
          6,
          13,
          11,
          5,
          12,
          1,
          9,
          11,
          10,
          0,
          8,
          12,
          4,
          13,
          3,
          7,
          15,
          14,
          5,
          6,
          2,
          4,
          0,
          5,
          9,
          7,
          12,
          2,
          10,
          14,
          1,
          3,
          8,
          11,
          6,
          15,
          13
        ]);
        var _zr = WordArray.create([
          5,
          14,
          7,
          0,
          9,
          2,
          11,
          4,
          13,
          6,
          15,
          8,
          1,
          10,
          3,
          12,
          6,
          11,
          3,
          7,
          0,
          13,
          5,
          10,
          14,
          15,
          8,
          12,
          4,
          9,
          1,
          2,
          15,
          5,
          1,
          3,
          7,
          14,
          6,
          9,
          11,
          8,
          12,
          2,
          10,
          0,
          4,
          13,
          8,
          6,
          4,
          1,
          3,
          11,
          15,
          0,
          5,
          12,
          2,
          13,
          9,
          7,
          10,
          14,
          12,
          15,
          10,
          4,
          1,
          5,
          8,
          7,
          6,
          2,
          13,
          14,
          0,
          3,
          9,
          11
        ]);
        var _sl = WordArray.create([
          11,
          14,
          15,
          12,
          5,
          8,
          7,
          9,
          11,
          13,
          14,
          15,
          6,
          7,
          9,
          8,
          7,
          6,
          8,
          13,
          11,
          9,
          7,
          15,
          7,
          12,
          15,
          9,
          11,
          7,
          13,
          12,
          11,
          13,
          6,
          7,
          14,
          9,
          13,
          15,
          14,
          8,
          13,
          6,
          5,
          12,
          7,
          5,
          11,
          12,
          14,
          15,
          14,
          15,
          9,
          8,
          9,
          14,
          5,
          6,
          8,
          6,
          5,
          12,
          9,
          15,
          5,
          11,
          6,
          8,
          13,
          12,
          5,
          12,
          13,
          14,
          11,
          8,
          5,
          6
        ]);
        var _sr = WordArray.create([
          8,
          9,
          9,
          11,
          13,
          15,
          15,
          5,
          7,
          7,
          8,
          11,
          14,
          14,
          12,
          6,
          9,
          13,
          15,
          7,
          12,
          8,
          9,
          11,
          7,
          7,
          12,
          7,
          6,
          15,
          13,
          11,
          9,
          7,
          15,
          11,
          8,
          6,
          6,
          14,
          12,
          13,
          5,
          14,
          13,
          13,
          7,
          5,
          15,
          5,
          8,
          11,
          14,
          14,
          6,
          14,
          6,
          9,
          12,
          9,
          12,
          5,
          15,
          8,
          8,
          5,
          12,
          9,
          12,
          5,
          14,
          6,
          8,
          13,
          6,
          5,
          15,
          13,
          11,
          11
        ]);
        var _hl = WordArray.create([0, 1518500249, 1859775393, 2400959708, 2840853838]);
        var _hr = WordArray.create([1352829926, 1548603684, 1836072691, 2053994217, 0]);
        var RIPEMD160 = C_algo.RIPEMD160 = Hasher.extend({
          _doReset: function() {
            this._hash = WordArray.create([1732584193, 4023233417, 2562383102, 271733878, 3285377520]);
          },
          _doProcessBlock: function(M, offset) {
            for (var i = 0; i < 16; i++) {
              var offset_i = offset + i;
              var M_offset_i = M[offset_i];
              M[offset_i] = (M_offset_i << 8 | M_offset_i >>> 24) & 16711935 | (M_offset_i << 24 | M_offset_i >>> 8) & 4278255360;
            }
            var H = this._hash.words;
            var hl = _hl.words;
            var hr = _hr.words;
            var zl = _zl.words;
            var zr = _zr.words;
            var sl = _sl.words;
            var sr = _sr.words;
            var al, bl, cl, dl, el;
            var ar, br, cr, dr, er;
            ar = al = H[0];
            br = bl = H[1];
            cr = cl = H[2];
            dr = dl = H[3];
            er = el = H[4];
            var t;
            for (var i = 0; i < 80; i += 1) {
              t = al + M[offset + zl[i]] | 0;
              if (i < 16) {
                t += f1(bl, cl, dl) + hl[0];
              } else if (i < 32) {
                t += f2(bl, cl, dl) + hl[1];
              } else if (i < 48) {
                t += f3(bl, cl, dl) + hl[2];
              } else if (i < 64) {
                t += f4(bl, cl, dl) + hl[3];
              } else {
                t += f5(bl, cl, dl) + hl[4];
              }
              t = t | 0;
              t = rotl(t, sl[i]);
              t = t + el | 0;
              al = el;
              el = dl;
              dl = rotl(cl, 10);
              cl = bl;
              bl = t;
              t = ar + M[offset + zr[i]] | 0;
              if (i < 16) {
                t += f5(br, cr, dr) + hr[0];
              } else if (i < 32) {
                t += f4(br, cr, dr) + hr[1];
              } else if (i < 48) {
                t += f3(br, cr, dr) + hr[2];
              } else if (i < 64) {
                t += f2(br, cr, dr) + hr[3];
              } else {
                t += f1(br, cr, dr) + hr[4];
              }
              t = t | 0;
              t = rotl(t, sr[i]);
              t = t + er | 0;
              ar = er;
              er = dr;
              dr = rotl(cr, 10);
              cr = br;
              br = t;
            }
            t = H[1] + cl + dr | 0;
            H[1] = H[2] + dl + er | 0;
            H[2] = H[3] + el + ar | 0;
            H[3] = H[4] + al + br | 0;
            H[4] = H[0] + bl + cr | 0;
            H[0] = t;
          },
          _doFinalize: function() {
            var data = this._data;
            var dataWords = data.words;
            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = data.sigBytes * 8;
            dataWords[nBitsLeft >>> 5] |= 128 << 24 - nBitsLeft % 32;
            dataWords[(nBitsLeft + 64 >>> 9 << 4) + 14] = (nBitsTotal << 8 | nBitsTotal >>> 24) & 16711935 | (nBitsTotal << 24 | nBitsTotal >>> 8) & 4278255360;
            data.sigBytes = (dataWords.length + 1) * 4;
            this._process();
            var hash = this._hash;
            var H = hash.words;
            for (var i = 0; i < 5; i++) {
              var H_i = H[i];
              H[i] = (H_i << 8 | H_i >>> 24) & 16711935 | (H_i << 24 | H_i >>> 8) & 4278255360;
            }
            return hash;
          },
          clone: function() {
            var clone = Hasher.clone.call(this);
            clone._hash = this._hash.clone();
            return clone;
          }
        });
        function f1(x, y, z) {
          return x ^ y ^ z;
        }
        function f2(x, y, z) {
          return x & y | ~x & z;
        }
        function f3(x, y, z) {
          return (x | ~y) ^ z;
        }
        function f4(x, y, z) {
          return x & z | y & ~z;
        }
        function f5(x, y, z) {
          return x ^ (y | ~z);
        }
        function rotl(x, n) {
          return x << n | x >>> 32 - n;
        }
        C.RIPEMD160 = Hasher._createHelper(RIPEMD160);
        C.HmacRIPEMD160 = Hasher._createHmacHelper(RIPEMD160);
      })(Math);
      return CryptoJS.RIPEMD160;
    });
  }
});

// node_modules/crypto-js/hmac.js
var require_hmac = __commonJS({
  "node_modules/crypto-js/hmac.js"(exports2, module2) {
    (function(root, factory) {
      if (typeof exports2 === "object") {
        module2.exports = exports2 = factory(require_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports2, function(CryptoJS) {
      (function() {
        var C = CryptoJS;
        var C_lib = C.lib;
        var Base = C_lib.Base;
        var C_enc = C.enc;
        var Utf8 = C_enc.Utf8;
        var C_algo = C.algo;
        var HMAC = C_algo.HMAC = Base.extend({
          /**
           * Initializes a newly created HMAC.
           *
           * @param {Hasher} hasher The hash algorithm to use.
           * @param {WordArray|string} key The secret key.
           *
           * @example
           *
           *     var hmacHasher = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, key);
           */
          init: function(hasher, key) {
            hasher = this._hasher = new hasher.init();
            if (typeof key == "string") {
              key = Utf8.parse(key);
            }
            var hasherBlockSize = hasher.blockSize;
            var hasherBlockSizeBytes = hasherBlockSize * 4;
            if (key.sigBytes > hasherBlockSizeBytes) {
              key = hasher.finalize(key);
            }
            key.clamp();
            var oKey = this._oKey = key.clone();
            var iKey = this._iKey = key.clone();
            var oKeyWords = oKey.words;
            var iKeyWords = iKey.words;
            for (var i = 0; i < hasherBlockSize; i++) {
              oKeyWords[i] ^= 1549556828;
              iKeyWords[i] ^= 909522486;
            }
            oKey.sigBytes = iKey.sigBytes = hasherBlockSizeBytes;
            this.reset();
          },
          /**
           * Resets this HMAC to its initial state.
           *
           * @example
           *
           *     hmacHasher.reset();
           */
          reset: function() {
            var hasher = this._hasher;
            hasher.reset();
            hasher.update(this._iKey);
          },
          /**
           * Updates this HMAC with a message.
           *
           * @param {WordArray|string} messageUpdate The message to append.
           *
           * @return {HMAC} This HMAC instance.
           *
           * @example
           *
           *     hmacHasher.update('message');
           *     hmacHasher.update(wordArray);
           */
          update: function(messageUpdate) {
            this._hasher.update(messageUpdate);
            return this;
          },
          /**
           * Finalizes the HMAC computation.
           * Note that the finalize operation is effectively a destructive, read-once operation.
           *
           * @param {WordArray|string} messageUpdate (Optional) A final message update.
           *
           * @return {WordArray} The HMAC.
           *
           * @example
           *
           *     var hmac = hmacHasher.finalize();
           *     var hmac = hmacHasher.finalize('message');
           *     var hmac = hmacHasher.finalize(wordArray);
           */
          finalize: function(messageUpdate) {
            var hasher = this._hasher;
            var innerHash = hasher.finalize(messageUpdate);
            hasher.reset();
            var hmac2 = hasher.finalize(this._oKey.clone().concat(innerHash));
            return hmac2;
          }
        });
      })();
    });
  }
});

// node_modules/crypto-js/pbkdf2.js
var require_pbkdf2 = __commonJS({
  "node_modules/crypto-js/pbkdf2.js"(exports2, module2) {
    (function(root, factory, undef) {
      if (typeof exports2 === "object") {
        module2.exports = exports2 = factory(require_core(), require_sha256(), require_hmac());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./sha256", "./hmac"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports2, function(CryptoJS) {
      (function() {
        var C = CryptoJS;
        var C_lib = C.lib;
        var Base = C_lib.Base;
        var WordArray = C_lib.WordArray;
        var C_algo = C.algo;
        var SHA256 = C_algo.SHA256;
        var HMAC = C_algo.HMAC;
        var PBKDF2 = C_algo.PBKDF2 = Base.extend({
          /**
           * Configuration options.
           *
           * @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
           * @property {Hasher} hasher The hasher to use. Default: SHA256
           * @property {number} iterations The number of iterations to perform. Default: 250000
           */
          cfg: Base.extend({
            keySize: 128 / 32,
            hasher: SHA256,
            iterations: 25e4
          }),
          /**
           * Initializes a newly created key derivation function.
           *
           * @param {Object} cfg (Optional) The configuration options to use for the derivation.
           *
           * @example
           *
           *     var kdf = CryptoJS.algo.PBKDF2.create();
           *     var kdf = CryptoJS.algo.PBKDF2.create({ keySize: 8 });
           *     var kdf = CryptoJS.algo.PBKDF2.create({ keySize: 8, iterations: 1000 });
           */
          init: function(cfg) {
            this.cfg = this.cfg.extend(cfg);
          },
          /**
           * Computes the Password-Based Key Derivation Function 2.
           *
           * @param {WordArray|string} password The password.
           * @param {WordArray|string} salt A salt.
           *
           * @return {WordArray} The derived key.
           *
           * @example
           *
           *     var key = kdf.compute(password, salt);
           */
          compute: function(password, salt) {
            var cfg = this.cfg;
            var hmac2 = HMAC.create(cfg.hasher, password);
            var derivedKey = WordArray.create();
            var blockIndex = WordArray.create([1]);
            var derivedKeyWords = derivedKey.words;
            var blockIndexWords = blockIndex.words;
            var keySize = cfg.keySize;
            var iterations = cfg.iterations;
            while (derivedKeyWords.length < keySize) {
              var block = hmac2.update(salt).finalize(blockIndex);
              hmac2.reset();
              var blockWords = block.words;
              var blockWordsLength = blockWords.length;
              var intermediate = block;
              for (var i = 1; i < iterations; i++) {
                intermediate = hmac2.finalize(intermediate);
                hmac2.reset();
                var intermediateWords = intermediate.words;
                for (var j = 0; j < blockWordsLength; j++) {
                  blockWords[j] ^= intermediateWords[j];
                }
              }
              derivedKey.concat(block);
              blockIndexWords[0]++;
            }
            derivedKey.sigBytes = keySize * 4;
            return derivedKey;
          }
        });
        C.PBKDF2 = function(password, salt, cfg) {
          return PBKDF2.create(cfg).compute(password, salt);
        };
      })();
      return CryptoJS.PBKDF2;
    });
  }
});

// node_modules/crypto-js/evpkdf.js
var require_evpkdf = __commonJS({
  "node_modules/crypto-js/evpkdf.js"(exports2, module2) {
    (function(root, factory, undef) {
      if (typeof exports2 === "object") {
        module2.exports = exports2 = factory(require_core(), require_sha1(), require_hmac());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./sha1", "./hmac"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports2, function(CryptoJS) {
      (function() {
        var C = CryptoJS;
        var C_lib = C.lib;
        var Base = C_lib.Base;
        var WordArray = C_lib.WordArray;
        var C_algo = C.algo;
        var MD5 = C_algo.MD5;
        var EvpKDF = C_algo.EvpKDF = Base.extend({
          /**
           * Configuration options.
           *
           * @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
           * @property {Hasher} hasher The hash algorithm to use. Default: MD5
           * @property {number} iterations The number of iterations to perform. Default: 1
           */
          cfg: Base.extend({
            keySize: 128 / 32,
            hasher: MD5,
            iterations: 1
          }),
          /**
           * Initializes a newly created key derivation function.
           *
           * @param {Object} cfg (Optional) The configuration options to use for the derivation.
           *
           * @example
           *
           *     var kdf = CryptoJS.algo.EvpKDF.create();
           *     var kdf = CryptoJS.algo.EvpKDF.create({ keySize: 8 });
           *     var kdf = CryptoJS.algo.EvpKDF.create({ keySize: 8, iterations: 1000 });
           */
          init: function(cfg) {
            this.cfg = this.cfg.extend(cfg);
          },
          /**
           * Derives a key from a password.
           *
           * @param {WordArray|string} password The password.
           * @param {WordArray|string} salt A salt.
           *
           * @return {WordArray} The derived key.
           *
           * @example
           *
           *     var key = kdf.compute(password, salt);
           */
          compute: function(password, salt) {
            var block;
            var cfg = this.cfg;
            var hasher = cfg.hasher.create();
            var derivedKey = WordArray.create();
            var derivedKeyWords = derivedKey.words;
            var keySize = cfg.keySize;
            var iterations = cfg.iterations;
            while (derivedKeyWords.length < keySize) {
              if (block) {
                hasher.update(block);
              }
              block = hasher.update(password).finalize(salt);
              hasher.reset();
              for (var i = 1; i < iterations; i++) {
                block = hasher.finalize(block);
                hasher.reset();
              }
              derivedKey.concat(block);
            }
            derivedKey.sigBytes = keySize * 4;
            return derivedKey;
          }
        });
        C.EvpKDF = function(password, salt, cfg) {
          return EvpKDF.create(cfg).compute(password, salt);
        };
      })();
      return CryptoJS.EvpKDF;
    });
  }
});

// node_modules/crypto-js/cipher-core.js
var require_cipher_core = __commonJS({
  "node_modules/crypto-js/cipher-core.js"(exports2, module2) {
    (function(root, factory, undef) {
      if (typeof exports2 === "object") {
        module2.exports = exports2 = factory(require_core(), require_evpkdf());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./evpkdf"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports2, function(CryptoJS) {
      CryptoJS.lib.Cipher || function(undefined2) {
        var C = CryptoJS;
        var C_lib = C.lib;
        var Base = C_lib.Base;
        var WordArray = C_lib.WordArray;
        var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm;
        var C_enc = C.enc;
        var Utf8 = C_enc.Utf8;
        var Base64 = C_enc.Base64;
        var C_algo = C.algo;
        var EvpKDF = C_algo.EvpKDF;
        var Cipher = C_lib.Cipher = BufferedBlockAlgorithm.extend({
          /**
           * Configuration options.
           *
           * @property {WordArray} iv The IV to use for this operation.
           */
          cfg: Base.extend(),
          /**
           * Creates this cipher in encryption mode.
           *
           * @param {WordArray} key The key.
           * @param {Object} cfg (Optional) The configuration options to use for this operation.
           *
           * @return {Cipher} A cipher instance.
           *
           * @static
           *
           * @example
           *
           *     var cipher = CryptoJS.algo.AES.createEncryptor(keyWordArray, { iv: ivWordArray });
           */
          createEncryptor: function(key, cfg) {
            return this.create(this._ENC_XFORM_MODE, key, cfg);
          },
          /**
           * Creates this cipher in decryption mode.
           *
           * @param {WordArray} key The key.
           * @param {Object} cfg (Optional) The configuration options to use for this operation.
           *
           * @return {Cipher} A cipher instance.
           *
           * @static
           *
           * @example
           *
           *     var cipher = CryptoJS.algo.AES.createDecryptor(keyWordArray, { iv: ivWordArray });
           */
          createDecryptor: function(key, cfg) {
            return this.create(this._DEC_XFORM_MODE, key, cfg);
          },
          /**
           * Initializes a newly created cipher.
           *
           * @param {number} xformMode Either the encryption or decryption transormation mode constant.
           * @param {WordArray} key The key.
           * @param {Object} cfg (Optional) The configuration options to use for this operation.
           *
           * @example
           *
           *     var cipher = CryptoJS.algo.AES.create(CryptoJS.algo.AES._ENC_XFORM_MODE, keyWordArray, { iv: ivWordArray });
           */
          init: function(xformMode, key, cfg) {
            this.cfg = this.cfg.extend(cfg);
            this._xformMode = xformMode;
            this._key = key;
            this.reset();
          },
          /**
           * Resets this cipher to its initial state.
           *
           * @example
           *
           *     cipher.reset();
           */
          reset: function() {
            BufferedBlockAlgorithm.reset.call(this);
            this._doReset();
          },
          /**
           * Adds data to be encrypted or decrypted.
           *
           * @param {WordArray|string} dataUpdate The data to encrypt or decrypt.
           *
           * @return {WordArray} The data after processing.
           *
           * @example
           *
           *     var encrypted = cipher.process('data');
           *     var encrypted = cipher.process(wordArray);
           */
          process: function(dataUpdate) {
            this._append(dataUpdate);
            return this._process();
          },
          /**
           * Finalizes the encryption or decryption process.
           * Note that the finalize operation is effectively a destructive, read-once operation.
           *
           * @param {WordArray|string} dataUpdate The final data to encrypt or decrypt.
           *
           * @return {WordArray} The data after final processing.
           *
           * @example
           *
           *     var encrypted = cipher.finalize();
           *     var encrypted = cipher.finalize('data');
           *     var encrypted = cipher.finalize(wordArray);
           */
          finalize: function(dataUpdate) {
            if (dataUpdate) {
              this._append(dataUpdate);
            }
            var finalProcessedData = this._doFinalize();
            return finalProcessedData;
          },
          keySize: 128 / 32,
          ivSize: 128 / 32,
          _ENC_XFORM_MODE: 1,
          _DEC_XFORM_MODE: 2,
          /**
           * Creates shortcut functions to a cipher's object interface.
           *
           * @param {Cipher} cipher The cipher to create a helper for.
           *
           * @return {Object} An object with encrypt and decrypt shortcut functions.
           *
           * @static
           *
           * @example
           *
           *     var AES = CryptoJS.lib.Cipher._createHelper(CryptoJS.algo.AES);
           */
          _createHelper: /* @__PURE__ */ function() {
            function selectCipherStrategy(key) {
              if (typeof key == "string") {
                return PasswordBasedCipher;
              } else {
                return SerializableCipher;
              }
            }
            return function(cipher) {
              return {
                encrypt: function(message, key, cfg) {
                  return selectCipherStrategy(key).encrypt(cipher, message, key, cfg);
                },
                decrypt: function(ciphertext, key, cfg) {
                  return selectCipherStrategy(key).decrypt(cipher, ciphertext, key, cfg);
                }
              };
            };
          }()
        });
        var StreamCipher = C_lib.StreamCipher = Cipher.extend({
          _doFinalize: function() {
            var finalProcessedBlocks = this._process(true);
            return finalProcessedBlocks;
          },
          blockSize: 1
        });
        var C_mode = C.mode = {};
        var BlockCipherMode = C_lib.BlockCipherMode = Base.extend({
          /**
           * Creates this mode for encryption.
           *
           * @param {Cipher} cipher A block cipher instance.
           * @param {Array} iv The IV words.
           *
           * @static
           *
           * @example
           *
           *     var mode = CryptoJS.mode.CBC.createEncryptor(cipher, iv.words);
           */
          createEncryptor: function(cipher, iv) {
            return this.Encryptor.create(cipher, iv);
          },
          /**
           * Creates this mode for decryption.
           *
           * @param {Cipher} cipher A block cipher instance.
           * @param {Array} iv The IV words.
           *
           * @static
           *
           * @example
           *
           *     var mode = CryptoJS.mode.CBC.createDecryptor(cipher, iv.words);
           */
          createDecryptor: function(cipher, iv) {
            return this.Decryptor.create(cipher, iv);
          },
          /**
           * Initializes a newly created mode.
           *
           * @param {Cipher} cipher A block cipher instance.
           * @param {Array} iv The IV words.
           *
           * @example
           *
           *     var mode = CryptoJS.mode.CBC.Encryptor.create(cipher, iv.words);
           */
          init: function(cipher, iv) {
            this._cipher = cipher;
            this._iv = iv;
          }
        });
        var CBC = C_mode.CBC = function() {
          var CBC2 = BlockCipherMode.extend();
          CBC2.Encryptor = CBC2.extend({
            /**
             * Processes the data block at offset.
             *
             * @param {Array} words The data words to operate on.
             * @param {number} offset The offset where the block starts.
             *
             * @example
             *
             *     mode.processBlock(data.words, offset);
             */
            processBlock: function(words, offset) {
              var cipher = this._cipher;
              var blockSize = cipher.blockSize;
              xorBlock2.call(this, words, offset, blockSize);
              cipher.encryptBlock(words, offset);
              this._prevBlock = words.slice(offset, offset + blockSize);
            }
          });
          CBC2.Decryptor = CBC2.extend({
            /**
             * Processes the data block at offset.
             *
             * @param {Array} words The data words to operate on.
             * @param {number} offset The offset where the block starts.
             *
             * @example
             *
             *     mode.processBlock(data.words, offset);
             */
            processBlock: function(words, offset) {
              var cipher = this._cipher;
              var blockSize = cipher.blockSize;
              var thisBlock = words.slice(offset, offset + blockSize);
              cipher.decryptBlock(words, offset);
              xorBlock2.call(this, words, offset, blockSize);
              this._prevBlock = thisBlock;
            }
          });
          function xorBlock2(words, offset, blockSize) {
            var block;
            var iv = this._iv;
            if (iv) {
              block = iv;
              this._iv = undefined2;
            } else {
              block = this._prevBlock;
            }
            for (var i = 0; i < blockSize; i++) {
              words[offset + i] ^= block[i];
            }
          }
          return CBC2;
        }();
        var C_pad = C.pad = {};
        var Pkcs7 = C_pad.Pkcs7 = {
          /**
           * Pads data using the algorithm defined in PKCS #5/7.
           *
           * @param {WordArray} data The data to pad.
           * @param {number} blockSize The multiple that the data should be padded to.
           *
           * @static
           *
           * @example
           *
           *     CryptoJS.pad.Pkcs7.pad(wordArray, 4);
           */
          pad: function(data, blockSize) {
            var blockSizeBytes = blockSize * 4;
            var nPaddingBytes = blockSizeBytes - data.sigBytes % blockSizeBytes;
            var paddingWord = nPaddingBytes << 24 | nPaddingBytes << 16 | nPaddingBytes << 8 | nPaddingBytes;
            var paddingWords = [];
            for (var i = 0; i < nPaddingBytes; i += 4) {
              paddingWords.push(paddingWord);
            }
            var padding = WordArray.create(paddingWords, nPaddingBytes);
            data.concat(padding);
          },
          /**
           * Unpads data that had been padded using the algorithm defined in PKCS #5/7.
           *
           * @param {WordArray} data The data to unpad.
           *
           * @static
           *
           * @example
           *
           *     CryptoJS.pad.Pkcs7.unpad(wordArray);
           */
          unpad: function(data) {
            var nPaddingBytes = data.words[data.sigBytes - 1 >>> 2] & 255;
            data.sigBytes -= nPaddingBytes;
          }
        };
        var BlockCipher = C_lib.BlockCipher = Cipher.extend({
          /**
           * Configuration options.
           *
           * @property {Mode} mode The block mode to use. Default: CBC
           * @property {Padding} padding The padding strategy to use. Default: Pkcs7
           */
          cfg: Cipher.cfg.extend({
            mode: CBC,
            padding: Pkcs7
          }),
          reset: function() {
            var modeCreator;
            Cipher.reset.call(this);
            var cfg = this.cfg;
            var iv = cfg.iv;
            var mode = cfg.mode;
            if (this._xformMode == this._ENC_XFORM_MODE) {
              modeCreator = mode.createEncryptor;
            } else {
              modeCreator = mode.createDecryptor;
              this._minBufferSize = 1;
            }
            if (this._mode && this._mode.__creator == modeCreator) {
              this._mode.init(this, iv && iv.words);
            } else {
              this._mode = modeCreator.call(mode, this, iv && iv.words);
              this._mode.__creator = modeCreator;
            }
          },
          _doProcessBlock: function(words, offset) {
            this._mode.processBlock(words, offset);
          },
          _doFinalize: function() {
            var finalProcessedBlocks;
            var padding = this.cfg.padding;
            if (this._xformMode == this._ENC_XFORM_MODE) {
              padding.pad(this._data, this.blockSize);
              finalProcessedBlocks = this._process(true);
            } else {
              finalProcessedBlocks = this._process(true);
              padding.unpad(finalProcessedBlocks);
            }
            return finalProcessedBlocks;
          },
          blockSize: 128 / 32
        });
        var CipherParams = C_lib.CipherParams = Base.extend({
          /**
           * Initializes a newly created cipher params object.
           *
           * @param {Object} cipherParams An object with any of the possible cipher parameters.
           *
           * @example
           *
           *     var cipherParams = CryptoJS.lib.CipherParams.create({
           *         ciphertext: ciphertextWordArray,
           *         key: keyWordArray,
           *         iv: ivWordArray,
           *         salt: saltWordArray,
           *         algorithm: CryptoJS.algo.AES,
           *         mode: CryptoJS.mode.CBC,
           *         padding: CryptoJS.pad.PKCS7,
           *         blockSize: 4,
           *         formatter: CryptoJS.format.OpenSSL
           *     });
           */
          init: function(cipherParams) {
            this.mixIn(cipherParams);
          },
          /**
           * Converts this cipher params object to a string.
           *
           * @param {Format} formatter (Optional) The formatting strategy to use.
           *
           * @return {string} The stringified cipher params.
           *
           * @throws Error If neither the formatter nor the default formatter is set.
           *
           * @example
           *
           *     var string = cipherParams + '';
           *     var string = cipherParams.toString();
           *     var string = cipherParams.toString(CryptoJS.format.OpenSSL);
           */
          toString: function(formatter) {
            return (formatter || this.formatter).stringify(this);
          }
        });
        var C_format = C.format = {};
        var OpenSSLFormatter = C_format.OpenSSL = {
          /**
           * Converts a cipher params object to an OpenSSL-compatible string.
           *
           * @param {CipherParams} cipherParams The cipher params object.
           *
           * @return {string} The OpenSSL-compatible string.
           *
           * @static
           *
           * @example
           *
           *     var openSSLString = CryptoJS.format.OpenSSL.stringify(cipherParams);
           */
          stringify: function(cipherParams) {
            var wordArray;
            var ciphertext = cipherParams.ciphertext;
            var salt = cipherParams.salt;
            if (salt) {
              wordArray = WordArray.create([1398893684, 1701076831]).concat(salt).concat(ciphertext);
            } else {
              wordArray = ciphertext;
            }
            return wordArray.toString(Base64);
          },
          /**
           * Converts an OpenSSL-compatible string to a cipher params object.
           *
           * @param {string} openSSLStr The OpenSSL-compatible string.
           *
           * @return {CipherParams} The cipher params object.
           *
           * @static
           *
           * @example
           *
           *     var cipherParams = CryptoJS.format.OpenSSL.parse(openSSLString);
           */
          parse: function(openSSLStr) {
            var salt;
            var ciphertext = Base64.parse(openSSLStr);
            var ciphertextWords = ciphertext.words;
            if (ciphertextWords[0] == 1398893684 && ciphertextWords[1] == 1701076831) {
              salt = WordArray.create(ciphertextWords.slice(2, 4));
              ciphertextWords.splice(0, 4);
              ciphertext.sigBytes -= 16;
            }
            return CipherParams.create({ ciphertext, salt });
          }
        };
        var SerializableCipher = C_lib.SerializableCipher = Base.extend({
          /**
           * Configuration options.
           *
           * @property {Formatter} format The formatting strategy to convert cipher param objects to and from a string. Default: OpenSSL
           */
          cfg: Base.extend({
            format: OpenSSLFormatter
          }),
          /**
           * Encrypts a message.
           *
           * @param {Cipher} cipher The cipher algorithm to use.
           * @param {WordArray|string} message The message to encrypt.
           * @param {WordArray} key The key.
           * @param {Object} cfg (Optional) The configuration options to use for this operation.
           *
           * @return {CipherParams} A cipher params object.
           *
           * @static
           *
           * @example
           *
           *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key);
           *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key, { iv: iv });
           *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key, { iv: iv, format: CryptoJS.format.OpenSSL });
           */
          encrypt: function(cipher, message, key, cfg) {
            cfg = this.cfg.extend(cfg);
            var encryptor = cipher.createEncryptor(key, cfg);
            var ciphertext = encryptor.finalize(message);
            var cipherCfg = encryptor.cfg;
            return CipherParams.create({
              ciphertext,
              key,
              iv: cipherCfg.iv,
              algorithm: cipher,
              mode: cipherCfg.mode,
              padding: cipherCfg.padding,
              blockSize: cipher.blockSize,
              formatter: cfg.format
            });
          },
          /**
           * Decrypts serialized ciphertext.
           *
           * @param {Cipher} cipher The cipher algorithm to use.
           * @param {CipherParams|string} ciphertext The ciphertext to decrypt.
           * @param {WordArray} key The key.
           * @param {Object} cfg (Optional) The configuration options to use for this operation.
           *
           * @return {WordArray} The plaintext.
           *
           * @static
           *
           * @example
           *
           *     var plaintext = CryptoJS.lib.SerializableCipher.decrypt(CryptoJS.algo.AES, formattedCiphertext, key, { iv: iv, format: CryptoJS.format.OpenSSL });
           *     var plaintext = CryptoJS.lib.SerializableCipher.decrypt(CryptoJS.algo.AES, ciphertextParams, key, { iv: iv, format: CryptoJS.format.OpenSSL });
           */
          decrypt: function(cipher, ciphertext, key, cfg) {
            cfg = this.cfg.extend(cfg);
            ciphertext = this._parse(ciphertext, cfg.format);
            var plaintext = cipher.createDecryptor(key, cfg).finalize(ciphertext.ciphertext);
            return plaintext;
          },
          /**
           * Converts serialized ciphertext to CipherParams,
           * else assumed CipherParams already and returns ciphertext unchanged.
           *
           * @param {CipherParams|string} ciphertext The ciphertext.
           * @param {Formatter} format The formatting strategy to use to parse serialized ciphertext.
           *
           * @return {CipherParams} The unserialized ciphertext.
           *
           * @static
           *
           * @example
           *
           *     var ciphertextParams = CryptoJS.lib.SerializableCipher._parse(ciphertextStringOrParams, format);
           */
          _parse: function(ciphertext, format) {
            if (typeof ciphertext == "string") {
              return format.parse(ciphertext, this);
            } else {
              return ciphertext;
            }
          }
        });
        var C_kdf = C.kdf = {};
        var OpenSSLKdf = C_kdf.OpenSSL = {
          /**
           * Derives a key and IV from a password.
           *
           * @param {string} password The password to derive from.
           * @param {number} keySize The size in words of the key to generate.
           * @param {number} ivSize The size in words of the IV to generate.
           * @param {WordArray|string} salt (Optional) A 64-bit salt to use. If omitted, a salt will be generated randomly.
           *
           * @return {CipherParams} A cipher params object with the key, IV, and salt.
           *
           * @static
           *
           * @example
           *
           *     var derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32);
           *     var derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32, 'saltsalt');
           */
          execute: function(password, keySize, ivSize, salt, hasher) {
            if (!salt) {
              salt = WordArray.random(64 / 8);
            }
            if (!hasher) {
              var key = EvpKDF.create({ keySize: keySize + ivSize }).compute(password, salt);
            } else {
              var key = EvpKDF.create({ keySize: keySize + ivSize, hasher }).compute(password, salt);
            }
            var iv = WordArray.create(key.words.slice(keySize), ivSize * 4);
            key.sigBytes = keySize * 4;
            return CipherParams.create({ key, iv, salt });
          }
        };
        var PasswordBasedCipher = C_lib.PasswordBasedCipher = SerializableCipher.extend({
          /**
           * Configuration options.
           *
           * @property {KDF} kdf The key derivation function to use to generate a key and IV from a password. Default: OpenSSL
           */
          cfg: SerializableCipher.cfg.extend({
            kdf: OpenSSLKdf
          }),
          /**
           * Encrypts a message using a password.
           *
           * @param {Cipher} cipher The cipher algorithm to use.
           * @param {WordArray|string} message The message to encrypt.
           * @param {string} password The password.
           * @param {Object} cfg (Optional) The configuration options to use for this operation.
           *
           * @return {CipherParams} A cipher params object.
           *
           * @static
           *
           * @example
           *
           *     var ciphertextParams = CryptoJS.lib.PasswordBasedCipher.encrypt(CryptoJS.algo.AES, message, 'password');
           *     var ciphertextParams = CryptoJS.lib.PasswordBasedCipher.encrypt(CryptoJS.algo.AES, message, 'password', { format: CryptoJS.format.OpenSSL });
           */
          encrypt: function(cipher, message, password, cfg) {
            cfg = this.cfg.extend(cfg);
            var derivedParams = cfg.kdf.execute(password, cipher.keySize, cipher.ivSize, cfg.salt, cfg.hasher);
            cfg.iv = derivedParams.iv;
            var ciphertext = SerializableCipher.encrypt.call(this, cipher, message, derivedParams.key, cfg);
            ciphertext.mixIn(derivedParams);
            return ciphertext;
          },
          /**
           * Decrypts serialized ciphertext using a password.
           *
           * @param {Cipher} cipher The cipher algorithm to use.
           * @param {CipherParams|string} ciphertext The ciphertext to decrypt.
           * @param {string} password The password.
           * @param {Object} cfg (Optional) The configuration options to use for this operation.
           *
           * @return {WordArray} The plaintext.
           *
           * @static
           *
           * @example
           *
           *     var plaintext = CryptoJS.lib.PasswordBasedCipher.decrypt(CryptoJS.algo.AES, formattedCiphertext, 'password', { format: CryptoJS.format.OpenSSL });
           *     var plaintext = CryptoJS.lib.PasswordBasedCipher.decrypt(CryptoJS.algo.AES, ciphertextParams, 'password', { format: CryptoJS.format.OpenSSL });
           */
          decrypt: function(cipher, ciphertext, password, cfg) {
            cfg = this.cfg.extend(cfg);
            ciphertext = this._parse(ciphertext, cfg.format);
            var derivedParams = cfg.kdf.execute(password, cipher.keySize, cipher.ivSize, ciphertext.salt, cfg.hasher);
            cfg.iv = derivedParams.iv;
            var plaintext = SerializableCipher.decrypt.call(this, cipher, ciphertext, derivedParams.key, cfg);
            return plaintext;
          }
        });
      }();
    });
  }
});

// node_modules/crypto-js/mode-cfb.js
var require_mode_cfb = __commonJS({
  "node_modules/crypto-js/mode-cfb.js"(exports2, module2) {
    (function(root, factory, undef) {
      if (typeof exports2 === "object") {
        module2.exports = exports2 = factory(require_core(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports2, function(CryptoJS) {
      CryptoJS.mode.CFB = function() {
        var CFB = CryptoJS.lib.BlockCipherMode.extend();
        CFB.Encryptor = CFB.extend({
          processBlock: function(words, offset) {
            var cipher = this._cipher;
            var blockSize = cipher.blockSize;
            generateKeystreamAndEncrypt.call(this, words, offset, blockSize, cipher);
            this._prevBlock = words.slice(offset, offset + blockSize);
          }
        });
        CFB.Decryptor = CFB.extend({
          processBlock: function(words, offset) {
            var cipher = this._cipher;
            var blockSize = cipher.blockSize;
            var thisBlock = words.slice(offset, offset + blockSize);
            generateKeystreamAndEncrypt.call(this, words, offset, blockSize, cipher);
            this._prevBlock = thisBlock;
          }
        });
        function generateKeystreamAndEncrypt(words, offset, blockSize, cipher) {
          var keystream;
          var iv = this._iv;
          if (iv) {
            keystream = iv.slice(0);
            this._iv = void 0;
          } else {
            keystream = this._prevBlock;
          }
          cipher.encryptBlock(keystream, 0);
          for (var i = 0; i < blockSize; i++) {
            words[offset + i] ^= keystream[i];
          }
        }
        return CFB;
      }();
      return CryptoJS.mode.CFB;
    });
  }
});

// node_modules/crypto-js/mode-ctr.js
var require_mode_ctr = __commonJS({
  "node_modules/crypto-js/mode-ctr.js"(exports2, module2) {
    (function(root, factory, undef) {
      if (typeof exports2 === "object") {
        module2.exports = exports2 = factory(require_core(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports2, function(CryptoJS) {
      CryptoJS.mode.CTR = function() {
        var CTR = CryptoJS.lib.BlockCipherMode.extend();
        var Encryptor = CTR.Encryptor = CTR.extend({
          processBlock: function(words, offset) {
            var cipher = this._cipher;
            var blockSize = cipher.blockSize;
            var iv = this._iv;
            var counter = this._counter;
            if (iv) {
              counter = this._counter = iv.slice(0);
              this._iv = void 0;
            }
            var keystream = counter.slice(0);
            cipher.encryptBlock(keystream, 0);
            counter[blockSize - 1] = counter[blockSize - 1] + 1 | 0;
            for (var i = 0; i < blockSize; i++) {
              words[offset + i] ^= keystream[i];
            }
          }
        });
        CTR.Decryptor = Encryptor;
        return CTR;
      }();
      return CryptoJS.mode.CTR;
    });
  }
});

// node_modules/crypto-js/mode-ctr-gladman.js
var require_mode_ctr_gladman = __commonJS({
  "node_modules/crypto-js/mode-ctr-gladman.js"(exports2, module2) {
    (function(root, factory, undef) {
      if (typeof exports2 === "object") {
        module2.exports = exports2 = factory(require_core(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports2, function(CryptoJS) {
      CryptoJS.mode.CTRGladman = function() {
        var CTRGladman = CryptoJS.lib.BlockCipherMode.extend();
        function incWord(word) {
          if ((word >> 24 & 255) === 255) {
            var b1 = word >> 16 & 255;
            var b2 = word >> 8 & 255;
            var b3 = word & 255;
            if (b1 === 255) {
              b1 = 0;
              if (b2 === 255) {
                b2 = 0;
                if (b3 === 255) {
                  b3 = 0;
                } else {
                  ++b3;
                }
              } else {
                ++b2;
              }
            } else {
              ++b1;
            }
            word = 0;
            word += b1 << 16;
            word += b2 << 8;
            word += b3;
          } else {
            word += 1 << 24;
          }
          return word;
        }
        function incCounter(counter) {
          if ((counter[0] = incWord(counter[0])) === 0) {
            counter[1] = incWord(counter[1]);
          }
          return counter;
        }
        var Encryptor = CTRGladman.Encryptor = CTRGladman.extend({
          processBlock: function(words, offset) {
            var cipher = this._cipher;
            var blockSize = cipher.blockSize;
            var iv = this._iv;
            var counter = this._counter;
            if (iv) {
              counter = this._counter = iv.slice(0);
              this._iv = void 0;
            }
            incCounter(counter);
            var keystream = counter.slice(0);
            cipher.encryptBlock(keystream, 0);
            for (var i = 0; i < blockSize; i++) {
              words[offset + i] ^= keystream[i];
            }
          }
        });
        CTRGladman.Decryptor = Encryptor;
        return CTRGladman;
      }();
      return CryptoJS.mode.CTRGladman;
    });
  }
});

// node_modules/crypto-js/mode-ofb.js
var require_mode_ofb = __commonJS({
  "node_modules/crypto-js/mode-ofb.js"(exports2, module2) {
    (function(root, factory, undef) {
      if (typeof exports2 === "object") {
        module2.exports = exports2 = factory(require_core(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports2, function(CryptoJS) {
      CryptoJS.mode.OFB = function() {
        var OFB = CryptoJS.lib.BlockCipherMode.extend();
        var Encryptor = OFB.Encryptor = OFB.extend({
          processBlock: function(words, offset) {
            var cipher = this._cipher;
            var blockSize = cipher.blockSize;
            var iv = this._iv;
            var keystream = this._keystream;
            if (iv) {
              keystream = this._keystream = iv.slice(0);
              this._iv = void 0;
            }
            cipher.encryptBlock(keystream, 0);
            for (var i = 0; i < blockSize; i++) {
              words[offset + i] ^= keystream[i];
            }
          }
        });
        OFB.Decryptor = Encryptor;
        return OFB;
      }();
      return CryptoJS.mode.OFB;
    });
  }
});

// node_modules/crypto-js/mode-ecb.js
var require_mode_ecb = __commonJS({
  "node_modules/crypto-js/mode-ecb.js"(exports2, module2) {
    (function(root, factory, undef) {
      if (typeof exports2 === "object") {
        module2.exports = exports2 = factory(require_core(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports2, function(CryptoJS) {
      CryptoJS.mode.ECB = function() {
        var ECB = CryptoJS.lib.BlockCipherMode.extend();
        ECB.Encryptor = ECB.extend({
          processBlock: function(words, offset) {
            this._cipher.encryptBlock(words, offset);
          }
        });
        ECB.Decryptor = ECB.extend({
          processBlock: function(words, offset) {
            this._cipher.decryptBlock(words, offset);
          }
        });
        return ECB;
      }();
      return CryptoJS.mode.ECB;
    });
  }
});

// node_modules/crypto-js/pad-ansix923.js
var require_pad_ansix923 = __commonJS({
  "node_modules/crypto-js/pad-ansix923.js"(exports2, module2) {
    (function(root, factory, undef) {
      if (typeof exports2 === "object") {
        module2.exports = exports2 = factory(require_core(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports2, function(CryptoJS) {
      CryptoJS.pad.AnsiX923 = {
        pad: function(data, blockSize) {
          var dataSigBytes = data.sigBytes;
          var blockSizeBytes = blockSize * 4;
          var nPaddingBytes = blockSizeBytes - dataSigBytes % blockSizeBytes;
          var lastBytePos = dataSigBytes + nPaddingBytes - 1;
          data.clamp();
          data.words[lastBytePos >>> 2] |= nPaddingBytes << 24 - lastBytePos % 4 * 8;
          data.sigBytes += nPaddingBytes;
        },
        unpad: function(data) {
          var nPaddingBytes = data.words[data.sigBytes - 1 >>> 2] & 255;
          data.sigBytes -= nPaddingBytes;
        }
      };
      return CryptoJS.pad.Ansix923;
    });
  }
});

// node_modules/crypto-js/pad-iso10126.js
var require_pad_iso10126 = __commonJS({
  "node_modules/crypto-js/pad-iso10126.js"(exports2, module2) {
    (function(root, factory, undef) {
      if (typeof exports2 === "object") {
        module2.exports = exports2 = factory(require_core(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports2, function(CryptoJS) {
      CryptoJS.pad.Iso10126 = {
        pad: function(data, blockSize) {
          var blockSizeBytes = blockSize * 4;
          var nPaddingBytes = blockSizeBytes - data.sigBytes % blockSizeBytes;
          data.concat(CryptoJS.lib.WordArray.random(nPaddingBytes - 1)).concat(CryptoJS.lib.WordArray.create([nPaddingBytes << 24], 1));
        },
        unpad: function(data) {
          var nPaddingBytes = data.words[data.sigBytes - 1 >>> 2] & 255;
          data.sigBytes -= nPaddingBytes;
        }
      };
      return CryptoJS.pad.Iso10126;
    });
  }
});

// node_modules/crypto-js/pad-iso97971.js
var require_pad_iso97971 = __commonJS({
  "node_modules/crypto-js/pad-iso97971.js"(exports2, module2) {
    (function(root, factory, undef) {
      if (typeof exports2 === "object") {
        module2.exports = exports2 = factory(require_core(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports2, function(CryptoJS) {
      CryptoJS.pad.Iso97971 = {
        pad: function(data, blockSize) {
          data.concat(CryptoJS.lib.WordArray.create([2147483648], 1));
          CryptoJS.pad.ZeroPadding.pad(data, blockSize);
        },
        unpad: function(data) {
          CryptoJS.pad.ZeroPadding.unpad(data);
          data.sigBytes--;
        }
      };
      return CryptoJS.pad.Iso97971;
    });
  }
});

// node_modules/crypto-js/pad-zeropadding.js
var require_pad_zeropadding = __commonJS({
  "node_modules/crypto-js/pad-zeropadding.js"(exports2, module2) {
    (function(root, factory, undef) {
      if (typeof exports2 === "object") {
        module2.exports = exports2 = factory(require_core(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports2, function(CryptoJS) {
      CryptoJS.pad.ZeroPadding = {
        pad: function(data, blockSize) {
          var blockSizeBytes = blockSize * 4;
          data.clamp();
          data.sigBytes += blockSizeBytes - (data.sigBytes % blockSizeBytes || blockSizeBytes);
        },
        unpad: function(data) {
          var dataWords = data.words;
          var i = data.sigBytes - 1;
          for (var i = data.sigBytes - 1; i >= 0; i--) {
            if (dataWords[i >>> 2] >>> 24 - i % 4 * 8 & 255) {
              data.sigBytes = i + 1;
              break;
            }
          }
        }
      };
      return CryptoJS.pad.ZeroPadding;
    });
  }
});

// node_modules/crypto-js/pad-nopadding.js
var require_pad_nopadding = __commonJS({
  "node_modules/crypto-js/pad-nopadding.js"(exports2, module2) {
    (function(root, factory, undef) {
      if (typeof exports2 === "object") {
        module2.exports = exports2 = factory(require_core(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports2, function(CryptoJS) {
      CryptoJS.pad.NoPadding = {
        pad: function() {
        },
        unpad: function() {
        }
      };
      return CryptoJS.pad.NoPadding;
    });
  }
});

// node_modules/crypto-js/format-hex.js
var require_format_hex = __commonJS({
  "node_modules/crypto-js/format-hex.js"(exports2, module2) {
    (function(root, factory, undef) {
      if (typeof exports2 === "object") {
        module2.exports = exports2 = factory(require_core(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports2, function(CryptoJS) {
      (function(undefined2) {
        var C = CryptoJS;
        var C_lib = C.lib;
        var CipherParams = C_lib.CipherParams;
        var C_enc = C.enc;
        var Hex = C_enc.Hex;
        var C_format = C.format;
        var HexFormatter = C_format.Hex = {
          /**
           * Converts the ciphertext of a cipher params object to a hexadecimally encoded string.
           *
           * @param {CipherParams} cipherParams The cipher params object.
           *
           * @return {string} The hexadecimally encoded string.
           *
           * @static
           *
           * @example
           *
           *     var hexString = CryptoJS.format.Hex.stringify(cipherParams);
           */
          stringify: function(cipherParams) {
            return cipherParams.ciphertext.toString(Hex);
          },
          /**
           * Converts a hexadecimally encoded ciphertext string to a cipher params object.
           *
           * @param {string} input The hexadecimally encoded string.
           *
           * @return {CipherParams} The cipher params object.
           *
           * @static
           *
           * @example
           *
           *     var cipherParams = CryptoJS.format.Hex.parse(hexString);
           */
          parse: function(input) {
            var ciphertext = Hex.parse(input);
            return CipherParams.create({ ciphertext });
          }
        };
      })();
      return CryptoJS.format.Hex;
    });
  }
});

// node_modules/crypto-js/aes.js
var require_aes = __commonJS({
  "node_modules/crypto-js/aes.js"(exports2, module2) {
    (function(root, factory, undef) {
      if (typeof exports2 === "object") {
        module2.exports = exports2 = factory(require_core(), require_enc_base64(), require_md5(), require_evpkdf(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./enc-base64", "./md5", "./evpkdf", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports2, function(CryptoJS) {
      (function() {
        var C = CryptoJS;
        var C_lib = C.lib;
        var BlockCipher = C_lib.BlockCipher;
        var C_algo = C.algo;
        var SBOX = [];
        var INV_SBOX = [];
        var SUB_MIX_0 = [];
        var SUB_MIX_1 = [];
        var SUB_MIX_2 = [];
        var SUB_MIX_3 = [];
        var INV_SUB_MIX_0 = [];
        var INV_SUB_MIX_1 = [];
        var INV_SUB_MIX_2 = [];
        var INV_SUB_MIX_3 = [];
        (function() {
          var d = [];
          for (var i = 0; i < 256; i++) {
            if (i < 128) {
              d[i] = i << 1;
            } else {
              d[i] = i << 1 ^ 283;
            }
          }
          var x = 0;
          var xi = 0;
          for (var i = 0; i < 256; i++) {
            var sx = xi ^ xi << 1 ^ xi << 2 ^ xi << 3 ^ xi << 4;
            sx = sx >>> 8 ^ sx & 255 ^ 99;
            SBOX[x] = sx;
            INV_SBOX[sx] = x;
            var x2 = d[x];
            var x4 = d[x2];
            var x8 = d[x4];
            var t = d[sx] * 257 ^ sx * 16843008;
            SUB_MIX_0[x] = t << 24 | t >>> 8;
            SUB_MIX_1[x] = t << 16 | t >>> 16;
            SUB_MIX_2[x] = t << 8 | t >>> 24;
            SUB_MIX_3[x] = t;
            var t = x8 * 16843009 ^ x4 * 65537 ^ x2 * 257 ^ x * 16843008;
            INV_SUB_MIX_0[sx] = t << 24 | t >>> 8;
            INV_SUB_MIX_1[sx] = t << 16 | t >>> 16;
            INV_SUB_MIX_2[sx] = t << 8 | t >>> 24;
            INV_SUB_MIX_3[sx] = t;
            if (!x) {
              x = xi = 1;
            } else {
              x = x2 ^ d[d[d[x8 ^ x2]]];
              xi ^= d[d[xi]];
            }
          }
        })();
        var RCON = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54];
        var AES = C_algo.AES = BlockCipher.extend({
          _doReset: function() {
            var t;
            if (this._nRounds && this._keyPriorReset === this._key) {
              return;
            }
            var key = this._keyPriorReset = this._key;
            var keyWords = key.words;
            var keySize = key.sigBytes / 4;
            var nRounds = this._nRounds = keySize + 6;
            var ksRows = (nRounds + 1) * 4;
            var keySchedule = this._keySchedule = [];
            for (var ksRow = 0; ksRow < ksRows; ksRow++) {
              if (ksRow < keySize) {
                keySchedule[ksRow] = keyWords[ksRow];
              } else {
                t = keySchedule[ksRow - 1];
                if (!(ksRow % keySize)) {
                  t = t << 8 | t >>> 24;
                  t = SBOX[t >>> 24] << 24 | SBOX[t >>> 16 & 255] << 16 | SBOX[t >>> 8 & 255] << 8 | SBOX[t & 255];
                  t ^= RCON[ksRow / keySize | 0] << 24;
                } else if (keySize > 6 && ksRow % keySize == 4) {
                  t = SBOX[t >>> 24] << 24 | SBOX[t >>> 16 & 255] << 16 | SBOX[t >>> 8 & 255] << 8 | SBOX[t & 255];
                }
                keySchedule[ksRow] = keySchedule[ksRow - keySize] ^ t;
              }
            }
            var invKeySchedule = this._invKeySchedule = [];
            for (var invKsRow = 0; invKsRow < ksRows; invKsRow++) {
              var ksRow = ksRows - invKsRow;
              if (invKsRow % 4) {
                var t = keySchedule[ksRow];
              } else {
                var t = keySchedule[ksRow - 4];
              }
              if (invKsRow < 4 || ksRow <= 4) {
                invKeySchedule[invKsRow] = t;
              } else {
                invKeySchedule[invKsRow] = INV_SUB_MIX_0[SBOX[t >>> 24]] ^ INV_SUB_MIX_1[SBOX[t >>> 16 & 255]] ^ INV_SUB_MIX_2[SBOX[t >>> 8 & 255]] ^ INV_SUB_MIX_3[SBOX[t & 255]];
              }
            }
          },
          encryptBlock: function(M, offset) {
            this._doCryptBlock(M, offset, this._keySchedule, SUB_MIX_0, SUB_MIX_1, SUB_MIX_2, SUB_MIX_3, SBOX);
          },
          decryptBlock: function(M, offset) {
            var t = M[offset + 1];
            M[offset + 1] = M[offset + 3];
            M[offset + 3] = t;
            this._doCryptBlock(M, offset, this._invKeySchedule, INV_SUB_MIX_0, INV_SUB_MIX_1, INV_SUB_MIX_2, INV_SUB_MIX_3, INV_SBOX);
            var t = M[offset + 1];
            M[offset + 1] = M[offset + 3];
            M[offset + 3] = t;
          },
          _doCryptBlock: function(M, offset, keySchedule, SUB_MIX_02, SUB_MIX_12, SUB_MIX_22, SUB_MIX_32, SBOX2) {
            var nRounds = this._nRounds;
            var s0 = M[offset] ^ keySchedule[0];
            var s1 = M[offset + 1] ^ keySchedule[1];
            var s2 = M[offset + 2] ^ keySchedule[2];
            var s3 = M[offset + 3] ^ keySchedule[3];
            var ksRow = 4;
            for (var round = 1; round < nRounds; round++) {
              var t0 = SUB_MIX_02[s0 >>> 24] ^ SUB_MIX_12[s1 >>> 16 & 255] ^ SUB_MIX_22[s2 >>> 8 & 255] ^ SUB_MIX_32[s3 & 255] ^ keySchedule[ksRow++];
              var t1 = SUB_MIX_02[s1 >>> 24] ^ SUB_MIX_12[s2 >>> 16 & 255] ^ SUB_MIX_22[s3 >>> 8 & 255] ^ SUB_MIX_32[s0 & 255] ^ keySchedule[ksRow++];
              var t2 = SUB_MIX_02[s2 >>> 24] ^ SUB_MIX_12[s3 >>> 16 & 255] ^ SUB_MIX_22[s0 >>> 8 & 255] ^ SUB_MIX_32[s1 & 255] ^ keySchedule[ksRow++];
              var t3 = SUB_MIX_02[s3 >>> 24] ^ SUB_MIX_12[s0 >>> 16 & 255] ^ SUB_MIX_22[s1 >>> 8 & 255] ^ SUB_MIX_32[s2 & 255] ^ keySchedule[ksRow++];
              s0 = t0;
              s1 = t1;
              s2 = t2;
              s3 = t3;
            }
            var t0 = (SBOX2[s0 >>> 24] << 24 | SBOX2[s1 >>> 16 & 255] << 16 | SBOX2[s2 >>> 8 & 255] << 8 | SBOX2[s3 & 255]) ^ keySchedule[ksRow++];
            var t1 = (SBOX2[s1 >>> 24] << 24 | SBOX2[s2 >>> 16 & 255] << 16 | SBOX2[s3 >>> 8 & 255] << 8 | SBOX2[s0 & 255]) ^ keySchedule[ksRow++];
            var t2 = (SBOX2[s2 >>> 24] << 24 | SBOX2[s3 >>> 16 & 255] << 16 | SBOX2[s0 >>> 8 & 255] << 8 | SBOX2[s1 & 255]) ^ keySchedule[ksRow++];
            var t3 = (SBOX2[s3 >>> 24] << 24 | SBOX2[s0 >>> 16 & 255] << 16 | SBOX2[s1 >>> 8 & 255] << 8 | SBOX2[s2 & 255]) ^ keySchedule[ksRow++];
            M[offset] = t0;
            M[offset + 1] = t1;
            M[offset + 2] = t2;
            M[offset + 3] = t3;
          },
          keySize: 256 / 32
        });
        C.AES = BlockCipher._createHelper(AES);
      })();
      return CryptoJS.AES;
    });
  }
});

// node_modules/crypto-js/tripledes.js
var require_tripledes = __commonJS({
  "node_modules/crypto-js/tripledes.js"(exports2, module2) {
    (function(root, factory, undef) {
      if (typeof exports2 === "object") {
        module2.exports = exports2 = factory(require_core(), require_enc_base64(), require_md5(), require_evpkdf(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./enc-base64", "./md5", "./evpkdf", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports2, function(CryptoJS) {
      (function() {
        var C = CryptoJS;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var BlockCipher = C_lib.BlockCipher;
        var C_algo = C.algo;
        var PC1 = [
          57,
          49,
          41,
          33,
          25,
          17,
          9,
          1,
          58,
          50,
          42,
          34,
          26,
          18,
          10,
          2,
          59,
          51,
          43,
          35,
          27,
          19,
          11,
          3,
          60,
          52,
          44,
          36,
          63,
          55,
          47,
          39,
          31,
          23,
          15,
          7,
          62,
          54,
          46,
          38,
          30,
          22,
          14,
          6,
          61,
          53,
          45,
          37,
          29,
          21,
          13,
          5,
          28,
          20,
          12,
          4
        ];
        var PC2 = [
          14,
          17,
          11,
          24,
          1,
          5,
          3,
          28,
          15,
          6,
          21,
          10,
          23,
          19,
          12,
          4,
          26,
          8,
          16,
          7,
          27,
          20,
          13,
          2,
          41,
          52,
          31,
          37,
          47,
          55,
          30,
          40,
          51,
          45,
          33,
          48,
          44,
          49,
          39,
          56,
          34,
          53,
          46,
          42,
          50,
          36,
          29,
          32
        ];
        var BIT_SHIFTS = [1, 2, 4, 6, 8, 10, 12, 14, 15, 17, 19, 21, 23, 25, 27, 28];
        var SBOX_P = [
          {
            0: 8421888,
            268435456: 32768,
            536870912: 8421378,
            805306368: 2,
            1073741824: 512,
            1342177280: 8421890,
            1610612736: 8389122,
            1879048192: 8388608,
            2147483648: 514,
            2415919104: 8389120,
            2684354560: 33280,
            2952790016: 8421376,
            3221225472: 32770,
            3489660928: 8388610,
            3758096384: 0,
            4026531840: 33282,
            134217728: 0,
            402653184: 8421890,
            671088640: 33282,
            939524096: 32768,
            1207959552: 8421888,
            1476395008: 512,
            1744830464: 8421378,
            2013265920: 2,
            2281701376: 8389120,
            2550136832: 33280,
            2818572288: 8421376,
            3087007744: 8389122,
            3355443200: 8388610,
            3623878656: 32770,
            3892314112: 514,
            4160749568: 8388608,
            1: 32768,
            268435457: 2,
            536870913: 8421888,
            805306369: 8388608,
            1073741825: 8421378,
            1342177281: 33280,
            1610612737: 512,
            1879048193: 8389122,
            2147483649: 8421890,
            2415919105: 8421376,
            2684354561: 8388610,
            2952790017: 33282,
            3221225473: 514,
            3489660929: 8389120,
            3758096385: 32770,
            4026531841: 0,
            134217729: 8421890,
            402653185: 8421376,
            671088641: 8388608,
            939524097: 512,
            1207959553: 32768,
            1476395009: 8388610,
            1744830465: 2,
            2013265921: 33282,
            2281701377: 32770,
            2550136833: 8389122,
            2818572289: 514,
            3087007745: 8421888,
            3355443201: 8389120,
            3623878657: 0,
            3892314113: 33280,
            4160749569: 8421378
          },
          {
            0: 1074282512,
            16777216: 16384,
            33554432: 524288,
            50331648: 1074266128,
            67108864: 1073741840,
            83886080: 1074282496,
            100663296: 1073758208,
            117440512: 16,
            134217728: 540672,
            150994944: 1073758224,
            167772160: 1073741824,
            184549376: 540688,
            201326592: 524304,
            218103808: 0,
            234881024: 16400,
            251658240: 1074266112,
            8388608: 1073758208,
            25165824: 540688,
            41943040: 16,
            58720256: 1073758224,
            75497472: 1074282512,
            92274688: 1073741824,
            109051904: 524288,
            125829120: 1074266128,
            142606336: 524304,
            159383552: 0,
            176160768: 16384,
            192937984: 1074266112,
            209715200: 1073741840,
            226492416: 540672,
            243269632: 1074282496,
            260046848: 16400,
            268435456: 0,
            285212672: 1074266128,
            301989888: 1073758224,
            318767104: 1074282496,
            335544320: 1074266112,
            352321536: 16,
            369098752: 540688,
            385875968: 16384,
            402653184: 16400,
            419430400: 524288,
            436207616: 524304,
            452984832: 1073741840,
            469762048: 540672,
            486539264: 1073758208,
            503316480: 1073741824,
            520093696: 1074282512,
            276824064: 540688,
            293601280: 524288,
            310378496: 1074266112,
            327155712: 16384,
            343932928: 1073758208,
            360710144: 1074282512,
            377487360: 16,
            394264576: 1073741824,
            411041792: 1074282496,
            427819008: 1073741840,
            444596224: 1073758224,
            461373440: 524304,
            478150656: 0,
            494927872: 16400,
            511705088: 1074266128,
            528482304: 540672
          },
          {
            0: 260,
            1048576: 0,
            2097152: 67109120,
            3145728: 65796,
            4194304: 65540,
            5242880: 67108868,
            6291456: 67174660,
            7340032: 67174400,
            8388608: 67108864,
            9437184: 67174656,
            10485760: 65792,
            11534336: 67174404,
            12582912: 67109124,
            13631488: 65536,
            14680064: 4,
            15728640: 256,
            524288: 67174656,
            1572864: 67174404,
            2621440: 0,
            3670016: 67109120,
            4718592: 67108868,
            5767168: 65536,
            6815744: 65540,
            7864320: 260,
            8912896: 4,
            9961472: 256,
            11010048: 67174400,
            12058624: 65796,
            13107200: 65792,
            14155776: 67109124,
            15204352: 67174660,
            16252928: 67108864,
            16777216: 67174656,
            17825792: 65540,
            18874368: 65536,
            19922944: 67109120,
            20971520: 256,
            22020096: 67174660,
            23068672: 67108868,
            24117248: 0,
            25165824: 67109124,
            26214400: 67108864,
            27262976: 4,
            28311552: 65792,
            29360128: 67174400,
            30408704: 260,
            31457280: 65796,
            32505856: 67174404,
            17301504: 67108864,
            18350080: 260,
            19398656: 67174656,
            20447232: 0,
            21495808: 65540,
            22544384: 67109120,
            23592960: 256,
            24641536: 67174404,
            25690112: 65536,
            26738688: 67174660,
            27787264: 65796,
            28835840: 67108868,
            29884416: 67109124,
            30932992: 67174400,
            31981568: 4,
            33030144: 65792
          },
          {
            0: 2151682048,
            65536: 2147487808,
            131072: 4198464,
            196608: 2151677952,
            262144: 0,
            327680: 4198400,
            393216: 2147483712,
            458752: 4194368,
            524288: 2147483648,
            589824: 4194304,
            655360: 64,
            720896: 2147487744,
            786432: 2151678016,
            851968: 4160,
            917504: 4096,
            983040: 2151682112,
            32768: 2147487808,
            98304: 64,
            163840: 2151678016,
            229376: 2147487744,
            294912: 4198400,
            360448: 2151682112,
            425984: 0,
            491520: 2151677952,
            557056: 4096,
            622592: 2151682048,
            688128: 4194304,
            753664: 4160,
            819200: 2147483648,
            884736: 4194368,
            950272: 4198464,
            1015808: 2147483712,
            1048576: 4194368,
            1114112: 4198400,
            1179648: 2147483712,
            1245184: 0,
            1310720: 4160,
            1376256: 2151678016,
            1441792: 2151682048,
            1507328: 2147487808,
            1572864: 2151682112,
            1638400: 2147483648,
            1703936: 2151677952,
            1769472: 4198464,
            1835008: 2147487744,
            1900544: 4194304,
            1966080: 64,
            2031616: 4096,
            1081344: 2151677952,
            1146880: 2151682112,
            1212416: 0,
            1277952: 4198400,
            1343488: 4194368,
            1409024: 2147483648,
            1474560: 2147487808,
            1540096: 64,
            1605632: 2147483712,
            1671168: 4096,
            1736704: 2147487744,
            1802240: 2151678016,
            1867776: 4160,
            1933312: 2151682048,
            1998848: 4194304,
            2064384: 4198464
          },
          {
            0: 128,
            4096: 17039360,
            8192: 262144,
            12288: 536870912,
            16384: 537133184,
            20480: 16777344,
            24576: 553648256,
            28672: 262272,
            32768: 16777216,
            36864: 537133056,
            40960: 536871040,
            45056: 553910400,
            49152: 553910272,
            53248: 0,
            57344: 17039488,
            61440: 553648128,
            2048: 17039488,
            6144: 553648256,
            10240: 128,
            14336: 17039360,
            18432: 262144,
            22528: 537133184,
            26624: 553910272,
            30720: 536870912,
            34816: 537133056,
            38912: 0,
            43008: 553910400,
            47104: 16777344,
            51200: 536871040,
            55296: 553648128,
            59392: 16777216,
            63488: 262272,
            65536: 262144,
            69632: 128,
            73728: 536870912,
            77824: 553648256,
            81920: 16777344,
            86016: 553910272,
            90112: 537133184,
            94208: 16777216,
            98304: 553910400,
            102400: 553648128,
            106496: 17039360,
            110592: 537133056,
            114688: 262272,
            118784: 536871040,
            122880: 0,
            126976: 17039488,
            67584: 553648256,
            71680: 16777216,
            75776: 17039360,
            79872: 537133184,
            83968: 536870912,
            88064: 17039488,
            92160: 128,
            96256: 553910272,
            100352: 262272,
            104448: 553910400,
            108544: 0,
            112640: 553648128,
            116736: 16777344,
            120832: 262144,
            124928: 537133056,
            129024: 536871040
          },
          {
            0: 268435464,
            256: 8192,
            512: 270532608,
            768: 270540808,
            1024: 268443648,
            1280: 2097152,
            1536: 2097160,
            1792: 268435456,
            2048: 0,
            2304: 268443656,
            2560: 2105344,
            2816: 8,
            3072: 270532616,
            3328: 2105352,
            3584: 8200,
            3840: 270540800,
            128: 270532608,
            384: 270540808,
            640: 8,
            896: 2097152,
            1152: 2105352,
            1408: 268435464,
            1664: 268443648,
            1920: 8200,
            2176: 2097160,
            2432: 8192,
            2688: 268443656,
            2944: 270532616,
            3200: 0,
            3456: 270540800,
            3712: 2105344,
            3968: 268435456,
            4096: 268443648,
            4352: 270532616,
            4608: 270540808,
            4864: 8200,
            5120: 2097152,
            5376: 268435456,
            5632: 268435464,
            5888: 2105344,
            6144: 2105352,
            6400: 0,
            6656: 8,
            6912: 270532608,
            7168: 8192,
            7424: 268443656,
            7680: 270540800,
            7936: 2097160,
            4224: 8,
            4480: 2105344,
            4736: 2097152,
            4992: 268435464,
            5248: 268443648,
            5504: 8200,
            5760: 270540808,
            6016: 270532608,
            6272: 270540800,
            6528: 270532616,
            6784: 8192,
            7040: 2105352,
            7296: 2097160,
            7552: 0,
            7808: 268435456,
            8064: 268443656
          },
          {
            0: 1048576,
            16: 33555457,
            32: 1024,
            48: 1049601,
            64: 34604033,
            80: 0,
            96: 1,
            112: 34603009,
            128: 33555456,
            144: 1048577,
            160: 33554433,
            176: 34604032,
            192: 34603008,
            208: 1025,
            224: 1049600,
            240: 33554432,
            8: 34603009,
            24: 0,
            40: 33555457,
            56: 34604032,
            72: 1048576,
            88: 33554433,
            104: 33554432,
            120: 1025,
            136: 1049601,
            152: 33555456,
            168: 34603008,
            184: 1048577,
            200: 1024,
            216: 34604033,
            232: 1,
            248: 1049600,
            256: 33554432,
            272: 1048576,
            288: 33555457,
            304: 34603009,
            320: 1048577,
            336: 33555456,
            352: 34604032,
            368: 1049601,
            384: 1025,
            400: 34604033,
            416: 1049600,
            432: 1,
            448: 0,
            464: 34603008,
            480: 33554433,
            496: 1024,
            264: 1049600,
            280: 33555457,
            296: 34603009,
            312: 1,
            328: 33554432,
            344: 1048576,
            360: 1025,
            376: 34604032,
            392: 33554433,
            408: 34603008,
            424: 0,
            440: 34604033,
            456: 1049601,
            472: 1024,
            488: 33555456,
            504: 1048577
          },
          {
            0: 134219808,
            1: 131072,
            2: 134217728,
            3: 32,
            4: 131104,
            5: 134350880,
            6: 134350848,
            7: 2048,
            8: 134348800,
            9: 134219776,
            10: 133120,
            11: 134348832,
            12: 2080,
            13: 0,
            14: 134217760,
            15: 133152,
            2147483648: 2048,
            2147483649: 134350880,
            2147483650: 134219808,
            2147483651: 134217728,
            2147483652: 134348800,
            2147483653: 133120,
            2147483654: 133152,
            2147483655: 32,
            2147483656: 134217760,
            2147483657: 2080,
            2147483658: 131104,
            2147483659: 134350848,
            2147483660: 0,
            2147483661: 134348832,
            2147483662: 134219776,
            2147483663: 131072,
            16: 133152,
            17: 134350848,
            18: 32,
            19: 2048,
            20: 134219776,
            21: 134217760,
            22: 134348832,
            23: 131072,
            24: 0,
            25: 131104,
            26: 134348800,
            27: 134219808,
            28: 134350880,
            29: 133120,
            30: 2080,
            31: 134217728,
            2147483664: 131072,
            2147483665: 2048,
            2147483666: 134348832,
            2147483667: 133152,
            2147483668: 32,
            2147483669: 134348800,
            2147483670: 134217728,
            2147483671: 134219808,
            2147483672: 134350880,
            2147483673: 134217760,
            2147483674: 134219776,
            2147483675: 0,
            2147483676: 133120,
            2147483677: 2080,
            2147483678: 131104,
            2147483679: 134350848
          }
        ];
        var SBOX_MASK = [
          4160749569,
          528482304,
          33030144,
          2064384,
          129024,
          8064,
          504,
          2147483679
        ];
        var DES = C_algo.DES = BlockCipher.extend({
          _doReset: function() {
            var key = this._key;
            var keyWords = key.words;
            var keyBits = [];
            for (var i = 0; i < 56; i++) {
              var keyBitPos = PC1[i] - 1;
              keyBits[i] = keyWords[keyBitPos >>> 5] >>> 31 - keyBitPos % 32 & 1;
            }
            var subKeys = this._subKeys = [];
            for (var nSubKey = 0; nSubKey < 16; nSubKey++) {
              var subKey = subKeys[nSubKey] = [];
              var bitShift = BIT_SHIFTS[nSubKey];
              for (var i = 0; i < 24; i++) {
                subKey[i / 6 | 0] |= keyBits[(PC2[i] - 1 + bitShift) % 28] << 31 - i % 6;
                subKey[4 + (i / 6 | 0)] |= keyBits[28 + (PC2[i + 24] - 1 + bitShift) % 28] << 31 - i % 6;
              }
              subKey[0] = subKey[0] << 1 | subKey[0] >>> 31;
              for (var i = 1; i < 7; i++) {
                subKey[i] = subKey[i] >>> (i - 1) * 4 + 3;
              }
              subKey[7] = subKey[7] << 5 | subKey[7] >>> 27;
            }
            var invSubKeys = this._invSubKeys = [];
            for (var i = 0; i < 16; i++) {
              invSubKeys[i] = subKeys[15 - i];
            }
          },
          encryptBlock: function(M, offset) {
            this._doCryptBlock(M, offset, this._subKeys);
          },
          decryptBlock: function(M, offset) {
            this._doCryptBlock(M, offset, this._invSubKeys);
          },
          _doCryptBlock: function(M, offset, subKeys) {
            this._lBlock = M[offset];
            this._rBlock = M[offset + 1];
            exchangeLR.call(this, 4, 252645135);
            exchangeLR.call(this, 16, 65535);
            exchangeRL.call(this, 2, 858993459);
            exchangeRL.call(this, 8, 16711935);
            exchangeLR.call(this, 1, 1431655765);
            for (var round = 0; round < 16; round++) {
              var subKey = subKeys[round];
              var lBlock = this._lBlock;
              var rBlock = this._rBlock;
              var f = 0;
              for (var i = 0; i < 8; i++) {
                f |= SBOX_P[i][((rBlock ^ subKey[i]) & SBOX_MASK[i]) >>> 0];
              }
              this._lBlock = rBlock;
              this._rBlock = lBlock ^ f;
            }
            var t = this._lBlock;
            this._lBlock = this._rBlock;
            this._rBlock = t;
            exchangeLR.call(this, 1, 1431655765);
            exchangeRL.call(this, 8, 16711935);
            exchangeRL.call(this, 2, 858993459);
            exchangeLR.call(this, 16, 65535);
            exchangeLR.call(this, 4, 252645135);
            M[offset] = this._lBlock;
            M[offset + 1] = this._rBlock;
          },
          keySize: 64 / 32,
          ivSize: 64 / 32,
          blockSize: 64 / 32
        });
        function exchangeLR(offset, mask) {
          var t = (this._lBlock >>> offset ^ this._rBlock) & mask;
          this._rBlock ^= t;
          this._lBlock ^= t << offset;
        }
        function exchangeRL(offset, mask) {
          var t = (this._rBlock >>> offset ^ this._lBlock) & mask;
          this._lBlock ^= t;
          this._rBlock ^= t << offset;
        }
        C.DES = BlockCipher._createHelper(DES);
        var TripleDES = C_algo.TripleDES = BlockCipher.extend({
          _doReset: function() {
            var key = this._key;
            var keyWords = key.words;
            if (keyWords.length !== 2 && keyWords.length !== 4 && keyWords.length < 6) {
              throw new Error("Invalid key length - 3DES requires the key length to be 64, 128, 192 or >192.");
            }
            var key1 = keyWords.slice(0, 2);
            var key2 = keyWords.length < 4 ? keyWords.slice(0, 2) : keyWords.slice(2, 4);
            var key3 = keyWords.length < 6 ? keyWords.slice(0, 2) : keyWords.slice(4, 6);
            this._des1 = DES.createEncryptor(WordArray.create(key1));
            this._des2 = DES.createEncryptor(WordArray.create(key2));
            this._des3 = DES.createEncryptor(WordArray.create(key3));
          },
          encryptBlock: function(M, offset) {
            this._des1.encryptBlock(M, offset);
            this._des2.decryptBlock(M, offset);
            this._des3.encryptBlock(M, offset);
          },
          decryptBlock: function(M, offset) {
            this._des3.decryptBlock(M, offset);
            this._des2.encryptBlock(M, offset);
            this._des1.decryptBlock(M, offset);
          },
          keySize: 192 / 32,
          ivSize: 64 / 32,
          blockSize: 64 / 32
        });
        C.TripleDES = BlockCipher._createHelper(TripleDES);
      })();
      return CryptoJS.TripleDES;
    });
  }
});

// node_modules/crypto-js/rc4.js
var require_rc4 = __commonJS({
  "node_modules/crypto-js/rc4.js"(exports2, module2) {
    (function(root, factory, undef) {
      if (typeof exports2 === "object") {
        module2.exports = exports2 = factory(require_core(), require_enc_base64(), require_md5(), require_evpkdf(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./enc-base64", "./md5", "./evpkdf", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports2, function(CryptoJS) {
      (function() {
        var C = CryptoJS;
        var C_lib = C.lib;
        var StreamCipher = C_lib.StreamCipher;
        var C_algo = C.algo;
        var RC4 = C_algo.RC4 = StreamCipher.extend({
          _doReset: function() {
            var key = this._key;
            var keyWords = key.words;
            var keySigBytes = key.sigBytes;
            var S = this._S = [];
            for (var i = 0; i < 256; i++) {
              S[i] = i;
            }
            for (var i = 0, j = 0; i < 256; i++) {
              var keyByteIndex = i % keySigBytes;
              var keyByte = keyWords[keyByteIndex >>> 2] >>> 24 - keyByteIndex % 4 * 8 & 255;
              j = (j + S[i] + keyByte) % 256;
              var t = S[i];
              S[i] = S[j];
              S[j] = t;
            }
            this._i = this._j = 0;
          },
          _doProcessBlock: function(M, offset) {
            M[offset] ^= generateKeystreamWord.call(this);
          },
          keySize: 256 / 32,
          ivSize: 0
        });
        function generateKeystreamWord() {
          var S = this._S;
          var i = this._i;
          var j = this._j;
          var keystreamWord = 0;
          for (var n = 0; n < 4; n++) {
            i = (i + 1) % 256;
            j = (j + S[i]) % 256;
            var t = S[i];
            S[i] = S[j];
            S[j] = t;
            keystreamWord |= S[(S[i] + S[j]) % 256] << 24 - n * 8;
          }
          this._i = i;
          this._j = j;
          return keystreamWord;
        }
        C.RC4 = StreamCipher._createHelper(RC4);
        var RC4Drop = C_algo.RC4Drop = RC4.extend({
          /**
           * Configuration options.
           *
           * @property {number} drop The number of keystream words to drop. Default 192
           */
          cfg: RC4.cfg.extend({
            drop: 192
          }),
          _doReset: function() {
            RC4._doReset.call(this);
            for (var i = this.cfg.drop; i > 0; i--) {
              generateKeystreamWord.call(this);
            }
          }
        });
        C.RC4Drop = StreamCipher._createHelper(RC4Drop);
      })();
      return CryptoJS.RC4;
    });
  }
});

// node_modules/crypto-js/rabbit.js
var require_rabbit = __commonJS({
  "node_modules/crypto-js/rabbit.js"(exports2, module2) {
    (function(root, factory, undef) {
      if (typeof exports2 === "object") {
        module2.exports = exports2 = factory(require_core(), require_enc_base64(), require_md5(), require_evpkdf(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./enc-base64", "./md5", "./evpkdf", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports2, function(CryptoJS) {
      (function() {
        var C = CryptoJS;
        var C_lib = C.lib;
        var StreamCipher = C_lib.StreamCipher;
        var C_algo = C.algo;
        var S = [];
        var C_ = [];
        var G = [];
        var Rabbit = C_algo.Rabbit = StreamCipher.extend({
          _doReset: function() {
            var K = this._key.words;
            var iv = this.cfg.iv;
            for (var i = 0; i < 4; i++) {
              K[i] = (K[i] << 8 | K[i] >>> 24) & 16711935 | (K[i] << 24 | K[i] >>> 8) & 4278255360;
            }
            var X = this._X = [
              K[0],
              K[3] << 16 | K[2] >>> 16,
              K[1],
              K[0] << 16 | K[3] >>> 16,
              K[2],
              K[1] << 16 | K[0] >>> 16,
              K[3],
              K[2] << 16 | K[1] >>> 16
            ];
            var C2 = this._C = [
              K[2] << 16 | K[2] >>> 16,
              K[0] & 4294901760 | K[1] & 65535,
              K[3] << 16 | K[3] >>> 16,
              K[1] & 4294901760 | K[2] & 65535,
              K[0] << 16 | K[0] >>> 16,
              K[2] & 4294901760 | K[3] & 65535,
              K[1] << 16 | K[1] >>> 16,
              K[3] & 4294901760 | K[0] & 65535
            ];
            this._b = 0;
            for (var i = 0; i < 4; i++) {
              nextState.call(this);
            }
            for (var i = 0; i < 8; i++) {
              C2[i] ^= X[i + 4 & 7];
            }
            if (iv) {
              var IV = iv.words;
              var IV_0 = IV[0];
              var IV_1 = IV[1];
              var i0 = (IV_0 << 8 | IV_0 >>> 24) & 16711935 | (IV_0 << 24 | IV_0 >>> 8) & 4278255360;
              var i2 = (IV_1 << 8 | IV_1 >>> 24) & 16711935 | (IV_1 << 24 | IV_1 >>> 8) & 4278255360;
              var i1 = i0 >>> 16 | i2 & 4294901760;
              var i3 = i2 << 16 | i0 & 65535;
              C2[0] ^= i0;
              C2[1] ^= i1;
              C2[2] ^= i2;
              C2[3] ^= i3;
              C2[4] ^= i0;
              C2[5] ^= i1;
              C2[6] ^= i2;
              C2[7] ^= i3;
              for (var i = 0; i < 4; i++) {
                nextState.call(this);
              }
            }
          },
          _doProcessBlock: function(M, offset) {
            var X = this._X;
            nextState.call(this);
            S[0] = X[0] ^ X[5] >>> 16 ^ X[3] << 16;
            S[1] = X[2] ^ X[7] >>> 16 ^ X[5] << 16;
            S[2] = X[4] ^ X[1] >>> 16 ^ X[7] << 16;
            S[3] = X[6] ^ X[3] >>> 16 ^ X[1] << 16;
            for (var i = 0; i < 4; i++) {
              S[i] = (S[i] << 8 | S[i] >>> 24) & 16711935 | (S[i] << 24 | S[i] >>> 8) & 4278255360;
              M[offset + i] ^= S[i];
            }
          },
          blockSize: 128 / 32,
          ivSize: 64 / 32
        });
        function nextState() {
          var X = this._X;
          var C2 = this._C;
          for (var i = 0; i < 8; i++) {
            C_[i] = C2[i];
          }
          C2[0] = C2[0] + 1295307597 + this._b | 0;
          C2[1] = C2[1] + 3545052371 + (C2[0] >>> 0 < C_[0] >>> 0 ? 1 : 0) | 0;
          C2[2] = C2[2] + 886263092 + (C2[1] >>> 0 < C_[1] >>> 0 ? 1 : 0) | 0;
          C2[3] = C2[3] + 1295307597 + (C2[2] >>> 0 < C_[2] >>> 0 ? 1 : 0) | 0;
          C2[4] = C2[4] + 3545052371 + (C2[3] >>> 0 < C_[3] >>> 0 ? 1 : 0) | 0;
          C2[5] = C2[5] + 886263092 + (C2[4] >>> 0 < C_[4] >>> 0 ? 1 : 0) | 0;
          C2[6] = C2[6] + 1295307597 + (C2[5] >>> 0 < C_[5] >>> 0 ? 1 : 0) | 0;
          C2[7] = C2[7] + 3545052371 + (C2[6] >>> 0 < C_[6] >>> 0 ? 1 : 0) | 0;
          this._b = C2[7] >>> 0 < C_[7] >>> 0 ? 1 : 0;
          for (var i = 0; i < 8; i++) {
            var gx = X[i] + C2[i];
            var ga = gx & 65535;
            var gb = gx >>> 16;
            var gh = ((ga * ga >>> 17) + ga * gb >>> 15) + gb * gb;
            var gl = ((gx & 4294901760) * gx | 0) + ((gx & 65535) * gx | 0);
            G[i] = gh ^ gl;
          }
          X[0] = G[0] + (G[7] << 16 | G[7] >>> 16) + (G[6] << 16 | G[6] >>> 16) | 0;
          X[1] = G[1] + (G[0] << 8 | G[0] >>> 24) + G[7] | 0;
          X[2] = G[2] + (G[1] << 16 | G[1] >>> 16) + (G[0] << 16 | G[0] >>> 16) | 0;
          X[3] = G[3] + (G[2] << 8 | G[2] >>> 24) + G[1] | 0;
          X[4] = G[4] + (G[3] << 16 | G[3] >>> 16) + (G[2] << 16 | G[2] >>> 16) | 0;
          X[5] = G[5] + (G[4] << 8 | G[4] >>> 24) + G[3] | 0;
          X[6] = G[6] + (G[5] << 16 | G[5] >>> 16) + (G[4] << 16 | G[4] >>> 16) | 0;
          X[7] = G[7] + (G[6] << 8 | G[6] >>> 24) + G[5] | 0;
        }
        C.Rabbit = StreamCipher._createHelper(Rabbit);
      })();
      return CryptoJS.Rabbit;
    });
  }
});

// node_modules/crypto-js/rabbit-legacy.js
var require_rabbit_legacy = __commonJS({
  "node_modules/crypto-js/rabbit-legacy.js"(exports2, module2) {
    (function(root, factory, undef) {
      if (typeof exports2 === "object") {
        module2.exports = exports2 = factory(require_core(), require_enc_base64(), require_md5(), require_evpkdf(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./enc-base64", "./md5", "./evpkdf", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports2, function(CryptoJS) {
      (function() {
        var C = CryptoJS;
        var C_lib = C.lib;
        var StreamCipher = C_lib.StreamCipher;
        var C_algo = C.algo;
        var S = [];
        var C_ = [];
        var G = [];
        var RabbitLegacy = C_algo.RabbitLegacy = StreamCipher.extend({
          _doReset: function() {
            var K = this._key.words;
            var iv = this.cfg.iv;
            var X = this._X = [
              K[0],
              K[3] << 16 | K[2] >>> 16,
              K[1],
              K[0] << 16 | K[3] >>> 16,
              K[2],
              K[1] << 16 | K[0] >>> 16,
              K[3],
              K[2] << 16 | K[1] >>> 16
            ];
            var C2 = this._C = [
              K[2] << 16 | K[2] >>> 16,
              K[0] & 4294901760 | K[1] & 65535,
              K[3] << 16 | K[3] >>> 16,
              K[1] & 4294901760 | K[2] & 65535,
              K[0] << 16 | K[0] >>> 16,
              K[2] & 4294901760 | K[3] & 65535,
              K[1] << 16 | K[1] >>> 16,
              K[3] & 4294901760 | K[0] & 65535
            ];
            this._b = 0;
            for (var i = 0; i < 4; i++) {
              nextState.call(this);
            }
            for (var i = 0; i < 8; i++) {
              C2[i] ^= X[i + 4 & 7];
            }
            if (iv) {
              var IV = iv.words;
              var IV_0 = IV[0];
              var IV_1 = IV[1];
              var i0 = (IV_0 << 8 | IV_0 >>> 24) & 16711935 | (IV_0 << 24 | IV_0 >>> 8) & 4278255360;
              var i2 = (IV_1 << 8 | IV_1 >>> 24) & 16711935 | (IV_1 << 24 | IV_1 >>> 8) & 4278255360;
              var i1 = i0 >>> 16 | i2 & 4294901760;
              var i3 = i2 << 16 | i0 & 65535;
              C2[0] ^= i0;
              C2[1] ^= i1;
              C2[2] ^= i2;
              C2[3] ^= i3;
              C2[4] ^= i0;
              C2[5] ^= i1;
              C2[6] ^= i2;
              C2[7] ^= i3;
              for (var i = 0; i < 4; i++) {
                nextState.call(this);
              }
            }
          },
          _doProcessBlock: function(M, offset) {
            var X = this._X;
            nextState.call(this);
            S[0] = X[0] ^ X[5] >>> 16 ^ X[3] << 16;
            S[1] = X[2] ^ X[7] >>> 16 ^ X[5] << 16;
            S[2] = X[4] ^ X[1] >>> 16 ^ X[7] << 16;
            S[3] = X[6] ^ X[3] >>> 16 ^ X[1] << 16;
            for (var i = 0; i < 4; i++) {
              S[i] = (S[i] << 8 | S[i] >>> 24) & 16711935 | (S[i] << 24 | S[i] >>> 8) & 4278255360;
              M[offset + i] ^= S[i];
            }
          },
          blockSize: 128 / 32,
          ivSize: 64 / 32
        });
        function nextState() {
          var X = this._X;
          var C2 = this._C;
          for (var i = 0; i < 8; i++) {
            C_[i] = C2[i];
          }
          C2[0] = C2[0] + 1295307597 + this._b | 0;
          C2[1] = C2[1] + 3545052371 + (C2[0] >>> 0 < C_[0] >>> 0 ? 1 : 0) | 0;
          C2[2] = C2[2] + 886263092 + (C2[1] >>> 0 < C_[1] >>> 0 ? 1 : 0) | 0;
          C2[3] = C2[3] + 1295307597 + (C2[2] >>> 0 < C_[2] >>> 0 ? 1 : 0) | 0;
          C2[4] = C2[4] + 3545052371 + (C2[3] >>> 0 < C_[3] >>> 0 ? 1 : 0) | 0;
          C2[5] = C2[5] + 886263092 + (C2[4] >>> 0 < C_[4] >>> 0 ? 1 : 0) | 0;
          C2[6] = C2[6] + 1295307597 + (C2[5] >>> 0 < C_[5] >>> 0 ? 1 : 0) | 0;
          C2[7] = C2[7] + 3545052371 + (C2[6] >>> 0 < C_[6] >>> 0 ? 1 : 0) | 0;
          this._b = C2[7] >>> 0 < C_[7] >>> 0 ? 1 : 0;
          for (var i = 0; i < 8; i++) {
            var gx = X[i] + C2[i];
            var ga = gx & 65535;
            var gb = gx >>> 16;
            var gh = ((ga * ga >>> 17) + ga * gb >>> 15) + gb * gb;
            var gl = ((gx & 4294901760) * gx | 0) + ((gx & 65535) * gx | 0);
            G[i] = gh ^ gl;
          }
          X[0] = G[0] + (G[7] << 16 | G[7] >>> 16) + (G[6] << 16 | G[6] >>> 16) | 0;
          X[1] = G[1] + (G[0] << 8 | G[0] >>> 24) + G[7] | 0;
          X[2] = G[2] + (G[1] << 16 | G[1] >>> 16) + (G[0] << 16 | G[0] >>> 16) | 0;
          X[3] = G[3] + (G[2] << 8 | G[2] >>> 24) + G[1] | 0;
          X[4] = G[4] + (G[3] << 16 | G[3] >>> 16) + (G[2] << 16 | G[2] >>> 16) | 0;
          X[5] = G[5] + (G[4] << 8 | G[4] >>> 24) + G[3] | 0;
          X[6] = G[6] + (G[5] << 16 | G[5] >>> 16) + (G[4] << 16 | G[4] >>> 16) | 0;
          X[7] = G[7] + (G[6] << 8 | G[6] >>> 24) + G[5] | 0;
        }
        C.RabbitLegacy = StreamCipher._createHelper(RabbitLegacy);
      })();
      return CryptoJS.RabbitLegacy;
    });
  }
});

// node_modules/crypto-js/blowfish.js
var require_blowfish = __commonJS({
  "node_modules/crypto-js/blowfish.js"(exports2, module2) {
    (function(root, factory, undef) {
      if (typeof exports2 === "object") {
        module2.exports = exports2 = factory(require_core(), require_enc_base64(), require_md5(), require_evpkdf(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./enc-base64", "./md5", "./evpkdf", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports2, function(CryptoJS) {
      (function() {
        var C = CryptoJS;
        var C_lib = C.lib;
        var BlockCipher = C_lib.BlockCipher;
        var C_algo = C.algo;
        const N = 16;
        const ORIG_P = [
          608135816,
          2242054355,
          320440878,
          57701188,
          2752067618,
          698298832,
          137296536,
          3964562569,
          1160258022,
          953160567,
          3193202383,
          887688300,
          3232508343,
          3380367581,
          1065670069,
          3041331479,
          2450970073,
          2306472731
        ];
        const ORIG_S = [
          [
            3509652390,
            2564797868,
            805139163,
            3491422135,
            3101798381,
            1780907670,
            3128725573,
            4046225305,
            614570311,
            3012652279,
            134345442,
            2240740374,
            1667834072,
            1901547113,
            2757295779,
            4103290238,
            227898511,
            1921955416,
            1904987480,
            2182433518,
            2069144605,
            3260701109,
            2620446009,
            720527379,
            3318853667,
            677414384,
            3393288472,
            3101374703,
            2390351024,
            1614419982,
            1822297739,
            2954791486,
            3608508353,
            3174124327,
            2024746970,
            1432378464,
            3864339955,
            2857741204,
            1464375394,
            1676153920,
            1439316330,
            715854006,
            3033291828,
            289532110,
            2706671279,
            2087905683,
            3018724369,
            1668267050,
            732546397,
            1947742710,
            3462151702,
            2609353502,
            2950085171,
            1814351708,
            2050118529,
            680887927,
            999245976,
            1800124847,
            3300911131,
            1713906067,
            1641548236,
            4213287313,
            1216130144,
            1575780402,
            4018429277,
            3917837745,
            3693486850,
            3949271944,
            596196993,
            3549867205,
            258830323,
            2213823033,
            772490370,
            2760122372,
            1774776394,
            2652871518,
            566650946,
            4142492826,
            1728879713,
            2882767088,
            1783734482,
            3629395816,
            2517608232,
            2874225571,
            1861159788,
            326777828,
            3124490320,
            2130389656,
            2716951837,
            967770486,
            1724537150,
            2185432712,
            2364442137,
            1164943284,
            2105845187,
            998989502,
            3765401048,
            2244026483,
            1075463327,
            1455516326,
            1322494562,
            910128902,
            469688178,
            1117454909,
            936433444,
            3490320968,
            3675253459,
            1240580251,
            122909385,
            2157517691,
            634681816,
            4142456567,
            3825094682,
            3061402683,
            2540495037,
            79693498,
            3249098678,
            1084186820,
            1583128258,
            426386531,
            1761308591,
            1047286709,
            322548459,
            995290223,
            1845252383,
            2603652396,
            3431023940,
            2942221577,
            3202600964,
            3727903485,
            1712269319,
            422464435,
            3234572375,
            1170764815,
            3523960633,
            3117677531,
            1434042557,
            442511882,
            3600875718,
            1076654713,
            1738483198,
            4213154764,
            2393238008,
            3677496056,
            1014306527,
            4251020053,
            793779912,
            2902807211,
            842905082,
            4246964064,
            1395751752,
            1040244610,
            2656851899,
            3396308128,
            445077038,
            3742853595,
            3577915638,
            679411651,
            2892444358,
            2354009459,
            1767581616,
            3150600392,
            3791627101,
            3102740896,
            284835224,
            4246832056,
            1258075500,
            768725851,
            2589189241,
            3069724005,
            3532540348,
            1274779536,
            3789419226,
            2764799539,
            1660621633,
            3471099624,
            4011903706,
            913787905,
            3497959166,
            737222580,
            2514213453,
            2928710040,
            3937242737,
            1804850592,
            3499020752,
            2949064160,
            2386320175,
            2390070455,
            2415321851,
            4061277028,
            2290661394,
            2416832540,
            1336762016,
            1754252060,
            3520065937,
            3014181293,
            791618072,
            3188594551,
            3933548030,
            2332172193,
            3852520463,
            3043980520,
            413987798,
            3465142937,
            3030929376,
            4245938359,
            2093235073,
            3534596313,
            375366246,
            2157278981,
            2479649556,
            555357303,
            3870105701,
            2008414854,
            3344188149,
            4221384143,
            3956125452,
            2067696032,
            3594591187,
            2921233993,
            2428461,
            544322398,
            577241275,
            1471733935,
            610547355,
            4027169054,
            1432588573,
            1507829418,
            2025931657,
            3646575487,
            545086370,
            48609733,
            2200306550,
            1653985193,
            298326376,
            1316178497,
            3007786442,
            2064951626,
            458293330,
            2589141269,
            3591329599,
            3164325604,
            727753846,
            2179363840,
            146436021,
            1461446943,
            4069977195,
            705550613,
            3059967265,
            3887724982,
            4281599278,
            3313849956,
            1404054877,
            2845806497,
            146425753,
            1854211946
          ],
          [
            1266315497,
            3048417604,
            3681880366,
            3289982499,
            290971e4,
            1235738493,
            2632868024,
            2414719590,
            3970600049,
            1771706367,
            1449415276,
            3266420449,
            422970021,
            1963543593,
            2690192192,
            3826793022,
            1062508698,
            1531092325,
            1804592342,
            2583117782,
            2714934279,
            4024971509,
            1294809318,
            4028980673,
            1289560198,
            2221992742,
            1669523910,
            35572830,
            157838143,
            1052438473,
            1016535060,
            1802137761,
            1753167236,
            1386275462,
            3080475397,
            2857371447,
            1040679964,
            2145300060,
            2390574316,
            1461121720,
            2956646967,
            4031777805,
            4028374788,
            33600511,
            2920084762,
            1018524850,
            629373528,
            3691585981,
            3515945977,
            2091462646,
            2486323059,
            586499841,
            988145025,
            935516892,
            3367335476,
            2599673255,
            2839830854,
            265290510,
            3972581182,
            2759138881,
            3795373465,
            1005194799,
            847297441,
            406762289,
            1314163512,
            1332590856,
            1866599683,
            4127851711,
            750260880,
            613907577,
            1450815602,
            3165620655,
            3734664991,
            3650291728,
            3012275730,
            3704569646,
            1427272223,
            778793252,
            1343938022,
            2676280711,
            2052605720,
            1946737175,
            3164576444,
            3914038668,
            3967478842,
            3682934266,
            1661551462,
            3294938066,
            4011595847,
            840292616,
            3712170807,
            616741398,
            312560963,
            711312465,
            1351876610,
            322626781,
            1910503582,
            271666773,
            2175563734,
            1594956187,
            70604529,
            3617834859,
            1007753275,
            1495573769,
            4069517037,
            2549218298,
            2663038764,
            504708206,
            2263041392,
            3941167025,
            2249088522,
            1514023603,
            1998579484,
            1312622330,
            694541497,
            2582060303,
            2151582166,
            1382467621,
            776784248,
            2618340202,
            3323268794,
            2497899128,
            2784771155,
            503983604,
            4076293799,
            907881277,
            423175695,
            432175456,
            1378068232,
            4145222326,
            3954048622,
            3938656102,
            3820766613,
            2793130115,
            2977904593,
            26017576,
            3274890735,
            3194772133,
            1700274565,
            1756076034,
            4006520079,
            3677328699,
            720338349,
            1533947780,
            354530856,
            688349552,
            3973924725,
            1637815568,
            332179504,
            3949051286,
            53804574,
            2852348879,
            3044236432,
            1282449977,
            3583942155,
            3416972820,
            4006381244,
            1617046695,
            2628476075,
            3002303598,
            1686838959,
            431878346,
            2686675385,
            1700445008,
            1080580658,
            1009431731,
            832498133,
            3223435511,
            2605976345,
            2271191193,
            2516031870,
            1648197032,
            4164389018,
            2548247927,
            300782431,
            375919233,
            238389289,
            3353747414,
            2531188641,
            2019080857,
            1475708069,
            455242339,
            2609103871,
            448939670,
            3451063019,
            1395535956,
            2413381860,
            1841049896,
            1491858159,
            885456874,
            4264095073,
            4001119347,
            1565136089,
            3898914787,
            1108368660,
            540939232,
            1173283510,
            2745871338,
            3681308437,
            4207628240,
            3343053890,
            4016749493,
            1699691293,
            1103962373,
            3625875870,
            2256883143,
            3830138730,
            1031889488,
            3479347698,
            1535977030,
            4236805024,
            3251091107,
            2132092099,
            1774941330,
            1199868427,
            1452454533,
            157007616,
            2904115357,
            342012276,
            595725824,
            1480756522,
            206960106,
            497939518,
            591360097,
            863170706,
            2375253569,
            3596610801,
            1814182875,
            2094937945,
            3421402208,
            1082520231,
            3463918190,
            2785509508,
            435703966,
            3908032597,
            1641649973,
            2842273706,
            3305899714,
            1510255612,
            2148256476,
            2655287854,
            3276092548,
            4258621189,
            236887753,
            3681803219,
            274041037,
            1734335097,
            3815195456,
            3317970021,
            1899903192,
            1026095262,
            4050517792,
            356393447,
            2410691914,
            3873677099,
            3682840055
          ],
          [
            3913112168,
            2491498743,
            4132185628,
            2489919796,
            1091903735,
            1979897079,
            3170134830,
            3567386728,
            3557303409,
            857797738,
            1136121015,
            1342202287,
            507115054,
            2535736646,
            337727348,
            3213592640,
            1301675037,
            2528481711,
            1895095763,
            1721773893,
            3216771564,
            62756741,
            2142006736,
            835421444,
            2531993523,
            1442658625,
            3659876326,
            2882144922,
            676362277,
            1392781812,
            170690266,
            3921047035,
            1759253602,
            3611846912,
            1745797284,
            664899054,
            1329594018,
            3901205900,
            3045908486,
            2062866102,
            2865634940,
            3543621612,
            3464012697,
            1080764994,
            553557557,
            3656615353,
            3996768171,
            991055499,
            499776247,
            1265440854,
            648242737,
            3940784050,
            980351604,
            3713745714,
            1749149687,
            3396870395,
            4211799374,
            3640570775,
            1161844396,
            3125318951,
            1431517754,
            545492359,
            4268468663,
            3499529547,
            1437099964,
            2702547544,
            3433638243,
            2581715763,
            2787789398,
            1060185593,
            1593081372,
            2418618748,
            4260947970,
            69676912,
            2159744348,
            86519011,
            2512459080,
            3838209314,
            1220612927,
            3339683548,
            133810670,
            1090789135,
            1078426020,
            1569222167,
            845107691,
            3583754449,
            4072456591,
            1091646820,
            628848692,
            1613405280,
            3757631651,
            526609435,
            236106946,
            48312990,
            2942717905,
            3402727701,
            1797494240,
            859738849,
            992217954,
            4005476642,
            2243076622,
            3870952857,
            3732016268,
            765654824,
            3490871365,
            2511836413,
            1685915746,
            3888969200,
            1414112111,
            2273134842,
            3281911079,
            4080962846,
            172450625,
            2569994100,
            980381355,
            4109958455,
            2819808352,
            2716589560,
            2568741196,
            3681446669,
            3329971472,
            1835478071,
            660984891,
            3704678404,
            4045999559,
            3422617507,
            3040415634,
            1762651403,
            1719377915,
            3470491036,
            2693910283,
            3642056355,
            3138596744,
            1364962596,
            2073328063,
            1983633131,
            926494387,
            3423689081,
            2150032023,
            4096667949,
            1749200295,
            3328846651,
            309677260,
            2016342300,
            1779581495,
            3079819751,
            111262694,
            1274766160,
            443224088,
            298511866,
            1025883608,
            3806446537,
            1145181785,
            168956806,
            3641502830,
            3584813610,
            1689216846,
            3666258015,
            3200248200,
            1692713982,
            2646376535,
            4042768518,
            1618508792,
            1610833997,
            3523052358,
            4130873264,
            2001055236,
            3610705100,
            2202168115,
            4028541809,
            2961195399,
            1006657119,
            2006996926,
            3186142756,
            1430667929,
            3210227297,
            1314452623,
            4074634658,
            4101304120,
            2273951170,
            1399257539,
            3367210612,
            3027628629,
            1190975929,
            2062231137,
            2333990788,
            2221543033,
            2438960610,
            1181637006,
            548689776,
            2362791313,
            3372408396,
            3104550113,
            3145860560,
            296247880,
            1970579870,
            3078560182,
            3769228297,
            1714227617,
            3291629107,
            3898220290,
            166772364,
            1251581989,
            493813264,
            448347421,
            195405023,
            2709975567,
            677966185,
            3703036547,
            1463355134,
            2715995803,
            1338867538,
            1343315457,
            2802222074,
            2684532164,
            233230375,
            2599980071,
            2000651841,
            3277868038,
            1638401717,
            4028070440,
            3237316320,
            6314154,
            819756386,
            300326615,
            590932579,
            1405279636,
            3267499572,
            3150704214,
            2428286686,
            3959192993,
            3461946742,
            1862657033,
            1266418056,
            963775037,
            2089974820,
            2263052895,
            1917689273,
            448879540,
            3550394620,
            3981727096,
            150775221,
            3627908307,
            1303187396,
            508620638,
            2975983352,
            2726630617,
            1817252668,
            1876281319,
            1457606340,
            908771278,
            3720792119,
            3617206836,
            2455994898,
            1729034894,
            1080033504
          ],
          [
            976866871,
            3556439503,
            2881648439,
            1522871579,
            1555064734,
            1336096578,
            3548522304,
            2579274686,
            3574697629,
            3205460757,
            3593280638,
            3338716283,
            3079412587,
            564236357,
            2993598910,
            1781952180,
            1464380207,
            3163844217,
            3332601554,
            1699332808,
            1393555694,
            1183702653,
            3581086237,
            1288719814,
            691649499,
            2847557200,
            2895455976,
            3193889540,
            2717570544,
            1781354906,
            1676643554,
            2592534050,
            3230253752,
            1126444790,
            2770207658,
            2633158820,
            2210423226,
            2615765581,
            2414155088,
            3127139286,
            673620729,
            2805611233,
            1269405062,
            4015350505,
            3341807571,
            4149409754,
            1057255273,
            2012875353,
            2162469141,
            2276492801,
            2601117357,
            993977747,
            3918593370,
            2654263191,
            753973209,
            36408145,
            2530585658,
            25011837,
            3520020182,
            2088578344,
            530523599,
            2918365339,
            1524020338,
            1518925132,
            3760827505,
            3759777254,
            1202760957,
            3985898139,
            3906192525,
            674977740,
            4174734889,
            2031300136,
            2019492241,
            3983892565,
            4153806404,
            3822280332,
            352677332,
            2297720250,
            60907813,
            90501309,
            3286998549,
            1016092578,
            2535922412,
            2839152426,
            457141659,
            509813237,
            4120667899,
            652014361,
            1966332200,
            2975202805,
            55981186,
            2327461051,
            676427537,
            3255491064,
            2882294119,
            3433927263,
            1307055953,
            942726286,
            933058658,
            2468411793,
            3933900994,
            4215176142,
            1361170020,
            2001714738,
            2830558078,
            3274259782,
            1222529897,
            1679025792,
            2729314320,
            3714953764,
            1770335741,
            151462246,
            3013232138,
            1682292957,
            1483529935,
            471910574,
            1539241949,
            458788160,
            3436315007,
            1807016891,
            3718408830,
            978976581,
            1043663428,
            3165965781,
            1927990952,
            4200891579,
            2372276910,
            3208408903,
            3533431907,
            1412390302,
            2931980059,
            4132332400,
            1947078029,
            3881505623,
            4168226417,
            2941484381,
            1077988104,
            1320477388,
            886195818,
            18198404,
            3786409e3,
            2509781533,
            112762804,
            3463356488,
            1866414978,
            891333506,
            18488651,
            661792760,
            1628790961,
            3885187036,
            3141171499,
            876946877,
            2693282273,
            1372485963,
            791857591,
            2686433993,
            3759982718,
            3167212022,
            3472953795,
            2716379847,
            445679433,
            3561995674,
            3504004811,
            3574258232,
            54117162,
            3331405415,
            2381918588,
            3769707343,
            4154350007,
            1140177722,
            4074052095,
            668550556,
            3214352940,
            367459370,
            261225585,
            2610173221,
            4209349473,
            3468074219,
            3265815641,
            314222801,
            3066103646,
            3808782860,
            282218597,
            3406013506,
            3773591054,
            379116347,
            1285071038,
            846784868,
            2669647154,
            3771962079,
            3550491691,
            2305946142,
            453669953,
            1268987020,
            3317592352,
            3279303384,
            3744833421,
            2610507566,
            3859509063,
            266596637,
            3847019092,
            517658769,
            3462560207,
            3443424879,
            370717030,
            4247526661,
            2224018117,
            4143653529,
            4112773975,
            2788324899,
            2477274417,
            1456262402,
            2901442914,
            1517677493,
            1846949527,
            2295493580,
            3734397586,
            2176403920,
            1280348187,
            1908823572,
            3871786941,
            846861322,
            1172426758,
            3287448474,
            3383383037,
            1655181056,
            3139813346,
            901632758,
            1897031941,
            2986607138,
            3066810236,
            3447102507,
            1393639104,
            373351379,
            950779232,
            625454576,
            3124240540,
            4148612726,
            2007998917,
            544563296,
            2244738638,
            2330496472,
            2058025392,
            1291430526,
            424198748,
            50039436,
            29584100,
            3605783033,
            2429876329,
            2791104160,
            1057563949,
            3255363231,
            3075367218,
            3463963227,
            1469046755,
            985887462
          ]
        ];
        var BLOWFISH_CTX = {
          pbox: [],
          sbox: []
        };
        function F(ctx, x) {
          let a = x >> 24 & 255;
          let b = x >> 16 & 255;
          let c = x >> 8 & 255;
          let d = x & 255;
          let y = ctx.sbox[0][a] + ctx.sbox[1][b];
          y = y ^ ctx.sbox[2][c];
          y = y + ctx.sbox[3][d];
          return y;
        }
        function BlowFish_Encrypt(ctx, left, right) {
          let Xl = left;
          let Xr = right;
          let temp;
          for (let i = 0; i < N; ++i) {
            Xl = Xl ^ ctx.pbox[i];
            Xr = F(ctx, Xl) ^ Xr;
            temp = Xl;
            Xl = Xr;
            Xr = temp;
          }
          temp = Xl;
          Xl = Xr;
          Xr = temp;
          Xr = Xr ^ ctx.pbox[N];
          Xl = Xl ^ ctx.pbox[N + 1];
          return { left: Xl, right: Xr };
        }
        function BlowFish_Decrypt(ctx, left, right) {
          let Xl = left;
          let Xr = right;
          let temp;
          for (let i = N + 1; i > 1; --i) {
            Xl = Xl ^ ctx.pbox[i];
            Xr = F(ctx, Xl) ^ Xr;
            temp = Xl;
            Xl = Xr;
            Xr = temp;
          }
          temp = Xl;
          Xl = Xr;
          Xr = temp;
          Xr = Xr ^ ctx.pbox[1];
          Xl = Xl ^ ctx.pbox[0];
          return { left: Xl, right: Xr };
        }
        function BlowFishInit(ctx, key, keysize) {
          for (let Row = 0; Row < 4; Row++) {
            ctx.sbox[Row] = [];
            for (let Col = 0; Col < 256; Col++) {
              ctx.sbox[Row][Col] = ORIG_S[Row][Col];
            }
          }
          let keyIndex = 0;
          for (let index = 0; index < N + 2; index++) {
            ctx.pbox[index] = ORIG_P[index] ^ key[keyIndex];
            keyIndex++;
            if (keyIndex >= keysize) {
              keyIndex = 0;
            }
          }
          let Data1 = 0;
          let Data2 = 0;
          let res = 0;
          for (let i = 0; i < N + 2; i += 2) {
            res = BlowFish_Encrypt(ctx, Data1, Data2);
            Data1 = res.left;
            Data2 = res.right;
            ctx.pbox[i] = Data1;
            ctx.pbox[i + 1] = Data2;
          }
          for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 256; j += 2) {
              res = BlowFish_Encrypt(ctx, Data1, Data2);
              Data1 = res.left;
              Data2 = res.right;
              ctx.sbox[i][j] = Data1;
              ctx.sbox[i][j + 1] = Data2;
            }
          }
          return true;
        }
        var Blowfish = C_algo.Blowfish = BlockCipher.extend({
          _doReset: function() {
            if (this._keyPriorReset === this._key) {
              return;
            }
            var key = this._keyPriorReset = this._key;
            var keyWords = key.words;
            var keySize = key.sigBytes / 4;
            BlowFishInit(BLOWFISH_CTX, keyWords, keySize);
          },
          encryptBlock: function(M, offset) {
            var res = BlowFish_Encrypt(BLOWFISH_CTX, M[offset], M[offset + 1]);
            M[offset] = res.left;
            M[offset + 1] = res.right;
          },
          decryptBlock: function(M, offset) {
            var res = BlowFish_Decrypt(BLOWFISH_CTX, M[offset], M[offset + 1]);
            M[offset] = res.left;
            M[offset + 1] = res.right;
          },
          blockSize: 64 / 32,
          keySize: 128 / 32,
          ivSize: 64 / 32
        });
        C.Blowfish = BlockCipher._createHelper(Blowfish);
      })();
      return CryptoJS.Blowfish;
    });
  }
});

// node_modules/crypto-js/index.js
var require_crypto_js = __commonJS({
  "node_modules/crypto-js/index.js"(exports2, module2) {
    (function(root, factory, undef) {
      if (typeof exports2 === "object") {
        module2.exports = exports2 = factory(require_core(), require_x64_core(), require_lib_typedarrays(), require_enc_utf16(), require_enc_base64(), require_enc_base64url(), require_md5(), require_sha1(), require_sha256(), require_sha224(), require_sha512(), require_sha384(), require_sha3(), require_ripemd160(), require_hmac(), require_pbkdf2(), require_evpkdf(), require_cipher_core(), require_mode_cfb(), require_mode_ctr(), require_mode_ctr_gladman(), require_mode_ofb(), require_mode_ecb(), require_pad_ansix923(), require_pad_iso10126(), require_pad_iso97971(), require_pad_zeropadding(), require_pad_nopadding(), require_format_hex(), require_aes(), require_tripledes(), require_rc4(), require_rabbit(), require_rabbit_legacy(), require_blowfish());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./x64-core", "./lib-typedarrays", "./enc-utf16", "./enc-base64", "./enc-base64url", "./md5", "./sha1", "./sha256", "./sha224", "./sha512", "./sha384", "./sha3", "./ripemd160", "./hmac", "./pbkdf2", "./evpkdf", "./cipher-core", "./mode-cfb", "./mode-ctr", "./mode-ctr-gladman", "./mode-ofb", "./mode-ecb", "./pad-ansix923", "./pad-iso10126", "./pad-iso97971", "./pad-zeropadding", "./pad-nopadding", "./format-hex", "./aes", "./tripledes", "./rc4", "./rabbit", "./rabbit-legacy", "./blowfish"], factory);
      } else {
        root.CryptoJS = factory(root.CryptoJS);
      }
    })(exports2, function(CryptoJS) {
      return CryptoJS;
    });
  }
});

// src/utils/embedseek.js
var require_embedseek = __commonJS({
  "src/utils/embedseek.js"(exports2, module2) {
    var CryptoJS = require_crypto_js();
    var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    function generateKey(hostname) {
      let n = "";
      const b = "7519".split("");
      for (let i = 0; i < b.length; i++)
        n += String.fromCharCode(parseInt("10" + b[i]));
      n += String.fromCharCode(hostname.charCodeAt(1));
      n += n.substring(1, 3);
      n += String.fromCharCode(110, 109, 117);
      const re = "3579".split("");
      n += String.fromCharCode(parseInt(re[3] + re[2]), parseInt(re[1] + re[2]));
      const s1 = (parseInt(re[0]) + 1).toString() + re[3];
      n += String.fromCharCode(parseInt(s1), parseInt(s1));
      const s2 = (parseInt(re[3]) * 10 + parseInt(re[3])).toString();
      const s3 = re.reverse().join("").substring(0, 2);
      n += String.fromCharCode(parseInt(s2), parseInt(s3));
      return CryptoJS.enc.Utf8.parse(n.substring(0, 16));
    }
    function generateIV(hostname, hash) {
      const s = hostname;
      const p = s + "//";
      const o = hash;
      const g = s.length * p.length;
      let b = "";
      for (let i = 1; i < 10; i++)
        b += String.fromCharCode(i + g);
      const pe = 3 * o.charCodeAt(0);
      const tt = 111 + s.length;
      const k = tt + 4;
      const ie = s.charCodeAt(1);
      const me = ie - 2;
      b += String.fromCharCode(g, 111, pe, tt, k, ie, me);
      return CryptoJS.enc.Utf8.parse(b.substring(0, 16));
    }
    function decrypt2(hex, keyWA, ivWA) {
      const ciphertextWA = CryptoJS.enc.Hex.parse(hex);
      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: ciphertextWA },
        keyWA,
        { iv: ivWA, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
      );
      return decrypted.toString(CryptoJS.enc.Utf8);
    }
    async function resolve2(url) {
      try {
        const UA3 = UA2;
        const parsedUrl = new URL(url);
        const hostname = parsedUrl.hostname;
        const hash = parsedUrl.hash;
        const id = hash.replace("#", "").split("&")[0];
        if (!id)
          return null;
        const apiUrl = parsedUrl.origin + "/api/v1/info?id=" + id;
        const headers = { "User-Agent": UA3, "Referer": url, "Origin": parsedUrl.origin };
        const response = await fetch(apiUrl, { headers });
        if (!response.ok)
          return null;
        const encryptedData = await response.text();
        if (typeof encryptedData !== "string" || encryptedData.length < 10)
          return null;
        const key = generateKey(hostname);
        const iv = generateIV(hostname, hash);
        const decrypted = decrypt2(encryptedData, key, iv);
        const data = JSON.parse(decrypted);
        if (data && data.url) {
          let videoUrl = data.url;
          if (videoUrl.startsWith("/"))
            videoUrl = parsedUrl.origin + videoUrl;
          return {
            url: videoUrl,
            headers: { "User-Agent": UA3, "Referer": url, "Origin": parsedUrl.origin }
          };
        }
        return null;
      } catch (e) {
        return null;
      }
    }
    module2.exports = { resolve: resolve2 };
  }
});

// src/utils/dropcdn.js
var require_dropcdn = __commonJS({
  "src/utils/dropcdn.js"(exports2, module2) {
    var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
    function unpack(packed) {
      try {
        const m = packed.match(/eval\(function\(p,a,c,k,e,d\)\{.*?return p\}\('(.+)',(\d+),(\d+),'(.+)'\.split\('\|'\)\)\)/s);
        if (!m)
          return packed;
        let p = m[1];
        const a = parseInt(m[2]), c = parseInt(m[3]), k = m[4].split("|");
        p = p.replace(/\\'/g, "'").replace(/\\\\/g, "\\");
        const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const encode = (i, b) => i < b ? alphabet[i] : encode(Math.floor(i / b), b) + alphabet[i % b];
        for (let i = c - 1; i >= 0; i--) {
          if (k[i])
            p = p.replace(new RegExp("\\b" + encode(i, a) + "\\b", "g"), k[i]);
        }
        return p;
      } catch (e) {
        return packed;
      }
    }
    async function resolve2(url, signal) {
      try {
        const normalizedUrl = url.toString().replace("/d/", "/").replace("/e/", "/").replace("/embed-", "/");
        const idMatch = normalizedUrl.match(/\/([a-zA-Z0-9]+)$/) || normalizedUrl.match(/\/([a-zA-Z0-9]+)_o\//);
        const fileCode = idMatch ? idMatch[1] : normalizedUrl.split("/").pop();
        const embedUrl = "https://dr0pstream.com/e/" + fileCode;
        console.log(`[DropCDN] Handshake: ${fileCode}`);
        const BROWSER_HEADERS = {
          "User-Agent": UA2,
          "Accept": "*/*",
          "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
          "Referer": "https://dr0pstream.com/",
          "Origin": "https://dr0pstream.com",
          "X-Requested-With": "XMLHttpRequest"
        };
        const response = await fetch(embedUrl, { headers: BROWSER_HEADERS, signal });
        if (!response.ok)
          return null;
        const html = await response.text();
        const cookiePairs = [];
        const cookiePattern = /\$\.cookie\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]*)['"]/g;
        let cMatch;
        while ((cMatch = cookiePattern.exec(html)) !== null) {
          cookiePairs.push(cMatch[1] + "=" + cMatch[2]);
        }
        const cookieHeader = cookiePairs.join("; ");
        let unpacked = "";
        const packerMatch = html.match(/eval\(function\(p,a,c,k,e,d\)\{.*?return p\}\('(.*?)',(\d+),(\d+),'(.*?)'\.split\('\|'\)\)\)/s);
        if (packerMatch)
          unpacked = unpack(packerMatch[0]);
        const longNumbers = unpacked.match(/\b\d{10}\b/g) || [];
        const hexHashes = unpacked.match(/\b([a-f0-9]{32})\b/g) || [];
        const viewIds = unpacked.match(/\b\d{6,7}\b/g) || [];
        if (longNumbers.length > 0 && hexHashes.length > 0) {
          const part1 = longNumbers[longNumbers.length - 1];
          const part2 = hexHashes[hexHashes.length - 1];
          const dynamicHash = part1 + "-" + part2;
          const viewId = viewIds.length > 0 ? viewIds[viewIds.length - 1] : "303030";
          const beaconUrl = "https://dr0pstream.com/dl?op=view&file_code=" + fileCode + "&hash=" + dynamicHash + "&view_id=" + viewId + "&adb=0";
          await fetch(beaconUrl, {
            headers: { ...BROWSER_HEADERS, "Cookie": cookieHeader, "Referer": embedUrl }
          }).catch(() => {
          });
        }
        const searchContext = unpacked + "\n" + html;
        const m3u8Matches = searchContext.match(/https?:\/\/[^"']+\.m3u8[^"']*/g);
        if (m3u8Matches && m3u8Matches.length > 0) {
          let m3u8Url = m3u8Matches.find((u) => u.includes("master.m3u8") && u.includes("?t=")) || m3u8Matches.find((u) => u.includes("master.m3u8")) || m3u8Matches[0];
          m3u8Url = m3u8Url.replace(/\\\//g, "/");
          if (m3u8Url.includes("dropcdn.io")) {
            m3u8Url = m3u8Url.replace("r1.dropcdn.io", "ds2.dropcdn.io").replace("_o/", "/").replace("_o.m3u8", ".m3u8");
            if (!m3u8Url.includes("srv="))
              m3u8Url += (m3u8Url.includes("?") ? "&" : "?") + "srv=ds2i";
          }
          return {
            url: m3u8Url,
            headers: { ...BROWSER_HEADERS, "Cookie": cookieHeader, "Referer": "https://dr0pstream.com/" }
          };
        }
        return null;
      } catch (e) {
        return null;
      }
    }
    module2.exports = { resolve: resolve2 };
  }
});

// src/utils/vidsrc.js
var require_vidsrc = __commonJS({
  "src/utils/vidsrc.js"(exports2, module2) {
    var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
    function crsdiv(a, decId) {
      try {
        if (decId === "sXnL9MQIry") {
          const b = Array.from("pWB9V)[*4I`nJpp?ozyB~dbr9yt!_n4u").map((c) => c.charCodeAt(0));
          const d = a.match(/.{2}/g).map((x) => parseInt(x, 16));
          const decrypted = d.map((v, i) => (v ^ b[i % b.length]) - 3);
          return atob(String.fromCharCode(...decrypted));
        }
        if (decId === "IhWrImMIGL") {
          const d = Array.from(a).map((ch) => {
            const code = ch.charCodeAt(0);
            if (code >= 97 && code <= 109 || code >= 65 && code <= 77)
              return String.fromCharCode(code + 13);
            if (code >= 110 && code <= 122 || code >= 78 && code <= 90)
              return String.fromCharCode(code - 13);
            return ch;
          }).join("");
          return atob(d);
        }
        if (decId === "xTyBxQyGTA") {
          const b = a.split("").reverse().join("");
          let c = "";
          for (let i = 0; i < b.length; i += 2)
            c += b[i];
          return atob(c);
        }
        if (["JoAHUMCLXV", "Oi3v1dAlaM", "TsA2KGDGux"].includes(decId)) {
          const shift = { JoAHUMCLXV: 3, Oi3v1dAlaM: 5, TsA2KGDGux: 7 }[decId];
          const b64 = a.split("").reverse().join("").replace(/-/g, "+").replace(/_/g, "/");
          const decoded = atob(b64);
          return Array.from(decoded).map((ch) => String.fromCharCode(ch.charCodeAt(0) - shift)).join("");
        }
        return null;
      } catch (e) {
        return null;
      }
    }
    async function resolve2(url, signal) {
      try {
        let embedUrl = url.toString().replace("vidsrc.to", "vidsrc.xyz").replace("vidsrc.pm", "vidsrc.xyz").replace("moviesapi.club/movie", "cdn.moviesapi.to/embed/movie").replace("moviesapi.to/movie", "cdn.moviesapi.to/embed/movie");
        console.log(`[VidSrc] Resolviendo: ${embedUrl}`);
        const headers = { "User-Agent": UA2, "Referer": "https://vidsrc.xyz/" };
        const res1 = await fetch(embedUrl, { headers, signal });
        if (!res1.ok)
          return null;
        const html1 = await res1.text();
        const iframeMatch = html1.match(/src=['"]([^"]+)['"] f/);
        if (!iframeMatch)
          return null;
        let nextUrl = iframeMatch[1];
        if (nextUrl.startsWith("//"))
          nextUrl = "https:" + nextUrl;
        const res2 = await fetch(nextUrl, { headers: { ...headers, "Referer": embedUrl }, signal });
        if (!res2.ok)
          return null;
        const html2 = await res2.text();
        const encryptedMatch = html2.match(/id="([^"]+)" style="display:none;">([^<]+)/);
        if (!encryptedMatch)
          return null;
        const decId = encryptedMatch[1];
        const cipherText = encryptedMatch[2];
        const decrypted = crsdiv(cipherText, decId);
        if (!decrypted)
          return null;
        const finalUrl = decrypted.split(" ")[0].replace("{v1}", "thrumbleandjaxon.com");
        return {
          url: finalUrl,
          headers: { "User-Agent": UA2, "Referer": nextUrl, "Origin": new URL(nextUrl).origin }
        };
      } catch (e) {
        return null;
      }
    }
    module2.exports = { resolve: resolve2 };
  }
});

// src/utils/doodstream.js
var require_doodstream = __commonJS({
  "src/utils/doodstream.js"(exports2, module2) {
    var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    async function resolve2(url, signal) {
      try {
        console.log(`[DoodStream] Resolviendo: ${url}`);
        let embedUrl = url;
        if (!embedUrl.includes("/e/")) {
          embedUrl = embedUrl.replace(/\/(d|f)\//, "/e/");
        }
        const response = await fetch(embedUrl, {
          signal,
          headers: { "User-Agent": UA2, "Referer": "https://lamovie.cc/" }
        });
        if (!response.ok)
          return null;
        const html = await response.text();
        const fetchRegex = /\$\.get\(['"](\/pass_md5\/[\w-]+)\/([\w-]+)['"]/i;
        const match = html.match(fetchRegex);
        if (!match)
          return null;
        const passPath = match[1];
        const token = match[2];
        const domain = new URL(embedUrl).origin;
        const passUrl = domain + passPath;
        const passRes = await fetch(passUrl, {
          headers: { "User-Agent": UA2, "Referer": embedUrl },
          signal
        });
        if (!passRes.ok)
          return null;
        const videoBaseUrl = await passRes.text();
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let randomString = "";
        for (let i = 0; i < 10; i++)
          randomString += chars.charAt(Math.floor(Math.random() * chars.length));
        const expiry = Date.now();
        const finalVideoUrl = videoBaseUrl + randomString + "?token=" + token + "&expiry=" + expiry;
        return {
          url: finalVideoUrl,
          headers: { "User-Agent": UA2, "Referer": domain + "/" }
        };
      } catch (e) {
        return null;
      }
    }
    module2.exports = { resolve: resolve2 };
  }
});

// src/utils/vidnest.js
var require_vidnest = __commonJS({
  "src/utils/vidnest.js"(exports2, module2) {
    var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
    async function resolve2(embedUrl) {
      try {
        const res = await fetch(embedUrl, {
          headers: { "Referer": "https://www.fuegocine.com/", "User-Agent": UA2 },
          redirect: "follow"
        });
        if (!res.ok)
          return null;
        const html = await res.text();
        const match = html.match(/sources\s*:\s*\[\s*\{[^}]*file\s*:\s*"([^"]+\.mp4[^"]*)"/);
        if (match && match[1]) {
          return { url: match[1], headers: { "Referer": embedUrl } };
        }
        return null;
      } catch (e) {
        return null;
      }
    }
    module2.exports = { resolve: resolve2 };
  }
});

// src/utils/vidsonic.js
var require_vidsonic = __commonJS({
  "src/utils/vidsonic.js"(exports2, module2) {
    var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
    async function resolve2(embedUrl) {
      try {
        const id = embedUrl.split("/").pop().replace(".html", "");
        const targetUrl = "https://vidsonic.net/e/" + id;
        const res = await fetch(targetUrl, {
          headers: { "Referer": "https://www.fuegocine.com/", "User-Agent": UA2 }
        });
        if (!res.ok)
          return null;
        const html = await res.text();
        const vMatch = html.match(/const\s+_0x1\s*=\s*['"]([^'"]+)['"]/);
        if (vMatch) {
          const clean3 = vMatch[1].split("|").join("");
          let decoded = "";
          for (let i = 0; i < clean3.length; i += 2)
            decoded += String.fromCharCode(parseInt(clean3.substr(i, 2), 16));
          const finalUrl = decoded.split("").reverse().join("");
          if (finalUrl.includes("http"))
            return { url: finalUrl, headers: { "Referer": targetUrl } };
        }
        const hexMatch = html.match(/\["([a-f0-9]{50,})"\]/);
        if (hexMatch) {
          const hex = hexMatch[1].split("").reverse().join("");
          let decoded = "";
          for (let i = 0; i < hex.length; i += 2)
            decoded += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
          if (decoded.includes("http"))
            return { url: decoded, headers: { "Referer": targetUrl } };
        }
        return null;
      } catch (e) {
        return null;
      }
    }
    module2.exports = { resolve: resolve2 };
  }
});

// src/utils/barmonrey.js
var require_barmonrey = __commonJS({
  "src/utils/barmonrey.js"(exports2, module2) {
    var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
    async function resolve2(embedUrl) {
      try {
        const res = await fetch(embedUrl, {
          headers: { "Referer": "https://www.fuegocine.com/", "User-Agent": UA2 },
          redirect: "follow"
        });
        if (!res.ok)
          return null;
        const html = await res.text();
        const m3u8 = html.match(/https?:\/\/[^"']+\.m3u8[^"']*/);
        if (m3u8) {
          return { url: m3u8[0], headers: { "Referer": embedUrl } };
        }
        return null;
      } catch (e) {
        return null;
      }
    }
    module2.exports = { resolve: resolve2 };
  }
});

// src/utils/yandex.js
var require_yandex = __commonJS({
  "src/utils/yandex.js"(exports2, module2) {
    var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
    function getQuality(name) {
      if (!name)
        return "HD";
      var m = name.match(/(\d{3,4})[pP]/);
      return m ? m[1] + "p" : "HD";
    }
    async function resolve2(url) {
      try {
        console.log("[Yandex] Resolviendo: " + url);
        var apiUrl = "https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=" + encodeURIComponent(url);
        var res = await fetch(apiUrl, {
          headers: { "User-Agent": UA2, "Accept": "application/json" }
        });
        if (!res.ok) {
          console.log("[Yandex] API HTTP " + res.status);
          return null;
        }
        var data = await res.json();
        if (!data.href) {
          console.log("[Yandex] No se encontr\xF3 link de descarga");
          return null;
        }
        var nameMatch = data.href.match(/filename=([^&]+)/);
        var name = nameMatch ? decodeURIComponent(nameMatch[1]) : "";
        var quality = getQuality(name);
        console.log("[Yandex] Descarga directa (" + quality + "): " + data.href.substring(0, 80) + "...");
        return {
          url: data.href,
          quality,
          headers: {
            "User-Agent": UA2,
            "Referer": "https://disk.yandex.ru/"
          }
        };
      } catch (e) {
        console.log("[Yandex] Error: " + e.message);
        return null;
      }
    }
    module2.exports = { resolve: resolve2 };
  }
});

// src/utils/vidmoly.js
var require_vidmoly = __commonJS({
  "src/utils/vidmoly.js"(exports2, module2) {
    var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
    async function resolve2(embedUrl) {
      try {
        const urlObj = new URL(embedUrl);
        const videoId = urlObj.pathname.split("/").pop().replace(".html", "").replace("embed-", "");
        const targetUrl = "https://vidmoly.to/embed-" + videoId + ".html";
        const res = await fetch(targetUrl, {
          headers: { "Referer": "https://vidmoly.to/", "User-Agent": UA2, "Accept": "text/html" }
        });
        if (!res.ok)
          return null;
        const html = await res.text();
        const match = html.match(/sources\s*:\s*\[\s*\{\s*file\s*:\s*["']([^"']+)["']/);
        if (match && match[1]) {
          return {
            url: match[1],
            headers: { "Referer": targetUrl, "User-Agent": UA2 }
          };
        }
        return null;
      } catch (e) {
        return null;
      }
    }
    module2.exports = { resolve: resolve2 };
  }
});

// src/utils/rpmvid.js
var require_rpmvid = __commonJS({
  "src/utils/rpmvid.js"(exports2, module2) {
    var CryptoJS = require_crypto_js();
    var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
    async function resolve2(embedUrl) {
      try {
        const id = embedUrl.split("/").pop().replace(".html", "");
        const isUpns = embedUrl.includes("upns");
        const apiDomain = isUpns ? "https://fuegocineplayer.upns.online" : "https://rpmvid.com";
        const apiUrl = apiDomain + "/api/v1/video";
        const bodyStr = "url=" + encodeURIComponent(id);
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest",
            "User-Agent": UA2,
            "Referer": embedUrl
          },
          body: bodyStr
        });
        if (!response.ok)
          return null;
        const data = await response.json();
        if (data.status !== "success" || !data.payload)
          return null;
        const key = CryptoJS.enc.Utf8.parse("kiemtienmua911ca");
        const iv = CryptoJS.enc.Utf8.parse("1234567890oiuytr");
        const decrypted = CryptoJS.AES.decrypt(data.payload, key, {
          iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }).toString(CryptoJS.enc.Utf8);
        const payload = JSON.parse(decrypted);
        let videoUrl = payload.url || payload.sources && payload.sources[0] && payload.sources[0].file;
        if (videoUrl) {
          if (videoUrl.includes(".txt"))
            videoUrl += "#index.m3u8";
          return {
            url: videoUrl,
            headers: { "Referer": apiDomain }
          };
        }
        return null;
      } catch (e) {
        return null;
      }
    }
    module2.exports = { resolve: resolve2 };
  }
});

// src/utils/generic_fuegocine.js
var require_generic_fuegocine = __commonJS({
  "src/utils/generic_fuegocine.js"(exports2, module2) {
    var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
    async function resolve2(embedUrl) {
      try {
        const res = await fetch(embedUrl, {
          headers: { "Referer": "https://www.fuegocine.com/", "User-Agent": UA2 },
          redirect: "follow"
        });
        if (!res.ok)
          return null;
        const html = await res.text();
        const m3u8 = html.match(/https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/i);
        if (m3u8)
          return { url: m3u8[0], headers: { "Referer": embedUrl } };
        const mp4 = html.match(/https?:\/\/[^"'\s]+\.mp4[^"'\s]*/i);
        if (mp4)
          return { url: mp4[0], headers: { "Referer": embedUrl } };
        return null;
      } catch (e) {
        return null;
      }
    }
    module2.exports = { resolve: resolve2 };
  }
});

// src/utils/streamtape.js
var require_streamtape = __commonJS({
  "src/utils/streamtape.js"(exports2, module2) {
    var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
    async function resolve2(url) {
      try {
        console.log(`[StreamTape] Resolviendo: ${url}`);
        let embedUrl = url;
        if (!embedUrl.includes("/e/")) {
          const id = embedUrl.split("/").pop();
          embedUrl = "https://streamtape.com/e/" + id;
        }
        const res = await fetch(embedUrl, {
          headers: { "User-Agent": UA2, "Referer": "https://streamtape.com/" },
          redirect: "follow"
        });
        if (!res.ok)
          return null;
        const html = await res.text();
        const scriptMatch = html.match(/innerHTML\s*=\s*['"]([^'"]+)['"]\s*\+\s*['"]([^'"]+)['"]\s*\+\s*['"]([^'"]+)['"]\s*\+\s*['"]([^'"]+)/i);
        if (scriptMatch) {
          let videoUrl = "";
          for (let i = 1; i < scriptMatch.length; i++) {
            videoUrl += scriptMatch[i];
          }
          videoUrl = videoUrl.replace(/\\/g, "");
          if (videoUrl.includes("https://") && videoUrl.includes("streamtape")) {
            return {
              url: videoUrl,
              quality: "HD",
              headers: { "User-Agent": UA2, "Referer": embedUrl }
            };
          }
        }
        const directMatch = html.match(/https?:\/\/[^"'\s]+streamtape[^"'\s]*\.(mp4|m3u8)[^"'\s]*/i);
        if (directMatch) {
          return {
            url: directMatch[0],
            quality: "HD",
            headers: { "User-Agent": UA2, "Referer": embedUrl }
          };
        }
        return null;
      } catch (e) {
        console.log(`[StreamTape] Error: ${e.message}`);
        return null;
      }
    }
    module2.exports = { resolve: resolve2 };
  }
});

// src/utils/nupload.js
var require_nupload = __commonJS({
  "src/utils/nupload.js"(exports2, module2) {
    var USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    async function resolve2(url) {
      try {
        const res = await fetch(url, {
          headers: {
            "User-Agent": USER_AGENT,
            "Referer": "https://watchfun.top/"
          }
        });
        if (!res.ok)
          return null;
        const html = await res.text();
        const iframeMatch = html.match(/<iframe[^>]*src=["']([^"']+)["']/i);
        if (iframeMatch) {
          let iframeUrl = iframeMatch[1];
          if (iframeUrl.startsWith("//")) {
            iframeUrl = "https:" + iframeUrl;
          }
          if (iframeUrl.includes("voe")) {
            const voe = require_voe();
            return await voe.resolve(iframeUrl);
          }
          if (iframeUrl.includes("filemoon")) {
            const filemoon = require_filemoon();
            return await filemoon.resolveFileMoon(iframeUrl);
          }
          if (iframeUrl.includes("streamwish") || iframeUrl.includes("hlswish") || iframeUrl.includes("strwish") || iframeUrl.includes("wishembed")) {
            const hlswish = require_hlswish();
            return await hlswish.resolve(iframeUrl);
          }
          console.log(`[nupload] Iframe no soportado directamente: ${iframeUrl}`);
          return null;
        }
        const varNameMatch = html.match(/(\w+)\.forEach\(\s*function\s+Oym/i) || html.match(/(\w+)\.forEach\(/i);
        if (!varNameMatch)
          return null;
        const varName = varNameMatch[1];
        const arrayRegex = new RegExp(`var\\s+${varName}\\s*=\\s*(\\[[^\\]]+\\])`, "i");
        const arrayMatch = html.match(arrayRegex);
        if (!arrayMatch)
          return null;
        const bbROMSfT = JSON.parse(arrayMatch[1]);
        const regexSub = /String\.fromCharCode\([^]*?-\s*(\d+)\s*\)/i;
        const matchSub = html.match(regexSub);
        if (!matchSub)
          return null;
        const subNumber = parseInt(matchSub[1]);
        const seszVarMatch = html.match(/file:[^+]*\+\s*["']\?s=["']\s*\+\s*(\w+)/i);
        let sesz = "";
        if (seszVarMatch) {
          const seszVarName = seszVarMatch[1];
          const seszRegex = new RegExp(`var\\s+${seszVarName}\\s*=\\s*["']([^"']+)["']`, "i");
          const seszMatch = html.match(seszRegex);
          if (seszMatch) {
            sesz = seszMatch[1];
          }
        } else {
          const seszMatch = html.match(/var\s+sesz\s*=\s*["']([^"']+)["']/i);
          if (seszMatch)
            sesz = seszMatch[1];
        }
        let decryptedUrl = "";
        bbROMSfT.forEach((value) => {
          try {
            const decoded = Buffer.from(value, "base64").toString("utf-8");
            const digits = decoded.replace(/\D/g, "");
            const num = parseInt(digits);
            decryptedUrl += String.fromCharCode(num - subNumber);
          } catch (err) {
          }
        });
        if (!decryptedUrl || !decryptedUrl.startsWith("http"))
          return null;
        const streamUrl = decryptedUrl + (sesz ? `?s=${sesz}` : "");
        return {
          url: streamUrl,
          quality: "HD",
          headers: {
            "User-Agent": USER_AGENT,
            "Referer": url
          }
        };
      } catch (e) {
        console.log(`[nupload] Error resolviendo: ${e.message}`);
        return null;
      }
    }
    module2.exports = { resolve: resolve2 };
  }
});

// src/utils/gdtvid.js
var require_gdtvid = __commonJS({
  "src/utils/gdtvid.js"(exports2, module2) {
    if (typeof TextEncoder === "undefined") {
      globalThis.TextEncoder = function TextEncoder2() {
      };
      globalThis.TextEncoder.prototype.encode = function(str) {
        const bytes = [];
        for (let i = 0; i < str.length; i++) {
          const c = str.charCodeAt(i);
          if (c < 128)
            bytes.push(c);
          else if (c < 2048)
            bytes.push(192 | c >> 6, 128 | c & 63);
          else
            bytes.push(224 | c >> 12, 128 | c >> 6 & 63, 128 | c & 63);
        }
        return new Uint8Array(bytes);
      };
    }
    if (typeof globalThis.crypto === "undefined") {
      globalThis.crypto = {};
    }
    if (!globalThis.crypto.getRandomValues) {
      globalThis.crypto.getRandomValues = function(buffer) {
        for (let i = 0; i < buffer.length; i++)
          buffer[i] = Math.floor(Math.random() * 256);
        return buffer;
      };
    }
    var CryptoJS = require_crypto_js();
    var BASE_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36";
    var KEY = CryptoJS.enc.Hex.parse("6b69656d7469656e6d75613931316361");
    var IV = CryptoJS.enc.Hex.parse("313233343536373839306f6975797472");
    function encrypt2(jsonData) {
      return CryptoJS.AES.encrypt(JSON.stringify(jsonData), KEY, {
        iv: IV,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }).ciphertext.toString(CryptoJS.enc.Hex);
    }
    function decrypt2(hexStr) {
      const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Hex.parse(hexStr)
      });
      const decrypted = CryptoJS.AES.decrypt(cipherParams, KEY, {
        iv: IV,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
    }
    async function fetchWithCookie(url, headers = {}) {
      if (typeof XMLHttpRequest !== "undefined") {
        return new Promise((resolve2, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("GET", url, true);
          xhr.responseType = "text";
          for (const [k, v] of Object.entries(headers)) {
            xhr.setRequestHeader(k, v);
          }
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve2({
                text: xhr.responseText,
                cookie: xhr.getResponseHeader("set-cookie") || ""
              });
            } else {
              reject(new Error(`HTTP ${xhr.status}`));
            }
          };
          xhr.onerror = () => reject(new Error("XHR network error"));
          xhr.send();
        });
      }
      const res = await fetch(url, { headers });
      if (!res.ok)
        throw new Error(`HTTP ${res.status}`);
      return {
        text: await res.text(),
        cookie: res.headers.get("set-cookie") || ""
      };
    }
    async function resolveQuality(m3u8Url) {
      try {
        const res = await fetch(m3u8Url, {
          headers: { "User-Agent": BASE_UA, Referer: "https://gdtvid.p2pplay.pro/", Origin: "https://gdtvid.p2pplay.pro" },
          redirect: "follow"
        });
        if (!res.ok)
          return "Unknown";
        const body = await res.text();
        const resMatch = body.match(/RESOLUTION=(\d+)x(\d+)/g);
        let maxH = 0;
        if (resMatch) {
          for (const r of resMatch) {
            const h = parseInt(r.split("x")[1]);
            if (h > maxH)
              maxH = h;
          }
        }
        if (maxH >= 2160)
          return "4K";
        if (maxH >= 1080)
          return "1080p";
        if (maxH >= 720)
          return "720p";
        if (maxH >= 480)
          return "480p";
        const qualityMatch = m3u8Url.match(/[_-](\d{3,4})p/);
        return qualityMatch ? qualityMatch[1] + "p" : "Unknown";
      } catch (e) {
        return "Unknown";
      }
    }
    async function resolveGdtvid(url) {
      try {
        const videoId = url.includes("/") ? url.split("/").pop().replace("#", "") : url;
        const apiBase = "https://gdtvid.p2pplay.pro";
        console.log(`[GDTvid] Resolviendo: ${videoId}`);
        const { cookie } = await fetchWithCookie(`${apiBase}/api/v1/info?id=${videoId}`, {
          "User-Agent": BASE_UA,
          "Referer": apiBase + "/"
        });
        const sessionPayload = {
          sessionId: "p2pplay_test_session",
          userId: "null",
          playerId: "jw8",
          videoId,
          country: "US",
          platform: "web",
          browser: "chrome",
          os: "windows",
          timestamp: Date.now()
        };
        const encryptedSession = encrypt2(sessionPayload);
        const commonHeaders = {
          "User-Agent": BASE_UA,
          "Referer": apiBase + "/",
          "Cookie": cookie || ""
        };
        const [playerResp, videoResp] = await Promise.all([
          fetchWithCookie(`${apiBase}/api/v1/player?t=${encryptedSession}`, commonHeaders),
          fetchWithCookie(`${apiBase}/api/v1/video?id=${videoId}&w=1536&h=864&r=null`, commonHeaders)
        ]);
        const videoData = decrypt2(videoResp.text.trim());
        if (!videoData.source) {
          throw new Error("No source URL in response");
        }
        const videoUrl = videoData.source;
        console.log(`[GDTvid] URL: ${videoUrl.substring(0, 80)}...`);
        const quality = await resolveQuality(videoUrl);
        return {
          url: videoUrl,
          quality,
          headers: {
            "User-Agent": BASE_UA,
            "Referer": apiBase + "/",
            "Origin": apiBase
          }
        };
      } catch (e) {
        console.log(`[GDTvid] Error: ${e.message}`);
        return null;
      }
    }
    module2.exports = { resolveGdtvid };
  }
});

// src/utils/fourmeplayer.js
var require_fourmeplayer = __commonJS({
  "src/utils/fourmeplayer.js"(exports2, module2) {
    var CryptoJS = require_crypto_js();
    var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
    function decryptHex(hexStr, keyStr, ivStr) {
      try {
        let cleanHex = hexStr.replace(/[^0-9a-fA-F]/g, "");
        if (cleanHex.length % 2 !== 0) {
          cleanHex = cleanHex.slice(0, -1);
        }
        const key = CryptoJS.enc.Utf8.parse(keyStr);
        const iv = CryptoJS.enc.Utf8.parse(ivStr);
        const cipherBytes = CryptoJS.enc.Hex.parse(cleanHex);
        const base64Cipher = CryptoJS.enc.Base64.stringify(cipherBytes);
        return CryptoJS.AES.decrypt(base64Cipher, key, {
          iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }).toString(CryptoJS.enc.Utf8);
      } catch (e) {
        return null;
      }
    }
    function tryRepairJson(jsonStr) {
      try {
        JSON.parse(jsonStr);
        return jsonStr;
      } catch (e) {
      }
      let repaired = jsonStr.trim();
      while (repaired.length > 0 && /[,:{\[\s"\\]+$/.test(repaired)) {
        repaired = repaired.slice(0, -1);
      }
      let openBrackets = [];
      let inString = false;
      let escape2 = false;
      for (let i = 0; i < repaired.length; i++) {
        const char = repaired[i];
        if (escape2) {
          escape2 = false;
          continue;
        }
        if (char === "\\") {
          escape2 = true;
          continue;
        }
        if (char === '"') {
          inString = !inString;
          continue;
        }
        if (!inString) {
          if (char === "{" || char === "[") {
            openBrackets.push(char);
          } else if (char === "}") {
            if (openBrackets[openBrackets.length - 1] === "{") {
              openBrackets.pop();
            }
          } else if (char === "]") {
            if (openBrackets[openBrackets.length - 1] === "[") {
              openBrackets.pop();
            }
          }
        }
      }
      if (inString) {
        repaired += '"';
      }
      while (openBrackets.length > 0) {
        const open = openBrackets.pop();
        if (open === "{")
          repaired += "}";
        if (open === "[")
          repaired += "]";
      }
      try {
        JSON.parse(repaired);
        return repaired;
      } catch (e) {
        return null;
      }
    }
    async function resolve2(embedUrl) {
      try {
        const id = embedUrl.split("#").pop();
        if (!id || id === embedUrl)
          return null;
        const domain = new URL(embedUrl).origin;
        const apiUrl = `${domain}/api/v1/video?id=${id}`;
        const res = await fetch(apiUrl, {
          headers: {
            "User-Agent": UA2,
            "Referer": embedUrl
          }
        });
        if (!res.ok)
          return null;
        const hex = await res.text();
        if (!hex || hex.length < 50)
          return null;
        const keyStr = "kiemtienmua911ca";
        const ivStr = "1234567890oiuytr";
        const decrypted = decryptHex(hex, keyStr, ivStr);
        if (!decrypted) {
          console.log(`[4mePlayer] Decrypted is falsy. Hex length: ${hex.length}. Hex snippet: ${hex.substring(0, 100)}`);
          return null;
        }
        let data;
        try {
          data = JSON.parse(decrypted);
        } catch (jsonErr) {
          console.log(`[4mePlayer] JSON Parse error: ${jsonErr.message}. Intentando reparar...`);
          const repaired = tryRepairJson(decrypted);
          if (repaired) {
            try {
              data = JSON.parse(repaired);
              console.log(`[4mePlayer] JSON reparado exitosamente.`);
            } catch (err2) {
              console.log(`[4mePlayer] Fall\xF3 parseo del JSON reparado.`);
            }
          }
        }
        if (!data) {
          console.log(`[4mePlayer] No se pudo deserializar el JSON de ninguna forma.`);
          console.log(`[4mePlayer] Decrypted length: ${decrypted.length}`);
          console.log(`[4mePlayer] Decrypted snippet: ${decrypted.substring(0, 200)}`);
          return null;
        }
        let videoUrl = data.cf || data.source;
        if (!videoUrl)
          return null;
        if (videoUrl.includes(".txt")) {
          const separator = videoUrl.includes("?") ? "&" : "?";
          videoUrl += separator + "ext=.m3u8#index.m3u8";
        }
        return {
          url: videoUrl,
          headers: {
            "Referer": domain + "/",
            "Origin": domain,
            "User-Agent": UA2
          }
        };
      } catch (e) {
        console.log(`[4mePlayer] Error resolving: ${e.message}`);
        return null;
      }
    }
    module2.exports = { resolve: resolve2 };
  }
});

// src/utils/index.js
var require_utils = __commonJS({
  "src/utils/index.js"(exports2, module2) {
    var goodstream = require_goodstream();
    var vimeos = require_vimeos();
    var hlswish = require_hlswish();
    var voe = require_voe();
    var filemoon = require_filemoon();
    var vidhide = require_vidhide();
    var playmogo = require_playmogo();
    var lacloud = require_lacloud();
    var packer = require_packer();
    var tplayer = require_tplayer();
    var gdrive = require_gdrive();
    var pixeldrain = require_pixeldrain();
    var keki = require_keki();
    var lulustream = require_lulustream();
    var fastream = require_fastream();
    var okru = require_okru();
    var buzzheavier = require_buzzheavier();
    var turbovid = require_turbovid();
    var embedseek = require_embedseek();
    var dropcdn = require_dropcdn();
    var vidsrc = require_vidsrc();
    var doodstream = require_doodstream();
    var vidnest = require_vidnest();
    var vidsonic = require_vidsonic();
    var barmonrey = require_barmonrey();
    var yandex = require_yandex();
    var vidmoly = require_vidmoly();
    var rpmvid = require_rpmvid();
    var genericFuegocine = require_generic_fuegocine();
    var streamtape = require_streamtape();
    var nupload = require_nupload();
    var gdtvid = require_gdtvid();
    var fourmeplayer = require_fourmeplayer();
    var SERVER_RESOLVERS2 = {
      "goodstream.one": goodstream.resolve,
      "goodstream": goodstream.resolve,
      "hlswish.com": hlswish.resolve,
      "streamwish.com": hlswish.resolve,
      "streamwish.to": hlswish.resolve,
      "strwish.com": hlswish.resolve,
      "hlswish": hlswish.resolve,
      "streamwish": hlswish.resolve,
      "vibuxer.com": hlswish.resolve,
      "hglink": hlswish.resolve,
      "hglamioz": hlswish.resolve,
      "filelions": hlswish.resolve,
      "wishembed": hlswish.resolve,
      "wishfast": hlswish.resolve,
      "hanerix": hlswish.resolve,
      "playnixes": hlswish.resolve,
      "voe.sx": voe.resolve,
      "voe.to": voe.resolve,
      "voe.tel": voe.resolve,
      "voex.sx": voe.resolve,
      "voe-sx": voe.resolve,
      "marissashare": voe.resolve,
      "cloudwindow": voe.resolve,
      "vimeos.net": vimeos.resolve,
      "vimeos": vimeos.resolve,
      "vimeus.com": vimeos.resolve,
      "vimeus": vimeos.resolve,
      "filemoon.sx": filemoon.resolveFileMoon,
      "filemoon.to": filemoon.resolveFileMoon,
      "filemoon.lat": filemoon.resolveFileMoon,
      "filemoon.live": filemoon.resolveFileMoon,
      "filemoon.online": filemoon.resolveFileMoon,
      "filemoon.me": filemoon.resolveFileMoon,
      "fmoon.top": filemoon.resolveFileMoon,
      "filemoon": filemoon.resolveFileMoon,
      "moonalu": filemoon.resolveFileMoon,
      "moonembed": filemoon.resolveFileMoon,
      "bysedikamoum": filemoon.resolveFileMoon,
      "bysejikuar": filemoon.resolveFileMoon,
      "bysevepoin": filemoon.resolveFileMoon,
      "r66nv9ed": filemoon.resolveFileMoon,
      "398fitus": filemoon.resolveFileMoon,
      "vidhide.com": vidhide.resolve,
      "vidhidepro.com": vidhide.resolve,
      "vidhidepre.com": vidhide.resolve,
      "vidhidevip.com": vidhide.resolve,
      "dintezuvio.com": vidhide.resolve,
      "minochinos.com": vidhide.resolve,
      "diasfem.com": vidhide.resolve,
      "filelions.to": vidhide.resolve,
      "filelions.com": vidhide.resolve,
      "vidhide": vidhide.resolve,
      "lacloud.live": lacloud.resolve,
      "lacloud": lacloud.resolve,
      "playmogo.com": playmogo.resolve,
      "playmogo": playmogo.resolve,
      "doodstream.com": playmogo.resolve,
      "doodstream": playmogo.resolve,
      "myvidplay.com": playmogo.resolve,
      "myvidplay": playmogo.resolve,
      "doply.net": playmogo.resolve,
      "vide0.net": playmogo.resolve,
      "doods.pro": playmogo.resolve,
      "doods": playmogo.resolve,
      "dsvplay.com": playmogo.resolve,
      "dsvplay": playmogo.resolve,
      "d0000d.com": playmogo.resolve,
      "d0000d": playmogo.resolve,
      "d000d.com": playmogo.resolve,
      "d000d": playmogo.resolve,
      "dooood.com": playmogo.resolve,
      "dooood": playmogo.resolve,
      "dood.wf": playmogo.resolve,
      "dood.cx": playmogo.resolve,
      "dood.sh": playmogo.resolve,
      "dood.watch": playmogo.resolve,
      "dood.pm": playmogo.resolve,
      "dood.to": playmogo.resolve,
      "dood.so": playmogo.resolve,
      "dood.ws": playmogo.resolve,
      "dood.yt": playmogo.resolve,
      "dood.li": playmogo.resolve,
      "ds2play.com": playmogo.resolve,
      "ds2play": playmogo.resolve,
      "ds2video.com": playmogo.resolve,
      "ds2video": playmogo.resolve,
      "earnvids.com": packer.resolve,
      "earnl.one": packer.resolve,
      "vidnova.online": packer.resolve,
      "hglink.to": packer.resolve,
      "streamfort.online": packer.resolve,
      "tplayer.pelisgo.online": tplayer.resolve,
      "tplayer": tplayer.resolve,
      "drive.google.com": gdrive.resolve,
      "google.com": gdrive.resolve,
      "pixeldrain.com": pixeldrain.resolve,
      "pixeldrain": pixeldrain.resolve,
      "keki.moe": keki.resolve,
      "tnmr.org": keki.resolve,
      "keki": keki.resolve,
      "lulustream.com": lulustream.resolve,
      "luluvdo.com": lulustream.resolve,
      "lulustream": lulustream.resolve,
      "fastream.to": fastream.resolve,
      "fastream": fastream.resolve,
      "ok.ru": okru.resolve,
      "okru": okru.resolve,
      "buzzheavier.com": buzzheavier.resolve,
      "buzzheavier": buzzheavier.resolve,
      "bzh.sh": buzzheavier.resolve,
      "turbovid": turbovid.resolve,
      "seekplays": embedseek.resolve,
      "seekstreaming": embedseek.resolve,
      "embedseek": embedseek.resolve,
      "dropcdn.io": dropcdn.resolve,
      "dropload.io": dropcdn.resolve,
      "dr0pstream.com": dropcdn.resolve,
      "dropcdn": dropcdn.resolve,
      "vidsrc.xyz": vidsrc.resolve,
      "vidsrc.to": vidsrc.resolve,
      "vidsrc.pm": vidsrc.resolve,
      "vidsrc": vidsrc.resolve,
      "moviesapi.to": vidsrc.resolve,
      "moviesapi.club": vidsrc.resolve,
      "yandex.ru": yandex.resolve,
      "disk.yandex": yandex.resolve,
      "dooodster.com": doodstream.resolve,
      "do7go.com": doodstream.resolve,
      "all3do.com": doodstream.resolve,
      "vidnest.io": vidnest.resolve,
      "vidnest": vidnest.resolve,
      "vidsonic.net": vidsonic.resolve,
      "vidsonic": vidsonic.resolve,
      "barmonrey.com": barmonrey.resolve,
      "barmonrey": barmonrey.resolve,
      "vidmoly.biz": vidmoly.resolve,
      "vidmoly.to": vidmoly.resolve,
      "vidmoly": vidmoly.resolve,
      "rpmvid.com": rpmvid.resolve,
      "rpmvid": rpmvid.resolve,
      "upns.online": rpmvid.resolve,
      "upns": rpmvid.resolve,
      "unlimplay.com": genericFuegocine.resolve,
      "krakenfiles.com": genericFuegocine.resolve,
      "krakenfiles": genericFuegocine.resolve,
      "nupload.me": nupload.resolve,
      "nupload": nupload.resolve,
      "streamtape.com": streamtape.resolve,
      "streamtape": streamtape.resolve,
      "gdtvid": gdtvid.resolveGdtvid,
      "p2pplay.pro": gdtvid.resolveGdtvid,
      "4meplayer.pro": fourmeplayer.resolve,
      "4meplayer": fourmeplayer.resolve
    };
    var SERVER_NAMES2 = {
      goodstream: "GoodStream",
      goodstreamone: "GoodStream",
      hlswish: "StreamWish",
      streamwish: "StreamWish",
      strwish: "StreamWish",
      vibuxer: "StreamWish",
      hglamioz: "StreamWish",
      filelions: "StreamWish",
      wishembed: "StreamWish",
      wishfast: "StreamWish",
      hanerix: "StreamWish",
      playnixes: "StreamWish",
      voe: "VOE",
      voex: "VOE",
      "voe-sx": "VOE",
      marissashare: "VOE",
      cloudwindow: "VOE",
      vimeos: "Vimeos",
      vimeus: "Vimeos",
      filemoon: "FileMoon",
      moonalu: "FileMoon",
      moonembed: "FileMoon",
      bysedikamoum: "FileMoon",
      bysejikuar: "FileMoon",
      bysevepoin: "FileMoon",
      r66nv9ed: "FileMoon",
      "398fitus": "FileMoon",
      vidhide: "VidHide",
      vidhidepro: "VidHide",
      vidhidepre: "VidHide",
      vidhidevip: "VidHide",
      dintezuvio: "VidHide",
      minochinos: "VidHide",
      diasfem: "VidHide",
      lacloud: "Lacloud",
      playmogo: "PlayMogo",
      myvidplay: "DoodStream",
      doodstream: "DoodStream",
      doply: "DoodStream",
      vide0: "DoodStream",
      doods: "DoodStream",
      dsvplay: "DoodStream",
      d0000d: "DoodStream",
      d000d: "DoodStream",
      dooood: "DoodStream",
      ds2play: "DoodStream",
      ds2video: "DoodStream",
      dooodster: "DoodStream",
      do7go: "DoodStream",
      all3do: "DoodStream",
      earnvids: "EarnVids",
      vidnova: "EarnVids",
      streamfort: "StreamHG",
      hglink: "StreamHG",
      pixeldrain: "Pixeldrain",
      magi: "Magi",
      tplayer: "TPlayer",
      keki: "KeKi",
      lulustream: "Lulustream",
      luluvdo: "Lulustream",
      tnmr: "KeKi",
      google: "Google Drive",
      drive: "Google Drive",
      fastream: "Fastream",
      okru: "Ok.ru",
      buzzheavier: "Buzzheavier",
      bzh: "Buzzheavier",
      turbovid: "TurboVid",
      seekplays: "SeekStreaming",
      seekstreaming: "SeekStreaming",
      embedseek: "SeekStreaming",
      dropcdn: "DropCDN",
      dropload: "DropCDN",
      dr0pstream: "DropCDN",
      vidsrc: "VidSrc",
      yandex: "Yandex",
      moviesapi: "VidSrc",
      vidnest: "VidNest",
      vidsonic: "VidSonic",
      barmonrey: "Barmonrey",
      vidmoly: "VidMoly",
      rpmvid: "RpmVid",
      upns: "UPNS",
      unlimplay: "UnlimPlay",
      krakenfiles: "KrakenFiles",
      nuuuppp: "Nupload",
      nuupload: "Nupload",
      nupload: "Nupload",
      streamtape: "StreamTape",
      gdtvid: "GDTvid",
      "p2pplay.pro": "GDTvid",
      "4meplayer": "4mePlayer"
    };
    module2.exports = { SERVER_RESOLVERS: SERVER_RESOLVERS2, SERVER_NAMES: SERVER_NAMES2 };
  }
});

// src/unlimplay.js
var { SERVER_RESOLVERS, SERVER_NAMES } = require_utils();
var { get } = require_common();
var vimeosResolver = require_vimeos().resolve;
var BASE_URL = "https://unlimplay.com";
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36";
function detectQuality(url) {
  if (!url)
    return "1080p";
  var pMatch = url.match(/[_\-\/](\d{3,4})p/);
  return pMatch ? pMatch[1] + "p" : "1080p";
}
function getEmbeds(tmdbId, mediaType, season, episode) {
  var path2;
  if (mediaType === "movie" || mediaType === "movies") {
    path2 = "/f/embed/movie/" + tmdbId;
  } else {
    path2 = "/f/embed/tv/" + tmdbId + "/" + season + "/" + episode;
  }
  console.log("[UnlimPlay] Fetching: " + BASE_URL + path2);
  return get(BASE_URL + path2, {
    "User-Agent": UA,
    "Accept": "text/html",
    "Referer": "https://unlimplay.com/"
  }).then(function(html) {
    var match = html.match(/const\s+EMBEDS\s*=\s*({[\s\S]+?});/);
    if (!match) {
      console.log("[UnlimPlay] No EMBEDS object found in HTML");
      return null;
    }
    try {
      var jsonStr = match[1];
      var embeds = new Function("return " + jsonStr)();
      return embeds;
    } catch (e) {
      console.log("[UnlimPlay] Error parsing EMBEDS: " + e.message);
      return null;
    }
  }).catch(function(err) {
    console.log("[UnlimPlay] Error fetch: " + err.message);
    return null;
  });
}
function getResolver(url) {
  for (var key in SERVER_RESOLVERS) {
    if (url.indexOf(key) !== -1)
      return SERVER_RESOLVERS[key];
  }
  return null;
}
function getServerName(url, defaultName) {
  for (var key in SERVER_NAMES) {
    if (url.toLowerCase().indexOf(key) !== -1)
      return SERVER_NAMES[key];
  }
  return defaultName || "Online";
}
function getStreams(tmdbId, mediaType, season, episode) {
  if (String(tmdbId).trim() === "295778" || String(tmdbId).trim() === "tt40197357") {
    console.log("[MAPPING] Iniciando b\xFAsqueda doble para Scrubs (Secuela) S" + season);
    var promiseA = getStreamsInternal(tmdbId, mediaType, season, episode);
    var oldSeason = season ? String(parseInt(season) + 9) : season;
    var argsB = [].slice.call(arguments);
    argsB[0] = "4556";
    argsB[2] = oldSeason;
    var promiseB = getStreamsInternal.apply(null, argsB);
    return Promise.all([promiseA, promiseB]).then(function(results) {
      var streamsA = results[0] || [];
      var streamsB = results[1] || [];
      console.log("[MAPPING] B\xFAsqueda doble finalizada. Secuela: " + streamsA.length + " | Original S" + oldSeason + ": " + streamsB.length);
      var combined = streamsA.concat(streamsB);
      var seen = {};
      return combined.filter(function(item) {
        if (!item || !item.url)
          return false;
        if (seen[item.url])
          return false;
        seen[item.url] = true;
        return true;
      });
    }).catch(function(err) {
      console.log("[MAPPING] Error en b\xFAsqueda doble: " + err.message);
      return [];
    });
  }
  return getStreamsInternal.apply(null, arguments);
}
function getStreamsInternal(tmdbId, mediaType, season, episode) {
  var mType = mediaType === "series" ? "tv" : mediaType || "movie";
  var LANG_MAP = {
    "latino": "Latino",
    "espa\xF1ol": "Castellano",
    "espanol": "Castellano",
    "subtitulado": "Subtitulado"
  };
  return getEmbeds(tmdbId, mType, season, episode).then(function(embeds) {
    if (!embeds)
      return [];
    var allPromises = [];
    var langs = Object.keys(embeds);
    langs.forEach(function(langKey) {
      var langLabel = LANG_MAP[langKey] || langKey.charAt(0).toUpperCase() + langKey.slice(1);
      var servers = embeds[langKey];
      Object.keys(servers).forEach(function(serverKey) {
        var embedUrl = servers[serverKey];
        if (!embedUrl)
          return;
        if (embedUrl.indexOf("vimeos") !== -1) {
          allPromises.push(
            vimeosResolver(embedUrl).then(function(resolved) {
              if (resolved && resolved.url) {
                return {
                  name: "1080p \xB7 UnlimPlay \xB7 Vimeos",
                  title: "UnlimPlay",
                  description: "1080p \xB7 UnlimPlay \xB7 Vimeos \xB7 " + langLabel,
                  language: langLabel,
                  provider: "unlimplay",
                  quality: "1080p",
                  url: resolved.url,
                  headers: resolved.headers || {
                    "Referer": "https://vimeos.net/",
                    "Origin": "https://vimeos.net",
                    "User-Agent": UA
                  }
                };
              }
              return {
                name: "1080p \xB7 UnlimPlay \xB7 Vimeos",
                title: "UnlimPlay",
                description: "1080p \xB7 UnlimPlay \xB7 Vimeos \xB7 " + langLabel,
                language: langLabel,
                provider: "unlimplay",
                quality: "1080p",
                url: embedUrl,
                headers: {
                  "Referer": "https://vimeos.net/",
                  "Origin": "https://vimeos.net",
                  "User-Agent": UA
                }
              };
            }).catch(function() {
              return null;
            })
          );
        } else {
          var resolver = getResolver(embedUrl);
          if (resolver) {
            allPromises.push(
              resolver(embedUrl).then(function(resolved) {
                if (resolved && resolved.url) {
                  var sName = getServerName(embedUrl, serverKey);
                  var quality = resolved.quality || detectQuality(resolved.url);
                  return {
                    name: quality + " \xB7 UnlimPlay \xB7 " + sName,
                    title: "UnlimPlay",
                    description: quality + " \xB7 UnlimPlay \xB7 " + sName + " \xB7 " + langLabel,
                    language: langLabel,
                    provider: "unlimplay",
                    quality,
                    url: resolved.url,
                    headers: resolved.headers || {}
                  };
                }
                return null;
              }).catch(function() {
                return null;
              })
            );
          }
        }
      });
    });
    return Promise.all(allPromises).then(function(results) {
      var filtered = results.filter(Boolean);
      console.log("[UnlimPlay] Total: " + filtered.length + " streams found");
      return filtered;
    });
  }).catch(function(err) {
    console.log("[UnlimPlay] Error: " + err.message);
    return [];
  });
}
module.exports = { getStreams };
/*! Bundled license information:

@noble/ciphers/utils.js:
  (*! noble-ciphers - MIT License (c) 2023 Paul Miller (paulmillr.com) *)

@noble/curves/utils.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/abstract/modular.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/abstract/curve.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/abstract/oprf.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/abstract/weierstrass.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/nist.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

crypto-js/ripemd160.js:
  (** @preserve
  	(c) 2012 by CÃ©dric Mesnil. All rights reserved.
  
  	Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
  
  	    - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
  	    - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
  
  	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  	*)

crypto-js/mode-ctr-gladman.js:
  (** @preserve
   * Counter block mode compatible with  Dr Brian Gladman fileenc.c
   * derived from CryptoJS.mode.CTR
   * Jan Hruby jhruby.web@gmail.com
   *)
*/