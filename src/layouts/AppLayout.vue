<template>
  <VaLayout
    :top="{ fixed: true, order: 2 }"
    :left="{
      fixed: true,
      absolute: breakpoints.mdDown,
      order: 1,
      overlay: breakpoints.mdDown && !isSidebarMinimized && showSidebar,
      width: sidebarWidth,
    }"
    @leftOverlayClick="isSidebarMinimized = true"
  >
    <template #top>
      <AppNavbar ref="navbarRef" :is-mobile="isMobile" class="w-full" />
    </template>

    <template #left>
      <AppSidebar v-if="showSidebar" :minimized="isSidebarMinimized" :animated="!isMobile" :mobile="isMobile" />
    </template>

    <template #content>
      <div class="app-layout__content-wrapper">
        <div v-if="isFullScreenSidebar" class="flex justify-end">
          <VaButton class="px-4 py-4" icon="md_close" preset="plain" @click="onCloseSidebarButtonClick" />
        </div>
        <AppLayoutNavigation v-if="!isMobile" class="p-4" />
        <main :class="[isPatientOrGuest ? '' : 'pt-0', 'w-full max-w-full overflow-x-hidden']">
          <article>
            <RouterView v-slot="{ Component }">
              <component :is="Component" ref="notificationRef" />
            </RouterView>
          </article>
        </main>
      </div>
    </template>
  </VaLayout>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { onBeforeRouteUpdate } from 'vue-router'
import { useBreakpoint } from 'vuestic-ui'
import { useOnlineUsersStore } from '../stores/online-users-store'
import { useGlobalStore } from '../stores/global-store'
import { useAuthStore } from '@/stores/modules/auth.module'
import AppLayoutNavigation from '../components/app-layout-navigation/AppLayoutNavigation.vue'
import AppNavbar from '../components/navbar/AppNavbar.vue'
import AppSidebar from '../components/sidebar/AppSidebar.vue'
import signalRService from '@/signalR'
import { LocalNotifications } from '@capacitor/local-notifications'
import { useAppointmentStore } from '@/stores/modules/appointment.module'
import { useCalendarStore } from '@/stores/modules/calendar.module'

const GlobalStore = useGlobalStore()
const onlineUsersStore = useOnlineUsersStore()
const appointmentStore = useAppointmentStore()
const calendarStore = useCalendarStore()
const breakpoints = useBreakpoint()
const authStore = useAuthStore()

const sidebarWidth = ref('16rem')
const sidebarMinimizedWidth = ref(undefined)

const isPatientOrGuest = computed(() => authStore.musHaveRole('Patient') || authStore.user === null)
const isGuest = computed(() => authStore.user === null)
const showSidebar = computed(() => !isPatientOrGuest.value || isMobile.value)

const isMobile = ref(false)
const isTablet = ref(false)
const { isSidebarMinimized } = storeToRefs(GlobalStore)

const onResize = () => {
  isSidebarMinimized.value = breakpoints.mdDown
  isMobile.value = breakpoints.smDown
  isTablet.value = breakpoints.mdDown
  sidebarMinimizedWidth.value = isMobile.value ? '0' : '4.5rem'
  sidebarWidth.value = isTablet.value ? '100%' : '16rem'
}

onMounted(() => {
  window.addEventListener('resize', onResize)
  onResize()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
})

onBeforeRouteUpdate(() => {
  if (breakpoints.mdDown) {
    isSidebarMinimized.value = true
  }
})

const isFullScreenSidebar = computed(() => isTablet.value && !isSidebarMinimized.value)

const onCloseSidebarButtonClick = () => {
  isSidebarMinimized.value = true
}

const notificationRef = ref(null)
const navbarRef = ref(null)

const handleReceiveNotification = (type, notification) => {
  if (notificationRef.value?.receiveNotification) {
    notificationRef.value.receiveNotification(type, notification)
  }
  const notificationDropdownRef = navbarRef.value?.$refs?.navbarActionsRef?.$refs?.notificationDropdownRef
  if (notificationDropdownRef?.receiveNotificationFromServer) {
    notificationDropdownRef.receiveNotificationFromServer(type, notification)
  }
}

const handleUserIsOnline = (users, staffs) => {
  console.log(`Users online: ${users}`)
  onlineUsersStore.updateOnlineUsers(users, staffs)
}

const handleReceiveMessage = (message) => {
  onlineUsersStore.receiveMessage(message)
  if (isMobile.value) {
    const random_id = Math.ceil(Math.random() * 1000000)
    const options = {
      notifications: [
        {
          id: random_id,
          title: `${message?.senderName} sent you a message`,
          body: message?.message,
          largeIcon: 'res://drawable/icon_msg96.png',
          smallIcon: 'res://drawable/icon_msg48.png',
        },
      ],
    }
    if (authStore.user?.id !== message.senderId) {
      LocalNotifications.schedule(options)
    }
  }
}

