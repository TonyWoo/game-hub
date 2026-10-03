// ============================================================
// visuals.js —— 语文乐园 · 二年级：3D 题目舞台
// 每种 visual kind 一个 builder：buildVisual({kind, ...}) ->
//   { group, dur(秒), update(p: 0..1) }
// 汉字全部用 textSprite（canvas 精灵，永远面向相机）显示
// 约定：update(p) 必须是 p 的纯函数（可随时重播）
// ============================================================
import * as THREE from 'three';
import { mat, PAL, box, sph, cyl, cone, tor, grp, disposeGroup } from '../quiet3d/models/helpers.js';

export { disposeGroup };

const seg = (p, p0, p1) => Math.min(1, Math.max(0, (p - p0) / (p1 - p0)));
const ez = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2, 2) / 2);
const lerp = (a, b, t) => a + (b - a) * t;

// ---------- canvas 汉字精灵（永远面向相机） ----------
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

// 木牌（题目文字底板）
function signBoard(text, w, size = 0.55, color = '#4a3423') {
  const g = grp();
  const bw = Math.max(w, text.length * size * 0.95 + 0.8);
  g.add(box(bw, size * 1.7, 0.14, PAL.wood, 0, 0, 0));
  const t = textSprite(text, { size, color });
  t.position.z = 0.12;
  g.add(t);
  return g;
}

// ================= 第 1 关：tree —— 生字果树（果子挂字卡） =================
function visualTree({ options, label }) {
  const g = grp();
  g.add(cyl(0.42, 0.6, 2.4, PAL.brown, 0, 1.7, 0));                 // 树干
  g.add(sph(1.9, PAL.green, 0, 4.1, 0));                            // 树冠
  g.add(sph(1.3, PAL.mint, -1.3, 3.4, 0.4));
  g.add(sph(1.3, PAL.mint, 1.3, 3.4, -0.4));
  const sign = signBoard(label, 3.2, 0.6);
  sign.position.set(0, 5.9, 0);
  g.add(sign);
  const cols = [PAL.red, PAL.orange, PAL.yellow, PAL.purple];
  const pos = [[-2.1, 3.1, 0.9], [2.1, 3.1, 0.9], [-1.1, 4.4, 0.7], [1.1, 4.4, 0.7]];
  const fruits = [];
  options.slice(0, 4).forEach((ch, i) => {
    const f = grp();
    f.add(sph(0.42, cols[i % 4], 0, 0, 0));
    const t = textSprite(ch, { size: 0.5, color: '#ffffff' });
    t.position.set(0, 0, 0.5);
    f.add(t);
    f.position.set(...pos[i]);
    g.add(f);
    fruits.push(f);
  });
  const dur = 2.2;
  return {
    group: g, dur,
    update(p) {
      const q = ez(seg(p, 0, 0.5));
      fruits.forEach((f, i) => {
        const y0 = pos[i][1];
        f.position.y = y0 + Math.sin(q * Math.PI * 2 + i * 1.7) * 0.12 * q;
      });
    },
  };
}

