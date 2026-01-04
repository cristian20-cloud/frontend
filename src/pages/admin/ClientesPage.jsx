import React, { useState, useEffect, useRef } from 'react';
import { initialCustomers } from '../../data';
import EntityTable from '../../components/EntityTable';
import Alert from '../../components/Alert';
import SearchInput from '../../components/SearchInput';
import UniversalModal from '../../components/UniversalModal';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';

const ClientesPage = () => {
  // =========================
  // ESTADOS
  // =========================
  const [clientes, setClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [modalState, setModalState] = useState({ 
    isOpen: false, 
    mode: 'view', 
    cliente: null 
  });

  const [formData, setFormData] = useState({
    documentType: 'Cédula de Identidad',
    documentNumber: '',
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    department: '',
    balance: '0',
    isActive: true
  });

  const [errors, setErrors] = useState({});
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, cliente: null, customMessage: '' });

  const firstInputRef = useRef(null);

  // =========================
  // FILTRADO Y PAGINACIÓN
  // =========================

  const filtered = clientes.filter(c => {
    const search = (
      (c.nombreCompleto || '') + 
      (c.email || '') + 
      (c.telefono || '') + 
      (c.ciudad || '') + 
      (c.departamento || '') + 
      (c.tipoDocumento || '')
    ).toLowerCase().includes(searchTerm.toLowerCase());
    
    const status = filterStatus === 'Todos' || 
      (filterStatus === 'Activos' && c.isActive) || 
      (filterStatus === 'Inactivos' && !c.isActive);
    
    return search && status;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filtered.length);
  const paginatedClientes = filtered.slice(startIndex, endIndex);
  const showingStart = filtered.length > 0 ? startIndex + 1 : 0;

  // =========================
  // EFFECTS
  // =========================

  // Cargar departamentos
  useEffect(() => {
    const fetchDepartamentos = async () => {
      try {
        const res = await fetch('https://api-colombia.com/api/v1/Department');
        const data = await res.json();
        setDepartamentos(data.sort((a, b) => a.name.localeCompare(b.name)));
      } catch {
        showAlert('Error cargando departamentos', 'error');
      }
    };
    fetchDepartamentos();
  }, []);

  // Inicializar clientes
  useEffect(() => {
    const mapped = initialCustomers.map((c, i) => ({
      id: c.Correo || `cliente-${i}`,
      tipoDocumento: 'Cédula de Identidad',
      numeroDocumento: `${i + 10000000}`,
      nombreCompleto: c.Nombre,
      email: c.Correo,
      telefono: c.Telefono,
      direccion: c.Direccion,
      ciudad: c.Ciudad,
      departamento: c.Departamento,
      saldoFavor: c.SaldoaFavor || '0',
      isActive: i % 3 !== 0,
    }));
    setClientes(mapped);
  }, []);

  // Ajustar paginación
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Enfocar primer campo en modal
  useEffect(() => {
    if (modalState.isOpen && (modalState.mode === 'create' || modalState.mode === 'edit')) {
      const timer = setTimeout(() => {
        if (firstInputRef.current) {
          firstInputRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [modalState.isOpen, modalState.mode]);

  // =========================
  // FUNCIONES DE UTILIDAD
  // =========================

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3000);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleFilterSelect = (status) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  // =========================
  // FUNCIONES DE CIUDADES Y DEPARTAMENTOS
  // =========================

  const loadCitiesByDepartment = async (deptId) => {
    if (!deptId) {
      setCiudades([]);
      return;
    }
    setLoadingCities(true);
    try {
      const res = await fetch(`https://api-colombia.com/api/v1/City?departmentId=${deptId}`);
      const data = await res.json();
      setCiudades(data.sort((a, b) => a.name.localeCompare(b.name)));
    } catch {
      showAlert('Error cargando ciudades', 'error');
    }
    setLoadingCities(false);
  };

  // =========================
  // FUNCIONES DE MODAL
  // =========================

  const openModal = (mode = 'create', cliente = null) => {
    setModalState({ isOpen: true, mode, cliente });
    setErrors({});

    if (cliente && (mode === 'edit' || mode === 'view')) {
      const dept = departamentos.find(d => d.name === cliente.departamento);
      if (dept) loadCitiesByDepartment(dept.id);

      const saldo = cliente.saldoFavor || '0';
      setFormData({
        documentType: cliente.tipoDocumento,
        documentNumber: cliente.numeroDocumento,
        fullName: cliente.nombreCompleto,
        email: cliente.email,
        phone: cliente.telefono,
        address: cliente.direccion,
        city: cliente.ciudad,
        department: dept?.id || '',
        balance: saldo,
        isActive: cliente.isActive
      });
    } else {
      setFormData({
        documentType: 'Cédula de Identidad',
        documentNumber: '',
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        department: '',
        balance: '0',
        isActive: true
      });
      setCiudades([]);
    }
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: 'view', cliente: null });
    setFormData({
      documentType: 'Cédula de Identidad',
      documentNumber: '',
      fullName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      department: '',
      balance: '0',
      isActive: true
    });
    setErrors({});
    setCiudades([]);
  };

  // =========================
  // MANEJO DE FORMULARIO
  // =========================

  const handleInputChange = (field, value) => {
    if (errors[field]) {
      const newErr = { ...errors };
      delete newErr[field];
      setErrors(newErr);
    }

    if (field === 'department') {
      loadCitiesByDepartment(value);
      setFormData(prev => ({ ...prev, department: value, city: '' }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = () => {
    const required = [
      ['documentNumber', 'Número de documento'],
      ['fullName', 'Nombre completo'],
      ['email', 'Email'],
      ['phone', 'Teléfono'],
      ['address', 'Dirección'],
      ['department', 'Departamento'],
      ['city', 'Ciudad'],
    ];

    const newErrors = {};
    required.forEach(([field, label]) => {
      if (!String(formData[field] || '').trim()) newErrors[field] = `${label} es obligatorio`;
    });

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (formData.balance && !/^\d*$/.test(formData.balance)) {
      newErrors.balance = 'El saldo debe ser un número entero válido';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      showAlert('Complete los campos obligatorios correctamente', 'error');
      return;
    }

    const deptObj = departamentos.find(d => d.id.toString() === formData.department);
    const cityObj = ciudades.find(c => c.id.toString() === formData.city);

    let saldoFormateado = '0';
    if (formData.balance) {
      const saldoNum = parseInt(formData.balance, 10);
      saldoFormateado = isNaN(saldoNum) ? '0' : saldoNum.toString();
    }

    const updatedCliente = {
      tipoDocumento: formData.documentType,
      numeroDocumento: formData.documentNumber,
      nombreCompleto: formData.fullName,
      email: formData.email,
      telefono: formData.phone,
      direccion: formData.address,
      ciudad: cityObj?.name || formData.city,
      departamento: deptObj?.name || formData.department,
      saldoFavor: saldoFormateado,
      isActive: formData.isActive
    };

    if (modalState.mode === 'edit') {
      setClientes(prev =>
        prev.map(c => (String(c.id) === String(modalState.cliente.id) ? { ...c, ...updatedCliente } : c))
      );
      showAlert(`Cliente ${updatedCliente.nombreCompleto} actualizado correctamente`);
    } else {
      const newCliente = { 
        ...updatedCliente, 
        id: `cliente-${Date.now()}` 
      };
      setClientes(prev => [...prev, newCliente]);
      showAlert(`Cliente ${updatedCliente.nombreCompleto} registrado correctamente`);
    }
    closeModal();
  };

  // =========================
  // FUNCIONES DE ACCIONES
  // =========================

  const openDeleteModal = (cliente) => {
    // NO PERMITIR ELIMINAR SI ESTÁ ACTIVO
    if (cliente.isActive) {
      showAlert(`No se puede eliminar el cliente "${cliente.nombreCompleto}" porque está activo. Desactívelo primero.`, 'error');
      return;
    }
    
    const mensaje = `¿Estás seguro que deseas eliminar permanentemente al cliente "${cliente.nombreCompleto}"?`;
    setDeleteModal({ 
      isOpen: true, 
      cliente,
      customMessage: mensaje
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, cliente: null, customMessage: '' });
  };

  const handleDelete = () => {
    setClientes(prev => prev.filter(c => String(c.id) !== String(deleteModal.cliente.id)));
    showAlert('Cliente eliminado permanentemente', 'delete');
    closeDeleteModal();
  };

  const handleReactivar = (cliente) => {
    setClientes(prev =>
      prev.map(c =>
        String(c.id) === String(cliente.id) ? { ...c, isActive: true } : c
      )
    );
    showAlert(`Cliente "${cliente.nombreCompleto}" reactivado correctamente`, 'success');
  };

  const handleDesactivar = (cliente) => {
    setClientes(prev =>
      prev.map(c => 
        String(c.id) === String(cliente.id) ? { ...c, isActive: false } : c
      )
    );
    showAlert(`Cliente "${cliente.nombreCompleto}" desactivado`, 'error');
  };

  // =========================
  // COMPONENTES INTERNOS
  // =========================

  // Filtro de estado (igual que en ComprasPage)
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
          <span>{filterStatus}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
            <polyline points="6,9 12,15 18,9"/>
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
            {['Todos', 'Activos', 'Inactivos'].map(status => (
              <button 
                key={status} 
                onClick={() => { handleFilterSelect(status); setOpen(false); }} 
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

  // StatusPill (similar a ComprasPage)
  const StatusPill = React.memo(({ status }) => {
    const getColorForStatus = (status) => {
      switch(status?.toString().toLowerCase()) {
        case 'true':
        case 'activo': return '#10B981';
        case 'false':
        case 'inactivo': return '#EF4444';
        default: return '#6B7280';
      }
    };
    
    const color = getColorForStatus(status);
    const displayText = status === true || status === 'true' ? 'Activo' : 
                       status === false || status === 'false' ? 'Inactivo' : 
                       String(status);
    
    return (
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        borderRadius: "12px",
        backgroundColor: `${color}20`,
        color: color,
        fontWeight: 600,
        fontSize: "0.7rem",
        textTransform: "capitalize",
        border: `1px solid ${color}40`,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: color, marginRight: 4 }} />
        {displayText}
      </span>
    );
  });

  // Componente de campos del formulario (CON TU ESTILO ORIGINAL)
  const ClienteFormFields = () => {
    const isView = modalState.mode === 'view';
    const isEdit = modalState.mode === 'edit';
    
    if (isView) {
      const cliente = modalState.cliente;
      const saldo = parseInt(cliente?.saldoFavor || 0);
      
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <div>
                <label style={{ fontSize: "12px", color: "#e2e8f0", display: "block", marginBottom: "2px" }}>Tipo Documento:</label>
                <div style={{ backgroundColor: "#0a0a0a", border: "1px solid #334155", borderRadius: "6px", padding: "6px 10px", color: "#f1f5f9", fontSize: "13px" }}>
                  {cliente?.tipoDocumento || 'N/A'}
                </div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div>
                <label style={{ fontSize: "12px", color: "#e2e8f0", display: "block", marginBottom: "2px" }}>Número Documento:</label>
                <div style={{ backgroundColor: "#0a0a0a", border: "1px solid #334155", borderRadius: "6px", padding: "6px 10px", color: "#f1f5f9", fontSize: "13px" }}>
                  {cliente?.numeroDocumento || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label style={{ fontSize: "12px", color: "#e2e8f0", display: "block", marginBottom: "2px" }}>Nombre Completo:</label>
            <div style={{ backgroundColor: "#0a0a0a", border: "1px solid #334155", borderRadius: "6px", padding: "6px 10px", color: "#f1f5f9", fontSize: "13px" }}>
              {cliente?.nombreCompleto || 'N/A'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <div>
                <label style={{ fontSize: "12px", color: "#e2e8f0", display: "block", marginBottom: "2px" }}>Email:</label>
                <div style={{ backgroundColor: "#0a0a0a", border: "1px solid #334155", borderRadius: "6px", padding: "6px 10px", color: "#f1f5f9", fontSize: "13px" }}>
                  {cliente?.email || 'N/A'}
                </div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div>
                <label style={{ fontSize: "12px", color: "#e2e8f0", display: "block", marginBottom: "2px" }}>Teléfono:</label>
                <div style={{ backgroundColor: "#0a0a0a", border: "1px solid #334155", borderRadius: "6px", padding: "6px 10px", color: "#f1f5f9", fontSize: "13px" }}>
                  {cliente?.telefono || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label style={{ fontSize: "12px", color: "#e2e8f0", display: "block", marginBottom: "2px" }}>Dirección:</label>
            <div style={{ backgroundColor: "#0a0a0a", border: "1px solid #334155", borderRadius: "6px", padding: "6px 10px", color: "#f1f5f9", fontSize: "13px" }}>
              {cliente?.direccion || 'N/A'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <div>
                <label style={{ fontSize: "12px", color: "#e2e8f0", display: "block", marginBottom: "2px" }}>Departamento:</label>
                <div style={{ backgroundColor: "#0a0a0a", border: "1px solid #334155", borderRadius: "6px", padding: "6px 10px", color: "#f1f5f9", fontSize: "13px" }}>
                  {cliente?.departamento || 'N/A'}
                </div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div>
                <label style={{ fontSize: "12px", color: "#e2e8f0", display: "block", marginBottom: "2px" }}>Ciudad:</label>
                <div style={{ backgroundColor: "#0a0a0a", border: "1px solid #334155", borderRadius: "6px", padding: "6px 10px", color: "#f1f5f9", fontSize: "13px" }}>
                  {cliente?.ciudad || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ flex: 2 }}>
              <div>
                <label style={{ fontSize: "12px", color: "#e2e8f0", display: "block", marginBottom: "2px" }}>Saldo a Favor:</label>
                <div style={{ backgroundColor: "#0a0a0a", border: "1px solid #334155", borderRadius: "6px", padding: "6px 10px", color: "#F5C81B", fontSize: "13px", fontWeight: "600" }}>
                  ${saldo.toLocaleString('es-CO')}
                </div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div>
                <label style={{ fontSize: "12px", color: "#e2e8f0", display: "block", marginBottom: "2px" }}>Estado:</label>
                <StatusPill status={cliente?.isActive?.toString()} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #334155', paddingTop: '12px' }}>
            <button 
              onClick={closeModal}
              style={{
                background: 'transparent',
                border: '1px solid #94a3b8',
                color: '#94a3b8',
                padding: '6px 16px',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      );
    }

    // TU ESTILO ORIGINAL PARA CAMPOS EDITABLES (más delgado, inputs azules/oscuros)
    const renderEditableField = (label, fieldName, type = "text", options = []) => {
      const isError = errors[fieldName];
      
      // ESTILO ORIGINAL TUYO - más delgado y con fondo azul/oscuro
      const inputStyle = {
        backgroundColor: isError ? "#451a1a" : "#1e293b", // Azul oscuro como tenías
        border: `1px solid ${isError ? "#ef4444" : "#334155"}`, // Borde delgado
        borderRadius: "6px",
        padding: "4px 8px", // Más compacto
        color: "#f1f5f9",
        fontSize: "13px",
        height: "30px", // Más delgado
        width: "100%",
        outline: "none",
        boxSizing: "border-box",
        fontFamily: "inherit",
      };

      const selectStyle = {
        ...inputStyle,
        cursor: 'pointer'
      };

      if (type === 'select') {
        let fieldOptions = options;
        if (fieldName === 'department') {
          fieldOptions = departamentos.map(d => ({ value: d.id, label: d.name }));
        } else if (fieldName === 'city') {
          fieldOptions = ciudades.map(c => ({ value: c.id, label: c.name }));
        } else if (fieldName === 'documentType') {
          fieldOptions = [
            { value: 'Cédula de Identidad', label: 'Cédula de Identidad' },
            { value: 'Pasaporte', label: 'Pasaporte' },
            { value: 'RUC', label: 'RUC' },
          ];
        }

        return (
          <div>
            <label style={{ fontSize: "12px", color: "#e2e8f0", fontWeight: "500", marginBottom: "2px", display: "block" }}>
              {label}: <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <select
              value={formData[fieldName] || ''}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              disabled={fieldName === 'city' && loadingCities}
              style={selectStyle}
            >
              <option value="">Seleccionar...</option>
              {fieldOptions.map(op => (
                <option key={op.value} value={op.value}>{op.label}</option>
              ))}
            </select>
            {isError && (
              <div style={{ color: "#f87171", fontSize: "11px", fontWeight: "500", marginTop: "1px" }}>
                {isError}
              </div>
            )}
          </div>
        );
      }

      return (
        <div>
          <label style={{ fontSize: "12px", color: "#e2e8f0", fontWeight: "500", marginBottom: "2px", display: "block" }}>
            {label}: <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            type={type}
            value={formData[fieldName] || ''}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            ref={fieldName === 'documentNumber' ? firstInputRef : null}
            style={inputStyle}
          />
          {isError && (
            <div style={{ color: "#f87171", fontSize: "11px", fontWeight: "500", marginTop: "1px" }}>
              {isError}
            </div>
          )}
        </div>
      );
    };

    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '6px', // Espacio más compacto
        maxWidth: '100%',
      }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{ flex: 1 }}>
            {renderEditableField('Tipo Documento', 'documentType', 'select')}
          </div>
          <div style={{ flex: 1 }}>
            {renderEditableField('Número Documento', 'documentNumber', 'text')}
          </div>
        </div>

        <div>{renderEditableField('Nombre Completo', 'fullName', 'text')}</div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{ flex: 1 }}>{renderEditableField('Email', 'email', 'text')}</div>
          <div style={{ flex: 1 }}>{renderEditableField('Teléfono', 'phone', 'text')}</div>
        </div>

        <div>{renderEditableField('Dirección', 'address', 'text')}</div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{ flex: 1 }}>{renderEditableField('Departamento', 'department', 'select')}</div>
          <div style={{ flex: 1 }}>{renderEditableField('Ciudad', 'city', 'select')}</div>
        </div>

        <div>{renderEditableField('Saldo a Favor', 'balance', 'text')}</div>

        {isEdit && (
          <div>
            <label style={{ fontSize: "12px", color: "#e2e8f0", fontWeight: "500", marginBottom: "2px", display: "block" }}>Estado:</label>
            <select
              value={formData.isActive.toString()}
              onChange={(e) => handleInputChange('isActive', e.target.value === 'true')}
              style={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "6px",
                padding: "4px 8px",
                color: "#f1f5f9",
                fontSize: "13px",
                height: "30px",
                width: "100%",
                outline: "none",
                boxSizing: "border-box",
                cursor: "pointer"
              }}
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>
        )}

        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center', 
          gap: '6px',
          borderTop: '1px solid #334155', 
          paddingTop: '12px',
          marginTop: '8px'
        }}>
          <button
            onClick={closeModal}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #94a3b8',
              color: '#94a3b8',
              padding: '4px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              minWidth: '70px',
              height: '28px',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#94a3b8';
              e.currentTarget.style.color = '#000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#94a3b8';
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
              padding: '4px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              minWidth: '80px',
              height: '28px',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f5d33c';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#F5C81B';
            }}
          >
            {modalState.mode === 'create' ? 'Guardar' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    );
  };

  // =========================
  // DEFINICIÓN DE COLUMNAS
  // =========================

  const columns = [
    { 
      header: 'Nombre', 
      field: 'nombreCompleto', 
      render: (item) => <span style={{ color: '#fff' }}>{item.nombreCompleto}</span> 
    },
    { 
      header: 'Email', 
      field: 'email', 
      render: (item) => <span style={{ color: '#fff' }}>{item.email}</span> 
    },
    { 
      header: 'Teléfono', 
      field: 'telefono', 
      render: (item) => <span style={{ color: '#fff' }}>{item.telefono}</span> 
    },
    { 
      header: 'Ciudad', 
      field: 'ciudad', 
      render: (item) => <span style={{ color: '#fff' }}>{item.ciudad}</span> 
    },
    { 
      header: 'Estado', 
      field: 'isActive', 
      render: (item) => <StatusPill status={item.isActive?.toString()} /> 
    }
  ];

  // =========================
  // RENDER PRINCIPAL (ESTRUCTURA IGUAL A COMPRASPAGE)
  // =========================

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
        {/* Encabezado - IGUAL A COMPRAS */}
        <div style={{ marginBottom: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <div>
              <h1 style={{ color: "#fff", fontSize: "20px", fontWeight: "700", margin: 0, lineHeight: "1.2" }}>
                Clientes
              </h1>
              <p style={{ color: "#9CA3AF", fontSize: "15px", margin: 0, lineHeight: "1.3" }}>
                Gestión de clientes registrados
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
                Registrar Cliente
              </button>
            </div>
          </div>
          
          {/* Buscador y Filtro - IGUAL A COMPRAS */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar por nombre, email, teléfono o ciudad..."
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

        {/* Contenido Principal - IGUAL A COMPRAS */}
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
              entities={paginatedClientes} 
              columns={columns} 
              onView={c => openModal('view', c)} 
              onEdit={c => openModal('edit', c)} 
              onAnular={handleDesactivar}
              onReactivar={handleReactivar}
              onDelete={openDeleteModal}
              showAnularButton={true}
              showDeleteButton={true}
              showReactivarButton={true}
              moduleType="clientes" 
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
              rowStyle={{
                border: 'none',
                backgroundColor: '#000',
                '&:hover': {
                  backgroundColor: '#111111',
                }
              }}
            />
          </div>

          {/* Paginación - IGUAL A COMPRAS */}
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
              Mostrando {showingStart}–{endIndex} de {filtered.length} clientes
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

      {/* Modal - CON TU ESTILO ORIGINAL (más estrecho y delgado) */}
      <UniversalModal 
        isOpen={modalState.isOpen} 
        onClose={closeModal} 
        title={
          modalState.mode === 'create' ? 'Registrar Cliente' : 
          modalState.mode === 'edit' ? 'Editar Cliente' : 
          'Detalles del Cliente'
        }
        subtitle={
          modalState.mode === 'create' ? 'Complete la información para registrar un nuevo cliente' : 
          modalState.mode === 'edit' ? 'Modifique la información del cliente' : 
          'Información detallada del cliente'
        }
        showActions={false}
        customStyles={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            zIndex: 1000,
          },
          content: { 
            padding: '16px',
            backgroundColor: '#000000',
            border: '1px solid rgba(255,215,0,0.25)', // Borde más sutil
            borderRadius: '12px',
            maxWidth: '400px', // Más estrecho que ComprasPage
            width: '90%',
            maxHeight: '85vh',
            overflowY: 'auto',
            margin: 'auto',
            boxShadow: '0 4px 20px rgba(245, 200, 27, 0.1)',
          },
          title: {
            color: '#F5C81B',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '4px'
          },
          subtitle: {
            color: '#9CA3AF',
            fontSize: '12px',
            marginBottom: '12px' // Menos espacio
          }
        }}
      >
        <ClienteFormFields />
      </UniversalModal>
      
      <ConfirmDeleteModal 
        isOpen={deleteModal.isOpen} 
        onClose={closeDeleteModal} 
        onConfirm={handleDelete} 
        entityName="cliente"
        entityData={deleteModal.cliente}
        customMessage={deleteModal.customMessage}
      />
    </>
  );
};

export default ClientesPage;