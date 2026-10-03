import * as THREE from 'three';
import { mat, PAL, box, sph, cyl, cone, tor, plane, tube, grp } from './helpers.js';

export function buildTeddyBear() {
  return grp(
    sph(0.14, PAL.brown, -0.2, 0.14, 0),           // 左脚
    sph(0.14, PAL.brown, 0.2, 0.14, 0),            // 右脚
    sph(0.38, PAL.brown, 0, 0.52, 0),              // 身体
    sph(0.12, PAL.brown, -0.42, 0.55, 0),          // 左手臂
    sph(0.12, PAL.brown, 0.42, 0.55, 0),           // 右手臂
    sph(0.3, PAL.brown, 0, 1.08, 0.05),            // 头
    sph(0.11, PAL.brown, -0.2, 1.34, 0),           // 左耳
    sph(0.11, PAL.brown, 0.2, 1.34, 0),            // 右耳
    sph(0.12, PAL.cream, 0, 1.0, 0.32),            // 嘴筒
    sph(0.05, PAL.black, -0.11, 1.15, 0.32),       // 左眼
    sph(0.05, PAL.black, 0.11, 1.15, 0.32),        // 右眼
    sph(0.045, PAL.black, 0, 1.03, 0.43),          // 鼻子
  );
}

export function buildCat() {
  return grp(
    sph(0.42, PAL.orange, 0, 0.42, 0),              // 身体
    sph(0.3, PAL.orange, 0, 0.95, 0.08),            // 头
    cone(0.11, 0.24, PAL.orange, -0.17, 1.24, 0),   // 左耳
    cone(0.11, 0.24, PAL.orange, 0.17, 1.24, 0),    // 右耳
    sph(0.05, PAL.black, -0.11, 1.0, 0.35),         // 左眼
    sph(0.05, PAL.black, 0.11, 1.0, 0.35),          // 右眼
    sph(0.04, PAL.pink, 0, 0.92, 0.37),             // 鼻子
    tube([[0.35, 0.5, -0.3], [0.55, 0.7, -0.45]], 0.06, PAL.orange), // 尾巴
  );
}

export function buildDog() {
  return grp(
    cyl(0.07, 0.07, 0.25, PAL.wood, -0.22, 0.12, 0.1),  // 左前腿
    cyl(0.07, 0.07, 0.25, PAL.wood, 0.22, 0.12, 0.1),   // 右前腿
    cyl(0.07, 0.07, 0.25, PAL.wood, -0.22, 0.12, -0.2), // 左后腿
    cyl(0.07, 0.07, 0.25, PAL.wood, 0.22, 0.12, -0.2),  // 右后腿
    box(0.7, 0.5, 0.45, PAL.wood, 0, 0.45, -0.05),      // 身体
    sph(0.3, PAL.wood, 0, 0.95, 0.35),                  // 头
    box(0.12, 0.3, 0.06, PAL.brown, -0.28, 1.05, 0.35, { rz: 0.3 }),  // 左垂耳
    box(0.12, 0.3, 0.06, PAL.brown, 0.28, 1.05, 0.35, { rz: -0.3 }),  // 右垂耳
    box(0.25, 0.2, 0.25, PAL.cream, 0, 0.88, 0.6),       // 嘴筒
    sph(0.05, PAL.black, -0.11, 1.03, 0.62),            // 左眼
    sph(0.05, PAL.black, 0.11, 1.03, 0.62),             // 右眼
    sph(0.05, PAL.black, 0, 0.92, 0.73),                // 鼻子
    tube([[0, 0.55, -0.28], [0, 0.8, -0.45]], 0.06, PAL.wood),        // 尾巴
  );
}

