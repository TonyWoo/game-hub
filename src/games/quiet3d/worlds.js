// ============================================================
// worlds.js —— 10 个主题的 3D 固定场景（low-poly）
// 每个 buildXxx() 返回 THREE.Group（地面 y=0，可接收阴影）
// 固定装饰避开本主题单词（规则：重复的一律以单词模型为准）
// 约定：
// - group.userData.surfaces: 可放置台面 [{y, x0, x1, z0, z1}]，单词/小朋友可放在这些高度上
// - group.userData.tick: 可选，每帧调用 (dt, t)，用于风车/卫星等小动画
// ============================================================
import * as THREE from 'three';
import { mat, PAL, box, sph, cyl, cone, tor, plane, tube, grp } from './models/helpers.js';

const R = 5; // 地面圆盘半径

function groundDisc(color, y = -0.15) {
  const g = cyl(R, R, 0.3, color, 0, y, 0, { seg: 40 });
  g.receiveShadow = true;
  return g;
}
// 两面墙（房间类主题）：后墙 z=-4.6，左墙 x=-4.6
function twoWalls(color) {
  return grp(
    box(10.4, 4.2, 0.3, color, 0, 2.1, -4.6),
    box(0.3, 4.2, 10.4, color, -4.6, 2.1, 0),
  );
}
function windowFrame(x, y, z, ry = 0) {
  return grp(
    box(1.7, 1.5, 0.12, PAL.white, x, y, z, { ry }),
    plane(1.35, 1.15, 0xbfe8ff, x, y, z + 0.07, { ry }),
    box(0.08, 1.15, 0.14, PAL.white, x, y, z, { ry }),
    box(1.35, 0.08, 0.14, PAL.white, x, y, z, { ry }),
  );
}
// 远山 + 云（户外主题）
function hills() {
  return grp(
    cone(2.2, 2.6, PAL.mint, -6.5, 1.1, -7, { seg: 7 }),
    cone(1.7, 2.0, PAL.green, -3.5, 0.8, -8, { seg: 7 }),
    cone(2.5, 3.0, PAL.teal, 5.5, 1.3, -7.5, { seg: 7 }),
    grp(
      sph(0.5, PAL.white, -3, 5.5, -6), sph(0.7, PAL.white, -2.2, 5.7, -6),
      sph(0.5, PAL.white, 3.5, 6, -7), sph(0.65, PAL.white, 4.3, 6.2, -7),
    ),
  );
}
// 半透明材质快捷
const glass = (color, opacity) => mat(color, { transparent: true, opacity });

// ---------- 1. 卧室 ----------
// 单词：bed, pillow, lamp, teddy bear, book, clock, blanket, toy, rug, curtain, mirror, chair
function buildBedroom() {
  // 衣柜（双开门+把手）
  const wardrobe = grp(
    box(1.7, 2.4, 0.75, 0xb07a4f, -3.3, 1.2, -3.85),
    box(1.86, 0.14, 0.88, 0x8f5f3a, -3.3, 2.47, -3.85),
    box(0.76, 2.05, 0.07, 0xd9a066, -3.72, 1.15, -3.44),
    box(0.76, 2.05, 0.07, 0xd9a066, -2.88, 1.15, -3.44),
    sph(0.06, 0x6e4a2f, -3.44, 1.15, -3.38),
    sph(0.06, 0x6e4a2f, -3.16, 1.15, -3.38),
  );
  // 床头柜（无台灯）
  const nightstand = grp(
    box(0.75, 0.7, 0.7, PAL.wood, 2.9, 0.35, -3.85),
    box(0.6, 0.22, 0.06, 0xa9744f, 2.9, 0.5, -3.48),
    sph(0.05, 0x6e4a2f, 2.9, 0.5, -3.43),
  );
  // 墙面小搁板（空）
  const shelf = grp(
    box(1.5, 0.08, 0.4, 0xd9a066, 0.4, 2.3, -4.32),
    box(0.08, 0.24, 0.3, 0xa9744f, -0.2, 2.14, -4.32),
    box(0.08, 0.24, 0.3, 0xa9744f, 1.0, 2.14, -4.32),
  );
  const g = grp(
    groundDisc(PAL.wood),
    twoWalls(0xffd9e8),
    windowFrame(1.8, 2.4, -4.42),
    box(1.1, 0.8, 0.08, PAL.white, -2.2, 2.5, -4.42), // 小画框
    plane(0.8, 0.55, PAL.pink, -2.2, 2.5, -4.36),
    wardrobe, nightstand, shelf,
  );
  return g;
}

