// src/pages/admin/AdminLayoutClean.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  FaUser, FaHome, FaBox, FaUsers, FaShoppingCart, FaChartBar,
  FaExchangeAlt, FaShieldAlt, FaTag, FaTruck, FaSignOutAlt,
  FaUserTie, FaUserCircle, FaStar, FaBoxOpen, FaClipboardList,
  FaWallet, FaBell, FaCalendarAlt
} from "react-icons/fa";
import { initialUsers, roles } from '../../data';

// ===== CONSTANTES FUERA DEL COMPONENTE =====
const allModules = [
  { id: "dashboard", label: "Dashboard", icon: FaHome, path: "/admin/AdminDashboard" },
  { id: "categorias", label: "Categorías", icon: FaTag, path: "/admin/Categorias" },
  { id: "productos", label: "Productos", icon: FaBox, path: "/admin/Productos" },
  { id: "proveedores", label: "Proveedores", icon: FaTruck, path: "/admin/ProveedoresPage" },
  { id: "compras", label: "Compras", icon: FaShoppingCart, path: "/admin/ComprasPage" },
  { id: "clientes", label: "Clientes", icon: FaUsers, path: "/admin/ClientesPage" },
  { id: "ventas", label: "Ventas", icon: FaChartBar, path: "/admin/VentasPage" },
  { id: "devoluciones", label: "Devoluciones", icon: FaExchangeAlt, path: "/admin/DevolucionesPage" },
  { id: "usuarios", label: "Usuarios", icon: FaUser, path: "/admin/UsersPage" },
  { id: "roles", label: "Roles", icon: FaShieldAlt, path: "/admin/RolesPages" },
];

const theme = {
  background: "#000000",
  sidebarBg: "#000000",
  text: "#ffffff",
  accent: "#F5C81B",
  accentHover: "#FFD700",
};

// ===== COMPONENTE DE BIENVENIDA PERSONALIZADA =====
const WelcomeDashboard = ({ user }) => {
  const currentDate = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "¡Buenos días!";
    if (hour < 18) return "¡Buenas tardes!";
    return "¡Buenas noches!";
  };

  const userName = user?.nombre || user?.Nombre || user?.name || 'Administrador';
  const userRole = user?.role || user?.Rol || user?.userType || 'Administrador';

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
      padding: "20px 30px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      overflow: "hidden"
    }}>
      <div style={{
        textAlign: "center",
        zIndex: 1,
        maxWidth: "800px",
        marginTop: "40px",
      }}>
        <div style={{
          width: "100px",
          height: "100px",
          margin: "0 auto 20px",
          background: "linear-gradient(135deg, #F5C81B 0%, #FFD700 100%)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 10px 40px rgba(245, 200, 27, 0.4)",
        }}>
          <FaUserTie size={50} color="#000" />
        </div>

        <h1 style={{
          color: "#F5C81B",
          fontSize: "2.5rem",
          fontWeight: "800",
          margin: "0 0 8px 0",
          textShadow: "0 0 30px rgba(245, 200, 27, 0.5)",
          letterSpacing: "1px",
        }}>
          {getGreeting()}
        </h1>

        <h2 style={{
          color: "#ffffff",
          fontSize: "1.8rem",
          fontWeight: "700",
          margin: "0 0 10px 0",
          letterSpacing: "0.5px",
        }}>
          {userName}
        </h2>

        <div style={{
          display: "inline-block",
          background: "rgba(245, 200, 27, 0.15)",
          border: "1px solid rgba(245, 200, 27, 0.4)",
          padding: "6px 20px",
          borderRadius: "20px",
          marginBottom: "15px",
        }}>
          <span style={{
            color: "#F5C81B",
            fontSize: "0.9rem",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}>
            {userRole}
          </span>
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          color: "#9CA3AF",
          fontSize: "0.95rem",
          marginBottom: "25px",
          textTransform: "capitalize",
        }}>
          <FaCalendarAlt color="#F5C81B" size={16} />
          <span>{currentDate}</span>
        </div>

        <p style={{
          color: "#D1D5DB",
          fontSize: "1.1rem",
          lineHeight: "1.6",
          margin: "0 0 30px 0",
          maxWidth: "600px",
          marginLeft: "auto",
          marginRight: "auto",
        }}>
          Bienvenido al panel de <strong style={{ color: "#F5C81B" }}>GM Caps</strong>.
          <br />
          {userRole === 'Administrador' 
            ? 'Tienes acceso completo a todos los módulos del sistema.'
            : userRole === 'Vendedor'
            ? 'Gestiona ventas, clientes y productos disponibles.'
            : 'Accede a los módulos asignados para tu rol.'}
        </p>
      </div>
    </div>
  );
};

