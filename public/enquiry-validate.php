<?php
/**
 * Validation and anti-phishing rules for website enquiries. Included by enquiry.php.
 *
 * Two outcomes per check:
 *  - error: the submission is rejected with a message shown next to the field.
 *  - flag:  the enquiry is delivered, but marked [Review] with a warning banner so
 *           staff verify the sender before clicking links or calling back.
 *
 * Client-side mirror (for instant feedback only): src/lib/enquiryValidation.ts
 */
declare(strict_types=1);

if (!defined('TROVE_ENQUIRY')) {
    http_response_code(404);
    exit;
}

const OWN_DOMAINS = ['trovepp.in'];

const INTERESTS = [
    'Capability assessment',
    'Phase 1: Stabilize & Sustain',
    'Phase 2: Organize & Optimize',
    'Phase 3: Perform & Progress',
    'Not sure yet',
];

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

/** Phrases common in phishing / scam / spam messages. These flag, never reject. */
const SUSPICIOUS_PHRASES = [
    'verify your account', 'confirm your account', 'account suspended', 'password', 'login details',
    'log in to', 'otp', 'one time password', 'upi pin', 'kyc', 'bank account', 'wire transfer',
    'gift card', 'bitcoin', 'crypto', 'invoice attached', 'urgent payment', 'payment pending',
    'refund', 'lottery', 'you have won', 'prize', 'click here', 'click the link', 'download the',
    'remote access', 'anydesk', 'teamviewer', 'seo services', 'backlinks', 'casino', 'loan offer',
];

/** Zero-width, bidi-override and other invisible characters used to disguise text. */
const INVISIBLE_RE = '/[\x{00AD}\x{200B}-\x{200F}\x{202A}-\x{202E}\x{2060}-\x{2064}\x{2066}-\x{2069}\x{FEFF}]/u';

/** Explicit links (http/www) and bare domains such as example.com/path. */
const LINK_RE = '~\b(?:https?://|www\.)[^\s<>"]+|\b(?:[a-z0-9-]+\.)+(?:com|net|org|info|biz|io|co|in|xyz|top|online|site|club|ru|cn|link|click|app|me|ly|gl|cc|at|id)\b(?:/[^\s<>"]*)?~i';

// ---- Fail-closed regex helpers -------------------------------------------------
// preg_* return false/null when the engine gives up (e.g. backtrack limit on hostile
// input). Treating that as "no match" would let a crafted message skip the checks,
// so these throw instead and enquiry.php rejects the submission.

function rxFail(): void
{
    throw new RuntimeException('Regex engine error ' . preg_last_error());
}

function rxMatch(string $pattern, string $subject): bool
{
    $r = preg_match($pattern, $subject);
    if ($r === false) {
        rxFail();
    }
    return $r === 1;
}

function rxCount(string $pattern, string $subject, ?array &$matches = null): int
{
    $r = preg_match_all($pattern, $subject, $matches);
    if ($r === false) {
        rxFail();
    }
    return $r;
}

/** @param string|string[] $pattern @param string|string[] $replacement */
function rxReplace($pattern, $replacement, string $subject): string
{
    $r = preg_replace($pattern, $replacement, $subject);
    if ($r === null) {
        rxFail();
    }
    return $r;
}

function rxReplaceCallback(string $pattern, callable $callback, string $subject): string
{
    $r = preg_replace_callback($pattern, $callback, $subject);
    if ($r === null) {
        rxFail();
    }
    return $r;
}

/**
 * Read and normalise one POST field.
 * Returns [value, hadInvisibleChars].
 */
function readField(string $key, int $max, bool $multiline = false): array
{
    $value = $_POST[$key] ?? '';
    // Byte cap before any processing (4 bytes per UTF-8 char + slack), so oversized
    // posts never reach the regexes. Over-long input is rejected, not truncated.
    if (!is_string($value) || strlen($value) > $max * 4 + 64 || !mb_check_encoding($value, 'UTF-8')) {
        return ['', true];
    }
    if (class_exists('Normalizer')) {
        // NFKC folds look-alike "compatibility" characters (e.g. fullwidth letters) to plain ones
        $value = (string) Normalizer::normalize($value, Normalizer::FORM_KC);
    }
    $stripped = (string) rxReplace(INVISIBLE_RE, '', $value);
    $hadInvisible = $stripped !== $value;

    // Drop control characters; single-line fields must never carry newlines into mail headers
    $value = $multiline
        ? rxReplace(['/\r\n?/', '/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/u'], ["\n", ''], $stripped)
        : rxReplace(['/[\r\n\t]+/', '/[\x00-\x1F\x7F]/u'], [' ', ''], $stripped);
    $value = trim(rxReplace('/[ ]{2,}/', ' ', (string) $value));

    return [mb_substr($value, 0, $max), $hadInvisible];
}

