import React from 'react';
import { useApp } from '../context/AppContext';
import { useLang } from '../context/LanguageContext';
import { Package, Train, Box, BarChart3, Bot } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, orders, setIsAIAssistantOpen } = useApp();
  const { t } = useLang();

  const activeCount = orders.filter(o => o.status === 'new' || o.status === 'packing').length;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 pb-safe shadow-lg max-w-[430px] mx-auto">
      <div className="flex items-center justify-around h-15 px-1 relative">
        {/* Orders Tab */}
        <button
          onClick={() => setActiveTab('queue')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
            activeTab === 'queue' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <div className="relative">
            <Package className="w-5 h-5" />
            {activeCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-emerald-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
                {activeCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">{t('nav.orders')}</span>
        </button>

        {/* Trains Tab */}
        <button
          onClick={() => setActiveTab('trains')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
            activeTab === 'trains' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Train className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{t('nav.trains')}</span>
        </button>

        {/* Center Floating NVIDIA AI Assistant Orb */}
        <div className="flex-1 flex justify-center items-center -mt-5 relative z-50">
          <button
            onClick={() => setIsAIAssistantOpen(true)}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 border-2 border-white transform transition-transform active:scale-95 cursor-pointer ring-pulse-green"
            title="Open NVIDIA AI Voice Assistant"
          >
            <Bot className="w-6 h-6 animate-pulse" />
          </button>
        </div>

        {/* Stock Tab */}
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
            activeTab === 'inventory' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Box className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{t('nav.stock')}</span>
        </button>

        {/* Sales Tab */}
        <button
          onClick={() => setActiveTab('sales')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
            activeTab === 'sales' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{t('nav.sales')}</span>
        </button>
      </div>
    </nav>
  );
};
