// src/pages/admin/ComprasPage.jsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { initialOrders, paymentMethods, initialProducts, initialSuppliers, initialSizes } from '../../data';
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
      case 'completada':
        return '#10B981';
      case 'anulada':
      case 'cancelada':
        return '#EF4444';
      case 'pendiente':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };
  const color = getColorForStatus(status);
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: '12px',
        backgroundColor: `${color}20`,
        color: color,
        fontWeight: 600,
        fontSize: '0.7rem',
        textTransform: 'capitalize',
        border: `1px solid ${color}40`,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: color,
          marginRight: 4,
        }}
      />
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
          height: '36px',
        }}
      >
        {filterStatus}
        <svg
          width='12'
          height='12'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        >
          <path d='M6 9l6 6 6-6' />
        </svg>
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '4px',
            backgroundColor: '#1F2937',
            border: '1px solid #F5C81B',
            borderRadius: '6px',
            padding: '6px 0',
            minWidth: '120px',
            zIndex: 1000,
          }}
        >
          {['Todos', 'Completadas', 'Anuladas'].map((status) => (
            <button
              key={status}
              onClick={() => {
                onFilterSelect(status);
                setOpen(false);
              }}
              style={{
                width: '100%',
                padding: '6px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#F5C81B',
                fontSize: '13px',
                textAlign: 'left',
                cursor: 'pointer',
              }}
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
// COMPONENTE ProductoRow
// =============================================
const ProductoRow = ({
  producto,
  index,
  onChange,
  onRemove,
  isFirst = false,
  isViewMode = false,
}) => {
  const precioUnitario = parseFloat(producto.precio) || 0;
  const subtotal = (producto.cantidad || 0) * precioUnitario;
  
  if (isViewMode) {
    return (
      <>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 0.8fr 0.6fr 0.8fr 0.8fr',
            gap: '4px',
            padding: '6px 0',
            borderBottom: '1px solid #334155',
          }}
        >
          <div style={{ color: '#fff', fontSize: '11px', padding: '4px 0' }}>
            {producto.nombre || '-'}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '11px', padding: '4px 0', textAlign: 'center' }}>
            {producto.talla || '-'}
          </div>
          <div style={{ color: '#fff', fontSize: '11px', padding: '4px 0', textAlign: 'center' }}>
            {producto.cantidad || 0}
          </div>
          <div style={{ color: '#F5C81B', fontSize: '11px', padding: '4px 0', textAlign: 'right' }}>
            ${precioUnitario.toLocaleString('es-CO')}
          </div>
          <div style={{ color: '#F5C81B', fontSize: '11px', padding: '4px 0', textAlign: 'right', fontWeight: '600' }}>
            ${subtotal.toLocaleString('es-CO')}
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: !isFirst ? '2fr 0.8fr 0.6fr 1fr 0.2fr' : '2fr 0.8fr 0.6fr 1fr',
          gap: '4px',
          alignItems: 'center',
          marginBottom: '4px',
        }}
      >
        <select
          value={producto.id || ''}
          onChange={(e) => {
            const sel = initialProducts.find((p) => p.id === parseInt(e.target.value));
            onChange(index, 'id', sel?.id || '');
            onChange(index, 'nombre', sel?.nombre || '');
            onChange(index, 'precio', sel?.precio?.toString() || '0');
            onChange(index, 'cantidad', 0);
          }}
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '4px',
            padding: '4px 6px',
            color: '#f1f5f9',
            fontSize: '11px',
            height: '28px',
            outline: 'none',
            width: '100%',
          }}
          className='product-select-no-scroll'
        >
          <option value=''>Producto</option>
          {initialProducts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
        <select
          value={producto.talla || ''}
          onChange={(e) => onChange(index, 'talla', e.target.value)}
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '4px',
            padding: '4px 6px',
            color: '#f1f5f9',
            fontSize: '11px',
            height: '28px',
            outline: 'none',
            width: '100%',
          }}
          className='product-select-no-scroll'
        >
          <option value=''>Talla</option>
          {initialSizes?.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <input
          type='number'
          min='1'
          value={producto.cantidad || ''}
          onChange={(e) => onChange(index, 'cantidad', parseInt(e.target.value) || 0)}
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '4px',
            padding: '4px 6px',
            color: '#f1f5f9',
            fontSize: '11px',
            height: '28px',
            outline: 'none',
            width: '100%',
            MozAppearance: 'textfield',
            WebkitAppearance: 'none',
            margin: 0,
          }}
          className='no-spinner'
          placeholder='0'
        />
        <div
          style={{
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
          }}
        >
          ${precioUnitario.toLocaleString('es-CO')}
        </div>
        {!isFirst && (
          <button
            onClick={() => onRemove(index)}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#ef4444',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              <path d='M18 6L6 18M6 6l12 12' />
            </svg>
          </button>
        )}
      </div>
    </>
  );
};
ProductoRow.displayName = 'ProductoRow';

