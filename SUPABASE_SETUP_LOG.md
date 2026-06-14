# Registro de configuración Supabase/NVIDIA

Proyecto: `/Users/germangonzalez/odiseo-v2-base`

Fecha: 2026-06-12

## Alcance acordado

- Configurar la conexión a Supabase en el frontend nuevo.
- No migrar páginas todavía.
- No tocar páginas existentes.
- No inventar claves ni copiar valores sin autorización.
- Crear helpers estándar para App Router.
- Crear un route handler de prueba `GET /api/health`.

## Pasos realizados

1. Identifiqué que el frontend nuevo activo está en:
   `/Users/germangonzalez/odiseo-v2-base`

2. Confirmé que la app corre en:
   `http://localhost:3001/es/dashboard`

3. Instalé dependencias de Supabase con pnpm/corepack:
   - `@supabase/supabase-js`
   - `@supabase/ssr`

   Resultado en `package.json`:
   - `@supabase/ssr`: `^0.12.0`
   - `@supabase/supabase-js`: `^2.108.1`

4. Creé `.env.example` sin valores:
   - `NEXT_PUBLIC_SUPABASE_URL=`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=`
   - `SUPABASE_SERVICE_ROLE_KEY=`
   - `NVIDIA_API_KEY=`

5. Creé `.env.local` inicialmente sin valores.

6. Luego, con autorización explícita, copié los valores desde:
   `/Users/germangonzalez/anima/.env.local`

   Variables copiadas:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NVIDIA_API_KEY`

   Nota: este archivo de registro no incluye valores secretos.

7. Creé el helper browser de Supabase:
   `src/lib/supabase/client.ts`

   Propósito:
   - Crear cliente de navegador con `createBrowserClient`.
   - Usar solo:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

8. Creé el helper server de Supabase:
   `src/lib/supabase/server.ts`

   Propósito:
   - Crear cliente server-side con `createServerClient`.
   - Integrar cookies de App Router con `next/headers`.
   - Usar anon key, no service role.

9. Creé el helper admin de Supabase:
   `src/lib/supabase/admin.ts`

   Propósito:
   - Crear cliente con `SUPABASE_SERVICE_ROLE_KEY`.
   - Marcar el módulo como server-only con `import "server-only"`.
   - Evitar sesiones persistidas:
     - `autoRefreshToken: false`
     - `persistSession: false`

   Restricción:
   - Este helper es solo para route handlers o código del servidor.
   - No debe importarse desde componentes cliente.

10. Creé el helper NVIDIA:
    `src/lib/nvidia.ts`

    Función:
    - `embedQuery(text: string): Promise<number[]>`

    Endpoint:
    - `https://integrate.api.nvidia.com/v1/embeddings`

    Payload configurado:
    - `model: "nvidia/llama-nemotron-embed-1b-v2"`
    - `encoding_format: "float"`
    - `extra_body.input_type: "query"`
    - `extra_body.truncate: "END"`
    - `extra_body.dimensions: 1024`

    Seguridad:
    - Usa `NVIDIA_API_KEY` solo server-side.
    - El módulo está marcado con `import "server-only"`.

11. Creé el route handler:
    `src/app/api/health/route.ts`

    Comportamiento:
    - `GET /api/health`
    - Hace un count exacto sobre `content_artifacts`.
    - Devuelve:
      `{ ok: true, artifacts: <count> }`

    Ajuste posterior:
    - El server client estándar con anon key respondió `artifacts: 0`.
    - Verifiqué con service role que la tabla sí tiene `6922` filas.
    - Para que el endpoint de health refleje el conteo real y siga siendo server-side, el route handler usa `createAdminClient()`.
    - Este uso queda limitado a `src/app/api/health/route.ts`, que corre en servidor.

12. Intenté correr TypeScript:
    `./node_modules/.bin/tsc --noEmit`

    Resultado:
    - El comando encontró errores preexistentes en archivos de plantilla.
    - No edité esos archivos porque no forman parte del alcance.

    Archivos con errores preexistentes:
    - `src/app/[locale]/(dashboard)/tasks/components/data-table-toolbar.tsx`
    - `src/components/ui/chart.tsx`

