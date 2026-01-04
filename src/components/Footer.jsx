// src/components/Footer.jsx
import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaWhatsapp } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#000000',
      color: '#fff',
      padding: '15px 20px 10px 20px',
      marginTop: '0',
      width: '100%',
      borderTop: '2px solid #FFC107',
      boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.3)'
    }}>
      
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }}>
        
        {/* Sección principal con 3 columnas */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          
          {/* Columna 1: Quiénes Somos */}
          <div style={{ 
            flex: 1, 
            minWidth: '250px'
          }}>
            <h3 style={{
              color: '#FFC107',
              fontSize: '0.95rem',
              margin: '0 0 8px 0',
              fontWeight: 'bold'
            }}>
              Quiénes Somos
            </h3>
            <p style={{
              color: '#CCCCCC',
              lineHeight: '1.4',
              fontSize: '0.8rem',
              margin: 0
            }}>
              GM CAPS es una tienda especializada en gorras de alta calidad. 
              Ofrecemos las mejores marcas y diseños exclusivos para que encuentres tu estilo perfecto.
            </p>
          </div>

          {/* Columna 2: Síguenos */}
          <div style={{ 
            flex: 1, 
            minWidth: '150px',
            textAlign: 'center'
          }}>
            <h4 style={{
              color: '#FFFFFF',
              fontSize: '0.9rem',
              margin: '0 0 8px 0',
              fontWeight: '600'
            }}>
              Síguenos
            </h4>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <a href="#" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#1a1a1a',
                color: '#fff',
                fontSize: '0.7rem',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                border: '1px solid #333',
                textDecoration: 'none'
              }}>
                <FaFacebookF size={10} color="#4267B2" />
              </a>
              
              <a href="#" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#1a1a1a',
                color: '#fff',
                fontSize: '0.7rem',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                border: '1px solid #333',
                textDecoration: 'none'
              }}>
                <FaTwitter size={10} color="#1DA1F2" />
              </a>
              
              <a href="#" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#1a1a1a',
                color: '#fff',
                fontSize: '0.7rem',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                border: '1px solid #333',
                textDecoration: 'none'
              }}>
                <FaInstagram size={10} color="#E1306C" />
              </a>
              
              <a href="#" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#1a1a1a',
                color: '#fff',
                fontSize: '0.7rem',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                border: '1px solid #333',
                textDecoration: 'none'
              }}>
                <FaWhatsapp size={10} color="#25D366" />
              </a>
            </div>
            
            <p style={{
              color: '#FFC107',
              fontSize: '0.75rem',
              fontWeight: '500',
              margin: 0
            }}>
              Tu tienda de confianza para las mejores gorras
            </p>
          </div>

          {/* Columna 3: Contacto */}
          <div style={{ 
            flex: 1, 
            minWidth: '250px',
            textAlign: 'right'
          }}>
            <p style={{
              color: '#FFC107',
              fontSize: '0.85rem',
              fontWeight: '600',
              margin: '0 0 5px 0'
            }}>
              Contáctanos para consultas y pedidos especiales
            </p>
            <p style={{
              color: '#CCCCCC',
              fontSize: '0.75rem',
              margin: 0,
              lineHeight: '1.3'
            }}>
              Estamos disponibles para resolver tus dudas y ayudarte a encontrar la gorra perfecta.
            </p>
          </div>

        </div>

        {/* Línea divisoria */}
        <hr style={{
          width: '100%',
          height: '1px',
          border: 'none',
          backgroundColor: '#FFC107',
          opacity: 0.3,
          margin: '5px 0'
        }} />

        {/* Sección inferior con 3 elementos EN UNA SOLA LÍNEA */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{
            flex: 1,
            minWidth: '150px'
          }}>
            <p style={{
              color: '#888',
              fontSize: '0.7rem',
              margin: 0
            }}>
              Tu tienda de confianza para las mejores gorras
            </p>
          </div>
          
          <div style={{
            flex: 1,
            minWidth: '150px',
            textAlign: 'center'
          }}>
            <span style={{
              color: '#FFC107',
              fontSize: '0.75rem',
              fontWeight: '500'
            }}>
              © 2025 GM CAPS. Todos los derechos reservados.
            </span>
          </div>
          
          <div style={{
            flex: 1,
            minWidth: '150px',
            textAlign: 'right'
          }}>
            <p style={{
              color: '#888',
              fontSize: '0.7rem',
              margin: 0
            }}>
              Calidad y estilo en cada producto
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;