export type Priority = 'low' | 'normal' | 'high' | 'urgent'

export type PointStatus = 'normal' | 'anomaly' | 'boost' | 'blocked'

export type EventType = 'demand_surge' | 'route_block' | 'anomaly' | 'boost_refill'

export type TaskType =
  | 'turn_limit'
  | 'urgent_priority'
  | 'anomaly_response'
  | 'cost_control'
  | 'no_gap'
  | 'efficiency_target'

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed'

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface SupplyPoint {
  id: string
  name: string
  position: { x: number; y: number }
  demand: number
  delivered: number
  priority: Priority
  status: PointStatus
  emoji: string
}

export interface Route {
  id: string
  from: string
  to: string
  distance: number
  blocked: boolean
}

export interface RouteStep {
  id: string
  pointId: string
  order: number
  estimatedCost: number
}

export interface EventOption {
  label: string
  effect: string
}

export interface GameEvent {
  id: string
  type: EventType
  title: string
  description: string
  targetId: string
  options: EventOption[]
}

export interface Inventory {
  cola: number
  juice: number
  icecream: number
  total: number
}

export interface TaskTarget {
  id: string
  type: TaskType
  name: string
  description: string
  icon: string
  threshold: number
  scoreBonus: number
  higherIsBetter?: boolean
}

export interface TaskProgress {
  taskId: string
  currentValue: number
  status: TaskStatus
}

export interface Achievement {
  id: string
  levelId: number
  name: string
  description: string
  icon: string
  rarity: AchievementRarity
  condition: {
    type: TaskType
    threshold: number
    higherIsBetter?: boolean
  }
  scoreBonus: number
}

export interface UnlockedAchievement {
  achievementId: string
  unlockedAt: number
}

export interface TaskResult {
  taskId: string
  taskName: string
  icon: string
  completed: boolean
  currentValue: number
  threshold: number
  scoreBonus: number
  description: string
}

export interface LevelConfig {
  id: number
  name: string
  description: string
  initialInventory: Inventory
  warehouse: SupplyPoint
  points: SupplyPoint[]
  routes: Route[]
  eventProbability: number
  maxTurns: number
  targetScore: number
  tasks: TaskTarget[]
  achievements: Achievement[]
  costThreshold: number
}

export interface GameState {
  levelId: number
  turn: number
  inventory: Inventory
  warehouse: SupplyPoint
  points: SupplyPoint[]
  routes: Route[]
  plannedRoute: RouteStep[]
  currentEvent: GameEvent | null
  isPaused: boolean
  isGameOver: boolean
  stats: GameStats
}

export interface GameStats {
  totalDelivered: number
  gapHandlingEfficiency: number
  routeRedundancy: number
  anomalyResponseTime: number
  finalInventory: number
  score: number
  stars: number
  turnsUsed: number
  taskResults: TaskResult[]
  unlockedAchievements: string[]
  taskBonusScore: number
}

export interface ScoreRecord {
  levelId: number
  score: number
  stars: number
  timestamp: number
  unlockedAchievementIds: string[]
  taskCompletedCount: number
  totalTaskCount: number
  bestTaskRecord: {
    taskId: string
    taskName: string
    currentValue: number
    threshold: number
  }[]
}
