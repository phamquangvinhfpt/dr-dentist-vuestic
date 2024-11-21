class PharmaceuticalService {
  async getPharmaceuticals(search: any): Promise<any> {
    const baseUrl = 'https://api.nhathuoclongchau.com.vn/lccus/search-product-service/api/products/ecom/product/suggest'
    const params = new URLSearchParams({
      keyword: search.keyword || '',
      KeywordSuggestSize: search.KeywordSuggestSize || '2',
      CatEcomSuggestSize: search.CatEcomSuggestSize || '2',
      ProductSuggestSize: search.ProductSuggestSize || '100',
    })

    const apiUrl = `${baseUrl}?${params.toString()}`

    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return Promise.resolve(result)
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

export default new PharmaceuticalService()
