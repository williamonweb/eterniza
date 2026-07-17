import { getCurrentUser } from "../auth";
import { prisma } from "../prisma";
import { hasPermission, normalizePermissions } from "./team-permissions";

export async function getClinicTeamContext(requiredPermission = "team.view") {
  const current = await getCurrentUser();
  if (!current?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: current.id },
    include: { clinic: true },
  });

  if (
    !user ||
    user.isActive === false ||
    !["CLINIC_MANAGER", "CLINIC_STAFF"].includes(String(user.role)) ||
    user.clinic?.status !== "APPROVED"
  ) {
    return null;
  }

  user.permissions = normalizePermissions(user.permissions, user.role);
  if (requiredPermission && !hasPermission(user, requiredPermission)) return null;

  return { user, clinic: user.clinic };
}

export function serializeTeamMember(member) {
  return {
    id: member.id,
    name: member.name,
    email: member.email,
    phone: member.phone || "",
    role: member.role,
    clinicTitle: member.clinicTitle || "",
    notes: member.notes || "",
    isActive: member.isActive !== false,
    permissions: normalizePermissions(member.permissions, member.role),
    lastLoginAt: member.lastLoginAt,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
  };
}

export function cleanPhone(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 11);
}

export function cleanEmail(value) {
  return String(value || "").trim().toLowerCase();
}
