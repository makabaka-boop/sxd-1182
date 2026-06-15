<script setup lang="ts">
import { computed, watch, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Flag, HelpCircle } from 'lucide-vue-next'
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
import type { Priority } from '@/types'

const route = useRoute()
const router = useRouter()

const showTutorial = ref(false)

const levelId = computed(() => Number(route.params.levelId) || 1)
const level = computed(() => LEVELS.find(l => l.id === levelId.value) ?? LEVELS[0])

const {
  turn,
  inventory,
  points,
  routes,
  plannedRoute,
  executedSteps,
  currentEvent,
  isPaused,
  isGameOver,
  isExecuting,
  animatingPointId,
  stats,
  totalTraveledDistance,
  addPointToRoute,
  removePointFromRoute,
  reorderRoute,
  executeRouteStep,
  handleEventOption,
  togglePause,
  resetGame,
  initGame,
  calculateFinalStats,
  setPointPriority,
} = useGame(levelId.value)

const { draggedItem, draggedIndex, dragOverIndex, onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd } = useDrag()
const { saveScore } = useStorage()

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

const cyclePriority = (pointId: string, currentPriority: Priority) => {
  if (isPaused.value || isExecuting.value) return
  const priorities: Priority[] = ['low', 'normal', 'high', 'urgent']
  const currentIdx = priorities.indexOf(currentPriority)
  const nextIdx = (currentIdx + 1) % priorities.length
  setPointPriority(pointId, priorities[nextIdx])
}

const priorityLabel = (p: Priority) => {
  return p === 'urgent' ? '紧急' : p === 'high' ? '高' : p === 'low' ? '低' : '正常'
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
          <button
            @click="showTutorial = true"
            class="p-2 rounded-full text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
          >
            <HelpCircle class="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>

    <main class="container mx-auto px-4 py-6 max-w-7xl">
      <div class="grid grid-cols-12 gap-6">
        <div class="col-span-12 lg:col-span-3 space-y-4">
          <InventoryPanel :inventory="inventory" :initial-total="level?.initialInventory.total" />

          <div class="bg-white rounded-2xl shadow-sm border border-sky-100 p-5">
            <h3 class="text-sm font-semibold text-slate-700 mb-3 flex items-center justify-between">
              <span class="flex items-center gap-2">
                <span>📍</span> 补货点状态
              </span>
              <span class="text-xs text-slate-400 font-normal">点击优先级切换</span>
            </h3>
            <div class="space-y-2">
              <div
                v-for="p in points.filter(p => p.id !== 'warehouse')"
                :key="p.id"
                class="flex items-center justify-between text-sm p-2 rounded-lg transition-colors"
                :class="[
                  p.status === 'anomaly' ? 'bg-red-50 border border-red-100' :
                  p.status === 'boost' ? 'bg-amber-50 border border-amber-100' :
                  'bg-slate-50 hover:bg-sky-50'
                ]"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <span class="text-lg">{{ p.emoji }}</span>
                  <div class="min-w-0">
                    <div class="text-slate-700 font-medium truncate">{{ p.name }}</div>
                    <div class="text-xs text-slate-500">
                      {{ p.delivered }}/{{ p.demand }}
                      <span v-if="p.status === 'anomaly'" class="text-red-500 ml-1">⚠️ 异常</span>
                      <span v-else-if="p.status === 'boost'" class="text-amber-600 ml-1">⚡ 加速</span>
                    </div>
                  </div>
                </div>
                <button
                  @click="cyclePriority(p.id, p.priority)"
                  :class="[
                    'text-xs px-2.5 py-1 rounded-full font-medium transition-all shrink-0',
                    p.priority === 'urgent' ? 'bg-red-100 text-red-600 hover:bg-red-200' :
                    p.priority === 'high' ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' :
                    p.priority === 'low' ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' :
                    'bg-sky-100 text-sky-600 hover:bg-sky-200'
                  ]"
                >
                  {{ priorityLabel(p.priority) }}
                </button>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-sm border border-sky-100 p-5">
            <h3 class="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Flag class="w-4 h-4 text-sky-500" />
              路程损耗提示
            </h3>
            <p class="text-xs text-slate-500 leading-relaxed">
              运输距离越远，冷饮融化损耗越多。合理规划路线可减少库存消耗。
              封路路段需绕行，距离增加 <span class="text-red-500 font-medium">80%</span>。
            </p>
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

          <GameMap
            :points="points"
            :routes="routes"
            :planned-route="plannedRoute"
            :executed-steps="executedSteps"
            :animating-point-id="animatingPointId"
            :total-traveled-distance="totalTraveledDistance"
            @point-click="handlePointClick"
          />
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
    <TutorialModal :visible="showTutorial" @close="showTutorial = false" />
  </div>
</template>
