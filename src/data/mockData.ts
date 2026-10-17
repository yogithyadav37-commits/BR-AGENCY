import { 
  InkSeriesDetail, 
  InkColorSpec, 
  ContainerOption, 
  CustomerProfile, 
  Order, 
  Invoice, 
  PricingConfig, 
  StockItem, 
  StockRequest,
  OrderFeedback 
} from '../types/ink';

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  currencySymbol: '₹',
  taxRatePct: 18,
  shippingStandardFee: 650,
  shippingExpressFee: 1200,
  shippingEmergencyFee: 2400,
  bioSpeed: {
    Cyan: 420.00,
    Magenta: 460.00,
    Yellow: 440.00,
    Black: 320.00
  },
  bioPack: {
    Cyan: 480.00,
    Magenta: 520.00,
    Yellow: 490.00,
    Black: 360.00
  },
  volumeDiscounts: [
    { minKg: 100, discountPct: 5 },
    { minKg: 250, discountPct: 10 },
    { minKg: 500, discountPct: 15 }
  ]
};

export const INK_SERIES: Record<'BIO_SPEED' | 'BIO_PACK', InkSeriesDetail> = {
  BIO_SPEED: {
    id: 'BIO_SPEED',
    name: 'BIO SPEED',
    category: 'Commercial Sheetfed Offset System',
    subtitle: 'High-speed, ultra-fast setting vegetable-oil based process ink',
    description: 'Engineered specifically for high-productivity commercial sheetfed lithography presses. Delivers ultra-sharp dot reproduction, instant ink setting, and superior mechanical rub resistance without spray powder over-reliance.',
    baseFormula: '100% Bio-Renewable Vegetable Esters & Refined Soya Alkyd',
    vegetableOilPct: '82% Renewable Content',
    moshMoahStatus: 'Heavy-metal free, low aromatic hydrocarbon',
    optimalPresses: ['Heidelberg Speedmaster XL 106', 'Komori Lithrone GL 40', 'KBA Rapida 105/106', 'Manroland Evolution 700'],
    keyFeatures: [
      'Fast setting in 6–9 minutes on coated art papers',
      'Minimal blanket tack build-up in 18,000+ imp/hr press runs',
      'Overnight duct-fresh formulation (no skinning in fountain)',
      'Exceptional gloss retention on silk, matt, and gloss stocks'
    ],
    specs: {
      tackValue: '11.0 - 12.2 (400 rpm / 32°C)',
      viscosity: '45 - 52 Pa·s @ 25°C',
      settingTime: '6 - 9 minutes on coated paper',
      rubResistance: 'Grade 4.8 / 5.0 (ASTM D5264)',
      glossLevel: '86 - 92 GU @ 60°',
      ductStability: 'Non-skinning > 48 hours',
      vocContent: '< 1.5% VOC'
    }
  },
  BIO_PACK: {
    id: 'BIO_PACK',
    name: 'BIO PACK',
    category: 'Packaging & Food-Carton Offset System',
    subtitle: 'Low-migration, low-odor mineral-oil-free folding carton ink',
    description: 'Specially formulated for pharmaceutical, cosmetic, and secondary food outer packaging cartons. Free from mineral oils (MOSH/MOAH compliant), offering high ink density, excellent trapping, and compliance with EuPIA guidelines.',
    baseFormula: 'Modified Plant Rosin & High-Purity Bio-Ester Polymers',
    vegetableOilPct: '88% Bio-Based Carbon Content',
    moshMoahStatus: 'Certified Mineral Oil Free (MOSH < 0.1%, MOAH < 0.1%)',
    optimalPresses: ['Packaging Sheetfed Presses', 'Folding Boxboard Cartons', 'Duplex Board', 'Direct-Contact Outer Packaging'],
    keyFeatures: [
      'Certified MOSH/MOAH-free compliance for food outer packaging',
      'Virtually odor-free pressroom environment and cured substrate',
      'Outstanding rub & scuff resistance for folding carton die-cutting',
      'High resistance against UV varnishing, water-based coatings & lamination'
    ],
    specs: {
      tackValue: '9.8 - 11.0 (400 rpm / 32°C)',
      viscosity: '48 - 56 Pa·s @ 25°C',
      settingTime: '8 - 12 minutes on folding boxboard',
      rubResistance: 'Grade 4.9 / 5.0 (Sutherland Rub Test)',
      glossLevel: '82 - 88 GU @ 60°',
      ductStability: 'Duct-open > 36 hours',
      vocContent: '< 0.8% VOC'
    }
  }
};

