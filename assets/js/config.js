(function () {
  window.ECLIPSE = {
    voteDate: "29 de outubro de 2026"
  };
})();
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var date = (window.ECLIPSE && window.ECLIPSE.voteDate) || "";
    var els = document.querySelectorAll("[data-vote-date]");
    els.forEach(function (el) {
      if (date) el.textContent = date;
    });
  });
})();