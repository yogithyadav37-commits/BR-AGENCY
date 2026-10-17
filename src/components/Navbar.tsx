import React from 'react';
import { 
  Plus, 
  SlidersHorizontal, 
  Droplets, 
  Tag, 
  LogOut, 
  Boxes, 
  Send, 
  Lock, 
  ShieldCheck, 
  AlertTriangle,
  TrendingUp,
  Receipt,
  User,
  Phone,
  Package
} from 'lucide-react';
import { UserRole, CustomerProfile } from '../types/ink';

interface NavbarProps {
  activeTab: 'order' | 'request_stock' | 'tracking' | 'invoices' | 'tds' | 'stock' | 'operations' | 'monthly_sales' | 'customer_portal';
  onSelectTab: (tab: 'order' | 'request_stock' | 'tracking' | 'invoices' | 'tds' | 'stock' | 'operations' | 'monthly_sales' | 'customer_portal') => void;
  onOpenNewOrder: () => void;
  onOpenPriceSettings: () => void;
  activeOrderCount: number;
  unpaidInvoiceCount: number;
  userRole: UserRole;
  onOpenOwnerAuth: () => void;
  onSwitchToCustomer: () => void;
  pendingRequestsCount?: number;
  lowStockCount?: number;
  activeCustomer?: CustomerProfile | null;
  onOpenCustomerAuth: () => void;
  onSignOutCustomer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenNewOrder,
  onOpenPriceSettings,
  activeOrderCount,
  unpaidInvoiceCount,
  userRole,
  onOpenOwnerAuth,
  onSwitchToCustomer,
  pendingRequestsCount = 0,
  lowStockCount = 0,
  activeCustomer = null,
  onOpenCustomerAuth,
  onSignOutCustomer,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 lg:gap-8 h-16">
          {/* Zone 1: Brand wordmark & Portal Mode Badge */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => onSelectTab('order')} 
              className="flex items-center gap-2.5 cursor-pointer select-none whitespace-nowrap shrink-0 group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xs group-hover:bg-slate-800 transition-colors">
                <span className="font-black text-cyan-400 text-xs tracking-tighter">BR</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black tracking-tight text-slate-900">
                  BR AGENCY
                </span>
                <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  Company Inks
                </span>
              </div>
            </div>