const handleUpdateAppointments = (appointments) => {
  appointmentStore.updateAppointment(appointments)
}

const handleUpdateWorkingCalendar = (data) => {
  calendarStore.updateCalendar(data)
}

const handleCheckHeartbeat = () => {
  console.log('Heartbeat checked')
}

const registerNotifications = async () => {
  let permStatus = await LocalNotifications.checkPermissions()

  if (permStatus.display === 'prompt') {
    permStatus = await LocalNotifications.requestPermissions()
  }

  if (permStatus.display !== 'granted') {
    throw new Error('User denied permissions!')
  }

  await LocalNotifications.registerActionTypes({
    types: [
      {
        id: 'OPEN_APP',
        actions: [
          {
            id: 'open',
            title: 'Mở ứng dụng',
          },
          {
            id: 'dismiss',
            title: 'Bỏ qua',
          },
          {
            id: 'reply',
            title: 'Trả lời',
            input: true,
          },
        ],
      },
    ],
  })
}

const handleNotificationAction = (action) => {
  switch (action.actionId) {
    case 'open':
      // Mở ứng dụng khi người dùng nhấn "Mở ứng dụng"
      if (Capacitor.getPlatform() === 'android' || Capacitor.getPlatform() === 'ios') {
        // Nếu bạn muốn mở ứng dụng hoặc chuyển đến một màn hình khác, bạn có thể dùng Vue Router
        // Ví dụ chuyển đến trang 'home'
        router.push({ name: 'home' }) // Hoặc tên trang bạn muốn mở
      }
      break

    case 'dismiss':
      // Đóng notification khi người dùng nhấn "Bỏ qua"
      LocalNotifications.remove({ id: action.notificationId })
      break

    case 'reply':
      // Xử lý nội dung trả lời
      console.log('User reply:', action.inputValue)
      // Có thể gửi thông tin này đến server hoặc xử lý theo logic của bạn
      break

    default:
      console.log('Action not recognized')
  }
}

const isConnecting = ref(false)
const retryCount = ref(0)
const maxRetries = 3
const connectionStatus = ref('Disconnected')

const setupSignalR = async () => {
  if (isConnecting.value) return

  isConnecting.value = true
  try {
    const url = import.meta.env.VITE_APP_BASE_URL
    const url_without_api = url.slice(0, -3)
    const path = url_without_api + 'notifications'
    signalRService.on('NotificationFromServer', handleReceiveNotification)
    signalRService.on('UpdateOnlineUsers', handleUserIsOnline)
    signalRService.on('ReceiveMessage', handleReceiveMessage)
    signalRService.on('Appointments', handleUpdateAppointments)
    signalRService.on('Fetch', handleUpdateWorkingCalendar)
    signalRService.on('HeartbeatResponse', handleCheckHeartbeat)
    await signalRService.initialize(`${path}`)
  } catch (error) {
    console.error('SignalR Connection Error:', error)
    connectionStatus.value = 'Error: ' + error.message
    if (retryCount.value < maxRetries) {
      retryCount.value++
      console.log(`Retrying connection (${retryCount.value}/${maxRetries})...`)
      setTimeout(setupSignalR, 2000) // Retry after 2 seconds
    }
  } finally {
    isConnecting.value = false
  }
}

const cleanupSignalR = () => {
  if (signalRService.isConnected()) {
    signalRService.off('NotificationFromServer')
    signalRService.off('UpdateOnlineUsers')
    signalRService.off('ReceiveMessage')
    signalRService.off('Appointments')
    signalRService.off('Fetch')
    signalRService.off('HeartbeatResponse')
    signalRService.disconnect()
  }
}

onMounted(async () => {
  if (!isGuest.value) {
    await setupSignalR()
  }
  if (Capacitor.getPlatform() === 'android' || Capacitor.getPlatform() === 'ios') {
    registerNotifications().catch((error) => {
      console.error('Failed to register notifications:', error)
    })
  }
  // Khi nhận notification
  LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
    handleNotificationAction(action)
  })
})

onBeforeUnmount(() => {
  cleanupSignalR()
})
</script>

<style lang="scss" scoped>
.va-layout__left {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 2;
}

.va-layout__top {
  position: fixed;
  top: 0;
  right: 0;
  left: var(--va-layout-left-width, 0);
  z-index: 1;
  transition: left 0.3s ease;
}

.app-layout__content-wrapper {
  padding-top: var(--va-navbar-height, 0);
  margin-left: var(--va-layout-left-width, 0);
  min-height: 100vh;
  transition: margin-left 0.3s ease;
}

@media (max-width: 768px) {
  .va-layout__top {
    left: 0;
  }

  .app-layout__content-wrapper {
    margin-left: 0;
  }
}
</style>
