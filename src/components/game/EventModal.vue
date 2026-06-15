<script setup lang="ts">
import { computed } from 'vue'
import type { GameEvent } from '@/types'

const props = defineProps<{
  event: GameEvent | null
}>()

const emit = defineEmits<{
  (e: 'choose', optionIndex: number): void
}>()

const eventIcon = computed(() => {
  if (!props.event) return ''
  const icons: Record<string, string> = {
    demand_surge: '📈',
    route_block: '🚧',
    anomaly: '⚠️',
    boost_refill: '✨'
  }
  return icons[props.event.type] || '📢'
})

const handleChoose = (index: number) => {
  emit('choose', index)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="event"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div class="bg-gradient-to-r from-orange-500 to-red-500 p-5 text-white">
            <div class="flex items-center gap-3">
              <span class="text-4xl">{{ eventIcon }}</span>
              <h2 class="text-xl font-bold">{{ event?.title }}</h2>
            </div>
          </div>
          <div class="p-5">
            <p class="text-slate-600 mb-6 leading-relaxed">{{ event?.description }}</p>
            <div class="space-y-3">
              <button
                v-for="(option, index) in event?.options"
                :key="index"
                @click="handleChoose(index)"
                class="w-full p-4 text-left rounded-xl border-2 border-orange-100 hover:border-orange-400 hover:bg-orange-50 transition-all group"
              >
                <div class="font-semibold text-slate-700 group-hover:text-orange-600">
                  {{ option.label }}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
