import type { ScoreRecord, GameStats, TaskTarget } from '@/types'
import { LEVELS } from '@/data/levels'

const STORAGE_KEY = 'ice_road_pio_scores'

export function useStorage() {
  const readAll = (): Record<number, ScoreRecord> => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  }

  const writeAll = (data: Record<number, ScoreRecord>) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  const isBetterValue = (task: TaskTarget | undefined, oldVal: number, newVal: number): boolean => {
    if (!task) return newVal > oldVal
    const higherIsBetter = task.higherIsBetter !== false
    if (task.type === 'urgent_priority') {
      return newVal > oldVal
    }
    if (task.type === 'anomaly_response') {
      if (oldVal === 0 && newVal > 0) return false
      return higherIsBetter ? newVal > oldVal : newVal < oldVal
    }
    return higherIsBetter ? newVal > oldVal : newVal < oldVal
  }

  const mergeBestTaskRecords = (
    levelId: number,
    oldRecords: ScoreRecord['bestTaskRecord'],
    newRecords: ScoreRecord['bestTaskRecord']
  ): ScoreRecord['bestTaskRecord'] => {
    const level = LEVELS.find(l => l.id === levelId)
    if (!level) return newRecords.length > 0 ? newRecords : oldRecords

    const oldMap = new Map(oldRecords.map(r => [r.taskId, r]))
    const newMap = new Map(newRecords.map(r => [r.taskId, r]))
    const allIds = new Set([...oldMap.keys(), ...newMap.keys()])

    const merged: ScoreRecord['bestTaskRecord'] = []

    allIds.forEach(taskId => {
      const task = level.tasks.find(t => t.id === taskId)
      const oldRec = oldMap.get(taskId)
      const newRec = newMap.get(taskId)

      if (!oldRec && newRec) {
        merged.push(newRec)
      } else if (oldRec && !newRec) {
        merged.push(oldRec)
      } else if (oldRec && newRec) {
        if (isBetterValue(task, oldRec.currentValue, newRec.currentValue)) {
          merged.push(newRec)
        } else {
          merged.push(oldRec)
        }
      }
    })

    return merged
  }

  const saveScore = (
    levelId: number,
    score: number,
    stars: number,
    stats?: GameStats
  ) => {
    const all = readAll()
    const existing = all[levelId]
    const level = LEVELS.find(l => l.id === levelId)

    const newUnlocked = stats?.unlockedAchievements ?? []
    const existingUnlocked = existing?.unlockedAchievementIds ?? []
    const mergedUnlocked = Array.from(new Set([...existingUnlocked, ...newUnlocked]))

    const taskResults = stats?.taskResults ?? []
    const newTaskCompletedCount = taskResults.filter(r => r.completed).length
    const totalTaskCount = level?.tasks.length ?? taskResults.length

    const newTaskRecord = taskResults.map(r => ({
      taskId: r.taskId,
      taskName: r.taskName,
      currentValue: r.currentValue,
      threshold: r.threshold
    }))

    const prevTaskCompletedCount = existing?.taskCompletedCount ?? 0
    const bestTaskCompletedCount = Math.max(prevTaskCompletedCount, newTaskCompletedCount)

    const prevBestRecord = existing?.bestTaskRecord ?? []
    const mergedTaskRecord = mergeBestTaskRecords(levelId, prevBestRecord, newTaskRecord)

    const bestScore = Math.max(existing?.score ?? 0, score)
    const bestStars = Math.max(existing?.stars ?? 0, stars)

    const hasScoreImproved = !existing || score > existing.score
    const hasStarsImproved = !existing || stars > existing.stars
    const hasTaskImproved = newTaskCompletedCount > prevTaskCompletedCount ||
      (newTaskRecord.length > 0 && mergedTaskRecord.length > prevBestRecord.length)
    const hasAchievementImproved = mergedUnlocked.length > existingUnlocked.length

    const shouldUpdate = hasScoreImproved || hasStarsImproved || hasTaskImproved || hasAchievementImproved

    if (shouldUpdate) {
      all[levelId] = {
        levelId,
        score: bestScore,
        stars: bestStars,
        timestamp: Date.now(),
        unlockedAchievementIds: mergedUnlocked,
        taskCompletedCount: bestTaskCompletedCount,
        totalTaskCount,
        bestTaskRecord: mergedTaskRecord
      }
      writeAll(all)
    }
  }

  const getScore = (levelId: number): ScoreRecord | null => {
    const all = readAll()
    return all[levelId] || null
  }

  const getAllScores = (): Record<number, ScoreRecord> => {
    return readAll()
  }

  const clearScores = () => {
    localStorage.removeItem(STORAGE_KEY)
  }

  const getUnlockedAchievements = (levelId: number): string[] => {
    const record = getScore(levelId)
    return record?.unlockedAchievementIds ?? []
  }

  const getTotalUnlockedAchievements = (): number => {
    const all = readAll()
    const allUnlocked = new Set<string>()
    Object.values(all).forEach(record => {
      record.unlockedAchievementIds?.forEach(id => allUnlocked.add(id))
    })
    return allUnlocked.size
  }

  const getTotalAchievements = (): number => {
    return LEVELS.reduce((sum, level) => sum + level.achievements.length, 0)
  }

  return {
    saveScore,
    getScore,
    getAllScores,
    clearScores,
    getUnlockedAchievements,
    getTotalUnlockedAchievements,
    getTotalAchievements,
  }
}
