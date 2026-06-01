# Modulo de Auditoria (Audit)

## Descripcion

Registro de auditoria que almacena las sesiones de los usuarios, incluyendo tokens de refresh y metadatos de los requests. Permite el seguimiento de inicios de sesion y la limpieza de registros antiguos.

## Arquitectura

```
AuditController
  |-- FindAllAuditsUseCase   -> Listado paginado de registros
  |-- RemoveAuditUseCase     -> Eliminar registro de auditoria
  |-- CleanUpOldAuditsUseCase -> Limpieza programada de registros antiguos
```

## Entidad: Audit (tabla `audit`)

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| `uid` | UUID (PK) | Default: UUIDV4 |
| `uidUser` | UUID (FK) | NOT NULL -> users.uid |
| `refreshToken` | TEXT | NOT NULL |
| `dataToken` | ARRAY(STRING) | NOT NULL (metadatos del request) |
| `createdAt` | DATE | Auto |
| `updatedAt` | DATE | Auto |

**Relacion:** `Audit.belongsTo(User)` via `uidUser`

**Indices:**
- `idx_audit_uid_user` (uidUser)
- `idx_audit_created_at` (createdAt)
- `idx_audit_user_created` (uidUser, createdAt) - compuesto

## Endpoints

### GET /api/audit

Lista paginada de registros de auditoria.

**Auth:** JWT + `AUDIT_READ`

**Parametros de consulta:** `AuditGetAllDTO` (extiende `queryDTO`)

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `orderProperty` | `OrderAuditProperty` | Campo de ordenamiento |

**Campos de ordenamiento (`OrderAuditProperty`):** `names`, `email`, `createdAt`

---

### DELETE /api/audit/delete/:uid

Elimina un registro de auditoria.

**Auth:** JWT + `AUDIT_DELETE`

**Parametros:** `uid` (UUID del registro de auditoria)

## Flujo de Creacion de Auditoria

La auditoria se crea automaticamente durante el proceso de login:

1. El usuario inicia sesion via `POST /api/auth/login`
2. Se genera un par de tokens (access + refresh)
3. Se extraen metadatos del request: IP, User-Agent, etc. (via `dataInfoJWT()`)
4. Se crea un registro en la tabla `audit` con:
   - `uidUser`: ID del usuario
   - `refreshToken`: El refresh token generado
   - `dataToken`: Array con metadatos del request
5. En `refresh-token`, se actualiza el registro existente con el nuevo refresh token

## Limpieza de Registros

El caso de uso `CleanUpOldAuditsUseCase` se encarga de la limpieza programada de registros antiguos (gestionado por `@nestjs/schedule`).
