// ============================================================
// pets.jsx —— 九只宠物的手绘 SVG 形象
// 风格：圆滚滚、大眼睛、腮红，Q 版可爱风
// stage 0=蛋宝宝 1=破壳啦 2=小宝宝 3=小少年 4=大朋友 5=小明星(蝴蝶结) 6=闪亮之星(皇冠+星光) 7=传奇宝贝(皇冠+彩虹光环)
// face: normal 普通 / happy 开心 / sleepy 睡觉
// ============================================================
import { PETS } from './data.js';

// ---------- 表情：眼睛 ----------
function Eyes({ face }) {
  if (face === 'happy') {
    // 开心的月牙眼 ∩ ∩
    return (
      <g stroke="#4a3b32" strokeWidth="5" strokeLinecap="round" fill="none">
        <path d="M70 108 Q82 94 94 108" />
        <path d="M106 108 Q118 94 130 108" />
      </g>
    );
  }
  if (face === 'sleepy') {
    // 睡觉的闭眼 ‿ ‿
    return (
      <g stroke="#4a3b32" strokeWidth="5" strokeLinecap="round" fill="none">
        <path d="M70 108 Q82 116 94 108" />
        <path d="M106 108 Q118 116 130 108" />
      </g>
    );
  }
  // 普通：大眼睛 + 高光
  return (
    <g>
      <circle cx="82" cy="106" r="13" fill="#fff" />
      <circle cx="118" cy="106" r="13" fill="#fff" />
      <circle cx="84" cy="108" r="6.5" fill="#4a3b32" />
      <circle cx="116" cy="108" r="6.5" fill="#4a3b32" />
      <circle cx="86" cy="105" r="2.4" fill="#fff" />
      <circle cx="118" cy="105" r="2.4" fill="#fff" />
    </g>
  );
}

// ---------- 表情：嘴巴 ----------
function Mouth({ face, y = 126 }) {
  if (face === 'happy') {
    return <path d={`M88 ${y} Q100 ${y + 12} 112 ${y}`} stroke="#4a3b32" strokeWidth="4" strokeLinecap="round" fill="none" />;
  }
  if (face === 'sleepy') {
    return <circle cx="100" cy={y + 2} r="3.5" fill="#4a3b32" />;
  }
  // 普通：ω 小嘴
  return (
    <path d={`M100 ${y} q0 6 -7 7 M100 ${y} q0 6 7 7`} stroke="#4a3b32" strokeWidth="3.5" strokeLinecap="round" fill="none" />
  );
}

// ---------- 通用：腮红 ----------
function Blush({ color }) {
  return (
    <g fill={color} opacity="0.85">
      <ellipse cx="66" cy="126" rx="9" ry="5.5" />
      <ellipse cx="134" cy="126" rx="9" ry="5.5" />
    </g>
  );
}

// ---------- 蛋宝宝（所有宠物 stage 0 通用） ----------
function Egg({ tint }) {
  return (
    <g>
      <ellipse cx="100" cy="115" rx="48" ry="58" fill={tint} stroke="#fff" strokeWidth="4" />
      <ellipse cx="82" cy="95" rx="10" ry="14" fill="#ffffff" opacity="0.45" />
      <circle cx="118" cy="140" r="7" fill="#ffffff" opacity="0.5" />
      <circle cx="86" cy="152" r="5" fill="#ffffff" opacity="0.5" />
      <circle cx="128" cy="100" r="4" fill="#ffffff" opacity="0.5" />
      <Eyes face="normal" />
      <Blush color="#ffb3c7" />
      <Mouth face="normal" y={128} />
    </g>
  );
}

