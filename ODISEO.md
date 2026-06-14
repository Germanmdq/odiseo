# Odiseo - bitácora de trabajo

Proyecto nuevo:
`/Users/germangonzalez/odiseo-v2-base`

Proyecto viejo investigado:
`/Users/germangonzalez/anima`

Supabase:
- Proyecto: `Anima`
- Ref: `qitwckfwmgnmnmtjhfnf`

Fecha de inicio de esta bitácora:
2026-06-12

> Este archivo se va actualizando a medida que avanzamos. No incluye secretos,
> API keys ni valores sensibles.

## Regla de trabajo

- No inventar claves ni copiar secretos sin autorización.
- No crear tablas nuevas si ya existen tablas válidas del Odiseo viejo.
- Antes de tocar schema, inspeccionar Supabase y pedir OK.
- Usar el proyecto Supabase viejo como fuente de verdad cuando tenga datos o estructura real.
- No exponer service role ni NVIDIA API key al cliente.

## Prompt 1 - Supabase y NVIDIA base

Se configuró la conexión de `odiseo-v2-base` a Supabase/NVIDIA.

Archivos creados o modificados:
- `.env.local`
- `.env.example`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/admin.ts`
- `src/lib/nvidia.ts`
- `src/app/api/health/route.ts`

Dependencias agregadas:
- `@supabase/supabase-js`
- `@supabase/ssr`

Helpers:
- `client.ts`: browser client con anon key.
- `server.ts`: server client con cookies.
- `admin.ts`: service role solo server-side.
- `nvidia.ts`: `embedQuery(text: string)` usando NVIDIA embeddings.

Verificación:
- `GET /api/health`
- Resultado esperado/verificado:
  `{ ok: true, artifacts: 6922 }`

Nota:
- El endpoint de health usa admin client para contar `content_artifacts` de forma server-side.

## Prompt 2 - Auth real con Supabase

Se conectaron las pantallas existentes:
- `/login`
- `/registro`
- `/recuperar`

Implementado:
- Login con `signInWithPassword(email, password)`.
- Error en español: `Email o contraseña incorrectos`.
- Registro con `signUp(email, password)` y `user_metadata.full_name`.
- Recuperar con `resetPasswordForEmail(email)`.
- Middleware compuesto con `next-intl`.
- Rutas internas protegidas.
- Landing/auth públicas.
- Footer del sidebar con nombre/email reales.
- Menú del usuario con `Cerrar sesión`.

Supabase viejo inspeccionado:
- Tabla `profiles`
- Relación: `profiles.id -> auth.users.id`

Confirmación por email:
- El usuario la apagó en Supabase.
- Se verificó que un registro nuevo devuelve sesión inmediatamente.

Texto corregido en registro:
- Antes: `Acceso gratuito, suscripción opcional para desbloquear todo`
- Ahora: `Acceso gratuito`

## Prompt 3 - DataTable y Fuentes

Se creó un DataTable reutilizable en:
- `src/components/data-table/data-table.tsx`
- `src/components/data-table/data-table-column-header.tsx`
- `src/components/data-table/index.ts`

Incluye:
- TanStack Table.
- Tabs opcionales.
- Paginación.
- Drawer con render prop.
- Personalización de columnas.

Se quitó:
- Drag and drop de filas.
- Checkboxes de selección.

Página Fuentes:
- Ruta: `/[locale]/fuentes`
- Sidebar: grupo `Estudio`, item `Fuentes`, ícono `Library`.

Primera interpretación:
- Se había armado desde `content_artifacts`.
- Eso listaba testimonios/citas/frases y no correspondía.

Corrección aplicada:
- Fuentes ahora usa `study_materials`.
- Muestra lecturas completas reales.
- Conteo real: 621 lecturas publicadas.

Drawer de Fuentes:
- Tipo
- Año
- Palabras
- Título original
- Archivo fuente
- Resumen
- Texto completo

Se eliminó del drawer:
- Testimonios
- Citas
- Frases
- Explicaciones
- Agrupación por subtipo

## Ajustes visuales Fuentes

Se pidió extender el popup/drawer porque las lecturas largas eran incómodas.

Resultado:
- Se amplió el drawer para lectura extensa.
- Se revisó para que el contenido largo sea más cómodo.

## Páginas de estudio con DataTable

Se comenzó el trabajo sobre:
- `/[locale]/testimonios`
- `/[locale]/biblia`
- `/[locale]/preguntas`

Objetivo:
- Usar `content_artifacts` filtrado por `artifact_subtype`.
- Drawer con contenido completo.
- Búsqueda semántica en Preguntas con `/api/search`.

Corrección visual aplicada:
- En `/es/testimonios`, el texto de la columna Extracto se mezclaba con columnas vecinas.
- Se ajustó el DataTable a `table-fixed`.
- Se aplicaron anchos de columna.
- Se agregaron `line-clamp` y `min-w-0` en celdas problemáticas.
- TypeScript pasó limpio después del ajuste.

## Talleres

Se creó:
- `src/app/[locale]/(dashboard)/talleres/page.tsx`

Incluye:
- 4 cards grandes.
- Video 16:9 por taller.
- Objeto editable `TALLERES_VIMEO`.
- Videos locales temporales en `public/videos/talleres`.
- 8 lecciones por taller.
- Estado bloqueado con `Lock`.
- Candado general: `Desbloquear con la suscripción`.

Títulos de lecciones:
- Agregados a `messages/es.json`.
- Traducidos en `messages/en.json`.

Sidebar:
- Se agregó `Talleres` en `Estudio`.

## Prompt 5 - Coach conectado con RAG

Proyecto viejo investigado:
- `/Users/germangonzalez/anima/lib/gemini.ts`
- `/Users/germangonzalez/anima/app/api/chat/route.ts`

Patrón viejo:
- NVIDIA NIM vía OpenAI SDK.
- Modelo: `meta/llama-3.3-70b-instruct`.
- RAG con búsqueda semántica.
- Streaming al cliente.

Implementación nueva:
- `src/lib/coach/prompts.ts`
- `src/app/api/coach/route.ts`

Flujo:
1. Recibe `autorId` y `messages`.
2. Toma último mensaje del usuario.
3. Llama `embedQuery()`.
4. Consulta `match_content_artifacts`.
5. Construye contexto con título, body recortado y fuentes.
6. Arma system prompt por autor.
7. Llama NVIDIA NIM con streaming.
8. Devuelve texto incremental.

Autores:
- Neville Goddard
- Joseph Murphy
- Emmet Fox
- Florence Scovel Shinn

Frontend:
- Coach hace POST a `/api/coach`.
- Streaming progresivo.
- Historial en memoria por autor.
- Loading de 3 puntos.
- Error amable con reintento.

Verificación:
- `tsc --noEmit --pretty false --incremental false` pasó limpio.
- Se probó streaming real con Neville y otros autores.

## Prompt 6 - Narrador conectado con RAG

Se creó:
- `src/app/api/narrador/route.ts`
- `src/app/[locale]/(dashboard)/narrador/page.tsx`
- `src/app/[locale]/(dashboard)/narrador/components/narrador-view.tsx`

Ruta:
- `/[locale]/narrador`

Sidebar:
- Grupo `Apps`.
- Debajo de Coach.
- Ícono `Sparkles`.

Backend:
- `POST /api/narrador`
- Usa `embedQuery()` con el último mensaje.
- Llama `match_content_artifacts` con `match_count: 5`.
- No filtra por subtype.
- Usa prompt completo del Narrador.
- Llama NVIDIA NIM con streaming.

UI:
- Misma estructura visual que Coach, sin lista de conversaciones.
- Panel único.
- Header `Narrador`.
- Subtítulo `Escenas guiadas para sentir tu deseo cumplido`.
- Estado vacío con 4 chips.
- Historial en memoria.
- Loading de 3 puntos.
- Error amable con `Reintentar`.

Chips:
- `Narrame una escena para sentir seguridad`
- `Quiero vivir la escena de mi nuevo trabajo`
- `Una escena de abundancia para antes de dormir`
- `Ayudame a construir mi escena SATS`

Accesibilidad:
- Se revisó contraste de chips.
- `bg-muted/text-muted-foreground` daba 4.35:1 en light.
- Se ajustó a `bg-muted` con texto de mayor contraste.
- Resultado:
  - Dark: 14.5:1
  - Light: 18.16:1

Verificación:
- `tsc --noEmit --pretty false --incremental false` pasó limpio.
- API respondió escena completa por streaming.
- UI generó escena desde chip.
- UI generó escena desde texto libre.

Capturas:
- `/private/tmp/odiseo-narrador-dark-inicial.png`
- `/private/tmp/odiseo-narrador-light-inicial.png`
- `/private/tmp/odiseo-narrador-escena-seguridad.png`
- `/private/tmp/odiseo-narrador-escena-trabajo.png`

## Prompt 6b — Narrador → Creador de escenas (rediseño)

El Narrador fue renombrado y rediseñado por completo.

Cambios aplicados:
- Ruta: `/narrador` → `/creador-de-escenas`. `/narrador` queda como redirect permanente.
- Sidebar: "Narrador" → "Creador de escenas".
- API: `src/app/api/creador-de-escenas/route.ts` con nuevo system prompt.
- Vista: `src/app/[locale]/(dashboard)/creador-de-escenas/components/creador-de-escenas-view.tsx`
- Se eliminaron los 4 chips de sugerencia.
- Se agregó mensaje inicial del asistente pre-cargado en el historial (sin llamada a API).
- Namespace i18n nuevo: `creador` (en ES y EN). El namespace `narrador` sigue en los archivos JSON pero ya no se usa.
- `max_tokens` subido a 1500 (escenas más largas), `temperature` a 0.45.

System prompt nuevo: enfoque en UN INSTANTE de 2-3 segundos con riqueza sensorial total,
en cámara lenta extrema. Primer turno = preguntas sobre quién/dónde/qué clima.
No menciona SATS ni teoría.

## Prompt 9 — Memoria + Mi libro

### Investigación (Paso 0)

Tabla `memoria` existente en Supabase (mismo proyecto Anima):
- Columnas: `id`, `user_id`, `item_type`, `title`, `content` (jsonb), `source`, `status`, `created_at`, `updated_at`
- 6 filas previas con `item_type`: `questions`, `book` — no se tocan ni muestran en v2.
- Tabla `mi_libro_capitulos` NO existía — creada nueva.

SQL aplicado (migrations/002_memoria_y_libro.sql):
- `create policy memoria_own_all on public.memoria ...`
- `create table public.mi_libro_capitulos (...)` con RLS.

### Mapeo content (jsonb)

Nuevas entradas guardan `content: { text: "...", meta: { autorId: "..." } }`.
`source` = badge legible ("Coach — Neville Goddard", "Creador de escenas", "Preguntas", "Tu plan").

### Archivos creados

API routes:
- `src/app/api/memoria/route.ts` — GET (lista del usuario) + POST (insert)
- `src/app/api/memoria/count/route.ts` — GET count para el Inicio
- `src/app/api/memoria/[id]/route.ts` — DELETE
- `src/app/api/mi-libro/route.ts` — GET + POST
- `src/app/api/mi-libro/[id]/route.ts` — PUT + DELETE
- `src/app/api/mi-libro/generar-capitulo/route.ts` — POST streaming con NVIDIA NIM

Componente reutilizable:
- `src/components/guardar-en-memoria-button.tsx` — bookmark icon, idle/saving/saved/error states

Páginas:
- `src/app/[locale]/(dashboard)/memoria/page.tsx` + `components/memoria-view.tsx`
- `src/app/[locale]/(dashboard)/mi-libro/page.tsx` + `components/mi-libro-view.tsx`

### Integraciones

- **Coach**: botón en cada mensaje del asistente (aparece en hover), `origenTipo: 'coach'`, `origenMeta: { autorId }`.
- **Creador de escenas**: ídem, excepto el mensaje de saludo inicial (`id: 'greeting'`).
- **Preguntas**: botón visible en el drawer de cada respuesta.

### Sidebar

Grupo "Personal" agregado con items: Memoria (Brain), Mi libro (BookOpen).

### Inicio

`MetricsOverview` ahora fetchea `GET /api/memoria/count` en `useEffect` y muestra count real en la card "Memorias guardadas".

## Prompt 7 - Paso 0, investigación obligatoria

Pedido:
- Antes de tocar nada, inspeccionar Supabase viejo.
- Listar tablas relacionadas con planes, diario, notas y relación con `auth.users`.
- Ver si el viejo generaba prácticas diarias con IA.
- Si falta alguna tabla, proponer `CREATE TABLE` con RLS y esperar OK.

Resultado de investigación:

### Proyecto viejo

Código viejo:
- `/Users/germangonzalez/anima`

Datos relevantes:
- `ANIMA.md`
- `CLAUDE.md`
- `app/api/plans/route.ts`
- `app/api/chat/route.ts`
- `lib/gemini.ts`
- `components/journal/JournalPanel.tsx`
- `components/notes/NotesPanel.tsx`

### Planes

Tablas existentes recomendadas:
- `guided_plans`
- `guided_plan_days`
- `user_plan_enrollments`
- `user_day_progress`
- `daily_activity_events`

Relaciones:
- `user_plan_enrollments.user_id -> auth.users.id`
- `user_day_progress.enrollment_id -> user_plan_enrollments.id`
- `user_day_progress.plan_day_id -> guided_plan_days.id`
- `guided_plan_days.plan_id -> guided_plans.id`
- `daily_activity_events.user_id -> auth.users.id`
- `daily_activity_events.plan_enrollment_id -> user_plan_enrollments.id`
- `daily_activity_events.plan_day_progress_id -> user_day_progress.id`

RLS:
- `user_plan_enrollments`: `auth.uid() = user_id`
- `user_day_progress`: acceso vía enrollment del usuario.
- `daily_activity_events`: `auth.uid() = user_id`
- `guided_plans` y `guided_plan_days`: lectura pública/member si publicados.

Estado actual:
- `guided_plans`: 1 fila.
- `guided_plan_days`: 0 filas.
- `user_plan_enrollments`: 0 filas.
- `user_day_progress`: 0 filas.
- `daily_activity_events`: 0 filas.

IA de prácticas:
- No existe Edge Function.
- No existe RPC dedicada.
- El viejo patrón usa `/api/chat` + `contextData.chatMode = "plan"`.
- NVIDIA NIM con RAG.
- El prompt viejo indica: plan de 7/15/30 días con lectura/material, práctica, reflexión, mensaje de Telegram y criterio de avance.

### Diario

Tabla canónica recomendada:
- `journal_entries`

Columnas:
- `id`
- `user_id`
- `locale`
- `title_es`
- `title_en`
- `content_es`
- `content_en`
- `mood`
- `intention`
- `tags`
- `related_plan_id`
- `related_plan_day_id`
- `related_material_id`
- `is_private`
- `metadata`
- `created_at`
- `updated_at`
- `artifact_id`

Relación:
- `journal_entries.user_id -> auth.users.id`

RLS:
- `journal_entries_own_all`
- `auth.uid() = user_id`

Estado:
- 0 filas.

Nota:
- Existe también `diario`, pero tiene RLS habilitado y 0 policies.
- Recomendación: no usar `diario`; usar `journal_entries`.

### Notas

Tabla existente:
- `notas`

Columnas:
- `id`
- `user_id`
- `title`
- `content`
- `tags`
- `source`
- `metadata`
- `created_at`
- `updated_at`

Relación:
- `notas.user_id -> auth.users.id`

Estado:
- 0 filas.

Problema:
- RLS está habilitado.
- Tiene 0 policies.
- Así como está, no funciona para usuario autenticado desde cliente normal.

Propuesta mínima pendiente de ejecutar:

```sql
create policy notas_own_all
on public.notas
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

