// ============================================================
// speech.js —— 用浏览器自带的 speechSynthesis 朗读英文单词
// 不需要网络、不需要外部服务
// ============================================================

// 朗读英文，语速放慢一点，适合小朋友跟读
export function speak(text) {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel(); // 打断上一句
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.85;   // 稍慢
    u.pitch = 1.1;   // 稍高，更亲切
    // 尽量选一个英文女声
    const voices = synth.getVoices();
    const v = voices.find((x) => x.lang.startsWith('en') && x.name.toLowerCase().includes('female'))
      || voices.find((x) => x.lang.startsWith('en-US'))
      || voices.find((x) => x.lang.startsWith('en'));
    if (v) u.voice = v;
    synth.speak(u);
  } catch {
    // 不支持的浏览器直接忽略
  }
}

// 预加载 voices（有些浏览器需要先触发一次才能拿到列表）
try {
  if (window.speechSynthesis) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }
} catch { /* 忽略 */ }
