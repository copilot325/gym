import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-config'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  daysGranted: z.number().min(1).optional(),
  price: z.number().min(0).optional(),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
})

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    if (!session.user.emailVerified) return NextResponse.json({ error: 'Cuenta no verificada' }, { status: 403 })

    const body = await request.json()
    const data = updateSchema.parse(body)

    if (data.name) {
      const exists = await prisma.membershipType.findFirst({ where: { name: data.name.toUpperCase(), NOT: { id: params.id } } })
      if (exists) return NextResponse.json({ error: 'Nombre ya existe' }, { status: 400 })
    }

    const updated = await prisma.membershipType.update({
      where: { id: params.id },
      data: {
        ...data,
        name: data.name ? data.name.toUpperCase() : undefined,
      },
    })
    return NextResponse.json(updated)
  } catch (e: unknown) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: 'Datos inválidos', details: e.errors }, { status: 400 })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    if (!session.user.emailVerified) return NextResponse.json({ error: 'Cuenta no verificada' }, { status: 403 })

    // Evitar eliminar si tiene membresías asociadas
    const count = await prisma.userMembership.count({ where: { membershipTypeId: params.id } })
    if (count > 0) return NextResponse.json({ error: 'No se puede eliminar, tiene membresías asociadas' }, { status: 400 })

    await prisma.membershipType.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
