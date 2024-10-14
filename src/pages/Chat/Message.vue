<template>
  <VaInnerLoading>
    <VaCard>
      <div class="flex flex-col h-[calc(100vh-64px)] lg:h-[calc(100vh-126px)] dark:font-semibold">
        <VaCard class="flex-1 flex flex-col lg:flex-row">
          <VaCard
            v-if="isStaff"
            :class="[
              'lg:block border-r border-gray-300',
              isUserListVisible || !selectedUser ? 'block' : 'hidden',
              'w-full lg:w-80 xl:w-96 h-full overflow-y-auto focus:scroll-smooth',
            ]"
          >
            <div class="p-4 animate-pulse">
              <VaInput type="text" placeholder="Search Messenger" label="Search" />
            </div>
            <VaScrollContainer
              vertical
              :color="currentColor"
              class="overflow-y-auto h-[calc(100vh-68px)] lg:h-[calc(100vh-210px)]"
            >
              <VaList class="flex flex-col space-y-2">
                <VaSidebarItem
                  v-for="user in users"
                  :key="user.id"
                  :class="['flex items-center p-3 cursor-pointer']"
                  :active="selectedUser?.id === user.id"
                  :hover-opacity="0.5"
                  @click="selectUser(user)"
                >
                  <div class="flex items-center">
                    <VaBadge
                      dot
                      overlap
                      placement="bottom-right"
                      :offset="[-7, -7]"
                      class="mr-2"
                      :color="user.isOnline ? 'success' : 'secondary'"
                    >
                      <VaAvatar
                        :src="user.imageUrl || 'https://www.svgrepo.com/show/452030/avatar-default.svg'"
                        alt="Avatar"
                      />
                    </VaBadge>
                  </div>
                  <div class="ml-3 flex-grow overflow-hidden">
                    <div class="font-semibold truncate">{{ user.name }}</div>
                    <div class="text-sm font-thin truncate">{{ user.lastMessage }}</div>
                  </div>
                </VaSidebarItem>
              </VaList>
            </VaScrollContainer>
          </VaCard>

          <!-- Chat area -->
          <VaCard :class="['flex-1 flex flex-col', selectedUser || isLargeScreen || !isStaff ? 'block' : 'hidden']">
            <template v-if="selectedUser || !isStaff">
              <!-- Chat header -->
              <VaCard class="p-4 flex items-center">
                <button class="lg:hidden text-blue-500 mr-2" @click="deselectUser">
                  <svg
                    class="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                </button>
                <div class="w-10 h-10 rounded-full bg-gray-300 mr-3 relative">
                  <img
                    :src="selectedUser?.imageUrl || 'https://www.svgrepo.com/show/452030/avatar-default.svg'"
                    alt="Avatar"
                    class="w-10 h-10 rounded-full bg-gray-300"
                  />
                  <div
                    :class="[
                      'w-2 h-2 rounded-full',
                      isStaff ? (selectedUser?.isOnline ? 'bg-green-300' : 'bg-slate-500') : 'bg-red-300',
                      'flex-shrink-0 absolute bottom-0 right-1 z-20 p-1.5 translate-x-1',
                    ]"
                  ></div>
                </div>
                <div class="font-semibold">
                  {{ isStaff ? (selectedUser ? selectedUser.name : 'Chat Name') : staffName }}
                </div>
              </VaCard>
              <VaDivider />
              <!-- Message list -->
              <VaScrollContainer
                vertical
                :color="currentColor"
                class="overflow-y-auto h-[calc(100vh-200px)] lg:h-[calc(100vh-313px)] p-4 list"
              >
                <template v-for="(messageGroup, groupIndex) in groupedMessages" :key="groupIndex">
                  <div
                    :class="['mb-4 flex', messageGroup[0].sender === 'me' ? 'justify-end' : 'justify-start relative']"
                  >
                    <div
                      v-if="messageGroup[0].sender !== 'me'"
                      class="w-8 h-8 rounded-full bg-gray-300 mr-2 flex-shrink-0 self-end group"
                    >
                      <img
                        :src="messageGroup[0]?.imageUrl || 'https://www.svgrepo.com/show/452030/avatar-default.svg'"
                        alt="Avatar"
                        class="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"
                      />
                      <!-- <div class="text-xs absolute">{{messageGroup[0]?.time}}</div> -->
                    </div>
                    <div class="flex flex-col">
                      <div class="text-sm text-gray-500 mb-1 absolute -top-5 font-semibold">
                        {{ messageGroup[0].sender === 'me' ? '' : messageGroup[0]?.name }}
                      </div>
                      <div class="flex flex-col w-full">
                        <div
                          v-for="(message, messageIndex) in messageGroup"
                          :key="message.id"
                          :class="['flex mb-1', message.sender === 'me' ? 'justify-end' : 'justify-start']"
                        >
                          <div
                            :class="[
                              'p-1.5 rounded-xl max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg break-words',
                              message.sender === 'me' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black',
                              messageIndex === 0 ? (message.sender === 'me' ? 'rounded-br-sm' : 'rounded-bl-sm') : '',
                              messageIndex === messageGroup.length - 1
                                ? message.sender === 'me'
                                  ? 'rounded-tr-sm'
                                  : 'rounded-tl-sm'
                                : '',
                              messageIndex !== 0 && messageIndex !== messageGroup.length - 1
                                ? message.sender === 'me'
                                  ? 'rounded-r-sm'
                                  : 'rounded-l-sm'
                                : '',
                            ]"
                          >
                            {{ message.content }}
                          </div>
                        </div>
                        <div :class="['text-xs', messageGroup[0].sender === 'me' ? 'text-right' : 'text-left']">
                          {{ messageGroup[0]?.time }}
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </VaScrollContainer>

              <!-- Message input -->
              <VaDivider />
              <VaCard class="p-4">
                <div class="flex items-center rounded-full p-2">
                  <VaInput
                    v-model="newMessage"
                    type="text"
                    placeholder="Aa"
                    class="flex-1 bg-transparent outline-none"
                    @keyup.enter="sendMessage"
                  />

                  <button class="text-blue-500" @click="sendMessage">
                    <svg
                      class="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      ></path>
                    </svg>
                  </button>
                </div>
              </VaCard>
            </template>
            <template v-else>
              <VaCard class="flex-1 flex items-center justify-center">
                <p class="text-xl text-gray-500">Please select a user to start chatting</p>
              </VaCard>
            </template>
          </VaCard>
        </VaCard>
      </div>
    </VaCard>
  </VaInnerLoading>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, watchEffect } from 'vue'
