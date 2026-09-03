import React from 'react';
import { AreaChart, Area, XAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowUp, ArrowDown } from 'lucide-react';

export interface InsightMetric {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'none';
  trendType?: 'good' | 'bad' | 'neutral';
  icon?: React.ReactNode;
}

export interface InsightSeries {
  key: string;
  name: string;
  color: string;
}

export interface InsightCardProps {
  title: string;
  data: any[];
  xAxisKey: string;
  series: InsightSeries[];
  metrics?: InsightMetric[];
  className?: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({ 
  title, 
  data,
  xAxisKey,
  series,
  metrics = [],
  className = ""
}) => {
  return (
    <div className={`rounded-3xl p-6 shadow-2xl flex flex-col ${className}`}>
      <h2 className="text-app-textPrimary text-2xl font-bold mb-6 font-sans tracking-tight">{title}</h2>
      
      {/* Legend */}
      <div className="flex gap-6 mb-8 flex-wrap">
        {series.map((s) => (
          <div key={s.key} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: s.color }} />
            <span className="text-[#8B949E] text-sm font-sans">{s.name}</span>
          </div>
        ))}
      </div>
      
      {/* Chart */}
      <div className="h-[240px] w-full mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              {series.map((s, idx) => (
                <linearGradient key={`grad-${idx}`} id={`color-${s.key}`}>
                  {/* Animate gradient angle slightly to give a liquid moving effect */}
                  <animate attributeName="x1" values="0%; 30%; 0%" dur={`${7 + idx * 1.5}s`} repeatCount="indefinite" />
                  <animate attributeName="y1" values="0%; 15%; 0%" dur={`${5 + idx * 1.2}s`} repeatCount="indefinite" />
                  <animate attributeName="x2" values="0%; -30%; 0%" dur={`${8 + idx * 1.1}s`} repeatCount="indefinite" />
                  <animate attributeName="y2" values="100%; 85%; 100%" dur={`${6 + idx * 1.3}s`} repeatCount="indefinite" />
                  
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.5}>
                    <animate attributeName="stop-opacity" values="0.3; 0.8; 0.3" dur={`${4 + idx}s`} repeatCount="indefinite" />
                  </stop>
                  <stop offset="100%" stopColor={s.color} stopOpacity={0}>
                    <animate attributeName="stop-opacity" values="0; 0.2; 0" dur={`${5 + idx}s`} repeatCount="indefinite" />
                  </stop>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2928" vertical={true} horizontal={true} strokeOpacity={0.5} />
            <XAxis 
              dataKey={xAxisKey} 
              stroke="#8B949E" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false} 
              tickMargin={12} 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1A1918', border: '1px solid #333230', borderRadius: '8px' }}
              itemStyle={{ fontSize: '14px' }}
            />
            {series.map((s, idx) => (
              <Area 
                key={s.key}
                type="monotone" 
                dataKey={s.key} 
                stroke={s.color} 
                fillOpacity={1} 
                fill={`url(#color-${s.key})`} 
                strokeWidth={3} 
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Metrics List */}
      {metrics.length > 0 && (
        <div className="space-y-0 mt-auto">
          {metrics.map((metric, idx) => (
            <div 
              key={idx} 
              className={`flex items-center justify-between py-5 ${idx < metrics.length - 1 ? 'border-b border-[#2A2928]' : ''}`}
            >
              <div className="flex items-center gap-3">
                {metric.icon && <div>{metric.icon}</div>}
                <span className="text-[#8B949E] font-mono text-sm">{metric.label}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-app-textPrimary font-bold text-xl font-sans tracking-tight">{metric.value}</span>
                {metric.trend && metric.trend !== 'none' && (
                  <div 
                    className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      metric.trendType === 'bad' ? 'bg-[#FF453A]/20' : 
                      metric.trendType === 'good' ? 'bg-[#32D74B]/20' : 'bg-gray-500/20'
                    }`}
                  >
                    {metric.trend === 'up' ? (
                      <ArrowUp className={`w-4 h-4 ${metric.trendType === 'bad' ? 'text-[#FF453A]' : metric.trendType === 'good' ? 'text-[#32D74B]' : 'text-gray-400'}`} />
                    ) : (
                      <ArrowDown className={`w-4 h-4 ${metric.trendType === 'bad' ? 'text-[#FF453A]' : metric.trendType === 'good' ? 'text-[#32D74B]' : 'text-gray-400'}`} />
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
