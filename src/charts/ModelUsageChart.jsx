import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ModelUsageChart({ data }) {
  // Aggregate model usage
  const modelMap = {};
  
  data.forEach(d => {
    if (d.totals_by_language_model && Array.isArray(d.totals_by_language_model)) {
      d.totals_by_language_model.forEach(model => {
        const name = model.model || model.name || 'Unknown';
        if (!modelMap[name]) {
          modelMap[name] = { model: name, generations: 0 };
        }
        modelMap[name].generations += model.code_generation_activity_count || model.total_engaged_users || 1;
      });
    }
  });

  const chartData = Object.values(modelMap)
    .filter(d => d.generations > 0)
    .sort((a, b) => b.generations - a.generations)
    .slice(0, 8);

  if (chartData.length === 0) {
    return (
      <div className="chart-card">
        <h3>🤖 Model Usage</h3>
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          No model data available
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h3>🤖 Model Usage</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis 
            dataKey="model" 
            tick={{ fontSize: 10 }} 
            angle={-15}
            textAnchor="end"
            height={60}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="generations" name="Usage Count" fill="#f093fb" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
