import './pet.css';
// ============================================================
// App.jsx —— 游戏主流程
// 领养页 → 主页（喂食 / 6 种互动 / 单词测验 / 宠物小屋）
// 互动要花 ⭐ 单词积分（测验答对 +2/题、喂食 +1 赚取）
// 状态更新走 commit()：深拷贝 → 改 → 落盘 → setState，全同步，无时序坑
// ============================================================
import { useState, useRef, useEffect, useMemo } from 'react';
import { PETS, PET_ORDER, FOODS, STAGES, UNLOCK_NEED, QUIZ_QUESTIONS, PLAY_MINUTES, REST_MINUTES, dailyFoods, todayStr } from './data.js';
import { loadSave, persistSave, newPet, activePet, totalHearts, addHearts, clamp } from './storage.js';
import { PetAvatar } from './pets.jsx';
import { StatusBar, FoodPicker, Quiz, LevelUpModal } from './components.jsx';
import { speak } from './speech.js';
import { sfxClick, sfxEat, sfxHappy, sfxLevelUp, sfxBubble, sfxSing, sfxDance, sfxStory } from './audio.js';

// 互动对应的英文单词（边玩边学）
const PLAY_WORDS = { pet: 'Pet', ball: 'Ball', bath: 'Bath', sing: 'Sing', dance: 'Dance', story: 'Story' };
const PLAY_ZH = { pet: '抚摸', ball: '玩球', bath: '洗澡', sing: '唱歌', dance: '跳舞', story: '讲故事' };
const PLAY_ZH2 = { pet: '抚摸', ball: '球', bath: '洗澡', sing: '唱歌', dance: '舞', story: '故事' };
const PLAY_EMOJI = { pet: '🤗', ball: '⚽', bath: '🫧', sing: '🎤', dance: '💃', story: '📖' };
// 每次互动花费的 ⭐ 单词积分
const PLAY_COST = { pet: 2, ball: 3, bath: 3, sing: 4, dance: 4, story: 5 };
// 每次互动加的心情值
const PLAY_MOOD = { pet: 12, ball: 15, bath: 10, sing: 12, dance: 14, story: 10 };

// ---------------- 领养页 ----------------
// fixedType: 解锁领养时直接指定类型（跳过选择）；onCancel: 解锁流程可返回
function AdoptScreen({ ownedTypes, fixedType, onAdopt, onCancel }) {
  const firstChoice = fixedType || PET_ORDER.find((t) => !ownedTypes.includes(t)) || 'bunny';
  const [type, setType] = useState(firstChoice);
  const [name, setName] = useState('');
  const choices = fixedType ? [fixedType] : PET_ORDER.filter((t) => !ownedTypes.includes(t));

  return (
    <div className="screen adopt">
      <h1 className="game-title">🐾 宠物喂养乐园</h1>
      <p className="subtitle">{ownedTypes.length === 0 ? '选一只小可爱带回家吧！' : '再领养一只小可爱吧！'}</p>
      <div className="adopt-cards">
        {choices.map((t) => {
          const cfg = PETS[t];
          const favFood = FOODS.find((f) => f.id === cfg.favoriteFood);
          return (
            <button
              key={t}
              className={'adopt-card' + (type === t ? ' selected' : '')}
              onClick={() => { sfxClick(); setType(t); }}
            >
              <PetAvatar type={t} stage={1} face="happy" className="adopt-pet" />
              <div className="adopt-name">{cfg.name}</div>
              <div className="adopt-desc">{cfg.personality}</div>
              <div className="adopt-fav">最爱：{favFood.emoji} {favFood.zh}</div>
            </button>
          );
        })}
      </div>
      <div className="name-row">
        <label>给它起个名字：</label>
        <input
          value={name}
          maxLength={8}
          placeholder={`比如：${PETS[type].name}乖乖`}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <button
        className="btn btn-primary btn-big"
        onClick={() => { sfxHappy(); onAdopt(type, name.trim() || `${PETS[type].name}乖乖`); }}
      >
        🎀 带{PETS[type].name}回家
      </button>
      {onCancel && <button className="btn btn-ghost" onClick={onCancel}>先不领养</button>}
    </div>
  );
}

