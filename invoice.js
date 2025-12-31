function downloadInvoice() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Get order data from localStorage
  const orderData = JSON.parse(localStorage.getItem('lastOrder'));
  const user = JSON.parse(localStorage.getItem('loggedInUser'));

  if (!orderData || !user) {
    alert('No order data found');
    return;
  }

  let y = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  // Header
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('SourceSys Mobiles', pageWidth / 2, y, { align: 'center' });
  y += 10;

  doc.setFontSize(16);
  doc.setFont(undefined, 'normal');
  doc.text('INVOICE / RECEIPT', pageWidth / 2, y, { align: 'center' });
  y += 15;

  // Draw line
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Company Info
  doc.setFontSize(10);
  doc.text('SourceSys Mobiles', margin, y);
  y += 5;
  doc.text('123 Tech Street,', margin, y);
  y += 5;
  doc.text('Mumbai, Maharashtra 400001', margin, y);
  y += 5;
  doc.text('Email: support@sourcesys.com', margin, y);
  y += 5;
  doc.text('Phone: +91 1234567890', margin, y);
  y += 10;

  // Invoice Details
  doc.setFont(undefined, 'bold');
  doc.text(`Invoice #: ${orderData.orderId}`, pageWidth - margin, y, { align: 'right' });
  y += 5;
  doc.setFont(undefined, 'normal');
  doc.text(`Date: ${orderData.date}`, pageWidth - margin, y, { align: 'right' });
  y += 5;
  doc.text(`Payment ID: ${orderData.paymentId}`, pageWidth - margin, y, { align: 'right' });
  y += 15;

  // Customer Info
  doc.setFont(undefined, 'bold');
  doc.text('Bill To:', margin, y);
  y += 7;
  doc.setFont(undefined, 'normal');
  doc.text(`Name: ${user.name}`, margin, y);
  y += 5;
  doc.text(`Email: ${user.email}`, margin, y);
  y += 5;
  doc.text(`Phone: ${user.phone}`, margin, y);
  y += 15;

  // Draw line
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Items Table Header
  doc.setFont(undefined, 'bold');
  doc.text('Item', margin, y);
  doc.text('Price', pageWidth - margin, y, { align: 'right' });
  y += 7;
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  // Items
  doc.setFont(undefined, 'normal');
  let subtotal = 0;
  orderData.items.forEach((item, index) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    
    doc.text(`${index + 1}. ${item.name}`, margin, y);
    doc.text(`₹${item.price.toLocaleString('en-IN')}`, pageWidth - margin, y, { align: 'right' });
    subtotal += item.price;
    y += 7;
  });

  y += 5;
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Total
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text(`Total Amount: ₹${orderData.total.toLocaleString('en-IN')}`, pageWidth - margin, y, { align: 'right' });
  y += 15;

  // Payment Status
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(0, 150, 0);
  doc.text('✓ Payment Status: PAID', margin, y);
  doc.setTextColor(0, 0, 0);
  y += 10;

  // Footer
  y = doc.internal.pageSize.getHeight() - 30;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Thank you for your purchase!', pageWidth / 2, y, { align: 'center' });
  y += 5;
  doc.text('This is a computer-generated invoice.', pageWidth / 2, y, { align: 'center' });

  // Save PDF
  doc.save(`Invoice_${orderData.orderId}.pdf`);
}
