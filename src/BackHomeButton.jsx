// ============================================================
// BackHomeButton.jsx —— 可拖拽的悬浮"回大厅"小圆钮
// 三个游戏路由共用；位置存 localStorage，下次记住
// ============================================================
import { useState, useRef, useEffect } from 'react';

const LS_KEY = 'game-hub-backbtn-pos';
const SIZE = 44;

function loadPos() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (typeof p.x === 'number' && typeof p.y === 'number') return p;
    }
  } catch (e) { /* 忽略损坏的存档 */ }
  return null;
}

const clamp = (x, y) => ({
  x: Math.min(Math.max(4, x), Math.max(4, window.innerWidth - SIZE - 4)),
  y: Math.min(Math.max(4, y), Math.max(4, window.innerHeight - SIZE - 4)),
});

export default function BackHomeButton({ onBack, dark }) {
  const [pos, setPos] = useState(() => loadPos());
  const [dragging, setDragging] = useState(false);
  const st = useRef(null);
  const posRef = useRef(pos);
  posRef.current = pos;

  // 默认位置：右上角
  useEffect(() => {
    if (!posRef.current) {
      setPos({ x: Math.max(4, window.innerWidth - SIZE - 10), y: 10 });
    }
  }, []);

  // 屏幕旋转/尺寸变化时把按钮夹回可视区
  useEffect(() => {
    const onResize = () => {
      if (posRef.current) setPos((p) => (p ? clamp(p.x, p.y) : p));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const onDown = (e) => {
    e.preventDefault();
    const p = posRef.current || { x: 0, y: 0 };
    st.current = { sx: e.clientX, sy: e.clientY, ox: p.x, oy: p.y, moved: false };
    setDragging(true);
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const s = st.current;
      if (!s) return;
      const dx = e.clientX - s.sx;
      const dy = e.clientY - s.sy;
      if (Math.hypot(dx, dy) > 8) s.moved = true;
      if (s.moved) setPos(clamp(s.ox + dx, s.oy + dy));
    };
    const onUp = () => {
      const s = st.current;
      st.current = null;
      setDragging(false);
      if (!s) return;
      if (s.moved) {
        try {
          localStorage.setItem(LS_KEY, JSON.stringify(posRef.current));
        } catch (e) { /* 存储失败不影响使用 */ }
      } else {
        onBack(); // 没拖动 = 点了一下 → 回大厅
      }
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [dragging, onBack]);

  if (!pos) return null;

  return (
    <button
      className={`back-home-fab${dragging ? ' dragging' : ''}${dark ? ' dark' : ''}`}
      style={{ left: pos.x, top: pos.y }}
      onPointerDown={onDown}
      aria-label="回大厅"
      title="回大厅（可拖动）"
    >
      🏠
    </button>
  );
}
