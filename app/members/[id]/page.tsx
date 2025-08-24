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
import { Loader2, ArrowLeft, User, Phone, Calendar, RefreshCw, Pencil, Trash2, Save } from "lucide-react"
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
  status: 'ACTIVE' | 'INACTIVE' | 'NO_MEMBERSHIP'
  latestMembership?: any
  memberships: any[]
}

export default function MemberProfilePage({ params }: { params: { id: string } }) {
  const [member, setMember] = useState<Member | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRenewing, setIsRenewing] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', age: '', phone: '' })
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

  // Toggle edit mode and preload form
  const startEdit = () => {
    if (!member) return
    setEditForm({
      firstName: member.firstName,
      lastName: member.lastName,
      age: String(member.age),
      phone: member.phone,
    })
    setIsEditing(true)
  }

  const saveEdit = async () => {
    if (!member) return
    setIsSavingEdit(true)
    try {
      // Basic validation client-side
      if (!editForm.firstName.trim() || !editForm.lastName.trim()) throw new Error('Nombre y apellido requeridos')
      const ageNum = Number(editForm.age)
      if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) throw new Error('Edad inválida (1-120)')
      if (!/^\d{8}$/.test(editForm.phone)) throw new Error('Teléfono debe tener 8 dígitos')

      const payload: any = {}
      if (editForm.firstName !== member.firstName) payload.firstName = editForm.firstName.trim()
      if (editForm.lastName !== member.lastName) payload.lastName = editForm.lastName.trim()
      if (ageNum !== member.age) payload.age = ageNum
      if (editForm.phone !== member.phone) payload.phone = editForm.phone
      if (Object.keys(payload).length === 0) {
        toast.info('Sin cambios para guardar')
        setIsEditing(false)
        return
      }
      const res = await fetch(`/api/members/${member.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) {
        const er = await res.json().catch(()=>({}))
        throw new Error(er.error || 'Error guardando cambios')
      }
      const updated = await res.json()
      setMember((prev) => prev ? { ...prev, ...updated } : prev)
      toast.success('Miembro actualizado')
      setIsEditing(false)
    } catch (e: any) {
      toast.error(e.message || 'Error actualizando')
    } finally {
      setIsSavingEdit(false)
    }
  }

  const cancelEdit = () => {
    setIsEditing(false)
  }

  const deleteMember = async () => {
    if (!member) return
    if (!confirm('¿Eliminar este miembro? Esta acción es irreversible y eliminará su historial.')) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/members/${member.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const er = await res.json().catch(()=>({}))
        throw new Error(er.error || 'Error eliminando miembro')
      }
      toast.success('Miembro eliminado')
      router.push('/members')
    } catch (e: any) {
      toast.error(e.message || 'Error eliminando')
    } finally {
      setDeleteLoading(false)
    }
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
        <div className="flex-1">
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <Input value={editForm.firstName} onChange={e=>setEditForm(f=>({...f, firstName: e.target.value}))} placeholder="Nombres" />
              <Input value={editForm.lastName} onChange={e=>setEditForm(f=>({...f, lastName: e.target.value}))} placeholder="Apellidos" />
              <Input type="number" value={editForm.age} onChange={e=>setEditForm(f=>({...f, age: e.target.value}))} placeholder="Edad" />
              <Input value={editForm.phone} onChange={e=>setEditForm(f=>({...f, phone: e.target.value.replace(/[^0-9]/g,'')}))} maxLength={8} placeholder="Teléfono" />
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold">{member.firstName} {member.lastName}</h1>
              <p className="text-muted-foreground">Perfil del miembro</p>
            </>
          )}
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={cancelEdit} disabled={isSavingEdit}>Cancelar</Button>
              <Button size="sm" onClick={saveEdit} disabled={isSavingEdit}>
                {isSavingEdit && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                <Save className="h-4 w-4 mr-1" /> Guardar
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={startEdit}>
                <Pencil className="h-4 w-4 mr-1" /> Editar
              </Button>
              <Button variant="destructive" size="sm" onClick={deleteMember} disabled={deleteLoading}>
                {deleteLoading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                <Trash2 className="h-4 w-4 mr-1" /> Eliminar
              </Button>
            </>
          )}
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
              {member.lastRenewalDate && (
                <div>
                  <p className="text-sm text-muted-foreground">Última Renovación</p>
                  <p className="font-medium">{formatDate(member.lastRenewalDate)}</p>
                </div>
              )}
              {member.latestMembership && (
                <div>
                  <p className="text-sm text-muted-foreground">Vence</p>
                  <p className="font-medium">{formatDate(member.latestMembership.expirationDate)}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <Badge variant={member.status === 'ACTIVE' ? 'default' : member.status === 'INACTIVE' ? 'destructive' : 'secondary'}>
                  {member.status === 'ACTIVE' ? 'Activo' : member.status === 'INACTIVE' ? 'Inactivo' : 'Sin Membresía'}
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
