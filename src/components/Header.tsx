import { useState } from 'react';
import { sectionIds, sections } from '../data/content';
import useActiveSection from '../hooks/useActiveSection';

export default function Header() {
  const [open, setOpen] = useState(false);
  const active = useActiveSection(sectionIds);

  const linkClass = (id: string) =>
    `block rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
      id === active ? 'bg-brand-mint text-brand-green' : 'text-slate-600 hover:text-brand-green'
    }`;

  const links = sections.map((s) => (
    <li key={s.id}>
      <a
        href={`#${s.id}`}
        className={linkClass(s.id)}
        aria-current={s.id === active ? 'location' : undefined}
        onClick={() => setOpen(false)}
      >
        {s.label}
      </a>
    </li>
  ));

  return (
    <header className="sticky top-0 z-50 border-b-4 border-brand-sand bg-white/95 backdrop-blur">
      <div className="container-site flex h-[4.5rem] items-center justify-between gap-4">
        <a href="#home" className="shrink-0" aria-label="Trove P&P, back to top" onClick={() => setOpen(false)}>
          <img src="/logo.png" alt="Trove P&P" className="h-10 w-auto sm:h-12" width={663} height={183} />
        </a>

        <nav aria-label="Main" className="hidden xl:block">
          <ul className="flex items-center gap-1">{links}</ul>
        </nav>

        <button
          type="button"
          className="rounded-md p-2 text-brand-green xl:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="max-h-[calc(100vh-4.75rem)] overflow-y-auto border-t border-brand-mint bg-white xl:hidden">
          <ul className="container-site space-y-1 py-3">{links}</ul>
        </nav>
      )}
    </header>
  );
}
