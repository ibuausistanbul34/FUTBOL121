const app = document.querySelector("#app");

const STAT_NAMES = ["Hız", "İvme", "Şut", "Kafa", "Teknik", "Kısa Pas", "Uzun Pas", "Oyun Zekâsı", "Fizik", "Defans", "Kalecilik"];
const STAT_SHORT = ["HIZ", "İVM", "ŞUT", "KAF", "TEK", "KPA", "UPA", "ZEK", "FİZ", "DEF", "KAL"];
const ROUND_MINUTES = ["0–15", "15–30", "30–45", "45–60", "60–75"];
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

const COMPARISONS = [
  { title: "Hava Topu", stat: "Kafa", copy: "Yüksek top. İki oyuncunun kafa gücü belirleyici." },
  { title: "Hızlı Atak", stat: "Hız", copy: "Boş alana çıkış. Yalnızca güncel hızlar toplanır." },
  { title: "Son Vuruş", stat: "Şut", copy: "Ceza sahasında bitiricilik sınavı." },
  { title: "Teknik Hareket", stat: "Teknik", copy: "Dar alanda beceri ve kontrol." },
  { title: "Oyun Kurma", stat: "Kısa Pas", copy: "Pas bağlantılarını en iyi kim kuruyor?" },
  { title: "Uzun Top", stat: "Uzun Pas", copy: "Savunma arkasına isabetli servis." },
  { title: "Taktik Savaşı", stat: "Oyun Zekâsı", copy: "Doğru karar ve doğru zamanlama." },
  { title: "İkili Mücadele", stat: "Fizik", copy: "Omuz omuza mücadelede kim ayakta kalır?" },
  { title: "Savunma Duvarı", stat: "Defans", copy: "Rakip hücumu karşısında direnç." },
];

const MODIFIERS = [
  {
    title: "Yağmur", icon: "🌧️", copy: "Islak zemin oyunu ağırlaştırıyor.",
    target: "field",
    scope: "Tüm saha oyuncuları · Kaleciler hariç",
    effects: [{ stat: "Hız", delta: -1 }, { stat: "Teknik", delta: -1 }, { stat: "Defans", delta: 1 }],
  },
  {
    title: "Derbi Gerilimi", icon: "🔥", copy: "Her ikili mücadele daha sert.",
    target: "all",
    scope: "Sahadaki tüm oyuncular · Kaleciler dahil",
    effects: [{ stat: "Fizik", delta: 1 }, { stat: "Şut", delta: -1 }],
  },
  {
    title: "Kaleci Eldivenleri", icon: "🧤", copy: "Kaleciler çizgide daha hazır.",
    target: "goalkeepers",
    scope: "İki takımın kalecileri",
    effects: [{ stat: "Kalecilik", delta: 2 }],
  },
  {
    title: "Daralan Alanlar", icon: "📐", copy: "Orta saha her metre için savaşıyor.",
    target: "field",
    scope: "Tüm saha oyuncuları · Kaleciler hariç",
    effects: [{ stat: "Kısa Pas", delta: -1 }, { stat: "Fizik", delta: 1 }],
  },
  {
    title: "Tribün Baskısı", icon: "📣", copy: "Büyük maçın sesi sahaya yansıyor.",
    target: "all",
    scope: "Sahadaki tüm oyuncular · Kaleciler dahil",
    effects: [{ stat: "Oyun Zekâsı", delta: -1 }, { stat: "Kalecilik", delta: 1 }],
  },
  {
    title: "Hızlı Zemin", icon: "⚡", copy: "Top daha çabuk akıyor.",
    target: "field",
    scope: "Tüm saha oyuncuları · Kaleciler hariç",
    effects: [{ stat: "Hız", delta: 1 }, { stat: "Uzun Pas", delta: 1 }],
  },
];

const NINETIETH_DECK = [
  { title: "Kaleci Sürprizi", icon: "🧤", type: "keeper", copy: "Kalecilik değerleri karşılaştırılır. Güçlü eldivenler rakibin skorunu 1 azaltır." },
  { title: "Kaleci Sürprizi", icon: "🧤", type: "keeper", copy: "Kalecilik değerleri karşılaştırılır. Güçlü eldivenler rakibin skorunu 1 azaltır." },
  { title: "Kaleci Sürprizi", icon: "🧤", type: "keeper", copy: "Kalecilik değerleri karşılaştırılır. Güçlü eldivenler rakibin skorunu 1 azaltır." },
  { title: "İnanılmaz Kurtarış", icon: "🧤", type: "against", team: 0, copy: "Beşiktaş kalecisi gole izin vermiyor. Rakibin skoru −1." },
  { title: "Son Anda Müdahale", icon: "🛡️", type: "against", team: 1, copy: "Galatasaray savunması son anda yetişiyor. Rakibin skoru −1." },
  { title: "Kaleci Topu Elinden Kaçırdı", icon: "🥅", type: "own", team: 0, copy: "Beşiktaş kalesinde talihsiz an. Kendi skoru −1." },
  { title: "Kale Önünde Karambol", icon: "⚽", type: "own", team: 1, copy: "Galatasaray kalesinde karambol. Kendi skoru −1." },
  { title: "Kaleci İleri Çıktı", icon: "🏃", type: "for", team: 1, copy: "Beşiktaş kalecisi ileri çıktı, top kaptırıldı. Galatasaray skoru +1." },
  { title: "Son Hücum", icon: "⏱️", type: "for", team: 1, copy: "Galatasaray son hücumu gole çevirdi. Kendi skoru +1." },
  { title: "Direkten Döndü", icon: "🥅", type: "none", copy: "Top direkten döndü. Skor değişmedi." },
  { title: "Son Düdük", icon: "📯", type: "none", copy: "Hakem son düdüğü çaldı. Skor değişmedi." },
];

function makePlayers(teamIndex) {
  const roster = TEAMS[teamIndex].names.map(([name, position, role], playerIndex) => {
    const baseStats = {};
    STAT_NAMES.forEach((stat, statIndex) => {
      baseStats[stat] = ((playerIndex * 3 + statIndex * 5 + teamIndex * 4 + Math.floor(((playerIndex + 1) * (statIndex + 1)) / 4)) % 11) + 1;
    });
    return {
      id: `${TEAMS[teamIndex].key}-${playerIndex}`, name, position, role,
      baseStats, stats: { ...baseStats },
      total: Object.values(baseStats).reduce((sum, value) => sum + value, 0),
    };
  });
  const counts = roster.reduce((acc, player) => ({ ...acc, [player.position]: (acc[player.position] || 0) + 1 }), {});
  if (roster.length !== 11 || counts.K !== 1 || counts.D !== 4 || counts.O !== 4 || counts.F !== 2) {
    throw new Error(`${TEAMS[teamIndex].name} kadrosu 1-4-4-2 kuralına uymuyor.`);
  }
  return roster;
}

const BASE_ROSTERS = [makePlayers(0), makePlayers(1)];
let rosters = [];
let state = { screen: "landing" };

