# 🚉 RailQuick Vendor — Smart Railway Station Platform Vendor App

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg)](https://tailwindcss.com/)
[![NVIDIA AI](https://img.shields.io/badge/NVIDIA%20AI-Llama%203.1-76B900.svg)](https://build.nvidia.com/)

# 🚉 RailQuick Vendor

**RailQuick Vendor** is a mobile-first railway platform operations app designed for station vendors and stalls to manage time-critical passenger orders.

Unlike conventional delivery dashboards that optimize around addresses and static delivery windows, RailQuick Vendor is built around **train movement, platform assignment, halt duration, packing time, and platform handoff constraints**.

The core idea is simple:

> **A late railway order can mean a missed train.**

RailQuick Vendor helps vendors prioritize the right order, pack it within the available window, coordinate platform delivery, monitor stock, and use an AI co-pilot for operational assistance.

---

## ✨ Core Capabilities

### ⚡ Time-Critical Order Acceptance

Every incoming order starts with a **60-second acceptance window**.

The vendor can:

* Accept and start packing
* Transfer the order manually
* Allow the order to auto-transfer when the acceptance window expires

The incoming-order interface also shows:

* Train name and number
* Platform
* Coach and seat
* Passenger
* Ordered items
* Order value
* Remaining acceptance time

This flow is implemented in `IncomingOrderModal.tsx`.

---

### 🔥 Train-Aware Priority Queue

RailQuick does not treat every order equally.

Order priority is calculated using:

* Train arrival time
* Vendor handoff buffer
* Train halt duration
* Number of items in the order
* Time remaining before the effective deadline

The priority engine gives additional urgency to short-halt trains:

* **≤ 2 minutes halt:** `3×` urgency multiplier
* **≤ 5 minutes halt:** `1.6×` urgency multiplier
* Longer halts use the base urgency score

The system converts these factors into a priority score and sorts the live queue accordingly.

Implementation:

```text
src/utils/mathEngine.ts
```

---

### 📦 Smart Inventory Edge-State Classification

Inventory is classified into four operational states:

| State        | Meaning                                       |
| ------------ | --------------------------------------------- |
| `OK`         | Healthy stock level                           |
| `NEAR_LIMIT` | At or below reorder threshold                 |
| `OVER_LIMIT` | Above maximum allowed stock                   |
| `INVALID`    | Stock anomaly or inconsistent inventory state |

The classifier can detect cases such as:

* Negative stock
* Sales recorded when stock is zero
* Overstocking beyond configured capacity
* Reorder-threshold breaches

The inventory engine also calculates a demand forecast and dynamically derives a reorder point using recent sales and lead time.

Implementation:

```text
src/utils/mathEngine.ts
```

---

### 🔐 Delivery Partner Handover Verification

Once an order is packed, the vendor can verify the assigned delivery runner before handing over the package.

The verification flow includes:

* Delivery partner identity
* Platform assignment
* 4-digit OTP entry
* Handover confirmation
* Dispatch state update

The current implementation is designed as a **demo/prototype flow** and should be connected to a server-side OTP service before production deployment.

Implementation:

```text
src/components/OTPVerificationModal.tsx
```

---

### 🤖 RailQuick AI Co-Pilot

RailQuick includes an AI assistant designed for busy railway-stall operators.

The assistant can answer questions about:

* Active orders
* Which order to pack next
* Train arrivals
* Platform assignments
* Inventory and low-stock items
* Delivery runners
* Current sales/revenue
* Operational issues

The AI receives a live application context containing:

```text
Vendor
Orders
Trains
Inventory
Delivery Agents
Sales Logs
Language
```

The current AI integration uses:

**NVIDIA AI API + Meta Llama 3.1 70B Instruct**

Implementation:

```text
src/services/nvidiaAI.ts
src/components/AIVoiceAssistantModal.tsx
```

---

### 🎙️ Voice + Bilingual Interaction

The AI assistant supports both text and voice interaction.

Supported language modes include:

* English
* Hindi

Browser capabilities are used for:

* Speech recognition
* Speech synthesis

The assistant can respond in Hindi, English, or conversational Hinglish depending on the interaction context.

---

### 🌐 English ↔️ Hindi UI

The application includes a dedicated language context for bilingual operation.

The UI can switch between:

```text
English
Hindi
```

Translations are managed through:

```text
src/context/LanguageContext.tsx
```

---

## 🏗️ Architecture

```text
src/
├── App.tsx
│
├── components/
│   ├── AIVoiceAssistantModal.tsx
│   ├── AdminSimulatorDrawer.tsx
│   ├── BottomNav.tsx
│   ├── Header.tsx
│   ├── IncomingOrderModal.tsx
│   ├── InventoryView.tsx
│   ├── LiveQueue.tsx
│   ├── OTPVerificationModal.tsx
│   ├── OrderDetailModal.tsx
│   ├── SalesDashboard.tsx
│   ├── ToastLayer.tsx
│   └── TrainBoard.tsx
│
├── context/
│   ├── AppContext.tsx
│   └── LanguageContext.tsx
│
├── services/
│   └── nvidiaAI.ts
│
├── utils/
│   ├── audioAlert.ts
│   ├── exportUtils.ts
│   ├── mathEngine.ts
│   └── mockData.ts
│
├── types/
│   └── index.ts
│
├── index.css
└── main.tsx
```

---

## 🧠 Operational Flow

```text
Passenger Order
      ↓
Vendor Receives Order
      ↓
60s Acceptance Window
      ↓
Priority Engine
      ↓
Order Ranked by Train Urgency
      ↓
Vendor Accepts & Packs
      ↓
Delivery Partner Assigned
      ↓
OTP Verification
      ↓
Platform Handover
      ↓
Train / Coach Delivery
```

---

## 🛠️ Tech Stack

| Layer        | Technology                      |
| ------------ | ------------------------------- |
| Frontend     | React 18                        |
| Language     | TypeScript 5                    |
| Build Tool   | Vite 6                          |
| Styling      | Tailwind CSS 4                  |
| Icons        | Lucide React                    |
| Charts       | Recharts                        |
| AI           | NVIDIA API + Meta Llama 3.1 70B |
| Voice Input  | Web Speech Recognition API      |
| Voice Output | Web Speech Synthesis API        |
| UI Effects   | Canvas Confetti                 |
| Deployment   | Vercel                          |

The project is configured as a Vite-based React application and currently uses the dependencies defined in `package.json`.

---

## 🚀 Getting Started

### Prerequisites

* Node.js 18+
* npm 9+

### Installation

```bash
git clone https://github.com/kartik098ki/AIlogistics.git

cd AIlogistics

npm install
```

### Start Development Server

```bash
npm run dev
```

Then open:

```text
http://localhost:5173
```

For testing from another device on the same network, use the Vite network URL shown in the terminal.

---

## 📦 Production Build

Create a production build with:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Lint the project with:

```bash
npm run lint
```

---

## 🌍 Deployment

The repository includes Vercel configuration and is deployed as a web application.

Live deployment:

**https://a-ilogistics.vercel.app**

Repository:

**https://github.com/kartik098ki/AIlogistics**

---

## 📁 Key Modules

### `AppContext.tsx`

Central application state including:

* Orders
* Trains
* Inventory
* Delivery agents
* Sales data
* Vendor information
* Order lifecycle actions

### `mathEngine.ts`

Contains the operational logic for:

* Train-aware priority scoring
* Order sorting
* Inventory edge-state classification
* Reorder-point calculation
* Demand forecasting

### `nvidiaAI.ts`

Builds the live station context and communicates with the NVIDIA Llama endpoint.

### `AIVoiceAssistantModal.tsx`

Provides the vendor-facing AI interface with:

* Text chat
* Voice input
* Spoken AI responses
* Quick operational prompts

### `LanguageContext.tsx`

Handles bilingual application text and language switching.

---

## 🧪 Demo / Prototype Notes

RailQuick Vendor is currently a prototype demonstrating the operational workflow for railway-station commerce.

Some components use local/mock data for demonstration purposes, including:

* Train schedules
* Orders
* Inventory
* Delivery agents
* Sales logs

The current architecture is designed so these demo sources can later be replaced with production APIs and real-time railway/vendor systems.

---

## 🔒 Security Note

The NVIDIA API credential must **not** be committed to the client-side source code.

For production:

1. Rotate any exposed NVIDIA API credential.
2. Store credentials in environment variables.
3. Move AI requests behind a secure backend/API route.
4. Never expose private API credentials to the browser.

---

## 📌 Current Status

**Prototype / Hackathon Demonstration**

RailQuick Vendor currently demonstrates the complete vendor-side operational concept:

```text
Order Intake
→ Time-Based Acceptance
→ Train-Aware Prioritization
→ Packing
→ Inventory Intelligence
→ Delivery Partner Verification
→ AI Assistance
→ Sales Monitoring
```

---

## 📜 License

MIT License ©️ 2026 RailQuick Team
MIT License © 2026 RailQuick Team.
