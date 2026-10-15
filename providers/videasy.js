if (typeof setTimeout === "undefined") {
  globalThis.setTimeout = function(fn, ms) {
    if (typeof fn === "function" && (Number(ms) || 0) < 5e3) Promise.resolve().then(fn);
    return 0;
  };
  globalThis.clearTimeout = function() {
  };
}
var __videasyWings = function() {
  var module2 = { exports: {} };
  var exports2 = module2.exports;
  var __async = (_0xd0c07d, _0x340765, _0x2fa615) => {
    return new Promise((_0x5f3661, _0x15e11c) => {
      var _0x24bf8e = (_0x52b38a) => {
        try {
          _0x27eb35(_0x2fa615.next(_0x52b38a));
        } catch (_0x275c10) {
          _0x15e11c(_0x275c10);
        }
      };
      var _0x3d784d = (_0x436a1f) => {
        try {
          _0x27eb35(_0x2fa615.throw(_0x436a1f));
        } catch (_0x5dca38) {
          _0x15e11c(_0x5dca38);
        }
      };
      var _0x27eb35 = (_0x516626) => _0x516626.done ? _0x5f3661(_0x516626.value) : Promise.resolve(_0x516626.value).then(_0x24bf8e, _0x3d784d);
      _0x27eb35((_0x2fa615 = _0x2fa615.apply(_0xd0c07d, _0x340765)).next());
    });
  };
  var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
  var TMDB_BASE_URL = "https://api.themoviedb.org/3";
  var WINGS_API_BASE = "https://api.speedracelight.com";
  var USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
  var REQUEST_HEADERS = {
    "User-Agent": USER_AGENT,
    Accept: "*/*",
    Origin: "https://www.vidking.net",
    Referer: "https://www.vidking.net/",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0"
  };
  var SERVERS = {
    Hydrogen: {
      path: "cdn/sources-with-title"
    },
    Titanium: {
      path: "tejo/sources-with-title"
    },
    Oxygen: {
      path: "neon2/sources-with-title"
    },
    Lithium: {
      path: "downloader2/sources-with-title"
    },
    Krypton: {
      path: "ym/sources-with-title"
    },
    Carbon: {
      path: "mb-flix/sources-with-title"
    },
    Aluminium: {
      path: "lamovie/sources-with-title"
    },
    Nitrogen: {
      path: "m4uhd/sources-with-title"
    },
    Neon: {
      path: "superflix/sources-with-title"
    },
    Helium: {
      path: "1movies/sources-with-title"
    },
    Chamber: {
      path: "meine/sources-with-title",
      params: {
        language: "french"
      }
    },
    Overflix: {
      path: "overflix/sources-with-title"
    },
    Visioncine: {
      path: "visioncine/sources-with-title"
    }
  };
  var jl = [1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580];
  var Tf = [1732584193, 4023233417, 2562383102, 271733878];
  var Js = 61;
  var _f = 8;
  var ms = 2654435769;
  var Ys = [109, 118, 109, 49];
  var Sf = (_0x37e181) => (_0x37e181 * (_0x37e181 + 1) & 1) === 0;
  var bf = (_0x391c9f) => (_0x391c9f * (_0x391c9f + 1) & 1) === 1;
  function ui(_0x55d008) {
    _0x55d008 >>>= 0;
    _0x55d008 ^= _0x55d008 >>> 16;
    _0x55d008 = Math.imul(_0x55d008, 2246822507) >>> 0;
    _0x55d008 ^= _0x55d008 >>> 13;
    _0x55d008 = Math.imul(_0x55d008, 3266489909) >>> 0;
    _0x55d008 ^= _0x55d008 >>> 16;
    return _0x55d008 >>> 0;
  }
  function ps(_0x347f79, _0x7edf3f) {
    _0x347f79 >>>= 0;
    _0x7edf3f &= 31;
    if (_0x7edf3f === 0) {
      return _0x347f79 >>> 0;
    } else {
      return (_0x347f79 << _0x7edf3f | _0x347f79 >>> 32 - _0x7edf3f) >>> 0;
    }
  }
  function If(_0x1f22c0) {
    let _0xe6f21 = Tf[0] >>> 0;
    for (let _0x271667 = 0; _0x271667 < _0x1f22c0.length; _0x271667++) {
      _0xe6f21 = ps((_0xe6f21 ^ Math.imul(_0x1f22c0.charCodeAt(_0x271667), jl[_0x271667 & 15])) >>> 0, 5);
    }
    return ui(_0xe6f21);
  }
  function Af(_0x343e78) {
    const _0x462795 = new Array(256);
    for (let _0x2202f5 = 0; _0x2202f5 < 256; _0x2202f5++) {
      _0x462795[_0x2202f5] = _0x2202f5;
    }
    let _0x3654f8 = 0;
    for (let _0x1593a5 = 0; _0x1593a5 < 256; _0x1593a5++) {
      _0x3654f8 = _0x3654f8 + _0x462795[_0x1593a5] + _0x343e78.charCodeAt(_0x1593a5 % _0x343e78.length) & 255;
      const _0x393c75 = _0x462795[_0x1593a5];
      _0x462795[_0x1593a5] = _0x462795[_0x3654f8];
      _0x462795[_0x3654f8] = _0x393c75;
    }
    return _0x462795;
  }
  function wf(_0x302fd9) {
    let _0x37b6da = 2166136261;
    for (let _0x4f989f = 0; _0x4f989f < _0x302fd9.length; _0x4f989f++) {
      _0x37b6da = Math.imul(_0x37b6da ^ _0x302fd9.charCodeAt(_0x4f989f), 16777619) >>> 0;
    }
    return ui(_0x37b6da);
  }
  function vf(_0xc8001c, _0x4b2aa1, _0x41cdd8) {
    return ((_0xc8001c ^ _0x4b2aa1) >>> 0 | (_0xc8001c & _0x4b2aa1 & _0x41cdd8) >>> 0) >>> 0;
  }
  function Nf(_0x631558, _0x42b3cc) {
    if (bf(_0x631558.length)) {
      return {
        S: Af(_0x631558),
        acc: If(_0x631558)
      };
    }
    const _0x2cbc01 = new Array(Js);
    let _0x2bb9da = ui(wf(_0x631558) ^ ui(_0x42b3cc >>> 0 ^ ms)) >>> 0;
    for (let _0xfb5e8d = 0; _0xfb5e8d < _f; _0xfb5e8d++) {
      if (Sf(_0xfb5e8d)) {
        const _0x1a78ae = _0x2bb9da % Js;
        _0x2bb9da = ps(_0x2bb9da + ms >>> 0, 7 + (_0xfb5e8d & 7));
        _0x2cbc01[_0x1a78ae] = (_0x2bb9da ^ ui(_0x2bb9da)) >>> 0;
        _0x2bb9da = ui(_0x2bb9da + _0x1a78ae >>> 0);
      } else {
        _0x2cbc01[_0xfb5e8d] = jl[_0xfb5e8d & 15];
      }
    }
    return {
      S: _0x2cbc01,
      acc: ui(_0x2bb9da ^ -1515870811) >>> 0
    };
  }
  function Rf(_0xea83ed, _0x405e02) {
    const _0x15d800 = _0xea83ed.S;
    let _0x4ac929 = _0xea83ed.acc;
    const _0x1a9656 = _0x4ac929 % Js;
    const _0x188ab4 = 0 - +(_0x1a9656 in _0x15d800);
    const _0x1d77d1 = _0x15d800[_0x1a9656] >>> 0;
    const _0x3b743f = Math.imul(ms, _0x405e02 + 1) >>> 0;
    let _0x57c0b2 = vf(_0x4ac929, (_0x1d77d1 ^ _0x3b743f) >>> 0, _0x188ab4);
    _0x57c0b2 = (ps(_0x57c0b2 + _0x4ac929 >>> 0, _0x1a9656 & 31) ^ ps(_0x4ac929, Math.imul(_0x1a9656, 7) & 31)) >>> 0;
    _0x4ac929 = ui(_0x57c0b2 + ms >>> 0);
    _0x15d800[_0x1a9656] = _0x4ac929 >>> 0;
    _0xea83ed.acc = _0x4ac929;
    return _0x4ac929 >>> 0;
  }
  function Cf(_0x121578, _0x2c5249, _0x17eb78) {
    const _0x3ddc8a = Nf(_0x121578, _0x2c5249);
    const _0x442b0e = new Uint8Array(_0x17eb78);
    let _0x396470 = 0;
    for (let _0x2f7e65 = 0; _0x2f7e65 < _0x17eb78; ) {
      const _0x402e74 = Rf(_0x3ddc8a, _0x396470++);
      _0x442b0e[_0x2f7e65++] = _0x402e74 & 255;
      if (_0x2f7e65 < _0x17eb78) {
        _0x442b0e[_0x2f7e65++] = _0x402e74 >>> 8 & 255;
      }
      if (_0x2f7e65 < _0x17eb78) {
        _0x442b0e[_0x2f7e65++] = _0x402e74 >>> 16 & 255;
      }
      if (_0x2f7e65 < _0x17eb78) {
        _0x442b0e[_0x2f7e65++] = _0x402e74 >>> 24 & 255;
      }
    }
    return _0x442b0e;
  }
  function decodeBase64(_0x110a95) {
    const _0x470eb7 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    const _0x2666c3 = _0x110a95.replace(/-/g, "+").replace(/_/g, "/").replace(/=+$/, "");
    const _0x202116 = _0x2666c3.length;
    const _0x2bfde0 = new Uint8Array(Math.floor(_0x202116 * 0.75));
    let _0x5ac383 = 0;
    for (let _0x38cd70 = 0; _0x38cd70 < _0x202116; _0x38cd70 += 4) {
      const _0xce8190 = _0x470eb7.indexOf(_0x2666c3[_0x38cd70]);
      const _0x245cc4 = _0x470eb7.indexOf(_0x2666c3[_0x38cd70 + 1] || "A");
      const _0x4163a0 = _0x470eb7.indexOf(_0x2666c3[_0x38cd70 + 2] || "A");
      const _0x33022f = _0x470eb7.indexOf(_0x2666c3[_0x38cd70 + 3] || "A");
      _0x2bfde0[_0x5ac383++] = _0xce8190 << 2 | _0x245cc4 >> 4;
      if (_0x38cd70 + 2 < _0x202116) {
        _0x2bfde0[_0x5ac383++] = (_0x245cc4 & 15) << 4 | _0x4163a0 >> 2;
      }
      if (_0x38cd70 + 3 < _0x202116) {
        _0x2bfde0[_0x5ac383++] = (_0x4163a0 & 3) << 6 | _0x33022f;
      }
    }
    return _0x2bfde0;
  }
  function xf(_0x158e23) {
    return decodeBase64(_0x158e23);
  }
  function decryptWingsDatabase(_0x122b4d, _0x55054e, _0x55103e) {
    const _0x450fdb = xf(_0x122b4d);
    const _0x5ae58b = Cf(_0x55054e, _0x55103e, _0x450fdb.length);
    for (let _0x29cd02 = 0; _0x29cd02 < _0x450fdb.length; _0x29cd02++) {
      _0x450fdb[_0x29cd02] ^= _0x5ae58b[_0x29cd02];
    }
    for (let _0x2d4c0d = 0; _0x2d4c0d < Ys.length; _0x2d4c0d++) {
      if (_0x450fdb[_0x2d4c0d] !== Ys[_0x2d4c0d]) {
        throw new Error("decrypt failed: bad seed or tampered payload");
      }
    }
    let _0x5eaced = "";
    const _0x4ae975 = _0x450fdb.subarray(Ys.length);
    for (let _0x339204 = 0; _0x339204 < _0x4ae975.length; ) {
      const _0x677c7e = _0x4ae975[_0x339204++];
      if (_0x677c7e < 128) {
        _0x5eaced += String.fromCharCode(_0x677c7e);
      } else if (_0x677c7e > 191 && _0x677c7e < 224) {
        _0x5eaced += String.fromCharCode((_0x677c7e & 31) << 6 | _0x4ae975[_0x339204++] & 63);
      } else if (_0x677c7e > 223 && _0x677c7e < 240) {
        _0x5eaced += String.fromCharCode((_0x677c7e & 15) << 12 | (_0x4ae975[_0x339204++] & 63) << 6 | _0x4ae975[_0x339204++] & 63);
      } else {
        _0x5eaced += String.fromCharCode((_0x677c7e & 7) << 18 | (_0x4ae975[_0x339204++] & 63) << 12 | (_0x4ae975[_0x339204++] & 63) << 6 | _0x4ae975[_0x339204++] & 63);
      }
    }
    return _0x5eaced;
  }
  function fetchMediaDetails(_0x5c8a2b, _0x4694a3, _0x3947bd, _0x42bb6e) {
    return __async(this, null, function* () {
      var _0x2e90ea;
      let _0x821299 = _0x4694a3 === "tv" ? "45 min" : "90 min";
      try {
        const _0x15806e = _0x4694a3 === "tv" ? "tv" : "movie";
        const _0x2b71a6 = String(_0x5c8a2b).replace(/\D/g, "");
        const _0x5d776e = TMDB_BASE_URL + "/" + _0x15806e + "/" + _0x2b71a6 + "?api_key=" + TMDB_API_KEY + "&append_to_response=external_ids";
        const _0x2fbf32 = yield fetch(_0x5d776e, {
          headers: {
            "User-Agent": REQUEST_HEADERS["User-Agent"],
            Accept: "application/json"
          }
        });
        if (!_0x2fbf32.ok) {
          throw new Error("TMDB HTTP " + _0x2fbf32.status);
        }
        const _0x12de86 = yield _0x2fbf32.json();
        let _0x4cebc4 = _0x821299;
        if (_0x4694a3 === "movie" && _0x12de86.runtime) {
          _0x4cebc4 = _0x12de86.runtime + " min";
        } else if (_0x4694a3 === "tv" && _0x3947bd != null && _0x42bb6e != null) {
          const _0x6695aa = TMDB_BASE_URL + "/tv/" + _0x2b71a6 + "/season/" + _0x3947bd + "/episode/" + _0x42bb6e + "?api_key=" + TMDB_API_KEY;
          const _0x538a32 = yield fetch(_0x6695aa);
          if (_0x538a32.ok) {
            const _0x4fbdb1 = yield _0x538a32.json();
            if (_0x4fbdb1 && _0x4fbdb1.runtime) {
              _0x4cebc4 = _0x4fbdb1.runtime + " min";
            } else if (_0x12de86.episode_run_time && _0x12de86.episode_run_time.length > 0) {
              _0x4cebc4 = _0x12de86.episode_run_time[0] + " min";
            }
          }
        }
        return {
          title: _0x4694a3 === "tv" ? _0x12de86.name : _0x12de86.title,
          year: (_0x4694a3 === "tv" ? _0x12de86.first_air_date : _0x12de86.release_date || "").substring(0, 4),
          imdbId: ((_0x2e90ea = _0x12de86.external_ids) == null ? void 0 : _0x2e90ea.imdb_id) || null,
          mediaType: _0x4694a3,
          duration: _0x4cebc4
        };
      } catch (_0xd5dfc6) {
        console.error("[VidEasy] TMDB details fetch error: " + _0xd5dfc6.message);
        return {
          title: _0x4694a3 === "tv" ? "Unknown TV Show" : "Unknown Movie",
          year: "N/A",
          imdbId: null,
          mediaType: _0x4694a3,
          duration: _0x821299
        };
      }
    });
  }
  function getLangCode(_0x1c41f4) {
    if (!_0x1c41f4) {
      return "en";
    }
    const _0x4718de = {
      english: "en",
      spanish: "es",
      french: "fr",
      german: "de",
      italian: "it",
      portuguese: "pt",
      "portuguese (br)": "pt-br",
      arabic: "ar",
      japanese: "ja",
      korean: "ko",
      tamil: "ta",
      telugu: "te",
      malayalam: "ml",
      kannada: "kn",
      hindi: "hi",
      polish: "pl",
      greek: "el",
      croatian: "hr",
      ukrainian: "uk",
      lithuanian: "lt",
      thai: "th",
      estonian: "et",
      czech: "cs",
      "zh-tw": "zh-tw",
      bokm\u00E5l: "no",
      dutch: "nl",
      indonesian: "id",
      sinhala: "si",
      swedish: "sv",
      romanian: "ro",
      malay: "ms",
      persian: "fa",
      slovak: "sk",
      bulgarian: "bg",
      turkish: "tr",
      danish: "da",
      hebrew: "he",
      serbian: "sr",
      vietnamese: "vi",
      hungarian: "hu",
      icelandic: "is",
      albanian: "sq",
      bosnian: "bs",
      slovenian: "sl",
      bengali: "bn",
      macedonian: "mk"
    };
    return _0x4718de[_0x1c41f4.toLowerCase().trim()] || "en";
  }
  function formatStreamsForNuvio(_0x3fc9fd, _0x15041e, _0x35c64d, _0x515578, _0x1cd419) {
    try {
      const _0x5abbc2 = JSON.parse(_0x3fc9fd);
      if (!_0x5abbc2 || typeof _0x5abbc2 !== "object") {
        return [];
      }
      const _0x32061f = {
        Referer: "https://www.vidking.net/",
        Origin: "https://www.vidking.net",
        "User-Agent": USER_AGENT
      };
      const _0x4282e5 = (_0x5abbc2.subtitles || []).map((_0x59e79b) => ({
        url: _0x59e79b.url,
        language: getLangCode(_0x59e79b.language || _0x59e79b.lang),
        name: _0x59e79b.language || _0x59e79b.lang || "English",
        headers: _0x32061f
      }));
      const _0x2a4d52 = {
        Carbon: "\u{1F48E}",
        Helium: "\u{1F388}",
        Lithium: "\u{1F50B}",
        Oxygen: "\u{1F4A8}",
        Krypton: "\u{1F9B8}",
        Titanium: "\u{1F6E1}\uFE0F",
        Hydrogen: "\u{1F4A7}",
        Nitrogen: "\u{1F33F}",
        Neon: "\u{1F4A1}",
        Aluminium: "\u{1F4BF}"
      };
      const _0x18ccdd = _0x2a4d52[_0x15041e] || "\u{1F3AC}";
      const _0x4273d5 = {
        Hydrogen: "CDN",
        Titanium: "Tejo",
        Oxygen: "Neon2",
        Lithium: "Downloader2",
        Krypton: "YM",
        Carbon: "MB-Flix",
        Aluminium: "LaMovie",
        Nitrogen: "M4UHD",
        Neon: "SuperFlix",
        Helium: "1Movies",
        Chamber: "Meine",
        Overflix: "OverFlix",
        Visioncine: "VisionCine"
      };
      const _0x2840da = _0x4273d5[_0x15041e] || _0x15041e;
      const _0x42db41 = [];
      (_0x5abbc2.sources || []).forEach((_0x255fe5) => {
        if (!_0x255fe5.url) {
          return;
        }
        let _0x23cb3c = _0x255fe5.quality || "1080p";
        let _0x2ab764 = _0x23cb3c.replace(/\s*server\s*2\s*$/gi, "").trim();
        if (_0x15041e === "Oxygen") {
          _0x2ab764 = "Auto";
        }
        let _0x102aff = _0x2ab764.toLowerCase();
        let _0x4dd8b6 = "\u26A1 " + _0x2ab764;
        if (_0x102aff.includes("2160") || _0x102aff.includes("4k")) {
          _0x4dd8b6 = "\u{1F31F} 2160p";
        } else if (_0x102aff.includes("1080")) {
          _0x4dd8b6 = "\u{1F525} 1080p";
        } else if (_0x102aff.includes("720")) {
          _0x4dd8b6 = "\u26A1 720p";
        } else if (_0x102aff === "auto") {
          _0x4dd8b6 = "\u26A1 Auto";
        }
        let _0x4c1264 = "Original Audio";
        let _0x16acb9 = "\u{1F30D} Original Audio";
        if (_0x15041e === "Hydrogen" || _0x15041e === "Krypton") {
          _0x4c1264 = "Original Audio";
          _0x16acb9 = "\u{1F30D} Original Audio";
        } else if (_0x15041e === "Oxygen") {
          _0x4c1264 = "Multi-Audio";
          _0x16acb9 = "\u{1F30D} Multi-Audio";
        } else if (_0x15041e === "Aluminium") {
          _0x4c1264 = "Dual-Audio";
          _0x16acb9 = "\u{1F30D} Dual-Audio";
        } else if (_0x15041e === "Magnesium") {
          const _0x5193be = (_0x255fe5.title || "").toLowerCase();
          if (_0x5193be.includes("bengali") || _0x5193be.includes("bangla")) {
            _0x4c1264 = "Bengali";
            _0x16acb9 = "\u{1F1E7}\u{1F1E9} Bengali";
          } else {
            _0x4c1264 = "Normal Hindi";
            _0x16acb9 = "\u{1F1EE}\u{1F1F3} Hindi";
          }
        }
        const _0x47296f = _0x255fe5.url.includes(".m3u8") ? "M3U8" : _0x255fe5.url.includes(".mp4") ? "MP4" : "MKV";
        const _0x54570b = _0x35c64d.title + (_0x35c64d.mediaType === "tv" ? " S" + _0x515578 + "E" + _0x1cd419 : "");
        let _0x3f5fa9 = _0x15041e;
        if (_0x3f5fa9 === "Krypton") {
          _0x3f5fa9 = _0x3f5fa9.replace(/\s*(1080p\s+)?server\s*2\s*$/gi, "").trim();
        }
        const _0x196bb9 = "\u{1F3AC} " + _0x54570b + " - (" + _0x35c64d.year + ")\n" + _0x4dd8b6 + " | " + _0x16acb9 + " | \u{1F3A7} AAC\n\u{1F39E}\uFE0F " + _0x47296f + " | \u23F1\uFE0F " + _0x35c64d.duration + "\n" + _0x18ccdd + " " + _0x3f5fa9 + " | \u{1F517} Provider: " + _0x2840da;
        _0x42db41.push({
          name: "VidEasy | " + _0x2ab764 + " | " + _0x4c1264,
          title: _0x196bb9,
          size: _0x196bb9,
          description: _0x196bb9,
          url: _0x255fe5.url,
          quality: "",
          language: "",
          headers: _0x32061f,
          subtitles: _0x4282e5,
          provider: "videasy",
          _is4k: _0x102aff.includes("2160") || _0x102aff.includes("4k"),
          _serverName: _0x15041e
        });
      });
      return _0x42db41;
    } catch (_0x17e4e6) {
      console.error("[VidEasy] Formatting error: " + _0x17e4e6.message);
      return [];
    }
  }
  function fetchFromWingsServer(_0x190fbc, _0x4fe0d1, _0x10593a, _0x53363a, _0xcee714, _0x5e2379, _0x120cb2, _0xc54b2e) {
    return __async(this, null, function* () {
      const _0x332b00 = {
        title: _0xcee714.title,
        mediaType: _0x10593a,
        year: String(_0xcee714.year),
        episodeId: String(_0xc54b2e || 1),
        seasonId: String(_0x120cb2 || 1),
        tmdbId: String(_0x53363a),
        imdbId: _0xcee714.imdbId || "",
        enc: "2",
        seed: _0x5e2379
      };
      Object.keys(_0x4fe0d1.params || {}).forEach((_0x2f1a7c) => {
        _0x332b00[_0x2f1a7c] = _0x4fe0d1.params[_0x2f1a7c];
      });
      const _0xa9ede1 = Object.keys(_0x332b00).map((_0x4831c7) => encodeURIComponent(_0x4831c7) + "=" + encodeURIComponent(_0x332b00[_0x4831c7])).join("&");
      const _0x1d9945 = WINGS_API_BASE + "/" + _0x4fe0d1.path + "?" + _0xa9ede1;
      console.log("[VidEasy] Querying server " + _0x190fbc + ": " + _0x1d9945);
      try {
        const _0x147fb6 = yield fetch(_0x1d9945, {
          headers: REQUEST_HEADERS
        });
        if (!_0x147fb6.ok) {
          throw new Error("HTTP " + _0x147fb6.status);
        }
        const _0x1f1261 = yield _0x147fb6.text();
        if (!_0x1f1261 || _0x1f1261.trim() === "") {
          throw new Error("Empty response");
        }
        const _0x355fcb = decryptWingsDatabase(_0x1f1261, _0x5e2379, Number(_0x53363a));
        if (!_0x355fcb) {
          return [];
        }
        const _0x3d8ccb = formatStreamsForNuvio(_0x355fcb, _0x190fbc, _0xcee714, _0x120cb2, _0xc54b2e);
        console.log("[VidEasy] \u2705 Found " + _0x3d8ccb.length + " stream(s) from " + _0x190fbc);
        return _0x3d8ccb;
      } catch (_0x27e3ce) {
        console.warn("[VidEasy] \u274C Error from " + _0x190fbc + ": " + _0x27e3ce.message);
        return [];
      }
    });
  }
  function getStreams(_0x4163e4, _0x4a8f82, _0x57a54f = null, _0x2338cf = null) {
    return __async(this, null, function* () {
      console.log("[VidEasy] Starting extraction for TMDB ID: " + _0x4163e4 + ", Type: " + _0x4a8f82 + (_0x4a8f82 === "tv" ? ", S:" + _0x57a54f + "E:" + _0x2338cf : ""));
      try {
        const _0x3a5953 = yield fetchMediaDetails(_0x4163e4, _0x4a8f82, _0x57a54f, _0x2338cf);
        if (!_0x3a5953) {
          console.error("[VidEasy] Failed to fetch media details from TMDB.");
          return [];
        }
        console.log('[VidEasy] Media Details: "' + _0x3a5953.title + '" (' + _0x3a5953.year + ") | Duration: " + _0x3a5953.duration);
        const _0x17212a = WINGS_API_BASE + "/seed?mediaId=" + _0x4163e4;
        console.log("[VidEasy] Fetching seed from: " + _0x17212a);
        const _0x484d76 = yield fetch(_0x17212a, {
          headers: REQUEST_HEADERS
        });
        if (!_0x484d76.ok) {
          throw new Error("Seed HTTP " + _0x484d76.status);
        }
        const _0x4d5914 = yield _0x484d76.json();
        const _0x4046c7 = _0x4d5914.seed;
        if (!_0x4046c7) {
          throw new Error("No seed returned from API");
        }
        console.log("[VidEasy] Seed successfully retrieved: " + _0x4046c7);
        const _0x62a48c = Object.keys(SERVERS).map((_0x1a6008) => {
          const _0x174b87 = SERVERS[_0x1a6008];
          return fetchFromWingsServer(_0x1a6008, _0x174b87, _0x4a8f82, _0x4163e4, _0x3a5953, _0x4046c7, _0x57a54f, _0x2338cf);
        });
        const _0x278a77 = yield Promise.all(_0x62a48c);
        const _0x1f3c41 = [];
        _0x278a77.forEach((_0x9bb440) => {
          _0x1f3c41.push(..._0x9bb440);
        });
        const _0x415d71 = [];
        const _0x2984c0 =   new Set();
        _0x1f3c41.forEach((_0x553aeb) => {
          if (!_0x2984c0.has(_0x553aeb.url)) {
            _0x2984c0.add(_0x553aeb.url);
            _0x415d71.push(_0x553aeb);
          }
        });
        const _0x4daff2 = Object.keys(SERVERS);
        _0x415d71.sort((_0x5eece5, _0x1f4583) => {
          if (_0x5eece5._is4k && !_0x1f4583._is4k) {
            return -1;
          }
          if (!_0x5eece5._is4k && _0x1f4583._is4k) {
            return 1;
          }
          const _0x21bcd3 = _0x4daff2.indexOf(_0x5eece5._serverName);
          const _0x55b90c = _0x4daff2.indexOf(_0x1f4583._serverName);
          return _0x21bcd3 - _0x55b90c;
        });
        console.log("[VidEasy] Total unique streams found: " + _0x415d71.length);
        return _0x415d71;
      } catch (_0x38985a) {
        console.error("[VidEasy] Error in getStreams: " + _0x38985a.message);
        return [];
      }
    });
  }
  module2.exports = {
    getStreams
  };
  return module2.exports.getStreams;
}();
var __videasyClasico = function() {
  var module2 = { exports: {} };
  var exports2 = module2.exports;
  var global = globalThis;
  const HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Connection": "keep-alive"
  };
  const API = "https://enc-dec.app/api";
  const TMDB_API_KEY = "d131017ccc6e5462a81c9304d21476de";
  const TMDB_BASE_URL = "https://api.themoviedb.org/3";
  const SERVERS = {
    "Chamber": {
      url: "https://api.videasy.net/meine/sources-with-title",
      language: "French",
      params: { language: "french" },
      moviesOnly: true
    },
    "Raze": {
      url: "https://api.videasy.net/superflix/sources-with-title",
      language: "Portuguese"
    },
    "Phoenix": {
      url: "https://api.videasy.net/overflix/sources-with-title",
      language: "Portuguese"
    },
    "Astra": {
      url: "https://api.videasy.net/visioncine/sources-with-title",
      language: "Portuguese"
    }
  };
  function requestRaw(method, urlString, options) {
    return fetch(urlString, {
      method,
      headers: options && options.headers || {},
      body: options && options.body || void 0
    }).then((response) => {
      return response.text().then((body) => {
        if (response.ok) {
          return {
            status: response.status,
            headers: response.headers,
            body
          };
        } else {
          throw new Error(`HTTP ${response.status}: ${body}`);
        }
      });
    });
  }
  function getText(url) {
    return requestRaw("GET", url, { headers: HEADERS }).then((res) => res.body);
  }
  function getJson(url) {
    return requestRaw("GET", url, { headers: HEADERS }).then((res) => {
      try {
        return JSON.parse(res.body);
      } catch (e) {
        throw new Error(`Invalid JSON from GET ${url}: ${e.message}`);
      }
    });
  }
  function postJson(url, jsonBody, extraHeaders) {
    const body = JSON.stringify(jsonBody);
    const headers = Object.assign(
      {},
      HEADERS,
      { "Content-Type": "application/json" },
      extraHeaders || {}
    );
    return requestRaw("POST", url, { headers, body }).then((res) => {
      try {
        return JSON.parse(res.body);
      } catch (e) {
        throw new Error(`Invalid JSON from POST ${url}: ${e.message}`);
      }
    });
  }
  function decryptVideoEasy(encryptedText, tmdbId) {
    return postJson(`${API}/dec-videasy`, { text: encryptedText, id: tmdbId }).then((response) => response.result);
  }
  function fetchMovieDetails(tmdbId) {
    const url = `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=external_ids`;
    return getJson(url).then((data) => ({
      id: data.id,
      title: data.title,
      year: data.release_date ? data.release_date.split("-")[0] : "",
      imdbId: data.external_ids && data.external_ids.imdb_id ? data.external_ids.imdb_id : "",
      mediaType: "movie",
      overview: data.overview,
      poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : "",
      backdrop: data.backdrop_path ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}` : ""
    }));
  }
  function fetchTvDetails(tmdbId) {
    const url = `${TMDB_BASE_URL}/tv/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=external_ids`;
    return getJson(url).then((data) => ({
      id: data.id,
      title: data.name,
      year: data.first_air_date ? data.first_air_date.split("-")[0] : "",
      imdbId: data.external_ids && data.external_ids.imdb_id ? data.external_ids.imdb_id : "",
      mediaType: "tv",
      overview: data.overview,
      poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : "",
      backdrop: data.backdrop_path ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}` : "",
      numberOfSeasons: data.number_of_seasons,
      numberOfEpisodes: data.number_of_episodes
    }));
  }
  function fetchMediaDetails(tmdbId, mediaType = null) {
    if (mediaType === "movie") {
      return fetchMovieDetails(tmdbId);
    } else if (mediaType === "tv") {
      return fetchTvDetails(tmdbId);
    } else {
      return fetchMovieDetails(tmdbId).catch(() => fetchTvDetails(tmdbId));
    }
  }
  function buildVideoEasyUrl(serverConfig, mediaType, title, year, tmdbId, imdbId, seasonId = null, episodeId = null) {
    const params = {
      title,
      mediaType,
      year,
      tmdbId,
      imdbId
    };
    if (serverConfig.params) {
      Object.keys(serverConfig.params).forEach((key) => {
        params[key] = serverConfig.params[key];
      });
    }
    if (mediaType === "tv" && seasonId && episodeId) {
      params.seasonId = seasonId;
      params.episodeId = episodeId;
    }
    const queryString = Object.keys(params).map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(params[key])).join("&");
    return `${serverConfig.url}?${queryString}`;
  }
  function normalizeLanguageName(language) {
    if (!language || typeof language !== "string") {
      return "";
    }
    const languageMap = {
      "en": "English",
      "eng": "English",
      "english": "English",
      "hi": "Hindi",
      "hin": "Hindi",
      "hindi": "Hindi",
      "de": "German",
      "ger": "German",
      "german": "German",
      "it": "Italian",
      "ita": "Italian",
      "italian": "Italian",
      "fr": "French",
      "fre": "French",
      "french": "French",
      "es": "Spanish",
      "spa": "Spanish",
      "spanish": "Spanish",
      "pt": "Portuguese",
      "por": "Portuguese",
      "portuguese": "Portuguese",
      "ar": "Arabic",
      "ara": "Arabic",
      "arabic": "Arabic",
      "zh": "Chinese",
      "chi": "Chinese",
      "chinese": "Chinese",
      "ja": "Japanese",
      "jpn": "Japanese",
      "japanese": "Japanese",
      "ko": "Korean",
      "kor": "Korean",
      "korean": "Korean",
      "bn": "Bengali",
      "ben": "Bengali",
      "bengali": "Bengali",
      "ta": "Tamil",
      "tam": "Tamil",
      "tamil": "Tamil",
      "te": "Telugu",
      "tel": "Telugu",
      "telugu": "Telugu",
      "ml": "Malayalam",
      "mal": "Malayalam",
      "malayalam": "Malayalam",
      "kn": "Kannada",
      "kan": "Kannada",
      "kannada": "Kannada",
      "mr": "Marathi",
      "mar": "Marathi",
      "marathi": "Marathi",
      "gu": "Gujarati",
      "guj": "Gujarati",
      "gujarati": "Gujarati",
      "pa": "Punjabi",
      "pan": "Punjabi",
      "punjabi": "Punjabi",
      "ur": "Urdu",
      "urd": "Urdu",
      "urdu": "Urdu",
      "fa": "Persian",
      "per": "Persian",
      "persian": "Persian",
      "tr": "Turkish",
      "tur": "Turkish",
      "turkish": "Turkish",
      "vi": "Vietnamese",
      "vie": "Vietnamese",
      "vietnamese": "Vietnamese",
      "th": "Thai",
      "tha": "Thai",
      "thai": "Thai",
      "id": "Indonesian",
      "ind": "Indonesian",
      "indonesian": "Indonesian"
    };
    const normalized = language.toLowerCase().trim();
    return languageMap[normalized] || language;
  }
  function extractQualityFromUrl(url) {
    const qualityPatterns = [
      /(\d{3,4})p/i,
      /(\d{3,4})k/i,
      /quality[_-]?(\d{3,4})/i,
      /res[_-]?(\d{3,4})/i,
      /(\d{3,4})x\d{3,4}/i,
      /\/MTA4MA==\//i,
      /\/NzIw\//i,
      /\/MzYw\//i,
      /\/NDgw\//i,
      /\/MTkyMA==\//i,
      /\/MTI4MA==\//i
    ];
    for (const pattern of qualityPatterns) {
      const match = url.match(pattern);
      if (match) {
        if (pattern.source.includes("MTA4MA==")) return "1080p";
        if (pattern.source.includes("NzIw")) return "720p";
        if (pattern.source.includes("MzYw")) return "360p";
        if (pattern.source.includes("NDgw")) return "480p";
        if (pattern.source.includes("MTkyMA==")) return "1080p";
        if (pattern.source.includes("MTI4MA==")) return "720p";
        const qualityNum = parseInt(match[1]);
        if (qualityNum >= 240 && qualityNum <= 4320) {
          return `${qualityNum}p`;
        }
      }
    }
    if (url.includes("1080") || url.includes("1920")) return "1080p";
    if (url.includes("720") || url.includes("1280")) return "720p";
    if (url.includes("480") || url.includes("854")) return "480p";
    if (url.includes("360") || url.includes("640")) return "360p";
    if (url.includes("240") || url.includes("426")) return "240p";
    return "unknown";
  }
  function parseHlsPlaylist(url) {
    return getText(url).then((content) => {
      const resolutions = [];
      const bandwidths = [];
      const resolutionMatches = content.match(/RESOLUTION=(\d+x\d+)/g) || [];
      resolutionMatches.forEach((res) => {
        const height = parseInt(res.split("x")[1].replace("RESOLUTION=", ""));
        resolutions.push(height);
      });
      const bandwidthMatches = content.match(/BANDWIDTH=(\d+)/g) || [];
      bandwidthMatches.forEach((bw) => {
        const bandwidth = parseInt(bw.replace("BANDWIDTH=", ""));
        bandwidths.push(bandwidth);
      });
      if (resolutions.length > 0) {
        const maxResolution = Math.max(...resolutions);
        if (maxResolution >= 1080) return "1080p";
        else if (maxResolution >= 720) return "720p";
        else if (maxResolution >= 480) return "480p";
        else if (maxResolution >= 360) return "360p";
        else return "240p";
      }
      if (bandwidths.length > 0) {
        const maxBandwidth = Math.max(...bandwidths);
        if (maxBandwidth >= 5e6) return "1080p";
        else if (maxBandwidth >= 3e6) return "720p";
        else if (maxBandwidth >= 15e5) return "480p";
        else if (maxBandwidth >= 8e5) return "360p";
        else return "240p";
      }
      if (content.includes("#EXT-X-STREAM-INF")) {
        return "adaptive";
      }
      return "unknown";
    }).catch(() => "unknown");
  }
  function formatStreamsForNuvio(mediaData, serverName, serverConfig, mediaDetails) {
    if (!mediaData || typeof mediaData !== "object" || !mediaData.sources) {
      return [];
    }
    const streams = [];
    mediaData.sources.forEach((source) => {
      if (source.url) {
        let quality = source.quality || extractQualityFromUrl(source.url);
        let detectedLanguage = "";
        if (quality === "unknown" && source.url.includes(".m3u8")) {
          parseHlsPlaylist(source.url).then((parsedQuality) => {
            quality = parsedQuality === "adaptive" ? "Adaptive" : parsedQuality;
          });
        }
        if (quality && typeof quality === "string") {
          const providerNames = ["streamwish", "voesx", "filemoon", "fileions", "filelions", "streamtape", "streamlare", "doodstream", "upstream", "mixdrop"];
          const isProviderName = providerNames.some(
            (provider) => quality.toLowerCase().includes(provider.toLowerCase())
          );
          if (isProviderName) {
            quality = extractQualityFromUrl(source.url);
            if (quality === "unknown") {
              quality = "Adaptive";
            }
          }
          if (quality.includes("GB") || quality.includes("MB") || quality.includes("|")) {
            quality = extractQualityFromUrl(source.url);
            if (quality === "unknown") {
              quality = "Adaptive";
            }
          }
          const languageNames = ["english", "hindi", "german", "italian", "spanish", "portuguese", "french", "arabic", "chinese", "japanese", "korean", "bengali", "tamil", "telugu", "malayalam", "kannada", "marathi", "gujarati", "punjabi", "urdu", "persian", "turkish", "vietnamese", "thai", "indonesian"];
          const isLanguageName = languageNames.some(
            (lang) => quality.toLowerCase().includes(lang.toLowerCase())
          );
          if (isLanguageName) {
            detectedLanguage = normalizeLanguageName(quality);
            quality = extractQualityFromUrl(source.url);
            if (quality === "unknown") {
              quality = "Adaptive";
            }
          }
          if (quality.toLowerCase() === "hd" || quality.toLowerCase() === "high") {
            const urlQuality = extractQualityFromUrl(source.url);
            if (urlQuality !== "unknown") {
              quality = urlQuality;
            } else {
              quality = "720p";
            }
          }
          if (quality.toLowerCase() === "sd" || quality.toLowerCase() === "standard") {
            quality = "480p";
          }
          if (quality.toLowerCase() === "auto") {
            quality = "Auto";
          }
          if (quality.toLowerCase() === "adaptive") {
            quality = "Adaptive";
          }
        }
        let streamType = "unknown";
        let headers = Object.assign({}, HEADERS, {
          "Referer": "https://api.videasy.net/",
          "Origin": "https://player.videasy.net"
        });
        if (source.url.includes(".m3u8")) {
          streamType = "hls";
          headers = Object.assign(headers, {
            "Accept": "application/vnd.apple.mpegurl,application/x-mpegURL,*/*"
          });
        } else if (source.url.includes(".mp4")) {
          streamType = "mp4";
          headers = Object.assign(headers, {
            "Accept": "video/mp4,*/*",
            "Range": "bytes=0-"
          });
        } else if (source.url.includes(".mkv")) {
          streamType = "mkv";
          headers = Object.assign(headers, {
            "Accept": "video/x-matroska,*/*",
            "Range": "bytes=0-"
          });
        }
        const title = `${mediaDetails.title} (${mediaDetails.year})`;
        let languageInfo = "";
        if (source.language) {
          const normalizedLanguage = normalizeLanguageName(source.language);
          if (normalizedLanguage) {
            languageInfo = ` [${normalizedLanguage}]`;
          }
        } else if (detectedLanguage) {
          languageInfo = ` [${detectedLanguage}]`;
        }
        streams.push({
          name: `VIDEASY ${serverName} (${serverConfig.language})${languageInfo} - ${quality}`,
          title,
          url: source.url,
          quality,
          size: "Unknown",
          headers,
          provider: "videasy"
        });
      }
    });
    return streams;
  }
  function fetchFromServer(serverName, serverConfig, mediaType, title, year, tmdbId, imdbId, seasonId, episodeId) {
    console.log(`[VideoEasy] Fetching from ${serverName} (${serverConfig.language})...`);
    if (mediaType === "tv" && serverConfig.moviesOnly) {
      console.log(`[VideoEasy] Skipping ${serverName} - movies only`);
      return Promise.resolve([]);
    }
    const url = buildVideoEasyUrl(serverConfig, mediaType, title, year, tmdbId, imdbId, seasonId, episodeId);
    return getText(url).then((encryptedData) => {
      if (!encryptedData || encryptedData.trim() === "") {
        throw new Error("No encrypted data received");
      }
      return decryptVideoEasy(encryptedData, tmdbId);
    }).then((decryptedData) => {
      const streams = formatStreamsForNuvio(decryptedData, serverName, serverConfig, { title, year });
      console.log(`[VideoEasy] \u2705 Found ${streams.length} stream(s) from ${serverName}`);
      return streams;
    }).catch((error) => {
      console.log(`[VideoEasy] \u274C Error from ${serverName}: ${error.message}`);
      return [];
    });
  }
  function getStreams(tmdbId, mediaType, seasonNum, episodeNum) {
    console.log(`[VideoEasy] Starting extraction for TMDB ID: ${tmdbId}, Type: ${mediaType}`);
    return new Promise((resolve, reject) => {
      fetchMediaDetails(tmdbId, mediaType).then((mediaDetails) => {
        console.log(`[VideoEasy] Found: ${mediaDetails.title} (${mediaDetails.year})`);
        const serverPromises = Object.keys(SERVERS).map((serverName) => {
          const serverConfig = SERVERS[serverName];
          const doubleEncodedTitle = encodeURIComponent(encodeURIComponent(mediaDetails.title).replace(/\+/g, "%20"));
          return fetchFromServer(
            serverName,
            serverConfig,
            mediaDetails.mediaType,
            doubleEncodedTitle,
            mediaDetails.year,
            tmdbId,
            mediaDetails.imdbId,
            seasonNum,
            episodeNum
          );
        });
        return Promise.all(serverPromises).then((results) => {
          const allStreams = [];
          results.forEach((streams) => {
            allStreams.push(...streams);
          });
          const uniqueStreams = [];
          const seenUrls =   new Set();
          allStreams.forEach((stream) => {
            if (!seenUrls.has(stream.url)) {
              seenUrls.add(stream.url);
              uniqueStreams.push(stream);
            }
          });
          const getQualityValue = (quality) => {
            const q = quality.toLowerCase().replace(/p$/, "");
            if (q === "4k" || q === "2160") return 2160;
            if (q === "1440") return 1440;
            if (q === "1080") return 1080;
            if (q === "720") return 720;
            if (q === "480") return 480;
            if (q === "360") return 360;
            if (q === "240") return 240;
            if (q === "Adaptive" || q === "Auto") return 4e3;
            if (q === "unknown") return 0;
            const numQuality = parseInt(q);
            if (!isNaN(numQuality) && numQuality > 0) {
              return numQuality;
            }
            return 1;
          };
          uniqueStreams.sort((a, b) => {
            const qualityA = getQualityValue(a.quality);
            const qualityB = getQualityValue(b.quality);
            return qualityB - qualityA;
          });
          console.log(`[VideoEasy] Total streams found: ${uniqueStreams.length}`);
          resolve(uniqueStreams);
        });
      }).catch((error) => {
        console.error(`[VideoEasy] Error fetching media details: ${error.message}`);
        resolve([]);
      });
    });
  }
  if (typeof module2 !== "undefined" && module2.exports) {
    module2.exports = { getStreams };
  } else {
    global.getStreams = getStreams;
  }
  return module2.exports.getStreams;
}();
module.exports = {
  getStreams: function(tmdbId, mediaType, season, episode) {
    const seguro = (fn) => Promise.resolve().then(() => fn(tmdbId, mediaType, season, episode)).catch(() => []);
    return Promise.all([seguro(__videasyWings), seguro(__videasyClasico)]).then((partes) => {
      const vistos =   new Set();
      return [].concat(...partes.map((p) => Array.isArray(p) ? p : [])).filter((s) => s && s.url && !vistos.has(s.url) && vistos.add(s.url));
    });
  }
};
;
(function() {
  const NOMBRES = { Hydrogen: "CDN", Titanium: "Tejo", Oxygen: "Neon2", Lithium: "Downloader", Krypton: "YM", Carbon: "MB-Flix", Aluminium: "LaMovie", Nitrogen: "M4UHD", Helium: "1Movies" };
  const AJENOS = { Neon: 1, Overflix: 1, Visioncine: 1, Chamber: 1 };
  async function adaptar(s, contexto) {
    const nombre = limpiar(s.name);
    const headers = cabecerasDe(s);
    const clasico = nombre.match(/^VIDEASY (\S+) \(([^)]+)\)(?: \[([^\]]+)\])? - (.+)$/);
    if (clasico) {
      const audio2 = idiomaDe(clasico[3] || clasico[2]);
      if (!audio2) return null;
      return tarjeta({ fuente: "VidEasy", servidor: clasico[1], calidad: calidadDe(clasico[4] || s.quality), audio: audio2, url: s.url, headers, subtitles: s.subtitles, titulo: s.title });
    }
    const clave = s._serverName || "";
    if (AJENOS[clave]) return null;
    const partes = nombre.split(" | ");
    let audio = clave === "Aluminium" ? "Latino" : idiomaDe(partes.slice(2).join(" "));
    if (!audio) audio = textoAudios(await audiosHls(s.url, headers));
    if (!audio && clave !== "Oxygen") audio = await idiomaOriginal(contexto);
    if (!audio) return null;
    return tarjeta({ fuente: "VidEasy", servidor: NOMBRES[clave] || clave, calidad: calidadDe(partes[1]), audio, url: s.url, headers, subtitles: s.subtitles, titulo: String(s.title || "").split("\n")[0] });
  }
  const original = module.exports && module.exports.getStreams;
  if (typeof original !== "function") return;
  const TELE = typeof __plugin_sleep !== "function" && typeof __cheerio_load === "function";
  const ESPANOL = /(^|[^a-z])(latino|latin|latam|spanish|espa[nñ]ol|castellano|castilian|spa|esp|es-419|es-mx|es-la|es-es|es_419|es_es)([^a-z]|$)/i;
  const CASTELLANO = /castellano|castilian|es-es|es_es|spain|espa[nñ]a|\bcast\b/i;
  function limpiar(t) {
    return String(t || "").replace(/[\u200b\ufeff]/g, "").trim();
  }
  function idiomaDe(texto) {
    const t = limpiar(texto);
    if (!t || !ESPANOL.test(t)) return "";
    return CASTELLANO.test(t) ? "Castellano" : "Latino";
  }
  function calidadDe(texto) {
    const t = limpiar(texto);
    if (/2160|\b4k\b/i.test(t)) return "4K";
    const m = t.match(/(\d{3,4})\s*p?/i);
    if (m && Number(m[1]) >= 240 && Number(m[1]) <= 4320) return `${m[1]}p`;
    if (/\bhd\b/i.test(t)) return "HD";
    return "Auto";
  }
  function cabecerasDe(s) {
    if (s && s.headers && Object.keys(s.headers).length) return s.headers;
    const h = s && s.behaviorHints && s.behaviorHints.proxyHeaders && s.behaviorHints.proxyHeaders.request;
    return h && Object.keys(h).length ? h : null;
  }
  function tarjeta(d) {
    const nombre = d.servidor ? `${d.fuente} (${d.servidor})` : d.fuente;
    const s = { name: nombre, title: limpiar(d.titulo) || nombre, url: d.url, quality: `Calidad: ${d.calidad || "Auto"}`, provider: d.fuente };
    if (d.tamano) s.size = `Tama\xF1o: ${d.tamano}`;
    if (d.audio) s.language = `Audio: ${d.audio}`;
    if (TELE) {
      s.size = [s.quality, s.size].filter(Boolean).join(" \u2022 ");
      s.quality = s.name;
    }
    if (d.headers && Object.keys(d.headers).length) s.headers = d.headers;
    if (d.subtitles && d.subtitles.length) s.subtitles = d.subtitles;
    if (d.infoHash) s.infoHash = d.infoHash;
    return s;
  }
  function nombreAudio(atributos) {
    const idioma = (atributos.match(/LANGUAGE="([^"]*)"/i) || [])[1] || "";
    const nombre = (atributos.match(/NAME="([^"]*)"/i) || [])[1] || "";
    if (/^(es|spa)$/i.test(idioma)) return CASTELLANO.test(nombre) ? "Castellano" : "Latino";
    return idiomaDe(`${idioma} ${nombre}`);
  }
  async function audiosHls(url, headers) {
    if (!/\.m3u8|\/hls|master|playlist/i.test(String(url || ""))) return [];
    try {
      const r = await fetch(url, { headers: headers || {} });
      if (!r || !r.ok) return [];
      const texto = await r.text();
      const lista = [];
      for (const linea of String(texto || "").split(/\r?\n/)) {
        if (!/^#EXT-X-MEDIA:/i.test(linea) || !/TYPE=AUDIO/i.test(linea)) continue;
        const idioma = nombreAudio(linea);
        if (idioma && !lista.includes(idioma)) lista.push(idioma);
      }
      return lista;
    } catch (e) {
      return [];
    }
  }
  const originales = {};
  async function idiomaOriginal(contexto) {
    const id = String(contexto && contexto.tmdbId || "").replace(/\D/g, "");
    if (!id) return "";
    const tipo = contexto.tipo === "tv" || contexto.tipo === "series" ? "tv" : "movie";
    const clave = `${tipo}/${id}`;
    if (!(clave in originales)) {
      originales[clave] = (async () => {
        try {
          const r = await fetch(`https://api.themoviedb.org/3/${clave}?api_key=439c478a771f35c05022f9feabcca01c`);
          const d = r && r.ok ? await r.json() : null;
          const codigo = String(d && d.original_language || "").toLowerCase();
          const paises = [].concat(d && d.origin_country || [], (d && d.production_countries || []).map((x) => x.iso_3166_1));
          if (codigo === "es") return paises.length && paises.every((p) => p === "ES") ? "Castellano" : "Latino";
          return "";
        } catch (e) {
          return "";
        }
      })();
    }
    return originales[clave];
  }
  function textoAudios(lista) {
    return lista.join(", ");
  }
  function tamanoDe(texto) {
    const m = limpiar(texto).match(/(\d+(?:[.,]\d+)?)\s*(GB|MB|GiB|MiB)/i);
    return m ? `${m[1].replace(",", ".")} ${m[2].toUpperCase().replace("I", "")}` : "";
  }
  function lineaCon(texto, simbolo) {
    return String(texto || "").split("\n").find((l) => l.includes(simbolo)) || "";
  }
  module.exports.getStreams = async function() {
    const contexto = { tmdbId: arguments[0], tipo: arguments[1] };
    let lista = [];
    try {
      lista = await original.apply(this, arguments) || [];
    } catch (e) {
      lista = [];
    }
    const salida = [];
    const vistos =   new Set();
    for (const s of Array.isArray(lista) ? lista : []) {
      if (!s || !s.url) continue;
      let t = null;
      try {
        t = await adaptar(s, contexto);
      } catch (e) {
        t = null;
      }
      if (t && !vistos.has(t.url + t.name + (t.language || ""))) {
        vistos.add(t.url + t.name + (t.language || ""));
        salida.push(t);
      }
    }
    return salida;
  };
})();
