// ============================================================
// food.js —— 食物类单词 3D 模型（22 个 builder）
// 约定：Group 原点在底部中心（y=0 为地面），尺寸约 1~2 单位，
// 只用 helpers.js 的 mat/PAL/box/sph/cyl/cone/tor/plane/tube/grp 拼搭。
// ============================================================
import * as THREE from 'three';
import { mat, PAL, box, sph, cyl, cone, tor, plane, tube, grp } from './helpers.js';

// ---------- 锅 Pot ----------
export function buildPot() {
  return grp(
    cyl(0.55, 0.45, 0.7, PAL.navy, 0, 0.35, 0),
    cyl(0.58, 0.58, 0.09, PAL.dark, 0, 0.745, 0),
    sph(0.1, PAL.dark, 0, 0.88, 0),
    tor(0.14, 0.045, PAL.dark, -0.6, 0.45, 0, { arc: Math.PI, rz: Math.PI / 2 }),
    tor(0.14, 0.045, PAL.dark, 0.6, 0.45, 0, { arc: Math.PI, rz: -Math.PI / 2 }),
    cyl(0.4, 0.4, 0.04, PAL.white, 0, 0.76, 0, { transparent: true, opacity: 0.35 }),
  );
}

// ---------- 平底锅 Pan ----------
export function buildPan() {
  return grp(
    cyl(0.55, 0.45, 0.18, PAL.dark, 0, 0.3, 0),
    cyl(0.5, 0.5, 0.05, PAL.gray, 0, 0.37, 0),
    box(0.75, 0.1, 0.18, PAL.brown, 0.85, 0.33, 0, { rz: 0.12 }),
    sph(0.06, PAL.dark, 1.15, 0.37, 0),
    cyl(0.3, 0.34, 0.06, PAL.white, -0.05, 0.42, 0.05),
    sph(0.13, PAL.yellow, 0, 0.47, 0.08, { sy: 0.65 }),
  );
}

// ---------- 煎蛋 Egg ----------
export function buildEgg() {
  return grp(
    cyl(0.48, 0.56, 0.09, PAL.white, 0, 0.045, 0),
    cyl(0.4, 0.46, 0.09, PAL.white, 0.12, 0.045, -0.1),
    sph(0.2, PAL.orange, 0.08, 0.15, 0.02, { sy: 0.65 }),
    sph(0.05, PAL.white, 0.0, 0.25, 0.1),
    sph(0.03, PAL.cream, -0.25, 0.1, 0.25, { sy: 0.5 }),
  );
}

// ---------- 牛奶 Milk ----------
export function buildMilk() {
  return grp(
    box(0.6, 1.0, 0.6, PAL.white, 0, 0.5, 0),
    cone(0.45, 0.35, PAL.blue, 0, 1.175, 0, { seg: 4, ry: Math.PI / 4 }),
    box(0.32, 0.07, 0.14, PAL.blue, 0, 1.37, 0),
    plane(0.42, 0.52, PAL.blue, 0, 0.48, 0.305),
    cyl(0.13, 0.13, 0.02, PAL.white, 0, 0.48, 0.31, { rx: Math.PI / 2 }),
    plane(0.42, 0.2, PAL.mint, 0, 0.12, 0.305),
  );
}

// ---------- 面包 Bread ----------
export function buildBread() {
  return grp(
    box(0.62, 0.72, 0.18, PAL.brown, 0, 0.36, 0),
    box(0.5, 0.58, 0.2, PAL.cream, 0, 0.33, 0),
    box(0.2, 0.03, 0.21, PAL.wood, -0.1, 0.5, 0, { rz: 0.25 }),
    box(0.2, 0.03, 0.21, PAL.wood, 0.1, 0.4, 0, { rz: 0.25 }),
  );
}

