// ============================================================
// dressup/models.js —— 换装小屋 3D 模型
// buildMannequin()：女孩模特（肤色连体衣打底，无自带裙子，方便衣物叠加）
// 19 件衣物 builder：全部几何体拼搭，原点=模特脚底（y=0），直接挂到模特 group 上
// 身体基准（模特空间）：脚 y0~0.1｜腿 y0.04~0.36（x±0.13，r0.09）｜躯干 y0.35~1.03（r0.24~0.28）
// 脖子 y1.02~1.18｜头心 y1.42 r0.42（顶 1.84）｜胳膊关节 (±0.33, 0.92)
// ============================================================
import { PAL, box, sph, cyl, cone, tor, tube, grp } from '../quiet3d/models/helpers.js';

const SKIN = PAL.skin;
const HAIR = 0x6b4423;

// ---------- 模特 ----------
export function buildMannequin() {
  const parts = [];
  // 腿 + 脚（肤色）
  parts.push(cyl(0.09, 0.1, 0.32, SKIN, -0.13, 0.2, 0));
  parts.push(cyl(0.09, 0.1, 0.32, SKIN, 0.13, 0.2, 0));
  parts.push(box(0.16, 0.1, 0.26, SKIN, -0.13, 0.05, 0.05));
  parts.push(box(0.16, 0.1, 0.26, SKIN, 0.13, 0.05, 0.05));
  // 连体衣躯干（肤色打底）
  parts.push(cyl(0.24, 0.28, 0.68, SKIN, 0, 0.69, 0));
  // 脖子
  parts.push(cyl(0.1, 0.11, 0.16, SKIN, 0, 1.1, 0));
  // 胳膊
  const mkArm = (sx) => {
    const j = grp();
    j.position.set(sx * 0.33, 0.92, 0);
    j.add(cyl(0.07, 0.08, 0.42, SKIN, 0, -0.18, 0));
    j.add(sph(0.08, SKIN, 0, -0.42, 0));
    j.rotation.z = sx * 0.12;
    return j;
  };
  const armL = mkArm(-1);
  const armR = mkArm(1);
  // 大脑袋
  parts.push(sph(0.42, SKIN, 0, 1.42, 0, { seg: 16 }));
  for (const sx of [-1, 1]) {
    parts.push(sph(0.055, PAL.black, sx * 0.15, 1.48, 0.395));
    parts.push(sph(0.02, PAL.white, sx * 0.15 + 0.02, 1.5, 0.435, { shadow: false }));
    parts.push(sph(0.06, PAL.pink, sx * 0.25, 1.36, 0.33, { sy: 0.7, shadow: false }));
  }
  parts.push(tor(0.11, 0.028, 0x8a4a3a, 0, 1.3, 0.385, { arc: Math.PI, rz: Math.PI }));
  // 马尾头发
  parts.push(sph(0.45, HAIR, 0, 1.52, -0.05, { sy: 0.72, sx: 1.02, seg: 14 }));
  parts.push(sph(0.15, HAIR, 0, 1.52, -0.48));
  parts.push(cyl(0.05, 0.09, 0.32, HAIR, 0, 1.34, -0.5, { rx: 0.25 }));

  const g = grp(...parts, armL, armR);
  g.userData.isMannequin = true;
  g.userData.phase = Math.random() * Math.PI * 2;
  return g;
}

// ============================================================
// 衣物 builders（每件返回 Group，模特空间坐标）
// ============================================================

