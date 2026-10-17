import { 
  Order, 
  DeliveryRoutingDetails, 
  ExternalDeliveryAppId, 
  DeliveryAddress,
  OrderItem 
} from '../types/ink';

export interface ExternalAppOption {
  id: ExternalDeliveryAppId;
  name: string;
  tagline: string;
  badge: string;
  colorScheme: {
    bg: string;
    border: string;
    text: string;
    accent: string;
  };
  supportedVehicles: string[];
  bookingUrl: string;
  trackUrlPrefix?: string;
  typicalPickupEta: string;
  description: string;
}

export const BR_AGENCY_PICKUP_HUB = {
  hubName: 'BR Agency Central Formulation Plant & Dispatch Dock',
  streetAddress: 'Plot 44, Main Road, Naraina Industrial Area Phase-II',
  landmark: 'Near Container Depot / Opposite Substation 4',
  city: 'New Delhi',
  state: 'Delhi',
  postalCode: '110028',
  dockGate: 'Gate 2 (Heavy Loading & Logistics Bay)',
  dispatchContact: 'Suresh Kumar (Logistics & Fleet Dispatch)',
  dispatchPhone: '+91 98112 34891',
  pickupWindow: '08:30 AM - 07:00 PM (Mon - Sat)',
};

export const EXTERNAL_DELIVERY_APPS: ExternalAppOption[] = [
  {
    id: 'porter',
    name: 'Porter On-Demand',
    tagline: 'Mini Trucks, Tata Ace & 3-Wheelers',
    badge: 'Popular for Offset Inks',
    colorScheme: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      accent: 'bg-blue-600 text-white'
    },
    supportedVehicles: ['3-Wheeler (500kg)', 'Tata Ace (750kg)', 'Pickup 8ft (1.2T)', 'Tata 407 (2.5T)'],
    bookingUrl: 'https://porter.in/',
    trackUrlPrefix: 'https://porter.in/track/',
    typicalPickupEta: '15 - 25 mins',
    description: 'Instant local truck booking. Ideal for transporting 2.5kg cans, 15kg pails, and pressroom chemical consignments across city limits.'
  },
  {
    id: 'borzo',
    name: 'Borzo (WeFast)',
    tagline: 'Same-Day Express Van & Courier',
    badge: 'Fast Dispatch',
    colorScheme: {
      bg: 'bg-teal-50',
      border: 'border-teal-200',
      text: 'text-teal-900',
      accent: 'bg-teal-600 text-white'
    },
    supportedVehicles: ['Cargo Van (250kg)', 'Two-Wheeler Express (<15kg)', 'MPV Truck (500kg)'],
    bookingUrl: 'https://borzo.com/in',
    typicalPickupEta: '20 - 30 mins',
    description: 'On-demand express courier with pin-to-pin live courier tracking and signature confirmation upon delivery at pressroom dock.'
  },
  {
    id: 'delhivery',
    name: 'Delhivery Direct',
    tagline: 'Pan-India Surface & Express Air Cargo',
    badge: 'Interstate Hubs',
    colorScheme: {
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      text: 'text-rose-900',
      accent: 'bg-rose-600 text-white'
    },
    supportedVehicles: ['Express PTL (Part Truckload)', 'Air Express Cargo', 'Full Truckload FTL'],
    bookingUrl: 'https://www.delhivery.com/',
    trackUrlPrefix: 'https://www.delhivery.com/track/package/',
    typicalPickupEta: 'Scheduled Same-Day Slot',
    description: 'Direct door-to-press delivery across 18,000+ pin codes. Best for interstate shipments to industrial printing clusters (Sivakasi, Mumbai, Ahmedabad, Bengaluru).'
  },
  {
    id: 'shiprocket',
    name: 'Shiprocket B2B',
    tagline: 'Multi-Carrier Logistics Aggregator',
    badge: 'Multi-Carrier Rate',
    colorScheme: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-900',
      accent: 'bg-purple-600 text-white'
    },
    supportedVehicles: ['Surface Cargo', 'Dedicated Express Cargo', 'Heavy Freight'],
    bookingUrl: 'https://app.shiprocket.in/',
    typicalPickupEta: 'Scheduled Pickup Window',
    description: 'Route via BlueDart, DTDC, XpressBees, or Rivigo with automated B2B e-way bill generation and commercial invoice reconciliation.'
  },
  {
    id: 'vrl',
    name: 'VRL / TCI Heavy Freight',
    tagline: 'Industrial Heavy Road Transport',
    badge: 'Best for 200kg Drums',
    colorScheme: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      accent: 'bg-amber-600 text-white'
    },
    supportedVehicles: ['Hydraulic Tailgate Truck', 'Heavy Pallet Transport', '20ft Multi-Axle'],
    bookingUrl: 'https://www.vrlgroup.in/',
    typicalPickupEta: 'Daily Scheduled Dispatch',
    description: 'Specialized chemical & ink road transport with pneumatic drum clamps and hydraulic unloading at recipient printing plants.'
  },
  {
    id: 'dunzo',
    name: 'Dunzo / Quick Runner',
    tagline: 'Emergency Spot-Color & Small Cans (<10kg)',
    badge: 'Emergency Run',
    colorScheme: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-900',
      accent: 'bg-emerald-600 text-white'
    },
    supportedVehicles: ['Two-Wheeler Delivery Partner'],
    bookingUrl: 'https://www.dunzo.com/',
    typicalPickupEta: '10 - 15 mins',
    description: 'Emergency press stoppage dispatch for 1.0kg tins or 2.5kg cans of spot inks when a commercial press is idling.'
  },
  {
    id: 'own_fleet',
    name: 'Self-Pickup / Customer Vehicle',
    tagline: 'Direct Dispatch to Customer Driver',
    badge: 'No Shipping Cost',
    colorScheme: {
      bg: 'bg-slate-100',
      border: 'border-slate-300',
      text: 'text-slate-900',
      accent: 'bg-slate-900 text-white'
    },
    supportedVehicles: ['Company Van', 'Tata Ace', 'Customer Pickup', 'Pressroom Tempo'],
    bookingUrl: '',
    typicalPickupEta: 'Immediate Staging at Bay 2',
    description: 'Send your printing press company vehicle or authorized driver directly to our Naraina dispatch bay with purchase order reference.'
  },
  {
    id: 'other',
    name: 'Other Transporter / 3P Carrier',
    tagline: 'Custom Courier or Local Transporter',
    badge: 'Custom Routing',
    colorScheme: {
      bg: 'bg-zinc-50',
      border: 'border-zinc-200',
      text: 'text-zinc-900',
      accent: 'bg-zinc-700 text-white'
    },
    supportedVehicles: ['Any Approved Commercial Vehicle'],
    bookingUrl: '',
    typicalPickupEta: 'As Coordinated',
    description: 'Specify your designated transport agency, LR booking number, or preferred city goods transporter.'
  }
];

