// src/components/CartIcon.jsx
import React from 'react';
import { FaShoppingCart } from 'react-icons/fa';

/**
 * Ícono del carrito con badge de cantidad
 * @param {number} itemCount - Número de artículos en el carrito
 */
const CartIcon = ({ itemCount = 0 }) => {
  return (
    <div style={styles.container}>
      <FaShoppingCart size={20} color="white" aria-label="Carrito" />

      {itemCount > 0 && (
        <span style={styles.badge}>
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </div>
  );
};

// ─── Estilos reutilizables ───────────────────────────────────────
const styles = {
  container: {
    position: 'relative',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    backgroundColor: '#FFC107',
    color: '#000',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    pointerEvents: 'none', // Evita interferir con clics
  },
};

export default CartIcon;