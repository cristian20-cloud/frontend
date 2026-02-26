// src/pages/admin/DevolucionesPage.jsx
import React, { useState, useEffect } from 'react';
import EntityTable from '../../components/EntityTable';
import Alert from '../../components/Alert';
import SearchInput from '../../components/SearchInput';
import UniversalModal from '../../components/UniversalModal';
import { initialReturns, initialProducts } from '../../data';

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

  // Modal para aprobación/rechazo
  const [decisionModal, setDecisionModal] = useState({
    isOpen: false,
    devolucion: null,
    decision: null,
    razon: ''
  });

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
  const getProductById = (productId) => {
    if (!productId) return null;
    return initialProducts.find(p => p.id === productId) || null;
  };

  const getProductName = (productId) => {
    if (!productId) return 'N/A';
    const product = getProductById(productId);
    return product ? product.nombre : `ID: ${productId} (Desconocido)`;
  };

  const getProductPrice = (productId) => {
    if (!productId) return 0;
    const product = getProductById(productId);
    return product ? (product.precio || product.Monto || product.price || product.valor || 0) : 0;
  };

  // =============== VALIDACIÓN DE PRECIOS ===============
  const validatePricesMatch = () => {
    const precioOriginal = getProductPrice(formData.productoOriginalId);
    const precioCambio = getProductPrice(formData.productoCambioId);
    
    if (formData.productoOriginalId && formData.productoCambioId && precioOriginal !== precioCambio) {
      setErrors(prev => ({ 
        ...prev, 
        productoCambioId: `Precio no coincide: Original $${precioOriginal.toLocaleString()} ≠ Cambio $${precioCambio.toLocaleString()}` 
      }));
      return false;
    }
    
    if (errors.productoCambioId?.includes('Precio no coincide')) {
      setErrors(prev => { const n = {...prev}; delete n.productoCambioId; return n; });
    }
    return true;
  };

  // =============== COLUMNAS DE LA TABLA ===============
  const columns = [
    {
      header: 'Tipo Documento',
      field: 'documentType',
      width: '130px',
      render: (item) => (
        <span style={{ color: '#ffffff', fontSize: '11px', fontWeight: '400', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.documentType || 'N/A'}
        </span>
      )
    },
    {
      header: 'Producto Original',
      field: 'nombreProductoOriginal',
      width: '120px',
      render: (item) => (
        <span style={{ color: '#ffffff', fontSize: '11px', fontWeight: '500', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.nombreProductoOriginal || 'N/A'}
        </span>
      )
    },
    {
      header: 'Producto Cambio',
      field: 'nombreProductoCambio',
      width: '120px',
      render: (item) => (
        <span style={{ color: '#ffffff', fontSize: '11px', fontWeight: '500', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.nombreProductoCambio || 'N/A'}
        </span>
      )
    },
    {
      header: 'Valor',
      field: 'precio',
      width: '85px',
      render: (item) => (
        <span style={{ color: '#F5C81B', fontSize: '12px', fontWeight: '600', display: 'block', textAlign: 'center' }}>
          ${parseInt(item.precio || 0).toLocaleString()}
        </span>
      )
    },
    {
      header: 'Motivo',
      field: 'motivo',
      width: '110px',
      render: (item) => (
        <span style={{ color: '#ffffff', fontSize: '11px', fontWeight: '400', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.motivoLabel || item.motivoDetalle || 'N/A'}
        </span>
      )
    },
    {
      header: 'Estado',
      field: 'estado',
      width: '90px',
      render: (item) => {
        const colors = { 'Pendiente': '#F5C81B', 'Aprobada': '#22c55e', 'Rechazada': '#ef4444' };
        return (
          <span style={{ color: colors[item.estado] || '#ffffff', fontSize: '11px', fontWeight: '600', display: 'block', textAlign: 'center' }}>
            {item.estado || 'Pendiente'}
          </span>
        );
      }
    },
  ];

  // =============== MANEJO DE DECISIÓN ===============
  const openDecisionModal = (devolucion, decision, fromEdit = false) => {
    if (devolucion?.isEmpty || devolucion.estado !== 'Pendiente') return;
    setDecisionModal({
      isOpen: true,
      devolucion,
      decision,
      razon: '',
      fromEdit
    });
  };

  const closeDecisionModal = () => {
    setDecisionModal({ isOpen: false, devolucion: null, decision: null, razon: '', fromEdit: false });
  };

  const handleDecisionSubmit = () => {
    if (!decisionModal.razon.trim()) {
      showAlert('Debe especificar una razón para esta decisión', 'delete');
      return;
    }

    const nuevoEstado = decisionModal.decision === 'aprobar' ? 'Aprobada' : 'Rechazada';

    setDevoluciones(prev => prev.map(d => 
      d.id === decisionModal.devolucion.id 
        ? { ...d, estado: nuevoEstado, isActive: decisionModal.decision === 'aprobar', razonAprobacion: decisionModal.razon.trim() }
        : d
    ));

    if (decisionModal.fromEdit && modalState.isOpen) {
      setFormData(prev => ({
        ...prev,
        status: nuevoEstado,
        razonAprobacion: decisionModal.razon.trim()
      }));
    }

    const accion = decisionModal.decision === 'aprobar' ? 'aprobada' : 'rechazada';
    showAlert(`Devolución "${decisionModal.devolucion.numeroDocumento}" ${accion} correctamente`, 'success');
    closeDecisionModal();
  };

  // =============== RENDER FIELD ===============
  const renderField = (label, fieldName, type = 'text', isReadOnly = false, isRequired = true) => {
    const devolucion = modalState.devolucion;
    const isError = errors[fieldName];
    const borderColor = isError ? '#ef4444' : '#334155';
    const backgroundColor = isError ? '#451a1a' : (isReadOnly ? '#334155' : '#1e293b');
    
    const labelStyle = { fontSize: '11px', color: '#e2e8f0', fontWeight: '500', marginBottom: '2px', display: 'block' };
    
    const inputBaseStyle = {
      backgroundColor, border: `1px solid ${borderColor}`, borderRadius: '4px', padding: '3px 6px',
      color: '#f1f5f9', fontSize: '12px', height: '28px', width: '100%', outline: 'none', boxSizing: 'border-box',
      cursor: isReadOnly ? 'not-allowed' : 'text'
    };
    
    const errorStyle = { 
      color: '#f87171', fontSize: '10px', marginTop: '1px', height: 'auto', minHeight: '14px', 
      visibility: isError ? 'visible' : 'hidden', display: 'flex', alignItems: 'center', gap: '3px' 
    };

    if (modalState.mode === 'view') {
      let displayValue = devolucion?.[fieldName] || 'N/A';
      if (['productoOriginalId', 'productoCambioId'].includes(fieldName)) {
        const prodField = fieldName === 'productoOriginalId' ? 'nombreProductoOriginal' : 'nombreProductoCambio';
        displayValue = devolucion?.[prodField] || 'N/A';
      } else if (fieldName === 'precio') {
        displayValue = `$${parseInt(devolucion?.precio || 0).toLocaleString()}`;
      } else if (fieldName === 'motivo') {
        displayValue = devolucion?.motivoLabel || devolucion?.motivoDetalle || 'N/A';
      } else if (fieldName === 'razonAprobacion') {
        displayValue = devolucion?.razonAprobacion || 'Sin observaciones';
      } else if (fieldName === 'numeroDocumento') {
        displayValue = devolucion?.numeroDocumento || 'N/A';
      }
      
      return (
        <div style={{ marginBottom: '6px', flex: 1 }}>
          <label style={labelStyle}>{label}: </label>
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '4px', padding: '3px 6px', color: '#f1f5f9', fontSize: '12px', minHeight: '28px', display: 'flex', alignItems: 'center' }}>
            {displayValue}
          </div>
        </div>
      );
    }

    const value = formData[fieldName] || '';
    const isSelectField = ['documentType', 'productoOriginalId', 'productoCambioId', 'status', 'motivo'].includes(fieldName);

    if (isSelectField) {
      let selectOptions = [], defaultLabel = `Seleccionar ${label.toLowerCase()}...`;
      
      if (['productoOriginalId', 'productoCambioId'].includes(fieldName)) {
        selectOptions = productos.map(p => ({ 
          value: p.id, 
          label: p.nombre, 
          precio: getProductPrice(p.id)
        }));
        defaultLabel = 'Buscar producto...';
      } else if (fieldName === 'status') {
        selectOptions = [
          { value: 'Pendiente', label: 'Pendiente' }, 
          { value: 'Aprobada', label: 'Aprobada' }, 
          { value: 'Rechazada', label: 'Rechazada' }
        ];
        defaultLabel = 'Seleccionar estado...';
      } else if (fieldName === 'documentType') {
        selectOptions = [
          { value: 'Cédula de Ciudadanía', label: 'Cédula de Ciudadanía' }, 
          { value: 'NIT', label: 'NIT' }, 
          { value: 'Pasaporte', label: 'Pasaporte' },
          { value: 'Cédula de Extranjería', label: 'Cédula de Extranjería' }
        ];
        defaultLabel = 'Seleccionar tipo...';
      } else if (fieldName === 'motivo') {
        selectOptions = motivosDevolucion;
        defaultLabel = 'Seleccionar motivo...';
      }

      return (
        <div style={{ marginBottom: '6px', flex: 1 }}>
          <label style={labelStyle}>{label}: {isRequired && <span style={{ color: '#ef4444' }}>*</span>}</label>
          <select
            name={fieldName} value={value}
            onChange={(e) => {
              const val = ['productoOriginalId', 'productoCambioId'].includes(fieldName) ? parseInt(e.target.value) : e.target.value;
              handleInputChange(fieldName, val);
              
              if (fieldName === 'productoOriginalId' || fieldName === 'productoCambioId') {
                setTimeout(() => validatePricesMatch(), 0);
              }
            }}
            onBlur={() => {
              if (fieldName === 'productoOriginalId' || fieldName === 'productoCambioId') {
                validatePricesMatch();
              }
            }}
            style={inputBaseStyle}
          >
            <option value="">{defaultLabel}</option>
            {selectOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label} - ${opt.precio?.toLocaleString()}
              </option>
            ))}
          </select>
          <div style={errorStyle}>
            {isError && (
              <>
                <span style={{color:'#f87171',fontWeight:'bold',fontSize:'12px'}}>⚠</span>
                <span>{isError}</span>
              </>
            )}
          </div>
        </div>
      );
    }

    if (fieldName === 'motivoDetalle' && formData.motivo === 'otro') {
      return (
        <div style={{ marginBottom: '6px', flex: 1 }}>
          <label style={labelStyle}>Especifique: <span style={{ color: '#ef4444' }}>*</span></label>
          <input name={fieldName} type="text" value={value} onChange={(e) => handleInputChange(fieldName, e.target.value)} style={inputBaseStyle} placeholder="Describa el motivo..." />
          <div style={errorStyle}>{isError && <><span style={{color:'#f87171',fontWeight:'bold'}}>●</span>{isError}</>}</div>
        </div>
      );
    }

    if (fieldName === 'razonAprobacion' && formData.status && formData.status !== 'Pendiente') {
      return (
        <div style={{ marginBottom: '6px', flex: 1 }}>
          <label style={labelStyle}>{formData.status === 'Aprobada' ? 'Razón aprobación:' : 'Razón rechazo:'} <span style={{ color: '#ef4444' }}>*</span></label>
          <textarea name={fieldName} value={value} onChange={(e) => handleInputChange(fieldName, e.target.value)} style={{...inputBaseStyle, height: '50px', resize: 'vertical', paddingTop: '6px'}} placeholder={formData.status === 'Aprobada' ? 'Motivo de aprobación...' : 'Motivo de rechazo...'} />
          <div style={errorStyle}>{isError && <><span style={{color:'#f87171',fontWeight:'bold'}}>●</span>{isError}</>}</div>
        </div>
      );
    }

    return (
      <div style={{ marginBottom: '6px', flex: 1 }}>
        <label style={labelStyle}>{label}:{isRequired && !isReadOnly && <span style={{ color: '#ef4444' }}> *</span>}</label>
        <input
          name={fieldName} type={type} value={value}
          onChange={(e) => !isReadOnly && handleInputChange(fieldName, e.target.value)}
          style={inputBaseStyle}
          readOnly={isReadOnly} min={type === 'number' ? 0 : undefined} step={type === 'number' ? 1 : undefined}
        />
        <div style={errorStyle}>{isError && !isReadOnly && <><span style={{color:'#f87171',fontWeight:'bold'}}>●</span>{isError}</>}</div>
      </div>
    );
  };

  // =============== CARGA INICIAL ===============
  useEffect(() => {
    const defaultDocumentType = 'Cédula de Ciudadanía';
    const mapped = initialReturns.map((d, i) => {
      const prodOrig = getProductById(d.IdProducto);
      const precio = prodOrig ? getProductPrice(d.IdProducto) : 0;
      return {
        id: d.IdDevolucion?.toString() || `dev-${i}`,
        numeroDocumento: d.cc?.toString() || `1000000${i + 1}`,
        documentType: d.tipoDocumento || defaultDocumentType,
        productoOriginalId: d.IdProducto,
        nombreProductoOriginal: getProductName(d.IdProducto),
        productoCambioId: d.IdProductoCambio || null,
        nombreProductoCambio: getProductName(d.IdProductoCambio),
        precio: precio,
        motivo: d.Motivo || 'cambio',
        motivoLabel: motivosDevolucion.find(m => m.value === d.Motivo)?.label || d.MotivoDetalle || d.Motivo,
        motivoDetalle: d.MotivoDetalle || '',
        estado: d.Estado || 'Pendiente',
        isActive: d.Estado === 'Aprobada',
        razonAprobacion: d.RazonAprobacion || '',
      };
    });
    
    const rowsNeeded = 7;
    const emptyRows = Array.from({ length: Math.max(0, rowsNeeded - mapped.length) }, (_, i) => ({
      id: `empty-${i}`, numeroDocumento: '', documentType: '', productoOriginalId: null, nombreProductoOriginal: '',
      productoCambioId: null, nombreProductoCambio: '', precio: 0, motivo: '', motivoLabel: '', motivoDetalle: '', 
      estado: '', isActive: false, razonAprobacion: '', isEmpty: true
    }));

    setDevoluciones([...mapped, ...emptyRows].slice(0, rowsNeeded));
    setProductos(initialProducts);
  }, []);

  // =============== UTILIDADES ===============
  const showAlert = (msg, type = 'success') => {
    setAlert({ show: true, message: msg, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleFilterSelect = (status) => { setFilterStatus(status); };

  // =============== MANEJO DE MODAL PRINCIPAL ===============
  const openModal = (mode = 'create', devolucion = null) => {
    if (devolucion?.isEmpty) return;
    setModalState({ isOpen: true, mode, devolucion });
    setErrors({});
    
    const defaults = {
      documentType: 'Cédula de Ciudadanía', documentNumber: '', productoOriginalId: '', precio: 0,
      productoCambioId: '', motivo: '', motivoDetalle: '', status: 'Pendiente', razonAprobacion: ''
    };

    if (devolucion && (mode === 'edit' || mode === 'view')) {
      setFormData({
        documentType: devolucion.documentType || defaults.documentType,
        documentNumber: devolucion.numeroDocumento || '',
        productoOriginalId: devolucion.productoOriginalId || '',
        productoCambioId: devolucion.productoCambioId || '',
        precio: devolucion.precio || 0,
        motivo: devolucion.motivo || '',
        motivoDetalle: devolucion.motivoDetalle || '',
        status: devolucion.estado || 'Pendiente',
        razonAprobacion: devolucion.razonAprobacion || '',
      });
    } else {
      setFormData(defaults);
    }
  };

  const closeModal = () => { setModalState({ isOpen: false, mode: 'view', devolucion: null }); setFormData({}); setErrors({}); };

  const handleInputChange = (field, value) => {
    if (errors[field]) setErrors(prev => { const n = {...prev}; delete n[field]; return n; });
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // =============== GUARDADO ===============
  const handleSave = () => {
    const required = ['documentType', 'documentNumber', 'productoOriginalId', 'productoCambioId', 'motivo'];
    const newErrors = {};
    
    required.forEach(f => {
      const v = formData[f];
      if (!String(v ?? '').trim() || (['productoOriginalId','productoCambioId'].includes(f) && !v)) 
        newErrors[f] = 'Campo obligatorio';
    });

    const precioOriginal = getProductPrice(formData.productoOriginalId);
    const precioCambio = getProductPrice(formData.productoCambioId);

    if (formData.productoOriginalId && formData.productoCambioId && precioOriginal !== precioCambio) {
      newErrors.productoCambioId = `Los precios no coinciden: Original $${precioOriginal.toLocaleString()} ≠ Cambio $${precioCambio.toLocaleString()}`;
    }

    if (formData.motivo === 'otro' && !formData.motivoDetalle?.trim()) 
      newErrors.motivoDetalle = 'Especifique el motivo';

    if (formData.status && formData.status !== 'Pendiente' && !formData.razonAprobacion?.trim())
      newErrors.razonAprobacion = 'Indique una razón';

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) { 
      showAlert('Revise los campos marcados en rojo', 'delete'); 
      const firstError = Object.keys(newErrors)[0];
      if (firstError) {
        const element = document.querySelector(`[name="${firstError}"]`);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return; 
    }

    const motivoLabel = formData.motivo === 'otro' ? formData.motivoDetalle : motivosDevolucion.find(m => m.value === formData.motivo)?.label || formData.motivo;
    const estadoFinal = modalState.mode === 'create' ? 'Pendiente' : (formData.status || 'Pendiente');

    const updatedData = {
      numeroDocumento: formData.documentNumber,
      documentType: formData.documentType,
      productoOriginalId: formData.productoOriginalId,
      nombreProductoOriginal: getProductName(formData.productoOriginalId),
      productoCambioId: formData.productoCambioId,
      nombreProductoCambio: getProductName(formData.productoCambioId),
      precio: precioOriginal,
      motivo: formData.motivo,
      motivoLabel,
      motivoDetalle: formData.motivo === 'otro' ? formData.motivoDetalle : '',
      estado: estadoFinal,
      isActive: estadoFinal === 'Aprobada',
      razonAprobacion: formData.razonAprobacion || '',
      isEmpty: false
    };

    if (modalState.mode === 'edit' && modalState.devolucion?.id) {
      setDevoluciones(prev => prev.map(d => d.id === modalState.devolucion.id ? { ...d, ...updatedData } : d));
      showAlert(`Devolución "${updatedData.numeroDocumento}" actualizada`, 'edit');
    } else {
      const newId = `dev-${Date.now()}`;
      setDevoluciones(prev => {
        const idx = prev.findIndex(d => d.isEmpty);
        if (idx !== -1) { const arr = [...prev]; arr[idx] = { ...updatedData, id: newId }; return arr; }
        return [...prev, { ...updatedData, id: newId }];
      });
      showAlert(`Devolución "${updatedData.numeroDocumento}" creada`, 'add');
    }
    closeModal();
  };

  // =============== FILTROS ===============
  const filtered = devoluciones.filter(d => {
    if (d.isEmpty) return true;
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return d.nombreProductoOriginal?.toLowerCase().includes(t) || 
           d.nombreProductoCambio?.toLowerCase().includes(t) || 
           d.numeroDocumento?.toLowerCase().includes(t) || 
           d.estado?.toLowerCase().includes(t) || 
           d.motivoLabel?.toLowerCase().includes(t) || 
           d.documentType?.toLowerCase().includes(t);
  });

  const paginated = filtered.slice(0, 7);
  const realCount = devoluciones.filter(d => !d.isEmpty).length;
  const showingEnd = Math.min(realCount, 7);

  const StatusFilter = () => {
    const [open, setOpen] = useState(false);
    
    return (
      <div style={{ position: 'relative' }}>
        <button 
          onClick={() => setOpen(!open)} 
          style={{ display:'flex', alignItems:'center', gap:'4px', padding:'4px 8px', backgroundColor:'transparent', border:'1px solid #F5C81B', color:'#F5C81B', borderRadius:'4px', fontSize:'11px', cursor:'pointer', minWidth:'80px', justifyContent:'space-between', fontWeight:'600', height:'28px' }}
          onMouseEnter={e => { e.target.style.backgroundColor='#F5C81B'; e.target.style.color='#000'; }}
          onMouseLeave={e => { e.target.style.backgroundColor='transparent'; e.target.style.color='#F5C81B'; }}
        >
          {filterStatus} 
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: open?'rotate(180deg)':'rotate(0deg)', transition:'transform 0.2s' }}>
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>
        
        {open && (
          <div style={{ position:'absolute', top:'100%', right:0, marginTop:'2px', backgroundColor:'#1F2937', border:'1px solid #F5C81B', borderRadius:'4px', padding:'3px 0', minWidth:'80px', zIndex:1000 }}>
            {['Todos','Pendiente','Aprobada','Rechazada'].map(s => (
              <button 
                key={s} 
                onClick={() => { handleFilterSelect(s); setOpen(false); }} 
                style={{ width:'100%', padding:'3px 6px', backgroundColor:filterStatus===s?'#F5C81B':'transparent', border:'none', color:filterStatus===s?'#000':'#F5C81B', fontSize:'11px', textAlign:'left', cursor:'pointer', fontWeight:filterStatus===s?'600':'400' }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // =============== RENDER PRINCIPAL ===============
  return (
    <>
      {alert.show && <Alert message={alert.message} type={alert.type} onClose={() => setAlert({ show: false, message: '', type: 'success' })} />}
      
      <div style={{ display: "flex", flexDirection: "column", padding: "4px 12px 0 12px", flex: 1, height: "100%" }}>
        {/* Encabezado */}
        <div style={{ marginBottom: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <div>
              <h1 style={{ color: "#fff", fontSize: "20px", fontWeight: "700", margin: 0 }}>Devoluciones</h1>
              <p style={{ color: "#9CA3AF", fontSize: "15px", margin: 0 }}>Gestión de cambios por mismo valor</p>
            </div>
            <button 
              onClick={() => openModal("create")} 
              style={{ padding: "6px 13px", backgroundColor: "transparent", border: "1px solid #F5C81B", color: "#F5C81B", borderRadius: "4px", fontSize: "11px", cursor: "pointer", fontWeight: "600", display: "flex", alignItems: "center", gap: "3px", height: "35px" }}
              onMouseEnter={(e) => { e.target.style.backgroundColor= "#F5C81B"; e.target.style.color= "#000"; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor= "transparent"; e.target.style.color= "#F5C81B"; }}
            >
              Registrar Devolución
            </button>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por producto, documento o motivo..." onClear={() => setSearchTerm('')} fullWidth={true} />
            </div>
            <StatusFilter />
          </div>
        </div>

        {/* Tabla */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: '6px', border: '1px solid #F5C81B', overflow: 'hidden', backgroundColor: '#000' }}>
          <div style={{ flex: 1, overflow: 'auto' }}>
            <EntityTable 
              entities={paginated} 
              columns={columns} 
              onView={d => openModal('view', d)} 
              onEdit={d => openModal('edit', d)} 
              // ❌ NO se pasa onDelete - Por eso no aparece la papelera
              customActions={(devolucion) => {
                if (devolucion.isEmpty) return null;
                return (
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                    {devolucion.estado === 'Pendiente' && (
                      <>
                        <button 
                          onClick={(e) => { e.stopPropagation(); openDecisionModal(devolucion, 'aprobar'); }}
                          title="Aprobar devolución"
                          style={{ backgroundColor: '#22c55e', border: 'none', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '600', cursor: 'pointer', minWidth: '50px', height: '24px' }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#16a34a'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#22c55e'}
                        >
                          ✓ Aprobar
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); openDecisionModal(devolucion, 'rechazar'); }}
                          title="Rechazar devolución"
                          style={{ backgroundColor: '#ef4444', border: 'none', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '600', cursor: 'pointer', minWidth: '50px', height: '24px' }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
                        >
                          ✕ Rechazar
                        </button>
                      </>
                    )}
                  </div>
                );
              }}
              idField="id" 
              estadoField="isActive" 
              showSwitch={false} 
              moduleType="generic"
              style={{ border: 'none', borderRadius: '0' }}
              tableStyle={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}
              headerStyle={{ padding: '6px 4px', textAlign: 'left', fontWeight: '600', fontSize: '11px', color: '#F5C81B', borderBottom: '1px solid #F5C81B', backgroundColor: '#151822' }}
              rowHeight="40px" 
              headerHeight="35px"
              actionButtonsStyle={{ padding: '2px 4px', fontSize: '10px' }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", backgroundColor: "#151822", borderTop:'1px solid #F5C81B', fontSize: "12px", color: "#e0e0e0", height: "48px" }}>
            <span style={{ fontWeight:'500' }}>Mostrando 1–{showingEnd} de {realCount} devoluciones</span>
            <span style={{ padding:'6px 12px', fontSize:'12px', fontWeight:'600', color:'#F5C81B', minWidth:'60px', textAlign:'center' }}>Página 1 de 1</span>
          </div>
        </div>
      </div>

      {/* MODAL CREACIÓN/EDICIÓN */}
      <UniversalModal 
        isOpen={modalState.isOpen && (modalState.mode === 'create' || modalState.mode === 'edit')} 
        onClose={closeModal}
        title={modalState.mode === 'create' ? 'Registrar Devolución' : 'Editar Devolución'}
        subtitle={modalState.mode === 'create' ? 'Seleccione productos del mismo valor para el cambio' : 'Modifique la información'}
        showActions={false}
        customStyles={{ content: { padding:'12px', backgroundColor:'#000', border:'1px solid rgba(255,215,0,0.25)', borderRadius:'8px', maxWidth:'440px', width:'100%' } }}
      >
        <div style={{ display:'flex', flexDirection:'column', gap:'4px', maxHeight:'75vh', overflowY:'auto', padding:'0 0 6px 0' }}>
          <div style={{ display:'flex', gap:'6px' }}>
            {renderField('Tipo Doc.', 'documentType', 'select', false, true)} 
            {renderField('N° Documento', 'documentNumber', 'text', false, true)}
          </div>
          <div style={{ display:'flex', gap:'6px' }}>
            {renderField('Producto Original', 'productoOriginalId', 'select', false, true)} 
            {renderField('Producto Cambio', 'productoCambioId', 'select', false, true)}
          </div>
          <div>{renderField('Valor del Producto', 'precio', 'number', true, false)}</div>
        
          {errors.productoCambioId?.includes('Precio no coincide') && (
            <div style={{ backgroundColor: '#451a1a', border: '1px solid #ef4444', borderRadius: '4px', padding: '8px', fontSize: '11px', color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{fontSize:'14px'}}>⚠</span>
              <span>{errors.productoCambioId}</span>
            </div>
          )}
          {formData.productoOriginalId && formData.productoCambioId && !errors.productoCambioId?.includes('Precio no coincide') && (
            <div style={{ backgroundColor: '#1e293b', border: '1px solid #22c55e', borderRadius: '4px', padding: '6px', fontSize: '11px', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>✓</span>
              <span>Los precios coinciden: ${parseInt(formData.precio || 0).toLocaleString()}</span>
            </div>
          )}
        
          <div>{renderField('Motivo', 'motivo', 'select', false, true)}</div>
          {formData.motivo === 'otro' && modalState.mode !== 'view' && <div>{renderField('Detalle', 'motivoDetalle', 'text', false, true)}</div>}
        
          {modalState.mode === 'edit' && formData.status === 'Pendiente' && (
            <div style={{ 
              backgroundColor: '#1e293b', border: '1px solid #F5C81B', borderRadius: '6px', 
              padding: '8px', margin: '4px 0', display: 'flex', flexDirection: 'column', gap: '6px' 
            }}>
              <span style={{ fontSize: '11px', color: '#F5C81B', fontWeight: '600' }}>Decisión de la devolución:</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  onClick={() => openDecisionModal({ ...modalState.devolucion, ...formData }, 'aprobar', true)}
                  style={{ 
                    flex: 1, backgroundColor: '#22c55e', border: 'none', color: '#fff', 
                    padding: '6px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: '600',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#16a34a'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#22c55e'}
                >
                  ✓ Aprobar
                </button>
                <button 
                  onClick={() => openDecisionModal({ ...modalState.devolucion, ...formData }, 'rechazar', true)}
                  style={{ 
                    flex: 1, backgroundColor: '#ef4444', border: 'none', color: '#fff', 
                    padding: '6px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: '600',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
                >
                  ✕ Rechazar
                </button>
              </div>
            </div>
          )}
        
          {modalState.mode === 'edit' && formData.status && formData.status !== 'Pendiente' && (
            <>
              <div>{renderField('Estado', 'status', 'select', false, true)}</div>
              <div>{renderField('Observación', 'razonAprobacion', 'text', false, true)}</div>
            </>
          )}
        
          <div style={{ display:'flex', justifyContent:'flex-end', gap:'6px', marginTop:'8px', padding:'8px 0 0 0', borderTop:'1px solid #334155' }}>
            <button onClick={closeModal} style={{ backgroundColor:'transparent', border:'1px solid #94a3b8', color:'#94a3b8', padding:'4px 12px', borderRadius:'4px', fontSize:'11px', fontWeight:'500', cursor:'pointer', minWidth:'70px', height:'30px' }}>Cancelar</button>
            <button onClick={handleSave} style={{ backgroundColor:'#F5C81B', border:'none', color:'#0f172a', padding:'4px 12px', borderRadius:'4px', fontSize:'11px', fontWeight:'600', cursor:'pointer', minWidth:'80px', height:'30px' }}>{modalState.mode === 'create' ? 'Guardar' : 'Guardar Cambios'}</button>
          </div>
        </div>
      </UniversalModal>

      {/* MODAL VISTA */}
      {modalState.isOpen && modalState.mode === 'view' && (
        <UniversalModal 
          isOpen={modalState.isOpen} 
          onClose={closeModal} 
          title="Detalles de la Devolución" 
          subtitle="Información detallada" 
          showActions={false}
          customStyles={{ content: { padding:'12px', backgroundColor:'#000', border:'1px solid rgba(255,215,0,0.25)', borderRadius:'8px', maxWidth:'420px', width:'100%' } }}
        >
          <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
            <div style={{ display:'flex', gap:'6px' }}>
              {renderField('Tipo Doc.', 'documentType')} 
              {renderField('N° Documento', 'numeroDocumento')}
            </div>
            <div style={{ display:'flex', gap:'6px' }}>
              {renderField('Producto Original', 'productoOriginalId')} 
              {renderField('Producto Cambio', 'productoCambioId')}
            </div>
            <div>{renderField('Valor', 'precio')}</div>
            <div>{renderField('Motivo', 'motivo')}</div>
            <div style={{ display:'flex', gap:'6px' }}>
              {renderField('Estado', 'estado')} 
              {renderField('Observación', 'razonAprobacion')}
            </div>
          </div>
        </UniversalModal>
      )}

      {/* MODAL DE DECISIÓN (APROBAR/RECHAZAR) */}
      <UniversalModal 
        isOpen={decisionModal.isOpen} 
        onClose={closeDecisionModal}
        title={decisionModal.decision === 'aprobar' ? '✅ Aprobar Devolución' : '❌ Rechazar Devolución'}
        subtitle={`Documento: ${decisionModal.devolucion?.numeroDocumento || ''}`}
        showActions={false}
        customStyles={{ content: { padding:'12px', backgroundColor:'#000', border:`1px solid ${decisionModal.decision === 'aprobar' ? '#22c55e' : '#ef4444'}`, borderRadius:'8px', maxWidth:'420px', width:'100%' } }}
      >
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          <div style={{ fontSize:'12px', color:'#94a3b8' }}>
            {decisionModal.decision === 'aprobar' 
              ? '¿Confirmar aprobación? El cambio se procesará automáticamente.' 
              : '¿Confirmar rechazo? El cliente será notificado.'}
          </div>
          <div>
            <label style={{ fontSize:'11px', color:'#e2e8f0', fontWeight:'500', marginBottom:'4px', display:'block' }}>
              {decisionModal.decision === 'aprobar' ? 'Razón de aprobación:' : 'Razón de rechazo:'} <span style={{color:'#ef4444'}}>*</span>
            </label>
            <textarea 
              value={decisionModal.razon}
              onChange={(e) => setDecisionModal(prev => ({...prev, razon: e.target.value}))}
              placeholder={decisionModal.decision === 'aprobar' ? 'Ej: Productos verificados, cambio autorizado...' : 'Ej: Productos en diferente estado, no cumple política...'}
              style={{ 
                backgroundColor:'#1e293b', border:'1px solid #334155', borderRadius:'4px', padding:'8px',
                color:'#f1f5f9', fontSize:'12px', width:'100%', minHeight:'70px', resize:'vertical', outline:'none'
              }}
            />
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:'6px', marginTop:'4px' }}>
            <button 
              onClick={closeDecisionModal} 
              style={{ backgroundColor:'transparent', border:'1px solid #94a3b8', color:'#94a3b8', padding:'4px 12px', borderRadius:'4px', fontSize:'11px', fontWeight:'500', cursor:'pointer', minWidth:'70px', height:'30px' }}
            >
              Cancelar
            </button>
            <button 
              onClick={handleDecisionSubmit}
              style={{ 
                backgroundColor: decisionModal.decision === 'aprobar' ? '#22c55e' : '#ef4444', 
                border:'none', color:'#fff', padding:'4px 12px', borderRadius:'4px', 
                fontSize:'11px', fontWeight:'600', cursor:'pointer', minWidth:'90px', height:'30px' 
              }}
            >
              {decisionModal.decision === 'aprobar' ? '✓ Confirmar' : '✕ Confirmar'}
            </button>
          </div>
        </div>
      </UniversalModal>
    </>
  );
};

export default DevolucionesPage;