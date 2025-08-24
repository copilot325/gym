import type { Member, MembershipType, UserMembership, User, DashboardStats } from "./types"

export interface MembersQueryParams {
  search?: string
  status?: 'ACTIVE' | 'INACTIVE' | 'NO_MEMBERSHIP'
  page?: number
  limit?: number
}

export interface MembersApiResponse {
  members: Member[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

class DataService {
  // User operations
  async getUsers(): Promise<User[]> { return [] }
  async getUserByEmail(_email: string): Promise<User | null> { return null }

  // Member operations
  async getMembers(params: MembersQueryParams = {}): Promise<MembersApiResponse> {
    const query = new URLSearchParams()
    if (params.search) query.set('search', params.search)
    if (params.status) query.set('status', params.status)
    if (params.page) query.set('page', String(params.page))
    if (params.limit) query.set('limit', String(params.limit))
    const url = `/api/members${query.toString() ? `?${query.toString()}` : ''}`
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch members')
    return response.json()
  }

  async getMemberById(id: string): Promise<Member | null> {
    const res = await fetch(`/api/members/${id}`)
    if (!res.ok) return null
    return res.json()
  }
  async createMember(payload: any) { const r = await fetch('/api/members',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}); if(!r.ok) throw new Error('Error creating member'); return r.json() }
  async updateMember(id: string, payload: any) { const r = await fetch(`/api/members/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}); if(!r.ok) throw new Error('Error updating member'); return r.json() }

  // Membership Type operations
  async getMembershipTypes(): Promise<MembershipType[]> { const r = await fetch('/api/membership-types'); if(!r.ok) throw new Error('Error types'); return r.json() }

  // User Membership operations
  async getUserMemberships(memberId: string): Promise<UserMembership[]> { const r = await fetch(`/api/members/${memberId}/memberships`); if(!r.ok) throw new Error('Error memberships'); return r.json() }
  async createUserMembership(memberId: string, membershipTypeId: string) { const r = await fetch(`/api/members/${memberId}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({membershipTypeId})}); if(!r.ok) throw new Error('Error renewing'); return r.json() }

  // Dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await fetch("/api/dashboard/stats")
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats")
      }
      return await response.json()
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      throw error
    }
  }

}

export const dataService = new DataService()
