import type { ScoreRecord, GameStats } from '@/types'
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
    const taskCompletedCount = taskResults.filter(r => r.completed).length
    const totalTaskCount = level?.tasks.length ?? taskResults.length

    const bestTaskRecord = taskResults.map(r => ({
      taskId: r.taskId,
      taskName: r.taskName,
      currentValue: r.currentValue,
      threshold: r.threshold
    }))

    const shouldUpdate = !existing ||
      score > existing.score ||
      taskCompletedCount > (existing.taskCompletedCount ?? 0) ||
      mergedUnlocked.length > existingUnlocked.length

    if (shouldUpdate) {
      const prevBestRecord = existing?.bestTaskRecord ?? []
      const mergedTaskRecord = bestTaskRecord.length > 0 ? bestTaskRecord : prevBestRecord

      all[levelId] = {
        levelId,
        score: Math.max(existing?.score ?? 0, score),
        stars: Math.max(existing?.stars ?? 0, stars),
        timestamp: Date.now(),
        unlockedAchievementIds: mergedUnlocked,
        taskCompletedCount: Math.max(existing?.taskCompletedCount ?? 0, taskCompletedCount),
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
