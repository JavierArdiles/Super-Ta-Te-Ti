# Super Ta-Te-Ti

Ta-te-ti de 9 tableros con modo 2 y 3 jugadores, bots con 5 niveles y partidas online por link.

## Jugar en tu compu

```bash
npm install
npm run dev
```

Abrí http://localhost:5173.

## Jugar online con amigos

1. Compilá el juego y levantá el servidor de partidas (queda en http://localhost:3000):

   ```bash
   npm run online
   ```

2. En otra terminal, abrí un túnel para que tu compu tenga una dirección pública (la primera vez instalá `cloudflared` con `brew install cloudflared`):

   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```

   Imprime una dirección del estilo `https://algo-algo.trycloudflare.com`.

3. Abrí el juego **desde esa dirección** (no desde localhost), elegí **Online → Crear sala** y compartí el link de la sala.

El link funciona mientras tu compu esté prendida con el servidor y el túnel corriendo. Cada vez que reiniciás el túnel cambia la dirección, y si reiniciás el servidor se pierden las salas abiertas.

### Desarrollo del modo online

```bash
npm run server   # servidor de partidas con recarga automática (puerto 3000)
npm run dev      # juego en http://localhost:5173; /ws se redirige al servidor
```

## Estructura

- `src/game/`: reglas del juego y bot, sin React (las usa también el servidor).
- `src/components/`: pantallas y tablero.
- `src/online/`: protocolo y conexión con el servidor.
- `server/`: servidor de partidas (salas, validación de jugadas, WebSocket).

## Tests

```bash
npm test
```
