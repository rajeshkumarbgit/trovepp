import { Fragment, type ReactNode } from 'react';
import SectionBanner from '../components/SectionBanner';
import { Icon, IconBadge } from '../components/Icons';
import { approach, offering, phases, toneBg } from '../data/content';

function Step({ n, title, description, children }: { n: number; title: string; description: string; children: ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-5">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-sand font-display text-xl font-bold text-brand-green">
          {n}
        </span>
        <div>
          <h3 className="text-2xl font-bold">{title}</h3>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function DownArrow() {
  return (
    <svg viewBox="0 0 12 40" className="mx-auto my-8 h-10 w-3 fill-brand-gold" aria-hidden="true">
      <path d="M5 0h2v30h5l-6 10-6-10h5z" />
    </svg>
  );
}

function RightArrow() {
  return (
    <svg viewBox="0 0 60 12" className="h-3 w-12 shrink-0 rotate-90 fill-brand-gold md:rotate-0" aria-hidden="true">
      <path d="M0 5h50V0l10 6-10 6V7H0z" />
    </svg>
  );
}

const timelineBg = ['bg-brand-green text-white', 'bg-brand-sage text-white', 'bg-brand-sand text-brand-green'];

export default function Approach() {
  const { assess, align, engage } = approach;

  return (
    <section id="approach" aria-labelledby="approach-title" className="scroll-mt-[4.75rem]">
      <SectionBanner id="approach-title" title="Here We Go" eyebrow="Assess → Align → Engage" />

      <div className="container-site py-10 sm:py-14">
        <Step n={1} title={assess.title} description={assess.description}>
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {assess.areas.map((a) => (
              <li key={a.label} className="card card-underline flex flex-col items-center gap-5 px-3 pb-8 pt-6 text-center">
                <IconBadge name={a.icon} size="lg" />
                <span className="font-display text-sm font-bold text-brand-green">{a.label}</span>
              </li>
            ))}
          </ul>
        </Step>

        <DownArrow />

        <Step n={2} title={align.title} description={align.description}>
          <div className="card flex flex-col items-center gap-4 p-6 md:flex-row md:p-8">
            {align.steps.map((s) => (
              <Fragment key={s.label}>
                <div className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-brand-green bg-white px-4 py-5 text-center md:w-48">
                  <Icon name={s.icon} className="h-16 w-16" />
                  <span className="font-display text-sm font-bold text-brand-green">{s.label}</span>
                </div>
                <RightArrow />
              </Fragment>
            ))}
            <div className="w-full md:flex-1">
              <p className="mb-3 text-center font-display text-sm font-bold text-brand-green">Timelines</p>
              <ol className="space-y-2">
                {phases.map((p, i) => (
                  <li key={p.slug} className={`${timelineBg[i]} rounded-lg py-2 text-center font-display text-sm font-bold`}>
                    Phase {p.number}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Step>

        <DownArrow />

        <Step n={3} title={engage.title} description={engage.description}>
          <ol className="flex flex-col gap-1 md:flex-row md:gap-0">
            {phases.map((p) => (
              <li key={p.slug} className={`chevron ${toneBg[p.tone]} md:-mr-6 md:flex-1 last:md:mr-0`}>
                <a
                  href={`#${p.slug}`}
                  className="flex items-center justify-center gap-4 px-12 py-8 text-white hover:opacity-90 md:py-10"
                >
                  <span className={`font-display text-4xl font-bold ${p.tone === 'gold' ? 'text-white' : 'text-brand-sand'}`}>
                    {p.number}
                  </span>
                  <span className="font-display font-bold leading-tight">{p.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </Step>

        <blockquote className="mt-14 flex items-center gap-6 border-l-8 border-brand-sand bg-brand-green px-6 py-8 text-white sm:px-10">
          <span className="font-display text-6xl leading-none text-brand-sand" aria-hidden="true">
            “
          </span>
          <p className="font-display text-lg font-bold italic sm:text-xl">{offering.quote}</p>
        </blockquote>
      </div>
    </section>
  );
}