### Inicio real

Tabla existente para actividad:
- `daily_activity_events`

Columnas útiles:
- `user_id`
- `activity_date`
- `event_type`
- `title_es`
- `summary_es`
- `source_table`
- `source_id`
- `journal_entry_id`
- `plan_enrollment_id`
- `plan_day_progress_id`
- `chat_session_id`
- `created_at`
- `metadata`

RLS:
- `daily_activity_events_own_all`
- `auth.uid() = user_id`

Problema para notas:
- `daily_activity_events.event_type` no permite `note`.
- `daily_activity_events` no tiene `note_id`.

Propuesta mínima pendiente de ejecutar:

```sql
alter table public.daily_activity_events
add column note_id uuid references public.notas(id) on delete set null;
```

También habría que reemplazar el check constraint de `event_type` para agregar `note`.

## Reconciliación Prompt 7 — modelo de Planes

La investigación del Prompt 7 fue correcta, pero para el modelo VIEJO de Planes.
Ese modelo quedó descartado. A continuación, registro qué queda vivo y qué no.

### Tablas investigadas que NO se usan (no borrar, ya existían en el viejo)

- `guided_plans` — 1 fila, sin uso en v2.
- `guided_plan_days` — 0 filas, sin uso en v2.
- `user_plan_enrollments` — 0 filas, sin uso en v2.
- `user_day_progress` — 0 filas, sin uso en v2.
- `journal_entries` — 0 filas, sin uso en v2. El modelo nuevo no tiene "Diario"
  como sección separada; la card de Inicio pasa a ser "Notas guardadas".

