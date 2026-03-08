// src/pages/admin/UsersPage.jsx
import React, { useState, useMemo, useEffect } from "react";
// Componentes
import SearchInput from "../../components/SearchInput";
import EntityTable from "../../components/EntityTable";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import Alert from "../../components/Alert";
import UniversalModal from "../../components/UniversalModal";
// Datos
import { initialUsers as usersData, initialRoles } from "../../data";

// =============================================
// COMPONENTE StatusFilter
// =============================================
const StatusFilter = ({ filterStatus, onFilterSelect }) => {
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
          <path d="M6 9l6 6 6-6" />
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
              onClick={() => { onFilterSelect(status); setOpen(false); }}
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

// =============================================
// COMPONENTE StatusPill (ESTILO CLIENTES - COMPACTO)
// =============================================
const StatusPill = React.memo(({ status }) => {
  const isActive = status === true || status === 'true' || status === 'Activo';
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "3px 8px",
      borderRadius: "12px",
      backgroundColor: isActive ? "#10B98120" : "#EF444420",
      color: isActive ? "#10B981" : "#EF4444",
      fontWeight: 600,
      fontSize: "0.7rem",
      textTransform: "capitalize",
      border: `1px solid ${isActive ? "#10B98140" : "#EF444440"}`,
      gap: "4px"
    }}>
      <span style={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        backgroundColor: isActive ? "#10B981" : "#EF4444",
        flexShrink: 0
      }} />
      {isActive ? 'Activo' : 'Inactivo'}
    </span>
  );
});
StatusPill.displayName = 'StatusPill';

