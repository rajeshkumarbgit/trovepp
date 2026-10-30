# Trove P&P — EffHR website

Single-page, responsive site for the EffHR service offering, built from the
*Business Transformation Project – EffHR – Service offerings* brochure.

**Stack:** React 18 · TypeScript · Vite 5 · Tailwind CSS 3 · SCSS · PHP (enquiry mail)

## Run

```bash
npm install
npm run dev       # site at http://localhost:5173
npm run php       # optional: PHP server on :8000 so the enquiry form works in dev
npm run build     # production build in dist/
```

`npm run php` needs `php` on your PATH (e.g. `C:\xampp\php`). Without it the
form shows a friendly error in dev; everything else works.

## Sections

One scrolling page; the header highlights the section in view.

| Anchor | Content |
|---|---|
| `#home` | EffHR hero |
| `#phases` | Three phases, at a glance, how the phases help |
| `#stabilize-sustain` | Phase 1: scope & outcomes |
| `#organize-optimize` | Phase 2: scope & outcomes |
| `#perform-progress` | Phase 3: scope & outcomes |
| `#approach` | Here We Go: Assess → Align → Engage |
| `#contact` | Address, emails, enquiry form, map |

## Editing content

All copy (phases, scope, outcomes, address, emails, enquiry options) lives in
`src/data/content.ts`.

- Brand colours: `tailwind.config.js` (`brand.*`) and `src/styles/_variables.scss`
- Icons: `src/components/Icons.tsx`
- Logo: `public/logo.png` (transparent PNG from the brochure); favicon `public/favicon.png`

## Enquiry form

`src/components/EnquiryForm.tsx` posts to `public/enquiry.php`, which validates the
input and emails a branded HTML message (plus plain-text fallback) to
**reachus@trovepp.in**. Reply-To is set to the enquirer so the team can answer directly.

| File | Purpose |
|---|---|
| `public/enquiry.php` | Request handling, settings (recipient, sender, limits, token secret) |
| `public/enquiry-validate.php` | All validation and anti-phishing rules |
| `public/enquiry-template.php` | Email layout |
| `src/lib/enquiryValidation.ts` | Browser-side copy of the rules (instant feedback only) |

`FROM_EMAIL` (`info@trovepp.in`) must be a real mailbox on the domain, or mail may land in spam.

### Abuse and phishing protection

The form only ever emails `reachus@trovepp.in`. It never sends anything to the
address a visitor types, so it cannot be used to send phishing mail to other people.

**Rejected outright:**
- Bots: hidden honeypot field; signed form token (forged, under 3 s old or over 2 h old is refused); submissions posted from other websites
- Flooding: 5 per IP per hour, 3 per sender email per day, 50 site-wide per day
- Names with digits, links or symbols; organisation names with links or emails
- Emails on `trovepp.in` or look-alike `trove…` domains (impersonation), disposable inboxes, domains with no mail server
- Premium-rate (1900) and telemarketing (140) phone numbers, fake numbers (9999999999, 1234567890)
- Messages containing HTML/BBCode, shortened links (bit.ly…), links to IP addresses, or more than 2 links
- Hidden zero-width / text-direction characters in name, organisation, email or phone; mail-header injection

**Delivered, but marked `[Review]` with a warning banner:**
- International phone numbers, phone numbers inside the message
- Any link (shown disabled as `hxxps://example[.]com`, never clickable)
- Phishing/scam phrases (verify your account, OTP, gift card, bank transfer…)
- "Trove" in the sender's name/organisation; look-alike Cyrillic/Greek letters

Flagged enquiries also have no tap-to-call link. A mail-filter rule on the
`X-Trove-Enquiry: review` header can route them to a separate folder.

### PHP security hardening

- **Fails closed:** if a regex gives up on hostile input, the submission is rejected, never waved through
- **Size limits:** requests over 64 KB are refused (`.htaccess` + PHP check); each field is byte-capped before processing
- **No information leaks:** `display_errors` off, generic error messages, details go to the server error log only
- **Atomic rate limiting:** counters are file-locked, so parallel requests can't slip past
- **Header and argument injection:** recipient, sender and `-f` are constants; visitor values are newline-stripped and base64-encoded
- **XSS in email:** every visitor value is passed through `htmlspecialchars`
- **`.htaccess`:** blocks direct access to include files and dotfiles, disables directory listing, and sets security headers (CSP, X-Frame-Options, nosniff, Referrer-Policy)

**Ongoing:** keep the host on a supported PHP version (8.1+), use HTTPS, and check the
error log after launch. Re-run a review whenever the PHP files change.

Keep `TOKEN_SECRET` in `enquiry.php` private. If this code is ever published in a
public repository, generate a new value first.

## Deploying (cPanel / shared hosting)

1. `npm run build`
2. Upload the **contents** of `dist/` to `public_html/` (includes the three `enquiry*.php` files).
3. Submit a test enquiry and check the reachus@ inbox (and spam folder the first time).

Requires PHP 7.4+ with `mail()` enabled, which is standard on cPanel hosts.
