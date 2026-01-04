// src/components/SearchBar.jsx
import React from 'react';
import { FaSearch } from 'react-icons/fa';

const SearchBar = ({ placeholder = "Buscar...", value, onChange, maxWidth }) => {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth }}>
      <FaSearch
        style={{
          position: 'absolute',
          left: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#aaa',
          fontSize: '14px',
        }}
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          width: '100%',
          padding: '8px 10px',
          paddingLeft: '32px', // espacio para el ícono
          borderRadius: '6px',
          border: '1px solid #444',
          backgroundColor: '#303040',
          color: '#fff',
          fontSize: '13px',
        }}
      />
    </div>
  );
};

export default SearchBar;
