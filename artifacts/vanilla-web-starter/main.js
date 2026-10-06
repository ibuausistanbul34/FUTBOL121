const app = document.querySelector("#app");

const STAT_NAMES = ["Hız", "İvme", "Şut", "Kafa", "Teknik", "Kısa Pas", "Uzun Pas", "Oyun Zekâsı", "Fizik", "Defans", "Kalecilik"];
const TEAMS = [
  {
    key: "bjk", name: "Beşiktaş", playerLabel: "Oyuncu 1 · Kendi takımın", crest: "BJK",
    names: [
      ["Arda Yalçın", "K", "Kaleci"], ["Mert Aydın", "D", "Savunma"], ["Bora Sancak", "D", "Savunma"],
      ["Efe Karaca", "D", "Savunma"], ["Deniz Tunç", "D", "Savunma"], ["Kerem Yıldız", "O", "Orta saha"],
      ["Can Demir", "O", "Orta saha"], ["Umut Ekin", "O", "Orta saha"], ["Baran Aksoy", "O", "Orta saha"],
      ["Kaan Ergin", "F", "Forvet"], ["Emir Taş", "F", "Forvet"],
    ],
  },
  {
    key: "gala", name: "Galatasaray", playerLabel: "Oyuncu 2 · Rakip", crest: "GS",
    names: [
      ["Tuna Şahin", "K", "Kaleci"], ["Atlas Çetin", "D", "Savunma"], ["Yiğit Aslan", "D", "Savunma"],
      ["Eren Güneş", "D", "Savunma"], ["Ozan Bulut", "D", "Savunma"], ["Rüzgar Kılıç", "O", "Orta saha"],
      ["Alp Özer", "O", "Orta saha"], ["Berk Korkmaz", "O", "Orta saha"], ["Sarp Uslu", "O", "Orta saha"],
      ["Poyraz Keskin", "F", "Forvet"], ["Cem Arslan", "F", "Forvet"],
    ],
  },
];

const EVENTS = [
  { title: "Hava Topu", stat: "Kafa", copy: "Ceza sahasında yüksek top mücadelesi." },
  { title: "Uzaktan Şut", stat: "Şut", copy: "Yay gerisinden kaleyi yokla." },
  { title: "Kontra Atak", stat: "İvme", copy: "Boş alanı hızlı bir çıkışla değerlendir." },
  { title: "İkili Mücadele", stat: "Fizik", copy: "Orta sahada omuz omuza mücadele." },
  { title: "Pas Oyunu", stat: "Kısa Pas", copy: "Dar alanda pas bağlantısını kur." },
  { title: "Uzun Top", stat: "Uzun Pas", copy: "Savunma arkasına uzun bir top gönder." },
  { title: "Çalım", stat: "Teknik", copy: "Rakip savunmacıyı bire birde geç." },
  { title: "Savunma Hattı", stat: "Defans", copy: "Rakibin hücumunu birlikte karşıla." },
  { title: "Hızlı Hücum", stat: "Hız", copy: "Kanattan hızla hücuma çık." },
  { title: "Taktik Hamle", stat: "Oyun Zekâsı", copy: "Doğru kararı ver, oyunun yönünü değiştir." },
];
const ROUND_MINUTES = ["0–15", "15–30", "30–45", "45–60", "60–75"];

function makePlayers(teamIndex) {
  return TEAMS[teamIndex].names.map(([name, position, role], playerIndex) => {
    const stats = {};
    STAT_NAMES.forEach((stat, statIndex) => {
      stats[stat] =
        ((playerIndex * 3 +
          statIndex * 5 +
          teamIndex * 4 +
          Math.floor(((playerIndex + 1) * (statIndex + 1)) / 4)) %
          11) +
        1;
    });
    return { id: `${TEAMS[teamIndex].key}-${playerIndex}`, name, position, role, stats, total: Object.values(stats).reduce((sum, value) => sum + value, 0) };
  });
}

const ROSTERS = [makePlayers(0), makePlayers(1)];
let state = { screen: "landing" };

function newMatchState() {
  const matchEvents = Array.from({ length: 5 }, () => Array.from({ length: 3 }, () => EVENTS[Math.floor(Math.random() * EVENTS.length)]));
  state = {
    screen: "match", matchEvents, round: 0, event: 0, score: [0, 0],
    winsInRound: [0, 0], roundHistory: [], selections: [[], []],
    lastEventResult: null, roundResult: null, guidance: "Her takımdan kendi kartlarına dokunarak iki farklı oyuncu seçin.",
    finalResult: null, locked: false,
  };
  render();
}

function activeEvent() {
  return state.matchEvents[state.round][state.event];
}

function statIndex(stat) {
  return STAT_NAMES.indexOf(stat);
}

function renderLanding() {
  app.innerHTML = `
    <div class="noise" aria-hidden="true"></div>
    <section class="landing screen-enter" aria-labelledby="hero-title">
      <header class="topline">
        <div class="wordmark">FUTBOL<b>121</b></div>
        <div class="edition">Yerel çok oyunculu · İlk prototip</div>
      </header>
      <div class="landing-center">
        <div class="eyebrow">Maç günü. İki kadro. Tek saha.</div>
        <h1 id="hero-title">FUTBOL<span>121</span></h1>
        <p class="hero-sub">Kartlarını seç. Olayı oku. Maçı kendi taktiğinle kazan.</p>
        <button class="start-button" type="button" data-action="start">Maça başla <span class="arrow" aria-hidden="true">→</span></button>
        <div class="landing-facts" aria-label="Oyun bilgisi">
          <span>2 oyuncu · tek ekran</span><span>5 tur · 15 olay</span><span>11 kişilik kadro</span>
        </div>
      </div>
      <footer class="landing-foot"><span>Strateji, her seçimde.</span><span>BEŞİKTAŞ × GALATASARAY</span></footer>
    </section>`;
}

function renderScoreboard() {
  return `
    <section class="scoreboard" aria-label="Maç skoru">
      <div class="team-score">
        <div class="crest bjk" aria-hidden="true">BJK</div>
        <div><div class="team-name">BEŞİKTAŞ</div><div class="team-player">Oyuncu 1 · Kendi takımın</div></div>
      </div>
      <div class="score-center">
        <div class="score-digits">${state.score[0]} <span>:</span> ${state.score[1]}</div>
        <div class="clock">DAKİKA ${state.round * 15 + state.event * 5}′</div>
      </div>
      <div class="team-score away">
        <div><div class="team-name">GALATASARAY</div><div class="team-player">Oyuncu 2 · Rakip</div></div>
        <div class="crest gala" aria-hidden="true">GS</div>
      </div>
    </section>
    <div class="round-track" aria-label="Maç turları">
      ${ROUND_MINUTES.map((minutes, index) => `<div class="round-chip ${index === state.round ? "active" : index < state.round ? "done" : ""}">${index + 1}. tur · ${minutes}</div>`).join("")}
    </div>`;
}

function renderCard(player, teamIndex, event) {
  const selectedIndex = state.selections[teamIndex].indexOf(player.id);
  const selected = selectedIndex !== -1;
  const focus = event?.stat;
  return `<button type="button" class="player-card ${selected ? "selected" : ""}" data-action="select" data-team="${teamIndex}" data-player="${player.id}" aria-pressed="${selected}" aria-label="${player.name}, ${player.role}, toplam güç ${player.total}. ${selected ? `Seçili, ${selectedIndex + 1}. oyuncu.` : "Oyuncu seç."}" ${state.locked ? "disabled" : ""}>
      ${selected ? `<span class="card-selection">Seçim ${selectedIndex + 1}</span>` : ""}
      <span class="card-top">
        <span class="card-rating">${player.total}</span>
        <span><span class="card-name">${player.name}</span><span class="card-position">${player.position} · ${player.role}</span></span>
        <span class="card-badge">GÜÇ</span>
      </span>
      <span class="card-stats">${STAT_NAMES.map(stat => `<span class="stat-pill ${stat === focus ? "focus-stat" : ""}" title="${stat}: ${player.stats[stat]}"><b>${player.stats[stat]}</b><small>${stat}</small></span>`).join("")}</span>
    </button>`;
}

