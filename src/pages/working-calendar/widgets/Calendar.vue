<template>
  <VaInnerLoading :loading="loading">
    <VaCard class="flex min-h-screen">
      <main class="flex-1 p-4 md:p-8">
        <!-- Calendar Header -->
        <div class="flex flex-col md:flex-row justify-between items-center mb-4 md:mb-8">
          <div class="mb-4 md:mb-0"></div>
          <div class="flex items-center gap-2 md:gap-4">
            <div class="flex items-center gap-2">
              <span
                class="material-symbols-outlined bg-blue-500 hover:cursor-pointer hover:bg-blue-600 p-2 rounded-full"
                :class="{ 'animate-spin': loading }"
                @click="export_calendar"
              >
                {{ loading ? 'circle' : 'file_export' }}
              </span>
              <div
                v-if="
                  auth.musHaveRole('Admin') ||
                  auth.musHaveRole('Staff') ||
                  (auth.musHaveRole('Dentist') && typeDoctor === 'PartTime')
                "
                class="relative rounded-full w-10 h-10 bg-blue-500 hover:cursor-pointer hover:bg-blue-600"
                @click="toggleCalendarEdit"
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
              <VaSelect v-model="currentYear" :options="years" class="w-[100px] md:w-[100px]" />
              <VaSelect v-model="currentMonthValue" :options="monthTexts" class="w-[130px] md:w-[130px]" />
            </div>
          </div>
        </div>
        <div class="grid gap-4 md:gap-6">
          <div class="grid gap-4 md:gap-6 md:grid-cols-5">
            <div v-if="!hideSwitcher" class="md:col-span-1">
              <div class="mb-4">
                <VaButtonToggle
                  v-if="!hideSwitcher"
                  v-model="switcher"
                  preset="secondary"
                  class="mb-3 w-full"
                  border-color="primary"
                  :options="options"
                />
                <ul class="space-y-2">
                  <li v-for="(dentist, index) in dentists?.data" :key="dentist.dentistUserID">
                    <div
                      class="flex items-center justify-between gap-2 hover:cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                      @click="toggleDentistDetails(index)"
                    >
                      <div class="flex items-center gap-2">
                        <VaAvatar
                          :src="getSrcAvatar(dentist.dentistImage)"
                          class="w-10 h-10 md:w-14 md:h-14 font-bold"
                          :fallback-text="dentist.dentistName.charAt(0)?.toUpperCase()"
                          :color="avatarColor(dentist.dentistName)"
                        />
                        <div>
                          <p class="text-sm font-medium">{{ dentist.dentistName }}</p>
                          <p class="text-xs text-secondary">{{ workingTypeLabel(dentist.workingType) }}</p>
                        </div>
                      </div>
                      <div class="flex items-center">
                        <VaButton
                          round
                          icon="done_all"
                          color="#0081cf"
                          preset="secondary"
                          @click="AutoSetRoomForPartTime(dentist.calendarDetails)"
                        />
                        <VaIcon
                          name="chevron_right"
                          color="primary"
                          size="small"
                          class="transform transition-transform duration-300 ease-in-out"
                          :class="{ 'rotate-90': openDentistIndex === index }"
                        />
                      </div>
                    </div>
                    <VaScrollContainer
                      v-if="openDentistIndex === index"
                      class="mt-2 space-y-2 max-h-[300px] md:max-h-[calc(100vh-400px)] overflow-y-auto"
                      vertical
                      color="focus"
                    >
                      <VaCard
                        v-for="(item, indexs) in dentist.calendarDetails"
                        :key="item.dentistUserID"
                        :class="[
                          'shadow-sm rounded-lg p-3 border transition-colors duration-200 mb-3',
                          selectedCalendarIndex.includes(indexs) && switcher === 'full-time'
                            ? '!bg-[#06181f] !border-blue-500 !text-white'
                            : 'border-gray-200 dark:border-green-500',
                          switcher === 'full-time' ? 'hover:cursor-move' : '',
                        ]"
                        :draggable="switcher === 'full-time' ? true : false"
                        @dragstart="handleDragStart($event, dentist, item, selectedCalendarIndex)"
                        @dragend="handleDragEnd"
                        @click="selectedCalendar(item, indexs)"
                      >
                        <div class="flex items-center justify-between">
                          <div class="flex items-center space-x-3">
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
                            <span class="text-sm font-medium">{{ formatDate(item.date) }}</span>
                          </div>
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
                        <div class="flex items-center justify-between">
                          <div class="mt-2 text-sm italic">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              class="h-4 w-4 inline-block mr-2"
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
                      </VaCard>
                    </VaScrollContainer>
                  </li>
                </ul>
              </div>
            </div>

            <div :class="[!hideSwitcher ? 'md:col-span-4' : 'md:col-span-5']">
              <!-- Calendar Grid -->
              <div class="relative border rounded-lg shadow overflow-hidden">
                <!-- Days Header -->
                <div class="grid grid-cols-7 border-b">
                  <div v-for="day in weekDays" :key="day" class="py-2 text-center text-xs md:text-sm text-gray-600">
                    {{ day }}
                  </div>
                </div>

                <!-- Calendar Days -->
                <div class="grid grid-cols-7 grid-rows-auto">
                  <VaCard
                    v-for="(day, index) in calendarDays"
                    :key="index"
                    class="min-h-[60px] md:min-h-[120px] border-b border-r p-1 md:p-2 relative group"
                    :class="{ 'bg-blue-100': isCalendarEditable && isDaySelected(day) }"
                    @click="isCalendarEditable ? selectDay(day) : openDayDetailsModal(day)"
                    @contextmenu.prevent="openAddEventModal($event, day)"
                    @dragover.prevent
                    @drop="handleDrop($event)"
                  >
                    <span :class="{ 'text-gray-400': !day.isCurrentMonth }" class="text-xs md:text-sm">
                      {{ day.date }}
                    </span>

                    <!-- Events (hidden when editing) -->
                    <div
                      v-if="!isCalendarEditable"
                      class="mt-1 md:mt-2 space-y-1 max-h-[40px] md:max-h-[80px] overflow-y-auto"
                    >
                      <div
                        v-for="event in day.events"
                        :key="event.id"
                        class="text-[10px] md:text-xs p-1 rounded cursor-pointer flex items-center gap-1"
                        :class="getEventClass(event.type)"
                        draggable="true"
                        @mouseenter="showEventDetails(event, $event)"
                        @mouseleave="hideEventDetails"
                      >
                        <div
                          :class="getEventDotClass(event.type)"
                          class="w-1 h-1 md:w-2 md:h-2 rounded-full flex-shrink-0"
                        ></div>
                        <span v-if="isStaffOrAdmin" class="truncate"
                          >{{ event.roomName ? event.roomName : '' }} {{ event.dentistName }}</span
                        >
                        <span v-else class="truncate">
                          <span v-for="item in event.times" :key="item.timeID" class="flex m-1 md:m-2">
                            {{ event.roomName ? event.roomName : '' }} {{ formatTime(item.startTime) }} -
                            {{ formatTime(item.endTime) }}
                          </span>
                        </span>
                      </div>
                    </div>

                    <!-- OptionList for editing (visible when editing) -->
                    <div
                      v-if="isCalendarEditable && day.isCurrentMonth && !dayHasSchedule(day)"
                      class="absolute inset-0 bg-opacity-50 flex items-center justify-center"
                    >
                      <VaOptionList
                        v-model="selectedTimes[getDateKey(day)]"
                        :options="getOptionsForDate(getDateKey(day))"
                        value-by="altValue"
                        disabled-by="altDisabled"
                        :text-by="(option: any) => option.altText"
                        class="p-2 rounded"
                      />
                    </div>
                  </VaCard>
                  <div
                    v-if="isDragging"
                    class="absolute inset-0 bg-blue-100 bg-opacity-50 border-2 border-blue-500 border-dashed z-50 flex items-center justify-center pointer-events-none"
                  >
                    <span class="text-blue-600 font-semibold">Drop Here</span>
                  </div>
                </div>
              </div>

              <VaButton
                v-if="isCalendarEditable"
                preset="primary"
                class="fixed bottom-4 right-4 z-50"
                @click="saveSchedule"
              >
                Save Changes
              </VaButton>

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
              <VaCard
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
                              :options="optionsTimesByDate[item.date] || optionsTimes"
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
                        <VaDateInput
                          v-model="newScheduleDate"
                          :format="formatDateInput"
                          :parse="parseDate"
                          label="Select Date"
                        />
                        <VaOptionList
                          v-model="newScheduleTime"
                          :options="optionsTimes"
                          value-by="altValue"
                          disabled-by="altDisabled"
                          :text-by="(option: any) => option.altText"
                          class="flex-grow"
                        />
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
              </VaCard>

              <!-- Calendar Details Modal -->
              <VaCard
                v-if="showDetailsModal && !showAddModal"
                class="fixed z-50 rounded-lg shadow-xl p-6 min-w-[300px] max-w-md"
                :style="detailsModalStyle"
              >
                <button class="absolute top-2 right-2" @click="hideEventDetails">
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
                    <span class="text-sm font-medium">{{ formatDate(selectedEvent?.date) }}</span>
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
                    <span class="text-sm font-medium"
                      >{{ t('calendar.working_status') }}: {{ workingStatusLabel(selectedEvent?.workingStatus) }}</span
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
                    <span class="text-sm">{{ selectedEvent.note }}</span>
                  </div>
                  <div class="mt-4">
                    <h4 class="text-sm font-semibold mb-2">{{ t('calendar.working_hours') }}</h4>
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
              </VaCard>

              <!-- Mobile Day Details Modal -->
              <VaModal
                v-model="showMobileDayModal"
                :title="formatDate(selectedDate)"
                hide-default-actions
                close-button
                class="mobile-day-modal"
              >
                <div class="p-4 mobile-day-modal-content">
                  <div v-if="selectedDayEvents.length === 0" class="text-center">No events for this day</div>
                  <div v-else class="space-y-4">
                    <div v-for="event in selectedDayEvents" :key="event.id" class="border-b pb-4">
                      <div class="flex justify-between items-center">
                        <span class="font-semibold">{{ event.dentistName }}</span>
                        <span :class="getEventClass(event.type)" class="px-2 py-1 rounded-full text-xs">
                          {{ workingStatusLabel(event.workingStatus) }}
                        </span>
                      </div>
                      <div v-for="time in event.times" :key="time.timeID" class="text-sm">
                        {{ formatTime(time.startTime) }} - {{ formatTime(time.endTime) }}
                      </div>
                      <div v-if="event.note" class="text-sm mt-2">Note: {{ event.note }}</div>
                    </div>
                  </div>
                </div>
              </VaModal>
            </div>
          </div>
        </div>
      </main>
    </VaCard>
    <VaModal v-model="showModalSizeLarge" size="large" hide-default-actions>
      <VaDataTable
        :items="listDoctors"
        :columns="doctor_column"
        :item-size="5"
        virtual-scroller
        :wrapper-size="500"
        height="500"
        :no-data-html="t('calendar.doctor_table.no_items_found')"
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
          <VaButton
            v-if="rowData.doctorProfile.workingType === 2"
            round
            class="text-6xl hover:cursor-pointer"
            preset="secondary"
            hover-behavior="opacity"
            :hover-opacity="0.4"
            color="success"
            icon="schedule"
            @click="
              () => {
                props
                  .regist(rowData.id, formatDateSend(new Date(currentYear, currentMonth, 1).toISOString()))
                  .then(() => {
                    getAllDoctors()
                  })
                  .catch((error) => {
                    const errorMessage = getErrorMessage(error)
                    notify({
                      title: 'error',
                      message: errorMessage,
                      color: 'danger',
                    })
                  })
              }
            "
          />
          <VaButton
            v-if="rowData.doctorProfile.workingType === 1"
            round
            preset="secondary"
            hover-behavior="opacity"
            :hover-opacity="0.4"
            class="text-6xl hover:cursor-pointer"
            color="success"
            icon="notification_important"
            @click="
              () => {
                props.reminder(rowData.id, formatDateSend(new Date(currentYear, currentMonth, 1).toISOString()))
              }
            "
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
import { DateInputModelValue, DateInputValue } from 'vuestic-ui/dist/types/components/va-date-input/types'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'

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
// const current_date = new Date().toISOString().split('T')[0]
const showAddModal = ref(false)
const hideSwitcher = ref(false)
const showModalSizeLarge = ref(false)
const newScheduleDate = ref<Date | null>(null)
const newScheduleTime = ref<string | null>(null)
const partTimeSchedules = ref<PartTimeSchedule[]>([])
const calendarStore = useCalendarStore()
const { update } = storeToRefs(calendarStore)
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
const { t } = useI18n()
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
const showMobileDayModal = ref(false)
const selectedDayEvents = ref<any[]>([])

