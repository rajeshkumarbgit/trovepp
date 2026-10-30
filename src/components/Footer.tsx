import { company, sections } from '../data/content';

export default function Footer() {
  return (
    <footer className="bg-brand-deep text-white/80">
      <div className="container-site grid gap-10 py-12 md:grid-cols-3">
        <div>
          <a href="#home" className="inline-block rounded-xl bg-white p-3" aria-label="Back to top">
            <img src="/logo.png" alt="Trove P&P" className="h-12 w-auto" width={663} height={183} loading="lazy" />
          </a>
          <p className="mt-4 font-display font-bold text-brand-sand">{company.slogan}</p>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-brand-sand">Explore</h2>
          <ul className="grid grid-cols-2 gap-2 text-sm md:grid-cols-1">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="hover:text-white">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-brand-sand">Reach us</h2>
          <address className="text-sm not-italic leading-relaxed">
            {company.address.map((line, i) => (
              <span key={line} className={`block ${i === 0 ? 'font-semibold text-white' : ''}`}>
                {line}
              </span>
            ))}
          </address>
          <ul className="mt-4 space-y-1 text-sm">
            <li>
              <a href={`tel:${company.phone.tel}`} className="text-brand-sand hover:text-white">
                {company.phone.display}
              </a>
            </li>
            {company.emails.map((e) => (
              <li key={e}>
                <a href={`mailto:${e}`} className="text-brand-sand hover:text-white">
                  {e}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="container-site py-4 text-center text-xs text-white/60">
          © {new Date().getFullYear()} {company.name}. {company.slogan}
        </p>
      </div>
      <div className="brand-rule" />
    </footer>
  );
}
