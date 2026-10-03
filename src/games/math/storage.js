// ============================================================
// storage.js —— 数学乐园存档（localStorage，独立 key）
// key: math-save-v1
// ============================================================
const KEY = 'math-save-v1';

export function blankSave() {
  return {
    stars: {},    // { levelId: 0..3 } 最佳星级
    unlocked: 0,  // 已解锁到的最大关卡下标（0 起）
    v: 2,         // 存档版本号
  };
}

export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blankSave();
    const s = JSON.parse(raw);
    const save = {
      stars: s.stars && typeof s.stars === 'object' ? s.stars : {},
      unlocked: typeof s.unlocked === 'number' ? s.unlocked : 0,
      v: s.v || 0,
    };
    if (save.v < 2) {
      // v2 一次性迁移：在第 4 关（下标 3）插入「长度数感训练营」，
      // 旧 unlocked 是下标，>=3 的整体 +1；新关对老玩家视为未解锁，需自己打
      if (save.unlocked >= 3) save.unlocked = Math.min(save.unlocked + 1, 10);
      save.v = 2;
      persistSave(save);
    }
    return save;
  } catch {
    return blankSave();
  }
}

export function persistSave(save) {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch { /* 忽略 */ }
}
