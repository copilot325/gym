"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useStore } from "@nanostores/react"
import { isAuthenticatedStore } from "@/lib/stores/auth-store"
import { membershipTypesStore, dataActions } from "@/lib/stores/data-store"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft, User, Phone, Calendar, RefreshCw } from "lucide-react"
import { toast } from "sonner"

// Schema de validación para renovación
const renewalSchema = z.object({
  membershipTypeId: z.string().min(1, "Debe seleccionar un tipo de membresía"),
})

type RenewalFormData = z.infer<typeof renewalSchema>

interface Member {
  id: string
  firstName: string
  lastName: string
  age: number
  phone: string
  firstEnrollmentDate: string
  lastRenewalDate?: string | null
  status: "ACTIVE" | "INACTIVE"
  latestMembership?: any
  memberships: any[]
}

export default function MemberProfilePage({ params }: { params: { id: string } }) {
  const [member, setMember] = useState<Member | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRenewing, setIsRenewing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const isAuthenticated = useStore(isAuthenticatedStore)
  const membershipTypes = useStore(membershipTypesStore)

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RenewalFormData>({
    resolver: zodResolver(renewalSchema),
  })

  // Verificar autenticación
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  // Cargar datos del miembro
  useEffect(() => {
    const loadMember = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/members/${params.id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Miembro no encontrado")
          }
          throw new Error("Error al cargar el miembro")
        }

        const memberData = await response.json()
        setMember(memberData)
      } catch (err: any) {
        console.error("Error loading member:", err)
        setError(err.message || "Error al cargar el miembro")
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      loadMember()
    }
  }, [params.id])

  // Cargar tipos de membresía
  useEffect(() => {
    const loadMembershipTypes = async () => {
      try {
        const response = await fetch("/api/membership-types")
        if (response.ok) {
          const types = await response.json()
          dataActions.setMembershipTypes(types)
        }
      } catch (error) {
        console.error("Error loading membership types:", error)
      }
    }

    if (membershipTypes.length === 0) {
      loadMembershipTypes()
    }
  }, [membershipTypes.length])

  const onRenewal = async (data: RenewalFormData) => {
    setIsRenewing(true)

    try {
      const response = await fetch(`/api/members/${params.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al renovar la membresía")
      }

      const newMembership = await response.json()
      
      // Recargar datos del miembro
      const memberResponse = await fetch(`/api/members/${params.id}`)
      if (memberResponse.ok) {
        const updatedMember = await memberResponse.json()
        setMember(updatedMember)
      }
      
      toast.success("Membresía renovada exitosamente")
      
      // Limpiar el formulario
      setValue("membershipTypeId", "")
    } catch (err: any) {
      console.error("Error renewing membership:", err)
      toast.error(err.message || "Error al renovar la membresía")
    } finally {
      setIsRenewing(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const isExpiringSoon = (expirationDate: string) => {
    const expDate = new Date(expirationDate)
    const today = new Date()
    const daysUntilExpiration = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiration <= 7 && daysUntilExpiration > 0
  }

  if (!isAuthenticated || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !member) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertDescription>{error || "Miembro no encontrado"}</AlertDescription>
        </Alert>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard")}
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {member.firstName} {member.lastName}
          </h1>
          <p className="text-muted-foreground">
            Perfil del miembro
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del Miembro */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nombres</p>
                <p className="font-medium">{member.firstName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Apellidos</p>
                <p className="font-medium">{member.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Edad</p>
                <p className="font-medium">{member.age} años</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium">{member.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Primera Inscripción</p>
                  <p className="font-medium">{formatDate(member.firstEnrollmentDate)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <Badge variant={member.status === "ACTIVE" ? "default" : "destructive"}>
                  {member.status === "ACTIVE" ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Renovación de Membresía */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Renovar Membresía
            </CardTitle>
            <CardDescription>
              Selecciona un nuevo tipo de membresía
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onRenewal)} className="space-y-4">
              <div className="space-y-2">
                <Select
                  onValueChange={(value) => setValue("membershipTypeId", value)}
                  disabled={isRenewing || membershipTypes.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona membresía" />
                  </SelectTrigger>
                  <SelectContent>
                    {membershipTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name} - {type.daysGranted} días
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.membershipTypeId && (
                  <p className="text-sm text-red-500">{errors.membershipTypeId.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isRenewing || membershipTypes.length === 0}
                className="w-full"
              >
                {isRenewing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar Renovación
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Historial de Membresías */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Membresías</CardTitle>
          <CardDescription>
            Registro completo de todas las membresías del miembro
          </CardDescription>
        </CardHeader>
        <CardContent>
          {member.memberships && member.memberships.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fecha de Adquisición</TableHead>
                  <TableHead>Fecha de Expiración</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {member.memberships.map((membership, index) => {
                  const isActive = membership.isActive && new Date(membership.expirationDate) > new Date()
                  const expiringSoon = isActive && isExpiringSoon(membership.expirationDate)
                  
                  return (
                    <TableRow key={membership.id}>
                      <TableCell className="font-medium">
                        {membership.membershipType?.name || "N/A"}
                      </TableCell>
                      <TableCell>{formatDate(membership.acquisitionDate)}</TableCell>
                      <TableCell>{formatDate(membership.expirationDate)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            isActive 
                              ? expiringSoon 
                                ? "outline" 
                                : "default"
                              : "destructive"
                          }
                        >
                          {isActive 
                            ? expiringSoon 
                              ? "Por Expirar" 
                              : "Activa"
                            : "Expirada"
                          }
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No hay historial de membresías disponible
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
