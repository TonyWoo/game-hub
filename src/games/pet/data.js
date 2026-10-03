// ============================================================
// data.js —— 游戏全部静态数据：宠物、食物、单词题库、成长配置
// ============================================================

// 六只宠物配置
export const PETS = {
  bunny: {
    type: 'bunny',
    name: '小兔',
    emoji: '🐰',
    personality: '活泼好动，最爱蹦蹦跳跳',
    favoriteFood: 'carrot',          // 最爱吃的食物 id
    bodyColor: '#ffffff',
    earColor: '#ffd6e7',
    blush: '#ffb3c7',
  },
  cat: {
    type: 'cat',
    name: '小猫',
    emoji: '🐱',
    personality: '温柔爱撒娇，喜欢晒太阳',
    favoriteFood: 'fish',
    bodyColor: '#ffcf9e',
    earColor: '#ff9d76',
    blush: '#ff9d9d',
  },
  fox: {
    type: 'fox',
    name: '小狐狸',
    emoji: '🦊',
    personality: '聪明好奇，喜欢探险',
    favoriteFood: 'apple',
    bodyColor: '#ff9e5e',
    earColor: '#e56b2d',
    blush: '#ff9d9d',
  },
  cinnamoroll: {
    type: 'cinnamoroll',
    name: '玉桂狗',
    emoji: '🐶',
    personality: '长耳朵软乎乎，爱撒娇',
    favoriteFood: 'milk',
    bodyColor: '#ffffff',
    blush: '#ffb3c7',
  },
  bear: {
    type: 'bear',
    name: '棕熊',
    emoji: '🐻',
    personality: '憨憨的，抱起来最舒服',
    favoriteFood: 'cookie',
    bodyColor: '#c98d55',
    blush: '#ff9d9d',
  },
  penguin: {
    type: 'penguin',
    name: '企鹅',
    emoji: '🐧',
    personality: '摇摇摆摆走路，爱吃鱼',
    favoriteFood: 'fish',
    bodyColor: '#54546a',
    blush: '#ffb3c7',
  },
  panda: {
    type: 'panda',
    name: '大熊猫',
    emoji: '🐼',
    personality: '圆滚滚的团子，爱吃爱睡',
    favoriteFood: 'apple',
    bodyColor: '#ffffff',
    blush: '#ffb3c7',
  },
  qilin: {
    type: 'qilin',
    name: '神兽麒麟',
    emoji: '🦄',
    personality: '祥瑞神兽，带来好运',
    favoriteFood: 'apple',
    bodyColor: '#f2c14e',
    blush: '#ff9d9d',
  },
  dingguagua: {
    type: 'dingguagua',
    name: '顶呱呱',
    emoji: '🧭',
    personality: '寻宝小精灵，最爱探险',
    favoriteFood: 'cookie',
    bodyColor: '#bdf0cd',
    blush: '#ff9d9d',
  },
};
export const PET_ORDER = ['bunny', 'cat', 'fox', 'cinnamoroll', 'bear', 'penguin', 'panda', 'qilin', 'dingguagua'];

// 食物：每种都是英文单词卡（英文 + 中文 + emoji）
export const FOODS = [
  { id: 'apple',  en: 'Apple',  zh: '苹果', emoji: '🍎' },
  { id: 'milk',   en: 'Milk',   zh: '牛奶', emoji: '🥛' },
  { id: 'carrot', en: 'Carrot', zh: '胡萝卜', emoji: '🥕' },
  { id: 'cookie', en: 'Cookie', zh: '饼干', emoji: '🍪' },
  { id: 'fish',   en: 'Fish',   zh: '鱼',   emoji: '🐟' },
  { id: 'banana', en: 'Banana', zh: '香蕉', emoji: '🍌' },
  { id: 'bread',  en: 'Bread',  zh: '面包', emoji: '🍞' },
  { id: 'cake',   en: 'Cake',   zh: '蛋糕', emoji: '🍰' },
  { id: 'icecream', en: 'Ice cream', zh: '冰淇淋', emoji: '🍨' },
  { id: 'strawberry', en: 'Strawberry', zh: '草莓', emoji: '🍓' },
  { id: 'grape',  en: 'Grape',  zh: '葡萄', emoji: '🍇' },
  { id: 'egg',    en: 'Egg',    zh: '鸡蛋', emoji: '🥚' },
];

