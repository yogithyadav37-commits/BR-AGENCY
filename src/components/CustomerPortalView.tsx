import React, { useState, useMemo } from 'react';
import { 
  CustomerProfile, 
  Order, 
  Invoice, 
  OrderStatus, 
  OrderItem 
} from '../types/ink';
import { INK_SERIES, INK_COLORS, CONTAINER_OPTIONS } from '../data/mockData';
import { 
  Package, 
  Receipt, 
  MapPin, 
  Truck, 
  RefreshCw, 
  Download, 
  Printer, 
  Search, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  ExternalLink, 
  Plus, 
  LogOut, 
  Phone, 
  Mail, 
  Building2, 
  FileText,
  AlertCircle,
  CreditCard,
  Check,
  ChevronRight,
  Filter
} from 'lucide-react';
import { downloadInvoicePdf } from '../utils/invoicePdfGenerator';
import { InvoiceDetailModal } from './InvoiceDetailModal';

interface CustomerPortalViewProps {
  customer: CustomerProfile;
  orders: Order[];
  invoices: Invoice[];
  onSignOut: () => void;
  onNavigateToNewOrder: () => void;
  onReorderItems?: (items: OrderItem[], seriesId?: string) => void;
  onNavigateToTracking: (orderId: string) => void;
}

export const CustomerPortalView: React.FC<CustomerPortalViewProps> = ({
  customer,
  orders,
  invoices,
  onSignOut,
  onNavigateToNewOrder,
  onReorderItems,
  onNavigateToTracking,
}) => {
  const [activePortalTab, setActivePortalTab] = useState<'orders' | 'invoices' | 'addresses'>('orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Filter orders belonging to this customer
  const customerOrders = useMemo(() => {
    return orders.filter(o => {
      const matchId = o.customer?.id === customer.id;
      const matchPhone = o.customer?.phone && customer.phone && (
        o.customer.phone.replace(/\D/g, '').endsWith(customer.phone.replace(/\D/g, '').slice(-10))
      );
      const matchName = o.customer?.companyName?.toLowerCase() === customer.companyName?.toLowerCase();
      return matchId || matchPhone || matchName;
    });
  }, [orders, customer]);

  // Filter invoices belonging to this customer
  const customerInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchId = inv.customer?.id === customer.id;
      const matchPhone = inv.customer?.phone && customer.phone && (
        inv.customer.phone.replace(/\D/g, '').endsWith(customer.phone.replace(/\D/g, '').slice(-10))
      );
      const matchName = inv.customer?.companyName?.toLowerCase() === customer.companyName?.toLowerCase();
      return matchId || matchPhone || matchName;
    });
  }, [invoices, customer]);

  // Computed Account Metrics
  const totalSpend = useMemo(() => {
    return customerInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  }, [customerInvoices]);

  const outstandingBalance = useMemo(() => {
    return customerInvoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);
  }, [customerInvoices]);

  const totalKgOrdered = useMemo(() => {
    return customerOrders.reduce((sum, o) => sum + o.totalKg, 0);
  }, [customerOrders]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return customerOrders.filter(order => {
      const matchesSearch = 
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.pressJobRef && order.pressJobRef.toLowerCase().includes(searchQuery.toLowerCase())) ||
        order.items.some(it => it.color.toLowerCase().includes(searchQuery.toLowerCase()) || it.seriesId.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'in_progress' && (order.status === 'received' || order.status === 'formulation' || order.status === 'qc_passed' || order.status === 'packed')) ||
        (statusFilter === 'dispatched' && order.status === 'dispatched') ||
        (statusFilter === 'delivered' && order.status === 'delivered');

      return matchesSearch && matchesStatus;
    });
  }, [customerOrders, searchQuery, statusFilter]);

  // Filtered invoices list
  const filteredInvoices = useMemo(() => {
    return customerInvoices.filter(inv => {
      const matchesSearch = 
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'unpaid' && inv.status === 'unpaid') ||
        (statusFilter === 'paid' && inv.status === 'paid') ||
        (statusFilter === 'partial' && inv.status === 'partial');

      return matchesSearch && matchesStatus;
    });
  }, [customerInvoices, searchQuery, statusFilter]);

  const handleDownloadPdf = (inv: Invoice) => {
    const matchingOrder = customerOrders.find(o => o.id === inv.orderId || o.orderNumber === inv.orderNumber);
    downloadInvoicePdf(inv, matchingOrder);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'received':
        return <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">Order Received</span>;
      case 'formulation':
        return <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">Formulation &amp; Blending</span>;
      case 'qc_passed':
        return <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">QC Passed</span>;
      case 'packed':
        return <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">Packed in Cans/Boxes</span>;
      case 'dispatched':
        return <span className="text-xs font-semibold text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-md border border-cyan-200">Dispatched / En Route</span>;
      case 'delivered':
        return <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">Delivered</span>;
      default:
        return null;
    }
  };

  const getInvoiceStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">Paid in Full</span>;
      case 'partial':
        return <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">Partially Paid</span>;
      case 'unpaid':
      case 'overdue':
        return <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200">Payment Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Account Hero Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 lg:p-8 shadow-md border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-400">
              <span className="font-semibold text-cyan-400 uppercase tracking-wider">
                Self-Service Company Portal
              </span>
              <span aria-hidden="true">·</span>
              <span>Company ID: <strong className="font-mono text-slate-300">{customer.id}</strong></span>
              <span aria-hidden="true">·</span>
              <span>GSTIN: <strong className="font-mono text-slate-300">{customer.gstNumber || 'Unregistered'}</strong></span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>{customer.companyName}</span>
            </h1>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{customer.contactPerson}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-mono">{customer.phone}</span>
              </span>
              {customer.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{customer.email}</span>
                </span>
              )}
              {customer.pressModel && (
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Printer className="w-3.5 h-3.5" />
                  <span>{customer.pressModel}</span>
                </span>
              )}
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onNavigateToNewOrder}
              className="px-4 py-2 text-xs font-bold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-900" />
              <span>Place New Ink Order</span>
            </button>
            <button
              type="button"
              onClick={onSignOut}
              className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Sign out from this device"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Account Metric Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-800">
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Orders</p>
            <p className="text-xl font-bold font-mono text-white mt-0.5 tabular-nums">
              {customerOrders.length}
            </p>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Volume Supplied</p>
            <p className="text-xl font-bold font-mono text-cyan-400 mt-0.5 tabular-nums">
              {totalKgOrdered.toFixed(1)} <span className="text-xs font-normal text-slate-400">kg</span>
            </p>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Invoiced</p>
            <p className="text-xl font-bold font-mono text-white mt-0.5 tabular-nums">
              ₹{totalSpend.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Outstanding Balance</p>
            <p className={`text-xl font-bold font-mono mt-0.5 tabular-nums ${
              outstandingBalance > 0 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              ₹{outstandingBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Portal Sub-Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setActivePortalTab('orders');
              setStatusFilter('all');
            }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
              activePortalTab === 'orders'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4 text-cyan-600" />
            <span>My Orders &amp; Dispatches</span>
            <span className="font-mono text-[11px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700">
              {customerOrders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActivePortalTab('invoices');
              setStatusFilter('all');
            }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
              activePortalTab === 'invoices'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-4 h-4 text-emerald-600" />
            <span>Tax Invoices &amp; Bills</span>
            <span className="font-mono text-[11px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700">
              {customerInvoices.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActivePortalTab('addresses');
              setStatusFilter('all');
            }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
              activePortalTab === 'addresses'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-4 h-4 text-purple-600" />
            <span>Company Delivery Hub</span>
          </button>
        </div>

        {/* Live Search Input */}
        {activePortalTab !== 'addresses' && (
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activePortalTab === 'orders' ? 'Search Order #, PO, color...' : 'Search Invoice #, Order #...'}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:border-cyan-600"
              />
            </div>

            {/* Status Filter for Orders */}
            {activePortalTab === 'orders' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:border-cyan-600"
              >
                <option value="all">All Statuses</option>
                <option value="in_progress">In Progress</option>
                <option value="dispatched">Dispatched</option>
                <option value="delivered">Delivered</option>
              </select>
            )}

            {/* Status Filter for Invoices */}
            {activePortalTab === 'invoices' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:border-cyan-600"
              >
                <option value="all">All Bills</option>
                <option value="unpaid">Payment Pending</option>
                <option value="partial">Partially Paid</option>
                <option value="paid">Paid in Full</option>
              </select>
            )}
          </div>
        )}
      </div>

      {/* 3. Tab Content Area */}
      {/* ======================================================== */}
      {/* TAB 1: ORDERS & TRACKING */}
      {/* ======================================================== */}
      {activePortalTab === 'orders' && (
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-3">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No Orders Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchQuery || statusFilter !== 'all' 
                  ? 'No orders matched your current search or filter. Try clearing the search.'
                  : 'You have not placed any ink orders yet under this account. Place your first order to get live dispatch updates.'}
              </p>
              <button
                type="button"
                onClick={onNavigateToNewOrder}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
                <span>Place First Ink Order</span>
              </button>
            </div>
          ) : (
            filteredOrders.map(order => {
              const matchingInvoice = customerInvoices.find(inv => inv.orderId === order.id || inv.orderNumber === order.orderNumber);

              return (
                <div 
                  key={order.id} 
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition-colors space-y-4"
                >
                  {/* Order Top Strip */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-sm font-extrabold font-mono text-slate-900">
                        {order.orderNumber}
                      </span>
                      {order.pressJobRef && (
                        <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          PO: {order.pressJobRef}
                        </span>
                      )}
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{order.createdAt}</span>
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="text-xs text-slate-600 font-medium">
                        {order.priority}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(order.status)}
                    </div>
                  </div>

                  {/* Order Formulation Items Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-8 space-y-2">
                      <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Ink Formulations &amp; Packaging
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {order.items.map((item, idx) => {
                          const containerInfo = CONTAINER_OPTIONS.find(c => c.id === item.containerId);
                          const colorSpec = INK_COLORS.find(c => c.name === item.color);

                          return (
                            <div 
                              key={idx}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                            >
                              <div className="flex items-center gap-2.5">
                                <span 
                                  className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                                  style={{ backgroundColor: colorSpec?.hex || '#009FE3' }}
                                />
                                <div>
                                  <p className="font-bold text-slate-800">
                                    {item.color} · {INK_SERIES[item.seriesId]?.name || item.seriesId}
                                  </p>
                                  <p className="text-[11px] text-slate-500">
                                    {item.containersCount} × {containerInfo?.shortLabel || item.containerId}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-mono font-bold text-slate-900 tabular-nums">
                                  {item.totalKg.toFixed(1)} kg
                                </p>
                                <p className="text-[11px] font-mono text-slate-500 tabular-nums">
                                  ₹{item.totalPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Order Financials & Action Buttons */}
                    <div className="md:col-span-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200 flex flex-col justify-between gap-3 h-full">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>Total Weight:</span>
                          <span className="font-mono font-bold text-slate-800 tabular-nums">{order.totalKg.toFixed(1)} kg</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>Tax (12% GST):</span>
                          <span className="font-mono text-slate-800 tabular-nums">₹{order.taxAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                          <span>Total Amount:</span>
                          <span className="font-mono tabular-nums">₹{order.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 pt-2">
                        {/* Live Tracking Link */}
                        <button
                          type="button"
                          onClick={() => onNavigateToTracking(order.id)}
                          className="w-full py-2 px-3 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5 text-cyan-600" />
                          <span>Track Live Dispatch</span>
                        </button>

                        <div className="flex items-center gap-2">
                          {/* Re-order Button */}
                          {onReorderItems && (
                            <button
                              type="button"
                              onClick={() => onReorderItems(order.items, order.items[0]?.seriesId)}
                              className="flex-1 py-1.5 px-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                              title="Re-order this exact batch into order intake form"
                            >
                              <RefreshCw className="w-3 h-3 text-cyan-400" />
                              <span>Re-Order</span>
                            </button>
                          )}

                          {/* Invoice PDF download */}
                          {matchingInvoice && (
                            <button
                              type="button"
                              onClick={() => setSelectedInvoice(matchingInvoice)}
                              className="flex-1 py-1.5 px-2.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                              title="View and download invoice"
                            >
                              <Receipt className="w-3 h-3 text-emerald-600" />
                              <span>Tax Invoice</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Consignment tracking sub-strip if dispatched */}
                  {order.tracking && order.tracking.trackingNumber && (
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
                      <div className="flex items-center gap-2">
                        <Truck className="w-3.5 h-3.5 text-cyan-600" />
                        <span>Carrier: <strong>{order.tracking.carrier || 'BR Agency Dedicated Logistics'}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>Docket #: <strong className="font-mono text-slate-800">{order.tracking.trackingNumber}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>ETA: <strong className="text-slate-700">{order.tracking.estimatedArrival || 'Scheduled on time'}</strong></span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: INVOICES & BILLING */}
      {/* ======================================================== */}
      {activePortalTab === 'invoices' && (
        <div className="space-y-4">
          {filteredInvoices.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-3">
              <Receipt className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No Invoices Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No billing statements or invoices match your search. Invoices are automatically generated upon order submission.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
                      <th className="py-3 px-4">Invoice #</th>
                      <th className="py-3 px-4">Order Ref</th>
                      <th className="py-3 px-4">Issue Date</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4 text-right">Taxable (₹)</th>
                      <th className="py-3 px-4 text-right">12% GST (₹)</th>
                      <th className="py-3 px-4 text-right font-bold text-slate-900">Total (₹)</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredInvoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                          {inv.orderNumber}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                          {inv.issueDate}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                          {inv.dueDate}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-700 tabular-nums whitespace-nowrap">
                          ₹{inv.subtotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-700 tabular-nums whitespace-nowrap">
                          ₹{inv.taxAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                          ₹{inv.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {getInvoiceStatusBadge(inv.status)}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedInvoice(inv)}
                              className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                              title="View full tax invoice slip"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadPdf(inv)}
                              className="px-2 py-1 text-xs font-semibold text-cyan-800 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                              title="Download PDF Tax Invoice"
                            >
                              <Download className="w-3 h-3 text-cyan-600" />
                              <span>PDF</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bank Wire / Payment Instructions Callout */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span>
                    Direct RTGS/NEFT payments to: <strong>BR Agency Press Supplies</strong> · HDFC Bank A/C: <span className="font-mono text-slate-800">50200088192031</span> (IFSC: HDFC0001203)
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Payment Terms: {customer.paymentTerms || 'Net 30 Days'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: PLANT ADDRESSES & DOCK LOGISTICS */}
      {/* ======================================================== */}
      {activePortalTab === 'addresses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Registered Delivery Address Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Primary Company Delivery Facility
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                Default for Orders
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <p className="text-[11px] text-slate-400 font-semibold uppercase">Company Facility / Plant Name</p>
                <p className="font-bold text-slate-900 text-sm">
                  {customer.deliveryAddress?.plantOrUnitName || `${customer.companyName} Unit 1`}
                </p>
              </div>

              <div>
                <p className="text-[11px] text-slate-400 font-semibold uppercase">Street Address</p>
                <p className="text-slate-700">
                  {customer.deliveryAddress?.streetAddress || customer.address || 'Industrial Area'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold uppercase">City &amp; State</p>
                  <p className="text-slate-700">
                    {customer.deliveryAddress?.city || customer.city || 'New Delhi'}, {customer.deliveryAddress?.state || customer.state || 'Delhi'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold uppercase">Postal Code</p>
                  <p className="font-mono text-slate-700">
                    {customer.deliveryAddress?.postalCode || customer.postalCode || '110028'}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1">
                <p className="text-[11px] text-slate-400 font-semibold uppercase">Dock Receiving Contact</p>
                <p className="font-medium text-slate-800">
                  {customer.deliveryAddress?.dockContactPerson || customer.contactPerson}
                </p>
                <p className="font-mono text-cyan-700">
                  {customer.deliveryAddress?.dockContactPhone || customer.phone}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1">
                <p className="text-[11px] text-slate-400 font-semibold uppercase">Unloading Bay &amp; Requirements</p>
                <p className="text-slate-600">
                  {customer.deliveryAddress?.unloadingRequirements || 'Forklift on site for pails and cans. Ground floor dock delivery.'}
                </p>
              </div>
            </div>
          </div>

          {/* Machinery & Technical Profile */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Printer className="w-4 h-4 text-slate-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Company Machinery &amp; Technical Specifications
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[11px] text-slate-500 uppercase font-semibold">Primary Machinery</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {customer.pressModel || 'Heidelberg Speedmaster XL 106-6+L'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Optimized for BIO SPEED™ sheetfed and BIO PACK™ low migration packaging formulations.
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] text-slate-400 font-semibold uppercase">Authorized Commercial Terms</p>
                <p className="font-medium text-slate-800">
                  Payment Terms: <span className="font-bold text-slate-900">{customer.paymentTerms || 'Net 30 Days'}</span>
                </p>
                <p className="text-slate-500">
                  Direct billing account under GSTIN: <span className="font-mono">{customer.gstNumber || '07AABCA8821D1ZQ'}</span>
                </p>
              </div>

              <div className="p-3 bg-cyan-50/70 rounded-xl border border-cyan-200/80 text-cyan-900 space-y-1">
                <p className="font-bold text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-700" />
                  <span>Verified Ink Supply Agreement</span>
                </p>
                <p className="text-[11px] text-cyan-800">
                  All press inks conform to ISO 2846-1 colorimetry and ISO 12647-2 press performance standards. Batch certificates are generated with every shipment.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Invoice Detail Modal */}
      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          order={customerOrders.find(o => o.id === selectedInvoice.orderId || o.orderNumber === selectedInvoice.orderNumber)}
          onClose={() => setSelectedInvoice(null)}
          onRecordPayment={() => {}}
        />
      )}
    </div>
  );
};