// ---------- 小兔 ----------
function Bunny({ face, deco }) {
  const c = PETS.bunny;
  return (
    <g>
      {/* 尾巴 */}
      <circle cx="150" cy="142" r="13" fill="#fff" stroke="#f3c6d8" strokeWidth="2" />
      {/* 长耳朵 */}
      <g>
        <ellipse cx="76" cy="42" rx="15" ry="34" fill={c.bodyColor} stroke="#f3c6d8" strokeWidth="3" transform="rotate(-12 76 42)" />
        <ellipse cx="124" cy="42" rx="15" ry="34" fill={c.bodyColor} stroke="#f3c6d8" strokeWidth="3" transform="rotate(12 124 42)" />
        <ellipse cx="76" cy="46" rx="7" ry="20" fill={c.earColor} transform="rotate(-12 76 46)" />
        <ellipse cx="124" cy="46" rx="7" ry="20" fill={c.earColor} transform="rotate(12 124 46)" />
      </g>
      {/* 脚 */}
      <ellipse cx="78" cy="164" rx="15" ry="9" fill={c.bodyColor} stroke="#f3c6d8" strokeWidth="3" />
      <ellipse cx="122" cy="164" rx="15" ry="9" fill={c.bodyColor} stroke="#f3c6d8" strokeWidth="3" />
      {/* 圆滚滚的身体 */}
      <circle cx="100" cy="115" r="52" fill={c.bodyColor} stroke="#f3c6d8" strokeWidth="3" />
      <ellipse cx="100" cy="140" rx="26" ry="20" fill="#fff5f8" />
      {/* 脸 */}
      <Eyes face={face} />
      <Blush color={c.blush} />
      <ellipse cx="100" cy="120" rx="5" ry="4" fill="#ff8fa8" />
      <Mouth face={face} y={126} />
      {deco}
    </g>
  );
}

// ---------- 小猫 ----------
function Cat({ face, deco }) {
  const c = PETS.cat;
  return (
    <g>
      {/* 三角耳朵 */}
      <polygon points="62,80 76,38 96,70" fill={c.bodyColor} stroke="#e8a56b" strokeWidth="3" strokeLinejoin="round" />
      <polygon points="138,80 124,38 104,70" fill={c.bodyColor} stroke="#e8a56b" strokeWidth="3" strokeLinejoin="round" />
      <polygon points="70,70 77,50 89,66" fill={c.earColor} />
      <polygon points="130,70 123,50 111,66" fill={c.earColor} />
      {/* 脚 */}
      <ellipse cx="78" cy="164" rx="15" ry="9" fill={c.bodyColor} stroke="#e8a56b" strokeWidth="3" />
      <ellipse cx="122" cy="164" rx="15" ry="9" fill={c.bodyColor} stroke="#e8a56b" strokeWidth="3" />
      {/* 身体 */}
      <circle cx="100" cy="115" r="52" fill={c.bodyColor} stroke="#e8a56b" strokeWidth="3" />
      {/* 头顶条纹 */}
      <g stroke="#e8a56b" strokeWidth="4" strokeLinecap="round">
        <path d="M88 70 q2 8 0 14" />
        <path d="M100 68 q2 8 0 14" />
        <path d="M112 70 q2 8 0 14" />
      </g>
      {/* 胡须 */}
      <g stroke="#c98d55" strokeWidth="2.5" strokeLinecap="round" opacity="0.8">
        <path d="M38 118 L64 122" /><path d="M38 132 L64 130" />
        <path d="M162 118 L136 122" /><path d="M162 132 L136 130" />
      </g>
      <Eyes face={face} />
      <Blush color={c.blush} />
      <polygon points="94,120 106,120 100,126" fill="#ff8fa8" />
      <Mouth face={face} y={128} />
      {deco}
    </g>
  );
}

// ---------- 小狐狸 ----------
function Fox({ face, deco }) {
  const c = PETS.fox;
  return (
    <g>
      {/* 蓬松大尾巴 */}
      <path d="M142 158 C172 152 192 128 188 96 C174 108 160 112 146 116 Z" fill={c.bodyColor} stroke="#d4691e" strokeWidth="3" strokeLinejoin="round" />
      <path d="M182 100 C188 112 186 124 178 132 C172 122 172 110 174 102 Z" fill="#fff" />
      {/* 尖耳朵 */}
      <polygon points="58,82 70,32 96,68" fill={c.bodyColor} stroke="#d4691e" strokeWidth="3" strokeLinejoin="round" />
      <polygon points="142,82 130,32 104,68" fill={c.bodyColor} stroke="#d4691e" strokeWidth="3" strokeLinejoin="round" />
      <polygon points="67,68 72,46 86,62" fill="#7a3f16" />
      <polygon points="133,68 128,46 114,62" fill="#7a3f16" />
      {/* 脚 */}
      <ellipse cx="78" cy="164" rx="15" ry="9" fill={c.bodyColor} stroke="#d4691e" strokeWidth="3" />
      <ellipse cx="122" cy="164" rx="15" ry="9" fill={c.bodyColor} stroke="#d4691e" strokeWidth="3" />
      {/* 身体 */}
      <circle cx="100" cy="115" r="52" fill={c.bodyColor} stroke="#d4691e" strokeWidth="3" />
      {/* 白色脸颊 + 口鼻 */}
      <ellipse cx="64" cy="132" rx="15" ry="11" fill="#fff" transform="rotate(-15 64 132)" />
      <ellipse cx="136" cy="132" rx="15" ry="11" fill="#fff" transform="rotate(15 136 132)" />
      <ellipse cx="100" cy="132" rx="21" ry="14" fill="#fff" />
      <Eyes face={face} />
      <Blush color={c.blush} />
      <ellipse cx="100" cy="126" rx="6" ry="5" fill="#5b3a29" />
      <Mouth face={face} y={132} />
      {deco}
    </g>
  );
}

