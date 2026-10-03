// ============================================================
// chef/models.js —— 小小厨师 3D 模型
// 12 种食材 builder（几何体拼搭，原点=底部中心，体量约 1 单位）
// + 小厨房场景 buildKitchen() + 组装层位表 ASSEMBLE
// 约定：只用 ../quiet3d/models/helpers.js 导出的拼搭件
// ============================================================
import { PAL, box, sph, cyl, cone, tor, plane, grp } from '../quiet3d/models/helpers.js';

// ---------- 食材注册表 ----------
export const INGREDIENTS = [
  { id: 'bread',      en: 'Bread',      zh: '面包', emoji: '🍞' },
  { id: 'lettuce',    en: 'Lettuce',    zh: '生菜', emoji: '🥬' },
  { id: 'cheese',     en: 'Cheese',     zh: '芝士', emoji: '🧀' },
  { id: 'patty',      en: 'Patty',      zh: '肉饼', emoji: '🥩' },
  { id: 'egg',        en: 'Egg',        zh: '鸡蛋', emoji: '🥚' },
  { id: 'flour',      en: 'Flour',      zh: '面粉', emoji: '🌾' },
  { id: 'cream',      en: 'Cream',      zh: '奶油', emoji: '🍦' },
  { id: 'strawberry', en: 'Strawberry', zh: '草莓', emoji: '🍓' },
  { id: 'cup',        en: 'Cup',        zh: '杯子', emoji: '🥤' },
  { id: 'tea',        en: 'Tea',        zh: '茶',   emoji: '🍵' },
  { id: 'milk',       en: 'Milk',       zh: '牛奶', emoji: '🥛' },
  { id: 'pearls',     en: 'Pearls',     zh: '珍珠', emoji: '⚫' },
];
export const ingOf = (id) => INGREDIENTS.find((x) => x.id === id);

// ---------- 菜谱 ----------
export const RECIPES = [
  { id: 'burger', emoji: '🍔', name: '汉堡', en: 'Hamburger', steps: ['bread', 'lettuce', 'cheese', 'patty'] },
  { id: 'cake',   emoji: '🍰', name: '蛋糕', en: 'Cake',      steps: ['egg', 'flour', 'cream', 'strawberry'] },
  { id: 'tea',    emoji: '🧋', name: '奶茶', en: 'Bubble tea', steps: ['cup', 'tea', 'milk', 'pearls'] },
];
export const recipeOf = (id) => RECIPES.find((r) => r.id === id);

