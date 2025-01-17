import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import AuthLayout from '../layouts/AuthLayout.vue'
import AppLayout from '../layouts/AppLayout.vue'
import { useAuthStore } from '@/stores/modules/auth.module'
import ServiceForUser from '../pages/servipage-procedure/ServiceForUser.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: '404' },
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
            name: 'appointment-detail',
            path: 'appointment/:id',
            meta: {
              requireAuth: true,
            },
            component: () => import('../pages/appointment/widgets/list-appointment/AppointmentDetail.vue'),
          },
          {
            name: 'followup-detail',
            path: 'appointment/:id',
            meta: {
              requireAuth: true,
            },
            component: () => import('../pages/appointment/widgets/list-appointment/FollowupDetail.vue'),
          },
          {
            name: 'view-appointment',
            path: '',
            meta: {
              requireAuth: true,
            },
            component: () => import('../pages/appointment/Appointment.vue'),
          },
          {
            name: 'current-treatment',
            path: 'current-treatment',
            meta: {
              requireAuth: true,
            },
            component: () => import('../pages/appointment/CurrentTreatmentPlan.vue'),
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
        name: 'audit-logs',
        path: 'audit-logs',
        meta: {
          requiresAuth: true,
        },
        component: () => import('../pages/audit-logs/AuditLogs.vue'),
      },
      {
        name: 'patients',
        path: 'users-management',
        meta: {
          requiresAuth: true,
        },
        component: () => import('../pages/user/UsersManagement.vue'),
      },
      {
        name: 'user-detail',
        path: 'users-detail/:id',
        meta: {
          requiresAuth: true,
        },
        component: () => import('../pages/user/UserDetail.vue'),
      },
      {
        name: 'user-update',
        path: 'user-update/:id',
        meta: {
          requiresAuth: true,
        },
        component: () => import('../pages/Doctor/UpdateUser.vue'),
      },
      {
        name: 'message',
        path: 'message',
        meta: {
          requiresAuth: true,
        },
        component: () => import('../pages/message/Message.vue'),
      },
      {
        name: 'find-doctors',
        path: 'find-doctors',
        meta: {
          requiresAuth: false,
        },
        component: () => import('../pages/Doctor/DoctorListForUser.vue'),
      },
      {
        name: 'doctor-detail',
        path: 'doctors/:id',
        component: () => import('../pages/Doctor/DoctorDetail.vue'),
        meta: {
          requiresAuth: false,
          title: 'Doctor Details',
        },
      },
      {
        name: 'staff-detail',
        path: 'staff/:id',
        component: () => import('../pages/user/StaffDetail.vue'),
        meta: {
          requiresAuth: true,
          title: 'Staff Details',
        },
      },
      {
        name: 'doctor-detail-admin',
        path: 'doctorsforadmin/:id',
        component: () => import('../pages/Doctor/DoctorDetailForAdmin.vue'),
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
        path: '/doctors/update/:id',
        name: 'doctor-update',
        component: () => import('@/pages/Doctor/UpdateDoctor.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: 'doctors',
        name: 'doctors',
        component: () => import('@/pages/Doctor/DoctorsList.vue'),
        meta: {
          requiresAuth: true,
          title: 'Doctors List',
        },
      },
      {
        path: '/user/create',
        name: 'user-create',
        component: () => import('@/pages/Doctor/CreateUser.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: '/staff/create',
        name: 'staff-create',
        component: () => import('@/pages/Doctor/CreateStaff.vue'),
        meta: {
          requiresAuth: true,
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
        path: '/service-procedures',
        name: 'ServiceProcedures',
        component: () => import('@/pages/servipage-procedure/ServiceProcedures.vue'),
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
        name: 'payment',
        path: 'payment/:id',
        meta: {
          requiresAuth: true,
        },
        component: () => import('../pages/examination/widgets/Payment.vue'),
      },
      {
        path: 'payment-management',
        name: 'payment-management',
        meta: {
          requiresAuth: true,
        },
        component: () => import('../pages/PaymentPages/PaymentManagement.vue'),
      },
      {
        name: 'payment-for-patient',
        path: 'payment-for-patient',
        meta: {
          requiresAuth: true,
        },
        component: () => import('../pages/PaymentPages/PaymentForPatient.vue'),
      },
      {
        name: 'form-application',
        path: 'form-application',
        meta: {
          requiresAuth: true,
        },
        component: () => import('../pages/Form-Application/ApplicationForm.vue'),
      },
      {
        name: 'form-management',
        path: 'form-management',
        meta: {
          requiresAuth: true,
        },
        component: () => import('../pages/Form-Application/FormManagement.vue'),
      },
      {
        name: 'form-for-dentist',
        path: 'form-for-dentist',
        meta: {
          requiresAuth: true,
        },
        component: () => import('../pages/Form-Application/FormForDentist.vue'),
      },
      {
        name: 'medical-record-for-patient',
        path: 'medical-record-for-patient',
        meta: {
          requiresAuth: true,
        },
        component: () => import('../pages/MedicalRecordForPatient/MedicalRecordForPatient.vue'),
      },
      {
        name: 'staff-dashboard',
        path: 'staff-dashboard',
        meta: {
          requiresAuth: true,
          roles: ['staff', 'admin'],
        },
        component: () => import('../pages/home/dashboard/DashboardStaff.vue'),
      },
      {
        name: 'list-room',
        path: 'rooms',
        meta: {
          requiresAuth: true,
          title: 'Danh sách phòng khám',
        },
        component: () => import('@/pages/working-calendar/listRoom.vue'),
      },
      {
        name: 'add-room',
        path: 'add-room',
        meta: {
          requiresAuth: true,
          title: 'Thêm phòng',
        },
        component: () => import('@/pages/working-calendar/AddRoom.vue'),
      },
      {
        name: 'contact-requests',
        path: 'contact-requests',
        meta: {
          requiresAuth: true,
          roles: ['staff', 'admin'],
        },
        component: () => import('../pages/Staff/Contact.vue'),
      },
      {
        path: 'doctor/rating',
        name: 'ratingDoctor',
        component: () => import('@/pages/Doctor/RatingDoctor.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: 'working-calendar',
        name: 'working-calendar',
        component: () => import('@/pages/working-calendar/WorkingManager.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: '/payment-detail/:id',
        name: 'payment-detail',
        component: () => import('@/pages/PaymentPages/PaymentDetail.vue'),
        meta: {
          requiresAuth: true,
          roles: ['Patient'],
        },
      },
      {
        name: 'payment-export',
        path: 'payment-export',
        meta: {
          requiresAuth: true,
        },
        component: () => import('@/pages/PaymentPages/PaymentExport.vue'),
      },
      {
        name: 'feedback',
        path: 'feedback/:appointmentID?',
        meta: {
          requiresAuth: true,
        },
        component: () => import('../pages/user/Feedback.vue'),
      },
      {
        name: 'services',
        path: '/services/:id?',
        meta: {
          requiresAuth: false,
        },
        component: ServiceForUser,
      },
      {
        name: 'list-staff',
        path: 'list-staff',
        meta: {
          requiresAuth: true,
        },
        component: () => import('../pages/user/listStaff.vue'),
      },
      {
        path: 'prescriptions',
        name: 'prescription-detail',
        component: () => import('../pages/Doctor/PrescriptionPatient.vue'),
        meta: {
          requiresAuth: true,
        },
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
