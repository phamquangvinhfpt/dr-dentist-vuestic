import { defineStore } from 'pinia'
import PermissionService from '@services/permission.service'
export const usePermissionStore = defineStore('groupPermission', {
  state: () => {
    return {
      permissions: [] as string[],
      isLoading: true,
      message: '' as string,
    }
  },
  actions: {
    async GetPermissionByUserID(id: string): Promise<string[]> {
      try {
        const res = await PermissionService.GetPermissionByUserID(id)
        this.isLoading = false
        console.log('user - permission', this.permissions)
        this.permissions = res
        return Promise.resolve(this.permissions)
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async AddPermissionByUserID(id: string, action: string, resource: string): Promise<any> {
      try {
        const res = await PermissionService.AddPermissionByUserID(id, action, resource)
        this.isLoading = false
        this.message = res.data
        return Promise.resolve(res)
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async DeletePermissionByUserID(id: string, action: string, resource: string): Promise<any> {
      try {
        const res = await PermissionService.DeletePermissionByUserID(id, action, resource)
        this.isLoading = false
        this.message = res.data
        return Promise.resolve(res)
      } catch (error) {
        return Promise.reject(error)
      }
    },
  },
})
