// src/pages/Login.jsx
import React, { useMemo, useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa";
import { validateCustomerCredentials, validateUserCredentials, registerCustomer, roles } from "../data";

const Login = ({ onLogin }) => {
  const [view, setView] = useState("auth");
  const [activeTab, setActiveTab] = useState("login");
  const [error, setError] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    documentType: "Cédula de Ciudadanía",
    documentNumber: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  // Recuperación
  const [recoverTo, setRecoverTo] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [codeDigits, setCodeDigits] = useState(["", "", "", "", "", ""]);
  const [newPass, setNewPass] = useState("");
  const [newPass2, setNewPass2] = useState("");
  // 👁️ Toggles
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showRegPass, setShowRegPass] = useState(false);
  const [showRegPass2, setShowRegPass2] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showNewPass2, setShowNewPass2] = useState(false);
  // Refs para los 6 inputs de código
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  
  // Limpiar localStorage al montar el componente (opcional - para pruebas)
  useEffect(() => {
    // Solo para desarrollo: limpiar cualquier sesión previa
    // localStorage.removeItem('user');
  }, []);
  
  const resetMessages = () => { setError(""); setInfoMsg(""); setSuccessMsg(""); };

  // ===== ESTILOS =====
  const styles = useMemo(() => {
    // Inputs base (sin zoom)
    const inputBase = { 
      width: "100%", 
      padding: "4px 8px",
      borderRadius: "4px",
      backgroundColor: "#1a1f2e",
      border: "1px solid rgba(255,255,255,0.12)",
      color: "#fff",
      fontSize: "12px",
      outline: "none",
      boxSizing: "border-box",
      height: "30px"
    };
    
    // Inputs con zoom para login/recover - MÁS GRANDES
    const inputZoomed = { 
      width: "100%", 
      padding: "8px 12px",
      borderRadius: "8px",
      backgroundColor: "#1a1f2e",
      border: "1px solid rgba(255,255,255,0.12)",
      color: "#fff",
      fontSize: "16px",
      outline: "none",
      boxSizing: "border-box",
      height: "44px"
    };
    
    // Inputs con zoom suave para registro - REDUCIDO PARA EVITAR SCROLL
    const inputRegisterZoomed = { 
      width: "100%", 
      padding: "5px 9px",
      borderRadius: "6px",
      backgroundColor: "#1a1f2e",
      border: "1px solid rgba(255,255,255,0.12)",
      color: "#fff",
      fontSize: "13px",
      outline: "none",
      boxSizing: "border-box",
      height: "34px"
    };
    
    // Select SIN CUADRO
    const selectBase = { 
      width: "100%", 
      padding: "4px 8px",
      borderRadius: "4px",
      backgroundColor: "#1a1f2e",
      border: "none",
      color: "#fff",
      fontSize: "12px",
      outline: "none",
      boxSizing: "border-box",
      height: "30px",
      cursor: "pointer"
    };
    
    // Select con zoom suave para registro - REDUCIDO
    const selectRegisterZoomed = { 
      width: "100%", 
      padding: "5px 9px",
      borderRadius: "6px",
      backgroundColor: "#1a1f2e",
      border: "none",
      color: "#fff",
      fontSize: "13px",
      outline: "none",
      boxSizing: "border-box",
      height: "34px",
      cursor: "pointer"
    };
    
    const tabWrap = { 
      display: "flex", 
      backgroundColor: "#233647",
      borderRadius: "8px",
      padding: "4px",
      marginBottom: "16px",
      gap: "4px"
    };
    
    const tabBtn = (active) => ({ 
      flex: 1,
      padding: "6px 8px",
      borderRadius: "6px",
      border: "none",
      fontSize: "13px",
      fontWeight: 400,
      backgroundColor: active ? "#FFC107" : "transparent",
      color: active ? "#000" : "#fff",
      cursor: "pointer",
      transition: "0.15s ease",
      lineHeight: 1.2
    });
    
    // Botón principal base
    const mainBtnBase = { 
      width: "100%",
      padding: "6px 10px",
      borderRadius: "4px",
      fontWeight: 500,
      fontSize: "13px",
      border: "none",
      cursor: "pointer",
      backgroundColor: "#FFC107",
      color: "#000",
      height: "34px",
      marginTop: "8px"
    };
    
    // Botón principal con zoom - MÁS GRANDE
    const mainBtnZoomed = { 
      width: "100%",
      padding: "12px 16px",
      borderRadius: "8px",
      fontWeight: 600,
      fontSize: "18px",
      border: "none",
      cursor: "pointer",
      backgroundColor: "#FFC107",
      color: "#000",
      height: "52px",
      marginTop: "20px"
    };
    
    // Botón principal con zoom suave para registro - REDUCIDO
    const mainBtnRegisterZoomed = { 
      width: "100%",
      padding: "8px 12px",
      borderRadius: "6px",
      fontWeight: 550,
      fontSize: "15px",
      border: "none",
      cursor: "pointer",
      backgroundColor: "#FFC107",
      color: "#000",
      height: "40px",
      marginTop: "12px"
    };
    
    const linkBtnBase = { 
      background: "none",
      border: "none",
      color: "#FFC107",
      fontSize: "11px",
      cursor: "pointer",
      fontWeight: 400,
      padding: 0,
      textDecoration: "none"
    };
    
    const linkBtnZoomed = { 
      background: "none",
      border: "none",
      color: "#FFC107",
      fontSize: "15px",
      cursor: "pointer",
      fontWeight: 400,
      padding: 0,
      textDecoration: "none"
    };
    
    const inputWrap = { position: "relative", width: "100%" };
    
    const eyeBtnBase = { 
      position: "absolute",
      right: "6px",
      top: "50%",
      transform: "translateY(-50%)",
      border: "none",
      background: "transparent",
      cursor: "pointer",
      color: "rgba(255,255,255,0.6)",
      fontSize: "12px",
      padding: "2px",
      lineHeight: 1
    };
    
    const eyeBtnZoomed = { 
      position: "absolute",
      right: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      border: "none",
      background: "transparent",
      cursor: "pointer",
      color: "rgba(255,255,255,0.6)",
      fontSize: "18px",
      padding: "4px",
      lineHeight: 1
    };
    
    const eyeBtnRegisterZoomed = { 
      position: "absolute",
      right: "8px",
      top: "50%",
      transform: "translateY(-50%)",
      border: "none",
      background: "transparent",
      cursor: "pointer",
      color: "rgba(255,255,255,0.6)",
      fontSize: "14px",
      padding: "3px",
      lineHeight: 1
    };
    
    const codeContainer = { 
      display: "flex",
      gap: "6px",
      justifyContent: "center",
      marginBottom: "16px"
    };
    
    const codeInput = {
      width: "38px",
      height: "42px",
      borderRadius: "6px",
      backgroundColor: "#1a1f2e",
      border: "1px solid rgba(255,255,255,0.12)",
      color: "#fff",
      fontSize: "18px",
      fontWeight: 500,
      textAlign: "center",
      outline: "none"
    };

    const successBox = {
      backgroundColor: "rgba(76, 175, 80, 0.15)",
      padding: "8px",
      borderRadius: "6px",
      fontSize: "12px",
      color: "#4CAF50",
      marginBottom: "15px",
      border: "1px solid rgba(76, 175, 80, 0.30)",
      textAlign: "center",
      fontWeight: 400,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "4px"
    };

    return {
      page: { 
        minHeight: "100vh", 
        background: "#4F4D4D",
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center",
        padding: "10px",
        position: "relative" 
      },
      card: { 
        width: "100%",
        maxWidth: "360px",
        padding: "20px 18px",
        backgroundColor: "#0f1115",
        borderRadius: "10px",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
        position: "relative",
        margin: "0 auto"
      },
      cardZoomed: { 
        width: "100%",
        maxWidth: "440px",
        padding: "30px 28px",
        backgroundColor: "#0f1115",
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "0 15px 35px rgba(0,0,0,0.5)",
        position: "relative",
        margin: "0 auto"
      },
      cardRegisterZoomed: { 
        width: "100%",
        maxWidth: "380px",
        padding: "22px 20px",
        backgroundColor: "#0f1115",
        borderRadius: "14px",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "0 12px 28px rgba(0,0,0,0.45)",
        position: "relative",
        margin: "0 auto"
      },
      backArrow: { 
        position: "absolute",
        top: "12px",
        left: "12px",
        color: "#FFC107",
        cursor: "pointer",
        background: "none",
        border: "none",
        fontSize: "16px",
        padding: "2px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10
      },
      brand: { textAlign: "center", marginBottom: "12px" },
      brandTitle: { 
        color: "#FFC107",
        margin: 0,
        fontWeight: 600,
        fontSize: "26px",
        letterSpacing: "0.5px"
      },
      subtitle: { 
        color: "#cfcfcf",
        fontSize: "15px",
        margin: "4px 0 0 0",
        lineHeight: 1.2,
        fontWeight: 400
      },
      tabWrap,
      tabBtn,
      label: { 
        fontSize: "11px",
        color: "#e0e0e0",
        marginBottom: "3px",
        display: "block",
        fontWeight: 400
      },
      labelZoomed: { 
        fontSize: "15px",
        color: "#e0e0e0",
        marginBottom: "4px",
        display: "block",
        fontWeight: 500
      },
      labelRegisterZoomed: {
        fontSize: "12px",
        color: "#e0e0e0",
        marginBottom: "3px",
        display: "block",
        fontWeight: 400
      },
      labelRegister: {
        fontSize: "11px",
        color: "#e0e0e0",
        marginBottom: "3px",
        display: "block",
        fontWeight: 400
      },
      input: inputBase,
      inputZoomed,
      inputRegisterZoomed,
      select: selectBase,
      selectRegisterZoomed,
      inputWrap,
      eyeBtn: eyeBtnBase,
      eyeBtnZoomed,
      eyeBtnRegisterZoomed,
      mainBtn: mainBtnBase,
      mainBtnZoomed,
      mainBtnRegisterZoomed,
      linkBtn: linkBtnBase,
      linkBtnZoomed,
      error: { 
        backgroundColor: "#2b1414",
        padding: "6px",
        borderRadius: "6px",
        fontSize: "11px",
        color: "#ff6b6b",
        marginBottom: "12px",
        border: "1px solid rgba(255,107,107,0.25)",
        textAlign: "center",
        fontWeight: 400
      },
      info: { 
        backgroundColor: "rgba(255,193,7,0.15)",
        padding: "6px",
        borderRadius: "6px",
        fontSize: "11px",
        color: "#ffd56a",
        marginBottom: "12px",
        border: "1px solid rgba(255,193,7,0.30)",
        textAlign: "center",
        fontWeight: 400
      },
      success: {
        ...successBox,
        padding: "6px",
        fontSize: "11px",
        marginBottom: "12px"
      },
      mutedText: { 
        marginTop: "8px",
        textAlign: "center",
        color: "rgba(255,255,255,0.55)",
        fontSize: "10px",
        fontWeight: 400
      },
      backLink: { 
        position: "absolute",
        top: "10px",
        left: "10px",
        display: "flex",
        alignItems: "center",
        gap: "4px",
        color: "#000000",
        textDecoration: "none",
        fontSize: "14px",
        fontWeight: 600,
        transition: "0.2s ease",
        zIndex: 20,
        background: "none",
        padding: "4px 8px"
      },
      row2: { 
        display: "flex", 
        gap: "8px",
        flexWrap: "wrap",
        marginBottom: "2px"
      },
      colHalf: { 
        flex: "1 1 120px",
        minWidth: "120px" 
      },
      formGroup: { 
        marginBottom: "8px"
      },
      formGroupRegisterZoomed: {
        marginBottom: "10px"
      },
      formGroupRegister: {
        marginBottom: "8px"
      },
      codeContainer,
      codeInput,
      recoverTitle: { 
        color: "#fff",
        fontSize: "24px",
        fontWeight: 600,
        marginBottom: "8px",
        textAlign: "center"
      },
      recoverDescription: { 
        color: "rgba(255,255,255,0.65)",
        fontSize: "15px",
        marginBottom: "15px",
        textAlign: "center",
        lineHeight: 1.4
      }
    };
  }, []);

  // ===== HANDLE LOGIN =====
  const handleLogin = (e) => {
    e.preventDefault();
    resetMessages();
    
    const cleanEmail = loginData.email.trim().toLowerCase();
    const cleanPassword = loginData.password.trim();
    
    // Intentar login como usuario (admin, vendedor, etc.)
    const user = validateUserCredentials(cleanEmail, cleanPassword);
    if (user) {
      const role = roles.find((r) => r.IdRol === user.IdRol);
      const userData = {
        IdUsuario: user.IdUsuario,
        Nombre: user.Nombre.trim(),
        Correo: user.Correo.trim(),
        IdRol: user.IdRol,
        Estado: user.Estado,
        Permisos: user.Permisos || role?.Permisos || [],
        Rol: role?.Nombre?.trim() || "Usuario",
        userType: user.IdRol === 1 ? "admin" : "usuario"
      };
      
      // Guardar en localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Llamar al callback
      onLogin(userData);
      return;
    }

    // Intentar login como cliente
    const customerResult = validateCustomerCredentials(cleanEmail, cleanPassword);
    if (customerResult?.success) {
      const customerWithStats = {
        ...customerResult.customer,
        Pedidos: customerResult.customer.Pedidos || 0,
        Devoluciones: customerResult.customer.Devoluciones || 0,
        userType: "cliente"
      };
      
      // Guardar en localStorage
      localStorage.setItem('user', JSON.stringify(customerWithStats));
      
      // Llamar al callback
      onLogin(customerWithStats);
      return;
    }

    setError("Correo o contraseña incorrectos");
  };

  // ===== HANDLE REGISTER =====
  const handleRegister = (e) => {
    e.preventDefault();
    resetMessages();
    
    // Validaciones
    if (!registerData.name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    
    if (!registerData.email.trim()) {
      setError("El correo es obligatorio");
      return;
    }
    
    if (registerData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    
    if (!registerData.documentNumber.trim()) {
      setError("El número de documento es obligatorio");
      return;
    }
    
    // Registrar cliente
    const result = registerCustomer({
      name: registerData.name,
      email: registerData.email,
      password: registerData.password,
      phone: registerData.documentNumber,
      address: "N/A"
    });

    if (result?.success) {
      const newCustomerWithStats = {
        ...result.customer,
        Pedidos: 0,
        Devoluciones: 0,
        userType: "cliente"
      };
      
      // Guardar en localStorage (ya se guarda en registerCustomer, pero por si acaso)
      localStorage.setItem('user', JSON.stringify(newCustomerWithStats));
      
      // Llamar al callback
      onLogin(newCustomerWithStats);
    } else {
      setError(result?.message || "No se pudo crear la cuenta");
    }
  };

  // ===== MANEJO DE LOS 6 DÍGITOS =====
  const handleCodeChange = (index, value) => {
    const newValue = value.replace(/\D/g, "").slice(0, 1);
    const newDigits = [...codeDigits];
    newDigits[index] = newValue;
    setCodeDigits(newDigits);
    if (newValue && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };
  
  const handleCodeKeyDown = (index, e) => {
    if (e.key === "Backspace" && !codeDigits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
    if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(pasted => {
        const digits = pasted.replace(/\D/g, "").slice(0, 6).split("");
        const newDigits = ["", "", "", "", "", ""];
        digits.forEach((d, i) => {
          if (i < 6) newDigits[i] = d;
        });
        setCodeDigits(newDigits);
        const nextFocus = Math.min(digits.length, 5);
        inputRefs[nextFocus].current?.focus();
      });
    }
  };
  
  const getFullCode = () => codeDigits.join("");

  // ===== RECUPERACIÓN =====
  const goRecover = () => {
    resetMessages();
    setRecoverTo("");
    setSentCode("");
    setCodeDigits(["", "", "", "", "", ""]);
    setNewPass("");
    setNewPass2("");
    setView("recover");
  };

  const sendRecoveryCode = (e) => {
    e.preventDefault();
    resetMessages();
    if (!recoverTo.trim()) {
      setError("Ingresa tu correo electrónico");
      return;
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setSentCode(code);
    setCodeDigits(["", "", "", "", "", ""]);
    setSuccessMsg("Código enviado a tu email");
    setTimeout(() => {
      setSuccessMsg("");
      setView("verify");
    }, 1500);
  };

  const verifyCode = (e) => {
    e.preventDefault();
    resetMessages();
    const fullCode = getFullCode();
    if (fullCode.length !== 6) {
      setError("Ingresa los 6 dígitos del código");
      return;
    }
    if (fullCode !== sentCode) {
      setError("Código incorrecto. Intenta de nuevo");
      setCodeDigits(["", "", "", "", "", ""]);
      inputRefs[0].current?.focus();
      return;
    }
    setSuccessMsg("Código verificado");
    setTimeout(() => {
      setSuccessMsg("");
      setView("reset");
    }, 1500);
  };

  const saveNewPassword = (e) => {
    e.preventDefault();
    resetMessages();
    
    if (newPass.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    
    if (newPass !== newPass2) {
      setError("Las contraseñas no coinciden");
      return;
    }
    
    setSuccessMsg("Contraseña cambiada exitosamente");
    setTimeout(() => {
      setSuccessMsg("");
      setView("auth");
      setActiveTab("login");
      setRecoverTo("");
      setSentCode("");
      setCodeDigits(["", "", "", "", "", ""]);
      setNewPass("");
      setNewPass2("");
    }, 2000);
  };

  // ===== RENDER =====
  // Determinar qué tipo de zoom aplicar
  const isLoginZoomed = (view === "auth" && activeTab === "login") || view === "recover";
  const isRegisterZoomed = view === "auth" && activeTab === "register";

  // Elegir el estilo de card según el caso
  let cardStyle = styles.card;
  if (isLoginZoomed) {
    cardStyle = styles.cardZoomed;
  } else if (isRegisterZoomed) {
    cardStyle = styles.cardRegisterZoomed;
  }

  return (
    <div style={styles.page}>
      <Link 
        to="/" 
        style={styles.backLink} 
        onMouseEnter={(e) => { 
          e.currentTarget.style.color = "#FFC107"; 
        }} 
        onMouseLeave={(e) => { 
          e.currentTarget.style.color = "#000000"; 
        }}
      >
        <FaArrowLeft size={14} /> Volver a tienda
      </Link>
      
      <div style={cardStyle}>
        {/* Flecha de volver - SOLO ÍCONO */}
        {view !== "auth" && (
          <button 
            type="button" 
            style={styles.backArrow} 
            onClick={() => { 
              setView("auth"); 
              setActiveTab("login"); 
              resetMessages(); 
            }}
            title="Volver"
          >
            <FaArrowLeft />
          </button>
        )}

        {view === "auth" && (
          <>
            <div style={styles.brand}>
              <h2 style={styles.brandTitle}>GM CAPS</h2>
              <p style={styles.subtitle}>Bienvenido</p>
            </div>

            {error && <div style={styles.error}>{error}</div>}
            {infoMsg && <div style={styles.info}>{infoMsg}</div>}

            <div style={styles.tabWrap}>
              <button 
                type="button" 
                style={styles.tabBtn(activeTab === "login")} 
                onClick={() => { setActiveTab("login"); resetMessages(); }}
              >
                Iniciar Sesión
              </button>
              <button 
                type="button" 
                style={styles.tabBtn(activeTab === "register")} 
                onClick={() => { setActiveTab("register"); resetMessages(); }}
              >
                Registrarse
              </button>
            </div>

            {activeTab === "login" && (
              <form onSubmit={handleLogin}>
                <div style={styles.formGroup}>
                  <label style={isLoginZoomed ? styles.labelZoomed : styles.label}>Email:</label>
                  <input 
                    style={isLoginZoomed ? styles.inputZoomed : styles.input} 
                    type="email" 
                    required 
                    placeholder="admin@mail.com" 
                    value={loginData.email} 
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} 
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={isLoginZoomed ? styles.labelZoomed : styles.label}>Clave:</label>
                  <div style={styles.inputWrap}>
                    <input 
                      style={{ 
                        ...(isLoginZoomed ? styles.inputZoomed : styles.input), 
                        paddingRight: isLoginZoomed ? "40px" : "28px" 
                      }} 
                      type={showLoginPass ? "text" : "password"} 
                      required 
                      placeholder="••••••••" 
                      value={loginData.password} 
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} 
                    />
                    <button 
                      type="button" 
                      style={isLoginZoomed ? styles.eyeBtnZoomed : styles.eyeBtn} 
                      onClick={() => setShowLoginPass((s) => !s)}
                    >
                      {showLoginPass ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                <button type="submit" style={isLoginZoomed ? styles.mainBtnZoomed : styles.mainBtn}>
                  Iniciar Sesión
                </button>
                <div style={{ textAlign: "center", marginTop: isLoginZoomed ? "15px" : "8px" }}>
                  <button type="button" style={isLoginZoomed ? styles.linkBtnZoomed : styles.linkBtn} onClick={goRecover}>
                    ¿Olvidaste tu clave?
                  </button>
                </div>
              </form>
            )}

            {activeTab === "register" && (
              <form onSubmit={handleRegister}>
                <div style={styles.row2}>
                  <div style={styles.colHalf}>
                    <label style={isRegisterZoomed ? styles.labelRegisterZoomed : styles.labelRegister}>Tipo Doc:</label>
                    <select 
                      style={isRegisterZoomed ? styles.selectRegisterZoomed : styles.select} 
                      value={registerData.documentType} 
                      onChange={(e) => setRegisterData({ ...registerData, documentType: e.target.value })}
                    >
                      <option value="Cédula de Ciudadanía">C.C.</option>
                      <option value="NIT">NIT</option>
                    </select>
                  </div>
                  <div style={styles.colHalf}>
                    <label style={isRegisterZoomed ? styles.labelRegisterZoomed : styles.labelRegister}>Número:</label>
                    <input 
                      style={isRegisterZoomed ? styles.inputRegisterZoomed : styles.input} 
                      type="text" 
                      required 
                      placeholder="123456789" 
                      value={registerData.documentNumber} 
                      onChange={(e) => setRegisterData({ ...registerData, documentNumber: e.target.value })} 
                    />
                  </div>
                </div>
                
                <div style={isRegisterZoomed ? styles.formGroupRegisterZoomed : styles.formGroupRegister}>
                  <label style={isRegisterZoomed ? styles.labelRegisterZoomed : styles.labelRegister}>Nombre Completo:</label>
                  <input 
                    style={isRegisterZoomed ? styles.inputRegisterZoomed : styles.input} 
                    type="text" 
                    required 
                    placeholder="Juan Pérez" 
                    value={registerData.name} 
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })} 
                  />
                </div>
                
                <div style={isRegisterZoomed ? styles.formGroupRegisterZoomed : styles.formGroupRegister}>
                  <label style={isRegisterZoomed ? styles.labelRegisterZoomed : styles.labelRegister}>Correo:</label>
                  <input 
                    style={isRegisterZoomed ? styles.inputRegisterZoomed : styles.input} 
                    type="email" 
                    required 
                    placeholder="tu@email.com" 
                    value={registerData.email} 
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} 
                  />
                </div>
                
                <div style={styles.row2}>
                  <div style={styles.colHalf}>
                    <label style={isRegisterZoomed ? styles.labelRegisterZoomed : styles.labelRegister}>Clave:</label>
                    <div style={styles.inputWrap}>
                      <input 
                        style={{ 
                          ...(isRegisterZoomed ? styles.inputRegisterZoomed : styles.input), 
                          paddingRight: isRegisterZoomed ? "32px" : "28px" 
                        }} 
                        type={showRegPass ? "text" : "password"} 
                        required 
                        placeholder="Min 6" 
                        value={registerData.password} 
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} 
                      />
                      <button 
                        type="button" 
                        style={isRegisterZoomed ? styles.eyeBtnRegisterZoomed : styles.eyeBtn} 
                        onClick={() => setShowRegPass((s) => !s)}
                      >
                        {showRegPass ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  <div style={styles.colHalf}>
                    <label style={isRegisterZoomed ? styles.labelRegisterZoomed : styles.labelRegister}>Confirmar:</label>
                    <div style={styles.inputWrap}>
                      <input 
                        style={{ 
                          ...(isRegisterZoomed ? styles.inputRegisterZoomed : styles.input), 
                          paddingRight: isRegisterZoomed ? "32px" : "28px" 
                        }} 
                        type={showRegPass2 ? "text" : "password"} 
                        required 
                        placeholder="••••••••" 
                        value={registerData.confirmPassword} 
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })} 
                      />
                      <button 
                        type="button" 
                        style={isRegisterZoomed ? styles.eyeBtnRegisterZoomed : styles.eyeBtn} 
                        onClick={() => setShowRegPass2((s) => !s)}
                      >
                        {showRegPass2 ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                </div>
                
                <button type="submit" style={isRegisterZoomed ? styles.mainBtnRegisterZoomed : styles.mainBtn}>
                  Crear Cuenta
                </button>
                <div style={styles.mutedText}>Al registrarte, aceptas nuestros términos</div>
              </form>
            )}
          </>
        )}

        {view === "recover" && (
          <div>
            <h3 style={isLoginZoomed ? {...styles.recoverTitle, fontSize: "26px"} : styles.recoverTitle}>
              Recuperar Contraseña
            </h3>
            <p style={isLoginZoomed ? {...styles.recoverDescription, fontSize: "16px"} : styles.recoverDescription}>
              Ingresa tu correo
            </p>
            {error && <div style={styles.error}>{error}</div>}
            {successMsg && <div style={styles.success}><FaCheckCircle /> {successMsg}</div>}
            <form onSubmit={sendRecoveryCode}>
              <div style={styles.formGroup}>
                <label style={isLoginZoomed ? styles.labelZoomed : styles.label}>Correo Electrónico</label>
                <input 
                  style={isLoginZoomed ? styles.inputZoomed : styles.input} 
                  type="email" 
                  placeholder="tu@email.com" 
                  value={recoverTo}
                  onChange={(e) => setRecoverTo(e.target.value)}
                  required 
                />
              </div>
              <button type="submit" style={isLoginZoomed ? styles.mainBtnZoomed : styles.mainBtn}>
                Enviar Código
              </button>
            </form>
          </div>
        )}

        {view === "verify" && (
          <div>
            <h3 style={styles.recoverTitle}>Verificar Código</h3>
            <p style={styles.recoverDescription}>
              Ingresa el código
            </p>
            {error && <div style={styles.error}>{error}</div>}
            {successMsg && <div style={styles.success}><FaCheckCircle /> {successMsg}</div>}
            <form onSubmit={verifyCode}>
              <div style={styles.codeContainer}>
                {codeDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={inputRefs[index]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                    style={styles.codeInput}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
              <button type="submit" style={styles.mainBtn}>
                Validar Código
              </button>
            </form>
          </div>
        )}

        {view === "reset" && (
          <div>
            <h3 style={styles.recoverTitle}>Nueva Contraseña</h3>
            <p style={styles.recoverDescription}>
              Mínimo 6 caracteres
            </p>
            {error && <div style={styles.error}>{error}</div>}
            {successMsg && <div style={styles.success}><FaCheckCircle /> {successMsg}</div>}
            <form onSubmit={saveNewPassword}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nueva Contraseña</label>
                <div style={styles.inputWrap}>
                  <input 
                    style={{ ...styles.input, paddingRight: "28px" }} 
                    type={showNewPass ? "text" : "password"} 
                    placeholder="Mínimo 6" 
                    value={newPass} 
                    onChange={(e) => setNewPass(e.target.value)} 
                    required 
                  />
                  <button 
                    type="button" 
                    style={styles.eyeBtn} 
                    onClick={() => setShowNewPass((s) => !s)}
                  >
                    {showNewPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Confirmar</label>
                <div style={styles.inputWrap}>
                  <input 
                    style={{ ...styles.input, paddingRight: "28px" }} 
                    type={showNewPass2 ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={newPass2} 
                    onChange={(e) => setNewPass2(e.target.value)} 
                    required 
                  />
                  <button 
                    type="button" 
                    style={styles.eyeBtn} 
                    onClick={() => setShowNewPass2((s) => !s)}
                  >
                    {showNewPass2 ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <button type="submit" style={styles.mainBtn}>
                Cambiar Contraseña
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;