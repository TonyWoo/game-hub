// ============================================================
// backgrounds.jsx —— 安静书 10 个主题的 SVG 场景背景（Q 版马卡龙风）
// 规则：背景 = 固定家具/环境，不可拖动、不可点读（pointer-events: none 由 .q-decor 保证）
// 严禁与本主题单词贴纸重复（重复的一律以贴纸为准，背景不画）
// viewBox 统一 400x300（场景 4:3），slice 填充
// 注意：BgArt 会同时渲染在场景和主题卡片缩略图里，禁止使用 <defs>/id（会冲突）
// ============================================================

export function BgArt({ themeId }) {
  switch (themeId) {
    case 'bedroom':
      return (
        <g>
          <rect x="0" y="0" width="400" height="215" fill="#ffe9f2" />
          <rect x="0" y="215" width="400" height="85" fill="#eac49c" />
          <path d="M0 236 H400 M0 258 H400 M0 279 H400" stroke="#d9a86f" strokeWidth="2" />
          <path d="M120 236 V258 M280 258 V279 M80 279 V300 M320 236 V258" stroke="#d9a86f" strokeWidth="2" />
          <rect x="0" y="207" width="400" height="9" fill="#ffffff" opacity="0.65" />
          {/* 窗户（不带窗帘——窗帘是单词贴纸） */}
          <rect x="36" y="34" width="120" height="100" rx="10" fill="#ffffff" />
          <rect x="46" y="44" width="100" height="80" rx="6" fill="#bfe3f7" />
          <path d="M96 44 V124 M46 84 H146" stroke="#ffffff" strokeWidth="6" />
          <ellipse cx="120" cy="66" rx="16" ry="9" fill="#ffffff" opacity="0.9" />
          <ellipse cx="106" cy="62" rx="9" ry="7" fill="#ffffff" opacity="0.9" />
          {/* 墙上小画框 */}
          <rect x="240" y="48" width="96" height="72" rx="8" fill="#c9a8e8" />
          <rect x="250" y="58" width="76" height="52" rx="4" fill="#ffffff" />
          <path d="M288 98 c-10-8-18-14-18-24 c0-7 5-11 11-11 c4 0 6 2 7 4 c1-2 3-4 7-4 c6 0 11 4 11 11 c0 10-8 16-18 24z" fill="#ff8fb3" />
        </g>
      );
    case 'kitchen':
      return (
        <g>
          <rect x="0" y="0" width="400" height="200" fill="#fff6e6" />
          <path d="M40 0 V200 M80 0 V200 M120 0 V200 M160 0 V200 M200 0 V200 M240 0 V200 M280 0 V200 M320 0 V200 M360 0 V200 M0 40 H400 M0 80 H400 M0 120 H400 M0 160 H400" stroke="#f2e2c2" strokeWidth="2" />
          {/* 窗户 */}
          <rect x="262" y="26" width="108" height="86" rx="10" fill="#ffffff" />
          <rect x="272" y="36" width="88" height="66" rx="6" fill="#bfe3f7" />
          <path d="M316 36 V102 M272 69 H360" stroke="#ffffff" strokeWidth="6" />
          {/* 空操作台（锅/盘子贴纸可放上去） */}
          <rect x="0" y="190" width="400" height="20" rx="6" fill="#ffffff" stroke="#e8dcc8" strokeWidth="2" />
          <rect x="0" y="210" width="400" height="90" fill="#f6bd60" />
          <path d="M100 210 V300 M200 210 V300 M300 210 V300" stroke="#e09a4a" strokeWidth="3" />
          <circle cx="50" cy="252" r="5" fill="#ffffff" />
          <circle cx="150" cy="252" r="5" fill="#ffffff" />
          <circle cx="250" cy="252" r="5" fill="#ffffff" />
          <circle cx="350" cy="252" r="5" fill="#ffffff" />
          {/* 空水槽 + 水龙头 */}
          <rect x="60" y="156" width="10" height="36" rx="5" fill="#9fb3c8" />
          <path d="M65 156 h24" stroke="#9fb3c8" strokeWidth="9" strokeLinecap="round" />
          <ellipse cx="122" cy="192" rx="36" ry="11" fill="#d9dee6" stroke="#b9c2cf" strokeWidth="2" />
          <ellipse cx="122" cy="192" rx="25" ry="7" fill="#eef1f6" />
        </g>
      );
    case 'supermarket':
      return (
        <g>
          <rect x="0" y="0" width="400" height="225" fill="#edf3fc" />
          <rect x="0" y="225" width="400" height="75" fill="#dbe4f2" />
          <path d="M0 250 H400 M0 275 H400" stroke="#c9d4e8" strokeWidth="2" />
          <rect x="60" y="8" width="100" height="10" rx="5" fill="#ffffff" opacity="0.85" />
          <rect x="240" y="8" width="100" height="10" rx="5" fill="#ffffff" opacity="0.85" />
          {/* 空货架（商品贴纸往上放） */}
          <rect x="48" y="44" width="210" height="180" rx="10" fill="#ffffff" stroke="#c9a8e8" strokeWidth="4" />
          <rect x="58" y="94" width="190" height="10" rx="5" fill="#d9c9f2" />
          <rect x="58" y="142" width="190" height="10" rx="5" fill="#d9c9f2" />
          <rect x="58" y="190" width="190" height="10" rx="5" fill="#d9c9f2" />
          {/* 收银台轮廓 */}
          <rect x="292" y="150" width="92" height="74" rx="10" fill="#bfe3f5" />
          <rect x="292" y="150" width="92" height="12" rx="6" fill="#8fc3e8" />
          <rect x="312" y="118" width="34" height="26" rx="4" fill="#6b5b6e" />
          <rect x="317" y="123" width="24" height="14" rx="2" fill="#9fd6ff" />
          <rect x="326" y="144" width="6" height="8" fill="#6b5b6e" />
        </g>
      );
    case 'garden':
      return (
        <g>
          <rect x="0" y="0" width="400" height="205" fill="#bde7ff" />
          <ellipse cx="90" cy="52" rx="30" ry="14" fill="#ffffff" opacity="0.95" />
          <ellipse cx="112" cy="46" rx="20" ry="12" fill="#ffffff" opacity="0.95" />
          <ellipse cx="310" cy="80" rx="26" ry="12" fill="#ffffff" opacity="0.9" />
          <path d="M0 205 L95 118 L190 205 Z" fill="#a8d5ba" />
          <path d="M130 205 L240 96 L350 205 Z" fill="#93c9a8" />
          <rect x="0" y="205" width="400" height="95" fill="#8fd6a0" />
          <ellipse cx="200" cy="330" rx="270" ry="95" fill="#7cc78f" />
          <path d="M160 300 C170 262 142 242 182 205 L226 205 C196 242 216 266 210 300 Z" fill="#f2e3c2" />
          <ellipse cx="195" cy="272" rx="5" ry="3" fill="#e0cfa8" />
          <ellipse cx="180" cy="288" rx="4" ry="2.5" fill="#e0cfa8" />
          <path d="M60 250 c2-8 4-12 8-14 M68 252 c0-8 2-12 6-15 M76 252 c-1-7 1-12 5-14" stroke="#5cae72" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M320 260 c2-8 4-12 8-14 M328 262 c0-8 2-12 6-15" stroke="#5cae72" strokeWidth="3" strokeLinecap="round" fill="none" />
        </g>
      );
    case 'farm':
      return (
        <g>
          <rect x="0" y="0" width="400" height="200" fill="#cdeffd" />
          <ellipse cx="100" cy="55" rx="30" ry="13" fill="#ffffff" opacity="0.95" />
          <ellipse cx="300" cy="70" rx="24" ry="11" fill="#ffffff" opacity="0.9" />
          <ellipse cx="70" cy="215" rx="150" ry="48" fill="#a9dba3" />
          <ellipse cx="340" cy="220" rx="160" ry="52" fill="#9bd195" />
          <rect x="0" y="200" width="400" height="100" fill="#a3d9a0" />
          <path d="M180 300 C186 266 162 246 196 200 L242 200 C216 246 232 268 226 300 Z" fill="#eac49c" />
          <path d="M90 262 c2-8 4-12 8-14 M98 264 c0-8 2-12 6-15" stroke="#6fae6f" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M310 270 c2-8 4-12 8-14" stroke="#6fae6f" strokeWidth="3" strokeLinecap="round" fill="none" />
        </g>
      );
    case 'beach':
      return (
        <g>
          <rect x="0" y="0" width="400" height="135" fill="#bde9ff" />
          <ellipse cx="300" cy="42" rx="28" ry="12" fill="#ffffff" opacity="0.95" />
          <ellipse cx="322" cy="36" rx="18" ry="10" fill="#ffffff" opacity="0.95" />
          <rect x="0" y="135" width="400" height="65" fill="#6fc3e8" />
          <rect x="0" y="135" width="400" height="6" fill="#a5dcf5" />
          <rect x="0" y="200" width="400" height="100" fill="#f7e3b5" />
          <circle cx="80" cy="250" r="2.5" fill="#ecd3a0" />
          <circle cx="200" cy="270" r="2.5" fill="#ecd3a0" />
          <circle cx="320" cy="245" r="2.5" fill="#ecd3a0" />
          <circle cx="150" cy="228" r="2" fill="#ecd3a0" />
          <circle cx="260" cy="288" r="2" fill="#ecd3a0" />
        </g>
      );
    case 'school':
      return (
        <g>
          <rect x="0" y="0" width="400" height="195" fill="#efeaff" />
          <rect x="0" y="195" width="400" height="105" fill="#eac49c" />
          <path d="M0 222 H400 M0 249 H400 M0 276 H400" stroke="#d9a86f" strokeWidth="2" />
          <rect x="0" y="187" width="400" height="9" fill="#ffffff" opacity="0.65" />
          <rect x="36" y="36" width="118" height="96" rx="10" fill="#ffffff" />
          <rect x="46" y="46" width="98" height="76" rx="6" fill="#bfe3f7" />
          <path d="M95 46 V122 M46 84 H144" stroke="#ffffff" strokeWidth="6" />
          {/* 贴了画的空墙（不画黑板——黑板是单词贴纸） */}
          <rect x="220" y="40" width="72" height="58" rx="6" fill="#ffffff" stroke="#c9a8e8" strokeWidth="3" />
          <text x="256" y="78" textAnchor="middle" fontSize="26" fontWeight="800" fill="#ff8fb3" fontFamily="'PingFang SC','Microsoft YaHei',sans-serif">ABC</text>
          <rect x="308" y="52" width="58" height="46" rx="6" fill="#ffffff" stroke="#9fd6e8" strokeWidth="3" />
          <path d="M337 86 c-7-6-12-10-12-17 c0-5 3.5-8 7.5-8 c3 0 4.5 1.5 5.5 3 c1-1.5 2.5-3 5.5-3 c4 0 7.5 3 7.5 8 c0 7-5 11-12 17z" fill="#ff8fb3" />
        </g>
      );
    case 'birthday':
      return (
        <g>
          <rect x="0" y="0" width="400" height="200" fill="#ffe9fb" />
          <rect x="0" y="200" width="400" height="100" fill="#eac49c" />
          <path d="M0 226 H400 M0 253 H400 M0 280 H400" stroke="#d9a86f" strokeWidth="2" />
          <rect x="300" y="28" width="82" height="72" rx="10" fill="#ffffff" />
          <rect x="309" y="37" width="64" height="54" rx="6" fill="#bfe3f7" />
          <path d="M341 37 V91 M309 64 H373" stroke="#ffffff" strokeWidth="5" />
          {/* 墙面拉花 */}
          <path d="M0 26 Q200 66 400 22" stroke="#d9a8e8" strokeWidth="3" fill="none" />
          <path d="M52 33 L64 33 L58 48 Z" fill="#ff8fb3" />
          <path d="M132 44 L144 44 L138 59 Z" fill="#ffd93d" />
          <path d="M212 49 L224 49 L218 64 Z" fill="#7cc7e8" />
          <path d="M292 42 L304 42 L298 57 Z" fill="#ff8fb3" />
          {/* 空桌子（蛋糕贴纸放桌上） */}
          <rect x="168" y="212" width="13" height="66" rx="6" fill="#b08968" />
          <rect x="259" y="212" width="13" height="66" rx="6" fill="#b08968" />
          <rect x="132" y="206" width="176" height="42" rx="6" fill="#ffd6e7" />
          <circle cx="141" cy="248" r="9" fill="#ffd6e7" />
          <circle cx="159" cy="248" r="9" fill="#ffd6e7" />
          <circle cx="177" cy="248" r="9" fill="#ffd6e7" />
          <circle cx="195" cy="248" r="9" fill="#ffd6e7" />
          <circle cx="213" cy="248" r="9" fill="#ffd6e7" />
          <circle cx="231" cy="248" r="9" fill="#ffd6e7" />
          <circle cx="249" cy="248" r="9" fill="#ffd6e7" />
          <circle cx="267" cy="248" r="9" fill="#ffd6e7" />
          <circle cx="285" cy="248" r="9" fill="#ffd6e7" />
          <circle cx="303" cy="248" r="9" fill="#ffd6e7" />
          <ellipse cx="220" cy="200" rx="90" ry="13" fill="#ffffff" />
        </g>
      );
    case 'petshop':
      return (
        <g>
          <rect x="0" y="0" width="400" height="200" fill="#ffeddd" />
          <rect x="0" y="200" width="400" height="100" fill="#eed2ae" />
          <path d="M0 226 H400 M0 253 H400 M0 280 H400" stroke="#d9b58a" strokeWidth="2" />
          <rect x="300" y="28" width="82" height="72" rx="10" fill="#ffffff" />
          <rect x="309" y="37" width="64" height="54" rx="6" fill="#bfe3f7" />
          <path d="M341 37 V91 M309 64 H373" stroke="#ffffff" strokeWidth="5" />
          {/* 空展示架 */}
          <rect x="44" y="56" width="190" height="152" rx="10" fill="#ffffff" stroke="#d4a373" strokeWidth="4" />
          <rect x="52" y="104" width="174" height="9" rx="4.5" fill="#e8c49c" />
          <rect x="52" y="152" width="174" height="9" rx="4.5" fill="#e8c49c" />
          {/* PET 挂牌 */}
          <rect x="252" y="14" width="76" height="26" rx="13" fill="#ffffff" stroke="#f5b96d" strokeWidth="2.5" />
          <text x="290" y="32" textAnchor="middle" fontSize="15" fontWeight="800" fill="#e8933c" fontFamily="'PingFang SC','Microsoft YaHei',sans-serif">PET</text>
          {/* 爪印墙贴（装饰） */}
          <g fill="#f5b96d" opacity="0.75">
            <ellipse cx="272" cy="122" rx="9" ry="7" />
            <circle cx="263" cy="111" r="3.2" />
            <circle cx="272" cy="108" r="3.2" />
            <circle cx="281" cy="111" r="3.2" />
            <ellipse cx="292" cy="170" rx="7" ry="5.5" />
            <circle cx="285" cy="161" r="2.6" />
            <circle cx="292" cy="159" r="2.6" />
            <circle cx="299" cy="161" r="2.6" />
          </g>
        </g>
      );
    case 'space':
      return (
        <g>
          <rect x="0" y="0" width="400" height="300" fill="#23234d" />
          <ellipse cx="110" cy="90" rx="95" ry="58" fill="#7a5fc0" opacity="0.28" />
          <ellipse cx="300" cy="215" rx="105" ry="62" fill="#e06cb8" opacity="0.22" />
          <ellipse cx="255" cy="55" rx="62" ry="36" fill="#4a7a9c" opacity="0.25" />
          {/* 极小的远景星点（装饰用，比贴纸星星小得多） */}
          <g fill="#ffffff">
            <circle cx="40" cy="40" r="1.6" opacity="0.9" />
            <circle cx="120" cy="180" r="1.2" opacity="0.6" />
            <circle cx="180" cy="60" r="1.8" opacity="0.9" />
            <circle cx="230" cy="150" r="1.1" opacity="0.55" />
            <circle cx="290" cy="90" r="1.5" opacity="0.85" />
            <circle cx="350" cy="160" r="1.2" opacity="0.6" />
            <circle cx="70" cy="250" r="1.6" opacity="0.8" />
            <circle cx="160" cy="260" r="1.1" opacity="0.55" />
            <circle cx="250" cy="270" r="1.7" opacity="0.9" />
            <circle cx="340" cy="260" r="1.2" opacity="0.6" />
            <circle cx="200" cy="220" r="1.3" opacity="0.7" />
            <circle cx="90" cy="130" r="1.1" opacity="0.5" />
            <circle cx="320" cy="40" r="1.6" opacity="0.85" />
            <circle cx="30" cy="170" r="1.2" opacity="0.6" />
            <circle cx="370" cy="220" r="1.5" opacity="0.8" />
            <circle cx="140" cy="120" r="1" opacity="0.5" />
          </g>
          <path d="M86 216 h12 M92 210 v12" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
          <path d="M332 116 h10 M337 111 v10" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
        </g>
      );
    default:
      return (
        <g>
          <circle cx="48" cy="56" r="16" fill="#ffffff" opacity="0.6" />
          <circle cx="352" cy="72" r="12" fill="#ffffff" opacity="0.6" />
        </g>
      );
  }
}

// 场景用完整背景（含 .q-decor 定位类，pointer-events: none，不拦截贴纸手势）
export function SceneBackground({ themeId }) {
  return (
    <svg className="q-decor" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <BgArt themeId={themeId} />
    </svg>
  );
}
