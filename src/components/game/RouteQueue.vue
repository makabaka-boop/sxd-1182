<script setup lang="ts">
import { computed } from 'vue'
import type { SupplyPoint, RouteStep } from '@/types'

const props = defineProps<{
  plannedRoute: RouteStep[]
  points: SupplyPoint[]
  draggedItem: any
  dragOverIndex: number | null
}>()

const emit = defineEmits<{
  (e: 'reorder', fromIdx: number, toIdx: number): void
  (e: 'remove', stepId: string): void
  (e: 'dragStart', item: any, index: number): void
  (e: 'dragOver', event: DragEvent, index: number): void
  (e: 'dragLeave'): void
  (e: 'drop'): void
  (e: 'dragEnd'): void
}>()

const getPointById = (id: string): SupplyPoint | undefined => {
  return props.points.find(p => p.id === id)
}

const totalDistance = computed(() => {
  return props.plannedRoute.reduce((sum, step) => sum + step.estimatedCost, 0)
})

const estimatedLoss = computed(() => {
  const rate = 0.003
  const initialTotal = 90
  return Math.round(initialTotal * rate * (totalDistance.value / 100))
})

const handleDragStart = (e: DragEvent, step: RouteStep, index: number) => {
  ;(e.target as HTMLElement).classList.add('opacity-50')
  emit('dragStart', step, index)
}

const handleDragOver = (e: DragEvent, index: number) => {
  emit('dragOver', e, index)
}

const handleDragLeave = () => {
  emit('dragLeave')
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  emit('drop')
}

const handleDragEnd = (e: DragEvent) => {
  ;(e.target as HTMLElement).classList.remove('opacity-50')
  emit('dragEnd')
}

const handleRemove = (stepId: string) => {
  emit('remove', stepId)
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-sky-100 p-5">
    <h3 class="text-lg font-bold mb-3 flex items-center gap-2 text-slate-700">
      <span class="text-2xl">📋</span>
      补货路线
    </h3>
    <div v-if="plannedRoute.length === 0" class="text-center py-10 text-slate-400">
      <div class="text-4xl mb-2">📍</div>
      <p class="text-sm">点击地图上的补货点添加到路线</p>
    </div>
    <template v-else>
      <div class="mb-3 p-3 bg-sky-50 rounded-xl text-xs text-sky-700 space-y-1">
        <div class="flex justify-between">
          <span>预计距离</span>
          <span class="font-semibold">{{ Math.round(totalDistance) }}</span>
        </div>
        <div class="flex justify-between">
          <span>预计损耗</span>
          <span class="font-semibold text-orange-600">约 {{ estimatedLoss }} 单位</span>
        </div>
      </div>
      <ul class="space-y-2 max-h-80 overflow-y-auto">
        <li
          v-for="(step, index) in plannedRoute"
          :key="step.id"
          class="relative"
          @dragover="handleDragOver($event, index)"
          @dragleave="handleDragLeave"
          @drop="handleDrop"
        >
          <div
            v-if="dragOverIndex === index"
            class="absolute -top-1 left-0 right-0 h-1 bg-sky-500 rounded-full z-10"
          ></div>
          <div
            draggable="true"
            @dragstart="handleDragStart($event, step, index)"
            @dragend="handleDragEnd"
            class="flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-move"
            :class="[
              getPointById(step.pointId)?.status === 'anomaly'
                ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200 hover:border-red-300'
                : getPointById(step.pointId)?.status === 'boost'
                ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 hover:border-amber-300'
                : 'bg-gradient-to-r from-sky-50 to-blue-50 border-sky-100 hover:border-sky-300'
            ]"
          >
            <span
              class="w-7 h-7 rounded-full text-white text-sm font-bold flex items-center justify-center flex-shrink-0"
              :class="[
                getPointById(step.pointId)?.status === 'anomaly'
                  ? 'bg-gradient-to-br from-red-500 to-orange-500'
                  : getPointById(step.pointId)?.status === 'boost'
                  ? 'bg-gradient-to-br from-amber-500 to-yellow-500'
                  : 'bg-gradient-to-br from-sky-500 to-blue-600'
              ]"
            >
              {{ index + 1 }}
            </span>
            <span class="text-2xl">{{ getPointById(step.pointId)?.emoji }}</span>
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-slate-700 truncate flex items-center gap-1">
                {{ getPointById(step.pointId)?.name }}
                <span v-if="getPointById(step.pointId)?.status === 'anomaly'" class="text-xs">⚠️</span>
                <span v-else-if="getPointById(step.pointId)?.status === 'boost'" class="text-xs">⚡</span>
              </div>
              <div class="text-xs text-slate-500">
                距离 {{ Math.round(step.estimatedCost) }}
                <span
                  v-if="getPointById(step.pointId)?.status === 'anomaly'"
                  class="text-red-500 ml-1"
                >需先修复</span>
              </div>
            </div>
            <button
              @click.stop="handleRemove(step.id)"
              class="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 text-red-500 flex items-center justify-center transition-colors flex-shrink-0"
            >
              ✕
            </button>
          </div>
          <div
            v-if="dragOverIndex === index && index === plannedRoute.length - 1"
            class="absolute -bottom-1 left-0 right-0 h-1 bg-sky-500 rounded-full z-10"
          ></div>
        </li>
      </ul>
    </template>
  </div>
</template>
