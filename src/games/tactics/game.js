// ============================================================
// game.js —— 小小战棋纯逻辑：地形 / 兵种 / 回合状态机 / 敌方 AI
// 无 DOM、无 Canvas，可被 node 直接 import 做逻辑自检
// ============================================================

// 地形编码：0草地 1森林 2山丘 3水
export const TERRAIN = { GRASS: 0, FOREST: 1, HILL: 2, WATER: 3 };
// 移动消耗（水不可进入）
export const MOVE_COST = [1, 2, 2, Infinity];
// 地形防御加成（山丘 +1）
export const TERRAIN_DEF = [0, 0, 1, 0];
// 地形闪避（森林 -20 命中）
export const TERRAIN_EVADE = [0, 20, 0, 0];

// 兵种数值：hp 攻 防 移 程
export const CLASSES = {
  sword:  { name: '剑士', hp: 20, atk: 6, def: 2, mov: 3, rng: 1 },
  lance:  { name: '枪兵', hp: 22, atk: 6, def: 3, mov: 3, rng: 1 },
  axe:    { name: '斧兵', hp: 24, atk: 7, def: 1, mov: 3, rng: 1 },
  archer: { name: '弓手', hp: 16, atk: 5, def: 1, mov: 2, rng: 2 },
  knight: { name: '骑士', hp: 26, atk: 6, def: 4, mov: 4, rng: 1 },
};
// 克制链：剑 > 斧 > 枪 > 剑，克制方攻击 +2；弓手不参与克制
export const ADVANTAGE = { sword: 'axe', axe: 'lance', lance: 'sword' };
export const ADV_BONUS = 2;

export const W = 8, H = 8;
const key = (x, y) => `${x},${y}`;
const manhattan = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

let uid = 0;

/** 新建单位 */
export function makeUnit(side, cls, x, y) {
  const c = CLASSES[cls];
  return {
    id: ++uid, side, cls,
    name: c.name,
    hp: c.hp, maxHp: c.hp,
    x, y,
    acted: false,   // 本回合是否已行动
    moved: false,   // 本回合是否已移动（移动后不可再走，只能攻击/待机）
    alive: true,
  };
}

/** 第 1 关：地形 + 双方布阵 */
export function level1() {
  // 地形：中间 2×3 森林带，两个山丘散布，右下一小片 2×2 水域
  const terrain = Array.from({ length: H }, () => Array(W).fill(TERRAIN.GRASS));
  const set = (x, y, t) => { terrain[y][x] = t; };
  for (const y of [2, 3, 4]) for (const x of [3, 4]) set(x, y, TERRAIN.FOREST);
  set(2, 1, TERRAIN.HILL);
  set(5, 1, TERRAIN.HILL);
  for (const y of [6, 7]) for (const x of [4, 5]) set(x, y, TERRAIN.WATER);

  const units = [
    // 我方（蓝）：左侧两列
    makeUnit('blue', 'sword', 0, 2),
    makeUnit('blue', 'sword', 0, 5),
    makeUnit('blue', 'lance', 1, 3),
    makeUnit('blue', 'archer', 1, 4),
    // 敌方（红）：右侧两列
    makeUnit('red', 'axe', 7, 2),
    makeUnit('red', 'axe', 7, 5),
    makeUnit('red', 'lance', 6, 3),
    makeUnit('red', 'archer', 6, 4),
  ];
  return { terrain, units };
}

/** 新对局状态 */
export function newGame() {
  const { terrain, units } = level1();
  return {
    terrain, units,
    phase: 'player',   // player | enemy | over
    round: 1,
    selectedId: null,
    moveRange: [],     // 当前选中单位可移动格
    attackRange: [],   // 当前选中单位可攻击格
    result: null,      // win | lose
  };
}

export const getUnit = (s, id) => s.units.find((u) => u.id === id);
export const at = (s, x, y) => s.units.find((u) => u.alive && u.x === x && u.y === y);
export const inBounds = (x, y) => x >= 0 && x < W && y >= 0 && y < H;
export const aliveOf = (s, side) => s.units.filter((u) => u.side === side && u.alive);

