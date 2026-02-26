// src/pages/Profile.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCheckCircle,
  FaEdit, FaSave, FaShieldAlt, FaCamera, FaTrash, FaShoppingBag,
  FaExchangeAlt, FaMoneyBill, FaTachometerAlt
} from "react-icons/fa";
// ELIMINAMOS useNavigate - ya no lo necesitamos

const Profile = () => {
  // ELIMINAMOS const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState({ open: false, text: "" });
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "",
    department: "", city: "", address: "",
  });
  const [orderQuery, setOrderQuery] = useState("");
  const [returnQuery, setReturnQuery] = useState("");
  const [orderItemQuery, setOrderItemQuery] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const fileInputRef = useRef(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showReturnDetails, setShowReturnDetails] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageModalSrc, setImageModalSrc] = useState("");

  // ======= Cargar usuario - AHORA USA WINDOW.LOCATION =======
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      // Si no hay usuario, redirigir al login con window.location
      window.location.href = "/login";
      return;
    }
    try {
      const parsedUser = JSON.parse(savedUser);
      // YA NO REDIRIGIMOS A LOS ADMIN - AHORA PUEDEN VER PERFIL
      setUser(parsedUser);
      setFormData({
        name: parsedUser.Nombre || parsedUser.name || "",
        email: parsedUser.Correo || parsedUser.email || "",
        phone: parsedUser.Telefono || parsedUser.phone || "",
        department: parsedUser.Departamento || parsedUser.department || "",
        city: parsedUser.Ciudad || parsedUser.city || "",
        address: parsedUser.Direccion || parsedUser.address || "",
      });
      setAvatarUrl(parsedUser.avatarUrl || "");
    } catch (error) {
      console.error("Error parsing user:", error);
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  }, []); // ELIMINAMOS navigate de las dependencias

  const showTopToast = (text) => {
    setToast({ open: true, text });
    setTimeout(() => setToast({ open: false, text: "" }), 3200);
  };

  const handleEditClick = () => setIsEditing(true);

  const handleSaveClick = () => {
    const updatedUser = {
      ...user,
      Nombre: formData.name, name: formData.name,
      Correo: formData.email, email: formData.email,
      Telefono: formData.phone, phone: formData.phone,
      Departamento: formData.department, department: formData.department,
      Ciudad: formData.city, city: formData.city,
      Direccion: formData.address, address: formData.address,
      avatarUrl: avatarUrl || "",
      Pedidos: user?.Pedidos ?? 0,
      Devoluciones: user?.Devoluciones ?? 0,
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsEditing(false);
    showTopToast("Cambios guardados correctamente.");
  };

  const handleChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  
  const getAvatarInitial = () => {
    const name = (formData.name || user?.Nombre || user?.name || "").trim();
    const email = (formData.email || user?.Correo || user?.email || "").trim();
    if (name) return name.charAt(0).toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return "U";
  };
  
  const openFilePicker = () => fileInputRef.current?.click();
  
  const onPickAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(reader.result);
      setShowAvatarMenu(false);
    };
    reader.readAsDataURL(file);
  };
  
  const removeAvatar = () => {
    setAvatarUrl("");
    setShowAvatarMenu(false);
  };

  // ======= Verificar si es admin para mostrar botón de dashboard =======
  const isAdmin = user?.userType === "admin" || user?.IdRol === 1;

  // ======= Datos ejemplo =======
  const placeholderImg = "https://images.unsplash.com/photo-1520975693411-b25d5d2c2b21?auto=format&fit=crop&w=240&q=60";
  
  const allOrders = useMemo(() => [
    { id: "PED-001", date: "15 Dic 2025", products: 3, total: "$185.000", status: "Completado", statusColor: "#10b981",
      items: [
        { id: "1", name: "Gorra Yankees NY", price: "$65.000", size: "M", status: "Completado", image: placeholderImg },
        { id: "2", name: "Gorra Lakers LA", price: "$60.000", size: "L", status: "Completado", image: placeholderImg },
        { id: "3", name: "Gorra Bulls Chicago", price: "$60.000", size: "M", status: "Completado", image: placeholderImg },
      ],
      shippingAddress: "Cra 43A #14-15, Medellín, Antioquia", paymentMethod: "Tarjeta de Crédito",
    },
  ], []);
  
  const allReturns = useMemo(() => [
    { id: "DEV-001", orderId: "PED-001", date: "12 Dic 2025", productName: "Gorra Yankees NY", size: "M",
      reason: "Talla incorrecta", status: "Aprobado", statusColor: "#10b981", amount: "$62.500", image: placeholderImg,
    },
  ], []);
  
  const completedOrders = useMemo(() => allOrders.filter((o) => o.status === "Completado"), [allOrders]);
  const approvedAndRejectedReturns = useMemo(() => allReturns.filter((r) => r.status === "Aprobado" || r.status === "Rechazado"), [allReturns]);
  
  const filteredOrders = useMemo(() => {
    const q = orderQuery.trim().toLowerCase();
    if (!q) return completedOrders;
    return completedOrders.filter((o) => o.id.toLowerCase().includes(q));
  }, [completedOrders, orderQuery]);
  
  const filteredReturns = useMemo(() => {
    const q = returnQuery.trim().toLowerCase();
    if (!q) return approvedAndRejectedReturns;
    return approvedAndRejectedReturns.filter((r) => r.id.toLowerCase().includes(q));
  }, [approvedAndRejectedReturns, returnQuery]);
  
  const filteredOrderItems = useMemo(() => {
    const items = selectedOrder?.items || [];
    const q = orderItemQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => it.name.toLowerCase().includes(q));
  }, [selectedOrder, orderItemQuery]);

  const handleOrderClick = (order) => { setSelectedOrder(order); setOrderItemQuery(""); setShowOrderDetails(true); };
  
  const handleReturnClick = (product, order) => {
    setSelectedProduct({ ...product, orderId: order.id, orderDate: order.date, customerName: formData.name || user?.Nombre || user?.name || "Cliente" });
    setReturnReason(""); setShowReturnForm(true);
  };
  
  const handleReturnSubmit = (e) => {
    e.preventDefault();
    if (!returnReason.trim()) { showTopToast("Debes ingresar el motivo para solicitar."); return; }
    setShowReturnForm(false); setReturnReason("");
    showTopToast("Solicitud enviada. Gracias por tu comprensión, puedes estar atento en los próximos días.");
  };
  
  const handleReturnDetailsOpen = (ret) => { setSelectedReturn(ret); setShowReturnDetails(true); };
  
  const openImage = (src) => { if (!src) return; setImageModalSrc(src); setShowImageModal(true); };

  // ======= UI Styles =======
  const niceInput = { width: "100%", padding: "7px 10px", borderRadius: "10px", border: "1px solid rgba(148,163,184,0.26)", backgroundColor: "rgba(15,23,42,0.22)", color: "#FFFFFF", fontSize: "0.85rem", outline: "none" };
  const boxSearchInput = { height: "34px", width: "220px", padding: "0 10px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.16)", backgroundColor: "rgba(3,7,18,0.35)", color: "#E5E7EB", outline: "none", fontSize: "0.85rem" };
  const countPill = { backgroundColor: "transparent", color: "#FFC107", fontSize: "0.82rem", padding: "0.26rem 0.75rem", borderRadius: "999px", fontWeight: 700, border: "1px solid rgba(255,255,255,0.22)" };
  const cardOnlyBorder = { padding: "0.8rem", backgroundColor: "transparent", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.14)", display: "flex", alignItems: "center", gap: "0.8rem", cursor: "pointer", minHeight: "88px" };
  const list3Items = { display: "flex", flexDirection: "column", gap: "0.8rem", maxHeight: "310px", overflowY: "auto", paddingRight: "6px" };
  const readRow = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", padding: "5px 0" };
  const label = { color: "#94A3B8", fontSize: "0.78rem", minWidth: "72px" };
  const value = { color: "#FFFFFF", fontSize: "0.78rem", textAlign: "right", display: "flex", alignItems: "center", gap: "6px", maxWidth: "135px", justifyContent: "flex-end" };

  // ======= Acceso denegado =======
  if (!user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#030712", color: "#fff", fontFamily: "Segoe UI, sans-serif", padding: "1rem" }}>
        <div style={{ backgroundColor: "#111827", padding: "2rem", borderRadius: "12px", textAlign: "center", width: "300px" }}>
          <h2 style={{ color: "#FFC107", marginBottom: "10px" }}>Acceso Denegado</h2>
          <p style={{ color: "#CBD5E1", marginBottom: "15px" }}>Debes iniciar sesión para ver tu perfil.</p>
          <button onClick={() => window.location.href = "/login"} style={{ marginTop: "10px", backgroundColor: "#FFC107", color: "#000", padding: "8px 16px", borderRadius: "10px", fontWeight: 800, border: "none", cursor: "pointer" }}>Iniciar Sesión</button>
        </div>
      </div>
    );
  }

  // ======= Render =======
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#030712", fontFamily: "Segoe UI, sans-serif", display: "flex", justifyContent: "center", padding: "80px 1rem 40px" }}>
      <div style={{ display: "flex", gap: "1rem", maxWidth: "980px", width: "100%", padding: "0 0.5rem", flexWrap: "wrap" }}>
        {/* ================== COLUMNA IZQUIERDA ================== */}
        <div style={{ flex: "0 0 260px", backgroundColor: "#111827", borderRadius: "12px", padding: "1.1rem 0.95rem", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.3)", position: "relative", overflow: "hidden", width: "100%", maxWidth: "360px" }}>
          
          {/* BOTÓN DE DASHBOARD PARA ADMIN - AHORA USA WINDOW.LOCATION */}
          {isAdmin && (
            <button 
              onClick={() => window.location.href = "/admin/AdminDashboard"} 
              style={{ 
                position: "absolute", 
                top: "10px", 
                left: "10px", 
                height: "32px", 
                padding: "0 12px", 
                borderRadius: "10px", 
                backgroundColor: "#FFC107", 
                color: "#000", 
                border: "none", 
                cursor: "pointer", 
                display: "flex", 
                alignItems: "center", 
                gap: "6px", 
                fontWeight: 800, 
                fontSize: "0.78rem" 
              }}
            >
              <FaTachometerAlt size={12} /> Dashboard
            </button>
          )}
          
          {!isEditing ? (
            <button onClick={handleEditClick} title="Editar" style={{ position: "absolute", top: "10px", right: "10px", height: "32px", padding: "0 12px", borderRadius: "10px", backgroundColor: "#334155", color: "#FFF", border: "1px solid rgba(148,163,184,0.15)", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontWeight: 800, fontSize: "0.78rem" }}><FaEdit size={12} /> Editar</button>
          ) : (
            <button onClick={handleSaveClick} title="Guardar" style={{ position: "absolute", top: "10px", right: "10px", height: "32px", padding: "0 12px", borderRadius: "10px", backgroundColor: "#22C55E", color: "#000", border: "1px solid rgba(34,197,94,0.35)", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontWeight: 900, fontSize: "0.78rem" }}><FaSave size={12} /> Guardar</button>
          )}
          
          {/* Avatar */}
          <div style={{ position: "relative", marginTop: "6px", marginBottom: "0.75rem" }}>
            <div style={{ width: "58px", height: "58px", borderRadius: "50%", backgroundColor: avatarUrl ? "transparent" : "#FFC107", color: "#000", fontWeight: 900, fontSize: "1.55rem", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: "0 4px 10px rgba(0,0,0,0.35)" }}>
              {avatarUrl ? <img src={avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : getAvatarInitial()}
            </div>
            <button onClick={() => setShowAvatarMenu((v) => !v)} title="Opciones de foto" style={{ position: "absolute", right: "-6px", bottom: "-6px", width: "28px", height: "28px", borderRadius: "10px", backgroundColor: "#111827", border: "1px solid rgba(255,193,7,0.35)", color: "#FFC107", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><FaCamera size={12} /></button>
            {showAvatarMenu && (
              <div style={{ position: "absolute", top: "62px", right: "-8px", width: "160px", backgroundColor: "#0B1220", border: "1px solid rgba(148,163,184,0.18)", borderRadius: "12px", boxShadow: "0 10px 22px rgba(0,0,0,0.45)", padding: "8px", zIndex: 20 }}>
                <button onClick={openFilePicker} style={{ width: "100%", border: "none", background: "transparent", color: "#E5E7EB", padding: "8px 10px", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", fontSize: "0.82rem" }}><FaCamera color="#FFC107" /> Subir foto</button>
                <button onClick={removeAvatar} style={{ width: "100%", border: "none", background: "transparent", color: "#E5E7EB", padding: "8px 10px", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", fontSize: "0.82rem" }}><FaTrash color="#94A3B8" /> Quitar foto</button>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={onPickAvatar} style={{ display: "none" }} />
          </div>
          
          <h3 style={{ color: "#FFFFFF", margin: "0 0 0.25rem 0", fontSize: "0.98rem", fontWeight: 800 }}>
            {formData.name || user.Nombre || user.name || "Usuario"}
            {isAdmin && <span style={{ marginLeft: "8px", fontSize: "0.7rem", backgroundColor: "#FFC107", color: "#000", padding: "2px 6px", borderRadius: "12px" }}>ADMIN</span>}
          </h3>
          <p style={{ color: "#CBD5E1", fontSize: "0.78rem", margin: "0 0 0.9rem 0", textAlign: "center" }}>{formData.email || user.Correo || user.email || "Sin correo"}</p>
          
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1.05rem" }}>
            <div style={{ textAlign: "left", width: "100%" }}>
              <h3 style={{ color: "#FFC107", fontSize: "0.92rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "6px", margin: "0 0 0.6rem 0" }}><FaUser size={12} /> Información Personal</h3>
              {!isEditing ? (
                <div style={{ display: "grid", gap: "0.58rem" }}>
                  <div style={readRow}><span style={label}>Nombre</span><span style={value}>{formData.name || "—"}</span></div>
                  <div style={readRow}><span style={label}>Email</span><span style={value}><FaEnvelope size={10} color="#FFC107" />{formData.email || "—"}</span></div>
                  <div style={readRow}><span style={label}>Teléfono</span><span style={value}><FaPhone size={10} color="#4CAF50" />{formData.phone || "—"}</span></div>
                  <div style={readRow}><span style={label}>Depto.</span><span style={value}>{formData.department || "—"}</span></div>
                  <div style={readRow}><span style={label}>Ciudad</span><span style={value}>{formData.city || "—"}</span></div>
                  <div style={readRow}><span style={label}>Dirección</span><span style={value}><FaMapMarkerAlt size={10} color="#4CAF50" />{formData.address || "—"}</span></div>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  <input name="name" value={formData.name} onChange={handleChange} style={niceInput} placeholder="Nombre" />
                  <input name="email" value={formData.email} onChange={handleChange} style={niceInput} placeholder="Email" />
                  <input name="phone" value={formData.phone} onChange={handleChange} style={niceInput} placeholder="Teléfono" />
                  <input name="department" value={formData.department} onChange={handleChange} style={niceInput} placeholder="Departamento" />
                  <input name="city" value={formData.city} onChange={handleChange} style={niceInput} placeholder="Ciudad" />
                  <input name="address" value={formData.address} onChange={handleChange} style={niceInput} placeholder="Dirección" />
                </div>
              )}
            </div>
            
            <div style={{ textAlign: "left", width: "100%" }}>
              <h3 style={{ color: "#FFC107", fontSize: "0.92rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "6px", margin: "0 0 0.6rem 0" }}><FaShieldAlt size={12} /> Detalles de Cuenta</h3>
              <div style={{ display: "grid", gap: "0.58rem" }}>
                <div style={readRow}><span style={label}>Registro</span><span style={value}><FaCheckCircle size={10} color="#4CAF50" />{user.FechaRegistro || "—"}</span></div>
                <div style={readRow}><span style={label}>Rol</span><span style={{ backgroundColor: "#FFC107", color: "#000", fontSize: "0.7rem", padding: "2px 7px", borderRadius: "10px", fontWeight: 800 }}>{user.Rol || (isAdmin ? "Administrador" : "Cliente")}</span></div>
                <div style={readRow}><span style={label}>Devoluc.</span><span style={{ backgroundColor: "#FFC107", color: "#000", fontSize: "0.7rem", padding: "2px 7px", borderRadius: "10px", fontWeight: 800 }}>{user.Devoluciones || "0"} devoluciones</span></div>
                <div style={readRow}><span style={label}>Pedidos</span><span style={{ backgroundColor: "#FFC107", color: "#000", fontSize: "0.7rem", padding: "2px 7px", borderRadius: "10px", fontWeight: 800 }}>{user.Pedidos || "0"} pedidos</span></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* ================== COLUMNA DERECHA ================== */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem", minWidth: "260px", width: "100%" }}>
          {/* Pedidos */}
          <div style={{ backgroundColor: "#111827", borderRadius: "8px", padding: "1rem", boxShadow: "0 4px 8px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", gap: "12px", flexWrap: "wrap" }}>
              <div><h3 style={{ color: "#FFFFFF", fontSize: "1rem", fontWeight: 700, margin: 0 }}>Pedidos Realizados</h3><p style={{ color: "#94A3B8", fontSize: "0.8rem", margin: 0 }}>Total de compras</p></div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <input value={orderQuery} onChange={(e) => setOrderQuery(e.target.value)} placeholder="Buscar..." style={boxSearchInput} />
                <div style={countPill}>{filteredOrders.length} pedidos</div>
              </div>
            </div>
            <div style={list3Items}>
              {filteredOrders.map((order) => (
                <div key={order.id} onClick={() => handleOrderClick(order)} style={cardOnlyBorder}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}><FaShoppingBag size={18} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}><p style={{ color: "#f8fafc", fontWeight: 700, marginBottom: "0.25rem", fontSize: "0.9rem" }}>{order.id}</p><div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}><span style={{ color: "#94a3b8", fontSize: "0.78rem" }}>{order.date}</span><span style={{ color: "#94a3b8", fontSize: "0.78rem" }}>{order.products} productos</span></div></div>
                  <div style={{ textAlign: "right" }}><span style={{ backgroundColor: order.statusColor, color: "#000", fontSize: "0.72rem", padding: "0.22rem 0.65rem", borderRadius: "999px", fontWeight: 800 }}>{order.status}</span></div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Devoluciones */}
          <div style={{ backgroundColor: "#111827", borderRadius: "8px", padding: "1rem", boxShadow: "0 4px 8px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", gap: "12px", flexWrap: "wrap" }}>
              <div><h3 style={{ color: "#FFFFFF", fontSize: "1rem", fontWeight: 700, margin: 0 }}>Devoluciones</h3><p style={{ color: "#94A3B8", fontSize: "0.8rem", margin: 0 }}>Historial de devoluciones</p></div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <input value={returnQuery} onChange={(e) => setReturnQuery(e.target.value)} placeholder="Buscar..." style={boxSearchInput} />
                <div style={countPill}>{filteredReturns.length} devoluciones</div>
              </div>
            </div>
            <div style={list3Items}>
              {filteredReturns.map((ret) => (
                <div key={ret.id} onClick={() => handleReturnDetailsOpen(ret)} style={{ ...cardOnlyBorder, cursor: "pointer" }}>
                  <button onClick={(e) => { e.stopPropagation(); openImage(ret.image); }} title="Ver imagen" style={{ width: "44px", height: "44px", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.14)", background: "transparent", padding: 0, cursor: "pointer", flex: "0 0 44px" }}><img src={ret.image} alt={ret.productName} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /></button>
                  <div style={{ flex: 1, minWidth: 0 }}><p style={{ color: "#f8fafc", fontWeight: 700, marginBottom: "0.25rem", fontSize: "0.9rem" }}>{ret.productName} <span style={{ color: "#94a3b8", fontWeight: 600 }}>· Talla {ret.size}</span></p><div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}><span style={{ color: "#94a3b8", fontSize: "0.78rem" }}>{ret.id} · Pedido {ret.orderId}</span><span style={{ color: "#94a3b8", fontSize: "0.78rem" }}>{ret.date}</span></div><p style={{ color: "#94a3b8", fontSize: "0.78rem", marginTop: "0.35rem" }}>{ret.reason}</p></div>
                  <div style={{ textAlign: "right" }}><span style={{ backgroundColor: ret.statusColor, color: "#000", fontSize: "0.72rem", padding: "0.22rem 0.65rem", borderRadius: "999px", fontWeight: 800 }}>{ret.status}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================== MODAL IMAGEN ================== */}
      {showImageModal && (
        <div onClick={() => setShowImageModal(false)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.78)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: "16px" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: "720px", width: "100%" }}>
            <img src={imageModalSrc} alt="Imagen" style={{ width: "100%", maxHeight: "82vh", objectFit: "contain", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.12)", backgroundColor: "#0b1220", display: "block" }} />
          </div>
        </div>
      )}

      {/* ================== MODAL: DETALLE DEVOLUCIÓN ================== */}
      {showReturnDetails && selectedReturn && (
        <div onClick={() => setShowReturnDetails(false)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200, padding: "14px" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: "#111827", borderRadius: "14px", width: "92%", maxWidth: "560px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.10)", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.18), 0 10px 10px -5px rgba(0,0,0,0.18)" }}>
            <div style={{ padding: "1rem 1.2rem 0.75rem" }}>
              <div style={{ color: "#FFFFFF", fontSize: "1.15rem", fontWeight: 800, marginBottom: "6px" }}>Detalles de la Devolución</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 14px", alignItems: "center", color: "#CBD5E1", fontSize: "0.86rem" }}>
                <span style={{ color: "#94A3B8" }}>{selectedReturn.id}</span>
                <span style={{ color: "#94A3B8" }}>Pedido {selectedReturn.orderId}</span>
                <span style={{ color: "#94A3B8" }}>{selectedReturn.date}</span>
                <span style={{ color: "#E5E7EB" }}>{selectedReturn.productName} · Talla {selectedReturn.size}</span>
                <span style={{ color: "#FFC107", fontWeight: 800 }}>{selectedReturn.amount}</span>
                <span style={{ backgroundColor: selectedReturn.statusColor, color: "#000", fontSize: "0.74rem", padding: "0.18rem 0.55rem", borderRadius: "999px", fontWeight: 800 }}>{selectedReturn.status}</span>
              </div>
            </div>
            <div style={{ padding: "0 1.2rem 1.1rem" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <button onClick={() => openImage(selectedReturn.image)} style={{ width: "54px", height: "54px", borderRadius: "14px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.14)", background: "transparent", padding: 0, cursor: "pointer", flex: "0 0 54px" }} title="Ver imagen">
                  <img src={selectedReturn.image} alt={selectedReturn.productName} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </button>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#94A3B8", fontSize: "0.78rem", marginBottom: "6px" }}>Motivo</div>
                  <div style={{ color: "#E5E7EB", fontSize: "0.95rem", fontWeight: 600 }}>{selectedReturn.reason}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================== MODAL: DETALLE PEDIDO ================== */}
      {showOrderDetails && selectedOrder && (
        <div onClick={() => setShowOrderDetails(false)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: "14px" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: "#111827", borderRadius: "14px", width: "92%", maxWidth: "640px", height: "86vh", maxHeight: "86vh", overflow: "hidden", display: "flex", flexDirection: "column", border: "1px solid rgba(255,255,255,0.10)", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.18), 0 10px 10px -5px rgba(0,0,0,0.18)" }}>
            <div style={{ padding: "1rem 1.2rem 0.75rem" }}>
              <div style={{ color: "#FFFFFF", fontSize: "1.2rem", fontWeight: 800, marginBottom: "6px" }}>Detalles del Pedido</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 14px", alignItems: "center", fontSize: "0.88rem" }}>
                <span style={{ color: "#94A3B8" }}>Cliente: </span>
                <span style={{ color: "#E5E7EB", fontWeight: 700 }}>{formData.name || user?.Nombre || user?.name || "Cliente"}</span>
                <span style={{ color: "#94A3B8" }}>{selectedOrder.date}</span>
                <span style={{ color: "#FFC107", fontWeight: 800 }}>{selectedOrder.total}</span>
                <span style={{ backgroundColor: selectedOrder.statusColor, color: "#000", fontSize: "0.74rem", padding: "0.18rem 0.55rem", borderRadius: "999px", fontWeight: 800 }}>{selectedOrder.status}</span>
              </div>
            </div>
            <div className="orderModalBody" style={{ padding: "0.75rem 1.2rem 1rem", overflowY: "auto", flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", marginBottom: "0.8rem", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#E5E7EB", fontWeight: 800 }}>
                  <FaShoppingBag color="#FFC107" />
                  Productos ({selectedOrder.items.length})
                </div>
                <input value={orderItemQuery} onChange={(e) => setOrderItemQuery(e.target.value)} placeholder="Buscar..." style={{ height: "34px", width: "220px", padding: "0 10px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.16)", backgroundColor: "rgba(3,7,18,0.35)", color: "#E5E7EB", outline: "none", fontSize: "0.85rem" }} />
              </div>
              <div className="orderProductsScroll" style={{ overflowY: "auto", paddingRight: "6px" }}>
                {filteredOrderItems.map((item) => (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "0.85rem 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    <button onClick={() => openImage(item.image)} title="Ver imagen" style={{ width: "46px", height: "46px", borderRadius: "14px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.14)", background: "transparent", padding: 0, cursor: "pointer", flex: "0 0 46px" }}>
                      <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: "#FFFFFF", fontWeight: 700, fontSize: "0.98rem", lineHeight: 1.2 }}>{item.name}</div>
                      <div style={{ color: "#94A3B8", fontSize: "0.86rem", marginTop: "4px" }}>Cantidad: 1 · Talla: {item.size}</div>
                    </div>
                    <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                      <div style={{ color: "#E5E7EB", fontWeight: 700 }}>{item.price}</div>
                      <button onClick={() => handleReturnClick(item, selectedOrder)} style={{ backgroundColor: "transparent", color: "#DC2626", border: "1px solid #DC2626", padding: "0.28rem 0.6rem", borderRadius: "10px", fontWeight: 700, cursor: "pointer", fontSize: "0.78rem", lineHeight: 1.1 }}>Solicitar devolución</button>
                    </div>
                  </div>
                ))}
                {filteredOrderItems.length === 0 && <div style={{ padding: "0.9rem 0", color: "#94A3B8", fontSize: "0.9rem" }}>No hay resultados para tu búsqueda.</div>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "14px" }}>
                <div>
                  <div style={{ color: "#FFC107", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}><FaMapMarkerAlt /> Dirección</div>
                  <div style={{ color: "#CBD5E1", fontSize: "0.88rem" }}>{selectedOrder.shippingAddress}</div>
                </div>
                <div>
                  <div style={{ color: "#FFC107", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}><FaMoneyBill /> Pago</div>
                  <div style={{ color: "#CBD5E1", fontSize: "0.88rem" }}>{selectedOrder.paymentMethod}</div>
                </div>
              </div>
            </div>
            <div style={{ padding: "0.9rem 1.2rem 1.1rem", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => window.print()} style={{ backgroundColor: "#FFC107", color: "#000", border: "none", padding: "0.48rem 0.95rem", borderRadius: "12px", fontWeight: 900, fontSize: "0.9rem", cursor: "pointer" }}>Descargar Factura</button>
            </div>
          </div>
        </div>
      )}

      {/* ================== MODAL: SOLICITAR DEVOLUCIÓN ================== */}
      {showReturnForm && selectedProduct && (
        <div onClick={() => setShowReturnForm(false)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1300, padding: "14px" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: "#111827", borderRadius: "14px", width: "92%", maxWidth: "680px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.10)", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.18), 0 10px 10px -5px rgba(0,0,0,0.18)" }}>
            <div style={{ padding: "1rem 1.2rem 0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "26px", height: "26px", borderRadius: "9px", backgroundColor: "rgba(255,193,7,0.16)", border: "1px solid rgba(255,193,7,0.30)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFC107" }}><FaExchangeAlt size={12} /></div>
                <div style={{ color: "#FFFFFF", fontSize: "1.15rem", fontWeight: 800 }}>Solicitar Devolución</div>
              </div>
            </div>
            <div style={{ padding: "0.75rem 1.2rem 1.1rem" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 14px", alignItems: "center", marginBottom: "12px", fontSize: "0.88rem" }}>
                <span style={{ color: "#94A3B8" }}>Cliente: </span>
                <span style={{ color: "#E5E7EB", fontWeight: 700 }}>{selectedProduct.customerName}</span>
                <span style={{ color: "#94A3B8" }}>Pedido </span>
                <span style={{ color: "#E5E7EB", fontWeight: 700 }}>{selectedProduct.orderId}</span>
                <span style={{ color: "#94A3B8" }}>Producto </span>
                <span style={{ color: "#E5E7EB", fontWeight: 700 }}>{selectedProduct.name}</span>
                <span style={{ color: "#94A3B8" }}>Talla </span>
                <span style={{ color: "#E5E7EB", fontWeight: 700 }}>{selectedProduct.size}</span>
                <span style={{ color: "#FFC107", fontWeight: 900 }}>{selectedProduct.price}</span>
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <button onClick={() => openImage(selectedProduct.image)} title="Ver imagen" style={{ width: "54px", height: "54px", borderRadius: "14px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.14)", background: "transparent", padding: 0, cursor: "pointer", flex: "0 0 54px" }}>
                  <img src={selectedProduct.image} alt={selectedProduct.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </button>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#E5E7EB", fontWeight: 800, marginBottom: "8px" }}>Motivo</div>
                  <textarea value={returnReason} onChange={(e) => setReturnReason(e.target.value)} placeholder="Escribe el motivo de la devolución" style={{ width: "100%", padding: "0.85rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.18)", backgroundColor: "rgba(3,7,18,0.28)", color: "#FFFFFF", fontSize: "0.92rem", height: "92px", resize: "none", outline: "none" }} />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "14px" }}>
                <button onClick={() => setShowReturnForm(false)} style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "#E5E7EB", border: "1px solid rgba(255,255,255,0.14)", padding: "0.42rem 0.9rem", borderRadius: "12px", fontWeight: 700, cursor: "pointer", fontSize: "0.86rem" }}>Cancelar</button>
                <button onClick={handleReturnSubmit} style={{ backgroundColor: "#FFC107", color: "#000", border: "none", padding: "0.42rem 0.95rem", borderRadius: "12px", fontWeight: 900, cursor: "pointer", fontSize: "0.86rem" }}>Solicitar devolución</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.open && (
        <div style={{ position: "fixed", top: "18px", left: "50%", transform: "translateX(-50%)", backgroundColor: "#111827", color: "#FFFFFF", padding: "12px 16px", borderRadius: "12px", boxShadow: "0 10px 22px rgba(0,0,0,0.35)", border: "1px solid rgba(255,193,7,0.45)", zIndex: 9999, display: "flex", alignItems: "center", gap: "10px", animation: "slideDown 0.35s ease-out", maxWidth: "92vw" }}>
          <span style={{ fontSize: "0.9rem", color: "#E5E7EB" }}>{toast.text}</span>
          <button onClick={() => setToast({ open: false, text: "" })} style={{ backgroundColor: "#FFC107", color: "#000", border: "none", padding: "4px 10px", borderRadius: "10px", fontSize: "0.78rem", fontWeight: 900, cursor: "pointer", whiteSpace: "nowrap" }}>Ok</button>
        </div>
      )}
      <style>{`@keyframes slideDown { from { transform: translateX(-50%) translateY(-18px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } } .orderModalBody::-webkit-scrollbar { width: 0px; height: 0px; } .orderModalBody { scrollbar-width: none; -ms-overflow-style: none; } .orderProductsScroll::-webkit-scrollbar { width: 0px; height: 0px; } .orderProductsScroll { scrollbar-width: none; -ms-overflow-style: none; } @media (max-width: 920px) { .orderModalBody { padding: 0 .75rem 1rem 1rem !important; } }`}</style>
    </div>
  );
};

export default Profile;