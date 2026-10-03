// ============================================================
// visuals.js —— 数学乐园 v2：3D 演示动画 = 题目本身
// 每种 kind 一个 builder：buildVisual({kind, ...}) ->
//   { group, dur(秒), update(p: 0..1), pickables? }
// 约定：update(p) 必须是 p 的纯函数（可随时重播）；动画播完 UI 才出选项
// ============================================================
import * as THREE from 'three';
import { mat, PAL, box, sph, cyl, cone, tor, grp, disposeGroup } from '../quiet3d/models/helpers.js';

export { disposeGroup };

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const lerp = (a, b, t) => a + (b - a) * t;
// 片段进度：p 落在 [p0,p1] 区间内的 0..1
const seg = (p, p0, p1) => Math.min(1, Math.max(0, (p - p0) / (p1 - p0)));
// 缓动
const ez = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

// 通用补间项：{ obj, from:V3, to:V3, p0, p1, arc?, shrink?, grow? }
function applyTweens(items, p) {
  for (const it of items) {
    const q = ez(seg(p, it.p0, it.p1));
    it.obj.position.lerpVectors(it.from, it.to, q);
    if (it.arc) it.obj.position.y += Math.sin(q * Math.PI) * it.arc;
    if (it.shrink) it.obj.scale.setScalar(Math.max(0.001, 1 - q));
    if (it.grow) it.obj.scale.setScalar(Math.max(0.001, q));
    if (it.fadeUp) it.obj.position.y += q * it.fadeUp;
  }
}

// ---------- 小水果（一颗 = 1 个单位） ----------
function miniFruit(color, r = 0.16) {
  const g = grp(sph(r, color, 0, 0, 0, { shadow: false }));
  return g;
}
// 一篮 = 10 个（2×5）
function fruitTray(color) {
  const t = grp();
  t.add(cyl(1.02, 0.85, 0.16, PAL.wood, 0, 0.08, 0));
  t.add(tor(1.02, 0.07, PAL.brown, 0, 0.16, 0, { rx: Math.PI / 2, shadow: false }));
  for (let i = 0; i < 10; i++) {
    const f = miniFruit(color);
    f.position.set(-0.72 + (i % 5) * 0.36, 0.3, i < 5 ? -0.2 : 0.2);
    t.add(f);
  }
  return t;
}
// 篮子网格位置（居中）
function trayGridPos(i, cols = 4) {
  return V3(((i % cols) - (cols - 1) / 2) * 2.35, 0.5, Math.floor(i / cols) * 2.55 - 0.9);
}

// ---------- 3D 文字标签（永远面向相机的精灵；node 审计时返回空占位） ----------
function textSprite(text, { size = 0.5, color = '#3a3a48' } = {}) {
  if (typeof document === 'undefined') return grp();
  const fs = 64, pad = 20;
  const meas = document.createElement('canvas').getContext('2d');
  meas.font = `bold ${fs}px "PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif`;
  const w = Math.ceil(meas.measureText(text).width) + pad * 2;
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = fs + pad * 2;
  const cx = cv.getContext('2d');
  cx.font = meas.font;
  cx.fillStyle = color;
  cx.textBaseline = 'middle';
  cx.fillText(text, pad, cv.height / 2);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  sp.scale.set((size * w) / cv.height, size, 1);
  sp.renderOrder = 10;
  return sp;
}

// ================= 长度数感：barGrow —— 两根条形按比例生长对比 =================
function visualBarGrow({ a, b, nameA, nameB }) {
  const g = grp();
  const maxV = Math.max(a, b), L = 7; // 最长 7 个单位
  const X0 = -3.4;
  const rows = [
    { v: a, name: nameA, color: PAL.blue, y: 3.0 },
    { v: b, name: nameB, color: PAL.orange, y: 1.6 },
  ];
  // 底座线
  g.add(box(8.4, 0.1, 1.1, PAL.cream, 0.4, 0.95, 0, { shadow: false }));
  const items = [];
  for (const r of rows) {
    const full = Math.max(0.14, (r.v / maxV) * L);
    const bar = box(1, 0.72, 0.72, r.color, X0, r.y, 0);
    const tag = textSprite(r.name, { size: 0.52 });
    tag.position.set(X0 - 1.35, r.y, 0);
    g.add(bar); g.add(tag);
    items.push({ bar, full });
  }
  const dur = 3.2;
  return {
    group: g, dur,
    update(p) {
      const q = ez(seg(p, 0.05, 0.8));
      for (const it of items) {
        const len = Math.max(0.001, it.full * q);
        it.bar.scale.x = len;
        it.bar.position.x = X0 + len / 2;
      }
    },
  };
}

