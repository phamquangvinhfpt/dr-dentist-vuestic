<template>
  <div class="flex justify-between mb-4">
    <div class="flex gap-2">
      <VaButton color="primary" @click="showCreateModal = true">
        <i class="va-icon material-icons mr-2">add</i>
        Create Procedure
      </VaButton>
      <VaButton :color="showBin ? 'warning' : 'secondary'" @click="toggleBin">
        <i class="va-icon material-icons mr-2">{{ showBin ? 'list' : 'delete' }}</i>
        {{ showBin ? 'Active List' : 'Recycle Bin' }}
      </VaButton>
    </div>
  </div>

  <VaDataTable
    class="my-table va-table--hoverable"
    :items="procedureList"
    :columns="columnsWithActions"
    hoverable
    select-mode="multiple"
    :disable-client-side-sorting="false"
    :style="{
      '--va-data-table-thead-background': 'var(--va-background-element)',
      '--va-data-table-grid-tr-border': '1px solid var(--va-background-border)',
    }"
    sticky-header
    no-data-html="<div class='text-center'>No procedures found</div>"
  >
    <template #cell(id)="{ row }">
      <div class="flex items-center gap-2 ellipsis max-w-[230px]">
        <span class="w-24">{{ row.rowData.id }}</span>
      </div>
    </template>

    <template #cell(name)="{ row }">
      <div class="flex items-center gap-2 ellipsis max-w-[230px]">
        <span class="w-24">{{ row.rowData.name }}</span>
      </div>
    </template>

    <template #cell(description)="{ row }">
      <div class="flex items-center gap-2 ellipsis max-w-[230px]">
        <span class="w-24">{{ row.rowData.description }}</span>
      </div>
    </template>

    <template #cell(price)="{ row }">
      <div class="flex items-center gap-2 ellipsis max-w-[230px]">
        <span class="w-24">{{ formatPrice(row.rowData.price) }}</span>
      </div>
    </template>

    <template #cell(createDate)="{ row }">
      <div class="flex items-center gap-2 ellipsis max-w-[230px]">
        <span class="w-24">{{ formatDate(row.rowData.createDate) }}</span>
      </div>
    </template>

    <template #cell(actions)="{ row }">
      <div class="flex gap-2">
        <template v-if="!showBin">
          <VaButton small color="primary" @click="handleEdit(row.rowData)">
            <i class="va-icon material-icons">edit</i>
          </VaButton>
          <VaButton small color="danger" @click="confirmDelete(row.rowData)">
            <i class="va-icon material-icons">delete</i>
          </VaButton>
        </template>
        <template v-else>
          <VaButton small color="success" @click="handleRestore(row.rowData)">
            <i class="va-icon material-icons">restore</i>
          </VaButton>
        </template>
      </div>
    </template>
  </VaDataTable>

  <VaCardContent>
    <div v-if="procedureListResponse" class="flex flex-col-reverse md:flex-row gap-2 justify-between items-center p-2">
      <div>
        <b>{{ procedureListResponse.totalCount }} {{ t('common.result') }}.</b>
        {{ t('common.resultPerPage') }}
        <VaSelect v-model="filterData.pageSize" class="!w-20" :options="[10, 50, 100]" />
      </div>
      <div v-if="procedureListResponse.totalPages > 1" class="flex">
        <VaPagination
          v-model="procedureListResponse.currentPage"
          buttons-preset="secondary"
          :pages="procedureListResponse.totalPages"
          :visible-pages="5"
          :boundary-links="true"
          :direction-links="true"
        />
      </div>
    </div>
  </VaCardContent>

  <VaModal v-model="showCreateModal" title="Create New Procedure" hide-default-actions>
    <div class="p-4">
      <form class="flex flex-col gap-4" @submit.prevent="handleCreate">
        <VaInput v-model="formData.name" label="Name" required />
        <VaTextarea v-model="formData.description" label="Description" required />
        <VaInput v-model="formData.price" label="Price" type="number" required />
      </form>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <VaButton color="gray" @click="showCreateModal = false">Cancel</VaButton>
        <VaButton color="primary" :loading="isSubmitting" @click="handleCreate"> Create </VaButton>
      </div>
    </template>
  </VaModal>

  <VaModal v-model="showEditModal" title="Edit Procedure" hide-default-actions>
    <div class="p-4">
      <form class="flex flex-col gap-4" @submit.prevent="handleUpdate">
        <VaInput v-model="formData.name" label="Name" required />
        <VaTextarea v-model="formData.description" label="Description" required />
        <VaInput v-model="formData.price" label="Price" type="number" required />
      </form>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <VaButton color="gray" @click="showEditModal = false">Cancel</VaButton>
        <VaButton color="primary" :loading="isSubmitting" @click="handleUpdate"> Update </VaButton>
      </div>
    </template>
  </VaModal>

  <VaModal v-model="showDeleteModal" title="Confirm Delete" hide-default-actions>
    <div class="p-4">Are you sure you want to delete this procedure?</div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <VaButton color="gray" @click="showDeleteModal = false">Cancel</VaButton>
        <VaButton color="danger" :loading="isDeleting" @click="handleDelete"> Delete </VaButton>
      </div>
    </template>
  </VaModal>
</template>

