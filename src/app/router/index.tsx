import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Providers } from '@/app/providers'
import { MlcCaseDetailPage } from '@/pages/MlcCaseDetailPage'
import { MlcDashboardPage } from '@/pages/MlcDashboardPage'
import { MlcListPage } from '@/pages/MlcListPage'
import { MlrListPage } from '@/pages/MlrListPage'
import { NewMlcCasePage } from '@/pages/NewMlcCasePage'

export function AppRouter() {
  return <Providers><BrowserRouter><Routes>
    <Route path="/" element={<Navigate to="/medico-legal" replace />} />
    <Route path="/medico-legal" element={<MlcDashboardPage />} />
    <Route path="/medico-legal/dashboard" element={<MlcDashboardPage />} />
    <Route path="/medico-legal/cases" element={<MlcListPage />} />
    <Route path="/medico-legal/cases/new" element={<NewMlcCasePage />} />
    <Route path="/medico-legal/cases/:id" element={<MlcCaseDetailPage />} />
    <Route path="/medico-legal/mlr" element={<MlrListPage />} />
    <Route path="*" element={<Navigate to="/medico-legal" replace />} />
  </Routes></BrowserRouter></Providers>
}
