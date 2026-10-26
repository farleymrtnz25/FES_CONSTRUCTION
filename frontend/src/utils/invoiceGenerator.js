import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper compatible con Web y Aplicación Móvil Android (Capacitor WebView)
const savePDFDocument = (doc, fileName) => {
  try {
    if (typeof window !== 'undefined' && window.AndroidDownloader && typeof window.AndroidDownloader.saveBase64File === 'function') {
      const dataUri = doc.output('datauristring');
      const base64Data = dataUri.includes(',') ? dataUri.split(',')[1] : dataUri;
      window.AndroidDownloader.saveBase64File(base64Data, fileName, 'application/pdf');
      return;
    }
  } catch (err) {
    console.warn('Error en puente nativo Android PDF, usando descarga estándar:', err);
  }
  doc.save(fileName);
};

// Cabecera corporativa reutilizable para todos los documentos PDF de F.E.S. Construcción
const drawCorporateHeader = (doc, subTitle, isLandscape = false) => {
  const pageWidth = isLandscape ? 297 : 210;
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setFillColor(234, 88, 12); // Orange FES
  doc.rect(0, 38, pageWidth, 2.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('F.E.S. CONSTRUCCIÓN — LADRILLERA SAN LUIS', 14, 17);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(subTitle || 'Materiales de Ingeniería & Arcillas Estructurales Certificadas NSR-10', 14, 25);
  doc.text('Vereda Patio Bonito, Nemocón | Tel: +57 320 821 6369 | Correo: frlmrtnz@gmail.com', 14, 32);
};

// 1. GENERADOR DE RECIBO / FACTURA DE COMPRA INDIVIDUAL
export const generateInvoicePDF = ({ pedidoId, cliente, productos = [], items = [], total, metodoPago, fecha, estado }) => {
  const doc = new jsPDF();
  const fechaStr = fecha ? new Date(fecha).toLocaleString('es-CO') : new Date().toLocaleString('es-CO');
  const productList = Array.isArray(productos) && productos.length > 0 ? productos : (Array.isArray(items) ? items : []);

  drawCorporateHeader(doc, 'Comprobante Oficial de Orden de Compra y Despacho de Materiales');

  // Título y Metadatos del Recibo
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(`RECIBO DE COMPRA / ORDEN #${pedidoId || 'COT-001'}`, 14, 52);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Fecha de emisión: ${fechaStr}`, 14, 59);
  doc.text(`Método de Pago: ${metodoPago || 'WhatsApp / Contraentrega'}`, 14, 65);
  if (estado) {
    doc.text(`Estado de la Orden: ${estado}`, 130, 59);
  }

  // Caja de Datos del Cliente
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 71, 182, 28, 3, 3, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('DATOS DEL CLIENTE / DESTINO DE OBRA:', 19, 79);

  doc.setFont('helvetica', 'normal');
  const nombreCliente = cliente?.nombre || 'Cliente F.E.S. Construcción';
  const telCliente = cliente?.telefono || 'No especificado';
  const dirCliente = cliente?.direccion || 'Vereda Patio Bonito / Sabana';
  const ciudadCliente = cliente?.ciudad || 'Cundinamarca';

  doc.text(`Cliente: ${nombreCliente}`, 19, 86);
  doc.text(`Teléfono: ${telCliente}`, 19, 93);
  doc.text(`Dirección: ${String(dirCliente).slice(0, 42)}`, 105, 86);
  doc.text(`Ciudad/Municipio: ${ciudadCliente}`, 105, 93);

  // Normalizar productos (soporta formato carrito o formato detalle_pedido de BD)
  const normalizedItems = productList.map((p, idx) => {
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
    startY: 105,
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

  savePDFDocument(doc, `Recibo-FES-Orden-${pedidoId || 'compra'}.pdf`);
};

// 2. EXPORTAR REPORTE DE GESTIÓN DE PEDIDOS (ADMIN) EN PDF
export const exportOrdersReportPDF = (ordersOrConfig = [], filtroLabelArg = 'Todos los registros') => {
  const isConfigObj = ordersOrConfig && !Array.isArray(ordersOrConfig) && typeof ordersOrConfig === 'object';
  const orders = isConfigObj ? (ordersOrConfig.orders || []) : (Array.isArray(ordersOrConfig) ? ordersOrConfig : []);
  const filtroLabel = isConfigObj ? (ordersOrConfig.filterLabel || filtroLabelArg) : filtroLabelArg;
  const categorizedSummary = isConfigObj ? (ordersOrConfig.categorizedSummary || []) : [];

  const doc = new jsPDF('landscape');
  drawCorporateHeader(doc, 'Reporte Oficial de Gestión de Pedidos y Estado de Despachos', true);

  const totalIngresos = orders
    .filter(o => o.estado !== 'Cancelado')
    .reduce((acc, o) => acc + Number(o.total || 0), 0);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`REPORTE DE GESTIÓN DE PEDIDOS — ${String(filtroLabel).toUpperCase()}`, 14, 49);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Emitido: ${new Date().toLocaleString('es-CO')}   |   Total Órdenes: ${orders.length}   |   Facturación Activa: $${totalIngresos.toLocaleString('es-CO')} COP`,
    14,
    55
  );

  let currentY = 60;

  if (Array.isArray(categorizedSummary) && categorizedSummary.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [['Periodo (Día / Mes / Año)', 'Cantidad de Pedidos', 'Total Facturado en Periodo (COP)']],
      body: categorizedSummary.map(g => [
        g.label || g.period,
        `${g.count} pedidos`,
        `$${Number(g.total || 0).toLocaleString('es-CO')} COP`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [234, 88, 12], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8.5, cellPadding: 2.5 }
    });
    currentY = (doc.lastAutoTable?.finalY || currentY + 20) + 6;
  }

  const rows = orders.map(o => [
    `#${o.id}`,
    o.creado_en ? new Date(o.creado_en).toLocaleString('es-CO') : 'Reciente',
    o.cliente_nombre || 'Cliente Obra',
    o.telefono || 'No reg.',
    String(o.direccion_envio || 'Planta / Sabana').slice(0, 38),
    (o.detalle || []).map(d => `${d.cantidad}x ${d.nombre_producto}`).join(', ') || 'Materiales varios',
    o.metodo_pago || 'WhatsApp',
    o.estado || 'Pendiente',
    `$${Number(o.total || 0).toLocaleString('es-CO')} COP`
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['# Orden', 'Fecha y Hora', 'Cliente', 'Teléfono', 'Destino / Obra', 'Materiales Solicitados', 'Método Pago', 'Estado', 'Total (COP)']],
    body: rows.length > 0 ? rows : [['-', '-', 'Sin pedidos para este filtro', '-', '-', '-', '-', '-', '$0 COP']],
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 2.5 }
  });

  savePDFDocument(doc, `FES-Gestion-Pedidos-${new Date().toISOString().slice(0, 10)}.pdf`);
};

