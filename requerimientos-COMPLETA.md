# IMPLEMENTACIÓN - BodyStrong Gym Management System

## 📐 REQUERIMIENTOS DEL PRODUCTO

### 1. Asunto del Proyecto
Desarrollo de una aplicación web interna para la administración integral de miembros, membresías y métricas del gimnasio "BodyStrong".

### 2. Objetivo Principal
Proveer una herramienta segura, consistente e intuitiva para:
- Gestionar miembros y sus renovaciones.
- Administrar tipos de membresía (activación / desactivación).
- Visualizar KPIs operativos clave (actividad, renovaciones, crecimiento, distribución, inscripciones por mes).

### 3. Stack Tecnológico Principal
- Framework: Next.js (App Router, React 19)
- UI Kit: shadcn/ui + TailwindCSS
- ORM: Prisma
- Base de Datos: PostgreSQL
- Autenticación: Better-Auth (sesiones + aprobación manual vía `emailVerified`)
- Validación: Zod + React Hook Form
- Estado Global: Nanostores
- Gráficos: Recharts envueltos en componentes de shadcn/ui
- Tipado: TypeScript estricto

### 4. Esquema de Base de Datos (Resumen)
Modelos vigentes: User, Session, Account, VerificationToken (Better-Auth), Member, MembershipType, UserMembership.
- `Member.status` no es columna física: se calcula en el backend y se añade a la respuesta.
- `User.emailVerified` controla aprobación manual.

### 5. Lógica de Negocio Clave
1. Estado de miembro (ACTIVE | INACTIVE | NO_MEMBERSHIP) calculado en backend revisando la membresía más reciente.
2. Renovación crea nuevo `UserMembership` y actualiza `lastRenewalDate`.
3. `expirationDate = acquisitionDate + daysGranted` (servidor).
4. KPIs agregados en `/api/dashboard/stats` (activos, inactivos, sin membresía, nuevos mes, no renovaron, inscripciones por mes, miembros recientes).
5. Separación explícita: INACTIVE vs NO_MEMBERSHIP.


### 7. Interfaz & Navegación
Layout con sidebar persistente (excepto login / register).  
Sidebar: Dashboard, Miembros, Tipos de Membresía, (acciones futuras).  
Logout integrado con Better-Auth.  
Páginas: Login, Register, Dashboard, Members (tabla con filtros + paginación), Member Profile, New Member, Membership Types Admin.

### 8. Pantallas (Resumen Funcional)
- Login: credenciales + aviso de aprobación pendiente.
- Register: email corporativo obligatorio (`@bodystrong.com`), usuario queda en espera (`emailVerified=false`).
- Dashboard: KPIs + gráficos + miembros recientes.
- Members: tabla server-driven (search, status, page, limit).
- New Member: crea miembro + primera membresía.
- Member Profile: datos principales + primera inscripción (historial separado por endpoint dedicado).
- Membership Types: CRUD (crear, activar/desactivar).

### 9. Estado Global
Nanostores para sesión (usuario + expiración) y (opcional) cachés ligeros. Migrado desde mocks a consumo real de API.

### 10. Seguridad
- Middleware global + AuthGuard en cliente.
- Checks duplicados `emailVerified` en cada endpoint (defensa en profundidad).
- Sin datos sensibles innecesarios (removidos campos legacy de salud / contacto emergencia en esta fase actual del producto).

### 11. Validaciones / Reglas
- Email corporativo para registro.
- Password política mínima (en formulario de registro original; se mantiene infraestructura para endurecer si se desea).
- Teléfono 8 dígitos único.
- Edad 1–120.
- Días de membresía > 0; precio >= 0.

### 12. Métricas Implementadas
- totalMembers, activeMembers, inactiveMembers, withoutMembershipMembers.
- newMembersThisMonth.
- membersNotRenewed (última expiró, sí tenía historial previo).
- enrollmentsByMonth (histórico por etiqueta mes).  

### 14. Diferencias vs Requerimientos Originales
| Original | Estado Actual | Comentario |
|----------|---------------|-----------|
Perfil incluía datos médicos / emergencia | Removidos | Reintroducir solo con requisitos legales claros |
MemberProfile mostraba email / dateOfBirth | No presentes | Modelo actual no guarda DOB / email directo del miembro |
Tabla miembros calculaba estado en front | Estado provisto por backend | Menor duplicación lógica |
Renovación dentro del perfil | Vía endpoint y formulario externo (pendiente UI ampliada) | Histórico disponible |

---