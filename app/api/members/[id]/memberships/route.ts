import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth-config"
import { prisma } from "@/lib/prisma"

// GET /api/members/[id]/memberships - historial de membresías
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  if (!session.user.emailVerified) return NextResponse.json({ error: 'Cuenta no verificada' }, { status: 403 })

    const memberships = await prisma.userMembership.findMany({
      where: { memberId: params.id },
      orderBy: { acquisitionDate: "desc" },
      include: { membershipType: true, creator: { select: { id: true, email: true } } },
    })

    return NextResponse.json(memberships)
  } catch (e) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
