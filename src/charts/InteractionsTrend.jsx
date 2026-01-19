import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function InteractionsTrend({ data }) {
  // Group by day
  const byDay = {};
  data.forEach(d => {
    if (!byDay[d.day]) {
      byDay[d.day] = { day: d.day, interactions: 0 };
    }
    byDay[d.day].interactions += d.user_initiated_interaction_count || 0;
  });

  const chartData = Object.values(byDay)
    .sort((a, b) => a.day.localeCompare(b.day))
    .map(d => ({
      ...d,
      day: d.day.slice(5), // MM-DD format
    }));

  return (
    <div className="chart-card">
      <h3>💬 User Interactions Trend</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="day" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="interactions" 
            name="Interactions"
            stroke="#f5576c" 
            strokeWidth={2}
            dot={{ r: 3, fill: '#f5576c' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
