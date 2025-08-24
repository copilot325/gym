import { atom, map } from 'nanostores'

export interface Member {
  id: string
  firstName: string
  lastName: string
  age: number
  phone: string
  firstEnrollmentDate: string
  lastRenewalDate?: string | null
  status: 'ACTIVE' | 'INACTIVE'
  latestMembership?: any
  memberships: any[]
}

export interface MembershipType {
  id: string
  name: string
  daysGranted: number
  price: number
  description?: string | null
  isActive: boolean
}

export interface DashboardStats {
  activeMembers: number
  inactiveMembers: number
  newMembersThisMonth: number
  membersNotRenewed: number
  totalMembers: number
  enrollmentsByMonth: Array<{ month: string; count: number }>
  recentMembers: Array<{
    id: string
    name: string
    phone: string
    status: string
    enrollmentDate: string
    membershipType: string
  }>
}

// Store para los miembros
export const membersStore = atom<Member[]>([])

// Store para los tipos de membresía
export const membershipTypesStore = atom<MembershipType[]>([])

// Store para las estadísticas del dashboard
export const dashboardStatsStore = atom<DashboardStats | null>(null)

// Store para el estado de carga
export const loadingStore = map({
  members: false,
  membershipTypes: false,
  dashboard: false,
})

// Store para filtros de miembros
export const memberFiltersStore = map({
  search: '',
  status: 'ALL', // 'ALL', 'ACTIVE', 'INACTIVE'
  page: 1,
  limit: 10,
})

// Acciones para manejar los datos
export const dataActions = {
  // Miembros
  setMembers: (members: Member[]) => {
    membersStore.set(members)
  },
  
  addMember: (member: Member) => {
    const currentMembers = membersStore.get()
    membersStore.set([member, ...currentMembers])
  },
  
  updateMember: (id: string, updates: Partial<Member>) => {
    const currentMembers = membersStore.get()
    const updatedMembers = currentMembers.map(member => 
      member.id === id ? { ...member, ...updates } : member
    )
    membersStore.set(updatedMembers)
  },
  
  // Tipos de membresía
  setMembershipTypes: (types: MembershipType[]) => {
    membershipTypesStore.set(types)
  },
  
  // Dashboard
  setDashboardStats: (stats: DashboardStats) => {
    dashboardStatsStore.set(stats)
  },
  
  // Loading states
  setLoading: (key: keyof typeof loadingStore.value, value: boolean) => {
    loadingStore.setKey(key, value)
  },
  
  // Filtros
  setMemberFilters: (filters: Partial<typeof memberFiltersStore.value>) => {
    Object.entries(filters).forEach(([key, value]) => {
      memberFiltersStore.setKey(key as any, value)
    })
  },
  
  resetMemberFilters: () => {
    memberFiltersStore.set({
      search: '',
      status: 'ALL',
      page: 1,
      limit: 10,
    })
  }
}
