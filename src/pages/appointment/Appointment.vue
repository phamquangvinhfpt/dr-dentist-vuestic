<template>
  <VaInnerLoading :loading="loading">
    <VaCard class="md:h-screen grid grid-cols-1 md:flex md:flex-col">
      <VaCard class="border-b p-4" :style="{ marginRight: !isMobile ? `${scrollbarWidth}px` : `` }">
        <div class="grid md:flex items-center justify-between">
          <div class="grid grid-cols-1 md:flex md:items-center md:space-x-4 gap-4">
            <VaDateInput
              v-model="selectedDate"
              :format="formatDate"
              :parse="parseDate"
              manual-input
              class="w-full px-3 py-1.5"
              clearable
            />
            <div
              v-if="filteredTypes.length > 0"
              class="w-full inline-flex rounded-lg border bg-gray-50 dark:bg-gray-800 dark:border-gray-700 p-1"
            >
              <button
                v-for="type in filteredTypes"
                :key="type.id"
                :class="[
                  'w-full px-3 py-1.5 text-sm font-medium transition-colors rounded-md',
                  isAppointment === type.id
                    ? 'dark:bg-gray-700 shadow dark:shadow-lg'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700',
                ]"
                @click="isAppointment = type.id"
              >
                {{ type.label }}
              </button>
            </div>
          </div>

          <div class="grid md:flex items-center space-x-4" :class="isMobile ? 'hidden' : ''">
            <div
              v-if="!role?.includes('Patient')"
              class="inline-flex rounded-lg border bg-gray-50 dark:bg-gray-800 dark:border-gray-700 p-1"
            >
              <button
                v-for="view in views"
                :key="view.id"
                :class="[
                  'px-3 py-1.5 text-sm font-medium transition-colors rounded-md',
                  currentView === view.id
                    ? 'bg-white dark:bg-gray-700 shadow dark:shadow-lg'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700',
                ]"
                @click="currentView = view.id"
              >
                <span class="material-symbols-outlined text-gray-700 dark:text-gray-200"> {{ view.label }} </span>
              </button>
            </div>
            <button
              v-if="role?.includes('Staff') || role?.includes('Admin')"
              class="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
              @click="openCreateAppointmentDialog"
            >
              Create Appointment
            </button>
          </div>
        </div>
      </VaCard>
      <div v-if="currentView === 'calendar' && !isMobile" class="flex-1 grid grid-cols-[auto,1fr] overflow-hidden">
        <!-- Time slots -->
        <VaCard class="border-r overflow-hidden">
          <div class="h-20 w-20 border-b"></div>
          <div ref="timeSlotContainer" class="h-[calc(100vh-10rem)] overflow-y-auto" @scroll="handleTimeSlotScroll">
            <div
              v-for="time in timeSlots"
              :key="time"
              class="h-20 flex items-center justify-end pr-2 text-sm text-gray-500 border-b"
            >
              {{ time }}
            </div>
          </div>
        </VaCard>
        <!-- Calendar grid -->
        <VaCard ref="calendarContainer" class="overflow-auto" @scroll="handleCalendarScroll">
          <VaCard
            class="grid"
            :style="{
              gridTemplateColumns: `repeat(${role?.includes('Dentist') ? 7 : doctors.length}, minmax(200px, 1fr))`,
            }"
          >
            <!-- Doctor headers -->
            <VaCard
              v-for="doctor in doctors"
              :key="doctor.id"
              :class="{
                'h-20 p-4 text-center border-l sticky top-0 z-10': true,
                hidden: role?.includes('Dentist'),
              }"
            >
              <div class="flex flex-col items-center justify-center">
                <VaBadge
                  dot
                  overlap
                  placement="bottom-right"
                  :offset="[-7, -7]"
                  class="mr-2"
                  :color="doctor.isWorked ? 'success' : 'secondary'"
                >
                  <VaAvatar
                    color="#692BEB"
                    :src="getSrcAvatar(doctor.imageUrl)"
                    :fallback-text="doctor.name?.charAt(0).toUpperCase()"
                    alt="Avatar"
                  />
                </VaBadge>
                <span class="text-sm font-medium">{{ doctor.name }}</span>
              </div>
            </VaCard>
            <!-- WeekDays headers -->
            <div
              v-for="(day, index) in weekDays"
              :key="index"
              :class="{
                'h-20 p-4 text-center border sticky top-0 z-10': true,
                hidden: !role?.includes('Dentist'),
              }"
            >
              <div class="flex flex-col items-center">
                <span class="text-sm font-medium">{{ day }}</span>
              </div>
            </div>
            <!-- Appointment slots -->
            <VaCard
              v-for="(column, columnIndex) in role?.includes('Dentist') ? 7 : doctors.length"
              :key="columnIndex"
              class="border-l relative"
              :style="{ backgroundColor: role?.includes('Dentist') ? '' : `${doctors[columnIndex].color}10` }"
            >
              <div class="h-full">
                <div
                  v-for="time in timeSlots"
                  :key="time"
                  class="h-20 border-b relative group"
                  @contextmenu.prevent="
                    openContextMenu(
                      $event,
                      time,
                      role?.includes('Dentist') ? getWeekDayDate(columnIndex) : doctors[columnIndex].id,
                    )
                  "
                  @dragover.prevent
                  @drop="
                    handleDrop(
                      $event,
                      time,
                      role?.includes('Dentist') ? getWeekDayDate(columnIndex) : doctors[columnIndex].id,
                    )
                  "
                >
                  <!-- Appointment slots -->
                  <div
                    v-if="
                      getAppointments(
                        time,
                        role?.includes('Dentist') ? getWeekDayDate(columnIndex) : doctors[columnIndex].id,
                      ).length === 1
                    "
                    class="absolute inset-x-1 rounded shadow-md cursor-move"
                    :style="{
                      top: '2px',
                      height: 'calc(100% - 4px)',
                    }"
                    draggable="true"
                    @dragstart="
                      handleDragStart(
                        $event,
                        getAppointments(
                          time,
                          role?.includes('Dentist') ? getWeekDayDate(columnIndex) : doctors[columnIndex].id,
                        )[0],
                      )
                    "
                    @mouseenter="
                      showAppointmentDetails(
                        getAppointments(
                          time,
                          role?.includes('Dentist') ? getWeekDayDate(columnIndex) : doctors[columnIndex].id,
                        )[0],
                        $event,
                      )
                    "
                    @mouseleave="hideAppointmentDetails()"
                  >
                    <div
                      class="h-full p-2 rounded"
                      :style="{
                        backgroundColor: `${role?.includes('Dentist') ? '#E5E7EB' : doctors[columnIndex].color}30`,
                      }"
                    >
                      <div class="flex justify-between items-center">
                        <div class="text-sm font-medium truncate">
                          {{
                            getAppointments(
                              time,
                              role?.includes('Dentist') ? getWeekDayDate(columnIndex) : doctors[columnIndex].id,
                            )[0].patientName
                          }}
                        </div>
                        <div
                          class="text-xs"
                          :class="[
                            getAppointmentType(
                              getAppointments(
                                time,
                                role?.includes('Dentist') ? getWeekDayDate(columnIndex) : doctors[columnIndex].id,
                              )[0].type,
                            ).bgColor,
                            'px-2 py-1 rounded-full inline-block',
                            getAppointmentType(
                              getAppointments(
                                time,
                                role?.includes('Dentist') ? getWeekDayDate(columnIndex) : doctors[columnIndex].id,
                              )[0].type,
                            ).textColor,
                          ]"
                        >
                          {{
                            getAppointmentType(
                              getAppointments(
                                time,
                                role?.includes('Dentist') ? getWeekDayDate(columnIndex) : doctors[columnIndex].id,
                              )[0].type,
                            ).text
                          }}
                        </div>
                      </div>
                      <div
                        class="text-xs"
                        :class="[
                          getAppointmentStatusConfig(
                            getAppointments(
                              time,
                              role?.includes('Dentist') ? getWeekDayDate(columnIndex) : doctors[columnIndex].id,
                            )[0].status,
                          ).bgColor,
                          getAppointmentStatusConfig(
                            getAppointments(
                              time,
                              role?.includes('Dentist') ? getWeekDayDate(columnIndex) : doctors[columnIndex].id,
                            )[0].status,
                          ).textColor,
                          'px-2 py-1 mt-3 rounded-full inline-block',
                        ]"
                      >
                        {{
                          getAppointmentStatusConfig(
                            getAppointments(
                              time,
                              role?.includes('Dentist') ? getWeekDayDate(columnIndex) : doctors[columnIndex].id,
                            )[0].status,
                          ).text
                        }}
                      </div>
                    </div>
                  </div>
                  <!-- Follow up -->
                  <div
                    v-if="
                      getFollowUpAppointments(
                        time,
                        role?.includes('Dentist') ? getWeekDayDate(columnIndex) : doctors[columnIndex].id,
                      ).length === 1
                    "
                    class="absolute inset-x-1 rounded shadow-md cursor-move"
                    :style="{
                      top: '2px',
                      height: 'calc(100% - 4px)',
                    }"
                    draggable="true"
                    @dragstart="
                      handleDragStart(
                        $event,
                        getFollowUpAppointments(
                          time,
                          role?.includes('Dentist') ? getWeekDayDate(columnIndex) : doctors[columnIndex].id,
                        )[0],
                      )
                    "
                    @mouseenter="
                      showFollowUpAppointmentDetails(
                        getFollowUpAppointments(
                          time,
                          role?.includes('Dentist') ? getWeekDayDate(columnIndex) : doctors[columnIndex].id,
                        )[0],
                        $event,
                      )
                    "
                    @mouseleave="hideFollowUpAppointmentDetails()"
                  >
                    <div
                      class="h-full p-2 rounded"
                      :style="{
                        backgroundColor: `${role?.includes('Dentist') ? '#E5E7EB' : doctors[columnIndex].color}30`,
                      }"
                    >
                      <div class="flex justify-between items-center">
                        <div class="text-sm font-medium truncate">
                          {{
                            getFollowUpAppointments(
                              time,
                              role?.includes('Dentist') ? getWeekDayDate(columnIndex) : doctors[columnIndex].id,
                            )[0].patientName
                          }}
                        </div>
                        <div
                          class="text-xs"
                          :class="[
                            getAppointmentType(
                              getFollowUpAppointments(
                                time,
                                role?.includes('Dentist') ? getWeekDayDate(columnIndex) : doctors[columnIndex].id,
                              )[0].appointmentType,
                            ).bgColor,
                            'px-2 py-1 rounded-full inline-block',
                            getAppointmentType(
                              getFollowUpAppointments(
                                time,
                                role?.includes('Dentist') ? getWeekDayDate(columnIndex) : doctors[columnIndex].id,
                              )[0].appointmentType,
                            ).textColor,
                          ]"
                        >
                          {{
                            getAppointmentType(
                              getFollowUpAppointments(
                                time,
                                role?.includes('Dentist') ? getWeekDayDate(columnIndex) : doctors[columnIndex].id,
                              )[0].appointmentType,
                            ).text
                          }}
                        </div>
                      </div>
                      <div
                        class="text-xs"
                        :class="[
                          getFollowUpStatusConfig(
                            getFollowUpAppointments(
                              time,
                              role?.includes('Dentist') ? getWeekDayDate(columnIndex) : doctors[columnIndex].id,
                            )[0].status,
                          ).bgColor,
                          getFollowUpStatusConfig(
                            getFollowUpAppointments(
                              time,
                              role?.includes('Dentist') ? getWeekDayDate(columnIndex) : doctors[columnIndex].id,
                            )[0].status,
                          ).textColor,
                          'px-2 py-1 mt-3 rounded-full inline-block',
                        ]"
                      >
                        {{
                          getFollowUpStatusConfig(
                            getFollowUpAppointments(
                              time,
                              role?.includes('Dentist') ? getWeekDayDate(columnIndex) : doctors[columnIndex].id,
                            )[0].status,
                          ).text
                        }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </VaCard>
          </VaCard>
        </VaCard>
      </div>
      <!-- List View -->
      <div v-else class="flex-1 overflow-auto" :style="{ marginRight: !isMobile ? `${scrollbarWidth}px` : `` }">
        <div v-if="isAppointment === 'appointment'">
          <VaDataTable
            :items="items"
            :columns="columns"
            hoverable
            class="my-table va-table--hoverable"
            :style="{
              '--va-data-table-thead-background': 'var(--va-background-element)',
              '--va-data-table-grid-tbody-gap': '0.15rem',
              '--va-data-table-grid-tr-border': '1px solid var(--va-background-border)',
            }"
            :class="['small-text']"
            sticky-header
          >
            <template #cell(appointmentDate)="{ value }"> {{ formatDate(value) }} </template>
            <template #cell(servicePrice)="{ value }"> {{ formatPrice(value) }}$ </template>
            <template #cell(status)="{ value }">
              <VaChip :color="getStatusColor(value)" class="text-sm">
                {{ getStatusText(value) }}
              </VaChip>
            </template>
            <template #cell(paymentStatus)="{ value }">
              <VaChip :color="getPaymentStatusColor(value)" class="text-sm">
                {{ getPaymentStatusText(value) }}
              </VaChip>
            </template>
            <template #cell(actions)="{ rowData }">
              <div class="space-x-2">
                <VaButton
                  v-if="rowData.status === 2 && role?.includes('Staff')"
                  round
                  icon="check"
                  color="#b1fadc"
                  icon-color="#812E9E"
                  @click="checkedAppointment(rowData.appointmentId)"
                />
                <VaButton
                  v-if="rowData.status !== 4 && rowData.status !== 2"
                  round
                  icon="arrow_forward"
                  color="#b1fadc"
                  icon-color="#812E9E"
                  @click="router.push(`/examination/${rowData.appointmentId}`)"
                />
                <VaButton
                  v-if="rowData.status === 6 && role?.includes('Staff') && rowData.paymentStatus === 1"
                  round
                  icon="payments"
                  color="#b1fadc"
                  icon-color="green"
                  @click="router.push(`/payment/${rowData.appointmentId}`)"
                />
                <VaButton
                  v-if="rowData.status === 2"
                  round
                  icon="sync"
                  color="warning"
                  icon-color="#812E9E"
                  @click="rescheduleModal(rowData)"
                />
                <VaButton
                  v-if="(rowData.status === 3 || rowData.status === 2) && !role?.includes('Dentist')"
                  round
                  icon="clear"
                  color="danger"
                  icon-color="#812E9E"
                  @click="cancelModal(rowData)"
                />
              </div>
            </template>
          </VaDataTable>
          <VaPagination
            v-model="paginationA.page"
            class="items-center justify-end mt-4"
            buttons-preset="secondary"
            :pages="totalPagesA"
            :visible-pages="5"
            :boundary-links="true"
            :direction-links="true"
          />
        </div>
        <div v-if="isAppointment === 'followup'">
          <VaDataTable
            :items="followitems"
            :columns="followColumns"
            hoverable
            class="my-table va-table--hoverable"
            :style="{
              '--va-data-table-thead-background': 'var(--va-background-element)',
              '--va-data-table-grid-tr-border': '1px solid var(--va-background-border)',
            }"
            sticky-header
            :class="['small-text']"
          >
            <template #cell(date)="{ value }"> {{ formatDate(value) }} </template>
            <template #cell(status)="{ value }">
              <VaChip :color="getFollowUpStatusColor(value)" class="text-sm">
                {{ getFollowUpStatusText(value) }}
              </VaChip>
            </template>
            <template #cell(actions)="{ rowData }">
              <div class="space-x-2">
                <VaButton
                  v-if="rowData.status === 2 && role?.includes('Staff')"
                  round
                  icon="check"
                  color="#b1fadc"
                  icon-color="#812E9E"
                  @click="checkedFollowupAppointment(rowData.appointmentId)"
                />
                <VaButton round icon="sync" color="warning" icon-color="#812E9E" @click="rescheduleModal(rowData)" />
              </div>
            </template>
          </VaDataTable>
          <VaPagination
            v-model="paginationF.page"
            class="items-center justify-end mt-4"
            buttons-preset="secondary"
            :pages="totalPagesF"
            :visible-pages="5"
            :boundary-links="true"
            :direction-links="true"
          />
        </div>
        <!-- Unassigned -->
        <div v-if="isAppointment === 'unassigned'">
          <VaDataTable
            :items="unassigneditems"
            :columns="unassignedColumns"
            hoverable
            class="my-table va-table--hoverable"
            :style="{
              '--va-data-table-thead-background': 'var(--va-background-element)',
              '--va-data-table-grid-tr-border': '1px solid var(--va-background-border)',
            }"
            sticky-header
            :class="['small-text']"
            @row:dblclick="(row) => openAssignListDialog(row.item)"
          >
            <template #cell(appointmentDate)="{ value }"> {{ formatDate(value) }} </template>
            <template #cell(servicePrice)="{ value }"> {{ formatPrice(value) }}$ </template>
            <template #cell(status)="{ value }">
              <VaChip :color="getStatusColor(value)" class="text-sm">
                {{ getStatusText(value) }}
              </VaChip>
            </template>
            <template #cell(paymentStatus)="{ value }">
              <VaChip :color="getPaymentStatusColor(value)" class="text-sm">
                {{ getPaymentStatusText(value) }}
              </VaChip>
            </template>
            <template #cell(actions)="{ rowData }">
              <div class="space-x-2">
                <VaButton
                  v-if="rowData.status === 2"
                  round
                  icon="sync"
                  color="warning"
                  icon-color="#812E9E"
                  @click="rescheduleModal(rowData)"
                />
                <VaButton
                  v-if="(rowData.status === 3 || rowData.status === 2) && !role?.includes('Dentist')"
                  round
                  icon="clear"
                  color="danger"
                  icon-color="#812E9E"
                  @click="cancelModal(rowData)"
                />
              </div>
            </template>
          </VaDataTable>
          <VaPagination
            v-model="paginationN.page"
            class="items-center justify-end mt-4"
            buttons-preset="secondary"
            :pages="totalPagesN"
            :visible-pages="5"
            :boundary-links="true"
            :direction-links="true"
          />
        </div>
      </div>
      <!-- Appointment Details Modal -->
      <VaCard
        v-if="showAppointmentModal"
        class="fixed z-50 rounded-md shadow-lg p-4"
        :style="{ top: `${appointmentModalPosition.y}px`, left: `${appointmentModalPosition.x}px` }"
      >
        <h3 class="text-lg font-semibold mb-2">
          {{ selectedAppointment?.patientName }} - {{ selectedAppointment?.patientCode }}
        </h3>
        <p><strong>Contact:</strong> {{ selectedAppointment?.patientPhone }}</p>
        <p><strong>Room:</strong> {{ selectedAppointment?.roomName }}</p>
        <p><strong>Time:</strong> {{ selectedAppointment?.startTime }}</p>
        <p><strong>Date:</strong> {{ selectedAppointment?.appointmentDate }}</p>
        <p><strong>Doctor:</strong> {{ getDoctorName(getDoctorId(selectedAppointment?.dentistId)) }}</p>
        <p><strong>Service:</strong> {{ selectedAppointment?.serviceName }}</p>
        <p><strong>Price:</strong> {{ formatPrice(selectedAppointment?.servicePrice) }}</p>
        <p class="flex items-center gap-2">
          <strong>Status:</strong>
          <span
            v-if="selectedAppointment"
            class="px-2 py-1 text-xs rounded-full"
            :class="[
              getAppointmentStatusConfig(selectedAppointment.status).bgColor,
              getAppointmentStatusConfig(selectedAppointment.status).textColor,
            ]"
          >
            {{ getAppointmentStatusConfig(selectedAppointment.status).text }}
          </span>
        </p>
      </VaCard>
      <!-- Follow-Up Appointment Details Modal -->
      <VaCard
        v-if="showFollowUpAppointmentModal"
        class="fixed z-50 rounded-md shadow-lg p-4"
        :style="{ top: `${followUpModalPosition.y}px`, left: `${followUpModalPosition.x}px` }"
      >
        <h3 class="text-lg font-semibold mb-2">
          {{ selectedFollowUpAppointment?.patientName }} - {{ selectedFollowUpAppointment?.patientCode }}
        </h3>
        <p><strong>Room:</strong> {{ selectedFollowUpAppointment?.roomName }}</p>
        <p><strong>Time:</strong> {{ selectedFollowUpAppointment?.startTime }}</p>
        <p><strong>Date:</strong> {{ selectedFollowUpAppointment?.date }}</p>
        <p><strong>Doctor:</strong> {{ getDoctorName(getDoctorId(selectedFollowUpAppointment?.doctorProfileID)) }}</p>
        <p><strong>Service:</strong> {{ selectedFollowUpAppointment?.serviceName }}</p>
        <p class="flex items-center gap-2">
          <strong>Status:</strong>
          <span
            v-if="selectedFollowUpAppointment"
            class="px-2 py-1 text-xs rounded-full"
            :class="[
              getFollowUpStatusConfig(selectedFollowUpAppointment.status).bgColor,
              getFollowUpStatusConfig(selectedFollowUpAppointment.status).textColor,
            ]"
          >
            {{ getFollowUpStatusConfig(selectedFollowUpAppointment.status).text }}
          </span>
        </p>
      </VaCard>
      <!-- Context Menu -->
      <VaCard
        v-if="contextMenu.show"
        :style="{
          position: 'fixed',
          top: `${contextMenu.y}px`,
          left: `${contextMenu.x}px`,
        }"
        class="z-50 rounded-md shadow-lg context-menu"
      >
        <div class="py-1">
          <button
            class="block w-full text-left px-4 py-2 text-sm"
            @click="showTimeSlotUnassignedModal(contextMenu.time, contextMenu.doctorId)"
          >
            Show Unassigned
          </button>
        </div>
      </VaCard>
      <!-- Unassigned Bookings Dialog -->
      <TransitionRoot appear :show="showAllUnassignedModal" as="template">
        <Dialog as="div" class="relative z-10" @close="showAllUnassignedModal = false">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0"
            enter-to="opacity-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100"
            leave-to="opacity-0"
          >
            <div class="fixed inset-0 bg-black bg-opacity-25" />
          </TransitionChild>
          <div class="fixed inset-0 overflow-y-auto">
            <div class="flex min-h-full items-center justify-center p-4 text-center">
              <TransitionChild
                as="template"
                enter="duration-300 ease-out"
                enter-from="opacity-0 scale-95"
                enter-to="opacity-100 scale-100"
                leave="duration-200 ease-in"
                leave-from="opacity-100 scale-100"
                leave-to="opacity-0 scale-95"
              >
                <VaCard
                  class="w-full max-w-md transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all"
                >
                  <DialogTitle as="h3" class="text-lg font-medium leading-6">
                    {{ selectedDate ? formatDate(selectedDate) : 'All' }} Unassigned Bookings at
                    {{ selectedTime ? `${selectedTime}` : '' }}
                  </DialogTitle>
                  <div class="mt-4">
                    <div v-if="selectedTime">
                      <ul v-if="nonDoctorAppointments.filter((b) => b.startTime === selectedTime).length > 0">
                        <li
                          v-for="booking in nonDoctorAppointments.filter((b) => b.startTime === selectedTime)"
                          :key="booking.appointmentId"
                          class="mb-2"
                        >
                          <span>{{ booking.patientName }} - {{ booking.startTime }}</span>
                          <button
                            class="ml-2 px-2 py-1 bg-blue-500 text-white rounded-md text-sm"
                            @click="openAssignDialog(booking)"
                          >
                            Assign
                          </button>
                        </li>
                      </ul>
                      <p v-else class="text-sm text-gray-500 text-center">
                        No unassigned bookings at {{ selectedTime }}.
                      </p>
                    </div>
                    <p v-else class="text-sm text-gray-500 text-center">No unassigned bookings.</p>
                  </div>
                </VaCard>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </TransitionRoot>
      <!-- Assign Booking Dialog -->
      <TransitionRoot appear :show="showAssignDialog" as="template">
        <Dialog as="div" class="relative z-10" @close="showAssignDialog = false">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0"
            enter-to="opacity-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100"
            leave-to="opacity-0"
          >
            <div class="fixed inset-0 bg-black bg-opacity-25" />
          </TransitionChild>
          <div class="fixed inset-0 overflow-y-auto">
            <div class="flex min-h-full items-center justify-center p-4 text-center">
              <TransitionChild
                as="template"
                enter="duration-300 ease-out"
                enter-from="opacity-0 scale-95"
                enter-to="opacity-100 scale-100"
                leave="duration-200 ease-in"
                leave-from="opacity-100 scale-100"
                leave-to="opacity-0 scale-95"
              >
                <VaCard
                  class="w-full max-w-md transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all"
                >
                  <DialogTitle as="h3" class="text-lg font-medium leading-6"> Assign Booking </DialogTitle>
                  <form class="mt-4 space-y-4" @submit.prevent="handleAssignBooking">
                    <div class="space-y-2">
                      <label class="text-sm font-medium">Patient: {{ selectedBooking.patientName }}</label>
                    </div>
                    <div class="space-y-2">
                      <label class="text-sm font-medium">Doctor</label>
                      <select v-model="selectedDoctorId" required class="w-full px-3 py-2 border rounded-md">
                        <option v-for="doctor in activeDoctors" :key="doctor.id" :value="doctor.id">
                          {{ doctor.name }}
                        </option>
                      </select>
                    </div>
                    <div class="space-y-2">
                      <label class="text-sm font-medium">Time</label>
                      <select v-model="selectedTime" required class="w-full px-3 py-2 border rounded-md" disabled>
                        <option v-for="time in timeSlots" :key="time" :value="time">
                          {{ time }}
                        </option>
                      </select>
                    </div>
                    <div class="flex justify-end space-x-2 mt-4">
                      <button
                        type="button"
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        @click="showAssignDialog = false"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        class="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700"
                      >
                        Assign
                      </button>
                    </div>
                  </form>
                </VaCard>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </TransitionRoot>
      <!-- Create Appointment Modal -->
      <VaModal v-model="showModalAppointment" ok-text="Submit" @ok="submitAppointment">
        <h3 class="va-h3">Appointment Details</h3>
        <VaCard>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <VaSelect
              v-model="patientId"
              class="col-span-1"
              label="Patient"
              :options="optionsPatients"
              autocomplete
              highlight-matched-text
            />
            <VaSelect
              v-model="doctorId"
              class="col-span-1"
              label="Doctor"
              :options="optionsDoctors"
              autocomplete
              highlight-matched-text
            />
            <VaSelect
              v-model="serviceId"
              class="col-span-1"
              label="Service"
              :options="optionsServices"
              autocomplete
              highlight-matched-text
            />
            <VaDateInput
              v-model="date"
              :format="formatDate"
              :parse="parseDate"
              manual-input
              class="col-span-1"
              label="Date"
              clearable
            />
            <VaSelect v-model="startTime" class="col-span-1" label="Time" :options="optionsStartTimes" />
            <VaTextarea v-model="notes" label="Notes" />
          </div>
        </VaCard>
      </VaModal>
      <!-- Reschedule Appointment Modal -->
      <VaModal
        v-model="showModalReschedule"
        ok-text="Reschedule"
        @close="handleCloseReschedule"
        @ok="submitReschedule(isAppointment)"
      >
        <h3 class="va-h3">Reschedule Appointment</h3>
        <VaCard>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <VaDateInput
              v-model="date"
              :format="formatDate"
              :parse="parseDate"
              manual-input
              class="col-span-1"
              label="Date"
              clearable
            />
            <VaSelect v-model="startTime" class="col-span-1" label="Time" :options="optionsStartTimes" />
          </div>
        </VaCard>
      </VaModal>
      <!-- Cancel Appointment Modal -->
      <VaModal
        v-model="showModalCancel"
        cancel-text="Cancel"
        ok-text="Yes"
        @close="handleCloseCancel"
        @ok="submitCancel"
      >
        <h3 class="va-h3">Cancel Appointment</h3>
        <VaCard>
          <p>Are you sure you want to cancel this appointment?</p>
        </VaCard>
        <VaAlert color="#fdeae7" text-color="#940909" class="mt-4">
          <p>This action cannot be undone.</p>
        </VaAlert>
      </VaModal>
    </VaCard>
  </VaInnerLoading>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted, watch, Ref, nextTick, onBeforeMount } from 'vue'
