/* Datas da campanha e da votação, usadas em todo o site.
   Para mudar as datas basta alterar estes valores:
   - campaign: texto do período de campanha (em todos os elementos com data-campaign)
   - campaignStart / campaignEnd: primeiro e último dia de campanha (caixa de data na agenda)
   - voteDate: texto do dia da votação (em todos os elementos com data-vote-date)
   - voteStart / voteEnd: abertura das urnas e fim do dia de votação (hora de Lisboa), usados na contagem
     decrescente e no botão "Pôr no calendário"
   Os textos de reserva escritos nas páginas (para quem não tem JavaScript e para o Google)
   repetem estas datas: ao mudá-las, procure também a data antiga nos ficheiros .html. */
(function () {
  window.ECLIPSE = {
    campaign: "23 a 25 de novembro",
    campaignStart: "2026-11-23",
    campaignEnd: "2026-11-25",
    voteDate: "26 de novembro de 2026",
    voteStart: "2026-11-26T08:30:00",
    voteEnd: "2026-11-26T23:59:00" // sem hora de fecho definida: só serve para o site saber quando o dia de votação acabou
  };
})();
