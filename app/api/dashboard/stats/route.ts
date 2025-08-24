import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-config"

// GET /api/dashboard/stats - Obtener estadísticas del dashboard
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
      if (!session.user.emailVerified) {
        return NextResponse.json({ error: 'Cuenta no verificada' }, { status: 403 })
      }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfSixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

    // Obtener todos los miembros con sus membresías más recientes
    const members = await prisma.member.findMany({
      include: {
        memberships: {
          include: {
            membershipType: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    })

    // Calcular estadísticas
  let activeMembers = 0
  let inactiveMembers = 0
  let withoutMembershipMembers = 0

  members.forEach((member: any) => {
      const latestMembership = member.memberships[0]
      if (!latestMembership) {
        withoutMembershipMembers++
        return
      }
      const isActive = latestMembership.isActive && new Date(latestMembership.expirationDate) > now
      if (isActive) activeMembers++
      else inactiveMembers++
    })

    // Nuevos miembros del mes actual
    const newMembersThisMonth = await prisma.member.count({
      where: { firstEnrollmentDate: { gte: startOfMonth } },
    })

    // Miembros que no renovaron: miembros cuyo último membership está expirado
  const membersNotRenewed = members.filter((m: any) => {
      const latest = m.memberships[0]
      if (!latest) return false // se considera 'sin membresía' no 'no renovó'
      return new Date(latest.expirationDate) < now
    }).length

    // Inscripciones por mes (últimos 6 meses) - contar primeras inscripciones
    const enrollmentsByMonth: { month: string; count: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
  const count = members.filter((m: any) => m.firstEnrollmentDate >= monthStart && m.firstEnrollmentDate <= monthEnd).length
      const monthName = monthStart.toLocaleDateString('es-ES', { month: 'short' })
      enrollmentsByMonth.push({ month: monthName, count })
    }

    // Miembros recientes (últimos 5)
    const recentMembers = await prisma.member.findMany({
      take: 5,
      orderBy: {
        firstEnrollmentDate: "desc",
      },
      include: {
        memberships: {
          include: {
            membershipType: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    })

    // Formatear miembros recientes con estado
  const recentMembersWithStatus = recentMembers.map((member: any) => {
      const latestMembership = member.memberships[0]
      const isActive = latestMembership && 
                      latestMembership.isActive && 
                      new Date(latestMembership.expirationDate) > now

      return {
        id: member.id,
        name: `${member.firstName} ${member.lastName}`,
        phone: member.phone,
        status: isActive ? "ACTIVE" : "INACTIVE",
        enrollmentDate: member.firstEnrollmentDate,
        membershipType: latestMembership?.membershipType?.name || "Sin membresía",
      }
    })

    const stats = {
  activeMembers,
  inactiveMembers,
  withoutMembershipMembers,
      newMembersThisMonth,
      membersNotRenewed,
      enrollmentsByMonth,
      recentMembers: recentMembersWithStatus,
      totalMembers: members.length,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
