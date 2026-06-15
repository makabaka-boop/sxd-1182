import type { LevelConfig, SupplyPoint, Route } from '@/types'

function calcDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.round(Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)))
}

function createRoute(from: string, to: string, fromPos: { x: number; y: number }, toPos: { x: number; y: number }): Route {
  return {
    id: `${from}-${to}`,
    from,
    to,
    distance: calcDistance(fromPos, toPos),
    blocked: false
  }
}

function createRoutes(warehouse: SupplyPoint, points: SupplyPoint[]): Route[] {
  const routes: Route[] = []
  points.forEach(point => {
    routes.push(createRoute(warehouse.id, point.id, warehouse.position, point.position))
  })
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      routes.push(createRoute(points[i].id, points[j].id, points[i].position, points[j].position))
    }
  }
  return routes
}

const warehouse: SupplyPoint = {
  id: 'warehouse',
  name: '冷库仓库',
  position: { x: 400, y: 250 },
  demand: 0,
  delivered: 0,
  priority: 'normal',
  status: 'normal',
  emoji: '🏭'
}

const level1Points: SupplyPoint[] = [
  {
    id: 'park-a',
    name: '公园A',
    position: { x: 150, y: 150 },
    demand: 20,
    delivered: 0,
    priority: 'normal',
    status: 'normal',
    emoji: '🌳'
  },
  {
    id: 'mall-b',
    name: '商场B',
    position: { x: 650, y: 150 },
    demand: 25,
    delivered: 0,
    priority: 'normal',
    status: 'normal',
    emoji: '🛍️'
  },
  {
    id: 'school-c',
    name: '学校C',
    position: { x: 400, y: 400 },
    demand: 18,
    delivered: 0,
    priority: 'normal',
    status: 'normal',
    emoji: '🏫'
  }
]

const level2Points: SupplyPoint[] = [
  {
    id: 'cinema',
    name: '电影院',
    position: { x: 100, y: 300 },
    demand: 30,
    delivered: 0,
    priority: 'normal',
    status: 'normal',
    emoji: '🎬'
  },
  {
    id: 'stadium',
    name: '体育馆',
    position: { x: 700, y: 300 },
    demand: 28,
    delivered: 0,
    priority: 'normal',
    status: 'normal',
    emoji: '🏟️'
  },
  {
    id: 'hospital',
    name: '医院',
    position: { x: 250, y: 450 },
    demand: 22,
    delivered: 0,
    priority: 'normal',
    status: 'normal',
    emoji: '🏥'
  },
  {
    id: 'plaza',
    name: '广场',
    position: { x: 550, y: 450 },
    demand: 25,
    delivered: 0,
    priority: 'normal',
    status: 'normal',
    emoji: '🏛️'
  }
]

const level3Points: SupplyPoint[] = [
  {
    id: 'beach',
    name: '海滩',
    position: { x: 80, y: 80 },
    demand: 35,
    delivered: 0,
    priority: 'normal',
    status: 'normal',
    emoji: '🏖️'
  },
  {
    id: 'hotel',
    name: '酒店',
    position: { x: 720, y: 80 },
    demand: 32,
    delivered: 0,
    priority: 'normal',
    status: 'normal',
    emoji: '🏨'
  },
  {
    id: 'amusement',
    name: '游乐园',
    position: { x: 150, y: 420 },
    demand: 38,
    delivered: 0,
    priority: 'normal',
    status: 'normal',
    emoji: '🎢'
  },
  {
    id: 'spa',
    name: '温泉',
    position: { x: 650, y: 420 },
    demand: 30,
    delivered: 0,
    priority: 'normal',
    status: 'normal',
    emoji: '♨️'
  },
  {
    id: 'dock',
    name: '码头',
    position: { x: 400, y: 100 },
    demand: 25,
    delivered: 0,
    priority: 'normal',
    status: 'normal',
    emoji: '⚓'
  }
]

