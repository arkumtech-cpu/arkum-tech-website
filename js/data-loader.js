/* ============================================================
   ARKUM TECH — DATA LOADER
   ------------------------------------------------------------
   Renders services and projects into target containers.
   Triggered by data attributes on the container element:

     <div data-render="services" data-limit="6"></div>
     <div data-render="projects" data-filter="commercial"></div>

   Reads JSON from /data/*.json once, caches results.
   ============================================================ */

(() => {
  'use strict';

  const cache = {};

  /* ----------------------------------------------------------
     Fetch + cache JSON
     ---------------------------------------------------------- */
  async function loadJSON(name) {
    if (cache[name]) return cache[name];
    try {
      const res = await fetch(`data/${name}.json`);
      if (!res.ok) throw new Error(`Failed to load ${name}.json`);
      const data = await res.json();
      cache[name] = data;
      return data;
    } catch (err) {
      console.error('[Arkum] JSON load error:', err);
      return null;
    }
  }

  /* ----------------------------------------------------------
     Service Card Template
     ---------------------------------------------------------- */
  /* Static SEO page per service. TO ADD A SERVICE: add its id -> page file here. */
  const SERVICE_URLS = {"cctv": "cctv-systems.html", "access-control": "access-control-systems.html", "time-attendance": "time-attendance-systems.html", "turnstiles": "turnstiles-entrance-control.html", "networking": "networking-low-current.html", "supplies": "general-supplies.html", "consulting": "technical-consulting-installation.html", "software": "software-app-development.html"};

  function serviceCardHTML(service) {
    const icon = (window.ArkumIcons && window.ArkumIcons[service.icon]) || window.ArkumIcons.shield;
    return `
      <a href="${SERVICE_URLS[service.id] || 'service-details.html?service=' + service.id}" class="card service-card" aria-label="${service.name}">
        <div class="hex-icon">${icon}</div>
        <h3 class="text-h4" style="margin-bottom: 8px;">${service.name}</h3>
        <p class="text-body" style="font-size: 0.9375rem; margin-bottom: 20px;">${service.short}</p>
        <div class="card-arrow">
          <span style="font-family:'Space Grotesk',sans-serif;font-size:0.875rem;font-weight:500;color:var(--color-electric-cyan);">Learn more</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-electric-cyan);transition:transform 200ms;">
            <path d="M5 12h14M13 5l7 7-7 7"/>
          </svg>
        </div>
      </a>
    `;
  }

  /* ----------------------------------------------------------
     Project Card Template
     ---------------------------------------------------------- */
  /* ----------------------------------------------------------
     PROJECT ARTWORK (inline SVG, no image files needed)
     TO ADD ART FOR A NEW PROJECT: add a key = project id below.
     If a project id has no art, a generic network graphic is used.
     ---------------------------------------------------------- */
  const PA_STROKE = 'stroke="#2DD4F0" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"';
  const PROJECT_ART = {
    'corporate-tower-security': `<svg viewBox="0 0 400 225" ${PA_STROKE}>
      <rect x="20" y="120" width="50" height="85" fill="rgba(45,212,240,.05)" opacity=".5"/><rect x="330" y="105" width="52" height="100" fill="rgba(45,212,240,.05)" opacity=".5"/>
      <rect x="140" y="30" width="120" height="175" fill="rgba(30,91,168,.25)"/>
      <path d="M140 52h120M140 74h120M140 96h120M140 118h120M140 140h120M140 162h120M140 184h120" opacity=".25"/>
      <path d="M170 30v175M200 30v175M230 30v175" opacity=".18"/>
      <g fill="#2DD4F0" stroke="none"><rect x="148" y="58" width="14" height="10" opacity=".6"/><rect x="178" y="102" width="14" height="10" opacity=".8"/><rect x="208" y="146" width="14" height="10" opacity=".6"/><rect x="238" y="80" width="14" height="10" opacity=".8"/><rect x="178" y="168" width="14" height="10" opacity=".5"/></g>
      <path d="M200 6l16 7v12c0 10-7 17-16 20-9-3-16-10-16-20V13z" fill="rgba(10,22,40,.9)"/><path d="m193 24 5 5 9-10"/>
      <g class="pa-pulse"><circle cx="140" cy="60" r="4" fill="#2DD4F0"/><circle cx="260" cy="122" r="4" fill="#2DD4F0"/><circle cx="140" cy="164" r="4" fill="#2DD4F0"/></g>
      <path d="M10 205h380" opacity=".5"/><rect x="190" y="185" width="20" height="20" fill="rgba(10,22,40,.9)"/></svg>`,
    'hotel-access-control': `<svg viewBox="0 0 400 225" ${PA_STROKE}>
      <path d="M0 175h400M60 175L150 70h100l90 105" opacity=".35"/><path d="M150 70v105M250 70v105" opacity=".35"/>
      <rect x="30" y="60" width="80" height="115" fill="rgba(30,91,168,.25)"/><rect x="145" y="82" width="110" height="93" fill="rgba(30,91,168,.18)"/><rect x="290" y="60" width="80" height="115" fill="rgba(30,91,168,.25)"/>
      <circle cx="98" cy="120" r="3" fill="#2DD4F0"/><circle cx="358" cy="120" r="3" fill="#2DD4F0"/>
      <rect x="116" y="100" width="18" height="30" rx="3" fill="rgba(10,22,40,.9)"/><g class="pa-blink"><circle cx="125" cy="108" r="3" fill="#34D399" stroke="none"/></g><path d="M121 118h8M121 123h8" opacity=".7"/>
      <rect x="266" y="100" width="18" height="30" rx="3" fill="rgba(10,22,40,.9)"/><g class="pa-blink pa-d2"><circle cx="275" cy="108" r="3" fill="#2DD4F0" stroke="none"/></g><path d="M271 118h8M271 123h8" opacity=".7"/>
      <g transform="translate(168 105)"><circle cx="14" cy="14" r="9"/><path d="M21 21l24 24M36 36l6-6M30 42l6-6"/></g>
      <path d="M185 40a22 22 0 0 1 30 0M175 30a38 38 0 0 1 50 0" class="pa-blink pa-d3" opacity=".8"/><circle cx="200" cy="50" r="3" fill="#2DD4F0" stroke="none"/></svg>`,
    'hospital-surveillance': `<svg viewBox="0 0 400 225" ${PA_STROKE}>
      <rect x="110" y="70" width="180" height="135" fill="rgba(30,91,168,.22)"/><rect x="50" y="120" width="60" height="85" fill="rgba(45,212,240,.05)" opacity=".5"/><rect x="290" y="120" width="60" height="85" fill="rgba(45,212,240,.05)" opacity=".5"/>
      <path d="M110 108h180M110 150h180M170 70v135M230 70v135" opacity=".2"/>
      <rect x="180" y="20" width="40" height="40" rx="6" fill="rgba(10,22,40,.9)"/><path d="M200 28v24M188 40h24" stroke-width="3"/>
      <g transform="translate(70 32)"><rect x="0" y="6" width="30" height="16" rx="3" fill="rgba(10,22,40,.9)"/><circle cx="26" cy="14" r="4"/><path d="M30 14l60 38M30 14l60 6" opacity=".4" class="pa-blink"/></g>
      <g transform="translate(300 32) scale(-1 1) translate(-30 0)"><rect x="0" y="6" width="30" height="16" rx="3" fill="rgba(10,22,40,.9)"/><circle cx="26" cy="14" r="4"/><path d="M30 14l60 38M30 14l60 6" opacity=".4" class="pa-blink pa-d2"/></g>
      <g fill="#2DD4F0" stroke="none"><circle cx="140" cy="128" r="3.5" class="pa-pulse"/><circle cx="200" cy="170" r="3.5" class="pa-pulse"/><circle cx="260" cy="128" r="3.5" class="pa-pulse"/></g>
      <rect x="185" y="175" width="30" height="30" fill="rgba(10,22,40,.9)"/></svg>`,
    'factory-time-attendance': `<svg viewBox="0 0 400 225" ${PA_STROKE}>
      <path d="M20 205V120l40 22v-22l40 22v-22l40 22v-22l40 22V70h30v135z" fill="rgba(30,91,168,.25)"/>
      <path d="M210 70V40M226 70V30" stroke-width="5" opacity=".6"/><g class="pa-rise" opacity=".5"><circle cx="212" cy="28" r="6"/><circle cx="230" cy="16" r="5"/></g>
      <path d="M20 205h360" opacity=".5"/><g fill="#2DD4F0" stroke="none" opacity=".7"><rect x="40" y="160" width="12" height="10"/><rect x="76" y="160" width="12" height="10"/><rect x="112" y="160" width="12" height="10"/></g>
      <rect x="262" y="60" width="110" height="130" rx="8" fill="rgba(10,22,40,.92)"/>
      <circle cx="317" cy="105" r="30"/><g class="pa-spin"><path d="M317 105V82" stroke-width="2.4"/></g><path d="M317 105l16 8" stroke-width="2.4"/><circle cx="317" cy="105" r="2.5" fill="#2DD4F0"/>
      <path d="M296 153a21 21 0 0 1 42 0M301 158a16 16 0 0 1 32 0M306 163a11 11 0 0 1 22 0M312 168a5 5 0 0 1 10 0" opacity=".8" class="pa-blink"/></svg>`,
    'office-network-fitout': `<svg viewBox="0 0 400 225" ${PA_STROKE}>
      <rect x="165" y="92" width="70" height="40" rx="6" fill="rgba(30,91,168,.35)"/><g fill="#2DD4F0" stroke="none"><circle cx="180" cy="112" r="3" class="pa-blink"/><circle cx="195" cy="112" r="3" class="pa-blink pa-d2"/><circle cx="210" cy="112" r="3" class="pa-blink pa-d3"/><circle cx="225" cy="112" r="3" class="pa-blink"/></g>
      <path d="M200 92V50M165 112H90M235 112h75M185 132l-60 52M215 132l60 52" class="pa-flow" stroke-dasharray="5 6"/>
      <g fill="rgba(10,22,40,.92)"><rect x="176" y="22" width="48" height="30" rx="4"/><rect x="42" y="94" width="48" height="30" rx="4"/><rect x="310" y="94" width="48" height="30" rx="4"/><rect x="92" y="176" width="48" height="30" rx="4"/><rect x="260" y="176" width="48" height="30" rx="4"/></g>
      <path d="M188 14a18 18 0 0 1 24 0M193 8a10 10 0 0 1 14 0M184 52h32M54 124h24M322 124h24M104 206h24M272 206h24" opacity=".7"/>
      <circle cx="200" cy="37" r="5"/><path d="M52 109h30M320 109h30M102 191h30M270 191h30" opacity=".5"/></svg>`,
    'campus-turnstile-deployment': `<svg viewBox="0 0 400 225" ${PA_STROKE}>
      <path d="M40 90l160-52 160 52" fill="rgba(30,91,168,.2)"/><path d="M60 90v40M340 90v40M100 80v50M300 80v50" opacity=".4"/><path d="M0 205h400" opacity=".5"/>
      <g stroke-width="2.2"><path d="M90 205v-72M160 205v-72M240 205v-72M310 205v-72" /></g>
      <g fill="rgba(10,22,40,.95)"><rect x="82" y="123" width="16" height="14" rx="3"/><rect x="152" y="123" width="16" height="14" rx="3"/><rect x="232" y="123" width="16" height="14" rx="3"/><rect x="302" y="123" width="16" height="14" rx="3"/></g>
      <g class="pa-blink"><circle cx="90" cy="130" r="2.5" fill="#34D399" stroke="none"/><circle cx="310" cy="130" r="2.5" fill="#34D399" stroke="none"/></g>
      <g opacity=".9"><path d="M98 165h54M248 165h54"/><path d="M98 178h54M248 178h54" opacity=".5"/></g>
      <g fill="#2DD4F0" stroke="none" class="pa-walk"><circle cx="125" cy="150" r="5"/><path d="M118 190q7-26 14 0z"/><circle cx="275" cy="150" r="5" opacity=".8"/><path d="M268 190q7-26 14 0z" opacity=".8"/></g>
      <rect x="180" y="70" width="40" height="22" rx="4" fill="rgba(10,22,40,.92)"/><path d="M188 81h24M194 77h12" opacity=".8"/></svg>`
  };
  const PA_FALLBACK = 'office-network-fitout';

  function projectCardHTML(project) {
    const tags = (project.tags || []).map(t => `<span class="tag tag-dot">${t}</span>`).join('');
    return `
      <article class="card project-card" data-project-id="${project.id}">
        <div class="project-image" style="background: linear-gradient(135deg, ${project.gradient || '#1B3A6B, #0F1E36'}); aspect-ratio: 16/9; border-radius: 8px; margin-bottom: 20px; position: relative; overflow: hidden;">
          <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(45,212,240,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(45,212,240,0.08) 1px, transparent 1px);background-size:24px 24px;"></div>
          <div class="project-art">${PROJECT_ART[project.id] || PROJECT_ART[PA_FALLBACK]}</div>
          <div style="position:absolute;top:16px;left:16px;font-family:'JetBrains Mono',monospace;font-size:0.6875rem;font-weight:500;letter-spacing:0.1em;color:var(--color-electric-cyan);background:rgba(10,22,40,0.7);padding:4px 10px;border-radius:4px;border:1px solid var(--border-default);">${project.sector}</div>
          <div style="position:absolute;bottom:16px;right:16px;width:48px;height:48px;background:rgba(10,22,40,0.6);border:1px solid var(--border-default);border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--color-electric-cyan);">
            ${(window.ArkumIcons && window.ArkumIcons[project.icon]) || window.ArkumIcons.shield}
          </div>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;">${tags}</div>
        <h3 class="text-h4" style="margin-bottom: 8px;">${project.title}</h3>
        <p class="text-body" style="font-size: 0.9375rem; margin-bottom: 16px;">${project.summary}</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding-top:16px;border-top:1px solid var(--border-subtle);">
          <div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:0.6875rem;color:var(--color-slate-400);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">Scale</div>
            <div style="font-size:0.875rem;color:var(--color-white);font-weight:500;">${project.scale}</div>
          </div>
          <div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:0.6875rem;color:var(--color-slate-400);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">Location</div>
            <div style="font-size:0.875rem;color:var(--color-white);font-weight:500;">${project.location}</div>
          </div>
        </div>
      </article>
    `;
  }

  /* ----------------------------------------------------------
     Render Services
     ---------------------------------------------------------- */
  async function renderServices() {
    const containers = document.querySelectorAll('[data-render="services"]');
    if (!containers.length) return;

    const data = await loadJSON('services');
    if (!data || !data.services) return;

    containers.forEach(container => {
      const limit = parseInt(container.dataset.limit) || data.services.length;
      const services = data.services.slice(0, limit);
      container.innerHTML = services.map(serviceCardHTML).join('');
    });
  }

  /* ----------------------------------------------------------
     Render Projects
     ---------------------------------------------------------- */
  async function renderProjects() {
    const containers = document.querySelectorAll('[data-render="projects"]');
    if (!containers.length) return;

    const data = await loadJSON('projects');
    if (!data || !data.projects) return;

    containers.forEach(container => {
      const filter = container.dataset.filter;
      const limit = parseInt(container.dataset.limit) || data.projects.length;
      let projects = data.projects;
      if (filter && filter !== 'all') {
        projects = projects.filter(p => p.sector.toLowerCase() === filter.toLowerCase());
      }
      projects = projects.slice(0, limit);
      container.innerHTML = projects.map(projectCardHTML).join('');
    });
  }

  /* ----------------------------------------------------------
     Render Service Details (single page)
     ---------------------------------------------------------- */
  async function renderServiceDetails() {
    const container = document.getElementById('serviceDetails');
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const slug = params.get('service');

    const data = await loadJSON('services');
    if (!data) return;

    const service = data.services.find(s => s.id === slug) || data.services[0];
    const icon = (window.ArkumIcons && window.ArkumIcons[service.icon]) || window.ArkumIcons.shield;
    const checkIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

    document.title = `${service.name} — Arkum Tech`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', service.short);

    // Get related services (next 2)
    const idx = data.services.findIndex(s => s.id === service.id);
    const related = [
      data.services[(idx + 1) % data.services.length],
      data.services[(idx + 2) % data.services.length]
    ];

    container.innerHTML = `
      <!-- Service Hero -->
      <section class="page-hero">
        <div class="hero-bg">
          <div class="orb orb-1"></div>
          <div class="hex-grid"></div>
        </div>
        <div class="container">
          <div class="breadcrumb">
            <a href="index.html">Home</a>
            <span class="breadcrumb-sep">/</span>
            <a href="services.html">Services</a>
            <span class="breadcrumb-sep">/</span>
            <span style="color:var(--color-electric-cyan);">${service.name}</span>
          </div>
          <div style="display:flex;justify-content:center;margin-bottom:24px;">
            <div class="hex-icon" style="width:72px;height:72px;margin-bottom:0;">${icon.replace('width="28"', 'width="36"').replace('height="28"', 'height="36"')}</div>
          </div>
          <span class="text-label" style="margin-bottom:12px;display:inline-block;">// ${service.tagline.toUpperCase()}</span>
          <h1 class="text-h1" style="margin-bottom:16px;">${service.name}</h1>
          <p class="text-lead" style="max-width:720px;margin:0 auto;">${service.description}</p>
        </div>
      </section>

      <!-- Key Features -->
      <section class="section" style="padding-top:0;">
        <div class="container">
          <div style="display:grid;grid-template-columns:1fr;gap:48px;">
            <div class="reveal">
              <span class="text-label accent-line">// CAPABILITIES</span>
              <h2 class="text-h2" style="margin-bottom:32px;">Key Features</h2>
              <div class="features-grid">
                ${service.features.map(f => `
                  <div class="feature-row">
                    <div class="feature-check">${checkIcon}</div>
                    <span>${f}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Use Cases -->
      <section class="section" style="background:var(--color-midnight);">
        <div class="container">
          <div class="section-header reveal">
            <span class="text-label accent-line">// USE CASES</span>
            <h2 class="text-h2" style="margin-bottom:16px;">Real-world deployments</h2>
            <p class="text-lead">Where this system delivers measurable security and operational outcomes.</p>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;" class="reveal-stagger">
            ${service.useCases.map(u => `
              <div class="card">
                <div class="hex-icon" style="width:44px;height:44px;margin-bottom:16px;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <h3 class="text-h4" style="margin-bottom:8px;">${u.title}</h3>
                <p class="text-body" style="font-size:0.9375rem;">${u.desc}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- Components -->
      <section class="section">
        <div class="container">
          <div class="section-header reveal">
            <span class="text-label accent-line">// SYSTEM COMPONENTS</span>
            <h2 class="text-h2">Engineered with certified hardware</h2>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;" class="reveal">
            ${service.components.map(c => `<span class="tag tag-dot" style="font-size:0.8125rem;padding:8px 14px;">${c}</span>`).join('')}
          </div>
        </div>
      </section>

      <!-- Related Services -->
      <section class="section" style="background:var(--color-midnight);">
        <div class="container">
          <div class="section-header reveal align-left" style="text-align:left;margin:0 0 32px;">
            <span class="text-label accent-line">// RELATED</span>
            <h2 class="text-h2">Complementary services</h2>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;" class="reveal-stagger">
            ${related.map(serviceCardHTML).join('')}
          </div>
        </div>
      </section>

      <!-- CTA -->
      <div data-component="cta-band"></div>
    `;
  }

  /* ----------------------------------------------------------
     BOOT — wait for arkum:ready then render data
     ---------------------------------------------------------- */
  document.addEventListener('arkum:ready', () => {
    renderServices();
    renderProjects();
    renderServiceDetails().then(() => {
      // Service-details page has nested CTA component — re-trigger loader
      const slot = document.querySelector('[data-component="cta-band"]');
      if (slot) {
        fetch('components/cta-band.html')
          .then(r => r.text())
          .then(html => { slot.outerHTML = html; });
      }
    });
  });
})();
