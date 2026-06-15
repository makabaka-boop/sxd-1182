<script setup lang="ts">
import { watch } from 'vue'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const handleOverlayClick = (e: MouseEvent) => {
  if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
    emit('close')
  }
}

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
      class="modal-overlay fixed inset-0 bg-blue-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click="handleOverlayClick"
    >
      <Transition name="scale">
        <div
          v-if="visible"
          class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-blue-100"
        >
          <div class="bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-5">
            <h2 class="text-2xl font-bold text-white text-center">🎮 游戏教程</h2>
          </div>

          <div class="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
            <div class="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <h3 class="font-semibold text-blue-800 mb-2">📌 游戏玩法</h3>
              <p class="text-gray-700 text-sm leading-relaxed">
                你是冷饮物流调度员，需要根据库存、路程消耗和随机事件规划最优补货路线
              </p>
            </div>

            <div>
              <h3 class="font-semibold text-blue-800 mb-3">🎯 操作说明</h3>
              <ol class="space-y-2.5 text-sm text-gray-700">
                <li class="flex items-start gap-3">
                  <span class="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">1</span>
                  <span>点击补货点可添加到路线队列</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">2</span>
                  <span>拖拽队列中的步骤可调整顺序</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">3</span>
                  <span>点击"执行补货"按顺序完成补货</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">4</span>
                  <span>应对随机事件做出正确决策</span>
                </li>
              </ol>
            </div>

            <div>
              <h3 class="font-semibold text-blue-800 mb-3">⭐ 评分维度</h3>
              <div class="grid grid-cols-2 gap-2 text-xs">
                <div class="bg-cyan-50 rounded-lg px-3 py-2 text-cyan-800 font-medium">缺口处理效率</div>
                <div class="bg-cyan-50 rounded-lg px-3 py-2 text-cyan-800 font-medium">路线冗余度</div>
                <div class="bg-cyan-50 rounded-lg px-3 py-2 text-cyan-800 font-medium">异常响应速度</div>
                <div class="bg-cyan-50 rounded-lg px-3 py-2 text-cyan-800 font-medium">剩余库存</div>
              </div>
            </div>
          </div>

          <div class="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <button
              class="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-500 transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
              @click="emit('close')"
            >
              知道了
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
