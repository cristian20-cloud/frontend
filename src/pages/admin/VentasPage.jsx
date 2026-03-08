// src/pages/admin/VentasPage.jsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { initialSales, initialProducts, initialCustomers, initialSizes, paymentMethods } from '../../data';
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
    switch (status?.toLowerCase()) {
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
StatusPill.displayName = 'StatusPill';

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
          <polyline points="6 9 12 15 18 9" />
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
StatusFilter.displayName = 'StatusFilter';

// =============================================
// FUNCIÓN PARA OBTENER PRODUCTO MÁS VENDIDO POR CLIENTE
// =============================================
const getProductoMasVendido = (ventas, clienteNombre) => {
  if (!ventas || !clienteNombre) return 'N/A';
  const ventasCliente = ventas.filter(v =>
    v && v.cliente === clienteNombre && v.estado !== 'Anulada'
  );
  if (ventasCliente.length === 0) return 'N/A';
  const contadorProductos = {};
  ventasCliente.forEach(venta => {
    if (venta.productos && Array.isArray(venta.productos)) {
      venta.productos.forEach(prod => {
        if (prod && prod.nombre) {
          const productoNombre = typeof prod.nombre === 'object'
            ? prod.nombre.nombre || 'Producto'
            : prod.nombre;
          contadorProductos[productoNombre] = (contadorProductos[productoNombre] || 0) + (prod.cantidad || 0);
        }
      });
    }
  });
  let productoMasVendido = null;
  let maxCantidad = 0;
  Object.entries(contadorProductos).forEach(([producto, cantidad]) => {
    if (cantidad > maxCantidad) {
      maxCantidad = cantidad;
      productoMasVendido = producto;
    }
  });
  return productoMasVendido ? String(productoMasVendido) : 'N/A';
};

// =============================================
// COMPONENTE ProductoForm
// =============================================
const ProductoForm = React.memo(function ProductoForm({ producto, onChange, onRemove, index, isViewMode = false, isFirst = false }) {
  const productInputStyle = {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '4px',
    padding: '4px 6px',
    color: '#f1f5f9',
    fontSize: '11px',
    height: '28px',
    outline: 'none',
    width: '100%',
  };

  const subtotal = (producto.cantidad || 0) * (parseFloat(producto.precio) || 0);

  if (isViewMode) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 0.8fr 0.6fr 1fr 1fr',
        gap: '4px',
        padding: '4px 0',
        alignItems: 'center'
      }}>
        <div style={{ color: '#fff', fontSize: '11px' }}>{producto.nombre || '-'}</div>
        <div style={{ color: '#94a3b8', fontSize: '11px', textAlign: 'center' }}>{producto.talla || '-'}</div>
        <div style={{ color: '#fff', fontSize: '11px', textAlign: 'center' }}>{producto.cantidad || 0}</div>
        <div style={{ color: '#F5C81B', fontSize: '11px', textAlign: 'right' }}>
          ${(parseFloat(producto.precio) || 0).toLocaleString('es-CO')}
        </div>
        <div style={{ color: '#F5C81B', fontSize: '11px', textAlign: 'right', fontWeight: '600' }}>
          ${subtotal.toLocaleString('es-CO')}
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`.product-select-no-scroll { scrollbar-width: none; -ms-overflow-style: none; } .product-select-no-scroll::-webkit-scrollbar { display: none; }`}</style>
      <div style={{
        display: 'grid',
        gridTemplateColumns: !isFirst ? '2fr 0.8fr 0.6fr 1fr 0.2fr' : '2fr 0.8fr 0.6fr 1fr',
        gap: '4px',
        alignItems: 'center',
        marginBottom: '4px',
      }}>
        <select
          value={producto.id || ''}
          onChange={(e) => {
            const sel = initialProducts.find(p => p.id === parseInt(e.target.value));
            onChange(index, 'id', sel?.id || '');
            onChange(index, 'nombre', sel?.nombre || '');
            onChange(index, 'precio', sel?.precio?.toString() || '');
          }}
          style={{
            ...productInputStyle,
            overflow: 'hidden',
          }}
          className="product-select-no-scroll"
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
          min="1"
          value={producto.cantidad || ''}
          onChange={(e) => onChange(index, 'cantidad', parseInt(e.target.value) || 0)}
          style={{
            ...productInputStyle,
            MozAppearance: 'textfield',
            WebkitAppearance: 'none',
            margin: 0,
          }}
          className="no-spinner"
          placeholder="0"
        />
        <style>{`.no-spinner::-webkit-outer-spin-button, .no-spinner::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }`}</style>
        <div style={{
          color: '#F5C81B',
          fontWeight: '500',
          fontSize: '11px',
          textAlign: 'right',
          padding: '4px 6px',
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '4px',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}>
          ${(parseFloat(producto.precio) || 0).toLocaleString('es-CO')}
        </div>
        {!isFirst && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#ef4444',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>
    </>
  );
});
ProductoForm.displayName = 'ProductoForm';

