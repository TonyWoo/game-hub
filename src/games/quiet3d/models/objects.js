import * as THREE from 'three';
import { mat, PAL, box, sph, cyl, cone, tor, plane, tube, grp } from './helpers.js';

// ================= 卧室 · Bedroom =================

export function buildBed() {
  return grp(
    box(1.6, 0.25, 1.0, PAL.wood, 0, 0.25, 0),      // 床架
    box(1.6, 0.6, 0.14, PAL.wood, 0, 0.65, -0.5),   // 床头板
    box(1.5, 0.22, 0.9, PAL.white, 0, 0.48, 0),     // 床垫
    box(1.4, 0.1, 0.85, PAL.pink, 0, 0.63, 0),      // 粉色床单
    box(0.45, 0.16, 0.6, PAL.white, -0.5, 0.72, 0), // 枕头
    box(0.5, 0.14, 0.62, PAL.cream, 0.45, 0.7, 0),  // 叠起来的被子
    cyl(0.05, 0.05, 0.15, PAL.brown, -0.72, 0.07, -0.42), // 床腿×4
    cyl(0.05, 0.05, 0.15, PAL.brown, 0.72, 0.07, -0.42),
    cyl(0.05, 0.05, 0.15, PAL.brown, -0.72, 0.07, 0.42),
    cyl(0.05, 0.05, 0.15, PAL.brown, 0.72, 0.07, 0.42),
  );
}

export function buildPillow() {
  return grp(
    box(0.9, 0.28, 0.6, PAL.white, 0, 0.14, 0, { rx: 0.12 }), // 枕头主体
    box(0.9, 0.1, 0.62, PAL.cream, 0, 0.22, 0, { rx: 0.12 }), // 顶部缝边
    box(0.12, 0.2, 0.12, PAL.pink, -0.28, 0.2, 0.26),  // 装饰纽扣
    box(0.12, 0.2, 0.12, PAL.pink, 0.28, 0.2, 0.26),
  );
}

export function buildLamp() {
  return grp(
    cyl(0.3, 0.35, 0.12, PAL.navy, 0, 0.06, 0),      // 底座
    cyl(0.05, 0.05, 0.9, PAL.navy, 0, 0.55, 0),      // 灯杆
    cyl(0.28, 0.45, 0.4, PAL.cream, 0, 1.2, 0),      // 梯形灯罩
    sph(0.16, PAL.yellow, 0, 1.12, 0, { emissive: PAL.yellow, ei: 0.9 }), // 暖光小球
    cyl(0.06, 0.06, 0.12, PAL.navy, 0, 1.46, 0),     // 灯罩顶盖
  );
}

export function buildBlanket() {
  return grp(
    box(1.3, 0.12, 1.0, PAL.pink, 0, 0.06, 0),       // 毯子主体
    box(0.2, 0.14, 1.0, PAL.rose, -0.45, 0.06, 0),   // 条纹×3
    box(0.2, 0.14, 1.0, PAL.rose, 0.0, 0.06, 0),
    box(0.2, 0.14, 1.0, PAL.rose, 0.45, 0.06, 0),
    box(1.3, 0.1, 0.12, PAL.cream, 0, 0.08, 0.52),   // 折叠边
    sph(0.09, PAL.cream, -0.55, 0.14, 0.5),          // 绒球×2
    sph(0.09, PAL.cream, 0.55, 0.14, 0.5),
  );
}

export function buildToy() {
  return grp(
    sph(0.32, PAL.orange, 0, 0.42, 0),               // 小熊头
    sph(0.4, PAL.orange, 0, 0.85, 0, { sy: 1.15 }),  // 小熊身体
    sph(0.12, PAL.orange, -0.26, 0.62, 0),           // 耳朵×2
    sph(0.12, PAL.orange, 0.26, 0.62, 0),
    sph(0.09, PAL.black, -0.12, 0.48, 0.28),         // 眼睛×2
    sph(0.09, PAL.black, 0.12, 0.48, 0.28),
    sph(0.07, PAL.brown, 0, 0.4, 0.31),              // 鼻子
    sph(0.14, PAL.cream, 0, 0.38, 0.26),            // 嘴部
    sph(0.13, PAL.orange, -0.45, 0.85, 0),           // 手臂×2
    sph(0.13, PAL.orange, 0.45, 0.85, 0),
  );
}

