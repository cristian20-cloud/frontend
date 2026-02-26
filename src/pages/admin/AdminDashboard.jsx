// src/pages/admin/AdminDashboard.jsx
import React, { useMemo, useState, useEffect } from "react";
import DateInputWithCalendar from "../../components/DateInputWithCalendar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { FaCalendarAlt } from "react-icons/fa";
import { initialSales, initialOrders, initialCustomers } from "../../data";

// ======================================================
// HELPERS
// ======================================================
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  const [day, month, year] = dateStr.split("/");
  return new Date(year, month - 1, day);
};
const formatCurrency = (amount) => {
  return `$${Number(amount || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}`;
};
const getMonthName = (monthNumber) => {
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return months[monthNumber - 1] || monthNumber;
};

const getAvailableYears = (salesData, ordersData) => {
  const yearsSet = new Set();
  const currentYear = new Date().getFullYear();
  yearsSet.add(currentYear);
  salesData?.forEach(sale => {
    if (sale.fecha) {
      try {
        const date = parseDate(sale.fecha);
        if (date && !isNaN(date.getTime())) {
          yearsSet.add(date.getFullYear());
        }
      } catch {
        // Ignorar errores de parseo de fechas
      }
    }
  });
  ordersData?.forEach(order => {
    if (order.Fecha) {
      try {
        const date = new Date(order.Fecha);
        if (!isNaN(date.getTime())) {
          yearsSet.add(date.getFullYear());
        }
      } catch {
        // Ignorar errores de parseo de fechas
      }
    }
  });
  for (let i = currentYear - 5; i <= currentYear + 2; i++) {
    yearsSet.add(i);
  }
  return Array.from(yearsSet)
    .sort((a, b) => b - a)
    .map(year => year.toString());
};

const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
const CUSTOMER_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FF9FF3', '#FECA57', '#48DBFB', '#1DD1A1'];

