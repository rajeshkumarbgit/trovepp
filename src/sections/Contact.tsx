import SectionBanner from '../components/SectionBanner';
import EnquiryForm from '../components/EnquiryForm';
import { company } from '../data/content';

const mapQuery = encodeURIComponent(company.address.slice(1).join(', '));

export default function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="scroll-mt-[4.75rem]">
      <SectionBanner id="contact-title" title="Contact Us" eyebrow={company.slogan} />

      <div className="container-site space-y-8 py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-2">
            <div className="card card-underline p-6 sm:p-8">
              <h3 className="text-xl font-bold">Visit us</h3>
              <address className="mt-4 not-italic leading-relaxed">
                {company.address.map((line, i) => (
                  <span key={line} className={`block ${i === 0 ? 'font-semibold text-brand-green' : ''}`}>
                    {line}
                  </span>
                ))}
              </address>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-6"
              >
                Open in Google Maps
              </a>
            </div>

            <div className="card card-underline p-6 sm:p-8">
              <h3 className="text-xl font-bold">Call or write to us</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <a
                    href={`tel:${company.phone.tel}`}
                    className="flex items-center gap-3 rounded-lg bg-white px-4 py-3 font-semibold text-brand-green hover:text-brand-gold"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2" />
                    </svg>
                    {company.phone.display}
                  </a>
                </li>
                {company.emails.map((e) => (
                  <li key={e}>
                    <a
                      href={`mailto:${e}`}
                      className="flex items-center gap-3 rounded-lg bg-white px-4 py-3 font-semibold text-brand-green hover:text-brand-gold"
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <path d="M3 7l9 6 9-6" />
                      </svg>
                      {e}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="card relative p-6 sm:p-8 lg:col-span-3">
            <h3 className="text-xl font-bold">Send an enquiry</h3>
            <p className="mb-6 mt-2 text-sm text-slate-600">
              Start with a capability assessment of your organisation. Tell us where you are today and we will take it from there.
            </p>
            <EnquiryForm />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border-4 border-brand-mint bg-brand-mint">
          <iframe
            title={`Map showing ${company.name} office`}
            src={`https://maps.google.com/maps?q=${mapQuery}&z=16&output=embed`}
            className="block h-72 w-full sm:h-96"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
