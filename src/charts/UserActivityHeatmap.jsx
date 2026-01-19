import React from 'react';

export default function UserActivityHeatmap({ data }) {
  // Build heatmap: rows = users, cols = days
  const users = [...new Set(data.map(d => d.user_login))].slice(0, 12);
  const days = [...new Set(data.map(d => d.day))].sort();
  
  // Create activity matrix
  const matrix = {};
  let maxActivity = 0;
  
  data.forEach(d => {
    if (!users.includes(d.user_login)) return;
    const key = `${d.user_login}-${d.day}`;
    const activity = (d.code_generation_activity_count || 0) + (d.code_acceptance_activity_count || 0);
    matrix[key] = activity;
    if (activity > maxActivity) maxActivity = activity;
  });

  const getColor = (value) => {
    if (!value || value === 0) return '#f0f0f0';
    const intensity = Math.min(value / (maxActivity * 0.5), 1);
    const green = Math.round(200 - intensity * 100);
    const blue = Math.round(200 - intensity * 150);
    return `rgb(${Math.round(102 + intensity * 50)}, ${green}, ${blue})`;
  };

  return (
    <div className="chart-card wide">
      <h3>🔥 User Activity Heatmap (Top 12 Users)</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '4px 8px', borderBottom: '1px solid #ddd' }}>User</th>
              {days.map(day => (
                <th key={day} style={{ padding: '4px', borderBottom: '1px solid #ddd', fontSize: '0.65rem' }}>
                  {day.slice(8)} {/* DD */}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user}>
                <td style={{ 
                  padding: '4px 8px', 
                  fontWeight: 500, 
                  maxWidth: '100px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {user}
                </td>
                {days.map(day => {
                  const value = matrix[`${user}-${day}`] || 0;
                  return (
                    <td 
                      key={day} 
                      title={`${user}: ${value} on ${day}`}
                      style={{
                        backgroundColor: getColor(value),
                        width: '20px',
                        height: '20px',
                        textAlign: 'center',
                        fontSize: '0.6rem',
                        color: value > maxActivity * 0.3 ? 'white' : '#666',
                        borderRadius: '2px'
                      }}
                    >
                      {value > 0 ? value : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#666' }}>
        <span>Less</span>
        <div style={{ display: 'flex', gap: '2px' }}>
          {[0, 0.25, 0.5, 0.75, 1].map((i) => (
            <div 
              key={i} 
              style={{ 
                width: '16px', 
                height: '16px', 
                backgroundColor: getColor(maxActivity * i),
                borderRadius: '2px'
              }} 
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
