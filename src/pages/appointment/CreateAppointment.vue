<script lang="ts" setup>
import { useAuthStore } from '@/stores/modules/auth.module'
import { computed } from 'vue'
import PatientCreateAppointment from './widgets/PatientCreateAppointment.vue'

const user = useAuthStore()
// const isDoctor = computed(() => user.musHaveRole('Dentist'))
const isPatient = computed(() => user.musHaveRole('Patient'))
</script>
<template>
  <PatientCreateAppointment v-if="isPatient" />
</template>
