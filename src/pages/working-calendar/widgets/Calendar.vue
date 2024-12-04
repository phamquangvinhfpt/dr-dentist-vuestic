<template>
  <VaCard class="flex min-h-screen">
    <main class="flex-1 p-8">
      <!-- Calendar Header -->
      <div class="flex justify-between items-center mb-8">
        <div></div>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <div
              class="relative rounded-full w-10 h-10 bg-blue-500 hover:cursor-pointer hover:bg-blue-600"
              @click="props.regist, $emit('update:regist')"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="icon icon-tabler icons-tabler-outline icon-tabler-calendar-clock absolute bottom-2 right-2"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M10.5 21h-4.5a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v3" />
                <path d="M16 3v4" />
                <path d="M8 3v4" />
                <path d="M4 11h10" />
                <path d="M18 18m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
                <path d="M18 16.5v1.5l.5 .5" />
              </svg>
            </div>
            <select v-model="currentYear" class="border rounded px-3 py-1.5">
              <option v-for="year in years" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
            <select v-model="currentMonth" class="border rounded px-3 py-1.5">
              <option v-for="(month, index) in months" :key="index" :value="index">
                {{ month }}
              </option>
            </select>
          </div>
        </div>
      </div>
      <div class="grid gap-6">
        <div class="grid gap-6 lg:grid-cols-3">
          <div>
            <div class="mb-4">
              <VaButtonToggle
                v-model="switcher"
                preset="secondary"
                class="mb-3"
                border-color="primary"
                :options="options"
              />
              <ul>
                <li v-for="dentist in dentists?.data" :key="dentist.dentistUserID">
                  <div class="flex items-center justify-between gap-2 hover:cursor-pointer" @click="show = !show">
                    <div class="grid grid-cols-2 gap-2">
                      <VaAvatar
                        :src="getSrcAvatar(dentist.dentistImage)"
                        class="w-14 h-14 font-bold"
                        :fallback-text="dentist.dentistName.charAt(0)?.toUpperCase()"
                        :color="avatarColor(dentist.dentistName)"
                      />
                      <div class="mt-1">
                        <p class="text-sm">{{ dentist.dentistName }}</p>
                        <p class="text-secondary">{{ workingTypeLabel(dentist.workingType) }}</p>
                      </div>
                    </div>
                    <div class="flex items-end justify-end cursor-pointer">
                      <VaButton preset="primary" class="mr-3"> Primary </VaButton>
                      <VaIcon
                        name="chevron_right"
                        color="primary"
                        class="transform transition-transform duration-300 ease-in-out"
                        :class="{ 'rotate-90': show }"
                      />
                    </div>
                  </div>
                  <VaScrollContainer
                    v-if="show"
                    class="mt-2 space-y-2 md:min-h-[calc(100vh-435px)] lg:max-h-[calc(100vh-635px)] overflow-y-auto"
                    vertical
                    color="focus"
                  >
                    <div
                      v-for="item in dentist.calendarDetails"
                      :key="item.dentistUserID"
                      class="bg-white shadow-sm rounded-lg p-3 border border-gray-200 hover:bg-gray-50 transition-colors duration-200 hover:cursor-move mb-3"
                      draggable="true"
                      @dragstart="handleDragStart($event, dentist, item)"
                      @dragend="handleDragEnd"
                    >
                      <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                          <!-- Date Icon -->
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-5 w-5 text-blue-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1V8a1 1 0 011-1h1z"
                              clip-rule="evenodd"
                            />
                          </svg>
                          <span class="text-sm font-medium text-gray-700">{{ formatDate(item.date) }}</span>
                        </div>

                        <!-- Working Status Badge -->
                        <span
                          class="px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
                          :class="{
                            'bg-yellow-100 text-yellow-800': workingStatusLabel(item.workingStatus) === 'Waiting',
                            'bg-green-100 text-green-800': workingStatusLabel(item.workingStatus) === 'Accept',
                            'bg-red-100 text-red-800': workingStatusLabel(item.workingStatus) === 'Off',
                          }"
                        >
                          {{ workingStatusLabel(item.workingStatus) }}
                        </span>
                      </div>

                      <!-- Note Section -->
                      <div class="mt-2 text-sm text-gray-600 italic">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4 inline-block mr-2 text-gray-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clip-rule="evenodd"
                          />
                        </svg>
                        {{ item.note || 'No additional notes' }}
                      </div>
                    </div>
                  </VaScrollContainer>
                </li>
              </ul>
            </div>
          </div>

          <div class="lg:col-span-2">
            <!-- Calendar Grid -->
            <div class="relative border rounded-lg shadow">
              <!-- Days Header -->
              <div class="grid grid-cols-7 border-b">
                <div v-for="day in weekDays" :key="day" class="py-2 text-center text-sm text-gray-600">
                  {{ day }}
                </div>
              </div>

              <!-- Calendar Days -->
              <div class="grid grid-cols-7 grid-rows-auto">
                <div
                  v-for="(day, index) in calendarDays"
                  :key="index"
                  class="min-h-[120px] border-b border-r p-2 relative group"
                  @contextmenu.prevent="openAddEventModal($event, day)"
                  @dragover.prevent
                  @drop="handleDrop($event)"
                >
                  <span :class="{ 'text-gray-400': !day.isCurrentMonth }" class="text-sm">
                    {{ day.date }}
                  </span>

                  <!-- Events -->
                  <div class="mt-2 space-y-1 max-h-[80px] overflow-y-auto">
                    <div
                      v-for="event in day.events"
                      :key="event.id"
                      class="text-xs p-1 rounded cursor-pointer flex items-center gap-1"
                      :class="getEventClass(event.type)"
                      draggable="true"
                      @mouseenter="showEventDetails(event, $event)"
                      @mouseleave="hideEventDetails"
                    >
                      <div :class="getEventDotClass(event.type)" class="w-2 h-2 rounded-full flex-shrink-0"></div>
                      <span class="truncate">{{ event.title }}</span>
                    </div>
                  </div>

                  <!-- Drag Overlay -->
                </div>
                <div
                  v-if="isDragging"
                  class="absolute inset-0 bg-blue-100 bg-opacity-50 border-2 border-blue-500 border-dashed z-50 flex items-center justify-center pointer-events-none"
                >
                  <span class="text-blue-600 font-semibold">Drop Here</span>
                </div>
              </div>
            </div>

            <!-- Context Menu -->
            <div
              v-if="contextMenu.show"
              :style="{
                position: 'fixed',
                top: `${contextMenu.y}px`,
                left: `${contextMenu.x}px`,
              }"
              class="z-50 bg-white rounded-md shadow-lg context-menu"
            >
              <div class="py-1">
                <button class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Show Unassigned
                </button>
              </div>
            </div>

            <!-- Add Event Modal -->
            <div
              v-if="showAddModal"
              class="fixed z-50 bg-white rounded-lg shadow-xl p-4 min-w-[300px]"
              :style="modalStyle"
            >
              <div class="doctor-schedule p-4 relative">
                <!-- icon cancel -->
                <button class="absolute top-2 right-2 text-gray-500 hover:text-gray-700" @click="closeAddModal">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
                <h2 class="text-2xl font-bold mb-4">Doctor's Working Hours</h2>
                <div class="schedule-inputs flex space-x-4 mb-4">
                  <VaOptionList
                    v-model="listValue"
                    :options="optionsTimes"
                    value-by="altValue"
                    disabled-by="altDisabled"
                    :text-by="(option: any) => option.altText"
                  />
                </div>
                <div class="schedule-actions flex space-x-4 justify-end">
                  <VaButton preset="primary" @click="saveSchedule"> Save Schedule </VaButton>
                </div>
              </div>
            </div>

            <!-- Event Details Modal -->
            <div
              v-if="showDetailsModal"
              class="fixed z-50 bg-white rounded-lg shadow-xl p-4 min-w-[250px]"
              :style="detailsModalStyle"
            >
              <h4 class="font-semibold">{{ selectedEvent?.title }}</h4>
              <p class="text-sm text-gray-600 mt-1">{{ selectedEvent?.type }} event</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </VaCard>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { SearchResponse } from '../types'