export function buildRug() {
  return grp(
    cyl(0.9, 0.9, 0.06, PAL.pink, 0, 0.03, 0),       // 外圈
    cyl(0.65, 0.65, 0.07, PAL.cream, 0, 0.035, 0),   // 中圈
    cyl(0.4, 0.4, 0.08, PAL.purple, 0, 0.04, 0),     // 内圈
    cyl(0.16, 0.16, 0.09, PAL.yellow, 0, 0.045, 0),  // 中心花
  );
}

export function buildCurtain() {
  return grp(
    cyl(0.05, 0.05, 2.0, PAL.brown, 0, 1.5, 0, { rz: Math.PI / 2 }), // 窗帘杆
    sph(0.09, PAL.brown, -1.05, 1.5, 0),            // 杆头×2
    sph(0.09, PAL.brown, 1.05, 1.5, 0),
    box(0.28, 1.3, 0.08, PAL.pink, -0.82, 0.8, 0),   // 左帘（褶皱）
    box(0.28, 1.3, 0.08, PAL.pink, -0.55, 0.8, 0),
    box(0.28, 1.3, 0.08, PAL.pink, 0.55, 0.8, 0),    // 右帘（褶皱）
    box(0.28, 1.3, 0.08, PAL.pink, 0.82, 0.8, 0),
  );
}

export function buildMirror() {
  return grp(
    cyl(0.35, 0.4, 0.08, PAL.purple, 0, 0.04, 0),    // 底座
    cyl(0.05, 0.05, 0.5, PAL.purple, 0, 0.3, 0),     // 支杆
    sph(0.55, PAL.purple, 0, 1.05, -0.05),           // 椭圆镜框
    sph(0.46, 0xcfe8ff, 0, 1.05, 0.06, { sy: 1 }),   // 镜面（浅蓝）
  );
}

// ================= 客厅 · Living room =================

export function buildChair() {
  return grp(
    box(0.8, 0.12, 0.8, PAL.wood, 0, 0.55, 0),      // 座面
    box(0.8, 0.9, 0.12, PAL.wood, 0, 1.05, -0.34),  // 靠背
    cyl(0.06, 0.06, 0.55, PAL.brown, -0.32, 0.27, -0.32), // 腿×4
    cyl(0.06, 0.06, 0.55, PAL.brown, 0.32, 0.27, -0.32),
    cyl(0.06, 0.06, 0.55, PAL.brown, -0.32, 0.27, 0.32),
    cyl(0.06, 0.06, 0.55, PAL.brown, 0.32, 0.27, 0.32),
  );
}

export function buildFridge() {
  return grp(
    box(0.9, 1.8, 0.8, PAL.mint, 0, 0.9, 0),         // 箱体
    box(0.9, 0.06, 0.8, PAL.gray, 0, 1.28, 0),       // 中线分隔
    box(0.08, 0.5, 0.08, PAL.gray, -0.3, 1.0, 0.42), // 把手×2
    box(0.08, 0.3, 0.08, PAL.gray, -0.3, 1.5, 0.42),
    box(0.25, 0.25, 0.02, PAL.yellow, 0.15, 1.55, 0.41), // 冰箱贴
    sph(0.05, PAL.rose, 0.15, 1.55, 0.43),
  );
}

export function buildBook() {
  return grp(
    box(0.7, 0.14, 0.95, PAL.rose, 0, 0.07, 0),      // 封底
    box(0.66, 0.2, 0.9, PAL.cream, 0, 0.2, 0),       // 书页
    box(0.7, 0.05, 0.95, PAL.rose, 0, 0.32, 0),      // 封面
    box(0.1, 0.36, 0.95, PAL.red, -0.35, 0.18, 0),   // 书脊
    box(0.4, 0.02, 0.5, PAL.purple, 0.05, 0.35, 0),  // 封面标题框
  );
}

