// ============================================================
// levels.js —— 语文乐园 · 二年级 出题引擎
// 每题 = { text(显示), speak(TTS 朗读), options[4], answer, visual:{kind,...} }
// ============================================================
import {
  SHENGZI, DUOYIN, ZUCI, FANYI, JINYI, DAPEI, BIAODIAN, JUZI, GUSHI, KANTU,
} from './data.js';

function ri(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1));
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 组装 4 选 1：答案 + 干扰项候选，去重、补齐、打乱
function mkQ(text, speak, answer, cands, visual) {
  const seen = new Set([answer]);
  const opts = [answer];
  for (const c of shuffle(cands)) {
    if (opts.length >= 4) break;
    if (!seen.has(c)) { seen.add(c); opts.push(c); }
  }
  let k = 1;
  while (opts.length < 4) {
    const v = `${answer}(${k})`;
    if (!seen.has(v)) { seen.add(v); opts.push(v); }
    k++;
  }
  return { text, speak, options: shuffle(opts), answer, visual };
}

// ---------- 第 1 关：生字果园 ----------
// 两种题型交替：听发音选字（TTS 读字音）/ 看拼音选字（只读提示，不读答案）
function genShengzi() {
  const qs = [];
  const pool = shuffle(SHENGZI);
  for (let i = 0; i < 8; i++) {
    const it = pool[i % pool.length];
    if (i % 2 === 0) {
      qs.push(mkQ('🔊 听发音，选出这个生字', it.ch, it.ch, it.d,
        { kind: 'tree', options: [it.ch, ...it.d], label: '听一听' }));
    } else {
      qs.push(mkQ(`拼音 ${it.py} 是哪个生字？`, '看拼音，选出正确的生字', it.ch, it.d,
        { kind: 'tree', options: [it.ch, ...it.d], label: it.py }));
    }
  }
  return qs;
}

// ---------- 第 2 关：多音字小火车 ----------
// 看句子选读音；TTS 只读提示不读句子（避免直接报出答案）
function genDuoyin() {
  const flat = [];
  for (const z of DUOYIN) for (const r of z.readings) flat.push({ ch: z.ch, ...r });
  const qs = [];
  const pool = shuffle(flat);
  for (let i = 0; i < 8; i++) {
    const it = pool[i % pool.length];
    const shown = it.s.replace('___', it.ch);
    qs.push(mkQ(`“${shown}”中，“${it.ch}”的正确读音是？`,
      '看句子，想一想这个多音字读什么', it.py, [it.py, ...it.wrong],
      { kind: 'train', sentence: shown, ch: it.ch }));
  }
  return qs;
}

// ---------- 第 3 关：组词花园 ----------
function genZuci() {
  const qs = [];
  const pool = shuffle(ZUCI);
  for (let i = 0; i < 8; i++) {
    const it = pool[i % pool.length];
    qs.push(mkQ(`“${it.ch}”可以组成下面哪个词？`, `“${it.ch}”可以组成哪个词？`,
      it.w, it.x, { kind: 'flower', ch: it.ch }));
  }
  return qs;
}

// ---------- 第 4 关：反义词跷跷板 ----------
function genFanyi() {
  const qs = [];
  const pool = shuffle(FANYI);
  const allWords = FANYI.flat();
  for (let i = 0; i < 8; i++) {
    const [w, anti] = pool[i % pool.length];
    const cands = shuffle(allWords.filter((x) => x !== w && x !== anti)).slice(0, 3);
    qs.push(mkQ(`“${w}”的反义词是？`, `“${w}”的反义词是？`, anti, cands,
      { kind: 'seesaw', word: w }));
  }
  return qs;
}

// ---------- 第 5 关：近义词手拉手 ----------
function genJinyi() {
  const qs = [];
  const pool = shuffle(JINYI);
  const allWords = JINYI.flat();
  for (let i = 0; i < 8; i++) {
    const [w, syn] = pool[i % pool.length];
    const cands = shuffle(allWords.filter((x) => x !== w && x !== syn)).slice(0, 3);
    qs.push(mkQ(`“${w}”的近义词是？`, `“${w}”的近义词是？`, syn, cands,
      { kind: 'hands', word: w }));
  }
  return qs;
}

