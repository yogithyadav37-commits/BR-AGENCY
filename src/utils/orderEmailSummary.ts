import { Order, PricingConfig } from '../types/ink';
import { INK_SERIES, DEFAULT_PRICING_CONFIG } from '../data/mockData';

export interface GeneratedEmailSummary {
  subject: string;
  body: string;
  fullText: string;
}

/**
 * Formats a monetary value with comma separators and two decimals
 */
export function formatCurrencyINR(amount: number, symbol: string = '₹'): string {
  return `${symbol}${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Generates a clean, professional, text-based email summary of an order
 * formatted for sending to printing press clients, plant managers, or billing teams.
 */
export function generateOrderEmailSummary(
  order: Order,
  currencySymbol: string = '₹',
  senderCompanyName: string = 'BR Agency'
): GeneratedEmailSummary {
  const customer = order.customer;
  const delivery = order.deliveryAddress;
  const tracking = order.tracking;

  const orderDateFormatted = new Date(order.createdAt).toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const subject = `[${senderCompanyName}] Order Confirmation #${order.orderNumber} - ${customer.companyName} (${order.totalKg} kg Ink Supplies)`;

  // Format Items Breakdown
  const itemsText = order.items
    .map((item, idx) => {
      const seriesName = INK_SERIES[item.seriesId]?.name || item.seriesId;
      const unitPriceStr = formatCurrencyINR(item.unitPricePerKg, currencySymbol);
      const totalItemStr = formatCurrencyINR(item.totalPrice, currencySymbol);
      return [
        `  ${idx + 1}. ${seriesName} Process Ink - ${item.color.toUpperCase()}`,
        `     Package: ${item.containersCount} x ${item.containerLabel} (${item.totalKg} kg total)`,
        `     Rate   : ${unitPriceStr} / kg`,
        `     Amount : ${totalItemStr}`,
      ].join('\n');
    })
    .join('\n\n');

  // Delivery Address Section
  let deliverySection = '';
  if (delivery) {
    deliverySection = [
      '============================================================',
      'CONSIGNEE DELIVERY ADDRESS & RECEIVING DOCK',
      '============================================================',
      `Facility / Plant : ${delivery.plantOrUnitName || customer.companyName}`,
      `Street Address   : ${delivery.streetAddress}${delivery.landmark ? ` (Landmark: ${delivery.landmark})` : ''}`,
      `City, State, PIN : ${delivery.city}, ${delivery.state} - ${delivery.postalCode}`,
      `Dock Officer     : ${delivery.dockContactPerson} (Tel: ${delivery.dockContactPhone})`,
      delivery.gateOrBayNumber ? `Dock Bay / Gate  : ${delivery.gateOrBayNumber}` : null,
      delivery.deliveryTimeSlot ? `Delivery Window  : ${delivery.deliveryTimeSlot}` : null,
      delivery.unloadingRequirements ? `Unloading Notes  : ${delivery.unloadingRequirements}` : null,
      '',
    ]
      .filter((line) => line !== null)
      .join('\n');
  } else {
    deliverySection = [
      '============================================================',
      'CONSIGNEE DELIVERY ADDRESS & RECEIVING DOCK',
      '============================================================',
      `Deliver To       : ${customer.companyName}`,
      `Address          : ${customer.address}, ${customer.city}, ${customer.state} - ${customer.postalCode}`,
      `Contact Person   : ${customer.contactPerson} (Tel: ${customer.phone})`,
      '',
    ].join('\n');
  }

  // Quality Assurance Section
  let qcSection = '';
  if (tracking?.qcCertificateId) {
    qcSection = [
      '============================================================',
      'QUALITY CONTROL & CERTIFICATE OF ANALYSIS',
      '============================================================',
      `QC Certificate No: ${tracking.qcCertificateId}`,
      `QC Inspector     : ${tracking.qcInspectedBy}`,
      `QC Passed Date   : ${tracking.qcPassedDate}`,
      `Tested Tack Value: ${tracking.testedTack}`,
      `Tested Fineness  : ${tracking.testedFineness}`,
      'Standards        : ISO 2846-1 / ISO 12647-2 Compliant (Bio-Renewable Soya Base)',
      '',
    ].join('\n');
  }

  // Transport & Dispatch Telemetry Section
  let logisticsSection = '';
  if (tracking?.carrier) {
    logisticsSection = [
      '============================================================',
      'LOGISTICS & DISPATCH TELEMETRY',
      '============================================================',
      `Carrier Partner  : ${tracking.carrier}`,
      `Waybill / Consign: ${tracking.trackingNumber}`,
      `Vehicle Number   : ${tracking.vehicleNumber}`,
      `Driver Contact   : ${tracking.driverName} (Tel: ${tracking.driverPhone})`,
      `Current Status   : ${tracking.currentLocation}`,
      `Estimated Arrival: ${tracking.estimatedArrival}`,
      '',
    ].join('\n');
  }

  // Financial Breakdown
  const subtotalStr = formatCurrencyINR(order.subtotal, currencySymbol);
  const discountStr = formatCurrencyINR(order.discountAmount, currencySymbol);
  const taxableVal = order.subtotal - order.discountAmount;
  const taxableValStr = formatCurrencyINR(taxableVal, currencySymbol);
  const taxStr = formatCurrencyINR(order.taxAmount, currencySymbol);
  const freightStr = formatCurrencyINR(order.shippingFee, currencySymbol);
  const totalAmountStr = formatCurrencyINR(order.totalAmount, currencySymbol);

  const body = [
    `Dear ${customer.contactPerson || 'Purchasing Manager'},`,
    '',
    `Thank you for ordering with ${senderCompanyName}. This is an official confirmation and shipment dispatch advice for your commercial offset printing ink supplies.`,
    '',
    '============================================================',
    'ORDER & DISPATCH SUMMARY',
    '============================================================',
    `Order Number     : ${order.orderNumber}`,
    `Order Date       : ${orderDateFormatted}`,
    `Tax Invoice Ref  : ${order.invoiceId}`,
    `Batch Number     : ${tracking?.batchNumber || 'Assigned at Blending'}`,
    `Service Priority : ${order.priority}`,
    order.pressJobRef ? `Press Job Ref    : ${order.pressJobRef}` : null,
    `Fulfillment Stage: ${order.status.toUpperCase().replace('_', ' ')}`,
    '',
    '============================================================',
    'CLIENT & BILLING ENTITY',
    '============================================================',
    `Company Name     : ${customer.companyName}`,
    `Contact Person   : ${customer.contactPerson}`,
    `Phone            : ${customer.phone}`,
    `Email            : ${customer.email}`,
    `GSTIN Number     : ${customer.gstNumber || 'Not Specified'}`,
    `Registered Plant : ${customer.address}, ${customer.city}, ${customer.state} - ${customer.postalCode}`,
    `Press Platform   : ${customer.pressModel}`,
    '',
    deliverySection,
    '============================================================',
    'ORDERED INK ITEMS BREAKDOWN',
    '============================================================',
    itemsText,
    '',
    `Total Net Volume : ${order.totalKg} kg (${order.items.length} CMYK line item${order.items.length > 1 ? 's' : ''})`,
    '',
    '============================================================',
    `COMMERCIAL TAX SUMMARY (${currencySymbol})`,
    '============================================================',
    `Items Subtotal          : ${subtotalStr.padStart(16)}`,
    order.discountAmount > 0
      ? `Volume Tier Discount   : -${discountStr.padStart(15)} (${order.discountPct}% off)`
      : null,
    order.discountAmount > 0
      ? `Taxable Assessment Value: ${taxableValStr.padStart(16)}`
      : null,
    `GST / Commercial Tax   : ${taxStr.padStart(16)} (${order.taxPct}% rate)`,
    `Freight & Dedicated Hub : ${freightStr.padStart(16)}`,
    '------------------------------------------------------------',
    `GRAND TOTAL             : ${totalAmountStr.padStart(16)}`,
    '------------------------------------------------------------',
    `Payment Status          : ${order.paymentStatus.toUpperCase()}`,
    `Payment Terms           : ${customer.paymentTerms || 'Net 30 Days'}`,
    '',
    qcSection,
    logisticsSection,
    '============================================================',
    'BANK SETTLEMENT DETAILS (FOR RTGS / NEFT / IMPS)',
    '============================================================',
    `Beneficiary Name : ${senderCompanyName} Commercial Inks Pvt. Ltd.`,
    'Bank Name        : HDFC Bank',
    'Account Number   : 50200088923411',
    'IFSC Code        : HDFC0001244',
    'Branch           : Sector 58, Ballabgarh Industrial Area, Faridabad',
    '',
    '============================================================',
    'DISPATCH & OPERATIONS CONTACT',
    '============================================================',
    `Central Dispatch Desk : +91 98101 22903 / +91 98112 34890`,
    `Operations Email      : orders@bragency-inks.com`,
    `Chemical Hub Plant    : Sector 58, Ballabgarh Industrial Area, Faridabad, Haryana - 121004`,
    '',
    `Thank you for your valued partnership!`,
    `${senderCompanyName} Commercial Press Chemical Team`,
  ]
    .filter((line) => line !== null)
    .join('\n');

  const fullText = `Subject: ${subject}\n\n${body}`;

  return {
    subject,
    body,
    fullText,
  };
}

/**
 * Copies the order email summary to clipboard with dual-strategy fallback:
 * 1. navigator.clipboard.writeText
 * 2. Document execCommand fallback for strict iframe environments
 */
export async function copyOrderEmailToClipboard(
  order: Order,
  currencySymbol: string = '₹',
  senderCompanyName: string = 'BR Agency'
): Promise<boolean> {
  const summary = generateOrderEmailSummary(order, currencySymbol, senderCompanyName);
  const textToCopy = summary.fullText;

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(textToCopy);
      return true;
    }
  } catch {
    // If permission was denied or clipboard API unavailable, fallback below
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = textToCopy;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}
