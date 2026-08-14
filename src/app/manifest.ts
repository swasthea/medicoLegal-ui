export interface ModuleManifest {
  moduleId: string;
  label: string;
  basePath: string;
  icon: string;
  sidebarItems: SidebarItem[];
}

export interface SidebarItem {
  label: string;
  path: string;
  icon: string;
}

export const APP_ROUTES = {
  ROOT: "/medico-legal",
  DASHBOARD: "/medico-legal/dashboard",
} as const;

export const moduleManifest: ModuleManifest = {
  moduleId: "medico-legal",
  label: "Medico Legal",
  basePath: "/medico-legal",
  icon: "Scale",
  sidebarItems: [
    { label: "Dashboard", path: "/medico-legal/dashboard", icon: "LayoutDashboard" },
  ],
};

// Shell looks for this exact export name
export { moduleManifest as APP_MANIFEST };