// ================= 第 2 关：train —— 多音字小火车 =================
function visualTrain({ sentence }) {
  const g = grp();
  const train = grp();
  const car = (x, color, w = 1.7) => {
    const c = grp();
    c.add(box(w, 1.1, 1.6, color, 0, 0.85, 0));
    c.add(box(w * 0.7, 0.6, 1.62, PAL.white, 0, 1.35, 0, { shadow: false }));
    [-0.55, 0.55].forEach((dx) => {
      const wh = cyl(0.34, 0.34, 0.2, PAL.dark, dx, 0.34, 0.85, { rx: Math.PI / 2 });
      const wh2 = cyl(0.34, 0.34, 0.2, PAL.dark, dx, 0.34, -0.85, { rx: Math.PI / 2 });
      c.add(wh, wh2);
    });
    c.position.x = x;
    return c;
  };
  const engine = grp();
  engine.add(box(1.9, 1.3, 1.7, PAL.blue, 0, 0.95, 0));
  engine.add(cyl(0.28, 0.34, 0.9, PAL.dark, 0.5, 2.0, 0));
  engine.add(box(1.2, 0.9, 1.72, PAL.navy, -0.3, 1.9, 0));
  [-0.6, 0.6].forEach((dx) => {
    engine.add(cyl(0.36, 0.36, 0.2, PAL.dark, dx, 0.36, 0.9, { rx: Math.PI / 2 }));
    engine.add(cyl(0.36, 0.36, 0.2, PAL.dark, dx, 0.36, -0.9, { rx: Math.PI / 2 }));
  });
  train.add(engine, car(-2.6, PAL.orange), car(-4.7, PAL.purple));
  train.position.y = 0.5;
  g.add(train);
  // 铁轨
  g.add(box(12, 0.12, 0.18, PAL.gray, 0, 0.56, 0.9, { shadow: false }));
  g.add(box(12, 0.12, 0.18, PAL.gray, 0, 0.56, -0.9, { shadow: false }));
  // 句子木牌
  const sign = signBoard(sentence, 6.5, 0.52);
  sign.position.set(0, 4.6, -1.2);
  g.add(sign);
  const dur = 2.6;
  return {
    group: g, dur,
    update(p) {
      const q = ez(seg(p, 0, 0.7));
      train.position.x = lerp(-9, 0.8, q);
    },
  };
}

// ================= 第 3 关：flower —— 组词花园 =================
function visualFlower({ ch }) {
  const g = grp();
  g.add(cyl(0.12, 0.16, 2.6, PAL.green, 0, 1.8, 0));                 // 茎
  g.add(sph(0.9, PAL.green, -0.5, 1.4, 0, { sx: 1.6, sy: 0.5, sz: 0.6 }));
  const head = grp();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    head.add(sph(0.55, PAL.pink, Math.cos(a) * 1.05, Math.sin(a) * 1.05, 0, { sz: 0.45 }));
  }
  head.add(sph(0.75, PAL.yellow, 0, 0, 0.1));
  const t = textSprite(ch, { size: 0.62, color: '#8a5a3b' });
  t.position.z = 0.85;
  head.add(t);
  head.position.set(0, 3.6, 0);
  g.add(head);
  // 小花点缀
  [[-3, 0.8], [3.2, 0.7], [-2.4, 0.6, -1.5], [2.6, 0.6, -1.2]].forEach(([x, y, z = 0], i) => {
    const f = grp(sph(0.3, [PAL.rose, PAL.purple, PAL.orange, PAL.mint][i], 0, 0.5, 0));
    f.add(cyl(0.06, 0.08, 0.8, PAL.green, 0, 0.1, 0));
    f.position.set(x, y, z);
    g.add(f);
  });
  const dur = 2.2;
  return {
    group: g, dur,
    update(p) {
      const q = ez(seg(p, 0, 0.6));
      head.rotation.z = q * Math.PI * 2 * 0.25;
      head.scale.setScalar(0.6 + 0.4 * q);
    },
  };
}

// ================= 第 4 关：seesaw —— 反义词跷跷板 =================
function visualSeesaw({ word }) {
  const g = grp();
  g.add(box(1.2, 1.0, 1.2, PAL.brown, 0, 1.0, 0));                   // 支座
  const plank = grp();
  plank.add(box(6.4, 0.28, 1.1, PAL.wood, 0, 0, 0));
  const w1 = textSprite(word, { size: 0.55 });
  w1.position.set(-2.4, 0.75, 0);
  const w2 = textSprite('？', { size: 0.7, color: '#f76b8a' });
  w2.position.set(2.4, 0.75, 0);
  plank.add(w1, w2);
  plank.position.set(0, 1.7, 0);
  g.add(plank);
  const dur = 2.4;
  return {
    group: g, dur,
    update(p) {
      const q = seg(p, 0, 1);
      plank.rotation.z = Math.sin(q * Math.PI * 2) * 0.14;
    },
  };
}

