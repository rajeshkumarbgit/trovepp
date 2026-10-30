import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { company, enquiryInterests } from '../data/content';
import { validateEnquiry, type EnquiryErrors as Errors, type EnquiryFields as Fields } from '../lib/enquiryValidation';

const ENDPOINT: string = import.meta.env.VITE_ENQUIRY_URL ?? '/enquiry.php';

type Status = 'idle' | 'sending' | 'success' | 'error';

const empty: Fields = { name: '', company: '', email: '', phone: '', interest: enquiryInterests[0], message: '' };

function Field({ id, label, required, error, children }: { id: string; label: string; required?: boolean; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-brand-green">
        {label}
        {required ? <span className="text-brand-gold"> *</span> : <span className="font-normal text-slate-400"> (optional)</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export default function EnquiryForm() {
  const [fields, setFields] = useState<Fields>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [serverMessage, setServerMessage] = useState('');
  const [token, setToken] = useState('');

  // Signed, time-stamped token from the server: proves the form was loaded from this site
  const loadToken = useCallback(() => {
    fetch(`${ENDPOINT}?action=token`, { headers: { Accept: 'application/json' } })
      .then((r) => r.json())
      .then((d: { token?: string }) => setToken(d.token ?? ''))
      .catch(() => setToken(''));
  }, []);

  useEffect(loadToken, [loadToken]);

  const update = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const name = e.target.name as keyof Fields;
    setFields((f) => ({ ...f, [name]: e.target.value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const inputProps = (name: keyof Fields) => ({
    id: `enquiry-${name}`,
    name,
    value: fields[name],
    onChange: update,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `enquiry-${name}-error` : undefined,
    className: 'form-input',
  });

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const found = validateEnquiry(fields);
    setErrors(found);
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      form.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch(ENDPOINT, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string; fields?: Errors } | null;
      if (res.ok && data?.ok) {
        setStatus('success');
        setFields(empty);
        loadToken();
        return;
      }
      if (res.status === 400) loadToken(); // expired/too-fast token: fetch a fresh one for the retry
      if (data?.fields) setErrors(data.fields);
      setServerMessage(data?.error ?? 'Something went wrong while sending your enquiry.');
      setStatus('error');
    } catch {
      setServerMessage('We could not reach the server.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div role="status" className="flex flex-col items-center gap-4 rounded-xl bg-white px-6 py-12 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-green text-white">
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M5 12l5 5 9-10" />
          </svg>
        </span>
        <p className="font-display text-xl font-bold text-brand-green">Thank you for reaching out</p>
        <p className="max-w-sm text-sm text-slate-600">
          Your enquiry has been sent to our team. We will get back to you shortly from an @trovepp.in email address.
        </p>
        <button type="button" className="btn-primary mt-2" onClick={() => setStatus('idle')}>
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={submit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="enquiry-name" label="Your name" required error={errors.name}>
          <input type="text" autoComplete="name" maxLength={100} {...inputProps('name')} />
        </Field>
        <Field id="enquiry-company" label="Organisation" required error={errors.company}>
          <input type="text" autoComplete="organization" maxLength={150} {...inputProps('company')} />
        </Field>
        <Field id="enquiry-email" label="Email" required error={errors.email}>
          <input type="email" autoComplete="email" maxLength={150} {...inputProps('email')} />
        </Field>
        <Field id="enquiry-phone" label="Phone" error={errors.phone}>
          <input type="tel" autoComplete="tel" maxLength={20} {...inputProps('phone')} />
        </Field>
      </div>

      <Field id="enquiry-interest" label="I am interested in" required>
        <select {...inputProps('interest')}>
          {enquiryInterests.map((i) => (
            <option key={i}>{i}</option>
          ))}
        </select>
      </Field>

      <Field id="enquiry-message" label="Message" required error={errors.message}>
        <textarea rows={5} maxLength={3000} {...inputProps('message')} />
      </Field>

      {/* Honeypot: hidden from people, filled in by bots */}
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="enquiry-website">Leave this field empty</label>
        <input id="enquiry-website" type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="token" value={token} />

      {status === 'error' && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {serverMessage} You can also call us on{' '}
          <a href={`tel:${company.phone.tel}`} className="font-semibold underline">
            {company.phone.display}
          </a>{' '}
          or email{' '}
          <a href={`mailto:${company.emails[1]}`} className="font-semibold underline">
            {company.emails[1]}
          </a>
          .
        </p>
      )}

      <button type="submit" className="btn-primary w-full justify-center sm:w-auto" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send enquiry'}
      </button>
    </form>
  );
}
