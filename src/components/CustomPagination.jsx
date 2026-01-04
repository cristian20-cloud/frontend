// src/components/CustomPagination.jsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CustomPagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems, 
  showingStart,
  endIndex,
}) => {
  if (totalPages <= 1 && totalItems === 0) return null;

  // Estilos comunes
  const buttonBaseStyle = {
    padding: '10px 20px', // 👈 Aumentado para más volumen
    borderRadius: '6px',
    fontSize: '14px', // 👈 Aumentado
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
    fontWeight: '600',
    height: '40px',
    border: '1px solid #F5C81B',
    backgroundColor: 'transparent', // 👈 Fondo transparente por defecto
    color: '#F5C81B', // 👈 Texto amarillo
    boxShadow: 'none', // 👈 Sin sombra por defecto
  };

  const activeButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: 'transparent', // 👈 Fondo transparente
    color: '#F5C81B',
    border: '1px solid #F5C81B',
  };

  const disabledButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: 'transparent',
    color: '#9CA3AF', // 👈 Gris cuando deshabilitado
    border: '1px solid #9CA3AF',
    cursor: 'not-allowed',
    opacity: 0.7,
  };

  const getHoverHandlers = (isEnabled) => {
    if (!isEnabled) return {};
    return {
      onMouseEnter: (e) => {
        e.target.style.backgroundColor = '#F5C81B'; // 👈 Fondo amarillo al hover
        e.target.style.color = '#000'; // 👈 Texto negro
        e.target.style.borderColor = '#F5C81B'; // 👈 Borde amarillo
        e.target.style.boxShadow = '0 2px 4px rgba(245, 200, 27, 0.3)'; // 👈 Sombra suave
      },
      onMouseLeave: (e) => {
        e.target.style.backgroundColor = 'transparent'; // 👈 Vuelve a transparente
        e.target.style.color = '#F5C81B'; // 👈 Texto amarillo
        e.target.style.borderColor = '#F5C81B'; // 👈 Borde amarillo
        e.target.style.boxShadow = 'none'; // 👈 Quita sombra
      },
      onClick: (e) => {
        // 👇 Opcional: si quieres que al hacer clic se mantenga el estado activo por un momento
        e.target.style.backgroundColor = '#F5C81B';
        e.target.style.color = '#000';
        e.target.style.borderColor = '#F5C81B';
        e.target.style.boxShadow = '0 2px 4px rgba(245, 200, 27, 0.3)';
        setTimeout(() => {
          e.target.style.backgroundColor = 'transparent';
          e.target.style.color = '#F5C81B';
          e.target.style.borderColor = '#F5C81B';
          e.target.style.boxShadow = 'none';
        }, 300);
      },
    };
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 16px',
      borderTop: '1px solid #374151',
      fontSize: '13px',
      color: '#9CA3AF',
      backgroundColor: '#151822', // 👈 Fondo oscuro para coherencia con la tabla
    }}>
      <div>
        Mostrando {showingStart} a {endIndex} de {totalItems} cliente{totalItems !== 1 ? 's' : ''}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={currentPage === 1 ? disabledButtonStyle : activeButtonStyle}
          {...getHoverHandlers(currentPage !== 1)}
        >
          <ChevronLeft size={16} />
          Anterior
        </button>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          style={
            currentPage === totalPages || totalPages === 0 
              ? disabledButtonStyle 
              : activeButtonStyle
          }
          {...getHoverHandlers(currentPage !== totalPages && totalPages > 0)}
        >
          Siguiente
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default CustomPagination;