// src/pages/admin/ProveedoresPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { initialSuppliers } from '../../data';
import EntityTable from '../../components/EntityTable';
import Alert from '../../components/Alert';
import SearchInput from '../../components/SearchInput';
import UniversalModal from '../../components/UniversalModal';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';

// =========================
// COMPONENTE DE FORMULARIO - MOVIDO AFUERA PARA EVITAR RE-MOUNTS
// =========================
const ProveedorFormFields = ({
  modalState,
  formData,
  errors,
  handleInputChange,
  handleSave,
  closeModal,
  departamentos,
  ciudades,
  loadingCities,
  firstInputRef
}) => {
  const isView = modalState.mode === 'view';
  const isEdit = modalState.mode === 'edit';
  const { supplierType } = formData;

  const inputStyleEdit = {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "6px",
    padding: "4px 8px",
    color: "#f1f5f9",
    fontSize: "12px",
    height: "28px",
    width: "100%",
    outline: "none",
    boxSizing: "border-box",
  };

  if (isView) {
    const proveedor = modalState.proveedor;
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <div>
              <label style={{ fontSize: "11px", color: "#e2e8f0", display: "block", marginBottom: "3px" }}>Tipo Proveedor:</label>
              <div style={inputStyleEdit}>
                {proveedor?.supplierType || 'N/A'}
              </div>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div>
              <label style={{ fontSize: "11px", color: "#e2e8f0", display: "block", marginBottom: "3px" }}>Tipo Documento:</label>
              <div style={inputStyleEdit}>
                {proveedor?.documentType || 'N/A'}
              </div>
            </div>
          </div>
        </div>

        <div>
          <label style={{ fontSize: "11px", color: "#e2e8f0", display: "block", marginBottom: "3px" }}>
            {supplierType === 'Persona Natural' ? 'Número ID' : 'Número Documento'}:
          </label>
          <div style={inputStyleEdit}>
            {proveedor?.documentNumber || 'N/A'}
          </div>
        </div>

        {supplierType === 'Persona Jurídica' && (
          <>
            <div>
              <label style={{ fontSize: "11px", color: "#e2e8f0", display: "block", marginBottom: "3px" }}>Empresa:</label>
              <div style={inputStyleEdit}>
                {proveedor?.companyName || 'N/A'}
              </div>
            </div>
            <div>
              <label style={{ fontSize: "11px", color: "#e2e8f0", display: "block", marginBottom: "3px" }}>Contacto:</label>
              <div style={inputStyleEdit}>
                {proveedor?.contactName || 'N/A'}
              </div>
            </div>
          </>
        )}

        {supplierType === 'Persona Natural' && (
          <div>
            <label style={{ fontSize: "11px", color: "#e2e8f0", display: "block", marginBottom: "3px" }}>Nombre Completo:</label>
            <div style={inputStyleEdit}>
              {proveedor?.contactName || 'N/A'}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <div>
              <label style={{ fontSize: "11px", color: "#e2e8f0", display: "block", marginBottom: "3px" }}>Email:</label>
              <div style={inputStyleEdit}>
                {proveedor?.email || 'N/A'}
              </div>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div>
              <label style={{ fontSize: "11px", color: "#e2e8f0", display: "block", marginBottom: "3px" }}>Teléfono:</label>
              <div style={inputStyleEdit}>
                {proveedor?.phone || 'N/A'}
              </div>
            </div>
          </div>
        </div>

        <div>
          <label style={{ fontSize: "11px", color: "#e2e8f0", display: "block", marginBottom: "3px" }}>Dirección:</label>
          <div style={inputStyleEdit}>
            {proveedor?.address || 'N/A'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <div>
              <label style={{ fontSize: "11px", color: "#e2e8f0", display: "block", marginBottom: "3px" }}>Departamento:</label>
              <div style={inputStyleEdit}>
                {proveedor?.department || 'N/A'}
              </div>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div>
              <label style={{ fontSize: "11px", color: "#e2e8f0", display: "block", marginBottom: "3px" }}>Ciudad:</label>
              <div style={inputStyleEdit}>
                {proveedor?.city || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderEditableField = (label, fieldName, type = "text", options = []) => {
    const isError = errors[fieldName];
    const hasValue = formData[fieldName] && formData[fieldName] !== '';
    
    const inputStyle = {
      backgroundColor: isError ? "#451a1a" : "#1e293b",
      border: `1px solid ${isError ? "#ef4444" : "#334155"}`,
      borderRadius: "6px",
      padding: "4px 8px",
      color: "#f1f5f9",
      fontSize: "12px",
      height: "28px",
      width: "100%",
      outline: "none",
      boxSizing: "border-box",
      fontFamily: "inherit",
    };

    const selectStyle = {
      ...inputStyle,
      cursor: 'pointer',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    };

    const webkitScrollbarStyle = `
      select::-webkit-scrollbar {
        display: none;
      }
    `;

    const selectOptionsStyle = `
      select option {
        background-color: #1e293b;
        color: #f1f5f9;
        padding: 8px;
      }
      select option:disabled {
        color: #6B7280;
        font-style: italic;
      }
    `;

    if (type === 'select') {
      let fieldOptions = options;
      if (fieldName === 'department') {
        fieldOptions = departamentos.map(d => ({ value: d, label: d }));
      } else if (fieldName === 'city') {
        fieldOptions = ciudades.map(c => ({ value: c, label: c }));
      } else if (fieldName === 'supplierType') {
        fieldOptions = [
          { value: 'Persona Jurídica', label: 'Persona Jurídica' },
          { value: 'Persona Natural', label: 'Persona Natural' },
        ];
      } else if (fieldName === 'documentType') {
        if (formData.supplierType === 'Persona Natural') {
          fieldOptions = [
            { value: 'Cédula de Ciudadanía', label: 'Cédula de Ciudadanía' },
            { value: 'Cédula de Extranjería', label: 'Cédula de Extranjería' },
          ];
        } else {
          fieldOptions = [
            { value: 'NIT', label: 'NIT' },
          ];
        }
      }

      return (
        <div>
          <style>{webkitScrollbarStyle}</style>
          <style>{selectOptionsStyle}</style>
          <label style={{ fontSize: "11px", color: "#e2e8f0", fontWeight: "500", marginBottom: "3px", display: "block" }}>
            {label}: <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <select
            value={formData[fieldName] || ''}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            disabled={fieldName === 'city' && (loadingCities || !formData.department) || (fieldName === 'documentType' && formData.supplierType !== 'Persona Natural')}
            style={selectStyle}
          >
            {!hasValue && (
              <option value="" disabled selected style={{ color: '#6B7280', fontStyle: 'italic' }}>Seleccionar...</option>
            )}
            {fieldOptions.map(op => (
              <option key={op.value} value={op.value} style={{ color: '#f1f5f9', backgroundColor: '#1e293b' }}>{op.label}</option>
            ))}
          </select>
          {isError && (
            <div style={{ color: "#f87171", fontSize: "10px", fontWeight: "500", marginTop: "2px" }}>
              {isError}
            </div>
          )}
        </div>
      );
    }

    const isNumericField = fieldName === 'documentNumber' || fieldName === 'phone';
    
    return (
      <div>
        <label style={{ fontSize: "11px", color: "#e2e8f0", fontWeight: "500", marginBottom: "3px", display: "block" }}>
          {label}: <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <input
          type={isNumericField ? "tel" : type}
          inputMode={isNumericField ? "numeric" : undefined}
          pattern={isNumericField ? "[0-9]*" : undefined}
          value={formData[fieldName] || ''}
          onChange={(e) => handleInputChange(fieldName, e.target.value)}
          ref={fieldName === 'documentNumber' ? firstInputRef : null}
          style={inputStyle}
        />
        {isError && (
          <div style={{ color: "#f87171", fontSize: "10px", fontWeight: "500", marginTop: "2px" }}>
            {isError}
          </div>
        )}
      </div>
    );
  };

  if (isEdit) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px',
        maxWidth: '100%',
      }}>
        {renderEditableField('Tipo de Proveedor', 'supplierType', 'select')}

        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ flex: 1 }}>
            {renderEditableField(supplierType === 'Persona Natural' ? 'Tipo ID' : 'Tipo NIT', 'documentType', 'select')}
          </div>
          <div style={{ flex: 1 }}>
            {renderEditableField(supplierType === 'Persona Natural' ? 'Número ID' : 'Número Documento', 'documentNumber', 'text')}
          </div>
        </div>

        {supplierType === 'Persona Jurídica' && (
          <>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1 }}>{renderEditableField('Empresa', 'companyName', 'text')}</div>
              <div style={{ flex: 1 }}>{renderEditableField('Contacto', 'contactName', 'text')}</div>
            </div>
          </>
        )}

        {supplierType === 'Persona Natural' && (
          <div>{renderEditableField('Nombre Completo', 'contactName', 'text')}</div>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ flex: 1 }}>{renderEditableField('Email', 'email', 'text')}</div>
          <div style={{ flex: 1 }}>{renderEditableField('Teléfono', 'phone', 'text')}</div>
        </div>

        <div>{renderEditableField('Dirección', 'address', 'text')}</div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ flex: 1 }}>{renderEditableField('Departamento', 'department', 'select')}</div>
          <div style={{ flex: 1 }}>{renderEditableField('Ciudad', 'city', 'select')}</div>
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '6px',
          marginTop: '6px'
        }}>
          <button
            onClick={closeModal}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #94a3b8',
              color: '#94a3b8',
              padding: '4px 12px',
              borderRadius: '4px',
              fontSize: "11px",
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
              fontSize: "11px",
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
            Guardar Cambios
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '8px',
      maxWidth: '100%',
    }}>
      {renderEditableField('Tipo de Proveedor', 'supplierType', 'select')}

      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1 }}>
          {renderEditableField(supplierType === 'Persona Natural' ? 'Tipo Documento' : 'Tipo NIT', 'documentType', 'select')}
        </div>
        <div style={{ flex: 1 }}>
          {renderEditableField(supplierType === 'Persona Natural' ? 'Número Documento' : 'Número Documento', 'documentNumber', 'text')}
        </div>
      </div>

      {supplierType === 'Persona Jurídica' && (
        <>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1 }}>{renderEditableField('Empresa', 'companyName', 'text')}</div>
            <div style={{ flex: 1 }}>{renderEditableField('Contacto', 'contactName', 'text')}</div>
          </div>
        </>
      )}

      {supplierType === 'Persona Natural' && (
        <div>{renderEditableField('Nombre Completo', 'contactName', 'text')}</div>
      )}

      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1 }}>{renderEditableField('Email', 'email', 'text')}</div>
        <div style={{ flex: 1 }}>{renderEditableField('Teléfono', 'phone', 'text')}</div>
      </div>

      <div>{renderEditableField('Dirección', 'address', 'text')}</div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1 }}>{renderEditableField('Departamento', 'department', 'select')}</div>
        <div style={{ flex: 1 }}>{renderEditableField('Ciudad', 'city', 'select')}</div>
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        gap: '6px',
        marginTop: '6px'
      }}>
        <button
          onClick={closeModal}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid #94a3b8',
            color: '#94a3b8',
            padding: '4px 12px',
            borderRadius: '4px',
            fontSize: "11px",
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
            fontSize: "11px",
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
          Guardar
        </button>
      </div>
    </div>
  );
};

