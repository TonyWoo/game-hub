// ============================================================
// props.js —— 数学乐园 3D 舞台 + 每题教具
// 一个通用马卡龙小舞台；每关按题目 prop.kind 摆教具（与题目联动）
// 复用 quiet3d 模型：apple / banana / flower / cookie / plate / blackboard
// ============================================================
import * as THREE from 'three';
import { mat, PAL, box, sph, cyl, cone, tor, grp, disposeGroup } from '../quiet3d/models/helpers.js';
import { buildModel } from '../quiet3d/models/index.js';

export { disposeGroup };

// ---------- 通用小舞台 ----------
export function buildStage() {
  const g = grp();
  g.add(cyl(5.4, 5.8, 0.5, PAL.cream, 0, 0.25, 0, { receive: true })); // 地台
  g.add(tor(5.4, 0.14, PAL.pink, 0, 0.5, 0, { rx: Math.PI / 2 }));      // 粉色边
  // 云朵
  const cloud = (x, y, z, s) => {
    const c = grp(
      sph(0.55, PAL.white, 0, 0, 0),
      sph(0.4, PAL.white, 0.5, -0.08, 0.1),
      sph(0.42, PAL.white, -0.5, -0.06, -0.1),
    );
    c.position.set(x, y, z); c.scale.setScalar(s);
    return c;
  };
  g.add(cloud(-6.5, 5.5, -4, 1.1), cloud(6.8, 6.2, -5, 1.4), cloud(0.5, 7, -7, 1.8));
  // 小星星
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    g.add(sph(0.14, PAL.yellow, Math.cos(a) * 7.2, 3.4 + (i % 3), -4.5 - (i % 2) * 1.5,
      { emissive: 0xffd93d, ei: 0.55, shadow: false }));
  }
  return g;
}

// ---------- 教具：kind -> { group, anchors? } ----------
// anchors: 需要 HTML 序号标签时返回 [{ obj: Object3D }]
export function buildProp(prop) {
  switch (prop.kind) {
    case 'fruits': return { group: propFruits(prop) };
    case 'train': return { group: propTrain() };
    case 'flowers': return { group: propFlowers(prop) };
    case 'cookies': return { group: propCookies(prop) };
    case 'blocks': return { group: propBlocks(prop) };
    case 'ruler': return { group: propRuler() };
    case 'clock': return { group: propClock(prop) };
    case 'scale': return { group: propScale(prop) };
    case 'angles': return propAngles(prop);
    case 'blackboard': return { group: propBlackboard() };
    default: return { group: grp() };
  }
}

// --- 第1关：两篮水果（数量多时只摆代表性 8 个，氛围演示） ---
function fruitBasket(x, modelId, count) {
  const b = grp();
  b.add(cyl(0.95, 0.72, 0.62, PAL.wood, 0, 0.31, 0));
  b.add(tor(0.95, 0.09, PAL.brown, 0, 0.62, 0, { rx: Math.PI / 2 }));
  const n = Math.min(count, 8);
  for (let i = 0; i < n; i++) {
    const f = buildModel(modelId);
    if (!f) continue;
    const col = i % 4, row = Math.floor(i / 4);
    f.position.set(-0.45 + col * 0.3, 0.72 + row * 0.32, (row % 2) * 0.2 - 0.1);
    f.scale.setScalar(0.55);
    b.add(f);
  }
  b.position.set(x, 0.5, 0);
  return b;
}
function propFruits({ a, b }) {
  const g = grp();
  g.add(fruitBasket(-2.3, 'apple', a));
  g.add(fruitBasket(2.3, 'banana', b));
  // 大大的加号
  const plus = grp(
    box(1.3, 0.32, 0.32, PAL.pink, 0, 2.2, 0),
    box(0.32, 1.3, 0.32, PAL.pink, 0, 2.2, 0),
  );
  g.add(plus);
  return g;
}

// --- 第2关：小火车 ---
function propTrain() {
  const g = grp();
  const wheel = (x) => cyl(0.32, 0.32, 0.18, PAL.dark, x, 0.32, 0, { rx: Math.PI / 2 });
  const car = (x, color) => grp(
    box(1.7, 0.8, 1.1, color, x, 0.95, 0),
    wheel(x - 0.55), wheel(x + 0.55),
  );
  const engine = grp(
    box(2.0, 0.9, 1.2, PAL.red, 0, 1.0, 0),
    box(0.9, 0.9, 1.1, PAL.navy, -0.5, 1.9, 0),
    cyl(0.16, 0.22, 0.7, PAL.dark, 0.6, 1.8, 0),
    wheel(-0.65), wheel(0.65),
  );
  g.add(engine, car(-2.6, PAL.blue), car(-4.6, PAL.green), car(2.4, PAL.yellow));
  // 铁轨
  g.add(box(11, 0.08, 0.18, PAL.gray, -1, 0.54, 0.75));
  g.add(box(11, 0.08, 0.18, PAL.gray, -1, 0.54, -0.75));
  g.position.set(1, 0.5, 0);
  return g;
}

