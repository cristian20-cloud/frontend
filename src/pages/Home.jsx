// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; 
import Footer from "../components/Footer";
import { 
  FaArrowRight, FaFire, FaStar, FaChevronRight, 
  FaShoppingCart, FaChevronLeft, FaChevronRight as FaChevronRightIcon,
  FaTimes 
} from "react-icons/fa";
import { initialProducts } from "../data";

const Home = ({ addToCart }) => {
  const [carouselIndices, setCarouselIndices] = useState({
    ofertas: 0,
    destacados: 0,
    masComprados: 0
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [tallaSelections, setTallaSelections] = useState({}); // { "M": 2, "L": 1 }
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (selectedProduct) {
      const initial = {};
      (selectedProduct.tallas || []).forEach(t => {
        initial[t] = 0;
      });
      setTallaSelections(initial);
      setActiveImageIndex(0);
    }
  }, [selectedProduct]);

  const ofertas = initialProducts.filter(p => p.hasDiscount && p.isActive).slice(0, 12);
  const destacados = initialProducts.filter((p) => (p.destacado || p.isFeatured) && p.isActive).slice(0, 12);
  const masComprados = initialProducts.filter(p => p.isActive).slice(0, 12);

  const handleCarouselScroll = (section, direction) => {
    setCarouselIndices(prev => {
      const current = prev[section];
      const items = section === 'ofertas' ? ofertas : section === 'destacados' ? destacados : masComprados;
      const maxIndex = Math.ceil(items.length / 4) - 1; 
      let newIndex = current;
      if (direction === 'left') newIndex = Math.max(0, current - 1);
      else if (direction === 'right') newIndex = Math.min(maxIndex, current + 1);
      return { ...prev, [section]: newIndex };
    });
  };

  const ProductCard = ({ product }) => {
    const handleOpenModal = () => {
      setSelectedProduct(product);
    };

    const handleGoToCart = (e) => {
      e.stopPropagation();
      navigate("/cart");
    };

    return (
      <div className="temu-card" onClick={handleOpenModal}>
        <div className="temu-img-wrapper">
          <img src={product.imagenes?.[0]} alt={product.nombre} className="temu-img" />
          {product.hasDiscount && <span className="temu-badge-mini">Oferta</span>}
        </div>
        <div className="temu-info-box">
          <h3 className="temu-product-title">{product.nombre}</h3>
          <div className="temu-stars-row">
            <div className="stars-mini">
              <FaStar size={9} /><FaStar size={9} /><FaStar size={9} /><FaStar size={9} /><FaStar size={9} />
            </div>
            <span className="reviews-mini">(92)</span>
          </div>
          <div className="temu-price-row">
            <div className="price-main">
              <span className="symbol-mini">$</span>
              <span className="value-mini">{Math.round(product.precio || 0).toLocaleString()}</span>
            </div>
            <button className="btn-cart-mini" onClick={handleGoToCart}>
              <FaShoppingCart size={13} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const updateCantidad = (talla, delta) => {
    setTallaSelections(prev => {
      const current = prev[talla] || 0;
      const newValue = Math.max(0, current + delta);
      return { ...prev, [talla]: newValue };
    });
  };

  const handleAddAllToCart = () => {
    const itemsToAdd = [];
    Object.entries(tallaSelections).forEach(([talla, cantidad]) => {
      if (cantidad > 0) {
        const item = {
          ...selectedProduct,
          id: `${selectedProduct.id}-${talla}`,
          tallaSeleccionada: talla,
          cantidad: cantidad
        };
        itemsToAdd.push(item);
      }
    });

    if (itemsToAdd.length === 0) return;

    itemsToAdd.forEach(item => {
      addToCart(item, item.cantidad);
    });

    setSelectedProduct(null);
    navigate("/cart");
  };

  const totalCantidad = Object.values(tallaSelections).reduce((sum, qty) => sum + qty, 0);

  return (
    <div className="home-wrapper">
      {/* BANNER CON MÁS ESPACIO ARRIBA */}
      <section className="hero-compact">
        <div className="hero-overlay">
          <div className="hero-content">
            <span className="hero-label">Exclusividad 2025</span>
            <h1 className="hero-title">GORRAS MEDELLÍN</h1>
            <p className="hero-subtext">Estilo premium a tu alcance.</p>
            <Link to="/categorias" className="btn-hero-explore">
              <span>Explorar</span> <FaChevronRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      <div className="container-main">
        {[
          { title: "Ofertas", span: "Especiales", icon: <FaFire />, data: ofertas, id: "ofertas", link: "/ofertas" },
          { title: "Gorras", span: "Destacadas", icon: <FaStar />, data: destacados, id: "destacados", link: "/productos?filter=destacados" },
          { title: "Los Más", span: "Comprados", icon: <FaShoppingCart />, data: masComprados, id: "masComprados", link: "/productos" }
        ].map((section) => (
          <div key={section.id} className="home-section">
            <div className="section-top">
              <div className="section-title-group">
                <span className="section-icon-yellow">{section.icon}</span>
                <h2 className="section-title-text">{section.title} <span>{section.span}</span></h2>
              </div>
              <Link to={section.link} className="btn-section-link">
                <span>Ver Todas</span> <FaArrowRight size={11} />
              </Link>
            </div>
            <div className="carousel-outer">
              <button className="nav-arrow left-arrow" onClick={() => handleCarouselScroll(section.id, 'left')} disabled={carouselIndices[section.id] === 0}>
                <FaChevronLeft size={16} />
              </button>
              <div className="carousel-inner">
                <div className="carousel-track-move" style={{ transform: `translateX(-${carouselIndices[section.id] * 100}%)` }}>
                  {section.data.map((p) => <div key={p.id} className="carousel-card-slot"><ProductCard product={p} /></div>)}
                </div>
              </div>
              <button className="nav-arrow right-arrow" onClick={() => handleCarouselScroll(section.id, 'right')} disabled={carouselIndices[section.id] >= Math.ceil(section.data.length / 4) - 1}>
                <FaChevronRightIcon size={16} />
              </button>
            </div>
          </div>
        ))}

        <div className="section-top" style={{marginTop: '50px', borderTop: '1px solid #1f2937', paddingTop: '30px'}}>
          <div className="section-title-group">
            <h2 className="section-title-text">Todos los <span>Productos</span></h2>
          </div>
          <Link to="/productos" className="btn-section-link">
            <span>Ver Catálogo</span> <FaArrowRight size={11} />
          </Link>
        </div>
      </div>

      <Footer />

      {/* MODAL DE DETALLES OSCURO - ESTILO COMO EN TU IMAGEN */}
      {selectedProduct && (
        <div className="product-modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="product-modal-content dark" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedProduct(null)}><FaTimes size={20} /></button>

            <div className="modal-left">
              <div className="main-image-container">
                <img 
                  src={selectedProduct.imagenes?.[activeImageIndex] || selectedProduct.imagenes?.[0]} 
                  alt={selectedProduct.nombre} 
                  className="modal-image"
                />
              </div>

              {selectedProduct.imagenes && selectedProduct.imagenes.length > 1 && (
                <div className="thumbnail-strip">
                  {selectedProduct.imagenes.map((img, idx) => (
                    <button 
                      key={idx} 
                      className={`thumbnail-btn ${idx === activeImageIndex ? 'active' : ''}`}
                      onClick={() => setActiveImageIndex(idx)}
                    >
                      <img src={img} alt={`Miniatura ${idx + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-right">
              <h2 className="modal-title">{selectedProduct.nombre}</h2>
              
              <div className="modal-stars">
                <div className="stars-mini">
                  <FaStar size={12} /><FaStar size={12} /><FaStar size={12} /><FaStar size={12} /><FaStar size={12} />
                </div>
                <span className="reviews-mini">(92)</span>
              </div>

              <div className="modal-price">
                <span className="new-price">$ {Math.round(selectedProduct.precio).toLocaleString()}</span>
              </div>

              {selectedProduct.tallas && selectedProduct.tallas.length > 0 && (
                <div className="modal-sizes">
                  <label>Tallas disponibles:</label>
                  <div className="size-buttons-row">
                    {selectedProduct.tallas.map((talla) => {
                      const stock = selectedProduct.stockPorTalla?.[talla] || 0;
                      const isSelected = tallaSelections[talla] > 0;
                      const isLowStock = stock > 0 && stock <= 5;
                      const isAvailable = stock > 0;

                      return (
                        <button
                          key={talla}
                          className={`size-btn ${isAvailable ? (isSelected ? 'selected' : '') : 'out-of-stock'} ${isLowStock ? 'low-stock' : ''}`}
                          onClick={() => isAvailable && updateCantidad(talla, 1)}
                          disabled={!isAvailable}
                        >
                          {talla}
                          {stock > 0 && (
                            <span className={`stock-indicator ${isLowStock ? 'low' : ''}`}>
                              {stock}
                            </span>
                          )}
                          {/* No se muestra nada si stock === 0 */}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {totalCantidad > 0 ? (
                <button 
                  className="btn-add-to-cart-modal"
                  onClick={handleAddAllToCart}
                >
                  <FaShoppingCart size={16} /> Ver Carrito ({totalCantidad})
                </button>
              ) : (
                <button 
                  className="btn-add-to-cart-modal"
                  onClick={() => setSelectedProduct(null)}
                >
                  Agregar al Carrito
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .home-wrapper { 
          background: #030712; 
          color: white; 
          font-family: 'Inter', sans-serif; 
        }
        .container-main { 
          max-width: 1300px; 
          margin: 0 auto; 
          padding: 20px; 
        }

        /* BANNER MEJORADO */
        .hero-compact {
          margin-top: 20px;
          height: 45vh;
          background: linear-gradient(rgba(3,7,18,0.5), #030712), url("https://res.cloudinary.com/dxc5qqsjd/image/upload/v1764642176/WhatsApp_Image_2025-12-01_at_9.07.34_PM_a3k3ob.jpg  ");
          background-size: cover; 
          background-position: center; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          position: relative;
          border-radius: 12px;
        }
        .hero-title { 
          font-size: 3rem; 
          font-weight: 900; 
          margin: 5px 0; 
        }
        .hero-label { 
          color: #FFC107; 
          font-weight: 700; 
          text-transform: uppercase; 
          letter-spacing: 3px; 
          font-size: 0.8rem; 
        }
        .hero-subtext { 
          font-size: 1rem; 
          opacity: 0.8; 
          margin-bottom: 20px; 
        }
        .hero-content { 
          text-align: center; 
        }
        .btn-hero-explore {
          position: absolute; 
          bottom: 30px; 
          right: 50px; 
          background: #030712; 
          color: #FFC107;
          padding: 10px 22px; 
          border: 1.5px solid #FFC107; 
          border-radius: 30px;
          display: inline-flex; 
          align-items: center; 
          gap: 8px; 
          text-decoration: none; 
          font-weight: 800; 
          font-size: 0.85rem; 
          transition: 0.3s;
        }

        /* SECCIONES */
        .home-section { margin-bottom: 40px; }
        .section-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .section-title-group { display: flex; align-items: center; gap: 10px; }
        .section-title-text { font-size: 1.1rem; font-weight: 800; color: #FFC107; text-transform: uppercase; margin: 0; }
        .section-title-text span { color: white; }
        .section-icon-yellow { color: #FFC107; font-size: 1rem; display: flex; align-items: center; }
        .btn-section-link {
          background: transparent; color: #FFC107; padding: 6px 16px; border: 1px solid #FFC107; 
          border-radius: 20px; font-size: 0.7rem; font-weight: 700; display: inline-flex; align-items: center; gap: 8px; text-decoration: none;
        }

        /* CARDS */
        .carousel-inner { overflow: hidden; width: 100%; }
        .carousel-track-move { display: flex; transition: transform 0.5s ease; }
        .carousel-card-slot { min-width: 25%; padding: 0 8px; box-sizing: border-box; }
        .temu-card { background: #111827; border-radius: 10px; overflow: hidden; transition: 0.3s; cursor: pointer; }
        .temu-img-wrapper { height: 210px; position: relative; background: #000; overflow: hidden; }
        .temu-img { width: 100%; height: 100%; object-fit: cover; transition: 0.4s; }
        .temu-badge-mini { position: absolute; top: 8px; left: 8px; background: #FFC107; color: #000; font-size: 0.6rem; font-weight: 900; padding: 2px 6px; border-radius: 3px; }
        .temu-info-box { padding: 10px; }
        .temu-product-title { font-size: 0.8rem; color: #e5e7eb; font-weight: 500; margin: 0 0 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .temu-stars-row { display: flex; align-items: center; gap: 4px; margin-bottom: 8px; }
        .stars-mini { color: #FFC107; display: flex; gap: 1px; }
        .reviews-mini { color: #9ca3af; font-size: 0.65rem; }
        .temu-price-row { display: flex; justify-content: space-between; align-items: center; }
        .price-main { color: #FFC107; font-weight: 800; display: flex; align-items: baseline; gap: 1px; }
        .symbol-mini { font-size: 0.8rem; }
        .value-mini { font-size: 1.2rem; }
        .btn-cart-mini {
          background: #FFC107; color: #000; border: none; width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
        }
        .carousel-outer { position: relative; display: flex; align-items: center; }
        .nav-arrow {
          position: absolute; top: 50%; transform: translateY(-50%); width: 34px; height: 34px;
          background: #FFC107; color: #000; border: none; border-radius: 50%; cursor: pointer; z-index: 10;
          display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        }
        .left-arrow { left: -15px; }
        .right-arrow { right: -15px; }
        .nav-arrow:disabled { opacity: 0; pointer-events: none; }

        /* MODAL */
        .product-modal-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0, 0, 0, 0.85);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999; padding: 20px;
        }
        .product-modal-content.dark {
          background: #111827;
          color: white;
          border: 1px solid #333;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          max-width: 800px; width: 100%; display: flex; gap: 20px;
          padding: 20px; position: relative;
        }
        .modal-close {
          position: absolute; top: 10px; right: 10px;
          background: transparent; border: none; font-size: 20px;
          cursor: pointer; color: #aaa; transition: 0.2s;
        }
        .modal-close:hover { color: #FFC107; }
        .modal-left { flex: 1; display: flex; flex-direction: column; gap: 10px; }
        .main-image-container {
          width: 100%;
          height: 300px;
          background: #000;
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .modal-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          border-radius: 8px;
        }
        .thumbnail-strip {
          display: flex; gap: 8px;
          justify-content: center;
        }
        .thumbnail-btn {
          width: 60px;
          height: 60px;
          border: 2px solid transparent;
          border-radius: 6px;
          overflow: hidden;
          cursor: pointer;
          transition: 0.2s;
          background: #1f2937;
          padding: 2px;
        }
        .thumbnail-btn.active {
          border-color: #FFC107;
        }
        .thumbnail-btn img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 4px;
        }
        .modal-right { flex: 1; display: flex; flex-direction: column; gap: 15px; }
        .modal-title { font-size: 1.5rem; font-weight: 700; margin: 0; }
        .modal-stars { display: flex; align-items: center; gap: 8px; }
        .modal-price { margin: 10px 0; }
        .new-price { color: #FFC107; font-size: 1.5rem; font-weight: 800; }
        .modal-sizes { margin-top: 15px; }
        .modal-sizes label { display: block; font-weight: 600; margin-bottom: 8px; color: #e5e7eb; }
        .size-buttons-row {
          display: flex; flex-wrap: wrap; gap: 8px;
        }
        .size-btn {
          padding: 8px 16px;
          border: 2px solid #FFC107; /* Borde AMARILLO para todas las tallas */
          border-radius: 20px;
          background: #1f2937;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
          position: relative;
          min-width: 50px;
          text-align: center;
        }
        .size-btn.selected {
          border-color: #FFD700; /* Borde más claro cuando seleccionado */
          background: #1f2937;
        }
        .size-btn.out-of-stock {
          background: #111827;
          color: #6b7280;
          cursor: not-allowed;
          border-color: #FFC107; /* Mantener el borde amarillo */
        }
        .size-btn.low-stock {
          border-color: #dc2626;
        }
        .size-btn.low-stock.selected {
          border-color: #dc2626;
        }
        .size-btn:hover:not(.out-of-stock) {
          border-color: #4b5563;
        }
        .size-btn.selected:hover {
          border-color: #FFD700;
        }
        .stock-indicator {
          position: absolute;
          top: -6px;
          right: -6px;
          background: #FFC107;
          color: #000;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .stock-indicator.low {
          background: #dc2626;
          color: white;
        }
        .btn-add-to-cart-modal {
          background: #FFC107;
          color: #000;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 10px;
          transition: 0.2s;
          width: 100%;
        }
        .btn-add-to-cart-modal:hover {
          background: #FFD700;
        }

        @media (max-width: 1024px) { 
          .carousel-card-slot { min-width: 33.33%; } 
        }
        @media (max-width: 768px) { 
          .carousel-card-slot { min-width: 50%; } 
          .hero-title { font-size: 2.2rem; } 
          .product-modal-content.dark { flex-direction: column; }
        }
        @media (max-width: 480px) { 
          .carousel-card-slot { min-width: 100%; } 
          .btn-hero-explore { right: 20px; bottom: 20px; } 
          .size-btn { padding: 6px 12px; font-size: 0.8rem; }
        }
      `}</style>
    </div>
  );
};

export default Home;