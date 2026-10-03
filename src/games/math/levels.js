// ============================================================
// levels.js —— 二年级数学 10 关出题引擎
// 每关 gen() 生成 8 道题：{ text, options[4], answer, prop }
// 答案全部由程序验算得出；干扰项为常见误算（差1、数位颠倒、运算顺序错）
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
function mkQ(text, answer, cands, prop) {
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
  return { text, options: shuffle(opts), answer, prop };
}

// ---------- 第 1 关：水果加法乐园（100 以内加法） ----------
function genAdd() {
  const qs = [];
  for (let i = 0; i < 8; i++) {
    const a = ri(12, 88);
    const b = ri(6, 100 - a);
    const ans = a + b;
    qs.push(mkQ(`${a} + ${b} = ?`, ans,
      [ans + 1, ans - 1, ans + 10, ans - 10, ans + 2, ans - 2, swapDigits(ans)],
      { kind: 'fruits', a, b }));
  }
  return qs;
}

// ---------- 第 2 关：小火车减法（100 以内减法） ----------
function genSub() {
  const qs = [];
  for (let i = 0; i < 8; i++) {
    const a = ri(25, 100);
    const b = ri(8, a - 3);
    const ans = a - b;
    qs.push(mkQ(`${a} − ${b} = ?`, ans,
      [ans + 1, ans - 1, ans + 10, ans - 10, ans + 2, ans - 2, swapDigits(ans)],
      { kind: 'train', a, b }));
  }
  return qs;
}

// ---------- 第 3 关：乘法花园（表内乘法） ----------
function genMul() {
  const qs = [];
  for (let i = 0; i < 8; i++) {
    const m = ri(2, 9);
    const n = ri(2, 9);
    const ans = m * n;
    qs.push(mkQ(`${m} × ${n} = ?`, ans,
      [m + n, m * (n + 1), (m + 1) * n, m * (n - 1), ans + 1, ans - 1, ans + m, ans - m],
      { kind: 'flowers', m, n }));
  }
  return qs;
}

// ---------- 第 4 关：分饼干（表内除法） ----------
function genDiv() {
  const qs = [];
  for (let i = 0; i < 8; i++) {
    const p = ri(2, 6);    // 人数（盘子数）
    const per = ri(2, 9);  // 每人几块
    const total = p * per;
    qs.push(mkQ(`${total} 块饼干，平均分给 ${p} 个小朋友，每人几块？`, per,
      [per + 1, per - 1, p, per + 2, total, p + per],
      { kind: 'cookies', total, plates: p, per }));
  }
  return qs;
}

// ---------- 第 5 关：混合运算挑战营（两步计算） ----------
function genMix() {
  const qs = [];
  const pats = [
    () => { const a = ri(2, 9), b = ri(2, 9), c = ri(2, 9); return [`${a} + ${b} × ${c} = ?`, a + b * c, (a + b) * c]; },
    () => { const a = ri(2, 9), b = ri(2, 9), c = ri(1, 9); return [`${a} × ${b} + ${c} = ?`, a * b + c, a * (b + c)]; },
    () => { const a = ri(3, 9), b = ri(2, 9), c = ri(1, Math.max(1, a * b - 2)); return [`${a} × ${b} − ${c} = ?`, a * b - c, a * b + c]; },
    () => { const a = ri(12, 60), b = ri(5, 30), c = ri(5, 30); return [`${a} − ${b} + ${c} = ?`, a - b + c, a - (b + c)]; },
    () => { const a = ri(2, 5), b = ri(2, 5), c = ri(2, 5); return [`${a} × ${b} × ${c} = ?`, a * b * c, a * b + c]; },
  ];
  for (let i = 0; i < 8; i++) {
    const [text, ans, mistake] = pick1(pats)();
    qs.push(mkQ(text, ans,
      [mistake, ans + 1, ans - 1, ans + 10, ans - 10, ans + 2],
      { kind: 'blocks', n: ans }));
  }
  return qs;
}

// ---------- 第 6 关：尺子王国（米和厘米） ----------
function genLen() {
  const qs = [];
  for (let i = 0; i < 8; i++) {
    const t = i % 3;
    if (t === 0) {
      const m = ri(1, 9);
      qs.push(mkQ(`${m} 米 = ( ) 厘米`, m * 100,
        [m * 10, m * 100 + 10, m * 100 - 10, m * 1000, m * 100 + 100],
        { kind: 'ruler' }));
    } else if (t === 1) {
      const cm = ri(1, 9) * 100;
      qs.push(mkQ(`${cm} 厘米 = ( ) 米`, cm / 100,
        [cm / 10, cm / 100 + 1, cm / 100 - 1, cm / 100 + 2],
        { kind: 'ruler' }));
    } else {
      const m = ri(1, 3);
      const cm = ri(1, 9) * 10 + ri(0, 9); // 10~99，保证 < m*100
      const mCm = m * 100;
      const text = `${m} 米和 ${cm} 厘米，哪个长？`;
      let ans, cands;
      if (mCm > cm) { ans = `${m}米长`; cands = [`${cm}厘米长`, '一样长', '比不出来']; }
      else if (mCm < cm) { ans = `${cm}厘米长`; cands = [`${m}米长`, '一样长', '比不出来']; }
      else { ans = '一样长'; cands = [`${m}米长`, `${cm}厘米长`, '比不出来']; }
      qs.push(mkQ(text, ans, cands, { kind: 'ruler' }));
    }
  }
  return qs;
}

// ---------- 第 7 关：时间小达人（认钟表：整时、半时） ----------
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
    qs.push(mkQ('钟表上是几点？', ans, cands, { kind: 'clock', h, m: half ? 30 : 0 }));
  }
  return qs;
}

