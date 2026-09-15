# Addon Latam plugin 
Contenido en Español/Latino: peliculas, series, anime y donghuas de distintos sitio.

## Instalar en Nuvio

Settings → Plugins → agregar esta URL:

```
https://raw.githubusercontent.com/Droydr13/pluggin-latino/main
```

## Providers incluidos

| Provider | Tipos | 
|---|---|
| LaMovie | movie, tv |
| Embed69 | movie, tv |
| CineCalidad | movie | 
| PelisSeriesHoy | movie, tv | 
| SeriesMetro | movie, tv | 
| HackStore | movie, tv |
| LACartoons | tv | 
| BrazucaPlay | movie, tv | 
| CinemaCity | movie, tv | 
| Cuevana (unbuendato) | movie, tv | 
| HackStore (v2) | movie, tv | 
| PelisGo | movie, tv | 
| PelisPanda | movie, tv | 
| PelisPedia | movie, tv | 
| PelisPlus | movie, tv | 
| PlayHubMax | movie, tv | 
| SoloLatino | movie, tv | 
| TioPlus | movie, tv | 
| VidEasy | movie, tv | 
| XuPalace | movie, tv | 
| AllCalidad | movie, tv | 
| AnimeAV1 | tv | 
| AnimeJL | tv | 
| AnimeFLV | tv | 
| Area Documental | movie, tv | 
| Doramasflix | movie, tv | 
| DocumaniaTV | movie, tv | 
| DoramasYT | tv | 
| LatAnime | tv | 
| EntrePeliculasYSeries | movie, tv | 
| HDFull | movie, tv | 
| JKAnime | tv | 
| Monoschinos | tv | 
| TioAnime | tv | 
| ReyDonghua | tv | 
| MundoDonghua | tv | 
| PeliculasFlix | movie | 
| RCN | movie, tv | 

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