// ---------- 2. 厨房 ----------
// 单词：pot, pan, egg, milk, bread, fridge, cup, spoon, apple, knife, fork, plate
function buildKitchen() {
  // 灶台：灶体 + 黑色灶面 + 四眼灶 + 前面旋钮
  const stove = grp(
    box(1.7, 0.86, 1.15, PAL.cream, -1.7, 0.43, -3.55),
    box(1.7, 0.07, 1.15, PAL.dark, -1.7, 0.895, -3.55),
    cyl(0.17, 0.17, 0.035, PAL.black, -2.12, 0.945, -3.82),
    cyl(0.17, 0.17, 0.035, PAL.black, -1.28, 0.945, -3.82),
    cyl(0.17, 0.17, 0.035, PAL.black, -2.12, 0.945, -3.28),
    cyl(0.17, 0.17, 0.035, PAL.black, -1.28, 0.945, -3.28),
    sph(0.055, PAL.red, -2.25, 0.5, -2.96),
    sph(0.055, PAL.red, -1.9, 0.5, -2.96),
    sph(0.055, PAL.red, -1.5, 0.5, -2.96),
    sph(0.055, PAL.red, -1.15, 0.5, -2.96),
  );
  // 抽油烟机：墙面倒梯形罩体 + 烟囱
  const hood = grp(
    cyl(0.42, 1.0, 0.85, 0xdde6f0, -1.7, 2.72, -3.55, { seg: 4, ry: Math.PI / 4 }),
    box(0.34, 1.05, 0.34, 0xc4cfdd, -1.7, 3.6, -3.55),
  );
  const g = grp(
    groundDisc(0xf7f0e2),
    twoWalls(0xe8f4ff),
    windowFrame(-1.8, 2.5, -4.42),
    box(3.4, 0.9, 1.1, PAL.cream, 1.6, 0.45, -3.6),   // 空操作台
    box(3.4, 0.1, 1.2, PAL.white, 1.6, 0.95, -3.6),  // 台面
    cyl(0.3, 0.3, 0.25, PAL.gray, 0.7, 1.05, -3.6),  // 水槽
    cyl(0.05, 0.05, 0.5, PAL.gray, 0.7, 1.3, -3.85), // 水龙头
    stove, hood,
  );
  g.userData.surfaces = [
    { y: 0.93, x0: -2.55, x1: -0.85, z0: -4.12, z1: -2.98 }, // 灶台面
    { y: 1.0, x0: -0.1, x1: 3.3, z0: -4.2, z1: -3.0 },       // 操作台面
  ];
  return g;
}

