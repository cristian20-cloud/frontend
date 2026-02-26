// src/pages/admin/CategoriasPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import Alert from '../../components/Alert';
import SearchInput from '../../components/SearchInput';
import UniversalModal from '../../components/UniversalModal';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import { initialCategories } from '../../data';
import { FaChevronLeft, FaChevronRight, FaEye, FaEdit, FaTrash, FaBan } from 'react-icons/fa';

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
  const [_selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [_imageUrl, setImageUrl] = useState('');

  const ITEMS_PER_PAGE = 3;

  const imgPorCategoria = {
    "NIKE 1.1": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762950188/gorrarojaymorada9_sufoqt.jpg  ",
    "A/N 1.1": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762988183/negraconelescudo_zzh4l9.jpg  ",
    "BEISBOLERA PREMIUM": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762910786/gorraazulblancoLA_rembf2.jpg  ",
    "DIAMANTE IMPORTADA": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762914412/gorraconrosas_ko3326.jpg  ",
    "EQUINAS-AGROPECUARIAS": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762916288/gorraazulcerdoverde_e10kc7.jpg  ",
    "EXCLUSIVA 1.1": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762956762/gorranube_jrten0.jpg  ",
    "MONASTERY 1.1": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762957919/gorramonasterygris_ij6ksq.jpg  ",
    "MULTIMARCA": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762957956/gorrablancachromebeart_amqbro.jpg  ",
    "PLANA CERRADA 1.1": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762988576/gorranegrajordan_arghad.jpg  ",
    "PLANA IMPORTADA": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762995130/gorranegraAA_zkdg1e.jpg  ",
    "PORTAGORRAS": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762994460/portagorras-1sencillo_xxe5hf.jpg  ",
    "PREMIUM": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762987076/gorrahugoboss_ev6z54.jpg  ",
    "camisetas": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1763002983/TALLA_M_3_youtflecha_hphfng.jpg  ",
    "default": "https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=1000&q=80  ",
  };

  // =============== EFECTOS ===============
  useEffect(() => {
    const mappedCategories = initialCategories.map(categoria => ({
      id: categoria.IdCategoria?.toString() || `cat-${categoria.IdCategoria}`,
      nombre: categoria.Nombre,
      descripcion: categoria.Descripcion,
      imagenUrl: imgPorCategoria[categoria.Nombre] || imgPorCategoria.default,
      estado: categoria.Estado ? 'Activo' : 'Inactivo',
      isActive: categoria.Estado
    }));
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
    setSelectedImageIndex(null);
    setImageUrl('');
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
    setSelectedImageIndex(null);
    setImageUrl('');
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
      fontWeight: '500',
      marginBottom: '2px',
      display: 'block'
    };
    const inputStyle = {
      backgroundColor,
      border: `1px solid ${borderColor}`,
      borderRadius: '6px',
      padding: '4px 8px',
      color: '#f1f5f9',
      fontSize: '13px',
      height: '30px',
      width: '100%',
      outline: 'none',
      boxSizing: 'border-box',
      fontFamily: 'inherit',
    };
    const errorStyle = {
      color: '#f87171',
      fontSize: '11px',
      fontWeight: '500',
      marginTop: '1px',
      height: '14px',
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
        const imageUrl = category?.imagenUrl || imgPorCategoria.default;
        return (
          <div>
            <label style={labelStyle}>{label}:</label>
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
          <label style={labelStyle}>{label}:</label>
          <div style={{ 
            backgroundColor: '#000000', 
            border: '1px solid #334155', 
            borderRadius: '6px', 
            padding: '4px 8px',
            color: fieldName === 'nombre' ? '#F5C81B' : '#f1f5f9', 
            fontSize: '13px', 
            minHeight: '30px',
            display: 'flex', 
            alignItems: 'center', 
            fontWeight: fieldName === 'nombre' ? '600' : '400' 
          }}>
            {displayValue}
          </div>
        </div>
      );
    } else {
      const value = formData[fieldName] || '';
      if (['estado'].includes(fieldName)) {
        if (modalState.mode === 'create') return null;
        return (
          <div>
            <label style={labelStyle}>{label}: <span style={{ color: '#ef4444' }}>*</span></label>
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
              {isError && (<><span style={{ color: '#f87171', fontSize: '14px', fontWeight: 'bold' }}>●</span>{isError}</>)}
            </div>
          </div>
        );
      } else if (fieldName === 'descripcion') {
        return (
          <div>
            <label style={labelStyle}>{label}: <span style={{ color: '#ef4444' }}>*</span></label>
            <textarea
              name={fieldName}
              value={value}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              rows={2}
              style={{
                ...inputStyle,
                height: 'auto',
                minHeight: '40px',
                resize: 'vertical',
                lineHeight: '1.4',
                padding: '4px 8px',
              }}
            />
            <div style={errorStyle}>
              {isError && (<><span style={{ color: '#f87171', fontSize: '14px', fontWeight: 'bold' }}>●</span>{isError}</>)}
            </div>
          </div>
        );
      } else {
        return (
          <div>
            <label style={labelStyle}>{label}: <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              name={fieldName}
              type={type}
              value={value}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              style={inputStyle}
            />
            <div style={errorStyle}>
              {isError && (<><span style={{ color: '#f87171', fontSize: '14px', fontWeight: 'bold' }}>●</span>{isError}</>)}
            </div>
          </div>
        );
      }
    }
  };

  // =============== GUARDADO Y ELIMINACIÓN ===============
  const handleSave = () => {
    const requiredFields = [{ name: 'nombre', label: 'Nombre' }, { name: 'descripcion', label: 'Descripción' }];
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
    const finalImagenUrl = imagenUrl || imgPorCategoria.default;

    const updatedData = {
      nombre,
      descripcion,
      imagenUrl: finalImagenUrl,
      estado: modalState.mode === 'create' ? 'Activo' : estado,
      isActive: modalState.mode === 'create' ? true : estado === 'Activo',
    };

    if (modalState.mode === 'edit' && modalState.category?.id) {
      setCategories(prev => prev.map(c => c.id === modalState.category.id ? { ...c, ...updatedData } : c));
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
            height: '36px' 
          }} 
          onMouseEnter={e => { e.target.style.backgroundColor = '#F5C81B'; e.target.style.color = '#000'; }}
          onMouseLeave={e => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#F5C81B'; }}
        >
          <span>{filterStatus}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
            <polyline points="6,9 12,15 18,9"/>
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

  const CategoryCard = ({ category }) => {
    const isActive = category.isActive;
    return (
      <div style={{
        backgroundColor: '#000000',
        borderRadius: '6px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        height: '340px',
        minHeight: '340px',
        maxHeight: '340px',
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
          backgroundImage: category.imagenUrl ? `url(${category.imagenUrl})` : `url(${imgPorCategoria.default})`,
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
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 5h16v14H4V5z" />
                <path d="M9 3l3 3m3-3l-3 3" />
              </svg>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'space-between' }}>
            <button 
              onClick={() => openModal('view', category)} 
              style={{ 
                flex: 1, 
                backgroundColor: 'transparent', 
                border: '1px solid #3b82f6', 
                color: '#3b82f6', 
                padding: '6px 4px', 
                borderRadius: '4px', 
                fontSize: '14px', 
                fontWeight: '600', 
                cursor: 'pointer', 
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }} 
              onMouseEnter={e => {
                e.target.style.backgroundColor = '#3b82f6';
                e.target.style.color = '#000';
              }} 
              onMouseLeave={e => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#3b82f6';
              }}
              title="Ver"
            >
              <FaEye size={14} />
            </button>
            
            <button 
              onClick={() => openModal('edit', category)} 
              style={{ 
                flex: 1, 
                backgroundColor: 'transparent', 
                border: '1px solid #F5C81B', 
                color: '#F5C81B', 
                padding: '6px 4px', 
                borderRadius: '4px', 
                fontSize: '14px', 
                fontWeight: '600', 
                cursor: 'pointer', 
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }} 
              onMouseEnter={e => {
                e.target.style.backgroundColor = '#F5C81B';
                e.target.style.color = '#000';
              }} 
              onMouseLeave={e => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#F5C81B';
              }}
              title="Editar"
            >
              <FaEdit size={14} />
            </button>
            
            <button 
              onClick={() => openDeleteModal(category)} 
              style={{ 
                flex: 1, 
                backgroundColor: 'transparent', 
                border: '1px solid #ef4444', 
                color: '#ef4444', 
                padding: '6px 4px', 
                borderRadius: '4px', 
                fontSize: '14px', 
                fontWeight: '600', 
                cursor: 'pointer', 
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }} 
              onMouseEnter={e => {
                e.target.style.backgroundColor = '#ef4444';
                e.target.style.color = '#000';
              }} 
              onMouseLeave={e => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#ef4444';
              }}
              title="Eliminar"
            >
              <FaTrash size={14} />
            </button>
          </div>
          
          <button
            onClick={() => handleToggleStatus(category.id)}
            style={{
              width: '100%',
              backgroundColor: isActive ? 'transparent' : '#F5C81B',
              border: `1px solid ${isActive ? '#F5C81B' : '#F5C81B'}`,
              color: isActive ? '#F5C81B' : '#000000',
              padding: '6px 4px',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              if (isActive) {
                e.target.style.backgroundColor = '#ef4444';
                e.target.style.borderColor = '#ef4444';
                e.target.style.color = '#000000';
              } else {
                e.target.style.backgroundColor = '#d4af37';
                e.target.style.borderColor = '#d4af37';
                e.target.style.color = '#000000';
              }
            }}
            onMouseLeave={(e) => {
              if (isActive) {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = '#F5C81B';
                e.target.style.color = '#F5C81B';
              } else {
                e.target.style.backgroundColor = '#F5C81B';
                e.target.style.borderColor = '#F5C81B';
                e.target.style.color = '#000000';
              }
            }}
            title={isActive ? 'Desactivar' : 'Activar'}
          >
            <FaBan size={14} />
            <span style={{ fontSize: '11px' }}>{isActive ? 'Desactivar' : 'Activar'}</span>
          </button>
        </div>
      </div>
    );
  };

  const Pagination = () => (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 16px',
      backgroundColor: '#000000',
      borderTop: '1px solid #222',
      fontSize: '12px',
      color: '#F5C81B',
      height: '40px',
      flexShrink: 0,
      marginTop: '12px',
    }}>
      <div>Mostrando {startItem}–{endItem} de {totalItems} categorías</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: '6px 10px',
            backgroundColor: 'transparent',
            border: '1px solid #F5C81B',
            borderRadius: '4px',
            color: currentPage === 1 ? '#6B7280' : '#F5C81B',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            fontSize: '12px',
          }}
          onMouseEnter={(e) => currentPage !== 1 && (e.target.style.backgroundColor = '#F5C81B', e.target.style.color = '#000')}
          onMouseLeave={(e) => currentPage !== 1 && (e.target.style.backgroundColor = 'transparent', e.target.style.color = '#F5C81B')}
        >
          <FaChevronLeft size={12} />
        </button>
        <span style={{ color: '#F5C81B', fontWeight: '600', fontSize: '12px' }}>
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            padding: '6px 10px',
            backgroundColor: 'transparent',
            border: '1px solid #F5C81B',
            borderRadius: '4px',
            color: currentPage === totalPages ? '#6B7280' : '#F5C81B',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            fontSize: '12px',
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

      {/* CONTENEDOR PRINCIPAL */}
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
                height: '32px' 
              }} 
              onMouseEnter={e => { e.target.style.backgroundColor = '#F5C81B'; e.target.style.color = '#000'; }}
              onMouseLeave={e => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#F5C81B'; }}
            >
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
            minHeight: '340px',
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
                height: '340px',
                backgroundColor: '#000000',
                borderRadius: '6px',
                border: '1px solid #222'
              }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#F5C81B" strokeWidth="1.5">
                  <path d="M4 5h16v14H4V5z" />
                  <path d="M9 3l3 3m3-3l-3 3" />
                </svg>
                <h3 style={{ color: '#F5C81B', margin: '16px 0 8px 0' }}>
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
                    height: '340px',
                    opacity: 0.3,
                  }}
                />
              ))
            }
          </div>
          {totalItems > 0 && <Pagination />}
        </div>
      </div>

      {/* MODALES */}
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
          maxWidth: '500px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#1e293b',
          borderRadius: '8px',
          border: '1px solid #334155',
          position: 'relative'
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
          gap: '12px',
          width: '100%',
          flex: 1,
          minHeight: 0,
          paddingBottom: '80px'
        }}>
          <div>{renderField('Nombre', 'nombre', 'text')}</div>
          <div>{renderField('Descripción', 'descripcion', 'textarea')}</div>
          <div>
            <label style={{
              fontSize: '12px',
              color: '#e2e8f0',
              fontWeight: '500',
              marginBottom: '2px',
              display: 'block'
            }}>
              URL de Imagen (opcional):
            </label>
            <input
              type="text"
              value={formData.imagenUrl || ''}
              onChange={(e) => handleInputChange('imagenUrl', e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
              style={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '8px 12px',
                color: '#f1f5f9',
                fontSize: '13px',
                width: '100%',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {formData.imagenUrl && (
              <div style={{
                marginTop: '8px',
                width: '100%',
                height: '100px',
                backgroundColor: '#000000',
                borderRadius: '6px',
                backgroundImage: `url(${formData.imagenUrl})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                border: '1px solid #334155',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
              }}>
                <span style={{ color: '#94a3b8', fontSize: '11px' }}>Vista previa</span>
              </div>
            )}
          </div>
          {modalState.mode === 'edit' && (
            <div>
              {renderField('Estado', 'estado', 'select', [
                { value: 'Activo', label: 'Activo' },
                { value: 'Inactivo', label: 'Inactivo' }
              ])}
            </div>
          )}
        </div>
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
          padding: '12px 0',
        }}>
          <button onClick={closeModal} style={{ backgroundColor:'transparent', border:'1px solid #F5C81B', color:'#F5C81B', padding:'8px 16px', borderRadius:'6px', fontSize:'13px', fontWeight:'500', cursor:'pointer', minWidth:'80px', height:'36px' }} onMouseEnter={e=>{e.target.style.backgroundColor='#F5C81B';e.target.style.color='#000'}} onMouseLeave={e=>{e.target.style.backgroundColor='transparent';e.target.style.color='#F5C81B'}}>Cancelar</button>
          <button onClick={handleSave} style={{ backgroundColor:'#F5C81B', border:'none', color:'#000', padding:'8px 16px', borderRadius:'6px', fontSize:'13px', fontWeight:'600', cursor:'pointer', minWidth:'100px', height:'36px' }} onMouseEnter={e=>{e.target.style.backgroundColor='#d4af37'}} onMouseLeave={e=>{e.target.style.backgroundColor='#F5C81B'}}>{modalState.mode === 'create' ? 'Guardar' : 'Guardar Cambios'}</button>
        </div>
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