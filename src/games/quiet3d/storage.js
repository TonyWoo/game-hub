// ============================================================
// storage.js —— 安静书 3D 版存档（localStorage，独立 key）
// key: quiet-book-3d-save-v1（与 2D 版互不干扰）
// ============================================================
const KEY = 'quiet-book-3d-save-v1';

export function blankSave() {
  return {
    collected: [],  // 已收集的单词 id（去重）
    placed: {},     // { themeId: [{ id, x, z }] }，x/z 为地面平面坐标（单位）
    stars: {},      // { themeId: 0..5 } 找一找最佳成绩
  };
}

export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blankSave();
    const s = JSON.parse(raw);
    return {
      collected: Array.isArray(s.collected) ? s.collected : [],
      placed: s.placed && typeof s.placed === 'object' ? s.placed : {},
      stars: s.stars && typeof s.stars === 'object' ? s.stars : {},
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
