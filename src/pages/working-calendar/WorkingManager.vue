<template>
  <Calendar
    v-model:working-calendar="workingCalendar"
    v-model:full-time-non="fullTimeNonAccpet"
    v-model:part-time-non="partTimeNonAccpet"
    v-model:regist="registerCalendar"
    :get-working-calendar="getWorkingCalendar"
    :get-full-time-non="getFullTimeNonAcceptWorkingCalendar"
    :get-part-time-non="getPartTimeNonAcceptWorkingCalendar"
    @update:updateWorkingCalendar="updateWorkingCalendar"
    @update:regist="fetch"
  />
</template>
<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import Calendar from './widgets/Calendar.vue'
import { useCalendarStore } from '@/stores/modules/calendar.module'
import { useToast } from 'vuestic-ui'
import { getErrorMessage } from '@/services/utils'
import { Search, SearchResponse } from './types'
import { useAuthStore } from '@/stores/modules/auth.module'

const loading = ref(false)
const storeCalendar = useCalendarStore()
const { init } = useToast()
const { notify } = useToast()
const auth = useAuthStore()
const typeDoctor = computed(() => auth.user?.type)
const workingCalendar = ref<SearchResponse | null>(null)
const fullTimeNonAccpet = ref<SearchResponse | null>(null)
const partTimeNonAccpet = ref<SearchResponse | null>(null)
let firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 2).toISOString().split('T')[0]
let lastDay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().split('T')[0]

const registerCalendar = (id: any, date: any) => {
  console.log(id, date)
  loading.value = true
  storeCalendar
    .registerFullTime(id, date)
    .then(() => {
      loading.value = false
      init({
        title: 'success',
        message: 'Đăng ký làm việc thành công!',
        color: 'success',
      })
      fetch()
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

const searchValue = ref<Search>({
  keyword: '',
})

const getWorkingCalendar = (newfirst?: any, newlast?: any) => {
  firstDay = newfirst ? newfirst : firstDay
  lastDay = newlast ? newlast : lastDay
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

const getFullTimeNonAcceptWorkingCalendar = (newfirst?: any, newlast?: any) => {
  firstDay = newfirst ? newfirst : firstDay
  lastDay = newlast ? newlast : lastDay
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

const getPartTimeNonAcceptWorkingCalendar = (newfirst?: any, newlast?: any) => {
  firstDay = newfirst ? newfirst : firstDay
  lastDay = newlast ? newlast : lastDay
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
  if (auth.musHaveRole('Staff') || auth.musHaveRole('Admin')) {
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
  } else if (auth.musHaveRole('Dentist') && typeDoctor.value === 'PartTime') {
    storeCalendar
      .createWorkingCalendar(id, data)
      .then(() => {
        getWorkingCalendar()
        getFullTimeNonAcceptWorkingCalendar()
        getPartTimeNonAcceptWorkingCalendar()
        loading.value = false
        notify({
          title: 'success',
          message: 'Bạn đã đăng ký lịch làm việc thành công! Vui lòng chờ xét duyệt!',
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
}

const fetch = () => {
  getWorkingCalendar()
  getFullTimeNonAcceptWorkingCalendar()
  getPartTimeNonAcceptWorkingCalendar()
}

onMounted(() => {
  getWorkingCalendar()
  getFullTimeNonAcceptWorkingCalendar()
  getPartTimeNonAcceptWorkingCalendar()
})
</script>
