/* ──────────────────────────────────────────────────────────
   InvoiceTemplate — Professional GST-style Indian Invoice
   Matches standard tax invoice format used in Indian businesses.
   Usage: printInvoice(orderDetails, brandName)
────────────────────────────────────────────────────────── */

/* ── Number to Indian words ── */
function numberToWords(n) {
  if (n === 0) return "Zero";
  const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten",
    "Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];

  function convert(num) {
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
    if (num < 1000) return ones[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " " + convert(num % 100) : "");
    if (num < 100000) return convert(Math.floor(num / 1000)) + " Thousand" + (num % 1000 ? " " + convert(num % 1000) : "");
    if (num < 10000000) return convert(Math.floor(num / 100000)) + " Lakh" + (num % 100000 ? " " + convert(num % 100000) : "");
    return convert(Math.floor(num / 10000000)) + " Crore" + (num % 10000000 ? " " + convert(num % 10000000) : "");
  }

  const intPart = Math.floor(Math.abs(n));
  const decPart = Math.round((Math.abs(n) - intPart) * 100);
  let result = "Indian Rupees " + convert(intPart);
  if (decPart > 0) result += " and " + convert(decPart) + " Paise";
  return result + " Only";
}

export function printInvoice(orderDetails, brandName = "Wellmaats") {
  if (!orderDetails) return;

  const dateStr = orderDetails.orderDate
    ? new Date(orderDetails.orderDate).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
      }).replace(/ /g, "-")
    : "—";

  const invoiceNo = `WM/${String(orderDetails._id).slice(-6).toUpperCase()}`;
  const orderIdShort = String(orderDetails._id).slice(-10).toUpperCase();

  const items = orderDetails.cartItems || [];
  const totalQty = items.reduce((s, i) => s + (i.quantity || 1), 0);
  const subtotal = items.reduce((s, i) => s + (Number(i.price || 0) * (i.quantity || 1)), 0);
  const totalAmount = Number(orderDetails.totalAmount || subtotal);
  const walletUsed = Number(orderDetails.walletCreditsUsed || 0);
  const defaultGstRate = Number(orderDetails.gstRate || 5);

  let totalTaxable = 0;
  let totalGst = 0;
  const hsnSummary = {};

  // Build items rows with reverse GST breakdown
  const itemRows = items.map((item, idx) => {
    const qty = item.quantity || 1;
    const rate = Number(item.price || 0);
    const lineTotal = rate * qty;
    const itemGstRate = item.gstRate != null ? Number(item.gstRate) : defaultGstRate;
    const itemHsn = item.hsnCode || "3004";

    const taxable = Number((lineTotal / (1 + itemGstRate / 100)).toFixed(2));
    const gst = Number((lineTotal - taxable).toFixed(2));
    totalTaxable += taxable;
    totalGst += gst;

    if (!hsnSummary[itemHsn]) {
      hsnSummary[itemHsn] = { hsn: itemHsn, rate: itemGstRate, taxable: 0, gst: 0 };
    }
    hsnSummary[itemHsn].taxable += taxable;
    hsnSummary[itemHsn].gst += gst;

    return `
      <tr>
        <td class="bc">${idx + 1}</td>
        <td class="bl">
          <strong>${item.title || "Product"}</strong><br/>
          <span class="sub">HSN: ${itemHsn} | ₹${rate.toLocaleString("en-IN")} (Incl. of ${itemGstRate}% GST)</span>
        </td>
        <td class="bc">${qty}</td>
        <td class="br">₹${rate.toLocaleString("en-IN")}</td>
        <td class="bc">Nos</td>
        <td class="br"><strong>₹${lineTotal.toLocaleString("en-IN")}</strong></td>
      </tr>`;
  }).join("");

  const hsnRows = Object.values(hsnSummary).map((h) => {
    const cgst = Number((h.gst / 2).toFixed(2));
    const sgst = Number((h.gst - cgst).toFixed(2));
    return `
      <tr>
        <td class="bc">${h.hsn}</td>
        <td class="br">₹${h.taxable.toFixed(2)}</td>
        <td class="bc">${(h.rate / 2).toFixed(1)}%</td>
        <td class="br">₹${cgst.toFixed(2)}</td>
        <td class="bc">${(h.rate / 2).toFixed(1)}%</td>
        <td class="br">₹${sgst.toFixed(2)}</td>
        <td class="br"><strong>₹${h.gst.toFixed(2)}</strong></td>
      </tr>`;
  }).join("");

  // Empty rows to fill table height (minimum 3 empty rows for aesthetics)
  const emptyCount = Math.max(0, 3 - items.length);
  const emptyRows = Array(emptyCount).fill(
    `<tr><td class="bc">&nbsp;</td><td class="bl">&nbsp;</td><td class="bc"></td><td class="br"></td><td class="bc"></td><td class="br"></td></tr>`
  ).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice ${invoiceNo}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; color: #111; background: #fff; font-size: 12px; }
    .page { max-width: 800px; margin: 0 auto; padding: 20px; }

    /* Main outer border */
    .invoice-box { border: 2px solid #111; }

    /* Title */
    .inv-title {
      text-align: center; font-size: 20px; font-weight: 900;
      padding: 8px 0; border-bottom: 2px solid #111;
      letter-spacing: 3px; text-transform: uppercase;
    }

    /* ─── Top section: seller + meta ─── */
    .top-section { display: flex; border-bottom: 1px solid #111; }
    .seller-info {
      width: 50%; padding: 10px 12px; border-right: 1px solid #111;
      font-size: 11px; line-height: 1.6;
    }
    .seller-info .company { font-size: 14px; font-weight: 800; text-transform: uppercase; color: #108644; }
    .meta-grid { width: 50%; }
    .meta-row { display: flex; border-bottom: 1px solid #ddd; }
    .meta-row:last-child { border-bottom: none; }
    .meta-label { width: 50%; padding: 3px 8px; font-size: 10.5px; color: #444; border-right: 1px solid #ddd; }
    .meta-value { width: 50%; padding: 3px 8px; font-size: 11px; font-weight: 600; }

    /* ─── Buyer section ─── */
    .buyer-section { border-bottom: 1px solid #111; padding: 10px 12px; font-size: 11px; line-height: 1.6; }
    .buyer-label { font-size: 10px; color: #666; }
    .buyer-name { font-size: 13px; font-weight: 800; margin: 2px 0; }
    .buyer-details { display: flex; gap: 40px; flex-wrap: wrap; }
    .buyer-details span { white-space: nowrap; }

    /* ─── Items table ─── */
    .items-table { width: 100%; border-collapse: collapse; }
    .items-table th {
      background: #f5f5f5; border-bottom: 2px solid #111; border-top: 1px solid #111;
      padding: 6px 8px; font-size: 10.5px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.3px;
    }
    .items-table td {
      padding: 6px 8px; border-bottom: 1px solid #e0e0e0;
      font-size: 11.5px; vertical-align: top;
    }
    .items-table tr:last-child td { border-bottom: 1px solid #111; }
    .bl { text-align: left; }
    .bc { text-align: center; }
    .br { text-align: right; }
    .sub { font-size: 10px; color: #666; font-style: italic; }

    /* ─── Extra charges rows ─── */
    .extra-row { display: flex; border-bottom: 1px solid #ddd; }
    .extra-label { flex: 1; padding: 4px 12px; text-align: right; font-weight: 700; font-size: 11px; font-style: italic; }
    .extra-value { width: 120px; padding: 4px 12px; text-align: right; font-weight: 700; font-size: 12px; }

    /* ─── Totals ─── */
    .total-bar {
      display: flex; border-top: 2px solid #111; border-bottom: 2px solid #111;
      background: #fafafa;
    }
    .total-label { flex: 1; padding: 8px 12px; font-weight: 800; font-size: 13px; text-align: right; }
    .total-value { width: 160px; padding: 8px 12px; text-align: right; font-weight: 900; font-size: 16px; }
    .total-value .rs { font-family: Arial, sans-serif; }

    /* ─── Amount in words ─── */
    .amount-words {
      padding: 6px 12px; font-size: 11px; border-bottom: 1px solid #111;
    }
    .amount-words strong { font-size: 11.5px; }

    /* ─── Tax table ─── */
    .tax-table { width: 100%; border-collapse: collapse; font-size: 10.5px; }
    .tax-table th {
      background: #f5f5f5; padding: 4px 6px; border: 1px solid #ccc;
      font-weight: 700; text-align: center;
    }
    .tax-table td { padding: 4px 6px; border: 1px solid #ccc; text-align: right; }
    .tax-section { border-bottom: 1px solid #111; padding: 8px 12px; }

    /* ─── Footer area ─── */
    .footer-grid { display: flex; border-bottom: 1px solid #111; }
    .declaration {
      flex: 1; padding: 10px 12px; font-size: 10px; color: #444;
      line-height: 1.6; border-right: 1px solid #111;
    }
    .signatory {
      width: 260px; padding: 10px 12px; text-align: right;
      display: flex; flex-direction: column; justify-content: space-between;
    }
    .signatory .for-company { font-size: 11px; font-weight: 700; }
    .signatory .auth { font-size: 10px; color: #666; margin-top: 40px; }

    .jurisdiction {
      text-align: center; padding: 6px; font-size: 9.5px; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.5px; color: #555;
      border-bottom: 1px solid #111;
    }
    .computer-gen {
      text-align: center; padding: 5px; font-size: 9px; color: #888;
    }

    .pan-row { padding: 4px 12px; font-size: 10.5px; border-bottom: 1px solid #111; }

    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .page { padding: 0; margin: 0; max-width: 100%; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="invoice-box">

      <!-- ═══ TITLE ═══ -->
      <div class="inv-title">Invoice</div>

      <!-- ═══ TOP SECTION: Seller + Meta ═══ -->
      <div class="top-section">
        <div class="seller-info">
          <div class="company">${brandName}</div>
          Maats Value Industries Limited<br/>
          New Delhi, India<br/>
          E-Mail: support@wellmaats.in<br/>
          www.wellmaats.in<br/>
          ${orderDetails.gstNumber ? `<strong>GSTIN:</strong> ${orderDetails.gstNumber}<br/>` : "<strong>GSTIN:</strong> 07AABCW1234D1Z5<br/>"}
          ${orderDetails.panNumber ? `<strong>PAN:</strong> ${orderDetails.panNumber}<br/>` : "<strong>PAN:</strong> AABCW1234D<br/>"}
          <br/>
          <span class="buyer-label">Buyer (Bill to)</span><br/>
          <div class="buyer-name">${orderDetails.customerInfo?.userName || orderDetails.addressInfo?.name || "Customer"}</div>
          ${orderDetails.addressInfo?.address || "—"}<br/>
          ${orderDetails.addressInfo?.city || ""}${orderDetails.addressInfo?.pincode ? ", " + orderDetails.addressInfo.pincode : ""}<br/>
          Contact : ${orderDetails.addressInfo?.phone ? "+91 " + orderDetails.addressInfo.phone : "—"}<br/>
          ${orderDetails.customerInfo?.email ? "Email : " + orderDetails.customerInfo.email : ""}
        </div>

        <div class="meta-grid">
          <div class="meta-row">
            <div class="meta-label">Invoice No.</div>
            <div class="meta-value">${invoiceNo}</div>
          </div>
          <div class="meta-row">
            <div class="meta-label">Dated</div>
            <div class="meta-value">${dateStr}</div>
          </div>
          <div class="meta-row">
            <div class="meta-label">Mode/Terms of Payment</div>
            <div class="meta-value" style="text-transform:capitalize">${orderDetails.paymentMethod || "Online"}</div>
          </div>
          <div class="meta-row">
            <div class="meta-label">Payment Status</div>
            <div class="meta-value" style="text-transform:capitalize">${orderDetails.paymentStatus || "Pending"}</div>
          </div>
          <div class="meta-row">
            <div class="meta-label">Order No. & Date</div>
            <div class="meta-value">${orderIdShort} dt. ${dateStr}</div>
          </div>
          <div class="meta-row">
            <div class="meta-label">Order Status</div>
            <div class="meta-value" style="text-transform:capitalize">${orderDetails.orderStatus || "Processing"}</div>
          </div>
          <div class="meta-row">
            <div class="meta-label">Dispatch Doc No.</div>
            <div class="meta-value">${orderDetails.paymentId || "—"}</div>
          </div>
          <div class="meta-row">
            <div class="meta-label">Dispatched Through</div>
            <div class="meta-value">Speed Post / Courier</div>
          </div>
          <div class="meta-row">
            <div class="meta-label">Destination</div>
            <div class="meta-value">${orderDetails.addressInfo?.city || "—"}</div>
          </div>
        </div>
      </div>

      <!-- ═══ ITEMS TABLE ═══ -->
      <table class="items-table">
        <thead>
          <tr>
            <th style="width:40px;text-align:center">Sl<br/>No.</th>
            <th style="text-align:left">Description of Goods</th>
            <th style="width:60px;text-align:center">Quantity</th>
            <th style="width:90px;text-align:right">Rate</th>
            <th style="width:50px;text-align:center">per</th>
            <th style="width:100px;text-align:right">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
          ${emptyRows}
        </tbody>
      </table>

      <!-- ═══ EXTRA CHARGES / DELIVERY / CREDITS ═══ -->
      ${Number(orderDetails.deliveryCharges) > 0 ? `
      <div class="extra-row">
        <div class="extra-label">Delivery Charges ${orderDetails.totalWeightGrams ? `(${orderDetails.totalWeightGrams >= 1000 ? `${(orderDetails.totalWeightGrams/1000).toFixed(2)} kg` : `${orderDetails.totalWeightGrams} g`})` : ""}</div>
        <div class="extra-value">+ ₹${Number(orderDetails.deliveryCharges).toFixed(2)}</div>
      </div>` : `
      <div class="extra-row">
        <div class="extra-label">Delivery Charges</div>
        <div class="extra-value" style="color:#108644;font-weight:600">FREE</div>
      </div>`}

      ${walletUsed > 0 ? `
      <div class="extra-row">
        <div class="extra-label">Wallet Credits Used</div>
        <div class="extra-value">- ₹${walletUsed.toLocaleString("en-IN")}</div>
      </div>` : ""}

      <!-- ═══ TOTAL BAR ═══ -->
      <div class="total-bar">
        <div class="total-label">Total</div>
        <div class="total-value"><span class="rs">₹</span> ${totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
      </div>

      <!-- ═══ AMOUNT IN WORDS ═══ -->
      <div class="amount-words">
        Amount Chargeable (in words):<br/>
        <strong>${numberToWords(totalAmount)}</strong>
      </div>

      <!-- ═══ OFFICIAL GST SCHEDULE TABLE ═══ -->
      <div class="tax-section">
        <div style="font-size:10px;font-weight:700;margin-bottom:4px;text-transform:uppercase;color:#333;">
          GST Tax Schedule (Reverse Calculation — Selling Prices are Inclusive of Tax)
        </div>
        <table class="tax-table">
          <thead>
            <tr>
              <th rowspan="2" style="width:70px">HSN/SAC</th>
              <th rowspan="2">Taxable Value (₹)</th>
              <th colspan="2">Central Tax (CGST)</th>
              <th colspan="2">State Tax (SGST)</th>
              <th rowspan="2">Total Tax (₹)</th>
            </tr>
            <tr>
              <th style="width:45px">Rate</th>
              <th style="width:75px">Amount (₹)</th>
              <th style="width:45px">Rate</th>
              <th style="width:75px">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${hsnRows || `<tr><td class="bc">3004</td><td class="br">₹${totalTaxable.toFixed(2)}</td><td class="bc">2.5%</td><td class="br">₹${(totalGst/2).toFixed(2)}</td><td class="bc">2.5%</td><td class="br">₹${(totalGst/2).toFixed(2)}</td><td class="br">₹${totalGst.toFixed(2)}</td></tr>`}
            <tr style="font-weight:700;background:#f9f9f9">
              <td class="bc">Total</td>
              <td class="br">₹${totalTaxable.toFixed(2)}</td>
              <td class="bc">-</td>
              <td class="br">₹${(totalGst / 2).toFixed(2)}</td>
              <td class="bc">-</td>
              <td class="br">₹${(totalGst - totalGst / 2).toFixed(2)}</td>
              <td class="br">₹${totalGst.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        <div style="font-size:9.5px;color:#666;margin-top:4px;text-align:right">
          <em>Tax Amount (in words): ${numberToWords(totalGst)}</em>
        </div>
      </div>

      <!-- ═══ DECLARATION + SIGNATORY ═══ -->
      <div class="footer-grid">
        <div class="declaration">
          <strong>Declaration</strong><br/>
          This is a Computer Generated Invoice. We declare that
          this invoice shows the actual price of the goods
          described and that all particulars are true and correct.
          ${orderDetails.addressInfo?.notes ? `<br/><br/><em>Customer Note: ${orderDetails.addressInfo.notes}</em>` : ""}
        </div>
        <div class="signatory">
          <div class="for-company">for ${brandName.toUpperCase()}</div>
          <div class="auth">Authorised Signatory</div>
        </div>
      </div>

      <!-- ═══ JURISDICTION ═══ -->
      <div class="jurisdiction">Subject to New Delhi Jurisdiction</div>

      <!-- ═══ COMPUTER GENERATED ═══ -->
      <div class="computer-gen">This is a Computer Generated Invoice</div>

    </div><!-- /invoice-box -->
  </div><!-- /page -->

  <script>window.onload = () => window.print();</script>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
