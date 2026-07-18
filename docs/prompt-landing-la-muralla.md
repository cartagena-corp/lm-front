# Prompt — Landing page de "La Muralla" (Next.js)

## 0. Contexto del proyecto (léelo antes de empezar)

- **Producto:** "La Muralla", una webapp de gestión de trabajo por tableros kanban e incidencias, construida en **Next.js**.
- **Dominio de producción:** `cartagenacorporation.com`.
- **Situación actual y objetivo:** hoy existe una landing page, pero vive en **un proyecto aparte hecho en Astro**. El objetivo de esta tarea es **reconstruir esa landing dentro del repositorio de Next.js** para poder **prescindir por completo del proyecto de Astro** y mantener todo en un solo repositorio. La nueva landing debe quedar **íntegramente en Next.js (App Router)**.
- **Backend del calendario (ya existe, pero se integra en OTRA sesión):** ya cuento con el backend del calendario. Devuelve todas las sesiones ya agendadas y expone endpoints para agendar en **Google Calendar** y **Google Meet**. **La conexión real con esos endpoints NO es parte de esta tarea**; se trabajará en una sesión posterior. Por ahora:
  - Construye **solo el front** de la sección de agendado.
  - Déjalo **preparado para consumir ese backend después** (estructura los datos y las llamadas de forma que enchufar los endpoints reales sea trivial).
  - Usa **datos mock / placeholder** para las sesiones ocupadas y para el envío del formulario.
  - Asume explícitamente que **esta parte estará sujeta a cambios**.
- **Internacionalización (i18n):** manéjala mediante **rutas `/es` y `/en`** (subdirectorios por idioma). Español e inglés. Persiste la preferencia del usuario (localStorage o cookie) para recordar el idioma y redirigir, pero **el idioma efectivo lo determina la ruta** (`/es`, `/en`).

---

## 1. Tarea

### Paso 1 — Análisis previo (no lo omitas)
Analiza **absolutamente todo el proyecto** de La Muralla antes de escribir código: todas sus funcionalidades, sus estilos CSS, su UX/UI y su **design system**. Necesito que **entiendas "La Muralla"** (qué hace, cómo se ve, qué patrones y componentes ya existen) para que la landing sea **coherente con el producto**. En particular, revisa la vista `/login` para replicar el mecanismo del texto rotante que se usa ahí (ver HERO).

### Paso 2 — Construcción
Crea una **landing page en el path principal `/`** (con sus variantes `/es` y `/en`, ver sección de i18n) con las secciones descritas abajo. Debe incluir **header** y **footer**. Reutiliza el **design system, los tokens de estilo y los componentes existentes** de La Muralla en toda la landing.

---

## 2. Secciones de la landing

### 2.1. Header
- Enlaces de navegación a las secciones de la propia landing (anclas a HERO, línea de tiempo, historias de clientes, solicitar demo).
- **Botón de i18n** (selector de idioma **Español** / **Inglés**). Cambia entre las rutas `/es` y `/en` y persiste la preferencia (localStorage/cookie).
- Botón **"Iniciar sesión"**.
- Botón **"Solicitar demo"**.

### 2.2. HERO
- Un **texto que cambie a cada rato** (mismo mecanismo que ya se usa en `/login`, pero con **texto diferente**). El texto debe dejar claro **al primer vistazo**:
  1. **qué es** La Muralla,
  2. **para qué se usa**, y
  3. **en qué momento** el usuario podría usarla.
- Al final de ese texto, un botón con el texto **"Solicitar Demo"**.
- Además del texto, en **esta misma sección**, incluye una **"demo" de la vista kanban** que funcione de verdad:
  - Persistiendo el estado en **SessionStorage**, el usuario puede **crear una issue** con **título**, **descripción** y una **imagen**.
  - Luego puede **arrastrar la issue de un estado a otro** (drag & drop entre columnas).

### 2.3. "Línea de tiempo" de cómo usar La Muralla
- Muestra los **pasos** para usar "La Muralla".
- Cada paso incluye: una **imagen o un componente que represente ese paso**, el **título del paso** y su **descripción**.
- Ejemplo del formato:
  1. `[imagen o componente que representa la creación de un tablero]` → **"Crea un Tablero"** → *"Organiza tu flujo de trabajo en tableros y define sus incidencias…"*.

