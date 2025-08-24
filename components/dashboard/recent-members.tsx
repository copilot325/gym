"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Eye } from "lucide-react"
import type { Member } from "@/lib/types"

interface RecentMembersProps {
  members: Member[]
}

export function RecentMembers({ members }: RecentMembersProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  // Now this component expects already limited recent members (e.g., first 5).

  const getStatusBadge = (member: Member) => {
    const status = member.status || 'NO_MEMBERSHIP'
    const variant = status === 'ACTIVE' ? 'default' : status === 'INACTIVE' ? 'destructive' : 'secondary'
    const label = status === 'ACTIVE' ? 'Activo' : status === 'INACTIVE' ? 'Inactivo' : 'Sin Membresía'
    return <Badge variant={variant} className="text-xs">{label}</Badge>
  }

  const filteredMembers = useMemo(() => {
  let filtered = members

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter((member) => {
        const searchText = searchTerm.toLowerCase()
        return (
          member.firstName.toLowerCase().includes(searchText) ||
          member.lastName.toLowerCase().includes(searchText) ||
          member.phone.includes(searchText)
        )
      })
    }

    // Filtro por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter((member) => {
  const status = member.status
  if (statusFilter === "active") return status === "ACTIVE"
  if (statusFilter === "inactive") return status === "INACTIVE"
        return true
      })
    }

    return filtered
  }, [members, searchTerm, statusFilter])

  const displayed = filteredMembers

  return (
    <Card>
      <CardHeader>
        <CardTitle>Listado de Miembros</CardTitle>
        <CardDescription>
          Gestiona y visualiza todos los miembros del gimnasio
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre, apellido o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

  {/* Tabla */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha de Registro</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayed.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No se encontraron miembros
                  </TableCell>
                </TableRow>
              ) : (
                displayed.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {member.firstName} {member.lastName}
                    </TableCell>
                    <TableCell>{member.phone}</TableCell>
                    <TableCell>{getStatusBadge(member)}</TableCell>
                    <TableCell>
                      {new Date(member.firstEnrollmentDate).toLocaleDateString("es-ES")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/members/${member.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Perfil
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

  {/* Paginación removida (lista ya es limitada desde el API/dashboard) */}
      </CardContent>
    </Card>
  )
}
