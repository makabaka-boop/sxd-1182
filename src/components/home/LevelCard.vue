<script setup lang="ts">
import type { LevelConfig, ScoreRecord } from '@/types'

defineProps<{
  level: LevelConfig
  bestScore: ScoreRecord | null
}>()

const emit = defineEmits<{
  (e: 'select'): void
}>()

const renderStars = (count: number) => {
  const stars = []
  for (let i = 0; i < 3; i++) {
    stars.push(i < count ? '⭐' : '☆')
  }
  return stars
}
</script>

<template>
  <div
    class="relative rounded-2xl p-5 bg-gradient-to-br from-blue-500 via-blue-400 to-cyan-300 shadow-lg cursor-pointer transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl active:scale-[0.98] border border-blue-200/50 overflow-hidden group"
    @click="emit('select')"
  >
    <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
    <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12 group-hover:scale-110 transition-transform duration-500"></div>

    <div class="relative z-10">
      <div class="flex items-start justify-between mb-3">
        <div>
          <div class="text-xs text-blue-100 font-medium mb-1">关卡 {{ level.id }}</div>
          <h3 class="text-xl font-bold text-white">{{ level.name }}</h3>
        </div>
        <div class="text-2xl">
          {{ bestScore ? renderStars(bestScore.stars).join('') : '☆☆☆' }}
        </div>
      </div>

      <p class="text-sm text-blue-50 mb-4 leading-relaxed line-clamp-2">
        {{ level.description }}
      </p>

      <div class="bg-white/20 backdrop-blur-sm rounded-xl p-3 space-y-2">
        <div class="flex justify-between text-sm">
          <span class="text-blue-100">最佳分数</span>
          <span class="text-white font-bold">
            {{ bestScore ? bestScore.score : '--' }}
          </span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-blue-100">目标分数</span>
          <span class="text-yellow-100 font-bold">{{ level.targetScore }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