// ---------- 3. 超市 ----------
// 单词：cart, banana, cookie, juice, fish, cake, candy, bag, watermelon, milk, donut, grapes
function buildSupermarket() {
  const shelf = (x, z) => grp(
    box(0.12, 2.2, 1.0, PAL.navy, x - 0.9, 1.1, z),
    box(0.12, 2.2, 1.0, PAL.navy, x + 0.9, 1.1, z),
    box(2.0, 0.1, 1.0, PAL.white, x, 0.6, z),
    box(2.0, 0.1, 1.0, PAL.white, x, 1.25, z),
    box(2.0, 0.1, 1.0, PAL.white, x, 1.9, z),
  );
  // 墙面大招牌：黄底板 + 彩色圆点 + 星星
  const sign = grp(
    box(3.4, 1.0, 0.12, PAL.yellow, 0, 3.35, -4.42),
    cyl(0.16, 0.16, 0.07, PAL.red, -1.25, 3.35, -4.33, { rx: Math.PI / 2 }),
    cyl(0.16, 0.16, 0.07, PAL.blue, -0.62, 3.35, -4.33, { rx: Math.PI / 2 }),
    cyl(0.16, 0.16, 0.07, PAL.green, 0.02, 3.35, -4.33, { rx: Math.PI / 2 }),
    cyl(0.16, 0.16, 0.07, PAL.purple, 0.64, 3.35, -4.33, { rx: Math.PI / 2 }),
    cone(0.22, 0.12, PAL.red, 1.25, 3.35, -4.32, { seg: 5, rx: Math.PI / 2 }),
  );
  // 入口地垫
  const doormat = grp(
    plane(2.4, 1.3, PAL.red, 0.5, 0.015, 3.1, { rx: -Math.PI / 2 }),
    plane(2.0, 0.92, PAL.white, 0.5, 0.022, 3.1, { rx: -Math.PI / 2 }),
  );
  const g = grp(
    groundDisc(0xeef1f6),
    twoWalls(0xdceeff),
    shelf(-1.8, -3.2), shelf(1.8, -3.2),
    box(2.6, 0.9, 1.0, PAL.blue, 0.5, 0.45, 1.8),     // 收银台
    box(2.6, 0.12, 1.0, PAL.navy, 0.5, 0.96, 1.8),
    sign, doormat,
  );
  const shelfSurf = [];
  for (const sx of [-1.8, 1.8]) {
    for (const sy of [0.65, 1.3, 1.95]) {
      shelfSurf.push({ y: sy, x0: sx - 1.0, x1: sx + 1.0, z0: -3.7, z1: -2.7 });
    }
  }
  g.userData.surfaces = [
    ...shelfSurf,
    { y: 1.02, x0: -0.8, x1: 1.8, z0: 1.3, z1: 2.3 }, // 收银台面
  ];
  return g;
}

// ---------- 4. 花园 ----------
// 单词：flower, tree, butterfly, bee, bird, sun, watering can, mushroom, rainbow, snail, ladybug, fence
function buildGarden() {
  const path = [];
  for (let i = 0; i < 5; i++) path.push(cyl(0.55, 0.55, 0.06, 0xf2e3c2, -1.5 + i * 0.75, 0.03, 1.5 + i * 0.7, { seg: 9 }));
  // 小喷泉：圆形水池 + 半透明水 + 水柱
  const fountain = grp(
    cyl(1.05, 1.2, 0.45, 0xcfd8e3, 2.6, 0.22, -1.6, { seg: 20 }),
    cyl(0.92, 0.92, 0.12, 0, 2.6, 0.42, -1.6, { seg: 20, mat: glass(0x7fd4ff, 0.55) }),
    cyl(0.14, 0.2, 0.85, 0xbfc9d6, 2.6, 0.75, -1.6),
    cyl(0.5, 0.32, 0.16, 0xcfd8e3, 2.6, 1.2, -1.6, { seg: 16 }),
    cyl(0.035, 0.035, 0.75, 0, 2.6, 1.6, -1.6, { mat: glass(0x9fdcff, 0.6) }),
    cyl(0.03, 0.03, 0.55, 0, 2.36, 1.42, -1.6, { mat: glass(0x9fdcff, 0.6) }),
    cyl(0.03, 0.03, 0.55, 0, 2.84, 1.42, -1.6, { mat: glass(0x9fdcff, 0.6) }),
  );
  return grp(
    groundDisc(PAL.green),
    hills(),
    grp(...path),
    fountain,
    sph(0.32, 0xaab3c0, -2.6, 0.16, 0.8, { sy: 0.55 }),  // 石头
    sph(0.24, 0xb9c2cf, -2.05, 0.12, 1.35, { sy: 0.55 }),
    sph(0.28, 0xaab3c0, 1.2, 0.14, 2.6, { sy: 0.55 }),
    sph(0.5, PAL.green, -3.4, 0.4, -2.2),               // 灌木丛
    sph(0.42, 0x6cc47f, -2.7, 0.34, -2.6),
    sph(0.46, PAL.green, 3.8, 0.38, 0.6),
  );
}

