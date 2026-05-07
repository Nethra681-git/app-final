import jsPDF from 'jspdf';
import type { Order } from './store';

export function generateInvoice(order: Order) {
  const doc = new jsPDF();
  const w = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(31, 122, 99);
  doc.rect(0, 0, w, 45, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SHASTIKA GLOBAL IMPEX PRIVATE LIMITED', w / 2, 18, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Agriculture Export Marketplace', w / 2, 26, { align: 'center' });
  doc.text('Email: kim.swathi.07@gmail.com', w / 2, 33, { align: 'center' });
  doc.text('INVOICE', w / 2, 41, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  let y = 55;
  const left = 20;
  const right = w / 2 + 10;

  const addRow = (label: string, value: string, x: number) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(label, x, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, x + 45, y);
  };

  addRow('Order ID:', order.id, left);
  addRow('Order Date:', order.orderDate, right);
  y += 8;
  addRow('Product:', order.productName, left);
  addRow('Quantity:', `${order.quantity}`, right);
  y += 8;
  addRow('Price/Unit:', `₹${order.price}`, left);
  addRow('Total:', `₹${order.total}`, right);
  y += 8;
  addRow('Payment:', order.paymentMethod.toUpperCase(), left);
  addRow('Market:', order.marketType, right);

  y += 16;
  doc.setFillColor(240, 240, 235);
  doc.rect(15, y - 5, w - 30, 30, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('BUYER DETAILS', left, y + 2);
  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${order.buyerName}`, left, y);
  y += 6;
  doc.text(`Email: ${order.buyerEmail}`, left, y);
  y += 6;
  doc.text(`Phone: ${order.buyerPhone}`, left, y);

  y += 16;
  doc.setFillColor(240, 240, 235);
  doc.rect(15, y - 5, w - 30, 22, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('SHIPMENT DETAILS', left, y + 2);
  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.text(`Method: ${order.shippingMethod === 'sea' ? 'Sea Way' : 'Air Way'}`, left, y);
  doc.text(`Destination: ${order.destinationCountry}`, right, y);

  y += 16;
  doc.text(`Farmer: ${order.farmerName}`, left, y);

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFillColor(31, 122, 99);
  doc.rect(0, footerY - 5, w, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('SHASTIKA GLOBAL IMPEX PRIVATE LIMITED — Agriculture Export Solutions', w / 2, footerY + 5, { align: 'center' });
  doc.text('Thank you for your business!', w / 2, footerY + 11, { align: 'center' });

  doc.save(`Invoice_${order.id}.pdf`);
}
