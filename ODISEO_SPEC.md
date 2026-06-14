# ODISEO_SPEC.md — Estado del sistema (snapshot previo a ronda de correcciones)

> Este documento describe CÓMO ES HOY Odiseo v2 (`/Users/germangonzalez/odiseo-v2-base`,
> corre desde `nextjs-version/`), sección por sección: propósito, datos,
> comportamiento, y bugs/pendientes conocidos. Sirve como mapa para
> cualquier sesión nueva de Claude Code antes de aplicar correcciones.
> Después de la ronda de correcciones (Prompts A-H), este documento se
> actualiza para reflejar el estado corregido y pasa a ser la referencia
> de diseño permanente.

## 0. Qué es Odiseo (leer esto primero)

**Odiseo** es una app de práctica diaria basada en las enseñanzas de
**Neville Goddard** y la tradición de **New Thought** (Joseph Murphy, Emmet
Fox, Florence Scovel Shinn). El público es gente que practica la **Ley de
la Asunción**: la idea de que asumir el sentimiento de un deseo ya cumplido
("vivir desde el final") tiende a manifestarlo en la realidad.

Es el proyecto de **Germán González** (con **Taty Baldi** como
co-facilitadora de los talleres). Por eso existe un panel `/admin/...`
solo para Germán — él responde manualmente las solicitudes de plan de los
usuarios (no todo es automático con IA).

### Glosario rápido (términos que aparecen sin explicación en el resto del doc)

- **Ley de la Asunción**: asumir/sentir como ya real un deseo, hasta que se manifieste.
- **Vivir desde el final**: practicar la escena/sentimiento del deseo YA cumplido, en presente.
- **SATS** (State Akin to Sleep / Técnica del Estado Similar al Sueño): técnica de Neville para imaginar escenas en un estado relajado, casi dormido, donde la imaginación es más receptiva.
- **Revisión**: repasar el día e "reescribir" mentalmente lo que no salió como se quería, como si hubiera salido bien.
- **Autoconcepto**: la idea/identidad que una persona tiene de sí misma — cambiarla es central en la enseñanza intermedia.
- **Los 3 niveles** (usados en Testimonios, Talleres, Preguntas):
  1. **La Ley** (Nivel Práctico) — fundamentos, asunción, primeros pasos.
  2. **Despertar del Autoconcepto** (Nivel Intermedio) — identidad, creencias, "Yo soy".
  3. **La Promesa** (Nivel Místico/Avanzado) — interpretación bíblica simbólica, lo más profundo/espiritual.
- **Los 4 "maestros" de Coach**: Neville Goddard, Joseph Murphy, Emmet Fox, Florence Scovel Shinn — autores históricos de New Thought, cada uno con su propio estilo/voz (ver sección Coach).

### Cómo se conectan las secciones entre sí

```
Coach / Creador de escenas / Preguntas / Mensajes (plan aprobado)
                    │
                    │  "Guardar en Memoria" (botón en cada uno)
                    ▼
                 Memoria  ←──── es el archivo personal acumulado del usuario
                    │
                    │  "Nuevo capítulo desde Memoria" (compila con IA)
                    ▼
                Mi libro  ──── el objetivo final: "tu proceso interior
                               convertido en un libro propio"
```

Fuentes / Testimonios / Biblia metafísica / Preguntas son la
**biblioteca de referencia** (contenido fijo, 6.922 fragmentos +
621 lecturas completas) que alimenta TODO lo anterior vía RAG.

Planes / Mensajes es un circuito aparte: el usuario pide un plan
personalizado (formulario), Germán lo prepara a mano, y la respuesta
también puede terminar guardada en Memoria.

Talleres es contenido propio de Germán/Taty (no generado por IA),
incluido en la suscripción.

### Modelo de negocio (resumen)

Registro gratis (email/Google) → 3 usos gratis de las funciones "core"
(Coach, Creador de escenas, Mi libro, abrir una lectura completa) → al 4to
uso, pantalla de pago → $5/semana, $9/mes, $47/año.
(Detalle en sección "Paywall + Precios" más abajo — todavía no implementado.)

---

## Infraestructura general

- **Stack**: Next.js 15 (App Router, Turbopack), basado en shadcn-dashboard-landing-template.
- **i18n**: next-intl, locales `es` (default) y `en`, rutas `/[locale]/...`. Textos en `messages/es.json` / `messages/en.json`.
- **Backend**: Supabase proyecto "Anima" (ref `qitwckfwmgnmnmtjhfnf`) — EL MISMO que usaba el Odiseo viejo (`/Users/germangonzalez/anima`), mismos usuarios y datos.
  - `src/lib/supabase/client.ts` (browser, anon key)
  - `src/lib/supabase/server.ts` (server, cookies)
  - `src/lib/supabase/admin.ts` (service role, solo server)
