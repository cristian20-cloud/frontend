import React, { useRef } from "react";
import { FaCalendarAlt } from "react-icons/fa";

const DateInputWithCalendar = ({ value, onChange, error }) => {
  const hiddenDateRef = useRef(null);

  const openCalendar = () => {
    // Intenta usar showPicker (mejor UX en navegadores modernos),
    // si no existe, usa click() como fallback para abrir el calendario.
    if (hiddenDateRef.current?.showPicker) {
      hiddenDateRef.current.showPicker(); // Chrome / Edge
    } else {
      hiddenDateRef.current?.click(); // fallback
    }
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* INPUT VISUAL */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: "30px",
          backgroundColor: "#1e293b",
          border: `1px solid ${error ? "#ef4444" : "#334155"}`,
          borderRadius: "4px",
          padding: "0 10px",
          gap: "8px",
        }}
      >
        <input
          type="text"
          value={value || ""}
          placeholder="DD/MM/AAAA"
          readOnly
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#fff",
            fontSize: "12px",
            height: "100%",
          }}
        />

        {/* ICONO - Al hacer click, llama a openCalendar */}
        <FaCalendarAlt
          onClick={openCalendar}
          style={{
            cursor: "pointer",
            color: "#F5C81B",
            fontSize: "12px",
          }}
        />
      </div>

      {/* INPUT REAL (OCULTO) */}
      <input
        ref={hiddenDateRef}
        type="date"
        onChange={(e) => {
          if (!e.target.value) return;
          // Convierte el formato YYYY-MM-DD (del input type="date") a DD/MM/AAAA
          const [year, month, day] = e.target.value.split("-");
          onChange(`${day}/${month}/${year}`);
        }}
        style={{
          position: "absolute",
          opacity: 0,
          // FIX APLICADO: Se eliminó pointerEvents: "none"
          height: 0,
          width: 0,
        }}
      />
    </div>
  );
};

export default DateInputWithCalendar;