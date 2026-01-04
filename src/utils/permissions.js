// src/utils/permissions.js
import { rolePermissionsMap } from "../data";

export const hasPermission = (user, permissionId) => {
  if (!user?.IdRol) return false;
  if (user.IdRol === 1) return true; // Administrador tiene todo
  const perms = rolePermissionsMap[user.IdRol] || [];
  return perms.includes(permissionId);
};

// Uso:
// hasPermission(currentUser, 'ventas') → true/false