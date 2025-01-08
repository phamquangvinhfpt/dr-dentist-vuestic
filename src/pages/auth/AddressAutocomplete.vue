<script lang="ts" setup>
import { useAuthStore } from '@/stores/modules/auth.module'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ValidationRule } from 'vuestic-ui'

const addressInput = ref('')
const suggestions = ref<any[]>([])
const showSuggestions = ref(false)
let sessionToken = crypto.randomUUID()
const isSelected = ref(false)
const { t } = useI18n()
const authStore = useAuthStore()
const props = defineProps<{
  rules?: ValidationRule<string>[] | undefined
  modelValue?: string
}>()

// Add watcher for modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== addressInput.value) {
      addressInput.value = newValue || ''
    }
  },
  { immediate: true },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// Type-safe debounce function
const debounce = <T extends (...args: any[]) => any>(func: T, wait: number): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

const fetchAddressSuggestions = async (query: string) => {
  if (query.length < 2) {
    suggestions.value = []
    showSuggestions.value = false
    return
  }

  authStore
    .address(encodeURIComponent(query), sessionToken)
    .then((response) => {
      if (response.status === 'OK') {
        suggestions.value = response.predictions || []
        showSuggestions.value = true
      }
    })
    .catch((error) => {
      console.error('Lỗi:', error)
      suggestions.value = []
      showSuggestions.value = false
    })
}

const debouncedSearch = debounce(fetchAddressSuggestions, 500)

const selectSuggestion = (prediction: any) => {
  addressInput.value = prediction.description
  isSelected.value = true
  showSuggestions.value = false
  sessionToken = crypto.randomUUID()
  setTimeout(() => {
    isSelected.value = false
  }, 300)
}

watch(
  () => addressInput.value,
  (newValue) => {
    if (!isSelected.value && newValue !== props.modelValue) {
      emit('update:modelValue', newValue)
      debouncedSearch(newValue)
    }
  },
)
</script>

<template>
  <div class="address-container relative">
    <VaInput
      v-model="addressInput"
      :rules="props.rules"
      class="mb-4 w-full"
      :label="t('auth.address')"
      autocomplete="off"
    />

    <div
      v-if="showSuggestions && suggestions.length && !isSelected"
      class="suggestions absolute z-10 w-full shadow-lg rounded-lg max-h-[300px] overflow-y-auto dark:bg-gray-800 bg-white dark:border dark:border-gray-700 dark:text-gray-200 text-gray-800"
    >
      <div
        v-for="(prediction, index) in suggestions"
        :key="index"
        class="suggestion-item px-4 py-3 cursor-pointer dark:hover:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 border-b dark:last:border-b-0 last:border-b-0 flex items-center"
        @click="selectSuggestion(prediction)"
      >
        <span class="mr-2">📍</span>
        {{ prediction.description }}
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Dark mode scrollbar */
.suggestions::-webkit-scrollbar {
  width: 8px;
}
.suggestions::-webkit-scrollbar-track {
  background: theme('colors.gray.700');
  border-radius: 8px;
}
.suggestions::-webkit-scrollbar-thumb {
  background: theme('colors.gray.600');
  border-radius: 8px;
}
.suggestions::-webkit-scrollbar-thumb:hover {
  background: theme('colors.gray.500');
}

/* Light mode scrollbar */
.light .suggestions::-webkit-scrollbar-track {
  background: theme('colors.gray.200');
}
.light .suggestions::-webkit-scrollbar-thumb {
  background: theme('colors.gray.300');
}
.light .suggestions::-webkit-scrollbar-thumb:hover {
  background: theme('colors.gray.400');
}
</style>