import { Dialog, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import {
  useToast,
  VaAlert,
  VaButton,
  VaCard,
  VaChip,
  VaDataTable,
  VaDateInput,
  VaInnerLoading,
  VaModal,
  VaPagination,
  VaSelect,
  VaTextarea,
} from 'vuestic-ui'
import {
  Pagination,
  Search,
  Appointment,
  SearchResponse,
  Doctor,
  getAppointmentStatusConfig,
  getStatusText,
  getStatusColor,
  FollowUpAppointment,
  getFollowUpStatusConfig,
  getFollowUpStatusText,
  getFollowUpStatusColor,
  getPaymentStatusColor,
  getPaymentStatusText,
  getAppointmentType,
} from './types'
import { useAppointmentStore } from '@/stores/modules/appointment.module'
import { getErrorMessage, getSrcAvatar } from '@/services/utils'
import { useDoctorProfileStore } from '@/stores/modules/doctor.module'
import { useAuthStore } from '@/stores/modules/auth.module'
import { DateInputModelValue, DateInputValue } from 'vuestic-ui/dist/types/components/va-date-input/types'
import { useUserProfileStore } from '@/stores/modules/user.module'
import { useServiceStore } from '@/stores/modules/service.module'
import { useRouter } from 'vue-router'
import { useTreatmentStore } from '@/stores/modules/treatment.module'
import { startOfWeek, addDays, format } from 'date-fns'
import { debounce } from 'lodash'

const selectedDate = ref(new Date())
const showAllUnassignedModal = ref(false)
const currentView = ref('calendar')
const isAppointment = ref('appointment')
const showAppointmentModal = ref(false)
const showFollowUpAppointmentModal = ref(false)
const selectedAppointment = ref<Appointment>()
const selectedFollowUpAppointment = ref<FollowUpAppointment>()
const appointmentModalPosition = ref({ x: 0, y: 0 })
const followUpModalPosition = ref({ x: 0, y: 0 })
const calendarContainer: Ref<HTMLElement | null> = ref(null)
const timeSlotContainer: Ref<HTMLElement | null> = ref(null)
const loading = ref(false)
const appointments = ref<Appointment[]>([])
const followUpAppointments = ref<FollowUpAppointment[]>([])
const storeAppointments = useAppointmentStore()
const storeDoctors = useDoctorProfileStore()
const storeServices = useServiceStore()
const storeTreatment = useTreatmentStore()
const appointmentSearchRes = ref<SearchResponse | null>(null)
const followUpAppointmentsSearchRes = ref<SearchResponse | null>(null)
const nonDoctorAppointments = ref<Appointment[]>([])
const nonDoctorSearchRes = ref<SearchResponse | null>(null)
const showModalAppointment = ref(false)
const showModalReschedule = ref(false)
const showModalCancel = ref(false)
const isMobile = computed(() => window.innerWidth < 768)
const { init } = useToast()
const router = useRouter()
const usersStore = useAuthStore()
const role = usersStore.user?.roles
const items = ref<Appointment[]>([])
const followitems = ref<FollowUpAppointment[]>([])
const unassigneditems = ref<Appointment[]>([])

const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const columns = computed(() => [
  { key: 'appointmentDate', label: 'Date', name: 'appointmentDate' },
  { key: 'roomName', label: 'Room', name: 'roomName' },
  { key: 'startTime', label: 'Time', name: 'startTime' },
  { key: 'patientName', label: 'Patient', name: 'patientName' },
  { key: 'patientPhone', label: 'Phone', name: 'patientPhone' },
  { key: 'dentistName', label: 'Doctor', name: 'dentistName' },
  { key: 'serviceName', label: 'Service', name: 'serviceName' },
  { key: 'servicePrice', label: 'Price', name: 'servicePrice' },
  { key: 'status', label: 'Status', name: 'status' },
  { key: 'paymentStatus', label: 'Payment Status', name: 'paymentStatus' },
  { key: 'actions', label: 'Actions', name: 'actions' },
])

const followColumns = computed(() => [
  { key: 'date', label: 'Date', name: 'date' },
  { key: 'roomName', label: 'Room', name: 'roomName' },
  { key: 'startTime', label: 'Time', name: 'startTime' },
  { key: 'patientName', label: 'Patient', name: 'patientName' },
  { key: 'doctorName', label: 'Doctor', name: 'doctorName' },
  { key: 'step', label: 'Step', name: 'step' },
  { key: 'serviceName', label: 'Service', name: 'serviceName' },
  { key: 'procedureName', label: 'Procedure', name: 'procedureName' },
  { key: 'status', label: 'Status', name: 'status' },
  { key: 'actions', label: 'Actions', name: 'actions' },
])

const unassignedColumns = computed(() => [
  { key: 'appointmentDate', label: 'Date', name: 'appointmentDate' },
  { key: 'startTime', label: 'Time', name: 'startTime' },
  { key: 'patientName', label: 'Patient', name: 'patientName' },
  { key: 'serviceName', label: 'Service', name: 'serviceName' },
  { key: 'servicePrice', label: 'Price', name: 'servicePrice' },
  { key: 'status', label: 'Status', name: 'status' },
  { key: 'paymentStatus', label: 'Payment Status', name: 'paymentStatus' },
  { key: 'actions', label: 'Actions', name: 'actions' },
])

const views = [
  { id: 'calendar', label: 'event_note' },
  { id: 'list', label: 'List' },
]

const types = [
  { id: 'appointment', label: 'Appointment' },
  { id: 'followup', label: 'Follow-up' },
  { id: 'unassigned', label: 'Unassigned Bookings' },
]

interface Options {
  text: string
  value: string
}
const userId = ref('')
const appointmentId = ref('')
const patientId = ref<Options>()
const doctorId = ref<Options>()
const serviceId = ref<Options>()
const date = ref(new Date())
const current_follow_up = ref<any>()
const startTime = ref('')
const duration = ref('00:30:00')
const notes = ref('')
const optionsPatients = ref<Options[]>([])
const optionsServices = ref<Options[]>([])

const getServices = () => {
  storeServices
    .getAllCustomerServices()
    .then((response) => {
      optionsServices.value = response.data.map((service: any) => ({
        text: service.serviceName,
        value: service.id,
      }))
    })
    .catch((error) => {
      const message = getErrorMessage(error)
      init({
        title: 'error',
        message: message,
        color: 'danger',
      })
    })
}
const availableDoctorsRef = ref([])
const optionsDoctors = computed(() => {
  if (availableDoctorsRef.value) {
    return availableDoctorsRef.value
  }

  return activeDoctors.value.map((doctor) => ({
    text: `${doctor.firstName} ${doctor.lastName}`,
    value: doctor.id,
  }))
})
const optionsStartTimes = computed(() => {
  const slots = []
  for (let hour = 8; hour < 22; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`)
    slots.push(`${hour.toString().padStart(2, '0')}:30`)
  }
  return slots
})
const users = useUserProfileStore()
const getPatients = () => {
  const request = { isActive: true }
  users
    .getPatients(request)
    .then((response) => {
      optionsPatients.value = response.data.map((patient: any) => ({
        text: patient.phoneNumber,
        value: patient.id,
      }))
    })
    .catch((error) => {
      const message = getErrorMessage(error)
      init({
        title: 'error',
        message: message,
        color: 'danger',
      })
    })
}

const submitAppointment = () => {
  const appointment = {
    patientId: patientId.value?.value,
    dentistId: doctorId.value?.value,
    serviceId: serviceId.value?.value,
    appointmentDate: formatDateForm(date.value),
    startTime: startTime.value + ':00',
    duration: duration.value,
    notes: notes.value,
  }

  storeAppointments
    .createAppointment(appointment)
    .then(() => {
      init({
        title: 'success',
        message: 'Appointment created successfully!',
        color: 'success',
      })
      showModalAppointment.value = false
      fetchAppointments(searchValueA.value)
    })
    .catch((error) => {
      const message = getErrorMessage(error)
      init({
        title: 'error',
        message: message,
        color: 'danger',
      })
    })
}

const checkedAppointment = async (appointmentId: any) => {
  loading.value = true
  await storeTreatment
    .toogleAppointment(appointmentId)
    .then(() => {
      init({
        title: 'success',
        color: 'success',
        message: 'Bệnh nhân đã đến khám!',
      })
      fetchAppointments(searchValueA.value)
      fetchFollowUpAppointments(searchValueF.value)
      fetchNonDoctorAppointments(searchValueN.value)
    })
    .catch((error) => {
      const errorMessage = getErrorMessage(error)
      init({
        message: errorMessage,
        color: 'danger',
        title: 'Error',
      })
    })
    .finally(() => {
      loading.value = false
    })
}

const checkedFollowupAppointment = async (appointmentId: any) => {
  loading.value = true
  await storeTreatment
    .toogleFollowupAppointment(appointmentId)
    .then(() => {
      init({
        title: 'success',
        color: 'success',
        message: 'Bệnh nhân đã đến khám!',
      })
      fetchFollowUpAppointments(searchValueF.value)
    })
    .catch((error) => {
      const errorMessage = getErrorMessage(error)
      init({
        message: errorMessage,
        color: 'danger',
        title: 'Error',
      })
    })
    .finally(() => {
      loading.value = false
    })
}

const rescheduleModal = (appointment: any) => {
  appointmentId.value = appointment.appointmentId
  date.value = appointment.appointmentDate
  showModalReschedule.value = true
  if (isAppointment.value === 'followup') {
    current_follow_up.value = appointment
  }
}

const cancelModal = (appointment: any) => {
  appointmentId.value = appointment.appointmentId
  userId.value = appointment.patientId
  showModalCancel.value = true
}

const handleCloseReschedule = () => {
  appointmentId.value = ''
  date.value = new Date()
  startTime.value = ''
}

const handleCloseCancel = () => {
  appointmentId.value = ''
  userId.value = ''
}

const submitReschedule = (isAppointment: any) => {
  let request
  if (isAppointment === 'appointment' || isAppointment === 'unassigned') {
    request = {
      appointmentID: appointmentId.value,
      appointmentDate: formatDateForm(date.value),
      startTime: startTime.value + ':00',
      duration: duration.value,
    }
  } else {
    request = {
      appointmentID: appointmentId.value,
      treatmentId: current_follow_up.value.treatmentID,
      treatmentDate: formatDateForm(date.value),
      treatmentTime: startTime.value + ':00',
      note: '',
    }
  }

  storeAppointments
    .rescheduleAppointment(isAppointment, request)
    .then(() => {
      init({
        title: 'success',
        message: 'Appointment rescheduled successfully!',
        color: 'success',
      })
      showModalReschedule.value = false
      fetchAppointments(searchValueA.value)
      fetchFollowUpAppointments(searchValueF.value)
      fetchNonDoctorAppointments(searchValueN.value)
    })
    .catch((error) => {
      const message = getErrorMessage(error)
      init({
        title: 'error',
        message: message,
        color: 'danger',
      })
    })
}

const submitCancel = () => {
  const request = {
    appointmentID: appointmentId.value,
    userID: userId.value,
  }
  storeAppointments
    .cancelAppointment(request)
    .then(() => {
      init({
        title: 'success',
        message: 'Appointment canceled successfully!',
        color: 'success',
      })
      showModalCancel.value = false
      fetchAppointments(searchValueA.value)
      fetchNonDoctorAppointments(searchValueN.value)
    })
    .catch((error) => {
      const message = getErrorMessage(error)
      init({
        title: 'error',
        message: message,
        color: 'danger',
      })
    })
}

const filteredTypes = computed(() => {
  if (role?.includes('Patient') || role?.includes('Dentist')) {
    return currentView.value === 'list' ? types.filter((type) => type.id !== 'unassigned') : []
  }
  return currentView.value === 'list' ? types : []
})

const formatPrice = (price: any) => {
  return new Intl.NumberFormat('vi-VN').format(price)
}

const formatDate = (date: DateInputModelValue): string => {
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

const formatDateForm = (date: string | Date): string => {
  if (!date) return ''
  // Convert string to Date object if needed
  const dateObj = typeof date === 'string' ? new Date(date) : date
  // Check if date is valid
  if (isNaN(dateObj.getTime())) return ''

  // Use local time methods instead of UTC
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0')
  const day = dateObj.getDate().toString().padStart(2, '0')
  const year = dateObj.getFullYear()

  return `${year}-${month}-${day}`
}

const parseDate = (dateStr: string): DateInputValue => {
  if (!dateStr) return null

  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? null : date
}

const generatePastelColor = () => {
  return `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, '0')}`
}

const doctors = ref<Doctor[]>([])
const activeDoctors = computed(() => doctors.value.filter((doctor: any) => doctor.isWorked))

const paginationA = ref<Pagination>({
  page: 1,
  perPage: 10,
  total: 0,
})

const paginationF = ref<Pagination>({
  page: 1,
  perPage: 10,
  total: 0,
})

const paginationN = ref<Pagination>({
  page: 1,
  perPage: 10,
  total: 0,
})

const searchValueA = ref<Search>({
  pageNumber: 1,
  pageSize: paginationA.value.perPage,
  keyword: '',
})

const searchValueF = ref<Search>({
  pageNumber: 1,
  pageSize: paginationF.value.perPage,
  keyword: '',
})

const searchValueN = ref<Search>({
  pageNumber: 1,
  pageSize: paginationN.value.perPage,
  keyword: '',
})

const totalPagesA = computed(() => Math.ceil(paginationA.value.total / paginationA.value.perPage))
const totalPagesF = computed(() => Math.ceil(paginationF.value.total / paginationF.value.perPage))
const totalPagesN = computed(() => Math.ceil(paginationN.value.total / paginationN.value.perPage))

const request = {
  date: formatDateForm(selectedDate.value),
}

const fetchAppointments = (search: Search) => {
  loading.value = true
  storeAppointments
    .getAppointments(currentView.value === 'calendar' ? request : search)
    .then((response) => {
      appointments.value = response.data
      appointmentSearchRes.value = response
    })
    .catch((error) => {
      const message = getErrorMessage(error)
      init({
        title: 'error',
        message: message,
        color: 'danger',
      })
    })
    .finally(() => {
      loading.value = false
    })
}

const fetchFollowUpAppointments = (search: Search) => {
  loading.value = true
  storeAppointments
    .getFollowUpAppointments(currentView.value === 'calendar' ? request : search)
    .then((response) => {
      followUpAppointments.value = response.data
      followUpAppointmentsSearchRes.value = response
    })
    .catch((error) => {
      const message = getErrorMessage(error)
      init({
        title: 'error',
        message: message,
        color: 'danger',
      })
    })
    .finally(() => {
      loading.value = false
    })
}

const fetchNonDoctorAppointments = (search: Search) => {
  loading.value = true
  storeAppointments
    .getNonDoctorsAppointments(currentView.value === 'calendar' ? request : search)
    .then((response) => {
      nonDoctorAppointments.value = response.data
      nonDoctorSearchRes.value = response
    })
    .catch((error) => {
      const message = getErrorMessage(error)
      init({
        title: 'error',
        message: message,
        color: 'danger',
      })
    })
    .finally(() => {
      loading.value = false
    })
}

const fetchAvailableDoctors = async () => {
  const request = {
    serviceID: serviceId.value?.value,
    date: formatDateForm(date.value),
    startTime: startTime.value + ':00',
    endTime: addMinutesToTime(startTime.value + ':00', 30),
  }
  loading.value = true
  storeDoctors
    .getAvailableDoctors(request)
    .then((response) => {
      if (response && response.length > 0) {
        availableDoctorsRef.value = response.map((doctor: any) => ({
          text: `${doctor.firstName} ${doctor.lastName}`,
          value: doctor.id,
        }))

        if (doctorId.value && !availableDoctorsRef.value.some((option: any) => option.value === doctorId.value)) {
          doctorId.value = undefined
        }
      } else {
        availableDoctorsRef.value = []
        doctorId.value = undefined
      }
    })
    .catch((error) => {
      const message = getErrorMessage(error)
      init({
        title: 'error',
        message: message,
        color: 'danger',
      })
    })
    .finally(() => {
      loading.value = false
    })
}

const searchDoctor = () => {
  loading.value = true
  const request = { isActive: true }
  storeDoctors
    .getDoctors(request, formatDateForm(selectedDate.value))
    .then((response) => {
      doctors.value = response.data
      doctors.value.forEach((doctor) => {
        doctor.color = generatePastelColor()
        doctor.name = doctor.firstName + ' ' + doctor.lastName
      })
    })
    .catch((error) => {
      const message = getErrorMessage(error)
      init({
        title: 'error',
        message: message,
        color: 'danger',
      })
    })
    .finally(() => {
      loading.value = false
    })
}

onBeforeMount(() => {
  if (isMobile.value || role?.includes('Patient')) {
    currentView.value = 'list'
  }
  searchDoctor()
  fetchAppointments(searchValueA.value)
  fetchFollowUpAppointments(searchValueF.value)
  fetchNonDoctorAppointments(searchValueN.value)
})

const timeSlots = computed(() => {
  const slots = []
  for (let hour = 8; hour < 22; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`)
    slots.push(`${hour.toString().padStart(2, '0')}:30`)
  }
  return slots
})

