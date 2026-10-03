// ============================================================
// audio.js —— Web Audio API 现场合成音效，不引入任何音频文件
// ============================================================

let ctx = null;

// 懒创建 AudioContext（必须在用户手势后创建，调用方保证在点击事件里调用）
function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// 播放一个音符
function tone(freq, startAt, dur, type = 'sine', vol = 0.18) {
  const c = ac();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, startAt);
  g.gain.exponentialRampToValueAtTime(vol, startAt + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, startAt + dur);
  o.connect(g).connect(c.destination);
  o.start(startAt);
  o.stop(startAt + dur + 0.05);
}

function now() {
  return ac().currentTime;
}

// 点击按钮：短促的"啵"
export function sfxClick() {
  try { tone(660, now(), 0.07, 'triangle'); } catch { /* 忽略 */ }
}

// 喂食：两声下行"啊呜啊呜"
export function sfxEat() {
  try {
    const t = now();
    tone(520, t, 0.09, 'sine');
    tone(430, t + 0.11, 0.09, 'sine');
    tone(350, t + 0.22, 0.12, 'sine');
  } catch { /* 忽略 */ }
}

// 开心：上行琶音
export function sfxHappy() {
  try {
    const t = now();
    [523, 659, 784].forEach((f, i) => tone(f, t + i * 0.09, 0.12, 'triangle'));
  } catch { /* 忽略 */ }
}

// 答对：清脆的"叮"
export function sfxCorrect() {
  try {
    const t = now();
    tone(880, t, 0.15, 'sine');
    tone(1320, t + 0.08, 0.2, 'sine', 0.12);
  } catch { /* 忽略 */ }
}

// 答错：低沉的"嗡"
export function sfxWrong() {
  try { tone(180, now(), 0.25, 'sawtooth', 0.08); } catch { /* 忽略 */ }
}

// 升级：欢快的上行 + 和弦
export function sfxLevelUp() {
  try {
    const t = now();
    [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.1, 0.15, 'triangle'));
    tone(523, t + 0.45, 0.4, 'sine', 0.1);
    tone(659, t + 0.45, 0.4, 'sine', 0.1);
    tone(784, t + 0.45, 0.4, 'sine', 0.1);
  } catch { /* 忽略 */ }
}

// 泡泡：轻快的水泡声
export function sfxBubble() {
  try {
    const t = now();
    [700, 900, 750, 1000, 850].forEach((f, i) =>
      tone(f, t + i * 0.07, 0.06, 'sine', 0.1));
  } catch { /* 忽略 */ }
}

// 唱歌：do-re-mi 上行小旋律
export function sfxSing() {
  try {
    const t = now();
    [523, 587, 659, 784].forEach((f, i) => tone(f, t + i * 0.11, 0.14, 'sine'));
  } catch { /* 忽略 */ }
}

// 跳舞：欢快的弹跳节奏
export function sfxDance() {
  try {
    const t = now();
    [392, 523, 392, 659].forEach((f, i) => tone(f, t + i * 0.1, 0.1, 'triangle'));
  } catch { /* 忽略 */ }
}

// 讲故事：温柔的摇篮曲式双音
export function sfxStory() {
  try {
    const t = now();
    tone(659, t, 0.25, 'sine', 0.12);
    tone(587, t + 0.28, 0.35, 'sine', 0.12);
  } catch { /* 忽略 */ }
}
