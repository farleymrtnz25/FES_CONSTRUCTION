import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Cabecera corporativa reutilizable para todos los documentos PDF de F.E.S. Construcción
const drawCorporateHeader = (doc, subTitle) => {
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, 210, 42, 'F');

  doc.setFillColor(234, 88, 12); // Orange FES
  doc.rect(0, 40, 210, 2.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('F.E.S. CONSTRUCCIÓN — LADRILLERA SAN LUIS', 14, 19);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(subTitle || 'Materiales de Ingeniería & Arcillas Estructurales Certificadas NSR-10', 14, 27);
  doc.text('Vereda Patio Bonito, Nemocón | Tel: +57 320 821 6369 | Correo: frlmrtnz@gmail.com', 14, 34);
};

// 1. GENERADOR DE RECIBO / FACTURA DE COMPRA INDIVIDUAL
export const generateInvoicePDF = ({ pedidoId, cliente, productos = [], total, metodoPago, fecha, estado }) => {
  const doc = new jsPDF();
  const fechaStr = fecha ? new Date(fecha).toLocaleString('es-CO') : new Date().toLocaleString('es-CO');

  drawCorporateHeader(doc, 'Comprobante Oficial de Orden de Compra y Despacho de Materiales');

  // Título y Metadatos del Recibo
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(`RECIBO DE COMPRA / ORDEN #${pedidoId || 'COT-001'}`, 14, 54);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Fecha de emisión: ${fechaStr}`, 14, 61);
  doc.text(`Método de Pago: ${metodoPago || 'WhatsApp / Contraentrega'}`, 14, 67);
  if (estado) {
    doc.text(`Estado de la Orden: ${estado}`, 130, 61);
  }

  // Caja de Datos del Cliente
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 73, 182, 28, 3, 3, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('DATOS DEL CLIENTE / DESTINO DE OBRA:', 19, 81);

  doc.setFont('helvetica', 'normal');
  const nombreCliente = cliente?.nombre || 'Cliente F.E.S. Construcción';
  const telCliente = cliente?.telefono || 'No especificado';
  const dirCliente = cliente?.direccion || 'Vereda Patio Bonito / Sabana';
  const ciudadCliente = cliente?.ciudad || 'Cundinamarca';

  doc.text(`Cliente: ${nombreCliente}`, 19, 88);
  doc.text(`Teléfono: ${telCliente}`, 19, 95);
  doc.text(`Dirección: ${dirCliente.slice(0, 42)}`, 105, 88);
  doc.text(`Ciudad/Municipio: ${ciudadCliente}`, 105, 95);

  // Normalizar productos (soporta formato carrito o formato detalle_pedido de BD)
  const normalizedItems = (productos || []).map((p, idx) => {
    const nombre = p.nombre || p.nombre_producto || 'Material de Construcción';
    const medidas = p.medidas || 'Estándar';
    const cantidad = Number(p.cantidad) || 1;
    const precio = Number(p.precio ?? p.precio_unitario ?? 0);
    const subtotal = Number(p.subtotal ?? cantidad * precio);
    return [
      idx + 1,
      nombre,
      medidas,
      cantidad.toLocaleString('es-CO'),
      `$${precio.toLocaleString('es-CO')} COP`,
      `$${subtotal.toLocaleString('es-CO')} COP`
    ];
  });

  autoTable(doc, {
    startY: 107,
    head: [['#', 'Material / Referencia', 'Medidas', 'Cantidad', 'Precio Unit.', 'Subtotal']],
    body: normalizedItems.length > 0
      ? normalizedItems
      : [[1, 'Materiales según orden registrada', 'Estándar', '1', `$${Number(total || 0).toLocaleString('es-CO')} COP`, `$${Number(total || 0).toLocaleString('es-CO')} COP`]],
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
      3: { cellWidth: 24, halign: 'center' },
      4: { cellWidth: 34, halign: 'right' },
      5: { cellWidth: 38, halign: 'right' }
    }
  });

  const finalY = (doc.lastAutoTable?.finalY || 140) + 10;

  // Caja de Total
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(234, 88, 12);
  doc.roundedRect(112, finalY, 84, 26, 2, 2, 'FD');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('TOTAL LIQUIDADO:', 118, finalY + 10);

  doc.setFontSize(13.5);
  doc.setTextColor(234, 88, 12);
  doc.text(`$${Number(total || 0).toLocaleString('es-CO')} COP`, 118, finalY + 20);

  // Notas de Garantía
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  doc.text('Nota: Presente este recibo digital o impreso para retiro en planta o recepción de viaje en obra.', 14, finalY + 38);
  doc.text('Materiales estructurales de arcilla cocida certificados bajo Norma Sismorresistente NSR-10.', 14, finalY + 44);

  doc.save(`Recibo-FES-Orden-${pedidoId || 'compra'}.pdf`);
};

// 2. EXPORTAR REPORTE DE PEDIDOS (ADMIN) EN PDF
export const exportOrdersReportPDF = (orders = [], filtroLabel = 'Todos los registros') => {
  const doc = new jsPDF('landscape');
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 297, 36, 'F');
  doc.setFillColor(234, 88, 12);
  doc.rect(0, 34, 297, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('F.E.S. CONSTRUCCIÓN — REPORTE DE GESTIÓN DE PEDIDOS', 14, 16);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`Filtro aplicado: ${filtroLabel} | Emitido: ${new Date().toLocaleString('es-CO')}`, 14, 25);

  const totalIngresos = orders
    .filter(o => o.estado !== 'Cancelado')
    .reduce((acc, o) => acc + Number(o.total || 0), 0);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Órdenes en listado: ${orders.length}   |   Ingresos Acumulados (activos): $${totalIngresos.toLocaleString('es-CO')} COP`, 14, 45);

  const rows = orders.map(o => [
    `#${o.id}`,
    new Date(o.creado_en).toLocaleString('es-CO'),
    o.cliente_nombre || 'Cliente Obra',
    o.telefono || 'N/A',
    (o.direccion_envio || 'Planta / Sabana').slice(0, 35),
    (o.detalle || []).map(d => `${d.cantidad}x ${d.nombre_producto}`).join(', ').slice(0, 50) || 'Varios',
    o.metodo_pago || 'WhatsApp',
    o.estado || 'Pendiente',
    `$${Number(o.total || 0).toLocaleString('es-CO')}`
  ]);

  autoTable(doc, {
    startY: 50,
    head: [['# Orden', 'Fecha y Hora', 'Cliente', 'Teléfono', 'Destino', 'Materiales', 'Pago', 'Estado', 'Total (COP)']],
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 2.5 }
  });

  doc.save(`FES-Reporte-Pedidos-${new Date().toISOString().slice(0, 10)}.pdf`);
};

