if (typeof setTimeout === "undefined") {
  globalThis.setTimeout = function(fn, ms) {
    if (typeof fn === "function" && (Number(ms) || 0) < 5e3) Promise.resolve().then(fn);
    return 0;
  };
  globalThis.clearTimeout = function() {
  };
}
const _0x3cd342 = _0x5e70;
(function(_0x5bde39, _0x597b92) {
  const _0x2a2d73 = { _0x5dff50: 496, _0x468eb5: 501, _0x24b78e: 542, _0x88db5e: 580, _0x3cb3b3: 526, _0x1a0bf5: 478 }, _0x390e29 = _0x5e70, _0x35abec = _0x5bde39();
  while (!![]) {
    try {
      const _0x47cb6f = parseInt(_0x390e29(_0x2a2d73._0x5dff50)) / 1 * (-parseInt(_0x390e29(575)) / 2) + -parseInt(_0x390e29(_0x2a2d73._0x468eb5)) / 3 + -parseInt(_0x390e29(423)) / 4 * (parseInt(_0x390e29(555)) / 5) + -parseInt(_0x390e29(585)) / 6 * (-parseInt(_0x390e29(_0x2a2d73._0x24b78e)) / 7) + parseInt(_0x390e29(_0x2a2d73._0x88db5e)) / 8 + parseInt(_0x390e29(_0x2a2d73._0x3cb3b3)) / 9 * (parseInt(_0x390e29(425)) / 10) + parseInt(_0x390e29(_0x2a2d73._0x1a0bf5)) / 11;
      if (_0x47cb6f === _0x597b92) break;
      else _0x35abec["push"](_0x35abec["shift"]());
    } catch (_0x37d0ea) {
      _0x35abec["push"](_0x35abec["shift"]());
    }
  }
})(_0x5eb0, 718540);
var __async = (_0x1e07e2, _0x2cc067, _0x1be933) => {
  const _0x15d55a = { _0x1460ff: 451 };
  return new Promise((_0x2e56f2, _0x7c1fa0) => {
    const _0x550975 = _0x5e70;
    var _0x2c1987 = (_0x55af57) => {
      const _0x3bf95d = _0x5e70;
      try {
        _0x51e2ae(_0x1be933[_0x3bf95d(538)](_0x55af57));
      } catch (_0x198de1) {
        _0x7c1fa0(_0x198de1);
      }
    }, _0x440915 = (_0x581606) => {
      const _0x45671c = _0x5e70;
      try {
        _0x51e2ae(_0x1be933[_0x45671c(470)](_0x581606));
      } catch (_0x16b483) {
        _0x7c1fa0(_0x16b483);
      }
    }, _0x51e2ae = (_0x46bc26) => _0x46bc26["done"] ? _0x2e56f2(_0x46bc26[_0x550975(549)]) : Promise[_0x550975(430)](_0x46bc26["value"])["then"](_0x2c1987, _0x440915);
    _0x51e2ae((_0x1be933 = _0x1be933[_0x550975(_0x15d55a._0x1460ff)](_0x1e07e2, _0x2cc067))[_0x550975(538)]());
  });
}, cheerio = require("cheerio-without-node-native"), CryptoJS = require("crypto-js"), TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c", TMDB_BASE_URL = "https://api.themoviedb.org/3", DEFAULT_API_BASE = _0x3cd342(448), WORKING_HEADERS = { "User-Agent": _0x3cd342(466), "Accept": _0x3cd342(507), "Accept-Language": _0x3cd342(453), "Content-Type": "application/json" };
function getQualityEmoji(_0x2e4b3c) {
  const _0x1525cd = { _0x1350d2: 443, _0x98c864: 447 }, _0x55b5fa = _0x3cd342;
  switch (_0x2e4b3c) {
    case _0x55b5fa(556):
      return "\u2728";
    case "4K":
      return "\u{1F31F}";
    case _0x55b5fa(503):
      return "\u26A1";
    case _0x55b5fa(463):
      return "\u{1F525}";
    case _0x55b5fa(_0x1525cd._0x1350d2):
      return "\u{1F48E}";
    case "480p":
      return _0x55b5fa(_0x1525cd._0x98c864);
    default:
      return "\u{1F4FC}";
  }
}
function _0x5eb0() {
  const _0x417976 = ["qumZiduUmq", "ttjuuW", "8j+oPYbevfm", "zMLSDgvY", "sevwqW", "BgLUA3m", "kI8Q", "yxr0CG", "ANnVBG", "Dgv4Da", "mZyWCa", "vw5RBM93BG", "AM9PBG", "ihWG8j+nQIbdB29RAwuGiW", "ndCYmJuZv1vmvere", "sers", "vhjPCgXLrevt", "l29ZCZ0", "sc4YnJu", "mJa2nZy3oeLHueDSvG", "lK1qna", "mtq0mha", "8j+oRca", "Bg9N", "Dg9vChbLCKnHC2u", "yxbWBgLJyxrPB24VANnVBG", "Dg9tDhjPBMC", "lNnPEMu", "CMvSzwfZzv9KyxrL", "8j+mKcbxruiTuMLW", "zgL2lMzPBgvFCxvHBgL0Eq", "rKHe", "ksb8ifm", "EwvHCG", "DwK9Dg9Rzw4Xlcb1At10B2TLBJi", "ic0Tlq", "DMvYC2LVBNm", "DwK9", "cI0TlsbqCM9JzxnZAw5NienVB2TPzsa", "ndGWua", "C3rHDhvZ", "mtiZzdzJzwrMnJi2zhK1ndiZm2fHmxC2", "w1nOB3DcB3HDiezHAwXLzcb0BYbKzwnYExb0igjHC2u2ncb1AvrVA2vUoG", "8j+tUIbirfrw", "mJi1rg9hv0ni", "sfruuca", "qMfZzty0", "CgfYC2u", "8j+mIcbevG", "u2HVD0jVEcbdB25MAwD1CMf0Aw9U", "AxnbCNjHEq", "C3bSAxq", "l3r2lW", "8j+oNU+4JYbbvJe", "sersmtaR", "w1nOB3DcB3HDifnJCMfWzxiGzxHLy3v0Aw9UigzHAwX1CMu6ia", "BMv4Da", "DxjS", "Aw5JBhvKzxm", "t3b0Aw9UywWGt1ntigDYB3vWihbHCMfTzxrLCI4", "mJi0mJHxDwnmwKq", "u0rs", "reqRnY4X", "ihWGq29VA2LLia", "4PYOieHeuG", "C2vHC29Uia", "zMLSzv9ZAxPL", "DMfSDwu", "zw5J", "wdi2na", "re9mqLKGvKLtsu9o", "rerqnY4X", "8j+oPYberca1lJe", "mtbRCfHHueu", "t3jPz2LUywW", "BgvUz3rO", "C2HHCMvmAw5R", "sdi2nq", "sersmta", "rMvIqM94ie9tuYbhCM91CcaOt3b0Aw9UywWP", "seruvG", "8j+nVYa", "DgHLBG", "mJe2mfa", "8j+tPIbns1y", "yxbPqMfZzq", "AhrTBa", "u2HVD0jVEcb8ia", "Cg9W", "8j+tUIbtrfi", "Dg9gAxHLza", "Bw92Awu", "AgvHzgvY", "ng9pvfjquG", "Bwf0y2G", "w1nOB3DcB3HDiejHC2u2ncbkv1qVsLnptIb0B2TLBIbKzxrLy3rLzc4Gqxr0zw1WDgLUzYbHDxrVBwf0AwmGzgvJCNLWDgLVBI4UlG", "8j+oNU+4JYbirvzd", "ic0Gka", "mZG3mtm4neniAwrsuq", "BNvTyMvY", "y29Kzq", "lLrt", "zxHWB3j0CW", "otu0uefnv0vK", "Ahr0Chm6lY93D3CUzMvIyM94lMnVBs8", "Dw5KzwzPBMvK", "8j+tPIbuuW", "BwLK", "zwfJAa", "DhjPBq", "mtqWmtKZnNrss1fHDW", "Dg9mB3DLCKnHC2u", "ndu5mdKWy3bdBxPH", "8j+tPIbnudq", "zM9YrwfJAa", "BMfTzq", "mta4mfa", "CMvZB2X2zq", "zMLUza", "v0vcreW", "rMvIqM94ifvjifrVA2vUCYaOu2vWyxjHDgvKigj5ignVBw1HCYK", "zMLK", "w1nOB3DcB3HDie5VifvjihrVA2vUicHJB29RAwuPigzVDw5KigLUihnLDhrPBMDZlG", "zgvJCNLWDa", "u0nsqvbfuL9trvrusu5huW", "jM1Pzd0", "rerqns4X", "ieDc", "B3nZr3jVDxa", "ihWG8j+sVIa", "nZiWCa", "zMLSzv9Uyw1L", "jNbHCMvUDf9Pzd0", "q0fn", "8j+xNo+4JW", "Ahr0Chm6lY9Pzc1TyxbWAw5NlwfWAs1ZAg93yM94lxbYB3H5lMHMlNnWywnLl2fWAs9TzwrPyq", "zMLSzv9SAxn0", "v0vcuKLq", "yxbWBhK", "DgL0Bgu", "zw4TvvmSzw47Ct0WlJK", "CgfKu3rHCNq", "BwvZC2fNzq", "vxrMoa", "DwLuB2TLBG", "8j+uIIbbDg1VCW", "8j+oNU+4JYbilJi2ncb8ipcFK7OGu0rsihWG8j+oPYbtDgvYzw8", "ugTJCZC", "zxjYB3i", "p2nVB2TPzt0", "mta4mha", "C3rHCNrZv2L0Aa", "rfrt", "tw96AwXSys81lJaGkfDPBMrVD3mGtLqGmtaUmdSGv2LUnJq7ihG2ncKGqxbWBgvxzwjlAxqVntm3lJm2icHlsfrntcWGBgLRzsbhzwnRBYKGq2HYB21LlZeYmc4WlJaUmcbtywzHCMKVntm3lJm2", "C2HHCMvFBgLUAW", "8j+tPsbxruiTreW", "Ahr0Chm6lY93D3CUzMvIyM94lMnVBs9TyNaVDg9FC2HHCMvFCgfNzt9IB3HFDhLWzt0", "DgHYB3C", "C3rYAw5N", "zgf0yq", "t1jh", "DwLK", "ndGWCa", "zw5JCNLWDf9KyxrH", "tva0", "mtaWmZm3mtziBMDHCeu", "4PYOieHeuJeWkW", "qvzj", "C291CMnL"];
  _0x5eb0 = function() {
    return _0x417976;
  };
  return _0x5eb0();
}
function getSubheadingQualityLabel(_0xc5b276, _0x4a266c) {
  const _0x2d477c = _0x3cd342;
  if (_0xc5b276 === _0x2d477c(556) && _0x4a266c) {
    const _0x22e515 = _0x4a266c["match"](/(\d{3,4})[pP]/);
    if (_0x22e515) return "\u2728 " + _0x22e515[1] + "p";
    return "\u2728 Original";
  }
  const _0x84cace = getQualityEmoji(_0xc5b276);
  return _0x84cace + " " + _0xc5b276;
}
function getFileContainerFormat(_0x4e9021) {
  const _0x4bb180 = { _0x18e360: 566, _0x152c87: 480, _0x491a15: 540, _0x4b4322: 483 }, _0x2519a4 = _0x3cd342;
  if (!_0x4e9021) return _0x2519a4(_0x4bb180._0x18e360);
  const _0x1e0105 = _0x4e9021["toUpperCase"]();
  if (_0x1e0105["includes"](_0x2519a4(502)) || _0x1e0105[_0x2519a4(540)](_0x2519a4(477))) return _0x2519a4(426);
  if (_0x1e0105["includes"](".AVI") || _0x1e0105[_0x2519a4(540)](_0x2519a4(_0x4bb180._0x152c87))) return "\u{1F4E6} AVI";
  if (_0x1e0105[_0x2519a4(_0x4bb180._0x491a15)](_0x2519a4(583)) || _0x1e0105["includes"](_0x2519a4(_0x4bb180._0x4b4322))) return _0x2519a4(588);
  return _0x2519a4(566);
}
function _0x5e70(_0x24c6a8, _0x181650) {
  _0x24c6a8 = _0x24c6a8 - 420;
  const _0x5eb021 = _0x5eb0();
  let _0x5e7047 = _0x5eb021[_0x24c6a8];
  if (_0x5e70["nQUzsb"] === void 0) {
    var _0x1f84a3 = function(_0x5c62de) {
      const _0x58ce67 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=";
      let _0x1e07e2 = "", _0x2cc067 = "";
      for (let _0x1be933 = 0, _0x2e56f2, _0x7c1fa0, _0x2c1987 = 0; _0x7c1fa0 = _0x5c62de["charAt"](_0x2c1987++); ~_0x7c1fa0 && (_0x2e56f2 = _0x1be933 % 4 ? _0x2e56f2 * 64 + _0x7c1fa0 : _0x7c1fa0, _0x1be933++ % 4) ? _0x1e07e2 += String["fromCharCode"](255 & _0x2e56f2 >> (-2 * _0x1be933 & 6)) : 0) {
        _0x7c1fa0 = _0x58ce67["indexOf"](_0x7c1fa0);
      }
      for (let _0x440915 = 0, _0x51e2ae = _0x1e07e2["length"]; _0x440915 < _0x51e2ae; _0x440915++) {
        _0x2cc067 += "%" + ("00" + _0x1e07e2["charCodeAt"](_0x440915)["toString"](16))["slice"](-2);
      }
      return decodeURIComponent(_0x2cc067);
    };
    _0x5e70["AzfVPx"] = _0x1f84a3, _0x5e70["HKRVTU"] = {}, _0x5e70["nQUzsb"] = !![];
  }
  const _0x4a6191 = _0x5eb021[0], _0x1dade2 = _0x24c6a8 + _0x4a6191, _0xc34f21 = _0x5e70["HKRVTU"][_0x1dade2];
  return !_0xc34f21 ? (_0x5e7047 = _0x5e70["AzfVPx"](_0x5e7047), _0x5e70["HKRVTU"][_0x1dade2] = _0x5e7047) : _0x5e7047 = _0xc34f21, _0x5e7047;
}
function parseFilenameMetadata(_0x169c64) {
  const _0x458491 = { _0x5c8185: 506, _0x236d40: 540, _0x3c5c49: 578, _0x359e1c: 535, _0x4fec7c: 540, _0xce37e4: 497, _0x2931df: 543, _0x3e0742: 458, _0xc05a9c: 439, _0x2dfda1: 540, _0x18a7fb: 553, _0x4543be: 540, _0x467dba: 465, _0x506020: 484, _0x3860de: 459, _0x58c1ec: 540, _0x5d5a7a: 540, _0x4cd3f5: 450, _0x28a59b: 562, _0x2466bc: 432 }, _0x54f20c = _0x3cd342;
  if (!_0x169c64) return { "line3": "\u{1F39E}\uFE0F H.264 | \u{1F4FA} SDR | \u{1F3A7} Stereo", "source": _0x54f20c(468) };
  const _0x2fa54d = _0x169c64[_0x54f20c(_0x458491._0x5c8185)]();
  let _0xc8ef74 = "";
  if (_0x2fa54d["includes"](_0x54f20c(486)) || _0x2fa54d[_0x54f20c(_0x458491._0x236d40)](_0x54f20c(559)) || _0x2fa54d[_0x54f20c(540)](_0x54f20c(500)) || _0x2fa54d[_0x54f20c(540)]("X265")) _0xc8ef74 = _0x54f20c(_0x458491._0x3c5c49);
  else {
    if (_0x2fa54d[_0x54f20c(_0x458491._0x236d40)]("AVC") || _0x2fa54d["includes"]("H264") || _0x2fa54d["includes"]("H.264") || _0x2fa54d["includes"](_0x54f20c(551))) _0xc8ef74 = "\u{1F39E}\uFE0F H.264";
    else _0x2fa54d[_0x54f20c(_0x458491._0x236d40)]("AV1") && (_0xc8ef74 = _0x54f20c(_0x458491._0x359e1c));
  }
  let _0x3a214d = "";
  if (_0x2fa54d["includes"]("DV") || _0x2fa54d["includes"](_0x54f20c(552)) || _0x2fa54d[_0x54f20c(_0x458491._0x4fec7c)]("DOLBYVISION")) _0x3a214d = _0x54f20c(530);
  else {
    if (_0x2fa54d[_0x54f20c(_0x458491._0x236d40)](_0x54f20c(536))) _0x3a214d = _0x54f20c(479);
    else {
      if (_0x2fa54d[_0x54f20c(_0x458491._0x236d40)](_0x54f20c(560))) _0x3a214d = "\u2728 HDR10";
      else {
        if (_0x2fa54d["includes"](_0x54f20c(_0x458491._0xce37e4))) _0x3a214d = _0x54f20c(546);
        else _0x2fa54d["includes"](_0x54f20c(_0x458491._0x2931df)) && (_0x3a214d = _0x54f20c(571));
      }
    }
  }
  let _0x124e61 = "";
  if (_0x2fa54d["includes"]("ATMOS")) _0x124e61 = _0x54f20c(_0x458491._0x3e0742);
  else {
    if (_0x2fa54d[_0x54f20c(_0x458491._0x236d40)](_0x54f20c(_0x458491._0xc05a9c)) || _0x2fa54d[_0x54f20c(_0x458491._0x236d40)]("DD+5.1") || _0x2fa54d["includes"]("EAC3 5.1")) _0x124e61 = "\u{1F3A7} DDP 5.1";
    else {
      if (_0x2fa54d[_0x54f20c(_0x458491._0x2dfda1)](_0x54f20c(_0x458491._0x18a7fb)) || _0x2fa54d["includes"](_0x54f20c(544)) || _0x2fa54d[_0x54f20c(_0x458491._0x4fec7c)]("EAC3 7.1")) _0x124e61 = "\u{1F3A7} DDP 7.1";
      else {
        if (_0x2fa54d["includes"]("DD5.1") || _0x2fa54d["includes"](_0x54f20c(482)) || _0x2fa54d[_0x54f20c(540)]("5.1")) _0x124e61 = _0x54f20c(554);
        else {
          if (_0x2fa54d[_0x54f20c(_0x458491._0x236d40)]("AAC")) _0x124e61 = "\u{1F3A7} AAC";
          else _0x2fa54d[_0x54f20c(_0x458491._0x4543be)](_0x54f20c(_0x458491._0x467dba)) && (_0x124e61 = _0x54f20c(_0x458491._0x506020));
        }
      }
    }
  }
  const _0x36ab00 = [_0xc8ef74, _0x3a214d, _0x124e61]["filter"](Boolean), _0x6a1bec = _0x36ab00["length"] > 0 ? _0x36ab00[_0x54f20c(494)](" | ") : _0x54f20c(_0x458491._0x3860de);
  let _0x330116 = "\u{1F4E5} WEB-DL";
  if (_0x2fa54d["includes"]("BLURAY") || _0x2fa54d[_0x54f20c(540)]("BLU-RAY") || _0x2fa54d[_0x54f20c(_0x458491._0x58c1ec)]("BDREMUX")) _0x330116 = "\u{1F4BF} BluRay";
  else {
    if (_0x2fa54d[_0x54f20c(_0x458491._0x5d5a7a)](_0x54f20c(_0x458491._0x4cd3f5)) || _0x2fa54d[_0x54f20c(540)]("WEB-RIP")) _0x330116 = _0x54f20c(511);
    else {
      if (_0x2fa54d["includes"]("TELESYNC") || _0x2fa54d["includes"]("TS") || _0x2fa54d["includes"](_0x54f20c(446))) _0x330116 = "\u{1F4FA} TELESYNC";
      else {
        if (_0x2fa54d[_0x54f20c(540)](_0x54f20c(_0x458491._0x28a59b))) _0x330116 = _0x54f20c(525);
        else (_0x2fa54d[_0x54f20c(_0x458491._0x58c1ec)](_0x54f20c(_0x458491._0x2466bc)) || _0x2fa54d["includes"]("WEB-DL")) && (_0x330116 = _0x54f20c(468));
      }
    }
  }
  return { "line3": _0x6a1bec, "source": _0x330116 };
}
function parseSingleToken(_0x9c54e1) {
  const _0x263893 = { _0x516a1d: 464, _0x3b89d8: 476, _0x471d03: 523, _0x254e3e: 456, _0x1fe913: 474, _0x1ad0b2: 461, _0x1555d9: 524 }, _0x422d01 = _0x3cd342;
  if (!_0x9c54e1) return "";
  if (_0x9c54e1[_0x422d01(_0x263893._0x516a1d)]("eyJ")) {
    console["log"](_0x422d01(577));
    try {
      const _0xd3e108 = CryptoJS["enc"][_0x422d01(528)]["parse"](_0x9c54e1), _0x4e7e6c = _0xd3e108["toString"](CryptoJS[_0x422d01(550)][_0x422d01(456)]), _0x3928dd = JSON["parse"](_0x4e7e6c);
      if (_0x3928dd && _0x3928dd[_0x422d01(_0x263893._0x3b89d8)]) {
        const _0x541660 = "wEiphTn!", _0x1e7ff6 = _0x422d01(_0x263893._0x471d03), _0x1b80a3 = CryptoJS["enc"][_0x422d01(_0x263893._0x254e3e)][_0x422d01(529)](_0x1e7ff6), _0x5c6b74 = CryptoJS["enc"]["Utf8"]["parse"](_0x541660), _0x38f31a = CryptoJS[_0x422d01(498)][_0x422d01(436)](_0x3928dd[_0x422d01(476)], _0x1b80a3, { "iv": _0x5c6b74, "mode": CryptoJS["mode"]["CBC"], "padding": CryptoJS["pad"][_0x422d01(460)] }), _0x28a259 = _0x38f31a[_0x422d01(508)](CryptoJS["enc"][_0x422d01(456)]), _0x6ece35 = JSON[_0x422d01(529)](_0x28a259);
        if (_0x6ece35 && _0x6ece35["uid"]) return String(_0x6ece35[_0x422d01(_0x263893._0x1fe913)]);
      }
    } catch (_0x261626) {
      console[_0x422d01(_0x263893._0x1ad0b2)](_0x422d01(_0x263893._0x1555d9), _0x261626[_0x422d01(455)]);
    }
  }
  return _0x9c54e1;
}
function getAllUiTokens() {
  const _0x1a5ae7 = { _0x347621: 457, _0x7df1c8: 437 }, _0x19fae6 = _0x3cd342;
  try {
    let _0xac82dc = "";
    if (typeof global !== "undefined" && global["SCRAPER_SETTINGS"] && global["SCRAPER_SETTINGS"]["uiToken"]) _0xac82dc = String(global[_0x19fae6(437)][_0x19fae6(_0x1a5ae7._0x347621)])[_0x19fae6(422)]();
    else typeof window !== "undefined" && window[_0x19fae6(437)] && window[_0x19fae6(_0x1a5ae7._0x7df1c8)]["uiToken"] && (_0xac82dc = String(window["SCRAPER_SETTINGS"][_0x19fae6(457)])["trim"]());
    if (!_0xac82dc) return [];
    return _0xac82dc[_0x19fae6(533)](",")["map"]((_0x1ade7c) => _0x1ade7c[_0x19fae6(422)]())["filter"](Boolean);
  } catch (_0x45b1df) {
    return [];
  }
}
function getOssGroup() {
  const _0x6a560c = { _0x46e76f: 437 }, _0x5d7c83 = _0x3cd342;
  try {
    if (typeof global !== "undefined" && global["SCRAPER_SETTINGS"] && global[_0x5d7c83(_0x6a560c._0x46e76f)][_0x5d7c83(441)]) return String(global["SCRAPER_SETTINGS"][_0x5d7c83(441)]);
    if (typeof window !== "undefined" && window["SCRAPER_SETTINGS"] && window["SCRAPER_SETTINGS"]["ossGroup"]) return String(window[_0x5d7c83(437)]["ossGroup"]);
  } catch (_0x220982) {
  }
  return null;
}
function getApiBase() {
  const _0x11724d = { _0x29fa79: 437, _0x41ddb0: 567 }, _0x5741fd = _0x3cd342;
  try {
    if (typeof global !== _0x5741fd(587) && global["SCRAPER_SETTINGS"] && global["SCRAPER_SETTINGS"]["apiBase"]) return String(global[_0x5741fd(_0x11724d._0x29fa79)][_0x5741fd(567)]);
    if (typeof window !== "undefined" && window["SCRAPER_SETTINGS"] && window["SCRAPER_SETTINGS"][_0x5741fd(567)]) return String(window["SCRAPER_SETTINGS"][_0x5741fd(_0x11724d._0x41ddb0)]);
  } catch (_0x4cea13) {
  }
  return DEFAULT_API_BASE;
}
function getQualityFromName(_0x2d088c) {
  const _0x556b7c = { _0x4a2127: 506, _0x5192f2: 473, _0x5e5600: 565, _0x336458: 503, _0x35f7e1: 429, _0x136740: 513, _0x1de60c: 463, _0x4be47b: 492 }, _0x184f07 = _0x3cd342;
  if (!_0x2d088c) return "Unknown";
  const _0x7bee4 = _0x2d088c[_0x184f07(_0x556b7c._0x4a2127)]();
  if (_0x7bee4 === _0x184f07(_0x556b7c._0x5192f2) || _0x7bee4 === "ORIGINAL") return _0x184f07(556);
  if (_0x7bee4 === "4K" || _0x7bee4 === _0x184f07(_0x556b7c._0x5e5600)) return "4K";
  if (_0x7bee4 === "1440P" || _0x7bee4 === "2K") return _0x184f07(_0x556b7c._0x336458);
  if (_0x7bee4 === _0x184f07(_0x556b7c._0x35f7e1) || _0x7bee4 === _0x184f07(_0x556b7c._0x136740)) return _0x184f07(_0x556b7c._0x1de60c);
  if (_0x7bee4 === "720P" || _0x7bee4 === "HD") return "720p";
  if (_0x7bee4 === _0x184f07(521) || _0x7bee4 === "SD") return _0x184f07(475);
  if (_0x7bee4 === "360P") return _0x184f07(_0x556b7c._0x4be47b);
  if (_0x7bee4 === "240P") return "240p";
  const _0x342995 = _0x2d088c[_0x184f07(576)](/(\d{3,4})[pP]?/);
  if (_0x342995) {
    const _0x592d82 = parseInt(_0x342995[1]);
    if (_0x592d82 >= 2160) return "4K";
    if (_0x592d82 >= 1440) return "1440p";
    if (_0x592d82 >= 1080) return _0x184f07(_0x556b7c._0x1de60c);
    if (_0x592d82 >= 720) return _0x184f07(443);
    if (_0x592d82 >= 480) return _0x184f07(475);
    if (_0x592d82 >= 360) return _0x184f07(492);
    return "240p";
  }
  return "Unknown";
}
function formatFileSize(_0x4a4f7b) {
  const _0x4bf322 = _0x3cd342;
  if (!_0x4a4f7b) return "Unknown Size";
  if (typeof _0x4a4f7b === _0x4bf322(471) && (_0x4a4f7b["includes"]("GB") || _0x4a4f7b["includes"]("MB") || _0x4a4f7b[_0x4bf322(540)]("KB"))) return _0x4a4f7b;
  if (typeof _0x4a4f7b === _0x4bf322(581)) {
    const _0x25425b = _0x4a4f7b / (1024 * 1024 * 1024);
    if (_0x25425b >= 1) return _0x25425b["toFixed"](2) + _0x4bf322(440);
    const _0x429eca = _0x4a4f7b / (1024 * 1024);
    return _0x429eca[_0x4bf322(572)](2) + " MB";
  }
  return _0x4a4f7b;
}
function getTMDBDetails(_0x438cbb, _0x4b3182) {
  const _0x73df2a = { _0x8c3f0a: 522, _0x5b7b89: 428, _0x6c8980: 452, _0x366794: 455 };
  return __async(this, null, function* () {
    const _0x56988e = _0x5e70, _0x49c0f8 = _0x4b3182 === "tv" ? "tv" : "movie", _0x1f8121 = TMDB_BASE_URL + "/" + _0x49c0f8 + "/" + _0x438cbb + "?api_key=" + TMDB_API_KEY;
    try {
      const _0x19c466 = yield fetch(_0x1f8121);
      if (!_0x19c466["ok"]) throw new Error(_0x56988e(527) + _0x19c466[_0x56988e(_0x73df2a._0x8c3f0a)]);
      const _0x4cf314 = yield _0x19c466["json"](), _0x5ba675 = _0x4b3182 === "tv" ? _0x4cf314[_0x56988e(_0x73df2a._0x5b7b89)] : _0x4cf314[_0x56988e(_0x73df2a._0x6c8980)], _0x46efd9 = _0x4b3182 === "tv" ? _0x4cf314["first_air_date"] : _0x4cf314[_0x56988e(510)], _0xf5bf18 = _0x46efd9 ? parseInt(_0x46efd9[_0x56988e(533)]("-")[0]) : null;
      return { "title": _0x5ba675, "year": _0xf5bf18 };
    } catch (_0x3cb522) {
      return console["log"]("[ShowBox] TMDB details query failed: " + _0x3cb522[_0x56988e(_0x73df2a._0x366794)]), { "title": "TMDB ID " + _0x438cbb, "year": null };
    }
  });
}
function extractFebBoxShare(_0x521d70, _0x393e98, _0x56a732, _0x4411af, _0x4a1c83, _0x317524, _0x4e45a6) {
  const _0x405180 = { _0x2d87e4: 438, _0xce3dcd: 472, _0x5c6614: 558, _0x400ec7: 564, _0xc666e9: 582, _0x3dd312: 573, _0x2098e2: 449, _0x15711a: 547, _0x3f5810: 472, _0x4f13ac: 472, _0x5221a0: 485, _0x115b4b: 586, _0x236022: 464, _0x144393: 519, _0x24ddbb: 568, _0x318373: 512, _0x2d5c05: 421 };
  return __async(this, null, function* () {
    const _0x270de1 = { _0x6c0e8c: 431, _0x4c2311: 509, _0x17b548: 548, _0x5df043: 569, _0x111750: 504, _0x4d5fad: 579, _0x98f4e5: 515, _0x25787e: 454 }, _0x47e7f2 = _0x5e70, _0x2823e2 = [];
    try {
      const _0x214951 = _0x393e98 === "tv" ? 2 : 1, _0x18780d = _0x47e7f2(469) + _0x214951 + _0x47e7f2(_0x405180._0x2d87e4) + _0x521d70 + "&json=1", _0x5f0859 = yield fetch(_0x18780d)[_0x47e7f2(564)]((_0x5679e8) => _0x5679e8[_0x47e7f2(490)]());
      if (!_0x5f0859 || _0x5f0859[_0x47e7f2(582)] !== 1 || !_0x5f0859[_0x47e7f2(_0x405180._0xce3dcd)]) return [];
      const _0x16f024 = _0x5f0859["data"][_0x47e7f2(467)] || _0x5f0859[_0x47e7f2(_0x405180._0xce3dcd)][_0x47e7f2(_0x405180._0x5c6614)];
      if (!_0x16f024) return [];
      const _0x3d60d7 = _0x16f024[_0x47e7f2(533)]("/")[_0x47e7f2(570)](), _0x110653 = "https://www.febbox.com/file/file_share_list?share_key=" + _0x3d60d7, _0xbe1eb1 = yield fetch(_0x110653, { "headers": { "Accept-Language": "en" } })[_0x47e7f2(_0x405180._0x400ec7)]((_0x37fb83) => _0x37fb83[_0x47e7f2(490)]());
      if (!_0xbe1eb1 || _0xbe1eb1[_0x47e7f2(_0x405180._0xc666e9)] !== 1 || !_0xbe1eb1["data"] || !_0xbe1eb1[_0x47e7f2(_0x405180._0xce3dcd)][_0x47e7f2(449)]) return [];
      let _0x25468f = [];
      if (_0x393e98 === _0x47e7f2(_0x405180._0x3dd312)) _0x25468f = _0xbe1eb1["data"][_0x47e7f2(_0x405180._0x2098e2)];
      else {
        const _0x51aab6 = _0x47e7f2(_0x405180._0x15711a) + _0x56a732, _0x5d66a0 = _0xbe1eb1[_0x47e7f2(_0x405180._0x3f5810)][_0x47e7f2(449)][_0x47e7f2(431)]((_0x1b3fa1) => _0x1b3fa1[_0x47e7f2(444)] && _0x1b3fa1[_0x47e7f2(444)][_0x47e7f2(424)]() === _0x51aab6);
        if (!_0x5d66a0) return [];
        const _0x1964de = "https://www.febbox.com/file/file_share_list?share_key=" + _0x3d60d7 + _0x47e7f2(445) + _0x5d66a0[_0x47e7f2(434)] + "&page=1", _0x2209f6 = yield fetch(_0x1964de, { "headers": { "Accept-Language": "en" } })["then"]((_0x131ab6) => _0x131ab6["json"]());
        if (!_0x2209f6 || _0x2209f6["code"] !== 1 || !_0x2209f6["data"] || !_0x2209f6[_0x47e7f2(472)]["file_list"]) return [];
        const _0x17fbb4 = String(_0x56a732)[_0x47e7f2(454)](2, "0"), _0x24a838 = String(_0x4411af)["padStart"](2, "0");
        _0x25468f = _0x2209f6[_0x47e7f2(_0x405180._0x4f13ac)]["file_list"][_0x47e7f2(_0x405180._0x5221a0)]((_0x37db69) => _0x37db69["file_name"] && (_0x37db69[_0x47e7f2(444)]["toLowerCase"]()["includes"]("s" + _0x17fbb4 + "e" + _0x24a838) || _0x37db69["file_name"][_0x47e7f2(424)]()[_0x47e7f2(540)]("s" + _0x56a732 + "e" + _0x4411af)));
      }
      const _0x71004e = { "Accept": _0x47e7f2(488), "Accept-Language": "en-US,en;q=0.8", "Connection": "keep-alive", "Range": "bytes=0-", "Referer": _0x47e7f2(_0x405180._0x115b4b), "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" }, _0x57ee1a = _0x4a1c83[_0x47e7f2(_0x405180._0x236022)](_0x47e7f2(_0x405180._0x144393)) ? _0x4a1c83 : _0x47e7f2(_0x405180._0x144393) + _0x4a1c83;
      for (const _0x29259e of _0x25468f) {
        const _0xef87aa = "https://www.febbox.com/console/video_quality_list?fid=" + _0x29259e[_0x47e7f2(434)] + "&share_key=" + _0x3d60d7, _0x5a5936 = yield fetch(_0xef87aa, { "headers": { "Cookie": _0x57ee1a } })["then"]((_0x380830) => _0x380830[_0x47e7f2(490)]())["catch"](() => null);
        if (!_0x5a5936 || !_0x5a5936[_0x47e7f2(_0x405180._0x24ddbb)]) continue;
        const _0x836de1 = cheerio["load"](_0x5a5936["html"]);
        _0x836de1(_0x47e7f2(_0x405180._0x318373))[_0x47e7f2(_0x405180._0x2d5c05)]((_0x233c3e, _0x4f2e55) => {
          const _0x592cb0 = _0x47e7f2, _0x5e71ad = _0x836de1(_0x4f2e55), _0x548b96 = _0x5e71ad["attr"]("data-url"), _0x187d55 = _0x5e71ad[_0x592cb0(489)]("data-quality"), _0x164e25 = _0x5e71ad[_0x592cb0(_0x270de1._0x6c0e8c)](_0x592cb0(_0x270de1._0x4c2311))[_0x592cb0(491)]()["trim"]();
          if (_0x548b96) {
            const _0x371112 = getQualityFromName(_0x187d55), _0x1882b6 = getSubheadingQualityLabel(_0x371112, _0x29259e["file_name"] || _0x548b96), _0x3ca865 = formatFileSize(_0x164e25 || _0x29259e[_0x592cb0(_0x270de1._0x17b548)]), _0x1b6e60 = getFileContainerFormat(_0x29259e[_0x592cb0(444)] || _0x548b96), _0x219d04 = parseFilenameMetadata(_0x29259e["file_name"] || _0x548b96), _0x10f83d = _0x592cb0(_0x270de1._0x5df043) + _0x371112 + " | Cookie " + _0x317524, _0x99e4e = _0x393e98 === "tv" ? _0x592cb0(_0x270de1._0x111750) + (_0x4e45a6["title"] || "Unknown") + _0x592cb0(_0x270de1._0x4d5fad) + (_0x4e45a6[_0x592cb0(_0x270de1._0x98f4e5)] || "") + ") | S" + String(_0x56a732)["padStart"](2, "0") + " E" + String(_0x4411af)[_0x592cb0(_0x270de1._0x25787e)](2, "0") : "\u{1F37F} " + (_0x4e45a6["title"] || "Unknown") + " - (" + (_0x4e45a6["year"] || "") + ")", _0x38737d = _0x1882b6 + " | \u{1F4BE} " + _0x3ca865 + " | " + _0x1b6e60, _0x46a170 = _0x219d04["line3"], _0x1e40d5 = _0x219d04[_0x592cb0(481)] + _0x592cb0(495) + _0x317524, _0x1cd513 = _0x99e4e + "\n" + _0x38737d + "\n" + _0x46a170 + "\n" + _0x1e40d5;
            _0x2823e2["push"]({ "name": _0x10f83d, "title": _0x1cd513, "size": _0x1cd513, "description": _0x1cd513, "url": _0x548b96, "quality": "", "language": "", "headers": _0x71004e });
          }
        });
      }
    } catch (_0x5a5b82) {
      console["error"]("[ShowBox] FebBox share extraction error: " + _0x5a5b82[_0x47e7f2(455)]);
    }
    return _0x2823e2;
  });
}
function processShowBoxResponse(_0x4420f9, _0x59b34e, _0xe8c7ce, _0x439155, _0x26d574, _0xd2aed0) {
  const _0x4b44ca = { _0x516296: 518, _0x15f67f: 427 }, _0x376ef4 = { _0x56df7f: 532, _0x5604c1: 487 }, _0x5b7332 = _0x3cd342, _0x5f00bc = [];
  try {
    if (!_0x4420f9 || !_0x4420f9["success"] || !_0x4420f9["versions"] || !Array["isArray"](_0x4420f9[_0x5b7332(518)])) return _0x5f00bc;
    _0x4420f9[_0x5b7332(_0x4b44ca._0x516296)][_0x5b7332(_0x4b44ca._0x15f67f)](function(_0x1721b3, _0x3979ff) {
      const _0x1d531b = { _0x56703e: 539, _0x497054: 515, _0x49d093: 514, _0xd41144: 454, _0x56bf18: 563, _0x46d153: 452, _0x3219b2: 493, _0x37e3cb: 442 }, _0x19ca08 = _0x5b7332, _0x5cb4d0 = _0x1721b3["size"] || "Unknown";
      _0x1721b3[_0x19ca08(487)] && Array[_0x19ca08(_0x376ef4._0x56df7f)](_0x1721b3["links"]) && _0x1721b3[_0x19ca08(_0x376ef4._0x5604c1)]["forEach"](function(_0x3088fc) {
        const _0x3f355e = _0x19ca08;
        if (!_0x3088fc["url"]) return;
        const _0x515fce = getQualityFromName(_0x3088fc["quality"] || "Unknown"), _0x5d3476 = getSubheadingQualityLabel(_0x515fce, _0x3088fc[_0x3f355e(_0x1d531b._0x56703e)]), _0x469b0d = _0x3088fc["size"] || _0x5cb4d0, _0x599972 = formatFileSize(_0x469b0d), _0x4690d3 = getFileContainerFormat(_0x3088fc["url"]), _0x4f5954 = parseFilenameMetadata(_0x3088fc[_0x3f355e(539)]);
        let _0x3796e4 = "ShowBox";
        _0x4420f9["versions"]["length"] > 1 && (_0x3796e4 += " V" + (_0x3979ff + 1));
        const _0x39bf52 = _0x3796e4 + " | " + _0x515fce + _0x3f355e(545) + _0xd2aed0, _0x2234b6 = _0xe8c7ce === "tv" ? _0x3f355e(504) + (_0x59b34e["title"] || _0x3f355e(493)) + " - (" + (_0x59b34e[_0x3f355e(_0x1d531b._0x497054)] || "") + _0x3f355e(_0x1d531b._0x49d093) + String(_0x439155)[_0x3f355e(_0x1d531b._0xd41144)](2, "0") + " E" + String(_0x26d574)["padStart"](2, "0") : _0x3f355e(_0x1d531b._0x56bf18) + (_0x59b34e[_0x3f355e(_0x1d531b._0x46d153)] || _0x3f355e(_0x1d531b._0x3219b2)) + _0x3f355e(579) + (_0x59b34e["year"] || "") + ")", _0x37d967 = _0x5d3476 + _0x3f355e(_0x1d531b._0x37e3cb) + _0x599972 + " | " + _0x4690d3, _0x42a0f8 = _0x4f5954["line3"], _0x7f1f13 = _0x4f5954["source"] + " | \u{1F36A} Cookie #" + _0xd2aed0, _0xdd5659 = _0x2234b6 + "\n" + _0x37d967 + "\n" + _0x42a0f8 + "\n" + _0x7f1f13;
        _0x5f00bc["push"]({ "name": _0x39bf52, "title": _0xdd5659, "size": _0xdd5659, "description": _0xdd5659, "url": _0x3088fc["url"], "quality": "", "language": "" });
      });
    });
  } catch (_0x3ef880) {
    console["error"]("[ShowBox] Error processing response: " + _0x3ef880["message"]);
  }
  return _0x5f00bc;
}
function getStreams(_0x1496c7, _0x576afa = "movie", _0x428500 = null, _0x45539c = null) {
  const _0x467f4a = { _0x49ea7: 435, _0x3dde3d: 520, _0x4d3dc7: 517, _0x12129f: 462, _0x429b8d: 534, _0x523edf: 472, _0xbb11a4: 420 };
  return __async(this, null, function* () {
    const _0x398ee8 = _0x5e70;
    console[_0x398ee8(505)]("[ShowBox] Fetching streams for TMDB ID: " + _0x1496c7 + ", Type: " + _0x576afa);
    const _0x55405b = getAllUiTokens(), _0x548dc0 = getOssGroup(), _0x1d9c35 = getApiBase();
    if (_0x55405b[_0x398ee8(557)] === 0) return console["error"](_0x398ee8(_0x467f4a._0x49ea7)), [];
    let _0x5c5332 = [];
    try {
      const _0x3c2f38 = yield getTMDBDetails(_0x1496c7, _0x576afa);
      for (let _0x391943 = 0; _0x391943 < _0x55405b[_0x398ee8(557)]; _0x391943++) {
        const _0x50dc2d = _0x391943 + 1, _0x32145f = _0x55405b[_0x391943], _0x3b35df = parseSingleToken(_0x32145f);
        if (!_0x3b35df) continue;
        console["log"](_0x398ee8(_0x467f4a._0x3dde3d) + _0x50dc2d + _0x398ee8(_0x467f4a._0x4d3dc7));
        let _0x5ef24b = [], _0x3acb31;
        _0x576afa === "tv" && _0x428500 && _0x45539c ? _0x548dc0 ? _0x3acb31 = _0x1d9c35 + "/tv/" + _0x1496c7 + _0x398ee8(499) + _0x548dc0 + "/" + _0x428500 + "/" + _0x45539c + _0x398ee8(_0x467f4a._0x12129f) + encodeURIComponent(_0x3b35df) : _0x3acb31 = _0x1d9c35 + _0x398ee8(_0x467f4a._0x429b8d) + _0x1496c7 + "/" + _0x428500 + "/" + _0x45539c + "?cookie=" + encodeURIComponent(_0x3b35df) : _0x3acb31 = _0x1d9c35 + "/movie/" + _0x1496c7 + _0x398ee8(462) + encodeURIComponent(_0x3b35df);
        let _0x1dc6fc = null;
        try {
          const _0x5284e6 = yield fetch(_0x3acb31, { "headers": WORKING_HEADERS });
          if (_0x5284e6["ok"]) {
            const _0x2ba20d = yield _0x5284e6[_0x398ee8(490)]();
            _0x5ef24b = processShowBoxResponse(_0x2ba20d, _0x3c2f38, _0x576afa, _0x428500, _0x45539c, _0x50dc2d);
            if (_0x2ba20d["id"] || _0x2ba20d["mid"]) _0x1dc6fc = _0x2ba20d["id"] || _0x2ba20d["mid"];
            else _0x2ba20d[_0x398ee8(_0x467f4a._0x523edf)] && (_0x2ba20d[_0x398ee8(_0x467f4a._0x523edf)]["id"] || _0x2ba20d["data"][_0x398ee8(_0x467f4a._0xbb11a4)]) && (_0x1dc6fc = _0x2ba20d["data"]["id"] || _0x2ba20d["data"]["mid"]);
          }
        } catch (_0x371d99) {
          console["log"]("[ShowBox] Proxy server lookup failed for Cookie " + _0x50dc2d + ": " + _0x371d99["message"]);
        }
        if (_0x1dc6fc) {
          const _0x5e33cf = yield extractFebBoxShare(_0x1dc6fc, _0x576afa, _0x428500, _0x45539c, _0x3b35df, _0x50dc2d, _0x3c2f38);
          _0x5e33cf["length"] > 0 && (_0x5ef24b = _0x5ef24b["concat"](_0x5e33cf));
        }
        console["log"]("[ShowBox] Found " + _0x5ef24b[_0x398ee8(557)] + " links for Cookie " + _0x50dc2d), _0x5c5332 = _0x5c5332["concat"](_0x5ef24b);
      }
      return _0x5c5332;
    } catch (_0x13bb69) {
      return console["error"](_0x398ee8(537) + _0x13bb69["message"]), [];
    }
  });
}
function onSettings() {
  const _0x59f3a3 = { _0x48cfd8: 574, _0x42505f: 531 };
  return __async(this, null, function* () {
    const _0x273770 = _0x5e70;
    return [{ "type": _0x273770(_0x59f3a3._0x48cfd8), "label": _0x273770(_0x59f3a3._0x42505f) }, { "type": _0x273770(491), "isPassword": !![], "key": _0x273770(457), "label": _0x273770(433), "placeholder": _0x273770(516), "description": "Add multiple tokens separated by commas. Links will display grouped by cookie indicator." }, { "type": _0x273770(491), "key": "ossGroup", "label": _0x273770(561), "placeholder": "", "description": _0x273770(541) }];
  });
}
module[_0x3cd342(584)] = { "getStreams": getStreams, "onSettings": onSettings };
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
    return tarjeta({ fuente: "ShowBox", servidor: ((n) => /^showbox$/i.test(n) ? "" : (n.match(/\[([^\]]+)\]/) || [])[1] || "")(nombre), calidad: calidadDe(s.quality || nombre), tamano: tamanoDe(String(s.size || "") + " " + String(s.title || "")), audio, url: s.url, headers, subtitles: s.subtitles, titulo: String(s.title || "").split("\n")[0] });
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
