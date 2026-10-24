# Implementation Plan: Remove Demo Accounts & Display as Company

## Completed Tasks
- **Purged Demo Accounts & Prefill Buttons:**
  - Cleared `SAMPLE_CUSTOMERS` in `src/data/mockData.ts` to `[]` (purged hardcoded accounts such as Apex Litho, Horizon Packaging, Regent Fine Graphics).
  - Replaced hardcoded demo pre-fill shortcuts and demo preloaded values in `OrderIntakeForm.tsx` and `RequestStockView.tsx`.
  - Removed demo order simulation buttons (`handleCreateSampleDeliveredOrder` and "Simulate Delivered Order (Test Review Flow)").
  - Form now exclusively uses live logged-in company sessions (via mobile OTP) and genuine user-registered companies.

- **Terminology Shift from "Press" to "Company":**
  - **Navbar:** Subtitle updated to "Company Inks"; sign-out tooltip updated to "Sign out of company account".
  - **Order Intake Portal (`OrderIntakeForm.tsx`):**
    - "Press Inks" / "Press Supply" -> "Company Supply" / "Company Inks".
    - "03. Press Technical Specification" -> "03. Company Technical Specification".
    - "Press Machine Model" -> "Production Machinery / Equipment Model".
    - "Purchase Order / Press Job Ref" -> "Purchase Order / Company Job Ref".
    - "04. Press Account & Billing Identity" -> "04. Company Account".
    - "Pressroom Voice" & "Pressroom Experience" -> "Company Voice" & "Company Experience".
    - "Verified Press Run" -> "Verified Company Order".
    - "Active Press Batches in Fulfillment" -> "Active Company Batches in Fulfillment".
  - **Stock Requests (`RequestStockView.tsx`):**
    - "Critical Press Stoppage" -> "Critical Production Stoppage".
    - "Immediate Press Run" -> "Immediate Production Run".
    - Removed "Demo Fill: Pragati / Parksons" button pills.
    - Synchronized with active company customer profile.
  - **Real-Time Tracking (`TrackingView.tsx`):**
    - "Dispersion to Pressroom Dock" -> "Dispersion to Company Dock".
    - "Press Delivery Dock" -> "Company Delivery Dock".
    - "Your Pressroom Delivery Review" -> "Your Company Delivery Review".
    - Search placeholder updated to "Search Order #, Company, Batch, Tracking...".
  - **Delivery Feedback Modal (`OrderFeedbackModal.tsx`):**
    - "Overall Pressroom Satisfaction" -> "Overall Company Satisfaction".
    - "Press Run & Tack" -> "Print Run & Tack".
    - "Punctuality to press dock" -> "Punctuality to company dock".
    - "Pressroom Operator Comments" -> "Company Operator Comments".
    - "Submit Press Review" -> "Submit Company Review".
  - **Invoice Views & PDF Invoices (`InvoiceDetailModal.tsx`, `invoicePdfGenerator.ts`, `InvoiceView.tsx`):**
    - "BR Agency Press Inks" -> "BR Agency Company Inks".
    - "Printing Press Client" -> "Company Client".
    - "Press & Dispatch Standards" / "Press: ..." -> "Equipment & Dispatch Standards" / "Equipment: ...".
    - "Standard Press Supply Terms" -> "Standard Company Supply Terms".
  - **Inventory & Operations (`StockInventoryView.tsx`, `SupplierDashboard.tsx`, `CustomerPortalView.tsx`):**
    - "Startup Press Boxes" / "Poly-Lined Press Boxes" -> "Startup Company Boxes" / "Poly-Lined Company Boxes".
    - "Emergency Press Dispatch Reserve Bay" -> "Emergency Company Dispatch Reserve Bay".
    - "Real-time pressroom order queue" -> "Real-time company order queue".
    - "BR Agency Press Supplies" -> "BR Agency Company Supplies".
  - **Application Shell & Meta (`App.tsx`, `index.html`):**
    - "Printing Press Ink Supplies" footer and index.html headers replaced with "Company Ink Supplies".

## Verification
- Both `lint_applet` (`tsc --noEmit`) and `compile_applet` (Vite build) completed with 0 errors.
