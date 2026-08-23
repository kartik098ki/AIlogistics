import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Vendor,
  Train,
  Order,
  SKU,
  DeliveryAgent,
  SalesLog,
  AuditLog,
  OrderStatus,
  StockEdgeState,
} from '../types';
import {
  INITIAL_VENDOR,
  INITIAL_TRAINS,
  INITIAL_SKUS,
  INITIAL_AGENTS,
  INITIAL_ORDERS,
  INITIAL_SALES_LOGS,
  INITIAL_AUDIT_LOGS,
} from '../utils/mockData';
import { deriveOrderEdgeFlag, classifyStockEdgeState } from '../utils/mathEngine';
import { alertManager } from '../utils/audioAlert';

export interface ToastMessage {
  id: string;
  type: 'order_new' | 'order_packed' | 'urgent_deadline' | 'stock_alert';
  title: string;
  message: string;
  timestamp: number;
}

interface AppContextType {
  vendor: Vendor;
  trains: Record<string, Train>;
  orders: Order[];
  skus: SKU[];
  agents: DeliveryAgent[];
  salesLogs: SalesLog[];
  auditLogs: AuditLog[];
  nowMs: number;
  selectedOrder: Order | null;
  incomingOrder: Order | null;
  activeTab: 'queue' | 'inventory' | 'sales' | 'trains' | 'admin';
  isSimulatorOpen: boolean;
  isAIAssistantOpen: boolean;
  isOffline: boolean;
  isAutoStreamEnabled: boolean;
  toastMessages: ToastMessage[];
  
  // Actions
  setSelectedOrder: (order: Order | null) => void;
  setIncomingOrder: (order: Order | null) => void;
  setActiveTab: (tab: 'queue' | 'inventory' | 'sales' | 'trains' | 'admin') => void;
  setIsSimulatorOpen: (open: boolean) => void;
  setIsAIAssistantOpen: (open: boolean) => void;
  setIsAutoStreamEnabled: (enabled: boolean) => void;
  toggleVendorOnline: () => void;
  updateHandoffBuffer: (minutes: number) => void;
  dismissToast: (id: string) => void;
  
  // Order Lifecycle
  startPackingOrder: (orderId: string, staffName?: string) => void;
  markOrderPacked: (orderId: string, staffName?: string) => void;
  assignDeliveryAgent: (orderId: string, agentId: string, staffName?: string) => void;
  acceptAgentHandover: (orderId: string, agentId: string) => void;
  reportOrderIssue: (
    orderId: string,
    issueType: 'partial' | 'blocked' | 'unresolved',
    notes: string,
    modifiedItems?: { skuId: string; qty: number }[],
    staffName?: string
  ) => void;
  resolveBlockedOrder: (orderId: string, notes: string, staffName?: string) => void;
  
  // SKU & Stock Actions
  updateSKUStock: (skuId: string, newStock: number, reason: string, staffName?: string) => void;
  restockSKU: (skuId: string, addedQty: number, staffName?: string) => void;
  editSKUCatalog: (sku: SKU) => void;
  
  // Simulator Controls
  simTriggerTrainDelay: (trainId: string, additionalDelayMinutes: number) => void;
  simChangeTrainPlatform: (trainId: string, newPlatform: string) => void;
  simPushNewOrder: (trainId?: string) => void;
  simTriggerStockAnomaly: (skuId: string) => void;
  resetAllDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'railquick_light_v1_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const loadStored = <T,>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  };

