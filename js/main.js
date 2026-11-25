/* ============================================================
   ARKUM TECH — MAIN JS
   ------------------------------------------------------------
   Modules:
   1. Component Loader (fetches /components/*.html)
   2. Navbar (scroll, mobile menu, active link)
   3. Reveal-on-Scroll (IntersectionObserver)
   4. Stat Counters (count up on viewport entry)
   5. Year stamp
   ------------------------------------------------------------
   No dependencies. ~150 lines. Loads after DOMContentLoaded.
   ============================================================ */

(() => {
  'use strict';

  /* ----------------------------------------------------------
     1. COMPONENT LOADER
     ----------------------------------------------------------
     Inject reusable HTML fragments. Pages declare:
       <div data-component="navbar"></div>
       <div data-component="footer"></div>
       <div data-component="cta-band"></div>
     ---------------------------------------------------------- */
  async function loadComponents() {
    const slots = document.querySelectorAll('[data-component]');

    const requests = Array.from(slots).map(async (slot) => {
      const name = slot.dataset.component;
      try {
        const res = await fetch(`components/${name}.html?v=20261125`);
        if (!res.ok) throw new Error(`Failed to load ${name}`);
        slot.outerHTML = await res.text();
      } catch (err) {
        console.error('[Arkum] Component load error:', err);
        slot.innerHTML = `<!-- failed to load ${name} -->`;
      }
    });

    await Promise.all(requests);
    return true;
  }

  /* ----------------------------------------------------------
     2. NAVBAR
     ---------------------------------------------------------- */
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    const toggle = document.getElementById('navbarToggle');
    const mobile = document.getElementById('navbarMobile');
    if (!navbar) return;

    // Scroll: add blur background after 80px
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          navbar.classList.toggle('scrolled', window.scrollY > 80);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Mobile toggle
    if (toggle && mobile) {
      toggle.addEventListener('click', () => {
        const open = mobile.classList.toggle('open');
        toggle.classList.toggle('active', open);
        toggle.setAttribute('aria-expanded', String(open));
        document.body.style.overflow = open ? 'hidden' : '';
      });

      mobile.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          mobile.classList.remove('open');
          toggle.classList.remove('active');
          toggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      });
    }

    // Active link detection — based on filename
    const path = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    document.querySelectorAll('[data-page]').forEach(link => {
      if (link.dataset.page === path) link.classList.add('active');
    });
  }

  /* ----------------------------------------------------------
     3. REVEAL ON SCROLL
     ----------------------------------------------------------
     Add class .reveal or .reveal-stagger to any element.
     Becomes .visible when 15% in viewport.
     ---------------------------------------------------------- */
  function initReveal() {
    const SEL = '.reveal, .reveal-stagger';
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll(SEL).forEach(el => el.classList.add('visible'));
      return;
    }

    const seen = new WeakSet();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

    // Observe every .reveal element, including ones injected later
    // (components, JSON-driven sections). Safe to call repeatedly.
    function scan() {
      document.querySelectorAll(SEL).forEach(el => {
        if (!seen.has(el) && !el.classList.contains('visible')) {
          seen.add(el);
          observer.observe(el);
        }
      });
    }
    scan();
    new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
    window.ArkumReveal = scan;
  }

  /* ----------------------------------------------------------
     4. STAT COUNTERS
     ----------------------------------------------------------
     <span data-counter="120" data-suffix="+">0</span>
     Counts up when entering viewport.
     ---------------------------------------------------------- */
  function initCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    const animate = (el) => {
      const target = parseFloat(el.dataset.counter);
      const suffix = el.dataset.suffix || '';
      const duration = 1600;
      const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = (target * eased).toFixed(decimals);
        el.textContent = value + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }

  /* ----------------------------------------------------------
     5. FOOTER YEAR
     ---------------------------------------------------------- */
  function initYear() {
    const el = document.getElementById('footerYear');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ----------------------------------------------------------
     6. SOCIAL ICON HOVER (delegated)
     ---------------------------------------------------------- */
  function initSocialHover() {
    document.querySelectorAll('.footer a[aria-label]').forEach(a => {
      a.addEventListener('mouseenter', () => {
        a.style.borderColor = 'var(--color-electric-cyan)';
        a.style.color = 'var(--color-electric-cyan)';
      });
      a.addEventListener('mouseleave', () => {
        a.style.borderColor = '';
        a.style.color = '';
      });
    });
  }

  /* ----------------------------------------------------------
     BOOT
     ---------------------------------------------------------- */
  async function boot() {
    await loadComponents();
    initNavbar();
    initReveal();
    initCounters();
    initYear();
    initSocialHover();

    // Notify page-specific scripts that components are ready
    document.dispatchEvent(new CustomEvent('arkum:ready'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
