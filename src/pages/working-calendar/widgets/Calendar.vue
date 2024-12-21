<template>
  <VaInnerLoading :loading="loading">
    <VaCard class="flex min-h-screen">
      <main class="flex-1 p-8">
        <!-- Calendar Header -->
        <div class="flex justify-between items-center mb-8">
          <div></div>
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <div
                v-if="
                  auth.musHaveRole('Admin') ||
                  auth.musHaveRole('Staff') ||
                  (auth.musHaveRole('Dentist') && typeDoctor === 'PartTime')
                "
                class="relative rounded-full w-10 h-10 bg-blue-500 hover:cursor-pointer hover:bg-blue-600"
                @click="
                  () => {
                    if (auth.musHaveRole('Admin') || auth.musHaveRole('Staff')) {
                      showModalSizeLarge = true
                    } else if (auth.musHaveRole('Dentist') && typeDoctor === 'PartTime') {
                      showAddModal = true
                    }
                  }
                "
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
              <VaSelect v-model="currentYear" :options="years" class="w-[100px]" />
              <VaSelect v-model="currentMonthValue" :options="monthTexts" class="w-[100px]" />
            </div>
          </div>
        </div>
        <div class="grid gap-6">
          <div class="grid gap-6 lg:grid-cols-5">
            <div v-if="!hideSwitcher">
              <div class="mb-4">
                <VaButtonToggle
                  v-if="!hideSwitcher"
                  v-model="switcher"
                  preset="secondary"
                  class="mb-3"
                  border-color="primary"
                  :options="options"
                />
                <ul>
                  <li v-for="(dentist, index) in dentists?.data" :key="dentist.dentistUserID">
                    <div
                      class="flex items-center justify-between gap-2 hover:cursor-pointer mb-3"
                      @click="toggleDentistDetails(index)"
                    >
                      <div class="flex flex-row-2 gap-2">
                        <div class="w-fit">
                          <VaAvatar
                            :src="getSrcAvatar(dentist.dentistImage)"
                            class="w-14 h-14 font-bold"
                            :fallback-text="dentist.dentistName.charAt(0)?.toUpperCase()"
                            :color="avatarColor(dentist.dentistName)"
                          />
                        </div>
                        <div class="mt-1 w-full">
                          <p class="text-sm">{{ dentist.dentistName }}</p>
                          <p class="text-secondary">{{ workingTypeLabel(dentist.workingType) }}</p>
                        </div>
                      </div>
                      <div class="flex items-end justify-end cursor-pointer">
                        <VaIcon
                          size="large"
                          name="done_all"
                          color="#0081cf"
                          class="mr-2"
                          @click="AutoSetRoomForPartTime(dentist.calendarDetails)"
                        />
                        <VaIcon
                          name="chevron_right"
                          color="primary"
                          class="transform transition-transform duration-300 ease-in-out"
                          :class="{ 'rotate-90': openDentistIndex === index }"
                        />
                      </div>
                    </div>
                    <VaScrollContainer
                      v-if="openDentistIndex === index"
                      class="mt-2 space-y-2 md:min-h-[calc(100vh-435px)] lg:max-h-[calc(100vh-635px)] overflow-y-auto"
                      vertical
                      color="focus"
                    >
                      <div
                        v-for="(item, indexs) in dentist.calendarDetails"
                        :key="item.dentistUserID"
                        :class="[
                          'shadow-sm rounded-lg p-3 border transition-colors duration-200 mb-3',
                          selectedCalendarIndex.includes(indexs) && switcher === 'full-time'
                            ? '!bg-[#dcf5ff] !border-blue-500 !text-white'
                            : 'bg-white border-gray-200',
                          switcher === 'full-time' ? 'hover:cursor-move' : '',
                        ]"
                        :draggable="switcher === 'full-time' ? true : false"
                        @dragstart="handleDragStart($event, dentist, item, selectedCalendarIndex)"
                        @dragend="handleDragEnd"
                        @click="selectedCalendar(item, indexs)"
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
                        <div class="flex items-center justify-between">
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
                          <!-- <VaButton preset="secondary" size="small" class="mt-2" @click="addPartTimeSchedule">
                            Accpect!
                          </VaButton> -->
                        </div>
                      </div>
                    </VaScrollContainer>
                  </li>
                </ul>
              </div>
            </div>

            <div :class="[!hideSwitcher ? 'lg:col-span-4' : 'lg:col-span-5']">
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
                        <span v-if="isStaffOrAdmin" class="truncate"
                          >{{ event.roomName ? event.roomName : '' }} {{ event.dentistName }}</span
                        >
                        <span v-else class="truncate">
                          <span v-for="item in event.times" :key="item.timeID" class="flex m-2">
                            {{ event.roomName ? event.roomName : '' }} {{ formatTime(item.startTime) }} -
                            {{ formatTime(item.endTime) }}
                          </span>
                        </span>
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
                    Register Calendar
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
                  <!-- <h2 class="text-2xl font-bold mb-4">Doctor's Working Hours</h2> -->
                  <div class="schedule-inputs flex space-x-4 mb-4">
                    <div v-if="isStaffOrAdmin">
                      <VaOptionList
                        v-if="multiDrag === null"
                        v-model="listValue"
                        :options="optionsTimes"
                        value-by="altValue"
                        disabled-by="altDisabled"
                        :text-by="(option: any) => option.altText"
                      />
                      <div v-else class="flex flex-row gap-4">
                        <div v-for="item in multiDrag.items" :key="item.date" class="flex space-x-4">
                          <div class="flex flex-col space-y-2">
                            <span class="text-sm font-semibold">{{ formatDate(item.date) }}</span>
                            <VaOptionList
                              :model-value="getListValueForDate(item.date)"
                              :options="optionsTimes"
                              value-by="altValue"
                              disabled-by="altDisabled"
                              :text-by="(option: any) => option.altText"
                              @update:modelValue="(newValue: any) => updateListValueForDate(item.date, newValue)"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div v-else-if="auth.musHaveRole('Dentist') && typeDoctor === 'PartTime'">
                      <div class="flex flex-col space-y-2">
                        <VaDateInput v-model="newScheduleDate" label="Select Date" />
                        <VaOptionList
                          v-model="newScheduleTime"
                          :options="optionsTimes"
                          value-by="altValue"
                          disabled-by="altDisabled"
                          :text-by="(option: any) => option.altText"
                          class="flex-grow"
                        />
                        <!-- <VaButton preset="primary" :disabled="!canAddSchedule" @click="addPartTimeSchedule">
                          Add Schedule
                        </VaButton> -->
                      </div>
                      <div v-if="partTimeSchedules.length" class="mt-4">
                        <div
                          v-for="(schedule, index) in partTimeSchedules"
                          :key="index"
                          class="flex justify-between items-center p-2 border rounded mb-2"
                        >
                          <span>{{ formatDate(schedule.date) }} - {{ formatScheduleTime(schedule.time) }}</span>
                          <VaButton preset="secondary" size="small" @click="removePartTimeSchedule(index)">
                            Remove
                          </VaButton>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="schedule-actions flex space-x-4 justify-end">
                    <VaButton preset="primary" @click="saveSchedule"> Save Schedule </VaButton>
                  </div>
                </div>
              </div>

              <!-- Calendar Details Modal -->
              <div
                v-if="showDetailsModal && !showAddModal"
                class="fixed z-50 bg-white rounded-lg shadow-xl p-6 min-w-[300px] max-w-md"
                :style="detailsModalStyle"
              >
                <button class="absolute top-2 right-2 text-gray-400 hover:text-gray-600" @click="hideEventDetails">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div class="space-y-3">
                  <div class="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5 text-blue-500 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span class="text-sm font-medium text-gray-600">{{ formatDate(selectedEvent?.date) }}</span>
                  </div>
                  <div class="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5 text-green-500 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span class="text-sm font-medium text-gray-600"
                      >Working Status: {{ workingStatusLabel(selectedEvent?.workingStatus) }}</span
                    >
                  </div>
                  <div v-if="selectedEvent?.note" class="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5 text-yellow-500 mr-2 mt-0.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span class="text-sm text-gray-600">{{ selectedEvent.note }}</span>
                  </div>
                  <div class="mt-4">
                    <h4 class="text-sm font-semibold text-gray-700 mb-2">Working Hours</h4>
                    <div class="space-y-2">
                      <div
                        v-for="time in selectedEvent?.times"
                        :key="time.timeID"
                        class="flex items-center justify-between bg-gray-50 rounded-md p-2"
                      >
                        <div class="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-4 w-4 text-indigo-500 mr-2"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                              clip-rule="evenodd"
                            />
                          </svg>
                          <span class="text-sm text-gray-600"
                            >{{ formatTime(time.startTime) }} - {{ formatTime(time.endTime) }}</span
                          >
                        </div>
                        <span
                          :class="[
                            'text-xs font-medium px-2 py-1 rounded-full',
                            time.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
                          ]"
                        >
                          {{ time.isActive ? 'Active' : 'Inactive' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </VaCard>
    <VaModal v-model="showModalSizeLarge" size="large" hide-default-actions>
      <VaDataTable
        :items="listDoctors"
        :columns="[
          { key: 'imageUrl', name: 'imageUrl', label: 'Avatar' },
          { key: 'firstName', name: 'firstName', label: 'First Name' },
          { key: 'lastName', name: 'lastName', label: 'Last Name' },
          { key: 'phoneNumber', name: 'phoneNumber', label: 'Phone' },
          { key: 'gender', name: 'gender', label: 'Gender' },
          { key: 'actions', name: 'actions', label: 'Action', width: 80 },
        ]"
        :item-size="5"
        virtual-scroller
        :wrapper-size="500"
        height="500"
      >
        <template #cell(imageUrl)="{ rowData }">
          <VaAvatar
            :src="getSrcAvatar(rowData.imageUrl)"
            class="w-14 h-14 font-bold"
            :color="avatarColor(rowData.userName)"
          />
        </template>
        <template #cell(gender)="{ value }">
          {{ value ? 'Nam' : 'Nữ' }}
        </template>
        <template #cell(actions)="{ rowData }">
          <VaIcon
            v-if="rowData.doctorProfile.workingType === 2"
            class="text-6xl text-green-500 hover:cursor-pointer"
            name="schedule"
            size="2rem"
            @click="props.regist(rowData.id, current_date)"
          />
        </template>
      </VaDataTable>
    </VaModal>
  </VaInnerLoading>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { CalendarDay, PartTimeSchedule, SearchResponse } from '../types'
import { avatarColor, getErrorMessage, getSrcAvatar } from '@/services/utils'
import { watch } from 'vue'
import { useAuthStore } from '@/stores/modules/auth.module'
import { useToast } from 'vuestic-ui/web-components'
import { useCalendarStore } from '@/stores/modules/calendar.module'

const auth = useAuthStore()
const isStaffOrAdmin = auth.musHaveRole('Admin') || auth.musHaveRole('Staff')
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth())
const currentMonthValue = computed({
  get() {
    const foundMonth = months.find((month) => month.value === currentMonth.value)
    return foundMonth ? foundMonth.text : ''
  },
  set(newValue) {
    const foundMonth = months.find((month) => month.text === newValue)
    if (foundMonth) {
      currentMonth.value = foundMonth.value
    }
  },
})
const current_date = new Date().toISOString().split('T')[0]
const showAddModal = ref(false)
const hideSwitcher = ref(false)
const showModalSizeLarge = ref(false)
const newScheduleDate = ref<Date | null>(null)
const newScheduleTime = ref<string | null>(null)
const partTimeSchedules = ref<PartTimeSchedule[]>([])
const calendarStore = useCalendarStore()
const getAllRooms = ref<any>()
const loading = ref(false)
const closeAddModal = () => {
  showAddModal.value = false
  selectedDate.value = null
  draggedItem.value = null
  selectedDentistId.value = ''
  listValue.value = []
  multiDrag.value = null
  multiselectedDate.value = null
}
const { notify } = useToast()
const listDoctors = ref<any>()
const typeDoctor = computed(() => auth.user?.type)
const showDetailsModal = ref(false)
const modalPosition = ref({ x: 0, y: 0 })
const selectedDate = ref<Date | null>(null)
const multiselectedDate = ref<Date[] | null>(null)
const selectedEvent = ref<any | null>(null)
const selectedDentistId = ref('')
const switcher = ref('full-time')
const draggedItem = ref(null)
const multiDrag = ref<any>(null)
const isDragging = ref(false)
const showModal = ref(false)
const listValue = ref([])
const multiDragValues = ref<Record<string, string[]>>({})
const openDentistIndex = ref(null)
const selectedCalendarIndex = ref<number[]>([])
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
  getWorkingCalendar: (day: any, year: any) => void
  getFullTimeNon: (day: any, year: any) => void
  getPartTimeNon: (day: any, year: any) => void
  regist: (id: any, date: any) => void
  workingCalendar: SearchResponse | null
  fullTimeNon: SearchResponse | null
  partTimeNon: SearchResponse | null
}>()
const emit = defineEmits(['update:updateWorkingCalendar', 'update:regist'])