// =============================================
// COMPONENTE ComprasFormFields
// =============================================
const ComprasFormFields = ({
  modalState,
  formData,
  errors,
  handleFieldChange,
  handleSave,
  agregarProducto,
  actualizarProducto,
  eliminarProducto,
  proveedoresActivos,
}) => {
  const isViewMode = modalState.mode === 'view';
  const isCreateMode = modalState.mode === 'create';
  const total =
    formData.productos?.reduce(
      (sum, p) => sum + (p.cantidad || 0) * (parseFloat(p.precio) || 0),
      0
    ) || 0;
    
  if (isViewMode) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ flex: 2 }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>Proveedor:</div>
            <div
              style={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '4px',
                padding: '6px 8px',
                color: '#f1f5f9',
                fontSize: '12px',
              }}
            >
              {formData.proveedor || 'N/A'}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>Estado:</div>
            <div
              style={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '4px',
                padding: '6px 8px',
                color: '#f1f5f9',
                fontSize: '12px',
              }}
            >
              {formData.estado}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>Método de Pago:</div>
            <div
              style={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '4px',
                padding: '6px 8px',
                color: '#f1f5f9',
                fontSize: '12px',
              }}
            >
              {formData.metodoPago}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>Fecha:</div>
            <div
              style={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '4px',
                padding: '6px 8px',
                color: '#f1f5f9',
                fontSize: '12px',
              }}
            >
              {formData.fecha}
            </div>
          </div>
        </div>

        {/* Productos sin fondo */}
        <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
          Productos:
          {/* Headers */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 0.8fr 0.6fr 0.8fr 0.8fr',
              gap: '4px',
              paddingBottom: '6px',
              marginBottom: '6px',
              borderBottom: '1px solid #334155',
            }}
          >
            <div style={{ color: '#94a3b8', fontSize: '10px' }}>Producto</div>
            <div style={{ color: '#94a3b8', fontSize: '10px', textAlign: 'center' }}>Talla</div>
            <div style={{ color: '#94a3b8', fontSize: '10px', textAlign: 'center' }}>Cant.</div>
            <div style={{ color: '#94a3b8', fontSize: '10px', textAlign: 'right' }}>Precio</div>
            <div style={{ color: '#94a3b8', fontSize: '10px', textAlign: 'right' }}>Total</div>
          </div>

          {/* Productos */}
          {formData.productos?.map((p, i) => {
            return (
              <ProductoRow
                key={p._tempKey || i}
                producto={p}
                index={i}
                onChange={actualizarProducto}
                onRemove={eliminarProducto}
                isFirst={i === 0}
                isViewMode={true}
              />
            );
          })}
        </div>
      </div>
    );
  }
  
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
    >
      <div style={{ marginBottom: '8px' }}>
        <label style={{ fontSize: '11px', color: '#e2e8f0', display: 'block', marginBottom: '2px' }}>
          Proveedor: <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <select
          value={formData.proveedor}
          onChange={(e) => handleFieldChange({ target: { name: 'proveedor', value: e.target.value } })}
          style={{
            width: '100%',
            background: '#1e293b',
            color: '#fff',
            border: errors.proveedor ? '1px solid #ef4444' : '1px solid #334155',
            height: '32px',
            borderRadius: '4px',
            padding: '0 8px',
            fontSize: '12px',
            outline: 'none',
          }}
        >
          <option value=''>Seleccionar proveedor</option>
          {proveedoresActivos.map((c) => (
            <option key={c.id} value={c.nombre}>
              {c.nombre}
            </option>
          ))}
        </select>
        {errors.proveedor && (
          <div style={{ color: '#f87171', fontSize: '10px', marginTop: '2px' }}>{errors.proveedor}</div>
        )}
      </div>

      {/* Estado solo visible en Edición, no en Creación */}
      {!isCreateMode && (
        <div style={{ marginBottom: '8px' }}>
          <label style={{ fontSize: '11px', color: '#e2e8f0', display: 'block', marginBottom: '2px' }}>
            Estado:
          </label>
          <select
            value={formData.estado}
            onChange={(e) => handleFieldChange({ target: { name: 'estado', value: e.target.value } })}
            style={{
              width: '100%',
              background: '#1e293b',
              color: '#fff',
              border: errors.estado ? '1px solid #ef4444' : '1px solid #334155',
              height: '32px',
              borderRadius: '4px',
              padding: '0 8px',
              fontSize: '12px',
              outline: 'none',
            }}
          >
            <option value='Completada'>Completada</option>
            <option value='Anulada'>Anulada</option>
          </select>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '11px', color: '#e2e8f0', display: 'block', marginBottom: '2px' }}>
              Método de Pago: <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              value={formData.metodoPago}
              onChange={(e) => handleFieldChange({ target: { name: 'metodoPago', value: e.target.value } })}
              style={{
                width: '100%',
                background: '#1e293b',
                color: '#fff',
                border: errors.metodoPago ? '1px solid #ef4444' : '1px solid #334155',
                height: '32px',
                borderRadius: '4px',
                padding: '0 8px',
                fontSize: '12px',
                outline: 'none',
              }}
            >
              {paymentMethods.filter((m) => m !== 'Tarjeta').map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            {errors.metodoPago && (
              <div style={{ color: '#f87171', fontSize: '10px', marginTop: '2px' }}>{errors.metodoPago}</div>
            )}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '11px', color: '#e2e8f0', display: 'block', marginBottom: '2px' }}>
              Fecha: <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <DateInputWithCalendar
              value={formData.fecha}
              onChange={(d) => handleFieldChange({ target: { name: 'fecha', value: d } })}
              inputStyle={{
                border: errors.fecha ? '1px solid #ef4444' : '1px solid #334155',
                backgroundColor: '#1e293b',
                color: '#fff',
                borderRadius: '4px',
                height: '32px',
                padding: '0 8px',
                fontSize: '12px',
                width: '100%',
                outline: 'none',
              }}
            />
            {errors.fecha && (
              <div style={{ color: '#f87171', fontSize: '10px', marginTop: '2px' }}>{errors.fecha}</div>
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '4px',
        }}
      >
        <label style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: '500' }}>Productos:</label>
        <button
          onClick={agregarProducto}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid #F5C81B',
            color: '#F5C81B',
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: '500',
            cursor: 'pointer',
            height: '26px',
          }}
        >
          + Agregar
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 0.8fr 0.6fr 1fr',
          gap: '4px',
          marginBottom: '4px',
          padding: '0 2px',
        }}
      >
        <div style={{ color: '#94a3b8', fontSize: '10px' }}>Producto</div>
        <div style={{ color: '#94a3b8', fontSize: '10px', textAlign: 'center' }}>Talla</div>
        <div style={{ color: '#94a3b8', fontSize: '10px', textAlign: 'center' }}>Cant.</div>
        <div style={{ color: '#94a3b8', fontSize: '10px', textAlign: 'right' }}>Precio Unit.</div>
      </div>

      <div
        style={{
          maxHeight: '100px',
          overflowY: 'auto',
          marginBottom: '4px',
          paddingRight: '2px',
        }}
      >
        {formData.productos?.map((p, i) => (
          <ProductoRow
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

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          width: '100%',
          marginTop: '2px',
          paddingTop: '4px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginRight: 'auto',
          }}
        >
          <span style={{ color: '#F5C81B', fontSize: '13px', fontWeight: '600' }}>Total:</span>
          <span style={{ color: '#F5C81B', fontSize: '14px', fontWeight: '700' }}>
            ${total.toLocaleString('es-CO')}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            gap: '6px',
          }}
        >
          <button
            onClick={handleSave}
            style={{
              backgroundColor: '#F5C81B',
              border: 'none',
              color: '#0f172a',
              padding: '4px 12px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
              minWidth: '70px',
              height: '30px',
            }}
          >
            {isCreateMode ? 'Registrar compra' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};
