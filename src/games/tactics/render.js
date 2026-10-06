// ============================================================
// render.js —— Canvas 像素风绘制：地形 / 单位精灵 / 高亮 / 血条 / 飘字
// 精灵全部用字符画手绘；'H' 为头盔色，按阵营替换蓝/红
// ============================================================
import { TERRAIN, CLASSES, W, H } from './game.js';

// 调色板（'.' 透明；'H' 头盔按阵营替换；'~' 水波纹用两色交替）
const PAL = {
  K: '#1a1c2c', S: '#8a93a8', L: '#c9d2e8', F: '#ffd9a0', E: '#222222',
  W: '#8a5a2b', T: '#e8edf5', D: '#5b3a1a', G: '#46b95c', N: '#2b7a38',
  M: '#9aa3b2', m: '#6b7280', B: '#3b82f6', b: '#1d4ed8',
  R: '#ef4444', r: '#b91c1c', Y: '#fbbf24', C: '#7dd3fc', c: '#0284c7',
};

// 地形 16x16 点阵
const T_GRASS = [
  '................', '................', '..G.............',
  '................', '......G.........', '................',
  '................', '...........G....', '................',
  '....G...........', '................', '................',
  '..........G.....', '................', '.....G..........',
  '................', '................',
];
const T_FOREST = [
  '......NNN.......', '.....NNNNN......', '....NNNNNNN.....',
  '.....NNNNN......', '......NNN.......', '.......N........',
  '....NNNNNNN.....', '..NNNNNNNNN.....', '..NNNNNNNNN.....',
  '....NNNNNNN.....', '......NNN.......', '.......N........',
  '................', '......DDD.......', '......DDD.......',
  '................',
];
const T_HILL = [
  '................', '................', '.....MMM........',
  '....MMMMMM......', '...MMMMMMMM.....', '...MMMMMMMM.....',
  '..MMMMMMMMMM....', '..MMMMMMMMMM....', '.MMMMMMMMMMMM...',
  '.MMMMMMMMMMMM...', 'MMMMMMMMMMMMMM..', 'MMMMMMMMMMMMMM..',
  '................', '................', '................',
  '................',
];
const T_WATER = [
  'CCCCCCCCCCCCCCCC', 'CCCCCCCCCCCCCCCC', 'CCcCCcCCcCCcCCCC',
  'CCCCCCCCCCCCCCCC', 'CCCCCCCCCCCCCCCC', 'CCCCcCCcCCcCCcCC',
  'CCCCCCCCCCCCCCCC', 'CCCCCCCCCCCCCCCC', 'CCcCCcCCcCCcCCCc',
  'CCCCCCCCCCCCCCCC', 'CCCCCCCCCCCCCCCC', 'CCCCCcCCcCCcCCcC',
  'CCCCCCCCCCCCCCCC', 'CCCCCCCCCCCCCCCC', 'CCCCCCCCCCCCCCCC',
  'CCCCCCCCCCCCCCCC',
];