// --- 第3关：m 组 × n 朵花 ---
function propFlowers({ m, n }) {
  const g = grp();
  const dx = Math.min(0.95, 8.6 / n);
  const dz = Math.min(1.15, 7.4 / m);
  const colors = [PAL.pink, PAL.yellow, PAL.purple, PAL.orange, PAL.mint, PAL.blue, PAL.rose, PAL.teal, PAL.red];
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      const f = buildModel('flower');
      if (!f) continue;
      // 每组染不同花瓣色：整体 tint 太麻烦，用底座圆盘区分组
      f.position.set((c - (n - 1) / 2) * dx, 0.5, (r - (m - 1) / 2) * dz);
      f.scale.setScalar(0.8);
      g.add(f);
    }
    // 组底座圆盘（颜色区分组）
    const disc = cyl(Math.max(1.1, (n * dx) / 2 + 0.35), Math.max(1.1, (n * dx) / 2 + 0.35), 0.12,
      colors[r % colors.length], 0, 0.56, (r - (m - 1) / 2) * dz, { transparent: true, opacity: 0.35, shadow: false });
    g.add(disc);
  }
  return g;
}

// --- 第4关：饼干分盘 ---
function propCookies({ plates, per }) {
  const g = grp();
  for (let i = 0; i < plates; i++) {
    const px = (i - (plates - 1) / 2) * 2.6;
    const plate = buildModel('plate');
    if (plate) { plate.scale.setScalar(1.35); plate.position.set(px, 0.55, 0); g.add(plate); }
    const ring = per <= 6 ? 1 : 2;
    for (let j = 0; j < per; j++) {
      const ck = buildModel('cookie');
      if (!ck) continue;
      const rr = ring === 1 ? 0.42 : (j % 2 === 0 ? 0.52 : 0.2);
      const aa = (j / per) * Math.PI * 2 * (ring === 1 ? 1 : 2);
      ck.position.set(px + Math.cos(aa) * rr, 0.78, Math.sin(aa) * rr);
      ck.scale.setScalar(0.6);
      g.add(ck);
    }
  }
  return g;
}

// --- 第5关：彩色积木（答案数量，封顶 16 块示意） ---
function propBlocks({ n }) {
  const g = grp();
  const colors = [PAL.red, PAL.orange, PAL.yellow, PAL.green, PAL.blue, PAL.purple];
  const count = Math.min(n, 16);
  const dx = Math.min(0.95, 8.6 / Math.max(count, 1));
  for (let i = 0; i < count; i++) {
    g.add(box(0.72, 0.72, 0.72, colors[i % colors.length],
      (i - (count - 1) / 2) * dx, 0.86, 0));
  }
  return g;
}

// --- 第6关：大尺子 ---
function propRuler() {
  const g = grp();
  g.add(box(7.2, 0.18, 1.3, PAL.wood, 0, 1.1, 0));
  for (let i = 0; i <= 14; i++) {
    const tall = i % 2 === 0;
    g.add(box(0.07, tall ? 0.5 : 0.28, 0.06, PAL.dark, -3.25 + i * 0.5, 1.28, 0.62, { shadow: false }));
  }
  g.add(box(0.5, 1.0, 0.5, PAL.brown, -3.2, 0.5, 0));
  g.add(box(0.5, 1.0, 0.5, PAL.brown, 3.2, 0.5, 0));
  return g;
}

// --- 第7关：可调时间的钟 ---
function propClock({ h, m }) {
  const g = grp();
  const cy = 2.4;
  g.add(cyl(1.75, 1.75, 0.16, PAL.navy, 0, cy, 0, { rx: Math.PI / 2 }));
  g.add(cyl(1.58, 1.58, 0.18, PAL.white, 0, cy, 0, { rx: Math.PI / 2 }));
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    g.add(box(0.09, i % 3 === 0 ? 0.34 : 0.2, 0.04, PAL.dark,
      Math.sin(a) * 1.32, cy + Math.cos(a) * 1.32, 0.1, { rz: -a, shadow: false }));
  }
  const hand = (len, w, color, ang) => {
    const hg = grp();
    hg.add(box(w, len, 0.05, color, 0, len / 2 - 0.12, 0, { shadow: false }));
    hg.position.set(0, cy, 0.12);
    hg.rotation.z = -ang; // 顺时针
    return hg;
  };
  const ah = (((h % 12) + m / 60) / 12) * Math.PI * 2;
  const am = (m / 60) * Math.PI * 2;
  g.add(hand(0.85, 0.13, PAL.black, ah));
  g.add(hand(1.25, 0.09, PAL.red, am));
  g.add(sph(0.09, PAL.black, 0, cy, 0.16, { shadow: false }));
  g.add(box(0.4, 1.0, 0.4, PAL.brown, -0.9, 0.5, 0));
  g.add(box(0.4, 1.0, 0.4, PAL.brown, 0.9, 0.5, 0));
  g.add(box(2.4, 0.25, 0.9, PAL.brown, 0, 0.62, 0));
  return g;
}