// ================= 长度数感：numLine —— 0-100 数轴 + 4 面旗子（点选） =================
function visualNumLine({ flags }) {
  const g = grp();
  const X0 = -5, X1 = 5, y = 1.7;
  const xOf = (v) => X0 + (v / 100) * (X1 - X0);
  g.add(box(X1 - X0 + 0.7, 0.18, 0.3, PAL.wood, 0, y, 0));
  for (let v = 0; v <= 100; v += 10) {
    const tall = v % 50 === 0;
    g.add(box(0.1, tall ? 0.72 : 0.46, 0.32, PAL.dark, xOf(v), y + 0.24, 0, { shadow: false }));
    const lab = textSprite(String(v), { size: 0.4 });
    lab.position.set(xOf(v), y - 0.62, 0);
    g.add(lab);
  }
  const pickables = [];
  const FC = [PAL.red, PAL.blue, PAL.green, PAL.purple];
  const LETTERS = ['A', 'B', 'C', 'D'];
  const stands = [];
  flags.forEach((v, i) => {
    const st = grp();
    st.add(cyl(0.06, 0.06, 2.3, PAL.dark, 0, 1.15, 0));
    st.add(box(0.78, 0.56, 0.08, FC[i], 0.42, 2.0, 0)); // 三角旗用小旗代替
    const ch = textSprite(LETTERS[i], { size: 0.42, color: '#ffffff' });
    ch.position.set(0.42, 2.0, 0.06);
    st.add(ch);
    st.position.set(xOf(v), y + 0.1, 0);
    st.scale.setScalar(0.001);
    g.add(st);
    stands.push(st);
    const hit = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.85, 3.4, 10),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hit.position.set(xOf(v), y + 1.4, 0);
    hit.userData.angleIdx = i; // 复用 handleAngleTap 的点选机制
    hit.userData.stand = st;
    g.add(hit);
    pickables.push(hit);
  });
  const dur = 2.6;
  return {
    group: g, dur, pickables,
    update(p) {
      stands.forEach((st, i) => {
        const q = ez(seg(p, 0.15 + i * 0.14, 0.35 + i * 0.14));
        st.scale.setScalar(Math.max(0.001, q));
      });
    },
  };
}

// 商品小模型
function miniProduct(shape, color) {
  const m = grp();
  if (shape === 'pencil') {
    m.add(box(1.1, 0.13, 0.13, color, 0, 0, 0));
    m.add(cone(0.1, 0.28, PAL.cream, 0.68, 0, 0, { rz: -Math.PI / 2, shadow: false }));
  } else if (shape === 'eraser') {
    m.add(box(0.55, 0.32, 0.28, color, 0, 0, 0));
  } else if (shape === 'box') {
    m.add(box(0.95, 0.55, 0.62, color, 0, 0, 0));
    m.add(box(0.99, 0.12, 0.66, PAL.cream, 0, 0.2, 0, { shadow: false }));
  } else if (shape === 'cup') {
    m.add(cyl(0.3, 0.23, 0.62, color, 0, 0, 0));
  } else if (shape === 'blocks') {
    m.add(box(0.42, 0.42, 0.42, color, -0.26, -0.05, 0));
    m.add(box(0.42, 0.42, 0.42, color, 0.26, 0.12, 0));
  } else if (shape === 'bag') {
    m.add(box(0.85, 0.95, 0.38, color, 0, 0, 0));
    m.add(tor(0.3, 0.07, PAL.brown, 0, 0.6, 0, { shadow: false }));
  }
  return m;
}

// ================= 长度数感：priceBar —— 价格长条 + 商品 =================
function visualPriceBar({ items }) {
  const g = grp();
  const maxP = Math.max(items[0].price, items[1].price), L = 6.4;
  const X0 = -3.2;
  g.add(box(8.4, 0.1, 1.1, PAL.cream, 0.4, 0.95, 0, { shadow: false }));
  const grows = [];
  items.forEach((it, i) => {
    const y = i === 0 ? 3.0 : 1.6;
    const full = Math.max(0.14, (it.price / maxP) * L);
    const bar = box(1, 0.72, 0.72, it.color, X0, y, 0);
    const tag = textSprite(`${it.name} ¥${it.price}`, { size: 0.52 });
    tag.position.set(X0 - 1.55, y + 0.62, 0);
    const prod = miniProduct(it.shape, it.color);
    prod.position.set(X0 - 1.55, y - 0.35, 0);
    g.add(bar); g.add(tag); g.add(prod);
    grows.push({ bar, full });
  });
  const dur = 3.2;
  return {
    group: g, dur,
    update(p) {
      const q = ez(seg(p, 0.05, 0.8));
      for (const it of grows) {
        const len = Math.max(0.001, it.full * q);
        it.bar.scale.x = len;
        it.bar.position.x = X0 + len / 2;
      }
    },
  };
}

// ================= 第 1 关：merge —— 两堆合并 =================
function visualMerge({ a, b }) {
  const t1 = Math.floor(a / 10), s1 = a % 10;
  const t2 = Math.floor(b / 10), s2 = b % 10;
  const g = grp();
  const items = [];
  const L = 3.6; // 左右两堆初始间距

  // 左堆篮子：t1 个
  for (let i = 0; i < t1; i++) {
    const tr = fruitTray(PAL.red);
    const fp = trayGridPos(i).add(V3(-L, 0, 0));
    const tp = trayGridPos(i);
    tr.position.copy(fp);
    g.add(tr);
    items.push({ obj: tr, from: fp, to: tp, p0: 0, p1: 0.45 });
  }
  // 右堆篮子：t2 个（最终排在左堆之后）
  for (let i = 0; i < t2; i++) {
    const tr = fruitTray(PAL.orange);
    const fp = trayGridPos(i).add(V3(L, 0, 0));
    const tp = trayGridPos(t1 + i);
    tr.position.copy(fp);
    g.add(tr);
    items.push({ obj: tr, from: fp, to: tp, p0: 0, p1: 0.45 });
  }
  // 散果
  const singles = [];
  const sN = s1 + s2;
  for (let j = 0; j < sN; j++) {
    const left = j < s1;
    const f = miniFruit(left ? PAL.red : PAL.orange, 0.2);
    const jj = left ? j : j - s1;
    const cnt = left ? s1 : s2;
    const fp = V3((left ? -L : L) + (jj - (cnt - 1) / 2) * 0.55, 0.7, 2.6);
    const tp = V3((j - (sN - 1) / 2) * 0.55, 0.7, 2.6);
    f.position.copy(fp);
    g.add(f);
    singles.push(f);
    items.push({ obj: f, from: fp, to: tp, p0: 0.45, p1: 0.68 });
  }
  // 满十进一：10 个散果装成新的一篮
  const needBundle = sN >= 10;
  let newTray = null;
  if (needBundle) {
    newTray = fruitTray(PAL.pink);
    const tp = trayGridPos(t1 + t2);
    newTray.position.copy(tp);
    newTray.scale.setScalar(0.001);
    g.add(newTray);
    for (let j = 0; j < 10; j++) {
      const f = singles[j];
      const fp = V3((j - (sN - 1) / 2) * 0.55, 0.7, 2.6);
      items.push({ obj: f, from: fp, to: tp.clone().add(V3(0, 0.5, 0)), p0: 0.72, p1: 0.95, shrink: true });
    }
  }

  const dur = 6;
  return {
    group: g, dur,
    update(p) {
      applyTweens(items, p);
      if (newTray) newTray.scale.setScalar(Math.max(0.001, ez(seg(p, 0.78, 0.95))));
    },
  };
}

