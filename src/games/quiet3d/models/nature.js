// ============================================================
// nature.js —— 自然 / 太空类 25 个单词的 3D 模型 builder
// 风格：圆润可爱的 low-poly，马卡龙色（PAL）
// 约定：Group 原点在底部中心（y=0 为地面），整体尺寸约 1~2 单位
// ============================================================
import * as THREE from 'three';
import { mat, PAL, box, sph, cyl, cone, tor, plane, tube, grp } from './helpers.js';

// ---------- 自然 ----------

export function buildFlower() {
  const petals = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    petals.push(sph(0.11, PAL.pink, Math.cos(a) * 0.2, 0.78, Math.sin(a) * 0.2));
  }
  return grp(
    cyl(0.04, 0.05, 0.7, PAL.green, 0, 0.35, 0),          // 花茎
    sph(0.09, PAL.green, 0.12, 0.3, 0, { sx: 1.8, sy: 0.5 }), // 叶子
    sph(0.09, PAL.green, -0.12, 0.45, 0, { sx: 1.8, sy: 0.5 }),
    sph(0.12, PAL.yellow, 0, 0.78, 0),                   // 花心
    ...petals,
  );
}

export function buildTree() {
  return grp(
    cyl(0.16, 0.22, 0.9, PAL.brown, 0, 0.45, 0),   // 树干
    sph(0.55, PAL.green, 0, 1.25, 0),              // 树冠
    sph(0.4, PAL.green, 0.35, 1.0, 0.2),
    sph(0.4, PAL.green, -0.35, 1.0, -0.15),
  );
}

export function buildSun() {
  const rays = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    rays.push(cone(0.09, 0.3, PAL.orange, Math.cos(a) * 0.78, 0.85 + Math.sin(a) * 0.78, 0, { rz: a - Math.PI / 2 }));
  }
  return grp(
    sph(0.5, PAL.yellow, 0, 0.85, 0, { emissive: 0xffd93d, ei: 0.35 }), // 太阳
    ...rays,                                                            // 光芒
  );
}

export function buildRainbow() {
  return grp(
    tor(0.72, 0.085, PAL.red, 0, 0, 0, { arc: Math.PI }),
    tor(0.55, 0.085, PAL.orange, 0, 0, 0, { arc: Math.PI }),
    tor(0.38, 0.085, PAL.yellow, 0, 0, 0, { arc: Math.PI }),
    tor(0.21, 0.085, PAL.green, 0, 0, 0, { arc: Math.PI }),
    sph(0.18, PAL.white, -0.72, 0.12, 0),  // 两端云朵
    sph(0.14, PAL.white, -0.55, 0.08, 0.05),
    sph(0.18, PAL.white, 0.72, 0.12, 0),
    sph(0.14, PAL.white, 0.55, 0.08, -0.05),
  );
}

export function buildFence() {
  const pickets = [];
  for (let i = 0; i < 5; i++) {
    const x = -0.6 + i * 0.3;
    pickets.push(box(0.12, 0.75, 0.07, PAL.wood, x, 0.375, 0));
    pickets.push(cone(0.085, 0.14, PAL.wood, x, 0.82, 0, { seg: 4 }));
  }
  return grp(
    ...pickets,
    box(1.5, 0.09, 0.05, PAL.brown, 0, 0.58, 0.045),  // 横栏
    box(1.5, 0.09, 0.05, PAL.brown, 0, 0.28, 0.045),
  );
}

export function buildBarn() {
  return grp(
    box(1.2, 0.85, 1.0, PAL.red, 0, 0.425, 0),                    // 谷仓主体
    box(0.74, 0.07, 1.06, PAL.dark, -0.3, 1.08, 0, { rz: 0.55 }), // 屋顶左
    box(0.74, 0.07, 1.06, PAL.dark, 0.3, 1.08, 0, { rz: -0.55 }), // 屋顶右
    box(0.36, 0.55, 0.05, PAL.white, 0, 0.28, 0.51),             // 大门
    box(0.42, 0.06, 0.06, PAL.red, 0, 0.28, 0.51, { rz: 0.62 }), // 门上交叉
    box(0.42, 0.06, 0.06, PAL.red, 0, 0.28, 0.51, { rz: -0.62 }),
    box(0.22, 0.22, 0.05, PAL.white, 0, 0.72, 0.51),             // 小窗
  );
}

