import React, { useState, useEffect } from 'react';
import { 
  StockItem, 
  InkSeriesId, 
  InkColorCode, 
  ContainerSizeId, 
  PricingConfig 
} from '../types/ink';
import { INK_SERIES, INK_COLORS, CONTAINER_OPTIONS } from '../data/mockData';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Search, 
  SlidersHorizontal, 
  RotateCcw, 
  TrendingDown, 
  Layers, 
  Boxes, 
  LogOut, 
  Edit2, 
  Check, 
  X, 
  History, 
  ShieldCheck, 
  ArrowUpRight,
  ShoppingCart,
  FileText,
  Sparkles,
  ChevronRight,
  Clock,
  Truck,
  Building2,
  Copy,
  Filter,
  Bell,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Send
} from 'lucide-react';

interface StockInventoryViewProps {
  stockInventory: StockItem[];
  onUpdateStock: (updatedStock: StockItem[]) => void;
  pricingConfig: PricingConfig;
  onNavigateToStockRequests?: () => void;
  onExit?: () => void;
}

interface ProcurementRecord {
  id: string;
  poNumber: string;
  itemId: string;
  seriesId: InkSeriesId;
  color: InkColorCode;
  containerId: ContainerSizeId;
  units: number;
  totalKg: number;
  vendor: string;
  leadTime: string;
  estimatedCost: number;
  lotNumber: string;
  storageBay: string;
  date: string;
  type: 'direct_restock' | 'purchase_order' | 'procurement_po';
  notes?: string;
}

const PROCUREMENT_SUPPLIERS = [
  {
    id: 'gujarat_pigments',
    name: 'Gujarat Pigments & Fine Chemicals Ltd.',
    category: 'Process Pigment Cakes & High-Dispersions',
    leadTime: '24-48 Hours (Direct Dispatch)',
    dockContact: 'Anil Mehta (+91 98251 44102)',
    rating: 'Tier 1 Quality (ISO 9001)'
  },
  {
    id: 'continental_resins',
    name: 'Continental Resins & Soya Varnish Corp.',
    category: 'Vegetable Bio-Oil Varnish & Hard Resin Binders',
    leadTime: '48 Hours',
    dockContact: 'S. K. Bansal (+91 98110 32901)',
    rating: 'MOSH/MOAH Low-Migration Certified'
  },
  {
    id: 'national_packaging',
    name: 'National Corrugated & Metal Packaging Industries',
    category: 'Startup Press Boxes (Min 2kg / 5kg), Vacuum Cans (2.5kg) & Pails',
    leadTime: '24 Hours',
    dockContact: 'Pooja Verma (+91 98711 88203)',
    rating: 'Airtight Poly-Lined Press Boxes (Min 2kg) & Cans'
  },
  {
    id: 'inhouse_milling',
    name: 'BR Central Plant - 3-Roll Milling Room #2',
    category: 'In-House Dispersion & High-Speed Milling Line',
    leadTime: 'Same-Day Fast Track Batch (4-6 Hours)',
    dockContact: 'Master Chemist R. C. Mathur',
    rating: 'In-House Laboratory QC Certified'
  }
];

const WAREHOUSE_BAYS = [
  'Naraina Bay 2 - Main Finished Goods Pallet Rack',
  'Naraina Bay 4 - Temperature Controlled Vault',
  'Central Packaging Staging Area (Dock 1)',
  'Emergency Press Dispatch Reserve Bay'
];