const FormField = React.memo(function FormField({ label, required, children, error }) {
  return (
    <div style={{ marginBottom: '8px' }}>
      <label style={{ fontSize: '12px', color: '#e2e8f0', display: 'block', marginBottom: '2px' }}>
        {label}: {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      {children}
      {error && <div style={{ color: '#f87171', fontSize: '11px' }}>{error}</div>}
    </div>
  );
});

const UsersPage = () => {
  // ─── Estados
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: "", type: "success" });
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  // ─── Inicializar datos
  useEffect(() => {
    const mapped = usersData.map((u, index) => {
      const role = initialRoles.find((r) => r.IdRol === u.IdRol);
      const [nombre, ...apellidos] = u.Nombre.trim().split(/\s+/);
      const apellido = apellidos.join(" ") || "";
      let rol;
      if (index === 0) {
        rol = "Administrador";
      } else {
        const roleName = role?.Nombre || "Usuario";
        rol = roleName === "Administrador" ? "Usuario" : roleName;
      }

      return {
        id: u.IdUsuario,
        nombre,
        apellido,
        email: u.Correo || "",
        rol,
        isActive: u.Estado,
        tipoDocumento: u.TipoDocumento || 'CC',
        numeroDocumento: u.NumeroDocumento || '',
      };
    });

    setUsers(mapped);
  }, []);

  // ─── Alertas
  const showAlert = (message, type = "success") => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "success" }), 2500);
  };

  // ─── Helper para verificar si es administrador
  const isAdministrador = (user) => (user?.rol || "").toLowerCase() === "administrador";

  // ─── Modal
  const openModal = (user = null) => {
    if (user && isAdministrador(user)) {
      viewUserDetails(user);
      return;
    }
    setEditingUser(user);
    setErrors({});

    if (user) {
      setFormData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        email: user.email || '',
        tipoDocumento: user.tipoDocumento || 'CC',
        numeroDocumento: user.numeroDocumento || '',
        rol: user.rol || '',
        isActive: user.isActive !== undefined ? user.isActive : true
      });
    } else {
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        tipoDocumento: 'CC',
        numeroDocumento: '',
        rol: '',
        isActive: true
      });
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingUser(null);
    setIsModalOpen(false);
    setFormData({});
    setErrors({});
  };

  const handleInputChange = (field, value) => {
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    const requiredFields = [
      { name: 'nombre', label: 'Nombre' },
      { name: 'email', label: 'Email' },
      { name: 'rol', label: 'Rol' },
    ];
    const newErrors = {};

    requiredFields.forEach(field => {
      const value = formData[field.name];
      const stringValue = value !== null && value !== undefined ? String(value) : '';
      if (!stringValue.trim()) {
        newErrors[field.name] = `${field.label} es obligatorio`;
      }
    });

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email no válido';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      showAlert('Complete los campos obligatorios correctamente', 'delete');
      return;
    }

    const updatedData = {
      nombre: formData.nombre.trim(),
      apellido: (formData.apellido || '').trim(),
      email: formData.email.trim(),
      tipoDocumento: formData.tipoDocumento || 'CC',
      numeroDocumento: formData.numeroDocumento || '',
      rol: formData.rol,
      isActive: Boolean(formData.isActive)
    };

    if (editingUser?.id) {
      if (updatedData.rol === "Administrador") {
        const existingAdmin = users.find(u => u.rol === "Administrador" && u.id !== editingUser.id);
        if (existingAdmin) {
          showAlert('Ya existe un usuario Administrador en el sistema', 'error');
          return;
        }
      }

      setUsers(prev => prev.map(u =>
        u.id === editingUser.id
          ? { ...u, ...updatedData }
          : u
      ));
      showAlert(`Usuario "${updatedData.nombre}" actualizado correctamente`, 'edit');
    } else {
      if (updatedData.rol === "Administrador") {
        const existingAdmin = users.find(u => u.rol === "Administrador");
        if (existingAdmin) {
          showAlert('Ya existe un usuario Administrador en el sistema', 'error');
          return;
        }
      }

      const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
      setUsers(prev => [...prev, { ...updatedData, id: newId }]);
      showAlert(`Usuario "${updatedData.nombre}" registrado correctamente`, 'add');
    }

    closeModal();
  };

  // ─── Eliminar
  const handleDeleteClick = (user) => {
    if (isAdministrador(user)) {
      showAlert('El usuario "Administrador" no se puede eliminar', "error");
      return;
    }
    if (user.isActive) {
      showAlert('No se puede eliminar un usuario activo. Debe desactivarlo primero.', 'delete');
      return;
    }

    setUserToDelete(user);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
    setIsConfirmOpen(false);
    setUserToDelete(null);
    showAlert("Usuario eliminado correctamente");
  };

  // ─── Toggle de estado
  const handleToggleStatus = (user) => {
    if (isAdministrador(user)) {
      showAlert('El usuario "Administrador" siempre está activo', "error");
      return;
    }
    const newStatus = !user.isActive;

    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? {
            ...u,
            isActive: newStatus
          }
          : u
      )
    );

    showAlert(
      `Usuario "${user.nombre}" ${newStatus ? 'activado' : 'desactivado'} correctamente`,
      newStatus ? 'add' : 'delete'
    );
  };

  // ─── Ver detalles
  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };

  // ─── Utilidades de búsqueda y filtrado
  const handleFilterSelect = (status) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  // ─── Filtrado y paginación
  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return users.filter((user) => {
      if (filterStatus === 'Activos' && !user.isActive) return false;
      if (filterStatus === 'Inactivos' && user.isActive) return false;
      if (term) {
        const fullName = `${user.nombre} ${user.apellido}`.toLowerCase();
        return (
          fullName.includes(term) ||
          user.email.toLowerCase().includes(term) ||
          (user.rol?.toLowerCase() || "").includes(term) ||
          (user.numeroDocumento || "").toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [users, searchTerm, filterStatus]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredUsers.length);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
    else if (totalPages === 0) setCurrentPage(1);
  }, [totalPages, currentPage]);

  // ─── Render Field para el Modal
  const renderField = (label, fieldName, type = 'text', options = []) => {
    const isError = errors[fieldName];
    const borderColor = isError ? '#ef4444' : '#334155';
    const backgroundColor = isError ? '#451a1a' : '#1e293b';
    const labelStyle = {
      fontSize: '12px',
      color: '#e2e8f0',
      fontWeight: '500',
      marginBottom: '2px',
      display: 'block'
    };

    const inputStyle = {
      backgroundColor,
      border: `1px solid ${borderColor}`,
      borderRadius: '6px',
      padding: '4px 8px',
      color: '#f1f5f9',
      fontSize: '13px',
      height: '30px',
      width: '100%',
      outline: 'none',
      boxSizing: 'border-box',
      fontFamily: 'inherit',
    };

    const errorStyle = {
      color: '#f87171',
      fontSize: '11px',
      fontWeight: '500',
      marginTop: '1px',
      height: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      visibility: isError ? 'visible' : 'hidden',
    };

    const value = formData[fieldName] || '';
    const isSelectField = ['tipoDocumento', 'rol'].includes(fieldName);

    if (isSelectField) {
      let fieldOptions = options;
      if (fieldName === 'rol') {
        const existingAdmin = users.find(u => u.rol === "Administrador");
        fieldOptions = [
          { value: 'Usuario', label: 'Usuario' },
          { value: 'Vendedor', label: 'Vendedor' },
          { value: 'Supervisor', label: 'Supervisor' }
        ];

        if (!existingAdmin || (editingUser && editingUser.rol === "Administrador")) {
          fieldOptions.unshift({ value: 'Administrador', label: 'Administrador' });
        }
      }

      return (
        <div>
          <label style={labelStyle}>
            {label}: <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <select
            name={fieldName}
            value={value}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            style={inputStyle}
          >
            <option value="">Seleccionar...</option>
            {fieldOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <div style={errorStyle}>
            {isError && (
              <>
                <span style={{ color: '#f87171', fontSize: '14px', fontWeight: 'bold' }}>●</span>
                {isError}
              </>
            )}
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <label style={labelStyle}>
            {label}: <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            name={fieldName}
            type={type}
            value={value}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            style={inputStyle}
          />
          <div style={errorStyle}>
            {isError && (
              <>
                <span style={{ color: '#f87171', fontSize: '14px', fontWeight: 'bold' }}>●</span>
                {isError}
              </>
            )}
          </div>
        </div>
      );
    }
  };

  // ─── Columnas COMPACTAS - Estado centrado como Clientes
  const columns = [
    {
      header: 'Nombre',
      field: 'nombreCompleto',
      width: '25%',
      render: (item) => (
        <span style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>
          {item.nombre} {item.apellido}
        </span>
      )
    },
    {
      header: 'Email',
      field: 'email',
      width: '30%',
      render: (item) => (
        <span style={{ color: '#fff', fontSize: '13px' }}>{item.email}</span>
      )
    },
    {
      header: 'Rol',
      field: 'rol',
      width: '20%',
      render: (item) => (
        <span style={{
          color: item.rol === 'Administrador' ? '#F5C81B' : '#fff',
          fontSize: '13px',
          fontWeight: item.rol === 'Administrador' ? '600' : '400'
        }}>
          {item.rol}
        </span>
      )
    },
    {
      header: 'Estado',
      field: 'estado',
      width: '12%',
      align: 'center',
      headerStyle: {
        textAlign: 'center',
      },
      render: (item) => (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%'
        }}>
          <StatusPill status={item.isActive} />
        </div>
      )
    }
  ];

  // ─── Render
  return (
    <>
      {alert.show && <Alert message={alert.message} type={alert.type} onClose={() => setAlert({ ...alert, show: false })} />}
      <div style={{ display: "flex", flexDirection: "column", padding: "4px 12px 0 12px", flex: 1, height: "100%" }}>
        {/* Encabezado */}
        <div style={{ marginBottom: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <div>
              <h1 style={{ color: "#fff", fontSize: "20px", fontWeight: "700", margin: 0, lineHeight: "1.2" }}>
                Usuarios
              </h1>
              <p style={{ color: "#9CA3AF", fontSize: "15px", margin: 0, lineHeight: "1.3" }}>
                Gestión de usuarios del sistema
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => openModal()}
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
                Registrar Usuario
              </button>
            </div>
          </div>

          {/* Buscador y Filtro */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar por nombre, email o documento..."
                onClear={() => setSearchTerm('')}
                fullWidth={true}
              />
            </div>
            <StatusFilter filterStatus={filterStatus} onFilterSelect={handleFilterSelect} />
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
              entities={paginatedUsers}
              columns={columns}
              onView={viewUserDetails}
              onEdit={openModal}
              onDelete={handleDeleteClick}
              onAnular={handleToggleStatus}
              onReactivar={handleToggleStatus}
              showAnularButton={true}
              moduleType="usuarios"
              idField="id"
              estadoField="isActive"
              isAdministradorCheck={isAdministrador}
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
                fontSize: '12px',
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
              actionsPosition="right"
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
              Mostrando {(filteredUsers.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0)}–{Math.min(currentPage * itemsPerPage, filteredUsers.length)} de {filteredUsers.length} usuarios
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
                Página {currentPage} de {Math.ceil(filteredUsers.length / itemsPerPage) || 1}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= Math.ceil(filteredUsers.length / itemsPerPage)}
                style={{
                  background: 'transparent',
                  border: '1px solid #F5C81B',
                  color: currentPage >= Math.ceil(filteredUsers.length / itemsPerPage) ? '#6B7280' : '#F5C81B',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: currentPage >= Math.ceil(filteredUsers.length / itemsPerPage) ? 'not-allowed' : 'pointer',
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

      {/* Modal: Crear/Editar Usuario */}
      <UniversalModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingUser?.id ? 'Editar Usuario' : 'Registrar Usuario'}
        subtitle={editingUser?.id ? 'Modifica los datos del usuario' : 'Agrega un nuevo usuario al sistema'}
        showActions={false}
        customStyles={{
          content: {
            padding: '16px',
            backgroundColor: '#000',
            border: '1px solid #F5C81B',
            borderRadius: '6px',
            maxWidth: '400px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
          },
          title: {
            color: '#fff',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '4px'
          },
          subtitle: {
            color: '#9CA3AF',
            fontSize: '12px',
            marginBottom: '16px'
          }
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* PRIMERO: Tipo Documento y N° Documento */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              {renderField('Tipo Documento', 'tipoDocumento', 'select', [
                { value: 'CC', label: 'Cédula' },
                { value: 'CE', label: 'Extranjería' },
                { value: 'NIT', label: 'NIT' },
                { value: 'Pasaporte', label: 'Pasaporte' }
              ])}
            </div>
            <div style={{ flex: 1 }}>
              {renderField('N° Documento', 'numeroDocumento', 'text')}
            </div>
          </div>

          {/* SEGUNDO: Nombre y Apellido */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              {renderField('Nombre', 'nombre', 'text')}
            </div>
            <div style={{ flex: 1 }}>
              {renderField('Apellido', 'apellido', 'text')}
            </div>
          </div>

          {/* TERCERO: Email */}
          <div>
            {renderField('Email', 'email', 'email')}
          </div>

          {/* CUARTO: Rol */}
          <div>
            {renderField('Rol', 'rol', 'select')}
          </div>

          {/* SOLO BOTÓN GUARDAR/REGISTRAR */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '8px'
          }}>
            <button
              onClick={handleSave}
              style={{
                background: '#F5C81B',
                color: '#000',
                border: 'none',
                padding: '8px 24px',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                minWidth: '140px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f5d33c';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#F5C81B';
              }}
            >
              {editingUser?.id ? 'Guardar Cambios' : 'Registrar Usuario'}
            </button>
          </div>
        </div>
      </UniversalModal>

      {/* Modal Confirm Delete */}
      <ConfirmDeleteModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        entityName="usuario"
        entityData={userToDelete}
      />

      {/* Modal Detalles */}
      <UniversalModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title="Detalles del Usuario"
        subtitle="Información detallada del usuario"
        showActions={false}
        customStyles={{
          content: {
            padding: '16px',
            backgroundColor: '#000',
            border: '1px solid #F5C81B',
            borderRadius: '6px',
            maxWidth: '400px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
          },
          title: {
            color: '#fff',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '4px'
          },
          subtitle: {
            color: '#9CA3AF',
            fontSize: '12px',
            marginBottom: '16px'
          }
        }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* PRIMERO: Tipo Documento y N° Documento */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <FormField label="Tipo Documento">
                <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "6px", padding: "6px 10px", color: "#f1f5f9", fontSize: "13px" }}>
                  {selectedUser?.tipoDocumento || 'N/A'}
                </div>
              </FormField>
            </div>
            <div style={{ flex: 1 }}>
              <FormField label="N° Documento">
                <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "6px", padding: "6px 10px", color: "#f1f5f9", fontSize: "13px" }}>
                  {selectedUser?.numeroDocumento || 'N/A'}
                </div>
              </FormField>
            </div>
          </div>

          {/* SEGUNDO: Nombre y Apellido */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <FormField label="Nombre">
                <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "6px", padding: "6px 10px", color: "#F5C81B", fontSize: "13px", fontWeight: "600" }}>
                  {selectedUser?.nombre || 'N/A'}
                </div>
              </FormField>
            </div>
            <div style={{ flex: 1 }}>
              <FormField label="Apellido">
                <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "6px", padding: "6px 10px", color: "#F5C81B", fontSize: "13px", fontWeight: "600" }}>
                  {selectedUser?.apellido || 'N/A'}
                </div>
              </FormField>
            </div>
          </div>

          {/* TERCERO: Email */}
          <div>
            <FormField label="Email">
              <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "6px", padding: "6px 10px", color: "#f1f5f9", fontSize: "13px" }}>
                {selectedUser?.email || 'N/A'}
              </div>
            </FormField>
          </div>

          {/* CUARTO: Rol y Estado */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <FormField label="Rol">
                <div style={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "6px",
                  padding: "6px 10px",
                  color: selectedUser?.rol === 'Administrador' ? '#F5C81B' : '#f1f5f9',
                  fontSize: "13px",
                  fontWeight: selectedUser?.rol === 'Administrador' ? '600' : '400'
                }}>
                  {selectedUser?.rol || 'N/A'}
                </div>
              </FormField>
            </div>
            <div style={{ flex: 1 }}>
              <FormField label="Estado">
                <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "6px", padding: "6px 10px", color: selectedUser?.isActive ? '#10b981' : '#ef4444', fontSize: "13px", fontWeight: "600" }}>
                  {selectedUser?.isActive ? 'Activo' : 'Inactivo'}
                </div>
              </FormField>
            </div>
          </div>
        </div>
      </UniversalModal>
    </>
  );
};

export default UsersPage;