// 3. EXPORTAR REPORTE DE VENTAS CATEGORIZADO (DÍA / MES / AÑO) EN PDF
export const exportSalesReportPDF = ({ groupedRows = [], orders = [], groupLabel = 'Por Día', filtroLabel = 'General' }) => {
  const doc = new jsPDF();
  drawCorporateHeader(doc, 'Reporte Gerencial de Ventas y Facturación Categorizado');

  const totalVentas = orders
    .filter(o => o.estado !== 'Cancelado')
    .reduce((acc, o) => acc + Number(o.total || 0), 0);
  const totalOrdenes = orders.filter(o => o.estado !== 'Cancelado').length;

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(`REPORTE DE VENTAS (${groupLabel.toUpperCase()})`, 14, 53);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Periodo / Filtro: ${filtroLabel} | Generado: ${new Date().toLocaleString('es-CO')}`, 14, 60);
  doc.setFont('helvetica', 'bold');
  doc.text(`Órdenes Efectivas: ${totalOrdenes}   |   Facturación Total: $${totalVentas.toLocaleString('es-CO')} COP`, 14, 67);

  // Tabla 1: Resumen Agrupado por Día, Mes o Año
  autoTable(doc, {
    startY: 73,
    head: [[`Periodo (${groupLabel})`, 'Cantidad de Pedidos', 'Ingresos Facturados (COP)']],
    body: groupedRows.map(r => [
      r.periodo,
      r.pedidos.toString(),
      `$${Number(r.ingresos || 0).toLocaleString('es-CO')} COP`
    ]),
    theme: 'grid',
    headStyles: { fillColor: [234, 88, 12], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 3 }
  });

  const nextY = (doc.lastAutoTable?.finalY || 110) + 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Detalle de Órdenes del Periodo:', 14, nextY);

  autoTable(doc, {
    startY: nextY + 4,
    head: [['# Orden', 'Fecha', 'Cliente', 'Método Pago', 'Estado', 'Total (COP)']],
    body: orders.map(o => [
      `#${o.id}`,
      new Date(o.creado_en).toLocaleString('es-CO'),
      o.cliente_nombre || 'Cliente Directo',
      o.metodo_pago || 'WhatsApp',
      o.estado || 'Pendiente',
      `$${Number(o.total || 0).toLocaleString('es-CO')} COP`
    ]),
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
    styles: { fontSize: 8.5, cellPadding: 2.5 }
  });

  doc.save(`FES-Reporte-Ventas-${groupLabel.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`);
};

