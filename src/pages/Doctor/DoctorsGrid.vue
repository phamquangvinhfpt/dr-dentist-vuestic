<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    <VaCard
      v-for="doctor in doctors"
      :key="doctor.id"
      class="doctor-card"
      hoverable
      @click="navigateToDetail(doctor.id)"
    >
      <div class="relative">
        <VaImage
          :src="
            doctor.image ||
            'https://plus.unsplash.com/premium_photo-1664475543697-229156438e1e?q=80&w=1972&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
          "
          :alt="doctor.name"
          class="w-full aspect-[4/3] object-cover"
        />
        <div class="absolute top-2 right-2">
          <VaBadge color="warning" class="doctor-rating">
            <template #default>
              {{ doctor.rating.toFixed(1) }} <VaIcon name="star" color="warning" class="ml-2" />
            </template>
          </VaBadge>
        </div>
      </div>

      <VaCardContent class="p-4">
        <div class="flex flex-col h-full">
          <h2 class="va-h6 font-semibold mb-1 line-clamp-1">{{ doctor.name }}</h2>
          <p class="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-1">
            {{ doctor.specialty }}
          </p>
          <div class="mt-auto flex items-center justify-between">
            <div class="flex items-center">
              <VaIcon name="work" size="small" class="mr-1" />
              <span class="text-sm">{{ doctor.experience }}</span>
            </div>
            <VaButton size="small" icon="visibility" class="va-button--outline"> Chi tiết </VaButton>
          </div>
        </div>
      </VaCardContent>
    </VaCard>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useDoctorProfileStore } from '@/stores/modules/doctor.module'
import { VaCard, VaCardContent, VaImage, VaBadge, VaButton, VaIcon } from 'vuestic-ui'

const router = useRouter()
const doctorStore = useDoctorProfileStore()

defineProps({
  doctors: {
    type: Array,
    required: true,
  },
})

const navigateToDetail = (id) => {
  doctorStore.doctorId = id.toString()
  router.push({
    name: 'doctor-detail',
    params: { id },
  })
}
</script>

<style scoped>
.doctor-card {
  transition: transform 0.2s ease-in-out;
  height: 100%;
}

.doctor-card:hover {
  transform: translateY(-4px);
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 640px) {
  .doctor-card {
    margin-bottom: 0.5rem;
  }
}
</style>