export function buildTractor() {
  const wheel = (r, x) => [
    cyl(r, r, 0.16, PAL.dark, x, r, -0.32, { rx: Math.PI / 2 }),
    cyl(r, r, 0.16, PAL.dark, x, r, 0.32, { rx: Math.PI / 2 }),
    cyl(r * 0.45, r * 0.45, 0.18, PAL.gray, x, r, -0.32, { rx: Math.PI / 2 }),
    cyl(r * 0.45, r * 0.45, 0.18, PAL.gray, x, r, 0.32, { rx: Math.PI / 2 }),
  ];
  return grp(
    ...wheel(0.3, -0.4),   // 后大轮
    ...wheel(0.2, 0.42),   // 前小轮
    box(0.95, 0.32, 0.55, PAL.green, 0, 0.55, 0),      // 车身
    box(0.4, 0.3, 0.5, PAL.green, 0.42, 0.72, 0),      // 车头
    box(0.42, 0.45, 0.5, PAL.cream, -0.18, 0.95, 0),   // 驾驶室
    box(0.3, 0.28, 0.04, PAL.blue, -0.18, 0.98, 0.26), // 车窗
    cyl(0.035, 0.035, 0.4, PAL.dark, 0.45, 1.05, 0.15),// 烟囱
  );
}

export function buildHay() {
  return grp(
    cyl(0.5, 0.58, 0.55, PAL.yellow, 0, 0.275, 0),   // 草垛
    sph(0.5, PAL.yellow, 0, 0.55, 0, { sy: 0.55 }),  // 顶部圆包
    tor(0.53, 0.03, PAL.brown, 0, 0.3, 0, { rx: Math.PI / 2 }), // 捆绳
    sph(0.07, PAL.orange, 0.3, 0.75, 0.2),           // 点缀麦穗球
    sph(0.07, PAL.orange, -0.25, 0.78, -0.15),
  );
}

export function buildPond() {
  return grp(
    cyl(0.65, 0.65, 0.07, PAL.blue, 0, 0.035, 0),       // 水面
    cyl(0.16, 0.16, 0.03, PAL.green, 0.25, 0.08, 0.15), // 荷叶
    cyl(0.12, 0.12, 0.03, PAL.green, -0.22, 0.08, -0.12),
    sph(0.06, PAL.pink, 0.25, 0.13, 0.15),              // 荷花
    sph(0.1, PAL.green, -0.05, 0.1, 0.3, { sy: 0.7 }),  // 小青蛙身
    sph(0.05, PAL.green, -0.12, 0.2, 0.34),            // 蛙头
    sph(0.05, PAL.green, 0.02, 0.2, 0.34),
  );
}

export function buildShell() {
  return grp(
    sph(0.36, PAL.cream, 0, 0.22, 0, { sy: 0.5 }),   // 下壳
    sph(0.33, PAL.pink, 0, 0.4, -0.04, { sy: 0.42, rx: -0.25 }), // 上壳微张
    sph(0.11, PAL.white, 0, 0.3, 0.12, { emissive: 0xffffff, ei: 0.25 }), // 珍珠
  );
}

export function buildStarfish() {
  const arms = [sph(0.2, PAL.orange, 0, 0.12, 0)];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    arms.push(sph(0.15, PAL.orange, Math.cos(a) * 0.3, 0.1, Math.sin(a) * 0.3, { sx: 2.2, ry: -a }));
  }
  return grp(
    ...arms,
    sph(0.05, PAL.yellow, 0, 0.2, 0),  // 中心小点
  );
}

export function buildWave() {
  return grp(
    tor(0.45, 0.16, PAL.blue, 0, 0.42, 0, { arc: Math.PI * 1.25, rz: -0.5 }), // 浪体
    sph(0.12, PAL.white, 0.42, 0.72, 0),   // 浪花
    sph(0.09, PAL.white, 0.52, 0.6, 0.05),
    sph(0.09, PAL.white, 0.3, 0.78, -0.03),
    tor(0.3, 0.08, PAL.teal, -0.35, 0.12, 0, { arc: Math.PI * 0.9, rz: 0.3 }), // 小浪
  );
}

export function buildSailboat() {
  return grp(
    box(1.0, 0.22, 0.45, PAL.wood, 0, 0.11, 0),                 // 船体
    box(0.3, 0.18, 0.4, PAL.brown, 0.55, 0.2, 0, { rz: 0.5 }),   // 船头
    cyl(0.035, 0.035, 1.05, PAL.brown, 0, 0.72, 0),             // 桅杆
    cone(0.32, 0.68, PAL.white, 0.2, 0.85, 0, { sz: 0.12 }),     // 主帆
    cone(0.22, 0.5, PAL.cream, -0.2, 0.75, 0, { sz: 0.12 }),     // 前帆
    plane(0.16, 0.1, PAL.red, 0.1, 1.28, 0),                    // 桅顶小旗
  );
}

