<template>
  <VaLayout
    :top="{ fixed: true, order: 2 }"
    :left="{ fixed: true, absolute: breakpoints.mdDown, order: 1, overlay: breakpoints.mdDown && !isSidebarMinimized }"
    @leftOverlayClick="isSidebarMinimized = true"
  >
    <template #top>
      <AppNavbar ref="navbarRef" :is-mobile="isMobile" />
    </template>

    <template #left>
      <AppSidebar :minimized="isSidebarMinimized" :animated="!isMobile" :mobile="isMobile" />
    </template>

    <template #content>
      <div :class="{ minimized: isSidebarMinimized }" class="app-layout__sidebar-wrapper">
        <div v-if="isFullScreenSidebar" class="flex justify-end">
          <VaButton class="px-4 py-4" icon="md_close" preset="plain" @click="onCloseSidebarButtonClick" />
        </div>
      </div>
      <AppLayoutNavigation v-if="!isMobile" class="p-4" />
      <main class="p-4 pt-0">
        <article>
          <!-- <RouterView /> -->
          <RouterView v-slot="{ Component }">
            <component :is="Component" ref="notificationRef" />
          </RouterView>
        </article>
      </main>
    </template>
  </VaLayout>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { onBeforeRouteUpdate } from 'vue-router'
import { useBreakpoint } from 'vuestic-ui'
import { useOnlineUsersStore } from '../stores/online-users-store' // Adjust the path as needed
import { useGlobalStore } from '../stores/global-store'

import AppLayoutNavigation from '../components/app-layout-navigation/AppLayoutNavigation.vue'
import AppNavbar from '../components/navbar/AppNavbar.vue'
import AppSidebar from '../components/sidebar/AppSidebar.vue'
import signalRService from '@/signalR'

const GlobalStore = useGlobalStore()
const onlineUsersStore = useOnlineUsersStore()
const breakpoints = useBreakpoint()

const sidebarWidth = ref('16rem')
const sidebarMinimizedWidth = ref(undefined)

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
    // Collapse sidebar after route change for Mobile
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

const handleUserIsOnline = (users) => {
  console.log(`Users online: ${users}`)
  onlineUsersStore.updateOnlineUsers(users)
}

onMounted(async () => {
  const url = import.meta.env.VITE_APP_BASE_URL
  const url_without_api = url.slice(0, -3)
  const notificationPath = url_without_api + 'notifications'
  const messagePath = url_without_api + 'chat'

  // Kết nối đến hub thông báo
  await signalRService.connect(notificationPath, 'notificationHub')

  // Kết nối đến hub tin nhắn
  await signalRService.connect(messagePath, 'messageHub')

  // Đăng ký sự kiện cho hub thông báo
  signalRService.on('notificationHub', 'NotificationFromServer', handleReceiveNotification)

  // Đăng ký sự kiện cho hub tin nhắn
  signalRService.on('messageHub', 'UpdateOnlineUsers', handleUserIsOnline)
})

onBeforeUnmount(() => {
  signalRService.off('notificationHub', 'receiveNotificationFromServer')
  signalRService.disconnect('notificationHub')
  signalRService.disconnect('messageHub')
})
</script>

<style lang="scss" scoped>
// Prevent icon jump on animation
.va-sidebar {
  width: unset !important;
  min-width: unset !important;
}
</style>