// --- 第8关：天平 ---
function propScale({ tilt = 0 }) {
  const g = grp();
  g.add(cyl(0.9, 1.1, 0.3, PAL.brown, 0, 0.65, 0));
  g.add(box(0.3, 2.6, 0.3, PAL.brown, 0, 2.0, 0));
  const beam = grp();
  beam.add(box(4.4, 0.14, 0.14, PAL.navy, 0, 0, 0));
  beam.position.set(0, 3.35, 0);
  beam.rotation.z = tilt;
  const pan = (x) => grp(
    cyl(0.025, 0.025, 0.8, PAL.gray, x - 0.28, -0.4, 0, { shadow: false }),
    cyl(0.025, 0.025, 0.8, PAL.gray, x + 0.28, -0.4, 0, { shadow: false }),
    cyl(0.62, 0.45, 0.2, PAL.yellow, x, -0.85, 0),
  );
  beam.add(pan(-2.0), pan(2.0));
  // 砝码
  beam.add(box(0.4, 0.4, 0.4, PAL.red, -2.0, -0.45, 0));
  beam.add(box(0.4, 0.4, 0.4, PAL.blue, 2.0, -0.45, 0));
  g.add(beam);
  g.add(sph(0.12, PAL.red, 0, 3.5, 0, { shadow: false }));
  return g;
}

// --- 第9关：三个角（带 HTML 序号锚点） ---
const ANGLE_RAD = { acute: 0.7, right: Math.PI / 2, obtuse: 2.27 };
function propAngles({ order }) {
  const g = grp();
  const anchors = [];
  const colors = [PAL.blue, PAL.green, PAL.orange];
  order.forEach((type, i) => {
    const x = (i - 1) * 2.7;
    const vy = 2.1; // 顶点高度
    const st = grp();
    st.add(cyl(0.55, 0.7, 0.5, PAL.gray, x, 0.75, 0));
    st.add(cyl(0.08, 0.08, 1.4, PAL.dark, x, 1.4, 0));
    const rad = ANGLE_RAD[type];
    const L = 1.35;
    // 两条边（XY 平面，朝向相机）
    const arm1 = box(L, 0.12, 0.12, colors[i], x + L / 2, vy, 0);
    const arm2 = box(L, 0.12, 0.12, colors[i], x + (Math.cos(rad) * L) / 2, vy + (Math.sin(rad) * L) / 2, 0, { rz: rad });
    st.add(arm1, arm2);
    st.add(sph(0.1, PAL.dark, x, vy, 0, { shadow: false }));
    // 弧线
    st.add(tor(0.5, 0.055, colors[i], x, vy, 0.02, { arc: rad, shadow: false }));
    if (type === 'right') {
      // 直角小方块标记
      st.add(box(0.2, 0.2, 0.08, PAL.red, x + 0.22, vy + 0.22, 0.02, { shadow: false }));
    }
    g.add(st);
    const anchor = new THREE.Object3D();
    anchor.position.set(x, 0.9, 0.6);
    g.add(anchor);
    anchors.push({ obj: anchor });
  });
  return { group: g, anchors };
}

// --- 第10关：小黑板 ---
function propBlackboard() {
  const g = grp();
  const bb = buildModel('blackboard');
  if (bb) { bb.scale.setScalar(1.7); bb.position.set(0, 0.5, 0); g.add(bb); }
  // 粉笔 + 板擦托盘
  g.add(box(0.3, 0.06, 0.06, PAL.white, -0.5, 0.75, 0.5, { shadow: false }));
  g.add(box(0.5, 0.18, 0.25, PAL.pink, 0.6, 0.78, 0.5));
  return g;
}

// ---------- 答对小烟花 ----------
export function makeBurst(origin, colorHex = 0xffd93d) {
  const N = 46;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(N * 3);
  const vel = [];
  for (let i = 0; i < N; i++) {
    pos[i * 3] = origin.x; pos[i * 3 + 1] = origin.y; pos[i * 3 + 2] = origin.z;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    const sp = 2.2 + Math.random() * 3.2;
    vel.push(new THREE.Vector3(
      Math.sin(ph) * Math.cos(th) * sp,
      Math.abs(Math.cos(ph)) * sp + 1.5,
      Math.sin(ph) * Math.sin(th) * sp,
    ));
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const points = new THREE.Points(geo, new THREE.PointsMaterial({
    color: colorHex, size: 0.17, transparent: true, opacity: 1, depthWrite: false,
  }));
  const burst = {
    points, vel, life: 1.15, age: 0,
    update(dt) {
      this.age += dt;
      const p = this.points.geometry.attributes.position;
      for (let i = 0; i < this.vel.length; i++) {
        this.vel[i].y -= 6.5 * dt;
        p.array[i * 3] += this.vel[i].x * dt;
        p.array[i * 3 + 1] += this.vel[i].y * dt;
        p.array[i * 3 + 2] += this.vel[i].z * dt;
      }
      p.needsUpdate = true;
      this.points.material.opacity = Math.max(0, 1 - this.age / this.life);
      return this.age < this.life;
    },
    dispose() {
      this.points.geometry.dispose();
      this.points.material.dispose();
    },
  };
  return burst;
}
