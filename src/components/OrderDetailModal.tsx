import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLang } from '../context/LanguageContext';
import { X, CheckSquare, Square, AlertCircle, ShieldAlert, CheckCircle2, ChevronRight, UserCheck } from 'lucide-react';
import { OTPVerificationModal } from './OTPVerificationModal';

export const OrderDetailModal: React.FC = () => {
  const { selectedOrder, setSelectedOrder, markOrderPacked, reportOrderIssue, agents, trains } = useApp();
  const { t } = useLang();

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [showIssueInput, setShowIssueInput] = useState<boolean>(false);
  const [issueNotes, setIssueNotes] = useState<string>('');
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);

  if (!selectedOrder) return null;

  const train = trains[selectedOrder.trainId];
  const assignedAgent = agents.find(a => a.id === selectedOrder.deliveryAgentId);

  const toggleCheck = (skuId: string) => {
    setCheckedItems(prev => ({ ...prev, [skuId]: !prev[skuId] }));
  };

  const allChecked = selectedOrder.items.every(i => checkedItems[i.skuId]);

  const handleMarkPacked = () => {
    markOrderPacked(selectedOrder.id);
    setShowOtpModal(true);
  };

  const handleSubmitIssue = (type: 'partial' | 'blocked' | 'unresolved') => {
    if (!issueNotes.trim()) return;
    reportOrderIssue(selectedOrder.id, type, issueNotes);
    setShowIssueInput(false);
    setSelectedOrder(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 slide-up max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={() => setSelectedOrder(null)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-black bg-slate-100 text-slate-900 px-2.5 py-0.5 rounded-md border border-slate-200">
              {selectedOrder.id}
            </span>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              PF {selectedOrder.platformNumber}
            </span>
          </div>

          <h3 className="font-black text-base text-slate-900">{selectedOrder.trainName} ({selectedOrder.trainNumber})</h3>
          <p className="text-xs text-slate-600 font-medium">
            Coach <span className="font-bold text-slate-900">{selectedOrder.coachNumber}</span> • Seat <span className="font-bold text-slate-900">{selectedOrder.seatNumber}</span> • {selectedOrder.passengerName}
          </p>
        </div>

        {/* Checklist */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 mb-4 space-y-2">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">
            {t('checklist.checkAll')}
          </div>

          {selectedOrder.items.map(item => {
            const isChecked = !!checkedItems[item.skuId];
            return (
              <div
                key={item.skuId}
                onClick={() => toggleCheck(item.skuId)}
                className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-colors ${
                  isChecked ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="text-xs font-bold">{item.qty}x {item.name}</span>
                </div>
                <span className="font-mono text-xs text-slate-500">₹{item.price * item.qty}</span>
              </div>
            );
          })}
        </div>

        {/* Delivery Partner */}
        <div className="bg-slate-100 border border-slate-200 rounded-2xl p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Runner: {assignedAgent?.name || 'Ramesh Kumar'}</span>
          </div>
          <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-300">
            OTP: {selectedOrder.otp || '4829'}
          </span>
        </div>

        {/* Actions */}
        {showIssueInput ? (
          <div className="space-y-2 bg-red-50 border border-red-200 rounded-2xl p-3">
            <textarea
              value={issueNotes}
              onChange={e => setIssueNotes(e.target.value)}
              placeholder={t('checklist.issueDesc')}
              className="w-full text-xs p-2 bg-white border border-red-200 rounded-xl focus:outline-none text-slate-900"
              rows={2}
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSubmitIssue('blocked')}
                className="py-1.5 bg-red-600 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Block Order
              </button>
              <button
                onClick={() => handleSubmitIssue('partial')}
                className="py-1.5 bg-amber-600 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Partial Pack
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={handleMarkPacked}
              disabled={!allChecked}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs rounded-2xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Packed & Verify OTP</span>
            </button>

            <button
              onClick={() => setShowIssueInput(true)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl border border-slate-200 cursor-pointer"
            >
              {t('checklist.reportIssue')}
            </button>
          </div>
        )}
      </div>

      {showOtpModal && (
        <OTPVerificationModal
          order={selectedOrder}
          onClose={() => {
            setShowOtpModal(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};
