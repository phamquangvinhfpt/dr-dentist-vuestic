<template>
  <div class="calendar-page">
    <div class="header">
      <div>
        <h1>{{ doctor.name }}'s Schedule</h1>
        <p class="specialty">{{ doctor.specialty }}</p>
      </div>
    </div>

    <VaCard class="schedule-card">
      <VaCardContent>
        <table class="schedule-table">
          <thead>
            <tr>
              <th>Time</th>
              <th v-for="day in weekDays" :key="day.date">{{ day.name }}, {{ day.date }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="time in timeSlots" :key="time">
              <td class="time-cell">{{ time }}</td>
              <td v-for="day in weekDays" :key="`${day.date}-${time}`" class="slot-cell">
                <div
                  class="slot-status"
                  :class="{
                    available: getSlotStatus(day.date, time) === 'Available',
                    break: getSlotStatus(day.date, time) === 'Break',
                    booked: getSlotStatus(day.date, time).includes('John Doe'),
                  }"
                >
                  {{ getSlotStatus(day.date, time) }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </VaCardContent>
    </VaCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Doctor {
  name: string
  specialty: string
}

interface WeekDay {
  name: string
  date: string
}

const doctor = ref<Doctor>({
  name: 'Dr. Sarah Smith',
  specialty: 'Orthodontist',
})

const timeSlots = ref(['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'])

const weekDays = ref<WeekDay[]>([
  { name: 'Mon', date: 'Nov 18' },
  { name: 'Tue', date: 'Nov 19' },
  { name: 'Wed', date: 'Nov 20' },
  { name: 'Thu', date: 'Nov 21' },
  { name: 'Fri', date: 'Nov 22' },
])

const schedule = {
  'Nov 18': {
    '09:00': 'Available',
    '10:00': 'Available',
    '11:00': 'Break',
    '12:00': 'Available',
    '13:00': 'Available',
    '14:00': 'Available',
    '15:00': 'John Doe',
    '16:00': 'Available',
    '17:00': 'Break',
  },
  'Nov 19': {
    '09:00': 'John Doe',
    '10:00': 'Available',
    '11:00': 'John Doe',
    '12:00': 'Available',
    '13:00': 'John Doe',
    '14:00': 'Break',
    '15:00': 'John Doe',
    '16:00': 'Available',
    '17:00': 'John Doe',
  },
  'Nov 20': {
    '09:00': 'John Doe',
    '10:00': 'Available',
    '11:00': 'John Doe',
    '12:00': 'John Doe',
    '13:00': 'Break',
    '14:00': 'Available',
    '15:00': 'Available',
    '16:00': 'John Doe',
    '17:00': 'Available',
  },
  'Nov 21': {
    '09:00': 'John Doe',
    '10:00': 'John Doe',
    '11:00': 'Break',
    '12:00': 'Available',
    '13:00': 'Available',
    '14:00': 'John Doe',
    '15:00': 'Available',
    '16:00': 'John Doe',
    '17:00': 'Available',
  },
  'Nov 22': {
    '09:00': 'Available',
    '10:00': 'John Doe',
    '11:00': 'Available',
    '12:00': 'Available',
    '13:00': 'Available',
    '14:00': 'John Doe',
    '15:00': 'Available',
    '16:00': 'Available',
    '17:00': 'Available',
  },
}

const getSlotStatus = (date: string, time: string): string => {
  if (!schedule[date]) {
    return 'Available'
  }
  return schedule[date][time] || 'Available'
}
</script>

<style scoped>
.calendar-page {
  padding: 24px;
}

.header {
  margin-bottom: 24px;
}

h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.specialty {
  color: #6b7280;
  margin: 4px 0 0 0;
}

.schedule-card {
  overflow-x: auto;
}

.schedule-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.schedule-table th {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
  color: #6b7280;
  font-weight: 500;
}

.time-cell {
  color: #6b7280;
  font-weight: 500;
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  width: 80px;
}

.slot-cell {
  padding: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.slot-status {
  padding: 6px 12px;
  border-radius: 4px;
  text-align: center;
  font-size: 14px;
}

.available {
  background-color: #d1fae5;
  color: #065f46;
}

.break {
  background-color: #f3f4f6;
  color: #4b5563;
}

.booked {
  background-color: #dbeafe;
  color: #1e40af;
}
</style>