export function buildClock() {
  return grp(
    cyl(0.45, 0.45, 0.12, PAL.navy, 0, 0.85, 0, { rx: Math.PI / 2 }), // 表盘外壳
    cyl(0.38, 0.38, 0.13, PAL.white, 0, 0.85, 0, { rx: Math.PI / 2 }), // 表盘
    box(0.05, 0.3, 0.02, PAL.black, 0, 0.92, 0.07),  // 时针
    box(0.04, 0.42, 0.02, PAL.red, 0.08, 0.95, 0.07, { rz: -0.6 }), // 分针
    sph(0.05, PAL.black, 0, 0.85, 0.07),             // 中心轴
    cyl(0.05, 0.05, 0.4, PAL.navy, -0.3, 0.2, 0),    // 支腿×2
    cyl(0.05, 0.05, 0.4, PAL.navy, 0.3, 0.2, 0),
  );
}

// ================= 厨房 · Kitchen =================

export function buildCart() {
  return grp(
    box(0.9, 0.5, 0.6, PAL.yellow, 0, 0.75, 0),       // 车身（购物篮）
    box(0.9, 0.12, 0.6, PAL.orange, 0, 0.44, 0),     // 篮底
    sph(0.18, PAL.red, -0.32, 0.18, -0.22),          // 轮子×4
    sph(0.18, PAL.red, 0.32, 0.18, -0.22),
    sph(0.18, PAL.red, -0.32, 0.18, 0.22),
    sph(0.18, PAL.red, 0.32, 0.18, 0.22),
    tube([[-0.35, 0.9, 0.32], [-0.35, 1.15, 0.55]], 0.04, PAL.gray), // 推把手
    tube([[0.35, 0.9, 0.32], [0.35, 1.15, 0.55]], 0.04, PAL.gray),
  );
}

export function buildBag() {
  return grp(
    box(0.6, 0.7, 0.3, PAL.cream, 0, 0.35, 0),       // 袋身
    box(0.62, 0.12, 0.32, PAL.orange, 0, 0.62, 0),   // 袋口折边
    tube([[-0.2, 0.66, 0], [-0.2, 1.05, 0], [0.2, 1.05, 0], [0.2, 0.66, 0]], 0.035, PAL.brown), // 提手
    sph(0.14, PAL.red, -0.1, 0.85, 0.05),            // 袋里探出的苹果
    sph(0.12, PAL.green, 0.15, 0.82, -0.03),
    box(0.5, 0.06, 0.26, PAL.red, 0, 0.35, 0),       // 红色条纹
  );
}

// ================= 学校 · School =================

export function buildSchoolbag() {
  return grp(
    box(0.7, 0.85, 0.4, PAL.blue, 0, 0.45, 0),       // 包身
    box(0.72, 0.25, 0.42, PAL.navy, 0, 0.78, 0),     // 顶盖
    box(0.5, 0.4, 0.06, PAL.navy, 0, 0.35, 0.21),    // 前兜
    box(0.12, 0.5, 0.05, PAL.navy, -0.2, 0.45, 0.22), // 背带×2
    box(0.12, 0.5, 0.05, PAL.navy, 0.2, 0.45, 0.22),
    box(0.15, 0.1, 0.05, PAL.yellow, 0, 0.6, 0.22),  // 小锁扣
  );
}

export function buildPencil() {
  return grp(
    cyl(0.06, 0.06, 1.1, PAL.yellow, 0, 0.68, 0),     // 笔杆
    cone(0.06, 0.25, PAL.cream, 0, 1.35, 0),         // 木质笔尖
    cone(0.025, 0.1, PAL.black, 0, 1.5, 0),          // 铅芯
    cyl(0.065, 0.065, 0.12, PAL.rose, 0, 0.1, 0),    // 橡皮
    cyl(0.068, 0.068, 0.05, PAL.gray, 0, 0.19, 0),   // 金属箍
  );
}

export function buildCrayon() {
  return grp(
    cyl(0.08, 0.08, 0.9, PAL.red, 0, 0.45, 0),        // 蜡笔杆
    cone(0.08, 0.28, PAL.red, 0, 1.04, 0),           // 笔尖
    cyl(0.082, 0.082, 0.3, PAL.cream, 0, 0.55, 0),   // 纸套
    box(0.17, 0.12, 0.17, PAL.yellow, 0, 0.55, 0),   // 纸套图案
  );
}