// ---------- 杯子 Cup ----------
export function buildCup() {
  return grp(
    cyl(0.55, 0.55, 0.06, PAL.white, 0, 0.03, 0),
    cyl(0.4, 0.3, 0.5, PAL.pink, 0, 0.31, 0),
    tor(0.17, 0.05, PAL.pink, 0.44, 0.33, 0, { arc: Math.PI, rz: -Math.PI / 2 }),
    cyl(0.34, 0.34, 0.04, PAL.rose, 0, 0.55, 0, { transparent: true, opacity: 0.7 }),
    tube([[0, 0.6, 0], [0.06, 0.82, 0], [-0.05, 1.04, 0]], 0.03, PAL.white, { transparent: true, opacity: 0.55 }),
    tube([[0.15, 0.6, 0.05], [0.2, 0.8, 0.05], [0.12, 1.0, 0.05]], 0.025, PAL.white, { transparent: true, opacity: 0.45 }),
  );
}

// ---------- 苹果 Apple ----------
export function buildApple() {
  return grp(
    sph(0.42, PAL.red, 0, 0.45, 0),
    cyl(0.05, 0.05, 0.25, PAL.brown, 0, 0.9, 0),
    plane(0.25, 0.18, PAL.green, 0.15, 0.85, 0, { rx: -0.4 }),
    sph(0.12, PAL.pink, -0.2, 0.5, 0.32, { sx: 0.6, sy: 0.8 }),
    sph(0.07, PAL.white, 0.18, 0.6, 0.33, { transparent: true, opacity: 0.7 }),
  );
}

// ---------- 香蕉 Banana ----------
export function buildBanana() {
  return grp(
    tor(0.4, 0.14, PAL.yellow, 0, 0.5, 0, { arc: Math.PI }),
    sph(0.09, PAL.brown, 0.4, 0.5, 0),
    sph(0.09, PAL.brown, -0.4, 0.5, 0),
    cyl(0.05, 0.06, 0.18, PAL.brown, -0.4, 0.62, 0),
    tor(0.4, 0.05, PAL.cream, 0, 0.5, 0, { arc: Math.PI * 0.7, rz: 0.15 }),
  );
}

// ---------- 饼干 Cookie ----------
export function buildCookie() {
  return grp(
    cyl(0.45, 0.45, 0.13, PAL.wood, 0, 0.065, 0),
    cyl(0.38, 0.38, 0.14, PAL.cream, 0, 0.07, 0),
    sph(0.06, PAL.dark, 0.15, 0.15, 0.1),
    sph(0.06, PAL.dark, -0.18, 0.15, 0.05),
    sph(0.06, PAL.dark, 0.02, 0.15, -0.2),
    sph(0.05, PAL.dark, -0.05, 0.15, 0.22),
    sph(0.05, PAL.dark, 0.25, 0.15, -0.12),
  );
}

// ---------- 果汁 Juice ----------
export function buildJuice() {
  return grp(
    box(0.5, 0.85, 0.5, PAL.orange, 0, 0.425, 0),
    box(0.52, 0.1, 0.52, PAL.red, 0, 0.9, 0),
    tube([[0.12, 0.95, 0], [0.24, 1.3, 0]], 0.045, PAL.red),
    plane(0.34, 0.42, PAL.white, 0, 0.42, 0.255),
    cyl(0.11, 0.11, 0.02, PAL.orange, 0, 0.44, 0.26, { rx: Math.PI / 2 }),
    cyl(0.06, 0.06, 0.025, PAL.yellow, 0, 0.44, 0.26, { rx: Math.PI / 2 }),
  );
}

// ---------- 蛋糕 Cake ----------
export function buildCake() {
  return grp(
    cyl(0.7, 0.7, 0.07, PAL.white, 0, 0.035, 0),
    cyl(0.55, 0.55, 0.4, PAL.pink, 0, 0.27, 0),
    cyl(0.57, 0.55, 0.1, PAL.white, 0, 0.52, 0),
    sph(0.09, PAL.red, 0, 0.63, 0),
    cyl(0.05, 0.05, 0.35, PAL.mint, 0.25, 0.745, 0),
    cone(0.06, 0.14, PAL.yellow, 0.25, 0.99, 0, { emissive: 0xff9900, ei: 0.9 }),
    sph(0.07, PAL.rose, -0.25, 0.6, 0.15),
    sph(0.07, PAL.rose, 0.1, 0.6, -0.28),
  );
}

