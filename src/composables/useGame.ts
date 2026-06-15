import { ref, reactive, computed } from 'vue'
import type { Inventory, SupplyPoint, Route, RouteStep, GameEvent, GameStats, Priority, TaskProgress, TaskResult, TaskTarget } from '@/types'
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
    turnsUsed: 0,
    taskResults: [],
    unlockedAchievements: [],
    taskBonusScore: 0
  })
  const gapPoints = reactive<string[]>([])
  const anomalyResponseTurns = reactive<Record<string, number>>({})
  const anomalyStartTurns = reactive<Record<string, number>>({})
  const totalTraveledDistance = ref(0)
  const executedSteps = reactive<RouteStep[]>([])
  const urgentDeliveryTurns = reactive<Record<string, number>>({})
  const taskProgress = reactive<TaskProgress[]>([])

  let currentLevelConfig = LEVELS.find(l => l.id === levelId) || LEVELS[0]

  const initTaskProgress = () => {
    taskProgress.length = 0
    currentLevelConfig.tasks.forEach(task => {
      taskProgress.push({
        taskId: task.id,
        currentValue: 0,
        status: 'pending'
      })
    })
  }

  const getTaskProgress = (taskId: string) => {
    return taskProgress.find(tp => tp.taskId === taskId)
  }

  const evaluateTaskCompletion = (task: TaskTarget): { value: number; completed: boolean; failed: boolean } => {
    const nonWarehousePoints = points.filter(p => p.id !== 'warehouse')
    let value = 0
    let completed = false
    let failed = false

    switch (task.type) {
      case 'turn_limit': {
        value = turn.value
        const allDone = nonWarehousePoints.every(p => p.delivered >= p.demand)
        if (allDone && value <= task.threshold) {
          completed = true
        } else if (turn.value > task.threshold && !allDone) {
          failed = true
        }
        break
      }
      case 'urgent_priority': {
        const urgentPoints = nonWarehousePoints.filter(p => p.priority === 'urgent')
        if (urgentPoints.length === 0) {
          value = 0
          failed = turn.value > 0
        } else {
          const completedUrgent = urgentPoints.filter(p => {
            const deliveryTurn = urgentDeliveryTurns[p.id]
            return p.delivered >= p.demand && deliveryTurn !== undefined && deliveryTurn <= task.threshold
          })
          value = completedUrgent.length
          completed = completedUrgent.length >= 1
        }
        break
      }
      case 'anomaly_response': {
        const anomalyEntries = Object.entries(anomalyResponseTurns)
        const anomalyStartEntries = Object.entries(anomalyStartTurns).filter(
          ([id]) => !(id in anomalyResponseTurns)
        )
        const hasAnyAnomaly = anomalyEntries.length > 0 || anomalyStartEntries.length > 0
        if (anomalyEntries.length > 0) {
          const avgTurns = anomalyEntries.reduce((sum, [, t]) => sum + t, 0) / anomalyEntries.length
          value = avgTurns
          completed = avgTurns <= task.threshold && hasAnyAnomaly
        } else if (anomalyStartEntries.length > 0) {
          value = turn.value - (anomalyStartEntries[0]?.[1] ?? turn.value)
          completed = false
        } else {
          value = 0
          failed = false
        }
        break
      }
      case 'cost_control': {
        const plannedTotal = plannedRoute.reduce((sum, step) => sum + step.estimatedCost, 0)
        value = totalTraveledDistance.value + plannedTotal
        if (value <= task.threshold) {
          completed = true
        } else {
          failed = true
        }
        break
      }
      case 'no_gap': {
        const totalDemand = nonWarehousePoints.reduce((sum, p) => sum + p.demand, 0)
        const totalDelivered = nonWarehousePoints.reduce((sum, p) => sum + Math.min(p.delivered, p.demand), 0)
        value = totalDemand > 0 ? Math.round((totalDelivered / totalDemand) * 100) : 100
        completed = value >= task.threshold
        break
      }
      case 'efficiency_target': {
        const totalD = nonWarehousePoints.reduce((sum, p) => sum + p.demand, 0)
        const totalGap = nonWarehousePoints.reduce((sum, p) => sum + Math.max(0, p.demand - p.delivered), 0)
        value = totalD > 0 ? Math.round((1 - totalGap / totalD) * 100) : 100
        completed = task.higherIsBetter !== false
          ? value >= task.threshold
          : value <= task.threshold
        break
      }
    }

    return { value, completed, failed }
  }

  const updateTaskProgress = () => {
    currentLevelConfig.tasks.forEach(task => {
      const progress = getTaskProgress(task.id)
      if (!progress) return

      const { value, completed, failed } = evaluateTaskCompletion(task)

      progress.currentValue = value

      if (turn.value === 0) {
        progress.status = 'pending'
      } else if (completed) {
        progress.status = 'completed'
      } else if (failed) {
        progress.status = 'failed'
      } else {
        progress.status = 'in_progress'
      }
    })
  }

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
    executedSteps.length = 0
    currentEvent.value = null
    isPaused.value = false
    isGameOver.value = false
    isExecuting.value = false
    animatingPointId.value = null
    totalTraveledDistance.value = 0
    gapPoints.length = 0

    Object.keys(anomalyResponseTurns).forEach(key => {
      delete anomalyResponseTurns[key]
    })
    Object.keys(anomalyStartTurns).forEach(key => {
      delete anomalyStartTurns[key]
    })
    Object.keys(urgentDeliveryTurns).forEach(key => {
      delete urgentDeliveryTurns[key]
    })

    stats.totalDelivered = 0
    stats.gapHandlingEfficiency = 0
    stats.routeRedundancy = 0
    stats.anomalyResponseTime = 0
    stats.finalInventory = 0
    stats.score = 0
    stats.stars = 0
    stats.turnsUsed = 0
    stats.taskResults = []
    stats.unlockedAchievements = []
    stats.taskBonusScore = 0

    initTaskProgress()
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

  const getLastExecutedPosition = (): { x: number; y: number } => {
    if (executedSteps.length === 0) {
      const warehouse = getPointById('warehouse')
      return warehouse ? warehouse.position : { x: 0, y: 0 }
    }
    const lastStep = executedSteps[executedSteps.length - 1]
    const point = getPointById(lastStep.pointId)
    return point ? point.position : { x: 0, y: 0 }
  }

  const isRouteBlocked = (fromId: string, toId: string): boolean => {
    const route = routes.find(r =>
      (r.from === fromId && r.to === toId) || (r.from === toId && r.to === fromId)
    )
    return route?.blocked ?? false
  }

  const getEffectiveDistance = (fromId: string, toId: string): number => {
    const fromPoint = getPointById(fromId)
    const toPoint = getPointById(toId)
    if (!fromPoint || !toPoint) return 0

    const directDistance = calcDistance(fromPoint.position, toPoint.position)

    if (isRouteBlocked(fromId, toId)) {
      return Math.round(directDistance * 1.8)
    }

    return directDistance
  }

  const addPointToRoute = (pointId: string) => {
    if (pointId === 'warehouse') return
    if (plannedRoute.some(step => step.pointId === pointId)) return

    const point = getPointById(pointId)
    if (!point) return

    const fromId = plannedRoute.length === 0 ? 'warehouse' : plannedRoute[plannedRoute.length - 1].pointId
    const distance = getEffectiveDistance(fromId, pointId)

    plannedRoute.push({
      id: uid(),
      pointId,
      order: plannedRoute.length,
      estimatedCost: distance
    })

    updateTaskProgress()
  }

  const removePointFromRoute = (stepId: string) => {
    const index = plannedRoute.findIndex(step => step.id === stepId)
    if (index === -1) return

    plannedRoute.splice(index, 1)
    recalculateRouteCosts()
    updateTaskProgress()
  }

  const reorderRoute = (fromIndex: number, toIndex: number) => {
    if (fromIndex < 0 || fromIndex >= plannedRoute.length) return
    if (toIndex < 0 || toIndex >= plannedRoute.length) return
    if (fromIndex === toIndex) return

    const [removed] = plannedRoute.splice(fromIndex, 1)
    plannedRoute.splice(toIndex, 0, removed)
    recalculateRouteCosts()
    updateTaskProgress()
  }

  const recalculateRouteCosts = () => {
    if (plannedRoute.length === 0) return

    let prevId = executedSteps.length > 0
      ? executedSteps[executedSteps.length - 1].pointId
      : 'warehouse'

    plannedRoute.forEach((step, index) => {
      const point = getPointById(step.pointId)
      if (point) {
        step.estimatedCost = getEffectiveDistance(prevId, step.pointId)
        step.order = index
        prevId = step.pointId
      }
    })
  }

  const setPointPriority = (pointId: string, priority: Priority) => {
    const point = getPointById(pointId)
    if (point && pointId !== 'warehouse') {
      point.priority = priority
      updateTaskProgress()
    }
  }

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const consumeTravelInventory = (distance: number) => {
    const decayRate = 0.003
    const loss = Math.round(inventory.total * decayRate * (distance / 100))
    if (loss <= 0) return

    let remainingLoss = loss
    const ratioCola = 4
    const ratioJuice = 3
    const ratioIcecream = 3
    const totalRatio = ratioCola + ratioJuice + ratioIcecream

    let colaLoss = Math.min(Math.round(remainingLoss * ratioCola / totalRatio), inventory.cola)
    let juiceLoss = Math.min(Math.round(remainingLoss * ratioJuice / totalRatio), inventory.juice)
    let iceLoss = Math.min(Math.round(remainingLoss * ratioIcecream / totalRatio), inventory.icecream)

    let totalLoss = colaLoss + juiceLoss + iceLoss

    while (totalLoss < remainingLoss && inventory.total > totalLoss) {
      if (inventory.cola > colaLoss) { colaLoss++; totalLoss++ }
      else if (inventory.juice > juiceLoss) { juiceLoss++; totalLoss++ }
      else if (inventory.icecream > iceLoss) { iceLoss++; totalLoss++ }
      else break
    }

    inventory.cola -= colaLoss
    inventory.juice -= juiceLoss
    inventory.icecream -= iceLoss
    inventory.total = inventory.cola + inventory.juice + inventory.icecream
  }

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

    const fromId = executedSteps.length > 0
      ? executedSteps[executedSteps.length - 1].pointId
      : 'warehouse'
    const travelDistance = getEffectiveDistance(fromId, point.id)
    totalTraveledDistance.value += travelDistance
    consumeTravelInventory(travelDistance)

    let deliveredThisStep = 0
    const turnBeforeDelivery = turn.value

    if (point.status === 'anomaly') {
      const repairCost = Math.round(inventory.total * 0.05)
      const actualRepair = Math.min(repairCost, inventory.total)

      if (actualRepair > 0) {
        const perType = Math.floor(actualRepair / 3)
        inventory.cola = Math.max(0, inventory.cola - perType)
        inventory.juice = Math.max(0, inventory.juice - perType)
        inventory.icecream = Math.max(0, inventory.icecream - (actualRepair - perType * 2))
        inventory.total = inventory.cola + inventory.juice + inventory.icecream
      }

      const anomalyDuration = turn.value - (anomalyStartTurns[point.id] ?? turn.value)
      anomalyResponseTurns[point.id] = anomalyDuration
      point.status = 'normal'

      deliveredThisStep = 0
    } else {
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
        deliveredThisStep = actualDeliver

        if (point.priority === 'urgent' && point.delivered >= point.demand && !(point.id in urgentDeliveryTurns)) {
          urgentDeliveryTurns[point.id] = turnBeforeDelivery + 1
        }
      }

      if (point.status === 'boost') {
        point.status = 'normal'
      }
    }

    if (point.delivered < point.demand) {
      if (!gapPoints.includes(point.id)) {
        gapPoints.push(point.id)
      }
    } else {
      const idx = gapPoints.indexOf(point.id)
      if (idx !== -1) {
        gapPoints.splice(idx, 1)
      }
    }

    if (Math.random() < currentLevelConfig.eventProbability && !currentEvent.value) {
      const eventType = getRandomEventType()
      const nonWarehousePoints = points.filter(p => p.id !== 'warehouse')
      const targetPoint = nonWarehousePoints[Math.floor(Math.random() * nonWarehousePoints.length)]
      if (targetPoint) {
        const event = generateEvent(eventType, targetPoint.id, targetPoint.name)
        currentEvent.value = event

        if (eventType === 'anomaly') {
          anomalyStartTurns[targetPoint.id] = turn.value + 1
        }
      }
    }

    turn.value++
    animatingPointId.value = null
    isExecuting.value = false

    const [executedStep] = plannedRoute.splice(0, 1)
    if (executedStep) {
      executedSteps.push(executedStep)
    }
    recalculateRouteCosts()

    updateTaskProgress()

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
          recalculateRouteCosts()
          break
        case 'anomaly':
          if (targetPoint) {
            targetPoint.status = 'anomaly'
            anomalyStartTurns[targetPoint.id] = turn.value
          }
          break
        case 'boost_refill':
          if (targetPoint) {
            targetPoint.status = 'boost'
          }
          break
      }
    } else {
      switch (event.type) {
        case 'demand_surge':
          break
        case 'route_block':
          turn.value++
          break
        case 'anomaly':
          if (targetPoint) {
            targetPoint.demand = Math.max(0, targetPoint.demand - Math.round(targetPoint.demand * 0.3))
          }
          break
        case 'boost_refill':
          break
      }
    }

    currentEvent.value = null
    updateTaskProgress()
  }

  const togglePause = () => {
    isPaused.value = !isPaused.value
  }

  const calculateTaskResults = (): TaskResult[] => {
    const results: TaskResult[] = []

    currentLevelConfig.tasks.forEach(task => {
      const { value, completed } = evaluateTaskCompletion(task)

      results.push({
        taskId: task.id,
        taskName: task.name,
        icon: task.icon,
        completed,
        currentValue: value,
        threshold: task.threshold,
        scoreBonus: completed ? task.scoreBonus : 0,
        description: task.description
      })
    })

    return results
  }

  const checkAchievements = (taskResults: TaskResult[]): string[] => {
    const unlocked: string[] = []
    const nonWarehousePoints = points.filter(p => p.id !== 'warehouse')
    const completedTasksCount = taskResults.filter(r => r.completed).length
    const anomalyEntries = Object.entries(anomalyResponseTurns)
    const hasAnomalies = anomalyEntries.length > 0

    currentLevelConfig.achievements.forEach(achievement => {
      let conditionMet = false
      const cond = achievement.condition

      switch (cond.type) {
        case 'efficiency_target':
          if (cond.higherIsBetter !== false) {
            if (cond.threshold <= 3) {
              conditionMet = completedTasksCount >= cond.threshold
            } else {
              const totalDemand = nonWarehousePoints.reduce((sum, p) => sum + p.demand, 0)
              const totalGap = nonWarehousePoints.reduce((sum, p) => sum + Math.max(0, p.demand - p.delivered), 0)
              const efficiency = totalDemand > 0 ? Math.round((1 - totalGap / totalDemand) * 100) : 100
              conditionMet = efficiency >= cond.threshold
            }
          }
          break
        case 'anomaly_response':
          if (hasAnomalies) {
            const avgTurns = anomalyEntries.reduce((sum, [, t]) => sum + t, 0) / anomalyEntries.length
            conditionMet = cond.higherIsBetter !== false
              ? avgTurns >= cond.threshold
              : avgTurns <= cond.threshold
          } else {
            conditionMet = false
          }
          break
        case 'no_gap': {
          const totalDemand = nonWarehousePoints.reduce((sum, p) => sum + p.demand, 0)
          const totalDelivered = nonWarehousePoints.reduce((sum, p) => sum + Math.min(p.delivered, p.demand), 0)
          const gapRate = totalDemand > 0 ? Math.round((totalDelivered / totalDemand) * 100) : 100
          conditionMet = cond.higherIsBetter !== false
            ? gapRate >= cond.threshold
            : gapRate <= cond.threshold
          break
        }
        default:
          conditionMet = completedTasksCount >= 1
      }

      if (conditionMet) {
        unlocked.push(achievement.id)
      }
    })

    return unlocked
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
    let theoreticalMinRoute = 0
    if (warehouse) {
      const distances = nonWarehousePoints.map(p => calcDistance(warehouse.position, p.position))
      distances.sort((a, b) => a - b)
      if (distances.length > 0) {
        theoreticalMinRoute = distances.reduce((sum, d) => sum + d, 0)
      }
    }

    const actualRouteLength = totalTraveledDistance.value
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

    const taskResults = calculateTaskResults()
    const unlockedAchievements = checkAchievements(taskResults)

    const taskBonusScore = taskResults.reduce((sum, r) => sum + r.scoreBonus, 0) +
      unlockedAchievements.reduce((sum, id) => {
        const ach = currentLevelConfig.achievements.find(a => a.id === id)
        return sum + (ach?.scoreBonus || 0)
      }, 0)

    const deliveredScore = stats.totalDelivered * 10
    const efficiencyScore = stats.gapHandlingEfficiency
    const redundancyPenalty = Math.max(0, 100 - stats.routeRedundancy)
    const anomalyBonus = stats.anomalyResponseTime > 50 ? (stats.anomalyResponseTime - 50) * 2 : 0
    const gapPenalty = gapPoints.length * 20

    stats.score = deliveredScore + efficiencyScore - redundancyPenalty + anomalyBonus - gapPenalty + taskBonusScore
    stats.score = Math.max(0, stats.score)
    stats.turnsUsed = turn.value
    stats.stars = calcStars(stats.score, currentLevelConfig.targetScore)
    stats.taskResults = taskResults
    stats.unlockedAchievements = unlockedAchievements
    stats.taskBonusScore = taskBonusScore
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
    executedSteps,
    currentEvent,
    isPaused,
    isGameOver,
    isExecuting,
    animatingPointId,
    stats,
    gapPoints,
    anomalyResponseTurns,
    totalTraveledDistance,
    taskProgress,
    currentLevelConfig: computed(() => currentLevelConfig),
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
    resetGame,
    isRouteBlocked,
    getEffectiveDistance,
    updateTaskProgress,
  }
}
