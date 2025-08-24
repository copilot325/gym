"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { dataService } from "@/lib/data-service"
import type { Member } from "@/lib/types"

interface MemberFormProps {
  member?: Member
  onSuccess: () => void
  onCancel: () => void
}

export function MemberForm({ member, onSuccess, onCancel }: MemberFormProps) {
  const [formData, setFormData] = useState({
    name: member?.name || "",
    email: member?.email || "",
    phone: member?.phone || "",
    dateOfBirth: member?.dateOfBirth ? new Date(member.dateOfBirth).toISOString().split("T")[0] : "",
    emergencyContact: member?.emergencyContact || "",
    emergencyPhone: member?.emergencyPhone || "",
    medicalConditions: member?.medicalConditions || "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const memberData = {
        ...formData,
        dateOfBirth: new Date(formData.dateOfBirth),
      }

      if (member) {
        await dataService.updateMember(member.id, memberData)
      } else {
        await dataService.createMember(memberData)
      }

      onSuccess()
    } catch (err) {
      setError("Error al guardar el miembro")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{member ? "Editar Miembro" : "Nuevo Miembro"}</CardTitle>
        <CardDescription>
          {member ? "Actualiza la información del miembro" : "Registra un nuevo miembro en el gimnasio"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Juan Pérez"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="juan@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+1234567890"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Fecha de Nacimiento *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Contacto de Emergencia *</Label>
              <Input
                id="emergencyContact"
                value={formData.emergencyContact}
                onChange={(e) => handleChange("emergencyContact", e.target.value)}
                placeholder="María Pérez"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Teléfono de Emergencia *</Label>
              <Input
                id="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={(e) => handleChange("emergencyPhone", e.target.value)}
                placeholder="+1234567891"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicalConditions">Condiciones Médicas</Label>
            <Textarea
              id="medicalConditions"
              value={formData.medicalConditions}
              onChange={(e) => handleChange("medicalConditions", e.target.value)}
              placeholder="Describe cualquier condición médica relevante (opcional)"
              rows={3}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Guardando..." : member ? "Actualizar" : "Crear Miembro"}
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
