"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@nanostores/react"
import { isAuthenticatedStore } from "@/lib/stores/auth-store"
import { dashboardStatsStore, membersStore, dataActions } from "@/lib/stores/data-store"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { MembershipChart } from "@/components/dashboard/membership-chart"
import { RecentMembers } from "@/components/dashboard/recent-members"
import { MembersTable } from "@/components/members/members-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus, Search, Filter } from "lucide-react"

export default function DashboardPageNew() {
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [page, setPage] = useState(1)
  const router = useRouter()

  const isAuthenticated = useStore(isAuthenticatedStore)
  const dashboardStats = useStore(dashboardStatsStore)
  const members = useStore(membersStore)

  // Verificar autenticación
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  // Cargar datos del dashboard
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true)
        
        // Cargar estadísticas
        const statsResponse = await fetch("/api/dashboard/stats")
        if (statsResponse.ok) {
          const stats = await statsResponse.json()
          dataActions.setDashboardStats(stats)
        }

        // Cargar miembros
        const params = new URLSearchParams({
          search: searchTerm,
          status: statusFilter !== "ALL" ? statusFilter : "",
          page: page.toString(),
          limit: "10",
        })

        const membersResponse = await fetch(`/api/members?${params}`)
        if (membersResponse.ok) {
          const data = await membersResponse.json()
          dataActions.setMembers(data.members)
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isAuthenticated) {
      loadDashboardData()
    }
  }, [isAuthenticated, searchTerm, statusFilter, page])

  // Manejar búsqueda
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setPage(1) // Reset page when searching
  }

  // Manejar filtro de estado
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    setPage(1) // Reset page when filtering
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen general del gimnasio BodyStrong
          </p>
        </div>
        <Button onClick={() => router.push("/members/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Miembro
        </Button>
      </div>

      {/* Stats Cards */}
      {dashboardStats && <StatsCards stats={dashboardStats} />}

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Inscripciones por Mes</CardTitle>
            <CardDescription>
              Nuevos miembros registrados en los últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {dashboardStats ? (
              <RevenueChart data={dashboardStats.enrollmentsByMonth} />
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Estado de Membresías</CardTitle>
            <CardDescription>
              Distribución de miembros activos e inactivos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardStats ? (
              <MembershipChart 
                activeMembers={dashboardStats.activeMembers}
                inactiveMembers={dashboardStats.inactiveMembers}
              />
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Members */}
      {dashboardStats && (
        <Card>
          <CardHeader>
            <CardTitle>Miembros Recientes</CardTitle>
            <CardDescription>
              Últimos miembros registrados en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentMembers members={dashboardStats.recentMembers} />
          </CardContent>
        </Card>
      )}

      {/* Members Table with Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Miembros</CardTitle>
          <CardDescription>
            Gestiona y busca entre todos los miembros del gimnasio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nombre, apellido o teléfono..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="ACTIVE">Activos</SelectItem>
                  <SelectItem value="INACTIVE">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Members Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            {/* MembersTable removed from experimental dashboard page-new due to prop changes; consider re-integrating if this page is used */}
          )}
        </CardContent>
      </Card>
    </div>
  )
}