const years = Array.from({ length: 10 }, (_, i) => currentYear.value - 3 + i)
const months = [
  { value: 0, text: 'January' },
  { value: 1, text: 'February' },
  { value: 2, text: 'March' },
  { value: 3, text: 'April' },
  { value: 4, text: 'May' },
  { value: 5, text: 'June' },
  { value: 6, text: 'July' },
  { value: 7, text: 'August' },
  { value: 8, text: 'September' },
  { value: 9, text: 'October' },
  { value: 10, text: 'November' },
  { value: 11, text: 'December' },
]
const monthTexts = months.map((month) => month.text)
const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

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
    const dayEvents = [
      ...(props.workingCalendar?.data.flatMap((dentist) =>
        dentist.calendarDetails
          .filter((detail: any) => {
            const detailDate = new Date(detail.date)
            return (
              detailDate.getDate() === date &&
              detailDate.getMonth() === currentMonth.value &&
              detailDate.getFullYear() === currentYear.value
            )
          })
          .map((detail: any) => ({
            ...detail,
            dentistName: dentist.dentistName,
            dentistUserID: dentist.dentistUserID,
            type: isStaffOrAdmin ? (dentist.workingType === 1 ? 'warning' : 'usual') : 'usual',
          })),
      ) || []),
      ...(props.partTimeNon?.data.flatMap((dentist) =>
        dentist.calendarDetails
          .filter((detail: any) => {
            const detailDate = new Date(detail.date)
            return (
              detailDate.getDate() === date &&
              detailDate.getMonth() === currentMonth.value &&
              detailDate.getFullYear() === currentYear.value
            )
          })
          .map((detail: any) => ({
            ...detail,
            dentistName: dentist.dentistName,
            dentistUserID: dentist.dentistUserID,
            type: isStaffOrAdmin ? (detail.workingStatus === 0 ? 'error' : 'warning') : 'warning',
          })),
      ) || []),
    ]

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