function shuffled(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function newMatchState() {
  rosters = BASE_ROSTERS.map(team => team.map(player => ({ ...player, stats: { ...player.baseStats } })));
  const matchEvents = Array.from({ length: 5 }, () => [
    ...shuffled(MODIFIERS).slice(0, 2),
    COMPARISONS[Math.floor(Math.random() * COMPARISONS.length)],
  ]);
  state = {
    screen: "match", matchEvents, round: 0, event: 0, score: [0, 0],
    selectedPlayers: [[], []], lockedPlayers: new Set(), roundHistory: [],
    modifierHistory: [], eventResult: null, roundResult: null, guidance: "",
    finalCard: null, goalkeeperAvailableForFinal: [true, true],
  };
  applyModifier(activeEvent(), true);
  render();
}

function activeEvent() {
  return state.matchEvents[state.round][state.event];
}

function clamp(value) {
  return Math.min(11, Math.max(1, value));
}

function targetsFor(modifier) {
  const allPlayers = rosters.flat();
  if (modifier.target === "field") return allPlayers.filter(player => player.position !== "K");
  if (modifier.target === "goalkeepers") return allPlayers.filter(player => player.position === "K");
  if (modifier.target === "all") return allPlayers;
  throw new Error(`Bilinmeyen modifier hedefi: ${modifier.target}`);
}

function applyModifier(modifier, record = false) {
  const targets = targetsFor(modifier);
  const changes = [];
  targets.forEach(player => {
    modifier.effects.forEach(effect => {
      const before = player.stats[effect.stat];
      const after = clamp(before + effect.delta);
      player.stats[effect.stat] = after;
      if (before !== after) changes.push({ player: player.name, stat: effect.stat, before, after });
    });
  });
  if (record) state.modifierHistory.push({ round: state.round + 1, title: modifier.title, changes });
  return changes;
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
  const minute = state.round >= 5 ? "90+" : state.round * 15 + state.event * 5;
  return `
    <section class="scoreboard" aria-label="Maç skoru">
      <div class="team-score"><div class="crest bjk" aria-hidden="true">BJK</div>
        <div><div class="team-name">BEŞİKTAŞ</div><div class="team-player">Oyuncu 1 · Kendi takımın</div></div>
      </div>
      <div class="score-center"><div class="score-digits">${state.score[0]} <span>:</span> ${state.score[1]}</div>
        <div class="clock">${state.round < 5 ? `DAKİKA ${minute}′` : "90. DAKİKA"}</div></div>
      <div class="team-score away"><div><div class="team-name">GALATASARAY</div><div class="team-player">Oyuncu 2 · Rakip</div></div>
        <div class="crest gala" aria-hidden="true">GS</div></div>
    </section>
    <div class="round-track" aria-label="Maç turları">
      ${ROUND_MINUTES.map((minutes, index) => `<div class="round-chip ${index === state.round ? "active" : index < state.round ? "done" : ""}">Tur ${index + 1} · ${minutes}</div>`).join("")}
    </div>`;
}

function renderPlayerCard(player, teamIndex, comparison, compact = false) {
  const chosen = state.selectedPlayers[teamIndex].includes(player.id);
  const locked = state.lockedPlayers.has(player.id);
  const canChoose = state.event === 2 && !state.roundResult && !locked && state.selectedPlayers[teamIndex].length < 2;
  const disabled = state.event !== 2 || !!state.roundResult || locked || (!chosen && state.selectedPlayers[teamIndex].length >= 2);
  const isKeeper = player.position === "K";
  const status = isKeeper ? (state.round < 5 ? "KALECİ · FİNALDE" : "KALECİ") : locked ? "🔒 KULLANILDI" : chosen ? "🔒 SEÇİLDİ" : "KULLANILABİLİR";
  const stats = STAT_NAMES.map((stat, index) => {
    const current = player.stats[stat];
    const base = player.baseStats[stat];
    const changed = current !== base;
    return `<span class="stat-pill ${comparison?.stat === stat ? "focus-stat" : ""} ${changed ? "changed-stat" : ""}" title="${stat}: Temel ${base}, güncel ${current}">
      <small>${STAT_SHORT[index]}</small><b>${current}</b><i>T${base}</i></span>`;
  }).join("");
  return `<button type="button" class="player-card ${chosen ? "selected" : ""} ${locked ? "locked" : ""} ${isKeeper ? "keeper-card" : ""} ${compact ? "compact" : ""}"
      data-action="select" data-team="${teamIndex}" data-player="${player.id}" aria-pressed="${chosen}"
      aria-label="${player.name}, ${player.role}, toplam güç ${player.total}. Kalecilik ve diğer güncel özellikler kartta. Durum: ${status}."
      ${disabled ? "disabled" : ""} ${canChoose ? 'title="Karşılaştırma için seç"' : ""}>
      <span class="card-top"><span class="card-rating">${player.total}</span>
        <span><span class="card-name">${player.name}</span><span class="card-position">${player.position} · ${player.role}</span></span>
        <span class="card-badge">${isKeeper ? "GK" : locked ? "KİLİTLİ" : "GÜÇ"}</span></span>
      <span class="player-status ${locked || chosen ? "status-locked" : isKeeper ? "status-keeper" : ""}">${status}</span>
      <span class="card-stats">${stats}</span>
    </button>`;
}

function renderTeamPanel(teamIndex, comparison) {
  const team = TEAMS[teamIndex];
  const players = rosters[teamIndex];
  const selected = state.selectedPlayers[teamIndex].length;
  const usedCount = players.filter(player => state.lockedPlayers.has(player.id)).length;
  const keeper = players.filter(p => p.position === "K");
  const forwards = players.filter(p => p.position === "F");
  const mids = players.filter(p => p.position === "O");
  const defenders = players.filter(p => p.position === "D");
  const renderLine = (line, cls) => `<div class="formation-line ${cls}">${line.map(player => renderPlayerCard(player, teamIndex, comparison)).join("")}</div>`;
  return `<section class="team-panel pitch-panel ${team.key}" aria-labelledby="team-${team.key}">
    <div class="panel-head"><div class="panel-team"><span class="mini-crest ${team.key}" aria-hidden="true">${team.crest}</span><span id="team-${team.key}">${team.name}</span></div>
      <div class="pick-count"><strong>${selected}</strong> / 2 seçildi</div></div>
    <div class="team-hint">${team.playerLabel} · ${usedCount} / 10 saha oyuncusu kullanıldı</div>
    <div class="pitch" aria-label="${team.name} başlangıç dizilişi 1-4-4-2">
      <div class="pitch-markings" aria-hidden="true"><span class="halfway"></span><span class="center-circle"></span><span class="penalty-box top-box"></span><span class="penalty-box bottom-box"></span></div>
      ${renderLine(keeper, "line-keeper")}
      ${renderLine(defenders, "line-defence")}
      ${renderLine(mids, "line-midfield")}
      ${renderLine(forwards, "line-forward")}
    </div>
    <div class="formation-key"><span><i class="dot available"></i>Kullanılabilir</span><span><i class="dot used"></i>Kullanıldı</span><span><i class="dot keeper-dot"></i>Kaleci · final</span></div>
  </section>`;
}

function renderModifierEvent(event) {
  const targets = targetsFor(event);
  const previewEffects = event.effects.map(effect => `<span class="effect-chip">${effect.stat} <b>${effect.delta > 0 ? "+" : ""}${effect.delta}</b></span>`).join("");
  const recent = state.modifierHistory[state.modifierHistory.length - 1];
  const samples = recent?.changes.slice(0, 4).map(change => `<span>${change.player.split(" ")[0]} · ${change.stat} <b>${change.before} → ${change.after}</b></span>`).join("");
  return `<div class="event-card modifier-card">
    <div class="event-card-label">OTOMATİK ETKİ · ${state.event + 1}. OLAY</div>
    <h2 class="event-title" id="event-heading">${event.icon} ${event.title}</h2>
    <div class="event-description">${event.copy}</div>
    <div class="event-scope"><b>HEDEF</b> ${event.scope} <span>· ${targets.length} oyuncu</span></div>
    <div class="effect-list">${previewEffects}</div>
    <div class="applied-label">GÜNCEL DEĞERLERE UYGULANDI</div>
    <div class="change-examples">${samples || "<span>Özellikler değiştiğinde Temel → Güncel farkı kartlarda görünür.</span>"}</div>
  </div>`;
}

function renderComparisonEvent(event) {
  const ready = state.selectedPlayers.every(selection => selection.length === 2) && !state.roundResult;
  if (state.roundResult) {
    return `<div class="event-card">
        <div class="event-card-label">3. OLAY · KARŞILAŞTIRMA</div>
        <h2 class="event-title" id="event-heading">${event.title}</h2>
        <div class="event-description">${event.copy}</div>
        <div class="stat-focus">KARŞILAŞTIRILAN ÖZELLİK · ${event.stat.toLocaleUpperCase("tr-TR")}</div>
      </div>
      <div class="guidance" role="status">Tur tamamlandı. Seçilen saha oyuncuları maç sonuna kadar kilitli kalır.</div>`;
  }
  const progress = state.selectedPlayers.map((selection, index) =>
    `<div class="selection-box"><h3>${TEAMS[index].name} · ${selection.length} / 2</h3><div class="selected-names">${selection.length
      ? selection.map(id => rosters[index].find(player => player.id === id)?.name).filter(Boolean).map(name => `<span class="name-chip">${name}</span>`).join("")
      : '<span class="name-chip empty">Kart seçilmedi</span>'}</div></div>`).join("");
  return `<div class="event-card">
      <div class="event-card-label">3. OLAY · KARŞILAŞTIRMA</div>
      <h2 class="event-title" id="event-heading">${event.title}</h2>
      <div class="event-description">${event.copy}</div>
      <div class="stat-focus">YALNIZCA GÜNCEL ${event.stat.toLocaleUpperCase("tr-TR")} TOPLAMI</div>
    </div>
    <div class="versus-row">HER TAKIMDAN 2 SAHA OYUNCUSU · KALECİ SEÇİLEMEZ</div>
    <div class="selection-summary">${progress}</div>
    <div class="guidance" role="status" aria-live="polite">${ready ? "İki takım da hazır. Karşılaştırmayı tamamlayın." : "Her takım kendi sahasından tam iki kullanılabilir oyuncu seçsin. Seçilen oyuncu maç boyunca kilitlenir."}</div>
    <div class="resolve-wrap"><button type="button" class="primary-button resolve-button" data-action="resolve" ${ready ? "" : "disabled"}>Karşılaştır ve turu bitir</button></div>
    <p class="match-footnote">Toplam güç yalnızca kart bilgisidir. Sonuç sadece ${event.stat} değerlerinin toplamına göre belirlenir.</p>`;
}

function renderEventResult() {
  const result = state.eventResult;
  if (!result) return "";
  const winnerText = result.winner < 0 ? "BERABERE · GOL YOK" : `${TEAMS[result.winner].name.toLocaleUpperCase("tr-TR")} +1 GOL`;
  return `<div class="result-panel" role="status" aria-live="polite">
    <h3>${result.stat} · Tur karşılaştırması</h3>
    <div class="result-columns">${TEAMS.map((team, i) => `<div class="result-side">${team.name}<strong>${result.names[i].join(" + ")}</strong><span>${result.values[i].join(" + ")} = ${result.sums[i]}</span></div>`).join("")}</div>
    <div class="result-winner ${result.winner < 0 ? "tie" : ""}">${winnerText}</div></div>
    <div class="round-banner" role="status"><strong>${state.roundResult.title}</strong><p>${state.roundResult.detail}</p></div>
    <button class="primary-button next-button" type="button" data-action="next-round">${state.round === 4 ? "90. dakikaya geç" : "Sonraki tura geç"} <span aria-hidden="true">→</span></button>`;
}

function renderCenter() {
  const event = activeEvent();
  return `<section class="center-panel" aria-labelledby="event-heading">
    <div class="center-kicker"><span>${state.round + 1}. tur · Olay ${state.event + 1} / 3</span><span>Maç boyunca kilitler</span></div>
    ${state.event < 2 ? renderModifierEvent(event) : renderComparisonEvent(event)}
    ${state.event < 2 ? `<div class="guidance" role="status">Etki tüm hedef oyunculara otomatik uygulandı. Oyuncu seçimi yoktur.</div><div class="resolve-wrap"><button class="primary-button resolve-button" type="button" data-action="continue-event">Sonraki olaya geç <span aria-hidden="true">→</span></button></div>` : ""}
    ${renderEventResult()}
  </section>`;
}

function renderHistory() {
  return `<section class="history-panel" aria-label="Maç olay geçmişi"><div class="history-heading">MAÇ AKIŞI <span>${state.modifierHistory.length} modifier uygulandı</span></div>
    <div class="history">${state.modifierHistory.map(item => `<div class="history-item"><strong>TUR ${item.round}</strong> ${item.title}<span>${item.changes.length} güncel özellik değişikliği</span></div>`).join("")}
    ${state.roundHistory.map((item, index) => `<div class="history-item"><strong>TUR ${index + 1}</strong> ${item}</div>`).join("")}</div></section>`;
}

function renderMatch() {
  const event = activeEvent();
  const compareEvent = state.event === 2 ? event : null;
  app.innerHTML = `<div class="noise" aria-hidden="true"></div><div class="match-page screen-enter">
    <header class="match-header"><div class="header-brand"><div class="wordmark">FUTBOL<b>121</b></div><div class="live-tag"><strong>CANLI MAÇ</strong> · YEREL OYUN</div></div>
      <button class="quiet-button" type="button" data-action="new-match" aria-label="Yeni maça başla">Yeni maç ↺</button></header>
    ${renderScoreboard()}
    <div class="match-layout">
      ${renderTeamPanel(0, compareEvent)}
      ${renderCenter()}
      ${renderTeamPanel(1, compareEvent)}
    </div>
    ${renderHistory()}</div>`;
}

function renderNinetieth() {
  app.innerHTML = `<div class="noise" aria-hidden="true"></div><section class="special-screen screen-enter">
    <div class="final-card"><div class="final-mark" aria-hidden="true">90′</div><div class="eyebrow">Beş tur tamamlandı · Kaleciler finalde</div>
      <h1 class="special-title">90. DAKİKA</h1>
      <p class="special-sub">11 kartlık ortak desteden bu maç için tek bir kart açılır. Kaleci Sürprizi gelirse iki kalecinin güncel Kalecilik değeri karşılaştırılır.</p>
      <div class="chance-line"><span>3 × Kaleci Sürprizi</span><span>8 × Son dakika olayı</span><span>Skor 0'ın altına inmez</span></div>
      <button class="primary-button" type="button" data-action="reveal-final">Son kartı aç</button>
    </div></section>`;
}

function renderFinal() {
  const card = state.finalCard;
  const winner = state.score[0] === state.score[1] ? "Maç berabere" : `${TEAMS[state.score[0] > state.score[1] ? 0 : 1].name} galip`;
  const keeperInfo = card.type === "keeper" ? `<div class="keeper-comparison"><span>Beşiktaş · Kalecilik <b>${rosters[0][0].stats.Kalecilik}</b></span><span>Galatasaray · Kalecilik <b>${rosters[1][0].stats.Kalecilik}</b></span></div>` : "";
  app.innerHTML = `<div class="noise" aria-hidden="true"></div><section class="special-screen screen-enter">
    <div class="final-card"><div class="final-mark" aria-hidden="true">FT</div><div class="eyebrow">15 olay tamamlandı · Maç sona erdi</div>
      <h1 class="special-title">FINAL SKORU</h1>
      <div class="final-score-line"><span>Beşiktaş</span><b>${state.score[0]} : ${state.score[1]}</b><span>Galatasaray</span></div>
      <div class="champion-label">${winner}</div>
      <div class="special-result ${card.type === "own" ? "penalty" : ""}" role="status">${card.icon} ${card.title}</div>
      <p class="special-sub">${card.copy}${card.outcome ? ` ${card.outcome}` : ""}</p>
      ${keeperInfo}
      <div class="final-actions"><button class="primary-button" type="button" data-action="new-match">Yeni maç başlat</button>
        <button class="secondary-button" type="button" data-action="home">Ana ekrana dön</button></div>
    </div></section>`;
}

function render() {
  if (state.screen === "landing") renderLanding();
  else if (state.screen === "match") renderMatch();
  else if (state.screen === "ninetieth") renderNinetieth();
  else renderFinal();
}

function togglePlayer(teamIndex, playerId) {
  if (state.screen !== "match" || state.event !== 2 || state.roundResult || ![0, 1].includes(teamIndex)) return;
  const player = rosters[teamIndex].find(item => item.id === playerId);
  if (!player || player.position === "K" || state.lockedPlayers.has(playerId)) return;
  const selection = state.selectedPlayers[teamIndex];
  if (selection.includes(playerId) || selection.length >= 2) return;
  selection.push(playerId);
  state.lockedPlayers.add(playerId);
  state.guidance = `${player.name} seçildi ve maç boyunca kilitlendi.`;
  render();
}

function resolveComparison() {
  if (state.event !== 2 || state.roundResult || !state.selectedPlayers.every(selection => selection.length === 2)) return;
  const event = activeEvent();
  const selections = state.selectedPlayers.map((ids, teamIndex) => ids.map(id => rosters[teamIndex].find(player => player.id === id)));
  if (selections.some(team => team.length !== 2 || team.some(player => !player || player.position === "K"))) return;
  const values = selections.map(team => team.map(player => player.stats[event.stat]));
  const sums = values.map(pair => pair.reduce((sum, value) => sum + value, 0));
  const winner = sums[0] === sums[1] ? -1 : sums[0] > sums[1] ? 0 : 1;
  if (winner >= 0) state.score[winner] += 1;
  state.eventResult = {
    stat: event.stat, values, sums, winner,
    names: selections.map(team => team.map(player => player.name)),
  };
  state.roundResult = winner < 0
    ? { title: "Tur berabere · gol yok", detail: `Güncel ${event.stat}: ${sums[0]} – ${sums[1]}. Eşitlikte gol verilmez.` }
    : { title: `${TEAMS[winner].name} turu aldı · +1 gol`, detail: `Güncel ${event.stat}: ${sums[0]} – ${sums[1]}.` };
  state.roundHistory.push(winner < 0 ? "Berabere · gol yok" : `${TEAMS[winner].name} +1 gol`);
  render();
}

function advanceEvent() {
  if (state.screen !== "match" || state.event > 1) return;
  if (state.event === 1) {
    state.event = 2;
    state.selectedPlayers = [[], []];
    state.guidance = "";
  } else {
    state.event = 1;
    const modifier = activeEvent();
    applyModifier(modifier, true);
  }
  render();
}

function nextRound() {
  if (!state.roundResult) return;
  if (state.round === 4) {
    state.screen = "ninetieth";
  } else {
    state.round += 1;
    state.event = 0;
    state.selectedPlayers = [[], []];
    state.eventResult = null;
    state.roundResult = null;
    state.guidance = "";
    applyModifier(activeEvent(), true);
  }
  render();
}

function revealFinal() {
  if (state.screen !== "ninetieth") return;
  const card = { ...NINETIETH_DECK[Math.floor(Math.random() * NINETIETH_DECK.length)] };
  state.goalkeeperAvailableForFinal = [true, true];
  let outcome = "";
  if (card.type === "keeper") {
    const values = [rosters[0][0].stats.Kalecilik, rosters[1][0].stats.Kalecilik];
    if (values[0] === values[1]) outcome = `Berabere (${values[0]} – ${values[1]}); skor değişmedi.`;
    else {
      const winner = values[0] > values[1] ? 0 : 1;
      const loser = 1 - winner;
      state.score[loser] = Math.max(0, state.score[loser] - 1);
      outcome = `${TEAMS[winner].name} kalecisi üstün (${values[winner]} – ${values[loser]}); ${TEAMS[loser].name} skoru 1 azaldı.`;
    }
    state.goalkeeperAvailableForFinal = [false, false];
  } else if (card.type === "against") {
    const loser = 1 - card.team;
    state.score[loser] = Math.max(0, state.score[loser] - 1);
    outcome = `${TEAMS[loser].name} skoru 1 azaldı.`;
  } else if (card.type === "own") {
    state.score[card.team] = Math.max(0, state.score[card.team] - 1);
    outcome = `${TEAMS[card.team].name} skoru 1 azaldı.`;
  } else if (card.type === "for") {
    state.score[card.team] += 1;
    outcome = `${TEAMS[card.team].name} skoru 1 arttı.`;
  } else {
    outcome = "Skor değişmedi.";
  }
  state.finalCard = { ...card, outcome };
  state.screen = "final";
  render();
}

app.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button || button.disabled) return;
  const action = button.dataset.action;
  if (action === "start" || action === "new-match") newMatchState();
  else if (action === "select") togglePlayer(Number(button.dataset.team), button.dataset.player);
  else if (action === "continue-event") advanceEvent();
  else if (action === "resolve") resolveComparison();
  else if (action === "next-round") nextRound();
  else if (action === "home") { state = { screen: "landing" }; render(); }
  else if (action === "reveal-final") revealFinal();
});

render();
