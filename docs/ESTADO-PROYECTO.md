# Estado del proyecto — Game Reviews

Documento de referencia sobre la configuración actual del proyecto, su arquitectura, dependencias y pendientes para considerarlo funcional en producción.

**Última revisión:** junio 2026  
**Versión del proyecto:** 0.1.0  
**Estado del build:** compila correctamente (`npm run build` ✓)

---

## 1. Resumen general

**Game Reviews** es un sitio de reseñas de videojuegos construido con **Next.js 16** (App Router), **React 19**, **TypeScript** y **Tailwind CSS v4**. El contenido vive en un archivo TypeScript estático (`data/reviews.ts`); no hay base de datos ni CMS.

### Rutas actuales

| Ruta | Tipo | Descripción |
|------|------|-------------|
| `/` | Estática | Página de inicio con título y descripción |
| `/reviews` | Estática | Listado de reseñas en grid |
| `/reviews/[slug]` | Dinámica (SSR) | Detalle de una reseña con Markdown renderizado |

### Flujo de navegación

```
Header (Home / Reseñas)
    │
    ├── / ........................ Landing simple
    ├── /reviews ................. Grid de ReviewCard
    └── /reviews/[slug] .......... Artículo en Markdown
```

---

## 2. Stack tecnológico

### Dependencias de producción

| Paquete | Versión | Uso |
|---------|---------|-----|
| `next` | 16.0.10 | Framework, routing, SSR/SSG |
| `react` / `react-dom` | 19.2.1 | UI |
| `react-markdown` | ^10.1.0 | Renderizado de contenido Markdown en detalle |
| `remark-gfm` | ^4.0.1 | Soporte GitHub Flavored Markdown (tablas, listas, etc.) |

### Dependencias de desarrollo

| Paquete | Versión | Uso |
|---------|---------|-----|
| `typescript` | ^5 | Tipado estático |
| `tailwindcss` | ^4 | Estilos utility-first |
| `@tailwindcss/postcss` | ^4 | Integración PostCSS con Tailwind v4 |
| `eslint` + `eslint-config-next` | ^9 / 16.0.10 | Linting |
| `@types/*` | varios | Tipos para Node, React |

### Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo (localhost:3000)
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # ESLint
```

---

## 3. Estructura del proyecto

```
game-reviews/
├── app/
│   ├── layout.tsx              # Layout raíz (Header, fuente Inter, metadata)
│   ├── page.tsx                # Home
│   ├── globals.css             # Import de Tailwind
│   └── reviews/
│       ├── page.tsx            # Listado
│       └── [slug]/page.tsx     # Detalle dinámico
├── components/
│   ├── header.tsx              # Navegación principal
│   ├── container.tsx           # Wrapper de ancho máximo
│   ├── reviewCard.tsx          # Tarjeta en el listado
│   └── ThemeToggle.tsx         # Toggle claro/oscuro (client component)
├── data/
│   └── reviews.ts              # Tipos + datos mock (2 reseñas)
├── public/                     # Assets estáticos (SVGs por defecto de Next)
├── tailwind.config.js          # darkMode: "class"
├── postcss.config.mjs          # Plugin @tailwindcss/postcss
├── next.config.ts              # Sin configuración personalizada
└── tsconfig.json               # Alias @/* → ./*
```

---

## 4. Componentes

### `Header` (`components/header.tsx`)

- Navegación con links a `/` y `/reviews` usando `next/link`.
- Incluye `ThemeToggle` para cambiar tema claro/oscuro.
- **Nota:** el toggle está fuera del `<nav>` y no hay layout flex que lo alinee a la derecha.

### `Container` (`components/container.tsx`)

- Wrapper reutilizable: `max-w-6xl mx-auto px-4 py-8`.
- Usado en Home y listado de reviews.

### `ReviewCard` (`components/reviewCard.tsx`)

- Muestra tipo, título, excerpt y géneros.
- Link a `/reviews/[slug]`.
- Estilo: tarjeta blanca con borde y hover shadow.

### `ThemeToggle` (`components/ThemeToggle.tsx`)

- Client component (`"use client"`).
- Persiste preferencia en `localStorage` bajo la clave `"theme"`.
- Alterna la clase `dark` en `<html>`.
- **Limitación:** el resto de la UI no aplica clases `dark:` de forma consistente (ver sección 7).

---

## 5. Páginas y lógica

### Layout raíz (`app/layout.tsx`)

- Idioma: `es`.
- Fuente: **Inter** via `next/font/google`.
- Metadata global: título "Game Reviews", descripción en español.
- Body con clases fijas: `bg-slate-100 text-gray-900` (sin variantes dark).

### Home (`app/page.tsx`)

- Página mínima: título + párrafo descriptivo.
- No enlaza al listado ni muestra reseñas destacadas.

### Listado (`app/reviews/page.tsx`)

- Importa el array `reviews` desde `data/reviews.ts`.
- Grid responsive: 1 → 2 → 3 columnas.
- Sin filtros, búsqueda ni paginación.

### Detalle (`app/reviews/[slug]/page.tsx`)

- Busca la reseña por `slug`; si no existe, llama a `notFound()`.
- `generateMetadata` para SEO por artículo (title, description, Open Graph).
- Contenido renderizado con `ReactMarkdown` + `remarkGfm`.
- Usa clases `prose prose-lg prose-gray` (requieren plugin de tipografía; ver pendientes).
- Layout propio con `max-w-3xl` (no usa `Container`).

---

## 6. Modelo de datos

Definido en `data/reviews.ts`:

```typescript
type Review = {
  id: string;
  title: string;
  excerpt: string;
  content: string;   // Markdown
  slug: string;
  type: "review" | "opinion" | "news";
  genres: string[];
};
```

**Datos actuales:** 2 entradas (`elden-ring`, `hades`).

**Campos ausentes** que suelen ser necesarios en un sitio de reseñas:

- Fecha de publicación
- Autor
- Puntuación / rating
- Imagen de portada (cover)
- Plataforma(s)
- Tiempo de lectura

---

## 7. Estilos y theming

### Tailwind CSS v4

- Entrada en `globals.css`: `@import "tailwindcss";`
- PostCSS configurado con `@tailwindcss/postcss`.
- Existe `tailwind.config.js` con `darkMode: "class"` y paths de content.

### Tema oscuro (incompleto)

| Elemento | Estado |
|----------|--------|
| `ThemeToggle` + localStorage | ✓ Implementado |
| Clase `dark` en `<html>` | ✓ Funciona |
| Estilos `dark:` en layout, cards, páginas | ✗ No aplicados |
| Body con colores fijos claros | ✗ Ignora el tema |

### Tipografía de artículos

La página de detalle usa utilidades `prose`, pero **no está instalado** `@tailwindcss/typography`. El Markdown se renderiza, pero sin los estilos tipográficos esperados.

---

## 8. Configuración de Next.js

`next.config.ts` está vacío (solo export default). Implicaciones:

- **Imágenes externas:** el Markdown de Elden Ring referencia una URL de PlayStation; sin `images.remotePatterns`, `next/image` no se usa y las imágenes en Markdown son `<img>` estándar (funcionan, pero sin optimización).
- **No hay** redirects, headers de seguridad, ni configuración de dominio.

### TypeScript

- `strict: true`
- Alias `@/*` definido en `tsconfig.json`, pero **no se usa** en los imports actuales (todos son rutas relativas).

### SEO

- Metadata básica en layout y páginas.
- Open Graph en detalle de review.
- **Faltan:** `sitemap.xml`, `robots.txt`, `favicon` personalizado, imagen OG por artículo.

---

## 9. Qué funciona hoy

- [x] Servidor de desarrollo y build de producción
- [x] Navegación entre Home, listado y detalle
- [x] Listado de reseñas con tarjetas
- [x] Páginas de detalle con Markdown (headings, listas, negrita, imágenes, links)
- [x] Metadata dinámica por slug
- [x] Manejo de slug inexistente (`notFound()`)
- [x] Tipado TypeScript del modelo `Review`
- [x] Grid responsive en listado

---

## 10. Pendientes para un proyecto funcional

Priorizados de mayor a menor impacto.

### Alta prioridad — experiencia core

1. **Completar dark mode**
   - Aplicar clases `dark:` en `layout.tsx`, `ReviewCard`, páginas y `Header`.
   - Quitar colores fijos del body o hacerlos dependientes del tema.

2. **Instalar `@tailwindcss/typography`**
   - Necesario para que `prose` estilice correctamente los artículos.

3. **Enriquecer la home**
   - Destacar últimas reseñas, CTA hacia `/reviews`, posible hero.

4. **Ampliar el modelo de datos**
   - Añadir `publishedAt`, `author`, `rating`, `coverImage` como mínimo.

5. **Más contenido o fuente de datos real**
   - Archivos `.md`/`.mdx` por reseña, o integración con CMS (Sanity, Contentful, etc.).

### Media prioridad — calidad y rendimiento

6. **`generateStaticParams`** en `/reviews/[slug]`
   - Hoy la ruta es dinámica (ƒ SSR). Con datos estáticos conviene pre-renderizar en build.

7. **Página `not-found.tsx` personalizada**
   - Mejor UX cuando el slug no existe.

8. **Filtros en `/reviews`**
   - Por `type` (review / opinion / news) y por `genres`.

9. **Imágenes optimizadas**
   - Componentes custom de Markdown con `next/image` y `remotePatterns` en config.

10. **Arreglar layout del Header**
    - Alinear navegación y `ThemeToggle` (flex, justify-between).

### Baja prioridad — producción y mantenimiento

11. **SEO completo:** `app/sitemap.ts`, `app/robots.ts`, favicon, OG images.
12. **README del proyecto** actualizado (sigue siendo el template de create-next-app).
13. **Usar alias `@/`** en imports para consistencia.
14. **Tests** (al menos smoke tests de rutas y render de reviews).
15. **CI/CD** (GitHub Actions: lint + build).
16. **Embeds** para URLs de YouTube en Markdown.
17. **Accesibilidad:** skip link, labels en botones, contraste en dark mode.
18. **Páginas dedicadas** para opiniones/noticias si se separan del listado general.

---

## 11. Deuda técnica menor

- `ThemeToggle` puede provocar flash de tema incorrecto (FOUC) al cargar; conviene script inline en layout o `next-themes`.
- Inconsistencia: listado usa `Container`, detalle usa `<main>` con clases propias.
- Nomenclatura mixta: archivos en camelCase (`reviewCard.tsx`) vs convención común kebab-case/PascalCase en Next.
- Solo 2 reseñas de ejemplo; difícil validar paginación, filtros o búsqueda.
- Sin variables de entorno (`.env`); no hay secrets ni config externa por ahora.

---

## 12. Cómo ejecutar localmente

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev
# → http://localhost:3000

# Verificar producción
npm run build
npm run start
```

---

## 13. Conclusión

El proyecto tiene una **base sólida y funcional** para un MVP: routing, listado, detalle con Markdown y build exitoso. Para considerarlo **listo para usuarios reales**, los gaps más importantes son:

1. Theming oscuro coherente en toda la UI  
2. Estilos tipográficos en artículos (`@tailwindcss/typography`)  
3. Home con contenido útil y modelo de datos más completo  
4. Fuente de contenido escalable (MDX o CMS)  
5. SEO, páginas de error y pre-renderizado estático de reviews  

Con esos puntos cubiertos, el sitio pasaría de prototipo navegable a producto publicable.