  const [vendor, setVendor] = useState<Vendor>(() => loadStored('vendor', INITIAL_VENDOR));
  const [trains, setTrains] = useState<Record<string, Train>>(() => loadStored('trains', INITIAL_TRAINS));
  const [orders, setOrders] = useState<Order[]>(() => loadStored('orders', INITIAL_ORDERS));
  const [skus, setSkus] = useState<SKU[]>(() => loadStored('skus', INITIAL_SKUS));
  const [agents, setAgents] = useState<DeliveryAgent[]>(() => loadStored('agents', INITIAL_AGENTS));
  const [salesLogs, setSalesLogs] = useState<SalesLog[]>(() => loadStored('salesLogs', INITIAL_SALES_LOGS));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadStored('auditLogs', INITIAL_AUDIT_LOGS));

  const [nowMs, setNowMs] = useState<number>(Date.now());
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [incomingOrder, setIncomingOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<'queue' | 'inventory' | 'sales' | 'trains' | 'admin'>('queue');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [isAutoStreamEnabled, setIsAutoStreamEnabled] = useState<boolean>(true);
  const [toastMessages, setToastMessages] = useState<ToastMessage[]>([]);

  const getAutoAssignedAgent = (platformNumber: string): string => {
    const matching = agents.find(a => a.currentPlatform === platformNumber && a.isAvailable);
    if (matching) return matching.id;
    const available = agents.find(a => a.isAvailable);
    if (available) return available.id;
    return agents[0]?.id || 'da_01';
  };

  const addToast = useCallback((type: ToastMessage['type'], title: string, message: string) => {
    const newToast: ToastMessage = {
      id: `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      type,
      title,
      message,
      timestamp: Date.now(),
    };
    setToastMessages(prev => [newToast, ...prev].slice(0, 4));
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToastMessages(prev => prev.filter(t => t.id !== id));
  }, []);

  const logAudit = useCallback((action: string, details: string, orderId?: string, skuId?: string, staffName: string = 'Staff', previousState?: string, newState?: string) => {
    const newEntry: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
      orderId,
      skuId,
      staffName,
      action,
      details,
      previousState,
      newState,
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'vendor', JSON.stringify(vendor));
    localStorage.setItem(STORAGE_KEY_PREFIX + 'trains', JSON.stringify(trains));
    localStorage.setItem(STORAGE_KEY_PREFIX + 'orders', JSON.stringify(orders));
    localStorage.setItem(STORAGE_KEY_PREFIX + 'skus', JSON.stringify(skus));
    localStorage.setItem(STORAGE_KEY_PREFIX + 'agents', JSON.stringify(agents));
    localStorage.setItem(STORAGE_KEY_PREFIX + 'salesLogs', JSON.stringify(salesLogs));
    localStorage.setItem(STORAGE_KEY_PREFIX + 'auditLogs', JSON.stringify(auditLogs));
  }, [vendor, trains, orders, skus, agents, salesLogs, auditLogs]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 1-second Ticker & 60s Acceptance Timeout Auto-Reassignment Checker
  useEffect(() => {
    const interval = setInterval(() => {
      const currentNow = Date.now();
      setNowMs(currentNow);

      setOrders(prevOrders => {
        let changed = false;
        const nextOrders = prevOrders.map(order => {
          if (
            order.status === 'new' &&
            order.acceptanceDeadline &&
            currentNow > order.acceptanceDeadline
          ) {
            changed = true;
            logAudit(
              'ORDER_AUTO_REASSIGNED',
              `Order ${order.id} transferred to Platform Alternate Stall #12 due to 60s acceptance timeout.`,
              order.id,
              undefined,
              'System Auto-Reassign'
            );
            addToast(
              'urgent_deadline',
              `⚠️ ORDER REASSIGNED: ${order.id}`,
              `60s timeout expired. Transferred to Platform Alternate Stall.`
            );
            return {
              ...order,
              status: 'cancelled' as OrderStatus,
              blockReason: 'Auto-transferred to alternate platform stall (60s timeout expired)',
              updatedAt: currentNow,
            };
          }
          return order;
        });
        return changed ? nextOrders : prevOrders;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [logAudit, addToast]);

  // Automated Live Order Stream Engine: Pushes realistic train orders at a calm, non-intrusive pace (max 2 active orders)
  useEffect(() => {
    if (!isAutoStreamEnabled || !vendor.isOnline) return;

    const streamInterval = setInterval(() => {
      const activeCount = orders.filter(o => o.status === 'new' || o.status === 'packing').length;
      if (activeCount >= 2) return;

      const trainKeys = Object.keys(trains);
      if (trainKeys.length === 0) return;
      
      const randomTrainId = trainKeys[Math.floor(Math.random() * trainKeys.length)];
      const train = trains[randomTrainId];
      if (!train) return;

      const newOrderId = `ORD-${Math.floor(8825 + Math.random() * 1100)}`;
      const names = ['Vikram Seth', 'Meenakshi Iyer', 'Deepak Chopra', 'Alok Pandey', 'Sunita Rao', 'Harpreet Singh'];
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomCoach = `B${Math.floor(1 + Math.random() * 5)}`;
      const randomSeat = `${Math.floor(1 + Math.random() * 60)} (${['Lower', 'Upper', 'Side Lower'][Math.floor(Math.random() * 3)]})`;

      const itemPool = [
        { skuId: 'sku_thali_01', name: 'Executive Deluxe Veg Thali', qty: 1 + Math.floor(Math.random() * 2), price: 160 },
        { skuId: 'sku_roll_02', name: 'Paneer Butter Masala Kati Roll', qty: 1, price: 110 },
        { skuId: 'sku_water_03', name: 'Packaged Mineral Water 1L', qty: 1 + Math.floor(Math.random() * 2), price: 20 },
        { skuId: 'sku_samosa_04', name: 'Crispy Samosa Pack (2 Pcs)', qty: 1, price: 40 },
      ];
      const selectedItems = [itemPool[Math.floor(Math.random() * itemPool.length)], itemPool[2]];
      const assignedAgentId = getAutoAssignedAgent(train.platformNumber);
      const generatedOtp = String(Math.floor(1000 + Math.random() * 9000));
      const currentNow = Date.now();

      const newOrder: Order = {
        id: newOrderId,
        vendorId: vendor.id,
        trainId: train.id,
        trainNumber: train.trainNumber,
        trainName: train.trainName,
        platformNumber: train.platformNumber,
        coachNumber: randomCoach,
        seatNumber: randomSeat,
        passengerName: randomName,
        passengerPhone: '+91 98' + Math.floor(10000000 + Math.random() * 89999999),
        items: selectedItems,
        placedAt: currentNow,
        status: 'new',
        packDeadline: new Date(train.actualArrival).getTime(),
        acceptanceDeadline: currentNow + 60 * 1000,
        deliveryAgentId: assignedAgentId,
        otp: generatedOtp,
        estimatedPackMinutes: 3,
        edgeFlag: 'OK',
        updatedAt: currentNow,
      };

      setOrders(prev => [newOrder, ...prev]);
      setIncomingOrder(newOrder);
      addToast('order_new', `⚡ NEW ORDER: ${newOrderId}`, `Train ${train.trainNumber} (PF ${train.platformNumber}) · ${randomName}`);
      alertManager.triggerUrgentAlert(newOrderId);
    }, 90000);

    return () => clearInterval(streamInterval);
  }, [isAutoStreamEnabled, vendor.isOnline, trains, agents, orders, addToast]);

  useEffect(() => {
    const skusMap = skus.reduce<Record<string, SKU>>((acc, s) => {
      acc[s.id] = s;
      return acc;
    }, {});

    setOrders(prevOrders =>
      prevOrders.map(order => {
        const edgeFlag = deriveOrderEdgeFlag(order.items, skusMap);
        if (edgeFlag !== order.edgeFlag) {
          let newStatus = order.status;
          let blockReason = order.blockReason;
          if (edgeFlag === 'INVALID' && (order.status === 'new' || order.status === 'packing')) {
            newStatus = 'blocked';
            blockReason = 'Auto-blocked: Contains SKU with INVALID stock state. Audit required.';
          }
          return {
            ...order,
            edgeFlag,
            status: newStatus,
            blockReason,
            updatedAt: Date.now(),
          };
        }
        return order;
      })
    );
  }, [skus]);

  useEffect(() => {
    if (selectedOrder) {
      const updated = orders.find(o => o.id === selectedOrder.id);
      if (updated) setSelectedOrder(updated);
    }
  }, [orders]);

  const toggleVendorOnline = () => {
    setVendor(prev => {
      const next = !prev.isOnline;
      logAudit('VENDOR_STATUS', `Vendor online status set to ${next ? 'ONLINE' : 'OFFLINE'}`);
      addToast('order_new', `Vendor Status Updated`, `Shop is now ${next ? 'ONLINE & accepting orders' : 'OFFLINE'}`);
      return { ...prev, isOnline: next };
    });
  };

  const updateHandoffBuffer = (minutes: number) => {
    setVendor(prev => ({ ...prev, handoffBufferMinutes: minutes }));
    logAudit('VENDOR_BUFFER', `Platform walk buffer updated to ${minutes} minutes.`);
  };

  const startPackingOrder = (orderId: string, staffName: string = 'Counter Staff') => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          logAudit('ORDER_START_PACKING', `Started packing order ${orderId}`, orderId, undefined, staffName, o.status, 'packing');
          return { ...o, status: 'packing', updatedAt: Date.now() };
        }
        return o;
      })
    );
  };

  const markOrderPacked = (orderId: string, staffName: string = 'Counter Staff') => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    setSkus(prevSkus =>
      prevSkus.map(s => {
        const item = targetOrder.items.find(i => i.skuId === s.id);
        if (item) {
          return { ...s, stockOnHand: Math.max(0, s.stockOnHand - item.qty), updatedAt: Date.now() };
        }
        return s;
      })
    );

    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          logAudit('ORDER_MARKED_PACKED', `Marked order ${orderId} as PACKED`, orderId, undefined, staffName, o.status, 'packed');
          return { ...o, status: 'packed', updatedAt: Date.now() };
        }
        return o;
      })
    );

    addToast('order_packed', `✅ ORDER PACKED: ${orderId}`, `Ready for platform delivery runner handoff!`);
    alertManager.triggerUrgentAlert(orderId);
  };

  const assignDeliveryAgent = (orderId: string, agentId: string, staffName: string = 'Vendor') => {
    const agent = agents.find(a => a.id === agentId);
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          logAudit('ASSIGN_AGENT', `Assigned agent ${agent?.name || agentId} to order ${orderId}`, orderId, undefined, staffName);
          return { ...o, deliveryAgentId: agentId, updatedAt: Date.now() };
        }
        return o;
      })
    );

    setAgents(prev =>
      prev.map(a => (a.id === agentId ? { ...a, assignedOrderIds: [...a.assignedOrderIds, orderId] } : a))
    );
  };

  const acceptAgentHandover = (orderId: string, agentId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const packTimeSec = Math.round((Date.now() - order.placedAt) / 1000);
    const train = trains[order.trainId];
    const trainArrivalMs = train ? new Date(train.actualArrival).getTime() : Date.now();
    const wasOnTime = Date.now() <= trainArrivalMs;
    const revenue = order.items.reduce((sum, i) => sum + i.price * i.qty, 0);

    const newLog: SalesLog = {
      id: `log_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      vendorId: vendor.id,
      orderId,
      itemsSold: order.items.map(i => ({ skuId: i.skuId, name: i.name, qty: i.qty, price: i.price })),
      revenue,
      timestamp: Date.now(),
      packTimeSeconds: packTimeSec,
      wasOnTime,
    };
    setSalesLogs(prev => [newLog, ...prev]);

    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          logAudit('HANDOVER_COMPLETE', `Custody transferred to Agent ${agentId} for order ${orderId}`, orderId);
          return { ...o, status: 'handed_to_agent', handedToAgentAt: Date.now(), updatedAt: Date.now() };
        }
        return o;
      })
    );
  };

  const reportOrderIssue = (
    orderId: string,
    issueType: 'partial' | 'blocked' | 'unresolved',
    notes: string,
    modifiedItems?: { skuId: string; qty: number }[],
    staffName: string = 'Staff'
  ) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          let updatedItems = o.items;
          let newStatus: OrderStatus = issueType === 'partial' ? 'partial' : issueType === 'blocked' ? 'blocked' : 'unresolved';

          if (modifiedItems) {
            updatedItems = o.items.map(i => {
              const mod = modifiedItems.find(m => m.skuId === i.skuId);
              return mod ? { ...i, qty: mod.qty } : i;
            });
          }

          logAudit(`REPORT_ISSUE_${issueType.toUpperCase()}`, `Issue reported (${issueType}): ${notes}`, orderId, undefined, staffName, o.status, newStatus);
          return {
            ...o,
            status: newStatus,
            items: updatedItems,
            issueType,
            issueNotes: notes,
            blockReason: issueType === 'blocked' ? notes : o.blockReason,
            updatedAt: Date.now(),
          };
        }
        return o;
      })
    );
  };

  const resolveBlockedOrder = (orderId: string, notes: string, staffName: string = 'Admin') => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          logAudit('RESOLVED_BLOCKED', `Blocked order resolved: ${notes}`, orderId, undefined, staffName, o.status, 'new');
          return { ...o, status: 'new', issueType: undefined, issueNotes: undefined, blockReason: undefined, updatedAt: Date.now() };
        }
        return o;
      })
    );
  };

  const updateSKUStock = (skuId: string, newStock: number, reason: string, staffName: string = 'Vendor Admin') => {
    setSkus(prev =>
      prev.map(s => {
        if (s.id === skuId) {
          logAudit('STOCK_MANUAL_UPDATE', `Updated stock for ${s.name} from ${s.stockOnHand} to ${newStock}. Reason: ${reason}`, undefined, skuId, staffName);
          return { ...s, stockOnHand: newStock, updatedAt: Date.now() };
        }
        return s;
      })
    );
  };

  const restockSKU = (skuId: string, addedQty: number, staffName: string = 'Vendor Staff') => {
    setSkus(prev =>
      prev.map(s => {
        if (s.id === skuId) {
          const newStock = s.stockOnHand + addedQty;
          logAudit('STOCK_RESTOCK', `Restocked ${s.name}: +${addedQty} units (Total: ${newStock})`, undefined, skuId, staffName);
          return { ...s, stockOnHand: newStock, lastRestockAt: Date.now(), updatedAt: Date.now() };
        }
        return s;
      })
    );
  };

  const editSKUCatalog = (updatedSKU: SKU) => {
    setSkus(prev => prev.map(s => (s.id === updatedSKU.id ? updatedSKU : s)));
    logAudit('SKU_CATALOG_EDIT', `Edited catalog details for ${updatedSKU.name}`);
  };

  const simTriggerTrainDelay = (trainId: string, additionalDelayMinutes: number) => {
    setTrains(prev => {
      const t = prev[trainId];
      if (!t) return prev;
      const newDelay = t.delayMinutes + additionalDelayMinutes;
      const schedMs = new Date(t.scheduledArrival).getTime();
      const newActualIso = new Date(schedMs + newDelay * 60 * 1000).toISOString();
      logAudit('SIM_TRAIN_DELAY', `Train ${t.trainNumber} delayed by +${additionalDelayMinutes}m (Total delay: ${newDelay}m)`);
      return { ...prev, [trainId]: { ...t, delayMinutes: newDelay, actualArrival: newActualIso } };
    });
  };

  const simChangeTrainPlatform = (trainId: string, newPlatform: string) => {
    setTrains(prev => {
      const t = prev[trainId];
      if (!t) return prev;
      logAudit('SIM_TRAIN_PLATFORM', `Train ${t.trainNumber} re-platformed to ${newPlatform}`);
      return { ...prev, [trainId]: { ...t, platformNumber: newPlatform } };
    });

    setOrders(prev => prev.map(o => (o.trainId === trainId ? { ...o, platformNumber: newPlatform, updatedAt: Date.now() } : o)));
  };

  const simPushNewOrder = (trainIdSelect?: string) => {
    const availableTrainIds = Object.keys(trains);
    const targetTrainId = trainIdSelect || availableTrainIds[Math.floor(Math.random() * availableTrainIds.length)];
    const train = trains[targetTrainId];
    if (!train) return;

    const sampleSkus = skus.slice(0, 3);
    const randomSku = sampleSkus[Math.floor(Math.random() * sampleSkus.length)];
    const assignedAgentId = getAutoAssignedAgent(train.platformNumber);
    const newOrderId = `ORD-${Math.floor(9000 + Math.random() * 900)}`;
    const currentNow = Date.now();

    const newOrder: Order = {
      id: newOrderId,
      vendorId: vendor.id,
      trainId: train.id,
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      platformNumber: train.platformNumber,
      coachNumber: `B${Math.floor(1 + Math.random() * 6)}`,
      seatNumber: `${Math.floor(1 + Math.random() * 64)}`,
      passengerName: ['Rohan Gupta', 'Sneha Sharma', 'Ananya Roy', 'Rajesh Nair'][Math.floor(Math.random() * 4)],
      passengerPhone: '+91 98' + Math.floor(10000000 + Math.random() * 89999999),
      items: [
        { skuId: randomSku.id, name: randomSku.name, qty: 1 + Math.floor(Math.random() * 2), price: randomSku.unitPrice },
        { skuId: 'sku_water_03', name: 'Packaged Mineral Water 1L', qty: 1, price: 20 },
      ],
      placedAt: currentNow,
      status: 'new',
      packDeadline: new Date(train.actualArrival).getTime(),
      acceptanceDeadline: currentNow + 60 * 1000,
      deliveryAgentId: assignedAgentId,
      otp: String(Math.floor(1000 + Math.random() * 9000)),
      estimatedPackMinutes: 3,
      edgeFlag: classifyStockEdgeState(randomSku).state,
      updatedAt: currentNow,
    };

    setOrders(prev => [newOrder, ...prev]);
    setIncomingOrder(newOrder);
    logAudit('SIM_NEW_ORDER', `Simulated new order push: ${newOrderId} for Train ${train.trainNumber}`);
    addToast('order_new', `⚡ NEW ORDER RECEIVED: ${newOrderId}`, `Train ${train.trainNumber} (${train.platformNumber})`);
    alertManager.triggerUrgentAlert(newOrderId);
  };

  const simTriggerStockAnomaly = (skuId: string) => {
    setSkus(prev => prev.map(s => (s.id === skuId ? { ...s, stockOnHand: -3, updatedAt: Date.now() } : s)));
    logAudit('SIM_STOCK_ANOMALY', `Simulated negative stock anomaly (-3) for SKU ${skuId}`);
    addToast('stock_alert', `⚠️ STOCK ANOMALY FLAGGED`, `SKU marked INVALID (-3 units recorded). Orders auto-blocked.`);
  };

  const resetAllDemoData = () => {
    setVendor(INITIAL_VENDOR);
    setTrains(INITIAL_TRAINS);
    setOrders(INITIAL_ORDERS);
    setSkus(INITIAL_SKUS);
    setAgents(INITIAL_AGENTS);
    setSalesLogs(INITIAL_SALES_LOGS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    localStorage.clear();
    logAudit('RESET_DEMO', 'Reset application state to initial demo data');
  };

  return (
    <AppContext.Provider
      value={{
        vendor,
        trains,
        orders,
        skus,
        agents,
        salesLogs,
        auditLogs,
        nowMs,
        selectedOrder,
        incomingOrder,
        activeTab,
        isSimulatorOpen,
        isAIAssistantOpen,
        isOffline,
        isAutoStreamEnabled,
        toastMessages,
        setSelectedOrder,
        setIncomingOrder,
        setActiveTab,
        setIsSimulatorOpen,
        setIsAIAssistantOpen,
        setIsAutoStreamEnabled,
        toggleVendorOnline,
        updateHandoffBuffer,
        dismissToast,
        startPackingOrder,
        markOrderPacked,
        assignDeliveryAgent,
        acceptAgentHandover,
        reportOrderIssue,
        resolveBlockedOrder,
        updateSKUStock,
        restockSKU,
        editSKUCatalog,
        simTriggerTrainDelay,
        simChangeTrainPlatform,
        simPushNewOrder,
        simTriggerStockAnomaly,
        resetAllDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