// ================= 第 5 关：hands —— 近义词手拉手 =================
function kidFig(color, x, flip) {
  const k = grp();
  k.add(cyl(0.32, 0.42, 1.1, color, 0, 1.05, 0));                    // 身体
  k.add(sph(0.42, PAL.skin, 0, 1.95, 0));                           // 头
  const arm = cyl(0.09, 0.09, 1.1, color, flip * 0.62, 1.25, 0, { rz: flip * 1.1 });
  k.add(arm);
  k.position.x = x;
  return k;
}
function visualHands({ word }) {
  const g = grp();
  g.add(kidFig(PAL.blue, -1.1, 1), kidFig(PAL.rose, 1.1, -1));
  // 爱心
  const heart = grp(
    sph(0.28, PAL.red, -0.2, 0, 0, { shadow: false }),
    sph(0.28, PAL.red, 0.2, 0, 0, { shadow: false }),
    cone(0.4, 0.5, PAL.red, 0, -0.3, 0, { rx: Math.PI, shadow: false }),
  );
  heart.position.set(0, 2.9, 0);
  g.add(heart);
  const t = textSprite(word, { size: 0.6 });
  t.position.set(0, 4.0, 0);
  g.add(t);
  const dur = 2.2;
  return {
    group: g, dur,
    update(p) {
      const q = ez(seg(p, 0, 0.6));
      heart.scale.setScalar(0.5 + 0.5 * q + Math.sin(p * 9) * 0.08 * q);
    },
  };
}

// ================= 第 6 关：board —— 词语搭配（配件飞入空格） =================
function visualBoard({ pattern }) {
  const g = grp();
  g.add(box(0.25, 3.2, 0.25, PAL.brown, -3.4, 2.1, 0));
  g.add(box(0.25, 3.2, 0.25, PAL.brown, 3.4, 2.1, 0));
  const board = signBoard(pattern, 6.2, 0.62);
  board.position.set(0, 3.4, 0);
  g.add(board);
  // 发光的 "?" 卡片飞入空格
  const card = grp();
  card.add(box(1.1, 1.1, 0.12, PAL.yellow, 0, 0, 0, { emissive: 0xffd93d, ei: 0.4 }));
  const q = textSprite('?', { size: 0.7, color: '#8a5a3b' });
  q.position.z = 0.1;
  card.add(q);
  g.add(card);
  const dur = 2.4;
  return {
    group: g, dur,
    update(p) {
      const t = ez(seg(p, 0.1, 0.75));
      card.position.set(lerp(0, 0, t), lerp(0.6, 2.35, t), lerp(4, 0.35, t));
      card.scale.setScalar(0.6 + 0.4 * t);
    },
  };
}

// ================= 第 7 关：punct —— 标点小卫士 =================
function visualPunct({ sentence }) {
  const g = grp();
  const marks = ['，', '。', '！', '？'];
  const cols = [PAL.blue, PAL.green, PAL.orange, PAL.purple];
  const tablets = [];
  marks.forEach((m, i) => {
    const x = (i - 1.5) * 2.1;
    g.add(cyl(0.55, 0.7, 1.0, PAL.gray, x, 1.0, 0));                 // 底座
    const tab = box(1.35, 1.6, 0.18, cols[i], x, 2.3, 0);           // 石碑
    g.add(tab);
    tablets.push(tab);
    const t = textSprite(m, { size: 0.95, color: '#ffffff' });
    t.position.set(x, 2.3, 0.15);
    g.add(t);
    tablets.push(t);
  });
  const sign = signBoard(sentence, 7, 0.5);
  sign.position.set(0, 4.6, -1);
  g.add(sign);
  const dur = 2.0;
  return {
    group: g, dur,
    update(p) {
      const q = ez(seg(p, 0, 0.7));
      tablets.forEach((t) => {
        const baseY = t.isSprite ? 2.3 : 2.3;
        t.position.y = baseY * q + 0.4 * (1 - q) + 0.0;
      });
    },
  };
}

