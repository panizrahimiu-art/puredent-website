/* ==========================================================================
   PureDental — interactions
   (no libraries, no build step — plain JavaScript)
   ========================================================================== */
(() => {
  'use strict';

  const SITE = window.SITE_CONFIG || {};
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Site settings (footer contact details) ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  ['phone', 'email', 'address', 'hours'].forEach((key) => {
    const value = (SITE[key] || '').trim();
    const row = $(`[data-site-row="${key}"]`);
    if (!row) return;
    if (!value) return; // stays hidden
    $('[data-site="' + key + '"]', row).textContent = value;
    const link = $('[data-site-link]', row);
    if (link) {
      link.href = link.dataset.siteLink === 'tel'
        ? 'tel:' + value.replace(/[^\d+]/g, '')
        : 'mailto:' + value;
    }
    row.hidden = false;
  });

  /* ---------- Header state, floating button ---------- */
  const header = $('#siteHeader');
  const chatFab = $('#chatFab');
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    chatFab.classList.toggle('show', y > window.innerHeight * 0.6);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const nav = $('#nav');
  const menuBtn = $('#menuBtn');
  const setMenu = (open) => {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menuBtn.firstElementChild.firstElementChild.setAttribute('href', open ? '#i-close' : '#i-menu');
  };
  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  $$('a', nav).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  $('.nav-cta').addEventListener('click', () => setMenu(false));

  /* ---------- Active section in menu + side dots ---------- */
  const navLinks = $$('[data-nav]');
  const sections = $$('[data-section]');
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle('is-active', a.dataset.nav === entry.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  /* ---------- Hero: tooth ↔ anatomy cross-fade + gentle parallax ---------- */
  const stage = $('#heroStage');
  if (stage && !reduceMotion) {
    setInterval(() => stage.classList.toggle('is-anatomy'), 4800);
    const hero = $('#home');
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      hero.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    });
    hero.addEventListener('pointerleave', () => {
      hero.style.setProperty('--mx', 0);
      hero.style.setProperty('--my', 0);
    });
  }

  /* ---------- Services carousel ---------- */
  $$('[data-carousel]').forEach((root) => {
    const track = $('.car-track', root);
    const prev = $('.prev', root);
    const next = $('.next', root);
    const step = () => {
      const card = $('.svc-card', track);
      const gap = parseFloat(getComputedStyle(track).columnGap) || 22;
      return card ? card.getBoundingClientRect().width + gap : 300;
    };
    const update = () => {
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    };
    prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
    track.addEventListener('scroll', update, { passive: true });
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); next.click(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev.click(); }
    });
    window.addEventListener('resize', update);
    update();
  });

  /* ---------- Technology slider ---------- */
  const slider = $('[data-slider]');
  if (slider) {
    const slides = $$('.slide', slider);
    const dots = $$('.tech-dots button');
    let index = 0;
    let timer = null;

    const go = (n) => {
      index = (n + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle('is-active', i === index));
      dots.forEach((d, i) => {
        d.classList.toggle('is-active', i === index);
        d.setAttribute('aria-selected', String(i === index));
      });
    };
    const stop = () => { clearInterval(timer); timer = null; };
    const play = () => {
      if (reduceMotion) return;
      stop();
      timer = setInterval(() => go(index + 1), 5500);
    };

    dots.forEach((d, i) => d.addEventListener('click', () => { go(i); play(); }));
    slider.addEventListener('pointerenter', stop);
    slider.addEventListener('pointerleave', play);
    go(0);
    play();
  }

  /* ---------- 3D tilt on glass cards ---------- */
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    $$('[data-tilt]').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--ry', (px * 10).toFixed(2) + 'deg');
        card.style.setProperty('--rx', (-py * 10).toFixed(2) + 'deg');
      });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---------- Booking modal ---------- */
  const modal = $('#booking');
  const form = $('#bookingForm');
  const note = $('#formNote');
  let lastFocus = null;

  const openModal = () => {
    lastFocus = document.activeElement;
    note.textContent = '';
    note.classList.remove('error');
    modal.hidden = false;
    document.body.classList.add('is-locked');
    setTimeout(() => $('input[name="name"]', modal).focus(), 30);
  };
  const closeModal = () => {
    modal.hidden = true;
    document.body.classList.remove('is-locked');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };

  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-open-booking]');
    if (opener) { e.preventDefault(); openModal(); }
    if (e.target.closest('[data-close]')) closeModal();
  });

  // Keep keyboard focus inside the dialog while it is open
  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const f = $$('button, input, select, textarea, a[href]', modal).filter((el) => !el.disabled && el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  chatFab.addEventListener('click', () => {
    const wa = (SITE.whatsapp || '').replace(/\D/g, '');
    if (wa) window.open('https://wa.me/' + wa, '_blank', 'noopener');
    else openModal();
  });

  // minimum date = today
  const dateInput = $('input[name="date"]', form);
  if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const required = ['name', 'phone'];
    let ok = true;
    required.forEach((k) => {
      const el = form.elements[k];
      const bad = !String(data[k] || '').trim();
      el.classList.toggle('invalid', bad);
      if (bad) ok = false;
    });
    note.classList.toggle('error', !ok);
    if (!ok) { note.textContent = 'Please enter your name and phone number.'; return; }

    const lines = [
      `New consultation request — ${SITE.name || 'PureDental'}`,
      `Name: ${data.name}`,
      `Phone: ${data.phone}`,
      `Treatment: ${data.service}`,
      data.date ? `Preferred date: ${data.date}` : '',
      data.message ? `Message: ${data.message}` : ''
    ].filter(Boolean);
    const text = lines.join('\n');

    const endpoint = (SITE.formEndpoint || '').trim();
    const wa = (SITE.whatsapp || '').replace(/\D/g, '');
    const mail = (SITE.email || '').trim();

    try {
      if (endpoint) {
        note.textContent = 'Sending…';
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Request failed');
        note.textContent = 'Thank you! We will contact you shortly.';
        form.reset();
      } else if (wa) {
        window.open('https://wa.me/' + wa + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
        note.textContent = 'Opening WhatsApp…';
      } else if (mail) {
        window.location.href = 'mailto:' + mail + '?subject=' + encodeURIComponent('Consultation request') + '&body=' + encodeURIComponent(text);
        note.textContent = 'Opening your e-mail app…';
      } else {
        note.classList.add('error');
        note.textContent = 'Booking is not configured yet — see js/config.js.';
      }
    } catch (err) {
      note.classList.add('error');
      note.textContent = 'Something went wrong. Please try again or contact us directly.';
    }
  });

  /* ---------- Search ---------- */
  const INDEX = [
    { t: 'Home', h: '#home', k: 'hero smile begin better' },
    { t: 'Cosmetic Dentistry', h: '#treatments', k: 'veneers bonding smile design aesthetic' },
    { t: 'Dental Implants', h: '#treatments', k: 'implant tooth replacement missing' },
    { t: 'Teeth Whitening', h: '#treatments', k: 'whitening bleaching bright' },
    { t: 'Preventive Care', h: '#treatments', k: 'cleaning checkup prevention hygiene' },
    { t: 'Orthodontics', h: '#treatments', k: 'braces aligners straight' },
    { t: 'Root Canal Therapy', h: '#treatments', k: 'root canal endodontic pain' },
    { t: 'Precision Technology', h: '#technology', k: 'scan 3d digital x-ray imaging' },
    { t: 'Smile Transformation', h: '#about', k: 'about comfort precision personalized care' },
    { t: 'Book a consultation', h: '#contact', k: 'contact booking appointment visit call' }
  ];
  const searchBtn = $('#searchBtn');
  const panel = $('#searchPanel');
  const input = $('#searchInput');
  const results = $('#searchResults');

  const render = (q) => {
    const term = q.trim().toLowerCase();
    const list = term
      ? INDEX.filter((i) => (i.t + ' ' + i.k).toLowerCase().includes(term))
      : INDEX.slice(1, 6);
    results.innerHTML = '';
    if (!list.length) {
      const li = document.createElement('li');
      li.className = 'search-empty';
      li.textContent = 'No results — try “implants”, “whitening” or “contact”.';
      results.appendChild(li);
      return;
    }
    list.forEach((item) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = item.h;
      a.innerHTML = '<span></span><small></small>';
      a.firstChild.textContent = item.t;
      a.lastChild.textContent = item.h.replace('#', '');
      a.addEventListener('click', () => toggleSearch(false));
      li.appendChild(a);
      results.appendChild(li);
    });
  };
  const toggleSearch = (open) => {
    panel.hidden = !open;
    searchBtn.setAttribute('aria-expanded', String(open));
    if (open) { render(''); input.value = ''; setTimeout(() => input.focus(), 20); }
  };
  searchBtn.addEventListener('click', () => toggleSearch(panel.hidden));
  input.addEventListener('input', () => render(input.value));
  $('#searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const first = $('a', results);
    if (first) first.click();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!modal.hidden) closeModal();
    else if (!panel.hidden) { toggleSearch(false); searchBtn.focus(); }
    else if (nav.classList.contains('open')) setMenu(false);
  });
})();
