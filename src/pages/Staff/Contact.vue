<template>
  <div class="contact-page">
    <div class="header">
      <h1>Contact Requests</h1>
      <VaButton class="add-contact-btn" color="primary" @click="addContact"> Add Contact </VaButton>
    </div>

    <VaCard class="mt-4">
      <VaCardContent>
        <table class="contact-table">
          <thead>
            <tr>
              <th>NAME</th>
              <th>PHONE</th>
              <th>EMAIL</th>
              <th>STATUS</th>
              <th>DATE</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="contact in contacts" :key="contact.id">
              <td>{{ contact.name }}</td>
              <td>{{ contact.phone }}</td>
              <td>{{ contact.email }}</td>
              <td>
                <VaBadge :color="contact.status === 'New' ? 'info' : 'gray'" :text="contact.status" />
              </td>
              <td>{{ contact.date }}</td>
            </tr>
          </tbody>
        </table>
      </VaCardContent>
    </VaCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Contact {
  id: number
  name: string
  phone: string
  email: string
  status: 'New' | 'Contacted'
  date: string
}

const contacts = ref<Contact[]>([
  {
    id: 1,
    name: 'Sarah Wilson',
    phone: '(555) 123-4567',
    email: 'sarah.w@example.com',
    status: 'New',
    date: '2024-03-19',
  },
  {
    id: 2,
    name: 'Michael Brown',
    phone: '(555) 987-6543',
    email: 'michael.b@example.com',
    status: 'Contacted',
    date: '2024-03-18',
  },
])

const addContact = () => {
  // Implement add contact logic
}
</script>

<style scoped>
.contact-page {
  padding: 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.add-contact-btn {
  padding: 8px 16px;
  border-radius: 6px;
}

.contact-table {
  width: 100%;
  border-collapse: collapse;
}

.contact-table th {
  text-align: left;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  border-bottom: 1px solid #e5e7eb;
}

.contact-table td {
  padding: 16px;
  font-size: 14px;
  border-bottom: 1px solid #e5e7eb;
}

.contact-table tr:hover {
  background-color: #f9fafb;
}

/* Status badge styles */
:deep(.va-badge) {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

:deep(.va-badge--info) {
  background-color: #ebf5ff;
  color: #1e40af;
}

:deep(.va-badge--gray) {
  background-color: #f3f4f6;
  color: #4b5563;
}
</style>
