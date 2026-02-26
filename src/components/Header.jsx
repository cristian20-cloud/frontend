// src/components/Header.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaShoppingCart, FaUser, FaSearch, FaTimes, FaTrash,
  FaHome, FaTags, FaFire, FaSignInAlt, FaPlus, FaMinus, FaBars,
  FaTrashAlt
} from "react-icons/fa";
import UserMenu from "./UserMenu";

const Header = ({
  user,
  onLoginClick,
  onLogout,
  cartItemCount,
  cartItems = [],
  updateCart
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showClearCartConfirm, setShowClearCartConfirm] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [localCartCount, setLocalCartCount] = useState(cartItemCount || 0);
  const userMenuRef = useRef(null);
  const userButtonRef = useRef(null);
  const navigate = useNavigate();
  const cartRef = useRef(null);
  const cartScrollRef = useRef(null);

  /* ✅ ACTUALIZAR CONTADOR CUANDO CAMBIE cartItemCount */
  useEffect(() => {
    setLocalCartCount(cartItemCount || 0);
  }, [cartItemCount]);

  /* ✅ ESCUCHAR EVENTO DE ACTUALIZACIÓN DEL CARRITO */
  useEffect(() => {
    const handleCartUpdate = (event) => {
      const cart = event.detail?.cart || JSON.parse(localStorage.getItem('cart') || '[]');
      const total = cart.reduce((acc, item) => acc + (item.quantity || 0), 0);
      setLocalCartCount(total);
    };

    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  /* CERRAR MENÚ USUARIO */
  useEffect(() => {
    const closeMenu = (e) => {
      if (
        isUserMenuOpen &&
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target) &&
        !userButtonRef.current.contains(e.target)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, [isUserMenuOpen]);

  /* CERRAR CARRITO */
  useEffect(() => {
    const closeCart = (e) => {
      if (isCartOpen && cartRef.current && !cartRef.current.contains(e.target)) {
        setIsCartOpen(false);
        setShowClearCartConfirm(false);
      }
    };
    if (isCartOpen) document.addEventListener("mousedown", closeCart);
    return () => document.removeEventListener("mousedown", closeCart);
  }, [isCartOpen]);

  /* CERRAR MENÚ MÓVIL AL HACER CLICK EN UN LINK */
  useEffect(() => {
    if (isMenuOpen) {
      const closeMobileMenu = () => setIsMenuOpen(false);
      const links = document.querySelectorAll('.mobile-menu-link');
      links.forEach(link => link.addEventListener('click', closeMobileMenu));
      return () => {
        links.forEach(link => link.removeEventListener('click', closeMobileMenu));
      };
    }
  }, [isMenuOpen]);

  /* PREVENIR SCROLL CUANDO MENÚ MÓVIL ESTÁ ABIERTO */
  useEffect(() => {
    if (isMenuOpen || isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen, isCartOpen]);

  /* CARRITO - FUNCIONES CORREGIDAS */
  const removeFromCart = (id) => {
    const updated = cartItems.filter(i => i.id !== id);
    updateCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    const total = updated.reduce((acc, item) => acc + (item.quantity || 0), 0);
    setLocalCartCount(total);
  };

  const increaseQuantity = (id) => {
    const updated = cartItems.map(i =>
      i.id === id ? { ...i, quantity: (i.quantity || 1) + 1 } : i
    );
    updateCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    const total = updated.reduce((acc, item) => acc + (item.quantity || 0), 0);
    setLocalCartCount(total);
  };

  const decreaseQuantity = (id) => {
    const updated = cartItems
      .map(i => {
        if (i.id === id) {
          const qty = (i.quantity || 1) - 1;
          if (qty <= 0) return null;
          return { ...i, quantity: qty };
        }
        return i;
      })
      .filter(i => i);
    updateCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    const total = updated.reduce((acc, item) => acc + (item.quantity || 0), 0);
    setLocalCartCount(total);
  };

  const clearCart = () => {
    updateCart([]);
    localStorage.setItem("cart", JSON.stringify([]));
    setShowClearCartConfirm(false);
    setLocalCartCount(0);
  };

  const handleClearCartClick = () => {
    if (cartItems.length === 0) return;
    setShowClearCartConfirm(true);
  };

  const cancelClearCart = () => {
    setShowClearCartConfirm(false);
  };

  // Función para obtener precio de forma segura
  const getItemPrice = (item) => {
    return Number(item.precio ?? item.price ?? item.originalPrice ?? 0);
  };

  // Función para obtener imagen de forma segura
  const getItemImage = (item) => {
    if (item.imagen && item.imagen.trim() !== '') return item.imagen;
    if (item.imagenes && item.imagenes.length > 0) return item.imagenes[0];
    if (item.image && item.image.trim() !== '') return item.image;
    return 'https://via.placeholder.com/50x50/1E293B/FFC107?text=GM';
  };

  // Función para obtener nombre de forma segura
  const getItemName = (item) => {
    return item.nombre?.trim() || item.name?.trim() || 'Producto sin nombre';
  };

  const calculateCartTotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = getItemPrice(item);
      const quantity = item.quantity || 1;
      return sum + (price * quantity);
    }, 0);
  };

  /* BUSQUEDA CORREGIDA */
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setIsMenuOpen(false);
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/50x50/1E293B/FFC107?text=GM';
  };

  return (
    <>
      {/* ✅ CORREGIDO: responsiveStyles dentro de <style> */}
      <style>{responsiveStyles}
        {/* OVERLAY PARA MENÚ MÓVIL */}
        {isMenuOpen && (
          <div
            className="mobile-menu-overlay"
            onClick={() => setIsMenuOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              zIndex: 998,
            }}
          />
        )}
      </style>

      <header style={headerContainer}>
        <div style={headerInner}>
          {/* BOTÓN MÓVIL */}
          <button
            className="header-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={mobileMenuBtn}
            aria-label="Abrir menú"
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>

          {/* LOGO */}
          <Link to="/" style={logoLink}>
            <img src="/logo.png" style={logoImg} alt="Logo GM CAPS" />
          </Link>

          {/* NAV DESKTOP */}
          <nav className="header-nav" style={headerNav}>
            <Link to="/" style={navLink}>
              <FaHome size={14} /> <span>Inicio</span>
            </Link>

            <Link to="/categorias" style={navLink}>
              <FaTags size={14} /> <span>Categorías</span>
            </Link>

            <Link to="/ofertas" style={navLink}>
              <FaFire size={14} /> <span>Ofertas</span>
            </Link>

            {/* BUSCADOR DESKTOP - CORREGIDO */}
            <form className="header-search" onSubmit={handleSearchSubmit} style={searchForm}>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar gorras..."
                style={searchInput}
                aria-label="Buscar productos"
              />
              <button type="submit" style={searchButton} aria-label="Buscar">
                <FaSearch />
              </button>
            </form>

            {/* CARRITO */}
            <div style={{ position: "relative" }} ref={cartRef}>
              <button 
                onClick={() => setIsCartOpen(!isCartOpen)} 
                style={iconButton}
                aria-label={`Carrito (${localCartCount} items)`}
              >
                <FaShoppingCart />
                {localCartCount > 0 && (
                  <span style={badgeCount}>{localCartCount}</span>
                )}
              </button>

              {isCartOpen && (
                <div className="cart-panel-responsive" style={cartPanel}>
                  <div style={cartHeader}>
                    <div style={cartHeaderLeft}>
                      <h4 style={cartTitle}>Carrito ({localCartCount})</h4>
                      {cartItems.length > 0 && (
                        <button 
                          onClick={handleClearCartClick}
                          style={clearCartBtn}
                          aria-label="Vaciar carrito"
                          title="Vaciar carrito"
                        >
                          <FaTrashAlt size={14} />
                        </button>
                      )}
                    </div>
                    <button 
                      onClick={() => {
                        setIsCartOpen(false);
                        setShowClearCartConfirm(false);
                      }} 
                      style={closeButton}
                      aria-label="Cerrar carrito"
                    >
                      <FaTimes />
                    </button>
                  </div>

                  {/* CONFIRMACIÓN PARA VACIAR CARRITO */}
                  {showClearCartConfirm && (
                    <div style={clearCartConfirm}>
                      <p style={confirmText}>¿Estás seguro de que quieres vaciar el carrito?</p>
                      <div style={confirmButtons}>
                        <button 
                          onClick={clearCart}
                          style={confirmYesBtn}
                        >
                          Sí, vaciar
                        </button>
                        <button 
                          onClick={cancelClearCart}
                          style={confirmNoBtn}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  <div ref={cartScrollRef} style={cartItemsContainer} className="cart-scroll-invisible">
                    {cartItems.length === 0 ? (
                      <div style={emptyCart}>
                        <p style={emptyCartText}>Tu carrito está vacío</p>
                      </div>
                    ) : (
                      cartItems.map((item, index) => (
                        <div key={item.id || index} style={cartItem}>
                          <img 
                            src={getItemImage(item)} 
                            style={cartItemImage} 
                            alt={getItemName(item)}
                            onError={handleImageError}
                          />

                          <div style={cartItemInfo}>
                            <p style={cartItemName}>{getItemName(item)}</p>
                          
                            <div style={cartItemControls}>
                              <div style={quantityControls}>
                                <button 
                                  onClick={() => decreaseQuantity(item.id)} 
                                  style={qtyBtn}
                                  aria-label="Disminuir"
                                >
                                  <FaMinus size={10} />
                                </button>
                                <span style={quantityText}>{item.quantity || 1}</span>
                                <button 
                                  onClick={() => increaseQuantity(item.id)} 
                                  style={qtyBtn}
                                  aria-label="Aumentar"
                                >
                                  <FaPlus size={10} />
                                </button>
                              </div>
                          
                              <div style={priceRow}>
                                <span style={itemPrice}>
                                  ${(getItemPrice(item) * (item.quantity || 1)).toLocaleString()}
                                </span>
                                <button 
                                  onClick={() => removeFromCart(item.id)} 
                                  style={removeBtn}
                                  aria-label="Eliminar"
                                >
                                  <FaTrash size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {cartItems.length > 0 && (
                    <div style={cartFooter}>
                      <div style={totalRow}>
                        <span style={totalLabel}>Total: </span>
                        <span style={totalAmount}>${calculateCartTotal().toLocaleString()}</span>
                      </div>
                  
                      <Link 
                        to="/cart" 
                        onClick={() => {
                          setIsCartOpen(false);
                          setShowClearCartConfirm(false);
                        }} 
                        style={viewCartBtn}
                      >
                        Ver Carrito Completo
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* USUARIO */}
            {user ? (
              <div style={{ position: "relative" }}>
                <button
                  ref={userButtonRef}
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  style={iconButton}
                  aria-label="Menú de usuario"
                >
                  <FaUser />
                </button>

                {isUserMenuOpen && (
                  <div className="user-menu-responsive" ref={userMenuRef}>
                    <UserMenu onLogout={onLogout} />
                  </div>
                )}
              </div>
            ) : (
              <button onClick={onLoginClick} style={loginButton}>
                <FaSignInAlt size={14} /> <span style={{ marginLeft: 6 }}>Iniciar sesión</span>
              </button>
            )}
          </nav>
        </div>

        {/* MENÚ MÓVIL LATERAL */}
        <div className={`header-mobile-menu ${isMenuOpen ? 'open' : ''}`} style={mobileMenu}>
          {/* ENCABEZADO DEL MENÚ MÓVIL */}
          <div style={mobileHeader}>
            <div style={mobileUserInfo}>
              {user ? (
                <>
                  <div style={mobileAvatar}>
                    <FaUser size={20} />
                  </div>
                  <div>
                    <p style={mobileUserName}>{user.nombre || user.email}</p>
                  </div>
                </>
              ) : (
                <>
                  <div style={mobileAvatar}>
                    <FaUser size={20} />
                  </div>
                  <div>
                    <p style={mobileUserName}>Bienvenido</p>
                  </div>
                </>
              )}
            </div>
          
            <button 
              onClick={() => setIsMenuOpen(false)}
              style={mobileCloseBtn}
              aria-label="Cerrar menú"
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* BUSCADOR MÓVIL - CORREGIDO */}
          <div style={searchMobileContainer}>
            <form onSubmit={handleSearchSubmit} style={searchMobileForm}>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                style={searchMobileInput}
                aria-label="Buscar en móvil"
              />
              <button type="submit" style={searchMobileButton} aria-label="Buscar">
                <FaSearch size={16} />
              </button>
            </form>
          </div>

          {/* NAVEGACIÓN MÓVIL */}
          <nav style={mobileNav}>
            <Link 
              to="/" 
              className="mobile-menu-link" 
              onClick={() => setIsMenuOpen(false)}
              style={mobileNavItem}
            >
              <FaHome size={16} style={mobileNavIcon} /> 
              <span>Inicio</span>
            </Link>
          
            <Link 
              to="/categorias" 
              className="mobile-menu-link" 
              onClick={() => setIsMenuOpen(false)}
              style={mobileNavItem}
            >
              <FaTags size={16} style={mobileNavIcon} /> 
              <span>Categorías</span>
            </Link>
          
            <Link 
              to="/ofertas" 
              className="mobile-menu-link" 
              onClick={() => setIsMenuOpen(false)}
              style={mobileNavItem}
            >
              <FaFire size={16} style={mobileNavIcon} /> 
              <span>Ofertas</span>
            </Link>
          
            <Link 
              to="/cart" 
              className="mobile-menu-link" 
              onClick={() => setIsMenuOpen(false)}
              style={mobileNavItem}
            >
              <FaShoppingCart size={16} style={mobileNavIcon} /> 
              <span>Carrito</span>
              {localCartCount > 0 && (
                <span style={mobileBadge}>{localCartCount}</span>
              )}
            </Link>
          </nav>

          {/* SECCIÓN DE USUARIO MÓVIL */}
          <div style={userMobileSection}>
            {user ? (
              <>
                <Link 
                  to="/perfil" 
                  className="mobile-menu-link" 
                  onClick={() => setIsMenuOpen(false)}
                  style={profileMobileBtn}
                >
                  <FaUser size={14} style={{ marginRight: 10 }} /> 
                  Mi Perfil
                </Link>
                <button 
                  onClick={() => {
                    onLogout();
                    setIsMenuOpen(false);
                  }}
                  style={logoutMobileBtn}
                >
                  <FaSignInAlt size={14} style={{ marginRight: 10 }} /> 
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <button 
                onClick={() => {
                  onLoginClick();
                  setIsMenuOpen(false);
                }}
                style={loginMobileBtn}
              >
                <FaSignInAlt size={16} style={{ marginRight: 10 }} /> 
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

/* -------------------- ESTILOS -------------------- */
const headerContainer = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  backgroundColor: "#000",
  borderBottom: "2px solid #FFC107",
  zIndex: 1000,
  padding: "0 15px",
  height: "60px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const headerInner = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
  maxWidth: "1200px",
  height: "100%"
};

const logoLink = {
  display: "flex",
  alignItems: "center",
  textDecoration: "none",
  zIndex: 1001
};

const logoImg = {
  height: "35px",
  maxWidth: "120px",
  objectFit: "contain"
};

const mobileMenuBtn = {
  display: "none",
  background: "none",
  border: "none",
  color: "white",
  fontSize: "20px",
  cursor: "pointer",
  zIndex: 1001,
  padding: "8px"
};

const headerNav = {
  display: "flex",
  gap: "20px",
  alignItems: "center"
};

const navLink = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  textDecoration: "none",
  color: "white",
  fontWeight: 600,
  fontSize: "14px",
  padding: "8px 10px",
  borderRadius: "6px",
  transition: "0.2s",
  ":hover": {
    backgroundColor: "rgba(255, 193, 7, 0.1)"
  }
};

const searchForm = {
  position: "relative",
  display: "flex",
  alignItems: "center"
};

const searchInput = {
  padding: "8px 35px 8px 12px",
  borderRadius: "20px",
  border: "1px solid rgba(255,255,255,0.3)",
  backgroundColor: "rgba(255,255,255,0.1)",
  color: "white",
  width: "180px",
  fontSize: "14px",
  ":focus": {
    outline: "none",
    borderColor: "#FFC107"
  }
};

const searchButton = {
  position: "absolute",
  right: "8px",
  top: "50%",
  transform: "translateY(-50%)",
  background: "none",
  border: "none",
  color: "white",
  cursor: "pointer",
  fontSize: "14px",
  padding: "4px"
};

const iconButton = {
  background: "none",
  border: "none",
  color: "white",
  cursor: "pointer",
  fontSize: "18px",
  padding: "6px",
  borderRadius: "6px",
  position: "relative",
  ":hover": {
    backgroundColor: "rgba(255, 193, 7, 0.1)"
  }
};

const badgeCount = {
  position: "absolute",
  top: "-3px",
  right: "-3px",
  backgroundColor: "#FFF",
  color: "#000",
  borderRadius: "50%",
  width: "18px",
  height: "18px",
  fontSize: "11px",
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

/* CARRITO COMPACTO - CAMBIADO DE #001428 A NEGRO (#000) */
const cartPanel = {
  position: "absolute",
  top: "100%",
  right: 0,
  backgroundColor: "#000",
  border: "1px solid #FFC107",
  borderRadius: "8px",
  padding: "12px",
  width: "300px",
  marginTop: "10px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
  maxHeight: "400px",
  display: "flex",
  flexDirection: "column",
  zIndex: 2000
};

const cartHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "10px",
  paddingBottom: "8px",
  borderBottom: "1px solid #FFC107"
};

const cartHeaderLeft = {
  display: "flex",
  alignItems: "center",
  gap: "10px"
};

const cartTitle = {
  color: "white",
  fontWeight: 700,
  fontSize: "16px",
  margin: 0
};

const clearCartBtn = {
  background: "rgba(255, 107, 107, 0.1)",
  border: "1px solid rgba(255, 107, 107, 0.3)",
  color: "#ff6b6b",
  borderRadius: "4px",
  padding: "4px 6px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s ease"
};

const clearCartConfirm = {
  backgroundColor: "rgba(255, 193, 7, 0.1)",
  border: "1px solid rgba(255, 193, 7, 0.3)",
  borderRadius: "6px",
  padding: "10px",
  marginBottom: "10px"
};

const confirmText = {
  color: "white",
  fontSize: "13px",
  margin: "0 0 10px 0",
  textAlign: "center",
  lineHeight: "1.4"
};

const confirmButtons = {
  display: "flex",
  gap: "8px",
  justifyContent: "center"
};

const confirmYesBtn = {
  background: "#ff6b6b",
  border: "none",
  color: "white",
  padding: "6px 12px",
  borderRadius: "4px",
  fontSize: "12px",
  fontWeight: "600",
  cursor: "pointer",
  flex: 1,
  transition: "background 0.2s ease"
};

const confirmNoBtn = {
  background: "rgba(255, 255, 255, 0.1)",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  color: "white",
  padding: "6px 12px",
  borderRadius: "4px",
  fontSize: "12px",
  fontWeight: "600",
  cursor: "pointer",
  flex: 1,
  transition: "background 0.2s ease"
};

const closeButton = {
  background: "none",
  border: "none",
  color: "white",
  cursor: "pointer",
  fontSize: "16px",
  padding: "2px"
};

const cartItemsContainer = {
  overflowY: "auto",
  maxHeight: "250px",
  marginBottom: "10px"
};

const emptyCart = {
  padding: "20px 0",
  textAlign: "center"
};

const emptyCartText = {
  color: "#999",
  fontSize: "14px",
  margin: 0
};

const cartItem = {
  display: "flex",
  gap: "10px",
  padding: "8px 0",
  borderBottom: "1px solid rgba(255, 193, 7, 0.2)"
};

const cartItemImage = {
  width: "50px",
  height: "50px",
  borderRadius: "6px",
  objectFit: "cover"
};

const cartItemInfo = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between"
};

const cartItemName = {
  color: "white",
  fontSize: "13px",
  fontWeight: 600,
  margin: "0 0 6px 0",
  lineHeight: "1.3"
};

const cartItemControls = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const quantityControls = {
  display: "flex",
  alignItems: "center",
  gap: "6px"
};

const qtyBtn = {
  background: "rgba(255, 255, 255, 0.1)",
  color: "white",
  border: "1px solid rgba(255,255,255,0.3)",
  borderRadius: "4px",
  width: "20px",
  height: "20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer"
};

const quantityText = {
  color: "white",
  fontSize: "13px",
  fontWeight: "bold",
  minWidth: "20px",
  textAlign: "center"
};

const priceRow = {
  display: "flex",
  alignItems: "center",
  gap: "8px"
};

const itemPrice = {
  color: "#FFC107",
  fontSize: "14px",
  fontWeight: 700
};

const removeBtn = {
  background: "rgba(255, 0, 0, 0.1)",
  color: "#ff6b6b",
  border: "1px solid rgba(255, 107, 107, 0.3)",
  borderRadius: "4px",
  padding: "4px 6px",
  cursor: "pointer",
  fontSize: "10px"
};

const cartFooter = {
  borderTop: "1px solid #FFC107",
  paddingTop: "10px"
};

const totalRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "10px"
};

const totalLabel = {
  color: "white",
  fontSize: "15px",
  fontWeight: 600
};

const totalAmount = {
  color: "#FFC107",
  fontSize: "18px",
  fontWeight: 700
};

const viewCartBtn = {
  backgroundColor: "#FFC107",
  color: "#000",
  padding: "8px 12px",
  borderRadius: "6px",
  fontWeight: 700,
  textDecoration: "none",
  fontSize: "14px",
  textAlign: "center",
  display: "block",
  border: "1px solid #FFC107",
  ":hover": {
    backgroundColor: "#FFD700"
  }
};

const loginButton = {
  background: "none",
  border: "1px solid white",
  color: "white",
  padding: "6px 12px",
  borderRadius: "6px",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  ":hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)"
  }
};

/* MENÚ MÓVIL LATERAL - CAMBIADO DE #001428 A NEGRO (#000) */
const mobileMenu = {
  position: "fixed",
  top: 0,
  left: "-100%",
  width: "280px",
  height: "100vh",
  backgroundColor: "#000",
  borderRight: "2px solid #FFC107",
  zIndex: 999,
  padding: "0",
  overflowY: "auto",
  transition: "left 0.3s ease"
};

const mobileHeader = {
  padding: "15px",
  backgroundColor: "#000",
  borderBottom: "1px solid #FFC107",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const mobileUserInfo = {
  display: "flex",
  alignItems: "center",
  gap: "10px"
};

const mobileAvatar = {
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  backgroundColor: "rgba(255, 193, 7, 0.1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid #FFC107"
};

const mobileUserName = {
  color: "white",
  fontSize: "14px",
  fontWeight: 600,
  margin: 0
};

const mobileCloseBtn = {
  background: "none",
  border: "none",
  color: "white",
  fontSize: "18px",
  cursor: "pointer",
  padding: "4px"
};

const searchMobileContainer = {
  padding: "15px",
  backgroundColor: "#000",
  borderBottom: "1px solid #FFC107"
};

const searchMobileForm = {
  display: "flex",
  gap: "8px"
};

const searchMobileInput = {
  flex: 1,
  padding: "8px 12px",
  borderRadius: "6px",
  border: "1px solid rgba(255, 193, 7, 0.3)",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  color: "white",
  fontSize: "14px",
  ":focus": {
    outline: "none",
    borderColor: "#FFC107"
  }
};

const searchMobileButton = {
  backgroundColor: "#FFC107",
  color: "#000",
  border: "none",
  borderRadius: "6px",
  padding: "8px 12px",
  cursor: "pointer",
  fontWeight: "bold"
};

const mobileNav = {
  padding: "15px",
  display: "flex",
  flexDirection: "column",
  gap: "8px"
};

const mobileNavItem = {
  display: "flex",
  alignItems: "center",
  textDecoration: "none",
  color: "white",
  fontSize: "15px",
  fontWeight: 600,
  padding: "10px 15px",
  borderRadius: "6px",
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 193, 7, 0.2)",
  ":hover": {
    backgroundColor: "rgba(255, 193, 7, 0.1)"
  }
};

const mobileNavIcon = {
  marginRight: "12px",
  color: "#FFC107"
};

const mobileBadge = {
  marginLeft: "auto",
  backgroundColor: "#FFF",
  color: "#000",
  borderRadius: "10px",
  padding: "2px 8px",
  fontSize: "12px",
  fontWeight: "bold"
};

const userMobileSection = {
  padding: "15px",
  borderTop: "1px solid rgba(255, 193, 7, 0.2)"
};

const profileMobileBtn = {
  display: "flex",
  alignItems: "center",
  textDecoration: "none",
  color: "white",
  fontSize: "14px",
  fontWeight: 600,
  padding: "8px 12px",
  borderRadius: "6px",
  backgroundColor: "rgba(255, 193, 7, 0.1)",
  border: "1px solid rgba(255, 193, 7, 0.3)",
  marginBottom: "8px",
  ":hover": {
    backgroundColor: "rgba(255, 193, 7, 0.2)"
  }
};

const loginMobileBtn = {
  background: "#FFC107",
  border: "none",
  color: "#000",
  padding: "10px 15px",
  borderRadius: "6px",
  fontSize: "14px",
  fontWeight: 700,
  cursor: "pointer",
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  ":hover": {
    backgroundColor: "#FFD700"
  }
};

const logoutMobileBtn = {
  background: "none",
  border: "1px solid #ff6b6b",
  color: "#ff6b6b",
  padding: "8px 12px",
  borderRadius: "6px",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  ":hover": {
    backgroundColor: "rgba(255, 107, 107, 0.1)"
  }
};

/* ESTILOS RESPONSIVE */
const responsiveStyles = `/* Responsive para móviles (0-768px) */ @media (max-width: 768px) { .header-nav { display: none !important; } .header-menu-btn { display: block !important; } /* Carrito en móvil - más compacto */ .cart-panel-responsive { position: fixed !important; top: 60px !important; right: 0 !important; left: 0 !important; width: 100vw !important; max-width: 100vw !important; height: calc(100vh - 60px) !important; max-height: calc(100vh - 60px) !important; margin-top: 0 !important; border-radius: 0 !important; border: none !important; border-top: 2px solid #FFC107 !important; padding: 15px !important; } /* Menú de usuario en móvil */ .user-menu-responsive { position: fixed !important; top: 60px !important; right: 0 !important; left: 0 !important; width: 100vw !important; max-width: 100vw !important; margin-top: 0 !important; border-radius: 0 !important; border: none !important; border-top: 2px solid #FFC107 !important; } /* Buscador en móvil */ .header-search { display: none !important; } /* Menú móvil abierto */ .header-mobile-menu.open { left: 0 !important; } /* Overlay para menú móvil */ .mobile-menu-overlay { display: block !important; } /* Botón de vaciar carrito en móvil */ .clearCartBtn { padding: 6px 8px !important; } /* Confirmación en móvil */ .clearCartConfirm { margin: 10px 0 !important; padding: 12px !important; } .confirmText { font-size: 14px !important; margin-bottom: 12px !important; } .confirmButtons { gap: 10px !important; } .confirmYesBtn, .confirmNoBtn { padding: 8px 14px !important; font-size: 13px !important; } } /* Menú móvil en pantallas muy pequeñas */ @media (max-width: 480px) { .header-mobile-menu { width: 100% !important; max-width: 100% !important; } .cart-panel-responsive { padding: 12px !important; } .cartItem { padding: 8px 0 !important; } .cartItemImage { width: 45px !important; height: 45px !important; } .searchMobileInput { font-size: 14px !important; } } /* Responsive para tabletas (769px - 1024px) */ @media (min-width: 769px) and (max-width: 1024px) { .header-search input { width: 160px !important; } .header-nav { gap: 16px !important; } .navLink { padding: 6px 8px !important; font-size: 13px !important; } .cart-panel-responsive { width: 280px !important; } } /* Ocultar menú móvil en desktop */ @media (min-width: 769px) { .header-mobile-menu { display: none !important; } .header-menu-btn { display: none !important; } .mobile-menu-overlay { display: none !important; } } /* Animaciones */ @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } } .cart-panel-responsive { animation: slideDown 0.2s ease-out; } .user-menu-responsive { animation: slideDown 0.2s ease-out; } /* SCROLL INVISIBLE para el carrito */ .cart-scroll-invisible { overflow-y: auto; scrollbar-width: none; /* Firefox */ -ms-overflow-style: none; /* IE and Edge */ } .cart-scroll-invisible::-webkit-scrollbar { display: none; /* Chrome, Safari, Opera */ width: 0; height: 0; background: transparent; } .cart-scroll-invisible::-webkit-scrollbar-track { background: transparent; } .cart-scroll-invisible::-webkit-scrollbar-thumb { background: transparent; border: none; } .cart-scroll-invisible::-webkit-scrollbar-thumb:hover { background: transparent; } /* Scroll invisible para menú móvil también */ .header-mobile-menu { scrollbar-width: none; -ms-overflow-style: none; } .header-mobile-menu::-webkit-scrollbar { display: none; width: 0; height: 0; background: transparent; } .header-mobile-menu::-webkit-scrollbar-track { background: transparent; } .header-mobile-menu::-webkit-scrollbar-thumb { background: transparent; border: none; } /* Efectos hover para botones de confirmación */ .confirmYesBtn:hover { background: #ff5252 !important; } .confirmNoBtn:hover { background: rgba(255, 255, 255, 0.2) !important; } .clearCartBtn:hover { background: rgba(255, 107, 107, 0.2) !important; transform: scale(1.05); }`;

export default Header;