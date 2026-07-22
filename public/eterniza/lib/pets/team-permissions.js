export const TEAM_PERMISSION_KEYS = [
  "experiences.view",
  "experiences.create",
  "experiences.edit",
  "experiences.publish",
  "experiences.delete",
  "team.view",
  "team.manage",
  "reports.view",
  "settings.view",
  "settings.manage",
];

export const DEFAULT_STAFF_PERMISSIONS = {
  experiences: {
    view: true,
    create: true,
    edit: true,
    publish: true,
    delete: false,
  },
  team: { view: false, manage: false },
  reports: { view: false },
  settings: { view: false, manage: false },
};

export const MANAGER_PERMISSIONS = {
  experiences: {
    view: true,
    create: true,
    edit: true,
    publish: true,
    delete: true,
  },
  team: { view: true, manage: true },
  reports: { view: true },
  settings: { view: true, manage: true },
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function normalizePermissions(value, role = "CLINIC_STAFF") {
  const base = role === "CLINIC_MANAGER" ? clone(MANAGER_PERMISSIONS) : clone(DEFAULT_STAFF_PERMISSIONS);
  if (!value || typeof value !== "object" || Array.isArray(value)) return base;

  for (const key of TEAM_PERMISSION_KEYS) {
    const [group, action] = key.split(".");
    if (typeof value?.[group]?.[action] === "boolean") {
      base[group][action] = value[group][action];
    }
  }

  if (role === "CLINIC_MANAGER") return clone(MANAGER_PERMISSIONS);
  return base;
}

export function hasPermission(user, key) {
  if (!user) return false;
  if (String(user.role) === "CLINIC_MANAGER") return true;
  const [group, action] = String(key || "").split(".");
  const permissions = normalizePermissions(user.permissions, user.role);
  return Boolean(permissions?.[group]?.[action]);
}
