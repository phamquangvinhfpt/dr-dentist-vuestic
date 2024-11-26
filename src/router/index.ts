import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import LandingPage from '../layouts/LandingPage.vue'
import AuthLayout from '../layouts/AuthLayout.vue'
import AppLayout from '../layouts/AppLayout.vue'
import { useAuthStore } from '@/stores/modules/auth.module'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: '404' },
  },
  {
    name: 'landingPage',
    path: '/index',
    meta: {
      requiresGuest: true,
    },
    component: LandingPage,
  },
  {
    name: 'home',
    path: '/',
    component: AppLayout,
    redirect: { name: 'home-page' },
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
        name: 'home-page',
        path: 'home',
        meta: {
          requiresGuest: true,
        },
        component: () => import('../pages/home/dashboard/widgets/Patient-v2.vue'),
      },
      {
        name: 'faq',
        path: 'faq',
        meta: {
          requiresGuest: true,
        },
        component: () => import('../pages/home/landingpage/FAQ.vue'),
      },
      {
        name: 'contact',
        path: 'contact',
        meta: {
          requiresGuest: true,
        },
        component: () => import('../pages/home/landingpage/Contact.vue'),
      },
      {
        name: 'appointment',
        path: 'appointment',
        meta: {
          requiresAuth: true,
        },
        children: [
          {
            name: 'create-appointment',
            path: 'booking',
            meta: {
              requireAuth: true,
            },
            component: () => import('../pages/appointment/CreateAppointment.vue'),
          },
          {
            name: 'view-appointment',
            path: '',
            component: () => import('../pages/appointment/Appointment.vue'),
          },
        ],
      },
      {
        name: 'examination',
        path: 'examination/:id',
        meta: {
          requiresAuth: true,
        },
        component: () => import('../pages/examination/Examination.vue'),
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
        name: 'users-management',
        path: 'users-management',
        meta: {
          requiresAuth: true,
        },
        component: () => import('../pages/user/UsersManagement.vue'),
      },
      {
        name: 'permission-management',
        path: 'permission',
        meta: {
          requiresAuth: true,
        },
        component: () => import('../pages/permission/PermissionManagement.vue'),
      },
      {
        name: 'message',
        path: 'message',
        meta: {
          requiresAuth: true,
        },
        component: () => import('../pages/Chat/Message.vue'),
      },
      {
        name: 'doctors-for-users',
        path: 'find-doctors',
        meta: {
          requiresAuth: true,
          title: 'Our Medical Team',
        },
        component: () => import('../pages/Doctor/DoctorListForUser.vue'),
      },
      {
        name: 'doctor-detail',
        path: 'doctors/:id',
        component: () => import('../pages/Doctor/DoctorDetail.vue'),
        meta: {
          requiresAuth: true,
          title: 'Doctor Details',
        },
      },
      {
        path: '/doctors/create',
        name: 'doctor-create',
        component: () => import('@/pages/Doctor/AddDoctor.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: '/doctors',
        name: 'doctors-list',
        component: () => import('@/pages/Doctor/DoctorsList.vue'),
        meta: {
          requiresAuth: true,
          title: 'Doctors List',
        },
      },
      {
        name: 'service-management',
        path: 'service-management',
        meta: {
          requiresAuth: true,
        },
        component: () => import('../pages/servipage-procedure/ServiceManagement.vue'),
      },
      {
        name: 'procedure-management',
        path: 'procedure-management',
        meta: {
          requiresAuth: true,
        },
        component: () => import('../pages/servipage-procedure/ProcedureManagement.vue'),
      },
      {
        name: 'deleted-service-management',
        path: 'deleted-service-management',
        meta: {
          requiresAuth: true,
        },
        component: () => import('../pages/servipage-procedure/DeletedServiceManagement.vue'),
      },
      {
        path: '/procedures/:id',
        name: 'ServiceProcedures',
        component: () => import('../pages/servipage-procedure/ServiceProcedures.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      {
        name: 'contact-info-for-staff',
        path: 'contact-info-for-staff',
        component: () => import('../pages/Contact-Info/ContactInforForStaff.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      {
        name: 'contact-request',
        path: 'contact-request',
        meta: {
          requiresGuest: true,
        },
        component: () => import('../pages/Contact-Info/CreateContactRequest.vue'),
      },
      {
        name: 'my-contacts',
        path: 'my-contacts',
        meta: {
          requiresAuth: true,
        },
        component: () => import('../pages/Contact-Info/MyContacts.vue'),
      },
      {
        path: '/payment-management',
        name: 'payment-management',
        meta: {
          requiresAuth: true,
        },
        redirect: () => {
          const today = new Date().toISOString().split('T')[0]
          return `/payment-management/${today}/${today}`
        },
        children: [
          {
            path: ':startDate/:endDate',
            component: () => import('../pages/PaymentPages/PaymentManagement.vue'),
          },
        ],
      },
      {
        name: 'medical-record-for-patient',
        path: 'medical-record-for-patient',
        meta: {
          requiresAuth: true,
        },
        component: () => import('../pages/MedicalRecordForPatient/MedicalRecordForPatient.vue'),
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
  const authStore = useAuthStore()

  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
    return
  }
  next()
})

export default router
