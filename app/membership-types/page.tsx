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
  const [stats, setStats] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', daysGranted: '', price: '', description: '' })
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
  const res = await fetch('/api/membership-types?all=1')
      if (!res.ok) throw new Error('Error cargando tipos')
  const json = await res.json()
  setTypes(json.items || [])
  setStats(json.stats)
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

  const updateField = async (id: string, field: string, value: string) => {
    try {
      if (!value.trim()) return
      const body: any = {}
      if (field === 'name') body.name = value
      if (field === 'daysGranted') body.daysGranted = Number(value)
      if (field === 'price') body.price = Number(value)
      const res = await fetch(`/api/membership-types/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
      if (!res.ok) throw new Error('Error guardando')
      toast.success('Guardado')
      load()
    } catch (e:any) { toast.error(e.message) }
  }

  const remove = async (id: string) => {
    if (!confirm('¿Eliminar tipo? Solo se permite si no tiene membresías asociadas.')) return
    try {
      const res = await fetch(`/api/membership-types/${id}`, { method: 'DELETE' })
      if (!res.ok) { const er = await res.json().catch(()=>({})); throw new Error(er.error || 'Error eliminando') }
      toast.success('Eliminado')
      load()
    } catch (e:any) { toast.error(e.message) }
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
                <CardDescription>Listado actual (activos e inactivos)</CardDescription>
              </CardHeader>
              <CardContent>
                {stats && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 text-sm">
                    <div className="p-2 rounded border"><span className="font-semibold">Total:</span> {stats.total}</div>
                    <div className="p-2 rounded border"><span className="font-semibold">Activos:</span> {stats.active}</div>
                    <div className="p-2 rounded border"><span className="font-semibold">Inactivos:</span> {stats.inactive}</div>
                    <div className="p-2 rounded border"><span className="font-semibold">Promedio Q:</span> {stats.avgPrice}</div>
                    <div className="p-2 rounded border col-span-2 md:col-span-1"><span className="font-semibold">Rango Q:</span> {stats.minPrice} - {stats.maxPrice}</div>
                  </div>
                )}
                {loading ? <p>Cargando...</p> : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Días</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Membresías</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {types.map(t => (
                        <TableRow key={t.id} className={!t.isActive ? 'opacity-70' : ''}>
                          <TableCell>
                            <input
                              defaultValue={t.name}
                              className="bg-transparent border border-transparent hover:border-muted rounded px-2 py-1 text-sm w-28"
                              onBlur={(e)=> e.target.value !== t.name && updateField(t.id,'name', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <input
                              type="number"
                              defaultValue={t.daysGranted}
                              className="bg-transparent border border-transparent hover:border-muted rounded px-2 py-1 text-sm w-20"
                              onBlur={(e)=> Number(e.target.value) !== t.daysGranted && updateField(t.id,'daysGranted', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <input
                              type="number"
                              defaultValue={t.price ?? 0}
                              className="bg-transparent border border-transparent hover:border-muted rounded px-2 py-1 text-sm w-24"
                              onBlur={(e)=> Number(e.target.value) !== (t.price ?? 0) && updateField(t.id,'price', e.target.value)}
                            />
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{t._count?.userMemberships ?? 0}</TableCell>
                          <TableCell>{t.isActive ? <Badge>Activo</Badge> : <Badge variant="secondary">Inactivo</Badge>}</TableCell>
                          <TableCell className="space-x-2 text-right">
                            <Button variant="outline" size="sm" onClick={()=>toggle(t.id,t.isActive)}>
                              {t.isActive? 'Desactivar':'Activar'}
                            </Button>
                            <Button variant="destructive" size="sm" onClick={()=>remove(t.id)} disabled={(t._count?.userMemberships ?? 0) > 0}>Eliminar</Button>
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
