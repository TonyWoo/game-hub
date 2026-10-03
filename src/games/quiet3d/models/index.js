// ============================================================
// index.js —— 120 个单词 3D 模型注册表
// 按 id 自动匹配 buildXxx 函数；缺失的 console.warn，不白屏
// ============================================================
import * as A from './animals.js';
import * as B from './food.js';
import * as O from './objects.js';
import * as N from './nature.js';

const SOURCES = [A, B, O, N];

const toFnName = (id) =>
  'build' + id.split('_').map((p) => p[0].toUpperCase() + p.slice(1)).join('');

export function hasModel(id) {
  const fn = toFnName(id);
  return SOURCES.some((s) => typeof s[fn] === 'function');
}

// 构造一个单词的 3D 模型（THREE.Group），缺失返回 null 并 warn
export function buildModel(id) {
  const fn = toFnName(id);
  for (const s of SOURCES) {
    if (typeof s[fn] === 'function') {
      try {
        return s[fn]();
      } catch (e) {
        console.warn('[quiet3d] 模型构造失败:', id, e);
        return null;
      }
    }
  }
  console.warn('[quiet3d] 缺少 3D 模型:', id, `(期望函数 ${fn})`);
  return null;
}

// 自检：返回缺失 id 列表（构建后可在控制台调用）
export function auditModels(allWords) {
  const missing = [];
  for (const w of allWords) {
    if (!hasModel(w.id)) missing.push(w.id);
  }
  if (missing.length) console.warn('[quiet3d] 缺失模型:', missing.join(', '));
  else console.log('[quiet3d] 模型注册表完整，共', allWords.length, '个');
  return missing;
}
