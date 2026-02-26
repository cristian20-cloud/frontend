// src/pages/admin/VentasPage.jsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { initialSales, paymentMethods, initialProducts, initialCustomers, initialSizes} from '../../data';
import UniversalModal from '../../components/UniversalModal';
import EntityTable from '../../components/EntityTable';
import Alert from '../../components/Alert';
import AnularOperacionModal from '../../components/AnularOperacionModal';
import SearchInput from '../../components/SearchInput';
import DateInputWithCalendar from '../../components/DateInputWithCalendar';

// =============================================
// COMPONENTE StatusPill
// =============================================
const StatusPill = React.memo(function StatusPill({ status }) {
  const getColorForStatus = (status) => {
    switch(status?.toLowerCase()) {
      case 'activo':
      case 'completada': return '#10B981';
      case 'anulada':
      case 'cancelada': return '#EF4444';
      case 'pendiente': return '#F59E0B';
      default: return '#6B7280';
    }
  };
  const color = getColorForStatus(status);
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "4px 10px",
      borderRadius: "12px",
      backgroundColor: `${color}20`,
      color: color,
      fontWeight: 600,
      fontSize: "0.7rem",
      textTransform: "capitalize",
      border: `1px solid ${color}40`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: color, marginRight: 4 }} />
      {status}
    </span>
  );
});

