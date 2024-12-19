<template>
  <div class="room-list">
    <h1 class="title">Danh sách phòng khám</h1>

    <!-- Navigation Bar -->
    <div class="nav-bar">
      <button class="nav-button active" @click="goToListRoom">Danh sách phòng</button>
      <button class="nav-button" @click="goToAddRoom">Thêm phòng mới</button>
    </div>

    <!-- Search Input -->
    <div class="relative">
      <input
        v-model="searchKeyword"
        type="text"
        class="search-input w-full border border-gray-300 rounded-lg py-1 pl-10 pr-4 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
        placeholder="Tìm kiếm theo tên phòng"
        @input="searchRooms"
      />
      <svg
        class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        width="20"
        height="20"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-4.35-4.35m1.6-5.4A7.5 7.5 0 1110 2.5a7.5 7.5 0 018.25 8.25z"
        ></path>
      </svg>
    </div>

    <!-- Room Cards -->
    <div
      v-if="filteredRooms.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6"
    >
      <div v-for="room in filteredRooms" :key="room.id" class="room-card">
        <div class="p-4">
          <h3 class="font-semibold text-lg mb-2 truncate" :title="room.roomName">
            {{ room.roomName }}
          </h3>
          <span :class="['status-badge', room.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
            <CheckCircleIcon v-if="room.status" class="w-4 h-4 mr-1" />
            <XCircleIcon v-else class="w-4 h-4 mr-1" />
            {{ room.status ? 'Hoạt động' : 'Không hoạt động' }}
          </span>
          <p class="text-sm text-gray-600">Bác sĩ: {{ room.doctorName }}</p>
        </div>
      </div>
    </div>

    <!-- No Rooms Message -->
    <p v-else class="text-center text-gray-500">Không có phòng nào.</p>

    <!-- Pagination -->
    <div class="pagination-controls">
      <p class="text-sm text-gray-600">Trang {{ currentPage }} / {{ totalPages }}</p>
      <div class="pagination-buttons">
        <button class="pagination-button" :disabled="!hasPreviousPage" @click="previousPage">
          <ChevronLeftIcon class="w-4 h-4 mr-1" /> Trang trước
        </button>
        <button class="pagination-button" :disabled="!hasNextPage" @click="nextPage">
          Trang sau <ChevronRightIcon class="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDoctorProfileStore } from '@/stores/modules/doctor.module'

interface Room {
  id: string
  roomName: string
  status: boolean
  createdOn: string
  lastModifiedOn: string
  doctorName: string
}

export default defineComponent({
  setup() {
    const store = useDoctorProfileStore()
    const router = useRouter()
    const searchKeyword = ref('')
    const currentPage = ref(1)
    const rooms = ref<Room[]>([])
    const totalPages = ref(0)

    const fetchRooms = async () => {
      const response = await store.getRoom({
        pageNumber: currentPage.value,
        pageSize: 10,
      })
      rooms.value = response.data
      totalPages.value = response.totalPages
    }

    const searchRooms = () => {
      fetchRooms()
    }

    const viewDetails = (roomId: string) => {
      // Navigate to room details page
      router.push(`/room-details/${roomId}`)
    }

    const changePage = (page: number) => {
      currentPage.value = page
      fetchRooms()
    }

    const filteredRooms = computed(() => {
      return rooms.value.filter((room) => {
        const roomName = room.roomName || '' // Gán giá trị mặc định nếu roomName là null hoặc undefined
        return roomName.toLowerCase().includes(searchKeyword.value.toLowerCase())
      })
    })

    const goToAddRoom = () => {
      router.push('/add-room')
    }

    const goToListRoom = () => {
      router.push('/rooms')
    }
    onMounted(fetchRooms)

    return {
      searchKeyword,
      rooms,
      totalPages,
      currentPage,
      searchRooms,
      viewDetails,
      changePage,
      filteredRooms,
      goToAddRoom,
      goToListRoom,
      hasPreviousPage: computed(() => currentPage.value > 1),
      hasNextPage: computed(() => currentPage.value < totalPages.value),
      formatDate: (dateString: string) => new Date(dateString).toLocaleDateString('vi-VN'),
      previousPage: () => {
        if (currentPage.value > 1) currentPage.value--
      },
      nextPage: () => {
        if (currentPage.value < totalPages.value) currentPage.value++
      },
    }
  },
})
</script>
<style scoped>
.room-list {
  padding: 20px;
  background-color: #f4f7f9;
  border-radius: 10px;
}

.title {
  font-size: 28px;
  color: #333;
  font-weight: 600;
  text-align: center;
  margin-bottom: 20px;
}

.nav-bar {
  display: flex;
  justify-content: center;
  background-color: #eef2f6;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.nav-button {
  display: flex;
  align-items: center;
  background-color: transparent;
  color: #555;
  border: none;
  padding: 10px 20px;
  margin: 0 10px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s;
}

.nav-button.active {
  background-color: #007bff;
  color: #fff;
}

.nav-button:hover {
  background-color: #dbeafe;
  color: #007bff;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
  outline: none;
  font-size: 14px;
  transition: all 0.3s;
}

.search-input:focus {
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}

.room-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s,
    box-shadow 0.3s;
}

.room-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.details-button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 0 0 8px 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.details-button:hover {
  background-color: #0056b3;
}

.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.pagination-buttons {
  display: flex;
  gap: 10px;
}

.pagination-button {
  padding: 8px 16px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.pagination-button:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
}

.pagination-button:hover:not(:disabled) {
  background-color: #0056b3;
}
</style>