// ---------- 5. 农场 ----------
// 单词：cow, pig, horse, sheep, chicken, barn, tractor, hay, duck, goat, rooster, pond
function buildFarm() {
  // 风车：塔身 + 四叶转扇（缓慢转动）
  const blades = grp(
    box(0.28, 1.5, 0.07, PAL.white, 0, 0.78, 0),
    box(0.28, 1.5, 0.07, PAL.white, 0, -0.78, 0),
    box(1.5, 0.28, 0.07, PAL.white, 0.78, 0, 0),
    box(1.5, 0.28, 0.07, PAL.white, -0.78, 0, 0),
  );
  blades.position.set(-3.2, 3.5, -2.55);
  const windmill = grp(
    cyl(0.28, 0.55, 3.1, 0xb08954, -3.2, 1.55, -2.9),
    sph(0.18, PAL.red, -3.2, 3.5, -2.6),
    blades,
  );
  const g = grp(
    groundDisc(0x9ed48a),
    hills(),
    box(1.6, 0.08, 7, 0xd9b382, 1.8, 0.04, 0.5, { ry: 0.25 }), // 土路
    windmill,
    cone(1.8, 1.6, 0x8fd694, 6.5, 0.7, -6.5, { seg: 8 }),     // 远处小山丘
    cone(1.3, 1.2, 0x7ed491, 8.2, 0.5, -5.5, { seg: 8 }),
  );
  g.userData.tick = (dt) => { blades.rotation.z += dt * 0.9; };
  return g;
}

// ---------- 6. 海滩 ----------
// 单词：sandcastle, crab, shell, starfish, beach ball, umbrella, towel, wave, sailboat, palm tree, sunglasses, bucket
function buildBeach() {
  // 远处小岛
  const island = grp(
    cyl(1.6, 1.9, 0.5, 0xf2dfa8, 6.2, 0.1, -8.2, { seg: 18 }),
    sph(0.7, PAL.green, 6.2, 0.6, -8.2, { sy: 0.7 }),
  );
  // 灯塔（远处小体量，红白条纹）
  const lighthouse = grp(
    cyl(0.45, 0.62, 2.4, PAL.red, -6.4, 1.2, -6.2, { seg: 14 }),
    cyl(0.52, 0.52, 0.35, PAL.white, -6.4, 0.85, -6.2, { seg: 14 }),
    cyl(0.5, 0.5, 0.35, PAL.white, -6.4, 1.85, -6.2, { seg: 14 }),
    cyl(0.36, 0.36, 0.42, PAL.dark, -6.4, 2.6, -6.2, { seg: 12 }),
    sph(0.2, 0, -6.4, 2.6, -6.2, { mat: mat(0xffe27a, { emissive: 0xffc93d, ei: 0.9 }) }),
    cone(0.5, 0.5, PAL.dark, -6.4, 3.05, -6.2, { seg: 12 }),
  );
  return grp(
    groundDisc(0xf7e6b0),
    plane(16, 7, 0x5fc8ef, 0, 0.02, -7.5, { rx: -Math.PI / 2 }), // 远景海面
    sph(0.8, PAL.white, -4, 0.4, 2.5), // 沙滩小沙堆装饰
    island, lighthouse,
  );
}

