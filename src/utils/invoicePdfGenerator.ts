import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice, Order } from '../types/ink';
import { INK_SERIES, INK_COLORS } from '../data/mockData';

/**
 * Formats monetary amounts for clean PDF rendering.
 * Note: Standard PDF fonts (Helvetica) render 'Rs.' or 'INR' cleanly without font encoding errors.
 */
function formatPdfCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Generates and downloads a formatted PDF for a given Commercial Tax Invoice.
 */
export function generateInvoicePdf(invoice: Invoice, order?: Order | null): jsPDF {
  // Create A4 portrait PDF (210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182

  let currentY = 16;

  // ==========================================
  // 1. BRAND HEADER & INVOICE META
  // ==========================================
  // Header accent bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, currentY, contentWidth, 24, 'F');

  // Left Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('BR AGENCY COMPANY INKS', margin + 6, currentY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(
    'Specialized Commercial Printing Inks · BIO SPEED & BIO PACK Series',
    margin + 6,
    currentY + 14
  );
  doc.text(
    'GSTIN: 07AAACB9821R1Z8 | State: Delhi (07) | HSN: 3215 | ISO 2846-1 / ISO 12647-2',
    margin + 6,
    currentY + 19
  );

  // Right Title & Invoice Number
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(56, 189, 248); // sky-400
  doc.text('TAX INVOICE', pageWidth - margin - 6, currentY + 7, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(invoice.invoiceNumber, pageWidth - margin - 6, currentY + 13, { align: 'right' });

  // Status tag badge
  const statusUpper = invoice.status.toUpperCase();
  let badgeFill = [245, 158, 11]; // amber for pending/unpaid
  let badgeText = [255, 255, 255];
  if (invoice.status === 'paid') {
    badgeFill = [16, 185, 129]; // emerald
  } else if (invoice.status === 'overdue') {
    badgeFill = [239, 68, 68]; // red
  }

  const badgeWidth = 24;
  const badgeHeight = 5.5;
  const badgeX = pageWidth - margin - 6 - badgeWidth;
  const badgeY = currentY + 15.5;

  doc.setFillColor(badgeFill[0], badgeFill[1], badgeFill[2]);
  doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 1.2, 1.2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(badgeText[0], badgeText[1], badgeText[2]);
  doc.text(statusUpper, badgeX + badgeWidth / 2, badgeY + 4, { align: 'center' });

  currentY += 28;

  // ==========================================
  // 2. INVOICE METADATA ROW
  // ==========================================
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.rect(margin, currentY, contentWidth, 11, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105); // slate-600

  // Date columns
  const metaColWidth = contentWidth / 4;
  doc.text(`Issue Date: `, margin + 4, currentY + 5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${invoice.issueDate}`, margin + 21, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Payment Due: `, margin + metaColWidth + 2, currentY + 5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${invoice.dueDate}`, margin + metaColWidth + 24, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Order Ref #: `, margin + metaColWidth * 2 + 2, currentY + 5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${invoice.orderNumber}`, margin + metaColWidth * 2 + 20, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Payment Terms: `, margin + metaColWidth * 3 + 2, currentY + 5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${invoice.paymentTerms}`, margin + metaColWidth * 3 + 24, currentY + 5);

  currentY += 15;

  // ==========================================
  // 3. BILLED TO & SHIPPED TO PANELS
  // ==========================================
  const panelWidth = (contentWidth - 6) / 2;
  const panelHeight = 38;

  // Panel 1: Billed To (Buyer)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, panelWidth, panelHeight, 2, 2, 'FD');

  // Header band for Billed To
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, currentY, panelWidth, 6.5, 2, 2, 'F');
  doc.rect(margin, currentY + 4, panelWidth, 2.5, 'F'); // square bottom corners
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('BILLED TO (BUYER ENTITY)', margin + 4, currentY + 4.8);

  // Content
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.customer.companyName, margin + 4, currentY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Attn: ${invoice.customer.contactPerson}`, margin + 4, currentY + 16.5);
  doc.text(
    `${invoice.customer.address}, ${invoice.customer.city}, ${invoice.customer.state} - ${invoice.customer.postalCode}`,
    margin + 4,
    currentY + 21,
    { maxWidth: panelWidth - 8 }
  );
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`GSTIN: ${invoice.customer.gstNumber}`, margin + 4, currentY + 30);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Phone: ${invoice.customer.phone} | Equipment: ${invoice.customer.pressModel}`, margin + 4, currentY + 34.5);

  // Panel 2: Shipped To (Delivery Dock)
  const shipX = margin + panelWidth + 6;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(shipX, currentY, panelWidth, panelHeight, 2, 2, 'FD');

  // Header band for Shipped To
  doc.setFillColor(236, 254, 255); // cyan-50
  doc.roundedRect(shipX, currentY, panelWidth, 6.5, 2, 2, 'F');
  doc.rect(shipX, currentY + 4, panelWidth, 2.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(14, 116, 144); // cyan-700
  doc.text('SHIPPED TO (CONSIGNEE DELIVERY DOCK)', shipX + 4, currentY + 4.8);

  const deliveryAddr = invoice.deliveryAddress;
  const plantName = deliveryAddr?.plantOrUnitName || invoice.customer.companyName;
  const streetAddr = deliveryAddr?.streetAddress || invoice.customer.address;
  const landmarkStr = deliveryAddr?.landmark ? ` (${deliveryAddr.landmark})` : '';
  const cityStatePin = `${deliveryAddr?.city || invoice.customer.city}, ${deliveryAddr?.state || invoice.customer.state} - ${deliveryAddr?.postalCode || invoice.customer.postalCode}`;
  const dockContact = deliveryAddr?.dockContactPerson || invoice.customer.contactPerson;
  const dockPhone = deliveryAddr?.dockContactPhone || invoice.customer.phone;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(plantName, shipX + 4, currentY + 12, { maxWidth: panelWidth - 8 });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`${streetAddr}${landmarkStr}`, shipX + 4, currentY + 16.5, { maxWidth: panelWidth - 8 });
  doc.text(cityStatePin, shipX + 4, currentY + 21);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(14, 116, 144);
  doc.text(`Dock In-charge: ${dockContact}`, shipX + 4, currentY + 30);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const bayInfo = deliveryAddr?.gateOrBayNumber ? ` | Bay: ${deliveryAddr.gateOrBayNumber}` : '';
  doc.text(`Mobile: ${dockPhone}${bayInfo}`, shipX + 4, currentY + 34.5);

  currentY += panelHeight + 6;

  // ==========================================
  // 4. ITEM TABLE (jspdf-autotable)
  // ==========================================
  const tableRows = invoice.items.map((item, idx) => {
    const colSpec = INK_COLORS.find(c => c.name === item.color);
    const series = INK_SERIES[item.seriesId];
    const seriesName = series ? series.name : 'Bio Speed';
    const desc = `${seriesName} Process ${item.color}\n(${colSpec?.pigmentName || ''} - ${colSpec?.pigmentCode || ''})`;

    return [
      (idx + 1).toString(),
      desc,
      colSpec?.hsnCode || '3215',
      `${item.containersCount}x ${item.containerLabel}`,
      `${item.totalKg.toFixed(1)} kg`,
      formatPdfCurrency(item.unitPricePerKg),
      formatPdfCurrency(item.totalPrice),
    ];
  });

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [[
      '#',
      'Description of Supply (Process Inks)',
      'HSN Code',
      'Packaging',
      'Total Weight',
      'Rate / kg',
      'Amount',
    ]],
    body: tableRows,
    theme: 'plain',
    headStyles: {
      fillColor: [30, 41, 59], // slate-800
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
      cellPadding: 2.8,
    },
    styles: {
      font: 'helvetica',
      fontSize: 7.8,
      textColor: [30, 41, 59],
      cellPadding: 2.8,
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 62 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 30 },
      4: { cellWidth: 20, halign: 'right' },
      5: { cellWidth: 20, halign: 'right' },
      6: { cellWidth: 20, halign: 'right', fontStyle: 'bold' },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // slate-50
    },
  });

  // Get table end position
  const lastAutoTable = (doc as any).lastAutoTable;
  currentY = (lastAutoTable?.finalY || currentY + 50) + 6;

  // Check if we need to adjust space before bottom summary
  if (currentY > 215) {
    doc.addPage();
    currentY = 16;
  }

  // ==========================================
  // 5. REMITTANCE & TOTALS SUMMARY
  // ==========================================
  const summaryHeight = 44;
  const bankBoxWidth = 98;
  const totalsBoxWidth = contentWidth - bankBoxWidth - 6;

  // Left Box: Electronic Wire & Bank Remittance
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, bankBoxWidth, summaryHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('ELECTRONIC BANK WIRE & REMITTANCE DETAILS', margin + 4, currentY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);

  const bankY = currentY + 11;
  doc.text(`Bank Name:`, margin + 4, bankY);
  doc.setFont('helvetica', 'bold');
  doc.text(`${invoice.bankDetails.bankName}`, margin + 30, bankY);

  doc.setFont('helvetica', 'normal');
  doc.text(`Account Name:`, margin + 4, bankY + 5);
  doc.setFont('helvetica', 'bold');
  doc.text(`${invoice.bankDetails.accountName}`, margin + 30, bankY + 5);

  doc.setFont('helvetica', 'normal');
  doc.text(`Account Number:`, margin + 4, bankY + 10);
  doc.setFont('helvetica', 'bold');
  doc.text(`${invoice.bankDetails.accountNumber}`, margin + 30, bankY + 10);

  doc.setFont('helvetica', 'normal');
  doc.text(`IFSC / RTGS:`, margin + 4, bankY + 15);
  doc.setFont('helvetica', 'bold');
  doc.text(`${invoice.bankDetails.ifscOrSwift}`, margin + 30, bankY + 15);

  doc.setFont('helvetica', 'normal');
  doc.text(`Branch Location:`, margin + 4, bankY + 20);
  doc.setFont('helvetica', 'normal');
  doc.text(`${invoice.bankDetails.branch}`, margin + 30, bankY + 20);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(6.8);
  doc.text(
    '* Quote Invoice # on all wire transfers and remittance slips.',
    margin + 4,
    bankY + 26
  );

  // Right Box: Financial Totals Breakdown
  const totalsX = margin + bankBoxWidth + 6;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(totalsX, currentY, totalsBoxWidth, summaryHeight, 2, 2, 'FD');

  let totLineY = currentY + 6;
  const totRightX = totalsX + totalsBoxWidth - 4;

  const renderTotLine = (label: string, value: string, isBold: boolean = false, color: number[] = [71, 85, 105]) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(label, totalsX + 4, totLineY);
    doc.text(value, totRightX, totLineY, { align: 'right' });
    totLineY += 5;
  };

  renderTotLine('Subtotal:', formatPdfCurrency(invoice.subtotal));

  if (invoice.discountAmount > 0) {
    renderTotLine(
      'Volume Bulk Discount:',
      `-${formatPdfCurrency(invoice.discountAmount)}`,
      false,
      [16, 185, 129]
    );
  }

  renderTotLine(`Industrial GST (${invoice.taxRate}%):`, formatPdfCurrency(invoice.taxAmount));
  renderTotLine('Freight & Transport:', formatPdfCurrency(invoice.shippingFee));

  // Separator line
  doc.setDrawColor(203, 213, 225);
  doc.line(totalsX + 4, totLineY, totRightX, totLineY);
  totLineY += 4.5;

  // Grand Total highlight
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Total Invoice Due:', totalsX + 4, totLineY);
  doc.text(formatPdfCurrency(invoice.totalAmount), totRightX, totLineY, { align: 'right' });
  totLineY += 5;

  if (invoice.paidAmount > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(16, 185, 129);
    doc.text('Amount Paid:', totalsX + 4, totLineY);
    doc.text(`-${formatPdfCurrency(invoice.paidAmount)}`, totRightX, totLineY, { align: 'right' });
    totLineY += 4.5;

    const balanceDue = invoice.totalAmount - invoice.paidAmount;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(balanceDue > 0 ? 225 : 15, balanceDue > 0 ? 29 : 23, balanceDue > 0 ? 72 : 42);
    doc.text('Balance Outstanding:', totalsX + 4, totLineY);
    doc.text(formatPdfCurrency(balanceDue), totRightX, totLineY, { align: 'right' });
  }

  currentY += summaryHeight + 6;

  // ==========================================
  // 6. PAYMENT HISTORY (if present)
  // ==========================================
  if (invoice.payments && invoice.payments.length > 0) {
    if (currentY > 240) {
      doc.addPage();
      currentY = 16;
    }

    doc.setFillColor(240, 253, 244); // emerald-50
    doc.setDrawColor(187, 247, 208);
    const pmtHeight = 6 + invoice.payments.length * 4.5;
    doc.roundedRect(margin, currentY, contentWidth, pmtHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(21, 128, 61);
    doc.text('SETTLED PAYMENT RECEIPTS & TRANSACTION AUDIT', margin + 4, currentY + 4.5);

    let pmtY = currentY + 8.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    invoice.payments.forEach(p => {
      doc.text(
        `• ${p.date} · Channel: ${p.method} · Ref: ${p.referenceNumber} ${p.note ? `(${p.note})` : ''}`,
        margin + 4,
        pmtY
      );
      doc.setFont('helvetica', 'bold');
      doc.text(formatPdfCurrency(p.amount), pageWidth - margin - 4, pmtY, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      pmtY += 4.5;
    });

    currentY += pmtHeight + 6;
  }

  // ==========================================
  // 7. FOOTER: TERMS & AUTHORIZED SIGNATURE
  // ==========================================
  if (currentY > 250) {
    doc.addPage();
    currentY = 16;
  }

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 4;

  // Terms on left
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  doc.text('Standard Commercial Pressroom Supply Terms:', margin, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    '1. Quality: Warranted to conform to ISO 2846-1 colorimetric standards & ISO 12647-2 pressroom guidelines.',
    margin,
    currentY + 3.5
  );
  doc.text(
    '2. Storage & Use: Maintain between 15°C and 25°C. Stir thoroughly before running press.',
    margin,
    currentY + 6.8
  );
  doc.text(
    '3. Interest: Overdue invoices subject to 1.5% monthly commercial finance charge.',
    margin,
    currentY + 10.1
  );

  // Signatory on right
  const sigX = pageWidth - margin - 45;
  doc.setDrawColor(148, 163, 184);
  doc.line(sigX, currentY + 8, pageWidth - margin, currentY + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(15, 23, 42);
  doc.text('Authorized Chemical Signatory', sigX + 22.5, currentY + 11.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('BR Agency Ink Supplies Inc.', sigX + 22.5, currentY + 14.5, { align: 'center' });

  return doc;
}

/**
 * Convenience helper to download the invoice directly as a file.
 */
export function downloadInvoicePdf(invoice: Invoice, order?: Order | null): void {
  const doc = generateInvoicePdf(invoice, order);
  const safeNumber = invoice.invoiceNumber.replace(/[^a-zA-Z0-9-_]/g, '_');
  const filename = `Invoice_${safeNumber}.pdf`;
  doc.save(filename);
}
