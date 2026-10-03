// ============================================================
// themes.js —— 10 个主题 × 12 个物品 = 120 词（去重后 112 个不同单词）
// id 规则：英文小写 + 下划线；跨主题重复的词共用同一张贴纸
// ============================================================

const T = (zh, en, items) => ({ zh, en, items });

export const THEMES = [
  {
    id: 'bedroom', zh: '我的卧室', en: 'Bedroom', emoji: '🛏️',
    bg: ['#ffe4ef', '#fff8fc'], accent: '#ff8fb3',
    ...T('我的卧室', 'Bedroom', [
      { id: 'bed', en: 'bed', zh: '床' },
      { id: 'pillow', en: 'pillow', zh: '枕头' },
      { id: 'lamp', en: 'lamp', zh: '台灯' },
      { id: 'teddy_bear', en: 'teddy bear', zh: '泰迪熊' },
      { id: 'book', en: 'book', zh: '书' },
      { id: 'clock', en: 'clock', zh: '闹钟' },
      { id: 'blanket', en: 'blanket', zh: '毯子' },
      { id: 'toy', en: 'toy', zh: '玩具' },
      { id: 'rug', en: 'rug', zh: '地毯' },
      { id: 'curtain', en: 'curtain', zh: '窗帘' },
      { id: 'mirror', en: 'mirror', zh: '镜子' },
      { id: 'chair', en: 'chair', zh: '椅子' },
    ]),
  },
  {
    id: 'kitchen', zh: '快乐厨房', en: 'Kitchen', emoji: '🍳',
    bg: ['#fff3d6', '#fffdf5'], accent: '#f5a623',
    ...T('快乐厨房', 'Kitchen', [
      { id: 'pot', en: 'pot', zh: '锅' },
      { id: 'pan', en: 'pan', zh: '平底锅' },
      { id: 'egg', en: 'egg', zh: '鸡蛋' },
      { id: 'milk', en: 'milk', zh: '牛奶' },
      { id: 'bread', en: 'bread', zh: '面包' },
      { id: 'fridge', en: 'fridge', zh: '冰箱' },
      { id: 'cup', en: 'cup', zh: '杯子' },
      { id: 'spoon', en: 'spoon', zh: '勺子' },
      { id: 'apple', en: 'apple', zh: '苹果' },
      { id: 'knife', en: 'knife', zh: '刀' },
      { id: 'fork', en: 'fork', zh: '叉子' },
      { id: 'plate', en: 'plate', zh: '盘子' },
    ]),
  },
  {
    id: 'supermarket', zh: '小小超市', en: 'Supermarket', emoji: '🛒',
    bg: ['#e3f2ff', '#f7fcff'], accent: '#4aa8ff',
    ...T('小小超市', 'Supermarket', [
      { id: 'cart', en: 'cart', zh: '购物车' },
      { id: 'banana', en: 'banana', zh: '香蕉' },
      { id: 'cookie', en: 'cookie', zh: '饼干' },
      { id: 'juice', en: 'juice', zh: '果汁' },
      { id: 'fish', en: 'fish', zh: '鱼' },
      { id: 'cake', en: 'cake', zh: '蛋糕' },
      { id: 'candy', en: 'candy', zh: '糖果' },
      { id: 'bag', en: 'bag', zh: '袋子' },
      { id: 'watermelon', en: 'watermelon', zh: '西瓜' },
      { id: 'milk', en: 'milk', zh: '牛奶' },
      { id: 'donut', en: 'donut', zh: '甜甜圈' },
      { id: 'grapes', en: 'grapes', zh: '葡萄' },
    ]),
  },
  {
    id: 'garden', zh: '美丽花园', en: 'Garden', emoji: '🌸',
    bg: ['#e2fbe8', '#fbfefb'], accent: '#5cc47c',
    ...T('美丽花园', 'Garden', [
      { id: 'flower', en: 'flower', zh: '花朵' },
      { id: 'tree', en: 'tree', zh: '大树' },
      { id: 'butterfly', en: 'butterfly', zh: '蝴蝶' },
      { id: 'bee', en: 'bee', zh: '蜜蜂' },
      { id: 'bird', en: 'bird', zh: '小鸟' },
      { id: 'sun', en: 'sun', zh: '太阳' },
      { id: 'watering_can', en: 'watering can', zh: '洒水壶' },
      { id: 'mushroom', en: 'mushroom', zh: '蘑菇' },
      { id: 'rainbow', en: 'rainbow', zh: '彩虹' },
      { id: 'snail', en: 'snail', zh: '蜗牛' },
      { id: 'ladybug', en: 'ladybug', zh: '瓢虫' },
      { id: 'fence', en: 'fence', zh: '篱笆' },
    ]),
  },
  {
    id: 'farm', zh: '快乐农场', en: 'Farm', emoji: '🐄',
    bg: ['#ffefd2', '#fffbf2'], accent: '#e8933c',
    ...T('快乐农场', 'Farm', [
      { id: 'cow', en: 'cow', zh: '奶牛' },
      { id: 'pig', en: 'pig', zh: '小猪' },
      { id: 'horse', en: 'horse', zh: '马' },
      { id: 'sheep', en: 'sheep', zh: '绵羊' },
      { id: 'chicken', en: 'chicken', zh: '小鸡' },
      { id: 'barn', en: 'barn', zh: '谷仓' },
      { id: 'tractor', en: 'tractor', zh: '拖拉机' },
      { id: 'hay', en: 'hay', zh: '干草' },
      { id: 'duck', en: 'duck', zh: '鸭子' },
      { id: 'goat', en: 'goat', zh: '山羊' },
      { id: 'rooster', en: 'rooster', zh: '公鸡' },
      { id: 'pond', en: 'pond', zh: '池塘' },
    ]),
  },
  {
    id: 'beach', zh: '沙滩度假', en: 'Beach', emoji: '🏖️',
    bg: ['#d8f4ff', '#fffdf7'], accent: '#38b6d6',
    ...T('沙滩度假', 'Beach', [
      { id: 'sandcastle', en: 'sandcastle', zh: '沙堡' },
      { id: 'crab', en: 'crab', zh: '螃蟹' },
      { id: 'shell', en: 'shell', zh: '贝壳' },
      { id: 'starfish', en: 'starfish', zh: '海星' },
      { id: 'beach_ball', en: 'beach ball', zh: '沙滩球' },
      { id: 'umbrella', en: 'umbrella', zh: '遮阳伞' },
      { id: 'towel', en: 'towel', zh: '毛巾' },
      { id: 'wave', en: 'wave', zh: '海浪' },
      { id: 'sailboat', en: 'sailboat', zh: '帆船' },
      { id: 'palm_tree', en: 'palm tree', zh: '棕榈树' },
      { id: 'sunglasses', en: 'sunglasses', zh: '太阳镜' },
      { id: 'bucket', en: 'bucket', zh: '水桶' },
    ]),
  },
  {
    id: 'school', zh: '开学啦', en: 'School', emoji: '🏫',
    bg: ['#e8ecff', '#fafbff'], accent: '#6c7fe0',
    ...T('开学啦', 'School', [
      { id: 'schoolbag', en: 'schoolbag', zh: '书包' },
      { id: 'pencil', en: 'pencil', zh: '铅笔' },
      { id: 'crayon', en: 'crayon', zh: '蜡笔' },
      { id: 'desk', en: 'desk', zh: '书桌' },
      { id: 'blackboard', en: 'blackboard', zh: '黑板' },
      { id: 'ruler', en: 'ruler', zh: '尺子' },
      { id: 'clock', en: 'clock', zh: '时钟' },
      { id: 'globe', en: 'globe', zh: '地球仪' },
      { id: 'book', en: 'book', zh: '书' },
      { id: 'eraser', en: 'eraser', zh: '橡皮' },
      { id: 'scissors', en: 'scissors', zh: '剪刀' },
      { id: 'notebook', en: 'notebook', zh: '笔记本' },
    ]),
  },
  {
    id: 'birthday', zh: '生日派对', en: 'Birthday Party', emoji: '🎂',
    bg: ['#ffe9fb', '#fffafc'], accent: '#e06cb8',
    ...T('生日派对', 'Birthday Party', [
      { id: 'cake', en: 'cake', zh: '蛋糕' },
      { id: 'candle', en: 'candle', zh: '蜡烛' },
      { id: 'balloon', en: 'balloon', zh: '气球' },
      { id: 'gift', en: 'gift', zh: '礼物' },
      { id: 'party_hat', en: 'party hat', zh: '派对帽' },
      { id: 'ice_cream', en: 'ice cream', zh: '冰淇淋' },
      { id: 'candy', en: 'candy', zh: '糖果' },
      { id: 'juice', en: 'juice', zh: '果汁' },
      { id: 'confetti', en: 'confetti', zh: '彩纸' },
      { id: 'cupcake', en: 'cupcake', zh: '纸杯蛋糕' },
      { id: 'camera', en: 'camera', zh: '相机' },
      { id: 'card', en: 'card', zh: '贺卡' },
    ]),
  },
  {
    id: 'petshop', zh: '宠物小店', en: 'Pet Shop', emoji: '🐾',
    bg: ['#ffe8d6', '#fffaf6'], accent: '#ef8f4c',
    ...T('宠物小店', 'Pet Shop', [
      { id: 'cat', en: 'cat', zh: '小猫' },
      { id: 'dog', en: 'dog', zh: '小狗' },
      { id: 'rabbit', en: 'rabbit', zh: '兔子' },
      { id: 'fish', en: 'fish', zh: '小鱼' },
      { id: 'bird', en: 'bird', zh: '小鸟' },
      { id: 'bone', en: 'bone', zh: '骨头' },
      { id: 'ball', en: 'ball', zh: '皮球' },
      { id: 'fish_tank', en: 'fish tank', zh: '鱼缸' },
      { id: 'pet_house', en: 'pet house', zh: '小窝' },
      { id: 'hamster', en: 'hamster', zh: '仓鼠' },
      { id: 'turtle', en: 'turtle', zh: '乌龟' },
      { id: 'leash', en: 'leash', zh: '牵引绳' },
    ]),
  },
  {
    id: 'space', zh: '太空冒险', en: 'Space', emoji: '🚀',
    bg: ['#2b2a55', '#4a3f78'], accent: '#ffd93d', dark: true,
    ...T('太空冒险', 'Space', [
      { id: 'rocket', en: 'rocket', zh: '火箭' },
      { id: 'planet', en: 'planet', zh: '星球' },
      { id: 'star', en: 'star', zh: '星星' },
      { id: 'moon', en: 'moon', zh: '月亮' },
      { id: 'astronaut', en: 'astronaut', zh: '宇航员' },
      { id: 'alien', en: 'alien', zh: '外星人' },
      { id: 'telescope', en: 'telescope', zh: '望远镜' },
      { id: 'saturn', en: 'saturn', zh: '土星' },
      { id: 'ufo', en: 'ufo', zh: '飞碟' },
      { id: 'comet', en: 'comet', zh: '彗星' },
      { id: 'space_station', en: 'space station', zh: '空间站' },
      { id: 'robot', en: 'robot', zh: '机器人' },
    ]),
  },
];

// 主题 i（1..9）解锁需要的收集单词数
export const unlockNeed = (i) => i * 8;

// 全局单词表（去重）：en -> zh，用于单词本展示
const _map = new Map();
for (const t of THEMES) {
  for (const it of t.items) {
    if (!_map.has(it.id)) _map.set(it.id, { id: it.id, en: it.en, zh: it.zh });
  }
}
export const ALL_WORDS = [..._map.values()];
export const TOTAL_WORDS = ALL_WORDS.length; // 112

export function wordOf(id) {
  return _map.get(id) || { id, en: id, zh: '' };
}