// ---------- 7. 学校 ----------
// 单词：schoolbag, pencil, crayon, desk, blackboard, ruler, clock, globe, book, eraser, scissors, notebook
function buildSchool() {
  // 绿植盆栽
  const plant = grp(
    cyl(0.36, 0.28, 0.42, 0xc47b4a, 3.6, 0.21, -3.4),
    sph(0.42, PAL.green, 3.6, 0.75, -3.4),
    sph(0.32, 0x6cc47f, 3.35, 0.95, -3.3),
    sph(0.3, PAL.green, 3.85, 0.9, -3.5),
  );
  // 墙面课程表框（空白格）
  const schedule = grp(
    box(1.3, 0.95, 0.07, PAL.white, 0.2, 2.55, -4.42),
    box(1.1, 0.035, 0.02, 0xb9c2cf, 0.2, 2.55, -4.375),
    box(0.035, 0.78, 0.02, 0xb9c2cf, -0.05, 2.55, -4.375),
    box(0.035, 0.78, 0.02, 0xb9c2cf, 0.45, 2.55, -4.375),
  );
  return grp(
    groundDisc(PAL.wood),
    twoWalls(0xdfe8ff),
    windowFrame(2.0, 2.5, -4.42),
    box(1.6, 1.1, 0.08, PAL.white, -2.0, 2.4, -4.42), // ABC 墙画
    plane(1.3, 0.85, 0xfff7d6, -2.0, 2.4, -4.36),
    plant, schedule,
    cyl(1.35, 1.35, 0.05, 0x9fc5ff, 1.4, 0.025, 1.2, { seg: 28 }), // 圆形阅读地毯
    cyl(1.0, 1.0, 0.056, 0xc3d9ff, 1.4, 0.028, 1.2, { seg: 28 }),
  );
}

// ---------- 8. 生日派对 ----------
// 单词：cake, candle, balloon, gift, party hat, ice cream, candy, juice, confetti, cupcake, camera, card
function partyChair(x, z, dirx, dirz, color) {
  // dirx/dirz: 椅背相对座位的方向（背对桌子）
  return grp(
    box(0.55, 0.09, 0.55, color, x, 0.45, z),
    box(0.55, 0.65, 0.09, color, x + dirx * 0.26, 0.78, z + dirz * 0.26),
    cyl(0.045, 0.045, 0.45, 0x8a6a4a, x - 0.2, 0.22, z - 0.2),
    cyl(0.045, 0.045, 0.45, 0x8a6a4a, x + 0.2, 0.22, z - 0.2),
    cyl(0.045, 0.045, 0.45, 0x8a6a4a, x - 0.2, 0.22, z + 0.2),
    cyl(0.045, 0.045, 0.45, 0x8a6a4a, x + 0.2, 0.22, z + 0.2),
  );
}
function buildBirthday() {
  const flags = [];
  const cols = [PAL.pink, PAL.yellow, PAL.blue, PAL.green, PAL.purple];
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    flags.push(cone(0.16, 0.3, cols[i % 5], -3.6 + t * 7.2, 3.35 - Math.sin(t * Math.PI) * 0.5, -2.5, { rx: Math.PI }));
  }
  // 彩带立柱 ×2
  const poles = grp(
    cyl(0.06, 0.06, 2.6, PAL.purple, -3.6, 1.3, -3.0),
    cyl(0.06, 0.06, 2.6, PAL.purple, 3.6, 1.3, -3.0),
    tube([[-3.6, 2.6, -3.0], [0, 2.28, -3.0], [3.6, 2.6, -3.0]], 0.035, PAL.pink),
  );
  // 地板星星贴纸（扁平五边形）
  const stars = grp(
    cyl(0.16, 0.16, 0.025, PAL.yellow, -2.2, 0.015, 1.6, { seg: 5 }),
    cyl(0.16, 0.16, 0.025, PAL.pink, 2.4, 0.015, 1.8, { seg: 5 }),
    cyl(0.16, 0.16, 0.025, PAL.blue, 1.8, 0.015, -3.4, { seg: 5 }),
    cyl(0.16, 0.16, 0.025, PAL.purple, -2.6, 0.015, -3.2, { seg: 5 }),
  );
  const g = grp(
    groundDisc(0xffe9f4),
    twoWalls(0xffe0f0),
    cyl(1.1, 1.1, 0.12, PAL.white, 0, 0.75, -1.2, { seg: 24 }), // 空圆桌
    cyl(0.12, 0.18, 0.7, PAL.wood, 0, 0.35, -1.2),
    tube([[-4.4, 3.6, -2.5], [0, 3.1, -2.5], [4.4, 3.6, -2.5]], 0.04, PAL.purple),
    grp(...flags),
    partyChair(1.9, -1.2, 1, 0, PAL.pink),
    partyChair(-1.9, -1.2, -1, 0, PAL.blue),
    partyChair(0, 0.7, 0, 1, PAL.yellow),
    poles, stars,
  );
  g.userData.surfaces = [
    { y: 0.81, x0: -1.1, x1: 1.1, z0: -2.3, z1: -0.1 }, // 圆桌面
  ];
  return g;
}

