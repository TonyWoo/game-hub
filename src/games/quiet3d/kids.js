// ============================================================
// kids.js —— 3D 小朋友 NPC（纯装饰，不进单词表）
// buildKid({ skin, hairStyle, hairColor, shirt, bottom, girl })
// 约定：返回 THREE.Group，原点底部中心；userData.isKid=true，
// userData.armL/armR 为胳膊关节组（挥手用），phase 随机相位，
// wave>0 时正在挥手（秒），baseRotY 初始朝向。
// KID_SPOTS：各主题小朋友站位 { x, z, ...kidOpts }
// ============================================================
import { PAL, box, sph, cyl, tor, grp } from './models/helpers.js';

const SKINS = [0xffd9b3, 0xf7b98a, 0xd99a63, 0x9c6a44];
const HAIR_COLORS = [0x3a3a48, 0x5a3a22, 0xb5541e, 0xe8a93d, 0x8a5fbf, 0x4a6fa5];

export function buildKid(o = {}) {
  const skin = o.skin ?? SKINS[0];
  const hairColor = o.hairColor ?? HAIR_COLORS[0];
  const hairStyle = o.hairStyle ?? 'short'; // short | ponytail | curly | braids
  const shirt = o.shirt ?? PAL.blue;
  const girl = !!o.girl;
  const bottom = o.bottom ?? (girl ? shirt : PAL.navy);

  const parts = [];

  // ---- 腿 + 小白鞋 ----
  const legC = girl ? skin : bottom;
  parts.push(cyl(0.09, 0.1, 0.32, legC, -0.13, 0.2, 0));
  parts.push(cyl(0.09, 0.1, 0.32, legC, 0.13, 0.2, 0));
  parts.push(box(0.16, 0.1, 0.26, PAL.white, -0.13, 0.05, 0.05));
  parts.push(box(0.16, 0.1, 0.26, PAL.white, 0.13, 0.05, 0.05));

  // ---- 身体（女孩裙子 / 男孩T恤+裤子） ----
  if (girl) {
    parts.push(cyl(0.26, 0.46, 0.62, shirt, 0, 0.62, 0)); // 小裙子
    parts.push(cyl(0.24, 0.26, 0.2, shirt, 0, 0.98, 0));  // 上身
  } else {
    parts.push(cyl(0.27, 0.3, 0.6, shirt, 0, 0.66, 0));
    parts.push(box(0.34, 0.24, 0.3, bottom, 0, 0.33, 0)); // 裤子
  }
  parts.push(cyl(0.1, 0.11, 0.16, skin, 0, 1.1, 0));      // 脖子

  // ---- 胳膊（关节组，挥手时转 armR） ----
  const mkArm = (sx) => {
    const j = grp();
    j.position.set(sx * 0.33, 0.92, 0);
    j.add(cyl(0.07, 0.08, 0.42, shirt, 0, -0.18, 0));
    j.add(sph(0.08, skin, 0, -0.42, 0));
    j.rotation.z = sx * 0.12; // 自然微张
    return j;
  };
  const armL = mkArm(-1);
  const armR = mkArm(1);

  // ---- 大脑袋 ----
  parts.push(sph(0.42, skin, 0, 1.42, 0, { seg: 16 }));
  // 眼睛（小黑球 + 白色高光）
  for (const sx of [-1, 1]) {
    parts.push(sph(0.055, PAL.black, sx * 0.15, 1.48, 0.395));
    parts.push(sph(0.02, PAL.white, sx * 0.15 + 0.02, 1.5, 0.435, { shadow: false }));
  }
  // 微笑（半圆环转下来）
  parts.push(tor(0.11, 0.028, 0x8a4a3a, 0, 1.3, 0.385, { arc: Math.PI, rz: Math.PI }));
  // 腮红
  for (const sx of [-1, 1]) {
    parts.push(sph(0.06, PAL.pink, sx * 0.25, 1.36, 0.33, { sy: 0.7, shadow: false }));
  }

  // ---- 头发 ----
  const hair = [sph(0.45, hairColor, 0, 1.52, -0.05, { sy: 0.72, sx: 1.02, seg: 14 })];
  if (hairStyle === 'ponytail') {
    hair.push(sph(0.15, hairColor, 0, 1.52, -0.48));
    hair.push(cyl(0.05, 0.09, 0.32, hairColor, 0, 1.34, -0.5, { rx: 0.25 }));
  } else if (hairStyle === 'curly') {
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      hair.push(sph(0.13, hairColor, Math.cos(a) * 0.32, 1.68 + Math.sin(i * 2.3) * 0.06, Math.sin(a) * 0.32 - 0.03));
    }
  } else if (hairStyle === 'braids') {
    for (const sx of [-1, 1]) {
      hair.push(cyl(0.06, 0.08, 0.36, hairColor, sx * 0.42, 1.3, -0.02, { rz: sx * -0.3 }));
      hair.push(sph(0.07, hairColor, sx * 0.47, 1.12, -0.02));
    }
  }

  const g = grp(...parts, ...hair, armL, armR);
  g.userData.isKid = true;
  g.userData.armL = armL;
  g.userData.armR = armR;
  g.userData.phase = Math.random() * Math.PI * 2;
  g.userData.wave = 0;
  g.userData.baseRotY = 0;
  return g;
}

