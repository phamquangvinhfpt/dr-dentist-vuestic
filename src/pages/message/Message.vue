<template>
  <VaInnerLoading>
    <VaCard>
      <div class="flex flex-col h-[calc(100vh-20px)] lg:h-[calc(100vh-76px)] dark:font-semibold overflow-hidden">
        <VaCard class="flex-1 flex flex-col lg:flex-row">
          <VaCard
            :class="[
              'lg:block border-r border-gray-300',
              isUserListVisible || !selectedUser ? 'block' : 'hidden',
              'w-full lg:w-80 xl:w-96 h-full overflow-y-auto focus:scroll-smooth',
            ]"
          >
            <div class="p-4 animate-pulse">
              <VaInput v-model="keyword" type="text" placeholder="Search Messenger" label="Search" :change="search()" />
            </div>
            <VaScrollContainer
              vertical
              :color="currentColor"
              class="overflow-y-auto h-[calc(100vh-68px)] md:h-[calc(100vh-158px)] lg:md:h-[calc(100vh-200px)]"
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
                        color="#692BEB"
                        :src="user.imageUrl"
                        :fallback-text="user.name.charAt(0).toUpperCase()"
                        alt="Avatar"
                      />
                    </VaBadge>
                  </div>
                  <div class="ml-3 flex-grow overflow-hidden">
                    <div class="font-semibold truncate">{{ user.name }}</div>
                    <div class="grid items-center">
                      <div class="text-sm font-thin truncate">{{ user.lastMessage }}</div>
                      <div class="text-xs">{{ user.createdOn ? convertDateTimeToTime(user.createdOn) : '' }}</div>
                    </div>
                  </div>
                </VaSidebarItem>
              </VaList>
            </VaScrollContainer>
          </VaCard>

          <!-- Chat area -->
          <VaCard :class="['flex-1 flex flex-col', selectedUser || isLargeScreen ? 'block' : 'hidden']">
            <template v-if="selectedUser">
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
                <div class="w-10 h-10 rounded-full mr-3 relative">
                  <VaBadge
                    dot
                    overlap
                    placement="bottom-right"
                    :offset="[-7, -7]"
                    class="mr-2"
                    :color="selectedUser?.isOnline ? 'success' : 'secondary'"
                  >
                    <VaAvatar
                      :src="selectedUser?.imageUrl"
                      color="#692BEB"
                      :fallback-text="selectedUser?.name.charAt(0).toUpperCase()"
                      alt="Avatar"
                    />
                  </VaBadge>
                </div>
                <div class="font-semibold">
                  {{ selectedUser.name }}
                </div>
              </VaCard>
              <VaDivider />
              <!-- Message list -->
              <VaScrollContainer
                vertical
                :color="currentColor"
                class="overflow-y-auto h-[calc(100vh-200px)] lg:h-[calc(100vh-313px)] p-4 list relative"
              >
                <template v-for="(messageGroup, groupIndex) in groupedMessages" :key="groupIndex">
                  <div
                    :class="[
                      'mb-4 flex',
                      messageGroup[0].sender === 'me' ? 'justify-end relative' : 'justify-start relative',
                    ]"
                  >
                    <div v-if="messageGroup[0].sender !== 'me'" class="mr-2 flex-shrink-0 self-end group">
                      <VaAvatar
                        size="small"
                        color="#692BEB"
                        :src="messageGroup[0]?.imageUrl"
                        alt="Avatar"
                        :fallback-text="messageGroup[0]?.name?.charAt(0).toUpperCase()"
                      />
                    </div>
                    <div class="flex flex-col">
                      <div class="text-sm text-gray-500 mb-1 absolute -top-5 font-semibold">
                        {{ messageGroup[0].sender === 'me' ? '' : messageGroup[0]?.name }}
                      </div>
                      <div class="flex flex-col w-full">
                        <div
                          v-for="(message, messageIndex) in messageGroup"
                          :key="message.id"
                          :class="['flex flex-col mb-1', message.sender === 'me' ? 'items-end' : 'items-start']"
                        >
                          <div
                            v-if="message.content"
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
                              message.imagesUrl && message.imagesUrl.length > 0 ? 'mb-1' : '',
                            ]"
                          >
                            {{ message.content }}
                          </div>
                          <!-- Image grid for the message -->
                          <div
                            v-if="message.imagesUrl && message.imagesUrl.length > 0"
                            :class="[
                              message.imagesUrl.length == 1 ? 'grid grid-cols-1' : 'grid grid-cols-2',
                              'gap-1 rounded-xl overflow-hidden',
                              message.sender === 'me' ? 'bg-blue-500' : 'bg-gray-200',
                            ]"
                          >
                            <template v-for="(image, index) in message.imagesUrl.slice(0, 3)" :key="index">
                              <div
                                class="relative cursor-pointer w-16 h-16"
                                @click="openImageCarousel(index, message.imagesUrl)"
                              >
                                <img :src="getSrcAvatar(image)" class="w-full h-16 object-cover" />
                              </div>
                            </template>
                            <div
                              v-if="message.imagesUrl.length > 3"
                              class="relative cursor-pointer w-16 h-16"
                              @click="openImageCarousel(3, message.imagesUrl)"
                            >
                              <img
                                :src="getSrcAvatar(message.imagesUrl[3])"
                                class="w-full h-full object-cover opacity-50"
                              />
                              <div
                                class="absolute inset-0 flex items-center justify-center text-white text-lg font-bold bg-black bg-opacity-50"
                              >
                                +{{ message.imagesUrl.length - 3 }}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div :class="['text-xs', messageGroup[0].sender === 'me' ? 'text-right' : 'text-left']">
                          {{ messageGroup[messageGroup.length - 1]?.time }}
                        </div>
                      </div>
                    </div>
                    <VaScrollContainer
                      v-if="selectedImages.length > 0"
                      vertical
                      class="mt-2 h-[100px] absolute bottom-0"
                      color="primary"
                    >
                      <div class="flex gap-2">
                        <div
                          v-for="(image, index) in displayedImages"
                          :key="index"
                          class="relative cursor-pointer w-fit"
                          @click="openImageCarousel(index)"
                        >
                          <img :src="image" class="w-16 h-16 object-cover rounded" />
                          <VaButton
                            icon="close"
                            color="danger"
                            size="small"
                            class="absolute top-0 right-0 transform scale-75"
                            @click.stop="removeImage(index)"
                          />
                        </div>
                        <div
                          v-if="selectedImages.length > 4"
                          class="relative cursor-pointer"
                          @click="openImageCarousel(3)"
                        >
                          <img :src="selectedImages[3]" class="w-16 h-16 object-cover rounded opacity-50" />
                          <div
                            class="absolute inset-0 flex items-center justify-center text-white text-lg font-bold bg-black bg-opacity-50 rounded"
                          >
                            +{{ selectedImages.length - 3 }}
                          </div>
                        </div>
                      </div>
                    </VaScrollContainer>
                  </div>
                </template>
              </VaScrollContainer>

              <!-- Message input -->
              <VaDivider />
              <VaCard class="p-4 lg:pt-9">
                <div class="flex items-center rounded-full p-2">
                  <VaInput
                    v-model="newMessage"
                    type="text"
                    placeholder="Aa"
                    class="flex-1 bg-transparent outline-none"
                    @keyup.enter="sendMessage"
                  />

                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    multiple
                    class="hidden"
                    @change="handleImageUpload"
                  />

                  <button class="text-blue-500" @click="fileInput?.click()">
                    <span class="material-symbols-outlined"> upload_2 </span>
                  </button>
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

                <VaModal
                  v-model="showImageCarousel"
                  :hide-default-actions="true"
                  class="image-carousel-modal"
                  close-button
                >
                  <!-- custom carousel -->
                  <div class="relative w-full h-full flex items-center justify-center">
                    <button
                      v-if="selectedImages && selectedImages.length > 1"
                      class="absolute left-4 z-10 text-white bg-black/50 rounded-full p-2"
                      @click="
                        carouselActiveIndex =
                          carouselActiveIndex > 0 ? carouselActiveIndex - 1 : (selectedImages?.length || 1) - 1
                      "
                    >
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
                          d="M15 19l-7-7 7-7"
                        ></path>
                      </svg>
                    </button>
                    <button
                      v-if="selectedImages && selectedImages.length > 1"
                      class="absolute right-4 z-10 text-white bg-black/50 rounded-full p-2"
                      @click="
                        carouselActiveIndex =
                          carouselActiveIndex < (selectedImages?.length || 1) - 1 ? carouselActiveIndex + 1 : 0
                      "
                    >
                      <svg
                        class="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </button>
                    <div class="w-full h-full flex items-center justify-center">
                      <img
                        v-if="selectedImages && selectedImages.length > 0"
                        :src="selectedImages[carouselActiveIndex]"
                        class="max-w-full max-h-full object-contain"
                        :alt="`Image ${carouselActiveIndex + 1}`"
                      />
                    </div>
                    <div
                      v-if="selectedImages && selectedImages.length > 1"
                      class="absolute bottom-4 flex space-x-2 justify-center w-full"
                    >
                      <span
                        v-for="(_, index) in selectedImages"
                        :key="index"
                        class="w-2 h-2 rounded-full cursor-pointer"
                        :class="[carouselActiveIndex === index ? 'bg-blue-500' : 'bg-gray-300']"
                        @click="carouselActiveIndex = index"
                      ></span>
                    </div>
                  </div>
                </VaModal>
                <VaModal
                  v-model="showImagesCarousel"
                  :hide-default-actions="true"
                  class="image-carousel-modal"
                  close-button
                >
                  <!-- custom carousel -->
                  <div class="relative w-full h-full flex items-center justify-center">
                    <button
                      v-if="carouselImages && carouselImages.length > 1"
                      class="absolute left-4 z-10 text-white bg-black/50 rounded-full p-2"
                      @click="
                        carouselActiveIndex =
                          carouselActiveIndex > 0 ? carouselActiveIndex - 1 : (carouselImages?.length || 1) - 1
                      "
                    >
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
                          d="M15 19l-7-7 7-7"
                        ></path>
                      </svg>
                    </button>
                    <button
                      v-if="carouselImages && carouselImages.length > 1"
                      class="absolute right-4 z-10 text-white bg-black/50 rounded-full p-2"
                      @click="
                        carouselActiveIndex =
                          carouselActiveIndex < (carouselImages?.length || 1) - 1 ? carouselActiveIndex + 1 : 0
                      "
                    >
                      <svg
                        class="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </button>
                    <div class="w-full h-full flex items-center justify-center">
                      <img
                        v-if="carouselImages && carouselImages.length > 0"
                        :src="carouselImages[carouselActiveIndex]"
                        class="max-w-full max-h-full object-contain"
                        :alt="`Image ${carouselActiveIndex + 1}`"
                      />
                    </div>
                    <div
                      v-if="carouselImages && carouselImages.length > 1"
                      class="absolute bottom-4 flex space-x-2 justify-center w-full"
                    >
                      <span
                        v-for="(_, index) in carouselImages"
                        :key="index"
                        class="w-2 h-2 rounded-full cursor-pointer"
                        :class="[carouselActiveIndex === index ? 'bg-blue-500' : 'bg-gray-300']"
                        @click="carouselActiveIndex = index"
                      ></span>
                    </div>
                  </div>
                </VaModal>
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
import { ref, computed, watch, watchEffect, onBeforeMount, onMounted } from 'vue'
import { useAuthStore } from '@modules/auth.module'
import { getErrorMessage, getSrcAvatar } from '@/services/utils'
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
import { Message, User } from './types'
import { useNotificationStore } from '@/stores/modules/notification.module'
import { debounce } from 'lodash'

