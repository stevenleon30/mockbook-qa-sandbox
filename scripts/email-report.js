#!/usr/bin/env node
/**
 * Email a summary of the last Playwright run.
 * Reads test-results/results.json (json reporter output).
 * Usage: node scripts/email-report.js
 */
const fs = require('fs');
const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

const resultsPath = 'test-results/results.json';
if (!fs.existsSync(resultsPath)) {
  console.error('No results.json found. Run `npm test` first.');
  process.exit(1);
}

const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));

let passed = 0, failed = 0, skipped = 0, flaky = 0;
const failures = [];

function walk(suite) {
  for (const s of suite.suites || []) walk(s);
  for (const spec of suite.specs || []) {
    for (const t of spec.tests || []) {
      for (const r of t.results || []) {
        if (r.status === 'passed') passed++;
        else if (r.status === 'failed' || r.status === 'timedOut') {
          failed++;
          failures.push({ title: spec.title, file: spec.file, error: r.error?.message?.slice(0, 200) });
        }
        else if (r.status === 'skipped') skipped++;
        if (t.status === 'flaky') flaky++;
      }
    }
  }
}
for (const s of results.suites || []) walk(s);

const total = passed + failed + skipped;
const passRate = total ? ((passed / total) * 100).toFixed(1) : 0;
const status = failed === 0 ? '✅ PASS' : '❌ FAIL';

const html = `
<h2>${status} — MockBook test run</h2>
<table cellpadding="6" style="border-collapse:collapse">
  <tr><td><b>Total</b></td><td>${total}</td></tr>
  <tr><td>Passed</td><td style="color:green">${passed}</td></tr>
  <tr><td>Failed</td><td style="color:red">${failed}</td></tr>
  <tr><td>Skipped</td><td>${skipped}</td></tr>
  <tr><td>Flaky</td><td>${flaky}</td></tr>
  <tr><td>Pass rate</td><td>${passRate}%</td></tr>
</table>
${failures.length ? `<h3>Failures</h3><ul>${failures.map(f => `<li><b>${f.title}</b> (${f.file})<br><code>${f.error}</code></li>`).join('')}</ul>` : ''}
<p>Full HTML report: run <code>npx playwright show-report</code></p>
`;

(async () => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: process.env.REPORT_TO,
    subject: `${status} MockBook: ${passed}/${total} passed`,
    html,
  });
  console.log('Report sent to', process.env.REPORT_TO);
})().catch(e => { console.error(e); process.exit(1); });
