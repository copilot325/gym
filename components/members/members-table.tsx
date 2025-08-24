"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Eye, Edit } from "lucide-react"
import type { Member } from "@/lib/types"
import { dataService, type MembersApiResponse } from "@/lib/data-service"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"

interface MembersTableProps { 
  onAddMember: () => void
  onViewMember?: (member: Member) => void
  onEditMember?: (member: Member) => void
}

export function MembersTable({ onAddMember, onViewMember, onEditMember }: MembersTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [status, setStatus] = useState<string>("ALL")
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [data, setData] = useState<MembersApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const queryStatus = status === 'ALL' ? undefined : status as any
      const res = await dataService.getMembers({ search: searchTerm || undefined, status: queryStatus, page, limit })
      setData(res)
    } catch (e: any) {
      setError(e.message || 'Error cargando miembros')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status])

  const onSearch = () => { setPage(1); load() }

  const getStatusBadge = (member: any) => {
    const st = member.status as string
    const variant = st === 'ACTIVE' ? 'default' : st === 'INACTIVE' ? 'destructive' : 'secondary'
    const label = st === 'ACTIVE' ? 'Activo' : st === 'INACTIVE' ? 'Inactivo' : 'Sin Membresía'
    return <Badge variant={variant} className="text-xs">{label}</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Gestión de Miembros</CardTitle>
            <CardDescription>Administra todos los miembros del gimnasio</CardDescription>
          </div>
          <Button onClick={onAddMember} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Miembro
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-end">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre, apellido o teléfono..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <Select value={status} onValueChange={(v: string)=>{ setStatus(v); setPage(1) }}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="ACTIVE">Activos</SelectItem>
                <SelectItem value="INACTIVE">Inactivos</SelectItem>
                <SelectItem value="NO_MEMBERSHIP">Sin Membresía</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={onSearch} disabled={loading}>Filtrar</Button>
        </div>

        {error && <div className="text-sm text-red-600 mb-4">{error}</div>}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Primera Inscripción</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">Cargando...</TableCell>
                </TableRow>
              ) : data && data.members.length > 0 ? (
                data.members.map((member: any) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.firstName} {member.lastName}</TableCell>
                    <TableCell>{member.phone}</TableCell>
                    <TableCell>{getStatusBadge(member)}</TableCell>
                    <TableCell>{new Date(member.firstEnrollmentDate).toLocaleDateString('es-ES')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={()=> onViewMember ? onViewMember(member as Member) : (window.location.href = `/members/${member.id}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {onEditMember && (
                          <Button variant="ghost" size="sm" onClick={()=> onEditMember(member as Member)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No se encontraron miembros
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {data && data.pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-between items-center text-sm text-muted-foreground">
            <span>
              Página {data.pagination.page} de {data.pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page===1 || loading} onClick={()=>setPage(p=>p-1)}>Anterior</Button>
              <Button variant="outline" size="sm" disabled={data.pagination.page===data.pagination.totalPages || loading} onClick={()=>setPage(p=>p+1)}>Siguiente</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
