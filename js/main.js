/* ================================================================
   EFREI – Département Informatique  |  main.js
================================================================ */

/* ── Nav mobile ─────────────────────────────────────────────── */
(function initNav() {
  const toggle = document.getElementById('nav-toggle');
  const menu   = document.getElementById('nav-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
    menu.setAttribute('aria-hidden', !open);
  });

  // Fermer au clic sur un lien
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Marquer le lien actif
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  menu.querySelectorAll('a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPage) a.classList.add('active');
  });
})();

/* ── Scroll-to-top ───────────────────────────────────────────── */
(function initScrollTop() {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ── Fade-in au scroll ───────────────────────────────────────── */
(function initFadeUp() {
  const targets = document.querySelectorAll('.fade-up');
  if (!targets.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 0.1 + 's';
    io.observe(el);
  });
})();

/* ── Carousel ────────────────────────────────────────────────── */
(function initCarousel() {
  const track   = document.getElementById('carousel-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const dotsWrap = document.getElementById('carousel-dots') || document.querySelector('.carousel-dots');
  if (!track) return;

  const slides = track.querySelectorAll('.carousel-slide');
  let current = 0;
  let timer;

  function buildDots() {
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.classList.add('carousel-dot');
      dot.setAttribute('aria-label', 'Diapositive ' + (i + 1));
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });
  }

  function updateDots() {
    if (!dotsWrap) return;
    dotsWrap.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    updateDots();
    resetTimer();
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 5000);
  }

  if (dotsWrap) buildDots();
  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  // Swipe tactile
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) goTo(current + (dx < 0 ? 1 : -1));
  });

  resetTimer();
})();

/* ── Accordion ───────────────────────────────────────────────── */
(function initAccordion() {
  const triggers = document.querySelectorAll('.accordion-header, .accordion-trigger');
  if (!triggers.length) return;

  const closeItem = (item) => {
    item.classList.remove('open');
    const trigger = item.querySelector('.accordion-header, .accordion-trigger');
    const panelId = trigger?.getAttribute('aria-controls');
    const panel = panelId ? document.getElementById(panelId) : item.querySelector('.accordion-content, .accordion-body');
    if (trigger) {
      trigger.classList.remove('active');
      trigger.setAttribute('aria-expanded', 'false');
    }
    if (panel && panel.classList.contains('accordion-content')) panel.hidden = true;
  };

  const openItem = (item) => {
    item.classList.add('open');
    const trigger = item.querySelector('.accordion-header, .accordion-trigger');
    const panelId = trigger?.getAttribute('aria-controls');
    const panel = panelId ? document.getElementById(panelId) : item.querySelector('.accordion-content, .accordion-body');
    if (trigger) {
      trigger.classList.add('active');
      trigger.setAttribute('aria-expanded', 'true');
    }
    if (panel && panel.classList.contains('accordion-content')) panel.hidden = false;
  };

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion-item');
      if (!item) return;
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.accordion-item').forEach(closeItem);
      if (!wasOpen) openItem(item);
    });
  });
})();

/* ── Filtre tableau cours ────────────────────────────────────── */
(function initTableFilter() {
  const btns  = document.querySelectorAll('.filter-btn');
  const rows  = document.querySelectorAll('.course-row');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      rows.forEach(row => {
        const show = filter === 'all' || row.dataset.type === filter;
        row.style.display = show ? '' : 'none';
      });
    });
  });
})();

