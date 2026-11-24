# Arkum Tech — Corporate Website

Production-ready static corporate website for **Arkum Tech**, a security solutions provider and system integrator.

Built with **HTML5 + Tailwind-style custom CSS + Vanilla JavaScript**. No build step. No Node runtime. Deploy directly to cPanel `public_html` or any static host.

---

## 🚀 Deployment to cPanel

1. Open cPanel → **File Manager**
2. Navigate to `public_html` (or a subdomain folder)
3. Upload the entire contents of this folder
4. Done — visit your domain in a browser

Total uploaded size: **~270 KB**. No database. No PHP. No server config required.

> ⚠️ **Important:** Components load via `fetch()` so the site must be served over HTTP/HTTPS. Opening files locally with `file://` will *not* work — it must be served from a real server (cPanel, Netlify, GitHub Pages, or `python -m http.server` for local testing).

### Local Testing
```bash
cd arkum-tech
python3 -m http.server 8080
# Visit http://localhost:8080
```

---

## 📁 Project Structure

```
arkum-tech/
├── index.html              ← Home
├── about.html              ← About page
├── services.html           ← All services grid
├── service-details.html    ← Dynamic, reads ?service= from URL
├── projects.html           ← Use case projects with sector filter
├── contact.html            ← Contact form
│
├── /assets
│   └── /images/logo.jpg    ← Company logo
│
├── /css
│   └── custom.css          ← Complete design system (1800+ lines)
│
├── /js
│   ├── main.js             ← Component loader, scroll, animations, counters
│   ├── icons.js            ← Inline SVG icons keyed by service
│   ├── data-loader.js      ← Renders services + projects from JSON
│   └── contact.js          ← Form validation + submission
│
├── /components             ← Reusable HTML fragments (loaded via JS)
│   ├── navbar.html
│   ├── footer.html
│   └── cta-band.html
│
└── /data                   ← Content lives here
    ├── services.json       ← All services
    └── projects.json       ← All projects
```

---

## ✏️ Content Editing — Quick Reference

### How to add a new service

1. Open `data/services.json`
2. Copy any existing service object as a template
3. Fill in:
   ```json
   {
     "id": "intrusion-detection",
     "name": "Intrusion Detection",
     "tagline": "Perimeter and area protection systems",
     "short": "One-line summary shown on cards.",
     "icon": "shield",
     "description": "Full description for the detail page.",
     "features": ["Feature 1", "Feature 2", "..."],
     "useCases": [
       { "title": "Use Case Name", "desc": "Description." }
     ],
     "components": ["Component 1", "Component 2"]
   }
   ```
4. **Pick an icon** from `js/icons.js` — available keys: `camera`, `lock`, `clock`, `gate`, `network`, `box`, `shield`, `cog`, `zap`, `trending`, `layers`, `headset`. Or add a new SVG to `icons.js`.
5. Update navbar/footer links in `components/navbar.html` and `components/footer.html` if you want it in the menu.

The new service will appear automatically on:
- Home page services grid
- Services page grid
- Service details page (visit `service-details.html?service=intrusion-detection`)
- Footer service list (after manual link update)

### How to add a new project

1. Open `data/projects.json`
2. Copy a project object as a template
3. Fill in:
   ```json
   {
     "id": "unique-slug",
     "title": "Project title",
     "sector": "Commercial",  // Must match filter chips: Commercial, Hospitality, Healthcare, Industrial, Education
     "icon": "shield",        // Icon key from icons.js
     "summary": "1-2 sentence description.",
     "scope": ["Bullet 1", "Bullet 2"],
     "scale": "X units · Y something",
     "location": "Brief location",
     "outcome": "What was achieved.",
     "tags": ["Tag 1", "Tag 2"],
     "gradient": "#1B3A6B, #0F1E36"
   }
   ```
4. Save. Appears automatically on the Projects page.

### How to add a new sector filter

