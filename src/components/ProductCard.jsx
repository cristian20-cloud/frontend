// src/components/ProductCard.jsx
import React, { useState } from "react";
import { calculateDiscountPercentage, colorMap } from "../data";

const ProductCard = ({ product, onAddToCart }) => {
  const [isHovered, setIsHovered] = useState(false);
  const discountPercentage = calculateDiscountPercentage(
    product.originalPrice,
    product.precio
  );

  const isNuevo = product.tags?.includes("NUEVO");

  const handleAddToCart = () => {
    onAddToCart(product);
    // Mostrar notificación
    alert(`${product.nombre} agregado al carrito`);
  };

  return (
    <div 
      style={{
        ...styles.card,
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 25px 50px rgba(0, 0, 0, 0.5)' : '0 10px 25px rgba(0, 0, 0, 0.3)',
        borderColor: isHovered ? '#FBBF24' : '#1F2937',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Imagen */}
      <div style={styles.imageContainer}>
        {product.imagenes?.[0] ? (
          <img
            src={product.imagenes[0]}
            alt={product.nombre}
            style={{
              ...styles.productImage,
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            }}
          />
        ) : (
          <div style={styles.placeholderImage}>🖼</div>
        )}

        {/* Badges */}
        <div style={styles.badgesContainer}>
          {isNuevo && (
            <span style={styles.nuevoBadge}>
              NUEVO
            </span>
          )}
          <span style={styles.discountBadge}>
            -{discountPercentage}%
          </span>
        </div>
      </div>

      {/* Info */}
      <div style={styles.infoContainer}>
        <h3 style={styles.productName}>
          {product.nombre}
        </h3>

        {/* Colores */}
        <div style={styles.colorsSection}>
          <span style={styles.colorsLabel}>Colores:</span>
          <div style={styles.colorsContainer}>
            {product.colores?.slice(0, 4).map((color, idx) => (
              <div
                key={idx}
                style={{
                  ...styles.colorDot,
                  backgroundColor: colorMap[color.toLowerCase()] || "#FFFFFF",
                  borderColor: isHovered ? '#FBBF24' : '#374151',
                }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Precio */}
        <div style={styles.priceContainer}>
          <span style={styles.currentPrice}>
            ${product.precio.toLocaleString()}
          </span>
          <span style={styles.originalPrice}>
            ${product.originalPrice.toLocaleString()}
          </span>
        </div>

        {/* Botón */}
        <button
          onClick={handleAddToCart}
          style={{
            ...styles.addButton,
            backgroundColor: isHovered ? '#FBBF24' : '#D97706',
            transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
          }}
        >
          <span style={styles.cartIcon}>🛒</span>
          <span>Agregar al Carrito</span>
        </button>
      </div>
    </div>
  );
};

// Estilos del ProductCard
const styles = {
  card: {
    backgroundColor: '#0A0A0A',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid #1F2937',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  imageContainer: {
    position: 'relative',
    height: '224px',
    backgroundColor: '#111111',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  productImage: {
    maxHeight: '100%',
    maxWidth: '100%',
    objectFit: 'contain',
    padding: '16px',
    transition: 'transform 0.3s ease',
  },
  placeholderImage: {
    color: '#6B7280',
    fontSize: '3rem',
  },
  badgesContainer: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  nuevoBadge: {
    padding: '4px 8px',
    backgroundColor: '#FBBF24',
    color: '#000000',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    borderRadius: '12px',
    display: 'inline-block',
  },
  discountBadge: {
    padding: '4px 8px',
    backgroundColor: '#EF4444',
    color: '#FFFFFF',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    borderRadius: '12px',
    display: 'inline-block',
  },
  infoContainer: {
    padding: '20px',
  },
  productName: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: '12px',
    lineHeight: '1.4',
    display: '-webkit-box',
    WebkitLineClamp: '2',
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minHeight: '3em',
  },
  colorsSection: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px',
  },
  colorsLabel: {
    fontSize: '0.75rem',
    color: '#9CA3AF',
    marginRight: '8px',
  },
  colorsContainer: {
    display: 'flex',
    gap: '4px',
  },
  colorDot: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border: '2px solid #374151',
    transition: 'border-color 0.3s ease',
  },
  priceContainer: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
    marginBottom: '20px',
  },
  currentPrice: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#FBBF24',
  },
  originalPrice: {
    fontSize: '0.875rem',
    color: '#6B7280',
    textDecoration: 'line-through',
  },
  addButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px',
    backgroundColor: '#D97706',
    color: '#000000',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  cartIcon: {
    fontSize: '1.125rem',
  },
};

// Estilos globales para ProductCard
const ProductCardGlobalStyles = () => (
  <style>
    {`
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .product-card-enter {
        animation: fadeIn 0.5s ease;
      }
    `}
  </style>
);

// Componente con estilos globales
const ProductCardWithStyles = (props) => (
  <>
    <ProductCardGlobalStyles />
    <ProductCard {...props} />
  </>
);

export default ProductCardWithStyles;