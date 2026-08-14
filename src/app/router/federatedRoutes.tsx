import React, { Suspense, lazy } from "react";
import type { RouteObject } from "react-router-dom";

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------
import { Providers } from "@/app/providers";

// ---------------------------------------------------------------------------
// Pages (lazy-loaded)
// ---------------------------------------------------------------------------
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));

// ---------------------------------------------------------------------------
// Wrap helper — Providers + Suspense around each route element
// ---------------------------------------------------------------------------
const wrap = (el: React.ReactNode) => (
  <Providers>
    <Suspense fallback={null}>{el}</Suspense>
  </Providers>
);

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
export const medicoLegalRoutes: RouteObject[] = [
  {
    path: "/medico-legal",
    children: [
      { index: true, element: wrap(<DashboardPage />) },
      { path: "dashboard", element: wrap(<DashboardPage />) },
    ],
  },
];

export default medicoLegalRoutes;