// ---------- 👕 上衣 ----------
function buildTshirt() {
  const c = 0xff8fab;
  return grp(
    cyl(0.28, 0.30, 0.30, c, 0, 0.97, 0),
    cyl(0.10, 0.11, 0.20, c, -0.37, 0.90, 0, { rz: 0.25 }),
    cyl(0.10, 0.11, 0.20, c, 0.37, 0.90, 0, { rz: -0.25 }),
    tor(0.12, 0.032, 0xffffff, 0, 1.10, 0, { rx: Math.PI / 2 }),
    sph(0.045, 0xffffff, 0, 1.0, 0.295, { shadow: false }), // 胸前小圆点装饰
  );
}
function buildSweater() {
  const c = 0x9be8c8, dark = 0x6fc7a5;
  return grp(
    cyl(0.30, 0.32, 0.36, c, 0, 0.95, 0),
    cyl(0.10, 0.09, 0.42, c, -0.345, 0.72, 0, { rz: 0.12 }),
    cyl(0.10, 0.09, 0.42, c, 0.345, 0.72, 0, { rz: -0.12 }),
    tor(0.305, 0.045, dark, 0, 0.78, 0, { rx: Math.PI / 2 }), // 罗纹下摆
    cyl(0.13, 0.15, 0.14, c, 0, 1.12, 0),                    // 高领
  );
}
function buildJacket() {
  const c = 0x6cb8ff, dark = 0x4a5fa5;
  return grp(
    cyl(0.31, 0.33, 0.34, c, 0, 0.95, 0),
    cyl(0.10, 0.09, 0.42, c, -0.345, 0.72, 0, { rz: 0.12 }),
    cyl(0.10, 0.09, 0.42, c, 0.345, 0.72, 0, { rz: -0.12 }),
    box(0.035, 0.30, 0.02, 0xffffff, 0, 0.95, 0.325, { shadow: false }), // 拉链
    box(0.12, 0.10, 0.05, dark, -0.10, 1.13, 0.20, { ry: 0.35 }),        // 衣领
    box(0.12, 0.10, 0.05, dark, 0.10, 1.13, 0.20, { ry: -0.35 }),
    box(0.10, 0.09, 0.03, dark, -0.17, 0.84, 0.29),  // 口袋
    box(0.10, 0.09, 0.03, dark, 0.17, 0.84, 0.29),
  );
}

// ---------- 👗 裙装（与下装互斥） ----------
function buildDress() {
  const c = 0xff9db8, dark = 0xf76b8a;
  return grp(
    cyl(0.27, 0.29, 0.26, c, 0, 1.00, 0),            // 紧身上衣
    tor(0.28, 0.04, dark, 0, 0.88, 0, { rx: Math.PI / 2 }), // 腰带
    cyl(0.29, 0.52, 0.62, c, 0, 0.57, 0),            // 蓬蓬裙摆
    box(0.07, 0.12, 0.05, dark, -0.14, 1.14, 0),     // 肩带
    box(0.07, 0.12, 0.05, dark, 0.14, 1.14, 0),
    sph(0.04, 0xffffff, 0, 1.02, 0.28, { shadow: false }),
  );
}
function buildSkirt() {
  const c = 0xb388eb, dark = 0x8a5fbf;
  return grp(
    tor(0.27, 0.045, dark, 0, 0.95, 0, { rx: Math.PI / 2 }), // 松紧腰带
    cyl(0.28, 0.48, 0.52, c, 0, 0.67, 0),                   // 半身裙
    tor(0.46, 0.03, dark, 0, 0.43, 0, { rx: Math.PI / 2 }), // 裙摆边
  );
}
function buildGown() {
  const c = 0xffd93d, gold = 0xe8a93d;
  return grp(
    cyl(0.27, 0.28, 0.30, c, 0, 1.00, 0),
    tor(0.28, 0.04, gold, 0, 0.88, 0, { rx: Math.PI / 2 }),
    cyl(0.29, 0.62, 1.06, c, 0, 0.50, 0),            // 拖地长裙
    tor(0.60, 0.04, gold, 0, 0.03, 0, { rx: Math.PI / 2 }), // 裙摆金边
    sph(0.035, 0xffffff, -0.1, 1.02, 0.27, { shadow: false }),
    sph(0.035, 0xffffff, 0.08, 0.96, 0.28, { shadow: false }),
  );
}

