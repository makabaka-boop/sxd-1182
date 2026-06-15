<script setup lang="ts">
import { watch } from 'vue'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'resume'): void
  (e: 'restart'): void
  (e: 'quit'): void
}>()

watch(() => props.visible, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 bg-blue-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <Transition name="scale">
        <div
          v-if="visible"
          class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-blue-100"
        >
          <div class="bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-6">
            <h2 class="text-2xl font-bold text-white text-center">⏸️ 游戏暂停</h2>
          </div>

          <div class="p-6 space-y-3">
            <button
              class="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-500 transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
              @click="emit('resume')"
            >
              继续游戏
            </button>
            <button
              class="w-full py-3 bg-white text-blue-600 font-semibold rounded-xl border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 active:scale-[0.98]"
              @click="emit('restart')"
            >
              重新开始
            </button>
            <button
              class="w-full py-3 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200 active:scale-[0.98]"
              @click="emit('quit')"
            >
              返回主菜单
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.25s ease;
}
.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
