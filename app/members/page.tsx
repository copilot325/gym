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
import { Search, Filter, Plus, Eye, Loader2, Pencil, Trash2, Save, X } from "lucide-react"

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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState({ firstName: '', lastName: '', age: '', phone: '' })
  const [actionLoading, setActionLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
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
      if (!response.ok) {
        const er = await response.json().catch(()=>({}))
        throw new Error(er.error || "Error al cargar miembros")
      }

      const data: MembersResponse = await response.json()
      setMembers(data.members)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch (error: any) {
      console.error("Error fetching members:", error)
      setErrorMsg(error.message)
    } finally {
      setIsLoading(false)
    }
  }
  const startEdit = (m: Member) => {
    setEditingId(m.id)
    setEditDraft({ firstName: m.firstName, lastName: m.lastName, age: String(m.age), phone: m.phone })
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const saveEdit = async (id: string) => {
    setActionLoading(true)
    try {
      const payload: any = {}
      const orig = members.find(m=>m.id===id)
      if (!orig) return
      const ageNum = Number(editDraft.age)
      if (!editDraft.firstName.trim() || !editDraft.lastName.trim()) throw new Error('Nombre y apellido requeridos')
      if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) throw new Error('Edad inválida (1-120)')
      if (!/^\d{8}$/.test(editDraft.phone)) throw new Error('Teléfono debe tener 8 dígitos')
      if (editDraft.firstName !== orig.firstName) payload.firstName = editDraft.firstName.trim()
      if (editDraft.lastName !== orig.lastName) payload.lastName = editDraft.lastName.trim()
      if (ageNum !== orig.age) payload.age = ageNum
      if (editDraft.phone !== orig.phone) payload.phone = editDraft.phone
      if (Object.keys(payload).length === 0) { setEditingId(null); return }
      const res = await fetch(`/api/members/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
      if (!res.ok) { const er = await res.json().catch(()=>({})); throw new Error(er.error || 'Error actualizando') }
      const updated = await res.json()
      setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updated } : m))
      setEditingId(null)
    } catch (e:any) {
      setErrorMsg(e.message || 'Error actualizando miembro')
    } finally { setActionLoading(false) }
  }

  const deleteMember = async (id: string) => {
    if (!confirm('¿Eliminar este miembro?')) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/members/${id}`, { method:'DELETE' })
      if (!res.ok) { const er = await res.json().catch(()=>({})); throw new Error(er.error || 'Error eliminando') }
      setMembers(prev => prev.filter(m=>m.id!==id))
      setTotal(t=>t-1)
    } catch (e:any) { setErrorMsg(e.message || 'Error eliminando miembro') } finally { setActionLoading(false) }
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
                {errorMsg && (
                  <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm border border-red-200">{errorMsg}</div>
                )}
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
                          {members.map((member) => {
                            const isEditingRow = editingId === member.id
                            return (
                              <TableRow key={member.id} className={isEditingRow ? 'bg-muted/40' : ''}>
                                <TableCell className="font-medium">
                                  {isEditingRow ? (
                                    <div className="flex gap-2">
                                      <Input value={editDraft.firstName} onChange={e=>setEditDraft(f=>({...f, firstName: e.target.value}))} className="h-8 w-24" />
                                      <Input value={editDraft.lastName} onChange={e=>setEditDraft(f=>({...f, lastName: e.target.value}))} className="h-8 w-24" />
                                    </div>
                                  ) : (
                                    `${member.firstName} ${member.lastName}`
                                  )}
                                </TableCell>
                                <TableCell>
                                  {isEditingRow ? (
                                    <Input type="number" value={editDraft.age} onChange={e=>setEditDraft(f=>({...f, age: e.target.value}))} className="h-8 w-16" />
                                  ) : member.age}
                                </TableCell>
                                <TableCell>
                                  {isEditingRow ? (
                                    <Input value={editDraft.phone} maxLength={8} onChange={e=>setEditDraft(f=>({...f, phone: e.target.value.replace(/[^0-9]/g,'')}))} className="h-8 w-28" />
                                  ) : member.phone}
                                </TableCell>
                                <TableCell>{getStatusBadge(member.status)}</TableCell>
                                <TableCell>{formatDate(member.firstEnrollmentDate)}</TableCell>
                                <TableCell>{member.lastRenewalDate ? formatDate(member.lastRenewalDate) : '-'}</TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => router.push(`/members/${member.id}`)}>
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    {isEditingRow ? (
                                      <>
                                        <Button variant="success" size="sm" onClick={()=>saveEdit(member.id)} disabled={actionLoading}>
                                          {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={cancelEdit}>
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </>
                                    ) : (
                                      <>
                                        <Button variant="outline" size="sm" onClick={()=>startEdit(member)}>
                                          <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={()=>deleteMember(member.id)} disabled={actionLoading}>
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })}
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
