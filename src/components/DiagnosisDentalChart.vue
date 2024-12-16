<template>
  <div class="dental-chart-container">
    <DentalChart />

    <div v-show="showTooltip" class="tooltip" :style="tooltipStyle">{{ tooltipContent }}</div>

    <div class="chart-legend">
      <div class="legend-item">
        <div class="color-box affected"></div>
        <span>Affected Teeth</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import DentalChart from '@/pages/examination/widgets/DentalChart.vue'

const showTooltip = ref(false)
const tooltipContent = ref('')
const tooltipStyle = ref({
  left: '0px',
  top: '0px',
})

interface Props {
  diagnosis: Array<{
    toothNumber: number
    teethConditions: string[]
  }>
}

const props = defineProps<Props>()

const handleMouseEnter = (event: MouseEvent, content: string) => {
  const target = event.target as HTMLElement
  const rect = target.getBoundingClientRect()
  const containerRect = document.querySelector('.dental-chart-container')?.getBoundingClientRect()

  if (containerRect) {
    tooltipStyle.value = {
      left: `${rect.left - containerRect.left + rect.width / 2}px`,
      top: `${rect.top - containerRect.top - 10}px`,
    }
  }

  tooltipContent.value = content
  showTooltip.value = true
}

const handleMouseLeave = () => {
  showTooltip.value = false
}

const highlightAffectedTeeth = () => {
  // Reset all teeth first
  document.querySelectorAll('[class*="tooth-"]').forEach((tooth) => {
    const element = tooth as HTMLElement
    element.style.fill = 'none'
    element.style.opacity = '1'
  })

  // Highlight affected teeth
  props.diagnosis.forEach((diag) => {
    const toothElements = document.querySelectorAll(`.tooth-${diag.toothNumber}, .tooth-${diag.toothNumber}-parent`)
    const tooltipContent = `${diag.teethConditions.join(', ')}`

    toothElements.forEach((tooth) => {
      const element = tooth as HTMLElement
      element.style.fill = '#6366f1'
      element.style.opacity = '0.7'

      element.addEventListener('mouseenter', (e) => {
        handleMouseEnter(e, tooltipContent)
        toothElements.forEach((t) => {
          ;(t as HTMLElement).style.opacity = '0.9'
        })
      })

      element.addEventListener('mouseleave', () => {
        handleMouseLeave()
        toothElements.forEach((t) => {
          ;(t as HTMLElement).style.opacity = '0.7'
        })
      })
    })
  })
}

watch(
  () => props.diagnosis,
  () => {
    highlightAffectedTeeth()
  },
  { deep: true },
)

onMounted(() => {
  highlightAffectedTeeth()
})
</script>

<style scoped>
.dental-chart-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.chart-legend {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.color-box {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.color-box.affected {
  background: #6366f1;
  opacity: 0.7;
}

/* Tooltip styles */
[data-tooltip] {
  position: relative;
  cursor: pointer;
}

[data-tooltip]:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 8px;
  font-size: 0.875rem;
  white-space: nowrap;
  z-index: 10;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  min-width: max-content;
}

/* Tooltip animation */
[data-tooltip]:hover::after {
  animation: tooltipFadeIn 0.2s ease-in-out;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, 10px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

/* Hover effect */
[class^='tooth-'] {
  transition: all 0.3s ease;
}

[class^='tooth-']:hover {
  opacity: 0.9;
}

/* Override DentalChart styles if needed */
:deep(.dental-chart) {
  width: 100%;
  max-width: 500px;
  height: auto;
}

/* Style mới cho tooltip */
.tooltip {
  position: absolute;
  transform: translateX(-50%) translateY(-100%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  pointer-events: none;
  white-space: nowrap;
  z-index: 1000;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  animation: tooltipFadeIn 0.2s ease-in-out;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-90%);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(-100%);
  }
}
</style>
