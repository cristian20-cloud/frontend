import React from "react";
import { FaEye, FaEdit, FaTrash, FaBan } from "react-icons/fa";

// ==============================================
// COMPONENTE: SWITCH PERSONALIZADO (PEQUEÑO)
// ==============================================
const CustomSwitch = ({ 
  isCurrentlyActive, 
  toggleAction, 
  toggleTitle,
  activeColor = "#10b981",   // Color verde por defecto cuando está activo
  inactiveColor = "#ef4444"  // Color rojo por defecto cuando está inactivo
}) => {
  if (!toggleAction) return null;

  return (
    <div
      style={{
        display: "inline-block",
        position: "relative",
        width: "32px",
        height: "16px",
        cursor: "pointer",
        borderRadius: "8px",
        backgroundColor: isCurrentlyActive ? activeColor : inactiveColor,
        transition: "background-color 0.3s ease",
        boxShadow: "inset 0 0 2px rgba(0,0,0,0.5)",
        border: "1px solid #333",
      }}
      onClick={toggleAction}
      title={toggleTitle}
    >
      <div
        style={{
          position: "absolute",
          top: "1px",
          left: isCurrentlyActive ? "15px" : "1px",
          width: "14px",
          height: "14px",
          borderRadius: "50%",
          backgroundColor: "#fff",
          transition: "left 0.3s ease",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }}
      />
    </div>
  );
};

