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
        <main :class="[isPatientOrGuest ? '' : 'p-4 pt-0', 'w-full max-w-full overflow-x-hidden']">
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
import { onBeforeUnmount, onMounted, ref, computed, onBeforeMount } from 'vue'
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

const GlobalStore = useGlobalStore()
const onlineUsersStore = useOnlineUsersStore()
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
  // console.log(`Users online: ${users}`)
  onlineUsersStore.updateOnlineUsers(users, staffs)
}

const handleReceiveMessage = (message) => {
  onlineUsersStore.receiveMessage(message)
}

onBeforeMount(async () => {
  if (!isGuest.value) {
    const url = import.meta.env.VITE_APP_BASE_URL
    const url_without_api = url.slice(0, -3)
    const notificationPath = url_without_api + 'notifications'
    const messagePath = url_without_api + 'chat'

    // Kết nối đến hub thông báo
    await signalRService.connect(notificationPath, 'notificationHub')

    // Kết nối đến hub tin nhắn
    await signalRService.connect(messagePath, 'messageHub')

    if (signalRService.isConnected('notificationHub') && signalRService.isConnected('messageHub')) {
      // Đăng ký sự kiện cho hub thông báo
      signalRService.on('notificationHub', 'NotificationFromServer', handleReceiveNotification)

      // Đăng ký sự kiện cho hub tin nhắn
      signalRService.on('messageHub', 'UpdateOnlineUsers', handleUserIsOnline)
      signalRService.on('messageHub', 'ReceiveMessage', handleReceiveMessage)
    } else {
      //retry connect
      setTimeout(() => {
        location.reload()
      }, 100)
    }
  }
})

// watch for user change

onBeforeUnmount(() => {
  if (!isGuest.value) {
    signalRService.off('notificationHub', 'NotificationFromServer')
    signalRService.off('messageHub', 'UpdateOnlineUsers')
    signalRService.off('messageHub', 'ReceiveMessage')
    signalRService.disconnect('notificationHub')
    signalRService.disconnect('messageHub')
  }
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
