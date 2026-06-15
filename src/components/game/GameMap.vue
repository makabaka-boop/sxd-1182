<script setup lang="ts">
import { computed } from 'vue'
import type { SupplyPoint, Route, RouteStep } from '@/types'

const props = defineProps<{
  points: SupplyPoint[]
  routes: Route[]
  plannedRoute: RouteStep[]
  executedSteps: RouteStep[]
  animatingPointId: string | null
  totalTraveledDistance: number
}>()

const emit = defineEmits<{
  (e: 'pointClick', pointId: string): void
}>()

const allPoints = computed(() => {
  const warehouse = props.points.find(p => p.id === 'warehouse')
  const others = props.points.filter(p => p.id !== 'warehouse')
  return { warehouse, others }
})

const getPointById = (id: string): SupplyPoint | undefined => {
  return props.points.find(p => p.id === id)
}

const priorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    urgent: '#ef4444',
    high: '#f97316',
    normal: '#3b82f6',
    low: '#6b7280'
  }
  return colors[priority] || '#3b82f6'
}

const statusRingColor = (status: string): string => {
  const colors: Record<string, string> = {
    anomaly: '#dc2626',
    boost: '#f59e0b',
    blocked: '#6b7280',
    normal: 'transparent'
  }
  return colors[status] || 'transparent'
}

const plannedRoutePoints = computed(() => {
  const result: SupplyPoint[] = []
  const warehouse = getPointById('warehouse')
  if (warehouse && props.plannedRoute.length > 0) {
    result.push(warehouse)
  }
  for (const step of props.plannedRoute) {
    const point = getPointById(step.pointId)
    if (point) result.push(point)
  }
  return result
})

const executedRoutePoints = computed(() => {
  const result: SupplyPoint[] = []
  const warehouse = getPointById('warehouse')
  if (warehouse && props.executedSteps.length > 0) {
    result.push(warehouse)
  }
  for (const step of props.executedSteps) {
    const point = getPointById(step.pointId)
    if (point) result.push(point)
  }
  return result
})

