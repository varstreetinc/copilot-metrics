import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = {
  code_completion: '#667eea',
  chat: '#38ef7d',
  agent_edit: '#f093fb',
  code_review: '#f5576c',
  other: '#4facfe'
};

export default function FeatureByUserChart({ data }) {
  // Aggregate features by user
  const userFeatures = {};
  
  data.forEach(d => {
    const user = d.user_login;
    if (!userFeatures[user]) {
      userFeatures[user] = { user };
    }
    
    if (d.totals_by_feature && Array.isArray(d.totals_by_feature)) {
      d.totals_by_feature.forEach(feat => {
        const featureName = feat.feature || feat.name || 'other';
        if (!userFeatures[user][featureName]) {
          userFeatures[user][featureName] = 0;
        }
        userFeatures[user][featureName] += feat.code_generation_activity_count || 0;
      });
    }
  });

  // Get top 8 users by total usage
  const chartData = Object.values(userFeatures)
    .map(u => {
      const total = Object.entries(u)
        .filter(([k]) => k !== 'user')
        .reduce((sum, [, v]) => sum + v, 0);
      return { ...u, total };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  // Get all unique features
  const features = [...new Set(
    chartData.flatMap(u => Object.keys(u).filter(k => k !== 'user' && k !== 'total'))
  )];

  if (chartData.length === 0 || features.length === 0) {
    return (
      <div className="chart-card">
        <h3>👤 Features by User</h3>
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          No feature/user data available
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h3>👤 Features by User</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis 
            dataKey="user" 
            tick={{ fontSize: 10 }} 
            angle={-15}
            textAnchor="end"
            height={50}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          {features.map((feat) => (
            <Bar 
              key={feat} 
              dataKey={feat} 
              stackId="a" 
              fill={COLORS[feat] || '#999'}
              name={feat.replace(/_/g, ' ')}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
