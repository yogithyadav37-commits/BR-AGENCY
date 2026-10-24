/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { OrderIntakeForm } from './components/OrderIntakeForm';
import { TrackingView } from './components/TrackingView';
import { InvoiceView } from './components/InvoiceView';
import { InkSeriesTds } from './components/InkSeriesTds';
import { SupplierDashboard } from './components/SupplierDashboard';
import { StockInventoryView } from './components/StockInventoryView';
import { RequestStockView } from './components/RequestStockView';
import { OwnerAuthModal } from './components/OwnerAuthModal';
import { PriceSettingsModal } from './components/PriceSettingsModal';
import { MonthlySalesView } from './components/MonthlySalesView';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { CustomerPortalView } from './components/CustomerPortalView';
import { Phone } from 'lucide-react';
import { 
  INITIAL_ORDERS, 
  INITIAL_INVOICES, 
  DEFAULT_PRICING_CONFIG,
  INITIAL_STOCK_INVENTORY,
  INITIAL_STOCK_REQUESTS
} from './data/mockData';
import { 
  Order, 
  Invoice, 
  OrderStatus, 
  InvoicePaymentRecord, 
  InkSeriesId, 
  InkColorCode,
  PricingConfig,
  StockItem,
  StockRequest,
  UserRole,
  DeliveryRoutingDetails,
  OrderFeedback,
  CustomerProfile,
  OrderItem
} from './types/ink';

