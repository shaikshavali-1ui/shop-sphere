import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { jsPDF } from 'jspdf';

export async function GET(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params;

  try {
    // 1. Fetch order details from database with relations
    const { data: order, error } = await supabaseServer
      .from('orders')
      .select(`
        *,
        customers (
          name,
          email,
          phone,
          address
        ),
        products (
          name,
          price,
          category
        )
      `)
      .eq('order_id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 2. Generate PDF using jsPDF (A4 layout in portrait mode)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Fonts setup
    doc.setFont('helvetica', 'normal');

    // Header header background block
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, 210, 40, 'F');

    // Logo / Brand
    doc.setTextColor(99, 102, 241); // Indigo 500
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('SHOPSPHERE', 20, 20);

    doc.setTextColor(148, 163, 184); // Slate 400
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Smart E-Commerce Admin & Fulfillment', 20, 27);

    // Document Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('INVOICE RECEIPT', 140, 22);

    // Bill To Customer Details
    doc.setTextColor(15, 23, 42); // Reset to dark text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('BILL TO:', 130, 55);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(order.customers?.name || 'Customer Name', 130, 61);
    doc.text(order.customers?.email || 'Email Address', 130, 66);
    if (order.customers?.phone) {
      doc.text(`Phone: ${order.customers.phone}`, 130, 71);
    }
    if (order.customers?.address) {
      const splitAddress = doc.splitTextToSize(order.customers.address, 65);
      doc.text(splitAddress, 130, 76);
    }

    // Invoice Meta details
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('INVOICE INFO:', 20, 55);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Invoice ID: #${order.order_id.substring(0, 8).toUpperCase()}`, 20, 61);
    doc.text(`Order Date: ${new Date(order.order_date).toLocaleDateString()}`, 20, 66);
    doc.text(`Fulfillment: ${order.status}`, 20, 71);

    // Items table header row
    doc.setFillColor(241, 245, 249); // Slate 100
    doc.rect(20, 100, 170, 8, 'F');

    doc.setTextColor(71, 85, 105); // Slate 600
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('PRODUCT DESCRIPTION', 23, 105);
    doc.text('QTY', 120, 105);
    doc.text('UNIT PRICE', 140, 105);
    doc.text('AMOUNT', 170, 105);

    // Table Content (since single product per order in standard schema)
    const productPrice = Number(order.total_amount) / order.quantity;
    doc.setTextColor(30, 41, 59); // Slate 800
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(order.products?.name || 'Product Details', 23, 115);
    doc.text(order.quantity.toString(), 120, 115);
    doc.text(`$${productPrice.toFixed(2)}`, 140, 115);
    doc.text(`$${Number(order.total_amount).toFixed(2)}`, 170, 115);

    // Divider
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.line(20, 122, 190, 122);

    // Financial aggregates box
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Subtotal:', 130, 132);
    doc.text(`$${Number(order.total_amount).toFixed(2)}`, 170, 132);

    doc.text('Tax (5%):', 130, 138);
    const tax = Number(order.total_amount) * 0.05;
    doc.text(`$${tax.toFixed(2)}`, 170, 138);

    // Grand total row
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('GRAND TOTAL:', 130, 146);
    const grandTotal = Number(order.total_amount) + tax;
    doc.text(`$${grandTotal.toFixed(2)}`, 170, 146);

    // Footer lines
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text('Thank you for shopping with ShopSphere!', 20, 260);
    doc.text('This is a computer-generated invoice receipt; no physical signature is required.', 20, 265);
    doc.text('For queries regarding billing, contact billing@shopsphere.com', 20, 270);

    // Output PDF Array Buffer
    const pdfArrayBuffer = doc.output('arraybuffer');
    const pdfBuffer = Buffer.from(pdfArrayBuffer);

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=Invoice_${order.order_id.substring(0, 8).toUpperCase()}.pdf`,
      },
    });
  } catch (err: any) {
    console.error('Invoice generation endpoint error:', err);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
