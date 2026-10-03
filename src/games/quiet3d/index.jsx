// ============================================================
// index.jsx —— 安静书 3D 版（three.js）
// 四屏：主题选择 / 3D 游玩（旋转+点读+拖放） / 找一找（场景内测验） / 单词本
// 词表/发音复用 2D 版；存档独立 key：quiet-book-3d-save-v1
// ============================================================
import { useState, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './quiet3d.css';
import { THEMES, ALL_WORDS, TOTAL_WORDS, unlockNeed, wordOf } from '../quiet/themes.js';
import { speak, speakSeq } from '../quiet/speech.js';
import { loadSave, persistSave } from './storage.js';
import { buildModel, auditModels } from './models/index.js';
import { buildKid, KID_PRESETS, kidPresetOf } from './kids.js';
import { disposeGroup } from './models/helpers.js';
import { WORLDS, makeParticles } from './worlds.js';
import { emojiOf } from './emoji.js';

const CAM_HOME = { pos: [7, 6.5, 9.5], tgt: [0, 0.8, 0] };
const GROUND_R = 4.6;

// 放置夸奖池（连续两次不重复）
const PRAISE = ['Great job!', 'Wonderful!', 'Amazing!', 'Super!', 'Fantastic!', 'Well done!', 'Awesome!', 'Beautiful!'];
let lastPraiseIdx = -1;
function nextPraise() {
  let i;
  do { i = Math.floor(Math.random() * PRAISE.length); } while (i === lastPraiseIdx);
  lastPraiseIdx = i;
  return PRAISE[i];
}

// ---------- 主题选择 ----------
function ThemeSelect({ collected, onOpen, onWords }) {
  return (
    <div className="q3-themes">
      <h1 className="q3-title">✨ 安静书 3D</h1>
      <p className="q3-sub">转一转场景，点一点物品，学单词！已收集 <b>{collected.length}</b> / {TOTAL_WORDS} 个单词</p>
      <button className="q3-words-btn" onClick={onWords}>📚 单词本</button>
      <div className="q3-theme-grid">
        {THEMES.map((t, i) => {
          const need = unlockNeed(i);
          const locked = i > 0 && collected.length < need;
          return (
            <button
              key={t.id}
              className={`q3-theme-card${locked ? ' locked' : ''}`}
              style={{ '--accent': t.accent }}
              onClick={() => !locked && onOpen(i)}
            >
              <span className="q3-theme-emoji">{locked ? '🔒' : t.emoji}</span>
              <span className="q3-theme-zh">{t.zh}</span>
              <span className="q3-theme-en">{t.en} · 3D</span>
              {locked && <span className="q3-lock-tip">还差 {need - collected.length} 个单词</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- 单词本 ----------
function WordBook({ collected, onBack }) {
  return (
    <div className="q3-words">
      <div className="q3-topbar">
        <button className="q3-icon-btn" onClick={onBack}>← 主题</button>
        <span className="t-name">📚 单词本</span>
        <span className="t-count">{collected.length}/{TOTAL_WORDS}</span>
      </div>
      <div className="q3-word-grid" style={{ marginTop: 12 }}>
        {ALL_WORDS.map((w) => {
          const got = collected.includes(w.id);
          return (
            <button key={w.id} className={`q3-word${got ? ' got' : ''}`}
              onClick={() => { if (got) speak(w.en); }}>
              <span className="e">{got ? emojiOf(w.id) : '❔'}</span>
              <span className="en">{w.en}</span>
              <span className="zh">{w.zh}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- 3D 游玩屏 ----------
function PlayScreen({ theme, save, commit, onBack }) {
  const mountRef = useRef(null);
  const [bubble, setBubble] = useState(null);       // { id }
  const [armed, setArmedState] = useState(null);    // 待放置单词 id
  const [quiz, setQuiz] = useState(null);           // { round, target, score, fb }
  const armedRef = useRef(null);
  const apiRef = useRef(null);
  const quizRef = useRef(null);
  quizRef.current = quiz;
  const bubbleTimer = useRef(null);

  const setArmed = (id) => { armedRef.current = id; setArmedState(id); };

  // bubble: { id, praise } 单词；{ kid, praise } 手动放置的小朋友
  const showBubble = useCallback((b) => {
    setBubble(b);
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    bubbleTimer.current = setTimeout(() => setBubble(null), 5000);
  }, []);

  const collect = useCallback((id) => {
    commit((s) => { if (!s.collected.includes(id)) s.collected.push(id); });
  }, [commit]);

  // ---- three.js 主循环 ----
  useEffect(() => {
    const mount = mountRef.current;
    const W = WORLDS[theme.id];
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(W.sky);
    scene.fog = new THREE.Fog(W.sky, 20, 42);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 120);
    camera.position.set(...CAM_HOME.pos);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(...CAM_HOME.tgt);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 4;
    controls.maxDistance = 18;
    controls.minPolarAngle = Math.PI * 0.15;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.enablePan = false;

    scene.add(new THREE.HemisphereLight(0xffffff, 0x8a7a8a, 0.85));
    const sun = new THREE.DirectionalLight(0xfff2df, 2.0);
    sun.position.set(6, 10, 4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -9; sun.shadow.camera.right = 9;
    sun.shadow.camera.top = 9; sun.shadow.camera.bottom = -9;
    scene.add(sun);

    const world = W.build();
    scene.add(world);
    const particles = makeParticles(W.particle);
    if (particles) scene.add(particles);
    // 家具可放置台面：[{y, x0, x1, z0, z1}]，来自 worlds.js
    const placeSurfaces = world.userData.surfaces || [];

    // 小朋友：只通过物品栏「小朋友」分组手动放置，场景不再预置固定 NPC
    // kids 参与统一待机/挥手动效；kidPickables 用于射线点选
    const kids = [];
    const kidPickables = [];
    const pickKid = (e) => {
      setPtr(e); ray.setFromCamera(ptr, camera);
      const hits = ray.intersectObjects(kidPickables, true);
      if (!hits.length) return null;
      let o = hits[0].object;
      while (o && !o.userData.isKid) o = o.parent;
      return o;
    };

    // 已放置物品
    const pickables = [];   // 单词模型 group 列表
    const anims = [];       // 入场动画 { g, t }
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const ray = new THREE.Raycaster();
    const ptr = new THREE.Vector2();

    const spawnAt = (id, x, z, y = 0, animate = true) => {
      const g = buildModel(id);
      if (!g) return null;
      g.position.set(x, y, z);
      g.userData.wordId = id;
      scene.add(g);
      pickables.push(g);
      if (animate) { g.scale.setScalar(0.01); anims.push({ g, t: 0 }); }
      return g;
    };
    // 用户手动放置的小朋友（与固定 NPC 共用 kids 动画数组与 kidPickables 点选）
    const placedKids = [];
    const isKidId = (id) => typeof id === 'string' && id.startsWith('kid-');
    const spawnKidAt = (presetId, x, z, y = 0, animate = true) => {
      const preset = kidPresetOf(presetId);
      if (!preset) return null;
      let g;
      try { g = buildKid(preset); } catch (e) { console.warn('[quiet3d] 小朋友构造失败:', e); return null; }
      g.position.set(x, y, z);
      const face = Math.atan2(CAM_HOME.pos[0] - x, CAM_HOME.pos[2] - z);
      g.rotation.y = face;
      g.userData.baseRotY = face;
      g.userData.baseY = y;
      g.userData.kidPreset = presetId;
      scene.add(g);
      kids.push(g);
      kidPickables.push(g);
      placedKids.push(g);
      if (animate) { g.scale.setScalar(0.01); anims.push({ g, t: 0 }); }
      return g;
    };
    const initPlaced = save.placed[theme.id] || [];
    initPlaced.forEach((p) => {
      if (isKidId(p.id)) spawnKidAt(p.id, p.x, p.z, p.y || 0, false);
      else spawnAt(p.id, p.x, p.z, p.y || 0, false);
    });

    const setPtr = (e) => {
      const r = renderer.domElement.getBoundingClientRect();
      ptr.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      ptr.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    };
    // 取场景点：先试家具台面（取离相机最近的命中），再回落到地面 y=0
    const _surfPlane = new THREE.Plane();
    const _up = new THREE.Vector3(0, 1, 0);
    const groundPoint = (e) => {
      setPtr(e); ray.setFromCamera(ptr, camera);
      const v = new THREE.Vector3();
      let best = null, bestD = Infinity;
      for (const s of placeSurfaces) {
        _surfPlane.set(_up, -s.y);
        if (ray.ray.intersectPlane(_surfPlane, v)
          && v.x >= s.x0 && v.x <= s.x1 && v.z >= s.z0 && v.z <= s.z1) {
          const d = v.distanceToSquared(camera.position);
          if (d < bestD) { bestD = d; best = v.clone(); }
        }
      }
      if (best) return best;
      return ray.ray.intersectPlane(groundPlane, v) ? v : null;
    };
    const pickModel = (e) => {
      setPtr(e); ray.setFromCamera(ptr, camera);
      const hits = ray.intersectObjects(pickables, true);
      if (!hits.length) return null;
      let o = hits[0].object;
      while (o && !o.userData.wordId) o = o.parent;
      return o;
    };
    const freeSpot = () => {
      for (let k = 0; k < 24; k++) {
        const a = Math.random() * Math.PI * 2;
        const r = 1.2 + Math.random() * 3.0;
        const x = Math.cos(a) * r, z = Math.sin(a) * r;
        const ok = pickables.every((g) => Math.hypot(g.position.x - x, g.position.z - z) > 1.4)
          && placedKids.every((g) => Math.hypot(g.position.x - x, g.position.z - z) > 1.4);
        if (ok) return { x, z };
      }
      return { x: (Math.random() - 0.5) * 6, z: (Math.random() - 0.5) * 6 };
    };

    // 选中高亮（克隆材质避免污染全局缓存）
    let selected = null;
    const highlight = (g, on) => {
      g.traverse((o) => {
        if (!o.isMesh) return;
        if (on) {
          if (!o.userData._mat) o.userData._mat = o.material;
          const c = o.userData._mat.clone();
          c.emissive = new THREE.Color(0xff9d2e);
          c.emissiveIntensity = 0.45;
          o.material = c;
          o.userData._hl = c;
        } else if (o.userData._hl) {
          o.material.dispose();
          o.material = o.userData._mat;
          o.userData._hl = null;
        }
      });
    };
    const select = (g) => {
      if (selected) highlight(selected, false);
      selected = g;
      if (g) highlight(g, true);
    };

    const persistPlaced = () => {
      const r2 = (v) => Math.round(v * 100) / 100;
      const arr = [
        ...pickables.map((g) => ({ id: g.userData.wordId, x: r2(g.position.x), y: r2(g.position.y), z: r2(g.position.z) })),
        ...placedKids.map((g) => ({ id: g.userData.kidPreset, x: r2(g.position.x), y: r2(g.position.y), z: r2(g.position.z) })),
      ];
      commit((s) => { s.placed[theme.id] = arr; });
    };

    // ---- 手势：点选 / 放置 / 拖拽 ----
    let drag = null; // { g, isKid, moved, sx, sy }
    const onDown = (e) => {
      if (e.isPrimary === false) return;
      // 找一找模式：点模型 = 作答
      const q = quizRef.current;
      if (q && !q.fb) {
        const g = pickModel(e);
        if (g) answerQuiz(g.userData.wordId);
        return;
      }
      if (armedRef.current) {
        const p = groundPoint(e);
        if (p) {
          const r = Math.hypot(p.x, p.z);
          const cl = r > GROUND_R ? GROUND_R / r : 1;
          const id = armedRef.current;
          if (isKidId(id)) {
            // 放置小朋友：读 Hello! + 随机英文夸奖
            const g = spawnKidAt(id, p.x * cl, p.z * cl, p.y);
            if (g) {
              persistPlaced(); setArmed(null);
              const praise = nextPraise();
              speakSeq(['Hello!', praise]);
              showBubble({ kid: kidPresetOf(id), praise });
            }
          } else {
            const g = spawnAt(id, p.x * cl, p.z * cl, p.y);
            if (g) {
              persistPlaced(); setArmed(null);
              // 放置成功：读英文 + 随机英文夸奖
              const w = wordOf(id);
              const praise = nextPraise();
              speakSeq([w.en + '!', praise]);
              showBubble({ id, praise });
              collect(id);
            }
          }
        }
        return;
      }
      // 点中小朋友：开始拖拽候选（点按=挥手+弹跳，拖动=换位置）
      const kid = pickKid(e);
      if (kid) {
        controls.enabled = false;
        drag = { g: kid, isKid: true, moved: false, sx: e.clientX, sy: e.clientY };
        return;
      }
      const g = pickModel(e);
      if (g) {
        controls.enabled = false;
        drag = { g, isKid: false, moved: false, sx: e.clientX, sy: e.clientY };
      }
    };
    const onMove = (e) => {
      if (!drag || e.isPrimary === false) return;
      if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 6) drag.moved = true;
      if (drag.moved) {
        const p = groundPoint(e);
        if (p) {
          const r = Math.hypot(p.x, p.z);
          const cl = r > GROUND_R ? GROUND_R / r : 1;
          drag.g.position.x = p.x * cl;
          drag.g.position.z = p.z * cl;
          drag.g.position.y = p.y;
          if (drag.isKid) drag.g.userData.baseY = p.y;
        }
      }
    };
    const onUp = (e) => {
      if (!drag) return;
      const g = drag.g, wasTap = !drag.moved, isKid = drag.isKid;
      drag = null;
      controls.enabled = true;
      if (isKid) {
        if (wasTap) g.userData.wave = 1.1;  // 点按小朋友：挥手+弹跳
        else persistPlaced();                 // 拖动换位置：存档（不夸奖）
        return;
      }
      if (wasTap) {
        const w = wordOf(g.userData.wordId);
        select(g);
        speak(w.en);
        showBubble({ id: w.id });
        collect(w.id);
      } else {
        persistPlaced();
      }
    };

    // ---- 找一找 ----
    const startQuiz = () => {
      const ids = theme.items.map((i) => i.id);
      const target = ids[Math.floor(Math.random() * ids.length)];
      let g = pickables.find((x) => x.userData.wordId === target);
      if (!g) { const s = freeSpot(); g = spawnAt(target, s.x, s.z); persistPlaced(); }
      select(g);
      setQuiz({ round: 1, target, score: 0, fb: null });
      setTimeout(() => speak(wordOf(target).en), 350);
    };
    const answerQuiz = (id) => {
      const q = quizRef.current;
      if (!q || q.fb) return;
      const ok = id === q.target;
      const w = wordOf(id);
      speak(w.en);
      if (ok) collect(id);
      setQuiz({ ...q, fb: ok ? '✅' : '❌', score: q.score + (ok ? 1 : 0) });
      setTimeout(() => {
        const nq = quizRef.current;
        if (!nq) return;
        if (nq.round >= 5) {
          commit((s) => {
            const best = s.stars[theme.id] || 0;
            s.stars[theme.id] = Math.max(best, nq.score + (ok ? 1 : 0));
          });
          select(null);
          setQuiz(null);
        } else {
          const ids = theme.items.map((i) => i.id);
          const target = ids[Math.floor(Math.random() * ids.length)];
          let g = pickables.find((x) => x.userData.wordId === target);
          if (!g) { const s = freeSpot(); g = spawnAt(target, s.x, s.z); persistPlaced(); }
          select(g);
          setQuiz({ round: nq.round + 1, target, score: nq.score + (ok ? 1 : 0), fb: null });
          setTimeout(() => speak(wordOf(target).en), 350);
        }
      }, 900);
    };

    apiRef.current = {
      startQuiz,
      resetCamera: () => {
        camera.position.set(...CAM_HOME.pos);
        controls.target.set(...CAM_HOME.tgt);
      },
    };

    const el = renderer.domElement;
    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);

    const resize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();

    const clockT = new THREE.Clock();
    let raf = 0, pulse = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(clockT.getDelta(), 0.05);
      const t = clockT.elapsedTime;
      controls.update();
      if (particles) particles.userData.update(dt, t);
      if (world.userData.tick) world.userData.tick(dt, t); // 场景小动画：风车/卫星
      // 入场弹跳
      for (let i = anims.length - 1; i >= 0; i--) {
        const a = anims[i];
        a.t += dt * 2.6;
        if (a.t >= 1) { a.g.scale.setScalar(1); anims.splice(i, 1); }
        else {
          const s = 1 + Math.sin(a.t * Math.PI) * 0.25 * (1 - a.t);
          a.g.scale.setScalar(Math.max(0.01, a.t * s));
        }
      }
      // 小朋友：待机摇摆 / 挥手+弹跳（baseY 为放置高度，台面上也正常）
      for (const k of kids) {
        const u = k.userData;
        const baseY = u.baseY || 0;
        if (u.wave > 0) {
          u.wave -= dt;
          u.armR.rotation.z = 2.5 + Math.sin(t * 16) * 0.45; // 举手挥动
          u.armL.rotation.z = -0.12;
          k.position.y = baseY + Math.abs(Math.sin(t * 10)) * 0.28;  // 开心弹跳
          k.rotation.z = 0;
          if (u.wave <= 0) { u.armR.rotation.z = 0.12; k.position.y = baseY; }
        } else {
          k.rotation.z = Math.sin(t * 2 + u.phase) * 0.05;   // 待机摇摆
          k.position.y = baseY + Math.abs(Math.sin(t * 2.2 + u.phase)) * 0.04;
        }
      }
      // 选中脉冲
      if (selected) {
        pulse += dt * 5;
        const k = 0.35 + Math.sin(pulse) * 0.2;
        selected.traverse((o) => {
          if (o.isMesh && o.userData._hl) o.userData._hl.emissiveIntensity = k;
        });
      }
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      if (selected) highlight(selected, false);
      controls.dispose();
      scene.traverse((o) => { if (o.isMesh && o.userData._hl) o.userData._hl.dispose(); });
      disposeGroup(scene);
      if (particles) { particles.geometry.dispose(); particles.material.dispose(); }
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      apiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme.id]);

  const stars = save.stars[theme.id] || 0;
  const placedIds = new Set((save.placed[theme.id] || []).map((p) => p.id));

  return (
    <div className="q3-play">
      <div className="q3-topbar">
        <button className="q3-icon-btn" onClick={onBack}>← 主题</button>
        <span className="t-name">{theme.emoji} {theme.zh} · 3D</span>
        <span className="t-count">已收集 {save.collected.length}/{TOTAL_WORDS}</span>
        <button className="q3-icon-btn stars" onClick={() => apiRef.current && apiRef.current.startQuiz()}>
          🔍 找一找{stars > 0 ? ` ⭐${stars}` : ''}
        </button>
      </div>
      <div className="q3-stage" ref={mountRef}>
        {quiz && (
          <div className="q3-quiz-top" style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
            <div className="q3-quiz-word">
              🔊 {wordOf(quiz.target).en}
              <button className="q3-icon-btn" style={{ marginLeft: 8 }}
                onClick={() => speak(wordOf(quiz.target).en)}>重播</button>
            </div>
            <div className="q3-quiz-hint">听发音，点一点场景里对应的物品</div>
            <div className="q3-quiz-round">第 {quiz.round}/5 轮 · ⭐ {quiz.score}
              <button className="q3-icon-btn" style={{ marginLeft: 8 }} onClick={() => { setQuiz(null); }}>退出</button>
            </div>
          </div>
        )}
        {quiz && quiz.fb && <div className="q3-quiz-fb">{quiz.fb}</div>}
        {bubble && !quiz && (() => {
          if (bubble.kid) return (
            <div className="q3-bubble">
              <div className="b-en">Hello!{bubble.praise ? ` ${bubble.praise}` : ''} 👋</div>
              <div className="b-zh">{bubble.kid.name} <button className="b-replay" onClick={() => speak('Hello!')}>🔊</button></div>
            </div>
          );
          const w = wordOf(bubble.id); return (
          <div className="q3-bubble">
            <div className="b-en">{w.en}!{bubble.praise ? ` ${bubble.praise}` : ''}</div>
            <div className="b-zh">{w.zh} <button className="b-replay" onClick={() => speak(w.en)}>🔊</button></div>
          </div>
        ); })()}
        {armed && !quiz && (
          <div className="q3-hint">点一下场景，把「{armed.startsWith('kid-') ? kidPresetOf(armed).name : wordOf(armed).zh}」放下吧！
            <button onClick={() => setArmed(null)}>取消</button>
          </div>
        )}
        {!armed && !quiz && (
          <div className="q3-hint" style={{ opacity: .75 }}>单指旋转 · 双指缩放 · 点物品学单词 · 拖物品换位置</div>
        )}
        <button className="q3-cam" onClick={() => apiRef.current && apiRef.current.resetCamera()} title="重置视角">🎥</button>
      </div>
      <div className="q3-tray">
        {KID_PRESETS.map((k) => (
          <button
            key={k.id}
            className={`q3-tray-item q3-tray-kid${armed === k.id ? ' armed' : ''}${placedIds.has(k.id) ? ' done' : ''}`}
            onClick={() => setArmed(armed === k.id ? null : k.id)}
          >
            <span className="e">{k.emoji}</span>
            <span className="n">{k.name}</span>
          </button>
        ))}
        {theme.items.map((it) => (
          <button
            key={it.id}
            className={`q3-tray-item${armed === it.id ? ' armed' : ''}${placedIds.has(it.id) ? ' done' : ''}`}
            onClick={() => setArmed(armed === it.id ? null : it.id)}
          >
            <span className="e">{emojiOf(it.id)}</span>
            <span className="n">{it.zh}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- 入口 ----------
export default function Quiet3D() {
  const [save, setSave] = useState(loadSave);
  const [screen, setScreen] = useState({ name: 'themes' }); // { name, idx }

  const commit = useCallback((fn) => {
    setSave((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      fn(next);
      persistSave(next);
      return next;
    });
  }, []);

  // 自检：控制台报告缺失模型（开发期）
  useEffect(() => {
    try { auditModels(ALL_WORDS); } catch { /* 忽略 */ }
  }, []);

  if (screen.name === 'words') {
    return <WordBook collected={save.collected} onBack={() => setScreen({ name: 'themes' })} />;
  }
  if (screen.name === 'play') {
    const theme = THEMES[screen.idx];
    return (
      <PlayScreen
        theme={theme}
        save={save}
        commit={commit}
        onBack={() => setScreen({ name: 'themes' })}
      />
    );
  }
  return (
    <ThemeSelect
      collected={save.collected}
      onOpen={(idx) => setScreen({ name: 'play', idx })}
      onWords={() => setScreen({ name: 'words' })}
    />
  );
}