// 3. EXPORTAR REPORTE DE VENTAS CATEGORIZADO (DÍA / MES / AÑO) EN PDF
export const exportSalesReportPDF = (config = {}) => {
  const doc = new jsPDF();
  drawCorporateHeader(doc, 'Reporte Gerencial de Ventas y Facturación Categorizado (Día / Mes / Año)');

  const rowsData = config.rows || config.groupedRows || [];
  const ordersData = config.orders || [];
  const topProductos = config.topProductos || [];
  const periodLabel = config.periodLabel || config.groupLabel || 'General';

  const totalOrdenes = Number(
    config.summary?.total_pedidos ??
    rowsData.reduce((s, r) => s + Number(r.total_pedidos ?? r.pedidos ?? 0), 0)
  );
  const totalVentas = Number(
    config.summary?.ingresos_totales ??
    rowsData.reduce((s, r) => s + Number(r.ingresos ?? 0), 0)
  );
  const ticketPromedio = totalOrdenes > 0 ? Math.round(totalVentas / totalOrdenes) : 0;

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(`REPORTE DE VENTAS — ${String(periodLabel).toUpperCase()}`, 14, 50);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Fecha de generación: ${new Date().toLocaleString('es-CO')}`, 14, 56);

  // Caja de KPIs Resumen
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(234, 88, 12);
  doc.roundedRect(14, 60, 182, 18, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Ingresos Brutos: $${totalVentas.toLocaleString('es-CO')} COP`, 19, 71);
  doc.text(`Órdenes Concluidas: ${totalOrdenes}`, 95, 71);
  doc.text(`Ticket Promedio: $${ticketPromedio.toLocaleString('es-CO')} COP`, 142, 71);

  // Tabla 1: Desglose por Periodo (Día / Mes / Año)
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('1. Consolidado de Ventas por Periodo (Día / Mes / Año):', 14, 86);

  autoTable(doc, {
    startY: 89,
    head: [['Periodo', 'Órdenes Facturadas', 'Ticket Promedio (COP)', 'Ingresos Facturados (COP)']],
    body: rowsData.length > 0
      ? rowsData.map(r => {
          const peds = Number(r.total_pedidos ?? r.pedidos ?? 0);
          const ing = Number(r.ingresos ?? 0);
          const avg = peds > 0 ? Math.round(ing / peds) : 0;
          return [
            r.label || r.periodo || r.fecha || r.mes || String(r.ano || 'Periodo'),
            `${peds} órdenes`,
            `$${avg.toLocaleString('es-CO')} COP`,
            `$${ing.toLocaleString('es-CO')} COP`
          ];
        })
      : [['Sin registros en este filtro', '0', '$0 COP', '$0 COP']],
    theme: 'grid',
    headStyles: { fillColor: [234, 88, 12], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 3 }
  });

  // Tabla 2: Top Materiales Más Vendidos
  let nextY = (doc.lastAutoTable?.finalY || 115) + 8;
  if (Array.isArray(topProductos) && topProductos.length > 0) {
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('2. Top Materiales Más Vendidos:', 14, nextY);

    autoTable(doc, {
      startY: nextY + 3,
      head: [['#', 'Material / Referencia', 'Unidades Vendidas', 'Ingresos Generados (COP)']],
      body: topProductos.map((tp, idx) => {
        const ingProd = Number(tp.ingresos_producto ?? tp.ingresos_generados ?? 0);
        return [
          String(idx + 1),
          tp.nombre_producto || 'Material',
          `${Number(tp.unidades_vendidas || 0).toLocaleString('es-CO')} unid.`,
          `$${ingProd.toLocaleString('es-CO')} COP`
        ];
      }),
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8.5, cellPadding: 2.5 }
    });
    nextY = (doc.lastAutoTable?.finalY || nextY + 25) + 8;
  }

  // Tabla 3: Detalle de Órdenes Facturadas
  if (Array.isArray(ordersData) && ordersData.length > 0) {
    if (nextY > 240) {
      doc.addPage();
      nextY = 20;
    }
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('3. Detalle Individual de Órdenes Facturadas:', 14, nextY);

    autoTable(doc, {
      startY: nextY + 3,
      head: [['# Orden', 'Fecha y Hora', 'Cliente', 'Materiales', 'Pago', 'Estado', 'Total (COP)']],
      body: ordersData.map(o => [
        `#${o.id}`,
        o.creado_en ? new Date(o.creado_en).toLocaleString('es-CO') : 'Reciente',
        o.cliente_nombre || 'Cliente Obra',
        (o.detalle || []).map(d => `${d.cantidad}x ${d.nombre_producto}`).join(', ').slice(0, 42) || 'Segun orden',
        o.metodo_pago || 'WhatsApp',
        o.estado || 'Pendiente',
        `$${Number(o.total || 0).toLocaleString('es-CO')} COP`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 2.5 }
    });
  }

  savePDFDocument(doc, `FES-Reporte-Ventas-${new Date().toISOString().slice(0, 10)}.pdf`);
};

