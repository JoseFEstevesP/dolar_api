# Modulo de Usuarios (User)

## Descripcion

Gestion completa de usuarios: registro, perfiles, CRUD administrativo, recuperacion de contrasena, activacion de cuentas, y estadisticas.

## Arquitectura

```
UserController
  |-- CreateProtectUserUseCase        -> Admin crea usuario
  |-- FindAllUsersUseCase             -> Listado paginado con filtros
  |-- FindOneUserByUidUseCase         -> Buscar por UID
  |-- UpdateUserUseCase               -> Admin actualiza usuario
  |-- RemoveUserUseCase               -> Admin elimina usuario (hard delete)
  |-- GetUserProfileUseCase           -> Obtener perfil propio
  |-- UpdateUserProfileUseCase        -> Actualizar datos del perfil
  |-- UpdateUserProfileEmailUseCase   -> Cambiar email
  |-- UpdateUserProfilePasswordUseCase -> Cambiar contrasena
  |-- UnregisterUserUseCase           -> Baja de cuenta propia (soft delete)
  |-- RecoveryPasswordUseCase         -> Enviar codigo de recuperacion
  |-- RecoveryVerifyPasswordUseCase   -> Verificar codigo de recuperacion
  |-- SetNewPasswordUseCase           -> Establecer nueva contrasena
  |-- ActivateAccountUseCase          -> Activar cuenta via codigo
  |-- GetUserChartsUseCase            -> Estadisticas para graficos
```

## Entidad: User (tabla `users`)

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| `uid` | UUID (PK) | Default: UUIDV4 |
| `names` | STRING(100) | NOT NULL |
| `surnames` | STRING(100) | NOT NULL |
| `email` | STRING(100) | UNIQUE, NOT NULL |
| `password` | STRING(255) | Nullable (proveedores OAuth) |
| `phone` | STRING(20) | Nullable |
| `code` | STRING(20) | Codigo de verificacion |
| `avatar` | STRING(500) | Nullable |
| `provider` | STRING(50) | Default: `'local'` |
| `status` | BOOLEAN | Default: `true` (soft delete) |
| `activatedAccount` | BOOLEAN | Default: `false` |
| `attemptCount` | INTEGER | Default: `0` |
| `dataOfAttempt` | DATE | Ultimo intento de login |
| `uidRol` | UUID (FK) | NOT NULL -> roles.uid |
| `createdAt` | DATE | Auto |
| `updatedAt` | DATE | Auto |

**Relacion:** `User.belongsTo(Role)` via `uidRol`

## Endpoints

### POST /api/user/protect

Crea un nuevo usuario (solo administradores).

**Auth:** JWT + `USER_ADD`

**Cuerpo:**
```json
{
  "names": "John",
  "surnames": "Doe",
  "email": "john@example.com",
  "phone": "0414151234",
  "password": "P@ssw0rd123",
  "confirmPassword": "P@ssw0rd123",
  "uidRol": "uuid-del-rol"
}
```

---

### GET /api/user

Lista paginada de usuarios.

**Auth:** JWT + `USER_READ`

**Parametros de consulta:** `queryDTO` + `orderProperty` + `search`

**Campos de ordenamiento (`OrderUserProperty`):** `names`, `surnames`, `email`, `phone`, `status`, `activatedAccount`, `createdAt`, `updatedAt`

**Filtro `search`:** Busca por nombres, apellidos o email.

---

### GET /api/user/one/:uid

Obtiene un usuario por su UID.

**Auth:** JWT + `USER_READ`

**Parametros:** `uid` (UUID)

---

### GET /api/user/profile

Obtiene el perfil del usuario autenticado.

**Auth:** JWT + `USER_PROFILE`

---

### GET /api/user/charts

Obtiene datos estadisticos de usuarios para graficos.

**Auth:** JWT + `USER_READ`

**Respuesta:** `UserChartDataResponseDTO` con datos agregados.

---

### PATCH /api/user

Actualiza un usuario (admin).

**Auth:** JWT + `USER_UPDATE`

**Cuerpo:** `UserUpdateDTO` (extiende `UserRegisterDTO` sin password + `uid` + `status` + `activatedAccount`)

---

### PATCH /api/user/profile/data

Actualiza datos del perfil propio.

**Auth:** JWT + `USER_PROFILE`

**DTO:** `UserUpdateProfileDataDTO` (names, surnames, phone)

---

### PATCH /api/user/profile/email

Cambia el email del perfil propio.

**Auth:** JWT + `USER_PROFILE`

**DTO:** `UserUpdateProfileEmailDTO` (email)

---

### PATCH /api/user/profile/password

Cambia la contrasena del perfil propio.

**Auth:** JWT + `USER_PROFILE`

**DTO:** `UserUpdateProfilePasswordDTO` (olPassword, newPassword)

---

### DELETE /api/user/profile/unregister

Da de baja la cuenta propia (soft delete: `status = false`).

**Auth:** JWT + `USER_PROFILE`

---

### DELETE /api/user/delete/:uid

Elimina un usuario permanentemente (admin).

**Auth:** JWT + `USER_DELETE`

---

### POST /api/user/recoveryPassword

Envia un codigo de recuperacion por email.

**Rate Limit:** `@ThrottleAuth`

**DTO:** `UserRecoveryPasswordDTO` (email)

---

### POST /api/user/recoveryPassCode

Verifica el codigo de recuperacion.

**Rate Limit:** `@ThrottleAuth`

**DTO:** `RecoveryVerifyPasswordDTO` (code, email)

---

### POST /api/user/newPassword

Establece una nueva contrasena usando un token temporal.

**Auth:** Bearer Token (obtenido del flujo de recuperacion)

**DTO:** `UserNewPasswordDTO` (newPassword, confirmPassword)

---

### POST /api/user/activated

Activa la cuenta del usuario mediante codigo de verificacion.

**Rate Limit:** `@ThrottleAuth`

**DTO:** `UserActivateCountDTO` (code, email)

## Credenciales de Prueba (Seed)

| Rol | Email | Contrasena |
|-----|-------|------------|
| Administrador | `admin@admin.com` | `P@ssw0rd123` |
| Usuario | `test@test.com` | `P@ssw0rd123` |
| Visor | `viewer@test.com` | `P@ssw0rd123` |