// ---------- 食材 builders ----------
function buildBread() {
  const g = grp(sph(0.45, 0xe8b36a, 0, 0.30, 0, { sy: 0.62, seg: 16 }));
  for (let i = 0; i < 6; i++) { // 芝麻
    const a = (i / 6) * Math.PI * 2;
    g.add(sph(0.035, PAL.white, Math.cos(a) * 0.22, 0.52, Math.sin(a) * 0.22, { shadow: false }));
  }
  return g;
}
function buildLettuce() {
  const g = grp(cyl(0.50, 0.50, 0.07, PAL.green, 0, 0.06, 0, { seg: 18 }));
  for (let i = 0; i < 7; i++) { // 波浪边
    const a = (i / 7) * Math.PI * 2;
    g.add(sph(0.10, PAL.mint, Math.cos(a) * 0.46, 0.10, Math.sin(a) * 0.46));
  }
  return g;
}
function buildCheese() {
  const g = grp(cyl(0.52, 0.52, 0.06, 0xffd93d, 0, 0.05, 0, { seg: 3, ry: Math.PI / 6 }));
  g.add(sph(0.05, 0xf0b93a, 0.1, 0.09, 0.05, { shadow: false }));
  return g;
}
function buildPatty() {
  return grp(
    cyl(0.48, 0.48, 0.13, 0x8a5a3a, 0, 0.07, 0, { seg: 18 }),
    cyl(0.40, 0.40, 0.02, 0x74492c, 0, 0.14, 0, { shadow: false }),
  );
}
function buildEgg() {
  return grp(sph(0.30, PAL.white, 0, 0.37, 0, { sy: 1.25, seg: 16 }));
}
function buildFlour() {
  return grp(
    box(0.50, 0.62, 0.36, PAL.cream, 0, 0.31, 0),
    box(0.50, 0.12, 0.36, 0xead9b8, 0, 0.66, 0, { rz: 0.08 }), // 折口
    box(0.24, 0.20, 0.02, 0xffd93d, 0, 0.34, 0.185, { shadow: false }), // 麦穗标签
    box(0.06, 0.14, 0.02, 0xa9744f, 0, 0.34, 0.19, { shadow: false }),
  );
}
function buildCream() {
  return grp(
    cone(0.34, 0.24, PAL.white, 0, 0.12, 0, { seg: 14 }),
    cone(0.24, 0.22, PAL.white, 0, 0.32, 0, { seg: 14 }),
    cone(0.13, 0.20, PAL.white, 0, 0.50, 0, { seg: 12 }),
  );
}
function buildStrawberry() {
  const g = grp(cone(0.30, 0.44, PAL.red, 0, 0.30, 0, { rx: Math.PI, seg: 14 })); // 尖朝下
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    g.add(cone(0.07, 0.16, PAL.green, Math.cos(a) * 0.12, 0.55, Math.sin(a) * 0.12, { rx: 0.5 * Math.cos(a), rz: -0.5 * Math.sin(a) }));
  }
  g.add(cyl(0.03, 0.03, 0.14, PAL.green, 0, 0.64, 0));
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) // 籽点
    g.add(sph(0.025, 0xffe4a8, sx * 0.14, 0.32, sz * 0.14, { shadow: false }));
  return g;
}
function buildCup() {
  // 透明奶茶杯（能看到里面的液体和珍珠）
  return grp(
    cyl(0.34, 0.27, 0.62, 0xffffff, 0, 0.31, 0, { seg: 18, transparent: true, opacity: 0.42 }),
    tor(0.34, 0.035, PAL.pink, 0, 0.62, 0, { rx: Math.PI / 2 }),
    cyl(0.035, 0.035, 0.72, PAL.red, 0.10, 0.55, 0, { rz: 0.22 }), // 吸管
  );
}
function buildTea() {
  const g = grp(
    sph(0.32, 0xffb066, 0, 0.34, 0, { seg: 16 }),                    // 壶身
    cyl(0.13, 0.15, 0.09, 0xe89a55, 0, 0.64, 0),                    // 壶盖
    sph(0.05, 0xe89a55, 0, 0.71, 0),
    cyl(0.06, 0.10, 0.36, 0xffb066, 0.34, 0.42, 0, { rz: -0.65 }),  // 壶嘴
    tor(0.17, 0.04, 0xe89a55, -0.33, 0.40, 0, { arc: Math.PI, rz: Math.PI / 2 }), // 壶把
  );
  return g;
}
function buildMilk() {
  return grp(
    box(0.38, 0.52, 0.38, PAL.white, 0, 0.26, 0),                    // 纸盒身
    cone(0.30, 0.20, 0x6cb8ff, 0, 0.62, 0, { seg: 4, ry: Math.PI / 4, sz: 0.72 }), // 屋顶
    box(0.20, 0.24, 0.02, 0x6cb8ff, 0, 0.28, 0.195, { shadow: false }), // 标签
    sph(0.05, PAL.white, 0, 0.30, 0.21, { shadow: false }),
  );
}
function buildPearls() {
  const g = grp();
  const spots = [[0, 0.09, 0], [0.16, 0.09, 0.05], [-0.15, 0.09, -0.06], [0.05, 0.09, -0.16], [-0.06, 0.09, 0.15], [0.02, 0.22, -0.02]];
  for (const [x, y, z] of spots) g.add(sph(0.085, 0x3a3a48, x, y, z, { seg: 10 }));
  return g;
}