const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  time: '',
  doctorId: '',
})

const showTimeSlotUnassignedModal = (time: any, doctorId: any) => {
  contextMenu.value.show = false
  selectedTime.value = time + ':00'
  selectedDoctorId.value = doctorId
  const timeSlotUnassignedBookings = nonDoctorAppointments.value.filter((booking) => booking.startTime === time)

  if (timeSlotUnassignedBookings.length > 0) {
    showAllUnassignedModal.value = true
  } else {
    showAllUnassignedModal.value = true
  }
}

const showAssignDialog = ref(false)
const selectedBooking = ref<Appointment>({
  appointmentId: '',
  patientId: '',
  patientCode: '',
  patientName: '',
  patientPhone: '',
  dentistId: '',
  dentistName: '',
  serviceId: '',
  serviceName: '',
  appointmentDate: '',
  startTime: '',
  duration: '00:30:00',
  status: 2,
  type: 1,
  notes: '',
  paymentStatus: 2,
  servicePrice: 0,
  canFeedback: false,
  isFeedback: false,
  roomID: '',
  roomName: '',
})
const selectedDoctorId = ref('')
const selectedTime = ref('')

const openAssignDialog = (booking: any) => {
  selectedBooking.value = booking
  selectedTime.value = booking.startTime.slice(0, -3)
  showAssignDialog.value = true
}

