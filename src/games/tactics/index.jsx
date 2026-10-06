// ============================================================
// index.jsx —— 小小战棋 React 外壳：HUD + Canvas + 底部单位面板
// 游戏逻辑在 game.js（纯函数），绘制在 render.js，React 只做 UI 覆盖层
// ============================================================
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  newGame, getUnit, at, aliveOf, selectUnit, deselect,
  moveSelected, attackSelected, standbySelected, enemyAct, checkEnd,
  MAX_LEVEL, CLASSES,
} from './game.js';
import { drawBoard, newFx, addFloater } from './render.js';
import { sfx, isMuted, setMuted, unlockAudio } from './audio.js';
import { loadSave, saveSave } from './storage.js';
import './tactics.css';

const CLASS_ICON = { sword: '🗡️', lance: '🔱', axe: '🪓', archer: '🏹', knight: '🐎' };

function Hud({ level, levelName, round, blue, red, muted, onMute, onHelp }) {
  return (
    <div className="t-hud">
      <span className="t-hud-item">🚩 第 {level} 关 · {levelName}</span>
      <span className="t-hud-item">回合 {round}</span>
      <span className="t-hud-item">🔵 {blue} / 🔴 {red}</span>
      <button className="t-icon-btn" onClick={onHelp} title="玩法说明">
        ❓
      </button>
      <button className="t-icon-btn" onClick={onMute} title="音效开关">
        {muted ? '🔇' : '🔊'}
      </button>
    </div>
  );
}

/** 玩法说明弹窗 */
function HelpDialog({ onClose }) {
  return (
    <div className="t-overlay" onClick={onClose}>
      <div className="t-dialog t-help" onClick={(e) => e.stopPropagation()}>
        <h2>❓ 玩法说明</h2>
        <div className="t-help-body">
          <p><b>🎯 目标</b><br />全灭红色敌军即可过关，通关解锁下一关。</p>
          <p><b>👆 操作</b><br />
            点蓝色单位选中 → 点青蓝格移动 → 点红色格攻击敌人；<br />
            或点"待机"跳过该单位，点"结束回合"轮到敌方行动。</p>
          <p><b>⏱️ 行动规则</b><br />
            每个单位每回合只能走一次，走后可攻击或待机；<br />
            走过的单位变半透明，行动完变灰色。</p>
          <p><b>⚔️ 兵种克制</b><br />
            剑克斧、斧克枪、枪克剑，克制时攻击 +2；<br />
            弓手射程 2 格，被敌人贴身后无法反击。</p>
          <p><b>🌲 地形</b><br />
            森林：走 2 步，被打时闪避 +20；<br />
            山丘：走 2 步，防御 +1；水面走不进去。</p>
        </div>
        <div className="t-dialog-btns">
          <button className="t-btn primary" onClick={onClose}>知道了</button>
        </div>
      </div>
    </div>
  );
}

function UnitPanel({ unit, onStandby, onEndTurn, hint }) {
  return (
    <div className="t-panel">
      {unit ? (
        <div className="t-unit-info">
          <span className="t-unit-icon">{CLASS_ICON[unit.cls]}</span>
          <div className="t-unit-meta">
            <div className="t-unit-name">
              {unit.name}
              <span className="t-hp-text">{unit.hp}/{unit.maxHp}</span>
              {unit.side === 'blue' && unit.acted && (
                <span className="t-state-done">已行动</span>
              )}
              {unit.side === 'blue' && !unit.acted && unit.moved && (
                <span className="t-state-moved">走过·可攻击</span>
              )}
            </div>
            <div className="t-hpbar"><div
              className="t-hpfill"
              style={{ width: `${(unit.hp / unit.maxHp) * 100}%` }}
            /></div>
            <div className="t-stats">
              攻击 {unit.atk}　防御 {unit.def}
              　移动 {CLASSES[unit.cls].mov}　射程 {CLASSES[unit.cls].rng}
            </div>
          </div>
          {!unit.acted && unit.side === 'blue' && (
            <button className="t-btn t-btn-standby" onClick={onStandby}>待机</button>
          )}
        </div>
      ) : (
        <div className="t-hint">{hint}</div>
      )}
      <button className="t-btn t-btn-end" onClick={onEndTurn}>结束回合</button>
    </div>
  );
}

