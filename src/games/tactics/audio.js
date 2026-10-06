// ============================================================
// audio.js —— WebAudio 合成音效：选择/移动/攻击/受伤/胜利/失败/回合
// 懒创建 AudioContext，localStorage 记住静音（tiny-tactics-muted）
// ============================================================

const MUTE_KEY = 'tiny-tactics-muted';

let ctx = null;
let muted = false;
try { muted = localStorage.getItem(MUTE_KEY) === '1'; } catch (e) { /* 无痕模式 */ }

function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function isMuted() { return muted; }
export function setMuted(m) {
  muted = !!m;
  try { localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); } catch (e) { /* 忽略 */ }
}

function tone({ f0, f1 = f0, dur = 0.1, type = 'square', vol = 0.06, delay = 0 }) {
  if (muted) return;
  try {
    const c = ac(), t = c.currentTime + delay;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(Math.max(1, f0), t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  } catch (e) { /* 静默 */ }
}

export const sfx = {
  select() { tone({ f0: 520, f1: 780, dur: 0.07, type: 'square', vol: 0.05 }); }, // 选中单位
  move() { // 移动：两步脚步声
    tone({ f0: 300, f1: 220, dur: 0.06, type: 'triangle', vol: 0.06 });
    tone({ f0: 340, f1: 260, dur: 0.06, type: 'triangle', vol: 0.06, delay: 0.08 });
  },
  attack() { tone({ f0: 700, f1: 180, dur: 0.12, type: 'sawtooth', vol: 0.08 }); }, // 挥击
  bow() { tone({ f0: 1200, f1: 400, dur: 0.1, type: 'sine', vol: 0.06 }); }, // 弓弦
  hurt() { tone({ f0: 200, f1: 70, dur: 0.18, type: 'sawtooth', vol: 0.09 }); }, // 受伤
  die() { tone({ f0: 260, f1: 50, dur: 0.3, type: 'sawtooth', vol: 0.09 }); }, // 阵亡
  miss() { tone({ f0: 900, f1: 950, dur: 0.08, type: 'sine', vol: 0.05 }); }, // MISS 轻哨
  turn() { // 回合切换：敌方回合低音提示
    tone({ f0: 196, dur: 0.12, type: 'triangle', vol: 0.07 });
    tone({ f0: 147, dur: 0.16, type: 'triangle', vol: 0.07, delay: 0.12 });
  },
  win() { // 胜利 fanfare
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      tone({ f0: f, dur: 0.2, type: 'triangle', vol: 0.08, delay: i * 0.13 }));
  },
  lose() { // 失败下行
    [330, 262, 208, 165].forEach((f, i) =>
      tone({ f0: f, f1: f * 0.94, dur: 0.24, type: 'sawtooth', vol: 0.07, delay: i * 0.17 }));
  },
  ui() { tone({ f0: 600, f1: 900, dur: 0.06, type: 'square', vol: 0.04 }); }, // 界面点击
};

export function unlockAudio() {
  try { ac(); } catch (e) { /* 静默 */ }
}