const openAssignListDialog = (booking: any) => {
  searchValueN.value = {
    ...searchValueN.value,
  }
  fetchNonDoctorAppointments(searchValueN.value)
  selectedBooking.value = booking
  selectedTime.value = booking.startTime.slice(0, -3)
  showAssignDialog.value = true
}

const handleAssignBooking = () => {
  const index = nonDoctorAppointments.value.findIndex((a) => a.appointmentId === selectedBooking.value.appointmentId)
  selectedTime.value = selectedTime.value + ':00'
  if (index !== -1) {
    // Check if the selected time and doctor combination is already occupied
    const isDuplicate = nonDoctorAppointments.value.some(
      (a) => a.startTime === selectedTime.value && getDoctorId(a.dentistId) === selectedDoctorId.value,
    )

    if (isDuplicate) {
      init({
        title: 'error',
        message: 'Cannot assign booking. Time slot is already occupied.',
        color: 'danger',
      })
      return
    }
    const request = {
      doctorID: getDoctorProfileId(selectedDoctorId.value),
      appointmentID: selectedBooking.value.appointmentId,
    }
    storeAppointments
      .assignDoctor(request)
      .then((response) => {
        init({
          title: 'success',
          message: response.data,
          color: 'success',
        })
        fetchAppointments(searchValueA.value)
        fetchNonDoctorAppointments(searchValueN.value)
        showAssignDialog.value = false
      })
      .catch((error) => {
        const message = getErrorMessage(error)
        init({
          title: 'error',
          message: message,
          color: 'danger',
        })
        selectedTime.value = selectedTime.value.slice(0, 5)
      })
  }
}