// ================= 第 2 关：takeaway —— 小火车运走 =================
function visualTakeaway({ a, bW, bS }) {
  const T = Math.floor(a / 10), s = a % 10;
  const g = grp();
  const items = [];
  const carW = 2.7;
  const x0 = -((T - 1) / 2) * carW;

  const wagon = (color, withApples) => {
    const w = grp();
    w.add(box(2.1, 0.7, 1.25, color, 0, 1.05, 0));
    w.add(box(2.1, 0.18, 1.25, PAL.dark, 0, 0.62, 0));
    for (const wx of [-0.7, 0.7]) for (const wz of [-0.55, 0.55])
      w.add(cyl(0.3, 0.3, 0.16, PAL.dark, wx, 0.3, wz, { rx: Math.PI / 2 }));
    if (withApples) for (let i = 0; i < 10; i++) {
      const f = miniFruit(PAL.red, 0.15);
      f.position.set(-0.72 + (i % 5) * 0.36, 1.62, i < 5 ? -0.28 : 0.28);
      w.add(f);
    }
    return w;
  };
  // 车头
  const engine = grp(
    box(1.9, 0.85, 1.25, PAL.red, 0, 1.05, 0),
    box(0.95, 0.85, 1.15, PAL.navy, -0.4, 1.85, 0),
    cyl(0.16, 0.22, 0.7, PAL.dark, 0.55, 1.75, 0),
  );
  for (const wx of [-0.6, 0.6]) for (const wz of [-0.55, 0.55])
    engine.add(cyl(0.3, 0.3, 0.16, PAL.dark, wx, 0.3, wz, { rx: Math.PI / 2 }));
  engine.position.set(x0 - carW, 0.5, 0);
  g.add(engine);
  // 车厢（每节 10 个苹果）
  const wagons = [];
  const colors = [PAL.blue, PAL.green, PAL.yellow, PAL.purple, PAL.orange, PAL.teal];
  for (let i = 0; i < T; i++) {
    const w = wagon(colors[i % colors.length], true);
    w.position.set(x0 + i * carW, 0.5, 0);
    g.add(w); wagons.push(w);
  }
  // 尾车散果
  const caboose = wagon(PAL.pink, false);
  caboose.position.set(x0 + T * carW, 0.5, 0);
  g.add(caboose);
  const cabSingles = [];
  for (let j = 0; j < s; j++) {
    const f = miniFruit(PAL.red, 0.17);
    f.position.set(-0.6 + j * (1.2 / Math.max(1, s - 1 || 1)) * (s > 1 ? 1 : 0), 1.62, 0);
    if (s === 1) f.position.x = 0;
    caboose.add(f); cabSingles.push(f);
  }
  // 铁轨
  g.add(box(16, 0.1, 0.2, PAL.gray, 0, 0.55, 0.85, { shadow: false }));
  g.add(box(16, 0.1, 0.2, PAL.gray, 0, 0.55, -0.85, { shadow: false }));

  // 开走：最后 bW 节车厢脱钩向右开走；bS 个散果跳下消失
  for (let k = 0; k < bW; k++) {
    const w = wagons[T - 1 - k];
    const fp = w.position.clone();
    items.push({ obj: w, from: fp, to: fp.clone().add(V3(16, 0, 0)), p0: 0.18, p1: 0.62 });
  }
  for (let j = 0; j < bS; j++) {
    const f = cabSingles[s - 1 - j]; // 从尾部取
    const fp = f.position.clone();
    items.push({ obj: f, from: fp, to: fp.clone().add(V3(0.5, 0, 1.6)), p0: 0.25 + j * 0.03, p1: 0.6 + j * 0.03, arc: 1.6, shrink: true });
  }

  const dur = 6;
  return { group: g, dur, update: (p) => applyTweens(items, p) };
}

