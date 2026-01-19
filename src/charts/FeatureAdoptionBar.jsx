import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function FeatureAdoptionBar({ data }) {
  // Aggregate feature usage
  const featureMap = {};
  
  data.forEach(d => {
    if (d.totals_by_feature && Array.isArray(d.totals_by_feature)) {
      d.totals_by_feature.forEach(feat => {
        const name = feat.feature || feat.name || 'Unknown';
        if (!featureMap[name]) {
          featureMap[name] = { 
            feature: name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), 
            generations: 0, 
            acceptances: 0 
          };
        }
        featureMap[name].generations += feat.code_generation_activity_count || 0;
        featureMap[name].acceptances += feat.code_acceptance_activity_count || 0;
      });
    }
  });

  const chartData = Object.values(featureMap)
    .filter(d => d.generations > 0 || d.acceptances > 0)
    .sort((a, b) => b.generations - a.generations);

  if (chartData.length === 0) {
    return (
      <div className="chart-card">
        <h3>🎛️ Feature Adoption</h3>
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          No feature data available
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h3>🎛️ Feature Adoption</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="feature" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="generations" name="Generations" fill="#667eea" radius={[4, 4, 0, 0]} />
          <Bar dataKey="acceptances" name="Acceptances" fill="#38ef7d" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
