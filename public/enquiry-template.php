<?php
/**
 * Branded email template for website enquiries. Included by enquiry.php.
 * Email clients need table layouts and inline styles, hence the markup below.
 */
declare(strict_types=1);

if (!defined('TROVE_ENQUIRY')) {
    http_response_code(404);
    exit;
}

/**
 * @param array<string,string> $d     Validated enquiry fields plus 'submitted'.
 * @param string[]             $flags Reasons this enquiry needs a closer look (may be empty).
 * @return array{0:string,1:string} [html, plainText]
 */
function renderEnquiryEmail(array $d, array $flags, string $siteUrl): array
{
    // Links in visitor-supplied text are never clickable in our inbox
    $d['message'] = defangLinks($d['message']);

    $e = function (string $v): string {
        return htmlspecialchars($v, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    };

    $green = '#265A40';
    $sand  = '#D9B37E';
    $gold  = '#B8925A';
    $mint  = '#E8EFEA';

    $rows = [
        'Name'           => $e($d['name']),
        'Organisation'   => $e($d['company']),
        'Email'          => '<a href="mailto:' . $e($d['email']) . '" style="color:' . $green . ';">' . $e($d['email']) . '</a>',
        'Phone'          => $d['phone'] === ''
            ? '<span style="color:#94a3b8;">Not provided</span>'
            : ($flags
                ? $e($d['phone']) // no tap-to-call on flagged enquiries
                : '<a href="tel:' . $e($d['phone_tel']) . '" style="color:' . $green . ';">' . $e($d['phone']) . '</a>'),
        'Interested in'  => $e($d['interest']),
        'Submitted'      => $e($d['submitted']),
    ];

    $rowHtml = '';
    $i = 0;
    foreach ($rows as $label => $value) {
        $bg = $i++ % 2 === 0 ? $mint : '#ffffff';
        $rowHtml .= '<tr>'
            . '<td style="padding:12px 16px;background:' . $bg . ';font-weight:bold;color:' . $green . ';width:150px;vertical-align:top;">' . $label . '</td>'
            . '<td style="padding:12px 16px;background:' . $bg . ';color:#334155;vertical-align:top;">' . $value . '</td>'
            . '</tr>';
    }

    $warning = '';
    if ($flags) {
        $items = '';
        foreach ($flags as $flag) {
            $items .= '<li style="margin:0 0 4px;">' . $e($flag) . '</li>';
        }
        $warning = '<tr><td style="padding:24px 32px 0;">'
            . '<div style="padding:16px 20px;background:#FEF3C7;border:1px solid #F59E0B;border-radius:8px;color:#78350F;font-size:14px;line-height:1.5;">'
            . '<p style="margin:0 0 8px;font-weight:bold;">&#9888; Review before responding</p>'
            . '<ul style="margin:0 0 8px;padding-left:18px;">' . $items . '</ul>'
            . '<p style="margin:0;">Do not click links, open attachments, share passwords/OTPs or make payments based on this enquiry. '
            . 'Confirm the sender independently before calling back.</p>'
            . '</div></td></tr>';
    }

    $message = nl2br($e($d['message']));
    $logo    = $e(rtrim($siteUrl, '/') . '/logo.png');
    $year    = date('Y');

    $html = <<<HTML
<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>New website enquiry</title></head>
<body style="margin:0;padding:0;background:#f4f4f0;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f0;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">
        <tr><td style="padding:24px 32px;background:#ffffff;">
          <img src="{$logo}" alt="Trove P&amp;P" width="180" style="display:block;border:0;height:auto;">
        </td></tr>
        <tr><td style="padding:24px 32px;background:{$green};border-bottom:5px solid {$sand};">
          <p style="margin:0 0 4px;font-size:12px;letter-spacing:1px;text-transform:uppercase;font-weight:bold;color:{$sand};">EffHR &middot; Website enquiry</p>
          <h1 style="margin:0;font-size:24px;color:#ffffff;">New enquiry from {$rows['Name']}</h1>
        </td></tr>
        {$warning}
        <tr><td style="padding:28px 32px 8px;">
          <p style="margin:0 0 12px;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;color:{$green};">Contact details</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;border-radius:8px;overflow:hidden;">
            {$rowHtml}
          </table>
        </td></tr>
        <tr><td style="padding:20px 32px 8px;">
          <p style="margin:0 0 12px;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;color:{$green};">Message</p>
          <div style="padding:16px 20px;background:#FAF3E7;border-left:5px solid {$sand};font-size:14px;line-height:1.6;color:#334155;">{$message}</div>
        </td></tr>
        <tr><td style="padding:20px 32px 28px;">
          <p style="margin:0;font-size:13px;color:#64748b;">Reply to this email to respond to {$rows['Name']} directly.</p>
        </td></tr>
        <tr><td style="padding:16px 32px;background:{$green};text-align:center;font-size:12px;color:{$sand};">
          <strong>Beyond Limits. Building Future.</strong><br>
          <span style="color:#ffffff;opacity:.75;">&copy; {$year} Trove P&amp;P &middot; Coimbatore</span>
        </td></tr>
        <tr><td style="height:6px;background:{$gold};font-size:0;line-height:0;">&nbsp;</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
HTML;

    $textWarning = $flags
        ? "!! REVIEW BEFORE RESPONDING !!\n- " . implode("\n- ", $flags)
            . "\nDo not click links, share passwords/OTPs or make payments. Verify the sender before calling back.\n\n"
        : '';

    $text = "New website enquiry: Trove P&P\n"
        . str_repeat('=', 34) . "\n\n"
        . $textWarning
        . "Name:          {$d['name']}\n"
        . "Organisation:  {$d['company']}\n"
        . "Email:         {$d['email']}\n"
        . 'Phone:         ' . ($d['phone'] !== '' ? $d['phone'] : 'Not provided') . "\n"
        . "Interested in: {$d['interest']}\n"
        . "Submitted:     {$d['submitted']}\n\n"
        . "Message:\n{$d['message']}\n\n"
        . "Reply to this email to respond directly.\n";

    return [$html, $text];
}