// 4. EXPORTAR HISTORIAL DE ENTRADAS Y SALIDAS DE INVENTARIO EN PDF
export const exportInventoryMovementsPDF = (movements = [], filtroLabel = 'Todos los movimientos') => {
  const doc = new jsPDF();
  drawCorporateHeader(doc, 'Auditoría de Movimientos de Inventario (Entradas y Salidas de Patio)');

  const totalEntradas = movements
    .filter(m => m.tipo === 'entrada')
    .reduce((acc, m) => acc + Number(m.cantidad || 0), 0);
  const totalSalidas = movements
    .filter(m => m.tipo === 'salida')
    .reduce((acc, m) => acc + Number(m.cantidad || 0), 0);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('HISTORIAL DE ENTRADAS Y SALIDAS DE PATIO', 14, 53);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Filtro: ${filtroLabel} | Emitido: ${new Date().toLocaleString('es-CO')}`, 14, 60);
  doc.setFont('helvetica', 'bold');
  doc.text(`Movimientos: ${movements.length}  |  Total Entradas: +${totalEntradas.toLocaleString('es-CO')} unid.  |  Total Salidas: -${totalSalidas.toLocaleString('es-CO')} unid.`, 14, 67);

  autoTable(doc, {
    startY: 73,
    head: [['ID', 'Fecha y Hora', 'Tipo', 'Material / Producto', 'Cantidad', 'Nota / Concepto']],
    body: movements.map(m => [
      `#${m.id}`,
      new Date(m.fecha).toLocaleString('es-CO'),
      (m.tipo || '').toUpperCase(),
      m.nombre_producto || 'Material',
      `${m.tipo === 'entrada' ? '+' : '-'}${Number(m.cantidad || 0).toLocaleString('es-CO')} unid.`,
      m.nota || 'Control de patio'
    ]),
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 3 }
  });

  doc.save(`FES-Historial-Inventario-${new Date().toISOString().slice(0, 10)}.pdf`);
};

// 5. EXPORTAR CUALQUIER TABLA A EXCEL (CSV CON BOM UTF-8)
export const exportToCSV = (filename, headers = [], rows = []) => {
  const escapeCSV = (val) => {
    const str = String(val ?? '').replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(escapeCSV).join(';'),
    ...rows.map(row => row.map(escapeCSV).join(';'))
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
