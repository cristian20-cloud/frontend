// components/SearchInput.jsx
import React from 'react';

const SearchInput = ({ 
  value, 
  onChange, 
  placeholder = "Buscar...", 
  onClear,
  onSearch,
  fullWidth = true,
  style = {},
  inputStyle = {}
}) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && value.trim()) {
      e.preventDefault();
      if (onSearch) {
        onSearch(value);
      }
    }
  };

  const handleSearchClick = () => {
    if (value.trim() && onSearch) {
      onSearch(value);
    }
  };

  return (
    <div style={{ 
      position: 'relative', 
      width: fullWidth ? '100%' : '400px',
      flexShrink: 0,
      flex: fullWidth ? 1 : 'none',
      ...style
    }}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{
          width: '100%',
          padding: '8px 12px 8px 36px',
          backgroundColor: '#000000',
          border: '1px solid #F5C81B',
          color: '#fff',
          borderRadius: '6px',
          fontSize: '13px',
          outline: 'none',
          transition: 'all 0.2s ease',
          paddingRight: value ? '32px' : '12px',
          cursor: 'text',
          height: '36px',
          boxSizing: 'border-box',
          ...inputStyle
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#F5C81B';
          e.target.style.backgroundColor = '#0d0d0d';
          e.target.style.boxShadow = '0 0 0 2px rgba(245, 200, 27, 0.2)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#F5C81B';
          e.target.style.backgroundColor = '#000000';
          e.target.style.boxShadow = 'none';
        }}
      />
      
      <button
        onClick={handleSearchClick}
        style={{
          position: 'absolute', 
          left: '12px',
          top: '50%', 
          transform: 'translateY(-50%)', 
          color: '#F5C81B',
          background: 'none',
          border: 'none',
          padding: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '3px',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#fff';
          e.currentTarget.style.backgroundColor = '#F5C81B';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#F5C81B';
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        type="button"
        aria-label="Buscar"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
        </svg>
      </button>
      
      {value && (
        <button
          onClick={onClear}
          style={{
            position: 'absolute', 
            right: '6px',
            top: '50%', 
            transform: 'translateY(-50%)',
            background: 'none', 
            border: 'none', 
            color: '#F5C81B', 
            cursor: 'pointer', 
            padding: '3px',
            borderRadius: '3px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            transition: 'all 0.2s ease', 
            width: '18px',
            height: '18px'
          }}
          onMouseEnter={(e) => { 
            e.currentTarget.style.color = '#fff'; 
            e.currentTarget.style.backgroundColor = '#F5C81B'; 
          }}
          onMouseLeave={(e) => { 
            e.currentTarget.style.color = '#F5C81B'; 
            e.currentTarget.style.backgroundColor = 'transparent'; 
          }}
          type="button"
          aria-label="Limpiar búsqueda"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}
    </div>
  );
};

export default SearchInput;