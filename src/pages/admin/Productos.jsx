// src/pages/admin/ProductosPage.jsx
import React, { useState, useEffect } from "react";
import EntityTable from "../../components/EntityTable";
import SearchInput from "../../components/SearchInput";
import Alert from "../../components/Alert";
import UniversalModal from "../../components/UniversalModal";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import { 
  initialProducts, 
  initialColors,
  initialSizes 
} from "../../data";

const ProductosPage = () => {
  // ====== ESTADOS ======
  const [productos, setProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);
  const [alert, setAlert] = useState({ show: false, message: "", type: "success" });
  const [filterActive, setFilterActive] = useState(null);

  // Modal para ver/editar producto
  const [modalState, setModalState] = useState({ isOpen: false, mode: "view", producto: null });
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Modal para eliminar producto
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, producto: null });

  // Estados para tallas, colores y categorías
  const [allTallas, setAllTallas] = useState([]);
  const [allColores, setAllColores] = useState([]);
  const [allCategorias, setAllCategorias] = useState([]);

  // ====== COLUMNAS TABLA ======
  const columns = [
    { header: "Nombre", field: "nombre", width: "140px" },
    { header: "Categoría", field: "categoria", width: "110px" },
    { header: "Precio", field: "precio", width: "80px" },
    { header: "Stock", field: "stock", width: "60px" },
  ].map((col) => ({
    ...col,
    render: (item) => {
      let value = item[col.field] ?? "—";
      let color = "#fff";
      let fontWeight = "400";

      if (col.field === "nombre") {
        fontWeight = "500";
      } else if (col.field === "precio" || col.field === "stock") {
        fontWeight = "600";
      }

      if (col.field === "precio") {
        value = `$${Number(value).toLocaleString("es-CO")}`;
        color = "#fff";
      }
      if (col.field === "stock") {
        color = value === 0 ? "#EF4444" : "#fff";
      }
      
      return (
        <span style={{ color, fontSize: "13px", fontWeight }}>
          {value}
        </span>
      );
    },
  }));

  // ====== EFECTOS ======
  useEffect(() => {
    // Cargar productos
    const mappedProducts = initialProducts.map((p, i) => ({
      id: p.id || `prod-${i + 1}`,
      activo: p.activo !== undefined ? Boolean(p.activo) : (p.isActive !== undefined ? Boolean(p.isActive) : true),
      ...p,
      talla: p.tallas && Array.isArray(p.tallas) ? p.tallas[0] || "" : p.talla || "",
      color: p.colores && Array.isArray(p.colores) ? p.colores[0] || "" : p.color || "",
    }));
    setProductos(mappedProducts);

    // Cargar categorías únicas
    const categoriasUnicas = [...new Set(initialProducts.map(p => p.categoria).filter(Boolean))];
    setAllCategorias(categoriasUnicas);

    // Cargar tallas
    const tallasUnicas = initialSizes.map(size => ({
      value: size.value,
      label: size.label
    }));
    setAllTallas(tallasUnicas);

    // Cargar colores
    const coloresUnicos = initialColors.map(color => ({
      value: color.value,
      label: color.label
    }));
    setAllColores(coloresUnicos);
  }, []);

  // ====== FUNCIONES UTILITARIAS ======
  const showAlert = (msg, type = "success") => {
    setAlert({ show: true, message: msg, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "success" }), 3000);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  // ====== MANEJO DE IMÁGENES ======
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 4) {
      showAlert("Máximo 4 imágenes permitidas", "delete");
      return;
    }
    
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setImages(prev => [...prev, ...newImages]);
  };

  // ELIMINADO: const removeImage = (index) => { ... } - no se usa

  const nextImage = () => {
    const totalImages = images.length || (formData.imagenes ? formData.imagenes.length : 0);
    if (totalImages === 0) return;
    setCurrentImageIndex(prev => (prev + 1) % totalImages);
  };

  const prevImage = () => {
    const totalImages = images.length || (formData.imagenes ? formData.imagenes.length : 0);
    if (totalImages === 0) return;
    setCurrentImageIndex(prev => (prev - 1 + totalImages) % totalImages);
  };

  // ====== TOGGLE ESTADO ======
  const handleToggleStatus = (producto) => {
    setProductos((prev) => {
      const nuevosProductos = prev.map((p) => 
        p.id === producto.id ? { ...p, activo: !p.activo } : p
      );
      
      const productoActualizado = nuevosProductos.find(p => p.id === producto.id);
      if (productoActualizado) {
        showAlert(`Producto "${productoActualizado.nombre}" ${productoActualizado.activo ? "activado" : "desactivado"} correctamente`, "success");
      }
      
      return nuevosProductos;
    });
  };

  // ====== MANEJO DE MODALES ======
  const openModal = (mode = "view", producto = null) => {
    setModalState({ isOpen: true, mode, producto });
    setErrors({});
    setImages([]);
    setCurrentImageIndex(0);
    
    if (producto) {
      setFormData({ 
        descripcion: producto.descripcion || "",
        ...producto,
        activo: producto.activo !== undefined ? producto.activo : true
      });
    } else {
      setFormData({
        nombre: "",
        categoria: "",
        talla: "",
        color: "",
        precio: "",
        stock: "",
        descripcion: "",
        activo: true,
      });
    }
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: "view", producto: null });
    setFormData({});
    setErrors({});
    setImages([]);
    setCurrentImageIndex(0);
  };

  // ====== ELIMINAR PRODUCTO ======
  const openDeleteModal = (producto) => {
    if (producto.activo) {
      showAlert('No se puede eliminar un producto activo. Primero desactívelo.', 'delete');
      return;
    }
    
    setDeleteModal({ isOpen: true, producto });
  };

  const closeDeleteModal = () => setDeleteModal({ isOpen: false, producto: null });

  const handleConfirmDelete = () => {
    if (!deleteModal.producto) return;
    setProductos((prev) => prev.filter((p) => p.id !== deleteModal.producto.id));
    showAlert(`Producto "${deleteModal.producto.nombre}" eliminado correctamente`, "delete");
    closeDeleteModal();
  };

  // ====== GUARDAR PRODUCTO ======
  const handleSaveProduct = () => {
    const requiredFields = ["nombre", "categoria", "precio", "stock"];
    const newErrors = {};

    requiredFields.forEach((field) => {
      if (!formData[field]?.toString().trim()) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} es obligatorio`;
      }
    });

    const precio = parseFloat(formData.precio);
    const stock = parseInt(formData.stock, 10);
    if (isNaN(precio) || precio < 0) newErrors.precio = "Precio debe ser ≥ 0";
    if (isNaN(stock) || stock < 0) newErrors.stock = "Stock debe ser ≥ 0";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      showAlert("Complete los campos obligatorios", "delete");
      return;
    }

    const productData = {
      ...formData,
      precio,
      stock,
      activo: modalState.mode === "create" ? true : formData.activo,
      imagenes: images.length > 0 ? images.map(img => img.preview) : (formData.imagenes || [])
    };

    if (modalState.mode === "edit" && modalState.producto?.id) {
      setProductos((prev) =>
        prev.map((p) => (p.id === modalState.producto.id ? { ...p, ...productData } : p))
      );
      showAlert(`Producto "${productData.nombre}" actualizado correctamente`, "success");
    } else {
      const newId = `prod-${Date.now()}`;
      setProductos((prev) => [...prev, { ...productData, id: newId }]);
      showAlert(`Producto "${productData.nombre}" creado correctamente`, "success");
    }
    closeModal();
  };

  // ====== COMPONENTE FILTRO ======
  const StatusFilter = () => {
    const [open, setOpen] = useState(false);
    
    const displayStatus = 
      filterActive === null ? 'Todos' : 
      filterActive === true ? 'Activos' : 'Inactivos';

    const handleFilterSelect = (status) => {
      const newFilterActive = 
        status === 'Todos' ? null : 
        status === 'Activos' ? true : false;
        
      setFilterActive(newFilterActive);
      setCurrentPage(1);
      setOpen(false);
    };

    return (
      <div style={{ position: 'relative' }}>
        <button 
          onClick={() => setOpen(!open)} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            padding: '8px 12px', 
            backgroundColor: 'transparent', 
            border: '1px solid #F5C81B', 
            color: '#F5C81B', 
            borderRadius: '6px', 
            fontSize: '13px', 
            cursor: 'pointer', 
            whiteSpace: 'nowrap', 
            minWidth: '110px', 
            justifyContent: 'space-between', 
            fontWeight: '600', 
            height: '36px',
            transition: 'all 0.2s',
          }} 
          onMouseEnter={e => { 
            e.target.style.backgroundColor = '#F5C81B'; 
            e.target.style.color = '#000'; 
          }} 
          onMouseLeave={e => { 
            e.target.style.backgroundColor = 'transparent'; 
            e.target.style.color = '#F5C81B'; 
          }}
        >
          <span>{displayStatus}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
            <polyline points="6,9 12,15 18,9"/>
          </svg>
        </button>
        {open && (
          <div 
            style={{ 
              position: 'absolute', 
              top: '100%', 
              right: 0, 
              marginTop: '4px', 
              backgroundColor: '#1F2937', 
              border: '1px solid #F5C81B', 
              borderRadius: '6px', 
              padding: '6px 0', 
              minWidth: '120px', 
              zIndex: 1000, 
              boxShadow: '0 4px 12px rgba(245, 200, 27, 0.3)' 
            }}
          >
            {['Todos', 'Activos', 'Inactivos'].map(status => (
              <button 
                key={status} 
                onClick={() => handleFilterSelect(status)} 
                style={{ 
                  width: '100%', 
                  padding: '6px 12px', 
                  backgroundColor: displayStatus === status ? '#F5C81B' : 'transparent', 
                  border: 'none', 
                  color: displayStatus === status ? '#000' : '#F5C81B', 
                  fontSize: '13px', 
                  textAlign: 'left', 
                  cursor: 'pointer', 
                  fontWeight: displayStatus === status ? '600' : '400',
                  transition: 'all 0.1s'
                }}
                onMouseEnter={e => displayStatus !== status && (
                  e.target.style.backgroundColor = '#F5C81B',
                  e.target.style.color = '#000'
                )}
                onMouseLeave={e => displayStatus !== status && (
                  e.target.style.backgroundColor = 'transparent',
                  e.target.style.color = '#F5C81B'
                )}
              >
                {status}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ====== RENDER FIELD ======
  const renderField = (label, fieldName, type = "text", options = [], placeholder = "") => {
    const requiredFields = ["nombre", "categoria", "precio", "stock"];
    const isError = errors[fieldName];
    const isRequired = requiredFields.includes(fieldName);
    
    const labelStyle = {
      fontSize: "12px",
      color: "#e2e8f0",
      fontWeight: "500",
      marginBottom: "2px",
      display: "block",
    };

    const inputStyle = {
      backgroundColor: "#1e293b",
      border: `1px solid ${isError ? "#ef4444" : "#334155"}`,
      borderRadius: "6px",
      padding: "6px 10px",
      color: "#f1f5f9",
      fontSize: "13px",
      height: "34px",
      width: "100%",
      outline: "none",
      boxSizing: "border-box",
    };

    const selectStyle = {
      ...inputStyle,
      appearance: "none",
      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
      backgroundPosition: "right 8px center",
      backgroundRepeat: "no-repeat",
      backgroundSize: "14px",
    };

    const errorStyle = {
      color: "#f87171",
      fontSize: "11px",
      fontWeight: "500",
      marginTop: "2px",
      height: "14px",
      display: "flex",
      alignItems: "center",
      gap: "4px",
      overflow: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
      minHeight: "14px",
    };

    if (modalState.mode === "view") {
      let displayValue = formData[fieldName] || (fieldName === "descripcion" ? "Sin descripción" : "N/A");
      if (fieldName === "precio") {
        displayValue = `$${Number(displayValue || 0).toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      } else if (fieldName === "stock") {
        displayValue = displayValue || "0";
      }

      const viewBoxStyle = {
        backgroundColor: "#1e293b",
        border: "1px solid #334155",
        borderRadius: "6px",
        padding: "6px 10px",
        color: "#f1f5f9",
        fontSize: "13px",
        display: "flex",
        alignItems: fieldName === "descripcion" ? "flex-start" : "center",
        minHeight: fieldName === "descripcion" ? "50px" : "34px",
        whiteSpace: fieldName === "descripcion" ? "pre-wrap" : "nowrap",
        overflow: "auto",
        boxSizing: "border-box",
      };

      return (
        <div>
          <label style={labelStyle}>{label}:</label>
          <div style={viewBoxStyle}>
            {displayValue}
          </div>
        </div>
      );
    } else {
      if (type === "select") {
        return (
          <div style={{ position: "relative" }}>
            <label style={labelStyle}>
              {label}:{isRequired && <span style={{ color: "#ef4444", marginLeft: "2px" }}>*</span>}
            </label>
            <select
              name={fieldName}
              value={formData[fieldName] || ""}
              onChange={(e) => setFormData({ ...formData, [fieldName]: e.target.value })}
              style={selectStyle}
            >
              <option value="">Seleccionar</option>
              {options.map((opt) => (
                <option key={opt.value || opt} value={opt.value || opt}>
                  {opt.label || opt}
                </option>
              ))}
            </select>
            {isError && (
              <div style={errorStyle}>
                <span style={{ color: "#f87171", fontSize: "12px", fontWeight: "bold" }}>●</span>
                {isError}
              </div>
            )}
          </div>
        );
      }

      return (
        <div style={{ position: "relative" }}>
          <label style={labelStyle}>
            {label}:{isRequired && <span style={{ color: "#ef4444", marginLeft: "2px" }}>*</span>}
          </label>
          <input
            type={type}
            value={formData[fieldName] || ""}
            onChange={(e) => setFormData({ ...formData, [fieldName]: e.target.value })}
            placeholder={placeholder}
            style={inputStyle}
            step={type === "number" && fieldName === "precio" ? "0.01" : "1"}
          />
          {isError && (
            <div style={errorStyle}>
              <span style={{ color: "#f87171", fontSize: "12px", fontWeight: "bold" }}>●</span>
              {isError}
            </div>
          )}
        </div>
      );
    }
  };

  // ====== RENDER IMAGE UPLOAD ======
  const renderImageUpload = () => {
    const imagesToShow = modalState.mode === "view" ? (formData.imagenes || []) : images.map(img => img.preview);
    const totalImages = imagesToShow.length;

    if (modalState.mode === "view") {
      return (
        <div>
          <label style={{
            fontSize: "12px",
            color: "#e2e8f0",
            fontWeight: "500",
            marginBottom: "2px",
            display: "block",
          }}>
            Imágenes ({totalImages}):
          </label>
          
          {totalImages > 0 ? (
            <div style={{
              position: 'relative',
              width: '100%',
              height: '200px',
              borderRadius: '6px',
              overflow: 'hidden',
              border: '1px solid #334155',
              marginBottom: '8px'
            }}>
              <img 
                src={imagesToShow[currentImageIndex]} 
                alt={`Imagen ${currentImageIndex + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              
              {totalImages > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    style={{
                      position: 'absolute',
                      left: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(0, 0, 0, 0.7)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '30px',
                      height: '30px',
                      color: 'white',
                      fontSize: '16px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ‹
                  </button>
                  <button
                    onClick={nextImage}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(0, 0, 0, 0.7)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '30px',
                      height: '30px',
                      color: 'white',
                      fontSize: '16px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ›
                  </button>
                </>
              )}
            </div>
          ) : (
            <div style={{
              color: '#94a3b8',
              fontSize: '11px',
              fontStyle: 'italic',
              textAlign: 'center',
              padding: '20px',
              border: '1px dashed #334155',
              borderRadius: '6px'
            }}>
              No hay imágenes
            </div>
          )}
        </div>
      );
    }

    return (
      <div>
        <label style={{
          fontSize: "12px",
          color: "#e2e8f0",
          fontWeight: "500",
          marginBottom: "2px",
          display: "block",
        }}>
          Imágenes (máximo 4):
        </label>
        
        {images.length > 0 && (
          <div style={{
            position: 'relative',
            width: '100%',
            height: '150px',
            borderRadius: '6px',
            overflow: 'hidden',
            border: '1px solid #334155',
            marginBottom: '8px'
          }}>
            <img 
              src={images[currentImageIndex]?.preview} 
              alt={`Preview ${currentImageIndex + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  style={{
                    position: 'absolute',
                    left: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(0, 0, 0, 0.7)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '25px',
                    height: '25px',
                    color: 'white',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ‹
                </button>
                <button
                  onClick={nextImage}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(0, 0, 0, 0.7)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '25px',
                    height: '25px',
                    color: 'white',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ›
                </button>
              </>
            )}
          </div>
        )}

        <label
          style={{
            display: 'block',
            width: '100%',
            padding: '12px',
            border: '2px dashed #334155',
            borderRadius: '6px',
            textAlign: 'center',
            cursor: images.length >= 4 ? 'not-allowed' : 'pointer',
            backgroundColor: '#1e293b',
            color: images.length >= 4 ? '#6B7280' : '#94a3b8',
            fontSize: '13px',
            transition: 'all 0.2s',
            opacity: images.length >= 4 ? 0.6 : 1
          }}
          onMouseEnter={(e) => {
            if (images.length < 4) {
              e.target.style.borderColor = '#F5C81B';
              e.target.style.color = '#F5C81B';
            }
          }}
          onMouseLeave={(e) => {
            if (images.length < 4) {
              e.target.style.borderColor = '#334155';
              e.target.style.color = '#94a3b8';
            }
          }}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
            disabled={images.length >= 4}
          />
          <div>{images.length >= 4 ? 'Máximo 4 imágenes alcanzado' : 'Haz clic para subir imágenes'}</div>
          <div style={{ fontSize: '11px', marginTop: '4px' }}>
            {images.length}/4 imágenes seleccionadas
          </div>
        </label>
      </div>
    );
  };

  // ====== FILTRADO Y PAGINACIÓN ======
  const filtered = productos.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      p.nombre.toLowerCase().includes(term) ||
      p.categoria?.toLowerCase().includes(term) ||
      p.color?.toLowerCase().includes(term);

    const matchesStatus = filterActive === null || p.activo === filterActive;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filtered.length);
  const paginated = filtered.slice(startIndex, endIndex);
  const showingStart = filtered.length > 0 ? startIndex + 1 : 0;

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
    else if (totalPages === 0) setCurrentPage(1);
  }, [totalPages, currentPage]);

  // ====== RENDER ======
  return (
    <>
      {alert.show && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ show: false, message: "", type: "success" })}
        />
      )}

      <div style={{
        display: "flex",
        flexDirection: "column",
        padding: "4px 12px 0 12px",
        flex: 1,
        height: "100%",
      }}>
        {/* Encabezado */}
        <div style={{ marginBottom: "8px" }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "6px",
          }}>
            <div>
              <h1 style={{ color: "#fff", fontSize: "20px", fontWeight: "700", margin: 0, lineHeight: "1.2" }}>
                Productos
              </h1>
              <p style={{ color: "#9CA3AF", fontSize: "15px", margin: 0, lineHeight: "1.3" }}>
                Gestiona los productos registrados
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => openModal("create")}
                style={{
                  padding: "6px 13px",
                  backgroundColor: "transparent",
                  border: "1px solid #F5C81B",
                  color: "#F5C81B",
                  borderRadius: "4px",
                  fontSize: "11px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  minWidth: "100px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                  height: "35px",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#F5C81B";
                  e.target.style.color = "#000";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.color = "#F5C81B";
                }}
              >
                Registrar Producto
              </button>
            </div>
          </div>
          
          {/* Buscador y Filtro */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar por nombre, categoría o color..."
                onClear={clearSearch}
                fullWidth={true}
              />
            </div>
            <StatusFilter />
          </div>
        </div>

        {/* Contenido Principal */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '6px',
          border: '1px solid #F5C81B',
          overflow: 'hidden',
          backgroundColor: '#000',
        }}>
          {/* Tabla */}
          <div style={{
            flex: 1,
            overflow: 'auto',
          }}>
            <EntityTable
              entities={paginated}
              columns={columns}
              onView={(producto) => openModal("view", producto)}
              onEdit={(producto) => openModal("edit", producto)}
              onDelete={(producto) => openDeleteModal(producto)}
              onAnular={(producto) => handleToggleStatus(producto)}
              onReactivar={(producto) => handleToggleStatus(producto)}
              idField="id"
              estadoField="activo"
              isActiveField="activo"
              moduleType="generic"
              showPagination={false}
              style={{
                border: 'none',
                borderRadius: '0',
              }}
              tableStyle={{
                width: '100%',
                borderCollapse: 'collapse',
                tableLayout: 'fixed',
              }}
              headerStyle={{
                padding: '6px 4px',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '11px',
                color: '#F5C81B',
                borderBottom: '1px solid #F5C81B',
                backgroundColor: '#151822',
              }}
            />
          </div>

          {/* Paginación */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 12px",
            backgroundColor: "#151822",
            borderTop: '1px solid #F5C81B',
            fontSize: "12px",
            color: "#e0e0e0",
            height: "48px",
            boxSizing: "border-box",
          }}>
            <span>
              Mostrando {showingStart}–{endIndex} de {filtered.length} productos
            </span>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  background: 'transparent',
                  border: '1px solid #F5C81B',
                  color: currentPage === 1 ? '#6B7280' : '#F5C81B',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  minWidth: '90px',
                }}
              >
                ‹ Anterior
              </button>
              <span style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#F5C81B',
                minWidth: '60px',
                textAlign: 'center'
              }}>
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                style={{
                  background: 'transparent',
                  border: '1px solid #F5C81B',
                  color: currentPage >= totalPages ? '#6B7280' : '#F5C81B',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  minWidth: '90px',
                }}
              >
                Siguiente ›
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      {deleteModal.isOpen && (
        <ConfirmDeleteModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={handleConfirmDelete}
          entityName="producto"
          entityData={deleteModal.producto}
        />
      )}

      <UniversalModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={
          modalState.mode === "create"
            ? "Registrar Producto"
            : modalState.mode === "edit"
            ? "Editar Producto"
            : "Detalles del Producto"
        }
        subtitle={
          modalState.mode === "create"
            ? "Complete la información para registrar un nuevo producto"
            : modalState.mode === "edit"
            ? "Modifique la información del producto"
            : "Información detallada del producto"
        }
        showActions={false}
        customStyles={{
          content: { 
            padding: '12px',
            backgroundColor: '#000000',
            border: '1px solid rgba(255,215,0,0.25)',
            borderRadius: '12px',
            maxWidth: '400px',
            width: '100%',
            maxHeight: 'calc(90vh)',
            overflowY: 'auto',
          }
        }}
      >
        <div style={{ 
          display: "flex", 
          flexDirection: "column",
          gap: "6px",
        }}>
          <div style={{ display: "flex", gap: "8px" }}> 
            <div style={{ flex: 1 }}>
              {renderField("Nombre", "nombre", "text", [], "Ej: Gorra New Era Yankees")}
            </div>
            <div style={{ flex: 1 }}>
              {renderField("Categoría", "categoria", "select", 
                allCategorias.map(cat => ({ value: cat, label: cat })),
                "Seleccionar categoría"
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}> 
            <div style={{ flex: 1 }}>
              {renderField("Precio", "precio", "number", [], "0.00")}
            </div>
            <div style={{ flex: 1 }}>
              {renderField("Stock", "stock", "number", [], "0")}
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}> 
            <div style={{ flex: 1 }}>
              {renderField("Talla", "talla", "select", 
                [{ value: "", label: "Seleccionar talla" }, ...allTallas], 
                "Seleccionar talla"
              )}
            </div>
            <div style={{ flex: 1 }}>
              {renderField("Color", "color", "select", 
                [{ value: "", label: "Seleccionar color" }, ...allColores], 
                "Seleccionar color"
              )}
            </div>
          </div>

          <div>
            <label style={{
              fontSize: "12px",
              color: "#e2e8f0",
              fontWeight: "500",
              marginBottom: "2px",
              display: "block",
            }}>
              Descripción:
            </label>
            <textarea
              value={formData.descripcion || ""}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descripción del producto..."
              style={{
                backgroundColor: "#1e293b",
                border: `1px solid #334155`,
                borderRadius: "6px",
                padding: "6px 10px",
                color: "#f1f5f9",
                fontSize: "13px",
                width: "100%",
                height: "70px",
                minHeight: "70px",
                resize: "none",
                outline: "none",
                boxSizing: "border-box",
              }}
              readOnly={modalState.mode === "view"}
            />
          </div>

          {renderImageUpload()}

          {modalState.mode === "view" && (
            <div>
              <label
                style={{
                  fontSize: "12px",
                  color: "#e2e8f0",
                  fontWeight: "500",
                  marginBottom: "2px",
                  display: "block",
                }}
              >
                Estado:
              </label>
              <div
                style={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "6px",
                  padding: "6px 10px",
                  color: formData.activo ? "#10B981" : "#EF4444",
                  fontSize: "13px",
                  minHeight: "34px",
                  display: "flex",
                  alignItems: "center",
                  fontWeight: "500",
                }}
              >
                {formData.activo ? "Activo" : "Inactivo"}
              </div>
            </div>
          )}

          {(modalState.mode === "create" || modalState.mode === "edit") && (
            <div style={{ 
              display: "flex", 
              gap: "10px", 
              justifyContent: "flex-end", 
              paddingTop: "12px",
              borderTop: "1px solid #334155"
            }}>
              <button
                onClick={closeModal}
                style={{
                  backgroundColor: "transparent",
                  border: "1px solid #94a3b8",
                  color: "#94a3b8",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "500",
                  cursor: "pointer",
                  minWidth: "80px",
                  height: "32px",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProduct}
                style={{
                  backgroundColor: "#F5C81B",
                  border: "none",
                  color: "#0f172a",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  minWidth: "90px",
                  height: "32px",
                }}
              >
                {modalState.mode === "create" ? "Guardar" : "Guardar Cambios"}
              </button>
            </div>
          )}
        </div>
      </UniversalModal>
    </>
  );
};

export default ProductosPage;