const handlePointClick = (point: SupplyPoint) => {
  if (point.id !== 'warehouse') {
    emit('pointClick', point.id)
  }
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-sky-100 p-4">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-lg font-bold flex items-center gap-2 text-slate-700">
        <span class="text-2xl">🗺️</span>
        补货地图
      </h3>
      <div class="text-xs text-slate-500">
        已行驶 <span class="font-semibold text-sky-600">{{ Math.round(totalTraveledDistance) }}</span> 距离
      </div>
    </div>
    <svg viewBox="0 0 800 500" class="w-full h-auto bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl">
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#2563eb" />
        </marker>
        <marker id="arrowhead-executed" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
        </marker>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g>
        <line
          v-for="route in routes"
          :key="route.id"
          :x1="getPointById(route.from)?.position.x"
          :y1="getPointById(route.from)?.position.y"
          :x2="getPointById(route.to)?.position.x"
          :y2="getPointById(route.to)?.position.y"
          :stroke="route.blocked ? '#ef4444' : '#cbd5e1'"
          stroke-width="2"
          :stroke-dasharray="route.blocked ? '4,4' : '6,4'"
          :opacity="route.blocked ? 0.7 : 0.5"
        />
        <g v-for="route in routes.filter(r => r.blocked)" :key="'block-' + route.id">
          <circle
            :cx="(getPointById(route.from)?.position.x! + getPointById(route.to)?.position.x!) / 2"
            :cy="(getPointById(route.from)?.position.y! + getPointById(route.to)?.position.y!) / 2"
            r="10"
            fill="#ef4444"
            opacity="0.9"
          />
          <text
            :x="(getPointById(route.from)?.position.x! + getPointById(route.to)?.position.x!) / 2"
            :y="(getPointById(route.from)?.position.y! + getPointById(route.to)?.position.y!) / 2 + 4"
            text-anchor="middle"
            font-size="12"
            fill="white"
            font-weight="bold"
          >🚧</text>
        </g>
      </g>

      <g>
        <line
          v-for="(point, idx) in executedRoutePoints.slice(0, -1)"
          :key="'executed-' + idx"
          :x1="point.position.x"
          :y1="point.position.y"
          :x2="executedRoutePoints[idx + 1]?.position.x"
          :y2="executedRoutePoints[idx + 1]?.position.y"
          stroke="#10b981"
          stroke-width="3"
          stroke-dasharray="none"
          opacity="0.6"
        />
      </g>

      <g>
        <line
          v-for="(point, idx) in plannedRoutePoints.slice(0, -1)"
          :key="'planned-' + idx"
          :x1="point.position.x"
          :y1="point.position.y"
          :x2="plannedRoutePoints[idx + 1]?.position.x"
          :y2="plannedRoutePoints[idx + 1]?.position.y"
          stroke="#2563eb"
          stroke-width="3"
          marker-end="url(#arrowhead)"
          filter="url(#glow)"
          class="transition-all duration-300"
        />
      </g>

      <g
        v-for="point in points"
        :key="point.id"
        class="cursor-pointer"
        @click="handlePointClick(point)"
      >
        <circle
          v-if="point.status === 'anomaly'"
          :cx="point.position.x"
          :cy="point.position.y"
          r="32"
          fill="none"
          stroke="#dc2626"
          stroke-width="3"
          stroke-dasharray="6,3"
          class="animate-spin"
          style="transform-origin: center; animation-duration: 8s"
        />
        <circle
          v-if="point.status === 'boost'"
          :cx="point.position.x"
          :cy="point.position.y"
          r="30"
          fill="none"
          stroke="#f59e0b"
          stroke-width="3"
          class="animate-pulse"
        />

        <circle
          v-if="animatingPointId === point.id"
          :cx="point.position.x"
          :cy="point.position.y"
          r="35"
          fill="none"
          :stroke="point.id === 'warehouse' ? '#3b82f6' : priorityColor(point.priority)"
          stroke-width="2"
          class="animate-ping"
        />
        <circle
          v-if="animatingPointId === point.id"
          :cx="point.position.x"
          :cy="point.position.y"
          r="28"
          fill="none"
          :stroke="point.id === 'warehouse' ? '#3b82f6' : priorityColor(point.priority)"
          stroke-width="2"
          opacity="0.6"
          class="animate-ping"
          style="animation-delay: 0.2s"
        />

        <circle
          :cx="point.position.x"
          :cy="point.position.y"
          :r="point.status === 'anomaly' ? 26 : 24"
          :fill="point.id === 'warehouse' ? '#3b82f6' : priorityColor(point.priority)"
          class="transition-all duration-200 hover:scale-110"
          stroke="white"
          :stroke-width="point.status === 'anomaly' || point.status === 'boost' ? 4 : 3"
          :opacity="point.status === 'blocked' ? 0.5 : 1"
        />

        <text
          :x="point.position.x"
          :y="point.position.y + 6"
          text-anchor="middle"
          font-size="20"
          class="pointer-events-none select-none"
        >{{ point.emoji }}</text>

        <text
          :x="point.position.x"
          :y="point.position.y + 44"
          text-anchor="middle"
          font-size="12"
          font-weight="600"
          fill="#334155"
          class="pointer-events-none select-none"
        >{{ point.name }}</text>

        <g v-if="point.id !== 'warehouse'">
          <rect
            :x="point.position.x - 22"
            :y="point.position.y + 50"
            width="44"
            height="6"
            rx="3"
            fill="#e2e8f0"
          />
          <rect
            :x="point.position.x - 22"
            :y="point.position.y + 50"
            :width="point.demand > 0 ? Math.min((point.delivered / point.demand) * 44, 44) : 0"
            height="6"
            rx="3"
            :fill="point.delivered >= point.demand ? '#10b981' : '#3b82f6'"
          />
        </g>

        <text
          v-if="point.status === 'anomaly'"
          :x="point.position.x"
          :y="point.position.y - 30"
          text-anchor="middle"
          font-size="18"
          class="animate-bounce pointer-events-none"
        >⚠️</text>
        <text
          v-else-if="point.status === 'boost'"
          :x="point.position.x"
          :y="point.position.y - 28"
          text-anchor="middle"
          font-size="16"
          class="animate-pulse pointer-events-none"
        >⚡</text>
      </g>

      <g>
        <rect x="580" y="20" width="190" height="80" rx="8" fill="white" opacity="0.9" />
        <text x="595" y="42" font-size="12" font-weight="600" fill="#475569">图例</text>
        <line x1="595" y1="55" x2="635" y2="55" stroke="#10b981" stroke-width="3" />
        <text x="645" y="59" font-size="11" fill="#64748b">已完成路线</text>
        <line x1="595" y1="75" x2="635" y2="75" stroke="#2563eb" stroke-width="3" />
        <text x="645" y="79" font-size="11" fill="#64748b">规划路线</text>
        <line x1="595" y1="92" x2="635" y2="92" stroke="#ef4444" stroke-width="2" stroke-dasharray="4,4" />
        <text x="645" y="96" font-size="11" fill="#64748b">封路通道</text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
@keyframes ping {
  75%, 100% {
    transform: scale(1.5);
    opacity: 0;
  }
}
.animate-ping {
  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
  transform-origin: center;
}
</style>
