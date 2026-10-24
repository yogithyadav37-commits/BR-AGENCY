import React, { useState, useId } from 'react';
import { 
  INK_SERIES, 
  INK_COLORS, 
  CONTAINER_OPTIONS, 
  SAMPLE_CUSTOMER_REVIEWS 
} from '../data/mockData';
import { 
  InkSeriesId, 
  InkColorCode, 
  ContainerSizeId, 
  OrderItem, 
  CustomerProfile, 
  DeliveryAddress,
  Order, 
  Invoice,
  PricingConfig,
  StockItem,
  UserRole,
  DeliveryRoutingDetails,
  DeliveryRoutingMethod,
  ExternalDeliveryAppId,
  OrderFeedback
} from '../types/ink';
import { 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Truck, 
  ShieldCheck, 
  Scale, 
  RotateCcw,
  Sparkles,
  Info,
  Tag,
  MapPin,
  Building2,
  Phone,
  Mail,
  Copy,
  Check,
  Package,
  AlertTriangle,
  ArrowUpRight,
  ExternalLink,
  Star,
  MessageSquare,
  ThumbsUp,
  Award
} from 'lucide-react';
import { EmailSummaryModal } from './EmailSummaryModal';
import { copyOrderEmailToClipboard } from '../utils/orderEmailSummary';
import { 
  EXTERNAL_DELIVERY_APPS, 
  BR_AGENCY_PICKUP_HUB, 
  recommendVehicleForWeight, 
  generateDeliveryManifest,
  copyDeliveryManifestToClipboard 
} from '../utils/deliveryRoutingUtils';
import { DeliveryRoutingModal } from './DeliveryRoutingModal';
import { OrderFeedbackModal } from './OrderFeedbackModal';

interface OrderIntakeFormProps {
  onSubmitSuccess: (newOrder: Order, newInvoice: Invoice) => void;
  onNavigateToTracking: (orderId: string) => void;
  pricingConfig: PricingConfig;
  onOpenPriceSettings: () => void;
  stockInventory: StockItem[];
  onNavigateToRequestStock?: (seriesId?: InkSeriesId, color?: InkColorCode) => void;
  userRole?: UserRole;
  orders?: Order[];
  onSubmitFeedback?: (orderId: string, feedback: OrderFeedback) => void;
  onDeliverOrder?: (orderId: string) => void;
  activeCustomer?: CustomerProfile | null;
  onOpenCustomerAuth?: () => void;
  preloadedReorder?: { seriesId: InkSeriesId; items: OrderItem[] } | null;
  onClearPreloadedReorder?: () => void;
  registeredCompanies?: CustomerProfile[];
}

interface ColorAllocation {
  color: InkColorCode;
  selected: boolean;
  containerId: ContainerSizeId;
  containersCount: number;
}

