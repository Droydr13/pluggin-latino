const DOCUMANIATV_BASE = 'https://www.documaniatv.com';
const DOCUMANIATV_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const TMDB_API_KEY_DT = '439c478a771f35c05022f9feabcca01c';

function timeoutSignal(ms) {
  try {
    if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') return AbortSignal.timeout(ms);
  } catch (e) {}
  return undefined;
}

async function fetchDT(url, opts) {
  const o = Object.assign({ headers: { 'User-Agent': DOCUMANIATV_UA } }, opts, { signal: timeoutSignal(15000) });
  return fetch(url, o);
}

function normalizarDT(s) {
  return (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

async function getTmdbTitleDT(tmdbId, mediaType) {
  const type = mediaType === 'movie' ? 'movie' : 'tv';
  const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_API_KEY_DT}&language=es-MX`;
  try {
    const res = await fetch(url, { signal: timeoutSignal(10000) });
    const data = await res.json();
    return type === 'movie' ? (data.title || data.original_title) : (data.name || data.original_name);
  } catch (e) {
    return null;
  }
}

function extraerUrlVideo(texto) {
  const m = texto.match(/"src"\s*:\s*"([^"]+)"/) || texto.match(/file:\s*"([^"]+)"/) || texto.match(/https?:\/\/[^\s"']+\.mp4[^\s"']*/);
  return m ? m[1] || m[0] : null;
}

function extraerResultadosDT(html) {
  const resultados = [];
  const regex = /<li[^>]*>[\s\S]{0,50}?<a\s+[^>]*href="([^"]*video_[^"]*)"[^>]*>([^<]*)</gi;
  let m;
  while ((m = regex.exec(html)) !== null) {
    resultados.push({ href: m[1], title: m[2].trim() });
  }
  return resultados;
}

async function getStreams(tmdbId, mediaType, season, episode) {
  try {
    const title = await getTmdbTitleDT(tmdbId, mediaType);
    if (!title) return [];
    const tituloNorm = normalizarDT(title);

    const searchRes = await fetchDT(`${DOCUMANIATV_BASE}/ajax_search.php`, {
      method: 'POST',
      headers: { 'User-Agent': DOCUMANIATV_UA, 'X-Requested-With': 'XMLHttpRequest', 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'queryString=' + encodeURIComponent(title),
    });
    const searchHtml = await searchRes.text();
    const resultados = extraerResultadosDT(searchHtml);
    if (!resultados.length) return [];
    const match = resultados.find((r) => normalizarDT(r.title) === tituloNorm) || resultados[0];
    const targetHref = match.href.startsWith('http') ? match.href : (DOCUMANIATV_BASE + match.href);

    const pageRes = await fetchDT(targetHref);
    const html = await pageRes.text();
    const scriptMatch = html.match(/<script[^>]*>([^<]*pm_video_data[^<]*)<\/script>/);
    if (!scriptMatch) return [];
    const videoIdMatch = scriptMatch[1].match(/uniq_id:\s*"([^"]+)"/);
    if (!videoIdMatch) return [];
    const videoId = videoIdMatch[1];

    const embedRes = await fetchDT(DOCUMANIATV_BASE + '/embed/' + videoId);
    await embedRes.text();
    let cookies = '';
    try {
      if (typeof embedRes.headers.getSetCookie === 'function') {
        cookies = (embedRes.headers.getSetCookie() || []).map((c) => c.split(';')[0]).join('; ');
      } else {
        const raw = embedRes.headers.get('set-cookie');
        if (raw) cookies = raw.split(';')[0];
      }
    } catch (e) {}

    const jsonRes = await fetchDT(DOCUMANIATV_BASE + '/json/' + videoId, {
      headers: {
        Referer: DOCUMANIATV_BASE + '/embed/' + videoId,
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': DOCUMANIATV_UA,
        Cookie: cookies,
      },
    });
    const texto = await jsonRes.text();
    let finalUrl = extraerUrlVideo(texto);

    if (!finalUrl) {
      try {
        const jsRes = await fetchDT(DOCUMANIATV_BASE + '/docuplayer/v1/' + videoId + '.js', {
          headers: { Referer: DOCUMANIATV_BASE + '/embed/' + videoId, 'User-Agent': DOCUMANIATV_UA, Cookie: cookies },
        });
        finalUrl = extraerUrlVideo(await jsRes.text());
      } catch (e) {
        finalUrl = null;
      }
    }
    if (!finalUrl) return [];
    finalUrl = finalUrl.replace(/\\\//g, '/');

    return [{
      name: 'DocumaniaTV',
      title: '720p \u00b7 Directo',
      url: finalUrl,
      quality: '720p',
      headers: { 'User-Agent': DOCUMANIATV_UA, Referer: DOCUMANIATV_BASE + '/' },
    }];
  } catch (e) {
    console.log('[DocumaniaTV] Error: ' + e.message);
    return [];
  }
}

module.exports = { getStreams };
