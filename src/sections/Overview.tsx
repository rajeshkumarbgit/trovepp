import { Fragment } from 'react';
import { IconBadge } from '../components/Icons';
import { journey, journeyCaption, offering, phases, toneBg } from '../data/content';

function FlowArrow() {
  return (
    <svg viewBox="0 0 60 12" className="h-3 w-12 shrink-0 rotate-90 fill-brand-gold md:rotate-0" aria-hidden="true">
      <path d="M0 5h50V0l10 6-10 6V7H0z" />
    </svg>
  );
}

export default function Overview() {
  return (
    <section id="phases" aria-labelledby="phases-title" className="scroll-mt-[4.75rem]">
      <div className="container-site space-y-16 py-14 sm:py-20">
        <div className="border-l-8 border-brand-sand bg-brand-cream px-6 py-8 sm:px-10">
          <p className="font-display text-xl font-bold text-brand-green sm:text-2xl">{offering.headline}</p>
          <p className="mt-3 font-display text-xl font-bold text-brand-gold sm:text-2xl">{offering.subline}</p>
        </div>

        {/* Three phases */}
        <div>
          <h2 id="phases-title" className="section-title">
            Three phases of involvement
          </h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {phases.map((p) => (
              <li key={p.slug}>
                <a
                  href={`#${p.slug}`}
                  className="card group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg"
                >
                  <span className={`${toneBg[p.tone]} py-4 text-center font-display text-sm font-bold uppercase tracking-wider text-white`}>
                    Phase {p.number}
                  </span>
                  <span className="flex flex-1 flex-col items-center gap-5 px-6 py-8 text-center">
                    <IconBadge name={p.icon} />
                    <span className="font-display text-lg font-bold text-brand-green">{p.title}</span>
                    <span className="text-sm text-slate-500">{p.tagline}</span>
                    <span className="mt-auto text-sm font-semibold text-brand-gold group-hover:underline">
                      Explore phase ↓
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </div>

        {/* At a glance: table on md+, stacked cards on mobile */}
        <div>
          <h2 className="section-title">At a glance</h2>

          <div className="mt-8 hidden overflow-hidden rounded-xl md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-green text-white">
                <tr>
                  <th scope="col" className="px-6 py-4 font-display">Phase</th>
                  <th scope="col" className="px-6 py-4 font-display">Focus</th>
                  <th scope="col" className="px-6 py-4 font-display">What it covers</th>
                </tr>
              </thead>
              <tbody>
                {phases.map((p, i) => (
                  <tr key={p.slug} className={`border-b border-slate-200 ${i % 2 === 0 ? 'bg-brand-mint' : 'bg-white'}`}>
                    <th scope="row" className="px-6 py-5 align-top">
                      <a href={`#${p.slug}`} className="font-display font-bold text-brand-green hover:underline">
                        {p.number}. {p.title}
                      </a>
                      <span className="mt-2 block font-display text-xs font-bold text-brand-gold">{p.stage}</span>
                    </th>
                    <td className="px-6 py-5 align-top">{p.focus}</td>
                    <td className="px-6 py-5 align-top">{p.covers.join(' · ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="mt-8 space-y-4 md:hidden">
            {phases.map((p) => (
              <li key={p.slug} className="card p-5">
                <a href={`#${p.slug}`} className="font-display font-bold text-brand-green">
                  {p.number}. {p.title}
                </a>
                <p className="font-display text-xs font-bold text-brand-gold">{p.stage}</p>
                <p className="mt-3 text-sm">{p.focus}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {p.covers.map((c) => (
                    <li key={c} className="rounded-full bg-white px-3 py-1 text-xs text-brand-green">
                      {c}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>

        {/* How the phases help */}
        <div>
          <h2 className="section-title">How the three phases help</h2>
          <div className="mt-8 border-l-8 border-brand-sand bg-brand-cream p-6 sm:p-8">
            <div className="flex flex-col items-center gap-4 md:flex-row">
              {journey.map((step, i) => (
                <Fragment key={step}>
                  <span
                    className={`${toneBg[phases[i].tone]} w-full rounded-xl py-4 text-center font-display font-bold text-white md:flex-1`}
                  >
                    {step}
                  </span>
                  {i < journey.length - 1 && <FlowArrow />}
                </Fragment>
              ))}
            </div>
            <p className="mt-6 text-center font-display font-bold text-brand-green">{journeyCaption}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
