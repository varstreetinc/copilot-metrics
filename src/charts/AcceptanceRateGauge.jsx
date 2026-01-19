import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

export default function AcceptanceRateGauge({ data }) {
  const totalGenerations = data.reduce((sum, d) => sum + (d.code_generation_activity_count || 0), 0);
  const totalAcceptances = data.reduce((sum, d) => sum + (d.code_acceptance_activity_count || 0), 0);
  
  const acceptanceRate = totalGenerations > 0 
    ? ((totalAcceptances / totalGenerations) * 100) 
    : 0;

  const chartData = [{ value: acceptanceRate, fill: '#667eea' }];

  return (
    <div className="chart-card">
      <h3>🎯 Acceptance Rate</h3>
      <div className="gauge-container">
        <ResponsiveContainer width="100%" height={160}>
          <RadialBarChart 
            cx="50%" 
            cy="100%" 
            innerRadius="80%" 
            outerRadius="100%" 
            barSize={15} 
            data={chartData} 
            startAngle={180} 
            endAngle={0}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar 
              background 
              clockWise 
              dataKey="value" 
              cornerRadius={10} 
              angleAxisId={0}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="gauge-value">{acceptanceRate.toFixed(1)}%</div>
        <div className="gauge-label">of suggestions accepted</div>
        <div className="gauge-detail">
          {totalAcceptances.toLocaleString()} / {totalGenerations.toLocaleString()} suggestions
        </div>
      </div>
    </div>
  );
}
