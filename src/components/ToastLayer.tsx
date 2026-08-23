import React from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckCircle2, Zap, AlertTriangle } from 'lucide-react';

export const ToastLayer: React.FC = () => {
  const { toastMessages, dismissToast } = useApp();

  if (toastMessages.length === 0) return null;

  return (
    <div className="fixed top-3 right-3 left-3 z-50 pointer-events-none flex flex-col gap-2 max-w-[400px] mx-auto">
      {toastMessages.map(toast => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-white border border-slate-200 shadow-xl rounded-2xl p-3 flex items-start justify-between toast-in"
        >
          <div className="flex items-start gap-2.5">
            <div className={`p-1.5 rounded-xl text-white shrink-0 ${
              toast.type === 'order_new' ? 'bg-emerald-600' :
              toast.type === 'order_packed' ? 'bg-purple-600' : 'bg-amber-600'
            }`}>
              {toast.type === 'order_new' ? <Zap className="w-4 h-4" /> :
               toast.type === 'order_packed' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            </div>

            <div>
              <h4 className="text-xs font-black text-slate-900">{toast.title}</h4>
              <p className="text-[11px] text-slate-600 font-medium">{toast.message}</p>
            </div>
          </div>

          <button
            onClick={() => dismissToast(toast.id)}
            className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