// ---------------- 宠物小屋（切换 / 解锁） ----------------
function PetHouse({ save, onSwitch, onUnlock, onClose }) {
  const owned = save.pets.map((p) => p.type);
  const locked = PET_ORDER.filter((t) => !owned.includes(t));
  const total = totalHearts(save);
  const nextNeed = UNLOCK_NEED[save.pets.length]; // 解锁下一只需要的总爱心
  const canUnlock = locked.length > 0 && total >= nextNeed;

  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>🏠 宠物小屋</h3>
        <div className="house-list">
          {save.pets.map((p) => (
            <button
              key={p.id}
              className={'house-card' + (p.id === save.activePetId ? ' active' : '')}
              onClick={() => { sfxClick(); onSwitch(p.id); }}
            >
              <PetAvatar type={p.type} stage={p.stage} className="house-pet" />
              <div className="house-name">{p.name}</div>
              <div className="house-stage">{STAGES[p.stage].name} · 💗{p.hearts}</div>
              {p.id === save.activePetId && <span className="house-tag">出场中</span>}
            </button>
          ))}
          {locked.map((t) => (
            <div key={t} className="house-card locked">
              <div className="house-lock">🔒</div>
              <div className="house-name">{PETS[t].name}</div>
              <div className="house-stage">
                {canUnlock ? '可以领养啦！' : `总爱心满 ${nextNeed} 解锁（${total}/${nextNeed}）`}
              </div>
              {canUnlock && (
                <button className="btn btn-primary btn-small" onClick={() => onUnlock(t)}>
                  领养{PETS[t].name}
                </button>
              )}
            </div>
          ))}
        </div>
        <button className="btn btn-ghost" onClick={onClose}>关闭</button>
      </div>
    </div>
  );
}

// 秒数 → mm:ss
function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ---------------- 休息遮罩：玩满 30 分钟后锁定 15 分钟 ----------------
function RestOverlay({ save, now }) {
  const left = Math.max(0, Math.ceil((save.restUntil - now) / 1000));
  const pet = activePet(save);
  return (
    <div className="rest-mask">
      <div className="rest-card">
        <div className="rest-pet">
          <PetAvatar type={pet.type} stage={pet.stage} face="sleepy" className="pet" />
          <span className="sleep-z big">💤</span>
        </div>
        <h2>💤 {pet.name}睡着啦</h2>
        <p className="rest-text">
          已经玩了 {PLAY_MINUTES} 分钟啦<br />
          让眼睛休息一下，{fmtTime(left)} 后再回来玩吧～
        </p>
        <div className="rest-count">{fmtTime(left)}</div>
        <p className="rest-tip">💡 休息时也可以看看窗外、喝口水哦！</p>
      </div>
    </div>
  );
}

