import React, { useState, useMemo } from 'react';
import { 
  Order, 
  Invoice, 
  InkSeriesId, 
  InkColorCode, 
  PricingConfig 
} from '../types/ink';
import { INK_SERIES, INK_COLORS } from '../data/mockData';
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Package, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight, 
  Download, 
  Trash2, 
  PlusCircle, 
  Search, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ExternalLink, 
  LogOut, 
  BarChart3, 
  PieChart, 
  Filter,
  AlertCircle
} from 'lucide-react';
import { downloadInvoicePdf } from '../utils/invoicePdfGenerator';

interface MonthlySalesViewProps {
  orders: Order[];
  invoices: Invoice[];
  pricingConfig: PricingConfig;
  onNavigateToTracking?: (orderId: string) => void;
  onNavigateToInvoice?: (invoiceId: string) => void;
  onClearAllOrders?: () => void;
  onAddSampleOrder?: () => void;
  onExit?: () => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const SHORT_MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const MonthlySalesView: React.FC<MonthlySalesViewProps> = ({
  orders,
  invoices,
  pricingConfig,
  onNavigateToTracking,
  onNavigateToInvoice,
  onClearAllOrders,
  onAddSampleOrder,
  onExit,
}) => {
  const currentYear = new Date().getFullYear();
  const currentMonthIdx = new Date().getMonth(); // 0-11

  // Year & Month Selection (null for 'All Months' in the selected year)
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(currentMonthIdx);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  // Available Years from Orders or current year
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>([currentYear]);
    orders.forEach(o => {
      const y = new Date(o.createdAt).getFullYear();
      if (!isNaN(y)) yearsSet.add(y);
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [orders, currentYear]);

  // Aggregate monthly data for the selected year across all 12 months
  const monthlyBreakdown = useMemo(() => {
    return Array.from({ length: 12 }, (_, monthIdx) => {
      const monthOrders = orders.filter(o => {
        const d = new Date(o.createdAt);
        return d.getFullYear() === selectedYear && d.getMonth() === monthIdx;
      });

      const totalRevenue = monthOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const totalKg = monthOrders.reduce((sum, o) => sum + o.totalKg, 0);
      const orderCount = monthOrders.length;

      const paidRevenue = monthOrders.reduce((sum, o) => {
        return o.paymentStatus === 'paid' ? sum + o.totalAmount : sum;
      }, 0);

      const unpaidRevenue = totalRevenue - paidRevenue;

      let bioSpeedKg = 0;
      let bioSpeedRev = 0;
      let bioPackKg = 0;
      let bioPackRev = 0;

      const cmykKg = { Cyan: 0, Magenta: 0, Yellow: 0, Black: 0 };
      const cmykRev = { Cyan: 0, Magenta: 0, Yellow: 0, Black: 0 };

      monthOrders.forEach(o => {
        o.items.forEach(it => {
          if (it.seriesId === 'BIO_SPEED') {
            bioSpeedKg += it.totalKg;
            bioSpeedRev += it.totalPrice;
          } else if (it.seriesId === 'BIO_PACK') {
            bioPackKg += it.totalKg;
            bioPackRev += it.totalPrice;
          }

          if (it.color in cmykKg) {
            cmykKg[it.color] += it.totalKg;
            cmykRev[it.color] += it.totalPrice;
          }
        });
      });

      return {
        monthIndex: monthIdx,
        monthName: MONTH_NAMES[monthIdx],
        shortName: SHORT_MONTH_NAMES[monthIdx],
        totalRevenue,
        totalKg,
        orderCount,
        paidRevenue,
        unpaidRevenue,
        bioSpeedKg,
        bioSpeedRev,
        bioPackKg,
        bioPackRev,
        cmykKg,
        cmykRev,
        orders: monthOrders,
      };
    });
  }, [orders, selectedYear]);

  // Maximum monthly revenue for bar chart scaling
  const maxMonthlyRevenue = useMemo(() => {
    const maxVal = Math.max(...monthlyBreakdown.map(m => m.totalRevenue), 0);
    return maxVal > 0 ? maxVal : 100000;
  }, [monthlyBreakdown]);

  // Active Filtered Orders based on selected month & search & status
  const filteredOrders = useMemo(() => {
    let result = orders.filter(o => {
      const d = new Date(o.createdAt);
      const matchYear = d.getFullYear() === selectedYear;
      const matchMonth = selectedMonth === 'all' || d.getMonth() === selectedMonth;
      return matchYear && matchMonth;
    });

    if (paymentFilter === 'paid') {
      result = result.filter(o => o.paymentStatus === 'paid');
    } else if (paymentFilter === 'unpaid') {
      result = result.filter(o => o.paymentStatus !== 'paid');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o => 
        o.orderNumber.toLowerCase().includes(q) ||
        o.customer.companyName.toLowerCase().includes(q) ||
        (o.deliveryAddress?.city && o.deliveryAddress.city.toLowerCase().includes(q)) ||
        o.customer.city.toLowerCase().includes(q) ||
        o.items.some(it => it.seriesId.toLowerCase().includes(q) || it.color.toLowerCase().includes(q))
      );
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, selectedYear, selectedMonth, paymentFilter, searchQuery]);

  // Selected Scope Metrics (either specific month or full year)
  const scopedMetrics = useMemo(() => {
    let targetOrders = orders.filter(o => {
      const d = new Date(o.createdAt);
      const matchYear = d.getFullYear() === selectedYear;
      const matchMonth = selectedMonth === 'all' || d.getMonth() === selectedMonth;
      return matchYear && matchMonth;
    });

    const totalRevenue = targetOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalSubtotal = targetOrders.reduce((sum, o) => sum + o.subtotal, 0);
    const totalTax = targetOrders.reduce((sum, o) => sum + o.taxAmount, 0);
    const totalDiscounts = targetOrders.reduce((sum, o) => sum + o.discountAmount, 0);
    const totalKg = targetOrders.reduce((sum, o) => sum + o.totalKg, 0);
    const orderCount = targetOrders.length;
    const aov = orderCount > 0 ? totalRevenue / orderCount : 0;

    const paidRevenue = targetOrders.reduce((sum, o) => {
      return o.paymentStatus === 'paid' ? sum + o.totalAmount : sum;
    }, 0);
    const unpaidRevenue = totalRevenue - paidRevenue;
    const collectionRate = totalRevenue > 0 ? (paidRevenue / totalRevenue) * 100 : 0;

    let bioSpeedKg = 0;
    let bioSpeedRev = 0;
    let bioPackKg = 0;
    let bioPackRev = 0;

    const cmykKg = { Cyan: 0, Magenta: 0, Yellow: 0, Black: 0 };
    const cmykRev = { Cyan: 0, Magenta: 0, Yellow: 0, Black: 0 };

    // Customer spending aggregation
    const customerAgg: Record<string, { companyName: string; city: string; ordersCount: number; totalKg: number; totalSpent: number }> = {};

    targetOrders.forEach(o => {
      const custId = o.customer.id || o.customer.companyName;
      if (!customerAgg[custId]) {
        customerAgg[custId] = {
          companyName: o.customer.companyName,
          city: o.deliveryAddress?.city || o.customer.city,
          ordersCount: 0,
          totalKg: 0,
          totalSpent: 0
        };
      }
      customerAgg[custId].ordersCount += 1;
      customerAgg[custId].totalKg += o.totalKg;
      customerAgg[custId].totalSpent += o.totalAmount;

      o.items.forEach(it => {
        if (it.seriesId === 'BIO_SPEED') {
          bioSpeedKg += it.totalKg;
          bioSpeedRev += it.totalPrice;
        } else if (it.seriesId === 'BIO_PACK') {
          bioPackKg += it.totalKg;
          bioPackRev += it.totalPrice;
        }

        if (it.color in cmykKg) {
          cmykKg[it.color] += it.totalKg;
          cmykRev[it.color] += it.totalPrice;
        }
      });
    });

    const topCustomers = Object.values(customerAgg).sort((a, b) => b.totalSpent - a.totalSpent);

    // Month-over-month growth calculation
    let momGrowthPct: number | null = null;
    if (typeof selectedMonth === 'number') {
      const prevMonthIdx = selectedMonth === 0 ? 11 : selectedMonth - 1;
      const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
      const prevMonthOrders = orders.filter(o => {
        const d = new Date(o.createdAt);
        return d.getFullYear() === prevYear && d.getMonth() === prevMonthIdx;
      });
      const prevRevenue = prevMonthOrders.reduce((s, o) => s + o.totalAmount, 0);
      if (prevRevenue > 0) {
        momGrowthPct = ((totalRevenue - prevRevenue) / prevRevenue) * 100;
      }
    }

    return {
      totalRevenue,
      totalSubtotal,
      totalTax,
      totalDiscounts,
      totalKg,
      orderCount,
      aov,
      paidRevenue,
      unpaidRevenue,
      collectionRate,
      bioSpeedKg,
      bioSpeedRev,
      bioPackKg,
      bioPackRev,
      cmykKg,
      cmykRev,
      topCustomers,
      momGrowthPct
    };
  }, [orders, selectedYear, selectedMonth]);

  // Export CSV Report of Selected Monthly Orders
  const handleExportCsv = () => {
    if (filteredOrders.length === 0) {
      alert('No orders in this period to export.');
      return;
    }

    const headers = [
      'Order ID',
      'Date',
      'Customer Company',
      'GSTIN',
      'Delivery City',
      'Press Model',
      'Total Ink (kg)',
      'Subtotal (INR)',
      'Discount (INR)',
      'GST 18% (INR)',
      'Freight (INR)',
      'Total Amount (INR)',
      'Payment Status',
      'Order Status'
    ];

    const rows = filteredOrders.map(o => [
      `"${o.orderNumber}"`,
      `"${new Date(o.createdAt).toLocaleDateString()}"`,
      `"${o.customer.companyName.replace(/"/g, '""')}"`,
      `"${o.customer.gstNumber}"`,
      `"${o.deliveryAddress?.city || o.customer.city}"`,
      `"${o.customer.pressModel}"`,
      o.totalKg.toFixed(1),
      o.subtotal.toFixed(2),
      o.discountAmount.toFixed(2),
      o.taxAmount.toFixed(2),
      o.shippingFee.toFixed(2),
      o.totalAmount.toFixed(2),
      `"${o.paymentStatus.toUpperCase()}"`,
      `"${o.status.toUpperCase()}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const periodLabel = selectedMonth === 'all' 
      ? `Full-Year-${selectedYear}` 
      : `${SHORT_MONTH_NAMES[selectedMonth]}-${selectedYear}`;
    link.setAttribute('href', url);
    link.setAttribute('download', `BR_Agency_Monthly_Sales_${periodLabel}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const currentPeriodLabel = selectedMonth === 'all'
    ? `Full Year ${selectedYear}`
    : `${MONTH_NAMES[selectedMonth]} ${selectedYear}`;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* 1. Header & Navigation Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span>Owner Executive Portal</span>
            <span aria-hidden="true">·</span>
            <span>Financial Telemetry</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-emerald-700">Live Sales Audit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <TrendingUp className="w-7 h-7 text-emerald-600" />
            <span>Monthly Sales &amp; Revenue Hub</span>
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Real-time tracking of monthly revenue, ink tonnage (kg) dispatched, payment receivables, and commercial press trends.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filteredOrders.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download CSV sales ledger for accounting"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {/* Quick Sample Order (to test/verify analytics) */}
          {onAddSampleOrder && (
            <button
              type="button"
              onClick={onAddSampleOrder}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-lg shadow-2xs transition-colors"
              title="Add a sample order to test monthly sales calculations"
            >
              <PlusCircle className="w-3.5 h-3.5 text-cyan-600" />
              <span>Simulate Order</span>
            </button>
          )}

          {/* Clear All Orders */}
          {onClearAllOrders && (
            <button
              type="button"
              onClick={() => setIsConfirmClearOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg shadow-2xs transition-colors"
              title="Remove all orders from storage and start fresh"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Clear Orders</span>
            </button>
          )}

          {/* Exit Page */}
          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition-colors"
              title="Return to customer order view"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
              <span>Exit Page</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Year & Month Period Selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Filter Accounting Period:
            </span>
            <span className="text-sm font-bold text-slate-900">
              {currentPeriodLabel}
            </span>
          </div>

          {/* Year Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              {availableYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 12-Month Pills + "All Months" */}
        <div className="grid grid-cols-4 sm:grid-cols-7 lg:grid-cols-13 gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setSelectedMonth('all')}
            className={`py-2 px-2.5 rounded-lg font-semibold text-center transition-all ${
              selectedMonth === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            All Year
          </button>
          {MONTH_NAMES.map((name, idx) => {
            const hasData = monthlyBreakdown[idx].totalRevenue > 0;
            const isSelected = selectedMonth === idx;
            return (
              <button
                key={name}
                type="button"
                onClick={() => setSelectedMonth(idx)}
                className={`py-2 px-1.5 rounded-lg text-center transition-all relative ${
                  isSelected
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : hasData
                    ? 'bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-900 font-medium border border-emerald-200'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                <span>{SHORT_MONTH_NAMES[idx]}</span>
                {hasData && (
                  <span className={`block text-[9px] font-mono leading-tight mt-0.5 ${
                    isSelected ? 'text-emerald-100' : 'text-emerald-700 font-semibold'
                  }`}>
                    ₹{(monthlyBreakdown[idx].totalRevenue / 1000).toFixed(0)}k
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Executive KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Revenue */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Gross Sales Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              ₹{scopedMetrics.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            {scopedMetrics.momGrowthPct !== null ? (
              scopedMetrics.momGrowthPct >= 0 ? (
                <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  +{scopedMetrics.momGrowthPct.toFixed(1)}% vs last month
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-rose-600 font-semibold">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  {scopedMetrics.momGrowthPct.toFixed(1)}% vs last month
                </span>
              )
            ) : (
              <span>Tax (GST 18%): ₹{scopedMetrics.totalTax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            )}
          </div>
        </div>

        {/* Metric 2: Volume Sold */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Ink Dispatched
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {scopedMetrics.totalKg.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
            <span className="text-sm font-semibold text-slate-500 font-mono">kg</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Across {scopedMetrics.orderCount} press purchase orders
          </p>
        </div>

        {/* Metric 3: Orders Count & AOV */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Average Order Value
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              ₹{scopedMetrics.aov.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {scopedMetrics.orderCount} total jobs completed/pending
          </p>
        </div>

        {/* Metric 4: Paid vs Outstanding Receivables */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Receivables Collection
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {scopedMetrics.collectionRate.toFixed(0)}%
            </span>
            <span className="text-xs font-medium text-slate-500">realized</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex justify-between">
            <span className="text-emerald-700 font-semibold font-mono">
              Paid: ₹{scopedMetrics.paidRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
            <span className="text-amber-700 font-semibold font-mono">
              Due: ₹{scopedMetrics.unpaidRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Visual 12-Month Sales Trend Chart */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>{selectedYear} Annual Revenue Distribution Trend</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any month bar to filter orders, client purchases, and product mix.
            </p>
          </div>
          <div className="text-xs font-mono text-slate-500 flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
              <span>Paid Revenue</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" />
              <span>Outstanding Due</span>
            </span>
          </div>
        </div>

        {/* Interactive Bar Chart */}
        <div className="pt-4">
          <div className="grid grid-cols-12 gap-2 sm:gap-3 items-end h-44 border-b border-slate-200 pb-2">
            {monthlyBreakdown.map((m) => {
              const isSelected = selectedMonth === m.monthIndex;
              const barHeightPct = maxMonthlyRevenue > 0 
                ? Math.min(100, Math.max(m.totalRevenue > 0 ? 8 : 2, (m.totalRevenue / maxMonthlyRevenue) * 100))
                : 2;

              const paidHeightPct = m.totalRevenue > 0 ? (m.paidRevenue / m.totalRevenue) * 100 : 0;
              const unpaidHeightPct = 100 - paidHeightPct;

              return (
                <div
                  key={m.monthName}
                  onClick={() => setSelectedMonth(m.monthIndex)}
                  className="flex flex-col items-center h-full justify-end group cursor-pointer"
                  title={`${m.monthName}: ₹${m.totalRevenue.toLocaleString()} (${m.totalKg.toFixed(1)} kg)`}
                >
                  {/* Tooltip value on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono font-bold text-slate-900 -mb-1 pb-1">
                    {m.totalRevenue > 0 ? `₹${(m.totalRevenue / 1000).toFixed(0)}k` : '₹0'}
                  </div>

                  {/* Bar */}
                  <div
                    style={{ height: `${barHeightPct}%` }}
                    className={`w-full max-w-[42px] rounded-t-md transition-all flex flex-col justify-end overflow-hidden ${
                      isSelected
                        ? 'ring-2 ring-slate-900 ring-offset-1'
                        : 'hover:brightness-105'
                    }`}
                  >
                    {m.totalRevenue > 0 ? (
                      <>
                        {/* Unpaid Portion */}
                        <div
                          style={{ height: `${unpaidHeightPct}%` }}
                          className="bg-amber-400 w-full transition-all"
                        />
                        {/* Paid Portion */}
                        <div
                          style={{ height: `${paidHeightPct}%` }}
                          className="bg-emerald-500 w-full transition-all"
                        />
                      </>
                    ) : (
                      <div className="h-full bg-slate-100 w-full" />
                    )}
                  </div>

                  {/* Label */}
                  <span className={`text-[10px] mt-2 font-medium truncate ${
                    isSelected ? 'text-slate-950 font-bold' : 'text-slate-500'
                  }`}>
                    {m.shortName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Series & CMYK Color Distribution Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* A. Ink Series Revenue & Volume Split */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-cyan-600" />
              <span>Product Line Distribution ({currentPeriodLabel})</span>
            </h3>
            <span className="text-xs font-mono text-slate-500">
              {scopedMetrics.totalKg.toFixed(1)} kg Total
            </span>
          </div>

          <div className="space-y-4">
            {/* BIO SPEED */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{INK_SERIES.BIO_SPEED.name}</h4>
                  <p className="text-[11px] text-slate-500">{INK_SERIES.BIO_SPEED.category}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-slate-900">
                    ₹{scopedMetrics.bioSpeedRev.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                  <span className="block text-[11px] font-mono text-slate-500">
                    {scopedMetrics.bioSpeedKg.toFixed(1)} kg
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-cyan-600 h-2 rounded-full transition-all"
                  style={{
                    width: scopedMetrics.totalRevenue > 0 
                      ? `${(scopedMetrics.bioSpeedRev / scopedMetrics.totalRevenue) * 100}%` 
                      : '0%'
                  }}
                />
              </div>
            </div>

            {/* BIO PACK */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{INK_SERIES.BIO_PACK.name}</h4>
                  <p className="text-[11px] text-slate-500">{INK_SERIES.BIO_PACK.category}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-slate-900">
                    ₹{scopedMetrics.bioPackRev.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                  <span className="block text-[11px] font-mono text-slate-500">
                    {scopedMetrics.bioPackKg.toFixed(1)} kg
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-emerald-600 h-2 rounded-full transition-all"
                  style={{
                    width: scopedMetrics.totalRevenue > 0 
                      ? `${(scopedMetrics.bioPackRev / scopedMetrics.totalRevenue) * 100}%` 
                      : '0%'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* B. CMYK Color Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" />
              <span>CMYK Process Color Dispersion Demand</span>
            </h3>
            <span className="text-xs font-mono text-slate-500">Pigment Vol.</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {INK_COLORS.map(col => {
              const kg = scopedMetrics.cmykKg[col.name];
              const rev = scopedMetrics.cmykRev[col.name];
              return (
                <div key={col.name} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-3.5 h-3.5 rounded-full inline-block border border-black/10 shadow-2xs"
                        style={{ backgroundColor: col.hex }} 
                      />
                      <span className="font-bold text-xs text-slate-900">{col.name}</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400 font-semibold">{col.code}</span>
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="font-mono font-bold text-base text-slate-900">
                      {kg.toFixed(1)} <span className="text-[10px] font-normal text-slate-500">kg</span>
                    </span>
                    <span className="font-mono text-xs text-slate-600 font-semibold">
                      ₹{rev.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 6. Top Printing Press Clients in Period */}
      {scopedMetrics.topCustomers.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Top Printing Press Clients ({currentPeriodLabel})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {scopedMetrics.topCustomers.slice(0, 4).map((c, i) => (
              <div key={c.companyName} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <h4 className="font-bold text-xs text-slate-900 truncate" title={c.companyName}>
                    {c.companyName}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-500 truncate">{c.city}</p>
                <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-600">{c.totalKg.toFixed(1)} kg</span>
                  <span className="font-bold text-slate-900">₹{c.totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Detailed Monthly Orders Ledger */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Orders Ledger ({filteredOrders.length} records)
            </h3>
            <p className="text-xs text-slate-500">
              Complete dispatch and invoice breakdown for {currentPeriodLabel}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders, press, city..."
                className="w-48 sm:w-60 text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* Payment Filter */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setPaymentFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  paymentFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setPaymentFilter('paid')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  paymentFilter === 'paid' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
                }`}
              >
                Paid
              </button>
              <button
                type="button"
                onClick={() => setPaymentFilter('unpaid')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  paymentFilter === 'unpaid' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
                }`}
              >
                Unpaid
              </button>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <th className="py-3 px-4">Order / Invoice #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Printing Press Client</th>
                <th className="py-3 px-4 text-center">Ink Volume</th>
                <th className="py-3 px-4 text-right font-mono">Invoice Total</th>
                <th className="py-3 px-4 text-center">Payment</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <div className="max-w-sm mx-auto space-y-2">
                      <p className="font-semibold text-slate-600 text-sm">
                        No orders recorded for {currentPeriodLabel}.
                      </p>
                      <p className="text-xs text-slate-400">
                        When customers submit ink orders, itemized monthly sales figures and tax collections will update live.
                      </p>
                      {onAddSampleOrder && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={onAddSampleOrder}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-lg transition-colors"
                          >
                            <PlusCircle className="w-3.5 h-3.5 text-cyan-600" />
                            <span>Simulate a Test Order</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const matchingInvoice = invoices.find(inv => inv.id === order.invoiceId || inv.orderId === order.id);
                  const isPaid = order.paymentStatus === 'paid';

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <div>{order.orderNumber}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{order.invoiceId}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {new Date(order.createdAt).toLocaleDateString([], {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block truncate max-w-[220px]">
                          {order.customer.companyName}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate max-w-[220px]">
                          {order.deliveryAddress?.city || order.customer.city} · {order.customer.pressModel}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono">
                        <span className="font-bold text-slate-900">{order.totalKg.toFixed(1)} kg</span>
                        <span className="block text-[10px] text-slate-400">{order.items.length} items</span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        ₹{order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="text-[11px] font-medium text-slate-600 capitalize">
                          {order.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {matchingInvoice && (
                            <button
                              type="button"
                              onClick={() => downloadInvoicePdf(matchingInvoice, order)}
                              title="Download Tax Invoice PDF"
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {onNavigateToTracking && (
                            <button
                              type="button"
                              onClick={() => onNavigateToTracking(order.id)}
                              title="View batch dispatch details in Live Tracking"
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}
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

      {/* Confirmation Modal to Clear All Orders */}
      {isConfirmClearOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Remove All Orders?</h3>
                <p className="text-xs text-slate-500">This will wipe all active and historical orders.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently clear all orders and invoice records? This will reset the orders database to zero orders. New orders submitted by customers will start with a fresh slate.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsConfirmClearOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onClearAllOrders) onClearAllOrders();
                  setIsConfirmClearOpen(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors"
              >
                Yes, Remove All Orders
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