export function buildRabbit() {
  return grp(
    box(0.2, 0.12, 0.3, PAL.white, -0.12, 0.06, 0.15), // 左前脚
    box(0.2, 0.12, 0.3, PAL.white, 0.12, 0.06, 0.15),  // 右前脚
    sph(0.35, PAL.white, 0, 0.4, 0),                   // 身体
    sph(0.25, PAL.white, 0, 0.85, 0.15),               // 头
    cone(0.08, 0.5, PAL.white, -0.12, 1.35, 0.1),      // 左长耳
    cone(0.08, 0.5, PAL.white, 0.12, 1.35, 0.1),       // 右长耳
    sph(0.05, PAL.black, -0.09, 0.9, 0.38),            // 左眼
    sph(0.05, PAL.black, 0.09, 0.9, 0.38),             // 右眼
    sph(0.04, PAL.pink, 0, 0.82, 0.4),                // 鼻子
    sph(0.1, PAL.white, 0, 0.45, -0.38),               // 绒尾巴
  );
}

export function buildFish() {
  return grp(
    sph(0.35, PAL.blue, 0, 0.55, 0, { sz: 1.6 }),   // 身体（拉长）
    plane(0.35, 0.4, PAL.red, 0, 0.55, -0.72),      // 尾鳍
    plane(0.2, 0.25, PAL.red, 0, 0.95, -0.1),       // 背鳍
    sph(0.05, PAL.black, -0.2, 0.62, 0.38),         // 左眼
    sph(0.05, PAL.black, 0.2, 0.62, 0.38),          // 右眼
    sph(0.05, PAL.pink, 0, 0.48, 0.58),             // 嘴
  );
}

export function buildBird() {
  return grp(
    cyl(0.03, 0.03, 0.15, PAL.orange, -0.1, 0.07, 0), // 左腿
    cyl(0.03, 0.03, 0.15, PAL.orange, 0.1, 0.07, 0),  // 右腿
    sph(0.35, PAL.yellow, 0, 0.45, 0),                // 身体
    sph(0.24, PAL.yellow, 0, 0.85, 0.1),              // 头
    cone(0.08, 0.18, PAL.orange, 0, 0.82, 0.4, { rx: Math.PI / 2 }), // 喙
    sph(0.05, PAL.black, -0.09, 0.92, 0.3),           // 左眼
    sph(0.05, PAL.black, 0.09, 0.92, 0.3),            // 右眼
    plane(0.3, 0.35, PAL.orange, -0.38, 0.45, 0),     // 左翅
    plane(0.3, 0.35, PAL.orange, 0.38, 0.45, 0),      // 右翅
    plane(0.25, 0.2, PAL.orange, 0, 0.4, -0.42),      // 尾羽
  );
}

export function buildCow() {
  return grp(
    cyl(0.08, 0.08, 0.3, PAL.white, -0.25, 0.15, 0.08),  // 腿
    cyl(0.08, 0.08, 0.3, PAL.white, 0.25, 0.15, 0.08),
    cyl(0.08, 0.08, 0.3, PAL.white, -0.25, 0.15, -0.18),
    cyl(0.08, 0.08, 0.3, PAL.white, 0.25, 0.15, -0.18),
    box(0.75, 0.5, 0.45, PAL.white, 0, 0.55, -0.05),      // 身体
    sph(0.1, PAL.gray, -0.15, 0.72, 0.18),               // 花斑
    sph(0.08, PAL.gray, 0.2, 0.7, -0.15),                // 花斑
    box(0.4, 0.35, 0.35, PAL.white, 0, 0.95, 0.35),      // 头
    box(0.3, 0.2, 0.15, PAL.pink, 0, 0.85, 0.58),        // 嘴
    cone(0.06, 0.2, PAL.cream, -0.15, 1.2, 0.35),        // 左角
    cone(0.06, 0.2, PAL.cream, 0.15, 1.2, 0.35),         // 右角
    sph(0.08, PAL.white, -0.28, 1.02, 0.35),             // 左耳
    sph(0.08, PAL.white, 0.28, 1.02, 0.35),              // 右耳
    sph(0.05, PAL.black, -0.11, 1.0, 0.55),              // 左眼
    sph(0.05, PAL.black, 0.11, 1.0, 0.55),               // 右眼
    tube([[0, 0.6, -0.28], [0, 0.35, -0.45]], 0.05, PAL.white), // 尾巴
  );
}

