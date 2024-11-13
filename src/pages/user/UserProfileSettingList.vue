<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { SettingProfile } from './types'
import { SettingProfileOptions } from './UserProfile.enum'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { useAuthStore } from '@/stores/modules/auth.module'

const { t } = useI18n()

const listSettings = ref<SettingProfile[]>([
  {
    id: '1',
    name: t('settings.general'),
    icon: 'person',
  },
  {
    id: '2',
    name: t('auth.change_password'),
    icon: 'lock',
  },
  // doctor profile
  {
    id: '3',
    name: t('settings.doctor'),
    icon: 'person',
  },

  // patient profile
  {
    id: '4',
    name: t('settings.patient_family'),
    icon: 'person',
  },

  //MedicalHistory
  {
    id: '5',
    name: t('settings.medical_history'),
    icon: 'person',
  },

  // patient profile
  {
    id: '6',
    name: t('settings.patient_profile'),
    icon: 'person',
  },
])
const activeOption = ref(SettingProfileOptions.General)
const emit = defineEmits(['select-setting-option'])
const authStore = useAuthStore()
const isPatient = computed(() => authStore.musHaveRole('Patient'))

function selectSettingOption(item: SettingProfile) {
  emit('select-setting-option', item)
  activeOption.value = item.name
}

const user = computed(() => authStore.user)

// Xem giá trị roles để debug
console.log(user.value?.roles)
// Hàm kiểm tra vai trò của user
function hasRole(role: string): boolean {
  return user.value?.roles.includes(role) ?? false
}

// Tạo tabs dựa trên vai trò
const tabs = computed(() => {
  if (!user.value) return []

  const availableTabs = [
    { id: '1', name: t('settings.general'), icon: 'person' },
    { id: '2', name: t('auth.change_password'), icon: 'lock' },
  ]

  if (hasRole('Dentist')) {
    availableTabs.push({ id: '3', name: t('settings.doctor'), icon: 'person' })
  }
  if (hasRole('Patient')) {
    availableTabs.push(
      { id: '4', name: t('settings.patient_family'), icon: 'person' },
      { id: '5', name: t('settings.medical_history'), icon: 'person' },
      { id: '6', name: t('settings.patient_profile'), icon: 'person' },
    )
  }
  if (hasRole('Staff')) {
    // Thêm các tab khác nếu cần
  }

  return availableTabs
})

const selectedTab = ref(tabs.value[0].id)

onMounted(() => {
  selectSettingOption(listSettings.value[0])
})
</script>

<template>
  <div :class="{ 'max-w-3xl container items-center p-16': isPatient }">
    <VaCard class="p-2 ml-1 rounded">
      <VaTabs v-model="selectedTab" vertical grow class="mr-5">
        <template #tabs>
          <VaTab v-for="tab in tabs" :key="tab.id" :name="tab.id" @click="selectSettingOption(tab)">
            <VaIcon :name="tab.icon" class="mr-2" />
            {{ tab.name }}
          </VaTab>
        </template>
      </VaTabs>
    </VaCard>
  </div>
</template>
