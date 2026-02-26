// src/pages/Productos.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { initialProducts } from "../data";
import {
  FaChevronLeft,
  FaChevronRight,
  FaShoppingCart,
  FaTimes,
  FaStar,
  FaRegStar,
  FaStarHalfAlt,
  FaMinus,
  FaPlus,
} from "react-icons/fa";
import Footer from "../components/Footer";

const Productos = ({ addToCart }) => {
  const location = useLocation();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [carouselIndices, setCarouselIndices] = useState({});
  const sectionRefs = useRef({});

  // Leer el parámetro 'categoria' de la URL
  const searchParams = new URLSearchParams(location.search);
  const categoriaFiltro = searchParams.get("categoria");

  // Helpers
  const clampRating = (r) => {
    const n = Number(r);
    if (Number.isNaN(n)) return null;
    return Math.max(0, Math.min(5, n));
  };

  const getRatingFromProduct = (p) =>
    clampRating(p?.rating) ??
    clampRating(p?.calificacion) ??
    clampRating(p?.stars) ??
    clampRating(p?.score) ??
    null;

  const RatingStars = ({ value }) => {
    if (value == null) return null;
    const full = Math.floor(value);
    const half = value - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;

    return (
      <span className="gm-rating" title={`Calificación: ${value}/5`}>
        {Array.from({ length: full }).map((_, i) => (
          <FaStar key={`f-${i}`} />
        ))}
        {half === 1 && <FaStarHalfAlt />}
        {Array.from({ length: empty }).map((_, i) => (
          <FaRegStar key={`e-${i}`} />
        ))}
      </span>
    );
  };

  const normalizeSizes = (product) => {
    const t = product?.tallas;
    if (!t) return [];
    if (Array.isArray(t))
      return t
        .filter(Boolean)
        .map((x) => String(x).trim())
        .filter(Boolean);
    if (typeof t === "string")
      return t
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    if (typeof t === "object") return Object.keys(t).filter((k) => Boolean(t[k]));
    return [];
  };

  const safeImg = (product) => {
    const first =
      product?.imagenes?.[0]?.trim?.() ||
      product?.imagen?.trim?.() ||
      "https://via.placeholder.com/800x800?text=Sin+Imagen";
    return first;
  };

  // Agrupar productos por categoría (siempre todos)
  const productsByCategory = useMemo(() => {
    const activeProducts = (initialProducts || []).filter((p) => p.isActive);
    const grouped = {};
    activeProducts.forEach((product) => {
      const cat = product.categoria || "Otros";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(product);
    });
    return grouped;
  }, []); // ✅ CORREGIDO: Eliminar initialProducts de dependencias

  // Inicializar índices del carrusel
  useEffect(() => {
    const indices = {};
    Object.keys(productsByCategory).forEach((cat) => {
      indices[cat] = 0;
    });
    setCarouselIndices(indices);
  }, [productsByCategory]);

  // Desplazamiento automático a la categoría filtrada
  useEffect(() => {
    if (categoriaFiltro && sectionRefs.current[categoriaFiltro]) {
      sectionRefs.current[categoriaFiltro].scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [categoriaFiltro]);

  // Manejar scroll del carrusel
  const handleCarouselScroll = (category, direction) => {
    setCarouselIndices((prev) => {
      const current = prev[category] || 0;
      const items = productsByCategory[category] || [];
      const maxIndex = Math.max(0, Math.ceil(items.length / 4) - 1);
      let newIndex = current;
      if (direction === "left") newIndex = Math.max(0, current - 1);
      if (direction === "right") newIndex = Math.min(maxIndex, current + 1);
      return { ...prev, [category]: newIndex };
    });
  };

  // ✅ Tarjeta de Producto (IGUAL QUE HOME.JSX)
  const ProductCard = ({ product }) => {
    const images =
      Array.isArray(product.imagenes) && product.imagenes.filter(Boolean).length
        ? product.imagenes
            .filter(Boolean)
            .map((x) => String(x).trim())
            .filter(Boolean)
            .slice(0, 4)
        : [safeImg(product)];
    const [imgIndex, setImgIndex] = useState(0);
    const imageUrl = images[imgIndex] || images[0];
    const rating = getRatingFromProduct(product);

    const handleImageClick = (e) => {
      e.stopPropagation();
      if (images.length > 1) {
        setImgIndex((prev) => (prev + 1) % images.length);
      }
    };

    const handleOpenModal = (e) => {
      e.stopPropagation();
      setSelectedProduct(product);
      setSelectedSize(null);
      setQuantity(1);
    };

    return (
      <div className="gm-card">
        <div className="gm-img-wrapper" onClick={handleImageClick}>
          <img
            src={imageUrl}
            alt={product.nombre || "Producto"}
            className="gm-img"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src =
                "https://via.placeholder.com/800x800?text=Sin+Imagen";
            }}
          />

          {(product.hasDiscount || product.oferta) && (
            <span className="gm-badge gm-badge--fill gm-badge--oferta">
              OFERTA
            </span>
          )}

          {(product.destacado || product.isFeatured) && (
            <span className="gm-badge gm-badge--fill gm-badge--destacado">
              DESTACADO
            </span>
          )}

          {images.length > 1 && (
            <div
              className="gm-img-dots"
              onClick={(e) => e.stopPropagation()}
              role="tablist"
              aria-label="Imágenes del producto"
            >
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`gm-dot ${i === imgIndex ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setImgIndex(i);
                  }}
                  aria-label={`Ver imagen ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="gm-info">
          <h3 className="gm-product-name">{product.nombre}</h3>

          <div className="gm-stars-row">
            <RatingStars value={rating} />
          </div>

          <div className="gm-actions-row">
            <span className="gm-price-actions">
              ${Math.round(product.precio || 0).toLocaleString()}
            </span>
            <button
              className="gm-btn gm-btn-cart"
              onClick={handleOpenModal}
              type="button"
            >
              <FaShoppingCart size={15} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const sizesForModal = selectedProduct ? normalizeSizes(selectedProduct) : [];

  const closeModal = () => {
    setSelectedProduct(null);
    setSelectedSize(null);
    setQuantity(1);
  };

  const handleSizeSelect = (talla) => {
    setSelectedSize(talla);
  };

  // ✅ CORREGIDO: Usar addToCart correctamente
  const handleModalAddToCart = () => {
    if (selectedProduct && addToCart) {
      const size = selectedSize ? selectedSize : sizesForModal[0];
      addToCart({
        ...selectedProduct,
        talla: size,
        cantidad: quantity,
      });
      alert("Producto agregado al carrito");
      closeModal();
    }
  };

  const incrementQuantity = () => {
    if (quantity < 10) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div className="gm-home">
      {/* HERO SECTION */}
      <div className="gm-hero">
        <div className="gm-hero-bg" />
        <div className="gm-hero-fade-top" />
        <div className="gm-hero-fade-bottom" />
        <div className="gm-hero-inner">
          <h1 className="gm-hero-title">Explora Nuestros Productos</h1>
          <p className="gm-hero-sub">
            Descubre nuestra amplia selección de gorras. Desde estilos clásicos
            hasta las últimas tendencias, encuentra la gorra perfecta para ti.
          </p>
        </div>
      </div>

      <div className="gm-container">
        {Object.entries(productsByCategory).map(([category, products]) => {
          if (!products || products.length === 0) return null;

          return (
            <div
              key={category}
              className="gm-section"
              ref={(el) => (sectionRefs.current[category] = el)}
            >
              <div className="gm-section-header">
                <h2 className="gm-section-title">{category}</h2>
              </div>

              <div className="gm-carousel">
                <button
                  className="gm-arrow gm-arrow-left"
                  onClick={() => handleCarouselScroll(category, "left")}
                  disabled={(carouselIndices[category] || 0) === 0}
                  aria-label="Anterior"
                  type="button"
                >
                  <FaChevronLeft size={16} />
                </button>

                <div className="gm-carousel-inner">
                  <div
                    className="gm-track"
                    style={{
                      transform: `translateX(-${
                        (carouselIndices[category] || 0) * 100
                      }%)`,
                    }}
                  >
                    {products.map((p) => (
                      <div key={p.id} className="gm-slot">
                        <ProductCard product={p} />
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  className="gm-arrow gm-arrow-right"
                  onClick={() => handleCarouselScroll(category, "right")}
                  disabled={
                    (carouselIndices[category] || 0) >=
                    Math.ceil(products.length / 4) - 1
                  }
                  aria-label="Siguiente"
                  type="button"
                >
                  <FaChevronRight size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Footer />

      {/* MODAL DETALLE - MISMO ESTILO QUE HOME */}
      {selectedProduct && (
        <div className="gm-modal-overlay" onClick={closeModal}>
          <div className="gm-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="gm-modal-close"
              onClick={closeModal}
              type="button"
              aria-label="Cerrar"
              title="Cerrar"
            >
              <FaTimes size={18} />
            </button>

            <div className="gm-modal-left">
              <div className="gm-modal-imgbox">
                <img
                  src={safeImg(selectedProduct)}
                  alt={selectedProduct.nombre || "Producto"}
                  className="gm-modal-img"
                />
              </div>
            </div>

            <div className="gm-modal-right">
              <div className="gm-modal-header-row">
                <h2 className="gm-modal-title">{selectedProduct.nombre}</h2>
                <div className="gm-price-tags-row">
                  <div className="gm-modal-price-below">
                    ${Math.round(selectedProduct.precio || 0).toLocaleString()}
                  </div>
                  <div className="gm-modal-tags-inline">
                    {(selectedProduct.destacado || selectedProduct.isFeatured) && (
                      <span className="gm-tag gm-tag--featured">Destacado</span>
                    )}
                    {(selectedProduct.hasDiscount || selectedProduct.oferta) && (
                      <span className="gm-tag gm-tag--offer">Oferta</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="gm-bulk-discount-info">
                A partir de 6 unidades tienes descuento por mayor
              </div>

              {sizesForModal.length > 0 && (
                <div className="gm-sizes">
                  <div className="gm-sizes-head">
                    <span className="gm-sizes-label">Talla: </span>
                  </div>

                  <div className="gm-sizes-wrap">
                    {sizesForModal.map((t) => {
                      const isSelected = selectedSize === t;

                      return (
                        <button
                          key={t}
                          type="button"
                          className={`gm-size-chip ${
                            isSelected ? "is-selected" : ""
                          }`}
                          onClick={() => handleSizeSelect(t)}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="gm-quantity-selector">
                <span className="gm-quantity-label">Cantidad: </span>
                <div className="gm-quantity-controls">
                  <button
                    className="gm-qty-btn"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    type="button"
                  >
                    <FaMinus size={10} />
                  </button>
                  <span className="gm-qty-value">{quantity}</span>
                  <button
                    className="gm-qty-btn"
                    onClick={incrementQuantity}
                    disabled={quantity >= 10}
                    type="button"
                  >
                    <FaPlus size={10} />
                  </button>
                </div>
              </div>

              <button className="gm-btn-add-cart" onClick={handleModalAddToCart}>
                <FaShoppingCart size={16} /> Añadir al Carrito
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        :root{
          --gm-bg: #030712;
          --gm-black: #000;
          --gm-yellow-border: #FFD700;
          --gm-yellow-text: #FFC107;
          --gm-yellow-strong: #FFB300;
          --gm-yellow-solid: #FFC107;
          --gm-yellow-hover: #FFA500;
          --gm-blue-dark: #1E3A5F;
          --gm-blue-medium: #152744;
          --gm-blue-light: #2A4A6F;
          --gm-blue-text: #E8F1F8; 
          --gm-text: #fff;
          --gm-muted: rgba(255,255,255,.72);
        }
        
        .gm-home{
          background: var(--gm-bg);
          color: var(--gm-text);
          min-height: 100vh;
          padding-top: 70px;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial;
        }
        
        /* HERO */
        .gm-hero{
          position: relative;
          width: 100%;
          height: clamp(260px, 35vh, 400px);
          overflow: hidden;
          background: var(--gm-black);
          margin-bottom: 40px;
        }
        
        .gm-hero-bg{
          position:absolute;
          inset:0;
          background:
            radial-gradient(circle at 25% 25%, rgba(255, 215,0, 0.08), transparent 55%),
            linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.65) 50%, rgba(0,0,0,0.85) 100%);
          background-size: cover;
          background-position: center center;
        }
        
        .gm-hero-fade-top{
          position:absolute;
          top:0; left:0; right:0;
          height: 100px;
          background: linear-gradient(to bottom, rgba(3,7,18,1), rgba(3,7,18,0));
          z-index: 1;
        }
        
        .gm-hero-fade-bottom{
          position:absolute;
          left:0; right:0; bottom:0;
          height: 120px;
          background: linear-gradient(to top, rgba(3,7,18,1), rgba(3,7,18,0));
          z-index: 1;
        }
        
        .gm-hero-inner{
          position: relative;
          z-index: 2;
          height: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 26px 18px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
        }
        
        .gm-hero-title{
          font-size: clamp(2rem, 4vw, 3.5rem);
          font-weight: 900;
          margin: 0 0 15px 0;
          color: var(--gm-text);
          letter-spacing: 0.4px;
        }
        
        .gm-hero-sub{
          color: var(--gm-muted);
          font-size: clamp(0.95rem, 1.2vw, 1.1rem);
          margin: 0;
          max-width: 700px;
        }
         
        /* CONTENEDOR */
        .gm-container{
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 4px 40px 4px;
        }
        
        /* SECCIONES */
        .gm-section{
          margin-top: 26px;
          padding-top: 10px;
        }
        
        .gm-section-header{
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        
        .gm-section-title{
          margin:0;
          font-size: 1.25rem;
          font-weight: 900;
          letter-spacing: 0.2px;
          color: var(--gm-text);
        }
        
        /* CARRUSEL */
        .gm-carousel{ 
          position: relative; 
          display: flex; 
          align-items: center; 
        }
        
        .gm-carousel-inner{ 
          width: 100%; 
          overflow: hidden; 
        }
        
        .gm-track{ 
          display: flex; 
          transition: transform 0.55s ease; 
        }
        
        .gm-slot{ 
          min-width: 25%; 
          padding: 0 6px; 
          box-sizing: border-box; 
        }
        
        .gm-arrow{
          position: absolute;
          top: 45%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          border-radius: 12px;
          border: 2px solid var(--gm-yellow-border);
          background: rgba(0,0,0,0.55);
          color: var(--gm-yellow-text);
          cursor: pointer;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: 180ms ease;
          backdrop-filter: blur(6px);
        }
        
        .gm-arrow:hover{
          background: rgba(255,215,0,0.08);
        }
        
        .gm-arrow:disabled{ 
          opacity: 0; 
          pointer-events: none; 
        }
        
        .gm-arrow-left{ 
          left: -10px; 
        }
        
        .gm-arrow-right{ 
          right: -10px; 
        }
        
        /* CARD */
        .gm-card{ 
          background: transparent; 
          border-radius: 12px; 
        }
        
        .gm-img-wrapper{
          height: 250px;
          position: relative;
          overflow: hidden;
          border-radius: 16px;
          background: #000;
          border: 1px solid rgba(255,255,255,0.08);
          cursor: pointer;
        }
        
        .gm-img{
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          transition: transform 240ms ease;
        }
        
        .gm-img-wrapper:hover .gm-img{ 
          transform: scale(1.02); 
        }
        
        /* Badge */
        .gm-badge{
          position: absolute;
          top: 10px;
          padding: 6px 10px;
          border-radius: 12px;
          font-weight: 900;
          font-size: 0.72rem;
          letter-spacing: .4px;
          border: 1px solid rgba(255,255,255,0.12);
          z-index: 10;
        }
        
        .gm-badge--fill{ 
          color: #0b1220; 
        }
        
        .gm-badge--oferta{ 
          background: linear-gradient(135deg, #FFD700, #E6C85A);
          left: 10px;
        }
        
        .gm-badge--destacado{ 
          background: linear-gradient(135deg, #60A5FA, #2563EB); 
          color: #fff;
          right: 10px;
          left: auto;
        }
        
        /* Dots */
        .gm-img-dots{
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          z-index: 3;
          background: rgba(0,0,0,.35);
          padding: 6px 10px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.10);
          backdrop-filter: blur(6px);
          opacity: 0;
          pointer-events: none;
          transition: opacity 160ms ease;
        }
        
        .gm-img-wrapper:hover .gm-img-dots{
          opacity: 1;
          pointer-events: auto;
        }
        
        .gm-dot{
          width: 9px;
          height: 9px;
          border-radius: 999px;
          border: 1px solid var(--gm-yellow-border);
          background: rgba(0,0,0,0.2);
          cursor: pointer;
          transition: .2s ease; 
        }
        
        .gm-dot.active{
          background: rgba(255,215,0,0.95);
          box-shadow: 0 0 10px rgba(255,215,0,.35);
        }
        
        /* INFO */
        .gm-info{ 
          padding: 10px 6px 10px 6px; 
        }
        
        .gm-product-name{
          margin: 0 0 8px 0;
          font-size: 0.98rem;
          font-weight: 900;
          line-height: 1.25;
          color: rgba(255,255,255,.92);
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        
        .gm-stars-row{ 
          margin-top: 6px; 
        }
        
        .gm-rating{
          display: inline-flex;
          gap: 2px;
          color: rgba(255,215,0,0.92);
        }
        
        .gm-rating svg{ 
          width: 14px; 
          height: 14px; 
        }
        
        /* BOTONES */
        .gm-actions-row{
          margin-top: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        
        .gm-price-actions{ 
          font-variant-numeric: tabular-nums;
          font-family: "Times New Roman", Times, serif;
          font-size: 1.15rem;
          font-weight: 900;
          color: var(--gm-yellow-strong);
          white-space: nowrap;
        }
        
        .gm-btn{
          height: 44px;
          padding: 0 16px;
          border-radius: 999px;
          border: 1px solid var(--gm-yellow-border);
          background: transparent;
          color: var(--gm-yellow-text);
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          text-decoration: none;
          font-size: 0.92rem;
          transition: 180ms ease;
        }
        
        .gm-btn:hover{
          background: rgba(255,215,0,0.08);
        }
        
        .gm-btn-cart{
          width: 44px;
          height: 44px; 
          padding: 0;
          border-radius: 50%;
          border: none;
          background: #FFC107;
          color: #000;
        }
        
        .gm-btn-cart:hover{
          background: #FFB300;
        }
        
        /* MODAL */
        .gm-modal-overlay{
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.82);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 18px;
        }
        
        .gm-modal{
          position: relative;
          width: min(900px, 100%);
          background: #030712;
          border: none;
          border-radius: 16px;
          display: flex;
          gap: 12px;
          padding: 12px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.55);
        }
        
        .gm-modal-close{
          position: absolute;
          top: 10px;
          right: 10px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: transparent;
          color: #fff;
          cursor: pointer;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        
        .gm-modal-close:hover{
          background: rgba(255,255,255,0.1);
          color: #fff;
        }
        
        .gm-modal-left{
          flex: 0 0 45%;
          min-width: 320px;
          border-radius: 12px;
          overflow: hidden;
        }
        
        .gm-modal-imgbox{
          width: 100%;
          height: 100%;
          min-height: 380px;
          background: #000;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .gm-modal-img{
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }
        
        .gm-modal-right{
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 10px;
        }
        
        /* Header con precio y tags en misma línea */
        .gm-modal-header-row{
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .gm-modal-title{
          margin: 0;
          font-size: 1.5rem;
          font-weight: 900;
          line-height: 1.2;
          color: #fff;
        }
        
        .gm-price-tags-row{
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        
        .gm-modal-price-below{
          color: var(--gm-yellow-strong);
          font-weight: 900;
          font-size: 1.4rem;
          font-family: "Times New Roman", Times, serif;
          white-space: nowrap;
        }
        
        .gm-modal-tags-inline{
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        
        /* Info descuento por mayor */
        .gm-bulk-discount-info{
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--gm-blue-text);
          margin: 2px 0 4px 0;
          padding: 5px 10px;
          background: rgba(42,74,111,0.4);
          border-radius: 6px;
          display: inline-block;
          width: fit-content;
        }
        
        /* Tags */
        .gm-tag{
          padding: 4px 10px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.72rem;
          border: 1px solid rgba(96,165,250,0.35);
          color: #fff;
        }
        
        .gm-tag--featured{
          background: var(--gm-blue-light);
          border-color: var(--gm-blue-medium);
        }
        
        .gm-tag--offer{
          background: var(--gm-blue-medium);
          border-color: var(--gm-blue-dark);
        }
        
        /* TALLAS */
        .gm-sizes{
          background: rgba(42,74,111,0.3);
          border: 1px solid rgba(96,165,250,0.2);
          border-radius: 12px;
          padding: 10px;
          margin: 4px 0;
        }
        
        .gm-sizes-head{
          margin-bottom: 8px;
        }
        
        .gm-sizes-label{
          font-weight: 700;
          color: #fff;
          font-size: 0.9rem;
        }
        
        .gm-sizes-wrap{
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .gm-size-chip{
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px 14px;
          border-radius: 20px;
          border: 1px solid rgba(96,165,250,0.3);
          background: rgba(42,74,111,0.4);
          color: #fff;
          font-weight: 600;
          font-size: 0.82rem;
          min-width: 48px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .gm-size-chip:hover:not(.is-disabled){
          border-color: var(--gm-blue-light);
          background: rgba(42,74,111,0.6);
        }
        
        .gm-size-chip.is-selected{
          background: var(--gm-blue-light);
          border-color: var(--gm-blue-medium);
          color: #fff;
        }
        
        /* Selector de cantidad */
        .gm-quantity-selector{
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 6px 0;
        }
        
        .gm-quantity-label{
          font-weight: 700;
          font-size: 0.9rem;
          color: #fff;
        }
        
        .gm-quantity-controls{
          display: flex;
          align-items: center;
          gap: 0;
          border: 1px solid var(--gm-blue-light);
          border-radius: 20px;
          overflow: hidden;
        } 
        
        .gm-qty-btn{
          width: 32px;
          height: 32px;
          border: none;
          background: rgba(42,74,111,0.6);
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        
        .gm-qty-btn:hover:not(:disabled){
          background: rgba(42,74,111,0.8);
        }
        
        .gm-qty-btn:disabled{
          opacity: 0.3;
          cursor: not-allowed;
        }
        
        .gm-qty-value{
          min-width: 40px;
          text-align: center;
          font-weight: 900;
          font-size: 1rem;
          color: #fff;
        }
        
        /* Botón Añadir al Carrito */
        .gm-btn-add-cart{
          height: 48px;
          padding: 0 24px;
          border-radius: 12px;
          border: none;
          background: var(--gm-yellow-solid);
          color: #000;
          font-weight: 900;
          font-size: 1.05rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 180ms ease;
          margin-top: 8px;
        }
        
        .gm-btn-add-cart:hover{
          background: var(--gm-yellow-hover);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(255, 165, 0, 0.5);
        }
        
        /* RESPONSIVE */
        @media (max-width: 980px){
          .gm-slot{ 
            min-width: 50%; 
          }
          .gm-arrow-left{ 
            left: -6px; 
          }
          .gm-arrow-right{ 
            right: -6px; 
          }
          .gm-modal{  
            flex-direction: column; 
          }
          .gm-modal-left{ 
            min-width: auto; 
            width: 100%; 
          }
          .gm-modal-imgbox{ 
            min-height: 300px; 
          }
        }
        
        @media (max-width: 520px){
          .gm-slot{ 
            min-width: 100%; 
          }
          .gm-hero{
            height: clamp(220px, 30vh, 320px);
          }
          .gm-hero-title{
            font-size: 1.8rem;
          }
          .gm-hero-sub{
            font-size: 0.95rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Productos;