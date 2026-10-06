// ============================================================
// storage.js —— 小小战棋存档：localStorage，key 'tiny-tactics-save-v1'
// 只存通关进度 { unlocked: 1 }
// ============================================================

const KEY = 'tiny-tactics-save-v1';

export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { unlocked: 1 };
    const d = JSON.parse(raw);
    return { unlocked: d.unlocked || 1 };
  } catch (e) {
    return { unlocked: 1 };
  }
}

export function saveSave(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ unlocked: data.unlocked || 1 }));
  } catch (e) { /* 无痕模式忽略 */ }
}
