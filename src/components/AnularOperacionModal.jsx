// src/components/AnularOperacionModal.jsx
import React from 'react';

// Función para extraer el nombre más relevante a anular (Cliente, Proveedor, Producto, etc.)
const getDisplayNameToAnular = (operationData, operationType) => {
    if (!operationData) return `el/la ${operationType}`;
    
    // 1. Prioridad: Venta (Cliente)
    if (operationData.cliente) {
        let clienteNombre = '';
        if (typeof operationData.cliente === 'object' && operationData.cliente !== null) {
            clienteNombre = operationData.cliente.nombre || operationData.cliente.id;
        } else {
            clienteNombre = operationData.cliente;
        }
        return `el/la cliente: ${clienteNombre || 'N/A'}`;
    }
    
    // 2. Prioridad: Compra (Proveedor)
    if (operationData.proveedor) {
        return `el/la proveedor: ${operationData.proveedor || 'N/A'}`;
    }
    
    // 3. Prioridad: Elementos genéricos (Producto, Usuario, etc.)
    if (operationData.nombre) {
        return `el/la ${operationType}: ${operationData.nombre}`;
    }
    if (operationData.email) {
        return `el/la usuario: ${operationData.email}`;
    }

    // 4. Fallback: Usar código o ID si no hay nombre claro
    if (operationData.codigo || operationData.id) {
        return `la ${operationType} (Cód: ${operationData.codigo || operationData.id})`;
    }

    // Fallback Final
    return `el/la ${operationType}`;
};

const AnularOperacionModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  operationType = "operación",
  operationData,
  confirmButtonText = "Anular",
  cancelButtonText = "Conservar"
}) => {
  if (!isOpen) return null;

  const itemToAnular = getDisplayNameToAnular(operationData, operationType);

  // Estilos de botón más pequeños (como solicitaste)
  const smallButtonStyle = {
      padding: '6px 14px',
      borderRadius: '6px',
      fontSize: '13px', 
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      minWidth: '90px', 
      height: '36px', 
      whiteSpace: 'nowrap',
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)', 
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        cursor: 'pointer'
      }} 
      onClick={onClose}
    >
      
      <div
        style={{
          backgroundColor: '#000000', 
          borderRadius: '8px',
          padding: '20px 24px', 
          maxWidth: '500px',
          width: '90vw',
          textAlign: 'left',
          cursor: 'default',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
          border: '1px solid #F5C81B' 
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* NUEVO TÍTULO: Confirmas Anulación */}
        <h3 style={{
          color: '#F5C81B', 
          fontSize: '20px', 
          fontWeight: '700',
          marginBottom: '10px',
          lineHeight: '1.2',
          textAlign: 'center',
          textTransform: 'uppercase'
        }}>
          Confirmas Anulación
        </h3>

        {/* Contenedor principal del mensaje (Pregunta y nombre del elemento) */}
        <div style={{
          marginBottom: '30px', 
          lineHeight: '1.6',
          textAlign: 'left', 
        }}>
          <p style={{
            color: '#FFFFFF', 
            fontSize: '16px',
            fontWeight: '500',
            margin: 0,
            wordBreak: 'break-word',
          }}>
            Estás a punto de anular {itemToAnular}
            <span style={{
              color: '#F5C81B', 
              fontWeight: '700',
            }}>
                . ¿Deseas continuar?
            </span>
          </p>
        </div>

        {/* Botones de acción (Más pequeños) */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end', 
          width: '100%',
        }}>
          {/* Botón de Cancelar/Conservar */}
          <button
            onClick={onClose}
            style={{
              ...smallButtonStyle,
              backgroundColor: 'transparent',
              border: '1px solid #F5C81B', 
              color: '#F5C81B', 
              fontWeight: '500',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#292100'; 
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.borderColor = '#EAB308';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#F5C81B';
              e.currentTarget.style.borderColor = '#F5C81B';
            }}
          >
            {cancelButtonText}
          </button>
          
          {/* Botón de Confirmar/Anular */}
          <button
            onClick={onConfirm}
            style={{
              ...smallButtonStyle,
              backgroundColor: '#F5C81B', 
              border: 'none',
              color: '#0f172a', 
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#EAB308')} 
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F5C81B')}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnularOperacionModal;