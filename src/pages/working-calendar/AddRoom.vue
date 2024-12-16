<template>
  <div class="add-room-container">
    <h2 class="title">Thêm Phòng</h2>

    <form class="add-room-form" @submit.prevent="submitRoom">
      <div class="mb-4">
        <label for="roomName" class="block text-sm font-medium text-gray-700">Room Name</label>
        <input
          id="roomName"
          v-model="roomData.name"
          type="text"
          required
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>

      <button type="submit" class="mt-4 bg-blue-500 text-white py-2 px-4 rounded" :disabled="isLoading">
        Add Room
      </button>
    </form>

    <div v-if="successMessage" class="mt-4 text-green-600">{{ successMessage }}</div>
    <div v-if="errorMessage" class="mt-4 text-red-600">{{ errorMessage }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDoctorProfileStore } from '@/stores/modules/doctor.module'

const store = useDoctorProfileStore() // Initialize the store

const roomData = ref({
  name: '',
})

const successMessage = ref('')
const errorMessage = ref('')
const isLoading = ref(false)
const isRoomExisting = async (roomName: string) => {
  try {
    const response = await store.getRoom({ pageNumber: 1, pageSize: 1000 }) // Lấy danh sách phòng
    const rooms = response.data || []
    return rooms.some((room: { roomName: string }) => room.roomName === roomName)
  } catch (error) {
    console.error('Failed to fetch room list:', error)
    return false
  }
}

const submitRoom = async () => {
  isLoading.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    // Kiểm tra tên phòng trước khi gửi yêu cầu
    const exists = await isRoomExisting(roomData.value.name)
    if (exists) {
      errorMessage.value = 'Room already exists. Please choose a different name.'
      return
    }

    // Nếu phòng chưa tồn tại, gửi yêu cầu tạo phòng
    await store.createRoom(roomData.value)
    successMessage.value = 'Room added successfully!'
    roomData.value = { name: '' } // Reset form
  } catch (error: any) {
    errorMessage.value = 'Failed to add room. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* Navigation Bar */
.nav-bar {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  padding: 10px 20px;
  background-color: #ffffff; /* Màu nền trắng */
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Đổ bóng nhẹ */
  transition: box-shadow 0.3s;
}

.nav-bar:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2); /* Đổ bóng khi di chuột */
}

.nav-button {
  background-color: transparent; /* Nền trong suốt cho trạng thái mặc định */
  color: #333; /* Màu chữ mặc định */
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
  margin: 0 10px;
  font-size: 16px;
  font-weight: 500;
  transition:
    background-color 0.3s,
    transform 0.2s; /* Hiệu ứng chuyển màu và phóng to */
}

.nav-button.active {
  background-color: #28a745; /* Màu nền xanh lá cho nút "Thêm Phòng" đang hoạt động */
  color: white; /* Chữ màu trắng */
}

.nav-button:hover {
  background-color: #e8f0fe; /* Nền xanh nhạt khi di chuột */
  color: #007bff; /* Chữ màu xanh dương */
}

.add-room-container {
  max-width: 600px;
  margin: auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.add-room-form {
  display: flex;
  flex-direction: column;
}

.add-room-form label {
  margin-bottom: 8px;
}

.add-room-form input,
.add-room-form select {
  margin-bottom: 16px;
}
</style>
