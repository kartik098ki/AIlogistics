import { Order, Train, SKU, StockEdgeState, EdgeExplanation, SalesLog } from '../types';

export const EPSILON = 0.1; // minimum minutes buffer to prevent division by zero

export function calculatePriorityScore(
  order: Order,
  train: Train,
  handoffBufferMinutes: number,
  nowMs: number = Date.now()
): { priorityScore: number; effectiveMinutesRemaining: number; minutesToDeadline: number } {
  const arrivalMs = new Date(train.actualArrival).getTime();
  const bufferMs = handoffBufferMinutes * 60 * 1000;
  const effectiveDeadlineMs = arrivalMs - bufferMs;

  const minutesToDeadline = (arrivalMs - nowMs) / (60 * 1000);
  const effectiveMinutesRemaining = (effectiveDeadlineMs - nowMs) / (60 * 1000);

  const effectiveTimeForScore = Math.max(effectiveMinutesRemaining, EPSILON);
  const urgencyScore = 1 / effectiveTimeForScore;

  let haltPenalty = 1.0;
  if (train.haltMinutes <= 2) {
    haltPenalty = 3.0;
  } else if (train.haltMinutes <= 5) {
    haltPenalty = 1.6;
  }

  const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0);
  const complexityPenalty = 1 + 0.05 * itemCount;

  const priorityScore = urgencyScore * haltPenalty * complexityPenalty;

  return {
    priorityScore,
    effectiveMinutesRemaining,
    minutesToDeadline,
  };
}

export function sortOrdersByPriority(
  orders: Order[],
  trainsMap: Record<string, Train>,
  handoffBufferMinutes: number,
  nowMs: number = Date.now()
): Order[] {
  return [...orders].sort((a, b) => {
    const trainA = trainsMap[a.trainId];
    const trainB = trainsMap[b.trainId];

    const scoreA = trainA
      ? calculatePriorityScore(a, trainA, handoffBufferMinutes, nowMs).priorityScore
      : 0;
    const scoreB = trainB
      ? calculatePriorityScore(b, trainB, handoffBufferMinutes, nowMs).priorityScore
      : 0;

    if (Math.abs(scoreA - scoreB) < 0.0001) {
      return a.placedAt - b.placedAt;
    }

    return scoreB - scoreA;
  });
}

export function classifyStockEdgeState(
  sku: SKU,
  salesLogs: SalesLog[] = []
): EdgeExplanation {
  const S = sku.stockOnHand;
  const R = sku.reorderPoint;
  const M = sku.maxStock;
  const A = Math.max(sku.avgDailySales, 0.1);

  const hasNegativeStock = S < 0;
  const hasSaleOnZeroStock = salesLogs.some(log =>
    log.itemsSold.some(item => item.skuId === sku.id) && S === 0
  );
  const isOverstockedBy20Percent = S > M * 1.2;

  if (hasNegativeStock || hasSaleOnZeroStock || isOverstockedBy20Percent) {
    let reason = 'Stock anomaly detected.';
    if (hasNegativeStock) reason = `Negative stock count recorded (${S} units).`;
    else if (hasSaleOnZeroStock) reason = `Sale recorded when stock was 0.`;
    else if (isOverstockedBy20Percent) reason = `Stock (${S}) exceeds maximum capacity (${M}) by >20%.`;

    return {
      skuId: sku.id,
      skuName: sku.name,
      state: 'INVALID',
      severity: 'critical',
      reason,
      recommendation: 'Freeze ordering for this SKU. Audit counter inventory & reconcile LWW logs immediately.',
    };
  }

  if (S > M) {
    return {
      skuId: sku.id,
      skuName: sku.name,
      state: 'OVER_LIMIT',
      severity: 'warning',
      reason: `Stock (${S}) exceeds maximum capacity (${M}).`,
      recommendation: 'Pause supplier replenishment. Promote item in kiosk bundles.',
    };
  }

  if (S <= R) {
    const hoursLeft = Math.max(0, Math.round((S / A) * 24));
    return {
      skuId: sku.id,
      skuName: sku.name,
      state: 'NEAR_LIMIT',
      severity: S <= R / 2 ? 'critical' : 'warning',
      hoursOfStockLeft: hoursLeft,
      reason: `Stock (${S}) is at or below reorder threshold (${R}). ~${hoursLeft}h remaining.`,
      recommendation: `Trigger express restock request for +${M - S} units to maintain service levels.`,
    };
  }

  return {
    skuId: sku.id,
    skuName: sku.name,
    state: 'OK',
    reason: 'Stock levels are healthy.',
    recommendation: 'No action required.',
  };
}

export function deriveOrderEdgeFlag(
  orderItems: { skuId: string; qty: number }[],
  skusMap: Record<string, SKU>
): StockEdgeState {
  const edgePriority: Record<StockEdgeState, number> = {
    INVALID: 4,
    OVER_LIMIT: 3,
    NEAR_LIMIT: 2,
    OK: 1,
  };

  let worstState: StockEdgeState = 'OK';

  for (const item of orderItems) {
    const sku = skusMap[item.skuId];
    if (!sku) continue;
    const explanation = classifyStockEdgeState(sku);
    if (edgePriority[explanation.state] > edgePriority[worstState]) {
      worstState = explanation.state;
    }
  }

  return worstState;
}

export function calculateReorderPointAndForecast(
  sku: SKU,
  smoothingFactorAlpha: number = 0.2
): { forecastDailySales: number; newReorderPoint: number } {
  const recentDemand = sku.unitsSoldLast3Days / 3;
  const forecastDailySales = smoothingFactorAlpha * recentDemand + (1 - smoothingFactorAlpha) * sku.avgDailySales;
  const leadTimeDays = Math.max(sku.leadTimeDays, 1);
  const safetyStock = Math.ceil(forecastDailySales * 0.5);
  const newReorderPoint = Math.ceil(forecastDailySales * leadTimeDays + safetyStock);

  return {
    forecastDailySales: Math.round(forecastDailySales * 10) / 10,
    newReorderPoint,
  };
}
