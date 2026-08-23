import React from 'react';
import { useApp } from '../context/AppContext';
import { useLang } from '../context/LanguageContext';
import { Settings, RefreshCw, Train, Package, Zap, AlertTriangle, SlidersHorizontal } from 'lucide-react';

export const AdminSimulatorDrawer: React.FC = () => {
  const { 
    vendor, updateHandoffBuffer, simPushNewOrder, simTriggerTrainDelay, 
    simChangeTrainPlatform, simTriggerStockAnomaly, resetAllDemoData, skus, trains 
  } = useApp();
  const { lang, setLang, t } = useLang();

  const trainsList = Object.values(trains);

  return (
    <div className="space-y-3 slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight">{t('settings.title')}</h2>
          <p className="text-xs text-slate-500 font-medium">Stall Configuration & Station Simulator</p>
        </div>
      </div>

      {/* Section 1: Vendor Buffer & Language */}
      <div className="card p-3.5 bg-white border-slate-200 space-y-3">
        <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
          <span>Stall Configuration</span>
        </h3>

        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-600 font-medium">{t('settings.buffer')}</span>
            <span className="font-bold text-slate-900">{vendor.handoffBufferMinutes} Mins</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={vendor.handoffBufferMinutes}
            onChange={(e) => updateHandoffBuffer(parseInt(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer"
          />
        </div>

        <div>
          <span className="text-xs text-slate-600 font-medium block mb-1.5">{t('settings.language')}</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setLang('en')}
              className={`py-1.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                lang === 'en' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLang('hi')}
              className={`py-1.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                lang === 'hi' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              हिंदी (Devanagari)
            </button>
          </div>
        </div>
      </div>

      {/* Section 2: Simulator Controls */}
      <div className="card p-3.5 bg-white border-slate-200 space-y-2.5">
        <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-600" />
          <span>{t('settings.simulator')}</span>
        </h3>

        <button
          onClick={() => simPushNewOrder()}
          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Package className="w-4 h-4" />
          <span>Simulate Incoming New Order (60s Timer)</span>
        </button>

        {trainsList.map(tItem => (
          <div key={tItem.id} className="flex gap-2">
            <button
              onClick={() => simTriggerTrainDelay(tItem.id, 5)}
              className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg border border-slate-300 cursor-pointer"
            >
              +5m Delay ({tItem.trainNumber})
            </button>
            <button
              onClick={() => simChangeTrainPlatform(tItem.id, tItem.platformNumber === 'PF-1' ? 'PF-3' : 'PF-1')}
              className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg border border-slate-300 cursor-pointer"
            >
              Change PF ({tItem.trainNumber})
            </button>
          </div>
        ))}

        {skus[0] && (
          <button
            onClick={() => simTriggerStockAnomaly(skus[0].id)}
            className="w-full py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl border border-amber-300 cursor-pointer flex items-center justify-center gap-1"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Trigger Stock Anomaly (INVALID State)</span>
          </button>
        )}

        <button
          onClick={resetAllDemoData}
          className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 transition-colors cursor-pointer flex items-center justify-center gap-1 mt-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t('settings.reset')}</span>
        </button>
      </div>
    </div>
  );
};
