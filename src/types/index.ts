export type TrainStatus = 'approaching' | 'at_platform' | 'departed';

export interface Train {
  id: string;
  trainNumber: string;
  trainName: string;
  platformNumber: string;
  scheduledArrival: string; // ISO string or HH:mm
  actualArrival: string; // ISO string timestamp (predicted live arrival/departure)
  haltMinutes: number;
  delayMinutes: number;
  status: TrainStatus;
}

export type OrderStatus =
  | 'new'
  | 'packing'
  | 'packed'
  | 'handed_to_agent'
  | 'delivered'
  | 'partial'
  | 'blocked'
  | 'unresolved'
  | 'cancelled';

export type StockEdgeState = 'OK' | 'NEAR_LIMIT' | 'OVER_LIMIT' | 'INVALID';

export interface OrderItem {
  skuId: string;
  name: string;
  qty: number;
  price: number;
  checked?: boolean; // checklist state during packing
}

export interface Order {
  id: string;
  vendorId: string;
  trainId: string;
  trainNumber: string;
  trainName: string;
  platformNumber: string;
  coachNumber: string;
  seatNumber: string;
  passengerName: string;
  passengerPhone: string;
  items: OrderItem[];
  placedAt: number; // Unix timestamp in ms
  status: OrderStatus;
  packDeadline: number; // Unix timestamp in ms
  deliveryAgentId: string | null;
  otp?: string; // 4-digit verification code for delivery partner
  estimatedPackMinutes?: number; // e.g. 2-4 mins
  acceptanceDeadline?: number; // timestamp for 60s accept timer
  edgeFlag: StockEdgeState;
  blockReason?: string;
  issueType?: 'partial' | 'blocked' | 'unresolved';
  issueNotes?: string;
  handedToAgentAt?: number;
  deliveredAt?: number;
  updatedAt: number; // for Last-Write-Wins offline reconciliation
}

export interface SKU {
  id: string;
  vendorId: string;
  name: string;
  category: string;
  unitPrice: number;
  stockOnHand: number;
  reorderPoint: number;
  maxStock: number;
  avgDailySales: number; // rolling EWMA
  lastRestockAt: number;
  dailySalesHistory: number[]; // last 14 days of units sold
  leadTimeDays: number;
  unitsSoldLast3Days: number;
  unitsSoldPrior3Days: number;
  updatedAt: number;
}

export interface DeliveryAgent {
  id: string;
  name: string;
  phone: string;
  currentPlatform: string;
  isAvailable: boolean;
  assignedOrderIds: string[];
  lastLocationUpdate: number;
}

export interface Vendor {
  id: string;
  name: string;
  shopName: string;
  stationCode: string;
  stationName: string;
  platformNumbers: string[];
  handoffBufferMinutes: number; // Buffer walk time to platform edge
  isOnline: boolean;
}

export interface SalesLog {
  id: string;
  date: string; // YYYY-MM-DD
  vendorId: string;
  orderId: string;
  itemsSold: { skuId: string; name: string; qty: number; price: number }[];
  revenue: number;
  timestamp: number;
  packTimeSeconds: number;
  wasOnTime: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: number;
  orderId?: string;
  skuId?: string;
  staffName: string;
  action: string;
  details: string;
  previousState?: string;
  newState?: string;
}

export interface EdgeExplanation {
  skuId: string;
  skuName: string;
  state: StockEdgeState;
  severity?: 'warning' | 'critical';
  hoursOfStockLeft?: number;
  reason: string;
  recommendation: string;
}
