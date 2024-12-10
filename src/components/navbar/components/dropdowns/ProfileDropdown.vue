<template>
  <div class="profile-dropdown-wrapper">
    <VaDropdown v-model="isShown" :offset="[9, 0]" class="profile-dropdown" stick-to-edges>
      <template #anchor>
        <VaButton preset="secondary" color="textPrimary">
          <span class="profile-dropdown__anchor min-w-max">
            <!-- <slot /> -->
            <Avatar v-if="isLogged" :size="32" color="warning" :txt="shortNameLetter">
              {{ shortNameLetter }}
            </Avatar>
            <span v-else class="material-symbols-outlined">account_circle</span>
          </span>
        </VaButton>
      </template>
      <VaDropdownContent
        class="profile-dropdown__content md:w-60 px-0 py-4 w-full"
        :style="{ '--hover-color': hoverColor }"
      >
        <VaList v-for="group in menuOptions" :key="group.name">
          <header v-if="group.name" class="uppercase text-[var(--va-secondary)] opacity-80 font-bold text-xs px-4">
            {{ t(`user.${group.name}`) }}
          </header>
          <VaListItem
            v-for="item in group.list"
            :key="item.name"
            class="menu-item px-4 text-base cursor-pointer h-8"
            v-bind="resolveLinkAttribute(item)"
          >
            <VaIcon :name="item.icon" class="pr-1" color="secondary" />
            {{ t(`user.${item.name}`) }}
          </VaListItem>
          <VaListSeparator v-if="group.separator" class="mx-3 my-2" />
        </VaList>
      </VaDropdownContent>
    </VaDropdown>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useColors } from 'vuestic-ui'
import { useAuthStore } from '@/stores/modules/auth.module'
import { useRouter } from 'vue-router'
import Avatar from '@/components/avatar/Avatar.vue'

const { colors, setHSLAColor } = useColors()
const hoverColor = computed(() => setHSLAColor(colors.focus, { a: 0.1 }))

const { t } = useI18n()

type ProfileListItem = {
  name: string
  to?: string
  href?: string
  action?: string
  icon: string
}

type ProfileOptions = {
  name: string
  separator: boolean
  list: ProfileListItem[]
}

const { user } = useAuthStore()
// Nguyen Van A -> NA
const shortNameLetter = computed(() => user?.fullName?.charAt(0).toUpperCase())
const authStore = useAuthStore()
const isLogged = computed(() => authStore.user !== null)
const { logout } = useAuthStore()
const { push } = useRouter()

const defaultAuthOptions: ProfileOptions[] = [
  {
    name: 'auth',
    separator: false,
    list: [
      {
        name: 'login',
        to: 'login',
        icon: 'mso-login',
      },
      {
        name: 'signup',
        to: 'signup',
        icon: 'mso-person_add',
      },
    ],
  },
]

const props = withDefaults(
  defineProps<{
    options?: ProfileOptions[]
  }>(),
  {
    options: () => [
      {
        name: 'account',
        separator: true,
        list: [
          {
            name: 'profile',
            to: 'profile',
            icon: 'mso-account_circle',
          },
        ],
      },
      {
        name: 'explore',
        separator: true,
        list: [
          {
            name: 'helpAndSupport',
            href: 'https://discord.gg/u7fQdqQt8c',
            icon: 'mso-error',
          },
        ],
      },
      {
        name: '',
        separator: false,
        list: [
          {
            name: 'logout',
            icon: 'mso-logout',
            action: 'logoutAction',
          },
        ],
      },
    ],
  },
)

const menuOptions = computed(() => (isLogged.value ? props.options : defaultAuthOptions))

const isShown = ref(false)

const resolveLinkAttribute = (item: ProfileListItem) => {
  if (item.to) return { to: { name: item.to } }
  if (item.href) return { href: item.href, target: '_blank' }
  if (item.action) {
    return {
      onClick: () => {
        if (item.action === 'logoutAction') {
          logout()
          push({ name: 'login' })
        }
      },
    }
  }
  return {}
}
</script>

<style lang="scss">
.profile-dropdown {
  cursor: pointer;

  &__content {
    .menu-item:hover {
      background: var(--hover-color);
    }
  }

  &__anchor {
    display: inline-block;
  }
}
</style>