13. Reinicié el servidor de desarrollo en `3001` para que tome:
    - `.env.local`
    - el nuevo route handler `/api/health`

    Servidor:
    - `./node_modules/.bin/next dev --port 3001`

## Verificación

Comando:

```bash
curl -s http://127.0.0.1:3001/api/health
```

Resultado:

```json
{"ok":true,"artifacts":6922}
```

Estado:
- Verificación correcta.
- El servidor quedó levantado en `http://localhost:3001`.
- Dashboard: `http://localhost:3001/es/dashboard`
- Health check: `http://localhost:3001/api/health`

## Página interna de Talleres

Se creó la página:

- `src/app/[locale]/(dashboard)/talleres/page.tsx`

Contenido implementado:

- Grid de 4 cards grandes, una por taller.
- Número de taller grande.
- Video 16:9 por taller.
- Objeto editable `TALLERES_VIMEO` con IDs placeholder para reemplazar por Vimeo más adelante.
- Videos locales temporales en `public/videos/talleres`.
- Título y descripción reutilizados desde `landing.talleres.*`.
- Badge `8 lecciones`.
- Lista de 8 lecciones por taller en formato curso online.
- Estado bloqueado visual con `Lock`.
- Candado general `Desbloquear con la suscripción`.
- Textos de 32 lecciones agregados en:
  - `messages/es.json`
  - `messages/en.json`

Orden local de videos aplicado según indicación:

- Taller 1: `video-2.mp4`
- Taller 2: `video-3.mp4`
- Taller 3: `video-1.mp4`
- Taller 4: `video-4.mp4`

Accesos actualizados:

- Se agregó `Talleres` al grupo `Estudio` del sidebar.
- Se habilitó la card `Talleres` del dashboard quitando el estado `Próximamente`.

## Prompt 5 - Coach conectado con RAG

Se investigó el proyecto viejo:

- Archivo revisado: `/Users/germangonzalez/anima/lib/gemini.ts`
- Patrón detectado:
  - Base URL NVIDIA: `https://integrate.api.nvidia.com/v1`
  - Modelo chat: `meta/llama-3.3-70b-instruct`
  - El proyecto viejo usaba OpenAI SDK apuntado a NVIDIA NIM.
  - La ruta vieja streameaba texto al cliente desde un `ReadableStream`.

Implementación nueva:

- Se creó `src/lib/coach/prompts.ts` con los 4 system prompts:
  - Neville Goddard
  - Joseph Murphy
  - Emmet Fox
  - Florence Scovel Shinn
- Se creó `src/app/api/coach/route.ts`.

Flujo de `POST /api/coach`:

1. Recibe `autorId` y `messages`.
2. Toma el último mensaje del usuario.
3. Llama `embedQuery(text)`.
4. Consulta Supabase con `match_content_artifacts`.
5. Construye un bloque de contexto con título, cuerpo recortado y fuentes.
6. Combina `SYSTEM_PROMPTS[autorId]` + contexto recuperado.
7. Llama NVIDIA NIM con streaming.
8. Devuelve texto plano incremental al frontend.

Ajuste realizado en `src/lib/nvidia.ts`:

- El script viejo usaba OpenAI SDK con `extra_body`.
- En `fetch` directo, NVIDIA rechazó `extra_body`.
- Se ajustó el payload directo a:
  - `input: [text]`
  - `input_type: "query"`
  - `truncate: "END"`
  - `dimensions: 1024`

Frontend:

- Se actualizó `src/app/[locale]/(dashboard)/coach/data.ts` para usar IDs:
  - `neville`
  - `murphy`
  - `fox`
  - `scovel-shinn`
- Se actualizó `src/app/[locale]/(dashboard)/coach/use-coach.ts` para permitir actualizar mensajes en streaming.
- Se actualizó `src/app/[locale]/(dashboard)/coach/components/coach-view.tsx`:
  - POST a `/api/coach`.
  - Streaming progresivo.
  - Historial separado por autor en memoria.
  - Loading con 3 puntos animados.
  - Error amable con botón `Reintentar`.

