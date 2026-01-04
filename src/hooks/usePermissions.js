// src/hooks/usePermissions.js
import { useMemo } from 'react';
import { initialRoles } from '../data';

export const usePermissions = (user) => {
  return useMemo(() => {
    if (!user?.IdRol) return [];
    const role = initialRoles.find(r => r.IdRol === user.IdRol);
    return role?.Permisos || [];
  }, [user?.IdRol]);
};

// Uso en componente:
// const permissions = usePermissions(user);
// const canManageSales = permissions.includes('ventas');