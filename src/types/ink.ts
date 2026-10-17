export type InkSeriesId = 'BIO_SPEED' | 'BIO_PACK';

export type InkColorCode = 'Cyan' | 'Magenta' | 'Yellow' | 'Black';

export type ContainerSizeId = 'tin_1kg' | 'box_2kg' | 'can_2_5kg' | 'box_5kg' | 'pail_15kg' | 'drum_200kg';

export interface ContainerOption {
  id: ContainerSizeId;
  label: string;
  shortLabel: string;
  kgPerUnit: number;
  description: string;
  recommendedFor: string;
}

export interface InkColorSpec {
  code: 'C' | 'M' | 'Y' | 'K';
  name: InkColorCode;
  hex: string;
  bgClass: string;
  textClass: string;
  accentBorder: string;
  pigmentCode: string;
  pigmentName: string;
  hsnCode: string;
  bioSpeedPriceKg: number;
  bioPackPriceKg: number;
}

export interface InkSeriesDetail {
  id: InkSeriesId;
  name: string;
  category: string;
  subtitle: string;
  description: string;
  keyFeatures: string[];
  baseFormula: string;
  vegetableOilPct: string;
  moshMoahStatus: string;
  optimalPresses: string[];
  specs: {
    tackValue: string;
    viscosity: string;
    settingTime: string;
    rubResistance: string;
    glossLevel: string;
    ductStability: string;
    vocContent: string;
  };
}

export interface OrderItem {
  seriesId: InkSeriesId;
  color: InkColorCode;
  containerId: ContainerSizeId;
  containerLabel: string;
  containersCount: number;
  kgPerUnit: number;
  totalKg: number;
  unitPricePerKg: number;
  totalPrice: number;
}

export interface DeliveryAddress {
  plantOrUnitName: string;
  streetAddress: string;
  landmark: string;
  city: string;
  state: string;
  postalCode: string;
  dockContactPerson: string;
  dockContactPhone: string;
  gateOrBayNumber?: string;
  unloadingRequirements?: string;
  deliveryTimeSlot?: string;
}

export interface CustomerProfile {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  gstNumber: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  pressModel: string;
  paymentTerms: 'Immediate' | 'Net 15' | 'Net 30' | 'COD';
  deliveryAddress?: DeliveryAddress;
}

export type OrderStatus = 
  | 'received' 
  | 'formulation' 
  | 'qc_passed' 
  | 'packed' 
  | 'dispatched' 
  | 'delivered';

export interface TrackingMilestone {
  status: OrderStatus;
  title: string;
  description: string;
  timestamp: string;
  location?: string;
  completed: boolean;
  notes?: string;
}

export interface OrderTrackingInfo {
  carrier: string;
  trackingNumber: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  currentLocation: string;
  estimatedArrival: string;
  batchNumber: string;
  qcCertificateId: string;
  qcPassedDate: string;
  qcInspectedBy: string;
  testedTack: string;
  testedFineness: string;
  milestones: TrackingMilestone[];
}

export type DeliveryRoutingMethod = 'br_dedicated' | 'external_app' | 'customer_pickup';

export type ExternalDeliveryAppId = 
  | 'porter' 
  | 'borzo' 
  | 'delhivery' 
  | 'shiprocket' 
  | 'vrl' 
  | 'dunzo' 
  | 'own_fleet' 
  | 'other';

export interface DeliveryRoutingDetails {
  method: DeliveryRoutingMethod;
  providerId: ExternalDeliveryAppId;
  providerName: string;
  externalBookingRef?: string;
  driverName?: string;
  driverPhone?: string;
  vehicleNumber?: string;
  vehicleType?: string;
  bookingStatus?: 'unassigned' | 'booked' | 'driver_en_route' | 'picked_up' | 'delivered';
  pickupWarehouse: {
    hubName: string;
    streetAddress: string;
    city: string;
    state: string;
    postalCode: string;
    dockGate: string;
    dispatchContact: string;
    dispatchPhone: string;
    pickupWindow: string;
  };
  recommendedVehicle: string;
  directAppUrl?: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customer: CustomerProfile;
  deliveryAddress?: DeliveryAddress;
  items: OrderItem[];
  subtotal: number;
  discountPct: number;
  discountAmount: number;
  taxPct: number;
  taxAmount: number;
  shippingFee: number;
  totalAmount: number;
  totalKg: number;
  priority: 'Standard (48h)' | 'Express Dispatch (24h)' | 'Emergency Press Run (Same-Day)';
  pressJobRef?: string;
  notes?: string;
  status: OrderStatus;
  tracking: OrderTrackingInfo;
  deliveryRouting?: DeliveryRoutingDetails;
  invoiceId: string;
  paymentStatus: 'unpaid' | 'paid' | 'partial' | 'overdue';
  paidAt?: string;
  paymentMethod?: string;
  feedback?: OrderFeedback;
}

export interface OrderFeedback {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  companyName: string;
  rating: number; // 1 to 5 stars
  subRatings?: {
    inkQuality: number; // 1 to 5
    deliverySpeed: number; // 1 to 5
    packaging: number; // 1 to 5
    pressPerformance: number; // 1 to 5
  };
  tags: string[];
  comment: string;
  submittedAt: string;
  pressModel?: string;
  ownerResponse?: {
    comment: string;
    respondedAt: string;
  };
}

export interface InvoicePaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: 'Bank Wire / RTGS' | 'UPI / Instant Pay' | 'Company Cheque' | 'Credit Account';
  referenceNumber: string;
  note?: string;
}

export interface SeriesPricing {
  Cyan: number;
  Magenta: number;
  Yellow: number;
  Black: number;
}

export interface VolumeDiscountTier {
  minKg: number;
  discountPct: number;
}

export interface PricingConfig {
  currencySymbol: string;
  taxRatePct: number;
  shippingStandardFee: number;
  shippingExpressFee: number;
  shippingEmergencyFee: number;
  bioSpeed: SeriesPricing;
  bioPack: SeriesPricing;
  volumeDiscounts: VolumeDiscountTier[];
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  orderNumber: string;
  issueDate: string;
  dueDate: string;
  customer: CustomerProfile;
  deliveryAddress?: DeliveryAddress;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  taxRate: number;
  shippingFee: number;
  totalAmount: number;
  paidAmount: number;
  status: 'unpaid' | 'paid' | 'partial' | 'overdue';
  paymentTerms: string;
  bankDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    ifscOrSwift: string;
    branch: string;
  };
  payments: InvoicePaymentRecord[];
}

export type UserRole = 'customer' | 'owner';

export interface StockItem {
  id: string;
  seriesId: InkSeriesId;
  color: InkColorCode;
  containerId: ContainerSizeId;
  availableUnits: number;
  minThresholdUnits: number;
  lastUpdated: string;
}

export interface StockRequest {
  id: string;
  requestNumber: string;
  createdAt: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  plantOrUnitName?: string;
  seriesId: InkSeriesId;
  color: InkColorCode;
  requestedKg: number;
  containerId: ContainerSizeId;
  neededByDate: string;
  urgency: 'Normal (Standard Delivery)' | 'Urgent (Next 48 Hours)' | 'Critical Press Stoppage (Emergency)';
  status: 'pending' | 'in_formulation' | 'fulfilled' | 'declined';
  notes?: string;
  ownerResponse?: string;
}

