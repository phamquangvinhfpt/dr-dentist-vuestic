<template>
  <VaModal
    v-model="isModalOpen"
    hide-default-actions
    :title="$t('prescriptions.prescription')"
    size="large"
    @close="closeModal"
  >
    <div ref="prescriptionContent">
      <VaCard class="prescription-card">
        <VaCardContent>
          <div class="prescription-header">
            <div class="clinic-info">
              <img src="/1.png" alt="DCMS Dental Clinic Logo" class="clinic-logo" />
              <h2 class="clinic-name">DCMS Dental Clinic</h2>
              <p class="clinic-address">01 Y Bih Aleo, Buon Ma Thuot, Dak Lak</p>
              <p class="clinic-contact">Phone: 0942705605 | Email: admin@drdentist.me</p>
            </div>
            <VaDivider />
            <div class="prescription-info">
              <VaRow>
                <VaColumn :xs="12" :sm="6">
                  <p>
                    <strong>{{ t('prescriptions.date') }}:</strong> {{ prescription.createDate }}
                  </p>
                  <p>
                    <strong>{{ t('prescriptions.patient') }}:</strong> {{ prescription.patientName }}
                  </p>
                </VaColumn>
                <VaColumn :xs="12" :sm="6">
                  <p>
                    <strong>{{ t('prescriptions.doctor') }}:</strong> {{ prescription.doctorName }}
                  </p>
                </VaColumn>
              </VaRow>
            </div>
          </div>
          <VaDivider />
          <div class="prescription-items">
            <h3 class="va-h5 mb-3">{{ t('prescriptions.medicine') }}</h3>
            <VaDataTable :items="prescription.items" :columns="columns" striped hoverable />
          </div>
          <VaDivider />
          <div class="prescription-notes mt-4">
            <VaCard>
              <VaCardContent>
                <h4 class="va-h6 mb-2">{{ t('prescriptions.note') }}</h4>
                <p>{{ prescription.notes }}</p>
              </VaCardContent>
            </VaCard>
          </div>
        </VaCardContent>
      </VaCard>
    </div>
    <template #footer>
      <div class="d-flex justify-space-between align-center">
        <VaButton icon="print" color="info" class="mr-3 material-symbols-outlined" @click="printPrescription">
          🖨️ {{ t('prescriptions.print') }}
        </VaButton>
        <VaButton icon="file_download" color="success" class="mr-3" @click="downloadPDF">
          {{ t('prescriptions.downloadPDF') }}
        </VaButton>
        <VaButton @click="closeModal">{{ t('common.close') }}</VaButton>
      </div>
    </template>
  </VaModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { VaModal, VaCard, VaCardContent, VaDivider, VaButton } from 'vuestic-ui'
import { useI18n } from 'vue-i18n'
import html2pdf from 'html2pdf.js'

const { t } = useI18n()

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  prescriptionData: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:isOpen'])
const prescriptionContent = ref(null)
const prescription = ref(props.prescriptionData)

const columns = computed(() => [
  {
    key: 'medicineName',
    sortable: true,
    title: t('prescriptions.medicine'),
    label: t('prescriptions.medicine'),
  },
  { key: 'dosage', sortable: true, title: t('prescriptions.dosage'), label: t('prescriptions.dosage') },
  { key: 'frequency', sortable: true, title: t('prescriptions.frequency'), label: t('prescriptions.frequency') },
])

watch(
  () => props.prescriptionData,
  (newValue) => {
    prescription.value = newValue
  },
)

const isModalOpen = computed({
  get: () => props.isOpen,
  set: (value) => emit('update:isOpen', value),
})

const closeModal = () => {
  isModalOpen.value = false
}

const printStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    #printSection, #printSection * {
      visibility: visible;
    }
    #printSection {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
    }
    .prescription-card {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      box-shadow: none !important;
    }
    .clinic-info {
      text-align: center;
      margin-bottom: 1rem;
    }
    .clinic-logo {
      width: 100px;
      height: auto;
      margin-bottom: 0.5rem;
    }
    .va-modal__actions {
      display: none !important;
    }
    .va-card {
      box-shadow: none !important;
    }
  }
`

const printPrescription = () => {
  // Create print styles
  const style = document.createElement('style')
  style.type = 'text/css'
  style.innerHTML = printStyles
  document.head.appendChild(style)

  // Create print section
  const printSection = document.createElement('div')
  printSection.id = 'printSection'
  printSection.innerHTML = prescriptionContent.value.innerHTML
  document.body.appendChild(printSection)

  window.print()

  // Cleanup
  document.head.removeChild(style)
  document.body.removeChild(printSection)
}

const downloadPDF = async () => {
  const element = prescriptionContent.value
  const options = {
    margin: 10,
    filename: `prescription_${prescription.value.createDate}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      logging: false,
      useCORS: true,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
    },
  }

  try {
    const pdf = await html2pdf().set(options).from(element).save()
    return pdf
  } catch (error) {
    console.error('Error generating PDF:', error)
  }
}
</script>

<style scoped>
.prescription-card {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.clinic-info {
  text-align: center;
  margin-bottom: 1rem;
}

.clinic-logo {
  width: 100px;
  height: auto;
  margin-bottom: 0.5rem;
  align-items: center;
}

.clinic-name {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.clinic-address,
.clinic-contact {
  font-size: 0.9rem;
  color: var(--va-text-secondary);
}

.prescription-header {
  margin-bottom: 1rem;
}

.prescription-info {
  margin-top: 1rem;
}

.prescription-info p {
  margin-bottom: 0.5rem;
}

.prescription-items {
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.prescription-notes {
  margin-top: 1rem;
}
</style>
