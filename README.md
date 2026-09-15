# Addon Latam plugin 
Contenido en Español/Latino: peliculas, series, anime y donghuas de distintos sitio.

## Instalar en Nuvio

Settings → Plugins → agregar esta URL:

```
https://raw.githubusercontent.com/Droydr13/pluggin-latino/main
```

## Providers incluidos

| Provider | Tipos | Autor |
|---|---|---|
| LaMovie | movie, tv | AdrianJael |
| Embed69 | movie, tv | KennethJYS |
| CineCalidad | movie | KennethJYS |
| PelisSeriesHoy | movie, tv | KennethJYS |
| SeriesMetro | movie, tv | KennethJYS |
| HackStore | movie, tv | KennethJYS |
| LACartoons | tv | Doyrd |
| BrazucaPlay | movie, tv | Doyrd |
| CinemaCity | movie, tv | Doyrd |
| Cuevana (unbuendato) | movie, tv | Doyrd |
| FuegoCine | movie, tv | Doyrd |
| HackStore (v2) | movie, tv | Doyrd |
| PelisGo | movie, tv | Doyrd |
| PelisPanda | movie, tv | Doyrd |
| PelisPedia | movie, tv | Doyrd |
| PelisPlus | movie, tv | Doyrd |
| PlayHubMax | movie, tv | Doyrd |
| SoloLatino | movie, tv | Doyrd |
| TioPlus | movie, tv | Doyrd |
| VidEasy | movie, tv | Doyrd |
| XuPalace | movie, tv | Doyrd |
| AllCalidad | movie, tv | Doyrd |
| AnimeAV1 | tv | Doyrd |
| AnimeJL | tv | Doyrd |
| AnimeFLV | tv | Doyrd |
| Area Documental | movie, tv | Doyrd |
| Doramasflix | movie, tv | Doyrd |
| DocumaniaTV | movie, tv | Doyrd |
| DoramasYT | tv | Doyrd |
| LatAnime | tv | Doyrd |
| EntrePeliculasYSeries | movie, tv | Doyrd |
| HDFull | movie, tv | Doyrd |
| JKAnime | tv | Doyrd |
| Monoschinos | tv | Doyrd |
| TioAnime | tv | Doyrd |
| ReyDonghua | tv | Doyrd |
| MundoDonghua | tv | Doyrd |
| PeliculasFlix | movie | Doyrd |
| RCN | movie, tv | Doyrd (+ ayuda de un colaborador)|

Los primeros 6 (LaMovie, Embed69, CineCalidad, PelisSeriesHoy,
SeriesMetro, HackStore) vienen tal cual de sus repos originales de
Nuvio, están confirmados funcionando y no hace falta
modificarlos. Todo lo demás lo armamos, mejoramos o portamos nosotros.

## Avisos conocidos

- **JKAnime** y **MundoDonghua**: cubren el camino principal de
  extracción de cada sitio, no las cadenas de respaldo más largas y
  complejas que tienen (GSPlay/Nozomi en uno, "protea_tab" en el otro).
- **EntrePeliculasYSeries**: si el sitio en vez de mostrar la clave de
  descifrado directo tira un desafío de "proof-of-work", esta versión
  no lo resuelve (devuelve vacío en ese caso puntual).
- **LACartoons**: usa una tabla fija de ~510 series mapeadas a TMDB
  como método principal (más rápido y preciso), con una búsqueda en
  vivo por título como respaldo para lo que no esté en esa tabla.
