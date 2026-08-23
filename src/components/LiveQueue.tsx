import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLang } from '../context/LanguageContext';
import { sortOrdersByPriority, calculatePriorityScore } from '../utils/mathEngine';
import { Clock, ShieldAlert, CheckCircle2, ChevronRight, UserCheck, Flame, Zap } from 'lucide-react';
import { OTPVerificationModal } from './OTPVerificationModal';
import { Order } from '../types';

export const LiveQueue: React.FC = () => {
  const { orders, trains, vendor, setSelectedOrder, startPackingOrder, markOrderPacked, nowMs, agents } = useApp();
  const { t } = useLang();

  const [otpModalOrder, setOtpModalOrder] = useState<Order | null>(null);

  const activeOrders = orders.filter(o => o.status === 'new' || o.status === 'packing');
  const sortedActive = sortOrdersByPriority(activeOrders, trains, vendor.handoffBufferMinutes, nowMs);

  const formatRemainingTime = (actualArrivalIso: string) => {
    const arrMs = new Date(actualArrivalIso).getTime();
    const diffSec = Math.floor((arrMs - nowMs) / 1000);
    if (diffSec <= 0) return 'Arrived / लेफ़्ट';
    const m = Math.floor(diffSec / 60);
    const s = diffSec % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <div className="space-y-3 slide-up">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
            <span>{t('queue.liveOrders')}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 dot-live"></span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">Focused Station Counter Queue ({sortedActive.length} active)</p>
        </div>
      </div>

      {/* Active Queue Cards */}
      {sortedActive.length === 0 ? (
        <div className="card p-8 text-center bg-white border-slate-200">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">{t('queue.allCaughtUp')}</h3>
          <p className="text-xs text-slate-500 mt-1">{t('queue.watching')}</p>
        </div>
      ) : (
        sortedActive.map((order, index) => {
          const train = trains[order.trainId];
          const isTopPriority = index === 0;
          const assignedAgent = agents.find(a => a.id === order.deliveryAgentId);
          const priorityInfo = train ? calculatePriorityScore(order, train, vendor.handoffBufferMinutes, nowMs) : null;
          const isUrgentHalt = train ? train.haltMinutes <= 2 : false;

          return (
            <div
              key={order.id}
              className={`card p-4 transition-all relative overflow-hidden ${
                isTopPriority 
                  ? 'border-emerald-300 ring-2 ring-emerald-500/20 shadow-md bg-white' 
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Urgency Ribbon */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {order.id}
                  </span>

                  {isUrgentHalt ? (
                    <span className="pill-invalid px-2 py-0.5 text-[10px] font-bold rounded-md flex items-center gap-1 flash-red">
                      <Flame className="w-3 h-3" /> {t('queue.urgentPriority')} ({train?.haltMinutes}m Halt)
                    </span>
                  ) : isTopPriority ? (
                    <span className="pill-near-limit px-2 py-0.5 text-[10px] font-bold rounded-md flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-600" /> {t('queue.highPriority')}
                    </span>
                  ) : (
                    <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 text-[10px] font-bold rounded-md">
                      {t('queue.normalPriority')}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{train ? formatRemainingTime(train.actualArrival) : '6m'}</span>
                </div>
              </div>

              {/* Train & Passenger Info */}
              <div className="mb-3">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-black text-sm text-slate-900">{order.trainName} ({order.trainNumber})</h3>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    PF {order.platformNumber}
                  </span>
                </div>
                <div className="text-xs text-slate-600 font-medium mt-0.5">
                  Coach <span className="font-bold text-slate-900">{order.coachNumber}</span> • Seat <span className="font-bold text-slate-900">{order.seatNumber}</span> • {order.passengerName}
                </div>
              </div>

              {/* Items List */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 mb-3 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
                  ⏱️ Target Pack Window: {order.estimatedPackMinutes || 3} mins
                </div>
                {order.items.map(item => (
                  <div key={item.skuId} className="flex justify-between items-center text-xs font-semibold text-slate-800">
                    <span>{item.qty}x {item.name}</span>
                    <span className="text-slate-500 font-mono">₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>

              {/* Delivery Runner & Action Controls */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Runner: <strong className="text-slate-900">{assignedAgent?.name || 'Ramesh Kumar'}</strong></span>
                </div>

                <div className="flex gap-2">
                  {order.status === 'new' ? (
                    <button
                      onClick={() => startPackingOrder(order.id)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      {t('queue.startPacking')}
                    </button>
                  ) : (
                    <button
                      onClick={() => setOtpModalOrder(order)}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>OTP Handover</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* OTP Delivery Verification Sheet */}
      {otpModalOrder && (
        <OTPVerificationModal
          order={otpModalOrder}
          onClose={() => setOtpModalOrder(null)}
        />
      )}
    </div>
  );
};
