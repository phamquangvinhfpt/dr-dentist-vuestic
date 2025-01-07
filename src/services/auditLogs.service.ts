import { QueryAuditLogsType } from '@/pages/audit-logs/types'
import apiService from '@services/api.service'

class auditLogsService {
  async getAuditLogs(data: QueryAuditLogsType): Promise<any> {
    return apiService
      .post(`/personal/logs`, data)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
  async getResourceType(): Promise<any> {
    return apiService
      .get(`/personal/logs/resource-type`)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
  async exportAuditLogs(): Promise<any> {
    return apiService
      .postFileData(
        `/v1/files/export-audit-logs`,
        {},
        {
          responseType: 'blob',
        },
      )
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
}
export default new auditLogsService()
