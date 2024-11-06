<template>
  <div :class="{ 'container max-w-6xl mx-auto px-4': isPatient }">
    <div class="flex flex-col sm:flex-row">
      <div class="item">
        <UserProfileSettingList @selectSettingOption="handleSelectedSettingOption" />
      </div>
      <div class="item w-full">
        <UserProfileDetail :setting-option="selectedSettingOption" />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import UserProfileSettingList from './UserProfileSettingList.vue'
import UserProfileDetail from './UserProfileDetail.vue'
import { computed, ref } from 'vue'
import { SettingProfile } from './types'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/modules/auth.module'

const { t } = useI18n()
const authStore = useAuthStore()
const isPatient = computed(() => authStore.musHaveRole('Patient'))
const selectedSettingOption = ref<SettingProfile | null>({
  id: '1',
  name: t('settings.general'),
  icon: 'person',
})
function handleSelectedSettingOption(item: SettingProfile) {
  selectedSettingOption.value = item
}
</script>
