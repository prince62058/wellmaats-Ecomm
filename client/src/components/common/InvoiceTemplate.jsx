/* ──────────────────────────────────────────────────────────
   InvoiceTemplate — generates a printable/downloadable invoice
   Usage: printInvoice(orderDetails, brandName)
────────────────────────────────────────────────────────── */

export function printInvoice(orderDetails, brandName = "Wellmaats") {
  if (!orderDetails) return;

  const dateStr = orderDetails.orderDate
    ? new Date(orderDetails.orderDate).toLocaleDateString("en-IN", {
        day: "2-digit", month: "long", year: "numeric",
      })
    : "—";

  const invoiceId = `INV-${String(orderDetails._id).slice(-8).toUpperCase()}`;

  const rows = (orderDetails.cartItems || [])
    .map((item, idx) => `
      <tr class="${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}">
        <td class="py-2 px-3">${item.title || "Product"}</td>
        <td class="py-2 px-3 text-center">${item.quantity || 1}</td>
        <td class="py-2 px-3 text-right">₹${Number(item.price || 0).toLocaleString("en-IN")}</td>
        <td class="py-2 px-3 text-right font-semibold">₹${(Number(item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}</td>
      </tr>`)
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice ${invoiceId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; background: #fff; }
    .page { max-width: 820px; margin: 0 auto; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
    .brand-name { font-size: 28px; font-weight: 800; color: #108644; letter-spacing: -0.5px; }
    .brand-tagline { font-size: 12px; color: #666; margin-top: 2px; }
    .invoice-meta { text-align: right; }
    .invoice-meta h2 { font-size: 22px; font-weight: 700; color: #108644; }
    .invoice-meta p { font-size: 13px; color: #555; margin-top: 4px; }
    .divider { border: none; border-top: 2px solid #108644; margin: 20px 0; }
    .thin-divider { border: none; border-top: 1px solid #e5e7eb; margin: 16px 0; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
    .info-block h4 { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #108644; letter-spacing: 0.5px; margin-bottom: 6px; }
    .info-block p { font-size: 13px; color: #333; line-height: 1.6; }
    .info-block p strong { color: #111; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    thead { background: #108644; color: white; }
    thead th { padding: 10px 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.3px; }
    thead th:last-child, thead th:nth-child(3), thead th:nth-child(2) { text-align: right; }
    thead th:nth-child(2) { text-align: center; }
    tbody td { font-size: 13px; }
    .bg-white { background: white; }
    .bg-gray-50 { background: #f9fafb; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .py-2 { padding-top: 8px; padding-bottom: 8px; }
    .px-3 { padding-left: 12px; padding-right: 12px; }
    .font-semibold { font-weight: 600; }
    .totals { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; margin-top: 8px; }
    .totals .row { display: flex; gap: 60px; font-size: 14px; }
    .totals .row.total { font-size: 18px; font-weight: 800; color: #108644; margin-top: 6px; }
    .totals .row span:first-child { color: #555; }
    .footer { margin-top: 48px; text-align: center; font-size: 11px; color: #888; line-height: 1.8; }
    .status-badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: capitalize; }
    .status-delivered { background: #dcfce7; color: #166534; }
    .status-pending { background: #fef9c3; color: #92400e; }
    .status-default { background: #e0f2fe; color: #0369a1; }
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div>
        <div class="brand-name">${brandName}</div>
        <div class="brand-tagline">Wellness for Every Home</div>
      </div>
      <div class="invoice-meta">
        <h2>INVOICE</h2>
        <p><strong>${invoiceId}</strong></p>
        <p>Date: ${dateStr}</p>
        <p>
          <span class="status-badge ${
            orderDetails.orderStatus === "delivered" ? "status-delivered"
            : orderDetails.orderStatus === "pending" ? "status-pending"
            : "status-default"
          }">${orderDetails.orderStatus || "processing"}</span>
        </p>
      </div>
    </div>

    <hr class="divider" />

    <!-- Info Grid -->
    <div class="info-grid">
      <div class="info-block">
        <h4>Bill To</h4>
        <p><strong>${orderDetails.customerInfo?.userName || orderDetails.addressInfo?.name || "Customer"}</strong></p>
        <p>${orderDetails.customerInfo?.email || "—"}</p>
        <p>${orderDetails.addressInfo?.phone ? `+91 ${orderDetails.addressInfo.phone}` : ""}</p>
      </div>
      <div class="info-block">
        <h4>Ship To</h4>
        <p>${orderDetails.addressInfo?.address || "—"}</p>
        <p>${orderDetails.addressInfo?.city || ""}${orderDetails.addressInfo?.pincode ? ` — ${orderDetails.addressInfo.pincode}` : ""}</p>
        ${orderDetails.addressInfo?.notes ? `<p style="color:#666;font-size:12px;margin-top:4px">Note: ${orderDetails.addressInfo.notes}</p>` : ""}
      </div>
      <div class="info-block">
        <h4>Payment</h4>
        <p><strong>${orderDetails.paymentMethod || "Online"}</strong></p>
        <p>Status: ${orderDetails.paymentStatus || "pending"}</p>
        ${orderDetails.paymentId ? `<p style="font-size:11px;color:#666">Ref: ${orderDetails.paymentId}</p>` : ""}
      </div>
      <div class="info-block">
        <h4>Order Info</h4>
        <p>Order ID: <strong>${String(orderDetails._id).slice(-10)}</strong></p>
        <p>Date: ${dateStr}</p>
      </div>
    </div>

    <hr class="thin-divider" />

    <!-- Items Table -->
    <table>
      <thead>
        <tr>
          <th style="text-align:left">Product</th>
          <th style="text-align:center">Qty</th>
          <th style="text-align:right">Unit Price</th>
          <th style="text-align:right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <!-- Totals -->
    <hr class="thin-divider" />
    <div class="totals">
      ${orderDetails.walletCreditsUsed > 0 ? `
      <div class="row">
        <span>Wallet Credits Used</span>
        <span>- ₹${Number(orderDetails.walletCreditsUsed).toLocaleString("en-IN")}</span>
      </div>` : ""}
      <div class="row total">
        <span>Total Amount</span>
        <span>₹${Number(orderDetails.totalAmount || 0).toLocaleString("en-IN")}</span>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <hr class="thin-divider" style="margin: 32px 0 16px" />
      <p>Thank you for shopping with <strong>${brandName}</strong>!</p>
      <p>For support, contact us at support@wellmaats.in</p>
      <p style="margin-top:8px;color:#bbb">This is a computer-generated invoice. No signature required.</p>
    </div>
  </div>

  <script>window.onload = () => window.print();</script>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