// ---------- 👖 下装（与裙装互斥） ----------
function buildPants() {
  const c = 0x4fc3c3, dark = 0x3a9a9a;
  return grp(
    cyl(0.115, 0.105, 0.38, c, -0.13, 0.21, 0),
    cyl(0.115, 0.105, 0.38, c, 0.13, 0.21, 0),
    box(0.38, 0.26, 0.34, c, 0, 0.45, 0),
    box(0.39, 0.06, 0.35, dark, 0, 0.56, 0), // 腰带
  );
}
function buildJeans() {
  const c = 0x4a5fa5, dark = 0x35487e;
  const g = grp(
    cyl(0.115, 0.105, 0.38, c, -0.13, 0.21, 0),
    cyl(0.115, 0.105, 0.38, c, 0.13, 0.21, 0),
    box(0.38, 0.26, 0.34, c, 0, 0.45, 0),
    tor(0.115, 0.032, 0x9be8c8, -0.13, 0.06, 0, { rx: Math.PI / 2 }), // 翻边裤脚
    tor(0.115, 0.032, 0x9be8c8, 0.13, 0.06, 0, { rx: Math.PI / 2 }),
    box(0.10, 0.09, 0.02, dark, -0.10, 0.45, -0.175, { shadow: false }), // 后兜
    box(0.10, 0.09, 0.02, dark, 0.10, 0.45, -0.175, { shadow: false }),
    sph(0.028, 0xe8a93d, 0, 0.56, 0.18, { shadow: false }), // 纽扣
  );
  return g;
}
function buildShorts() {
  const c = 0xffb066, dark = 0xe08a3d;
  return grp(
    cyl(0.115, 0.12, 0.22, c, -0.13, 0.30, 0),
    cyl(0.115, 0.12, 0.22, c, 0.13, 0.30, 0),
    box(0.38, 0.20, 0.34, c, 0, 0.42, 0),
    box(0.39, 0.05, 0.35, dark, 0, 0.50, 0), // 腰带
    sph(0.03, 0xffffff, 0, 0.42, 0.18, { shadow: false }),
  );
}

// ---------- 👟 鞋子 ----------
function buildSneakers() {
  const c = 0xff6b6b;
  const parts = [];
  for (const sx of [-1, 1]) {
    parts.push(box(0.20, 0.13, 0.32, c, sx * 0.13, 0.075, 0.06));
    parts.push(box(0.21, 0.05, 0.33, 0xffffff, sx * 0.13, 0.025, 0.06)); // 白鞋底
    for (let i = 0; i < 3; i++)
      parts.push(box(0.12, 0.02, 0.035, 0xffffff, sx * 0.13, 0.145, -0.02 + i * 0.08, { shadow: false })); // 鞋带
  }
  return grp(...parts);
}
function buildBoots() {
  const c = 0xa9744f;
  const parts = [];
  for (const sx of [-1, 1]) {
    parts.push(box(0.20, 0.13, 0.32, c, sx * 0.13, 0.075, 0.06));
    parts.push(cyl(0.13, 0.145, 0.32, c, sx * 0.13, 0.26, 0)); // 靴筒
    parts.push(tor(0.14, 0.035, 0xfff3d6, sx * 0.13, 0.40, 0, { rx: Math.PI / 2 })); // 毛边
  }
  return grp(...parts);
}
function buildSandals() {
  const c = 0xffd93d;
  const parts = [];
  for (const sx of [-1, 1]) {
    parts.push(box(0.19, 0.05, 0.30, 0xa9744f, sx * 0.13, 0.025, 0.06)); // 鞋底
    parts.push(box(0.16, 0.03, 0.05, c, sx * 0.13, 0.10, 0.10, { rx: 0.35 }));
    parts.push(box(0.16, 0.03, 0.05, c, sx * 0.13, 0.10, 0.02, { rx: -0.35 }));
    parts.push(sph(0.035, 0xff9db8, sx * 0.13, 0.12, 0.16, { shadow: false })); // 小花
  }
  return grp(...parts);
}