import { chatService } from '@/services/chatService'
import { useAuthStore } from '@modules/auth.module'
import { getErrorMessage } from '@/services/utils'
import {
  useToast,
  VaAvatar,
  VaBadge,
  VaCard,
  VaInnerLoading,
  VaInput,
  VaList,
  VaScrollContainer,
  VaSidebarItem,
} from 'vuestic-ui'
import { useOnlineUsersStore } from '@/stores/online-users-store'
import { storeToRefs } from 'pinia'
import signalRService from '@/signalR'

interface User {
  id: string
  name: string
  lastMessage?: string
  imageUrl?: string
  isOnline?: boolean
}

interface Message {
  id: number
  content: string
  sender: 'me' | 'other'
  name?: string
  imageUrl?: string
  time?: string
}

const authStore = useAuthStore()

// Computed roles
const isStaff = computed(() => authStore?.musHaveRole('Staff')).value
const staffName = ref('Staff')
const { init: notify } = useToast()
// Refs
const isUserListVisible = ref(false)
const currentColor = ref('primary')
const isLoading = ref(false)
const users = ref<User[]>()
const messages = ref<Message[]>([])
const onlineUsersStore = useOnlineUsersStore()
const { onlineUsers } = storeToRefs(onlineUsersStore)
const { receivedMessage } = storeToRefs(onlineUsersStore)
const newMessage = ref('')
const selectedUser = ref<User | null>(null)
const isLargeScreen = ref(window.innerWidth >= 1024) // lg breakpoint
// New computed property to group messages
const groupedMessages = computed(() => {
  const groups: Message[][] = []
  let currentGroup: Message[] = []

  for (const message of messages.value) {
    if (
      currentGroup.length === 0 ||
      (currentGroup[currentGroup.length - 1].sender === message.sender &&
        currentGroup[currentGroup.length - 1].name === message.name)
    ) {
      currentGroup.push(message)
    } else {
      groups.push(currentGroup)
      currentGroup = [message]
    }
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup)
  }

  return groups
})
// Methods
const selectUser = async (user: User) => {
  selectedUser.value = user
  await getUserConversion(user.id.toString())
  if (!isLargeScreen.value) {
    isUserListVisible.value = false
  }
  scrollToBottom()
}