const level4Points: SupplyPoint[] = [
  {
    id: 'station',
    name: '高铁站',
    position: { x: 100, y: 100 },
    demand: 40,
    delivered: 0,
    priority: 'normal',
    status: 'normal',
    emoji: '🚄'
  },
  {
    id: 'airport',
    name: '机场',
    position: { x: 700, y: 100 },
    demand: 42,
    delivered: 0,
    priority: 'normal',
    status: 'normal',
    emoji: '✈️'
  },
  {
    id: 'university',
    name: '大学',
    position: { x: 100, y: 400 },
    demand: 35,
    delivered: 0,
    priority: 'normal',
    status: 'normal',
    emoji: '🎓'
  },
  {
    id: 'tech-park',
    name: '科技园区',
    position: { x: 700, y: 400 },
    demand: 38,
    delivered: 0,
    priority: 'normal',
    status: 'normal',
    emoji: '💻'
  },
  {
    id: 'central-park',
    name: '中央公园',
    position: { x: 400, y: 200 },
    demand: 30,
    delivered: 0,
    priority: 'normal',
    status: 'normal',
    emoji: '🌲'
  },
  {
    id: 'food-street',
    name: '美食街',
    position: { x: 400, y: 380 },
    demand: 35,
    delivered: 0,
    priority: 'normal',
    status: 'normal',
    emoji: '🍜'
  }
]

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: '新手村',
    description: '入门关卡，熟悉基本补货流程',
    initialInventory: { cola: 40, juice: 30, icecream: 20, total: 90 },
    warehouse,
    points: level1Points,
    routes: createRoutes(warehouse, level1Points),
    eventProbability: 0.2,
    maxTurns: 8,
    targetScore: 600,
    costThreshold: 2000,
    tasks: [
      {
        id: 'l1-turn-limit',
        type: 'turn_limit',
        name: '闪电配送',
        description: '在 5 回合内完成所有补货',
        icon: '⚡',
        threshold: 5,
        scoreBonus: 150,
        higherIsBetter: false
      },
      {
        id: 'l1-no-gap',
        type: 'no_gap',
        name: '完美交付',
        description: '所有点位无补货缺口（100%满足需求）',
        icon: '✅',
        threshold: 100,
        scoreBonus: 200,
        higherIsBetter: true
      },
      {
        id: 'l1-cost-control',
        type: 'cost_control',
        name: '精打细算',
        description: '路线总消耗控制在 2000 以内',
        icon: '💰',
        threshold: 2000,
        scoreBonus: 100,
        higherIsBetter: false
      },
      {
        id: 'l1-combo',
        type: 'combo_delivery',
        name: '连击配送',
        description: '连续 3 次成功配送（无缺口）',
        icon: '🔥',
        threshold: 3,
        scoreBonus: 120,
        higherIsBetter: true
      },
      {
        id: 'l1-inventory-efficiency',
        type: 'inventory_efficiency',
        name: '库存大师',
        description: '游戏结束时库存剩余率不超过 30%',
        icon: '📦',
        threshold: 30,
        scoreBonus: 80,
        higherIsBetter: false
      }
    ],
    achievements: [
      {
        id: 'l1-first-star',
        levelId: 1,
        name: '初露锋芒',
        description: '首次完成新手村关卡',
        icon: '🌟',
        rarity: 'common',
        condition: { type: 'star_target', threshold: 1, higherIsBetter: true },
        scoreBonus: 50
      },
      {
        id: 'l1-two-star',
        levelId: 1,
        name: '小有成就',
        description: '获得两星评价',
        icon: '⭐',
        rarity: 'common',
        condition: { type: 'star_target', threshold: 2, higherIsBetter: true },
        scoreBonus: 100
      },
      {
        id: 'l1-three-star',
        levelId: 1,
        name: '三星新手',
        description: '获得三星评价',
        icon: '✨',
        rarity: 'rare',
        condition: { type: 'star_target', threshold: 3, higherIsBetter: true },
        scoreBonus: 200
      },
      {
        id: 'l1-task-master',
        levelId: 1,
        name: '任务达人',
        description: '完成 4 个以上关卡任务',
        icon: '🎯',
        rarity: 'rare',
        condition: { type: 'task_completion', threshold: 4, higherIsBetter: true },
        scoreBonus: 180
      },
      {
        id: 'l1-perfect',
        levelId: 1,
        name: '完美新手',
        description: '完成所有关卡任务',
        icon: '💎',
        rarity: 'epic',
        condition: { type: 'all_tasks', threshold: 5, higherIsBetter: true },
        scoreBonus: 300
      }
    ]
  },
  {
    id: 2,
    name: '商业街',
    description: '繁忙的商业区域，补货点增多',
    initialInventory: { cola: 60, juice: 45, icecream: 30, total: 135 },
    warehouse,
    points: level2Points,
    routes: createRoutes(warehouse, level2Points),
    eventProbability: 0.35,
    maxTurns: 10,
    targetScore: 900,
    costThreshold: 3500,
    tasks: [
      {
        id: 'l2-urgent-priority',
        type: 'urgent_priority',
        name: '紧急优先',
        description: '至少 1 个紧急点位在 2 回合内完成配送',
        icon: '🚨',
        threshold: 2,
        scoreBonus: 180,
        higherIsBetter: false
      },
      {
        id: 'l2-anomaly-response',
        type: 'anomaly_response',
        name: '快速响应',
        description: '异常点位平均响应不超过 2 回合',
        icon: '🛠️',
        threshold: 2,
        scoreBonus: 200,
        higherIsBetter: false
      },
      {
        id: 'l2-turn-limit',
        type: 'turn_limit',
        name: '高效调度',
        description: '在 7 回合内完成全部补货',
        icon: '⏱️',
        threshold: 7,
        scoreBonus: 150,
        higherIsBetter: false
      },
      {
        id: 'l2-event-handler',
        type: 'event_handler',
        name: '事件处理专家',
        description: '成功处理至少 2 个随机事件',
        icon: '🎲',
        threshold: 2,
        scoreBonus: 160,
        higherIsBetter: true
      },
      {
        id: 'l2-no-gap',
        type: 'no_gap',
        name: '零缺口感叹',
        description: '所有点位 100% 满足需求',
        icon: '💯',
        threshold: 100,
        scoreBonus: 250,
        higherIsBetter: true
      },
      {
        id: 'l2-priority-optimizer',
        type: 'priority_optimizer',
        name: '优先级优化师',
        description: '至少设置 3 个不同优先级的点位',
        icon: '📊',
        threshold: 3,
        scoreBonus: 120,
        higherIsBetter: true
      }
    ],
    achievements: [
      {
        id: 'l2-first-clear',
        levelId: 2,
        name: '商业新秀',
        description: '首次通关商业街',
        icon: '🏪',
        rarity: 'common',
        condition: { type: 'star_target', threshold: 1, higherIsBetter: true },
        scoreBonus: 80
      },
      {
        id: 'l2-crisis-manager',
        levelId: 2,
        name: '危机经理',
        description: '在商业街关卡中成功处理所有异常事件',
        icon: '🏆',
        rarity: 'rare',
        condition: { type: 'anomaly_response', threshold: 2, higherIsBetter: false },
        scoreBonus: 200
      },
      {
        id: 'l2-three-star',
        levelId: 2,
        name: '三星商人',
        description: '获得三星评价',
        icon: '⭐',
        rarity: 'rare',
        condition: { type: 'star_target', threshold: 3, higherIsBetter: true },
        scoreBonus: 250
      },
      {
        id: 'l2-task-master',
        levelId: 2,
        name: '任务达人',
        description: '完成 5 个以上关卡任务',
        icon: '🎯',
        rarity: 'epic',
        condition: { type: 'task_completion', threshold: 5, higherIsBetter: true },
        scoreBonus: 280
      },
      {
        id: 'l2-master',
        levelId: 2,
        name: '商业大亨',
        description: '完成商业街全部任务',
        icon: '👑',
        rarity: 'epic',
        condition: { type: 'all_tasks', threshold: 6, higherIsBetter: true },
        scoreBonus: 400
      },
      {
        id: 'l2-legendary',
        levelId: 2,
        name: '商业传奇',
        description: '三星通关并完成所有任务',
        icon: '🌟',
        rarity: 'legendary',
        condition: { type: 'score_target', threshold: 1500, higherIsBetter: true },
        scoreBonus: 600
      }
    ]
  },
  {
    id: 3,
    name: '度假区',
    description: '度假胜地，需求量大且事件频发',
    initialInventory: { cola: 80, juice: 60, icecream: 45, total: 185 },
    warehouse,
    points: level3Points,
    routes: createRoutes(warehouse, level3Points),
    eventProbability: 0.45,
    maxTurns: 12,
    targetScore: 1300,
    costThreshold: 5500,
    tasks: [
      {
        id: 'l3-cost-control',
        type: 'cost_control',
        name: '成本杀手',
        description: '路线总消耗控制在 5500 以内',
        icon: '💵',
        threshold: 5500,
        scoreBonus: 200,
        higherIsBetter: false
      },
      {
        id: 'l3-efficiency',
        type: 'efficiency_target',
        name: '高效交付',
        description: '缺口处理效率达到 95% 以上',
        icon: '🎯',
        threshold: 95,
        scoreBonus: 220,
        higherIsBetter: true
      },
      {
        id: 'l3-anomaly-response',
        type: 'anomaly_response',
        name: '异常克星',
        description: '异常点位平均响应不超过 1.5 回合',
        icon: '⚙️',
        threshold: 1.5,
        scoreBonus: 250,
        higherIsBetter: false
      },
      {
        id: 'l3-combo',
        type: 'combo_delivery',
        name: '连击大师',
        description: '连续 5 次成功配送',
        icon: '🔥',
        threshold: 5,
        scoreBonus: 200,
        higherIsBetter: true
      },
      {
        id: 'l3-turn-limit',
        type: 'turn_limit',
        name: '极速度假',
        description: '在 10 回合内完成全部补货',
        icon: '⏱️',
        threshold: 10,
        scoreBonus: 180,
        higherIsBetter: false
      },
      {
        id: 'l3-event-handler',
        type: 'event_handler',
        name: '应急专家',
        description: '成功处理至少 3 个随机事件',
        icon: '🎲',
        threshold: 3,
        scoreBonus: 180,
        higherIsBetter: true
      },
      {
        id: 'l3-speed-demon',
        type: 'speed_demon',
        name: '速度恶魔',
        description: '每回合平均配送量达到 15 以上',
        icon: '🚀',
        threshold: 15,
        scoreBonus: 160,
        higherIsBetter: true
      }
    ],
    achievements: [
      {
        id: 'l3-first-clear',
        levelId: 3,
        name: '度假玩家',
        description: '首次通关度假区',
        icon: '🏖️',
        rarity: 'common',
        condition: { type: 'star_target', threshold: 1, higherIsBetter: true },
        scoreBonus: 100
      },
      {
        id: 'l3-vacation-hero',
        levelId: 3,
        name: '度假英雄',
        description: '度假区全点位零缺口',
        icon: '🏖️',
        rarity: 'rare',
        condition: { type: 'no_gap', threshold: 100, higherIsBetter: true },
        scoreBonus: 300
      },
      {
        id: 'l3-three-star',
        levelId: 3,
        name: '三星调度',
        description: '获得三星评价',
        icon: '⭐',
        rarity: 'rare',
        condition: { type: 'star_target', threshold: 3, higherIsBetter: true },
        scoreBonus: 300
      },
      {
        id: 'l3-cost-master',
        levelId: 3,
        name: '成本大师',
        description: '路线消耗控制在阈值内且零缺口',
        icon: '💰',
        rarity: 'epic',
        condition: { type: 'cost_control', threshold: 5500, higherIsBetter: false },
        scoreBonus: 350
      },
      {
        id: 'l3-task-master',
        levelId: 3,
        name: '任务狂魔',
        description: '完成 6 个以上关卡任务',
        icon: '🎯',
        rarity: 'epic',
        condition: { type: 'task_completion', threshold: 6, higherIsBetter: true },
        scoreBonus: 400
      },
      {
        id: 'l3-legend',
        levelId: 3,
        name: '传说调度',
        description: '完成度假区全部任务',
        icon: '🌈',
        rarity: 'legendary',
        condition: { type: 'all_tasks', threshold: 7, higherIsBetter: true },
        scoreBonus: 500
      }
    ]
  },
  {
    id: 4,
    name: '城市中心',
    description: '大都市核心区域，挑战极限调度能力',
    initialInventory: { cola: 100, juice: 75, icecream: 55, total: 230 },
    warehouse,
    points: level4Points,
    routes: createRoutes(warehouse, level4Points),
    eventProbability: 0.55,
    maxTurns: 15,
    targetScore: 1800,
    costThreshold: 8000,
    tasks: [
      {
        id: 'l4-turn-limit',
        type: 'turn_limit',
        name: '极速配送',
        description: '在 10 回合内完成所有补货',
        icon: '🚀',
        threshold: 10,
        scoreBonus: 300,
        higherIsBetter: false
      },
      {
        id: 'l4-no-gap',
        type: 'no_gap',
        name: '零缺口挑战',
        description: '全部点位 100% 满足需求',
        icon: '💯',
        threshold: 100,
        scoreBonus: 350,
        higherIsBetter: true
      },
      {
        id: 'l4-cost-control',
        type: 'cost_control',
        name: '最优路线',
        description: '路线总消耗控制在 8000 以内',
        icon: '📊',
        threshold: 8000,
        scoreBonus: 280,
        higherIsBetter: false
      },
      {
        id: 'l4-anomaly-response',
        type: 'anomaly_response',
        name: '神速响应',
        description: '异常点位平均响应不超过 1 回合',
        icon: '⚡',
        threshold: 1,
        scoreBonus: 320,
        higherIsBetter: false
      },
      {
        id: 'l4-combo',
        type: 'combo_delivery',
        name: '超神连击',
        description: '连续 6 次成功配送',
        icon: '🔥',
        threshold: 6,
        scoreBonus: 250,
        higherIsBetter: true
      },
      {
        id: 'l4-event-handler',
        type: 'event_handler',
        name: '风云人物',
        description: '成功处理至少 4 个随机事件',
        icon: '🎲',
        threshold: 4,
        scoreBonus: 220,
        higherIsBetter: true
      },
      {
        id: 'l4-speed-demon',
        type: 'speed_demon',
        name: '速度之魔',
        description: '每回合平均配送量达到 20 以上',
        icon: '💨',
        threshold: 20,
        scoreBonus: 200,
        higherIsBetter: true
      },
      {
        id: 'l4-priority-optimizer',
        type: 'priority_optimizer',
        name: '运筹帷幄',
        description: '设置至少 5 个不同优先级的点位',
        icon: '📊',
        threshold: 5,
        scoreBonus: 180,
        higherIsBetter: true
      }
    ],
    achievements: [
      {
        id: 'l4-first-clear',
        levelId: 4,
        name: '都市新人',
        description: '首次通关城市中心',
        icon: '🌆',
        rarity: 'common',
        condition: { type: 'star_target', threshold: 1, higherIsBetter: true },
        scoreBonus: 150
      },
      {
        id: 'l4-city-master',
        levelId: 4,
        name: '城市之光',
        description: '达成城市中心关卡三星评价',
        icon: '🌆',
        rarity: 'epic',
        condition: { type: 'star_target', threshold: 3, higherIsBetter: true },
        scoreBonus: 400
      },
      {
        id: 'l4-no-gap-hero',
        levelId: 4,
        name: '零缺口英雄',
        description: '城市中心全点位零缺口',
        icon: '💪',
        rarity: 'epic',
        condition: { type: 'no_gap', threshold: 100, higherIsBetter: true },
        scoreBonus: 450
      },
      {
        id: 'l4-speed-king',
        levelId: 4,
        name: '速度之王',
        description: '10 回合内完成且零缺口',
        icon: '👑',
        rarity: 'epic',
        condition: { type: 'turn_limit', threshold: 10, higherIsBetter: false },
        scoreBonus: 500
      },
      {
        id: 'l4-task-master',
        levelId: 4,
        name: '任务宗师',
        description: '完成 7 个以上关卡任务',
        icon: '🎯',
        rarity: 'epic',
        condition: { type: 'task_completion', threshold: 7, higherIsBetter: true },
        scoreBonus: 550
      },
      {
        id: 'l4-ultimate',
        levelId: 4,
        name: '终极物流大师',
        description: '完成全部任务并解锁城市中心所有成就',
        icon: '🏅',
        rarity: 'legendary',
        condition: { type: 'all_tasks', threshold: 8, higherIsBetter: true },
        scoreBonus: 800
      },
      {
        id: 'l4-legendary-score',
        levelId: 4,
        name: '传奇分数',
        description: '单局得分超过 2500 分',
        icon: '🌟',
        rarity: 'legendary',
        condition: { type: 'score_target', threshold: 2500, higherIsBetter: true },
        scoreBonus: 1000
      }
    ]
  }
]
