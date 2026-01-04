// src/pages/Productos.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { initialProducts, initialSizes } from "../data"; 
import { 
  FaArrowLeft, FaFire, FaStar, FaShoppingCart, FaTimes, 
  FaTag, FaCrown, FaExclamationCircle, FaTrophy 
} from "react-icons/fa";
import Footer from "../components/Footer";

const Productos = ({ addToCart }) => {
  const location = useLocation();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedTalla, setSelectedTalla] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // --- ESTADO PARA MANEJAR EL FILTRO ACTIVO ---
  const [activeFilter, setActiveFilter] = useState("todos");

  // EFECTO: Leer el parámetro 'filter' de la URL al cargar o cambiar la ruta
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filterParam = params.get("filter");

    // Determinamos el filtro activo basado en el parámetro de la URL
    if (filterParam === "destacados") {
      setActiveFilter("destacados");
    } else if (filterParam === "populares") {
      setActiveFilter("populares");
    } else {
      // Por defecto, mostramos todos los productos
      setActiveFilter("todos");
    }
    window.scrollTo(0, 0);
  }, [location]);

  // LÓGICA: Filtrado Dinámico basado en el estado 'activeFilter'
  const filteredProducts = useMemo(() => {
    // Siempre empezamos con la lista de productos activos
    let list = initialProducts.filter(p => p.isActive);
    
    // Aplicamos el filtro correspondiente
    if (activeFilter === "destacados") {
      return list.filter(p => p.destacado || p.isFeatured);
    }
    if (activeFilter === "populares") {
      // Filtra productos con más de 40 ventas (Más comprados)
      return list.filter(p => p.sales > 40);
    }
    // Si no hay filtro o es "todos", devolvemos la lista completa de activos
    return list;
  }, [activeFilter]);

  // Tarjeta de Producto con el estilo exacto de Home.jsx
  const ProductCard = ({ product }) => {
    const precioPrincipal = product?.precio || 0;
    const stockActual = product?.stock || 0;
    const esDestacado = product?.destacado || product?.isFeatured;
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div 
        className="modern-product-card"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="product-img-wrapper" onClick={() => setSelectedProduct(product)}>
          <img src={product.imagenes?.[0]} alt={product.nombre} className="product-img" />
          {/* Etiqueta OFERTA - ESQUINA SUPERIOR IZQUIERDA */}
          {product.hasDiscount && <span className="badge-oferta-top">-OFERTA</span>}
          {/* Etiqueta DESTACADO - ESQUINA SUPERIOR DERECHA */}
          {esDestacado && <span className="badge-destacado-top">DESTACADO</span>}
          
          {/* Botón VER DETALLES - APARECE SOLO AL HACER HOVER, EN LA PARTE INFERIOR CENTRAL */}
          <div className={`img-hover-overlay ${isHovered ? 'show' : ''}`}>
            <button className="btn-quick-view">VER DETALLES</button>
          </div>
          
          {/* ÍCONO DEL CARRITO - APARECE SOLO AL HACER HOVER, EN LA PARTE INFERIOR DERECHA */}
          <div className={`cart-circle-btn-overlay ${isHovered ? 'show' : ''}`}>
            <button 
              className="cart-circle-btn"
              onClick={(e) => {
                e.stopPropagation(); // Evita que se abra el modal al hacer clic en el carrito
                setSelectedProduct(product); // Abre el modal al hacer clic en el carrito
              }}
            >
              <FaShoppingCart size={14} />
            </button>
          </div>
        </div>
        
        {/* Nombre y Precio - SIEMPRE VISIBLES */}
        <div className="product-info-container">
          <h3 className="product-name-label">{product.nombre}</h3>
          <div className="price-action-row">
            <span className="current-price">${Math.round(precioPrincipal).toLocaleString()}</span>
            {/* El ícono del carrito ya no va aquí, ahora está en la imagen */}
          </div>
          {/* Mensaje de stock bajo */}
          {stockActual > 0 && stockActual <= 10 && (
            <p className="low-stock-message">¡Solo quedan {stockActual} unidades!</p>
          )}
        </div>
      </div>
    );
  };

  // --- MODAL COMPLETO (Copiado de Home.jsx) ---
  const closeModal = () => {
    setSelectedProduct(null);
    setSelectedTalla(null);
  };

  const handleAddToCart = () => {
    if (!selectedTalla) {
      setAlertMessage("Por favor, selecciona una talla.");
      setShowAlert(true);
      return;
    }
    addToCart(selectedProduct, 1, selectedTalla);
    closeModal();
  };

  const tallasEstandar = ["6 7/8", "7", "7 1/8", "7 1/4", "7 3/8", "7 1/2", "7 5/8", "7 3/4", "8"];

  // --- Determinamos el título a mostrar basado en el filtro activo ---
  const getBannerTitle = () => {
    if (activeFilter === "destacados") {
      return "Gorras Destacadas";
    }
    if (activeFilter === "populares") {
      return "Lo Más Comprado";
    }
    return "Explora Nuestros Productos";
  };

  const getBannerSubtitle = () => {
    if (activeFilter === "destacados") {
      return "Descubre nuestra selección de las gorras más exclusivas y populares.";
    }
    if (activeFilter === "populares") {
      return "Las gorras que más han elegido nuestros clientes. ¡Una elección garantizada!";
    }
    return "Descubre nuestra amplia selección de gorras. Desde estilos clásicos hasta las últimas tendencias, encuentra la gorra perfecta para ti.";
  };

  return (
    <div className="productos-page">
      {/* --- BANNER DINÁMICO (COPIADO DE CATEGORIAS.JSX) --- */}
      <section
        style={{
          background: "#031326",
          padding: "100px 20px 70px",
          textAlign: "center",
          borderBottomLeftRadius: "30px",
          borderBottomRightRadius: "30px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* --- ELIMINADO: No queremos el fondo blanco de arriba --- */}

        <h1
          style={{
            color: "white",
            fontSize: "3rem",
            fontWeight: "700",
            marginBottom: "20px",
          }}
        >
          {getBannerTitle()}
        </h1>

        <p
          style={{
            color: "#cbd5e1",
            fontSize: "1.2rem",
            maxWidth: "900px",
            margin: "0 auto",
            lineHeight: "1.6",
          }}
        >
          {getBannerSubtitle()}
        </p>

        <div
          style={{
            position: "absolute",
            bottom: "-40px",
            left: 0,
            right: 0,
            height: "80px",
            background: "#030712",
            borderTopLeftRadius: "50% 80%",
            borderTopRightRadius: "50% 80%",
          }}
        />
      </section>

      {/* --- MOSTRAR PRODUCTOS FILTRADOS --- */}
      <div className="container-main">
        {filteredProducts.length > 0 ? (
          <div className="products-grid">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FaExclamationCircle size={40} />
            <p>No se encontraron productos en esta categoría.</p>
          </div>
        )}

        {/* --- BOTÓN "VER TODOS LOS PRODUCTOS" (solo si hay un filtro activo) --- */}
        {(activeFilter === "destacados" || activeFilter === "populares") && (
          <div className="section-see-all-products">
            <Link to="/productos" className="btn-see-all-products">
              Ver Todos los Productos
            </Link>
          </div>
        )}
      </div>

      {/* --- MODAL COMPLETO --- */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <button className="modal-close-x" onClick={closeModal}><FaTimes /></button>
            <div className="modal-content-layout">
              <div className="modal-image-side">
                <img src={selectedProduct.imagenes?.[0]} alt={selectedProduct.nombre} />
              </div>
              <div className="modal-info-side">
                <span className="modal-category-tag">GORRAS MEDELLÍN / PREMIUM</span>
                <h2 className="modal-product-title">{selectedProduct.nombre}</h2>
                <div className="modal-price-row">
                  <span className="modal-current-price">${selectedProduct.precio.toLocaleString()}</span>
                </div>
                {selectedProduct.stock > 0 && (
                  <p className="modal-low-stock-message">¡Quedan {selectedProduct.stock} unidades!</p>
                )}
                <div className="modal-tallas-section">
                  <p className="talla-label-text">SELECCIONAR TALLA:</p>
                  <div className="tallas-grid">
                    {tallasEstandar.map(t => (
                      <button 
                        key={t} 
                        className={`talla-item ${selectedTalla === t ? 'active' : ''}`}
                        onClick={() => { setSelectedTalla(t); }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <button 
                  className={`btn-add-to-cart-big ${selectedTalla ? 'active' : 'inactive'}`}
                  onClick={handleAddToCart}
                  disabled={!selectedTalla}
                >
                  AÑADIR AL CARRITO
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ALERTA */}
      {showAlert && (
        <div className="custom-alert-overlay" onClick={() => setShowAlert(false)}>
          <div className="custom-alert-container" onClick={e => e.stopPropagation()}>
            <FaExclamationTriangle className="alert-icon" />
            <p className="alert-message">{alertMessage}</p>
            <button className="alert-button" onClick={() => setShowAlert(false)}>Aceptar</button>
          </div>
        </div>
      )}

      <Footer />

      <style>{`
        .productos-page { background: #030712; min-height: 100vh; color: white; padding: 20px 0 0 0; }
        .container-main { max-width: 1300px; margin: 0 auto; padding: 0 20px; }
        
        /* --- ESTILO DE TARJETA COPIADO DE HOME.JSX --- */
        .products-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); 
          gap: 20px; 
        }
        .modern-product-card { 
          background: #0F172A;
          border-radius: 8px; 
          overflow: hidden; 
          border: 1px solid #222; 
          transition: 0.3s;
        }
        .modern-product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        }
        .product-img-wrapper { 
          height: 240px; 
          position: relative; 
          cursor: pointer; 
        }
        .product-img { width: 100%; height: 100%; object-fit: cover; }
        
        .badge-oferta-top {
          position: absolute;
          top: 5px;
          left: 5px;
          background: #FFC107;
          color: #030712;
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 800;
          font-size: 0.7rem;
          z-index: 10;
        }
        
        .badge-destacado-top {
          position: absolute;
          top: 5px;
          right: 5px;
          background: #0047AB;
          color: #FFC107;
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 800;
          font-size: 0.7rem;
          z-index: 10;
        }
        
        .img-hover-overlay {
          position: absolute; 
          inset: 0; 
          background: rgba(0,0,0,0.3); 
          display: flex; 
          align-items: flex-end; 
          justify-content: center; 
          opacity: 0; 
          transition: 0.3s; 
          pointer-events: none;
        }
        .img-hover-overlay.show {
          opacity: 1;
          pointer-events: auto;
        }
        .btn-quick-view { 
          background: #0047AB;
          color: #fff;
          border: 1px solid #FFC107;
          padding: 8px 16px; 
          border-radius: 20px; 
          font-weight: 800; 
          cursor: pointer; 
          margin: 10px 0;
        }
        .btn-quick-view:hover {
          background: #003580;
        }
        
        .cart-circle-btn-overlay {
          position: absolute;
          bottom: 10px;
          right: 10px;
          opacity: 0;
          transition: 0.3s;
          pointer-events: none;
        }
        .cart-circle-btn-overlay.show {
          opacity: 1;
          pointer-events: auto;
        }
        .cart-circle-btn {
          width: 32px; 
          height: 32px; 
          border-radius: 50%; 
          border: none; 
          background: #f3f4f6; 
          cursor: pointer; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          transition: 0.3s;
        }
        .cart-circle-btn:hover {
          background: #FFC107;
          color: #000;
        }
        
        .product-info-container { 
          padding: 12px; 
          color: #fff; 
          display: flex;
          flex-direction: column;
          min-height: 80px;
        }
        .product-name-label { 
          font-size: 0.85rem; 
          font-weight: 600; 
          margin-bottom: 8px; 
          color: #fff;
          overflow: hidden; 
          text-overflow: ellipsis; 
          white-space: nowrap; 
        }
        .price-action-row { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          margin-bottom: 5px;
        }
        .current-price { font-weight: 800; font-size: 1.1rem; color: #fff; }
        
        .low-stock-message {
          font-size: 0.75rem;
          color: #FFC107;
          margin: 0;
          text-align: left;
        }

        .empty-state { text-align: center; padding: 100px 0; color: #4b5563; }

        /* --- BOTÓN "VER TODOS LOS PRODUCTOS" --- */
        .section-see-all-products {
          display: flex;
          justify-content: center;
          margin-top: 60px;
          margin-bottom: 60px;
        }
        .btn-see-all-products {
          background: #030712;
          color: #FFC107;
          border: 1px solid #FFC107;
          padding: 12px 30px;
          border-radius: 30px;
          text-decoration: none;
          font-weight: 800;
          font-size: 1rem;
          transition: 0.3s;
          text-align: center;
        }
        .btn-see-all-products:hover {
          background: #0a1128;
          transform: translateY(-2px);
        }

        /* --- MODAL --- */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 9999; display: flex; align-items: center; justify-content: center; }
        .modal-container { 
          background: #030712;
          width: 95%; 
          max-width: 900px; 
          border-radius: 12px; 
          overflow: hidden; 
          position: relative; 
        }
        .modal-close-x { 
          position: absolute; 
          top: 15px; 
          right: 15px; 
          background: #eee; 
          border: none; 
          border-radius: 50%; 
          width: 30px; 
          height: 30px; 
          cursor: pointer; 
          z-index: 10; 
        }
        .modal-content-layout { display: grid; grid-template-columns: 1.2fr 1fr; }
        .modal-image-side { 
          background: #030712;
          display: flex; 
          align-items: center; 
          justify-content: center; 
          padding: 20px; 
        }
        .modal-image-side img { 
          width: 100%; 
          max-height: 400px; 
          object-fit: contain; 
        }
        .modal-info-side { 
          padding: 40px; 
          color: #fff;
        }
        .modal-category-tag { 
          color: #FFC107; 
          font-weight: 800; 
          letter-spacing: 2px; 
          font-size: 0.8rem; 
          margin-bottom: 10px;
        }
        .modal-product-title { 
          font-size: 1.5rem;
          font-weight: 900; 
          margin-bottom: 10px;
          color: #fff;
        }
        .modal-price-row { 
          margin-bottom: 10px;
        }
        .modal-current-price { 
          font-size: 1.8rem;
          font-weight: 900; 
          color: #FFC500;
        }
        
        .modal-low-stock-message {
          font-size: 0.8rem;
          color: #FFC500;
          margin: 5px 0 10px;
          text-align: left;
          font-weight: 600;
        }
        
        .tallas-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin: 10px 0 20px; }
        .talla-item { 
          border: 1px solid #FFC500;
          background: #030712;
          padding: 6px 0;
          font-weight: 700; 
          cursor: pointer; 
          border-radius: 4px; 
          color: #fff;
          font-size: 0.8rem;
          transition: 0.2s;
        }
        .talla-item.active { 
          background: #FFC500;
          color: #030712;
          border-color: #FFC500; 
        }
        .talla-item:hover {
          background: #FFC500;
          color: #030712;
          border-color: #FFC500;
        }
        
        .btn-add-to-cart-big { 
          width: 100%; 
          border: none; 
          padding: 15px;
          border-radius: 30px; 
          font-weight: 900; 
          cursor: pointer; 
          transition: 0.3s; 
          font-size: 0.95rem;
        }
        .btn-add-to-cart-big.inactive { 
          background: #030712;
          color: #FFC500;
          opacity: 0.7;
          cursor: not-allowed;
        }
        .btn-add-to-cart-big.inactive:hover { 
          background: #030712; 
          color: #FFC500;
          transform: none;
        }
        .btn-add-to-cart-big.active { 
          background: #FFC500;
          color: #030712;
        }
        .btn-add-to-cart-big.active:hover { 
          background: #030712;
          color: #FFC500;
          transform: scale(1.02);
        }

        /* --- ALERTA --- */
        .custom-alert-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.85);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .custom-alert-container {
          background: #030712;
          padding: 20px;
          border-radius: 10px;
          text-align: center;
          max-width: 300px;
          border: 1px solid #FFC107;
        }
        .alert-icon {
          color: #FFC107;
          font-size: 2rem;
          margin-bottom: 10px;
        }
        .alert-message {
          color: #fff;
          margin: 0 0 15px;
          font-size: 0.9rem;
        }
        .alert-button {
          background: #FFC107;
          color: #030712;
          border: none;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.3s;
        }
        .alert-button:hover {
          background: #030712;
          color: #FFC107;
          border: 1px solid #FFC107;
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .products-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .modal-content-layout { grid-template-columns: 1fr; }
          .btn-see-all-products {
            font-size: 0.9rem;
            padding: 10px 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default Productos;