- **IA**: NVIDIA NIM vía OpenAI SDK.
  - Embeddings: `nvidia/llama-nemotron-embed-1b-v2` (1024 dims) — `src/lib/nvidia.ts` → `embedQuery(text)`.
  - Chat: `meta/llama-3.3-70b-instruct`, streaming.
- **RAG**: tabla `content_artifacts` (6.922 filas: testimonios, citas bíblicas explicadas, frases, respuestas a preguntas — generadas una vez a partir de 606 conferencias/libros). RPC `match_content_artifacts(query_embedding, match_count, filter_subtype, filter_nivel, filter_tema)` con índice HNSW.
- **Auth**: Supabase Auth (`signInWithPassword`/`signUp`/`resetPasswordForEmail`), middleware compuesto con next-intl protege todo excepto landing/auth/errors. `profiles` tiene `id -> auth.users.id`.
- **`/api/health`**: devuelve `{ ok: true, artifacts: 6922 }`.

---

## Sidebar — estructura actual

```
Principal
  Inicio
Apps
  Coach
  Creador de escenas
  Mail        ⚠️ sin uso real todavía (iba a ser Mensajes — Prompt 7)
  Tasks       ⚠️ sin uso real todavía (iba a ser Notas — Prompt 7)
  Calendar    ⚠️ sin uso real todavía (iba a ser parte de Planes — Prompt 7)
  Users       ⚠️ debería estar borrado (Prompt A lo confirma)
Personal
  Memoria
  Mi libro
Estudio
  Fuentes
  Testimonios y casos
  Biblia metafísica
  Preguntas y respuestas
  Talleres
Pages
  Landing
  Auth (Login/Registro/Recuperar)
  Errores
  Configuración
  FAQs
```

⚠️ = el Prompt 7 (Planes/Mensajes/Notas) y el Prompt A (limpieza de
sidebar) todavía no se aplicaron sobre esta estructura — el sidebar de
arriba es el estado ANTES de esos prompts. Una vez aplicados, Mail→Mensajes,
Tasks→Notas, Calendar→(uso a confirmar), Users se borra, y Pages queda
solo con FAQs + Configuración.

---

## Inicio (`/[locale]/dashboard`)

**Propósito**: pantalla de bienvenida con resumen de actividad del usuario.

**Datos**: `daily_activity_events`, `memoria` (count), conteos de notas/planes una vez que Prompt 7 esté activo.

**Estado actual**:
- 4 cards arriba: "Días en práctica" / "Sesiones con Coach" / "Memorias guardadas" / "Entradas Diario" — **todos en 0** (placeholders, sin conectar a datos reales todavía).
- Gráfico "Actividad de práctica" y donut "Distribución por herramienta" — con datos de ejemplo, no reales.
- "Actividad reciente" — vacío/placeholder.
- "Más explorado" (5 temas) y "Progreso por nivel" (3 niveles con tabs) — estos SÍ pueden tener datos reales de `content_artifacts` (a confirmar).

**Pendiente**: conectar las 4 cards y "Actividad reciente" a datos reales (Memoria, Notas, Planes, Coach) — depende de que Prompt 7 y el fix de Memoria/Mi libro (Prompt C) estén funcionando.

---

## Coach (`/[locale]/coach`)

**Propósito**: conversación 1:1 con uno de 4 "maestros" de New Thought, con respuestas guiadas por RAG sobre el corpus de Odiseo.

**Datos**: `content_artifacts` vía `match_content_artifacts` (sin filtro de subtype, match_count: 5). `profiles` para nombre del usuario (pendiente).

**UI**:
- Panel izquierdo "Conversaciones": 4 autores con avatar de iniciales — Neville Goddard (NG, naranja), Joseph Murphy (JM, azul), Emmet Fox (EF, verde), Florence Scovel Shinn (FS, violeta).
- Panel derecho: chat con el autor seleccionado. Historial en memoria por autor (no persiste entre sesiones todavía).
- Input abajo: "Mensaje para [Nombre]...".

