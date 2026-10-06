import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";

const projectDir = dirname(dirname(fileURLToPath(import.meta.url)));
const source = readFileSync(join(projectDir, "main.js"), "utf8");

function createGame() {
  const app = {
    innerHTML: "",
    clickHandler: null,
    addEventListener(_type, handler) {
      this.clickHandler = handler;
    },
  };
  const math = Object.create(Math);
  math.random = () => 0;
  const sandbox = {
    document: { querySelector: () => app },
    Math: math,
  };
  const testAccess = `
    globalThis.game = {
      get state() { return state; },
      get rosters() { return rosters; },
      get modifiers() { return MODIFIERS; },
      get deck() { return NINETIETH_DECK; },
      get teams() { return TEAMS; },
      get comparisons() { return COMPARISONS; },
      clamp,
      applyModifier,
      newMatchState,
      togglePlayer,
      activeEvent,
      resolveComparison,
      nextRound,
      revealFinal
    };
  `;
  vm.runInNewContext(`${source}\n${testAccess}`, sandbox);
  const click = (action, data = {}) => {
    const button = { dataset: { action, ...data }, disabled: false };
    app.clickHandler({ target: { closest: () => button } });
  };
  return { game: sandbox.game, app, click };
}

function assertStatsInRange(rosters) {
  for (const roster of rosters) {
    for (const player of roster) {
      for (const value of Object.values(player.stats)) {
        assert.ok(Number.isInteger(value) && value >= 1 && value <= 11, `${player.name}: stat ${value} out of range`);
      }
    }
  }
}

test("kadrolar 1-4-4-2 ve modifier değerleri 1–11 aralığında", () => {
  const { game, click } = createGame();
  click("start");
  for (const roster of game.rosters) {
    assert.equal(roster.length, 11);
    assert.deepEqual(
      ["K", "D", "O", "F"].map(position => roster.filter(player => player.position === position).length),
      [1, 4, 4, 2],
    );
  }
  assert.equal(game.state.matchEvents.length, 5);
  assert.ok(game.state.matchEvents.every(round => round.length === 3));
  assert.equal(game.state.modifierHistory.length, 1);

  assert.equal(game.clamp(10 + 3), 11);
  assert.equal(game.clamp(11 + 2), 11);
  assert.equal(game.clamp(2 - 5), 1);

  const fieldPlayers = game.rosters.flat().filter(player => player.position !== "K");
  const keepers = game.rosters.flat().filter(player => player.position === "K");
  const weather = game.modifiers.find(modifier => modifier.title === "Yağmur");
  const fieldBefore = fieldPlayers.map(player => ({ ...player.stats }));
  const keepersBefore = keepers.map(player => ({ ...player.stats }));
  game.applyModifier(weather);
  for (const [index, player] of fieldPlayers.entries()) {
    assert.equal(player.stats.Hız, game.clamp(fieldBefore[index].Hız - 1));
    assert.equal(player.stats.Teknik, game.clamp(fieldBefore[index].Teknik - 1));
    assert.equal(player.stats.Defans, game.clamp(fieldBefore[index].Defans + 1));
  }
  for (const [index, keeper] of keepers.entries()) {
    assert.deepEqual(JSON.parse(JSON.stringify(keeper.stats)), keepersBefore[index]);
  }

  const derby = game.modifiers.find(modifier => modifier.title === "Derbi Gerilimi");
  const allBefore = game.rosters.flat().map(player => ({ ...player.stats }));
  game.applyModifier(derby);
  for (const [index, player] of game.rosters.flat().entries()) {
    assert.equal(player.stats.Fizik, game.clamp(allBefore[index].Fizik + 1));
    assert.equal(player.stats.Şut, game.clamp(allBefore[index].Şut - 1));
  }
  const keeperBefore = keepers[0].stats.Kalecilik;
  game.applyModifier(game.modifiers.find(modifier => modifier.title === "Kaleci Eldivenleri"));
  assert.equal(keepers[0].stats.Kalecilik, game.clamp(keeperBefore + 2));
  assertStatsInRange(game.rosters);
});

