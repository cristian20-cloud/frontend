// src/pages/admin/DevolucionesPage.jsx
import React, { useState, useEffect } from 'react';
import EntityTable from '../../components/EntityTable';
import Alert from '../../components/Alert';
import SearchInput from '../../components/SearchInput';
import UniversalModal from '../../components/UniversalModal';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import { initialReturns, initialProducts } from '../../data'; 

const DevolucionesPage = () => {
  // =============== ESTADOS ===============
  const [devoluciones, setDevoluciones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  // ELIMINADO: const [currentPage, setCurrentPage] = useState(1);
  // ELIMINADO: const [itemsPerPage] = useState(7);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [modalState, setModalState] = useState({ isOpen: false, mode: 'view', devolucion: null });
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [productos, setProductos] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, devolucion: null });

  // Función de utilidad para obtener el nombre del producto
  const getProductName = (productId) => {
    if (!productId) return 'N/A';
    const product = initialProducts.find(p => p.id === productId); 
    return product ? product.nombre : `ID: ${productId} (Desconocido)`;
  };

  // =============== COLUMNAS TABLA (MÁS COMPACTAS) ===============
  const columns = [
    { 
      header: 'CC',
      field: 'numeroDocumento', 
      width: '100px',
      render: (item) => (
        <span style={{ 
          color: '#ffffff',
          fontSize: '12px',
          fontWeight: '400',
          display: 'block',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {item.numeroDocumento || 'N/A'}
        </span>
      )
    },
    { 
      header: 'Producto', 
      field: 'nombreProducto', 
      width: '180px',
      render: (item) => (
        <span style={{ 
          color: '#ffffff', 
          fontSize: '12px', 
          fontWeight: '500',
          display: 'block',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {item.nombreProducto || 'N/A'}
        </span>
      )
    },
    { 
      header: 'Cantidad', 
      field: 'cantidad', 
      width: '80px',
      render: (item) => (
        <span style={{ 
          color: '#ffffff', 
          fontSize: '12px', 
          fontWeight: '600',
          display: 'block',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          textAlign: 'center',
          width: '100%',
        }}>
          {item.cantidad || '0'}
        </span>
      )
    },
    { 
      header: 'Monto', 
      field: 'monto', 
      width: '100px',
      render: (item) => (
        <span style={{ 
          color: '#ffffff', 
          fontSize: '12px', 
          fontWeight: '600',
          display: 'block',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          ${parseInt(item.monto || '0').toLocaleString()}
        </span>
      )
    },
    { 
      header: 'Fecha', 
      field: 'fecha', 
      width: '100px',
      render: (item) => (
        <span style={{ 
          color: '#ffffff', 
          fontSize: '12px', 
          fontWeight: '400',
          display: 'block',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {item.fecha || 'N/A'}
        </span>
      )
    },
  ];

  // =============== MANEJO DEL SWITCH ===============
  const handleToggleActivo = (devolucion) => {
    if (devolucion?.isEmpty) return;
    
    const nuevoEstado = !devolucion.isActive;
    const estadoTexto = nuevoEstado ? 'Activada' : 'Desactivada';
    
    setDevoluciones(prev => prev.map(d => 
      d.id === devolucion.id 
        ? { 
            ...d, 
            isActive: nuevoEstado,
            estado: nuevoEstado ? 'Aprobada' : 'Rechazada'
          }
        : d
    ));
    
    showAlert(`Devolución con CC "${devolucion.numeroDocumento}" ${estadoTexto.toLowerCase()} correctamente`, 'success');
  };

  // =============== RENDER FIELD ===============
  const renderField = (label, fieldName, type = 'text') => { // ELIMINADO: options = []
    const devolucion = modalState.devolucion;
    const isError = errors[fieldName];
    const borderColor = isError ? '#ef4444' : '#334155';
    const backgroundColor = isError ? '#451a1a' : '#1e293b';

    const labelStyle = {
      fontSize: '11px',
      color: '#e2e8f0',
      fontWeight: '500',
      marginBottom: '2px',
      display: 'block'
    };

    const inputBaseStyle = {
      backgroundColor,
      border: `1px solid ${borderColor}`,
      borderRadius: '4px',
      padding: '3px 6px',
      color: '#f1f5f9',
      fontSize: '12px',
      height: '28px',
      width: '100%',
      outline: 'none',
      boxSizing: 'border-box',
      fontFamily: 'inherit',
    };

    const errorStyle = {
      color: '#f87171',
      fontSize: '10px',
      fontWeight: '500',
      marginTop: '1px',
      height: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '3px',
      visibility: isError ? 'visible' : 'hidden',
    };

    if (modalState.mode === 'view') {
      let displayValue = devolucion?.[fieldName] || 'N/A';
      
      if (fieldName === 'productoId') {
        displayValue = devolucion?.nombreProducto || 'N/A';
      } else if (fieldName === 'monto') { 
        const amountValue = devolucion?.[fieldName] !== undefined && devolucion?.[fieldName] !== null ? devolucion[fieldName] : 0;
        displayValue = `$${parseInt(amountValue).toLocaleString()}`;
      } else if (fieldName === 'estado') { 
        displayValue = devolucion?.estado || 'N/A';
      } else if (fieldName === 'documentType') {
        displayValue = devolucion?.documentType || 'Cédula de Ciudadanía'; 
      }

      return (
        <div style={{ marginBottom: '6px', flex: 1 }}>
          <label style={labelStyle}>
            {label}:
          </label>
          <div style={{ 
            backgroundColor: '#1e293b', 
            border: '1px solid #334155', 
            borderRadius: '4px', 
            padding: '3px 6px',
            color: '#f1f5f9', 
            fontSize: '12px', 
            minHeight: '28px',
            display: 'flex', 
            alignItems: 'center', 
            fontWeight: '400',
            width: '100%', 
          }}>
            {displayValue}
          </div>
        </div>
      );
    } else {
      const value = formData[fieldName] || '';
      const isSelectField = ['documentType', 'productoId', 'status'].includes(fieldName); 

      if (isSelectField) {
        let selectOptions = [];
        let defaultOptionLabel = `Seleccionar ${label.toLowerCase()}...`;
        
        if (fieldName === 'productoId') {
            selectOptions = productos;
            selectOptions = selectOptions.map(p => ({ value: p.id, label: p.nombre })); 
        } else if (fieldName === 'status') {
            selectOptions = [
                { value: 'Pendiente', label: 'Pendiente' },
                { value: 'Aprobada', label: 'Aprobada' },
                { value: 'Rechazada', label: 'Rechazada' },
            ];
            defaultOptionLabel = 'Seleccionar estado...';
        } else if (fieldName === 'documentType') { 
            selectOptions = [
                { value: 'Cédula de Ciudadanía', label: 'Cédula de Ciudadanía' },
                { value: 'NIT', label: 'NIT' },
                { value: 'Pasaporte', label: 'Pasaporte' },
            ];
            defaultOptionLabel = 'Seleccionar tipo...';
        }

        return (
          <div style={{ marginBottom: '6px', flex: 1 }}> 
            <label style={labelStyle}>
              {label}: <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              name={fieldName}
              value={value}
              onChange={(e) => {
                const val = fieldName === 'productoId' ? parseInt(e.target.value) : e.target.value;
                handleInputChange(fieldName, val);
              }}
              style={inputBaseStyle}
            >
              <option value="">{defaultOptionLabel}</option>
              {selectOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label} 
                </option>
              ))}
            </select>
            <div style={errorStyle}>
              {isError && (
                <>
                  <span style={{ color: '#f87171', fontSize: '10px', fontWeight: 'bold' }}>●</span>
                  {isError}
                </>
              )}
            </div>
          </div>
        );
      } else {
        const isIntegerField = ['documentNumber', 'quantity', 'monto'].includes(fieldName);
        const inputType = isIntegerField ? 'number' : type;

        return (
          <div style={{ marginBottom: '6px', flex: 1 }}> 
            <label style={labelStyle}>
              {label}: <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              name={fieldName}
              type={inputType}
              value={value}
              onChange={(e) => {
                if (isIntegerField) {
                  const val = e.target.value;
                  if (val === '' || /^\d*$/.test(val)) { 
                    handleInputChange(fieldName, val);
                  }
                } else {
                  handleInputChange(fieldName, e.target.value);
                }
              }}
              style={inputBaseStyle}
              min={fieldName === 'quantity' || fieldName === 'monto' ? 0 : undefined}
              step={1} 
            />
            <div style={errorStyle}>
              {isError && (
                <>
                  <span style={{ color: '#f87171', fontSize: '10px', fontWeight: 'bold' }}>●</span>
                  {isError}
                </>
              )}
            </div>
          </div>
        );
      }
    }
  };

  // =============== CARGA INICIAL ===============
  useEffect(() => {
    const defaultDocumentType = 'Cédula de Ciudadanía';

    const mapped = initialReturns.map((d, i) => ({
      id: d.IdDevolucion?.toString() || `dev-${i}`,
      numeroDocumento: d.cc?.toString() || `1000000${i + 1}`,
      documentType: defaultDocumentType, 
      productoId: d.IdProducto, 
      nombreProducto: getProductName(d.IdProducto), 
      cantidad: d.Cantidad,
      monto: d.Monto,
      fecha: new Date(d.Fecha).toISOString().split('T')[0],
      estado: d.Estado || 'Pendiente',
      isActive: d.Estado === 'Aprobada',
    }));

    const rowsNeeded = 7;
    const emptyRowsNeeded = Math.max(0, rowsNeeded - mapped.length);
    const emptyRows = Array.from({ length: emptyRowsNeeded }, (_, i) => ({
      id: `empty-${i}`,
      numeroDocumento: '',
      documentType: '',
      productoId: null,
      nombreProducto: '',
      cantidad: '',
      monto: '',
      fecha: '',
      estado: '',
      isActive: false,
      isEmpty: true
    }));

    const allRows = [...mapped, ...emptyRows].slice(0, rowsNeeded);
    setDevoluciones(allRows);
    setProductos(initialProducts);
  }, []);

  // =============== UTILIDADES ===============
  const showAlert = (msg, type = 'success') => {
    setAlert({ show: true, message: msg, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3000);
  };

  // ELIMINADO: const clearSearch = () => { 
  //   setSearchTerm(''); 
  //   setCurrentPage(1); 
  // };

  const handleFilterSelect = (status) => { 
    setFilterStatus(status); 
  };

  // =============== MANEJO DE MODAL ===============
  const openModal = (mode = 'create', devolucion = null) => {
    if (devolucion?.isEmpty) return;
    
    setModalState({ isOpen: true, mode, devolucion });
    setErrors({});
    
    const defaultDocumentType = 'Cédula de Ciudadanía';

    if (devolucion && (mode === 'edit' || mode === 'view')) {
      setFormData({
        documentType: devolucion.documentType || defaultDocumentType, 
        documentNumber: devolucion.numeroDocumento || '',
        productoId: devolucion.productoId || '', 
        quantity: devolucion.cantidad || '',
        monto: devolucion.monto || '0', 
        date: devolucion.fecha || new Date().toISOString().split('T')[0],
        status: devolucion.estado || 'Pendiente',
      });
    } else if (mode === 'create') {
      setFormData({
        documentType: defaultDocumentType, 
        documentNumber: '', 
        productoId: '',
        quantity: '',
        monto: '0', 
        date: new Date().toISOString().split('T')[0],
        status: 'Pendiente', 
      });
    }
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: 'view', devolucion: null });
    setFormData({});
    setErrors({});
  };

  // =============== MANEJO DE ELIMINACIÓN ===============
  const openDeleteModal = (devolucion) => {
    if (devolucion?.isEmpty) return;
    setDeleteModal({ isOpen: true, devolucion });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, devolucion: null });
  };

  const handleDelete = () => {
    if (deleteModal.devolucion) {
      const devolucionId = deleteModal.devolucion.numeroDocumento;
      
      setDevoluciones(prev => prev.map(d => 
        d.id === deleteModal.devolucion.id 
          ? {
              id: `empty-${Date.now()}`,
              numeroDocumento: '',
              documentType: '',
              productoId: null,
              nombreProducto: '',
              cantidad: '',
              monto: '',
              fecha: '',
              estado: '',
              isActive: false,
              isEmpty: true
            }
          : d
      ));
      
      showAlert(`Devolución con CC "${devolucionId}" eliminada correctamente`, 'delete');
      closeDeleteModal();
    }
  };

  const handleInputChange = (field, value) => {
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // =============== GUARDADO ===============
  const handleSave = () => {
    const requiredFields = [
      { name: 'documentType', label: 'Tipo de documento' }, 
      { name: 'documentNumber', label: 'Número de documento (CC)' },
      { name: 'productoId', label: 'Nombre del producto' },
      { name: 'quantity', label: 'Cantidad' },
      { name: 'date', label: 'Fecha' },
      ...(modalState.mode === 'edit' ? [{ name: 'status', label: 'Estado' }] : []), 
    ];

    const newErrors = {};
    requiredFields.forEach(field => {
      const value = formData[field.name];
      const stringValue = value !== null && value !== undefined ? String(value) : '';
      if (!stringValue.trim() || stringValue === '0' || (field.name === 'productoId' && value === 0)) { 
        newErrors[field.name] = `${field.label} es obligatorio`;
      }
    });

    const intFields = ['documentNumber', 'quantity', 'monto'];
    intFields.forEach(field => {
        const value = String(formData[field] || '');
        if (value.trim() && !/^\d+$/.test(value)) {
            newErrors[field] = `${requiredFields.find(f => f.name === field)?.label || field} debe ser un número entero válido`;
        }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      showAlert('Complete los campos obligatorios correctamente', 'delete');
      return;
    }
    
    const resolvedProductName = getProductName(formData.productoId);
    const estadoFinal = modalState.mode === 'create' ? 'Pendiente' : (formData.status || 'Pendiente');

    const updatedData = {
      numeroDocumento: formData.documentNumber,
      documentType: formData.documentType, 
      productoId: formData.productoId, 
      nombreProducto: resolvedProductName, 
      cantidad: parseInt(formData.quantity),
      monto: parseInt(formData.monto), 
      fecha: formData.date,
      estado: estadoFinal,
      isActive: estadoFinal === 'Aprobada',
      isEmpty: false
    };

    if (modalState.mode === 'edit' && modalState.devolucion?.id) {
      setDevoluciones(prev => prev.map(d => 
        d.id === modalState.devolucion.id 
          ? { ...d, ...updatedData }
          : d
      ));
      showAlert(`Devolución con CC "${updatedData.numeroDocumento}" actualizada correctamente`, 'edit');
    } else {
      const newId = `dev-${Date.now()}`;
      const newDevolucion = { ...updatedData, id: newId };
      
      setDevoluciones(prev => {
        const index = prev.findIndex(d => d.isEmpty);
        if (index !== -1) {
          const newArray = [...prev];
          newArray[index] = newDevolucion;
          return newArray;
        }
        return [...prev, newDevolucion];
      });
      
      showAlert(`Devolución con CC "${updatedData.numeroDocumento}" creada correctamente`, 'add');
    }
    closeModal();
  };

  // =============== FILTROS ===============
  const filtered = devoluciones.filter(devolucion => {
    if (devolucion.isEmpty) return true;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        devolucion.nombreProducto?.toLowerCase().includes(term) ||
        devolucion.numeroDocumento?.toLowerCase().includes(term) ||
        devolucion.estado?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const paginated = filtered.slice(0, 7);
  const realDevolucionesCount = devoluciones.filter(d => !d.isEmpty).length;
  const showingEnd = Math.min(realDevolucionesCount, 7);

  // =============== COMPONENTE FILTRO DE ESTADO ===============
  const StatusFilter = () => {
    const [open, setOpen] = useState(false);
    return (
      <div style={{ position: 'relative' }}>
        <button 
          onClick={() => setOpen(!open)} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px', 
            padding: '4px 8px',
            backgroundColor: 'transparent', 
            border: '1px solid #F5C81B', 
            color: '#F5C81B', 
            borderRadius: '4px', 
            fontSize: '11px',
            cursor: 'pointer', 
            whiteSpace: 'nowrap', 
            minWidth: '80px',
            justifyContent: 'space-between', 
            fontWeight: '600', 
            height: '28px',
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
          <span>{filterStatus}</span>
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
            <polyline points="6,9 12,15 18,9"/>
          </svg>
        </button>
        {open && (
          <div style={{ 
            position: 'absolute', 
            top: '100%', 
            right: 0, 
            marginTop: '2px', 
            backgroundColor: '#1F2937', 
            border: '1px solid #F5C81B', 
            borderRadius: '4px', 
            padding: '3px 0',
            minWidth: '80px',
            zIndex: 1000, 
            boxShadow: '0 2px 8px rgba(245, 200, 27, 0.3)' 
          }}>
            {['Todos'].map(status => (
              <button 
                key={status} 
                onClick={() => { handleFilterSelect(status); setOpen(false); }} 
                style={{ 
                  width: '100%', 
                  padding: '3px 6px',
                  backgroundColor: filterStatus === status ? '#F5C81B' : 'transparent', 
                  border: 'none', 
                  color: filterStatus === status ? '#000' : '#F5C81B', 
                  fontSize: '11px',
                  textAlign: 'left', 
                  cursor: 'pointer', 
                  fontWeight: filterStatus === status ? '600' : '400' 
                }}
                onMouseEnter={e => filterStatus !== status && (
                  e.target.style.backgroundColor = '#F5C81B',
                  e.target.style.color = '#000'
                )}
                onMouseLeave={e => filterStatus !== status && (
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

  // =============== RENDER PRINCIPAL ===============
  return (
    <>
      {alert.show && (
        <Alert 
          message={alert.message} 
          type={alert.type} 
          onClose={() => setAlert({ show: false, message: '', type: 'success' })} 
        />
      )}
      
      <div style={{ display: "flex", flexDirection: "column", padding: "4px 12px 0 12px", flex: 1, height: "100%" }}>
        {/* Encabezado */}
        <div style={{ marginBottom: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <div>
              <h1 style={{ color: "#fff", fontSize: "20px", fontWeight: "700", margin: 0, lineHeight: "1.2" }}>
                Devoluciones
              </h1>
              <p style={{ color: "#9CA3AF", fontSize: "15px", margin: 0, lineHeight: "1.3" }}>
                Gestión de devoluciones
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
                Registrar Devolución
              </button>
            </div>
          </div>
          
          {/* Buscador y Filtro */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar por producto o número..."
                onClear={() => setSearchTerm('')}
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
              onView={devolucion => openModal('view', devolucion)} 
              onEdit={devolucion => openModal('edit', devolucion)} 
              onDelete={openDeleteModal}
              onAnular={handleToggleActivo}
              onReactivar={handleToggleActivo}
              idField="id"
              estadoField="isActive"
              showSwitch={true}
              moduleType="generic"
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
              rowHeight="40px"
              headerHeight="35px"
              switchProps={{
                activeColor: '#22c55e',
                inactiveColor: '#ef4444',
                size: 'small'
              }}
              actionButtonsStyle={{
                padding: '2px 4px',
                fontSize: '10px'
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
            <span style={{ fontWeight: '500' }}>
              Mostrando 1–{showingEnd} de {realDevolucionesCount} devoluciones
            </span>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <span style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#F5C81B',
                minWidth: '60px',
                textAlign: 'center'
              }}>
                Página 1 de 1
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE CREACIÓN/EDICIÓN */}
      <UniversalModal
        isOpen={modalState.isOpen && (modalState.mode === 'create' || modalState.mode === 'edit')}
        onClose={closeModal}
        title={modalState.mode === 'create' ? 'Registrar Devolución' : 'Editar Devolución'}
        subtitle={modalState.mode === 'create' ? 'Complete la información para registrar una nueva devolución' : 'Modifique la información de la devolución'}
        showActions={false}
        customStyles={{
          content: { 
            padding: '12px',
            backgroundColor: '#000000',
            border: '1px solid rgba(255,215,0,0.25)',
            borderRadius: '8px',
            maxWidth: '380px',
            width: '100%',
          }
        }}
      >
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '4px',
          maxWidth: '100%',
          padding: '0 0 6px 0',
        }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {renderField('Tipo de Doc.', 'documentType', 'select')} 
            {renderField('N° Documento', 'documentNumber', 'number')}
          </div>

          <div>{renderField('Producto', 'productoId', 'select')}</div> 

          <div style={{ display: 'flex', gap: '6px' }}>
            {renderField('Cantidad', 'quantity', 'number')}
            {renderField('Monto', 'monto', 'number')}
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {renderField('Fecha', 'date', 'date')}
            {modalState.mode === 'edit' && (
              renderField('Estado', 'status', 'select')
            )}
            {modalState.mode === 'create' && (
               <div style={{ flex: 1 }}></div>
            )}
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '6px',
            marginTop: '4px',
            padding: '6px 0 0 0',
            borderTop: '1px solid #334155'
          }}>
            <button
              onClick={closeModal}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #94a3b8',
                color: '#94a3b8',
                padding: '3px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '500',
                cursor: 'pointer',
                minWidth: '65px',
                height: '26px',
                whiteSpace: 'nowrap',
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              style={{
                backgroundColor: '#F5C81B',
                border: 'none',
                color: '#0f172a',
                padding: '3px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                minWidth: '75px',
                height: '26px',
                whiteSpace: 'nowrap',
              }}
            >
              {modalState.mode === 'create' ? 'Guardar' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </UniversalModal>

      {/* MODAL DE DETALLES (VIEW) */}
      {modalState.isOpen && modalState.mode === 'view' && (
        <UniversalModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          title="Detalles de la Devolución"
          subtitle="Información detallada de la devolución"
          showActions={false}
          customStyles={{
            content: { 
              padding: '12px',
              backgroundColor: '#000000',
              border: '1px solid rgba(255,215,0,0.25)',
              borderRadius: '8px',
              maxWidth: '380px',
              width: '100%',
            }
          }}
        >
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '6px', 
            maxWidth: '100%',
            padding: '0 0 6px 0',
          }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {renderField('Tipo de Doc.', 'documentType', 'text')} 
              {renderField('N° Documento', 'numeroDocumento', 'text')} 
            </div>
            
            <div>{renderField('Producto', 'productoId', 'text')}</div> 

            <div style={{ display: 'flex', gap: '6px' }}>
              {renderField('Cantidad', 'cantidad', 'text')} 
              {renderField('Monto', 'monto', 'text')} 
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {renderField('Fecha', 'fecha', 'text')} 
              {renderField('Estado', 'estado', 'text')} 
            </div>
          </div>
        </UniversalModal>
      )}

      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        entityName="devolución"
        entityData={deleteModal.devolucion}
        compact={true}
      />
    </>
  );
};

export default DevolucionesPage;