<script lang="ts" setup>
import { useToast } from 'vuestic-ui'
import { onMounted, Ref, ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useServiceStore } from '@/stores/modules/service.module'
import { useAuthStore } from '@/stores/modules/auth.module'
import { useRouter } from 'vue-router'
import type { ListProcedurePagination, ProcedureDTO, FilterProcedure, ProcedureFormData } from './types'

const { t } = useI18n()
const { init } = useToast()
const serviceStore = useServiceStore()
const authStore = useAuthStore()
const router = useRouter()

const filterData = reactive<FilterProcedure>({
  pageNumber: 1,
  pageSize: 10,
  isActive: true,
  orderBy: [],
})

const formData = reactive<ProcedureFormData>({
  name: '',
  description: '',
  price: 0,
})

const procedureListResponse: Ref<ListProcedurePagination | null> = ref(null)
const procedureList: Ref<ProcedureDTO[]> = ref([])

const showBin = ref(false)
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const showEditModal = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const selectedProcedure = ref<ProcedureDTO | null>(null)

watch(
  () => procedureListResponse.value?.currentPage,
  (newPage) => {
    if (newPage && newPage !== filterData.pageNumber) {
      filterData.pageNumber = newPage
      getAllProceduresPagination()
    }
  },
)

watch(
  () => filterData.pageSize,
  () => {
    filterData.pageNumber = 1 // Reset về trang 1 khi đổi page size
    getAllProceduresPagination()
  },
)

const getAllProceduresPagination = async () => {
  try {
    const res = showBin.value
      ? await serviceStore.getDeletedProcedures({
          pageNumber: filterData.pageNumber,
          pageSize: filterData.pageSize,
          isActive: filterData.isActive,
          orderBy: filterData.orderBy,
        })
      : await serviceStore.getAllProcedures({
          pageNumber: filterData.pageNumber,
          pageSize: filterData.pageSize,
          isActive: filterData.isActive,
          orderBy: filterData.orderBy,
        })
    procedureListResponse.value = res
    procedureList.value = res.data
  } catch (error) {
    console.error('Error fetching procedures:', error)
    procedureListResponse.value = null
    procedureList.value = []
  }
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('vi-VN')
}

const columns = computed(() => [
  { key: 'id', label: t('procedure.id') },
  { key: 'name', label: t('procedure.name') },
  { key: 'description', label: t('procedure.description') },
  { key: 'price', label: t('procedure.price') },
  { key: 'createDate', label: t('procedure.createDate') },
])

const columnsWithActions = computed(() => [...columns.value, { key: 'actions', label: 'Actions' }])

const handleEdit = (procedure: ProcedureDTO) => {
  selectedProcedure.value = procedure
  formData.name = procedure.name
  formData.description = procedure.description
  formData.price = procedure.price
  showEditModal.value = true
}

const handleCreate = async () => {
  try {
    isSubmitting.value = true
    await serviceStore.createProcedure(formData)
    init({
      message: 'Procedure created successfully',
      color: 'success',
      duration: 3000,
    })
    showCreateModal.value = false
    resetForm()
    getAllProceduresPagination()
  } catch (error) {
    init({
      message: 'Create failed',
      color: 'danger',
      duration: 3000,
    })
  } finally {
    isSubmitting.value = false
  }
}

const handleUpdate = async () => {
  if (!selectedProcedure.value) return
  try {
    isSubmitting.value = true
    await serviceStore.updateProcedure(selectedProcedure.value.id, formData)
    init({
      message: 'Procedure updated successfully',
      color: 'success',
      duration: 3000,
    })
    showEditModal.value = false
    resetForm()
    getAllProceduresPagination()
  } catch (error) {
    init({
      message: 'Update failed',
      color: 'danger',
      duration: 3000,
    })
  } finally {
    isSubmitting.value = false
  }
}

const confirmDelete = (procedure: ProcedureDTO) => {
  selectedProcedure.value = procedure
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!selectedProcedure.value) return
  try {
    isDeleting.value = true
    await serviceStore.deleteProcedure(selectedProcedure.value.id)
    init({
      message: 'Procedure deleted successfully',
      color: 'success',
      duration: 3000,
    })
    showDeleteModal.value = false
    getAllProceduresPagination()
  } catch (error) {
    init({
      message: 'Delete failed',
      color: 'danger',
      duration: 3000,
    })
  } finally {
    isDeleting.value = false
  }
}

const handleRestore = async (procedure: ProcedureDTO) => {
  try {
    await serviceStore.restoreProcedure(procedure.id)
    init({
      message: 'Procedure restored successfully',
      color: 'success',
      duration: 3000,
    })
    getAllProceduresPagination()
  } catch (error) {
    init({
      message: 'Restore failed',
      color: 'danger',
      duration: 3000,
    })
  }
}

const toggleBin = () => {
  showBin.value = !showBin.value
  getAllProceduresPagination()
}

const resetForm = () => {
  filterData.pageNumber = 1
  filterData.pageSize = 10
  filterData.isActive = true
  filterData.orderBy = []

  formData.name = ''
  formData.description = ''
  formData.price = 0

  selectedProcedure.value = null
}

onMounted(async () => {
  // Check if user is Admin
  if (!authStore.musHaveRole('Admin')) {
    init({
      message: t('common.unauthorized'),
      color: 'danger',
      duration: 3000,
    })
    router.push({ name: 'dashboard' })
    return
  }

  await getAllProceduresPagination()
})
</script>

<style scoped>
.va-table-responsive {
  overflow: auto;
}
</style>