// ================= 第 8 关：theater —— 句子魔术小剧场 =================
function visualTheater({ q }) {
  const g = grp();
  // 舞台 + 幕布
  g.add(box(7.5, 0.5, 3, PAL.wood, 0, 0.75, 0));
  g.add(box(0.9, 4.2, 0.5, PAL.red, -3.6, 2.8, -0.8));
  g.add(box(0.9, 4.2, 0.5, PAL.red, 3.6, 2.8, -0.8));
  g.add(box(8.2, 0.9, 0.5, PAL.red, 0, 5.0, -0.8));
  // 句子木牌
  const sign = signBoard(q, 7, 0.5);
  sign.position.set(0, 6.1, -0.6);
  g.add(sign);
  // 两张词卡（主语/宾语）换位表演
  const isBa = q.includes('把');
  const subj = q.split(isBa ? '把' : '被')[0];
  const rest = q.split(isBa ? '把' : '被')[1] || '';
  const obj = rest.split(/[被把]/)[0].replace(/[。，]/g, '');
  const mkCard = (word, color) => {
    const c = grp();
    c.add(box(2.0, 1.2, 0.14, color, 0, 0, 0));
    const t = textSprite(word.slice(0, 4), { size: 0.5, color: '#ffffff' });
    t.position.z = 0.12;
    c.add(t);
    return c;
  };
  const cA = mkCard(subj, PAL.blue);
  const cB = mkCard(obj, PAL.orange);
  cA.position.set(-2, 2.6, 0.6);
  cB.position.set(2, 2.6, 0.6);
  g.add(cA, cB);
  const dur = 3.0;
  return {
    group: g, dur,
    update(p) {
      // 两张卡片弧线换位：演示"主语宾语换位置"
      const t = ez(seg(p, 0.15, 0.85));
      const ang = t * Math.PI;
      cA.position.x = lerp(-2, 2, t);
      cB.position.x = lerp(2, -2, t);
      cA.position.y = 2.6 + Math.sin(ang) * 1.1;
      cB.position.y = 2.6 + Math.sin(ang) * 1.1;
    },
  };
}

// ================= 第 9 关：night —— 古诗之夜 =================
function visualNight({ line, title, author }) {
  const g = grp();
  // 月亮
  const moon = sph(0.95, PAL.cream, 3.6, 6.0, -3.5, { emissive: 0xfff3d6, ei: 0.7, shadow: false });
  g.add(moon);
  // 星星
  const stars = [];
  const sPos = [[-4, 6.5, -4], [-2, 7.2, -5], [0, 6.2, -4.5], [1.8, 7.4, -5], [5, 5.2, -4],
    [-5.5, 5.4, -3.5], [-3, 5.2, -3], [2.8, 5.4, -3.2], [0.8, 5.6, -3.6], [-1.5, 6.8, -3.8]];
  sPos.forEach(([x, y, z]) => {
    const s = sph(0.13, PAL.yellow, x, y, z, { emissive: 0xffd93d, ei: 0.8, shadow: false });
    g.add(s); stars.push(s);
  });
  // 卷轴：上句 + 题目出处
  const scroll = grp();
  scroll.add(box(6.4, 1.9, 0.12, PAL.cream, 0, 0, 0));
  scroll.add(cyl(0.12, 0.12, 2.1, PAL.brown, -3.3, 0, 0));
  scroll.add(cyl(0.12, 0.12, 2.1, PAL.brown, 3.3, 0, 0));
  const lt = textSprite(line, { size: 0.58 });
  lt.position.set(0, 0.25, 0.12);
  const at = textSprite(`《${title}》 ${author}`, { size: 0.4, color: '#a08a76' });
  at.position.set(0, -0.55, 0.12);
  scroll.add(lt, at);
  scroll.position.set(0, 2.9, 0);
  g.add(scroll);
  const dur = 2.4;
  return {
    group: g, dur,
    update(p) {
      stars.forEach((s, i) => {
        s.scale.setScalar(0.75 + 0.35 * Math.abs(Math.sin(p * 6 + i * 1.3)));
      });
      const q = ez(seg(p, 0, 0.5));
      scroll.scale.set(q, q, 1);
    },
  };
}