export const StockInventoryView: React.FC<StockInventoryViewProps> = ({
  stockInventory,
  onUpdateStock,
  pricingConfig,
  onNavigateToStockRequests,
  onExit,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeries, setSelectedSeries] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low' | 'out'>('all');

  // Procurement & Restock Modal state (Includes 2kg and 5kg Startup Box support)
  const [restockItem, setRestockItem] = useState<StockItem | null>(null);
  const [restockSeriesId, setRestockSeriesId] = useState<InkSeriesId>('BIO_SPEED');
  const [restockColor, setRestockColor] = useState<InkColorCode>('Black');
  const [restockContainerId, setRestockContainerId] = useState<ContainerSizeId>('box_2kg');
  const [procurementMode, setProcurementMode] = useState<'direct_restock' | 'purchase_order'>('direct_restock');
  const [addedUnits, setAddedUnits] = useState<number>(10);
  const [restockBatchLot, setRestockBatchLot] = useState<string>('');
  const [restockBay, setRestockBay] = useState<string>(WAREHOUSE_BAYS[0]);
  const [restockNote, setRestockNote] = useState<string>('');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(PROCUREMENT_SUPPLIERS[0].id);
  const [procurementPriority, setProcurementPriority] = useState<'Emergency Rush (24h Delivery)' | 'Standard Fulfillment (48h)' | 'Scheduled Reorder (5 Days)'>('Standard Fulfillment (48h)');
  const [poNumber, setPoNumber] = useState<string>('');
  const [poCopied, setPoCopied] = useState<boolean>(false);

  // Bulk Procurement Modal state
  const [isBulkProcurementOpen, setIsBulkProcurementOpen] = useState<boolean>(false);
  const [bulkQtys, setBulkQtys] = useState<Record<string, number>>({});
  const [bulkPoNumber, setBulkPoNumber] = useState<string>('');
  const [isBannerCollapsed, setIsBannerCollapsed] = useState<boolean>(false);

  // Inline Threshold edit
  const [editingThresholdId, setEditingThresholdId] = useState<string | null>(null);
  const [tempThreshold, setTempThreshold] = useState<number>(0);

  // History state & persistence
  const [procurementHistory, setProcurementHistory] = useState<ProcurementRecord[]>(() => {
    try {
      const saved = localStorage.getItem('bragency_procurement_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load procurement history', e);
    }
    return [
      {
        id: 'proc_init_1',
        poNumber: 'PO-2026-4019',
        itemId: 'BIO_SPEED_Black_can_2_5kg',
        seriesId: 'BIO_SPEED',
        color: 'Black',
        containerId: 'can_2_5kg',
        units: 20,
        totalKg: 50,
        vendor: 'BR Central Plant - 3-Roll Milling Room #2',
        leadTime: 'Same-Day Fast Track Batch (4-6 Hours)',
        estimatedCost: 16000,
        lotNumber: 'LOT-BS-2610-901',
        storageBay: WAREHOUSE_BAYS[0],
        date: '2026-10-15 14:30',
        type: 'direct_restock',
        notes: 'Replenished high-demand Black litho process ink'
      }
    ];
  });

  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('bragency_procurement_history', JSON.stringify(procurementHistory));
    } catch (e) {
      console.error('Failed to save procurement history', e);
    }
  }, [procurementHistory]);

  // Computed metrics
  const totalKg = stockInventory.reduce((sum, item) => {
    const container = CONTAINER_OPTIONS.find(c => c.id === item.containerId);
    return sum + item.availableUnits * (container?.kgPerUnit || 0);
  }, 0);

  // Threshold reached items (available units <= safety threshold)
  const thresholdReachedItems = [...stockInventory]
    .filter(item => item.availableUnits <= item.minThresholdUnits)
    .sort((a, b) => {
      // 0 available units first
      if (a.availableUnits === 0 && b.availableUnits !== 0) return -1;
      if (b.availableUnits === 0 && a.availableUnits !== 0) return 1;
      const ratioA = a.minThresholdUnits > 0 ? a.availableUnits / a.minThresholdUnits : 1;
      const ratioB = b.minThresholdUnits > 0 ? b.availableUnits / b.minThresholdUnits : 1;
      return ratioA - ratioB;
    });

  const lowStockItems = stockInventory.filter(
    item => item.availableUnits > 0 && item.availableUnits <= item.minThresholdUnits
  );
  const outOfStockItems = stockInventory.filter(item => item.availableUnits === 0);

  const totalDeficitUnits = thresholdReachedItems.reduce(
    (sum, it) => sum + Math.max(0, it.minThresholdUnits - it.availableUnits), 0
  );

  const totalDeficitKg = thresholdReachedItems.reduce((sum, it) => {
    const container = CONTAINER_OPTIONS.find(c => c.id === it.containerId);
    const def = Math.max(0, it.minThresholdUnits - it.availableUnits);
    return sum + def * (container?.kgPerUnit || 0);
  }, 0);

  // Valuation
  const totalValuation = stockInventory.reduce((sum, item) => {
    const container = CONTAINER_OPTIONS.find(c => c.id === item.containerId);
    const kg = item.availableUnits * (container?.kgPerUnit || 0);
    const priceKg = item.seriesId === 'BIO_SPEED' 
      ? pricingConfig.bioSpeed[item.color] 
      : pricingConfig.bioPack[item.color];
    return sum + (kg * priceKg);
  }, 0);

  // Filtering
  const filteredItems = stockInventory.filter(item => {
    if (selectedSeries !== 'all' && item.seriesId !== selectedSeries) return false;
    if (selectedColor !== 'all' && item.color !== selectedColor) return false;
    if (statusFilter === 'low' && (item.availableUnits === 0 || item.availableUnits > item.minThresholdUnits)) return false;
    if (statusFilter === 'out' && item.availableUnits > 0) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const container = CONTAINER_OPTIONS.find(c => c.id === item.containerId);
      const matches = 
        item.seriesId.toLowerCase().includes(q) ||
        item.color.toLowerCase().includes(q) ||
        (container?.label || '').toLowerCase().includes(q);
      if (!matches) return false;
    }

    return true;
  });

  // Open Procurement Workflow for a specific SKU
  const handleOpenRestockModal = (item: StockItem) => {
    setRestockItem(item);
    setRestockSeriesId(item.seriesId);
    setRestockColor(item.color);
    setRestockContainerId(item.containerId);
    setProcurementMode('direct_restock');
    // Calculate suggested restock quantity: enough to exceed threshold with safe buffer
    const suggested = Math.max(
      10,
      Math.max(0, item.minThresholdUnits * 2 - item.availableUnits)
    );
    setAddedUnits(suggested);
    setRestockBatchLot(`LOT-${item.seriesId === 'BIO_SPEED' ? 'BS' : 'BP'}-${Date.now().toString().slice(-4)}`);
    setPoNumber(`PO-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    setRestockBay(WAREHOUSE_BAYS[0]);
    setRestockNote(`Procurement replenishing safety threshold of ${item.minThresholdUnits} units`);
    setPoCopied(false);
  };

  // Dedicated launcher for Startup 2kg and 5kg Box restock batches
  const handleOpenStartupBoxRestock = (boxSize: 'box_2kg' | 'box_5kg' = 'box_2kg', series: InkSeriesId = 'BIO_SPEED', col: InkColorCode = 'Black') => {
    const match = stockInventory.find(it => it.seriesId === series && it.color === col && it.containerId === boxSize) 
      || stockInventory.find(it => it.containerId === boxSize)
      || stockInventory[0];

    setRestockItem(match);
    setRestockSeriesId(series);
    setRestockColor(col);
    setRestockContainerId(boxSize);
    setProcurementMode('direct_restock');
    setAddedUnits(20);
    setRestockBatchLot(`LOT-${series === 'BIO_SPEED' ? 'BS' : 'BP'}-${Date.now().toString().slice(-4)}`);
    setPoNumber(`PO-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    setRestockBay(WAREHOUSE_BAYS[0]);
    setRestockNote(`Startup production restock for ${boxSize === 'box_2kg' ? '2.0 kg' : '5.0 kg'} corrugated press box`);
    setPoCopied(false);
  };

  // Open Bulk Procurement Workflow for all items below threshold
  const handleOpenBulkProcurement = () => {
    const initialBulkQtys: Record<string, number> = {};
    thresholdReachedItems.forEach(it => {
      const suggested = Math.max(
        10,
        Math.max(0, it.minThresholdUnits * 2 - it.availableUnits)
      );
      initialBulkQtys[it.id] = suggested;
    });
    setBulkQtys(initialBulkQtys);
    setBulkPoNumber(`MPO-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    setIsBulkProcurementOpen(true);
  };

  // Apply single restock / procurement (supporting 2kg, 5kg boxes & any container)
  const handleApplyRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockItem) return;

    const container = CONTAINER_OPTIONS.find(c => c.id === restockContainerId) || CONTAINER_OPTIONS[0];
    const itemKg = addedUnits * (container?.kgPerUnit || 0);
    const priceKg = restockSeriesId === 'BIO_SPEED' 
      ? pricingConfig.bioSpeed[restockColor] 
      : pricingConfig.bioPack[restockColor];
    const estimatedCost = itemKg * priceKg * 0.72; // ~72% industrial cost basis

    const supplier = PROCUREMENT_SUPPLIERS.find(s => s.id === selectedSupplierId) || PROCUREMENT_SUPPLIERS[0];

    const targetSkuId = `${restockSeriesId}_${restockColor}_${restockContainerId}`;
    const existingIndex = stockInventory.findIndex(
      it => it.id === targetSkuId || (it.seriesId === restockSeriesId && it.color === restockColor && it.containerId === restockContainerId)
    );

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    let updated: StockItem[];

    if (existingIndex >= 0) {
      updated = stockInventory.map((it, idx) => {
        if (idx === existingIndex) {
          return {
            ...it,
            availableUnits: it.availableUnits + addedUnits,
            lastUpdated: timestamp
          };
        }
        return it;
      });
    } else {
      const defaultThreshold = restockContainerId === 'box_2kg' ? 10 : restockContainerId === 'box_5kg' ? 6 : 8;
      const newSku: StockItem = {
        id: targetSkuId,
        seriesId: restockSeriesId,
        color: restockColor,
        containerId: restockContainerId,
        availableUnits: addedUnits,
        minThresholdUnits: defaultThreshold,
        lastUpdated: timestamp
      };
      updated = [newSku, ...stockInventory];
    }

    // Record procurement entry
    const newRecord: ProcurementRecord = {
      id: `proc_${Date.now()}`,
      poNumber: poNumber || `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      itemId: targetSkuId,
      seriesId: restockSeriesId,
      color: restockColor,
      containerId: restockContainerId,
      units: addedUnits,
      totalKg: itemKg,
      vendor: supplier.name,
      leadTime: procurementPriority,
      estimatedCost,
      lotNumber: restockBatchLot || `LOT-${Date.now().toString().slice(-4)}`,
      storageBay: restockBay,
      date: timestamp,
      type: procurementMode,
      notes: restockNote
    };

    setProcurementHistory(prev => [newRecord, ...prev]);
    onUpdateStock(updated);
    setRestockItem(null);
  };

  // Apply bulk restock
  const handleApplyBulkRestock = (e: React.FormEvent) => {
    e.preventDefault();

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const updated = stockInventory.map(it => {
      const add = bulkQtys[it.id] || 0;
      if (add > 0) {
        return {
          ...it,
          availableUnits: it.availableUnits + add,
          lastUpdated: timestamp
        };
      }
      return it;
    });

    // Add bulk entries to procurement history
    const bulkRecords: ProcurementRecord[] = thresholdReachedItems
      .filter(it => (bulkQtys[it.id] || 0) > 0)
      .map((it, idx) => {
        const container = CONTAINER_OPTIONS.find(c => c.id === it.containerId);
        const qty = bulkQtys[it.id] || 0;
        const totalItemKg = qty * (container?.kgPerUnit || 0);
        const priceKg = it.seriesId === 'BIO_SPEED' ? pricingConfig.bioSpeed[it.color] : pricingConfig.bioPack[it.color];

        return {
          id: `proc_bulk_${Date.now()}_${idx}`,
          poNumber: `${bulkPoNumber}-${idx + 1}`,
          itemId: it.id,
          seriesId: it.seriesId,
          color: it.color,
          containerId: it.containerId,
          units: qty,
          totalKg: totalItemKg,
          vendor: 'BR Central Manufacturing & Procurement Line',
          leadTime: 'Emergency Threshold Recovery',
          estimatedCost: totalItemKg * priceKg * 0.72,
          lotNumber: `LOT-BULK-${Date.now().toString().slice(-4)}`,
          storageBay: WAREHOUSE_BAYS[0],
          date: timestamp,
          type: 'procurement_po',
          notes: `Consolidated procurement to recover safety threshold (${it.minThresholdUnits} units)`
        };
      });

    setProcurementHistory(prev => [...bulkRecords, ...prev]);
    onUpdateStock(updated);
    setIsBulkProcurementOpen(false);
  };

  // Copy PO Requisition Slip
  const handleCopyPoSlip = async () => {
    if (!restockItem) return;
    const container = CONTAINER_OPTIONS.find(c => c.id === restockContainerId) || CONTAINER_OPTIONS[0];
    const supplier = PROCUREMENT_SUPPLIERS.find(s => s.id === selectedSupplierId) || PROCUREMENT_SUPPLIERS[0];
    const totalItemKg = addedUnits * (container?.kgPerUnit || 0);
    const priceKg = restockSeriesId === 'BIO_SPEED' 
      ? pricingConfig.bioSpeed[restockColor] 
      : pricingConfig.bioPack[restockColor];
    const estimatedCost = totalItemKg * priceKg * 0.72;

    const currentMatching = stockInventory.find(
      it => it.seriesId === restockSeriesId && it.color === restockColor && it.containerId === restockContainerId
    );

    const slip = `=====================================================
BR AGENCY INK SUPPLIES - PROCUREMENT PURCHASE ORDER
=====================================================
PO Reference    : ${poNumber}
Date Generated  : ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
Supplier Vendor : ${supplier.name}
Category        : ${supplier.category}
Priority / Term : ${procurementPriority}
-----------------------------------------------------
REORDER MATERIAL SPECIFICATIONS:
Series Base     : ${INK_SERIES[restockSeriesId].name} (${INK_SERIES[restockSeriesId].category})
Color Pigment   : ${restockColor} Process Formulation
Container Size  : ${container?.label} (${container?.kgPerUnit} kg/unit)
Reorder Units   : ${addedUnits} Containers
Total Weight    : ${totalItemKg.toFixed(1)} kg
Current Stock   : ${currentMatching ? currentMatching.availableUnits : 0} units (Safety Threshold: ${currentMatching ? currentMatching.minThresholdUnits : 10})
Estimated Value : ₹${estimatedCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
-----------------------------------------------------
DELIVERY & STORAGE DESTINATION:
Receiving Bay   : ${restockBay}
Batch / Lot Ref : ${restockBatchLot}
Notes           : ${restockNote || 'Standard commercial offset quality certification required on arrival.'}
=====================================================`;

    try {
      await navigator.clipboard.writeText(slip);
      setPoCopied(true);
      setTimeout(() => setPoCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveThreshold = (itemId: string) => {
    const updated = stockInventory.map(it => {
      if (it.id === itemId) {
        return {
          ...it,
          minThresholdUnits: Math.max(0, tempThreshold)
        };
      }
      return it;
    });
    onUpdateStock(updated);
    setEditingThresholdId(null);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span className="inline-flex items-center gap-1 font-semibold text-cyan-700 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
              <ShieldCheck className="w-3 h-3 text-cyan-600" />
              Owner &amp; Supplier Only
            </span>
            <span>·</span>
            <span>Central Warehouse Stock</span>
            <span>·</span>
            <span>Milling &amp; Ready Inventory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Warehouse Stock Inventory &amp; Procurement Controller
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-3xl leading-relaxed">
            Real-time finished goods stock tracker. Client intake orders are automatically deducted from this inventory. Monitor depletion against minimum safety thresholds and trigger instant procurement reorders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Quick Startup Box Restock Action Buttons */}
          <button
            type="button"
            onClick={() => handleOpenStartupBoxRestock('box_2kg')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-cyan-950 bg-cyan-100 hover:bg-cyan-200 border border-cyan-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
            title="Quick restock 2.0 kg corrugated press boxes (startup package size)"
          >
            <Boxes className="w-3.5 h-3.5 text-cyan-700" />
            <span>+ Restock 2kg Box</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenStartupBoxRestock('box_5kg')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
            title="Quick restock 5.0 kg corrugated press boxes (startup package size)"
          >
            <Boxes className="w-3.5 h-3.5 text-amber-700" />
            <span>+ Restock 5kg Box</span>
          </button>

          <button
            type="button"
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>Procurement Log ({procurementHistory.length})</span>
          </button>

          {onNavigateToStockRequests && (
            <button
              onClick={onNavigateToStockRequests}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors"
            >
              <span>Customer Stock Requests</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}

          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition-colors group cursor-pointer"
              title="Exit to Main Overview"
            >
              <LogOut className="w-4 h-4 text-slate-500 group-hover:text-rose-600 transition-colors" />
              <span>Exit Page</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Financial & Inventory Strips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Total Ink Available</span>
            <Boxes className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {totalKg.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Across {stockInventory.length} packaging SKUs
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Warehouse Valuation</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
            ₹{totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Calculated at active INR rate card
          </span>
        </div>

        <div className={`bg-white border rounded-xl p-5 shadow-xs transition-colors ${
          lowStockItems.length > 0 ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold text-amber-900">Low Stock SKUs</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className={`text-2xl font-bold font-mono tabular-nums ${lowStockItems.length > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            {lowStockItems.length} SKUs
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            At or below safety threshold
          </span>
        </div>

        <div className={`bg-white border rounded-xl p-5 shadow-xs transition-colors ${
          outOfStockItems.length > 0 ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold text-rose-900">Out of Stock SKUs</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <p className={`text-2xl font-bold font-mono tabular-nums ${outOfStockItems.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {outOfStockItems.length} SKUs
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {outOfStockItems.length === 0 ? 'Zero critical depletion' : 'Blocks client intake orders'}
          </span>
        </div>
      </div>

      {/* =========================================================================
          CRITICAL VISUAL NOTIFICATION SYSTEM & THRESHOLD BANNER
         ========================================================================= */}
      {thresholdReachedItems.length > 0 ? (
        <section className="relative overflow-hidden bg-gradient-to-r from-amber-50 via-orange-50/70 to-amber-50/90 border-2 border-amber-300 rounded-2xl p-5 sm:p-6 shadow-sm animate-in fade-in duration-200 space-y-5">
          {/* Top Banner Header & Primary Alert Strip */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="relative w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs ring-4 ring-amber-100">
                <AlertTriangle className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                </span>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    Safety Threshold Depletion Alert
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-200 text-amber-950 border border-amber-300">
                    {thresholdReachedItems.length} SKU{thresholdReachedItems.length > 1 ? 's' : ''} Reached Reorder Point
                  </span>
                  {outOfStockItems.length > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-300">
                      {outOfStockItems.length} Zero Stock
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-700 mt-1 max-w-3xl leading-relaxed">
                  The following process ink items have reached or dipped below their minimum warehouse reorder thresholds. Order intake will fail or reject client requests when inventory drops below order volumes. Click <strong>Restock</strong> on any formulation or trigger a <strong>Bulk Procurement Run</strong> to replenish factory stock.
                </p>

                {/* Quick Summary Deficit Counter */}
                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs font-mono text-slate-700">
                  <span className="inline-flex items-center gap-1.5 bg-white/80 px-2.5 py-1 rounded-md border border-amber-200">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>Total Deficit: <strong>{totalDeficitUnits} units</strong></span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-white/80 px-2.5 py-1 rounded-md border border-amber-200">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>Replenishment Weight: <strong>{totalDeficitKg.toFixed(1)} kg</strong></span>
                  </span>
                  <span className="text-slate-500 font-sans text-[11px]">
                    Buffer formula: Restores stock to 2x safety tolerance
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Restock / Procurement Action Triggers */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
              <button
                type="button"
                onClick={() => handleOpenStartupBoxRestock('box_2kg')}
                className="px-3.5 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                title="Trigger procurement restock for 2.0 kg or 5.0 kg boxes"
              >
                <Boxes className="w-4 h-4 text-cyan-200" />
                <span>Restock 2kg / 5kg Boxes</span>
              </button>

              <button
                type="button"
                onClick={handleOpenBulkProcurement}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm inline-flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                title="Open unified procurement order for all depleted threshold SKUs"
              >
                <ShoppingCart className="w-4 h-4 text-cyan-400" />
                <span>Bulk Procurement Run ({thresholdReachedItems.length} SKUs)</span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter(statusFilter === 'low' ? 'all' : 'low')}
                className={`px-3.5 py-2.5 text-xs font-semibold rounded-xl border transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === 'low'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                    : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                }`}
                title="Filter table below to show only items reaching safety threshold"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>{statusFilter === 'low' ? 'Show All SKUs' : 'Filter Table'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsBannerCollapsed(!isBannerCollapsed)}
                className="p-2 text-slate-500 hover:text-slate-900 bg-white/70 hover:bg-white rounded-lg border border-amber-200 text-xs transition-colors"
                title={isBannerCollapsed ? 'Expand items cards' : 'Collapse items cards'}
              >
                {isBannerCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Highlighted Items Cards Strip */}
          {!isBannerCollapsed && (
            <div className="pt-2 border-t border-amber-200/80">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {thresholdReachedItems.map((item) => {
                  const container = CONTAINER_OPTIONS.find(c => c.id === item.containerId);
                  const colSpec = INK_COLORS.find(c => c.name === item.color);
                  const series = INK_SERIES[item.seriesId];
                  const isOut = item.availableUnits === 0;
                  const deficit = Math.max(0, item.minThresholdUnits - item.availableUnits);
                  const deficitKg = deficit * (container?.kgPerUnit || 0);

                  const fillRatio = item.minThresholdUnits > 0 
                    ? Math.min(100, Math.round((item.availableUnits / item.minThresholdUnits) * 100))
                    : 100;

                  return (
                    <div
                      key={`banner_${item.id}`}
                      className={`relative p-4 rounded-xl border flex flex-col justify-between transition-all shadow-xs ${
                        isOut
                          ? 'bg-white border-rose-300 hover:border-rose-400'
                          : 'bg-white border-amber-300 hover:border-amber-400'
                      }`}
                    >
                      {/* Top Row: Series & Color Pigment Tag */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isOut
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}>
                            {isOut ? 'Depleted · 0 Units' : `Threshold Deficit (-${deficit})`}
                          </span>

                          <span className="text-[11px] font-mono text-slate-400">
                            {container?.kgPerUnit} kg/can
                          </span>
                        </div>

                        {/* Title and Color Spec */}
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <span
                            className="w-4 h-4 rounded-full inline-block shrink-0 shadow-2xs border border-black/15"
                            style={{ backgroundColor: colSpec?.hex }}
                          />
                          <div className="truncate">
                            <h4 className="font-bold text-xs text-slate-900 truncate">
                              {item.color} · {series?.name || item.seriesId}
                            </h4>
                            <p className="text-[11px] text-slate-500 truncate">
                              {container?.label}
                            </p>
                          </div>
                        </div>

                        {/* Inventory Bar Gauge */}
                        <div className="my-2.5 p-2 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="text-slate-500">Available:</span>
                            <span className={`font-bold ${isOut ? 'text-rose-600' : 'text-amber-700'}`}>
                              {item.availableUnits} / {item.minThresholdUnits} min
                            </span>
                          </div>

                          {/* Visual progress track */}
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${isOut ? 'bg-rose-500' : 'bg-amber-500'}`}
                              style={{ width: `${Math.max(4, fillRatio)}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span>Status: {fillRatio}% of safety line</span>
                            <span className="font-mono">{deficitKg.toFixed(1)} kg deficit</span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Restock Procurement Button */}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => handleOpenRestockModal(item)}
                          className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.01] ${
                            isOut
                              ? 'bg-rose-600 hover:bg-rose-700 text-white'
                              : 'bg-slate-900 hover:bg-slate-800 text-white'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Restock SKU</span>
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      ) : (
        /* Optimal Inventory Compliant Banner */
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-900 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 block text-xs">
                All Finished Goods Inventory Above Safety Thresholds
              </span>
              <p className="text-[11px] text-slate-600 mt-0.5">
                All {stockInventory.length} process ink SKUs comply with laboratory reorder levels. Production line capacity and customer dispatch capability are fully nominal.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleOpenRestockModal(stockInventory[0])}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors inline-flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <Plus className="w-3 h-3 text-cyan-600" />
              <span>Manual Reorder / Stock Entry</span>
            </button>
          </div>
        </div>
      )}

      {/* Procurement History Log Drawer (Expandable) */}
      {isHistoryOpen && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-cyan-600" />
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Procurement Orders &amp; Warehouse Restock Ledger
                </h3>
                <p className="text-[11px] text-slate-500">
                  Audit trail of finished stock additions, milling lot assignments, and vendor purchase order requisitions.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsHistoryOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Date / Timestamp</th>
                  <th className="py-2.5 px-3">PO Reference</th>
                  <th className="py-2.5 px-3">SKU Formulation</th>
                  <th className="py-2.5 px-3 text-center">Units Added</th>
                  <th className="py-2.5 px-3 text-right">Total Weight</th>
                  <th className="py-2.5 px-3">Supplier / Milling Room</th>
                  <th className="py-2.5 px-3">Batch Lot #</th>
                  <th className="py-2.5 px-3 text-center">Workflow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {procurementHistory.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-slate-400 font-sans">
                      No procurement orders recorded yet. Restock an item above to log an entry.
                    </td>
                  </tr>
                ) : (
                  procurementHistory.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 text-slate-500">{rec.date}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{rec.poNumber}</td>
                      <td className="py-2.5 px-3 font-sans font-semibold text-slate-800">
                        {rec.seriesId} · {rec.color}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-emerald-700">+{rec.units}</td>
                      <td className="py-2.5 px-3 text-right text-slate-900">{rec.totalKg.toFixed(1)} kg</td>
                      <td className="py-2.5 px-3 font-sans text-slate-600 truncate max-w-[200px]">{rec.vendor}</td>
                      <td className="py-2.5 px-3 text-slate-500">{rec.lotNumber}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase ${
                          rec.type === 'direct_restock' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-cyan-100 text-cyan-800'
                        }`}>
                          {rec.type === 'direct_restock' ? 'Warehouse In' : 'Vendor PO'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Filter and Control Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by series, color, or container..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Series Filter */}
            <select
              value={selectedSeries}
              onChange={(e) => setSelectedSeries(e.target.value)}
              className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="all">All Series</option>
              <option value="BIO_SPEED">BIO SPEED (Commercial)</option>
              <option value="BIO_PACK">BIO PACK (Food Packaging)</option>
            </select>

            {/* Color Filter */}
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="all">All CMYK Colors</option>
              <option value="Cyan">Cyan (C)</option>
              <option value="Magenta">Magenta (M)</option>
              <option value="Yellow">Yellow (Y)</option>
              <option value="Black">Black (K)</option>
            </select>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === 'all' ? 'bg-white shadow-2xs text-slate-900 font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({stockInventory.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('low')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === 'low' ? 'bg-white shadow-2xs text-amber-700 font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Low Stock ({lowStockItems.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('out')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === 'out' ? 'bg-white shadow-2xs text-rose-700 font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Out of Stock ({outOfStockItems.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Inventory Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <th className="py-3 px-4">Ink Formulation</th>
                <th className="py-3 px-4">Color / Pigment</th>
                <th className="py-3 px-4">Container Format</th>
                <th className="py-3 px-4 text-center">Available Units</th>
                <th className="py-3 px-4 text-right">Available Weight</th>
                <th className="py-3 px-4 text-center">Min Safety Threshold</th>
                <th className="py-3 px-4 text-center">Stock Status</th>
                <th className="py-3 px-4 text-right">Procurement Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No ink inventory matches the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const container = CONTAINER_OPTIONS.find(c => c.id === item.containerId);
                  const colSpec = INK_COLORS.find(c => c.name === item.color);
                  const series = INK_SERIES[item.seriesId];
                  const totalItemKg = item.availableUnits * (container?.kgPerUnit || 0);

                  const isOut = item.availableUnits === 0;
                  const isLow = !isOut && item.availableUnits <= item.minThresholdUnits;

                  return (
                    <tr 
                      key={item.id} 
                      className={`transition-colors ${
                        isOut
                          ? 'bg-rose-50/50 hover:bg-rose-100/50 border-l-4 border-l-rose-500'
                          : isLow
                          ? 'bg-amber-50/50 hover:bg-amber-100/50 border-l-4 border-l-amber-500'
                          : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">
                          {series ? series.name : item.seriesId}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {series?.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-3.5 h-3.5 rounded-full inline-block shrink-0 shadow-2xs border border-black/10"
                            style={{ backgroundColor: colSpec?.hex }}
                          />
                          <div>
                            <span className="font-semibold text-slate-800">
                              {item.color}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono block">
                              {colSpec?.pigmentCode}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800 block">
                          {container?.label}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {container?.kgPerUnit} kg / container
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono">
                        <span className={`inline-block px-2.5 py-0.5 rounded font-bold text-xs ${
                          isOut 
                            ? 'bg-rose-100 text-rose-800' 
                            : isLow 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-slate-100 text-slate-900'
                        }`}>
                          {item.availableUnits} units
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {totalItemKg.toFixed(1)} kg
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {editingThresholdId === item.id ? (
                          <div className="inline-flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              value={tempThreshold}
                              onChange={(e) => setTempThreshold(parseInt(e.target.value) || 0)}
                              className="w-16 px-1.5 py-0.5 text-xs font-mono text-center border border-slate-300 rounded"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveThreshold(item.id)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                              title="Save Threshold"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingThresholdId(null)}
                              className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingThresholdId(item.id);
                              setTempThreshold(item.minThresholdUnits);
                            }}
                            className="inline-flex items-center gap-1 font-mono text-slate-600 hover:text-slate-900 group"
                            title="Click to edit minimum safety threshold"
                          >
                            <span>{item.minThresholdUnits} units</span>
                            <Edit2 className="w-2.5 h-2.5 text-slate-400 group-hover:text-slate-700 opacity-60" />
                          </button>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            <span>Out of Stock</span>
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>Low Threshold</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Optimal</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenRestockModal(item)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg shadow-2xs transition-all cursor-pointer ${
                            isOut
                              ? 'bg-rose-600 hover:bg-rose-700 text-white'
                              : isLow
                              ? 'bg-amber-600 hover:bg-amber-700 text-white'
                              : 'bg-slate-900 hover:bg-slate-800 text-white'
                          }`}
                          title={`Trigger procurement restock workflow for ${item.seriesId} ${item.color}`}
                        >
                          <Plus className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Restock</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          DEDICATED PROCUREMENT & RESTOCK WORKFLOW MODAL
         ========================================================================= */}
      {restockItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">
                      Procurement &amp; Restock Workflow
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 border border-slate-700">
                      {poNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {INK_SERIES[restockSeriesId]?.name || restockSeriesId} · {restockColor} Process Formulation · {CONTAINER_OPTIONS.find(c => c.id === restockContainerId)?.label}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setRestockItem(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Workflow Mode Switcher Tabs */}
            <div className="px-6 pt-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setProcurementMode('direct_restock')}
                className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  procurementMode === 'direct_restock'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Boxes className="w-3.5 h-3.5 text-cyan-600" />
                <span>1. Quick Warehouse Receipt</span>
              </button>

              <button
                type="button"
                onClick={() => setProcurementMode('purchase_order')}
                className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  procurementMode === 'purchase_order'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-cyan-600" />
                <span>2. Vendor Purchase Order &amp; Requisition</span>
              </button>
            </div>

            <form onSubmit={handleApplyRestock} className="p-6 space-y-4 text-xs">
              {/* Formulation & Pigment Selection Strip */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-600">Series:</span>
                    <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
                      <button
                        type="button"
                        onClick={() => setRestockSeriesId('BIO_SPEED')}
                        className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                          restockSeriesId === 'BIO_SPEED' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        BIO SPEED
                      </button>
                      <button
                        type="button"
                        onClick={() => setRestockSeriesId('BIO_PACK')}
                        className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                          restockSeriesId === 'BIO_PACK' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        BIO PACK
                      </button>
                    </div>
                  </div>

                  {/* CMYK Color Selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-600">Color:</span>
                    <div className="flex items-center gap-1">
                      {INK_COLORS.map(col => {
                        const isColSelected = restockColor === col.name;
                        return (
                          <button
                            key={col.name}
                            type="button"
                            onClick={() => setRestockColor(col.name)}
                            className={`px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                              isColSelected
                                ? 'bg-white border-slate-900 text-slate-900 shadow-2xs ring-1 ring-slate-900'
                                : 'bg-slate-100/70 border-slate-200 text-slate-600 hover:bg-white'
                            }`}
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block border border-black/20"
                              style={{ backgroundColor: col.hex }}
                            />
                            <span>{col.code}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Packaging Format Selector (Spotlighting 2.0 kg & 5.0 kg Boxes) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Packaging Format (Select 2kg / 5kg Boxes or Cans)</span>
                  </label>
                  <span className="text-[10px] text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-md font-semibold border border-cyan-200">
                    Startup Sizing: 2kg &amp; 5kg Boxes
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CONTAINER_OPTIONS.map((opt) => {
                    const isSelected = restockContainerId === opt.id;
                    const isStartupBox = opt.id === 'box_2kg' || opt.id === 'box_5kg';
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setRestockContainerId(opt.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                            : isStartupBox
                            ? 'border-cyan-300 bg-cyan-50/50 hover:bg-cyan-100/60 text-slate-800'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                            {opt.shortLabel}
                          </span>
                          {isStartupBox && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                              isSelected ? 'bg-cyan-400 text-slate-950' : 'bg-cyan-200 text-cyan-900'
                            }`}>
                              Startup Box
                            </span>
                          )}
                        </div>
                        <span className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                          {opt.kgPerUnit} kg/unit
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Context Summary Box */}
              {(() => {
                const targetSku = stockInventory.find(
                  it => it.seriesId === restockSeriesId && it.color === restockColor && it.containerId === restockContainerId
                );
                const currentAvail = targetSku ? targetSku.availableUnits : 0;
                const minThreshold = targetSku ? targetSku.minThresholdUnits : (restockContainerId === 'box_2kg' ? 10 : restockContainerId === 'box_5kg' ? 6 : 8);
                const activeContainer = CONTAINER_OPTIONS.find(c => c.id === restockContainerId) || CONTAINER_OPTIONS[0];
                const totalUnitsAfter = currentAvail + addedUnits;
                const totalKgAfter = totalUnitsAfter * activeContainer.kgPerUnit;

                return (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-600 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Current Warehouse Stock</span>
                        <span className={`font-mono font-bold text-xs ${
                          currentAvail === 0 ? 'text-rose-600' : 'text-slate-900'
                        }`}>
                          {currentAvail} units
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Safety Threshold</span>
                        <span className="font-mono font-bold text-xs text-slate-900">
                          {minThreshold} units
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Deficit / Buffer Gap</span>
                        <span className="font-mono font-bold text-xs text-amber-700">
                          {currentAvail <= minThreshold 
                            ? `-${Math.max(0, minThreshold - currentAvail)} units`
                            : 'Safe (+)'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>Format: {activeContainer.label} ({activeContainer.kgPerUnit} kg/unit)</span>
                      <span>Total after restock: <strong>{totalUnitsAfter} units</strong> ({totalKgAfter.toFixed(1)} kg)</span>
                    </div>
                  </div>
                );
              })()}

              {/* Units Input with Quick Increment Pills */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-900 text-xs">
                    Units to Add / Procure (+ Containers)
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">
                    = {(addedUnits * (CONTAINER_OPTIONS.find(c => c.id === restockContainerId)?.kgPerUnit || 0)).toFixed(1)} kg
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="5000"
                    value={addedUnits}
                    onChange={(e) => setAddedUnits(Math.max(1, parseInt(e.target.value) || 0))}
                    className="flex-1 px-3 py-2 text-sm font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                    required
                  />

                  {/* Increment Shortcuts */}
                  <div className="flex items-center gap-1">
                    {[5, 10, 20, 50].map((inc) => (
                      <button
                        key={inc}
                        type="button"
                        onClick={() => setAddedUnits(prev => prev + inc)}
                        className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-mono font-medium transition-colors cursor-pointer"
                      >
                        +{inc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Workflow Channel 1: Direct Warehouse Restock Fields */}
              {procurementMode === 'direct_restock' && (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Batch / Milling Lot #
                      </label>
                      <input
                        type="text"
                        value={restockBatchLot}
                        onChange={(e) => setRestockBatchLot(e.target.value)}
                        placeholder="e.g. LOT-BS-2610-8812"
                        className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Receiving Storage Bay
                      </label>
                      <select
                        value={restockBay}
                        onChange={(e) => setRestockBay(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                      >
                        {WAREHOUSE_BAYS.map((bay) => (
                          <option key={bay} value={bay}>{bay}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Warehouse Log Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={restockNote}
                      onChange={(e) => setRestockNote(e.target.value)}
                      placeholder="e.g. Verified packaging seal and lot viscosity upon receipt"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>
              )}

              {/* Workflow Channel 2: Purchase Order Requisition Fields */}
              {procurementMode === 'purchase_order' && (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Select Approved Procurement Supplier / Mill Line
                    </label>
                    <select
                      value={selectedSupplierId}
                      onChange={(e) => setSelectedSupplierId(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
                    >
                      {PROCUREMENT_SUPPLIERS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.leadTime})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Procurement Urgency / Lead Time
                      </label>
                      <select
                        value={procurementPriority}
                        onChange={(e) => setProcurementPriority(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                      >
                        <option value="Emergency Rush (24h Delivery)">Emergency Rush (24h Delivery)</option>
                        <option value="Standard Fulfillment (48h)">Standard Fulfillment (48h)</option>
                        <option value="Scheduled Reorder (5 Days)">Scheduled Reorder (5 Days)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Estimated Purchase Order Cost
                      </label>
                      <div className="px-3 py-2 bg-slate-100 rounded-lg text-xs font-mono font-bold text-slate-900">
                        ₹{(
                          addedUnits * 
                          (CONTAINER_OPTIONS.find(c => c.id === restockContainerId)?.kgPerUnit || 0) * 
                          (restockSeriesId === 'BIO_SPEED' ? pricingConfig.bioSpeed[restockColor] : pricingConfig.bioPack[restockColor]) * 
                          0.72
                        ).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Purchase Order Requisition Notes
                    </label>
                    <input
                      type="text"
                      value={restockNote}
                      onChange={(e) => setRestockNote(e.target.value)}
                      placeholder="e.g. ISO 12647-2 Spectro Certificate copy required with consignment"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRestockItem(null)}
                    className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  {procurementMode === 'purchase_order' && (
                    <button
                      type="button"
                      onClick={handleCopyPoSlip}
                      className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      title="Copy formatted purchase order requisition text"
                    >
                      {poCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied Slip!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Copy PO Slip</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs inline-flex items-center gap-2 cursor-pointer hover:scale-[1.01]"
                >
                  <Plus className="w-4 h-4 text-cyan-400" />
                  <span>
                    {procurementMode === 'direct_restock' 
                      ? `Confirm Warehouse Stock (+${addedUnits} Units)` 
                      : `Issue PO & Record Stock (+${addedUnits} Units)`}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          BULK PROCUREMENT WORKFLOW MODAL
         ========================================================================= */}
      {isBulkProcurementOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    Bulk Procurement Order (All Safety Threshold Breaches)
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Master Purchase Order: {bulkPoNumber}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsBulkProcurementOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyBulkRestock} className="p-6 space-y-4 text-xs">
              <p className="text-slate-600 text-xs">
                Review suggested replenishment quantities for all {thresholdReachedItems.length} SKUs that have breached minimum safety thresholds. Adjust quantities as needed or execute the master replenishment.
              </p>

              <div className="max-h-80 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                {thresholdReachedItems.map((item) => {
                  const container = CONTAINER_OPTIONS.find(c => c.id === item.containerId);
                  const colSpec = INK_COLORS.find(c => c.name === item.color);
                  const currentQty = bulkQtys[item.id] || 0;
                  const itemTotalKg = currentQty * (container?.kgPerUnit || 0);

                  return (
                    <div key={`bulk_${item.id}`} className="p-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/70">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span 
                          className="w-3.5 h-3.5 rounded-full inline-block shrink-0 shadow-2xs border border-black/15"
                          style={{ backgroundColor: colSpec?.hex }}
                        />
                        <div className="truncate">
                          <p className="font-bold text-slate-900 truncate">
                            {item.color} · {item.seriesId}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {container?.label} (Stock: <strong>{item.availableUnits}</strong> / Min: <strong>{item.minThresholdUnits}</strong>)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-mono block">Weight</span>
                          <span className="font-mono font-bold text-slate-900 text-xs">{itemTotalKg.toFixed(1)} kg</span>
                        </div>

                        <div className="w-24">
                          <input
                            type="number"
                            min="0"
                            max="5000"
                            value={currentQty}
                            onChange={(e) => {
                              const val = Math.max(0, parseInt(e.target.value) || 0);
                              setBulkQtys(prev => ({ ...prev, [item.id]: val }));
                            }}
                            className="w-full px-2.5 py-1.5 text-xs font-mono font-bold text-center bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bulk Total Summary Strip */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Consolidated Reorder Volume:</span>
                  <p className="font-bold font-mono text-slate-900 text-sm">
                    {Object.values(bulkQtys).reduce((a, b) => a + b, 0)} Units (
                    {thresholdReachedItems.reduce((sum, it) => {
                      const c = CONTAINER_OPTIONS.find(con => con.id === it.containerId);
                      return sum + (bulkQtys[it.id] || 0) * (c?.kgPerUnit || 0);
                    }, 0).toFixed(1)} kg total)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBulkProcurementOpen(false)}
                    className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs inline-flex items-center gap-2 cursor-pointer hover:scale-[1.01]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>Approve &amp; Execute Master Restock</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
