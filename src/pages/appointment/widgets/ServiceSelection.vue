<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

defineProps<{
  services: any[]
  selectedService: any | null
}>()

const emit = defineEmits(['update:selectedService'])

const formatPrice = (price: any) => {
  return new Intl.NumberFormat('vi-VN').format(price)
}
</script>

<template>
  <div>
    <p class="text-xl font-bold text-blue-900 dark:text-blue-100 mb-4">Select a service</p>
    <div class="h-[325px] overflow-y-auto pr-4 scroll">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="service in services" :key="service.id" class="relative">
          <input
            :id="`service_${service.id}`"
            :value="service"
            type="radio"
            name="service"
            class="peer sr-only"
            :checked="selectedService === service"
            @change="emit('update:selectedService', service)"
          />
          <label
            :for="`service_${service.id}`"
            class="relative flex h-full cursor-pointer flex-col rounded-lg p-4 shadow-slate-100 peer-checked:bg-emerald-600 peer-checked:text-white dark:bg-gray-700 dark:peer-checked:bg-emerald-700"
          >
            <div class="flex items-start gap-2 min-h-[50px] relative">
              <span class="font-medium text-base break-words pr-8">{{ service.serviceName }}</span>
              <div
                class="absolute right-0 top-1 flex-shrink-0 box-content block h-3 w-3 rounded-full border-8 border-emerald-400 bg-emerald-600 mt-0"
                :class="{
                  'border-emerald-400 bg-emerald-600': selectedService === service,
                  'border-gray-300 bg-white dark:border-gray-600': selectedService !== service,
                }"
              ></div>
            </div>
            <span class="text-sm mb-3">{{ service.serviceDescription }}</span>
            <span class="absolute bottom-0 left-4 text-lg font-bold">{{ formatPrice(service.totalPrice) }} VND</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>