// ---------------- 主页 ----------------
function HomeScreen({ save, commit, onUnlockRequest, now, woke, clearWoke }) {
  const pet = activePet(save);
  const cfg = PETS[pet.type];
  const [showFood, setShowFood] = useState(false);
  // 每日菜单：按日期从 12 种食物里选 6 种，必含当前宠物的最爱
  const menuFoods = useMemo(() => dailyFoods(todayStr(), cfg.favoriteFood), [cfg.favoriteFood]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showHouse, setShowHouse] = useState(false);
  const [levelUp, setLevelUp] = useState(null);   // 升级弹窗：新阶段名
  const [toast, setToast] = useState('');
  const [anim, setAnim] = useState('');           // happy | eat | jump | bath
  const [floats, setFloats] = useState([]);       // 飘爱心
  const [bubbles, setBubbles] = useState([]);     // 洗澡泡泡
  const [showBall, setShowBall] = useState(false);// 玩球动画
  const timer = useRef(null);

  // 小提示条，2.5 秒自动消失
  const say = (msg) => {
    setToast(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(''), 2600);
  };

  // 飘一个爱心/文字
  const float = (text) => {
    const id = Date.now() + Math.random();
    setFloats((f) => [...f, { id, text }]);
    setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), 1300);
  };

  // 短暂播放宠物动作动画
  const playAnim = (name, ms = 1300) => {
    setAnim(name);
    setTimeout(() => setAnim(''), ms);
  };

  // 休息结束：弹一次"回来玩吧"提示
  useEffect(() => {
    if (woke) {
      const p = activePet(save);
      say(`☀️ 休息好啦！${p ? p.name : '小可爱'}醒啦，快回来玩吧！`);
      clearWoke();
    }
  }, [woke]);

  // ---- 喂食 ----
  const feed = (food) => {
    setShowFood(false);
    if (pet.fullness >= 95) {
      say('吃太饱啦，玩一会儿、消化消化再喂吧！');
      return;
    }
    const fav = cfg.favoriteFood === food.id;
    const { newStageName } = commit((s) => {
      const p = activePet(s);
      p.fullness = clamp(p.fullness + 25);
      p.mood = clamp(p.mood + 5);
      s.wordPoints = (s.wordPoints || 0) + 1; // 学了食物单词，+1⭐
      let name = '';
      if (addHearts(p, fav ? 3 : 2)) name = STAGES[p.stage].name;
      if (!s.learnedWords.includes(food.en)) s.learnedWords.push(food.en);
      return { newStageName: name };
    });
    sfxEat();
    speak(food.en);
    playAnim('eat');
    float(fav ? '+3💗 最爱！' : '+2💗');
    float('+1⭐');
    say(fav ? `${pet.name}最爱吃${food.zh}啦！${food.en}！` : `啊呜，真好吃！${food.en} ${food.zh}`);
    if (newStageName) setTimeout(() => { sfxLevelUp(); setLevelUp(newStageName); }, 900);
  };

  // ---- 互动：抚摸 / 玩球 / 洗澡 / 唱歌 / 跳舞 / 讲故事 ----
  // 每次互动消耗 ⭐ 单词积分，积分不够先去学单词
  const play = (kind) => {
    const cost = PLAY_COST[kind];
    if ((save.wordPoints || 0) < cost) {
      sfxClick();
      say('⭐ 不够啦，先去学单词赚积分吧！');
      return;
    }
    const word = PLAY_WORDS[kind];
    const { newStageName } = commit((s) => {
      const p = activePet(s);
      s.wordPoints = (s.wordPoints || 0) - cost;
      p.mood = clamp(p.mood + PLAY_MOOD[kind]);
      let name = '';
      if (addHearts(p, 1)) name = STAGES[p.stage].name;
      if (!s.learnedWords.includes(word)) s.learnedWords.push(word);
      return { newStageName: name };
    });
    speak(word); // 每种互动都教一个英文单词
    if (kind === 'pet') { sfxHappy(); playAnim('happy'); }
    if (kind === 'ball') {
      sfxHappy(); playAnim('jump');
      setShowBall(true);
      setTimeout(() => setShowBall(false), 1200);
    }
    if (kind === 'bath') {
      sfxBubble(); playAnim('bath');
      const id = Date.now();
      setBubbles(Array.from({ length: 8 }, (_, i) => ({ id: id + i, left: 12 + i * 10 })));
      setTimeout(() => setBubbles([]), 1400);
    }
    if (kind === 'sing') {
      sfxSing(); playAnim('sing');
      float('🎵');
      setTimeout(() => float('🎶'), 350);
    }
    if (kind === 'dance') { sfxDance(); playAnim('dance'); }
    if (kind === 'story') {
      sfxStory(); playAnim('story');
      float('📖');
    }
    float('+1💗');
    float(word);
    say(`${PLAY_ZH[kind]}！${word}（${PLAY_ZH2[kind]}）`);
    if (newStageName) setTimeout(() => { sfxLevelUp(); setLevelUp(newStageName); }, 900);
  };

  // ---- 测验完成 ----
  const onQuizDone = (score) => {
    setShowQuiz(false);
    const starGain = score * 2; // 答对 +2⭐/题
    const { gained, newStageName } = commit((s) => {
      const p = activePet(s);
      const g = score * 2 + (score === QUIZ_QUESTIONS ? 3 : 0);
      s.wordPoints = (s.wordPoints || 0) + starGain;
      let name = '';
      if (addHearts(p, g)) name = STAGES[p.stage].name;
      p.mood = clamp(p.mood + 10);
      return { gained: g, newStageName: name };
    });
    sfxHappy();
    playAnim('happy');
    float(`+${gained}💗`);
    if (starGain > 0) float(`+${starGain}⭐`);
    say(score === QUIZ_QUESTIONS
      ? `全对！太厉害了！+${gained}💗 +${starGain}⭐`
      : `答对 ${score} 题！+${gained}💗${starGain > 0 ? ` +${starGain}⭐` : ''} 继续加油！`);
    if (newStageName) setTimeout(() => { sfxLevelUp(); setLevelUp(newStageName); }, 900);
  };

  const resting = save.restUntil > Date.now();
  const happyAnims = ['happy', 'jump', 'sing', 'dance', 'story'];
  const face = happyAnims.includes(anim) ? 'happy' : resting ? 'sleepy' : 'normal';

  return (
    <div className="screen home">
      <header className="topbar">
        <h1 className="game-title small">🐾 宠物喂养乐园</h1>
        <button className="btn btn-ghost btn-small" onClick={() => { sfxClick(); setShowHouse(true); }}>🏠 宠物小屋</button>
      </header>

      <StatusBar pet={pet} wordPoints={save.wordPoints} />

      {/* 本轮游玩时间 */}
      <div className="timebar">
        <span>⏱️ 本轮已玩 {fmtTime(save.playSec)} / {PLAY_MINUTES}:00</span>
        <div className="timebar-track">
          <div
            className="timebar-fill"
            style={{ width: `${Math.min(100, (save.playSec / (PLAY_MINUTES * 60)) * 100)}%` }}
          />
        </div>
      </div>

      {/* 宠物舞台 */}
      <div className="stage">
        <div className={`pet-wrap anim-${anim}`}>
          <PetAvatar type={pet.type} stage={pet.stage} face={face} className="pet" />
          {resting && <span className="sleep-z">💤</span>}
          {showBall && <span className="ball">⚽</span>}
          {bubbles.map((b) => (
            <span key={b.id} className="bubble" style={{ left: `${b.left}%` }}>🫧</span>
          ))}
          {floats.map((f) => (
            <span key={f.id} className="float-up">{f.text}</span>
          ))}
        </div>
        <div className="pet-name">{pet.name} <span className="pet-type">({cfg.name} · {STAGES[pet.stage].name})</span></div>
        {/* 点宠物 = 抚摸 */}
        <button className="pet-click-hint" onClick={() => play('pet')} aria-label="抚摸宠物">
          👆 点一点{pet.name}，摸摸它
        </button>
      </div>

      {/* 动作按钮：喂食 + 6 种互动（花⭐） + 学单词 */}
      <div className="actions">
        <button className="action-btn feed" onClick={() => { sfxClick(); setShowFood(true); }}>
          <span className="a-emoji">🍼</span><span>喂食</span><span className="a-en">免费</span>
        </button>
        {Object.keys(PLAY_WORDS).map((kind) => {
          const afford = (save.wordPoints || 0) >= PLAY_COST[kind];
          return (
            <button
              key={kind}
              className={'action-btn' + (afford ? '' : ' cant')}
              onClick={() => play(kind)}
            >
              <span className="a-emoji">{PLAY_EMOJI[kind]}</span>
              <span>{PLAY_ZH[kind]}</span>
              <span className="a-en">{PLAY_WORDS[kind]}</span>
              <span className="a-cost">{PLAY_COST[kind]}⭐</span>
            </button>
          );
        })}
        <button
          className="action-btn quiz-btn"
          onClick={() => { sfxClick(); setShowQuiz(true); }}
        >
          <span className="a-emoji">📖</span><span>学单词</span>
          <span className="a-en">Quiz</span>
          <span className="a-cost earn">赚⭐</span>
        </button>
      </div>

      <p className="tip">💡 学单词赚⭐，花⭐和宠物互动！喂食、互动、答题都能得💗，💗攒够宠物就会长大哦！玩 {PLAY_MINUTES} 分钟要休息 {REST_MINUTES} 分钟，让眼睛歇一歇～</p>

      {showFood && <FoodPicker foods={menuFoods} favoriteId={cfg.favoriteFood} onPick={feed} onClose={() => setShowFood(false)} />}
      {showQuiz && <Quiz onDone={onQuizDone} onQuit={() => setShowQuiz(false)} />}
      {showHouse && (
        <PetHouse
          save={save}
          onSwitch={(id) => { commit((s) => { s.activePetId = id; }); setShowHouse(false); say('换好啦！'); }}
          onUnlock={(t) => { setShowHouse(false); onUnlockRequest(t); }}
          onClose={() => setShowHouse(false)}
        />
      )}
      {levelUp && <LevelUpModal stageName={levelUp} onClose={() => setLevelUp(null)} />}
      {toast && <div className="toast">{toast}</div>}
      {resting && <RestOverlay save={save} now={now} />}
    </div>
  );
}

