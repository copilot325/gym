"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, AlertTriangle } from "lucide-react"
import type { UserMembership, Member } from "@/lib/types"

interface MembershipsTableProps {
  memberships: UserMembership[]
  members: Member[]
  onAddMembership: (member: Member) => void
  onViewMembership: (membership: UserMembership) => void
}

export function MembershipsTable({ memberships, members, onAddMembership, onViewMembership }: MembershipsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredMemberships = memberships.filter((membership) => {
    const matchesSearch =
      membership.member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      membership.membershipType.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || membership.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const variants = {
      ACTIVE: "default",
      EXPIRED: "destructive",
      CANCELLED: "secondary",
    } as const

    const labels = {
      ACTIVE: "Activo",
      EXPIRED: "Vencido",
      CANCELLED: "Cancelado",
    }

    return (
      <Badge variant={variants[status as keyof typeof variants]} className="text-xs">
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  const getPaymentStatusBadge = (status: string) => {
    const variants = {
      PAID: "default",
      PENDING: "secondary",
      OVERDUE: "destructive",
    } as const

    const labels = {
      PAID: "Pagado",
      PENDING: "Pendiente",
      OVERDUE: "Vencido",
    }

    return (
      <Badge variant={variants[status as keyof typeof variants]} className="text-xs">
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  const isExpiringSoon = (endDate: Date) => {
    const today = new Date()
    const end = new Date(endDate)
    const daysUntilExpiry = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0
  }

  const membersWithoutActiveMembership = members.filter(
    (member) => !memberships.some((m) => m.memberId === member.id && m.status === "ACTIVE"),
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Gestión de Membresías</CardTitle>
            <CardDescription>Administra todas las membresías del gimnasio</CardDescription>
          </div>
          <Select
            onValueChange={(memberId) => {
              const member = members.find((m) => m.id === memberId)
              if (member) onAddMembership(member)
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Asignar Membresía" />
            </SelectTrigger>
            <SelectContent>
              {membersWithoutActiveMembership.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por miembro o tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="ACTIVE">Activos</SelectItem>
              <SelectItem value="EXPIRED">Vencidos</SelectItem>
              <SelectItem value="CANCELLED">Cancelados</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-sm text-muted-foreground">
            {filteredMemberships.length} de {memberships.length} membresías
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Miembro</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Inicio</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Pago</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMemberships.map((membership) => (
                <TableRow key={membership.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {membership.status === "ACTIVE" && isExpiringSoon(membership.endDate) && (
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                      )}
                      {membership.member.name}
                    </div>
                  </TableCell>
                  <TableCell>{membership.membershipType.name}</TableCell>
                  <TableCell>{new Date(membership.startDate).toLocaleDateString("es-ES")}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {new Date(membership.endDate).toLocaleDateString("es-ES")}
                      {membership.status === "ACTIVE" && isExpiringSoon(membership.endDate) && (
                        <Badge variant="outline" className="text-xs text-orange-600">
                          Próximo a vencer
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(membership.status)}</TableCell>
                  <TableCell>{getPaymentStatusBadge(membership.paymentStatus)}</TableCell>
                  <TableCell>${membership.membershipType.price}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => onViewMembership(membership)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredMemberships.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm || statusFilter !== "all"
              ? "No se encontraron membresías que coincidan con los filtros"
              : "No hay membresías registradas"}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
