<script lang="ts" setup>
import { computed } from 'vue'
import { useAuthStore } from '@modules/auth.module'
import Patient from './widgets/Patient-v2.vue'

const authStore = useAuthStore()
const isPatient = computed(() => authStore.musHaveRole('Patient') || authStore.user === null)
console.log('isPatient', isPatient)
</script>

<template>
  <div v-if="isPatient">
    <Patient />
  </div>
  <div v-else>Hello</div>
</template>
