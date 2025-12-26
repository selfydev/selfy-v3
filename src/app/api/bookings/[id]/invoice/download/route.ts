import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';

// Generate and download invoice PDF
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        customer: true,
        product: true,
        org: true,
        addOns: {
          include: {
            addOn: true,
          },
        },
        payments: {
          where: {
            status: 'COMPLETED',
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (!booking.invoiceNumber) {
      return NextResponse.json(
        { error: 'Invoice not yet created for this booking' },
        { status: 400 }
      );
    }

    // Generate invoice HTML (simple version - can be enhanced with PDF library later)
    const invoiceHtml = generateInvoiceHtml(booking);

    // For now, return HTML. In production, you'd use a PDF library like pdfkit or puppeteer
    return new NextResponse(invoiceHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="invoice-${booking.invoiceNumber}.html"`,
      },
    });
  } catch (error) {
    console.error('Invoice download error:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    );
  }
}

function generateInvoiceHtml(booking: any): string {
  const totalPaid = booking.payments.reduce((sum: number, p: any) => sum + p.amount, 0);
  const balanceDue = booking.finalPrice - totalPaid;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice ${booking.invoiceNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
    .invoice-number { font-size: 24px; font-weight: bold; }
    .details { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 30px 0; }
    .items { margin: 30px 0; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f5f5f5; }
    .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>INVOICE</h1>
    <div class="invoice-number">${booking.invoiceNumber}</div>
    <div>Date: ${new Date(booking.invoiceSentAt || booking.createdAt).toLocaleDateString()}</div>
  </div>

  <div class="details">
    <div>
      <h3>Bill To:</h3>
      <p><strong>${booking.org?.name || booking.customer.name || 'N/A'}</strong></p>
      ${booking.org?.address ? `<p>${booking.org.address}</p>` : ''}
      ${booking.org?.email ? `<p>${booking.org.email}</p>` : ''}
      ${booking.poNumber ? `<p>PO Number: ${booking.poNumber}</p>` : ''}
      ${booking.costCentre ? `<p>Cost Centre: ${booking.costCentre}</p>` : ''}
    </div>
    <div>
      <h3>Booking Details:</h3>
      <p>Booking #: ${booking.bookingNumber}</p>
      <p>Date: ${new Date(booking.scheduledAt).toLocaleDateString()}</p>
      <p>Time: ${new Date(booking.scheduledAt).toLocaleTimeString()}</p>
    </div>
  </div>

  <div class="items">
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th>Quantity</th>
          <th>Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${booking.product.name}</td>
          <td>1</td>
          <td>$${booking.finalPrice.toFixed(2)}</td>
          <td>$${booking.finalPrice.toFixed(2)}</td>
        </tr>
        ${booking.addOns.map((ba: any) => `
        <tr>
          <td>${ba.addOn.name} (Add-on)</td>
          <td>${ba.quantity}</td>
          <td>$${ba.price.toFixed(2)}</td>
          <td>$${(ba.price * ba.quantity).toFixed(2)}</td>
        </tr>
        `).join('')}
        ${booking.vatAmount ? `
        <tr>
          <td colspan="3">VAT (${booking.vatRate || 0}%)</td>
          <td>$${booking.vatAmount.toFixed(2)}</td>
        </tr>
        ` : ''}
      </tbody>
    </table>
  </div>

  <div class="total">
    <p>Subtotal: $${booking.finalPrice.toFixed(2)}</p>
    ${totalPaid > 0 ? `<p>Paid: $${totalPaid.toFixed(2)}</p>` : ''}
    <p>Balance Due: $${balanceDue.toFixed(2)}</p>
    ${booking.netTerms ? `<p>Payment Terms: Net ${booking.netTerms} days</p>` : ''}
  </div>

  <div class="footer">
    <p>Thank you for your business!</p>
    <p>Please remit payment according to the terms above.</p>
  </div>
</body>
</html>
  `.trim();
}
