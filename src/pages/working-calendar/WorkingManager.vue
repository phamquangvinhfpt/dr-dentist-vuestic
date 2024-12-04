<template>
  <Calendar
    v-model:full-time-non="fullTimeNonAccpet"
    v-model:part-time-non="partTimeNonAccpet"
    :regist="registerCalendar"
    @update:updateWorkingCalendar="updateWorkingCalendar"
    @update:regist="fetch"
  />
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import Calendar from './widgets/Calendar.vue'
import { useCalendarStore } from '@/stores/modules/calendar.module'
import { useAuthStore } from '@/stores/modules/auth.module'
import { useToast } from 'vuestic-ui'
import { getErrorMessage } from '@/services/utils'
import { Search, SearchResponse } from './types'

const loading = ref(false)
const storeCalendar = useCalendarStore()
const storeAuth = useAuthStore()
const { init } = useToast()
const current_user = storeAuth.user
const workingCalendar = ref<SearchResponse | null>(null)
const fullTimeNonAccpet = ref<SearchResponse | null>(null)
const partTimeNonAccpet = ref<SearchResponse | null>(null)
const current_date = new Date().toISOString().split('T')[0]
const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 2).toISOString().split('T')[0]
const lastDay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().split('T')[0]

const registerCalendar = () => {
  loading.value = true
  storeCalendar
    .registerFullTime(current_user?.id, current_date)
    .then((response) => {
      loading.value = false
      console.log(response)
    })
    .catch((error) => {
      const errorMessage = getErrorMessage(error)
      init({
        title: 'error',
        message: errorMessage,
        color: 'danger',
      })
    })
}

// const pagination = ref<Pagination>({
//   page: 1,
//   perPage: 10,
//   total: 0,
// })

const searchValue = ref<Search>({
  keyword: '',
})

// const totalPages = computed(() => Math.ceil(pagination.value.total / pagination.value.perPage))

const getWorkingCalendar = () => {
  loading.value = true
  storeCalendar
    .getWorkingCalendar(firstDay, lastDay, searchValue.value)
    .then((response) => {
      workingCalendar.value = response
      loading.value = false
    })
    .catch((error) => {
      const errorMessage = getErrorMessage(error)
      init({
        title: 'error',
        message: errorMessage,
        color: 'danger',
      })
    })
}

const getFullTimeNonAcceptWorkingCalendar = () => {
  loading.value = true
  storeCalendar
    .getFullTimeNonAcceptWorkingCalendar(firstDay, lastDay, searchValue.value)
    .then((response) => {
      fullTimeNonAccpet.value = response
      loading.value = false
    })
    .catch((error) => {
      const errorMessage = getErrorMessage(error)
      init({
        title: 'error',
        message: errorMessage,
        color: 'danger',
      })
    })
}

const getPartTimeNonAcceptWorkingCalendar = () => {
  loading.value = true
  storeCalendar
    .getPartTimeNonAcceptWorkingCalendar(firstDay, lastDay, searchValue.value)
    .then((response) => {
      partTimeNonAccpet.value = response
      loading.value = false
    })
    .catch((error) => {
      const errorMessage = getErrorMessage(error)
      init({
        title: 'error',
        message: errorMessage,
        color: 'danger',
      })
    })
}

const updateWorkingCalendar = (id: string, data: any) => {
  loading.value = true
  storeCalendar
    .updateWorkingCalendar(id, data)
    .then(() => {
      getWorkingCalendar()
      getFullTimeNonAcceptWorkingCalendar()
      getPartTimeNonAcceptWorkingCalendar()
      loading.value = false
      init({
        title: 'success',
        message: 'Bác sĩ đã được sắp giờ làm việc thành công!',
        color: 'success',
      })
    })
    .catch((error) => {
      const errorMessage = getErrorMessage(error)
      init({
        title: 'error',
        message: errorMessage,
        color: 'danger',
      })
    })
}

const fetch = () => {
  getWorkingCalendar()
  getFullTimeNonAcceptWorkingCalendar()
  getPartTimeNonAcceptWorkingCalendar()
}

// watch(
//   () => pagination.value.page,
//   () => {
//     searchValue.value.pageNumber = pagination.value.page
//     searchValue.value.pageSize = pagination.value.perPage
//   },
//   { immediate: true },
// )

// watch(
//   () => pagination.value.perPage,
//   () => {
//     searchValue.value.pageNumber = 1
//     searchValue.value.pageSize = pagination.value.perPage
//   },
//   { immediate: true },
// )

// watch(
//   () => searchRes.value,
//   () => {
//     if (searchRes.value) {
//       pagination.value.total = searchRes.value.totalCount
//     }
//   },
//   { immediate: true },
// )

onMounted(() => {
  // registerCalendar()
  getWorkingCalendar()
  getFullTimeNonAcceptWorkingCalendar()
  getPartTimeNonAcceptWorkingCalendar()
})
</script>
