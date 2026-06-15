<script setup lang="ts">
import type { ScoreRecord, LevelConfig } from '@/types'

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
</script>

<template>
  <div class="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
    <div class="bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-4">
      <h2 class="text-xl font-bold text-white">🏆 成绩榜</h2>
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
