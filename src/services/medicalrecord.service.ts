import apiService from './api.service'

class MedicalRecord {
  async getMedicalRecord(id: string) {
    return apiService
      .get(`/medicalrecord/patient/${id}`)
      .then((response) => {
        return Promise.resolve(response.data)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
}

export default new MedicalRecord()
