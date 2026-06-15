<script setup lang="ts">
import { computed } from 'vue'
import type { Inventory } from '@/types'

const props = defineProps<{
  inventory: Inventory
}>()

const totalPercent = computed(() => {
  return Math.min((props.inventory.total / 200) * 100, 100)
})
</script>

<template>
  <div class="rounded-2xl p-5 bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg">
    <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
      <span class="text-2xl">📦</span>
      库存面板
    </h3>
    <div class="grid grid-cols-3 gap-3 mb-4">
      <div class="bg-white/20 rounded-xl p-3 text-center backdrop-blur-sm">
        <div class="text-3xl mb-1">🥤</div>
        <div class="text-sm text-sky-100">可乐</div>
        <div class="text-2xl font-bold">{{ inventory.cola }}</div>
      </div>
      <div class="bg-white/20 rounded-xl p-3 text-center backdrop-blur-sm">
        <div class="text-3xl mb-1">🧃</div>
        <div class="text-sm text-sky-100">果汁</div>
        <div class="text-2xl font-bold">{{ inventory.juice }}</div>
      </div>
      <div class="bg-white/20 rounded-xl p-3 text-center backdrop-blur-sm">
        <div class="text-3xl mb-1">🍦</div>
        <div class="text-sm text-sky-100">冰淇淋</div>
        <div class="text-2xl font-bold">{{ inventory.icecream }}</div>
      </div>
    </div>
    <div>
      <div class="flex justify-between text-sm mb-1">
        <span>总库存</span>
        <span class="font-semibold">{{ inventory.total }} / 200</span>
      </div>
      <div class="w-full bg-white/20 rounded-full h-3 overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-cyan-300 to-white rounded-full transition-all duration-500"
          :style="{ width: totalPercent + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>
