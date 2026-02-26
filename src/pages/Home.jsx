// src/pages/Home.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Footer from "../components/Footer";
import {
  FaArrowRight,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaShoppingCart,
  FaStar,
  FaRegStar,
  FaStarHalfAlt,
  FaMinus,
  FaPlus,
  FaCheckCircle,
} from "react-icons/fa";
import { initialProducts } from "../data";

const BANNER_URL =
  "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1764642176/WhatsApp_Image_2025-12-01_at_9.07.34_PM_a3k3ob.jpg";

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

/* =========================
HELPERS
========================= */
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
      {half === 1 && <FaStarHalfAlt key="half" />}
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

/* =========================
COMPONENT
========================= */
const Home = ({ updateCart, cartItems }) => {
  const { pathname } = useLocation();
  const [carouselIndices, setCarouselIndices] = useState({
    ofertas: 0,
    destacados: 0,
    masComprados: 0,
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [inventory, setInventory] = useState({});
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showSizeError, setShowSizeError] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const inv = ensureInventory(initialProducts);
    setInventory(inv);
  }, []);

  const ofertas = useMemo(
    () =>
      initialProducts
        .filter((p) => (p.hasDiscount || p.oferta) && p.isActive !== false)
        .slice(0, 12),
    []
  );

  const destacados = useMemo(
    () =>
      initialProducts
        .filter((p) => (p.destacado || p.isFeatured) && p.isActive !== false)
        .slice(0, 12),
    []
  );

  const masComprados = useMemo(
    () => initialProducts.filter((p) => p.isActive !== false).slice(0, 12),
    []
  );

  const handleCarouselScroll = (section, direction) => {
    setCarouselIndices((prev) => {
      const current = prev[section];
      const items =
        section === "ofertas"
          ? ofertas
          : section === "destacados"
          ? destacados
          : masComprados;
      const maxIndex = Math.max(0, Math.ceil(items.length / 4) - 1);
      const next =
        direction === "left"
          ? Math.max(0, current - 1)
          : Math.min(maxIndex, current + 1);
      return { ...prev, [section]: next };
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

  const ProductCard = ({ product, badge, badgeType }) => {
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
          {badge && (
            <span
              className={`gm-badge gm-badge--fill gm-badge--${
                badgeType || "default"
              }`}
            >
              {badge}
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
    setShowSizeError(false);
  };

  const handleSizeSelect = (talla) => {
    if (selectedSize === talla) {
      setSelectedSize(null);
    } else {
      setSelectedSize(talla);
      setShowSizeError(false);
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

  const incrementQuantity = () => {
    if (!selectedSize && sizesForModal.length > 0) {
      setShowSizeError(true);
      setTimeout(() => setShowSizeError(false), 2000);
      return;
    }
    const available = selectedSize
      ? getAvailableFor(inventory, selectedProduct?.id, selectedSize)
      : 99;
    if (quantity < available && quantity < 10) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const sections = [
    {
      id: "ofertas",
      title: "Ofertas especiales",
      data: ofertas,
      link: "/ofertas",
      tag: "OFERTA",
      badgeType: "oferta",
    },
    {
      id: "destacados",
      title: "Gorras destacadas",
      data: destacados,
      link: "/productos?filter=destacados",
      tag: "DESTACADO",
      badgeType: "destacado",
    },
    {
      id: "masComprados",
      title: "Los más comprados",
      data: masComprados,
      link: "/productos",
      tag: "MÁS VENDIDO",
      badgeType: "masvendido",
    },
  ];

  return (
    <div className="gm-home">
      {/* HERO */}
      <section className="gm-hero">
        <div className="gm-hero-bg" />
        <div className="gm-hero-fade-top" />
        <div className="gm-hero-fade-bottom" />
        <div className="gm-hero-inner">
          <h1 className="gm-hero-title">Gorras Medellín</h1>
          <p className="gm-hero-sub">
            Estilo premium a tu alcance.
          </p>
          <p className="gm-hero-help">
            Toca la imagen para ver más fotos • Click en el carrito para añadir
          </p>
        </div>
      </section>

      <div className="gm-container">
        {sections.map((section) => (
          <div key={section.id} className="gm-section">
            <div className="gm-section-header">
              <h2 className="gm-section-title">{section.title}</h2>
              <Link to={section.link} className="gm-pill-btn">
                <span>Ver todos</span> <FaArrowRight size={13} />
              </Link>
            </div>
            <div className="gm-carousel">
              <button
                className="gm-arrow gm-arrow-left"
                onClick={() => handleCarouselScroll(section.id, "left")}
                disabled={carouselIndices[section.id] === 0}
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
                      carouselIndices[section.id] * 100
                    }%)`,
                  }}
                >
                  {(section.data || []).map((p) => (
                    <div key={p.id} className="gm-slot">
                      <ProductCard
                        product={p}
                        badge={section.tag}
                        badgeType={section.badgeType}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <button
                className="gm-arrow gm-arrow-right"
                onClick={() => handleCarouselScroll(section.id, "right")}
                disabled={
                  carouselIndices[section.id] >=
                  Math.ceil((section.data?.length || 0) / 4) - 1
                }
                aria-label="Siguiente"
                type="button"
              >
                <FaChevronRight size={16} />
              </button>
            </div>
          </div>
        ))}

        {/* SECCIÓN CORREGIDA - AHORA APUNTA A /admin/Productos */}
        <div className="gm-section">
          <div className="gm-section-header">
            <h2 className="gm-section-title">Todos los productos</h2>
            <Link to="/productos" className="gm-pill-btn">
              <span>Ver todos</span> <FaArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      <Footer />

      {/* MODAL DE PRODUCTO */}
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
                  <h2 className="gm-modal-title">{selectedProduct.nombre}</h2>
                  <div className="gm-modal-tags-inline">
                    {(selectedProduct.hasDiscount || selectedProduct.oferta) && (
                      <span className="gm-tag gm-tag--offer">Oferta</span>
                    )}
                    {(selectedProduct.destacado || selectedProduct.isFeatured) && (
                      <span className="gm-tag gm-tag--featured">Destacado</span>
                    )}
                  </div>
                </div>
                <div className="gm-price-tags-row">
                  <div className="gm-modal-price-below">
                    ${Math.round(selectedProduct.precio || 0).toLocaleString()}
                  </div>
                  <div className="gm-modal-tags-inline">
                    {selectedProduct.colores &&
                      selectedProduct.colores.length > 0 && (
                        <>
                          {selectedProduct.colores.includes("Blanco") && (
                            <span className="gm-tag gm-tag--color-white">
                              Blanco
                            </span>
                          )}
                          {selectedProduct.colores.includes("Café") && (
                            <span className="gm-tag gm-tag--color-brown">
                              Café
                            </span>
                          )}
                          {selectedProduct.colores.includes("Azul") && (
                            <span className="gm-tag gm-tag--color-blue">
                              Azul
                            </span>
                          )}
                        </>
                      )}
                  </div>
                </div>
              </div>
              <div className="gm-bulk-discount-info">
                A partir de {BULK_MIN_QTY} unidades tienes descuento por mayor
              </div>
              {sizesForModal.length > 0 && (
                <div className="gm-sizes">
                  <div className="gm-sizes-head">
                    <span className="gm-sizes-label">Talla: </span>
                  </div>
                  <div className="gm-sizes-wrap">
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
                          className={`gm-size-chip ${
                            disabled ? "is-disabled" : ""
                          } ${isSelected ? "is-selected" : ""}`}
                          onClick={() => !disabled && handleSizeSelect(t)}
                          title={disabled ? "Agotado" : `Disponible: ${ava}`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                  {showSizeError && (
                    <div className="gm-size-error-msg">
                      ⚠️ Debes seleccionar una talla primero
                    </div>
                  )}
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
              <div className="gm-modal-buttons-row">
                <button
                  className={`gm-btn-add-cart ${
                    showSizeError ? "gm-btn-error" : ""
                  }`}
                  onClick={handleModalAddToCart}
                >
                  <FaShoppingCart size={16} /> Añadir al Carrito
                </button>
                <Link
                  to="/cart"
                  className="gm-btn-view-cart-thin"
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
        }
        
        .gm-home {
          background: var(--gm-bg);
          color: var(--gm-text);
          min-height: 100vh;
          padding-top: 70px;
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
            url("${BANNER_URL}");
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
        
        .gm-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 18px;
          border-radius: 999px;
          border: 1px solid var(--gm-yellow-border);
          color: var(--gm-yellow-text);
          background: transparent;
          text-decoration: none;
          font-weight: 700;
          font-size: 0.92rem;
          white-space: nowrap;
          transition: 180ms ease;
        }
        
        .gm-pill-btn svg {
          color: var(--gm-yellow-text);
        }
        
        .gm-pill-btn:hover {
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
        
        .gm-slot {
          min-width: 25%;
          padding: 0 10px;
          box-sizing: border-box;
        }
        
        .gm-arrow {
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
        
        .gm-arrow:hover {
          background: rgba(255,215,0,0.08);
        }
        
        .gm-arrow:disabled {
          opacity: 0;
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
          height: 200px;
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
          left: 10px;
          padding: 6px 10px;
          border-radius: 12px;
          font-weight: 900;
          font-size: 0.72rem;
          letter-spacing: .4px;
          border: 1px solid rgba(255,255,255,0.12);
        }
        
        .gm-badge--fill {
          color: #0b1220;
        }
        
        .gm-badge--oferta {
          background: linear-gradient(135deg, #FFD700, #E6C85A);
        }
        
        .gm-badge--destacado {
          background: linear-gradient(135deg, #60A5FA, #2563EB);
          color: #fff;
        }
        
        .gm-badge--masvendido {
          background: linear-gradient(135deg, #34D399, #10B981);
          color: #062312;
        }
        
        .gm-badge--default {
          background: rgba(255,215,0,0.9);
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
        
        .gm-info {
          padding: 12px 8px 10px 8px;
        }
        
        .gm-product-name {
          margin: 0 0 8px 0;
          font-size: 0.95rem;
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
          margin-top: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        
        .gm-price-actions {
          font-variant-numeric: tabular-nums;
          font-family: "Times New Roman", Times, serif;
          font-size: 1.15rem;
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
          width: 44px;
          height: 44px;
          padding: 0;
          border-radius: 50%;
          border: none;
          background: #FFC107;
          color: #000;
        }
        
        .gm-btn-cart:hover {
          background: #FFB300;
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
          width: min(900px, 100%);
          background: #030712;
          border: none;
          border-radius: 16px;
          display: flex;
          gap: 12px;
          padding: 12px;
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
          min-width: 320px;
          border-radius: 12px;
          overflow: hidden;
        }
        
        .gm-modal-imgbox {
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
        
        .gm-modal-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }
        
        .gm-modal-right { 
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 10px;
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
        
        .gm-modal-title {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 500;
          line-height: 1.2;
          color: #fff;
        }
        
        .gm-price-tags-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        
        .gm-modal-price-below {
          color: var(--gm-yellow-strong);
          font-weight: 900;
          font-size: 1.4rem;
          font-family: "Times New Roman", Times, serif;
          white-space: nowrap;
        }
        
        .gm-modal-tags-inline {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        
        .gm-tag--color-white { 
          background: #fff;
          color: #000;
          border-color: #fff;
        }
        
        .gm-tag--color-brown {
          background: #8B4513;
          color: #fff;
          border-color: #8B4513;
        }
        
        .gm-tag--color-blue {
          background: #0047AB;
          color: #fff;
          border-color: #0047AB;
        }
        
        .gm-bulk-discount-info {
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
        
        .gm-tag {
          padding: 4px 10px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.72rem;
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
        
        .gm-sizes {
          background: rgba(42,74,111,0.3);
          border: 1px solid rgba(96,165,250,0.2);
          border-radius: 12px;
          padding: 10px;
          margin: 4px 0;
        }
        
        .gm-sizes-head {
          margin-bottom: 8px;
        }
        
        .gm-sizes-label {
          font-weight: 700;
          color: #fff;
          font-size: 0.9rem;
        }
        
        .gm-sizes-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .gm-size-chip {
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
        
        .gm-size-chip:hover:not(.is-disabled) {
          border-color: var(--gm-blue-light);
          background: rgba(42,74,111,0.6);
        }
        
        .gm-size-chip.is-selected {
          background: rgba(255, 215, 0, 0.15);
          border-color: var(--gm-yellow-border);
          color: var(--gm-yellow-text);
        }
        
        .gm-size-chip.is-disabled {
          opacity: 0.35;
          border-color: rgba(255,255,255,0.10);
          cursor: not-allowed;
        }
        
        .gm-size-error-msg {
          color: var(--gm-error);
          font-size: 0.8rem;
          font-weight: 600;
          margin-top: 8px;
          animation: shake 0.4s ease-in-out;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .gm-quantity-selector {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 6px 0;
        }
        
        .gm-quantity-label {
          font-weight: 700;
          font-size: 0.9rem;
          color: #fff;
        }
        
        .gm-quantity-controls {
          display: flex;
          align-items: center;
          gap: 0;
          border: 1px solid var(--gm-blue-light);
          border-radius: 20px;
          overflow: hidden;
        }
        
        .gm-qty-btn {
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
        
        .gm-qty-btn:hover:not(:disabled) {
          background: rgba(42,74,111,0.8);
        }
        
        .gm-qty-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        
        .gm-qty-value {
          min-width: 40px;
          text-align: center;
          font-weight: 900;
          font-size: 1rem;
          color: #fff;
        }
        
        .gm-modal-buttons-row {
          display: flex;
          gap: 10px;
          margin-top: 8px;
        }
        
        .gm-btn-add-cart {
          flex: 2;
          height: 42px;
          padding: 0 16px;
          border-radius: 10px;
          border: none;
          background: #FFB300;
          color: #000;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 180ms ease;
          white-space: nowrap;
        }
        
        .gm-btn-add-cart:hover {
          background: #FFA000;
        }
        
        .gm-btn-error {
          animation: pulse-red 0.4s ease-in-out;
          background: var(--gm-error) !important;
          color: white !important;
        }
        
        @keyframes pulse-red {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); box-shadow: 0 0 15px rgba(239, 68, 68, 0.6); }
          100% { transform: scale(1); }
        }
        
        .gm-btn-view-cart-thin {
          flex: 1;
          height: 36px;
          padding: 0 10px;
          border-radius: 8px;
          border: 1.5px solid #FFB300;
          background: transparent;
          color: #FFB300;
          font-weight: 600;
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
        
        .gm-btn-view-cart-thin:hover {
          background: rgba(255, 179, 0, 0.1);
          border-color: #FFA000;
          color: #FFA000;
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
          .gm-slot { min-width: 50%; }
          .gm-arrow-left { left: -6px; }
          .gm-arrow-right { right: -6px; }
          .gm-modal { flex-direction: column; }
          .gm-modal-left { min-width: auto; width: 100%; }
          .gm-modal-imgbox { min-height: 300px; }
          .gm-modal-buttons-row {
            flex-direction: column;
          }
          .gm-btn-view-cart-thin {
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
            height: 180px;
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
            max-height: 50vh;
          }
          
          .gm-modal-imgbox {
            min-height: 250px;
            max-height: 50vh;
          }
          
          .gm-modal-img {
            object-fit: contain;
          }
          
          .gm-modal-right {
            flex: 1;
            overflow-y: auto;
            max-height: 40vh;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          
          .gm-modal-right::-webkit-scrollbar {
            display: none;
            width: 0;
            background: transparent;
          }
          
          .gm-modal-title {
            font-size: 1.3rem;
          }
          
          .gm-modal-price-below {
            font-size: 1.2rem;
          }
          
          .gm-size-chip {
            padding: 8px 12px;
            font-size: 0.9rem;
            min-width: 44px;
          }
          
          .gm-qty-btn {
            width: 36px;
            height: 36px;
          }
          
          .gm-modal-buttons-row {
            display: flex;
            gap: 8px;
            margin-top: 12px;
          }
          
          .gm-btn-add-cart {
            flex: 2;
            height: 40px;
            padding: 0 12px;
            font-size: 0.85rem;
            border-radius: 8px;
            box-shadow: none !important;
          }
          
          .gm-btn-add-cart:hover {
            background: #FFA000;
            box-shadow: none !important;
            transform: none !important;
          }
          
          .gm-btn-view-cart-thin {
            flex: 1;
            height: 34px;
            padding: 0 8px;
            min-width: auto;
            font-size: 0.7rem;
            border-radius: 6px;
            box-shadow: none !important;
          }
          
          .gm-btn-view-cart-thin:hover {
            background: rgba(255, 179, 0, 0.1);
            border-color: #FFA000;
            color: #FFA000;
            box-shadow: none !important;
            transform: none !important;
          }
        }
        
        @media (max-width: 640px) {
          .gm-slot { min-width: 100%; }
          
          .gm-modal-buttons-row {
            display: flex;
            flex-direction: row;
            gap: 6px;
          }
          
          .gm-btn-add-cart {
            flex: 2;
            height: 36px;
            padding: 0 10px;
            font-size: 0.75rem;
            border-radius: 6px;
            box-shadow: none !important;
          }
          
          .gm-btn-view-cart-thin {
            flex: 1;
            height: 32px;
            padding: 0 6px;
            font-size: 0.65rem;
            min-width: auto;
            border-radius: 6px;
            box-shadow: none !important;
          }
        }
        
        @media (max-width: 480px) {
          .gm-container {
            padding: 0 15px 40px 15px;
          }
          
          .gm-modal {
            padding: 10px;
            border-radius: 12px;
          }
          
          .gm-modal-left {
            max-height: 45vh;
          }
          
          .gm-modal-imgbox {
            min-height: 200px;
            max-height: 45vh;
          }
          
          .gm-modal-title {
            font-size: 1.15rem;
          }
           
          .gm-modal-price-below {
            font-size: 1.1rem;
          }
          
          .gm-sizes-wrap {
            gap: 6px;
          }
          
          .gm-size-chip {
            padding: 6px 10px; 
            font-size: 0.85rem;
            min-width: 40px;
          }
          
          .gm-modal-close {
            width: 36px;
            height: 36px;
            top: 8px;
            right: 8px;
          }
          
          .gm-btn-add-cart {
            height: 34px;
            font-size: 0.7rem;
            padding: 0 8px;
          }
          
          .gm-btn-view-cart-thin {
            height: 30px;
            font-size: 0.65rem;
            padding: 0 5px;
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
        
        .gm-btn-add-cart,
        .gm-btn-view-cart-thin,
        .gm-btn-cart {
          box-shadow: none !important;
          transition: background 180ms ease, border-color 180ms ease, color 180ms ease !important;
        }
        
        .gm-btn-add-cart:hover,
        .gm-btn-view-cart-thin:hover,
        .gm-btn-cart:hover {
          box-shadow: none !important;
          transform: none !important;
        }
      `}</style>
    </div>
  );
};

export default Home;