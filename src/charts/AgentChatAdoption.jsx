import React from 'react';

export default function AgentChatAdoption({ data }) {
  // Count users who used agent/chat
  const users = new Set(data.map(d => d.user_login));
  const usedAgent = new Set(data.filter(d => d.used_agent).map(d => d.user_login));
  const usedChat = new Set(data.filter(d => d.used_chat).map(d => d.user_login));
  const usedBoth = new Set([...usedAgent].filter(u => usedChat.has(u)));
  
  const agentPct = users.size > 0 ? ((usedAgent.size / users.size) * 100).toFixed(0) : 0;
  const chatPct = users.size > 0 ? ((usedChat.size / users.size) * 100).toFixed(0) : 0;
  const bothPct = users.size > 0 ? ((usedBoth.size / users.size) * 100).toFixed(0) : 0;
  const notAdopted = users.size - new Set([...usedAgent, ...usedChat]).size;

  return (
    <div className="chart-card">
      <h3>🚀 Advanced Features Adoption</h3>
      <div className="chart-insight">
        <span><strong>{users.size - notAdopted}/{users.size}</strong> users adopted</span>
        <span className="adoption-rate">{((1 - notAdopted/users.size) * 100).toFixed(0)}% adoption rate</span>
      </div>
      <div className="adoption-grid">
        <div className={`adoption-badge ${usedAgent.size > 0 ? 'yes' : 'no'}`}>
          <div className="count">{usedAgent.size}</div>
          <div className="text">Agent ({agentPct}%)</div>
        </div>
        <div className={`adoption-badge ${usedChat.size > 0 ? 'yes' : 'no'}`}>
          <div className="count">{usedChat.size}</div>
          <div className="text">Chat ({chatPct}%)</div>
        </div>
      </div>
      <div style={{ marginTop: '14px', padding: '10px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.9rem' }}>
        <div style={{ color: '#10b981', fontWeight: '600' }}>{usedBoth.size} users ({bothPct}%) using both features</div>
        {notAdopted > 0 && <div style={{ color: '#ef4444', marginTop: '4px' }}>{notAdopted} users not yet adopted</div>}
      </div>
    </div>
  );
}
