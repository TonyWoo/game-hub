// ============================================================
// levels.js —— 数学乐园 v2 出题引擎（视觉理解版）
// 核心理念：每一题的 3D 场景本身就是题目。
// 每题 = { text(辅助文字), options[4], answer, visual:{kind, ...params}, isTap }
// visual kinds: merge / takeaway / array / distribute / mixedStack /
//   ruler / clockFace / balance / anglePick / story / dotFlash
// 答案全部由程序验算得出；干扰项为常见误算
// ============================================================

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
function pick1(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function swapDigits(n) {
  return Number(String(n).split('').reverse().join(''));
}

// 组装 4 选 1：答案 + 干扰项候选，去重、补齐、打乱
function mkQ(text, answer, cands, visual, isTap = false) {
  const seen = new Set([answer]);
  const opts = [answer];
  for (const c of shuffle(cands)) {
    if (opts.length >= 4) break;
    if (!seen.has(c)) { seen.add(c); opts.push(c); }
  }
  let k = 1;
  while (opts.length < 4) {
    const v = typeof answer === 'number' ? answer + k * 3 + 1 : `${answer}?${k}`;
    if (!seen.has(v)) { seen.add(v); opts.push(v); }
    k++;
  }
  return { text, options: shuffle(opts), answer, visual, isTap };
}

// ---------- 第 1 关：水果加法乐园（两堆合并，十格篮 = 10） ----------
// 3D 里：左边 t1 篮 + s1 个、右边 t2 篮 + s2 个，飞到一起合并；满十自动装成新的一篮
function genAdd() {
  const qs = [];
  for (let i = 0; i < 8; i++) {
    const t1 = ri(1, 6), s1 = ri(1, 9);
    const t2 = ri(1, 6), s2 = ri(1, 9);
    const a = t1 * 10 + s1, b = t2 * 10 + s2;
    if (a + b > 100) { i--; continue; }
    const ans = a + b;
    qs.push(mkQ('两堆水果合起来是几个？', ans,
      [ans + 1, ans - 1, ans + 10, ans - 10, ans + 2, ans - 2, swapDigits(ans)],
      { kind: 'merge', a, b }));
  }
  return qs;
}

// ---------- 第 2 关：小火车减法（一节车厢 = 10 个苹果） ----------
// 3D 里：火车拉着 T 节车厢（每节 10 个苹果）+ 尾车散果，bW 节脱钩开走、bS 个散果跳下
function genSub() {
  const qs = [];
  for (let i = 0; i < 8; i++) {
    const T = ri(2, 6), s = ri(0, 9);
    const a = T * 10 + s;
    const bW = ri(1, T);
    const bS = ri(0, Math.min(9, s));
    const b = bW * 10 + bS;
    if (b > a - 5) { i--; continue; }
    const ans = a - b;
    qs.push(mkQ('苹果被运走了一些，还剩几个苹果？', ans,
      [ans + 1, ans - 1, ans + 10, ans - 10, ans + 2, ans - 2, swapDigits(ans)],
      { kind: 'takeaway', a, bW, bS }));
  }
  return qs;
}

// ---------- 第 3 关：乘法花园（R 行 × C 列花阵） ----------
// 3D 里：花朵排成方阵，逐行亮起；乘法 = 每份数 × 份数
function genMul() {
  const qs = [];
  for (let i = 0; i < 8; i++) {
    const r = ri(2, 9), c = ri(2, 9);
    const ans = r * c;
    qs.push(mkQ(`一行 ${c} 朵，${r} 行一共几朵？`, ans,
      [r + c, r * (c + 1), (r + 1) * c, r * (c - 1), ans + r, ans - r, ans + 1, ans - 1],
      { kind: 'array', r, c }));
  }
  return qs;
}

// ---------- 第 4 关：分饼干（平均分动画） ----------
// 3D 里：饼干一块一块自动飞进盘子；除法 = 平均分
function genDiv() {
  const qs = [];
  for (let i = 0; i < 8; i++) {
    const p = ri(2, 6);
    const per = ri(2, 9);
    const total = p * per;
    qs.push(mkQ('饼干分完了，每个盘子几块？', per,
      [per + 1, per - 1, p, per + 2, total, p + per],
      { kind: 'distribute', total, plates: p, per }));
  }
  return qs;
}

// ---------- 第 5 关：混合运算挑战营（光圈 = 先算的部分） ----------
// 3D 里：乘法部分被光圈圈起高亮，再添/拿走几块；先乘后加看得见
function genMix() {
  const qs = [];
  for (let i = 0; i < 8; i++) {
    const t = i % 3;
    let a, b, c, ans, op;
    if (t === 0) {           // a 组 × b 块，再添 c 块
      a = ri(2, 5); b = ri(2, 5); c = ri(2, 9);
      ans = a * b + c; op = 'mulAdd';
    } else if (t === 1) {    // a 组 × b 块，拿走 c 块
      a = ri(2, 5); b = ri(2, 5); c = ri(1, a * b - 3);
      ans = a * b - c; op = 'mulSub';
    } else {                 // a 块 + b 组 × c 块
      a = ri(2, 9); b = ri(2, 4); c = ri(2, 5);
      ans = a + b * c; op = 'addMul';
    }
    qs.push(mkQ('一共几块积木？', ans,
      [ans + 1, ans - 1, ans + 10, ans - 10, ans + 2, ans - 2],
      { kind: 'mixedStack', a, b, c, op }));
  }
  return qs;
}

// ---------- 第 6 关：尺子王国（彩带铺在尺子上比） ----------
function genLen() {
  const qs = [];
  for (let i = 0; i < 8; i++) {
    const t = i % 5;
    if (t === 0) {                       // 比长短：3D 里直接看
      let L1 = ri(25, 85), L2 = ri(25, 85);
      if (Math.abs(L1 - L2) < 12) { i--; continue; }
      const ans = L1 > L2 ? '红彩带长' : '蓝彩带长';
      qs.push(mkQ('哪条彩带长？', ans,
        ['红彩带长', '蓝彩带长', '一样长', '看不出来'].filter((x) => x !== ans),
        { kind: 'ruler', sub: 'which', L1, L2 }));
    } else if (t === 1) {                // 差多少：看尺子读数
      let L1 = ri(30, 90), L2 = ri(20, 80);
      if (Math.abs(L1 - L2) < 10) { i--; continue; }
      const ans = Math.abs(L1 - L2);
      qs.push(mkQ('红彩带比蓝彩带长几厘米？', ans,
        [ans + 1, ans - 1, ans + 10, ans - 10, ans + 5],
        { kind: 'ruler', sub: 'diff', L1, L2 }));
    } else if (t === 2) {                // 1 米 = 100 厘米：1 条大蓝条 vs 10 条橙条
      qs.push(mkQ('1 米 = ( ) 厘米', 100,
        [10, 1000, 90, 110, 101],
        { kind: 'ruler', sub: 'm2cm1' }));
    } else if (t === 3) {
      const X = ri(2, 5);
      qs.push(mkQ(`${X} 米 = ( ) 厘米`, X * 100,
        [X * 10, X * 100 + 10, X * 100 - 10, X * 1000],
        { kind: 'ruler', sub: 'm2cmX', X }));
    } else {
      const X = ri(2, 9);
      qs.push(mkQ(`${X * 100} 厘米 = ( ) 米`, X,
        [X * 10, X + 1, X - 1, X + 2],
        { kind: 'ruler', sub: 'cm2m', X }));
    }
  }
  return qs;
}

// ---------- 第 7 关：时间小达人（大钟表就是题目） ----------
function genTime() {
  const qs = [];
  for (let i = 0; i < 8; i++) {
    const h = ri(1, 12);
    const half = Math.random() < 0.5;
    const h2 = (h % 12) + 1;
    const hm = h === 1 ? 12 : h - 1;
    let ans, cands;
    if (half) {
      ans = `${h}点半`;
      cands = [`${h}点`, `${h2}点半`, `${hm}点半`, `${h2}点`];
    } else {
      ans = `${h}点`;
      cands = [`${h}点半`, `${h2}点`, `${hm}点`, `${h2}点半`];
    }
    qs.push(mkQ('钟表上是几点？', ans, cands,
      { kind: 'clockFace', h, m: half ? 30 : 0 }));
  }
  return qs;
}

// ---------- 第 8 关：天平称一称 ----------
function genWeight() {
  const qs = [];
  for (let i = 0; i < 8; i++) {
    const t = i % 4;
    if (t === 0) {                       // 看天平哪边下沉
      let wL = ri(2, 9), wR = ri(2, 9);
      if (wL === wR) { i--; continue; }
      const ans = wL > wR ? '左边重' : '右边重';
      qs.push(mkQ('哪边重？', ans,
        ['左边重', '右边重', '一样重', '看不出来'].filter((x) => x !== ans),
        { kind: 'balance', sub: 'which', wL, wR }));
    } else if (t === 1) {                // 1 千克 = 10 个 100 克，天平是平的
      qs.push(mkQ('1 千克 = ( ) 克（右边每个小砝码是 100 克）', 1000,
        [100, 10000, 900, 1100, 1010],
        { kind: 'balance', sub: 'kg2g1' }));
    } else if (t === 2) {
      const X = ri(2, 5);
      qs.push(mkQ(`${X} 千克 = ( ) 克（右边每个小砝码是 100 克）`, X * 1000,
        [X * 100, X * 1000 + 100, X * 1000 - 100, X * 10000],
        { kind: 'balance', sub: 'kg2gX', X }));
    } else {                             // 经典：1 千克棉花 vs 1 千克铁
      qs.push(mkQ('1 千克棉花和 1 千克铁，哪个重？', '一样重',
        ['棉花重', '铁重', '看不出来'],
        { kind: 'balance', sub: 'trick' }));
    }
  }
  return qs;
}

// ---------- 第 9 关：角的乐园（直接点 3D 模型作答） ----------
function genAngle() {
  const qs = [];
  const NAMES = { right: '直角', acute: '锐角', obtuse: '钝角' };
  const types = ['right', 'acute', 'obtuse', 'biggest', 'smallest', 'right', 'obtuse', 'acute'];
  for (let i = 0; i < 8; i++) {
    const t = types[i];
    const order = shuffle(['acute', 'right', 'obtuse']);
    let targetIdx, text;
    if (t === 'biggest') { targetIdx = order.indexOf('obtuse'); text = '哪个角最大？点一点'; }
    else if (t === 'smallest') { targetIdx = order.indexOf('acute'); text = '哪个角最小？点一点'; }
    else { targetIdx = order.indexOf(t); text = `哪个是${NAMES[t]}？点一点`; }
    qs.push({ text, options: [], answer: targetIdx, isTap: true,
      tapHint: '👆 直接点一点 3D 里你觉得对的那个角',
      visual: { kind: 'anglePick', order, target: targetIdx } });
  }
  return qs;
}

// ---------- 第 10 关：数学小博士（应用题 + 可数的 3D 情景） ----------
function genWord() {
  const qs = [];
  for (let i = 0; i < 8; i++) {
    const t = i % 6;
    if (t === 0) {          // n 盒 × m 块：3D 里真摆出来
      const n = ri(2, 4), m = ri(3, 6);
      qs.push(mkQ(`${n} 盒饼干，每盒 ${m} 块，一共多少块？`, n * m,
        [n + m, n * m + 1, n * m - 1, n * m + n],
        { kind: 'story', sub: 'cookieBox', n, m }));
    } else if (t === 1) {   // m 排 × n 人：3D 里站好队
      const m = ri(2, 4), n = ri(3, 6);
      qs.push(mkQ(`每排站 ${n} 人，一共 ${m} 排，一共多少人？`, n * m,
        [n + m, n * m + 1, n * m - 1, n * m - n],
        { kind: 'story', sub: 'rows', m, n }));
    } else if (t === 2) {   // 吃苹果：3D 里飞走一些
      const a = ri(10, 20), b = ri(3, a - 5);
      qs.push(mkQ('桌上的苹果被吃掉了一些，还剩几个？', a - b,
        [a - b + 1, a - b - 1, a - b + 2, b],
        { kind: 'story', sub: 'eatApple', a, b }));
    } else if (t === 3) {   // 分糖：3D 里分完
      const t2 = ri(2, 5), p = ri(2, 8);
      qs.push(mkQ('糖果分完了，每个小朋友几颗？', p,
        [p + 1, p - 1, t2, p + 2],
        { kind: 'story', sub: 'shareCandy', t: t2, p }));
    } else if (t === 4) {   // 还差几元：两摞硬币
      const a = ri(15, 30), b = ri(5, a - 5);
      qs.push(mkQ(`一本书 ${a} 元，小明有 ${b} 元，还差几元？`, a - b,
        [a - b + 1, a - b - 1, a + b, a - b + 10],
        { kind: 'story', sub: 'money', a, b }));
    } else {                // 公园人数：3D 里走进来
      const a = ri(8, 14), b = ri(5, 10);
      qs.push(mkQ(`公园里有 ${a} 人，又来了 ${b} 人，现在一共几人？`, a + b,
        [a + b + 1, a + b - 1, a + b + 10, Math.abs(a - b)],
        { kind: 'story', sub: 'park', a, b }));
    }
  }
  return qs;
}

// ---------- 新第 4 关：长度数感训练营（把数字/价格想成长度，对抗系统一） ----------
// 理念：数字不再是符号，是看得见的长度；价格画成条形，直觉误判一摆就明白
function genLenSense() {
  const qs = [];
  // --- 小节 1：数字变长度（2 题） ---
  {
    let a = ri(10, 99), b = ri(10, 99);
    if (a === b) b = b === 99 ? 98 : b + 1;
    const big = Math.max(a, b), small = Math.min(a, b), diff = big - small;
    const v = { kind: 'barGrow', a, b, nameA: String(a), nameB: String(b) };
    qs.push(mkQ('两根条形慢慢长出来——哪根长？它是几？', big,
      [small, big + 1, big - 1, big + 10, small + 1].filter((x) => x > 0 && x <= 99 && x !== big), v));
    qs.push(mkQ('长的那根比短的那根，长多少？', diff,
      [diff + 1, diff - 1, diff + 10, diff + 2, diff + 5].filter((x) => x > 0 && x !== diff), v));
  }
  // --- 小节 2：数轴找位置（2 题，直接点旗子） ---
  for (let k = 0; k < 2; k++) {
    const t = ri(8, 92);
    const set = new Set([t]);
    let guard = 0;
    while (set.size < 4 && guard++ < 60) {
      const v = t + pick1([-20, -10, 10, 20]) + ri(-2, 2);
      if (v >= 0 && v <= 100 && v !== t) set.add(v);
    }
    const flags = shuffle([...set]);
    qs.push({
      text: `${t} 应该站在数轴哪里？点一点旗子`,
      options: [], answer: flags.indexOf(t), isTap: true,
      tapHint: '👆 点一点旗子，帮数字找到它的位置',
      visual: { kind: 'numLine', target: t, flags },
    });
  }
  // --- 小节 3：价格想象（2 题） ---
  const GOODS = [
    { name: '铅笔', price: 8, shape: 'pencil', color: 0xffb066 },
    { name: '橡皮', price: 5, shape: 'eraser', color: 0x6cb8ff },
    { name: '文具盒', price: 24, shape: 'box', color: 0xb388eb },
    { name: '水杯', price: 32, shape: 'cup', color: 0x4fc3c3 },
    { name: '积木', price: 45, shape: 'blocks', color: 0xffd93d },
    { name: '书包', price: 56, shape: 'bag', color: 0xf76b8a },
  ];
  for (let k = 0; k < 2; k++) {
    const [g1, g2] = shuffle(GOODS).slice(0, 2);
    const diff = Math.abs(g1.price - g2.price);
    qs.push(mkQ(`${g1.name} ¥${g1.price}，${g2.name} ¥${g2.price}——哪个贵？贵多少？`, diff,
      [diff + 1, diff - 1, diff + 5, diff + 10, Math.max(1, diff - 5)].filter((x) => x > 0 && x !== diff),
      { kind: 'priceBar', items: [g1, g2] }));
  }
  // --- 小节 4：系统一陷阱（2 题） ---
  qs.push(mkQ('小明有 99 颗糖，小红有 100 颗糖——看条形，小红比小明多几颗？', 1,
    [2, 10, 0, 5],
    { kind: 'barGrow', a: 99, b: 100, nameA: '小明99颗', nameB: '小红100颗' }));
  qs.push({
    text: '1 米长的绳子，和 99 厘米长的绳子——看条形，哪个长？',
    options: ['1米的长', '99厘米的长', '一样长', '看不出来'],
    answer: '1米的长', isTap: false,
    visual: { kind: 'barGrow', a: 100, b: 99, nameA: '1米=100厘米', nameB: '99厘米' },
  });
  return qs;
}

// ---------- 点卡快闪（每关开场热身，3 张，不计星级） ----------
// 经典点阵：5 梅花 / 6 双排 / 7 / 8 / 9 九宫 / 10 双排
export function genDots() {
  return shuffle([5, 6, 7, 8, 9, 10]).slice(0, 3).map((count) => {
    const cands = [count + 1, count - 1, count + 2, count - 2].filter((v) => v > 0);
    return mkQ('', count, cands, { kind: 'dotFlash', count });
  });
}

// ---------- 关卡表 ----------
export const LEVELS = [
  { id: 'add', name: '水果加法乐园', icon: '🍎', desc: '看合并，学加法', gen: genAdd },
  { id: 'sub', name: '小火车减法', icon: '🚂', desc: '看拿走，学减法', gen: genSub },
  { id: 'mul', name: '乘法花园', icon: '🌸', desc: '花阵里看乘法', gen: genMul },
  { id: 'lensense', name: '长度数感训练营', icon: '📊', desc: '把数字想成长度', gen: genLenSense },
  { id: 'div', name: '分饼干', icon: '🍪', desc: '看平均分，学除法', gen: genDiv },
  { id: 'mix', name: '混合运算挑战营', icon: '🧮', desc: '光圈里先算', gen: genMix },
  { id: 'len', name: '尺子王国', icon: '📏', desc: '彩带比长短', gen: genLen },
  { id: 'time', name: '时间小达人', icon: '🕐', desc: '认钟表', gen: genTime },
  { id: 'weight', name: '天平称一称', icon: '⚖️', desc: '看天平学轻重', gen: genWeight },
  { id: 'angle', name: '角的乐园', icon: '📐', desc: '点一点认角', gen: genAngle },
  { id: 'word', name: '数学小博士', icon: '🎓', desc: '数着 3D 解应用题', gen: genWord },
];

export const Q_PER_LEVEL = 8;

// 星级：8 全对=3 星，6-7=2 星，4-5=1 星，低于 4 不过关
export function starsFor(firstTry) {
  if (firstTry >= 8) return 3;
  if (firstTry >= 6) return 2;
  if (firstTry >= 4) return 1;
  return 0;
}
