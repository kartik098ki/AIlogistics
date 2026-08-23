import { Vendor, Train, SKU, DeliveryAgent, Order, SalesLog, AuditLog } from '../types';

export const INITIAL_VENDOR: Vendor = {
  id: 'v_ndls_01',
  name: 'Standard Refreshments & Quick Meals',
  shopName: 'Stall #14 (Main Concourse & PF-1/2/3)',
  stationCode: 'NDLS',
  stationName: 'New Delhi Railway Station',
  platformNumbers: ['PF-1', 'PF-2', 'PF-3'],
  handoffBufferMinutes: 3,
  isOnline: true,
};

const nowMs = Date.now();
const makeFutureIso = (minutesFromNow: number) => new Date(nowMs + minutesFromNow * 60 * 1000).toISOString();

export const INITIAL_TRAINS: Record<string, Train> = {
  t_12301: {
    id: 't_12301',
    trainNumber: '12301',
    trainName: 'Howrah Rajdhani Express',
    platformNumber: 'PF-1',
    scheduledArrival: makeFutureIso(6),
    actualArrival: makeFutureIso(6),
    haltMinutes: 2,
    delayMinutes: 0,
    status: 'approaching',
  },
  t_12952: {
    id: 't_12952',
    trainNumber: '12952',
    trainName: 'Mumbai Rajdhani Express',
    platformNumber: 'PF-2',
    scheduledArrival: makeFutureIso(18),
    actualArrival: makeFutureIso(18),
    haltMinutes: 10,
    delayMinutes: 0,
    status: 'approaching',
  },
};

export const INITIAL_SKUS: SKU[] = [
  {
    id: 'sku_thali_01',
    vendorId: 'v_ndls_01',
    name: 'Executive Deluxe Veg Thali',
    category: 'Hot Meals',
    unitPrice: 160,
    stockOnHand: 24,
    reorderPoint: 15,
    maxStock: 50,
    avgDailySales: 22.4,
    lastRestockAt: nowMs - 86400000,
    dailySalesHistory: [18, 20, 22, 25, 21, 24, 26, 28, 30, 25, 27, 29, 31, 34],
    leadTimeDays: 1,
    unitsSoldLast3Days: 94,
    unitsSoldPrior3Days: 81,
    updatedAt: nowMs,
  },
  {
    id: 'sku_roll_02',
    vendorId: 'v_ndls_01',
    name: 'Paneer Butter Masala Kati Roll',
    category: 'Quick Eats',
    unitPrice: 110,
    stockOnHand: 18,
    reorderPoint: 12,
    maxStock: 40,
    avgDailySales: 16.2,
    lastRestockAt: nowMs - 172800000,
    dailySalesHistory: [12, 14, 15, 16, 17, 15, 16, 18, 17, 19, 20, 18, 21, 22],
    leadTimeDays: 1,
    unitsSoldLast3Days: 61,
    unitsSoldPrior3Days: 57,
    updatedAt: nowMs,
  },
  {
    id: 'sku_water_03',
    vendorId: 'v_ndls_01',
    name: 'Packaged Mineral Water 1L',
    category: 'Beverages',
    unitPrice: 20,
    stockOnHand: 85,
    reorderPoint: 40,
    maxStock: 120,
    avgDailySales: 68.5,
    lastRestockAt: nowMs - 43200000,
    dailySalesHistory: [60, 65, 70, 68, 72, 75, 71, 74, 80, 82, 79, 85, 88, 92],
    leadTimeDays: 1,
    unitsSoldLast3Days: 265,
    unitsSoldPrior3Days: 246,
    updatedAt: nowMs,
  },
];

export const INITIAL_AGENTS: DeliveryAgent[] = [
  {
    id: 'da_01',
    name: 'Ramesh Kumar',
    phone: '+91 98765 43210',
    currentPlatform: 'PF-1',
    isAvailable: true,
    assignedOrderIds: ['ORD-8821'],
    lastLocationUpdate: nowMs,
  },
  {
    id: 'da_02',
    name: 'Suresh Sharma',
    phone: '+91 98123 45678',
    currentPlatform: 'PF-2',
    isAvailable: true,
    assignedOrderIds: ['ORD-8822'],
    lastLocationUpdate: nowMs,
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-8821',
    vendorId: 'v_ndls_01',
    trainId: 't_12301',
    trainNumber: '12301',
    trainName: 'Howrah Rajdhani Express',
    platformNumber: 'PF-1',
    coachNumber: 'B4',
    seatNumber: '32 (Lower)',
    passengerName: 'Anand Verma',
    passengerPhone: '+91 98990 11223',
    items: [
      { skuId: 'sku_thali_01', name: 'Executive Deluxe Veg Thali', qty: 2, price: 160 },
      { skuId: 'sku_water_03', name: 'Packaged Mineral Water 1L', qty: 2, price: 20 },
    ],
    placedAt: nowMs,
    status: 'new',
    packDeadline: new Date(INITIAL_TRAINS.t_12301.actualArrival).getTime(),
    acceptanceDeadline: nowMs + 60 * 1000,
    deliveryAgentId: 'da_01',
    otp: '4829',
    estimatedPackMinutes: 3,
    edgeFlag: 'OK',
    updatedAt: nowMs,
  },
  {
    id: 'ORD-8822',
    vendorId: 'v_ndls_01',
    trainId: 't_12952',
    trainNumber: '12952',
    trainName: 'Mumbai Rajdhani Express',
    platformNumber: 'PF-2',
    coachNumber: 'A2',
    seatNumber: '15 (Side Lower)',
    passengerName: 'Priya Sundaram',
    passengerPhone: '+91 98401 99887',
    items: [
      { skuId: 'sku_roll_02', name: 'Paneer Butter Masala Kati Roll', qty: 1, price: 110 },
      { skuId: 'sku_water_03', name: 'Packaged Mineral Water 1L', qty: 1, price: 20 },
    ],
    placedAt: nowMs - 2 * 60 * 1000,
    status: 'packing',
    packDeadline: new Date(INITIAL_TRAINS.t_12952.actualArrival).getTime(),
    deliveryAgentId: 'da_02',
    otp: '7392',
    estimatedPackMinutes: 2,
    edgeFlag: 'OK',
    updatedAt: nowMs - 2 * 60 * 1000,
  },
];

export const INITIAL_SALES_LOGS: SalesLog[] = [
  {
    id: 'log_101',
    date: new Date().toISOString().split('T')[0],
    vendorId: 'v_ndls_01',
    orderId: 'ORD-8815',
    itemsSold: [
      { skuId: 'sku_thali_01', name: 'Executive Deluxe Veg Thali', qty: 2, price: 160 },
    ],
    revenue: 320,
    timestamp: nowMs - 2 * 3600 * 1000,
    packTimeSeconds: 145,
    wasOnTime: true,
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
