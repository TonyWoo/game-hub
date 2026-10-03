// ============================================================
// index.jsx —— 数学乐园 · 二年级（three.js 10 关闯关）
// 选关卡（顺序解锁）→ 答题（3D 教具 + HTML 题目/答案）→ 结算星星
// 存档独立 key：math-save-v1
// ============================================================
import { useState, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import './math.css';
import { LEVELS, Q_PER_LEVEL, starsFor } from './levels.js';
import { buildStage, buildProp, makeBurst, disposeGroup } from './props.js';
import { loadSave, persistSave } from './storage.js';

const PRAISE = ['太棒了！', '答对啦！', '你真聪明！', '非常好！', '完美！'];

// 中文夸奖 TTS（本地 zh-CN 语音）
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
      <p className="mth-sub">一关一关往前闯吧！</p>
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
  const [questions] = useState(() => level.gen());
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState(null);   // 选中的选项下标
  const [wrongPick, setWrongPick] = useState(null);
  const [firstTry, setFirstTry] = useState(0);   // 一次答对数
  const [tried, setTried] = useState(false);     // 本题是否已错过
  const [done, setDone] = useState(false);
  const [earned, setEarned] = useState(0);

  const mountRef = useRef(null);
  const chipRefs = useRef([]);
  const three = useRef(null);
  const qiRef = useRef(0);
  qiRef.current = qi;
  const questionsRef = useRef(questions);
  questionsRef.current = questions;

  // three 初始化（每关一次）
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
      propGroup: null, anchors: [],
      bursts: [],
      raf: 0, clock: new THREE.Clock(),
      disposed: false,
    };
    three.current = st;

    const projV = new THREE.Vector3();
    const tick = () => {
      if (st.disposed) return;
      const dt = Math.min(st.clock.getDelta(), 0.05);
      // 烟花更新
      for (let i = st.bursts.length - 1; i >= 0; i--) {
        if (!st.bursts[i].update(dt)) {
          scene.remove(st.bursts[i].points);
          st.bursts[i].dispose();
          st.bursts.splice(i, 1);
        }
      }
      renderer.render(scene, camera);
      // 角度题序号标签跟随
      const chips = chipRefs.current;
      st.anchors.forEach((a, i) => {
        const el = chips[i];
        if (!el || !a) return;
        a.obj.getWorldPosition(projV);
        projV.project(camera);
        const x = (projV.x * 0.5 + 0.5) * w;
        const y = (-projV.y * 0.5 + 0.5) * h;
        el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%,-50%)`;
      });
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
      if (st.propGroup) { scene.remove(st.propGroup); disposeGroup(st.propGroup); }
      st.bursts.forEach((b) => { scene.remove(b.points); b.dispose(); });
      scene.remove(stage); disposeGroup(stage);
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      three.current = null;
    };
  }, [levelIdx]);

  // 每题换教具
  useEffect(() => {
    const st = three.current;
    if (!st) return;
    const q = questionsRef.current[qiRef.current];
    if (!q) return;
    if (st.propGroup) { st.scene.remove(st.propGroup); disposeGroup(st.propGroup); }
    const { group, anchors } = buildProp(q.prop);
    st.propGroup = group;
    st.anchors = anchors || [];
    st.scene.add(group);
    // 重置序号标签
    chipRefs.current.forEach((el) => { if (el) el.style.transform = 'translate(-100px,-100px)'; });
  }, [qi, levelIdx]);

  const q = questions[qi];

  const answer = useCallback((idx) => {
    if (picked !== null || done) return;
    if (q.options[idx] === q.answer) {
      setPicked(idx);
      if (!tried) setFirstTry((n) => n + 1);
      const p = PRAISE[Math.floor(Math.random() * PRAISE.length)];
      speakZh(p);
      // 烟花
      const st = three.current;
      if (st) {
        const b = makeBurst(new THREE.Vector3(0, 3.2, 0));
        st.scene.add(b.points);
        st.bursts.push(b);
      }
      setTimeout(() => {
        if (qiRef.current >= Q_PER_LEVEL - 1) {
          const ft = firstTry + (tried ? 0 : 1);
          const stars = starsFor(ft);
          setEarned(stars);
          setDone(true);
          if (stars > 0) {
            const s = { ...saveRef.current };
            const prev = s.stars[level.id] || 0;
            s.stars[level.id] = Math.max(prev, stars);
            s.unlocked = Math.max(s.unlocked, Math.min(levelIdx + 1, LEVELS.length - 1));
            persistSave(s);
            setSave(s);
            speakZh(stars === 3 ? '全部答对，太厉害了！' : '过关啦！');
          } else {
            speakZh('没过关，再试一次吧！');
          }
        } else {
          setQi((n) => n + 1);
          setPicked(null);
          setTried(false);
          setWrongPick(null);
        }
      }, 1300);
    } else {
      setWrongPick(idx);
      setTried(true);
      speakZh('再想想～');
      setTimeout(() => setWrongPick(null), 600);
    }
  }, [picked, done, q, tried, firstTry, levelIdx, level.id]);

  const saveRef = useRef(save);
  saveRef.current = save;

  return (
    <div className="mth-play">
      <div className="mth-topbar">
        <button className="mth-icon-btn" onClick={onExit}>← 选关</button>
        <span className="mth-tname">{level.icon} {level.name}</span>
        <span className="mth-prog">第 {qi + 1}/{Q_PER_LEVEL} 题</span>
      </div>
      <div className="mth-stage" ref={mountRef}>
        {[0, 1, 2].map((i) => (
          <span key={i} ref={(el) => { chipRefs.current[i] = el; }}
            className="mth-chip" style={{ transform: 'translate(-100px,-100px)' }}>{i + 1}</span>
        ))}
      </div>
      <div className="mth-qcard">{q.text}</div>
      <div className="mth-opts">
        {q.options.map((op, i) => (
          <button key={i}
            className={`mth-opt${picked === i ? ' ok' : ''}${wrongPick === i ? ' no' : ''}`}
            disabled={picked !== null}
            onClick={() => answer(i)}>
            {String(op)}
          </button>
        ))}
      </div>
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
  const [nonce, setNonce] = useState(0); // 再玩一次：强制重挂载刷新题目

  return (
    <div className="mth-root">
      {levelIdx === null
        ? <LevelSelect save={save} onPick={setLevelIdx} />
        : <Quiz key={`${levelIdx}-${nonce}`} levelIdx={levelIdx} save={save} setSave={setSave}
            onExit={() => setLevelIdx(null)} onReplay={() => setNonce((n) => n + 1)} />}
    </div>
  );
}
