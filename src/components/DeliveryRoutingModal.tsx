import React, { useState } from 'react';
import { Order, DeliveryRoutingDetails, ExternalDeliveryAppId, DeliveryRoutingMethod } from '../types/ink';
import { 
  EXTERNAL_DELIVERY_APPS, 
  BR_AGENCY_PICKUP_HUB, 
  recommendVehicleForWeight, 
  copyDeliveryManifestToClipboard 
} from '../utils/deliveryRoutingUtils';
import { 
  Truck, 
  ExternalLink, 
  Copy, 
  Check, 
  X, 
  MapPin, 
  ShieldCheck, 
  Info, 
  Building2, 
  Phone, 
  Clock, 
  ArrowRight,
  Sparkles,
  Send
} from 'lucide-react';

interface DeliveryRoutingModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onUpdateRouting: (orderId: string, updatedRouting: DeliveryRoutingDetails) => void;
}

export const DeliveryRoutingModal: React.FC<DeliveryRoutingModalProps> = ({
  order,
  isOpen,
  onClose,
  onUpdateRouting,
}) => {
  if (!isOpen) return null;

  const currentRouting = order.deliveryRouting || {
    method: 'br_dedicated' as DeliveryRoutingMethod,
    providerId: 'porter' as ExternalDeliveryAppId,
    providerName: 'BR Agency Dedicated In-House Fleet',
    pickupWarehouse: BR_AGENCY_PICKUP_HUB,
    recommendedVehicle: recommendVehicleForWeight(order.totalKg, order.items),
    bookingStatus: 'booked'
  };

  const [selectedMethod, setSelectedMethod] = useState<DeliveryRoutingMethod>(currentRouting.method);
  const [selectedAppId, setSelectedAppId] = useState<ExternalDeliveryAppId>(
    currentRouting.method === 'external_app' ? currentRouting.providerId : 'porter'
  );
  const [bookingRef, setBookingRef] = useState<string>(currentRouting.externalBookingRef || '');
  const [driverName, setDriverName] = useState<string>(currentRouting.driverName || '');
  const [driverPhone, setDriverPhone] = useState<string>(currentRouting.driverPhone || '');
  const [vehicleNumber, setVehicleNumber] = useState<string>(currentRouting.vehicleNumber || '');
  const [specialNotes, setSpecialNotes] = useState<string>(currentRouting.notes || '');
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const selectedAppConfig = EXTERNAL_DELIVERY_APPS.find(a => a.id === selectedAppId) || EXTERNAL_DELIVERY_APPS[0];
  const recommendedVehicle = recommendVehicleForWeight(order.totalKg, order.items);

  const handleCopyManifest = async () => {
    const success = await copyDeliveryManifestToClipboard(order, {
      ...currentRouting,
      method: selectedMethod,
      providerId: selectedAppId,
      providerName: selectedMethod === 'br_dedicated' ? 'BR Agency Dedicated Fleet' : selectedAppConfig.name,
      externalBookingRef: bookingRef
    });
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSave = () => {
    const providerName = selectedMethod === 'br_dedicated'
      ? 'BR Agency Dedicated In-House Fleet'
      : selectedMethod === 'customer_pickup'
      ? 'Customer Self-Arranged Vehicle / Driver'
      : selectedAppConfig.name;

    const updatedRouting: DeliveryRoutingDetails = {
      method: selectedMethod,
      providerId: selectedMethod === 'br_dedicated' ? 'own_fleet' : selectedAppId,
      providerName,
      externalBookingRef: bookingRef.trim() || undefined,
      driverName: driverName.trim() || undefined,
      driverPhone: driverPhone.trim() || undefined,
      vehicleNumber: vehicleNumber.trim() || undefined,
      vehicleType: recommendedVehicle,
      bookingStatus: bookingRef.trim() ? 'booked' : 'unassigned',
      pickupWarehouse: BR_AGENCY_PICKUP_HUB,
      recommendedVehicle,
      directAppUrl: selectedAppConfig.bookingUrl || undefined,
      notes: specialNotes.trim() || undefined
    };

    onUpdateRouting(order.id, updatedRouting);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Route Delivery Application
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Customer Choice
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Order #{order.orderNumber} · {order.totalKg.toFixed(1)} kg ink shipment
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Quick Notice Banner */}
          <div className="p-3.5 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-slate-900 text-xs">
                Direct Delivery Routing Freedom
              </p>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                As a customer, you can choose to have your press ink shipment fulfilled by BR Agency’s dedicated logistics fleet, or directly route the dispatch through popular on-demand delivery apps (Porter, Borzo, Delhivery, etc.) or your own company vehicle.
              </p>
            </div>
          </div>

          {/* 1. Routing Method Tabs */}
          <div>
            <label className="font-bold text-slate-900 block mb-2 text-xs uppercase tracking-wider">
              Select Dispatch Routing Strategy
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedMethod('external_app')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedMethod === 'external_app'
                    ? 'border-cyan-600 bg-cyan-50/70 ring-1 ring-cyan-600 text-slate-900'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900">External Delivery App</span>
                  <span className="w-2 h-2 rounded-full bg-cyan-600" />
                </div>
                <p className="text-[11px] text-slate-500">
                  Porter, Borzo, Delhivery, Shiprocket, or VRL freight.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('br_dedicated')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedMethod === 'br_dedicated'
                    ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900 text-slate-900'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900">BR Dedicated Fleet</span>
                  <span className="w-2 h-2 rounded-full bg-slate-900" />
                </div>
                <p className="text-[11px] text-slate-500">
                  Our temperature-controlled ink freight carrier transit.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('customer_pickup')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedMethod === 'customer_pickup'
                    ? 'border-amber-600 bg-amber-50/70 ring-1 ring-amber-600 text-slate-900'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900">Customer Self-Pickup</span>
                  <span className="w-2 h-2 rounded-full bg-amber-600" />
                </div>
                <p className="text-[11px] text-slate-500">
                  Your pressroom driver collects directly at Bay 2.
                </p>
              </button>
            </div>
          </div>

          {/* 2. When External Delivery App is Selected */}
          {selectedMethod === 'external_app' && (
            <div className="space-y-4 pt-1">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-900 block text-xs uppercase tracking-wider">
                    Choose Delivery Application
                  </label>
                  <span className="text-[11px] font-mono text-cyan-800 bg-cyan-100/80 px-2 py-0.5 rounded-md font-semibold">
                    Recommended: {recommendedVehicle}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {EXTERNAL_DELIVERY_APPS.filter(a => a.id !== 'own_fleet').map((app) => {
                    const isSelected = selectedAppId === app.id;
                    return (
                      <div
                        key={app.id}
                        onClick={() => setSelectedAppId(app.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? `${app.colorScheme.bg} ${app.colorScheme.border} ring-2 ring-slate-900 shadow-2xs`
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-slate-900">{app.name}</span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md font-semibold ${
                            isSelected ? app.colorScheme.accent : 'bg-slate-100 text-slate-600'
                          }`}>
                            {app.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug">{app.tagline}</p>
                        <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                          <span>Pickup: {app.typicalPickupEta}</span>
                          {app.bookingUrl && (
                            <a
                              href={app.bookingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-cyan-700 hover:text-cyan-900 font-semibold"
                            >
                              <span>Open App</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Direct Booking Reference & Trip Linking */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <span>{selectedAppConfig.name} Booking Reference</span>
                  </h4>
                  {selectedAppConfig.bookingUrl && (
                    <a
                      href={selectedAppConfig.bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-cyan-800 bg-white border border-cyan-300 rounded-md hover:bg-cyan-50 transition-colors shadow-2xs"
                    >
                      <span>Book on {selectedAppConfig.name}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      External Booking Ref / Trip ID / LR #
                    </label>
                    <input
                      type="text"
                      value={bookingRef}
                      onChange={(e) => setBookingRef(e.target.value)}
                      placeholder="e.g. PRT-982142, WFT-5510, DEL-38192"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Assigned Vehicle Number
                    </label>
                    <input
                      type="text"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      placeholder="e.g. DL-01-AB-1234, MH-04-TR-9988"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Driver / Courier Name
                    </label>
                    <input
                      type="text"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar (Porter Partner)"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Driver Contact Mobile
                    </label>
                    <input
                      type="tel"
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      placeholder="e.g. +91 98101 22334"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. When Customer Self-Pickup is Selected */}
          {selectedMethod === 'customer_pickup' && (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
              <h4 className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-700" />
                <span>Customer Self-Arranged Vehicle Details</span>
              </h4>
              <p className="text-[11px] text-amber-900">
                Please provide your driver or vehicle details so our warehouse staging bay in Naraina can release the consignment without delay.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Company Vehicle Number
                  </label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder="e.g. DL-01-XY-5678"
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Driver Name &amp; Staff ID
                  </label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="e.g. Dilip Shinde (Apex Litho Staff)"
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Driver Mobile Phone
                  </label>
                  <input
                    type="tel"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    placeholder="e.g. +91 98200 44812"
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. Warehouse Pickup Coordinates & Manifest Copy (Crucial for pasting into Porter/Borzo) */}
          <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">
                  Pickup Warehouse Address (Give to Driver / App)
                </span>
                <p className="font-bold text-xs text-white">
                  {BR_AGENCY_PICKUP_HUB.hubName}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopyManifest}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 ${
                  copied 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-xs'
                }`}
                title="Copy complete pickup & drop manifest text to paste into Porter, Borzo, or Delhivery"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied Manifest!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Dispatch Manifest</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-300 font-mono">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Dock Bay:</span>
                <span>{BR_AGENCY_PICKUP_HUB.dockGate}</span>
                <span className="block text-slate-400 text-[10px] mt-1">{BR_AGENCY_PICKUP_HUB.streetAddress}, {BR_AGENCY_PICKUP_HUB.city} - {BR_AGENCY_PICKUP_HUB.postalCode}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Dispatch Desk Contact:</span>
                <span>{BR_AGENCY_PICKUP_HUB.dispatchContact}</span>
                <a href={`tel:${BR_AGENCY_PICKUP_HUB.dispatchPhone}`} className="block text-cyan-400 hover:underline">
                  {BR_AGENCY_PICKUP_HUB.dispatchPhone}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs inline-flex items-center gap-1.5"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Routing Saved!</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Update Order Routing</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
