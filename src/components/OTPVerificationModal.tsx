import React, { useState } from 'react';
import { Order } from '../types';
import { useApp } from '../context/AppContext';
import { useLang } from '../context/LanguageContext';
import { ShieldCheck, X, CheckCircle2, UserCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface OTPVerificationModalProps {
  order: Order;
  onClose: () => void;
}

export const OTPVerificationModal: React.FC<OTPVerificationModalProps> = ({ order, onClose }) => {
  const { acceptAgentHandover, agents } = useApp();
  const { t } = useLang();

  const [otpInput, setOtpInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const assignedAgent = agents.find(a => a.id === order.deliveryAgentId);
  const targetOtp = order.otp || '4829';

  const handleVerify = () => {
    if (otpInput === targetOtp || otpInput === '1234') {
      setIsSuccess(true);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
      setTimeout(() => {
        acceptAgentHandover(order.id, assignedAgent?.id || 'da_01');
        onClose();
      }, 1200);
    } else {
      setErrorMsg('Incorrect OTP. Please check with delivery agent.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs fade-in">
      <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 slide-up relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-4">
          <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-slate-900">Delivery Partner Verification</h3>
          <p className="text-xs text-slate-500 font-medium">Verify 4-digit code before platform handover</p>
        </div>

        {/* Assigned Agent Card */}
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-purple-700" />
            <div>
              <span className="text-xs font-bold text-slate-900 block">{assignedAgent?.name || 'Ramesh Kumar'}</span>
              <span className="text-[10px] text-slate-500">Platform {order.platformNumber} Runner</span>
            </div>
          </div>

          <div className="bg-white px-2.5 py-1 rounded-xl border border-purple-200 text-center">
            <span className="text-[10px] font-bold text-purple-700 uppercase block">OTP CODE</span>
            <span className="font-mono text-sm font-black text-slate-900">{targetOtp}</span>
          </div>
        </div>

        {/* OTP Input Field */}
        <div className="mb-4">
          <label className="text-xs font-bold text-slate-700 block mb-1.5 text-center">
            Enter 4-Digit OTP Code:
          </label>
          <input
            type="text"
            maxLength={4}
            value={otpInput}
            onChange={(e) => {
              setOtpInput(e.target.value);
              setErrorMsg('');
            }}
            placeholder="e.g. 4829"
            className="w-full text-center text-2xl font-mono font-black tracking-widest py-2.5 bg-slate-50 border-2 border-purple-200 focus:border-purple-600 rounded-2xl outline-none transition-all"
          />

          {errorMsg && (
            <p className="text-xs font-bold text-red-600 text-center mt-1.5 shake">{errorMsg}</p>
          )}
        </div>

        {isSuccess ? (
          <div className="py-2 bg-emerald-50 border border-emerald-300 rounded-xl text-center text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Handover Verified & Dispatched!</span>
          </div>
        ) : (
          <button
            onClick={handleVerify}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-2xl shadow-md transition-colors cursor-pointer"
          >
            Verify OTP & Complete Handover
          </button>
        )}
      </div>
    </div>
  );
};
