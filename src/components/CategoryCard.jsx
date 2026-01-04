// src/components/CategoryCard.jsx
import React from 'react';
import { Tags } from 'lucide-react';

const CategoryCard = ({ category, onEdit, onDelete }) => {
  return (
    <div style={{
      backgroundColor: '#121522', // Fondo oscuro
      padding: '16px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      transition: 'box-shadow 0.2s',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => e.target.style.boxShadow = '0 6px 8px rgba(0,0,0,0.2)'}
    onMouseLeave={(e) => e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 'bold',
          color: 'white'
        }}>{category.nombre}</h3>
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          backgroundColor: category.isActive ? '#10b981' : '#ef4444',
          color: 'white'
        }}>
          {category.isActive ? 'Activo' : 'Inactivo'}
        </span>
      </div>
      <p style={{
        color: '#9ca3af',
        fontSize: '14px',
        marginBottom: '16px'
      }}>{category.descripcion}</p>
      <div style={{
        display: 'flex',
        gap: '8px'
      }}>
        <button
          onClick={onEdit}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
        >
          Editar
        </button>
        <button
          onClick={onDelete}
          style={{
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
};

export default CategoryCard;