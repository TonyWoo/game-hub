// ============================================================
// index.jsx —— 数学乐园 · 二年级 v2（视觉理解版）
// 流程：点卡快闪热身（3 张，不计星级）→ 8 道视觉题 → 结算星星
// 每一题的 3D 演示动画本身就是题目：动画播完才出选项，可"再看一遍"
// 第 9 关直接点 3D 模型作答；答错传递成长型思维，不惩罚
// 存档独立 key：math-save-v1（与 v1 结构兼容）
// ============================================================
import { useState, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import './math.css';
import { LEVELS, Q_PER_LEVEL, starsFor, genDots } from './levels.js';
import { buildStage, makeBurst, disposeGroup } from './props.js';
import { buildVisual } from './visuals.js';
import { loadSave, persistSave } from './storage.js';

const PRAISE = ['太棒了！', '答对啦！', '你真聪明！', '非常好！', '完美！'];
const GROWTH = [
  '大脑正在长大！再看看 3D 里发生了什么？',
  '错了也没关系，大脑正在长大！换个方法数一数～',
  '再仔细看看 3D 里发生了什么，你一定能发现！',
];

function speakZh(text) {
  try {
    const s = window.speechSynthesis;
    if (!s) return;
    s.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    u.rate = 0.95;
    u.pitch = 1.1;
    const v = s.getVoices().find((x) => x.lang && x.lang.toLowerCase().startsWith('zh'));
    if (v) u.voice = v;
    s.speak(u);
  } catch { /* 忽略 */ }
}

// ---------- 选关卡 ----------
function LevelSelect({ save, onPick }) {
  return (
    <div className="mth-levels">
      <h2 className="mth-title">🔢 数学乐园 · 二年级</h2>
      <p className="mth-sub">先看 3D 里发生了什么，再想答案！</p>
      <div className="mth-grid">
        {LEVELS.map((lv, i) => {
          const locked = i > save.unlocked;
          const stars = save.stars[lv.id] || 0;
          return (
            <button key={lv.id} className={`mth-card${locked ? ' locked' : ''}`}
              disabled={locked} onClick={() => onPick(i)}>
              <span className="mth-num">第 {i + 1} 关</span>
              <span className="mth-icon">{locked ? '🔒' : lv.icon}</span>
              <span className="mth-name">{lv.name}</span>
              <span className="mth-desc">{lv.desc}</span>
              <span className="mth-stars">{'★'.repeat(stars)}{'☆'.repeat(3 - stars)}</span>
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
  const [dots] = useState(() => genDots());
  const [questions] = useState(() => level.gen());
  const [phase, setPhase] = useState('dots'); // dots | quiz
  const [dotIdx, setDotIdx] = useState(0);
  const [qi, setQi] = useState(0);
  const [animDone, setAnimDone] = useState(false);
  const [picked, setPicked] = useState(null);
  const [wrongPick, setWrongPick] = useState(null);
  const [firstTry, setFirstTry] = useState(0);
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState(false);
  const [earned, setEarned] = useState(0);
  const [hint, setHint] = useState('');       // 成长型思维提示
  const [wrongAngle, setWrongAngle] = useState(-1); // 点错的角序号（抖动）

  const mountRef = useRef(null);
  const three = useRef(null);
  const animDoneRef = useRef(false);
  const stateRef = useRef({});
  stateRef.current = { phase, dotIdx, qi, picked, done, tried, firstTry, questions, dots };

  const curQ = phase === 'dots' ? dots[dotIdx] : questions[qi];
  const isTap = !!curQ?.isTap;

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

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const st = {
      renderer, scene, camera, mount,
      visual: null, animT: 0,
      bursts: [],
      raf: 0, clock: new THREE.Clock(),
      disposed: false,
    };

    const onTap = (e) => {
      const s = stateRef.current;
      if (s.phase !== 'quiz' || s.done || !st.visual || !st.visual.pickables) return;
      if (!animDoneRef.current) return;
      const rect = renderer.domElement.getBoundingClientRect();
      const cx = (e.touches ? e.touches[0].clientX : e.clientX);
      const cy = (e.touches ? e.touches[0].clientY : e.clientY);
      pointer.x = ((cx - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((cy - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(st.visual.pickables, false);
      if (hits.length > 0) handleAngleTapRef.current(hits[0].object.userData.angleIdx);
    };
    renderer.domElement.addEventListener('pointerdown', onTap);

    three.current = st;

    const tick = () => {
      if (st.disposed) return;
      const dt = Math.min(st.clock.getDelta(), 0.05);
      // 演示动画推进
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
      renderer.domElement.removeEventListener('pointerdown', onTap);
      if (st.visual) { scene.remove(st.visual.group); disposeGroup(st.visual.group); }
      st.bursts.forEach((b) => { scene.remove(b.points); b.dispose(); });
      scene.remove(stage); disposeGroup(stage);
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      three.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelIdx]);

  // ---------- 每题换视觉演示 ----------
  useEffect(() => {
    const st = three.current;
    if (!st) return;
    const s = stateRef.current;
    const q = s.phase === 'dots' ? s.dots[s.dotIdx] : s.questions[s.qi];
    if (!q) return;
    if (st.visual) { st.scene.remove(st.visual.group); disposeGroup(st.visual.group); }
    st.visual = buildVisual(q.visual);
    st.animT = 0;
    st.scene.add(st.visual.group);
    // 首帧先摆好初始态
    st.visual.update(0);
    animDoneRef.current = false;
    setAnimDone(false);
    setHint('');
    setWrongAngle(-1);
  }, [phase, dotIdx, qi, levelIdx]);

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

  // 答对后推进
  const advance = useCallback(() => {
    const s = stateRef.current;
    if (s.phase === 'dots') {
      if (s.dotIdx >= 2) {
        setPhase('quiz');
        setQi(0);
      } else {
        setDotIdx(s.dotIdx + 1);
      }
      setPicked(null); setTried(false); setWrongPick(null);
      return;
    }
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

  // 按钮作答
  const answer = (idx) => {
    const s = stateRef.current;
    if (s.picked !== null || s.done || !animDoneRef.current) return;
    const q = s.phase === 'dots' ? s.dots[s.dotIdx] : s.questions[s.qi];
    if (q.options[idx] === q.answer) {
      setPicked(idx);
      if (s.phase === 'quiz' && !s.tried) setFirstTry((n) => n + 1);
      praise();
      advance();
    } else {
      setWrongPick(idx);
      setTried(true);
      growth();
      setTimeout(() => setWrongPick(null), 600);
    }
  };

  // 第 9 关：点 3D 角作答
  const handleAngleTap = (angleIdx) => {
    const s = stateRef.current;
    if (s.picked !== null || s.done || !animDoneRef.current) return;
    const q = s.questions[s.qi];
    if (angleIdx === q.answer) {
      setPicked(angleIdx);
      if (!s.tried) setFirstTry((n) => n + 1);
      praise();
      advance();
    } else {
      setWrongAngle(angleIdx);
      setTried(true);
      growth();
      // 点错的角抖一下
      const st = three.current;
      const hit = st?.visual?.pickables?.find((o) => o.userData.angleIdx === angleIdx);
      if (hit?.userData.stand) {
        const stand = hit.userData.stand;
        const x0 = stand.position.x;
        let n = 0;
        const sh = setInterval(() => {
          stand.position.x = x0 + (n % 2 === 0 ? 0.18 : -0.18);
          if (++n > 5) { clearInterval(sh); stand.position.x = x0; }
        }, 70);
      }
      setTimeout(() => setWrongAngle(-1), 600);
    }
  };
  const handleAngleTapRef = useRef(handleAngleTap);
  handleAngleTapRef.current = handleAngleTap;

  const replay = () => {
    const st = three.current;
    if (!st?.visual) return;
    st.animT = 0;
    st.visual.update(0);
    animDoneRef.current = false;
    setAnimDone(false);
  };

  const qtext = phase === 'dots'
    ? '刚才你看到了几个点？你是怎么看到的？'
    : curQ.text;
  const prog = phase === 'dots'
    ? `热身 ${dotIdx + 1}/3`
    : `第 ${qi + 1}/${Q_PER_LEVEL} 题`;

  return (
    <div className="mth-play">
      <div className="mth-topbar">
        <button className="mth-icon-btn" onClick={onExit}>← 选关</button>
        <span className="mth-tname">{level.icon} {level.name}</span>
        <span className="mth-prog">{prog}</span>
      </div>
      <div className="mth-stage" ref={mountRef} />
      {!animDone && (
        <div className="mth-watch">
          <span>👀 先看 3D 里发生了什么…</span>
        </div>
      )}
      <div className="mth-qcard">{qtext}</div>
      {hint && <div className="mth-hint">💪 {hint}</div>}
      {isTap ? (
        <div className="mth-tapzone">
          <span className="mth-tap-hint">👆 直接点一点 3D 里你觉得对的那个角</span>
          <button className="mth-replay" onClick={replay}>🔁 再看一遍</button>
        </div>
      ) : (
        <>
          <div className="mth-opts">
            {curQ.options.map((op, i) => (
              <button key={i}
                className={`mth-opt${picked === i ? ' ok' : ''}${wrongPick === i ? ' no' : ''}`}
                disabled={picked !== null || !animDone}
                onClick={() => answer(i)}>
                {String(op)}
              </button>
            ))}
          </div>
          <div className="mth-replay-row">
            <button className="mth-replay" onClick={replay}>🔁 再看一遍</button>
          </div>
        </>
      )}
      {done && (
        <div className="mth-mask">
          <div className="mth-result">
            <div className="mth-rstars">{'★'.repeat(earned)}{'☆'.repeat(3 - earned)}</div>
            <p className="mth-rtext">
              {earned === 3 ? '🎉 全部答对，太厉害了！'
                : earned > 0 ? `过关啦！${levelIdx < LEVELS.length - 1 ? '下一关已解锁 🔓' : ''}`
                : '😅 没过关，再试一次吧！'}
            </p>
            <div className="mth-rbtns">
              <button className="mth-btn primary" onClick={onReplay}>🔄 再玩一次</button>
              <button className="mth-btn" onClick={onExit}>📋 选关卡</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- 游戏根 ----------
export default function MathGame() {
  const [save, setSave] = useState(() => loadSave());
  const [levelIdx, setLevelIdx] = useState(null);
  const [nonce, setNonce] = useState(0);

  return (
    <div className="mth-root">
      {levelIdx === null
        ? <LevelSelect save={save} onPick={setLevelIdx} />
        : <Quiz key={`${levelIdx}-${nonce}`} levelIdx={levelIdx} save={save} setSave={setSave}
            onExit={() => setLevelIdx(null)} onReplay={() => setNonce((n) => n + 1)} />}
    </div>
  );
}