/** BFS 可移动格：按移动力 + 地形消耗，单位占据格不可通过/停留 */
export function calcMoveRange(s, unit) {
  const cls = CLASSES[unit.cls];
  const best = new Map(); // key -> 剩余移动力
  const start = key(unit.x, unit.y);
  best.set(start, cls.mov);
  const queue = [{ x: unit.x, y: unit.y, left: cls.mov }];
  const tiles = [];
  while (queue.length) {
    const cur = queue.shift();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = cur.x + dx, ny = cur.y + dy;
      if (!inBounds(nx, ny)) continue;
      const cost = MOVE_COST[s.terrain[ny][nx]];
      if (!isFinite(cost) || cost > cur.left) continue;
      const occ = at(s, nx, ny);
      if (occ && occ.id !== unit.id) continue; // 有单位的格子不可进入
      const nl = cur.left - cost;
      const k = key(nx, ny);
      if (nl > (best.get(k) ?? -1)) {
        best.set(k, nl);
        queue.push({ x: nx, y: ny, left: nl });
        tiles.push({ x: nx, y: ny });
      }
    }
  }
  return tiles;
}

/** 从某格出发的可攻击格（曼哈顿距离 <= 射程） */
export function calcAttackRange(s, unit, fromX = unit.x, fromY = unit.y) {
  const cls = CLASSES[unit.cls];
  const tiles = [];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const d = Math.abs(x - fromX) + Math.abs(y - fromY);
      if (d >= 1 && d <= cls.rng) tiles.push({ x, y });
    }
  }
  return tiles;
}

/** 克制加成：攻击方克制防守方兵种则 +2 */
export function advantageBonus(atkCls, defCls) {
  return ADVANTAGE[atkCls] === defCls ? ADV_BONUS : 0;
}

/**
 * 结算一次攻击，返回事件数组（供 UI 飘字/音效用）
 * [{ type:'miss'|'hit'|'counter-miss'|'counter-hit'|'die', from, to, dmg }]
 */
export function resolveAttack(s, attacker, defender, rand = Math.random) {
  const events = [];
  const aCls = CLASSES[attacker.cls];
  const dCls = CLASSES[defender.cls];

  // 主攻击：命中判定（森林 -20）
  const hitChance = 95 - TERRAIN_EVADE[s.terrain[defender.y][defender.x]];
  if (rand() * 100 < hitChance) {
    const dmg = Math.max(1,
      aCls.atk + advantageBonus(attacker.cls, defender.cls)
      - dCls.def - TERRAIN_DEF[s.terrain[defender.y][defender.x]]
      + Math.floor(rand() * 3) - 1);
    defender.hp -= dmg;
    events.push({ type: 'hit', from: attacker.id, to: defender.id, dmg });
    if (defender.hp <= 0) {
      defender.hp = 0; defender.alive = false;
      events.push({ type: 'die', from: attacker.id, to: defender.id });
      return events; // 死了就没反击了
    }
  } else {
    events.push({ type: 'miss', from: attacker.id, to: defender.id });
  }

  // 反击：存活、目标在射程内；弓手被近战贴身（距离1）不能反击
  const dist = manhattan(attacker, defender);
  const dRng = CLASSES[defender.cls].rng;
  const noCounter = defender.cls === 'archer' && dist === 1;
  if (!noCounter && dist >= 1 && dist <= dRng) {
    const hitC2 = 95 - TERRAIN_EVADE[s.terrain[attacker.y][attacker.x]];
    if (rand() * 100 < hitC2) {
      const dmg2 = Math.max(1,
        dCls.atk + advantageBonus(defender.cls, attacker.cls)
        - aCls.def - TERRAIN_DEF[s.terrain[attacker.y][attacker.x]]
        + Math.floor(rand() * 3) - 1);
      attacker.hp -= dmg2;
      events.push({ type: 'counter-hit', from: defender.id, to: attacker.id, dmg: dmg2 });
      if (attacker.hp <= 0) {
        attacker.hp = 0; attacker.alive = false;
        events.push({ type: 'die', from: defender.id, to: attacker.id });
      }
    } else {
      events.push({ type: 'counter-miss', from: defender.id, to: attacker.id });
    }
  }
  return events;
}

/** 选中我方未行动单位 */
export function selectUnit(s, id) {
  const u = getUnit(s, id);
  if (!u || !u.alive || u.side !== 'blue' || u.acted || s.phase !== 'player') return false;
  s.selectedId = id;
  if (u.moved) {
    // 已移动过：不再给移动范围，攻击范围按当前位置算
    s.moveRange = [];
    s.attackRange = calcAttackRange(s, u);
  } else {
    // 未移动：同时显示移动范围和当前位置的攻击范围（可直接攻击相邻敌人）
    s.moveRange = calcMoveRange(s, u);
    s.attackRange = calcAttackRange(s, u);
  }
  return true;
}

