'use client';

import { Building } from '@/types/game';
import { RESOURCE_ICONS, BUILDING_ICONS } from '@/lib/game/constants';
import './BuildingCard.css';

interface BuildingCardProps {
  building: Building;
  assignedCount?: number;
}

const BUILDING_META: Record<string, { name: string; accent: string; accentRgb: string }> = {
  morgue:         { name: 'Morgue',         accent: '#d6cfbc', accentRgb: '214,207,188' },
  bone_mill:      { name: 'Bone Mill',      accent: '#22c55e', accentRgb: '34,197,94'   },
  necro_factory:  { name: 'Necro Factory',  accent: '#8b5cf6', accentRgb: '139,92,246'  },
  ritual_chamber: { name: 'Ritual Chamber', accent: '#ef4444', accentRgb: '239,68,68'   },
  decay_pit:      { name: 'Decay Pit',      accent: '#d97706', accentRgb: '217,119,6'   },
};

export function BuildingCard({ building, assignedCount = 0 }: BuildingCardProps) {
  const meta = BUILDING_META[building.type] ?? { name: building.type, accent: '#8b5cf6', accentRgb: '139,92,246' };
  const prodEntries = Object.entries(building.production_rate).filter(([, v]) => v && v > 0) as [string, number][];
  const maintEntries = Object.entries(building.maintenance_cost).filter(([, v]) => v && v > 0) as [string, number][];

  return (
    <div
      className="bc-root"
      style={{ '--bc-accent': meta.accent, '--bc-rgb': meta.accentRgb } as React.CSSProperties}
    >
      <div className="bc-bar" />
      <span className="bc-icon">{BUILDING_ICONS[building.type] ?? '🏗️'}</span>

      <div className="bc-body">
        <div className="bc-top">
          <span className="bc-name">{meta.name}</span>
          <span className="bc-level">LVL {building.level}</span>
          <span className={`bc-status ${building.is_active ? 'bc-status--on' : 'bc-status--off'}`}>
            <span className="bc-dot" />
            {building.is_active ? 'Active' : 'Halted'}
          </span>
        </div>
        <div className="bc-rates">
          {prodEntries.map(([res, rate]) => (
            <span key={res} className="bc-rate bc-rate--prod">
              {(RESOURCE_ICONS as Record<string, string>)[res] ?? '?'} +{(rate * building.efficiency).toFixed(1)}/s
            </span>
          ))}
          {maintEntries.map(([res, cost]) => (
            <span key={res} className="bc-rate bc-rate--cost">
              {(RESOURCE_ICONS as Record<string, string>)[res] ?? '?'} -{cost.toFixed(1)}/s
            </span>
          ))}
          {assignedCount > 0 && (
            <span className="bc-rate bc-rate--units">
              👥 {assignedCount} unit{assignedCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      <div className="bc-eff">
        <span className="bc-eff-val">{Math.round(building.efficiency * 100)}%</span>
        <span className="bc-eff-key">EFF</span>
      </div>
    </div>
  );
}
