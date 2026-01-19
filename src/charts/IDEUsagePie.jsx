import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#667eea', '#38ef7d', '#f093fb', '#f5576c', '#4facfe', '#ffecd2', '#a8edea'];

export default function IDEUsagePie({ data }) {
  // Aggregate IDE usage across all records
  const ideMap = {};
  
  data.forEach(d => {
    if (d.totals_by_ide && Array.isArray(d.totals_by_ide)) {
      d.totals_by_ide.forEach(ideData => {
        const name = ideData.ide || ideData.ide_name || ideData.name || 'Unknown';
        if (!ideMap[name]) {
          ideMap[name] = { name, value: 0 };
        }
        ideMap[name].value += ideData.code_generation_activity_count || ideData.total_engaged_users || 1;
      });
    }
  });

  const chartData = Object.values(ideMap)
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value);

  if (chartData.length === 0) {
    return (
      <div className="chart-card">
        <h3>💻 IDE Usage Distribution</h3>
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          No IDE data available
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h3>💻 IDE Usage Distribution</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="value"
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
