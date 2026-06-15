<script setup lang="ts">
import { computed } from 'vue'
import type { SupplyPoint, Route, RouteStep } from '@/types'

const props = defineProps<{
  points: SupplyPoint[]
  routes: Route[]
  plannedRoute: RouteStep[]
  animatingPointId: string | null
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

const plannedRoutePoints = computed(() => {
  return props.plannedRoute.map(step => getPointById(step.pointId)).filter(Boolean) as SupplyPoint[]
})

const handlePointClick = (point: SupplyPoint) => {
  if (point.id !== 'warehouse') {
    emit('pointClick', point.id)
  }
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-lg p-4">
    <h3 class="text-lg font-bold mb-3 flex items-center gap-2 text-slate-700">
      <span class="text-2xl">🗺️</span>
      补货地图
    </h3>
    <svg viewBox="0 0 800 500" class="w-full h-auto bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl">
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#2563eb" />
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
          stroke-dasharray="6,4"
        />
        <g v-for="route in routes.filter(r => r.blocked)" :key="'block-' + route.id">
          <line
            :x1="(getPointById(route.from)?.position.x! + getPointById(route.to)?.position.x!) / 2 - 8"
            :y1="(getPointById(route.from)?.position.y! + getPointById(route.to)?.position.y!) / 2 - 8"
            :x2="(getPointById(route.from)?.position.x! + getPointById(route.to)?.position.x!) / 2 + 8"
            :y2="(getPointById(route.from)?.position.y! + getPointById(route.to)?.position.y!) / 2 + 8"
            stroke="#ef4444"
            stroke-width="3"
          />
          <line
            :x1="(getPointById(route.from)?.position.x! + getPointById(route.to)?.position.x!) / 2 + 8"
            :y1="(getPointById(route.from)?.position.y! + getPointById(route.to)?.position.y!) / 2 - 8"
            :x2="(getPointById(route.from)?.position.x! + getPointById(route.to)?.position.x!) / 2 - 8"
            :y2="(getPointById(route.from)?.position.y! + getPointById(route.to)?.position.y!) / 2 + 8"
            stroke="#ef4444"
            stroke-width="3"
          />
        </g>
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
        />
      </g>

      <g
        v-for="point in points"
        :key="point.id"
        class="cursor-pointer"
        @click="handlePointClick(point)"
      >
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
          r="24"
          :fill="point.id === 'warehouse' ? '#3b82f6' : priorityColor(point.priority)"
          class="transition-transform duration-200 hover:scale-110"
          stroke="white"
          stroke-width="3"
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
        <rect
          v-if="point.id !== 'warehouse'"
          :x="point.position.x - 22"
          :y="point.position.y + 50"
          width="44"
          height="6"
          rx="3"
          fill="#e2e8f0"
        />
        <rect
          v-if="point.id !== 'warehouse'"
          :x="point.position.x - 22"
          :y="point.position.y + 50"
          :width="point.demand > 0 ? Math.min((point.delivered / point.demand) * 44, 44) : 0"
          height="6"
          rx="3"
          :fill="point.delivered >= point.demand ? '#10b981' : '#3b82f6'"
        />
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