export function buildPalmTree() {
  const fronds = [];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    fronds.push(cone(0.14, 0.95, PAL.green, 0.16 + Math.cos(a) * 0.4, 1.15, Math.sin(a) * 0.4,
      { rz: Math.PI / 2 + 0.5, ry: -a, sz: 0.45 }));
  }
  return grp(
    cyl(0.12, 0.18, 1.0, PAL.brown, 0, 0.5, 0, { rz: 0.15 }), // 树干
    ...fronds,                                               // 棕榈叶
    sph(0.09, PAL.brown, 0.24, 0.98, 0.08),  // 椰子
    sph(0.09, PAL.brown, 0.3, 0.95, -0.08),
  );
}

export function buildWateringCan() {
  return grp(
    cyl(0.28, 0.33, 0.5, PAL.teal, 0, 0.25, 0),  // 壶身
    cyl(0.3, 0.3, 0.08, PAL.blue, 0, 0.52, 0),   // 壶口
    tube([[0.28, 0.35, 0], [0.5, 0.52, 0], [0.66, 0.4, 0]], 0.055, PAL.teal), // 壶嘴
    cone(0.09, 0.1, PAL.blue, 0.68, 0.36, 0, { rz: -1.1 }),  // 莲蓬头
    tube([[-0.28, 0.42, 0], [-0.52, 0.55, 0], [-0.5, 0.18, 0]], 0.05, PAL.brown), // 提手
  );
}

// ---------- 太空 ----------

export function buildRocket() {
  const fins = [];
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    fins.push(box(0.06, 0.32, 0.22, PAL.red, Math.cos(a) * 0.24, 0.42, Math.sin(a) * 0.24, { ry: -a }));
  }
  return grp(
    cyl(0.22, 0.22, 0.8, PAL.white, 0, 0.66, 0),   // 机身
    cone(0.22, 0.36, PAL.red, 0, 1.24, 0),         // 头锥
    ...fins,                                       // 尾翼
    sph(0.1, PAL.blue, 0, 0.88, 0.17, { sz: 0.45 }),// 舷窗
    cone(0.13, 0.28, PAL.orange, 0, 0.14, 0, { rx: Math.PI }), // 尾焰
  );
}

export function buildPlanet() {
  return grp(
    sph(0.5, PAL.purple, 0, 0.62, 0),                          // 星球
    sph(0.12, PAL.navy, 0.2, 0.78, 0.4, { sy: 0.4 }),          // 环形山
    sph(0.09, PAL.navy, -0.25, 0.5, 0.35, { sy: 0.4 }),
    sph(0.07, PAL.navy, 0.05, 0.42, -0.45, { sy: 0.4 }),
    sph(0.12, PAL.pink, 0.62, 0.35, 0.2),                      // 小卫星
  );
}

export function buildStar() {
  const spikes = [sph(0.2, PAL.yellow, 0, 0.75, 0, { emissive: 0xffd93d, ei: 0.4 })];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    spikes.push(cone(0.11, 0.34, PAL.yellow, Math.cos(a) * 0.32, 0.75 + Math.sin(a) * 0.32, 0,
      { rz: a - Math.PI / 2, emissive: 0xffd93d, ei: 0.4 }));
  }
  return grp(...spikes);
}

export function buildMoon() {
  return grp(
    tor(0.4, 0.16, PAL.cream, 0, 0.62, 0, { arc: 4.4, rz: 0.94, emissive: 0xfff3d6, ei: 0.25 }), // 月牙
    sph(0.07, PAL.yellow, 0.55, 0.95, 0, { emissive: 0xffd93d, ei: 0.5 }), // 伴星
    sph(0.05, PAL.yellow, -0.5, 0.35, 0, { emissive: 0xffd93d, ei: 0.5 }),
  );
}

export function buildAstronaut() {
  return grp(
    cyl(0.08, 0.09, 0.32, PAL.white, -0.13, 0.16, 0),  // 腿
    cyl(0.08, 0.09, 0.32, PAL.white, 0.13, 0.16, 0),
    sph(0.28, PAL.white, 0, 0.56, 0, { sy: 1.15 }),    // 身体
    box(0.2, 0.16, 0.04, PAL.blue, 0, 0.6, 0.26),      // 胸前仪表
    cyl(0.07, 0.07, 0.38, PAL.white, -0.34, 0.6, 0, { rz: 0.5 }), // 手臂
    cyl(0.07, 0.07, 0.38, PAL.white, 0.34, 0.6, 0, { rz: -0.5 }),
    box(0.22, 0.4, 0.24, PAL.gray, 0, 0.62, -0.3),    // 背包
    sph(0.24, PAL.white, 0, 1.06, 0),                 // 头盔
    sph(0.16, PAL.navy, 0, 1.06, 0.11, { sz: 0.45 }), // 面罩
  );
}