export const OrderIntakeForm: React.FC<OrderIntakeFormProps> = ({
  onSubmitSuccess,
  onNavigateToTracking,
  pricingConfig,
  onOpenPriceSettings,
  stockInventory,
  onNavigateToRequestStock,
  userRole,
  orders = [],
  onSubmitFeedback,
  onDeliverOrder,
  activeCustomer = null,
  onOpenCustomerAuth,
  preloadedReorder = null,
  onClearPreloadedReorder,
  registeredCompanies = [],
}) => {
  // Feedback modal state
  const [feedbackOrder, setFeedbackOrder] = useState<Order | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState<boolean>(false);

  // Delivered orders calculation
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const unreviewedDelivered = deliveredOrders.filter(o => !o.feedback);
  const reviewedDelivered = deliveredOrders.filter(o => !!o.feedback);

  const dynamicReviews: OrderFeedback[] = orders
    .filter(o => !!o.feedback)
    .map(o => o.feedback!);

  const allReviews: OrderFeedback[] = [...dynamicReviews, ...SAMPLE_CUSTOMER_REVIEWS];
  const averageRating = allReviews.length > 0 
    ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
    : '5.0';

  // 1. Series Selection
  const [selectedSeries, setSelectedSeries] = useState<InkSeriesId>('BIO_SPEED');

  // 2. Color Matrix Allocation
  const [allocations, setAllocations] = useState<Record<InkColorCode, ColorAllocation>>({
    Cyan: { color: 'Cyan', selected: true, containerId: 'can_2_5kg', containersCount: 4 },
    Magenta: { color: 'Magenta', selected: true, containerId: 'can_2_5kg', containersCount: 4 },
    Yellow: { color: 'Yellow', selected: true, containerId: 'can_2_5kg', containersCount: 4 },
    Black: { color: 'Black', selected: true, containerId: 'can_2_5kg', containersCount: 8 }
  });

  // 3. Pressroom & Operational Details
  const [pressModel, setPressModel] = useState<string>('Heidelberg Speedmaster XL 106-6+L');
  const [substrate, setSubstrate] = useState<string>('Coated Art Paper (150 - 300 gsm)');
  const [tackGrade, setTackGrade] = useState<'Standard' | 'High Tack' | 'Soft Tack'>('Standard');
  const [priority, setPriority] = useState<Order['priority']>('Standard (48h)');
  const [jobReference, setJobReference] = useState<string>('JOB-' + Math.floor(1000 + Math.random() * 9000));
  const [customerNotes, setCustomerNotes] = useState<string>('');

  // 4. Customer Selection & Details (Uses activeCustomer or registeredCompanies, never hardcoded demo accounts)
  const [selectedCustomerMode, setSelectedCustomerMode] = useState<'existing' | 'new'>(
    (registeredCompanies && registeredCompanies.length > 0) ? 'existing' : 'new'
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    (registeredCompanies && registeredCompanies.length > 0) ? registeredCompanies[0].id : ''
  );
  const [customCustomer, setCustomCustomer] = useState<CustomerProfile>({
    id: 'CUST-NEW-' + Date.now().toString().slice(-4),
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    gstNumber: '',
    address: '',
    city: '',
    state: 'Delhi',
    postalCode: '',
    pressModel: 'Offset Machinery',
    paymentTerms: 'Net 30'
  });

  // 5. Orderer Delivery Address State
  const [deliveryAddressMode, setDeliveryAddressMode] = useState<'registered' | 'alternate'>('registered');
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>(() => {
    if (activeCustomer?.deliveryAddress) return activeCustomer.deliveryAddress;
    if (registeredCompanies.length > 0 && registeredCompanies[0].deliveryAddress) {
      return registeredCompanies[0].deliveryAddress;
    }
    return {
      plantOrUnitName: '',
      streetAddress: '',
      landmark: '',
      city: '',
      state: 'Delhi',
      postalCode: '',
      dockContactPerson: '',
      dockContactPhone: '',
      gateOrBayNumber: 'Bay 1 (Receiving Dock)',
      unloadingRequirements: 'Standard commercial freight delivery',
      deliveryTimeSlot: '10:00 AM - 05:00 PM'
    };
  });

  const updateDeliveryAddress = (field: keyof DeliveryAddress, val: string) => {
    setDeliveryAddress(prev => ({ ...prev, [field]: val }));
  };

  // Sync activeCustomer with form delivery address and press model
  React.useEffect(() => {
    if (activeCustomer) {
      if (activeCustomer.deliveryAddress) {
        setDeliveryAddress(activeCustomer.deliveryAddress);
      }
      if (activeCustomer.pressModel) {
        setPressModel(activeCustomer.pressModel);
      }
    }
  }, [activeCustomer]);

  // Handle preloaded re-order batch into form
  React.useEffect(() => {
    if (preloadedReorder) {
      if (preloadedReorder.seriesId) {
        setSelectedSeries(preloadedReorder.seriesId);
      }
      if (preloadedReorder.items && preloadedReorder.items.length > 0) {
        setAllocations(prev => {
          const next = { ...prev };
          (Object.keys(next) as InkColorCode[]).forEach(c => {
            const match = preloadedReorder.items.find(it => it.color === c);
            if (match) {
              next[c] = {
                color: c,
                selected: true,
                containerId: match.containerId,
                containersCount: match.containersCount
              };
            } else {
              next[c] = {
                ...next[c],
                selected: false
              };
            }
          });
          return next;
        });
      }
      onClearPreloadedReorder?.();
    }
  }, [preloadedReorder, onClearPreloadedReorder]);

  const handleSelectCustomer = (id: string) => {
    setSelectedCustomerId(id);
    const found = registeredCompanies.find(c => c.id === id);
    if (found && deliveryAddressMode === 'registered' && found.deliveryAddress) {
      setDeliveryAddress(found.deliveryAddress);
    }
  };

  const handleSetDeliveryMode = (mode: 'registered' | 'alternate') => {
    setDeliveryAddressMode(mode);
    if (mode === 'registered') {
      if (selectedCustomerMode === 'existing') {
        const found = registeredCompanies.find(c => c.id === selectedCustomerId);
        if (found?.deliveryAddress) {
          setDeliveryAddress(found.deliveryAddress);
        }
      } else {
        setDeliveryAddress({
          plantOrUnitName: customCustomer.companyName ? `${customCustomer.companyName} Receiving Dock` : 'Company Receiving Dock',
          streetAddress: customCustomer.address || '',
          landmark: '',
          city: customCustomer.city || '',
          state: customCustomer.state || '',
          postalCode: customCustomer.postalCode || '',
          dockContactPerson: customCustomer.contactPerson || '',
          dockContactPhone: customCustomer.phone || '',
          gateOrBayNumber: 'Main Dock',
          unloadingRequirements: 'Standard dock unloading',
          deliveryTimeSlot: '10:00 AM - 05:00 PM'
        });
      }
    }
  };

  // Submission state
  const [submittedOrder, setSubmittedOrder] = useState<Order | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);
  const [quickCopied, setQuickCopied] = useState<boolean>(false);

  // Delivery Routing state (Customer choice to route to other delivery apps)
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryRoutingMethod>('br_dedicated');
  const [selectedAppId, setSelectedAppId] = useState<ExternalDeliveryAppId>('porter');
  const [externalBookingRef, setExternalBookingRef] = useState<string>('');
  const [externalDriverName, setExternalDriverName] = useState<string>('');
  const [externalDriverPhone, setExternalDriverPhone] = useState<string>('');
  const [externalVehicleNumber, setExternalVehicleNumber] = useState<string>('');
  const [manifestCopied, setManifestCopied] = useState<boolean>(false);
  const [isRoutingModalOpen, setIsRoutingModalOpen] = useState<boolean>(false);

  const handleQuickCopyEmail = async (orderToCopy: Order) => {
    const success = await copyOrderEmailToClipboard(orderToCopy, pricingConfig.currencySymbol);
    if (success) {
      setQuickCopied(true);
      setTimeout(() => setQuickCopied(false), 2500);
    }
  };

  const handleCopyManifestFromForm = async () => {
    const recommendedVehicle = recommendVehicleForWeight(totalKg, orderItems);
    const selectedAppConfig = EXTERNAL_DELIVERY_APPS.find(a => a.id === selectedAppId) || EXTERNAL_DELIVERY_APPS[0];
    const dummyOrder: any = {
      orderNumber: 'PROPOSED-ORDER',
      invoiceId: 'PROPOSED-INVOICE',
      totalKg,
      items: orderItems,
      deliveryAddress,
      customer: effectiveCustomer,
      deliveryRouting: {
        method: deliveryMethod,
        providerId: selectedAppId,
        providerName: selectedAppConfig.name,
        externalBookingRef,
        pickupWarehouse: BR_AGENCY_PICKUP_HUB,
        recommendedVehicle
      }
    };
    const text = generateDeliveryManifest(dummyOrder);
    try {
      await navigator.clipboard.writeText(text);
      setManifestCopied(true);
      setTimeout(() => setManifestCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };



  const activeSeries = INK_SERIES[selectedSeries];

  // Helper to lookup available stock units
  const getAvailableStockUnits = (series: InkSeriesId, color: InkColorCode, containerId: ContainerSizeId): number => {
    const item = stockInventory.find(s => s.seriesId === series && s.color === color && s.containerId === containerId);
    return item ? item.availableUnits : 0;
  };

  // Helper to update allocation with strict stock ceiling
  const updateAllocation = (
    color: InkColorCode, 
    field: keyof ColorAllocation, 
    val: any
  ) => {
    setAllocations(prev => {
      const cur = prev[color];
      const nextContainer = field === 'containerId' ? (val as ContainerSizeId) : cur.containerId;
      const maxAvailable = getAvailableStockUnits(selectedSeries, color, nextContainer);

      let nextCount = cur.containersCount;
      if (field === 'containersCount') {
        const requested = Math.max(0, val);
        nextCount = Math.min(requested, maxAvailable);
      } else if (field === 'containerId') {
        nextCount = Math.min(cur.containersCount, maxAvailable);
      }

      return {
        ...prev,
        [color]: {
          ...cur,
          containerId: nextContainer,
          containersCount: nextCount,
          [field]: field === 'containersCount' ? nextCount : val
        }
      };
    });
  };

  // Quick Presets (respecting warehouse stock)
  const applyPreset = (type: 'balanced' | 'packaging' | 'boxes') => {
    if (type === 'balanced') {
      const cMax = getAvailableStockUnits('BIO_SPEED', 'Cyan', 'can_2_5kg');
      const mMax = getAvailableStockUnits('BIO_SPEED', 'Magenta', 'can_2_5kg');
      const yMax = getAvailableStockUnits('BIO_SPEED', 'Yellow', 'can_2_5kg');
      const kMax = getAvailableStockUnits('BIO_SPEED', 'Black', 'can_2_5kg');

      setAllocations({
        Cyan: { color: 'Cyan', selected: true, containerId: 'can_2_5kg', containersCount: Math.min(4, cMax) },
        Magenta: { color: 'Magenta', selected: true, containerId: 'can_2_5kg', containersCount: Math.min(4, mMax) },
        Yellow: { color: 'Yellow', selected: true, containerId: 'can_2_5kg', containersCount: Math.min(4, yMax) },
        Black: { color: 'Black', selected: true, containerId: 'can_2_5kg', containersCount: Math.min(8, kMax) }
      });
    } else if (type === 'packaging') {
      setSelectedSeries('BIO_PACK');
      const cMax = getAvailableStockUnits('BIO_PACK', 'Cyan', 'pail_15kg');
      const mMax = getAvailableStockUnits('BIO_PACK', 'Magenta', 'pail_15kg');
      const yMax = getAvailableStockUnits('BIO_PACK', 'Yellow', 'pail_15kg');
      const kMax = getAvailableStockUnits('BIO_PACK', 'Black', 'pail_15kg');

      setAllocations({
        Cyan: { color: 'Cyan', selected: true, containerId: 'pail_15kg', containersCount: Math.min(2, cMax) },
        Magenta: { color: 'Magenta', selected: true, containerId: 'pail_15kg', containersCount: Math.min(4, mMax) },
        Yellow: { color: 'Yellow', selected: true, containerId: 'pail_15kg', containersCount: Math.min(2, yMax) },
        Black: { color: 'Black', selected: true, containerId: 'pail_15kg', containersCount: Math.min(3, kMax) }
      });
    } else if (type === 'boxes') {
      const cMax = getAvailableStockUnits(selectedSeries, 'Cyan', 'box_2kg');
      const mMax = getAvailableStockUnits(selectedSeries, 'Magenta', 'box_2kg');
      const yMax = getAvailableStockUnits(selectedSeries, 'Yellow', 'box_2kg');
      const kMax = getAvailableStockUnits(selectedSeries, 'Black', 'box_2kg');

      setAllocations({
        Cyan: { color: 'Cyan', selected: true, containerId: 'box_2kg', containersCount: Math.min(5, cMax) },
        Magenta: { color: 'Magenta', selected: true, containerId: 'box_2kg', containersCount: Math.min(5, mMax) },
        Yellow: { color: 'Yellow', selected: true, containerId: 'box_2kg', containersCount: Math.min(5, yMax) },
        Black: { color: 'Black', selected: true, containerId: 'box_2kg', containersCount: Math.min(10, kMax) }
      });
    }
  };

  // Calculate Order Items & Financials
  const orderItems: OrderItem[] = INK_COLORS
    .filter(col => allocations[col.name].selected && allocations[col.name].containersCount > 0)
    .map(col => {
      const alloc = allocations[col.name];
      const container = CONTAINER_OPTIONS.find(c => c.id === alloc.containerId) || CONTAINER_OPTIONS[0];
      const totalKg = alloc.containersCount * container.kgPerUnit;
      const unitPricePerKg = selectedSeries === 'BIO_SPEED' 
        ? pricingConfig.bioSpeed[col.name] 
        : pricingConfig.bioPack[col.name];
      const totalPrice = totalKg * unitPricePerKg;

      return {
        seriesId: selectedSeries,
        color: col.name,
        containerId: container.id,
        containerLabel: container.shortLabel,
        containersCount: alloc.containersCount,
        kgPerUnit: container.kgPerUnit,
        totalKg,
        unitPricePerKg,
        totalPrice
      };
    });

  const totalKg = orderItems.reduce((acc, it) => acc + it.totalKg, 0);
  const subtotal = orderItems.reduce((acc, it) => acc + it.totalPrice, 0);

  // Volume discount tiers dynamically matching pricingConfig
  const matchedTier = pricingConfig.volumeDiscounts
    .filter(t => totalKg >= t.minKg)
    .sort((a, b) => b.minKg - a.minKg)[0];
  const discountPct = matchedTier ? matchedTier.discountPct : 0;

  const discountAmount = Number(((subtotal * discountPct) / 100).toFixed(2));
  const discountedSubtotal = subtotal - discountAmount;
  const taxPct = pricingConfig.taxRatePct;
  const taxAmount = Number(((discountedSubtotal * taxPct) / 100).toFixed(2));

  // Shipping logic (Free if customer routes through other delivery applications or self-pickup)
  let shippingFee = 0;
  if (totalKg > 0 && deliveryMethod === 'br_dedicated') {
    if (priority === 'Emergency Press Run (Same-Day)') {
      shippingFee = pricingConfig.shippingEmergencyFee;
    } else if (priority === 'Express Dispatch (24h)') {
      shippingFee = pricingConfig.shippingExpressFee;
    } else {
      shippingFee = totalKg >= 300 ? 0 : pricingConfig.shippingStandardFee;
    }
  }

  const totalAmount = Number((discountedSubtotal + taxAmount + shippingFee).toFixed(2));

  // Determine Customer (Prefer active authenticated customer session)
  const effectiveCustomer: CustomerProfile = activeCustomer
    ? activeCustomer
    : (selectedCustomerMode === 'existing' && registeredCompanies.length > 0
      ? (registeredCompanies.find(c => c.id === selectedCustomerId) || registeredCompanies[0])
      : customCustomer);

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItems.length === 0) {
      alert('Please select at least one ink color and quantity.');
      return;
    }

    if (selectedCustomerMode === 'new' && (!customCustomer.companyName || !customCustomer.contactPerson)) {
      alert('Please fill in the company name and contact person.');
      return;
    }

    if (!deliveryAddress.plantOrUnitName || !deliveryAddress.streetAddress || !deliveryAddress.city) {
      alert('Please specify the delivery facility name, street address, and city.');
      return;
    }

    const orderSeq = Math.floor(8430 + Math.random() * 500);
    const orderNumber = `ORD-2026-${orderSeq}`;
    const invoiceNumber = `INV-2026-${orderSeq + 200}`;
    const now = new Date().toISOString();

    const recommendedVehicle = recommendVehicleForWeight(totalKg, orderItems);
    const selectedAppConfig = EXTERNAL_DELIVERY_APPS.find(a => a.id === selectedAppId) || EXTERNAL_DELIVERY_APPS[0];
    const routingProviderName = deliveryMethod === 'br_dedicated'
      ? 'BR Agency Dedicated In-House Fleet'
      : deliveryMethod === 'customer_pickup'
      ? 'Customer Self-Arranged Vehicle / Driver'
      : selectedAppConfig.name;

    const deliveryRouting: DeliveryRoutingDetails = {
      method: deliveryMethod,
      providerId: deliveryMethod === 'br_dedicated' ? 'own_fleet' : selectedAppId,
      providerName: routingProviderName,
      externalBookingRef: externalBookingRef.trim() || undefined,
      driverName: externalDriverName.trim() || undefined,
      driverPhone: externalDriverPhone.trim() || undefined,
      vehicleNumber: externalVehicleNumber.trim() || undefined,
      vehicleType: recommendedVehicle,
      bookingStatus: externalBookingRef.trim() ? 'booked' : 'unassigned',
      pickupWarehouse: BR_AGENCY_PICKUP_HUB,
      recommendedVehicle,
      directAppUrl: selectedAppConfig.bookingUrl || undefined
    };

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber,
      createdAt: now,
      customer: { ...effectiveCustomer, pressModel },
      deliveryAddress,
      items: orderItems,
      subtotal,
      discountPct,
      discountAmount,
      taxPct,
      taxAmount,
      shippingFee,
      totalAmount,
      totalKg,
      priority,
      pressJobRef: jobReference,
      notes: customerNotes ? `Tack: ${tackGrade}. Substrate: ${substrate}. Notes: ${customerNotes}` : `Tack: ${tackGrade}. Substrate: ${substrate}.`,
      status: 'received',
      invoiceId: invoiceNumber,
      paymentStatus: 'unpaid',
      deliveryRouting,
      tracking: {
        carrier: routingProviderName,
        trackingNumber: externalBookingRef.trim() || `BRL-${Math.floor(100000 + Math.random() * 900000)}-${selectedSeries === 'BIO_SPEED' ? 'SPD' : 'PCK'}`,
        vehicleNumber: externalVehicleNumber.trim() || (deliveryMethod === 'br_dedicated' ? 'DL-01-EXP-' + Math.floor(1000 + Math.random() * 9000) : 'To be assigned in ' + routingProviderName),
        driverName: externalDriverName.trim() || (deliveryMethod === 'br_dedicated' ? 'Assigned upon staging' : 'Customer App Delivery Partner'),
        driverPhone: externalDriverPhone.trim() || (deliveryMethod === 'br_dedicated' ? '+91 98101 22903 (BR Fleet Dispatch)' : 'Via Delivery Application'),
        currentLocation: deliveryMethod === 'external_app' ? `Staged at Naraina Bay 2 (Awaiting ${routingProviderName} Pickup)` : 'BR Agency Central Formulation Hall - Queue Position #1',
        estimatedArrival: priority.includes('Same-Day') ? 'Today by 06:00 PM' : 'Within 48 hours',
        batchNumber: `${selectedSeries === 'BIO_SPEED' ? 'BS' : 'BP'}-2610-${Math.floor(10 + Math.random() * 90)}Q`,
        qcCertificateId: `QC-CERT-${Math.floor(1000 + Math.random() * 9000)}`,
        qcPassedDate: now,
        qcInspectedBy: 'QC Laboratory Officer',
        testedTack: activeSeries.specs.tackValue.split(' ')[0],
        testedFineness: '< 1.5 µm',
        milestones: [
          {
            status: 'received',
            title: 'Order Received & Specifications Confirmed',
            description: `Order ${orderNumber} queued for ${activeSeries.name} CMYK ink set (${totalKg} kg total).`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            location: 'BR Agency Order Intake Desk',
            completed: true
          },
          {
            status: 'formulation',
            title: 'Batch Formulation & 3-Roll Dispersion',
            description: `Scheduled on clean dispersion line with ${activeSeries.baseFormula}.`,
            timestamp: 'Queued next in line',
            location: 'Production Milling Hall',
            completed: false
          },
          {
            status: 'qc_passed',
            title: 'Laboratory Quality Verification',
            description: 'Viscosity, Tack at 32°C, and Grindometer fineness test.',
            timestamp: 'Pending milling completion',
            location: 'Analytical Quality Lab',
            completed: false
          },
          {
            status: 'packed',
            title: 'Vacuum Canning & Nitrogen Sealing',
            description: 'Airtight packaging into specified container formats.',
            timestamp: 'Pending QC sign-off',
            location: 'Canning & Palletizing Bay',
            completed: false
          },
          {
            status: 'dispatched',
            title: 'Dispatched via Dedicated Freight',
            description: `Loading into temperature-controlled ink freight truck headed for ${deliveryAddress.city}.`,
            timestamp: 'Pending packing',
            location: 'BR Central Express Depot',
            completed: false
          },
          {
            status: 'delivered',
            title: 'Delivered to Company Receiving Bay',
            description: `Delivery destination: ${deliveryAddress.plantOrUnitName || effectiveCustomer.companyName}, ${deliveryAddress.streetAddress}, ${deliveryAddress.city} - ${deliveryAddress.postalCode}. Dock In-charge: ${deliveryAddress.dockContactPerson} (${deliveryAddress.dockContactPhone}).`,
            timestamp: priority.includes('Same-Day') ? 'Expected Today' : 'Expected within 48h',
            location: `${deliveryAddress.plantOrUnitName || effectiveCustomer.companyName}, ${deliveryAddress.city}`,
            completed: false
          }
        ]
      }
    };

    const dueDateObj = new Date();
    dueDateObj.setDate(dueDateObj.getDate() + 30);

    const newInvoice: Invoice = {
      id: invoiceNumber,
      invoiceNumber,
      orderId: newOrder.id,
      orderNumber,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: dueDateObj.toISOString().split('T')[0],
      customer: newOrder.customer,
      deliveryAddress,
      items: orderItems,
      subtotal,
      discountAmount,
      taxRate: taxPct,
      taxAmount,
      shippingFee,
      totalAmount,
      paidAmount: 0,
      status: 'unpaid',
      paymentTerms: 'Net 30 Days from Dispatch',
      bankDetails: {
        bankName: 'HDFC Bank Ltd.',
        accountName: 'BR Agency Ink Supplies',
        accountNumber: '5020-0048-9921-34',
        ifscOrSwift: 'HDFC0001048',
        branch: 'Naraina Industrial Area Branch, New Delhi'
      },
      payments: []
    };

    onSubmitSuccess(newOrder, newInvoice);
    setSubmittedOrder(newOrder);
  };

  // If order was successfully submitted, show clean success confirmation
  if (submittedOrder) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-xs">
          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold tracking-wider text-emerald-700 uppercase">
                Order Logged & Invoiced
              </span>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Order #{submittedOrder.orderNumber}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-y border-slate-100 text-sm">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Client Company</span>
              <p className="font-semibold text-slate-900 mt-0.5">{submittedOrder.customer.companyName}</p>
              <p className="text-xs text-slate-500 mt-1">{submittedOrder.customer.pressModel}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Ink Series & Volume</span>
              <p className="font-semibold text-slate-900 mt-0.5">{INK_SERIES[submittedOrder.items[0].seriesId].name} Process Ink</p>
              <p className="text-xs font-mono font-medium text-slate-700 mt-1 tabular-nums">
                {submittedOrder.totalKg} kg total ({submittedOrder.items.length} CMYK items)
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Commercial Total</span>
              <p className="text-lg font-bold font-mono text-slate-900 mt-0.5 tabular-nums">
                {pricingConfig.currencySymbol}{submittedOrder.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-slate-500 mt-1">Invoice #{submittedOrder.invoiceId}</p>
            </div>
          </div>

          {/* Delivery Destination Confirmed */}
          {submittedOrder.deliveryAddress && (
            <div className="my-6 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-cyan-700 font-bold uppercase tracking-wider text-[11px]">
                <MapPin className="w-3.5 h-3.5" />
                <span>Confirmed Delivery Destination & Receiving Dock</span>
              </div>
              <p className="font-bold text-sm text-slate-900">
                {submittedOrder.deliveryAddress.plantOrUnitName}
              </p>
              <p className="text-slate-600">
                {submittedOrder.deliveryAddress.streetAddress}
                {submittedOrder.deliveryAddress.landmark ? ` (${submittedOrder.deliveryAddress.landmark})` : ''}, {submittedOrder.deliveryAddress.city}, {submittedOrder.deliveryAddress.state} - {submittedOrder.deliveryAddress.postalCode}
              </p>
              <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-x-5 gap-y-1 text-slate-600 font-mono text-[11px]">
                <span>Dock In-charge: <strong className="text-slate-900">{submittedOrder.deliveryAddress.dockContactPerson}</strong></span>
                <span>Phone: <strong className="text-slate-900">{submittedOrder.deliveryAddress.dockContactPhone}</strong></span>
                {submittedOrder.deliveryAddress.gateOrBayNumber && (
                  <span>Bay: <strong className="text-slate-900">{submittedOrder.deliveryAddress.gateOrBayNumber}</strong></span>
                )}
                {submittedOrder.deliveryAddress.deliveryTimeSlot && (
                  <span>Window: <strong className="text-slate-900">{submittedOrder.deliveryAddress.deliveryTimeSlot}</strong></span>
                )}
              </div>
            </div>
          )}

          {/* Confirmed Delivery App Routing Card */}
          <div className="my-6 p-4 bg-gradient-to-r from-cyan-50/70 to-blue-50/70 border border-cyan-200 rounded-xl text-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-cyan-700" />
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                  Dispatch &amp; Delivery Logistics
                </h4>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  submittedOrder.deliveryRouting?.method === 'external_app'
                    ? 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                    : submittedOrder.deliveryRouting?.method === 'customer_pickup'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-slate-100 text-slate-800 border border-slate-200'
                }`}>
                  {submittedOrder.deliveryRouting?.method === 'external_app'
                    ? `Routed via ${submittedOrder.deliveryRouting.providerName}`
                    : submittedOrder.deliveryRouting?.method === 'customer_pickup'
                    ? 'Self-Pickup'
                    : 'BR In-House Fleet'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsRoutingModalOpen(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Truck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Modify Delivery App Routing</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const ok = await copyDeliveryManifestToClipboard(submittedOrder);
                    if (ok) {
                      setManifestCopied(true);
                      setTimeout(() => setManifestCopied(false), 2500);
                    }
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all inline-flex items-center gap-1.5 shadow-2xs border cursor-pointer ${
                    manifestCopied
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
                  }`}
                >
                  {manifestCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Manifest Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Manifest</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-slate-700">
              <div className="p-2.5 bg-white/80 rounded-lg border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Dispatch Routing Provider</span>
                <span className="font-bold text-slate-900 block mt-0.5">
                  {submittedOrder.deliveryRouting?.providerName || 'BR Dedicated Fleet'}
                </span>
                {submittedOrder.deliveryRouting?.externalBookingRef && (
                  <span className="text-[11px] font-mono text-cyan-800 block mt-0.5">
                    Ref: {submittedOrder.deliveryRouting.externalBookingRef}
                  </span>
                )}
              </div>

              <div className="p-2.5 bg-white/80 rounded-lg border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Recommended Vehicle</span>
                <span className="font-semibold text-slate-800 block mt-0.5">
                  {submittedOrder.deliveryRouting?.recommendedVehicle || 'Standard Carrier'}
                </span>
                {submittedOrder.deliveryRouting?.vehicleNumber && (
                  <span className="text-[11px] font-mono text-slate-600 block mt-0.5">
                    Reg: {submittedOrder.deliveryRouting.vehicleNumber}
                  </span>
                )}
              </div>

              <div className="p-2.5 bg-white/80 rounded-lg border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Warehouse Staging Dock</span>
                <span className="font-semibold text-slate-800 block mt-0.5">
                  Naraina Ind. Area Bay 2
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Ready for driver pickup upon packing
                </span>
              </div>
            </div>
          </div>

          {/* Client Email Summary Card */}
          <div className="my-6 p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl shadow-xs border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg border border-cyan-500/30">
                  <Mail className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono">
                  Client Communication Ready
                </span>
              </div>
              <h4 className="text-sm font-semibold text-white">
                Text-Based Order Confirmation for {submittedOrder.customer.companyName}
              </h4>
              <p className="text-xs text-slate-300">
                Includes full CMYK items breakdown, dispatch logistics, delivery dock instructions, and bank transfer info.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(true)}
                className="px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                <span>Preview &amp; Edit</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickCopyEmail(submittedOrder)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all shadow-xs inline-flex items-center gap-2 ${
                  quickCopied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                }`}
              >
                {quickCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Email Summary</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Customer Review & Experience Card */}
          <div className="my-6 p-4.5 bg-gradient-to-r from-amber-50/80 via-orange-50/60 to-amber-50/80 border border-amber-300 rounded-xl text-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Star className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">
                      {submittedOrder.status === 'delivered'
                        ? (submittedOrder.feedback ? 'Company Delivery Review Submitted' : 'Consignment Delivered! Rate Your Experience')
                        : 'Customer Review & Feedback System'}
                    </h4>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      submittedOrder.status === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-200'
                    }`}>
                      {submittedOrder.status === 'delivered' ? 'Delivered' : 'Unlocks Upon Delivery'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {submittedOrder.status === 'delivered'
                      ? (submittedOrder.feedback
                          ? `You rated this batch ${submittedOrder.feedback.rating}/5 stars. Thank you for helping our laboratory maintain ISO standards!`
                          : 'Your ink consignment has arrived at the company receiving dock. Submit your rating for ink gloss, tack, packaging, and delivery transit.')
                      : 'Once this ink batch arrives at your receiving dock and is marked as delivered, you can rate ink quality, dot gain, and dispatch punctuality.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {submittedOrder.status !== 'delivered' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onDeliverOrder) {
                        onDeliverOrder(submittedOrder.id);
                      }
                      setSubmittedOrder(prev => prev ? { ...prev, status: 'delivered' } : null);
                    }}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    title="Simulate dock delivery to test customer feedback submission"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Simulate Delivery (Test Review)</span>
                  </button>
                )}

                {submittedOrder.status === 'delivered' && (
                  <button
                    type="button"
                    onClick={() => {
                      setFeedbackOrder(submittedOrder);
                      setIsFeedbackModalOpen(true);
                    }}
                    className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-all inline-flex items-center gap-1.5 shadow-xs cursor-pointer hover:scale-[1.02]"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{submittedOrder.feedback ? 'Edit Company Review' : 'Rate Order Experience'}</span>
                  </button>
                )}
              </div>
            </div>

            {submittedOrder.feedback && (
              <div className="p-3 bg-white rounded-lg border border-amber-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= submittedOrder.feedback!.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                    ))}
                    <span className="font-bold text-xs text-slate-900 ml-1.5">
                      {submittedOrder.feedback.rating}/5 Stars
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(submittedOrder.feedback.submittedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-700 italic">
                  "{submittedOrder.feedback.comment}"
                </p>
                {submittedOrder.feedback.tags && submittedOrder.feedback.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {submittedOrder.feedback.tags.map((t, i) => (
                      <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => {
                setSubmittedOrder(null);
                applyPreset('balanced');
              }}
              className="px-4 py-2.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Create Another Order</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigateToTracking(submittedOrder.id)}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Track Live Batch Status</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            </div>
          </div>

          {/* Email Summary Modal */}
          <EmailSummaryModal
            order={submittedOrder}
            currencySymbol={pricingConfig.currencySymbol}
            isOpen={isEmailModalOpen}
            onClose={() => setIsEmailModalOpen(false)}
          />

          {/* Delivery Routing Modal for Submitted Order */}
          <DeliveryRoutingModal
            order={submittedOrder}
            isOpen={isRoutingModalOpen}
            onClose={() => setIsRoutingModalOpen(false)}
            onUpdateRouting={(orderId, updatedRouting) => {
              setSubmittedOrder(prev => prev ? {
                ...prev,
                deliveryRouting: updatedRouting,
                tracking: {
                  ...prev.tracking,
                  carrier: updatedRouting.providerName,
                  trackingNumber: updatedRouting.externalBookingRef || prev.tracking.trackingNumber,
                  vehicleNumber: updatedRouting.vehicleNumber || prev.tracking.vehicleNumber,
                  driverName: updatedRouting.driverName || prev.tracking.driverName,
                  driverPhone: updatedRouting.driverPhone || prev.tracking.driverPhone
                }
              } : null);
            }}
          />

          {/* Customer Feedback Modal for Submitted Order */}
          <OrderFeedbackModal
            order={submittedOrder}
            isOpen={isFeedbackModalOpen}
            existingFeedback={submittedOrder.feedback}
            onClose={() => setIsFeedbackModalOpen(false)}
            onSubmitFeedback={(orderId, feedback) => {
              if (onSubmitFeedback) {
                onSubmitFeedback(orderId, feedback);
              }
              setSubmittedOrder(prev => prev ? { ...prev, feedback } : null);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Intro Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
              <span>Company Supply</span>
              <span aria-hidden="true">·</span>
              <span>BIO SPEED & BIO PACK</span>
              <span aria-hidden="true">·</span>
              <span>CMYK Offset Formulations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Commercial Ink Intake & Order Specification
            </h1>
            <p className="mt-1 text-sm text-slate-600 max-w-2xl">
              Configure process ink batches with custom container packaging, technical tack calibration, real-time volume pricing, and automated tax invoicing.
            </p>
          </div>

          {/* Quick Presets Bar */}
          <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-lg border border-slate-200 text-xs shrink-0">
            <span className="text-slate-500 font-medium px-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-slate-400" />
              Presets:
            </span>
            <button
              type="button"
              onClick={() => applyPreset('balanced')}
              className="px-2.5 py-1 font-medium bg-white text-slate-800 rounded shadow-xs hover:bg-slate-50 transition-colors"
            >
              Standard CMYK (2.5kg)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('packaging')}
              className="px-2.5 py-1 font-medium text-slate-600 hover:text-slate-900 rounded hover:bg-white/60 transition-colors"
            >
              Food Carton (15kg Pails)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('boxes')}
              className="px-2.5 py-1 font-medium text-slate-600 hover:text-slate-900 rounded hover:bg-white/60 transition-colors"
            >
              Startup Boxes (Min 2.0kg)
            </button>
          </div>
        </div>
      </div>

      {/* Client Review & Feedback Action Strip for Delivered Orders */}
      {unreviewedDelivered.length > 0 ? (
        <div className="mb-8 p-4.5 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50/70 border border-amber-300 rounded-2xl shadow-sm animate-in fade-in duration-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs ring-4 ring-amber-100">
                <Star className="w-5 h-5 fill-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">
                    Delivered Inks Awaiting Company Review
                  </h3>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 border border-amber-300">
                    {unreviewedDelivered.length} Order{unreviewedDelivered.length > 1 ? 's' : ''} Ready for Rating
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  Your process ink batch arrived at your company dock. Rate your ink setting time, dot sharpness, rub resistance, and freight delivery to complete quality records.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {unreviewedDelivered.map((ord) => (
                <button
                  key={ord.id}
                  type="button"
                  onClick={() => {
                    setFeedbackOrder(ord);
                    setIsFeedbackModalOpen(true);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all inline-flex items-center gap-1.5 shadow-sm cursor-pointer hover:scale-[1.02]"
                >
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Rate #{ord.orderNumber} ({ord.totalKg}kg)</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : reviewedDelivered.length > 0 ? (
        <div className="mb-6 p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              All <strong>{reviewedDelivered.length}</strong> delivered order(s) have been reviewed. Thank you for rating your company orders!
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setFeedbackOrder(reviewedDelivered[0]);
              setIsFeedbackModalOpen(true);
            }}
            className="text-[11px] font-semibold text-emerald-800 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>View / Edit Review #{reviewedDelivered[0].orderNumber}</span>
          </button>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Configuration Form (8 Cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Section 1: Choose Ink Series */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
                  01. Ink System Series
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  Select Base Ink Formulation
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {activeSeries.vegetableOilPct}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* BIO SPEED Card */}
              <div
                onClick={() => setSelectedSeries('BIO_SPEED')}
                className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedSeries === 'BIO_SPEED'
                    ? 'border-slate-900 bg-slate-900/5'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-600">
                      Sheetfed Lithography
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                      BIO SPEED
                    </h3>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    selectedSeries === 'BIO_SPEED'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-300'
                  }`}>
                    {selectedSeries === 'BIO_SPEED' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>

                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Ultra-fast setting (6–9 min), high gloss, anti-skinning overnight duct stability. Engineered for high-speed commercial presses up to 18,000+ iph.
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Setting: 6–9 min</span>
                  <span aria-hidden="true">·</span>
                  <span>Tack: 11.0–12.2</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-slate-700">82% Bio-Oil</span>
                </div>
              </div>

              {/* BIO PACK Card */}
              <div
                onClick={() => setSelectedSeries('BIO_PACK')}
                className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedSeries === 'BIO_PACK'
                    ? 'border-slate-900 bg-slate-900/5'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                      Food & Carton Packaging
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                      BIO PACK
                    </h3>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    selectedSeries === 'BIO_PACK'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-300'
                  }`}>
                    {selectedSeries === 'BIO_PACK' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>

                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Low-migration, low-odor mineral-oil-free (MOSH/MOAH compliant) system. High rub resistance for folding boxboard cartons and cosmetic boxes.
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Setting: 8–12 min</span>
                  <span aria-hidden="true">·</span>
                  <span>Tack: 9.8–11.0</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-emerald-700">MOSH/MOAH Free</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: CMYK Color & Packaging Matrix */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
                  02. Color & Packaging Allocation
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  Process CMYK Volume Matrix
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-slate-400" />
                  <span>Enforcing live warehouse stock</span>
                </div>
                {userRole === 'owner' && (
                  <button
                    type="button"
                    onClick={onOpenPriceSettings}
                    className="px-2 py-0.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded flex items-center gap-1 transition-colors"
                    title="Configure base price per kg"
                  >
                    <Tag className="w-3 h-3 text-cyan-600" />
                    <span>Set Rates</span>
                  </button>
                )}
              </div>
            </div>

            {/* Warehouse Stock Alert Notice */}
            <div className="mb-4 p-3 bg-cyan-50/60 border border-cyan-200 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-cyan-900">
                <Package className="w-4 h-4 text-cyan-700 shrink-0" />
                <span>
                  <strong>Strict Inventory Mode:</strong> Quantities are capped to current warehouse stock. If your press requires more volume, submit a stock request.
                </span>
              </div>
              {onNavigateToRequestStock && (
                <button
                  type="button"
                  onClick={() => onNavigateToRequestStock(selectedSeries)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-cyan-800 hover:text-cyan-950 underline underline-offset-2 shrink-0"
                >
                  <span>Request More Stock</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-4">
              {INK_COLORS.map(col => {
                const alloc = allocations[col.name];
                const unitPrice = selectedSeries === 'BIO_SPEED' 
                  ? pricingConfig.bioSpeed[col.name] 
                  : pricingConfig.bioPack[col.name];
                const container = CONTAINER_OPTIONS.find(c => c.id === alloc.containerId) || CONTAINER_OPTIONS[0];
                const lineKg = alloc.containersCount * container.kgPerUnit;
                const lineTotal = lineKg * unitPrice;

                // Live stock lookup
                const availableUnits = getAvailableStockUnits(selectedSeries, col.name, alloc.containerId);
                const isOutOfStock = availableUnits === 0;
                const isLowStock = availableUnits > 0 && availableUnits <= 6;
                const isAtMaxStock = alloc.containersCount >= availableUnits && availableUnits > 0;

                return (
                  <div 
                    key={col.name}
                    className={`p-4 rounded-xl border transition-colors ${
                      alloc.selected 
                        ? isOutOfStock
                          ? 'border-rose-200 bg-rose-50/20'
                          : 'border-slate-300 bg-slate-50/50' 
                        : 'border-slate-200 bg-white opacity-60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Color Tag & Toggle */}
                      <div className="flex items-center gap-3 min-w-[160px]">
                        <input
                          type="checkbox"
                          checked={alloc.selected}
                          onChange={(e) => updateAllocation(col.name, 'selected', e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                        />
                        <div 
                          className="w-4 h-8 rounded-sm shrink-0 border border-black/10 shadow-xs" 
                          style={{ backgroundColor: col.hex }} 
                        />
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-bold text-sm text-slate-900">
                              {col.name}
                            </span>
                            <span className="text-xs font-mono text-slate-400">
                              ({col.code})
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 block">
                            {col.pigmentCode}
                          </span>
                        </div>
                      </div>

                      {/* Container Format Selector */}
                      <div className="flex-1 max-w-xs">
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          Packaging Size
                        </label>
                        <select
                          disabled={!alloc.selected}
                          value={alloc.containerId}
                          onChange={(e) => updateAllocation(col.name, 'containerId', e.target.value as ContainerSizeId)}
                          className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 disabled:opacity-50"
                        >
                          {CONTAINER_OPTIONS.map(opt => {
                            const optStock = getAvailableStockUnits(selectedSeries, col.name, opt.id);
                            return (
                              <option key={opt.id} value={opt.id}>
                                {opt.label} ({opt.kgPerUnit} kg) {optStock === 0 ? '· Out of Stock' : `· (${optStock} in stock)`}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      {/* Quantity Stepper with Stock Enforcement */}
                      <div className="w-32">
                        <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 mb-1">
                          <span>Units to Order</span>
                          <span className="font-mono text-[10px] text-slate-400">
                            Max: {availableUnits}
                          </span>
                        </div>
                        <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
                          <button
                            type="button"
                            disabled={!alloc.selected || alloc.containersCount <= 0}
                            onClick={() => updateAllocation(col.name, 'containersCount', Math.max(0, alloc.containersCount - 1))}
                            className="w-8 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-30 text-sm font-semibold"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            disabled={!alloc.selected || isOutOfStock}
                            min={0}
                            max={availableUnits}
                            value={alloc.containersCount}
                            onChange={(e) => updateAllocation(col.name, 'containersCount', Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-16 text-center text-xs font-mono font-medium text-slate-900 focus:outline-none border-x border-slate-100 tabular-nums disabled:bg-slate-50"
                          />
                          <button
                            type="button"
                            disabled={!alloc.selected || alloc.containersCount >= availableUnits || isOutOfStock}
                            onClick={() => updateAllocation(col.name, 'containersCount', alloc.containersCount + 1)}
                            className="w-8 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-30 text-sm font-semibold"
                            title={alloc.containersCount >= availableUnits ? 'Cannot exceed available stock' : 'Add 1 unit'}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Total Weight & Price */}
                      <div className="text-right min-w-[110px]">
                        <span className="block text-[11px] font-mono text-slate-500 tabular-nums">
                          {alloc.selected ? `${lineKg.toFixed(1)} kg` : '0 kg'} @ {pricingConfig.currencySymbol}{unitPrice.toFixed(2)}/kg
                        </span>
                        <span className="block text-sm font-bold font-mono text-slate-900 tabular-nums">
                          {pricingConfig.currencySymbol}{alloc.selected ? lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                        </span>
                      </div>
                    </div>

                    {/* Stock Availability Footer Line */}
                    {alloc.selected && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <div className="flex items-center gap-2">
                          {isOutOfStock ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded text-[11px]">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              <span>Out of Stock in Warehouse</span>
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded text-[11px]">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>Low Stock: Only {availableUnits} units available ({ (availableUnits * container.kgPerUnit).toFixed(1) } kg)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Warehouse Stock: {availableUnits} units ({ (availableUnits * container.kgPerUnit).toFixed(1) } kg available)</span>
                            </span>
                          )}

                          {isAtMaxStock && (
                            <span className="text-slate-500 italic text-[11px]">
                              (All available units selected)
                            </span>
                          )}
                        </div>

                        {(isAtMaxStock || isOutOfStock) && onNavigateToRequestStock && (
                          <button
                            type="button"
                            onClick={() => onNavigateToRequestStock(selectedSeries, col.name)}
                            className="inline-flex items-center gap-1 text-cyan-700 hover:text-cyan-900 font-bold underline underline-offset-2"
                          >
                            <span>Need more {col.name}? Request Additional Stock</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section 3: Technical Specifications & Dispatch Urgency */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="mb-4">
              <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
                03. Company Technical Specification
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Machine Matching &amp; Delivery Schedule
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Production Machinery / Equipment Model
                </label>
                <select
                  value={pressModel}
                  onChange={(e) => setPressModel(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="Heidelberg Speedmaster XL 106-6+L">Heidelberg Speedmaster XL 106-6+L</option>
                  <option value="Komori Lithrone GL-40 (6 Color)">Komori Lithrone GL-40 (6 Color)</option>
                  <option value="KBA Rapida 105 / 106 PRO">KBA Rapida 105 / 106 PRO</option>
                  <option value="Manroland Roland 700 Evolution">Manroland Roland 700 Evolution</option>
                  <option value="RMGT 920 / 970 Offset Press">RMGT 920 / 970 Offset Press</option>
                  <option value="Generic 4-Color Sheetfed Offset">Generic 4-Color Sheetfed Offset</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Paper / Board Substrate
                </label>
                <select
                  value={substrate}
                  onChange={(e) => setSubstrate(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="Coated Art Paper (150 - 300 gsm)">Coated Art Paper (150 - 300 gsm)</option>
                  <option value="Folding Box Board (FBB / GC1 / GC2)">Folding Box Board (FBB / GC1 / GC2)</option>
                  <option value="Duplex Board (Grey Back)">Duplex Board (Grey Back)</option>
                  <option value="Uncoated Woodfree / Offset Bond">Uncoated Woodfree / Offset Bond</option>
                  <option value="Kraft Linerboard / Corrugated">Kraft Linerboard / Corrugated</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tack &amp; Viscosity Formulation
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Standard', 'High Tack', 'Soft Tack'] as const).map(grade => (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => setTackGrade(grade)}
                      className={`py-1.5 px-2 text-xs font-medium rounded-lg border text-center transition-colors ${
                        tackGrade === grade
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {grade}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Dispatch Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="Standard (48h)">Standard Road Freight (48h)</option>
                  <option value="Express Dispatch (24h)">Express Dedicated Carrier (24h)</option>
                  <option value="Emergency Press Run (Same-Day)">Emergency Same-Day Dedicated Courier</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Purchase Order / Company Job Ref
                </label>
                <input
                  type="text"
                  value={jobReference}
                  onChange={(e) => setJobReference(e.target.value)}
                  placeholder="e.g. PO-7712 or JOB-CATALOG-2026"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Company Dispatch / Handling Notes
                </label>
                <input
                  type="text"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="Special instructions (e.g. spray powder info, wash-up)"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>
          </section>

          {/* Section 4: Company Account */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
                  04. Company Account
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  Client Company &amp; Billing Entity
                </h2>
              </div>

              {!activeCustomer && registeredCompanies.length > 0 && (
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCustomerMode('existing');
                      handleSelectCustomer(selectedCustomerId || registeredCompanies[0].id);
                    }}
                    className={`px-3 py-1 font-medium rounded-md transition-colors ${
                      selectedCustomerMode === 'existing'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Saved Accounts
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCustomerMode('new')}
                    className={`px-3 py-1 font-medium rounded-md transition-colors ${
                      selectedCustomerMode === 'new'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    New Company Client
                  </button>
                </div>
              )}
            </div>

            {/* If Customer is Authenticated, Display Verified Company Card */}
            {activeCustomer ? (
              <div className="p-4 bg-cyan-50/70 border border-cyan-200 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-cyan-400 font-extrabold flex items-center justify-center text-sm shadow-xs">
                      {activeCustomer.companyName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {activeCustomer.companyName}
                      </p>
                      <p className="text-xs text-slate-600">
                        {activeCustomer.contactPerson} · <span className="font-mono">{activeCustomer.phone}</span>
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 self-start sm:self-auto">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified Company Account</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-cyan-200/80 text-xs text-slate-700">
                  <div>
                    <span className="text-[11px] text-slate-400 block">GSTIN Number</span>
                    <strong className="font-mono text-slate-900">{activeCustomer.gstNumber || 'Unregistered'}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Receiving Facility</span>
                    <strong className="text-slate-900">{deliveryAddress.plantOrUnitName || 'Main Facility'}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Billing Terms</span>
                    <strong className="text-slate-900">{activeCustomer.paymentTerms || 'Net 30 Days'}</strong>
                  </div>
                </div>
              </div>
            ) : (
              /* If Guest, Show Sign In Banner */
              onOpenCustomerAuth && (
                <div className="mb-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-600">
                    <strong className="text-slate-900 block">Have a registered company account?</strong>
                    <span>Sign in with mobile OTP to auto-fill delivery facilities and automatically link this order to your company history.</span>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenCustomerAuth}
                    className="px-3.5 py-1.5 text-xs font-bold text-cyan-800 bg-cyan-100 hover:bg-cyan-200 border border-cyan-300 rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0"
                  >
                    Company Sign In
                  </button>
                </div>
              )
            )}

            {!activeCustomer && (
              selectedCustomerMode === 'existing' && registeredCompanies.length > 0 ? (
                <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  Select Registered Company
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => handleSelectCustomer(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  {registeredCompanies.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} — {c.city}, {c.state} ({c.contactPerson})
                    </option>
                  ))}
                </select>

                <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-slate-200">
                  <div>
                    <span className="font-semibold text-slate-900">{effectiveCustomer.companyName}</span>
                    <p className="text-slate-500 mt-0.5">{effectiveCustomer.address}, {effectiveCustomer.city}, {effectiveCustomer.state} {effectiveCustomer.postalCode}</p>
                  </div>
                  <div className="sm:text-right shrink-0">
                    <span className="text-slate-500">Tax ID / GSTIN: {effectiveCustomer.gstNumber}</span>
                    <p className="font-medium text-slate-700 mt-0.5">Terms: {effectiveCustomer.paymentTerms}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={customCustomer.companyName}
                    onChange={(e) => {
                      const updated = { ...customCustomer, companyName: e.target.value };
                      setCustomCustomer(updated);
                      if (deliveryAddressMode === 'registered') {
                        setDeliveryAddress(prev => ({ ...prev, plantOrUnitName: e.target.value }));
                      }
                    }}
                    placeholder="e.g. Modern Packaging &amp; Print Pvt. Ltd."
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Officer *</label>
                  <input
                    type="text"
                    required
                    value={customCustomer.contactPerson}
                    onChange={(e) => {
                      const updated = { ...customCustomer, contactPerson: e.target.value };
                      setCustomCustomer(updated);
                      if (deliveryAddressMode === 'registered') {
                        setDeliveryAddress(prev => ({ ...prev, dockContactPerson: e.target.value }));
                      }
                    }}
                    placeholder="e.g. Ramesh Chandra (Operations Head)"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={customCustomer.phone}
                    onChange={(e) => {
                      const updated = { ...customCustomer, phone: e.target.value };
                      setCustomCustomer(updated);
                      if (deliveryAddressMode === 'registered') {
                        setDeliveryAddress(prev => ({ ...prev, dockContactPhone: e.target.value }));
                      }
                    }}
                    placeholder="+91 98000 00000"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email (for Invoices)</label>
                  <input
                    type="email"
                    value={customCustomer.email}
                    onChange={(e) => setCustomCustomer({ ...customCustomer, email: e.target.value })}
                    placeholder="accounts@company.in"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Billing Address</label>
                  <input
                    type="text"
                    value={customCustomer.address}
                    onChange={(e) => {
                      const updated = { ...customCustomer, address: e.target.value };
                      setCustomCustomer(updated);
                      if (deliveryAddressMode === 'registered') {
                        setDeliveryAddress(prev => ({ ...prev, streetAddress: e.target.value }));
                      }
                    }}
                    placeholder="Building, Plot Number, Industrial Area"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={customCustomer.city}
                    onChange={(e) => {
                      const updated = { ...customCustomer, city: e.target.value };
                      setCustomCustomer(updated);
                      if (deliveryAddressMode === 'registered') {
                        setDeliveryAddress(prev => ({ ...prev, city: e.target.value }));
                      }
                    }}
                    placeholder="e.g. New Delhi"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={customCustomer.gstNumber}
                    onChange={(e) => setCustomCustomer({ ...customCustomer, gstNumber: e.target.value })}
                    placeholder="e.g. 07AABCA8821D1ZQ"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </section>

          {/* Section 5: Orderer Delivery & Receiving Dock Address */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
                    05. Delivery Destination
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-100 text-cyan-800 uppercase">
                    Required for Dispatch
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                  <MapPin className="w-5 h-5 text-cyan-600" />
                  Orderer Delivery Address &amp; Receiving Dock
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Specify exactly where BR Agency freight carriers should deliver the ink cans, pails, or drums.
                </p>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => handleSetDeliveryMode('registered')}
                  className={`px-3 py-1 font-medium rounded-md transition-colors ${
                    deliveryAddressMode === 'registered'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Use Facility Address
                </button>
                <button
                  type="button"
                  onClick={() => handleSetDeliveryMode('alternate')}
                  className={`px-3 py-1 font-medium rounded-md transition-colors ${
                    deliveryAddressMode === 'alternate'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Alternate Plant Dock
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Delivery Facility / Plant / Unit Name *
                </label>
                <input
                  type="text"
                  required
                  value={deliveryAddress.plantOrUnitName}
                  onChange={(e) => updateDeliveryAddress('plantOrUnitName', e.target.value)}
                  placeholder="e.g. Apex Litho Unit 2 (Web Offset Division)"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Delivery Street Address / Plot No. / Industrial Area *
                </label>
                <input
                  type="text"
                  required
                  value={deliveryAddress.streetAddress}
                  onChange={(e) => updateDeliveryAddress('streetAddress', e.target.value)}
                  placeholder="e.g. Plot 44, Main Road, Naraina Industrial Area Phase-II"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nearby Landmark
                </label>
                <input
                  type="text"
                  value={deliveryAddress.landmark}
                  onChange={(e) => updateDeliveryAddress('landmark', e.target.value)}
                  placeholder="e.g. Near Container Depot / Opposite Substation 4"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={deliveryAddress.city}
                  onChange={(e) => updateDeliveryAddress('city', e.target.value)}
                  placeholder="e.g. New Delhi, Sivakasi, Mumbai, Bengaluru"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  State / Union Territory *
                </label>
                <input
                  type="text"
                  required
                  value={deliveryAddress.state}
                  onChange={(e) => updateDeliveryAddress('state', e.target.value)}
                  placeholder="e.g. Delhi, Tamil Nadu, Maharashtra, Karnataka"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Postal PIN Code (6 Digits) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={deliveryAddress.postalCode}
                  onChange={(e) => updateDeliveryAddress('postalCode', e.target.value)}
                  placeholder="e.g. 110028"
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dock Receiving Contact Person *
                </label>
                <input
                  type="text"
                  required
                  value={deliveryAddress.dockContactPerson}
                  onChange={(e) => updateDeliveryAddress('dockContactPerson', e.target.value)}
                  placeholder="e.g. Suresh Kumar (Stores / Receiving)"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dock Contact Mobile (Carrier driver will call before arrival) *
                </label>
                <input
                  type="tel"
                  required
                  value={deliveryAddress.dockContactPhone}
                  onChange={(e) => updateDeliveryAddress('dockContactPhone', e.target.value)}
                  placeholder="e.g. +91 98112 34891"
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Receiving Bay / Gate Number
                </label>
                <input
                  type="text"
                  value={deliveryAddress.gateOrBayNumber || ''}
                  onChange={(e) => updateDeliveryAddress('gateOrBayNumber', e.target.value)}
                  placeholder="e.g. Gate 2 (Heavy Loading Dock)"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preferred Delivery Window
                </label>
                <select
                  value={deliveryAddress.deliveryTimeSlot || '10:00 AM - 05:00 PM'}
                  onChange={(e) => updateDeliveryAddress('deliveryTimeSlot', e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
                >
                  <option value="09:00 AM - 01:00 PM">Morning (09:00 AM - 01:00 PM)</option>
                  <option value="01:00 PM - 06:00 PM">Afternoon (01:00 PM - 06:00 PM)</option>
                  <option value="10:00 AM - 05:00 PM">Standard Operating Hours (10:00 AM - 05:00 PM)</option>
                  <option value="Anytime (24-Hour Receiving Dock)">24-Hour Company Receiving Dock (Anytime)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unloading &amp; Special Handling Requirements
                </label>
                <input
                  type="text"
                  value={deliveryAddress.unloadingRequirements || ''}
                  onChange={(e) => updateDeliveryAddress('unloadingRequirements', e.target.value)}
                  placeholder="e.g. Forklift on site for pails &amp; drums, ground floor storage, call 30 mins before arrival"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* Section 6: Delivery Routing Options (Customer Freedom) */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
                    06. Dispatch Logistics &amp; Carrier Freedom
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-100 text-cyan-800 uppercase">
                    Customer's Choice
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                  <Truck className="w-5 h-5 text-cyan-600" />
                  Delivery &amp; Transporter Routing Method
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  You have full freedom to route your consignment via BR Agency dedicated transport, or directly route to popular delivery applications (Porter, Borzo, Delhivery, etc.) or send your own company driver.
                </p>
              </div>

              {deliveryMethod !== 'br_dedicated' && (
                <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] font-medium shrink-0 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Zero BR Shipping Fee (Customer Routed)</span>
                </div>
              )}
            </div>

            {/* 3 Main Routing Choices */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option A: BR Agency Dedicated Fleet */}
              <div
                onClick={() => setDeliveryMethod('br_dedicated')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  deliveryMethod === 'br_dedicated'
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs">BR Dedicated Fleet</span>
                  <span className={`w-2.5 h-2.5 rounded-full ${deliveryMethod === 'br_dedicated' ? 'bg-cyan-400' : 'bg-slate-300'}`} />
                </div>
                <p className={`text-[11px] leading-relaxed ${deliveryMethod === 'br_dedicated' ? 'text-slate-300' : 'text-slate-500'}`}>
                  In-house temperature-controlled freight vehicle. Fully insured and door-to-company delivery with BR logistics team.
                </p>
                <div className="mt-3 pt-2.5 border-t border-slate-200/40 text-[10px] font-mono flex items-center justify-between">
                  <span>Standard Freight</span>
                  <span className={deliveryMethod === 'br_dedicated' ? 'text-cyan-300 font-semibold' : 'text-slate-600'}>
                    {totalKg >= 300 ? 'FREE (≥300kg)' : `${pricingConfig.currencySymbol}${pricingConfig.shippingStandardFee}`}
                  </span>
                </div>
              </div>

              {/* Option B: Route to Other Delivery Apps */}
              <div
                onClick={() => setDeliveryMethod('external_app')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  deliveryMethod === 'external_app'
                    ? 'border-cyan-600 bg-cyan-50/80 ring-2 ring-cyan-600 text-slate-900 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-slate-900">Route to Delivery App</span>
                  <span className="text-[10px] font-mono font-bold bg-cyan-600 text-white px-1.5 py-0.5 rounded">
                    Popular
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Route through Porter, Borzo (WeFast), Delhivery, Shiprocket, or Dunzo. We stage your batch at Bay 2 ready for pickup.
                </p>
                <div className="mt-3 pt-2.5 border-t border-cyan-200 text-[10px] font-mono flex items-center justify-between text-cyan-900 font-semibold">
                  <span>BR Freight Fee</span>
                  <span className="text-emerald-700 font-bold">₹0.00 FREE</span>
                </div>
              </div>

              {/* Option C: Customer Pickup */}
              <div
                onClick={() => setDeliveryMethod('customer_pickup')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  deliveryMethod === 'customer_pickup'
                    ? 'border-amber-600 bg-amber-50/80 ring-2 ring-amber-600 text-slate-900 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-slate-900">Customer Self-Pickup</span>
                  <span className={`w-2.5 h-2.5 rounded-full ${deliveryMethod === 'customer_pickup' ? 'bg-amber-600' : 'bg-slate-300'}`} />
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Send your own company tempo, vehicle, or driver to pick up directly at Naraina Bay 2 dock.
                </p>
                <div className="mt-3 pt-2.5 border-t border-amber-200 text-[10px] font-mono flex items-center justify-between text-amber-900 font-semibold">
                  <span>BR Freight Fee</span>
                  <span className="text-emerald-700 font-bold">₹0.00 FREE</span>
                </div>
              </div>
            </div>

            {/* Sub-Panel: When External Delivery App is Selected */}
            {deliveryMethod === 'external_app' && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">
                      Select Your Preferred Delivery Application
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Click an app below to view vehicle recommendation and direct booking link.
                    </p>
                  </div>
                  <div className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-md bg-cyan-100 text-cyan-900 self-start sm:self-auto">
                    Recommended for {totalKg.toFixed(1)} kg: {recommendVehicleForWeight(totalKg, orderItems)}
                  </div>
                </div>

                {/* Delivery Apps Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {EXTERNAL_DELIVERY_APPS.filter(a => a.id !== 'own_fleet').map(app => {
                    const isSelected = selectedAppId === app.id;
                    return (
                      <div
                        key={app.id}
                        onClick={() => setSelectedAppId(app.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all text-xs ${
                          isSelected
                            ? `${app.colorScheme.bg} ${app.colorScheme.border} ring-2 ring-slate-900 shadow-2xs`
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900">{app.name}</span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                            isSelected ? app.colorScheme.accent : 'bg-slate-100 text-slate-600'
                          }`}>
                            {app.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-1">{app.tagline}</p>
                        <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                          <span>ETA: {app.typicalPickupEta}</span>
                          {app.bookingUrl && (
                            <a
                              href={app.bookingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-cyan-700 hover:text-cyan-900 font-semibold"
                            >
                              <span>Book</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Manifest Copy & Warehouse Pickup Preview Banner */}
                <div className="p-3.5 bg-white border border-cyan-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                      1-Click Manifest for {EXTERNAL_DELIVERY_APPS.find(a => a.id === selectedAppId)?.name || 'Delivery App'}
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Copies BR Naraina Pickup Hub Gate 2 address + your company delivery dock so you can paste into the app.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleCopyManifestFromForm}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                        manifestCopied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-cyan-50 text-cyan-900 border border-cyan-300 hover:bg-cyan-100'
                      }`}
                    >
                      {manifestCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Manifest Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-cyan-700" />
                          <span>Copy Manifest</span>
                        </>
                      )}
                    </button>

                    {EXTERNAL_DELIVERY_APPS.find(a => a.id === selectedAppId)?.bookingUrl && (
                      <a
                        href={EXTERNAL_DELIVERY_APPS.find(a => a.id === selectedAppId)!.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors inline-flex items-center gap-1 shadow-2xs"
                      >
                        <span>Open {EXTERNAL_DELIVERY_APPS.find(a => a.id === selectedAppId)!.name.split(' ')[0]}</span>
                        <ExternalLink className="w-3 h-3 text-cyan-400" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Optional Booking ID / Driver Info (If already booked) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Booking Ref / Trip ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={externalBookingRef}
                      onChange={(e) => setExternalBookingRef(e.target.value)}
                      placeholder="e.g. PRT-98124, WFT-5510"
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono focus:ring-1 focus:ring-slate-900 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">Can also be added later in Tracking</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Driver Name &amp; Phone (Optional)
                    </label>
                    <input
                      type="text"
                      value={externalDriverName}
                      onChange={(e) => setExternalDriverName(e.target.value)}
                      placeholder="Driver name / mobile"
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Assigned Vehicle Reg # (Optional)
                    </label>
                    <input
                      type="text"
                      value={externalVehicleNumber}
                      onChange={(e) => setExternalVehicleNumber(e.target.value)}
                      placeholder="e.g. DL-01-AB-1234"
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono uppercase focus:ring-1 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Panel: When Customer Self-Pickup is Selected */}
            {deliveryMethod === 'customer_pickup' && (
              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3 text-xs animate-in fade-in duration-200">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Building2 className="w-4 h-4 text-amber-700" />
                  <span>Self-Pickup Warehouse Instructions (Naraina Bay 2)</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Your consignment will be staged at <strong>{BR_AGENCY_PICKUP_HUB.hubName}</strong> ({BR_AGENCY_PICKUP_HUB.streetAddress}, {BR_AGENCY_PICKUP_HUB.dockGate}).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Driver / Company Representative Name
                    </label>
                    <input
                      type="text"
                      value={externalDriverName}
                      onChange={(e) => setExternalDriverName(e.target.value)}
                      placeholder="e.g. Ram Singh (Company Driver)"
                      className="w-full text-xs bg-white border border-amber-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Company Vehicle / Tempo Registration #
                    </label>
                    <input
                      type="text"
                      value={externalVehicleNumber}
                      onChange={(e) => setExternalVehicleNumber(e.target.value)}
                      placeholder="e.g. DL-04-E-5512 (Tata Ace)"
                      className="w-full text-xs bg-white border border-amber-200 rounded-lg px-2.5 py-1.5 font-mono uppercase focus:ring-1 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Order Summary & Instant Checkout Ticket (4 Cols) */}
        <div className="lg:col-span-4 sticky top-20">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                Commercial Order Ticket
              </h3>
              <span className="text-xs font-mono font-medium text-slate-500 tabular-nums">
                {totalKg.toFixed(1)} kg total
              </span>
            </div>

            {/* Selected Ink Items Breakdown */}
            <div className="py-4 space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {orderItems.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No ink colors selected. Toggle CMYK checkmarks to allocate volume.
                </div>
              ) : (
                orderItems.map((it) => (
                  <div key={it.color} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: INK_COLORS.find(c => c.name === it.color)?.hex }}
                      />
                      <span className="font-medium text-slate-800">
                        {it.color} ({activeSeries.name})
                      </span>
                      <span className="text-slate-400 font-mono">
                        · {it.containersCount}x {it.containerLabel}
                      </span>
                    </div>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {pricingConfig.currencySymbol}{it.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Volume Tier Indicator */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 my-4 text-xs">
              <div className="flex items-center justify-between text-slate-600 mb-1">
                <span className="flex items-center gap-1 font-medium">
                  <Scale className="w-3.5 h-3.5 text-slate-400" />
                  Bulk Discount Status
                </span>
                <span className="font-semibold text-slate-900 font-mono">
                  {discountPct > 0 ? `${discountPct}% APPLIED` : 'STANDARD RATE'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                {totalKg < 100 
                  ? `Add ${(100 - totalKg).toFixed(1)} kg more to unlock 5% volume discount.`
                  : totalKg < 250
                  ? `Qualified for 5% off! Add ${(250 - totalKg).toFixed(1)} kg for 10% off.`
                  : `Tier qualified for ${discountPct}% off enterprise company supply.`}
              </p>
            </div>

            {/* Delivery Destination Summary in Ticket */}
            <div className="p-3 bg-cyan-50/50 border border-cyan-100 rounded-lg my-3 text-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                <span className="flex items-center gap-1 text-cyan-800">
                  <MapPin className="w-3.5 h-3.5 text-cyan-600" />
                  Dispatch Destination
                </span>
                <span className="text-[10px] text-cyan-800 bg-white px-1.5 py-0.5 rounded border border-cyan-200 font-mono">
                  {deliveryAddress.city || 'Set City'}
                </span>
              </div>
              <p className="font-bold text-slate-900 text-xs truncate">
                {deliveryAddress.plantOrUnitName || effectiveCustomer.companyName}
              </p>
              <p className="text-slate-600 text-[11px] leading-tight">
                {deliveryAddress.streetAddress}, {deliveryAddress.city} {deliveryAddress.postalCode}
              </p>
              <div className="pt-1 border-t border-cyan-100/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span className="truncate">Dock: {deliveryAddress.dockContactPerson}</span>
                <span className="shrink-0">{deliveryAddress.dockContactPhone}</span>
              </div>
            </div>

            {/* Delivery Routing Choice in Ticket */}
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg my-2 text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium text-[11px]">
                <Truck className="w-3.5 h-3.5 text-slate-500" />
                <span>Routing:</span>
              </span>
              <span className="font-bold text-slate-900 text-[11px] font-mono">
                {deliveryMethod === 'br_dedicated'
                  ? 'BR Dedicated Fleet'
                  : deliveryMethod === 'customer_pickup'
                  ? 'Customer Pickup'
                  : EXTERNAL_DELIVERY_APPS.find(a => a.id === selectedAppId)?.name || 'Delivery App'}
              </span>
            </div>

            {/* Cost Math Breakdown */}
            <div className="space-y-2 py-4 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({totalKg.toFixed(1)} kg)</span>
                <span className="font-mono tabular-nums">{pricingConfig.currencySymbol}{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              {discountPct > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Volume Discount ({discountPct}%)</span>
                  <span className="font-mono tabular-nums">-{pricingConfig.currencySymbol}{discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Industrial GST ({pricingConfig.taxRatePct}% HSN 3215)</span>
                <span className="font-mono tabular-nums">{pricingConfig.currencySymbol}{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>
                  Transport ({deliveryMethod === 'br_dedicated' ? priority.split(' ')[0] : deliveryMethod === 'customer_pickup' ? 'Self-Pickup' : EXTERNAL_DELIVERY_APPS.find(a => a.id === selectedAppId)?.name.split(' ')[0] || 'App'})
                </span>
                <span className={`font-mono tabular-nums ${deliveryMethod !== 'br_dedicated' ? 'text-emerald-700 font-semibold' : ''}`}>
                  {deliveryMethod === 'br_dedicated' 
                    ? `${pricingConfig.currencySymbol}${shippingFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                    : '₹0.00 (Customer App)'}
                </span>
              </div>

              <div className="flex justify-between text-base font-bold text-slate-900 pt-3 border-t border-slate-200">
                <span>Total Amount</span>
                <span className="font-mono tabular-nums text-lg text-slate-900">
                  {pricingConfig.currencySymbol}{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Guarantee and terms note */}
            <div className="space-y-1.5 py-3 border-t border-slate-100 text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Lab QC Certificate & Spectro delta E &lt; 0.8 included</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-slate-400" />
                <span>Real-time GPS vehicle tracking upon dispatch</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Auto-generates commercial tax invoice</span>
              </div>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={orderItems.length === 0}
              className="w-full mt-4 py-3 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs tracking-wide rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Confirm & Issue Order</span>
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>
      </form>

      {/* Verified Client Reviews & Quality Experience Wall */}
      <section className="mt-16 pt-12 border-t border-slate-200">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-medium text-slate-500 mb-1">
              <span className="text-amber-600 font-bold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                Company Voice &amp; Audited Quality
              </span>
              <span aria-hidden="true">·</span>
              <span>ISO 12647-2 Compliance</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Customer Reviews &amp; Company Experience
            </h2>
            <p className="mt-1 text-xs text-slate-600 max-w-2xl leading-relaxed">
              Real feedback from commercial printing companies across India on dot sharpness, high-speed equipment stability, vacuum can integrity, and dedicated delivery transit.
            </p>
          </div>

          {/* Rating Metrics Card */}
          <div className="flex items-center gap-4 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs shrink-0">
            <div className="text-center pr-4 border-r border-slate-100">
              <span className="text-3xl font-extrabold font-mono text-slate-900 block leading-none">
                {averageRating}
              </span>
              <div className="flex items-center justify-center gap-0.5 my-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-[10px] text-slate-400 font-mono block">
                {allReviews.length} Verified Reviews
              </span>
            </div>

            <div className="space-y-1 text-[11px] text-slate-600 font-medium">
              <div className="flex items-center justify-between gap-4">
                <span>Ink Gloss &amp; Pigment:</span>
                <strong className="text-slate-900 font-mono">5.0 ★</strong>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Ink Setting &amp; Tack:</span>
                <strong className="text-slate-900 font-mono">4.9 ★</strong>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Delivery &amp; Courier:</span>
                <strong className="text-slate-900 font-mono">4.9 ★</strong>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Nitrogen Packaging:</span>
                <strong className="text-slate-900 font-mono">5.0 ★</strong>
              </div>
            </div>
          </div>
        </div>

        {/* If Customer has Delivered Orders - Action card */}
        {deliveredOrders.length > 0 && (
          <div className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-cyan-600" />
                <span>Your Delivered Ink Orders ({deliveredOrders.length})</span>
              </h3>
              <span className="text-[11px] text-slate-500">
                Click any order to submit or update your company review
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {deliveredOrders.map((ord) => {
                const hasFeedback = !!ord.feedback;
                return (
                  <div
                    key={ord.id}
                    className={`p-3.5 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                      hasFeedback
                        ? 'bg-white border-emerald-200 shadow-2xs'
                        : 'bg-white border-amber-200 hover:border-amber-300 shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          #{ord.orderNumber}
                        </span>
                        {hasFeedback ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Rated {ord.feedback?.rating}★</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 animate-pulse">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span>Pending Review</span>
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-600 mb-1">
                        {ord.items.length} CMYK items ({ord.totalKg} kg) · {ord.customer.companyName}
                      </p>

                      {hasFeedback && ord.feedback && (
                        <p className="text-[11px] text-slate-700 italic line-clamp-2 my-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          "{ord.feedback.comment}"
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setFeedbackOrder(ord);
                        setIsFeedbackModalOpen(true);
                      }}
                      className={`w-full mt-2.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                        hasFeedback
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                          : 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${hasFeedback ? 'text-amber-500 fill-amber-500' : 'text-amber-400 fill-amber-400'}`} />
                      <span>{hasFeedback ? 'Edit Company Review' : 'Rate This Delivery'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* If Active Orders exist but not yet marked delivered */}
        {orders.length > 0 && deliveredOrders.length === 0 && (
          <div className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-700">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                  Active Company Batches in Fulfillment ({orders.length})
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Client review submissions unlock automatically once the freight truck or delivery courier is checked into your receiving dock.
                </p>
              </div>
            </div>
            {onDeliverOrder && orders[0] && (
              <button
                type="button"
                onClick={() => onDeliverOrder(orders[0].id)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer"
                title="Mark dock delivery complete to enable feedback"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mark Delivery Complete for #{orders[0].orderNumber}</span>
              </button>
            )}
          </div>
        )}

        {/* If No Orders yet in system */}
        {orders.length === 0 && (
          <div className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3 text-xs text-slate-700">
            <div className="w-9 h-9 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 fill-cyan-600 text-cyan-600" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                Company Order Reviews &amp; Ratings
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Verified delivery ratings and reviews from registered companies will appear here once orders are dispatched and received.
              </p>
            </div>
          </div>
        )}

        {/* All Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {allReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all space-y-3"
            >
              <div className="space-y-2.5">
                {/* Header: Stars & Verified Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= rev.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>

                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Verified Company Order</span>
                  </span>
                </div>

                {/* Comment */}
                <p className="text-xs text-slate-700 leading-relaxed font-normal">
                  "{rev.comment}"
                </p>

                {/* Highlight Tags */}
                {rev.tags && rev.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {rev.tags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Review Author & Company Footer */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <div>
                    <span className="font-bold text-slate-900 block truncate max-w-[190px]">
                      {rev.companyName}
                    </span>
                    <span className="text-slate-500 block text-[10px]">
                      {rev.customerName} · {rev.pressModel || 'Company Equipment'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {new Date(rev.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                {/* Owner Reply if present */}
                {rev.ownerResponse && (
                  <div className="p-2.5 bg-cyan-50/70 border border-cyan-100 rounded-lg text-[10px] space-y-0.5">
                    <span className="font-bold text-cyan-900 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-cyan-700" />
                      <span>BR Agency Reply:</span>
                    </span>
                    <p className="text-slate-600 leading-snug">
                      {rev.ownerResponse.comment}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Customer Order Feedback Modal */}
      {feedbackOrder && (
        <OrderFeedbackModal
          order={feedbackOrder}
          isOpen={isFeedbackModalOpen}
          existingFeedback={feedbackOrder.feedback}
          onClose={() => {
            setIsFeedbackModalOpen(false);
            setFeedbackOrder(null);
          }}
          onSubmitFeedback={(orderId, feedback) => {
            if (onSubmitFeedback) {
              onSubmitFeedback(orderId, feedback);
            }
            setFeedbackOrder(prev => prev ? { ...prev, feedback } : null);
          }}
        />
      )}
    </div>
  );
};