export function buildPig() {
  return grp(
    cyl(0.07, 0.07, 0.25, PAL.pink, -0.2, 0.12, 0.15), // 腿
    cyl(0.07, 0.07, 0.25, PAL.pink, 0.2, 0.12, 0.15),
    cyl(0.07, 0.07, 0.25, PAL.pink, -0.2, 0.12, -0.15),
    cyl(0.07, 0.07, 0.25, PAL.pink, 0.2, 0.12, -0.15),
    sph(0.4, PAL.pink, 0, 0.45, 0, { sz: 1.2 }),       // 身体
    sph(0.3, PAL.pink, 0, 0.85, 0.25),                 // 头
    cyl(0.12, 0.12, 0.15, PAL.rose, 0, 0.8, 0.55, { rx: Math.PI / 2 }), // 鼻子
    cone(0.09, 0.18, PAL.pink, -0.16, 1.12, 0.25),     // 左耳
    cone(0.09, 0.18, PAL.pink, 0.16, 1.12, 0.25),      // 右耳
    sph(0.05, PAL.black, -0.1, 0.92, 0.5),             // 左眼
    sph(0.05, PAL.black, 0.1, 0.92, 0.5),              // 右眼
    tube([[-0.42, 0.5, 0], [-0.55, 0.5, 0.1], [-0.48, 0.5, 0.2]], 0.04, PAL.pink), // 卷尾巴
  );
}

export function buildHorse() {
  return grp(
    cyl(0.07, 0.07, 0.4, PAL.brown, -0.28, 0.2, 0.05), // 腿
    cyl(0.07, 0.07, 0.4, PAL.brown, 0.28, 0.2, 0.05),
    cyl(0.07, 0.07, 0.4, PAL.brown, -0.28, 0.2, -0.25),
    cyl(0.07, 0.07, 0.4, PAL.brown, 0.28, 0.2, -0.25),
    box(0.8, 0.5, 0.45, PAL.brown, 0, 0.65, -0.1),      // 身体
    box(0.25, 0.6, 0.3, PAL.brown, 0, 1.05, 0.3, { rx: -0.2 }), // 脖子
    box(0.12, 0.5, 0.1, PAL.dark, 0, 1.05, 0.16),       // 鬃毛
    box(0.25, 0.3, 0.5, PAL.brown, 0, 1.35, 0.5),       // 头
    cone(0.07, 0.16, PAL.brown, -0.1, 1.6, 0.4),        // 左耳
    cone(0.07, 0.16, PAL.brown, 0.1, 1.6, 0.4),         // 右耳
    sph(0.05, PAL.black, -0.14, 1.4, 0.68),             // 左眼
    sph(0.05, PAL.black, 0.14, 1.4, 0.68),              // 右眼
    tube([[0, 0.8, -0.33], [0, 0.5, -0.5]], 0.06, PAL.dark), // 尾巴
  );
}

export function buildSheep() {
  return grp(
    cyl(0.07, 0.07, 0.3, PAL.dark, -0.2, 0.15, 0.12), // 腿
    cyl(0.07, 0.07, 0.3, PAL.dark, 0.2, 0.15, 0.12),
    cyl(0.07, 0.07, 0.3, PAL.dark, -0.2, 0.15, -0.12),
    cyl(0.07, 0.07, 0.3, PAL.dark, 0.2, 0.15, -0.12),
    sph(0.3, PAL.white, 0, 0.55, 0),                  // 羊毛身体
    sph(0.22, PAL.white, -0.25, 0.62, 0),             // 羊毛
    sph(0.22, PAL.white, 0.25, 0.62, 0),              // 羊毛
    sph(0.22, PAL.white, 0, 0.78, 0),                 // 羊毛顶部
    box(0.25, 0.3, 0.25, PAL.dark, 0, 0.72, 0.45),    // 头
    sph(0.08, PAL.dark, -0.2, 0.78, 0.45),            // 左耳
    sph(0.08, PAL.dark, 0.2, 0.78, 0.45),             // 右耳
    sph(0.045, PAL.white, -0.07, 0.78, 0.58),         // 左眼
    sph(0.045, PAL.white, 0.07, 0.78, 0.58),          // 右眼
  );
}