// 步兵 32x32（剑/枪/斧/弓共用身体，武器单独叠加绘制）
const SOLDIER = [
  '.........KKKKKKKKKKKKKK.........',
  '........HHHHHHHHHHHHHHHH........',
  '.......KHHLLLLHHHHHHHHHHK.......',
  '.......KHHLLLLHHHHHHHHHHK.......',
  '.......KHHLLLLHHHHHHHHHHK.......',
  '.......KHHLLLLHHHHHHHHHHK.......',
  '.......KHHLLLLHHHHHHHHHHK.......',
  '.......KHHHHHHHHHHHHHHHHK.......',
  '........HHHHHHHHHHHHHHHH........',
  '.......KHHHHHHHHHHHHHHHHK.......',
  '.......KKKKKKKKKKKKKKKKKK.......',
  '..........KKKKKKKKKKKK..........',
  '..........KFEEFFFFEEFK..........',
  '..........KFEEFFFFEEFK..........',
  '..........KFFFFFFFFFFK..........',
  '..........KFFFFKKFFFFK..........',
  '..........KKKKFFFFKKKK..........',
  '.............KFFFFK.............',
  '......KKKKKKKKKKKKKKKKKKKK......',
  '...KKKKSLLLLSSSSSSSSSSSSSKKKK...',
  '...KSSKSLLLLSSSSSSSSSSSSSKSSK...',
  '...KSSKSLLLLSSSSSSSSSSSSSKSSK...',
  '...KSSKSLLLLSSSSSSSSSSSSSKSSK...',
  '...KSSKSLLLLSSSSSSSSSSSSSKSSK...',
  '...KFFKSLLLLSSSSSSSSSSSSSKFFK...',
  '....FFKKYYYYYYKLLKYYYYYYKKFF....',
  '.......KYYYYYYKLLKYYYYYYK.......',
  '.........KSSSSK..KSSSSK.........',
  '.........KSSSSK..KSSSSK.........',
  '.........KSSSSK..KSSSSK.........',
  '........KDDDDDDKKDDDDDDK........',
  '........KDDDDDDKKDDDDDDK........'
];
// 骑士 32x32：马上骑手
const HORSE = [
  '..................KKKKKKK.......',
  '.................HHHHHHHHH......',
  '................KHLLLHHHHHK.....',
  '................KHLLLHHHHHK.....',
  '................KHLLLHHHHHK.....',
  '................KHHHHHHHHHK.....',
  '................KKKKKKKKKKK.....',
  '..................KKKKKKK.......',
  '......KKKK........KFEEEEK.......',
  '......KWWK........KFEEEEK.......',
  '.KKKKKKWWK........KFFFFFK.......',
  '.KWWWWKKKKK.......KKKKKKK.......',
  '.KWWEEWKKKK.....KKKKKKKKKK......',
  '.KWWEEWKKKK.....KSSSSSSSSK......',
  '.KWWWWKKKKKKKK..KSSSSSSSSK......',
  '.KKKWWKWWWWWWKKKKKKKKKKKKKK.....',
  '.mmKWWKWWWWWWKKDDDDDDDDDDDK.....',
  '.KKKKKKWKKKKKKKKKKKKKKKKKKKKK...',
  '......KWKWLLLLLWWWWWWWWWWWWWKKKK',
  '......KWKWLLLLLWWWWWWWWWWWWWKWWK',
  '......KKKWLLLLLWWWWWWWWWWWWWKWWK',
  '........KWWWWWWWWWWWWWWWWWWWKWWK',
  '........KWWWWWWWWWWWWWWWWWWWKWWK',
  '........KWWWWWWWWWWWWWWWWWWWKWWK',
  '........KWWWWWWWWWWWWWWWWWWWKWWK',
  '........KWWWWWWWWWWWWWWWWWWWKKKK',
  '........KKKKKKKKKKKKKKKKKKKKK...',
  '..........KWWK.......KWWK.......',
  '..........KWWK.......KWWK.......',
  '..........KWWK.......KWWK.......',
  '..........KKKK.......KKKK.......',
  '..........KKKK.......KKKK.......'
];

