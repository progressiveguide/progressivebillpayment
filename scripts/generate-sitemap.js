#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CONFIG_PATH = path.join(ROOT, 'config', 'seo-config.json');
const OUTPUT_PATH = path.join(ROOT, 'sitemap.xml');

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch (err) {
    console.error('[generate-sitemap] ERROR: Could not read config/seo-config.json:', err.message);
    process.exit(1);
  }
}

function toYMD(d) {
  return d.toISOString().slice(0, 10);
}

function buildSitemap(config, dateStr) {
  const base = (config.baseUrl || '').replace(/\/$/, '');
  const paths = config.paths || ['/'];

  const urls = paths.map(p => {
    const isHome = p === '/';
    const loc = isHome ? `${base}/` : `${base}${p}`;
    const priority = isHome ? '1.0' : '0.8';
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${dateStr}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

function main() {
  console.log('[generate-sitemap] Generating sitemap.xml...');
  const config = loadConfig();
  const dateStr = toYMD(new Date());
  const xml = buildSitemap(config, dateStr);
  fs.writeFileSync(OUTPUT_PATH, xml, 'utf8');
  console.log(`[generate-sitemap] Wrote sitemap.xml (lastmod: ${dateStr})`);
  console.log('[generate-sitemap] Done.');
}

main();