// ================= 第 3 关：array —— 花阵 =================
function visualArray({ r, c }) {
  const g = grp();
  const rows = [];
  const dx = Math.min(1.05, 8.6 / c);
  const dz = Math.min(1.15, 6.6 / r);
  const petal = [PAL.pink, PAL.yellow, PAL.purple, PAL.orange, PAL.mint, PAL.blue, PAL.rose, PAL.teal, PAL.red];
  for (let i = 0; i < r; i++) {
    const heads = [];
    for (let j = 0; j < c; j++) {
      const f = grp();
      f.add(box(0.09, 0.8, 0.09, PAL.green, 0, 0.9, 0, { shadow: false }));
      const head = sph(0.24, petal[i % petal.length], 0, 1.42, 0, { shadow: false });
      head.add(sph(0.1, PAL.yellow, 0, 0.16, 0, { shadow: false }));
      f.add(head);
      f.position.set((j - (c - 1) / 2) * dx, 0.5, (i - (r - 1) / 2) * dz);
      g.add(f);
      heads.push(head);
    }
    rows.push(heads);
  }
  const dur = 5;
  return {
    group: g, dur,
    update(p) {
      // 逐行亮起（缩放脉冲）
      for (let i = 0; i < r; i++) {
        const q = seg(p, (i / r) * 0.8, ((i + 1) / r) * 0.8);
        const s = 1 + 0.45 * Math.sin(q * Math.PI);
        for (const h of rows[i]) h.scale.setScalar(s);
      }
      // 结尾整体轻轻摇摆
      if (p > 0.85) {
        const w = Math.sin((p - 0.85) * 40) * 0.05;
        g.rotation.y = w;
      }
    },
  };
}

// ================= 第 4 关：distribute —— 分饼干 =================
function visualDistribute({ total, plates, per }) {
  const g = grp();
  const items = [];
  // 盘子
  const platePos = [];
  for (let i = 0; i < plates; i++) {
    const px = (i - (plates - 1) / 2) * 2.7;
    platePos.push(V3(px, 0.5, 0.6));
    g.add(cyl(1.02, 0.8, 0.14, PAL.white, px, 0.57, 0.6));
  }
  // 饼干起始：后方托盘上排好
  const cols = Math.ceil(Math.sqrt(total * 1.6));
  const startPos = [];
  for (let k = 0; k < total; k++) {
    const cx = (k % cols - (cols - 1) / 2) * 0.66;
    const rz = Math.floor(k / cols);
    startPos.push(V3(cx * 1.15 - 1.2, 0.62 + (rz % 2) * 0.02, -3.1 - rz * 0.62));
  }
  g.add(box(cols * 0.72, 0.1, Math.ceil(total / cols) * 0.66 + 0.3, PAL.wood, -1.2, 0.55, -3.1 - (Math.ceil(total / cols) - 1) * 0.31));
  // 每块饼干的目标槽位
  for (let k = 0; k < total; k++) {
    const ck = grp();
    ck.add(cyl(0.26, 0.26, 0.1, 0xd9a066, 0, 0, 0, { shadow: false }));
    ck.add(cyl(0.05, 0.05, 0.12, PAL.brown, 0.08, 0, 0.05, { shadow: false }));
    ck.add(cyl(0.05, 0.05, 0.12, PAL.brown, -0.08, 0, -0.04, { shadow: false }));
    const pi = k % plates;
    const si = Math.floor(k / plates);
    const aa = (si / per) * Math.PI * 2;
    const rr = per <= 4 ? 0.3 : 0.48;
    const tp = platePos[pi].clone().add(V3(Math.cos(aa) * rr, 0.18, Math.sin(aa) * rr));
    ck.position.copy(startPos[k]);
    g.add(ck);
    const t0 = 0.06 + (k / total) * 0.68;
    items.push({ obj: ck, from: startPos[k], to: tp, p0: t0, p1: t0 + 0.1, arc: 1.8 });
  }
  const dur = 6.5;
  return { group: g, dur, update: (p) => applyTweens(items, p) };
}