export function buildDesk() {
  return grp(
    box(1.4, 0.1, 0.8, PAL.wood, 0, 0.75, 0),        // 桌面
    box(1.4, 0.35, 0.7, PAL.cream, 0, 0.53, 0),      // 抽屉箱
    box(0.4, 0.06, 0.05, PAL.brown, 0, 0.53, 0.36),  // 抽屉把手
    box(0.08, 0.7, 0.08, PAL.brown, -0.6, 0.35, -0.3), // 桌腿×4
    box(0.08, 0.7, 0.08, PAL.brown, 0.6, 0.35, -0.3),
    box(0.08, 0.7, 0.08, PAL.brown, -0.6, 0.35, 0.3),
    box(0.08, 0.7, 0.08, PAL.brown, 0.6, 0.35, 0.3),
  );
}

export function buildBlackboard() {
  return grp(
    box(1.6, 1.0, 0.08, PAL.dark, 0, 1.15, 0),       // 黑板面
    box(1.7, 0.08, 0.1, PAL.wood, 0, 1.68, 0),       // 木框上
    box(1.7, 0.08, 0.1, PAL.wood, 0, 0.62, 0),       // 木框下
    box(0.08, 1.1, 0.1, PAL.wood, -0.84, 1.15, 0),   // 木框左右
    box(0.08, 1.1, 0.1, PAL.wood, 0.84, 1.15, 0),
    box(0.09, 0.65, 0.09, PAL.brown, -0.7, 0.32, 0), // 腿×2
    box(0.09, 0.65, 0.09, PAL.brown, 0.7, 0.32, 0),
    box(0.9, 0.02, 0.1, PAL.white, 0, 1.4, 0.05),    // 粉笔字线×2
    box(0.5, 0.02, 0.1, PAL.white, -0.2, 1.2, 0.05),
  );
}

export function buildRuler() {
  return grp(
    box(1.4, 0.06, 0.22, PAL.yellow, 0, 0.35, 0, { ry: 0.3 }), // 尺身（斜放）
    box(0.1, 0.065, 0.22, PAL.black, -0.55, 0.35, 0, { ry: 0.3 }), // 刻度线×5
    box(0.1, 0.065, 0.22, PAL.black, -0.3, 0.35, 0, { ry: 0.3 }),
    box(0.1, 0.065, 0.22, PAL.black, -0.05, 0.35, 0, { ry: 0.3 }),
    box(0.1, 0.065, 0.22, PAL.black, 0.2, 0.35, 0, { ry: 0.3 }),
    box(0.1, 0.065, 0.22, PAL.black, 0.45, 0.35, 0, { ry: 0.3 }),
    cyl(0.05, 0.05, 0.35, PAL.brown, 0, 0.17, 0),    // 立起来的小支架
  );
}

export function buildGlobe() {
  return grp(
    cyl(0.35, 0.4, 0.1, PAL.brown, 0, 0.05, 0),      // 底座
    cyl(0.05, 0.05, 0.4, PAL.brown, 0, 0.3, 0),      // 支杆
    tube([[-0.5, 0.75, 0], [0, 1.1, 0], [0.5, 0.75, 0]], 0.035, PAL.yellow), // 经线架
    sph(0.45, PAL.blue, 0, 0.75, 0),                // 海洋
    sph(0.16, PAL.green, -0.15, 0.9, 0.3),           // 陆地×3
    sph(0.13, PAL.green, 0.22, 0.68, 0.28),
    sph(0.12, PAL.green, 0.05, 0.85, -0.35),
    sph(0.1, PAL.white, 0, 1.18, 0),                // 北极帽
  );
}

export function buildEraser() {
  return grp(
    box(0.7, 0.28, 0.35, PAL.pink, 0, 0.14, 0),      // 橡皮主体
    box(0.72, 0.1, 0.37, PAL.blue, 0, 0.3, 0),       // 蓝色纸套
    box(0.2, 0.12, 0.38, PAL.white, 0, 0.3, 0),      // 纸套标签
  );
}

