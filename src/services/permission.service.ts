import apiService from '@services/api.service'

class PermissionService {
  // async GetAll(): Promise<any> {
  //   return apiService
  //     .get(`permissions`)
  //     .then((response) => {
  //       return Promise.resolve(response.data)
  //     })
  //     .catch((error) => {
  //       return Promise.reject(error)
  //     })
  // }
  async GetPermissionByUserID(id: string): Promise<any> {
    return apiService
      .get(`/roles/${id}/permissions`)
      .then((response) => {
        console.log('user - permission - service', response.data)
        return Promise.resolve(response.data)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
  async AddPermissionByUserID(id: string, action: string, resource: string): Promise<any> {
    return apiService
      .put(`/roles/update/permissions`, { userID: id, action: action, resource: resource })
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
  async DeletePermissionByUserID(id: string, action: string, resource: string): Promise<any> {
    return apiService
      .put(`/roles/delete/permissions`, { userID: id, action: action, resource: resource })
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
}
export default new PermissionService()
