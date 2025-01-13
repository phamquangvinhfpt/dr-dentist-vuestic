<template>
  <VaCard>
    <VaCardTitle>
      <div class="flex items-center gap-4">
        <VaButton
          class="back-btn"
          icon="arrow_back"
          color="primary"
          size="small"
          @click="$router.push('/service-management')"
        />
        <span class="text-2xl font-bold">{{ t('service.serviceDetails') }}</span>
      </div>
    </VaCardTitle>
    <VaCardContent v-if="!isLoading">
      <!-- Service Details Section -->
      <div class="service-info mb-4">
        <VaCard class="border-black">
          <VaCardContent>
            <div class="flex flex-col gap-2">
              <h2 class="text-xl font-bold">{{ t('service.serviceInformation') }}</h2>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="font-semibold">{{ t('service.name') }}:</p>
                  <p>{{ serviceDetail?.name || 'N/A' }}</p>
                </div>
                <div>
                  <p class="font-semibold">{{ t('service.description') }}:</p>
                  <p>{{ serviceDetail?.description || 'N/A' }}</p>
                </div>
                <div>
                  <p class="font-semibold">{{ t('service.totalPrice') }}:</p>
                  <p>{{ formatPrice(serviceDetail?.totalPrice || 0) }}</p>
                </div>
                <div>
                  <p class="font-semibold">{{ t('common.status') }}:</p>
                  <div class="flex items-center gap-2">
                    <VaButton
                      color="warning"
                      size="small"
                      class="action-button-circle"
                      :disabled="isToggling"
                      :loading="isToggling"
                      round
                      @click="handleToggleStatus"
                    >
                      <VaIcon :name="serviceDetail?.isActive ? 'toggle_off' : 'toggle_on'" />
                    </VaButton>
                    <p :class="serviceDetail?.isActive ? 'text-success' : 'text-danger'">
                      {{ serviceDetail?.isActive ? 'Active' : 'Inactive' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </VaCardContent>
        </VaCard>
      </div>

      <!-- Procedures List Section -->
      <div class="procedures-list">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">{{ t('procedure.ProcedureManagement') }}</h2>

          <div class="flex gap-2">
            <VaButton color="success" @click="showAddModal = true"> {{ t('procedure.addProcedure') }} </VaButton>

            <VaButton
              v-if="!showRemovedProcedures"
              :color="isMultiSelectMode ? 'danger' : 'primary'"
              @click="isMultiSelectMode = !isMultiSelectMode"
            >
              {{ isMultiSelectMode ? t('common.cancel') : t('procedure.selectMultiple') }}
            </VaButton>

            <VaButton
              v-if="isMultiSelectMode && hasSelectedProcedures"
              color="danger"
              @click="deleteSelectedProcedures"
            >
              {{ t('common.delete') }} ({{ selectedProcedures.length }})
            </VaButton>
          </div>
        </div>

        <div v-if="activeProcedures.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <VaCard
            v-for="item in activeProcedures"
            :key="item.serviceProcedureId"
            class="procedure-card border-black"
            :class="{
              'selected-card': isMultiSelectMode && selectedProcedures.includes(item.serviceProcedureId),
            }"
            @click="isMultiSelectMode && toggleProcedureSelection(item.serviceProcedureId)"
          >
            <VaCardContent>
              <div class="flex flex-col gap-3">
                <div class="procedure-header border-b pb-2">
                  <div class="flex justify-between items-start mb-2">
                    <h3 class="text-lg font-bold text-primary">{{ item.procedureDetail.name }}</h3>
                    <button
                      v-if="!isMultiSelectMode"
                      type="button"
                      class="va-button va-button--small va-button--danger delete-btn"
                      @click.stop="deleteProcedure(item.serviceProcedureId)"
                    >
                      <i class="va-icon material-icons">delete</i>
                    </button>
                    <div
                      v-else
                      class="selection-indicator"
                      :class="{ selected: selectedProcedures.includes(item.serviceProcedureId) }"
                    >
                      <i class="va-icon material-icons">
                        {{
                          selectedProcedures.includes(item.serviceProcedureId)
                            ? 'check_circle'
                            : 'radio_button_unchecked'
                        }}
                      </i>
                    </div>
                  </div>
                </div>
                <div class="procedure-body">
                  <div class="mb-2">
                    <p class="font-semibold text-gray-700">{{ $t('procedure.description') }}:</p>
                    <p>{{ item.procedureDetail.description }}</p>
                  </div>
                  <div class="mb-2">
                    <p class="font-semibold text-gray-700">{{ $t('procedure.price') }}:</p>
                    <p class="text-success font-medium">{{ formatPrice(item.procedureDetail.price) }}</p>
                  </div>
                </div>
              </div>
            </VaCardContent>
          </VaCard>
        </div>
        <div v-else class="text-center py-4">
          <p>No procedures found.</p>
        </div>
      </div>
    </VaCardContent>
    <div v-else class="flex justify-center items-center p-8">
      <VaProgressCircle indeterminate />
    </div>
  </VaCard>

  <VaModal v-model="showDeleteModal" hide-default-actions>
    <template #header>
      <h3>{{ t('common.confirmDelete') }}</h3>
    </template>

    <div class="px-4 py-2">
      <p>{{ t('procedure.deleteConfirmMessage') }}</p>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <VaButton color="secondary" @click="showDeleteModal = false">
          {{ t('common.cancel') }}
        </VaButton>
        <VaButton color="danger" :loading="isDeleting" @click="handleDelete">
          {{ t('common.delete') }}
        </VaButton>
      </div>
    </template>
  </VaModal>

  <VaModal v-model="showAddModal" size="large" hide-default-actions>
    <template #header>
      <h3>{{ t('procedure.addProcedure') }}</h3>
    </template>

    <div class="p-4">
      <!-- Search input -->
      <div class="mb-4">
        <VaInput v-model="searchQuery" :placeholder="t('common.search')" removable class="w-full">
          <template #prependInner>
            <i class="va-icon material-icons">search</i>
          </template>
        </VaInput>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <VaCard
          v-for="procedure in filteredProcedures"
          :key="procedure.id"
          class="procedure-card border-black"
          :class="{
            'selected-card': selectedNewProcedures.includes(procedure.id),
          }"
          @click="toggleNewProcedureSelection(procedure.id)"
        >
          <VaCardContent>
            <div class="flex flex-col gap-2">
              <h3 class="text-lg font-bold text-primary">{{ procedure.name }}</h3>
              <p>{{ procedure.description }}</p>
              <p class="text-success font-medium">{{ formatPrice(procedure.price) }}</p>
              <div class="selection-indicator" :class="{ selected: selectedNewProcedures.includes(procedure.id) }">
                <i class="va-icon material-icons">
                  {{ selectedNewProcedures.includes(procedure.id) ? 'check_circle' : 'radio_button_unchecked' }}
                </i>
              </div>
            </div>
          </VaCardContent>
        </VaCard>
      </div>

      <!-- Pagination -->
      <div class="flex justify-center mt-4">
        <VaPagination v-model="currentPage" :pages="totalPages" :visible-pages="5" class="justify-center" />
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <VaButton color="secondary" @click="showAddModal = false">
          {{ t('common.cancel') }}
        </VaButton>
        <VaButton
          color="success"
          :loading="isAdding"
          :disabled="selectedNewProcedures.length === 0"
          @click="handleAddProcedures"
        >
          {{ t('procedure.addSelected') }} ({{ selectedNewProcedures.length }})
        </VaButton>
      </div>
    </template>
  </VaModal>

  <!-- Add this button next to or below the existing procedures list -->
  <!-- <div class="mt-4 mb-4">
    <VaButton
      class="reverse-btn"
      @click="showRemovedProcedures = !showRemovedProcedures"
    >
      {{ showRemovedProcedures ? 'Show Active Procedures' : 'Show Removed Procedures' }}
    </VaButton>
  </div> -->
