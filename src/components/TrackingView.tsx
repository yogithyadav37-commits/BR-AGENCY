import React, { useState } from 'react';
import { Order, OrderStatus, UserRole, DeliveryRoutingDetails, OrderFeedback } from '../types/ink';
import { INK_SERIES, INK_COLORS } from '../data/mockData';
import { 
  Search, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  FileText, 
  Phone, 
  ShieldCheck, 
  Flame, 
  ArrowRight, 
  PackageCheck,
  ChevronRight,
  RefreshCw,
  Mail,
  Copy,
  Check,
  LogOut,
  ExternalLink,
  Sparkles,
  Share2,
  Star,
  MessageSquare,
  ThumbsUp
} from 'lucide-react';
import { EmailSummaryModal } from './EmailSummaryModal';
import { copyOrderEmailToClipboard } from '../utils/orderEmailSummary';
import { DeliveryRoutingModal } from './DeliveryRoutingModal';
import { OrderFeedbackModal } from './OrderFeedbackModal';
import { 
  copyDeliveryManifestToClipboard, 
  EXTERNAL_DELIVERY_APPS 
} from '../utils/deliveryRoutingUtils';

interface TrackingViewProps {
  orders: Order[];
  selectedOrderId?: string | null;
  onSelectOrder: (orderId: string) => void;
  onUpdateOrderStatus: (orderId: string, nextStatus: OrderStatus) => void;
  onUpdateRouting?: (orderId: string, updatedRouting: DeliveryRoutingDetails) => void;
  onSubmitFeedback?: (orderId: string, feedback: OrderFeedback) => void;
  onViewInvoice: (invoiceId: string) => void;
  onExit?: () => void;
  userRole?: UserRole;
}

const STATUS_STAGES: { id: OrderStatus; label: string; stepNumber: string }[] = [
  { id: 'received', label: 'Order Confirmed', stepNumber: '01' },
  { id: 'formulation', label: 'Batch Dispersion', stepNumber: '02' },
  { id: 'qc_passed', label: 'Lab QC Verified', stepNumber: '03' },
  { id: 'packed', label: 'Vacuum Sealed', stepNumber: '04' },
  { id: 'dispatched', label: 'In Transit', stepNumber: '05' },
  { id: 'delivered', label: 'Delivered', stepNumber: '06' },
];