// ---------------- App 根组件 ----------------
export default function App() {
  const [save, setSave] = useState(() => loadSave());
  const [now, setNow] = useState(Date.now()); // 每秒刷新，驱动休息倒计时
  const [woke, setWoke] = useState(false);    // 休息刚结束时弹一次提示
  // 解锁领养流程：null = 不在领养页；字符串 = 要领养的宠物类型
  const [adoptType, setAdoptType] = useState(null);
  const saveRef = useRef(save);
  saveRef.current = save;
  const hasPets = save.pets.length > 0;

  // 游玩计时器：页面可见时才累计；满 30 分钟 → 休息 15 分钟（时间戳，关页面也继续）
  useEffect(() => {
    if (!hasPets) return;
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      const s = saveRef.current;
      if (s.pets.length === 0) return;
      // 休息中：等时间到
      if (s.restUntil > t) return;
      const next = structuredClone(s);
      // 休息刚结束：清零，提示一次
      if (s.restUntil !== 0 && s.restUntil <= t) {
        next.restUntil = 0;
        next.playSec = 0;
        persistSave(next);
        setSave(next);
        setWoke(true);
        return;
      }
      // 后台标签页不计时
      if (document.visibilityState !== 'visible') return;
      next.playSec = (next.playSec || 0) + 1;
      // 每过 1 分钟：饱食度 -2、心情 -1（自然消化，喂食有节奏感）
      if (next.playSec % 60 === 0) {
        next.pets.forEach((p) => {
          p.fullness = Math.max(10, p.fullness - 2);
          p.mood = Math.max(20, p.mood - 1);
        });
      }
      // 玩满 30 分钟 → 强制休息 15 分钟
      if (next.playSec >= PLAY_MINUTES * 60) {
        next.restUntil = t + REST_MINUTES * 60 * 1000;
        next.playSec = 0;
      }
      persistSave(next);
      setSave(next);
    }, 1000);
    return () => clearInterval(id);
  }, [hasPets]);

  // 统一的状态提交入口：深拷贝 → 改 → 落盘 → setState，全同步
  // fn 返回的对象会被原样带回（用于取升级阶段名等）
  const commit = (fn) => {
    const next = structuredClone(save);
    const extra = fn(next) || {};
    persistSave(next);
    setSave(next);
    return extra;
  };

  const adopt = (type, name) => {
    commit((s) => {
      const p = newPet(type, name);
      s.pets.push(p);
      s.activePetId = p.id;
    });
    setAdoptType(null);
  };

  const ownedTypes = save.pets.map((p) => p.type);

  // 还没领养，或正在走解锁领养流程 → 领养页
  if (save.pets.length === 0 || adoptType) {
    return (
      <div className="app">
        <AdoptScreen
          ownedTypes={ownedTypes}
          fixedType={adoptType}
          onAdopt={adopt}
          onCancel={adoptType ? () => setAdoptType(null) : undefined}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <HomeScreen
        key={save.activePetId}
        save={save}
        commit={commit}
        now={now}
        woke={woke}
        clearWoke={() => setWoke(false)}
        onUnlockRequest={(t) => setAdoptType(t)}
      />
    </div>
  );
}
