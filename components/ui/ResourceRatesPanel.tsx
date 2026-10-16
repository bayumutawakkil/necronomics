'use client';

import { RESOURCE_NAMES } from '@/types/game';
import type { Resources } from '@/types/game';
import { ArrowDownIcon, ArrowUpIcon } from '@/components/ui/Icons';

interface ResourceRatesPanelProps {
  rates: Partial<Resources>;
}

export function ResourceRatesPanel({ rates }: ResourceRatesPanelProps) {
  // Filter and sort rates by absolute value (showing significant flows first)
  const sortedRates = Object.entries(rates)
    .filter(([_, rate]) => rate !== 0 && rate !== undefined)
    .sort(([_, a], [__, b]) => Math.abs(b - a) * (Math.abs(b - a))
    );

  if (sortedRates.length === 0) {
    return (
      <div className="resource-rates-panel p-3 bg-slate-950/80 border border-slate-900 rounded-xl">
        <div className="text-xs text-slate-500 text-center">No active production</div>
      </div>
    );
  }

  return (
    <div className="resource-rates-panel p-3 bg-slate-950/80 border border-slate-900 rounded-xl">
      <div className="text-xs uppercase font-semibold text-slate-400 mb-3 tracking-wider">
        Resource Flow
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sortedRates.map(([resource, rate]) => {
          const isIncome = rate > 0;
          const displayRate = Math.abs(rate).toFixed(2);
          
          return (
            <div
              key={resource}
              className="resource-rate flex items-center gap-2 px-3 py-2 bg-slate-900/50 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div
                className={`flex items-center gap-1 flex-1 ${
                  isIncome ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {isIncome ? (
                  <ArrowUpIcon size={14} className="flex-shrink-0" />
                ) : (
                  <ArrowDownIcon size={14} className="flex-shrink-0" />
                )}
                <span className="text-xs font-medium text-slate-300 truncate">
                  {RESOURCE_NAMES[resource as keyof typeof RESOURCE_NAMES]}
                </span>
              </div>
              <span
                className={`text-sm font-mono font-bold text-right ${
                  isIncome ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {isIncome ? '+' : '-'}{displayRate}/s
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