// ---------- 装饰：蝴蝶结（stage 3+） ----------
function Bow() {
  return (
    <g transform="translate(138 52)">
      <polygon points="0,0 -20,-12 -20,12" fill="#ff6b9d" stroke="#e14e7f" strokeWidth="2" strokeLinejoin="round" />
      <polygon points="0,0 20,-12 20,12" fill="#ff6b9d" stroke="#e14e7f" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="0" cy="0" r="7" fill="#ff477e" stroke="#e14e7f" strokeWidth="2" />
    </g>
  );
}

// ---------- 装饰：皇冠 + 星光（stage 4） ----------
function Crown() {
  return (
    <g>
      <polygon points="78,34 84,12 94,26 100,8 106,26 116,12 122,34" fill="#ffd93d" stroke="#e8a100" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="100" cy="8" r="4" fill="#ff6b9d" />
      {/* 星光 */}
      <g fill="#fff3a0" stroke="#e8a100" strokeWidth="1.5">
        <path d="M40 60 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3 Z" className="sparkle" />
        <path d="M160 70 l2.5 7 7 2.5 -7 2.5 -2.5 7 -2.5 -7 -7 -2.5 7 -2.5 Z" className="sparkle s2" />
        <path d="M150 150 l2.5 7 7 2.5 -7 2.5 -2.5 7 -2.5 -7 -7 -2.5 7 -2.5 Z" className="sparkle s3" />
      </g>
    </g>
  );
}

// ---------- 装饰：彩虹光环（stage 7） ----------
function RainbowHalo() {
  return (
    <g fill="none" strokeWidth="6" strokeLinecap="round">
      <path d="M38 98 A70 70 0 0 1 162 98" stroke="#ff8fb3" opacity="0.9" />
      <path d="M47 98 A61 61 0 0 1 153 98" stroke="#ffd93d" opacity="0.9" />
      <path d="M56 98 A52 52 0 0 1 144 98" stroke="#7ed6a5" opacity="0.9" />
      <path d="M65 98 A43 43 0 0 1 135 98" stroke="#8fb8ff" opacity="0.9" />
    </g>
  );
}

// ---------- 玉桂狗：白色 + 超长垂耳 + 粉腮红 + 肉桂卷尾巴 ----------
function Cinnamoroll({ face, deco }) {
  return (
    <g>
      {/* 超长垂耳朵：从头顶一直垂到脚边 */}
      <path d="M66 74 C44 92 36 128 44 160 C48 174 66 172 68 158 C72 128 74 100 78 80 Z"
        fill="#ffffff" stroke="#9db8dd" strokeWidth="3" strokeLinejoin="round" />
      <path d="M134 74 C156 92 164 128 156 160 C152 174 134 172 132 158 C128 128 126 100 122 80 Z"
        fill="#ffffff" stroke="#9db8dd" strokeWidth="3" strokeLinejoin="round" />
      {/* 肉桂卷小尾巴 */}
      <g transform="translate(152 136)">
        <circle r="10" fill="#ffffff" stroke="#9db8dd" strokeWidth="2.5" />
        <path d="M0 -5 a5 5 0 1 1 -5 5 a3 3 0 1 0 3 -3" fill="none" stroke="#9db8dd" strokeWidth="2" strokeLinecap="round" />
      </g>
      {/* 脚 */}
      <ellipse cx="78" cy="164" rx="15" ry="9" fill="#ffffff" stroke="#9db8dd" strokeWidth="3" />
      <ellipse cx="122" cy="164" rx="15" ry="9" fill="#ffffff" stroke="#9db8dd" strokeWidth="3" />
      {/* 圆滚滚的身体 */}
      <circle cx="100" cy="115" r="52" fill="#ffffff" stroke="#9db8dd" strokeWidth="3" />
      {/* 脸 */}
      <Eyes face={face} />
      <Blush color="#ffb3c7" />
      <Mouth face={face} y={127} />
      {deco}
    </g>
  );
}

