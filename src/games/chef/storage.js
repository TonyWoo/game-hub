// ============================================================
// storage.js —— 小小厨师存档（localStorage，独立 key）
// key: chef-save-v1
// ============================================================
const KEY = 'chef-save-v1';

export function blankSave() {
  return {
    collected: [],  // 已收集的食材单词 id（去重）
    stars: 0,       // 累计星星
  };
}

export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blankSave();
    const s = JSON.parse(raw);
    return {
      collected: Array.isArray(s.collected) ? s.collected : [],
      stars: typeof s.stars === 'number' ? s.stars : 0,
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
