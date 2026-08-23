import React from 'react';
import { useApp } from '../context/AppContext';
import { useLang } from '../context/LanguageContext';
import { classifyStockEdgeState } from '../utils/mathEngine';
import { Box, AlertTriangle, PlusCircle, ShieldAlert } from 'lucide-react';

export const InventoryView: React.FC = () => {
  const { skus, salesLogs, restockSKU } = useApp();
  const { t } = useLang();

  return (
    <div className="space-y-3 slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight">{t('stock.title')}</h2>
          <p className="text-xs text-slate-500 font-medium">{t('stock.aiClassifier')}</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {skus.map(sku => {
          const edge = classifyStockEdgeState(sku, salesLogs);
          const isLow = sku.stockOnHand <= sku.reorderPoint;
          const isInvalid = sku.stockOnHand < 0;

          return (
            <div key={sku.id} className="card p-3.5 bg-white border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <div>
                  <h3 className="font-bold text-xs text-slate-900">{sku.name}</h3>
                  <span className="text-[10px] text-slate-500 font-semibold">{sku.category}</span>
                </div>

                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                    edge.state === 'INVALID'
                      ? 'pill-invalid flash-red'
                      : edge.state === 'NEAR_LIMIT'
                      ? 'pill-near-limit'
                      : edge.state === 'OVER_LIMIT'
                      ? 'pill-over-limit'
                      : 'pill-ok'
                  }`}
                >
                  {t(`edge.${edge.state === 'NEAR_LIMIT' ? 'nearLimit' : edge.state === 'OVER_LIMIT' ? 'overLimit' : edge.state.toLowerCase()}`)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 text-center text-xs mb-2">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">{t('stock.stockOnHand')}</div>
                  <div className={`font-mono font-black ${isInvalid ? 'text-red-600' : isLow ? 'text-amber-700' : 'text-slate-900'}`}>
                    {sku.stockOnHand}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">{t('stock.reorderAt')}</div>
                  <div className="font-mono font-bold text-slate-700">{sku.reorderPoint}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Price</div>
                  <div className="font-mono font-bold text-slate-900">₹{sku.unitPrice}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500 font-medium">
                  {edge.reason}
                </span>

                <button
                  onClick={() => restockSKU(sku.id, 10)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg border border-slate-300 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('stock.restock')}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
