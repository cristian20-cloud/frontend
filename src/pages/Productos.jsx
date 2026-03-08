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
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import Footer from "../components/Footer";

/* =========================
DESCUENTO POR MAYOR
========================= */
const BULK_MIN_QTY = 6;
const BULK_DISCOUNT = 0.1;

const applyBulkDiscount = (cart) => {
  const totalQty = cart.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0);
  if (totalQty < BULK_MIN_QTY) {
    return cart.map((it) => ({
      ...it,
      price: Number(it.originalPrice ?? it.price),
    }));
  }
  return cart.map((it) => {
    const base = Number(it.originalPrice ?? it.price) || 0;
    const discounted = Math.round(base * (1 - BULK_DISCOUNT));
    return { ...it, originalPrice: base, price: discounted };
  });
};

// Función para determinar el color del stock
const getStockColorClass = (stock) => {
  if (stock === 0) return "stock-zero";
  if (stock >= 10) return "stock-high";
  if (stock >= 4 && stock <= 9) return "stock-medium";
  if (stock >= 1 && stock <= 3) return "stock-low";
  return "stock-zero";
};

const Productos = ({ updateCart, cartItems }) => {
  const location = useLocation();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [carouselIndices, setCarouselIndices] = useState({});
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showSizeError, setShowSizeError] = useState(false);
  const [showQuantityAlert, setShowQuantityAlert] = useState(false);
  const [inventory, setInventory] = useState({});
  const [availableStock, setAvailableStock] = useState(0);
  const [remainingStock, setRemainingStock] = useState(0);
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

  /* =========================
  INVENTARIO
  ========================= */
  const INV_KEY = "inv_by_variant_v1";

  const readInventory = () => {
    try {
      return JSON.parse(localStorage.getItem(INV_KEY) || "{}");
    } catch {
      return {};
    }
  };

  const writeInventory = (inv) => {
    localStorage.setItem(INV_KEY, JSON.stringify(inv));
  };

  const buildInitialInventoryFromProducts = (products) => {
    const inv = {};
    for (const p of products) {
      const sizes = normalizeSizes(p);
      const pid = String(p.id);
      if (!sizes.length) continue;

      const total = Math.max(0, Number(p.stock ?? 0));
      const totalSafe = Number.isFinite(total) ? total : 0;
      const baseTotal = totalSafe > 0 ? totalSafe : 12;
      const per = Math.floor(baseTotal / sizes.length);
      let rem = baseTotal - per * sizes.length;

      inv[pid] = {};
      for (const s of sizes) {
        const add = rem > 0 ? 1 : 0;
        inv[pid][s] = Math.max(0, per + add);
        if (rem > 0) rem -= 1;
      }
    }
    return inv;
  };

  const ensureInventory = (products) => {
    const current = readInventory();
    const built = buildInitialInventoryFromProducts(products);

    if (!Object.keys(current).length) {
      writeInventory(built);
      return built;
    }

    let changed = false;
    const merged = { ...current };

    for (const pid of Object.keys(built)) {
      if (!merged[pid]) {
        merged[pid] = built[pid];
        changed = true;
        continue;
      }
      for (const talla of Object.keys(built[pid])) {
        if (typeof merged[pid][talla] !== "number") {
          merged[pid][talla] = built[pid][talla];
          changed = true;
        }
      }
    }

    if (changed) writeInventory(merged);
    return merged;
  };

  const getAvailableFor = (inv, productId, talla) => {
    const pid = String(productId);
    return Math.max(0, Number(inv?.[pid]?.[talla] ?? 0));
  };

  const decreaseInventory = (inv, productId, talla, qty) => {
    const pid = String(productId);
    const next = { ...inv, [pid]: { ...(inv[pid] || {}) } };
    const current = getAvailableFor(inv, productId, talla);
    next[pid][talla] = Math.max(0, current - Math.max(0, qty));
    return next;
  };

  useEffect(() => {
    const inv = ensureInventory(initialProducts);
    setInventory(inv);
  }, []);

  // Actualizar stock disponible cuando cambia la talla seleccionada
  useEffect(() => {
    if (selectedProduct && selectedSize) {
      const stock = getAvailableFor(inventory, selectedProduct.id, selectedSize);
      setAvailableStock(stock);
      setRemainingStock(stock);
      if (quantity > stock) {
        setQuantity(Math.max(1, stock));
      }
    } else {
      setAvailableStock(0);
      setRemainingStock(0);
    }
  }, [selectedProduct, selectedSize, inventory]);

  // Actualizar stock restante cuando cambia la cantidad
  useEffect(() => {
    if (selectedProduct && selectedSize) {
      const stock = getAvailableFor(inventory, selectedProduct.id, selectedSize);
      setRemainingStock(Math.max(0, stock - quantity));
    }
  }, [quantity, selectedProduct, selectedSize, inventory]);

  // Agrupar productos por categoría
  const productsByCategory = useMemo(() => {
    const activeProducts = (initialProducts || []).filter((p) => p.isActive);
    const grouped = {};
    activeProducts.forEach((product) => {
      const cat = product.categoria || "Otros";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(product);
    });
    return grouped;
  }, []);

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

  // Manejar scroll del carrusel - DE UNO EN UNO
  const handleCarouselScroll = (category, direction) => {
    setCarouselIndices((prev) => {
      const current = prev[category] || 0;
      const items = productsByCategory[category] || [];
      const maxIndex = Math.max(0, items.length - 1);
      let newIndex = current;
      if (direction === "left") newIndex = Math.max(0, current - 1);
      if (direction === "right") newIndex = Math.min(maxIndex, current + 1);
      return { ...prev, [category]: newIndex };
    });
  };

  const addQuickToCart = (product, size, qty) => {
    if (!size) return;
    const available = getAvailableFor(inventory, product.id, size);
    if (available < qty) return;

    const currentCart = cartItems || [];
    const cartItem = {
      id: product.id,
      name: product.nombre,
      originalPrice: Math.round(product.precio || 0),
      price: Math.round(product.precio || 0),
      image: safeImg(product),
      quantity: qty,
      color: size,
    };

    const idx = currentCart.findIndex(
      (it) => it.id === cartItem.id && it.color === cartItem.color
    );

    let newCart;
    if (idx > -1) {
      newCart = currentCart.map((item, i) =>
        i === idx ? { ...item, quantity: item.quantity + qty } : item
      );
    } else {
      newCart = [...currentCart, cartItem];
    }

    const discountedCart = applyBulkDiscount(newCart);
    localStorage.setItem("cart", JSON.stringify(discountedCart));

    if (updateCart) {
      updateCart(discountedCart);
    }

    window.dispatchEvent(new CustomEvent('cartUpdated', { 
      detail: { cart: discountedCart } 
    }));

    const nextInv = decreaseInventory(inventory, product.id, size, qty);
    setInventory(nextInv);
    writeInventory(nextInv);

    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);

    closeModal();
  };

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
      setShowSizeError(false);
      setShowQuantityAlert(false);
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
          <h3 className="gm-product-name-light">{product.nombre}</h3>

          <div className="gm-stars-row">
            <RatingStars value={rating} />
          </div>

          <div className="gm-actions-row">
            <div className="gm-price-container-card">
              {(product.hasDiscount || product.oferta) && product.originalPrice && (
                <span className="gm-price-old-card">
                  ${Math.round(product.originalPrice).toLocaleString()}
                </span>
              )}
              <span className="gm-price-actions">
                ${Math.round(product.precio || 0).toLocaleString()}
              </span>
            </div>
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
    setShowSizeError(false);
    setShowQuantityAlert(false);
  };

  const handleSizeSelect = (talla) => {
    if (selectedSize === talla) {
      setSelectedSize(null);
    } else {
      setSelectedSize(talla);
      setShowSizeError(false);
      setQuantity(1);
    }
  };

  const incrementQuantity = () => {
    if (!selectedSize && sizesForModal.length > 0) {
      setShowSizeError(true);
      setTimeout(() => setShowSizeError(false), 2000);
      return;
    }
    
    if (quantity < availableStock) {
      setQuantity(quantity + 1);
    } else if (quantity >= availableStock) {
      setShowQuantityAlert(true);
      setTimeout(() => setShowQuantityAlert(false), 2000);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleModalAddToCart = () => {
    if (!selectedProduct) return;
    if (sizesForModal.length > 0 && !selectedSize) {
      setShowSizeError(true);
      setTimeout(() => setShowSizeError(false), 2000);
      return;
    }
    const size = selectedSize ? selectedSize : sizesForModal[0];
    addQuickToCart(selectedProduct, size, quantity);
  };

  const formatCategoryName = (category) => {
    if (!category) return "";
    return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  };

  const basePrice = selectedProduct ? Math.round(selectedProduct.precio || 0) : 0;
  const originalPrice = selectedProduct?.originalPrice ? Math.round(selectedProduct.originalPrice) : basePrice;
  const isWholesale = quantity >= BULK_MIN_QTY;
  const displayPrice = isWholesale ? Math.round(basePrice * (1 - BULK_DISCOUNT)) : basePrice;

  return (
    <div className="gm-home">
      {/* HERO - ESTILO HOME */}
      <section className="gm-hero">
        <div className="gm-hero-bg" />
        <div className="gm-hero-fade-top" />
        <div className="gm-hero-fade-bottom" />
        <div className="gm-hero-inner">
          <h1 className="gm-hero-title">Todos Nuestros Productos</h1>
          <p className="gm-hero-sub">
            Descubre nuestra amplia selección de gorras. Desde estilos clásicos hasta las últimas tendencias.
          </p>
          <p className="gm-hero-help">
            Toca la imagen para ver más fotos • Click en el carrito para añadir
          </p>
        </div>
      </section>

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
                <h2 className="gm-section-title">{formatCategoryName(category)}</h2>
                <Link to={`/productos?categoria=${category}`} className="gm-view-all-link">
                  Ver todos <FaChevronRight size={12} />
                </Link>
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
                        (carouselIndices[category] || 0) * (100 / Math.min(products.length, 4))
                      }%)`,
                    }}
                  >
                    {products.map((p) => (
                      <div key={p.id} className="gm-slot-single">
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
                    products.length - 1
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

      {/* MODAL DE PRODUCTO - VERSIÓN HOME */}
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
                <div className="gm-modal-title-row">
                  <h2 className="gm-modal-title-light">
                    {selectedProduct.nombre}
                  </h2>
                  <div className="gm-modal-tags-inline">
                    {(selectedProduct.hasDiscount || selectedProduct.oferta) && (
                      <span className="gm-tag gm-tag--offer">Oferta</span>
                    )}
                    {(selectedProduct.destacado || selectedProduct.isFeatured) && (
                      <span className="gm-tag gm-tag--featured">Destacado</span>
                    )}
                  </div>
                </div>

                <div className="gm-price-row">
                  {(selectedProduct.hasDiscount || selectedProduct.oferta) && selectedProduct.originalPrice && (
                    <>
                      <span className="gm-price-strikethrough">
                        ${originalPrice.toLocaleString()}
                      </span>
                      <span className="gm-price-arrow">→</span>
                    </>
                  )}
                  <span className="gm-modal-price">
                    ${displayPrice.toLocaleString()}
                  </span>
                </div>

                <div className="gm-product-description">
                  {selectedProduct.descripcion || "Sin descripción disponible"}
                </div>
              </div>

              {/* TALLAS */}
              {sizesForModal.length > 0 && (
                <div className="gm-sizes-container">
                  <div className="gm-section-label-light">Talla:</div>
                  <div className="gm-sizes-grid">
                    {sizesForModal.map((t) => {
                      const ava = getAvailableFor(
                        inventory,
                        selectedProduct.id,
                        t
                      );
                      const disabled = ava <= 0;
                      const isSelected = selectedSize === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          className={`gm-size-chip-new ${disabled ? "is-disabled" : ""} ${isSelected ? "is-selected" : ""}`}
                          onClick={() => !disabled && handleSizeSelect(t)}
                          title={disabled ? "Agotado" : `Disponible: ${ava}`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* CANTIDAD */}
              <div className="gm-quantity-container">
                <div className="gm-section-label-light">Cantidad:</div>
                <div className="gm-quantity-round">
                  <button
                    className="gm-qty-btn-round"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    type="button"
                  >
                    <FaMinus size={10} />
                  </button>
                  <span className="gm-qty-value-round">{quantity}</span>
                  <button
                    className="gm-qty-btn-round"
                    onClick={incrementQuantity}
                    disabled={quantity >= availableStock}
                    type="button"
                  >
                    <FaPlus size={10} />
                  </button>
                </div>
              </div>
              
              {/* STOCK Y MENSAJES */}
              {selectedSize && (
                <div className="gm-stock-row">
                  <span className="gm-stock-label">Stock disponible:</span>
                  {remainingStock === 0 ? (
                    <>
                      <span className="gm-stock-value stock-zero">0 unidades</span>
                      <span className="gm-stock-separator">•</span>
                      <span className="gm-out-of-stock-text">Agotado - No disponible</span>
                    </>
                  ) : (
                    <span className={`gm-stock-value ${getStockColorClass(remainingStock)}`}>
                      {remainingStock} unidades
                    </span>
                  )}
                  
                  {quantity >= BULK_MIN_QTY && remainingStock > 0 && (
                    <>
                      <span className="gm-stock-separator">•</span>
                      <span className="gm-wholesale-inline">
                        <FaCheckCircle size={12} />
                        <span>Gracias ya eres mayorista</span>
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* ALERTA CUANDO EXCEDE STOCK */}
              {showQuantityAlert && quantity > availableStock && availableStock > 0 && (
                <div className="gm-quantity-alert">
                  <FaExclamationCircle size={16} />
                  <span>Solo hay {availableStock} {availableStock === 1 ? 'unidad' : 'unidades'} disponibles</span>
                </div>
              )}
              
              {/* BOTONES */}
              <div className="gm-modal-buttons-row">
                <button
                  className={`gm-btn-add-cart-yellow ${!selectedSize || remainingStock === 0 ? "gm-btn-disabled" : ""}`}
                  onClick={handleModalAddToCart}
                  disabled={!selectedSize || remainingStock === 0}
                >
                  <FaShoppingCart size={16} /> 
                  Añadir al Carrito
                </button>
                <Link
                  to="/cart"
                  className="gm-btn-view-cart-new"
                  onClick={closeModal}
                >
                  Ver Carrito
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOAST DE ÉXITO */}
      {showSuccessToast && (
        <div className="success-toast-container">
          <div className="success-toast-content">
            <FaCheckCircle size={24} color="#10B981" />
            <div className="toast-text">
              <h4>¡Agregado con éxito!</h4>
              <p>El producto está en tu carrito</p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        :root {
          --gm-bg: #030712;
          --gm-black: #000;
          --gm-yellow-border: #FFD700;
          --gm-yellow-text: #FFC107;
          --gm-yellow-strong: #FFB300;
          --gm-yellow-solid: #D4A017;
          --gm-yellow-hover: #C59210;
          --gm-blue-dark: #1E3A5F;
          --gm-blue-medium: #152744;
          --gm-blue-light: #2A4A6F;
          --gm-blue-text: #E8F1F8;
          --gm-text: #fff;
          --gm-muted: rgba(255,255,255,.72);
          --gm-error: #ef4444;
          --gm-stock-high: #10B981;
          --gm-stock-medium: #F59E0B;
          --gm-stock-low: #EF4444;
        }
        
        .gm-home {
          background: var(--gm-bg);
          color: var(--gm-text);
          min-height: 100vh;
          padding-top: 60px;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial;
        }
        
        .gm-hero {
          position: relative;
          width: 100%;
          height: clamp(200px, 35vh, 350px);
          overflow: hidden;
          background: var(--gm-black); 
          margin-bottom: 30px;
        }
        
        .gm-hero-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 25% 25%, rgba(255,215,0, 0.10), transparent 55%),
            linear-gradient(90deg, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.80) 100%),
            url("https://res.cloudinary.com/dxc5qqsjd/image/upload/v1764642176/WhatsApp_Image_2025-12-01_at_9.07.34_PM_a3k3ob.jpg");
          background-size: cover;
          background-position: center center;
          filter: saturate(1.03) contrast(1.02);
        }
        
        .gm-hero-fade-top {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100px;
          background: linear-gradient(to bottom, rgba(3,7,18,1), rgba(3,7,18,0));
          z-index: 1;
        }
        
        .gm-hero-fade-bottom {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 120px;
          background: linear-gradient(to top, rgba(3,7,18,1), rgba(3,7,18,0));
          z-index: 1;
        }
        
        .gm-hero-inner {
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
        
        .gm-hero-title {
          font-size: clamp(2rem, 4vw, 3.5rem);
          font-weight: 900;
          margin: 0 0 15px 0;
          color: var(--gm-text);
          letter-spacing: 0.4px;
        }
        
        .gm-hero-sub {
          color: var(--gm-muted);
          font-size: clamp(0.95rem, 1.2vw, 1.1rem);
          margin: 0;
          max-width: 700px;
        }
        
        .gm-hero-help {
          margin: 10px 0 0 0;
          font-size: 0.90rem;
          font-weight: 900;
          color: var(--gm-yellow-strong);
          letter-spacing: .2px;
        }
        
        .gm-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px 40px 20px;
        }
        
        .gm-section {
          margin-top: 26px;
          padding-top: 10px;
        }
        
        .gm-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        
        .gm-section-title {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 900;
          letter-spacing: 0.2px;
          color: var(--gm-text);
        }
        
        .gm-view-all-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--gm-yellow-text);
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 400;
          padding: 6px 12px;
          border: 1px solid var(--gm-yellow-border);
          border-radius: 20px;
          transition: all 180ms ease;
        }
        
        .gm-view-all-link:hover {
          background: rgba(255,215,0,0.08);
        }
        
        .gm-carousel {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .gm-carousel-inner {
          width: 100%;
          overflow: hidden;
        }
        
        .gm-track {
          display: flex;
          transition: transform 0.55s ease;
        }
        
        .gm-slot-single {
          min-width: 25%;
          padding: 0 6px;
          box-sizing: border-box;
        }
        
        .gm-arrow {
          position: absolute;
          top: 45%;
          transform: translateY(-50%);
          width: 48px;
          height: 48px;
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
        
        .gm-arrow:hover:not(:disabled) {
          background: rgba(255,215,0,0.08);
        }
        
        .gm-arrow:disabled {
          opacity: 0.2;
          cursor: not-allowed;
          pointer-events: none;
        }
        
        .gm-arrow-left {
          left: -10px;
        }
        
        .gm-arrow-right {
          right: -10px;
        }
        
        .gm-card {
          background: transparent;
          border-radius: 12px;
        }
        
        .gm-img-wrapper {
          height: 250px;
          position: relative;
          overflow: hidden;
          border-radius: 16px;
          background: #000;
          border: 1px solid rgba(255,255,255,0.08);
          cursor: pointer;
        }
        
        .gm-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          transition: transform 240ms ease;
        }
        
        .gm-img-wrapper:hover .gm-img {
          transform: scale(1.02);
        }
        
        .gm-badge {
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
        
        .gm-badge--fill {
          color: #0b1220;
        }
        
        .gm-badge--oferta {
          background: linear-gradient(135deg, #FFD700, #E6C85A);
          left: 10px;
        }
        
        .gm-badge--destacado {
          background: linear-gradient(135deg, #60A5FA, #2563EB);
          color: #fff;
          right: 10px;
          left: auto;
        }
        
        .gm-img-dots {
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
        
        .gm-img-wrapper:hover .gm-img-dots {
          opacity: 1;
          pointer-events: auto;
        }
        
        .gm-dot {
          width: 9px;
          height: 9px;
          border-radius: 999px;
          border: 1px solid var(--gm-yellow-border);
          background: rgba(0,0,0,0.2);
          cursor: pointer;
          transition: .2s ease;
        }
        
        .gm-dot.active {
          background: rgba(255,215,0,0.95);
          box-shadow: 0 0 10px rgba(255,215,0,.35);
        }
        
        @media (max-width: 768px) {
          .gm-img-dots {
            display: none;
          }
        }
        
        .gm-info {
          padding: 10px 6px 10px 6px;
        }
        
        .gm-product-name-light {
          margin: 0 0 8px 0;
          font-size: 0.98rem;
          font-weight: 400;
          line-height: 1.25;
          color: rgba(255,255,255,.92);
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        
        .gm-stars-row {
          margin-top: 6px;
        }
        
        .gm-rating {
          display: inline-flex;
          gap: 2px;
          color: rgba(255,215,0, 0.92);
        }
        
        .gm-rating svg {
          width: 14px;
          height: 14px;
        }
        
        .gm-actions-row {
          margin-top: 6px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        
        .gm-price-container-card {
          display: flex;
          flex-direction: row;
          align-items: baseline;
          gap: 12px;
        }
        
        .gm-price-old-card {
          font-size: 1rem;
          color: rgba(255,255,255,0.5);
          text-decoration: line-through;
          font-family: "Times New Roman", Times, serif;
          font-weight: 400;
        }
        
        .gm-price-actions {
          font-variant-numeric: tabular-nums;
          font-family: "Times New Roman", Times, serif;
          font-size: 1.4rem;
          font-weight: 900;
          color: var(--gm-yellow-strong);
          white-space: nowrap;
        }
        
        .gm-btn {
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
        
        .gm-btn:hover {
          background: rgba(255,215,0,0.08);
        }
        
        .gm-btn-cart {
          width: 38px;
          height: 38px;
          padding: 0;
          border-radius: 50%;
          border: 1.5px solid var(--gm-yellow-border);
          background: transparent;
          color: var(--gm-yellow-text);
          transition: all 0.3s ease;
        }
        
        .gm-btn-cart:hover {
          background: rgba(255,215,0,0.25);
          border-color: #FFA500;
          color: #FFA500;
          transform: scale(1.05);
        }
        
        .gm-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.82);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 18px;
        }
        
        .gm-modal {
          position: relative;
          width: min(900px, 95%);
          background: #030712;
          border: none;
          border-radius: 16px;
          display: flex;
          gap: 16px;
          padding: 16px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.55);
        }
        
        .gm-modal-close {
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
        
        .gm-modal-close:hover {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }
        
        .gm-modal-left {
          flex: 0 0 45%;
          min-width: 300px;
          border-radius: 12px;
          overflow: hidden;
        }
        
        .gm-modal-imgbox {
          width: 100%;
          height: 100%;
          min-height: 300px;
          background: #000;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .gm-modal-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
        }
        
        .gm-modal-right {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 10px;
          overflow-y: auto;
          max-height: 70vh;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        .gm-modal-right::-webkit-scrollbar {
          display: none;
          width: 0;
          background: transparent;
        }
        
        .gm-modal-header-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .gm-modal-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        
        .gm-modal-title-light {
          margin: 0;
          font-size: 1.4rem;
          font-weight: 400;
          line-height: 1.2;
          color: #fff;
        }
        
        .gm-price-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin: 4px 0;
        }
        
        .gm-price-strikethrough {
          color: rgba(255,255,255,0.5);
          text-decoration: line-through;
          font-size: 1rem;
          font-family: "Times New Roman", Times, serif;
        }
        
        .gm-price-arrow {
          color: var(--gm-yellow-strong);
          font-size: 1rem;
          font-weight: 700;
        }
        
        .gm-modal-price {
          color: var(--gm-yellow-strong);
          font-weight: 900;
          font-size: 1.3rem;
          font-family: "Times New Roman", Times, serif;
          white-space: nowrap;
        }
        
        .gm-modal-tags-inline {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        
        .gm-product-description {
          margin-top: 8px;
          padding: 8px 12px;
          background: rgba(42,74,111,0.2);
          border-radius: 8px;
          font-size: 0.85rem;
          color: var(--gm-muted);
          border: 1px solid rgba(96,165,250,0.2);
          line-height: 1.4;
        }
        
        .gm-tag {
          padding: 4px 8px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.7rem;
          border: 1px solid rgba(96,165,250,0.35);
          color: #fff;
        }
        
        .gm-tag--featured {
          background: var(--gm-blue-light);
          border-color: var(--gm-blue-medium);
        }
        
        .gm-tag--offer {
          background: var(--gm-blue-medium);
          border-color: var(--gm-blue-dark);
        }
        
        /* TALLAS */
        .gm-sizes-container {
          margin: 8px 0 4px 0;
          width: 100%;
        }
        
        .gm-sizes-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 6px;
          width: 100%;
        }
        
        .gm-size-chip-new {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px 12px;
          border-radius: 999px;
          border: 1px solid #2A4A6F;
          background: transparent;
          color: #fff;
          font-weight: 400;
          font-size: 0.85rem;
          min-width: 45px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .gm-size-chip-new:hover:not(.is-disabled) {
          border-color: #FFD700;
          color: #FFD700;
        }
        
        .gm-size-chip-new.is-selected {
          border-color: #FFD700;
          color: #FFD700;
        }
        
        .gm-size-chip-new.is-disabled {
          opacity: 0.35;
          border-color: rgba(255,255,255,0.2);
          cursor: not-allowed;
        }
        
        /* CANTIDAD */
        .gm-quantity-container {
          margin: 8px 0 4px 0;
          width: 100%;
        }
        
        .gm-quantity-round {
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid #2A4A6F;
          border-radius: 30px;
          padding: 4px 8px;
          margin-top: 4px;
          width: fit-content;
          background: rgba(0,0,0,0.2);
        }
        
        .gm-qty-btn-round {
          width: 28px;
          height: 28px;
          border: none;
          background: rgba(42,74,111,0.3);
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s ease;
          font-size: 0.8rem;
        }
        
        .gm-qty-btn-round:hover:not(:disabled) {
          background: rgba(42,74,111,0.6);
        }
        
        .gm-qty-btn-round:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        
        .gm-qty-value-round {
          min-width: 24px;
          text-align: center;
          font-weight: 500;
          font-size: 0.9rem;
          color: #fff;
        }
        
        .gm-section-label-light {
          font-weight: 400;
          color: #fff;
          font-size: 0.9rem;
          margin-bottom: 4px;
        }
        
        /* STOCK */
        .gm-stock-row {
          margin: 8px 0 4px 0;
          padding: 6px 0;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          border-top: 1px solid rgba(255,255,255,0.08);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          padding: 8px 0;
        }
        
        .gm-stock-label {
          color: rgba(255,255,255,0.5);
          font-weight: 400;
          font-size: 0.8rem;
        }
        
        .gm-stock-value {
          font-weight: 500;
          font-size: 0.85rem;
        }
        
        .gm-stock-separator {
          color: rgba(255,255,255,0.3);
          font-size: 0.8rem;
          margin: 0 2px;
        }
        
        .gm-out-of-stock-text {
          color: #ef4444;
          font-weight: 500;
          font-size: 0.85rem;
        }
        
        .gm-wholesale-inline {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #10B981;
          font-weight: 500;
          font-size: 0.85rem;
        }
        
        .gm-wholesale-inline svg {
          color: #10B981;
        }
        
        /* Colores dinámicos para el stock */
        .stock-high {
          color: var(--gm-stock-high);
        }
        
        .stock-medium {
          color: var(--gm-stock-medium);
        }
        
        .stock-low {
          color: var(--gm-stock-low);
        }
        
        .stock-zero {
          color: #ef4444;
        }
        
        .gm-quantity-alert {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid #ef4444; 
          border-radius: 8px;
          color: #ef4444;
          font-size: 0.85rem;
          font-weight: 500;
          margin: 4px 0;
        }
        
        .gm-modal-buttons-row {
          display: flex;
          gap: 12px;
          margin-top: 10px;
        }
        
        .gm-btn-add-cart-yellow {
          flex: 2;
          height: 42px;
          padding: 0 16px;
          border-radius: 6px;
          border: 1.5px solid #FFB300;
          background: #FFB300;
          color: #000;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 180ms ease;
          white-space: nowrap;
        }
        
        .gm-btn-add-cart-yellow:hover:not(:disabled) {
          background: transparent;
          color: #FFB300;
        }
        
        .gm-btn-add-cart-yellow.gm-btn-disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background: #FFB300;
          color: #000;
        }
        
        .gm-btn-add-cart-yellow:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .gm-btn-view-cart-new {
          flex: 1;
          height: 36px;
          padding: 0 12px;
          border-radius: 6px;
          border: 1px solid #FFB300;
          background: transparent;
          color: #FFB300;
          font-weight: 400;
          font-size: 0.75rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
          text-decoration: none;
          transition: all 180ms ease;
          min-width: auto;
        }
        
        .gm-btn-view-cart-new:hover {
          background: rgba(255, 179, 0, 0.1);
          border-color: #FFA000;
          color: #FFA000;
        }
        
        .gm-btn-error {
          animation: pulse-red 0.4s ease-in-out;
          border-color: var(--gm-error) !important;
          color: var(--gm-error) !important;
        }
        
        @keyframes pulse-red {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); box-shadow: 0 0 15px rgba(239, 68, 68, 0.6); }
          100% { transform: scale(1); }
        }
        
        .success-toast-container {
          position: fixed;
          top: 100px;
          right: 20px;
          z-index: 10000;
          animation: slideInRight 0.4s ease-out;
        }
        
        .success-toast-content {
          background: #1e293b;
          border: 1px solid var(--gm-yellow-border);
          border-radius: 12px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
          min-width: 280px;
        }
        
        .toast-text h4 {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 700;
          color: #10B981;
        }
        
        .toast-text p {
          margin: 2px 0 0 0;
          font-size: 0.8rem;
          color: #94a3b8;
        }
        
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @media (max-width: 980px) {
          .gm-slot-single {
            min-width: 33.333%;
          }
          .gm-arrow-left {
            left: -6px;
          }
          .gm-arrow-right {
            right: -6px;
          }
          .gm-modal {
            flex-direction: column;
          }
          .gm-modal-left {
            min-width: auto;
            width: 100%;
          }
          .gm-modal-imgbox {
            min-height: 250px;
          }
          .gm-modal-buttons-row {
            flex-direction: column;
          }
          .gm-btn-view-cart-new {
            width: 100%;
          }
          .success-toast-container {
            top: auto;
            bottom: 20px;
            right: 10px;
            left: 10px;
          }
          .success-toast-content {
            min-width: auto;
          }
        }
        
        @media (max-width: 768px) {
          .gm-slot-single {
            min-width: 50%;
          }
          
          .gm-hero {
            height: clamp(180px, 30vh, 280px);
          }
          
          .gm-hero-title {
            font-size: 2rem;
          }
          
          .gm-hero-sub {
            font-size: 0.95rem;
          }
          
          .gm-img-wrapper {
            height: 200px;
          }
          
          .gm-img-dots {
            display: none;
          }
          
          .gm-modal {
            flex-direction: column;
            width: 98vw;
            max-height: 95vh;
            padding: 12px;
          }
          
          .gm-modal-left {
            flex: none;
            width: 100%;
            min-width: auto;
            max-height: 45vh;
          }
          
          .gm-modal-imgbox {
            min-height: 200px;
            max-height: 45vh;
          }
          
          .gm-modal-img {
            object-fit: contain;
          }
          
          .gm-modal-right {
            flex: 1;
            overflow-y: auto;
            max-height: 45vh;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          
          .gm-modal-right::-webkit-scrollbar {
            display: none;
            width: 0;
            background: transparent;
          }
          
          .gm-modal-title-light {
            font-size: 1.3rem;
          }
          
          .gm-modal-price {
            font-size: 1.2rem;
          }
          
          .gm-size-chip-new {
            padding: 5px 12px;
            font-size: 0.8rem;
            min-width: 45px;
          }
          
          .gm-qty-btn-round {
            width: 26px;
            height: 26px;
          }
          
          .gm-qty-value-round {
            font-size: 0.85rem;
            min-width: 22px;
          }
          
          .gm-sizes-grid {
            gap: 6px;
          }
          
          .gm-quantity-round {
            padding: 3px 6px;
            gap: 6px;
          }
          
          .gm-stock-row {
            gap: 6px;
            font-size: 0.8rem;
          }
          
          .gm-modal-buttons-row {
            display: flex;
            gap: 8px;
            margin-top: 12px;
          }
          
          .gm-btn-add-cart-yellow {
            flex: 2;
            height: 40px;
            padding: 0 12px;
            font-size: 0.85rem;
            border-radius: 4px;
            box-shadow: none !important;
          }
          
          .gm-btn-add-cart-yellow:hover {
            background: transparent;
            box-shadow: none !important;
            transform: none !important;
          }
          
          .gm-btn-view-cart-new {
            flex: 1;
            height: 34px;
            padding: 0 8px;
            min-width: auto;
            font-size: 0.7rem;
            border-radius: 4px;
            box-shadow: none !important;
          }
          
          .gm-btn-view-cart-new:hover {
            background: rgba(255, 179, 0, 0.1);
            border-color: #FFA000;
            color: #FFA000;
            box-shadow: none !important;
            transform: none !important;
          }
        }
        
        @media (max-width: 640px) {
          .gm-slot-single {
            min-width: 100%;
          }
          
          .gm-modal-buttons-row {
            display: flex;
            flex-direction: row;
            gap: 6px;
          }
          
          .gm-btn-add-cart-yellow {
            flex: 2;
            height: 36px;
            padding: 0 10px;
            font-size: 0.75rem;
            border-radius: 4px;
            box-shadow: none !important;
          }
          
          .gm-btn-view-cart-new {
            flex: 1;
            height: 32px;
            padding: 0 6px;
            font-size: 0.65rem;
            min-width: auto;
            border-radius: 4px;
            box-shadow: none !important;
          }
        }
        
        @media (max-width: 480px) {
          .gm-container {
            padding: 0 15px 40px 15px;
          }
          
          .gm-img-wrapper {
            height: 180px;
          }
          
          .gm-modal {
            padding: 10px;
            border-radius: 12px;
          }
          
          .gm-modal-left {
            max-height: 40vh;
          }
          
          .gm-modal-imgbox {
            min-height: 150px;
            max-height: 40vh;
          }
          
          .gm-modal-title-light {
            font-size: 1.15rem;
          }
          
          .gm-modal-price {
            font-size: 1.1rem;
          }
          
          .gm-sizes-grid {
            gap: 5px;
          }
          
          .gm-size-chip-new {
            padding: 4px 10px;
            font-size: 0.75rem;
            min-width: 40px;
          }
          
          .gm-modal-close {
            width: 36px;
            height: 36px;
            top: 8px;
            right: 8px;
          }
          
          .gm-btn-add-cart-yellow {
            height: 34px;
            font-size: 0.7rem;
            padding: 0 8px;
          }
          
          .gm-btn-view-cart-new {
            height: 30px;
            font-size: 0.65rem;
            padding: 0 5px;
          }
          
          .gm-qty-btn-round {
            width: 24px;
            height: 24px;
          }
          
          .gm-qty-value-round {
            font-size: 0.8rem;
            min-width: 20px;
          }
          
          .success-toast-container {
            top: 70px;
          }
        }
        
        .gm-modal-right {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        .gm-modal-right::-webkit-scrollbar {
          display: none;
          width: 0;
          background: transparent;
        }
        
        .gm-btn-add-cart-yellow,
        .gm-btn-view-cart-new,
        .gm-btn-cart {
          box-shadow: none !important;
          transition: background 180ms ease, border-color 180ms ease, color 180ms ease !important;
        }
        
        .gm-btn-add-cart-yellow:hover,
        .gm-btn-view-cart-new:hover,
        .gm-btn-cart:hover {
          box-shadow: none !important;
          transform: none !important;
        }
      `}</style>
    </div>
  );
};

export default Productos;