Verificación realizada:

- `tsc --noEmit --pretty false --incremental false` pasó limpio.
- `curl` local a `/api/coach` con Neville respondió con streaming real.
- La respuesta de Neville a dinero usó contexto RAG y mencionó fuente.
- Se probaron también Murphy, Fox y Florence.

## Prompt 2 - Auth real con Supabase

14. Conecté las pantallas existentes de auth a Supabase Auth:
    - `src/app/[locale]/(auth)/login/components/login-form.tsx`
    - `src/app/[locale]/(auth)/registro/components/signup-form.tsx`
    - `src/app/[locale]/(auth)/recuperar/components/recuperar-form.tsx`

    Login:
    - Usa `signInWithPassword(email, password)`.
    - Si falla, muestra `Email o contraseña incorrectos`.
    - Si funciona, redirige a `/${locale}/dashboard`.

    Registro:
    - Usa `signUp(email, password)`.
    - Guarda nombre y apellido como `user_metadata.full_name`.
    - Si Supabase devuelve sesión, redirige directo al dashboard.
    - Si Supabase no devuelve sesión, mantiene el fallback `Revisá tu correo para confirmar la cuenta`.

    Recuperar:
    - Usa `resetPasswordForEmail(email)`.
    - Si funciona, muestra `Te enviamos un enlace`.

15. Compuse el middleware de Supabase Auth con el middleware existente de `next-intl`:
    `src/middleware.ts`

    Comportamiento:
    - Landing y páginas de auth quedan públicas.
    - Rutas internas como `/dashboard`, `/coach`, etc. quedan protegidas.
    - Usuario sin sesión que entra a `/es/dashboard` redirige a `/es/login`.

16. Conecté el usuario real en el footer del sidebar:
    - `src/components/app-sidebar.tsx`
    - `src/components/nav-user.tsx`

    Comportamiento:
    - Lee el usuario logueado con `supabase.auth.getUser()`.
    - Intenta leer `profiles` para nombre, email y avatar.
    - Si no encuentra profile, usa metadata de Auth.
    - El menú del usuario tiene `Cerrar sesión`.
    - `Cerrar sesión` hace `signOut()` y redirige a `/${locale}/login`.

17. Inspeccioné la tabla `profiles` del proyecto Supabase anterior.

    Columnas detectadas:
    - `id`
    - `email`
    - `full_name`
    - `display_name`
    - `avatar_url`
    - `locale`
    - `plan_tier`
    - `telegram_user_id`
    - `telegram_chat_id`
    - `telegram_opt_in`
    - `onboarding_completed`
    - `created_at`
    - `updated_at`
    - `plan`
    - `status`

18. Cambié el texto de la pantalla de registro:
    `messages/es.json`

    Antes:
    - `Acceso gratuito, suscripción opcional para desbloquear todo`

    Ahora:
    - `Acceso gratuito`

19. Confirmación por email:
    - El usuario apagó la confirmación de email desde Supabase.
    - Probé un registro nuevo contra Supabase con la anon key pública.
    - Supabase devolvió sesión inmediatamente (`hasSession: true`).
    - Por eso no quedó ningún endpoint extra con service role para confirmar usuarios desde la app.

## Verificación Prompt 2

Registro sin confirmación de email:

```json
{"ok":true,"hasSession":true}
```

Middleware sin sesión:

```bash
curl -I http://127.0.0.1:3001/es/dashboard
```

Resultado esperado y verificado:
- `307`
- `location: /es/login`

TypeScript:
- `./node_modules/.bin/tsc --noEmit --pretty false` sigue mostrando errores preexistentes de la plantilla en:
  - `src/app/[locale]/(dashboard)/tasks/components/data-table-toolbar.tsx`
  - `src/components/ui/chart.tsx`
- Además, la sandbox no pudo escribir `tsconfig.tsbuildinfo`.

## Prompt 3 - DataTable reutilizable y página Fuentes

