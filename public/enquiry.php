<?php
/**
 * Enquiry form handler for the Trove P&P website.
 *
 *   GET  enquiry.php?action=token  -> { token }  signed form token (fetched when the form loads)
 *   POST enquiry.php               -> { ok: true } | { ok: false, error, fields? }
 *
 * Validates the enquiry (see enquiry-validate.php) and emails a branded HTML
 * message (plus plain-text alternative) to TO_EMAIL using PHP mail().
 * The form can only ever email TO_EMAIL; it never sends anything to the
 * address a visitor types in, so it cannot be used to send phishing mail to others.
 *
 * Requires PHP 7.4+ and a host with mail() configured (standard on cPanel).
 */
declare(strict_types=1);

define('TROVE_ENQUIRY', true);

// ---- Configuration ---------------------------------------------------------
const TO_EMAIL      = 'reachus@trovepp.in';
const FROM_EMAIL    = 'info@trovepp.in';    // must be a trovepp.in mailbox so SPF/DKIM pass
const FROM_NAME     = 'Trove P&P Website';
const SITE_URL      = 'https://trovepp.in'; // used for the logo inside the email
const ALLOWED_HOSTS = ['trovepp.in', 'www.trovepp.in', 'localhost', '127.0.0.1'];

// TOKEN_SECRET lives in enquiry-secret.php (not in git). To create it, copy that file's
// layout and set a random value, e.g. from: php -r "echo bin2hex(random_bytes(32));"
require __DIR__ . '/enquiry-secret.php';
const TOKEN_MIN_AGE = 3;      // seconds: faster than a person can fill the form
const TOKEN_MAX_AGE = 7200;   // seconds: form left open longer must be reloaded

const LIMIT_PER_IP     = 5;   // enquiries per IP per hour
const LIMIT_PER_EMAIL  = 3;   // enquiries per sender email per day
const LIMIT_GLOBAL_DAY = 50;  // enquiries site-wide per day (flood protection)
// -----------------------------------------------------------------------------

// Never print warnings or stack traces to visitors (they reveal server paths); log them instead
ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex');
header('Cache-Control: no-store');

function respond(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

// Any unexpected failure: log the detail, show the visitor a generic message
set_exception_handler(function (Throwable $e) {
    error_log('[trove-enquiry] ' . get_class($e) . ': ' . $e->getMessage() . ' @ ' . basename($e->getFile()) . ':' . $e->getLine());
    respond(500, ['ok' => false, 'error' => 'Sorry, your enquiry could not be sent right now.']);
});

if (!extension_loaded('mbstring')) {
    throw new RuntimeException('PHP mbstring extension is required');
}

require __DIR__ . '/enquiry-validate.php';
require __DIR__ . '/enquiry-template.php';

function makeToken(): string
{
    $payload = time() . '.' . bin2hex(random_bytes(8));
    return $payload . '.' . hash_hmac('sha256', $payload, TOKEN_SECRET);
}

/** Returns an error message, or null when the token is valid. */
function tokenError(string $token): ?string
{
    $parts = explode('.', $token);
    if (count($parts) !== 3 || !hash_equals(hash_hmac('sha256', $parts[0] . '.' . $parts[1], TOKEN_SECRET), $parts[2])) {
        return 'Your form session is invalid. Please reload the page and try again.';
    }
    $age = time() - (int) $parts[0];
    if ($age < TOKEN_MIN_AGE) {
        return 'That was quick! Please take a moment to review your enquiry, then send it again.';
    }
    if ($age > TOKEN_MAX_AGE) {
        return 'This form has expired. Please reload the page and try again.';
    }
    return null;
}

/**
 * Sliding-window counter stored in the temp dir. Returns true when over the limit.
 * The file stays locked from read to write so parallel requests cannot both slip under the limit.
 */
function overLimit(string $key, int $limit, int $window): bool
{
    $file = sys_get_temp_dir() . '/trove_enquiry_' . hash('sha256', $key) . '.json';
    $fh = @fopen($file, 'c+');
    if ($fh === false || !flock($fh, LOCK_EX)) {
        throw new RuntimeException('Rate-limit store unavailable');
    }
    try {
        $now  = time();
        $hits = json_decode((string) stream_get_contents($fh), true);
        $hits = array_values(array_filter(is_array($hits) ? $hits : [], function ($t) use ($now, $window) {
            return is_int($t) && $t > $now - $window;
        }));
        if (count($hits) >= $limit) {
            return true;
        }
        $hits[] = $now;
        ftruncate($fh, 0);
        rewind($fh);
        fwrite($fh, (string) json_encode($hits));
        fflush($fh);
        return false;
    } finally {
        flock($fh, LOCK_UN);
        fclose($fh);
    }
}

function encodeHeader(string $text): string
{
    return '=?UTF-8?B?' . base64_encode($text) . '?=';
}

// ---- Request checks ----------------------------------------------------------

// Browsers always send Origin on cross-site POSTs: refuse submissions from other websites
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '') {
    $originHost = (string) parse_url($origin, PHP_URL_HOST);
    $ownHost    = (string) parse_url('//' . ($_SERVER['HTTP_HOST'] ?? ''), PHP_URL_HOST);
    if (!in_array($originHost, ALLOWED_HOSTS, true) && $originHost !== $ownHost) {
        respond(403, ['ok' => false, 'error' => 'Submissions are only accepted from the Trove P&P website.']);
    }
}