const FormField = React.memo(function FormField({ label, required, children, error }) {
  return (
    <div style={{ marginBottom: '8px' }}>
      <label style={{ fontSize: '11px', color: '#e2e8f0', display: 'block', marginBottom: '2px' }}>
        {label}: {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      {children}
      {error && <div style={{ color: '#f87171', fontSize: '10px', marginTop: '2px' }}>{error}</div>}
    </div>
  );
});
FormField.displayName = 'FormField';

// =============================================
// COMPONENTE VentasFormFields
// =============================================
const VentasFormFields = ({
  modalState,
  formData,
  errors,
  handleFieldChange,
  handleSave,
  agregarProducto,
  actualizarProducto,
  eliminarProducto,
  clientesActivos,
}) => {
  const isViewMode = modalState.mode === 'view';
  const isCreateMode = modalState.mode === 'create';
  const total = formData.productos?.reduce((sum, p) => {
    const qty = p.cantidad || 0;
    const price = parseFloat(p.precio) || 0;
    return sum + (qty > 0 ? qty * price : 0);
  }, 0) || 0;

  if (isViewMode) {
    const clienteDisplay = modalState.venta?.cliente || formData.cliente;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ flex: 2 }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>Cliente:</div>
            <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "4px", padding: "6px 8px", color: "#f1f5f9", fontSize: "12px" }}>
              {clienteDisplay || 'N/A'}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>Estado:</div>
            <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "4px", padding: "6px 8px", color: "#f1f5f9", fontSize: "12px" }}>
              {modalState.venta?.estado || formData.estado}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>Método de Pago:</div>
            <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "4px", padding: "6px 8px", color: "#f1f5f9", fontSize: "12px" }}>
              {modalState.venta?.metodoPago || formData.metodoPago}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>Fecha:</div>
            <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "4px", padding: "6px 8px", color: "#f1f5f9", fontSize: "12px" }}>
              {modalState.venta?.fecha || formData.fecha}
            </div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Productos:</div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 0.8fr 0.6fr 1fr 1fr',
            gap: '4px',
            padding: '4px 0',
            marginBottom: '4px'
          }}>
            <div style={{ color: '#94a3b8', fontSize: '10px' }}>Producto</div>
            <div style={{ color: '#94a3b8', fontSize: '10px', textAlign: 'center' }}>Talla</div>
            <div style={{ color: '#94a3b8', fontSize: '10px', textAlign: 'center' }}>Cant.</div>
            <div style={{ color: '#94a3b8', fontSize: '10px', textAlign: 'right' }}>Precio</div>
            <div style={{ color: '#94a3b8', fontSize: '10px', textAlign: 'right' }}>Total</div>
          </div>
          {formData.productos?.map((p, i) => (
            <ProductoForm
              key={p._tempKey || i}
              producto={p}
              index={i}
              onChange={actualizarProducto}
              onRemove={eliminarProducto}
              isFirst={i === 0}
              isViewMode={true}
            />
          ))}
        </div>
     
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "6px"
    }}>
      <FormField label="Cliente" required error={errors.cliente}>
        <select
          value={formData.cliente}
          onChange={(e) => handleFieldChange({ target: { name: 'cliente', value: e.target.value } })}
          style={{
            width: '100%', background: '#1e293b', color: '#fff',
            border: errors.cliente ? '1px solid #ef4444' : '1px solid #334155',
            height: '32px', borderRadius: '4px', padding: '0 8px', fontSize: '12px',
            outline: 'none'
          }}
        >
          <option value="">Seleccionar cliente</option>
          {clientesActivos.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
        </select>
      </FormField>
      <div style={{ display: "flex", gap: "8px" }}>
        <div style={{ flex: 1 }}>
          <FormField label="Método de Pago" required error={errors.metodoPago}>
            <select
              value={formData.metodoPago}
              onChange={(e) => handleFieldChange({ target: { name: 'metodoPago', value: e.target.value } })}
              style={{
                width: '100%', background: '#1e293b', color: '#fff',
                border: errors.metodoPago ? '1px solid #ef4444' : '1px solid #334155',
                height: '32px', borderRadius: '4px',
                padding: '0 8px', fontSize: '12px', outline: 'none'
              }}
            >
              {paymentMethods.filter(m => m !== 'Tarjeta').map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </FormField>
        </div>
        <div style={{ flex: 1 }}>
          <FormField label="Fecha" required error={errors.fecha}>
            <DateInputWithCalendar
              value={formData.fecha}
              onChange={(d) => handleFieldChange({ target: { name: 'fecha', value: d } })}
              inputStyle={{
                border: errors.fecha ? '1px solid #ef4444' : '1px solid #334155',
                backgroundColor: '#1e293b', color: '#fff',
                borderRadius: '4px', height: '32px', padding: '0 8px', fontSize: '12px', width: '100%',
                outline: 'none'
              }}
            />
          </FormField>
        </div>
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '4px'
      }}>
        <label style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: '500' }}>
          Productos:
        </label>
        <button
          onClick={agregarProducto}
          style={{
            backgroundColor: "transparent",
            border: "1px solid #F5C81B",
            color: "#F5C81B",
            padding: "3px 8px",
            borderRadius: "4px",
            fontSize: "10px",
            fontWeight: "500",
            cursor: "pointer",
            height: "26px",
          }}
        >
          + Agregar
        </button>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 0.8fr 0.6fr 1fr',
        gap: '4px',
        marginBottom: '4px',
        padding: '0 2px',
      }}>
        <div style={{ color: '#94a3b8', fontSize: '10px' }}>Producto</div>
        <div style={{ color: '#94a3b8', fontSize: '10px', textAlign: 'center' }}>Talla</div>
        <div style={{ color: '#94a3b8', fontSize: '10px', textAlign: 'center' }}>Cant.</div>
        <div style={{ color: '#94a3b8', fontSize: '10px', textAlign: 'right' }}>Precio</div>
      </div>
      <div style={{
        maxHeight: '100px',
        overflowY: 'auto',
        marginBottom: '4px',
        paddingRight: '2px'
      }}>
        {formData.productos?.map((p, i) => (
          <ProductoForm
            key={p._tempKey || i}
            producto={p}
            index={i}
            onChange={actualizarProducto}
            onRemove={eliminarProducto}
            isFirst={i === 0}
            isViewMode={false}
          />
        ))}
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: '100%',
        marginTop: '2px',
        paddingTop: '4px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          marginRight: 'auto'
        }}>
          <span style={{ color: '#F5C81B', fontSize: '13px', fontWeight: '600' }}>
            Total:
          </span>
          <span style={{ color: '#F5C81B', fontSize: '14px', fontWeight: '700' }}>
            ${total.toLocaleString('es-CO')}
          </span>
        </div>
        <div style={{
          display: "flex",
          gap: "6px"
        }}>
          <button
            onClick={handleSave}
            style={{
              backgroundColor: "#F5C81B",
              border: "none",
              color: "#0f172a",
              padding: "4px 12px",
              borderRadius: "4px",
              fontSize: "11px",
              fontWeight: "600",
              cursor: "pointer",
              minWidth: "70px",
              height: "30px",
            }}
          >
            {isCreateMode ? "Registrar venta" : "Actualizar"}
          </button>
        </div>
      </div>
    </div>
  );
};
VentasFormFields.displayName = 'VentasFormFields';

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
  const [formData, setFormData] = useState({
    cliente: '',
    metodoPago: 'Efectivo',
    fecha: new Date().toLocaleDateString('es-CO'),
    productos: [{ id: '', nombre: '', talla: '', cantidad: '', precio: '', _tempKey: Date.now() + Math.random() }],
    estado: 'Completada'
  });

  const clientesActivos = useMemo(() =>
    initialCustomers.filter(c => c.Estado).map(c => ({ id: c.IdCliente, nombre: c.Nombre })), []);

  const columns = [
    { header: 'Cliente', field: 'cliente', width: '150px', render: (item) => <span style={{ color: '#fff' }}>{String(item.cliente || '')}</span> },
    { header: 'Fecha', field: 'fecha', width: '90px', render: (item) => <span style={{ color: '#fff' }}>{String(item.fecha || '')}</span> },
    { header: 'Total', field: 'total', width: '90px', render: (item) => <span style={{ color: '#fff', fontWeight: '600' }}>${Number(item.total || 0).toLocaleString('es-CO')}</span> },
    {
      header: 'Producto más vendido',
      field: 'productoMasVendido',
      width: '180px',
      render: (item) => {
        const producto = getProductoMasVendido(ventas, item.cliente);
        return <span style={{ color: '#F5C81B', fontSize: '12px' }}>{producto}</span>;
      }
    },
    { header: 'Estado', field: 'estado', width: '100px', render: (item) => <StatusPill status={item.estado} /> }
  ];

  useEffect(() => {
    const ventasMapeadas = initialSales.map(v => {
      let clienteNombre = 'N/A';
      if (v.cliente) {
        if (typeof v.cliente === 'object') {
          clienteNombre = v.cliente.nombre || v.cliente.Nombre || 'Cliente';
        } else {
          clienteNombre = String(v.cliente);
        }
      }
      const productosMapeados = Array.isArray(v.productos) ? v.productos.map(p => {
        let nombreProducto = 'Producto';
        if (p.nombre) {
          if (typeof p.nombre === 'object') {
            nombreProducto = p.nombre.nombre || p.nombre.Nombre || 'Producto';
          } else {
            nombreProducto = String(p.nombre);
          }
        }
        return {
          id: p.id || 0,
          nombre: nombreProducto,
          talla: p.talla || '',
          cantidad: p.cantidad || 0,
          precio: p.precio || 0
        };
      }) : [];
      return {
        id: `#${v.IdVenta || v.id || Date.now()}`,
        cliente: clienteNombre,
        fecha: v.fecha ? new Date(v.fecha).toLocaleDateString('es-CO') : 'N/A',
        total: v.total || 0,
        metodoPago: v.metodoPago || 'Efectivo',
        estado: v.estado === 'Cancelada' ? 'Anulada' : (v.estado || 'Completada'),
        productos: productosMapeados,
        isActive: v.estado !== 'Cancelada'
      };
    });
    setVentas(ventasMapeadas);
  }, []);

  const showAlert = useCallback((message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3000);
  }, []);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const openModal = useCallback((mode = 'create', venta = null) => {
    if (venta && venta.estado === 'Anulada' && mode !== 'view') {
      showAlert('Las ventas anuladas solo pueden ser vistas.', 'error');
      return;
    }
    setModalState({ isOpen: true, mode, venta });
    setErrors({});
    if (venta && mode !== 'create') {
      const productosMapeados = venta.productos?.map(p => ({
        ...p,
        _tempKey: Math.random(),
        precio: p.precio?.toString() || '0',
        nombre: typeof p.nombre === 'object' ? (p.nombre.nombre || 'Producto') : (p.nombre || 'Producto')
      })) || [];
      setFormData({
        cliente: venta.cliente || '',
        metodoPago: venta.metodoPago || 'Efectivo',
        fecha: venta.fecha || new Date().toLocaleDateString('es-CO'),
        productos: productosMapeados.length ? productosMapeados : [{ id: '', nombre: '', talla: '', cantidad: '', precio: '', _tempKey: Math.random() }],
        estado: venta.estado || 'Completada'
      });
    } else {
      // Reset form inline instead of using resetForm function
      setFormData({
        cliente: '',
        metodoPago: 'Efectivo',
        fecha: new Date().toLocaleDateString('es-CO'),
        productos: [{ id: '', nombre: '', talla: '', cantidad: '', precio: '', _tempKey: Date.now() + Math.random() }],
        estado: 'Completada'
      });
      setErrors({});
    }
  }, [showAlert]);

  const closeModal = useCallback(() => {
    setModalState({ isOpen: false, mode: 'view', venta: null });
  }, []);

  const agregarProducto = () => setFormData(p => ({
    ...p,
    productos: [...p.productos, { id: '', nombre: '', talla: '', cantidad: '', precio: '', _tempKey: Math.random() }]
  }));

  const actualizarProducto = (index, campo, valor) => setFormData(p => {
    const nuevos = [...p.productos];
    nuevos[index] = { ...nuevos[index], [campo]: valor };
    return { ...p, productos: nuevos };
  });

  const eliminarProducto = (index) => {
    if (formData.productos.length > 1) {
      setFormData(p => ({ ...p, productos: p.productos.filter((_, i) => i !== index) }));
    }
  };

  const calcularTotal = () => formData.productos.reduce((t, p) => {
    const qty = p.cantidad || 0;
    const price = parseFloat(p.precio) || 0;
    return t + (qty > 0 ? qty * price : 0);
  }, 0);

  const validar = () => {
    const e = {};
    if (!formData.cliente) e.cliente = 'Requerido';
    if (!formData.fecha) e.fecha = 'Requerido';
    formData.productos.forEach((p, i) => {
      if (!p.id) e[`producto_${i}`] = 'Seleccione producto';
      if (!p.cantidad || p.cantidad <= 0) e[`cantidad_${i}`] = 'Cantidad inválida';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreateVenta = () => {
    if (!validar()) return;
    const data = {
      ...formData,
      id: `#${ventas.length + 1}`,
      total: calcularTotal()
    };
    setVentas(prev => [...prev, data]);
    showAlert('Venta registrada correctamente');
    closeModal();
  };

  const handleEditVenta = () => {
    if (!validar()) return;
    setVentas(prev => prev.map(v =>
      v.id === modalState.venta.id
        ? { ...v, ...formData, total: calcularTotal() }
        : v
    ));
    showAlert('Venta actualizada correctamente');
    closeModal();
  };

  const handleAnularVenta = () => {
    setVentas(prev => prev.map(v =>
      v.id === anularModal.venta.id
        ? { ...v, estado: 'Anulada', isActive: false }
        : v
    ));
    showAlert('Venta anulada correctamente');
    setAnularModal({ isOpen: false, venta: null });
  };

  const filtered = ventas.filter(v => {
    const search = ((v.cliente || '') + (v.id || '')).toLowerCase().includes((searchTerm || '').toLowerCase());
    const status = filterStatus === 'Todos' || (v.estado || '').startsWith(filterStatus.slice(0, -1));
    return search && status;
  });

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
                transition: 'all 0.2s'
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
                padding: '10px 4px',
                textAlign: 'left', fontWeight: '600', fontSize: '11px',
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
            Mostrando {(filtered.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0)}–{Math.min(currentPage * itemsPerPage, filtered.length)} de {filtered.length} ventas
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} style={{
                background: 'transparent', border: '1px solid #F5C81B',
                color: currentPage === 1 ? '#6B7280' : '#F5C81B', padding: '6px 12px',
                borderRadius: '6px', fontSize: '12px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontWeight: '600', minWidth: '90px', transition: 'all 0.2s'
              }}
                onMouseEnter={(e) => { if (currentPage > 1) { e.target.style.backgroundColor = '#F5C81B'; e.target.style.color = '#000'; } }}
                onMouseLeave={(e) => { if (currentPage > 1) { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#F5C81B'; } }}
              >‹ Anterior</button>
              <span style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '600', color: '#F5C81B', minWidth: '60px', textAlign: 'center' }}>
                Página {currentPage} de {Math.ceil(filtered.length / itemsPerPage) || 1}
              </span>
              <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage >= Math.ceil(filtered.length / itemsPerPage)} style={{
                background: 'transparent', border: '1px solid #F5C81B',
                color: currentPage >= Math.ceil(filtered.length / itemsPerPage) ? '#6B7280' : '#F5C81B',
                padding: '6px 12px', borderRadius: '6px', fontSize: '12px',
                cursor: currentPage >= Math.ceil(filtered.length / itemsPerPage) ? 'not-allowed' : 'pointer',
                fontWeight: '600', minWidth: '90px', transition: 'all 0.2s'
              }}
                onMouseEnter={(e) => { if (currentPage < Math.ceil(filtered.length / itemsPerPage)) { e.target.style.backgroundColor = '#F5C81B'; e.target.style.color = '#000'; } }}
                onMouseLeave={(e) => { if (currentPage < Math.ceil(filtered.length / itemsPerPage)) { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#F5C81B'; } }}
              >Siguiente ›</button>
            </div>
          </div>
        </div>
        <UniversalModal
          isOpen={modalState.isOpen} onClose={closeModal}
          title={modalState.mode === 'create' ? 'Registrar Venta' : modalState.mode === 'edit' ? 'Editar Venta' : 'Detalles de la Venta'}
          subtitle={modalState.mode === 'create' ? 'Complete la información' : modalState.mode === 'edit' ? 'Modifique la información' : 'Información detallada'}
          showActions={false}
          customStyles={{
            overlay: { backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 1000 },
            content: {
              padding: '16px',
              backgroundColor: '#000000',
              border: '1px solid #F5C81B',
              borderRadius: '8px',
              maxWidth: '400px',
              width: '95%',
              maxHeight: 'auto',
              overflow: 'visible',
              margin: '20px auto',
              boxShadow: '0 4px 20px rgba(245, 200, 27, 0.1)',
              position: 'relative',
              top: '2%',
              marginTop: '5px',
              transform: 'none',
            },
            title: { color: '#F5C81B', fontSize: '16px', fontWeight: '600', marginBottom: '4px' },
            subtitle: { color: '#9CA3AF', fontSize: '11px', marginBottom: '12px' }
          }}
        >
          <VentasFormFields
            modalState={modalState}
            formData={formData}
            errors={errors}
            handleFieldChange={handleFieldChange}
            handleSave={modalState.mode === 'create' ? handleCreateVenta : handleEditVenta}
            agregarProducto={agregarProducto}
            actualizarProducto={actualizarProducto}
            eliminarProducto={eliminarProducto}
            clientesActivos={clientesActivos}
          />
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
      </div>
    </>
  );
};

export default VentasPage;