const authStore = useAuthStore()

// Computed roles
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
const keyword = ref('')
const selectedUser = ref<User | null>(null)
const isLargeScreen = ref(window.innerWidth >= 768 && window.innerWidth < 1024)
const storeMessage = useNotificationStore()
const selectedImages = ref<string[]>([])
const selectedFiles = ref<File[]>([])
const showImageCarousel = ref(false)
const showImagesCarousel = ref(false)
const carouselActiveIndex = ref(0)
const carouselImages = ref<string[] | undefined>([])
const fileInput = ref<HTMLInputElement | null>(null)
const displayedImages = computed(() => {
  return selectedImages.value.slice(0, 4)
})

const handleImageUpload = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (files) {
    // Reset previous selections
    selectedFiles.value = []
    selectedImages.value = []

    // Convert FileList to array and store files
    const fileArray = Array.from(files)
    selectedFiles.value = fileArray

    // Generate preview images
    fileArray.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        selectedImages.value.push(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    })
  }
}

const removeImage = (index: number) => {
  selectedImages.value.splice(index, 1)
  selectedFiles.value.splice(index, 1)
}

const openImageCarousel = (index: number, images?: string[]) => {
  if (images) {
    carouselImages.value = images
    carouselImages.value = carouselImages.value.map((image) => getSrcAvatar(image))
    showImagesCarousel.value = true
    carouselActiveIndex.value = index
    return
  }
  carouselActiveIndex.value = index
  showImageCarousel.value = true
}

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
  if (
    (newMessage.value.trim() || selectedUser.value) &&
    (newMessage.value.trim() !== '' || selectedFiles.value.length > 0)
  ) {
    const formData = new FormData()
    formData.append('Message', newMessage.value)
    formData.append('ReceiverId', selectedUser.value?.id.toString() || '')
    if (selectedFiles.value.length > 0) {
      isLoading.value = true
      selectedFiles.value.forEach((file) => {
        formData.append('Images', file)
      })
    }

    await storeMessage
      .sendMessage(formData)
      .catch((error) => {
        const message = getErrorMessage(error)
        notify({
          title: 'Error',
          message: message,
          color: 'danger',
        })
        isLoading.value = false
      })
      .finally(() => {
        isLoading.value = false
      })
    newMessage.value = ''
    selectedFiles.value = []
    selectedImages.value = []
    await loadUsers()
    scrollToBottom()
  }
}