// ---------- 糖果 Candy ----------
export function buildCandy() {
  return grp(
    sph(0.3, PAL.rose, 0, 0.35, 0, { sx: 1.2 }),
    cone(0.18, 0.35, PAL.pink, -0.55, 0.35, 0, { rz: Math.PI / 2 }),
    cone(0.18, 0.35, PAL.pink, 0.55, 0.35, 0, { rz: -Math.PI / 2 }),
    tor(0.34, 0.035, PAL.white, 0, 0.35, 0, { rx: Math.PI / 2 }),
    sph(0.06, PAL.white, -0.38, 0.35, 0),
    sph(0.06, PAL.white, 0.38, 0.35, 0),
  );
}

// ---------- 西瓜 Watermelon ----------
export function buildWatermelon() {
  return grp(
    sph(0.6, PAL.green, 0, 0.3, 0, { sy: 0.6 }),
    sph(0.52, PAL.red, 0, 0.34, 0, { sy: 0.55 }),
    sph(0.045, PAL.black, 0, 0.63, 0, { sy: 0.6 }),
    sph(0.045, PAL.black, 0.22, 0.59, 0.1, { sy: 0.6 }),
    sph(0.045, PAL.black, -0.22, 0.59, 0.1, { sy: 0.6 }),
    sph(0.045, PAL.black, 0.12, 0.6, -0.2, { sy: 0.6 }),
    sph(0.045, PAL.black, -0.12, 0.6, -0.2, { sy: 0.6 }),
  );
}

// ---------- 甜甜圈 Donut ----------
export function buildDonut() {
  const sprinkles = [
    [0.4, 0.62, 0, PAL.red, 0.3], [0.2, 0.62, 0.346, PAL.yellow, 1.1],
    [-0.2, 0.62, 0.346, PAL.blue, 2.0], [-0.4, 0.62, 0, PAL.green, 0.7],
    [-0.2, 0.62, -0.346, PAL.purple, 1.6], [0.2, 0.62, -0.346, PAL.white, 2.6],
  ];
  return grp(
    tor(0.4, 0.22, PAL.orange, 0, 0.35, 0, { rx: Math.PI / 2 }),
    tor(0.4, 0.16, PAL.pink, 0, 0.47, 0, { rx: Math.PI / 2 }),
    ...sprinkles.map(([x, y, z, c, r]) => box(0.09, 0.04, 0.04, c, x, y, z, { ry: r })),
  );
}

// ---------- 葡萄 Grapes ----------
export function buildGrapes() {
  return grp(
    sph(0.2, PAL.purple, -0.22, 0.18, 0),
    sph(0.2, PAL.purple, 0, 0.18, 0.05),
    sph(0.2, PAL.purple, 0.22, 0.18, 0),
    sph(0.2, PAL.purple, -0.12, 0.46, 0),
    sph(0.2, PAL.purple, 0.12, 0.46, 0.03),
    sph(0.2, PAL.purple, 0, 0.72, 0),
    cyl(0.04, 0.05, 0.28, PAL.brown, 0, 0.95, 0),
    plane(0.26, 0.18, PAL.green, 0.2, 0.88, 0, { rx: -0.4, ry: 0.5 }),
  );
}

// ---------- 蘑菇 Mushroom ----------
export function buildMushroom() {
  return grp(
    cyl(0.16, 0.22, 0.5, PAL.cream, 0, 0.25, 0),
    sph(0.45, PAL.red, 0, 0.52, 0, { sy: 0.7 }),
    sph(0.07, PAL.white, 0, 0.82, 0.05),
    sph(0.06, PAL.white, 0.26, 0.74, 0.12),
    sph(0.06, PAL.white, -0.25, 0.74, 0.1),
    sph(0.055, PAL.white, 0.05, 0.72, -0.3),
    sph(0.055, PAL.white, -0.1, 0.7, 0.32),
  );
}

