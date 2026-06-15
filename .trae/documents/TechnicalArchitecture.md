## 1. 架构设计

```mermaid
flowchart LR
    "Vue 3 视图层" --> "Composables (useGame/useStorage/useDrag)"
    "Composables (useGame/useStorage/useDrag)" --> "游戏状态 (Reactive)"
    "游戏状态 (Reactive)" --> "关卡数据 (levels.ts)"
    "游戏状态 (Reactive)" --> "事件系统 (events.ts)"
    "游戏状态 (Reactive)" --> "本地存储 (localStorage)"
```

## 2. 技术描述
- **前端框架**：Vue 3 + TypeScript + Composition API (`<script setup>`)
- **构建工具**：Vite 5
- **样式方案**：Tailwind CSS 3
- **路由管理**：Vue Router 4
- **状态管理**：Vue Reactive API（游戏状态集中管理）
- **数据持久化**：localStorage（封装工具函数）
- **图标方案**：Lucide Vue + Emoji
- **初始化命令**：`pnpm create vite-init@latest . --template vue-ts --force`

## 3. 路由定义
| 路由 | 页面组件 | 用途 |
|------|----------|------|
| `/` | `HomePage.vue` | 主菜单：关卡选择、教程、成绩查看 |
| `/game/:levelId` | `GamePage.vue` | 游戏主界面 |
| `/result/:levelId` | `ResultPage.vue` | 结算界面 |

## 4. 数据模型

### 4.1 核心类型定义

```typescript
// 补货点
interface SupplyPoint {
  id: string
  name: string
  position: { x: number; y: number }
  demand: number
  maxCapacity: number
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'normal' | 'anomaly' | 'boost' | 'blocked'
  emoji: string
}

// 通道（两点间连接）
interface Route {
  id: string
  from: string
  to: string
  distance: number
  blocked: boolean
}

// 路线步骤
interface RouteStep {
  id: string
  pointId: string
  order: number
  estimatedCost: number
}

// 随机事件
interface GameEvent {
  id: string
  type: 'demand_surge' | 'route_block' | 'anomaly' | 'boost_refill'
  title: string
  description: string
  targetId: string
  options: EventOption[]
}

interface EventOption {
  label: string
  effect: () => void
}

// 库存
interface Inventory {
  cola: number
  juice: number
  icecream: number
  total: number
}

// 关卡配置
interface LevelConfig {
  id: number
  name: string
  description: string
  initialInventory: Inventory
  points: SupplyPoint[]
  routes: Route[]
  eventProbability: number
  maxTurns: number
  targetScore: number
}

// 游戏状态
interface GameState {
  levelId: number
  turn: number
  inventory: Inventory
  points: SupplyPoint[]
  routes: Route[]
  plannedRoute: RouteStep[]
  currentEvent: GameEvent | null
  isPaused: boolean
  isGameOver: boolean
  stats: GameStats
}

// 结算统计
interface GameStats {
  totalDelivered: number
  gapHandlingEfficiency: number
  routeRedundancy: number
  anomalyResponseTime: number
  finalInventory: number
  score: number
  stars: number
}

// 历史成绩
interface ScoreRecord {
  levelId: number
  score: number
  stars: number
  timestamp: number
}
```

### 4.2 存储结构
- localStorage key: `ice_road_p scores`
- 存储 JSON 格式：`Record<number, ScoreRecord>`

## 5. 项目目录结构

```
src/
├── components/
│   ├── game/
│   │   ├── GameMap.vue
│   │   ├── RouteQueue.vue
│   │   ├── InventoryPanel.vue
│   │   ├── EventModal.vue
│   │   └── ControlBar.vue
│   ├── home/
│   │   ├── LevelCard.vue
│   │   └── ScoreBoard.vue
│   ├── result/
│   │   └── StatItem.vue
│   └── common/
│       ├── TutorialModal.vue
│       └── PauseModal.vue
├── composables/
│   ├── useGame.ts
│   ├── useDrag.ts
│   └── useStorage.ts
├── data/
│   ├── levels.ts
│   └── events.ts
├── pages/
│   ├── HomePage.vue
│   ├── GamePage.vue
│   └── ResultPage.vue
├── router/
│   └── index.ts
├── types/
│   └── index.ts
├── utils/
│   └── helpers.ts
├── App.vue
├── main.ts
└── style.css
```

## 6. 核心模块职责

| 模块 | 职责 |
|------|------|
| `useGame.ts` | 游戏核心逻辑：回合推进、补货执行、事件触发、结算计算 |
| `useDrag.ts` | 拖拽排序逻辑：处理路线队列的拖拽交互 |
| `useStorage.ts` | localStorage 封装：成绩的保存与读取 |
| `levels.ts` | 所有关卡的配置数据 |
| `events.ts` | 随机事件生成器与事件模板 |
| `helpers.ts` | 通用工具：距离计算、分数评级等 |