// 武器 8x8（画在单位右侧）
const W_SWORD = [
  '.......KK.......',
  '......KTTK......',
  '......KTTK......',
  '......KTTK......',
  '......KTTK......',
  '......KTTK......',
  '......KTTK......',
  '......KTTK......',
  '......KTTK......',
  '......KTTK......',
  '....KYYYYYYK....',
  '....KYYYYYYK....',
  '....KKKDDKKK....',
  '.......DD.......',
  '......KKKK......',
  '......KYYK......'
];
const W_LANCE = [
  '.....KKKKKK.....',
  '.....KTTTTK.....',
  '.....KTTTTK.....',
  '.....KTTTTK.....',
  '.....KTTTTK.....',
  '.....KKKKKK.....',
  '......KWWK......',
  '......KWWK......',
  '......KWWK......',
  '......KWWK......',
  '......KWWK......',
  '......KWWK......',
  '......KWWK......',
  '......KWWK......',
  '......KWWK......',
  '......KWWK......'
];
const W_AXE = [
  '.KKKKKKKKK......',
  '.TTSSSSSSK......',
  '.TTSSSSSSK......',
  '.TTSSSSSSK......',
  '.TTSSSSSSK......',
  '.TTSSSSSSK......',
  '.TTSSSSSSK......',
  '.TTSSSSSSK......',
  '.KKKKKKKKK......',
  '......KWWK......',
  '......KWWK......',
  '......KWWK......',
  '......KWWK......',
  '......KWWK......',
  '......KWWK......',
  '......KWWK......'
];
const W_BOW = [
  '.....KKm........',
  '....KWKm........',
  '...KWK.m........',
  '...KK..m........',
  '..KW...m........',
  '..KK...m........',
  '..KW...m........',
  '..KKDDDm........',
  '..KWDDDm........',
  '..KKDDDm........',
  '..KW...m........',
  '..KK...m........',
  '...KW..m........',
  '...KKK.m........',
  '....KK.m........',
  '.....KKm........'
];
const WEAPONS = { sword: W_SWORD, lance: W_LANCE, axe: W_AXE, archer: W_BOW };

// 精灵缓存：key -> 离屏 canvas
const cache = new Map();

function sprite(rows, helmMain, helmDark) {
  const ck = rows.join('') + helmMain;
  let cv = cache.get(ck);
  if (cv) return cv;
  const h = rows.length, w = rows[0].length;
  cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const g = cv.getContext('2d');
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ch = rows[y][x];
      if (ch === '.' || ch === ' ') continue;
      let col = PAL[ch];
      if (ch === 'H') col = helmMain;
      if (!col) continue;
      g.fillStyle = col;
      g.fillRect(x, y, 1, 1);
    }
  }
  cache.set(ck, cv);
  return cv;
}

// 灰度版（已行动单位）
function grayOf(cv) {
  const ck = 'gray:' + cv.width + 'x' + cv.height + cvToKey(cv);
  let out = cache.get(ck);
  if (out) return out;
  out = document.createElement('canvas');
  out.width = cv.width; out.height = cv.height;
  const g = out.getContext('2d');
  g.drawImage(cv, 0, 0);
  g.globalCompositeOperation = 'saturation';
  g.fillStyle = '#808080';
  g.fillRect(0, 0, out.width, out.height);
  g.globalCompositeOperation = 'source-over';
  cache.set(ck, out);
  return out;
}
// 给离屏 canvas 一个稳定 key（缓存用弱引用近似：用尺寸+首像素和）
const _keys = new WeakMap();
let _kid = 0;
function cvToKey(cv) {
  if (!_keys.has(cv)) _keys.set(cv, ++_kid);
  return _keys.get(cv);
}

const TERRAIN_BG = ['#7ec850', '#5da53f', '#b8a888', '#3b82c4'];
const TERRAIN_ROWS = [T_GRASS, T_FOREST, T_HILL, T_WATER];

/**
 * 绘制整场
 * @param {CanvasRenderingContext2D} g
 * @param {number} cell 格子像素
 * @param {object} s 游戏状态
 * @param {object} fx 表现层 { floaters:[{x,y,text,color,t}], shake }
 */