// =========================
// COMPONENTE PRINCIPAL
// =========================
const ProveedoresPage = () => {
// =========================
// ESTADOS
// =========================
const [proveedores, setProveedores] = useState([]);
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
  proveedor: null
});
const [formData, setFormData] = useState({
  supplierType: 'Persona Jurídica',
  documentType: 'NIT',
  documentNumber: '',
  companyName: '',
  contactName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  department: '',
  isActive: true
});
const [errors, setErrors] = useState({});
const [deleteModal, setDeleteModal] = useState({ isOpen: false, proveedor: null, customMessage: '' });
const firstInputRef = useRef(null);

// =========================
// FILTRADO Y PAGINACIÓN
// =========================
const filtered = proveedores.filter(p => {
  const search = (
    (p.companyName || '') +
    (p.contactName || '') +
    (p.email || '') +
    (p.phone || '') +
    (p.documentNumber || '') +
    (p.city || '') +
    (p.department || '')
  ).toLowerCase().includes(searchTerm.toLowerCase());
  const status = filterStatus === 'Todos' || 
    (filterStatus === 'Activos' && p.isActive) || 
    (filterStatus === 'Inactivos' && !p.isActive);
  return search && status;
});

const totalPages = Math.ceil(filtered.length / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = Math.min(startIndex + itemsPerPage, filtered.length);
const paginatedProveedores = filtered.slice(startIndex, endIndex);
const showingStart = filtered.length > 0 ? startIndex + 1 : 0;

// =========================
// EFFECTS
// =========================
useEffect(() => {
  const mapped = initialSuppliers.map((p, i) => ({
    id: p.IdProveedor || `prov-${i}`,
    supplierType: p.TipoProveedor === 'Empresa' ? 'Persona Jurídica' : 'Persona Natural',
    documentType: p.TipoDocumento || 'NIT',
    documentNumber: p.NumeroDocumento || '',
    companyName: p.Nombre,
    contactName: p.Nombre,
    email: p.Correo,
    phone: p.Telefono,
    address: p.Direccion,
    department: p.Departamento,
    city: p.Ciudad,
    isActive: p.Estado !== false,
  }));
  setProveedores(mapped);
  
  setDepartamentos([
    'Antioquia', 'Cundinamarca', 'Valle del Cauca', 'Santander',
    'Atlántico', 'Bolívar', 'Norte de Santander', 'Risaralda'
  ]);
}, []);

useEffect(() => {
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  } else if (totalPages === 0) {
    setCurrentPage(1);
  }
}, [totalPages, currentPage]);

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
const showAlert = useCallback((message, type = 'success') => {
  setAlert({ show: true, message, type });
  setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3000);
}, []);

