// src/pages/Profile.jsx
import React, { useEffect, useState } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCheckCircle, FaEdit, FaSave, FaShieldAlt } from 'react-icons/fa';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      
      // Usar datos reales del usuario o valores por defecto
      setFormData({
        name: parsedUser.Nombre || parsedUser.name || 'Juan Carlos Rodríguez',
        email: parsedUser.Correo || parsedUser.email || parsedUser.Correo || '',
        phone: parsedUser.Telefono || '+57 300 123 4567',
        address: parsedUser.Direccion || 'Medellín, Antioquia'
      });
    }
  }, []);

  const handleEditClick = () => setIsEditing(true);

  const handleSaveClick = () => {
    const updatedUser = { 
      ...user, 
      Nombre: formData.name, 
      name: formData.name, 
      Telefono: formData.phone,
      phone: formData.phone,
      Direccion: formData.address,
      address: formData.address
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsEditing(false);
    
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#030712', color: '#fff', fontFamily: 'Segoe UI, sans-serif',
        padding: '1rem'
      }}>
        <div style={{
          backgroundColor: '#111827', padding: '2rem', borderRadius: '12px',
          textAlign: 'center', width: '300px'
        }}>
          <h2>Acceso Denegado</h2>
          <p>Debes iniciar sesión para ver tu perfil.</p>
          <button onClick={() => window.location.href = '/login'} style={{
            marginTop: '10px', display: 'inline-block',
            backgroundColor: '#FFC107', color: '#000',
            padding: '8px 16px', borderRadius: '6px', fontWeight: '600', border: 'none', cursor: 'pointer'
          }}>Iniciar Sesión</button>
        </div>
      </div>
    );
  }

  // Obtener la inicial para el avatar de manera segura
  const getAvatarInitial = () => {
    const name = formData.name || user.Nombre || user.name || '';
    const email = formData.email || user.Correo || user.email || '';
    
    if (name && name.length > 0) {
      return name.charAt(0).toUpperCase();
    }
    if (email && email.length > 0) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <div style={{
      minHeight: '100vh', 
      backgroundColor: '#030712', 
      fontFamily: 'Segoe UI, sans-serif',
      display: 'flex',
      justifyContent: 'center',
      paddingTop: '80px',
      paddingBottom: '40px'
    }}>
      <div style={{
        display: 'flex',
        gap: '1rem',
        maxWidth: '620px',
        width: '100%',
        padding: '0 0.5rem'
      }}>
        {/* Columna Izquierda: Avatar y Acciones */}
        <div style={{
          flex: '0 0 180px',
          backgroundColor: '#111827',
          borderRadius: '12px',
          padding: '1.2rem 0.8rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: '#FFC107',
            color: '#000',
            fontWeight: 'bold',
            fontSize: '1.4rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.8rem'
          }}>
            {getAvatarInitial()}
          </div>

          <h3 style={{ color: '#FFFFFF', margin: '0 0 0.3rem 0', fontSize: '0.95rem' }}>
            {formData.name}
          </h3>

          <p style={{ color: '#CBD5E1', fontSize: '0.75rem', margin: '0 0 0.6rem 0', textAlign: 'center' }}>
            {formData.email}
          </p>

          {isEditing ? (
            <button
              onClick={handleSaveClick}
              style={{
                backgroundColor: '#4CAF50',
                color: '#FFF',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                width: '100%',
                fontSize: '0.75rem'
              }}
            >
              <FaSave size={10} /> Guardar
            </button>
          ) : (
            <button
              onClick={handleEditClick}
              style={{
                backgroundColor: '#334155',
                color: '#FFF',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                width: '100%',
                fontSize: '0.75rem'
              }}
            >
              <FaEdit size={10} /> Editar
            </button>
          )}
        </div>

        {/* Resto del código sigue igual... */}
        {/* Columna Derecha: Información y Detalles */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.8rem',
          minWidth: '0'
        }}>
          {/* Sección 1: Información Personal */}
          <div style={{
            backgroundColor: '#111827',
            borderRadius: '8px',
            padding: '0.8rem 1rem',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem'
          }}>
            <h3 style={{
              color: '#FFC107',
              fontSize: '0.95rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              margin: '0 0 0.5rem 0'
            }}>
              <FaUser size={12} /> Información Personal
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <label style={{ color: '#94A3B8', fontSize: '0.75rem', minWidth: '60px' }}>Nombre</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  style={{
                    flex: 1,
                    padding: '3px 6px',
                    borderRadius: '3px',
                    border: isEditing ? '1px solid #475569' : 'none',
                    backgroundColor: 'transparent',
                    color: '#FFFFFF',
                    fontSize: '0.75rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <label style={{ color: '#94A3B8', fontSize: '0.75rem', minWidth: '60px' }}>Email</label>
                <div style={{
                  flex: 1,
                  padding: '3px 6px',
                  borderRadius: '3px',
                  backgroundColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: '#FFFFFF',
                  fontSize: '0.75rem'
                }}>
                  <FaEnvelope size={10} color="#FFC107" />
                  {formData.email}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <label style={{ color: '#94A3B8', fontSize: '0.75rem', minWidth: '60px' }}>Teléfono</label>
                <div style={{
                  flex: 1,
                  padding: '3px 6px',
                  borderRadius: '3px',
                  backgroundColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: '#FFFFFF',
                  fontSize: '0.75rem'
                }}>
                  <FaPhone size={10} color="#4CAF50" />
                  {isEditing ? (
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        fontSize: '0.75rem'
                      }}
                    />
                  ) : (
                    formData.phone
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <label style={{ color: '#94A3B8', fontSize: '0.75rem', minWidth: '60px' }}>Dirección</label>
                <div style={{
                  flex: 1,
                  padding: '3px 6px',
                  borderRadius: '3px',
                  backgroundColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: '#FFFFFF',
                  fontSize: '0.75rem'
                }}>
                  <FaMapMarkerAlt size={10} color="#4CAF50" />
                  {isEditing ? (
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        fontSize: '0.75rem'
                      }}
                    />
                  ) : (
                    formData.address
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sección 2: Detalles de Cuenta */}
          <div style={{
            backgroundColor: '#111827',
            borderRadius: '8px',
            padding: '0.8rem 1rem',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem'
          }}>
            <h3 style={{
              color: '#FFC107',
              fontSize: '0.95rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              margin: '0 0 0.5rem 0'
            }}>
              <FaShieldAlt size={12} /> Detalles de Cuenta
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <label style={{ color: '#94A3B8', fontSize: '0.75rem', minWidth: '60px' }}>Registro</label>
                <div style={{
                  flex: 1,
                  padding: '3px 6px',
                  borderRadius: '3px',
                  backgroundColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: '#FFFFFF',
                  fontSize: '0.75rem'
                }}>
                  <FaCheckCircle size={10} color="#4CAF50" />
                  15/03/2023
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <label style={{ color: '#94A3B8', fontSize: '0.75rem', minWidth: '60px' }}>Estado</label>
                <div style={{
                  flex: 1,
                  padding: '3px 6px',
                  borderRadius: '3px',
                  backgroundColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: '#FFFFFF',
                  fontSize: '0.75rem'
                }}>
                  <span style={{
                    backgroundColor: '#4CAF50',
                    color: '#000',
                    fontSize: '0.65rem',
                    padding: '1px 5px',
                    borderRadius: '8px',
                    fontWeight: '600'
                  }}>
                    Activa
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <label style={{ color: '#94A3B8', fontSize: '0.75rem', minWidth: '60px' }}>Pedidos</label>
                <div style={{
                  flex: 1,
                  padding: '3px 6px',
                  borderRadius: '3px',
                  backgroundColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: '#FFFFFF',
                  fontSize: '0.75rem'
                }}>
                  <span style={{
                    backgroundColor: '#FFC107',
                    color: '#000',
                    fontSize: '0.65rem',
                    padding: '1px 5px',
                    borderRadius: '8px',
                    fontWeight: '600'
                  }}>
                    12 pedidos
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Animado desde Arriba */}
      {showToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#111827',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          border: '1px solid #FFC107',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'slideDown 0.5s ease-out',
          transition: 'opacity 0.3s ease'
        }}>
          <span style={{ fontSize: '0.85rem' }}>Cambios guardados correctamente.</span>
          <button
            onClick={() => setShowToast(false)}
            style={{
              backgroundColor: '#FFC107',
              color: '#000',
              border: 'none',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Aceptar
          </button>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-50px) translateX(-50%);
            opacity: 0;
          }
          to {
            transform: translateY(0) translateX(-50%);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;