20. Creé un DataTable genérico reutilizable en:
    - `src/components/data-table/data-table.tsx`
    - `src/components/data-table/data-table-column-header.tsx`
    - `src/components/data-table/index.ts`

    Incluye:
    - TanStack Table.
    - Paginación client-side.
    - Menú `Personalizar columnas`.
    - Tabs superiores opcionales.
    - Drawer al click de fila mediante `renderDrawer`.

    Eliminado respecto del DataTable de `dashboard-1`:
    - Drag and drop de filas.
    - Checkboxes de selección.
    - Datos demo, acciones demo e inputs inline.

21. Inspeccioné datos reales de `content_artifacts`.

    Columnas relevantes:
    - `source_table`
    - `libros_citados`
    - `conferencias_citadas`
    - `artifact_subtype`
    - `title`
    - `body`

    Decisión de agrupamiento:
    - Conferencias: agrupadas por `source_table` para evitar duplicados por variaciones textuales en `conferencias_citadas`.
    - Libros: agrupados por nombre en `libros_citados`.
    - Se excluyen los `source_table` de `respuesta_pregunta` como fuentes propias, porque son archivos de preguntas y no fuentes primarias.

    Conteo real actual:
    - 6922 artifacts.
    - 601 conferencias.
    - 66 libros citados.
    - 667 fuentes totales.

22. Creé el servicio server-side de fuentes:
    - `src/lib/fuentes/types.ts`
    - `src/lib/fuentes/data.ts`

    Seguridad:
    - Usa `createAdminClient()` solo del lado servidor.
    - No expone service role al cliente.

23. Creé el route handler on-demand del drawer:
    - `src/app/api/fuentes/source/route.ts`

    Ejemplo verificado:

```bash
curl -s 'http://127.0.0.1:3001/api/fuentes/source?type=conferencia&sourceKey=la-baja-militar-en-el-ejercito.txt'
```

    Resultado:
    - Devuelve la fuente `La Baja Militar en el Ejército (Sin año)`.
    - `contentCount: 21`.
    - Subtipos: 5 testimonios, 6 explicaciones, 10 citas.
    - Incluye `title` y `body` reales.

24. Creé la página:
    - `src/app/[locale]/(dashboard)/fuentes/page.tsx`
    - `src/app/[locale]/(dashboard)/fuentes/components/fuentes-table.tsx`

    UI:
    - Título `Fuentes`.
    - Tabla con columnas:
      - Nombre de la fuente
      - Tipo
      - Año
      - Cantidad de contenidos
    - Tabs:
      - Todas
      - Conferencias
      - Libros
    - Drawer al click:
      - Nombre
      - Tipo
      - Año
      - Cantidad
      - Contenidos agrupados por subtipo y expandibles.

25. Agregué entrada al sidebar:
    - Grupo nuevo `Estudio`.
    - Item `Fuentes`.
    - Ícono `Library`.

26. Agregué i18n:
    - `messages/es.json`
    - `messages/en.json`

## Verificación Prompt 3

Página:
- `http://localhost:3001/es/fuentes`
- Con sesión activa muestra 667 fuentes reales.
- Sin sesión redirige a `/es/login`, por middleware.

Capturas:
- Tabla: `/Users/germangonzalez/Documents/Codex/2026-06-12/podes-saber-que-es-lo-que/outputs/fuentes-screenshots/fuentes-tabla.png`
- Drawer abierto: `/Users/germangonzalez/Documents/Codex/2026-06-12/podes-saber-que-es-lo-que/outputs/fuentes-screenshots/fuentes-drawer.png`

TypeScript:
- `./node_modules/.bin/tsc --noEmit --pretty false --incremental false` no mostró errores nuevos de Fuentes/DataTable.
- Persisten errores preexistentes en:
  - `src/app/[locale]/(dashboard)/tasks/components/data-table-toolbar.tsx`
  - `src/components/ui/chart.tsx`

## Corrección Prompt 3 - Fuentes son lecturas completas