const handleFilterSelect = (status) => {
  setFilterStatus(status);
  setCurrentPage(1);
};

// =========================
// FUNCIONES DE CIUDADES Y DEPARTAMENTOS
// =========================
const loadCitiesByDepartment = (deptName) => {
  if (!deptName) {
    setCiudades([]);
    return;
  }
  setLoadingCities(true);
  
  const citiesMap = {
    'Antioquia': ['Medellín', 'Envigado', 'Sabaneta', 'Itagüí', 'Bello', 'La Ceja'],
    'Cundinamarca': ['Bogotá D.C.', 'Soacha', 'Chía'],
    'Valle del Cauca': ['Cali', 'Palmira'],
    'Santander': ['Bucaramanga'],
    'Atlántico': ['Barranquilla'],
    'Bolívar': ['Cartagena'],
    'Norte de Santander': ['Cúcuta'],
    'Risaralda': ['Pereira'],
  };
  
  setTimeout(() => {
    setCiudades(citiesMap[deptName] || ['Ciudad Principal', 'Otra Ciudad']);
    setLoadingCities(false);
  }, 300);
};

// =========================
// FUNCIONES DE MODAL
// =========================
const openModal = (mode = 'create', proveedor = null) => {
  setModalState({ isOpen: true, mode, proveedor });
  setErrors({});
  
  if (proveedor && (mode === 'edit' || mode === 'view')) {
    if (proveedor.department) {
      loadCitiesByDepartment(proveedor.department);
    }
    setFormData({
      supplierType: proveedor.supplierType,
      documentType: proveedor.documentType,
      documentNumber: proveedor.documentNumber,
      companyName: proveedor.companyName,
      contactName: proveedor.contactName,
      email: proveedor.email,
      phone: proveedor.phone,
      address: proveedor.address,
      city: proveedor.city,
      department: proveedor.department,
      isActive: proveedor.isActive
    });
  } else {
    setFormData({
      supplierType: 'Persona Jurídica',
      documentType: 'NIT',
      documentNumber: '',
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      department: '',
      isActive: true
    });
    setCiudades([]);
  }
};

