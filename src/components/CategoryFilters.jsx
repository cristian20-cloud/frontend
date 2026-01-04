// src/components/CategoryFilters.jsx
import React from 'react';

const CategoryFilters = ({ searchTerm, onSearchChange, filterStatus, onFilterChange, sortOrder, onSortToggle }) => {
  return (
    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
      <input
        type="text"
        value={searchTerm}
        onChange={e => onSearchChange(e.target.value)}
        placeholder="Buscar categoría..."
        style={{
          padding: '8px 12px',
          borderRadius: '6px',
          border: '1px solid #444',
          backgroundColor: '#2a2d3a',
          color: '#fff',
          flex: '1',
          minWidth: '180px',
        }}
      />
      <select
        value={filterStatus}
        onChange={e => onFilterChange(e.target.value)}
        style={{
          padding: '8px 12px',
          borderRadius: '6px',
          border: '1px solid #444',
          backgroundColor: '#2a2d3a',
          color: '#fff',
        }}
      >
        <option value="todos">Todos</option>
        <option value="activo">Activos</option>
        <option value="inactivo">Inactivos</option>
      </select>
      <button
        onClick={onSortToggle}
        style={{
          padding: '8px 12px',
          borderRadius: '6px',
          border: '1px solid #FFC107',
          backgroundColor: '#121522',
          color: '#FFC107',
          cursor: 'pointer',
        }}
      >
        Orden: {sortOrder === 'asc' ? 'A → Z' : 'Z → A'}
      </button>
    </div>
  );
};

export default CategoryFilters;
