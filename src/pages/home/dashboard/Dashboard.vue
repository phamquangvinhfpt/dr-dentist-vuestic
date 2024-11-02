<script lang="ts" setup>
import { computed } from 'vue'
import { useAuthStore } from '@modules/auth.module'
import Patient from './widgets/Patient.vue'

const authStore = useAuthStore()
const isPatient = computed(() => authStore.musHaveRole('Patient'))
</script>

<template>
  <div v-if="isPatient">
    <Patient />
  </div>
  <div v-else>
    <Doctor />
  </div>
</template>
