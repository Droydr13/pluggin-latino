# Addon Latam Providers fork

## Instalar en Nuvio

Settings → Plugins → agregar esta URL 

```
https://raw.githubusercontent.com/droydr13/pluggin-latino/main
```

## Providers incluidos

| Provider | Tipos | De dónde salió |
|---|---|---|
| LaMovie | movie, tv | fork "Nuvio Latino" (pluggin-latino) |
| Embed69 | movie, tv | versión de "Nuvio Latino" (pluggin-latino) — tiene carrera entre varios espejos de StreamWish/VidHide, más resistente que las otras dos versiones que había repetidas |
| CineCalidad | movie | fork "Latino Providers" (Nuvio-Latino) |
| PelisSeriesHoy | movie, tv | fork "Latino Providers" (Nuvio-Latino) |
| SeriesMetro | movie, tv | fork "Latino Providers" (Nuvio-Latino) |
| HackStore | movie, tv | fork "Latino Providers" (Nuvio-Latino) |
| LACartoons | tv | armado a mano para Addon Latam, portado del addon de Stremio `stremio-lacartoons` sin Playwright ni yt-dlp |


## LACartoons — limitaciones conocidas

El sitio usa varios reproductores según el capítulo:
- `cubeembed.rpmvid.com` — soportado.
- `ok.ru` — soportado.
- `abysscdn.com` (a veces detrás de un acortador `short.ink`) — se
  detecta pero **todavía no está resuelto** (falta escribir el
  extractor específico para ese reproductor).

Si un capítulo no reproduce, la app va a mostrar un mensaje de
`[DEBUG]` con el motivo exacto en vez de fallar en silencio.
