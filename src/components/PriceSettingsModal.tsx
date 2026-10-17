import React, { useState } from 'react';
import { PricingConfig, VolumeDiscountTier } from '../types/ink';
import { INK_COLORS } from '../data/mockData';
import { 
  X, 
  Check, 
  DollarSign, 
  Tag, 
  RotateCcw, 
  Percent, 
  Truck, 
  ShieldCheck, 
  Scale, 
  Sliders,
  Sparkles,
  Building2
} from 'lucide-react';
import { DEFAULT_PRICING_CONFIG } from '../data/mockData';

interface PriceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPricing: PricingConfig;
  onSavePricing: (newPricing: PricingConfig) => void;
}

export const PriceSettingsModal: React.FC<PriceSettingsModalProps> = ({
  isOpen,
  onClose,
  currentPricing,
  onSavePricing,
}) => {
  const [pricing, setPricing] = useState<PricingConfig>(currentPricing);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  if (!isOpen) return null;

  const handlePriceChange = (
    series: 'bioSpeed' | 'bioPack',
    color: 'Cyan' | 'Magenta' | 'Yellow' | 'Black',
    val: number
  ) => {
    setPricing(prev => ({
      ...prev,
      [series]: {
        ...prev[series],
        [color]: Math.max(0, val)
      }
    }));
  };

  const handleTierChange = (index: number, field: keyof VolumeDiscountTier, val: number) => {
    const updated = [...pricing.volumeDiscounts];
    updated[index] = {
      ...updated[index],
      [field]: Math.max(0, val)
    };
    setPricing(prev => ({ ...prev, volumeDiscounts: updated }));
  };

  const handleAddTier = () => {
    const lastTier = pricing.volumeDiscounts[pricing.volumeDiscounts.length - 1];
    const newMin = lastTier ? lastTier.minKg + 250 : 100;
    const newPct = lastTier ? lastTier.discountPct + 5 : 5;
    setPricing(prev => ({
      ...prev,
      volumeDiscounts: [...prev.volumeDiscounts, { minKg: newMin, discountPct: newPct }]
    }));
  };

  const handleRemoveTier = (index: number) => {
    setPricing(prev => ({
      ...prev,
      volumeDiscounts: prev.volumeDiscounts.filter((_, i) => i !== index)
    }));
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all ink rates and discounts to BR Agency standard defaults?')) {
      setPricing(DEFAULT_PRICING_CONFIG);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePricing(pricing);
    setSaveSuccessNotice(true);
    setTimeout(() => {
      setSaveSuccessNotice(false);
      onClose();
    }, 800);
  };

  // Preview computation: 100 kg BIO SPEED order (25kg each C, M, Y, K)
  const preview100kgSubtotal = 
    25 * (pricing.bioSpeed.Cyan + pricing.bioSpeed.Magenta + pricing.bioSpeed.Yellow + pricing.bioSpeed.Black);
  const previewDiscountTier = pricing.volumeDiscounts
    .filter(t => 100 >= t.minKg)
    .sort((a, b) => b.minKg - a.minKg)[0];
  const previewDiscountPct = previewDiscountTier ? previewDiscountTier.discountPct : 0;
  const previewDiscountAmt = (preview100kgSubtotal * previewDiscountPct) / 100;
  const previewTaxAmt = ((preview100kgSubtotal - previewDiscountAmt) * pricing.taxRatePct) / 100;
  const previewTotal = preview100kgSubtotal - previewDiscountAmt + previewTaxAmt + pricing.shippingStandardFee;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  BR AGENCY
                </span>
                <span className="text-slate-500 text-xs">/</span>
                <span className="text-xs text-slate-300 font-medium">Rate Card &amp; Pricing Control</span>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Commercial Ink Pricing Engine
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="overflow-y-auto p-6 sm:p-8 space-y-8 flex-1">
          {saveSuccessNotice && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-xs font-semibold">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Prices updated successfully for BR Agency! Applying to orders and invoices...</span>
            </div>
          )}

          {/* Section 1: BIO SPEED Rates */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <span className="text-xs font-bold text-cyan-700 uppercase tracking-wider">
                  Product Line 1
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  BIO SPEED Ultra Sheetfed Inks (Per kg Rates)
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                Currency: {pricing.currencySymbol} / kg
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {INK_COLORS.map(col => (
                <div key={col.name} className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 mb-2">
                    <span 
                      className="w-3 h-3 rounded-full shrink-0 border border-black/10"
                      style={{ backgroundColor: col.hex }}
                    />
                    <span className="text-xs font-bold text-slate-900">{col.name}</span>
                  </div>

                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs font-mono text-slate-400">
                      {pricing.currencySymbol}
                    </span>
                    <input
                      type="number"
                      step="0.10"
                      min="0"
                      required
                      value={pricing.bioSpeed[col.name]}
                      onChange={(e) => handlePriceChange('bioSpeed', col.name, parseFloat(e.target.value) || 0)}
                      className="w-full pl-6 pr-2 py-1.5 text-xs font-mono font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 tabular-nums"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                    HSN: {col.hsnCode}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: BIO PACK Rates */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Product Line 2
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  BIO PACK Low-Migration Food Packaging Inks (Per kg Rates)
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                MOSH/MOAH Mineral-Oil Free Grade
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {INK_COLORS.map(col => (
                <div key={col.name} className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 mb-2">
                    <span 
                      className="w-3 h-3 rounded-full shrink-0 border border-black/10"
                      style={{ backgroundColor: col.hex }}
                    />
                    <span className="text-xs font-bold text-slate-900">{col.name}</span>
                  </div>

                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs font-mono text-slate-400">
                      {pricing.currencySymbol}
                    </span>
                    <input
                      type="number"
                      step="0.10"
                      min="0"
                      required
                      value={pricing.bioPack[col.name]}
                      onChange={(e) => handlePriceChange('bioPack', col.name, parseFloat(e.target.value) || 0)}
                      className="w-full pl-6 pr-2 py-1.5 text-xs font-mono font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 tabular-nums"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                    HSN: {col.hsnCode}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Volume Discount Tiers */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Commercial Incentives
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Volume Discount Tiers
                </h3>
              </div>
              <button
                type="button"
                onClick={handleAddTier}
                className="px-2.5 py-1 text-xs font-semibold text-slate-900 bg-white border border-slate-300 hover:bg-slate-100 rounded-md transition-colors"
              >
                + Add Tier
              </button>
            </div>

            <div className="space-y-2.5">
              {pricing.volumeDiscounts.map((tier, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 text-xs">
                  <span className="font-mono text-slate-400 font-bold w-12">
                    Tier {idx + 1}
                  </span>

                  <div className="flex items-center gap-1.5 flex-1">
                    <span className="text-slate-500">Minimum Order:</span>
                    <input
                      type="number"
                      min="1"
                      step="10"
                      value={tier.minKg}
                      onChange={(e) => handleTierChange(idx, 'minKg', parseInt(e.target.value) || 0)}
                      className="w-24 px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono font-bold text-slate-900 tabular-nums focus:bg-white"
                    />
                    <span className="text-slate-500">kg</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">Discount:</span>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      step="1"
                      value={tier.discountPct}
                      onChange={(e) => handleTierChange(idx, 'discountPct', parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono font-bold text-emerald-700 tabular-nums focus:bg-white"
                    />
                    <span className="text-slate-500">%</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveTier(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors ml-2"
                    title="Remove tier"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Taxes & Freight Fees */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Statutory &amp; Logistics
            </span>
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Tax &amp; Freight Schedule
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                <label className="block text-slate-500 font-medium mb-1">Industrial GST / Tax %</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="40"
                    step="0.5"
                    value={pricing.taxRatePct}
                    onChange={(e) => setPricing({ ...pricing, taxRatePct: parseFloat(e.target.value) || 0 })}
                    className="w-full pr-6 pl-2.5 py-1.5 font-mono font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded focus:bg-white"
                  />
                  <span className="absolute right-2.5 top-2 text-slate-400 font-mono">%</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">HSN 3215 Printing Ink</span>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                <label className="block text-slate-500 font-medium mb-1">Standard Freight Fee</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-400 font-mono">{pricing.currencySymbol}</span>
                  <input
                    type="number"
                    min="0"
                    value={pricing.shippingStandardFee}
                    onChange={(e) => setPricing({ ...pricing, shippingStandardFee: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-6 pr-2 py-1.5 font-mono font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded focus:bg-white"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">48h Road transport</span>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                <label className="block text-slate-500 font-medium mb-1">Express Courier Fee</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-400 font-mono">{pricing.currencySymbol}</span>
                  <input
                    type="number"
                    min="0"
                    value={pricing.shippingExpressFee}
                    onChange={(e) => setPricing({ ...pricing, shippingExpressFee: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-6 pr-2 py-1.5 font-mono font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded focus:bg-white"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">24h Priority Carrier</span>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                <label className="block text-slate-500 font-medium mb-1">Emergency Same-Day</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-400 font-mono">{pricing.currencySymbol}</span>
                  <input
                    type="number"
                    min="0"
                    value={pricing.shippingEmergencyFee}
                    onChange={(e) => setPricing({ ...pricing, shippingEmergencyFee: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-6 pr-2 py-1.5 font-mono font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded focus:bg-white"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Hot-shot direct driver</span>
              </div>
            </div>
          </div>

          {/* Section 5: Real-Time Price Simulation Preview */}
          <div className="p-4 bg-slate-900 text-white rounded-xl text-xs space-y-2">
            <div className="flex items-center justify-between text-cyan-400 font-bold uppercase text-[11px] tracking-wider">
              <span>Live BR Agency Rate Simulation</span>
              <span>100 kg Sample Order (25kg Each CMYK)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-slate-300">
              <div>Subtotal: <span className="text-white font-bold">{pricing.currencySymbol}{preview100kgSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
              <div>Discount ({previewDiscountPct}%): <span className="text-emerald-400 font-bold">-{pricing.currencySymbol}{previewDiscountAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
              <div>GST ({pricing.taxRatePct}%): <span className="text-white font-bold">{pricing.currencySymbol}{previewTaxAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
              <div>Total with Freight: <span className="text-cyan-300 font-bold text-sm">{pricing.currencySymbol}{previewTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 text-cyan-400" />
              <span>Save &amp; Update BR Agency Rates</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