function renderTeamPanel(teamIndex, event) {
  const team = TEAMS[teamIndex];
  const selected = state.selections[teamIndex].length;
  return `<section class="team-panel" aria-labelledby="team-${team.key}">
    <div class="panel-head">
      <div class="panel-team"><span class="mini-crest ${team.key}" aria-hidden="true">${team.crest}</span><span id="team-${team.key}">${team.name}</span></div>
      <div class="pick-count"><strong>${selected}</strong> / 2 seçildi</div>
    </div>
    <div class="team-hint">${team.playerLabel} · İki farklı kart seçin</div>
    <div class="cards-list">${ROSTERS[teamIndex].map(player => renderCard(player, teamIndex, event)).join("")}</div>
  </section>`;
}

function renderEventCenter() {
  const event = activeEvent();
  const ready = state.selections.every(selection => selection.length === 2) && !state.locked;
  const buttonText = state.event === 2 ? "3. olayı sonuçlandır" : "Olayı sonuçlandır";
  return `<section class="center-panel" aria-labelledby="event-heading">
    <div class="center-kicker"><span>${state.round + 1}. tur · Olay ${state.event + 1} / 3</span><span>Tur skoru ${state.winsInRound[0]} – ${state.winsInRound[1]}</span></div>
    <div class="event-card">
      <div class="event-card-label">Sıradaki mücadele</div>
      <h2 class="event-title" id="event-heading">${event.title}</h2>
      <div class="event-description">${event.copy}</div>
      <div class="stat-focus">Kullanılan özellik · ${event.stat}</div>
    </div>
    <div class="versus-row">İKİLİ SEÇİM · KARŞILIKLI</div>
    <div class="selection-summary">
      ${TEAMS.map((team, index) => {
        const picked = state.selections[index].map(id => ROSTERS[index].find(player => player.id === id)).filter(Boolean);
        return `<div class="selection-box"><h3>${team.name} · ${picked.length}/2</h3><div class="selected-names">${picked.length ? picked.map(player => `<span class="name-chip">${player.name}</span>`).join("") : '<span class="name-chip empty">Kart seçilmedi</span>'}</div></div>`;
      }).join("")}
    </div>
    <div class="guidance ${state.guidanceType === "error" ? "error" : ""}" role="${state.guidanceType === "error" ? "alert" : "status"}" aria-live="polite">${state.guidance}</div>
    ${state.lastEventResult ? renderEventResult(state.lastEventResult) : ""}
    ${state.roundResult ? `<div class="round-banner" role="status"><strong>${state.roundResult.title}</strong><p>${state.roundResult.detail}</p></div><button class="primary-button next-button" type="button" data-action="next-round">Sonraki tura geç <span aria-hidden="true">→</span></button>` : ""}
    ${state.locked && !state.roundResult ? `<button class="primary-button next-button" type="button" data-action="continue-event">Sonraki olaya geç <span aria-hidden="true">→</span></button>` : ""}
    ${!state.locked ? `<div class="resolve-wrap"><button type="button" class="primary-button resolve-button" data-action="resolve" ${ready ? "" : "disabled"}>${buttonText}</button></div>` : ""}
    <p class="match-footnote">Tur kazananı yalnızca 3 olay tamamlanınca belirlenir. İlk iki olay maç skorunu değiştirmez.</p>
  </section>`;
}

function renderEventResult(result) {
  const winnerName = result.winner === -1 ? "Berabere · olay puanı yok" : `${TEAMS[result.winner].name} bu olayı kazandı`;
  return `<div class="result-panel" role="status" aria-live="polite">
    <h3>Olay sonucu · ${result.stat}</h3>
    <div class="result-columns">
      ${TEAMS.map((team, i) => `<div class="result-side">${team.name}<strong>${result.names[i].join(" + ")}</strong><span>${result.values[i][0]} + ${result.values[i][1]} = ${result.sums[i]}</span></div>`).join("")}
    </div>
    <div class="result-winner ${result.winner === -1 ? "tie" : ""}">${winnerName}${result.finalEvent ? " · Tur kararı şimdi verildi." : ""}</div>
  </div>`;
}