export const INK_COLORS: InkColorSpec[] = [
  {
    code: 'C',
    name: 'Cyan',
    hex: '#009FE3',
    bgClass: 'bg-[#009FE3]',
    textClass: 'text-[#009FE3]',
    accentBorder: 'border-[#009FE3]',
    pigmentCode: 'P.B. 15:3',
    pigmentName: 'Phthalocyanine Blue Beta',
    hsnCode: '32151900',
    bioSpeedPriceKg: 420.00,
    bioPackPriceKg: 480.00
  },
  {
    code: 'M',
    name: 'Magenta',
    hex: '#E6007E',
    bgClass: 'bg-[#E6007E]',
    textClass: 'text-[#E6007E]',
    accentBorder: 'border-[#E6007E]',
    pigmentCode: 'P.R. 57:1',
    pigmentName: 'Lithol Rubine Calcium Salt',
    hsnCode: '32151900',
    bioSpeedPriceKg: 460.00,
    bioPackPriceKg: 520.00
  },
  {
    code: 'Y',
    name: 'Yellow',
    hex: '#FFD700',
    bgClass: 'bg-[#EAB308]',
    textClass: 'text-[#CA8A04]',
    accentBorder: 'border-[#EAB308]',
    pigmentCode: 'P.Y. 12 / P.Y. 13',
    pigmentName: 'Permanent Yellow Diarylide',
    hsnCode: '32151900',
    bioSpeedPriceKg: 440.00,
    bioPackPriceKg: 490.00
  },
  {
    code: 'K',
    name: 'Black',
    hex: '#1D1D1B',
    bgClass: 'bg-[#1D1D1B]',
    textClass: 'text-[#1D1D1B]',
    accentBorder: 'border-[#1D1D1B]',
    pigmentCode: 'P.Bk. 7',
    pigmentName: 'Furnace Carbon Black High Jetness',
    hsnCode: '32151100',
    bioSpeedPriceKg: 320.00,
    bioPackPriceKg: 360.00
  }
];

export const CONTAINER_OPTIONS: ContainerOption[] = [
  {
    id: 'box_2kg',
    label: '2.0 kg Press Box (Minimum Size)',
    shortLabel: '2.0 kg Box (Min)',
    kgPerUnit: 2.0,
    description: 'Minimum packaging format: Handy 2.0 kg corrugated press box with airtight liner. Lightweight and easy to handle for startup print shops.',
    recommendedFor: 'Startup litho runs, agile job changes & daily minimum presswork'
  },
  {
    id: 'can_2_5kg',
    label: '2.5 kg Vacuum Can',
    shortLabel: '2.5 kg Can',
    kgPerUnit: 2.5,
    description: 'Standard pressroom vacuum-sealed steel can. Shipped 4 cans per master carton (10 kg).',
    recommendedFor: 'Medium sheetfed jobs & standard daily press runs'
  },
  {
    id: 'box_5kg',
    label: '5.0 kg Press Box',
    shortLabel: '5.0 kg Box',
    kgPerUnit: 5.0,
    description: 'Rigid 5.0 kg press box with inner barrier liner, ideal for growing production without heavy handling.',
    recommendedFor: 'Continuous job batches, folding cartons & daily production'
  },
  {
    id: 'pail_15kg',
    label: '15.0 kg Pressroom Pail',
    shortLabel: '15 kg Pail',
    kgPerUnit: 15.0,
    description: 'Industrial heavy-gauge steel pail with clamp ring lid and rubber airtight gasket.',
    recommendedFor: 'High-volume packaging lines & commercial publication runs'
  }
];

