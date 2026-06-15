<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import StatItem from '@/components/result/StatItem.vue'
import { useStorage } from '@/composables/useStorage'
import { LEVELS } from '@/data/levels'
import type { GameStats, Achievement, AchievementRarity } from '@/types'

const route = useRoute()
const router = useRouter()
const { getScore } = useStorage()

const levelId = computed(() => {
  const id = route.params.levelId
  return typeof id === 'string' ? parseInt(id, 10) : 1
})

const level = computed(() => {
  return LEVELS.find(l => l.id === levelId.value) || LEVELS[0]
})

const totalDemand = computed(() => {
  return level.value.points.reduce((sum, p) => sum + p.demand, 0)
})

const getRouteStats = (): GameStats | null => {
  try {
    const historyState = window.history.state as { stats?: GameStats } | null
    if (historyState?.stats) {
      return historyState.stats
    }
  } catch {
    return null
  }
  return null
}

const defaultStats: GameStats = {
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
}

const stats = ref<GameStats>({ ...defaultStats })
const visible = ref(false)

onMounted(() => {
  const routeStats = getRouteStats()
  if (routeStats) {
    stats.value = { ...routeStats }
  } else {
    const record = getScore(levelId.value)
    if (record) {
      stats.value = {
        ...defaultStats,
        score: record.score,
        stars: record.stars
      }
    }
  }
  setTimeout(() => {
    visible.value = true
  }, 50)
})

const starsArray = computed(() => {
  return Array.from({ length: 3 }, (_, i) => i < stats.value.stars)
})

const unlockedAchievementDetails = computed(() => {
  const ids = stats.value.unlockedAchievements || []
  return ids.map(id => level.value.achievements.find(a => a.id === id)).filter(Boolean) as Achievement[]
})

const taskResults = computed(() => stats.value.taskResults || [])
const completedTaskCount = computed(() => taskResults.value.filter(r => r.completed).length)

const rarityStyles = (rarity: AchievementRarity) => {
  switch (rarity) {
    case 'legendary':
      return 'bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 border-amber-300 shadow-amber-200'
    case 'epic':
      return 'bg-gradient-to-br from-purple-500 via-violet-500 to-fuchsia-500 border-purple-300 shadow-purple-200'
    case 'rare':
      return 'bg-gradient-to-br from-blue-500 via-cyan-500 to-sky-500 border-blue-300 shadow-blue-200'
    default:
      return 'bg-gradient-to-br from-slate-400 via-gray-500 to-zinc-500 border-slate-300 shadow-slate-200'
  }
}

const rarityLabel = (rarity: AchievementRarity) => {
  switch (rarity) {
    case 'legendary': return '传说'
    case 'epic': return '史诗'
    case 'rare': return '稀有'
    default: return '普通'
  }
}

const formatTaskValue = (result: { currentValue: number; threshold: number }) => {
  const isPercentage = result.threshold === 100 || (result.threshold > 50 && result.threshold <= 100)
  if (isPercentage) {
    return `${Math.round(result.currentValue)}% / ≥${result.threshold}%`
  }
  if (result.threshold < 10) {
    return `${Number(result.currentValue).toFixed(1)} / ≤${result.threshold}`
  }
  return `${Math.round(result.currentValue)} / ${result.threshold}`
}

const handleReplay = () => {
  router.push(`/game/${levelId.value}`)
}

const handleHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 flex items-center justify-center p-6 py-12">
    <div
      class="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 border border-blue-100 transition-all duration-700 ease-out"
      :class="visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
    >
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-amber-500 bg-clip-text text-transparent mb-4">
          🏆 关卡结算
        </h1>

        <div class="flex justify-center gap-2 mb-6">
          <span
            v-for="(filled, index) in starsArray"
            :key="index"
            class="text-5xl transition-all duration-500"
            :class="filled ? 'text-amber-400 drop-shadow-md scale-100' : 'text-gray-200 scale-90'"
            :style="{ transitionDelay: `${index * 150 + 200}ms` }"
          >
            ⭐
          </span>
        </div>

        <div class="mb-2 text-gray-500 text-sm">{{ level.name }}</div>
        <div class="flex items-baseline justify-center gap-2 mb-1">
          <div class="text-6xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            {{ stats.score }}
          </div>
        </div>
        <div class="text-gray-400 mt-1">总分</div>
        <div v-if="stats.taskBonusScore > 0" class="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
          <span>🎁</span>
          任务与成就加成 +{{ stats.taskBonusScore }} 分
        </div>
      </div>

      <div v-if="taskResults.length > 0" class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span>🎯</span> 任务完成情况
          </h2>
          <span class="text-sm font-medium px-3 py-1 rounded-full"
            :class="completedTaskCount === taskResults.length
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-amber-100 text-amber-700'"
          >
            {{ completedTaskCount }} / {{ taskResults.length }} 完成
          </span>
        </div>
        <div class="space-y-3">
          <div
            v-for="(task, idx) in taskResults"
            :key="task.taskId"
            class="rounded-xl border p-4 transition-all duration-500"
            :class="task.completed
              ? 'bg-emerald-50/50 border-emerald-200'
              : 'bg-slate-50 border-slate-200'"
            :style="{ transitionDelay: `${idx * 100 + 400}ms` }"
          >
            <div class="flex items-center gap-4">
              <div class="text-3xl shrink-0">{{ task.icon }}</div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2 mb-1">
                  <span class="font-semibold text-gray-800">{{ task.taskName }}</span>
                  <div class="flex items-center gap-2 shrink-0">
                    <span v-if="task.completed" class="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      +{{ task.scoreBonus }}
                    </span>
                    <span class="text-sm font-medium"
                      :class="task.completed ? 'text-emerald-600' : 'text-slate-500'"
                    >
                      {{ task.completed ? '✓ 完成' : '✗ 未达成' }}
                    </span>
                  </div>
                </div>
                <p class="text-xs text-gray-500 mb-2">{{ task.description }}</p>
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-xs text-gray-600">{{ formatTaskValue(task) }}</span>
                </div>
                <div class="w-full h-2 bg-white rounded-full overflow-hidden border border-gray-100">
                  <div
                    class="h-full rounded-full transition-all duration-700 ease-out"
                    :class="task.completed
                      ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                      : 'bg-gradient-to-r from-slate-300 to-slate-400'"
                    :style="{
                      width: `${Math.min(100, task.threshold > 0
                        ? (task.completed
                            ? 100
                            : (task.threshold < 10
                                ? ((task.threshold - Math.max(0, task.currentValue - task.threshold)) / task.threshold) * 100
                                : (task.currentValue / task.threshold) * 100))
                        : 0)}%`
                    }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="unlockedAchievementDetails.length > 0" class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span>🏅</span> 解锁成就
          </h2>
          <span class="text-sm font-medium px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700">
            {{ unlockedAchievementDetails.length }} 个
          </span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="(achievement, idx) in unlockedAchievementDetails"
            :key="achievement.id"
            class="rounded-xl p-4 border-2 shadow-lg transform transition-all duration-500 hover:scale-[1.02]"
            :class="rarityStyles(achievement.rarity)"
            :style="{ transitionDelay: `${idx * 150 + 600}ms` }"
          >
            <div class="flex items-center gap-3">
              <div class="text-4xl drop-shadow-md">{{ achievement.icon }}</div>
              <div class="flex-1 min-w-0 text-white">
                <div class="flex items-center gap-2 mb-0.5">
                  <span class="font-bold drop-shadow-sm truncate">{{ achievement.name }}</span>
                  <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/25 backdrop-blur-sm shrink-0">
                    {{ rarityLabel(achievement.rarity) }}
                  </span>
                </div>
                <p class="text-xs text-white/90 leading-relaxed line-clamp-2">{{ achievement.description }}</p>
                <div class="text-xs font-semibold mt-1.5 text-white/95">
                  +{{ achievement.scoreBonus }} 奖励分
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-3 mb-8">
        <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>📊</span> 游戏数据
        </h2>
        <StatItem
          label="总配送量"
          icon="📦"
          :value="stats.totalDelivered"
          :max-value="totalDemand"
        />
        <StatItem
          label="缺口处理效率"
          icon="✅"
          :value="stats.gapHandlingEfficiency"
          :max-value="100"
        />
        <StatItem
          label="路线精简度"
          icon="🛣️"
          :value="stats.routeRedundancy"
          :max-value="100"
        />
        <StatItem
          label="异常响应速度"
          icon="⚡"
          :value="stats.anomalyResponseTime"
          :max-value="100"
        />
        <StatItem
          label="库存剩余率"
          icon="📊"
          :value="stats.finalInventory"
          :max-value="100"
        />
      </div>

      <div class="flex gap-4">
        <button
          @click="handleReplay"
          class="flex-1 py-3.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold shadow-lg shadow-blue-200 transition-all duration-200 active:scale-95"
        >
          🔄 再玩一次
        </button>
        <button
          @click="handleHome"
          class="flex-1 py-3.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-bold shadow-lg shadow-amber-200 transition-all duration-200 active:scale-95"
        >
          🏠 返回主菜单
        </button>
      </div>
    </div>
  </div>
</template>
