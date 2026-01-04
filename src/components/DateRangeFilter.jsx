import React from "react";
import { FaCalendarAlt } from "react-icons/fa";

const DateRangeFilter = ({
  selectedMonth,
  selectedYear,
  handleMonthChange,
  handleYearChange,
  isCompact = false,
}) => {
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];

  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear - 5; y <= currentYear + 1; y++) {
    years.push(y);
  }

  return (
    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
      <FaCalendarAlt color="#F5C81B" size={14} />

      <select
        value={selectedMonth}
        onChange={(e) => handleMonthChange(Number(e.target.value))}
        style={{
          background: "#1e293b",
          color: "#fff",
          border: "1px solid #334155",
          borderRadius: "4px",
          fontSize: isCompact ? "12px" : "14px",
          padding: "2px 6px",
        }}
      >
        {months.map((m, i) => (
          <option key={i} value={i + 1}>
            {m}
          </option>
        ))}
      </select>

      <select
        value={selectedYear}
        onChange={(e) => handleYearChange(Number(e.target.value))}
        style={{
          background: "#1e293b",
          color: "#fff",
          border: "1px solid #334155",
          borderRadius: "4px",
          fontSize: isCompact ? "12px" : "14px",
          padding: "2px 6px",
        }}
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DateRangeFilter;