// ================= 第 5 关：mixedStack —— 混合运算 =================
function visualMixed({ a, b, c, op }) {
  const g = grp();
  const items = [];
  const BS = 0.72;
  const blockColors = [PAL.red, PAL.orange, PAL.yellow, PAL.green, PAL.blue, PAL.purple];
  const mkBlock = (i) => box(BS, BS, BS, blockColors[i % blockColors.length], 0, 0, 0);

  if (op === 'mulAdd' || op === 'mulSub') {
    // a 组 × b 块
    let bi = 0;
    for (let grpI = 0; grpI < a; grpI++) {
      for (let j = 0; j < b; j++) {
        const bl = mkBlock(bi++);
        const tp = V3((grpI - (a - 1) / 2) * 2.1 + (j - (b - 1) / 2) * 0.82, 0.86, 0);
        bl.position.copy(tp);
        g.add(bl);
        items.push({ obj: bl, from: tp.clone().add(V3(0, 5, 0)), to: tp, p0: 0.02 * bi, p1: 0.02 * bi + 0.12 });
      }
    }
    // 光圈：圈住乘法部分
    const ringR = Math.max(1.3, ((a - 1) * 2.1 + b * 0.82) / 2 + 0.45);
    const ring = tor(ringR, 0.1, PAL.yellow, 0, 0.62, 0, { rx: Math.PI / 2, shadow: false });
    ring.material = ring.material; // 复用缓存材质
    g.add(ring);
    const ringBase = ring.scale.x;
    if (op === 'mulAdd') {
      // c 块从天而降，堆在右边
      for (let k = 0; k < c; k++) {
        const bl = mkBlock(bi++);
        const tp = V3(ringR + 1.4 + (k % 3) * 0.82, 0.86 + Math.floor(k / 3) * 0.74, 0.4);
        bl.position.copy(tp.clone().add(V3(0, 5.5, 0)));
        g.add(bl);
        items.push({ obj: bl, from: bl.position.clone(), to: tp, p0: 0.55 + k * 0.035, p1: 0.62 + k * 0.035 });
      }
    } else {
      // c 块飞走消失
      const victims = [];
      for (let k = 0; k < c; k++) victims.push(k);
      // 从现有块里取最后 c 块
      const all = [];
      g.traverse((o) => { if (o.geometry && o.geometry.type === 'BoxGeometry' && o !== ring) all.push(o); });
      const gone = all.slice(-c);
      gone.forEach((bl, k) => {
        items.push({ obj: bl, from: bl.position.clone(), to: bl.position.clone().add(V3(2.5, 3.5, 0)), p0: 0.55 + k * 0.04, p1: 0.66 + k * 0.04, shrink: true });
      });
    }
    const dur = 6;
    return {
      group: g, dur,
      update(p) {
        applyTweens(items, p);
        const s = ringBase * (1 + 0.04 * Math.sin(p * 20));
        ring.scale.setScalar(s);
      },
    };
  }
  // addMul：a 个散块 + b 组 × c 块（光圈圈住后者）
  let bi = 0;
  for (let j = 0; j < a; j++) {
    const bl = mkBlock(bi++);
    const tp = V3(-3.4 + (j % 5) * 0.82, 0.86 + Math.floor(j / 5) * 0.74, 1.8);
    bl.position.copy(tp);
    g.add(bl);
    items.push({ obj: bl, from: tp.clone().add(V3(0, 5, 0)), to: tp, p0: 0.02 * j, p1: 0.02 * j + 0.1 });
  }
  for (let grpI = 0; grpI < b; grpI++) {
    for (let j = 0; j < c; j++) {
      const bl = mkBlock(bi++);
      const tp = V3(0.6 + (grpI - (b - 1) / 2) * 2.1 + (j - (c - 1) / 2) * 0.82, 0.86, -0.6);
      bl.position.copy(tp);
      g.add(bl);
      items.push({ obj: bl, from: tp.clone().add(V3(0, 5, 0)), to: tp, p0: 0.25 + 0.02 * bi, p1: 0.35 + 0.02 * bi });
    }
  }
  const ringR = Math.max(1.3, ((b - 1) * 2.1 + c * 0.82) / 2 + 0.45);
  const ring = tor(ringR, 0.1, PAL.yellow, 0.6, 0.62, -0.6, { rx: Math.PI / 2, shadow: false });
  g.add(ring);
  const dur = 6;
  return {
    group: g, dur,
    update(p) {
      applyTweens(items, p);
      ring.scale.setScalar(1 + 0.04 * Math.sin(p * 20));
    },
  };
}

// ================= 第 6 关：ruler —— 尺子王国 =================
const CM = 0.06; // 1 厘米 = 0.06 单位
function rulerBase() {
  const g = grp();
  g.add(box(6.4, 0.16, 1.6, PAL.wood, 0, 1.0, 0));
  for (let cm = 0; cm <= 100; cm += 5) {
    const major = cm % 10 === 0;
    g.add(box(0.045, major ? 0.5 : 0.26, 0.06, PAL.dark,
      -3 + cm * CM, 1.16, 0.72, { shadow: false }));
  }
  g.add(box(0.3, 1.0, 0.3, PAL.brown, -3.35, 0.5, 0));
  g.add(box(0.3, 1.0, 0.3, PAL.brown, 3.35, 0.5, 0));
  return g;
}
function ribbonOnRuler(lenCm, color, z, dropDelay) {
  const r = box(lenCm * CM, 0.12, 0.55, color, -3 + (lenCm * CM) / 2, 1.14, z);
  const fp = r.position.clone().add(V3(0, 3.2, 0));
  return { obj: r, from: fp, to: r.position.clone(), p0: dropDelay, p1: dropDelay + 0.25, mesh: r };
}
function visualRuler(v) {
  const g = grp();
  g.add(rulerBase());
  const items = [];
  const sub = v.sub;
  if (sub === 'which' || sub === 'diff') {
    const r1 = ribbonOnRuler(v.L1, PAL.red, -0.32, 0.05);
    const r2 = ribbonOnRuler(v.L2, PAL.blue, 0.38, 0.2);
    g.add(r1.mesh, r2.mesh);
    items.push(r1, r2);
  } else if (sub === 'm2cm1' || sub === 'm2cmX' || sub === 'cm2m') {
    const X = sub === 'm2cm1' ? 1 : v.X;
    // 大蓝条（1 米）
    for (let i = 0; i < X; i++) {
      const bar = box(100 * CM, 0.3, 0.6, PAL.blue, 0, 1.35 + i * 0.42, -0.55);
      const fp = bar.position.clone().add(V3(-6, 1.5, 0));
      g.add(bar);
      items.push({ obj: bar, from: fp, to: bar.position.clone(), p0: 0.05 + i * 0.08, p1: 0.2 + i * 0.08 });
    }
    // 10 厘米橙条
    for (let i = 0; i < X; i++) {
      for (let k = 0; k < 10; k++) {
        const bar = box(10 * CM, 0.3, 0.6, PAL.orange, -3 + k * 10 * CM + 5 * CM, 1.35 + i * 0.42, 0.75);
        const fp = bar.position.clone().add(V3(6, 1.5, 0));
        g.add(bar);
        items.push({ obj: bar, from: fp, to: bar.position.clone(), p0: 0.3 + (i * 10 + k) * 0.02, p1: 0.42 + (i * 10 + k) * 0.02 });
      }
    }
  }
  const dur = sub === 'which' || sub === 'diff' ? 3 : 5;
  return { group: g, dur, update: (p) => applyTweens(items, p) };
}

