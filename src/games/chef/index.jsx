// ============================================================
// index.jsx —— 小小厨师（three.js 3D 做菜 + 顾客评价）
// 流程：点台面食材（按顺序，点错摇晃）→ 飞到组装盘 → 上菜 → 顾客吃 → 星星评价
// 存档独立 key：chef-save-v1
// ============================================================
import { useState, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './chef.css';
import {
  INGREDIENTS, RECIPES, recipeOf, ingOf, buildIngredient, buildKitchen,
  assembleLayer, COUNTER_Y, COUNTER_SLOTS, ASSEMBLE_POS, SERVE_POS, CUSTOMER_POS,
} from './models.js';
import { buildKid, KID_PRESETS } from '../quiet3d/kids.js';
import { disposeGroup } from '../quiet3d/models/helpers.js';
import { speak, speakSeq } from '../quiet/speech.js';
import { loadSave, persistSave } from './storage.js';

const CAM_HOME = { pos: [0.5, 5.4, 9.8], tgt: [0.4, 0.9, -0.6] };
const PRAISE = ['Yummy!', 'So delicious!', 'I love it!', 'Amazing!', 'My favorite!'];

// 点错时的温柔短音（WebAudio 合成，无音频文件）
function blip() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'sine'; o.frequency.value = 240;
    g.gain.setValueAtTime(0.12, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    o.start(); o.stop(ctx.currentTime + 0.2);
    setTimeout(() => ctx.close(), 400);
  } catch { /* 忽略 */ }
}

