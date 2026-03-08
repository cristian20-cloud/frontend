// src/pages/admin/CategoriasPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import Alert from '../../components/Alert';
import SearchInput from '../../components/SearchInput';
import UniversalModal from '../../components/UniversalModal';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import { initialCategories } from '../../data';
import { FaChevronLeft, FaChevronRight, FaEye, FaEdit, FaTrash, FaPlus, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const CategoriasPage = () => {
  // =============== ESTADOS ===============
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [modalState, setModalState] = useState({ isOpen: false, mode: 'view', category: null });
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, category: null });
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  
  const ITEMS_PER_PAGE = 3;

  const imgPorCategoria = {
    "NIKE 1.1": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762950188/gorrarojaymorada9_sufoqt.jpg",
    "A/N 1.1": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762988183/negraconelescudo_zzh4l9.jpg",
    "BEISBOLERA PREMIUM": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762910786/gorraazulblancoLA_rembf2.jpg",
    "DIAMANTE IMPORTADA": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762914412/gorraconrosas_ko3326.jpg",
    "EQUINAS-AGROPECUARIAS": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762916288/gorraazulcerdoverde_e10kc7.jpg",
    "EXCLUSIVA 1.1": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762956762/gorranube_jrten0.jpg",
    "MONASTERY 1.1": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762957919/gorramonasterygris_ij6ksq.jpg",
    "MULTIMARCA": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762957956/gorrablancachromebeart_amqbro.jpg",
    "PLANA CERRADA 1.1": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762988576/gorranegrajordan_arghad.jpg",
    "PLANA IMPORTADA": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762995130/gorranegraAA_zkdg1e.jpg",
    "PORTAGORRAS": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762994460/portagorras-1sencillo_xxe5hf.jpg",
    "PREMIUM": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762987076/gorrahugoboss_ev6z54.jpg",
    "camisetas": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1763002983/TALLA_M_3_youtflecha_hphfng.jpg",
    "default": "https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=1000&q=80",
  };

  // =============== EFECTOS ===============
  useEffect(() => {
    const mappedCategories = initialCategories.map(categoria => {
      const nombreLimpio = categoria.Nombre ? categoria.Nombre.trim() : '';
      return ({
        id: categoria.IdCategoria?.toString() || `cat-${categoria.IdCategoria}`,
        nombre: categoria.Nombre,
        descripcion: categoria.Descripcion,
        imagenUrl: imgPorCategoria[nombreLimpio] || imgPorCategoria["default"],
        estado: categoria.Estado ? 'Activo' : 'Inactivo',
        isActive: categoria.Estado
      });
    });
    setCategories(mappedCategories);
  }, []);

  // =============== UTILIDADES ===============
  const showAlert = (msg, type = 'success') => {
    setAlert({ show: true, message: msg, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3000);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleFilterSelect = (status) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  // =============== FILTROS ===============
  const filteredCategories = useMemo(() => {
    return categories.filter(category => {
      if (filterStatus === 'Activos' && !category.isActive) return false;
      if (filterStatus === 'Inactivos' && category.isActive) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          category.nombre?.toLowerCase().includes(term) ||
          category.descripcion?.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [categories, searchTerm, filterStatus]);

  // =============== PAGINACIÓN ===============
  const totalItems = filteredCategories.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCategories.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCategories, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // =============== MODALES ===============
  const openModal = (mode = 'create', category = null) => {
    setModalState({ isOpen: true, mode, category });
    setErrors({});
    if (category && (mode === 'edit' || mode === 'view')) {
      setFormData({
        nombre: category.nombre || '',
        descripcion: category.descripcion || '',
        imagenUrl: category.imagenUrl || '',
        estado: category.estado || 'Activo',
        isActive: category.isActive !== undefined ? category.isActive : true
      });
    } else if (mode === 'create') {
      setFormData({
        nombre: '',
        descripcion: '',
        imagenUrl: '',
        estado: 'Activo',
        isActive: true
      });
    }
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: 'view', category: null });
    setFormData({});
    setErrors({});
  };

  const openDeleteModal = (category) => {
    if (category.isActive) {
      showAlert('No se puede eliminar una categoría activa. Primero desactívela.', 'delete');
      return;
    }
    setDeleteModalState({ isOpen: true, category });
  };

  const closeDeleteModal = () => {
    setDeleteModalState({ isOpen: false, category: null });
  };

  const handleInputChange = (field, value) => {
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // =============== RENDER FIELD ===============
  const renderField = (label, fieldName, type = 'text', options = []) => {
    const category = modalState.category;
    const isError = errors[fieldName];
    const borderColor = isError ? '#ef4444' : '#334155';
    const backgroundColor = isError ? '#451a1a' : '#1e293b';
    
    const labelStyle = {
      fontSize: '12px',
      color: '#e2e8f0',
      fontWeight: '400', 
      marginBottom: '6px',
      display: 'block'
    };

    const inputStyle = {
      backgroundColor,
      border: `1px solid ${borderColor}`,
      borderRadius: '6px',
      padding: '8px 12px',
      color: '#f1f5f9',
      fontSize: '13px',
      width: '100%',
      outline: 'none',
      boxSizing: 'border-box',
      fontFamily: 'inherit',
    };

    const errorStyle = {
      color: '#f87171',
      fontSize: '11px',
      fontWeight: '500',
      marginTop: '4px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      visibility: isError ? 'visible' : 'hidden',
    };

    if (modalState.mode === 'view') {
      const fieldMap = { nombre: 'nombre', descripcion: 'descripcion', estado: 'estado' };
      const actualFieldName = fieldMap[fieldName] || fieldName;
      let displayValue = category?.[actualFieldName] || 'N/A';

      if (fieldName === 'imagenUrl' || fieldName === 'URL de Imagen (opcional)') {
        const imageUrl = category?.imagenUrl || imgPorCategoria["default"];
        return (
          <div>
            <label style={labelStyle}>{label}: </label>
            <input
              readOnly
              value={imageUrl}
              style={{
                ...inputStyle,
                backgroundColor: '#1e293b',
                cursor: 'default',
                marginBottom: '12px'
              }}
            />
            <div style={{
              width: '100%',
              height: '150px',
              backgroundColor: '#000000',
              borderRadius: '6px',
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              border: '1px solid #334155',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
            }}>
              {!imageUrl && (
                <span style={{ color: '#F5C81B', fontSize: '12px', fontWeight: '600' }}>Sin imagen</span>
              )}
            </div>
          </div>
        );
      }

      return (
        <div>
          <label style={labelStyle}>{label}: </label>
          <div style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '6px',
            padding: '8px 12px',
            color: fieldName === 'nombre' ? '#F5C81B' : '#f1f5f9',
            fontSize: '13px',
            minHeight: '38px',
            display: 'flex',
            alignItems: 'center',
            fontWeight: fieldName === 'nombre' ? '600' : '400'
          }}>
            {displayValue}
          </div>
        </div>
      );
    } else {
      // MODO EDITAR O REGISTRAR (SIN IMÁGENES VISUALES)
      const value = formData[fieldName] || '';

      if (['estado'].includes(fieldName)) {
        if (modalState.mode === 'create') return null;
        return (
          <div>
            <label style={labelStyle}>{label}: <span style={{ color: '#ef4444' }}>*</span> </label>
            <select
              name={fieldName}
              value={value}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              style={inputStyle}
            >
              <option value="">Seleccionar...</option>
              {options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <div style={errorStyle}>
              {isError && (
                <>
                  <span style={{ color: '#f87171', fontSize: '14px', fontWeight: 'bold' }}>●</span>
                  {isError}
                </>
              )}
            </div>
          </div>
        );
      } else if (fieldName === 'descripcion') {
        return (
          <div>
            <label style={labelStyle}>{label}: <span style={{ color: '#ef4444' }}>*</span> </label>
            <textarea
              name={fieldName}
              value={value}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              rows={2}
              style={{
                ...inputStyle,
                height: 'auto',
                minHeight: '45px',
                resize: 'vertical',
                lineHeight: '1.3',
                fontSize: '12px',
                padding: '6px 10px',
              }}
            />
            <div style={errorStyle}>
              {isError && (
                <>
                  <span style={{ color: '#f87171', fontSize: '14px', fontWeight: 'bold' }}>●</span>
                  {isError}
                </>
              )}
            </div>
          </div>
        );
      } else if (fieldName === 'imagenUrl') {
        // CAMBIO: Solo el input de texto, sin vista previa de imagen
        return (
          <div>
            <label style={labelStyle}>{label}: </label>
            <input
              name={fieldName}
              type="text"
              value={value}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
              style={{
                ...inputStyle,
                width: '100%'
              }}
            />
            <div style={errorStyle}>
              {isError && (
                <>
                  <span style={{ color: '#f87171', fontSize: '14px', fontWeight: 'bold' }}>●</span>
                  {isError}
                </>
              )}
            </div>
          </div>
        );
      } else {
        return (
          <div>
            <label style={labelStyle}>{label}: <span style={{ color: '#ef4444' }}>*</span> </label>
            <input
              name={fieldName}
              type={type}
              value={value}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              style={inputStyle}
            />
            <div style={errorStyle}>
              {isError && (
                <>
                  <span style={{ color: '#f87171', fontSize: '14px', fontWeight: 'bold' }}>●</span>
                  {isError}
                </>
              )}
            </div>
          </div>
        );
      }
    }
  };

  // =============== GUARDADO Y ELIMINACIÓN ===============
  const handleSave = () => {
    const requiredFields = [
      { name: 'nombre', label: 'Nombre' },
      { name: 'descripcion', label: 'Descripción' }
    ];
    const newErrors = {};
    requiredFields.forEach(field => {
      const value = formData[field.name];
      const stringValue = value !== null && value !== undefined ? String(value) : '';
      if (!stringValue.trim()) {
        newErrors[field.name] = `${field.label} es obligatorio`;
      }
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      showAlert('Complete los campos obligatorios', 'validation');
      return;
    }

    const { nombre, descripcion, estado, imagenUrl } = formData;
    const finalImagenUrl = imagenUrl || imgPorCategoria["default"];
    const updatedData = {
      nombre,
      descripcion,
      imagenUrl: finalImagenUrl,
      estado: modalState.mode === 'create' ? 'Activo' : estado,
      isActive: modalState.mode === 'create' ? true : estado === 'Activo',
    };

    if (modalState.mode === 'edit' && modalState.category?.id) {
      setCategories(prev => prev.map(c =>
        c.id === modalState.category.id ? { ...c, ...updatedData } : c
      ));
      showAlert(`Categoría "${updatedData.nombre}" actualizada correctamente`, 'edit');
    } else if (modalState.mode === 'create') {
      const newId = `cat-${Date.now()}`;
      setCategories(prev => [...prev, { ...updatedData, id: newId }]);
      showAlert(`¡Categoría "${updatedData.nombre}" registrada exitosamente!`, 'register-success');
    }
    closeModal();
  };

  const handleDelete = () => {
    if (deleteModalState.category) {
      setCategories(prev => prev.filter(c => c.id !== deleteModalState.category.id));
      showAlert(`Categoría "${deleteModalState.category.nombre}" eliminada correctamente`, 'delete');
      closeDeleteModal();
    }
  };

  const handleToggleStatus = (id) => {
    setCategories(prev => prev.map(c => {
      if (c.id === id) {
        const newStatus = !c.isActive;
        return {
          ...c,
          isActive: newStatus,
          estado: newStatus ? 'Activo' : 'Inactivo'
        };
      }
      return c;
    }));
    const category = categories.find(c => c.id === id);
    if (category) {
      const newStatus = !category.isActive;
      showAlert(
        `Categoría "${category.nombre}" ${newStatus ? 'activada' : 'desactivada'} correctamente`,
        newStatus ? 'add' : 'delete'
      );
    }
  };

  // =============== COMPONENTES ===============
  const StatusFilter = () => {
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
            whiteSpace: 'nowrap',
            minWidth: '110px',
            justifyContent: 'space-between',
            fontWeight: '600',
            height: '36px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => {
            e.target.style.backgroundColor = '#F5C81B';
            e.target.style.color = '#000';
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 8px rgba(245, 200, 27, 0.3)';
          }}
          onMouseLeave={e => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#F5C81B';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          {filterStatus}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
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
            borderRadius: '6px',
            padding: '6px 0',
            minWidth: '120px',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(245, 200, 27, 0.3)'
          }}>
            {['Todos', 'Activos', 'Inactivos'].map(status => (
              <button
                key={status}
                onClick={() => { handleFilterSelect(status); setOpen(false); }}
                style={{
                  width: '100%',
                  padding: '6px 12px',
                  backgroundColor: filterStatus === status ? '#F5C81B' : 'transparent',
                  border: 'none',
                  color: filterStatus === status ? '#000' : '#F5C81B',
                  fontSize: '13px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontWeight: filterStatus === status ? '600' : '400'
                }}
                onMouseEnter={e => filterStatus !== status && (e.target.style.backgroundColor = '#F5C81B', e.target.style.color = '#000')}
                onMouseLeave={e => filterStatus !== status && (e.target.style.backgroundColor = 'transparent', e.target.style.color = '#F5C81B')}
              >
                {status}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const ToggleSwitch = ({ checked, onChange }) => (
    <div
      onClick={onChange}
      style={{
        width: '40px',
        height: '20px',
        backgroundColor: checked ? '#10B981' : '#4B5563',
        borderRadius: '20px',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
        flexShrink: 0
      }}
    >
      <div style={{
        width: '16px',
        height: '16px',
        backgroundColor: '#fff',
        borderRadius: '50%',
        position: 'absolute',
        top: '2px',
        left: checked ? '22px' : '2px',
        transition: 'left 0.3s'
      }} />
    </div>
  );

  const CategoryCard = ({ category }) => {
    const isActive = category.isActive;
    return (
      <div style={{
        backgroundColor: '#000000',
        borderRadius: '6px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        height: '330px',
        minHeight: '330px',
        maxHeight: '330px',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid #222',
      }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#333'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#222'}
      >
        <div style={{
          width: '100%',
          height: '150px',
          backgroundColor: '#111',
          borderRadius: '4px',
          marginBottom: '16px',
          backgroundImage: category.imagenUrl ? `url(${category.imagenUrl})` : `url(${imgPorCategoria["default"]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {!category.imagenUrl && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: '#F5C81B'
            }}>
              <FaExclamationTriangle size={32} />
              <span style={{ fontSize: '12px', fontWeight: '600' }}>Sin imagen</span>
            </div>
          )}
        </div>

        <div style={{ flex: 1, marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '0', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h3 style={{
              color: '#F5C81B',
              fontSize: '16px',
              fontWeight: '700',
              margin: '0',
              lineHeight: '1.3',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flex: '1 1 auto',
              minWidth: '0',
            }}>
              {category.nombre}
            </h3>
            <span style={{
              padding: "4px 8px",
              fontSize: "10px",
              fontWeight: "700",
              borderRadius: "12px",
              backgroundColor: isActive ? "#10B981" : "#EF4444",
              color: "#000000",
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              flexShrink: '0',
            }}>
              {isActive ? 'Activo' : 'Inactivo'}
            </span>
          </div>

          <p style={{
            color: '#ffffff',
            fontSize: '13px',
            lineHeight: '1.4',
            margin: '0',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flex: 1,
            maxHeight: '60px',
            opacity: 0.9
          }}>
            {category.descripcion}
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'auto',
          padding: '0',
          backgroundColor: 'transparent',
          border: 'none'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <button
              onClick={() => openModal('view', category)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                color: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                transition: 'transform 0.2s'
              }}
              title="Ver Detalles"
              onMouseEnter={e => e.target.style.transform = 'scale(1.1)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            >
              <FaEye size={20} />
            </button>
            <button
              onClick={() => openModal('edit', category)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                color: '#F5C81B',
                display: 'flex',
                alignItems: 'center',
                transition: 'transform 0.2s'
              }}
              title="Editar"
              onMouseEnter={e => e.target.style.transform = 'scale(1.1)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            >
              <FaEdit size={20} />
            </button>
            <button
              onClick={() => openDeleteModal(category)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                transition: 'transform 0.2s'
              }}
              title="Eliminar"
              onMouseEnter={e => e.target.style.transform = 'scale(1.1)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            >
              <FaTrash size={20} />
            </button>
          </div>

          <ToggleSwitch checked={isActive} onChange={() => handleToggleStatus(category.id)} />
        </div>
      </div>
    );
  };

  const Pagination = () => (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '16px',
      padding: '12px 16px',
      border: '1px solid #F5C81B',
      borderRadius: '8px',
      backgroundColor: 'transparent', // Sin fondo
      color: '#9CA3AF',
      fontSize: '12px'
    }}>
      <span style={{ color: '#F5C81B', fontWeight: '500' }}>
        Mostrando {startItem}–{endItem} de {totalItems} categorías
      </span>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: '6px 10px',
            backgroundColor: currentPage === 1 ? '#1a1a1a' : 'transparent',
            border: '1px solid #F5C81B',
            borderRadius: '4px',
            color: currentPage === 1 ? '#6B7280' : '#F5C81B',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            fontSize: '12px',
            transition: 'all 0.2s',
            minWidth: '36px',
            height: '32px'
          }}
          onMouseEnter={(e) => currentPage !== 1 && (e.target.style.backgroundColor = '#F5C81B', e.target.style.color = '#000')}
          onMouseLeave={(e) => currentPage !== 1 && (e.target.style.backgroundColor = 'transparent', e.target.style.color = '#F5C81B')}
        >
          <FaChevronLeft size={12} />
        </button>
        <span style={{ 
          display: 'flex', 
          alignItems: 'center',
          padding: '0 12px',
          color: '#F5C81B',
          fontWeight: '600',
          backgroundColor: 'transparent',
          borderRadius: '4px',
          border: 'none'
        }}>
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            padding: '6px 10px',
            backgroundColor: currentPage === totalPages ? '#1a1a1a' : 'transparent',
            border: '1px solid #F5C81B',
            borderRadius: '4px',
            color: currentPage === totalPages ? '#6B7280' : '#F5C81B',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            fontSize: '12px',
            transition: 'all 0.2s',
            minWidth: '36px',
            height: '32px'
          }}
          onMouseEnter={(e) => currentPage !== totalPages && (e.target.style.backgroundColor = '#F5C81B', e.target.style.color = '#000')}
          onMouseLeave={(e) => currentPage !== totalPages && (e.target.style.backgroundColor = 'transparent', e.target.style.color = '#F5C81B')}
        >
          <FaChevronRight size={12} />
        </button>
      </div>
    </div>
  );

  // =============== RENDER ===============
  return (
    <>
      {alert.show && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ show: false, message: '', type: 'success' })}
        />
      )}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
        backgroundColor: '#000000',
        flex: 1,
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '0 0 10px 0',
          flexShrink: 0,
          marginBottom: '10px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px'
          }}>
            <div style={{ padding: '0' }}>
              <h1 style={{ color: '#F5C81B', fontSize: '20px', fontWeight: '700', margin: '0 0 2px 0', lineHeight: '1.2' }}>
                Gestión de Categorías
              </h1>
              <p style={{ color: '#9CA3AF', fontSize: '14px', margin: '0', lineHeight: '1.3' }}>
                Administra las categorías de productos
              </p>
            </div>
            <button
              onClick={() => openModal('create')}
              style={{
                padding: '6px 12px',
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
                height: '32px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.target.style.backgroundColor = '#F5C81B';
                e.target.style.color = '#000';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 8px rgba(245, 200, 27, 0.3)';
              }}
              onMouseLeave={e => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#F5C81B';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <FaPlus size={10} />
              Registrar Categoría
            </button>
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar por nombre o descripción..."
              onClear={clearSearch}
              fullWidth={true}
              style={{ height: '32px' }}
            />
            <StatusFilter />
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          backgroundColor: 'transparent',
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            paddingTop: '10px',
            minHeight: '330px',
          }}>
            {paginatedCategories.length > 0 ? (
              paginatedCategories.map(category => (
                <CategoryCard key={category.id} category={category} />
              ))
            ) : (
              <div style={{
                gridColumn: '1 / span 3',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#F5C81B',
                textAlign: 'center',
                padding: '40px 20px',
                height: '330px',
                backgroundColor: '#000000',
                borderRadius: '6px',
                border: '1px solid #222'
              }}>
                <FaExclamationTriangle size={64} style={{ marginBottom: '16px' }} />
                <h3 style={{ color: '#F5C81B', margin: '0 0 8px 0' }}>
                  No se encontraron categorías
                </h3>
                <p style={{ color: '#9CA3AF', fontSize: '14px', margin: '0' }}>
                  {searchTerm || filterStatus !== 'Todos'
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'No hay categorías registradas'}
                </p>
              </div>
            )}

            {paginatedCategories.length > 0 && paginatedCategories.length < 3 &&
              Array.from({ length: 3 - paginatedCategories.length }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  style={{
                    backgroundColor: '#000000',
                    borderRadius: '6px',
                    border: '1px dashed #222',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '330px',
                    opacity: 0.3,
                  }}
                />
              ))
            }
          </div>

          {totalItems > 0 && <Pagination />}
        </div>
      </div>

      <UniversalModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.mode === 'create' ? 'Registrar Categoría' : modalState.mode === 'edit' ? 'Editar Categoría' : 'Detalles de la Categoría'}
        subtitle={modalState.mode === 'create' ? 'Complete la información para registrar una nueva categoría' : modalState.mode === 'edit' ? 'Modifique la información de la categoría' : 'Información detallada de la categoría'}
        showActions={false}
        contentStyle={{
          padding: '20px',
          maxHeight: '90vh',
          width: '100%',
          maxWidth: '400px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#1e293b',
          borderRadius: '8px',
          border: '1px solid #334155',
          position: 'relative',
        }}
        overlayStyle={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 1000
        }}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          width: '100%',
          flex: 1,
          minHeight: 0,
          paddingBottom: modalState.mode === 'view' ? '0' : '80px',
          overflowY: 'auto'
        }}>
          <div>{renderField('Nombre', 'nombre', 'text')}</div>
          <div>{renderField('Descripción', 'descripcion', 'textarea')}</div>
          <div>{renderField('URL de Imagen (opcional)', 'imagenUrl', 'text')}</div>
        </div>

        {modalState.mode !== 'view' && (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            padding: '12px 0',
            alignItems: 'center'
          }}>
            <button
              onClick={closeModal}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #F5C81B',
                color: '#F5C81B',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                minWidth: '80px',
                height: '36px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.target.style.backgroundColor = '#F5C81B';
                e.target.style.color = '#000';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 8px rgba(245, 200, 27, 0.3)';
              }}
              onMouseLeave={e => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#F5C81B';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              style={{
                backgroundColor: '#F5C81B',
                border: '1px solid #F5C81B',
                color: '#000',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                minWidth: '100px',
                height: '36px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#F5C81B';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 8px rgba(245, 200, 27, 0.3)';
              }}
              onMouseLeave={e => {
                e.target.style.backgroundColor = '#F5C81B';
                e.target.style.color = '#000';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              {modalState.mode === 'create' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <FaCheckCircle /> Guardar
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <FaCheckCircle /> Guardar Cambios
                </div>
              )}
            </button>
          </div>
        )}
      </UniversalModal>

      <ConfirmDeleteModal
        isOpen={deleteModalState.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        entityName="categoría"
        entityData={deleteModalState.category}
      />
    </>
  );
};

export default CategoriasPage;