export default function App() {
  // Navigation Tab
  const [activeTab, setActiveTab] = useState<
    'order' | 'request_stock' | 'tracking' | 'invoices' | 'tds' | 'stock' | 'operations' | 'monthly_sales' | 'customer_portal'
  >('order');

  // Role Control (Default: customer, so clients see the clean ordering experience)
  const [userRole, setUserRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem('bragency_user_role');
      if (saved === 'owner' || saved === 'customer') return saved;
    } catch (e) {
      console.error(e);
    }
    return 'customer';
  });

  // Owner Access Security PIN (Default: 1234)
  const [ownerPin, setOwnerPin] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('bragency_owner_pin');
      if (saved) return saved;
    } catch (e) {
      console.error(e);
    }
    return '1234';
  });

  // Owner PIN Auth Modal State
  const [isOwnerAuthOpen, setIsOwnerAuthOpen] = useState(false);

  // Price Settings Modal State
  const [isPriceSettingsOpen, setIsPriceSettingsOpen] = useState(false);

  // Customer Auth & Persistent Device Session (Starts clean with 0 demo accounts)
  const [customers, setCustomers] = useState<CustomerProfile[]>(() => {
    try {
      const saved = localStorage.getItem('bragency_registered_customers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out any legacy demo accounts
          return parsed.filter(c => c.id !== 'CUST-001' && c.id !== 'CUST-002');
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [activeCustomer, setActiveCustomer] = useState<CustomerProfile | null>(() => {
    try {
      const saved = localStorage.getItem('bragency_customer_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.id === 'CUST-001' || parsed?.id === 'CUST-002') {
          localStorage.removeItem('bragency_customer_session');
          return null;
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const [isCustomerAuthOpen, setIsCustomerAuthOpen] = useState(false);
  const [preloadedReorder, setPreloadedReorder] = useState<{ seriesId: InkSeriesId; items: OrderItem[] } | null>(null);

  // Persistence: Pricing Configuration (BR Agency Rate Card in INR)
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>(() => {
    try {
      const saved = localStorage.getItem('bragency_pricing_inr');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.currencySymbol === '₹') return parsed;
      }
    } catch (e) {
      console.error('Failed to load pricing config', e);
    }
    return DEFAULT_PRICING_CONFIG;
  });

  // Persistence: Stock Inventory (Startup profile: min 2kg & 5kg boxes supported, 1kg tins & 200kg drums purged)
  const [stockInventory, setStockInventory] = useState<StockItem[]>(() => {
    try {
      const saved = localStorage.getItem('bragency_stock_inventory');
      if (saved) {
        let parsed: StockItem[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Remove 200kg drums and 1kg tins (minimum packaging size is 2kg)
          parsed = parsed.filter(it => it.containerId !== 'drum_200kg' && it.containerId !== 'tin_1kg');
          // Ensure 2kg and 5kg boxes exist in inventory
          const missingBoxes = INITIAL_STOCK_INVENTORY.filter(
            initItem => (initItem.containerId === 'box_2kg' || initItem.containerId === 'box_5kg') &&
              !parsed.some(p => p.id === initItem.id)
          );
          if (missingBoxes.length > 0) {
            parsed = [...parsed, ...missingBoxes];
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load stock inventory', e);
    }
    return INITIAL_STOCK_INVENTORY;
  });

  // Persistence: Stock Requests
  const [stockRequests, setStockRequests] = useState<StockRequest[]>(() => {
    try {
      const saved = localStorage.getItem('bragency_stock_requests');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load stock requests', e);
    }
    return INITIAL_STOCK_REQUESTS;
  });

  // Persistence: Orders (Starts clean with 0 orders, purging legacy mock data)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('bragency_orders_inr');
      if (saved) {
        const parsed = JSON.parse(saved);
        // If legacy dummy mock orders are found, clear them as requested
        if (Array.isArray(parsed) && parsed.some((o: any) => o.id === 'ord_1' || o.id === 'ord_2' || o.id === 'ord_3')) {
          localStorage.removeItem('bragency_orders_inr');
          return [];
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load orders from storage', e);
    }
    return INITIAL_ORDERS;
  });

  // Persistence: Invoices (Starts clean with 0 invoices)
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const saved = localStorage.getItem('bragency_invoices_inr');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some((inv: any) => inv.id === 'INV-2026-1048' || inv.id === 'INV-2026-1049')) {
          localStorage.removeItem('bragency_invoices_inr');
          return [];
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load invoices from storage', e);
    }
    return INITIAL_INVOICES;
  });

  // Selected identifiers for detail modal / focused views
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bragency_user_role', userRole);
    } catch (e) {
      console.error(e);
    }
  }, [userRole]);

  useEffect(() => {
    try {
      localStorage.setItem('bragency_owner_pin', ownerPin);
    } catch (e) {
      console.error(e);
    }
  }, [ownerPin]);

  useEffect(() => {
    try {
      localStorage.setItem('bragency_pricing_inr', JSON.stringify(pricingConfig));
    } catch (e) {
      console.error('Failed to save pricing config', e);
    }
  }, [pricingConfig]);

  useEffect(() => {
    try {
      localStorage.setItem('bragency_stock_inventory', JSON.stringify(stockInventory));
    } catch (e) {
      console.error('Failed to save stock inventory', e);
    }
  }, [stockInventory]);

  useEffect(() => {
    try {
      localStorage.setItem('bragency_stock_requests', JSON.stringify(stockRequests));
    } catch (e) {
      console.error('Failed to save stock requests', e);
    }
  }, [stockRequests]);

  useEffect(() => {
    try {
      localStorage.setItem('bragency_orders_inr', JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save orders', e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('bragency_invoices_inr', JSON.stringify(invoices));
    } catch (e) {
      console.error('Failed to save invoices', e);
    }
  }, [invoices]);

  // Sync Customer Session & Registered Press Directory
  useEffect(() => {
    try {
      if (activeCustomer) {
        localStorage.setItem('bragency_customer_session', JSON.stringify(activeCustomer));
      } else {
        localStorage.removeItem('bragency_customer_session');
      }
    } catch (e) {
      console.error('Failed to sync customer session', e);
    }
  }, [activeCustomer]);

  useEffect(() => {
    try {
      localStorage.setItem('bragency_registered_customers', JSON.stringify(customers));
    } catch (e) {
      console.error('Failed to sync customers list', e);
    }
  }, [customers]);

  // Customer Auth Handlers
  const handleLoginCustomer = (customer: CustomerProfile) => {
    setActiveCustomer(customer);
    setActiveTab('customer_portal');
  };

  const handleSignOutCustomer = () => {
    setActiveCustomer(null);
    if (activeTab === 'customer_portal') {
      setActiveTab('order');
    }
  };

  const handleRegisterCustomer = (newCustomer: CustomerProfile) => {
    setCustomers(prev => {
      const exists = prev.some(c => c.id === newCustomer.id);
      return exists ? prev : [newCustomer, ...prev];
    });
  };

  const handleReorderItems = (items: OrderItem[], seriesId?: string) => {
    setPreloadedReorder({
      seriesId: (seriesId as InkSeriesId) || 'BIO_SPEED',
      items
    });
    setActiveTab('order');
  };

  // Handler: Save Pricing Configuration (Owner only)
  const handleSavePricing = (newPricing: PricingConfig) => {
    setPricingConfig(newPricing);
  };

  // Handler: Order Placement & Inventory Deduction
  const handleOrderSubmitted = (newOrder: Order, newInvoice: Invoice) => {
    setOrders(prev => [newOrder, ...prev]);
    setInvoices(prev => [newInvoice, ...prev]);
    setSelectedOrderId(newOrder.id);

    // Deduct ordered items from live warehouse stock
    setStockInventory(prevStock => {
      return prevStock.map(stock => {
        const matchingItem = newOrder.items.find(
          it => it.seriesId === stock.seriesId && it.color === stock.color && it.containerId === stock.containerId
        );
        if (matchingItem) {
          return {
            ...stock,
            availableUnits: Math.max(0, stock.availableUnits - matchingItem.containersCount),
            lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16)
          };
        }
        return stock;
      });
    });
  };

  // Handler: Stock Requests
  const handleSubmitStockRequest = (newRequest: StockRequest) => {
    setStockRequests(prev => [newRequest, ...prev]);
  };

  const handleUpdateStockRequestStatus = (
    requestId: string, 
    status: StockRequest['status'], 
    ownerResponse?: string
  ) => {
    setStockRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status,
          ...(ownerResponse !== undefined ? { ownerResponse } : {})
        };
      }
      return r;
    }));
  };

  // Handler: Real-time Status Update (Owner only)
  const handleUpdateOrderStatus = (orderId: string, nextStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;

      const updatedMilestones = o.tracking.milestones.map(m => {
        if (m.status === nextStatus) {
          return {
            ...m,
            completed: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today'
          };
        }
        return m;
      });

      let updatedLocation = o.tracking.currentLocation;
      if (nextStatus === 'formulation') {
        updatedLocation = '3-Roll Milling Room (Batch Homogenization)';
      } else if (nextStatus === 'qc_passed') {
        updatedLocation = 'Quality Analytical Lab (Tack & Viscosity Certified)';
      } else if (nextStatus === 'packed') {
        updatedLocation = 'Palletized at Loading Dock Bay 2';
      } else if (nextStatus === 'dispatched') {
        updatedLocation = 'En Route with Dedicated Freight Truck (' + o.tracking.vehicleNumber + ')';
      } else if (nextStatus === 'delivered') {
        updatedLocation = 'Delivered & Inspected at ' + o.customer.companyName;
      }

      return {
        ...o,
        status: nextStatus,
        tracking: {
          ...o.tracking,
          currentLocation: updatedLocation,
          milestones: updatedMilestones
        }
      };
    }));
  };

  // Handler: Record Payment on Invoice
  const handleRecordPayment = (invoiceId: string, payment: InvoicePaymentRecord) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== invoiceId) return inv;

      const newPaidAmount = inv.paidAmount + payment.amount;
      const isFullyPaid = newPaidAmount >= inv.totalAmount - 0.01;

      return {
        ...inv,
        paidAmount: newPaidAmount,
        status: isFullyPaid ? 'paid' : 'partial',
        payments: [...(inv.payments || []), payment]
      };
    }));

    const targetInvoice = invoices.find(inv => inv.id === invoiceId);
    if (targetInvoice) {
      setOrders(prev => prev.map(o => {
        if (o.id === targetInvoice.orderId) {
          return {
            ...o,
            paymentStatus: 'paid',
            paidAt: payment.date,
            paymentMethod: payment.method
          };
        }
        return o;
      }));
    }
  };

  // Handler: Customer & Owner Delivery Routing to external apps or fleet
  const handleUpdateRouting = (orderId: string, updatedRouting: DeliveryRoutingDetails) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const isExternal = updatedRouting.method === 'external_app';
      const isPickup = updatedRouting.method === 'customer_pickup';
      const carrierName = updatedRouting.providerName;

      return {
        ...o,
        deliveryRouting: updatedRouting,
        tracking: {
          ...o.tracking,
          carrier: carrierName,
          trackingNumber: updatedRouting.externalBookingRef || o.tracking.trackingNumber,
          driverName: updatedRouting.driverName || (isExternal ? 'App Delivery Partner' : o.tracking.driverName),
          driverPhone: updatedRouting.driverPhone || (isExternal ? 'Via ' + carrierName : o.tracking.driverPhone),
          vehicleNumber: updatedRouting.vehicleNumber || (isExternal ? 'Dispatched via App Partner' : o.tracking.vehicleNumber),
          currentLocation: isExternal
            ? `Staged at Naraina Bay 2 (Routed via ${carrierName})`
            : isPickup
            ? `Awaiting Customer Vehicle Pickup at Naraina Bay 2`
            : o.tracking.currentLocation
        }
      };
    }));
  };

  // Handler: Customer Review / Feedback Submission on Delivered Orders
  const handleSubmitFeedback = (orderId: string, feedback: OrderFeedback) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      return {
        ...o,
        feedback
      };
    }));
  };

  // Handler: Fast-track mark order as delivered for testing reviews
  const handleDeliverOrder = (orderId: string) => {
    handleUpdateOrderStatus(orderId, 'delivered');
  };

  const handleNavigateToTracking = (orderId: string) => {
    setSelectedOrderId(orderId);
    setActiveTab('tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewInvoice = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setActiveTab('invoices');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickOrderFromTds = (seriesId: InkSeriesId) => {
    setActiveTab('order');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToRequestStock = (seriesId?: InkSeriesId, color?: InkColorCode) => {
    setActiveTab('request_stock');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Switch to Customer mode safely
  const handleSwitchToCustomer = () => {
    setUserRole('customer');
    if (activeTab === 'stock' || activeTab === 'operations' || activeTab === 'invoices' || activeTab === 'monthly_sales') {
      setActiveTab('order');
    }
  };

  // Handler: Remove all orders and invoices (Fresh slate)
  const handleClearAllOrders = () => {
    setOrders([]);
    setInvoices([]);
    setSelectedOrderId(null);
    setSelectedInvoiceId(null);
    try {
      localStorage.removeItem('bragency_orders_inr');
      localStorage.removeItem('bragency_invoices_inr');
    } catch (e) {
      console.error(e);
    }
  };

  // Handler: Simulate a sample order for analytics demonstration
  const handleAddSampleOrder = () => {
    const cust: CustomerProfile = activeCustomer || (customers.length > 0 ? customers[0] : {
      id: 'cust_direct_company',
      companyName: 'General Commercial Graphics Pvt. Ltd.',
      contactPerson: 'Operations Director',
      email: 'operations@graphics.in',
      phone: '+91 98100 12345',
      address: 'Plot 12, Industrial Area',
      city: 'New Delhi',
      state: 'Delhi',
      postalCode: '110020',
      gstNumber: '07AABCG1234F1Z5',
      pressModel: 'Offset Equipment',
      paymentTerms: 'Net 30'
    });
    const orderNum = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const invNum = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrdId = `ord_${Date.now()}`;
    const newItems = [
      {
        seriesId: 'BIO_SPEED' as const,
        color: 'Cyan' as const,
        containerId: 'can_2_5kg' as const,
        containerLabel: '2.5 kg Can',
        containersCount: 8,
        kgPerUnit: 2.5,
        totalKg: 20,
        unitPricePerKg: 420.00,
        totalPrice: 8400.00
      },
      {
        seriesId: 'BIO_SPEED' as const,
        color: 'Magenta' as const,
        containerId: 'can_2_5kg' as const,
        containerLabel: '2.5 kg Can',
        containersCount: 8,
        kgPerUnit: 2.5,
        totalKg: 20,
        unitPricePerKg: 460.00,
        totalPrice: 9200.00
      },
      {
        seriesId: 'BIO_SPEED' as const,
        color: 'Yellow' as const,
        containerId: 'can_2_5kg' as const,
        containerLabel: '2.5 kg Can',
        containersCount: 8,
        kgPerUnit: 2.5,
        totalKg: 20,
        unitPricePerKg: 440.00,
        totalPrice: 8800.00
      },
      {
        seriesId: 'BIO_SPEED' as const,
        color: 'Black' as const,
        containerId: 'can_2_5kg' as const,
        containerLabel: '2.5 kg Can',
        containersCount: 16,
        kgPerUnit: 2.5,
        totalKg: 40,
        unitPricePerKg: 320.00,
        totalPrice: 12800.00
      }
    ];

    const subtotal = 39200.00;
    const discountAmount = 0;
    const taxAmount = subtotal * 0.18;
    const shippingFee = 650.00;
    const totalAmount = subtotal + taxAmount + shippingFee;

    const sampleOrder: Order = {
      id: newOrdId,
      orderNumber: orderNum,
      createdAt: new Date().toISOString(),
      customer: cust,
      deliveryAddress: cust.deliveryAddress,
      items: newItems,
      subtotal,
      discountPct: 0,
      discountAmount,
      taxPct: 18,
      taxAmount,
      shippingFee,
      totalAmount,
      totalKg: 100,
      priority: 'Standard (48h)',
      pressJobRef: `JOB-${cust.companyName.substring(0, 3).toUpperCase()}-TEST-01`,
      notes: 'Sample test order generated for monthly sales demonstration',
      status: 'received',
      tracking: {
        carrier: 'BR Dedicated Express',
        trackingNumber: `BRL-${Math.floor(100000 + Math.random() * 900000)}`,
        vehicleNumber: 'DL-01-EXP-8812',
        driverName: 'Manpreet Singh',
        driverPhone: '+91 98101 22903',
        currentLocation: 'BR Agency Central Dispatch Bay',
        estimatedArrival: 'Tomorrow at 02:00 PM',
        batchNumber: `BS-2610-${Math.floor(10 + Math.random() * 90)}A`,
        qcCertificateId: `QC-CERT-${Math.floor(1000 + Math.random() * 9000)}`,
        qcPassedDate: new Date().toISOString(),
        qcInspectedBy: 'Dr. A. K. Verma',
        testedTack: '11.8',
        testedFineness: '1.2 µm',
        milestones: [
          {
            status: 'received',
            title: 'Order Confirmed',
            description: 'Sample order entered into system.',
            timestamp: 'Just now',
            location: 'Order Desk',
            completed: true
          }
        ]
      },
      invoiceId: invNum,
      paymentStatus: 'paid',
      paidAt: new Date().toISOString(),
      paymentMethod: 'Bank Wire / RTGS'
    };

    const sampleInvoice: Invoice = {
      id: invNum,
      invoiceNumber: invNum,
      orderId: newOrdId,
      orderNumber: orderNum,
      issueDate: new Date().toISOString().substring(0, 10),
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10),
      customer: cust,
      deliveryAddress: cust.deliveryAddress,
      items: newItems,
      subtotal,
      discountAmount,
      taxRate: 18,
      taxAmount,
      shippingFee,
      totalAmount,
      paidAmount: totalAmount,
      status: 'paid',
      paymentTerms: 'Net 30 Days',
      bankDetails: {
        bankName: 'HDFC Bank Ltd.',
        accountName: 'BR Agency Ink Supplies',
        accountNumber: '5020-0048-9921-34',
        ifscOrSwift: 'HDFC0001048',
        branch: 'Naraina Industrial Area Branch, New Delhi'
      },
      payments: [
        {
          id: `pmt_${Date.now()}`,
          date: new Date().toISOString().substring(0, 10),
          amount: totalAmount,
          method: 'Bank Wire / RTGS',
          referenceNumber: `RTGS-${Math.floor(100000 + Math.random() * 900000)}`,
          note: 'Immediate payment'
        }
      ]
    };

    handleOrderSubmitted(sampleOrder, sampleInvoice);
  };

  // Metrics
  const activeOrdersCount = orders.filter(o => o.status !== 'delivered').length;
  const unpaidInvoicesCount = invoices.filter(inv => inv.status !== 'paid').length;
  const pendingRequestsCount = stockRequests.filter(r => r.status === 'pending').length;
  const lowStockCount = stockInventory.filter(
    s => s.availableUnits <= s.minThresholdUnits
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Bar Navigation with Mode & Role Switcher */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          // If customer tries to click owner tabs, prompt PIN auth
          if ((tab === 'stock' || tab === 'operations' || tab === 'invoices' || tab === 'monthly_sales') && userRole !== 'owner') {
            setIsOwnerAuthOpen(true);
            return;
          }
          setActiveTab(tab);
        }}
        onOpenNewOrder={() => {
          setActiveTab('order');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenPriceSettings={() => {
          if (userRole !== 'owner') {
            setIsOwnerAuthOpen(true);
            return;
          }
          setIsPriceSettingsOpen(true);
        }}
        activeOrderCount={activeOrdersCount}
        unpaidInvoiceCount={unpaidInvoicesCount}
        userRole={userRole}
        onOpenOwnerAuth={() => setIsOwnerAuthOpen(true)}
        onSwitchToCustomer={handleSwitchToCustomer}
        pendingRequestsCount={pendingRequestsCount}
        lowStockCount={lowStockCount}
        activeCustomer={activeCustomer}
        onOpenCustomerAuth={() => setIsCustomerAuthOpen(true)}
        onSignOutCustomer={handleSignOutCustomer}
      />

      {/* Main Content Workspace */}
      <main className="flex-1">
        {/* Customer Self-Service Portal (Orders, Invoices, Delivery Addresses) */}
        {activeTab === 'customer_portal' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {activeCustomer ? (
              <CustomerPortalView
                customer={activeCustomer}
                orders={orders}
                invoices={invoices}
                onSignOut={handleSignOutCustomer}
                onNavigateToNewOrder={() => setActiveTab('order')}
                onReorderItems={handleReorderItems}
                onNavigateToTracking={handleNavigateToTracking}
              />
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md mx-auto text-center space-y-4 shadow-xs my-12">
                <div className="w-12 h-12 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center mx-auto">
                  <Phone className="w-6 h-6 text-cyan-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  Company Sign In Required
                </h2>
                <p className="text-xs text-slate-500">
                  Please sign in with your company mobile phone number to access your past orders, GST tax invoices, and delivery facility specifications.
                </p>
                <button
                  type="button"
                  onClick={() => setIsCustomerAuthOpen(true)}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Sign In with Mobile OTP
                </button>
              </div>
            )}
          </div>
        )}

        {/* 1. Customer Order Intake Portal (Capped strictly to available warehouse stock) */}
        {activeTab === 'order' && (
          <OrderIntakeForm
            onSubmitSuccess={handleOrderSubmitted}
            onNavigateToTracking={handleNavigateToTracking}
            pricingConfig={pricingConfig}
            onOpenPriceSettings={() => {
              if (userRole !== 'owner') {
                setIsOwnerAuthOpen(true);
                return;
              }
              setIsPriceSettingsOpen(true);
            }}
            stockInventory={stockInventory}
            onNavigateToRequestStock={handleNavigateToRequestStock}
            userRole={userRole}
            orders={orders}
            onSubmitFeedback={handleSubmitFeedback}
            onDeliverOrder={handleDeliverOrder}
            activeCustomer={activeCustomer}
            onOpenCustomerAuth={() => setIsCustomerAuthOpen(true)}
            preloadedReorder={preloadedReorder}
            onClearPreloadedReorder={() => setPreloadedReorder(null)}
            registeredCompanies={customers}
          />
        )}

        {/* 2. Request More Stock Tab (For customers needing more than available stock) */}
        {activeTab === 'request_stock' && (
          <RequestStockView
            stockRequests={stockRequests}
            onSubmitStockRequest={handleSubmitStockRequest}
            onUpdateStockRequestStatus={handleUpdateStockRequestStatus}
            userRole={userRole}
            onExit={() => setActiveTab('order')}
            activeCustomer={activeCustomer}
          />
        )}

        {/* 3. Owner-Only Stock Inventory Controller */}
        {activeTab === 'stock' && userRole === 'owner' && (
          <StockInventoryView
            stockInventory={stockInventory}
            onUpdateStock={setStockInventory}
            pricingConfig={pricingConfig}
            onNavigateToStockRequests={() => setActiveTab('request_stock')}
            onExit={() => setActiveTab('order')}
          />
        )}

        {/* 4. Live Tracking (Status advance button restricted to Owner) */}
        {activeTab === 'tracking' && (
          <TrackingView
            orders={orders}
            selectedOrderId={selectedOrderId}
            onSelectOrder={setSelectedOrderId}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onUpdateRouting={handleUpdateRouting}
            onSubmitFeedback={handleSubmitFeedback}
            onViewInvoice={handleViewInvoice}
            onExit={() => setActiveTab('order')}
            userRole={userRole}
          />
        )}

        {/* 5. Invoice Hub (Owner Only - Hidden from customers) */}
        {activeTab === 'invoices' && userRole === 'owner' && (
          <InvoiceView
            invoices={invoices}
            orders={orders}
            selectedInvoiceId={selectedInvoiceId}
            onSelectInvoice={setSelectedInvoiceId}
            onRecordPayment={handleRecordPayment}
            onNavigateToTracking={handleNavigateToTracking}
            onExit={() => setActiveTab('order')}
          />
        )}

        {/* 6. Monthly Sales & Financial Reports (Owner Only) */}
        {activeTab === 'monthly_sales' && userRole === 'owner' && (
          <MonthlySalesView
            orders={orders}
            invoices={invoices}
            pricingConfig={pricingConfig}
            onNavigateToTracking={handleNavigateToTracking}
            onNavigateToInvoice={handleViewInvoice}
            onClearAllOrders={handleClearAllOrders}
            onAddSampleOrder={handleAddSampleOrder}
            onExit={() => setActiveTab('order')}
          />
        )}

        {/* 6. Technical Specifications & TDS */}
        {activeTab === 'tds' && (
          <InkSeriesTds
            onQuickOrder={handleQuickOrderFromTds}
            pricingConfig={pricingConfig}
            onOpenPriceSettings={() => {
              if (userRole !== 'owner') {
                setIsOwnerAuthOpen(true);
                return;
              }
              setIsPriceSettingsOpen(true);
            }}
            onExit={() => setActiveTab('order')}
          />
        )}

        {/* 7. Owner-Only Batch Operations Dashboard */}
        {activeTab === 'operations' && userRole === 'owner' && (
          <SupplierDashboard
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onSelectOrderForTracking={handleNavigateToTracking}
            onExit={() => setActiveTab('order')}
            userRole={userRole}
          />
        )}
      </main>

      {/* Customer Mobile Phone + OTP Authentication Modal */}
      <CustomerAuthModal
        isOpen={isCustomerAuthOpen}
        onClose={() => setIsCustomerAuthOpen(false)}
        onLoginSuccess={handleLoginCustomer}
        registeredCustomers={customers}
        onRegisterCustomer={handleRegisterCustomer}
      />

      {/* Owner Authentication Modal (PIN Protected) */}
      <OwnerAuthModal
        isOpen={isOwnerAuthOpen}
        onClose={() => setIsOwnerAuthOpen(false)}
        savedPin={ownerPin}
        onAuthenticate={() => {
          setUserRole('owner');
        }}
        onUpdatePin={(newPin) => {
          setOwnerPin(newPin);
        }}
      />

      {/* Price Settings Modal (BR Agency Rate Card Control - Owner Only) */}
      <PriceSettingsModal
        isOpen={isPriceSettingsOpen && userRole === 'owner'}
        onClose={() => setIsPriceSettingsOpen(false)}
        currentPricing={pricingConfig}
        onSavePricing={handleSavePricing}
      />

      {/* Clean Editorial Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-6 lg:px-8 mt-16 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900">BR AGENCY</span>
            <span aria-hidden="true">·</span>
            <span>Company Ink Supplies · Commercial Sheetfed &amp; Carton Offset</span>
          </div>

          <div className="flex items-center gap-6 font-mono text-[11px] text-slate-400">
            <span>BIO SPEED™ Sheetfed Litho</span>
            <span>BIO PACK™ Low Migration Cartons</span>
            <span>ISO 2846-1 / 12647-2</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