// ---------- 第 6 关：词语搭配 ----------
function genDapei() {
  const qs = [];
  const pool = shuffle(DAPEI);
  for (let i = 0; i < 8; i++) {
    const it = pool[i % pool.length];
    qs.push(mkQ(`选词填空：${it.pattern}`, `选词填空：${it.pattern.replace('__', '什么')}`,
      it.a, it.x, { kind: 'board', pattern: it.pattern }));
  }
  return qs;
}

// ---------- 第 7 关：标点小卫士 ----------
function genBiaodian() {
  const qs = [];
  const pool = shuffle(BIAODIAN);
  for (let i = 0; i < 8; i++) {
    const it = pool[i % pool.length];
    const shown = it.s.replace('__', '＿');
    qs.push(mkQ(`选标点：${shown}`, `${it.s.replace(/__/g, '')}，选一个标点`,
      it.a, it.x, { kind: 'punct', sentence: shown }));
  }
  return qs;
}

// ---------- 第 8 关：句子魔术（把字句 ↔ 被字句） ----------
function genJuzi() {
  const qs = [];
  const pool = shuffle(JUZI);
  for (let i = 0; i < 8; i++) {
    const it = pool[i % pool.length];
    const toBei = it.q.includes('把');
    const target = toBei ? '被字句' : '把字句';
    qs.push(mkQ(`把句子换个说法（改成${target}）：${it.q}`,
      `把这个句子改成${target}`, it.a, it.x,
      { kind: 'theater', q: it.q, a: it.a }));
  }
  return qs;
}

// ---------- 第 9 关：古诗之夜 ----------
// 题型：给出上句选下句；干扰项从全部诗句池中取
function genGushi() {
  const pairs = [];
  for (const p of GUSHI) {
    for (let i = 0; i < p.lines.length - 1; i++) {
      pairs.push({ poem: p, prev: p.lines[i], next: p.lines[i + 1] });
    }
  }
  const allLines = GUSHI.flatMap((p) => p.lines);
  const qs = [];
  const pool = shuffle(pairs);
  for (let i = 0; i < 8; i++) {
    const it = pool[i % pool.length];
    const cands = shuffle(allLines.filter((l) => l !== it.next)).slice(0, 3);
    qs.push(mkQ(`《${it.poem.title}》${it.poem.author}：“${it.prev}”的下一句是？`,
      `${it.prev}，下一句是？`, it.next, cands,
      { kind: 'night', line: it.prev, title: it.poem.title, author: it.poem.author }));
  }
  return qs;
}

// ---------- 第 10 关：看图说话 ----------
function genKantu() {
  const qs = [];
  const pool = shuffle(KANTU);
  for (let i = 0; i < 8; i++) {
    const it = pool[i % pool.length];
    qs.push(mkQ('哪句话最符合这幅图？', '哪句话最符合这幅图？', it.a, it.x,
      { kind: 'scene', sceneId: it.id, name: it.name }));
  }
  return qs;
}

// ---------- 关卡表 ----------
export const LEVELS = [
  { id: 'shengzi', name: '生字果园', icon: '🍎', desc: '听音认生字', gen: genShengzi },
  { id: 'duoyin', name: '多音字小火车', icon: '🚂', desc: '看句子选读音', gen: genDuoyin },
  { id: 'zuci', name: '组词花园', icon: '🌸', desc: '生字组词', gen: genZuci },
  { id: 'fanyi', name: '反义词跷跷板', icon: '🔄', desc: '找反义词', gen: genFanyi },
  { id: 'jinyi', name: '近义词手拉手', icon: '🤝', desc: '找近义词', gen: genJinyi },
  { id: 'dapei', name: '词语搭配', icon: '🧩', desc: '量词形容词填空', gen: genDapei },
  { id: 'biaodian', name: '标点小卫士', icon: '❗', desc: '选标点符号', gen: genBiaodian },
  { id: 'juzi', name: '句子魔术', icon: '🔀', desc: '把字句被字句', gen: genJuzi },
  { id: 'gushi', name: '古诗之夜', icon: '🌙', desc: '上句接下句', gen: genGushi },
  { id: 'kantu', name: '看图说话', icon: '🖼️', desc: '选最佳描述', gen: genKantu },
];

export const Q_PER_LEVEL = 8;

// 星级：8 全对=3 星，6-7=2 星，4-5=1 星，低于 4 不过关
export function starsFor(firstTry) {
  if (firstTry >= 8) return 3;
  if (firstTry >= 6) return 2;
  if (firstTry >= 4) return 1;
  return 0;
}
