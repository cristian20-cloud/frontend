// src/pages/admin/RolesPage.jsx
import React, { useState, useMemo, useEffect } from "react";
import { initialRoles, availablePermissions } from "../../data";
import SearchInput from "../../components/SearchInput";
import EntityTable from "../../components/EntityTable";
import UniversalModal from "../../components/UniversalModal";
import Alert from "../../components/Alert";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";

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
          whiteSpace: 'nowrap', 
          minWidth: '110px', 
          justifyContent: 'space-between', 
          fontWeight: '600', 
          height: '36px',
          transition: 'all 0.2s'
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
        <svg 
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          style={{ 
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)', 
            transition: 'transform 0.2s' 
          }}
        >
          <polyline points="6,9 12,15 18,9"/>
        </svg>
      </button>
      {open && (
        <div style={{
          position: 'absolute', 
          top: '100%', 
          right: 0, 
          marginTop: '4px', 
          backgroundColor: '#000',
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
              onClick={() => { onFilterSelect(status); setOpen(false); }}
              style={{
                width: '100%', 
                padding: '6px 12px', 
                backgroundColor: filterStatus === status ? '#F5C81B' : 'transparent',
                border: 'none', 
                color: filterStatus === status ? '#000' : '#F5C81B', 
                fontSize: '13px',
                textAlign: 'left', 
                cursor: 'pointer', 
                fontWeight: filterStatus === status ? '600' : '400',
                transition: 'all 0.2s'
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

// =============================================
// COMPONENTE FormField (modificado para errores sin scroll)
// =============================================
const FormField = ({ label, required, children, error, isViewMode = false, viewValue }) => {
  if (isViewMode) {
    return (
      <div>
        <label style={{ fontSize: '12px', color: '#e2e8f0', display: 'block', marginBottom: '2px' }}>
          {label}:
        </label>
        <div style={{
          padding: '6px 10px', 
          backgroundColor: '#1e293b', 
          border: '1px solid #334155', 
          borderRadius: '6px',
          color: label === 'Estado' ? (viewValue === 'Activo' ? '#10b981' : '#ef4444') : '#f1f5f9',
          fontSize: '13px', 
          minHeight: '32px', 
          display: 'flex', 
          alignItems: 'center'
        }}>
          {viewValue || 'N/A'}
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <label style={{ fontSize: '12px', color: '#e2e8f0', display: 'block', marginBottom: '2px' }}>
        {label}: {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      {children}
      {error && (
        <div style={{ 
          color: '#f87171', 
          fontSize: '10px', 
          marginTop: '2px',
          height: '14px',
          lineHeight: '14px',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

// =============================================
// PÁGINA PRINCIPAL RolesPage
// =============================================
const RolesPage = () => {
  // ── Estados
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);

  const [currentRole, setCurrentRole] = useState({
    name: "",
    description: "",
    permissions: [],
    isActive: true,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: "", type: "success" });

  const [selectedRole, setSelectedRole] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({
    name: false,
    permissions: false
  });

  // ── Helpers
  const showAlert = (message, type = "success") => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "success" }), 2500);
  };

  const isAdministrador = (role) => (role?.name || "").toLowerCase() === "administrador";

  // ── Validación de campos
  const validateFields = () => {
    const errors = {
      name: !currentRole.name?.trim(),
      permissions: currentRole.permissions.length === 0 && !isAdministrador(currentRole)
    };
    
    setFieldErrors(errors);
    return !errors.name && !errors.permissions;
  };

  // ── Efecto: Inicializar roles
  useEffect(() => {
    const mappedRoles = initialRoles.map((role) => ({
      id: role.IdRol,
      name: role.Nombre,
      description: role.Descripcion || "",
      permissions: role.Permisos || [],
      isActive: role.Estado,
    }));

    const updatedRoles = mappedRoles.map((role) =>
      isAdministrador(role)
        ? { ...role, description: "Acceso de solo lectura" }
        : role
    );

    setRoles(updatedRoles);
  }, []);

  // ── Datos derivados
  const filteredRoles = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return roles.filter((r) => {
      if (filterStatus === "Activos" && !r.isActive) return false;
      if (filterStatus === "Inactivos" && r.isActive) return false;

      if (term) {
        return (
          (r.name || "").toLowerCase().includes(term) ||
          (r.description || "").toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [roles, searchTerm, filterStatus]);

  // ── Paginación
  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredRoles.length);
  const paginatedRoles = filteredRoles.slice(startIndex, endIndex);
  const showingStart = filteredRoles.length > 0 ? startIndex + 1 : 0;

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
    else if (totalPages === 0) setCurrentPage(1);
  }, [totalPages, currentPage]);

  // ── Columnas de la tabla
  const roleColumns = [
    { 
      header: "Rol", 
      field: "name", 
      width: "25%",
      render: (item) => (
        <span style={{ 
          color: '#fff', 
          fontSize: '13px', 
          fontWeight: '500',
          display: 'block',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {item.name || 'N/A'}
        </span>
      )
    },
    { 
      header: "Descripción", 
      field: "description", 
      width: "50%",
      render: (item) => (
        <span style={{ 
          color: '#fff', 
          fontSize: '13px',
          display: 'block',
          whiteSpace: 'normal', 
          wordBreak: 'break-word',
          maxHeight: '3em',
          overflow: 'hidden'
        }}>
          {item.description}
        </span>
      )
    },
    { 
      header: "Estado", 
      field: "estado",
      width: "25%",
      render: (r) => (
        <span style={{
          color: r.isActive ? "#10b981" : "#ef4444",
          fontWeight: 600,
          fontSize: "13px",
          display: 'block',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {r.isActive ? "Activo" : "Inactivo"}
        </span>
      )
    }
  ];

  // ── Handlers
  const handleView = (role) => {
    setSelectedRole(role);
    setModalMode("details");
    setIsModalOpen(true);
  };

  const handleEdit = (role) => {
    if (isAdministrador(role)) {
      showAlert('El rol "Administrador" no se puede editar', "error");
      return;
    }
    setCurrentRole({ ...role });
    setModalMode("edit");
    setFieldErrors({ name: false, permissions: false });
    setIsModalOpen(true);
  };

  const handleDelete = (role) => {
    if (isAdministrador(role)) {
      showAlert('El rol "Administrador" no se puede eliminar', "error");
      return;
    }
    if (role.isActive) {
      showAlert('No se puede eliminar un rol activo. Primero desactívelo.', "error");
      return;
    }
    setRoleToDelete(role);
    setIsConfirmOpen(true);
  };

  const handleToggleStatus = (role) => {
    if (isAdministrador(role)) {
      showAlert('El rol "Administrador" siempre está activo', "error");
      return;
    }
    setRoles((prev) =>
      prev.map((r) => (r.id === role.id ? { ...r, isActive: !r.isActive } : r))
    );
    showAlert(
      `Rol "${role.name}" ${!role.isActive ? 'activado' : 'desactivado'} correctamente`,
      !role.isActive ? 'add' : 'delete'
    );
  };

  const openModal = () => {
    setCurrentRole({ name: "", description: "", permissions: [], isActive: true });
    setModalMode("create");
    setFieldErrors({ name: false, permissions: false });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setCurrentRole({ name: "", description: "", permissions: [], isActive: true });
    setModalMode("create");
    setFieldErrors({ name: false, permissions: false });
    setIsModalOpen(false);
  };

  const handleSave = () => {
    if (!validateFields()) {
      showAlert("Complete todos los campos requeridos", "error");
      return;
    }

    const updatedData = {
      ...currentRole,
      name: currentRole.name.trim(),
      description: currentRole.description?.trim() || "",
      permissions: currentRole.permissions || [],
      isActive: Boolean(currentRole.isActive),
    };

    if (updatedData.id) {
      setRoles((prev) => prev.map((r) => (r.id === updatedData.id ? updatedData : r)));
      showAlert("Rol actualizado correctamente");
    } else {
      const newId = roles.length > 0 ? Math.max(...roles.map((r) => r.id)) + 1 : 1;
      setRoles((prev) => [...prev, { ...updatedData, id: newId }]);
      showAlert("Rol creado correctamente");
    }
    closeModal();
  };

  const confirmDelete = () => {
    const roleName = roleToDelete?.name || "Rol";
    setRoles((prev) => prev.filter((r) => r.id !== roleToDelete.id));
    setIsConfirmOpen(false);
    setRoleToDelete(null);
    showAlert(`Rol "${roleName}" eliminado correctamente`, "delete");
  };

  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleFilterSelect = (status) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  // ── Render permisos (MODIFICADO: 2 columnas, sin fondo azul)
  const renderPermissionsColumns = (permissions, readOnly = false, isAdmin = false) => {
    // Mostrar en 2 columnas siempre
    const numColumns = 2;
    const permissionsPerColumn = Math.ceil(availablePermissions.length / numColumns);
    
    return [0, 1].map((colIndex) => {
      const start = colIndex * permissionsPerColumn;
      const end = start + permissionsPerColumn;
      const columnPermissions = availablePermissions.slice(start, end);
      
      return (
        <div 
          key={colIndex} 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '6px',
            flex: 1,
          }}
        >
          {columnPermissions.map((p) => {
            const isChecked = isAdmin || (permissions || []).includes(p.id);
            
            return (
              <label
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: isChecked ? '#F5C81B' : '#94a3b8',
                  cursor: readOnly ? 'default' : 'pointer',
                  fontSize: '11px',
                  padding: '2px 4px',
                  minHeight: '20px',
                  width: '100%',
                  backgroundColor: 'transparent', // SIN FONDO AZUL
                  borderRadius: '4px',
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    if (!readOnly) {
                      const list = permissions || [];
                      const newPermissions = e.target.checked
                        ? [...list, p.id]
                        : list.filter((x) => x !== p.id);

                      setCurrentRole({ ...currentRole, permissions: newPermissions });

                      if (newPermissions.length > 0 && fieldErrors.permissions) {
                        setFieldErrors({ ...fieldErrors, permissions: false });
                      }
                    }
                  }}
                  disabled={readOnly || isAdmin}
                  style={{
                    accentColor: '#F5C81B',
                    width: '12px',
                    height: '12px',
                    cursor: readOnly || isAdmin ? 'default' : 'pointer',
                    flexShrink: 0,
                  }}
                />

                <span
                  style={{
                    color: isChecked ? '#F5C81B' : '#94a3b8',
                    fontWeight: isChecked ? '500' : '400',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    flex: 1
                  }}
                >
                  {p.label}
                </span>
              </label>
            );
          })}
        </div>
      );
    });
  };

  // ── Render modal (MODIFICADO: botones más pequeños)
  const renderModalContent = () => {
    const isView = modalMode === 'details';
    const isEdit = modalMode === 'edit';
    const isCreate = modalMode === 'create';
    const isAdmin = isView && selectedRole && isAdministrador(selectedRole);

    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '10px'
      }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 2 }}>
            <FormField 
              label="Nombre" 
              required={!isView}
              error={!isView && fieldErrors.name ? "El nombre del rol es obligatorio" : null}
              isViewMode={isView}
              viewValue={selectedRole?.name}
            >
              {!isView && (
                <input
                  type="text"
                  value={currentRole.name}
                  placeholder="Ej: Vendedor"
                  onChange={(e) => {
                    setCurrentRole({ ...currentRole, name: e.target.value });
                    if (e.target.value.trim() && fieldErrors.name) {
                      setFieldErrors({ ...fieldErrors, name: false });
                    }
                  }}
                  style={{
                    width: '100%', 
                    background: '#1e293b', 
                    color: '#fff', 
                    border: fieldErrors.name ? '1px solid #ef4444' : '1px solid #334155',
                    height: '30px', 
                    borderRadius: '4px',
                    padding: '0 6px',
                    fontSize: '12px',
                    outline: 'none'
                  }}
                />
              )}
            </FormField>
          </div>

          {isView && (
            <div style={{ flex: 1 }}>
              <FormField 
                label="Estado"
                isViewMode={isView}
                viewValue={selectedRole?.isActive ? 'Activo' : 'Inactivo'}
              />
            </div>
          )}
        </div>

        <FormField 
          label="Descripción"
          isViewMode={isView}
          viewValue={selectedRole?.description || 'Sin descripción'}
        >
          {!isView && (
            <input
              type="text"
              value={currentRole.description || ""}
              placeholder="Breve descripción"
              onChange={(e) => setCurrentRole({ ...currentRole, description: e.target.value })}
              style={{
                width: '100%', 
                background: '#1e293b', 
                color: '#fff', 
                border: '1px solid #334155',
                height: '30px', 
                borderRadius: '4px',
                padding: '0 6px',
                fontSize: '12px',
                outline: 'none'
              }}
            />
          )}
        </FormField>

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label style={{ fontSize: '12px', color: '#e2e8f0' }}>
              Permisos: {!isView && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
          </div>
          
          <div style={{
            display: 'flex',
            gap: '16px',
            backgroundColor: "#1a1a1a", // Fondo más oscuro
            border: "1px solid #333", 
            borderRadius: "4px",
            padding: "10px",
            minHeight: '120px',
            overflowY: 'auto'
          }}>
            {renderPermissionsColumns(
              isView ? selectedRole?.permissions : currentRole.permissions,
              isView,
              isAdmin
            )}
          </div>
          
          {!isView && fieldErrors.permissions && (
            <div style={{ 
              color: '#f87171', 
              fontSize: '10px', 
              marginTop: '2px',
              height: '14px',
              lineHeight: '14px',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis'
            }}>
              Debe seleccionar al menos un permiso
            </div>
          )}
          
          {isAdmin && (
            <div style={{
              marginTop: '4px',
              padding: '4px 8px',
              backgroundColor: 'rgba(245, 200, 27, 0.1)',
              border: '1px solid rgba(245, 200, 27, 0.3)',
              borderRadius: '4px',
              fontSize: '10px',
              color: '#F5C81B',
              lineHeight: '1.3',
              minHeight: '20px'
            }}>
              ⓘ El rol Administrador tiene todos los permisos del sistema.
            </div>
          )}
        </div>

        {(isCreate || isEdit) && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '8px',
            marginTop: '8px',
            paddingTop: '8px',
            borderTop: '1px solid #333'
          }}>
            <button
              onClick={closeModal}
              style={{
                background: 'transparent',
                border: '1px solid #666',
                color: '#aaa',
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '11px',
                cursor: 'pointer',
                minWidth: '70px',
                height: '28px'
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              style={{
                background: '#F5C81B',
                color: '#000',
                border: 'none',
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                minWidth: '80px',
                height: '28px'
              }}
            >
              {isCreate ? 'Guardar' : 'Actualizar'}
            </button>
          </div>
        )}
      </div>
    );
  };

  // ── Render Principal
  return (
    <>
      {alert.show && (
        <Alert 
          message={alert.message} 
          type={alert.type} 
          onClose={() => setAlert({ show: false, message: '', type: 'success' })} 
        />
      )}

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        padding: "4px 12px 0 12px",
        flex: 1,
        height: "100%",
        backgroundColor: '#000'
      }}>
        {/* ENCABEZADO */}
        <div style={{ marginBottom: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <div>
              <h1 style={{ color: "#fff", fontSize: "20px", fontWeight: "700", margin: 0, lineHeight: "1.2" }}>
                Roles
              </h1>
              <p style={{ color: "#9CA3AF", fontSize: "15px", margin: 0, lineHeight: "1.3" }}>
                Gestiona los roles y permisos del sistema
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={openModal}
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
                Registrar Rol
              </button>
            </div>
          </div>
          
          {/* Buscador y Filtro */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar por nombre o descripción..."
                onClear={clearSearch}
                fullWidth={true}
              />
            </div>
            <StatusFilter filterStatus={filterStatus} onFilterSelect={handleFilterSelect} />
          </div>
        </div>

        {/* CONTENEDOR PRINCIPAL */}
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
              entities={paginatedRoles} 
              columns={roleColumns} 
              onView={handleView} 
              onEdit={handleEdit} 
              onDelete={handleDelete}
              onAnular={handleToggleStatus}
              onReactivar={handleToggleStatus}
              idField="id"
              estadoField="isActive"
              isActiveField="isActive"
              moduleType="generic"
              showPagination={false}
              isAdministradorCheck={isAdministrador}
              hideActionsForCanceled={false}
              tableStyle={{
                width: '100%',
                borderCollapse: 'collapse',
                tableLayout: 'fixed',
              }}
              headerStyle={{
                padding: '10px 12px',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '12px',
                color: '#F5C81B',
                borderBottom: '1px solid #F5C81B',
                backgroundColor: '#151822',
                position: 'sticky',
                top: 0,
                zIndex: 1
              }}
              rowStyle={{
                borderBottom: '1px solid #333',
                backgroundColor: '#000',
                transition: 'background-color 0.2s'
              }}
              cellStyle={{
                padding: '10px 12px',
                verticalAlign: 'middle'
              }}
            />
          </div>

          {/* PAGINACIÓN */}
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
              Mostrando {showingStart}–{endIndex} de {filteredRoles.length} roles
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

      {/* MODAL - MÁS ESTRECHO, NEGRO Y BORDE AMARILLO DELGADO */}
      <UniversalModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={
          modalMode === 'create' ? 'Registrar Rol' : 
          modalMode === 'edit' ? 'Editar Rol' : 
          'Detalles del Rol'
        }
        subtitle={
          modalMode === 'create' ? 'Complete la información para registrar un nuevo rol' : 
          modalMode === 'edit' ? 'Modifique la información del rol' : 
          'Información detallada del rol'
        }
        showActions={false}
        customStyles={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          },
          content: { 
            padding: '16px',
            backgroundColor: '#000',
            border: '0.5px solid #F5C81B',
            borderRadius: '8px',
            maxWidth: '360px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            position: 'relative',
            margin: 0,
            inset: 'auto',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
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
        {renderModalContent()}
      </UniversalModal>

      <ConfirmDeleteModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        entityName="rol"
        entityData={roleToDelete}
      />
    </>
  );
};
 
export default RolesPage;