export const SAMPLE_CUSTOMERS: CustomerProfile[] = [
  {
    id: 'CUST-001',
    companyName: 'Apex Litho Printers Pvt. Ltd.',
    contactPerson: 'Rajesh Sharma (Head of Press Operations)',
    phone: '+91 98112 34890',
    email: 'press@apexlitho.in',
    gstNumber: '07AABCA8821D1ZQ',
    address: 'Plot 44, Naraina Industrial Area Phase-II',
    city: 'New Delhi',
    state: 'Delhi',
    postalCode: '110028',
    pressModel: 'Heidelberg Speedmaster XL 106-6+L',
    paymentTerms: 'Net 30',
    deliveryAddress: {
      plantOrUnitName: 'Apex Litho Unit 2 (Web Offset Division)',
      streetAddress: 'Plot 44, Main Road, Naraina Industrial Area Phase-II',
      landmark: 'Near Container Depot / Opposite Substation 4',
      city: 'New Delhi',
      state: 'Delhi',
      postalCode: '110028',
      dockContactPerson: 'Suresh Kumar (Receiving In-charge)',
      dockContactPhone: '+91 98112 34891',
      gateOrBayNumber: 'Gate 2 (Heavy Vehicle Dock)',
      unloadingRequirements: 'Forklift on site for pails and drums. Delivery between 9 AM - 5 PM.',
      deliveryTimeSlot: '10:00 AM - 05:00 PM'
    }
  },
  {
    id: 'CUST-002',
    companyName: 'Horizon Packaging & Cartons Ltd.',
    contactPerson: 'Senthil Nathan (Procurement Director)',
    phone: '+91 94431 87244',
    email: 'supply@horizonpackaging.co.in',
    gstNumber: '33AAACH4920E1ZP',
    address: '120 Satchiyapuram Road, Printing Cluster',
    city: 'Sivakasi',
    state: 'Tamil Nadu',
    postalCode: '626123',
    pressModel: 'Komori Lithrone GL-40 (6 Color UV/Conventional)',
    paymentTerms: 'Net 30',
    deliveryAddress: {
      plantOrUnitName: 'Horizon Central Converting & Packaging Plant',
      streetAddress: '120 Satchiyapuram Road, Industrial Printing Cluster',
      landmark: 'Near Sivakasi Master Printers Association Bhavan',
      city: 'Sivakasi',
      state: 'Tamil Nadu',
      postalCode: '626123',
      dockContactPerson: 'P. Murugesan (Stores Officer)',
      dockContactPhone: '+91 94431 87250',
      gateOrBayNumber: 'Bay 3 - Raw Chemical Stores',
      unloadingRequirements: 'Low-odor packaging cleanroom dock. Hydraulic pallet jack required.',
      deliveryTimeSlot: '09:00 AM - 06:00 PM'
    }
  },
  {
    id: 'CUST-003',
    companyName: 'Regent Fine Graphics & Publishing LLP',
    contactPerson: 'Vikram Joshi (Plant Manager)',
    phone: '+91 98201 34911',
    email: 'plant@regentgraphics.in',
    gstNumber: '27AABCR1029F1ZT',
    address: 'Unit 8, Sun Mill Compound, Lower Parel West',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400013',
    pressModel: 'KBA Rapida 105-5',
    paymentTerms: 'Net 15',
    deliveryAddress: {
      plantOrUnitName: 'Regent Print Operations & Litho Studio',
      streetAddress: 'Unit 8, Sun Mill Compound, S.B. Marg, Lower Parel West',
      landmark: 'Behind Phoenix Mills Complex',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400013',
      dockContactPerson: 'Ganesh Shinde (Pressroom Foreman)',
      dockContactPhone: '+91 98201 34915',
      gateOrBayNumber: 'Rear Service Dock A',
      unloadingRequirements: 'Strict entry timing: No heavy trucks between 8 AM - 11 AM due to local traffic.',
      deliveryTimeSlot: '12:00 PM - 04:00 PM'
    }
  },
  {
    id: 'CUST-004',
    companyName: 'Sterling Food Carton & Labels Pvt. Ltd.',
    contactPerson: 'Ananya Rao (Quality & Sourcing Lead)',
    phone: '+91 99012 77890',
    email: 'materials@sterlingcartons.in',
    gstNumber: '29AABCS9938G1ZR',
    address: 'Plot 35, 4th Phase, Peenya Industrial Area',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560058',
    pressModel: 'Manroland Roland 700 HiPrint',
    paymentTerms: 'Immediate',
    deliveryAddress: {
      plantOrUnitName: 'Sterling High-Hygiene Food Carton Facility',
      streetAddress: 'Plot 35, 4th Phase, Peenya Industrial Area',
      landmark: 'Near Peenya Metro Station, Gate 2',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560058',
      dockContactPerson: 'Ramesh Gowda (Logistics Receiving)',
      dockContactPhone: '+91 99012 77895',
      gateOrBayNumber: 'Dock 4 (Clean Room Quarantine Bay)',
      unloadingRequirements: 'MOSH/MOAH certificate copy must accompany dispatch consignment.',
      deliveryTimeSlot: '08:30 AM - 05:30 PM'
    }
  }
];