/* ── Compteur animé (stats) ──────────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el  = e.target;
      const end = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      let start = 0;
      const duration = 1500;
      const step = Math.ceil(end / (duration / 16));
      const tick = () => {
        start = Math.min(start + step, end);
        el.textContent = start.toLocaleString('fr-FR') + suffix;
        if (start < end) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => io.observe(c));
})();

/* ── Validation formulaire contact ──────────────────────────── */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const rules = {
    nom:     { required: true, minLen: 2, label: 'Nom' },
    prenom:  { required: true, minLen: 2, label: 'Prénom' },
    email:   { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, label: 'Email' },
    tel:     { required: false, pattern: /^[0-9+\s\-]{8,15}$/, label: 'Téléphone' },
    sujet:   { required: true, label: 'Sujet' },
    message: { required: true, minLen: 20, label: 'Message' },
    consent: { required: true, type: 'checkbox', label: 'Consentement' }
  };

  function validateField(name, value) {
    const r = rules[name];
    if (!r) return null;
    if (r.type === 'checkbox') {
      return value ? null : r.label + ' est requis.';
    }
    if (r.required && !value.trim()) return r.label + ' est obligatoire.';
    if (r.minLen && value.trim().length < r.minLen)
      return r.label + ' doit contenir au moins ' + r.minLen + ' caractères.';
    if (r.pattern && value.trim() && !r.pattern.test(value.trim()))
      return r.label + ' est invalide.';
    return null;
  }

  function showError(input, msg) {
    input.classList.remove('valid');
    input.classList.add('invalid');
    const err = document.getElementById(input.name + '-error');
    if (err) { err.textContent = msg; err.classList.add('show'); }
    const ok = document.getElementById(input.name + '-ok');
    if (ok) ok.classList.remove('show');
  }

  function showSuccess(input) {
    input.classList.remove('invalid');
    input.classList.add('valid');
    const err = document.getElementById(input.name + '-error');
    if (err) err.classList.remove('show');
    const ok = document.getElementById(input.name + '-ok');
    if (ok) ok.classList.add('show');
  }

  function clearField(input) {
    input.classList.remove('valid', 'invalid');
    const err = document.getElementById(input.name + '-error');
    if (err) err.classList.remove('show');
    const ok = document.getElementById(input.name + '-ok');
    if (ok) ok.classList.remove('show');
  }

  // Validation à la saisie
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('blur', () => {
      const val = field.type === 'checkbox' ? field.checked : field.value;
      const err = validateField(field.name, val);
      if (field.value === '' && !rules[field.name]?.required) {
        clearField(field); return;
      }
      err ? showError(field, err) : showSuccess(field);
    });

    field.addEventListener('input', () => {
      if (field.classList.contains('invalid')) {
        const val = field.type === 'checkbox' ? field.checked : field.value;
        const err = validateField(field.name, val);
        err ? showError(field, err) : showSuccess(field);
      }
    });
  });

  // Compteur caractères message
  const msgField  = form.querySelector('[name="message"]');
  const charCount = document.getElementById('char-count');
  if (msgField && charCount) {
    msgField.addEventListener('input', () => {
      charCount.textContent = msgField.value.length + ' / 2000 caractères';
    });
  }

  // Soumission
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const notice = document.getElementById('form-notice');
    const btn    = form.querySelector('.submit-btn');
    let valid    = true;

    // Tout valider
    form.querySelectorAll('input, select, textarea').forEach(field => {
      if (!field.name || !rules[field.name]) return;
      const val = field.type === 'checkbox' ? field.checked : field.value;
      const err = validateField(field.name, val);
      if (err) { showError(field, err); valid = false; }
      else if (field.value || field.checked) showSuccess(field);
    });

    if (!valid) {
      notice.className = 'form-notice error';
      notice.textContent = '⚠ Veuillez corriger les erreurs avant d\'envoyer.';
      notice.style.display = 'block';
      form.querySelector('.invalid')?.focus();
      return;
    }

    // Simuler l'envoi
    btn.classList.add('loading');
    btn.disabled = true;
    notice.style.display = 'none';

    setTimeout(() => {
      btn.classList.remove('loading');
      btn.disabled = false;
      notice.className = 'form-notice success';
      notice.textContent = '✅ Message envoyé ! Nous vous répondrons sous 48h.';
      notice.style.display = 'block';
      form.reset();
      form.querySelectorAll('input, select, textarea').forEach(f => clearField(f));
      if (charCount) charCount.textContent = '0 / 2000 caractères';
      notice.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 1800);
  });
})();

/* ── FAQ Accordion (contact.html) ────────────────────────────── */
(function initFaq() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item   = btn.closest('.faq-item');
      const answer = document.getElementById(btn.getAttribute('aria-controls'));
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Fermer tous les autres
      document.querySelectorAll('.faq-item').forEach(i => {
        const q = i.querySelector('.faq-question');
        const controlled = q?.getAttribute('aria-controls');
        q?.setAttribute('aria-expanded', 'false');
        if (controlled) {
          const panel = document.getElementById(controlled);
          if (panel) panel.hidden = true;
        }
        i.classList.remove('open');
      });

      // Ouvrir si c'était fermé
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        if (answer) answer.hidden = false;
        item.classList.add('open');
      }
    });

    // Navigation clavier
    btn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });
})();

/* ── Recherche enseignants ────────────────────────────────────── */
(function initTeamSearch() {
  const input = document.getElementById('team-search');
  const cards = document.querySelectorAll('.team-card');
  if (!input) return;

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    let visible = 0;
    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      const show = !q || text.includes(q);
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    const noResult = document.getElementById('no-result');
    if (noResult) noResult.style.display = visible === 0 ? 'block' : 'none';
  });
})();