const BUILDERS = {
  bread: buildBread, lettuce: buildLettuce, cheese: buildCheese, patty: buildPatty,
  egg: buildEgg, flour: buildFlour, cream: buildCream, strawberry: buildStrawberry,
  cup: buildCup, tea: buildTea, milk: buildMilk, pearls: buildPearls,
};
export function buildIngredient(id) {
  const b = BUILDERS[id];
  if (!b) { console.warn('[chef] 食材缺失:', id); return grp(); }
  return b();
}
export function auditIngredients() {
  const bad = [];
  for (const ing of INGREDIENTS) {
    try {
      const g = buildIngredient(ing.id);
      let meshes = 0;
      g.traverse((o) => { if (o.isMesh) meshes++; });
      if (!meshes) bad.push(ing.id + ':0mesh');
    } catch (e) { bad.push(ing.id + ':ERR'); }
  }
  return bad;
}

// ---------- 组装：某菜谱第 stepIdx 步放上去的 group（组装原点为盘子中心） ----------
// 返回 { group, done }；汉堡最后一步自动加顶层面包
export function assembleLayer(recipeId, stepIdx) {
  const g = grp();
  if (recipeId === 'burger') {
    const ys = [0.05, 0.38, 0.49, 0.62];
    const ing = buildIngredient(RECIPES[0].steps[stepIdx]);
    ing.position.y = ys[stepIdx];
    g.add(ing);
    if (stepIdx === 3) { // 自动加顶层面包
      const top = buildIngredient('bread');
      top.scale.setScalar(0.88);
      top.position.y = 0.84;
      g.add(top);
    }
  } else if (recipeId === 'cake') {
    const pos = [[-0.38, 0.02, 0.12], [0.38, 0.0, -0.12], [0, 0.06, 0.15], [0, 0.52, 0.15]];
    const ing = buildIngredient(RECIPES[1].steps[stepIdx]);
    ing.position.set(...pos[stepIdx]);
    if (stepIdx === 1) ing.scale.setScalar(0.85);
    g.add(ing);
  } else if (recipeId === 'tea') {
    if (stepIdx === 0) {
      g.add(buildIngredient('cup'));
    } else if (stepIdx === 1) { // 茶汤
      g.add(cyl(0.27, 0.24, 0.14, 0xc98d5e, 0, 0.14, 0, { seg: 16, transparent: true, opacity: 0.85 }));
    } else if (stepIdx === 2) { // 牛奶
      g.add(cyl(0.28, 0.25, 0.16, 0xfff3d6, 0, 0.30, 0, { seg: 16, transparent: true, opacity: 0.9 }));
    } else { // 珍珠（放杯底，透过透明杯可见）
      const p = buildIngredient('pearls');
      p.position.y = 0.02;
      g.add(p);
    }
  }
  return g;
}

// ---------- 小厨房场景 ----------
// 布局（世界坐标）：
// 操作台：z=-2.6 一字排开，台面 y=0.85；食材槽位 x=-1.8/-0.6/0.6/1.8
// 组装圆桌：(-1.9, 0, 1.1)，桌面 y=0.72；盘子中心 = ASSEMBLE_POS
// 餐桌：(2.4, 0, 0.6)，桌面 y=0.68；顾客站在 (2.4, 0, -0.75) 面向 +z
// 灶台装饰：后墙 (-3.6, 0, -4.2)
export const COUNTER_Y = 0.85;
export const COUNTER_SLOTS = [-1.8, -0.6, 0.6, 1.8];
export const ASSEMBLE_POS = [-1.9, 0.78, 1.1];
export const SERVE_POS = [2.4, 0.85, 0.6];
export const CUSTOMER_POS = [2.4, 0, -0.75];

