import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DailyActivityChart({ data }) {
  // Group by day
  const byDay = {};
  data.forEach(d => {
    if (!byDay[d.day]) {
      byDay[d.day] = { day: d.day, generations: 0, acceptances: 0 };
    }
    byDay[d.day].generations += d.code_generation_activity_count || 0;
    byDay[d.day].acceptances += d.code_acceptance_activity_count || 0;
  });

  const chartData = Object.values(byDay)
    .sort((a, b) => a.day.localeCompare(b.day))
    .map(d => ({
      ...d,
      day: d.day.slice(5), // MM-DD format
    }));

  const totalGenerations = chartData.reduce((sum, d) => sum + d.generations, 0);
  const totalAcceptances = chartData.reduce((sum, d) => sum + d.acceptances, 0);
  const overallRate = totalGenerations > 0 ? ((totalAcceptances / totalGenerations) * 100).toFixed(1) : 0;

  return (
    <div className="chart-card wide">
      <h3>📊 Daily Activity Trend</h3>
      <div className="chart-insight">
        <span><strong>{totalGenerations.toLocaleString()}</strong> total generations</span>
        <span className="acceptance-rate">{overallRate}% overall acceptance rate</span>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="day" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="generations" 
            name="Generations"
            stroke="#6b46c1" 
            strokeWidth={2.5} 
            dot={{ r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="acceptances" 
            name="Acceptances"
            stroke="#10b981" 
            strokeWidth={2.5} 
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
