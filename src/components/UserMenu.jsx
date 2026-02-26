// src/components/UserMenu.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // 👈 IMPORTAR useNavigate
import { FaUser, FaQuestionCircle, FaSun, FaSignOutAlt } from 'react-icons/fa';

// 🔹 COMPONENTES REUTILIZABLES
const MenuLink = ({ to, label, Icon, onClose }) => {
  const handleClick = () => {
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
  };
  return (
    <Link
      to={to}
      onClick={handleClick}
      style={menuBaseStyle}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.07)")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
    >
      <Icon size={15} />
      {label}
    </Link>
  );
};

const MenuButton = ({ label, Icon, onClick, color = "#ffffff", hoverBg = "rgba(255,255,255,0.07)", bold = false }) => {
  return (
    <button
      onClick={onClick}
      style={{
        ...menuBaseStyle,
        color,
        fontWeight: bold ? "700" : "500",
        width: "100%",
        border: "none",
        background: "none",
        textAlign: "left",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverBg)}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
    >
      <Icon size={15} />
      {label}
    </button>
  );
};

const menuBaseStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  color: "#ffffff",
  padding: "10px 16px",
  fontSize: "14px",
  textDecoration: "none",
  transition: "background-color 0.2s ease",
};

// 🔹 COMPONENTE PRINCIPAL
const UserMenu = ({ onClose, onToggleTheme, onLogout }) => {
  const navigate = useNavigate(); // 👈 USAR NAVEGATE

  // ✅ CORREGIDO: Cerrar sesión y redirigir al home
  const handleLogout = () => {
    // 1. Primero cerrar el menú
    if (onClose && typeof onClose === 'function') {
      onClose();
    }

    // 2. Pequeño delay para asegurar que el menú se cierre visualmente
    setTimeout(() => {
      // 3. Ejecutar logout (esto viene de Header -> App)
      if (onLogout && typeof onLogout === 'function') {
        onLogout();
      }
      
      // 4. Redirigir al home (por si acaso)
      navigate('/', { replace: true });
    }, 150);
  };

  const handleToggleTheme = () => {
    if (onToggleTheme && typeof onToggleTheme === 'function') {
      onToggleTheme();
    }
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "45px",
        right: "0",
        backgroundColor: "#0c1222",
        borderRadius: "14px",
        border: "1px solid #1f2937",
        boxShadow: "0 8px 20px rgba(0,0,0,0.45)",
        width: "190px",
        overflow: "hidden",
        zIndex: 1000,
        padding: "6px 0",
      }}
    >
      {/* PERFIL - RUTA CORRECTA /profile */}
      <MenuLink
        to="/profile"
        label="Perfil"
        Icon={FaUser}
        onClose={onClose}
      />
      
      {/* AYUDA */}
      <MenuLink 
        to="/help" 
        label="Ayuda" 
        Icon={FaQuestionCircle} 
        onClose={onClose} 
      />
      
      {/* MODO CLARO */}
      <MenuButton
        label="Modo Claro"
        Icon={FaSun}
        onClick={handleToggleTheme}
      />
      
      {/* DIVISOR */}
      <div
        style={{
          height: "1px",
          backgroundColor: "rgba(255,255,255,0.08)",
          margin: "6px 0",
        }}
      />
      
      {/* CERRAR SESIÓN (ROJO) */}
      <MenuButton
        label="Cerrar Sesión"
        Icon={FaSignOutAlt}
        onClick={handleLogout}
        color="#ff4d4d"
        hoverBg="rgba(255, 77, 77, 0.08)"
        bold
      />
    </div>
  );
};

export default UserMenu;