# BodyStrong Gym - Sistema de Gestión

Sistema de gestión interno para el gimnasio BodyStrong, desarrollado con Next.js, Prisma, PostgreSQL y Better-Auth.

## 🚀 Características

- **Gestión de Miembros**: Registro, consulta y actualización de miembros
- **Sistema de Membresías**: Diferentes tipos de membresías con duración personalizada
- **Dashboard Analítico**: Estadísticas y métricas clave del negocio
- **Autenticación Segura**: Sistema de login con Better-Auth
- **Validaciones**: Formularios con React Hook Form y Zod
- **Estado Global**: Gestión con Nanostores
- **Interfaz Moderna**: Componentes de Shadcn/ui con TailwindCSS

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 15 (App Router)
- **Base de Datos**: PostgreSQL
- **ORM**: Prisma
- **Autenticación**: Better-Auth
- **UI Components**: Shadcn/ui
- **Estilos**: TailwindCSS
- **Formularios**: React Hook Form + Zod
- **Estado Global**: Nanostores
- **Gráficos**: Recharts (Charts de Shadcn/ui)

## 📋 Prerrequisitos

- Node.js 18+ 
- PostgreSQL 14+
- npm o pnpm

## 🔧 Instalación

1. **Clonar el repositorio** (si aplica)
   ```bash
   git clone <repository-url>
   cd bodystrong-gym
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   # o
   pnpm install
   ```

3. **Configurar variables de entorno**
   
   Copiar `.env.example` a `.env.local` y configurar:
   
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/bodystrong_gym"
   
   # Better Auth
   BETTER_AUTH_SECRET="your-super-secret-key-change-in-production"
   BETTER_AUTH_URL="http://localhost:3000"
   NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
   
   # App
   NEXTAUTH_URL="http://localhost:3000"
   NODE_ENV="development"
   ```

4. **Configurar la base de datos**
   
   a. Crear la base de datos PostgreSQL:
   ```sql
   CREATE DATABASE bodystrong_gym;
   ```
   
   b. Ejecutar las migraciones de Prisma:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
   
   c. (Opcional) Cargar datos de ejemplo:
   ```bash
   npx prisma db seed
   ```

5. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   # o
   pnpm dev
   ```

   La aplicación estará disponible en: http://localhost:3000

## 📊 Estructura del Proyecto

```
bodystrong-gym/
├── app/                     # App Router de Next.js
│   ├── api/                # Endpoints API
│   │   ├── auth/           # Autenticación
│   │   ├── members/        # Gestión de miembros
│   │   ├── membership-types/ # Tipos de membresía
│   │   └── dashboard/      # Métricas y estadísticas
│   ├── dashboard/          # Página principal
│   ├── login/              # Página de login
│   ├── register/           # Página de registro
│   ├── members/            # Gestión de miembros
│   │   ├── new/           # Crear nuevo miembro
│   │   └── [id]/          # Perfil de miembro
│   └── layout.tsx          # Layout principal
├── components/             # Componentes React
│   ├── auth/              # Componentes de autenticación
│   ├── dashboard/         # Componentes del dashboard
│   ├── layout/            # Componentes de layout
│   ├── members/           # Componentes de miembros
│   └── ui/                # Componentes UI de Shadcn
├── lib/                   # Utilidades y configuración
│   ├── stores/            # Stores de Nanostores
│   ├── auth-config.ts     # Configuración de Better-Auth
│   ├── auth-client.ts     # Cliente de autenticación
│   ├── prisma.ts          # Cliente de Prisma
│   └── types.ts           # Tipos TypeScript
├── prisma/                # Configuración de Prisma
│   └── schema.prisma      # Schema de la base de datos
└── styles/                # Estilos globales
```

## 🔐 Autenticación

El sistema utiliza Better-Auth con las siguientes características:

