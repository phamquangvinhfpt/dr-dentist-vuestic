export interface INavigationRoute {
  name: string
  displayName: string
  meta: {
    icon: string
    permission?: string
    roles?: string[]
  }
  children?: INavigationRoute[]
}

export default {
  root: {
    name: '/',
    displayName: 'navigationRoutes.home',
  },
  routes: [
    {
      name: 'dashboard',
      displayName: 'menu.dashboard',
      meta: {
        icon: 'vuestic-iconset-dashboard',
      },
    },
    {
      name: 'appointment',
      displayName: 'menu.appointment',
      meta: {
        icon: 'book_online',
      },
    },
    {
      name: 'users-management',
      displayName: 'menu.user-management',
      meta: {
        icon: 'vuestic-iconset-user',
        permission: 'Users.View',
      },
    },
    {
      name: 'faq',
      displayName: 'menu.faq',
      meta: {
        icon: 'quiz',
      },
    },
    {
      name: 'contact',
      displayName: 'menu.contact',
      meta: {
        icon: 'contact_support',
      },
    },
    {
      name: 'audit logs',
      displayName: 'menu.audit-logs',
      meta: {
        icon: 'list_alt',
        permission: 'AuditLogs.View',
      },
    },
    {
      name: 'message',
      displayName: 'menu.message',
      meta: {
        icon: 'message',
      },
    },
    {
      name: 'service-management',
      displayName: 'menu.service-management',
      meta: {
        icon: 'medical_services',
        permission: 'Service.View',
        roles: ['Admin'],
      },
    },
    {
      name: 'procedure-management',
      displayName: 'menu.procedure-management',
      meta: {
        icon: 'healing',
        permission: 'Procedure.View',
        roles: ['Admin'],
      },
    },
    {
      name: 'contact-info-for-staff',
      displayName: 'menu.contact-info-for-staff',
      meta: {
        icon: 'contact_support',
        permission: 'ContactInformation.View',
        roles: ['Admin'],
      },
    },
    {
      name: 'payment-management',
      displayName: 'menu.payment',
      meta: {
        icon: 'payments',
        permission: 'Payment.View',
        roles: ['Admin'],
      },
    },
  ] as INavigationRoute[],
}