// ---------- 美食单词本 ----------
function WordBook({ collected, onBack }) {
  return (
    <div className="cf-words">
      <div className="cf-topbar">
        <button className="cf-icon-btn" onClick={onBack}>← 回厨房</button>
        <span className="t-name">📚 美食单词本</span>
        <span className="t-count">{collected.length}/{INGREDIENTS.length}</span>
      </div>
      <div className="cf-word-grid" style={{ marginTop: 12 }}>
        {INGREDIENTS.map((c) => {
          const got = collected.includes(c.id);
          return (
            <button key={c.id} className={`cf-word${got ? ' got' : ''}`}
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

// ---------- 主屏 ----------
function PlayScreen({ save, commit, onWords }) {
  const mountRef = useRef(null);
  const orderBubbleRef = useRef(null);
  const [bubble, setBubble] = useState(null);       // 单词气泡 {en,zh,id}
  const [recipeId, setRecipeId] = useState('burger');
  const [steps, setSteps] = useState(0);
  const [ready, setReady] = useState(false);
  const [serving, setServing] = useState(false);
  const [orderId, setOrderId] = useState(() => RECIPES[Math.floor(Math.random() * RECIPES.length)].id);
  const [review, setReview] = useState(null);       // {kind:'good'|'bad', praise?}
  const apiRef = useRef(null);
  const handlersRef = useRef(null);
  const bubbleTimer = useRef(null);

  const showBubble = useCallback((b) => {
    setBubble(b);
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    bubbleTimer.current = setTimeout(() => setBubble(null), 4000);
  }, []);

  // handlers 在 effect 闭包里调用，始终用最新引用
  handlersRef.current = {
    onCorrect(ing) {
      commit((s) => { if (!s.collected.includes(ing.id)) s.collected.push(ing.id); });
      speak(ing.en + '!');
      showBubble({ en: ing.en, zh: ing.zh, id: ing.id });
    },
    onSteps(n) { setSteps(n); },
    onReady() { setReady(true); },
    onServeStart() { setServing(true); setReady(false); },
    onReview(r) {
      setReview(r);
      if (r.kind === 'good') commit((s) => { s.stars += 5; });
    },
    onNewOrder(oid) {
      setOrderId(oid); setSteps(0); setReview(null);
      setServing(false); setReady(false);
    },
    onRedo() { setSteps(0); setReview(null); setServing(false); setReady(false); },
    onRecipe(id) {
      setRecipeId(id); setSteps(0); setReview(null);
      setServing(false); setReady(false);
    },
  };

  // ---- three.js 主循环 ----
  useEffect(() => {
    const mount = mountRef.current;
    let alive = true;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfff6ec);

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
    controls.minDistance = 4;
    controls.maxDistance = 16;
    controls.minPolarAngle = Math.PI * 0.15;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.enablePan = false;

    scene.add(new THREE.HemisphereLight(0xffffff, 0xffe0c0, 0.95));
    const sun = new THREE.DirectionalLight(0xffffff, 1.6);
    sun.position.set(2.5, 6, 4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -8; sun.shadow.camera.right = 8;
    sun.shadow.camera.top = 8; sun.shadow.camera.bottom = -8;
    scene.add(sun);

    scene.add(buildKitchen());

    // ---- 游戏状态（闭包内唯一真相） ----
    const S = {
      recipeId: 'burger',
      stepsDone: 0,
      phase: 'cooking', // cooking | serving | review
      orderId: null,
      custIdx: 0,
      praiseIdx: -1,
    };
    const orderRef = { id: null };

    const counterGroup = new THREE.Group();
    scene.add(counterGroup);
    const assemblyGroup = new THREE.Group();
    assemblyGroup.position.set(...ASSEMBLE_POS);
    scene.add(assemblyGroup);
    let customer = null;
    const flyAnims = [];    // {obj, from, to, t, dur, onDone}
    const shrinkAnims = []; // {obj, t, dur, removeFrom, onDone}
    let nextTimer = 0;

    const clearGroup = (g) => {
      const kids = [...g.children];
      for (const c of kids) { g.remove(c); disposeGroup(c); }
    };

    function spawnCustomer() {
      if (customer) { scene.remove(customer); disposeGroup(customer); customer = null; }
      const preset = KID_PRESETS[S.custIdx % KID_PRESETS.length];
      customer = buildKid(preset);
      customer.position.set(...CUSTOMER_POS);
      customer.rotation.y = 0;
      scene.add(customer);
    }

    function rebuildCounter() {
      clearGroup(counterGroup);
      const r = recipeOf(S.recipeId);
      r.steps.forEach((ingId, i) => {
        const g = buildIngredient(ingId);
        g.position.set(COUNTER_SLOTS[i], COUNTER_Y + 0.03, -2.6);
        g.userData.ingId = ingId;
        g.userData.slotX = COUNTER_SLOTS[i];
        counterGroup.add(g);
      });
    }
    function clearAssembly() { clearGroup(assemblyGroup); }

    function nextRound() {
      S.custIdx += 1;
      spawnCustomer();
      let oid = RECIPES[Math.floor(Math.random() * RECIPES.length)].id;
      if (oid === orderRef.id) oid = RECIPES[(RECIPES.findIndex((r) => r.id === oid) + 1) % RECIPES.length].id;
      orderRef.id = oid;
      S.orderId = oid;
      S.stepsDone = 0;
      S.phase = 'cooking';
      clearAssembly();
      rebuildCounter();
      if (alive) handlersRef.current.onNewOrder(oid);
    }

    function doReview() {
      const good = S.recipeId === orderRef.id;
      S.phase = 'review';
      if (good) {
        let pi;
        do { pi = Math.floor(Math.random() * PRAISE.length); } while (pi === S.praiseIdx);
        S.praiseIdx = pi;
        const praise = PRAISE[pi];
        speakSeq([praise]);
        if (customer) customer.userData.wave = 1.6;
        if (alive) handlersRef.current.onReview({ kind: 'good', praise });
        nextTimer = setTimeout(() => { if (alive) nextRound(); }, 3000);
      } else {
        speak('Hmm... not this.');
        if (customer) customer.userData.sadT = 1.6;
        if (alive) handlersRef.current.onReview({ kind: 'bad' });
      }
    }

    const tapIngredient = (id) => {
      if (S.phase !== 'cooking') return;
      const r = recipeOf(S.recipeId);
      const need = r.steps[S.stepsDone];
      const model = counterGroup.children.find((c) => c.userData.ingId === id);
      if (id === need && model) {
        handlersRef.current.onCorrect(ingOf(id));
        // 台面上的模型缩小消失
        shrinkAnims.push({ obj: model, t: 0, dur: 0.22, removeFrom: counterGroup });
        // 新层从槽位飞到组装盘
        const layer = assembleLayer(S.recipeId, S.stepsDone);
        const from = new THREE.Vector3(model.userData.slotX, COUNTER_Y + 0.5, -2.6);
        layer.position.copy(from);
        layer.scale.setScalar(0.01);
        scene.add(layer);
        flyAnims.push({
          obj: layer, from, to: new THREE.Vector3(...ASSEMBLE_POS), t: 0, dur: 0.55,
          onDone: () => {
            scene.remove(layer);
            layer.position.set(0, 0, 0);
            layer.scale.setScalar(1);
            assemblyGroup.add(layer);
          },
        });
        S.stepsDone += 1;
        handlersRef.current.onSteps(S.stepsDone);
        if (S.stepsDone >= 4) handlersRef.current.onReady();
      } else if (model) {
        model.userData.shake = 1;
        blip();
      }
    };

    const serve = () => {
      if (S.phase !== 'cooking' || S.stepsDone < 4) return;
      S.phase = 'serving';
      handlersRef.current.onServeStart();
      const dish = new THREE.Group();
      dish.position.set(...ASSEMBLE_POS);
      while (assemblyGroup.children.length) {
        const c = assemblyGroup.children[0];
        assemblyGroup.remove(c);
        dish.add(c);
      }
      scene.add(dish);
      flyAnims.push({
        obj: dish, from: dish.position.clone(), to: new THREE.Vector3(...SERVE_POS),
        t: 0, dur: 0.7,
        onDone: () => {
          shrinkAnims.push({
            obj: dish, t: 0, dur: 0.6,
            onDone: () => { scene.remove(dish); disposeGroup(dish); doReview(); },
          });
          if (customer) customer.userData.eatT = 0.7;
        },
      });
    };

    const redo = () => {
      if (S.phase !== 'review') return;
      S.stepsDone = 0;
      S.phase = 'cooking';
      clearAssembly();
      rebuildCounter();
      handlersRef.current.onRedo();
    };

    const setRecipe = (id) => {
      if (S.phase === 'serving') return;
      if (!recipeOf(id) || id === S.recipeId) return;
      S.recipeId = id;
      S.stepsDone = 0;
      S.phase = 'cooking';
      clearAssembly();
      rebuildCounter();
      handlersRef.current.onRecipe(id);
    };

    apiRef.current = {
      tapIngredient, serve, redo, setRecipe,
      resetCamera: () => {
        camera.position.set(...CAM_HOME.pos);
        controls.target.set(...CAM_HOME.tgt);
      },
    };

    // ---- 初始化：首单随机，顾客就位 ----
    {
      const oid = RECIPES[Math.floor(Math.random() * RECIPES.length)].id;
      orderRef.id = oid;
      S.orderId = oid;
      handlersRef.current.onNewOrder(oid);
    }
    spawnCustomer();
    rebuildCounter();

    // ---- 点按射线（点食材） ----
    const ray = new THREE.Raycaster();
    const ptr = new THREE.Vector2();
    let downPos = null;
    const el = renderer.domElement;
    const findIng = (o) => {
      let p = o;
      while (p) { if (p.userData && p.userData.ingId) return p.userData.ingId; p = p.parent; }
      return null;
    };
    const onDown = (e) => { downPos = [e.clientX, e.clientY]; };
    const onUp = (e) => {
      if (!downPos) return;
      const moved = Math.hypot(e.clientX - downPos[0], e.clientY - downPos[1]);
      downPos = null;
      if (moved > 8) return;
      const r = el.getBoundingClientRect();
      ptr.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      ptr.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      ray.setFromCamera(ptr, camera);
      const hits = ray.intersectObjects(counterGroup.children, true);
      if (hits.length) {
        const id = findIng(hits[0].object);
        if (id) tapIngredient(id);
      }
    };
    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);

    // ---- 尺寸 ----
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

    // ---- 订单气泡投影 ----
    const projV = new THREE.Vector3();
    const bubbleEl = () => orderBubbleRef.current;
    const placeBubble = () => {
      const b = bubbleEl();
      if (!b || !customer) return;
      projV.set(CUSTOMER_POS[0], 2.45, CUSTOMER_POS[2]).project(camera);
      const w = mount.clientWidth, h = mount.clientHeight;
      b.style.left = `${(projV.x * 0.5 + 0.5) * w}px`;
      b.style.top = `${(-projV.y * 0.5 + 0.5) * h}px`;
    };

    // ---- 主循环 ----
    const clock = new THREE.Clock();
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      controls.update();

      // 飞行动画
      for (let i = flyAnims.length - 1; i >= 0; i--) {
        const a = flyAnims[i];
        a.t += dt / a.dur;
        if (a.t >= 1) {
          a.obj.position.copy(a.to);
          a.obj.scale.setScalar(1);
          flyAnims.splice(i, 1);
          if (a.onDone) a.onDone();
        } else {
          const e = 1 - Math.pow(1 - a.t, 2);
          a.obj.position.lerpVectors(a.from, a.to, e);
          a.obj.position.y += Math.sin(a.t * Math.PI) * 1.1; // 抛物线
          a.obj.scale.setScalar(Math.max(0.01, Math.min(1, a.t * 2.5)));
        }
      }
      // 缩小动画
      for (let i = shrinkAnims.length - 1; i >= 0; i--) {
        const a = shrinkAnims[i];
        a.t += dt / a.dur;
        if (a.t >= 1) {
          if (a.removeFrom) { a.removeFrom.remove(a.obj); disposeGroup(a.obj); }
          shrinkAnims.splice(i, 1);
          if (a.onDone) a.onDone();
        } else {
          a.obj.scale.setScalar(Math.max(0.01, 1 - a.t));
        }
      }
      // 台面食材：下一步发光脉冲（缩放，不碰共享材质）+ 点错摇晃
      const needId = S.phase === 'cooking' && S.stepsDone < 4 ? recipeOf(S.recipeId).steps[S.stepsDone] : null;
      for (const m of counterGroup.children) {
        const u = m.userData;
        if (u.shake > 0) {
          u.shake = Math.max(0, u.shake - dt * 2.5);
          m.rotation.z = Math.sin(t * 28) * 0.16 * u.shake;
          if (u.shake === 0) m.rotation.z = 0;
        }
        const shrinking = shrinkAnims.some((a) => a.obj === m);
        if (!shrinking && !u.shake) {
          const s = (m.userData.ingId === needId) ? 1 + Math.sin(t * 6) * 0.08 : 1;
          m.scale.setScalar(s);
        }
      }
      // 顾客：待机摇摆 / 开心挥手 / 吃东西弹跳 / 摇头
      if (customer) {
        const u = customer.userData;
        if (u.wave > 0) {
          u.wave -= dt;
          u.armR.rotation.z = 2.5 + Math.sin(t * 16) * 0.45;
          u.armL.rotation.z = -0.12;
          customer.position.y = Math.abs(Math.sin(t * 10)) * 0.28;
          customer.rotation.z = 0;
          if (u.wave <= 0) { u.armR.rotation.z = 0.12; customer.position.y = 0; }
        } else if (u.eatT > 0) {
          u.eatT -= dt;
          customer.position.y = Math.abs(Math.sin(t * 14)) * 0.16;
          if (u.eatT <= 0) customer.position.y = 0;
        } else if (u.sadT > 0) {
          u.sadT -= dt;
          customer.rotation.y = Math.sin(t * 10) * 0.35 * Math.max(0, u.sadT);
          if (u.sadT <= 0) customer.rotation.y = 0;
        } else {
          customer.rotation.z = Math.sin(t * 2 + u.phase) * 0.05;
        }
      }

      placeBubble();
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      if (nextTimer) clearTimeout(nextTimer);
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

  const recipe = recipeOf(recipeId);
  const order = recipeOf(orderId);

  return (
    <div className="cf-play">
      <div className="cf-topbar">
        <span className="t-name">🍳 小小厨师</span>
        <span className="t-stars">⭐ {save.stars}</span>
        <button className="cf-icon-btn" onClick={onWords}>📚 单词本</button>
      </div>
      <div className="cf-stage" ref={mountRef}>
        {/* 订单/评价气泡（跟随顾客头顶） */}
        <div className="cf-order-bubble" ref={orderBubbleRef}>
          {!review && order && (
            <><span className="ob-want">想吃</span><span className="ob-emoji">{order.emoji}</span><span className="ob-name">{order.name}</span></>
          )}
          {review && review.kind === 'good' && (
            <><div className="ob-stars">⭐⭐⭐⭐⭐</div><div className="ob-praise">{review.praise}</div></>
          )}
          {review && review.kind === 'bad' && (
            <><div className="ob-stars">⭐⭐</div><div className="ob-praise">Hmm... not this.</div></>
          )}
        </div>
        {bubble && (
          <div className="cf-bubble">
            <div className="b-en">{bubble.en}!</div>
            <div className="b-zh">{bubble.zh} <button className="b-replay" onClick={() => speak(ingOf(bubble.id).en)}>🔊</button></div>
          </div>
        )}
        <div className="cf-hint">点台面上发光的食材 → 飞到盘子里 · 按顺序做哦</div>
        <div className="cf-stage-btns">
          <button className={`cf-serve${ready ? ' ready' : ''}`}
            disabled={!ready}
            onClick={() => apiRef.current && apiRef.current.serve()}>
            🛎️ 上菜
          </button>
          {review && review.kind === 'bad' && (
            <button className="cf-fab" onClick={() => apiRef.current && apiRef.current.redo()} title="重做">🔄</button>
          )}
          <button className="cf-fab" onClick={() => apiRef.current && apiRef.current.resetCamera()} title="重置视角">🎥</button>
        </div>
      </div>
      <div className="cf-tabs">
        {RECIPES.map((r) => (
          <button key={r.id}
            className={`cf-tab${recipeId === r.id ? ' active' : ''}`}
            onClick={() => apiRef.current && apiRef.current.setRecipe(r.id)}>
            <span className="e">{r.emoji}</span><span className="n">{r.name}</span>
          </button>
        ))}
      </div>
      <div className="cf-tray">
        {recipe.steps.map((id, i) => {
          const ing = ingOf(id);
          const done = i < steps;
          const next = i === steps && !serving;
          return (
            <button key={id}
              className={`cf-ing${done ? ' done' : ''}${next ? ' next' : ''}`}
              onClick={() => apiRef.current && apiRef.current.tapIngredient(id)}>
              <span className="e">{done ? '✅' : ing.emoji}</span>
              <span className="en">{ing.en}</span>
              {next && <span className="step-hint">👆</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- 入口 ----------
export default function ChefGame() {
  const [save, setSave] = useState(loadSave);
  const [screen, setScreen] = useState('play');
  const commit = useCallback((fn) => {
    setSave((s) => {
      const n = { ...s, collected: [...s.collected] };
      fn(n);
      persistSave(n);
      return n;
    });
  }, []);

  if (screen === 'words') {
    return <WordBook collected={save.collected} onBack={() => setScreen('play')} />;
  }
  return <PlayScreen save={save} commit={commit} onWords={() => setScreen('words')} />;
}
