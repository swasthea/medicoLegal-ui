export interface SidebarItem {
  label: string
  path: string
  icon?: string
}

export interface ModuleManifest {
  moduleId: string
  label: string
  basePath: string
  enabled: boolean
  roles: string[]
  sidebarItems: SidebarItem[]
}

export const APP_ROUTES = {
  root: '/medico-legal',
  dashboard: '/medico-legal',
  cases: '/medico-legal/cases',
  newCase: '/medico-legal/cases/new',
  caseDetail: '/medico-legal/cases/:id',
  mlr: '/medico-legal/mlr',
} as const

export const moduleManifest: ModuleManifest = {
  moduleId: 'medico-legal',
  label: 'Medico Legal',
  basePath: '/medico-legal',
  enabled: true,
  roles: [
    'admin',
    'doctor',
    'nurse',
    'medical_officer',
    'forensic_officer',
    'registrar',
    'medical_records_officer',
    'medical_superintendent',
    'department_hod',
    'auditor',
  ],
  sidebarItems: [
    { label: 'Dashboard', path: '/medico-legal', icon: 'LayoutDashboard' },
    { label: 'MLC cases', path: '/medico-legal/cases', icon: 'ClipboardList' },
    { label: 'New MLC case', path: '/medico-legal/cases/new', icon: 'Plus' },
    { label: 'MLR queue', path: '/medico-legal/mlr', icon: 'FileText' },
  ],
  // The shell reads sidebarItems as absolute paths. Keeping the URLs explicit
  // avoids a second route-composition layer in the host.

}

export const APP_MANIFEST = moduleManifest
