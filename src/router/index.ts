import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import LandingPage from '../layouts/LandingPage.vue'
import AuthLayout from '../layouts/AuthLayout.vue'
import AppLayout from '../layouts/AppLayout.vue'
import { Capacitor } from '@capacitor/core'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: '404' },
  },
  {
    name: 'landingPage',
    path: '/index',
    component: LandingPage,
  },
  {
    name: 'home',
    path: '/',
    component: AppLayout,
    redirect: { name: 'landingPage' },
    children: [
      {
        name: 'dashboard',
        path: 'dashboard',
        meta: {
          requiresAuth: true,
        },
        component: () => import('../pages/home/dashboard/Dashboard.vue'),
      },
      {
        name: 'profile',
        path: 'profile',
        meta: {
          requiresAuth: true,
        },
        component: () => import('../pages/user/UserProfile.vue'),
      },
      {
        name: 'notifications',
        path: 'notification',
        meta: {
          requiresAuth: true,
        },
        component: () => import('../pages/notification/Notification.vue'),
      },
      {
        name: 'audit logs',
        path: 'audit-logs',
        meta: {
          requiresAuth: true,
        },
        component: () => import('../pages/audit-logs/AuditLogs.vue'),
      },
      {
        name: 'message',
        path: 'message',
        meta: {
          requiresAuth: true,
        },
        component: () => import('../pages/Chat/Message.vue'),
      },
    ],
  },
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        name: 'login',
        path: 'login',
        meta: {
          requiresAuth: false,
          requiresCaptcha: true,
        },
        component: () => import('../pages/auth/Login.vue'),
      },
      {
        name: 'signup',
        path: 'signup',
        meta: {
          requiresAuth: false,
          requiresCaptcha: true,
        },
        component: () => import('../pages/auth/Signup.vue'),
      },
      {
        name: 'recover-password',
        path: 'recover-password',
        meta: {
          requiresAuth: false,
          requiresCaptcha: true,
        },
        component: () => import('../pages/auth/RecoverPassword.vue'),
      },
      {
        name: 'confirm-email',
        path: 'confirm-email',
        meta: {
          requiresAuth: false,
        },
        component: () => import('../pages/auth/ConfirmEmail.vue'),
      },
      {
        name: 'recover-password-email',
        path: 'recover-password-email',
        meta: {
          requiresAuth: false,
        },
        component: () => import('../pages/auth/CheckTheEmail.vue'),
      },
      {
        name: 'reset-password',
        path: 'reset-password',
        meta: {
          requiresAuth: false,
          requiresCaptcha: true,
        },
        component: () => import('../pages/auth/ResetPassword.vue'),
      },
      {
        path: '',
        meta: {
          requiresAuth: false,
        },
        redirect: { name: 'login' },
      },
    ],
  },
  {
    name: '404',
    path: '/404',
    component: () => import('../pages/404.vue'),
  },
  {
    name: 'privacy-policy',
    path: '/privacy',
    component: () => import('../pages/privacy-policy.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    // For some reason using documentation example doesn't scroll on page navigation.
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    } else {
      window.scrollTo(0, 0)
    }
  },
  routes,
})
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

export default router
