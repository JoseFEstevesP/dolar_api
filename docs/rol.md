# Modulo de Roles (Rol)

## Descripcion

Gestion de roles y permisos para el sistema de control de acceso basado en roles (RBAC). Permite crear, listar, actualizar y eliminar roles, asi como consultar los permisos del usuario autenticado.

## Arquitectura

```
RolController
  |-- CreateRolUseCase               -> Crear rol
  |-- FindOneRolUseCase              -> Buscar rol por UID
  |-- FindAllRolsUseCase             -> Listar todos los roles (sin paginacion)
  |-- FindAllRolsPaginationUseCase   -> Listado paginado
  |-- FindRolPermissionsUseCase      -> Obtener permisos del rol actual
  |-- UpdateRolUseCase               -> Actualizar rol
  |-- RemoveRolUseCase               -> Eliminar rol
```

## Entidad: Role (tabla `roles`)

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| `uid` | UUID (PK) | Default: UUIDV4 |
| `name` | STRING(50) | UNIQUE, NOT NULL |
| `description` | STRING(200) | Nullable |
| `permissions` | ARRAY(TEXT) | Default: `[]` |
| `status` | BOOLEAN | Default: `true` |
| `createdAt` | DATE | Auto |
| `updatedAt` | DATE | Auto |

**Relacion:** `Role.hasMany(User)`

## Endpoints

### POST /api/rol

Crea un nuevo rol.

**Auth:** JWT + `ROL_ADD`

**Cuerpo:**
```json
{
  "name": "Administrador",
  "description": "Rol con permisos de administracion total",
  "permissions": ["SUPER"]
}
```

**Validaciones:**
- `name`: String, 3-255 caracteres, requerido
- `description`: String, 3-255 caracteres, requerido
- `permissions`: Array no vacio de enum Permission

---

### GET /api/rol

Lista paginada de roles.

**Auth:** JWT + `ROL_READ`

**Parametros de consulta:** `RolGetAllDTO` (extiende `queryDTO`)

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `orderProperty` | `OrderRolProperty` | Campo de ordenamiento |
| `permission` | `Permission` | Filtrar roles que contengan este permiso |

**Campos de ordenamiento (`OrderRolProperty`):** `name`, `description`, `status`, `createdAt`, `updatedAt`

---

### GET /api/rol/one/:uid

Obtiene un rol por su UID.

**Auth:** JWT + `ROL_READ_ONE`

---

### GET /api/rol/per

Obtiene los permisos del rol del usuario autenticado.

**Auth:** JWT (autenticado)

**Respuesta:** Array de strings con los permisos del rol.

---

### GET /api/rol/all

Lista todos los roles sin paginacion.

**Auth:** JWT (autenticado)

---

### PATCH /api/rol

Actualiza un rol existente.

**Auth:** JWT + `ROL_UPDATE`

**DTO:** `RolUpdateDTO` (uid, name, description, permissions, status)

---

### DELETE /api/rol/delete/:uid

Elimina un rol permanentemente.

**Auth:** JWT + `ROL_DELETE`

## Sistema de Permisos

Los permisos se definen en el enum `Permission` (`src/modules/security/rol/enum/permissions.ts`):

- `SUPER` - Super administrador (bypass total de permisos)
- `USER`, `USER_PROFILE`, `USER_ADD`, `USER_READ`, `USER_READ_ONE`, `USER_UPDATE`, `USER_DELETE`
- `ROL`, `ROL_ADD`, `ROL_READ`, `ROL_READ_ONE`, `ROL_UPDATE`, `ROL_DELETE`
- `AUDIT`, `AUDIT_READ`, `AUDIT_DELETE`
- `DASHBOARD`, `DASHBOARD_DASHBOARD`

### Roles por Defecto (Seed)

| Rol | Permisos |
|-----|----------|
| Administrador | `SUPER` (todos los permisos) |
| Usuario | `USER`, `USER_PROFILE`, roles de pagos y lectura |
| Visor | Solo permisos de lectura |