// New refs for calendar editing
const isCalendarEditable = ref(false)
const selectedTimes = ref<Record<string, string[]>>({})
const selectedDays = ref<CalendarDay[]>([])
const optionsState = ref(new Map<string, typeof optionsTimes>())

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
const doctor_column = computed(() => [
  { key: 'imageUrl', name: 'imageUrl', label: t('calendar.doctor_table.avatar') },
  { key: 'firstName', name: 'firstName', label: t('calendar.doctor_table.first_name') },
  { key: 'lastName', name: 'lastName', label: t('calendar.doctor_table.last_name') },
  { key: 'phoneNumber', name: 'phoneNumber', label: t('calendar.doctor_table.phone') },
  { key: 'gender', name: 'gender', label: t('calendar.doctor_table.gender') },
  { key: 'actions', name: 'actions', label: t('calendar.doctor_table.action'), width: 80 },
])
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
  regist: (id: any, date: any) => Promise<void>
  reminder: (id: any, date: any) => void
  fetch: () => void
  load: boolean
  workingCalendar: SearchResponse | null
  fullTimeNon: SearchResponse | null
  partTimeNon: SearchResponse | null
}>()
const emit = defineEmits(['update:updateWorkingCalendar', 'update:regist', 'update:GetNewWorkingCalendar'])

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

  const isStaffOrAdmin = auth.musHaveRole('Admin') || auth.musHaveRole('Staff')
  // const isDentist = auth.musHaveRole('Dentist')

  // Helper function to get events for a specific date
  const getDayEvents = (date: number, month: number, year: number) => {
    if (isStaffOrAdmin) {
      const workingCalendarEvents =
        props.workingCalendar?.data.flatMap((dentist) =>
          dentist.calendarDetails
            .filter((detail: any) => {
              const detailDate = new Date(detail.date)
              return (
                detailDate.getDate() === date && detailDate.getMonth() === month && detailDate.getFullYear() === year
              )
            })
            .map((detail: any) => ({
              ...detail,
              dentistName: dentist.dentistName,
              dentistUserID: dentist.dentistUserID,
              type: isStaffOrAdmin ? (dentist.workingType === 1 ? 'warning' : 'usual') : 'usual',
            })),
        ) || []

      const partTimeEvents =
        props.partTimeNon?.data.flatMap((dentist) =>
          dentist.calendarDetails
            .filter((detail: any) => {
              const detailDate = new Date(detail.date)
              return (
                detailDate.getDate() === date && detailDate.getMonth() === month && detailDate.getFullYear() === year
              )
            })
            .map((detail: any) => ({
              ...detail,
              dentistName: dentist.dentistName,
              dentistUserID: dentist.dentistUserID,
              type: isStaffOrAdmin ? (detail.workingStatus === 0 ? 'error' : 'warning') : 'warning',
            })),
        ) || []

      return [...workingCalendarEvents, ...partTimeEvents]
    } else {
      if (typeDoctor.value === 'PartTime') {
        return (
          props.workingCalendar?.data.flatMap((dentist) =>
            dentist.calendarDetails
              .filter((detail: any) => {
                const detailDate = new Date(detail.date)
                return (
                  detailDate.getDate() === date && detailDate.getMonth() === month && detailDate.getFullYear() === year
                )
              })
              .map((detail: any) => ({
                ...detail,
                dentistName: dentist.dentistName,
                dentistUserID: dentist.dentistUserID,
                type: detail.workingStatus === 0 ? 'error' : 'usual',
              })),
          ) || []
        )
      } else {
        return (
          props.workingCalendar?.data.flatMap((dentist) =>
            dentist.calendarDetails
              .filter((detail: any) => {
                const detailDate = new Date(detail.date)
                return (
                  detailDate.getDate() === date && detailDate.getMonth() === month && detailDate.getFullYear() === year
                )
              })
              .map((detail: any) => ({
                ...detail,
                dentistName: dentist.dentistName,
                dentistUserID: dentist.dentistUserID,
                type: detail.workingStatus === 0 ? '' : 'usual',
              })),
          ) || []
        )
      }
    }
  }

  // Previous month days
  const prevMonthDays = firstDay.getDay()
  const prevMonth = new Date(currentYear.value, currentMonth.value - 1, 0)
  const prevMonthValue = currentMonth.value - 1
  const prevYearValue = prevMonthValue < 0 ? currentYear.value - 1 : currentYear.value

  for (let i = prevMonthDays - 1; i >= 0; i--) {
    const date = prevMonth.getDate() - i
    days.push({
      date,
      isCurrentMonth: false,
      events: getDayEvents(date, prevMonthValue < 0 ? 11 : prevMonthValue, prevYearValue),
    })
  }

  // Current month days
  for (let date = 1; date <= lastDay.getDate(); date++) {
    days.push({
      date,
      isCurrentMonth: true,
      events: getDayEvents(date, currentMonth.value, currentYear.value),
    })
  }

  // Next month days
  const remainingDays = 42 - days.length
  const nextMonthValue = currentMonth.value + 1
  const nextYearValue = nextMonthValue > 11 ? currentYear.value + 1 : currentYear.value

  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      date: i,
      isCurrentMonth: false,
      events: getDayEvents(i, nextMonthValue > 11 ? 0 : nextMonthValue, nextYearValue),
    })
  }

  return days
})

