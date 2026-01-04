import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaMinus, FaPlus, FaShoppingCart, FaTimes, FaArrowLeft } from 'react-icons/fa';
import Footer from '../components/Footer';
import jsPDF from 'jspdf';

// ✨ FACTURA MODAL MEJORADA — ESTRECHA, CON LOGO, IVA Y SCROLL
const InvoiceModal = ({ isOpen, onClose, invoiceData }) => {
  if (!isOpen) return null;

  const {
    invoiceNumber,
    date,
    customerEmail,
    items,
    subtotal,
    tax,
    total,
    businessName = "GM CAPS",
    businessAddress = "Tienda de Gorras Premium",
    businessEmail = "contacto@gmcaps.com"
  } = invoiceData;

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Título
    doc.setFontSize(18);
    doc.text("FACTURA", 105, 25, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`No. INV-${invoiceNumber}`, 105, 35, { align: 'center' });
    doc.text(`Fecha: ${date}`, 105, 42, { align: 'center' });

    // Empresa
    doc.setFontSize(14);
    doc.text(businessName, 20, 60);
    doc.setFontSize(10);
    doc.text(businessAddress, 20, 67);
    doc.text(businessEmail, 20, 74);

    // Cliente
    doc.setFontSize(12);
    doc.text("Facturado a:", 20, 90);
    doc.text(customerEmail, 20, 97);

    // Productos
    let yPos = 110;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text("Producto", 20, yPos);
    doc.text("Cant.", 90, yPos);
    doc.text("Precio", 110, yPos);
    doc.text("Total", 140, yPos);
    yPos += 8;

    items.forEach(item => {
      doc.setFont('helvetica', 'normal');
      doc.text(item.name.length > 30 ? item.name.substring(0, 30) + "..." : item.name, 20, yPos);
      doc.text(String(item.quantity), 90, yPos);
      doc.text(`$${item.price.toLocaleString()}`, 110, yPos);
      doc.text(`$${(item.price * item.quantity).toLocaleString()}`, 140, yPos);
      yPos += 7;
    });

    // Totales
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text("Subtotal:", 120, yPos);
    doc.text(`$${subtotal.toLocaleString()}`, 150, yPos);
    yPos += 7;
    doc.text("IVA (19%):", 120, yPos);
    doc.text(`$${tax.toLocaleString()}`, 150, yPos);
    yPos += 12;
    doc.setFontSize(14);
    doc.text("TOTAL:", 120, yPos);
    doc.setFontSize(16);
    doc.text(`$${total.toLocaleString()}`, 150, yPos);

    // Pie
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text("Gracias por tu compra. Recibirás un correo de confirmación.", 20, yPos + 20);

    doc.save(`factura_GMCAPS_${invoiceNumber}.pdf`);
  };

  const handlePrint = () => window.print();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.85)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000,
      padding: '15px'
    }}>
      <div style={{
        background: '#0f172a',
        color: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '450px',
        maxHeight: '85vh',
        overflowY: 'auto',
        border: '1px solid #FFC107',
        padding: '20px',
        position: 'relative'
      }}>
        {/* LOGO ARRIBA */}
        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
          <img 
            src="/logo.png" 
            alt="Logo GM CAPS" 
            style={{ 
              width: '50px', 
              height: '50px', 
              borderRadius: '6px',
              border: '1px solid #FFC107',
              objectFit: 'contain'
            }} 
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/50x50/1E293B/FFC107?text=GM    ';
            }}
          />
          <h3 style={{ 
            color: '#FFC107', 
            margin: '10px 0 0 0', 
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            ¡Compra Exitosa!
          </h3>
        </div>

        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'transparent',
            border: 'none',
            color: '#FFC107',
            fontSize: '18px',
            cursor: 'pointer',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 193, 7, 0.1)'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <FaTimes />
        </button>

        {/* Cabecera */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginBottom: '15px',
          paddingBottom: '10px',
          borderBottom: '1px solid rgba(255, 193, 7, 0.2)',
          fontSize: '12px'
        }}>
          <div>
            <div style={{ fontWeight: 'bold', color: '#FFC107' }}>{businessName}</div>
            <div>{businessAddress}</div>
            <div>{businessEmail}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 'bold' }}>FACTURA</div>
            <div>No. INV-{invoiceNumber}</div>
            <div>{date}</div>
          </div>
        </div>

        {/* Cliente */}
        <div style={{ 
          marginBottom: '15px',
          padding: '8px 0',
          borderBottom: '1px solid rgba(255, 193, 7, 0.2)',
          fontSize: '12px'
        }}>
          <strong>Facturado a:</strong> {customerEmail}
        </div>

        {/* Productos */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '6px 0', fontWeight: 'bold' }}>Producto</th>
              <th style={{ textAlign: 'center', padding: '6px 0', fontWeight: 'bold' }}>Cant.</th>
              <th style={{ textAlign: 'right', padding: '6px 0', fontWeight: 'bold' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255, 193, 7, 0.1)' }}>
                <td style={{ padding: '7px 0' }}>{item.name}</td>
                <td style={{ textAlign: 'center', padding: '7px 0' }}>{item.quantity}</td>
                <td style={{ textAlign: 'right', padding: '7px 0' }}>${(item.price * item.quantity).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totales */}
        <div style={{ marginTop: '16px', textAlign: 'right', fontSize: '13px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0' }}>
            <span>Subtotal:</span>
            <strong>${subtotal.toLocaleString()}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0' }}>
            <span>IVA (19%):</span>
            <strong>${tax.toLocaleString()}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '15px', color: '#FFC107', fontWeight: 'bold' }}>
            <span>Total:</span>
            <span>${total.toLocaleString()}</span>
          </div>
        </div>

        <div style={{ marginTop: '18px', textAlign: 'center', fontSize: '11px', color: '#aaa', fontStyle: 'italic' }}>
          Gracias por tu compra. Recibirás un correo de confirmación en breve.
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '22px' }}>
          <button
            onClick={handlePrint}
            style={{
              flex: 1,
              padding: '9px',
              backgroundColor: '#fff',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Imprimir
          </button>
          <button
            onClick={handleDownloadPDF}
            style={{
              flex: 1,
              padding: '9px',
              backgroundColor: '#fff',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            📥 PDF
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '9px',
              backgroundColor: '#FFC107',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

// ✨ MODAL DE CONFIRMACIÓN DE COMPRA
const ConfirmPurchaseModal = ({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  total, 
  subtotal, 
  tax, 
  itemCount,
  isProcessing = false 
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.85)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000,
      padding: '15px'
    }}>
      <div style={{
        background: '#0f172a',
        color: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid #FFC107',
        padding: '25px',
        position: 'relative'
      }}>
        <button
          onClick={onCancel}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'transparent',
            border: 'none',
            color: '#FFC107',
            fontSize: '18px',
            cursor: 'pointer',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 193, 7, 0.1)'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <FaTimes />
        </button>

        {/* Icono y título */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            fontSize: '40px',
            color: '#FFC107',
            marginBottom: '10px'
          }}>
            🛒
          </div>
          <h3 style={{
            color: '#FFC107',
            margin: '0 0 10px 0',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            Confirmar Compra
          </h3>
          <p style={{
            color: '#CBD5E1',
            fontSize: '14px',
            lineHeight: '1.5',
            marginBottom: '5px'
          }}>
            ¿Deseas finalizar la compra por un total de:
          </p>
          <div style={{
            color: '#FFC107',
            fontSize: '20px',
            fontWeight: 'bold',
            margin: '15px 0'
          }}>
            ${total.toLocaleString()}
          </div>
          <p style={{
            color: '#94a3b8',
            fontSize: '12px',
            fontStyle: 'italic'
          }}>
            Se generará una factura con los detalles de tu compra
          </p>
        </div>

        {/* Resumen rápido */}
        <div style={{
          backgroundColor: 'rgba(255, 193, 7, 0.05)',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '20px',
          fontSize: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Productos:</span>
            <span>{itemCount} items</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Subtotal:</span>
            <span>${subtotal.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>IVA (19%):</span>
            <span>${tax.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '5px', borderTop: '1px solid rgba(255, 193, 7, 0.2)' }}>
            <strong>Total:</strong>
            <strong>${total.toLocaleString()}</strong>
          </div>
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: 'transparent',
              border: '1px solid #666',
              borderRadius: '6px',
              color: '#CBD5E1',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.borderColor = '#FFC107';
              e.target.style.color = '#FFC107';
            }}
            onMouseOut={(e) => {
              e.target.style.borderColor = '#666';
              e.target.style.color = '#CBD5E1';
            }}
          >
            Cancelar
          </button>
          
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#FFC107',
              border: 'none',
              borderRadius: '6px',
              color: '#000',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.3s ease',
              opacity: isProcessing ? 0.7 : 1
            }}
            onMouseOver={(e) => !isProcessing && (e.target.style.backgroundColor = '#FFD700')}
            onMouseOut={(e) => !isProcessing && (e.target.style.backgroundColor = '#FFC107')}
          >
            {isProcessing ? 'Procesando...' : 'Aceptar'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ✨ COMPONENTES DE ALERTA
const CustomConfirm = ({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  title, 
  message, 
  productName,
  confirmText = "Confirmar", 
  cancelText = "Cancelar",
  type = "warning" 
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          zIndex: 9998,
          animation: 'fadeIn 0.3s ease'
        }}
        onClick={onCancel}
      />
      
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: '#030712',
        border: '1px solid #FFC107',
        borderRadius: '15px',
        padding: '25px',
        maxWidth: '450px',
        width: '90%',
        zIndex: 9999,
        animation: 'slideUp 0.4s ease'
      }}>
        <button
          onClick={onCancel}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'transparent',
            border: 'none',
            color: '#FFC107',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '5px',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 193, 7, 0.1)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          <FaTimes />
        </button>
        
        <h3 style={{
          color: '#FFC107',
          margin: '0 0 12px 0',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          textAlign: 'center',
          paddingRight: '20px'
        }}>
          {title}
        </h3>
        
        <p style={{
          color: '#CBD5E1',
          marginBottom: '5px',
          fontSize: '0.9rem',
          lineHeight: '1.4',
          textAlign: 'center'
        }}>
          {message}
        </p>

        {productName && (
          <div style={{
            margin: '15px 0 20px 0',
            textAlign: 'center'
          }}>
            <span style={{
              color: '#FFC107',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              display: 'inline',
              padding: '4px 8px',
              backgroundColor: 'rgba(255, 193, 7, 0.08)',
              borderRadius: '4px'
            }}>
              "{productName}"
            </span>
          </div>
        )}
        
        <div style={{
          display: 'flex',
          gap: '10px',
          marginTop: '20px'
        }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '10px 5px',
              backgroundColor: 'transparent',
              border: '1px solid #666',
              borderRadius: '8px',
              color: '#CBD5E1',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.85rem',
              transition: 'all 0.3s ease',
              minHeight: '40px'
            }}
            onMouseOver={(e) => {
              e.target.style.borderColor = '#FFC107';
              e.target.style.color = '#FFC107';
            }}
            onMouseOut={(e) => {
              e.target.style.borderColor = '#666';
              e.target.style.color = '#CBD5E1';
            }}
          >
            {cancelText}
          </button>
          
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '10px 5px',
              backgroundColor: type === "warning" ? '#FFC107' : '#ff4d4d',
              border: 'none',
              borderRadius: '8px',
              color: '#000',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.85rem',
              transition: 'all 0.3s ease',
              minHeight: '40px'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = type === "warning" ? '#FFD700' : '#ff6b6b';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = type === "warning" ? '#FFC107' : '#ff4d4d';
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, -40%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </>
  );
};

