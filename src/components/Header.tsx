import React from 'react';
import { useApp } from '../context/AppContext';
import { useLang } from '../context/LanguageContext';
import { Settings, ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
  const { vendor, toggleVendorOnline, salesLogs, setActiveTab } = useApp();
  const { lang, setLang, t } = useLang();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRevenue = salesLogs
    .filter(l => l.date === todayStr)
    .reduce((sum, l) => sum + l.revenue, 0);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 pt-safe px-3.5 py-2.5 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Brand & Online Toggle */}
        <div className="flex items-center gap-2">
          <div 
            onClick={toggleVendorOnline}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
              vendor.isOnline 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-xs' 
                : 'bg-slate-100 text-slate-600 border-slate-300'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${vendor.isOnline ? 'bg-emerald-500 dot-live' : 'bg-slate-400'}`}></span>
            <span>{vendor.stationCode}</span>
            <span className="text-[10px] opacity-75">• Stall #14</span>
          </div>
        </div>

        {/* Revenue Ticker & Quick Controls */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{t('app.today')}</div>
            <div className="text-xs font-black text-slate-900">₹{todayRevenue.toLocaleString('en-IN')}</div>
          </div>

          {/* Language Toggle EN/HI */}
          <button
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="px-2 py-1 bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200 font-bold text-xs rounded-lg transition-colors cursor-pointer"
            title="Toggle App Language"
          >
            {lang === 'en' ? 'EN ↔ हिं' : 'हिं ↔ EN'}
          </button>

          {/* Settings / Simulator Icon */}
          <button
            onClick={() => setActiveTab('admin')}
            className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
            title={t('settings.title')}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
