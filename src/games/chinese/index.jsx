// ============================================================
// index.jsx —— 语文乐园 · 二年级
// 流程：选关 → 8 道题（每题 TTS 自动朗读 + 🔊 重听）→ 结算星星
// 3D 场景是题目的舞台；汉字用 textSprite 显示
// 存档独立 key：chinese-save-v1
// ============================================================
import { useState, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import './chinese.css';
import { LEVELS, Q_PER_LEVEL, starsFor } from './levels.js';
import { buildStage, makeBurst, disposeGroup } from '../math/props.js';
import { buildVisual } from './visuals.js';
import { loadSave, persistSave } from './storage.js';

const PRAISE = ['太棒了！', '答对啦！', '你真聪明！', '非常好！', '完美！'];
const GROWTH = [
  '大脑正在长大！再读一遍题目想一想～',
  '错了也没关系，大脑正在长大！换个角度想想～',
  '再仔细读一读，你一定能发现！',
];

function speakZh(text) {
  try {
    const s = window.speechSynthesis;
    if (!s || !text) return;
    s.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    u.rate = 0.92;
    u.pitch = 1.1;
    const v = s.getVoices().find((x) => x.lang && x.lang.toLowerCase().startsWith('zh'));
    if (v) u.voice = v;
    s.speak(u);
  } catch { /* 忽略 */ }
}

// ---------- 选关卡 ----------
function LevelSelect({ save, onPick }) {
  return (
    <div className="ch-levels">
      <h2 className="ch-title">📖 语文乐园 · 二年级</h2>
      <p className="ch-sub">听一听、读一读，汉字真有趣！</p>
      <div className="ch-grid">
        {LEVELS.map((lv, i) => {
          const locked = i > save.unlocked;
          const stars = save.stars[lv.id] || 0;
          return (
            <button key={lv.id} className={`ch-card${locked ? ' locked' : ''}`}
              disabled={locked} onClick={() => onPick(i)}>
              <span className="ch-num">第 {i + 1} 关</span>
              <span className="ch-icon">{locked ? '🔒' : lv.icon}</span>
              <span className="ch-name">{lv.name}</span>
              <span className="ch-desc">{lv.desc}</span>
              <span className="ch-stars">{'★'.repeat(stars)}{'☆'.repeat(3 - stars)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- 答题页 ----------
function Quiz({ levelIdx, save, setSave, onExit, onReplay }) {
  const level = LEVELS[levelIdx];
  const [questions] = useState(() => level.gen());
  const [qi, setQi] = useState(0);
  const [animDone, setAnimDone] = useState(false);
  const [picked, setPicked] = useState(null);
  const [wrongPick, setWrongPick] = useState(null);
  const [firstTry, setFirstTry] = useState(0);
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState(false);
  const [earned, setEarned] = useState(0);
  const [hint, setHint] = useState('');

  const mountRef = useRef(null);
  const three = useRef(null);
  const animDoneRef = useRef(false);
  const stateRef = useRef({});
  stateRef.current = { qi, picked, done, tried, firstTry, questions };

  const curQ = questions[qi];

  // ---------- three 初始化（每关一次） ----------
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const w = mount.clientWidth, h = mount.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
    camera.position.set(0, 7.6, 11.5);
    camera.lookAt(0, 1.4, 0);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xffd9ec, 0.95));
    const sun = new THREE.DirectionalLight(0xffffff, 1.6);
    sun.position.set(6, 10, 7);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -9; sun.shadow.camera.right = 9;
    sun.shadow.camera.top = 9; sun.shadow.camera.bottom = -9;
    scene.add(sun);

    const stage = buildStage();
    scene.add(stage);

    const st = {
      renderer, scene, camera, mount,
      visual: null, animT: 0,
      bursts: [],
      raf: 0, clock: new THREE.Clock(),
      disposed: false,
    };
    three.current = st;

    const tick = () => {
      if (st.disposed) return;
      const dt = Math.min(st.clock.getDelta(), 0.05);
      if (st.visual && st.animT < st.visual.dur) {
        st.animT = Math.min(st.visual.dur, st.animT + dt);
        st.visual.update(st.animT / st.visual.dur);
        if (st.animT >= st.visual.dur && !animDoneRef.current) {
          animDoneRef.current = true;
          setAnimDone(true);
        }
      }
      for (let i = st.bursts.length - 1; i >= 0; i--) {
        if (!st.bursts[i].update(dt)) {
          scene.remove(st.bursts[i].points);
          st.bursts[i].dispose();
          st.bursts.splice(i, 1);
        }
      }
      renderer.render(scene, camera);
      st.raf = requestAnimationFrame(tick);
    };
    tick();

    const onResize = () => {
      const nw = mount.clientWidth, nh = mount.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    return () => {
      st.disposed = true;
      cancelAnimationFrame(st.raf);
      window.removeEventListener('resize', onResize);
      if (st.visual) { scene.remove(st.visual.group); disposeGroup(st.visual.group); }
      st.bursts.forEach((b) => { scene.remove(b.points); b.dispose(); });
      scene.remove(stage); disposeGroup(stage);
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      three.current = null;
      try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch { /* 忽略 */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelIdx]);

  // ---------- 每题换 3D 舞台 + 自动朗读 ----------
  useEffect(() => {
    const st = three.current;
    if (!st) return;
    const s = stateRef.current;
    const q = s.questions[s.qi];
    if (!q) return;
    if (st.visual) { st.scene.remove(st.visual.group); disposeGroup(st.visual.group); }
    st.visual = buildVisual(q.visual);
    st.animT = 0;
    st.scene.add(st.visual.group);
    st.visual.update(0);
    animDoneRef.current = false;
    setAnimDone(false);
    setHint('');
    // 每题自动朗读一遍
    const t = setTimeout(() => speakZh(q.speak || q.text), 400);
    return () => clearTimeout(t);
  }, [qi, levelIdx]);

  const burstAt = () => {
    const st = three.current;
    if (!st) return;
    const b = makeBurst(new THREE.Vector3(0, 3.4, 0));
    st.scene.add(b.points);
    st.bursts.push(b);
  };

  const praise = () => {
    const p = PRAISE[Math.floor(Math.random() * PRAISE.length)];
    speakZh(p);
    burstAt();
  };

  const growth = () => {
    const g = GROWTH[Math.floor(Math.random() * GROWTH.length)];
    setHint(g);
    speakZh(g);
    setTimeout(() => setHint(''), 3500);
  };

  const advance = useCallback(() => {
    setTimeout(() => {
      const s2 = stateRef.current;
      if (s2.qi >= Q_PER_LEVEL - 1) {
        const ft = s2.firstTry + (s2.tried ? 0 : 1);
        const stars = starsFor(ft);
        setEarned(stars);
        setDone(true);
        if (stars > 0) {
          const sv = { ...saveRef.current };
          const prev = sv.stars[level.id] || 0;
          sv.stars[level.id] = Math.max(prev, stars);
          sv.unlocked = Math.max(sv.unlocked, Math.min(levelIdx + 1, LEVELS.length - 1));
          persistSave(sv);
          setSave(sv);
          speakZh(stars === 3 ? '全部答对，太厉害了！' : '过关啦！');
        } else {
          speakZh('没过关，再试一次吧！');
        }
      } else {
        setQi(s2.qi + 1);
        setPicked(null); setTried(false); setWrongPick(null);
      }
    }, 1300);
  }, [levelIdx, level.id]);

  const saveRef = useRef(save);
  saveRef.current = save;

  const answer = (idx) => {
    const s = stateRef.current;
    if (s.picked !== null || s.done || !animDoneRef.current) return;
    const q = s.questions[s.qi];
    if (q.options[idx] === q.answer) {
      setPicked(idx);
      if (!s.tried) setFirstTry((n) => n + 1);
      praise();
      advance();
    } else {
      setWrongPick(idx);
      setTried(true);
      growth();
      setTimeout(() => setWrongPick(null), 600);
    }
  };

  const replay = () => {
    const st = three.current;
    if (!st?.visual) return;
    st.animT = 0;
    st.visual.update(0);
    animDoneRef.current = false;
    setAnimDone(false);
  };

  const replaySpeak = () => speakZh(curQ.speak || curQ.text);

  return (
    <div className="ch-play">
      <div className="ch-topbar">
        <button className="ch-icon-btn" onClick={onExit}>← 选关</button>
        <span className="ch-tname">{level.icon} {level.name}</span>
        <span className="ch-prog">第 {qi + 1}/{Q_PER_LEVEL} 题</span>
      </div>
      <div className="ch-stage" ref={mountRef} />
      {!animDone && (
        <div className="ch-watch">
          <span>👀 看看 3D 舞台…</span>
        </div>
      )}
      <div className="ch-qcard">{curQ.text}</div>
      {hint && <div className="ch-hint">💪 {hint}</div>}
      <div className="ch-opts">
        {curQ.options.map((op, i) => (
          <button key={i}
            className={`ch-opt${picked === i ? ' ok' : ''}${wrongPick === i ? ' no' : ''}`}
            disabled={picked !== null || !animDone}
            onClick={() => answer(i)}>
            {String(op)}
          </button>
        ))}
      </div>
      <div className="ch-replay-row">
        <button className="ch-replay" onClick={replaySpeak}>🔊 再听一遍</button>
        <button className="ch-replay" onClick={replay}>🔁 再看一遍</button>
      </div>
      {done && (
        <div className="ch-mask">
          <div className="ch-result">
            <div className="ch-rstars">{'★'.repeat(earned)}{'☆'.repeat(3 - earned)}</div>
            <p className="ch-rtext">
              {earned === 3 ? '🎉 全部答对，太厉害了！'
                : earned > 0 ? `过关啦！${levelIdx < LEVELS.length - 1 ? '下一关已解锁 🔓' : ''}`
                : '😅 没过关，再试一次吧！'}
            </p>
            <div className="ch-rbtns">
              <button className="ch-btn primary" onClick={onReplay}>🔄 再玩一次</button>
              <button className="ch-btn" onClick={onExit}>📋 选关卡</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- 游戏根 ----------
export default function ChineseGame() {
  const [save, setSave] = useState(() => loadSave());
  const [levelIdx, setLevelIdx] = useState(null);
  const [nonce, setNonce] = useState(0);

  return (
    <div className="ch-root">
      {levelIdx === null
        ? <LevelSelect save={save} onPick={setLevelIdx} />
        : <Quiz key={`${levelIdx}-${nonce}`} levelIdx={levelIdx} save={save} setSave={setSave}
            onExit={() => setLevelIdx(null)} onReplay={() => setNonce((n) => n + 1)} />}
    </div>
  );
}