import { avatarColor } from '@/services/utils'
import { watch } from 'vue'

interface Event {
  id: number
  title: string
  type: 'warning' | 'usual' | 'error'
  date: Date
}

interface CalendarDay {
  date: number
  isCurrentMonth: boolean
  events: Event[]
}

const currentYear = computed(() => new Date().getFullYear())
const currentMonth = ref(1) // February
const showAddModal = ref(false)
const closeAddModal = () => {
  showAddModal.value = false
}
const showDetailsModal = ref(false)
const modalPosition = ref({ x: 0, y: 0 })
const selectedDate = ref<Date | null>(null)
const selectedEvent = ref<Event | null>(null)
const selectedDentistId = ref('')
const switcher = ref('full-time')
const show = ref(false)
const draggedItem = ref(null)
const isDragging = ref(false)
const showModal = ref(false)
const listValue = ref([])
const optionsTimes = [
  {
    text: '8:00 AM - 12:00 PM',
    value: '08:00:00-12:00:00',
    altText: '8:00 AM - 12:00 PM',
    altValue: '08:00:00-12:00:00',
    disabled: false,
    altDisabled: false,
  },
  {
    text: '1:00 PM - 5:00 PM',
    value: '13:00:00-17:00:00',
    altText: '1:00 PM - 5:00 PM',
    altValue: '13:00:00-17:00:00',
    disabled: false,
    altDisabled: false,
  },
  {
    text: '6:00 PM - 10:00 PM',
    value: '18:00:00-22:00:00',
    altText: '6:00 PM - 10:00 PM',
    altValue: '18:00:00-22:00:00',
    disabled: false,
    altDisabled: false,
  },
]
const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
})
const options = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
]
const dentists = computed(() => (switcher.value === 'full-time' ? props.fullTimeNon : props.partTimeNon))

