<template>
  <VaSidebar v-model="writableVisible" :width="sidebarWidth" :color="color" minimized-width="0">
    <VaAccordion v-model="value" multiple>
      <VaCollapse v-for="(route, index) in navigationRoutesCanAccess" :key="index">
        <template #header="{ value: isCollapsed }">
          <VaSidebarItem
            :to="route.children ? undefined : { name: route.name }"
            :active="routeHasActiveChild(route)"
            :active-color="activeColor"
            :text-color="textColor(route)"
            :aria-label="`${route.children ? 'Open category ' : 'Visit'} ${t(route.displayName)}`"
            role="button"
            hover-opacity="0.10"
          >
            <VaSidebarItemContent class="py-3 pr-2 pl-4">
              <VaIcon
                v-if="route.meta.icon"
                aria-hidden="true"
                :name="route.meta.icon"
                size="20px"
                :color="iconColor(route)"
              />
              <VaSidebarItemTitle class="flex justify-between items-center leading-5 font-semibold">
                {{ t(route.displayName) }}
                <VaIcon v-if="route.children" :name="arrowDirection(isCollapsed)" size="20px" />
              </VaSidebarItemTitle>
            </VaSidebarItemContent>
          </VaSidebarItem>
        </template>
        <template #body>
          <div v-for="(childRoute, index2) in route.children" :key="index2">
            <VaSidebarItem
              :to="{ name: childRoute.name }"
              :active="isActiveChildRoute(childRoute)"
              :active-color="activeColor"
              :text-color="textColor(childRoute)"
              :aria-label="`Visit ${t(route.displayName)}`"
              hover-opacity="0.10"
            >
              <VaSidebarItemContent class="py-3 pr-2 pl-11">
                <VaSidebarItemTitle class="leading-5 font-semibold">
                  {{ t(childRoute.displayName) }}
                </VaSidebarItemTitle>
              </VaSidebarItemContent>
            </VaSidebarItem>
          </div>
        </template>
      </VaCollapse>
    </VaAccordion>
    <VaSpacer />
    <VaSidebarItem class="wrap-action-sidebar">
      <VaSidebarItemContent class="flex gap-4 justify-center">
        <VaPopover :offset="[10, 0]">
          <template #body>
            <span class="text-xs">{{ t('menu.infor') }}</span>
          </template>
          <VaIcon name="mso-info" class="cursor-pointer hover:opacity-80" @click="handleRedirectToPolicy" />
        </VaPopover>
        <!-- <VaPopover :offset="[10, 0]">
          <template #body>
            <span class="text-xs">{{ t('bin.title') }}</span>
          </template>
          <VaIcon name="mso-delete" class="cursor-pointer hover:opacity-80" @click="handleRedirectToBin" />
        </VaPopover> -->
        <VaPopover :offset="[10, 0]">
          <template #body>
            <span class="text-xs">{{ t('menu.help') }}</span>
          </template>
          <VaIcon name="mso-help" class="cursor-pointer hover:opacity-80" @click="handleRedirectToGit" />
        </VaPopover>
      </VaSidebarItemContent>
    </VaSidebarItem>
  </VaSidebar>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useColors } from 'vuestic-ui'
import navigationRoutes, { type INavigationRoute } from './NavigationRoutes'
import { useAuthStore } from '../../stores/modules/auth.module'

const props = defineProps({
  visible: { type: Boolean, default: true },
  mobile: { type: Boolean, default: false },
})

const emit = defineEmits(['update:visible'])

const { getColor, colorToRgba } = useColors()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const value = ref<boolean[]>([])

const writableVisible = computed({
  get: () => props.visible,
  set: (v: boolean) => emit('update:visible', v),
})

const isActiveChildRoute = (child: INavigationRoute) => route.name === child.name

const routeHasActiveChild = (section: INavigationRoute) => {
  if (!section.children) {
    return route.path.endsWith(`${section.name}`)
  }
  return section.children.some(({ name }) => route.path.endsWith(`${name}`))
}

const hasAccess = (route: INavigationRoute) => {
  if (!route.meta) {
    return true
  }

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

const setActiveExpand = () =>
  (value.value = navigationRoutes.routes.map((route: INavigationRoute) => routeHasActiveChild(route)))

const sidebarWidth = computed(() => (props.mobile ? '100vw' : '240px'))
const color = computed(() => getColor('background-secondary'))
const activeColor = computed(() => colorToRgba(getColor('focus'), 0.1))
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

const iconColor = (route: INavigationRoute) => (routeHasActiveChild(route) ? 'primary' : 'secondary')
const textColor = (route: INavigationRoute) => (routeHasActiveChild(route) ? 'primary' : 'textPrimary')
const arrowDirection = (state: boolean) => (state ? 'va-arrow-up' : 'va-arrow-down')

watch(() => route.fullPath, setActiveExpand, { immediate: true })

// const handleRedirectToBin = () => {
//   router.push({ name: 'bin' })
// }

const handleRedirectToGit = () => {
  window.open('https://github.com/phamquangvinhfpt/dr-dentist-vuestic', '_blank')
}

const handleRedirectToPolicy = () => {
  router.push({ name: 'privacy-policy' })
}
</script>

<style lang="scss" scoped>
.wrap-action-sidebar {
  &:hover {
    background-color: inherit !important;
  }
}
</style>
