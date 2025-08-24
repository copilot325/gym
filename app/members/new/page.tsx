"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useStore } from "@nanostores/react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { AppLayout } from "@/components/layout/app-layout"
import { isAuthenticatedStore } from "@/lib/stores/auth-store"
import { membershipTypesStore, dataActions } from "@/lib/stores/data-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

// Schema de validación para miembros
const memberSchema = z.object({
  firstName: z.string().min(1, "El nombre es requerido").min(2, "Mínimo 2 caracteres"),
  lastName: z.string().min(1, "El apellido es requerido").min(2, "Mínimo 2 caracteres"),
  age: z.coerce.number().min(1, "La edad debe ser mayor a 0").max(120, "La edad debe ser menor a 120"),
  phone: z.string().regex(/^[0-9]{8}$/, "El teléfono debe tener 8 dígitos (formato Guatemala)"),
  membershipTypeId: z.string().min(1, "Debe seleccionar un tipo de membresía"),
})

type MemberFormData = z.infer<typeof memberSchema>

export default function NewMemberPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const isAuthenticated = useStore(isAuthenticatedStore)
  const membershipTypes = useStore(membershipTypesStore)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
  })

  // Verificar autenticación
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  // Cargar tipos de membresía
  useEffect(() => {
    const loadMembershipTypes = async () => {
      try {
        const response = await fetch("/api/membership-types")
        if (response.ok) {
          const json = await response.json()
          const types = Array.isArray(json) ? json : json.items || []
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

  const onSubmit = async (data: MemberFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al crear el miembro")
      }

      const newMember = await response.json()
      
      // Añadir al store
      dataActions.addMember(newMember.member)
      
      // Mostrar toast de éxito
      toast.success("Miembro creado exitosamente")
      
      // Redirigir al perfil del miembro
      router.push(`/members/${newMember.member.id}`)
    } catch (err: any) {
      console.error("Error creating member:", err)
      setError(err.message || "Error al crear el miembro")
      toast.error(err.message || "Error al crear el miembro")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <AppLayout>
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
          <h1 className="text-2xl font-bold">Registrar Nuevo Miembro</h1>
          <p className="text-muted-foreground">
            Completa la información del nuevo miembro y su membresía inicial
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Información del Miembro</CardTitle>
          <CardDescription>
            Ingresa los datos personales del nuevo miembro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombres</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Juan Carlos"
                  {...register("firstName")}
                  disabled={isLoading}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Apellidos</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="García López"
                  {...register("lastName")}
                  disabled={isLoading}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Edad</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="25"
                  min="1"
                  max="120"
                  {...register("age")}
                  disabled={isLoading}
                />
                {errors.age && (
                  <p className="text-sm text-red-500">{errors.age.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="12345678"
                  maxLength={8}
                  {...register("phone")}
                  disabled={isLoading}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Formato de Guatemala: 8 dígitos
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="membershipType">Tipo de Membresía Inicial</Label>
              <Select
                onValueChange={(value) => setValue("membershipTypeId", value)}
                disabled={isLoading || membershipTypes.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo de membresía" />
                </SelectTrigger>
                <SelectContent>
                  {membershipTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name} - {type.daysGranted} días
                      {type.price > 0 && ` - Q${type.price}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.membershipTypeId && (
                <p className="text-sm text-red-500">{errors.membershipTypeId.message}</p>
              )}
              {membershipTypes.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Cargando tipos de membresía...
                </p>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard")}
                disabled={isLoading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading || membershipTypes.length === 0}
                className="flex-1"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Miembro
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
        </div>
      </AppLayout>
    </AuthGuard>
  )
}
