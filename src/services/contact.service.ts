import apiService from './api.service'

class ContactService {
  async sendContactMessage(data: any): Promise<any> {
    return apiService
      .post(`/customercontact/add`, data)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
}

export default new ContactService()
