if (typeof setTimeout === "undefined") {
  globalThis.setTimeout = function(fn, ms) {
    if (typeof fn === "function" && (Number(ms) || 0) < 5e3) Promise.resolve().then(fn);
    return 0;
  };
  globalThis.clearTimeout = function() {
  };
}
const _0x2f4cb9 = _0x42d0;
(function(_0xd71400, _0x4ebb4c) {
  const _0x1c797e = { _0x306088: 308, _0x2e05ee: 301, _0xed414b: 289, _0x3d0edc: 286, _0x75aedf: 320 }, _0x46f2f5 = _0x42d0, _0x4990bf = _0xd71400();
  while (!![]) {
    try {
      const _0x3c5c7d = parseInt(_0x46f2f5(278)) / 1 * (-parseInt(_0x46f2f5(322)) / 2) + -parseInt(_0x46f2f5(_0x1c797e._0x306088)) / 3 * (-parseInt(_0x46f2f5(316)) / 4) + -parseInt(_0x46f2f5(_0x1c797e._0x2e05ee)) / 5 * (parseInt(_0x46f2f5(290)) / 6) + -parseInt(_0x46f2f5(254)) / 7 + -parseInt(_0x46f2f5(_0x1c797e._0xed414b)) / 8 * (parseInt(_0x46f2f5(267)) / 9) + parseInt(_0x46f2f5(_0x1c797e._0x3d0edc)) / 10 + parseInt(_0x46f2f5(_0x1c797e._0x75aedf)) / 11;
      if (_0x3c5c7d === _0x4ebb4c) break;
      else _0x4990bf["push"](_0x4990bf["shift"]());
    } catch (_0x37fdc9) {
      _0x4990bf["push"](_0x4990bf["shift"]());
    }
  }
})(_0x55f9, 179360);
var __defProp = Object[_0x2f4cb9(256)], __defProps = Object[_0x2f4cb9(310)], __getOwnPropDescs = Object[_0x2f4cb9(262)], __getOwnPropSymbols = Object[_0x2f4cb9(260)], __hasOwnProp = Object["prototype"][_0x2f4cb9(295)], __propIsEnum = Object[_0x2f4cb9(306)]["propertyIsEnumerable"], __defNormalProp = (_0x77a907, _0x2bdc2d, _0x5dd5e3) => _0x2bdc2d in _0x77a907 ? __defProp(_0x77a907, _0x2bdc2d, { "enumerable": !![], "configurable": !![], "writable": !![], "value": _0x5dd5e3 }) : _0x77a907[_0x2bdc2d] = _0x5dd5e3, __spreadValues = (_0x27347d, _0x3f6085) => {
  const _0x17aaaf = { _0x4246bc: 250 }, _0x1d0132 = _0x2f4cb9;
  for (var _0x5dc583 in _0x3f6085 || (_0x3f6085 = {})) if (__hasOwnProp[_0x1d0132(_0x17aaaf._0x4246bc)](_0x3f6085, _0x5dc583)) __defNormalProp(_0x27347d, _0x5dc583, _0x3f6085[_0x5dc583]);
  if (__getOwnPropSymbols) for (var _0x5dc583 of __getOwnPropSymbols(_0x3f6085)) {
    if (__propIsEnum[_0x1d0132(250)](_0x3f6085, _0x5dc583)) __defNormalProp(_0x27347d, _0x5dc583, _0x3f6085[_0x5dc583]);
  }
  return _0x27347d;
}, __spreadProps = (_0x3f444a, _0x4e8f50) => __defProps(_0x3f444a, __getOwnPropDescs(_0x4e8f50)), __async = (_0x1d9281, _0x3ddae7, _0x393a24) => {
  const _0x49342e = { _0x53cc1c: 304 };
  return new Promise((_0x1bb2b2, _0xd7a452) => {
    const _0x134bbe = _0x42d0;
    var _0x4d6dd6 = (_0x3ee842) => {
      try {
        _0x288ab2(_0x393a24["next"](_0x3ee842));
      } catch (_0x4d727e) {
        _0xd7a452(_0x4d727e);
      }
    }, _0x48bb8c = (_0x1fc61e) => {
      try {
        _0x288ab2(_0x393a24["throw"](_0x1fc61e));
      } catch (_0x4e61b0) {
        _0xd7a452(_0x4e61b0);
      }
    }, _0x288ab2 = (_0x295b73) => _0x295b73[_0x134bbe(288)] ? _0x1bb2b2(_0x295b73[_0x134bbe(255)]) : Promise["resolve"](_0x295b73["value"])["then"](_0x4d6dd6, _0x48bb8c);
    _0x288ab2((_0x393a24 = _0x393a24["apply"](_0x1d9281, _0x3ddae7))[_0x134bbe(_0x49342e._0x53cc1c)]());
  });
}, VIDFAST_API = _0x2f4cb9(246), DECRYPT_API = _0x2f4cb9(311), HEADERS = { "User-Agent": _0x2f4cb9(291), "Referer": "https://vidfast.vc/", "X-Requested-With": _0x2f4cb9(294) };
function generateM3u8(_0x4f3e7f) {
  const _0x51424a = { _0x114aac: 305, _0x34737d: 274, _0x247f07: 257, _0x69a086: 247, _0x1cdd11: 270, _0x3d5057: 261 };
  return __async(this, arguments, function* (_0x616417, _0x35cabd = {}) {
    const _0x45961d = _0x42d0;
    try {
      console["log"](_0x45961d(314) + _0x616417);
      const _0x2ff104 = yield fetch(_0x616417, { "headers": _0x35cabd }), _0x5bfcd9 = yield _0x2ff104[_0x45961d(248)](), _0x5864cc = _0x616417[_0x45961d(269)](0, _0x616417[_0x45961d(_0x51424a._0x114aac)]("/")) + "/", _0x197bd0 = [], _0x11fdb1 = /#EXT-X-STREAM-INF:.*?RESOLUTION=(\d+x\d+).*?\n([^\n]+)/g;
      let _0x215013;
      while ((_0x215013 = _0x11fdb1[_0x45961d(_0x51424a._0x34737d)](_0x5bfcd9)) !== null) {
        const _0x256ad2 = parseInt(_0x215013[1][_0x45961d(281)]("x")[1]);
        if (_0x256ad2 < 720) continue;
        const _0x39ba86 = _0x256ad2 + "p";
        let _0x31a7ef = _0x215013[2][_0x45961d(_0x51424a._0x247f07)]();
        if (!_0x31a7ef["startsWith"](_0x45961d(293))) {
          if (_0x31a7ef[_0x45961d(277)]("/")) {
            const _0x469059 = new URL(_0x616417)["origin"];
            _0x31a7ef = _0x469059 + _0x31a7ef;
          } else _0x31a7ef = _0x5864cc + _0x31a7ef;
        }
        _0x197bd0[_0x45961d(_0x51424a._0x69a086)]({ "quality": _0x39ba86, "url": _0x31a7ef });
      }
      return _0x197bd0;
    } catch (_0x3ee653) {
      return console[_0x45961d(_0x51424a._0x1cdd11)](_0x45961d(_0x51424a._0x3d5057), _0x3ee653), [];
    }
  });
}
function _0x42d0(_0x1661dd, _0x1d2f75) {
  _0x1661dd = _0x1661dd - 243;
  const _0x55f91a = _0x55f9();
  let _0x42d09c = _0x55f91a[_0x1661dd];
  if (_0x42d0["NrLpIf"] === void 0) {
    var _0x213f45 = function(_0x3996fc) {
      const _0x6d1dc2 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=";
      let _0x77a907 = "", _0x2bdc2d = "";
      for (let _0x5dd5e3 = 0, _0x27347d, _0x3f6085, _0x5dc583 = 0; _0x3f6085 = _0x3996fc["charAt"](_0x5dc583++); ~_0x3f6085 && (_0x27347d = _0x5dd5e3 % 4 ? _0x27347d * 64 + _0x3f6085 : _0x3f6085, _0x5dd5e3++ % 4) ? _0x77a907 += String["fromCharCode"](255 & _0x27347d >> (-2 * _0x5dd5e3 & 6)) : 0) {
        _0x3f6085 = _0x6d1dc2["indexOf"](_0x3f6085);
      }
      for (let _0x3f444a = 0, _0x4e8f50 = _0x77a907["length"]; _0x3f444a < _0x4e8f50; _0x3f444a++) {
        _0x2bdc2d += "%" + ("00" + _0x77a907["charCodeAt"](_0x3f444a)["toString"](16))["slice"](-2);
      }
      return decodeURIComponent(_0x2bdc2d);
    };
    _0x42d0["iAwYUj"] = _0x213f45, _0x42d0["sXTntF"] = {}, _0x42d0["NrLpIf"] = !![];
  }
  const _0x34c297 = _0x55f91a[0], _0x40ff0c = _0x1661dd + _0x34c297, _0xfc6c5d = _0x42d0["sXTntF"][_0x40ff0c];
  return !_0xfc6c5d ? (_0x42d09c = _0x42d0["iAwYUj"](_0x42d09c), _0x42d0["sXTntF"][_0x40ff0c] = _0x42d09c) : _0x42d09c = _0xfc6c5d, _0x42d09c;
}
function _0x55f9() {
  const _0x32f96d = ["CxvHBgL0Eq", "yxv0BW", "lM0ZDtG", "4Ocl4Ocl4Ocl", "mJu2mdy0mgP0vg1KCG", "ue9tva", "zg9Uzq", "odeWnJy0A0Toy0Li", "nKnLDe9TBW", "tw96AwXSys81lJaGkfDPBMrVD3mGtLqGmtaUmdSGv2LUnJq7ihG2ncKGqxbWBgvxzwjlAxqVntm3lJm2icHlsfrntcWGBgLRzsbhzwnRBYKGq2HYB21LlZeYmI4WlJaUmcbtywzHCMKVntm3lJm2", "nZiW", "Ahr0Ca", "we1mshr0CfjLCxvLC3q", "AgfZt3DUuhjVCgvYDhK", "qwrHChrPDMu", "l2rLyY12AwrMyxn0", "DwHK", "zM9YrwfJAa", "4Ocl4Ocl4Ocl4Ocl", "mtC4odG5nu9dqvvcCG", "ywXS", "mta4ma", "BMv4Da", "BgfZDeLUzgv4t2y", "ChjVDg90ExbL", "C3rYAw5NAwz5", "mZy2wMrTqMnL", "ANnVBG", "zgvMAw5LuhjVCgvYDgLLCW", "Ahr0Chm6lY9LBMmTzgvJlMfWCc9HCgK", "AxnbCNjHEq", "Bg9N", "w1zPzezHC3rDifbHCNnPBMCGBwfZDgvYig0ZDtG6ia", "Dg9mB3DLCKnHC2u", "nJq0BgXZv2PJ", "BgvUz3rO", "CMvZDwX0", "w1zPzezHC3rDifjLDhvYBMLUzYa", "ntC3ntCWngPdA1PRsW", "lM1RDG", "mtq2nJuYqu5fBhHJ", "Aw5JBhvKzxm", "y2f0y2G", "Dg9Rzw4", "Ahr0Chm6lY92AwrMyxn0lNzJ", "ChvZAa", "Dgv4Da", "vxnLCI1bz2vUDa", "y2fSBa", "Bwf0y2G", "BMfTzq", "w1zPzezHC3rDievYCM9YoIa", "nJiYoda0quzKAfPL", "DMfSDwu", "zgvMAw5LuhjVCgvYDhK", "DhjPBq", "w1zPzezHC3rDieXVywrPBMCGCgfNztOG", "zxHWB3j0CW", "z2v0t3DUuhjVCgvYDhLtEw1IB2XZ", "w1zPzezHC3rDievYCM9YihbHCNnPBMCGttnvocWGCMv0DxjUAw5NigvTChr5lG", "z2v0t3DUuhjVCgvYDhLezxnJCMLWDg9YCW", "ihnLCNzLCIHZkq", "w1zPzezHC3rDieLUy29TCgXLDguGzgvJCNLWDgLVBIbJB25MAwC", "w1zPzezHC3rDie5VigvUy29KzwqGDg9Rzw4GzM91BMqGAw4GCgfNzq", "C2vYDMvYCW", "ouzsrgfoBa", "rgvMyxvSDa", "C3vIC3rYAw5N", "D2fYBG", "w1zPzezHC3rDia", "C3rYzwfT", "mJe2ma", "zxHLyW", "DxjS", "qxv0BW", "C3rHCNrZv2L0Aa", "muTvvg1cDq", "ndGW", "w1zPzezHC3rDiezVDw5Kia", "C3bSAxq"];
  _0x55f9 = function() {
    return _0x32f96d;
  };
  return _0x55f9();
}
function getStreams(_0x202f3c, _0x218d90, _0x2bf00e, _0x516fb1) {
  const _0x457b27 = { _0x5e9447: 251, _0x3b0064: 265, _0x4482c3: 318, _0x43e6f7: 245, _0x4047c1: 266, _0x260e92: 287, _0x1a9e5d: 249, _0x5bf054: 309, _0x3727cb: 302, _0x37c987: 319, _0x349df9: 253 };
  return __async(this, null, function* () {
    const _0x2f86f5 = _0x42d0;
    console["log"]("[VidFast] Fetching streams for " + _0x218d90 + " " + _0x202f3c);
    try {
      const _0x47a21c = _0x218d90 !== "tv" && _0x2bf00e == null, _0x455a8e = _0x47a21c ? VIDFAST_API + "/movie/" + _0x202f3c + "/" : VIDFAST_API + "/tv/" + _0x202f3c + "/" + _0x2bf00e + "/" + _0x516fb1 + "/";
      console["log"](_0x2f86f5(258) + _0x455a8e);
      const _0x46f5d8 = yield fetch(_0x455a8e, { "headers": HEADERS }), _0x5962ee = yield _0x46f5d8[_0x2f86f5(248)](), _0x57fc58 = _0x5962ee[_0x2f86f5(_0x457b27._0x5e9447)](/\\"en\\":\\"(.*?)\\"/);
      if (!_0x57fc58 || !_0x57fc58[1]) return console["log"](_0x2f86f5(_0x457b27._0x3b0064)), [];
      const _0x42ec55 = _0x57fc58[1], _0x4c6500 = DECRYPT_API + "/enc-vidfast?text=" + _0x42ec55 + "&version=1", _0x5a839b = yield fetch(_0x4c6500), _0x4d369c = yield _0x5a839b["json"](), _0x1607a3 = _0x4d369c[_0x2f86f5(_0x457b27._0x4482c3)];
      if (!_0x1607a3 || !_0x1607a3["servers"] || !_0x1607a3["stream"] || !_0x1607a3[_0x2f86f5(_0x457b27._0x43e6f7)]) return console[_0x2f86f5(313)](_0x2f86f5(264)), [];
      const _0x5bca7c = _0x1607a3[_0x2f86f5(_0x457b27._0x4047c1)], _0x24a2a9 = _0x1607a3[_0x2f86f5(272)], _0x24a0a7 = _0x1607a3[_0x2f86f5(245)], _0x23b67c = __spreadProps(__spreadValues({}, HEADERS), { "X-CSRF-Token": _0x24a0a7 }), _0x4d0800 = yield fetch(_0x5bca7c, { "method": "POST", "headers": _0x23b67c }), _0x40e829 = yield _0x4d0800["text"](), _0x2008fc = yield fetch(DECRYPT_API + "/dec-vidfast", { "method": _0x2f86f5(_0x457b27._0x260e92), "headers": { "Content-Type": "application/json", "User-Agent": HEADERS[_0x2f86f5(_0x457b27._0x1a9e5d)] }, "body": JSON["stringify"]({ "text": _0x40e829, "version": "1" }) }), _0x4e54cb = yield _0x2008fc[_0x2f86f5(_0x457b27._0x5bf054)](), _0x3300c1 = _0x4e54cb["result"];
      if (!Array[_0x2f86f5(312)](_0x3300c1) || _0x3300c1[_0x2f86f5(317)] === 0) return console["log"]("[VidFast] No servers in decrypted response"), [];
      console["log"](_0x2f86f5(280) + _0x3300c1["length"] + _0x2f86f5(263));
      const _0x39e9a8 = _0x3300c1["map"]((_0xd7aa69) => fetchServerStream(_0xd7aa69, _0x24a2a9, _0x23b67c)[_0x2f86f5(244)](() => [])), _0x4a6cea = yield Promise[_0x2f86f5(_0x457b27._0x3727cb)](_0x39e9a8), _0x3ef87e = [];
      for (const _0x1a377f of _0x4a6cea) {
        _0x1a377f["length"] > 0 && _0x3ef87e[_0x2f86f5(247)](..._0x1a377f);
      }
      return console[_0x2f86f5(313)](_0x2f86f5(_0x457b27._0x37c987) + _0x3ef87e["length"] + " streams"), _0x3ef87e["map"]((_0x3ef4e7) => __spreadProps(__spreadValues({}, _0x3ef4e7), { "quality": getSortedQuality(_0x3ef4e7[_0x2f86f5(282)]) }));
    } catch (_0xd62aa4) {
      return console["error"](_0x2f86f5(_0x457b27._0x349df9) + _0xd62aa4["message"]), [];
    }
  });
}
function fetchServerStream(_0x823982, _0x22cd96, _0x16d7b4) {
  const _0x4c3507 = { _0x5aeaac: 268, _0xab03d0: 287, _0x3f78f8: 297, _0x466b68: 309, _0x40f323: 275, _0x36bd09: 243, _0x39be89: 243, _0x3824e7: 284, _0x583597: 299 };
  return __async(this, null, function* () {
    const _0x5e8c03 = _0x42d0;
    try {
      const _0x483542 = _0x823982["data"];
      if (!_0x483542) return [];
      const _0x1e67f2 = _0x823982[_0x5e8c03(252)] || _0x5e8c03(_0x4c3507._0x5aeaac), _0x36c2bb = _0x823982["description"] || "", _0x47d592 = _0x22cd96 + "/" + _0x483542, _0x45e706 = yield fetch(_0x47d592, { "method": _0x5e8c03(_0x4c3507._0xab03d0), "headers": _0x16d7b4 }), _0x1acbe4 = yield _0x45e706["text"]();
      if (!_0x1acbe4 || _0x1acbe4[_0x5e8c03(257)]() === "") return [];
      const _0x523ba7 = yield fetch(DECRYPT_API + _0x5e8c03(_0x4c3507._0x3f78f8), { "method": _0x5e8c03(287), "headers": { "Content-Type": "application/json", "User-Agent": HEADERS[_0x5e8c03(249)] }, "body": JSON[_0x5e8c03(307)]({ "text": _0x1acbe4, "version": "1" }) }), _0x62df33 = yield _0x523ba7[_0x5e8c03(_0x4c3507._0x466b68)](), _0x3184de = _0x62df33["result"];
      if (!_0x3184de || !_0x3184de[_0x5e8c03(_0x4c3507._0x40f323)]) return [];
      const _0x572747 = _0x3184de[_0x5e8c03(275)], _0x3008db = _0x3184de["4kAvailable"] === !![] || _0x36c2bb && _0x36c2bb[_0x5e8c03(315)]()[_0x5e8c03(_0x4c3507._0x36bd09)]("4k"), _0x5a279e = _0x3008db ? "2160p" : "1080p", _0x599ab6 = _0x572747[_0x5e8c03(_0x4c3507._0x39be89)](_0x5e8c03(_0x4c3507._0x3824e7)), _0x413914 = [{ "name": "Vidfast [" + _0x1e67f2 + "]", "title": _0x599ab6 ? "Auto" : _0x36c2bb || _0x5a279e, "url": _0x572747, "quality": _0x599ab6 ? "Auto" : _0x5a279e, "type": _0x599ab6 ? "m3u8" : _0x572747["includes"](".mp4") || _0x572747[_0x5e8c03(243)](_0x5e8c03(321)) ? "video" : null, "headers": _0x16d7b4, "provider": "vidfast" }];
      if (_0x599ab6) try {
        const _0x12da89 = yield generateM3u8(_0x572747, _0x16d7b4);
        _0x12da89[_0x5e8c03(_0x4c3507._0x583597)]((_0xccafd5) => {
          const _0x9cbb25 = _0x5e8c03;
          _0x413914["push"]({ "name": "Vidfast [" + _0x1e67f2 + "]", "title": _0xccafd5[_0x9cbb25(282)], "url": _0xccafd5[_0x9cbb25(275)], "quality": _0xccafd5[_0x9cbb25(282)], "type": "m3u8", "headers": _0x16d7b4, "provider": "vidfast" });
        });
      } catch (_0x41b10f) {
      }
      return console["log"](_0x5e8c03(271) + _0x1e67f2 + ": found stream (" + (_0x599ab6 ? _0x5e8c03(296) : _0x5a279e) + ")"), _0x413914["map"]((_0x32671a) => __spreadProps(__spreadValues({}, _0x32671a), { "quality": getSortedQuality(_0x32671a["quality"]) }));
    } catch (_0x11cdd5) {
      return [];
    }
  });
}
function getSortedQuality(_0x1fe144) {
  const _0x496587 = { _0x49b33c: 283, _0x28e698: 276, _0x5e5ac4: 298, _0x5abaf4: 303, _0x191847: 243, _0x1a0d0c: 243, _0x51a3c9: 285, _0x214893: 243, _0x5f1ee5: 279 }, _0x23b4ff = _0x2f4cb9;
  if (!_0x1fe144) return "Auto";
  const _0x4cc223 = _0x1fe144[_0x23b4ff(315)]();
  if (_0x4cc223[_0x23b4ff(243)](_0x23b4ff(_0x496587._0x49b33c))) return _0x23b4ff(_0x496587._0x28e698);
  if (_0x4cc223[_0x23b4ff(243)](_0x23b4ff(273)) || _0x4cc223["includes"]("4k") || _0x4cc223[_0x23b4ff(243)](_0x23b4ff(_0x496587._0x5e5ac4))) return "\u200B" + _0x1fe144;
  if (_0x4cc223["includes"](_0x23b4ff(_0x496587._0x5abaf4)) || _0x4cc223[_0x23b4ff(_0x496587._0x191847)]("fhd")) return "\u200B\u200B" + _0x1fe144;
  if (_0x4cc223["includes"](_0x23b4ff(292)) || _0x4cc223[_0x23b4ff(_0x496587._0x1a0d0c)]("hd")) return _0x23b4ff(_0x496587._0x51a3c9) + _0x1fe144;
  if (_0x4cc223[_0x23b4ff(_0x496587._0x214893)](_0x23b4ff(_0x496587._0x5f1ee5)) || _0x4cc223[_0x23b4ff(_0x496587._0x191847)]("sd")) return "\u200B\u200B\u200B\u200B" + _0x1fe144;
  if (_0x4cc223["includes"]("360")) return "\u200B\u200B\u200B\u200B\u200B" + _0x1fe144;
  return _0x23b4ff(300) + _0x1fe144;
}
module[_0x2f4cb9(259)] = { "getStreams": getStreams };
;
(function() {
  async function adaptar(s, contexto) {
    const headers = cabecerasDe(s);
    const texto = [s.name, s.title, s.description, s.language, s.fileName, s.filename].filter(Boolean).join(" ");
    let audio = idiomaDe(texto);
    if (!audio) audio = textoAudios(await audiosHls(s.url, headers));
    if (!audio) audio = await idiomaOriginal(contexto);
    if (!audio) return null;
    const nombre = limpiar(s.name);
    return tarjeta({ fuente: "VidFast", servidor: ((n) => (n.match(/\[([^\]]+)\]/) || [])[1] || "")(nombre), calidad: calidadDe(s.quality || nombre), tamano: tamanoDe(String(s.size || "") + " " + String(s.title || "")), audio, url: s.url, headers, subtitles: s.subtitles, titulo: String(s.title || "").split("\n")[0] });
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