const handleDragStart = (event: DragEvent, appointment: Appointment | FollowUpAppointment) => {
  event.dataTransfer?.setData('text/plain', JSON.stringify(appointment))
  hideAppointmentDetails()
}

const handleDrop = (event: any, time: any, identifier: any) => {
  const appointmentData = JSON.parse(event.dataTransfer.getData('text/plain'))
  time = time + ':00'

  // Check if the drop location is already occupied
  const isDuplicate = role?.includes('Dentist')
    ? appointments.value.some(
        (a) =>
          a.appointmentDate === identifier && a.startTime === time && a.appointmentId !== appointmentData.appointmentId,
      )
    : appointments.value.some(
        (a) =>
          a.startTime === time &&
          getDoctorId(a.dentistId) === identifier &&
          getDoctorId(a.dentistId) !== getDoctorId(appointmentData.dentistId),
      )

  const isDuplicateFollowUp = role?.includes('Dentist')
    ? followUpAppointments.value.some(
        (a) => a.date === identifier && a.startTime === time && a.appointmentId !== appointmentData.appointmentId,
      )
    : followUpAppointments.value.some(
        (a) =>
          a.startTime === time &&
          getDoctorId(a.doctorProfileID) === identifier &&
          getDoctorId(a.doctorProfileID) !== getDoctorId(appointmentData.doctorProfileID),
      )

  if (isDuplicate || isDuplicateFollowUp) {
    init({
      title: 'error',
      message: 'Cannot assign booking. Time slot is already occupied.',
      color: 'danger',
    })
    return
  }

  if ('dentistId' in appointmentData) {
    // Regular appointment
    const index = appointments.value.findIndex((a) => a.appointmentId === appointmentData.appointmentId)
    if (index !== -1) {
      const updatedAppointment = {
        ...appointmentData,
        startTime: time,
        dentistId: role?.includes('Dentist') ? appointmentData.dentistId : getDoctorProfileId(identifier),
        appointmentDate: role?.includes('Dentist') ? identifier : appointmentData.appointmentDate,
      }
      appointments.value[index] = updatedAppointment

      // Call API to update appointment
      // storeAppointments
      //   .updateAppointment(updatedAppointment)
      //   .then(() => {
      //     init({
      //       title: 'success',
      //       message: 'Appointment updated successfully',
      //       color: 'success',
      //     })
      //     fetchAppointments(searchValueA.value)
      //   })
      //   .catch((error) => {
      //     const message = getErrorMessage(error)
      //     init({
      //       title: 'error',
      //       message: message,
      //       color: 'danger',
      //     })
      //   })
    }
  } else if ('doctorProfileID' in appointmentData) {
    // Follow-up appointment
    const followUpIndex = followUpAppointments.value.findIndex((a) => a.appointmentId === appointmentData.appointmentId)
    if (followUpIndex !== -1) {
      const updatedFollowUp = {
        ...appointmentData,
        startTime: time,
        doctorProfileID: role?.includes('Dentist') ? appointmentData.doctorProfileID : getDoctorProfileId(identifier),
        date: role?.includes('Dentist') ? identifier : appointmentData.date,
      }
      followUpAppointments.value[followUpIndex] = updatedFollowUp

      // Call API to update follow-up appointment
      // storeAppointments
      //   .updateFollowUpAppointment(updatedFollowUp)
      //   .then(() => {
      //     init({
      //       title: 'success',
      //       message: 'Follow-up appointment updated successfully',
      //       color: 'success',
      //     })
      //     fetchFollowUpAppointments(searchValueF.value)
      //   })
      //   .catch((error) => {
      //     const message = getErrorMessage(error)
      //     init({
      //       title: 'error',
      //       message: message,
      //       color: 'danger',
      //     })
      //   })
    }
  }
}

