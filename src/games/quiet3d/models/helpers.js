// ============================================================
// helpers.js —— 3D 单词模型拼搭工具库
// 约定（所有 builder 必须遵守）：
// 1. 每个 builder 返回 THREE.Group，原点在模型底部中心（y=0 为地面）
// 2. 模型整体尺寸约 1~2 个单位（最大边不超过 2.2），保证 120 个词视觉体量一致
// 3. 只用本文件导出的 mat/box/sph/cyl/cone/tor/plane/grp/tube 来拼搭
// 4. 颜色优先用 PAL 里马卡龙色系；需要新颜色直接传 hex
// 5. 不要自己 new THREE.Mesh / new Material（统一走 mat() 以便复用与释放）
// ============================================================
import * as THREE from 'three';

// ---------- 材质缓存（同色同参数只建一次） ----------
const _matCache = new Map();
export function mat(color, opts = {}) {
  const key = `${color}|${opts.emissive || ''}|${opts.ei || ''}|${opts.flat === false ? 's' : 'f'}|${opts.transparent ? 't' : 'o'}|${opts.opacity || ''}`;
  if (!_matCache.has(key)) {
    _matCache.set(key, new THREE.MeshStandardMaterial({
      color,
      roughness: 0.85,
      metalness: 0.02,
      flatShading: opts.flat !== false,
      emissive: opts.emissive || 0x000000,
      emissiveIntensity: opts.ei || 0,
      transparent: !!opts.transparent,
      opacity: opts.opacity !== undefined ? opts.opacity : 1,
    }));
  }
  return _matCache.get(key);
}

// ---------- 可爱马卡龙色板 ----------
export const PAL = {
  pink: 0xff9db8, rose: 0xf76b8a, red: 0xff6b6b,
  orange: 0xffb066, yellow: 0xffd93d, cream: 0xfff3d6,
  green: 0x7ed491, mint: 0x9be8c8, teal: 0x4fc3c3,
  blue: 0x6cb8ff, navy: 0x4a5fa5, purple: 0xb388eb,
  brown: 0xa9744f, wood: 0xc98f5e, dark: 0x4a4a5e,
  white: 0xffffff, gray: 0xb8c0cc, black: 0x3a3a48,
  skin: 0xffd9b3,
};

// ---------- 基础拼搭件（自动开 castShadow） ----------
function _mesh(geo, color, x, y, z, opts = {}) {
  const m = new THREE.Mesh(geo, opts.mat || mat(color, opts));
  m.position.set(x, y, z);
  if (opts.ry) m.rotation.y = opts.ry;
  if (opts.rx) m.rotation.x = opts.rx;
  if (opts.rz) m.rotation.z = opts.rz;
  if (opts.s) m.scale.setScalar(opts.s);
  if (opts.sx || opts.sy || opts.sz) m.scale.set(opts.sx || 1, opts.sy || 1, opts.sz || 1);
  m.castShadow = opts.shadow !== false;
  m.receiveShadow = !!opts.receive;
  return m;
}

// 方块：w 宽，h 高，d 深，中心位于 (x, y, z)
export function box(w, h, d, color, x = 0, y = 0, z = 0, opts = {}) {
  return _mesh(new THREE.BoxGeometry(w, h, d), color, x, y, z, opts);
}
// 球：r 半径
export function sph(r, color, x = 0, y = 0, z = 0, opts = {}) {
  const seg = opts.seg || 12;
  return _mesh(new THREE.SphereGeometry(r, seg, Math.max(8, seg - 4)), color, x, y, z, opts);
}
// 圆柱：rt 顶半径，rb 底半径，h 高
export function cyl(rt, rb, h, color, x = 0, y = 0, z = 0, opts = {}) {
  return _mesh(new THREE.CylinderGeometry(rt, rb, h, opts.seg || 12), color, x, y, z, opts);
}
// 圆锥
export function cone(r, h, color, x = 0, y = 0, z = 0, opts = {}) {
  return _mesh(new THREE.ConeGeometry(r, h, opts.seg || 12), color, x, y, z, opts);
}
// 圆环：r 环半径，t 管半径
export function tor(r, t, color, x = 0, y = 0, z = 0, opts = {}) {
  return _mesh(new THREE.TorusGeometry(r, t, 10, opts.seg || 20, opts.arc || Math.PI * 2), color, x, y, z, opts);
}
// 平面（双面）：w 宽，h 高
export function plane(w, h, color, x = 0, y = 0, z = 0, opts = {}) {
  const m = _mesh(new THREE.PlaneGeometry(w, h), color, x, y, z, opts);
  m.material = m.material; // 复用缓存材质
  return m;
}
// 管道（弯曲手柄/吸管等）：points 为 Vector3 数组
export function tube(points, radius, color, opts = {}) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  return _mesh(new THREE.TubeGeometry(curve, 12, radius, 8), color, 0, 0, 0, opts);
}
// 组
export function grp(...children) {
  const g = new THREE.Group();
  for (const c of children) if (c) g.add(c);
  return g;
}

// ---------- 释放：遍历释放几何体（材质走全局缓存，不释放） ----------
export function disposeGroup(root) {
  root.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
  });
}