// ---------- 🎩 帽子 ----------
function buildCap() {
  const c = 0xff6b6b;
  return grp(
    sph(0.44, c, 0, 1.60, -0.02, { sy: 0.62, seg: 14 }),
    box(0.44, 0.05, 0.32, c, 0, 1.56, 0.52), // 帽檐
    sph(0.05, 0xffffff, 0, 1.88, -0.02, { shadow: false }),
  );
}
function buildSunHat() {
  const c = 0xfff3d6;
  return grp(
    cyl(0.60, 0.60, 0.05, c, 0, 1.64, 0, { seg: 20 }),
    sph(0.28, c, 0, 1.66, 0, { sy: 0.8, seg: 14 }),
    tor(0.28, 0.04, 0xff9db8, 0, 1.64, 0, { rx: Math.PI / 2 }), // 粉色丝带
    sph(0.07, 0xff9db8, 0.24, 1.66, 0.16, { sx: 1.3, sy: 0.8, shadow: false }),
  );
}
function buildCrown() {
  const gold = 0xe8a93d;
  const parts = [cyl(0.40, 0.42, 0.16, gold, 0, 1.70, 0, { seg: 16 })];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    parts.push(cone(0.07, 0.18, gold, Math.cos(a) * 0.40, 1.86, Math.sin(a) * 0.40 - 0.02));
  }
  const gems = [0xff6b6b, 0x6cb8ff, 0x7ed491];
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.5;
    parts.push(sph(0.045, gems[i], Math.cos(a) * 0.41, 1.70, Math.sin(a) * 0.41, { shadow: false }));
  }
  return grp(...parts);
}

// ---------- 👜 配饰 ----------
function buildGlasses() {
  const c = 0x3a3a48;
  return grp(
    tor(0.095, 0.028, c, -0.15, 1.48, 0.40),
    tor(0.095, 0.028, c, 0.15, 1.48, 0.40),
    box(0.09, 0.03, 0.03, c, 0, 1.48, 0.41, { shadow: false }),
    box(0.03, 0.03, 0.30, c, -0.245, 1.48, 0.27, { shadow: false }),
    box(0.03, 0.03, 0.30, c, 0.245, 1.48, 0.27, { shadow: false }),
  );
}
function buildBow() {
  const c = 0xf76b8a;
  return grp(
    sph(0.11, c, 0.22, 1.76, 0.10, { sx: 1.3, sy: 0.8, seg: 10 }),
    sph(0.11, c, 0.42, 1.76, 0.10, { sx: 1.3, sy: 0.8, seg: 10 }),
    sph(0.06, c, 0.32, 1.74, 0.12),
    cone(0.05, 0.14, c, 0.28, 1.62, 0.10, { rz: 0.3 }),
    cone(0.05, 0.14, c, 0.38, 1.62, 0.10, { rz: -0.3 }),
  );
}
function buildBag() {
  const c = 0xb388eb, dark = 0x8a5fbf;
  return grp(
    tube([[0.28, 1.06, 0.02], [0.40, 0.88, 0.06], [0.44, 0.74, 0.08]], 0.025, dark), // 肩带
    box(0.26, 0.32, 0.13, c, 0.46, 0.58, 0.08),
    box(0.27, 0.12, 0.14, dark, 0.46, 0.70, 0.08), // 翻盖
    sph(0.03, 0xe8a93d, 0.46, 0.66, 0.155, { shadow: false }), // 按扣
  );
}
function buildScarf() {
  const c = 0x4fc3c3, dark = 0x3a9a9a;
  return grp(
    tor(0.16, 0.06, c, 0, 1.07, 0, { rx: Math.PI / 2 }), // 绕颈
    box(0.13, 0.32, 0.05, c, 0.12, 0.86, 0.18),          // 垂尾
    box(0.13, 0.05, 0.055, dark, 0.12, 0.72, 0.18, { shadow: false }),
    box(0.04, 0.06, 0.055, dark, 0.08, 0.68, 0.18, { shadow: false }), // 流苏
    box(0.04, 0.06, 0.055, dark, 0.16, 0.68, 0.18, { shadow: false }),
  );
}

