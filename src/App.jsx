// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';

// Importaciones de componentes y páginas
import Header from './components/Header';
import Login from './pages/Login';
import Home from './pages/Home';
// --- NUEVA IMPORTACIÓN ---
import Productos from './pages/Productos'; // <-- ¡Esta línea es crucial!
// Páginas principales
import Categorias from './pages/Categorias';
import Ofertas from './pages/Ofertas';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import SearchResults from './pages/SearchResults';

// Páginas de administración
import AdminLayoutClean from './pages/admin/AdminLayoutClean';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCategorias from './pages/admin/Categorias';
import ClientesPage from './pages/admin/ClientesPage';
import ProveedoresPage from './pages/admin/ProveedoresPage';
import ProductosPage from './pages/admin/Productos';
import DevolucionesPage from './pages/admin/DevolucionesPage';
import RolesPage from './pages/admin/RolesPage';
import UsersPage from './pages/admin/UsersPage';
import VentasPage from './pages/admin/VentasPage';
import ComprasPage from './pages/admin/ComprasPage';

const AppContent = () => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    navigate('/');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const updateCart = (newCartItems) => {
    setCartItems(newCartItems);
    localStorage.setItem('cart', JSON.stringify(newCartItems));
  };

  // Función para agregar productos al carrito
  const addToCart = (product) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      const updatedCart = cartItems.map(item =>
        item.id === product.id
          ? { ...item, quantity: (item.quantity || 1) + 1 }
          : item
      );
      updateCart(updatedCart);
    } else {
      updateCart([...cartItems, { ...product, quantity: 1 }]);
    }
  };

  const cartItemCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);

  const showHeader = !location.pathname.startsWith('/admin') && location.pathname !== '/login';

  return (
    <>
      {showHeader && (
        <Header
          user={user}
          onLoginClick={handleLoginClick}
          onLogout={handleLogout}
          cartItemCount={cartItemCount}
          cartItems={cartItems}
          updateCart={updateCart}
        />
      )}
      
      <Routes>
        {/* RUTAS PÚBLICAS PRINCIPALES */}
        {/* --- ¡CORRECCIÓN PRINCIPAL AQUÍ! --- */}
        <Route path="/" element={<Home addToCart={addToCart} />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        
        {/* RUTAS DEL HEADER */}
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/ofertas" element={<Ofertas />} />
        {/* --- NUEVA RUTA AÑADIDA AQUÍ --- */}
        <Route path="/productos" element={<Productos addToCart={addToCart} />} />
        <Route 
          path="/cart" 
          element={
            <Cart 
              cartItems={cartItems} 
              updateCart={updateCart} 
              user={user} 
            />
          } 
        />
        <Route path="/perfil" element={<Profile />} />
        <Route 
          path="/search" 
          element={<SearchResults addToCart={addToCart} />} 
        />

        {/* RUTAS ADMIN (Protegidas por autenticación) */}
        <Route 
          path="/admin" 
          element={user ? <AdminLayoutClean /> : <Navigate to="/login" />}
        >
          <Route index element={<AdminDashboard />} />
          <Route path="categories" element={<AdminCategorias />} />
          <Route path="products" element={<ProductosPage />} />
          <Route path="customers" element={<ClientesPage />} />
          <Route path="suppliers" element={<ProveedoresPage />} />
          <Route path="sales" element={<VentasPage />} />
          <Route path="orders" element={<ComprasPage />} />
          <Route path="returns" element={<DevolucionesPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="roles" element={<RolesPage />} />
        </Route>

        {/* Redirección por defecto */}
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