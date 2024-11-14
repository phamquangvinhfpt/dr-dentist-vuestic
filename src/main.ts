import { computed, createApp } from 'vue'
import i18n from './i18n'
import { createVuestic } from 'vuestic-ui'
import { createGtm } from '@gtm-support/vue-gtm'

import stores from './stores'
import router from './router'
import vuesticGlobalConfig from '@services/vuestic-ui/global-config'
import App from './App.vue'
import { useAuthStore } from '@modules/auth.module'
import { VueReCaptcha } from 'vue-recaptcha-v3'
import { Capacitor } from '@capacitor/core'

const app = createApp(App)

app.use(stores)
app.use(router)
app.use(i18n)
app.use(createVuestic({ config: vuesticGlobalConfig }))

const authStore = useAuthStore()
authStore.checkAuth()
const isGuestOrPatient = computed(() => authStore.musHaveRole('Patient') || authStore.user === null)
router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresGuest)) {
    if (isGuestOrPatient.value) {
      return next()
    } else {
      return next({ name: 'dashboard' })
    }
  }

  if (to.matched.some((record) => record.meta.requiresCaptcha)) {
    app.use(VueReCaptcha, {
      siteKey: import.meta.env.VITE_APP_RECAPTCHA_SITE_KEY,
      loaderOptions: {
        useRecaptchaNet: true,
        autoHideBadge: true,
      },
    })
    return next()
  }

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!authStore.isAuthenticated) {
      return next({ name: 'login' })
    } else {
      if (to.matched.some((record) => record.meta.permission)) {
        const permission = to.meta.permission as string
        if (authStore.hasAccess(permission)) {
          return next()
        } else {
          return next({ name: '403' })
        }
      } else {
        return next()
      }
    }
  }

  return next()
})

if (import.meta.env.VITE_APP_GTM_ENABLED) {
  app.use(
    createGtm({
      id: import.meta.env.VITE_APP_GTM_KEY,
      debug: false,
      vueRouter: router,
    }),
  )
}

router.beforeEach((to, from, next) => {
  const platform = Capacitor.getPlatform()
  if (platform === 'android' || platform === 'ios') {
    // Nếu là mobile (Android hoặc iOS), chuyển hướng đến trang login khi vào trang chủ
    if (to.path === '/') {
      next('/login')
    } else {
      next()
    }
  } else {
    // Nếu là web, giữ nguyên điều hướng
    next()
  }
})

app.mount('#app')
