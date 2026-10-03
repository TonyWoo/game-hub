// ============================================================
// storage.js —— 数学乐园存档（localStorage，独立 key）
// key: math-save-v1
// ============================================================
const KEY = 'math-save-v1';

export function blankSave() {
  return {
    stars: {},    // { levelId: 0..3 } 最佳星级
    unlocked: 0,  // 已解锁到的最大关卡下标（0 起）
  };
}

export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blankSave();
    const s = JSON.parse(raw);
    return {
      stars: s.stars && typeof s.stars === 'object' ? s.stars : {},
      unlocked: typeof s.unlocked === 'number' ? s.unlocked : 0,
    };
  } catch {
    return blankSave();
  }
}

export function persistSave(save) {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch { /* 忽略 */ }
}
