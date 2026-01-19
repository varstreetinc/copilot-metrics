import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function LanguageDistribution({ data }) {
  // Aggregate language usage
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
    .filter(d => d.generations > 0)
    .sort((a, b) => b.generations - a.generations)
    .slice(0, 10);

  if (chartData.length === 0) {
    return (
      <div className="chart-card">
        <h3>🌐 Top Languages by Usage</h3>
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          No language data available
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h3>🌐 Top Languages by Usage</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis 
            type="category" 
            dataKey="language" 
            tick={{ fontSize: 12 }} 
            width={80}
          />
          <Tooltip />
          <Bar dataKey="generations" name="Generations" fill="#667eea" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
