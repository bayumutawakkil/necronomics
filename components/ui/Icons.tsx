'use client';

import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

// ================= RESOURCE ICONS =================

export function CorpseIcon({ className = '', size = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-zinc-500 ${className}`} {...props}>
      <path d="M9 10h.01M15 10h.01" />
      <path d="M12 2a8 8 0 0 0-8 8v1a4 4 0 0 0 3 3.87v2.13a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3v-2.13a4 4 0 0 0 3-3.87v-1a8 8 0 0 0-8-8z" />
      <path d="M9 16h6" />
    </svg>
  );
}

export function BoneIcon({ className = '', size = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-yellow-100 ${className}`} {...props}>
      <path d="M17.5 5.5a2.5 2.5 0 0 0-3.5 0l-8.5 8.5a2.5 2.5 0 1 0 3.5 3.5l8.5-8.5a2.5 2.5 0 0 0 0-3.5z" />
      <path d="M6 18a2 2 0 1 1-2-2 2 2 0 0 1 2 2z" />
      <path d="M18 6a2 2 0 1 1 2 2 2 2 0 0 1-2-2z" />
      <path d="M8.5 12.5l3 3" />
    </svg>
  );
}

export function FleshIcon({ className = '', size = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-red-500 ${className}`} {...props}>
      <path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7z" />
    </svg>
  );
}

export function SoulResidueIcon({ className = '', size = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-violet-400 ${className}`} {...props}>
      <path d="M12 2C6.5 2 2 6.5 2 12c0 3.5 1.8 6.6 4.5 8.5.5.4 1.2.2 1.4-.4l1.3-4c.2-.5.7-.8 1.2-.8h3.2c.5 0 1 .3 1.2.8l1.3 4c.2.6.9.8 1.4.4 2.7-1.9 4.5-5 4.5-8.5 0-5.5-4.5-10-10-10z" />
      <path d="M9 10h.01M15 10h.01" />
      <path d="M10 14c1 .5 3 .5 4 0" />
    </svg>
  );
}

export function NecroticCementIcon({ className = '', size = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-cyan-500 ${className}`} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M3 15h18M9 3v6M15 9v6M9 15v6" />
    </svg>
  );
}

export function BiomatterFuelIcon({ className = '', size = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-emerald-500 ${className}`} {...props}>
      <path d="M6 3h12M12 3v3M10 6h4M7 21h10a2 2 0 0 0 2-2V9a2 2 0 0 0-1-1.73L14 5V3M10 5l-4 2.27A2 2 0 0 0 5 9v10a2 2 0 0 0 2 2z" />
      <path d="M8.5 13h7M7 17h10" />
    </svg>
  );
}

export function MagicBatteryIcon({ className = '', size = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-blue-500 ${className}`} {...props}>
      <rect x="6" y="7" width="12" height="14" rx="2" />
      <path d="M10 3h4M10 7v14M14 7v14" />
    </svg>
  );
}

export function RitualEnergyIcon({ className = '', size = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-indigo-400 ${className}`} {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

// ================= UNIT ICONS =================

export function SkeletonIcon({ className = '', size = 24, ...props }: IconProps) {
  return <BoneIcon size={size} className={className} {...props} />;
}

export function ZombieIcon({ className = '', size = 24, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-green-500 ${className}`} {...props}>
      <path d="M8 22V14M16 22V15M12 22v-9" />
      <path d="M5.5 10c0-2.5 3-4.5 6.5-4.5s6.5 2 6.5 4.5c0 1.2-.6 2.3-1.5 3L18 17M6 13v-3a2 2 0 0 0-2-2H2" />
      <path d="M18 10a2 2 0 0 1 2-2h2" />
      <circle cx="12" cy="7" r="1.5" />
    </svg>
  );
}

export function GhoulIcon({ className = '', size = 24, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-orange-500 ${className}`} {...props}>
      <path d="M12 2a6 6 0 0 0-6 6c0 4 3 8 3 10h6c0-2 3-6 3-10a6 6 0 0 0-6-6z" />
      <path d="M9 8h6M12 6v4" />
      <path d="M6 15l-3-1M18 15l3-1M8 18l-2 3M16 18l2 3" />
    </svg>
  );
}

export function GhostIcon({ className = '', size = 24, ...props }: IconProps) {
  return <SoulResidueIcon size={size} className={className} {...props} />;
}

export function VampireIcon({ className = '', size = 24, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-rose-500 ${className}`} {...props}>
      <path d="M12 2C9.5 5.5 4 8 4 12c0 4.4 3.6 8 8 8s8-3.6 8-8c0-4-5.5-6.5-8-10z" />
      <path d="M9 11l1.5 2.5L12 11l1.5 2.5L15 11" />
    </svg>
  );
}

// ================= STRUCTURE ICONS =================

export function MorgueIcon({ className = '', size = 24, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-amber-200 ${className}`} {...props}>
      <polygon points="6 2 18 2 21 8 18 22 6 22 3 8 6 2" />
      <line x1="12" y1="6" x2="12" y2="16" />
      <line x1="9" y1="10" x2="15" y2="10" />
    </svg>
  );
}