const showAppointmentDetails = (appointment: Appointment, event: MouseEvent) => {
  selectedAppointment.value = appointment
  appointmentModalPosition.value = { x: event.clientX + 10, y: event.clientY + 10 }
  showAppointmentModal.value = true
}

const showFollowUpAppointmentDetails = (appointment: FollowUpAppointment, event: MouseEvent) => {
  selectedFollowUpAppointment.value = appointment
  followUpModalPosition.value = { x: event.clientX + 10, y: event.clientY + 10 }
  showFollowUpAppointmentModal.value = true
}

const hideAppointmentDetails = () => {
  showAppointmentModal.value = false
}

const hideFollowUpAppointmentDetails = () => {
  showFollowUpAppointmentModal.value = false
}

const openContextMenu = (event: MouseEvent, time: string, doctorId: string) => {
  event.preventDefault()
  if (role?.includes('Patient') || role?.includes('Dentist')) return

  const calendarContainer = document.querySelector('.overflow-auto') as HTMLElement
  if (!calendarContainer) return

  const cell = (event.target as HTMLElement).closest('.h-20') as HTMLElement
  if (!cell) return

  // Calculate position relative to the viewport
  let x = event.clientX
  let y = event.clientY

  // Update context menu state with initial position
  contextMenu.value = {
    show: true,
    x,
    y,
    time,
    doctorId,
  }

  // Use nextTick to adjust position after menu is rendered
  nextTick(() => {
    const menu = document.querySelector('.context-menu') as HTMLElement
    if (!menu) return

    const menuRect = menu.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Adjust position if menu would overflow viewport
    if (x + menuRect.width > viewportWidth) {
      x = x - menuRect.width
    }

    if (y + menuRect.height > viewportHeight) {
      y = y - menuRect.height
    }

    // Ensure menu stays within viewport bounds
    x = Math.max(0, Math.min(x, viewportWidth - menuRect.width))
    y = Math.max(0, Math.min(y, viewportHeight - menuRect.height))

    // Update final position
    contextMenu.value = {
      show: true,
      x,
      y,
      time,
      doctorId,
    }
  })

  // Add scroll handler
  const handleContainerScroll = () => {
    contextMenu.value.show = false
  }

  // Add scroll event listener
  calendarContainer.addEventListener('scroll', handleContainerScroll, { once: true })
}

