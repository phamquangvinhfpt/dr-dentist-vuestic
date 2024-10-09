<template>
  <div class="flex flex-col h-[calc(100vh-64px)] sm:h-[calc(100vh-152px)] bg-gray-100 dark:font-semibold">
    <div class="flex-1 flex flex-col lg:flex-row">
      <div
        v-if="isStaff"
        :class="[
          'bg-white border-r lg:block',
          isUserListVisible || !selectedUser ? 'block' : 'hidden',
          'w-full lg:w-80 xl:w-96 h-full overflow-y-auto focus:scroll-smooth',
        ]"
      >
        <div class="p-4">
          <input type="text" placeholder="Search Messenger" class="w-full p-2 rounded-full bg-gray-100" />
        </div>
        <div class="overflow-y-auto h-[calc(100vh-68px)] lg:h-[calc(100vh-152px)] scrollbar-hide">
          <ul class="flex flex-col space-y-2">
            <li
              v-for="user in users"
              :key="user.id"
              :class="[
                'flex items-center p-3 hover:bg-gray-100 cursor-pointer',
                selectedUser === user ? 'bg-gray-100' : '',
              ]"
              @click="selectUser(user)"
            >
              <div class="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0 relative">
                <img
                  :src="user.imageUrl || 'https://www.svgrepo.com/show/452030/avatar-default.svg'"
                  alt="Avatar"
                  class="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0"
                />
                <div
                  :class="[
                    'w-2 h-2 rounded-full',
                    user.isOnline ? 'bg-green-300' : 'bg-slate-500',
                    'flex-shrink-0 absolute bottom-0 right-1 z-20',
                  ]"
                ></div>
              </div>
              <div class="ml-3 flex-grow overflow-hidden">
                <div class="font-semibold truncate">{{ user.name }}</div>
                <div class="text-sm text-gray-500 truncate">{{ user.lastMessage }}</div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Chat area -->
      <div :class="['flex-1 flex flex-col', selectedUser || isLargeScreen || !isStaff ? 'block' : 'hidden']">
        <template v-if="selectedUser || !isStaff">
          <!-- Chat header -->
          <div class="bg-white border-b p-4 flex items-center">
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
                  'flex-shrink-0 absolute bottom-0 right-1 z-20',
                ]"
              ></div>
            </div>
            <div class="font-semibold">
              {{ isStaff ? (selectedUser ? selectedUser.name : 'Chat Name') : staffName }}
            </div>
          </div>

          <!-- Message list -->
          <div class="overflow-y-auto h-[calc(100vh-200px)] lg:h-[calc(100vh-230px)] p-4 bg-white list">
            <template v-for="(messageGroup, groupIndex) in groupedMessages" :key="groupIndex">
              <div :class="['mb-4 flex', messageGroup[0].sender === 'me' ? 'justify-end' : 'justify-start relative']">
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
                    {{ messageGroup[0].sender === 'me' ? 'You' : messageGroup[0]?.name }}
                  </div>
                  <div
                    v-for="(message, messageIndex) in messageGroup"
                    :key="message.id"
                    :class="[
                      'p-3 rounded-2xl max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mb-1 h-auto break-words',
                      message.sender === 'me' ? 'bg-blue-500 text-white' : 'bg-gray-200',
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
                  <div class="text-xs">{{ messageGroup[0]?.time }}</div>
                </div>
              </div>
            </template>
          </div>

          <!-- Message input -->
          <div class="bg-white border-t p-4">
            <div class="flex items-center bg-gray-100 rounded-full p-2">
              <input
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
          </div>
        </template>
        <template v-else>
          <div class="flex-1 flex items-center justify-center bg-white">
            <p class="text-xl text-gray-500">Please select a user to start chatting</p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, onBeforeMount, watch, watchEffect } from 'vue'
