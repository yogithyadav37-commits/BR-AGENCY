import React, { useState } from 'react';
import { Invoice, InvoicePaymentRecord, Order } from '../types/ink';
import { 
  Search, 
  FileText, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Printer, 
  TrendingUp,
  Receipt,
  Download,
  LogOut
} from 'lucide-react';
import { InvoiceDetailModal } from './InvoiceDetailModal';
import { downloadInvoicePdf } from '../utils/invoicePdfGenerator';

interface InvoiceViewProps {
  invoices: Invoice[];
  orders?: Order[];
  selectedInvoiceId?: string | null;
  onSelectInvoice: (invoiceId: string | null) => void;
  onRecordPayment: (invoiceId: string, payment: InvoicePaymentRecord) => void;
  onNavigateToTracking: (orderId: string) => void;
  onExit?: () => void;
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({
  invoices,
  orders,
  selectedInvoiceId,
  onSelectInvoice,
  onRecordPayment,
  onNavigateToTracking,
  onExit,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'paid'>('all');

  // Metrics
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalOutstanding = totalInvoiced - totalPaid;
  const unpaidCount = invoices.filter(inv => inv.status !== 'paid').length;

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customer.companyName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'unpaid') return inv.status !== 'paid';
    if (statusFilter === 'paid') return inv.status === 'paid';
    return true;
  });

  const activeModalInvoice = invoices.find(inv => inv.id === selectedInvoiceId) || null;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span>Financial Accounting</span>
            <span aria-hidden="true">·</span>
            <span>Commercial Tax Invoices</span>
            <span aria-hidden="true">·</span>
            <span>HSN 3215 Printing Inks</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Commercial Invoice Management & Receivables
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Tax invoice generation, remittance tracking, GST compliance records, and credit settlement for company clients.
          </p>
        </div>

        {onExit && (
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition-colors shrink-0 group self-start sm:self-auto cursor-pointer"
            title="Exit this page and return to main overview"
            aria-label="Exit Invoice page"
          >
            <LogOut className="w-4 h-4 text-slate-500 group-hover:text-rose-600 transition-colors" />
            <span>Exit Page</span>
          </button>
        )}
      </div>

      {/* KPI Financial Strips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Total Invoiced</span>
            <Receipt className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            ₹{totalInvoiced.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Across {invoices.length} commercial orders
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Settled / Collected</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
            ₹{totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Bank wires &amp; RTGS transfers
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Receivables Outstanding</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-700 tabular-nums">
            ₹{totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {unpaidCount} invoices awaiting settlement
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Standard Credit Terms</span>
            <Clock className="w-4 h-4 text-cyan-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            Net 30 Days
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            18% GST / HSN compliant format
          </span>
        </div>
      </div>

      {/* Main Ledger Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* Controls Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Invoice #, Order #, or Company..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`flex-1 sm:flex-none px-3.5 py-1 font-medium rounded-md transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Invoices ({invoices.length})
            </button>
            <button
              onClick={() => setStatusFilter('unpaid')}
              className={`flex-1 sm:flex-none px-3.5 py-1 font-medium rounded-md transition-colors ${
                statusFilter === 'unpaid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Unpaid ({unpaidCount})
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`flex-1 sm:flex-none px-3.5 py-1 font-medium rounded-md transition-colors ${
                statusFilter === 'paid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Paid ({invoices.length - unpaidCount})
            </button>
          </div>
        </div>

        {/* Invoices Data Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Company Client</th>
                <th className="py-3 px-4">Issue / Due Date</th>
                <th className="py-3 px-4 font-mono">Order Ref</th>
                <th className="py-3 px-4 text-right font-mono">Invoice Total</th>
                <th className="py-3 px-4 text-center">Payment Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No invoices matching current filter.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const isPaid = inv.status === 'paid';
                  const totalKg = inv.items.reduce((s, it) => s + it.totalKg, 0);

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {inv.invoiceNumber}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 block">
                          {inv.customer.companyName}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Ship to: {inv.deliveryAddress?.city || inv.customer.city} · {totalKg.toFixed(1)} kg ink
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        <div>{inv.issueDate}</div>
                        <div className="text-[11px] text-slate-400">Due: {inv.dueDate}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => onNavigateToTracking(inv.orderId)}
                          className="font-mono text-slate-700 hover:text-slate-900 hover:underline"
                        >
                          {inv.orderNumber}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                        <span className="font-bold text-sm text-slate-900 block">
                          ₹{inv.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        {inv.paidAmount > 0 && inv.paidAmount < inv.totalAmount && (
                          <span className="text-[11px] text-rose-600 block">
                            Bal: ₹{(inv.totalAmount - inv.paidAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider font-mono ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {inv.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const relatedOrder = orders?.find(
                                o => o.id === inv.orderId || o.orderNumber === inv.orderNumber
                              ) || null;
                              downloadInvoicePdf(inv, relatedOrder);
                            }}
                            className="px-2.5 py-1 text-xs font-medium text-cyan-800 hover:text-cyan-950 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200/80 rounded-md transition-colors inline-flex items-center gap-1 shadow-2xs"
                            title="Download formatted PDF file (jsPDF)"
                          >
                            <Download className="w-3 h-3 text-cyan-700" />
                            <span>Download PDF</span>
                          </button>

                          <button
                            onClick={() => onSelectInvoice(inv.id)}
                            className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors inline-flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" />
                            <span>View / Print</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Detail / Print Modal */}
      {activeModalInvoice && (
        <InvoiceDetailModal
          invoice={activeModalInvoice}
          order={orders?.find(o => o.id === activeModalInvoice.orderId || o.orderNumber === activeModalInvoice.orderNumber) || null}
          onClose={() => onSelectInvoice(null)}
          onRecordPayment={onRecordPayment}
        />
      )}
    </div>
  );
};
