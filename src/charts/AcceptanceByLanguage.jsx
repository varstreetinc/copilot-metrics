import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AcceptanceByLanguage({ data }) {
  // Aggregate by language
  const langMap = {};
  
  data.forEach(d => {
    if (d.totals_by_language_feature && Array.isArray(d.totals_by_language_feature)) {
      d.totals_by_language_feature.forEach(lang => {
        const name = lang.language || 'Unknown';
        if (!langMap[name]) {
          langMap[name] = { language: name, generations: 0, acceptances: 0 };
        }
        langMap[name].generations += lang.code_generation_activity_count || 0;
        langMap[name].acceptances += lang.code_acceptance_activity_count || 0;
      });
    }
  });

  const chartData = Object.values(langMap)
    .filter(d => d.generations >= 10) // Filter languages with enough data
    .map(d => ({
      ...d,
      rate: d.generations > 0 ? ((d.acceptances / d.generations) * 100) : 0
    }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 10);

  const getColor = (rate) => {
    if (rate >= 40) return '#38ef7d';
    if (rate >= 25) return '#4facfe';
    return '#f5576c';
  };

  if (chartData.length === 0) {
    return (
      <div className="chart-card">
        <h3>📊 Acceptance Rate by Language</h3>
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          No language data available
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h3>📊 Acceptance Rate by Language</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
          <YAxis 
            type="category" 
            dataKey="language" 
            tick={{ fontSize: 12 }} 
            width={80}
          />
          <Tooltip 
            formatter={(value) => [`${value.toFixed(1)}%`, 'Acceptance Rate']}
          />
          <Bar dataKey="rate" name="Acceptance Rate" radius={[0, 4, 4, 0]}>
            {chartData.map((entry) => (
              <Cell key={entry.language} fill={getColor(entry.rate)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