const getAllDoctors = (): any => {
  loading.value = true
  const date = formatDateSend(new Date(currentYear.value, currentMonth.value, 1).toISOString())
  calendarStore
    .getDoctorHasNoCalendar(date)
    .then((response) => {
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
    .finally(() => {
      loading.value = false
    })
}

const toggleCalendarEdit = () => {
  if (auth.musHaveRole('Admin') || auth.musHaveRole('Staff')) {
    getAllDoctors()
    showModalSizeLarge.value = true
  } else if (auth.musHaveRole('Dentist') && typeDoctor.value === 'PartTime') {
    isCalendarEditable.value = !isCalendarEditable.value
    if (isCalendarEditable.value) {
      // Initialize only current month days with empty arrays when entering edit mode
      calendarDays.value.forEach((day) => {
        if (day.isCurrentMonth) {
          const dateKey = getDateKey(day)
          if (!selectedTimes.value[dateKey]) {
            selectedTimes.value[dateKey] = []
          }
        }
      })
    } else {
      selectedDays.value = []
      selectedTimes.value = {}

      // Reset options state
      optionsState.value = new Map()
    }
  }
}

const selectDay = (day: CalendarDay) => {
  if (!day.isCurrentMonth) return
  const dateKey = getDateKey(day)
  if (isDaySelected(day)) {
    selectedDays.value = selectedDays.value.filter((d) => getDateKey(d) !== dateKey)
    delete selectedTimes.value[dateKey]
  } else {
    selectedDays.value.push(day)
    if (!selectedTimes.value[dateKey]) {
      selectedTimes.value[dateKey] = []
    }
  }
}

const isDaySelected = (day: CalendarDay) => {
  return day.isCurrentMonth && selectedDays.value.some((d) => getDateKey(d) === getDateKey(day))
}

const dayHasSchedule = (day: CalendarDay) => {
  return day.events.length > 0
}

const getDateKey = (day: CalendarDay) => {
  return `${currentYear.value}-${currentMonth.value + 1}-${day.date}-${day.isCurrentMonth ? 'current' : 'other'}`
}

const getOptionsForDate = (dateKey: string) => {
  if (!optionsState.value.has(dateKey)) {
    // const selectedDatesCount = Object.values(selectedTimes.value).filter((times) => times.length > 0).length

    // if (selectedDatesCount >= MAX_SELECTED_DAYS) {
    //   return optionsTimes.map((option) => ({
    //     ...option,
    //     disabled: true,
    //     altDisabled: true,
    //   }))
    // }
    // return optionsTimes
    return optionsTimes
  }

  return optionsState.value.get(dateKey)
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
  }
}

function getListValueForDate(date: any) {
  return multiDragValues.value[date] || []
}

const optionsTimesByDate = ref<{ [key: string]: typeof optionsTimes }>({})

const createOptionsForDate = (date: string) => {
  optionsTimesByDate.value[date] = JSON.parse(JSON.stringify(optionsTimes))
}

function updateListValueForDate(date: any, newValue: string[]) {
  multiDragValues.value[date] = newValue
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

const formatDateInput = (date: DateInputModelValue): string => {
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

const parseDate = (dateStr: string): DateInputValue => {
  if (!dateStr) return null

  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? null : date
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
    const schedules = Object.entries(selectedTimes.value)
      .filter(([, times]) => times.length > 0)
      .map(([dateKey, times]) => {
        const [year, month, day] = dateKey.split('-').map(Number)
        return {
          date: formatDateSend(new Date(year, month - 1, day)),
          timeWorkings: times.map((timeRange: string) => {
            const [startTime, endTime] = timeRange.split('-')
            return { startTime, endTime }
          }),
        }
      })

    emit('update:updateWorkingCalendar', auth.user?.id, schedules)
    isCalendarEditable.value = false
    selectedDays.value = []
    selectedTimes.value = {}
  }
}

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
  loading.value = true
  calendarStore
    .getAllRoom({})
    .then((response) => {
      getAllRooms.value = response.data
    })
    .finally(() => {
      loading.value = false
    })
}

async function AutoSetRoomForPartTime(calendars: any) {
  loading.value = true
  const roomAssignments = calendars.map((calendar: any) => calendar.calendarID)
  await calendarStore
    .addRoom(roomAssignments)
    .then(() => {
      notify({
        title: 'success',
        message: t('calendar.schedule_success'),
        color: 'success',
      })
      const firstDay = new Date(currentYear.value, currentMonth.value, 2).toISOString().split('T')[0]
      const lastDay = new Date(currentYear.value, currentMonth.value + 1, 1).toISOString().split('T')[0]
      props.getWorkingCalendar(firstDay, lastDay)
      if (switcher.value === 'full-time') {
        props.getFullTimeNon(firstDay, lastDay)
      } else {
        props.getPartTimeNon(firstDay, lastDay)
      }
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

const openDayDetailsModal = (day: CalendarDay) => {
  if (window.innerWidth < 768) {
    selectedDate.value = new Date(currentYear.value, currentMonth.value, day.date)
    selectedDayEvents.value = day.events
    showMobileDayModal.value = true
  } else {
    if (day.events.length > 0) {
      selectedEvent.value = day.events[0]
      selectedDate.value = new Date(currentYear.value, currentMonth.value, day.date)
      selectedDayEvents.value = day.events
      showMobileDayModal.value = true
    } else {
      openAddEventModal({ clientX: 0, clientY: 0 } as MouseEvent, day)
    }
  }
}

const export_calendar = () => {
  loading.value = true
  const firstDay = new Date(currentYear.value, currentMonth.value, 2).toISOString().split('T')[0]
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 1).toISOString().split('T')[0]
  calendarStore
    .exportCalendar(firstDay, lastDay)
    .then((response) => {
      console.log(response)
      const url = window.URL.createObjectURL(
        new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      )
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'calendar.xlsx')
      document.body.appendChild(link)
      link.click()

      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
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
  update,
  () => {
    if (update) {
      console.log('update')
      props.fetch()
    }
  },
  { immediate: true },
)

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
  () => multiDragValues.value,
  (newValues) => {
    console.log(newValues)

    // For each date in newValues, ensure we have options created
    Object.keys(newValues).forEach((date) => {
      if (!optionsTimesByDate.value[date]) {
        createOptionsForDate(date)
      }

      // Reset options for this date
      optionsTimesByDate.value[date].forEach((option) => {
        option.disabled = false
        option.altDisabled = false
      })

      // If this date has 2 or more selections, disable unselected options
      const dateValues = newValues[date]
      if (dateValues.length >= 2) {
        optionsTimesByDate.value[date].forEach((option) => {
          if (!dateValues.includes(option.altValue)) {
            option.disabled = true
            option.altDisabled = true
          }
        })
      }
    })
  },
  { deep: true },
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

// const MAX_SELECTED_DAYS = 5

// watch(
//   selectedTimes.value,
//   (newSelectedTimes) => {
//     // Create a Map to store options state for each date
//     const optionsPerDate = new Map<string, typeof optionsTimes>()

//     // Count dates with selections
//     const selectedDatesCount = Object.entries(newSelectedTimes).filter(([, times]) => times.length > 0).length

//     // Process each date's selections
//     Object.entries(newSelectedTimes).forEach(([dateKey, selectedOptions]) => {
//       // Create a copy of options for this date
//       const dateOptions = optionsTimes.map((option) => ({ ...option }))

//       // If this date has selections
//       if (selectedOptions.length > 0) {
//         if (selectedOptions.length === 1) {
//           dateOptions.forEach((option) => {
//             if (option.altValue !== selectedOptions[0]) {
//               option.disabled = true
//               option.altDisabled = true
//             }
//           })
//         }
//       } else {
//         // If we've reached the maximum number of days and this date has no selections,
//         // disable all options for this date
//         if (selectedDatesCount >= MAX_SELECTED_DAYS) {
//           dateOptions.forEach((option) => {
//             option.disabled = true
//             option.altDisabled = true
//           })
//         } else {
//           // Otherwise, enable all options
//           dateOptions.forEach((option) => {
//             option.disabled = false
//             option.altDisabled = false
//           })
//         }
//       }

//       // Store the options state for this date
//       optionsPerDate.set(dateKey, dateOptions)
//     })

//     // Update your component's data structure to use these per-date options
//     optionsState.value = optionsPerDate
//   },
//   { deep: true },
// )

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

watch(
  () => props.load,
  () => {
    if (props.load) {
      loading.value = true
    } else {
      loading.value = false
    }
  },
  { deep: true },
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

.mobile-day-modal {
  max-height: 100vh;
  display: flex;
  flex-direction: column;
}

.mobile-day-modal-content {
  flex-grow: 1;
  overflow-y: auto;
}
</style>
