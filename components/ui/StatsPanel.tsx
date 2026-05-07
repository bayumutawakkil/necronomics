'use client';

import './StatsPanel.css';

interface StatsPanelProps {
  stats: {
    total_corpses_processed: number;
    total_undead_created: number;
    total_buildings_built: number;
    uptime_seconds: number;
  };
  tick: number;
}

export function StatsPanel({ stats, tick }: StatsPanelProps) {
  const fmt = (s: number) => {
    const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const items = [
    { icon: '⏱️', label: 'Tick',       val: tick.toLocaleString() },
    { icon: '⏳', label: 'Uptime',     val: fmt(stats.uptime_seconds) },
    { icon: '💀', label: 'Processed',  val: stats.total_corpses_processed.toLocaleString() },
    { icon: '🧟', label: 'Undead',     val: stats.total_undead_created.toLocaleString() },
    { icon: '🏚️', label: 'Structures', val: stats.total_buildings_built.toLocaleString() },
  ];

  return (
    <div className="stats-panel">
      {items.map((item) => (
        <div key={item.label} className="stats-item">
          <span className="stats-icon">{item.icon}</span>
          <div className="stats-body">
            <span className="stats-val">{item.val}</span>
            <span className="stats-label">{item.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
