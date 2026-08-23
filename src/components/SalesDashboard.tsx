import React from 'react';
import { useApp } from '../context/AppContext';
import { useLang } from '../context/LanguageContext';
import { exportSalesCSV } from '../utils/exportUtils';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Download, IndianRupee, Clock, CheckCircle, Package } from 'lucide-react';

export const SalesDashboard: React.FC = () => {
  const { salesLogs, vendor } = useApp();
  const { t } = useLang();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = salesLogs.filter(l => l.date === todayStr);

  const totalRevenue = todayLogs.reduce((sum, l) => sum + l.revenue, 0);
  const totalOrders = todayLogs.length;
  const onTimeCount = todayLogs.filter(l => l.wasOnTime).length;
  const onTimePercent = totalOrders > 0 ? Math.round((onTimeCount / totalOrders) * 100) : 100;
  const avgPackTimeSec = totalOrders > 0 ? Math.round(todayLogs.reduce((sum, l) => sum + l.packTimeSeconds, 0) / totalOrders) : 145;

  const chartData = [
    { hour: '8am', revenue: 160 },
    { hour: '10am', revenue: 320 },
    { hour: '12pm', revenue: 480 },
    { hour: '2pm', revenue: 640 },
    { hour: '4pm', revenue: 800 },
    { hour: '6pm', revenue: totalRevenue || 1240 },
  ];

  return (
    <div className="space-y-3 slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight">{t('sales.title')}</h2>
          <p className="text-xs text-slate-500 font-medium">Shift KPI Performance & Revenue Analysis</p>
        </div>

        <button
          onClick={() => exportSalesCSV(todayLogs, vendor)}
          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{t('sales.export')}</span>
        </button>
      </div>

      {/* 2x2 KPI Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="card p-3 bg-white border-slate-200">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{t('sales.revenue')}</div>
          <div className="text-lg font-black text-slate-900">₹{totalRevenue.toLocaleString('en-IN')}</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> Live Sales Ticker
          </div>
        </div>

        <div className="card p-3 bg-white border-slate-200">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{t('sales.onTime')}</div>
          <div className="text-lg font-black text-emerald-700">{onTimePercent}%</div>
          <div className="text-[10px] text-slate-500 font-medium mt-0.5">{onTimeCount} of {totalOrders} orders</div>
        </div>

        <div className="card p-3 bg-white border-slate-200">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{t('sales.avgPack')}</div>
          <div className="text-lg font-black text-slate-900">{Math.floor(avgPackTimeSec / 60)}m {avgPackTimeSec % 60}s</div>
          <div className="text-[10px] text-slate-500 font-medium mt-0.5">Target: &lt; 3 mins</div>
        </div>

        <div className="card p-3 bg-white border-slate-200">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{t('sales.sold')}</div>
          <div className="text-lg font-black text-slate-900">{totalOrders} Orders</div>
          <div className="text-[10px] text-slate-500 font-medium mt-0.5">NDLS Platform #14</div>
        </div>
      </div>

      {/* Hourly Revenue Area Chart */}
      <div className="card p-3.5 bg-white border-slate-200">
        <h3 className="text-xs font-bold text-slate-900 mb-2">Hourly Revenue Trend (₹)</h3>
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Area type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
