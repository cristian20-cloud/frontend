// src/utils/auth.js
import { initialRoles } from '../data';

export const hasPermission = (user, permissionId) => {
  if (!user?.IdRol) return false;
  if (user.IdRol === 1) return true; // Administrador: acceso total

  const role = initialRoles.find(r => r.IdRol === user.IdRol);
  return role?.Permisos?.includes(permissionId) || false;
};

// Ejemplo de uso:
// hasPermission({ IdRol: 2 }, 'ventas') → true
// hasPermission({ IdRol: 5 }, 'productos') → false