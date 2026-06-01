# API Nest - Documentacion Completa del Proyecto

## Tabla de Contenidos

- [Stack Tecnologico](#stack-tecnologico)
- [Arquitectura y Patrones](#arquitectura-y-patrones)
- [Estructura de Modulos](#estructura-de-modulos)
- [Sistema de Autenticacion (Auth)](#sistema-de-autenticacion-auth)
- [Sistema de Permisos RBAC](#sistema-de-permisos-rbac)
- [Formato de Respuesta API](#formato-de-respuesta-api)
- [Manejo de Errores](#manejo-de-errores)
- [Infraestructura Compartida](#infraestructura-compartida)
- [Decoradores Personalizados](#decoradores-personalizados)
- [Validacion y DTOs](#validacion-y-dtos)
- [Rate Limiting](#rate-limiting)
- [Caching](#caching)
- [Logging y Metricas](#logging-y-metricas)
- [Testing](#testing)
- [Buenas Practicas y Convenciones](#buenas-practicas-y-convenciones)

---

## Stack Tecnologico

| Componente | Tecnologia |
|------------|------------|
| Framework | NestJS 11 |
| Builder | SWC (compilacion rapida, no tsc) |
| ORM | Sequelize 6 + PostgreSQL |
| Cache | Redis via @keyv/redis + @nestjs/cache-manager |
| JWT | jose (HS256) |
| Validacion | class-validator + class-transformer |
| Documentacion API | Swagger/OpenAPI (@nestjs/swagger) |
| Testing | Vitest |
| Linter | Oxlint |
| Formateo | Prettier (tabs, single quote, 80 printWidth) |
| Contenedores | Docker + Docker Compose |
| Paquete | pnpm (single package) |

---

## Arquitectura y Patrones

El proyecto sigue una arquitectura limpia con el patron **Controller -> Use Case -> Repository/Adapter**.

```
┌─────────────────────────────────────────────────┐
│                   Controller                     │
│  (Maneja HTTP request/responses, decorators)     │
├─────────────────────────────────────────────────┤
│                   Use Case                       │
│  (Logica de negocio pura, sin dependencias HTTP) │
├─────────────────────────────────────────────────┤
│              Repository / Adapter                │
│  (Acceso a datos: Sequelize, APIs externas)      │
└─────────────────────────────────────────────────┘
```

### Principios

1. **Controllers delgados**: Solo manejan decoradores (auth, permisos, rate-limit, swagger) y delegan a use cases
2. **Use Cases con responsabilidad unica**: Cada caso de uso encapsula una operacion de negocio completa
3. **Inyeccion de dependencias**: Todo se inyecta via el DI container de NestJS
4. **Separacion por modulos**: Cada modulo es autocontenido con su controlador, use cases, DTOs, entidades y repositorios

### Modulos del Sistema

Los modulos se organizan en grupos funcionales:

```
src/modules/
├── security/
│   ├── auth/          # Autenticacion JWT
│   ├── user/          # Gestion de usuarios
│   ├── rol/           # Roles y permisos RBAC
│   ├── audit/         # Auditoria de sesiones
│   ├── jwt/           # Modulo JWT global
│   ├── valid-permission/  # Guard de permisos
│   └── dashboard/     # Dashboard administrativo
├── files/             # Subida/eliminacion de archivos
└── health/            # Health checks del sistema
```

---

## Sistema de Autenticacion (Auth)

### Flujo de Autenticacion

```
POST /api/auth/login  →  (1) Validar credenciales
                         (2) Verificar intentos fallidos
                         (3) Generar access token + refresh token
                         (4) Crear auditoria
                         (5) Set cookies HTTP-only
                         (6) Devolver rol encriptado

POST /api/auth/refresh-token  →  (1) Leer refreshToken de cookie
                                  (2) Verificar firma
                                  (3) Validar con registro de auditoria
                                  (4) Emitir nuevo par de tokens
                                  (5) Actualizar auditoria

POST /api/auth/logout  →  (1) Invalidar refresh token
                          (2) Limpiar cookies

GET /api/auth/check-session  →  (1) Verificar existencia de refresh token
```

### Tokens

| Token | Donde se almacena | Duracion | Firma |
|-------|-------------------|----------|-------|
| accessToken | Cookie HTTP-only | 1 hora | HS256 (JWT_SECRET) |
| refreshToken | Cookie HTTP-only | 7 dias | HS256 (JWT_REFRESH_SECRET) |

### Decorador @Auth

Todas las rutas protegidas usan el decorador compuesto `@Auth()` definido en `src/decorators/auth.decorator.ts`:

```typescript
@Auth(Permission.userRead) // Aplica: ApiBearerAuth + JwtAuthGuard + PermissionsGuard + @ValidPermission
```

Equivalente a:

```typescript
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ValidPermission(Permission.userRead)
```

Para rutas que solo requieren autenticacion (sin permiso especifico):

```typescript
@AuthPublic() // Aplica: ApiBearerAuth + JwtAuthGuard + PermissionsGuard
```

### Encriptacion de Rol

El rol del usuario se devuelve encriptado con AES-256-GCM usando la funcion `encrypt()` en `src/functions/encrypt.ts`. La clave de encriptacion se configura via `ENCRYPTION_KEY`.

---

## Sistema de Permisos RBAC

### Estructura de Permisos

Definidos en `src/modules/security/rol/enum/permissions.ts`:

```typescript
const Permission = {
  super: 'SUPER',           // Bypass total

  // Usuario
  user: 'USER',
  userProfile: 'USER_PROFILE',
  userAdd: 'USER_ADD',
  userRead: 'USER_READ',
  userReadOne: 'USER_READ_ONE',
  userUpdate: 'USER_UPDATE',
  userDelete: 'USER_DELETE',

  // Roles
  rol: 'ROL',
  rolAdd: 'ROL_ADD',
  rolRead: 'ROL_READ',
  rolReadOne: 'ROL_READ_ONE',
  rolUpdate: 'ROL_UPDATE',
  rolDelete: 'ROL_DELETE',

  // Auditoria
  audit: 'AUDIT',
  auditRead: 'AUDIT_READ',
  auditDelete: 'AUDIT_DELETE',

  // Dashboard
  dashboard: 'DASHBOARD',
  dashboardRead: 'DASHBOARD_DASHBOARD',
} as const;
```

### Validacion de Permisos

El `ValidPermissionGuard` en `src/modules/security/valid-permission/`:

1. Verifica que el usuario tenga el permiso requerido
2. Si el usuario tiene `SUPER`, bypass total
3. Si no tiene el permiso, retorna 403 Forbidden

### Roles por Defecto (Seed)

| Rol | Permisos |
|-----|----------|
| Administrador | `SUPER` (todos los permisos) |
| Usuario | Perfil propio, lectura basica |
| Visor | Solo permisos de lectura |

---

## Formato de Respuesta API

### Respuesta Exitosa (TransformInterceptor)

Todas las respuestas pasan por `TransformInterceptor` que las envuelve en:

```json
{
  "success": true,
  "data": { ... },
  "message": "Mensaje opcional"
}
```

El interceptor detecta si el controlador ya devuelve `{ data, message }` y lo respeta; de lo contrario, envuelve el valor directamente en `data`.

### Respuesta de Error (AllExceptionsFilter)

```json
{
  "success": false,
  "error": {
    "code": 400,
    "name": "Bad Request",
    "message": "Descripcion del error",
    "details": [
      { "field": "email", "message": "El campo es requerido" }
    ]
  }
}
```

### Codigos de Estado HTTP

| Codigo | Uso |
|--------|-----|
| 200 | OK - Operacion exitosa |
| 201 | Created - Recurso creado |
| 400 | Bad Request - Error de validacion |
| 401 | Unauthorized - Token invalido/expirado |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Conflicto (ej. rol con usuarios) |
| 429 | Too Many Requests - Rate limit excedido |
| 500 | Internal Server Error - Error no controlado |

---

## Manejo de Errores

### AllExceptionsFilter

El filtro global `AllExceptionsFilter` en `src/filters/all-exceptions.filter.ts` maneja todos los errores:

1. **TokenExpiredError**: Detecta si el access o refresh token expiro y responde 401
2. **ThrottlerException**: Responde 429 con mensaje de rate limit
3. **HttpException con `success: false`**: Pasa la respuesta directamente (usado por `ExtendedNotFoundException`, etc.)
4. **Errores de validacion**: Parsea errores de class-validator en formato `{ field, message }`
5. **Cualquier otro error**: Responde 500 con mensaje generico

### Excepciones Personalizadas

| Excepcion | Codigo | Uso |
|-----------|--------|-----|
| `ExtendedNotFoundException` | 404 | Recurso no encontrado |
| `ExtendedUnauthorizedException` | 401 | Credenciales invalidas |
| `ExtendedConflictException` | 409 | Conflicto en operacion |
| `ExtendedBadRequestException` | 400 | Error de validacion personalizado |

Todas aceptan el formato `objectError({ name, msg })`:

```typescript
throw new ExtendedNotFoundException(
  objectError({ name: 'all', msg: 'Rol no encontrado' })
);
```

---

## Infraestructura Compartida

### Interceptors

#### TransformInterceptor (`src/interceptors/transform.interceptor.ts`)

Envuelve todas las respuestas exitosas en el formato estandar `{ success, data }`.

#### LoggingInterceptor (`src/interceptors/logging.interceptor.ts`)

Logea todas las peticiones HTTP con:
- Metodo, URL, correlation ID, usuario, IP
- Tiempo de respuesta
- Alertas para peticiones lentas (>5000ms)
- Errores con stack trace
- Metricas de request/response/error

#### CacheInterceptor (`src/interceptors/cache.interceptor.ts`)

Interceptor base para cacheo de respuestas GET. Construye claves de cache basadas en URL y query parameters.

### Filters

#### AllExceptionsFilter (`src/filters/all-exceptions.filter.ts`)

Filtro global de excepciones (descrito arriba en Manejo de Errores).

### Services

#### LoggerService (`src/services/logger.service.ts`)

Servicio de logging estructurado:
- `info()`, `warn()`, `error()` para logs generales
- `logRequest()` / `logResponse()` para traza HTTP
- `logMetric()` para metricas de negocio
- `logSlowRequest()` para alertas de rendimiento

#### MetricsService (`src/services/metrics.service.ts`)

Servicio de metricas en memoria:
- `increment(name, tags)` - Contadores
- `histogram(name, value, tags)` - Distribuciones
- `gauge(name, value, tags)` - Valores instantaneos
- `getMetrics()` - Exportar todas las metricas

#### CacheService (`src/services/cache.service.ts`)

Wrapper sobre cache-manager con Redis:
- `get<T>()` / `set<T>()` / `del()` - Operaciones basicas
- `getOrSet()` con fallback function
- `getWithFallback()` con stale-while-revalidate
- `delPattern()` - Limpieza por patron via Redis SCAN
- `buildKey()` - Construccion de claves con prefijos
- Metodos helpers: `buildUserKey()`, `buildRoleKey()`, `buildRoleListKey()`

#### JwtService (`src/services/jwt.service.ts`)

Wrapper sobre `jose`:
- `signAsync(payload, options)` - Firmar JWT (HS256)
- `verifyAsync(token, options)` - Verificar JWT
- `verifyRefreshToken(token)` - Verificar refresh token
- `decodeToken(token)` - Decodificar sin verificar
- `isTokenExpired(token)` - Verificar expiracion

#### EmailService (`src/services/email.service.ts`)

Servicio para envio de correos (usado en recuperacion de contrasena y activacion de cuenta).

#### AppConfigService (`src/services/config.service.ts`)

Servicio de configuracion de aplicacion con valores por defecto y validacion.

#### CacheCleanupService (`src/services/cache-cleanup.service.ts`)

Limpieza programada de cache via `@nestjs/schedule`.

---

## Decoradores Personalizados

### Auth (`src/decorators/auth.decorator.ts`)

```typescript
@Auth(permiso)     // ApiBearerAuth + Guards + ValidPermission
@AuthPublic()      // ApiBearerAuth + Guards (sin permiso especifico)
```

### Rate Limit (`src/decorators/rate-limit.decorator.ts`)

| Decorador | TTL | Limite | Uso tipico |
|-----------|-----|--------|------------|
| `@ThrottleShort()` | 60s | 100 | Endpoints generales |
| `@ThrottleMedium()` | 5min | 50 | Consultas frecuentes |
| `@ThrottleLong()` | 10min | 20 | Operaciones lentas |
| `@ThrottleAuth()` | 15min | 5 | Login, recovery, activacion |
| `@ThrottleStrict()` | 60min | 3 | Proteccion extra |
| `@SkipThrottle()` | - | - | Sin rate limit |

### Caching (`src/decorators/cacheable.decorator.ts`)

| Decorador | TTL | Uso |
|-----------|-----|-----|
| `@Cacheable({ ttl })` | Personalizado | Cache personalizado |
| `@CacheableShort()` | 60s | Cache corto |
| `@CacheableMedium()` | 5min | Cache medio (default) |
| `@CacheableLong()` | 60min | Cache largo |
| `@CachePrefix(prefix)` | - | Prefijo para claves de cache |

### Validacion (`src/decorators/is-future-date.decorator.ts`)

Valida que una fecha sea futura.

---

## Validacion y DTOs

### ValidationPipe Global

Configurado en `main.ts`:

```typescript
app.useGlobalPipes(new ValidationPipe({
  transform: true,
  transformOptions: { enableImplicitConversion: true },
  whitelist: true,
  forbidNonWhitelisted: true,
  stopAtFirstError: true,
}));
```

### DTOs Base

#### QueryDTO (`src/dto/query.dto.ts`)

DTO base para endpoints de listado paginado:

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `page` | number (string) | Numero de pagina (obligatorio) |
| `limit` | number (string) | Registros por pagina (obligatorio, max 100) |
| `order` | `ASC`/`DESC` | Direccion de ordenamiento (obligatorio) |
| `status` | boolean (string) | Filtrar por estado (opcional) |
| `search` | string | Texto de busqueda (opcional) |

#### UidDTO (`src/dto/uid.dto.ts`)

```typescript
class UidDTO {
  @IsUUID()
  @IsString()
  @ApiProperty()
  uid: string;
}
```

### Paginacion

Los endpoints de listado retornan:

```json
{
  "success": true,
  "data": {
    "rows": [...],
    "count": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### Errores de Validacion

Cuando falla la validacion de un DTO, el ValidationPipe produce:

```json
{
  "success": false,
  "error": {
    "code": 400,
    "name": "Bad Request",
    "message": "Error de validacion",
    "details": [
      { "field": "email", "message": "email must be an email" },
      { "field": "password", "message": "password must be a string" }
    ]
  }
}
```

---

## Rate Limiting

Configurado globalmente via `@nestjs/throttler` en `app.module.ts`:

| Nombre | TTL | Limite |
|--------|-----|--------|
| short | 60s | 500 |
| medium | 5min | 300 |
| long | 10min | 100 |
| auth | 15min | 20 |

Rutas ignoradas: `POST /api/auth/refresh-token`, `GET /api/auth/check-session`

---

## Caching

### Cache Global

Configurado con Redis via `@keyv/redis`:

```typescript
CacheModule.registerAsync({
  store: new KeyvRedis({ url: config.get('REDIS_URL') }),
  max: 1000,
  ttl: 300000, // 5 minutos default
});
```

### CacheService

El `CacheService` proporciona:
- Prefijos de cache: `role`, `permission`, `user`, `config`, `health`, etc.
- `delPattern()`: Limpieza por patron (ej. `delPattern('role:pagination')`)
- `getOrSet()`: Cache-aside pattern con fallback
- `getWithFallback()`: stale-while-revalidate ante fallos

### Cache Decorators

```typescript
@CacheableShort()  // 60s
@Get()
async findAll() { ... }
```

---

## Logging y Metricas

### LoggerService

Logging estructurado con niveles:

```typescript
logger.info('Mensaje informativo');
logger.warn('Advertencia');
logger.error('Error', stack);
logger.logRequest({ method, url, correlationId, userId, ip });
logger.logResponse(request, response, responseTime);
logger.logMetric('dashboard.consultado', 1);
logger.logSlowRequest(request, responseTime);  // >5000ms
```

### Correlacion

Cada request tiene un `correlationId` generado por `CorrelationIdMiddleware` y propagado via header `x-correlation-id`.

### LoggingInterceptor

Por cada request HTTP registra:
- Request: metodo, URL, correlation ID, usuario, IP
- Response: status code, tiempo de respuesta
- Slow requests: alerta si >5000ms
- Errores: stack trace completo

### MetricsService

Metricas en memoria:

```typescript
metrics.increment('http.requests.total', { method, path });
metrics.histogram('http.response.time', responseTime, { method, status });
metrics.gauge('users.active', activeCount);
```

---

## Testing

### Configuracion

- Framework: Vitest
- Config: `vitest.config.ts`
- Path alias: `@/` → `./src/`

### Tipos de Tests

#### Unit Tests (`.spec.ts`)

Prueban casos de uso y servicios con dependencias mockeadas:

```typescript
describe('LoginUseCase', () => {
  const mockRepository = { findByEmail: vi.fn() };
  const mockJwtService = { signAsync: vi.fn() };

  let useCase: LoginUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new LoginUseCase(
      mockRepository as any,
      mockJwtService as any,
      // ...
    );
  });

  it('should login successfully', async () => { ... });
  it('should throw when credentials are invalid', async () => { ... });
});
```

#### Mocks

Se usa `vi.mock()` de Vitest para mockear modulos:

```typescript
vi.mock('bcrypt', () => ({ compare: vi.fn() }));
vi.mock('@/functions/encrypt', () => ({ encrypt: vi.fn() }));
```

### Tests Existentes

| Modulo | Archivos de Test |
|--------|-----------------|
| Auth | `login.use-case.spec`, `refreshToken.use-case.spec`, `checkSession.use-case.spec`, `logout.use-case.spec` |
| User | `findAllUserPagination.use-case.spec`, `getUserCounts.use-case.spec`, `user-auth.adapter.spec` |
| Audit | `auditReport.use-case.spec`, `audit-auth.adapter.spec` |
| Rol | `createRol.use-case.spec`, `updateRol.use-case.spec`, `removeRol.use-case.spec` |
| Files | `saveFile.use-case.spec`, `deleteFile.use-case.spec` |
| Dashboard | `getDashboardData.use-case.spec` |
| Health | `health.controller.spec` |
| Shared | `logger.module.spec`, `database.module.spec` |

---

## Buenas Practicas y Convenciones

### Estilo de Codigo

- Tabs para indentacion (no espacios)
- Single quotes para strings
- `arrowParens: "avoid"` - parentesis solo cuando es necesario
- 80 caracteres de ancho maximo
- Trailing commas
- `PascalCase` para clases, `camelCase` para metodos/variables
- Prefijo `I` para interfaces, `E` para enums
- Archivos en `kebab-case.extension.ts`

### Estructura de Modulos

Cada modulo sigue esta estructura:

```
modulo/
├── dto/
│   ├── moduloGetAll.dto.ts     # DTO de listado (extiende queryDTO)
│   ├── moduloRegister.dto.ts   # DTO de creacion
│   └── moduloUpdate.dto.ts     # DTO de actualizacion
├── entities/
│   └── modulo.entity.ts        # Modelo de Sequelize
├── repository/
│   └── modulo.repository.ts    # Repositorio (si aplica)
├── use-case/
│   ├── createModulo.use-case.ts
│   ├── findAllModulo.use-case.ts
│   └── ...
├── modulo.controller.ts        # Controlador
├── modulo.module.ts            # Modulo NestJS
└── modulo.messages.ts          # Mensajes de respuesta
```

### Convenciones de Nombres

| Elemento | Convencion | Ejemplo |
|----------|------------|---------|
| Controlador | `NombreController` | `UserController` |
| Caso de uso | `VerboNombreUseCase` | `CreateUserUseCase` |
| DTO | `NombreAccionDTO` | `UserRegisterDTO` |
| Entidad | `Nombre` | `User` |
| Repositorio | `NombreRepository` | `UserRepository` |
| Mensajes | `nombreMessages` | `userMessages` |
| Archivo | `kebab-case` | `user.controller.ts` |

### Variables de Entorno Requeridas

| Variable | Descripcion |
|----------|-------------|
| `JWT_SECRET` | Secreto JWT (min 64 caracteres) |
| `JWT_REFRESH_SECRET` | Secreto refresh JWT (min 64 caracteres) |
| `ENCRYPTION_KEY` | Clave de encriptacion AES-256 (min 32 caracteres) |
| `DATABASE_HOST` | Host de PostgreSQL |
| `DATABASE_PORT` | Puerto de PostgreSQL |
| `POSTGRES_USER` | Usuario de BD |
| `POSTGRES_PASSWORD` | Contrasena de BD |
| `POSTGRES_DB` | Nombre de BD |
| `REDIS_URL` | URL de conexion a Redis |
| `CORS` | Origenes permitidos para CORS |
| `PORT` | Puerto del servidor |
| `NODE_ENV` | Entorno: development, production, test |

---

## Endpoints por Modulo

### GET /api/health

Health check del sistema sin autenticacion. Verifica:

- Base de datos PostgreSQL (ping via Sequelize, timeout 3s)
- Redis (escritura/lectura de clave de prueba, mide response time)
- Heap de Node.js (< 300MB)
- Sistema (CPU < 2.0 load promedio, memoria < 90%)

**Respuesta exitosa:**
```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "redis": { "status": "up", "responseTime": 5 },
    "heap_used": { "status": "up", "used": "150MB" },
    "system": { "status": "up", "cpu": 0.25, "memory": 45.5 }
  },
  "error": {},
  "details": { ... }
}
```

### POST /api/files/upload

Subida de archivos (multipart/form-data). Sin autenticacion. Soporta:

- **Imagenes**: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
- **Documentos**: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

**Respuesta:**
```json
{
  "success": true,
  "data": { "filename": "uuid-nombre.jpg", "message": "Archivo subido exitosamente." }
}
```

### DELETE /api/files/delete

Elimina un archivo del servidor. Sin autenticacion.

**Respuesta:**
```json
{
  "success": true,
  "data": { "deleted": true, "message": "Archivo eliminado exitosamente." }
}
```

### GET /api/dashboard

Datos del dashboard administrativo. Requiere `DASHBOARD_DASHBOARD`.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "usersByStatus": { "active": 120, "inactive": 30 },
    "usersByActivation": { "activated": 140, "pending": 10 },
    "usersByRole": [
      { "rolName": "Administrador", "count": 3 },
      { "rolName": "Usuario", "count": 100 }
    ],
    "activeUsers": 25
  }
}
```