/**
 * Calculates the ideal commercial vehicle based on consignment weight and packages
 */
export function recommendVehicleForWeight(totalKg: number, items: OrderItem[]): string {
  const hasDrum = items.some(it => it.containerId === 'drum_200kg');

  if (hasDrum || totalKg > 750) {
    return 'Pickup 8ft / Tata 407 (With Pallet / Drum Clamp)';
  }
  if (totalKg > 200) {
    return 'Tata Ace (Chota Hathi) / 750 kg Mini Truck';
  }
  if (totalKg > 20) {
    return '3-Wheeler Auto Cargo / Electric Loader (500 kg)';
  }
  return 'Two-Wheeler / Express Courier (<20 kg)';
}

/**
 * Generates an easy-to-copy delivery manifest text block for customer to paste into Porter, Borzo, Delhivery, etc.
 */
export function generateDeliveryManifest(order: Order, routing?: DeliveryRoutingDetails): string {
  const effectiveRouting = routing || order.deliveryRouting;
  const hub = effectiveRouting?.pickupWarehouse || BR_AGENCY_PICKUP_HUB;
  const dest = order.deliveryAddress || order.customer.deliveryAddress;
  const itemsList = order.items
    .map(it => `• ${it.containersCount}x ${it.containerLabel} (${it.color} - ${it.seriesId === 'BIO_SPEED' ? 'BIO SPEED' : 'BIO PACK'}): ${it.totalKg} kg`)
    .join('\n');

  return `================================================
BR AGENCY - COMMERCIAL INK DISPATCH MANIFEST
================================================
ORDER REF: ${order.orderNumber}
INVOICE REF: ${order.invoiceId}
TOTAL CONSIGNMENT WEIGHT: ${order.totalKg.toFixed(1)} kg
RECOMMENDED VEHICLE: ${effectiveRouting?.recommendedVehicle || recommendVehicleForWeight(order.totalKg, order.items)}
ROUTING SERVICE: ${effectiveRouting?.providerName || 'Customer App Routing'}
${effectiveRouting?.externalBookingRef ? `BOOKING / TRIP ID: ${effectiveRouting.externalBookingRef}\n` : ''}
------------------------------------------------
[1] PICKUP LOCATION (WAREHOUSE DOCK):
Facility: ${hub.hubName}
Address: ${hub.streetAddress}
Area: ${hub.city}, ${hub.state} - ${hub.postalCode}
Dispatch Dock: ${hub.dockGate}
Contact Person: ${hub.dispatchContact}
Dispatch Phone: ${hub.dispatchPhone}
Pickup Window: ${hub.pickupWindow}

------------------------------------------------
[2] DELIVERY DESTINATION (PRINTING PRESS DOCK):
Receiving Plant: ${dest?.plantOrUnitName || order.customer.companyName}
Address: ${dest?.streetAddress || order.customer.address}
${dest?.landmark ? `Landmark: Near ${dest.landmark}\n` : ''}City/State: ${dest?.city || order.customer.city}, ${dest?.state || order.customer.state} - ${dest?.postalCode || order.customer.postalCode}
Dock Bay: ${dest?.gateOrBayNumber || 'Pressroom Receiving Bay'}
Dock In-charge: ${dest?.dockContactPerson || order.customer.contactPerson}
Dock Phone: ${dest?.dockContactPhone || order.customer.phone}
Receiving Timing: ${dest?.deliveryTimeSlot || 'Standard Operating Hours'}

------------------------------------------------
[3] ITEM SPECIFICATIONS & PACKAGING:
${itemsList}

HANDLING INSTRUCTIONS:
• Commercial vegetable-based printing inks. Non-hazardous.
• Keep upright. Do not stack pails higher than 3 layers.
• Moisture and direct sunlight sensitive.
================================================`;
}

/**
 * Copies the manifest to clipboard with browser fallback
 */
export async function copyDeliveryManifestToClipboard(order: Order, routing?: DeliveryRoutingDetails): Promise<boolean> {
  const text = generateDeliveryManifest(order, routing);
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      console.warn('Clipboard write failed, trying fallback', e);
    }
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Fallback clipboard copy failed', err);
    return false;
  }
}
