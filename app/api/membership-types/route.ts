import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-config"
import { z } from "zod"

// GET /api/membership-types - Obtener todos los tipos de membresía
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

    const membershipTypes = await prisma.membershipType.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        daysGranted: "asc",
      },
    })

    return NextResponse.json(membershipTypes)
  } catch (error) {
    console.error("Error fetching membership types:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

const membershipTypeSchema = z.object({
  name: z.string().min(2),
  daysGranted: z.number().min(1),
  price: z.number().min(0).optional().default(0),
  description: z.string().optional(),
})

// POST /api/membership-types - crear nuevo tipo
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  if (!session.user.emailVerified) return NextResponse.json({ error: 'Cuenta no verificada' }, { status: 403 })

    const body = await request.json()
    const data = membershipTypeSchema.parse(body)

    const exists = await prisma.membershipType.findUnique({ where: { name: data.name } })
    if (exists) return NextResponse.json({ error: "Nombre ya existe" }, { status: 400 })

    const created = await prisma.membershipType.create({
      data: {
        name: data.name.toUpperCase(),
        daysGranted: data.daysGranted,
        price: data.price ?? 0,
        description: data.description,
        creatorId: session.user.id,
      },
    })
    return NextResponse.json(created, { status: 201 })
  } catch (e: any) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: "Datos inválidos", details: e.errors }, { status: 400 })
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

// PATCH /api/membership-types?id=ID - desactivar/activar
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  if (!session.user.emailVerified) return NextResponse.json({ error: 'Cuenta no verificada' }, { status: 403 })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 })
    const body = await request.json().catch(() => ({}))
    const isActive = body?.isActive as boolean | undefined
    if (typeof isActive !== "boolean") return NextResponse.json({ error: "Falta isActive" }, { status: 400 })
    const updated = await prisma.membershipType.update({ where: { id }, data: { isActive } })
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