const handleResize = () => {
  if (contextMenu.value.show) {
    contextMenu.value.show = false
  }
}

const handleTimeSlotScroll = (event: Event) => {
  const target = event.target as HTMLElement
  if (calendarContainer.value) {
    calendarContainer.value.scrollTop = target.scrollTop
  }
}

const handleCalendarScroll = (event: Event) => {
  const target = event.target as HTMLElement
  if (timeSlotContainer.value) {
    timeSlotContainer.value.scrollTop = target.scrollTop
  }
}

const getDoctorId = (profileId: any) => {
  const doctor = doctors.value.find((d: Doctor) => d.doctorProfile.id === profileId)
  return doctor ? doctor.id : ''
}

const getDoctorProfileId = (doctorId: any) => {
  const doctor = doctors.value.find((d: Doctor) => d.doctorProfile.doctorId === doctorId)
  return doctor ? doctor.doctorProfile.id : ''
}

const getDoctorName = (doctorId: any) => {
  const doctor = doctors.value.find((d: Doctor) => d.doctorProfile.doctorId === doctorId)
  return doctor ? doctor.name : 'Unassigned'
}

const addMinutesToTime = (time: string, minutesToAdd: number): string => {
  const [hours, mins, seconds] = time.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, mins, seconds)
  date.setMinutes(date.getMinutes() + minutesToAdd)

  return date.toTimeString().slice(0, 8)
}