const CenterAlert = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        zIndex: 10000,
        animation: 'fadeIn 0.3s ease'
      }} />
      
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: '#030712',
        border: '1px solid #4CAF50',
        borderRadius: '15px',
        padding: '25px',
        maxWidth: '350px',
        width: '90%',
        textAlign: 'center',
        zIndex: 10001,
        animation: 'slideUp 0.4s ease'
      }}>
        <div style={{
          fontSize: '2rem',
          marginBottom: '12px',
          color: '#4CAF50'
        }}>
          ✓
        </div>
        
        <h3 style={{
          color: '#4CAF50',
          margin: '0 0 8px 0',
          fontSize: '1.1rem',
          fontWeight: 'bold'
        }}>
          ¡Éxito!
        </h3>
        
        <p style={{
          color: '#CBD5E1',
          marginBottom: '15px',
          fontSize: '0.9rem',
          lineHeight: '1.4'
        }}>
          {message}
        </p>
        
        <div style={{
          fontSize: '0.8rem',
          color: '#666',
          fontStyle: 'italic'
        }}>
          Esta alerta se cerrará automáticamente...
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, -40%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </>
  );
};

// ✨ COMPONENTE PRINCIPAL
const Cart = ({ cartItems = [], updateCart, user }) => {
  const [centerAlert, setCenterAlert] = useState({ visible: false, message: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [productToDeleteName, setProductToDeleteName] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);
  const [showConfirmPurchase, setShowConfirmPurchase] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const navigate = useNavigate();

  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

  // Funciones auxiliares
  const handleRemoveFromCart = (productId, productName) => {
    setItemToDelete(productId);
    setProductToDeleteName(productName);
    setShowDeleteConfirm(true);
  };

  const confirmRemoveFromCart = () => {
    const newCart = safeCartItems.filter(item => item.id !== itemToDelete);
    updateCart(newCart);
    setShowDeleteConfirm(false);
    setItemToDelete(null);
    setProductToDeleteName('');
    setCenterAlert({ visible: true, message: 'Producto eliminado con éxito' });
  };

  const updateQuantity = (productId, change) => {
    const newCart = safeCartItems.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    updateCart(newCart);
  };

  const handleClearCart = () => setShowClearConfirm(true);

  const confirmClearCart = () => {
    updateCart([]);
    setShowClearConfirm(false);
    setCenterAlert({ visible: true, message: 'Carrito vaciado con éxito' });
  };

  const calculateTotals = () => {
    if (safeCartItems.length === 0) return { subtotal: 0, total: 0, tax: 0 };
    const subtotal = safeCartItems.reduce((sum, item) => {
      const precio = Number(item.precio ?? item.price ?? item.originalPrice ?? 0);
      return sum + (precio * (item.quantity || 1));
    }, 0);
    const tax = Math.round(subtotal * 0.19);
    return { subtotal, tax, total: subtotal + tax };
  };

  const { subtotal, tax, total } = calculateTotals();

  const getImageUrl = (item) => {
    if (item.imagen && item.imagen.trim() !== '') return item.imagen;
    if (item.imagenes?.[0]) return item.imagenes[0];
    if (item.image && item.image.trim() !== '') return item.image;
    return 'https://via.placeholder.com/80x80/1E293B/FFC107?text=GM    ';
  };

  const getProductName = (item) => item.nombre?.trim() || item.name?.trim() || 'Producto sin nombre';
  const getProductPrice = (item) => Number(item.precio ?? item.price ?? item.originalPrice ?? 0);
  const getProductCategory = (item) => item.categoria?.trim() || item.category?.trim() || 'Sin categoría';
  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/80x80/1E293B/FFC107?text=GM    ';
    e.target.alt = 'Imagen no disponible';
  };

  // Mostrar confirmación de compra
  const handleFinishPurchase = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setShowConfirmPurchase(true);
  };

  // Confirmar la compra (usuario presiona Aceptar)
  const confirmPurchase = () => {
    setIsProcessing(true);
    setShowConfirmPurchase(false);

    setTimeout(() => {
      setIsProcessing(false);

      const invoice = {
        invoiceNumber: Date.now().toString(),
        date: new Date().toLocaleDateString('es-ES'),
        customerEmail: user.email || 'cliente@anonimo.com',
        items: safeCartItems.map(item => ({
          name: getProductName(item),
          quantity: item.quantity || 1,
          price: getProductPrice(item)
        })),
        subtotal: subtotal,
        tax: tax,
        total: total
      };

      setInvoiceData(invoice);
      setShowInvoice(true);
    }, 1500);
  };

  // Cancelar la compra (usuario presiona Cancelar)
  const cancelPurchase = () => {
    setShowConfirmPurchase(false);
  };

  const closeInvoice = () => {
    setShowInvoice(false);
    updateCart([]);
    setCenterAlert({ visible: true, message: '¡Compra realizada con éxito!' });
  };

  // Renderizado: Carrito vacío — SIN CUADRO, SOLO TEXTO BONITO
  if (safeCartItems.length === 0) {
    return (
      <div style={{ 
        background: '#031326', 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column' 
      }}>
        {/* Banner fijo arriba */}
        <section style={{ 
          background: "#031326", 
          padding: "100px 20px 70px", 
          textAlign: "center", 
          borderBottomLeftRadius: "30px", 
          borderBottomRightRadius: "30px", 
          position: "relative", 
          overflow: "hidden" 
        }}>
          <div style={{ position: "absolute", top: "-40px", left: 0, width: "100%", height: "80px", background: "#FFFF" }} />
          <h1 style={{ color: "white", fontSize: "3rem", fontWeight: "700", marginBottom: "20px" }}>🛒 Carrito de Compras</h1>
          <p style={{ color: "#cbd5e1", fontSize: "1.2rem", maxWidth: "900px", margin: "0 auto", lineHeight: "1.6" }}>Gestiona todos tus productos seleccionados en un solo lugar.</p>
          <div style={{ position: "absolute", bottom: "-40px", left: 0, width: "100%", height: "80px", background: "#030712", borderTopLeftRadius: "50% 80%", borderTopRightRadius: "50% 80%" }} />
        </section>

        {/* Contenido central - SIN CUADRO */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          padding: '40px 20px',
          backgroundColor: '#030712'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '30px 20px',
            maxWidth: '500px',
            width: '100%'
          }}>
            <div style={{
              fontSize: '40px',
              color: '#FFC107',
              marginBottom: '20px'
            }}>
              🛒
            </div>
            <h2 style={{
              color: '#FFC107',
              fontSize: '24px',
              marginBottom: '15px',
              fontWeight: 'bold'
            }}>
              Tu carrito está vacío
            </h2>
            <p style={{
              color: '#CBD5E1',
              fontSize: '16px',
              marginBottom: '20px',
              lineHeight: '1.6'
            }}>
              Agrega productos desde la tienda para verlos aquí
            </p>
            <Link to="/" style={{
              backgroundColor: '#FFC107',
              padding: '12px 24px',
              color: '#000',
              fontWeight: 'bold',
              borderRadius: '8px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '16px',
              border: 'none',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#FFD700'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#FFC107'}>
              <FaShoppingCart /> Ir a la Tienda
            </Link>
          </div>
        </div>

        {/* Footer siempre abajo */}
        <div style={{ 
          marginTop: 'auto',
          paddingTop: '20px',
          paddingBottom: '20px'
        }}>
          <Footer />
        </div>
      </div>
    );
  }

  // Renderizado: Carrito con productos
  return (
    <div style={{ 
      background: '#030712', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      {/* Modales */}
      <CustomConfirm isOpen={showClearConfirm} onConfirm={confirmClearCart} onCancel={() => setShowClearConfirm(false)} title="¿Vaciar carrito?" message="¿Estás seguro que deseas eliminar todos los productos del carrito? Esta acción no se puede deshacer." confirmText="Vaciar Carrito" cancelText="Cancelar" type="warning" />
      <CustomConfirm isOpen={showDeleteConfirm} onConfirm={confirmRemoveFromCart} onCancel={() => { setShowDeleteConfirm(false); setItemToDelete(null); setProductToDeleteName(''); }} title="¿Eliminar producto?" message="¿Estás seguro que deseas eliminar este producto del carrito?" productName={productToDeleteName} confirmText="Eliminar" cancelText="Cancelar" type="warning" />
      <CenterAlert message={centerAlert.message} isVisible={centerAlert.visible} onClose={() => setCenterAlert({ visible: false, message: '' })} />
      
      {/* Modal de confirmación de compra */}
      <ConfirmPurchaseModal 
        isOpen={showConfirmPurchase} 
        onConfirm={confirmPurchase} 
        onCancel={cancelPurchase} 
        total={total} 
        subtotal={subtotal} 
        tax={tax} 
        itemCount={safeCartItems.length}
        isProcessing={isProcessing} 
      />
      
      {/* ✅ FACTURA MODAL — YA ESTÁ BIEN POSICIONADO */}
      {showInvoice && invoiceData && (
        <InvoiceModal 
          isOpen={showInvoice} 
          onClose={closeInvoice} 
          invoiceData={invoiceData} 
        />
      )}

      {/* Banner fijo arriba */}
      <section style={{ background: "#031326", padding: "100px 20px 70px", textAlign: "center", borderBottomLeftRadius: "30px", borderBottomRightRadius: "30px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-40px", left: 0, width: "100%", height: "80px", background: "#FFFF" }} />
        <h1 style={{ color: "white", fontSize: "3rem", fontWeight: "700", marginBottom: "20px" }}>🛒 Carrito de Compras</h1>
        <p style={{ color: "#cbd5e1", fontSize: "1.2rem", maxWidth: "900px", margin: "0 auto", lineHeight: "1.6" }}>Gestiona todos tus productos seleccionados en un solo lugar.</p>
        <div style={{ position: "absolute", bottom: "-40px", left: 0, width: "100%", height: "80px", background: "#030712", borderTopLeftRadius: "50% 80%", borderTopRightRadius: "50% 80%" }} />
      </section>

      {/* ✅ Contenido SCROLLEABLE, pero sin mover el footer */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden' 
      }}>
        <div style={{ 
          padding: '40px 20px 20px', 
          maxWidth: '1200px', 
          margin: '0 auto', 
          width: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          overflowY: 'auto', 
          flex: 1
        }}>
          <div style={{ 
            display: 'flex', 
            gap: '20px', 
            flexWrap: 'wrap', 
            justifyContent: 'center'
          }}>
            {/* Productos */}
            <div style={{ flex: 1, minWidth: '300px', maxWidth: '700px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 style={{ color: '#FFC107', fontSize: '16px', margin: 0 }}>Productos seleccionados ({safeCartItems.length})</h2>
                <button onClick={handleClearCart} style={{ background: 'transparent', border: '1px solid #ff4d4d', color: '#ff4d4d', cursor: 'pointer', padding: '6px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                  <FaTrash /> Vaciar carrito
                </button>
              </div>

              {safeCartItems.map((item, index) => {
                const precio = getProductPrice(item);
                const quantity = item.quantity || 1;
                const itemTotal = precio * quantity;
                const productName = getProductName(item);
                
                return (
                  <div key={index} style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255, 193, 7, 0.4)', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                    <img src={getImageUrl(item)} alt={productName} style={{ width: '80px', height: '80px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #FFC107' }} onError={handleImageError} />
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 5px 0', color: '#FFC107', fontSize: '14px', fontWeight: 'bold' }}>{productName}</h3>
                      <div style={{ display: 'flex', gap: '5px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '10px', color: '#CBD5E1', backgroundColor: 'rgba(30, 41, 59, 0.7)', padding: '2px 6px', borderRadius: '8px' }}>{getProductCategory(item)}</span>
                        {item.color && <span style={{ fontSize: '10px', color: '#CBD5E1', backgroundColor: 'rgba(30, 41, 59, 0.7)', padding: '2px 6px', borderRadius: '8px' }}>Color: {item.color}</span>}
                        {item.talla && <span style={{ fontSize: '10px', color: '#CBD5E1', backgroundColor: 'rgba(30, 41, 59, 0.7)', padding: '2px 6px', borderRadius: '8px' }}>Talla: {item.talla}</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '11px', color: '#ccc' }}>Cantidad:</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <button onClick={() => updateQuantity(item.id, -1)} style={{ width: '22px', height: '22px', borderRadius: '4px', backgroundColor: 'transparent', border: '1px solid #FFC107', color: '#FFC107', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}><FaMinus /></button>
                            <span style={{ minWidth: '20px', textAlign: 'center', fontSize: '13px', color: '#FFFFFF', fontWeight: 'bold' }}>{quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} style={{ width: '22px', height: '22px', borderRadius: '4px', backgroundColor: 'transparent', border: '1px solid #FFC107', color: '#FFC107', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}><FaPlus /></button>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ color: '#FFC107', fontWeight: 'bold', margin: '0 0 2px 0', fontSize: '12px' }}>${precio.toLocaleString()} c/u</p>
                          <p style={{ color: '#FFC107', fontWeight: 'bold', margin: 0, fontSize: '14px' }}>${itemTotal.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleRemoveFromCart(item.id, productName)} style={{ background: 'transparent', border: '1px solid #ff4d4d', color: '#ff4d4d', cursor: 'pointer', padding: '5px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', fontWeight: 'bold', transition: 'all 0.3s ease', alignSelf: 'flex-start' }} onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 77, 77, 0.1)'} onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}><FaTrash /></button>
                  </div>
                );
              })}
            </div>

            {/* Resumen */}
            <div style={{ width: '320px', minWidth: '320px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255, 193, 7, 0.4)', padding: '15px', borderRadius: '10px', display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
                <h2 style={{ color: '#FFC107', margin: '0 0 12px 0', textAlign: 'center', fontSize: '15px', fontWeight: 'bold' }}>Resumen del Pedido</h2>
                
                <div style={{ marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid rgba(255, 193, 7, 0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#ccc', fontSize: '11px' }}>Productos:</span>
                    <span style={{ color: '#FFFFFF', fontSize: '11px' }}>{safeCartItems.length} items</span>
                  </div>
                  {safeCartItems.slice(0, 3).map((item, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '10px', color: '#CBD5E1' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px', paddingRight: '5px' }}>• {getProductName(item)} x{item.quantity || 1}</span>
                      <span style={{ color: '#FFC107', fontWeight: 'bold', whiteSpace: 'nowrap' }}>${(getProductPrice(item) * (item.quantity || 1)).toLocaleString()}</span>
                    </div>
                  ))}
                  {safeCartItems.length > 3 && <div style={{ fontSize: '10px', color: '#CBD5E1', textAlign: 'center', marginTop: '3px' }}>Y {safeCartItems.length - 3} productos más...</div>}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
                  <span style={{ color: '#ccc' }}>Subtotal:</span>
                  <span style={{ color: '#FFFFFF', fontWeight: 'bold' }}>${subtotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
                  <span style={{ color: '#ccc' }}>IVA (19%):</span>
                  <span style={{ color: '#FFC107', fontWeight: 'bold' }}>${tax.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
                  <span style={{ color: '#ccc' }}>Envío:</span>
                  <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>GRATIS</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(255, 193, 7, 0.2)', fontSize: '14px' }}>
                  <strong style={{ color: '#FFC107' }}>Total:</strong>
                  <strong style={{ color: '#FFC107', fontSize: '16px' }}>${total.toLocaleString()}</strong>
                </div>

                {/* ✅ SOLO BOTÓN FINALIZAR COMPRA */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
                  <button
                    onClick={handleFinishPurchase}
                    style={{
                      width: '100%',
                      padding: '10px',
                      backgroundColor: '#FFC107',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '13px',
                      color: '#000',
                      transition: 'all 0.3s ease',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#FFD700'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#FFC107'}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Procesando...' : 'Finalizar Compra'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ BOTÓN "SEGUIR COMPRANDO" - CENTRADO Y ARRIBA DEL FOOTER */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '20px 0',
          backgroundColor: '#030712'
        }}>
          <Link
            to="/"
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              border: '1px solid #FFC107',
              borderRadius: '6px',
              fontWeight: 'bold',
              textAlign: 'center',
              color: '#FFC107',
              textDecoration: 'none',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 193, 7, 0.1)'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <FaArrowLeft style={{ fontSize: '12px' }} /> Seguir Comprando
          </Link>
        </div>

        {/* ✅ FOOTER SIEMPRE ABAJO */}
        <div style={{ 
          marginTop: 'auto',
          paddingTop: '20px',
          paddingBottom: '20px'
        }}>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Cart;