export function buildChicken() {
  return grp(
    cyl(0.03, 0.03, 0.18, PAL.orange, -0.1, 0.09, 0), // 左腿
    cyl(0.03, 0.03, 0.18, PAL.orange, 0.1, 0.09, 0),  // 右腿
    sph(0.35, PAL.white, 0, 0.45, 0),                 // 身体
    sph(0.22, PAL.white, 0, 0.85, 0.15),              // 头
    sph(0.07, PAL.red, -0.07, 1.08, 0.15),            // 鸡冠
    sph(0.07, PAL.red, 0.07, 1.08, 0.15),
    sph(0.07, PAL.red, 0, 1.14, 0.15),
    cone(0.07, 0.15, PAL.orange, 0, 0.82, 0.42, { rx: Math.PI / 2 }), // 喙
    sph(0.06, PAL.red, 0, 0.7, 0.35),                 // 肉垂
    sph(0.05, PAL.black, -0.08, 0.9, 0.34),           // 左眼
    sph(0.05, PAL.black, 0.08, 0.9, 0.34),            // 右眼
    plane(0.25, 0.3, PAL.orange, 0, 0.5, -0.4),       // 尾羽
  );
}

export function buildDuck() {
  return grp(
    box(0.15, 0.06, 0.25, PAL.orange, -0.12, 0.03, 0.1), // 左蹼
    box(0.15, 0.06, 0.25, PAL.orange, 0.12, 0.03, 0.1),  // 右蹼
    sph(0.38, PAL.yellow, 0, 0.42, 0, { sz: 1.25 }),      // 身体
    sph(0.24, PAL.yellow, 0, 0.85, 0.25),                 // 头
    box(0.18, 0.06, 0.15, PAL.orange, 0, 0.8, 0.52),      // 扁嘴
    sph(0.05, PAL.black, -0.09, 0.92, 0.44),             // 左眼
    sph(0.05, PAL.black, 0.09, 0.92, 0.44),              // 右眼
    plane(0.35, 0.3, PAL.yellow, -0.4, 0.45, 0),          // 左翅
    plane(0.35, 0.3, PAL.yellow, 0.4, 0.45, 0),           // 右翅
    cone(0.1, 0.25, PAL.yellow, 0, 0.5, -0.5, { rx: -Math.PI / 2 }), // 小尾巴
  );
}

export function buildGoat() {
  return grp(
    cyl(0.07, 0.07, 0.3, PAL.white, -0.22, 0.15, 0.08), // 腿
    cyl(0.07, 0.07, 0.3, PAL.white, 0.22, 0.15, 0.08),
    cyl(0.07, 0.07, 0.3, PAL.white, -0.22, 0.15, -0.18),
    cyl(0.07, 0.07, 0.3, PAL.white, 0.22, 0.15, -0.18),
    box(0.7, 0.45, 0.4, PAL.white, 0, 0.55, -0.05),      // 身体
    box(0.3, 0.35, 0.3, PAL.white, 0, 0.95, 0.35),      // 头
    cone(0.05, 0.25, PAL.gray, -0.12, 1.25, 0.35),      // 左角
    cone(0.05, 0.25, PAL.gray, 0.12, 1.25, 0.35),       // 右角
    sph(0.08, PAL.white, -0.22, 1.0, 0.35),             // 左耳
    sph(0.08, PAL.white, 0.22, 1.0, 0.35),             // 右耳
    sph(0.05, PAL.black, -0.09, 1.0, 0.52),            // 左眼
    sph(0.05, PAL.black, 0.09, 1.0, 0.52),             // 右眼
    cone(0.07, 0.18, PAL.gray, 0, 0.72, 0.5, { rx: Math.PI }), // 胡须
    tube([[0, 0.6, -0.26], [0, 0.8, -0.38]], 0.05, PAL.white),  // 尾巴
  );
}

export function buildRooster() {
  return grp(
    cyl(0.03, 0.03, 0.25, PAL.orange, -0.1, 0.12, 0), // 长腿
    cyl(0.03, 0.03, 0.25, PAL.orange, 0.1, 0.12, 0),
    sph(0.35, PAL.orange, 0, 0.5, 0),                 // 身体
    sph(0.22, PAL.orange, 0, 0.9, 0.15),              // 头
    sph(0.09, PAL.red, -0.09, 1.14, 0.15),            // 大鸡冠
    sph(0.09, PAL.red, 0.09, 1.14, 0.15),
    sph(0.09, PAL.red, 0, 1.22, 0.15),
    cone(0.07, 0.15, PAL.yellow, 0, 0.87, 0.42, { rx: Math.PI / 2 }), // 喙
    sph(0.06, PAL.red, 0, 0.75, 0.35),                // 肉垂
    sph(0.05, PAL.black, -0.08, 0.95, 0.34),          // 左眼
    sph(0.05, PAL.black, 0.08, 0.95, 0.34),           // 右眼
    plane(0.2, 0.5, PAL.teal, -0.1, 0.7, -0.4, { rz: 0.4 }),  // 尾羽
    plane(0.2, 0.5, PAL.blue, 0.1, 0.7, -0.4, { rz: -0.4 }),  // 尾羽
  );
}

export function buildHamster() {
  return grp(
    sph(0.4, PAL.orange, 0, 0.42, 0),            // 圆滚身体
    sph(0.3, PAL.orange, 0, 0.75, 0.15),         // 头
    sph(0.1, PAL.cream, -0.15, 0.62, 0.38),      // 左腮帮
    sph(0.1, PAL.cream, 0.15, 0.62, 0.38),       // 右腮帮
    sph(0.08, PAL.orange, -0.18, 1.02, 0.1),     // 左耳
    sph(0.08, PAL.orange, 0.18, 1.02, 0.1),      // 右耳
    sph(0.05, PAL.black, -0.1, 0.85, 0.4),       // 左眼
    sph(0.05, PAL.black, 0.1, 0.85, 0.4),        // 右眼
    sph(0.04, PAL.pink, 0, 0.76, 0.44),          // 鼻子
    sph(0.08, PAL.orange, -0.15, 0.08, 0.25),    // 左小脚
    sph(0.08, PAL.orange, 0.15, 0.08, 0.25),     // 右小脚
  );
}

export function buildTurtle() {
  return grp(
    sph(0.12, PAL.mint, -0.35, 0.12, 0.2),       // 左前腿
    sph(0.12, PAL.mint, 0.35, 0.12, 0.2),        // 右前腿
    sph(0.12, PAL.mint, -0.35, 0.12, -0.2),      // 左后腿
    sph(0.12, PAL.mint, 0.35, 0.12, -0.2),       // 右后腿
    sph(0.45, PAL.green, 0, 0.5, 0, { sy: 0.7 }), // 龟壳
    sph(0.1, PAL.mint, 0, 0.78, 0.1),            // 壳花纹
    sph(0.1, PAL.mint, -0.2, 0.72, -0.15),
    sph(0.1, PAL.mint, 0.2, 0.72, -0.15),
    sph(0.18, PAL.mint, 0, 0.45, 0.5),           // 头
    sph(0.05, PAL.black, -0.07, 0.52, 0.64),     // 左眼
    sph(0.05, PAL.black, 0.07, 0.52, 0.64),      // 右眼
    cone(0.06, 0.15, PAL.mint, 0, 0.3, -0.48, { rx: -Math.PI / 2 }), // 小尾巴
  );
}