// ============================================================
// 注册表
// ============================================================
export const CATS = [
  { id: 'tops', name: '上衣', emoji: '👕' },
  { id: 'dresses', name: '裙装', emoji: '👗' },
  { id: 'bottoms', name: '下装', emoji: '👖' },
  { id: 'shoes', name: '鞋子', emoji: '👟' },
  { id: 'hats', name: '帽子', emoji: '🎩' },
  { id: 'accessories', name: '配饰', emoji: '👜' },
];

export const CLOTHES = [
  { id: 'tshirt', cat: 'tops', en: 'T-shirt', zh: 'T恤', emoji: '👕', build: buildTshirt },
  { id: 'sweater', cat: 'tops', en: 'sweater', zh: '毛衣', emoji: '🧶', build: buildSweater },
  { id: 'jacket', cat: 'tops', en: 'jacket', zh: '夹克', emoji: '🧥', build: buildJacket },
  { id: 'dress', cat: 'dresses', en: 'dress', zh: '连衣裙', emoji: '👗', build: buildDress },
  { id: 'skirt', cat: 'dresses', en: 'skirt', zh: '半身裙', emoji: '👘', build: buildSkirt },
  { id: 'gown', cat: 'dresses', en: 'gown', zh: '礼服裙', emoji: '💃', build: buildGown },
  { id: 'pants', cat: 'bottoms', en: 'pants', zh: '长裤', emoji: '👖', build: buildPants },
  { id: 'jeans', cat: 'bottoms', en: 'jeans', zh: '牛仔裤', emoji: '💙', build: buildJeans },
  { id: 'shorts', cat: 'bottoms', en: 'shorts', zh: '短裤', emoji: '🩳', build: buildShorts },
  { id: 'sneakers', cat: 'shoes', en: 'sneakers', zh: '运动鞋', emoji: '👟', build: buildSneakers },
  { id: 'boots', cat: 'shoes', en: 'boots', zh: '靴子', emoji: '🥾', build: buildBoots },
  { id: 'sandals', cat: 'shoes', en: 'sandals', zh: '凉鞋', emoji: '🩴', build: buildSandals },
  { id: 'cap', cat: 'hats', en: 'cap', zh: '棒球帽', emoji: '🧢', build: buildCap },
  { id: 'sunhat', cat: 'hats', en: 'sun hat', zh: '遮阳帽', emoji: '👒', build: buildSunHat },
  { id: 'crown', cat: 'hats', en: 'crown', zh: '皇冠', emoji: '👑', build: buildCrown },
  { id: 'glasses', cat: 'accessories', en: 'glasses', zh: '眼镜', emoji: '👓', build: buildGlasses },
  { id: 'bow', cat: 'accessories', en: 'bow', zh: '蝴蝶结', emoji: '🎀', build: buildBow },
  { id: 'bag', cat: 'accessories', en: 'bag', zh: '包包', emoji: '👜', build: buildBag },
  { id: 'scarf', cat: 'accessories', en: 'scarf', zh: '围巾', emoji: '🧣', build: buildScarf },
];

export const clothOf = (id) => CLOTHES.find((c) => c.id === id);

// 自检：每件衣物构造零报错（node 下跑 three 几何体构造）
export function auditClothes() {
  const missing = [];
  for (const c of CLOTHES) {
    try {
      const g = c.build();
      if (!g || !g.isGroup) missing.push(c.id + '（非 Group）');
      let meshes = 0;
      g.traverse((o) => { if (o.isMesh) meshes++; });
      if (meshes === 0) missing.push(c.id + '（0 mesh）');
    } catch (e) {
      missing.push(c.id + '（报错：' + e.message + '）');
    }
  }
  if (missing.length) console.warn('[dressup] 衣物自检问题:', missing);
  else console.log('[dressup] 衣物自检通过：19/19');
  return missing;
}
