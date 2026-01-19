import React, { useState } from 'react'
import './styles.css'
import { mergeDatasets, getMergeStats } from './utils/dataMerger'

import DailyActivityChart from './charts/DailyActivityChart'
import UserActivityHeatmap from './charts/UserActivityHeatmap'
import AcceptanceRateGauge from './charts/AcceptanceRateGauge'
import IDEUsagePie from './charts/IDEUsagePie'
import LanguageDistribution from './charts/LanguageDistribution'
import FeatureAdoptionBar from './charts/FeatureAdoptionBar'
import LOCTrendChart from './charts/LOCTrendChart'
import ModelUsageChart from './charts/ModelUsageChart'
import UserLeaderboard from './charts/UserLeaderboard'
import FeatureByUserChart from './charts/FeatureByUserChart'
import AgentChatAdoption from './charts/AgentChatAdoption'
import DailyActiveUsers from './charts/DailyActiveUsers'
import AcceptanceByLanguage from './charts/AcceptanceByLanguage'
import InteractionsTrend from './charts/InteractionsTrend'
import SummaryCards from './charts/SummaryCards'
import DailyFeatureUsageByUser from './charts/DailyFeatureUsageByUser'

function parseMaybeNdjson(text) {
  // First try parsing as regular JSON array
  try {
    const parsed = JSON.parse(text)
    if (Array.isArray(parsed)) {
      console.log('Parsed as JSON array:', parsed.length, 'records')
      return parsed
    }
    if (typeof parsed === 'object' && parsed !== null) {
      console.log('Parsed as single JSON object')
      return [parsed]
    }
  } catch (e) {
    // Not valid JSON array, continue with other methods
  }
  
  // Try parsing concatenated JSON objects (multi-line objects separated by }\n{)
  // Split on }{ patterns that indicate object boundaries
  const concatenatedMatch = text.match(/\}\s*\{/g)
  if (concatenatedMatch && concatenatedMatch.length > 0) {
    console.log('Detected concatenated JSON objects format')
    const out = []
    let depth = 0
    let start = 0
    
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '{') depth++
      else if (text[i] === '}') {
        depth--
        if (depth === 0) {
          const chunk = text.substring(start, i + 1).trim()
          if (chunk) {
            try {
              out.push(JSON.parse(chunk))
            } catch (e) {
              console.warn('Failed to parse object chunk at position', start)
            }
          }
          start = i + 1
        }
      }
    }
    if (out.length > 0) {
      console.log('Parsed', out.length, 'concatenated JSON objects')
      return out
    }
  }
  
  // Try NDJSON (one JSON per line)
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  const out = []
  for (const line of lines) {
    try { 
      out.push(JSON.parse(line)) 
    } catch (e) { 
      // Not a valid JSON line
    }
  }
  if (out.length > 0) {
    console.log('Parsed', out.length, 'records from NDJSON')
    return out
  }
  
  console.warn('Could not parse file in any known format')
  return []
}

