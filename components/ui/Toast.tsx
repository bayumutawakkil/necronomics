'use client';

import { useUIStore, selectNotifications } from '@/stores/useUIStore';
import { InfoIcon, WarningIcon, DangerIcon } from '@/components/ui/Icons';

const SEVERITY_STYLES: Record<string, { bg: string; border: string; icon: React.ReactNode; text: string; shadow: string }> = {
  info: { 
    bg: 'bg-slate-950/75', 
    border: 'border-blue-500/30', 
    icon: <InfoIcon size={18} className="text-blue-400" />, 
    text: 'text-blue-300', 
    shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
  },
  warning: { 
    bg: 'bg-slate-950/75', 
    border: 'border-amber-500/45', 
    icon: <WarningIcon size={18} className="text-amber-400" />, 
    text: 'text-amber-300', 
    shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
  },
  crisis: { 
    bg: 'bg-slate-950/75', 
    border: 'border-rose-500/45', 
    icon: <DangerIcon size={18} className="text-rose-400" />, 
    text: 'text-rose-300', 
    shadow: 'shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
  },
};

export function Toast() {
  const notifications = useUIStore(selectNotifications);
  const removeNotification = useUIStore((s) => s.removeNotification);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-[340px] pointer-events-none">
      {notifications.map((notif) => {
        const style = SEVERITY_STYLES[notif.severity] ?? SEVERITY_STYLES.info;
        return (
          <div
            key={notif.id}
            className={`flex items-start gap-3.5 p-4 border rounded-xl backdrop-blur-md pointer-events-auto animate-fade-in-up transition-all duration-300 hover:scale-[1.01] ${style.bg} ${style.border} ${style.text} ${style.shadow}`}
            role="alert"
            aria-live="polite"
          >
            <span className="mt-0.5 filter drop-shadow-[0_0_4px_rgba(255,255,255,0.1)]">{style.icon}</span>
            <span className="flex-1 text-sm leading-relaxed font-body">{notif.message}</span>
            <button
              className="opacity-40 hover:opacity-100 text-lg leading-none px-1 transition-opacity duration-200 cursor-pointer"
              onClick={(e) => { e.stopPropagation(); removeNotification(notif.id); }}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