export const TrackingView: React.FC<TrackingViewProps> = ({
  orders,
  selectedOrderId,
  onSelectOrder,
  onUpdateOrderStatus,
  onUpdateRouting,
  onSubmitFeedback,
  onViewInvoice,
  onExit,
  userRole = 'customer',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'delivered'>('all');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isRoutingModalOpen, setIsRoutingModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [manifestCopied, setManifestCopied] = useState(false);

  const handleCopyManifest = async (order: Order, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const success = await copyDeliveryManifestToClipboard(order);
    if (success) {
      setManifestCopied(true);
      setTimeout(() => setManifestCopied(false), 2500);
    }
  };

  const handleCopyEmail = async (order: Order, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const success = await copyOrderEmailToClipboard(order, '₹');
    if (success) {
      setCopiedOrderId(order.id);
      setTimeout(() => setCopiedOrderId(null), 2500);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.tracking.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.tracking.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterStatus === 'active') return o.status !== 'delivered';
    if (filterStatus === 'delivered') return o.status === 'delivered';
    return true;
  });

  const activeOrder = orders.find(o => o.id === selectedOrderId) || filteredOrders[0] || orders[0];

  const getStageIndex = (status: OrderStatus) => {
    return STATUS_STAGES.findIndex(s => s.id === status);
  };

  const currentStageIdx = activeOrder ? getStageIndex(activeOrder.status) : 0;

  const handleAdvanceStatus = () => {
    if (!activeOrder) return;
    const nextIdx = currentStageIdx + 1;
    if (nextIdx < STATUS_STAGES.length) {
      onUpdateOrderStatus(activeOrder.id, STATUS_STAGES[nextIdx].id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span>Batch Fulfillment</span>
            <span aria-hidden="true">·</span>
            <span>Dispersion to Company Dock</span>
            <span aria-hidden="true">·</span>
            <span>Live Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Real-Time Batch & Shipment Tracking
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Track production formulation stages, laboratory rheology & tack verification, vacuum packaging, and dedicated freight carrier transit.
          </p>
        </div>

        {onExit && (
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition-colors shrink-0 group self-start sm:self-auto cursor-pointer"
            title="Exit this page and return to main overview"
            aria-label="Exit Tracking page"
          >
            <LogOut className="w-4 h-4 text-slate-500 group-hover:text-rose-600 transition-colors" />
            <span>Exit Page</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Orders List Sidebar (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Order #, Company, Batch, Tracking..."
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* Segmented Filter Control */}
            <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setFilterStatus('all')}
                className={`flex-1 py-1 font-medium rounded-md transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({orders.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('active')}
                className={`flex-1 py-1 font-medium rounded-md transition-colors ${
                  filterStatus === 'active'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                In Progress ({orders.filter(o => o.status !== 'delivered').length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('delivered')}
                className={`flex-1 py-1 font-medium rounded-md transition-colors ${
                  filterStatus === 'delivered'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Delivered ({orders.filter(o => o.status === 'delivered').length})
              </button>
            </div>
          </div>

          {/* List of Orders */}
          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredOrders.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-xs text-slate-500">
                No orders match your filter criteria.
              </div>
            ) : (
              filteredOrders.map(order => {
                const isSelected = activeOrder?.id === order.id;
                const series = INK_SERIES[order.items[0]?.seriesId || 'BIO_SPEED'];

                return (
                  <div
                    key={order.id}
                    onClick={() => onSelectOrder(order.id)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm font-mono tracking-tight tabular-nums">
                            {order.orderNumber}
                          </span>
                          <span className={`text-[11px] font-semibold ${isSelected ? 'text-cyan-300' : 'text-cyan-700'}`}>
                            · {series.name}
                          </span>
                        </div>
                        <p className={`text-xs font-semibold mt-1 truncate max-w-[210px] ${isSelected ? 'text-slate-200' : 'text-slate-800'}`}>
                          {order.customer.companyName}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-[11px] font-semibold uppercase tracking-wider block ${
                          order.status === 'delivered'
                            ? isSelected ? 'text-emerald-300' : 'text-emerald-700'
                            : isSelected ? 'text-amber-300' : 'text-amber-700'
                        }`}>
                          {order.status.replace('_', ' ')}
                        </span>
                        <span className={`text-[11px] font-mono tabular-nums ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                          {order.totalKg} kg
                        </span>
                      </div>
                    </div>

                    <div className={`mt-3 pt-2.5 border-t flex items-center justify-between text-[11px] ${
                      isSelected ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
                    }`}>
                      <span className="font-mono">{order.tracking.batchNumber}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="truncate max-w-[110px]">{order.tracking.estimatedArrival}</span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyEmail(order, e)}
                          title="Copy text email summary for client"
                          className={`p-1 rounded-md transition-colors ${
                            copiedOrderId === order.id
                              ? 'bg-emerald-500 text-white'
                              : isSelected
                              ? 'hover:bg-slate-800 text-slate-300 hover:text-white'
                              : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          {copiedOrderId === order.id ? (
                            <Check className="w-3.5 h-3.5 text-white" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Active Order Live Tracking Detail (8 Cols) */}
        {activeOrder ? (
          <div className="lg:col-span-8 space-y-6">
            {/* Top Shipment Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
                    <span>Batch #{activeOrder.tracking.batchNumber}</span>
                    <span aria-hidden="true">·</span>
                    <span>Waybill: {activeOrder.tracking.trackingNumber}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{activeOrder.priority}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Order {activeOrder.orderNumber}</span>
                  </h2>
                  <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5 flex-wrap">
                    <MapPin className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                    <span>Deliver to:</span>
                    <strong className="text-slate-900">
                      {activeOrder.deliveryAddress?.plantOrUnitName || activeOrder.customer.companyName}
                    </strong>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-600">
                      {activeOrder.deliveryAddress?.city || activeOrder.customer.city}, {activeOrder.deliveryAddress?.state || activeOrder.customer.state} ({activeOrder.deliveryAddress?.postalCode || activeOrder.customer.postalCode})
                    </span>
                  </p>
                </div>

                {/* Status Advancement / Testing Action */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsRoutingModalOpen(true)}
                    className="px-3 py-2 text-xs font-semibold rounded-lg transition-all inline-flex items-center gap-1.5 shadow-2xs bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white cursor-pointer"
                    title="Route to other delivery apps (Porter, Borzo, Delhivery, etc.) according to your choice"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Route Delivery App</span>
                    {activeOrder.deliveryRouting?.method === 'external_app' && (
                      <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono font-bold">
                        {activeOrder.deliveryRouting.providerName.split(' ')[0]}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleCopyManifest(activeOrder, e)}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all inline-flex items-center gap-1.5 shadow-2xs ${
                      manifestCopied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                    title="Copy warehouse pickup and dock delivery manifest for external carrier driver"
                  >
                    {manifestCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>Manifest Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy Manifest</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyEmail(activeOrder)}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all inline-flex items-center gap-1.5 shadow-2xs ${
                      copiedOrderId === activeOrder.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-cyan-50 text-cyan-900 border border-cyan-200 hover:bg-cyan-100'
                    }`}
                    title="Copy text-based email summary to clipboard for client"
                  >
                    {copiedOrderId === activeOrder.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>Copied Summary!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-cyan-700" />
                        <span>Copy Email Summary</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsEmailModalOpen(true)}
                    className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center gap-1.5"
                    title="Preview full formatted order email text"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>Email Preview</span>
                  </button>

                  {activeOrder.status === 'delivered' && (
                    <button
                      type="button"
                      onClick={() => setIsFeedbackModalOpen(true)}
                      className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                        activeOrder.feedback
                          ? 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
                          : 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                      }`}
                      title="Rate your company experience for this delivered order"
                    >
                      <Star className={`w-3.5 h-3.5 ${activeOrder.feedback ? 'fill-amber-500 text-amber-500' : 'fill-white text-white'}`} />
                      <span>{activeOrder.feedback ? `Rated ${activeOrder.feedback.rating}★` : 'Rate Order'}</span>
                    </button>
                  )}

                  {userRole === 'owner' && (
                    <button
                      type="button"
                      onClick={() => onViewInvoice(activeOrder.invoiceId)}
                      className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center gap-1.5"
                      title="Owner: View invoice details in Invoices Hub"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>View Tax Invoice</span>
                    </button>
                  )}

                  {userRole === 'owner' ? (
                    currentStageIdx < STATUS_STAGES.length - 1 && (
                      <button
                        type="button"
                        onClick={handleAdvanceStatus}
                        className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs inline-flex items-center gap-1.5"
                        title="Owner: Advance batch to next stage in fulfillment lifecycle"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Advance Stage</span>
                      </button>
                    )
                  ) : (
                    <span className="px-3 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg inline-flex items-center gap-1.5 shadow-2xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Dispatch Telemetry Live</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Visual Pipeline Stepper */}
              <div className="py-6 border-b border-slate-100">
                <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider block mb-4">
                  Fulfillment & Quality Pipeline
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {STATUS_STAGES.map((stage, idx) => {
                    const isDone = idx <= currentStageIdx;
                    const isCurrent = idx === currentStageIdx;

                    return (
                      <div
                        key={stage.id}
                        onClick={() => onUpdateOrderStatus(activeOrder.id, stage.id)}
                        className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
                          isCurrent
                            ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                            : isDone
                            ? 'border-emerald-200 bg-emerald-50/60 text-slate-900'
                            : 'border-slate-200 bg-slate-50 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                          <span className={isCurrent ? 'text-cyan-300' : isDone ? 'text-emerald-700' : 'text-slate-400'}>
                            {stage.stepNumber}
                          </span>
                          {isDone && !isCurrent && (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          )}
                        </div>
                        <p className="text-xs font-bold leading-tight">
                          {stage.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Completed Review & Feedback Card */}
              {activeOrder.status === 'delivered' && (
                <div className="my-6 p-4.5 bg-gradient-to-r from-amber-50/90 via-orange-50/60 to-amber-50/90 border border-amber-300 rounded-2xl shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs ring-4 ring-amber-100">
                        <Star className="w-5 h-5 fill-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">
                            {activeOrder.feedback ? 'Your Company Delivery Review' : 'Company Delivery Complete — Rate Your Experience'}
                          </h4>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Delivered at Dock
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 max-w-xl">
                          {activeOrder.feedback
                            ? 'Thank you for your valuable feedback! Your review helps our lab maintain batch-to-batch consistency and high speed production equipment performance.'
                            : 'This batch has arrived at your receiving bay. Rate your run experience, dot gain, setting time, and freight delivery to complete ISO quality verification.'}
                        </p>

                        {/* If feedback exists, show summary */}
                        {activeOrder.feedback && (
                          <div className="mt-3 p-3 bg-white/90 border border-amber-200 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <div className="flex text-amber-500">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                      key={s}
                                      className={`w-4 h-4 ${
                                        s <= activeOrder.feedback!.rating
                                          ? 'fill-amber-400 text-amber-400'
                                          : 'text-slate-200'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="font-bold text-xs text-slate-900">
                                  {activeOrder.feedback.rating}/5 Stars
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400">
                                Reviewed on {new Date(activeOrder.feedback.submittedAt).toLocaleDateString()}
                              </span>
                            </div>

                            <p className="text-xs text-slate-700 italic">
                              "{activeOrder.feedback.comment}"
                            </p>

                            {activeOrder.feedback.tags && activeOrder.feedback.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {activeOrder.feedback.tags.map((t, i) => (
                                  <span key={i} className="text-[10px] bg-amber-100 text-amber-900 font-medium px-2 py-0.5 rounded-md">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}

                            {activeOrder.feedback.ownerResponse && (
                              <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-cyan-900 flex items-start gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-cyan-700 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-bold">BR Agency Response: </span>
                                  <span>{activeOrder.feedback.ownerResponse.comment}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsFeedbackModalOpen(true)}
                        className="px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all inline-flex items-center gap-1.5 shadow-sm cursor-pointer hover:scale-[1.02]"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>{activeOrder.feedback ? 'Edit Company Review' : 'Rate & Leave Comments'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Transit, Receiving Dock & Live QC Details (3-Column Layout) */}
              <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* 1. Company Delivery Destination & Dock */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-cyan-700" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Company Delivery Dock
                    </h4>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Receiving Facility</span>
                      <p className="font-bold text-slate-900 text-xs mt-0.5">
                        {activeOrder.deliveryAddress?.plantOrUnitName || activeOrder.customer.companyName}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Dock Address</span>
                      <p className="text-slate-700 text-[11px] mt-0.5 leading-snug">
                        {activeOrder.deliveryAddress?.streetAddress || activeOrder.customer.address}
                        {activeOrder.deliveryAddress?.landmark ? ` (Near ${activeOrder.deliveryAddress.landmark})` : ''}
                      </p>
                      <p className="font-mono text-slate-600 text-[11px]">
                        {activeOrder.deliveryAddress?.city || activeOrder.customer.city}, {activeOrder.deliveryAddress?.state || activeOrder.customer.state} - {activeOrder.deliveryAddress?.postalCode || activeOrder.customer.postalCode}
                      </p>
                    </div>

                    <div className="pt-1.5 border-t border-slate-200 flex justify-between items-center text-[11px]">
                      <span className="text-slate-500">Dock In-charge</span>
                      <span className="font-medium text-slate-900">
                        {activeOrder.deliveryAddress?.dockContactPerson || activeOrder.customer.contactPerson}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500">Contact Line</span>
                      <a 
                        href={`tel:${activeOrder.deliveryAddress?.dockContactPhone || activeOrder.customer.phone}`}
                        className="font-mono text-cyan-800 font-semibold hover:underline"
                      >
                        {activeOrder.deliveryAddress?.dockContactPhone || activeOrder.customer.phone}
                      </a>
                    </div>

                    {(activeOrder.deliveryAddress?.gateOrBayNumber || activeOrder.deliveryAddress?.unloadingRequirements) && (
                      <div className="pt-1.5 border-t border-slate-200 text-[11px] text-slate-600">
                        {activeOrder.deliveryAddress?.gateOrBayNumber && (
                          <p><strong className="text-slate-800">Bay:</strong> {activeOrder.deliveryAddress.gateOrBayNumber}</p>
                        )}
                        {activeOrder.deliveryAddress?.unloadingRequirements && (
                          <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                            {activeOrder.deliveryAddress.unloadingRequirements}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Delivery Routing & Dispatch App Partner */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-cyan-700" />
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                        Delivery Logistics &amp; Routing
                      </h4>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      activeOrder.deliveryRouting?.method === 'external_app'
                        ? 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                        : activeOrder.deliveryRouting?.method === 'customer_pickup'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-800 border border-slate-200'
                    }`}>
                      {activeOrder.deliveryRouting?.method === 'external_app'
                        ? 'Customer App Routed'
                        : activeOrder.deliveryRouting?.method === 'customer_pickup'
                        ? 'Customer Self-Pickup'
                        : 'BR Dedicated Fleet'}
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2.5">
                    <div className="flex justify-between items-start">
                      <span className="text-slate-500">Dispatch Service</span>
                      <div className="text-right">
                        <span className="font-semibold text-slate-900 block">
                          {activeOrder.deliveryRouting?.providerName || activeOrder.tracking.carrier}
                        </span>
                        {activeOrder.deliveryRouting?.directAppUrl && (
                          <a
                            href={activeOrder.deliveryRouting.directAppUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-cyan-700 hover:underline font-medium mt-0.5"
                          >
                            <span>Open Partner Portal</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {activeOrder.deliveryRouting?.externalBookingRef && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Booking / Trip Ref</span>
                        <span className="font-mono font-bold text-cyan-900 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200 text-[11px]">
                          {activeOrder.deliveryRouting.externalBookingRef}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-slate-500">Vehicle / Type</span>
                      <span className="font-mono font-medium text-slate-800 text-right max-w-[170px] truncate">
                        {activeOrder.deliveryRouting?.recommendedVehicle || activeOrder.tracking.vehicleNumber}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Driver Partner</span>
                      <span className="font-medium text-slate-800">
                        {activeOrder.deliveryRouting?.driverName || activeOrder.tracking.driverName}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Driver Mobile</span>
                      <a 
                        href={`tel:${activeOrder.deliveryRouting?.driverPhone || activeOrder.tracking.driverPhone}`} 
                        className="text-slate-900 font-medium hover:underline inline-flex items-center gap-1 font-mono"
                      >
                        <Phone className="w-3 h-3 text-slate-500" />
                        {activeOrder.deliveryRouting?.driverPhone || activeOrder.tracking.driverPhone}
                      </a>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex justify-between items-start">
                      <span className="text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                        Live Status
                      </span>
                      <span className="font-medium text-slate-900 text-right max-w-[150px] leading-tight text-[11px]">
                        {activeOrder.tracking.currentLocation}
                      </span>
                    </div>

                    {/* Quick Routing Action Buttons */}
                    <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setIsRoutingModalOpen(true)}
                        className="py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-md text-[11px] font-semibold text-slate-800 transition-colors inline-flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                        title="Route to other delivery apps or update booking"
                      >
                        <Truck className="w-3 h-3 text-cyan-600" />
                        <span>Route Other App</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleCopyManifest(activeOrder, e)}
                        className="py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-md text-[11px] font-semibold text-slate-800 transition-colors inline-flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                        title="Copy warehouse pickup and drop dock details to clipboard"
                      >
                        {manifestCopied ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-500" />
                        )}
                        <span>{manifestCopied ? 'Copied!' : 'Copy Manifest'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Quality & Laboratory Certificate */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Laboratory Rheology
                    </h4>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Certificate No.</span>
                      <span className="font-mono font-bold text-slate-900">{activeOrder.tracking.qcCertificateId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tested Tack (32°C)</span>
                      <span className="font-mono font-bold text-slate-900 tabular-nums">{activeOrder.tracking.testedTack}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Fineness</span>
                      <span className="font-mono font-medium text-slate-800">{activeOrder.tracking.testedFineness}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">QC Analyst</span>
                      <span className="font-medium text-slate-800">{activeOrder.tracking.qcInspectedBy}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between">
                      <span className="text-slate-500">Delta E Standard</span>
                      <span className="font-medium text-emerald-700 font-mono text-[11px]">ΔE &lt; 0.65 (ISO 12647)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Milestones Timeline */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-6">
                Batch Fulfillment Audit Trail
              </h3>

              <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
                {activeOrder.tracking.milestones.map((m, idx) => (
                  <div key={idx} className="relative flex items-start gap-4">
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${
                      m.completed
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-slate-300 bg-white text-slate-400'
                    }`}>
                      {m.completed ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-300" />
                      )}
                    </div>

                    <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <h4 className="font-bold text-xs text-slate-900">
                          {m.title}
                        </h4>
                        <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                          {m.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        {m.description}
                      </p>
                      {m.location && (
                        <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{m.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inks in this Shipment */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-4">
                Consignment Ink Specifications ({activeOrder.totalKg} kg Total)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeOrder.items.map(it => {
                  const colSpec = INK_COLORS.find(c => c.name === it.color);
                  return (
                    <div key={it.color} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span 
                          className="w-3.5 h-7 rounded-sm border border-black/10"
                          style={{ backgroundColor: colSpec?.hex }} 
                        />
                        <div>
                          <p className="font-bold text-xs text-slate-900">
                            {it.color} Process Ink ({INK_SERIES[it.seriesId].name})
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {it.containersCount}x {it.containerLabel} ({it.totalKg} kg)
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-slate-900 tabular-nums">
                          ₹{it.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        <span className="block text-[11px] font-mono text-slate-500 tabular-nums">
                          ₹{it.unitPricePerKg.toFixed(2)}/kg
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-sm space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {orders.length === 0 ? 'No Active Batch Orders in System' : 'Select an Order to Track'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {orders.length === 0 
                ? 'All previous orders have been cleared. Place an ink order using the Order Inks portal to begin real-time production & telemetry tracking.'
                : 'Choose an order from the list on the left to view stage-by-stage laboratory QC and logistics transit telemetry.'}
            </p>
          </div>
        )}
      </div>

      {/* Text-Based Email Summary Modal */}
      {activeOrder && (
        <EmailSummaryModal
          order={activeOrder}
          currencySymbol="₹"
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
        />
      )}

      {/* Customer Delivery Routing Modal */}
      {activeOrder && (
        <DeliveryRoutingModal
          order={activeOrder}
          isOpen={isRoutingModalOpen}
          onClose={() => setIsRoutingModalOpen(false)}
          onUpdateRouting={(orderId, updatedRouting) => {
            if (onUpdateRouting) {
              onUpdateRouting(orderId, updatedRouting);
            }
          }}
        />
      )}

      {/* Customer Order Feedback Modal */}
      {activeOrder && (
        <OrderFeedbackModal
          order={activeOrder}
          isOpen={isFeedbackModalOpen}
          existingFeedback={activeOrder.feedback}
          onClose={() => setIsFeedbackModalOpen(false)}
          onSubmitFeedback={(orderId, feedback) => {
            if (onSubmitFeedback) {
              onSubmitFeedback(orderId, feedback);
            }
          }}
        />
      )}
    </div>
  );
};
