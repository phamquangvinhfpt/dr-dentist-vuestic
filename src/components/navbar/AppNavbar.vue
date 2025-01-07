<template>
  <VaNavbar class="app-layout-navbar py-2 px-0">
    <template #left>
      <div class="left">
        <Transition v-if="isMobile" name="icon-fade" mode="out-in">
          <VaIcon
            color="primary"
            :name="isSidebarMinimized ? 'menu' : 'close'"
            size="24px"
            style="margin-top: 3px"
            @click="isSidebarMinimized = !isSidebarMinimized"
          />
        </Transition>
        <RouterLink
          :to="isPatientOrGuest ? '' : '/'"
          aria-label="Visit home page"
          @click.prevent="isPatientOrGuest && !isMobile ? openDrawer() : reload()"
        >
          <VuesticLogo />
        </RouterLink>
      </div>
    </template>
    <template #right>
      <AppNavbarActions ref="navbarActionsRef" class="app-navbar__actions" :is-mobile="isMobile" />
    </template>
  </VaNavbar>

  <!-- Drawer Component -->
  <Drawer ref="drawerRef" title="Menu" side="left">
    <div class="space-y-4 p-4">
      <nav>
        <VaAccordion v-model="openedSections" multiple>
          <VaCollapse v-for="(route, index) in navigationRoutesCanAccess" :key="index">
            <template #header="{ value: isCollapsed }">
              <!-- Changed from RouterLink to div for routes with children -->
              <component
                :is="route.children ? 'div' : 'RouterLink'"
                :to="route.children ? undefined : { name: route.name }"
                :class="[
                  'py-3 px-4 flex items-center justify-between',
                  route.children ? 'cursor-pointer' : '',
                  routeHasActiveChild(route)
                    ? 'text-primary bg-primary/10 dark:text-primary-lighter dark:bg-primary/20'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
                  'transition-colors duration-200 ease-in-out',
                ]"
                @click="!route.children && drawerRef?.closeDrawer()"
              >
                <div class="flex items-center">
                  <VaIcon
                    v-if="route.meta?.icon"
                    :name="route.meta.icon"
                    class="mr-3"
                    :class="
                      routeHasActiveChild(route)
                        ? 'text-primary dark:text-primary-lighter'
                        : 'text-gray-500 dark:text-gray-400'
                    "
                  />
                  <span class="font-semibold">{{ t(route.displayName) }}</span>
                </div>
                <VaIcon
                  v-if="route.children"
                  :name="isCollapsed ? 'va-arrow-down' : 'va-arrow-up'"
                  size="20px"
                  class="text-gray-500 dark:text-gray-400"
                />
              </component>
            </template>

            <template v-if="route.children" #body>
              <div class="pl-11">
                <RouterLink
                  v-for="(childRoute, childIndex) in route.children"
                  :key="childIndex"
                  :to="{ name: childRoute.name }"
                  :class="[
                    'block py-2 transition-colors duration-200 ease-in-out',
                    currentRoute.name === childRoute.name
                      ? 'text-primary bg-primary/10 font-semibold dark:text-primary-lighter dark:bg-primary/20'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100',
                  ]"
                  @click="drawerRef?.closeDrawer()"
                >
                  {{ t(childRoute.displayName) }}
                </RouterLink>
              </div>
            </template>
          </VaCollapse>
        </VaAccordion>
      </nav>
    </div>
  </Drawer>
</template>

<script setup lang="ts">
import { computed, Ref, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useGlobalStore } from '../../stores/global-store'
import AppNavbarActions from './components/AppNavbarActions.vue'
import VuesticLogo from '../VuesticLogo.vue'
import Drawer from './Drawer.vue'
import type { DrawerInstance } from './Drawer.vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/modules/auth.module'
import { useI18n } from 'vue-i18n'
import navigationRoutes, { type INavigationRoute } from '../sidebar/NavigationRoutes'
defineProps({
  isMobile: { type: Boolean, default: false },
})

const GlobalStore = useGlobalStore()
const isPatientOrGuest = computed(() => authStore.musHaveRole('Patient') || authStore.user === null)
const { isSidebarMinimized } = storeToRefs(GlobalStore)
const currentRoute = useRoute()

// Drawer ref
const drawerRef: Ref<DrawerInstance | null> = ref(null)
const route = useRoute()
const authStore = useAuthStore()
const { t } = useI18n()

const openDrawer = () => {
  if (drawerRef.value) {
    drawerRef.value?.openDrawer()
  }
}
const reload = () => {
  window.location.reload()
}
const openedSections = ref<boolean[]>([])
const value = ref<boolean[]>([])
const setActiveExpand = () =>
  (value.value = navigationRoutes.routes.map((route: INavigationRoute) => routeHasActiveChild(route)))
const hasAccess = (route: INavigationRoute) => {
  if (!route.meta) {
    return true
  }

  // Check roles first if specified
  if (route.meta.roles) {
    if (route.meta.roles.includes('Guest') && !authStore.user) {
      return true
    }

    const hasRole = route.meta.roles.some((role) => authStore.musHaveRole(role))
    if (!hasRole) return false
  }

  // Then check permissions if specified
  if (route.meta.permission) {
    return authStore.hasAccess(route.meta.permission)
  }

  return true
}

const hasRole = (route: INavigationRoute) => {
  if (!route.meta) {
    return true
  }
  if (route.meta.role) {
    return authStore.musHaveRole(route.meta.role)
  }
  return true
}

const navigationRoutesCanAccess = computed(() => {
  const clonedNavigationRoutes = navigationRoutes.routes.map((route) => {
    return { ...route }
  })
  return clonedNavigationRoutes.filter((route: INavigationRoute) => {
    if (!hasAccess(route)) {
      return false
    }
    if (route.children) {
      route.children = route.children.filter(
        (child: INavigationRoute) => hasAccess(child) && (child.meta?.role ? hasRole(child) : true),
      )
      return route.children.length > 0
    }
    return true
  })
})

const routeHasActiveChild = (section: INavigationRoute) => {
  if (!section.children) {
    return route.path.endsWith(`${section.name}`)
  }
  return section.children.some(({ name }) => route.path.endsWith(`${name}`))
}
watch(() => route.fullPath, setActiveExpand, { immediate: true })
</script>

<style lang="scss" scoped>
.va-navbar {
  z-index: 2;

  @media screen and (max-width: 950px) {
    .left {
      width: 100%;
    }

    .app-navbar__actions {
      display: flex;
      justify-content: space-between;
    }
  }
}

.left {
  display: flex;
  align-items: center;
  margin-left: 1rem;

  & > * {
    margin-right: 1rem;
  }

  & > *:last-child {
    margin-right: 0;
  }
}

.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: transform 0.5s ease;
}

.icon-fade-enter,
.icon-fade-leave-to {
  transform: scale(0.5);
}
</style>
