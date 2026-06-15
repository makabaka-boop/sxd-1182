<script setup lang="ts">
import type { SupplyPoint, RouteStep } from '@/types'
import { useDrag } from '@/composables/useDrag'

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
  <div class="bg-white rounded-2xl shadow-lg p-5">
    <h3 class="text-lg font-bold mb-4 flex items-center gap-2 text-slate-700">
      <span class="text-2xl">📋</span>
      补货路线
    </h3>
    <div v-if="plannedRoute.length === 0" class="text-center py-10 text-slate-400">
      <div class="text-4xl mb-2">📍</div>
      <p>点击地图上的补货点添加到路线</p>
    </div>
    <ul v-else class="space-y-2">
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
          class="absolute -top-1 left-0 right-0 h-1 bg-blue-500 rounded-full z-10"
        ></div>
        <div
          draggable="true"
          @dragstart="handleDragStart($event, step, index)"
          @dragend="handleDragEnd"
          class="flex items-center gap-3 p-3 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border-2 border-sky-100 hover:border-sky-300 transition-colors cursor-move"
        >
          <span class="w-7 h-7 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
            {{ index + 1 }}
          </span>
          <span class="text-2xl">{{ getPointById(step.pointId)?.emoji }}</span>
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-slate-700 truncate">{{ getPointById(step.pointId)?.name }}</div>
            <div class="text-xs text-slate-500">预计消耗: {{ step.estimatedCost }}</div>
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
          class="absolute -bottom-1 left-0 right-0 h-1 bg-blue-500 rounded-full z-10"
        ></div>
      </li>
    </ul>
  </div>
</template>