/** 取消选中 */
export function deselect(s) {
  s.selectedId = null;
  s.moveRange = [];
  s.attackRange = [];
}

/** 移动选中单位到目标格（必须在 moveRange 内） */
export function moveSelected(s, x, y) {
  const u = getUnit(s, s.selectedId);
  if (!u) return false;
  if (!s.moveRange.some((t) => t.x === x && t.y === y)) return false;
  u.x = x; u.y = y;
  u.moved = true; // 走过就不能再走
  s.moveRange = [];
  // 移动后计算可攻击格（只高亮有敌人的格由 UI 判断）
  s.attackRange = calcAttackRange(s, u);
  return true;
}

/** 选中单位攻击目标格上的敌方，返回事件数组 */
export function attackSelected(s, x, y, rand = Math.random) {
  const u = getUnit(s, s.selectedId);
  if (!u) return null;
  const target = at(s, x, y);
  if (!target || target.side !== 'red') return null;
  if (!s.attackRange.some((t) => t.x === x && t.y === y)) return null;
  const events = resolveAttack(s, u, target, rand);
  u.acted = true;
  deselect(s);
  checkEnd(s);
  return events;
}

/** 待机：选中单位跳过行动 */
export function standbySelected(s) {
  const u = getUnit(s, s.selectedId);
  if (!u) return false;
  u.acted = true;
  deselect(s);
  return true;
}

/** 检查胜负 */
export function checkEnd(s) {
  if (s.phase === 'over') return;
  if (aliveOf(s, 'red').length === 0) { s.phase = 'over'; s.result = 'win'; }
  else if (aliveOf(s, 'blue').length === 0) { s.phase = 'over'; s.result = 'lose'; }
}

/** 结束我方回合：敌方 AI 行动 */
export function endPlayerTurn(s, rand = Math.random) {
  if (s.phase !== 'player') return [];
  deselect(s);
  s.phase = 'enemy';
  const allEvents = [];
  for (const e of aliveOf(s, 'red')) {
    if (s.phase === 'over') break;
    allEvents.push(...enemyAct(s, e, rand));
    checkEnd(s);
  }
  if (s.phase !== 'over') {
    s.phase = 'player';
    s.round += 1;
    for (const u of s.units) { u.acted = false; u.moved = false; }
  }
  return allEvents;
}

/**
 * 敌方单位行动：找最近的我方存活单位；
 * 能直接攻击就攻击（选血最少的）；否则 BFS 走到能攻击的位置；
 * 实在打不到就向目标靠近。返回事件数组。
 */
export function enemyAct(s, e, rand = Math.random) {
  const events = [];
  const foes = aliveOf(s, 'blue');
  if (!foes.length) return events;
  // 最近的敌人
  let target = foes[0], bestD = manhattan(e, target);
  for (const f of foes) {
    const d = manhattan(e, f);
    if (d < bestD) { bestD = d; target = f; }
  }
  const eRng = CLASSES[e.cls].rng;

  // 1) 原地能打：挑射程内血最少的
  const inRange = foes.filter((f) => {
    const d = manhattan(e, f);
    return d >= 1 && d <= eRng;
  });
  if (inRange.length) {
    inRange.sort((a, b) => a.hp - b.hp);
    events.push(...resolveAttack(s, e, inRange[0], rand));
    e.acted = true;
    return events;
  }

  // 2) 找一个移动后能攻击的位置（BFS，选离目标最近的可攻击站位）
  const moves = calcMoveRange(s, e);
  let bestTile = null, bestScore = Infinity;
  for (const t of moves) {
    const d = Math.abs(t.x - target.x) + Math.abs(t.y - target.y);
    const canHit = d >= 1 && d <= eRng;
    // 能打到的优先；否则离目标越近越好
    const score = (canHit ? 0 : 1000) + d;
    if (score < bestScore) { bestScore = score; bestTile = t; }
  }
  if (bestTile) {
    e.x = bestTile.x; e.y = bestTile.y;
    events.push({ type: 'move', from: e.id, to: e.id, x: e.x, y: e.y });
    // 移动后能打就打（同样挑血最少）
    const after = foes.filter((f) => f.alive && (() => {
      const d = manhattan(e, f);
      return d >= 1 && d <= eRng;
    })());
    if (after.length) {
      after.sort((a, b) => a.hp - b.hp);
      events.push(...resolveAttack(s, e, after[0], rand));
    }
  }
  e.acted = true;
  return events;
}
