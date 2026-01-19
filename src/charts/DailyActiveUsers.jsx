import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DailyActiveUsers({ data }) {
  // Count unique users per day
  const byDay = {};
  data.forEach(d => {
    if (!byDay[d.day]) {
      byDay[d.day] = new Set();
    }
    byDay[d.day].add(d.user_login);
  });

  const chartData = Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, users]) => ({
      day: day.slice(5), // MM-DD format
      users: users.size
    }));

  // Calculate trend
  const avgUsers = chartData.length > 0 ? (chartData.reduce((sum, d) => sum + d.users, 0) / chartData.length).toFixed(1) : 0;
  const lastDayUsers = chartData.length > 0 ? chartData[chartData.length - 1].users : 0;
  const trend = lastDayUsers > avgUsers ? '↗️' : lastDayUsers < avgUsers ? '↘️' : '➡️';

  return (
    <div className="chart-card">
      <h3>📅 Daily Active Users</h3>
      <div className="chart-insight">
        <span><strong>{lastDayUsers}</strong> active today</span>
        <span className="trend">{trend} Avg: {avgUsers} users/day</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="day" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="users" name="Active Users" fill="#6b46c1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
