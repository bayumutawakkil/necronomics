'use client';

import { useUIStore, selectNotifications } from '@/stores/useUIStore';

const SEVERITY_STYLES: Record<string, { bg: string; border: string; icon: string }> = {
  info:    { bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.4)', icon: '💬' },
  warning: { bg: 'rgba(217,119,6,0.15)',  border: 'rgba(217,119,6,0.5)',  icon: '⚠️' },
  crisis:  { bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.5)',  icon: '🚨' },
};

export function Toast() {
  const notifications = useUIStore(selectNotifications);
  const removeNotification = useUIStore((s) => s.removeNotification);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-[320px] pointer-events-none">
      {notifications.map((notif) => {
        const style = SEVERITY_STYLES[notif.severity] ?? SEVERITY_STYLES.info;
        return (
          <div
            key={notif.id}
            className="flex items-start gap-3 p-4 border rounded-xl backdrop-blur-md pointer-events-auto animate-fade-in-up shadow-2xl transition-all duration-300 hover:scale-[1.02]"
            style={{ background: style.bg, borderColor: style.border }}
            role="alert"
            aria-live="polite"
          >
            <span className="text-xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] mt-0.5">{style.icon}</span>
            <span className="flex-1 text-sm text-bone/90 leading-relaxed font-body">{notif.message}</span>
            <button
              className="text-bone-dark/50 hover:text-bone text-xl leading-none px-1 transition-colors"
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