test("5 turda tüm saha oyuncuları bir kez kilitlenir ve karşılaştırma yalnızca güncel özelliği kullanır", () => {
  const { game, app, click } = createGame();
  click("start");
  assert.equal((app.innerHTML.match(/data-action="select"/g) ?? []).length, 22);
  assert.match(app.innerHTML, /başlangıç dizilişi 1-4-4-2/);
  assert.match(app.innerHTML, /T\d/);

  for (let round = 0; round < 5; round += 1) {
    if (round === 0) {
      console.log("round start", game.state.round, game.state.event, typeof app.clickHandler);
      click("continue-event");
      console.log("round after click", game.state.round, game.state.event, game.state.modifierHistory.length);
    } else {
      assert.equal(game.state.round, round);
    }
    assert.equal(game.state.event, 1);
    assert.equal(game.state.selectedPlayers.flat().length, 0);
    click("continue-event");
    assert.equal(game.state.event, 2);
    assert.equal(game.state.selectedPlayers.flat().length, 0);

    const picks = [];
    for (let team = 0; team < 2; team += 1) {
      const available = game.rosters[team].filter(player =>
        player.position !== "K" && !game.state.lockedPlayers.has(player.id),
      );
      assert.equal(available.length, 10 - round * 2);
      const chosen = available.slice(0, 2);
      picks.push(chosen);
      for (const player of chosen) {
        click("select", { team: String(team), player: player.id });
        assert.ok(game.state.lockedPlayers.has(player.id));
      }
      const keeper = game.rosters[team].find(player => player.position === "K");
      game.togglePlayer(team, keeper.id);
      assert.equal(game.state.selectedPlayers[team].length, 2);
    }

    const event = game.activeEvent();
    const sums = picks.map(team => team.reduce((sum, player) => sum + player.stats[event.stat], 0));
    const expectedWinner = sums[0] === sums[1] ? -1 : sums[0] > sums[1] ? 0 : 1;
    const beforeScore = [...game.state.score];
    click("resolve");
    assert.equal(game.state.roundResult !== null, true);
    assert.equal(game.state.eventResult.winner, expectedWinner);
    if (expectedWinner >= 0) assert.equal(game.state.score[expectedWinner], beforeScore[expectedWinner] + 1);
    else assert.deepEqual(Array.from(game.state.score), beforeScore);
    assert.equal((app.innerHTML.match(/Karşılaştır ve turu bitir/g) ?? []).length, 0);
    assertStatsInRange(game.rosters);

    for (const roster of game.rosters) {
      assert.equal(roster.filter(player => player.position !== "K" && game.state.lockedPlayers.has(player.id)).length, (round + 1) * 2);
      assert.equal(roster.filter(player => player.position === "K" && game.state.lockedPlayers.has(player.id)).length, 0);
    }
    click("next-round");
  }

  assert.equal(game.state.screen, "ninetieth");
  assert.equal(game.state.lockedPlayers.size, 20);
  assert.equal(game.state.goalkeeperAvailableForFinal.every(Boolean), true);
  assert.equal(game.deck.length, 11);
  assert.equal(game.deck.filter(card => card.type === "keeper").length, 3);
});

test("90. dakika kaleci kartı güncel Kalecilik değerlerini kullanır, skor tabanını korur ve yeni maç sıfırlar", () => {
  const { game, click, app } = createGame();
  click("start");
  for (let round = 0; round < 5; round += 1) {
    click("continue-event");
    click("continue-event");
    for (let team = 0; team < 2; team += 1) {
      const available = game.rosters[team].filter(player =>
        player.position !== "K" && !game.state.lockedPlayers.has(player.id),
      );
      for (const player of available.slice(0, 2)) click("select", { team: String(team), player: player.id });
    }
    click("resolve");
    click("next-round");
  }

  const keepers = game.rosters.map(roster => roster.find(player => player.position === "K"));
  keepers[0].stats.Kalecilik = 11;
  keepers[1].stats.Kalecilik = 1;
  game.state.score = [0, 1];
  click("reveal-final");
  assert.equal(game.state.finalCard.type, "keeper");
  assert.deepEqual(game.state.score, [0, 0]);
  assert.deepEqual(Array.from(game.state.goalkeeperAvailableForFinal), [false, false]);
  assert.match(app.innerHTML, /Beşiktaş · Kalecilik <b>11<\/b>/);
  assert.match(app.innerHTML, /Galatasaray · Kalecilik <b>1<\/b>/);

  click("new-match");
  assert.equal(game.state.screen, "match");
  assert.equal(game.state.round, 0);
  assert.equal(game.state.event, 0);
  assert.deepEqual(Array.from(game.state.score), [0, 0]);
  assert.equal(game.state.lockedPlayers.size, 0);
  assert.equal(JSON.stringify(game.state.selectedPlayers), JSON.stringify([[], []]));
});
