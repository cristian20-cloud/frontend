import React from 'react';
import { FaInstagram, FaWhatsapp, FaFacebookF, FaTiktok, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaChevronRight } from 'react-icons/fa';

const Footer = () => {
  const iconStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '35px',
    height: '35px',
    borderRadius: '50%',
    backgroundColor: '#1a1d23',
    color: '#fff',
    fontSize: '1.1rem',
    textDecoration: 'none',
    transition: 'all 0.3s ease'
  };

  const listLinkStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#CCCCCC',
    textDecoration: 'none',
    fontSize: '0.85rem',
    marginBottom: '10px',
    transition: 'color 0.3s ease'
  };

  const contactItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#CCCCCC',
    fontSize: '0.85rem',
    marginBottom: '10px'
  };

  // Función para obtener el color de cada red social
  const getSocialIconColor = (icon) => {
    switch(icon) {
      case 'facebook':
        return '#1877F2';
      case 'instagram':
        return '#E4405F';
      case 'whatsapp':
        return '#25D366';
      case 'tiktok':
        return '#000000';
      default:
        return '#fff';
    }
  };

  return (
    <footer style={{
      backgroundColor: '#000000',
      color: '#fff',
      padding: '40px 20px 30px 20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '30px',
        marginBottom: '0'
      }}>
        
        {/* Columna 1: Logo y Eslogan */}
        <div>
          <div style={{ marginBottom: '15px' }}>
            <h2 style={{ 
              color: '#d4af37',
              fontSize: '2rem', 
              margin: 0, 
              fontWeight: 'bold',
              letterSpacing: '1px' 
            }}>GM</h2>
          </div>
          <p style={{ 
            color: '#888', 
            fontSize: '0.85rem', 
            lineHeight: '1.5',
            maxWidth: '220px' 
          }}>
            Tu tienda de confianza para las mejores gorras. Calidad y estilo en cada producto.
          </p>
        </div>

        {/* Columna 2: Enlaces Rápidos */}
        <div>
          <h4 style={{ fontSize: '1rem', marginBottom: '20px', fontWeight: '600' }}>Enlaces Rápidos</h4>
          <nav>
            <a 
              href="#quienes-somos" 
              style={listLinkStyle}
              onMouseEnter={(e) => e.currentTarget.style.color = '#FFC107'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#CCCCCC'}
            >
              <FaChevronRight size={10} color="#888"/> Quiénes Somos
            </a>
            <a 
              href="#politica-devoluciones" 
              style={listLinkStyle}
              onMouseEnter={(e) => e.currentTarget.style.color = '#FFC107'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#CCCCCC'}
            >
              <FaChevronRight size={10} color="#888"/> Política de Devoluciones
            </a>
            <a 
              href="#terminos-condiciones" 
              style={listLinkStyle}
              onMouseEnter={(e) => e.currentTarget.style.color = '#FFC107'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#CCCCCC'}
            >
              <FaChevronRight size={10} color="#888"/> Términos y Condiciones
            </a>
            <a 
              href="#politica-privacidad" 
              style={listLinkStyle}
              onMouseEnter={(e) => e.currentTarget.style.color = '#FFC107'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#CCCCCC'}
            >
              <FaChevronRight size={10} color="#888"/> Política de Privacidad
            </a>
          </nav>
        </div>

        {/* Columna 3: Contacto */}
        <div>
          <h4 style={{ fontSize: '1rem', marginBottom: '20px', fontWeight: '600' }}>Contacto</h4>
          <div style={contactItemStyle}>
            <FaMapMarkerAlt color="#FFC107"/> <span>Medellín, Antioquia</span>
          </div>
          <div style={contactItemStyle}>
            <FaPhoneAlt color="#FFC107"/> <span>+57 300 123 4567</span>
          </div>
          <div style={contactItemStyle}>
            <FaEnvelope color="#FFC107"/> <span>info@gmcaps.com</span>
          </div>
        </div>

        {/* Columna 4: Síguenos */}
        <div>
          <h4 style={{ fontSize: '1rem', marginBottom: '20px', fontWeight: '600' }}>Síguenos</h4>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <a href="#" style={{...iconStyle, color: getSocialIconColor('facebook')}}><FaFacebookF /></a>
            <a href="#" style={{...iconStyle, color: getSocialIconColor('instagram')}}><FaInstagram /></a>
            <a href="#" style={{...iconStyle, color: getSocialIconColor('whatsapp')}}><FaWhatsapp /></a>
            <a href="#" style={{...iconStyle, color: getSocialIconColor('tiktok')}}><FaTiktok /></a>
          </div>
          <p style={{ color: '#888', fontSize: '0.8rem', lineHeight: '1.4' }}>
            Contáctanos para consultas y pedidos especiales
          </p>
        </div>
      </div>

      {/* Copyright */}
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <p style={{ color: '#555', fontSize: '0.75rem', margin: 0 }}>
          © 2026 GM CAPS. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;