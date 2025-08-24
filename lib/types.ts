export interface User {
  id: string
  email: string
  hashedPassword: string
  emailVerified: boolean
  name?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Member {
  id: string
  firstName: string
  lastName: string
  age: number
  phone: string
  firstEnrollmentDate: Date
  lastRenewalDate?: Date | null
  createdAt: Date
  updatedAt: Date
  creatorId: string
  memberships: UserMembership[]
  status?: "ACTIVE" | "INACTIVE" // Campo computado
}

export interface MembershipType {
  id: string
  name: string
  daysGranted: number
  price: number
  description?: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  creatorId: string
  userMemberships?: UserMembership[]
}

export interface UserMembership {
  id: string
  acquisitionDate: Date
  expirationDate: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  memberId: string
  membershipTypeId: string
  creatorId: string
  member?: Member
  membershipType?: MembershipType
}

// Dashboard KPIs per requirements
export interface DashboardStats {
  totalMembers: number
  activeMembers: number
  inactiveMembers: number // Con membresía vencida
  withoutMembershipMembers: number // Nunca ha tenido o sin registros
  newMembersThisMonth: number
  membersNotRenewed: number // Última membresía vencida (excluye sin membresía histórica)
  enrollmentsByMonth: { month: string; count: number }[]
}
