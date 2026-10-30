import SectionBanner from '../components/SectionBanner';
import PhaseStepper from '../components/PhaseStepper';
import { IconBadge } from '../components/Icons';
import { phases, type Phase } from '../data/content';

export default function PhaseSection({ phase }: { phase: Phase }) {
  const titleId = `${phase.slug}-title`;

  return (
    <section id={phase.slug} aria-labelledby={titleId} className="scroll-mt-[4.75rem]">
      <SectionBanner id={titleId} title={phase.title} eyebrow={`Phase ${phase.number} of ${phases.length}`} kicker={phase.stage} />

      <div className="container-site space-y-14 py-10 sm:py-14">
        <div>
          <PhaseStepper active={phase.number} />
          <p className="mt-8 font-display text-lg font-bold italic text-brand-gold">{phase.tagline}</p>
        </div>

        <div>
          <h3 className="section-title">Scope</h3>
          <ol className="mt-6 space-y-3">
            {phase.scope.map((item, i) => (
              <li key={item.title} className="card flex items-center gap-5 border-l-8 border-brand-sand p-4 sm:gap-8 sm:p-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-green font-display text-lg font-bold text-white sm:h-16 sm:w-16 sm:text-xl">
                  {i + 1}
                </span>
                <div>
                  <h4 className="font-display font-bold sm:text-lg">{item.title}</h4>
                  <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h3 className="section-title">Outcomes</h3>
          <ul className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {phase.outcomes.map((o) => (
              <li key={o.label} className="card card-underline flex flex-col items-center gap-5 px-3 pb-8 pt-6 text-center">
                <span className="flex min-h-[2.5rem] items-center font-display text-sm font-bold text-brand-green">
                  {o.label}
                </span>
                <IconBadge name={o.icon} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