### Modelo NUEVO de Planes

Formulario de solicitud → email a Germán → respuesta desde panel admin
→ usuario ve respuesta en "Mensajes" y aprueba.

Tabla nueva requerida: `plan_solicitudes` (ver SQL en sección siguiente).

### Pendiente inmediato — schema

1. Política RLS en `notas`:
   ```sql
   create policy notas_own_all
   on public.notas
   for all
   using (auth.uid() = user_id)
   with check (auth.uid() = user_id);
   ```

2. Columna `note_id` en `daily_activity_events` + actualizar check constraint
   de `event_type` para incluir `'note'` (inspeccionar constraint actual antes
   de modificar).

3. Crear tabla `plan_solicitudes` (SQL pendiente — ver `PROMPT7_revisado_planes_mensajes.md`).

### Pendiente de implementación

Una vez aplicado el schema: formulario de Planes, sección Mensajes (reciclando
el componente Mail), panel `/admin/plan-solicitudes`, Notas, Telegram-link,
Inicio con datos reales.

Referencia de diseño: `PROMPT7_revisado_planes_mensajes.md` (a pasar por el usuario).

## Debug 2026-06-13 — Memoria y Mi libro

Pedido:
- `Guardar en Memoria` no persistía.
- `/api/mi-libro` devolvía 500.

