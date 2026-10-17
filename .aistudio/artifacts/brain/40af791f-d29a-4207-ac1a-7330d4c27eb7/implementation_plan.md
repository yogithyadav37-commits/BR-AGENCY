# Customer Authentication & Dedicated Self-Service Portal

Provide print shop customers with a seamless, passwordless Mobile Phone + OTP sign-in/sign-up experience and a dedicated self-service portal to track orders, download invoices, review billing statements, and manage delivery addresses without losing context.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and user experience decisions have been aligned based on user feedback:

- **Confirmed Decision (Mobile OTP Auth)**: Customers authenticate using their **Mobile Phone Number** with an interactive 6-digit OTP verification flow (including an instant test-fill code `123456` and 1-click customer presets so testing is instant and frictionless).
- **Confirmed Decision (Persistent Device Session)**: Once signed in, the customer's session persists permanently in browser storage on that device (`localStorage`) until explicit logout.
- **Confirmed Decision (Full Customer Portal)**: Includes dedicated sections for **Live Order Tracking**, **Tax Invoices & Billing Statements**, and **Saved Delivery Addresses & GST Profile**.
- **Confirmed Decision (Seamless Order Intake Integration)**: When logged in, the existing ink order form automatically loads the customer's company name, GST, contact person, and receiving dock instructions into the requisition form.

---

## 1. Overview & Core Concept

- **What It Does**: Enables litho and packaging print shop clients to log in via phone number + OTP, register their company details once, and access a dedicated "My Account & Orders" portal. Customers can view active press ink shipments, inspect historical tax invoices, verify payment receipts, view billing ledgers, and re-order prior ink recipes with a single click.
- **Target Audience**: Pressroom managers, litho packaging procurement heads, and printing press owners purchasing CMYK Bio-Speed / Bio-Pack offset inks.
- **Key Value**: Eliminates the frustration of searching for misplaced invoices or order tracking numbers. Print shops can verify delivery dates, check outstanding balances, and initiate repeat orders in seconds.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Sign-In / Sign-Up Flow**:
   - Customer clicks **"Sign In / Portal"** in the top navigation bar or checkout prompt.
   - Enters 10-digit mobile number. If new, provides Company Name, Contact Person, and GSTIN.
   - Enters the 6-digit verification code (with a 1-tap "Fill Demo Code `123456`" affordance for rapid preview).
   - Customer profile is created/retrieved and saved permanently to browser storage.

2. **Dedicated Customer Portal View**:
   - **Header Card**: Shows Company Name, GSTIN, verified mobile number, pressroom machinery type, and quick sign-out affordance.
   - **Metric Strip**: Key account metrics using tabular numbers: Total Orders Placed, Pending Dispatches, Paid Invoices, and Outstanding Ledger Balance.
   - **Segmented Portal Tabs**:
     - *Orders & Tracking*: List of all historical orders with ink formulation cards, batch weight, container type, delivery timeline, consignment number, and "Order Again" button.
     - *Invoices & Billing*: Searchable table of GST invoices with issue dates, HSN code breakdown, payment status (Paid / Partial / Unpaid), payment mode references, and printable/downloadable invoice slips.
     - *Plant Address Book*: Saved delivery locations with unloading dock specifications (forklift availability, gate numbers, dock contacts).

3. **Smart Checkout Integration**:
   - When a logged-in customer opens the **Order Inks** tab, their company details, GSTIN, plant delivery address, and receiving contacts are automatically populated.
   - Any order placed is immediately linked to their `customerId` and appears instantly in their portal history.

### Visual Identity & Theme
- **Theme**: Industrial precision, dark slate background accents (`#0F172A`), crisp white cards (`#FFFFFF`), cyan primary actions (`#0891B2`), and warm status indicators.
- **Anti-Slop Restraint**: Zero decorative glowing badges; metadata styled with subtle inline typographic separators (`·` / `/`); single-line controls; clean tabular figures (`font-mono tabular-nums`) for currency (INR `₹`), weights (`kg`), and timestamps.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Mobile Phone Number + OTP over Password Auth**
  - *Chosen Approach*: 10-digit mobile number + simulated 6-digit SMS verification with instant demo codes and pre-configured customer accounts.
  - *Why*: Print press procurement managers in India predominantly operate via mobile/WhatsApp; passwords are frequently forgotten, while mobile OTP is fast, realistic, and passwordless.
  - *Alternatives Considered*: Username/Password (cumbersome for factory floor reorders).

- **Decision 2: Persistent Local Session Storage**
  - *Chosen Approach*: Persist authenticated state and account updates in `localStorage` under `bragency_customer_session`.
  - *Why*: Ensures customers remain logged in across browser refreshes and subsequent visits on the same device without needing re-authentication every session, directly satisfying the user's specification.

- **Decision 3: Unified Data Bridge between Portal and Existing Orders/Invoices**
  - *Chosen Approach*: Match customer orders and invoices via `customerId` / `customerPhone`. Existing mock invoices and orders for Apex Litho (`CUST-001`) and Horizon Packaging (`CUST-002`) seamlessly map to their demo phone profiles (`+91 98112 34890` and `+91 94431 87244`), while new registered numbers instantly receive their own empty-state with new order linkage.

---

## 4. Technical Architecture & Component Hierarchy

```
┌────────────────────────────────────────────────────────────────────────┐
│                                App.tsx                                 │
│  State: activeCustomer, orders, invoices, stockInventory, pricing      │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
       ┌───────────┴──────────┐            ┌─────────┴─────────┐
       ▼                      ▼            ▼                   ▼
┌──────────────┐      ┌──────────────┐ ┌───────────────┐ ┌─────────────────┐
│  Navbar.tsx  │      │CustomerAuth- │ │ Customer-     │ │ OrderIntake-    │
│ (Login/Logout│      │ Modal.tsx    │ │ PortalView.tsx│ │ Form.tsx        │
│  Account btn)│      │(Phone + OTP) │ │(Orders, Invc, │ │(Autofills from  │
└──────────────┘      └──────────────┘ │ Addresses)    │ │ activeCustomer) │
                                       └───────────────┘ └─────────────────┘
```

### Component & State Mapping

1. **`CustomerAuthModal.tsx`**:
   - Phone step: validates 10-digit Indian mobile number; detects existing customer or prompts for new company profile.
   - OTP step: 6-digit PIN input with simulated SMS delivery countdown and 1-click test code autofill.
   - Demo Switcher: 1-click buttons to log in as Apex Litho Printers or Horizon Packaging.

2. **`CustomerPortalView.tsx`**:
   - Filter bar: search orders and invoices by Order ID, PO number, or invoice number.
   - Order history cards with status timeline (Pending -> Blending -> Dispatched -> Delivered).
   - Invoices table with direct PDF/print modal preview, subtotal, 12% GST, and payment status.
   - Address book editor to add/edit secondary press delivery plants.

3. **`Navbar.tsx` & `App.tsx`**:
   - Adds `'customer_portal'` tab accessible from the header when logged in or as a quick link.
   - Top right shows customer name with a user icon and dropdown/portal link.

---

## 5. Verification Plan

1. **Automated Testing**:
   - Run `compile_applet` and `lint_applet` to confirm clean TypeScript compilation with zero type errors.
2. **User Flow Validation**:
   - Test phone login with existing demo customer (`+91 98112 34890` - Apex Litho) -> verify orders and invoices load immediately.
   - Test new customer registration with a new phone number -> verify company details persist and empty state is clean.
   - Place a new order while logged in -> verify company details auto-fill and the new order appears in their Customer Portal history.
   - Verify refresh persistence: ensure user remains logged in on page reload.
