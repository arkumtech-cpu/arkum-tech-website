<?php
/* ============================================================
   ARKUM TECH — CONTACT FORM HANDLER (cPanel / PHP)
   ------------------------------------------------------------
   Receives the quote form (JSON) from js/contact.js, validates it,
   emails it to RECIPIENT, and keeps a backup copy in a log file
   ABOVE public_html so no lead is ever lost.

   TO CHANGE THE RECEIVING EMAIL: edit $RECIPIENT below.
   FROM address must be an address on your own domain (cPanel rule).
   ============================================================ */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

$RECIPIENT = 'info@arkumtech.com';
$FROM      = 'no-reply@arkumtech.com';
$SITE      = 'Arkum Tech';

function out($ok, $msg, $code = 200) { http_response_code($code); echo json_encode(['ok' => $ok, 'message' => $msg]); exit; }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') out(false, 'Method not allowed', 405);

$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) $data = $_POST;

// Honeypot: real users never fill this hidden field
if (!empty($data['company_website'])) out(true, 'OK');

function clean($v, $max) {
  $v = is_string($v) ? trim($v) : '';
  $v = str_replace(["\r", "\0"], '', $v);
  return mb_substr($v, 0, $max);
}
function oneline($v) { return preg_replace('/[\r\n]+/', ' ', $v); } // header-injection guard

$name    = oneline(clean($data['name']    ?? '', 100));
$email   = oneline(clean($data['email']   ?? '', 150));
$phone   = oneline(clean($data['phone']   ?? '', 40));
$service = oneline(clean($data['service'] ?? '', 100));
$message = clean($data['message'] ?? '', 4000);

if (mb_strlen($name) < 2)                      out(false, 'Please enter your name.', 422);
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) out(false, 'Please enter a valid email.', 422);
if ($service === '')                           out(false, 'Please choose a service.', 422);
if (mb_strlen($message) < 10)                  out(false, 'Please describe your request.', 422);

// Basic rate limit: 1 message / 30s per IP
$ip   = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$lock = sys_get_temp_dir() . '/arkum_rl_' . md5($ip);
if (file_exists($lock) && (time() - filemtime($lock)) < 30) out(false, 'Please wait a moment before sending again.', 429);
@touch($lock);

$subject = "[Quote Request] $service — $name";
$body = "New request from the website\n"
      . "------------------------------\n"
      . "Name:    $name\nEmail:   $email\nPhone:   " . ($phone ?: 'Not provided') . "\nService: $service\n\n"
      . "Message:\n$message\n\n"
      . "------------------------------\nIP: $ip  |  " . date('Y-m-d H:i:s') . "\n";

// Backup log (one level above public_html)
$logFile = dirname(__DIR__) . '/arkum_leads.log';
@file_put_contents($logFile, "=== " . date('c') . " ===\n" . $body . "\n", FILE_APPEND | LOCK_EX);

$headers  = "From: $SITE <$FROM>\r\n";
$headers .= "Reply-To: $name <$email>\r\n";
$headers .= "MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\n";
$encSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';

$sent = @mail($RECIPIENT, $encSubject, $body, $headers, '-f' . $FROM);
if (!$sent) {
  // Logged already; tell the browser so it can fall back to mailto
  out(false, 'Mail server did not accept the message.', 500);
}
out(true, 'Thank you. We have received your message.');
