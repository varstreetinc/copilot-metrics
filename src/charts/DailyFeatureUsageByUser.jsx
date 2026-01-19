import React, { useState, useMemo } from 'react';

export default function DailyFeatureUsageByUser({ data }) {
  const [sortBy, setSortBy] = useState('date'); // date, user, activity
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Get available date range from data
  const dateRange = useMemo(() => {
    const dates = data.map(d => d.day).filter(Boolean).sort();
    return {
      min: dates[0] || '',
      max: dates[dates.length - 1] || ''
    };
  }, [data]);

  // Build daily user feature data
  const dailyData = [];
  
  data.forEach(d => {
    if (!d.user_login || !d.day) return;
    
    const features = [];
    if (d.totals_by_feature && Array.isArray(d.totals_by_feature)) {
      d.totals_by_feature.forEach(feat => {
        const featureName = feat.feature || feat.name || 'unknown';
        const gens = feat.code_generation_activity_count || 0;
        const accepts = feat.code_acceptance_activity_count || 0;
        if (gens > 0 || accepts > 0) {
          features.push({
            name: featureName.replace(/_/g, ' '),
            generations: gens,
            acceptances: accepts,
            rate: gens > 0 ? ((accepts / gens) * 100).toFixed(0) : 0
          });
        }
      });
    }

    // Also add top-level features
    const topFeatures = [];
    if (d.code_generation_activity_count > 0) {
      topFeatures.push('Code Completions');
    }
    if (d.used_chat) {
      topFeatures.push('IDE Chat');
    }
    if (d.used_agent) {
      topFeatures.push('Agent');
    }

    dailyData.push({
      user: d.user_login,
      day: d.day,
      dayShort: d.day.slice(5),
      features: features,
      topFeatures: topFeatures,
      totalGenerations: d.code_generation_activity_count || 0,
      totalAcceptances: d.code_acceptance_activity_count || 0,
      interactions: d.user_initiated_interaction_count || 0
    });
  });

  // Filter by date range
  let filteredData = dailyData;
  if (startDate || endDate) {
    filteredData = dailyData.filter(row => {
      if (startDate && row.day < startDate) return false;
      if (endDate && row.day > endDate) return false;
      return true;
    });
  }

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortBy === 'date') return b.day.localeCompare(a.day);
    if (sortBy === 'user') return a.user.localeCompare(b.user) || b.day.localeCompare(a.day);
    if (sortBy === 'activity') return b.totalGenerations - a.totalGenerations;
    return 0;
  });

  // Limit to most recent or top results (but show all if filtered)
  const displayData = (startDate || endDate) ? sortedData : sortedData.slice(0, 50);

  const toggleRow = (key) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedRows(newExpanded);
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  if (dailyData.length === 0) {
    return (
      <div className="chart-card wide">
        <h3>📋 Daily Feature Usage by User</h3>
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          No daily feature data available
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card wide">
      <h3>📋 Daily Feature Usage by User</h3>
      
      <div className="filter-controls">
        <div className="date-filters">
          <label>
            <span className="filter-label">From:</span>
            <input 
              type="date" 
              className="date-input"
              value={startDate}
              min={dateRange.min}
              max={dateRange.max}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label>
            <span className="filter-label">To:</span>
            <input 
              type="date" 
              className="date-input"
              value={endDate}
              min={startDate || dateRange.min}
              max={dateRange.max}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
          {(startDate || endDate) && (
            <button className="clear-filter-btn" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
        <div className="sort-controls">
          <button 
            className={`sort-btn ${sortBy === 'date' ? 'active' : ''}`}
            onClick={() => setSortBy('date')}
          >
            📅 By Date
          </button>
          <button 
            className={`sort-btn ${sortBy === 'user' ? 'active' : ''}`}
            onClick={() => setSortBy('user')}
          >
            👤 By User
          </button>
          <button 
            className={`sort-btn ${sortBy === 'activity' ? 'active' : ''}`}
            onClick={() => setSortBy('activity')}
          >
            ⚡ By Activity
          </button>
        </div>
      </div>

      <div className="chart-insight">
        <span>
          {(startDate || endDate) ? (
            <>Showing <strong>{displayData.length}</strong> filtered records</>
          ) : (
            <>Showing latest <strong>{displayData.length}</strong> activity records</>
          )}
        </span>
        {(startDate || endDate) && (
          <span className="filter-indicator">
            {startDate && endDate 
              ? `${startDate} to ${endDate}`
              : startDate 
              ? `From ${startDate}`
              : `Until ${endDate}`
            }
          </span>
        )}
      </div>

      <div className="feature-usage-table">
        <div className="feature-usage-header">
          <div className="col-day">Date</div>
          <div className="col-user">User</div>
          <div className="col-features">Features Used</div>
          <div className="col-stats">Activity</div>
        </div>
        
        {displayData.map((row, idx) => {
          const rowKey = `${row.user}-${row.day}`;
          const isExpanded = expandedRows.has(rowKey);
          
          return (
            <div key={rowKey} className="feature-usage-row">
              <div className="feature-usage-main" onClick={() => toggleRow(rowKey)}>
                <div className="col-day">{row.dayShort}</div>
                <div className="col-user">
                  <strong>{row.user}</strong>
                </div>
                <div className="col-features">
                  <div className="feature-tags">
                    {row.topFeatures.map(f => (
                      <span key={f} className="feature-tag">{f}</span>
                    ))}
                    {row.features.length > 0 && (
                      <span className="feature-tag secondary">
                        +{row.features.length} more
                      </span>
                    )}
                  </div>
                </div>
                <div className="col-stats">
                  <span className="stat-pill">
                    <strong>{row.totalGenerations}</strong> gens
                  </span>
                  <span className="stat-pill accent">
                    <strong>{row.totalAcceptances}</strong> accepts
                  </span>
                  <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
                </div>
              </div>
              
              {isExpanded && row.features.length > 0 && (
                <div className="feature-usage-detail">
                  <div className="detail-header">Feature Breakdown:</div>
                  <div className="feature-breakdown">
                    {row.features.map((feat, i) => (
                      <div key={i} className="feature-detail-item">
                        <span className="feat-name">{feat.name}</span>
                        <span className="feat-stats">
                          {feat.generations} gen · {feat.acceptances} acc · {feat.rate}% rate
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