export function buildScissors() {
  return grp(
    tor(0.14, 0.045, PAL.red, -0.18, 0.2, 0),        // 手柄圈×2
    tor(0.14, 0.045, PAL.red, 0.18, 0.2, 0),
    box(0.06, 0.9, 0.04, PAL.gray, -0.08, 0.85, 0, { rz: 0.15 }), // 刀片×2
    box(0.06, 0.9, 0.04, PAL.gray, 0.08, 0.85, 0, { rz: -0.15 }),
    sph(0.05, PAL.black, 0, 0.55, 0),               // 铆钉
  );
}

export function buildNotebook() {
  return grp(
    box(0.7, 0.08, 0.95, PAL.purple, 0, 0.04, 0),    // 封底
    box(0.66, 0.18, 0.9, PAL.white, 0, 0.17, 0),     // 内页
    box(0.7, 0.05, 0.95, PAL.purple, 0, 0.28, 0),    // 封面
    cyl(0.04, 0.04, 0.95, PAL.gray, -0.36, 0.16, 0, { rx: Math.PI / 2 }), // 螺旋圈×4
    cyl(0.04, 0.04, 0.95, PAL.gray, -0.12, 0.16, 0, { rx: Math.PI / 2 }),
    cyl(0.04, 0.04, 0.95, PAL.gray, 0.12, 0.16, 0, { rx: Math.PI / 2 }),
    cyl(0.04, 0.04, 0.95, PAL.gray, 0.36, 0.16, 0, { rx: Math.PI / 2 }),
    box(0.4, 0.02, 0.5, PAL.yellow, 0.05, 0.31, 0),  // 封面贴纸
  );
}

// ================= 派对 · Party =================

export function buildGift() {
  return grp(
    box(0.9, 0.7, 0.9, PAL.rose, 0, 0.35, 0),        // 礼盒
    box(0.94, 0.16, 0.94, PAL.red, 0, 0.78, 0),      // 盒盖
    box(0.2, 0.88, 0.94, PAL.cream, 0, 0.44, 0),     // 丝带纵
    box(0.94, 0.88, 0.2, PAL.cream, 0, 0.44, 0),     // 丝带横
    tor(0.12, 0.045, PAL.cream, -0.12, 0.95, 0, { rx: Math.PI / 2.3 }), // 蝴蝶结×2
    tor(0.12, 0.045, PAL.cream, 0.12, 0.95, 0, { rx: Math.PI / 2.3 }),
    sph(0.07, PAL.cream, 0, 0.93, 0),
  );
}

export function buildBalloon() {
  return grp(
    sph(0.45, PAL.red, 0, 1.15, 0, { sy: 1.25 }),    // 气球
    sph(0.15, PAL.white, -0.18, 1.3, 0.3, { sy: 1.4 }), // 高光
    cone(0.08, 0.1, PAL.red, 0, 0.62, 0),            // 气球嘴
    tube([[0, 0.58, 0], [0.08, 0.35, 0], [-0.08, 0.12, 0]], 0.02, PAL.gray), // 绳子
  );
}

export function buildPartyHat() {
  return grp(
    cone(0.35, 0.8, PAL.purple, 0, 0.4, 0),          // 帽身
    tor(0.35, 0.05, PAL.yellow, 0, 0.03, 0, { rx: Math.PI / 2 }), // 帽檐
    sph(0.09, PAL.yellow, 0, 0.85, 0),              // 顶部绒球
    tor(0.2, 0.035, PAL.pink, 0, 0.42, 0, { rx: Math.PI / 2 }), // 装饰圈×2
    tor(0.28, 0.035, PAL.pink, 0, 0.22, 0, { rx: Math.PI / 2 }),
    sph(0.05, PAL.cream, 0, 0.55, 0.32),            // 圆点×3
    sph(0.05, PAL.cream, -0.2, 0.35, 0.25),
    sph(0.05, PAL.cream, 0.2, 0.3, -0.25),
  );
}

export function buildCandle() {
  return grp(
    cyl(0.25, 0.28, 0.08, PAL.pink, 0, 0.04, 0),     // 烛台
    cyl(0.12, 0.12, 0.7, PAL.white, 0, 0.43, 0),     // 蜡烛
    cyl(0.125, 0.125, 0.2, PAL.pink, 0, 0.7, 0),     // 彩色蜡段
    sph(0.06, PAL.orange, 0, 0.92, 0, { sy: 1.6, emissive: PAL.orange, ei: 1 }), // 火焰
    tube([[0, 0.78, 0], [0.02, 0.85, 0]], 0.015, PAL.black), // 烛芯
  );
}