function renderHistory() {
  if (!state.roundHistory.length) return "";
  return `<div class="history" aria-label="Tamamlanan tur sonuçları">${state.roundHistory.map((entry, i) => `<div class="history-item">${i + 1}. TUR <strong>${entry}</strong></div>`).join("")}</div>`;
}

function renderMatch() {
  const event = activeEvent();
  app.innerHTML = `<div class="noise" aria-hidden="true"></div><div class="match-page screen-enter">
    <header class="match-header">
      <div class="header-brand"><div class="wordmark">FUTBOL<b>121</b></div><div class="live-tag"><strong>CANLI MAÇ</strong> · YEREL OYUN</div></div>
      <button class="quiet-button" type="button" data-action="new-match" aria-label="Yeni maça başla">Yeni maç ↺</button>
    </header>
    ${renderScoreboard()}
    <div class="match-layout">
      ${renderTeamPanel(0, event)}
      ${renderEventCenter()}
      ${renderTeamPanel(1, event)}
    </div>
    ${renderHistory()}
  </div>`;
}

function renderNinetieth() {
  app.innerHTML = `<div class="noise" aria-hidden="true"></div><section class="special-screen screen-enter">
    <div class="final-card">
      <div class="final-mark" aria-hidden="true">90′</div>
      <div class="eyebrow">Son düdükten önce</div>
      <h1 class="special-title">90. DAKİKA</h1>
      <p class="special-sub">Maçın son kartı açılıyor. Etki, Oyuncu 1'in kendi takımına veya rakibine yansıyabilir.</p>
      <div class="chance-line"><span>Rakip −1</span><span>Kendi takımın −1</span><span>Etki yok</span></div>
      <button class="primary-button" type="button" data-action="reveal-final">Son kartı aç</button>
    </div>
  </section>`;
}

function renderFinal() {
  const result = state.finalResult;
  let resultText = "Etki yok";
  if (result === 0) resultText = "Rakip −1";
  if (result === 1) resultText = "Kendi takımın −1";
  const winner = state.score[0] === state.score[1] ? "Maç berabere" : `${TEAMS[state.score[0] > state.score[1] ? 0 : 1].name} galip`;
  app.innerHTML = `<div class="noise" aria-hidden="true"></div><section class="special-screen screen-enter">
    <div class="final-card">
      <div class="final-mark" aria-hidden="true">FT</div>
      <div class="eyebrow">15 olay tamamlandı · Maç sona erdi</div>
      <h1 class="special-title">FINAL SKORU</h1>
      <div class="final-score-line"><span>Beşiktaş</span><b>${state.score[0]} : ${state.score[1]}</b><span>Galatasaray</span></div>
      <div class="champion-label">${winner}</div>
      <div class="special-result ${result === 1 ? "penalty" : ""}" role="status">${resultText}</div>
      <p class="special-sub">90. dakika kartı uygulandı. Skor sıfırın altına düşmez.</p>
      <div class="final-actions">
        <button class="primary-button" type="button" data-action="new-match">Yeni maç başlat</button>
        <button class="secondary-button" type="button" data-action="home">Ana ekrana dön</button>
      </div>
    </div>
  </section>`;
}

function render() {
  if (state.screen === "landing") renderLanding();
  else if (state.screen === "match") renderMatch();
  else if (state.screen === "ninetieth") renderNinetieth();
  else renderFinal();
}

function togglePlayer(teamIndex, playerId) {
  if (state.locked || ![0, 1].includes(teamIndex)) return;
  const roster = ROSTERS[teamIndex];
  if (!roster.some(player => player.id === playerId)) return;
  const picks = state.selections[teamIndex];
  const existing = picks.indexOf(playerId);
  if (existing !== -1) {
    picks.splice(existing, 1);
    state.guidance = `${TEAMS[teamIndex].name}: kart seçimi kaldırıldı. İki farklı oyuncu seçin.`;
    state.guidanceType = "";
  } else if (picks.length >= 2) {
    state.guidance = `${TEAMS[teamIndex].name} için zaten iki oyuncu seçili. Önce bir kartın seçimini kaldırın.`;
    state.guidanceType = "error";
  } else {
    picks.push(playerId);
    state.guidance = state.selections.every(selection => selection.length === 2)
      ? "İki kadro da hazır. Olayı sonuçlandırabilirsiniz."
      : `${TEAMS[teamIndex].name}: ${picks.length}/2 seçildi. Diğer takım da iki oyuncu seçsin.`;
    state.guidanceType = "";
  }
  render();
}

