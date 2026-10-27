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
  Package,
  Sun,
  Moon,
  MapPin,
  Sparkles
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
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  firebaseUser?: any;
  onSignInWithGoogle?: () => void;
  onSignOutGoogle?: () => void;
  onOpenMapsLocator?: () => void;
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
  theme = 'dark',
  onToggleTheme,
  firebaseUser = null,
  onSignInWithGoogle,
  onSignOutGoogle,
  onOpenMapsLocator,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 lg:gap-8 h-16">
          {/* Zone 1: Brand wordmark with physical CMYK indicator */}
          <div 
            onClick={() => onSelectTab('order')} 
            className="flex items-center gap-2.5 cursor-pointer select-none whitespace-nowrap shrink-0 group"
          >
            <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-slate-800 transition-colors">
              BR AGENCY
            </span>
            <div className="flex items-center gap-1" title="CMYK Process Inks (ISO 2846-1 / 12647-2)">
              <span className="w-1.5 h-3 rounded-xs bg-[#0099FF]" />
              <span className="w-1.5 h-3 rounded-xs bg-[#E6007A]" />
              <span className="w-1.5 h-3 rounded-xs bg-[#FFD700]" />
              <span className="w-1.5 h-3 rounded-xs bg-[#111827]" />
            </div>
            <span className="hidden lg:inline text-xs font-semibold text-slate-400 tracking-wider uppercase ml-1">
              · Inks
            </span>
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
                <span className="text-[11px] font-mono text-cyan-700 font-semibold tabular-nums">
                  ({pendingRequestsCount})
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
                  <span className="text-[11px] font-mono text-amber-700 font-semibold tabular-nums">
                    ({lowStockCount} low)
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

            {/* Google Sign-in with Firebase Auth */}
            {firebaseUser ? (
              <div className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200/70 border border-slate-300/80 rounded-lg p-0.5 transition-colors">
                <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-slate-800">
                  {firebaseUser.photoURL ? (
                    <img src={firebaseUser.photoURL} alt="Google avatar" className="w-5 h-5 rounded-full" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-cyan-700 text-white flex items-center justify-center text-[10px] font-bold">
                      {firebaseUser.displayName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span className="hidden xl:inline text-xs truncate max-w-[100px]">{firebaseUser.displayName?.split(' ')[0] || 'User'}</span>
                </div>
                {onSignOutGoogle && (
                  <button
                    type="button"
                    onClick={onSignOutGoogle}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                    title="Sign out of Firebase Google account"
                    aria-label="Sign out of Google"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              onSignInWithGoogle && (
                <button
                  type="button"
                  onClick={onSignInWithGoogle}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-2xs cursor-pointer"
                  title="Sign in with Google via Firebase Auth for persistent cloud data"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span className="hidden sm:inline">Google Sign In</span>
                </button>
              )
            )}

            {/* Maps Facility Locator Button */}
            {onOpenMapsLocator && (
              <button
                type="button"
                onClick={onOpenMapsLocator}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-2xs cursor-pointer"
                title="Live Google Maps search for verified commercial printing presses & packaging facilities"
              >
                <MapPin className="w-3.5 h-3.5 text-cyan-600" />
                <span className="hidden lg:inline">Maps Locator</span>
              </button>
            )}

            {/* Invert Theme Toggle Button */}
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className="inline-flex items-center justify-center p-2 rounded-lg border border-slate-300 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors shadow-2xs cursor-pointer"
                title={theme === 'dark' ? 'Invert to Light Theme' : 'Invert to Dark Theme'}
                aria-label="Invert Theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-slate-600" />
                )}
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