**Backend**: `POST /api/coach` — `embedQuery()` del último mensaje → `match_content_artifacts` → arma contexto (title/body recortado/fuente) → system prompt del autor (`src/lib/coach/prompts.ts`, 4 prompts completos escritos a mano, cada uno con voz/estilo propio: Neville en primera persona enseñando la Ley de la Asunción, Murphy con tono de oración científica, Fox con el "tratamiento" cristiano-metafísico, Florence con afirmaciones/decretos ingeniosos) → NVIDIA NIM streaming.

**⚠️ BUGS CONOCIDOS (Prompt B los corrige)**:
- El mensaje del usuario se renderiza roto: el texto aparece vertical, letra por letra, en una columna angosta a la derecha del chat.
- La respuesta del asistente tiene problemas de overflow/lectura.
- Si el usuario saluda ("hola"), el Coach responde con un párrafo larguísimo de enseñanza en vez de un saludo corto — y usa "hermano" como vocativo genérico (debería usar el nombre que el usuario eligió, una vez que exista `profiles.nombre_preferido`).
- No existe todavía el campo "¿con qué nombre te gustaría que te llamemos?" — pendiente en Settings → Perfil.

---

## Creador de escenas (`/[locale]/creador-de-escenas`, antes "Narrador")

**Propósito**: generar la narración inmersiva de UN INSTANTE (2-3 segundos) de una escena que representa el deseo cumplido del usuario, con detalle sensorial extremo — no una secuencia de pasos.

**Datos**: igual que Coach, `match_content_artifacts` sin filtro de subtype.

**UI**:
- Sin lista de conversaciones — panel único.
- Mensaje inicial del asistente (saludo + preguntas): "¿con quién estás en esta escena (nombre)?, ¿en qué lugar/espacio?, ¿qué clima/atmósfera?".
- Sin chips de sugerencia (se sacaron).
- Historial en memoria, loading de 3 puntos, error con "Reintentar".

**Backend**: `POST /api/narrador` — mismo patrón RAG que Coach, con `CREADOR_DE_ESCENAS_SYSTEM_PROMPT`: primer turno solo pregunta (si faltan datos), luego narra UN instante en segunda persona/presente, con sensaciones del cuerpo, del lugar, del clima, y un detalle de sonido/movimiento que ancla el momento. Respuesta larga pero sobre ESE instante, no una secuencia temporal.

**Estado**: implementado y verificado por el agente (contraste de UI revisado: 14.5:1 dark / 18.16:1 light). Si el modelo insiste en repreguntar ante respuestas vagas del usuario, ajustar regla ("si es el segundo mensaje del usuario, narrar igual con los datos disponibles") — a confirmar si pasa en la práctica.

---

## Fuentes (`/[locale]/fuentes`)

**Propósito**: biblioteca de las 621 conferencias/libros originales de Neville Goddard, en formato de lectura tipo libro.

**Datos**: `study_materials` (621 filas — NO `content_artifacts`).

**UI — listado**:
- Tabs: "Todas 621 / Conferencias 621 / Libros 0" ⚠️ — la clasificación Tipo está MAL, hay ~15 libros reales que no se están detectando (Prompt E lo investiga).
- Columnas actuales: Nombre de la fuente (título + extracto del cuerpo debajo ⚠️ debería ser solo título — Prompt E), Tipo, Año, Etiquetas (chips de temas/técnicas agregados desde `content_artifacts` por matching de `libros_citados`/`conferencias_citadas` — hoy NO son clicables/no filtran, y deben renombrarse a "Categorías" y convertirse en filtro desplegable — Prompt E). Año también debe ser filtro desplegable (Prompt E).
- Se sacó: "Palabras" (word count), "Personalizar columnas", botón "Upgrade to Pro".

**UI — detalle** (vista propia, con botón "← Volver a Fuentes"):
- Título grande centrado, metadata "Conferencia · [año]" + título original en inglés en cursiva debajo.
- Cuerpo del texto en columna angosta centrada (`max-w-2xl`/`3xl`), `leading-relaxed`, párrafos normalizados.
- Se sacó: nombre de archivo `.md`, conteo de palabras, sección "Resumen".

---

## Testimonios y casos (`/[locale]/testimonios`)

**Propósito**: 1.117 testimonios reales extraídos de las conferencias, mostrando cómo se aplicó la Ley de la Asunción en casos concretos.

**Datos**: `content_artifacts` filtrado `artifact_subtype = 'testimonial'`.