### 2.4. Customer Story Carousel
- Un **carousel en constante movimiento** con **pequeñas historias de usuarios** que han usado La Muralla.
- **Imágenes** de cada cliente: pueden salir de `thispersondoesnotexist.com`.
- **Nombres:** pueden ser inventados, pero deben ser **nombres latinos**.
- **Texto de cada historia:** puede contar lo bueno que es usar **funcionalidades específicas y concretas** de "La Muralla".
- El carousel debe poder **moverse entre las historias arrastrando** (drag).

### 2.5. Solicitar demo (calendario + modales)
El usuario debe poder **seleccionar un horario (fecha y hora)** para agendar una sesión de **media hora** en **Google Meet**.

- Muestra un **calendario** parecido al de Google Calendar, pero con los **estilos CSS propios de La Muralla**.
- El usuario ve la **semana actual** y **todas las sesiones ya agendadas**. En esos **espacios ocupados, no puede agendar**.
- Al pasar el cursor por una **franja libre** (sin sesiones), aparece un **botón interlineado / outline** que indica **"Agendar demo"**.
- Al pulsar ese botón, se abre un **modal** que pide los datos del usuario:
  - **Nombre completo**
  - **Empresa**
  - **Correo electrónico**
  - **Teléfono**
  - **Textarea** para un **comentario opcional** (máximo **500 caracteres**).
  - Botones: **Cerrar** (outline) y **Confirmar** (primary).
- Al pulsar **Confirmar**, aparece **por encima del modal anterior** un **segundo modal de confirmación** que le da a entender que:
  - al agendar una demo, **está dando su consentimiento para el tratamiento de datos personales**, y
  - se **agendará una sesión al correo** escrito en el formulario.
  - Botones: **Volver** (outline) y **Aceptar** (primary).
- Recuerda: el **cableado real con el backend/endpoints de Google Calendar y Meet queda para otra sesión**. Aquí solo el front, con datos mock y preparado para conectarse después.

### 2.6. Footer
- Footer completo, coherente con el design system de La Muralla, con enlaces útiles (secciones de la landing, iniciar sesión, solicitar demo, y lo que corresponda a la marca / Cartagena Corporation).

---

## 3. Internacionalización (i18n)
- Implementa i18n con **rutas por idioma: `/es` y `/en`** (subdirectorios).
- Idiomas: **Español** e **Inglés**. Traduce **de verdad** todos los textos visibles y también los metadatos (title, description, Open Graph) por idioma; no dejes textos sin traducir ni mezcles idiomas en una misma página.
- El **selector de idioma del header** alterna entre `/es` y `/en` y **persiste la preferencia** (localStorage o cookie) para recordarla y redirigir en visitas futuras.
- La ruta raíz `/` debe **redirigir** al idioma adecuado (según preferencia guardada o `Accept-Language`), con **español (`/es`) como idioma por defecto**.

---

## 4. SEO y posicionamiento web (OBLIGATORIO)

Implementa las **mejores prácticas y las más actualizadas** de SEO técnico, on-page, datos estructurados, Core Web Vitals, SEO internacional y **GEO** (visibilidad en buscadores con IA). Todo aplicado al stack de **Next.js (App Router)**. Sigue una metodología profesional (technical → on-page → structured data → Core Web Vitals → contenido → GEO → internacional) y traduce cada recomendación en **archivos, etiquetas o configuración concretos**.

### 4.1. SEO técnico (cimientos)
- Genera los metadatos con la **Metadata API de Next.js** (`export const metadata` o `generateMetadata` por ruta y por idioma). **No** pongas `<title>` manual en el JSX. Los metadatos deben salir en el **HTML inicial (server-rendered)**, no inyectarse solo en cliente.
- **`app/sitemap.ts`**: incluye solo URLs canónicas, indexables y 200 (las variantes `/es` y `/en`).
- **`app/robots.ts`**: **no** bloquees CSS/JS que Google necesita para renderizar; referencia el sitemap.
- **Canonical autoreferencial** por página e idioma, con URLs absolutas sobre `cartagenacorporation.com`.
- Estados HTTP correctos (la raíz `/` redirige con 307/308 según corresponda; 404 real). Verifica que **no quede ningún `noindex` accidental** en producción.

