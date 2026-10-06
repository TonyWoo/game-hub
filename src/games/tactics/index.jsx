// ============================================================
// index.jsx —— 小小战棋 React 外壳：HUD + Canvas + 底部单位面板
// 游戏逻辑在 game.js（纯函数），绘制在 render.js，React 只做 UI 覆盖层
// ============================================================
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  newGame, getUnit, at, aliveOf, selectUnit, deselect,
  moveSelected, attackSelected, standbySelected, enemyAct, checkEnd, CLASSES,
} from './game.js';
import { drawBoard, newFx, addFloater } from './render.js';
import { sfx, isMuted, setMuted, unlockAudio } from './audio.js';
import { saveSave } from './storage.js';
import './tactics.css';

const CLASS_ICON = { sword: '🗡️', lance: '🔱', axe: '🪓', archer: '🏹', knight: '🐎' };

function Hud({ round, blue, red, muted, onMute }) {
  return (
    <div className="t-hud">
      <span className="t-hud-item">🚩 第 1 关</span>
      <span className="t-hud-item">回合 {round}</span>
      <span className="t-hud-item">🔵 {blue} / 🔴 {red}</span>
      <button className="t-icon-btn" onClick={onMute} title="音效开关">
        {muted ? '🔇' : '🔊'}
      </button>
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
            </div>
            <div className="t-hpbar"><div
              className="t-hpfill"
              style={{ width: `${(unit.hp / unit.maxHp) * 100}%` }}
            /></div>
            <div className="t-stats">
              攻击 {CLASSES[unit.cls].atk}　防御 {CLASSES[unit.cls].def}
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
  const [state, setState] = useState(() => newGame());
  const [muted, setM] = useState(() => isMuted());
  const [tick, setTick] = useState(0); // 强制重绘
  const stateRef = useRef(state);
  stateRef.current = state;

  const refresh = useCallback(() => setTick((t) => t + 1), []);

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
          if (s.result === 'win') { sfx.win(); saveSave({ unlocked: 1 }); }
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
  }, [playEvents, refresh]);

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
      for (const u of s.units) u.acted = false;
    }
    if (s.result === 'win') { sfx.win(); saveSave({ unlocked: 1 }); }
    if (s.result === 'lose') sfx.lose();
    refresh();
  }, [playEvents, refresh]);

  const onMute = useCallback(() => {
    const m = !isMuted();
    setMuted(m);
    setM(m);
  }, []);

  const restart = useCallback(() => {
    fxRef.current = newFx();
    setState(newGame());
    refresh();
  }, [refresh]);

  const s = state;
  const selUnit = s.selectedId ? getUnit(s, s.selectedId) : null;
  const hint = s.phase === 'enemy'
    ? '敌方回合…'
    : selUnit
      ? (s.moveRange.length ? '点蓝色格移动' : '点红色格攻击敌人，或待机')
      : '点我方蓝色单位开始行动';

  return (
    <>
      <Hud
        round={s.round}
        blue={aliveOf(s, 'blue').length}
        red={aliveOf(s, 'red').length}
        muted={muted}
        onMute={onMute}
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
      {s.phase === 'over' && (
        <div className="t-overlay">
          <div className="t-dialog">
            <h2>{s.result === 'win' ? '🏆 胜利！' : '💀 失败…'}</h2>
            <p>{s.result === 'win'
              ? `全灭敌军！用了 ${s.round} 回合`
              : '我方全灭，再接再厉！'}</p>
            <div className="t-dialog-btns">
              <button className="t-btn" onClick={restart}>
                {s.result === 'win' ? '再来一局' : '重新挑战'}
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
