// ProductoDetalle.jsx
import React, { useState } from 'react';

const ProductoDetalle = ({ producto }) => {
  const [imagenActual, setImagenActual] = useState(0);

  const siguienteImagen = () => {
    setImagenActual((prev) => (prev + 1) % producto.imagenes.length);
  };

  const anteriorImagen = () => {
    setImagenActual((prev) => (prev - 1 + producto.imagenes.length) % producto.imagenes.length);
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      background: '#0a0a0f', // Fondo oscuro
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      color: 'white'
    }}>
      {/* Título */}
      <h1 style={{
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '10px',
        textAlign: 'center'
      }}>
        {producto.nombre}
      </h1>

      {/* Categoría */}
      <div style={{
        fontSize: '14px',
        color: '#aaa',
        marginBottom: '15px',
        textAlign: 'center',
        padding: '5px 10px',
        background: '#1e1e2e',
        borderRadius: '4px',
        display: 'inline-block'
      }}>
        Categoría: {producto.categoria}
      </div>

      {/* Carrusel de Imágenes */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '300px',
        overflow: 'hidden',
        borderRadius: '8px',
        marginBottom: '20px',
        background: '#12121a'
      }}>
        {/* Botones de navegación */}
        <button
          onClick={anteriorImagen}
          style={{
            position: 'absolute',
            top: '50%',
            left: '10px',
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            zIndex: 10,
            fontSize: '20px',
            color: 'white',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.4)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
        >
          &lt;
        </button>

        <button
          onClick={siguienteImagen}
          style={{
            position: 'absolute',
            top: '50%',
            right: '10px',
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            zIndex: 10,
            fontSize: '20px',
            color: 'white',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.4)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
        >
          &gt;
        </button>

        {/* Imagen actual */}
        <img
          src={producto.imagenes[imagenActual]}
          alt={`${producto.nombre} - Imagen ${imagenActual + 1}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'opacity 0.3s ease'
          }}
        />

        {/* Indicadores de puntos */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '5px'
        }}>
          {producto.imagenes.map((_, index) => (
            <div
              key={index}
              onClick={() => setImagenActual(index)}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: index === imagenActual ? '#FFD700' : 'rgba(255,255,255,0.3)',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            />
          ))}
        </div>
      </div>

      {/* Colores disponibles */}
      {producto.colores && producto.colores.length > 0 && (
        <div style={{
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <span style={{
            fontSize: '14px',
            color: '#aaa',
            marginRight: '10px'
          }}>Colores:</span>
          {producto.colores.map((color, index) => (
            <span
              key={index}
              style={{
                display: 'inline-block',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: color,
                border: '2px solid #fff',
                marginRight: '8px',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                boxShadow: '0 0 5px rgba(255,255,255,0.5)'
              }}
              title={`Color ${index + 1}`}
              onClick={() => console.log(`Seleccionado color: ${color}`)}
            ></span>
          ))}
        </div>
      )}

      {/* Precios */}
      <div style={{
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#FFD700', // Precio actual en amarillo
          marginBottom: '5px'
        }}>
          ${producto.precio.toLocaleString()}
        </div>
        <div style={{
          fontSize: '18px',
          color: '#999',
          textDecoration: 'line-through',
          marginBottom: '5px'
        }}>
          ${producto.originalPrice.toLocaleString()}
        </div>
        {producto.tags && producto.tags.some(tag => tag.startsWith('-')) && (
          <div style={{
            fontSize: '14px',
            color: '#e63946',
            fontWeight: 'bold'
          }}>
            {producto.tags.find(tag => tag.startsWith('-'))} de descuento
          </div>
        )}
      </div>

      {/* Botón Agregar al Carrito */}
      <button style={{
        width: '100%',
        padding: '15px',
        background: '#FFD700',
        color: 'black',
        border: '2px solid #FFC107',
        borderRadius: '8px',
        fontSize: '18px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        marginBottom: '15px'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = '#FFC107';
        e.target.style.transform = 'scale(1.02)';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = '#FFD700';
        e.target.style.transform = 'scale(1)';
      }}
      >
        🛒 Agregar al Carrito
      </button>

      {/* Stock */}
      <div style={{
        fontSize: '14px',
        color: producto.stock > 10 ? '#2a9d8f' :
               producto.stock > 0 ? '#e9c46a' : '#e63946',
        textAlign: 'center',
        paddingBottom: '10px'
      }}>
        {producto.stock > 0
          ? `${producto.stock} unidades disponibles`
          : 'Producto agotado'}
      </div>
    </div>
  );
};

export default ProductoDetalle;