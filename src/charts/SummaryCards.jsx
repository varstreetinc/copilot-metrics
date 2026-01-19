import React from 'react';

export default function SummaryCards({ data }) {
  const totalUsers = new Set(data.map(d => d.user_login)).size;
  const totalGenerations = data.reduce((sum, d) => sum + (d.code_generation_activity_count || 0), 0);
  const totalAcceptances = data.reduce((sum, d) => sum + (d.code_acceptance_activity_count || 0), 0);
  const totalInteractions = data.reduce((sum, d) => sum + (d.user_initiated_interaction_count || 0), 0);
  const totalLOC = data.reduce((sum, d) => sum + (d.loc_added_sum || 0), 0);
  
  const acceptanceRate = totalGenerations > 0 
    ? ((totalAcceptances / totalGenerations) * 100).toFixed(1) 
    : 0;

  return (
    <div className="summary-cards">
      <div className="summary-card">
        <div className="icon">👥</div>
        <div className="value">{totalUsers}</div>
        <div className="label">Active Users</div>
      </div>
      <div className="summary-card">
        <div className="icon">💡</div>
        <div className="value">{totalGenerations.toLocaleString()}</div>
        <div className="label">Code Generations</div>
      </div>
      <div className="summary-card">
        <div className="icon">✅</div>
        <div className="value">{totalAcceptances.toLocaleString()}</div>
        <div className="label">Acceptances</div>
      </div>
      <div className="summary-card">
        <div className="icon">📈</div>
        <div className="value">{acceptanceRate}%</div>
        <div className="label">Acceptance Rate</div>
      </div>
      <div className="summary-card">
        <div className="icon">📝</div>
        <div className="value">{totalLOC.toLocaleString()}</div>
        <div className="label">Lines of Code Added</div>
      </div>
    </div>
  );
}
