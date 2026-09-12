# Addon Latam Providers (fork consolidado)

Este repo junta, en un solo lugar, los providers de Nuvio que ya andaban
bien repartidos en tres forks separados, más el provider propio de
**LACartoons** armado para Addon Latam.

No tiene GitHub Actions ni ningún workflow de actualización automática
a propósito — es un fork congelado en el momento en que se armó, pensado
para no traer cambios de arriba sin que alguien los revise primero.

## Instalar en Nuvio

Settings → Plugins → agregar esta URL (la de tu propio repo en GitHub,
una vez que subas esto):

```
https://raw.githubusercontent.com/TU-USUARIO/TU-REPO/main
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

## Nota sobre los duplicados

Varios de estos providers estaban repetidos entre los tres forks
originales, pero casi siempre uno de los dos era en realidad una
librería compartida de resolutores (con código de otros sitios
mezclado adentro), no una versión más avanzada de ESE proveedor en
particular. Se comparó cada caso a mano y se dejó la versión que
realmente correspondía a ese sitio y que estaba confirmada como
funcionando (marcada como `enabled: true` en el manifest de su fork de
origen), salvo Embed69, donde la versión más grande sí era una versión
genuinamente más completa (con más dominios espejo).

## LACartoons — limitaciones conocidas

El sitio usa varios reproductores según el capítulo:
- `cubeembed.rpmvid.com` — soportado.
- `ok.ru` — soportado.
- `abysscdn.com` (a veces detrás de un acortador `short.ink`) — se
  detecta pero **todavía no está resuelto** (falta escribir el
  extractor específico para ese reproductor).

Si un capítulo no reproduce, la app va a mostrar un mensaje de
`[DEBUG]` con el motivo exacto en vez de fallar en silencio.
