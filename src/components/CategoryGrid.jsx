// src/components/CategoryGrid.jsx
import React from 'react';

const CategoryGrid = ({ categories, onEdit, onDelete }) => {
  if (!categories.length) return <p style={{ color: '#aaa' }}>No hay categorías.</p>;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '16px',
      marginTop: '20px',
    }}>
      {categories.map(cat => (
        <div key={cat.id} style={{
          backgroundColor: '#121522',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #2a2d3a',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div>
            <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
              {cat.nombre}
            </h3>
            {cat.descripcion && <p style={{ color: '#aaa', fontSize: '13px' }}>{cat.descripcion}</p>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
            <button
              onClick={() => onEdit(cat)}
              style={{
                backgroundColor: '#FFC107',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              ✏️ Editar
            </button>
            <button
              onClick={() => onDelete(cat.id)}
              style={{
                backgroundColor: '#f44336',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '12px',
                cursor: 'pointer',
                color: '#fff',
              }}
            >
              🗑️ Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryGrid;