export function BoneMillIcon({ className = '', size = 24, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-orange-400 ${className}`} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

export function FactoryIcon({ className = '', size = 24, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-violet-400 ${className}`} {...props}>
      <path d="M2 20h20M17 18h4v-7l-4-3V4h-3v4H7V4H4v14" />
      <path d="M7 12h3M7 15h3M12 12h2M12 15h2" />
    </svg>
  );
}

export function RitualChamberIcon({ className = '', size = 24, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-rose-500 ${className}`} {...props}>
      <circle cx="12" cy="12" r="9" />
      <polygon points="12 5 14.5 11 20 12 14.5 13 12 19 9.5 13 4 12 9.5 11 12 5" />
    </svg>
  );
}

export function DecayPitIcon({ className = '', size = 24, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-emerald-500 ${className}`} {...props}>
      <path d="M3 12a9 9 0 0 0 18 0M3 12c0 3 4 5 9 5s9-2 9-5M3 12c0-3 4-5 9-5s9 2 9 5" />
      <path d="M12 7v10" />
    </svg>
  );
}

export function GraveyardIcon({ className = '', size = 24, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-yellow-200 ${className}`} {...props}>
      <path d="M6 22V8a3 3 0 0 1 6 0v14M18 22v-6a2 2 0 0 0-4 0v6" />
      <path d="M9 11h2M10 9v4" />
    </svg>
  );
}

// ================= UI / STATUS ICONS =================

export function WarningIcon({ className = '', size = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-amber-500 ${className}`} {...props}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export function InfoIcon({ className = '', size = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-blue-500 ${className}`} {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

export function DangerIcon({ className = '', size = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-rose-500 ${className}`} {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

export function ClockIcon({ className = '', size = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-slate-400 ${className}`} {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export function HourglassIcon({ className = '', size = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-slate-400 ${className}`} {...props}>
      <path d="M5 2h14M5 22h14M19 2v4a7 7 0 0 1-7 7 7 7 0 0 1-7-7V2M5 22v-4a7 7 0 0 1 7-7 7 7 0 0 1 7 7v4" />
    </svg>
  );
}

export function LockIcon({ className = '', size = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-amber-500 ${className}`} {...props}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function CheckIcon({ className = '', size = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-emerald-500 ${className}`} {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function SaveIcon({ className = '', size = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-slate-400 ${className}`} {...props}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

export function CloudIcon({ className = '', size = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-slate-400 ${className}`} {...props}>
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    </svg>
  );
}

export function ClipboardIcon({ className = '', size = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-slate-400 ${className}`} {...props}>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  );
}

export function ArrowRightIcon({ className = '', size = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-slate-400 ${className}`} {...props}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export function ArrowUpIcon({ className = '', size = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

export function ArrowDownIcon({ className = '', size = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </svg>
  );
}


export function StructuresIcon({ className = '', size = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-slate-400 ${className}`} {...props}>
      <path d="M2 22h20M12 2l-8 8v12h16V10l-8-8z" />
      <path d="M9 22v-8h6v8" />
    </svg>
  );
}

export function LabIcon({ className = '', size = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-violet-400 ${className}`} {...props}>
      <path d="M4.5 3h15M6 3v12a6 6 0 0 0 12 0V3M9 3v8a3 3 0 0 0 6 0V3" />
      <path d="M12 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
    </svg>
  );
}

export function StarIcon({ className = '', size = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-amber-400 ${className}`} {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

// Map helper to resolve resource icons dynamically
export function ResourceIcon({ name, size = 20, className = '' }: { name: string; size?: number; className?: string }) {
  switch (name) {
    case 'corpse':
      return <CorpseIcon size={size} className={className} />;
    case 'bone':
      return <BoneIcon size={size} className={className} />;
    case 'flesh':
      return <FleshIcon size={size} className={className} />;
    case 'soul_residue':
      return <SoulResidueIcon size={size} className={className} />;
    case 'necrotic_cement':
      return <NecroticCementIcon size={size} className={className} />;
    case 'biomatter_fuel':
      return <BiomatterFuelIcon size={size} className={className} />;
    case 'magic_battery':
      return <MagicBatteryIcon size={size} className={className} />;
    case 'ritual_energy':
      return <RitualEnergyIcon size={size} className={className} />;
    default:
      return null;
  }
}

// Map helper to resolve unit icons dynamically
export function UnitIcon({ name, size = 24, className = '' }: { name: string; size?: number; className?: string }) {
  switch (name) {
    case 'skeleton':
      return <SkeletonIcon size={size} className={className} />;
    case 'zombie':
      return <ZombieIcon size={size} className={className} />;
    case 'ghoul':
      return <GhoulIcon size={size} className={className} />;
    case 'ghost':
      return <GhostIcon size={size} className={className} />;
    case 'vampire':
      return <VampireIcon size={size} className={className} />;
    default:
      return null;
  }
}

// Map helper to resolve building icons dynamically
export function BuildingIcon({ name, size = 24, className = '' }: { name: string; size?: number; className?: string }) {
  switch (name) {
    case 'morgue':
      return <MorgueIcon size={size} className={className} />;
    case 'bone_mill':
      return <BoneMillIcon size={size} className={className} />;
    case 'necro_factory':
      return <FactoryIcon size={size} className={className} />;
    case 'ritual_chamber':
      return <RitualChamberIcon size={size} className={className} />;
    case 'decay_pit':
      return <DecayPitIcon size={size} className={className} />;
    case 'graveyard':
      return <GraveyardIcon size={size} className={className} />;
    default:
      return null;
  }
}

// Map helper to resolve research icons dynamically
export function ResearchIcon({ name, size = 24, className = '' }: { name: string; size?: number; className?: string }) {
  switch (name) {
    // Categories
    case 'efficiency':
    case '⚡':
      return <StarIcon size={size} className={`text-violet-400 ${className}`} />;
    case 'production':
    case '🏭':
      return <FactoryIcon size={size} className={`text-emerald-400 ${className}`} />;
    case 'units':
    case '🦴':
      return <BoneIcon size={size} className={`text-yellow-100 ${className}`} />;
    case 'buildings':
    case '🏗️':
      return <StructuresIcon size={size} className={`text-orange-400 ${className}`} />;

    // Individual researches (intercepting the emoji symbols directly)
    case '📚': // basic_necromancy
      return <ClipboardIcon size={size} className={`text-blue-300 ${className}`} />;
    case '🧪': // advanced_reanimation
      return <DecayPitIcon size={size} className={`text-emerald-400 ${className}`} />;
    case '👻': // spectral_mastery
      return <GhostIcon size={size} className={`text-violet-400 ${className}`} />;
    case '⚰️': // efficient_harvesting
      return <MorgueIcon size={size} className={`text-amber-250 ${className}`} />;
    case '⚙️': // industrial_processing
      return <BoneMillIcon size={size} className={`text-orange-400 ${className}`} />;
    case '🏭': // mass_production
      return <FactoryIcon size={size} className={`text-violet-400 ${className}`} />;
    case '🧊': // preservation_techniques
      return <ClockIcon size={size} className={`text-cyan-400 ${className}`} />;
    case '🛡️': // reinforced_bodies
      return <CheckIcon size={size} className={`text-emerald-400 ${className}`} />;
    case '⛓️': // eternal_binding
      return <LockIcon size={size} className={`text-red-500 ${className}`} />;
    case '📐': // expanded_facilities
      return <StructuresIcon size={size} className={`text-blue-400 ${className}`} />;
    case '📊': // optimized_workflow
      return <InfoIcon size={size} className={`text-slate-400 ${className}`} />;
    case '🏗️': // mega_structures
      return <StructuresIcon size={size} className={`text-amber-500 ${className}`} />;
    case '💰': // efficient_necromancy
      return <ResourceIcon name="bone" size={size} className={className} />;
    case '💸': // bulk_reanimation
      return <ResourceIcon name="flesh" size={size} className={className} />;
    default:
      return <InfoIcon size={size} className={className} />;
  }
}
