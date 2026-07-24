export const ADMIN_PERMISSION_DEFINITIONS = [
  { key: "dashboard", label: "Dashboard", description: "Indicadores e visão geral." },
  { key: "tributes", label: "Homenagens", description: "Visualizar e administrar homenagens." },
  { key: "clients", label: "Clientes", description: "Consultar clientes e históricos." },
  { key: "payments", label: "Pagamentos", description: "Acessar pagamentos e financeiro geral." },
  { key: "plans", label: "Planos", description: "Alterar planos e preços." },
  { key: "analytics", label: "Analytics", description: "Acessar métricas e relatórios." },
  { key: "coupons", label: "Cupons", description: "Criar e administrar cupons." },
  { key: "pets", label: "Eterniza Pets", description: "Administrar clínicas e experiências." },
  { key: "support", label: "Atendimentos", description: "Responder e encerrar chamados." },
  { key: "staff", label: "Usuários do painel", description: "Criar acessos e definir permissões." },
  { key: "petsFinance", label: "Financeiro Pets", description: "Faturas, recebimentos e recibos." },
  { key: "settings", label: "Configurações", description: "Alterar configurações do sistema." },
];

const ALL = Object.fromEntries(ADMIN_PERMISSION_DEFINITIONS.map(({ key }) => [key, true]));

export const ADMIN_LEVEL_DEFAULTS = {
  SUPER_ADMIN: { ...ALL },
  ADMIN: {
    dashboard: true, tributes: true, clients: true, payments: true,
    plans: true, analytics: true, coupons: true, pets: true,
    support: true, staff: false, petsFinance: true, settings: false,
  },
  ATTENDANT: {
    dashboard: false, tributes: false, clients: false, payments: false,
    plans: false, analytics: false, coupons: false, pets: false,
    support: true, staff: false, petsFinance: false, settings: false,
  },
};

export function getAdminLevel(user) {
  if (!user || String(user.role).toUpperCase() !== "ADMIN") return null;
  return String(user.permissions?.adminLevel || "SUPER_ADMIN").toUpperCase();
}

export function getAdminPermissions(user) {
  const level = getAdminLevel(user);
  if (!level) return {};
  if (level === "SUPER_ADMIN") return { ...ALL };
  return { ...(ADMIN_LEVEL_DEFAULTS[level] || ADMIN_LEVEL_DEFAULTS.ADMIN), ...(user.permissions?.modules || {}) };
}

export function hasAdminPermission(user, permission) {
  const level = getAdminLevel(user);
  if (!level) return false;
  if (level === "SUPER_ADMIN") return true;
  return getAdminPermissions(user)[permission] === true;
}

export function normalizeAdminModules(level, modules) {
  const normalizedLevel = String(level || "ADMIN").toUpperCase();
  const base = ADMIN_LEVEL_DEFAULTS[normalizedLevel] || ADMIN_LEVEL_DEFAULTS.ADMIN;
  const result = {};
  for (const { key } of ADMIN_PERMISSION_DEFINITIONS) {
    result[key] = modules?.[key] === undefined ? Boolean(base[key]) : Boolean(modules[key]);
  }
  if (normalizedLevel === "SUPER_ADMIN") return { ...ALL };
  return result;
}

export function hasAnyAdminPermission(user, permissions = []) {
  return permissions.some((permission) => hasAdminPermission(user, permission));
}