export function buildConfetti() {
  return grp(
    cone(0.3, 0.7, PAL.purple, 0, 0.35, 0, { ry: Math.PI }), // 礼花筒（倒置）
    cyl(0.3, 0.3, 0.15, PAL.yellow, 0, 0.75, 0),     // 筒口
    box(0.08, 0.02, 0.12, PAL.red, -0.3, 1.1, 0.1, { ry: 0.5, rz: 0.4 }), // 彩纸片×8
    box(0.08, 0.02, 0.12, PAL.blue, 0.25, 1.2, -0.1, { ry: 1.2, rz: -0.3 }),
    box(0.08, 0.02, 0.12, PAL.green, 0.0, 1.3, 0.2, { ry: 0.2, rz: 0.5 }),
    box(0.08, 0.02, 0.12, PAL.yellow, -0.1, 1.05, -0.25, { ry: 2.1, rz: -0.5 }),
    box(0.08, 0.02, 0.12, PAL.pink, 0.35, 1.0, 0.15, { ry: 0.8, rz: 0.2 }),
    box(0.08, 0.02, 0.12, PAL.orange, -0.25, 1.25, -0.05, { ry: 1.7, rz: 0.6 }),
    box(0.08, 0.02, 0.12, PAL.teal, 0.1, 0.95, 0.3, { ry: 0.4, rz: -0.2 }),
    box(0.08, 0.02, 0.12, PAL.cream, 0.0, 1.15, 0.0, { ry: 1.0, rz: 0.3 }),
  );
}

export function buildCamera() {
  return grp(
    box(0.9, 0.6, 0.5, PAL.black, 0, 0.55, 0),       // 机身
    cyl(0.28, 0.28, 0.35, PAL.gray, 0, 0.55, 0.35, { rx: Math.PI / 2 }), // 镜头筒
    cyl(0.2, 0.2, 0.36, PAL.navy, 0, 0.55, 0.35, { rx: Math.PI / 2 }), // 镜片
    box(0.2, 0.15, 0.2, PAL.gray, -0.3, 0.9, 0),     // 取景器
    sph(0.07, PAL.red, 0.3, 0.9, 0.1),               // 快门钮
    sph(0.06, PAL.yellow, -0.15, 0.75, 0.26, { emissive: PAL.yellow, ei: 0.8 }), // 闪光灯
  );
}

export function buildCard() {
  return grp(
    box(0.6, 0.85, 0.04, PAL.cream, -0.31, 0.45, 0),  // 左页
    box(0.6, 0.85, 0.04, PAL.pink, 0.31, 0.45, 0, { ry: -0.35 }), // 右页（打开）
    sph(0.18, PAL.red, 0.25, 0.55, 0.1, { sy: 1.15 }), // 爱心
    sph(0.1, PAL.red, 0.17, 0.62, 0.1),
    sph(0.1, PAL.red, 0.33, 0.62, 0.1),
    box(0.4, 0.06, 0.05, PAL.purple, 0.28, 0.3, 0.12), // 祝福语线
  );
}

// ================= 宠物 · Pets =================

export function buildBone() {
  return grp(
    box(0.7, 0.16, 0.16, PAL.cream, 0, 0.35, 0),      // 骨干
    sph(0.14, PAL.cream, -0.38, 0.42, 0.08),         // 骨头端×4
    sph(0.14, PAL.cream, -0.38, 0.42, -0.08),
    sph(0.14, PAL.cream, 0.38, 0.42, 0.08),
    sph(0.14, PAL.cream, 0.38, 0.42, -0.08),
    sph(0.14, PAL.cream, -0.38, 0.28, 0.08),
    sph(0.14, PAL.cream, -0.38, 0.28, -0.08),
    sph(0.14, PAL.cream, 0.38, 0.28, 0.08),
    sph(0.14, PAL.cream, 0.38, 0.28, -0.08),
  );
}

