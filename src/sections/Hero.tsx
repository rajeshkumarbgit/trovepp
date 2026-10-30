import { offering } from '../data/content';

export default function Hero() {
  return (
    <section id="home" aria-labelledby="home-title" className="page-hero scroll-mt-[4.75rem]">
      <div className="container-site py-14 sm:py-20">
        <p className="font-display text-sm font-bold uppercase tracking-wider text-brand-sand">{offering.category}</p>
        <h1 id="home-title" className="mt-3 font-display text-5xl font-extrabold text-white sm:text-7xl">
          {offering.name}
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-white/85 sm:text-xl">
          {offering.headline} <span className="font-semibold text-brand-sand">{offering.subline}</span>.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#approach" className="btn bg-brand-sand text-brand-deep hover:bg-white">
            How we engage
          </a>
          <a href="#contact" className="btn-outline">
            Send an enquiry
          </a>
        </div>
      </div>
    </section>
  );
}
