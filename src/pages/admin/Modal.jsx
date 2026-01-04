// src/pages/admin/Modal.jsx - VERSIÓN SIN SCROLL
import React, { useEffect } from 'react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  showActions = false, 
  actionLabel = 'Guardar', 
  onSave,
  size = 'medium',
  closeOnOverlayClick = true,
  fullHeight = false
}) => {
  // ✅ Efecto mejorado para prevenir scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [isOpen]);

  // ✅ Manejo de teclado (Escape para cerrar)
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // ✅ Tamaños predefinidos
  const sizeStyles = {
    small: 'min(95%, 400px)',
    medium: 'min(95%, 450px)',
    large: 'min(95%, 550px)',
    xlarge: 'min(98%, 700px)',
    full: '95%'
  };

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '10px',
        opacity: isOpen ? 1 : 0,
        transition: 'opacity 0.2s ease',
      }}
      onClick={handleOverlayClick}
    >
      <div
        style={{
          backgroundColor: '#0f172a',
          borderRadius: '12px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          width: sizeStyles[size] || sizeStyles.medium,
          maxWidth: sizeStyles[size] || sizeStyles.medium,
          maxHeight: '90vh', // ✅ LIMITAR altura máxima
          padding: '0',
          position: 'relative',
          overflow: 'hidden', // ✅ EVITAR scroll en el contenedor principal
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          transform: isOpen ? 'scale(1)' : 'scale(0.95)',
          transition: 'transform 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón de Cerrar */}
        <button
          aria-label="Cerrar modal"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            fontSize: '1.2rem',
            cursor: 'pointer',
            padding: '3px',
            borderRadius: '4px',
            transition: 'all 0.2s ease',
            zIndex: 10,
            width: '26px',
            height: '26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#94a3b8';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          ×
        </button>

        {/* Título */}
        <div style={{
          padding: '18px 18px 0 18px',
          flexShrink: 0,
        }}>
          <h2
            id="modal-title"
            style={{
              color: '#F5C81B',
              fontSize: '1.2rem',
              fontWeight: '700',
              marginBottom: '3px',
              textAlign: 'left',
              lineHeight: '1.4',
              paddingRight: '30px',
            }}
          >
            {title}
          </h2>
        </div>

        {/* Contenido dinámico - SIN SCROLL */}
        <div style={{ 
          padding: '18px',
          paddingTop: '12px',
          paddingBottom: showActions ? '0' : '18px',
          overflow: 'hidden', // ✅ CAMBIADO: sin scroll
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}>
          {children}
        </div>

        {/* Pie: botones (solo si showActions=true) */}
        {showActions && (
          <div
            style={{
              padding: '16px 18px 18px 18px',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: 'transparent',
                color: '#F5C81B',
                padding: '8px 16px',
                border: '1px solid #F5C81B',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: '600',
                transition: 'all 0.2s',
                minWidth: '90px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F5C81B';
                e.currentTarget.style.color = '#000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#F5C81B';
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onSave}
              style={{
                backgroundColor: '#F5C81B',
                color: '#000',
                padding: '8px 18px',
                border: '1px solid #F5C81B',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: '600',
                transition: 'background-color 0.2s',
                minWidth: '100px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e6b800')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F5C81B')}
            >
              {actionLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;