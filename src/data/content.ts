import type { IconName } from '../components/Icons';

export type Tone = 'green' | 'sage' | 'gold';

export const toneBg: Record<Tone, string> = {
  green: 'bg-brand-green',
  sage: 'bg-brand-sage',
  gold: 'bg-brand-gold',
};

export interface ScopeItem {
  title: string;
  description: string;
}

export interface Outcome {
  label: string;
  icon: IconName;
}

export interface Phase {
  number: 1 | 2 | 3;
  slug: string;
  title: string;
  stage: string;
  tagline: string;
  focus: string;
  covers: string[];
  icon: IconName;
  tone: Tone;
  scope: ScopeItem[];
  outcomes: Outcome[];
}

export const company = {
  name: 'Trove P&P',
  slogan: 'Beyond Limits. Building Future.',
  address: [
    'Trove P&P',
    '675 - I Floor, Iyer Hospital Stop',
    'Trichy Road (Above Exide Show room)',
    'Coimbatore - 641005',
  ],
  emails: ['info@trovepp.in', 'reachus@trovepp.in'],
  phone: { display: '+91 97912 79118', tel: '+919791279118' },
};

export const offering = {
  name: 'EffHR',
  category: 'Organisational Capability Building',
  headline: 'Building effective HR systems in a phased manner',
  subline: 'to align business goals and people aspirations',
  quote: 'Strong systems give good people the room to do great work.',
};

export const phases: Phase[] = [
  {
    number: 1,
    slug: 'stabilize-sustain',
    title: 'Stabilize & Sustain',
    stage: 'Foundation',
    tagline: 'Putting the foundation in place',
    focus: 'Structure, roles, policies and reviews put in place',
    covers: ['Org structure', 'KRA-KPI', 'Induction', 'HR policy & process', 'Performance review'],
    icon: 'org',
    tone: 'green',
    scope: [
      { title: 'Org structure', description: 'Clear roles, levels and reporting lines' },
      { title: 'KRA | KPI', description: 'Measurable expectations for every role' },
      { title: 'Induction program', description: 'A structured start for every new joiner' },
      { title: 'HR policy & process documents', description: 'Set policies and standard processes' },
      { title: 'Performance review systems', description: 'A fair, periodical way to review performance' },
    ],
    outcomes: [
      { label: 'Clear structure', icon: 'org' },
      { label: 'Measurable roles', icon: 'cost' },
      { label: 'Set policies', icon: 'book' },
      { label: 'Periodical reviews', icon: 'process' },
    ],
  },
  {
    number: 2,
    slug: 'organize-optimize',
    title: 'Organize & Optimize',
    stage: 'Building capabilities',
    tagline: 'Building capability and optimising resources',
    focus: 'Talent, skills, engagement and optimised resources',
    covers: ['Talent acquisition', 'Skills', 'Engagement', 'Rewards & recognition', 'Individual to process-driven'],
    icon: 'team',
    tone: 'sage',
    scope: [
      { title: 'Talent acquisition', description: 'Planned, structured hiring' },
      { title: 'Skill development programs', description: 'Close skill gaps, prepare for bigger roles' },
      { title: 'Employee engagement programs', description: 'Keep people motivated and committed' },
      { title: 'Rewards & recognition', description: 'Recognise and reward good performance' },
      {
        title: 'Individual-driven to purpose & process-driven',
        description: 'Move from individual dependence to shared purpose and process',
      },
    ],
    outcomes: [
      { label: 'Right talent', icon: 'talent' },
      { label: 'Skills trainings', icon: 'cap' },
      { label: 'Engaged teams', icon: 'team' },
      { label: 'Process-driven', icon: 'process' },
    ],
  },
  {
    number: 3,
    slug: 'perform-progress',
    title: 'Perform & Progress',
    stage: 'Progress',
    tagline: 'Focusing capability on growth',
    focus: 'Growth axis, performance management and leadership',
    covers: ['Growth axis', 'Performance management', 'Leadership & coaching', 'Goals & engagement', 'Succession'],
    icon: 'growth',
    tone: 'gold',
    scope: [
      { title: 'Growth axis', description: 'Choose and focus on the few growth priorities' },
      {
        title: 'Performance management system',
        description: 'Make performance management drive growth, not only measure',
      },
      { title: 'Leadership development & coaching', description: 'Develop and coach leaders to carry growth' },
      { title: 'Goal setting & engagement', description: 'Cascade goals and keep teams engaged' },
      { title: 'Succession planning & career paths', description: 'Build the leadership pipeline for the next stage' },
    ],
    outcomes: [
      { label: 'Focusing on growth', icon: 'growth' },
      { label: 'Goals-linked rewards & recognition', icon: 'medal' },
      { label: 'Leadership coaching', icon: 'leader' },
      { label: 'Aligned goals', icon: 'target' },
    ],
  },
];

export const journey = ['Foundation', 'Capability', 'Progress'];
export const journeyCaption = 'From a stable foundation, to stronger capability, to sustained growth';

export const approach = {
  assess: {
    title: 'Assess',
    description: 'Capability assessment of the organisation today',
    areas: [
      { label: 'Org Structure', icon: 'org' as IconName },
      { label: 'Manpower Cost', icon: 'cost' as IconName },
      { label: 'People Management Policies', icon: 'book' as IconName },
      { label: 'HR Process', icon: 'process' as IconName },
    ],
  },
  align: {
    title: 'Align',
    description: 'Engagement document',
    steps: [
      { label: 'Assessment findings', icon: 'findings' as IconName },
      { label: 'Scope of deliverables', icon: 'target' as IconName },
    ],
  },
  engage: {
    title: 'Engage',
    description: 'The three phases begin',
  },
};

/** Page sections in scroll order; `id` is the anchor target. */
export const sections = [
  { id: 'home', label: 'Home' },
  { id: 'phases', label: 'Phases' },
  ...phases.map((p) => ({ id: p.slug, label: p.title })),
  { id: 'approach', label: 'Here We Go' },
  { id: 'contact', label: 'Contact' },
];

export const sectionIds = sections.map((s) => s.id);

export const enquiryInterests = [
  'Capability assessment',
  ...phases.map((p) => `Phase ${p.number}: ${p.title}`),
  'Not sure yet',
];