// ---------- 大熊猫：黑白团子 + 黑眼圈 ----------
function Panda({ face, deco }) {
  return (
    <g>
      {/* 黑耳朵 */}
      <circle cx="62" cy="62" r="16" fill="#3d3d4d" />
      <circle cx="138" cy="62" r="16" fill="#3d3d4d" />
      {/* 黑手臂 */}
      <ellipse cx="50" cy="128" rx="11" ry="24" fill="#3d3d4d" transform="rotate(12 50 128)" />
      <ellipse cx="150" cy="128" rx="11" ry="24" fill="#3d3d4d" transform="rotate(-12 150 128)" />
      {/* 黑脚 */}
      <ellipse cx="78" cy="164" rx="15" ry="9" fill="#3d3d4d" />
      <ellipse cx="122" cy="164" rx="15" ry="9" fill="#3d3d4d" />
      {/* 圆滚滚的白身体 */}
      <circle cx="100" cy="115" r="52" fill="#ffffff" stroke="#d9d9e3" strokeWidth="3" />
      {/* 黑眼圈（比眼睛大一圈，露出黑边） */}
      <ellipse cx="82" cy="106" rx="17" ry="19" fill="#3d3d4d" transform="rotate(-10 82 106)" />
      <ellipse cx="118" cy="106" rx="17" ry="19" fill="#3d3d4d" transform="rotate(10 118 106)" />
      {/* 脸 */}
      <Eyes face={face} />
      <Blush color="#ffb3c7" />
      <ellipse cx="100" cy="120" rx="6" ry="4.5" fill="#3d3d4d" />
      <Mouth face={face} y={127} />
      {deco}
    </g>
  );
}

// ---------- 棕熊：圆乎乎 + 圆耳朵 + 浅色口鼻 ----------
function Bear({ face, deco }) {
  const c = PETS.bear;
  return (
    <g>
      {/* 圆耳朵 */}
      <circle cx="64" cy="60" r="17" fill={c.bodyColor} stroke="#a06a35" strokeWidth="3" />
      <circle cx="136" cy="60" r="17" fill={c.bodyColor} stroke="#a06a35" strokeWidth="3" />
      <circle cx="64" cy="60" r="8" fill="#e8b98a" />
      <circle cx="136" cy="60" r="8" fill="#e8b98a" />
      {/* 脚 */}
      <ellipse cx="78" cy="164" rx="15" ry="9" fill={c.bodyColor} stroke="#a06a35" strokeWidth="3" />
      <ellipse cx="122" cy="164" rx="15" ry="9" fill={c.bodyColor} stroke="#a06a35" strokeWidth="3" />
      {/* 圆滚滚的身体 */}
      <circle cx="100" cy="115" r="52" fill={c.bodyColor} stroke="#a06a35" strokeWidth="3" />
      {/* 肚皮 */}
      <ellipse cx="100" cy="144" rx="26" ry="19" fill="#e8b98a" opacity="0.65" />
      {/* 浅色口鼻 */}
      <ellipse cx="100" cy="130" rx="20" ry="14" fill="#f2d3a7" />
      <Eyes face={face} />
      <Blush color={c.blush} />
      <ellipse cx="100" cy="126" rx="6" ry="5" fill="#5b3a29" />
      <Mouth face={face} y={132} />
      {deco}
    </g>
  );
}

