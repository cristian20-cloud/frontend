// src/pages/admin/ProveedoresPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { initialSuppliers } from '../../data';
import EntityTable from '../../components/EntityTable';
import Alert from '../../components/Alert';
import SearchInput from '../../components/SearchInput';
import UniversalModal from '../../components/UniversalModal';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';

// =============== COMPONENTE RENDERFIELD SEPARADO ===============
const RenderField = ({ 
  label, 
  fieldName, 
  type = "text", 
  options = [], 
  required = false,
  value,
  error,
  onChange,
  onBlur,
  onKeyDown,
  disabled = false,
  isViewMode = false,
  departamentos = [],
  ciudades = [],
  loadingCities = false
}) => {
  const isError = error;
  const borderColor = isError ? "#ef4444" : "#334155";
  const backgroundColor = isViewMode ? "#1e293b" : "#1e293b";
  const labelStyle = {
    fontSize: "11px",
    color: "#e2e8f0",
    fontWeight: "500",
    marginBottom: "3px",
    display: "block",
  };
  const inputStyle = {
    backgroundColor: isViewMode ? "#1e293b" : backgroundColor,
    border: `1px solid ${borderColor}`,
    borderRadius: "6px",
    padding: "6px 8px",
    color: disabled || isViewMode ? "#94a3b8" : "#f1f5f9",
    fontSize: "12px",
    height: "32px",
    width: "100%",
    outline: "none",
    boxSizing: "border-box",
    cursor: disabled || isViewMode ? 'not-allowed' : 'auto',
  };
  const selectStyle = {
    ...inputStyle,
    appearance: "none",
    backgroundImage: isViewMode ? 'none' : `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: "right 6px center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "12px",
  };
  const errorStyle = {
    color: "#f87171",
    fontSize: "10px",
    fontWeight: "500",
    marginTop: "2px",
    height: "12px",
    display: "flex",
    alignItems: "center",
    gap: "3px",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    minHeight: "12px",
  };

  if (isViewMode) {
    let displayValue = value || "N/A";
    if (fieldName === 'documentType' && value === 'Cédula de Ciudadanía') {
      displayValue = 'C.C.';
    } else if (fieldName === 'isActive') {
      displayValue = value ? "Activo" : "Inactivo";
    }
    const viewBoxStyle = {
      backgroundColor: "#1e293b",
      border: "1px solid #334155",
      borderRadius: "6px",
      padding: "6px 8px",
      color: fieldName === 'isActive' ? (value ? "#10B981" : "#EF4444") : "#f1f5f9",
      fontSize: "12px",
      height: "32px",
      display: "flex",
      alignItems: "center",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      boxSizing: "border-box",
      fontWeight: fieldName === 'isActive' ? '500' : '400',
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
      const currentOptions = fieldName === 'department' 
        ? departamentos 
        : fieldName === 'city' 
        ? ciudades 
        : options;
      return (
        <div style={{ position: "relative" }}>
          <label style={labelStyle}>
            {label}:{required && <span style={{ color: "#ef4444", marginLeft: "2px" }}>*</span>}
          </label>
          <div style={{ position: 'relative' }}>
            <select
              name={fieldName}
              value={value || ""}
              onChange={onChange}
              onBlur={onBlur}
              style={selectStyle}
              disabled={disabled || (fieldName === 'city' && loadingCities)}
            >
              <option value="">Seleccionar</option>
              {currentOptions.map((opt) => (
                <option key={opt.value || opt} value={opt.value || opt}>
                  {opt.label || opt}
                </option>
              ))}
            </select>
            {fieldName === 'city' && loadingCities && (
              <div style={{
                  position: 'absolute',
                  right: '6px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  border: '2px solid #F5C81B',
                  borderTopColor: 'transparent',
                  animation: 'spin 1s linear infinite',
              }}>
              </div>
            )}
          </div>
          {isError && (
            <div style={errorStyle}>
              <span style={{ color: "#f87171", fontSize: "10px", fontWeight: "bold" }}>●</span>
              {isError}
            </div>
          )}
        </div>
      );
    }
    return (
      <div style={{ position: "relative" }}>
        <label style={labelStyle}>
          {label}:{required && <span style={{ color: "#ef4444", marginLeft: "2px" }}>*</span>}
        </label>
        <input
          type={type}
          name={fieldName}
          value={value || ""}
          onChange={onChange}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          style={inputStyle}
          disabled={disabled}
        />
        {isError && (
          <div style={errorStyle}>
            <span style={{ color: "#f87171", fontSize: "10px", fontWeight: "bold" }}>●</span>
            {isError}
          </div>
        )}
      </div>
    );
  }
};
// =============== FIN COMPONENTE RENDERFIELD SEPARADO ===============

const ProveedoresPage = () => {
  const [proveedores, setProveedores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);
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
    isActive: true,
  });
  const [errors, setErrors] = useState({});
  const [deleteModal, setDeleteModal] = useState({ 
    isOpen: false, 
    proveedor: null,
    entityName: '' 
  });
  const initialLoadRef = useRef(true);

  // ====== COLUMNAS TABLA CORREGIDAS ======
  const columns = [
    { 
      header: 'Tipo Proveedor', 
      field: 'supplierType', 
      width: '100px',
      render: (item) => (
        <span style={{ 
          color: '#ffffff',
          fontSize: '12px',
          fontWeight: '500',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {item.supplierType === 'Persona Natural' ? 'Natural' : 'Jurídica'}
        </span>
      )
    }, 
    { 
      header: 'Empresa', 
      field: 'companyName', 
      width: '160px',
      render: (item) => (
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        }}>
          <div style={{ 
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: '500',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {item.companyName || item.contactName || 'Sin nombre'}
          </div>
        </div>
      )
    },
    { 
      header: 'NIT', 
      field: 'documentNumber', 
      width: '120px',
      render: (item) => (
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: '1px'
        }}>
          <div style={{ 
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {item.documentNumber || 'Sin NIT'}
          </div>
        </div>
      )
    },
    { 
      header: 'Correo', 
      field: 'email', 
      width: '180px',
      render: (item) => (
        <div style={{ 
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <a 
            href={`mailto:${item.email}`}
            style={{
              color: '#ffffff',
              fontSize: '12px',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'block',
              padding: '2px 0',
              flex: 1,
              fontWeight: '400'
            }}
            title={item.email}
            onMouseEnter={(e) => {
              e.target.style.textDecoration = 'underline';
              const tooltip = e.target.parentNode.querySelector('.email-tooltip');
              if (tooltip) tooltip.style.visibility = 'visible';
            }}
            onMouseLeave={(e) => {
              e.target.style.textDecoration = 'none';
              const tooltip = e.target.parentNode.querySelector('.email-tooltip');
              if (tooltip) tooltip.style.visibility = 'hidden';
            }}
          >
            {item.email || 'Sin correo'}
          </a>
          {item.email && (
            <div className="email-tooltip" style={{
              visibility: 'hidden',
              position: 'absolute',
              top: '100%',
              left: 0,
              backgroundColor: '#1e293b',
              color: '#ffffff',
              padding: '6px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              whiteSpace: 'nowrap',
              zIndex: 1000,
              border: '1px solid #334155',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              maxWidth: '300px',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {item.email}
            </div>
          )}
        </div>
      )
    },
    { 
      header: 'Teléfono', 
      field: 'phone', 
      width: '120px',
      render: (item) => (
        <span style={{ 
          color: '#ffffff',
          fontSize: '12px',
          whiteSpace: 'nowrap',
          fontWeight: '400'
        }}>
          {item.phone || 'Sin teléfono'}
        </span>
      )
    }
  ];

  // ====== SIMULACIÓN DE CARGA DE DATOS ======
  useEffect(() => {
    const mappedSuppliers = initialSuppliers.map(p => ({
      id: p.IdProveedor,
      companyName: p.Nombre,
      documentNumber: p.NumeroDocumento,
      contactName: p.Nombre, 
      email: p.Correo,
      phone: p.Telefono,
      isActive: p.Estado,
      supplierType: p.TipoProveedor === 'Empresa' ? 'Persona Jurídica' : p.TipoProveedor || 'Persona Jurídica',
      documentType: p.TipoDocumento || 'NIT',
      address: p.Direccion,
      department: p.Departamento,
      city: p.Ciudad,
      searchField: `${p.Nombre} ${p.TipoDocumento} ${p.NumeroDocumento} ${p.Correo} ${p.Telefono}`
    }));
    setProveedores(mappedSuppliers);
    setDepartamentos([
      { value: 'Antioquia', label: 'Antioquia' },
      { value: 'Cundinamarca', label: 'Cundinamarca' },
      { value: 'Valle del Cauca', label: 'Valle del Cauca' },
      { value: 'Santander', label: 'Santander' },
      { value: 'Atlántico', label: 'Atlántico' },
      { value: 'Bolívar', label: 'Bolívar' },
      { value: 'Norte de Santander', label: 'Norte de Santander' },
      { value: 'Risaralda', label: 'Risaralda' },
    ]);
  }, []);

  // ====== LÓGICA DE CIUDADES ======
  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }
    const selectedDepartment = formData.department;
    setCiudades([]);
    setFormData(prev => ({ ...prev, city: '' }));
    if (selectedDepartment) {
      setLoadingCities(true);
      setTimeout(() => {
        let newCities = [];
        if (selectedDepartment === 'Antioquia') {
          newCities = [
            { value: 'Medellín', label: 'Medellín' },
            { value: 'Envigado', label: 'Envigado' },
            { value: 'Sabaneta', label: 'Sabaneta' },
            { value: 'Itagüí', label: 'Itagüí' },
            { value: 'Bello', label: 'Bello' },
            { value: 'La Ceja', label: 'La Ceja' },
          ];
        } else if (selectedDepartment === 'Cundinamarca') {
          newCities = [
            { value: 'Bogotá D.C.', label: 'Bogotá D.C.' },
            { value: 'Soacha', label: 'Soacha' },
            { value: 'Chía', label: 'Chía' },
          ];
        } else if (selectedDepartment === 'Valle del Cauca') {
          newCities = [
            { value: 'Cali', label: 'Cali' },
            { value: 'Palmira', label: 'Palmira' },
          ];
        } else if (selectedDepartment === 'Santander') {
          newCities = [
            { value: 'Bucaramanga', label: 'Bucaramanga' },
          ];
        } else if (selectedDepartment === 'Atlántico') {
          newCities = [
            { value: 'Barranquilla', label: 'Barranquilla' },
          ];
        } else if (selectedDepartment === 'Bolívar') {
          newCities = [
            { value: 'Cartagena', label: 'Cartagena' },
          ];
        } else if (selectedDepartment === 'Norte de Santander') {
          newCities = [
            { value: 'Cúcuta', label: 'Cúcuta' },
          ];
        } else if (selectedDepartment === 'Risaralda') {
          newCities = [
            { value: 'Pereira', label: 'Pereira' },
          ];
        } else {
          newCities = [
            { value: 'Ciudad Principal', label: 'Ciudad Principal' },
            { value: 'Otra Ciudad', label: 'Otra Ciudad' },
          ];
        }
        setCiudades(newCities);
        setLoadingCities(false);
      }, 500);
    }
  }, [formData.department]);

  // ====== UTILIDADES ======
  const showAlert = (msg, type = 'success') => {
    setAlert({ show: true, message: msg, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3000);
  };
  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (name === 'supplierType') {
      let newDocType = '';
      if (value === 'Persona Natural') {
        newDocType = 'Cédula de Ciudadanía'; 
      } else {
        newDocType = 'NIT'; 
      }
      const updatedData = { 
        documentType: newDocType,
        documentNumber: ''
      };
      if (value === 'Persona Natural') {
        updatedData.companyName = '';
        updatedData.contactName = '';
      }
      setFormData(prev => ({ ...prev, ...updatedData }));
    }
    if (name === 'department') {
      setFormData(prev => ({ ...prev, city: '' }));
    }
  };

  // ====== FUNCIÓN MODIFICADA PARA EL TOGGLE ======
  const handleToggleStatus = (proveedor) => {
    console.log('Toggle clicked for:', proveedor);
    
    setProveedores(prev => prev.map(p => 
      p.id === proveedor.id ? { ...p, isActive: !p.isActive } : p
    ));
    
    const nuevoEstado = !proveedor.isActive;
    showAlert(`Proveedor ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`, 'success');
  };

  // ====== MODALES Y VALIDACIÓN ======
  const openModal = (mode = 'view', proveedor = null) => {
    setModalState({ isOpen: true, mode, proveedor });
    setErrors({});
    if (proveedor) {
      setFormData(proveedor);
      if (proveedor.department) {
        const department = proveedor.department;
        setLoadingCities(true);
        setTimeout(() => {
          let newCities = [];
          if (department === 'Antioquia') {
            newCities = [
              { value: 'Medellín', label: 'Medellín' },
              { value: 'Envigado', label: 'Envigado' },
              { value: 'Sabaneta', label: 'Sabaneta' },
              { value: 'Itagüí', label: 'Itagüí' },
              { value: 'Bello', label: 'Bello' },
              { value: 'La Ceja', label: 'La Ceja' },
            ];
          } else if (department === 'Cundinamarca') {
            newCities = [
              { value: 'Bogotá D.C.', label: 'Bogotá D.C.' },
              { value: 'Soacha', label: 'Soacha' },
              { value: 'Chía', label: 'Chía' },
            ];
          } else if (department === 'Valle del Cauca') {
            newCities = [
              { value: 'Cali', label: 'Cali' },
              { value: 'Palmira', label: 'Palmira' },
            ];
          } else if (department === 'Santander') {
            newCities = [
              { value: 'Bucaramanga', label: 'Bucaramanga' },
            ];
          } else if (department === 'Atlántico') {
            newCities = [
              { value: 'Barranquilla', label: 'Barranquilla' },
            ];
          } else if (department === 'Bolívar') {
            newCities = [
              { value: 'Cartagena', label: 'Cartagena' },
            ];
          } else if (department === 'Norte de Santander') {
            newCities = [
              { value: 'Cúcuta', label: 'Cúcuta' },
            ];
          } else if (department === 'Risaralda') {
            newCities = [
              { value: 'Pereira', label: 'Pereira' },
            ];
          } else {
            newCities = [
              { value: 'Ciudad Principal', label: 'Ciudad Principal' },
              { value: 'Otra Ciudad', label: 'Otra Ciudad' },
            ];
          }
          setCiudades(newCities);
          setLoadingCities(false);
        }, 500); 
      }
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
        isActive: true,
      });
      setCiudades([]);
    }
  };
  const closeModal = () => {
    setModalState({ isOpen: false, mode: 'view', proveedor: null });
    setFormData({});
    setErrors({});
    setCiudades([]);
  };
  const openDeleteModal = (proveedor) => {
    if (proveedor.isActive) {
      showAlert('No se puede eliminar un proveedor activo. Primero desactívelo.', 'delete');
      return;
    }
    setDeleteModal({ 
      isOpen: true, 
      proveedor,
      entityName: proveedor.companyName || proveedor.contactName || 'proveedor'
    });
  };
  const closeDeleteModal = () => setDeleteModal({ isOpen: false, proveedor: null, entityName: '' });
  const handleDelete = () => {
    if (!deleteModal.proveedor) return;
    setProveedores(prev => prev.filter(p => p.id !== deleteModal.proveedor.id));
    showAlert(`Proveedor "${deleteModal.proveedor.companyName}" eliminado correctamente`, 'delete');
    closeDeleteModal();
  };
  const validateForm = () => {
    const { supplierType } = formData;
    let requiredFields = ['supplierType', 'documentType', 'documentNumber', 'email', 'phone', 'address', 'department', 'city'];
    if (supplierType === 'Persona Natural') {
      requiredFields.push('contactName');
    } else {
      requiredFields.push('companyName', 'contactName');
    }
    const newErrors = {};
    requiredFields.forEach(field => {
      if (!formData[field]?.toString().trim()) {
        let fieldName = field;
        if (field === 'companyName') fieldName = 'Empresa';
        if (field === 'contactName') fieldName = supplierType === 'Persona Natural' ? 'Nombre Completo' : 'Contacto';
        if (field === 'documentNumber') fieldName = supplierType === 'Persona Natural' ? 'Número ID' : 'Número Documento';
        newErrors[field] = `${fieldName} es obligatorio`;
      }
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      showAlert('Complete los campos obligatorios', 'delete');
      return false;
    }
    return true;
  };
  const handleSave = () => {
    if (!validateForm()) return;
    if (modalState.mode === 'edit' && modalState.proveedor?.id) {
      setProveedores(prev => prev.map(p => p.id === modalState.proveedor.id ? { ...p, ...formData } : p));
      showAlert(`Proveedor actualizado correctamente`, 'success');
    } else {
      const newId = `prov-${Date.now()}`;
      setProveedores(prev => [...prev, { 
        ...formData, 
        id: newId, 
        isActive: true,
        searchField: `${formData.companyName} ${formData.documentType} ${formData.documentNumber} ${formData.email} ${formData.phone}`
      }]);
      showAlert(`Proveedor registrado correctamente`, 'success');
    }
    closeModal();
  };

  // ====== COMPONENTE DE CAMPOS DEL MODAL (COMPACTO) ======
  const ProveedorFormFields = () => {
    const isViewMode = modalState.mode === 'view';
    const { supplierType } = formData;
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column",
        gap: "4px", 
      }}>
        <div style={{ 
          flex: 1,
          display: "flex", 
          flexDirection: "column", 
          gap: "4px" 
        }}>
          {/* Tipo de Proveedor */}
          <RenderField
            label="Tipo de Proveedor"
            fieldName="supplierType"
            type="select"
            required={true}
            value={formData.supplierType}
            onChange={handleFieldChange}
            error={errors.supplierType}
            isViewMode={isViewMode}
            options={[
              { value: "Persona Jurídica", label: "Persona Jurídica" },
              { value: "Persona Natural", label: "Persona Natural" },
            ]}
          />
          {/* Tipo y Número de Documento */}
          <div style={{ display: "flex", gap: "6px" }}>
            <div style={{ flex: 1.2 }}>
              <RenderField
                label={supplierType === 'Persona Natural' ? "Tipo ID" : "Tipo NIT"}
                fieldName="documentType"
                type="select"
                required={true}
                value={formData.documentType}
                onChange={handleFieldChange}
                error={errors.documentType}
                isViewMode={isViewMode}
                options={
                  supplierType === 'Persona Natural' 
                    ? [
                        { value: "Cédula de Ciudadanía", label: "C.C." },
                        { value: "Cédula de Extranjería", label: "C.E." },
                      ]
                    : [
                        { value: "NIT", label: "NIT" },
                      ]
                }
                disabled={isViewMode || supplierType !== 'Persona Natural'}
              />
            </div>
            <div style={{ flex: 1.8 }}>
              <RenderField
                label={supplierType === 'Persona Natural' ? "Número ID" : "Número Documento"}
                fieldName="documentNumber"
                type="text"
                required={true}
                value={formData.documentNumber}
                onChange={handleFieldChange}
                error={errors.documentNumber}
                isViewMode={isViewMode}
              />
            </div>
          </div>
          {/* EMPRESA Y CONTACTO EN UNA LÍNEA (SOLO PERSONA JURÍDICA) */}
          {supplierType === 'Persona Jurídica' && (
            <div style={{ display: "flex", gap: "6px" }}>
              <div style={{ flex: 1 }}>
                <RenderField
                  label="Empresa"
                  fieldName="companyName"
                  type="text"
                  required={true}
                  value={formData.companyName}
                  onChange={handleFieldChange}
                  error={errors.companyName}
                  isViewMode={isViewMode}
                />
              </div>
              <div style={{ flex: 1 }}>
                <RenderField
                  label="Contacto"
                  fieldName="contactName"
                  type="text"
                  required={true}
                  value={formData.contactName}
                  onChange={handleFieldChange}
                  error={errors.contactName}
                  isViewMode={isViewMode}
                />
              </div>
            </div>
          )}
          {/* NOMBRE COMPLETO (SOLO PERSONA NATURAL) */}
          {supplierType === 'Persona Natural' && (
            <RenderField
              label="Nombre Completo"
              fieldName="contactName"
              type="text"
              required={true}
              value={formData.contactName}
              onChange={handleFieldChange}
              error={errors.contactName}
              isViewMode={isViewMode}
            />
          )}
          {/* Correo y Teléfono */}
          <div style={{ display: "flex", gap: "6px" }}>
            <div style={{ flex: 1 }}>
              <RenderField
                label="Correo"
                fieldName="email"
                type="email"
                required={true}
                value={formData.email}
                onChange={handleFieldChange}
                error={errors.email}
                isViewMode={isViewMode}
              />
            </div>
            <div style={{ flex: 1 }}>
              <RenderField
                label="Teléfono"
                fieldName="phone"
                type="tel"
                required={true}
                value={formData.phone}
                onChange={handleFieldChange}
                error={errors.phone}
                isViewMode={isViewMode}
              />
            </div>
          </div>
          {/* Departamento y Ciudad */}
          <div style={{ display: "flex", gap: "6px" }}>
            <div style={{ flex: 1 }}>
              <RenderField
                label="Departamento"
                fieldName="department"
                type="select"
                required={true}
                value={formData.department}
                onChange={handleFieldChange}
                error={errors.department}
                isViewMode={isViewMode}
                departamentos={departamentos}
              />
            </div>
            <div style={{ flex: 1 }}>
              <RenderField
                label="Ciudad"
                fieldName="city"
                type="select"
                required={true}
                value={formData.city}
                onChange={handleFieldChange}
                error={errors.city}
                isViewMode={isViewMode}
                ciudades={ciudades}
                loadingCities={loadingCities}
                disabled={!formData.department}
              />
            </div>
          </div>
          {/* Dirección */}
          <RenderField
            label="Dirección"
            fieldName="address"
            type="text"
            required={true}
            value={formData.address}
            onChange={handleFieldChange}
            error={errors.address}
            isViewMode={isViewMode}
          />
          {/* Estado (Solo en vista) */}
          {isViewMode && (
            <RenderField
              label="Estado"
              fieldName="isActive"
              type="text"
              value={formData.isActive}
              isViewMode={isViewMode}
            />
          )}
        </div>
        {/* Botones */}
        {(modalState.mode === "create" || modalState.mode === "edit") && (
          <div style={{ 
            display: "flex", 
            gap: "8px", 
            justifyContent: "flex-end", 
            paddingTop: "10px",
            marginTop: "6px",
            borderTop: "1px solid #334155"
          }}>
            <button
              onClick={closeModal}
              style={{
                backgroundColor: "transparent",
                border: "1px solid #94a3b8",
                color: "#94a3b8",
                padding: "5px 12px",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: "500",
                cursor: "pointer",
                minWidth: "75px",
                height: "28px",
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              style={{
                backgroundColor: "#F5C81B",
                border: "none",
                color: "#0f172a",
                padding: "5px 12px",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: "600",
                cursor: "pointer",
                minWidth: "85px",
                height: "28px",
              }}
            >
              {modalState.mode === "create" ? "Guardar" : "Guardar Cambios"}
            </button>
          </div>
        )}
      </div>
    );
  };

  // ====== FILTRADO Y PAGINACIÓN ======
  const filtered = proveedores.filter(p => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      (p.searchField && p.searchField.toLowerCase().includes(term)) ||
      (p.companyName && p.companyName.toLowerCase().includes(term)) ||
      (p.contactName && p.contactName.toLowerCase().includes(term)) ||
      (p.email && p.email.toLowerCase().includes(term)) ||
      (p.phone && p.phone.includes(term)) ||
      (p.documentNumber && p.documentNumber.includes(term));
    const matchesStatus = filterStatus === 'Todos' || p.isActive === (filterStatus === 'Activos');
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

  // =============== COMPONENTE STATUSFILTER (DESPEGABLE HACIA ABAJO) ===============
  const StatusFilter = () => {
    const [open, setOpen] = useState(false);

    const handleSelect = (status) => {
      setFilterStatus(status);
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
            zIndex: 1000, 
            boxShadow: '0 4px 12px rgba(245, 200, 27, 0.3)' 
          }}>
            {['Todos', 'Activos', 'Inactivos'].map(status => (
              <button 
                key={status} 
                onClick={() => handleSelect(status)} 
                style={{ 
                  width: '100%', 
                  padding: '6px 12px', 
                  backgroundColor: filterStatus === status ? '#F5C81B' : 'transparent', 
                  border: 'none', 
                  color: filterStatus === status ? '#000' : '#F5C81B', 
                  fontSize: '13px', 
                  textAlign: 'left', 
                  cursor: 'pointer', 
                  fontWeight: filterStatus === status ? '600' : '400' 
                }}
                onMouseEnter={e => {
                  if (filterStatus !== status) {
                    e.target.style.backgroundColor = '#F5C81B';
                    e.target.style.color = '#000';
                  }
                }}
                onMouseLeave={e => {
                  if (filterStatus !== status) {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#F5C81B';
                  }
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
  // =============== FIN STATUSFILTER ===============

  // ====== RENDERIZADO PRINCIPAL ======
  return (
    <>
      {alert.show && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ show: false, message: '', type: 'success' })}
        />
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "4px 12px 0 12px",
          flex: 1,
          height: "100%", // Añadido para ocupar toda la altura
          overflow: "hidden", // Evita scroll en el contenedor principal
        }}
      >
        {/* Encabezado - fijo */}
        <div style={{ 
          marginBottom: "8px",
          flexShrink: 0 
        }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "6px",
            }}
          >
            <div>
              <h1 style={{ color: "#fff", fontSize: "20px", fontWeight: "700", margin: 0, lineHeight: "1.2" }}>
                Proveedores
              </h1>
              <p style={{ color: "#9CA3AF", fontSize: "15px", margin: 0, lineHeight: "1.3" }}>
                Gestiona los proveedores registrados
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
                onClear={clearSearch}
                fullWidth={true}
              />
            </div>
            <StatusFilter />
          </div>
        </div>

        {/* Contenedor de tabla con altura fija */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '6px',
          border: '1px solid #F5C81B',
          overflow: 'hidden',
          backgroundColor: '#000',
          minHeight: 0, // Importante para flexbox
        }}>
          {/* Tabla con scroll */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            minHeight: 0,
          }}>
            <EntityTable
              entities={paginated}
              columns={columns}
              onView={(proveedor) => openModal("view", proveedor)}
              onEdit={(proveedor) => openModal("edit", proveedor)}
              onDelete={(proveedor) => openDeleteModal(proveedor)}
              onAnular={(proveedor) => handleToggleStatus(proveedor)}
              onReactivar={(proveedor) => handleToggleStatus(proveedor)}
              idField="id"
              estadoField="isActive"
              moduleType="generic"
              switchProps={{
                activeColor: "#10b981",
                inactiveColor: "#ef4444"
              }}
            />
          </div>

          {/* Paginación - siempre al final */}
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
            flexShrink: 0,
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
                  fontSize: '12px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  minWidth: '90px',
                }}
                onMouseEnter={(e) => {
                  if (currentPage > 1) {
                    e.currentTarget.style.backgroundColor = '#F5C81B';
                    e.currentTarget.style.color = '#000';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage > 1) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#F5C81B';
                  }
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
                onMouseEnter={(e) => {
                  if (currentPage < totalPages) {
                    e.currentTarget.style.backgroundColor = '#F5C81B';
                    e.currentTarget.style.color = '#000';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage < totalPages) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#F5C81B';
                  }
                }}
              >
                Siguiente ›
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL PRINCIPAL (MÁS ESTRECHO) */}
      <UniversalModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={
          modalState.mode === 'create'
            ? 'Registrar Proveedor'
            : modalState.mode === 'edit'
            ? 'Editar Proveedor'
            : 'Detalles del Proveedor'
        }
        subtitle={
          modalState.mode === 'create'
            ? 'Complete la información para registrar un nuevo proveedor'
            : modalState.mode === 'edit'
            ? 'Modifique la información del proveedor'
            : 'Información detallada del proveedor'
        }
        subtitleStyle={{ 
          fontSize: "11px", 
          color: "#9CA3AF",
          whiteSpace: "nowrap",     
          overflow: "hidden",        
          textOverflow: "ellipsis",  
          paddingRight: "10px",     
          marginBottom: "8px",
        }}
        showActions={false}
        customStyles={{
          content: { 
            padding: '14px 16px',
            backgroundColor: '#000000',
            border: '1px solid rgba(255,215,0,0.25)',
            borderRadius: '12px',
            maxWidth: '360px',
            width: '100%',
            maxHeight: 'calc(100vh - 40px)',
            overflowY: 'auto',
          }
        }}
      >
        <ProveedorFormFields />
      </UniversalModal>
      
      {/* USAR COMPONENTE ConfirmDeleteModal EXISTENTE */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        entityName={deleteModal.entityName}
        entityType="proveedor"
      />
    </>
  );
};

export default ProveedoresPage;