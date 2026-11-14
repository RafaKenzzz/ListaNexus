(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var $ = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var CFG = window.ECLIPSE || {};

  window.__ecl = true;
  root.classList.add("js");

  /* ---------- Cabeçalho: sólido ao descer, esconde ao descer depressa ---------- */
  var header = $("[data-hdr]");
  var dock = $("[data-dock]");
  var footer = $(".site-footer");
  var bar = $(".progress");
  var lastY = window.scrollY;
  var onScroll = function () {
    var y = window.scrollY;
    var busy = doc.body.classList.contains("menu-open");
    if (header) {
      header.classList.toggle("is-solid", y > 24);
      if (!busy && y > 500 && y > lastY + 6) header.classList.add("is-hidden");
      if (y < lastY - 6 || y <= 500) header.classList.remove("is-hidden");
    }
    if (dock) {
      var nearEnd = footer && footer.getBoundingClientRect().top < window.innerHeight;
      dock.classList.toggle("is-on", y > window.innerHeight * 0.75 && !nearEnd && !busy);
    }
    if (bar) {
      var max = root.scrollHeight - window.innerHeight;
      bar.style.setProperty("--sp", max > 0 ? (y / max).toFixed(4) : 0);
    }
    lastY = y;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- Formulários no telemóvel: a barra fixa sai do caminho enquanto se escreve ---------- */
  var isField = function (el) { return el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) && el.type !== "checkbox" && el.type !== "radio"; };
  doc.addEventListener("focusin", function (e) { if (isField(e.target)) doc.body.classList.add("typing"); });
  doc.addEventListener("focusout", function (e) { if (isField(e.target)) doc.body.classList.remove("typing"); });

  /* ---------- Menu móvel ---------- */
  var burger = $(".burger");
  if (burger) {
    var setMenu = function (open) {
      doc.body.classList.toggle("menu-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Fechar menu de navegação" : "Abrir menu de navegação");
      if (header) header.classList.remove("is-hidden");
      if (dock) dock.classList.remove("is-on");
    };
    burger.addEventListener("click", function () { setMenu(!doc.body.classList.contains("menu-open")); });
    $$(".mmenu a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && doc.body.classList.contains("menu-open")) { setMenu(false); burger.focus(); }
    });
    window.addEventListener("resize", function () { if (window.innerWidth > 1100) setMenu(false); });
  }

  /* ---------- Entradas ao fazer scroll (em cascata, por grupo que entra junto) ---------- */
  var revealables = $$(".rv, .rv-img, .lines, .mark-anim, .step");
  if (revealables.length) {
    if (!("IntersectionObserver" in window)) {
      revealables.forEach(function (el) { el.classList.add("is-in"); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        var k = 0;
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          if (!el.style.getPropertyValue("--d")) el.style.setProperty("--d", Math.min(k, 8) * 70 + "ms");
          k++;
          el.classList.add("is-in");
          io.unobserve(el);
        });
      }, { rootMargin: "0px 0px -7% 0px", threshold: 0.06 });
      revealables.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------- Números que contam até ao valor ---------- */
  var counters = $$("[data-count]");
  if (counters.length && "IntersectionObserver" in window && !reduceMotion) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        cio.unobserve(en.target);
        var el = en.target, end = +el.getAttribute("data-count"), t0 = null, dur = 1400;
        var step = function (t) {
          if (!t0) t0 = t;
          var p = Math.min(1, (t - t0) / dur);
          el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        };
        el.textContent = "0";
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- Manifesto: as palavras acendem com o scroll ---------- */
  $$("[data-words]").forEach(function (box) {
    if (reduceMotion) return;
    var words = box.textContent.trim().split(/\s+/);
    box.textContent = "";
    words.forEach(function (w, i) {
      var s = doc.createElement("span");
      s.className = "w8";
      s.textContent = w;
      box.appendChild(s);
      if (i < words.length - 1) box.appendChild(doc.createTextNode(" "));
    });
    var ws = $$(".w8", box);
    var ticking = false;
    var paint = function () {
      var r = box.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = (vh * 0.86 - r.top) / (r.height + vh * 0.36);
      p = Math.max(0, Math.min(1, p));
      var n = Math.round(p * ws.length);
      ws.forEach(function (w, i) { w.classList.toggle("on", i < n); });
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(paint); }
    }, { passive: true });
    paint();
  });

  /* ---------- Faixa contínua ---------- */
  $$(".marquee__track").forEach(function (track) {
    var html = track.innerHTML;
    track.innerHTML = html + html + html + html;
  });

  /* ---------- Assistente: o que mudavas primeiro na escola? ---------- */
  $$("[data-finder]").forEach(function (finder) {
    var cards = $$(".eixo-card", finder);
    var inputs = $$("input[name=eixo]", finder);
    if (!cards.length || !inputs.length) return;
    var show = function (val) {
      cards.forEach(function (c) { c.classList.toggle("is-on", c.getAttribute("data-eixo") === val); });
    };
    finder.classList.add("is-live");
    var checked = inputs.filter(function (i) { return i.checked; })[0] || inputs[0];
    checked.checked = true;
    show(checked.value);
    finder.addEventListener("change", function (e) {
      if (e.target && e.target.name === "eixo") show(e.target.value);
    });
    var form = $("form", finder);
    if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });
  });

  /* ---------- Dia de votação e contagem decrescente ---------- */
  var months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  if (CFG.voteDate) {
    $$("[data-vote-date]").forEach(function (el) { el.textContent = CFG.voteDate; });
  }
  if (CFG.campaign) {
    $$("[data-campaign]").forEach(function (el) { el.textContent = CFG.campaign; });
  }
  if (CFG.voteStart) {
    var voteDay = new Date(CFG.voteStart);
    if (!isNaN(voteDay.getTime())) {
      $$("[data-vote-day]").forEach(function (el) { el.textContent = voteDay.getDate(); });
      $$("[data-vote-month]").forEach(function (el) { el.textContent = months[voteDay.getMonth()]; });
    }
  }
  if (CFG.campaignStart) {
    var campA = new Date(CFG.campaignStart + "T12:00:00");
    var campB = new Date((CFG.campaignEnd || CFG.campaignStart) + "T12:00:00");
    if (!isNaN(campA.getTime()) && !isNaN(campB.getTime())) {
      $$("[data-campaign-days]").forEach(function (el) { el.textContent = campA.getDate() + (campB > campA ? "–" + campB.getDate() : ""); });
      $$("[data-campaign-month]").forEach(function (el) { el.textContent = months[campA.getMonth()]; });
    }
  }
  var countBox = $("[data-countdown]");
  if (countBox && CFG.voteStart) {
    var start = new Date(CFG.voteStart).getTime();
    var end = CFG.voteEnd ? new Date(CFG.voteEnd).getTime() : start;
    var nowMsg = $("[data-vote-now]");
    var cells = {
      d: $("[data-cd=d]", countBox), h: $("[data-cd=h]", countBox),
      m: $("[data-cd=m]", countBox), s: $("[data-cd=s]", countBox)
    };
    var pad = function (n) { return n < 10 ? "0" + n : "" + n; };
    var timer;
    var tick = function () {
      var now = Date.now();
      if (isNaN(start) || now > end) {
        countBox.hidden = true;
        if (nowMsg) nowMsg.hidden = true;
        clearInterval(timer);
        return;
      }
      if (now >= start) {
        countBox.hidden = true;
        if (nowMsg) nowMsg.hidden = false;
        return;
      }
      var left = Math.floor((start - now) / 1000);
      if (cells.d) cells.d.textContent = Math.floor(left / 86400);
      if (cells.h) cells.h.textContent = pad(Math.floor(left % 86400 / 3600));
      if (cells.m) cells.m.textContent = pad(Math.floor(left % 3600 / 60));
      if (cells.s) cells.s.textContent = pad(left % 60);
      countBox.hidden = false;
    };
    tick();
    timer = setInterval(tick, 1000);
  }

  /* ---------- Herói: o eclipse desloca-se devagar com o scroll ---------- */
  var eclipse = $("[data-eclipse]");
  if (eclipse && finePointer && !reduceMotion) {
    var eTick = false;
    var move = function () {
      var y = window.scrollY;
      if (y < window.innerHeight * 1.3) eclipse.style.transform = "translate3d(0," + (y * 0.2).toFixed(1) + "px,0)";
      eTick = false;
    };
    window.addEventListener("scroll", function () {
      if (!eTick) { eTick = true; requestAnimationFrame(move); }
    }, { passive: true });
  }

  /* ---------- Padrão em movimento lento só quando está visível ---------- */
  if (!reduceMotion && "IntersectionObserver" in window) {
    var tio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { en.target.classList.toggle("is-moving", en.isIntersecting); });
    });
    $$("[data-tiles]").forEach(function (el) { tio.observe(el); });
  }

  /* ---------- Vidro: o brilho segue o rato ---------- */
  if (finePointer) {
    $$(".vote, .note, .facts, .phero-meta, .finder__q, .sec--ink .card--ink").forEach(function (el) {
      el.classList.add("spot");
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--mx", (e.clientX - r.left).toFixed(0) + "px");
        el.style.setProperty("--my", (e.clientY - r.top).toFixed(0) + "px");
      });
    });
  }

  /* ---------- Partilhar o site com a turma ---------- */
  $$("[data-share]").forEach(function (b) {
    var label = b.textContent;
    var site = location.href.replace(/[^/]*([?#].*)?$/, "");
    var flash = function (msg) { b.textContent = msg; setTimeout(function () { b.textContent = label; }, 2400); };
    b.hidden = false;
    b.addEventListener("click", function () {
      if (navigator.share) {
        navigator.share({ title: "Eclipse — Lista E", text: "Eclipse, a Lista E à Associação de Estudantes do Externato de Penafirme. Vê o programa:", url: site }).catch(function () {});
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(site).then(function () { flash("Ligação copiada"); }, function () { flash(site); });
      } else {
        flash(site);
      }
    });
  });

  /* ---------- Dia de votação no calendário (.ics) ---------- */
  var icsBtns = $$("[data-vote-ics]");
  if (icsBtns.length && CFG.voteStart && window.Blob && window.URL && URL.createObjectURL) {
    var icsStart = new Date(CFG.voteStart);
    var icsEnd = new Date(CFG.voteEnd || CFG.voteStart);
    if (!isNaN(icsStart.getTime()) && icsEnd.getTime() > Date.now()) {
      var two = function (n) { return (n < 10 ? "0" : "") + n; };
      var stamp = function (d) { return d.getFullYear() + two(d.getMonth() + 1) + two(d.getDate()) + "T" + two(d.getHours()) + two(d.getMinutes()) + "00"; };
      var ics = [
        "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Eclipse//Lista E//PT", "BEGIN:VEVENT",
        "UID:votacao-ae-" + stamp(icsStart) + "@eclipse-lista-e",
        "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z",
        "DTSTART:" + stamp(icsStart), "DTEND:" + stamp(icsEnd),
        "SUMMARY:Votação para a Associação de Estudantes — Vota E (Eclipse)",
        "LOCATION:Biblioteca do Externato de Penafirme",
        "DESCRIPTION:Leva o cartão de estudante. A tua escolha é a Lista E.",
        "BEGIN:VALARM", "TRIGGER:-PT30M", "ACTION:DISPLAY", "DESCRIPTION:Hoje é dia de votar na Lista E", "END:VALARM",
        "END:VEVENT", "END:VCALENDAR"
      ].join("\r\n");
      icsBtns.forEach(function (b) {
        b.hidden = false;
        b.addEventListener("click", function () {
          var a = doc.createElement("a");
          a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
          a.download = "votacao-lista-e.ics";
          doc.body.appendChild(a);
          a.click();
          a.remove();
        });
      });
    }
  }

  /* ---------- Galeria ---------- */
  var lightbox = $("#lightbox");
  if (lightbox) {
    var lbImg = $(".lightbox__fig img", lightbox);
    var lbCap = $(".lightbox__cap", lightbox);
    var lbClose = $(".lightbox__close", lightbox);
    var lastFocus = null;
    var closeLb = function () {
      if (!lightbox.classList.contains("is-open")) return;
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
        lbClose.focus();
      });
      item.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); item.click(); }
      });
    });
    lbClose.addEventListener("click", closeLb);
    lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLb(); });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLb(); });
  }

  /* ---------- Formulários (FormSubmit) ---------- */
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
            status.textContent = "Obrigado! Recebemos a tua mensagem. A equipa Eclipse responde num prazo de 1 a 2 dias úteis.";
            form.reset();
          } else {
            status.className = "form-status is-visible form-status--err";
            status.textContent = "Não foi possível enviar agora. Tenta novamente daqui a um minuto ou escreve-nos diretamente para eclipse.extp@gmail.com.";
          }
        })
        .catch(function () {
          status.className = "form-status is-visible form-status--err";
          status.textContent = "Não foi possível enviar agora. Verifica a ligação à internet e tenta outra vez, ou escreve-nos para eclipse.extp@gmail.com.";
        })
        .then(function () {
          if (btn) { btn.disabled = false; btn.textContent = label; }
          status.focus();
        });
    });
  });

  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Consentimento de cookies ---------- */
  var STORAGE_KEY = "eclipse.consent.v1";
  var banner = $("#cookie-banner");
  if (banner) {
    var prefs = $("#cookie-prefs");
    var readConsent = function () {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (err) { return null; }
    };
    var applyConsent = function (consent) { window.eclipseConsent = consent; };
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
        if ($("#pref-analytics")) $("#pref-analytics").checked = !!c.analytics;
        if ($("#pref-preferences")) $("#pref-preferences").checked = !!c.preferences;
      }
      banner.classList.add("is-visible");
      banner.removeAttribute("aria-hidden");
    };

    var stored = readConsent();
    if (stored) { applyConsent(stored); }
    else { setTimeout(openBanner, 1400); }

    if ($("#cookie-accept")) $("#cookie-accept").addEventListener("click", function () {
      save({ necessary: true, analytics: true, preferences: true });
    });
    if ($("#cookie-reject")) $("#cookie-reject").addEventListener("click", function () {
      save({ necessary: true, analytics: false, preferences: false });
    });
    if ($("#cookie-open-prefs")) $("#cookie-open-prefs").addEventListener("click", function () {
      if (prefs) prefs.classList.toggle("is-open");
    });
    if ($("#cookie-save")) $("#cookie-save").addEventListener("click", function () {
      save({
        necessary: true,
        analytics: !!($("#pref-analytics") && $("#pref-analytics").checked),
        preferences: !!($("#pref-preferences") && $("#pref-preferences").checked)
      });
    });

    $$("[data-open-cookie]").forEach(function (el) {
      el.addEventListener("click", function (e) { e.preventDefault(); openBanner(); if (prefs) prefs.classList.add("is-open"); });
    });
  }
})();