</template>

<script setup lang="ts">
import { onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useServiceStore } from '@/stores/modules/service.module'
import { storeToRefs } from 'pinia'
import { useToast } from 'vuestic-ui'
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import type { ProcedureDTO, ServiceProcedureDetail } from '@/pages/servipage-procedure/types'

const router = useRouter()
const serviceStore = useServiceStore()
const { serviceProcedures, isLoading, serviceDetail } = storeToRefs(serviceStore)

const { t } = useI18n()
const { init } = useToast()
const showDeleteModal = ref(false)
const selectedProcedureId = ref<string | null>(null)
const isDeleting = ref(false)
const isToggling = ref(false)
const isRemove = ref(false)
const showRemovedProcedures = ref(false)
const selectedProcedures = ref<string[]>([])
const isMultiSelectMode = ref(false)
const showAddModal = ref(false)
const isAdding = ref(false)
const selectedNewProcedures = ref<string[]>([])
const allProcedures = ref<ProcedureDTO[]>([])
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 9 // 3x3 grid

// Separate active and removed procedures
const activeProcedures = computed(() => serviceProcedures.value.filter((proc) => !proc.procedureDetail.isRemove))

// Format price to VND
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)
}

const deleteProcedure = (procedureId: string) => {
  selectedProcedureId.value = procedureId
  showDeleteModal.value = true
}

