# Modulo de Autenticacion (Auth)

## Descripcion

Modulo encargado de la autenticacion de usuarios mediante JWT. Implementa login con validacion de credenciales, refresh tokens, cierre de sesion y verificacion de sesion activa.

## Arquitectura

```
AuthController
  |-- LoginUseCase          -> Autentica usuario, genera tokens, registra auditoria
  |-- LogoutUseCase         -> Invalida sesion, limpia cookies
  |-- RefreshTokenUseCase   -> Valida refresh token, emite nuevo par de tokens
  |-- CheckSessionUseCase   -> Verifica existencia y validez de refresh token
```

## Endpoints

### `POST /api/auth/login`

Inicia sesion con credenciales de usuario.

**Rate Limit:** `@ThrottleAuth` (20 requests/15min)

**Cuerpo de la solicitud:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "P@ssw0rd123"
}
```

**Validaciones:**
- `email`: Debe ser un email valido, no vacio
- `password`: Debe cumplir politicas de contrasena segura (8+ chars, mayuscula, minuscula, numero, simbolo)

**Respuesta exitosa (201):**
```json
{
  "msg": "Inicio de sesion exitoso",
  "rol": "iv:authTag:encryptedData"
}
```

**Cookies establecidas:**
- `accessToken`: JWT de acceso (1 hora, HTTP-only)
- `refreshToken`: JWT de refresh (7 dias, HTTP-only)

**Flujo interno:**
1. Validar credenciales con bcrypt
2. Verificar intentos fallidos (`ValidateAttemptUseCase`)
3. Generar access token (1h) y refresh token (7d) con `jose` (HS256)
4. Crear registro de auditoria con refresh token y metadatos del request
5. Encriptar el rol del usuario con AES-256-GCM y devolverlo
6. Resetear contador de intentos fallidos

**Codigos de error:**
| Codigo | Descripcion |
|--------|-------------|
| 400 | Datos de entrada invalidos |
| 401 | Credenciales incorrectas o cuenta bloqueada |
| 429 | Demasiados intentos |

---

### `POST /api/auth/logout`

Cierra la sesion del usuario actual.

**Auth:** JWT (cookie `accessToken`)

**Respuesta exitosa (200):**
```json
{
  "msg": "Sesion cerrada exitosamente"
}
```

**Flujo interno:**
1. Invalida refresh token asociado al usuario
2. Limpia cookies `accessToken` y `refreshToken`

---

### `POST /api/auth/refresh-token`

Renueva el par de tokens usando el refresh token almacenado en cookies.

**Auth:** Cookie `refreshToken`

**Respuesta exitosa (201):**
```json
{
  "msg": "Token actualizado"
}
```

**Flujo interno:**
1. Leer `refreshToken` de cookies
2. Verificar firma del refresh token
3. Buscar registro de auditoria que coincida con el token + metadatos del request
4. Validar que el usuario existe y esta activo
5. Emitir nuevo par de tokens
6. Actualizar registro de auditoria con nuevo refresh token
7. Si falla validacion, limpiar cookies y forzar logout

**Codigos de error:**
| Codigo | Descripcion |
|--------|-------------|
| 401 | Refresh token invalido o expirado |
| 429 | Demasiadas peticiones |

---

### `GET /api/auth/check-session`

Verifica si el usuario tiene una sesion activa.

**Auth:** Cookie `refreshToken`

**Rate Limit:** Sin rate limit (`@SkipThrottle()`)

**Respuesta exitosa (200):**
```json
{
  "isAuthenticated": true
}
```

**Respuesta sesion no activa (200):**
```json
{
  "isAuthenticated": false
}
```

## Diagrama de Flujo de Autenticacion

```
Cliente                     API                         BD/Redis
  |                          |                            |
  |-- POST /login ---------->|                            |
  |                          |-- Validar credenciales ---->|
  |                          |<-- Usuario valido ---------| 
  |                          |-- Verificar intentos ----->|
  |                          |-- Generar tokens ----------|
  |                          |-- Crear auditoria -------->|
  |<-- Set cookies + rol ----|                            |
  |                          |                            |
  |-- POST /refresh-token -->|                            |
  |                          |-- Verificar refresh token -|
  |                          |-- Buscar auditoria ------->|
  |                          |-- Validar usuario ---------|
  |                          |-- Emitir nuevos tokens ----|
  |<-- Nuevas cookies -------|                            |
```

## DTOs

### AuthLoginDTO

Extiende `UserRegisterDTO` usando `PickType` para solo incluir:
- `email` (string, email valido)
- `password` (string, strong password)
