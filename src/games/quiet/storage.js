// ============================================================
// storage.js —— 安静书存档（localStorage）
// key: quiet-book-save-v1（全模块唯一允许的 key）
// 2026-10-03: zoom 字段并入同一 key（各主题场景缩放记忆）
// ============================================================
const KEY = 'quiet-book-save-v1';

export function blankSave() {
  return {
    collected: [],   // 已收集的英文单词（去重，如 'teddy_bear'）
    placed: {},      // 各主题已放置的贴纸 { themeId: [{ id, x, y }] }，x/y 为 0..100 百分比（逻辑坐标，不随缩放变）
    stars: {},       // 各主题找一找最佳成绩 { themeId: 0..5 }
    zoom: {},        // 各主题场景缩放 { themeId: 0.75..2.5 }，只影响视图
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
      zoom: s.zoom && typeof s.zoom === 'object' ? s.zoom : {},
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