27. Corregí la interpretación de Fuentes:
    - Fuentes no debe listar ni mostrar testimonios, citas, frases ni explicaciones.
    - Eso pertenece a otra sección.
    - Fuentes debe ser la biblioteca de lecturas completas.

28. Reemplacé el origen de datos de Fuentes:
    - Antes usaba `content_artifacts`, que contiene recortes derivados.
    - Ahora usa `study_materials`, que contiene las lecturas completas.

    Campos usados:
    - `id`
    - `source_filename`
    - `title_es`
    - `title_en`
    - `original_title`
    - `year`
    - `material_type`
    - `summary_es`
    - `summary_en`
    - `content_es`
    - `content_en`
    - `is_published`

29. Conteo real actual en `study_materials`:
    - 621 lecturas publicadas.
    - Todas tienen `material_type = lecture`.

30. Cambios de UI:
    - La tabla lista lecturas completas.
    - El drawer muestra:
      - Tipo
      - Año
      - Palabras
      - Título original
      - Archivo fuente
      - Resumen
      - Texto completo
    - Se eliminaron del drawer:
      - testimonios
      - citas
      - frases
      - explicaciones
      - agrupación por subtipo

31. Verificación:

```bash
curl -s 'http://127.0.0.1:3001/api/fuentes/source?sourceKey=b52ccb99-4266-45cb-b18f-44a1f9e5caeb'
```

Resultado:
- Devuelve la lectura `Soy llamado por tu nombre, oh Señor`.
- Incluye `fullText`.
- Incluye `wordCount`.
- No incluye testimonios/citas/frases.

## Prompt 6 - Narrador conectado con RAG

32. Creé el backend `POST /api/narrador`:
    - Archivo: `src/app/api/narrador/route.ts`.
    - Usa `embedQuery()` con el último mensaje del usuario.
    - Llama al RPC `match_content_artifacts` con `match_count: 5` sin filtro de subtipo.
    - Construye contexto recuperado con título, fuente y body recortado.
    - Usa NVIDIA NIM chat en streaming con el prompt completo del Narrador.

33. Creé la página interna:
    - Ruta: `/[locale]/narrador`.
    - Archivos:
      - `src/app/[locale]/(dashboard)/narrador/page.tsx`
      - `src/app/[locale]/(dashboard)/narrador/components/narrador-view.tsx`
    - UI tipo Coach, pero sin lista de conversaciones.
    - Historial en memoria.
    - Estado vacío con 4 chips.
    - Loading de 3 puntos.
    - Error amable con botón `Reintentar`.

34. Agregué navegación:
    - `src/components/app-sidebar.tsx`
    - Entrada `Narrador` en grupo `Apps`, debajo de `Coach`.
    - Ícono `Sparkles`.

35. Agregué i18n:
    - `messages/es.json`
    - `messages/en.json`

36. Ajuste de accesibilidad:
    - El par `bg-muted/text-muted-foreground` quedaba en 4.35:1 en light.
    - Dejé los chips con `bg-muted` y texto de mayor contraste.
    - Contraste verificado:
      - Dark: 14.5:1
      - Light: 18.16:1

## Verificación Prompt 6

TypeScript:
- `./node_modules/.bin/tsc --noEmit --pretty false --incremental false` pasó sin errores.

Backend:
- `POST http://127.0.0.1:3001/api/narrador` con `Narrame una escena para sentir seguridad`.
- Respondió una escena completa en streaming usando NVIDIA/RAG.

UI:
- `http://localhost:3001/es/narrador` carga con sesión en Chrome.
- Click en chip `Narrame una escena para sentir seguridad` generó escena completa.
- Texto libre `Quiero vivir la escena de mi nuevo trabajo` generó escena completa.

Capturas:
- Estado inicial dark: `/private/tmp/odiseo-narrador-dark-inicial.png`
- Estado inicial light: `/private/tmp/odiseo-narrador-light-inicial.png`
- Escena seguridad: `/private/tmp/odiseo-narrador-escena-seguridad.png`
- Escena trabajo: `/private/tmp/odiseo-narrador-escena-trabajo.png`
