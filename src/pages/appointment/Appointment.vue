<script lang="ts" setup>
import { useAuthStore } from '@/stores/modules/auth.module'
import { computed } from 'vue'
import Patient from './Patient.vue'
import Doctor from './Doctor.vue'

const user = useAuthStore()
const isDoctor = computed(() => user.musHaveRole('Dentist'))
const isPatient = computed(() => user.musHaveRole('Patient'))
</script>
<template>
  <Patient v-if="isPatient" />
  <Doctor v-if="isDoctor" />
</template>