// All orders and invoices start completely clean with 0 records
export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_INVOICES: Invoice[] = [];

export const INITIAL_STOCK_INVENTORY: StockItem[] = [
  // BIO SPEED - Commercial Sheetfed (can_2_5kg, pail_15kg, drum_200kg, tin_1kg)
  { id: 'BIO_SPEED_Cyan_can_2_5kg', seriesId: 'BIO_SPEED', color: 'Cyan', containerId: 'can_2_5kg', availableUnits: 28, minThresholdUnits: 10, lastUpdated: '2026-10-13 08:30' },
  { id: 'BIO_SPEED_Magenta_can_2_5kg', seriesId: 'BIO_SPEED', color: 'Magenta', containerId: 'can_2_5kg', availableUnits: 20, minThresholdUnits: 10, lastUpdated: '2026-10-13 08:30' },
  { id: 'BIO_SPEED_Yellow_can_2_5kg', seriesId: 'BIO_SPEED', color: 'Yellow', containerId: 'can_2_5kg', availableUnits: 16, minThresholdUnits: 8, lastUpdated: '2026-10-13 08:30' },
  { id: 'BIO_SPEED_Black_can_2_5kg', seriesId: 'BIO_SPEED', color: 'Black', containerId: 'can_2_5kg', availableUnits: 45, minThresholdUnits: 12, lastUpdated: '2026-10-13 08:30' },

  { id: 'BIO_SPEED_Cyan_pail_15kg', seriesId: 'BIO_SPEED', color: 'Cyan', containerId: 'pail_15kg', availableUnits: 8, minThresholdUnits: 4, lastUpdated: '2026-10-12 16:00' },
  { id: 'BIO_SPEED_Magenta_pail_15kg', seriesId: 'BIO_SPEED', color: 'Magenta', containerId: 'pail_15kg', availableUnits: 6, minThresholdUnits: 4, lastUpdated: '2026-10-12 16:00' },
  { id: 'BIO_SPEED_Yellow_pail_15kg', seriesId: 'BIO_SPEED', color: 'Yellow', containerId: 'pail_15kg', availableUnits: 7, minThresholdUnits: 4, lastUpdated: '2026-10-12 16:00' },
  { id: 'BIO_SPEED_Black_pail_15kg', seriesId: 'BIO_SPEED', color: 'Black', containerId: 'pail_15kg', availableUnits: 14, minThresholdUnits: 5, lastUpdated: '2026-10-12 16:00' },

  // BIO SPEED - 2.0 kg Press Boxes (Startup Friendly - Minimum Packaging Size)
  { id: 'BIO_SPEED_Cyan_box_2kg', seriesId: 'BIO_SPEED', color: 'Cyan', containerId: 'box_2kg', availableUnits: 25, minThresholdUnits: 10, lastUpdated: '2026-10-14 09:00' },
  { id: 'BIO_SPEED_Magenta_box_2kg', seriesId: 'BIO_SPEED', color: 'Magenta', containerId: 'box_2kg', availableUnits: 20, minThresholdUnits: 10, lastUpdated: '2026-10-14 09:00' },
  { id: 'BIO_SPEED_Yellow_box_2kg', seriesId: 'BIO_SPEED', color: 'Yellow', containerId: 'box_2kg', availableUnits: 18, minThresholdUnits: 8, lastUpdated: '2026-10-14 09:00' },
  { id: 'BIO_SPEED_Black_box_2kg', seriesId: 'BIO_SPEED', color: 'Black', containerId: 'box_2kg', availableUnits: 35, minThresholdUnits: 12, lastUpdated: '2026-10-14 09:00' },

  // BIO SPEED - 5.0 kg Press Boxes (Continuous Press Runs)
  { id: 'BIO_SPEED_Cyan_box_5kg', seriesId: 'BIO_SPEED', color: 'Cyan', containerId: 'box_5kg', availableUnits: 16, minThresholdUnits: 6, lastUpdated: '2026-10-14 09:00' },
  { id: 'BIO_SPEED_Magenta_box_5kg', seriesId: 'BIO_SPEED', color: 'Magenta', containerId: 'box_5kg', availableUnits: 12, minThresholdUnits: 6, lastUpdated: '2026-10-14 09:00' },
  { id: 'BIO_SPEED_Yellow_box_5kg', seriesId: 'BIO_SPEED', color: 'Yellow', containerId: 'box_5kg', availableUnits: 10, minThresholdUnits: 5, lastUpdated: '2026-10-14 09:00' },
  { id: 'BIO_SPEED_Black_box_5kg', seriesId: 'BIO_SPEED', color: 'Black', containerId: 'box_5kg', availableUnits: 24, minThresholdUnits: 8, lastUpdated: '2026-10-14 09:00' },

  // BIO PACK - Packaging & Folding Carton
  { id: 'BIO_PACK_Cyan_can_2_5kg', seriesId: 'BIO_PACK', color: 'Cyan', containerId: 'can_2_5kg', availableUnits: 18, minThresholdUnits: 8, lastUpdated: '2026-10-13 08:30' },
  { id: 'BIO_PACK_Magenta_can_2_5kg', seriesId: 'BIO_PACK', color: 'Magenta', containerId: 'can_2_5kg', availableUnits: 14, minThresholdUnits: 8, lastUpdated: '2026-10-13 08:30' },
  { id: 'BIO_PACK_Yellow_can_2_5kg', seriesId: 'BIO_PACK', color: 'Yellow', containerId: 'can_2_5kg', availableUnits: 12, minThresholdUnits: 6, lastUpdated: '2026-10-13 08:30' },
  { id: 'BIO_PACK_Black_can_2_5kg', seriesId: 'BIO_PACK', color: 'Black', containerId: 'can_2_5kg', availableUnits: 32, minThresholdUnits: 10, lastUpdated: '2026-10-13 08:30' },

  { id: 'BIO_PACK_Cyan_pail_15kg', seriesId: 'BIO_PACK', color: 'Cyan', containerId: 'pail_15kg', availableUnits: 10, minThresholdUnits: 4, lastUpdated: '2026-10-12 16:00' },
  { id: 'BIO_PACK_Magenta_pail_15kg', seriesId: 'BIO_PACK', color: 'Magenta', containerId: 'pail_15kg', availableUnits: 8, minThresholdUnits: 4, lastUpdated: '2026-10-12 16:00' },
  { id: 'BIO_PACK_Yellow_pail_15kg', seriesId: 'BIO_PACK', color: 'Yellow', containerId: 'pail_15kg', availableUnits: 9, minThresholdUnits: 4, lastUpdated: '2026-10-12 16:00' },
  { id: 'BIO_PACK_Black_pail_15kg', seriesId: 'BIO_PACK', color: 'Black', containerId: 'pail_15kg', availableUnits: 16, minThresholdUnits: 5, lastUpdated: '2026-10-12 16:00' },

  // BIO PACK - 2.0 kg Press Boxes (Startup Friendly - Minimum Packaging Size)
  { id: 'BIO_PACK_Cyan_box_2kg', seriesId: 'BIO_PACK', color: 'Cyan', containerId: 'box_2kg', availableUnits: 22, minThresholdUnits: 8, lastUpdated: '2026-10-14 09:00' },
  { id: 'BIO_PACK_Magenta_box_2kg', seriesId: 'BIO_PACK', color: 'Magenta', containerId: 'box_2kg', availableUnits: 16, minThresholdUnits: 8, lastUpdated: '2026-10-14 09:00' },
  { id: 'BIO_PACK_Yellow_box_2kg', seriesId: 'BIO_PACK', color: 'Yellow', containerId: 'box_2kg', availableUnits: 15, minThresholdUnits: 6, lastUpdated: '2026-10-14 09:00' },
  { id: 'BIO_PACK_Black_box_2kg', seriesId: 'BIO_PACK', color: 'Black', containerId: 'box_2kg', availableUnits: 30, minThresholdUnits: 10, lastUpdated: '2026-10-14 09:00' },

  // BIO PACK - 5.0 kg Press Boxes (Continuous Press Runs)
  { id: 'BIO_PACK_Cyan_box_5kg', seriesId: 'BIO_PACK', color: 'Cyan', containerId: 'box_5kg', availableUnits: 14, minThresholdUnits: 5, lastUpdated: '2026-10-14 09:00' },
  { id: 'BIO_PACK_Magenta_box_5kg', seriesId: 'BIO_PACK', color: 'Magenta', containerId: 'box_5kg', availableUnits: 10, minThresholdUnits: 5, lastUpdated: '2026-10-14 09:00' },
  { id: 'BIO_PACK_Yellow_box_5kg', seriesId: 'BIO_PACK', color: 'Yellow', containerId: 'box_5kg', availableUnits: 8, minThresholdUnits: 4, lastUpdated: '2026-10-14 09:00' },
  { id: 'BIO_PACK_Black_box_5kg', seriesId: 'BIO_PACK', color: 'Black', containerId: 'box_5kg', availableUnits: 20, minThresholdUnits: 6, lastUpdated: '2026-10-14 09:00' },
];

