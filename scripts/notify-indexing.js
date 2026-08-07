#!/usr/bin/env node
'use strict';

const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const CONFIG_PATH = path.join(ROOT, 'config', 'seo-config.json');

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch (err) {
    console.error('[notify-indexing] ERROR: Could not read config/seo-config.json:', err.message);
    process.exit(1);
  }
}

function fetchUrl(urlStr, method, body, timeout) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const lib = u.protocol === 'https:' ? https : http;
    const opts = {
      hostname: u.hostname,
      port: u.port || (u.protocol === 'https:' ? 443 : 80),
      path: u.pathname + u.search,
      method: method,
      timeout: timeout,
      headers: body ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } : {}
    };
    const req = lib.request(opts, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')); });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function pingUrl(urlStr) {
  try {
    const result = await fetchUrl(urlStr, 'GET', null, 5000);
    console.log(`[notify-indexing] Pinged ${urlStr} -> HTTP ${result.status}`);
  } catch (err) {
    console.warn(`[notify-indexing] WARN: Failed to ping ${urlStr}: ${err.message}`);
  }
}

async function sendWebhook(endpoint) {
  try {
    const body = JSON.stringify({ event: 'seo-freshness-update', timestamp: new Date().toISOString() });
    const result = await fetchUrl(endpoint, 'POST', body, 5000);
    console.log(`[notify-indexing] Webhook ${endpoint} -> HTTP ${result.status}`);
  } catch (err) {
    console.warn(`[notify-indexing] WARN: Webhook failed for ${endpoint}: ${err.message}`);
  }
}

async function main() {
  console.log('[notify-indexing] Starting indexing notifications...');
  const config = loadConfig();
  const indexing = config.indexing || {};

  const pingUrls = indexing.pingUrls || [];
  const webhooks = indexing.webhookEndpoints || [];

  for (const url of pingUrls) {
    await pingUrl(url);
  }

  for (const endpoint of webhooks) {
    await sendWebhook(endpoint);
  }

  console.log('[notify-indexing] Done.');
}

main().catch(err => {
  console.error('[notify-indexing] Unexpected error:', err.message);
  process.exit(1);
});