export function buildBall() {
  return grp(
    sph(0.45, PAL.white, 0, 0.45, 0),                // 球体
    tor(0.45, 0.09, PAL.red, 0, 0.45, 0, { rx: Math.PI / 2 }), // 红色横带
    tor(0.45, 0.09, PAL.blue, 0, 0.45, 0),           // 蓝色竖带
  );
}

export function buildFishTank() {
  const glass = { transparent: true, opacity: 0.3 };
  return grp(
    box(1.2, 0.9, 0.7, 0xbfe3ff, 0, 0.55, 0, glass), // 玻璃缸
    box(1.1, 0.55, 0.6, PAL.blue, 0, 0.45, 0, { transparent: true, opacity: 0.55 }), // 水
    box(1.24, 0.08, 0.74, PAL.brown, 0, 0.04, 0),    // 底座
    box(1.24, 0.08, 0.74, PAL.brown, 0, 1.04, 0),    // 顶盖
    sph(0.14, PAL.orange, -0.2, 0.5, 0.1, { sx: 1.4 }), // 小鱼身体
    cone(0.08, 0.12, PAL.orange, -0.42, 0.5, 0.1, { rz: -Math.PI / 2 }), // 鱼尾
    sph(0.04, PAL.black, -0.08, 0.55, 0.2),          // 鱼眼
    sph(0.06, PAL.white, 0.25, 0.75, 0.1, { transparent: true, opacity: 0.7 }), // 气泡×2
    sph(0.05, PAL.white, 0.35, 0.85, -0.1, { transparent: true, opacity: 0.7 }),
  );
}

export function buildPetHouse() {
  return grp(
    box(1.2, 0.7, 1.0, PAL.wood, 0, 0.35, 0),        // 屋身
    box(1.4, 0.12, 1.2, PAL.red, 0, 0.82, 0, { rx: 0 }), // 屋顶板（斜）
    cone(1.0, 0.5, PAL.red, 0, 1.1, 0, { seg: 4, ry: Math.PI / 4 }), // 三角屋顶
    cyl(0.28, 0.28, 0.45, PAL.dark, 0, 0.3, 0.3, { rx: Math.PI / 2, seg: 16 }), // 圆形门口（镂空感）
    box(0.5, 0.45, 0.05, PAL.wood, 0, 0.28, 0.51),   // 门洞内衬
    box(0.9, 0.06, 0.7, PAL.cream, 0, 0.03, 0),      // 门口小垫
  );
}

export function buildLeash() {
  return grp(
    tor(0.16, 0.04, PAL.red, 0, 1.05, 0, { rx: Math.PI / 2.4 }), // 手柄环
    tube([[0, 0.95, 0], [0.05, 0.6, 0.05], [-0.05, 0.3, 0], [0, 0.1, 0]], 0.03, PAL.red), // 绳
    tor(0.14, 0.05, PAL.gray, 0, 0.16, 0, { rx: Math.PI / 2 }), // 项圈
    box(0.1, 0.12, 0.06, PAL.yellow, 0, 0.16, 0.16), // 吊牌
  );
}

export function buildTowel() {
  return grp(
    box(0.9, 0.1, 0.6, PAL.teal, 0, 0.05, 0),        // 折好的毛巾
    box(0.9, 0.1, 0.6, PAL.mint, 0, 0.15, 0),
    box(0.9, 0.1, 0.6, PAL.teal, 0, 0.25, 0),
    box(0.2, 0.12, 0.6, PAL.white, -0.3, 0.25, 0),   // 白色条纹
    box(0.2, 0.12, 0.6, PAL.white, 0.3, 0.25, 0),
    box(0.5, 0.06, 0.4, PAL.cream, 0, 0.33, 0),      // 顶部折边
  );
}

// ================= 海滩 · Beach =================

export function buildUmbrella() {
  return grp(
    cyl(0.04, 0.04, 1.6, PAL.brown, 0, 0.8, 0),      // 伞杆
    cone(0.9, 0.5, PAL.red, 0, 1.75, 0, { seg: 12 }), // 伞面
    cone(0.9, 0.18, PAL.white, 0, 1.62, 0, { seg: 12 }), // 伞面下摆
    sph(0.07, PAL.yellow, 0, 2.05, 0),               // 伞顶珠
    tor(0.85, 0.04, PAL.cream, 0, 1.55, 0, { rx: Math.PI / 2 }), // 伞边
  );
}