const hasSelectedProcedures = computed(() => selectedProcedures.value.length > 0)

const toggleProcedureSelection = (procedureId: string) => {
  if (selectedProcedures.value.includes(procedureId)) {
    selectedProcedures.value = selectedProcedures.value.filter((id) => id !== procedureId)
  } else {
    selectedProcedures.value.push(procedureId)
  }
}

const deleteSelectedProcedures = () => {
  if (selectedProcedures.value.length === 0) return
  selectedProcedureId.value = null // Reset single selection
  showDeleteModal.value = true
}

const handleDelete = async () => {
  try {
    if (!serviceDetail.value?.serviceID) return

    console.log('Starting delete process...')
    isDeleting.value = true
    const serviceId = serviceDetail.value.serviceID
    isRemove.value = true

    // Handle both single and multiple deletions
    const proceduresToDelete = selectedProcedureId.value ? [selectedProcedureId.value] : selectedProcedures.value

    const response = await serviceStore.addOrDeleteProcedures(serviceId, proceduresToDelete, isRemove.value)

    // Update state with new service ID
    if (response?.serviceID && response.serviceID !== serviceId) {
      console.log('New service ID received:', response.serviceID)
      router.replace({
        name: router.currentRoute.value.name as string,
        replace: true,
        state: { serviceId: response.serviceID },
      })
    }

    showDeleteModal.value = false
    selectedProcedures.value = [] // Clear selections
    isMultiSelectMode.value = false // Exit multi-select mode

    init({
      message: t('procedure.deleteSuccess'),
      color: 'success',
      duration: 3000,
    })
  } catch (error) {
    console.error('Detailed error in handleDelete:', error)
    init({
      message: t('procedure.deleteError'),
      color: 'danger',
      duration: 3000,
    })
  } finally {
    isDeleting.value = false
    selectedProcedureId.value = null
    isRemove.value = false
  }
}

const availableProcedures = computed(() => {
  const existingProcedureIds = serviceProcedures.value.map((sp: ServiceProcedureDetail) => sp.procedureDetail.id)
  return allProcedures.value.filter((proc: ProcedureDTO) => !existingProcedureIds.includes(proc.id))
})

const toggleNewProcedureSelection = (procedureId: string) => {
  if (selectedNewProcedures.value.includes(procedureId)) {
    selectedNewProcedures.value = selectedNewProcedures.value.filter((id) => id !== procedureId)
  } else {
    selectedNewProcedures.value.push(procedureId)
  }
}