export const INITIAL_STOCK_REQUESTS: StockRequest[] = [
  {
    id: 'req_01',
    requestNumber: 'REQ-4810',
    createdAt: '2026-10-12 14:20',
    companyName: 'Universal Packaging & Cartons Ltd.',
    contactPerson: 'Sunil Malhotra',
    phone: '+91 98114 90218',
    email: 'purchase@universalpack.in',
    city: 'Noida Sector 63',
    plantOrUnitName: 'Plant Unit 2 (Mono Carton Line)',
    seriesId: 'BIO_PACK',
    color: 'Cyan',
    requestedKg: 120,
    containerId: 'pail_15kg',
    neededByDate: '2026-10-16',
    urgency: 'Urgent (Next 48 Hours)',
    status: 'pending',
    notes: 'Starting high-volume export pharma carton job on Bobst 6-color press. Need 8 pails of 15kg urgently.',
  },
  {
    id: 'req_02',
    requestNumber: 'REQ-4809',
    createdAt: '2026-10-11 10:15',
    companyName: 'Saraswati Commercial Offset Printers',
    contactPerson: 'Rajesh Sharma',
    phone: '+91 98290 44102',
    email: 'press@saraswatiprint.com',
    city: 'Okhla Phase-2, New Delhi',
    plantOrUnitName: 'Main Offset Press Hall',
    seriesId: 'BIO_SPEED',
    color: 'Black',
    requestedKg: 100,
    containerId: 'box_5kg',
    neededByDate: '2026-10-18',
    urgency: 'Normal (Standard Delivery)',
    status: 'in_formulation',
    notes: '20 boxes of 5kg for litho press runs. Need batch analysis report for viscosity.',
    ownerResponse: 'Batch scheduled on 3-Roll Mill #2 for milling on 14th Oct.'
  }
];

