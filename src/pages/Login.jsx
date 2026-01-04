// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEnvelope, FaLock, FaUser, FaCheckCircle } from 'react-icons/fa';

// Importar desde data.js
import { 
  initialUsers, 
  roles, 
  adminHardcodedUser, 
  validateUserCredentials,
  getModulesByRole,
  loginUser 
} from '../data';

const Login = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [currentView, setCurrentView] = useState('login'); // 'login', 'forgot', 'reset', 'email-sent'
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetData, setResetData] = useState({ password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // === FUNCIÓN DE LOGIN MEJORADA ===
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      // Usar la función loginUser de data.js que maneja todo el proceso
      const result = loginUser(loginData.email, loginData.password);
      
      if (result.success) {
        const normalizedUser = result.user;
        
        // Guardar en localStorage con estructura consistente
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        localStorage.setItem('userPermissions', JSON.stringify(normalizedUser.Permisos));
        
        // Llamar a la función onLogin si existe
        if (onLogin) onLogin(normalizedUser);
        
        // Redirigir a /admin para TODOS los usuarios
        navigate('/admin');
      } else {
        setError(result.message || 'Email o contraseña incorrectos');
      }
      
      setIsLoading(false);
    }, 1000);
  };

  // === FUNCIÓN DE REGISTRO ACTUALIZADA ===
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (registerData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    // Verificar si el email ya existe (en initialUsers o localStorage)
    const emailExistsInInitial = initialUsers.some(u => u.Correo === registerData.email);
    
    // Verificar en localStorage
    const storedUser = localStorage.getItem('user');
    let emailExistsInLocal = false;
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.Correo === registerData.email || user.email === registerData.email) {
          emailExistsInLocal = true;
        }
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }

    if (emailExistsInInitial || emailExistsInLocal) {
      setError('Este email ya está registrado');
      return;
    }

    // Crear nuevo usuario con estructura consistente
    const newUserId = Math.max(...initialUsers.map(u => u.IdUsuario)) + 1;
    const vendedorRole = roles.find(r => r.IdRol === 2); // Rol Vendedor por defecto (para el sistema)
    
    const newUser = {
      IdUsuario: newUserId,
      Nombre: registerData.name,
      Correo: registerData.email,
      IdRol: 2, // Vendedor por defecto para nuevos registros (esto se gestiona en el admin)
      Clave: registerData.password,
      Estado: true,
      Permisos: vendedorRole ? vendedorRole.Permisos : ["dashboard", "ventas", "devoluciones", "clientes"],
      role: 'vendedor' // Este campo también se puede actualizar en el admin
    };

    // Guardar en localStorage
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('userPermissions', JSON.stringify(newUser.Permisos));
    
    if (onLogin) onLogin(newUser);
    
    // Redirigir a /admin
    navigate('/admin');
  };

  // === FUNCIÓN OLVIDÉ CONTRASEÑA ===
  const handleForgotPassword = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    setTimeout(() => {
      // Verificar si el email existe en todas las fuentes posibles
      const existsInInitial = initialUsers.some(u => u.Correo === forgotEmail);
      const isAdminEmail = forgotEmail === adminHardcodedUser.Correo;
      
      // Verificar en localStorage
      const storedUser = localStorage.getItem('user');
      let existsInLocal = false;
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          if (user.Correo === forgotEmail || user.email === forgotEmail) {
            existsInLocal = true;
          }
        } catch (e) {
          console.error('Error parsing user:', e);
        }
      }

      // Verificar emails de todos los usuarios en localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('user_') || key === 'user') {
          try {
            const userData = JSON.parse(localStorage.getItem(key));
            if (userData.Correo === forgotEmail || userData.email === forgotEmail) {
              existsInLocal = true;
              break;
            }
          } catch (e) {
            console.error('Error parsing user data:', e);
          }
        }
      }

      if (existsInInitial || existsInLocal || isAdminEmail) {
        setMessage(`Hemos enviado un enlace de recuperación a: ${forgotEmail}`);
        const resetToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const resetData = {
          email: forgotEmail,
          token: resetToken,
          expires: Date.now() + 3600000 
        };
        localStorage.setItem('passwordResetToken', JSON.stringify(resetData));
        setCurrentView('email-sent');
      } else {
        setError('No encontramos una cuenta asociada a este email');
      }
      setIsLoading(false);
    }, 1500);
  };

  // === FUNCIÓN RESET PASSWORD ===
  const handleResetPassword = (e) => {
    e.preventDefault();
    if (resetData.password !== resetData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (resetData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    setError('');

    setTimeout(() => {
      const resetTokenData = localStorage.getItem('passwordResetToken');
      if (!resetTokenData) {
        setError('Token inválido o expirado');
        setIsLoading(false);
        return;
      }

      const { email } = JSON.parse(resetTokenData);
      
      // Buscar y actualizar usuario en localStorage
      let userUpdated = false;
      
      // Buscar en todas las keys de localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('user_') || key === 'user') {
          try {
            const user = JSON.parse(localStorage.getItem(key));
            if (user.Correo === email || user.email === email) {
              // Actualizar contraseña
              user.Clave = resetData.password;
              user.password = resetData.password;
              localStorage.setItem(key, JSON.stringify(user));
              userUpdated = true;
              break;
            }
          } catch (e) {
            console.error('Error updating user:', e);
          }
        }
      }

      if (!userUpdated) {
        // Si no está en localStorage, no podemos modificar initialUsers
        // Pero mostramos mensaje de éxito para la demo
        setMessage('Contraseña actualizada correctamente (demo)');
      } else {
        setMessage('Contraseña actualizada correctamente');
      }
      
      localStorage.removeItem('passwordResetToken');
      setIsLoading(false);

      setTimeout(() => {
        setCurrentView('login');
        setResetData({ password: '', confirmPassword: '' });
      }, 2000);
    }, 1500);
  };

  // === VISTA DE LOGIN ===
  const renderLoginView = () => (
    <div style={{ backgroundColor: '#1A242E', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <Link to="/" style={{ position: 'absolute', left: '20px', top: '20px', color: '#FFC107', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FaArrowLeft size={14} /> Volver a la tienda
      </Link>

      {/* Ajuste 1: Reducir el maxWidth del contenedor principal */}
      <div style={{ 
        backgroundColor: '#121212', 
        padding: '25px', 
        borderRadius: '12px', 
        width: '100%', 
        maxWidth: '380px', 
        boxShadow: '0 4px 20px rgba(239, 181, 9, 0.5)', 
        border: '1px solid #333' 
      }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#FFC107', fontSize: '20px', margin: '0' }}>GM CAPS</h2>
          <p style={{ color: '#ccc', fontSize: '14px', margin: '10px 0 0 0' }}>Bienvenido<br />Tu tienda de gorras favorita</p>
        </div>

        {/* SECCIÓN DEMO ELIMINADA COMPLETAMENTE */}
        {/* El bloque <div> con className="demo-access" ha sido removido. */}

        <div style={{ display: 'flex', gap: '5px', marginBottom: '20px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#2f4c5bff' }}>
          <button 
            onClick={() => setActiveTab('login')} 
            style={{ 
              flex: 1, 
              padding: '8px 12px', 
              backgroundColor: activeTab === 'login' ? '#FFC107' : 'transparent', 
              color: activeTab === 'login' ? '#000' : 'white', 
              border: 'none', 
              fontWeight: 'bold', 
              cursor: 'pointer', 
              fontSize: '14px' 
            }}
          >
            Iniciar Sesión
          </button>
          <button 
            onClick={() => setActiveTab('register')} 
            style={{ 
              flex: 1, 
              padding: '8px 12px', 
              backgroundColor: activeTab === 'register' ? '#FFC107' : 'transparent', 
              color: activeTab === 'register' ? '#000' : 'white', 
              border: 'none', 
              fontWeight: 'bold', 
              cursor: 'pointer', 
              fontSize: '14px' 
            }}
          >
            Registrarse
          </button>
        </div>

        {error && <div style={{ backgroundColor: '#331a1a', color: '#f83d3dff', padding: '8px', borderRadius: '6px', marginBottom: '15px', fontSize: '12px', textAlign: 'center' }}>{error}</div>}
        {message && <div style={{ backgroundColor: '#1a331a', color: '#4CAF50', padding: '8px', borderRadius: '6px', marginBottom: '15px', fontSize: '12px', textAlign: 'center' }}>{message}</div>}

        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#ddd', fontSize: '12px' }}>
                <FaEnvelope style={{ marginRight: '6px' }} /> Email
              </label>
              <input 
                type="email" 
                value={loginData.email} 
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} 
                placeholder="tu@email.com" 
                required 
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  borderRadius: '6px', 
                  backgroundColor: '#2f424dff', // Fondo azul oscuro para inputs
                  border: '1px solid #948f8fff', // Borde más claro para contraste
                  color: 'white', 
                  fontSize: '14px' 
                }} 
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#ddd', fontSize: '12px' }}>
                <FaLock style={{ marginRight: '6px' }} /> Contraseña
              </label>
              <input 
                type="password" 
                value={loginData.password} 
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} 
                placeholder="••••••••" 
                required 
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  borderRadius: '6px', 
                  backgroundColor: '#2f424dff', // Fondo azul oscuro para inputs
                  border: '1px solid #c1babaff', // Borde más claro para contraste
                  color: 'white', 
                  fontSize: '14px' 
                }} 
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              style={{ 
                width: '100%', 
                padding: '10px', 
                fontSize: '14px', 
                fontWeight: 'bold', 
                borderRadius: '6px', 
                backgroundColor: isLoading ? '#666' : '#FFC107', 
                color: isLoading ? '#999' : '#000', 
                border: 'none', 
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? 'Verificando...' : 'Iniciar Sesión'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '15px' }}>
              <button 
                type="button" 
                onClick={() => setCurrentView('forgot')} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#FFC107', 
                  fontSize: '14px', 
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>
        )}

        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#ddd', fontSize: '12px' }}>
                <FaUser style={{ marginRight: '6px' }} /> Nombre Completo
              </label>
              <input 
                type="text" 
                value={registerData.name} 
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })} 
                placeholder="Juan Pérez" 
                required 
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  borderRadius: '6px', 
                  backgroundColor: '#2f424dff', // Fondo azul oscuro para inputs
                  border: '1px solid #948f8fff', // Borde más claro para contraste
                  color: 'white', 
                  fontSize: '14px' 
                }} 
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#ddd', fontSize: '12px' }}>
                <FaEnvelope style={{ marginRight: '6px' }} /> Email
              </label>
              <input 
                type="email" 
                value={registerData.email} 
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} 
                placeholder="tu@email.com" 
                required 
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  borderRadius: '6px', 
                  backgroundColor: '#2f424dff', // Fondo azul oscuro para inputs
                  border: '1px solid #948f8fff', // Borde más claro para contraste
                  color: 'white', 
                  fontSize: '14px' 
                }} 
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#ddd', fontSize: '12px' }}>
                <FaLock style={{ marginRight: '6px' }} /> Contraseña
              </label>
              <input 
                type="password" 
                value={registerData.password} 
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} 
                placeholder="••••••••" 
                required 
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  borderRadius: '6px', 
                  backgroundColor: '#2f424dff', // Fondo azul oscuro para inputs
                  border: '1px solid #948f8fff', // Borde más claro para contraste
                  color: 'white', 
                  fontSize: '14px' 
                }} 
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#ddd', fontSize: '12px' }}>
                <FaLock style={{ marginRight: '6px' }} /> Confirmar Contraseña
              </label>
              <input 
                type="password" 
                value={registerData.confirmPassword} 
                onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })} 
                placeholder="••••••••" 
                required 
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  borderRadius: '6px', 
                  backgroundColor: '#2f424dff', // Fondo azul oscuro para inputs
                  border: '1px solid #948f8fff', // Borde más claro para contraste
                  color: 'white', 
                  fontSize: '14px' 
                }} 
              />
            </div>
            {/* Ajuste 2: Texto del botón - Eliminado "(Vendedor)" */}
            <button 
              type="submit" 
              style={{ 
                width: '100%', 
                padding: '10px', 
                fontSize: '14px', 
                fontWeight: 'bold', 
                borderRadius: '6px', 
                backgroundColor: '#FFC107', 
                color: '#000', 
                border: 'none', 
                cursor: 'pointer' 
              }}
            >
              Crear Cuenta
            </button>
            {/* Ajuste 3: Eliminada la nota sobre "Vendedores" */}
            {/* <p style={{ color: '#aaa', fontSize: '11px', textAlign: 'center', marginTop: '10px' }}>
              Los nuevos usuarios se registran como Vendedores
            </p> */}
          </form>
        )}
      </div>
    </div>
  );

  // === VISTA OLVIDÉ CONTRASEÑA ===
  const renderForgotPasswordView = () => (
    <div style={{ backgroundColor: '#f0f0f0', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <button 
        onClick={() => setCurrentView('login')} 
        style={{ 
          position: 'absolute', 
          left: '20px', 
          top: '20px', 
          color: '#FFC107', 
          fontSize: '14px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          background: 'none', 
          border: 'none', 
          cursor: 'pointer' 
        }}
      >
        <FaArrowLeft size={14} /> Volver al login
      </button>
      
      {/* Ajuste 1: Reducir el maxWidth del contenedor principal */}
      <div style={{ 
        backgroundColor: '#121212', 
        padding: '25px', 
        borderRadius: '12px', 
        width: '100%', 
        maxWidth: '380px', 
        boxShadow: '0 4px 20px rgba(239, 181, 9, 0.5)', 
        border: '1px solid #333' 
      }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#FFC107', fontSize: '20px', margin: '0' }}>GM CAPS</h2>
          <p style={{ color: '#ccc', fontSize: '14px', margin: '10px 0 0 0' }}>Recuperar Contraseña</p>
        </div>
        
        {error && <div style={{ backgroundColor: '#331a1a', color: '#f83d3dff', padding: '8px', borderRadius: '6px', marginBottom: '15px', fontSize: '12px', textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={handleForgotPassword}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#ddd', fontSize: '12px' }}>
              <FaEnvelope style={{ marginRight: '6px' }} /> Email
            </label>
            <input 
              type="email" 
              value={forgotEmail} 
              onChange={(e) => setForgotEmail(e.target.value)} 
              placeholder="tu@email.com" 
              required 
              style={{ 
                width: '100%', 
                padding: '8px', 
                borderRadius: '6px', 
                backgroundColor: '#2f424dff', // Fondo azul oscuro para inputs
                border: '1px solid #948f8fff', // Borde más claro para contraste
                color: 'white', 
                fontSize: '14px' 
              }} 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            style={{ 
              width: '100%', 
              padding: '10px', 
              fontSize: '14px', 
              fontWeight: 'bold', 
              borderRadius: '6px', 
              backgroundColor: isLoading ? '#666' : '#FFC107', 
              color: isLoading ? '#999' : '#000', 
              border: 'none', 
              cursor: isLoading ? 'not-allowed' : 'pointer', 
              opacity: isLoading ? 0.7 : 1 
            }}
          >
            {isLoading ? 'Enviando...' : 'Enviar Email de Recuperación'}
          </button>
          
          <button 
            type="button" 
            onClick={() => setCurrentView('login')} 
            style={{ 
              width: '100%', 
              background: 'none', 
              border: 'none', 
              color: '#FFC107', 
              fontSize: '14px', 
              padding: '8px', 
              cursor: 'pointer', 
              marginTop: '10px',
              textDecoration: 'underline'
            }}
          >
            Cancelar y volver al login
          </button>
        </form>
      </div>
    </div>
  );

  // === VISTA EMAIL ENVIADO ===
  const renderEmailSentView = () => (
    <div style={{ backgroundColor: '#f0f0f0', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      {/* Ajuste 1: Reducir el maxWidth del contenedor principal */}
      <div style={{ 
        backgroundColor: '#121212', 
        padding: '30px', 
        borderRadius: '12px', 
        width: '100%', 
        maxWidth: '380px', 
        boxShadow: '0 4px 20px rgba(239, 181, 9, 0.5)', 
        border: '1px solid #333', 
        textAlign: 'center' 
      }}>
        <FaCheckCircle size={40} color="#4CAF50" style={{ marginBottom: '20px' }} />
        <h2 style={{ color: '#FFC107', fontSize: '20px', margin: '0 0 10px 0' }}>GM CAPS</h2>
        <h3 style={{ color: '#4CAF50', fontSize: '18px', margin: '0 0 20px 0' }}>Email Enviado</h3>
        <p style={{ color: '#ccc', fontSize: '14px', marginBottom: '10px' }}>
          Hemos enviado un enlace de recuperación a: <br/> 
          <strong style={{ color: '#FFC107' }}>{forgotEmail}</strong>
        </p>
        <p style={{ color: '#aaa', fontSize: '12px', marginBottom: '20px' }}>
          (Demo: Haz clic en Continuar para simular el proceso)
        </p>
        <button 
          onClick={() => setCurrentView('reset')} 
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#FFC107', 
            color: '#000', 
            border: 'none', 
            borderRadius: '6px', 
            fontWeight: 'bold', 
            cursor: 'pointer' 
          }}
        >
          Continuar Demo
        </button>
      </div>
    </div>
  );

  // === VISTA RESET PASSWORD ===
  const renderResetPasswordView = () => (
    <div style={{ backgroundColor: '#f0f0f0', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      {/* Ajuste 1: Reducir el maxWidth del contenedor principal */}
      <div style={{ 
        backgroundColor: '#121212', 
        padding: '25px', 
        borderRadius: '12px', 
        width: '100%', 
        maxWidth: '380px', 
        boxShadow: '0 4px 20px rgba(239, 181, 9, 0.5)', 
        border: '1px solid #333' 
      }}>
        <h2 style={{ color: '#FFC107', textAlign: 'center', marginBottom: '20px' }}>Nueva Contraseña</h2>
        
        {error && <div style={{ backgroundColor: '#331a1a', color: '#f83d3dff', padding: '8px', borderRadius: '6px', marginBottom: '15px', fontSize: '12px', textAlign: 'center' }}>{error}</div>}
        {message && <div style={{ backgroundColor: '#1a331a', color: '#4CAF50', padding: '8px', borderRadius: '6px', marginBottom: '15px', fontSize: '12px', textAlign: 'center' }}>{message}</div>}
        
        <form onSubmit={handleResetPassword}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#ddd', fontSize: '12px' }}>
              Nueva Contraseña
            </label>
            <input 
              type="password" 
              value={resetData.password} 
              onChange={(e) => setResetData({ ...resetData, password: e.target.value })} 
              placeholder="••••••••" 
              required 
              style={{ 
                width: '100%', 
                padding: '10px', 
                borderRadius: '6px', 
                backgroundColor: '#2f424dff', // Fondo azul oscuro para inputs
                border: '1px solid #948f8fff', // Borde más claro para contraste
                color: 'white', 
                fontSize: '14px' 
              }} 
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#ddd', fontSize: '12px' }}>
              Confirmar Contraseña
            </label>
            <input 
              type="password" 
              value={resetData.confirmPassword} 
              onChange={(e) => setResetData({ ...resetData, confirmPassword: e.target.value })} 
              placeholder="••••••••" 
              required 
              style={{ 
                width: '100%', 
                padding: '10px', 
                borderRadius: '6px', 
                backgroundColor: '#2f424dff', // Fondo azul oscuro para inputs
                border: '1px solid #948f8fff', // Borde más claro para contraste
                color: 'white', 
                fontSize: '14px' 
              }} 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            style={{ 
              width: '100%', 
              padding: '10px', 
              backgroundColor: isLoading ? '#666' : '#FFC107', 
              color: isLoading ? '#999' : '#000', 
              border: 'none', 
              borderRadius: '6px', 
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Actualizando...' : 'Cambiar Contraseña'}
          </button>
        </form>
      </div>
    </div>
  );

  // === RENDER PRINCIPAL ===
  switch (currentView) {
    case 'forgot': 
      return renderForgotPasswordView();
    case 'email-sent': 
      return renderEmailSentView();
    case 'reset': 
      return renderResetPasswordView();
    default: 
      return renderLoginView();
  }
};

export default Login;