// src/components/Alert.jsx
import React, { useEffect } from 'react';

const Alert = ({ message, type = 'success', onClose, margin = '20px', centered = false }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  // Fondo gris oscuro con acentos de color (estilo DarkAlert)
  const getStyles = () => {
    const baseStyles = {
      backgroundColor: 'rgba(30, 30, 30, 0.95)', // Gris oscuro
      borderColor: '',
      textColor: '#ffffff',
      iconColor: '#ffffff'
    };

    switch (type) {
      case 'add':
        return {
          ...baseStyles,
          borderColor: '#10b981',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          )
        };
      case 'edit':
        return {
          ...baseStyles,
          borderColor: '#f59e0b',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          )
        };
      case 'delete':
        return {
          ...baseStyles,
          borderColor: '#ef4444',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          )
        };
      case 'anular':
        return {
          ...baseStyles,
          borderColor: '#f97316',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          )
        };
      case 'validation':
        return {
          ...baseStyles,
          borderColor: '#f59e0b',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          )
        };
      case 'add-record':
        return {
          ...baseStyles,
          borderColor: '#3b82f6',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          )
        };
      case 'success-center':
        return {
          ...baseStyles,
          backgroundColor: 'rgba(16, 185, 129, 0.95)', // Verde más sólido
          borderColor: '#10b981',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          )
        };
      case 'register-success':
        return {
          // CAMBIADO: FONDO AZUL OSCURO COMO LA INTERFAZ, BORDE AMARILLO, TEXTO Y ICONO BLANCOS
          ...baseStyles,
          backgroundColor: 'rgba(15, 23, 42, 0.95)', // Azul oscuro (#0F172A)
          borderColor: '#F5C81B', // Borde amarillo como el botón "Registrar Categoría"
          textColor: '#ffffff', // Texto blanco (cambio solicitado)
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"> {/* Icono también blanco */}
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          )
        };
      default:
        return {
          ...baseStyles,
          borderColor: '#10b981',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          )
        };
    }
  };

  const { backgroundColor, borderColor, textColor, icon } = getStyles();

  // Texto según el tipo
  const getMessageText = () => {
    switch (type) {
      case 'add':
        return `Cliente "${message}" creado correctamente`;
      case 'edit':
        return `Cliente "${message}" actualizado correctamente`;
      case 'delete':
        return `Cliente "${message}" eliminado correctamente`;
      case 'anular':
        return message || 'Venta anulada exitosamente';
      case 'validation':
        return message || 'Faltan campos por completar';
      case 'add-record':
        return message || 'Registro agregado exitosamente';
      case 'success-center':
        return message || '¡Operación exitosa!';
      case 'register-success':
        return message || '¡Registro completado exitosamente!';
      default:
        return message;
    }
  };

  // Determinar posición según tipo
  const getPositionStyles = () => {
    // Tipos que aparecen en el centro
    const centeredTypes = ['success-center', 'register-success'];
    
    if (centeredTypes.includes(type) || centered) {
      return {
        position: 'fixed',
        top: '50%', // CENTRADO VERTICALMENTE
        left: '50%',
        transform: 'translate(-50%, -50%)', // ALINEA EL CENTRO DEL ALERT CON EL CENTRO DE LA PANTALLA
        textAlign: 'center',
        zIndex: 10000, // Mayor z-index para estar sobre todo
      };
    }
    
    return {
      position: 'fixed',
      top: margin,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
    };
  };

  const isCenteredAlert = ['success-center', 'register-success'].includes(type) || centered;

  return (
    <div
      style={{
        ...getPositionStyles(),
        backgroundColor: backgroundColor,
        color: textColor,
        padding: isCenteredAlert ? '24px 32px' : '12px 16px',
        borderRadius: '12px',
        fontSize: isCenteredAlert ? '16px' : '14px',
        fontWeight: isCenteredAlert ? '600' : '500',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        boxShadow: isCenteredAlert 
          ? '0 15px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(245, 200, 27, 0.3)' 
          : '0 10px 30px rgba(0, 0, 0, 0.5)',
        animation: isCenteredAlert ? 'fadeInScaleBounce 0.5s ease-out forwards' : 'slideInDown 0.3s ease-out forwards',
        minWidth: isCenteredAlert ? '380px' : '300px',
        maxWidth: isCenteredAlert ? '450px' : '400px',
        border: `2px solid ${borderColor}`,
        fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        letterSpacing: '0.2px',
        flexDirection: isCenteredAlert ? 'column' : 'row'
      }}
    >
      {/* Icono */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexShrink: 0,
        ...(isCenteredAlert && {
          marginBottom: '12px'
        })
      }}>
        {icon}
      </div>
      
      {/* Mensaje */}
      <span style={{ 
        flex: 1,
        fontWeight: isCenteredAlert ? '700' : '500',
        lineHeight: '1.5',
        ...(isCenteredAlert && {
          fontSize: '18px',
          textAlign: 'center'
        })
      }}>
        {getMessageText()}
      </span>
      
      {/* Botón de cerrar (solo si no es centered) */}
      {!isCenteredAlert && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: textColor,
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: '0.7',
            transition: 'all 0.2s ease',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.7';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}

      <style>
        {`
          @keyframes slideInDown {
            0% { 
              opacity: 0; 
              transform: translate(-50%, -20px); 
            }
            100% { 
              opacity: 1; 
              transform: translate(-50%, 0); 
            }
          }
          
          @keyframes fadeInScaleBounce {
            0% { 
              opacity: 0; 
              transform: translate(-50%, -50%) scale(0.7); 
            }
            70% { 
              opacity: 1; 
              transform: translate(-50%, -50%) scale(1.05); 
            }
            100% { 
              opacity: 1; 
              transform: translate(-50%, -50%) scale(1); 
            }
          }
        `}
      </style>
    </div>
  );
};

export default Alert;