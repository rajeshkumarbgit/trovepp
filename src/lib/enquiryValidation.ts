/**
 * Client-side enquiry rules, for instant feedback only. The server
 * (public/enquiry-validate.php) is the authority and applies stricter checks
 * (email domain lookup, phishing flags, rate limits).
 */

export interface EnquiryFields {
  name: string;
  company: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
}

export type EnquiryErrors = Partial<Record<keyof EnquiryFields, string>>;

const OWN_DOMAINS = ['trovepp.in'];
const DISPOSABLE_DOMAINS = [
  '10minutemail.com', 'dispostable.com', 'emailondeck.com', 'fakeinbox.com', 'getnada.com',
  'guerrillamail.com', 'guerrillamail.net', 'mailinator.com', 'maildrop.cc', 'mintemail.com',
  'mohmal.com', 'sharklasers.com', 'temp-mail.org', 'tempail.com', 'tempmail.com',
  'throwawaymail.com', 'trashmail.com', 'yopmail.com',
];
const URL_SHORTENERS = [
  'bit.ly', 'cutt.ly', 'goo.gl', 'is.gd', 'ow.ly', 'rb.gy', 'rebrand.ly', 's.id',
  't.co', 't.ly', 'tiny.cc', 'tinyurl.com', 'shorturl.at', 'v.gd',
];

const INVISIBLE_RE = /[­​-‏‪-‮⁠-⁤⁦-⁩﻿]/u;
const LINK_RE =
  /\b(?:https?:\/\/|www\.)[^\s<>"]+|\b(?:[a-z0-9-]+\.)+(?:com|net|org|info|biz|io|co|in|xyz|top|online|site|club|ru|cn|link|click|app|me|ly|gl|cc|at|id)\b(?:\/[^\s<>"]*)?/gi;
const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M} .'-]{1,99}$/u;
const COMPANY_RE = /^[\p{L}\p{M}\p{N}][\p{L}\p{M}\p{N} .,&'()/-]{1,149}$/u;
const EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

const findLinks = (text: string) => text.match(LINK_RE) ?? [];

export function phoneError(raw: string): string | undefined {
  const phone = raw.trim();
  if (!phone) return undefined;
  const invalid = 'Please enter a valid phone number, e.g. +91 98765 43210.';
  if (!/^\+?[0-9\s\-()]{7,20}$/.test(phone)) return invalid;

  const digits = phone.replace(/\D/g, '');
  const plus = phone.startsWith('+');
  let national: string | undefined;
  if (plus && digits.startsWith('91')) national = digits.slice(2);
  else if (!plus && digits.length === 10) national = digits;
  else if (!plus && digits.length === 11 && digits.startsWith('0')) national = digits.slice(1);
  else if (!plus && digits.length === 12 && digits.startsWith('91')) national = digits.slice(2);
  else if (plus && digits.length >= 8 && digits.length <= 15 && !digits.startsWith('0')) return undefined;
  else return invalid;

  if (!/^[1-9]\d{9}$/.test(national) || /^(\d)\1{9}$/.test(national) || ['1234567890', '9876543210'].includes(national)) {
    return invalid;
  }
  if (/^(1900|140)/.test(national)) return 'Premium-rate and telemarketing numbers are not accepted.';
  return undefined;
}

export function validateEnquiry(f: EnquiryFields): EnquiryErrors {
  const errors: EnquiryErrors = {};
  const name = f.name.trim();
  const company = f.company.trim();
  const email = f.email.trim().toLowerCase();
  const message = f.message.trim();

  if (INVISIBLE_RE.test(name) || !NAME_RE.test(name)) {
    errors.name = 'Please enter your name using letters only.';
  }

  if (!company) {
    errors.company = 'Please enter your organisation.';
  } else if (INVISIBLE_RE.test(company) || findLinks(company).length || company.includes('@') || !COMPANY_RE.test(company)) {
    errors.company = 'Please enter a valid organisation name (no links or special characters).';
  }

  const domain = email.split('@')[1] ?? '';
  if (INVISIBLE_RE.test(email) || !EMAIL_RE.test(email)) {
    errors.email = 'Please enter a valid email address.';
  } else if (OWN_DOMAINS.includes(domain) || /(^|\.)trove/i.test(domain)) {
    errors.email = "Please use your own organisation's email address.";
  } else if (DISPOSABLE_DOMAINS.includes(domain)) {
    errors.email = 'Disposable email addresses are not accepted.';
  }

  const phone = phoneError(f.phone);
  if (phone) errors.phone = phone;

  const links = findLinks(message);
  const linkHosts = links.map((l) => l.replace(/^(?:https?:\/\/)?(?:www\.)?([^/:?#]+).*$/i, '$1').toLowerCase());
  if (message.length < 10) {
    errors.message = 'Please tell us a little more (at least 10 characters).';
  } else if (/<\s*\/?\s*[a-z!][^>]*>/i.test(message) || /\[(url|link|img)\b/i.test(message)) {
    errors.message = 'Please remove HTML or formatting code from your message.';
  } else if (links.length > 2) {
    errors.message = 'Please include no more than 2 links.';
  } else if (linkHosts.some((h) => URL_SHORTENERS.includes(h))) {
    errors.message = 'Shortened links (bit.ly etc.) are not accepted. Please share the full address.';
  } else if (linkHosts.some((h) => /^\d{1,3}(\.\d{1,3}){3}$/.test(h))) {
    errors.message = 'Links to bare IP addresses are not accepted.';
  }

  return errors;
}
