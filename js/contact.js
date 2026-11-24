/* ============================================================
   ARKUM TECH — CONTACT FORM
   ------------------------------------------------------------
   Vanilla JS form validation with:
   - Per-field validation on blur and submit
   - Inline error messages
   - Success / error banner
   - Mailto fallback (works on static hosting / cPanel)
   ------------------------------------------------------------
   TO REPLACE WITH A REAL BACKEND:
   1. Set FORM_ENDPOINT to your handler URL
   2. Set USE_MAILTO_FALLBACK to false
   Backend should accept POST JSON: { name, email, phone, service, message }
   ============================================================ */

(() => {
  'use strict';

  // CONFIG — change these for production
  const CONFIG = {
    FORM_ENDPOINT: 'contact-handler.php',              // e.g. 'https://yourdomain.com/api/contact'
    RECIPIENT_EMAIL: 'info@arkumtech.com',
    USE_MAILTO_FALLBACK: false       // true = no backend needed; opens mail client
  };

  function init() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const fields = {
      name:    form.querySelector('#name'),
      email:   form.querySelector('#email'),
      phone:   form.querySelector('#phone'),
      service: form.querySelector('#service'),
      message: form.querySelector('#message')
    };

    const status = form.querySelector('#formStatus');
    const submitBtn = form.querySelector('button[type="submit"]');

    const rules = {
      name: {
        validate: v => v.trim().length >= 2,
        error: 'Please enter your full name.'
      },
      email: {
        validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
        error: 'Please enter a valid email address.'
      },
      phone: {
        validate: v => v.trim() === '' || /^[\d\s\-+()]{7,}$/.test(v.trim()),
        error: 'Please enter a valid phone number.'
      },
      service: {
        validate: v => v.trim() !== '',
        error: 'Please select a service of interest.'
      },
      message: {
        validate: v => v.trim().length >= 10,
        error: 'Please share at least a brief description (10+ characters).'
      }
    };

    /* ----------------------------------------------------------
       Per-field validation
       ---------------------------------------------------------- */
    function validateField(name) {
      const field = fields[name];
      if (!field) return true;

      const value = field.value;
      const rule = rules[name];
      const errorEl = form.querySelector(`#${name}-error`);
      const valid = rule.validate(value);

      if (!valid) {
        field.classList.add('invalid');
        if (errorEl) errorEl.textContent = rule.error;
      } else {
        field.classList.remove('invalid');
        if (errorEl) errorEl.textContent = '';
      }
      return valid;
    }

    // Validate on blur for immediate feedback
    Object.keys(fields).forEach(name => {
      const field = fields[name];
      if (!field) return;
      field.addEventListener('blur', () => validateField(name));
      field.addEventListener('input', () => {
        if (field.classList.contains('invalid')) validateField(name);
      });
    });

    /* ----------------------------------------------------------
       Submit handler
       ---------------------------------------------------------- */
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Validate all fields
      const allValid = Object.keys(fields)
        .map(name => validateField(name))
        .every(Boolean);

      if (!allValid) {
        showStatus('error', 'Please fix the errors above before sending.');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="animation: spin 1s linear infinite;">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        Sending...
      `;

      const payload = {
        name: fields.name.value.trim(),
        email: fields.email.value.trim(),
        phone: fields.phone.value.trim(),
        service: fields.service.value,
        message: fields.message.value.trim(),
        company_website: (form.querySelector('[name=company_website]') || {}).value || ''
      };

      try {
        if (CONFIG.FORM_ENDPOINT && !CONFIG.USE_MAILTO_FALLBACK) {
          // Real backend
          const res = await fetch(CONFIG.FORM_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (!res.ok) throw new Error('Submission failed (' + res.status + ')');
          showStatus('success', 'Thank you. We\'ve received your message and will respond within one business day.');
          form.reset();
        } else {
          // Mailto fallback — opens user's mail client with prefilled message
          const subject = encodeURIComponent(`[Quote Request] ${payload.service} — ${payload.name}`);
          const body = encodeURIComponent(
            `Name: ${payload.name}\n` +
            `Email: ${payload.email}\n` +
            `Phone: ${payload.phone || 'Not provided'}\n` +
            `Service: ${payload.service}\n\n` +
            `Message:\n${payload.message}\n`
          );
          window.location.href = `mailto:${CONFIG.RECIPIENT_EMAIL}?subject=${subject}&body=${body}`;
          showStatus('success', 'Your email client should open with the message ready. If it doesn\'t, please email us at ' + CONFIG.RECIPIENT_EMAIL);
          setTimeout(() => form.reset(), 1500);
        }
      } catch (err) {
        console.error('[Arkum] Form submission error:', err);
        // Backup path: open the visitor's mail app with the message prefilled
        const subj = encodeURIComponent('[Quote Request] ' + payload.service + ' — ' + payload.name);
        const bod  = encodeURIComponent('Name: ' + payload.name + '\nEmail: ' + payload.email + '\nPhone: ' + (payload.phone || 'Not provided') + '\nService: ' + payload.service + '\n\nMessage:\n' + payload.message + '\n');
        showStatus('error', 'We could not send automatically. Please email us at ' + CONFIG.RECIPIENT_EMAIL + ' or WhatsApp +20 111 101 6335. <a href="mailto:' + CONFIG.RECIPIENT_EMAIL + '?subject=' + subj + '&body=' + bod + '" style="text-decoration:underline">Click here to send by email</a>.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `Send Message
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>`;
      }
    });

    function showStatus(type, message) {
      if (!status) return;
      status.className = `form-status show ${type}`;
      status.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          ${type === 'success'
            ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'
            : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'}
        </svg>
        <span>${message}</span>
      `;

      // Scroll to status if not visible
      status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      if (type === 'success') {
        setTimeout(() => status.classList.remove('show'), 8000);
      }
    }
  }

  // Inject spin keyframe for loading state
  const styleSheet = document.createElement('style');
  styleSheet.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(styleSheet);

  // Wait for arkum:ready (components loaded) before initializing
  document.addEventListener('arkum:ready', init);
})();
