#!/usr/bin/env node
/**
 * Analyze a failed Playwright test trace using Claude.
 * Usage: node scripts/analyze-trace.js test-results/<testname>/error-context.md
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const tracePath = process.argv[2];
if (!tracePath) {
  console.error('Usage: node scripts/analyze-trace.js <path-to-error-context.md>');
  process.exit(1);
}

const traceText = fs.readFileSync(tracePath, 'utf-8');

async function analyze() {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: `You are a QA engineer analyzing a Playwright trace. Return exactly:

1. Most likely root cause (1 sentence)
2. Second most likely cause (1 sentence)
3. Three log sources or DB tables to check (bulleted)

Do not speculate beyond what the trace shows.

TRACE:
${traceText.slice(0, 8000)}`,
      }],
    }),
  });
  const data = await res.json();
  const text = data.content?.[0]?.text || JSON.stringify(data);
  console.log('\n=== Claude trace analysis ===\n');
  console.log(text);
  console.log('\n=============================\n');
}

analyze().catch(e => { console.error(e); process.exit(1); });
