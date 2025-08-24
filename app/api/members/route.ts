import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-config"
import { z } from "zod"

// Schema de validación para miembros
const memberSchema = z.object({
  firstName: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().min(1, "El apellido es requerido"),
  age: z.number().min(1, "La edad debe ser mayor a 0").max(120, "La edad debe ser menor a 120"),
  phone: z.string().regex(/^[0-9]{8}$/, "El teléfono debe tener 8 dígitos (formato Guatemala)"),
})

const memberWithMembershipSchema = memberSchema.extend({
  membershipTypeId: z.string().min(1, "El tipo de membresía es requerido"),
})

// GET /api/members - Obtener todos los miembros
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const status = searchParams.get("status")
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "10")

    // Construir filtros
    const where: any = {}
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ]
    }

    // Recuperar TODOS los miembros que cumplen búsqueda (se optimiza posteriormente con paginación real por estado)
    // Justificación: el estado es computado y depende de la membresía más reciente + fecha actual.
    const membersAll = await prisma.member.findMany({
      where,
      include: {
        memberships: {
          include: { membershipType: true },
          orderBy: { createdAt: "desc" },
          take: 1, // Sólo necesitamos la última para el estado
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Calcular estado de cada miembro
    const membersWithStatus = membersAll.map((member: any) => {
      const latestMembership = member.memberships[0]
      if (!latestMembership) return { ...member, status: 'NO_MEMBERSHIP' as const, latestMembership: null }
      const isActive = latestMembership.isActive && new Date(latestMembership.expirationDate) > new Date()
      return { ...member, status: isActive ? 'ACTIVE' : 'INACTIVE', latestMembership }
    })

    let filtered = membersWithStatus
    if (status === 'ACTIVE') filtered = filtered.filter((m: any) => m.status === 'ACTIVE')
    else if (status === 'INACTIVE') filtered = filtered.filter((m: any) => m.status === 'INACTIVE')
    else if (status === 'NO_MEMBERSHIP') filtered = filtered.filter((m: any) => m.status === 'NO_MEMBERSHIP')

    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const start = (page - 1) * limit
    const pageItems = filtered.slice(start, start + limit)

    return NextResponse.json({
      members: pageItems,
      total,
      page,
      limit,
      totalPages,
    })
  } catch (error) {
    console.error("Error fetching members:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// POST /api/members - Crear nuevo miembro
export async function POST(request: NextRequest) {
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
    const validatedData = memberWithMembershipSchema.parse(body)

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

    // Verificar que el teléfono no esté duplicado
    const existingMember = await prisma.member.findUnique({
      where: { phone: validatedData.phone },
    })

    if (existingMember) {
      return NextResponse.json(
        { error: "Ya existe un miembro con este número de teléfono" },
        { status: 400 }
      )
    }

    // Crear miembro y membresía en una transacción
  const result = await prisma.$transaction(async (tx: any) => {
      // Crear miembro
      const member = await tx.member.create({
        data: {
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          age: validatedData.age,
          phone: validatedData.phone,
          creatorId: session.user.id,
        },
      })

      // Calcular fecha de expiración
      const acquisitionDate = new Date()
      const expirationDate = new Date(acquisitionDate)
      expirationDate.setDate(expirationDate.getDate() + membershipType.daysGranted)

      // Crear membresía inicial
      const membership = await tx.userMembership.create({
        data: {
          memberId: member.id,
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
        where: { id: member.id },
        data: { lastRenewalDate: acquisitionDate },
      })

      return { member, membership }
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos de entrada inválidos", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error creating member:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
