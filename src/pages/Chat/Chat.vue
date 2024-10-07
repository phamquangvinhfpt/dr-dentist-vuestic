<template>
  <div class="flex flex-col h-[calc(100vh-64px)] sm:h-[calc(100vh-152px)] bg-gray-100">
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
              <div class="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0"></div>
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
            <div class="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
            <div class="font-semibold">
              {{ isStaff ? (selectedUser ? selectedUser.name : 'Chat Name') : staffName }}
            </div>
          </div>

          <!-- Message list -->
          <div class="overflow-y-auto h-[calc(100vh-200px)] lg:h-[calc(100vh-230px)] p-4 bg-white list">
            <template v-for="(messageGroup, groupIndex) in groupedMessages" :key="groupIndex">
              <div :class="['mb-4 flex', messageGroup[0].sender === 'me' ? 'justify-end' : 'justify-start']">
                <div
                  v-if="messageGroup[0].sender !== 'me'"
                  class="w-8 h-8 rounded-full bg-gray-300 mr-2 flex-shrink-0 self-end"
                ></div>
                <div class="flex flex-col">
                  <div
                    v-for="(message, messageIndex) in messageGroup"
                    :key="message.id"
                    :class="[
                      'p-3 rounded-2xl max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mb-1',
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
                    <div v-if="message.attachments && message.attachments.length > 0" class="mt-2">
                      <div v-if="message.attachments[0].type === 'image'" class="grid grid-cols-2 gap-1">
                        <template v-for="(attachment, index) in message.attachments.slice(0, 4)" :key="index">
                          <div class="relative aspect-square">
                            <img :src="attachment.url" class="w-full h-full object-cover rounded-lg" />
                            <div
                              v-if="index === 3 && message.attachments.length > 4"
                              class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg"
                            >
                              <span class="text-white text-xl font-bold">+{{ message.attachments.length - 4 }}</span>
                            </div>
                          </div>
                        </template>
                      </div>
                      <div v-else-if="message.attachments[0].type === 'audio'" class="audio-player">
                        <audio controls :src="message.attachments[0].url" class="w-full"></audio>
                      </div>
                      <div v-else class="file-attachment">
                        <a :href="message.attachments[0].url" download class="text-sm underline"
                          >Download {{ message.attachments[0].name }}</a
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <!-- Message input -->
          <div class="bg-white border-t p-4">
            <div class="flex items-center bg-gray-100 rounded-full p-2">
              <button class="text-gray-500 mr-2" @click="openAttachmentMenu">
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  ></path>
                </svg>
              </button>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { chatService } from '@/services/chatService'
import { useAuthStore } from '@modules/auth.module'

interface User {
  id: string
  name: string
  lastMessage?: string
}

interface Attachment {
  type: 'image' | 'audio' | 'file'
  url: string
  name?: string
}

interface Message {
  id: number
  content: string
  sender: 'me' | 'other'
  attachments?: Attachment[]
}

const authStore = useAuthStore()

// Computed roles
const isStaff = computed(() => authStore?.musHaveRole('Staff')).value
const staffName = ref('Staff')

// Refs
const isUserListVisible = ref(false)
const users = ref<User[]>([
  { id: 'd76a46cc-9322-4d69-b582-8311639cd98e', name: 'Alice Johnson', lastMessage: 'Hey, how are you doing?' },
  // Add more users here as needed
])
const messages = ref<Message[]>([
  {
    id: 1,
    content: 'Check out these photos!',
    sender: 'other',
    attachments: [
      { type: 'image', url: 'https://example.com/image1.jpg' },
      { type: 'image', url: 'https://example.com/image2.jpg' },
      { type: 'image', url: 'https://example.com/image3.jpg' },
      { type: 'image', url: 'https://example.com/image4.jpg' },
      { type: 'image', url: 'https://example.com/image5.jpg' },
    ],
  },
  {
    id: 2,
    content: "Here's an audio message",
    sender: 'me',
    attachments: [{ type: 'audio', url: 'path/to/audio.mp3' }],
  },
  {
    id: 3,
    content: "I'm sending you a file",
    sender: 'other',
    attachments: [{ type: 'file', url: 'path/to/document.pdf', name: 'document.pdf' }],
  },
  {
    id: 4,
    content: 'Image Attachment',
    sender: 'other',
    attachments: [
      { type: 'image', url: 'https://example.com/image1.jpg' },
      { type: 'image', url: 'https://example.com/image2.jpg' },
    ],
  },
])
const newMessage = ref('')
const imageInput = ref<HTMLInputElement | null>(null)
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
const openAttachmentMenu = () => {
  imageInput.value?.click()
}

const deselectUser = () => {
  selectedUser.value = null
  isUserListVisible.value = true
}

const scrollToBottom = () => {
  const messageList = document.querySelector('.list')
  if (messageList) {
    messageList.scrollTop = messageList.scrollHeight
  }
}

const sendMessage = async () => {
  if (newMessage.value.trim() && selectedUser.value) {
    await chatService.sendMessage(selectedUser.value.id.toString(), newMessage.value, false)
    newMessage.value = ''
    scrollToBottom()
  }
}

chatService.onReceiveMessage(async (message) => {
  console.log('New message received:', message)
  try {
    await chatService.getConversation(message.patientId)
    console.log('Conversation refreshed')
  } catch (error) {
    console.error('Error fetching conversation:', error)
  }
})

chatService.onReceiveConversation((conversation) => {
  console.log('Received conversation:', conversation)
  scrollToBottom()
})

const receiveMessage = (message: Message) => {
  messages.value.push(message)
  scrollToBottom()
}

const selectUser = async (user: User) => {
  if (selectedUser.value) {
    await chatService.leavePatientGroup(selectedUser.value.id.toString())
  }
  selectedUser.value = user
  await chatService.joinPatientGroup(user.id.toString())
  await chatService.getConversation(user.id.toString())
  await chatService.markMessagesAsRead(user.id.toString())
  if (!isLargeScreen.value) {
    isUserListVisible.value = false
  }
}

onMounted(() => {
  scrollToBottom()
  chatService.onReceiveMessage((message) => {
    messages.value.push(message)
    console.log('New message received:', message)
    scrollToBottom()
  })

  chatService.onUserOnline((username) => {
    console.log(`${username} is now online`)
    // Cập nhật trạng thái online của user trong danh sách users
  })

  chatService.onUserOffline((username) => {
    console.log(`${username} is now offline`)
    // Cập nhật trạng thái offline của user trong danh sách users
  })
})

onUnmounted(() => {
  if (selectedUser.value) {
    chatService.leavePatientGroup(selectedUser.value.id.toString())
  }
})

onMounted(() => {
  scrollToBottom()
})

defineExpose({
  receiveMessage,
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
