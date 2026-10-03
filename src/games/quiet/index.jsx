// ============================================================
// index.jsx —— 安静书：7 岁女孩的英语单词贴纸书
// 四屏：主题选择 / 主题玩（拖贴纸+点读） / 找一找测验 / 单词本
// ============================================================
import { useState, useRef, useEffect, useCallback } from 'react';
import './quiet.css';
import { THEMES, ALL_WORDS, TOTAL_WORDS, unlockNeed, wordOf } from './themes.js';
import { STICKERS } from './stickers.jsx';
import { speak } from './speech.js';
import { loadSave, persistSave } from './storage.js';

const Sticker = ({ id, size = 56 }) => {
  const C = STICKERS[id];
  if (!C) return null;
  return <span className="q-sticker-svg" style={{ width: size, height: size }}><C /></span>;
};

// ---------- 每主题场景装饰（简单 SVG 形） ----------
function Decor({ themeId }) {
  switch (themeId) {
    case 'bedroom':
      return (<g>
        <rect x="8%" y="6%" width="18%" height="14%" rx="6" fill="#fff" opacity="0.7" />
        <circle cx="85%" cy="12%" r="4%" fill="#ffd93d" opacity="0.8" />
      </g>);
    case 'garden':
      return (<g>
        <ellipse cx="15%" cy="88%" rx="20%" ry="10%" fill="#8fd6a0" opacity="0.5" />
        <ellipse cx="85%" cy="90%" rx="22%" ry="9%" fill="#8fd6a0" opacity="0.5" />
        <circle cx="80%" cy="15%" r="5%" fill="#ffd93d" opacity="0.9" />
      </g>);
    case 'farm':
      return (<g><ellipse cx="50%" cy="95%" rx="45%" ry="12%" fill="#8fd6a0" opacity="0.45" /></g>);
    case 'beach':
      return (<g><ellipse cx="50%" cy="96%" rx="48%" ry="14%" fill="#f2d8a8" opacity="0.8" /></g>);
    case 'space':
      return (<g fill="#fff">
        <circle cx="10%" cy="12%" r="1.5" /><circle cx="30%" cy="8%" r="1" /><circle cx="55%" cy="15%" r="1.5" />
        <circle cx="75%" cy="10%" r="1" /><circle cx="90%" cy="25%" r="1.5" /><circle cx="20%" cy="35%" r="1" />
        <circle cx="65%" cy="40%" r="1.2" /><circle cx="85%" cy="50%" r="1" /><circle cx="45%" cy="30%" r="1" />
      </g>);
    default:
      return (<g>
        <circle cx="12%" cy="14%" r="4%" fill="#fff" opacity="0.6" />
        <circle cx="88%" cy="18%" r="3%" fill="#fff" opacity="0.6" />
      </g>);
  }
}

