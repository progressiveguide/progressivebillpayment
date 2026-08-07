# Progressive Bill Pay Guide

Independent informational guide to Progressive Insurance bill payment methods, billing cycles, and account management options.

**Website:** https://progressiveguide.github.io/progressivebillpayment/

**Last Updated:** August 7, 2026

---

## Purpose

This repository hosts resources to help users understand:

- Online bill payment guidance
- Guest (no-login) payment options
- Automatic payment enrollment
- Billing schedules and due dates
- Payment processing timelines

---

## Automated SEO Freshness System

This repository runs an hourly automated SEO freshness workflow that rotates dynamic content, refreshes structured data timestamps, regenerates the sitemap, and notifies search engine indexing endpoints.

### How It Works

A GitHub Actions workflow (`.github/workflows/seo-battle.yml`) triggers every hour and runs all 5 scripts in sequence. Changes are committed only when files actually change.

### Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `scripts/fresh-data.js` | `npm run fresh-data` | Reads `config/seo-config.json` and injects trending searches and news headlines into HTML pages. Writes `data/fresh-data.json`. |
| `scripts/rotate-content.js` | `npm run rotate-content` | Rotates intro/CTA text variants, lead image, last-reviewed date, and increments engagement counters. Persists state in `.seo-state.json`. |
| `scripts/update-schema.js` | `npm run update-schema` | Updates `dateModified` and `lastReviewed` in all JSON-LD blocks across HTML pages. |
| `scripts/generate-sitemap.js` | `npm run generate-sitemap` | Regenerates `sitemap.xml` with today's date and correct priorities. |
| `scripts/notify-indexing.js` | `npm run notify-indexing` | Pings Google and Bing sitemap endpoints; sends any configured webhooks. Non-fatal on error. |

### Run All Scripts Locally

```bash
npm run seo-update
```

Or run individually:

```bash
npm run fresh-data
npm run rotate-content
npm run update-schema
npm run generate-sitemap
npm run notify-indexing
```

### State Persistence

Script state (view counts, rotation indices, last engagement timestamp) is stored in `.seo-state.json` at the repository root. This file is committed automatically on each workflow run when content changes.

### Configuration

All SEO configuration lives in `config/seo-config.json`:

- `contentOptions.introVariants` — rotating intro text for HTML pages
- `contentOptions.ctaVariants` — rotating call-to-action button text
- `imagePool` — lead image URLs to rotate
- `trendingSearchTerms` — injected into the Related Searches section
- `newsHeadlines` — injected into the Latest Updates section
- `indexing.sitemapUrl` — sitemap URL pinged to search engines
- `indexing.pingUrls` — Google and Bing ping endpoints
- `indexing.webhookEndpoints` — optional POST webhook URLs

### Dynamic HTML Markers

HTML pages use comment markers for dynamic injection:

```html
<!-- DYNAMIC:INTRO -->…<!-- /DYNAMIC:INTRO -->
<!-- DYNAMIC:LEAD-IMAGE -->…<!-- /DYNAMIC:LEAD-IMAGE -->
<!-- DYNAMIC:CTA -->…<!-- /DYNAMIC:CTA -->
<!-- DYNAMIC:LAST-VERIFIED -->…<!-- /DYNAMIC:LAST-VERIFIED -->
<!-- DYNAMIC:ENGAGEMENT -->…<!-- /DYNAMIC:ENGAGEMENT -->
<!-- DYNAMIC:RELATED-SEARCHES -->…<!-- /DYNAMIC:RELATED-SEARCHES -->
<!-- DYNAMIC:NEWS-TICKER -->…<!-- /DYNAMIC:NEWS-TICKER -->
```

---

## Technology Stack

- GitHub Pages (static hosting)
- Static HTML5 / CSS3
- Mobile-responsive design
- SEO-optimized structured data (JSON-LD)
- Automated hourly freshness via GitHub Actions
- Node.js scripts (no external dependencies)

---

## Disclaimer

This website is **not affiliated with, authorized by, sponsored by, or endorsed by Progressive Insurance** or any other insurance provider. Users should always complete payments through official company websites and authorized customer service channels.

All trademarks and brand names remain the property of their respective owners.

---

## License

Content is provided for informational purposes only. Verify all payment information through official sources before taking action.
