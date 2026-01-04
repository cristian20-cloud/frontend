// src/components/EntityDetailsModal.jsx
import React from 'react';

const EntityDetailsModal = ({ isOpen, onClose, entity, title = "Detalles del cliente" }) => {
  if (!isOpen || !entity) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        boxSizing: 'border-box',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: '#0f172a',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
          width: 'min(95%, 550px)', // ✅ Más ancho
          maxHeight: '90vh',
          overflow: 'hidden',
          padding: '25px', // ✅ Más padding interno
          position: 'relative',
          border: '1px solid rgba(255, 215, 0, 0.1)',
        }}
      >
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            fontSize: '1.4rem',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.backgroundColor = 'rgba(255, 215, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#94a3b8';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          ×
        </button>

        {/* Título */}
        <h2
          style={{
            color: '#F5C81B',
            fontSize: '1.4rem', // ✅ Título más grande
            fontWeight: '700',
            marginBottom: '5px',
            textAlign: 'left',
            textTransform: 'none',
            paddingRight: '40px',
          }}
        >
          {title}
        </h2>

        {/* Subtítulo */}
        <p style={{ 
          color: '#aaa', 
          fontSize: '0.9rem', // ✅ Subtítulo más grande
          marginBottom: '20px',
          textAlign: 'left',
          textTransform: 'none',
        }}>
          Información detallada del cliente
        </p>

        {/* Contenido - Más espacioso */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px', // ✅ Más espacio entre campos
          }}
        >
          {/* Fila: Tipo de documento + Número de documento */}
          <div style={{ display: 'flex', gap: '15px' }}> {/* ✅ Más espacio entre columnas */}
            <div style={{ flex: 1 }}>
              <label style={{ 
                fontSize: '12px', // ✅ Labels más grandes
                color: '#e2e8f0', 
                fontWeight: '500', 
                marginBottom: '5px',
                display: 'block',
                textTransform: 'none',
              }}>
                Tipo de documento
              </label>
              <div
                style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  padding: '10px 12px', // ✅ Más padding interno
                  color: '#f1f5f9',
                  fontSize: '13px', // ✅ Texto más grande
                  height: '38px', // ✅ Campos más altos
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {entity.tipoDocumento || 'N/A'}
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ 
                fontSize: '12px', // ✅ Labels más grandes
                color: '#e2e8f0', 
                fontWeight: '500', 
                marginBottom: '5px',
                display: 'block',
                textTransform: 'none',
              }}>
                Número de documento
              </label>
              <div
                style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  padding: '10px 12px', // ✅ Más padding interno
                  color: '#f1f5f9',
                  fontSize: '13px', // ✅ Texto más grande
                  height: '38px', // ✅ Campos más altos
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {entity.numeroDocumento || 'N/A'}
              </div>
            </div>
          </div>

          {/* Nombre completo */}
          <div>
            <label style={{ 
              fontSize: '12px', // ✅ Labels más grandes
              color: '#e2e8f0', 
              fontWeight: '500', 
              marginBottom: '5px',
              display: 'block',
              textTransform: 'none',
            }}>
              Nombre completo
            </label>
            <div
              style={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '10px 12px', // ✅ Más padding interno
                color: '#F5C81B',
                fontSize: '13px', // ✅ Texto más grande
                fontWeight: '600',
                height: '38px', // ✅ Campo más alto
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {entity.nombreCompleto || 'N/A'}
            </div>
          </div>

          {/* Fila: Email + Teléfono */}
          <div style={{ display: 'flex', gap: '15px' }}> {/* ✅ Más espacio entre columnas */}
            <div style={{ flex: 1 }}>
              <label style={{ 
                fontSize: '12px', // ✅ Labels más grandes
                color: '#e2e8f0', 
                fontWeight: '500', 
                marginBottom: '5px',
                display: 'block',
                textTransform: 'none',
              }}>
                Email
              </label>
              <div
                style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  padding: '10px 12px', // ✅ Más padding interno
                  color: '#f1f5f9',
                  fontSize: '13px', // ✅ Texto más grande
                  height: '38px', // ✅ Campos más altos
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {entity.email || 'N/A'}
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ 
                fontSize: '12px', // ✅ Labels más grandes
                color: '#e2e8f0', 
                fontWeight: '500', 
                marginBottom: '5px',
                display: 'block',
                textTransform: 'none',
              }}>
                Teléfono
              </label>
              <div
                style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  padding: '10px 12px', // ✅ Más padding interno
                  color: '#f1f5f9',
                  fontSize: '13px', // ✅ Texto más grande
                  height: '38px', // ✅ Campos más altos
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {entity.telefono || 'N/A'}
              </div>
            </div>
          </div>

          {/* Dirección */}
          <div>
            <label style={{ 
              fontSize: '12px', // ✅ Labels más grandes
              color: '#e2e8f0', 
              fontWeight: '500', 
              marginBottom: '5px',
              display: 'block',
              textTransform: 'none',
            }}>
              Dirección
            </label>
            <div
              style={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '10px 12px', // ✅ Más padding interno
                color: '#f1f5f9',
                fontSize: '13px', // ✅ Texto más grande
                minHeight: '38px', // ✅ Campo más alto
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {entity.direccion || 'N/A'}
            </div>
          </div>

          {/* Fila: Departamento + Ciudad */}
          <div style={{ display: 'flex', gap: '15px' }}> {/* ✅ Más espacio entre columnas */}
            <div style={{ flex: 1 }}>
              <label style={{ 
                fontSize: '12px', // ✅ Labels más grandes
                color: '#e2e8f0', 
                fontWeight: '500', 
                marginBottom: '5px',
                display: 'block',
                textTransform: 'none',
              }}>
                Departamento
              </label>
              <div
                style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  padding: '10px 12px', // ✅ Más padding interno
                  color: '#f1f5f9',
                  fontSize: '13px', // ✅ Texto más grande
                  height: '38px', // ✅ Campos más altos
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {entity.departamento || 'N/A'}
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ 
                fontSize: '12px', // ✅ Labels más grandes
                color: '#e2e8f0', 
                fontWeight: '500', 
                marginBottom: '5px',
                display: 'block',
                textTransform: 'none',
              }}>
                Ciudad
              </label>
              <div
                style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  padding: '10px 12px', // ✅ Más padding interno
                  color: '#f1f5f9',
                  fontSize: '13px', // ✅ Texto más grande
                  height: '38px', // ✅ Campos más altos
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {entity.ciudad || 'N/A'}
              </div>
            </div>
          </div>

          {/* Saldo a favor */}
          <div>
            <label style={{ 
              fontSize: '12px', // ✅ Labels más grandes
              color: '#e2e8f0', 
              fontWeight: '500', 
              marginBottom: '5px',
              display: 'block',
              textTransform: 'none',
            }}>
              Saldo a favor
            </label>
            <div
              style={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '10px 12px', // ✅ Más padding interno
                color: entity.saldoFavor !== '0' ? '#10b981' : '#9ca3af',
                fontSize: '13px', // ✅ Texto más grande
                fontWeight: '600',
                height: '38px', // ✅ Campo más alto
                display: 'flex',
                alignItems: 'center',
              }}
            >
              ${parseInt(entity.saldoFavor || '0').toLocaleString()}
            </div>
          </div>

          {/* Estado */}
          <div>
            <label style={{ 
              fontSize: '12px', // ✅ Labels más grandes
              color: '#e2e8f0', 
              fontWeight: '500', 
              marginBottom: '5px',
              display: 'block',
              textTransform: 'none',
            }}>
              Estado
            </label>
            <div
              style={{
                display: 'inline-block',
                backgroundColor: entity.isActive ? '#10b981' : '#ef4444',
                color: '#fff',
                padding: '6px 12px', // ✅ Más padding
                borderRadius: '6px',
                fontSize: '12px', // ✅ Texto más grande
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {entity.isActive ? 'Activo' : 'Inactivo'}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EntityDetailsModal;