// =============================================
// COMPONENTE StatusFilter
// =============================================
const StatusFilter = React.memo(function StatusFilter({ filterStatus, onFilterSelect }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px',
          backgroundColor: 'transparent', border: '1px solid #F5C81B', color: '#F5C81B',
          borderRadius: '6px', fontSize: '13px', cursor: 'pointer', minWidth: '110px',
          justifyContent: 'space-between', fontWeight: '600', height: '36px'
        }}
      >
        {filterStatus}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: '4px', backgroundColor: '#1F2937',
          border: '1px solid #F5C81B', borderRadius: '6px', padding: '6px 0', minWidth: '120px', zIndex: 1000
        }}>
          {['Todos', 'Completadas', 'Anuladas'].map(status => (
            <button
              key={status}
              onClick={() => { onFilterSelect(status); setOpen(false); }}
              style={{ width: '100%', padding: '6px 12px', backgroundColor: 'transparent', border: 'none', color: '#F5C81B', fontSize: '13px', textAlign: 'left', cursor: 'pointer' }}
            >
              {status}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

// =============================================
// COMPONENTE ProductoForm
// =============================================
const ProductoForm = React.memo(function ProductoForm({ producto, onChange, onRemove, index, isViewMode = false, isFirst = false }) {
  const subtotal = (producto.cantidad || 0) * (parseFloat(producto.precio) || 0);
  
  const productInputStyle = {
    backgroundColor: '#0a0a0a',
    border: '1px solid #334155',
    borderRadius: '4px',
    color: '#ffffff',
    fontSize: '12px',
    padding: '4px 6px',
    width: '100%',
    height: '28px',
    outline: 'none',
  };
  
  const productCardStyle = {
    display: 'grid',
    gap: '6px',
    gridTemplateColumns: !isFirst ? '2.5fr 0.8fr 0.6fr 1fr auto' : '2.5fr 0.8fr 0.6fr 1fr',
    alignItems: 'center',
    padding: '0',
    marginBottom: '6px',
    backgroundColor: 'transparent'
  };
  
  if (isViewMode) {
    return (
      <div style={{
        display: 'grid',
        gap: '6px',
        gridTemplateColumns: '2.5fr 0.8fr 0.6fr 1fr',
        padding: '6px',
        alignItems: 'center',
        border: '1px solid #334155',
        borderRadius: '6px',
        marginBottom: '6px',
        backgroundColor: '#0f0f0f'
      }}>
        <div style={{ color: '#fff', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{producto.nombre || '-'}</div>
        <div style={{ color: '#94a3b8', fontSize: '11px', textAlign: 'center' }}>{producto.talla || '-'}</div>
        <div style={{ color: '#fff', fontSize: '11px', textAlign: 'center' }}>{producto.cantidad || 0}</div>
        <div style={{ color: '#F5C81B', fontSize: '11px', textAlign: 'center' }}>${(parseFloat(producto.precio) || 0).toLocaleString('es-CO')}</div>
      </div>
    );
  }
  
  return (
    <div style={productCardStyle}>
      <select
        value={producto.id || ''}
        onChange={(e) => {
          const sel = initialProducts.find(p => p.id === parseInt(e.target.value));
          onChange(index, 'id', sel?.id || '');
          onChange(index, 'nombre', sel?.nombre || '');
          onChange(index, 'precio', sel?.precio?.toString() || '');
        }}
        style={productInputStyle}
      >
        <option value="">Producto</option>
        {initialProducts.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
      </select>
      
      <select
        value={producto.talla || ''}
        onChange={(e) => onChange(index, 'talla', e.target.value)}
        style={productInputStyle}
      >
        <option value="">Talla</option>
        {initialSizes?.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>
      
      <input
        type="number"
        value={producto.cantidad || ''}
        onChange={(e) => onChange(index, 'cantidad', parseInt(e.target.value) || 0)}
        style={productInputStyle}
      />
      
      <div style={{ 
        color: '#F5C81B', 
        fontWeight: '700', 
        textAlign: 'center', 
        fontSize: '12px',
        border: '1px solid #334155',
        borderRadius: '4px',
        padding: '4px 8px',
        backgroundColor: '#0a0a0a'
      }}>
        ${subtotal.toLocaleString('es-CO')}
      </div>
      
      {!isFirst && (
        <button 
          type="button" 
          onClick={() => onRemove(index)} 
          style={{ 
            border: 'none',
            color: '#ef4444', 
            background: 'transparent', 
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }} 
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </button>
      )}
    </div>
  );
});

const FormField = React.memo(function FormField({ label, required, children, error }) {
  return (
    <label style={{ fontSize: '12px', color: '#e2e8f0', display: 'block', marginBottom: '8px' }}>
      {label}: {required && <span style={{color: '#ef4444'}}>*</span>}
      {children}
      {error && <div style={{ color: '#f87171', fontSize: '11px' }}>{error}</div>}
    </label>
  );
});

// =============================================
// PÁGINA PRINCIPAL VentasPage
// =============================================
const VentasPage = () => {
  const [ventas, setVentas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [errors, setErrors] = useState({});
  const [modalState, setModalState] = useState({ isOpen: false, mode: 'view', venta: null });
  const [anularModal, setAnularModal] = useState({ isOpen: false, venta: null });
  const [nuevaVenta, setNuevaVenta] = useState({
    cliente: '',
    metodoPago: 'Efectivo',
    fecha: new Date().toLocaleDateString('es-CO'),
    productos: [{ id: '', nombre: '', talla: '', cantidad: 1, precio: '', _tempKey: Date.now() + Math.random() }],
    estado: 'Completada'
  });
  
  const clientesActivos = useMemo(() =>
    initialCustomers.filter(c => c.Estado).map(c => ({ id: c.IdCliente, nombre: c.Nombre })), []);
  
  const columns = [
    { header: 'Cliente', field: 'cliente', render: (item) => <span style={{ color: '#fff' }}>{typeof item.cliente === 'object' ? item.cliente?.nombre : item.cliente}</span> },
    { header: 'Fecha', field: 'fecha', render: (item) => <span style={{ color: '#fff' }}>{item.fecha}</span> },
    { header: 'Total', field: 'total', render: (item) => <span style={{ color: '#fff', fontWeight: '600' }}>${Number(item.total).toLocaleString('es-CO')}</span> },
    { header: 'Método', field: 'metodoPago', render: (item) => <span style={{ color: '#fff' }}>{item.metodoPago}</span> },
    { header: 'Estado', field: 'estado', render: (item) => <StatusPill status={item.estado} /> }
  ];
  
  useEffect(() => {
    setVentas(initialSales.map(v => ({
      id: `#${v.IdVenta}`,
      cliente: v.cliente,
      fecha: v.fecha ? new Date(v.fecha).toLocaleDateString('es-CO') : 'N/A',
      total: v.total || 0,
      metodoPago: v.metodoPago,
      estado: v.estado === 'Cancelada' ? 'Anulada' : 'Completada',
      productos: v.productos || [],
      isActive: v.estado !== 'Cancelada'
    })));
  }, []);
  
  const showAlert = useCallback((message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3000);
  }, []);
  
  const openModal = useCallback((mode = 'create', venta = null) => {
    if (venta && venta.estado === 'Anulada' && mode !== 'view') {
      showAlert('Las ventas anuladas solo pueden ser vistas.', 'error');
      return;
    }
    setModalState({ isOpen: true, mode, venta });
    setErrors({});
    const mapP = (prods) => prods.map(p => ({ ...p, _tempKey: Math.random(), precio: p.precio.toString() }));
    if (venta && mode !== 'create') {
      const clienteValue = typeof venta.cliente === 'object' ? venta.cliente?.nombre : venta.cliente;
      setNuevaVenta({
        cliente: clienteValue,
        metodoPago: venta.metodoPago,
        fecha: venta.fecha,
        productos: mapP(venta.productos),
        estado: venta.estado
      });
    } else {
      setNuevaVenta({
        cliente: '',
        metodoPago: 'Efectivo',
        fecha: new Date().toLocaleDateString('es-CO'),
        productos: [{ id: '', nombre: '', talla: '', cantidad: 1, precio: '', _tempKey: Math.random() }],
        estado: 'Completada'
      });
    }
  }, [showAlert]);
  
  const closeModal = useCallback(() => setModalState({ isOpen: false, mode: 'view', venta: null }), []);
  
  const agregarProducto = () => setNuevaVenta(p => ({
    ...p,
    productos: [...p.productos, { id: '', nombre: '', talla: '', cantidad: 1, precio: '', _tempKey: Math.random() }]
  }));
  
  const actualizarProducto = (index, campo, valor) => setNuevaVenta(p => {
    const n = [...p.productos];
    n[index] = { ...n[index], [campo]: valor };
    return { ...p, productos: n };
  });
  
  const eliminarProducto = (index) => {
    if (nuevaVenta.productos.length > 1) {
      setNuevaVenta(p => ({ ...p, productos: p.productos.filter((_, i) => i !== index) }));
    }
  };
  
  const calcularTotal = () => nuevaVenta.productos.reduce((t, p) => t + (p.cantidad * (parseFloat(p.precio) || 0)), 0);
  
  const validar = () => {
    const e = {};
    if (!nuevaVenta.cliente) e.cliente = 'Requerido';
    nuevaVenta.productos.forEach((p, i) => {
      if (!p.id) e[`producto_id_${i}`] = 'Seleccione producto';
      if (!p.precio || p.precio <= 0) e[`producto_precio_${i}`] = 'Inválido';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  
  const handleCreateVenta = () => {
    if (!validar()) return;
    const data = { ...nuevaVenta, id: `#${ventas.length + 1}`, total: calcularTotal(), metodoPago: nuevaVenta.metodoPago };
    setVentas(prev => [...prev, data]);
    showAlert('Venta registrada');
    closeModal();
  };
  
  const handleEditVenta = () => {
    if (!validar()) return;
    setVentas(prev => prev.map(v =>
      v.id === modalState.venta.id
        ? { ...v, ...nuevaVenta, total: calcularTotal(), metodoPago: nuevaVenta.metodoPago }
        : v
    ));
    showAlert('Venta actualizada');
    closeModal();
  };
  
  const handleAnularVenta = () => {
    setVentas(prev => prev.map(v =>
      v.id === anularModal.venta.id
        ? { ...v, estado: 'Anulada', isActive: false }
        : v
    ));
    showAlert('Venta anulada');
    setAnularModal({ isOpen: false, venta: null });
  };
  
  const filtered = ventas.filter(v => {
    const clienteName = typeof v.cliente === 'object' ? v.cliente?.nombre : v.cliente;
    const search = (clienteName + v.id).toLowerCase().includes(searchTerm.toLowerCase());
    const status = filterStatus === 'Todos' || v.estado.startsWith(filterStatus.slice(0, -1));
    return search && status;
  });
  
  const renderModalContent = () => {
    const isView = modalState.mode === 'view';
    const isEdit = modalState.mode === 'edit';
    const total = calcularTotal();
    
    if (isView) {
      const clienteDisplay = typeof modalState.venta?.cliente === 'object' ? modalState.venta.cliente?.nombre : modalState.venta?.cliente;
      const ventaTotal = modalState.venta?.productos?.reduce((sum, p) => sum + (p.cantidad * (parseFloat(p.precio) || 0)), 0) || 0;
      
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 2 }}>
              <FormField label="Cliente">
                <div style={{ backgroundColor: "#0a0a0a", border: "1px solid #334155", borderRadius: "6px", padding: "6px 10px", color: "#f1f5f9", fontSize: "13px" }}>
                  {clienteDisplay || 'N/A'}
                </div>
              </FormField>
            </div>
            <div style={{ flex: 1 }}>
              <FormField label="Estado">
                <div style={{ backgroundColor: "#0a0a0a", border: "1px solid #334155", borderRadius: "6px", padding: "6px 10px", color: "#f1f5f9", fontSize: "13px" }}>
                  {modalState.venta?.estado || 'N/A'}
                </div>
              </FormField>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <FormField label="Método de Pago">
                <div style={{ backgroundColor: "#0a0a0a", border: "1px solid #334155", borderRadius: "6px", padding: "6px 10px", color: "#f1f5f9", fontSize: "13px" }}>
                  {modalState.venta?.metodoPago || 'N/A'}
                </div>
              </FormField>
            </div>
            <div style={{ flex: 1 }}>
              <FormField label="Fecha">
                <div style={{ backgroundColor: "#0a0a0a", border: "1px solid #334155", borderRadius: "6px", padding: "6px 10px", color: "#f1f5f9", fontSize: "13px" }}>
                  {modalState.venta?.fecha || 'N/A'}
                </div>
              </FormField>
            </div>
          </div>
          <div>
            <FormField label="Productos">
              <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                {modalState.venta?.productos?.map((p, i) => (
                  <ProductoForm key={i} producto={p} isViewMode={true} />
                ))}
              </div>
            </FormField>
          </div>
          <div style={{ marginTop: '16px', paddingTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#F5C81B', fontWeight: '700', fontSize: '16px' }}>
                Total: ${ventaTotal.toLocaleString('es-CO')}
              </span>
              <button onClick={closeModal} style={{
                background: 'transparent', border: '1px solid #94a3b8', color: '#94a3b8',
                padding: '6px 16px', borderRadius: '4px', fontSize: '13px', cursor: 'pointer'
              }}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <FormField label="Cliente" required error={errors.cliente}>
          <select 
            value={nuevaVenta.cliente} 
            onChange={(e) => setNuevaVenta(p => ({...p, cliente: e.target.value}))} 
            style={{
              width: '100%', background: '#0a0a0a', color: '#fff', 
              border: errors.cliente ? '1px solid #ef4444' : '1px solid #334155',
              height: '36px', borderRadius: '4px', padding: '0 8px', fontSize: '13px'
            }}
          >
            <option value="">Seleccionar cliente</option>
            {clientesActivos.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
          </select>
        </FormField>

        <div style={{ display: 'flex', gap: '12px' }}>
          {isEdit && (
            <div style={{ flex: 1 }}>
              <FormField label="Estado">
                <select 
                  value={nuevaVenta.estado} 
                  onChange={(e) => setNuevaVenta(p => ({...p, estado: e.target.value}))} 
                  style={{
                    width: '100%', background: '#0a0a0a', color: '#fff', border: '1px solid #334155',
                    height: '36px', borderRadius: '4px', padding: '0 8px', fontSize: '13px'
                  }}
                >
                  <option value="Completada">Completada</option>
                  <option value="Anulada">Anulada</option>
                </select>
              </FormField>
            </div>
          )}
          <div style={{ flex: 1 }}>
            <FormField label="Método de Pago">
              <select 
                value={nuevaVenta.metodoPago} 
                onChange={(e) => setNuevaVenta(p => ({...p, metodoPago: e.target.value}))} 
                style={{
                  width: '100%', background: '#0a0a0a', color: '#fff', border: '1px solid #334155',
                  height: '36px', borderRadius: '4px', padding: '0 8px', fontSize: '13px'
                }}
              >
                {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </FormField>
          </div>
          <div style={{ flex: 1 }}>
            <FormField label="Fecha" required error={errors.fecha}>
              <DateInputWithCalendar 
                value={nuevaVenta.fecha} 
                onChange={(d) => setNuevaVenta(p => ({...p, fecha: d}))} 
                inputStyle={{
                  border: '1px solid #334155', backgroundColor: '#0a0a0a', color: '#fff',
                  borderRadius: '4px', height: '36px', padding: '0 8px', fontSize: '13px', width: '100%'
                }}
              />
            </FormField>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '12px', color: '#e2e8f0' }}>Productos</label>
            <button 
              onClick={agregarProducto}
              style={{
                background: 'transparent', 
                color: '#F5C81B', 
                border: '1px solid #F5C81B', 
                fontSize: '11px', 
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              + Agregar
            </button>
          </div>
          {nuevaVenta.productos.map((p, i) => (
            <ProductoForm 
              key={p._tempKey} 
              producto={p} 
              index={i} 
              onChange={actualizarProducto} 
              onRemove={eliminarProducto} 
              isFirst={i === 0} 
            />
          ))}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#F5C81B', fontWeight: '700', fontSize: '16px' }}>
              Total: ${total.toLocaleString('es-CO')}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={closeModal} style={{
                background: 'transparent', border: '1px solid #6B7280', color: '#D1D5DB',
                padding: '6px 16px', borderRadius: '4px', fontSize: '13px', cursor: 'pointer'
              }}>
                Cancelar
              </button>
              <button onClick={modalState.mode === 'create' ? handleCreateVenta : handleEditVenta} style={{
                background: 'transparent', border: '1px solid #F5C81B', color: '#F5C81B',
                padding: '6px 16px', borderRadius: '4px', fontSize: '13px', cursor: 'pointer'
              }}>
                {modalState.mode === 'create' ? 'Guardar' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <>
      {alert.show && <Alert message={alert.message} type={alert.type} onClose={() => setAlert({ ...alert, show: false })} />}
      <div style={{ display: "flex", flexDirection: "column", padding: "4px 12px 0 12px", flex: 1, height: "100%" }}>
        <div style={{ marginBottom: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <div>
              <h1 style={{ color: "#fff", fontSize: "20px", fontWeight: "700", margin: 0, lineHeight: "1.2" }}>Ventas</h1>
              <p style={{ color: "#9CA3AF", fontSize: "15px", margin: 0, lineHeight: "1.3" }}>Gestión de ventas a clientes</p>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => openModal("create")} style={{
                padding: "6px 13px", backgroundColor: "transparent", border: "1px solid #F5C81B",
                color: "#F5C81B", borderRadius: "4px", fontSize: "11px", cursor: "pointer",
                whiteSpace: "nowrap", minWidth: "100px", fontWeight: "600",
                display: "flex", alignItems: "center", gap: "3px", height: "35px",
              }}
              onMouseEnter={(e) => { e.target.style.backgroundColor = "#F5C81B"; e.target.style.color = "#000"; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = "transparent"; e.target.style.color = "#F5C81B"; }}
              >
                Registrar Venta
              </button>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <SearchInput
                value={searchTerm} onChange={setSearchTerm}
                placeholder="Buscar por cliente o número..."
                onClear={() => setSearchTerm('')} fullWidth={true}
                inputStyle={{
                  border: '1px solid #F5C81B', backgroundColor: '#0a0a0a',
                  color: '#fff', borderRadius: '4px', height: '32px',
                  padding: '0 8px', fontSize: '13px'
                }}
              />
            </div>
            <StatusFilter filterStatus={filterStatus} onFilterSelect={setFilterStatus} />
          </div>
        </div>
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', borderRadius: '6px',
          border: '1px solid #F5C81B', overflow: 'hidden', backgroundColor: '#000',
        }}>
          <div style={{ flex: 1, overflow: 'auto' }}>
            <EntityTable 
              entities={filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)} 
              columns={columns} 
              onView={v => openModal('view', v)} 
              onEdit={v => openModal('edit', v)} 
              onAnular={v => setAnularModal({ isOpen: true, venta: v })}
              showAnularButton={true} 
              moduleType="ventas" 
              style={{ border: 'none', borderRadius: '0' }}
              tableStyle={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}
              headerStyle={{
                padding: '6px 4px', textAlign: 'left', fontWeight: '600', fontSize: '11px',
                color: '#F5C81B', borderBottom: '1px solid #F5C81B', backgroundColor: '#151822',
              }}
              rowStyle={{ border: 'none', backgroundColor: '#000', '&:hover': { backgroundColor: '#111111' } }}
            />
          </div>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "8px 12px", backgroundColor: "#151822", borderTop: '1px solid #F5C81B',
            fontSize: "12px", color: "#e0e0e0", height: "48px", boxSizing: "border-box",
          }}>
            <span>Mostrando {(filtered.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0)}–{Math.min(currentPage * itemsPerPage, filtered.length)} de {filtered.length} ventas</span>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} style={{
                background: 'transparent', border: '1px solid #F5C81B',
                color: currentPage === 1 ? '#6B7280' : '#F5C81B', padding: '6px 12px',
                borderRadius: '6px', fontSize: '12px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontWeight: '600', minWidth: '90px',
              }}>‹ Anterior</button>
              <span style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '600', color: '#F5C81B', minWidth: '60px', textAlign: 'center' }}>
                Página {currentPage} de {Math.ceil(filtered.length / itemsPerPage) || 1}
              </span>
              <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage >= Math.ceil(filtered.length / itemsPerPage)} style={{
                background: 'transparent', border: '1px solid #F5C81B',
                color: currentPage >= Math.ceil(filtered.length / itemsPerPage) ? '#6B7280' : '#F5C81B',
                padding: '6px 12px', borderRadius: '6px', fontSize: '12px',
                cursor: currentPage >= Math.ceil(filtered.length / itemsPerPage) ? 'not-allowed' : 'pointer',
                fontWeight: '600', minWidth: '90px',
              }}>Siguiente ›</button>
            </div>
          </div>
        </div>
      </div>
      <UniversalModal 
        isOpen={modalState.isOpen} onClose={closeModal} 
        title={modalState.mode === 'create' ? 'Registrar Venta' : modalState.mode === 'edit' ? 'Editar Venta' : 'Detalles de la Venta'}
        subtitle={modalState.mode === 'create' ? 'Complete la información para registrar una nueva venta' : modalState.mode === 'edit' ? 'Modifique la información de la venta' : 'Información detallada de la venta'}
        showActions={false}
        customStyles={{
          overlay: { backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 1000 },
          content: { 
            padding: '16px', backgroundColor: '#000000', border: '1px solid #F5C81B',
            borderRadius: '6px', maxWidth: '480px', width: '90%', maxHeight: '85vh',
            overflow: 'hidden', margin: 'auto', boxShadow: '0 4px 20px rgba(245, 200, 27, 0.1)',
            display: 'flex', flexDirection: 'column',
            position: 'relative'
          },
          title: { color: '#F5C81B', fontSize: '18px', fontWeight: '600', marginBottom: '4px' },
          subtitle: { color: '#9CA3AF', fontSize: '13px', marginBottom: '16px' }
        }}
      >
        {renderModalContent()}
      </UniversalModal>
      <AnularOperacionModal 
        isOpen={anularModal.isOpen} onClose={() => setAnularModal({ isOpen: false, venta: null })} 
        onConfirm={handleAnularVenta} operationType="venta" operationData={anularModal.venta}
        customStyles={{
          overlay: { backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1000 },
          content: {
            backgroundColor: '#000000', border: '1px solid #F5C81B', borderRadius: '6px',
            padding: '20px', maxWidth: '400px', margin: 'auto',
            boxShadow: '0 4px 20px rgba(245, 200, 27, 0.1)', opacity: '0.95'
          }
        }}
      />
    </>
  );
};

export default VentasPage;