// 按字符串种子洗牌：同一天结果稳定（用于每日菜单）
export function seededShuffle(arr, seedStr) {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rand = () => {
    h |= 0; h = (h + 0x6D2B79F5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 每日菜单：从食物池按日期选 6 种，当天固定；必含宠物的最爱食物
export function dailyFoods(dateStr, favoriteId, count = 6) {
  const picked = seededShuffle(FOODS, `menu-${dateStr}`).slice(0, count);
  if (favoriteId && !picked.some((f) => f.id === favoriteId)) {
    const fav = FOODS.find((f) => f.id === favoriteId);
    if (fav) picked[picked.length - 1] = fav;
  }
  return picked;
}

// 单词题库：2–3 年级水平，共 200 词（食物 / 动物 / 颜色 / 数字 / 家庭 / 学校 / 身体 / 衣服 / 自然 / 动作 / 交通）
export const WORDS = [
  { en: 'Apple', zh: '苹果', emoji: '🍎', cat: '食物' },
  { en: 'Banana', zh: '香蕉', emoji: '🍌', cat: '食物' },
  { en: 'Lemon', zh: '柠檬', emoji: '🍋', cat: '食物' },
  { en: 'Grape', zh: '葡萄', emoji: '🍇', cat: '食物' },
  { en: 'Watermelon', zh: '西瓜', emoji: '🍉', cat: '食物' },
  { en: 'Strawberry', zh: '草莓', emoji: '🍓', cat: '食物' },
  { en: 'Pear', zh: '梨', emoji: '🍐', cat: '食物' },
  { en: 'Peach', zh: '桃子', emoji: '🍑', cat: '食物' },
  { en: 'Mango', zh: '芒果', emoji: '🥭', cat: '食物' },
  { en: 'Pineapple', zh: '菠萝', emoji: '🍍', cat: '食物' },
  { en: 'Carrot', zh: '胡萝卜', emoji: '🥕', cat: '食物' },
  { en: 'Milk', zh: '牛奶', emoji: '🥛', cat: '食物' },
  { en: 'Juice', zh: '果汁', emoji: '🧃', cat: '食物' },
  { en: 'Water', zh: '水', emoji: '💧', cat: '食物' },
  { en: 'Tea', zh: '茶', emoji: '🍵', cat: '食物' },
  { en: 'Egg', zh: '鸡蛋', emoji: '🥚', cat: '食物' },
  { en: 'Bread', zh: '面包', emoji: '🍞', cat: '食物' },
  { en: 'Rice', zh: '米饭', emoji: '🍚', cat: '食物' },
  { en: 'Noodles', zh: '面条', emoji: '🍜', cat: '食物' },
  { en: 'Meat', zh: '肉', emoji: '🥩', cat: '食物' },
  { en: 'Chicken', zh: '鸡肉', emoji: '🍗', cat: '食物' },
  { en: 'Cake', zh: '蛋糕', emoji: '🍰', cat: '食物' },
  { en: 'Cookie', zh: '饼干', emoji: '🍪', cat: '食物' },
  { en: 'Candy', zh: '糖果', emoji: '🍬', cat: '食物' },
  { en: 'Chocolate', zh: '巧克力', emoji: '🍫', cat: '食物' },
  { en: 'Ice cream', zh: '冰淇淋', emoji: '🍨', cat: '食物' },
  { en: 'Hamburger', zh: '汉堡包', emoji: '🍔', cat: '食物' },
  { en: 'Pizza', zh: '披萨', emoji: '🍕', cat: '食物' },
  { en: 'Soup', zh: '汤', emoji: '🍲', cat: '食物' },
  { en: 'Salad', zh: '沙拉', emoji: '🥗', cat: '食物' },
  { en: 'Dog', zh: '狗', emoji: '🐶', cat: '动物' },
  { en: 'Cat', zh: '猫', emoji: '🐱', cat: '动物' },
  { en: 'Bird', zh: '鸟', emoji: '🐦', cat: '动物' },
  { en: 'Fish', zh: '鱼', emoji: '🐟', cat: '动物' },
  { en: 'Rabbit', zh: '兔子', emoji: '🐰', cat: '动物' },
  { en: 'Duck', zh: '鸭子', emoji: '🦆', cat: '动物' },
  { en: 'Pig', zh: '猪', emoji: '🐷', cat: '动物' },
  { en: 'Cow', zh: '奶牛', emoji: '🐄', cat: '动物' },
  { en: 'Horse', zh: '马', emoji: '🐴', cat: '动物' },
  { en: 'Sheep', zh: '绵羊', emoji: '🐑', cat: '动物' },
  { en: 'Monkey', zh: '猴子', emoji: '🐵', cat: '动物' },
  { en: 'Tiger', zh: '老虎', emoji: '🐯', cat: '动物' },
  { en: 'Lion', zh: '狮子', emoji: '🦁', cat: '动物' },
  { en: 'Elephant', zh: '大象', emoji: '🐘', cat: '动物' },
  { en: 'Panda', zh: '熊猫', emoji: '🐼', cat: '动物' },
  { en: 'Bear', zh: '熊', emoji: '🐻', cat: '动物' },
  { en: 'Fox', zh: '狐狸', emoji: '🦊', cat: '动物' },
  { en: 'Frog', zh: '青蛙', emoji: '🐸', cat: '动物' },
  { en: 'Mouse', zh: '老鼠', emoji: '🐭', cat: '动物' },
  { en: 'Snake', zh: '蛇', emoji: '🐍', cat: '动物' },
  { en: 'Bee', zh: '蜜蜂', emoji: '🐝', cat: '动物' },
  { en: 'Butterfly', zh: '蝴蝶', emoji: '🦋', cat: '动物' },
  { en: 'Turtle', zh: '乌龟', emoji: '🐢', cat: '动物' },
  { en: 'Whale', zh: '鲸鱼', emoji: '🐳', cat: '动物' },
  { en: 'Shark', zh: '鲨鱼', emoji: '🦈', cat: '动物' },
  { en: 'Penguin', zh: '企鹅', emoji: '🐧', cat: '动物' },
  { en: 'Koala', zh: '考拉', emoji: '🐨', cat: '动物' },
  { en: 'Giraffe', zh: '长颈鹿', emoji: '🦒', cat: '动物' },
  { en: 'Zebra', zh: '斑马', emoji: '🦓', cat: '动物' },
  { en: 'Spider', zh: '蜘蛛', emoji: '🕷️', cat: '动物' },
  { en: 'Red', zh: '红色', emoji: '🟥', cat: '颜色' },
  { en: 'Orange', zh: '橙色', emoji: '🟧', cat: '颜色' },
  { en: 'Yellow', zh: '黄色', emoji: '🟨', cat: '颜色' },
  { en: 'Green', zh: '绿色', emoji: '🟩', cat: '颜色' },
  { en: 'Blue', zh: '蓝色', emoji: '🟦', cat: '颜色' },
  { en: 'Purple', zh: '紫色', emoji: '🟪', cat: '颜色' },
  { en: 'Pink', zh: '粉色', emoji: '🌸', cat: '颜色' },
  { en: 'Brown', zh: '棕色', emoji: '🟫', cat: '颜色' },
  { en: 'Black', zh: '黑色', emoji: '⬛', cat: '颜色' },
  { en: 'White', zh: '白色', emoji: '⬜', cat: '颜色' },
  { en: 'Gray', zh: '灰色', emoji: '🔘', cat: '颜色' },
  { en: 'Gold', zh: '金色', emoji: '🪙', cat: '颜色' },
  { en: 'One', zh: '一', emoji: '1️⃣', cat: '数字' },
  { en: 'Two', zh: '二', emoji: '2️⃣', cat: '数字' },
  { en: 'Three', zh: '三', emoji: '3️⃣', cat: '数字' },
  { en: 'Four', zh: '四', emoji: '4️⃣', cat: '数字' },
  { en: 'Five', zh: '五', emoji: '5️⃣', cat: '数字' },
  { en: 'Six', zh: '六', emoji: '6️⃣', cat: '数字' },
  { en: 'Seven', zh: '七', emoji: '7️⃣', cat: '数字' },
  { en: 'Eight', zh: '八', emoji: '8️⃣', cat: '数字' },
  { en: 'Nine', zh: '九', emoji: '9️⃣', cat: '数字' },
  { en: 'Ten', zh: '十', emoji: '🔟', cat: '数字' },
  { en: 'Eleven', zh: '十一', emoji: '1️⃣1️⃣', cat: '数字' },
  { en: 'Twelve', zh: '十二', emoji: '1️⃣2️⃣', cat: '数字' },
  { en: 'Father', zh: '爸爸', emoji: '👨', cat: '家庭' },
  { en: 'Mother', zh: '妈妈', emoji: '👩', cat: '家庭' },
  { en: 'Brother', zh: '兄弟', emoji: '👦', cat: '家庭' },
  { en: 'Sister', zh: '姐妹', emoji: '👧', cat: '家庭' },
  { en: 'Grandfather', zh: '祖父', emoji: '👴', cat: '家庭' },
  { en: 'Grandmother', zh: '祖母', emoji: '👵', cat: '家庭' },
  { en: 'Baby', zh: '婴儿', emoji: '👶', cat: '家庭' },
  { en: 'Family', zh: '家庭', emoji: '👪', cat: '家庭' },
  { en: 'Home', zh: '家', emoji: '🏠', cat: '家庭' },
  { en: 'Kitchen', zh: '厨房', emoji: '🍳', cat: '家庭' },
  { en: 'Bedroom', zh: '卧室', emoji: '🛏️', cat: '家庭' },
  { en: 'Bathroom', zh: '卫生间', emoji: '🚿', cat: '家庭' },
  { en: 'Living room', zh: '客厅', emoji: '🛋️', cat: '家庭' },
  { en: 'Table', zh: '桌子', emoji: '🍽️', cat: '家庭' },
  { en: 'School', zh: '学校', emoji: '🏫', cat: '学校' },
  { en: 'Teacher', zh: '老师', emoji: '👩‍🏫', cat: '学校' },
  { en: 'Student', zh: '学生', emoji: '🧑‍🎓', cat: '学校' },
  { en: 'Book', zh: '书', emoji: '📖', cat: '学校' },
  { en: 'Pen', zh: '钢笔', emoji: '🖊️', cat: '学校' },
  { en: 'Pencil', zh: '铅笔', emoji: '✏️', cat: '学校' },
  { en: 'Eraser', zh: '橡皮', emoji: '🧽', cat: '学校' },
  { en: 'Ruler', zh: '尺子', emoji: '📏', cat: '学校' },
  { en: 'Bag', zh: '书包', emoji: '🎒', cat: '学校' },
  { en: 'Notebook', zh: '笔记本', emoji: '📓', cat: '学校' },
  { en: 'Crayon', zh: '蜡笔', emoji: '🖍️', cat: '学校' },
  { en: 'Scissors', zh: '剪刀', emoji: '✂️', cat: '学校' },
  { en: 'Library', zh: '图书馆', emoji: '📚', cat: '学校' },
  { en: 'Music', zh: '音乐', emoji: '🎵', cat: '学校' },
  { en: 'Art', zh: '美术', emoji: '🎨', cat: '学校' },
  { en: 'Sport', zh: '运动', emoji: '🏀', cat: '学校' },
  { en: 'Homework', zh: '作业', emoji: '📝', cat: '学校' },
  { en: 'Friend', zh: '朋友', emoji: '🧑‍🤝‍🧑', cat: '学校' },
  { en: 'Bell', zh: '铃', emoji: '🔔', cat: '学校' },
  { en: 'Lunch', zh: '午餐', emoji: '🍱', cat: '学校' },
  { en: 'Playground', zh: '操场', emoji: '🛝', cat: '学校' },
  { en: 'Classroom', zh: '教室', emoji: '🏛️', cat: '学校' },
  { en: 'Face', zh: '脸', emoji: '😊', cat: '身体' },
  { en: 'Eye', zh: '眼睛', emoji: '👁️', cat: '身体' },
  { en: 'Nose', zh: '鼻子', emoji: '👃', cat: '身体' },
  { en: 'Mouth', zh: '嘴', emoji: '👄', cat: '身体' },
  { en: 'Ear', zh: '耳朵', emoji: '👂', cat: '身体' },
  { en: 'Tooth', zh: '牙齿', emoji: '🦷', cat: '身体' },
  { en: 'Hand', zh: '手', emoji: '✋', cat: '身体' },
  { en: 'Foot', zh: '脚', emoji: '🦶', cat: '身体' },
  { en: 'Arm', zh: '手臂', emoji: '💪', cat: '身体' },
  { en: 'Leg', zh: '腿', emoji: '🦵', cat: '身体' },
  { en: 'Hair', zh: '头发', emoji: '💇', cat: '身体' },
  { en: 'Finger', zh: '手指', emoji: '👆', cat: '身体' },
  { en: 'Heart', zh: '心脏', emoji: '❤️', cat: '身体' },
  { en: 'Body', zh: '身体', emoji: '🧍', cat: '身体' },
  { en: 'Shirt', zh: '衬衫', emoji: '👔', cat: '衣服' },
  { en: 'T-shirt', zh: 'T恤', emoji: '👕', cat: '衣服' },
  { en: 'Pants', zh: '裤子', emoji: '👖', cat: '衣服' },
  { en: 'Dress', zh: '连衣裙', emoji: '👗', cat: '衣服' },
  { en: 'Coat', zh: '外套', emoji: '🧥', cat: '衣服' },
  { en: 'Socks', zh: '袜子', emoji: '🧦', cat: '衣服' },
  { en: 'Shoes', zh: '鞋子', emoji: '👟', cat: '衣服' },
  { en: 'Hat', zh: '帽子', emoji: '🎩', cat: '衣服' },
  { en: 'Cap', zh: '鸭舌帽', emoji: '🧢', cat: '衣服' },
  { en: 'Scarf', zh: '围巾', emoji: '🧣', cat: '衣服' },
  { en: 'Gloves', zh: '手套', emoji: '🧤', cat: '衣服' },
  { en: 'Shorts', zh: '短裤', emoji: '🩳', cat: '衣服' },
  { en: 'Sun', zh: '太阳', emoji: '☀️', cat: '自然' },
  { en: 'Moon', zh: '月亮', emoji: '🌙', cat: '自然' },
  { en: 'Star', zh: '星星', emoji: '⭐', cat: '自然' },
  { en: 'Cloud', zh: '云', emoji: '☁️', cat: '自然' },
  { en: 'Rain', zh: '雨', emoji: '🌧️', cat: '自然' },
  { en: 'Snow', zh: '雪', emoji: '❄️', cat: '自然' },
  { en: 'Wind', zh: '风', emoji: '🌬️', cat: '自然' },
  { en: 'Rainbow', zh: '彩虹', emoji: '🌈', cat: '自然' },
  { en: 'Flower', zh: '花', emoji: '🌸', cat: '自然' },
  { en: 'Tree', zh: '树', emoji: '🌳', cat: '自然' },
  { en: 'Grass', zh: '草', emoji: '🌱', cat: '自然' },
  { en: 'Leaf', zh: '叶子', emoji: '🍃', cat: '自然' },
  { en: 'Mountain', zh: '山', emoji: '⛰️', cat: '自然' },
  { en: 'River', zh: '河', emoji: '🏞️', cat: '自然' },
  { en: 'Sea', zh: '大海', emoji: '🌊', cat: '自然' },
  { en: 'Stone', zh: '石头', emoji: '🪨', cat: '自然' },
  { en: 'Run', zh: '跑步', emoji: '🏃', cat: '动作' },
  { en: 'Walk', zh: '走路', emoji: '🚶', cat: '动作' },
  { en: 'Jump', zh: '跳', emoji: '🤸', cat: '动作' },
  { en: 'Swim', zh: '游泳', emoji: '🏊', cat: '动作' },
  { en: 'Sing', zh: '唱歌', emoji: '🎤', cat: '动作' },
  { en: 'Dance', zh: '跳舞', emoji: '💃', cat: '动作' },
  { en: 'Sleep', zh: '睡觉', emoji: '😴', cat: '动作' },
  { en: 'Eat', zh: '吃', emoji: '🍽️', cat: '动作' },
  { en: 'Drink', zh: '喝', emoji: '🥤', cat: '动作' },
  { en: 'Laugh', zh: '笑', emoji: '😂', cat: '动作' },
  { en: 'Cry', zh: '哭', emoji: '😢', cat: '动作' },
  { en: 'Smile', zh: '微笑', emoji: '😄', cat: '动作' },
  { en: 'Clap', zh: '鼓掌', emoji: '👏', cat: '动作' },
  { en: 'Wave', zh: '挥手', emoji: '👋', cat: '动作' },
  { en: 'Kick', zh: '踢', emoji: '⚽', cat: '动作' },
  { en: 'Throw', zh: '扔', emoji: '🤾', cat: '动作' },
  { en: 'Catch', zh: '接', emoji: '🤲', cat: '动作' },
  { en: 'Sit', zh: '坐', emoji: '💺', cat: '动作' },
  { en: 'Stand', zh: '站', emoji: '🧍', cat: '动作' },
  { en: 'Turn', zh: '转', emoji: '🔄', cat: '动作' },
  { en: 'Stop', zh: '停', emoji: '🛑', cat: '动作' },
  { en: 'Go', zh: '去', emoji: '🟢', cat: '动作' },
  { en: 'Wash', zh: '洗', emoji: '🧼', cat: '动作' },
  { en: 'Cook', zh: '做饭', emoji: '🍳', cat: '动作' },
  { en: 'Car', zh: '汽车', emoji: '🚗', cat: '交通' },
  { en: 'Bus', zh: '公交车', emoji: '🚌', cat: '交通' },
  { en: 'Bike', zh: '自行车', emoji: '🚲', cat: '交通' },
  { en: 'Train', zh: '火车', emoji: '🚂', cat: '交通' },
  { en: 'Plane', zh: '飞机', emoji: '✈️', cat: '交通' },
  { en: 'Ship', zh: '轮船', emoji: '🚢', cat: '交通' },
  { en: 'Boat', zh: '小船', emoji: '⛵', cat: '交通' },
  { en: 'Taxi', zh: '出租车', emoji: '🚕', cat: '交通' },
  { en: 'Truck', zh: '卡车', emoji: '🚚', cat: '交通' },
  { en: 'Subway', zh: '地铁', emoji: '🚇', cat: '交通' },
  { en: 'Motorcycle', zh: '摩托车', emoji: '🏍️', cat: '交通' },
  { en: 'Ambulance', zh: '救护车', emoji: '🚑', cat: '交通' },
  { en: 'Fire truck', zh: '消防车', emoji: '🚒', cat: '交通' },
  { en: 'Helicopter', zh: '直升机', emoji: '🚁', cat: '交通' },
];

// 成长阶段：8 阶，hearts 为累计爱心阈值
export const STAGES = [
  { name: '蛋宝宝',   need: 0,   desc: '一颗可爱的蛋，等待孵化' },
  { name: '破壳啦',   need: 6,   desc: '探出小脑袋，好奇张望' },
  { name: '小宝宝',   need: 14,  desc: '小小一只，软软糯糯' },
  { name: '小少年',   need: 26,  desc: '长大了一圈，更活泼了' },
  { name: '大朋友',   need: 42,  desc: '已经是可靠的大朋友了' },
  { name: '小明星',   need: 62,  desc: '戴上蝴蝶结，人见人爱' },
  { name: '闪亮之星', need: 86,  desc: '头戴皇冠，闪闪发光' },
  { name: '传奇宝贝', need: 115, desc: '彩虹环绕的传说形态！' },
];

// 游玩节奏：玩 30 分钟 → 休息 15 分钟，循环（防沉迷）
export const PLAY_MINUTES = 30;  // 每轮可玩时长（分钟）
export const REST_MINUTES = 15;  // 每轮强制休息（分钟）
export const QUIZ_QUESTIONS = 5; // 每次测验题数

// 解锁新宠物需要的总爱心
export const UNLOCK_NEED = [0, 40, 90, 150, 220, 300, 400, 520, 660]; // 第1~9只

// 随机取 n 个不重复的数组元素
export function sample(arr, n) {
  const copy = [...arr];
  const out = [];
  while (out.length < n && copy.length > 0) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return out;
}

// 洗牌
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 今天的日期字符串（用于每日重置）
export function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
