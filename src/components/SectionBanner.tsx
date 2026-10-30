interface SectionBannerProps {
  id: string;
  title: string;
  eyebrow: string;
  kicker?: string;
}

/** Green title band that opens each brochure section; `id` labels the parent <section>. */
export default function SectionBanner({ id, title, eyebrow, kicker }: SectionBannerProps) {
  return (
    <div className="page-hero">
      <div className="container-site flex flex-col gap-3 py-10 sm:flex-row sm:items-center sm:justify-between sm:py-14">
        <h2 id={id} className="font-display text-3xl font-extrabold text-white sm:text-5xl">
          {title}
        </h2>
        <div className="font-display text-sm font-bold uppercase tracking-wider text-brand-sand sm:text-right sm:text-base">
          <p>{eyebrow}</p>
          {kicker && <p>{kicker}</p>}
        </div>
      </div>
    </div>
  );
}