export function buildCrab() {
  return grp(
    cyl(0.04, 0.04, 0.25, PAL.red, -0.42, 0.12, 0.1, { rz: 0.5 }),  // 左腿
    cyl(0.04, 0.04, 0.25, PAL.red, 0.42, 0.12, 0.1, { rz: -0.5 }),  // 右腿
    cyl(0.04, 0.04, 0.25, PAL.red, -0.42, 0.12, -0.1, { rz: 0.5 }),
    cyl(0.04, 0.04, 0.25, PAL.red, 0.42, 0.12, -0.1, { rz: -0.5 }),
    box(0.7, 0.3, 0.5, PAL.red, 0, 0.35, 0),        // 身体
    sph(0.18, PAL.red, -0.5, 0.4, 0.25),            // 左大钳
    sph(0.18, PAL.red, 0.5, 0.4, 0.25),             // 右大钳
    tube([[-0.35, 0.35, 0.1], [-0.45, 0.38, 0.2]], 0.05, PAL.red), // 左钳臂
    tube([[0.35, 0.35, 0.1], [0.45, 0.38, 0.2]], 0.05, PAL.red),    // 右钳臂
    cyl(0.03, 0.03, 0.2, PAL.red, -0.12, 0.55, 0.2), // 左眼柄
    cyl(0.03, 0.03, 0.2, PAL.red, 0.12, 0.55, 0.2),  // 右眼柄
    sph(0.05, PAL.black, -0.12, 0.67, 0.2),         // 左眼
    sph(0.05, PAL.black, 0.12, 0.67, 0.2),          // 右眼
  );
}

export function buildSnail() {
  return grp(
    sph(0.25, PAL.cream, 0, 0.25, 0.15, { sz: 1.8 }), // 身体（拉长）
    sph(0.35, PAL.brown, 0, 0.55, -0.15),             // 螺旋壳
    tor(0.15, 0.05, PAL.wood, 0, 0.55, 0.22),         // 壳纹
    cyl(0.03, 0.03, 0.25, PAL.cream, -0.08, 0.55, 0.6), // 左触角
    cyl(0.03, 0.03, 0.25, PAL.cream, 0.08, 0.55, 0.6),  // 右触角
    sph(0.05, PAL.black, -0.08, 0.68, 0.6),           // 左眼
    sph(0.05, PAL.black, 0.08, 0.68, 0.6),            // 右眼
    sph(0.04, PAL.pink, 0, 0.35, 0.62),               // 嘴
  );
}

export function buildLadybug() {
  return grp(
    sph(0.4, PAL.red, 0, 0.42, 0, { sy: 0.75 }), // 圆顶身体
    sph(0.18, PAL.black, 0, 0.4, 0.42),          // 头
    sph(0.07, PAL.black, -0.15, 0.65, 0.15),     // 斑点
    sph(0.07, PAL.black, 0.15, 0.65, 0.15),
    sph(0.07, PAL.black, -0.2, 0.55, -0.1),
    sph(0.07, PAL.black, 0.2, 0.55, -0.1),
    sph(0.07, PAL.black, -0.1, 0.68, -0.25),
    sph(0.07, PAL.black, 0.1, 0.68, -0.25),
    sph(0.05, PAL.white, -0.07, 0.45, 0.56),      // 左眼
    sph(0.05, PAL.white, 0.07, 0.45, 0.56),       // 右眼
    sph(0.03, PAL.black, -0.07, 0.45, 0.6),       // 眼珠
    sph(0.03, PAL.black, 0.07, 0.45, 0.6),
  );
}