export function buildKitchen() {
  const parts = [];
  // 地面 + 两面墙
  const ground = cyl(6.2, 6.2, 0.3, 0xf7ecd9, 0, -0.15, 0, { seg: 44 });
  ground.receiveShadow = true;
  parts.push(ground);
  parts.push(box(12.8, 4.4, 0.3, 0xffe9f2, 0, 2.2, -4.6));       // 后墙
  parts.push(box(0.3, 4.4, 12.8, 0xffe0ee, -4.6, 2.2, 0));      // 左墙
  // 窗户
  parts.push(box(1.7, 1.5, 0.12, PAL.white, 2.6, 2.6, -4.42));
  parts.push(plane(1.35, 1.15, 0xbfe8ff, 2.6, 2.6, -4.34));
  // 操作台（一字长台）
  parts.push(box(5.4, 0.80, 1.3, 0xffd9b3, 0, 0.40, -2.6));      // 台身
  parts.push(box(5.5, 0.10, 1.4, PAL.white, 0, COUNTER_Y - 0.05, -2.6)); // 台面
  for (const sx of [-2.2, 2.2])                                  // 台脚
    parts.push(box(0.18, 0.40, 1.1, 0xe8b98a, sx, 0.20, -2.6));
  // 食材槽位小垫（视觉提示）
  for (const x of COUNTER_SLOTS)
    parts.push(cyl(0.42, 0.42, 0.03, 0xfff3d6, x, COUNTER_Y + 0.015, -2.6, { seg: 20, shadow: false }));
  // 灶台装饰（后墙）
  parts.push(box(1.7, 0.95, 0.85, PAL.navy, -3.3, 0.475, -4.0));
  parts.push(box(1.7, 0.08, 0.85, 0x3a3a48, -3.3, 0.99, -4.0));
  for (const [bx, bz] of [[-3.65, -4.15], [-2.95, -4.15], [-3.65, -3.85], [-2.95, -3.85]])
    parts.push(cyl(0.16, 0.16, 0.03, 0x6a6a7a, bx, 1.04, bz, { seg: 12, shadow: false }));
  parts.push(box(1.9, 0.5, 0.7, 0x8a9ab5, -3.3, 2.6, -4.15));    // 抽油烟机
  // 墙面置物架 + 罐子
  parts.push(box(2.2, 0.08, 0.5, PAL.wood, 0.6, 2.9, -4.35));
  for (let i = 0; i < 3; i++)
    parts.push(cyl(0.14, 0.14, 0.3, [PAL.pink, PAL.mint, PAL.yellow][i], 0.0 + i * 0.6, 3.08, -4.35, { seg: 12 }));
  // 组装圆桌
  parts.push(cyl(0.95, 0.95, 0.08, PAL.white, ASSEMBLE_POS[0], 0.68, ASSEMBLE_POS[2], { seg: 28 }));
  parts.push(cyl(0.10, 0.14, 0.64, PAL.wood, ASSEMBLE_POS[0], 0.34, ASSEMBLE_POS[2]));
  parts.push(cyl(0.72, 0.72, 0.05, 0xfff3d6, ASSEMBLE_POS[0], 0.745, ASSEMBLE_POS[2], { seg: 28 })); // 盘子
  // 餐桌 + 椅子
  parts.push(cyl(0.85, 0.85, 0.08, PAL.cream, SERVE_POS[0], 0.64, SERVE_POS[2], { seg: 28 }));
  parts.push(cyl(0.09, 0.13, 0.60, PAL.wood, SERVE_POS[0], 0.32, SERVE_POS[2]));
  parts.push(box(0.55, 0.08, 0.55, PAL.pink, SERVE_POS[0], 0.42, SERVE_POS[2] - 1.35)); // 椅面
  for (const [ox, oz] of [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]])
    parts.push(cyl(0.035, 0.035, 0.42, PAL.wood, SERVE_POS[0] + ox, 0.21, SERVE_POS[2] - 1.35 + oz));
  parts.push(box(0.55, 0.55, 0.08, PAL.pink, SERVE_POS[0], 0.72, SERVE_POS[2] - 1.62)); // 椅背
  // 地毯
  const rug = cyl(1.6, 1.6, 0.04, 0xffd1e3, 0.4, 0.02, 0.9, { seg: 32 });
  rug.receiveShadow = true;
  parts.push(rug);
  const g = grp(...parts);
  g.userData.isKitchen = true;
  return g;
}
