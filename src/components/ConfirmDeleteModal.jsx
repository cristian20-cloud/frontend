// src/components/ConfirmDeleteModal.jsx
import React from 'react';

// Función auxiliar para obtener el mejor nombre a mostrar (SIN CAMBIOS)
const getDisplayName = (data, nameType) => {
  if (!data) return `este ${nameType}`;
  
  // Prioridad 1: Nombres específicos
  if (data.nombreCompleto) return data.nombreCompleto; // Clientes, Usuarios, Proveedores
  if (data.nombreProducto) return data.nombreProducto; // Productos, Devoluciones
  if (data.numeroDocumento) return data.numeroDocumento; // Devoluciones (CC)
  
  // Prioridad 2: Nombres genéricos
  if (data.name) return data.name; // ✅ AGREGADO: Para roles (tiene propiedad 'name')
  if (data.nombre) return data.nombre; // Producto
  if (data.Nombre) return data.Nombre; // Categorías, Roles, Productos (si se usa 'Nombre' mayúscula)
  
  // Prioridad 3: ID de respaldo
  if (data.id && typeof data.id === 'string' && data.id.startsWith('dev-')) {
    // Si es un ID interno de devolución (dev-...), no lo mostramos.
  } else if (data.id) {
    return `#${data.id}`;
  }

  // Fallback
  return `el ${nameType}`;
};

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, entityName = "elemento", entityData, customMessage }) => {
  if (!isOpen) return null;

  const nameToDisplay = getDisplayName(entityData, entityName);
  const isGenericFallback = nameToDisplay === `el ${entityName}`;
  
  // Si hay un mensaje personalizado, usarlo
  const displayMessage = customMessage || `Estás a punto de eliminar ${isGenericFallback ? `el ${entityName}` : `el/la ${entityName}`}:`;

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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        cursor: 'pointer',
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: '#000000',
          borderRadius: '8px',
          padding: '24px 32px', // 👈 MODIFICADO: Aumentado el padding horizontal de 28px a 32px
          width: '500px',
          maxWidth: '90%',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
          textAlign: 'center',
          border: '1px solid #F5C81B',
          cursor: 'default',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Título similar al de anulación - EN MAYÚSCULAS */}
        <h2 style={{ 
          color: '#F5C81B', 
          fontSize: '16px',
          fontWeight: '700', 
          margin: '0 0 12px 0',
          textAlign: 'center',
          width: '100%',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Confirmar Eliminación
        </h2>

        {/* MENSAJE EN UN SOLO RENGLÓN */}
        <div style={{ 
          margin: '0 0 20px 0',
          textAlign: 'center',
          width: '100%'
        }}>
          <p style={{ 
            color: '#FFFFFF', 
            fontSize: '13px',
            margin: '0',
            lineHeight: '1.4',
            textAlign: 'center',
            whiteSpace: 'normal'
          }}>
            {displayMessage}
            {!customMessage && (
              <>
                {' '}
                <span style={{ 
                  color: '#F5C81B', 
                  fontWeight: '700', 
                  fontSize: '14px',
                  textTransform: 'capitalize',
                }}>
                  {isGenericFallback ? `"${entityName}"` : `"${nameToDisplay}"`}
                </span>
              </>
            )}
          </p>
        </div>
        
        {/* BOTONES: ALINEADOS A LA DERECHA */}
        <div style={{ 
          display: 'flex', 
          gap: '10px',
          justifyContent: 'flex-end', // Alineado a la derecha
          width: '100%',
        }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #F5C81B',
              color: '#F5C81B',
              padding: '5px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '80px',
              height: '32px',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#292100';
              e.target.style.color = '#FFFFFF';
              e.target.style.borderColor = '#EAB308';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#F5C81B';
              e.target.style.borderColor = '#F5C81B';
            }}
          >
            Cancelar
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onConfirm();
            }}
            style={{
              backgroundColor: '#F5C81B',
              border: 'none',
              color: '#0f172a',
              padding: '5px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              minWidth: '80px',
              height: '32px',
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#EAB308')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#F5C81B')}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;