export function buildBee() {
  return grp(
    sph(0.3, PAL.yellow, 0, 0.5, 0, { sz: 1.4 }), // 身体
    tor(0.28, 0.05, PAL.black, 0, 0.5, 0.15),     // 条纹
    tor(0.28, 0.05, PAL.black, 0, 0.5, -0.15),    // 条纹
    sph(0.2, PAL.yellow, 0, 0.5, 0.5),            // 头
    sph(0.05, PAL.black, -0.07, 0.56, 0.66),      // 左眼
    sph(0.05, PAL.black, 0.07, 0.56, 0.66),       // 右眼
    plane(0.3, 0.2, PAL.white, -0.2, 0.85, -0.1, { rx: -0.5 }), // 左翅
    plane(0.3, 0.2, PAL.white, 0.2, 0.85, -0.1, { rx: -0.5 }),  // 右翅
    cone(0.06, 0.15, PAL.black, 0, 0.5, -0.5, { rx: -Math.PI / 2 }), // 毒针
    tube([[0, 0.62, 0.55], [-0.05, 0.75, 0.6]], 0.02, PAL.black),  // 左触角
    tube([[0, 0.62, 0.55], [0.05, 0.75, 0.6]], 0.02, PAL.black),   // 右触角
  );
}

export function buildButterfly() {
  return grp(
    cyl(0.06, 0.06, 0.5, PAL.dark, 0, 0.5, 0, { rx: Math.PI / 2 }), // 身体
    sph(0.1, PAL.dark, 0, 0.55, 0.28),           // 头
    sph(0.04, PAL.black, -0.04, 0.58, 0.36),      // 左眼
    sph(0.04, PAL.black, 0.04, 0.58, 0.36),       // 右眼
    tube([[0, 0.62, 0.3], [-0.08, 0.78, 0.35]], 0.02, PAL.dark), // 左触角
    tube([[0, 0.62, 0.3], [0.08, 0.78, 0.35]], 0.02, PAL.dark),  // 右触角
    plane(0.5, 0.6, PAL.pink, -0.32, 0.7, -0.05, { rz: 0.3 }),   // 左上翅
    plane(0.5, 0.6, PAL.pink, 0.32, 0.7, -0.05, { rz: -0.3 }),   // 右上翅
    plane(0.35, 0.4, PAL.purple, -0.25, 0.35, -0.05, { rz: -0.2 }), // 左下翅
    plane(0.35, 0.4, PAL.purple, 0.25, 0.35, -0.05, { rz: 0.2 }),   // 右下翅
  );
}

export function buildAlien() {
  return grp(
    cyl(0.2, 0.25, 0.5, PAL.green, 0, 0.35, 0),  // 身体
    cyl(0.05, 0.05, 0.2, PAL.green, -0.15, 0.15, 0.12), // 左腿
    cyl(0.05, 0.05, 0.2, PAL.green, 0.15, 0.15, 0.12),  // 右腿
    sph(0.05, PAL.green, -0.22, 0.5, 0.1),        // 左手
    sph(0.05, PAL.green, 0.22, 0.5, 0.1),         // 右手
    sph(0.3, PAL.green, 0, 0.95, 0),             // 大头
    sph(0.1, PAL.black, -0.12, 1.0, 0.25, { sx: 0.7, sy: 1.3 }), // 左大眼
    sph(0.1, PAL.black, 0.12, 1.0, 0.25, { sx: 0.7, sy: 1.3 }),  // 右大眼
    cyl(0.02, 0.02, 0.2, PAL.green, -0.1, 1.28, 0), // 左触角
    cyl(0.02, 0.02, 0.2, PAL.green, 0.1, 1.28, 0),  // 右触角
    sph(0.045, PAL.yellow, -0.1, 1.4, 0),         // 触角尖
    sph(0.045, PAL.yellow, 0.1, 1.4, 0),
  );
}
