import apiService from './api.service'

class DashboardService {
  async getChartRevenue(data: any): Promise<any> {
    let url
    if (!data || !data.start || !data.end) {
      url = `/v1/dashboard/chart/revenue`
    } else {
      url = `/v1/dashboard/chart/revenue?start=${data.start}&end=${data.end}`
    }

    return apiService
      .get(url)
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        console.error('Service error:', error)
        return Promise.reject(error)
      })
  }
  // /v1/dashboard/chart/deposit?start=2021-01-01&end=2025-12-31
  async getChartDeposit(data: any): Promise<any> {
    let url
    if (!data || !data.start || !data.end) {
      url = `/v1/dashboard/chart/deposit`
    } else {
      url = `/v1/dashboard/chart/deposit?start=${data.start}&end=${data.end}`
    }

    return apiService
      .get(url)
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        console.error('Service error:', error)
        return Promise.reject(error)
      })
  }
  // /v1/dashboard/revenue/services?start=2021-01-01&end=2025-12-31
  async getRevenueServices(data: any): Promise<any> {
    let url
    if (!data || !data.start || !data.end) {
      url = `/v1/dashboard/revenue/services`
    } else {
      url = `/v1/dashboard/revenue/service?start=${data.start}&end=${data.end}`
    }

    return apiService
      .get(url)
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        console.error('Service error:', error)
        return Promise.reject(error)
      })
  }
  // /v1/dashboard/chart/member-growth?start=2021-01-01&end=2025-12-31
  async getChartMemberGrowth(data: any): Promise<any> {
    let url
    if (!data || !data.start || !data.end) {
      url = `/v1/dashboard/chart/member-growth`
    } else {
      url = `/v1/dashboard/chart/member-growth?start=${data.start}&end=${data.end}`
    }

    return apiService
      .get(url)
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        console.error('Service error:', error)
        return Promise.reject(error)
      })
  }
  // /v1/dashboard/rate/doctor?start=2021-01-01&end=2025-12-31
  async getRateDoctor(data: any): Promise<any> {
    let url
    if (!data || !data.start || !data.end) {
      url = `/v1/dashboard/rate/doctor`
    } else {
      url = `/v1/dashboard/rate/doctor?start=${data.start}&end=${data.end}`
    }

    return apiService
      .get(url)
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        console.error('Service error:', error)
        return Promise.reject(error)
      })
  }
  // /v1/dashboard/analytic/booking?start=2021-01-01&end=2025-12-31
  async getAnalyticBooking(data: any): Promise<any> {
    let url
    if (!data || !data.start || !data.end) {
      url = `/v1/dashboard/analytic/booking`
    } else {
      url = `/v1/dashboard/analytic/booking?start=${data.start}&end=${data.end}`
    }

    return apiService
      .get(url)
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        console.error('Service error:', error)
        return Promise.reject(error)
      })
  }
  async getSatisfied(): Promise<any> {
    return apiService
      .get(`/v1/dashboard/patient/satisfied`)
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
  async getRegularDoctor(): Promise<any> {
    return apiService
      .get(`/v1/dashboard/doctor/regular`)
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
  async getTotalService(): Promise<any> {
    return apiService
      .get(`/v1/dashboard/doctor/regular`)
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
  async getAppointmentDone(): Promise<any> {
    return apiService
      .get(`/v1/dashboard/appointment/done`)
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
}

export default new DashboardService()
