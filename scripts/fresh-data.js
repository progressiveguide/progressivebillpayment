#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CONFIG_PATH = path.join(ROOT, 'config', 'seo-config.json');
const OUTPUT_PATH = path.join(ROOT, 'data', 'fresh-data.json');

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch (err) {
    console.error('[fresh-data] ERROR: Could not read config/seo-config.json:', err.message);
    process.exit(1);
  }
}

function pickN(arr, n) {
  const shuffled = arr.slice().sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, shuffled.length));
}

function buildFreshData(config) {
  const now = new Date();
  const terms = pickN(config.trendingSearchTerms || [], 6);
  const headlines = pickN(config.newsHeadlines || [], 5);

  return {
    generatedAt: now.toISOString(),
    trendingSearches: terms,
    newsHeadlines: headlines,
    siteName: config.siteName || '',
    baseUrl: config.baseUrl || ''
  };
}

function buildRelatedSearchesHtml(terms) {
  const items = terms.map(t => `  <li><a href="https://www.google.com/search?q=${encodeURIComponent(t)}" rel="nofollow noopener" target="_blank">${t}</a></li>`).join('\n');
  return `<ul class="related-searches-list">\n${items}\n</ul>`;
}

function buildNewsTickerHtml(headlines) {
  const items = headlines.map(h => `  <li>${h}</li>`).join('\n');
  return `<ul class="news-ticker-list">\n${items}\n</ul>`;
}

function injectMarker(html, marker, content) {
  const open = `<!-- DYNAMIC:${marker} -->`;
  const close = `<!-- /DYNAMIC:${marker} -->`;
  const re = new RegExp(`${open}[\\s\\S]*?${close}`, 'g');
  const replacement = `${open}\n${content}\n${close}`;
  if (html.includes(open)) {
    return html.replace(re, replacement);
  }
  // marker not found – skip silently
  return html;
}

function processHtmlPages(config, freshData) {
  const pages = config.htmlPages || [];
  if (pages.length === 0) {
    console.log('[fresh-data] No HTML pages configured.');
    return;
  }

  const relatedHtml = buildRelatedSearchesHtml(freshData.trendingSearches);
  const tickerHtml = buildNewsTickerHtml(freshData.newsHeadlines);

  for (const page of pages) {
    const filePath = path.join(ROOT, page);
    if (!fs.existsSync(filePath)) {
      console.warn(`[fresh-data] WARN: HTML page not found: ${page}`);
      continue;
    }
    try {
      let html = fs.readFileSync(filePath, 'utf8');
      html = injectMarker(html, 'RELATED-SEARCHES', relatedHtml);
      html = injectMarker(html, 'NEWS-TICKER', tickerHtml);
      fs.writeFileSync(filePath, html, 'utf8');
      console.log(`[fresh-data] Updated markers in ${page}`);
    } catch (err) {
      console.error(`[fresh-data] ERROR processing ${page}:`, err.message);
    }
  }
}

function main() {
  console.log('[fresh-data] Starting fresh data generation...');
  const config = loadConfig();

  const freshData = buildFreshData(config);

  // Ensure data/ directory exists
  const dataDir = path.join(ROOT, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(freshData, null, 2), 'utf8');
  console.log(`[fresh-data] Wrote ${OUTPUT_PATH}`);

  processHtmlPages(config, freshData);
  console.log('[fresh-data] Done.');
}

main();