**UI actual**:
- Tabs: Todos / La Ley (Nivel Práctico) / Despertar del Autoconcepto (Nivel Intermedio) / La Promesa (Nivel Místico/Avanzado).
- Columnas: "Extracto" (⚠️ hoy muestra el CUERPO del testimonio, debería mostrar el TÍTULO — Prompt F) | Tema principal (⚠️ debería ser categoría simple de área de vida: dinero/amor/salud/etc — Prompt F) | Técnica | Nivel | Fuente.
- Búsqueda libre por texto (ilike), paginación server-side.
- Drawer actual: title + body completo + grilla de tags — ⚠️ "espanto" según feedback, se simplifica a cita + link a la fuente (Prompt F).

---

## Biblia metafísica (`/[locale]/biblia`)

**Propósito**: 1.085 citas bíblicas con la interpretación psicológica/metafísica de Neville Goddard.

**Datos**: `content_artifacts` filtrado `artifact_subtype = 'explanation'`.

**UI actual**:
- Columnas: Cita (title) | Tema | Símbolo | Fuente.
- Drawer: muestra "Explicación" + "Fuente" — ⚠️ NO muestra la CITA BÍBLICA completa (Prompt G). Tampoco está linkeada la fuente, y no hay buscador interno.

---

## Preguntas y respuestas (`/[locale]/preguntas`)

**Propósito** (según diseño original): el usuario escribe su inquietud, el sistema le ofrece preguntas de referencia parecidas (multiple choice), y al elegir una le muestra la respuesta completa.

**Datos**: `content_artifacts` filtrado `artifact_subtype = 'respuesta_pregunta'` (100 filas).

**Estado actual**: ⚠️ implementado como TABLA navegable de las 100 preguntas — esto NO es el diseño previsto. Falta implementar el flujo real:
1. Input "¿Qué te preguntás hoy?"
2. 4 `pregunta_original` como opciones clicables (resultado de `match_content_artifacts`)
3. Click en una → respuesta completa (`body`), estilo cita + link a fuentes citadas
4. "Ninguna de estas — buscar de nuevo"

(Prompt H implementa esto. La tabla completa puede quedar como tab secundario "Ver todas".)

---

## Talleres (`/[locale]/talleres`)

**Propósito**: 4 talleres × 8 lecciones, dictados por Germán González y Taty Baldi, incluidos en la suscripción.

**Datos**: estático (config en código) + tabla `talleres_progreso` (pendiente de crear si no existe — Prompt 8 original lo proponía).

**UI**:
- Grid de 4 cards: número, título, descripción, badge "8 lecciones", video Vimeo de presentación.
- Los 4 talleres: La Ley de la Asunción / Vivir desde el Final / Reescribir tu Autoconcepto / El Despertar de la Imaginación.
- Lecciones bloqueadas con ícono Lock + "Desbloquear con la suscripción".

**Estado**: implementado según spec original. Gating real por suscripción depende del Prompt 7.5 (paywall).

---

## Planes / Mensajes / Notas (Prompt 7 — revisado)

**Propósito**: modelo de "concierge" — el usuario pide un plan personalizado con un formulario, Germán lo prepara manualmente, el usuario lo recibe y aprueba.

### Planes (`/[locale]/planes`) — formulario
- Campos: deseo (textarea), nombre, nacionalidad, zona/ciudad, hora de despertar, hora de dormir, duración (7/15/30 días).
- Al enviar: guarda en `plan_solicitudes` (`status: 'pendiente'`) + intenta enviar email a Germán vía Resend (⚠️ sin `RESEND_API_KEY` configurada todavía — graceful degradation).
- Si ya hay una solicitud pendiente/aprobada, muestra el estado en vez del formulario.

### Mensajes (`/[locale]/mensajes`, recicla "Mail")
- Lista las `respuesta` de `plan_solicitudes` del usuario.
- Botón "Aprobar" → `status = 'aprobado'`.
- Una vez aprobado, el contenido de `respuesta` puede "Guardarse en Memoria" (origen `'plan'`).

### `/admin/plan-solicitudes`
- Solo accesible para Germán (chequeo por email hardcodeado).
- Lista solicitudes `pendiente` de TODOS los usuarios, con textarea para escribir la `respuesta`.

### Notas (`/[locale]/notas`, recicla "Tasks")
- CRUD simple: título + contenido + fecha, sin estados de tarea.
- Tabla `notas` (existe, con policy `notas_own_all` agregada).

### Telegram
- En Settings → Notificaciones: card "Recordatorios diarios por Telegram" con botón "Unirme al grupo" → link externo (`TELEGRAM_GROUP_URL`, placeholder hasta que Germán pase el link real).

