<template>
  <VaCard>
    <VaCardContent>
      <section>
        <header class="flex items-center justify-between">
          <div class="text-lg font-semibold grow">{{ value }}</div>
          <div
            class="p-1 rounded"
            :style="{
              backgroundColor: iconBackground,
              color: iconColor,
            }"
          >
            <slot name="icon"></slot>
          </div>
        </header>
        <div>
          <p class="mb-2">{{ title }}</p>
          <p class="text-xs text-secondary">
            <span :class="changeClass">
              <template v-if="up !== undefined">
                <template v-if="up">↑</template>
                <template v-else>↓</template>
              </template>
              {{ changeText }}
            </span>
            {{ since }}
          </p>
        </div>
      </section>
    </VaCardContent>
  </VaCard>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { VaCard } from 'vuestic-ui'

const props = withDefaults(
  defineProps<{
    title: string
    value: string | number
    changeText?: string
    up?: boolean | undefined
    iconBackground: string
    iconColor: string
    since?: string
  }>(),
  {
    up: undefined,
    changeText: '',
    since: '',
  },
)

const changeClass = computed(() => {
  if (props.up === undefined) return {}
  return {
    'text-success': props.up,
    'text-red-600': !props.up,
  }
})
</script>
