<template>
  <div class="room-list">
    <h1 class="title">Danh sách phòng khám</h1>

    <!-- Navigation Bar -->
    <div class="nav-bar">
      <button class="nav-button active" @click="goToListRoom">Danh sách phòng</button>
      <button class="nav-button" @click="goToAddRoom">Thêm phòng mới</button>
    </div>

    <input
      v-model="searchKeyword"
      type="text"
      class="search-input"
      placeholder="Tìm kiếm theo tên phòng"
      @input="searchRooms"
    />

    <!-- Updated Room Cards Layout -->
    <div v-if="filteredRooms.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <div
        v-for="room in filteredRooms"
        :key="room.id"
        class="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105"
      >
        <div class="p-4">
          <h3 class="font-semibold text-lg mb-2 truncate" :title="room.roomName">
            {{ room.roomName }}
          </h3>
          <span
            :class="[
              'px-2 py-1 rounded-full text-xs mb-2 inline-flex items-center',
              room.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
            ]"
          >
            <CheckCircleIcon v-if="room.status" class="w-3 h-3 mr-1" />
            <XCircleIcon v-else class="w-3 h-3 mr-1" />
            {{ room.status ? 'Hoạt động' : 'Không hoạt động' }}
          </span>
          <div class="text-xs text-gray-500 flex items-center mb-1">
            <CalendarIcon class="w-3 h-3 mr-1" />
            <span>{{ formatDate(room.createdOn) }}</span>
          </div>
          <div class="text-xs text-gray-500 flex items-center">
            <ClockIcon class="w-3 h-3 mr-1" />
            <span>{{ formatDate(room.lastModifiedOn) }}</span>
          </div>
        </div>
        <button
          class="w-full py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-300"
          @click="viewDetails(room.id)"
        >
          Xem chi tiết
        </button>
      </div>
    </div>
    <p v-else class="text-center text-gray-500">Không có phòng nào.</p>

    <!-- Pagination Controls -->
    <div class="flex items-center justify-between mt-8">
      <p class="text-sm text-gray-600">Trang {{ currentPage }} / {{ totalPages }}</p>
      <div class="flex items-center space-x-2">
        <button
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!hasPreviousPage"
          @click="previousPage"
        >
          <ChevronLeftIcon class="w-4 h-4 mr-1 inline" />
          Trang trước
        </button>
        <button
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!hasNextPage"
          @click="nextPage"
        >
          Trang sau
          <ChevronRightIcon class="w-4 h-4 ml-1 inline" />
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
.nav-bar {
  display: flex;
  justify-content: flex-start; /* Căn trái */
  margin-bottom: 20px;
  padding: 5px 10px;
  background-color: #f0f0f0; /* Màu nền nhẹ */
  border-radius: 10px; /* Bo góc mềm mại */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Đổ bóng nhẹ */
}

.nav-button {
  background-color: transparent; /* Nền trong suốt */
  color: #333; /* Màu chữ mặc định */
  border: none;
  padding: 10px 20px;
  margin-right: 15px; /* Khoảng cách giữa các nút */
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 5px;
  transition:
    background-color 0.3s,
    color 0.3s; /* Hiệu ứng màu sắc */
}

.nav-button.active {
  background-color: #007bff; /* Màu nền xanh cho nút đang hoạt động */
  color: white; /* Màu chữ trắng */
}

.nav-button:hover {
  background-color: #e8f0fe; /* Nền xanh nhạt khi di chuột */
  color: #007bff; /* Chữ màu xanh */
}
.room-list {
  padding: 20px;
  background-color: #f9f9f9; /* Thêm màu nền nhẹ */
  border-radius: 8px; /* Bo góc cho khung */
}

.title {
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center; /* Căn giữa tiêu đề */
}

.search-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 20px; /* Thêm khoảng cách dưới ô tìm kiếm */
}

.room-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center; /* Căn giữa các thẻ phòng */
}

.room-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 16px;
  width: 220px; /* Tăng chiều rộng cho thẻ phòng */
  text-align: center;
  transition: transform 0.2s; /* Hiệu ứng chuyển động */
}

.room-card:hover {
  transform: scale(1.05); /* Phóng to khi di chuột */
}

.details-button {
  background-color: #007bff; /* Màu nền cho nút */
  color: white; /* Màu chữ */
  border: none;
  border-radius: 4px;
  padding: 10px 15px;
  cursor: pointer;
}

.details-button:hover {
  background-color: #0056b3; /* Màu nền khi di chuột */
}

.inactive {
  background-color: #f8d7da;
}

.active {
  color: green;
}

.inactive {
  color: red;
}
</style>
```
