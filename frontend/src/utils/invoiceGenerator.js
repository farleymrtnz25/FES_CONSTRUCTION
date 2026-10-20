import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const generateInvoicePDF = ({ pedidoId, cliente, productos, total, metodoPago, fecha }) => {
  const doc = new jsPDF();
  const fechaStr = fecha ? new Date(fecha).toLocaleString('es-CO') : new Date().toLocaleString('es-CO');

  // Header Banner
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, 210, 42, 'F');

  doc.setFillColor(234, 88, 12); // Orange FES
  doc.rect(0, 40, 210, 2.5, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('F.E.S. CONSTRUCCIÓN', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text('Materiales de Ingeniería & Arcillas de Alta Resistencia', 14, 27);
  doc.text('Vereda Patio Bonito | Tel: +57 320 821 6369 | Correo: frlmrtnz@gmail.com', 14, 34);

  // Invoice Meta
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`ORDEN DE COMPRA #${pedidoId || 'COT-001'}`, 14, 55);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Fecha de emisión: ${fechaStr}`, 14, 62);
  doc.text(`Forma de Pago: ${metodoPago || 'WhatsApp / Contraentrega'}`, 14, 68);

  // Client Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 74, 182, 30, 3, 3, 'F');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('DATOS DEL CLIENTE / RECEPTOR:', 20, 82);

  doc.setFont('helvetica', 'normal');
  doc.text(`Nombre: ${cliente?.nombre || 'Cliente General'}`, 20, 89);
  doc.text(`Teléfono: ${cliente?.telefono || 'No especificado'}`, 20, 95);
  doc.text(`Dirección / Obra: ${cliente?.direccion || 'Vereda Patio Bonito / Despacho'}`, 105, 89);
  doc.text(`Ciudad: ${cliente?.ciudad || 'Cundinamarca'}`, 105, 95);

  // Items Table
  const tableData = productos.map((p, idx) => [
    idx + 1,
    p.nombre,
    p.medidas || 'Estándar',
    Number(p.cantidad).toLocaleString('es-CO'),
    `$${Number(p.precio).toLocaleString('es-CO')} COP`,
    `$${(Number(p.cantidad) * Number(p.precio)).toLocaleString('es-CO')} COP`
  ]);

  doc.autoTable({
    startY: 110,
    head: [['#', 'Material / Producto', 'Especificación', 'Cantidad', 'Precio Unit.', 'Subtotal']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3.5
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      3: { cellWidth: 25, halign: 'center' },
      4: { cellWidth: 32, halign: 'right' },
      5: { cellWidth: 36, halign: 'right' }
    }
  });

  const finalY = doc.lastAutoTable.finalY + 12;

  // Total Summary Box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(115, finalY, 81, 28, 2, 2, 'F');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('TOTAL A PAGAR:', 122, finalY + 11);

  doc.setFontSize(14);
  doc.setTextColor(234, 88, 12); // Orange FES
  doc.text(`$${Number(total).toLocaleString('es-CO')} COP`, 122, finalY + 21);

  // Footnote & Warranty
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  doc.text('Nota técnica: El descargue en obra se coordina según accesibilidad para tractomula o volqueta.', 14, finalY + 45);
  doc.text('Materiales certificados conforme a la Norma Sismorresistente NSR-10.', 14, finalY + 50);

  // Save PDF
  doc.save(`FES-Pedido-${pedidoId || 'orden'}.pdf`);
};
