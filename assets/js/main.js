(() => {
  "use strict";

  // ===== CONFIG (1 fonte: <body data-...>) =====
  const body = document.body;
  const BRAND = (body?.dataset?.brand || "Severo Web Solutions").trim();
  const WHATS_PHONE = (body?.dataset?.whats || "5565992376920").replace(/\D+/g, "");
  const WHATS_MESSAGE = `Olá! Quero um orçamento para um site profissional (${BRAND}).`;

  const buildWhatsLink = () =>
    "https://api.whatsapp.com/send?phone=" + WHATS_PHONE + "&text=" + encodeURIComponent(WHATS_MESSAGE);

  // ===== SAFE QUERY HELPERS =====
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ===== YEAR =====
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ===== WHATSAPP BTN/TEXT =====
  const wppBtn = $("#wppBtn");
  const whatsText = $("#whatsText");
  const wppLink = buildWhatsLink();

  if (wppBtn && wppBtn.tagName === "A") wppBtn.href = wppLink;
  if (whatsText) whatsText.textContent = "+" + WHATS_PHONE;

  // ===== FORM HIDDEN FIELDS (optional, não confiável sozinho) =====
  const brandField = $("#brandField");
  const whatsPhoneField = $("#whatsPhoneField");
  if (brandField) brandField.value = BRAND;
  if (whatsPhoneField) whatsPhoneField.value = WHATS_PHONE;

  // ===== THEME (auto + manual override) =====
  (() => {
    const root = document.documentElement;
    const key = "theme-preference"; // "light" | "dark" | null
    const saved = localStorage.getItem(key);

    if (saved === "light" || saved === "dark") {
      root.dataset.theme = saved;
    } else {
      delete root.dataset.theme; // segue sistema via CSS
    }

    const btn = $("#themeToggle");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const current = root.dataset.theme;
      const sysDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;

      const next =
        current === "dark" ? "light" :
        current === "light" ? "dark" :
        (sysDark ? "light" : "dark");

      root.dataset.theme = next;
      localStorage.setItem(key, next);
    }, { passive: true });
  })();

  // ===== MOBILE MENU =====
  (() => {
    const navToggle = $("#navToggle");
    const navList = $("#navList");
    if (!navToggle || !navList) return;

    const openMenu = () => {
      navList.classList.add("is-open");
      navToggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    };
    const closeMenu = () => {
      navList.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    };

    navToggle.addEventListener("click", () => {
      const open = navList.classList.contains("is-open");
      open ? closeMenu() : openMenu();
    });

    $$("a", navList).forEach(a => {
      a.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", (e) => {
      const target = e.target;
      const clickedInside = navList.contains(target) || navToggle.contains(target);
      if (!clickedInside && navList.classList.contains("is-open")) closeMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navList.classList.contains("is-open")) closeMenu();
    });
  })();

  // ===== ACTIVE SECTION HIGHLIGHT =====
  (() => {
    const links = $$(".nav__link").filter(a => (a.getAttribute("href") || "").startsWith("#"));
    if (!links.length) return;

    const sections = links
      .map(a => document.querySelector(a.getAttribute("href")))
      .filter(Boolean);

    if (!sections.length) return;

    const setActive = () => {
      let currentId = "#top";
      const y = window.scrollY + 140;

      for (const sec of sections) {
        if (sec.offsetTop <= y) currentId = "#" + sec.id;
      }

      for (const a of links) {
        a.classList.toggle("is-active", a.getAttribute("href") === currentId);
      }
    };

    window.addEventListener("scroll", setActive, { passive: true });
    setActive();
  })();

  // ===== SUCCESS MESSAGE (?sent=1) =====
  (() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("sent") === "1") {
      const sentMsg = $("#sentMsg");
      if (sentMsg) sentMsg.style.display = "block";
    }
  })();


  // ===== CONTACT FORM -> WHATSAPP (sem PHP) =====
  (() => {
    const form = $("#contactForm") || $(".contact__form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const fd = new FormData(form);

      // Honeypot anti-spam
      const hp = String(fd.get("company") || "").trim();
      if (hp) return;

      const fullName = String(fd.get("name") || "").trim();
      const firstName = fullName.split(/\s+/).filter(Boolean)[0] || "Olá";
      const email = String(fd.get("email") || "").trim();
      const phone = String(fd.get("phone") || "").trim();

      let msg = String(fd.get("message") || "").trim();
      if (!msg) msg = `Quero um orçamento para um site profissional (${BRAND}).`;

      // Protocolo simples (5 dígitos) para facilitar o atendimento
      const protocol = String(Math.floor(10000 + Math.random() * 90000));

      const text =
        `Olá! Meu nome é ${firstName}.\n\n` +
        `📝 Mensagem:\n${msg}\n\n` +
        
        `🧾 Protocolo: ${protocol}\n` +
        `👤 Nome: ${fullName || "—"}\n` +
        `📧 Email: ${email || "—"}\n` +
        `📱 WhatsApp: ${phone || "—"}\n\n` + 
        `Enviado via ${BRAND}.`;

      const url = `https://wa.me/${WHATS_PHONE}?text=${encodeURIComponent(text)}`;
      window.location.href = url;
    });
  })();

})();