// ================= 第 7 关：clockFace —— 大钟表 =================
function visualClock({ h, m }) {
  const g = grp();
  const cy = 2.6;
  g.add(cyl(2.3, 2.3, 0.18, PAL.navy, 0, cy, 0, { rx: Math.PI / 2 }));
  g.add(cyl(2.1, 2.1, 0.2, PAL.white, 0, cy, 0, { rx: Math.PI / 2 }));
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const big = i % 3 === 0;
    g.add(box(big ? 0.16 : 0.09, big ? 0.5 : 0.28, 0.05, big ? PAL.red : PAL.dark,
      Math.sin(a) * 1.78, cy + Math.cos(a) * 1.78, 0.11, { rz: -a, shadow: false }));
  }
  const hand = (len, w, color) => {
    const hg = grp();
    hg.add(box(w, len, 0.06, color, 0, len / 2 - 0.14, 0, { shadow: false }));
    hg.position.set(0, cy, 0.14);
    return hg;
  };
  const hourH = hand(1.15, 0.17, PAL.black);
  const minH = hand(1.7, 0.12, PAL.red);
  g.add(hourH, minH);
  g.add(sph(0.12, PAL.black, 0, cy, 0.18, { shadow: false }));
  g.add(box(0.5, 1.1, 0.5, PAL.brown, -1.2, 0.55, 0));
  g.add(box(0.5, 1.1, 0.5, PAL.brown, 1.2, 0.55, 0));
  g.add(box(3.0, 0.28, 1.0, PAL.brown, 0, 0.64, 0));

  const ah = (((h % 12) + m / 60) / 12) * Math.PI * 2;
  const am = (m / 60) * Math.PI * 2;
  const dur = 3.2;
  return {
    group: g, dur,
    update(p) {
      const q = ez(seg(p, 0.1, 0.9));
      hourH.rotation.z = -ah * q;
      minH.rotation.z = -am * q;
    },
  };
}

// ================= 第 8 关：balance —— 天平 =================
function visualBalance(v) {
  const g = grp();
  g.add(cyl(1.0, 1.2, 0.32, PAL.brown, 0, 0.66, 0));
  g.add(box(0.32, 2.7, 0.32, PAL.brown, 0, 2.1, 0));
  const beam = grp();
  beam.position.set(0, 3.5, 0);
  beam.add(box(4.6, 0.15, 0.15, PAL.navy, 0, 0, 0));
  const mkPan = (x) => {
    const pan = grp();
    pan.add(cyl(0.03, 0.03, 0.9, PAL.gray, -0.3, -0.45, 0, { shadow: false }));
    pan.add(cyl(0.03, 0.03, 0.9, PAL.gray, 0.3, -0.45, 0, { shadow: false }));
    pan.add(cyl(0.68, 0.5, 0.22, PAL.yellow, 0, -0.95, 0));
    pan.position.set(x, 0, 0);
    return pan;
  };
  const panL = mkPan(-2.1), panR = mkPan(2.1);
  beam.add(panL, panR);
  g.add(beam);
  g.add(sph(0.13, PAL.red, 0, 3.66, 0, { shadow: false }));

  const sub = v.sub;
  let tiltTarget = 0;
  if (sub === 'which') {
    const sL = 0.45 + v.wL * 0.07, sR = 0.45 + v.wR * 0.07;
    panL.add(box(sL, sL, sL, PAL.red, 0, -0.75, 0));
    panR.add(box(sR, sR, sR, PAL.blue, 0, -0.75, 0));
    tiltTarget = v.wL > v.wR ? -0.2 : 0.2; // 重的一边下沉
  } else if (sub === 'kg2g1' || sub === 'kg2gX') {
    const X = sub === 'kg2g1' ? 1 : v.X;
    for (let i = 0; i < X; i++)
      panL.add(box(0.85, 0.85, 0.85, PAL.red, (i - (X - 1) / 2) * 1.0, -0.75, 0));
    const n = X * 10;
    const cols = Math.min(n, 10);
    for (let i = 0; i < n; i++)
      panR.add(box(0.3, 0.3, 0.3, PAL.blue, (i % cols - (cols - 1) / 2) * 0.36, -0.78 + Math.floor(i / cols) * 0.34, 0, { shadow: false }));
    tiltTarget = 0;
  } else { // trick：大棉花 vs 小铁块，一样重
    panL.add(box(1.35, 1.1, 1.1, PAL.white, 0, -0.6, 0));
    panR.add(box(0.55, 0.55, 0.55, PAL.dark, 0, -0.75, 0));
    tiltTarget = 0;
  }

  const dur = 4;
  return {
    group: g, dur,
    update(p) {
      const q = ez(seg(p, 0.25, 0.75));
      beam.rotation.z = tiltTarget * q + (tiltTarget === 0 ? Math.sin(p * 12) * 0.02 * (1 - q) : 0);
      // 托盘保持水平
      panL.rotation.z = -beam.rotation.z;
      panR.rotation.z = -beam.rotation.z;
    },
  };
}

