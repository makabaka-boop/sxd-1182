<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  turn: number
  maxTurns: number
  isExecuting: boolean
  plannedRouteEmpty: boolean
}>()

const emit = defineEmits<{
  execute: []
  pause: []
  reset: []
}>()

const progressPercent = computed(() => {
  return Math.min(100, Math.max(0, (props.turn / props.maxTurns) * 100))
})
</script>

<template>
  <div class="w-full bg-white rounded-2xl shadow-lg p-4 border border-blue-100">
    <div class="mb-4">
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm font-medium text-gray-600">回合进度</span>
        <span class="text-sm font-bold text-blue-600">{{ turn }} / {{ maxTurns }}</span>
      </div>
      <div class="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
          :style="{ width: `${progressPercent}%` }"
        ></div>
      </div>
    </div>

    <div class="flex items-center justify-between gap-3">
      <button
        @click="emit('reset')"
        class="px-5 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all duration-200 active:scale-95"
      >
        🔄 重置
      </button>

      <button
        @click="emit('execute')"
        :disabled="plannedRouteEmpty || isExecuting"
        class="px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-200 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
      >
        🚚 执行补货
      </button>

      <button
        @click="emit('pause')"
        class="px-5 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all duration-200 active:scale-95"
      >
        ⏸️ 暂停
      </button>
    </div>
  </div>
</template>
