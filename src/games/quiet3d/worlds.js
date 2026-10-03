// ============================================================
// worlds.js —— 10 个主题的 3D 固定场景（low-poly）
// 每个 buildXxx() 返回 THREE.Group（地面 y=0，可接收阴影）
// 固定装饰避开本主题单词（规则：重复的一律以单词模型为准）
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

// ---------- 1. 卧室 ----------
function buildBedroom() {
  return grp(
    groundDisc(PAL.wood),
    twoWalls(0xffd9e8),
    windowFrame(1.8, 2.4, -4.42),
    box(1.1, 0.8, 0.08, PAL.white, -2.2, 2.5, -4.42), // 小画框
    plane(0.8, 0.55, PAL.pink, -2.2, 2.5, -4.36),
  );
}
// ---------- 2. 厨房 ----------
function buildKitchen() {
  return grp(
    groundDisc(0xf7f0e2),
    twoWalls(0xe8f4ff),
    windowFrame(-1.8, 2.5, -4.42),
    box(3.4, 0.9, 1.1, PAL.cream, 1.6, 0.45, -3.6),   // 空操作台
    box(3.4, 0.1, 1.2, PAL.white, 1.6, 0.95, -3.6),  // 台面
    cyl(0.3, 0.3, 0.25, PAL.gray, 0.7, 1.05, -3.6),  // 水槽
    cyl(0.05, 0.05, 0.5, PAL.gray, 0.7, 1.3, -3.85), // 水龙头
  );
}
// ---------- 3. 超市 ----------
function buildSupermarket() {
  const shelf = (x, z) => grp(
    box(0.12, 2.2, 1.0, PAL.navy, x - 0.9, 1.1, z),
    box(0.12, 2.2, 1.0, PAL.navy, x + 0.9, 1.1, z),
    box(2.0, 0.1, 1.0, PAL.white, x, 0.6, z),
    box(2.0, 0.1, 1.0, PAL.white, x, 1.25, z),
    box(2.0, 0.1, 1.0, PAL.white, x, 1.9, z),
  );
  return grp(
    groundDisc(0xeef1f6),
    twoWalls(0xdceeff),
    shelf(-1.8, -3.2), shelf(1.8, -3.2),
    box(2.6, 0.9, 1.0, PAL.blue, 0.5, 0.45, 1.8),     // 收银台
    box(2.6, 0.12, 1.0, PAL.navy, 0.5, 0.96, 1.8),
  );
}
// ---------- 4. 花园 ----------
function buildGarden() {
  const path = [];
  for (let i = 0; i < 5; i++) path.push(cyl(0.55, 0.55, 0.06, 0xf2e3c2, -1.5 + i * 0.75, 0.03, 1.5 + i * 0.7, { seg: 9 }));
  return grp(groundDisc(PAL.green), hills(), grp(...path));
}
// ---------- 5. 农场 ----------
function buildFarm() {
  return grp(
    groundDisc(0x9ed48a),
    hills(),
    box(1.6, 0.08, 7, 0xd9b382, 1.8, 0.04, 0.5, { ry: 0.25 }), // 土路
  );
}
// ---------- 6. 海滩 ----------
function buildBeach() {
  return grp(
    groundDisc(0xf7e6b0),
    plane(16, 7, 0x5fc8ef, 0, 0.02, -7.5, { rx: -Math.PI / 2 }), // 远景海面
    sph(0.8, PAL.white, -4, 0.4, 2.5), // 沙滩小沙堆装饰
  );
}
// ---------- 7. 学校 ----------
function buildSchool() {
  return grp(
    groundDisc(PAL.wood),
    twoWalls(0xdfe8ff),
    windowFrame(2.0, 2.5, -4.42),
    box(1.6, 1.1, 0.08, PAL.white, -2.0, 2.4, -4.42), // ABC 墙画
    plane(1.3, 0.85, 0xfff7d6, -2.0, 2.4, -4.36),
  );
}
// ---------- 8. 生日派对 ----------
function buildBirthday() {
  const flags = [];
  const cols = [PAL.pink, PAL.yellow, PAL.blue, PAL.green, PAL.purple];
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    flags.push(cone(0.16, 0.3, cols[i % 5], -3.6 + t * 7.2, 3.35 - Math.sin(t * Math.PI) * 0.5, -2.5, { rx: Math.PI }));
  }
  return grp(
    groundDisc(0xffe9f4),
    twoWalls(0xffe0f0),
    cyl(1.1, 1.1, 0.12, PAL.white, 0, 0.75, -1.2, { seg: 24 }), // 空圆桌
    cyl(0.12, 0.18, 0.7, PAL.wood, 0, 0.35, -1.2),
    tube([[-4.4, 3.6, -2.5], [0, 3.1, -2.5], [4.4, 3.6, -2.5]], 0.04, PAL.purple),
    grp(...flags),
  );
}
// ---------- 9. 宠物店 ----------
function buildPetShop() {
  return grp(
    groundDisc(0xf3e7d3),
    twoWalls(0xffe8d2),
    box(3.0, 0.12, 1.0, PAL.wood, -1.2, 1.5, -3.8),   // 空展示架
    box(3.0, 0.12, 1.0, PAL.wood, -1.2, 0.8, -3.8),
    box(0.12, 2.0, 1.0, PAL.brown, -2.6, 1.0, -3.8),
    box(0.12, 2.0, 1.0, PAL.brown, 0.2, 1.0, -3.8),
    box(1.4, 0.7, 0.08, PAL.white, 1.8, 2.8, -4.42),  // PET 挂牌
    windowFrame(-3.0, 2.4, -4.42),
  );
}
// ---------- 10. 太空 ----------
function buildSpace() {
  const rocks = grp(
    sph(0.5, PAL.gray, -7, 2.5, -6), sph(0.35, PAL.gray, 7.5, 3.5, -5),
    sph(0.28, PAL.gray, 5, 1.2, -8),
  );
  return grp(
    groundDisc(0x3d3d5c),
    cyl(5.6, 5.6, 0.1, 0x565678, 0, -0.28, 0, { seg: 40 }), // 平台底圈
    rocks,
  );
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