// ---------- 9. 宠物店 ----------
// 单词：cat, dog, rabbit, fish, bird, bone, ball, fish tank, pet house, hamster, turtle, leash
function pawPrint(x, y) {
  return grp(
    sph(0.09, PAL.pink, x, y, -4.36, { sz: 0.4 }),
    sph(0.045, PAL.pink, x - 0.1, y + 0.12, -4.36, { sz: 0.4 }),
    sph(0.045, PAL.pink, x, y + 0.15, -4.36, { sz: 0.4 }),
    sph(0.045, PAL.pink, x + 0.1, y + 0.12, -4.36, { sz: 0.4 }),
  );
}
function buildPetShop() {
  // 大玻璃橱窗（空）
  const showcase = grp(
    box(2.3, 1.7, 0.12, PAL.navy, 2.7, 1.7, -4.42),
    plane(2.0, 1.4, 0, 2.7, 1.7, -4.34, { mat: glass(0xbfe8ff, 0.35) }),
  );
  // 收银小柜台
  const counter = grp(
    box(1.5, 0.9, 0.75, PAL.wood, 3.1, 0.45, 1.6),
    box(1.6, 0.09, 0.85, PAL.white, 3.1, 0.945, 1.6),
  );
  const g = grp(
    groundDisc(0xf3e7d3),
    twoWalls(0xffe8d2),
    box(3.0, 0.12, 1.0, PAL.wood, -1.2, 1.5, -3.8),   // 空展示架
    box(3.0, 0.12, 1.0, PAL.wood, -1.2, 0.8, -3.8),
    box(0.12, 2.0, 1.0, PAL.brown, -2.6, 1.0, -3.8),
    box(0.12, 2.0, 1.0, PAL.brown, 0.2, 1.0, -3.8),
    box(1.4, 0.7, 0.08, PAL.white, 1.8, 2.8, -4.42),  // PET 挂牌
    windowFrame(-3.0, 2.4, -4.42),
    showcase, counter,
    pawPrint(-3.6, 1.4), pawPrint(-3.15, 2.0), pawPrint(0.6, 1.2),
  );
  g.userData.surfaces = [
    { y: 0.86, x0: -2.7, x1: 0.3, z0: -4.3, z1: -3.3 }, // 展示架下层
    { y: 1.56, x0: -2.7, x1: 0.3, z0: -4.3, z1: -3.3 }, // 展示架上层
    { y: 0.99, x0: 2.35, x1: 3.85, z0: 1.18, z1: 2.02 }, // 收银台面
  ];
  return g;
}

