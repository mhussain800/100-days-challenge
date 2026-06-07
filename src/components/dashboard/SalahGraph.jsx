import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SalahGraph({ logs, days100, today }) {
  const PRAYER_IDS = ['fajar', 'zuhar', 'asar', 'maghrib', 'isha'];

  const chartData = useMemo(() => {
    return days100.map((day, index) => {
      let count = 0;
      if (day <= today && logs[day]) {
        PRAYER_IDS.forEach(id => {
          const task = logs[day][id];
          if (task && task.checked && task.val !== 'Qaza') count++;
        });
      }
      return { name: `Day ${index + 1}`, count: day <= today ? count : null };
    });
  }, [days100, logs, today]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#fdfbf7] border border-[#2c2b2a] p-3 shadow-xl font-mono text-xs z-50">
          <p className="font-bold border-b border-[#e5e0d3] mb-2 pb-1 text-[#2c2b2a]">{label}</p>
          <div className="flex justify-between gap-6 text-[#10b981]">
            <span>Prayers:</span>
            <span className="font-bold text-[14px]">{payload[0].value} / 5</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-[#e5e0d3] rounded p-4 shadow-sm mb-2">
      <h3 className="text-lg italic font-serif text-[#2c2b2a] mb-4 border-b border-[#e5e0d3] pb-2">Salah Consistency</h3>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e0d3" vertical={false} />
            <XAxis dataKey="name" stroke="#888" fontSize={10} tickLine={false} axisLine={false} tickMargin={10} minTickGap={20} />
            <YAxis stroke="#888" fontSize={10} tickLine={false} axisLine={false} domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 5, strokeWidth: 0 }} connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}