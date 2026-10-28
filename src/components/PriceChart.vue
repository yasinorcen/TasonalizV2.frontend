<script setup lang="ts">
import { computed, ref } from 'vue'
import type { PriceHistoryPoint } from '@/types/api'
import { formatCurrency } from '@/utils/formatters'

const props = defineProps<{
  points: PriceHistoryPoint[]
  currency?: string
  selectedPeriod: string
}>()

const emit = defineEmits<{
  (e: 'changePeriod', period: string): void
}>()

const hoveredIndex = ref<number | null>(null)

const periods = [
  { id: '1mo', label: '1 Ay' },
  { id: '3mo', label: '3 Ay' },
  { id: '6mo', label: '6 Ay' },
  { id: '1y', label: '1 Yıl' },
]

const width = 760
const height = 240
const padX = 20
const padY = 24

const stats = computed(() => {
  if (!props.points.length) {
    return { min: 0, max: 0, first: 0, last: 0, changePct: 0, isPositive: true }
  }
  const closes = props.points.map((p) => p.close)
  const min = Math.min(...closes)
  const max = Math.max(...closes)
  const first = closes[0] ?? 0
  const last = closes[closes.length - 1] ?? 0
  const changePct = first > 0 ? ((last - first) / first) * 100 : 0
  return {
    min,
    max,
    first,
    last,
    changePct,
    isPositive: last >= first,
  }
})

const coordinates = computed(() => {
  const n = props.points.length
  if (n === 0) return []
  const { min, max } = stats.value
  const range = max - min > 0 ? max - min : 1
  const usableW = width - padX * 2
  const usableH = height - padY * 2

  return props.points.map((pt, idx) => {
    const x = n > 1 ? padX + (idx / (n - 1)) * usableW : width / 2
    const y = padY + usableH - ((pt.close - min) / range) * usableH
    return { x, y, point: pt }
  })
})

const polylinePoints = computed(() =>
  coordinates.value.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ')
)

const areaPath = computed(() => {
  const coords = coordinates.value
  if (coords.length < 2) return ''
  const first = coords[0]!
  const last = coords[coords.length - 1]!
  const line = coords
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(' ')
  return `${line} L ${last.x.toFixed(1)} ${height - padY} L ${first.x.toFixed(1)} ${height - padY} Z`
})

const activeDatum = computed(() => {
  const coords = coordinates.value
  if (!coords.length) return null
  if (hoveredIndex.value !== null && coords[hoveredIndex.value]) {
    return coords[hoveredIndex.value]
  }
  return coords[coords.length - 1]
})
</script>

<template>
  <div class="chart-card card">
    <div class="chart-header">
      <div>
        <h3 class="chart-title">Gecikmeli Gün Sonu Fiyat Grafiği</h3>
        <p v-if="activeDatum" class="chart-sub">
          Tarih: <strong>{{ activeDatum.point.date }}</strong> · Kapanış:
          <strong>{{ formatCurrency(activeDatum.point.close, currency || 'TRY') }}</strong>
          <span
            v-if="points.length > 1"
            class="badge"
            :class="stats.isPositive ? 'badge-positive' : 'badge-negative'"
            style="margin-inline-start: 0.5rem"
          >
            Dönem Değişimi: {{ stats.changePct >= 0 ? '+' : '' }}{{ stats.changePct.toFixed(2) }}%
          </span>
        </p>
      </div>

      <div class="period-group" role="group" aria-label="Grafik dönemi seçimi">
        <button
          v-for="p in periods"
          :key="p.id"
          type="button"
          class="btn btn-sm"
          :class="{ 'btn-primary': selectedPeriod === p.id }"
          @click="emit('changePeriod', p.id)"
        >
          {{ p.label }}
        </button>
      </div>
    </div>

    <div v-if="points.length >= 2" class="svg-container">
      <svg
        :viewBox="`0 0 ${width} ${height}`"
        class="price-svg"
        role="img"
        aria-label="Hisse senedi geçmiş kapanış fiyat grafiği"
        @mouseleave="hoveredIndex = null"
      >
        <path
          :d="areaPath"
          :fill="
            stats.isPositive
              ? 'rgba(19, 115, 51, 0.14)'
              : 'rgba(197, 34, 31, 0.14)'
          "
        />
        <polyline
          fill="none"
          :stroke="stats.isPositive ? 'var(--positive-text)' : 'var(--negative-text)'"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          :points="polylinePoints"
        />
        <circle
          v-if="activeDatum"
          :cx="activeDatum.x"
          :cy="activeDatum.y"
          r="5"
          :fill="stats.isPositive ? 'var(--positive-text)' : 'var(--negative-text)'"
        />
        <rect
          v-for="(c, idx) in coordinates"
          :key="c.point.date"
          :x="c.x - width / coordinates.length / 2"
          y="0"
          :width="width / coordinates.length"
          :height="height"
          fill="transparent"
          @mouseenter="hoveredIndex = idx"
        />
      </svg>
      <div class="chart-bounds">
        <span>Dönem En Düşük: {{ formatCurrency(stats.min, currency || 'TRY') }}</span>
        <span>Dönem En Yüksek: {{ formatCurrency(stats.max, currency || 'TRY') }}</span>
      </div>
    </div>

    <div v-else class="state-box">
      Bu dönem için yeterli tarihsel kapanış verisi bulunamadı.
    </div>
  </div>
</template>

<style scoped>
.chart-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-block-end: 0.85rem;
}

.chart-title {
  margin: 0 0 0.25rem 0;
  font-size: 1.05rem;
}

.chart-sub {
  margin: 0;
  font-size: 0.88rem;
  color: var(--text-secondary);
}

.period-group {
  display: flex;
  gap: 0.35rem;
}

.svg-container {
  width: 100%;
  aspect-ratio: 760 / 260;
}

.price-svg {
  width: 100%;
  height: auto;
  display: block;
  border-radius: var(--radius-sm);
  background: var(--bg-surface-alt);
}

.chart-bounds {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-block-start: 0.45rem;
}
</style>
