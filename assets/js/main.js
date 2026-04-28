(() => {
  'use strict';

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

  const body = document.body;
  const brand = body.dataset.brand || 'Severo Web Solutions';
  const whatsPhone = (body.dataset.whats || '5565992376920').replace(/\D/g, '');
  const defaultMessage = `Olá! Quero um orçamento para um site profissional com a ${brand}.`;

  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  const buildWhatsUrl = (message = defaultMessage) => `https://wa.me/${whatsPhone}?text=${encodeURIComponent(message)}`;

  const whatsText = $('#whatsText');
  if (whatsText) whatsText.textContent = `+${whatsPhone}`;

  const wppBtn = $('#wppBtn');
  if (wppBtn) wppBtn.href = buildWhatsUrl();

  const navToggle = $('#navToggle');
  const navMenu = $('#navMenu');

  function closeMenu(){
    if (!navMenu || !navToggle) return;
    navMenu.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.classList.toggle('menu-open', isOpen);
    });

    $$('a', navMenu).forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  }

  const navLinks = $$('.nav__menu a[href^="#"]');
  const sections = navLinks.map(link => $(link.getAttribute('href'))).filter(Boolean);

  function setActiveLink(){
    const position = window.scrollY + 120;
    let current = sections[0]?.id || 'inicio';

    sections.forEach(section => {
      if (section.offsetTop <= position) current = section.id;
    });

    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${current}`));
  }

  window.addEventListener('scroll', setActiveLink, { passive: true });
  setActiveLink();

  const revealItems = $$('.reveal');
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealItems.forEach(item => revealObserver.observe(item));

  const counters = $$('[data-counter]');
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const element = entry.target;
      const target = Number(element.dataset.counter || 0);
      const duration = 1200;
      const start = performance.now();

      function animate(now){
        const progress = Math.min((now - start) / duration, 1);
        const value = Math.floor(progress * target);
        element.textContent = value;
        if (progress < 1) requestAnimationFrame(animate);
        else element.textContent = target;
      }

      requestAnimationFrame(animate);
      counterObserver.unobserve(element);
    });
  }, { threshold: 0.4 });

  counters.forEach(counter => counterObserver.observe(counter));

  const themeToggle = $('#themeToggle');
  const themeKey = 'severo-theme';
  const savedTheme = localStorage.getItem(themeKey);
  if (savedTheme === 'light' || savedTheme === 'dark') document.documentElement.dataset.theme = savedTheme;

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const root = document.documentElement;
      const current = root.dataset.theme || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      localStorage.setItem(themeKey, next);
    });
  }

  const phoneInput = $('input[name="phone"]');
  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      let value = phoneInput.value.replace(/\D/g, '').slice(0, 11);
      if (value.length > 6) value = value.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
      else if (value.length > 2) value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
      else value = value.replace(/^(\d*)/, '($1');
      phoneInput.value = value;
    });
  }

  const form = $('#contactForm');
  if (form) {
    form.addEventListener('submit', event => {
      event.preventDefault();
      const data = new FormData(form);
      if (String(data.get('company') || '').trim()) return;

      const name = String(data.get('name') || '').trim();
      const email = String(data.get('email') || '').trim();
      const phone = String(data.get('phone') || '').trim();
      const project = String(data.get('project') || '').trim();
      const message = String(data.get('message') || '').trim();
      const protocol = Math.floor(10000 + Math.random() * 90000);

      const text = [
        `Olá! Quero solicitar uma proposta com a ${brand}.`,
        '',
        `Protocolo: #${protocol}`,
        `Nome: ${name || '-'}`,
        `E-mail: ${email || '-'}`,
        `WhatsApp: ${phone || '-'}`,
        `Tipo de projeto: ${project || '-'}`,
        '',
        `Mensagem: ${message || defaultMessage}`
      ].join('\n');

      window.location.href = buildWhatsUrl(text);
    });
  }
})();
