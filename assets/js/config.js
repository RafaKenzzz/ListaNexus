/* Dados da campanha usados em todo o site.
   Para mudar o dia da votação basta alterar estes valores:
   - voteDate:  texto que aparece nas páginas (em todos os elementos com data-vote-date)
   - voteStart / voteEnd: abertura e fecho das urnas (hora de Lisboa), usados na contagem decrescente */
(function () {
  window.ECLIPSE = {
    voteDate: "29 de outubro de 2026",
    voteStart: "2026-10-29T09:00:00",
    voteEnd: "2026-10-29T17:00:00"
  };
})();
