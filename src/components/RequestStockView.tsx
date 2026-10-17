import React, { useState } from 'react';
import { 
  StockRequest, 
  InkSeriesId, 
  InkColorCode, 
  ContainerSizeId, 
  UserRole 
} from '../types/ink';
import { INK_SERIES, INK_COLORS, CONTAINER_OPTIONS, SAMPLE_CUSTOMERS } from '../data/mockData';
import { 
  Inbox, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  LogOut, 
  Building2, 
  Calendar, 
  Flame, 
  FileText, 
  Check, 
  X, 
  Plus, 
  Sparkles,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  Layers
} from 'lucide-react';

interface RequestStockViewProps {
  stockRequests: StockRequest[];
  onSubmitStockRequest: (newRequest: StockRequest) => void;
  onUpdateStockRequestStatus: (requestId: string, status: StockRequest['status'], ownerResponse?: string) => void;
  userRole: UserRole;
  onExit?: () => void;
}

export const RequestStockView: React.FC<RequestStockViewProps> = ({
  stockRequests,
  onSubmitStockRequest,
  onUpdateStockRequestStatus,
  userRole,
  onExit,
}) => {
  // Customer form state
  const [seriesId, setSeriesId] = useState<InkSeriesId>('BIO_SPEED');
  const [color, setColor] = useState<InkColorCode>('Cyan');
  const [containerId, setContainerId] = useState<ContainerSizeId>('can_2_5kg');
  const [requestedKg, setRequestedKg] = useState<number>(50);
  const [neededByDate, setNeededByDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [urgency, setUrgency] = useState<StockRequest['urgency']>('Urgent (Next 48 Hours)');
  const [companyName, setCompanyName] = useState<string>(SAMPLE_CUSTOMERS[0].companyName);
  const [contactPerson, setContactPerson] = useState<string>(SAMPLE_CUSTOMERS[0].contactPerson);
  const [phone, setPhone] = useState<string>(SAMPLE_CUSTOMERS[0].phone);
  const [email, setEmail] = useState<string>(SAMPLE_CUSTOMERS[0].email);
  const [city, setCity] = useState<string>(SAMPLE_CUSTOMERS[0].city);
  const [plantOrUnitName, setPlantOrUnitName] = useState<string>('Plant Unit #1');
  const [notes, setNotes] = useState<string>('');

  const [submittedNotice, setSubmittedNotice] = useState<string | null>(null);

  // Owner management state
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'in_formulation' | 'fulfilled'>('all');
  const [respondingRequestId, setRespondingRequestId] = useState<string | null>(null);
  const [ownerNoteInput, setOwnerNoteInput] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (requestedKg <= 0) return;

    const reqNum = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReq: StockRequest = {
      id: 'req_' + Date.now(),
      requestNumber: reqNum,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      companyName,
      contactPerson,
      phone,
      email,
      city,
      plantOrUnitName,
      seriesId,
      color,
      requestedKg,
      containerId,
      neededByDate,
      urgency,
      status: 'pending',
      notes
    };

    onSubmitStockRequest(newReq);
    setSubmittedNotice(`Your request (${reqNum}) for ${requestedKg} kg of ${seriesId} ${color} has been dispatched to plant scheduling.`);
    setNotes('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setSubmittedNotice(null), 6000);
  };

  const handleApplyPresetCustomer = (custIndex: number) => {
    const cust = SAMPLE_CUSTOMERS[custIndex];
    if (!cust) return;
    setCompanyName(cust.companyName);
    setContactPerson(cust.contactPerson);
    setPhone(cust.phone);
    setEmail(cust.email);
    setCity(cust.city);
    setPlantOrUnitName(cust.deliveryAddress?.plantOrUnitName || 'Main Press Hall');
  };

  const filteredRequests = stockRequests.filter(r => {
    if (activeFilter === 'all') return true;
    return r.status === activeFilter;
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span className="font-semibold text-cyan-600">Stock Replenishment &amp; Production Desk</span>
            <span>·</span>
            <span>Custom Batch Reservation</span>
            <span>·</span>
            <span>Direct Plant Milling</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {userRole === 'owner' ? 'Client Stock Requests & Replenishment Inquiries' : 'Request Additional Ink Stock & Custom Formulations'}
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-3xl">
            {userRole === 'owner' 
              ? 'Review inquiries from printing presses that require more stock than current warehouse inventory. Allocate 3-roll milling schedules and notify clients.'
              : 'Need more quantity than currently available in warehouse stock? Submit a priority request directly to BR Agency production engineers for custom batch milling.'}
          </p>
        </div>

        {onExit && (
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition-colors shrink-0 group self-start sm:self-auto cursor-pointer"
            title="Exit to Main Overview"
            aria-label="Exit Request Stock page"
          >
            <LogOut className="w-4 h-4 text-slate-500 group-hover:text-rose-600 transition-colors" />
            <span>Exit Page</span>
          </button>
        )}
      </div>

      {submittedNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">{submittedNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setSubmittedNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Grid: 2 Columns for Customer (Form on Left, My Requests on Right) / Full Width for Owner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Inquiry Submission Form (Available to all, prioritized for customer) */}
        <div className={userRole === 'owner' ? 'lg:col-span-5' : 'lg:col-span-6'}>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-6 bg-slate-900 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">New Stock Request Ticket</h2>
                    <span className="text-[11px] text-slate-400">Direct transmission to BR Agency Dispatch Desk</span>
                  </div>
                </div>

                {/* Autofill Customer Quick Pills */}
                <div className="hidden sm:flex items-center gap-1 text-[11px]">
                  <span className="text-slate-400">Demo Fill:</span>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetCustomer(0)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300"
                  >
                    Pragati
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetCustomer(1)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300"
                  >
                    Parksons
                  </button>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* 1. Ink Specifications */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">
                  1. Ink Specification &amp; Volume
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Ink System Series
                    </label>
                    <select
                      value={seriesId}
                      onChange={(e) => setSeriesId(e.target.value as InkSeriesId)}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                    >
                      <option value="BIO_SPEED">BIO SPEED (Sheetfed Commercial Litho)</option>
                      <option value="BIO_PACK">BIO PACK (Food Packaging / Folding Carton)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Process Color
                    </label>
                    <select
                      value={color}
                      onChange={(e) => setColor(e.target.value as InkColorCode)}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                    >
                      {INK_COLORS.map(c => (
                        <option key={c.name} value={c.name}>
                          {c.name} ({c.code}) - {c.pigmentCode}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Requested Volume (Total KG)
                    </label>
                    <input
                      type="number"
                      min="5"
                      step="5"
                      value={requestedKg}
                      onChange={(e) => setRequestedKg(parseFloat(e.target.value) || 0)}
                      className="w-full text-xs font-mono font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Preferred Container
                    </label>
                    <select
                      value={containerId}
                      onChange={(e) => setContainerId(e.target.value as ContainerSizeId)}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                    >
                      {CONTAINER_OPTIONS.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.label} ({c.kgPerUnit} kg)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Timeline & Urgency */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">
                  2. Timeline &amp; Pressroom Urgency
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Required By Date
                    </label>
                    <input
                      type="date"
                      value={neededByDate}
                      onChange={(e) => setNeededByDate(e.target.value)}
                      className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Urgency Level
                    </label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value as StockRequest['urgency'])}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                    >
                      <option value="Normal (Standard Delivery)">Normal (Standard Delivery - 3-5 days)</option>
                      <option value="Urgent (Next 48 Hours)">Urgent (Next 48 Hours Priority)</option>
                      <option value="Critical Press Stoppage (Emergency)">Critical Press Stoppage (Emergency)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Client & Dock Contact Details */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">
                  3. Client Contact &amp; Plant Delivery Dock
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      City / Industrial Area
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Plant Unit / Press Dock Name
                    </label>
                    <input
                      type="text"
                      value={plantOrUnitName}
                      onChange={(e) => setPlantOrUnitName(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                      placeholder="e.g. Unit 2 (Heidelberg Line)"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Special Press Requirements &amp; Substrate Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Specific tack range needed for low-temp room, UV varnish overprint compatibility, or custom rush delivery instructions..."
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Transmit Stock Request Ticket</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Status & History of Requests */}
        <div className={userRole === 'owner' ? 'lg:col-span-7' : 'lg:col-span-6'}>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-cyan-600" />
                  <span>{userRole === 'owner' ? 'All Client Stock Replenishment Inquiries' : 'Your Submitted Stock Inquiries'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {userRole === 'owner' 
                    ? 'Review incoming requests, schedule milling batches, and respond to clients.' 
                    : 'Track live review status from the BR Agency dispatch desk.'}
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveFilter('all')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    activeFilter === 'all' ? 'bg-white shadow-2xs text-slate-900 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({stockRequests.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('pending')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    activeFilter === 'pending' ? 'bg-white shadow-2xs text-amber-700 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pending ({stockRequests.filter(r => r.status === 'pending').length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('in_formulation')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    activeFilter === 'in_formulation' ? 'bg-white shadow-2xs text-cyan-700 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Milling
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('fulfilled')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    activeFilter === 'fulfilled' ? 'bg-white shadow-2xs text-emerald-700 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Ready
                </button>
              </div>
            </div>

            <div className="p-6 divide-y divide-slate-100 space-y-4">
              {filteredRequests.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No stock replenishment inquiries found for this status.
                </div>
              ) : (
                filteredRequests.map((req) => {
                  const colSpec = INK_COLORS.find(c => c.name === req.color);
                  const container = CONTAINER_OPTIONS.find(c => c.id === req.containerId);

                  return (
                    <div key={req.id} className="pt-4 first:pt-0 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {req.requestNumber}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {req.createdAt}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {req.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                              <Clock className="w-3 h-3" />
                              <span>Pending Review</span>
                            </span>
                          )}
                          {req.status === 'in_formulation' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-100 text-cyan-800">
                              <Layers className="w-3 h-3" />
                              <span>In Formulation &amp; Milling</span>
                            </span>
                          )}
                          {req.status === 'fulfilled' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Stock Allocated / Ready</span>
                            </span>
                          )}
                          {req.status === 'declined' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800">
                              <X className="w-3 h-3" />
                              <span>Declined</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Detail Pill */}
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-3 h-3 rounded-full inline-block shrink-0 shadow-2xs border border-black/10"
                              style={{ backgroundColor: colSpec?.hex }}
                            />
                            <span className="font-bold text-slate-900">
                              {req.seriesId} Process {req.color}
                            </span>
                            <span className="text-slate-500 font-mono">
                              ({req.requestedKg} kg in {container?.label || 'containers'})
                            </span>
                          </div>

                          <span className={`text-[11px] font-semibold ${
                            req.urgency.includes('Critical') ? 'text-rose-600' : req.urgency.includes('Urgent') ? 'text-amber-600' : 'text-slate-500'
                          }`}>
                            {req.urgency}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-600 pt-1 border-t border-slate-200">
                          <div>
                            <span className="font-semibold text-slate-800">{req.companyName}</span> · {req.contactPerson} ({req.phone})
                          </div>
                          <div className="sm:text-right">
                            Needed by: <span className="font-mono font-bold text-slate-900">{req.neededByDate}</span>
                          </div>
                        </div>

                        {req.notes && (
                          <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded border border-slate-200">
                            Client note: "{req.notes}"
                          </p>
                        )}

                        {req.ownerResponse && (
                          <div className="p-2.5 bg-cyan-50/80 border border-cyan-200 rounded text-[11px] text-cyan-900 space-y-0.5">
                            <div className="font-bold flex items-center gap-1 text-cyan-800">
                              <ShieldCheck className="w-3.5 h-3.5 text-cyan-700" />
                              <span>Plant Dispatch Response:</span>
                            </div>
                            <p>{req.ownerResponse}</p>
                          </div>
                        )}
                      </div>

                      {/* Owner Action Buttons (Only in Owner Mode) */}
                      {userRole === 'owner' && (
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <span className="text-[11px] font-semibold text-slate-500">
                            Owner Quick Status Actions:
                          </span>

                          <div className="flex items-center gap-1.5">
                            {req.status !== 'in_formulation' && (
                              <button
                                type="button"
                                onClick={() => {
                                  onUpdateStockRequestStatus(
                                    req.id, 
                                    'in_formulation', 
                                    'Batch allocated to 3-Roll Milling room. Formulation in progress.'
                                  );
                                }}
                                className="px-2.5 py-1 text-[11px] font-semibold text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-md transition-colors"
                              >
                                Mark Milling
                              </button>
                            )}

                            {req.status !== 'fulfilled' && (
                              <button
                                type="button"
                                onClick={() => {
                                  onUpdateStockRequestStatus(
                                    req.id, 
                                    'fulfilled', 
                                    'Batch milling complete and QC approved. Finished stock ready for collection/dispatch.'
                                  );
                                }}
                                className="px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors"
                              >
                                Mark Ready
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setRespondingRequestId(req.id);
                                setOwnerNoteInput(req.ownerResponse || '');
                              }}
                              className="px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                            >
                              Add Response Note
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Modal/Inline response input for owner */}
                      {userRole === 'owner' && respondingRequestId === req.id && (
                        <div className="p-3 bg-slate-100 rounded-lg space-y-2 text-xs">
                          <label className="block font-semibold text-slate-800">
                            Send Response / Milling Schedule to {req.companyName}:
                          </label>
                          <textarea
                            rows={2}
                            value={ownerNoteInput}
                            onChange={(e) => setOwnerNoteInput(e.target.value)}
                            placeholder="e.g. Raw materials reserved. Production slated for 15th October."
                            className="w-full p-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setRespondingRequestId(null)}
                              className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-800"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateStockRequestStatus(req.id, req.status, ownerNoteInput);
                                setRespondingRequestId(null);
                              }}
                              className="px-3 py-1 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800"
                            >
                              Save Response Note
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
