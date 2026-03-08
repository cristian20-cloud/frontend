// src/pages/admin/DevolucionesPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import EntityTable from '../../components/EntityTable';
import Alert from '../../components/Alert';
import SearchInput from '../../components/SearchInput';
import UniversalModal from '../../components/UniversalModal';
import { initialReturns, initialProducts } from '../../data';

// =========================
// COMPONENTES MOVIDOS AFUERA (Para evitar pérdida de foco)
// =========================

// 1. Componente Campo de Formulario Genérico
const FormField = ({ label, required, children, error }) => {
  return (
    <div style={{ marginBottom: '8px' }}>
      <label style={{ fontSize: '11px', color: '#e2e8f0', display: 'block', marginBottom: '2px' }}>
        {label}: {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      {children}
      {error && (
        <div style={{ color: '#f87171', fontSize: '10px', marginTop: '2px' }}>{error}</div>
      )}
    </div>
  );
};

// 2. Componente Selector de Productos
const ProductoForm = ({ tipo, productoId, productoNombre, onChange, isViewMode = false, productos, getProductPrice }) => {
  const productInputStyle = {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '4px',
    padding: '4px 8px',
    color: '#f1f5f9',
    fontSize: '11px',
    height: '32px',
    outline: 'none',
    width: '100%',
    cursor: 'pointer',
  };

  if (isViewMode) {
    return (
      <div style={{
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '4px',
        padding: '8px 10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ color: '#fff', fontSize: '12px' }}>{productoNombre || '-'}</span>
        <span style={{ color: '#F5C81B', fontSize: '13px', fontWeight: '600' }}>
          ${(getProductPrice(productoId) || 0).toLocaleString('es-CO')}
        </span>
      </div>
    );
  }

  return (
    <select
      value={productoId || ''}
      onChange={(e) => onChange(tipo, e.target.value)}
      style={{
        ...productInputStyle,
        appearance: 'none',
        backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23F5C81B\' strokeWidth=\'2\' strokeLinecap=\'round\' strokeLinejoin=\'round\'><polyline points=\'6 9 12 15 18 9\'/></svg>")',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 8px center',
        backgroundSize: '16px',
        paddingRight: '32px',
      }}
      className="modal-select-no-scroll"
    >
      <option value="">Seleccionar producto</option>
      {productos.map(p => (
        <option key={p.id} value={p.id}>
          {p.nombre} - ${p.precio.toLocaleString('es-CO')}
        </option>
      ))}
    </select>
  );
};

// 3. Componente Principal del Formulario de Devolución
const DevolucionFormFields = ({
  modalState,
  formData,
  errors,
  handleInputChange,
  handleProductChange,
  productos,
  getProductPrice,
  motivosDevolucion,
  documentNumberRef
}) => {
  const isViewMode = modalState.mode === 'view';
  const isEditMode = modalState.mode === 'edit';

  const inputStyle = {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "4px",
    padding: "6px 8px",
    color: "#f1f5f9",
    fontSize: "12px",
    height: "32px",
    width: "100%",
    outline: "none",
    boxSizing: "border-box",
  };

  // Vista de detalles (Solo lectura)
  if (isViewMode) {
    const motivoLabel = motivosDevolucion.find(m => m.value === formData.motivo)?.label || formData.motivo;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Tipo Documento:</div>
            <div style={inputStyle}>{formData.documentType}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Número:</div>
            <div style={inputStyle}>{formData.documentNumber || 'N/A'}</div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Producto Original:</div>
          <ProductoForm tipo="original" productoId={formData.productoOriginalId} productoNombre={formData.productoOriginalNombre} isViewMode={true} productos={productos} getProductPrice={getProductPrice} />
        </div>

        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Producto Cambio:</div>
          <ProductoForm tipo="cambio" productoId={formData.productoCambioId} productoNombre={formData.productoCambioNombre} isViewMode={true} productos={productos} getProductPrice={getProductPrice} />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 2 }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Motivo:</div>
            <div style={{
              ...inputStyle,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              cursor: 'pointer',
            }} title={motivoLabel}>
              {motivoLabel}
            </div>
            {formData.motivoDetalle && (
              <div style={{ 
                ...inputStyle, 
                marginTop: '4px', 
                height: 'auto', 
                minHeight: '32px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }} title={formData.motivoDetalle}>
                {formData.motivoDetalle}
              </div>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Estado:</div>
            <div style={{
              ...inputStyle,
              color: formData.status === 'Aprobada' ? '#22c55e' : formData.status === 'Rechazada' ? '#ef4444' : '#F5C81B',
              fontWeight: '600'
            }}>
              {formData.status || 'Pendiente'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Modo creación/edición (Inputs editables)
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      maxHeight: "calc(85vh - 120px)",
      overflowY: "auto",
      paddingRight: "4px",
      scrollbarWidth: "none",
      msOverflowStyle: "none",
    }}>
      <style>{`
        div::-webkit-scrollbar { display: none; }
        .modal-select-no-scroll::-webkit-scrollbar { width: 0px; background: transparent; }
        .modal-select-no-scroll { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>

      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1 }}>
          <FormField label="Tipo Documento">
            <select
              value={formData.documentType || 'Cédula de Ciudadanía'}
              onChange={(e) => handleInputChange('documentType', e.target.value)}
              style={inputStyle}
              className="modal-select-no-scroll"
            >
              <option value="Cédula de Ciudadanía">Cédula de Ciudadanía</option>
              <option value="NIT">NIT</option>
              <option value="Pasaporte">Pasaporte</option>
              <option value="Cédula de Extranjería">Cédula de Extranjería</option>
            </select>
          </FormField>
        </div>
        <div style={{ flex: 1 }}>
          <FormField label="Número" required error={errors.documentNumber}>
            <input
              ref={documentNumberRef}
              type="tel"
              value={formData.documentNumber || ''}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                handleInputChange('documentNumber', value);
              }}
              style={{
                ...inputStyle,
                border: errors.documentNumber ? '1px solid #ef4444' : '1px solid #334155',
                backgroundColor: errors.documentNumber ? "#451a1a" : "#1e293b"
              }}
              placeholder="Ej: 1020304050"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
            />
          </FormField>
        </div>
      </div>

      <FormField label="Producto Original" required error={errors.productoOriginalId}>
        <ProductoForm tipo="original" productoId={formData.productoOriginalId} productoNombre={formData.productoOriginalNombre} onChange={handleProductChange} isViewMode={false} productos={productos} getProductPrice={getProductPrice} />
      </FormField>

      <FormField label="Producto Cambio" required error={errors.productoCambioId}>
        <ProductoForm tipo="cambio" productoId={formData.productoCambioId} productoNombre={formData.productoCambioNombre} onChange={handleProductChange} isViewMode={false} productos={productos} getProductPrice={getProductPrice} />
      </FormField>

      {/* ✅ Motivo y Estado en la misma fila - Más compactos */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1.5 }}>
          <FormField label="Motivo" required error={errors.motivo}>
            <select
              value={formData.motivo || ''}
              onChange={(e) => handleInputChange('motivo', e.target.value)}
              style={{
                ...inputStyle,
                border: errors.motivo ? '1px solid #ef4444' : '1px solid #334155',
                appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23F5C81B\' strokeWidth=\'2\' strokeLinecap=\'round\' strokeLinejoin=\'round\'><polyline points=\'6 9 12 15 18 9\'/></svg>")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px center',
                backgroundSize: '16px',
                paddingRight: '32px',
              }}
              className="modal-select-no-scroll"
            >
              <option value="">Seleccionar</option>
              {motivosDevolucion.map(op => (
                <option key={op.value} value={op.value}>{op.label}</option>
              ))}
            </select>
          </FormField>
        </div>
        
        {/* ✅ Estado - Solo visible en modo EDICIÓN */}
        {isEditMode && (
          <div style={{ flex: 1 }}>
            <FormField label="Estado">
              <select
                value={formData.status || 'Pendiente'}
                onChange={(e) => handleInputChange('status', e.target.value)}
                style={{
                  ...inputStyle,
                  appearance: 'none',
                  backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23F5C81B\' strokeWidth=\'2\' strokeLinecap=\'round\' strokeLinejoin=\'round\'><polyline points=\'6 9 12 15 18 9\'/></svg>")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                  backgroundSize: '16px',
                  paddingRight: '32px',
                }}
                className="modal-select-no-scroll"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Aprobada">Aprobada</option>
                <option value="Rechazada">Rechazada</option>
              </select>
            </FormField>
          </div>
        )}
      </div>

      {formData.motivo === 'otro' && (
        <FormField label="Razón" required error={errors.motivoDetalle}>
          <textarea
            value={formData.motivoDetalle || ''}
            onChange={(e) => handleInputChange('motivoDetalle', e.target.value)}
            style={{
              ...inputStyle,
              height: '40px',  // ✅ CAMBIADO: De 60px a 40px
              resize: 'none',
              border: errors.motivoDetalle ? '1px solid #ef4444' : '1px solid #334155'
            }}
            placeholder="Especifique la razón..."
          />
        </FormField>
      )}
    </div>
  );
};

// =========================
// COMPONENTE PRINCIPAL
// =========================
const DevolucionesPage = () => {
  // =============== ESTADOS ===============
  const [devoluciones, setDevoluciones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [modalState, setModalState] = useState({ isOpen: false, mode: 'view', devolucion: null });
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [productos, setProductos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Ref para mantener el foco del input
  const documentNumberRef = useRef(null);

  const motivosDevolucion = [
    { value: 'defecto', label: 'Producto defectuoso' },
    { value: 'talla', label: 'Talla incorrecta' },
    { value: 'color', label: 'Color no deseado' },
    { value: 'cambio', label: 'Cambio por otro producto' },
    { value: 'arrepentimiento', label: 'Arrepentimiento de compra' },
    { value: 'duplicado', label: 'Producto duplicado' },
    { value: 'otro', label: 'Otro' },
  ];

  // =============== FUNCIONES UTILITARIAS ===============
  const getProductById = useCallback((productId) => {
    if (!productId) return null;
    const id = parseInt(productId);
    return initialProducts.find(p => p.id === id) || null;
  }, []);

  const getProductName = useCallback((productId) => {
    if (!productId) return 'N/A';
    const product = getProductById(productId);
    return product ? product.nombre : `ID: ${productId}`;
  }, [getProductById]);

  const getProductPrice = useCallback((productId) => {
    if (!productId) return 0;
    const product = getProductById(productId);
    return product ? (product.precio || 0) : 0;
  }, [getProductById]);

  // =============== FILTROS ===============
  const filtered = devoluciones.filter(d => !d.isEmpty).filter(d => {
    const search = (
      (d.numeroDocumento || '') +
      (d.nombreProductoOriginal || '') +
      (d.nombreProductoCambio || '') +
      (d.estado || '')
    ).toLowerCase().includes(searchTerm.toLowerCase());
    const status = filterStatus === 'Todos' || d.estado === filterStatus;
    return search && status;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // =============== COLUMNAS DE LA TABLA ===============
  const columns = [
    {
      header: 'Documento',
      field: 'numeroDocumento',
      width: '120px',
      render: (item) => (
        <span style={{ color: '#ffffff', fontSize: '12px', paddingLeft: '8px', fontWeight: '500' }}>
          {item.numeroDocumento || 'N/A'}
        </span>
      )
    },
    {
      header: 'Producto Original',
      field: 'nombreProductoOriginal',
      width: '160px',
      render: (item) => (
        <span style={{ color: '#ffffff', fontSize: '12px', fontWeight: '500', paddingLeft: '8px' }}>
          {item.nombreProductoOriginal || 'N/A'}
        </span>
      )
    },
    {
      header: 'Producto Cambio',
      field: 'nombreProductoCambio',
      width: '160px',
      render: (item) => (
        <span style={{ color: '#ffffff', fontSize: '12px', fontWeight: '500', paddingLeft: '8px' }}>
          {item.nombreProductoCambio || 'N/A'}
        </span>
      )
    },
    {
      header: 'Valor',
      field: 'precio',
      width: '100px',
      render: (item) => (
        <span style={{ color: '#F5C81B', fontSize: '13px', fontWeight: '700', paddingLeft: '8px' }}>
          ${parseInt(item.precio || 0).toLocaleString()}
        </span>
      )
    },
    {
      header: 'Estado',
      field: 'estado',
      width: '110px',
      render: (item) => {
        const getStatusStyle = () => {
          switch (item.estado) {
            case 'Aprobada': return { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: '1px solid #22c55e' };
            case 'Rechazada': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444' };
            default: return { bg: 'rgba(245, 200, 27, 0.05)', color: '#F5C81B', border: '1px solid #F5C81B' };
          }
        };
        const style = getStatusStyle();
        return (
          <span style={{
            backgroundColor: style.bg,
            color: style.color,
            border: style.border,
            fontSize: '11px',
            fontWeight: '600',
            padding: '3px 10px',
            borderRadius: '12px',
            display: 'inline-block',
            minWidth: '70px',
            textAlign: 'center'
          }}>
            {item.estado || 'Pendiente'}
          </span>
        );
      }
    },
  ];

  // =============== MANEJO DE MODAL ===============
  const openModal = (mode = 'create', devolucion = null) => {
    if (devolucion?.isEmpty) return;
    setModalState({ isOpen: true, mode, devolucion });
    setErrors({});
    if (devolucion) {
      setFormData({
        documentType: devolucion.documentType || 'Cédula de Ciudadanía',
        documentNumber: devolucion.numeroDocumento || '',
        productoOriginalId: devolucion.productoOriginalId || '',
        productoOriginalNombre: devolucion.nombreProductoOriginal || '',
        productoCambioId: devolucion.productoCambioId || '',
        productoCambioNombre: devolucion.nombreProductoCambio || '',
        motivo: devolucion.motivo || '',
        motivoDetalle: devolucion.motivoDetalle || '',
        status: devolucion.estado || 'Pendiente',
        razonAprobacion: devolucion.razonAprobacion || '',
      });
    } else {
      setFormData({
        documentType: 'Cédula de Ciudadanía',
        documentNumber: '',
        productoOriginalId: '',
        productoOriginalNombre: '',
        productoCambioId: '',
        productoCambioNombre: '',
        motivo: '',
        motivoDetalle: '',
        status: 'Pendiente'
      });
    }
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: 'view', devolucion: null });
  };

  // ✅ HANDLER OPTIMIZADO
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => {
        const newErr = { ...prev };
        delete newErr[field];
        return newErr;
      });
    }
  };

  const handleProductChange = (type, productId) => {
    const selectedProduct = productos.find(p => p.id === parseInt(productId));
    if (type === 'original') {
      setFormData(prev => ({
        ...prev,
        productoOriginalId: productId,
        productoOriginalNombre: selectedProduct?.nombre || ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        productoCambioId: productId,
        productoCambioNombre: selectedProduct?.nombre || ''
      }));
    }
  };

  const handleSave = () => {
    const required = [
      ['documentNumber', 'Número de documento'],
      ['productoOriginalId', 'Producto original'],
      ['productoCambioId', 'Producto de cambio'],
      ['motivo', 'Motivo']
    ];
    const newErrors = {};
    required.forEach(([field, label]) => {
      if (!String(formData[field] || '').trim()) newErrors[field] = `${label} es obligatorio`;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const updatedData = {
      ...formData,
      numeroDocumento: formData.documentNumber,
      nombreProductoOriginal: formData.productoOriginalNombre || getProductName(formData.productoOriginalId),
      nombreProductoCambio: formData.productoCambioNombre || getProductName(formData.productoCambioId),
      precio: getProductPrice(formData.productoOriginalId),
      estado: modalState.mode === 'create' ? 'Pendiente' : formData.status,
      id: modalState.devolucion?.id || `dev-${Date.now()}`
    };

    setDevoluciones(prev => {
      if (modalState.mode === 'edit') return prev.map(d => d.id === updatedData.id ? updatedData : d);
      return [...prev.filter(d => !d.isEmpty), updatedData];
    });

    closeModal();
    showAlert('Devolución guardada correctamente', 'success');
  };

  const handleViewDetails = (devolucion) => {
    if (devolucion?.isEmpty) return;
    setModalState({ isOpen: true, mode: 'view', devolucion });
    setFormData({
      documentType: devolucion.documentType || 'Cédula de Ciudadanía',
      documentNumber: devolucion.numeroDocumento || '',
      productoOriginalId: devolucion.productoOriginalId || '',
      productoOriginalNombre: devolucion.nombreProductoOriginal || '',
      productoCambioId: devolucion.productoCambioId || '',
      productoCambioNombre: devolucion.nombreProductoCambio || '',
      motivo: devolucion.motivo || '',
      motivoDetalle: devolucion.motivoDetalle || '',
      status: devolucion.estado || 'Pendiente',
      razonAprobacion: devolucion.razonAprobacion || '',
    });
  };

  // =============== ALERTAS ===============
  const showAlert = useCallback((message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3000);
  }, []);

  // =============== CARGA INICIAL ===============
  useEffect(() => {
    const mapped = initialReturns.map((d, i) => ({
      id: d.IdDevolucion?.toString() || `dev-${i}`,
      numeroDocumento: d.cc?.toString() || `1000000${i + 1}`,
      documentType: d.tipoDocumento || 'Cédula de Ciudadanía',
      productoOriginalId: d.IdProducto || '',
      nombreProductoOriginal: getProductName(d.IdProducto),
      productoCambioId: d.IdProductoCambio || '',
      nombreProductoCambio: getProductName(d.IdProductoCambio),
      precio: getProductPrice(d.IdProducto),
      motivo: d.Motivo || 'cambio',
      estado: d.Estado || 'Pendiente',
      razonAprobacion: d.RazonAprobacion || '',
    }));
    setDevoluciones(mapped);
    setProductos(initialProducts);
  }, [getProductName, getProductPrice]);

  // =============== FOCUS AL ABRIR MODAL ===============
  useEffect(() => {
    if (modalState.isOpen && (modalState.mode === 'create' || modalState.mode === 'edit')) {
      const timer = setTimeout(() => {
        if (documentNumberRef.current) {
          documentNumberRef.current.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [modalState.isOpen, modalState.mode]);

  // =============== COMPONENTE StatusFilter ===============
  const StatusFilter = () => {
    const [open, setOpen] = useState(false);
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
            minWidth: '110px',
            justifyContent: 'space-between',
            fontWeight: '600',
            height: '36px'
          }}
        >
          {filterStatus}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {open && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '4px',
            backgroundColor: '#1F2937',
            border: '1px solid #F5C81B',
            borderRadius: '6px',
            padding: '6px 0',
            minWidth: '120px',
            zIndex: 1000
          }}>
            {['Todos', 'Pendiente', 'Aprobada', 'Rechazada'].map(status => (
              <button
                key={status}
                onClick={() => { setFilterStatus(status); setOpen(false); }}
                style={{
                  width: '100%',
                  padding: '6px 12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#F5C81B',
                  fontSize: '13px',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                {status}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {alert.show && <Alert message={alert.message} type={alert.type} onClose={() => setAlert({ show: false })} />}
      <div style={{ display: "flex", flexDirection: "column", padding: "4px 12px 0 12px", flex: 1, height: "100%" }}>
        <div style={{ marginBottom: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <div>
              <h1 style={{ color: "#fff", fontSize: "20px", fontWeight: "700", margin: 0, lineHeight: "1.2" }}>Devoluciones</h1>
              <p style={{ color: "#9CA3AF", fontSize: "15px", margin: 0, lineHeight: "1.3" }}>Gestión de cambios por mismo valor</p>
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
                  fontWeight: '600',
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                  height: "35px",
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.target.style.backgroundColor = "#F5C81B"; e.target.style.color = "#000"; }}
                onMouseLeave={(e) => { e.target.style.backgroundColor = "transparent"; e.target.style.color = "#F5C81B"; }}
              >
                Registrar Devolución
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar por documento, producto o estado..."
                onClear={() => setSearchTerm('')}
                fullWidth={true}
                inputStyle={{
                  border: '1px solid #F5C81B',
                  backgroundColor: '#0a0a0a',
                  color: '#fff',
                  borderRadius: '4px',
                  height: '32px',
                  padding: '0 8px',
                  fontSize: '13px'
                }}
              />
            </div>
            <StatusFilter />
          </div>
        </div>

        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '6px',
          border: '1px solid #F5C81B',
          overflow: 'hidden',
          backgroundColor: '#000',
        }}>
          <div style={{ flex: 1, overflow: 'auto' }}>
            <EntityTable
              entities={filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}
              columns={columns}
              onView={handleViewDetails}
              onEdit={d => openModal('edit', d)}
              idField="id"
              showSwitch={false}
              style={{ border: 'none', borderRadius: '0' }}
              tableStyle={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}
              headerStyle={{
                padding: '6px 4px',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '11px',
                color: '#F5C81B',
                borderBottom: '1px solid #F5C81B',
                backgroundColor: '#151822',
              }}
              rowStyle={{
                border: 'none',
                backgroundColor: '#000',
                '&:hover': { backgroundColor: '#111111' }
              }}
            />
          </div>

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
            <span>Mostrando {(filtered.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0)}–{Math.min(currentPage * itemsPerPage, filtered.length)} de {filtered.length} devoluciones</span>
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
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { if (currentPage > 1) { e.target.style.backgroundColor = '#F5C81B'; e.target.style.color = '#000'; } }}
                onMouseLeave={(e) => { if (currentPage > 1) { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#F5C81B'; } }}
              >
                ‹ Anterior
              </button>
              <span style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '600', color: '#F5C81B', minWidth: '60px', textAlign: 'center' }}>
                Página {currentPage} de {Math.ceil(filtered.length / itemsPerPage) || 1}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= Math.ceil(filtered.length / itemsPerPage)}
                style={{
                  background: 'transparent',
                  border: '1px solid #F5C81B',
                  color: currentPage >= Math.ceil(filtered.length / itemsPerPage) ? '#6B7280' : '#F5C81B',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: currentPage >= Math.ceil(filtered.length / itemsPerPage) ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  minWidth: '90px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { if (currentPage < Math.ceil(filtered.length / itemsPerPage)) { e.target.style.backgroundColor = '#F5C81B'; e.target.style.color = '#000'; } }}
                onMouseLeave={(e) => { if (currentPage < Math.ceil(filtered.length / itemsPerPage)) { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#F5C81B'; } }}
              >
                Siguiente ›
              </button>
            </div>
          </div>
        </div>

        <UniversalModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          title={modalState.mode === 'create' ? 'Registrar Devolución' : modalState.mode === 'edit' ? 'Editar Devolución' : 'Detalles de Devolución'}
          subtitle={modalState.mode === 'create' ? 'Complete la información' : modalState.mode === 'edit' ? 'Modifique la información' : 'Información detallada'}
          showActions={false}
          customStyles={{
            overlay: { backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 1000 },
            content: {
              padding: '16px',
              backgroundColor: '#000000',
              border: '1px solid #F5C81B',
              borderRadius: '8px',
              maxWidth: '360px',  // ✅ CAMBIADO: De 400px a 360px (más estrecho)
              width: '95%',
              maxHeight: 'auto',
              overflow: 'visible',
              margin: 'auto',
              boxShadow: '0 4px 20px rgba(245, 200, 27, 0.1)',
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            },
            title: { color: '#F5C81B', fontSize: '16px', fontWeight: '600', marginBottom: '4px' },
            subtitle: { color: '#9CA3AF', fontSize: '11px', marginBottom: '12px' }
          }}
        >
          <DevolucionFormFields
            modalState={modalState}
            formData={formData}
            errors={errors}
            handleInputChange={handleInputChange}
            handleProductChange={handleProductChange}
            productos={productos}
            getProductPrice={getProductPrice}
            motivosDevolucion={motivosDevolucion}
            documentNumberRef={documentNumberRef}
          />

          {/* ✅ ÚNICO BOTÓN - Texto dinámico según el modo */}
          {modalState.mode !== 'view' && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button
                onClick={handleSave}
                style={{
                  backgroundColor: "#F5C81B",
                  border: "none",
                  color: "#0f172a",
                  padding: "6px 16px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  minWidth: "140px",
                  height: "32px",
                }}
              >
                {modalState.mode === 'create' ? 'Registrar Devolución' : 'Guardar Cambios'}
              </button>
            </div>
          )}
        </UniversalModal>
      </div>
    </>
  );
};

export default DevolucionesPage;