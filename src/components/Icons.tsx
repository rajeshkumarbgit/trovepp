import type { ReactNode } from 'react';

const G = '#265A40';
const D = '#1C4430';
const S = '#80A58E';
const SAND = '#D9B37E';
const GOLD = '#B8925A';

export type IconName =
  | 'org'
  | 'team'
  | 'growth'
  | 'cost'
  | 'book'
  | 'process'
  | 'talent'
  | 'cap'
  | 'medal'
  | 'leader'
  | 'target'
  | 'findings';

const paths: Record<IconName, ReactNode> = {
  org: (
    <>
      <rect x="22" y="10" width="20" height="10" rx="2" fill={G} />
      <path d="M32 20v8M16 28h32M16 28v6M48 28v6" stroke={G} strokeWidth="2.5" fill="none" />
      <rect x="6" y="34" width="20" height="11" rx="2" fill={G} />
      <rect x="38" y="34" width="20" height="11" rx="2" fill={G} />
    </>
  ),
  team: (
    <>
      <circle cx="18" cy="24" r="4.5" fill={S} />
      <circle cx="46" cy="24" r="4.5" fill={S} />
      <circle cx="32" cy="18" r="6" fill={G} />
      <rect x="9" y="31" width="18" height="15" rx="5" fill={S} />
      <rect x="37" y="31" width="18" height="15" rx="5" fill={S} />
      <rect x="21" y="27" width="22" height="19" rx="6" fill={G} />
    </>
  ),
  growth: (
    <>
      <rect x="12" y="38" width="9" height="12" fill={G} />
      <rect x="26" y="31" width="9" height="19" fill={G} />
      <rect x="40" y="22" width="9" height="28" fill={GOLD} />
      <path d="M10 32 L48 12" stroke={GOLD} strokeWidth="3" strokeLinecap="round" />
      <path d="M41 10 L51 10 L46 18 Z" fill={GOLD} />
    </>
  ),
  cost: (
    <>
      <circle cx="21" cy="23" r="6" fill={G} />
      <rect x="11" y="31" width="20" height="17" rx="5" fill={G} />
      {[18, 25, 32, 39].map((y) => (
        <ellipse key={y} cx="44" cy={y + 5} rx="11" ry="4" fill={SAND} stroke={GOLD} strokeWidth="1.2" />
      ))}
    </>
  ),
  book: (
    <>
      <rect x="16" y="8" width="32" height="48" rx="2" fill={G} />
      <rect x="16" y="8" width="7" height="48" fill={D} />
      <path d="M28 20h14M28 27h14M28 34h14" stroke="#fff" strokeWidth="2" />
      <path d="M38 46h8v10l-4-3-4 3z" fill={SAND} />
    </>
  ),
  process: (
    <>
      <circle cx="32" cy="16" r="7" fill={SAND} />
      <circle cx="16" cy="44" r="7" fill={G} />
      <circle cx="48" cy="44" r="7" fill={G} />
      <path d="M31 23 L22 39 M33 23 L42 39 M23 41 Q32 36 41 41" stroke={GOLD} strokeWidth="2" fill="none" />
    </>
  ),
  talent: (
    <>
      <circle cx="28" cy="20" r="8" fill={G} />
      <rect x="14" y="30" width="28" height="22" rx="8" fill={G} />
      <circle cx="44" cy="44" r="10" fill={SAND} stroke="#fff" strokeWidth="2" />
      <path d="M39 44 l4 4 7-8" stroke={G} strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </>
  ),
  cap: (
    <>
      <path d="M4 26 L32 14 L60 26 L32 38 Z" fill={G} />
      <path d="M18 32 V46 L32 54 L46 46 V32 L32 38 Z" fill={D} />
      <path d="M54 28 V46" stroke={GOLD} strokeWidth="2" />
      <circle cx="54" cy="48" r="2.5" fill={SAND} />
    </>
  ),
  medal: (
    <>
      <path d="M20 6 L28 6 L36 26 L28 30 Z" fill={GOLD} />
      <path d="M44 6 L36 6 L28 26 L36 30 Z" fill={G} />
      <circle cx="32" cy="40" r="15" fill={SAND} stroke={GOLD} strokeWidth="2" />
      <path d="M32 31 l2.6 5.6 6 .6-4.5 4 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.5-4 6-.6z" fill="#fff" />
    </>
  ),
  leader: (
    <>
      <path d="M32 6 l2 4.5 5 .5-3.7 3.3 1 4.8-4.3-2.5-4.3 2.5 1-4.8-3.7-3.3 5-.5z" fill={SAND} />
      <circle cx="32" cy="30" r="8" fill={G} />
      <rect x="18" y="38" width="28" height="18" rx="8" fill={G} />
    </>
  ),
  target: (
    <>
      <circle cx="30" cy="34" r="22" fill={G} />
      <circle cx="30" cy="34" r="14" fill="#fff" />
      <circle cx="30" cy="34" r="9" fill={G} />
      <circle cx="30" cy="34" r="4" fill={SAND} />
      <path d="M30 34 L54 10" stroke={GOLD} strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  findings: (
    <>
      <rect x="14" y="6" width="32" height="44" rx="2" fill="#fff" stroke={G} strokeWidth="2.5" />
      <path d="M21 16h18M21 23h18M21 30h18M21 37h12" stroke={S} strokeWidth="2.5" />
      <circle cx="44" cy="48" r="9" fill={SAND} />
      <path d="M40 48 l3 3 5-6" stroke={G} strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </>
  ),
};

interface IconProps {
  name: IconName;
  className?: string;
}

export function Icon({ name, className = 'h-12 w-12' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

/** Icon inside the sand-ringed white disc used throughout the brochure. */
export function IconBadge({ name, size = 'md' }: IconProps & { size?: 'sm' | 'md' | 'lg' }) {
  const dims = { sm: 'h-20 w-20', md: 'h-28 w-28', lg: 'h-32 w-32' }[size];
  const inner = { sm: 'h-11 w-11', md: 'h-16 w-16', lg: 'h-20 w-20' }[size];
  return (
    <div className={`icon-badge ${dims}`}>
      <Icon name={name} className={inner} />
    </div>
  );
}
