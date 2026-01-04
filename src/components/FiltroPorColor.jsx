// FiltroPorColor.jsx
import React, { useState } from 'react';
import ProductoDetalle from './ProductoDetalle'; // Importa el componente anterior
import { getProductsOnSale } from "../data"; // Asegúrate de importar tus productos

const FiltroPorColor = () => {
  const [colorSeleccionado, setColorSeleccionado] = useState(null);
  const [productosFiltrados, setProductosFiltrados] = useState([]);

  // Obtener todos los productos
  const todosLosProductos = getProductsOnSale();

  // Función para filtrar por color
  const filtrarPorColor = (colorHex) => {
    if (!colorHex) {
      setProductosFiltrados([]);
      setColorSeleccionado(null);
      return;
    }

    const filtrados = todosLosProductos.filter(producto =>
      producto.colores && producto.colores.includes(colorHex)
    );

    setProductosFiltrados(filtrados);
    setColorSeleccionado(colorHex);
  };

  // Obtener todos los colores únicos de todos los productos
  const todosLosColores = [...new Set(
    todosLosProductos.flatMap(producto => producto.colores || [])
  )];

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#0a0a0f',
      color: 'white'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
        Filtrar Productos por Color
      </h2>

      {/* Selector de colores */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        marginBottom: '20px'
      }}>
        <button
          onClick={() => filtrarPorColor(null)}
          style={{
            padding: '8px 15px',
            background: colorSeleccionado === null ? '#FFD700' : '#1e1e2e',
            color: colorSeleccionado === null ? 'black' : 'white',
            border: '2px solid #FFC107',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Todos los Productos
        </button>

        {todosLosColores.map((color, index) => (
          <button
            key={index}
            onClick={() => filtrarPorColor(color)}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: color,
              border: colorSeleccionado === color ? '3px solid #FFD700' : '2px solid white',
              cursor: 'pointer',
              boxShadow: '0 0 5px rgba(255,255,255,0.5)',
              transition: 'border 0.2s'
            }}
            title={`Filtrar por color ${color}`}
          />
        ))}
      </div>

      {/* Resultados */}
      {colorSeleccionado !== null && productosFiltrados.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          background: '#1e1e2e',
          borderRadius: '8px',
          marginTop: '20px'
        }}>
          <p>No se encontraron productos con este color.</p>
        </div>
      )}

      {productosFiltrados.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginTop: '20px'
        }}>
          {productosFiltrados.map(producto => (
            <ProductoDetalle key={producto.id} producto={producto} />
          ))}
        </div>
      )}

      {/* Mostrar todos los productos si no hay filtro activo */}
      {colorSeleccionado === null && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginTop: '20px'
        }}>
          {todosLosProductos.map(producto => (
            <ProductoDetalle key={producto.id} producto={producto} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FiltroPorColor;