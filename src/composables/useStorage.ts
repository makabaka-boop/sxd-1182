import type { ScoreRecord } from '@/types'

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

  const saveScore = (levelId: number, score: number, stars: number) => {
    const all = readAll()
    const existing = all[levelId]
    if (!existing || score > existing.score) {
      all[levelId] = { levelId, score, stars, timestamp: Date.now() }
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

  return {
    saveScore,
    getScore,
    getAllScores,
    clearScores,
  }
}
