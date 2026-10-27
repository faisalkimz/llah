import prisma from '../../lib/prisma.js';

/**
 * Generate an HTML invoice for PDF rendering.
 * We return clean HTML that the client can print to PDF using window.print() or
 * a server-side solution. This avoids heavy PDF dependencies.
 */
export async function generateInvoiceHtml(invoiceId, organizationId) {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, organizationId },
    include: {
      customer: true,
      lines: true,
      organization: true,
    },
  });

  if (!invoice) {
    const err = new Error('Invoice not found');
    err.status = 404;
    throw err;
  }

  const fmt = (minor) => {
    const n = Number(minor || 0);
    return (n / 100).toLocaleString('en-US', { style: 'currency', currency: invoice.currency || 'USD' });
  };

  const subtotal = Number(invoice.subtotalMinor || 0);
  const discount = Number(invoice.discountMinor || 0);
  const tax = Number(invoice.taxMinor || 0);
  const total = Number(invoice.totalMinor || 0);
  const paid = Number(invoice.amountPaidMinor || 0);
  const due = total - paid;

  const lineRows = (invoice.lines || []).map(line => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#334155">${line.description || '—'}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;text-align:right;font-variant-numeric:tabular-nums">${Number(line.quantity || 0)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;text-align:right;font-variant-numeric:tabular-nums">${fmt(line.unitAmountMinor)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#0f172a;text-align:right;font-weight:500;font-variant-numeric:tabular-nums">${fmt(line.amountMinor)}</td>
    </tr>
  `).join('');

  const createdDate = invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
  const dueDate = invoice.dueAt ? new Date(invoice.dueAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
  const periodStart = invoice.periodStart ? new Date(invoice.periodStart).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
  const periodEnd = invoice.periodEnd ? new Date(invoice.periodEnd).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
  const periodStr = periodStart && periodEnd ? `${periodStart} – ${periodEnd}` : '';

  const statusColors = {
    DRAFT: { bg: '#f5f5f4', text: '#64748b' },
    OPEN: { bg: '#eff6ff', text: '#2563eb' },
    PAID: { bg: '#f0fdf4', text: '#16a34a' },
    VOID: { bg: '#fef2f2', text: '#dc2626' },
    UNCOLLECTIBLE: { bg: '#fef2f2', text: '#dc2626' },
  };
  const sc = statusColors[invoice.status] || statusColors.DRAFT;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.number || invoice.id}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, sans-serif; color: #0f172a; background: #fff; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <!-- Print button -->
  <div class="no-print" style="padding:16px 32px;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;gap:12px">
    <button onclick="window.print()" style="padding:8px 20px;background:#0f172a;color:#fff;border:none;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">
      Download PDF
    </button>
    <button onclick="window.close()" style="padding:8px 20px;background:#fff;color:#0f172a;border:1px solid #e2e8f0;border-radius:6px;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit">
      Close
    </button>
  </div>

  <div style="max-width:800px;margin:0 auto;padding:48px 40px">
    <!-- Header -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px">
      <div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <div style="width:28px;height:28px;background:#0f172a;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:800">L</div>
          <span style="font-size:16px;font-weight:700;letter-spacing:-0.02em">${invoice.organization?.name || 'Llah'}</span>
        </div>
      </div>
      <div style="text-align:right">
        <div style="font-size:28px;font-weight:700;letter-spacing:-0.03em;margin-bottom:4px">Invoice</div>
        <div style="font-size:13px;color:#64748b;font-variant-numeric:tabular-nums">${invoice.number || invoice.id}</div>
      </div>
    </div>

    <!-- Status + dates -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding:20px;background:#fafafa;border-radius:8px;border:1px solid #f1f5f9">
      <div>
        <div style="display:inline-block;padding:3px 10px;border-radius:100px;background:${sc.bg};color:${sc.text};font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">${invoice.status}</div>
        ${periodStr ? `<div style="font-size:12px;color:#64748b;margin-top:8px">Period: ${periodStr}</div>` : ''}
      </div>
      <div style="text-align:right;font-size:13px;color:#64748b;line-height:1.6">
        <div>Issued: <strong style="color:#0f172a">${createdDate}</strong></div>
        <div>Due: <strong style="color:#0f172a">${dueDate}</strong></div>
      </div>
    </div>

    <!-- Bill to -->
    ${invoice.customer ? `
    <div style="margin-bottom:32px">
      <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;margin-bottom:8px">Bill to</div>
      <div style="font-size:15px;font-weight:600;color:#0f172a">${invoice.customer.name}</div>
      ${invoice.customer.email ? `<div style="font-size:13px;color:#64748b;margin-top:2px">${invoice.customer.email}</div>` : ''}
      ${invoice.customer.addressLine1 ? `<div style="font-size:13px;color:#64748b;margin-top:2px">${invoice.customer.addressLine1}</div>` : ''}
      ${invoice.customer.city ? `<div style="font-size:13px;color:#64748b">${[invoice.customer.city, invoice.customer.state, invoice.customer.postalCode].filter(Boolean).join(', ')}</div>` : ''}
      ${invoice.customer.country ? `<div style="font-size:13px;color:#64748b">${invoice.customer.country}</div>` : ''}
    </div>
    ` : ''}

    <!-- Line items -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      <thead>
        <tr style="background:#f8fafc">
          <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#94a3b8;border-bottom:2px solid #e2e8f0">Description</th>
          <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#94a3b8;border-bottom:2px solid #e2e8f0">Qty</th>
          <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#94a3b8;border-bottom:2px solid #e2e8f0">Unit Price</th>
          <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#94a3b8;border-bottom:2px solid #e2e8f0">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${lineRows || '<tr><td colspan="4" style="padding:20px;text-align:center;color:#94a3b8;font-size:13px">No line items</td></tr>'}
      </tbody>
    </table>

    <!-- Totals -->
    <div style="display:flex;justify-content:flex-end">
      <div style="width:280px">
        <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#64748b">
          <span>Subtotal</span>
          <span style="font-variant-numeric:tabular-nums">${fmt(subtotal)}</span>
        </div>
        ${discount ? `
        <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#16a34a">
          <span>Discount</span>
          <span style="font-variant-numeric:tabular-nums">-${fmt(discount)}</span>
        </div>` : ''}
        ${tax ? `
        <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#64748b">
          <span>Tax</span>
          <span style="font-variant-numeric:tabular-nums">${fmt(tax)}</span>
        </div>` : ''}
        <div style="display:flex;justify-content:space-between;padding:10px 0;font-size:15px;font-weight:700;color:#0f172a;border-top:2px solid #0f172a;margin-top:4px">
          <span>Total</span>
          <span style="font-variant-numeric:tabular-nums">${fmt(total)}</span>
        </div>
        ${paid > 0 ? `
        <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#16a34a">
          <span>Paid</span>
          <span style="font-variant-numeric:tabular-nums">-${fmt(paid)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:14px;font-weight:600;color:#0f172a">
          <span>Amount due</span>
          <span style="font-variant-numeric:tabular-nums">${fmt(due)}</span>
        </div>` : ''}
      </div>
    </div>

    <!-- Footer -->
    <div style="margin-top:48px;padding-top:20px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center">
      Generated by Llah · Invoice ${invoice.number || invoice.id}
    </div>
  </div>
</body>
</html>`;
}
