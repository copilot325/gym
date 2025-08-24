import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-config"
import { z } from "zod"

// Schema de validación para renovación de membresía
const renewMembershipSchema = z.object({
  membershipTypeId: z.string().min(1, "El tipo de membresía es requerido"),
})

const updateMemberSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  age: z.number().min(1).max(120).optional(),
  phone: z.string().regex(/^[0-9]{8}$/).optional(),
})

// GET /api/members/[id] - Obtener miembro por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    if (!session.user.emailVerified) {
      return NextResponse.json({ error: 'Cuenta no verificada' }, { status: 403 })
    }

    const member = await prisma.member.findUnique({
      where: { id: params.id },
      include: {
        memberships: {
          include: {
            membershipType: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!member) {
      return NextResponse.json(
        { error: "Miembro no encontrado" },
        { status: 404 }
      )
    }

    // Calcular estado actual
    const latestMembership = member.memberships[0]
    const isActive = latestMembership && 
                    latestMembership.isActive && 
                    new Date(latestMembership.expirationDate) > new Date()

    const memberWithStatus = {
      ...member,
      status: isActive ? "ACTIVE" : "INACTIVE",
      latestMembership,
    }

    return NextResponse.json(memberWithStatus)
  } catch (error) {
    console.error("Error fetching member:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// POST /api/members/[id] - Renovar membresía
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    if (!session.user.emailVerified) {
      return NextResponse.json({ error: 'Cuenta no verificada' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = renewMembershipSchema.parse(body)

    // Verificar que el miembro existe
    const member = await prisma.member.findUnique({
      where: { id: params.id },
    })

    if (!member) {
      return NextResponse.json(
        { error: "Miembro no encontrado" },
        { status: 404 }
      )
    }

    // Verificar que el tipo de membresía existe
    const membershipType = await prisma.membershipType.findUnique({
      where: { id: validatedData.membershipTypeId },
    })

    if (!membershipType) {
      return NextResponse.json(
        { error: "Tipo de membresía no encontrado" },
        { status: 404 }
      )
    }

    // Crear nueva membresía en una transacción
  const result = await prisma.$transaction(async (tx: any) => {
      // Calcular fecha de expiración
      const acquisitionDate = new Date()
      const expirationDate = new Date(acquisitionDate)
      expirationDate.setDate(expirationDate.getDate() + membershipType.daysGranted)

      // Crear nueva membresía
      const membership = await tx.userMembership.create({
        data: {
          memberId: params.id,
          membershipTypeId: validatedData.membershipTypeId,
          acquisitionDate,
          expirationDate,
          creatorId: session.user.id,
        },
        include: {
          membershipType: true,
        },
      })

      // Actualizar lastRenewalDate del miembro
      await tx.member.update({
        where: { id: params.id },
        data: { lastRenewalDate: acquisitionDate },
      })

      return membership
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos de entrada inválidos", details: (error as z.ZodError).errors },
        { status: 400 }
      )
    }

    console.error("Error renewing membership:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// PATCH /api/members/[id] - Actualizar datos del miembro
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  if (!session.user.emailVerified) return NextResponse.json({ error: 'Cuenta no verificada' }, { status: 403 })

    const body = await request.json()
    const data = updateMemberSchema.parse(body)

    if (Object.keys(data).length === 0) return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 })

    if (data.phone) {
      const exists = await prisma.member.findUnique({ where: { phone: data.phone } })
      if (exists && exists.id !== params.id) return NextResponse.json({ error: 'Teléfono ya registrado' }, { status: 400 })
    }

    const updated = await prisma.member.update({ where: { id: params.id }, data })
    return NextResponse.json(updated)
  } catch (e: unknown) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: 'Datos inválidos', details: (e as z.ZodError).errors }, { status: 400 })
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE /api/members/[id] - Eliminar miembro (hard delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  if (!session.user.emailVerified) return NextResponse.json({ error: 'Cuenta no verificada' }, { status: 403 })

    await prisma.userMembership.deleteMany({ where: { memberId: params.id } })
    await prisma.member.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