const handleAddProcedures = async () => {
  try {
    if (!serviceDetail.value?.serviceID) return

    isAdding.value = true
    const serviceId = serviceDetail.value.serviceID

    const response = await serviceStore.addOrDeleteProcedures(
      serviceId,
      selectedNewProcedures.value,
      false, // isRemove = false for adding
    )

    // Update state with new service ID
    if (response?.serviceID && response.serviceID !== serviceId) {
      console.log('New service ID received:', response.serviceID)
      router.replace({
        name: router.currentRoute.value.name as string,
        replace: true,
        state: { serviceId: response.serviceID },
      })
    }

    showAddModal.value = false
    selectedNewProcedures.value = []

    init({
      message: t('procedure.addSuccess'),
      color: 'success',
      duration: 3000,
    })
  } catch (error) {
    console.error('Error adding procedures:', error)
    init({
      message: t('procedure.addError'),
      color: 'danger',
      duration: 3000,
    })
  } finally {
    isAdding.value = false
  }
}
// Filter procedures based on search query and pagination
const filteredProcedures = computed(() => {
  const filtered = availableProcedures.value.filter((procedure) => {
    const searchLower = searchQuery.value.toLowerCase()
    return (
      procedure.name.toLowerCase().includes(searchLower) || procedure.description.toLowerCase().includes(searchLower)
    )
  })

  // Pagination
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filtered.slice(start, end)
})

const totalPages = computed(() => {
  const filtered = availableProcedures.value.filter((procedure) => {
    const searchLower = searchQuery.value.toLowerCase()
    return (
      procedure.name.toLowerCase().includes(searchLower) || procedure.description.toLowerCase().includes(searchLower)
    )
  })
  return Math.ceil(filtered.length / itemsPerPage)
})

// Reset pagination when search changes
watch(searchQuery, () => {
  currentPage.value = 1
})
//end filter procedures
onMounted(async () => {
  try {
    const id = (history.state as any)?.serviceId
    if (!id) {
      router.push('/service-management')
      return
    }
    await serviceStore.getServiceDetail(id)

    // Fetch all procedures
    const response = await serviceStore.getAllProcedures({
      pageNumber: 1,
      pageSize: 100, // Adjust as needed
      isActive: true,
    })
    allProcedures.value = response.data
  } catch (error) {
    console.error('Error loading data:', error)
  }
})

const handleToggleStatus = async () => {
  if (!serviceDetail.value) return

  try {
    isToggling.value = true
    const serviceId = serviceDetail.value.serviceID

    await serviceStore.toggleServiceStatus({
      id: serviceId,
      activate: !serviceDetail.value.isActive,
    })

    // Refresh service detail data after toggling
    await serviceStore.getServiceDetail(serviceId)

    init({
      message: t('service.statusUpdatedSuccessfully'),
      color: 'success',
      duration: 3000,
    })
  } catch (error) {
    console.error('Toggle status error:', error)
    init({
      message: t('service.statusUpdatedFailed'),
      color: 'danger',
      duration: 3000,
    })
  } finally {
    isToggling.value = false
  }
}
</script>
<style scoped>
.procedure-card {
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.text-success {
  color: #4caf50;
}

.text-danger {
  color: #f44336;
}

.text-primary {
  color: #1976d2;
}

.border-t {
  border-top: 1px solid #e5e7eb;
}

.border-b {
  border-bottom: 1px solid #e5e7eb;
}

.border-black {
  border: 2px solid #000000;
  border-radius: 8px;
}

.delete-btn {
  opacity: 1;
  transition: all 0.2s ease;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
}

.delete-btn:hover {
  opacity: 1;
  transform: scale(1.05);
  background-color: #ef4444;
}

.delete-btn:active {
  transform: scale(0.95);
  background-color: #dc2626;
}

.bg-red-100 {
  background-color: #fee2e2;
}

.text-red-800 {
  color: #991b1b;
}

.bg-green-100 {
  background-color: #dcfce7;
}

.text-green-800 {
  color: #166534;
}

.rounded-full {
  border-radius: 9999px;
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.font-semibold {
  font-weight: 600;
}

.mt-2 {
  margin-top: 0.5rem;
}

.reverse-btn {
  background-color: #1976d2;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.reverse-btn:hover {
  background-color: #1565c0;
  transform: translateY(-1px);
}

.restore-btn {
  background-color: #4caf50;
  color: white;
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.restore-btn:hover {
  background-color: #45a049;
  transform: translateY(-1px);
}

.selected-card {
  border: 2px solid #f44336 !important;
  background-color: rgba(244, 67, 54, 0.05);
  cursor: pointer;
}

.selection-indicator {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #757575;
}

.selection-indicator.selected {
  color: #f44336;
}

.procedure-card {
  cursor: pointer;
  transition: all 0.2s ease;
}

.procedure-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
