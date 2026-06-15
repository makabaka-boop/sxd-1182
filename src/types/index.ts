export type Priority = 'low' | 'normal' | 'high' | 'urgent'

export type PointStatus = 'normal' | 'anomaly' | 'boost' | 'blocked'

export type EventType = 'demand_surge' | 'route_block' | 'anomaly' | 'boost_refill'

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
}

export interface ScoreRecord {
  levelId: number
  score: number
  stars: number
  timestamp: number
}