// ---------- 10. 太空 ----------
// 单词：rocket, planet, star, moon, astronaut, alien, telescope, saturn, ufo, comet, space station, robot
function buildSpace() {
  const rocks = grp(
    sph(0.5, PAL.gray, -7, 2.5, -6), sph(0.35, PAL.gray, 7.5, 3.5, -5),
    sph(0.28, PAL.gray, 5, 1.2, -8),
  );
  // 小卫星（机身 + 两片太阳能板，缓慢自转；远小于单词模型）
  const sat = grp(
    box(0.55, 0.55, 0.55, 0xb9c2cf, 0, 0, 0),
    box(1.15, 0.06, 0.65, 0x4a6fd4, -0.85, 0, 0),
    box(1.15, 0.06, 0.65, 0x4a6fd4, 0.85, 0, 0),
    cyl(0.02, 0.02, 0.7, 0x8a93a8, 0, 0.6, 0),
    sph(0.06, PAL.red, 0, 0.98, 0),
  );
  sat.position.set(4.6, 3.6, -4.5);
  const g = grp(
    groundDisc(0x3d3d5c),
    cyl(5.6, 5.6, 0.1, 0x565678, 0, -0.28, 0, { seg: 40 }), // 平台底圈
    rocks,
    sat,
    sph(0.55, 0x9a8f7d, -6.2, 4.2, -9.5, { seg: 10 }),  // 远处无环小行星
    sph(0.38, 0x8a7f6e, 7.2, 2.6, -10.5, { seg: 10 }),
  );
  g.userData.tick = (dt) => { sat.rotation.y += dt * 0.5; };
  return g;
}

// ---------- 主题配置 ----------
export const WORLDS = {
  bedroom:    { build: buildBedroom,    sky: 0xfff2f6, particle: null },
  kitchen:    { build: buildKitchen,    sky: 0xfff9ef, particle: null },
  supermarket:{ build: buildSupermarket,sky: 0xf2f8ff, particle: null },
  garden:     { build: buildGarden,     sky: 0xbfe8ff, particle: 'petals' },
  farm:       { build: buildFarm,       sky: 0xcdeeff, particle: 'firefly' },
  beach:      { build: buildBeach,      sky: 0xcdeeff, particle: 'sparkle' },
  school:     { build: buildSchool,     sky: 0xf2f5ff, particle: null },
  birthday:   { build: buildBirthday,   sky: 0xfff0f8, particle: 'confetti' },
  petshop:    { build: buildPetShop,    sky: 0xfff4ea, particle: null },
  space:      { build: buildSpace,      sky: 0x0b0b22, particle: 'stars' },
};

// ---------- 主题粒子（Points，少量） ----------
export function makeParticles(type) {
  if (!type) return null;
  const conf = {
    petals:   { n: 60, color: 0xffb3d1, size: 0.12, area: 9, vy: -0.5 },
    confetti: { n: 80, color: 0xffffff, size: 0.1, area: 9, vy: -0.9, multi: true },
    sparkle:  { n: 50, color: 0xfff6b0, size: 0.09, area: 9, vy: 0.35 },
    firefly:  { n: 40, color: 0xd6ff9e, size: 0.09, area: 9, vy: 0.25 },
    stars:    { n: 220, color: 0xffffff, size: 0.14, area: 26, vy: 0 },
  }[type];
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(conf.n * 3);
  const col = new Float32Array(conf.n * 3);
  const c = new THREE.Color();
  for (let i = 0; i < conf.n; i++) {
    pos[i * 3] = (Math.random() - 0.5) * conf.area * 2;
    pos[i * 3 + 1] = Math.random() * 8;
    pos[i * 3 + 2] = (Math.random() - 0.5) * conf.area * 2;
    if (conf.multi) c.setHSL(Math.random(), 0.85, 0.65);
    else c.set(conf.color);
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const m = new THREE.PointsMaterial({
    size: conf.size, vertexColors: true, transparent: true, opacity: 0.9,
    depthWrite: false, sizeAttenuation: true,
  });
  const pts = new THREE.Points(geo, m);
  pts.userData.update = (dt, t) => {
    const p = geo.attributes.position.array;
    for (let i = 0; i < conf.n; i++) {
      p[i * 3 + 1] += conf.vy * dt;
      p[i * 3] += Math.sin(t * 0.8 + i) * dt * 0.3; // 轻微摇摆
      if (conf.vy < 0 && p[i * 3 + 1] < 0) p[i * 3 + 1] = 8;
      if (conf.vy > 0 && p[i * 3 + 1] > 8) p[i * 3 + 1] = 0;
    }
    geo.attributes.position.needsUpdate = true;
    if (type === 'stars') pts.rotation.y += dt * 0.01;
  };
  return pts;
}
