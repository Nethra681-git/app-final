import jsPDF from 'jspdf';
import type { Payment } from './store';

export function generatePaymentReceipt(payment: Payment) {
  const doc = new jsPDF();
  const w = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(31, 122, 99);
  doc.rect(0, 0, w, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SHASTIKA GLOBAL IMPEX PVT LTD', w / 2, 16, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Payment Receipt', w / 2, 24, { align: 'center' });
  doc.text('Email: kim.swathi.07@gmail.com | Phone: +91 9789090920', w / 2, 32, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  let y = 55;
  const left = 20;

  const row = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(label, left, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, left + 55, y);
    y += 8;
  };

  row('Receipt ID:', payment.id);
  row('Order ID:', payment.orderId);
  row('Date:', payment.timestamp);
  y += 4;

  doc.setFillColor(240, 240, 235);
  doc.rect(15, y - 5, w - 30, 36, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('BUYER DETAILS', left, y + 2);
  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${payment.buyerName}`, left, y); y += 6;
  doc.text(`Email: ${payment.buyerEmail}`, left, y); y += 6;
  doc.text(`Phone: ${payment.buyerPhone}`, left, y);
  y += 14;

  row('Amount:', `Rs. ${payment.amount.toLocaleString()}`);
  row('Payment Method:', payment.method.toUpperCase());
  row('Transaction ID:', payment.transactionId);
  row('UTR Number:', payment.utrNumber);
  row('Bank:', payment.bankName);
  row('Status:', payment.status.toUpperCase());

  if (payment.adminNote) {
    y += 4;
    row('Admin Note:', payment.adminNote);
  }

  // Status badge
  y += 10;
  if (payment.status === 'approved') {
    doc.setFillColor(34, 139, 34);
    doc.roundedRect(w / 2 - 30, y, 60, 16, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('APPROVED', w / 2, y + 11, { align: 'center' });
  } else if (payment.status === 'pending') {
    doc.setFillColor(244, 180, 0);
    doc.roundedRect(w / 2 - 25, y, 50, 16, 3, 3, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PENDING', w / 2, y + 11, { align: 'center' });
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFillColor(31, 122, 99);
  doc.rect(0, footerY - 5, w, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('SHASTIKA GLOBAL IMPEX PVT LTD — Agriculture Export Solutions', w / 2, footerY + 5, { align: 'center' });
  doc.text('This is a system-generated receipt.', w / 2, footerY + 11, { align: 'center' });

  doc.save(`Receipt_${payment.id}.pdf`);
}
