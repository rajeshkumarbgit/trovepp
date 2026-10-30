import { phases } from '../data/content';

function Arrow() {
  return (
    <svg viewBox="0 0 12 12" className="hidden h-3 w-3 shrink-0 fill-brand-gold sm:block" aria-hidden="true">
      <path d="M0 4h6V1l6 5-6 5V8H0z" />
    </svg>
  );
}

/** Three-step tracker at the top of each phase section; highlights the active phase. */
export default function PhaseStepper({ active }: { active: number }) {
  return (
    <nav aria-label="Phases">
      <ol className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
        {phases.map((p, i) => {
          const isActive = p.number === active;
          return (
            <li key={p.slug} className="flex flex-1 items-center gap-2">
              <a
                href={`#${p.slug}`}
                aria-current={isActive ? 'step' : undefined}
                className={`flex flex-1 items-center gap-4 rounded-xl border-2 border-brand-green px-5 py-4 transition-colors ${
                  isActive ? 'bg-brand-green text-white' : 'bg-brand-mint text-brand-green hover:bg-white'
                }`}
              >
                <span className="font-display text-3xl font-bold text-brand-gold">{p.number}</span>
                <span className="font-display text-sm font-bold leading-tight">{p.title}</span>
              </a>
              {i < phases.length - 1 && <Arrow />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
