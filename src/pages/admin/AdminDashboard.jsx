// src/pages/admin/AdminDashboard.jsx
import React, { useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList
} from "recharts";
import { FaSearch, FaSyncAlt } from "react-icons/fa";
import { initialSales, initialOrders, initialCustomers } from "../../data";

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

const AdminDashboard = () => {
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("2024");
  const [searchTerm, setSearchTerm] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");

  const resetFilters = () => {
    setSelectedDay(""); setSelectedMonth("");
    setSelectedYear("2024");
    setSearchTerm(""); setProductSearch(""); setCustomerSearch("");
  };

  const salesByMonth = useMemo(() => {
    const map = {};
    initialSales.forEach(s => {
      const d = parseDate(s.fecha);
      if (d && d.getFullYear().toString() === selectedYear) {
        const m = d.getMonth() + 1;
        map[m] = (map[m] || 0) + s.total;
      }
    });
    return Array.from({ length: 12 }, (_, i) => ({ month: getMonthName(i + 1), total: map[i + 1] || 0 }));
  }, [selectedYear]);

  const purchasesByMonth = useMemo(() => {
    const map = {};
    initialOrders.forEach(o => {
      const d = new Date(o.Fecha);
      if (!isNaN(d.getTime()) && d.getFullYear().toString() === selectedYear) {
        const m = d.getMonth() + 1;
        map[m] = (map[m] || 0) + o.Total;
      }
    });
    return Array.from({ length: 12 }, (_, i) => ({ month: getMonthName(i + 1), total: map[i + 1] || 0 }));
  }, [selectedYear]);

  const topProducts = useMemo(() => {
    const pSales = {};
    initialSales.forEach(s => { 
      if (s.producto) pSales[s.producto] = (pSales[s.producto] || 0) + s.total; 
    });
    return Object.entries(pSales)
      .map(([nombre, total]) => ({ nombre, total }))
      .filter(p => p.nombre.toLowerCase().includes(productSearch.toLowerCase()))
      .sort((a,b) => b.total - a.total).slice(0, 5);
  }, [productSearch]);

  const filteredCustomers = useMemo(() => {
    return initialCustomers
      .filter(c => c.Nombre.toLowerCase().includes(customerSearch.toLowerCase()))
      .slice(0, 5);
  }, [customerSearch]);

  return (
    <div style={{ padding: '0rem 2rem', backgroundColor: 'transparent', minHeight: '100vh', color: '#f3f4f6' }}>
      <style>{`
        /* ELIMINAR SCROLL Y MARCOS DE ENFOQUE (AMARILLO/AZUL) */
        *::-webkit-scrollbar { display: none !important; }
        * { 
          -ms-overflow-style: none !important; 
          scrollbar-width: none !important; 
          outline: none !important; /* Quita el marco al hacer clic */
          box-shadow: none !important; 
        }

        .header-top { display: flex; align-items: center; justify-content: space-between; padding: 1rem 0; }
        .dashboard-label { font-family: 'Inter', sans-serif; font-size: 1.6rem; font-weight: 700; color: #ffffff; margin: 0; }
        
        /* BORDES BLANCOS DELGADOS */
        .slim-input, .search-box-slim, .inner-search-container { 
          border: 1px solid rgba(255, 255, 255, 0.6) !important; 
          background: #0f172a; 
          border-radius: 6px; 
          color: #ffffff;
        }
        
        .slim-input { padding: 0.3rem 0.6rem; font-size: 0.75rem; appearance: none; text-align: center; }
        .search-box-slim { height: 30px; display: flex; align-items: center; padding: 0 0.6rem; }
        .search-box-slim input { background: transparent; border: none; color: white; font-size: 0.75rem; width: 120px; }

        /* CAJONES CON BORDE BLANCO DELGADO */
        .chart-visual-box { 
          background: #030712; 
          border: 1px solid rgba(255, 255, 255, 0.5); /* Borde más delgado */
          border-radius: 12px; 
          padding: 1.2rem; 
        }
        .main-visual-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; margin-bottom: 1.2rem; }
        .chart-header-dark { font-size: 0.85rem; color: #ffffff; font-weight: 600; text-transform: uppercase; margin-bottom: 1rem; letter-spacing: 1px; }
        
        /* NOMBRE SIN NEGRITA Y EN BLANCO */
        .item-name { color: #ffffff; font-size: 0.9rem; font-weight: 400; } 
        .inner-search-container { display: flex; align-items: center; padding: 0 0.5rem; height: 28px; }
        .inner-search-container input { background: transparent; border: none; color: white; font-size: 0.75rem; width: 130px; }
      `}</style>

      <div className="header-top">
        <h1 className="dashboard-label">Panel de Dashboard</h1>
        <div className="filters-row" style={{ display: 'flex', gap: '0.5rem' }}>
          <select className="slim-input" value={selectedDay} onChange={(e)=>setSelectedDay(e.target.value)}>
            <option value="">Día</option>
            {Array.from({length: 31}, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="slim-input" value={selectedMonth} onChange={(e)=>setSelectedMonth(e.target.value)}>
            <option value="">Mes</option>
            {Array.from({length: 12}, (_, i) => i + 1).map(m => <option key={m} value={m}>{getMonthName(m)}</option>)}
          </select>
          <input className="slim-input" style={{width: '60px'}} value={selectedYear} onChange={(e)=>setSelectedYear(e.target.value)} />
          <div className="search-box-slim">
            <FaSearch size={10} color="#ffffff" />
            <input placeholder="Buscar venta..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
          </div>
          <button onClick={resetFilters} style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
            <FaSyncAlt size={12} />
          </button>
        </div>
      </div>

      <div className="main-visual-grid">
        <div className="chart-visual-box">
          <h3 className="chart-header-dark">Ventas Mensuales</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={salesByMonth} margin={{ left: -35 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" tick={{fill: '#ffffff', fontSize: 10}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill: '#ffffff', fontSize: 9}} axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#030712', border: '1px solid white'}} />
              <Bar dataKey="total" fill="#3b82f6" radius={[4,4,0,0]} barSize={30} minPointSize={5}>
                <LabelList dataKey="total" position="top" fill="#ffffff" fontSize={9} formatter={(v) => v > 0 ? `$${(v/1000).toFixed(0)}k` : ''} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-visual-box">
          <h3 className="chart-header-dark">Compras Mensuales</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={purchasesByMonth} margin={{ left: -35 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" tick={{fill: '#ffffff', fontSize: 10}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill: '#ffffff', fontSize: 9}} axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#030712', border: '1px solid white'}} />
              <Bar dataKey="total" fill="#10b981" radius={[4,4,0,0]} barSize={30} minPointSize={5}>
                <LabelList dataKey="total" position="top" fill="#ffffff" fontSize={9} formatter={(v) => v > 0 ? `$${(v/1000).toFixed(0)}k` : ''} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="main-visual-grid">
        <div className="chart-visual-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="chart-header-dark" style={{margin:0}}>Clientes Frecuentes</h3>
            <div className="inner-search-container">
              <FaSearch size={10} />
              <input placeholder="Buscar cliente..." value={customerSearch} onChange={(e)=>setCustomerSearch(e.target.value)} />
            </div>
          </div>
          {filteredCustomers.map((c, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <span className="item-name">{c.Nombre}</span>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600' }}>ACTIVO</span>
            </div>
          ))}
        </div>

        <div className="chart-visual-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="chart-header-dark" style={{ margin: 0 }}>Productos Top</h3>
            <div className="inner-search-container">
              <FaSearch size={10} />
              <input placeholder="Buscar producto..." value={productSearch} onChange={(e)=>setProductSearch(e.target.value)} />
            </div>
          </div>
          {topProducts.map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <span className="item-name">{p.nombre}</span>
              <span style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: '600' }}>{formatCurrency(p.total)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;