// ---------- 第 8 关：天平称一称（克和千克） ----------
function genWeight() {
  const qs = [];
  for (let i = 0; i < 8; i++) {
    if (i === 3) {
      qs.push(mkQ('1 千克棉花和 1 千克铁，哪个重？', '一样重',
        ['棉花重', '铁重', '分不出来'], { kind: 'scale', tilt: 0 }));
      continue;
    }
    if (i % 2 === 0) {
      const kg = ri(1, 9);
      qs.push(mkQ(`${kg} 千克 = ( ) 克`, kg * 1000,
        [kg * 100, kg * 1000 + 100, kg * 1000 - 100, kg * 10000],
        { kind: 'scale', tilt: 0 }));
    } else {
      const g = ri(1, 9) * 1000;
      qs.push(mkQ(`${g} 克 = ( ) 千克`, g / 1000,
        [g / 100, g / 1000 + 1, g / 1000 - 1, g / 1000 + 2],
        { kind: 'scale', tilt: 0 }));
    }
  }
  return qs;
}

// ---------- 第 9 关：角的乐园（认直角 / 锐角 / 钝角） ----------
function genAngle() {
  const qs = [];
  const names = { right: '直角', acute: '锐角', obtuse: '钝角' };
  for (let i = 0; i < 8; i++) {
    const kind = i % 3;
    if (kind === 0) {
      const target = pick1(['right', 'acute', 'obtuse']);
      const order = shuffle(['acute', 'right', 'obtuse']);
      const ans = `第${order.indexOf(target) + 1}个`;
      qs.push(mkQ(`哪个是${names[target]}？`, ans,
        ['第1个', '第2个', '第3个', '一样大'].filter((x) => x !== ans),
        { kind: 'angles', order }));
    } else if (kind === 1) {
      const order = shuffle(['acute', 'right', 'obtuse']);
      const ans = `第${order.indexOf('obtuse') + 1}个`;
      qs.push(mkQ('哪个角最大？', ans,
        ['第1个', '第2个', '第3个', '一样大'].filter((x) => x !== ans),
        { kind: 'angles', order }));
    } else {
      const k = ri(0, 3);
      const base = [];
      for (let j = 0; j < 3; j++) base.push(j < k ? 'right' : pick1(['acute', 'obtuse']));
      const order = shuffle(base);
      const ans = `${k}个`;
      qs.push(mkQ('下图中有几个直角？', ans,
        ['0个', '1个', '2个', '3个'].filter((x) => x !== ans),
        { kind: 'angles', order }));
    }
  }
  return qs;
}

// ---------- 第 10 关：数学小博士（应用题） ----------
function genWord() {
  const qs = [];
  const makers = [
    () => { const n = ri(2, 5), m = ri(3, 9); return [`${n} 盒饼干，每盒 ${m} 块，一共多少块？`, n * m, [n + m, n * m + 1, n * m - 1, n * m + n]]; },
    () => { const n = ri(2, 4), m = ri(4, 9); return [`每排坐 ${n} 人，一共 ${m} 排，能坐多少人？`, n * m, [n + m, n * m + 1, n * m - 1, n * m - n]]; },
    () => { const a = ri(15, 50), b = ri(5, a - 5); return [`妈妈买了 ${a} 个苹果，吃了 ${b} 个，还剩几个？`, a - b, [a + b, a - b + 1, a - b - 1, a - b + 10]]; },
    () => { const t = ri(2, 6), p = ri(2, 9); return [`${t * p} 颗糖，平均分给 ${t} 个小朋友，每人几颗？`, p, [p + 1, p - 1, t, t * p]]; },
    () => { const a = ri(20, 60), b = ri(8, a - 8); return [`一本书 ${a} 元，小明有 ${b} 元，还差几元？`, a - b, [a + b, a - b + 1, a - b - 1, a - b + 10]]; },
    () => { const a = ri(15, 70), b = ri(5, 99 - a); return [`公园里有 ${a} 人，又来了 ${b} 人，现在一共有几人？`, a + b, [a + b + 1, a + b - 1, a + b + 10, Math.abs(a - b)]]; },
  ];
  for (let i = 0; i < 8; i++) {
    const [text, ans, cands] = pick1(makers)();
    qs.push(mkQ(text, ans, cands, { kind: 'blackboard' }));
  }
  return qs;
}

// ---------- 关卡表 ----------
export const LEVELS = [
  { id: 'add', name: '水果加法乐园', icon: '🍎', desc: '100 以内加法', gen: genAdd },
  { id: 'sub', name: '小火车减法', icon: '🚂', desc: '100 以内减法', gen: genSub },
  { id: 'mul', name: '乘法花园', icon: '🌸', desc: '表内乘法', gen: genMul },
  { id: 'div', name: '分饼干', icon: '🍪', desc: '表内除法', gen: genDiv },
  { id: 'mix', name: '混合运算挑战营', icon: '🧮', desc: '两步计算', gen: genMix },
  { id: 'len', name: '尺子王国', icon: '📏', desc: '米和厘米', gen: genLen },
  { id: 'time', name: '时间小达人', icon: '🕐', desc: '认钟表', gen: genTime },
  { id: 'weight', name: '天平称一称', icon: '⚖️', desc: '克和千克', gen: genWeight },
  { id: 'angle', name: '角的乐园', icon: '📐', desc: '认直角锐角钝角', gen: genAngle },
  { id: 'word', name: '数学小博士', icon: '🎓', desc: '应用题大闯关', gen: genWord },
];

export const Q_PER_LEVEL = 8;

// 星级：8 全对=3 星，6-7=2 星，4-5=1 星，低于 4 不过关
export function starsFor(firstTry) {
  if (firstTry >= 8) return 3;
  if (firstTry >= 6) return 2;
  if (firstTry >= 4) return 1;
  return 0;
}