export const SAMPLE_CUSTOMER_REVIEWS: OrderFeedback[] = [
  {
    id: 'rev_01',
    orderId: 'sample_ord_01',
    orderNumber: 'ORD-2026-7840',
    customerName: 'Suresh Kumar',
    companyName: 'Apex Litho Press Pvt. Ltd.',
    rating: 5,
    subRatings: {
      inkQuality: 5,
      deliverySpeed: 5,
      packaging: 5,
      pressPerformance: 5
    },
    tags: ['Sharp Dot Reproduction', 'Fast Setting & Drying', 'Flawless Delta E Match', 'Airtight Nitrogen Sealing'],
    comment: 'Flawless dot reproduction on 250 gsm coated art board. The fast setting allowed rapid 2nd side turn-around without spray powder dusting. Delivered to our dock within 3 hours via Porter mini truck!',
    submittedAt: '2026-10-12T14:30:00Z',
    pressModel: 'Heidelberg Speedmaster XL 106-6+L',
    ownerResponse: {
      comment: 'Thank you Suresh! Glad our BIO SPEED pigment grind delivered the delta E precision you needed on the Heidelberg run.',
      respondedAt: '2026-10-12T16:00:00Z'
    }
  },
  {
    id: 'rev_02',
    orderId: 'sample_ord_02',
    orderNumber: 'ORD-2026-7714',
    customerName: 'Dinesh Agarwal',
    companyName: 'Packwell Carton & Mono Box Industries',
    rating: 5,
    subRatings: {
      inkQuality: 5,
      deliverySpeed: 4,
      packaging: 5,
      pressPerformance: 5
    },
    tags: ['Zero Set-off / Rub Proof', 'Perfect Viscosity & Tack', 'Secure Packaging'],
    comment: 'Phenomenal rub-resistance on pharma cartons with BIO PACK series. Nitrogen sealed 15kg pails arrived intact and clean. Viscosity remained completely stable across 45,000 continuous sheets.',
    submittedAt: '2026-10-10T11:20:00Z',
    pressModel: 'Komori Lithrone GL-40 (6 Color)'
  },
  {
    id: 'rev_03',
    orderId: 'sample_ord_03',
    orderNumber: 'ORD-2026-7589',
    customerName: 'Harish Mehta',
    companyName: 'Universal Print Systems',
    rating: 5,
    subRatings: {
      inkQuality: 5,
      deliverySpeed: 5,
      packaging: 5,
      pressPerformance: 4
    },
    tags: ['Punctual Dock Delivery', 'Sharp Dot Reproduction', 'Responsive Logistics Partner'],
    comment: 'We routed delivery via Borzo express courier and it arrived right into our Pressroom Bay 2 within 40 minutes. The black density (D > 2.05) on uncoated bond was outstanding.',
    submittedAt: '2026-10-08T09:15:00Z',
    pressModel: 'KBA Rapida 105 / 106 PRO'
  }
];

