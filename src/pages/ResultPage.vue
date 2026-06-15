<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import StatItem from '@/components/result/StatItem.vue'
import { useStorage } from '@/composables/useStorage'
import { LEVELS } from '@/data/levels'
import type { GameStats } from '@/types'

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
  turnsUsed: 0
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

const handleReplay = () => {
  router.push(`/game/${levelId.value}`)
}

const handleHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 flex items-center justify-center p-6">
    <div
      class="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 border border-blue-100 transition-all duration-700 ease-out"
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
        <div class="text-6xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          {{ stats.score }}
        </div>
        <div class="text-gray-400 mt-1">总分</div>
      </div>

      <div class="space-y-3 mb-8">
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