- **Registro**: Solo emails con dominio `@bodystrong.com`
- **Aprobación Manual**: Los usuarios requieren aprobación manual en la base de datos
- **Sesiones Seguras**: Gestión automática de sesiones con expiración
- **Validaciones**: Contraseñas seguras con requisitos específicos

### Crear Usuario Administrador

Para crear el primer usuario administrador:

1. Registrarse en `/register` con email `admin@bodystrong.com`
2. En la base de datos, actualizar el campo `emailVerified` a `true`:
   ```sql
   UPDATE users SET "emailVerified" = true WHERE email = 'admin@bodystrong.com';
   ```

## 📝 Funcionalidades Principales

### Dashboard
- **Métricas Clave**: Miembros activos, inactivos (vencidos / sin membresía), nuevos del mes, miembros que no renovaron, total miembros
- **Gráficos**: Inscripciones por mes (últimos 6), distribución de estados
- **Miembros Recientes**: Lista de últimos registros
- **Búsqueda y Filtros**: Por nombre, teléfono y estado

### Gestión de Miembros
- **Registro**: Datos personales + membresía inicial
- **Perfil**: Información completa con historial de membresías
- **Renovaciones**: Sistema de renovación de membresías
- **Validaciones**: Teléfono formato Guatemala, campos obligatorios

### Tipos de Membresía
- **Configurables**: Días de duración y precios
- **Ejemplos**: DIARIA (1 día), SEMANAL (7 días), MENSUAL (30 días)
- **Cálculo Automático**: Fechas de expiración basadas en días otorgados

## 🔧 Configuración de Desarrollo

### Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar en producción
npm run start

# Linting
npm run lint

# Prisma
npx prisma generate        # Generar cliente
npx prisma db push         # Aplicar cambios al schema
npx prisma studio          # Interfaz visual de la DB
npx prisma migrate dev     # Crear migración
```

### Estructura de Base de Datos

**Tablas principales:**
- `users`: Usuarios del sistema (autenticación)
- `members`: Miembros del gimnasio
- `membership_types`: Tipos de membresía disponibles
- `user_memberships`: Historial de membresías de cada miembro

**Relaciones:**
- Un usuario puede crear múltiples miembros
- Un miembro puede tener múltiples membresías (historial)
- Cada membresía está asociada a un tipo específico

## 📱 API Endpoints

### Autenticación
- `POST /api/auth/signin` - Iniciar sesión
- `POST /api/auth/signup` - Registrarse
- `POST /api/auth/signout` - Cerrar sesión

### Miembros
- `GET /api/members` - Listar miembros (con filtros)
- `POST /api/members` - Crear miembro
- `GET /api/members/[id]` - Obtener miembro específico
- `POST /api/members/[id]` - Renovar membresía

### Tipos de Membresía
- `GET /api/membership-types` - Listar tipos activos
- `POST /api/membership-types` - Crear nuevo tipo
- `PATCH /api/membership-types?id=...` - Activar/desactivar tipo

### Dashboard
- `GET /api/dashboard/stats` - Estadísticas generales (activos, inactivos, nuevos mes, no renovaron, total, inscripciones 6 meses)

## 🚀 Despliegue

### Variables de Entorno para Producción

```env
DATABASE_URL="postgresql://user:password@host:port/database"
BETTER_AUTH_SECRET="your-production-secret-key"
BETTER_AUTH_URL="https://your-domain.com"
NEXT_PUBLIC_BETTER_AUTH_URL="https://your-domain.com"
NODE_ENV="production"
```

### Pasos de Despliegue

1. Configurar base de datos PostgreSQL en producción
2. Establecer variables de entorno
3. Ejecutar migraciones: `npx prisma db push`
4. Build del proyecto: `npm run build`
5. Iniciar aplicación: `npm run start`

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📞 Soporte

Para soporte técnico o consultas:
- Email: soporte@bodystrong.com
- Documentación: [Link a documentación adicional]

---

**BodyStrong Gym Management System** - Desarrollado con ❤️ para la gestión eficiente de gimnasios.
