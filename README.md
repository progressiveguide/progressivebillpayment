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

## Content Integrity Safeguards

Automated hourly content rotation has been removed to keep published content stable and prevent further degradation of `index.html` and other critical pages.

### Protected content files

The following files are treated as protected content and should only change through reviewed pull requests:

- `index.html`
- `404.html`
- `sitemap.xml`

### Review guard

This repository now includes:

- `.github/CODEOWNERS` — routes protected content changes to `@progressiveguide`
- `.github/workflows/content-review-guard.yml` — fails pull requests to `main` when protected content changes do not have at least one approval

### Main branch protection

Keep the `main` branch configured in GitHub with:

- required pull requests before merge
- at least 1 approval
- required code owner review
- the `Content Review Guard` status check enabled

---

## Technology Stack

- GitHub Pages (static hosting)
- Static HTML5 / CSS3
- Mobile-responsive design
- SEO-optimized structured data (JSON-LD)
- GitHub Actions review guard for protected content changes
- Node.js scripts (no external dependencies)

---

## Disclaimer

This website is **not affiliated with, authorized by, sponsored by, or endorsed by Progressive Insurance** or any other insurance provider. Users should always complete payments through official company websites and authorized customer service channels.

All trademarks and brand names remain the property of their respective owners.

---

## License

Content is provided for informational purposes only. Verify all payment information through official sources before taking action.