const search = debounce(async () => {
  if (keyword.value) {
    const filteredUsers = users.value?.filter((user) => user.name.toLowerCase().includes(keyword.value.toLowerCase()))
    users.value = filteredUsers
  } else {
    loadUsers()
  }
}, 300)

const TIME_NAMES = {
  second: 1000,
  minute: 1000 * 60,
  hour: 1000 * 60 * 60,
  day: 1000 * 60 * 60 * 24,
  week: 1000 * 60 * 60 * 24 * 7,
  month: 1000 * 60 * 60 * 24 * 30,
  year: 1000 * 60 * 60 * 24 * 365,
}

const getTimeName = (differenceTime: number) => {
  return Object.keys(TIME_NAMES).reduce(
    (acc, key) => (TIME_NAMES[key as keyof typeof TIME_NAMES] < differenceTime ? key : acc),
    'second',
  ) as keyof typeof TIME_NAMES
}

const convertToUTC = (date: string | Date): Date => {
  const localDate = new Date(date)
  return new Date(
    localDate.getUTCFullYear(),
    localDate.getUTCMonth(),
    localDate.getUTCDate(),
    localDate.getUTCHours(),
    localDate.getUTCMinutes(),
    localDate.getUTCSeconds(),
  )
}

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

const convertDateTimeToTime = (date: string) => {
  const currentUTCDate = convertToUTC(new Date())
  const itemUTCDate = convertToUTC(date)
  const timeDifference = Math.round(currentUTCDate.getTime() - itemUTCDate.getTime())
  const timeName = getTimeName(timeDifference)

  if (timeDifference < TIME_NAMES.minute) {
    return 'Just now'
  } else if (timeDifference < TIME_NAMES.day) {
    return rtf.format(-1 * Math.round(timeDifference / TIME_NAMES[timeName]), timeName)
  } else {
    return itemUTCDate.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }
}

