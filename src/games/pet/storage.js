// ============================================================
// storage.js —— localStorage 存档：保存 / 读取 / 每日重置
// 全部数据只存在本地浏览器，零后端
// ============================================================
import { todayStr, STAGES } from './data.js';

const KEY = 'pet-paradise-save-v1';
let nextId = 1;

// 新建一只宠物的初始数据
export function newPet(type, name) {
  return {
    id: `pet-${Date.now()}-${nextId++}`,
    type,                       // bunny | cat | fox
    name: name || '',           // 小朋友起的名字
    hearts: 0,                  // 累计爱心（成长经验）
    stage: 0,                   // 成长阶段 0-7
    mood: 60,                   // 心情值 0-100
    fullness: 50,               // 饱食度 0-100
  };
}

// 空存档
function freshSave() {
  return {
    pets: [],
    activePetId: null,
    day: todayStr(),             // 上次结算的日期（用于跨天衰减）
    playSec: 0,                  // 本轮已玩秒数（满 30 分钟进休息）
    restUntil: 0,                // 休息结束时间戳（0 = 不在休息）
    wordPoints: 0,               // ⭐ 单词积分：学单词赚，互动花
    learnedWords: [],            // 学过的单词（英文）
  };
}

// 读取存档；兼容老存档（缺字段补默认值）；跨天宠物状态轻微衰减
export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    const save = raw ? JSON.parse(raw) : freshSave();
    if (!save.pets) return freshSave();
    // 老存档兼容：补新字段；pochacco 更名为 cinnamoroll
    if (save.playSec == null) save.playSec = 0;
    if (save.restUntil == null) save.restUntil = 0;
    if (save.wordPoints == null) save.wordPoints = 0;
    let migrated = false;
    save.pets.forEach((p) => {
      if (p.type === 'pochacco') { p.type = 'cinnamoroll'; migrated = true; }
    });
    if (migrated) persistSave(save);
    if (!save.learnedWords) save.learnedWords = [];
    // 跨天了：宠物状态轻微衰减（离线不会死，只是需要重新陪一会儿）
    if (save.day !== todayStr()) {
      save.day = todayStr();
      save.pets.forEach((p) => {
        p.fullness = Math.max(10, p.fullness - 20);
        p.mood = Math.max(20, p.mood - 15);
      });
      persistSave(save);
    }
    return save;
  } catch {
    return freshSave();
  }
}

// 写入存档
export function persistSave(save) {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch {
    // 存储空间满等极端情况：忽略，保证游戏不崩
  }
}

// 取当前出场的宠物
export function activePet(save) {
  return save.pets.find((p) => p.id === save.activePetId) || save.pets[0] || null;
}

// 所有宠物累计爱心（用于解锁新宠物）
export function totalHearts(save) {
  return save.pets.reduce((s, p) => s + p.hearts, 0);
}

// 根据爱心计算阶段；返回 { stage, leveledUp }
export function calcStage(hearts) {
  let stage = 0;
  for (let i = 0; i < STAGES.length; i++) {
    if (hearts >= STAGES[i].need) stage = i;
  }
  return stage;
}

// 给宠物加爱心（含心情加成），返回是否升级了
export function addHearts(pet, base) {
  const bonus = pet.mood >= 70 ? 1 : 0; // 心情好有加成
  pet.hearts += base + bonus;
  const ns = calcStage(pet.hearts);
  const leveledUp = ns > pet.stage;
  pet.stage = ns;
  return leveledUp;
}

export const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, v));
