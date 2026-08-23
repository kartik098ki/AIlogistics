import React, { useState, useEffect } from 'react';
import { Order, Train } from '../types';
import { useLang } from '../context/LanguageContext';
import { Clock, ShieldAlert, Train as TrainIcon, CheckCircle2, X } from 'lucide-react';

interface IncomingOrderModalProps {
  order: Order | null;
  train: Train | null;
  onAccept: () => void;
  onDismiss: () => void;
}

export const IncomingOrderModal: React.FC<IncomingOrderModalProps> = ({
  order,
  train,
  onAccept,
  onDismiss,
}) => {
  const { t } = useLang();
  const [secondsLeft, setSecondsLeft] = useState<number>(60);

  useEffect(() => {
    if (!order) return;
    setSecondsLeft(60);

    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onDismiss(); // Auto-reassign to alternate platform stall
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [order, onDismiss]);

  if (!order) return null;

  const progressPercent = (secondsLeft / 60) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs fade-in">
      <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 slide-up relative overflow-hidden">
        {/* Animated Progress Line */}
        <div 
          className="absolute top-0 left-0 h-1.5 bg-emerald-500 transition-all duration-1000 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
              ⚡
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
                ⚡ NEW INCOMING ORDER
              </span>
              <span className="font-mono text-sm font-black text-slate-900">{order.id}</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-lg font-black text-slate-900 flash-red">{secondsLeft}s</span>
            <span className="text-[10px] text-slate-500 font-semibold block">Accept Window</span>
          </div>
        </div>

        {/* Train Details */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 mb-3">
          <div className="flex justify-between items-baseline mb-1">
            <h4 className="font-black text-xs text-slate-900">{order.trainName} ({order.trainNumber})</h4>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
              PF-{order.platformNumber}
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            Coach <span className="font-bold text-slate-900">{order.coachNumber}</span> • Seat <span className="font-bold text-slate-900">{order.seatNumber}</span> • {order.passengerName}
          </p>
        </div>

        {/* Items List */}
        <div className="space-y-1 mb-4">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Order Items:</div>
          {order.items.map(item => (
            <div key={item.skuId} className="flex justify-between text-xs font-semibold text-slate-800">
              <span>{item.qty}x {item.name}</span>
              <span className="font-mono text-slate-600">₹{item.price * item.qty}</span>
            </div>
          ))}
        </div>

        {/* Timeout Reassign Notice */}
        <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 p-2 rounded-xl text-center font-semibold mb-4">
          ⚠️ Accept within {secondsLeft}s or order will auto-reassign to alternate platform stall.
        </p>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onDismiss}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors cursor-pointer"
          >
            Transfer Order
          </button>
          <button
            onClick={onAccept}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
          >
            Accept & Pack
          </button>
        </div>
      </div>
    </div>
  );
};
