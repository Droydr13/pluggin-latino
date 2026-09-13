// providers/documaniatv.js
// Portado de DocumaniaTVProvider.kt. Video hosteado directo en el sitio,
// no usa embeds de terceros.

var DOCUMANIATV_BASE = 'https://www.documaniatv.com';
var DOCUMANIATV_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function dtGet(url, opts) {
  var axios3 = require('axios');
  return axios3.get(url, Object.assign({ headers: { 'User-Agent': DOCUMANIATV_UA } }, opts || {}));
}
function dtGetDoc(url, opts) {
  var cheerio3 = require('cheerio-without-node-native');
  return dtGet(url, opts).then(function (r) { return cheerio3.load(r.data); });
}
function normalizarDT(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function getStreams(tmdbId, mediaType, season, episode, title) {
  if (!title) return Promise.resolve([]);
  var axios3 = require('axios');
  var tituloNorm = normalizarDT(title);

  return axios3.post(
    DOCUMANIATV_BASE + '/ajax_search.php',
    'queryString=' + encodeURIComponent(title),
    { headers: { 'User-Agent': DOCUMANIATV_UA, 'X-Requested-With': 'XMLHttpRequest', 'Content-Type': 'application/x-www-form-urlencoded' } }
  ).then(function (res) {
    var cheerio3 = require('cheerio-without-node-native');
    var $ = cheerio3.load(res.data);
    var targetHref = null;
    $('li').each(function () {
      if (targetHref) return;
      var a = $(this).find('a').first();
      var href = a.attr('href');
      if (!href || href.indexOf('video_') === -1) return;
      var t = a.text().trim();
      if (!targetHref || normalizarDT(t) === tituloNorm) {
        targetHref = href.startsWith('http') ? href : DOCUMANIATV_BASE + href;
      }
    });
    return targetHref;
  }).then(function (videoUrl) {
    if (!videoUrl) return [];
    return dtGet(videoUrl).then(function (res) {
      var html = res.data;
      var scriptMatch = html.match(/<script[^>]*>([^<]*pm_video_data[^<]*)<\/script>/);
      if (!scriptMatch) return [];
      var videoIdMatch = scriptMatch[1].match(/uniq_id:\s*"([^"]+)"/);
      if (!videoIdMatch) return [];
      var videoId = videoIdMatch[1];

      return dtGet(DOCUMANIATV_BASE + '/embed/' + videoId).then(function (embedRes) {
        var setCookie = embedRes.headers['set-cookie'] || [];
        var cookies = setCookie.map(function (c) { return c.split(';')[0]; }).join('; ');

        return dtGet(DOCUMANIATV_BASE + '/json/' + videoId, {
          headers: {
            'Referer': DOCUMANIATV_BASE + '/embed/' + videoId,
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': DOCUMANIATV_UA,
            'Cookie': cookies,
          },
        }).then(function (jsonRes) {
          var texto = typeof jsonRes.data === 'string' ? jsonRes.data : JSON.stringify(jsonRes.data);
          var videoUrlMatch = texto.match(/"src"\s*:\s*"([^"]+)"/) || texto.match(/file:\s*"([^"]+)"/) || texto.match(/https?:\/\/[^\s"']+\.mp4[^\s"']*/);
          var finalUrl = videoUrlMatch ? (videoUrlMatch[1] || videoUrlMatch[0]) : null;

          function conResultado(finalUrl2) {
            if (!finalUrl2) return [];
            finalUrl2 = finalUrl2.replace(/\\\//g, '/');
            return [{
              name: 'DocumaniaTV',
              title: '720p \xB7 Directo',
              url: finalUrl2,
              quality: '720p',
              headers: { 'User-Agent': DOCUMANIATV_UA, Referer: DOCUMANIATV_BASE + '/' },
            }];
          }

          if (finalUrl) return conResultado(finalUrl);

          // respaldo: el reproductor propio en formato .js
          return dtGet(DOCUMANIATV_BASE + '/docuplayer/v1/' + videoId + '.js', {
            headers: { 'Referer': DOCUMANIATV_BASE + '/embed/' + videoId, 'User-Agent': DOCUMANIATV_UA, 'Cookie': cookies },
          }).then(function (jsRes) {
            var texto2 = jsRes.data;
            var m = texto2.match(/"src"\s*:\s*"([^"]+)"/) || texto2.match(/file:\s*"([^"]+)"/) || texto2.match(/https?:\/\/[^\s"']+\.mp4[^\s"']*/);
            return conResultado(m ? (m[1] || m[0]) : null);
          }).catch(function () { return []; });
        });
      });
    });
  }).catch(function (e) {
    console.log('[DocumaniaTV] Error: ' + e.message);
    return [];
  });
}

module.exports = { getStreams: getStreams };
