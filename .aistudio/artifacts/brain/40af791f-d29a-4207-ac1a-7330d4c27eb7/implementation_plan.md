# Implementation Plan: UI Immersive Overhaul, B2B Commercial Simplicity & Inverted Theme

## Overview
Elevated the BR Agency Ink Supplies portal to deliver a tangible, authentic, and clean commercial printing ink ordering experience. Inverted the theme to deep obsidian industrial dark mode with high-contrast tactile CMYK accents, synchronized with HTML `.dark` class, and equipped with an instant header theme inverter toggle.

---

## Completed Tasks

### 1. Navigation & Brand Identity (`Navbar.tsx`)
- **Wordmark & Tactile Swatch Bar**: Clean, robust typographic wordmark `BR AGENCY` paired with a physical 4-color CMYK process ribbon (`#0099FF`, `#E6007A`, `#FFD700`, `#111827`) and quiet unboxed `· Inks` designation.
- **Removed Static Mode Pills**: Replaced prominent colored pill badges (`Owner Mode Active` / `Company Ordering View`) with quiet, professional text labels.
- **Unboxed Tabular Counts**: Replaced badge pill counters for `Request Stock` and `Stock Inventory` with crisp monospace numbers `(${count})`.
- **Theme Inverter Toggle**: Added quick Invert Theme control button (☀️ / 🌙) directly in the navigation actions bar.

### 2. Inverted Theme Engine (`src/index.css`, `App.tsx`, `index.html`)
- **Default Inverted Theme (Dark)**: Configured deep obsidian canvas (`#090D16`), structured card surfaces (`#121826`), refined borders (`#1F2B3F`), and high-contrast light typography (`#F8FAFC`).
- **Input & Form Theming**: Styled all text inputs, steppers, select menus, and modals for high legibility in dark mode.
- **Persistent Session**: Synchronized `theme` state with `localStorage` and `html.dark` class to avoid flash of light mode.
- **Vibrant CMYK & Accent Tints**: Calibrated high-clarity Cyan, Magenta, Yellow, Emerald, and Amber indicators against dark surfaces.

### 3. Commercial Order Intake Header (`OrderIntakeForm.tsx`)
- **Immersive Industrial Panel**: Dark slate header (`bg-slate-900 border-slate-800`) highlighting ISO 12647-2 & 2846-1 quality compliance.
- **Physical CMYK Pigment Swatch Ribbon**: Standardized pigment color references (Cyan P.B. 15:3, Magenta P.R. 57:1, Yellow P.Y. 12, Black P.Blk. 7).
- **Streamlined 1-Click Presets**: Quick packaging selections (`Standard CMYK 2.5kg Cans`, `Carton Packaging 15kg Pails`, `Startup Boxes 2kg/5kg`) respecting warehouse inventory ceilings.

### 4. Base Ink System Formulation Selection (Section 1)
- **BIO SPEED (Sheetfed Lithography & Publication)**:
  - Setting Time: 6–9 min
  - Inkometer Tack (32°C): 11.0–12.2
  - Binder Chemistry: 82% Bio-Renewable Oil
  - Anti-skinning overnight duct stability up to 18,000+ iph
- **BIO PACK (Food & Folding Carton Packaging)**:
  - Setting Time: 8–12 min
  - Inkometer Tack (32°C): 9.8–11.0
  - Formulation Standard: MOSH/MOAH 0% (Low-Migration, Low-Odor)
  - Maximum rub resistance for folding boxboard cartons and cosmetics

### 5. Process CMYK Volume Matrix (Section 2)
- High-contrast pigment chips with authentic DIN/ISO process color representations.
- Packaging size selectors (2.5kg Vacuum Can, 15kg Metal Pail, 2kg/5kg Sealed Boxes) displaying real-time unit stock.
- Clean `-` / `+` steppers displaying unit counts and calculated net kilograms.
- Enforced live inventory caps with direct stock request links when stock is depleted.
- Consistent Company terminology maintained throughout (no "press" occurrences).

### 6. Official Commercial Purchase Specification Ticket (Right Column)
- Formatted as an authentic commercial purchase order ticket with timestamp and net weight.
- Dedicated freight tier progress bar indicating proximity to the 300 kg free transit threshold.
- Itemized CMYK allocation breakdown table.
- Direct mathematical breakdown: Subtotal, Volume Tier Discount, Industrial GST 18% (HSN 3215), and Logistics Freight.
- Prominent "Confirm & Issue Order" CTA button.

---

## Verification
- `lint_applet` (`tsc --noEmit`): Passed with 0 errors.
- `compile_applet` (Vite production build): Build succeeded with 0 errors.
- `restart_dev_server`: Executed cleanly.
