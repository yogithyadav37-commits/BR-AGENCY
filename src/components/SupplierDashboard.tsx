import React from 'react';
import { Order, OrderStatus, UserRole } from '../types/ink';
import { INK_COLORS, INK_SERIES } from '../data/mockData';
import { 
  SlidersHorizontal, 
  Layers, 
  FlaskConical, 
  Truck, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Package,
  ShieldCheck,
  RefreshCw,
  Mail,
  Copy,
  Check,
  LogOut,
  Star
} from 'lucide-react';
import { EmailSummaryModal } from './EmailSummaryModal';
import { copyOrderEmailToClipboard } from '../utils/orderEmailSummary';

interface SupplierDashboardProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, nextStatus: OrderStatus) => void;
  onSelectOrderForTracking: (orderId: string) => void;
  onExit?: () => void;
  userRole?: UserRole;
}

export const SupplierDashboard: React.FC<SupplierDashboardProps> = ({
  orders,
  onUpdateOrderStatus,
  onSelectOrderForTracking,
  onExit,
  userRole = 'owner',
}) => {
  const [modalOrder, setModalOrder] = React.useState<Order | null>(null);
  const [copiedOrderId, setCopiedOrderId] = React.useState<string | null>(null);

  const handleCopyEmail = async (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyOrderEmailToClipboard(order, '₹');
    if (success) {
      setCopiedOrderId(order.id);
      setTimeout(() => setCopiedOrderId(null), 2500);
    }
  };

  // Aggregate CMYK demand across non-delivered orders
  const activeOrders = orders.filter(o => o.status !== 'delivered');

  const cmykDemand: Record<string, { totalKg: number; orderCount: number }> = {
    Cyan: { totalKg: 0, orderCount: 0 },
    Magenta: { totalKg: 0, orderCount: 0 },
    Yellow: { totalKg: 0, orderCount: 0 },
    Black: { totalKg: 0, orderCount: 0 },
  };

  activeOrders.forEach(o => {
    o.items.forEach(it => {
      if (cmykDemand[it.color]) {
        cmykDemand[it.color].totalKg += it.totalKg;
        cmykDemand[it.color].orderCount += 1;
      }
    });
  });

  const totalActiveKg = Object.values(cmykDemand).reduce((s, c) => s + c.totalKg, 0);

  // Group orders by stage
  const ordersByStatus: Record<OrderStatus, Order[]> = {
    received: orders.filter(o => o.status === 'received'),
    formulation: orders.filter(o => o.status === 'formulation'),
    qc_passed: orders.filter(o => o.status === 'qc_passed'),
    packed: orders.filter(o => o.status === 'packed'),
    dispatched: orders.filter(o => o.status === 'dispatched'),
    delivered: orders.filter(o => o.status === 'delivered'),
  };

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    const sequence: OrderStatus[] = ['received', 'formulation', 'qc_passed', 'packed', 'dispatched', 'delivered'];
    const idx = sequence.indexOf(current);
    if (idx !== -1 && idx < sequence.length - 1) {
      return sequence[idx + 1];
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span>Supplier Dispatch Control</span>
            <span aria-hidden="true">·</span>
            <span>Plant Operations</span>
            <span aria-hidden="true">·</span>
            <span>Batch Milling &amp; QC Queue</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Plant Production &amp; Batch Dispatch Controller
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-3xl">
            Real-time company order queue management, aggregated CMYK pigment demand, 3-roll milling schedules, and laboratory release authorization.
          </p>
        </div>

        {onExit && (
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition-colors shrink-0 group self-start sm:self-auto cursor-pointer"
            title="Exit this page and return to main overview"
            aria-label="Exit Batch Operations page"
          >
            <LogOut className="w-4 h-4 text-slate-500 group-hover:text-rose-600 transition-colors" />
            <span>Exit Page</span>
          </button>
        )}
      </div>

      {/* CMYK Aggregate Volume Demand Strips */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
            Active Milling &amp; Dispatch Queue ({totalActiveKg.toFixed(1)} kg Total Pending)
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Across {activeOrders.length} active company orders
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {INK_COLORS.map(col => {
            const data = cmykDemand[col.name];
            return (
              <div 
                key={col.name}
                className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3.5 h-3.5 rounded-full inline-block border border-black/10 shadow-xs"
                      style={{ backgroundColor: col.hex }} 
                    />
                    <span className="font-bold text-sm text-slate-900">
                      Process {col.name}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {col.code}
                  </span>
                </div>

                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                    {data.totalKg.toFixed(1)} <span className="text-xs font-normal text-slate-500">kg</span>
                  </span>
                  <span className="text-xs text-slate-500">
                    {data.orderCount} jobs queued
                  </span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Pigment: {col.pigmentCode}</span>
                  <span>HSN: {col.hsnCode}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Production Line Stages Grid (Active Orders Board) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
            Live Order Status Board
          </span>
          <span className="text-xs text-slate-500">
            Click 'Advance' on any card to update customer tracking in real-time
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100">
            {orders.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm space-y-2">
                <p className="font-semibold text-slate-800">No active production or dispatch jobs in queue.</p>
                <p className="text-xs text-slate-400">All previous orders have been cleared. New orders placed by registered companies will appear in this milling &amp; dispatch controller.</p>
              </div>
            ) : (
              orders.map(order => {
                const next = getNextStatus(order.status);
                const isDelivered = order.status === 'delivered';
                const series = INK_SERIES[order.items[0]?.seriesId || 'BIO_SPEED'];

                return (
                  <div key={order.id} className="p-5 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Customer & Order Identity */}
                    <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs font-semibold text-cyan-700">
                        · {series.name}
                      </span>
                      <span className="text-xs text-slate-400">
                        · Batch #{order.tracking.batchNumber}
                      </span>
                    </div>

                    <p className="font-bold text-slate-900 text-sm">
                      {order.customer.companyName}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>{order.customer.pressModel}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono font-medium text-slate-700 tabular-nums">{order.totalKg} kg total</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-cyan-800 font-medium">To: {order.deliveryAddress?.city || order.customer.city}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-600">{order.priority}</span>
                      <span aria-hidden="true">·</span>
                      {order.deliveryRouting?.method === 'external_app' ? (
                        <span className="text-[10px] font-mono font-bold bg-cyan-100 text-cyan-800 px-1.5 py-0.5 rounded">
                          App: {order.deliveryRouting.providerName.split(' ')[0]}
                        </span>
                      ) : order.deliveryRouting?.method === 'customer_pickup' ? (
                        <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                          Self-Pickup
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500">
                          BR Fleet
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle: Current Stage Tag */}
                  <div className="flex items-center gap-3">
                    <div className="text-left md:text-right">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                        Current Stage
                      </span>
                      <span className={`inline-block font-bold text-xs uppercase tracking-wider mt-0.5 ${
                        isDelivered ? 'text-emerald-700' : 'text-slate-900'
                      }`}>
                        {order.status.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] text-slate-500 block truncate max-w-[200px]">
                        {order.tracking.currentLocation}
                      </span>
                    </div>
                  </div>

                  {/* Right: Operational Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleCopyEmail(order, e)}
                      title="Copy text email summary for client"
                      className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all inline-flex items-center gap-1 ${
                        copiedOrderId === order.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {copiedOrderId === order.id ? (
                        <>
                          <Check className="w-3 h-3 text-white" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-500" />
                          <span>Email</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setModalOrder(order)}
                      title="Preview formatted email summary"
                      className="p-1.5 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onSelectOrderForTracking(order.id)}
                      className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      Audit
                    </button>

                    {next && userRole === 'owner' && (
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, next)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs inline-flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3 h-3 text-cyan-400" />
                        <span>Advance to {next.replace('_', ' ')}</span>
                      </button>
                    )}

                    {isDelivered && (
                      <span className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-100 rounded-lg inline-flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Complete
                      </span>
                    )}

                    {order.feedback && (
                      <span 
                        title={`Customer rating: ${order.feedback.rating}/5 stars. "${order.feedback.comment}"`}
                        className="px-2.5 py-1 text-xs font-semibold text-amber-900 bg-amber-100 border border-amber-300 rounded-lg inline-flex items-center gap-1 font-mono"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>{order.feedback.rating}★ Rated</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
          </div>
        </div>
      </div>

      {/* Raw Material Inventory & Plant Storage */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h3 className="font-bold text-base text-slate-900 mb-4">
          Plant Chemical Storage &amp; Raw Material Inventory
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block">Refined Soya Varnish Base (Bulk Tank 1)</span>
            <p className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">4,200 kg</p>
            <span className="text-[11px] text-emerald-700 font-medium mt-1 block">Nominal (84% capacity)</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block">Low-Migration Food Resin (BIO PACK Tank)</span>
            <p className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">2,850 kg</p>
            <span className="text-[11px] text-emerald-700 font-medium mt-1 block">Nominal (71% capacity)</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block">Vacuum Cans (2.5 kg Format In Stock)</span>
            <p className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">1,450 units</p>
            <span className="text-[11px] text-slate-500 mt-1 block">Ready for nitrogen sealing</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block">Heavy Auto-Duct Steel Drums (200 kg)</span>
            <p className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">28 units</p>
            <span className="text-[11px] text-slate-500 mt-1 block">Tested with pneumatic bungs</span>
          </div>
        </div>
      </div>

      {/* Email Summary Modal */}
      {modalOrder && (
        <EmailSummaryModal
          order={modalOrder}
          currencySymbol="₹"
          isOpen={!!modalOrder}
          onClose={() => setModalOrder(null)}
        />
      )}
    </div>
  );
};