function containsLink(string $text): bool
{
    return (bool) rxMatch(LINK_RE, $text);
}

/** Mixing Latin with Cyrillic/Greek letters is a classic look-alike (homoglyph) trick. */
function hasMixedScripts(string $text): bool
{
    return rxMatch('/\p{Latin}/u', $text) && rxMatch('/[\p{Cyrillic}\p{Greek}]/u', $text);
}

/**
 * Validate an Indian or international phone number.
 * Returns ['error' => ?string, 'flag' => ?string, 'display' => string, 'tel' => string].
 */
function checkPhone(string $raw): array
{
    $out = ['error' => null, 'flag' => null, 'display' => '', 'tel' => ''];
    if ($raw === '') {
        return $out;
    }
    $invalid = 'Please enter a valid phone number, e.g. +91 98765 43210.';
    if (!rxMatch('/^\+?[0-9\s\-()]{7,20}$/', $raw)) {
        $out['error'] = $invalid;
        return $out;
    }

    $digits  = (string) rxReplace('/\D/', '', $raw);
    $hasPlus = substr($raw, 0, 1) === '+';
    $national = null;

    if ($hasPlus && substr($digits, 0, 2) === '91') {
        $national = substr($digits, 2);
    } elseif (!$hasPlus && strlen($digits) === 10) {
        $national = $digits;
    } elseif (!$hasPlus && strlen($digits) === 11 && $digits[0] === '0') {
        $national = substr($digits, 1);
    } elseif (!$hasPlus && strlen($digits) === 12 && substr($digits, 0, 2) === '91') {
        $national = substr($digits, 2);
    } elseif ($hasPlus && strlen($digits) >= 8 && strlen($digits) <= 15 && $digits[0] !== '0') {
        $out['flag']    = 'International phone number: confirm who the sender is before calling back, as some country codes charge premium rates.';
        $out['display'] = '+' . $digits;
        $out['tel']     = '+' . $digits;
        return $out;
    } else {
        $out['error'] = $invalid;
        return $out;
    }

    if (!rxMatch('/^[1-9]\d{9}$/', $national) || rxMatch('/^(\d)\1{9}$/', $national) || in_array($national, ['1234567890', '9876543210'], true)) {
        $out['error'] = $invalid;
        return $out;
    }
    // 1900: premium-rate; 140: registered telemarketing series
    if (rxMatch('/^(1900|140)/', $national)) {
        $out['error'] = 'Premium-rate and telemarketing numbers are not accepted.';
        return $out;
    }
    $out['display'] = '+91 ' . substr($national, 0, 5) . ' ' . substr($national, 5);
    $out['tel']     = '+91' . $national;
    return $out;
}

/**
 * Validate the whole submission.
 * Returns [data, errors, flags].
 */
