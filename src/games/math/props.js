// ============================================================
// props.js —— 数学乐园 v2：通用小舞台 + 答对小烟花
// 题目教具已移入 visuals.js（每种 visual kind 一个演示动画）
// ============================================================
import * as THREE from 'three';
import { mat, PAL, box, sph, cyl, cone, tor, grp, disposeGroup } from '../quiet3d/models/helpers.js';

export { disposeGroup };

// ---------- 通用小舞台 ----------
export function buildStage() {
  const g = grp();
  g.add(cyl(5.4, 5.8, 0.5, PAL.cream, 0, 0.25, 0, { receive: true })); // 地台
  g.add(tor(5.4, 0.14, PAL.pink, 0, 0.5, 0, { rx: Math.PI / 2 }));      // 粉色边
  const cloud = (x, y, z, s) => {
    const c = grp(
      sph(0.55, PAL.white, 0, 0, 0),
      sph(0.4, PAL.white, 0.5, -0.08, 0.1),
      sph(0.42, PAL.white, -0.5, -0.06, -0.1),
    );
    c.position.set(x, y, z); c.scale.setScalar(s);
    return c;
  };
  g.add(cloud(-6.5, 5.5, -4, 1.1), cloud(6.8, 6.2, -5, 1.4), cloud(0.5, 7, -7, 1.8));
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    g.add(sph(0.14, PAL.yellow, Math.cos(a) * 7.2, 3.4 + (i % 3), -4.5 - (i % 2) * 1.5,
      { emissive: 0xffd93d, ei: 0.55, shadow: false }));
  }
  return g;
}

// ---------- 答对小烟花 ----------
export function makeBurst(origin, colorHex = 0xffd93d) {
  const N = 46;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(N * 3);
  const vel = [];
  for (let i = 0; i < N; i++) {
    pos[i * 3] = origin.x; pos[i * 3 + 1] = origin.y; pos[i * 3 + 2] = origin.z;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    const sp = 2.2 + Math.random() * 3.2;
    vel.push(new THREE.Vector3(
      Math.sin(ph) * Math.cos(th) * sp,
      Math.abs(Math.cos(ph)) * sp + 1.5,
      Math.sin(ph) * Math.sin(th) * sp,
    ));
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const points = new THREE.Points(geo, new THREE.PointsMaterial({
    color: colorHex, size: 0.17, transparent: true, opacity: 1, depthWrite: false,
  }));
  const burst = {
    points, vel, life: 1.15, age: 0,
    update(dt) {
      this.age += dt;
      const p = this.points.geometry.attributes.position;
      for (let i = 0; i < this.vel.length; i++) {
        this.vel[i].y -= 6.5 * dt;
        p.array[i * 3] += this.vel[i].x * dt;
        p.array[i * 3 + 1] += this.vel[i].y * dt;
        p.array[i * 3 + 2] += this.vel[i].z * dt;
      }
      p.needsUpdate = true;
      this.points.material.opacity = Math.max(0, 1 - this.age / this.life);
      return this.age < this.life;
    },
    dispose() {
      this.points.geometry.dispose();
      this.points.material.dispose();
    },
  };
  return burst;
}