// ================= 第 10 关：scene —— 看图说话小场景 =================
function label3d(text, x, y, z, size = 0.5) {
  const t = textSprite(text, { size });
  t.position.set(x, y, z);
  return t;
}
function visualScene({ sceneId, name }) {
  const g = grp();
  g.add(label3d(name, 0, 5.6, 0, 0.62));
  const dur = 2.4;
  let dyn = null;
  switch (sceneId) {
    case 'park': { // 公园放风筝
      g.add(cyl(0.3, 0.42, 1.8, PAL.brown, -2.4, 1.4, 0));
      g.add(sph(1.3, PAL.green, -2.4, 2.9, 0));
      g.add(box(1.8, 0.18, 0.6, PAL.wood, 1.8, 1.1, 0.5));           // 长椅
      g.add(box(0.18, 1.0, 0.5, PAL.wood, 1.1, 0.6, 0.5));
      g.add(box(0.18, 1.0, 0.5, PAL.wood, 2.5, 0.6, 0.5));
      const kite = grp(
        box(0.8, 0.8, 0.06, PAL.red, 0, 0, 0, { rz: Math.PI / 4, shadow: false }),
      );
      kite.position.set(1.2, 4.6, -0.5);
      g.add(kite);
      g.add(cyl(0.02, 0.02, 3.2, PAL.gray, 1.5, 2.9, 0.1, { shadow: false }));
      dyn = { kite };
      break;
    }
    case 'class': { // 教室上课
      g.add(box(3.6, 2.0, 0.16, PAL.dark, 0, 3.0, -1.5));           // 黑板
      g.add(label3d('上课了', 0, 3.0, -1.35, 0.55));
      [[-1.6, 0.4], [0, 0.4], [1.6, 0.4]].forEach(([x, z]) => {
        g.add(box(1.1, 0.12, 0.8, PAL.wood, x, 1.15, z));
        g.add(box(0.12, 1.1, 0.12, PAL.brown, x - 0.45, 0.6, z - 0.3));
        g.add(box(0.12, 1.1, 0.12, PAL.brown, x + 0.45, 0.6, z + 0.3));
      });
      break;
    }
    case 'rain': { // 下雨天
      const cloud = grp(
        sph(0.8, PAL.gray, 0, 0, 0, { shadow: false }),
        sph(0.6, PAL.gray, 0.8, -0.1, 0.1, { shadow: false }),
        sph(0.6, PAL.gray, -0.8, -0.1, -0.1, { shadow: false }),
      );
      cloud.position.set(0, 4.6, 0);
      g.add(cloud);
      const drops = [];
      for (let i = 0; i < 10; i++) {
        const d = cyl(0.035, 0.035, 0.5, PAL.blue, -2 + (i % 5) * 1.0, 3.4, (i < 5 ? 0.3 : -0.3), { shadow: false });
        g.add(d); drops.push(d);
      }
      g.add(cone(0.9, 0.5, PAL.red, 1.6, 2.6, 0.8));                 // 伞
      g.add(cyl(0.05, 0.05, 1.4, PAL.brown, 1.6, 1.7, 0.8));
      dyn = { drops };
      break;
    }
    case 'birthday': { // 过生日
      g.add(cyl(1.1, 1.1, 0.7, PAL.pink, 0, 1.15, 0));
      g.add(cyl(0.8, 0.8, 0.5, PAL.cream, 0, 1.75, 0));
      for (let i = -1; i <= 1; i++) {
        g.add(cyl(0.06, 0.06, 0.5, PAL.white, i * 0.5, 2.25, 0, { shadow: false }));
        g.add(sph(0.09, PAL.orange, i * 0.5, 2.55, 0, { emissive: 0xffb066, ei: 0.9, shadow: false }));
      }
      g.add(box(0.9, 0.9, 0.9, PAL.blue, -2.2, 0.95, 0.4));          // 礼物
      g.add(box(0.95, 0.18, 0.95, PAL.red, -2.2, 1.35, 0.4));
      g.add(box(0.8, 0.8, 0.8, PAL.purple, 2.3, 0.9, -0.3));
      break;
    }
    case 'zoo': { // 动物园猴子
      g.add(cyl(0.3, 0.42, 2.2, PAL.brown, -1.8, 1.6, 0));
      g.add(sph(1.4, PAL.green, -1.8, 3.2, 0));
      const mk = grp();
      mk.add(sph(0.5, PAL.brown, 0, 1.6, 0));                        // 身体
      mk.add(sph(0.38, PAL.brown, 0, 2.35, 0));                     // 头
      mk.add(sph(0.3, PAL.skin, 0, 2.3, 0.25, { shadow: false }));   // 脸
      mk.add(sph(0.12, PAL.brown, -0.38, 2.45, 0));
      mk.add(sph(0.12, PAL.brown, 0.38, 2.45, 0));
      mk.position.set(1.6, 0.5, 0.5);
      g.add(mk);
      dyn = { mk };
      break;
    }
    case 'beach': { // 沙滩堆沙堡
      g.add(sph(2.2, PAL.yellow, 0, 0.35, 0, { sy: 0.35 }));         // 沙堆
      g.add(cyl(0.5, 0.6, 0.9, PAL.orange, -0.8, 1.2, 0.3));        // 城堡
      g.add(cone(0.65, 0.7, PAL.red, -0.8, 2.0, 0.3));
      g.add(cyl(0.06, 0.06, 2.2, PAL.brown, 1.8, 1.6, -0.5));
      g.add(cone(1.2, 0.6, PAL.teal, 1.8, 2.9, -0.5));              // 遮阳伞
      break;
    }
    case 'snow': { // 下雪天堆雪人
      g.add(sph(0.8, PAL.white, 0, 1.05, 0));
      g.add(sph(0.6, PAL.white, 0, 2.1, 0));
      g.add(sph(0.42, PAL.white, 0, 2.95, 0));
      g.add(cone(0.12, 0.4, PAL.orange, 0, 2.95, 0.42, { rx: Math.PI / 2, shadow: false }));
      const flakes = [];
      for (let i = 0; i < 12; i++) {
        const f = sph(0.07, PAL.white, -3 + (i % 6) * 1.2, 4.5, -1 + (i % 2), { shadow: false });
        g.add(f); flakes.push(f);
      }
      dyn = { flakes };
      break;
    }
    case 'farm': { // 农场收割
      g.add(box(2.2, 1.8, 2.0, PAL.red, -1.5, 1.4, -0.5));           // 谷仓
      g.add(box(2.5, 0.18, 2.3, PAL.brown, -1.5, 2.4, -0.5, { rz: 0.35 }));
      g.add(box(2.5, 0.18, 2.3, PAL.brown, -1.5, 2.4, -0.5, { rz: -0.35 }));
      for (let i = 0; i < 6; i++) {
        g.add(cone(0.22, 0.9, PAL.yellow, 1.2 + (i % 3) * 0.9, 0.95, -0.6 + Math.floor(i / 3) * 0.9));
      }
      break;
    }
    default:
      break;
  }
  return {
    group: g, dur,
    update(p) {
      if (!dyn) return;
      if (dyn.kite) dyn.kite.position.y = 4.6 + Math.sin(p * 6) * 0.25;
      if (dyn.mk) dyn.mk.position.y = 0.5 + Math.abs(Math.sin(p * 8)) * 0.5;
      if (dyn.drops) dyn.drops.forEach((d, i) => {
        d.position.y = 3.6 - ((p * 2.4 + i * 0.23) % 2.6);
      });
      if (dyn.flakes) dyn.flakes.forEach((f, i) => {
        f.position.y = 5.2 - ((p * 2.2 + i * 0.35) % 4.4);
        f.position.x += Math.sin(p * 5 + i) * 0.004;
      });
    },
  };
}

// ================= 总入口 =================
export function buildVisual(v) {
  switch (v.kind) {
    case 'tree': return visualTree(v);
    case 'train': return visualTrain(v);
    case 'flower': return visualFlower(v);
    case 'seesaw': return visualSeesaw(v);
    case 'hands': return visualHands(v);
    case 'board': return visualBoard(v);
    case 'punct': return visualPunct(v);
    case 'theater': return visualTheater(v);
    case 'night': return visualNight(v);
    case 'scene': return visualScene(v);
    default: return { group: grp(), dur: 1, update() {} };
  }
}