export default function TacticsGame() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const fxRef = useRef(newFx());
  const [screen, setScreen] = useState('menu'); // menu | game
  const [state, setState] = useState(() => newGame(1));
  const [unlocked, setUnlocked] = useState(() => loadSave().unlocked);
  const [muted, setM] = useState(() => isMuted());
  const [showHelp, setShowHelp] = useState(false);
  const [tick, setTick] = useState(0); // 强制重绘
  const stateRef = useRef(state);
  stateRef.current = state;

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  // 开始第 n 关
  const startLevel = useCallback((lv) => {
    unlockAudio();
    fxRef.current = newFx();
    const ns = newGame(lv);
    stateRef.current = ns;
    setState(ns);
    setScreen('game');
    refresh();
  }, [refresh]);

  // 胜利：解锁下一关
  const onWin = useCallback((level) => {
    sfx.win();
    const nl = Math.min(level + 1, MAX_LEVEL);
    setUnlocked((u) => {
      const nu = Math.max(u, nl);
      saveSave({ unlocked: nu });
      return nu;
    });
  }, []);

  // Canvas 尺寸：宽度自适应容器
  const fitCanvas = useCallback(() => {
    const cv = canvasRef.current, wrap = wrapRef.current;
    if (!cv || !wrap) return 0;
    const w = Math.min(wrap.clientWidth, 520);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = w * dpr;
    cv.height = w * dpr;
    cv.style.width = w + 'px';
    cv.style.height = w + 'px';
    return w * dpr;
  }, []);

  // 绘制循环（飘字动画需要持续重绘）
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const cv = canvasRef.current;
      if (cv) {
        const g = cv.getContext('2d');
        const cellPx = cv.width / 8;
        g.clearRect(0, 0, cv.width, cv.height);
        drawBoard(g, cellPx, stateRef.current, fxRef.current);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    fitCanvas();
    const onR = () => { fitCanvas(); refresh(); };
    window.addEventListener('resize', onR);
    return () => window.removeEventListener('resize', onR);
  }, [fitCanvas, refresh]);

  // 从选关菜单进入游戏时棋盘刚挂载，补一次尺寸适配
  // （首屏挂载时还是菜单，没有 canvas，fitCanvas 直接返回了）
  useEffect(() => {
    if (screen === 'game') {
      fitCanvas();
      refresh();
    }
  }, [screen, fitCanvas, refresh]);

  // 事件 → 飘字 + 音效
  const playEvents = useCallback((events) => {
    const s = stateRef.current;
    for (const e of events) {
      const to = getUnit(s, e.to);
      if (!to) continue;
      if (e.type === 'hit') {
        addFloater(fxRef.current, to.x, to.y, `-${e.dmg}`, '#ff5a5a');
        sfx.attack(); sfx.hurt();
      } else if (e.type === 'counter-hit') {
        addFloater(fxRef.current, to.x, to.y, `-${e.dmg}`, '#ffb020');
        sfx.attack(); sfx.hurt();
      } else if (e.type === 'miss' || e.type === 'counter-miss') {
        addFloater(fxRef.current, to.x, to.y, 'MISS', '#c9d2e8');
        sfx.miss();
      } else if (e.type === 'die') {
        addFloater(fxRef.current, to.x, to.y, '阵亡', '#ffffff');
        sfx.die();
      }
    }
  }, []);

  // 点格子
  const onTap = useCallback((ev) => {
    unlockAudio();
    const s = stateRef.current;
    if (s.phase !== 'player') return;
    const cv = canvasRef.current;
    const rect = cv.getBoundingClientRect();
    const cx = (ev.clientX - rect.left) / rect.width;
    const cy = (ev.clientY - rect.top) / rect.height;
    const gx = Math.floor(cx * 8), gy = Math.floor(cy * 8);
    if (gx < 0 || gx > 7 || gy < 0 || gy > 7) return;

    const u = at(s, gx, gy);
    const sel = s.selectedId ? getUnit(s, s.selectedId) : null;

    if (sel) {
      // 点到敌人且在攻击范围内 → 攻击
      if (u && u.side === 'red' && s.attackRange.some((t) => t.x === gx && t.y === gy)) {
        const events = attackSelected(s, gx, gy);
        if (events) {
          if (sel.cls === 'archer') sfx.bow();
          playEvents(events);
          if (s.result === 'win') onWin(s.level);
          if (s.result === 'lose') sfx.lose();
        }
        refresh();
        return;
      }
      // 点到可移动格 → 移动
      if (s.moveRange.some((t) => t.x === gx && t.y === gy)) {
        if (moveSelected(s, gx, gy)) sfx.move();
        refresh();
        return;
      }
      // 点到另一个我方未行动单位 → 切换选中
      if (u && u.side === 'blue' && !u.acted) {
        if (selectUnit(s, u.id)) sfx.select();
        refresh();
        return;
      }
      // 其他 → 取消选中
      deselect(s);
      refresh();
      return;
    }
    // 未选中时：点我方未行动单位选中
    if (u && u.side === 'blue' && !u.acted) {
      if (selectUnit(s, u.id)) sfx.select();
      refresh();
    }
  }, [playEvents, refresh, onWin]);

  const onStandby = useCallback(() => {
    unlockAudio();
    const s = stateRef.current;
    if (standbySelected(s)) { sfx.ui(); refresh(); }
  }, [refresh]);

  const onEndTurn = useCallback(async () => {
    unlockAudio();
    const s = stateRef.current;
    if (s.phase !== 'player') return;
    sfx.turn();
    // 敌方回合：逐个单位播放（移动→停顿→攻击），不然一瞬间算完看着像没动
    deselect(s);
    s.phase = 'enemy';
    refresh();
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    await sleep(400);
    for (const e of aliveOf(s, 'red')) {
      if (s.phase === 'over') break;
      const events = enemyAct(s, e);
      checkEnd(s);
      playEvents(events);
      refresh();
      await sleep(700);
    }
    if (s.phase !== 'over') {
      s.phase = 'player';
      s.round += 1;
      for (const u of s.units) { u.acted = false; u.moved = false; }
    }
    if (s.result === 'win') onWin(s.level);
    if (s.result === 'lose') sfx.lose();
    refresh();
  }, [playEvents, refresh, onWin]);

  const onMute = useCallback(() => {
    const m = !isMuted();
    setMuted(m);
    setM(m);
  }, []);

  const restart = useCallback(() => {
    startLevel(stateRef.current.level);
  }, [startLevel]);

  const s = state;
  const selUnit = s.selectedId ? getUnit(s, s.selectedId) : null;
  const hint = s.phase === 'enemy'
    ? '敌方回合…'
    : selUnit
      ? (s.moveRange.length ? '点蓝色格移动' : '点红色格攻击敌人，或待机')
      : '点我方蓝色单位开始行动';

  const LEVEL_TITLES = ['初入战场', '森林遭遇战', '决战山谷'];

  if (screen === 'menu') {
    return (
      <div className="t-menu">
        <h1 className="t-menu-title">🛡️ 小小战棋</h1>
        <p className="t-menu-sub">回合制战棋：走位克制，全灭敌军</p>
        <div className="t-level-list">
          {[1, 2, 3].map((n) => {
            const locked = n > unlocked;
            return (
              <button
                key={n}
                className={`t-level-btn${locked ? ' locked' : ''}`}
                disabled={locked}
                onClick={() => startLevel(n)}
              >
                <span className="t-level-num">{locked ? '🔒' : `第 ${n} 关`}</span>
                <span className="t-level-name">{LEVEL_TITLES[n - 1]}</span>
              </button>
            );
          })}
        </div>
        <p className="t-menu-tip">通关解锁下一关 · 点右上角 🏠 回大厅</p>
        <button className="t-help-btn" onClick={() => setShowHelp(true)}>
          ❓ 玩法说明
        </button>
        {showHelp && <HelpDialog onClose={() => setShowHelp(false)} />}
      </div>
    );
  }

  return (
    <>
      <Hud
        level={s.level}
        levelName={s.levelName}
        round={s.round}
        blue={aliveOf(s, 'blue').length}
        red={aliveOf(s, 'red').length}
        muted={muted}
        onMute={onMute}
        onHelp={() => setShowHelp(true)}
      />
      <div className="t-board-wrap" ref={wrapRef}>
        <canvas
          ref={canvasRef}
          className="t-board"
          onPointerDown={onTap}
        />
      </div>
      <UnitPanel
        unit={selUnit}
        hint={hint}
        onStandby={onStandby}
        onEndTurn={onEndTurn}
      />
      {showHelp && <HelpDialog onClose={() => setShowHelp(false)} />}
      {s.phase === 'over' && (        <div className="t-overlay">
          <div className="t-dialog">
            <h2>{s.result === 'win'
              ? (s.level >= MAX_LEVEL ? '🎉 全部通关！' : '🏆 胜利！')
              : '💀 失败…'}</h2>
            <p>{s.result === 'win'
              ? `第 ${s.level} 关 · 全灭敌军！用了 ${s.round} 回合`
              : '我方全灭，再接再厉！'}</p>
            <div className="t-dialog-btns">
              {s.result === 'win' && s.level < MAX_LEVEL && (
                <button className="t-btn primary" onClick={() => startLevel(s.level + 1)}>
                  下一关 →
                </button>
              )}
              <button className="t-btn" onClick={restart}>
                {s.result === 'win' ? '再来一局' : '重新挑战'}
              </button>
              <button className="t-btn" onClick={() => setScreen('menu')}>
                选关
              </button>
            </div>
            <p className="t-dialog-tip">点右上角 🏠 回大厅</p>
          </div>
        </div>
      )}
      <span style={{ display: 'none' }}>{tick}</span>
    </>
  );
}
