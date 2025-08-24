"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Phone, Calendar } from "lucide-react"
import type { Member } from "@/lib/types"

interface MemberProfileProps {
  member: Member
  onEdit: () => void
  onClose: () => void
}

export function MemberProfile({ member, onEdit, onClose }: MemberProfileProps) {
  const getStatusBadge = () => {
    const status = member.status || 'NO_MEMBERSHIP'
    const variant = status === 'ACTIVE' ? 'default' : status === 'INACTIVE' ? 'destructive' : 'secondary'
    const label = status === 'ACTIVE' ? 'Activo' : status === 'INACTIVE' ? 'Inactivo' : 'Sin Membresía'
    return <Badge variant={variant} className="text-sm">{label}</Badge>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{member.firstName} {member.lastName}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <span>Miembro desde {new Date(member.createdAt).toLocaleDateString("es-ES")}</span>
                  {getStatusBadge()}
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={onEdit}>Editar</Button>
              <Button variant="outline" onClick={onClose}>
                Cerrar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Teléfono</p>
                <p className="font-medium">{member.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Primera Inscripción</p>
                <p className="font-medium">{new Date(member.firstEnrollmentDate).toLocaleDateString('es-ES')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
