<script setup lang="ts">
import type { LevelConfig, ScoreRecord } from '@/types'

const props = defineProps<{
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

const unlockedAchievementCount = () => {
  return props.bestScore?.unlockedAchievementIds?.length ?? 0
}

const totalAchievementCount = () => {
  return props.level.achievements?.length ?? 0
}

const taskProgress = () => {
  const completed = props.bestScore?.taskCompletedCount ?? 0
  const total = props.bestScore?.totalTaskCount ?? props.level.tasks?.length ?? 0
  return { completed, total }
}

const bestTaskRecord = () => {
  return props.bestScore?.bestTaskRecord ?? []
}

const highestAchievement = () => {
  if (!props.bestScore?.unlockedAchievementIds?.length) return null
  const achievements = props.level.achievements
  if (!achievements) return null

  const rarityOrder: ('common' | 'rare' | 'epic' | 'legendary')[] = ['common', 'rare', 'epic', 'legendary']
  let highest: any = null
  let highestRank = -1

  props.bestScore.unlockedAchievementIds.forEach(id => {
    const ach = achievements.find((a: any) => a.id === id)
    if (ach) {
      const rank = rarityOrder.indexOf(ach.rarity)
      if (rank > highestRank) {
        highest = ach
        highestRank = rank
      }
    }
  })

  return highest
}

const rarityBgClass = (rarity: string) => {
  switch (rarity) {
    case 'legendary': return 'bg-gradient-to-r from-amber-400 to-orange-500'
    case 'epic': return 'bg-gradient-to-r from-purple-500 to-fuchsia-500'
    case 'rare': return 'bg-gradient-to-r from-blue-500 to-cyan-500'
    default: return 'bg-gradient-to-r from-slate-400 to-gray-500'
  }
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

      <div class="bg-white/20 backdrop-blur-sm rounded-xl p-3 space-y-2.5">
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

        <div class="h-px bg-white/20 my-1"></div>

        <div class="flex justify-between text-sm items-center">
          <span class="text-blue-100 flex items-center gap-1.5">
            <span>🏅</span> 成就
          </span>
          <span class="text-white font-bold">
            {{ unlockedAchievementCount() }} / {{ totalAchievementCount() }}
          </span>
        </div>

        <div class="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full bg-gradient-to-r from-amber-300 to-yellow-400 transition-all duration-500"
            :style="{ width: `${totalAchievementCount() > 0 ? (unlockedAchievementCount() / totalAchievementCount()) * 100 : 0}%` }"
          ></div>
        </div>

        <div class="flex justify-between text-sm items-center">
          <span class="text-blue-100 flex items-center gap-1.5">
            <span>🎯</span> 任务
          </span>
          <span class="text-white font-bold">
            {{ taskProgress().completed }} / {{ taskProgress().total }}
          </span>
        </div>

        <div class="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full bg-gradient-to-r from-emerald-300 to-green-400 transition-all duration-500"
            :style="{ width: `${taskProgress().total > 0 ? (taskProgress().completed / taskProgress().total) * 100 : 0}%` }"
          ></div>
        </div>
      </div>

      <div v-if="highestAchievement()" class="mt-3">
        <div class="text-xs text-blue-100 font-medium flex items-center gap-1 mb-1.5">
          <span>🏅</span> 最高成就
        </div>
        <div
          class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-white text-xs font-medium"
          :class="rarityBgClass(highestAchievement()!.rarity)"
        >
          <span class="text-base">{{ highestAchievement()!.icon }}</span>
          <span class="font-medium">{{ highestAchievement()!.name }}</span>
        </div>
      </div>

      <div v-if="bestTaskRecord().length > 0" class="mt-3 space-y-1.5">
        <div class="text-xs text-blue-100 font-medium flex items-center gap-1">
          <span>📋</span> 最佳任务记录
        </div>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="record in bestTaskRecord().slice(0, 3)"
            :key="record.taskId"
            class="text-[10px] px-2 py-1 rounded-full bg-white/25 text-white font-medium backdrop-blur-sm"
            :title="`${record.taskName}: ${record.currentValue} / ${record.threshold}`"
          >
            {{ record.taskName }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
