// src/App.jsx
import React, { useState, useMemo, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

// ===== COMPONENTES PÚBLICOS =====
import Header from "./components/Header";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Productos from "./pages/Productos";
import Categorias from "./pages/Categorias";
import Ofertas from "./pages/Ofertas";
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import SearchResults from "./pages/SearchResults";

// ===== COMPONENTES ADMIN =====
import AdminLayoutClean from "./pages/admin/AdminLayoutClean";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCategorias from "./pages/admin/Categorias";
import ClientesPage from "./pages/admin/ClientesPage";
import ProveedoresPage from "./pages/admin/ProveedoresPage";
import ProductosPage from "./pages/admin/Productos";
import DevolucionesPage from "./pages/admin/DevolucionesPage";
import RolesPage from "./pages/admin/RolesPage";
import UsersPage from "./pages/admin/UsersPage";
import VentasPage from "./pages/admin/VentasPage";
import ComprasPage from "./pages/admin/ComprasPage";

// ===== 🔐 PROTECTED ROUTE =====
const ProtectedRoute = ({ user, children }) => {
  if (!user) return <Navigate to="/login" replace />;
  if (user.userType !== "admin" && user.IdRol !== 1)
    return <Navigate to="/" replace />;
  return children;
};

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ SESSION STORAGE (SE BORRA AL CERRAR NAVEGADOR)
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 🔁 Redirección automática según tipo
  useEffect(() => {
    if (user) {
      if (user.userType === "admin" || user.IdRol === 1) {
        if (location.pathname === "/" || location.pathname === "/login") {
          navigate("/admin/AdminDashboard", { replace: true });
        }
      }
    }
  }, [user, location.pathname, navigate]);

  // 🛒 Carrito
  const updateCart = (items) => {
    setCartItems(items);
    localStorage.setItem("cart", JSON.stringify(items));
  };

  const addToCart = (product) => {
    const existing = cartItems.find((i) => i.id === product.id);
    if (existing) {
      updateCart(
        cartItems.map((i) =>
          i.id === product.id
            ? { ...i, quantity: (i.quantity || 1) + 1 }
            : i
        )
      );
    } else {
      updateCart([...cartItems, { ...product, quantity: 1 }]);
    }
  };

  // 🔑 LOGIN
  const handleLogin = (userData) => {
    setUser(userData);
    sessionStorage.setItem("user", JSON.stringify(userData));

    if (userData.userType === "admin" || userData.IdRol === 1) {
      navigate("/admin/AdminDashboard", { replace: true });
    } else {
      navigate("/profile", { replace: true });
    }
  };

  // 🚪 LOGOUT
  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const cartItemCount = useMemo(
    () => cartItems.reduce((t, i) => t + (i.quantity || 1), 0),
    [cartItems]
  );

  const showHeader =
    !location.pathname.startsWith("/admin") &&
    location.pathname !== "/login";

  return (
    <>
      {showHeader && (
        <Header
          user={user}
          onLoginClick={() => navigate("/login")}
          onLogout={handleLogout}
          cartItemCount={cartItemCount}
          cartItems={cartItems}
          updateCart={updateCart}
        />
      )}

      <Routes>
        {/* RUTAS PÚBLICAS */}
        <Route
          path="/"
          element={
            <Home
              addToCart={addToCart}
              updateCart={updateCart}
              cartItems={cartItems}
            />
          }
        />

        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/ofertas" element={<Ofertas />} />

        <Route
          path="/productos"
          element={
            <Productos
              addToCart={addToCart}
              updateCart={updateCart}
              cartItems={cartItems}
            />
          }
        />

        <Route
          path="/profile"
          element={<Profile user={user} onLogout={handleLogout} />}
        />

        <Route
          path="/perfil"
          element={<Profile user={user} onLogout={handleLogout} />}
        />

        <Route
          path="/cart"
          element={
            <Cart
              cartItems={cartItems}
              updateCart={updateCart}
              user={user}
              onLogout={handleLogout}
            />
          }
        />

        <Route
          path="/search"
          element={
            <SearchResults
              addToCart={addToCart}
              updateCart={updateCart}
              cartItems={cartItems}
            />
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute user={user}>
              <AdminLayoutClean />
            </ProtectedRoute>
          }
        >
          <Route path="AdminDashboard" element={<AdminDashboard user={user} />} />
          <Route path="Categorias" element={<AdminCategorias />} />
          <Route path="Productos" element={<ProductosPage />} />
          <Route path="ProveedoresPage" element={<ProveedoresPage />} />
          <Route path="ComprasPage" element={<ComprasPage />} />
          <Route path="ClientesPage" element={<ClientesPage />} />
          <Route path="VentasPage" element={<VentasPage />} />
          <Route path="DevolucionesPage" element={<DevolucionesPage />} />
          <Route path="UsersPage" element={<UsersPage />} />
          <Route path="RolesPages" element={<RolesPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}