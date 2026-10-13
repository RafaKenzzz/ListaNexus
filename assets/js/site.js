/* =========================================================================
   ECLIPSE — site interactions
   Vanilla JS, no dependencies. Progressive enhancement only.
   ========================================================================= */
(function () {
  "use strict";

  var doc = document;
  var $ = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header: solid on scroll ---------------------------------- */
  var header = $(".site-header");
  if (header) {
    var onScrollHeader = function () {
      if (window.scrollY > 24) header.classList.add("is-solid");
      else header.classList.remove("is-solid");
    };
    onScrollHeader();
    window.addEventListener("scroll", onScrollHeader, { passive: true });
  }

  /* ---------- Mobile navigation ---------------------------------------- */
  var toggle = $(".nav-toggle");
  var mobileNav = $("#mobile-nav");
  if (toggle && mobileNav) {
    var setNav = function (open) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      mobileNav.classList.toggle("is-open", open);
      doc.body.classList.toggle("nav-open", open);
      if (open) mobileNav.removeAttribute("hidden");
    };
    toggle.addEventListener("click", function () {
      setNav(toggle.getAttribute("aria-expanded") !== "true");
    });
    mobileNav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setNav(false);
    });
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setNav(false);
        toggle.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1024 && toggle.getAttribute("aria-expanded") === "true") setNav(false);
    });
  }

  /* ---------- Reveal on scroll ----------------------------------------- */
  var revealEls = $$("[data-reveal]");
  if (revealEls.length) {
    if (prefersReduced || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) { el.classList.add("is-in"); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
      revealEls.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------- Accordions ----------------------------------------------- */
  $$(".acc__trigger").forEach(function (btn) {
    var panel = doc.getElementById(btn.getAttribute("aria-controls"));
    if (!panel) return;
    panel.style.height = "0px";
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      // close siblings in same group
      var group = btn.closest(".acc");
      if (group && !open) {
        $$(".acc__trigger", group).forEach(function (other) {
          if (other !== btn && other.getAttribute("aria-expanded") === "true") {
            other.setAttribute("aria-expanded", "false");
            var op = doc.getElementById(other.getAttribute("aria-controls"));
            if (op) op.style.height = "0px";
          }
        });
      }
      btn.setAttribute("aria-expanded", open ? "false" : "true");
      panel.style.height = open ? "0px" : panel.scrollHeight + "px";
    });
    // keep height correct if content reflows
    window.addEventListener("resize", function () {
      if (btn.getAttribute("aria-expanded") === "true") panel.style.height = panel.scrollHeight + "px";
    });
  });

  /* ---------- Ticker: duplicate track for seamless loop ---------------- */
  $$(".ticker__track").forEach(function (track) {
    track.innerHTML += track.innerHTML;
  });

  /* ---------- Gallery lightbox ----------------------------------------- */
  var lightbox = $("#lightbox");
  if (lightbox) {
    var lbImg = $(".lightbox__fig img", lightbox);
    var lbCap = $(".lightbox__cap", lightbox);
    var lastFocus = null;
    var close = function () {
      lightbox.classList.remove("is-open");
      if (lastFocus) lastFocus.focus();
    };
    $$(".gallery__item").forEach(function (item) {
      item.addEventListener("click", function () {
        var img = $("img", item);
        if (!img) return;
        lbImg.src = img.getAttribute("data-full") || img.src;
        lbImg.alt = img.alt || "";
        lbCap.textContent = img.getAttribute("data-caption") || img.alt || "";
        lightbox.classList.add("is-open");
        lastFocus = item;
        $(".lightbox__close", lightbox).focus();
      });
      item.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); item.click(); }
      });
    });
    $(".lightbox__close", lightbox).addEventListener("click", close);
    lightbox.addEventListener("click", function (e) { if (e.target === lightbox) close(); });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  }

  /* ---------- Forms (AJAX submit via FormSubmit) ----------------------- */
  $$("form[data-ajax]").forEach(function (form) {
    var endpoint = form.getAttribute("action");
    var btn = form.querySelector('button[type="submit"]');
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = $(".form-status", form) ||
        (form.nextElementSibling && form.nextElementSibling.classList.contains("form-status") ? form.nextElementSibling : null) ||
        (form.parentElement ? form.parentElement.querySelector(".form-status") : null);
      var ok = true;
      $$("[required]", form).forEach(function (f) {
        if (f.type === "checkbox") { if (!f.checked) ok = false; }
        else if (!f.value.trim()) { ok = false; }
      });
      var email = $('input[type="email"]', form);
      if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) ok = false;
      if (!status) return;
      if (!ok) {
        status.className = "form-status is-visible form-status--err";
        status.textContent = "Verifica os campos obrigatórios (e o formato do email) antes de enviar.";
        status.focus();
        return;
      }
      if (!endpoint || !window.fetch) { form.submit(); return; }
      var label = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "A enviar…"; }
      status.className = "form-status is-visible";
      status.textContent = "A enviar…";
      fetch(endpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (r) { return r.json().catch(function () { return {}; }); })
        .then(function (res) {
          if (res && (res.success === true || res.success === "true")) {
            status.className = "form-status is-visible form-status--ok";
            status.textContent = "Obrigado! Recebemos a tua mensagem. A equipa Eclipse responde em 1 a 2 dias úteis.";
            form.reset();
          } else {
            status.className = "form-status is-visible form-status--err";
            status.textContent = "Não foi possível enviar agora. Escreve-nos para eclipse.extp@gmail.com.";
          }
        })
        .catch(function () {
          status.className = "form-status is-visible form-status--err";
          status.textContent = "Não foi possível enviar agora. Escreve-nos para eclipse.extp@gmail.com.";
        })
        .then(function () {
          if (btn) { btn.disabled = false; btn.textContent = label; }
          status.focus();
        });
    });
  });

  /* ---------- Back to top ---------------------------------------------- */
  var toTop = $(".to-top");
  if (toTop) {
    var onScrollTop = function () {
      toTop.classList.toggle("is-visible", window.scrollY > 700);
    };
    onScrollTop();
    window.addEventListener("scroll", onScrollTop, { passive: true });
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    });
  }

  /* ---------- Footer year ---------------------------------------------- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Cookie consent (RGPD) ------------------------------------ */
  var STORAGE_KEY = "eclipse.consent.v1";
  var banner = $("#cookie-banner");
  if (banner) {
    var prefs = $("#cookie-prefs");
    var readConsent = function () {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (err) { return null; }
    };
    var applyConsent = function (consent) {
      // Hook point for analytics / embeds. Nothing third-party is loaded
      // until consent is granted.
      window.eclipseConsent = consent;
    };
    var save = function (consent) {
      consent.date = new Date().toISOString();
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(consent)); } catch (err) {}
      applyConsent(consent);
      banner.classList.remove("is-visible");
      banner.setAttribute("aria-hidden", "true");
    };
    var openBanner = function () {
      var c = readConsent();
      if (c) {
        $("#pref-analytics") && ($("#pref-analytics").checked = !!c.analytics);
        $("#pref-preferences") && ($("#pref-preferences").checked = !!c.preferences);
      }
      banner.classList.add("is-visible");
      banner.removeAttribute("aria-hidden");
    };

    var stored = readConsent();
    if (stored) { applyConsent(stored); }
    else { setTimeout(openBanner, 700); }

    $("#cookie-accept") && $("#cookie-accept").addEventListener("click", function () {
      save({ necessary: true, analytics: true, preferences: true });
    });
    $("#cookie-reject") && $("#cookie-reject").addEventListener("click", function () {
      save({ necessary: true, analytics: false, preferences: false });
    });
    $("#cookie-open-prefs") && $("#cookie-open-prefs").addEventListener("click", function () {
      if (prefs) prefs.classList.toggle("is-open");
    });
    $("#cookie-save") && $("#cookie-save").addEventListener("click", function () {
      save({
        necessary: true,
        analytics: !!($("#pref-analytics") && $("#pref-analytics").checked),
        preferences: !!($("#pref-preferences") && $("#pref-preferences").checked)
      });
    });
    // Re-open preferences from anywhere on the site
    $$("[data-open-cookie]").forEach(function (el) {
      el.addEventListener("click", function (e) { e.preventDefault(); openBanner(); if (prefs) prefs.classList.add("is-open"); });
    });
  }
})();
