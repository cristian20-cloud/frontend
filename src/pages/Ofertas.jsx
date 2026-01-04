// src/pages/Ofertas.jsx
import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import { 
  FaArrowRight, 
  FaFire, 
  FaShoppingCart, 
  FaTimes,
  FaTag,
  FaExclamationCircle
} from "react-icons/fa";
import { initialProducts, initialSizes } from "../data";

const Ofertas = ({ addToCart }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const ofertas = useMemo(() => {
    return initialProducts.filter(p => 
      p.hasDiscount && 
      p.originalPrice > p.precio && 
      p.isActive
    );
  }, []);

  // --- COMPONENTE DE TARJETA COPIADO DE HOME.JSX ---
  const LIMITE_STOCK_BAJO = 10;
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
          {product.hasDiscount && <span className="badge-oferta-top">-OFERTA</span>}
          {esDestacado && <span className="badge-destacado-top">DESTACADO</span>}
          
          <div className={`img-hover-overlay ${isHovered ? 'show' : ''}`}>
            <button className="btn-quick-view">VER DETALLES</button>
          </div>
          
          <div className={`cart-circle-btn-overlay ${isHovered ? 'show' : ''}`}>
            <button 
              className="cart-circle-btn"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedProduct(product);
              }}
            >
              <FaShoppingCart size={14} />
            </button>
          </div>
        </div>
        
        <div className="product-info-container">
          <h3 className="product-name-label">{product.nombre}</h3>
          <div className="price-action-row">
            <span className="current-price">${Math.round(precioPrincipal).toLocaleString()}</span>
          </div>
          {stockActual > 0 && stockActual <= LIMITE_STOCK_BAJO && (
            <p className="low-stock-message">¡Solo quedan {stockActual} unidades!</p>
          )}
        </div>
      </div>
    );
  };

  // ======================================================
  // MODAL ACTUALIZADO: AJUSTES FINALES (IMAGEN LLENA, SIN PREMIUM)
  // ======================================================
  const ProductModal = ({ product, onClose, addToCart }) => {
    if (!product) return null;

    const [selectedSize, setSelectedSize] = useState("");
    const [quantity, setQuantity] = useState(1);
    const availableSizeOptions = initialSizes.filter(sizeOpt =>
      !product.tallas || product.tallas.includes(sizeOpt.value)
    );
    const [selectedImage, setSelectedImage] = useState(null);
    const [showSizeError, setShowSizeError] = useState(false);

    const handleAddToCartAndClose = () => {
      if (!selectedSize && availableSizeOptions.length > 0) {
        setShowSizeError(true);
        return;
      }
      const finalSize = selectedSize || (availableSizeOptions.length > 0 ? availableSizeOptions[0].value : "Única");
      const productToAdd = { 
        ...product, 
        tallaSeleccionada: finalSize,
        cantidad: quantity,
        idUnico: `${product.id}-${finalSize}-${Date.now()}`
      };
      addToCart(productToAdd);
      onClose();
    };

    const handleSizeSelect = (size) => {
      setSelectedSize(size);
      setShowSizeError(false);
    };

    const handleIncreaseQuantity = () => setQuantity(q => q + 1);
    const handleDecreaseQuantity = () => setQuantity(q => q > 1 ? q - 1 : 1);

    const openFullscreenImage = (imageUrl) => {
      setSelectedImage(imageUrl);
    };

    const FullscreenImageModal = ({ imageUrl, onClose }) => {
      if (!imageUrl) return null;
      return (
        <div className="fullscreen-modal-overlay" onClick={onClose}>
          <div className="fullscreen-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="fullscreen-modal-close" onClick={onClose}>
              <FaTimes size={20} />
            </button>
            <img src={imageUrl} alt="Imagen a pantalla completa" className="fullscreen-image" />
          </div>
        </div>
      );
    };

    // Calculamos el subtotal
    const subtotal = product.precio * quantity;

    return (
      <>
        <div className="modal-overlay" onClick={onClose}>
          <div className="modal-content modal-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-centered-container">
              <div className="modal-image-section">
                <div className="modal-image-centered">
                  <img
                    src={product.imagenes?.[0] || "https://via.placeholder.com/600x400/1E293B/FFFFFF?text=Sin+Imagen"}
                    alt={product.nombre}
                    className="modal-img-main-centered"
                    onClick={() => openFullscreenImage(product.imagenes?.[0])}
                    style={{ cursor: 'pointer' }}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/600x400/1E293B/FFFFFF?text=Sin+Imagen";
                    }}
                  />
                </div>
              </div>

              <div className="modal-info-centered">
                <div className="tags-top-centered">
                  {product.tags?.map((tag, index) => (
                    <span key={index} className="tag-item-centered">
                      <FaTag size={8} /> #{tag.toUpperCase()}
                    </span>
                  ))}
                </div>

                <div className="modal-name-price-row">
                  <span className="modal-product-type">{product.nombre}</span>
                  <span className="product-price-inline">${product.precio.toLocaleString()}</span>
                </div>

                <div className="subtotal-quantity-row">
                  <span className="subtotal-text">Subtotal: ${subtotal.toLocaleString()}</span>
                  <div className="quantity-controls-in-line">
                    <span className="quantity-label">Cantidad:</span>
                    <button 
                      className="quantity-btn-in-line minus"
                      onClick={handleDecreaseQuantity}
                    >
                      -
                    </button>
                    <span className="quantity-display-in-line">{quantity}</span>
                    <button 
                      className="quantity-btn-in-line plus"
                      onClick={handleIncreaseQuantity}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="size-buttons-section">
                  <div className="size-buttons-label">Talla:</div>
                  {showSizeError && availableSizeOptions.length > 0 && (
                    <div className="size-error-alert">
                      <FaExclamationCircle size={12} />
                      <span>Debe seleccionar una talla</span>
                    </div>
                  )}
                  <div className="size-buttons-container">
                    {availableSizeOptions.length > 0 ? (
                      availableSizeOptions.map((sizeOption) => (
                        <button
                          key={sizeOption.value}
                          className={`size-button ${selectedSize === sizeOption.value ? 'size-button-selected' : ''}`}
                          onClick={() => handleSizeSelect(sizeOption.value)}
                        >
                          {sizeOption.label}
                        </button>
                      ))
                    ) : (
                      <button className="size-button size-button-selected" disabled>
                        Única
                      </button>
                    )}
                  </div>
                </div>

                <div className="addcart-section-centered">
                  <button 
                    className="addcart-btn-centered" 
                    onClick={handleAddToCartAndClose}
                  >
                    <FaShoppingCart size={14} /> 
                    <span>Añadir al Carrito</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {selectedImage && (
          <FullscreenImageModal 
            imageUrl={selectedImage} 
            onClose={() => setSelectedImage(null)} 
          />
        )}
      </>
    );
  };

  return (
    <div style={{ background: "#030712", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
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
        <div
          style={{
            position: "absolute",
            top: "-40px",
            left: 0,
            width: "100%",
            height: "80px",
            background: "#FFFF",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "15px",
            marginBottom: "20px",
          }}
        >
          <FaFire size={28} color="#FF4757" />
          <h1 style={{ color: "white", fontSize: "3rem", fontWeight: "700", margin: 0 }}>
            Ofertas Especiales
          </h1>
        </div>

        <p
          style={{
            color: "#cbd5e1",
            fontSize: "1.2rem",
            maxWidth: "900px",
            margin: "0 auto",
            lineHeight: "1.6",
            marginBottom: "10px",
          }}
        >
          Ahorra en tus productos favoritos con descuentos reales. Encuentra las mejores ofertas en gorras y accesorios.
        </p>

        <p style={{ color: "#FFC107", fontSize: "1.4rem", fontWeight: "700" }}>
          {ofertas.length} productos en oferta
        </p>

        <div
          style={{
            position: "absolute",
            bottom: "-40px",
            left: 0,
            width: "100%",
            height: "80px",
            background: "#030712",
            borderTopLeftRadius: "50% 80%",
            borderTopRightRadius: "50% 80%",
          }}
        />
      </section>

      {/* --- GRID DE PRODUCTOS CON EL MISMO ESTILO DEL HOME --- */}
      <div className="container-main">
        <div className="products-grid">
          {ofertas.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>

        {ofertas.length === 0 && (
          <div style={{ textAlign: "center", color: "#94A3B8", padding: "50px 20px" }}>
            <p style={{ fontSize: "1.2rem" }}>No hay ofertas disponibles en este momento.</p>
            <Link 
              to="/productos" 
              style={{
                display: "inline-block",
                marginTop: "20px",
                padding: "10px 20px",
                background: "#FFC107",
                color: "#000",
                textDecoration: "none",
                borderRadius: "6px",
                fontWeight: "bold"
              }}
            >
              Ver todos los productos
            </Link>
          </div>
        )}

        {/* --- SECCIÓN DE "TODOS LOS PRODUCTOS" CON TEXTO Y BOTÓN --- */}
        <div className="section-products-header">
          <h2 className="section-title-left">Todos los Productos</h2>
          <Link to="/productos" className="btn-see-all">
            Ver Todas <FaArrowRight size={12} />
          </Link>
        </div>
      </div>

      <Footer />

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          addToCart={addToCart}
        />
      )}

      <style>{`
        /* --- CONTENEDOR PRINCIPAL PARA QUE LAS TARJETAS SE VEAN COMO EN EL HOME --- */
        .container-main { 
          max-width: 1300px; 
          margin: 0 auto; 
          padding: 40px 20px; 
        }

        .products-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
          gap: 20px; 
          margin-bottom: 40px;
        }

        /* --- ESTILO DE TARJETA COPIADO DE HOME.JSX --- */
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

        /* --- NUEVO: Estilo para la sección de "Todos los Productos" --- */
        .section-products-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 60px;
          margin-bottom: 20px;
        }
        .section-title-left {
          color: #FFC107;
          font-size: 1.2rem;
          font-weight: 800;
          margin: 0;
        }
        .section-title-left span {
          color: #fff;
        }

        .btn-see-all {
          background: #030712;
          color: #FFC107;
          padding: 10px 20px;
          border: 1px solid #FFC107;
          border-radius: 20px;
          text-decoration: none;
          font-weight: 700;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: 0.3s;
        }
        .btn-see-all:hover {
          background: #0a1128;
          transform: translateY(-2px);
        }

        /* === MODAL CENTRADO (AJUSTES FINALES) === */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.92);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content.modal-centered {
          background: #000000;
          border: 1px solid #FFC107;
          border-radius: 10px;
          width: 400px;
          padding: 0;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.7);
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .modal-centered-container {
          display: flex;
          flex-direction: column;
        }

        .modal-image-section {
          position: relative;
          width: 100%;
          height: 220px;
          overflow: hidden;
        }

        .modal-image-centered {
          width: 100%;
          height: 100%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-img-main-centered {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border: none;
          margin: 0;
          padding: 0;
        }

        .modal-info-centered {
          display: flex;
          flex-direction: column;
          padding: 15px;
        }

        .tags-top-centered {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-bottom: 8px;
        }

        .tag-item-centered {
          background: transparent;
          color: #FFC107;
          padding: 2px 5px;
          border: 1px solid #FFC107;
          border-radius: 3px;
          font-size: 0.65rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 3px;
          text-transform: uppercase;
        }

        .modal-name-price-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          gap: 10px;
        }

        .modal-product-type {
          color: white;
          font-size: 1rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          flex: 1;
          min-width: 120px;
          word-break: break-word;
          line-height: 1.2;
        }

        .product-price-inline {
          color: #FFC107;
          font-weight: 900;
          font-size: 1.1rem;
          white-space: nowrap;
        }

        .subtotal-quantity-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          gap: 10px;
        }

        .subtotal-text {
          color: #FFC107;
          font-weight: 900;
          font-size: 0.9rem;
          white-space: nowrap;
        }

        .quantity-controls-in-line {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(0, 0, 0, 0.8);
          padding: 4px 8px;
          border-radius: 4px;
        }

        .quantity-label {
          color: white;
          font-size: 0.85rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .quantity-btn-in-line {
          width: 22px;
          height: 22px;
          background: #111;
          border: 1px solid #334155;
          color: white;
          border-radius: 3px;
          font-size: 0.8rem;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .quantity-btn-in-line:hover {
          border-color: #FFC107;
          background: rgba(255, 193, 7, 0.1);
        }

        .quantity-display-in-line {
          color: white;
          font-size: 0.9rem;
          font-weight: 700;
          min-width: 20px;
          text-align: center;
        }

        .size-buttons-section {
          margin-bottom: 15px;
        }

        .size-buttons-label {
          color: #94A3B8;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .size-error-alert {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 87, 87, 0.1);
          color: #FF5757;
          padding: 6px 10px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          margin-bottom: 10px;
          border: 1px solid rgba(255, 87, 87, 0.3);
        }

        .size-buttons-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
        }

        .size-button {
          background: transparent;
          color: #FFC107;
          border: 1px solid #FFC107;
          padding: 8px 4px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 0;
          text-align: center;
          box-shadow: none;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .size-button:hover {
          background: rgba(255, 193, 7, 0.05);
        }

        .size-button-selected {
          background: #FFD700;
          color: #000;
          border-color: #FFC107;
          font-weight: 700;
          box-shadow: none;
        }

        .addcart-btn-centered {
          background: transparent;
          color: #FFC107;
          border: none;
          padding: 12px 0;
          font-weight: 800;
          font-size: 1rem;
          cursor: pointer;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          transition: all 0.2s ease;
        }

        .addcart-btn-centered:hover {
          text-shadow: 0 0 8px rgba(255, 193, 7, 0.5);
        }

        .fullscreen-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.98);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1001;
          padding: 20px;
        }
        .fullscreen-modal-close {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.7);
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 10px;
          border-radius: 50%;
        }
        .fullscreen-modal-close:hover {
          background: rgba(255, 193, 7, 0.8);
          color: #000;
        }
        .fullscreen-image {
          max-width: 100%;
          max-height: 90vh;
          object-fit: contain;
          border-radius: 8px;
        }

        /* RESPONSIVE */
        @media (max-width: 576px) {
          .products-grid { 
            grid-template-columns: 1fr; 
            gap: 15px; 
          }
          .section-products-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
          .btn-see-all {
            width: 100%;
            padding: 14px 20px;
            font-size: 0.95rem;
            justify-content: center;
          }
          .modal-content.modal-centered { 
            width: 95%; 
          }
        }

        @media (min-width: 577px) and (max-width: 768px) {
          .products-grid { 
            grid-template-columns: repeat(2, 1fr); 
            gap: 15px; 
          }
          .section-products-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
          .btn-see-all {
            align-self: flex-end;
          }
          .modal-content.modal-centered { 
            width: 90%; 
            max-width: 400px; 
          }
        }

        @media (min-width: 769px) and (max-width: 1023px) {
          .products-grid { 
            grid-template-columns: repeat(3, 1fr); 
            gap: 20px; 
          }
        }

        @media (min-width: 1024px) {
          .products-grid { 
            grid-template-columns: repeat(4, 1fr); 
            gap: 20px; 
          }
        }
      `}</style>
    </div>
  );
};

export default Ofertas;