// ---------- 企鹅：黑白身 + 小围巾 ----------
function Penguin({ face, deco }) {
  const c = PETS.penguin;
  return (
    <g>
      {/* 小翅膀 */}
      <ellipse cx="48" cy="122" rx="10" ry="26" fill={c.bodyColor} transform="rotate(14 48 122)" />
      <ellipse cx="152" cy="122" rx="10" ry="26" fill={c.bodyColor} transform="rotate(-14 152 122)" />
      {/* 脚 */}
      <ellipse cx="78" cy="164" rx="15" ry="9" fill="#ff9d4d" />
      <ellipse cx="122" cy="164" rx="15" ry="9" fill="#ff9d4d" />
      {/* 身体 */}
      <circle cx="100" cy="115" r="52" fill={c.bodyColor} stroke="#3a3a48" strokeWidth="3" />
      {/* 白肚皮 + 白脸蛋 */}
      <ellipse cx="100" cy="142" rx="28" ry="22" fill="#ffffff" />
      <ellipse cx="100" cy="110" rx="30" ry="24" fill="#ffffff" />
      {/* 小围巾 */}
      <g>
        <rect x="58" y="128" width="84" height="15" rx="7.5" fill="#ff6b6b" />
        <circle cx="130" cy="140" r="8" fill="#e14e5a" />
        <rect x="124" y="144" width="12" height="20" rx="6" fill="#ff6b6b" transform="rotate(8 130 154)" />
      </g>
      <Eyes face={face} />
      <Blush color={c.blush} />
      {/* 喙 */}
      <polygon points="94,120 106,120 100,127" fill="#ff9d4d" />
      {deco}
    </g>
  );
}

// ---------- 神兽麒麟（原创Q版）：鹿身 + 小龙角 + 火焰鬃毛 + 鳞片纹 ----------
function Qilin({ face, deco }) {
  return (
    <g>
      {/* 小龙角 */}
      <g stroke="#c98d55" strokeWidth="5" strokeLinecap="round" fill="none">
        <path d="M78 52 L70 30 M78 52 L86 32" />
        <path d="M122 52 L114 30 M122 52 L130 32" />
      </g>
      <circle cx="70" cy="28" r="5" fill="#ffd93d" />
      <circle cx="86" cy="30" r="5" fill="#ffd93d" />
      <circle cx="114" cy="30" r="5" fill="#ffd93d" />
      <circle cx="130" cy="28" r="5" fill="#ffd93d" />
      {/* 火焰鬃毛 */}
      <g fill="#ff9d5e">
        <path d="M60 78 q-14 -8 -10 -26 q12 4 16 14 q-2 -16 10 -22 q4 14 2 24 q6 -10 16 -12 q-2 14 -12 22 Z" />
        <path d="M140 78 q14 -8 10 -26 q-12 4 -16 14 q2 -16 -10 -22 q-4 14 -2 24 q-6 -10 -16 -12 q2 14 12 22 Z" />
      </g>
      {/* 鹿耳 */}
      <ellipse cx="62" cy="66" rx="10" ry="16" fill="#e8b96a" stroke="#c98d55" strokeWidth="2.5" transform="rotate(-18 62 66)" />
      <ellipse cx="138" cy="66" rx="10" ry="16" fill="#e8b96a" stroke="#c98d55" strokeWidth="2.5" transform="rotate(18 138 66)" />
      {/* 蹄子 */}
      <ellipse cx="78" cy="164" rx="15" ry="9" fill="#8a5a2b" />
      <ellipse cx="122" cy="164" rx="15" ry="9" fill="#8a5a2b" />
      {/* 圆滚滚的身体（金麟色） */}
      <circle cx="100" cy="115" r="52" fill="#f2c14e" stroke="#c98d55" strokeWidth="3" />
      {/* 鳞片纹 */}
      <g fill="#e0a83c" opacity="0.55">
        <ellipse cx="100" cy="148" rx="14" ry="10" />
        <ellipse cx="72" cy="140" rx="10" ry="8" />
        <ellipse cx="128" cy="140" rx="10" ry="8" />
      </g>
      {/* 脸 */}
      <Eyes face={face} />
      <Blush color="#ff9d9d" />
      <ellipse cx="100" cy="122" rx="6" ry="4.5" fill="#8a5a2b" />
      <Mouth face={face} y={128} />
      {deco}
    </g>
  );
}