function validateEnquiry(): array
{
    $errors = [];
    $flags  = [];

    [$name, $nameInv]       = readField('name', 100);
    [$company, $companyInv] = readField('company', 150);
    [$email, $emailInv]     = readField('email', 150);
    [$phone, $phoneInv]     = readField('phone', 20);
    [$interest]             = readField('interest', 120);
    [$message, $messageInv] = readField('message', 3000, true);
    $email = mb_strtolower($email);

    // Name: letters, spaces and . ' - only
    if ($nameInv || !rxMatch("/^[\p{L}\p{M}][\p{L}\p{M} .'\-]{1,99}$/u", $name)) {
        $errors['name'] = 'Please enter your name using letters only.';
    }

    // Organisation: letters, numbers and common punctuation; no links or emails
    if ($company === '') {
        $errors['company'] = 'Please enter your organisation.';
    } elseif ($companyInv || containsLink($company) || strpos($company, '@') !== false
        || !rxMatch("/^[\p{L}\p{M}\p{N}][\p{L}\p{M}\p{N} .,&'()\/\-]{1,149}$/u", $company)) {
        $errors['company'] = 'Please enter a valid organisation name (no links or special characters).';
    }

    // Email: valid, not ours (impersonation), not disposable, domain must accept mail
    $domain = substr((string) strrchr($email, '@'), 1);
    if ($emailInv || !filter_var($email, FILTER_VALIDATE_EMAIL) || !rxMatch('/^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/', $email)) {
        $errors['email'] = 'Please enter a valid email address.';
    } elseif (in_array($domain, OWN_DOMAINS, true) || rxMatch('/(^|\.)trove/i', $domain)) {
        $errors['email'] = 'Please use your own organisation\'s email address.';
    } elseif (in_array($domain, DISPOSABLE_DOMAINS, true)) {
        $errors['email'] = 'Disposable email addresses are not accepted.';
    } elseif (function_exists('checkdnsrr') && !checkdnsrr($domain, 'MX') && !checkdnsrr($domain, 'A')) {
        $errors['email'] = 'This email domain does not appear to accept mail.';
    }

    $phoneCheck = checkPhone($phone);
    if ($phoneInv) {
        $errors['phone'] = 'Please enter a valid phone number, e.g. +91 98765 43210.';
    } elseif ($phoneCheck['error']) {
        $errors['phone'] = $phoneCheck['error'];
    } elseif ($phoneCheck['flag']) {
        $flags[] = $phoneCheck['flag'];
    }

    if (!in_array($interest, INTERESTS, true)) {
        $interest = 'Not sure yet';
    }

    // Message
    $linkCount = rxCount(LINK_RE, $message, $links);
    if (mb_strlen($message) < 10) {
        $errors['message'] = 'Please tell us a little more (at least 10 characters).';
    } elseif (rxMatch('/<\s*\/?\s*[a-z!][^>]*>/i', $message) || rxMatch('/\[(url|link|img)\b/i', $message)) {
        $errors['message'] = 'Please remove HTML or formatting code from your message.';
    } elseif ($linkCount > 2) {
        $errors['message'] = 'Please include no more than 2 links.';
    } else {
        foreach ($links[0] as $link) {
            $host = mb_strtolower((string) rxReplace('~^(?:https?://)?(?:www\.)?([^/:?#]+).*$~i', '$1', $link));
            if (in_array($host, URL_SHORTENERS, true)) {
                $errors['message'] = 'Shortened links (bit.ly etc.) are not accepted. Please share the full address.';
                break;
            }
            if (rxMatch('/^\d{1,3}(\.\d{1,3}){3}$/', $host)) {
                $errors['message'] = 'Links to bare IP addresses are not accepted.';
                break;
            }
        }
    }

    // Flags: delivered, but staff are warned
    if ($linkCount > 0) {
        $flags[] = 'Message contains ' . $linkCount . ' link(s): links are disabled below. Check the address carefully before visiting.';
    }
    if (rxMatch('/(?:\+?\d[\s\-().]?){9,}/', $message)) {
        $flags[] = 'Message contains a phone number: verify it belongs to the sender before calling.';
    }
    $lower = mb_strtolower($message . ' ' . $company);
    $hits = array_values(array_filter(SUSPICIOUS_PHRASES, function ($p) use ($lower) {
        return rxMatch('/\b' . preg_quote($p, '/') . '\b/u', $lower);
    }));
    if ($hits) {
        $flags[] = 'Contains phrases common in phishing/spam: "' . implode('", "', array_slice($hits, 0, 5)) . '".';
    }
    if (rxMatch('/\btrove\b/i', $name . ' ' . $company)) {
        $flags[] = 'Sender name/organisation mentions "Trove": possible impersonation of our own team.';
    }
    if (hasMixedScripts($name . ' ' . $company . ' ' . $message)) {
        $flags[] = 'Mixes Latin with Cyrillic/Greek look-alike letters: a common disguise in phishing.';
    }
    if ($messageInv) {
        $flags[] = 'Hidden (invisible) characters were removed from the message.';
    }

    $data = [
        'name'      => $name,
        'company'   => $company,
        'email'     => $email,
        'phone'     => $phoneCheck['display'],
        'phone_tel' => $phoneCheck['tel'],
        'interest'  => $interest,
        'message'   => $message,
    ];

    return [$data, $errors, $flags];
}

/** Make links non-clickable for display (mail clients auto-link plain URLs). */
function defangLinks(string $text): string
{
    return (string) rxReplaceCallback(LINK_RE, function ($m) {
        return str_ireplace(['https://', 'http://', '.'], ['hxxps://', 'hxxp://', '[.]'], $m[0]);
    }, $text);
}
