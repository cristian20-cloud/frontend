// src/pages/admin/AdminLayoutClean.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { 
  FaUser, FaHome, FaBox, FaUsers, FaShoppingCart, FaChartBar,
  FaExchangeAlt, FaShieldAlt, FaTag, FaTruck, FaSignOutAlt,
  FaUserTie, FaUserCircle, FaEnvelope
} from "react-icons/fa";
import { 
  initialUsers, 
  roles, 
  getCurrentUser,
  getModulesByRole,
  logout 
} from '../../data';

const AdminLayoutClean = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarItems, setSidebarItems] = useState([]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Todos los módulos posibles con sus configuraciones
  const allModules = [
    { id: "dashboard", label: "Dashboard", icon: FaHome, path: "/admin" },
    { id: "categories", label: "Categorías", icon: FaTag, path: "/admin/categories" },
    { id: "products", label: "Productos", icon: FaBox, path: "/admin/products" },
    { id: "suppliers", label: "Proveedores", icon: FaTruck, path: "/admin/suppliers" },
    { id: "orders", label: "Compras", icon: FaShoppingCart, path: "/admin/orders" },
    { id: "customers", label: "Clientes", icon: FaUsers, path: "/admin/customers" },
    { id: "sales", label: "Ventas", icon: FaChartBar, path: "/admin/sales" },
    { id: "returns", label: "Devoluciones", icon: FaExchangeAlt, path: "/admin/returns" },
    { id: "users", label: "Usuarios", icon: FaUser, path: "/admin/users" },
    { id: "roles", label: "Roles", icon: FaShieldAlt, path: "/admin/roles" },
  ];

  // Mapeo de módulos a IDs del sistema
  const moduleIdMap = {
    dashboard: "dashboard",
    categories: "categorias",
    products: "productos",
    suppliers: "proveedores",
    orders: "compras",
    customers: "clientes",
    sales: "ventas",
    returns: "devoluciones",
    users: "usuarios",
    roles: "roles"
  };

  useEffect(() => {
    const loadUserAndModules = () => {
      // Obtener usuario desde localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          
          // Buscar el usuario completo en initialUsers para obtener datos actualizados
          const fullUser = initialUsers.find(u => 
            u.Correo === userData.email || 
            u.Correo === userData.Correo ||
            u.IdUsuario === userData.IdUsuario
          );
          
          if (fullUser) {
            // Combinar datos con información completa del usuario
            const userRole = roles.find(r => r.IdRol === fullUser.IdRol);
            const completeUser = {
              ...fullUser,
              email: fullUser.Correo,
              nombre: fullUser.Nombre,
              role: userRole ? userRole.Nombre : 'Usuario',
              rol: userRole ? userRole.Nombre : 'Usuario',
              IdRol: fullUser.IdRol
            };
            
            setUser(completeUser);
            
            // Filtrar módulos según el rol del usuario
            const userRoleData = roles.find(r => r.IdRol === fullUser.IdRol);
            if (userRoleData) {
              // Convertir los IDs de permisos del rol a IDs de módulos del sidebar
              const userModuleIds = userRoleData.Permisos;
              
              // Filtrar módulos basados en los permisos del rol
              const filteredModules = allModules.filter(module => {
                const systemModuleId = moduleIdMap[module.id];
                return userModuleIds.includes(systemModuleId);
              });
              
              setSidebarItems(filteredModules);
            } else {
              // Si no se encuentra el rol, mostrar todos los módulos (para admin por defecto)
              setSidebarItems(allModules);
            }
          } else {
            setUser(userData);
            // Si es administrador maestro, mostrar todos los módulos
            if (userData.IdUsuario === 999) {
              setSidebarItems(allModules);
            }
          }
        } catch (error) {
          console.error("Error al cargar el usuario:", error);
        }
      }
    };
    
    loadUserAndModules();
    
    // Escuchar cambios en localStorage
    const handleStorageChange = () => {
      loadUserAndModules();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const theme = {
    background: "#000000", // Fondo negro puro
    sidebarBg: "#000000",  // Sidebar también negro
    text: "#ffffff",
    accent: "#F5C81B",     // Amarillo brillante
    border: "#374151",
  };

  // Obtener tipo de usuario y mostrar icono correspondiente
  const getUserTypeIcon = () => {
    if (!user) return FaUserCircle;
    if (user.role === 'Administrador' || user.rol === 'Administrador' || user.IdRol === 1 || user.IdUsuario === 999) return FaUserTie;
    if (user.role === 'Vendedor' || user.IdRol === 2) return FaUser;
    if (user.role === 'Gestor de Inventario' || user.IdRol === 3) return FaBox;
    if (user.role === 'Recursos Humanos' || user.IdRol === 4) return FaUsers;
    if (user.role === 'Gestor de Clientes' || user.IdRol === 5) return FaUserCircle;
    if (user.role === 'Auditor' || user.IdRol === 6) return FaChartBar;
    return FaUserCircle;
  };

  const getUserTypeText = () => {
    if (!user) return 'Usuario';
    if (user.role === 'Administrador' || user.rol === 'Administrador' || user.IdRol === 1 || user.IdUsuario === 999) return 'Administrador';
    if (user.role === 'Vendedor' || user.IdRol === 2) return 'Vendedor';
    if (user.role === 'Gestor de Inventario' || user.IdRol === 3) return 'Gestor de Inventario';
    if (user.role === 'Recursos Humanos' || user.IdRol === 4) return 'Recursos Humanos';
    if (user.role === 'Gestor de Clientes' || user.IdRol === 5) return 'Gestor de Clientes';
    if (user.role === 'Auditor' || user.IdRol === 6) return 'Auditor';
    return 'Usuario';
  };

  const UserIcon = getUserTypeIcon();

  // Verificar si el usuario actual es administrador
  const isAdmin = user && (user.IdRol === 1 || user.IdUsuario === 999);

  // Obtener el rol específico del usuario
  const getUserRoleDetails = () => {
    if (!user) return null;
    return roles.find(r => r.IdRol === user.IdRol);
  };

  const userRoleDetails = getUserRoleDetails();

  return (
    <div style={{ 
      display: "flex", 
      backgroundColor: theme.background,
      minHeight: "100vh", 
      color: "#fff",
      fontFamily: "'Inter', 'Segoe UI', -apple-system, sans-serif"
    }}>
      {/* SIDEBAR */}
      <aside style={{
        width: "200px",
        minWidth: "200px",
        background: theme.sidebarBg,
        height: "100vh",
        position: "sticky",
        top: 0,
        borderRight: `1px solid ${theme.border}`,
        display: "flex",
        flexDirection: "column",
        overflowY: "hidden",
        boxShadow: '2px 0 8px rgba(245, 200, 27, 0.15)',
        boxSizing: 'border-box',
        zIndex: 10
      }}>
        {/* Encabezado con información del rol — SIN BORDE INFERIOR */}
        <div style={{ 
          padding: '12px 16px', 
          /* QUITADO: borderBottom: `1px solid ${theme.border}`, */
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          {user && (
            <>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}>
                <UserIcon size={12} color={theme.accent} />
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: theme.accent,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {getUserTypeText()}
                </span>
              </div>
              {userRoleDetails && userRoleDetails.Descripcion && (
                <p style={{
                  fontSize: '0.65rem',
                  color: '#9CA3AF',
                  margin: 0,
                  textAlign: 'center',
                  lineHeight: '1.3'
                }}>
                  {userRoleDetails.Descripcion}
                </p>
              )}
            </>
          )}
        </div>

        {/* Navegación - Módulos filtrados por rol */}
        <nav style={{ 
          flex: 1, 
          padding: "8px", 
          overflowY: "auto",
          scrollbarWidth: 'thin',
          scrollbarColor: `${theme.accent}40 ${theme.sidebarBg}`
        }}>
          {sidebarItems.length > 0 ? (
            sidebarItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.id} 
                  to={item.path} 
                  style={{
                    display: "flex", 
                    alignItems: "center", 
                    gap: "10px",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    textDecoration: "none", 
                    color: isActive ? theme.accent : "#D1D5DB",
                    backgroundColor: isActive ? "#F5C81B15" : "transparent", 
                    marginBottom: "4px",
                    fontSize: "0.85rem",
                    transition: 'all 0.2s ease',
                    fontWeight: '500',
                    border: isActive ? `1px solid ${theme.accent}30` : '1px solid transparent',
                    fontFamily: 'inherit'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#111827';
                      e.currentTarget.style.color = '#F5C81B';
                      e.currentTarget.style.border = `1px solid ${theme.accent}20`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#D1D5DB';
                      e.currentTarget.style.border = '1px solid transparent';
                    }
                  }}
                >
                  <item.icon size={14} /> 
                  <span>{item.label}</span>
                </Link>
              );
            })
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              color: '#6B7280',
              fontSize: '0.8rem'
            }}>
              <p>No tiene módulos asignados</p>
              <p style={{ fontSize: '0.7rem', marginTop: '5px' }}>
                Contacte al administrador
              </p>
            </div>
          )}
        </nav>

        {/* BOTÓN CERRAR SESIÓN — ESTILO FINAL */}
        <div style={{ 
          borderTop: `1px solid ${theme.border}`,
          backgroundColor: '#000000',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 'auto',
          overflow: 'hidden'
        }}>
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            style={{
              width: "100%",
              padding: "10px 16px",
              color: theme.accent,
              background: "transparent",
              border: `2px solid ${theme.accent}`,
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "0.8rem",
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
              letterSpacing: '0.3px',
              textTransform: 'uppercase',
              boxShadow: `0 0 10px ${theme.accent}50`, // Sombra amarilla suave
            }}
          >
            <FaSignOutAlt size={12} />
            <span>CERRAR SESIÓN</span>
          </button>
        </div>

        {/* CONFIRMACIÓN DE CIERRE (oculta por defecto) */}
        {showLogoutConfirm && (
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#000000',
            padding: '20px',
            borderRadius: '8px',
            border: `2px solid ${theme.accent}`,
            boxShadow: `0 0 20px ${theme.accent}50`,
            zIndex: 9999,
            textAlign: 'center'
          }}>
            <p style={{ 
              color: '#fff', 
              fontSize: '0.85rem', 
              margin: '0 0 12px 0',
              fontWeight: '500',
              lineHeight: '1.4'
            }}>
              ¿Cerrar sesión de<br/><span style={{color: theme.accent, fontWeight: '600'}}>{user?.nombre || user?.Nombre || user?.username || 'Usuario'}</span>?
            </p>
            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center'
            }}>
              <button 
                onClick={handleLogout}
                style={{
                  padding: '8px 16px',
                  background: theme.accent,
                  color: '#000',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit'
                }}
              >
                Sí, salir
              </button>
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  padding: '8px 16px',
                  background: '#1F2937',
                  color: '#D1D5DB',
                  border: '1px solid #4B5563',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main style={{ 
        flex: 1, 
        padding: "20px",
        overflowY: 'auto',
        height: '100vh',
        backgroundColor: theme.background,
        fontFamily: 'inherit'
      }}>
        <Outlet /> 
      </main>
    </div>
  );
};

export default AdminLayoutClean;