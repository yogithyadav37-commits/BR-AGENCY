import React, { useState } from 'react';
import { Invoice, InvoicePaymentRecord, Order } from '../types/ink';
import { INK_SERIES, INK_COLORS } from '../data/mockData';
import { 
  X, 
  Printer, 
  Download, 
  CreditCard, 
  CheckCircle2, 
  Building2, 
  Calendar, 
  Clock, 
  ShieldCheck,
  DollarSign,
  MapPin,
  Mail,
  Copy,
  Check
} from 'lucide-react';
import { copyOrderEmailToClipboard } from '../utils/orderEmailSummary';
import { downloadInvoicePdf } from '../utils/invoicePdfGenerator';

interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  order?: Order | null;
  onClose: () => void;
  onRecordPayment: (invoiceId: string, payment: InvoicePaymentRecord) => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  invoice,
  order,
  onClose,
  onRecordPayment,
}) => {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(invoice ? invoice.totalAmount - invoice.paidAmount : 0);
  const [paymentMethod, setPaymentMethod] = useState<InvoicePaymentRecord['method']>('Bank Wire / RTGS');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [emailCopied, setEmailCopied] = useState(false);

  const handleCopyOrderEmail = async () => {
    if (!order) return;
    const ok = await copyOrderEmailToClipboard(order, '₹');
    if (ok) {
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2500);
    }
  };

  if (!invoice) return null;

  const remainingBalance = invoice.totalAmount - invoice.paidAmount;

  const handlePrint = () => {
    window.print();
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0) return;

    const newPayment: InvoicePaymentRecord = {
      id: 'pmt_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      amount: paymentAmount,
      method: paymentMethod,
      referenceNumber: referenceNumber || 'REF-' + Math.floor(100000 + Math.random() * 900000),
      note: paymentNote
    };

    onRecordPayment(invoice.id, newPayment);
    setShowPaymentForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 print:p-0 print:bg-white print:fixed-none">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden print:border-none print:shadow-none print:rounded-none">
        {/* Top Control Bar (Hidden during print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-medium text-cyan-400">
              COMMERCIAL TAX INVOICE
            </span>
            <span className="text-slate-500">/</span>
            <span className="text-xs font-bold text-slate-200 font-mono">
              {invoice.invoiceNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {invoice.status !== 'paid' && (
              <button
                onClick={() => {
                  setPaymentAmount(remainingBalance);
                  setShowPaymentForm(true);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Record Payment</span>
              </button>
            )}

            {order && (
              <button
                type="button"
                onClick={handleCopyOrderEmail}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  emailCopied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-cyan-300'
                }`}
                title="Copy text-based order & invoice summary for client"
              >
                {emailCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Copied Email!</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Copy Client Email</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => downloadInvoicePdf(invoice, order)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              title="Export and download formatted PDF file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
              title="Print invoice or save via browser print"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1"
              title="Exit invoice preview (Close)"
              aria-label="Exit invoice preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Payment Entry Sub-Modal */}
        {showPaymentForm && (
          <div className="p-6 bg-slate-50 border-b border-slate-200 print:hidden">
            <form onSubmit={handleSubmitPayment} className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  Record Customer Remittance
                </h4>
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Settlement Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    max={remainingBalance}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-mono font-medium px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                  <span className="text-[11px] text-slate-500 mt-0.5 block font-mono">
                    Balance: ₹{remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Remittance Channel
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="Bank Wire / RTGS">Bank Wire / RTGS</option>
                    <option value="UPI / Instant Pay">UPI / Instant Pay</option>
                    <option value="Company Cheque">Corporate Cheque</option>
                    <option value="Credit Account">Net Credit Account</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Transaction / UTR Ref #
                  </label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="e.g. UTR-99201948"
                    className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
                >
                  Save Payment Receipt
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Printable Commercial Invoice Body */}
        <div className="p-8 sm:p-10 space-y-8 bg-white text-slate-900">
          {/* Top Header: Company & Invoice Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  BR Agency
                </span>
                <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                  Company Inks
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Specialized Commercial Printing Inks · BIO SPEED &amp; BIO PACK Series
              </p>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                GSTIN: 07AAACB9821R1Z8 · State Code: 07 (Delhi) · HSN: 3215
              </p>
              <p className="text-xs text-slate-500">
                Plot 18, Industrial Area Phase-1, Naraina / Okhla, New Delhi - 110028, India
              </p>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="text-xs font-bold tracking-wider uppercase text-slate-500 block mb-1">
                Commercial Tax Invoice
              </span>
              <p className="text-2xl font-mono font-black text-slate-900 tracking-tight">
                {invoice.invoiceNumber}
              </p>
              <div className="mt-2 space-y-0.5 text-xs text-slate-600 font-mono">
                <div>Issue Date: <span className="font-semibold text-slate-900">{invoice.issueDate}</span></div>
                <div>Due Date: <span className="font-semibold text-slate-900">{invoice.dueDate}</span></div>
                <div>Order Ref: <span className="font-semibold text-slate-900">{invoice.orderNumber}</span></div>
              </div>

              {/* Status Ribbon */}
              <div className="mt-3">
                <span className={`inline-block px-3 py-1 text-xs font-bold tracking-wider uppercase rounded font-mono ${
                  invoice.status === 'paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : invoice.status === 'overdue'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {invoice.status}
                </span>
              </div>
            </div>
          </div>

          {/* Billed To, Shipped To & Dispatch Specifications Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* 1. Billed To */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Billed To (Buyer Entity)
              </span>
              <p className="font-bold text-sm text-slate-900">
                {invoice.customer.companyName}
              </p>
              <p className="text-slate-600 mt-1">
                Attn: {invoice.customer.contactPerson}
              </p>
              <p className="text-slate-600">
                {invoice.customer.address}, {invoice.customer.city}, {invoice.customer.state} {invoice.customer.postalCode}
              </p>
              <p className="text-slate-500 font-mono mt-2">
                Client GSTIN: {invoice.customer.gstNumber}
              </p>
              <p className="text-slate-500 mt-0.5">
                Phone: {invoice.customer.phone}
              </p>
            </div>

            {/* 2. Shipped To / Consignee Delivery Dock */}
            <div className="p-4 bg-cyan-50/40 rounded-xl border border-cyan-200/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-800 block mb-2 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-700" />
                Shipped To (Delivery Dock)
              </span>
              <p className="font-bold text-sm text-slate-900">
                {invoice.deliveryAddress?.plantOrUnitName || invoice.customer.companyName}
              </p>
              <p className="text-slate-700 mt-1">
                {invoice.deliveryAddress?.streetAddress || invoice.customer.address}
                {invoice.deliveryAddress?.landmark ? ` (${invoice.deliveryAddress.landmark})` : ''}
              </p>
              <p className="text-slate-700 font-mono">
                {invoice.deliveryAddress?.city || invoice.customer.city}, {invoice.deliveryAddress?.state || invoice.customer.state} - {invoice.deliveryAddress?.postalCode || invoice.customer.postalCode}
              </p>
              <p className="text-slate-600 font-mono mt-2">
                Dock In-charge: {invoice.deliveryAddress?.dockContactPerson || invoice.customer.contactPerson}
              </p>
              <p className="text-slate-600 font-mono mt-0.5">
                Dock Mobile: {invoice.deliveryAddress?.dockContactPhone || invoice.customer.phone}
              </p>
            </div>

            {/* 3. Company & Technical Specifications */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Equipment &amp; Dispatch Standards
              </span>
              <p className="font-semibold text-slate-900">
                Equipment: {invoice.customer.pressModel}
              </p>
              <p className="text-slate-600 mt-1">
                Payment Terms: <span className="font-semibold text-slate-900">{invoice.paymentTerms}</span>
              </p>
              {invoice.deliveryAddress?.gateOrBayNumber && (
                <p className="text-slate-600 mt-1">
                  Delivery Bay: <span className="font-mono font-medium text-slate-800">{invoice.deliveryAddress.gateOrBayNumber}</span>
                </p>
              )}
              <p className="text-slate-600 mt-1">
                Packaging Standard: Vacuum Sealed &amp; Inert Gas Flushed
              </p>
              <p className="text-slate-600 mt-1">
                Compliance: ISO 2846-1 / ISO 12647-2 Process Inks
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-300 text-slate-500 font-semibold uppercase text-[11px]">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Description of Supply</th>
                  <th className="py-2.5 px-3 font-mono">HSN Code</th>
                  <th className="py-2.5 px-3">Packaging</th>
                  <th className="py-2.5 px-3 text-right font-mono">Total Weight</th>
                  <th className="py-2.5 px-3 text-right font-mono">Rate / kg</th>
                  <th className="py-2.5 px-3 text-right font-mono">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoice.items.map((item, idx) => {
                  const colSpec = INK_COLORS.find(c => c.name === item.color);
                  const series = INK_SERIES[item.seriesId];

                  return (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-2.5 h-2.5 rounded-full inline-block"
                            style={{ backgroundColor: colSpec?.hex }}
                          />
                          <div>
                            <span className="font-bold text-slate-900">
                              {series.name} Process {item.color}
                            </span>
                            <span className="text-[11px] text-slate-500 block">
                              {colSpec?.pigmentName} ({colSpec?.pigmentCode})
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {colSpec?.hsnCode}
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        {item.containersCount}x {item.containerLabel}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-800 tabular-nums">
                        {item.totalKg.toFixed(1)} kg
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-800 tabular-nums">
                        ₹{item.unitPricePerKg.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                        ₹{item.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Subtotals & Math */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t border-slate-200">
            {/* Bank Remittance Details */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs w-full sm:max-w-md">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Electronic Bank Wire & Remittance Details
              </span>
              <div className="space-y-1 font-mono text-slate-700">
                <div>Bank: <span className="font-semibold text-slate-900">{invoice.bankDetails.bankName}</span></div>
                <div>Account: <span className="font-semibold text-slate-900">{invoice.bankDetails.accountName}</span></div>
                <div>Account #: <span className="font-semibold text-slate-900">{invoice.bankDetails.accountNumber}</span></div>
                <div>SWIFT/IFSC: <span className="font-semibold text-slate-900">{invoice.bankDetails.ifscOrSwift}</span></div>
                <div>Branch: <span className="text-slate-600">{invoice.bankDetails.branch}</span></div>
              </div>
            </div>

            {/* Calculations Table */}
            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums font-medium">₹{invoice.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Volume Bulk Discount</span>
                  <span className="font-mono tabular-nums font-medium">-₹{invoice.discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Industrial GST ({invoice.taxRate}%)</span>
                <span className="font-mono tabular-nums font-medium">₹{invoice.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Freight & Transport Fee</span>
                <span className="font-mono tabular-nums font-medium">₹{invoice.shippingFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-3 border-t border-slate-300">
                <span>Total Invoice Due</span>
                <span className="font-mono tabular-nums text-lg text-slate-900">
                  ₹{invoice.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              {invoice.paidAmount > 0 && (
                <div className="flex justify-between text-xs text-emerald-700 font-semibold pt-1">
                  <span>Amount Paid</span>
                  <span className="font-mono tabular-nums">-₹{invoice.paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              {invoice.paidAmount > 0 && invoice.paidAmount < invoice.totalAmount && (
                <div className="flex justify-between text-xs text-rose-700 font-bold pt-1">
                  <span>Balance Outstanding</span>
                  <span className="font-mono tabular-nums">₹{(invoice.totalAmount - invoice.paidAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment History Audit */}
          {invoice.payments && invoice.payments.length > 0 && (
            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs">
              <span className="font-bold text-emerald-900 uppercase text-[11px] block mb-2">
                Settled Payment Receipts
              </span>
              <div className="space-y-1.5 font-mono">
                {invoice.payments.map(p => (
                  <div key={p.id} className="flex justify-between items-center text-emerald-800">
                    <span>
                      {p.date} · {p.method} (Ref: {p.referenceNumber})
                    </span>
                    <span className="font-bold">
                      ₹{p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Terms & Signatures */}
          <div className="pt-6 border-t border-slate-200 text-[11px] text-slate-500 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="font-bold text-slate-700 block mb-1">Standard Company Supply Terms:</span>
              <p>
                1. BR Agency inks are warranted to conform to ISO 2846-1 colorimetry and ISO 12647-2 standards.<br/>
                2. Store containers in a dry area between 15°C and 25°C. Stir thoroughly before production run.<br/>
                3. Overdue accounts subject to 1.5% monthly commercial interest.
              </p>
            </div>
            <div className="text-right flex flex-col justify-end items-end">
              <div className="w-48 border-b border-slate-300 pb-1 mb-1 font-mono text-center text-slate-800 font-semibold">
                Authorized Chemical Signatory
              </div>
              <span>BR Agency Ink Supplies Inc.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