const closeModal = () => {
  setModalState({ isOpen: false, mode: 'view', proveedor: null });
  setFormData({
    supplierType: 'Persona Jurídica',
    documentType: 'NIT',
    documentNumber: '',
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    department: '',
    isActive: true
  });
  setErrors({});
  setCiudades([]);
};

// =========================
// MANEJO DE FORMULARIO - CON VALIDACIÓN NUMÉRICA
// =========================
const handleInputChange = (field, value) => {
  if (errors[field]) {
    const newErr = { ...errors };
    delete newErr[field];
    setErrors(newErr);
  }
  
  // VALIDACIÓN: Solo números para documentNumber y phone
  if (field === 'documentNumber' || field === 'phone') {
    value = value.replace(/[^0-9]/g, '');
  }
  
  if (field === 'department') {
    loadCitiesByDepartment(value);
    setFormData(prev => ({ ...prev, department: value, city: '' }));
  } else if (field === 'supplierType') {
    // Actualizar documentType según el tipo de proveedor
    const newDocType = value === 'Persona Natural' ? 'Cédula de Ciudadanía' : 'NIT';
    setFormData(prev => ({ 
      ...prev, 
      supplierType: value,
      documentType: newDocType,
      documentNumber: '',
      companyName: value === 'Persona Natural' ? '' : prev.companyName,
      contactName: ''
    }));
  } else {
    setFormData(prev => ({ ...prev, [field]: value }));
  }
};