1. Edit `projects.html` — find `.filter-bar` and add a new chip:
   ```html
   <button class="filter-chip" data-sector="YourSector">Your Sector</button>
   ```
2. Use that exact `sector` value in any project's JSON.

### How to update contact info

- **Phone, email, WhatsApp** — search-replace `+201111016335` and `info@arkumtech.com` across all `.html` files
- **Social links** — `components/footer.html`
- **Business hours** — `contact.html` (look for `.hours-card`)
- **Office address** — `components/footer.html` and `contact.html`

### How to enable a real backend for the contact form

1. Open `js/contact.js`
2. Find the `CONFIG` object at the top
3. Set `FORM_ENDPOINT: 'https://your-domain.com/api/contact'`
4. Set `USE_MAILTO_FALLBACK: false`

Backend should accept POST JSON: `{ name, email, phone, service, message }`.

Until you have a backend, the form opens the user's mail client with a pre-filled message — works fine on cPanel without any server config.

### How to change brand colors

All colors are CSS custom properties at the top of `css/custom.css`. Edit once, propagates everywhere:

```css
:root {
  --color-deep-navy: #0A1628;       /* Page background */
  --color-electric-cyan: #2DD4F0;   /* Brand accent */
  --color-brand-blue: #1E5BA8;      /* Primary brand */
  /* ... */
}
```

---

## 🎨 Design System Reference

| Token | Value | Use |
|---|---|---|
| Primary font | Space Grotesk | Headings, buttons, stats |
| Body font | Inter | Paragraphs, UI |
| Mono font | JetBrains Mono | Labels, technical accents |
| Brand gradient | #1E5BA8 → #2DD4F0 | CTAs, gradient text |
| Card pattern | `.card` class | Services, projects, info |
| Section label | `.text-label` + `.accent-line` | Above every H2 |
| Reveal animation | `.reveal` or `.reveal-stagger` class | Add for scroll fade-in |

---

## 🔍 SEO Checklist

✅ Each page has unique `<title>` and `meta description`
✅ Open Graph tags for social sharing
✅ Semantic HTML5 (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`)
✅ Single `<h1>` per page
✅ Logical heading hierarchy
✅ Canonical URLs
✅ `alt` text on logo images
✅ ARIA labels on interactive elements
✅ Lazy loading respected (no images delaying render)

### Recommended additions for production:
- Add `sitemap.xml` (you can generate from `index.html`, `about.html`, etc.)
- Add `robots.txt`
- Replace placeholder phone `+201111016335` with real number
- Add Google Analytics / Plausible script tag in each `<head>` if desired
- Compress `logo.jpg` further if loading time matters (current: 68KB)

---

## ♿ Accessibility

- Focus rings on all interactive elements (`:focus-visible`)
- ARIA labels on icon-only buttons (WhatsApp, mobile menu)
- Sufficient color contrast (WCAG AA)
- Keyboard-navigable forms with visible labels
- Reduced motion respected (`prefers-reduced-motion`)
- Mobile menu locks body scroll appropriately

---

## 🧪 Browser Support

Tested patterns work on:
- Chrome / Edge 90+
- Firefox 90+
- Safari 14+
- iOS Safari / Android Chrome (mobile-first)

Uses: CSS custom properties, IntersectionObserver, fetch, ES2017 async/await. No transpilation needed for modern browsers.

---

## 🔄 Future Migration

The architecture is designed for easy migration to React/Next.js when needed:

- Components in `/components/*.html` map directly to React components
- JSON in `/data/*.json` becomes API responses or a headless CMS
- Vanilla JS modules are lightweight and isolated — easy to rewrite
- CSS custom properties translate cleanly to Tailwind config or styled-components

---

## 📞 Support

For questions about this codebase, the entire site is heavily commented. Each major section in `custom.css` and each JS module includes inline documentation explaining the purpose and how to extend it.

**Built for Arkum Tech** — Security Solutions Provider & System Integrator