            {/* Mode Indicator pill */}
            <div className="hidden xl:flex items-center">
              {userRole === 'owner' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  <ShieldCheck className="w-3 h-3 text-amber-700" />
                  <span>Owner Mode Active</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  <span>Company Ordering View</span>
                </span>
              )}
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-6 text-sm font-medium text-slate-600">
            {/* 1. Order Inks */}
            <button
              onClick={() => onSelectTab('order')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
                activeTab === 'order'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent'
              }`}
            >
              Order Inks
            </button>

            {/* Customer Orders & Invoices Portal */}
            <button
              onClick={() => {
                if (activeCustomer) {
                  onSelectTab('customer_portal');
                } else {
                  onOpenCustomerAuth();
                }
              }}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 flex items-center gap-1.5 ${
                activeTab === 'customer_portal'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent'
              }`}
              title="Company Self-Service: My Orders, GST Invoices & Delivery Facilities"
            >
              <Package className="w-3.5 h-3.5 text-cyan-600" />
              <span>{activeCustomer ? 'My Orders & Invoices' : 'Company Portal'}</span>
            </button>

            {/* 2. Request Stock (Customer + Owner) */}
            <button
              onClick={() => onSelectTab('request_stock')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 flex items-center gap-1.5 ${
                activeTab === 'request_stock'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent'
              }`}
            >
              <Send className="w-3.5 h-3.5 text-cyan-600" />
              <span>Request Stock</span>
              {pendingRequestsCount > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-cyan-100 text-cyan-800 font-bold">
                  {pendingRequestsCount}
                </span>
              )}
            </button>

            {/* 3. Owner-Only Tab: Stock Available & Warehouse Inventory */}
            {userRole === 'owner' && (
              <button
                onClick={() => onSelectTab('stock')}
                className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'stock'
                    ? 'border-slate-900 text-slate-900 font-semibold'
                    : 'border-transparent'
                }`}
                title="Owner-only warehouse inventory management"
              >
                <Boxes className="w-3.5 h-3.5 text-amber-600" />
                <span>Stock Inventory</span>
                {lowStockCount > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold">
                    {lowStockCount} low
                  </span>
                )}
              </button>
            )}

            {/* 4. Live Tracking */}
            <button
              onClick={() => onSelectTab('tracking')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 flex items-center gap-1.5 ${
                activeTab === 'tracking'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent'
              }`}
            >
              <span>Live Tracking</span>
              {activeOrderCount > 0 && (
                <span className="text-xs font-mono font-medium text-slate-500 tabular-nums">
                  ({activeOrderCount})
                </span>
              )}
            </button>

            {/* 5. Owner-Only Tab: Monthly Sales & Financial Reports */}
            {userRole === 'owner' && (
              <button
                onClick={() => onSelectTab('monthly_sales')}
                className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'monthly_sales'
                    ? 'border-slate-900 text-slate-900 font-semibold'
                    : 'border-transparent'
                }`}
                title="Owner-only monthly revenue, volume trends, and financial reports"
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>Monthly Sales</span>
              </button>
            )}

            {/* 6. Owner-Only Tab: Invoices Hub (Hidden from Customers) */}
            {userRole === 'owner' && (
              <button
                onClick={() => onSelectTab('invoices')}
                className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'invoices'
                    ? 'border-slate-900 text-slate-900 font-semibold'
                    : 'border-transparent'
                }`}
                title="Owner: Tax invoices and payment recording"
              >
                <Receipt className="w-3.5 h-3.5 text-slate-500" />
                <span>Invoices</span>
                {unpaidInvoiceCount > 0 && (
                  <span className="text-xs font-mono font-medium text-amber-600 tabular-nums">
                    ({unpaidInvoiceCount})
                  </span>
                )}
              </button>
            )}

            {/* 6. TDS */}
            <button
              onClick={() => onSelectTab('tds')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
                activeTab === 'tds'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent'
              }`}
            >
              TDS Specs
            </button>

            {/* 7. Owner-Only Tab: Batch Operations */}
            {userRole === 'owner' && (
              <button
                onClick={() => onSelectTab('operations')}
                className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'operations'
                    ? 'border-slate-900 text-slate-900 font-semibold'
                    : 'border-transparent'
                }`}
                title="Plant floor dispatch & queue controller"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <span>Batch Operations</span>
              </button>
            )}
          </nav>

          {/* Zone 3: Actions - Customer Profile, Role Switcher, Pricing & New Order */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Customer Account Button */}
            {activeCustomer ? (
              <div className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200/70 border border-slate-300/80 rounded-lg p-0.5 transition-colors">
                <button
                  type="button"
                  onClick={() => onSelectTab('customer_portal')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-slate-800 hover:text-cyan-700 transition-colors cursor-pointer max-w-[150px] truncate"
                  title={`Signed in as ${activeCustomer.companyName} (${activeCustomer.phone}). Click to view orders & invoices.`}
                >
                  <div className="w-5 h-5 rounded-md bg-slate-900 text-cyan-400 flex items-center justify-center text-[10px] font-black shrink-0">
                    {activeCustomer.companyName.charAt(0)}
                  </div>
                  <span className="truncate">{activeCustomer.companyName.split(' ')[0]}</span>
                </button>
                <button
                  type="button"
                  onClick={onSignOutCustomer}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                  title="Sign out of company account"
                  aria-label="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenCustomerAuth}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-2xs cursor-pointer"
                title="Sign in with mobile OTP to access company orders and tax invoices"
              >
                <Phone className="w-3.5 h-3.5 text-cyan-600" />
                <span>Company Sign In</span>
              </button>
            )}

            {/* Role Switcher Button */}
            {userRole === 'customer' ? (
              <button
                type="button"
                onClick={onOpenOwnerAuth}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold tracking-wide text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-2xs"
                title="Unlock Owner & Plant Manager controls (Stock, Pricing, Statuses)"
              >
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Owner Portal</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onSwitchToCustomer}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold tracking-wide text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-2xs"
                title="Lock owner controls and preview as Customer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">Switch to Customer View</span>
              </button>
            )}

            {/* Exit Page icon button when on any secondary page */}
            {activeTab !== 'order' && (
              <button
                type="button"
                onClick={() => onSelectTab('order')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold tracking-wide text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors whitespace-nowrap shrink-0 group cursor-pointer shadow-2xs"
                title={`Exit ${activeTab.toUpperCase()} page and return to main order view`}
                aria-label="Exit current page"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600 group-hover:scale-110 transition-transform" />
                <span className="hidden md:inline">Exit</span>
              </button>
            )}

            {/* Pricing Button (Owner Only) */}
            {userRole === 'owner' && (
              <button
                onClick={onOpenPriceSettings}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold tracking-wide text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
                title="Owner: Configure per-kg ink prices in INR (₹), volume discount tiers, and GST"
              >
                <Tag className="w-3.5 h-3.5 text-cyan-600" />
                <span className="hidden sm:inline">₹ Set Prices</span>
              </button>
            )}

            {/* New Ink Order button */}
            <button
              onClick={onOpenNewOrder}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              <span>New Order</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
