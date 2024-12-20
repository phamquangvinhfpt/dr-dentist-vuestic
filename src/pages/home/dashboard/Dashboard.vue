<script lang="ts" setup>
import { computed } from 'vue'
import { useAuthStore } from '@modules/auth.module'
import Patient from './widgets/Patient-v2.vue'
import RevenueUpdates from './charts/RevenueReport.vue'
import YearlyBreakup from './charts/YearlyBreakup.vue'
import MonthlyEarnings from './charts/MonthlyEarnings.vue'
import ServiceReport from './charts/ServiceReport.vue'
import DataSection from './DataSection.vue'
import DoctorRateTable from './charts/DoctorRateTable.vue'
import BookingAna from './charts/BookingAna.vue'
import DashboardStaff from './DashboardStaff.vue'
import Appointment from '@/pages/appointment/Appointment.vue'

const authStore = useAuthStore()
const isPatient = computed(() => authStore.musHaveRole('Patient') || authStore.user === null)
const isDoctor = computed(() => authStore.musHaveRole('Dentist'))
const isStaff = computed(() => authStore.musHaveRole('Staff'))
</script>

<template>
  <div v-if="isPatient">
    <Patient />
  </div>
  <div v-else-if="isStaff">
    <DashboardStaff />
  </div>
  <div v-else-if="isDoctor">
    <Appointment />
  </div>
  <div v-else class="mx-3">
    <section class="flex flex-col gap-4">
      <div class="flex flex-col sm:flex-row gap-4">
        <RevenueUpdates class="w-full sm:w-[70%]" />
        <div class="flex flex-col gap-4 w-full sm:w-[30%]">
          <YearlyBreakup class="h-full" />
          <MonthlyEarnings />
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-6 gap-4">
        <DataSection class="col-span-2" />
        <BookingAna class="col-span-2" />
        <DoctorRateTable class="col-span-2" />
      </div>
      <ServiceReport class="w-full" />
    </section>
  </div>
</template>