Inspección real de Supabase:
- `public.memoria` existía con RLS habilitado, pero tenía 0 policies.
- No existía `memoria_own_all`.
- `public.mi_libro_capitulos` no existía.
- Por eso `/api/mi-libro` fallaba al consultar una relación inexistente.

Schema aplicado:
- RLS confirmado en `public.memoria`.
- Policy creada:
  ```sql
  memoria_own_all
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id)
  ```
- Tabla creada:
  `public.mi_libro_capitulos`
- Columnas:
  `id`, `user_id`, `titulo`, `contenido`, `orden`, `memorias_origen`,
  `created_at`, `updated_at`
- RLS habilitado en `mi_libro_capitulos`.
- Policy creada:
  ```sql
  mi_libro_capitulos_own_all
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id)
  ```

Código ajustado:
- `src/app/api/memoria/route.ts`
  - GET/POST ahora usan el server client con la sesión del usuario.
  - El insert prueba RLS real en vez de saltarlo con service role.
  - Mapeo confirmado:
    - `item_type = origenTipo`
    - `content = { text: contenido, meta: origenMeta }`
    - `source = source`
    - `title = source`
  - Se agregaron logs con mensaje/código/detalles/hint si Supabase falla.
- `src/app/api/memoria/[id]/route.ts`
  - DELETE con server client + logs reales.