// ==============================================
// COMPONENTE PRINCIPAL: TABLA DE ENTIDADES
// ==============================================
const EntityTable = ({
  entities = [],
  columns = [],
  idField = "id",
  onView,
  onEdit,
  onDelete,
  onAnular,
  onReactivar,
  estadoField = "estado",
  moduleType = "generic",
  hideActionsForCanceled = false,
  isAdministradorCheck = null,
  isActiveField,
  switchProps = {},
}) => {
  const getEstadoField = () => {
    return estadoField || isActiveField || "estado";
  };

  const isAnulada = (row) => {
    const fieldName = getEstadoField();
    const estado = row[fieldName];

    if (typeof estado === "boolean") return !estado;
    if (typeof estado === "number") return estado === 0;

    if (moduleType === "ventas") return estado === "Anulada" || estado === "Cancelada";
    if (moduleType === "compras") return estado === "Anulada";
    
    if (moduleType === "generic") {
      return (
        estado === "Anulada" ||
        estado === "Cancelada" ||
        estado === "Inactivo" ||
        estado === "Inactiva" ||
        estado === "inactivo" ||
        estado === "deshabilitado" ||
        estado === "Deshabilitado" ||
        estado === "desactivado"
      );
    }

    return estado === "Anulada" || estado === "Cancelada" || estado === "Inactivo";
  };

  const isAdministrador = (row) =>
    isAdministradorCheck ? isAdministradorCheck(row) : false;

  return (
    <div style={{ width: "100%", marginTop: "8px" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#000",
          color: "#fff",
          fontSize: "13px",
          tableLayout: "fixed",
        }}
      >
        <thead>
          <tr style={{ borderBottom: "1px solid #F5C81B", height: "40px" }}>
            {columns.map((col, i) => (
              <th
                key={i}
                style={{
                  padding: "8px 10px",
                  color: "#F5C81B",
                  fontWeight: 600,
                  textAlign: "left",
                }}
              >
                {col.header}
              </th>
            ))}
            <th
              style={{
                padding: "8px 10px",
                color: "#F5C81B",
                fontWeight: 600,
                textAlign: "right",
                width: "160px",
              }}
            >
              Acciones
            </th>
          </tr>
        </thead>

        <tbody>
          {entities.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + 1}
                style={{
                  padding: "40px 10px",
                  textAlign: "center",
                  color: "#888",
                  fontStyle: "italic",
                }}
              >
                No hay datos para mostrar
              </td>
            </tr>
          ) : (
            entities.map((row, rowIndex) => {
              const isCurrentlyActive =
                row[getEstadoField()] === true ||
                row[getEstadoField()] === 1 ||
                row[getEstadoField()] === "Activo" ||
                row[getEstadoField()] === "Completada";
              
              const esAnulada = isAnulada(row);
              const admin = isAdministrador(row);
              const showSwitch = moduleType !== "ventas" && moduleType !== "compras";
              const toggleAction = showSwitch ? (isCurrentlyActive ? onAnular : onReactivar) : null;

              return (
                <tr
                  key={row[idField] || rowIndex}
                  style={{
                    borderBottom: "1px solid #222",
                    height: "46px",
                    backgroundColor: "transparent",
                  }}
                >
                  {columns.map((col, colIndex) => {
                    let content;

                    if (typeof col.render === "function") {
                      content = col.render(row);
                    } else {
                      const value = row?.[col.field];

                      if (
                        value !== null &&
                        typeof value === "object" &&
                        !Array.isArray(value)
                      ) {
                        content = value.nombre ?? value.label ?? "-";
                      } else if (Array.isArray(value)) {
                        content = value.join(", ");
                      } else {
                        content = value ?? "-";
                      }
                    }

                    return (
                      <td
                        key={`${col.field}-${colIndex}`}
                        style={{
                          padding: "8px 10px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: col.maxWidth || "180px",
                          color: "#fff",
                          textAlign: col.align || "left",
                        }}
                        title={typeof content === "string" ? content : ""}
                      >
                        {content}
                      </td>
                    );
                  })}

                  <td
                    style={{
                      padding: "8px 10px",
                      textAlign: "right",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        minHeight: "26px",
                      }}
                    >
                      {admin ? (
                        // SOLO MUESTRA EL OJO PARA ADMINISTRADORES
                        <>
                          {onView && (
                            <FaEye
                              size={18}
                              color={"#F5C81B"}
                              style={{ cursor: "pointer", opacity: 1 }}
                              onClick={() => onView(row)}
                              title="Ver detalles"
                            />
                          )}
                          
                        </>
                      ) : (
                        // USUARIO NO ADMINISTRADOR - TODAS LAS ACCIONES
                        <>
                          {/* PRIMERO EL TOGGLE (SWITCH) */}
                          {showSwitch && toggleAction && (
                            <CustomSwitch
                              isCurrentlyActive={isCurrentlyActive}
                              toggleAction={() => toggleAction(row)}
                              toggleTitle={isCurrentlyActive ? "Desactivar" : "Reactivar"}
                              activeColor={switchProps.activeColor}   // Usar color activo desde props
                              inactiveColor={switchProps.inactiveColor} // Usar color inactivo desde props
                            />
                          )}

                          {/* LUEGO EL BOTÓN DE VER (OJO) */}
                          {onView && (
                            <FaEye
                              size={18}
                              color={"#F5C81B"}
                              style={{ cursor: "pointer", opacity: 1 }}
                              onClick={() => onView(row)}
                              title="Ver detalles"
                            />
                          )}

                          {/* BOTÓN EDITAR - SOLO SI NO ES VENTAS NI COMPRAS */}
                          {onEdit && moduleType !== "ventas" && moduleType !== "compras" && (
                            <FaEdit
                              size={18}
                              color={"#F5C81B"}
                              style={{ cursor: "pointer", opacity: 1 }}
                              onClick={() => onEdit(row)}
                              title="Editar"
                            />
                          )}

                          {/* BOTÓN DE ANULAR SOLO PARA VENTAS/COMPRAS */}
                          {onAnular && (moduleType === "ventas" || moduleType === "compras") && (
                            <FaBan
                              size={18}
                              color={"#F5C81B"}
                              style={{ cursor: "pointer", opacity: 1 }}
                              onClick={() => onAnular(row)}
                              title="Anular"
                            />
                          )}

                          {/* BOTÓN DE ELIMINAR */}
                          {onDelete && moduleType !== "ventas" && moduleType !== "compras" && (
                            <FaTrash
                              size={18}
                              color={"#F5C81B"}
                              style={{ cursor: "pointer", opacity: 1 }}
                              onClick={() => onDelete(row)}
                              title="Eliminar"
                            />
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EntityTable;