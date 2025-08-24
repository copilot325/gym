import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seeding de la base de datos...')

  // Crear usuario administrador
  const hashedPassword = await bcrypt.hash('Admin123!', 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@bodystrong.com' },
    update: {},
    create: {
      email: 'admin@bodystrong.com',
      hashedPassword,
      emailVerified: true,
      name: 'Administrador',
    },
  })

  console.log('✅ Usuario administrador creado:', adminUser.email)

  // Crear tipos de membresía
  const membershipTypes = [
    {
      name: 'DIARIA',
      daysGranted: 1,
      price: 15.0,
      description: 'Acceso por un día al gimnasio',
    },
    {
      name: 'SEMANAL',
      daysGranted: 7,
      price: 85.0,
      description: 'Acceso por una semana al gimnasio',
    },
    {
      name: 'QUINCENAL',
      daysGranted: 15,
      price: 150.0,
      description: 'Acceso por quince días al gimnasio',
    },
    {
      name: 'MENSUAL',
      daysGranted: 30,
      price: 280.0,
      description: 'Acceso por un mes al gimnasio',
    },
    {
      name: 'TRIMESTRAL',
      daysGranted: 90,
      price: 750.0,
      description: 'Acceso por tres meses al gimnasio',
    },
  ]

  console.log('🏋️ Creando tipos de membresía...')
  
  for (const type of membershipTypes) {
    const membershipType = await prisma.membershipType.upsert({
      where: { name: type.name },
      update: {},
      create: {
        ...type,
        creatorId: adminUser.id,
      },
    })
    console.log(`✅ Tipo de membresía creado: ${membershipType.name}`)
  }

  // Crear miembros de ejemplo
  const members = [
    {
      firstName: 'Juan Carlos',
      lastName: 'García López',
      age: 28,
      phone: '12345678',
    },
    {
      firstName: 'María Elena',
      lastName: 'Rodríguez Pérez',
      age: 32,
      phone: '87654321',
    },
    {
      firstName: 'Carlos Alberto',
      lastName: 'Mendoza Santos',
      age: 25,
      phone: '11223344',
    },
    {
      firstName: 'Ana Sofía',
      lastName: 'Hernández Cruz',
      age: 29,
      phone: '44332211',
    },
    {
      firstName: 'Luis Fernando',
      lastName: 'Morales Díaz',
      age: 35,
      phone: '55667788',
    },
  ]

  console.log('👥 Creando miembros de ejemplo...')

  // Obtener tipo de membresía mensual para asignar por defecto
  const monthlyMembership = await prisma.membershipType.findUnique({
    where: { name: 'MENSUAL' },
  })

  if (!monthlyMembership) {
    throw new Error('No se encontró el tipo de membresía MENSUAL')
  }

  for (const member of members) {
    // Verificar si el miembro ya existe
    const existingMember = await prisma.member.findUnique({
      where: { phone: member.phone },
    })

    if (!existingMember) {
      const newMember = await prisma.member.create({
        data: {
          ...member,
          creatorId: adminUser.id,
        },
      })

      // Crear membresía inicial
      const acquisitionDate = new Date()
      const expirationDate = new Date(acquisitionDate)
      expirationDate.setDate(expirationDate.getDate() + monthlyMembership.daysGranted)

      await prisma.userMembership.create({
        data: {
          memberId: newMember.id,
          membershipTypeId: monthlyMembership.id,
          acquisitionDate,
          expirationDate,
          creatorId: adminUser.id,
        },
      })

      // Actualizar lastRenewalDate
      await prisma.member.update({
        where: { id: newMember.id },
        data: { lastRenewalDate: acquisitionDate },
      })

      console.log(`✅ Miembro creado: ${newMember.firstName} ${newMember.lastName}`)
    } else {
      console.log(`⚠️ Miembro ya existe: ${member.firstName} ${member.lastName}`)
    }
  }

  console.log('🎉 Seeding completado exitosamente!')
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
