'use client';

import { Unit } from '@/types/game';
import './UnitCard.css';

interface UnitCardProps {
  unit: Unit;
}

const UNIT_META: Record<string, {
  icon: string;
  label: string;
  accent: string;
  accentRgb: string;
  role: string;
}> = {
  skeleton: { icon: '🦴', label: 'Skeleton', accent: '#d6cfbc', accentRgb: '214,207,188', role: 'Morgue worker'        },
  zombie:   { icon: '🧟', label: 'Zombie',   accent: '#22c55e', accentRgb: '34,197,94',   role: 'Bone Mill worker'     },
  ghoul:    { icon: '👹', label: 'Ghoul',    accent: '#d97706', accentRgb: '217,119,6',   role: 'Decay Pit worker'     },
  ghost:    { icon: '👻', label: 'Ghost',    accent: '#8b5cf6', accentRgb: '139,92,246',  role: 'Necro Factory worker' },
  vampire:  { icon: '🧛', label: 'Vampire',  accent: '#ef4444', accentRgb: '239,68,68',   role: 'Ritual Chamber lord'  },
};

export function UnitCard({ unit }: UnitCardProps) {
  const freshness = Math.max(0, Math.min(100, unit.freshness));
  const meta = UNIT_META[unit.type] ?? UNIT_META.skeleton;

  const freshnessColor =
    freshness >= 75 ? '#22c55e' :
    freshness >= 50 ? '#fbbf24' :
    freshness >= 25 ? '#f97316' : '#ef4444';

  const freshnessLabel =
    freshness >= 75 ? 'Fresh' :
    freshness >= 50 ? 'Aging' :
    freshness >= 25 ? 'Rotting' : 'Critical';

  return (
    <div
      className="uc-root"
      style={{ '--uc-accent': meta.accent, '--uc-rgb': meta.accentRgb } as React.CSSProperties}
    >
      <div className="uc-bar" />
      <span className="uc-icon">{meta.icon}</span>

      <div className="uc-body">
        <div className="uc-top">
          <span className="uc-name">{meta.label}</span>
          <span className="uc-id">#{unit.id.slice(0, 6)}</span>
          <span className="uc-role">{meta.role}</span>
        </div>
        <div className="uc-fresh-row">
          <div className="uc-fresh-track">
            <div className="uc-fresh-fill" style={{ width: `${freshness}%`, background: freshnessColor }} />
          </div>
          <span className="uc-fresh-label" style={{ color: freshnessColor }}>
            {freshnessLabel} {freshness.toFixed(0)}%
          </span>
        </div>
      </div>

      <div className="uc-stats">
        <div className="uc-stat">
          <span className="uc-stat-key">EFF</span>
          <span className="uc-stat-val uc-stat-val--eff">{(unit.efficiency * 100).toFixed(0)}%</span>
        </div>
        <div className="uc-stat">
          <span className="uc-stat-key">MAINT</span>
          <span className="uc-stat-val uc-stat-val--cost">{(unit.maintenance_cost?.bone ?? 0).toFixed(2)}🦴</span>
        </div>
      </div>
    </div>
  );
}
