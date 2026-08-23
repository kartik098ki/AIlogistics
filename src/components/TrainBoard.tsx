import React from 'react';
import { useApp } from '../context/AppContext';
import { useLang } from '../context/LanguageContext';
import { Train as TrainIcon, Clock, AlertTriangle, Zap } from 'lucide-react';

export const TrainBoard: React.FC = () => {
  const { trains, orders, nowMs } = useApp();
  const { t } = useLang();

  const trainsList = Object.values(trains).sort((a, b) => {
    return new Date(a.actualArrival).getTime() - new Date(b.actualArrival).getTime();
  });

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div className="space-y-3 slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
            <span>{t('trains.board')}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 dot-live"></span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">Platform Timetable & Halt Windows</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {trainsList.map(train => {
          const activeTrainOrders = orders.filter(
            o => o.trainId === train.id && (o.status === 'new' || o.status === 'packing')
          );
          const isCriticalHalt = train.haltMinutes <= 2;

          return (
            <div key={train.id} className="card p-3.5 bg-white border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                    <TrainIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-xs text-slate-900">{train.trainName}</h3>
                    <span className="font-mono text-[10px] text-slate-500 font-bold">#{train.trainNumber}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {train.platformNumber}
                  </span>
                  {isCriticalHalt && (
                    <span className="pill-invalid px-1.5 py-0.5 text-[10px] font-bold rounded flex items-center gap-0.5 flash-red">
                      <Zap className="w-3 h-3" /> {train.haltMinutes}m Halt
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 text-center text-xs">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">{t('trains.sched')}</div>
                  <div className="font-mono font-bold text-slate-800">{formatTime(train.scheduledArrival)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">{t('trains.actual')}</div>
                  <div className="font-mono font-bold text-emerald-700">{formatTime(train.actualArrival)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">{t('trains.halt')}</div>
                  <div className="font-bold text-slate-900">{train.haltMinutes} Mins</div>
                </div>
              </div>

              {activeTrainOrders.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {activeTrainOrders.length} {t('trains.pendingOrders')}
                  </span>
                  <span className="text-slate-500 font-medium text-[11px]">
                    Must pack before arrival
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
