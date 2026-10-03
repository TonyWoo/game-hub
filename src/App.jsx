// ============================================================
// App.jsx —— game-hub 路由外壳（useState 极简路由）
// 'hub' 大厅 | 'pet' 宠物喂养乐园 | 'survivor' 像素幸存者 | 'quiet' 安静书
// ============================================================
import { useState } from 'react';
import PetGame from './games/pet/App.jsx';
import SurvivorGame from './games/survivor/App.jsx';
import QuietBook from './games/quiet/index.jsx';
import Quiet3D from './games/quiet3d/index.jsx';
import DressUp from './games/dressup/index.jsx';
import ChefGame from './games/chef/index.jsx';
import BackHomeButton from './BackHomeButton.jsx';

const GAMES = [
  {
    id: 'pet',
    icon: '🐾',
    name: '宠物喂养乐园',
    desc: '养可爱宠物，边玩边学英语单词',
  },
  {
    id: 'survivor',
    icon: '⚔️',
    name: '像素幸存者',
    desc: '走位打怪升级，努力活过 10 分钟',
  },
  {
    id: 'quiet',
    icon: '📖',
    name: '安静书',
    desc: '贴纸场景小世界，玩着学会 110 个英文单词',
  },
  {
    id: 'quiet3d',
    icon: '✨',
    name: '安静书 3D',
    desc: '酷炫 3D 版：旋转场景，点 3D 物品学单词',
  },
  {
    id: 'dressup',
    icon: '👗',
    name: '换装小屋',
    desc: '给 3D 小朋友换衣服学单词',
  },
  {
    id: 'chef',
    icon: '🍳',
    name: '小小厨师',
    desc: '做美食给顾客评价',
  },
];

function Hub({ onPick }) {
  return (
    <div className="game-hub">
      <h1 className="hub-title">🎮 我的游戏库</h1>
      <p className="hub-sub">选一个，开始玩吧！</p>
      <div className="hub-cards">
        {GAMES.map((g) => (
          <button key={g.id} className="hub-card" onClick={() => onPick(g.id)}>
            <span className="hub-icon">{g.icon}</span>
            <span className="hub-info">
              <p className="hub-name">{g.name}</p>
              <p className="hub-desc">{g.desc}</p>
            </span>
            <span className="hub-go">开始游戏 →</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [route, setRoute] = useState('hub');

  if (route === 'hub') return <Hub onPick={setRoute} />;

  const dark = route === 'survivor';
  return (
    <div className={`game-page${dark ? ' dark' : ''}`}>
      <BackHomeButton onBack={() => setRoute('hub')} dark={dark} />
      {route === 'pet' && (
        <div className="game-pet">
          <PetGame />
        </div>
      )}
      {route === 'survivor' && (
        <div className="game-survivor">
          <SurvivorGame />
        </div>
      )}
      {route === 'quiet' && (
        <div className="game-quiet">
          <QuietBook />
        </div>
      )}
      {route === 'quiet3d' && (
        <div className="game-quiet3d">
          <Quiet3D />
        </div>
      )}
      {route === 'dressup' && (
        <div className="game-dressup">
          <DressUp />
        </div>
      )}
      {route === 'chef' && (
        <div className="game-chef">
          <ChefGame />
        </div>
      )}
    </div>
  );
}