function resolveEvent() {
  if (state.locked) return;
  if (!state.selections.every(selection => selection.length === 2)) {
    state.guidance = "Devam etmek için her takımdan iki farklı oyuncu seçin.";
    state.guidanceType = "error";
    render();
    return;
  }
  const event = activeEvent();
  const index = statIndex(event.stat);
  const values = state.selections.map((selection, teamIndex) => selection.map(id => ROSTERS[teamIndex].find(player => player.id === id).stats[event.stat]));
  const sums = values.map(pair => pair[0] + pair[1]);
  const winner = sums[0] === sums[1] ? -1 : sums[0] > sums[1] ? 0 : 1;
  if (winner !== -1) state.winsInRound[winner] += 1;
  const names = state.selections.map((selection, teamIndex) => selection.map(id => ROSTERS[teamIndex].find(player => player.id === id).name));
  const finalEvent = state.event === 2;
  state.lastEventResult = { names, values, sums, winner, finalEvent, stat: STAT_NAMES[index] };
  state.locked = true;
  state.guidance = finalEvent
    ? "Üç olay tamamlandı. Tur kazananı ve maç golü belirlendi."
    : "Olay kapandı. Sonucu inceleyin, ardından sonraki olaya geçin.";
  state.guidanceType = "";

  if (finalEvent) {
    if (state.winsInRound[0] > state.winsInRound[1]) {
      state.score[0] += 1;
      state.roundResult = { title: "Beşiktaş turu aldı · +1 gol", detail: `Olay galibiyetleri ${state.winsInRound[0]} – ${state.winsInRound[1]}.` };
      state.roundHistory.push("Beşiktaş +1");
    } else if (state.winsInRound[1] > state.winsInRound[0]) {
      state.score[1] += 1;
      state.roundResult = { title: "Galatasaray turu aldı · +1 gol", detail: `Olay galibiyetleri ${state.winsInRound[0]} – ${state.winsInRound[1]}.` };
      state.roundHistory.push("Galatasaray +1");
    } else {
      state.roundResult = { title: "Tur berabere · gol yok", detail: `Olay galibiyetleri ${state.winsInRound[0]} – ${state.winsInRound[1]}.` };
      state.roundHistory.push("Berabere");
    }
  }
  render();
}

function advance() {
  if (!state.locked || state.roundResult) return;
  state.event += 1;
  state.selections = [[], []];
  state.lastEventResult = null;
  state.locked = false;
  state.guidance = "Yeni olay için her takımdan iki farklı oyuncu seçin.";
  state.guidanceType = "";
  render();
}

function nextRound() {
  if (!state.roundResult) return;
  if (state.round === 4) {
    state.screen = "ninetieth";
  } else {
    state.round += 1;
    state.event = 0;
    state.winsInRound = [0, 0];
    state.selections = [[], []];
    state.lastEventResult = null;
    state.roundResult = null;
    state.locked = false;
    state.guidance = "Yeni tur başladı. Her takımdan iki farklı oyuncu seçin.";
    state.guidanceType = "";
  }
  render();
}

app.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button || button.disabled) return;
  const action = button.dataset.action;
  if (action === "start") newMatchState();
  if (action === "select") togglePlayer(Number(button.dataset.team), button.dataset.player);
  if (action === "resolve") resolveEvent();
  if (action === "continue-event") advance();
  if (action === "next-round") nextRound();
  if (action === "new-match") newMatchState();
  if (action === "home") { state = { screen: "landing" }; render(); }
  if (action === "reveal-final" && state.screen === "ninetieth") {
    const result = Math.floor(Math.random() * 3);
    state.finalResult = result;
    if (result === 0) state.score[1] = Math.max(0, state.score[1] - 1);
    if (result === 1) state.score[0] = Math.max(0, state.score[0] - 1);
    state.screen = "final";
    render();
  }
});

render();
