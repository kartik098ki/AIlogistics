# 🚉 RailQuick Vendor — Smart Railway Station Platform Vendor App

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg)](https://tailwindcss.com/)
[![NVIDIA AI](https://img.shields.io/badge/NVIDIA%20AI-Llama%203.1-76B900.svg)](https://build.nvidia.com/)

**RailQuick Vendor** is a mobile-first web application (PWA) designed specifically for shop and food stall vendors operating on railway station platforms (e.g. **NDLS — New Delhi Railway Station**). 

Unlike standard food delivery dashboards where deadlines are based on street addresses, RailQuick deadlines are dynamically driven by **live train arrivals, platform assignments, and halt durations** (e.g., a 2-minute short halt at Platform 1). Failing to pack an order on time means a **missed train**, not just a late delivery.

---

## 🌟 Key Features

### 1. ⚡ 60-Second Real Order Acceptance & Auto-Reassignment
- When a new order arrives, a **real-time 60-second countdown timer** begins.
- Displays an estimated **Target Packing Duration** (e.g., `⏱️ 3 Mins Packing Window`).
- **Auto-Reassign**: If the vendor does not accept or start packing within 60 seconds, the order is **automatically transferred** to an alternate platform stall (`Stall #12`) to protect passenger fulfillment.

### 2. 🔐 Delivery Partner OTP Verification
- Once an order is packed, tapping **"Verify OTP & Handover"** opens a verification sheet.
- Generates a **4-digit Delivery OTP** (e.g., `4829`) shared with the platform delivery partner (`Ramesh Kumar · PF-1`).
- Eliminates handover errors and ensures strict custody tracking before the runner departs for the train coach.

### 3. 🤖 NVIDIA Llama 3.1 Voice & Chat AI Assistant
- Integrated with **NVIDIA AI API** (`meta/llama-3.1-70b-instruct`).
- Features a **glowing circular AI orb** in the center of the bottom navigation.
- **Voice-to-Text & Text-to-Speech**: Speech Recognition & Synthesis in **Hindi and English**.
- Real-time station context: The AI knows live active orders, train schedules, low-stock alerts, assigned delivery partners, and today's revenue.

### 4. 🔥 Train timing & Halt Urgency Priority Engine
- Dynamically ranks orders in the queue:
  - **🔥 URGENT PRIORITY (`तत्काल`)**: Train arriving in `< 5 mins` or short halt (`≤ 2m`). Applies a 3x urgency multiplier with visual red ring pulse.
  - **⚡ HIGH PRIORITY (`उच्च`)**: Train arriving in `5–15 mins`.
  - **⏱️ NORMAL PRIORITY (`सामान्य`)**: Standard scheduled arrival queue.

### 5. 📦 Stock Edge-State Classifier
- Categorizes inventory SKUs into 4 states:
  - `OK`: Healthy stock levels.
  - `NEAR_LIMIT`: Below reorder threshold (triggers stock alert).
  - `OVER_LIMIT`: Stock exceeds maximum storage capacity.
  - `INVALID`: Negative stock or corrupt data (automatically flags affected orders).

### 6. 🌐 Bilingual Global Support (English ↔ Hindi)
- Toggle whole-app language instantly with the **`EN ↔ हिं`** button.
- All labels, order statuses, priorities, and voice AI prompts update dynamically without page reloads.

---

## 🏗️ Technical Architecture

```
src/
├── components/
│   ├── Header.tsx                 # Clean top bar (Brand, Revenue, Lang Toggle, Settings)
│   ├── BottomNav.tsx              # 5-tab navigation featuring center Floating AI Orb
│   ├── LiveQueue.tsx              # Priority queue with accurate live countdown timers
│   ├── TrainBoard.tsx             # Live platform train timetable
│   ├── InventoryView.tsx          # Stock manager & EWMA sales forecasting
│   ├── SalesDashboard.tsx         # Shift performance & CSV export
│   ├── AdminSimulatorDrawer.tsx   # Platform walk buffer & event simulator
│   ├── IncomingOrderModal.tsx     # 60-second real acceptance countdown modal
│   ├── OTPVerificationModal.tsx   # Delivery partner 4-digit OTP handover sheet
│   ├── AIVoiceAssistantModal.tsx  # NVIDIA Llama 3.1 voice & chat co-pilot
│   ├── OrderDetailModal.tsx       # Packing item checklist
│   └── ToastLayer.tsx             # Floating notification alerts
├── context/
│   ├── AppContext.tsx             # Global application state & 60s timeout engine
│   └── LanguageContext.tsx        # Bilingual (EN/HI) translation dictionary
├── services/
│   └── nvidiaAI.ts                # NVIDIA API integration & live context builder
├── utils/
│   ├── mathEngine.ts              # Priority queue score & stock edge classifier
│   ├── audioAlert.ts              # Web Audio API alert sound manager
│   ├── exportUtils.ts             # Sales CSV & PDF exporter
│   └── mockData.ts                # Seed trains, orders, SKUs & delivery agents
└── types/
    └── index.ts                   # TypeScript interfaces (Order, SKU, Train, Agent)
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kartik098ki/AIlogistics.git
   cd AIlogistics
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open in browser:
   - **Local**: [http://localhost:5173/](http://localhost:5173/)
   - **Network (Mobile)**: `http://<your-ip>:5173/`

---

## 🧪 Production Build & Verification

To verify TypeScript types and build for production:

```bash
# Typecheck
npx tsc --noEmit

# Production Build
npm run build
```

---

## 📄 License

MIT License © 2026 RailQuick Team.
