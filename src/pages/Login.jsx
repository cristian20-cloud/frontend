// src/pages/Login.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { validateCustomerCredentials, validateUserCredentials, registerCustomer, roles } from "../data";

const Login = ({ onLogin }) => { // 👈 Recibimos onLogin como prop
  const [view, setView] = useState("auth");
  const [activeTab, setActiveTab] = useState("login");
  const [error, setError] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    documentType: "Cédula de Identidad",
    documentNumber: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  // Recuperación
  const [recoverMethod, setRecoverMethod] = useState("email");
  const [recoverTo, setRecoverTo] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [typedCode, setTypedCode] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newPass2, setNewPass2] = useState("");

  // 👁️ Toggles
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showRegPass, setShowRegPass] = useState(false);
  const [showRegPass2, setShowRegPass2] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showNewPass2, setShowNewPass2] = useState(false);

  const resetMessages = () => { setError(""); setInfoMsg(""); };

  // ===== ESTILOS =====
  const styles = useMemo(() => {
    const inputBase = { width: "100%", padding: "8px 12px", borderRadius: "12px", backgroundColor: "#0f1b2a", border: "1px solid rgba(255,255,255,0.16)", color: "#fff", fontSize: "13px", outline: "none", boxSizing: "border-box" };
    const tabWrap = { display: "flex", backgroundColor: "#233647", borderRadius: "16px", padding: "4px", marginBottom: "14px", gap: "6px" };
    const tabBtn = (active) => ({ flex: 1, padding: "6px 10px", borderRadius: "14px", border: "none", fontSize: "13px", fontWeight: 500, backgroundColor: active ? "#FFC107" : "transparent", color: active ? "#000" : "#fff", cursor: "pointer", transition: "0.15s ease", lineHeight: 1.2 });
    const pillWrap = { display: "flex", gap: "6px", backgroundColor: "#233647", padding: "4px", borderRadius: "16px", marginBottom: "12px" };
    const pillBtn = (active) => ({ flex: 1, padding: "6px 10px", borderRadius: "14px", border: "none", fontSize: "12px", fontWeight: 500, backgroundColor: active ? "#FFC107" : "transparent", color: active ? "#000" : "#fff", cursor: "pointer" });
    const mainBtn = { width: "100%", padding: "9px 12px", borderRadius: "12px", fontWeight: 500, fontSize: "14px", border: "none", cursor: "pointer", backgroundColor: "#FFC107", color: "#000" };
    const secondaryBtn = { width: "100%", padding: "9px 12px", borderRadius: "12px", fontWeight: 500, fontSize: "13px", border: "1px solid rgba(255,255,255,0.18)", cursor: "pointer", backgroundColor: "transparent", color: "#fff" };
    const linkBtn = { background: "none", border: "none", color: "#FFC107", fontSize: "12px", cursor: "pointer", fontWeight: 500, padding: 0, textDecoration: "none" };
    const inputWrap = { position: "relative", width: "100%" };
    const eyeBtn = { position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", cursor: "pointer", color: "rgba(255,255,255,0.75)", fontSize: "14px", padding: "4px", lineHeight: 1 };

    return {
      page: { minHeight: "100vh", background: "#a9a9a9", display: "flex", justifyContent: "center", alignItems: "center", padding: "18px", position: "relative" },
      card: { width: "100%", maxWidth: "400px", padding: "18px", backgroundColor: "#0f1115", borderRadius: "18px", border: "1px solid rgba(255,255,255,0.10)" },
      brand: { textAlign: "center", marginBottom: "10px" },
      brandTitle: { color: "#FFC107", margin: 0, fontWeight: 700, fontSize: "24px", letterSpacing: "0.6px" },
      subtitle: { color: "#cfcfcf", fontSize: "13px", margin: "8px 0 0 0", lineHeight: 1.25, fontWeight: 400 },
      tabWrap, tabBtn, pillWrap, pillBtn,
      label: { fontSize: "12px", color: "#ddd", marginBottom: "6px", display: "block", fontWeight: 400 },
      input: inputBase, select: { ...inputBase, cursor: "pointer" }, inputWrap, eyeBtn,
      mainBtn, secondaryBtn, linkBtn,
      error: { backgroundColor: "#2b1414", padding: "10px 12px", borderRadius: "10px", fontSize: "12px", color: "#ff6b6b", marginBottom: "10px", border: "1px solid rgba(255,107,107,0.25)", textAlign: "center", fontWeight: 400 },
      info: { backgroundColor: "rgba(255,193,7,0.10)", padding: "10px 12px", borderRadius: "10px", fontSize: "12px", color: "#ffd56a", marginBottom: "10px", border: "1px solid rgba(255,193,7,0.20)", textAlign: "center", fontWeight: 400 },
      mutedText: { marginTop: "10px", textAlign: "center", color: "rgba(255,255,255,0.55)", fontSize: "11px", fontWeight: 400 },
      backLink: { position: "absolute", top: "18px", left: "20px", display: "flex", alignItems: "center", gap: "7px", color: "#000", textDecoration: "none", fontSize: "13px", fontWeight: 500, transition: "0.2s ease" },
      row2: { display: "flex", gap: "12px", flexWrap: "wrap" },
      colHalf: { flex: "1 1 160px", minWidth: "160px" },
      rowButtons: { display: "flex", gap: "10px", marginTop: "10px" },
      colBtn: { flex: 1 }
    };
  }, []);

  // ===== HANDLE LOGIN CORREGIDO =====
  const handleLogin = (e) => {
    e.preventDefault();
    resetMessages();
    const cleanEmail = loginData.email.trim().toLowerCase();
    const cleanPassword = loginData.password.trim();

    console.log("🔍 Intentando login con:", { email: cleanEmail, password: cleanPassword });

    // 1️⃣ Validar usuario del sistema (ADMIN/EMPLEADO)
    const user = validateUserCredentials(cleanEmail, cleanPassword);
    if (user) {
      console.log("✅ Usuario encontrado en sistema:", user);
      
      const role = roles.find((r) => r.IdRol === user.IdRol);
      const userData = {
        IdUsuario: user.IdUsuario,
        Nombre: user.Nombre.trim(),
        Correo: user.Correo.trim(),
        IdRol: user.IdRol,
        Estado: user.Estado,
        Permisos: user.Permisos || role?.Permisos || [],
        Rol: role?.Nombre?.trim() || "Usuario",
        userType: "admin"
      };

      console.log("✅ Datos de usuario preparados:", userData);
      
      // Llamar a onLogin del padre
      onLogin(userData);
      return;
    }

    // 2️⃣ Validar cliente
    const customerResult = validateCustomerCredentials(cleanEmail, cleanPassword);
    if (customerResult?.success) {
      console.log("✅ Cliente encontrado:", customerResult.customer);
      
      const customerWithStats = {
        ...customerResult.customer,
        Pedidos: customerResult.customer.Pedidos || 0,
        Devoluciones: customerResult.customer.Devoluciones || 0,
        userType: "cliente"
      };
      
      console.log("✅ Datos de cliente preparados:", customerWithStats);
      
      // Llamar a onLogin del padre
      onLogin(customerWithStats);
      return;
    }

    console.log("❌ Usuario no encontrado");
    setError("Correo o contraseña incorrectos");
  };

  // ===== HANDLE REGISTER =====
  const handleRegister = (e) => {
    e.preventDefault();
    resetMessages();
    
    if (registerData.password !== registerData.confirmPassword) {
      setError("Las claves no coinciden");
      return;
    }
    
    const result = registerCustomer({
      name: registerData.name,
      email: registerData.email,
      password: registerData.password,
      phone: registerData.documentNumber,
      address: "N/A"
    });
    
    if (result?.success) {
      console.log("✅ Cliente registrado:", result.customer);
      
      const newCustomerWithStats = {
        ...result.customer,
        Pedidos: 0,
        Devoluciones: 0,
        userType: "cliente"
      };
      
      // Llamar a onLogin del padre
      onLogin(newCustomerWithStats);
    } else {
      setError(result?.message || "No se pudo crear la cuenta");
    }
  };

  // ===== RECUPERACIÓN =====
  const goRecover = () => {
    resetMessages();
    setRecoverMethod("email");
    setRecoverTo("");
    setSentCode("");
    setTypedCode("");
    setNewPass("");
    setNewPass2("");
    setShowNewPass(false);
    setShowNewPass2(false);
    setView("recover");
  };

  const sendRecoveryCode = (e) => {
    e.preventDefault();
    resetMessages();
    if (!recoverTo.trim()) {
      setError(recoverMethod === "email" ? "Ingresa tu correo" : "Ingresa tu teléfono");
      return;
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setSentCode(code);
    setInfoMsg(`Código enviado por ${recoverMethod.toUpperCase()} (demo).`);
    setView("verify");
  };

  const verifyCode = (e) => {
    e.preventDefault();
    resetMessages();
    if (typedCode.trim().length !== 6) {
      setError("El código debe tener 6 dígitos");
      return;
    }
    if (typedCode.trim() !== sentCode) {
      setError("Código incorrecto");
      return;
    }
    setView("reset");
  };

  const saveNewPassword = (e) => {
    e.preventDefault();
    resetMessages();
    if (newPass.length < 6) {
      setError("La clave debe tener mínimo 6 caracteres");
      return;
    }
    if (newPass !== newPass2) {
      setError("Las claves no coinciden");
      return;
    }
    setInfoMsg("Clave actualizada (demo).");
    setView("auth");
    setActiveTab("login");
  };

  // ===== RENDER =====
  return (
    <div style={styles.page}>
      <Link to="/" style={styles.backLink} onMouseEnter={(e) => { e.currentTarget.style.color = "#FFC107"; e.currentTarget.style.transform = "translateX(3px)"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "#000"; e.currentTarget.style.transform = "translateX(0px)"; }}>
        <FaArrowLeft size={13} /> Volver a la tienda
      </Link>

      <div style={styles.card}>
        <div style={styles.brand}>
          <h2 style={styles.brandTitle}>GM CAPS</h2>
          <p style={styles.subtitle}>Bienvenido</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}
        {infoMsg && <div style={styles.info}>{infoMsg}</div>}

        {view === "auth" && (
          <>
            <div style={styles.tabWrap}>
              <button type="button" style={styles.tabBtn(activeTab === "login")} onClick={() => { setActiveTab("login"); resetMessages(); }}>Iniciar Sesión</button>
              <button type="button" style={styles.tabBtn(activeTab === "register")} onClick={() => { setActiveTab("register"); resetMessages(); }}>Registrarse</button>
            </div>

            {activeTab === "login" && (
              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: 12 }}>
                  <label style={styles.label}>Email</label>
                  <input 
                    style={styles.input} 
                    type="email" 
                    required 
                    placeholder="admin@mail.com" 
                    value={loginData.email} 
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} 
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={styles.label}>Clave</label>
                  <div style={styles.inputWrap}>
                    <input 
                      style={{ ...styles.input, paddingRight: "38px" }} 
                      type={showLoginPass ? "text" : "password"} 
                      required 
                      placeholder="••••••••" 
                      value={loginData.password} 
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} 
                    />
                    <button type="button" style={styles.eyeBtn} onClick={() => setShowLoginPass((s) => !s)}>
                      {showLoginPass ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>
                <button type="submit" style={styles.mainBtn}>Iniciar Sesión</button>
                <div style={{ textAlign: "center", marginTop: 10 }}>
                  <button type="button" style={styles.linkBtn} onClick={goRecover}>¿Olvidaste tu clave?</button>
                </div>
              </form>
            )}

            {activeTab === "register" && (
              <form onSubmit={handleRegister}>
                <div style={styles.row2}>
                  <div style={styles.colHalf}>
                    <label style={styles.label}>Tipo de Documento</label>
                    <select style={styles.select} value={registerData.documentType} onChange={(e) => setRegisterData({ ...registerData, documentType: e.target.value })}>
                      <option>Cédula de Identidad</option>
                      <option>Cédula de Extranjería</option>
                      <option>Pasaporte</option>
                      <option>NIT</option>
                    </select>
                  </div>
                  <div style={styles.colHalf}>
                    <label style={styles.label}>Número de Documento</label>
                    <input style={styles.input} type="text" required placeholder="123456789" value={registerData.documentNumber} onChange={(e) => setRegisterData({ ...registerData, documentNumber: e.target.value })} />
                  </div>
                </div>
                <div style={{ marginTop: 12, marginBottom: 12 }}>
                  <label style={styles.label}>Nombre Completo</label>
                  <input style={styles.input} type="text" required placeholder="Juan Pérez" value={registerData.name} onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={styles.label}>Correo</label>
                  <input style={styles.input} type="email" required placeholder="tu@email.com" value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={styles.label}>Clave</label>
                  <div style={styles.inputWrap}>
                    <input style={{ ...styles.input, paddingRight: "38px" }} type={showRegPass ? "text" : "password"} required placeholder="••••••••" value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} />
                    <button type="button" style={styles.eyeBtn} onClick={() => setShowRegPass((s) => !s)}>{showRegPass ? "🙈" : "👁️"}</button>
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={styles.label}>Confirmar Clave</label>
                  <div style={styles.inputWrap}>
                    <input style={{ ...styles.input, paddingRight: "38px" }} type={showRegPass2 ? "text" : "password"} required placeholder="••••••••" value={registerData.confirmPassword} onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })} />
                    <button type="button" style={styles.eyeBtn} onClick={() => setShowRegPass2((s) => !s)}>{showRegPass2 ? "🙈" : "👁️"}</button>
                  </div>
                </div>
                <button type="submit" style={styles.mainBtn}>Crear Cuenta</button>
                <div style={styles.mutedText}>Al registrarte, aceptas nuestros términos y condiciones</div>
              </form>
            )}
          </>
        )}

        {view === "recover" && (
          <>
            <div style={{ marginBottom: 8, color: "#fff", fontSize: 14, fontWeight: 400 }}>Recuperar clave</div>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, marginBottom: 10 }}>Elige cómo quieres recibir el código</div>
            <div style={styles.pillWrap}>
              <button type="button" style={styles.pillBtn(recoverMethod === "email")} onClick={() => { setRecoverMethod("email"); setRecoverTo(""); resetMessages(); }}>Email</button>
              <button type="button" style={styles.pillBtn(recoverMethod === "sms")} onClick={() => { setRecoverMethod("sms"); setRecoverTo(""); resetMessages(); }}>SMS</button>
              <button type="button" style={styles.pillBtn(recoverMethod === "whatsapp")} onClick={() => { setRecoverMethod("whatsapp"); setRecoverTo(""); resetMessages(); }}>WhatsApp</button>
            </div>
            <form onSubmit={sendRecoveryCode}>
              <div style={{ marginBottom: 12 }}>
                <label style={styles.label}>{recoverMethod === "email" ? "Correo" : "Teléfono"}</label>
                <input style={styles.input} type={recoverMethod === "email" ? "email" : "tel"} placeholder={recoverMethod === "email" ? "tu@email.com" : "3001234567"} value={recoverTo} onChange={(e) => setRecoverTo(e.target.value)} required />
              </div>
              <div style={styles.rowButtons}>
                <div style={styles.colBtn}><button type="submit" style={styles.mainBtn}>Enviar código</button></div>
                <div style={styles.colBtn}><button type="button" style={styles.secondaryBtn} onClick={() => { setView("auth"); setActiveTab("login"); resetMessages(); }}>Cancelar</button></div>
              </div>
            </form>
          </>
        )}

        {view === "verify" && (
          <>
            <div style={{ marginBottom: 8, color: "#fff", fontSize: 14, fontWeight: 400 }}>Verificar código</div>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, marginBottom: 10 }}>Ingresa el código de 6 dígitos</div>
            <form onSubmit={verifyCode}>
              <div style={{ marginBottom: 12 }}>
                <label style={styles.label}>Código</label>
                <input style={styles.input} inputMode="numeric" maxLength={6} placeholder="123456" value={typedCode} onChange={(e) => setTypedCode(e.target.value.replace(/\D/g, ""))} required />
              </div>
              <div style={styles.rowButtons}>
                <div style={styles.colBtn}><button type="submit" style={styles.mainBtn}>Confirmar</button></div>
                <div style={styles.colBtn}><button type="button" style={styles.secondaryBtn} onClick={() => { setView("recover"); resetMessages(); }}>Cancelar</button></div>
              </div>
            </form>
          </>
        )}

        {view === "reset" && (
          <>
            <div style={{ marginBottom: 8, color: "#fff", fontSize: 14, fontWeight: 400 }}>Nueva clave</div>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, marginBottom: 10 }}>Crea tu nueva clave</div>
            <form onSubmit={saveNewPassword}>
              <div style={{ marginBottom: 12 }}>
                <label style={styles.label}>Nueva clave</label>
                <div style={styles.inputWrap}>
                  <input style={{ ...styles.input, paddingRight: "38px" }} type={showNewPass ? "text" : "password"} placeholder="••••••••" value={newPass} onChange={(e) => setNewPass(e.target.value)} required />
                  <button type="button" style={styles.eyeBtn} onClick={() => setShowNewPass((s) => !s)}>{showNewPass ? "🙈" : "👁️"}</button>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={styles.label}>Confirmar clave</label>
                <div style={styles.inputWrap}>
                  <input style={{ ...styles.input, paddingRight: "38px" }} type={showNewPass2 ? "text" : "password"} placeholder="••••••••" value={newPass2} onChange={(e) => setNewPass2(e.target.value)} required />
                  <button type="button" style={styles.eyeBtn} onClick={() => setShowNewPass2((s) => !s)}>{showNewPass2 ? "🙈" : "👁️"}</button>
                </div>
              </div>
              <div style={styles.rowButtons}>
                <div style={styles.colBtn}><button type="submit" style={styles.mainBtn}>Guardar</button></div>
                <div style={styles.colBtn}><button type="button" style={styles.secondaryBtn} onClick={() => { setView("auth"); setActiveTab("login"); resetMessages(); }}>Cancelar</button></div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;