export default function App() {
  const [raw, setRaw] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [downloadLink, setDownloadLink] = useState('')
  const [reportInfo, setReportInfo] = useState(null)
  const [loadedFiles, setLoadedFiles] = useState([])
  const [mergeStats, setMergeStats] = useState(null)

  async function fetchFromAPI() {
    if (!token.trim()) {
      setError('Please enter a GitHub token')
      return
    }
    setLoading(true)
    setError('')
    setDownloadLink('')
    setReportInfo(null)
    try {
      // Get the download links from GitHub API
      const response = await fetch(
        'https://api.github.com/orgs/varstreetinc/copilot/metrics/reports/users-28-day/latest',
        {
          headers: {
            'Accept': 'application/vnd.github+json',
            'Authorization': `Bearer ${token.trim()}`,
            'X-GitHub-Api-Version': '2022-11-28'
          }
        }
      )
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log('API Response:', result)
      
      if (!result.download_links || result.download_links.length === 0) {
        throw new Error('No download links found in API response')
      }
      
      // Due to CORS restrictions, we can't fetch the report directly from the browser
      // Show the download link to the user instead
      setDownloadLink(result.download_links[0])
      setReportInfo({
        startDate: result.report_start_day,
        endDate: result.report_end_day
      })
      setError('')
    } catch (err) {
      console.error('API fetch error:', err)
      setError(err.message || 'Failed to fetch data from API')
    } finally {
      setLoading(false)
    }
  }

  function handleFiles(e) {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    const fileArray = Array.from(files)
    console.log('Loading', fileArray.length, 'file(s)')
    
    const datasets = []
    const fileNames = []
    let filesProcessed = 0
    
    fileArray.forEach((file) => {
      console.log('Loading file:', file.name, 'size:', file.size)
      const reader = new FileReader()
      
      reader.onload = (ev) => {
        const txt = ev.target.result
        console.log('File loaded:', file.name, 'text length:', txt.length)
        const parsed = parseMaybeNdjson(txt)
        console.log('Parsed data from', file.name + ':', parsed.length, 'records')
        
        if (parsed.length > 0) {
          datasets.push(parsed)
          fileNames.push(file.name)
        }
        
        filesProcessed++
        
        // When all files are processed, merge the data
        if (filesProcessed === fileArray.length) {
          const merged = mergeDatasets(datasets)
          const stats = getMergeStats(merged)
          
          console.log('Merged data:', merged.length, 'records from', fileNames.length, 'files')
          console.log('Merge stats:', stats)
          
          setRaw(merged)
          setLoadedFiles(fileNames)
          setMergeStats(stats)
          setSelectedUsers([])
        }
      }
      
      reader.onerror = (err) => {
        console.error('File read error:', file.name, err)
        filesProcessed++
      }
      
      reader.readAsText(file)
    })
  }

  function clearData() {
    setRaw([])
    setLoadedFiles([])
    setMergeStats(null)
    setSelectedUsers([])
  }

  const allUsers = [...new Set(raw.map(r => r.user_login).filter(Boolean))].sort()
  
  const filteredData = selectedUsers.length === 0 
    ? raw 
    : raw.filter(r => selectedUsers.includes(r.user_login))

  function handleUserChange(user) {
    if (selectedUsers.includes(user)) {
      setSelectedUsers(selectedUsers.filter(u => u !== user))
    } else {
      setSelectedUsers([...selectedUsers, user])
    }
  }

  function selectAll() { setSelectedUsers([]) }
  function clearAll() { setSelectedUsers([...allUsers]) }

  return (
    <div className="app">
      <header className="header">
        <h1>🤖 Copilot Usage Dashboard</h1>
        <p className="subtitle">Track adoption and usage across your organization</p>
      </header>

      <div className="controls">
        <div className="api-fetch">
          <label>🔑 Fetch from GitHub API:</label>
          <div className="api-input-row">
            <input
              type="password"
              placeholder="Paste your GitHub token here..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="token-input"
            />
            <button 
              onClick={fetchFromAPI} 
              disabled={loading}
              className="btn-fetch"
            >
              {loading ? '⏳ Loading...' : '🚀 Get Report Link'}
            </button>
          </div>
          {error && <div className="error-message">❌ {error}</div>}
          {downloadLink && (
            <div className="download-section">
              <div className="download-info">
                ✅ Report found! Period: <strong>{reportInfo?.startDate}</strong> to <strong>{reportInfo?.endDate}</strong>
              </div>
              <div className="download-steps">
                <p>1. Click the button below to download the report:</p>
                <a href={downloadLink} download="copilot_report.json" className="btn-download" target="_blank" rel="noopener noreferrer">
                  📥 Download Report
                </a>
                <p>2. Then load the downloaded file below:</p>
              </div>
            </div>
          )}
        </div>

        <div className="divider">— {downloadLink ? 'STEP 2: Load the downloaded file' : 'OR'} —</div>

        <div className="file-upload">
          <label>📁 Load Data Files:</label>
          <div className="file-upload-row">
            <input type="file" accept=".json" multiple onChange={handleFiles} />
            {loadedFiles.length > 0 && (
              <button onClick={clearData} className="btn-clear">🗑️ Clear</button>
            )}
          </div>
          {loadedFiles.length > 0 && (
            <div className="loaded-files-info">
              <div className="files-list">
                📄 Loaded: {loadedFiles.join(', ')}
              </div>
              {mergeStats && (
                <div className="merge-stats">
                  📊 <strong>{mergeStats.totalRecords}</strong> records | 
                  📅 <strong>{mergeStats.uniqueDates}</strong> unique dates | 
                  👥 <strong>{mergeStats.uniqueUsers}</strong> users
                  {mergeStats.dateRange && (
                    <span> | 🗓️ {mergeStats.dateRange.startDate} to {mergeStats.dateRange.endDate}</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {allUsers.length > 0 && (
          <div className="user-filter">
            <label>👥 Filter by Users:</label>
            <div className="filter-actions">
              <button onClick={selectAll} className="btn-small">All Users</button>
              <button onClick={clearAll} className="btn-small">Clear</button>
            </div>
            <div className="user-chips">
              {allUsers.map(user => (
                <label key={user} className={`chip ${selectedUsers.length === 0 || selectedUsers.includes(user) ? 'active' : ''}`}>
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === 0 || selectedUsers.includes(user)}
                    onChange={() => handleUserChange(user)}
                  />
                  {user}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {raw.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h2>No Data Loaded</h2>
          <p>Upload your <code>last_28days_userData.json</code> file to view visualizations</p>
        </div>
      ) : (
        <>
          <SummaryCards data={filteredData} />
          
          <div className="section-header">
            <h2>📊 Adoption Overview</h2>
            <p>Daily engagement and feature usage trends</p>
          </div>
          <div className="charts-grid">
            <DailyActiveUsers data={filteredData} />
            <AgentChatAdoption data={filteredData} />
            <DailyActivityChart data={filteredData} />
          </div>

          <div className="section-header">
            <h2>👥 User Insights</h2>
            <p>Who is using Copilot and how much</p>
          </div>
          <div className="charts-grid">
            <DailyFeatureUsageByUser data={filteredData} />
            <UserLeaderboard data={filteredData} />
            <AcceptanceRateGauge data={filteredData} />
            <UserActivityHeatmap data={filteredData} />
          </div>

          <div className="section-header">
            <h2>💻 Technical Breakdown</h2>
            <p>Languages, IDEs, and features being used</p>
          </div>
          <div className="charts-grid">
            <LanguageDistribution data={filteredData} />
            <IDEUsagePie data={filteredData} />
            <FeatureAdoptionBar data={filteredData} />
            <AcceptanceByLanguage data={filteredData} />
          </div>

          <div className="section-header">
            <h2>📈 Trends & Metrics</h2>
            <p>Deeper insights into code generation and productivity</p>
          </div>
          <div className="charts-grid">
            <InteractionsTrend data={filteredData} />
            <LOCTrendChart data={filteredData} />
            <ModelUsageChart data={filteredData} />
            <FeatureByUserChart data={filteredData} />
          </div>
        </>
      )}

      <footer className="footer">
        <p>Data source: GitHub Copilot Usage Metrics API</p>
      </footer>
    </div>
  )
}
