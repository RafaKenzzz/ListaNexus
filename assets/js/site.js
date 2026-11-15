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

  /* ---------- Céu do topo: estrelas a cintilar, profundidade com o rato e o scroll, estrelas cadentes ----------
     Desenhado num <canvas> só enquanto está visível. Com movimento reduzido fica um céu parado.
     O eclipse (fotografia) acompanha o rato e o scroll; a Lua fica sempre escura, sem estrelas por cima. */
  var SKY_COLORS = ["230 241 255", "230 241 255", "230 241 255", "230 241 255", "184 228 248", "255 227 163"];
  var skySprites = null;
  var makeSprite = function (cross) {
    var c = doc.createElement("canvas");
    c.width = c.height = 64;
    var x = c.getContext("2d");
    var g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(cross ? 0.1 : 0.2, "rgba(225,240,255,.6)");
    g.addColorStop(0.5, "rgba(184,228,248,.1)");
    g.addColorStop(1, "rgba(184,228,248,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 64, 64);
    if (cross) {   // os quatro raios da estrela do logótipo
      x.globalCompositeOperation = "lighter";
      [[0, 31.3, 64, 1.4, 64, 0], [31.3, 0, 1.4, 64, 0, 64]].forEach(function (b) {
        var l = x.createLinearGradient(0, 0, b[4], b[5]);
        l.addColorStop(0, "rgba(255,255,255,0)");
        l.addColorStop(0.5, "rgba(255,255,255,.95)");
        l.addColorStop(1, "rgba(255,255,255,0)");
        x.fillStyle = l;
        x.fillRect(b[0], b[1], b[2], b[3]);
      });
    }
    return c;
  };
  var sky = function (host) {
    var cv = doc.createElement("canvas");
    var ctx = cv.getContext && cv.getContext("2d");
    if (!ctx) return;
    cv.className = "sky";
    cv.setAttribute("aria-hidden", "true");
    cv.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;z-index:-2;pointer-events:none";
    host.insertBefore(cv, host.firstChild);
    host.classList.add("has-sky");
    if (!skySprites) skySprites = { glow: makeSprite(false), cross: makeSprite(true) };
    var ecl = $("[data-eclipse], .endpage__eclipse", host);
    var moveEcl = ecl && finePointer && !reduceMotion;
    var scrolls = !host.classList.contains("endpage");
    var W = 0, H = 0, stars = [], shots = [];
    var t0 = 0, last = 0, nextShot = 2.2, running = false, visible = false, raf = 0;
    var px = 0, py = 0, ex = 0, ey = 0;

    var build = function () {
      var n = Math.round(Math.min(700, Math.max(140, W * H / 1900)));
      stars = [];
      for (var i = 0; i < n; i++) {
        var z = Math.pow(Math.random(), 2.4);   // a maioria fica ao longe, pequena e ténue
        stars.push({
          u: Math.random(), v: Math.random(), z: z, r: 0.3 + z * 1.15, a: 0.25 + z * 0.7,
          sp: 0.5 + Math.random() * 2.2, ph: Math.random() * 6.283, d: 0.1 + Math.random() * 1.3,
          c: SKY_COLORS[(Math.random() * SKY_COLORS.length) | 0], k: z > 0.93 ? 6 + z * 9 : 0
        });
      }
      stars.sort(function (a, b) { return a.c < b.c ? -1 : a.c > b.c ? 1 : 0; });
    };
    var moon = function () {
      if (!ecl) return null;
      var a = ecl.getBoundingClientRect(), b = host.getBoundingClientRect();
      if (!a.width) return null;
      return { x: a.left - b.left + a.width * 0.498, y: a.top - b.top + a.height * 0.524, r: a.width * 0.2585 };
    };
    var draw = function (t, dt) {
      var sy = scrolls ? Math.min(window.scrollY, H) : 0;
      var m = moon();
      var col = "";
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = 1;
      if (m) {   // a Lua tapa a nebulosa de trás
        ctx.fillStyle = "#060a1f";
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r * 0.99, 0, 6.2832);
        ctx.fill();
      }
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var fade = reduceMotion ? 1 : Math.min(1, Math.max(0, (t - s.d) / 0.9));
        if (!fade) continue;
        var tw = reduceMotion ? 0.8 : 0.62 + 0.38 * Math.sin(t * s.sp + s.ph);
        var x = s.u * W - ex * 22 * s.z;
        var y = s.v * H - ey * 16 * s.z + sy * 0.32 * (1 - s.z);
        x = ((x % W) + W) % W;
        y = ((y % H) + H) % H;
        if (m) { var dx = x - m.x, dy = y - m.y; if (dx * dx + dy * dy < m.r * m.r * 1.1) continue; }
        ctx.globalAlpha = s.a * tw * fade;
        if (s.k) {
          var k = s.k * (0.75 + 0.35 * tw);
          ctx.drawImage(skySprites.cross, x - k, y - k, k * 2, k * 2);
          continue;
        }
        if (s.c !== col) { col = s.c; ctx.fillStyle = "rgb(" + col + ")"; }
        if (s.r < 1) ctx.fillRect(x - s.r, y - s.r, s.r * 2, s.r * 2);
        else { ctx.beginPath(); ctx.arc(x, y, s.r, 0, 6.2832); ctx.fill(); }
      }
      if (!reduceMotion) {
        if (t > nextShot) {   // estrela cadente, de cima para baixo e da direita para a esquerda
          nextShot = t + 4 + Math.random() * 5;
          var ang = (146 + Math.random() * 16) * Math.PI / 180, spd = 900 + Math.random() * 600;
          shots.push({ x: W * (0.35 + Math.random() * 0.7), y: H * Math.random() * 0.35 - 20, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, len: 140 + Math.random() * 160, life: 0.8 + Math.random() * 0.5, age: 0 });
        }
        for (var j = shots.length - 1; j >= 0; j--) {
          var o = shots[j];
          o.age += dt;
          if (o.age > o.life) { shots.splice(j, 1); continue; }
          var p = o.age / o.life, al = p < 0.15 ? p / 0.15 : 1 - (p - 0.15) / 0.85;
          var hx = o.x + o.vx * o.age, hy = o.y + o.vy * o.age;
          var sp = Math.sqrt(o.vx * o.vx + o.vy * o.vy), len = o.len * Math.min(1, o.age / 0.18);
          var tx = hx - o.vx / sp * len, ty = hy - o.vy / sp * len;
          var g = ctx.createLinearGradient(hx, hy, tx, ty);
          g.addColorStop(0, "rgba(255,255,255," + al.toFixed(3) + ")");
          g.addColorStop(0.3, "rgba(184,228,248," + (al * 0.45).toFixed(3) + ")");
          g.addColorStop(1, "rgba(184,228,248,0)");
          ctx.globalAlpha = 1;
          ctx.strokeStyle = g;
          ctx.lineWidth = 1.6;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(hx, hy);
          ctx.lineTo(tx, ty);
          ctx.stroke();
          ctx.globalAlpha = al;
          ctx.drawImage(skySprites.glow, hx - 9, hy - 9, 18, 18);
        }
      }
      ctx.globalAlpha = 1;
    };
    var loop = function (now) {
      raf = 0;
      if (!running) return;
      if (!t0) t0 = now - last * 1000;
      var t = (now - t0) / 1000, dt = Math.min(0.05, Math.max(0, t - last));
      last = t;
      ex += (px - ex) * 0.06;
      ey += (py - ey) * 0.06;
      if (moveEcl) {
        var ey2 = (scrolls ? Math.min(window.scrollY, H) * 0.2 : 0) - ey * 13;
        ecl.style.transform = "translate3d(" + (-ex * 18).toFixed(1) + "px," + ey2.toFixed(1) + "px,0)";
      }
      draw(t, dt);
      raf = requestAnimationFrame(loop);
    };
    var start = function () {
      if (running || reduceMotion || !W) return;
      running = true;
      t0 = 0;
      raf = requestAnimationFrame(loop);
    };
    var stop = function () {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    var size = function () {
      var w = host.clientWidth, h = host.clientHeight;
      if (!w || !h) return;
      var dpr = Math.min(window.devicePixelRatio || 1, w * h > 1e6 ? 1.5 : 2);
      var rebuild = !stars.length || Math.abs(w - W) > W * 0.2;
      W = w;
      H = h;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (rebuild) build();
      if (reduceMotion || (last && !running)) draw(last || 99, 0);
      if (visible && !doc.hidden) start();
    };
    if ("ResizeObserver" in window) new ResizeObserver(size).observe(host);
    else window.addEventListener("resize", size);
    size();
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        visible = en[en.length - 1].isIntersecting;
        if (visible && !doc.hidden) start(); else stop();
      }).observe(host);
    } else { visible = true; start(); }
    doc.addEventListener("visibilitychange", function () {
      if (doc.hidden) stop(); else if (visible) start();
    });
    if (moveEcl || (finePointer && !reduceMotion)) {
      host.addEventListener("pointermove", function (e) {
        px = e.clientX / window.innerWidth * 2 - 1;
        py = e.clientY / window.innerHeight * 2 - 1;
      });
      host.addEventListener("pointerleave", function () { px = 0; py = 0; });
    }
  };
  $$(".hero, .phero:not(.phero--photo), .endpage").forEach(sky);

  /* ---------- Padrão em movimento lento só quando está visível ---------- */
  if (!reduceMotion && "IntersectionObserver" in window) {
    var tio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { en.target.classList.toggle("is-moving", en.isIntersecting); });
    });
    $$("[data-tiles]").forEach(function (el) { tio.observe(el); });
  }

  /* ---------- Vídeos: só toca um de cada vez ---------- */
  doc.addEventListener("play", function (e) {
    if (!e.target || e.target.tagName !== "VIDEO") return;
    $$("video").forEach(function (v) { if (v !== e.target && !v.paused) v.pause(); });
  }, true);

  /* ---------- Vídeos (página inicial e de apoio): capa com play e duração; os controlos só aparecem depois de começar ---------- */
  var PLAY_SVG = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5-13-7.5Z"/></svg>';
  $$(".video video").forEach(function (v) {
    var fig = v.closest(".video");
    var h = $("h3", fig);
    var btn = doc.createElement("button");
    btn.type = "button";
    btn.className = "video__start";
    btn.setAttribute("aria-label", "Ver o vídeo" + (h ? " de " + h.textContent.trim() : ""));
    btn.innerHTML = '<span class="video__time" hidden></span><span class="video__start-ic">' + PLAY_SVG + "</span>";
    v.removeAttribute("controls");
    v.parentNode.appendChild(btn);
    var time = $(".video__time", btn);
    var showTime = function () {
      if (!isFinite(v.duration) || !v.duration) return;
      var s = Math.round(v.duration);
      time.textContent = Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2);
      time.hidden = false;
    };
    if (v.readyState >= 1) showTime();
    v.addEventListener("loadedmetadata", showTime);
    v.addEventListener("play", function () { v.controls = true; fig.classList.add("is-playing"); });
    v.addEventListener("ended", function () { v.controls = false; fig.classList.remove("is-playing"); v.load(); });
    btn.addEventListener("click", function () {
      v.controls = true;
      fig.classList.add("is-playing");
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
      v.focus({ preventScroll: true });
    });
  });

  /* Pausa o vídeo quando sai do ecrã (por exemplo, ao deslizar para o seguinte) */
  if ("IntersectionObserver" in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (!en.isIntersecting && !en.target.paused) en.target.pause(); });
    }, { threshold: 0.35 });
    $$(".video video").forEach(function (v) { vio.observe(v); });
  }

  /* Telemóvel: pontos por baixo da fila de vídeos, que mostram onde se está e levam a cada vídeo */
  $$(".video-grid--tall").forEach(function (vg) {
    var cards = $$(".video", vg);
    if (cards.length < 2) return;
    var nav = doc.createElement("div");
    nav.className = "video-dots";
    var dots = cards.map(function (c, i) {
      var b = doc.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Vídeo " + (i + 1) + " de " + cards.length);
      b.addEventListener("click", function () {
        vg.scrollTo({ left: c.getBoundingClientRect().left - cards[0].getBoundingClientRect().left, behavior: reduceMotion ? "auto" : "smooth" });
      });
      nav.appendChild(b);
      return b;
    });
    vg.parentNode.insertBefore(nav, vg.nextSibling);
    var cur = -1, tick = false;
    var update = function () {
      tick = false;
      var step = cards[1].getBoundingClientRect().left - cards[0].getBoundingClientRect().left;
      if (!step) return;
      var i = vg.scrollLeft >= vg.scrollWidth - vg.clientWidth - 2 ? cards.length - 1 : Math.round(vg.scrollLeft / step);
      i = Math.max(0, Math.min(cards.length - 1, i));
      if (i === cur) return;
      if (cur > -1) dots[cur].removeAttribute("aria-current");
      dots[i].setAttribute("aria-current", "true");
      cur = i;
    };
    vg.addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener("resize", update);
    update();
  });

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

  /* ---------- Galeria: colagem em «Todas» (ordem e tamanhos baralhados a cada visita) ---------- */
  // Tamanhos em colunas × meias-linhas: s/S = quadrado pequeno/grande (caras), W = horizontal 3:2,
  // L = horizontal grande 4:3, M = horizontal pequena 4:3, P = panorâmica 2:1 (fotografias de grupo).
  var SZ = { s: [1, 2, "Q"], S: [2, 4, "Q"], W: [3, 4, "L"], L: [4, 6, "L"], M: [2, 3, "L"], P: [2, 2, "L"] };
  // Cada modelo enche faixas inteiras da grelha com o preenchimento «dense»: nunca ficam buracos.
  var BANDS = {
    6: ["W S s s", "s W S s", "S S S", "W W", "s s s s s s", "L S s s", "S L s s", "s s W s s s s", "S s s S s s", "M M M"],
    4: ["W s s", "s W s", "S S", "S s s s s", "s s S s s", "L", "M M", "s s s s", "S P P"],
    2: ["s s", "S", "M", "M s s", "s s M"]
  };
  var collage = function (grid) {
    var kids = Array.prototype.slice.call(grid.children);
    var photos = kids.filter(function (el) { return el.classList.contains("gallery__item") && $("img", el); });
    if (photos.length < 4) return null;
    var shuffle = function (a) {
      for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
      return a;
    };
    var wide = function (el) { var im = $("img", el); return (+im.getAttribute("width") || 1) / (+im.getAttribute("height") || 1) > 1.2; };
    var poolL = shuffle(photos.filter(wide));
    var poolQ = shuffle(photos.filter(function (el) { return !wide(el); }));
    var plans = {}, cols = 0, lastW = 0, on = false;
    var plan = function (n) {
      var bands = BANDS[n].map(function (b) { return b.split(" "); });
      var minLen = Math.min.apply(null, bands.map(function (b) { return b.length; }));
      var L = poolL.slice(), Q = poolQ.slice(), out = [], recent = [];
      while (L.length + Q.length) {
        var left = L.length + Q.length, best = -1, bestSc = Infinity;
        for (var pass = 0; pass < 2 && best < 0; pass++) {
          bands.forEach(function (b, k) {
            var rest = left - b.length;
            if (rest < 0 || (rest > 0 && rest < minLen) || (pass === 0 && recent.indexOf(k) >= 0)) return;
            var nL = b.filter(function (c) { return SZ[c][2] === "L"; }).length;
            // o modelo que gasta horizontais e quadrados na proporção do que falta, com uma boa dose de acaso
            var sc = Math.abs(nL / b.length - L.length / left) + Math.max(0, nL - L.length) + Math.max(0, b.length - nL - Q.length) + Math.random() * 0.6;
            if (sc < bestSc) { bestSc = sc; best = k; }
          });
        }
        var band = best < 0 ? ["S"] : bands[best];
        recent.push(best);
        if (recent.length > 2) recent.shift();
        band.forEach(function (c) {
          var it = SZ[c][2] === "L" ? (L.shift() || Q.shift()) : (Q.shift() || L.shift());
          if (it) out.push([it, SZ[c][0], SZ[c][1]]);
        });
      }
      return out;
    };
    var layout = function () {
      if (!on) return;
      var n = window.innerWidth >= 900 ? 6 : window.innerWidth >= 560 ? 4 : 2;
      if (n === cols && grid.clientWidth === lastW) return;
      if (n !== cols) {
        cols = n;
        grid.style.setProperty("--cols", n);
        plans[n] = plans[n] || plan(n);
        plans[n].forEach(function (p) {
          p[0].style.setProperty("--w", p[1]);
          p[0].style.setProperty("--h", p[2]);
          grid.appendChild(p[0]);
        });
        kids.forEach(function (el) { if (photos.indexOf(el) < 0) grid.appendChild(el); });
      }
      lastW = grid.clientWidth;
      var gap = parseFloat(getComputedStyle(grid).columnGap) || 0;
      grid.style.setProperty("--row", Math.max(20, ((lastW - gap * (cols - 1)) / cols - gap) / 2) + "px");
    };
    if ("ResizeObserver" in window) new ResizeObserver(layout).observe(grid);
    else window.addEventListener("resize", layout);
    return {
      on: function () { on = true; cols = 0; grid.classList.add("is-collage"); layout(); },
      off: function () {
        on = false;
        grid.classList.remove("is-collage");
        kids.forEach(function (el) { grid.appendChild(el); });
      }
    };
  };

  /* ---------- Galeria: filtro por tema (campanha, bastidores, membros) ---------- */
  $$("[data-gallery-filter]").forEach(function (bar) {
    var grid = $(bar.getAttribute("data-gallery-filter"));
    if (!grid) return;
    var col = collage(grid);
    if (col) col.on();
    var btns = $$("button[data-filter]", bar);
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        var f = b.getAttribute("data-filter");
        btns.forEach(function (o) { o.setAttribute("aria-pressed", o === b ? "true" : "false"); });
        if (col) { if (f === "todas") col.on(); else col.off(); }
        $$("[data-cat]", grid).forEach(function (it) { it.hidden = f !== "todas" && it.getAttribute("data-cat") !== f; });
        grid.classList.remove("is-filtering");
        void grid.offsetWidth;
        grid.classList.add("is-filtering");
      });
    });
  });

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
        lbCap.textContent = img.getAttribute("data-caption") || "";
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
      var c = null;
      try { c = JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (err) { return null; }
      /* A escolha vale 12 meses (como diz a Política de Privacidade); depois volta a perguntar */
      if (c && (!c.date || Date.now() - Date.parse(c.date) > 365 * 864e5)) return null;
      return c;
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