$method = $_SERVER['REQUEST_METHOD'] ?? '';
if ($method === 'GET' && ($_GET['action'] ?? '') === 'token') {
    respond(200, ['ok' => true, 'token' => makeToken()]);
}
if ($method !== 'POST') {
    header('Allow: GET, POST');
    respond(405, ['ok' => false, 'error' => 'Method not allowed.']);
}
// Backstop for hosts that ignore LimitRequestBody in .htaccess
if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 65536) {
    respond(413, ['ok' => false, 'error' => 'Your enquiry is too large.']);
}

// Honeypot filled in: pretend success so bots learn nothing
$honeypot = $_POST['website'] ?? '';
if (!is_string($honeypot) || trim($honeypot) !== '') {
    respond(200, ['ok' => true]);
}

$token = $_POST['token'] ?? '';
$tokenError = tokenError(is_string($token) ? $token : '');
if ($tokenError !== null) {
    respond(400, ['ok' => false, 'error' => $tokenError]);
}

// ---- Validation ----------------------------------------------------------------

try {
    [$data, $errors, $flags] = validateEnquiry();
} catch (RuntimeException $e) {
    // Regex engine gave up on hostile input: fail closed
    respond(422, ['ok' => false, 'error' => 'Your message could not be processed. Please simplify it and try again.']);
}
if ($errors) {
    respond(422, ['ok' => false, 'error' => 'Please correct the highlighted fields.', 'fields' => $errors]);
}

$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
if (overLimit('ip:' . $ip, LIMIT_PER_IP, 3600)
    || overLimit('email:' . $data['email'], LIMIT_PER_EMAIL, 86400)
    || overLimit('global', LIMIT_GLOBAL_DAY, 86400)) {
    respond(429, ['ok' => false, 'error' => 'We have received several enquiries from you already. Please try again later.']);
}

// ---- Send --------------------------------------------------------------------

date_default_timezone_set('Asia/Kolkata');
$data['submitted'] = date('d M Y, h:i A') . ' IST';

[$html, $text] = renderEnquiryEmail($data, $flags, SITE_URL);

$subject  = ($flags ? '[Review] ' : '') . 'New enquiry: ' . $data['name'] . ' (' . $data['company'] . ')';
$boundary = 'trove_' . bin2hex(random_bytes(12));
$eol      = "\r\n";

$headers = implode($eol, [
    'MIME-Version: 1.0',
    'Content-Type: multipart/alternative; boundary="' . $boundary . '"',
    'From: ' . encodeHeader(FROM_NAME) . ' <' . FROM_EMAIL . '>',
    'Reply-To: ' . encodeHeader($data['name']) . ' <' . $data['email'] . '>',
    'X-Trove-Enquiry: ' . ($flags ? 'review' : 'clean'),
]);

$body = '--' . $boundary . $eol
    . 'Content-Type: text/plain; charset=UTF-8' . $eol
    . 'Content-Transfer-Encoding: base64' . $eol . $eol
    . chunk_split(base64_encode($text)) . $eol
    . '--' . $boundary . $eol
    . 'Content-Type: text/html; charset=UTF-8' . $eol
    . 'Content-Transfer-Encoding: base64' . $eol . $eol
    . chunk_split(base64_encode($html)) . $eol
    . '--' . $boundary . '--';

// The -f envelope sender improves deliverability; some hosts reject it, so retry without.
$sent = @mail(TO_EMAIL, encodeHeader($subject), $body, $headers, '-f' . FROM_EMAIL)
    || @mail(TO_EMAIL, encodeHeader($subject), $body, $headers);

if (!$sent) {
    respond(500, ['ok' => false, 'error' => 'Sorry, your enquiry could not be sent right now.']);
}

respond(200, ['ok' => true]);
