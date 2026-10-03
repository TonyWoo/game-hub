// ============================================================
// index.jsx —— 换装小屋（three.js 3D 换装学单词）
// 单屏：中央 3D 女孩模特（旋转查看+点按转圈），底部双层栏选衣物
// 点衣物穿上 → 读英文 + 单词气泡 + 收集；存档独立 key：dressup-save-v1
// ============================================================
import { useState, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './dressup.css';
import { buildMannequin, CLOTHES, CATS, clothOf, auditClothes } from './models.js';
import { PAL, cyl, sph, grp, disposeGroup } from '../quiet3d/models/helpers.js';
import { speak } from '../quiet/speech.js';
import { loadSave, persistSave } from './storage.js';

const CAM_HOME = { pos: [4.2, 3.4, 6.8], tgt: [0, 1.0, 0] };

// ---------- 服装单词本 ----------
function WordBook({ collected, onBack }) {
  return (
    <div className="du-words">
      <div className="du-topbar">
        <button className="du-icon-btn" onClick={onBack}>← 换装</button>
        <span className="t-name">📚 服装单词本</span>
        <span className="t-count">{collected.length}/{CLOTHES.length}</span>
      </div>
      <div className="du-word-grid" style={{ marginTop: 12 }}>
        {CLOTHES.map((c) => {
          const got = collected.includes(c.id);
          return (
            <button key={c.id} className={`du-word${got ? ' got' : ''}`}
              onClick={() => { if (got) speak(c.en); }}>
              <span className="e">{got ? c.emoji : '❔'}</span>
              <span className="en">{c.en}</span>
              <span className="zh">{c.zh}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- 换装主屏 ----------
function PlayScreen({ save, commit, onWords }) {
  const mountRef = useRef(null);
  const [bubble, setBubble] = useState(null);   // { id } 或 { text }
  const [cat, setCat] = useState('tops');
  const [worn, setWornState] = useState(save.worn || {});
  const wornRef = useRef(worn);
  const apiRef = useRef(null);
  const handlersRef = useRef(null);
  const bubbleTimer = useRef(null);

  const setWorn = (w) => { wornRef.current = w; setWornState(w); };
  const showBubble = useCallback((b) => {
    setBubble(b);
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    bubbleTimer.current = setTimeout(() => setBubble(null), 4000);
  }, []);

  handlersRef.current = {
    onWear(w, cloth, added) {
      setWorn(w);
      commit((s) => {
        s.worn = w;
        if (added && !s.collected.includes(cloth.id)) s.collected.push(cloth.id);
      });
      if (added) {
        speak(cloth.en + '!');
        showBubble({ id: cloth.id });
      } else {
        showBubble({ text: `脱下${cloth.zh}啦` });
      }
    },
    onWearAll(w) {
      setWorn(w);
      commit((s) => {
        s.worn = w;
        for (const id of Object.values(w)) {
          if (id && !s.collected.includes(id)) s.collected.push(id);
        }
      });
      showBubble({ text: '换好啦！✨' });
    },
  };

  // ---- three.js 主循环 ----
  useEffect(() => {
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfff5f9);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 120);
    camera.position.set(...CAM_HOME.pos);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(...CAM_HOME.tgt);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 3;
    controls.maxDistance = 12;
    controls.minPolarAngle = Math.PI * 0.15;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.enablePan = false;

    // 灯光
    scene.add(new THREE.HemisphereLight(0xffffff, 0xffd9e8, 0.95));
    const sun = new THREE.DirectionalLight(0xffffff, 1.6);
    sun.position.set(2.5, 5, 3.5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -6; sun.shadow.camera.right = 6;
    sun.shadow.camera.top = 6; sun.shadow.camera.bottom = -6;
    scene.add(sun);

    // 小舞台：圆地台 + 周围漂浮小星星
    const ground = cyl(3.0, 3.0, 0.25, 0xffe4ef, 0, -0.125, 0, { seg: 40 });
    ground.receiveShadow = true;
    scene.add(ground);
    const rug = cyl(1.3, 1.3, 0.06, 0xffd1e3, 0, 0.03, 0, { seg: 32 });
    rug.receiveShadow = true;
    scene.add(rug);
    const stars = [];
    const starCols = [PAL.yellow, PAL.pink, PAL.blue, PAL.purple, PAL.mint];
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + 0.3;
      const r = 2.4 + Math.random() * 1.2;
      const s = sph(0.09 + Math.random() * 0.06, starCols[i % starCols.length],
        Math.cos(a) * r, 1.6 + Math.random() * 1.6, Math.sin(a) * r, { shadow: false });
      s.userData.ph = Math.random() * Math.PI * 2;
      s.userData.by = s.position.y;
      stars.push(s);
      scene.add(s);
    }

    // 模特
    const mannequin = buildMannequin();
    scene.add(mannequin);
    const wornGroups = {}; // cat -> Group

    const applyWorn = (w) => {
      for (const c of CATS) {
        const old = wornGroups[c.id];
        if (old) {
          mannequin.remove(old);
          disposeGroup(old);
          delete wornGroups[c.id];
        }
        const id = w[c.id];
        const cloth = id && clothOf(id);
        if (cloth) {
          try {
            const g = cloth.build();
            mannequin.add(g);
            wornGroups[c.id] = g;
          } catch (e) { console.warn('[dressup] 衣物构造失败:', id, e); }
        }
      }
    };

    // 初始穿搭（校验 id 有效）
    const initWorn = {};
    for (const c of CATS) {
      const id = (save.worn || {})[c.id];
      if (id && clothOf(id)) initWorn[c.id] = id;
    }
    wornRef.current = initWorn;
    setWornState(initWorn);
    applyWorn(initWorn);

    // 穿脱逻辑：同类单选、再点脱下、裙装下装互斥
    const wear = (id) => {
      const c = clothOf(id);
      if (!c) return;
      const w = { ...wornRef.current };
      const added = w[c.cat] !== id;
      if (!added) delete w[c.cat];
      else {
        w[c.cat] = id;
        if (c.cat === 'dresses') delete w.bottoms;
        if (c.cat === 'bottoms') delete w.dresses;
      }
      applyWorn(w);
      handlersRef.current.onWear(w, c, added);
    };
    const randomize = () => {
      const w = {};
      for (const c of CATS) {
        if (Math.random() < 0.8) {
          const items = CLOTHES.filter((x) => x.cat === c.id);
          w[c.id] = items[Math.floor(Math.random() * items.length)].id;
        }
      }
      if (w.dresses && w.bottoms) {
        if (Math.random() < 0.5) delete w.dresses; else delete w.bottoms;
      }
      applyWorn(w);
      handlersRef.current.onWearAll(w);
    };
    const resetOutfit = () => {
      applyWorn({});
      handlersRef.current.onWearAll({});
    };

    apiRef.current = {
      wear, randomize, resetOutfit,
      resetCamera: () => {
        camera.position.set(...CAM_HOME.pos);
        controls.target.set(...CAM_HOME.tgt);
      },
    };

    // 点按模特 → 转圈展示
    const ray = new THREE.Raycaster();
    const ptr = new THREE.Vector2();
    let twirl = 0;
    let downPos = null;
    const el = renderer.domElement;
    const onDown = (e) => { downPos = [e.clientX, e.clientY]; };
    const onUp = (e) => {
      if (!downPos) return;
      const moved = Math.hypot(e.clientX - downPos[0], e.clientY - downPos[1]);
      downPos = null;
      if (moved > 8) return; // 拖动旋转，不算点按
      const r = el.getBoundingClientRect();
      ptr.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      ptr.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      ray.setFromCamera(ptr, camera);
      if (ray.intersectObject(mannequin, true).length) twirl = 1;
    };
    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);

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

    const clock = new THREE.Clock();
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      controls.update();
      // 模特待机摇摆 / 转圈
      const u = mannequin.userData;
      if (twirl > 0) {
        twirl = Math.max(0, twirl - dt / 0.9);
        mannequin.rotation.y += (dt / 0.9) * Math.PI * 2;
        if (twirl === 0) mannequin.rotation.y = Math.round(mannequin.rotation.y / (Math.PI * 2)) * Math.PI * 2;
      } else {
        mannequin.rotation.z = Math.sin(t * 2 + u.phase) * 0.03;
        mannequin.position.y = Math.abs(Math.sin(t * 2.2 + u.phase)) * 0.03;
      }
      // 星星漂浮
      for (const s of stars) {
        s.position.y = s.userData.by + Math.sin(t * 1.5 + s.userData.ph) * 0.15;
        s.rotation.y += dt * 0.6;
      }
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      controls.dispose();
      disposeGroup(scene);
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      apiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const catItems = CLOTHES.filter((c) => c.cat === cat);

  return (
    <div className="du-play">
      <div className="du-topbar">
        <span className="t-name">👗 换装小屋</span>
        <span className="t-count">已收集 {save.collected.length}/{CLOTHES.length}</span>
        <button className="du-icon-btn" onClick={onWords}>📚 单词本</button>
      </div>
      <div className="du-stage" ref={mountRef}>
        {bubble && (
          <div className="du-bubble">
            {bubble.id ? (
              <>
                <div className="b-en">{clothOf(bubble.id).en}!</div>
                <div className="b-zh">{clothOf(bubble.id).zh} <button className="b-replay" onClick={() => speak(clothOf(bubble.id).en)}>🔊</button></div>
              </>
            ) : (
              <div className="b-en">{bubble.text}</div>
            )}
          </div>
        )}
        <div className="du-hint" style={{ opacity: .75 }}>单指旋转 · 双指缩放 · 点模特转圈 · 点衣物换装</div>
        <div className="du-stage-btns">
          <button className="du-fab" onClick={() => apiRef.current && apiRef.current.randomize()} title="随机搭配">🎲</button>
          <button className="du-fab" onClick={() => apiRef.current && apiRef.current.resetOutfit()} title="脱下全部">↩</button>
          <button className="du-fab" onClick={() => apiRef.current && apiRef.current.resetCamera()} title="重置视角">🎥</button>
        </div>
      </div>
      <div className="du-cats">
        {CATS.map((c) => (
          <button key={c.id}
            className={`du-cat${cat === c.id ? ' active' : ''}`}
            onClick={() => setCat(c.id)}>
            <span className="e">{c.emoji}</span>
            <span className="n">{c.name}</span>
          </button>
        ))}
      </div>
      <div className="du-tray">
        {catItems.map((c) => (
          <button key={c.id}
            className={`du-tray-item${worn[c.cat] === c.id ? ' worn' : ''}${save.collected.includes(c.id) ? ' got' : ''}`}
            onClick={() => apiRef.current && apiRef.current.wear(c.id)}>
            <span className="e">{c.emoji}</span>
            <span className="en">{c.en}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- 入口 ----------
export default function DressUp() {
  const [save, setSave] = useState(loadSave);
  const [screen, setScreen] = useState('play');

  const commit = useCallback((fn) => {
    setSave((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      fn(next);
      persistSave(next);
      return next;
    });
  }, []);

  useEffect(() => {
    try { auditClothes(); } catch { /* 忽略 */ }
  }, []);

  if (screen === 'words') {
    return <WordBook collected={save.collected} onBack={() => setScreen('play')} />;
  }
  return <PlayScreen save={save} commit={commit} onWords={() => setScreen('words')} />;
}