// ---------- 主题选择页 ----------
function ThemeSelect({ collected, onOpen, onWords }) {
  return (
    <div className="q-themes">
      <div className="q-themes-head">
        <h1 className="q-title">📖 安静书</h1>
        <p className="q-sub">贴贴纸，学单词！已收集 <b>{collected.length}</b> / {TOTAL_WORDS} 个单词</p>
        <button className="q-btn q-btn-words" onClick={onWords}>📚 单词本</button>
      </div>
      <div className="q-theme-grid">
        {THEMES.map((t, i) => {
          const need = unlockNeed(i);
          const locked = i > 0 && collected.length < need;
          return (
            <button
              key={t.id}
              className={`q-theme-card${locked ? ' locked' : ''}`}
              style={{ '--accent': t.accent }}
              onClick={() => !locked && onOpen(i)}
            >
              <span className="q-theme-emoji">{locked ? '🔒' : t.emoji}</span>
              <span className="q-theme-zh">{t.zh}</span>
              <span className="q-theme-en">{t.en}</span>
              {locked && <span className="q-lock-tip">还差 {need - collected.length} 个单词</span>}
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
    <div className="q-words">
      <div className="q-bar">
        <button className="q-btn" onClick={onBack}>← 主题</button>
        <h2 className="q-bar-title">📚 单词本 <span className="q-count">{collected.length}/{TOTAL_WORDS}</span></h2>
      </div>
      <div className="q-word-grid">
        {ALL_WORDS.map((w) => {
          const got = collected.includes(w.id);
          return (
            <button
              key={w.id}
              className={`q-word${got ? ' got' : ''}`}
              onClick={() => { if (got) speak(w.en); }}
            >
              <span className="q-word-sticker">{got ? <Sticker id={w.id} size={40} /> : '❔'}</span>
              <span className="q-word-en">{w.en}</span>
              <span className="q-word-zh">{w.zh}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- 主题玩：场景 + 贴纸栏（pointer 拖拽，兼容触屏） ----------
function PlayScreen({ theme, save, commit, onBack, onQuiz }) {
  const sceneRef = useRef(null);
  const placed = save.placed[theme.id] || [];
  const [bubble, setBubble] = useState(null); // { idx }
  const [drag, setDrag] = useState(null);
  const dragRef = useRef(null);

  const collect = useCallback((id) => {
    commit((s) => (s.collected.includes(id) ? s : { ...s, collected: [...s.collected, id] }));
  }, [commit]);

  const clampPct = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  const placeSticker = useCallback((id, x, y, andSpeak) => {
    commit((s) => ({
      ...s,
      placed: { ...s.placed, [theme.id]: [...(s.placed[theme.id] || []), { id, x: clampPct(x, 6, 90), y: clampPct(y, 8, 84) }] },
    }));
    if (andSpeak) {
      const w = wordOf(id);
      speak(w.en);
      collect(id);
    }
  }, [commit, theme.id, collect]);

  const movePlaced = useCallback((idx, x, y) => {
    commit((s) => {
      const list = [...(s.placed[theme.id] || [])];
      list[idx] = { ...list[idx], x: clampPct(x, 6, 90), y: clampPct(y, 8, 84) };
      return { ...s, placed: { ...s.placed, [theme.id]: list } };
    });
  }, [commit, theme.id]);

  const removePlaced = useCallback((idx) => {
    commit((s) => {
      const list = (s.placed[theme.id] || []).filter((_, i) => i !== idx);
      return { ...s, placed: { ...s.placed, [theme.id]: list } };
    });
    setBubble(null);
  }, [commit, theme.id]);

  const clearAll = useCallback(() => {
    commit((s) => ({ ...s, placed: { ...s.placed, [theme.id]: [] } }));
    setBubble(null);
  }, [commit, theme.id]);

  // 点物品：朗读 + 收集 + 气泡
  const tapItem = useCallback((idx) => {
    const p = (save.placed[theme.id] || [])[idx];
    if (!p) return;
    const w = wordOf(p.id);
    speak(w.en);
    collect(p.id);
    setBubble({ idx });
  }, [save, theme.id, collect]);

  const scenePoint = (clientX, clientY) => {
    const r = sceneRef.current.getBoundingClientRect();
    return {
      x: ((clientX - r.left) / r.width) * 100,
      y: ((clientY - r.top) / r.height) * 100,
      inside: clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom,
    };
  };

  const handleDrop = useCallback((d) => {
    if (d.fromTray) {
      if (!d.moved) {
        // 点一下贴纸：放到场景随机位置 + 朗读
        placeSticker(d.id, 15 + Math.random() * 70, 20 + Math.random() * 50, true);
      } else {
        const pt = scenePoint(d.x, d.y);
        if (pt.inside) placeSticker(d.id, pt.x, pt.y, true);
      }
    } else {
      if (!d.moved) {
        tapItem(d.idx);
      } else {
        const pt = scenePoint(d.x, d.y);
        if (pt.inside) movePlaced(d.idx, pt.x, pt.y);
      }
    }
  }, [placeSticker, movePlaced, tapItem]);

  const startDrag = (e, info) => {
    e.preventDefault();
    const d = { ...info, sx: e.clientX, sy: e.clientY, x: e.clientX, y: e.clientY, moved: false };
    dragRef.current = d;
    setDrag(d);
  };

  useEffect(() => {
    if (!drag) return;
    const onMove = (e) => {
      const d = dragRef.current;
      if (!d) return;
      if (Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 8) d.moved = true;
      d.x = e.clientX; d.y = e.clientY;
      setDrag({ ...d });
    };
    const onUp = () => {
      const d = dragRef.current;
      dragRef.current = null;
      setDrag(null);
      if (d) handleDrop(d);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [!!drag, handleDrop]); // eslint-disable-line react-hooks/exhaustive-deps

  const bubbleWord = bubble ? wordOf((save.placed[theme.id] || [])[bubble.idx]?.id || '') : null;
  const bubblePos = bubble ? (save.placed[theme.id] || [])[bubble.idx] : null;

  return (
    <div className="q-play">
      <div className="q-bar">
        <button className="q-btn" onClick={onBack}>← 主题</button>
        <h2 className="q-bar-title">{theme.emoji} {theme.zh} <span className="q-bar-en">{theme.en}</span></h2>
        <button className="q-btn q-btn-quiz" onClick={onQuiz}>🔍 找一找</button>
      </div>

      <div
        ref={sceneRef}
        className="q-scene"
        style={{ background: `linear-gradient(165deg, ${theme.bg[0]}, ${theme.bg[1]})` }}
      >
        <svg className="q-decor" viewBox="0 0 100 100" preserveAspectRatio="none">
          <Decor themeId={theme.id} />
        </svg>
        {placed.map((p, i) => (
          <span
            key={i}
            className="q-placed"
            style={{ left: p.x + '%', top: p.y + '%' }}
            onPointerDown={(e) => startDrag(e, { id: p.id, fromTray: false, idx: i })}
          >
            <Sticker id={p.id} size={54} />
          </span>
        ))}
        {bubble && bubbleWord && bubblePos && (
          <div className="q-bubble" style={{ left: bubblePos.x + '%', top: bubblePos.y + '%' }}>
            <div className="q-bubble-en">{bubbleWord.en}</div>
            <div className="q-bubble-zh">{bubbleWord.zh}</div>
            <div className="q-bubble-row">
              <button className="q-mini" onClick={() => speak(bubbleWord.en)}>🔊</button>
              <button className="q-mini" onClick={() => removePlaced(bubble.idx)}>❌</button>
            </div>
          </div>
        )}
        {placed.length === 0 && (
          <div className="q-scene-hint">把下面的贴纸拖上来布置吧 👆</div>
        )}
      </div>

      <div className="q-tray-wrap">
        <div className="q-tray">
          {theme.items.map((it) => (
            <span
              key={it.id}
              className="q-tray-item"
              onPointerDown={(e) => startDrag(e, { id: it.id, fromTray: true })}
            >
              <Sticker id={it.id} size={52} />
            </span>
          ))}
        </div>
        {placed.length > 0 && (
          <button className="q-btn q-btn-clear" onClick={clearAll}>🧹 全部收起来</button>
        )}
      </div>

      {drag && (
        <span className="q-ghost" style={{ left: drag.x, top: drag.y }}>
          <Sticker id={drag.id} size={60} />
        </span>
      )}
    </div>
  );
}

// ---------- 找一找测验：5 轮，听发音点贴纸 ----------
function buildRounds(theme) {
  const items = [...theme.items];
  const rounds = [];
  for (let r = 0; r < 5; r++) {
    const target = items[Math.floor(Math.random() * items.length)];
    const others = items.filter((i) => i.id !== target.id);
    for (let k = others.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1));
      [others[k], others[j]] = [others[j], others[k]];
    }
    const options = [target, ...others.slice(0, 3)];
    for (let k = options.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1));
      [options[k], options[j]] = [options[j], options[k]];
    }
    rounds.push({ target, options });
  }
  return rounds;
}

const PRAISE = ['Great!', 'Wonderful!', 'Amazing!', 'Super!', 'Excellent!'];

function QuizScreen({ theme, save, commit, onBack }) {
  const [rounds] = useState(() => buildRounds(theme));
  const [ri, setRi] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [wrongId, setWrongId] = useState(null);
  const [goodId, setGoodId] = useState(null);
  const timer = useRef(null);

  const round = rounds[ri];

  useEffect(() => {
    speak(rounds[0].target.en);
    return () => { if (timer.current) clearTimeout(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const replay = () => { if (!done) speak(round.target.en); };

  const finish = (finalScore) => {
    setDone(true);
    speak(finalScore === 5 ? 'Perfect! You are amazing!' : `You got ${finalScore} stars!`);
    commit((s) => ({
      ...s,
      stars: { ...s.stars, [theme.id]: Math.max(s.stars[theme.id] || 0, finalScore) },
    }));
  };

  const pick = (it) => {
    if (done || goodId) return;
    if (it.id === round.target.id) {
      const ns = score + 1;
      setScore(ns);
      setGoodId(it.id);
      speak(PRAISE[Math.floor(Math.random() * PRAISE.length)]);
      timer.current = setTimeout(() => {
        setGoodId(null);
        if (ri + 1 >= rounds.length) finish(ns);
        else {
          setRi(ri + 1);
          setTimeout(() => speak(rounds[ri + 1].target.en), 350);
        }
      }, 900);
    } else {
      setWrongId(it.id);
      speak('Try again!');
      timer.current = setTimeout(() => setWrongId(null), 700);
    }
  };

  const best = save.stars[theme.id] || 0;

  return (
    <div className="q-quiz">
      <div className="q-bar">
        <button className="q-btn" onClick={onBack}>← 返回</button>
        <h2 className="q-bar-title">🔍 找一找 <span className="q-count">{done ? '' : `${ri + 1}/5`}</span></h2>
        <span className="q-stars">⭐ {score}</span>
      </div>
      {!done ? (
        <>
          <div className="q-quiz-ask">
            <button className="q-replay" onClick={replay}>🔊</button>
            <p>听发音，点出对应的贴纸</p>
            <p className="q-quiz-zh">（{round.target.zh}）</p>
          </div>
          <div className="q-quiz-grid">
            {round.options.map((it) => (
              <button
                key={it.id}
                className={`q-quiz-opt${wrongId === it.id ? ' wrong' : ''}${goodId === it.id ? ' good' : ''}`}
                onClick={() => pick(it)}
              >
                <Sticker id={it.id} size={64} />
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="q-quiz-done">
          <div className="q-done-stars">{'⭐'.repeat(score)}{'☆'.repeat(5 - score)}</div>
          <h2>{score === 5 ? '太棒了，全对！🎉' : `真棒！答对 ${score} / 5`}</h2>
          <p className="q-sub">历史最佳：{Math.max(best, score)} / 5</p>
          <button className="q-btn q-btn-primary" onClick={onBack}>← 返回主题</button>
        </div>
      )}
    </div>
  );
}

// ---------- 根组件 ----------
export default function QuietBook() {
  const [save, setSave] = useState(() => loadSave());
  const [screen, setScreen] = useState('themes'); // themes | play | quiz | words
  const [themeIdx, setThemeIdx] = useState(0);

  const commit = useCallback((fn) => {
    setSave((prev) => {
      const next = fn(prev);
      persistSave(next);
      return next;
    });
  }, []);

  const theme = THEMES[themeIdx];

  return (
    <div className="q-root">
      {screen === 'themes' && (
        <ThemeSelect
          collected={save.collected}
          onOpen={(i) => { setThemeIdx(i); setScreen('play'); }}
          onWords={() => setScreen('words')}
        />
      )}
      {screen === 'play' && (
        <PlayScreen
          theme={theme}
          save={save}
          commit={commit}
          onBack={() => setScreen('themes')}
          onQuiz={() => setScreen('quiz')}
        />
      )}
      {screen === 'quiz' && (
        <QuizScreen
          theme={theme}
          save={save}
          commit={commit}
          onBack={() => setScreen('play')}
        />
      )}
      {screen === 'words' && (
        <WordBook collected={save.collected} onBack={() => setScreen('themes')} />
      )}
    </div>
  );
}
