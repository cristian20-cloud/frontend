// src/pages/admin/Productos.jsx
import React, { useState, useEffect } from "react";
// ===== COMPONENTES =====
import Alert from "../../components/Alert";
import EntityTable from "../../components/EntityTable";
import SearchInput from "../../components/SearchInput";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import UniversalModal from "../../components/UniversalModal";
// ===== ICONOS =====
import {
  FaArrowLeft,
  FaPlus,
  FaMinus,
  FaTrash,
  FaTimes,
  FaSave,
  FaEye
} from "react-icons/fa";
// ===== DATOS =====
import { initialProducts, initialSizes } from "../../data";

const ProductosPage = () => {
  // =========================
  // ESTADOS PARA CONTROL DE VISTA
  // =========================
  const [modoVista, setModoVista] = useState("lista");
  const [productoEditando, setProductoEditando] = useState(null);
  const [productoViendo, setProductoViendo] = useState(null);

  // =========================
  // ESTADOS PARA LA LISTA
  // =========================
  const [productos, setProductos] = useState([]);
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // =========================
  // ESTADOS PARA MODALES Y ALERTAS
  // =========================
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, producto: null, customMessage: '' });

  // =========================
  // ESTADOS DEL FORMULARIO
  // =========================
  const [formData, setFormData] = useState({
    nombre: "",
    categoria: "BEISBOLERA PREMIUM",
    precioCompra: "",
    precioVenta: "0",
    precioMayorista6: "0",
    precioMayorista80: "0",
    enOfertaVenta: false,
    descripcion: "",
    isActive: true
  });
  const [tallasStock, setTallasStock] = useState([]);
  const [, setAllTallas] = useState([]);
  const [categoriasUnicas, setCategoriasUnicas] = useState(['Todas']);
  const [urlsImagenes, setUrlsImagenes] = useState(['']);
  const [errors, setErrors] = useState({});

  // =========================
  // CARGAR DATOS INICIALES
  // =========================
  useEffect(() => {
    const productosFormateados = initialProducts.map((product, index) => ({
      id: product.id || `prod-${index}`,
      nombre: product.nombre,
      categoria: product.categoria,
      precioCompra: product.precioCompra?.toString() || "",
      precioVenta: product.precio?.toString() || "0",
      precioMayorista6: (Math.round(product.precio * 0.9))?.toString() || "0",
      precioMayorista80: (Math.round(product.precio * 0.8))?.toString() || "0",
      stock: product.stock || 0,
      enOfertaVenta: product.hasDiscount || false,
      descripcion: product.descripcion || "",
      tallas: product.tallas || [],
      tallasStock: product.tallasStock || [],
      colores: product.colores || ["Negro"],
      imagenes: product.imagenes || [],
      destacado: product.isFeatured || false,
      sales: product.sales || 0,
      isActive: product.isActive !== undefined ? product.isActive : true
    }));
    setProductos(productosFormateados);
    setFilteredProductos(productosFormateados);
    const cats = ['Todas', ...new Set(productosFormateados.map(p => p.categoria))];
    setCategoriasUnicas(cats);
  }, []);

  useEffect(() => {
    const tallasUnicas = initialSizes.map(size => ({
      value: size.value,
      label: size.label
    }));
    setAllTallas(tallasUnicas);
  }, []);

  // =========================
  // FILTRADO Y PAGINACIÓN
  // =========================
  useEffect(() => {
    let filtrados = productos;
    if (searchTerm) {
      filtrados = filtrados.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (categoriaFiltro !== "Todas") {
      filtrados = filtrados.filter(p => p.categoria === categoriaFiltro);
    }
    setFilteredProductos(filtrados);
    setCurrentPage(1);
  }, [searchTerm, categoriaFiltro, productos]);

  const totalPages = Math.ceil(filteredProductos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredProductos.length);
  const paginatedProductos = filteredProductos.slice(startIndex, endIndex);
  const showingStart = filteredProductos.length > 0 ? startIndex + 1 : 0;

  // =========================
  // FUNCIONES DE UTILIDAD
  // =========================
  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleFilterSelect = (categoria) => {
    setCategoriaFiltro(categoria);
    setCurrentPage(1);
  };

  // =========================
  // FUNCIONES DE TALLAS
  // =========================
  const agregarTalla = () => {
    setTallasStock(prev => [...prev, { talla: "", cantidad: 0 }]);
  };

  const eliminarTalla = (index) => {
    setTallasStock(prev => prev.filter((_, i) => i !== index));
  };

  const handleTallaChange = (index, value) => {
    const nuevasTallas = [...tallasStock];
    nuevasTallas[index].talla = value;
    setTallasStock(nuevasTallas);
  };

  const incrementarCantidad = (index) => {
    const nuevasTallas = [...tallasStock];
    nuevasTallas[index].cantidad += 1;
    setTallasStock(nuevasTallas);
  };

  const decrementarCantidad = (index) => {
    const nuevasTallas = [...tallasStock];
    if (nuevasTallas[index].cantidad > 0) {
      nuevasTallas[index].cantidad -= 1;
      setTallasStock(nuevasTallas);
    }
  };

  // =========================
  // FUNCIONES DE URLS DE IMÁGENES
  // =========================
  const agregarUrlImagen = () => {
    if (urlsImagenes.length < 4) {
      setUrlsImagenes(prev => [...prev, '']);
    }
  };

  const eliminarUrlImagen = (index) => {
    if (urlsImagenes.length > 1) {
      setUrlsImagenes(prev => prev.filter((_, i) => i !== index));
    }
  };

  const actualizarUrlImagen = (index, value) => {
    const nuevasUrls = [...urlsImagenes];
    nuevasUrls[index] = value;
    setUrlsImagenes(nuevasUrls);
  };

  // =========================
  // FUNCIONES PARA CAMBIAR ENTRE VISTAS
  // =========================
  const mostrarLista = () => {
    setModoVista("lista");
    setProductoEditando(null);
    setProductoViendo(null);
    setFormData({
      nombre: "",
      categoria: "BEISBOLERA PREMIUM",
      precioCompra: "",
      precioVenta: "0",
      precioMayorista6: "0",
      precioMayorista80: "0",
      enOfertaVenta: false,
      descripcion: "",
      isActive: true
    });
    setTallasStock([]);
    setUrlsImagenes(['']);
    setErrors({});
  };

  const mostrarFormulario = (producto = null) => {
    if (producto) {
      setProductoEditando(producto);
      setFormData({
        nombre: producto.nombre,
        categoria: producto.categoria,
        precioCompra: producto.precioCompra || "",
        precioVenta: producto.precioVenta,
        precioMayorista6: producto.precioMayorista6 || "0",
        precioMayorista80: producto.precioMayorista80 || "0",
        enOfertaVenta: producto.enOfertaVenta || false,
        descripcion: producto.descripcion || "",
        isActive: producto.isActive !== undefined ? producto.isActive : true
      });
      const tallasDelProducto = producto.tallasStock?.length > 0
        ? producto.tallasStock
        : producto.tallas?.map(talla => ({
          talla: talla,
          cantidad: producto.stock ? Math.floor(producto.stock / producto.tallas.length) : 10
        })) || [];
      setTallasStock(tallasDelProducto);
      if (producto.imagenes && producto.imagenes.length > 0) {
        setUrlsImagenes(producto.imagenes);
      } else {
        setUrlsImagenes(['']);
      }
    } else {
      setProductoEditando(null);
      setFormData({
        nombre: "",
        categoria: "BEISBOLERA PREMIUM",
        precioCompra: "",
        precioVenta: "0",
        precioMayorista6: "0",
        precioMayorista80: "0",
        enOfertaVenta: false,
        descripcion: "",
        isActive: true
      });
      setTallasStock([]);
      setUrlsImagenes(['']);
    }
    setErrors({});
    setModoVista("formulario");
  };

  const mostrarDetalle = (producto) => {
    setProductoViendo(producto);
    setModoVista("detalle");
  };

  // =========================
  // FUNCIONES DE ACCIONES CRUD
  // =========================
  const handleAgregarProducto = () => {
    mostrarFormulario();
  };

  const handleEditarProducto = (producto) => {
    mostrarFormulario(producto);
  };

  const handleVerDetalle = (producto) => {
    mostrarDetalle(producto);
  };

  const handleToggleActivo = (producto) => {
    setProductos(prev => prev.map(p =>
      p.id === producto.id ? { ...p, isActive: !p.isActive } : p
    ));
    const nuevoEstado = !producto.isActive;
    showAlert(`Producto ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`, 'success');
  };

  const confirmarEliminacion = (producto) => {
    if (producto.isActive) {
      showAlert(`No se puede eliminar el producto "${producto.nombre}" porque está activo. Desactívelo primero.`, 'error');
      return;
    }
    const mensaje = `¿Estás seguro que deseas eliminar permanentemente el producto "${producto.nombre}"?`;
    setDeleteModal({
      isOpen: true,
      producto,
      customMessage: mensaje
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, producto: null, customMessage: '' });
  };

  const handleDelete = () => {
    if (deleteModal.producto) {
      setProductos(prev => prev.filter(p => String(p.id) !== String(deleteModal.producto.id)));
      showAlert('Producto eliminado permanentemente', 'delete');
    }
    closeDeleteModal();
  };

  const handleDesactivar = (producto) => {
    if (producto.isActive) {
      setProductos(prev =>
        prev.map(p =>
          String(p.id) === String(producto.id) ? { ...p, isActive: false } : p
        )
      );
      showAlert(`Producto "${producto.nombre}" desactivado`, 'error');
    }
  };

  const handleReactivar = (producto) => {
    if (!producto.isActive) {
      setProductos(prev =>
        prev.map(p =>
          String(p.id) === String(producto.id) ? { ...p, isActive: true } : p
        )
      );
      showAlert(`Producto "${producto.nombre}" reactivado correctamente`, 'success');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del producto es obligatorio';
    }
    if (!formData.precioCompra.trim()) {
      newErrors.precioCompra = 'El precio de compra es obligatorio';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showAlert("Por favor complete los campos obligatorios", "error");
      return;
    }

    const imagenesValidas = urlsImagenes.filter(url => url.trim() !== '');

    const nuevoProducto = {
      id: productoEditando ? productoEditando.id : Date.now(),
      ...formData,
      tallas: tallasStock.map(t => t.talla),
      tallasStock: tallasStock,
      colores: ["Negro", "Blanco"],
      imagenes: imagenesValidas,
      destacado: false,
      sales: 0,
      isActive: formData.isActive
    };

    if (productoEditando) {
      setProductos(prev =>
        prev.map(p => String(p.id) === String(productoEditando.id) ? nuevoProducto : p)
      );
      showAlert(`Producto "${formData.nombre}" actualizado correctamente`);
    } else {
      setProductos(prev => [...prev, nuevoProducto]);
      showAlert(`Producto "${formData.nombre}" registrado correctamente`);
    }

    setTimeout(() => {
      mostrarLista();
    }, 1500);
  };

  // =========================
  // COMPONENTES INTERNOS
  // =========================
  const CategoryFilter = () => {
    const [open, setOpen] = useState(false);
    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen(!open)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
            backgroundColor: 'transparent',
            border: '1px solid #F5C81B',
            color: '#F5C81B',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer',
            minWidth: '120px',
            justifyContent: 'space-between',
            fontWeight: '600',
            height: '32px'
          }}
        >
          {categoriaFiltro}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {open && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '4px',
            backgroundColor: '#1F2937',
            border: '1px solid #F5C81B',
            borderRadius: '4px',
            padding: '4px 0',
            minWidth: '160px',
            maxHeight: '250px',
            overflowY: 'auto',
            zIndex: 1000
          }}>
            {categoriasUnicas.map(cat => (
              <button
                key={cat}
                onClick={() => { handleFilterSelect(cat); setOpen(false); }}
                style={{
                  width: '100%',
                  padding: '4px 10px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#F5C81B',
                  fontSize: '12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const StatusPill = ({ stock, isActive }) => {
    if (isActive === false) {
      return (
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "3px 8px",
          borderRadius: "10px",
          backgroundColor: '#EF444420',
          color: '#EF4444',
          fontWeight: 600,
          fontSize: "0.65rem",
          border: '1px solid #EF444440',
        }}>
          <span style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: '#EF4444', marginRight: 3 }} />
          Inactivo
        </span>
      );
    }
    const stockColor = stock > 10 ? '#10B981' : stock > 0 ? '#F59E0B' : '#EF4444';
    const stockText = stock > 10 ? 'Disponible' : stock > 0 ? 'Bajo stock' : 'Agotado';

    return (
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 8px",
        borderRadius: "10px",
        backgroundColor: `${stockColor}20`,
        color: stockColor,
        fontWeight: 600,
        fontSize: "0.65rem",
        border: `1px solid ${stockColor}40`,
      }}>
        <span style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: stockColor, marginRight: 3 }} />
        {stockText}
      </span>
    );
  };

  const Switch = ({ checked, onChange, id, disabled = false }) => (
    <label style={{
      position: 'relative',
      display: 'inline-block',
      width: '36px',
      height: '20px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1
    }}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        style={{
          opacity: 0,
          width: 0,
          height: 0
        }}
      />
      <span style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: checked ? '#F5C81B' : '#4B5563',
        borderRadius: '20px',
        transition: 'background-color 0.2s',
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}>
        <span style={{
          position: 'absolute',
          height: '16px',
          width: '16px',
          left: checked ? '18px' : '2px',
          bottom: '2px',
          backgroundColor: '#000',
          borderRadius: '50%',
          transition: 'left 0.2s',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
        }} />
      </span>
    </label>
  );

  const columns = [
    {
      header: 'Producto',
      field: 'nombre',
      render: (item) => <span style={{ color: '#fff', fontWeight: '500', fontSize: '13px' }}>{item.nombre}</span>
    },
    {
      header: 'Categoría',
      field: 'categoria',
      render: (item) => <span style={{ color: '#9CA3AF', fontSize: '13px' }}>{item.categoria}</span>
    },
    {
      header: 'Precio',
      field: 'precioVenta',
      render: (item) => <span style={{ color: '#F5C81B', fontWeight: '600', fontSize: '13px' }}>${parseInt(item.precioVenta).toLocaleString()}</span>
    },
    {
      header: 'Estado',
      field: 'estado',
      render: (item) => <StatusPill stock={item.stock} isActive={item.isActive} />
    }
  ];

  // =========================
  // COMPONENTE DE VISTA DETALLE
  // =========================
  const DetalleProductoView = () => {
    if (!productoViendo) return null;
    const producto = productoViendo;
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        flex: 1
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
        }}>
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '16px',
            width: '100%'
          }}>
            <h3 style={{ color: '#F5C81B', fontSize: '14px', fontWeight: '600', margin: '0 0 12px 0', textTransform: 'uppercase' }}>
              INFORMACIÓN GENERAL
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#F5C81B', fontWeight: '500', marginBottom: '4px', display: 'block' }}>
                    Nombre
                  </label>
                  <div style={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    color: '#ffffff',
                    fontSize: '13px',
                    width: '100%',
                    minHeight: '38px',
                    boxSizing: 'border-box'
                  }}>
                    {producto.nombre}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#F5C81B', fontWeight: '500', marginBottom: '4px', display: 'block' }}>
                    Categoría
                  </label>
                  <div style={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    color: '#ffffff',
                    fontSize: '13px',
                    width: '100%',
                    minHeight: '38px',
                    boxSizing: 'border-box'
                  }}>
                    {producto.categoria}
                  </div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#F5C81B', fontWeight: '500', marginBottom: '4px', display: 'block' }}>
                  Descripción
                </label>
                <div style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  color: '#ffffff',
                  fontSize: '13px',
                  width: '100%',
                  minHeight: '38px',
                  boxSizing: 'border-box'
                }}>
                  {producto.descripcion || 'Sin descripción'}
                </div>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '16px',
            width: '100%'
          }}>
            <h4 style={{ color: '#F5C81B', fontSize: '14px', fontWeight: '600', margin: '0 0 12px 0' }}>
              PRECIOS
            </h4>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px'
            }}>
              <div>
                <label style={{ display: 'block', color: '#ffffff', fontSize: '11px', marginBottom: '4px', fontWeight: '500' }}>
                  Compra
                </label>
                <div style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  padding: '8px',
                  color: '#10B981',
                  fontWeight: '600',
                  fontSize: '13px',
                  width: '100%',
                  minHeight: '38px',
                  boxSizing: 'border-box'
                }}>
                  ${parseInt(producto.precioCompra || 0).toLocaleString()}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#9CA3AF', fontSize: '11px', marginBottom: '4px', fontWeight: '500' }}>
                  Venta
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    padding: '8px',
                    color: '#F5C81B',
                    fontWeight: '600',
                    fontSize: '13px',
                    width: '100%',
                    minHeight: '38px',
                    boxSizing: 'border-box',
                    paddingRight: '55px'
                  }}>
                    ${parseInt(producto.precioVenta).toLocaleString()}
                  </div>
                  {producto.enOfertaVenta && (
                    <div style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: '#F5C81B',
                      color: '#000',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '9px',
                      fontWeight: '700'
                    }}>
                      OFERTA
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#9CA3AF', fontSize: '11px', marginBottom: '4px', fontWeight: '500' }}>
                  +6
                </label>
                <div style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  padding: '8px',
                  color: '#F5C81B',
                  fontWeight: '600',
                  fontSize: '13px',
                  width: '100%',
                  minHeight: '38px',
                  boxSizing: 'border-box'
                }}>
                  ${parseInt(producto.precioMayorista6 || 0).toLocaleString()}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#9CA3AF', fontSize: '11px', marginBottom: '4px', fontWeight: '500' }}>
                  +80
                </label>
                <div style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  padding: '8px',
                  color: '#F5C81B',
                  fontWeight: '600',
                  fontSize: '13px',
                  width: '100%',
                  minHeight: '38px',
                  boxSizing: 'border-box'
                }}>
                  ${parseInt(producto.precioMayorista80 || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
        }}>
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '16px',
            width: '100%'
          }}>
            <h3 style={{ color: '#F5C81B', fontSize: '14px', fontWeight: '600', margin: '0 0 12px 0', textTransform: 'uppercase' }}>
              TALLAS Y STOCK
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
              {producto.tallasStock && producto.tallasStock.length > 0 ? (
                producto.tallasStock.map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#1a1a1a',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #333'
                  }}>
                    <div style={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '10px',
                      color: '#F5C81B',
                      fontSize: '12px',
                      fontWeight: '500',
                      padding: '4px 10px',
                      minWidth: '70px',
                      textAlign: 'center'
                    }}>
                      {item.talla || 'Talla'}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ color: '#9CA3AF', fontSize: '11px', fontWeight: '500' }}>
                        Cant:
                      </span>
                      <span style={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '10px',
                        minWidth: '35px',
                        textAlign: 'center',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: '600',
                        padding: '4px 8px'
                      }}>
                        {item.cantidad}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '20px',
                  color: '#9CA3AF',
                  fontSize: '12px',
                  backgroundColor: '#0a0a0a',
                  borderRadius: '6px',
                  border: '1px dashed #333'
                }}>
                  No hay tallas registradas
                </div>
              )}
            </div>
          </div>

          <div style={{
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '16px',
            width: '100%'
          }}>
            <h3 style={{ color: '#F5C81B', fontSize: '14px', fontWeight: '600', margin: '0 0 12px 0', textTransform: 'uppercase' }}>
              IMÁGENES
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
              {producto.imagenes && producto.imagenes.length > 0 ? (
                producto.imagenes.map((url, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#1a1a1a',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #333'
                  }}>
                    <span style={{
                      color: '#fff',
                      fontSize: '12px',
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {url}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '20px',
                  color: '#9CA3AF',
                  fontSize: '12px',
                  backgroundColor: '#0a0a0a',
                  borderRadius: '6px',
                  border: '1px dashed #333'
                }}>
                  No hay imágenes
                </div>
              )}
            </div>

            {producto.imagenes && producto.imagenes.filter(u => u.trim() !== '').length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {producto.imagenes.filter(u => u.trim() !== '').map((url, idx) => (
                    <div key={idx} style={{
                      aspectRatio: '1/1',
                      backgroundColor: '#1e293b',
                      borderRadius: '4px',
                      border: '1px solid #334155',
                      overflow: 'hidden'
                    }}>
                      <img
                        src={url}
                        alt={`Preview ${idx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #6B7280; font-size: 9px;">Error</div>';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // =========================
  // RENDER PRINCIPAL
  // =========================
  return (
    <>
      {alert.show && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ show: false, message: '', type: 'success' })}
        />
      )}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        entityName="producto"
        entityData={deleteModal.producto}
        customMessage={deleteModal.customMessage}
      />

      <div style={{ display: "flex", flexDirection: "column", padding: "4px 16px 0 16px", flex: 1, height: "100%" }}>
        <div style={{ marginBottom: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {(modoVista === "formulario" || modoVista === "detalle") && (
                <button
                  onClick={mostrarLista}
                  style={{
                    background: 'transparent',
                    border: '1px solid #F5C81B',
                    color: '#F5C81B',
                    fontSize: '16px',
                    cursor: 'pointer',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <FaArrowLeft size={16} />
                </button>
              )}
              <div>
                <h1 style={{ color: "#fff", fontSize: "24px", fontWeight: "700", margin: 0 }}>
                  {modoVista === "formulario" && "Registrar Productos"}
                  {modoVista === "detalle" && "Detalle del Producto"}
                  {modoVista === "lista" && "Productos"}
                </h1>
                <p style={{ color: "#9CA3AF", fontSize: "14px", margin: "4px 0 0 0" }}>
                  {modoVista === "formulario" && 'Complete el formulario para registrar un nuevo producto'}
                  {modoVista === "detalle" && `Información detallada de "${productoViendo?.nombre}"`}
                  {modoVista === "lista" && 'Gestión de productos y stock'}
                </p>
              </div>
            </div>

            {modoVista === "lista" && (
              <button
                onClick={handleAgregarProducto}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "transparent",
                  border: "1px solid #F5C81B",
                  color: "#F5C81B",
                  borderRadius: "6px",
                  fontSize: "14px",
                  cursor: "pointer",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#F5C81B20";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                }}
              >
                <FaPlus size={12} />
                Registrar
              </button>
            )}

            {modoVista === "formulario" && (
              <button
                type="submit"
                form="productoForm"
                style={{
                  padding: "6px 12px",
                  backgroundColor: "transparent",
                  border: "1px solid #F5C81B",
                  color: "#F5C81B",
                  borderRadius: "6px",
                  fontSize: "12px",
                  cursor: "pointer",
                  fontWeight: "600"
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#F5C81B20";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                }}
              >
                {productoEditando ? "Actualizar" : "Registrar Producto"}
              </button>
            )}

            {modoVista === "detalle" && (
              <button
                onClick={() => mostrarFormulario(productoViendo)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "transparent",
                  border: "1px solid #F5C81B",
                  color: "#F5C81B",
                  borderRadius: "6px",
                  fontSize: "14px",
                  cursor: "pointer",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#F5C81B20";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                }}
              >
                <FaEye size={12} />
                Editar
              </button>
            )}
          </div>

          {modoVista === "lista" && (
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Buscar..."
                  onClear={() => setSearchTerm('')}
                  fullWidth={true}
                  inputStyle={{
                    border: '1px solid #F5C81B',
                    backgroundColor: '#0a0a0a',
                    color: '#fff',
                    borderRadius: '6px',
                    height: '36px',
                    padding: '0 12px',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>
              <CategoryFilter />
            </div>
          )}
        </div>

        {modoVista === "lista" ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '8px',
            border: '1px solid #F5C81B',
            overflow: 'hidden',
            backgroundColor: '#000',
          }}>
            <div style={{ flex: 1, overflow: 'auto' }}>
              <EntityTable
                entities={paginatedProductos}
                columns={columns}
                onView={handleVerDetalle}
                onEdit={handleEditarProducto}
                onAnular={handleDesactivar}
                onReactivar={handleReactivar}
                onDelete={confirmarEliminacion}
                onToggle={handleToggleActivo}
                showAnularButton={true}
                showDeleteButton={true}
                showReactivarButton={true}
                showToggle={true}
                idField="id"
                estadoField="isActive"
                switchProps={{
                  activeColor: "#10b981",
                  inactiveColor: "#ef4444"
                }}
                moduleType="productos"
                style={{ border: 'none', borderRadius: '0' }}
                tableStyle={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}
                headerStyle={{
                  padding: '10px',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '12px',
                  color: '#F5C81B',
                  borderBottom: '1px solid #F5C81B',
                  backgroundColor: '#151822',
                }}
                rowStyle={{
                  border: 'none',
                  backgroundColor: '#000',
                  '&:hover': { backgroundColor: '#111111' }
                }}
              />
            </div>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 16px",
              backgroundColor: "#151822",
              borderTop: '1px solid #F5C81B',
              fontSize: "12px",
              color: "#e0e0e0",
            }}>
              <span>{showingStart}–{endIndex} de {filteredProductos.length}</span>
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    background: 'transparent',
                    border: '1px solid #F5C81B',
                    color: currentPage === 1 ? '#6B7280' : '#F5C81B',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  ‹
                </button>
                <span style={{ padding: '5px 10px', fontWeight: '600', color: '#F5C81B' }}>
                  {currentPage}/{totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  style={{
                    background: 'transparent',
                    border: '1px solid #F5C81B',
                    color: currentPage >= totalPages ? '#6B7280' : '#F5C81B',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                  }}
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        ) : modoVista === "formulario" ? (
          <form
            id="productoForm"
            onSubmit={handleSubmit}
            style={{
              display: 'grid',
              gridTemplateRows: 'auto auto',
              gap: '16px',
              flex: 1,
            }}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
            }}>
              <div style={{
                backgroundColor: '#111',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '16px',
                width: '100%'
              }}>
                <h3 style={{ color: '#F5C81B', fontSize: '14px', fontWeight: '600', margin: '0 0 12px 0', textTransform: 'uppercase' }}>
                  INFORMACIÓN GENERAL
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: '#F5C81B', fontWeight: '500', marginBottom: '4px', display: 'block' }}>
                        Nombre <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        placeholder="Ej: Gorra Yankees"
                        style={{
                          backgroundColor: errors.nombre ? '#451a1a' : '#1e293b',
                          border: `1px solid ${errors.nombre ? '#ef4444' : '#334155'}`,
                          borderRadius: '6px',
                          padding: '8px 12px',
                          color: '#ffffff',
                          fontSize: '13px',
                          width: '100%',
                          outline: 'none',
                          boxSizing: 'border-box',
                          height: '38px'
                        }}
                      />
                      {errors.nombre && (
                        <div style={{ color: '#f87171', fontSize: '11px', marginTop: '4px' }}>{errors.nombre}</div>
                      )}
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', color: '#F5C81B', fontWeight: '500', marginBottom: '4px', display: 'block' }}>
                        Categoría <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <select
                        value={formData.categoria}
                        onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                        style={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          color: '#ffffff',
                          fontSize: '13px',
                          width: '100%',
                          outline: 'none',
                          height: '38px'
                        }}
                      >
                        {categoriasUnicas.filter(c => c !== "Todas").map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: '#F5C81B', fontWeight: '500', marginBottom: '4px', display: 'block' }}>
                      Descripción
                    </label>
                    <input
                      type="text"
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      placeholder="Descripción..."
                      style={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        color: '#ffffff',
                        fontSize: '13px',
                        width: '100%',
                        outline: 'none',
                        boxSizing: 'border-box',
                        height: '38px'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{
                backgroundColor: '#111',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '16px',
                width: '100%'
              }}>
                <h4 style={{ color: '#F5C81B', fontSize: '14px', fontWeight: '600', margin: '0 0 12px 0' }}>
                  PRECIOS
                </h4>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px'
                }}>
                  <div>
                    <label style={{ display: 'block', color: '#ffffff', fontSize: '11px', marginBottom: '4px', fontWeight: '500' }}>
                      Compra <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.precioCompra}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setFormData({ ...formData, precioCompra: value });
                      }}
                      placeholder="0"
                      style={{
                        backgroundColor: errors.precioCompra ? '#451a1a' : '#1e293b',
                        border: `1px solid ${errors.precioCompra ? '#ef4444' : '#334155'}`,
                        borderRadius: '6px',
                        padding: '8px',
                        color: '#10B981',
                        fontWeight: '600',
                        fontSize: '13px',
                        width: '100%',
                        outline: 'none',
                        boxSizing: 'border-box',
                        height: '38px'
                      }}
                    />
                    {errors.precioCompra && (
                      <div style={{ color: '#f87171', fontSize: '10px', marginTop: '2px' }}>{errors.precioCompra}</div>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#9CA3AF', fontSize: '11px', marginBottom: '4px', fontWeight: '500' }}>
                      Venta <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={formData.precioVenta}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          setFormData({ ...formData, precioVenta: value });
                        }}
                        placeholder="0"
                        style={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '6px',
                          padding: '8px',
                          color: '#F5C81B',
                          fontWeight: '600',
                          fontSize: '13px',
                          width: '100%',
                          outline: 'none',
                          boxSizing: 'border-box',
                          height: '38px',
                          paddingRight: '70px'
                        }}
                      />
                      <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Switch
                          id="ofertaVenta"
                          checked={formData.enOfertaVenta}
                          onChange={(e) => setFormData({ ...formData, enOfertaVenta: e.target.checked })}
                        />
                        <label htmlFor="ofertaVenta" style={{ color: '#F5C81B', fontSize: '9px', cursor: 'pointer', fontWeight: '600' }}>
                          OFERTA
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#9CA3AF', fontSize: '11px', marginBottom: '4px', fontWeight: '500' }}>
                      +6
                    </label>
                    <input
                      type="text"
                      value={formData.precioMayorista6}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setFormData({ ...formData, precioMayorista6: value });
                      }}
                      placeholder="0"
                      style={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        padding: '8px',
                        color: '#F5C81B',
                        fontWeight: '600',
                        fontSize: '13px',
                        width: '100%',
                        outline: 'none',
                        boxSizing: 'border-box',
                        height: '38px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#9CA3AF', fontSize: '11px', marginBottom: '4px', fontWeight: '500' }}>
                      +80
                    </label>
                    <input
                      type="text"
                      value={formData.precioMayorista80}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setFormData({ ...formData, precioMayorista80: value });
                      }}
                      placeholder="0"
                      style={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        padding: '8px',
                        color: '#F5C81B',
                        fontWeight: '600',
                        fontSize: '13px',
                        width: '100%',
                        outline: 'none',
                        boxSizing: 'border-box',
                        height: '38px'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
            }}>
              <div style={{
                backgroundColor: '#111',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '16px',
                width: '100%'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h3 style={{ color: '#F5C81B', fontSize: '14px', fontWeight: '600', margin: 0, textTransform: 'uppercase' }}>
                    TALLAS Y STOCK
                  </h3>
                  <button
                    type="button"
                    onClick={agregarTalla}
                    style={{
                      backgroundColor: 'transparent',
                      border: '1px solid #F5C81B',
                      color: '#F5C81B',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <FaPlus size={8} />
                    Agregar
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {tallasStock.map((item, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: '#1a1a1a',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #333'
                    }}>
                      <select
                        value={item.talla}
                        onChange={(e) => handleTallaChange(index, e.target.value)}
                        style={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#F5C81B',
                          fontSize: '12px',
                          fontWeight: '500',
                          padding: '6px 8px',
                          minWidth: '60px',
                          maxWidth: '100px',
                          width: 'auto',
                          textAlign: 'center',
                          outline: 'none',
                          height: '34px',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="">Talla</option>
                        <option value="XS">XS</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                      </select>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                        <span style={{ color: '#9CA3AF', fontSize: '11px', fontWeight: '500', marginRight: '6px' }}>
                          Cant:
                        </span>
                        <button
                          type="button"
                          onClick={() => decrementarCantidad(index)}
                          style={{
                            backgroundColor: '#1e293b',
                            border: '1px solid #334155',
                            color: '#F5C81B',
                            width: '28px',
                            height: '30px',
                            borderRadius: '8px 0 0 8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '10px'
                          }}
                        >
                          <FaMinus size={8} />
                        </button>
                        <span style={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #334155',
                          borderLeft: 'none',
                          borderRight: 'none',
                          minWidth: '35px',
                          textAlign: 'center',
                          color: '#fff',
                          fontSize: '13px',
                          fontWeight: '600',
                          padding: '5px 2px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '30px'
                        }}>
                          {item.cantidad}
                        </span>
                        <button
                          type="button"
                          onClick={() => incrementarCantidad(index)}
                          style={{
                            backgroundColor: '#1e293b',
                            border: '1px solid #334155',
                            color: '#F5C81B',
                            width: '28px',
                            height: '30px',
                            borderRadius: '0 8px 8px 0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '10px'
                          }}
                        >
                          <FaPlus size={8} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => eliminarTalla(index)}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px'
                        }}
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  ))}

                  {tallasStock.length === 0 && (
                    <div style={{
                      textAlign: 'center',
                      padding: '20px',
                      color: '#9CA3AF',
                      fontSize: '12px',
                      backgroundColor: '#0a0a0a',
                      borderRadius: '6px',
                      border: '1px dashed #333'
                    }}>
                      No hay tallas
                    </div>
                  )}
                </div>
              </div>

              <div style={{
                backgroundColor: '#111',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '16px',
                width: '100%'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h3 style={{ color: '#F5C81B', fontSize: '14px', fontWeight: '600', margin: 0, textTransform: 'uppercase' }}>
                    URLS DE IMÁGENES
                  </h3>
                  {urlsImagenes.length < 4 && (
                    <button
                      type="button"
                      onClick={agregarUrlImagen}
                      style={{
                        backgroundColor: 'transparent',
                        border: '1px solid #F5C81B',
                        color: '#F5C81B',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <FaPlus size={8} />
                      Agregar
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {urlsImagenes.map((url, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: '#1a1a1a',
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid #333'
                    }}>
                      <input
                        type="text"
                        value={url}
                        onChange={(e) => actualizarUrlImagen(index, e.target.value)}
                        placeholder={`URL ${index + 1}`}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#fff',
                          fontSize: '12px',
                          flex: 1,
                          outline: 'none'
                        }}
                      />
                      {urlsImagenes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => eliminarUrlImagen(index)}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px'
                          }}
                        >
                          <FaTrash size={16} />
                        </button>
                      )}
                    </div>
                  ))}

                  {urlsImagenes.length === 1 && urlsImagenes[0] === '' && (
                    <div style={{
                      textAlign: 'center',
                      padding: '20px',
                      color: '#9CA3AF',
                      fontSize: '12px',
                      backgroundColor: '#0a0a0a',
                      borderRadius: '6px',
                      border: '1px dashed #333'
                    }}>
                      Agrega URLs (opcional)
                    </div>
                  )}
                </div>

                {urlsImagenes.filter(u => u.trim() !== '').length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                      {urlsImagenes.filter(u => u.trim() !== '').map((url, idx) => (
                        <div key={idx} style={{
                          aspectRatio: '1/1',
                          backgroundColor: '#1e293b',
                          borderRadius: '4px',
                          border: '1px solid #334155',
                          overflow: 'hidden'
                        }}>
                          <img
                            src={url}
                            alt={`Preview ${idx + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
        ) : modoVista === "detalle" ? (
          <DetalleProductoView />
        ) : null}
      </div>
    </>
  );
};

export default ProductosPage;