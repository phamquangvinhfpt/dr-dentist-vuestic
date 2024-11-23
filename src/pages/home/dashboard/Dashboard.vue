<script lang="ts" setup>
import { computed } from 'vue'
import { useAuthStore } from '@modules/auth.module'
import Patient from './widgets/Patient-v2.vue'
import RevenueUpdates from './charts/RevenueReport.vue'
import YearlyBreakup from './charts/YearlyBreakup.vue'
import MonthlyEarnings from './charts/MonthlyEarnings.vue'
import ServiceReport from './charts/ServiceReport.vue'

const authStore = useAuthStore()
const isPatient = computed(() => authStore.musHaveRole('Patient') || authStore.user === null)
console.log('isPatient', isPatient)
</script>

<template>
  <div v-if="isPatient">
    <Patient />
  </div>
  <div v-else>
    <h1 class="page-title font-bold">Dashboard</h1>
    <section class="flex flex-col gap-4">
      <div class="flex flex-col sm:flex-row gap-4">
        <RevenueUpdates class="w-full sm:w-[70%]" />
        <div class="flex flex-col gap-4 w-full sm:w-[30%]">
          <YearlyBreakup class="h-full" />
          <MonthlyEarnings />
        </div>
      </div>
      <ServiceReport class="w-full" />
    </section>
  </div>
</template>
