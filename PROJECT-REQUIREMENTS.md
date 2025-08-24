# BodyStrong Gym Management – Requisitos Actualizados (Agosto 2025)

## 1. Descripción General
Aplicación interna para la gestión de miembros, tipos de membresía y estadísticas operativas del gimnasio BodyStrong. Construida con Next.js (App Router), Prisma + PostgreSQL, Better-Auth y UI basada en shadcn/ui + TailwindCSS.

## 2. Tecnologías Clave
- Next.js 15 (App Router) + React 19
- TypeScript estricto
- Prisma ORM + PostgreSQL
- Better-Auth (email/password + aprobación manual via `emailVerified`)
- UI: shadcn/ui, TailwindCSS
- Estado global: Nanostores
- Validación: Zod + React Hook Form
- Gráficas: Recharts (wrappers shadcn)
- Middleware para protección de rutas y verificación de aprobación

## 3. Modelos Principales (Prisma)
- User: autenticación y aprobación (`emailVerified`)
- Member: datos básicos (firstName, lastName, age, phone, firstEnrollmentDate, lastRenewalDate)
- MembershipType: catálogo (name, daysGranted, price, isActive)
- UserMembership: adquisiciones (acquisitionDate, expirationDate, isActive)

## 4. Flujo de Autenticación y Aprobación
1. Registro de usuario -> `emailVerified = false` (pendiente de aprobación manual externa / DB).
2. Middleware bloquea acceso a todo excepto `/login` y `/register` si no hay sesión o no verificado.
3. AuthGuard en cliente refuerza control y redirige a `/login?pendingApproval=1` si no verificado.
4. Endpoints API también retornan 403 si `emailVerified = false`.

## 5. Endpoints Actuales
Prefijo base: `/api`

### 5.1 Miembros
- GET `/members?search=&status=&page=&limit=` -> Lista paginada. `status`: ACTIVE | INACTIVE | NO_MEMBERSHIP
- POST `/members` -> Crea miembro + primera membresía
- GET `/members/:id` -> Detalle con memberships ordenadas (más reciente primero)
- POST `/members/:id` -> Renovar (crear nueva UserMembership)
- PATCH `/members/:id` -> Actualizar datos (firstName, lastName, age, phone)
- DELETE `/members/:id` -> Eliminar (hard delete + cascade memberships)
- GET `/members/:id/memberships` -> Historial completo de membresías

### 5.2 Tipos de Membresía
- GET `/membership-types` -> Lista activos
- POST `/membership-types` -> Crear
- PATCH `/membership-types?id=...` -> Activar / desactivar (`isActive`)

### 5.3 Dashboard / KPIs
- GET `/dashboard/stats` -> Retorna:
  - totalMembers
  - activeMembers
  - inactiveMembers (con membresía vencida)
  - withoutMembershipMembers (sin historial de membresías)
  - newMembersThisMonth
  - membersNotRenewed (última expiró y no renovó)
  - enrollmentsByMonth[{month,count}]
  - recentMembers (limitado para UI)

## 6. Cálculo de Estados
El backend adjunta `status` a cada miembro:
- ACTIVE: última membresía activa y no expirada.
- INACTIVE: tiene membresía pero expirada / inactiva.
- NO_MEMBERSHIP: nunca ha tenido membresías.

La lógica previa en frontend (`getMemberStatus`) está deprecada y reemplazada por el valor entregado por la API.

## 7. UI / Componentes Clave
- Dashboard: `StatsCards`, `MembershipChart`, `EnrollmentsBarChart`, `RecentMembers` (ya no pagina internamente; recibe subconjunto limitado).
- Gestión de Miembros: `MembersTable` (server-driven filtering/pagination), `MemberForm`, `MemberProfile` (simplificado a campos activos del modelo actual).
- Tipos de Membresía: página administrativa para creación y activación/desactivación.
- Autenticación: `login-form-new`, `register-form`, `AuthGuard` unificado (pendiente de consolidar completamente nombres si hay duplicados).

## 8. Cambios Recientes Importantes
- Eliminados mocks y servicios legacy de autenticación.
- Añadida paginación y filtros en `/api/members` + integración en `MembersTable`.
- KPI recalculados en servidor (separación inactive vs withoutMembership).
- Middleware y checks 403 por `emailVerified` en todos los endpoints sensibles.
- `RecentMembers` refactor: usa `member.status`; removida paginación interna.
- `MemberProfile` actualizado a campos vigentes (eliminados campos obsoletos como email, dateOfBirth, emergencyContact, etc.).
- Deprecado `dataService.getMemberStatus()` (stub temporal).

## 9. Validaciones
- Zod schemas para creación y actualización de miembros y tipos de membresía.
- Teléfono único (8 dígitos formato Guatemala).
- Rango de edad 1–120.
- Días otorgados > 0; precio >= 0.

## 10. Seguridad y Acceso
- Middleware fuerza autenticación + verificación.
- Endpoints repiten verificación (defensa en profundidad).
- Eliminados datos médicos y contactos sensibles en esta fase (se pueden reintroducir con consentimiento y cifrado si es necesario).

## 11. Pendientes / Backlog Futuro
- Eliminar definitivamente stub `getMemberStatus` y limpiar imports asociados.
- Unificar completamente `auth-guard` y `auth-guard-new` (quitar duplicado no usado).
- Añadir tests (unit + integración) para endpoints y cálculo KPI.
- Manejo de roles (admin vs staff) si se requiere más granularidad.
- Export / import (CSV) de miembros.
- Auditoría de acciones (log de renovaciones, cambios críticos).

## 12. Manejo de Errores / UX
- Toasts para operaciones CRUD (en formularios). Falta: feedback visual consistente para errores 403 en componentes genéricos.
- Redirección automática si `pendingApproval`.

## 13. Scripts y Comandos (package.json)
- `dev`, `build`, `start` (Next.js)
- `db:generate`, `db:push`, `db:migrate`, `db:seed`, `db:studio`

## 14. Consideraciones de Datos
- Eliminaciones de miembros hacen hard delete (no soft delete) -> evaluar impacto histórico.
- `UserMembership.isActive` reservado para potencial cancelación manual.

## 15. Próximos Pasos Recomendados Inmediatos
1. Remover el stub de `getMemberStatus` y actualizar documentación.
2. Crear `ErrorBoundary` / provider de manejo HTTP que intercepte 401/403 para UX unificada.
3. Añadir pruebas automatizadas para `/api/members` (filtros + paginación) y KPIs.
4. Documentar proceso de aprobación manual de usuarios (operativo).

---
Documento actualizado automáticamente para reflejar el estado real del código a la fecha indicada.
