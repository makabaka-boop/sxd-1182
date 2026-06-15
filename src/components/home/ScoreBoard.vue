<script setup lang="ts">
import { computed } from 'vue'
import type { ScoreRecord, LevelConfig, Achievement, AchievementRarity } from '@/types'

const props = defineProps<{
  scores: Record<number, ScoreRecord>
  levels: LevelConfig[]
}>()

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hour}:${minute}`
}

const renderStars = (count: number) => {
  const stars = []
  for (let i = 0; i < 3; i++) {
    stars.push(i < count ? '⭐' : '☆')
  }
  return stars.join('')
}

const hasScores = () => {
  return props.levels.some(level => props.scores[level.id])
}

const getTotalAchievements = computed(() => {
  return props.levels.reduce((sum, l) => sum + (l.achievements?.length ?? 0), 0)
})

const getUnlockedAchievements = computed(() => {
  const all = new Set<string>()
  Object.values(props.scores).forEach(record => {
    record.unlockedAchievementIds?.forEach(id => all.add(id))
  })
  return all.size
})

const getTotalTasks = computed(() => {
  return props.levels.reduce((sum, l) => sum + (l.tasks?.length ?? 0), 0)
})

const getCompletedTasks = computed(() => {
  return Object.values(props.scores).reduce((sum, r) => sum + (r.taskCompletedCount ?? 0), 0)
})

const getAchievementDetails = (levelId: number, ids: string[]): Achievement[] => {
  const level = props.levels.find(l => l.id === levelId)
  if (!level) return []
  return ids.map(id => level.achievements?.find(a => a.id === id)).filter(Boolean) as Achievement[]
}

const rarityColor = (rarity: AchievementRarity) => {
  switch (rarity) {
    case 'legendary': return 'text-amber-500'
    case 'epic': return 'text-purple-500'
    case 'rare': return 'text-blue-500'
    default: return 'text-slate-400'
  }
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
    <div class="bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-white">🏆 成绩榜</h2>
        <div class="flex items-center gap-4 text-white/90 text-sm">
          <span class="flex items-center gap-1.5">
            <span>🏅</span>
            {{ getUnlockedAchievements }} / {{ getTotalAchievements }} 成就
          </span>
          <span class="flex items-center gap-1.5">
            <span>🎯</span>
            {{ getCompletedTasks }} / {{ getTotalTasks }} 任务
          </span>
        </div>
      </div>
    </div>

    <div v-if="!hasScores()" class="p-10 text-center">
      <div class="text-5xl mb-3 opacity-40">📋</div>
      <p class="text-gray-400 font-medium">暂无记录</p>
      <p class="text-sm text-gray-300 mt-1">完成关卡后成绩将显示在这里</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="bg-blue-50 border-b border-blue-100">
            <th class="px-5 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">关卡</th>
            <th class="px-5 py-3 text-center text-xs font-semibold text-blue-700 uppercase tracking-wider">分数</th>
            <th class="px-5 py-3 text-center text-xs font-semibold text-blue-700 uppercase tracking-wider">星级</th>
            <th class="px-5 py-3 text-center text-xs font-semibold text-blue-700 uppercase tracking-wider">🎯 任务</th>
            <th class="px-5 py-3 text-center text-xs font-semibold text-blue-700 uppercase tracking-wider">🏅 成就</th>
            <th class="px-5 py-3 text-right text-xs font-semibold text-blue-700 uppercase tracking-wider">时间</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-blue-50">
          <tr
            v-for="level in levels"
            :key="level.id"
            class="transition-colors hover:bg-blue-50/50"
          >
            <td class="px-5 py-4 whitespace-nowrap">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-400 text-white text-sm font-bold flex items-center justify-center">
                  {{ level.id }}
                </div>
                <div>
                  <div class="text-sm font-semibold text-gray-800">{{ level.name }}</div>
                  <div class="text-xs text-gray-400">目标 {{ level.targetScore }}</div>
                </div>
              </div>
            </td>
            <td class="px-5 py-4 whitespace-nowrap text-center">
              <span v-if="scores[level.id]" class="text-lg font-bold text-blue-600">
                {{ scores[level.id].score }}
              </span>
              <span v-else class="text-gray-300">--</span>
            </td>
            <td class="px-5 py-4 whitespace-nowrap text-center">
              <span v-if="scores[level.id]" class="text-lg">
                {{ renderStars(scores[level.id].stars) }}
              </span>
              <span v-else class="text-gray-300 text-lg">☆☆☆</span>
            </td>
            <td class="px-5 py-4 whitespace-nowrap text-center">
              <template v-if="scores[level.id]">
                <div class="inline-flex flex-col items-center gap-1">
                  <span
                    class="text-sm font-bold"
                    :class="(scores[level.id].taskCompletedCount ?? 0) === (scores[level.id].totalTaskCount ?? level.tasks?.length ?? 0)
                      ? 'text-emerald-600'
                      : 'text-amber-600'"
                  >
                    {{ scores[level.id].taskCompletedCount ?? 0 }} / {{ scores[level.id].totalTaskCount ?? level.tasks?.length ?? 0 }}
                  </span>
                  <div class="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full"
                      :style="{
                        width: `${((scores[level.id].taskCompletedCount ?? 0) /
                          Math.max(1, (scores[level.id].totalTaskCount ?? level.tasks?.length ?? 0))) * 100}%`
                      }"
                    ></div>
                  </div>
                </div>
              </template>
              <span v-else class="text-gray-300">--</span>
            </td>
            <td class="px-5 py-4 whitespace-nowrap text-center">
              <template v-if="scores[level.id] && scores[level.id].unlockedAchievementIds?.length > 0">
                <div class="flex items-center justify-center gap-1">
                  <span
                    v-for="ach in getAchievementDetails(level.id, scores[level.id].unlockedAchievementIds!).slice(0, 4)"
                    :key="ach.id"
                    class="text-lg"
                    :class="rarityColor(ach.rarity)"
                    :title="`${ach.name} - ${ach.description}`"
                  >
                    {{ ach.icon }}
                  </span>
                  <span
                    v-if="(scores[level.id].unlockedAchievementIds?.length ?? 0) > 4"
                    class="text-xs text-gray-500 font-medium ml-1"
                  >
                    +{{ (scores[level.id].unlockedAchievementIds?.length ?? 0) - 4 }}
                  </span>
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  {{ scores[level.id].unlockedAchievementIds?.length }} / {{ level.achievements?.length ?? 0 }}
                </div>
              </template>
              <span v-else class="text-gray-300">--</span>
            </td>
            <td class="px-5 py-4 whitespace-nowrap text-right text-sm text-gray-500">
              <span v-if="scores[level.id]">{{ formatTime(scores[level.id].timestamp) }}</span>
              <span v-else class="text-gray-300">--</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
