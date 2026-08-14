# medicoLegal-ui
HMIS Medico Legal Module — Vite + React micro-frontend

## Stack
- **Vite 7** + **React 19** + **TypeScript 5**
- **Tailwind CSS v4** (OKLCH color system)
- **@originjs/vite-plugin-federation 1.3.6** — Module Federation
- **TanStack Query 5** · **Zustand 5** · **React Router 7**

---

## Design System / Theme

Uses the shared HMIS OKLCH color palette defined in `src/app/styles/index.css`.

### Fonts
```css
/* Plus Jakarta Sans — primary UI */
/* DM Sans — secondary/body */
/* JetBrains Mono — code/monospace */
```
Load via Google Fonts in `index.html`.

### OKLCH Tokens
```css
:root {
  /* Primary */
  --color-primary:        oklch(0.511 0.262 276.966);
  --color-primary-light:  oklch(0.932 0.032 255.585);
  --color-primary-dark:   oklch(0.424 0.199 265.638);

  /* Surface */
  --color-surface:        oklch(1.000 0.000 0);
  --color-surface-muted:  oklch(0.967 0.003 264.532);
  --color-surface-subtle: oklch(0.985 0.002 247.839);

  /* Text */
  --color-text-primary:   oklch(0.141 0.005 285.823);
  --color-text-secondary: oklch(0.446 0.030 256.802);
  --color-text-muted:     oklch(0.707 0.022 261.325);

  /* Semantic */
  --color-success:        oklch(0.723 0.219 149.579);
  --color-warning:        oklch(0.795 0.184 86.047);
  --color-error:          oklch(0.577 0.245 27.325);
  --color-info:           oklch(0.623 0.214 259.815);

  /* Sidebar */
  --sidebar-width:        16rem;
  --sidebar-collapsed:    4rem;
}
```

---

## Module Federation Setup

### `vite.config.ts`
```typescript
import federation from "@originjs/vite-plugin-federation";

federation({
  name: "medicoLegalUI",          // unique name for this remote
  filename: "remoteEntry.js",
  exposes: {
    "./routes":   "./src/app/router/federatedRoutes.tsx",
    "./manifest": "./src/app/manifest.ts",
  },
  shared: {
    react:              { requiredVersion: "^19.2.0" },
    "react-dom":        { requiredVersion: "^19.2.0" },
    "react-router-dom": { requiredVersion: "^7.13.1" },
    zustand:            { requiredVersion: "^5.0.11" },
    "@tanstack/react-query": { requiredVersion: "^5.90.21" },
  },
})
```

### `src/app/manifest.ts`
The shell (`web-ui`) discovers modules via `manifest.ts`. Export shape must match `ModuleManifest`:
```typescript
export const moduleManifest = {
  moduleId:     "medico-legal",
  label:        "Medico Legal",
  basePath:     "/medico-legal",
  icon:         "Scale",          // lucide-react icon name
  sidebarItems: [],               // populate as pages are built
}
```

### `src/app/router/federatedRoutes.tsx`
Export `medicoLegalRoutes` (array of `RouteObject`) and default-export the same.

---

## Getting Started
```bash
pnpm install
pnpm dev          # runs on port 5176
pnpm build
```

## Port
`5176` — chosen to avoid collision with other HMIS micro-frontends:
- 5173 web-ui  · 5174 admin-ui  · 5175 emergency-ui  · **5176 medicoLegal-ui**
