export interface INavigationRoute {
  name: string
  displayName: string
  meta: {
    icon: string
    permission?: string
    role?: string
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
      name: 'services',
      displayName: 'menu.services',
      meta: {
        icon: 'medical_services',
        roles: ['Guest', 'Patient'],
      },
    },
    {
      name: 'find-doctors',
      displayName: 'menu.doctors',
      meta: {
        icon: 'person_pin_circle',
        roles: ['Guest', 'Patient'],
      },
    },
    {
      name: 'appointment',
      displayName: 'menu.appointment',
      meta: {
        icon: 'book_online',
      },
      children: [
        {
          name: 'create-appointment',
          displayName: 'menu.create-appointment',
          meta: {
            icon: 'add',
            permission: 'Appointment.Create',
            role: 'Patient',
          },
        },
        {
          name: 'view-appointment',
          displayName: 'menu.view-appointment',
          meta: {
            icon: 'visibility',
            permission: 'Appointment.View',
          },
        },
      ],
    },
    {
      name: 'users-management',
      displayName: 'menu.user-management',
      meta: {
        icon: 'vuestic-iconset-user',
      },
      children: [
        {
          name: 'doctors',
          displayName: 'menu.doctor-management',
          meta: {
            icon: 'person',
            permission: 'Users.View',
            roles: ['Admin'],
          },
        },
        {
          name: 'list-staff',
          displayName: 'menu.staff-management',
          meta: {
            icon: 'person',
            permission: 'Users.View',
            roles: ['Admin'],
          },
        },
        {
          name: 'patients',
          displayName: 'menu.patient-management',
          meta: {
            icon: 'person',
            permission: 'Users.View',
            roles: ['Admin'],
          },
        },
      ],
    },
    {
      name: 'working-calendar',
      displayName: 'menu.working-calendar',
      meta: {
        icon: 'calendar_month',
        roles: ['Admin', 'Staff', 'Dentist'],
      },
    },
    {
      name: 'audit-logs',
      displayName: 'menu.audit-logs',
      meta: {
        icon: 'list_alt',
        permission: 'AuditLogs.View',
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
      name: 'my-contacts',
      displayName: 'menu.my-contacts',
      meta: {
        icon: 'contact_support',
        permission: 'ContactInformation.View',
        roles: ['Staff'],
      },
    },
    {
      name: 'message',
      displayName: 'menu.message',
      meta: {
        icon: 'message',
        permission: 'PatientMessages.View',
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
    //form application
    // {
    //   name: 'form-application',
    //   displayName: 'menu.form-application',
    //   meta: {
    //     icon: 'description',
    //     roles: ['Dentist'],
    //   },
    // },
    {
      name: 'form-management',
      displayName: 'menu.form-management',
      meta: {
        icon: 'assignment',
        roles: ['Admin'],
      },
    },
    {
      name: 'form-for-dentist',
      displayName: 'menu.form-for-dentist',
      meta: {
        icon: 'fact_check',
        roles: ['Dentist'],
      },
    },
    //payyment for patient
    {
      name: 'payment-for-patient',
      displayName: 'menu.payment-for-patient',
      meta: {
        icon: 'payments',
        roles: ['Patient'],
      },
    },
    //medical record for patient
    {
      name: 'medical-record-for-patient',
      displayName: 'menu.medical-record-for-patient',
      meta: {
        icon: 'assignment',
        roles: ['Patient'],
      },
    },
  ] as INavigationRoute[],
}