const handleSave = () => {
  const { supplierType } = formData;
  const required = [
    ['supplierType', 'Tipo de proveedor'],
    ['documentType', 'Tipo de documento'],
    ['documentNumber', supplierType === 'Persona Natural' ? 'Número ID' : 'Número Documento'],
    ['email', 'Email'],
    ['phone', 'Teléfono'],
    ['address', 'Dirección'],
    ['department', 'Departamento'],
    ['city', 'Ciudad'],
  ];
  
  if (supplierType === 'Persona Natural') {
    required.push(['contactName', 'Nombre completo']);
  } else {
    required.push(['companyName', 'Empresa'], ['contactName', 'Contacto']);
  }
  
  const newErrors = {};
  required.forEach(([field, label]) => {
    if (!String(formData[field] || '').trim()) newErrors[field] = `${label} es obligatorio`;
  });

  if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    newErrors.email = 'Email inválido';
  }

  setErrors(newErrors);
  
  if (Object.keys(newErrors).length > 0) {
    showAlert('Debes llenar los campos correctamente', 'error');
    return;
  }

  const updatedProveedor = {
    ...formData,
    searchField: `${formData.companyName} ${formData.documentType} ${formData.documentNumber} ${formData.email} ${formData.phone}`
  };

  if (modalState.mode === 'edit' && modalState.proveedor?.id) {
    setProveedores(prev =>
      prev.map(p => (String(p.id) === String(modalState.proveedor.id) ? { ...p, ...updatedProveedor } : p))
    );
    showAlert(`Proveedor ${updatedProveedor.companyName || updatedProveedor.contactName} actualizado correctamente`, 'success');
  } else {
    const newProveedor = { 
      ...updatedProveedor, 
      id: `prov-${Date.now()}`,
      isActive: true
    };
    setProveedores(prev => [...prev, newProveedor]);
    showAlert(`Proveedor ${newProveedor.companyName || newProveedor.contactName} registrado correctamente`, 'success');
  }
  
  closeModal();
};