// 4. EXPORTAR HISTORIAL DE ENTRADAS Y SALIDAS DE INVENTARIO EN PDF
export const exportInventoryMovementsPDF = (movementsOrConfig = [], filtroLabelArg = 'Todos los movimientos') => {
  const isConfigObj = movementsOrConfig && !Array.isArray(movementsOrConfig) && typeof movementsOrConfig === 'object';
  const movements = isConfigObj ? (movementsOrConfig.movements || []) : (Array.isArray(movementsOrConfig) ? movementsOrConfig : []);
  const filtroLabel = isConfigObj ? (movementsOrConfig.filterLabel || filtroLabelArg) : filtroLabelArg;
  const categorizedSummary = isConfigObj ? (movementsOrConfig.categorizedSummary || []) : [];

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
  doc.text('HISTORIAL DE ENTRADAS Y SALIDAS DE INVENTARIO', 14, 50);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Filtro: ${filtroLabel} | Emitido: ${new Date().toLocaleString('es-CO')}`, 14, 56);
  doc.setFont('helvetica', 'bold');
  doc.text(
    `Movimientos: ${movements.length}  |  Total Entradas: +${totalEntradas.toLocaleString('es-CO')} unid.  |  Total Salidas: -${totalSalidas.toLocaleString('es-CO')} unid.`,
    14,
    63
  );

  let currentY = 68;

  if (Array.isArray(categorizedSummary) && categorizedSummary.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [['Periodo (Día / Mes / Año)', 'Movimientos', 'Unidades Entradas (+)', 'Unidades Salidas (-)']],
      body: categorizedSummary.map(g => [
        g.label || g.period,
        `${g.count} mov.`,
        `+${Number(g.entradas || 0).toLocaleString('es-CO')} unid.`,
        `-${Number(g.salidas || 0).toLocaleString('es-CO')} unid.`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [234, 88, 12], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8.5, cellPadding: 2.5 }
    });
    currentY = (doc.lastAutoTable?.finalY || currentY + 20) + 6;
  }

  autoTable(doc, {
    startY: currentY,
    head: [['ID', 'Fecha y Hora', 'Tipo', 'Material / Producto', 'Cantidad', 'Nota de Control']],
    body: movements.length > 0
      ? movements.map(m => [
          `#${m.id}`,
          m.fecha ? new Date(m.fecha).toLocaleString('es-CO') : 'Reciente',
          (m.tipo || '').toUpperCase(),
          m.nombre_producto || 'Material',
          `${m.tipo === 'entrada' ? '+' : '-'}${Number(m.cantidad || 0).toLocaleString('es-CO')} unid.`,
          m.nota || 'Control de patio'
        ])
      : [['-', '-', '-', 'Sin movimientos para este filtro', '0 unid.', '-']],
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 3 }
  });

  savePDFDocument(doc, `FES-Historial-Inventario-${new Date().toISOString().slice(0, 10)}.pdf`);
};

