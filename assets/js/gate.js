/* Pré-visualização: até ao sábado antes da campanha, quem abre o site vê primeiro a página
   preview.html, que pede o código de acesso. Com o código certo, o site fica aberto nesse
   separador do navegador (até o fechar). A partir de OPEN (hora de Lisboa) a página de
   pré-visualização desaparece sozinha e o site fica aberto a todos.
   - Para abrir o site antes: pôr OPEN no passado (ou tirar o <script src="assets/js/gate.js"> das páginas).
   - Para mudar o código: pôr em HASH o SHA-256 do novo código, escrito em minúsculas e sem espaços.
   Isto só serve para quem visita o site normalmente. Não protege o conteúdo: os ficheiros
   continuam públicos no GitHub. */
(function () {
  "use strict";
  var OPEN = "2026-11-21T00:00:00Z"; // sábado, 21 de novembro de 2026, 0h00 em Lisboa
  var HASH = "932f3d50147035d87858910e4c551977be02f673a8efd700443350b8e425230e";
  var KEY = "eclipse-preview";

  var doc = document;
  var openAt = Date.parse(OPEN);
  var isOpen = function () { return Date.now() >= openAt; };
  var ok = false;
  try { ok = sessionStorage.getItem(KEY) === HASH; } catch (e) {}
  if (!ok && window.name === KEY + ":" + HASH) ok = true; // navegadores que bloqueiam o sessionStorage
  var isPreview = doc.documentElement.hasAttribute("data-preview");

  /* Páginas do site: sem código, segue para a pré-visualização */
  if (!isPreview) {
    if (!isOpen() && !ok) {
      var here = location.pathname.split("/").pop() || "index.html";
      location.replace("preview.html?next=" + encodeURIComponent(here + location.hash));
    }
    return;
  }

  /* Página de pré-visualização */
  var next = "index.html";
  try {
    var asked = new URLSearchParams(location.search).get("next") || "";
    if (/^[a-z0-9-]+\.html(#[a-z0-9-]*)?$/i.test(asked)) next = asked;
  } catch (e) {}
  if (isOpen() || ok) { location.replace(next); return; }

  var sha256 = function (text) {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
    });
  };

  doc.addEventListener("DOMContentLoaded", function () {
    /* Contagem decrescente até o site abrir a todos */
    var box = doc.querySelector("[data-gate-count]");
    var cell = function (k) { return box && box.querySelector('[data-cd="' + k + '"]'); };
    var cells = { d: cell("d"), h: cell("h"), m: cell("m"), s: cell("s") };
    var pad = function (n) { return n < 10 ? "0" + n : "" + n; };
    var timer;
    var tick = function () {
      var left = Math.floor((openAt - Date.now()) / 1000);
      if (left <= 0) { clearInterval(timer); location.replace(next); return; }
      if (cells.d) cells.d.textContent = Math.floor(left / 86400);
      if (cells.h) cells.h.textContent = pad(Math.floor(left % 86400 / 3600));
      if (cells.m) cells.m.textContent = pad(Math.floor(left % 3600 / 60));
      if (cells.s) cells.s.textContent = pad(left % 60);
    };
    tick();
    timer = setInterval(tick, 1000);

    /* Código de acesso */
    var form = doc.querySelector("[data-gate-form]");
    if (!form) return;
    var input = form.querySelector("input");
    var err = doc.querySelector("[data-gate-err]");
    var btn = form.querySelector("button");
    var fail = function (msg) {
      err.textContent = msg;
      err.hidden = false;
      form.classList.remove("is-wrong");
      void form.offsetWidth;
      form.classList.add("is-wrong");
      input.setAttribute("aria-invalid", "true");
      input.select();
    };
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) input.focus({ preventScroll: true });
    input.addEventListener("input", function () { err.hidden = true; input.removeAttribute("aria-invalid"); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var code = input.value.replace(/\s+/g, "").toLowerCase();
      if (!code) { fail("Escreve o código de acesso."); return; }
      if (!window.crypto || !crypto.subtle) { fail("Este navegador não consegue verificar o código. Experimenta outro navegador."); return; }
      btn.disabled = true;
      sha256(code).then(function (h) {
        if (h === HASH) {
          try { sessionStorage.setItem(KEY, HASH); } catch (e2) { window.name = KEY + ":" + HASH; }
          form.classList.add("is-ok");
          location.replace(next);
        } else {
          btn.disabled = false;
          fail("Código errado. Tenta outra vez.");
        }
      }, function () {
        btn.disabled = false;
        fail("Não foi possível verificar o código. Tenta outra vez.");
      });
    });
  });
})();