export function buildBeachBall() {
  return grp(
    sph(0.5, PAL.white, 0, 0.5, 0),                 // 球
    sph(0.51, PAL.red, 0, 0.5, 0, { seg: 6 }),      // 色块（低段数套球）
    sph(0.2, PAL.white, 0, 0.98, 0),               // 顶部白盖
    cyl(0.06, 0.06, 0.08, PAL.yellow, 0, 1.05, 0), // 气嘴
  );
}

export function buildBucket() {
  return grp(
    cyl(0.4, 0.3, 0.6, PAL.blue, 0, 0.3, 0),         // 桶身（上大下小）
    tor(0.4, 0.045, PAL.navy, 0, 0.6, 0, { rx: Math.PI / 2 }), // 桶口沿
    tube([[-0.4, 0.58, 0], [0, 0.95, 0], [0.4, 0.58, 0]], 0.03, PAL.yellow), // 提手
    cyl(0.32, 0.32, 0.1, PAL.yellow, 0, 0.55, 0),    // 桶里的沙子
    box(0.15, 0.25, 0.06, PAL.red, 0, 0.35, 0.33),   // 小铲子插着
    box(0.2, 0.08, 0.06, PAL.red, 0, 0.5, 0.33),
  );
}

export function buildSandcastle() {
  return grp(
    cyl(0.45, 0.5, 0.5, PAL.yellow, 0, 0.25, 0),     // 主塔
    cone(0.45, 0.4, PAL.orange, 0, 0.7, 0),          // 主塔顶
    cyl(0.28, 0.32, 0.4, PAL.yellow, -0.55, 0.2, 0.1), // 侧塔×2
    cone(0.28, 0.3, PAL.orange, -0.55, 0.55, 0.1),
    cyl(0.28, 0.32, 0.4, PAL.yellow, 0.55, 0.2, -0.1),
    cone(0.28, 0.3, PAL.orange, 0.55, 0.55, -0.1),
    box(0.25, 0.35, 0.1, PAL.orange, 0, 0.17, 0.45), // 城门
    cyl(0.6, 0.65, 0.08, PAL.yellow, 0, 0.04, 0),    // 底盘
  );
}

export function buildSunglasses() {
  return grp(
    tor(0.22, 0.09, PAL.black, -0.26, 0.55, 0),      // 镜框×2
    tor(0.22, 0.09, PAL.black, 0.26, 0.55, 0),
    sph(0.2, PAL.navy, -0.26, 0.55, 0.02, { transparent: true, opacity: 0.75 }), // 镜片
    sph(0.2, PAL.navy, 0.26, 0.55, 0.02, { transparent: true, opacity: 0.75 }),
    box(0.14, 0.06, 0.08, PAL.black, 0, 0.55, 0),    // 鼻梁
    tube([[-0.48, 0.55, 0], [-0.6, 0.55, -0.25]], 0.035, PAL.black), // 镜腿×2
    tube([[0.48, 0.55, 0], [0.6, 0.55, -0.25]], 0.035, PAL.black),
  );
}

export function buildTelescope() {
  return grp(
    cyl(0.16, 0.2, 0.9, PAL.navy, 0, 0.95, 0, { rz: Math.PI / 2.6 }), // 镜筒（斜指）
    cyl(0.2, 0.2, 0.25, PAL.gray, 0.38, 1.12, 0, { rz: Math.PI / 2.6 }), // 遮光罩
    cyl(0.1, 0.1, 0.15, PAL.black, -0.4, 0.78, 0, { rz: Math.PI / 2.6 }), // 目镜
    cyl(0.05, 0.05, 0.9, PAL.brown, -0.15, 0.45, 0, { rz: 0.25 }), // 三脚架×3
    cyl(0.05, 0.05, 0.9, PAL.brown, 0.15, 0.45, 0, { rz: -0.25 }),
    cyl(0.05, 0.05, 0.9, PAL.brown, 0, 0.45, 0.15, { rx: -0.25 }),
    sph(0.08, PAL.yellow, 0, 0.62, 0),              // 云台
  );
}
