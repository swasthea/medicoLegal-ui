import React, { Suspense, lazy } from 'react'
import type { RouteObject } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import { Providers } from '@/app/providers'

const DashboardPage = lazy(() => import('@/pages/MlcDashboardPage').then((module) => ({ default: module.MlcDashboardPage })))
const MlcListPage = lazy(() => import('@/pages/MlcListPage').then((module) => ({ default: module.MlcListPage })))
const NewMlcCasePage = lazy(() => import('@/pages/NewMlcCasePage').then((module) => ({ default: module.NewMlcCasePage })))
const MlcCaseDetailPage = lazy(() => import('@/pages/MlcCaseDetailPage').then((module) => ({ default: module.MlcCaseDetailPage })))
const MlrListPage = lazy(() => import('@/pages/MlrListPage').then((module) => ({ default: module.MlrListPage })))

const wrap = (element: React.ReactNode) => <Providers><Suspense fallback={null}>{element}</Suspense></Providers>

/** Paths are relative to the host mount point (/medico-legal). */
export const medicoLegalRoutes: RouteObject[] = [
  { path: '', element: wrap(<DashboardPage />) },
  { path: 'dashboard', element: wrap(<DashboardPage />) },
  { path: 'cases', element: wrap(<MlcListPage />) },
  { path: 'cases/new', element: wrap(<NewMlcCasePage />) },
  { path: 'cases/:id', element: wrap(<MlcCaseDetailPage />) },
  { path: 'mlr', element: wrap(<MlrListPage />) },
  { path: '*', element: <Navigate to="" replace /> },
]

export default medicoLegalRoutes