const getAllDoctors = (): any => {
  calendarStore
    .getDoctorHasNoCalendar('2025-01-20')
    .then((response) => {
      console.log(response)
      listDoctors.value = response
    })
    .catch((error) => {
      const message = getErrorMessage(error)
      notify({
        title: 'error',
        message: message,
        color: 'danger',
      })
    })
}

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
  console.log(auth.user?.type)
  if (auth.user?.type !== 'PartTime') {
    return
  }
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

function showEventDetails(event: Event, e: MouseEvent) {
  modalPosition.value = {
    x: e.clientX,
    y: e.clientY,
  }
  if (showAddModal.value) {
    modalPosition.value = {
      x: 0,
      y: 0,
    }
  }
  selectedEvent.value = event
  showDetailsModal.value = true
}

function hideEventDetails() {
  showDetailsModal.value = false
  modalPosition.value = {
    x: 0,
    y: 0,
  }
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

function toggleDentistDetails(index: any) {
  openDentistIndex.value = openDentistIndex.value === index ? null : index
}

function selectedCalendar(item: any, index: number) {
  if (selectedCalendarIndex.value.includes(index)) {
    selectedCalendarIndex.value = selectedCalendarIndex.value.filter((i) => i !== index)
  } else {
    selectedCalendarIndex.value.push(index)
    console.log(selectedCalendarIndex.value)
  }
}

function getListValueForDate(date: any) {
  return multiDragValues.value[date] || []
}

function updateListValueForDate(date: any, newValue: string[]) {
  console.log(date, newValue)
  multiDragValues.value[date] = newValue
  console.log(multiDragValues.value)
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

const formatScheduleTime = (time: any): string => {
  if (Array.isArray(time) && time.length > 0) {
    return time[0]
  }

  return ''
}

const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':')
  return `${hours}:${minutes}`
}

