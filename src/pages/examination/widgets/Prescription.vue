<template>
  <div>
    <VaButton
      preset="primary"
      class="mr-6 mb-2"
      round
      border-color="primary"
      size="small"
      @click="doShowPrescriptionFormModal = true"
    >
      {{ $t('prescriptions.prescription') }}
    </VaButton>
  </div>
  <VaModal
    v-slot="{ cancel, ok }"
    v-model="doShowPrescriptionFormModal"
    size="large"
    stateful
    close-button
    mobile-fullscreen
    hide-default-actions
    @close="doShowPrescriptionFormModal = false"
  >
    <VaModalHeader>
      <h3 class="text-lg font-bold">{{ $t('settings.create') }} {{ $t('prescriptions.prescription') }}</h3>
    </VaModalHeader>
    <PrescriptionForm
      ref="editFormRef"
      :prescription="prescriptionToEdit"
      :save-button-label="$t('settings.add')"
      @close="cancel"
      @save="
        (prescription: Prescription) => {
          onPrescriptionSaved(prescription)
          ok()
        }
      "
    />
  </VaModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'vuestic-ui'
import { getErrorMessage, notifications } from '@/services/utils'
import { Prescription, TreatmentPlanResponse } from '../types'
import { usePrescriptionStore } from '@/stores/modules/prescription.module'
import PrescriptionForm from './PrescriptionForm.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const editFormRef = ref()
const { init: notify } = useToast()

const doShowPrescriptionFormModal = ref(false)
const prescriptionToEdit = ref<Prescription | null>(null)
const prescriptionStore = usePrescriptionStore()

const props = defineProps<{
  items: TreatmentPlanResponse
}>()

// emit
const emit = defineEmits(['update:refresh'])

const onPrescriptionSaved = async (prescription: Prescription) => {
  doShowPrescriptionFormModal.value = false
  prescription.treatmentID = props.items.treatmentPlanID
  prescriptionStore
    .createPrescription(prescription)
    .then(() => {
      notify({
        message: notifications.createSuccessfully(t('prescriptions.prescription')),
        color: 'success',
      })
      emit('update:refresh', true)
    })
    .catch((error) => {
      notify({
        message: notifications.createFailed(t('prescriptions.prescription')) + getErrorMessage(error),
        color: 'danger',
      })
    })
}
</script>