- `src/app/api/mi-libro/route.ts`
  - GET/POST con server client + logs reales.
  - POST valida errores al calcular `orden`.
- `src/app/api/mi-libro/[id]/route.ts`
  - PUT/DELETE con server client + logs reales.
- `src/app/api/mi-libro/generar-capitulo/route.ts`
  - Lee memorias con server client + logs reales.
- `src/components/guardar-en-memoria-button.tsx`
  - Ya no traga el error silenciosamente.
  - Loguea el payload de error en consola.
  - Muestra el mensaje de error en el `title` del botón.

Verificación pendiente en navegador:
- Click real desde Coach.
- Fila visible en Supabase.
- Fila visible en `/memoria`.
- `/mi-libro` sin 500.
- Capítulo creable.

Verificación realizada:
- Usuario de prueba creado desde `/es/registro` sin confirmación por email.
- Coach:
  - Se envió mensaje real.
  - Se recibió respuesta de `/api/coach`.
  - Click real en botón `Guardar en Memoria`.
  - Servidor registró `POST /api/memoria 200`.
- Supabase:
  - Fila nueva en `public.memoria`.
  - `item_type = 'coach'`.
  - `content.text` contiene la respuesta del Coach.
  - `content.meta.autorId = 'neville'`.
  - `source = 'Coach — Neville Goddard'`.
