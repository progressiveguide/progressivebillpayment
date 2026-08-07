#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CONFIG_PATH = path.join(ROOT, 'config', 'seo-config.json');
const STATE_PATH = path.join(ROOT, '.seo-state.json');

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch (err) {
    console.error('[rotate-content] ERROR: Could not read config/seo-config.json:', err.message);
    process.exit(1);
  }
}

function loadState(config) {
  try {
    if (fs.existsSync(STATE_PATH)) {
      return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
    }
  } catch (err) {
    console.warn('[rotate-content] WARN: Could not parse .seo-state.json, using defaults:', err.message);
  }
  const eng = config.engagement || {};
  return {
    viewCount: eng.baseViews || 4800,
    reviewCount: eng.baseReviews || 312,
    lastEngagementHour: new Date().toISOString(),
    introIndex: 0,
    ctaIndex: 0,
    imageIndex: 0
  };
}

function saveState(state) {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
}

function rotate(arr, index) {
  if (!arr || arr.length === 0) return { value: '', nextIndex: 0 };
  const i = index % arr.length;
  return { value: arr[i], nextIndex: (i + 1) % arr.length };
}

function injectMarker(html, marker, content) {
  const open = `<!-- DYNAMIC:${marker} -->`;
  const close = `<!-- /DYNAMIC:${marker} -->`;
  const re = new RegExp(`${open}[\\s\\S]*?${close}`, 'g');
  if (!html.includes(open)) return html;
  return html.replace(re, `${open}\n${content}\n${close}`);
}

function formatDate(d) {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function processPage(filePath, config, state) {
  let html = fs.readFileSync(filePath, 'utf8');
  const opts = config.contentOptions || {};
  const now = new Date();

  // Intro
  const intro = rotate(opts.introVariants || [], state.introIndex);
  html = injectMarker(html, 'INTRO', `<p>${intro.value}</p>`);
  state.introIndex = intro.nextIndex;

  // CTA
  const cta = rotate(opts.ctaVariants || [], state.ctaIndex);
  const ctaLink = config.baseUrl ? `${config.baseUrl}/` : '#';
  html = injectMarker(html, 'CTA', `<a href="${ctaLink}" class="cta-btn">${cta.value}</a>`);
  state.ctaIndex = cta.nextIndex;

  // Lead image
  const img = rotate(config.imagePool || [], state.imageIndex);
  html = injectMarker(html, 'LEAD-IMAGE', `<img src="${img.value}" alt="Progressive bill pay guide" style="max-width:100%;border-radius:8px;" />`);
  state.imageIndex = img.nextIndex;

  // Last verified
  const dateStr = formatDate(now);
  html = injectMarker(html, 'LAST-VERIFIED',
    `<small>Last Reviewed: <strong>${dateStr}</strong> • Last Updated: <strong>${dateStr}</strong></small>`);

  // Engagement
  const eng = config.engagement || {};
  const min = eng.viewIncrementMin || 3;
  const max = eng.viewIncrementMax || 17;
  const increment = Math.floor(Math.random() * (max - min + 1)) + min;
  state.viewCount = (state.viewCount || 0) + increment;
  state.lastEngagementHour = now.toISOString();
  const rating = eng.rating || '4.8';
  html = injectMarker(html, 'ENGAGEMENT',
    `<span>${state.viewCount.toLocaleString()} helpful views | ⭐ ${rating} (${state.reviewCount} reviews)</span>`);

  return html;
}

function main() {
  console.log('[rotate-content] Starting content rotation...');
  const config = loadConfig();
  const state = loadState(config);

  const pages = config.htmlPages || [];
  if (pages.length === 0) {
    console.log('[rotate-content] No HTML pages configured.');
  }

  for (const page of pages) {
    const filePath = path.join(ROOT, page);
    if (!fs.existsSync(filePath)) {
      console.warn(`[rotate-content] WARN: Page not found: ${page}`);
      continue;
    }
    try {
      const updated = processPage(filePath, config, state);
      fs.writeFileSync(filePath, updated, 'utf8');
      console.log(`[rotate-content] Updated ${page}`);
    } catch (err) {
      console.error(`[rotate-content] ERROR processing ${page}:`, err.message);
    }
  }

  saveState(state);
  console.log('[rotate-content] State saved to .seo-state.json');
  console.log('[rotate-content] Done.');
}

main();
