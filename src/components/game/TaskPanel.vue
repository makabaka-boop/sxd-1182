<script setup lang="ts">
import { computed } from 'vue'
import type { TaskTarget, TaskProgress, TaskType } from '@/types'

const props = defineProps<{
  tasks: TaskTarget[]
  taskProgress: TaskProgress[]
}>()

const getProgressForTask = (taskId: string) => {
  return props.taskProgress.find(tp => tp.taskId === taskId)
}

const formatValue = (task: TaskTarget, value: number): string => {
  switch (task.type as TaskType) {
    case 'turn_limit':
    case 'urgent_priority':
    case 'anomaly_response':
      return task.higherIsBetter !== false
        ? `${value} / ${task.threshold}`
        : `${value} / ≤${task.threshold}`
    case 'cost_control':
      return `${Math.round(value)} / ≤${task.threshold}`
    case 'no_gap':
    case 'efficiency_target':
      return `${Math.round(value)}% / ≥${task.threshold}%`
    default:
      return `${value} / ${task.threshold}`
  }
}

const computePercentage = (task: TaskTarget, value: number): number => {
  if (task.threshold <= 0) return 0

  switch (task.type as TaskType) {
    case 'turn_limit':
    case 'cost_control':
    case 'anomaly_response':
      return Math.min(100, Math.max(0, ((task.threshold - Math.max(0, value - task.threshold * 0)) / task.threshold) * 100))
    case 'urgent_priority':
      return Math.min(100, Math.max(0, (value / Math.max(1, task.threshold)) * 100))
    case 'no_gap':
    case 'efficiency_target':
      return Math.min(100, Math.max(0, (value / task.threshold) * 100))
    default:
      return Math.min(100, Math.max(0, (value / task.threshold) * 100))
  }
}

const statusLabel = (status: TaskProgress['status']) => {
  switch (status) {
    case 'completed': return '已完成'
    case 'failed': return '未达成'
    case 'in_progress': return '进行中'
    default: return '等待开始'
  }
}

const statusStyles = (status: TaskProgress['status']) => {
  switch (status) {
    case 'completed':
      return 'bg-emerald-50 border-emerald-200 text-emerald-700'
    case 'failed':
      return 'bg-red-50 border-red-200 text-red-600'
    case 'in_progress':
      return 'bg-amber-50 border-amber-200 text-amber-700'
    default:
      return 'bg-slate-50 border-slate-200 text-slate-500'
  }
}

const progressBarStyles = (status: TaskProgress['status']) => {
  switch (status) {
    case 'completed':
      return 'bg-gradient-to-r from-emerald-400 to-emerald-500'
    case 'failed':
      return 'bg-gradient-to-r from-red-400 to-red-500'
    case 'in_progress':
      return 'bg-gradient-to-r from-amber-400 to-orange-500'
    default:
      return 'bg-slate-300'
  }
}

const completedCount = computed(() => {
  return props.taskProgress.filter(tp => tp.status === 'completed').length
})
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-sky-100 p-5">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-semibold text-slate-700 flex items-center gap-2">
        <span class="text-lg">🎯</span>
        关卡任务
      </h3>
      <span class="text-xs font-medium px-2.5 py-1 rounded-full bg-sky-100 text-sky-700">
        {{ completedCount }} / {{ tasks.length }} 完成
      </span>
    </div>

    <div class="space-y-3">
      <div
        v-for="task in tasks"
        :key="task.id"
        class="rounded-xl border p-3 transition-all duration-300"
        :class="statusStyles(getProgressForTask(task.id)?.status ?? 'pending')"
      >
        <div class="flex items-start gap-3">
          <div class="text-2xl shrink-0">{{ task.icon }}</div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2 mb-1">
              <span class="font-semibold text-sm truncate">{{ task.name }}</span>
              <span class="text-xs font-medium shrink-0 px-2 py-0.5 rounded-full bg-white/60">
                {{ statusLabel(getProgressForTask(task.id)?.status ?? 'pending') }}
              </span>
            </div>
            <p class="text-xs opacity-75 mb-2 leading-relaxed">{{ task.description }}</p>

            <div class="flex items-center justify-between mb-1.5">
              <span class="text-xs font-medium">
                {{ formatValue(task, getProgressForTask(task.id)?.currentValue ?? 0) }}
              </span>
              <span class="text-xs" v-if="getProgressForTask(task.id)?.status === 'completed'">
                +{{ task.scoreBonus }} 分
              </span>
            </div>

            <div class="w-full h-2 bg-white/50 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500 ease-out"
                :class="progressBarStyles(getProgressForTask(task.id)?.status ?? 'pending')"
                :style="{ width: `${computePercentage(task, getProgressForTask(task.id)?.currentValue ?? 0)}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
