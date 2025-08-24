import type { Member, MembershipType, UserMembership, User } from "./types"

export const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@bodystrong.com",
    password: "admin123",
    name: "Admin User",
    role: "ADMIN",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
]

export const mockMembershipTypes: MembershipType[] = [
  {
    id: "1",
    name: "Mensual",
    description: "Membresía mensual con acceso completo al gimnasio",
    price: 50.0,
    durationInDays: 30,
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    name: "Trimestral",
    description: "Membresía trimestral con descuento especial",
    price: 135.0,
    durationInDays: 90,
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "3",
    name: "Anual",
    description: "Membresía anual con máximo descuento",
    price: 480.0,
    durationInDays: 365,
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
]

export const mockMembers: Member[] = [
  {
    id: "1",
    name: "Juan Pérez",
    email: "juan.perez@email.com",
    phone: "+1234567890",
    dateOfBirth: new Date("1990-05-15"),
    emergencyContact: "María Pérez",
    emergencyPhone: "+1234567891",
    medicalConditions: "Ninguna",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    memberships: [],
  },
  {
    id: "2",
    name: "Ana García",
    email: "ana.garcia@email.com",
    phone: "+1234567892",
    dateOfBirth: new Date("1985-08-22"),
    emergencyContact: "Carlos García",
    emergencyPhone: "+1234567893",
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01"),
    memberships: [],
  },
  {
    id: "3",
    name: "Luis Rodríguez",
    email: "luis.rodriguez@email.com",
    phone: "+1234567894",
    dateOfBirth: new Date("1992-12-10"),
    emergencyContact: "Carmen Rodríguez",
    emergencyPhone: "+1234567895",
    medicalConditions: "Lesión de rodilla previa",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
    memberships: [],
  },
]

export const mockUserMemberships: UserMembership[] = [
  {
    id: "1",
    memberId: "1",
    membershipTypeId: "1",
    startDate: new Date("2024-12-01"),
    endDate: new Date("2024-12-31"),
    status: "ACTIVE",
    paymentStatus: "PAID",
    createdAt: new Date("2024-12-01"),
    updatedAt: new Date("2024-12-01"),
    member: mockMembers[0],
    membershipType: mockMembershipTypes[0],
  },
  {
    id: "2",
    memberId: "2",
    membershipTypeId: "2",
    startDate: new Date("2024-11-01"),
    endDate: new Date("2025-01-30"),
    status: "ACTIVE",
    paymentStatus: "PAID",
    createdAt: new Date("2024-11-01"),
    updatedAt: new Date("2024-11-01"),
    member: mockMembers[1],
    membershipType: mockMembershipTypes[1],
  },
  {
    id: "3",
    memberId: "3",
    membershipTypeId: "1",
    startDate: new Date("2024-11-15"),
    endDate: new Date("2024-12-15"),
    status: "EXPIRED",
    paymentStatus: "OVERDUE",
    createdAt: new Date("2024-11-15"),
    updatedAt: new Date("2024-11-15"),
    member: mockMembers[2],
    membershipType: mockMembershipTypes[0],
  },
]

// Update members with their memberships
mockMembers[0].memberships = [mockUserMemberships[0]]
mockMembers[1].memberships = [mockUserMemberships[1]]
mockMembers[2].memberships = [mockUserMemberships[2]]