// ======================================================
// COMPONENT - DASHBOARD MÁS COMPACTO Y DELGADO
// ======================================================
const AdminDashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [availableYears, setAvailableYears] = useState([]);
  const [productSearch, setProductSearch] = useState("");

  // ✅ FUNCIÓN DE REINICIO DE FILTROS — CORREGIDA
  const resetFilters = () => {
    setSelectedMonth("");
    if (availableYears.length > 0) {
      setSelectedYear(availableYears[0]);
    } else {
      setSelectedYear(new Date().getFullYear().toString());
    }
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
    setProductSearch("");
  };

  useEffect(() => {
    const years = getAvailableYears(initialSales, initialOrders);
    setAvailableYears(years);
    if (years.length > 0 && !years.includes(selectedYear)) {
      setSelectedYear(years[0]);
    }
  }, [selectedYear]);

  // ======================================================
  // FILTRO POR FECHA, MES/AÑO Y BÚSQUEDA
  // ======================================================
  const filteredSales = useMemo(() => {
    let filtered = initialSales || [];
    if (startDate || endDate) {
      filtered = filtered.filter((sale) => {
        if (!sale.fecha) return false;
        const saleDate = parseDate(sale.fecha);
        if (!saleDate) return false;
        const start = startDate ? parseDate(startDate) : null;
        const end = endDate ? parseDate(endDate) : null;
        const afterStart = !start || saleDate >= start;
        const beforeEnd = !end || saleDate <= end;
        return afterStart && beforeEnd;
      });
    }
    if (selectedMonth || selectedYear) {
      filtered = filtered.filter((sale) => {
        if (!sale.fecha) return false;
        const date = parseDate(sale.fecha);
        if (!date) return false;
        const yearMatch = !selectedYear || date.getFullYear().toString() === selectedYear;
        const monthMatch = !selectedMonth || (date.getMonth() + 1).toString() === selectedMonth;
        return yearMatch && monthMatch;
      });
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((sale) => {
        return (
          (sale.cliente?.nombre?.toLowerCase().includes(term)) ||
          (sale.id?.toString().includes(term)) ||
          (sale.producto?.toLowerCase().includes(term)) ||
          (sale.estado?.toLowerCase().includes(term))
        );
      });
    }
    return filtered;
  }, [selectedMonth, selectedYear, startDate, endDate, searchTerm]);

  const filteredOrders = useMemo(() => {
    let filtered = initialOrders || [];
    if (startDate || endDate) {
      filtered = filtered.filter((order) => {
        if (!order.Fecha) return false;
        const orderDate = new Date(order.Fecha);
        if (isNaN(orderDate.getTime())) return false;
        const start = startDate ? parseDate(startDate) : null;
        const end = endDate ? parseDate(endDate) : null;
        const afterStart = !start || orderDate >= start;
        const beforeEnd = !end || orderDate <= end;
        return afterStart && beforeEnd;
      });
    }
    if (selectedMonth || selectedYear) {
      filtered = filtered.filter((order) => {
        if (!order.Fecha) return false;
        const date = new Date(order.Fecha);
        const yearMatch = !selectedYear || date.getFullYear().toString() === selectedYear;
        const monthMatch = !selectedMonth || (date.getMonth() + 1).toString() === selectedMonth;
        return yearMatch && monthMatch;
      });
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((order) => {
        return (
          (order.proveedor?.toLowerCase().includes(term)) ||
          (order.IdCompra?.toString().includes(term)) ||
          (order.estado?.toLowerCase().includes(term))
        );
      });
    }
    return filtered;
  }, [selectedMonth, selectedYear, startDate, endDate, searchTerm]);

  const filteredCustomers = useMemo(() => {
    let filtered = initialCustomers || [];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((customer) => {
        return (
          (customer.Nombre?.toLowerCase().includes(term)) ||
          (customer.Correo?.toLowerCase().includes(term)) ||
          (customer.Telefono?.includes(term)) ||
          (customer.Empresa?.toLowerCase().includes(term))
        );
      });
    }
    return filtered;
  }, [searchTerm]);

  // ======================================================
  // KPIs SIMPLES
  // ======================================================
  const totalSales = useMemo(() => {
    return filteredSales
      .filter((s) => s.estado === "Completada" && s.isActive)
      .reduce((acc, s) => acc + s.total, 0);
  }, [filteredSales]);

  const totalOrders = useMemo(() => {
    return filteredOrders
      .filter((o) => o.estado === "Activo" && o.isActive)
      .reduce((acc, o) => acc + o.Total, 0);
  }, [filteredOrders]);

  const totalCustomers = useMemo(() => {
    return filteredCustomers.filter(c => c.Estado).length;
  }, [filteredCustomers]);

  // ======================================================
  // CLIENTES MÁS FRECUENTES
  // ======================================================
  const topCustomersData = useMemo(() => {
    const customerPurchases = {};
    filteredSales.forEach(sale => {
      if (sale.estado !== "Completada" || !sale.isActive || !sale.cliente?.nombre) return;
      const customerName = sale.cliente.nombre;
      if (!customerPurchases[customerName]) {
        customerPurchases[customerName] = {
          nombre: customerName,
          compras: 0,
          totalGastado: 0,
          ultimaCompra: sale.fecha
        };
      }
      customerPurchases[customerName].compras += 1;
      customerPurchases[customerName].totalGastado += sale.total;
      const currentDate = parseDate(sale.fecha);
      const lastDate = parseDate(customerPurchases[customerName].ultimaCompra);
      if (currentDate > lastDate) {
        customerPurchases[customerName].ultimaCompra = sale.fecha;
      }
    });
    const completedSalesCount = filteredSales.filter(s => s.estado === "Completada" && s.isActive).length;
    return Object.values(customerPurchases)
      .sort((a, b) => b.compras - a.compras)
      .slice(0, 5)
      .map((customer, index) => ({
        ...customer,
        porcentaje: Math.round((customer.compras / completedSalesCount) * 100) || 0,
        color: CUSTOMER_COLORS[index % CUSTOMER_COLORS.length]
      }));
  }, [filteredSales]);

  // ======================================================
  // VENTAS POR MES
  // ======================================================
  const salesByMonth = useMemo(() => {
    const map = {};
    const salesToUse = searchTerm.trim() ? filteredSales : initialSales || [];
    salesToUse.forEach((sale) => {
      if (sale.estado !== "Completada" || !sale.isActive) return;
      const date = parseDate(sale.fecha);
      if (!date) return;
      if (selectedYear && date.getFullYear().toString() !== selectedYear) return;
      const key = `${date.getMonth() + 1}`;
      map[key] = (map[key] || 0) + sale.total;
    });
    return Array.from({ length: 12 }, (_, i) => {
      const monthNumber = i + 1;
      return {
        month: getMonthName(monthNumber),
        total: map[monthNumber] || 0,
      };
    });
  }, [filteredSales, selectedYear, searchTerm]);

  const purchasesByMonth = useMemo(() => {
    const map = {};
    const ordersToUse = searchTerm.trim() ? filteredOrders : initialOrders || [];
    ordersToUse.forEach((order) => {
      if (order.estado !== "Activo" || !order.isActive) return;
      const date = new Date(order.Fecha);
      if (selectedYear && date.getFullYear().toString() !== selectedYear) return;
      const key = `${date.getMonth() + 1}`;
      map[key] = (map[key] || 0) + order.Total;
    });
    return Array.from({ length: 12 }, (_, i) => {
      const monthNumber = i + 1;
      return {
        month: getMonthName(monthNumber),
        total: map[monthNumber] || 0,
      };
    });
  }, [filteredOrders, selectedYear, searchTerm]);

  // ======================================================
  // PRODUCTOS MÁS VENDIDOS
  // ======================================================
  const getAllTopProducts = useMemo(() => {
    const productSales = {};
    filteredSales.forEach(sale => {
      if (sale.estado !== "Completada" || !sale.isActive) return;
      if (sale.productos && Array.isArray(sale.productos)) {
        sale.productos.forEach(producto => {
          const productName = producto.nombre;
          const productTotal = producto.cantidad * producto.precio;
          if (!productSales[productName]) {
            productSales[productName] = { total: 0, cantidad: 0 };
          }
          productSales[productName].total += productTotal;
          productSales[productName].cantidad += producto.cantidad;
        });
      } else if (sale.producto) {
        const productName = sale.producto;
        const productTotal = sale.total;
        if (!productSales[productName]) {
          productSales[productName] = { total: 0, cantidad: 1 };
        } else {
          productSales[productName].total += productTotal;
          productSales[productName].cantidad += 1;
        }
      }
    });
    const sortedProducts = Object.entries(productSales)
      .map(([nombre, datos]) => ({ 
        nombre, 
        total: datos.total, 
        cantidad: datos.cantidad,
        porcentaje: 0 
      }))
      .sort((a, b) => b.total - a.total);
    const totalVentas = sortedProducts.reduce((sum, item) => sum + item.total, 0);
    sortedProducts.forEach(item => {
      item.porcentaje = totalVentas > 0 ? Math.round((item.total / totalVentas) * 100) : 0;
    });
    return sortedProducts;
  }, [filteredSales]);

  const pieChartProductsData = useMemo(() => {
    let filtered = getAllTopProducts;
    if (productSearch.trim()) {
      const term = productSearch.toLowerCase().trim();
      filtered = filtered.filter(product => 
        product.nombre.toLowerCase().includes(term)
      );
    }
    const topProducts = filtered.slice(0, 5);
    if (topProducts.length === 0 && !productSearch) {
      return [
        { nombre: "Producto 1 (Ejemplo)", total: 170000, cantidad: 2, porcentaje: 25 },
        { nombre: "Producto 2 (Ejemplo)", total: 95000, cantidad: 1, porcentaje: 19 },
      ];
    }
    const totalVentasFiltradas = topProducts.reduce((sum, item) => sum + item.total, 0);
    topProducts.forEach(item => {
      item.porcentaje = totalVentasFiltradas > 0 ? Math.round((item.total / totalVentasFiltradas) * 100) : 0;
    });
    return topProducts;
  }, [getAllTopProducts, productSearch]);

  // ======================================================
  // RENDER
  // ======================================================
  return (
    <div className="admin-dashboard-slim">
      <style>{`
        .admin-dashboard-slim {
          min-height: 100vh;
          color: white;
          padding: 0.5rem;
        }
        .top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-radius: 0.375rem;
          padding: 0.75rem;
          margin-bottom: 0.75rem;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .title-and-filters {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          flex: 1;
        }
        .dashboard-title-section {
          display: flex;
          flex-direction: column;
          min-width: 150px;
        }
        .dashboard-title {
          font-size: 1rem;
          font-weight: 600;
          color: #ffffff;
          margin: 0;
          margin-bottom: 0.125rem;
        }
        .dashboard-subtitle {
          font-size: 0.65rem;
          color: #94a3b8;
          margin: 0;
        }
        .inline-filters {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .filter-group {
          display: flex;
          flex-direction: column;
          min-width: 100px;
        }
        .filter-label {
          font-size: 0.65rem;
          color: #cbd5e1;
          margin-bottom: 0.125rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .filter-select {
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 0.25rem;
          padding: 0.375rem 0.5rem;
          color: white;
          font-size: 0.75rem;
          outline: none;
          width: 100%;
          transition: all 0.2s;
        }
        .filter-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.5);
        }
        .date-filter-group {
          display: flex;
          flex-direction: column;
          min-width: 120px;
        }
        .date-range-container {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        .date-separator {
          color: #94a3b8;
          font-size: 0.7rem;
        }
        .reset-btn {
          background: #1e293b;
          border: 1px solid #475569;
          border-radius: 0.25rem;
          padding: 0.375rem 0.75rem;
          color: #94a3b8;
          font-size: 0.65rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          margin-top: 1rem;
        }
        .reset-btn:hover {
          background: #334155;
          color: #ffffff;
        }
        .search-container {
          min-width: 200px;
          display: flex;
          gap: 0.5rem;
        }
        .search-input {
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 0.25rem;
          padding: 0.375rem 0.75rem;
          color: white;
          font-size: 0.75rem;
          outline: none;
          width: 100%;
          transition: all 0.2s;
        }
        .search-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.5);
        }
        .search-input::placeholder {
          color: #64748b;
        }
        .search-info {
          font-size: 0.6rem;
          color: #94a3b8;
          margin-top: 0.25rem;
          display: block;
        }
        .dashboard-content {
          padding: 1rem;
        }
        .kpis-grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        @media (min-width: 768px) {
          .kpis-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        .kpi-card {
          background: #0f172a;
          border-radius: 0.375rem;
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          transition: all 0.3s;
          border: 1px solid transparent;
        }
        .kpi-card:hover {
          border-color: #334155;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        .kpi-card-sales {
          border-top: 2px solid #fbbf24;
        }
        .kpi-card-purchases {
          border-top: 2px solid #3b82f6;
        }
        .kpi-card-customers {
          border-top: 2px solid #22c55e;
        }
        .kpi-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }
        .kpi-title {
          color: #cbd5e1;
          font-size: 0.65rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .kpi-icon {
          font-size: 1rem;
          opacity: 0.9;
        }
        .kpi-value {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
          line-height: 1.2;
        }
        .kpi-value-sales {
          color: #fbbf24;
        }
        .kpi-value-purchases {
          color: #3b82f6;
        }
        .kpi-value-customers {
          color: #22c55e;
        }
        .kpi-info {
          color: #94a3b8;
          font-size: 0.65rem;
          line-height: 1.3;
        }
        .kpi-filtered-count {
          color: #3b82f6;
          font-weight: 500;
        }
        .charts-grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 1rem;
          margin-bottom: 1rem;
        }
        @media (min-width: 1024px) {
          .charts-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .chart-container {
          background: #0f172a;
          border-radius: 0.375rem;
          padding: 0.75rem;
          border: 1px solid #334155;
          min-height: 250px;
          display: flex;
          flex-direction: column;
        }
        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        .chart-title {
          font-size: 0.75rem;
          font-weight: 600;
          color: #ffffff;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .chart-title-sales {
          color: #fbbf24;
        }
        .chart-title-purchases {
          color: #3b82f6;
        }
        .chart-title-customers {
          color: #22c55e;
        }
        .chart-wrapper {
          flex: 1;
          min-height: 200px;
        }
        .pie-chart-container {
          background: #0f172a;
          border-radius: 0.375rem;
          padding: 0.75rem;
          border: 1px solid #334155;
          margin-bottom: 1rem;
        }
        .pie-chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .pie-chart-title-section {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .pie-chart-title {
          font-size: 0.75rem;
          font-weight: 600;
          color: #ffffff;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .pie-chart-title span {
          color: #fbbf24;
        }
        .pie-chart-count {
          font-size: 0.65rem;
          color: #94a3b8;
        }
        .product-search-container {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          min-width: 250px;
        }
        .product-search-input {
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 0.25rem;
          padding: 0.375rem 0.75rem;
          color: white;
          font-size: 0.7rem;
          outline: none;
          width: 100%;
          transition: all 0.2s;
        }
        .product-search-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.5);
        }
        .product-search-input::placeholder {
          color: #64748b;
          font-size: 0.65rem;
        }
        .clear-product-search {
          background: #1e293b;
          border: 1px solid #475569;
          border-radius: 0.25rem;
          padding: 0.375rem 0.5rem;
          color: #94a3b8;
          font-size: 0.65rem;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .clear-product-search:hover {
          background: #334155;
          color: #ffffff;
        }
        .product-search-info {
          font-size: 0.6rem;
          color: #94a3b8;
          margin-top: 0.25rem;
        }
        .pie-chart-content {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          gap: 1rem;
        }
        @media (min-width: 768px) {
          .pie-chart-content {
            flex-direction: row;
            align-items: center;
          }
        }
        .pie-chart-wrapper {
          flex: 1;
          min-height: 250px;
          width: 100%;
          height: 250px;
        }
        .pie-chart-stats {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          min-width: 200px;
        }
        .pie-stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: #1e293b;
          border-radius: 0.25rem;
          border-left: 3px solid;
        }
        .pie-stat-customer {
          font-size: 0.7rem;
          font-weight: 500;
          color: #ffffff;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .pie-stat-details {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }
        .pie-stat-purchases {
          font-size: 0.75rem;
          font-weight: 600;
          color: #22c55e;
        }
        .pie-stat-percentage {
          font-size: 0.65rem;
          color: #94a3b8;
          background: #334155;
          padding: 0.125rem 0.375rem;
          border-radius: 0.75rem;
          min-width: 40px;
          text-align: center;
        }
        .customer-chart-container {
          background: #0f172a;
          border-radius: 0.375rem;
          padding: 0.75rem;
          border: 1px solid #334155;
          margin-bottom: 1rem;
        }
        .customer-stats-grid {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }
        .customer-stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: #1e293b;
          border-radius: 0.25rem;
          border-left: 3px solid;
        }
        .customer-stat-name {
          font-size: 0.7rem;
          font-weight: 500;
          color: #ffffff;
          flex: 1;
        }
        .customer-stat-details {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        .customer-stat-count {
          font-size: 0.75rem;
          font-weight: 600;
          color: #F5C81B;
        }
        .customer-stat-total {
          font-size: 0.7rem;
          color: #4ECDC4;
        }
        .customer-stat-percentage {
          font-size: 0.65rem;
          color: #94a3b8;
          background: #334155;
          padding: 0.125rem 0.375rem;
          border-radius: 0.75rem;
          min-width: 40px;
          text-align: center;
        }
        .pie-chart-summary {
          padding-top: 0.5rem;
          border-top: 1px solid #334155;
          display: flex;
          justify-content: space-between;
          color: #94a3b8;
          font-size: 0.65rem;
          margin-top: 0.5rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 0.75rem;
        }
        @media (min-width: 768px) {
          .summary-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        .summary-card {
          background: #0f172a;
          border-radius: 0.375rem;
          padding: 0.5rem;
          text-align: center;
          border: 1px solid #334155;
        }
        .summary-title {
          font-size: 0.65rem;
          color: #94a3b8;
          margin-bottom: 0.25rem;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }
        .summary-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: #ffffff;
        }
        .empty-state {
          text-align: center;
          padding: 2rem;
          color: #94a3b8;
          font-size: 0.75rem;
          width: 100%;
        }
        .empty-state-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          opacity: 0.5;
        }
      `}</style>

      {/* ================= FILA SUPERIOR: FILTROS Y BUSCADOR ================= */}
      <div className="top-row">
        <div className="title-and-filters">
          <div className="dashboard-title-section">
            <h1 className="dashboard-title">Panel de Administración</h1>
            <p className="dashboard-subtitle">Ventas, Compras y Clientes</p>
            <button onClick={resetFilters} className="reset-btn">
              <span>↺</span> Reiniciar filtros
            </button>
          </div>
          <div className="inline-filters">
            <div className="filter-group">
              <div className="filter-label">
                <FaCalendarAlt size={10} /> Año
              </div>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="filter-select"
              >
                <option value="">Todos los años</option>
                {availableYears.map(year => (
                  <option key={`year-${year}`} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <div className="filter-label">
                <FaCalendarAlt size={10} /> Mes
              </div>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="filter-select"
              >
                <option value="">Todos los meses</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month, index) => (
                  <option key={`month-${index}-${month}`} value={month}>
                    {getMonthName(month)}
                  </option>
                ))}
              </select>
            </div>
            <div className="date-filter-group">
              <div className="filter-label">
                <FaCalendarAlt size={10} /> Rango de Fechas
              </div>
              <div className="date-range-container">
                <DateInputWithCalendar
                  value={startDate}
                  onChange={setStartDate}
                  error={false}
                />
                <span className="date-separator">-</span>
                <DateInputWithCalendar
                  value={endDate}
                  onChange={setEndDate}
                  error={false}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="search-container">
          <div style={{ flex: 1 }}>
            <input
              type="text"
              placeholder="Buscar cliente, venta, producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <span className="search-info">
                Buscando: &quot;{searchTerm}&quot;
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ================= FILA INFERIOR: TODO EL CONTENIDO ================= */}
      <div className="dashboard-content">
        {/* KPIs */}
        <div className="kpis-grid">
          <div className="kpi-card kpi-card-sales">
            <div className="kpi-header">
              <div className="kpi-title">
                Ventas Totales 
                {searchTerm && <span className="kpi-filtered-count"> (Filtrado)</span>}
              </div>
              <div className="kpi-value kpi-value-sales">
                {formatCurrency(totalSales)}
              </div>
              <div className="kpi-info">
                {filteredSales.filter(s => s.estado === "Completada" && s.isActive).length} ventas
                {searchTerm && ` que coinciden con &quot;${searchTerm}&quot;`}
              </div>
            </div>
          </div>
          <div className="kpi-card kpi-card-purchases">
            <div className="kpi-header">
              <div className="kpi-title">
                Compras Totales
                {searchTerm && <span className="kpi-filtered-count"> (Filtrado)</span>}
              </div>
              <div className="kpi-icon">📦</div>
            </div>
            <div className="kpi-value kpi-value-purchases">
              {formatCurrency(totalOrders)}
            </div>
            <div className="kpi-info">
              {filteredOrders.filter(o => o.estado === "Activo" && o.isActive).length} compras
              {searchTerm && ` que coinciden con &quot;${searchTerm}&quot;`}
            </div>
          </div>
          <div className="kpi-card kpi-card-customers">
            <div className="kpi-header">
              <div className="kpi-title">
                Clientes Activos
                {searchTerm && <span className="kpi-filtered-count"> (Filtrado)</span>}
              </div>
              <div className="kpi-icon">👥</div>
            </div>
            <div className="kpi-value kpi-value-customers">
              {totalCustomers}
            </div>
            <div className="kpi-info">
              {pieChartProductsData.length} productos top
              {searchTerm && ` en los resultados`}
            </div>
          </div>
        </div>

        {/* Gráficas de Barras */}
        <div className="charts-grid">
          <div className="chart-container">
            <div className="chart-header">
              <h3 className="chart-title chart-title-sales">
                <FaCalendarAlt size={12} /> Ventas Mensuales
              </h3>
              {(selectedYear || searchTerm || startDate || endDate) && (
                <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                  {selectedYear ? `Año: ${selectedYear}` : ''} 
                  {selectedYear && (searchTerm || startDate || endDate) ? ' | ' : ''}
                  {searchTerm ? `Búsqueda: &quot;${searchTerm}&quot;` : ''}
                  {(searchTerm && (startDate || endDate)) ? ' | ' : ''}
                  {startDate || endDate ? `Fechas: ${startDate || 'Inicio'} - ${endDate || 'Fin'}` : ''}
                </span>
              )}
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: "#cbd5e1", fontSize: 8 }}
                    stroke="#475569"
                  />
                  <YAxis 
                    tick={{ fill: "#cbd5e1", fontSize: 8 }}
                    stroke="#475569"
                    tickFormatter={(value) => `$${value/1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #fbbf24",
                      borderRadius: "0.25rem",
                      color: "#f1f5f9",
                      fontSize: "0.65rem",
                    }}
                    formatter={(value) => [formatCurrency(value), "Ventas"]}
                  />
                  <Bar 
                    dataKey="total" 
                    name="Ventas"
                    fill="#fbbf24"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="chart-container">
            <div className="chart-header">
              <h3 className="chart-title chart-title-purchases">
                <FaCalendarAlt size={12} /> Compras Mensuales
              </h3>
              {(selectedYear || searchTerm || startDate || endDate) && (
                <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                  {selectedYear ? `Año: ${selectedYear}` : ''} 
                  {selectedYear && (searchTerm || startDate || endDate) ? ' | ' : ''}
                  {searchTerm ? `Búsqueda: &quot;${searchTerm}&quot;` : ''}
                  {(searchTerm && (startDate || endDate)) ? ' | ' : ''}
                  {startDate || endDate ? `Fechas: ${startDate || 'Inicio'} - ${endDate || 'Fin'}` : ''}
                </span>
              )}
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={purchasesByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: "#cbd5e1", fontSize: 8 }}
                    stroke="#475569"
                  />
                  <YAxis 
                    tick={{ fill: "#cbd5e1", fontSize: 8 }}
                    stroke="#475569"
                    tickFormatter={(value) => `$${value/1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #3b82f6",
                      borderRadius: "0.25rem",
                      color: "#f1f5f9",
                      fontSize: "0.65rem",
                    }}
                    formatter={(value) => [formatCurrency(value), "Compras"]}
                  />
                  <Bar 
                    dataKey="total" 
                    name="Compras"
                    fill="#3b82f6"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Clientes Más Frecuentes */}
        <div className="customer-chart-container">
          <div className="chart-header">
            <h3 className="chart-title chart-title-customers">
              👥 Clientes Más Frecuentes
            </h3>
            <div className="pie-chart-count">
              Top {topCustomersData.length} clientes por compras
            </div>
          </div>
          <div className="customer-stats-grid">
            {topCustomersData.map((customer, index) => (
              <div 
                key={`customer-${index}`}
                className="customer-stat-item"
                style={{ borderLeftColor: customer.color }}
              >
                <div className="customer-stat-name" title={customer.nombre}>
                  {customer.nombre}
                </div>
                <div className="customer-stat-details">
                  <div className="customer-stat-count" title="Número de compras">
                    {customer.compras} compras
                  </div>
                  <div className="customer-stat-total" title="Total gastado">
                    {formatCurrency(customer.totalGastado)}
                  </div>
                  <div className="customer-stat-percentage">
                    {customer.porcentaje}%
                  </div>
                </div>
              </div>
            ))}
            {topCustomersData.length === 0 && (
              <div className="empty-state" style={{ padding: '0.5rem' }}>
                  <div className="empty-state-icon" style={{ fontSize: '1.5rem' }}>👥</div>
                  <p style={{ margin: 0 }}>No hay clientes con ventas completadas para este filtro.</p>
              </div>
            )}
          </div>
          <div className="pie-chart-summary">
            <span>Total clientes activos: {totalCustomers}</span>
            <span>Clientes con compras: {topCustomersData.length}</span>
            <span>
              {startDate || endDate ? `Periodo: ${startDate || 'Inicio'} - ${endDate || 'Fin'}` : 'Todos los períodos'}
            </span>
          </div>
        </div>

        {/* Productos Más Vendidos */}
        <div className="pie-chart-container">
          <div className="pie-chart-header">
            <div className="pie-chart-title-section">
              <h3 className="pie-chart-title">
                <FaCalendarAlt size={12} /> Productos <span>Más Vendidos</span>
              </h3>
              <div className="pie-chart-count">
                {getAllTopProducts.length} productos en total • Mostrando top {pieChartProductsData.length}
              </div>
            </div>
            <div className="product-search-container">
              <input
                type="text"
                placeholder="Buscar productos en top vendidos..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="product-search-input"
              />
              {productSearch && (
                <button 
                  onClick={() => setProductSearch("")}
                  className="clear-product-search"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>
          {productSearch && (
            <div className="product-search-info">
              Buscando: &quot;{productSearch}&quot; • {getAllTopProducts.filter(p => 
                p.nombre.toLowerCase().includes(productSearch.toLowerCase())
              ).length} productos encontrados
            </div>
          )}
          <div className="pie-chart-content">
            {pieChartProductsData.length > 0 && !(pieChartProductsData.length === 2 && pieChartProductsData[0].nombre.includes("Ejemplo")) ? (
              <>
                <div className="pie-chart-wrapper">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pieChartProductsData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ nombre, porcentaje }) => `${nombre}: ${porcentaje}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="total"
                        nameKey="nombre"
                      >
                        {pieChartProductsData.map((entry, index) => (
                          <Cell 
                            key={`cell-product-${index}`} 
                            fill={PIE_COLORS[index % PIE_COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, props) => [
                          formatCurrency(value),
                          props.payload.nombre
                        ]}
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #334155",
                          borderRadius: "0.25rem",
                          color: "#f1f5f9",
                          fontSize: "0.65rem",
                        }}
                      />
                      <Legend 
                        wrapperStyle={{
                          fontSize: '0.65rem',
                          color: '#cbd5e1'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="pie-chart-stats">
                  {pieChartProductsData.map((product, index) => (
                    <div 
                      key={`stat-product-${index}`}
                      className="pie-stat-item"
                      style={{ borderLeftColor: PIE_COLORS[index % PIE_COLORS.length] }}
                    >
                      <div className="pie-stat-customer" title={product.nombre}>
                        {product.nombre}
                      </div>
                      <div className="pie-stat-details">
                        <div className="pie-stat-purchases" title={`Cantidad: ${product.cantidad}`}>
                          {formatCurrency(product.total)}
                        </div>
                        <div className="pie-stat-percentage">
                          {product.porcentaje}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <p>No se encontraron productos que coincidan con &quot;{productSearch}&quot; o no hay datos de ventas.</p>
                <button 
                  onClick={() => { setProductSearch(""); resetFilters(); }}
                  className="clear-product-search"
                  style={{ marginTop: '0.5rem' }}
                >
                  Mostrar todos los productos
                </button>
              </div>
            )}
          </div>
          <div className="pie-chart-summary">
            <span>Total ventas productos: {formatCurrency(pieChartProductsData.reduce((sum, p) => sum + p.total, 0))}</span>
            <span>Productos únicos mostrados: {pieChartProductsData.length}</span>
            <span>
              {productSearch ? `Búsqueda: &quot;${productSearch}&quot;` : 'Mostrando top 5 productos'}
            </span>
          </div>
        </div>

        {/* Resumen */}
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-title">
              Ventas Promedio
              {searchTerm && <div style={{ fontSize: '0.5rem', color: '#3b82f6' }}>(Filtrado)</div>}
            </div>
            <div className="summary-value">
              {formatCurrency(totalSales / Math.max(1, filteredSales.filter(s => s.isActive).length) || 0)}
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-title">
              Compras Promedio
              {searchTerm && <div style={{ fontSize: '0.5rem', color: '#3b82f6' }}>(Filtrado)</div>}
            </div>
            <div className="summary-value">
              {formatCurrency(totalOrders / Math.max(1, filteredOrders.filter(o => o.isActive).length) || 0)}
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-title">
              Valor por Cliente
              {searchTerm && <div style={{ fontSize: '0.5rem', color: '#3b82f6' }}>(Filtrado)</div>}
            </div>
            <div className="summary-value">
              {formatCurrency(totalSales / Math.max(1, totalCustomers) || 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;