export function drawBoard(g, cell, s, fx) {
  const px = cell / 16; // 精灵像素缩放
  g.imageSmoothingEnabled = false;

  // 地形
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const t = s.terrain[y][x];
      g.fillStyle = TERRAIN_BG[t];
      g.fillRect(x * cell, y * cell, cell, cell);
      const cv = sprite(TERRAIN_ROWS[t]);
      g.drawImage(cv, x * cell, y * cell, cell, cell);
      g.strokeStyle = 'rgba(0,0,0,0.12)';
      g.lineWidth = 1;
      g.strokeRect(x * cell + 0.5, y * cell + 0.5, cell - 1, cell - 1);
    }
  }

  // 移动范围（蓝）/ 攻击范围（红）
  for (const t of s.moveRange) {
    g.fillStyle = 'rgba(59,130,246,0.45)';
    g.fillRect(t.x * cell, t.y * cell, cell, cell);
  }
  for (const t of s.attackRange) {
    g.fillStyle = 'rgba(239,68,68,0.4)';
    g.fillRect(t.x * cell, t.y * cell, cell, cell);
  }

  // 单位
  for (const u of s.units) {
    if (!u.alive) continue;
    const helm = u.side === 'blue' ? PAL.B : PAL.R;
    const dark = u.side === 'blue' ? PAL.b : PAL.r;
    const isKnight = u.cls === 'knight';
    const body = sprite(isKnight ? HORSE : SOLDIER, helm, dark);
    const bw = 32, bh = 32;
    const dw = cell * (bw / 32), dh = cell * (bh / 32);
    const dx = u.x * cell + (cell - dw) / 2;
    const dy = u.y * cell + (cell - dh) / 2 + (isKnight ? 0 : cell * 0.06);
    // 脚下阴影，衬出人物
    g.fillStyle = 'rgba(0,0,0,0.28)';
    const shW = cell * 0.62, shH = Math.max(3, cell * 0.1);
    g.beginPath();
    g.ellipse(u.x * cell + cell / 2, u.y * cell + cell - shH * 0.7, shW / 2, shH / 2, 0, 0, Math.PI * 2);
    g.fill();
    const img = u.acted && u.side === 'blue' ? grayOf(body) : body;
    // 已移动但还没行动：半透明（还能攻击/待机，但不能再走）
    const dimmed = !u.acted && u.moved && u.side === 'blue';
    if (dimmed) g.globalAlpha = 0.55;
    g.drawImage(img, dx, dy, dw, dh);
    // 武器（非骑士）
    if (!isKnight) {
      const wbody = sprite(WEAPONS[u.cls], helm, dark);
      // 已行动的单位武器一起变灰
      const wimg = u.acted && u.side === 'blue' ? grayOf(wbody) : wbody;
      const ww = cell * 0.5;
      g.drawImage(wimg, u.x * cell + cell * 0.55, u.y * cell + cell * 0.3, ww, ww);
    }
    if (dimmed) g.globalAlpha = 1;
    // 选中描边
    if (s.selectedId === u.id) {
      g.strokeStyle = '#fde047';
      g.lineWidth = Math.max(2, cell * 0.06);
      g.strokeRect(u.x * cell + 2, u.y * cell + 2, cell - 4, cell - 4);
    }
    // 血条（单位下方）
    const bwBar = cell * 0.9;
    const bx = u.x * cell + (cell - bwBar) / 2;
    const by = u.y * cell + cell - Math.max(3, cell * 0.1);
    g.fillStyle = 'rgba(0,0,0,0.55)';
    g.fillRect(bx, by, bwBar, Math.max(3, cell * 0.08));
    const pct = u.hp / u.maxHp;
    g.fillStyle = pct > 0.5 ? '#4ade80' : pct > 0.25 ? '#fbbf24' : '#ef4444';
    g.fillRect(bx, by, bwBar * pct, Math.max(3, cell * 0.08));
  }

  // 飘字
  const now = performance.now();
  g.textAlign = 'center';
  g.font = `bold ${Math.round(cell * 0.42)}px monospace`;
  for (const f of fx.floaters) {
    const age = (now - f.t0) / 900;
    if (age > 1) continue;
    const fy = f.y * cell - age * cell * 0.9;
    g.globalAlpha = 1 - age;
    g.lineWidth = 3;
    g.strokeStyle = '#1a1c2c';
    g.strokeText(f.text, f.x * cell + cell / 2, fy);
    g.fillStyle = f.color;
    g.fillText(f.text, f.x * cell + cell / 2, fy);
    g.globalAlpha = 1;
  }
  // 清掉过期的
  fx.floaters = fx.floaters.filter((f) => now - f.t0 <= 900);
}

/** 供 index.jsx 创建表现层对象 */
export function newFx() {
  return { floaters: [] };
}

/** 添加飘字（格子坐标） */
export function addFloater(fx, x, y, text, color) {
  fx.floaters.push({ x, y, text, color, t0: performance.now() });
}
