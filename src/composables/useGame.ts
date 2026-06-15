import { ref, reactive } from 'vue'
import type { Inventory, SupplyPoint, Route, RouteStep, GameEvent, GameStats, Priority } from '@/types'
import { LEVELS } from '@/data/levels'
import { generateEvent, getRandomEventType } from '@/data/events'
import { uid, calcDistance, calcStars, clamp } from '@/utils/helpers'

export function useGame(levelId: number) {
  const turn = ref(0)
  const inventory = reactive<Inventory>({
    cola: 0,
    juice: 0,
    icecream: 0,
    total: 0
  })
  const points = reactive<SupplyPoint[]>([])
  const routes = reactive<Route[]>([])
  const plannedRoute = reactive<RouteStep[]>([])
  const currentEvent = ref<GameEvent | null>(null)
  const isPaused = ref(false)
  const isGameOver = ref(false)
  const isExecuting = ref(false)
  const animatingPointId = ref<string | null>(null)
  const stats = reactive<GameStats>({
    totalDelivered: 0,
    gapHandlingEfficiency: 0,
    routeRedundancy: 0,
    anomalyResponseTime: 0,
    finalInventory: 0,
    score: 0,
    stars: 0,
    turnsUsed: 0
  })
  const gapPoints = reactive<string[]>([])
  const anomalyResponseTurns = reactive<Record<string, number>>({})

  let currentLevelConfig = LEVELS.find(l => l.id === levelId) || LEVELS[0]

  const initGame = () => {
    currentLevelConfig = LEVELS.find(l => l.id === levelId) || LEVELS[0]

    turn.value = 0
    inventory.cola = currentLevelConfig.initialInventory.cola
    inventory.juice = currentLevelConfig.initialInventory.juice
    inventory.icecream = currentLevelConfig.initialInventory.icecream
    inventory.total = currentLevelConfig.initialInventory.total

    points.length = 0
    points.push(
      { ...currentLevelConfig.warehouse },
      ...currentLevelConfig.points.map(p => ({ ...p }))
    )

    routes.length = 0
    routes.push(...currentLevelConfig.routes.map(r => ({ ...r })))

    plannedRoute.length = 0
    currentEvent.value = null
    isPaused.value = false
    isGameOver.value = false
    isExecuting.value = false
    animatingPointId.value = null
    gapPoints.length = 0

    Object.keys(anomalyResponseTurns).forEach(key => {
      delete anomalyResponseTurns[key]
    })

    stats.totalDelivered = 0
    stats.gapHandlingEfficiency = 0
    stats.routeRedundancy = 0
    stats.anomalyResponseTime = 0
    stats.finalInventory = 0
    stats.score = 0
    stats.stars = 0
    stats.turnsUsed = 0
  }

  const getPointById = (pointId: string): SupplyPoint | undefined => {
    return points.find(p => p.id === pointId)
  }

  const getCurrentPosition = (): { x: number; y: number } => {
    if (plannedRoute.length === 0) {
      const warehouse = getPointById('warehouse')
      return warehouse ? warehouse.position : { x: 0, y: 0 }
    }
    const lastStep = plannedRoute[plannedRoute.length - 1]
    const point = getPointById(lastStep.pointId)
    return point ? point.position : { x: 0, y: 0 }
  }

  const addPointToRoute = (pointId: string) => {
    if (pointId === 'warehouse') return
    if (plannedRoute.some(step => step.pointId === pointId)) return

    const point = getPointById(pointId)
    if (!point) return

    const fromPos = getCurrentPosition()
    const toPos = point.position
    const distance = calcDistance(fromPos, toPos)

    plannedRoute.push({
      id: uid(),
      pointId,
      order: plannedRoute.length,
      estimatedCost: distance
    })
  }

  const removePointFromRoute = (stepId: string) => {
    const index = plannedRoute.findIndex(step => step.id === stepId)
    if (index === -1) return

    plannedRoute.splice(index, 1)
    recalculateRouteCosts()
  }

  const reorderRoute = (fromIndex: number, toIndex: number) => {
    if (fromIndex < 0 || fromIndex >= plannedRoute.length) return
    if (toIndex < 0 || toIndex >= plannedRoute.length) return
    if (fromIndex === toIndex) return

    const [removed] = plannedRoute.splice(fromIndex, 1)
    plannedRoute.splice(toIndex, 0, removed)
    recalculateRouteCosts()
  }

  const recalculateRouteCosts = () => {
    if (plannedRoute.length === 0) return

    const warehouse = getPointById('warehouse')
    if (!warehouse) return

    let prevPos = warehouse.position
    plannedRoute.forEach((step, index) => {
      const point = getPointById(step.pointId)
      if (point) {
        step.estimatedCost = calcDistance(prevPos, point.position)
        step.order = index
        prevPos = point.position
      }
    })
  }

  const setPointPriority = (pointId: string, priority: Priority) => {
    const point = getPointById(pointId)
    if (point && pointId !== 'warehouse') {
      point.priority = priority
    }
  }

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const executeRouteStep = async () => {
    if (plannedRoute.length === 0 || isExecuting.value || isGameOver.value || isPaused.value) return

    isExecuting.value = true
    const step = plannedRoute[0]
    const point = getPointById(step.pointId)

    if (!point) {
      isExecuting.value = false
      return
    }

    animatingPointId.value = point.id
    await sleep(800)

    let needDeliver = point.demand - point.delivered

    if (point.status === 'boost') {
      needDeliver = point.demand * 2 - point.delivered
    }

    let actualDeliver = Math.min(needDeliver, inventory.total)

    if (actualDeliver > 0) {
      const ratioCola = 4
      const ratioJuice = 3
      const ratioIcecream = 3
      const totalRatio = ratioCola + ratioJuice + ratioIcecream

      let colaPart = Math.min(Math.round(actualDeliver * ratioCola / totalRatio), inventory.cola)
      let juicePart = Math.min(Math.round(actualDeliver * ratioJuice / totalRatio), inventory.juice)
      let icecreamPart = Math.min(Math.round(actualDeliver * ratioIcecream / totalRatio), inventory.icecream)

      let deliveredSum = colaPart + juicePart + icecreamPart

      while (deliveredSum < actualDeliver && (inventory.cola > colaPart || inventory.juice > juicePart || inventory.icecream > icecreamPart)) {
        if (inventory.cola > colaPart) {
          colaPart++
          deliveredSum++
        } else if (inventory.juice > juicePart) {
          juicePart++
          deliveredSum++
        } else if (inventory.icecream > icecreamPart) {
          icecreamPart++
          deliveredSum++
        } else {
          break
        }
      }

      while (deliveredSum > actualDeliver) {
        if (icecreamPart > 0) {
          icecreamPart--
          deliveredSum--
        } else if (juicePart > 0) {
          juicePart--
          deliveredSum--
        } else if (colaPart > 0) {
          colaPart--
          deliveredSum--
        } else {
          break
        }
      }

      actualDeliver = deliveredSum
      inventory.cola -= colaPart
      inventory.juice -= juicePart
      inventory.icecream -= icecreamPart
      inventory.total = inventory.cola + inventory.juice + inventory.icecream

      point.delivered += actualDeliver
    }

    if (point.delivered < point.demand) {
      if (!gapPoints.includes(point.id)) {
        gapPoints.push(point.id)
      }
    }

    if (point.status === 'anomaly') {
      anomalyResponseTurns[point.id] = turn.value
      point.status = 'normal'
    }

    if (point.status === 'boost') {
      point.status = 'normal'
    }

    if (Math.random() < currentLevelConfig.eventProbability && !currentEvent.value) {
      const eventType = getRandomEventType()
      const nonWarehousePoints = points.filter(p => p.id !== 'warehouse')
      const targetPoint = nonWarehousePoints[Math.floor(Math.random() * nonWarehousePoints.length)]
      if (targetPoint) {
        currentEvent.value = generateEvent(eventType, targetPoint.id, targetPoint.name)
      }
    }

    turn.value++
    animatingPointId.value = null
    isExecuting.value = false

    plannedRoute.shift()
    recalculateRouteCosts()

    const nonWarehousePoints = points.filter(p => p.id !== 'warehouse')
    const allDelivered = nonWarehousePoints.every(p => p.delivered >= p.demand)
    const turnsExceeded = turn.value >= currentLevelConfig.maxTurns

    if (allDelivered || turnsExceeded) {
      isGameOver.value = true
      calculateFinalStats()
    }
  }

  const handleEventOption = (optionIndex: number) => {
    if (!currentEvent.value) return

    const event = currentEvent.value
    const targetPoint = getPointById(event.targetId)

    if (optionIndex === 0) {
      switch (event.type) {
        case 'demand_surge':
          if (targetPoint) {
            targetPoint.demand = Math.round(targetPoint.demand * 1.5)
          }
          break
        case 'route_block':
          routes.forEach(route => {
            if (route.from === event.targetId || route.to === event.targetId) {
              route.blocked = true
            }
          })
          break
        case 'anomaly':
          if (targetPoint) {
            targetPoint.status = 'anomaly'
          }
          break
        case 'boost_refill':
          if (targetPoint) {
            targetPoint.status = 'boost'
          }
          break
      }
    }

    currentEvent.value = null
  }

  const togglePause = () => {
    isPaused.value = !isPaused.value
  }

  const calculateFinalStats = () => {
    const nonWarehousePoints = points.filter(p => p.id !== 'warehouse')
    const initialTotalInventory = currentLevelConfig.initialInventory.total

    stats.totalDelivered = nonWarehousePoints.reduce((sum, p) => sum + p.delivered, 0)

    const totalDemand = nonWarehousePoints.reduce((sum, p) => sum + p.demand, 0)
    const totalGap = nonWarehousePoints.reduce((sum, p) => sum + Math.max(0, p.demand - p.delivered), 0)
    stats.gapHandlingEfficiency = totalDemand > 0 ? Math.round((1 - totalGap / totalDemand) * 100) : 100
    stats.gapHandlingEfficiency = clamp(stats.gapHandlingEfficiency, 0, 100)

    const warehouse = getPointById('warehouse')
    let actualRouteLength = 0
    if (warehouse) {
      let prevPos = warehouse.position
      plannedRoute.forEach(step => {
        const point = getPointById(step.pointId)
        if (point) {
          actualRouteLength += calcDistance(prevPos, point.position)
          prevPos = point.position
        }
      })
    }

    let theoreticalMinRoute = 0
    if (warehouse) {
      const distances = nonWarehousePoints.map(p => calcDistance(warehouse.position, p.position))
      distances.sort((a, b) => a - b)
      if (distances.length > 0) {
        theoreticalMinRoute = distances.reduce((sum, d) => sum + d, 0)
      }
    }

    stats.routeRedundancy = theoreticalMinRoute > 0 && actualRouteLength > 0
      ? Math.round((theoreticalMinRoute / actualRouteLength) * 100)
      : 100
    stats.routeRedundancy = clamp(stats.routeRedundancy, 0, 100)

    const anomalyEntries = Object.entries(anomalyResponseTurns)
    if (anomalyEntries.length > 0) {
      const avgTurns = anomalyEntries.reduce((sum, [, t]) => sum + t, 0) / anomalyEntries.length
      stats.anomalyResponseTime = Math.round((1 - avgTurns / currentLevelConfig.maxTurns) * 100)
    } else {
      stats.anomalyResponseTime = 100
    }
    stats.anomalyResponseTime = clamp(stats.anomalyResponseTime, 0, 100)

    stats.finalInventory = initialTotalInventory > 0 ? Math.round((inventory.total / initialTotalInventory) * 100) : 0
    stats.finalInventory = clamp(stats.finalInventory, 0, 100)

    const deliveredScore = stats.totalDelivered * 10
    const efficiencyScore = stats.gapHandlingEfficiency
    const redundancyPenalty = Math.max(0, 100 - stats.routeRedundancy)
    const anomalyBonus = stats.anomalyResponseTime > 50 ? (stats.anomalyResponseTime - 50) * 2 : 0
    const gapPenalty = gapPoints.length * 20

    stats.score = deliveredScore + efficiencyScore - redundancyPenalty + anomalyBonus - gapPenalty
    stats.score = Math.max(0, stats.score)
    stats.turnsUsed = turn.value
    stats.stars = calcStars(stats.score, currentLevelConfig.targetScore)
  }

  const resetGame = () => {
    initGame()
  }

  return {
    turn,
    inventory,
    points,
    routes,
    plannedRoute,
    currentEvent,
    isPaused,
    isGameOver,
    isExecuting,
    animatingPointId,
    stats,
    gapPoints,
    anomalyResponseTurns,
    initGame,
    addPointToRoute,
    removePointFromRoute,
    reorderRoute,
    recalculateRouteCosts,
    setPointPriority,
    executeRouteStep,
    handleEventOption,
    togglePause,
    calculateFinalStats,
    resetGame
  }
}
