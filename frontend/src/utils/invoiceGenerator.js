import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const fmt = n => n.toLocaleString('es-CO');

export const generateInvoicePDF = (order, user, items) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // -- Header Section --
    doc.setFontSize(22);
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURA ELECTRÓNICA DE VENTA', 14, 25);

    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');
    doc.text('Tu Proyecto S.A.S.', 14, 32);
    doc.text('NIT: 900.234.567-8 — Régimen Común', 14, 37);
    doc.text('Calle 123 # 45 - 67, Bogotá, Colombia', 14, 42);
    doc.text('Tel: +57 320 821 6369 | Email: contacto@tuproyecto.com', 14, 47);

    // -- Resolution Info --
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text('Resolución DIAN No. 18760000001 de 2026-01-01', 14, 55);
    doc.text('Numeración Autorizada de FE-1 hasta FE-10000', 14, 59);

    // -- Order Info (Right Box) --
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'bold');
    doc.text(`No. FACTURA: FE-${order.id}`, pageWidth - 14, 25, { align: 'right' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const fecha = order.fecha ? new Date(order.fecha) : new Date();
    doc.text(`Fecha Emisión: ${fecha.toLocaleDateString('es-CO')}`, pageWidth - 14, 32, { align: 'right' });
    doc.text(`Fecha Vencimiento: ${fecha.toLocaleDateString('es-CO')}`, pageWidth - 14, 37, { align: 'right' });
    doc.text(`Forma de Pago: Contado`, pageWidth - 14, 42, { align: 'right' });
    doc.text(`Medio de Pago: ${order.metodo_pago}`, pageWidth - 14, 47, { align: 'right' });

    // -- Customer Info Section --
    doc.setDrawColor(230, 230, 230);
    doc.line(14, 65, pageWidth - 14, 65);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('ADQUIRIENTE:', 14, 75);

    doc.setFont('helvetica', 'normal');
    doc.text(`Nombre/Razón Social: ${user?.nombre || 'Consumidor Final'}`, 14, 82);
    doc.text(`NIT/CC: ${user?.id || '222222222222'}`, 14, 87);
    doc.text(`Tipo de Persona: ${order.tipo_persona || 'Natural'}`, 14, 92);
    doc.text(`Email: ${user?.email || 'N/A'}`, 14, 97);

    // -- Items Table --
    const tableRows = items.map(item => [
        item.id,
        item.nombre,
        `$${fmt(item.precio)}`,
        item.quantity,
        `$${fmt(item.precio * item.quantity)}`
    ]);

    autoTable(doc, {
        startY: 105,
        head: [['ID', 'Descripción del Producto', 'V. Unitario', 'Cant.', 'Total']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [40, 40, 40], textColor: 255, fontSize: 8, fontStyle: 'bold' },
        styles: { fontSize: 8 },
        columnStyles: {
            0: { cellWidth: 15 },
            1: { cellWidth: 'auto' },
            2: { halign: 'right' },
            3: { halign: 'center' },
            4: { halign: 'right' }
        }
    });

    let finalY = doc.lastAutoTable.finalY + 10;

    // -- Totals Section --
    const rightX = pageWidth - 14;
    doc.setFontSize(9);

    const subtotal = order.subtotal || order.total;

    const totalsData = [
        ['Subtotal:', `$${fmt(subtotal)}`],
        ['IVA:', 'No aplica – Art. 424 E.T.'],
        ['TOTAL:', `$${fmt(order.total)}`]
    ];

    totalsData.forEach((row, i) => {
        const isTotal = i === 2;
        doc.setFont('helvetica', isTotal ? 'bold' : 'normal');
        if (isTotal) doc.setFontSize(12);
        else if (i === 1) { doc.setFontSize(8); doc.setTextColor(120, 120, 120); }
        else { doc.setFontSize(9); doc.setTextColor(40, 40, 40); }
        doc.text(row[0], rightX - 60, finalY + (i * 7));
        doc.text(row[1], rightX, finalY + (i * 7), { align: 'right' });
    });

    // Reset color
    doc.setTextColor(40, 40, 40);

    // -- Electronic Invoice Details (Bottom) --
    finalY += 40;

    // CUFE Mock
    const cufe = Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text('CUFE:', 14, finalY);
    doc.setFont('helvetica', 'normal');
    doc.text(cufe, 25, finalY);

    // Mock QR Code Area
    doc.setDrawColor(0);
    doc.rect(14, finalY + 5, 30, 30);
    doc.setFontSize(6);
    doc.text('MOCK QR CODE', 16, finalY + 22);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Representación gráfica de factura electrónica.', 50, finalY + 15);
    doc.text('Software de facturación: TuProyecto FE v1.0', 50, finalY + 20);

    // -- Footer --
    doc.setTextColor(150, 150, 150);
    doc.text('Esta factura se asimila en todos sus efectos a una letra de cambio según el Art. 774 del Código de Comercio.', pageWidth / 2, pageHeight - 15, { align: 'center' });

    doc.save(`Factura_FE_${order.id}.pdf`);
};