const props = defineProps<{
  regist: () => void
  fullTimeNon: SearchResponse | null
  partTimeNon: SearchResponse | null
}>()
const emit = defineEmits(['update:updateWorkingCalendar', 'update:regist'])

const years = Array.from({ length: 10 }, (_, i) => currentYear.value - 5 + i)
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

// const newEvent = ref({
//   title: '',
//   type: 'usual' as const,
// })
// Sample events data
const events = ref<Event[]>([
  // Day 8 events
  {
    id: 1,
    title: 'This is warning event.',
    type: 'warning',
    date: new Date(2024, 1, 8),
  },
  {
    id: 2,
    title: 'This is usual event.',
    type: 'usual',
    date: new Date(2024, 1, 8),
  },
  // Day 15 events
  {
    id: 3,
    title: 'This is warning event',
    type: 'warning',
    date: new Date(2024, 1, 15),
  },
  {
    id: 4,
    title: 'This is very long usual event......',
    type: 'usual',
    date: new Date(2024, 1, 15),
  },
  {
    id: 5,
    title: 'This is error event 1.',
    type: 'error',
    date: new Date(2024, 1, 15),
  },
  // Additional events for testing scroll
  {
    id: 6,
    title: 'Fourth event',
    type: 'usual',
    date: new Date(2024, 1, 15),
  },
  {
    id: 7,
    title: 'Fifth event',
    type: 'warning',
    date: new Date(2024, 1, 15),
  },
])

const calendarDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const days: CalendarDay[] = []

  // Previous month days
  const prevMonthDays = firstDay.getDay()
  const prevMonth = new Date(currentYear.value, currentMonth.value - 1, 0)
  for (let i = prevMonthDays - 1; i >= 0; i--) {
    days.push({
      date: prevMonth.getDate() - i,
      isCurrentMonth: false,
      events: [],
    })
  }

  // Current month days
  for (let date = 1; date <= lastDay.getDate(); date++) {
    const dayEvents = events.value.filter((event) => {
      return (
        event.date.getDate() === date &&
        event.date.getMonth() === currentMonth.value &&
        event.date.getFullYear() === currentYear.value
      )
    })
    days.push({
      date,
      isCurrentMonth: true,
      events: dayEvents,
    })
  }

  // Next month days
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      date: i,
      isCurrentMonth: false,
      events: [],
    })
  }

  return days
})

const modalStyle = computed(() => ({
  left: modalPosition.value.x ? `${modalPosition.value.x}px` : '50%',
  top: modalPosition.value.y ? `${modalPosition.value.y}px` : '50%',
  transform: !modalPosition.value.x && !modalPosition.value.y ? 'translate(-50%, -50%)' : 'none',
}))

const detailsModalStyle = computed(() => ({
  left: `${modalPosition.value.x}px`,
  top: `${modalPosition.value.y}px`,
}))

