import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'vuestic.admin',
  appName: 'Dr. Dentist',
  webDir: 'dist',
  plugins: {
    LocalNotifications: {
      iconColor: '#488AFF',
      sound: 'noti.wav',
    },
  },
}

export default config
