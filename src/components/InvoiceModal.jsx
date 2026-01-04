// InvoiceModal.jsx
import React from 'react';
import jsPDF from 'jspdf';

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

  // Función para generar y descargar PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Configuración del documento
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURA', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`No. INV-${invoiceNumber}`, 105, 30, { align: 'center' });
    doc.text(`Fecha: ${date}`, 105, 35, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(businessName, 20, 50);
    doc.setFont('helvetica', 'normal');
    doc.text(businessAddress, 20, 55);
    doc.text(businessEmail, 20, 60);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Facturado a:', 20, 80);
    doc.setFont('helvetica', 'normal');
    doc.text(customerEmail, 20, 85);

    // Tabla de productos
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Producto', 20, 105);
    doc.text('Color', 70, 105);
    doc.text('Cant.', 90, 105);
    doc.text('Precio', 110, 105);
    doc.text('Total', 140, 105);

    let y = 115;
    items.forEach(item => {
      doc.setFont('helvetica', 'normal');
      doc.text(item.name, 20, y);
      doc.circle(70, y - 1, 2, 'F'); // Círculo negro para color
      doc.text(String(item.quantity), 90, y);
      doc.text(`$${item.price.toLocaleString()}`, 110, y);
      doc.text(`$${(item.price * item.quantity).toLocaleString()}`, 140, y);
      y += 10;
    });

    // Totales
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Subtotal:', 120, y);
    doc.text(`$${subtotal.toLocaleString()}`, 150, y);
    y += 10;
    doc.text('IVA (19%):', 120, y);
    doc.text(`$${tax.toLocaleString()}`, 150, y);
    y += 15;
    doc.setFontSize(14);
    doc.text('Total:', 120, y);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${total.toLocaleString()}`, 150, y);

    // Pie de página
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Gracias por tu compra. Recibirás un correo de confirmación en breve.', 20, y + 20);

    // Guardar PDF
    doc.save(`factura_${invoiceNumber}.pdf`);
  };

  // Función para imprimir
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>✅ ¡Compra Exitosa!</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p>Tu pedido ha sido procesado. Aquí está tu factura.</p>

          <div className="invoice-header">
            <div className="business-info">
              <div className="logo">GM</div>
              <div>
                <strong>{businessName}</strong><br />
                {businessAddress}<br />
                {businessEmail}
              </div>
            </div>
            <div className="invoice-details">
              <strong>FACTURA</strong><br />
              No. INV-{invoiceNumber}<br />
              Fecha: {date}
            </div>
          </div>

          <div className="customer-info">
            <strong>Facturado a:</strong><br />
            {customerEmail}
          </div>

          <table className="items-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Color</th>
                <th>Cant.</th>
                <th>Precio</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td><div className="color-dot"></div></td>
                  <td>{item.quantity}</td>
                  <td>${item.price.toLocaleString()}</td>
                  <td>${(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="totals">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
            <div className="total-row">
              <span>IVA (19%):</span>
              <span>${tax.toLocaleString()}</span>
            </div>
            <div className="total-row total-bold">
              <span>Total:</span>
              <span>${total.toLocaleString()}</span>
            </div>
          </div>

          <div className="footer-message">
            Gracias por tu compra. Recibirás un correo de confirmación en breve.
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-print" onClick={handlePrint}>
            Imprimir
          </button>
          <button className="btn-download" onClick={handleDownloadPDF}>
            📥 Descargar PDF
          </button>
          <button className="btn-close" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>

      {/* Estilos CSS incrustados */}
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: #12121a;
          border-radius: 12px;
          padding: 24px;
          width: 90%;
          max-width: 600px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
          color: white;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 1px solid #333;
          padding-bottom: 15px;
        }

        .modal-header h2 {
          color: #ffd700;
          margin: 0;
          font-size: 24px;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 24px;
          color: #aaa;
          cursor: pointer;
          transition: color 0.2s;
        }

        .close-button:hover {
          color: white;
        }

        .modal-body {
          line-height: 1.6;
        }

        .invoice-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #333;
        }

        .business-info {
          display: flex;
          gap: 15px;
          align-items: center;
        }

        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #ffd700;
          background: linear-gradient(45deg, #ffd700, #ff6f61);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .customer-info {
          margin: 20px 0;
          padding: 15px;
          background: #1e1e28;
          border-radius: 8px;
        }

        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }

        .items-table th,
        .items-table td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #333;
        }

        .items-table th {
          background: #1e1e28;
          font-weight: bold;
        }

        .color-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: black;
          display: inline-block;
        }

        .totals {
          margin-top: 20px;
          padding: 15px;
          background: #1e1e28;
          border-radius: 8px;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
        }

        .total-bold {
          font-weight: bold;
          font-size: 18px;
          color: #ffd700;
        }

        .footer-message {
          margin-top: 20px;
          padding: 15px;
          background: #1e1e28;
          border-radius: 8px;
          text-align: center;
          font-style: italic;
        }

        .modal-footer {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
          gap: 10px;
        }

        .btn-print,
        .btn-download,
        .btn-close {
          padding: 10px 15px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.2s;
        }

        .btn-print {
          background: #fff;
          color: #12121a;
        }

        .btn-print:hover {
          background: #f0f0f0;
        }

        .btn-download {
          background: #fff;
          color: #12121a;
        }

        .btn-download:hover {
          background: #f0f0f0;
        }

        .btn-close {
          background: #ffd700;
          color: #12121a;
        }

        .btn-close:hover {
          background: #ffcc00;
        }
      `}</style>
    </div>
  );
};

export default InvoiceModal;