"use client"

import { useEffect, useState } from 'react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { z } from 'zod'

const formSchema = z.object({
  name: z.string().min(2),
  daysGranted: z.coerce.number().min(1),
  price: z.coerce.number().min(0).optional(),
  description: z.string().optional()
})

export default function MembershipTypesPage() {
  const [types, setTypes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', daysGranted: '', price: '', description: '' })
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/membership-types')
      if (!res.ok) throw new Error('Error cargando tipos')
      setTypes(await res.json())
    } catch (e:any) {
      toast.error(e.message || 'Error')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const parsed = formSchema.parse({
        name: form.name,
        daysGranted: form.daysGranted,
        price: form.price || 0,
        description: form.description || undefined,
      })
      setSubmitting(true)
      const res = await fetch('/api/membership-types',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(parsed)})
      if(!res.ok){ const er = await res.json().catch(()=>({})); throw new Error(er.error || 'Error creando tipo') }
      toast.success('Tipo creado')
      setForm({ name:'', daysGranted:'', price:'', description:'' })
      load()
    } catch(e:any) {
      if (e.errors) toast.error('Datos inválidos')
      else toast.error(e.message)
    } finally { setSubmitting(false) }
  }

  const toggle = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/membership-types?id=${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({isActive: !current})})
      if(!res.ok) throw new Error('Error actualizando')
      toast.success('Actualizado')
      load()
    } catch(e:any){ toast.error(e.message) }
  }

  return (
    <AuthGuard>
      <AppLayout>
        <div className="p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Crear Tipo de Membresía</CardTitle>
                <CardDescription>Defina nombre y duración en días</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={submit} className="grid md:grid-cols-4 gap-4">
                  <Input placeholder="Nombre (MENSUAL)" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value.toUpperCase()}))} />
                  <Input placeholder="Días" value={form.daysGranted} onChange={e=>setForm(f=>({...f,daysGranted:e.target.value}))} />
                  <Input placeholder="Precio" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} />
                  <Input placeholder="Descripción" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} />
                  <div className="md:col-span-4 flex justify-end">
                    <Button type="submit" disabled={submitting}>{submitting?'Guardando...':'Guardar'}</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tipos de Membresía</CardTitle>
                <CardDescription>Listado actual</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? <p>Cargando...</p> : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Días</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {types.map(t => (
                        <TableRow key={t.id}>
                          <TableCell>{t.name}</TableCell>
                          <TableCell>{t.daysGranted}</TableCell>
                          <TableCell>{t.price ?? 0}</TableCell>
                          <TableCell>{t.isActive ? <Badge>Activo</Badge> : <Badge variant="secondary">Inactivo</Badge>}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" onClick={()=>toggle(t.id,t.isActive)}>
                              {t.isActive? 'Desactivar':'Activar'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  )
}