// ---------- 顶呱呱（原创寻宝小精灵）：薄荷绿团子 + 探险小帽 + 藏宝图围巾 ----------
function Dingguagua({ face, deco }) {
  return (
    <g>
      {/* 探险小帽 */}
      <g>
        <ellipse cx="100" cy="52" rx="34" ry="10" fill="#e8b96a" />
        <path d="M74 52 Q76 22 100 22 Q124 22 126 52 Z" fill="#f2c14e" stroke="#c98d55" strokeWidth="2.5" />
        <circle cx="100" cy="20" r="6" fill="#ff6b6b" />
      </g>
      {/* 小手臂 */}
      <ellipse cx="50" cy="128" rx="10" ry="22" fill="#a8e6b8" transform="rotate(14 50 128)" />
      <ellipse cx="150" cy="128" rx="10" ry="22" fill="#a8e6b8" transform="rotate(-14 150 128)" />
      {/* 脚 */}
      <ellipse cx="78" cy="164" rx="15" ry="9" fill="#8fd6a0" />
      <ellipse cx="122" cy="164" rx="15" ry="9" fill="#8fd6a0" />
      {/* 圆滚滚的薄荷绿身体 */}
      <circle cx="100" cy="115" r="52" fill="#bdf0cd" stroke="#7ecb93" strokeWidth="3" />
      {/* 肚皮上的星星藏宝记号 */}
      <g transform="translate(100 148)" fill="#ffd93d" stroke="#e0a83c" strokeWidth="1.5">
        <polygon points="0,-12 3.5,-3.7 12,-3.7 5.2,2.2 7.6,10.5 0,5.5 -7.6,10.5 -5.2,2.2 -12,-3.7 -3.5,-3.7" />
      </g>
      {/* 脸 */}
      <Eyes face={face} />
      <Blush color="#ff9d9d" />
      <ellipse cx="100" cy="121" rx="5.5" ry="4" fill="#4a7c59" />
      <Mouth face={face} y={127} />
      {deco}
    </g>
  );
}

const EGG_TINT = { bunny: '#ffe9f2', cat: '#ffedda', fox: '#ffe4cf', cinnamoroll: '#eef2f7', bear: '#f0e2d0', penguin: '#e8eef5', panda: '#eef0f4', qilin: '#fdf3d8', dingguagua: '#e2f7e9' };

// 阶段缩放：越长大越大只
const STAGE_SCALE = [1, 0.72, 0.82, 0.92, 1.0, 1.08, 1.14, 1.2];

/**
 * 宠物形象主组件
 * @param type bunny | cat | fox | cinnamoroll | bear | penguin | panda | qilin | dingguagua
 * @param stage 0-7 成长阶段
 * @param face normal | happy | sleepy
 */
export function PetAvatar({ type, stage, face = 'normal', className = '' }) {
  // 老存档里的 pochacco 自动转为 cinnamoroll
  const t = type === 'pochacco' ? 'cinnamoroll' : type;
  let body;
  const deco = (
    <>
      {stage === 5 && <Bow />}
      {stage === 6 && <Crown />}
      {stage === 7 && (<><Crown /><RainbowHalo /></>)}
    </>
  );
  if (stage === 0) {
    body = <Egg tint={EGG_TINT[t]} />;
  } else if (t === 'bunny') {
    body = <Bunny face={face} deco={deco} />;
  } else if (t === 'cat') {
    body = <Cat face={face} deco={deco} />;
  } else if (t === 'fox') {
    body = <Fox face={face} deco={deco} />;
  } else if (t === 'cinnamoroll') {
    body = <Cinnamoroll face={face} deco={deco} />;
  } else if (t === 'bear') {
    body = <Bear face={face} deco={deco} />;
  } else if (t === 'panda') {
    body = <Panda face={face} deco={deco} />;
  } else if (t === 'qilin') {
    body = <Qilin face={face} deco={deco} />;
  } else if (t === 'dingguagua') {
    body = <Dingguagua face={face} deco={deco} />;
  } else {
    body = <Penguin face={face} deco={deco} />;
  }
  const scale = STAGE_SCALE[stage] || 1;
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label="宠物">
      <g transform={`translate(100 108) scale(${scale}) translate(-100 -108)`}>
        {body}
      </g>
    </svg>
  );
}