// ---------- 各主题站位（x, z 为地面坐标，面向初始相机） ----------
// P 粉 B 蓝 Y 黄 G 绿 O 橙 T 青 PU 紫 R 玫瑰 M 薄荷 N 藏青 BR 棕
export const KID_SPOTS = {
  bedroom: [
    { x: -2.9, z: 1.6, girl: true, hairStyle: 'ponytail', shirt: PAL.pink },
    { x: 2.9, z: 2.0, hairStyle: 'short', shirt: PAL.blue, skin: SKINS[1] },
    { x: 0.6, z: -2.6, girl: true, hairStyle: 'braids', shirt: PAL.purple, hairColor: HAIR_COLORS[2] },
  ],
  kitchen: [
    { x: -2.6, z: 1.8, hairStyle: 'curly', shirt: PAL.orange, skin: SKINS[2] },
    { x: 2.9, z: 0.6, girl: true, hairStyle: 'short', shirt: PAL.yellow, hairColor: HAIR_COLORS[3] },
    { x: -0.6, z: -2.2, hairStyle: 'short', shirt: PAL.teal },
  ],
  supermarket: [
    { x: -2.6, z: 0.6, girl: true, hairStyle: 'ponytail', shirt: PAL.rose, skin: SKINS[1] },
    { x: 2.6, z: 0.9, hairStyle: 'short', shirt: PAL.green, hairColor: HAIR_COLORS[1] },
  ],
  garden: [
    { x: -2.6, z: -1.0, hairStyle: 'short', shirt: PAL.green },
    { x: 2.6, z: 0.6, girl: true, hairStyle: 'curly', shirt: PAL.yellow, skin: SKINS[3] },
    { x: 0, z: 2.6, hairStyle: 'short', shirt: PAL.blue, hairColor: HAIR_COLORS[4] },
  ],
  farm: [
    { x: -2.6, z: 1.0, girl: true, hairStyle: 'braids', shirt: PAL.orange, hairColor: HAIR_COLORS[2] },
    { x: 2.6, z: -0.6, hairStyle: 'short', shirt: PAL.brown, skin: SKINS[2] },
    { x: 0.6, z: 2.9, girl: true, hairStyle: 'ponytail', shirt: PAL.mint },
  ],
  beach: [
    { x: -2.6, z: 1.6, hairStyle: 'short', shirt: PAL.navy, skin: SKINS[1] },
    { x: 2.6, z: 2.1, girl: true, hairStyle: 'ponytail', shirt: PAL.pink },
    { x: 0, z: -1.6, girl: true, hairStyle: 'short', shirt: PAL.teal, hairColor: HAIR_COLORS[3] },
  ],
  school: [
    { x: -2.9, z: 1.2, hairStyle: 'short', shirt: PAL.purple },
    { x: 2.9, z: 1.6, girl: true, hairStyle: 'braids', shirt: PAL.blue, skin: SKINS[2] },
    { x: 0, z: -2.2, hairStyle: 'curly', shirt: PAL.gray, hairColor: HAIR_COLORS[0] },
  ],
  birthday: [
    { x: -2.6, z: 0.9, girl: true, hairStyle: 'curly', shirt: PAL.rose, skin: SKINS[1] },
    { x: 2.6, z: 0.9, hairStyle: 'short', shirt: PAL.yellow, hairColor: HAIR_COLORS[2] },
    { x: -1.2, z: 2.4, girl: true, hairStyle: 'ponytail', shirt: PAL.purple },
  ],
  petshop: [
    { x: -2.9, z: 1.0, hairStyle: 'short', shirt: PAL.teal, skin: SKINS[3] },
    { x: 2.6, z: 1.6, girl: true, hairStyle: 'ponytail', shirt: PAL.orange },
  ],
  space: [
    { x: -2.6, z: 1.6, hairStyle: 'short', shirt: PAL.navy, hairColor: HAIR_COLORS[5] },
    { x: 2.6, z: -0.6, girl: true, hairStyle: 'braids', shirt: PAL.purple },
    { x: 0, z: 2.9, hairStyle: 'curly', shirt: PAL.blue, skin: SKINS[2] },
  ],
};
