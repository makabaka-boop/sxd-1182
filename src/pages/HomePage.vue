<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { BookOpen, Trophy, Play } from 'lucide-vue-next'
import LevelCard from '@/components/home/LevelCard.vue'
import ScoreBoard from '@/components/home/ScoreBoard.vue'
import TutorialModal from '@/components/common/TutorialModal.vue'
import { LEVELS } from '@/data/levels'
import { useStorage } from '@/composables/useStorage'
import type { ScoreRecord } from '@/types'

const router = useRouter()
const { getAllScores } = useStorage()

const showTutorial = ref(false)
const showScores = ref(false)
const scores = ref<Record<number, ScoreRecord>>({})

onMounted(() => {
  scores.value = getAllScores()
})

const handleSelectLevel = (levelId: number) => {
  router.push(`/game/${levelId}`)
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 relative overflow-hidden">
    <div class="absolute top-0 left-0 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
    <div class="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-200/30 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

    <div class="relative container mx-auto px-6 py-12 max-w-6xl">
      <header class="text-center mb-16">
        <div class="inline-flex items-center gap-3 mb-4">
          <span class="text-5xl">🧊</span>
          <h1 class="text-5xl font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">
            冰路先锋
          </h1>
          <span class="text-5xl">🚚</span>
        </div>
        <p class="text-lg text-slate-600 max-w-xl mx-auto">
          冷饮补货调度模拟器 —— 规划最优路线，应对突发状况，做最酷的物流大师
        </p>
        <div class="flex items-center justify-center gap-3 mt-6">
          <button
            @click="showTutorial = true"
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur text-sky-700 hover:bg-white border border-sky-200 hover:border-sky-300 transition-all hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
          >
            <BookOpen class="w-4 h-4" />
            游戏教程
          </button>
          <button
            @click="showScores = !showScores"
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur text-amber-600 hover:bg-white border border-amber-200 hover:border-amber-300 transition-all hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
          >
            <Trophy class="w-4 h-4" />
            {{ showScores ? '隐藏成绩' : '历史成绩' }}
          </button>
        </div>
      </header>

      <transition name="fade-slide" mode="out-in">
        <div v-if="showScores" key="scores" class="mb-12">
          <ScoreBoard :scores="scores" :levels="LEVELS" />
        </div>

        <section v-else key="levels">
          <h2 class="text-xl font-semibold text-slate-700 mb-6 flex items-center gap-2">
            <Play class="w-5 h-5 text-sky-500" />
            选择关卡
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <LevelCard
              v-for="level in LEVELS"
              :key="level.id"
              :level="level"
              :best-score="scores[level.id] ?? null"
              @select="handleSelectLevel(level.id)"
            />
          </div>
        </section>
      </transition>

      <footer class="mt-20 text-center text-sm text-slate-400">
        <p>❄️ 保持冷静，高效配送 ❄️</p>
      </footer>
    </div>

    <TutorialModal :visible="showTutorial" @close="showTutorial = false" />
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