// ================= 第 9 关：anglePick —— 点 3D 角 =================
const ANGLE_RAD = { acute: 0.62, right: Math.PI / 2, obtuse: 2.35 };
function visualAngle({ order, target }) {
  const g = grp();
  const pickables = [];
  const colors = [PAL.blue, PAL.green, PAL.orange];
  order.forEach((type, i) => {
    const x = (i - 1) * 3.3;
    const st = grp();
    st.add(cyl(0.62, 0.78, 0.55, PAL.gray, 0, 0.78, 0));
    st.add(cyl(0.09, 0.09, 1.5, PAL.dark, 0, 1.5, 0));
    const vy = 2.25, L = 1.65;
    const rad = ANGLE_RAD[type];
    st.add(box(L, 0.14, 0.14, colors[i], L / 2, vy, 0));
    st.add(box(L, 0.14, 0.14, colors[i], (Math.cos(rad) * L) / 2, vy + (Math.sin(rad) * L) / 2, 0, { rz: rad }));
    st.add(sph(0.11, PAL.dark, 0, vy, 0, { shadow: false }));
    st.add(tor(0.55, 0.06, colors[i], 0, vy, 0.03, { arc: rad, shadow: false }));
    if (type === 'right')
      st.add(box(0.22, 0.22, 0.09, PAL.red, 0.24, vy + 0.24, 0.03, { shadow: false }));
    st.position.set(x, 0.5, 0);
    g.add(st);
    // 隐形点击体
    const hit = new THREE.Mesh(
      new THREE.CylinderGeometry(1.45, 1.45, 3.2, 10),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hit.position.set(x, 2.0, 0);
    hit.userData.angleIdx = i;
    hit.userData.correct = i === target;
    hit.userData.stand = st;
    g.add(hit);
    pickables.push(hit);
  });
  const dur = 2;
  return {
    group: g, dur, pickables,
    update(p) {
      const q = ez(seg(p, 0, 0.8));
      g.scale.setScalar(Math.max(0.001, q));
      g.scale.y = Math.max(0.001, q);
    },
  };
}

// ================= 第 10 关：story —— 应用题情景 =================
function miniKid() {
  const k = grp();
  k.add(sph(0.2, PAL.skin, 0, 1.05, 0, { shadow: false }));
  k.add(cyl(0.2, 0.26, 0.62, PAL.blue, 0, 0.55, 0, { shadow: false }));
  return k;
}
function visualStory(v) {
  const g = grp();
  const items = [];
  const sub = v.sub;
  if (sub === 'cookieBox') {
    const { n, m } = v;
    for (let i = 0; i < n; i++) {
      const bx = (i - (n - 1) / 2) * 2.9;
      const boxG = grp();
      boxG.add(box(2.0, 0.9, 1.4, PAL.orange, 0, 0.95, 0));
      const lid = box(2.0, 0.12, 1.4, PAL.brown, 0, 0, 0);
      lid.position.set(0, 1.7, -0.75);
      lid.rotation.x = -0.9;
      boxG.add(lid);
      for (let j = 0; j < m; j++) {
        const ck = cyl(0.26, 0.26, 0.1, 0xd9a066, -0.7 + j * (1.4 / Math.max(1, m - 1) || 0), 1.5, 0, { shadow: false });
        if (m === 1) ck.position.x = 0;
        boxG.add(ck);
      }
      boxG.position.set(bx, 0.5, 0);
      g.add(boxG);
      items.push({ obj: boxG, from: boxG.position.clone().add(V3(0, 4, 0)), to: boxG.position.clone(), p0: i * 0.1, p1: i * 0.1 + 0.25 });
    }
  } else if (sub === 'rows') {
    const { m, n } = v;
    let k = 0;
    for (let ri2 = 0; ri2 < m; ri2++) {
      for (let j = 0; j < n; j++) {
        const kid = miniKid();
        const tp = V3((j - (n - 1) / 2) * 1.15, 0.5, (ri2 - (m - 1) / 2) * 1.5);
        kid.position.copy(tp.clone().add(V3(0, 4, 0)));
        g.add(kid);
        items.push({ obj: kid, from: kid.position.clone(), to: tp, p0: 0.03 * k, p1: 0.03 * k + 0.15 });
        k++;
      }
    }
  } else if (sub === 'eatApple') {
    const { a, b } = v;
    g.add(box(7.6, 0.18, 3.4, PAL.wood, 0, 1.0, 0));
    const cols = 10;
    const apples = [];
    for (let i = 0; i < a; i++) {
      const ap = grp(sph(0.24, PAL.red, 0, 0, 0, { shadow: false }));
      const tp = V3(-3.3 + (i % cols) * 0.73, 1.35, -0.8 + Math.floor(i / cols) * 1.1);
      ap.position.copy(tp);
      g.add(ap); apples.push(ap);
    }
    for (let k = 0; k < b; k++) {
      const ap = apples[a - 1 - k];
      items.push({ obj: ap, from: ap.position.clone(), to: ap.position.clone().add(V3(3.5, 2.5, 0)), p0: 0.3 + k * 0.05, p1: 0.45 + k * 0.05, shrink: true });
    }
  } else if (sub === 'shareCandy') {
    const { t, p } = v;
    const total = t * p;
    const kids = [];
    for (let i = 0; i < t; i++) {
      const kx = (i - (t - 1) / 2) * 2.9;
      const kid = miniKid();
      kid.position.set(kx, 0.5, 1.4);
      g.add(kid); kids.push(kid);
      const cup = cyl(0.42, 0.32, 0.5, PAL.pink, kx, 0.75, 0.1);
      g.add(cup);
    }
    for (let k = 0; k < total; k++) {
      const cd = sph(0.13, [PAL.red, PAL.yellow, PAL.green, PAL.blue][k % 4], 0, 0, 0, { shadow: false });
      const ki = k % t, si = Math.floor(k / t);
      const kx = (ki - (t - 1) / 2) * 2.9;
      const aa = (si / p) * Math.PI * 2;
      const tp = V3(kx + Math.cos(aa) * 0.2, 1.05, 0.1 + Math.sin(aa) * 0.2);
      const fp = V3(-4.5, 3.2, -2.5);
      cd.position.copy(fp);
      g.add(cd);
      const t0 = 0.1 + (k / total) * 0.6;
      items.push({ obj: cd, from: fp, to: tp, p0: t0, p1: t0 + 0.08, arc: 1.5 });
    }
  } else if (sub === 'money') {
    const { a, b } = v;
    const stack = (n, x, color) => {
      for (let i = 0; i < n; i++) {
        const c = cyl(0.42, 0.42, 0.09, color, x, 0.6 + i * 0.1, 0, { shadow: false });
        g.add(c);
        items.push({ obj: c, from: c.position.clone().add(V3(0, 4, 0)), to: c.position.clone(), p0: 0.01 * i, p1: 0.01 * i + 0.1 });
      }
    };
    stack(a, -1.8, PAL.yellow);
    stack(b, 1.8, PAL.orange);
    g.add(box(1.4, 0.5, 1.4, PAL.brown, -1.8, 0.75, 0));
    g.add(box(1.4, 0.5, 1.4, PAL.brown, 1.8, 0.75, 0));
  } else if (sub === 'park') {
    const { a, b } = v;
    let k = 0;
    const spots = [];
    for (let i = 0; i < a + b; i++) spots.push(V3(-3.6 + (i % 8) * 1.03, 0.5, -1.2 + Math.floor(i / 8) * 1.3));
    for (let i = 0; i < a; i++) {
      const kid = miniKid();
      kid.position.copy(spots[i]);
      g.add(kid);
      items.push({ obj: kid, from: spots[i].clone().add(V3(0, 4, 0)), to: spots[i], p0: 0.02 * k, p1: 0.02 * k + 0.12 });
      k++;
    }
    for (let i = 0; i < b; i++) {
      const kid = miniKid();
      const tp = spots[a + i];
      kid.position.set(9, 0.5, tp.z);
      g.add(kid);
      items.push({ obj: kid, from: kid.position.clone(), to: tp, p0: 0.35 + i * 0.06, p1: 0.5 + i * 0.06 });
    }
  }
  const dur = sub === 'eatApple' || sub === 'shareCandy' || sub === 'park' ? 6 : 4.5;
  return { group: g, dur, update: (p) => applyTweens(items, p) };
}

// ================= 点卡快闪：dotFlash =================
const DOT_PATTERNS = {
  5: [[-0.85, -0.85], [0.85, -0.85], [-0.85, 0.85], [0.85, 0.85], [0, 0]],
  6: [[-0.85, -0.85], [0.85, -0.85], [-0.85, 0], [0.85, 0], [-0.85, 0.85], [0.85, 0.85]],
  7: [[-0.85, -0.85], [0.85, -0.85], [-0.85, 0.85], [0.85, 0.85], [0, 0], [0, -0.85], [0, 0.85]],
  8: [[-0.85, -1.05], [0.85, -1.05], [-0.85, -0.35], [0.85, -0.35], [-0.85, 0.35], [0.85, 0.35], [-0.85, 1.05], [0.85, 1.05]],
  9: [[-0.85, -0.85], [0, -0.85], [0.85, -0.85], [-0.85, 0], [0, 0], [0.85, 0], [-0.85, 0.85], [0, 0.85], [0.85, 0.85]],
  10: [[-0.85, -1.3], [0.85, -1.3], [-0.85, -0.65], [0.85, -0.65], [-0.85, 0], [0.85, 0], [-0.85, 0.65], [0.85, 0.65], [-0.85, 1.3], [0.85, 1.3]],
};
function visualDots({ count }) {
  const g = grp();
  // 闪卡立起来正对相机（像老师举起来的卡片），不再平躺：
  // 相机在 (0,7.6,11.5)，卡片法线指向相机 -> rotation.x ≈ -0.44
  const card = box(3.6, 4.6, 0.16, PAL.white, 0, 2.6, 0);
  card.rotation.x = -0.44;
  g.add(card);
  const back = box(3.9, 4.9, 0.1, PAL.pink, 0, 2.6, -0.2);
  back.rotation.x = -0.44;
  g.add(back);
  const dots = [];
  for (const [dx, dz] of DOT_PATTERNS[count]) {
    // 图案 [dx,dz] 映射到卡面 [x,y]：dz -> -y（远端变上端）
    // 直接挂在卡片上：随卡片一起朝向相机，圆点永远贴在卡面上正对孩子
    const d = sph(0.3, PAL.rose, dx, -dz, 0.36, { shadow: false });
    card.add(d);
    dots.push(d);
  }
  const dur = 2.8;
  return {
    group: g, dur,
    update(p) {
      // 快闪：2 秒左右后圆点消失
      const q = seg(p, 0.68, 0.85);
      for (const d of dots) d.scale.setScalar(Math.max(0.001, 1 - q));
    },
  };
}

// ================= 总入口 =================
export function buildVisual(v) {
  switch (v.kind) {
    case 'merge': return visualMerge(v);
    case 'takeaway': return visualTakeaway(v);
    case 'array': return visualArray(v);
    case 'distribute': return visualDistribute(v);
    case 'mixedStack': return visualMixed(v);
    case 'ruler': return visualRuler(v);
    case 'clockFace': return visualClock(v);
    case 'balance': return visualBalance(v);
    case 'anglePick': return visualAngle(v);
    case 'story': return visualStory(v);
    case 'dotFlash': return visualDots(v);
    case 'barGrow': return visualBarGrow(v);
    case 'numLine': return visualNumLine(v);
    case 'priceBar': return visualPriceBar(v);
    default: return { group: grp(), dur: 1, update() {} };
  }
}