// 5. EXPORTAR CUALQUIER TABLA A EXCEL (CSV CON BOM UTF-8)
export const exportToCSV = (filename, headersOrObjArray = [], rowsArg = []) => {
  const escapeCSV = (val) => {
    const str = String(val ?? '').replace(/"/g, '""');
    return `"${str}"`;
  };

  let headers = [];
  let rows = [];

  if (Array.isArray(headersOrObjArray) && headersOrObjArray.length > 0) {
    if (typeof headersOrObjArray[0] === 'object' && !Array.isArray(headersOrObjArray[0])) {
      headers = Object.keys(headersOrObjArray[0]);
      rows = headersOrObjArray.map(obj => headers.map(k => obj[k] ?? ''));
    } else {
      headers = headersOrObjArray;
      rows = Array.isArray(rowsArg) ? rowsArg : [];
    }
  } else if (Array.isArray(rowsArg) && rowsArg.length > 0 && typeof rowsArg[0] === 'object' && !Array.isArray(rowsArg[0])) {
    headers = Object.keys(rowsArg[0]);
    rows = rowsArg.map(obj => headers.map(k => obj[k] ?? ''));
  } else {
    headers = ['Estado'];
    rows = [['Sin registros para el filtro seleccionado']];
  }

  const csvContent = '\uFEFF' + [
    headers.map(escapeCSV).join(';'),
    ...rows.map(row => row.map(escapeCSV).join(';'))
  ].join('\r\n');

  const finalName = filename.endsWith('.csv') ? filename : `${filename}.csv`;

  try {
    if (typeof window !== 'undefined' && window.AndroidDownloader && typeof window.AndroidDownloader.saveBase64File === 'function') {
      const base64Data = btoa(unescape(encodeURIComponent(csvContent)));
      window.AndroidDownloader.saveBase64File(base64Data, finalName, 'text/csv');
      return;
    }
  } catch (err) {
    console.warn('Error en puente nativo Android CSV, usando descarga estándar:', err);
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', finalName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