### 4.2. On-page
- **Title:** 50-60 caracteres, keyword principal al inicio, marca ("La Muralla") al final, único por página/idioma.
- **Meta description:** 140-160 caracteres, con propuesta de valor y llamada a la acción.
- **Un solo `<h1>`** por página que refleje claramente **qué es La Muralla**; jerarquía **H2/H3 lógica** (por ejemplo, un H2 por sección de la landing).
- **URLs** limpias, descriptivas, en minúsculas y con guiones.
- **Enlazado interno** con anchor text descriptivo entre secciones/páginas.
- **Imágenes:** `alt` descriptivo, formatos modernos (**WebP/AVIF**), `width`/`height` para evitar CLS, `loading="lazy"` salvo la imagen LCP. Usa **`next/image`** y **`next/font`**.

### 4.3. Datos estructurados (JSON-LD)
- Inyecta **JSON-LD** con `<script type="application/ld+json">` (componente `Script` o `dangerouslySetInnerHTML`). El markup debe reflejar **contenido visible** en la página.
- Tipos recomendados para esta landing:
  - **`Organization`** (Cartagena Corporation).
  - **`WebSite`** (+ `SearchAction` si aplica).
  - **`SoftwareApplication`** (o `Product`) describiendo La Muralla como herramienta de gestión de proyectos / kanban.
  - **`FAQPage`** si añades una sección de preguntas frecuentes, y **`BreadcrumbList`** si aplica.
- **Valida** siempre con el Rich Results Test antes de dar por cerrado.

### 4.4. Core Web Vitals y rendimiento (LCP < 2.5s · INP < 200ms · CLS < 0.1)
- El HERO trae un **demo kanban interactivo**, la landing tiene un **carousel arrastrable** y un **calendario**: son componentes pesados. Cárgalos con **`dynamic import` / hidratación diferida** (`next/dynamic`) para no penalizar INP/LCP; hidrata solo lo imprescindible.
- **Reserva dimensiones** para todas las imágenes (incluidas las de `thispersondoesnotexist.com`) para evitar **CLS**.
- Optimiza la imagen del **hero** (prioridad/`preload`). Usa `font-display: swap`.
- Aprovecha **Server Components** por defecto y trocea el JS del cliente.

### 4.5. SEO internacional (hreflang)
- Como usas subdirectorios `/es` y `/en`, declara **hreflang recíproco** (`es`, `en`) **+ `x-default`**, con **URLs absolutas** del dominio.
- Impleméntalo con `alternates.languages` de la Metadata API (cada versión declara todas las alternativas, incluida a sí misma).

### 4.6. GEO / AI Search (visibilidad en buscadores con IA)
- Haz el contenido **citable y estructurado**: incluye una **respuesta directa** a "¿qué es La Muralla?" cerca del H1 (2-3 frases claras).
- Considera una **sección FAQ** con estructura **pregunta-respuesta** + schema `FAQPage`.
- Añade un **`/llms.txt`** en la raíz como complemento de bajo coste (enlaces a las páginas/recursos clave). Trátalo como complemento, no como reemplazo del SEO técnico.

### 4.7. Reglas de oro (qué NO hacer)
- Nada de **keyword stuffing**, **cloaking**, **texto oculto** ni **doorway pages**.
- **No** marques con datos estructurados contenido que **no esté visible**.
- **No** prometas posiciones garantizadas: el SEO es probabilístico y se mide en semanas.

---

## 5. Requisitos transversales
- **Coherencia visual:** aplica el **design system, tokens y componentes existentes** de La Muralla en toda la landing (colores, tipografía, espaciados, botones outline/primary, modales, etc.).
- **Accesibilidad:** HTML semántico, `alt` en imágenes, roles/aria en modales y controles interactivos (ayuda además al SEO y al GEO).
- **Todo en el repo de Next.js:** el resultado debe permitir **retirar el proyecto de Astro**.

## 6. Verificación al terminar
Deja: (1) un resumen priorizado de lo implementado, (2) la lista de archivos creados/modificados, y (3) un checklist post-deploy (validar datos estructurados en el Rich Results Test, enviar el sitemap en Search Console, revisar Core Web Vitals, comprobar hreflang recíproco). Recuerda dejar la sección de agendado **preparada para conectar el backend real en la próxima sesión**.