export function buildUfo() {
  const lights = [];
  const lp = [[0.45, 0], [-0.45, 0], [0, 0.45], [0, -0.45]];
  for (const [lx, lz] of lp) {
    lights.push(sph(0.06, PAL.yellow, lx, 0.3, lz, { emissive: 0xffd93d, ei: 0.6 }));
  }
  return grp(
    cyl(0.62, 0.72, 0.18, PAL.gray, 0, 0.34, 0),       // 飞碟盘
    sph(0.34, PAL.teal, 0, 0.48, 0, { sy: 0.7 }),      // 座舱罩
    ...lights,                                         // 舷灯
    cyl(0.05, 0.07, 0.12, PAL.dark, -0.35, 0.06, 0),   // 起落架
    cyl(0.05, 0.07, 0.12, PAL.dark, 0.35, 0.06, 0),
  );
}

export function buildComet() {
  return grp(
    sph(0.22, PAL.orange, 0.35, 0.95, 0, { emissive: 0xffb066, ei: 0.4 }), // 彗头
    cone(0.16, 0.55, PAL.yellow, 0.02, 0.72, 0, { rz: 2.36 }),  // 彗尾
    cone(0.12, 0.45, PAL.cream, -0.22, 0.55, 0, { rz: 2.36 }),
    cone(0.08, 0.35, PAL.white, -0.42, 0.4, 0, { rz: 2.36 }),
    sph(0.05, PAL.yellow, 0.55, 1.1, 0, { emissive: 0xffd93d, ei: 0.5 }), // 火花
  );
}

export function buildSpaceStation() {
  return grp(
    cyl(0.16, 0.16, 0.9, PAL.white, 0, 1.0, 0, { rx: Math.PI / 2 }), // 主舱
    box(0.34, 0.34, 0.34, PAL.gray, 0, 1.0, 0.55),                  // 舱段
    sph(0.15, PAL.teal, 0, 1.22, 0.1),                             // 观察窗
    cyl(0.03, 0.03, 0.5, PAL.gray, -0.55, 1.0, 0, { rz: Math.PI / 2 }), // 支架
    cyl(0.03, 0.03, 0.5, PAL.gray, 0.55, 1.0, 0, { rz: Math.PI / 2 }),
    box(0.55, 0.03, 0.45, PAL.blue, -1.0, 1.0, 0),                  // 太阳能板
    box(0.55, 0.03, 0.45, PAL.blue, 1.0, 1.0, 0),
    cyl(0.015, 0.015, 0.3, PAL.dark, 0.2, 1.28, -0.1),              // 天线
    sph(0.04, PAL.red, 0.2, 1.44, -0.1, { emissive: 0xff6b6b, ei: 0.6 }),
  );
}

export function buildRobot() {
  return grp(
    box(0.14, 0.35, 0.14, PAL.gray, -0.14, 0.175, 0),  // 腿
    box(0.14, 0.35, 0.14, PAL.gray, 0.14, 0.175, 0),
    box(0.5, 0.55, 0.34, PAL.blue, 0, 0.625, 0),      // 身体
    box(0.3, 0.2, 0.03, PAL.cream, 0, 0.6, 0.18),     // 肚皮面板
    cyl(0.06, 0.06, 0.4, PAL.blue, -0.33, 0.65, 0),   // 手臂
    cyl(0.06, 0.06, 0.4, PAL.blue, 0.33, 0.65, 0),
    box(0.42, 0.34, 0.36, PAL.gray, 0, 1.08, 0),     // 头
    sph(0.05, PAL.black, -0.1, 1.1, 0.19),            // 眼睛
    sph(0.05, PAL.black, 0.1, 1.1, 0.19),
    cyl(0.02, 0.02, 0.2, PAL.dark, 0, 1.35, 0),       // 天线
    sph(0.04, PAL.red, 0, 1.47, 0, { emissive: 0xff6b6b, ei: 0.6 }),
  );
}

export function buildSaturn() {
  return grp(
    sph(0.42, PAL.yellow, 0, 0.72, 0),                                  // 星球
    tor(0.62, 0.09, PAL.orange, 0, 0.72, 0, { rx: 0.4, seg: 28 }),        // 光环
    tor(0.48, 0.05, PAL.cream, 0, 0.72, 0, { rx: 0.4, seg: 28 }),         // 内环
    sph(0.08, PAL.navy, 0.15, 0.85, 0.36, { sy: 0.4 }),                  // 斑纹
  );
}
