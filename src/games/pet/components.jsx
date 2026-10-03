// ============================================================
// components.jsx —— 通用 UI 组件：状态栏 / 食物选择器 / 单词测验
// ============================================================
import { useState, useMemo } from 'react';
import { WORDS, STAGES, QUIZ_QUESTIONS, sample, shuffle } from './data.js';
import { speak } from './speech.js';
import { sfxClick, sfxCorrect, sfxWrong } from './audio.js';

// ---------- 小条：属性进度条 ----------
function Bar({ icon, value, color }) {
  return (
    <div className="bar">
      <span className="bar-icon">{icon}</span>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

// ---------- 顶部状态栏：饱食度 / 心情 / 爱心成长 / 单词积分 ----------
// pet: 当前宠物；wordPoints: ⭐ 单词积分
export function StatusBar({ pet, wordPoints }) {
  const stage = STAGES[pet.stage];
  const next = STAGES[pet.stage + 1];
  const progress = next
    ? Math.min(100, ((pet.hearts - stage.need) / (next.need - stage.need)) * 100)
    : 100;
  return (
    <div className="status-card">
      <div className="status-top">
        <span className="stage-badge">{stage.name}</span>
        <span className="hearts">💗 {pet.hearts}</span>
        <span className="stars">⭐ {wordPoints || 0}</span>
      </div>
      <Bar icon="🍖" value={pet.fullness} color="#ffb347" />
      <Bar icon="😊" value={pet.mood} color="#ff8fb3" />
      <div className="grow-row">
        <span className="grow-label">🌱 成长</span>
        <div className="bar-track grow">
          <div className="bar-fill" style={{ width: `${progress}%`, background: '#7ed6a5' }} />
        </div>
        <span className="grow-next">{next ? `还差 ${next.need - pet.hearts} 💗 → ${next.name}` : '已满级！🎉'}</span>
      </div>
    </div>
  );
}

// ---------- 喂食弹窗：食物单词卡片 ----------
export function FoodPicker({ foods, favoriteId, onPick, onClose }) {
  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>🍽️ 选一样好吃的 <span className="modal-sub">📅 今日菜单 · 点 🔊 听发音</span></h3>
        <div className="food-grid">
          {(foods || []).map((f) => (
            <button
              key={f.id}
              className={'food-card' + (f.id === favoriteId ? ' favorite' : '')}
              onClick={() => { sfxClick(); onPick(f); }}
            >
              {f.id === favoriteId && <span className="fav-tag">最爱❤️</span>}
              <span className="food-emoji">{f.emoji}</span>
              <span className="food-en">{f.en}</span>
              <span className="food-zh">{f.zh}</span>
              <span
                className="speaker"
                role="button"
                aria-label={`朗读 ${f.en}`}
                onClick={(e) => { e.stopPropagation(); speak(f.en); }}
              >🔊</span>
            </button>
          ))}
        </div>
        <button className="btn btn-ghost" onClick={onClose}>先不喂了</button>
      </div>
    </div>
  );
}

// ---------- 单词小测验 ----------
// onDone(score): 测验结束回调，score 为答对题数
export function Quiz({ onDone, onQuit }) {
  // 随机抽 5 道题，每题随机题型
  const questions = useMemo(() => {
    return sample(WORDS, QUIZ_QUESTIONS).map((w) => {
      const type = Math.random() < 0.5 ? 'word' : 'pic'; // word: 看图选词；pic: 听音选图
      const options = shuffle([w, ...sample(WORDS.filter((x) => x.en !== w.en), 3)]);
      return { w, type, options };
    });
  }, []);

  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null); // 已选答案（锁定前）
  const [done, setDone] = useState(false);

  const q = questions[idx];

  const answer = (opt) => {
    if (picked) return; // 已作答，锁定
    const ok = opt.en === q.w.en;
    setPicked(opt.en);
    if (ok) { sfxCorrect(); setScore((s) => s + 1); }
    else { sfxWrong(); }
    speak(q.w.en);
    setTimeout(() => {
      if (idx + 1 >= questions.length) { setDone(true); onDone(score + (ok ? 1 : 0)); }
      else { setIdx(idx + 1); setPicked(null); }
    }, 1100);
  };

  if (done) return null;

  return (
    <div className="modal-mask">
      <div className="modal quiz">
        <div className="quiz-top">
          <span>📖 单词小测验</span>
          <span className="quiz-count">{idx + 1} / {questions.length}</span>
        </div>

        {q.type === 'word' ? (
          // 看图选词
          <div className="quiz-q">
            <div className="quiz-pic">{q.w.emoji}</div>
            <p className="quiz-hint">这个是 <b>{q.w.zh}</b>，英文怎么说？</p>
            <div className="quiz-opts">
              {q.options.map((o) => (
                <button
                  key={o.en}
                  className={'quiz-opt' + (picked ? (o.en === q.w.en ? ' right' : o.en === picked ? ' wrong' : '') : '')}
                  onClick={() => answer(o)}
                >{o.en}</button>
              ))}
            </div>
          </div>
        ) : (
          // 听音选图
          <div className="quiz-q">
            <button className="listen-btn" onClick={() => speak(q.w.en)}>🔊 点我听发音</button>
            <p className="quiz-hint">听到的是哪个？</p>
            <div className="quiz-opts pics">
              {q.options.map((o) => (
                <button
                  key={o.en}
                  className={'quiz-opt pic' + (picked ? (o.en === q.w.en ? ' right' : o.en === picked ? ' wrong' : '') : '')}
                  onClick={() => answer(o)}
                >
                  <span className="quiz-emoji">{o.emoji}</span>
                  <span className="quiz-zh">{o.zh}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <button className="btn btn-ghost" onClick={onQuit}>不玩了</button>
      </div>
    </div>
  );
}

// ---------- 升级庆祝弹窗 ----------
export function LevelUpModal({ stageName, onClose }) {
  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal levelup" onClick={(e) => e.stopPropagation()}>
        <div className="levelup-emoji">🎉</div>
        <h3>升级啦！</h3>
        <p>你的宠物长成了 <b>{stageName}</b>！</p>
        <button className="btn btn-primary" onClick={onClose}>太棒了！</button>
      </div>
    </div>
  );
}
