"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { AppLayout } from "@/components/layout/app-layout"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { MembershipChart } from "@/components/dashboard/membership-chart"
import { EnrollmentsBarChart } from "@/components/dashboard/revenue-chart"
import { RecentMembers } from "@/components/dashboard/recent-members"
import { dataService } from "@/lib/data-service"
import type { DashboardStats, Member } from "@/lib/types"

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [dashboardStats, membersResp] = await Promise.all([
          dataService.getDashboardStats(),
          dataService.getMembers({ limit: 5, page: 1 }),
        ])
        setStats(dashboardStats)
        setMembers(membersResp.members)
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (isLoading) {
    return (
      <AuthGuard>
        <AppLayout>
          <div className="flex items-center justify-center min-h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </AppLayout>
      </AuthGuard>
    )
  }

  if (!stats) {
    return (
      <AuthGuard>
        <AppLayout>
          <div className="flex items-center justify-center min-h-full">
            <p>Error al cargar los datos del dashboard</p>
          </div>
        </AppLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <AppLayout>
        <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard BodyStrong</h1>
              <p className="text-gray-600 mt-2">Resumen general del gimnasio</p>
            </div>

            {/* Stats Cards */}
            <StatsCards stats={stats} />

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MembershipChart
                activeMembers={stats.activeMembers}
                inactiveMembers={stats.inactiveMembers}
                withoutMembershipMembers={stats.withoutMembershipMembers}
                totalMembers={stats.totalMembers}
              />
              <EnrollmentsBarChart data={stats.enrollmentsByMonth} />
            </div>

            {/* Recent Members */}
            <RecentMembers members={members} />
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  )
}