const loadUsers = async () => {
  isLoading.value = true
  try {
    const messages = await storeMessage.getListUserDto().catch((error) => {
      const message = getErrorMessage(error)
      notify({
        title: 'Error',
        message: message,
        color: 'danger',
      })
    })
    if (messages && messages.length > 0) {
      users.value = messages.map((message: any) => ({
        id: message.senderId,
        name: message.senderName,
        lastMessage: message.latestMessage,
        imageUrl: getSrcAvatar(message.imageUrl),
        createdOn: message.createdOn,
      }))
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
  scrollToBottom()
}
const getUserConversion = async (userid: string) => {
  const conversions = await storeMessage.getConversations(userid).catch((error) => {
    const message = getErrorMessage(error)
    notify({
      title: 'Error',
      message: message,
      color: 'danger',
    })
  })
  if (conversions && conversions.length > 0) {
    messages.value = conversions.map((message: any) => ({
      id: message.id,
      content: message.message,
      sender: message.senderId === authStore.user?.id ? 'me' : 'other',
      name: message.senderName,
      imageUrl: getSrcAvatar(message.imageUrl),
      imagesUrl: message.imagesUrl,
      originalTime: message.createdOn,
      time: convertDateTimeToTime(message.createdOn),
    }))
  } else {
    messages.value = []
  }
}

const handleUserOnline = () => {
  if (users.value && onlineUsers.value) {
    users.value.forEach((user) => {
      const isOnline = onlineUsers.value.some((onlineUser) => onlineUser === user.id)
      user.isOnline = isOnline
    })
  }

  if (selectedUser.value) {
    const isOnline = onlineUsers.value.some((onlineUser) => onlineUser === selectedUser.value?.id.toString())
    selectedUser.value.isOnline = isOnline
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
    console.log('receivedMessage', receivedMessage.value)
    if (selectedUser.value) {
      getUserConversion(selectedUser.value.id.toString())
    }
    loadUsers()
    handleUserOnline()
    scrollToBottom()
  },
  { immediate: true },
)

watchEffect(() => {
  scrollToBottom()
})

// watch selectedUser
watch(
  selectedUser,
  () => {
    if (selectedUser.value) {
      getUserConversion(selectedUser.value.id.toString())
    }
  },
  { immediate: true },
)

onBeforeMount(() => {
  loadUsers()
})

onMounted(async () => {
  await loadUsers()
})

watch(
  messages,
  () => {
    scrollToBottom()
  },
  { deep: true },
)
</script>
<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scroll {
  scrollbar-width: none;
}
</style>
