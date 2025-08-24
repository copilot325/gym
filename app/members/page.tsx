"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/components/auth/auth-guard"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Search, Filter, Plus, Eye, Loader2 } from "lucide-react"

interface Member {
  id: string
  firstName: string
  lastName: string
  age: number
  phone: string
  status: "ACTIVE" | "INACTIVE" | "NO_MEMBERSHIP"
  firstEnrollmentDate: string
  lastRenewalDate?: string
}

interface MembersResponse {
  members: Member[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const router = useRouter()

  const fetchMembers = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (statusFilter) params.append("status", statusFilter)
      params.append("page", currentPage.toString())
      params.append("limit", "10")

      const response = await fetch(`/api/members?${params}`)
      if (!response.ok) throw new Error("Error al cargar miembros")

      const data: MembersResponse = await response.json()
      setMembers(data.members)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch (error) {
      console.error("Error fetching members:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [search, statusFilter, currentPage])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800">Activo</Badge>
      case "INACTIVE":
        return <Badge className="bg-red-100 text-red-800">Inactivo</Badge>
      case "NO_MEMBERSHIP":
        return <Badge className="bg-gray-100 text-gray-800">Sin Membresía</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-GT')
  }

  return (
    <AuthGuard>
      <AppLayout>
        <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Miembros</h1>
                <p className="text-gray-600 mt-2">Gestiona todos los miembros del gimnasio</p>
              </div>
              <Button onClick={() => router.push("/members/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Miembro
              </Button>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros
                </CardTitle>
                <CardDescription>Busca y filtra miembros por diferentes criterios</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar por nombre, apellido o teléfono..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="w-full sm:w-48">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos los estados</SelectItem>
                        <SelectItem value="ACTIVE">Activo</SelectItem>
                        <SelectItem value="INACTIVE">Inactivo</SelectItem>
                        <SelectItem value="NO_MEMBERSHIP">Sin Membresía</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{total}</div>
                  <p className="text-sm text-gray-600">Total Miembros</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {members.filter(m => m.status === "ACTIVE").length}
                  </div>
                  <p className="text-sm text-gray-600">Activos</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-gray-600">
                    {members.filter(m => m.status === "NO_MEMBERSHIP").length}
                  </div>
                  <p className="text-sm text-gray-600">Sin Membresía</p>
                </CardContent>
              </Card>
            </div>

            {/* Members Table */}
            <Card>
              <CardHeader>
                <CardTitle>Lista de Miembros</CardTitle>
                <CardDescription>
                  Mostrando {members.length} de {total} miembros
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Cargando miembros...</span>
                  </div>
                ) : members.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No se encontraron miembros</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Edad</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Inscripción</TableHead>
                            <TableHead>Última Renovación</TableHead>
                            <TableHead>Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {members.map((member) => (
                            <TableRow key={member.id}>
                              <TableCell className="font-medium">
                                {member.firstName} {member.lastName}
                              </TableCell>
                              <TableCell>{member.age}</TableCell>
                              <TableCell>{member.phone}</TableCell>
                              <TableCell>{getStatusBadge(member.status)}</TableCell>
                              <TableCell>{formatDate(member.firstEnrollmentDate)}</TableCell>
                              <TableCell>
                                {member.lastRenewalDate ? formatDate(member.lastRenewalDate) : "-"}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => router.push(`/members/${member.id}`)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Ver
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="mt-6">
                        <Pagination>
                          <PaginationContent>
                            <PaginationPrevious 
                              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  onClick={() => setCurrentPage(page)}
                                  isActive={currentPage === page}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            ))}
                            
                            <PaginationNext 
                              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  )
}