function handleDragStart(event: DragEvent, dentist: any, item: any, selectedCalendarIndex: any) {
  if (selectedCalendarIndex === null || selectedCalendarIndex.length === 0) {
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
  } else {
    const request = {
      dentist,
      items: selectedCalendarIndex.map((index: number) => dentist.calendarDetails[index]),
    }
    multiDrag.value = request
    isDragging.value = true
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', JSON.stringify(request))
    }
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
  } else if (multiDrag.value) {
    const item = JSON.parse(event.dataTransfer?.getData('text/plain') || '')
    selectedDentistId.value = item.dentist.dentistUserID
    multiselectedDate.value = item.items.map((item: any) => item.date)
    console.log(multiselectedDate.value)
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
  if (auth.musHaveRole('Staff') || auth.musHaveRole('Admin')) {
    if (multiDrag.value === null) {
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
    } else {
      emit(
        'update:updateWorkingCalendar',
        selectedDentistId.value,
        multiselectedDate.value?.map((date: any) => ({
          date,
          timeWorkings: multiDragValues.value[date].map((timeRange: string) => {
            const [startTime, endTime] = timeRange.split('-')
            return {
              startTime,
              endTime,
            }
          }),
        })),
      )
    }
    showModal.value = true
    showAddModal.value = false
    selectedDate.value = null
    draggedItem.value = null
    selectedDentistId.value = ''
    listValue.value = []
    multiDrag.value = null
    multiselectedDate.value = null
    selectedCalendarIndex.value = []
  } else if (auth.musHaveRole('Dentist') && typeDoctor.value === 'PartTime') {
    emit(
      'update:updateWorkingCalendar',
      auth.user?.id,
      partTimeSchedules.value.map((schedule) => ({
        date: formatDateSend(schedule.date),
        timeWorkings: (() => {
          const timeString = Array.isArray(schedule.time)
            ? schedule.time[0] // Take first element if it's an array
            : schedule.time // Use as-is if it's already a string

          const [startTime, endTime] = timeString.split('-')
          return [
            {
              startTime,
              endTime,
            },
          ]
        })(),
      })),
    )
    showAddModal.value = false
    newScheduleDate.value = null
    newScheduleTime.value = null
  }
}