**Estado**: investigación del Prompt 7 hecha y reconciliada con este modelo (tablas viejas `guided_plans`/`journal_entries` NO se usan). Fixes de schema aplicados. `plan_solicitudes` a crear. Implementación completa del flujo: estado a confirmar con el agente.

---

## Memoria (`/[locale]/memoria`)

**Propósito**: capa central reutilizable — cualquier contenido valioso generado en Coach, Creador de escenas, Preguntas o Mensajes (planes aprobados) se guarda acá con un botón, y desde acá alimenta Mi libro.

**Datos**: tabla `memoria` (YA EXISTÍA en el Supabase viejo — 6 filas con `item_type: 'book'` de antes, no tocar). Columnas: `id`, `user_id`, `item_type`, `title`, `content` (jsonb: `{text, meta}`), `source`, `status`, timestamps. Policy `memoria_own_all` agregada.

**Origen_tipo / `item_type` nuevos**: `'coach'`, `'narrador'`, `'pregunta'`, `'plan'`.

**UI**:
- Botón "Guardar en Memoria" (ícono Bookmark) en: mensajes de Coach, escenas de Creador de escenas, respuestas de Preguntas, y planes aprobados en Mensajes.
- Listado en `/memoria`: extracto + badge de origen + fecha, búsqueda, borrar con confirmación.
- Card "Memorias guardadas" de Inicio → count real.

**⚠️ BUG CONOCIDO (Prompt C)**: el botón "Guardar en Memoria" no está persistiendo nada — falla el insert (revisar policy de INSERT y mapeo de columnas).

---

## Mi libro (`/[locale]/mi-libro`)

**Propósito**: "convertir tu proceso interior en un libro propio" — el usuario compila capítulos a partir de lo guardado en Memoria (o escribe capítulos en blanco).

**Datos**: tabla `mi_libro_capitulos` (NO existía, SQL propuesto con RLS — a confirmar si se creó). Columnas: `id`, `user_id`, `titulo`, `contenido`, `orden`, `memorias_origen` (uuid[]), timestamps.

**UI**:
- Lista de capítulos, reordenables, editor de texto simple (textarea).
- "Nuevo capítulo desde Memoria": selecciona memorias → `POST /api/mi-libro/generar-capitulo` → NVIDIA NIM compila un borrador de capítulo en primera persona → usuario edita y guarda.

**⚠️ BUG CONOCIDO (Prompt C)**: `GET/POST /api/mi-libro` devuelve 500 — probablemente `mi_libro_capitulos` no existe o hay mismatch de columnas/tipos. A debuggear con el error real.

---

## Settings / Configuración (`/[locale]/configuracion` o similar)

**Sub-secciones**:
- **Perfil**: foto/avatar, nombre, email, bio. ⚠️ Falta agregar `nombre_preferido` ("¿con qué nombre te gustaría que te llamemos?") — Prompt B.
- **Suscripción**: estado (gratis/activa). Pendiente conectar con modelo de Prompt 7.5.
- **Apariencia**: tema (claro/oscuro/sistema) + idioma (ES/EN).
- **Notificaciones**: Telegram-link (ver arriba).

---

## Landing pública (`/[locale]/landing`)

**Propósito**: página de marketing, textos extraídos de la landing vieja de Odiseo (anima-sage.vercel.app).

**Secciones**: Hero / Stats / 4 pilares / Features / Talleres / Blog / FAQ / Footer.

**Detalle visual**: glow sutil del color de marca (`#E8401A`, opacidades 0.06-0.12) en 2-3 zonas del fondo, `pointer-events: none`, sin animación.

---

## Paywall + Precios (Prompt 7.5)

**Modelo**: registro gratis → 3 usos gratis → al 4to uso, paywall → planes $5/semana, $9/mes (badge "Más elegido"), $47/año (badge "Mejor precio").

**Estado**: ⚠️ NO IMPLEMENTADO todavía. Requiere tabla `user_usage` + columna de suscripción en `profiles`, helper `checkAccess(userId)`, modal de paywall, página `/precios`. Pasarela de pago: placeholder (sin definir).

---

## Pendiente general (Prompt 10, una vez aplicada la ronda A-H)

- Checklist funcional completa (todas las secciones, ES + EN, mobile).
- `pnpm build` sin errores (no solo dev).
- Deploy a proyecto Vercel nuevo (preview) — sin tocar `anima-sage.vercel.app` hasta aprobación explícita.
- Recién con el preview aprobado, considerar borrar `/Users/germangonzalez/anima` (código viejo) — sigue siendo referencia útil hasta entonces.