function openAddEventModal(event: MouseEvent, day: CalendarDay) {
  if (showAddModal.value) {
    showAddModal.value = false
  }
  modalPosition.value = {
    x: event.clientX,
    y: event.clientY,
  }
  selectedDate.value = new Date(currentYear.value, currentMonth.value, day.date)
  showAddModal.value = true
}

// function openGlobalAddEventModal() {
//   modalPosition.value = {
//     x: 0,
//     y: 0,
//   }
//   selectedDate.value = new Date(currentYear.value, currentMonth.value, 1)
//   showAddModal.value = true
// }

// function addEvent() {
//   if (selectedDate.value && newEvent.value.title) {
//     events.value.push({
//       id: Date.now(),
//       title: newEvent.value.title,
//       type: newEvent.value.type,
//       date: selectedDate.value,
//     })
//     showAddModal.value = false
//     newEvent.value.title = ''
//     newEvent.value.type = 'usual'
//   }
// }

function showEventDetails(event: Event, e: MouseEvent) {
  modalPosition.value = {
    x: e.clientX,
    y: e.clientY,
  }
  selectedEvent.value = event
  showDetailsModal.value = true
}

function hideEventDetails() {
  showDetailsModal.value = false
}

function getEventClass(type: Event['type']) {
  return {
    warning: 'bg-yellow-100 text-yellow-800',
    usual: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
  }[type]
}

function getEventDotClass(type: Event['type']) {
  return {
    warning: 'bg-yellow-500',
    usual: 'bg-green-500',
    error: 'bg-red-500',
  }[type]
}

const formatDate = (date: any): string => {
  if (date === null || date === undefined) return ''

  const dateObj =
    date instanceof Date
      ? date
      : typeof date === 'string'
        ? new Date(date)
        : date instanceof Number
          ? new Date(Number(date))
          : new Date()

  if (isNaN(dateObj.getTime())) return ''

  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0')
  const day = dateObj.getDate().toString().padStart(2, '0')
  const year = dateObj.getFullYear()

  return `${day}/${month}/${year}`
}

function getSrcAvatar(img: any) {
  const url = import.meta.env.VITE_APP_BASE_URL as string
  const url_without_api = url.slice(0, -3)
  if (img) return `${url_without_api}${img}`
  return ''
}

function handleDragStart(event: DragEvent, dentist: any, item: any) {
  const request = {
    ...dentist,
    item,
  }
  draggedItem.value = request
  isDragging.value = true
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', JSON.stringify(request))
  }
}

function handleDragEnd() {
  isDragging.value = false
  draggedItem.value = null
}

function handleDrop(event: DragEvent) {
  isDragging.value = false
  if (draggedItem.value) {
    const item = JSON.parse(event.dataTransfer?.getData('text/plain') || '')
    selectedDentistId.value = item.dentistUserID
    selectedDate.value = item.item.date
  }
  showAddModal.value = true
}

function workingTypeLabel(type: number) {
  return {
    1: 'Part-time',
    2: 'Full-time',
  }[type]
}

function workingStatusLabel(status: number) {
  return {
    0: 'Waiting',
    1: 'Accept',
    2: 'Off',
  }[status]
}

const saveSchedule = () => {
  console.log('listValue.value:', listValue.value)
  emit('update:updateWorkingCalendar', selectedDentistId.value, [
    {
      date: selectedDate.value,
      timeWorkings: listValue.value.map((timeRange: string) => {
        const [startTime, endTime] = timeRange.split('-')
        return {
          startTime,
          endTime,
        }
      }),
    },
  ])
  showModal.value = true
  showAddModal.value = false
  selectedDate.value = null
  draggedItem.value = null
  selectedDentistId.value = ''
  listValue.value = []
}

watch(
  () => listValue.value,
  () => {
    if (listValue.value.length === 2) {
      optionsTimes.forEach((option) => {
        if (option.altValue !== listValue.value[0] && option.altValue !== listValue.value[1]) {
          option.disabled = true
          option.altDisabled = true
        }
      })
    } else {
      optionsTimes.forEach((option) => {
        option.disabled = false
        option.altDisabled = false
      })
    }
  },
)
</script>

<style scoped>
/* Custom scrollbar styles */
.max-h-\[80px\]::-webkit-scrollbar {
  width: 4px;
}

.max-h-\[80px\]::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.max-h-\[80px\]::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 2px;
}

.max-h-\[80px\]::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