const isTimeInRange = (checkTime: string, startTime: string, endTime: string): boolean => {
  if (checkTime === startTime) {
    return true
  }
  return checkTime > startTime && checkTime < endTime
}

const getAppointments = (time: string, identifier: string) => {
  const startTime = time + ':00'
  const endTime = addMinutesToTime(startTime, 30)

  if (role?.includes('Dentist')) {
    // Filter appointments by date and time for Dentist role
    return appointments.value.filter(
      (a) => a.appointmentDate === identifier && isTimeInRange(a.startTime, startTime, endTime),
    )
  } else {
    // Keep the existing logic for other roles
    return appointments.value.filter(
      (a) => isTimeInRange(a.startTime, startTime, endTime) && getDoctorId(a.dentistId) === identifier,
    )
  }
}

const getFollowUpAppointments = (time: string, identifier: string) => {
  const startTime = time + ':00'
  const endTime = addMinutesToTime(startTime, 30)

  if (role?.includes('Dentist')) {
    // Filter follow-up appointments by date and time for Dentist role
    return followUpAppointments.value.filter(
      (a) => a.date === identifier && isTimeInRange(a.startTime, startTime, endTime),
    )
  } else {
    // Keep the existing logic for other roles
    return followUpAppointments.value.filter(
      (a) => isTimeInRange(a.startTime, startTime, endTime) && getDoctorId(a.doctorProfileID) === identifier,
    )
  }
}

const closeContextMenuOnClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (contextMenu.value.show && !target.closest('.context-menu')) {
    contextMenu.value.show = false
  }
}

const openCreateAppointmentDialog = () => {
  getPatients()
  getServices()
  patientId.value = {
    text: '',
    value: '',
  }
  doctorId.value = {
    text: '',
    value: '',
  }
  serviceId.value = {
    text: '',
    value: '',
  }
  date.value = new Date()
  startTime.value = ''
  notes.value = ''
  showModalAppointment.value = true
}

// calculate the width of the scrollbar of the calendar container
const scrollbarWidth = ref(0)
onMounted(() => {
  const scrollDiv = document.createElement('div')
  scrollDiv.style.width = '100px'
  scrollDiv.style.height = '100px'
  scrollDiv.style.overflow = 'scroll'
  scrollDiv.style.position = 'absolute'
  scrollDiv.style.top = '-9999px'
  document.body.appendChild(scrollDiv)
  scrollbarWidth.value = scrollDiv.offsetWidth - scrollDiv.clientWidth
  document.body.removeChild(scrollDiv)
})

onMounted(() => {
  document.addEventListener('click', closeContextMenuOnClickOutside)
  window.addEventListener('resize', handleResize)
  document.addEventListener('scroll', handleResize, true)
})

onUnmounted(() => {
  document.removeEventListener('click', closeContextMenuOnClickOutside)
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('scroll', handleResize, true)
})

// Add a new function to get the date for each weekday
const getWeekDayDate = (index: number) => {
  const weekStart = startOfWeek(selectedDate.value)
  const day = addDays(weekStart, index)
  return format(day, 'yyyy-MM-dd')
}

// Debounce function for API calls
const debouncedFetchAppointments = debounce(fetchAppointments, 300)
const debouncedFetchFollowUpAppointments = debounce(fetchFollowUpAppointments, 300)
const debouncedFetchNonDoctorAppointments = debounce(fetchNonDoctorAppointments, 300)

// Combine multiple watchers into a single watcher
watch(
  [
    () => selectedDate.value,
    () => selectedTime.value,
    () => currentView.value,
    () => paginationA.value.page,
    () => paginationA.value.perPage,
    () => paginationF.value.page,
    () => paginationF.value.perPage,
    () => paginationN.value.page,
    () => paginationN.value.perPage,
  ],
  ([newDate, newTime, newView, newPageA, newPerPageA, newPageF, newPerPageF, newPageN, newPerPageN]) => {
    // update request
    request.date = formatDateForm(newDate)
    // Update search values
    const updatedSearchValue = {
      date: formatDateForm(newDate),
      time: newTime,
    }

    const getPageSize = (currentPageSize: any) => (newView === 'calendar' ? 100 : currentPageSize)

    searchValueA.value = {
      ...searchValueA.value,
      ...updatedSearchValue,
      pageNumber: newPageA,
      pageSize: getPageSize(newPerPageA),
    }

    searchValueF.value = {
      ...searchValueF.value,
      ...updatedSearchValue,
      pageNumber: newPageF,
      pageSize: getPageSize(newPerPageF),
    }

    searchValueN.value = {
      ...searchValueN.value,
      ...updatedSearchValue,
      pageNumber: newPageN,
      pageSize: getPageSize(newPerPageN),
    }

    // Use debounced functions to fetch data
    debouncedFetchAppointments(searchValueA.value)
    debouncedFetchFollowUpAppointments(searchValueF.value)
    debouncedFetchNonDoctorAppointments(searchValueN.value)
    searchDoctor()

    // Handle view changes
    if (newView !== currentView.value) {
      handleViewChange()
    }
  },
  { deep: true },
)

// Add this function to handle view changes
const handleViewChange = () => {
  debouncedFetchAppointments(searchValueA.value)
  debouncedFetchFollowUpAppointments(searchValueF.value)
  debouncedFetchNonDoctorAppointments(searchValueN.value)
}

// Use a single watcher for search results
watch(
  [() => appointmentSearchRes.value, () => followUpAppointmentsSearchRes.value, () => nonDoctorSearchRes.value],
  ([newAppointmentRes, newFollowUpRes, newNonDoctorRes]) => {
    if (newAppointmentRes) {
      paginationA.value.total = newAppointmentRes.totalCount
      items.value = newAppointmentRes.data
    }
    if (newFollowUpRes) {
      paginationF.value.total = newFollowUpRes.totalCount
      followitems.value = newFollowUpRes.data
    }
    if (newNonDoctorRes) {
      paginationN.value.total = newNonDoctorRes.totalCount
      unassigneditems.value = newNonDoctorRes.data
    }
  },
  { deep: true },
)

// Optimize the watcher for available doctors
const debouncedFetchAvailableDoctors = debounce(fetchAvailableDoctors, 300)

watch(
  [serviceId, date, startTime],
  ([newServiceId, newDate, newStartTime]) => {
    if (newServiceId && newDate && newStartTime) {
      debouncedFetchAvailableDoctors()
    }
  },
  { deep: true },
)
</script>

<style scoped>
.small-text {
  font-size: 13px;
}
</style>