- `/es/memoria`:
  - La memoria aparece como card real.
  - Captura: `/private/tmp/odiseo-memoria.png`
- `/es/mi-libro`:
  - `GET /api/mi-libro 200`.
  - No aparece el 500 anterior.
  - Se creó capítulo manual con `Nuevo capítulo en blanco`.
  - Servidor registró `POST /api/mi-libro 200`.
  - Fila nueva en `public.mi_libro_capitulos`.
  - Captura: `/private/tmp/odiseo-mi-libro.png`
- Consola:
  - Sin errores nuevos durante Memoria/Mi libro.
  - Quedan warnings no relacionados de Next/Recharts ya existentes en dashboard.

## Performance navegación — 2026-06-13

Pedido:
- El cambio entre secciones tardaba varios segundos y se sentía roto.
- Confirmar si era solo `dev` o también producción.
- Revisar páginas pesadas: Fuentes, Testimonios, Biblia, Preguntas.

Diagnóstico:
- En `dev`, la primera visita de secciones pesadas era lenta por compilación
  on-demand + queries remotas:
  - Fuentes: ~6.5s
  - Preguntas: ~5.6s
  - Testimonios: ~4.0s
  - Biblia: ~4.1s
- Las páginas de estudio usaban datos públicos/estables pero no estaban
  cacheadas de forma consistente.
- `Fuentes` ya cacheaba el mapa de tags, pero no las summaries ni el detalle.
- `content_artifacts` no cacheaba páginas, counts ni listados completos.
- `AppSidebar` y `SiteHeader` hacen fetches de usuario/notificaciones, pero
  no bloquean el render principal; no fueron el cuello de botella principal.

Cambios aplicados:
- `src/lib/content-artifacts/data.ts`
  - `unstable_cache` + `revalidate: 3600` para:
    - `getContentArtifactsPage`
    - `getContentArtifactCountsByLevel`
    - `getContentArtifactTotal`
    - `getContentArtifactsAll`
    - `getContentArtifactsByIds`
- `src/lib/fuentes/data.ts`
  - `unstable_cache` + `revalidate: 3600` para:
    - `getFuenteSummaries`
    - `getFuenteDetail`
- Páginas con `export const revalidate = 3600`:
  - `/fuentes`
  - `/testimonios`
  - `/biblia`
  - `/preguntas`

Verificación:
- `tsc --noEmit --pretty false --incremental false` pasó limpio.
- `npm run build` pasó limpio.
- `pnpm` no está disponible en este shell (`command not found`), por eso la
  verificación equivalente se hizo con `npm run build` y `npm run start`.
- En `dev`, primera pasada después de cambios puede seguir lenta por HMR/cache
  invalidation. Segunda pasada:
  - Mi libro: ~2.6s
  - Fuentes: ~2.1s
  - Testimonios: ~1.9s
  - Biblia: ~1.4s
  - Preguntas: ~1.9s
- En producción (`npm run build` + `npm run start -p 3001`):
  - Primera pasada:
    - Mi libro: ~2.6s
    - Fuentes: ~1.5s
    - Testimonios: ~1.6s
    - Biblia: ~1.0s
    - Preguntas: ~1.8s
  - Segunda pasada:
    - Mi libro: ~1.2s
    - Fuentes: ~1.1s
    - Testimonios: ~0.9s
    - Biblia: ~0.9s
    - Preguntas: ~0.9s
- Consola en producción: sin errores.

Conclusión:
- No persiste como problema bloqueante en producción.
- El Prompt 10/deploy puede avanzar desde este punto.