// const canAddSchedule = computed(() => {
//   return newScheduleDate.value && newScheduleTime.value
// })

function formatDateSend(date: any) {
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

  return `${year}-${month}-${day}`
}

// Method to add part-time schedule
const addPartTimeSchedule = () => {
  if (newScheduleDate.value && newScheduleTime.value) {
    // Check for duplicate schedules
    const isDuplicate = partTimeSchedules.value.some(
      (schedule) =>
        schedule.date.toDateString() === newScheduleDate.value?.toDateString() &&
        schedule.time === newScheduleTime.value,
    )

    if (!isDuplicate) {
      partTimeSchedules.value.push({
        date: newScheduleDate.value,
        time: newScheduleTime.value,
      })

      // Reset inputs after adding
      newScheduleDate.value = null
      newScheduleTime.value = null
    } else {
      // Optional: Show a toast or error message about duplicate schedule
      console.warn('This schedule already exists')
    }
  }
}

// Method to remove a part-time schedule
const removePartTimeSchedule = (index: number) => {
  partTimeSchedules.value.splice(index, 1)
}

function getAllRoom() {
  calendarStore.getAllRoom({}).then((response) => {
    getAllRooms.value = response.data
    console.log('get all', getAllRooms.value)
  })
}

async function AutoSetRoomForPartTime(calendars: any) {
  loading.value = true
  const roomAssignments = calendars.map((calendar: any) => calendar.calendarID)
  await calendarStore
    .addRoom(roomAssignments)
    .then(() => {
      notify({
        title: 'Thành công',
        message: 'Phân lịch thành công!',
        color: 'success',
      })
      loading.value = false
    })
    .catch((error) => {
      const errorMessage = getErrorMessage(error)
      notify({
        title: 'error',
        message: errorMessage,
        color: 'danger',
      })
      loading.value = false
    })
    .finally(() => {
      loading.value = false
    })
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

watch(
  [() => newScheduleTime.value, () => newScheduleDate.value],
  ([time, date]) => {
    // Reset disabled states when either time or date changes
    optionsTimes.forEach((option) => {
      if (time?.length === 1) {
        if (option.altValue !== time[0]) {
          option.disabled = true
          option.altDisabled = true
        } else {
          option.disabled = false
          option.altDisabled = false
        }
      } else {
        option.disabled = false
        option.altDisabled = false
      }
    })

    // Only call addPartTimeSchedule when BOTH time and date are set
    if (time && date) {
      addPartTimeSchedule()
    }
  },
  { immediate: false }, // Prevents running on initial load
)

watch(
  () => [currentMonth.value, currentYear.value],
  ([newMonth, newYear]) => {
    currentMonth.value = newMonth
    currentYear.value = newYear
    const firstDay = new Date(currentYear.value, currentMonth.value, 2).toISOString().split('T')[0]
    const lastDay = new Date(currentYear.value, currentMonth.value + 1, 1).toISOString().split('T')[0]
    props.getWorkingCalendar(firstDay, lastDay)
    props.getFullTimeNon(firstDay, lastDay)
    props.getPartTimeNon(firstDay, lastDay)
  },
  { immediate: false },
)

onMounted(() => {
  if (typeDoctor.value === 'FullTime') {
    switcher.value = 'full-time'
  } else if (typeDoctor.value === 'PartTime') {
    switcher.value = 'part-time'
  } else {
    switcher.value = 'full-time'
  }
  const auth = useAuthStore()
  if (auth.musHaveRole('Admin') || auth.musHaveRole('Staff')) {
    hideSwitcher.value = false
  } else {
    hideSwitcher.value = true
  }
  getAllDoctors()
  getAllRoom()
  console.log(auth.musHaveRole('Dentist'), auth.user?.type)
})
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
