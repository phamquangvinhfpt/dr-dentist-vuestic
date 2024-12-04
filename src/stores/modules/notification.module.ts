import { RefreshType } from '@/pages/notification/types'
import notificationService from '@/services/notification.service'
import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    isRefreshData: {
      status: false,
      isFromDropDown: null,
    } as RefreshType,
  }),
  actions: {
    setRefreshData(value: RefreshType) {
      this.isRefreshData = value
    },
    async getListUserDto(): Promise<any> {
      try {
        const result = await notificationService.getListUserDto()
        return await Promise.resolve(result)
      } catch (error) {
        return await Promise.reject(error)
      }
    },
    async getConversations(conversationId: any): Promise<any> {
      try {
        const result = await notificationService.getConversations(conversationId)
        return await Promise.resolve(result)
      } catch (error) {
        return await Promise.reject(error)
      }
    },
    async sendMessage(data: any): Promise<any> {
      try {
        const result = await notificationService.sendMessage(data)
        return await Promise.resolve(result)
      } catch (error) {
        return await Promise.reject(error)
      }
    },
  },
})
