<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import GameMap from '@/components/game/GameMap.vue'
import RouteQueue from '@/components/game/RouteQueue.vue'
import InventoryPanel from '@/components/game/InventoryPanel.vue'
import EventModal from '@/components/game/EventModal.vue'
import ControlBar from '@/components/game/ControlBar.vue'
import PauseModal from '@/components/common/PauseModal.vue'
import TutorialModal from '@/components/common/TutorialModal.vue'
import { useGame } from '@/composables/useGame'
import { useDrag } from '@/composables/useDrag'
import { useStorage } from '@/composables/useStorage'
import { LEVELS } from '@/data/levels'

const route = useRoute()
const router = useRouter()

const levelId = computed(() => Number(route.params.levelId) || 1)
const level = computed(() => LEVELS.find(l => l.id === levelId.value) ?? LEVELS[0])

const {
  turn,
  inventory,
  points,
  routes,
  plannedRoute,
  currentEvent,
  isPaused,
  isGameOver,
  isExecuting,
  animatingPointId,
  stats,
  addPointToRoute,
  removePointFromRoute,
  reorderRoute,
  executeRouteStep,
  handleEventOption,
  togglePause,
  resetGame,
  initGame,
  calculateFinalStats,
} = useGame(levelId.value)

const { draggedItem, draggedIndex, dragOverIndex, onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd } = useDrag()
const { saveScore } = useStorage()

const showTutorial = computed(() => false)
const localShowTutorial = showTutorial

onMounted(() => {
  initGame()
})

watch(levelId, () => {
  initGame()
})

watch(isGameOver, (over) => {
  if (over) {
    calculateFinalStats()
    saveScore(levelId.value, stats.score, stats.stars)
    setTimeout(() => {
      router.push({
        path: `/result/${levelId.value}`,
        state: { stats: JSON.parse(JSON.stringify(stats)) },
      })
    }, 800)
  }
})

const handlePointClick = (pointId: string) => {
  if (isPaused.value || isExecuting.value) return
  addPointToRoute(pointId)
}

const handleDrop = () => {
  if (draggedIndex.value !== null && dragOverIndex.value !== null) {
    reorderRoute(draggedIndex.value, dragOverIndex.value)
  }
  onDragEnd()
}

const handleReorder = (fromIdx: number, toIdx: number) => {
  reorderRoute(fromIdx, toIdx)
}

const handleRemoveStep = (stepId: string) => {
  removePointFromRoute(stepId)
}

const handleQuit = () => {
  router.push('/')
}

const handleRestart = () => {
  resetGame()
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-blue-50">
    <header class="bg-white/70 backdrop-blur-md border-b border-sky-100 sticky top-0 z-20">
      <div class="container mx-auto px-4 py-3 flex items-center justify-between max-w-7xl">
        <button
          @click="router.push('/')"
          class="flex items-center gap-2 text-slate-600 hover:text-sky-600 transition-colors font-medium"
        >
          <span class="text-xl">🧊</span>
          <span>冰路先锋</span>
        </button>
        <div class="flex items-center gap-4">
          <span class="text-slate-700 font-medium">{{ level?.name }}</span>
          <span class="text-sm text-slate-500">目标 {{ level?.targetScore }} 分</span>
        </div>
      </div>
    </header>

    <main class="container mx-auto px-4 py-6 max-w-7xl">
      <div class="grid grid-cols-12 gap-6">
        <div class="col-span-12 lg:col-span-3 space-y-4">
          <InventoryPanel :inventory="inventory" />

          <div class="bg-white rounded-2xl shadow-sm border border-sky-100 p-5">
            <h3 class="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <span>📍</span> 补货点状态
            </h3>
            <div class="space-y-2">
              <div
                v-for="p in points.filter(p => p.id !== 'warehouse')"
                :key="p.id"
                class="flex items-center justify-between text-sm p-2 rounded-lg bg-slate-50 hover:bg-sky-50 transition-colors"
              >
                <div class="flex items-center gap-2">
                  <span>{{ p.emoji }}</span>
                  <span class="text-slate-700">{{ p.name }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span
                    :class="[
                      'text-xs px-2 py-0.5 rounded-full',
                      p.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                      p.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                      p.priority === 'low' ? 'bg-slate-200 text-slate-600' :
                      'bg-sky-100 text-sky-600'
                    ]"
                  >
                    {{ p.priority === 'urgent' ? '紧急' : p.priority === 'high' ? '高' : p.priority === 'low' ? '低' : '正常' }}
                  </span>
                  <span class="text-slate-500 text-xs">{{ p.delivered }}/{{ p.demand }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-span-12 lg:col-span-6 space-y-4">
          <ControlBar
            :turn="turn"
            :max-turns="level?.maxTurns ?? 10"
            :is-executing="isExecuting"
            :planned-route-empty="plannedRoute.length === 0"
            @execute="executeRouteStep"
            @pause="togglePause"
            @reset="resetGame"
          />

          <div class="bg-white rounded-2xl shadow-sm border border-sky-100 p-4 overflow-hidden">
            <GameMap
              :points="points"
              :routes="routes"
              :planned-route="plannedRoute"
              :animating-point-id="animatingPointId"
              @point-click="handlePointClick"
            />
          </div>
        </div>

        <div class="col-span-12 lg:col-span-3">
          <RouteQueue
            :planned-route="plannedRoute"
            :points="points"
            :dragged-item="draggedItem"
            :drag-over-index="dragOverIndex"
            @reorder="handleReorder"
            @remove="handleRemoveStep"
            @drag-start="onDragStart"
            @drag-over="onDragOver"
            @drag-leave="onDragLeave"
            @drop="handleDrop"
            @drag-end="onDragEnd"
          />
        </div>
      </div>
    </main>

    <EventModal :event="currentEvent" @choose="handleEventOption" />
    <PauseModal
      :visible="isPaused"
      @resume="togglePause"
      @restart="handleRestart"
      @quit="handleQuit"
    />
    <TutorialModal :visible="!!localShowTutorial" @close="() => {}" />
  </div>
</template>
