// PRUEBA MINIMA -- sin scraping, sin requires, sin nada. Si esto
// tampoco muestra nada al presionar "Test Provider", confirma que el
// problema NO es el codigo de doramasflix -- es algo de como Nuvio
// trata a este provider puntual (su id, su nombre de archivo, algo
// del manifest, o algo del lado de la app).
function getStreams(tmdbId, mediaType, season, episode) {
  console.log('[Doramasflix PRUEBA] getStreams llamado con:', tmdbId, mediaType, season, episode);
  return Promise.resolve([{
    name: '[PRUEBA] Si ves esto, el problema es el codigo real',
    title: 'prueba',
    url: 'https://example.com/no-es-un-video-real.mp4',
  }]);
}

module.exports = { getStreams: getStreams };