// =========================
// FUNCIONES DE ACCIONES
// =========================
const handleToggleStatus = (proveedor) => {
  setProveedores(prev => prev.map(p => 
    p.id === proveedor.id ? { ...p, isActive: !p.isActive } : p
  ));
  
  const nuevoEstado = !proveedor.isActive;
  showAlert(`Proveedor ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`, 'success');
  
  if (modalState.isOpen && modalState.proveedor && String(modalState.proveedor.id) === String(proveedor.id)) {
    setFormData(prev => ({ ...prev, isActive: nuevoEstado }));
  }
};

const openDeleteModal = (proveedor) => {
  if (proveedor.isActive) {
    showAlert(`No se puede eliminar el proveedor "${proveedor.companyName || proveedor.contactName}" porque está activo. Desactívelo primero.`, 'error');
    return;
  }
  
  const mensaje = `¿Estás seguro que deseas eliminar permanentemente al proveedor "${proveedor.companyName || proveedor.contactName}"?`;
  setDeleteModal({ 
    isOpen: true, 
    proveedor,
    customMessage: mensaje
  });
};

const closeDeleteModal = () => {
  setDeleteModal({ isOpen: false, proveedor: null, customMessage: '' });
};

const handleDelete = () => {
  setProveedores(prev => prev.filter(p => String(p.id) !== String(deleteModal.proveedor.id)));
  showAlert('Proveedor eliminado permanentemente', 'delete');
  closeDeleteModal();
};

// =========================
// COMPONENTES INTERNOS
// =========================
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
          <polyline points="6,9 12,15 18,9" />
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

const StatusPill = React.memo(({ status }) => {
  const isActive = status === true || status === 'true' || status === 'Activo';
  
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "4px 10px",
      borderRadius: "12px",
      backgroundColor: isActive ? "#10B98120" : "#EF444420",
      color: isActive ? "#10B981" : "#EF4444",
      fontWeight: 600,
      fontSize: "0.7rem",
      textTransform: "capitalize",
      border: `1px solid ${isActive ? "#10B98140" : "#EF444440"}`,
    }}>
      <span style={{ 
        width: 6, 
        height: 6, 
        borderRadius: "50%", 
        backgroundColor: isActive ? "#10B981" : "#EF4444", 
        marginRight: 4 
      }} />
      {isActive ? 'Activo' : 'Inactivo'}
    </span>
  );
});

StatusPill.displayName = 'StatusPill';

const ToggleSwitch = ({ value, onChange }) => {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: '44px',
        height: '22px',
        backgroundColor: value ? '#10B981' : '#4B5563',
        borderRadius: '11px',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        display: 'inline-block',
        boxShadow: value ? '0 0 8px rgba(16, 185, 129, 0.5)' : 'none'
      }}
    >
      <div
        style={{
          width: '18px',
          height: '18px',
          backgroundColor: 'white',
          borderRadius: '50%',
          position: 'absolute',
          top: '2px',
          left: value ? '24px' : '2px',
          transition: 'left 0.3s ease, box-shadow 0.3s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
        }}
      />
    </div>
  );
};

