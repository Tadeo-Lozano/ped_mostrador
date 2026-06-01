# Refaccionaria Almacenes

Aplicacion web interna para gestionar solicitudes de refacciones entre dos almacenes con trazabilidad, roles y actualizaciones en tiempo real.

## Stack

- React
- TypeScript
- Vite
- Material UI
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Realtime

## Scripts

```bash
npm install
npm run dev
npm run build
npm run lint
npm run test
```

## Variables de entorno

Copia `.env.example` a `.env.local` y configura:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Migraciones

Las migraciones de Supabase estan en:

```text
supabase/migrations
```

Ejecutalas en orden desde el SQL Editor de Supabase si no estas usando Supabase CLI.

## Fases

Consulta `AGENTS.md` para mantener las instrucciones consistentes del proyecto.
