import React, { useState } from 'react';
import { INK_SERIES, INK_COLORS } from '../data/mockData';
import { InkSeriesId, PricingConfig } from '../types/ink';
import { 
  CheckCircle2, 
  Leaf, 
  ShieldCheck, 
  Droplet, 
  Gauge, 
  Layers, 
  FlaskConical, 
  HelpCircle,
  FileCheck2,
  Tag,
  LogOut
} from 'lucide-react';

interface InkSeriesTdsProps {
  onQuickOrder: (seriesId: InkSeriesId) => void;
  pricingConfig: PricingConfig;
  onOpenPriceSettings: () => void;
  onExit?: () => void;
}

export const InkSeriesTds: React.FC<InkSeriesTdsProps> = ({ 
  onQuickOrder, 
  pricingConfig, 
  onOpenPriceSettings,
  onExit
}) => {
  const [activeTab, setActiveTab] = useState<InkSeriesId>('BIO_SPEED');
  const series = INK_SERIES[activeTab];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
          <span>Chemical Formulations</span>
          <span aria-hidden="true">·</span>
          <span>Technical Data Sheets (TDS)</span>
          <span aria-hidden="true">·</span>
          <span>ISO 2846-1 &amp; ISO 12647-2</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Printing Ink Systems &amp; Technical Specifications
            </h1>
            <p className="mt-1 text-sm text-slate-600 max-w-3xl">
              Engineered for maximum pressroom productivity and eco-compliance. BR Agency process inks utilize renewable vegetable oil binders and high-purity organic pigment dispersions.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <button
              onClick={onOpenPriceSettings}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs transition-colors inline-flex items-center gap-1.5"
            >
              <Tag className="w-3.5 h-3.5 text-cyan-600" />
              <span>Set / Edit Prices</span>
            </button>

            {onExit && (
              <button
                type="button"
                onClick={onExit}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition-colors group cursor-pointer"
                title="Exit this page and return to main overview"
                aria-label="Exit TDS page"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-600 transition-colors" />
                <span>Exit Page</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Series Switcher Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-xl max-w-md border border-slate-200">
        <button
          onClick={() => setActiveTab('BIO_SPEED')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'BIO_SPEED'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          BIO SPEED (Commercial Sheetfed)
        </button>
        <button
          onClick={() => setActiveTab('BIO_PACK')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'BIO_PACK'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          BIO PACK (Food Cartons &amp; Boxboard)
        </button>
      </div>

      {/* Hero Series Spotlight Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold tracking-wider text-cyan-600 uppercase">
                {series.category}
              </span>
              <span className="text-xs text-slate-300">·</span>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                {series.vegetableOilPct}
              </span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {series.name}
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-700">
              {series.subtitle}
            </p>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed max-w-2xl">
              {series.description}
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-start lg:items-end gap-3">
            <button
              onClick={() => onQuickOrder(series.id)}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              Order {series.name} Inks
            </button>
            <span className="text-[11px] font-mono text-slate-400">
              {series.moshMoahStatus}
            </span>
          </div>
        </div>

        {/* Technical Data Sheet Spec Matrix */}
        <div className="pt-6">
          <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider block mb-4">
            Laboratory Rheology & Physical Properties
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Gauge className="w-3.5 h-3.5 text-slate-400" />
                <span>Tack Value</span>
              </div>
              <p className="font-bold font-mono text-slate-900 text-sm">
                {series.specs.tackValue}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <FlaskConical className="w-3.5 h-3.5 text-slate-400" />
                <span>Viscosity (Cone-Plate)</span>
              </div>
              <p className="font-bold font-mono text-slate-900 text-sm">
                {series.specs.viscosity}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Setting Time</span>
              </div>
              <p className="font-bold font-mono text-slate-900 text-sm">
                {series.specs.settingTime}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Rub Resistance</span>
              </div>
              <p className="font-bold font-mono text-slate-900 text-sm">
                {series.specs.rubResistance}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Droplet className="w-3.5 h-3.5 text-cyan-600" />
                <span>Specular Gloss Level</span>
              </div>
              <p className="font-bold font-mono text-slate-900 text-sm">
                {series.specs.glossLevel}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                <span>Volatile Organics (VOC)</span>
              </div>
              <p className="font-bold font-mono text-slate-900 text-sm">
                {series.specs.vocContent}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 col-span-2">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Duct &amp; Fountain Stability</span>
              </div>
              <p className="font-bold text-slate-900 text-xs">
                {series.specs.ductStability}
              </p>
            </div>
          </div>
        </div>

        {/* Optimal Press Models & Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 mt-6 border-t border-slate-100 text-xs">
          <div>
            <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-2">
              Key Performance Characteristics
            </h4>
            <ul className="space-y-1.5 text-slate-600">
              {series.keyFeatures.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-2">
              Press Compatibility
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {series.optimalPresses.map((press, idx) => (
                <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded font-medium text-[11px]">
                  {press}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CMYK Color System & Spectro Standard Guide */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="mb-6">
          <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider block mb-1">
            CMYK Color Palette
          </span>
          <h3 className="text-xl font-bold text-slate-900">
            Process Cyan, Magenta, Yellow &amp; Black Pigment Standards
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            Manufactured in accordance with ISO 2846-1 spectral transparency requirements for precise four-color lithographic process reproduction.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {INK_COLORS.map(col => {
            const price = activeTab === 'BIO_SPEED' 
              ? pricingConfig.bioSpeed[col.name] 
              : pricingConfig.bioPack[col.name];
            return (
              <div 
                key={col.name}
                className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span 
                      className="w-5 h-5 rounded-md shadow-xs border border-black/10"
                      style={{ backgroundColor: col.hex }}
                    />
                    <span className="text-xs font-mono text-slate-400 font-semibold">
                      HSN {col.hsnCode}
                    </span>
                  </div>

                  <h4 className="font-bold text-base text-slate-900">
                    Process {col.name}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">
                    {col.pigmentName}
                  </p>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                    CI: {col.pigmentCode}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Active Rate</span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    {pricingConfig.currencySymbol}{price.toFixed(2)} / kg
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pressroom Best Practices & Fountain Settings */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-slate-400" />
          Pressroom Operating Guidelines for Bio-Based Inks
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
          <div className="space-y-1.5">
            <h5 className="font-bold text-slate-900">Dampening Solution pH &amp; Conductivity</h5>
            <p>
              Maintain fountain solution pH between 4.8 and 5.2. Conductivity should be controlled within 800 - 1,400 µS/cm to prevent premature emulsification and maintain clean printing non-image areas.
            </p>
          </div>

          <div className="space-y-1.5">
            <h5 className="font-bold text-slate-900">Ink Fountain Duct Settings</h5>
            <p>
              Due to the non-skinning vegetable ester vehicle, duct fountains can remain charged during lunch breaks or short overnight stops without needing anti-skin spray.
            </p>
          </div>

          <div className="space-y-1.5">
            <h5 className="font-bold text-slate-900">Spray Powder &amp; Pile Temperature</h5>
            <p>
              Due to fast physical setting, reduce anti-setoff spray powder by 25–40% compared to conventional mineral oil inks. Ensure pile temperature remains below 32°C.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