// =========================
// DEFINICIÓN DE COLUMNAS
// =========================
const columns = [
  {
    header: 'Tipo Proveedor',
    field: 'supplierType',
    width: '100px',
    render: (item) => (
      <span style={{ color: '#fff', fontSize: '12px', fontWeight: '500' }}>
        {item.supplierType === 'Persona Natural' ? 'Natural' : 'Jurídica'}
      </span>
    )
  },
  {
    header: 'Empresa',
    field: 'companyName',
    width: '140px',
    render: (item) => (
      <span style={{ color: '#fff', fontSize: '12px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {item.companyName || item.contactName || 'Sin nombre'}
      </span>
    )
  },
  {
    header: 'NIT',
    field: 'documentNumber',
    width: '100px',
    render: (item) => (
      <span style={{ color: '#fff', fontSize: '13px', fontWeight: '600', fontFamily: 'monospace' }}>
        {item.documentNumber || 'Sin NIT'}
      </span>
    )
  },
  {
    header: 'Correo',
    field: 'email',
    width: '220px',
    render: (item) => (
      <span style={{ color: '#fff', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {item.email || 'Sin correo'}
      </span>
    )
  },
  {
    header: 'Teléfono',
    field: 'phone',
    width: '120px',
    render: (item) => (
      <span style={{ color: '#fff', fontSize: '12px', fontFamily: 'monospace' }}>
        {item.phone || 'Sin teléfono'}
      </span>
    )
  }
];

// =========================
// RENDER PRINCIPAL
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
      <div style={{ marginBottom: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
          <div>
            <h1 style={{ color: "#fff", fontSize: "20px", fontWeight: "700", margin: 0, lineHeight: "1.2" }}>
              Proveedores
            </h1>
            <p style={{ color: "#9CA3AF", fontSize: "15px", margin: 0, lineHeight: "1.3" }}>
              Gestión de proveedores registrados
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
                fontWeight: '600',
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
              Registrar Proveedor
            </button>
          </div>
        </div>
      
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar por empresa, NIT, correo o teléfono..."
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
        <div style={{
          flex: 1,
          overflow: 'auto',
        }}>
          <EntityTable 
            entities={paginatedProveedores} 
            columns={columns} 
            onView={p => openModal('view', p)} 
            onEdit={p => openModal('edit', p)} 
            onAnular={handleToggleStatus}
            onReactivar={handleToggleStatus}
            onDelete={openDeleteModal}
            showAnularButton={true}
            showDeleteButton={true}
            showReactivarButton={true}
            moduleType="proveedores"
            idField="id"
            estadoField="isActive"
            switchProps={{
              activeColor: "#10b981",
              inactiveColor: "#ef4444"
            }}
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
              textAlign: (col) => col.align || 'left',
              fontWeight: '600',
              fontSize: "11px",
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
            Mostrando {showingStart}–{endIndex} de {filtered.length} proveedores
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
                fontSize: "12px",
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                minWidth: '90px',
              }}
            >
              ‹ Anterior
            </button>
            <span style={{
              padding: '6px 12px',
              fontSize: "12px",
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
                fontSize: "12px",
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

    <UniversalModal 
      isOpen={modalState.isOpen} 
      onClose={closeModal} 
      title={
        modalState.mode === 'create' ? 'Registrar Proveedor' : 
        modalState.mode === 'edit' ? 'Editar Proveedor' : 
        'Detalles del Proveedor'
      }
      subtitle={
        modalState.mode === 'create' ? 'Complete la información para registrar un nuevo proveedor' : 
        modalState.mode === 'edit' ? 'Modifique la información del proveedor' : 
        'Información detallada del proveedor'
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
          border: '1px solid rgba(255,215,0,0.25)',
          borderRadius: '12px',
          maxWidth: '400px',
          width: '90%',
          maxHeight: '85vh',
          overflowY: 'auto',
          margin: 'auto', 
          boxShadow: '0 4px 20px rgba(245, 200, 27, 0.1)',
        },
        title: {
          color: '#F5C81B',
          fontSize: "16px",
          fontWeight: '600',
          marginBottom: '4px'
        },
        subtitle: {
          color: '#9CA3AF',
          fontSize: "12px",
          marginBottom: '12px'
        }
      }}
    >
      <ProveedorFormFields 
        modalState={modalState}
        formData={formData}
        errors={errors}
        handleInputChange={handleInputChange}
        handleSave={handleSave}
        closeModal={closeModal}
        departamentos={departamentos}
        ciudades={ciudades}
        loadingCities={loadingCities}
        firstInputRef={firstInputRef}
      />
    </UniversalModal>
  
    <ConfirmDeleteModal 
      isOpen={deleteModal.isOpen} 
      onClose={closeDeleteModal} 
      onConfirm={handleDelete} 
      entityName="proveedor"
      entityData={deleteModal.proveedor}
      customMessage={deleteModal.customMessage}
      customStyles={{
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
        }
      }}
    />
  </>
);
};

export default ProveedoresPage;