// ---------- 冰淇淋 IceCream ----------
export function buildIceCream() {
  return grp(
    cone(0.35, 0.75, PAL.wood, 0, 0.375, 0, { rz: Math.PI }),
    sph(0.4, PAL.pink, 0, 0.85, 0),
    sph(0.09, PAL.red, 0, 1.28, 0),
    cyl(0.05, 0.05, 0.55, PAL.brown, 0.25, 1.05, 0, { rz: -0.35 }),
    sph(0.06, PAL.white, -0.15, 1.05, 0.3, { transparent: true, opacity: 0.7 }),
  );
}

// ---------- 纸杯蛋糕 Cupcake ----------
export function buildCupcake() {
  return grp(
    cyl(0.34, 0.24, 0.42, PAL.rose, 0, 0.21, 0),
    sph(0.36, PAL.white, 0, 0.52, 0, { sy: 0.7 }),
    cone(0.15, 0.25, PAL.white, 0, 0.85, 0),
    sph(0.08, PAL.red, 0, 1.0, 0),
    sph(0.05, PAL.blue, 0.2, 0.6, 0.15),
    sph(0.05, PAL.yellow, -0.18, 0.62, 0.12),
    sph(0.05, PAL.green, 0.05, 0.58, -0.22),
  );
}

// ---------- 盘子 Plate ----------
export function buildPlate() {
  return grp(
    cyl(0.62, 0.45, 0.1, PAL.white, 0, 0.05, 0),
    tor(0.56, 0.055, PAL.mint, 0, 0.1, 0, { rx: Math.PI / 2 }),
    cyl(0.4, 0.4, 0.03, PAL.cream, 0, 0.1, 0),
    tor(0.4, 0.03, PAL.pink, 0, 0.115, 0, { rx: Math.PI / 2 }),
  );
}

// ---------- 刀 Knife ----------
export function buildKnife() {
  return grp(
    box(0.85, 0.05, 0.2, PAL.gray, 0.32, 0.045, 0),
    box(0.85, 0.02, 0.05, PAL.white, 0.32, 0.075, 0.06),
    box(0.5, 0.09, 0.15, PAL.brown, -0.5, 0.055, 0),
    sph(0.025, PAL.dark, -0.4, 0.105, 0),
    sph(0.025, PAL.dark, -0.6, 0.105, 0),
    box(0.06, 0.07, 0.16, PAL.dark, -0.12, 0.05, 0),
  );
}

// ---------- 叉子 Fork ----------
export function buildFork() {
  return grp(
    box(0.55, 0.06, 0.13, PAL.brown, -0.42, 0.05, 0),
    box(0.25, 0.05, 0.3, PAL.gray, 0.0, 0.05, 0),
    box(0.3, 0.045, 0.05, PAL.gray, 0.27, 0.05, -0.1125),
    box(0.3, 0.045, 0.05, PAL.gray, 0.27, 0.05, -0.0375),
    box(0.3, 0.045, 0.05, PAL.gray, 0.27, 0.05, 0.0375),
    box(0.3, 0.045, 0.05, PAL.gray, 0.27, 0.05, 0.1125),
    sph(0.025, PAL.dark, -0.35, 0.085, 0),
  );
}

// ---------- 勺子 Spoon ----------
export function buildSpoon() {
  return grp(
    box(0.6, 0.05, 0.11, PAL.brown, -0.38, 0.045, 0),
    sph(0.22, PAL.gray, 0.22, 0.05, 0, { sx: 1.35, sy: 0.35 }),
    sph(0.15, PAL.white, 0.22, 0.1, 0, { sx: 1.3, sy: 0.25, transparent: true, opacity: 0.6 }),
    sph(0.025, PAL.dark, -0.32, 0.075, 0),
  );
}
