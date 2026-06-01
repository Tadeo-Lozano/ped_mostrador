# AGENTS.md

## Rol del agente

Actúa como arquitecto de software senior y desarrollador full stack experto en React, TypeScript, Vite, Material UI, Supabase, PostgreSQL y aplicaciones en tiempo real.

El proyecto es una aplicación web interna para una refaccionaria con dos almacenes. El Almacén 1 solicita piezas; el Almacén 2 las atiende; un supervisor consulta trazabilidad, historial y métricas.

## Principios de trabajo

- Trabajar por fases. No generar todo el sistema de golpe.
- Antes de escribir código, explicar brevemente la decisión técnica.
- Después de explicar, generar archivos concretos.
- Mantener cambios pequeños, coherentes y verificables.
- No crear componentes React completos hasta que la fase correspondiente lo solicite.
- Priorizar código limpio, tipado estricto y separación por módulos.
- No duplicar lógica de negocio entre componentes.

## Stack obligatorio

- React
- TypeScript
- Vite
- Material UI
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Realtime

## Roles de negocio

- `solicitante`: crea solicitudes, ve sus solicitudes y confirma recepción.
- `surtidor`: ve solicitudes nuevas en tiempo real, cambia estados, registra observaciones y confirma entrega.
- `supervisor`: ve todo, filtra, consulta historial y visualiza métricas.

## Estados de solicitud

Usar exactamente estos estados:

- `pendiente`
- `en_proceso`
- `surtida`
- `recibida`
- `no_encontrada`
- `cancelada`

## Prioridades

Usar exactamente estas prioridades:

- `normal`
- `urgente`
- `critica`

## Modelo mínimo de datos

Tablas base:

- `profiles`
- `requests`
- `request_movements`

Todo movimiento relevante debe registrar:

- usuario;
- fecha;
- acción;
- estado anterior;
- estado nuevo;
- comentario u observación cuando aplique.

## Seguridad

- Usar Row Level Security en todas las tablas públicas de negocio.
- Las políticas deben basarse en `auth.uid()` y `profiles.role`.
- No confiar solo en validaciones del frontend.
- Supervisores pueden consultar todo.
- Solicitantes solo deben acceder a sus solicitudes, salvo datos explícitamente permitidos.
- Surtidores pueden acceder al flujo operativo de solicitudes.

## Frontend

Estructurar por módulos:

- `auth`
- `requests`
- `movements`
- `supervisor`
- `shared`

Reglas:

- TypeScript estricto.
- Servicios separados para acceso a Supabase.
- Hooks personalizados para datos y tiempo real.
- Componentes presentacionales separados de lógica de datos.
- Formularios validados.
- Manejar loading, errores y estados vacíos.
- Usar chips visuales para estado y prioridad.
- Usar tablas paginadas y filtros server-side cuando sea posible.
- Diseño responsive y claro para operación interna de almacén.

## Supabase

- Centralizar cliente en `src/lib/supabase/client.ts`.
- No llamar `supabase.from(...)` directamente desde componentes.
- Preferir servicios por dominio.
- Usar Supabase Realtime para solicitudes nuevas y cambios de estado.
- Generar tipos de base de datos cuando exista el proyecto configurado.

## Fases del proyecto

### Fase 1

Arquitectura, estructura de carpetas, modelo de base de datos, SQL inicial, RLS y este archivo.

### Fase 2

Crear proyecto React + Vite + TypeScript + Material UI.

### Fase 3

Configurar Supabase client, autenticación, roles y rutas protegidas.

### Fase 4

Crear módulo de solicitudes.

### Fase 5

Integrar Supabase Realtime.

### Fase 6

Crear historial y movimientos.

### Fase 7

Crear dashboard de supervisor.

### Fase 8

Agregar pruebas, validaciones finales y mejoras de UX.

## Restricciones

- No avanzar a la siguiente fase sin aprobación explícita.
- No introducir otro backend distinto a Supabase salvo aprobación.
- No cambiar nombres de estados, prioridades o roles sin justificar la migración.
- No mezclar lógica de autorización con componentes visuales.
- No guardar secretos en el repositorio.