ComprasFormFields.displayName = 'ComprasFormFields';

// =============================================
// PÁGINA PRINCIPAL ComprasPage
// =============================================
const ComprasPage = () => {
  const location = useLocation();
  const [compras, setCompras] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [errors, setErrors] = useState({});
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'view',
    compra: null,
  });
  const [anularModal, setAnularModal] = useState({ isOpen: false, compra: null });
  const [formData, setFormData] = useState({
    proveedor: '',
    estado: 'Completada',
    metodoPago: 'Efectivo',
    fecha: new Date().toLocaleDateString('es-CO'),
    productos: [
      {
        id: '',
        nombre: '',
        talla: '',
        cantidad: 0,
        precio: '',
        _tempKey: Date.now() + Math.random(),
      },
    ],
  });
  const proveedoresActivos = useMemo(
    () =>
      initialSuppliers
        .filter((s) => s.Estado)
        .map((s) => ({ id: s.IdProveedor, nombre: s.Nombre })),
    []
  );
  const getProductoMasComprado = useCallback(
    (proveedorNombre) => {
      const comprasProveedor = compras.filter(
        (c) => c.proveedor === proveedorNombre && c.estado !== 'Anulada'
      );
      if (comprasProveedor.length === 0) return 'N/A';
      const contadorProductos = {};
      comprasProveedor.forEach((compra) => {
        compra.productos?.forEach((prod) => {
          if (prod.nombre) {
            contadorProductos[prod.nombre] =
              (contadorProductos[prod.nombre] || 0) + prod.cantidad;
          }
        });
      });
      let productoMasComprado = null;
      let maxCantidad = 0;
      Object.entries(contadorProductos).forEach(([producto, cantidad]) => {
        if (cantidad > maxCantidad) {
          maxCantidad = cantidad;
          productoMasComprado = producto;
        }
      });
      return productoMasComprado || 'N/A';
    },
    [compras]
  );
  const columns = [
    {
      header: 'Proveedor',
      field: 'proveedor',
      width: '150px',
      render: (item) => <span style={{ color: '#fff' }}>{item.proveedor}</span>,
    },
    {
      header: 'Fecha',
      field: 'fecha',
      width: '90px',
      render: (item) => <span style={{ color: '#fff' }}>{item.fecha}</span>,
    },
    {
      header: 'Total',
      field: 'total',
      width: '90px',
      render: (item) => (
        <span style={{ color: '#fff', fontWeight: '600' }}>
          ${Number(item.total).toLocaleString('es-CO')}
        </span>
      ),
    },
    {
      header: 'Producto más comprado',
      field: 'productoMasComprado',
      width: '200px',
      render: (item) => <span style={{ color: '#fff' }}>{getProductoMasComprado(item.proveedor)}</span>,
    },
    {
      header: 'Estado',
      field: 'estado',
      width: '100px',
      render: (item) => <StatusPill status={item.estado} />,
    },
  ];
  useEffect(() => {
    setCompras(
      initialOrders.map((o) => ({
        id: `#${o.IdCompra}`,
        proveedor: o.proveedor,
        fecha: o.Fecha ? new Date(o.Fecha).toLocaleDateString('es-CO') : 'N/A',
        total: o.Total || 0,
        metodo: o.metodoPago,
        estado: o.estado === 'Anulada' ? 'Anulada' : 'Completada',
        productos: o.productos || [],
        isActive: o.estado !== 'Anulada',
      }))
    );
  }, []);
  const showAlert = useCallback((message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3000);
  }, []);
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };
  const resetForm = useCallback(() => {
    setFormData({
      proveedor: '',
      estado: 'Completada',
      metodoPago: 'Efectivo',
      fecha: new Date().toLocaleDateString('es-CO'),
      productos: [
        {
          id: '',
          nombre: '',
          talla: '',
          cantidad: 0,
          precio: '',
          _tempKey: Date.now() + Math.random(),
        },
      ],
    });
    setErrors({});
  }, []);
  const openModal = useCallback(
    (mode = 'create', compra = null) => {
      if (compra && compra.estado === 'Anulada' && mode !== 'view') {
        showAlert('Las compras anuladas solo pueden ser vistas.', 'error');
        return;
      }
      setModalState({ isOpen: true, mode, compra });
      setErrors({});
      if (compra && mode !== 'create') {
        const productosMapeados =
          compra.productos?.map((p) => ({
            ...p,
            _tempKey: Math.random(),
            precio: p.precio.toString(),
          })) || [];
        setFormData({
          proveedor: compra.proveedor || '',
          estado: compra.estado || 'Completada',
          metodoPago: compra.metodo || 'Efectivo',
          fecha: compra.fecha || new Date().toLocaleDateString('es-CO'),
          productos: productosMapeados.length
            ? productosMapeados
            : [
                {
                  id: '',
                  nombre: '',
                  talla: '',
                  cantidad: 0,
                  precio: '',
                  _tempKey: Math.random(),
                },
              ],
        });
      } else {
        resetForm();
      }
    },
    [showAlert, resetForm]
  );
  const closeModal = useCallback(() => {
    setModalState({ isOpen: false, mode: 'view', compra: null });
  }, []);
  useEffect(() => {
    if (location.state?.openModal) {
      openModal('create');
    }
  }, [location, openModal]);
  const agregarProducto = () =>
    setFormData((p) => ({
      ...p,
      productos: [
        ...p.productos,
        {
          id: '',
          nombre: '',
          talla: '',
          cantidad: 0,
          precio: '',
          _tempKey: Math.random(),
        },
      ],
    }));
  const actualizarProducto = (index, campo, valor) =>
    setFormData((p) => {
      const nuevos = [...p.productos];
      nuevos[index] = { ...nuevos[index], [campo]: valor };
      return { ...p, productos: nuevos };
    });
  const eliminarProducto = (index) => {
    if (formData.productos.length > 1) {
      setFormData((p) => ({
        ...p,
        productos: p.productos.filter((_, i) => i !== index),
      }));
    }
  };
  const calcularTotal = () =>
    formData.productos.reduce(
      (t, p) => {
        const qty = p.cantidad || 0;
        const price = parseFloat(p.precio) || 0;
        return t + (qty > 0 ? qty * price : 0);
      },
      0
    );
  const validar = () => {
    const e = {};
    if (!formData.proveedor) e.proveedor = 'Requerido';
    if (!formData.fecha) e.fecha = 'Requerido';
    formData.productos.forEach((p, i) => {
      if (!p.id) e[`producto_${i}`] = 'Seleccione producto';
      if (!p.cantidad || p.cantidad <= 0) e[`cantidad_${i}`] = 'Cantidad inválida';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const handleCreateCompra = () => {
    if (!validar()) return;
    const data = {
      ...formData,
      id: `#${compras.length + 1}`,
      total: calcularTotal(),
      metodo: formData.metodoPago,
    };
    setCompras((prev) => [...prev, data]);
    showAlert('Compra registrada correctamente');
    closeModal();
  };
  const handleEditCompra = () => {
    if (!validar()) return;
    setCompras((prev) =>
      prev.map((c) =>
        c.id === modalState.compra.id
          ? {
              ...c,
              ...formData,
              total: calcularTotal(),
              metodo: formData.metodoPago,
            }
          : c
      )
    );
    showAlert('Compra actualizada correctamente');
    closeModal();
  };
  const handleAnularCompra = () => {
    setCompras((prev) =>
      prev.map((c) =>
        c.id === anularModal.compra.id ? { ...c, estado: 'Anulada', isActive: false } : c
      )
    );
    showAlert('Compra anulada correctamente');
    setAnularModal({ isOpen: false, compra: null });
  };
  const filtered = compras.filter((c) => {
    const search = (c.proveedor + c.id).toLowerCase().includes(searchTerm.toLowerCase());
    const status = filterStatus === 'Todos' || c.estado.startsWith(filterStatus.slice(0, -1));
    return search && status;
  });
  return (
    <>
      {alert.show && <Alert message={alert.message} type={alert.type} onClose={() => setAlert({ ...alert, show: false })} />}
      <style>{`.modal-select-no-scroll::-webkit-scrollbar { width: 0px; background: transparent; } .modal-select-no-scroll { scrollbar-width: none; -ms-overflow-style: none; } .productos-scroll::-webkit-scrollbar { width: 4px; } .productos-scroll::-webkit-scrollbar-track { background: #1e293b; border-radius: 4px; } .productos-scroll::-webkit-scrollbar-thumb { background: #F5C81B; border-radius: 4px; } .productos-scroll::-webkit-scrollbar-thumb:hover { background: #d4a803; } .product-select-no-scroll::-webkit-scrollbar { width: 0px; background: transparent; } .product-select-no-scroll { scrollbar-width: none; -ms-overflow-style: none; } .no-spinner::-webkit-outer-spin-button, .no-spinner::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }`}</style>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '4px 12px 0 12px',
          flex: 1,
          height: '100%',
        }}
      >
        <div style={{ marginBottom: '8px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '6px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              <h1
                style={{
                  color: '#fff',
                  fontSize: '20px',
                  fontWeight: '700',
                  margin: 0,
                  lineHeight: '1.2',
                }}
              >
                Compras
              </h1>
              <p
                style={{
                  color: '#9CA3AF',
                  fontSize: '15px',
                  margin: 0,
                  lineHeight: '1.3',
                }}
              >
                Gestión de abastecimiento
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => openModal('create')}
                style={{
                  padding: '6px 13px',
                  backgroundColor: 'transparent',
                  border: '1px solid #F5C81B',
                  color: '#F5C81B',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  minWidth: '100px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  height: '35px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#F5C81B';
                  e.target.style.color = '#000';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#F5C81B';
                }}
              >
                Registrar Compra
              </button>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
            }}
          >
            <div style={{ flex: 1 }}>
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder='Buscar por proveedor o número...'
                onClear={() => setSearchTerm('')}
                fullWidth={true}
                inputStyle={{
                  border: '1px solid #F5C81B',
                  backgroundColor: '#0a0a0a',
                  color: '#fff',
                  borderRadius: '4px',
                  height: '32px',
                  padding: '0 8px',
                  fontSize: '13px',
                }}
              />
            </div>
            <StatusFilter filterStatus={filterStatus} onFilterSelect={setFilterStatus} />
          </div>
        </div>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '6px',
            border: '1px solid #F5C81B',
            overflow: 'hidden',
            backgroundColor: '#000',
          }}
        >
          <div style={{ flex: 1, overflow: 'auto' }}>
            <EntityTable
              entities={filtered.slice(
                (currentPage - 1) * itemsPerPage,
                currentPage * itemsPerPage
              )}
              columns={columns}
              onView={(c) => openModal('view', c)}
              onEdit={(c) => openModal('edit', c)}
              onAnular={(c) => setAnularModal({ isOpen: true, compra: c })}
              showAnularButton={true}
              moduleType='compras'
              style={{ border: 'none', borderRadius: '0' }}
              tableStyle={{
                width: '100%',
                borderCollapse: 'collapse',
                tableLayout: 'fixed',
              }}
              headerStyle={{
                padding: '10px 4px',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '11px',
                color: '#F5C81B',
                borderBottom: '1px solid #F5C81B',
                backgroundColor: '#151822',
              }}
              rowStyle={{
                border: 'none',
                backgroundColor: '#000',
                '&:hover': { backgroundColor: '#111111' },
              }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 12px',
              backgroundColor: '#151822',
              borderTop: '1px solid #F5C81B',
              fontSize: '12px',
              color: '#e0e0e0',
              height: '48px',
              boxSizing: 'border-box',
            }}
          >
            Mostrando {filtered.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–
            {Math.min(currentPage * itemsPerPage, filtered.length)} de {filtered.length} compras
            <div
              style={{
                display: 'flex',
                gap: '6px',
                alignItems: 'center',
              }}
            >
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
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (currentPage > 1) {
                    e.target.style.backgroundColor = '#F5C81B';
                    e.target.style.color = '#000';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage > 1) {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#F5C81B';
                  }
                }}
              >
                ‹ Anterior
              </button>
              <span
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#F5C81B',
                  minWidth: '60px',
                  textAlign: 'center',
                }}
              >
                Página {currentPage} de {Math.ceil(filtered.length / itemsPerPage) || 1}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= Math.ceil(filtered.length / itemsPerPage)}
                style={{
                  background: 'transparent',
                  border: '1px solid #F5C81B',
                  color: currentPage >= Math.ceil(filtered.length / itemsPerPage) ? '#6B7280' : '#F5C81B',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: currentPage >= Math.ceil(filtered.length / itemsPerPage) ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  minWidth: '90px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (currentPage < Math.ceil(filtered.length / itemsPerPage)) {
                    e.target.style.backgroundColor = '#F5C81B';
                    e.target.style.color = '#000';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage < Math.ceil(filtered.length / itemsPerPage)) {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#F5C81B';
                  }
                }}
              >
                Siguiente ›
              </button>
            </div>
          </div>
        </div>
        <UniversalModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          title={
            modalState.mode === 'create'
              ? 'Registrar Compra'
              : modalState.mode === 'edit'
              ? 'Editar Compra'
              : 'Detalles de la Compra'
          }
          subtitle={
            modalState.mode === 'create'
              ? 'Complete la información'
              : modalState.mode === 'edit'
              ? 'Modifique la información'
              : 'Información detallada'
          }
          showActions={false}
          customStyles={{
            overlay: {
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              zIndex: 1000,
            },
            content: {
              padding: '16px',
              backgroundColor: '#000000',
              border: '1px solid #F5C81B',
              borderRadius: '8px',
              maxWidth: '400px',
              width: '95%',
              maxHeight: '85vh',
              overflowY: 'auto',
              margin: 'auto',
              boxShadow: '0 4px 20px rgba(245, 200, 27, 0.1)',
            },
            title: { color: '#F5C81B', fontSize: '16px', fontWeight: '600', marginBottom: '4px' },
            subtitle: { color: '#9CA3AF', fontSize: '11px', marginBottom: '12px' },
          }}
        >
          <ComprasFormFields
            modalState={modalState}
            formData={formData}
            errors={errors}
            handleFieldChange={handleFieldChange}
            handleSave={modalState.mode === 'create' ? handleCreateCompra : handleEditCompra}
            agregarProducto={agregarProducto}
            actualizarProducto={actualizarProducto}
            eliminarProducto={eliminarProducto}
            proveedoresActivos={proveedoresActivos}
          />
          <AnularOperacionModal
            isOpen={anularModal.isOpen}
            onClose={() => setAnularModal({ isOpen: false, compra: null })}
            onConfirm={handleAnularCompra}
            operationType='compra'
            operationData={anularModal.compra}
            customStyles={{
              overlay: {
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 1000,
              },
              content: {
                backgroundColor: '#000000',
                border: '1px solid #F5C81B',
                borderRadius: '6px',
                padding: '20px',
                maxWidth: '400px',
                margin: 'auto',
                boxShadow: '0 4px 20px rgba(245, 200, 27, 0.1)',
                opacity: '0.95',
              },
            }}
          />
        </UniversalModal>
      </div>
    </>
  );
};
export default ComprasPage;