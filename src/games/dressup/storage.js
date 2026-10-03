// ============================================================
// storage.js —— 换装小屋存档（localStorage，独立 key）
// key: dressup-save-v1
// ============================================================
const KEY = 'dressup-save-v1';

export function blankSave() {
  return {
    collected: [],  // 已收集的衣物单词 id（去重）
    worn: {},       // 当前穿搭 { cat: clothId }
  };
}

export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blankSave();
    const s = JSON.parse(raw);
    return {
      collected: Array.isArray(s.collected) ? s.collected : [],
      worn: s.worn && typeof s.worn === 'object' ? s.worn : {},
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
