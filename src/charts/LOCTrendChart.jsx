import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function LOCTrendChart({ data }) {
  // Group by day
  const byDay = {};
  data.forEach(d => {
    if (!byDay[d.day]) {
      byDay[d.day] = { day: d.day, added: 0, suggested: 0 };
    }
    byDay[d.day].added += d.loc_added_sum || 0;
    byDay[d.day].suggested += d.loc_suggested_to_add_sum || 0;
  });

  const chartData = Object.values(byDay)
    .sort((a, b) => a.day.localeCompare(b.day))
    .map(d => ({
      ...d,
      day: d.day.slice(5), // MM-DD format
    }));

  return (
    <div className="chart-card wide">
      <h3>📈 Lines of Code Trend (Added vs Suggested)</h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorAdded" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#667eea" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorSuggested" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f093fb" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#f093fb" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="suggested" 
            name="LOC Suggested"
            stroke="#f093fb" 
            fillOpacity={1} 
            fill="url(#colorSuggested)" 
          />
          <Area 
            type="monotone" 
            dataKey="added" 
            name="LOC Added"
            stroke="#667eea" 
            fillOpacity={1} 
            fill="url(#colorAdded)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
