export interface ContactInfo {
  staffId: string | null
  staffName: string | null
  contactId: string
  title: string
  email: string
  phone: string
  content: string
}

export interface AdvancedSearch {
  fields?: string[]
  keyword?: string
}

export interface Filter {
  field: string
  operator: string
  value: any
}

export interface AdvancedFilter {
  logic: string
  filters: Filter[]
}

export interface ContactSearchParams {
  pageNumber: number
  pageSize: number
  hasStaff?: boolean
  isActive?: boolean
  orderBy: string[]
  keyword?: string
  advancedSearch?: AdvancedSearch
  advancedFilter?: AdvancedFilter
}
export interface ContactResponse {
  data: ContactInfo[]
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
}

export interface Staff {
  id: string
  imageUrl: string
  userName: string
  gender: boolean
  email: string
  isActive: boolean
  phoneNumber: string
  address: string
  isBanned: boolean
  role: {
    roleId: string
    roleName: string
    description: string
    enabled: boolean
  }
}