const deselectUser = () => {
  selectedUser.value = null
  isUserListVisible.value = true
}

const scrollToBottom = () => {
  const messageList = document.querySelector('.list')
  if (messageList) {
    messageList.scrollTop = messageList.scrollHeight + 6
  }
}

const sendMessage = async () => {
  if (newMessage.value.trim() || selectedUser.value) {
    await chatService.sendMessage(selectedUser.value?.id.toString() || '', newMessage.value)
    messages.value.push({
      id: messages.value.length + 1,
      content: newMessage.value,
      sender: 'me',
      name: authStore.user?.fullName,
      imageUrl: getSrcAvatar(authStore.user?.avatarUrl),
      time: new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    })
    newMessage.value = ''
    scrollToBottom()
  }
}

const getSrcAvatar = (img: any) => {
  const url = import.meta.env.VITE_APP_BASE_URL as string
  const url_without_api = url.slice(0, -3)
  if (img) return `${url_without_api}${img}`
  return ''
}

const convertDateTimeToTime = (date: string) => {
  // convert date to time only vd: 12:00 vietnam
  return new Date(date).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const loadUsers = async () => {
  const url = import.meta.env.VITE_APP_BASE_URL
  const url_without_api = url.slice(0, -3)
  const messagePath = url_without_api + 'chat'
  if (!signalRService.isConnected('messageHub')) {
    console.warn('SignalR chưa kết nối đến messageHub. Đợi kết nối hoàn tất...')
    await signalRService.connect(messagePath, 'messageHub')
  }
  isLoading.value = true
  try {
    const messages = await chatService.getListUserDto()
    if (messages && messages.length > 0) {
      // console.log('Messages loaduers:', messages)
      users.value = messages.map((message: any) => ({
        id: message.senderId,
        name: message.senderName,
        lastMessage: message.latestMessage,
        imageUrl: getSrcAvatar(message.imageUrl),
      }))
      // console.log('Users loaded successfully:', users.value)
    }
    handleUserOnline()
  } catch (error) {
    const message = getErrorMessage(error)
    notify({
      title: 'Error',
      message: message,
      color: 'danger',
    })
  } finally {
    isLoading.value = false
  }
  if (!isStaff) {
    getUserConversion(authStore.user?.id.toString() || '')
  }
  scrollToBottom()
  // mock 20 users
  // users.value = Array.from({ length: 20 }, (_, i) => ({
  //   id: i.toString(),
  //   name: `User ${i + 1}`,
  //   lastMessage: 'Hello',
  //   imageUrl: '',
  // }))
}
const getUserConversion = async (userid: string) => {
  const conversions = await chatService.getConversation(userid)
  messages.value = conversions.map((message: any) => ({
    id: message.id,
    content: message.message,
    sender: message.senderId === authStore.user?.id ? 'me' : 'other',
    name: message.senderName,
    imageUrl: getSrcAvatar(message.imageUrl),
    time: convertDateTimeToTime(message.createdOn),
  }))
}

const handleUserOnline = () => {
  if (users.value && onlineUsers.value) {
    users.value.forEach((user) => {
      const isOnline = onlineUsers.value.some((onlineUser) => onlineUser === user.id)
      user.isOnline = isOnline
    })
  }
}
watch(
  onlineUsers,
  () => {
    handleUserOnline()
  },
  { immediate: true },
)

watch(
  receivedMessage,
  () => {
    messages.value.push({
      id: receivedMessage.value.id,
      content: receivedMessage.value?.message,
      sender: receivedMessage.value.senderId === authStore.user?.id ? 'me' : 'other',
      name: receivedMessage.value.senderName,
      imageUrl: receivedMessage.value.imageUrl
        ? getSrcAvatar(receivedMessage.value.imageUrl)
        : 'https://www.svgrepo.com/show/452030/avatar-default.svg',
      time: convertDateTimeToTime(receivedMessage.value.createdOn),
    })
    scrollToBottom()
  },
  { immediate: true },
)

// update length of messages
watchEffect(() => {
  scrollToBottom()
})

onMounted(() => {
  scrollToBottom()
  loadUsers()
})
</script>
<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
