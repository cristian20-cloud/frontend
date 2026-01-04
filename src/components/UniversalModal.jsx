import React, { useEffect } from "react";

const UniversalModal = ({
  isOpen,
  onClose,
  title = "Detalles",
  subtitle = "Información detallada",
  children,
  showActions = false,
  onCancel,
  onConfirm,
  onSave,
  confirmText = "Guardar",
  actionLabel,
  customStyles = {}
}) => {
  if (!isOpen) return null;

  const handleConfirm = onSave || onConfirm || (() => {});
  const handleCancel = onCancel || onClose || (() => {});

  const modalContentStyle = customStyles.content || {};
  const modalOverlayStyle = customStyles.overlay || {};
  const modalHeaderStyle = customStyles.header || {};

  /* ============================
     CERRAR CON ESC
  ============================ */
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    /* ============================
       OVERLAY (NO ROBA FOCO)
    ============================ */
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999999,
        padding: "16px",
        ...modalOverlayStyle
      }}
    >
      {/* ============================
          CONTENEDOR MODAL
      ============================ */}
      <div
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        style={{
          backgroundColor: "#000",
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
          width: "min(95%, 390px)",
          maxHeight: "90vh",
          minHeight: "480px",
          padding: "16px",
          position: "relative",
          border: "1px solid rgba(255,215,0,0.25)",
          display: "flex",
          flexDirection: "column",
          ...modalContentStyle
        }}
      >
        {/* BOTÓN CERRAR */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            background: "none",
            border: "none",
            color: "#94a3b8",
            fontSize: "1.3rem",
            cursor: "pointer",
            width: "26px",
            height: "26px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          ×
        </button>

        {/* HEADER */}
        <div
          style={{
            marginBottom: "6px",
            paddingRight: "28px",
            paddingTop: "10px",
            ...modalHeaderStyle
          }}
        >
          <h2
            style={{
              color: "#F5C81B",
              fontSize: "1.3rem",
              fontWeight: 700,
              marginBottom: "4px"
            }}
          >
            {title}
          </h2>

          {subtitle && (
            <p style={{ color: "#aaa", fontSize: "0.8rem", margin: 0 }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* CONTENIDO */}
        <div style={{ flex: 1, overflowY: "auto", paddingRight: "4px" }}>
          {children}
        </div>

        {/* FOOTER */}
        {showActions && (
          <div
            style={{
              marginTop: "12px",
              paddingTop: "10px",
              borderTop: "1px solid rgba(255,255,255,0.15)",
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px"
            }}
          >
            <button
              type="button"
              onClick={handleCancel}
              style={{
                padding: "8px 16px",
                fontSize: "13px",
                borderRadius: "6px",
                background: "transparent",
                border: "1px solid #94a3b8",
                color: "#94a3b8",
                cursor: "pointer"
              }}
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              style={{
                padding: "8px 16px",
                fontSize: "13px",
                borderRadius: "6px",
                background: "#F5C81B",
                border: "none",
                color: "#000",
                cursor: "pointer",
                fontWeight: 600
              }}
            >
              {actionLabel || confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversalModal;
