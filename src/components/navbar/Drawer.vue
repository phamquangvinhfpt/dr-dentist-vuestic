<template>
  <Teleport to="body">
    <!-- Overlay -->
    <Transition name="overlay">
      <div
        v-if="isOpen"
        :class="['fixed inset-0 z-40', isDark ? 'bg-black/70' : 'bg-black/50']"
        @click="closeDrawer"
      ></div>
    </Transition>

    <!-- Drawer Panel -->
    <Transition :name="side">
      <div
        v-if="isOpen"
        :class="[
          'fixed top-0 h-full shadow-xl z-50 overflow-y-auto',
          side === 'right' ? 'right-0' : 'left-0',
          'transform transition-transform duration-300 ease-in-out',
          isDark ? 'bg-[#111827]' : 'bg-white',
        ]"
        :style="{ width }"
      >
        <!-- Drawer Header -->
        <div
          :class="['flex justify-between items-center p-4 border-b', isDark ? 'border-gray-700' : 'border-gray-200']"
        >
          <h2 :class="['text-xl font-semibold', isDark ? 'text-white' : 'text-gray-900']">{{ title }}</h2>
          <button
            :class="[
              'p-2 transition-colors duration-200',
              isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900',
            ]"
            @click="closeDrawer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Drawer Content -->
        <div :class="['p-4', isDark ? 'text-gray-200' : 'text-gray-800']">
          <slot></slot>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// Define props interface
interface DrawerProps {
  title?: string
  side?: 'left' | 'right'
  width?: string
}

// Define props with defaults
export interface DrawerInstance {
  openDrawer: () => void
  closeDrawer: () => void
}

withDefaults(defineProps<DrawerProps>(), {
  title: 'Drawer',
  side: 'left',
  width: '320px',
})

// Reactive state for drawer
const isOpen = ref(false)
const isDark = ref(false)

// Theme watcher setup
const updateTheme = () => {
  const theme = localStorage.getItem('theme')
  isDark.value = theme === 'dark'
}

// Watch for localStorage changes
const storageHandler = (e: StorageEvent) => {
  if (e.key === 'theme') {
    updateTheme()
  }
}

// Lifecycle hooks
onMounted(() => {
  updateTheme()
  window.addEventListener('storage', storageHandler)
})

onUnmounted(() => {
  window.removeEventListener('storage', storageHandler)
})

// Methods to control drawer
const openDrawer = () => {
  isOpen.value = true
}

const closeDrawer = () => {
  isOpen.value = false
}

// Expose methods for parent component
defineExpose<DrawerInstance>({
  openDrawer,
  closeDrawer,
})
</script>

<style scoped>
/* Overlay Transition */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s ease;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

/* Right Drawer Transition */
.right-enter-from,
.right-leave-to {
  transform: translateX(100%);
}
.right-enter-active,
.right-leave-active {
  transition: transform 0.3s ease-in-out;
}

/* Left Drawer Transition */
.left-enter-from,
.left-leave-to {
  transform: translateX(-100%);
}
.left-enter-active,
.left-leave-active {
  transition: transform 0.3s ease-in-out;
}
</style>
