<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  label: string
  value: number
  maxValue: number
  icon: string
  higherIsBetter?: boolean
}>(), {
  higherIsBetter: true
})

const percentage = computed(() => {
  if (props.maxValue <= 0) return 0
  return Math.min(100, Math.max(0, (props.value / props.maxValue) * 100))
})

const isGood = computed(() => {
  return props.higherIsBetter ? percentage.value >= 60 : percentage.value <= 40
})

const displayValue = computed(() => {
  if (props.maxValue === 100) {
    return `${Math.round(percentage.value)}%`
  }
  return `${Math.round(props.value)} / ${Math.round(props.maxValue)}`
})

const progressBarColor = computed(() => {
  if (isGood.value) {
    return 'bg-gradient-to-r from-green-400 to-green-500'
  }
  return 'bg-gradient-to-r from-orange-400 to-red-500'
})
</script>

<template>
  <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <span class="text-2xl">{{ icon }}</span>
        <span class="font-medium text-gray-700">{{ label }}</span>
      </div>
      <span class="font-bold text-lg" :class="isGood ? 'text-green-600' : 'text-orange-500'">
        {{ displayValue }}
      </span>
    </div>
    <div class="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
      <div
        class="h-full rounded-full transition-all duration-700 ease-out"
        :class="progressBarColor"
        :style="{ width: `${percentage}%` }"
      ></div>
    </div>
  </div>
</template>
