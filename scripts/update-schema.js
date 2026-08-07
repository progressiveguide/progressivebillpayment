#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CONFIG_PATH = path.join(ROOT, 'config', 'seo-config.json');

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch (err) {
    console.error('[update-schema] ERROR: Could not read config/seo-config.json:', err.message);
    process.exit(1);
  }
}

function updateJsonLdBlock(jsonStr, now) {
  let obj;
  try {
    obj = JSON.parse(jsonStr);
  } catch (err) {
    console.warn('[update-schema] WARN: Skipping malformed JSON-LD block:', err.message);
    return null;
  }

  function updateDates(o) {
    if (Array.isArray(o)) {
      o.forEach(updateDates);
    } else if (o && typeof o === 'object') {
      if ('dateModified' in o) o.dateModified = now;
      if ('lastReviewed' in o) o.lastReviewed = now;
      Object.values(o).forEach(updateDates);
    }
  }

  updateDates(obj);
  return JSON.stringify(obj, null, 2);
}

function processPage(filePath, nowIso) {
  let html = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Match all <script type="application/ld+json">...</script> blocks
  const re = /(<script\s+type="application\/ld\+json"\s*>)([\s\S]*?)(<\/script>)/gi;
  const updated = html.replace(re, (match, open, jsonContent, close) => {
    const newJson = updateJsonLdBlock(jsonContent, nowIso);
    if (newJson === null) return match; // skip malformed
    changed = true;
    return `${open}\n${newJson}\n${close}`;
  });

  if (changed) {
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log(`[update-schema] Updated JSON-LD timestamps in ${path.basename(filePath)}`);
  } else {
    console.log(`[update-schema] No JSON-LD blocks found in ${path.basename(filePath)}`);
  }
}

function main() {
  console.log('[update-schema] Starting schema timestamp update...');
  const config = loadConfig();
  const nowIso = new Date().toISOString();

  const pages = config.htmlPages || [];
  if (pages.length === 0) {
    console.log('[update-schema] No HTML pages configured.');
  }

  for (const page of pages) {
    const filePath = path.join(ROOT, page);
    if (!fs.existsSync(filePath)) {
      console.warn(`[update-schema] WARN: Page not found: ${page}`);
      continue;
    }
    try {
      processPage(filePath, nowIso);
    } catch (err) {
      console.error(`[update-schema] ERROR processing ${page}:`, err.message);
    }
  }

  console.log('[update-schema] Done.');
}

main();