// ===== COMPONENTE PRINCIPAL =====
const AdminLayoutClean = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [sidebarItems, setSidebarItems] = useState([]);
  const [showLogoutDropdown, setShowLogoutDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const loadUserAndModules = () => {
      // 👈 CAMBIADO DE localStorage a sessionStorage
      const storedUser = sessionStorage.getItem('user');
      if (!storedUser) {
        window.location.href = '/login';
        return;
      }

      try {
        const userData = JSON.parse(storedUser);
        const fullUser = initialUsers.find(u =>
          u.Correo === userData.email ||
          u.Correo === userData.Correo ||
          u.IdUsuario === userData.IdUsuario
        );

        if (fullUser) {
          const userRole = roles.find(r => r.IdRol === fullUser.IdRol);
          const completeUser = {
            ...fullUser,
            email: fullUser.Correo,
            nombre: fullUser.Nombre,
            role: userRole?.Nombre || 'Usuario',
            rol: userRole?.Nombre || 'Usuario',
            IdRol: fullUser.IdRol
          };

          setUser(completeUser);

          if (fullUser.IdRol === 1) {
            setSidebarItems(allModules);
          } else {
            const userRoleData = roles.find(r => r.IdRol === fullUser.IdRol);
            if (userRoleData?.Permisos) {
              const filteredModules = allModules.filter(module =>
                userRoleData.Permisos.includes(module.id)
              );
              setSidebarItems(filteredModules);
            } else {
              setSidebarItems(allModules);
            }
          }
        } else if (userData.IdUsuario === 999) {
          setUser(userData);
          setSidebarItems(allModules);
        } else {
          setUser(userData);
          if (userData.userType === "admin" || userData.IdRol === 1) {
            setSidebarItems(allModules);
          } else {
            setSidebarItems([]);
          }
        }
      } catch (error) {
        console.error("Error al cargar el usuario: ", error);
      }
    };

    loadUserAndModules();

    const handleStorageChange = (e) => {
      // 👈 TAMBIÉN CAMBIADO A sessionStorage
      if (e.key === 'user' && e.newValue === null) {
        window.location.href = '/login';
      } else {
        loadUserAndModules();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLogoutDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    // 👈 CAMBIADO A sessionStorage
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('userType');
    localStorage.removeItem('cart'); // El carrito sigue en localStorage
    window.location.href = '/';
  };

  const getUserTypeIcon = () => {
    if (!user) return FaUserCircle;
    if (user.IdRol === 1 || user.IdUsuario === 999) return FaUserTie;
    return FaUserCircle;
  };

  const getUserTypeText = () => {
    if (!user) return 'Usuario';
    if (user.IdRol === 1 || user.IdUsuario === 999) return 'Administrador';
    if (user.IdRol === 2) return 'Vendedor';
    return 'Usuario';
  };

  const UserIcon = getUserTypeIcon();
  const isBaseAdminRoute = location.pathname === '/admin' || location.pathname === '/admin/';

  return (
    <div style={{
      display: "flex",
      backgroundColor: theme.background,
      minHeight: "100vh",
      color: "#fff",
      fontFamily: "'Inter', 'Segoe UI', -apple-system, sans-serif",
    }}>
      {/* ===== SIDEBAR ===== */}
      <aside style={{
        width: "200px",
        minWidth: "200px",
        background: theme.sidebarBg,
        height: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        overflowY: "hidden",
        boxShadow: 'none',
        boxSizing: 'border-box',
        zIndex: 10
      }}>
        {/* Encabezado - Información del Rol */}
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {user && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
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
            </>
          )}
        </div>

        {/* Navegación - Módulos */}
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
                    fontFamily: 'inherit'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#111827';
                      e.currentTarget.style.color = '#F5C81B';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#D1D5DB';
                    }
                  }}
                >
                  <item.icon size={14} />
                  <span>{item.label}</span>
                </Link>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#6B7280', fontSize: '0.8rem' }}>
              <p>No tiene módulos asignados</p>
              <p style={{ fontSize: '0.7rem', marginTop: '5px' }}>Contacte al administrador</p>
            </div>
          )}
        </nav>

        {/* Botón Cerrar Sesión con Dropdown */}
        <div style={{
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative'
        }} ref={dropdownRef}>
          
          {/* Dropdown */}
          {showLogoutDropdown && (
            <div style={{
              position: 'absolute',
              bottom: '100%',
              left: '12px',
              right: '12px',
              marginBottom: '8px',
              display: 'flex',
              gap: '8px',
              animation: 'slideUp 0.2s ease'
            }}>
              <button
                onClick={() => setShowLogoutDropdown(false)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  background: '#1F2937',
                  color: '#D1D5DB',
                  border: '1px solid #4B5563',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#4B5563';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#1F2937';
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  background: theme.accent,
                  color: '#000',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = `0 0 15px ${theme.accent}80`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <FaSignOutAlt size={12} />
                <span>Sí, salir</span>
              </button>
            </div>
          )}

          {/* Botón Principal */}
          <button
            onClick={() => setShowLogoutDropdown(!showLogoutDropdown)}
            style={{
              width: "100%",
              padding: "10px 12px",
              color: theme.accent,
              background: "transparent",
              border: `1.5px solid ${theme.accent}`,
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.75rem",
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
              letterSpacing: '0.3px',
              textTransform: 'uppercase'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 0 15px ${theme.accent}60`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <FaSignOutAlt size={12} />
            <span>CERRAR SESIÓN</span>
          </button>
        </div>
      </aside>

      {/* ===== CONTENIDO PRINCIPAL ===== */}
      <main style={{
        flex: 1,
        padding: "20px 30px",
        overflowY: 'auto',
        height: '100vh',
        backgroundColor: theme.background,
        fontFamily: 'inherit'
      }}>
        {isBaseAdminRoute ? (
          <WelcomeDashboard user={user} />
        ) : (
          <Outlet />
        )}
      </main>

      {/* Animación CSS */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayoutClean;