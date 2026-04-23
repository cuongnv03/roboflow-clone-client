# roboflow-clone-client

Vue 3 frontend for the Roboflow Clone — a computer vision data management platform. Supports image upload, canvas-based annotation (bbox, polygon, keypoint), dataset version management, and multi-format export.

**Stack:** Vue 3 · Vite · TypeScript · Pinia · Tailwind CSS · Vue Router

---

## Setup

```bash
npm install
```

Create `.env.development` (or `.env.local`):

```env
VITE_API_URL=http://localhost:5000/api/v1
```

For production (e.g. Vercel), set `VITE_API_URL` to the deployed backend URL.

---

## Commands

```bash
npm run dev          # Vite dev server → http://localhost:5173
npm run build        # type-check + build → dist/
npm run type-check   # vue-tsc only (no emit)
npm run lint         # eslint --fix
npm run format       # prettier --write src/
```

---

## Architecture

```text
src/
├── pages/           # Route-level views (LoginPage, ProjectsPage, AnnotatePage, DatasetsPage, …)
├── components/      # Feature components grouped by domain (annotation/, datasets/, upload/, …)
├── stores/          # Pinia stores: auth, project, image, annotation, dataset
├── services/        # Axios wrappers (one file per domain, all use VITE_API_URL as baseURL)
├── composables/     # Shared logic: useToast, useAnnotationShortcuts
├── router/          # Vue Router — auth guard redirects to /login on 401
└── layouts/         # DefaultLayout, ProjectLayout (sidebar), AuthLayout
```

**Auth:** JWT stored in `localStorage` under key `token`. The axios interceptor in `main.ts` clears storage and redirects to `/login` on 401.

**Canvas annotation:** `AnnotationCanvas.vue` uses four stacked `<canvas>` layers (image, annotation, brush, drawing). Annotation state (including undo/redo history) lives in the `annotation` Pinia store. Keyboard shortcuts are managed by `useAnnotationShortcuts`.

**Toast notifications:** Global singleton via `useToast` composable. The `Notification` component is mounted once in `App.vue` and driven by reactive state — any component can call `toast.success()`, `toast.error()`, etc. without props.

---

## Running with Docker

See the [server repository](https://github.com/cuongnv03/roboflow-clone-server)'s README for the full Docker Compose setup, which starts both frontend and backend together.
