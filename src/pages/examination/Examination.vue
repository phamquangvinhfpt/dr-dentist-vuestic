<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useToast, VaTabs } from 'vuestic-ui'
import MedicalRecord from './widgets/MedicalRecord.vue'
import { useRoute } from 'vue-router'
import { Appointment, AppointmentStatus } from '../appointment/types'
import { useAppointmentStore } from '@/stores/modules/appointment.module'
import Treatment from './widgets/Treatment.vue'
import { getErrorMessage } from '@/services/utils'

const router = useRoute()
const loading = ref(false)
const storeAppointment = useAppointmentStore()
const appointmentId = router.params.id as string
const appointmentStatus = ref<AppointmentStatus>()
const patientid = ref('')
const appointment = ref<Appointment>()
const { init } = useToast()

const getAppointmentDetails = async () => {
  loading.value = true
  await storeAppointment
    .getAppointmentById(appointmentId)
    .then((response) => {
      appointment.value = response
      patientid.value = response.patientUserID
      appointmentStatus.value = response.status
    })
    .catch((error) => {
      const errorMessage = getErrorMessage(error)
      init({
        message: errorMessage,
        color: 'error',
        title: 'Error',
      })
    })
    .finally(() => {
      loading.value = false
    })
}
const tabs = [
  {
    id: 1,
    name: 'Record',
    icon: 'medical_services',
  },
  {
    id: 2,
    name: 'Examination',
    icon: 'assignment',
  },
]
const selectedTab = ref(0)
const selectSettingOption = (tab: any) => {
  selectedTab.value = tab.id
}

onMounted(() => {
  getAppointmentDetails()
  selectSettingOption(tabs[0])
})
</script>
<template>
  <VaTabs v-if="appointmentStatus != 5" v-model="selectedTab">
    <template #tabs>
      <VaTab v-for="tab in tabs" :key="tab.id" :name="tab.id" @click="selectSettingOption(tab)">
        <VaIcon :name="tab.icon" class="mr-2" />
        {{ tab.name }}
      </VaTab>
    </template>
  </VaTabs>
  <div v-else>
    <p class="text-center text-2xl">Medical Record:</p>
  </div>
  <MedicalRecord v-if="selectedTab === 1 && !loading" v-model:patientId="patientid" />
  <Treatment v-if="selectedTab === 2" :appointment="appointment" />
</template>
