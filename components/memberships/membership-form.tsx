"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { dataService } from "@/lib/data-service"
import type { Member, MembershipType } from "@/lib/types"

interface MembershipFormProps {
  member: Member
  membershipTypes: MembershipType[]
  onSuccess: () => void
  onCancel: () => void
}

export function MembershipForm({ member, membershipTypes, onSuccess, onCancel }: MembershipFormProps) {
  const [selectedMembershipTypeId, setSelectedMembershipTypeId] = useState("")
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0])
  const [paymentStatus, setPaymentStatus] = useState<"PAID" | "PENDING">("PAID")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const selectedMembershipType = membershipTypes.find((mt) => mt.id === selectedMembershipTypeId)

  const calculateEndDate = () => {
    if (!selectedMembershipType || !startDate) return ""

    const start = new Date(startDate)
    const end = new Date(start)
    end.setDate(end.getDate() + selectedMembershipType.durationInDays)
    return end.toISOString().split("T")[0]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!selectedMembershipType) {
      setError("Selecciona un tipo de membresía")
      setIsLoading(false)
      return
    }

    try {
      const start = new Date(startDate)
      const end = new Date(start)
      end.setDate(end.getDate() + selectedMembershipType.durationInDays)

      await dataService.createUserMembership({
        memberId: member.id,
        membershipTypeId: selectedMembershipTypeId,
        startDate: start,
        endDate: end,
        status: "ACTIVE",
        paymentStatus,
      })

      onSuccess()
    } catch (err) {
      setError("Error al crear la membresía")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Nueva Membresía</CardTitle>
        <CardDescription>Asignar membresía a {member.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="membershipType">Tipo de Membresía *</Label>
            <Select value={selectedMembershipTypeId} onValueChange={setSelectedMembershipTypeId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo de membresía" />
              </SelectTrigger>
              <SelectContent>
                {membershipTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{type.name}</span>
                      <span className="text-sm text-muted-foreground">
                        ${type.price} - {type.durationInDays} días
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedMembershipType && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">{selectedMembershipType.name}</h4>
              <p className="text-sm text-muted-foreground mb-2">{selectedMembershipType.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Precio:</span>
                  <span className="ml-2 font-medium">${selectedMembershipType.price}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Duración:</span>
                  <span className="ml-2 font-medium">{selectedMembershipType.durationInDays} días</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha de Inicio *</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha de Vencimiento</Label>
              <Input id="endDate" type="date" value={calculateEndDate()} disabled className="bg-muted" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentStatus">Estado de Pago *</Label>
            <Select value={paymentStatus} onValueChange={(value: "PAID" | "PENDING") => setPaymentStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PAID">Pagado</SelectItem>
                <SelectItem value="PENDING">Pendiente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading || !selectedMembershipTypeId} className="flex-1">
              {isLoading ? "Creando..." : "Crear Membresía"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
