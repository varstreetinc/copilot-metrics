import React from 'react';

export default function UserLeaderboard({ data }) {
  // Aggregate by user
  const userMap = {};
  
  data.forEach(d => {
    const user = d.user_login;
    if (!userMap[user]) {
      userMap[user] = { user, generations: 0, acceptances: 0, days: new Set() };
    }
    userMap[user].generations += d.code_generation_activity_count || 0;
    userMap[user].acceptances += d.code_acceptance_activity_count || 0;
    userMap[user].days.add(d.day);
  });

  const leaderboard = Object.values(userMap)
    .map(u => ({
      ...u,
      acceptanceRate: u.generations > 0 ? ((u.acceptances / u.generations) * 100).toFixed(0) : 0,
      activeDays: u.days.size
    }))
    .sort((a, b) => b.generations - a.generations)
    .slice(0, 10);

  return (
    <div className="chart-card">
      <h3>🏆 Top Contributors</h3>
      <div className="chart-insight" style={{marginBottom: '12px'}}>
        Ranked by total code generations
      </div>
      <ul className="leaderboard-list">
        {leaderboard.map((user, idx) => (
          <li key={user.user} className="leaderboard-item">
            <span className="leaderboard-rank">#{idx + 1}</span>
            <div className="leaderboard-user">
              <div style={{fontWeight: '600'}}>{user.user}</div>
              <div style={{fontSize: '0.85rem', color: '#6b7280', marginTop: '2px'}}>
                {user.activeDays} active days · {user.acceptanceRate}% acceptance
              </div>
            </div>
            <span className="leaderboard-value">{user.generations.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
