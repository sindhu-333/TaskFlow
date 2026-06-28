import React from 'react';

const StatCard = ({ icon, label, value, color, bg }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: bg, color }}>
      {icon}
    </div>
    <div className="stat-info">
      <p>{label}</p>
      <h3 style={{ color }}>{value ?? '—'}</h3>
    </div>
  </div>
);

const StatsBar = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="stats-grid">
      <StatCard icon="📋" label="Total Tasks" value={stats.total} color="#6366f1" bg="#eef2ff" />
      <StatCard icon="⏳" label="To Do" value={stats.byStatus?.todo} color="#64748b" bg="#f1f5f9" />
      <StatCard icon="🔄" label="In Progress" value={stats.byStatus?.['in-progress']} color="#3b82f6" bg="#eff6ff" />
      <StatCard icon="✅" label="Completed" value={stats.byStatus?.completed} color="#22c55e" bg="#f0fdf4" />
      <StatCard icon="🔥" label="High Priority" value={stats.byPriority?.high} color="#ef4444" bg="#fef2f2" />
      <StatCard icon="⚠️" label="Overdue" value={stats.overdue} color={stats.overdue > 0 ? "#ef4444" : "#64748b"} bg={stats.overdue > 0 ? "#fef2f2" : "#f1f5f9"} />
    </div>
  );
};

export default StatsBar;