import { chatService } from '@/services/chatService'
import { useAuthStore } from '@modules/auth.module'
import { getErrorMessage } from '@/services/utils'
import { useToast } from 'vuestic-ui/web-components'
import { useOnlineUsersStore } from '@/stores/online-users-store'
import { storeToRefs } from 'pinia'
import { debounce } from 'lodash'

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
const isLoading = ref(false)
const users = ref<User[]>()
const messages = ref<Message[]>([])
const onlineUsersStore = useOnlineUsersStore()
const { onlineUsers } = storeToRefs(onlineUsersStore)
const newMessage = ref('')
const selectedUser = ref<User | null>(null)
const isLargeScreen = ref(window.innerWidth >= 1024) // lg breakpoint
// New computed property to group messages
const groupedMessages = computed(() => {
  const groups: Message[][] = []
  let currentGroup: Message[] = []

  for (const message of messages.value) {
    if (currentGroup.length === 0 || currentGroup[currentGroup.length - 1].sender === message.sender) {
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
  if (selectedUser.value) {
    await chatService.leavePatientGroup()
  }
  selectedUser.value = user
  await chatService.joinPatientGroup()
  await getUserConversion(user.id.toString())
  // await chatService.markMessagesAsRead(user.id.toString())
  if (!isLargeScreen.value) {
    isUserListVisible.value = false
  }
  debouncedLoadUsers()
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
    console.log('Message sent', newMessage.value)
    newMessage.value = ''
  }
}

// chatService.onReceiveMessage(async (message) => {
//   console.log('New message received:', message)
//   await receiveMessage(message)
// })

chatService.onReceiveConversation((conversation) => {
  console.log('Conversation received:', conversation)
  messages.value = conversation.map((message: any) => ({
    id: message.id,
    content: message.message,
    sender: message.senderId === authStore.user?.id ? 'me' : 'other',
  }))
  console.log('Conversation received:', messages.value)
  scrollToBottom()
})

const receiveMessage = async (message: any) => {
  console.log('Receiving message:', message)
  const newMessage: any = {
    id: message.id,
    content: message.message,
    sender: message.senderId === authStore.user?.id ? 'me' : 'other',
    name: message.senderName,
    imageUrl: getSrcAvatar(message.imageUrl),
    time: new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  }
  console.log('new message:', newMessage)
  messages.value.push(newMessage)
  scrollToBottom()
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

const loadUsers = async (retryCount = 0) => {
  // console.log('Loading users... Attempt:', retryCount + 1)
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
    } else {
      // console.log('No messages received')
      if (retryCount < 3) {
        console.log('Retrying...')
        setTimeout(() => loadUsers(retryCount + 1), 1000)
        return
      }
    }
    handleUserOnline()
  } catch (error) {
    const message = getErrorMessage(error)
    // console.error('Error loading users:', message)
    if (retryCount < 3) {
      // console.log('Retrying due to error...')
      setTimeout(() => loadUsers(retryCount + 1), 1000)
      return
    }
    notify({
      title: 'Error',
      message: message,
      color: 'danger',
    })
  } finally {
    isLoading.value = false
  }

  if (!isStaff) {
    await getUserConversion(authStore.user?.id.toString() || '')
  } else {
    if (selectedUser.value) {
      await getUserConversion(selectedUser.value.id.toString())
    }
  }
}
const debouncedLoadUsers = debounce(loadUsers, 300)
const getUserConversion = async (userid: string) => {
  const conversions = await chatService.getConversation(userid)
  // push message one time
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
      // console.log('Userid:', user.id)
      const isOnline = onlineUsers.value.some((onlineUser) => onlineUser === user.id)
      // console.log('isOnline:', isOnline)
      user.isOnline = isOnline
      // console.log('User online:', user)
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

chatService.onReceiveMessage(async (message) => {
  await receiveMessage(message)
  loadUsers()
})

// watch(
//   messages,
//   () => {
//     loadUsers()
//   },
//   { deep: true },
// )
watchEffect(async () => {
  debouncedLoadUsers()
})
onBeforeMount(async () => {})

watch(
  messages,
  () => {
    scrollToBottom()
    debouncedLoadUsers()
  },
  { deep: true, immediate: true },
)

onUnmounted(() => {
  if (selectedUser.value) {
    chatService.leavePatientGroup()
    chatService.disconnect()
  }
})

onMounted(() => {
  scrollToBottom()
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
