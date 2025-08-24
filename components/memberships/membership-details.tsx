"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Calendar, DollarSign, CreditCard, Clock } from "lucide-react"
import type { UserMembership } from "@/lib/types"

interface MembershipDetailsProps {
  membership: UserMembership
  onClose: () => void
}

export function MembershipDetails({ membership, onClose }: MembershipDetailsProps) {
  const getDaysRemaining = () => {
    const today = new Date()
    const endDate = new Date(membership.endDate)
    const diffTime = endDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getStatusBadge = () => {
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
      <Badge variant={variants[membership.status as keyof typeof variants]} className="text-sm">
        {labels[membership.status as keyof typeof labels]}
      </Badge>
    )
  }

  const getPaymentStatusBadge = () => {
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
      <Badge variant={variants[membership.paymentStatus as keyof typeof variants]} className="text-sm">
        {labels[membership.paymentStatus as keyof typeof labels]}
      </Badge>
    )
  }

  const daysRemaining = getDaysRemaining()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">Detalles de Membresía</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <span>
                  {membership.membershipType.name} - {membership.member.name}
                </span>
                {getStatusBadge()}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Member Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información del Miembro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Nombre</p>
              <p className="font-medium">{membership.member.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{membership.member.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Teléfono</p>
              <p className="font-medium">{membership.member.phone}</p>
            </div>
          </CardContent>
        </Card>

        {/* Membership Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Información de Membresía
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Tipo</p>
              <p className="font-medium">{membership.membershipType.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Descripción</p>
              <p className="font-medium">{membership.membershipType.description}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duración</p>
              <p className="font-medium">{membership.membershipType.durationInDays} días</p>
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Fechas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Fecha de Inicio</p>
              <p className="font-medium">{new Date(membership.startDate).toLocaleDateString("es-ES")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha de Vencimiento</p>
              <p className="font-medium">{new Date(membership.endDate).toLocaleDateString("es-ES")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Registrado</p>
              <p className="font-medium">{new Date(membership.createdAt).toLocaleDateString("es-ES")}</p>
            </div>
          </CardContent>
        </Card>

        {/* Payment & Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pago y Estado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Precio</p>
              <p className="font-medium text-lg">${membership.membershipType.price}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estado de Pago</p>
              <div className="mt-1">{getPaymentStatusBadge()}</div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estado de Membresía</p>
              <div className="mt-1">{getStatusBadge()}</div>
            </div>
          </CardContent>
        </Card>

        {/* Time Remaining */}
        {membership.status === "ACTIVE" && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Tiempo Restante
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{daysRemaining > 0 ? `${daysRemaining} días` : "Vencida"}</p>
                  <p className="text-muted-foreground">
                    {daysRemaining > 0
                      ? daysRemaining <= 7
                        ? "⚠️ Próxima a vencer"
                        : "Tiempo restante"
                      : "Esta membresía ha vencido"}
                  </p>
                </div>
                {daysRemaining <= 7 && daysRemaining > 0 && (
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    Renovación requerida
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
