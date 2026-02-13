import { jsPDF } from 'jspdf';
import { formatCurrency } from '../utils/format.js';

/**
 * Load an image from a URL or data-URL and return it as a base64 data URL.
 * Returns null on failure.
 */
async function loadImageAsDataUrl(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * Generate an invoice PDF and return it as a Blob.
 * `data` shape matches the form state from App.jsx.
 */
export async function generateInvoice(data) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth(); // 210
  const rightMargin = 10;

  // Ensure text is black by default
  doc.setTextColor(0, 0, 0);

  // ── HEADER ─────────────────────────────────────────

  // Logo (top-left)
  if (data.logoDataUrl) {
    try {
      const logoData = data.logoDataUrl.startsWith('data:')
        ? data.logoDataUrl
        : await loadImageAsDataUrl(data.logoDataUrl);
      if (logoData) {
        doc.addImage(logoData, 'PNG', 10, 8, 33, 0);
      }
    } catch { /* skip logo on error */ }
  }

  // "Invoice" title (top-right)
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Invoice', pageWidth - rightMargin, 15, { align: 'right' });

  // Invoice No. and Date (right-aligned)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  const labelX = pageWidth - 60 - rightMargin;
  const valueX = pageWidth - rightMargin;

  doc.text('Invoice No.', labelX, 23);
  doc.text(data.invoiceNo || '', valueX, 23, { align: 'right' });

  doc.text('Date', labelX, 28);
  doc.text(data.date || '', valueX, 28, { align: 'right' });

  // ── ISSUER / RECIPIENT ─────────────────────────────

  const sectionY = 42;

  // Issuer (left)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('ISSUER', 10, sectionY);

  doc.setFont('helvetica', 'normal');
  const issuerLines = [
    data.issuerCompany,
    data.issuerAddress,
    data.issuerEmail,
  ].filter(Boolean);
  issuerLines.forEach((line, i) => {
    doc.text(line, 10, sectionY + 6 + i * 5);
  });

  // Recipient (right)
  doc.setFont('helvetica', 'bold');
  doc.text('RECIPIENT', 110, sectionY);

  doc.setFont('helvetica', 'normal');
  const recipientLines = [
    data.recipientName,
    data.recipientAddress,
    data.recipientEmail,
    data.recipientPhone,
  ].filter(Boolean);
  recipientLines.forEach((line, i) => {
    doc.text(line, 110, sectionY + 6 + i * 5);
  });

  // ── LINE ITEMS TABLE ───────────────────────────────

  const tableY = 80;
  const colWidths = { desc: 90, qty: 30, price: 35, total: 35 };
  const totalWidth = colWidths.desc + colWidths.qty + colWidths.price + colWidths.total;
  const rowH = 10;

  // Header row background (one continuous rect)
  doc.setFillColor(230, 230, 230);
  doc.rect(10, tableY, totalWidth, rowH, 'F');

  // Header text (draw AFTER fill so text is on top)
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  let x = 10;
  doc.text('Description', x + 2, tableY + 7);
  x += colWidths.desc;
  doc.text('Quantity', x + 2, tableY + 7);
  x += colWidths.qty;
  doc.text('Unit Price', x + colWidths.price - 2, tableY + 7, { align: 'right' });
  x += colWidths.price;
  doc.text('Total', x + colWidths.total - 2, tableY + 7, { align: 'right' });

  // Data row
  const qty = parseFloat(data.quantity) || 0;
  const price = parseFloat(data.unitPrice) || 0;
  const lineTotal = qty * price;
  const dataY = tableY + rowH;

  // Bottom border for data row
  doc.setDrawColor(200, 200, 200);
  doc.line(10, dataY + rowH, 10 + totalWidth, dataY + rowH);

  // Data row text
  doc.setTextColor(0, 0, 0);
  x = 10;
  doc.text(data.description || '', x + 2, dataY + 7);
  x += colWidths.desc;

  const qtyStr = Number.isInteger(qty) ? String(qty) : String(qty);
  doc.text(qtyStr, x + 2, dataY + 7);
  x += colWidths.qty;

  doc.text(formatCurrency(price), x + colWidths.price - 2, dataY + 7, { align: 'right' });
  x += colWidths.price;

  doc.text(formatCurrency(lineTotal), x + colWidths.total - 2, dataY + 7, { align: 'right' });

  // ── SUMMARY ────────────────────────────────────────

  const summaryY = dataY + rowH + 10;
  const taxRate = parseFloat(data.taxRate) || 0;
  const taxAmount = lineTotal * (taxRate / 100);
  const grandTotal = lineTotal + taxAmount;

  // Subtotal row
  doc.setFillColor(240, 245, 240);
  doc.rect(10, summaryY, totalWidth, 8, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Subtotal', 12, summaryY + 6);
  doc.text(formatCurrency(lineTotal), 10 + totalWidth - 2, summaryY + 6, { align: 'right' });

  // Tax row
  doc.setFillColor(240, 245, 240);
  doc.rect(10, summaryY + 10, totalWidth, 8, 'F');
  doc.setTextColor(0, 0, 0);
  const taxLabel = `NY Income Tax ${taxRate.toFixed(2).replace('.', ',')}%`;
  doc.text(taxLabel, 12, summaryY + 16);
  doc.text(formatCurrency(taxAmount), 10 + totalWidth - 2, summaryY + 16, { align: 'right' });

  // Total row
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Total', 12, summaryY + 30);
  doc.text(formatCurrency(grandTotal), 10 + totalWidth - 2, summaryY + 30, { align: 'right' });

  // ── SIGNATURE (footer) ─────────────────────────────

  if (data.signatureDataUrl) {
    try {
      const sigData = data.signatureDataUrl.startsWith('data:')
        ? data.signatureDataUrl
        : await loadImageAsDataUrl(data.signatureDataUrl);
      if (sigData) {
        doc.addImage(sigData, 'PNG', 10, 250, 40, 0);
      }
    } catch { /* skip signature on error */ }
  }

  // Return as Blob
  return doc.output('blob');
}
