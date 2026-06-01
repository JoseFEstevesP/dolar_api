# Documentacion de la API

Indice de documentacion detallada por modulo del proyecto API Nest.

> **Documentacion completa del proyecto**: [DOCUMENTATION.md](../DOCUMENTATION.md) — incluye stack tecnologico, arquitectura, infraestructura, patrones, decoradores, servicios, testing y endpoints por modulo.

## Modulos

| Modulo | Descripcion | Documentacion |
|--------|-------------|---------------|
| Auth | Autenticacion JWT, login, logout, refresh token, verificacion de sesion | [auth.md](auth.md) |
| User | Gestion de usuarios: CRUD, perfiles, recuperacion de contrasena, activacion | [user.md](user.md) |
| Rol | Gestion de roles y permisos RBAC | [rol.md](rol.md) |
| Audit | Registro de auditoria y seguimiento de sesiones | [audit.md](audit.md) |
| Dashboard | Analytics y estadisticas del dashboard administrativo | [dashboard.md](dashboard.md) |
| Files | Subida y eliminacion de archivos (imagenes y documentos) | [files.md](files.md) |
| Health | Health checks del sistema (DB, Redis, memoria, CPU) | [health.md](health.md) |

## Convenciones Generales

### Prefijo de API

Todos los endpoints usan el prefijo `/api`.

### Formato de Respuesta

Todas las respuestas siguen un formato envolvente estandar:

**Exito (200/201):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Mensaje opcional"
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": 400,
    "name": "Bad Request",
    "message": "Descripcion del error",
    "details": [{ "field": "email", "message": "El campo es requerido" }]
  }
}
```

### Autenticacion

- **Access Token**: Enviado como cookie HTTP-only (`accessToken`), JWT firmado con HS256, expiracion: 1 hora
- **Refresh Token**: Enviado como cookie HTTP-only (`refreshToken`), expiracion: 7 dias
- **Bearer Token**: Usado en endpoints publicos con token temporal (ej. recuperacion de contrasena)

### Codigos de Estado HTTP

| Codigo | Descripcion |
|--------|-------------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

### Rate Limiting

| Nivel | TTL | Limite | Decorador | Uso |
|-------|-----|--------|-----------|-----|
| Corto | 60s | 100 | `@ThrottleShort()` | Endpoints generales |
| Medio | 5min | 300 | `@ThrottleMedium()` | Consultas frecuentes |
| Largo | 10min | 100 | `@ThrottleLong()` | Operaciones lentas |
| Auth | 15min | 20 | `@ThrottleAuth()` | Login, recovery |
| Estricto | 15min | 5 | `@ThrottleStrict()` | Proteccion extra |

### Paginacion

Los endpoints de listado usan `queryDTO` como base:

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `page` | string | Numero de pagina (obligatorio) |
| `limit` | string | Registros por pagina (obligatorio, max 100) |
| `order` | ASC/DESC | Direccion de ordenamiento (obligatorio) |
| `status` | string (opcional) | Filtrar por estado |
| `search` | string (opcional) | Texto de busqueda |

### Permisos (RBAC)

El sistema de permisos usa el enum `Permission` con la siguiente estructura:

| Permiso | Descripcion |
|---------|-------------|
| `SUPER` | Super administrador - bypass total |
| `USER` | Acceso base a modulo usuarios |
| `USER_PROFILE` | Ver/editar perfil propio |
| `USER_ADD` | Crear usuarios |
| `USER_READ` | Listar usuarios |
| `USER_READ_ONE` | Ver usuario especifico |
| `USER_UPDATE` | Actualizar usuarios |
| `USER_DELETE` | Eliminar usuarios |
| `ROL` | Acceso base a modulo roles |
| `ROL_ADD` | Crear roles |
| `ROL_READ` | Listar roles |
| `ROL_READ_ONE` | Ver rol especifico |
| `ROL_UPDATE` | Actualizar roles |
| `ROL_DELETE` | Eliminar roles |
| `AUDIT` | Acceso base a modulo auditoria |
| `AUDIT_READ` | Leer registros de auditoria |
| `AUDIT_DELETE` | Eliminar registros de auditoria |
| `DASHBOARD` | Acceso base a dashboard |
| `DASHBOARD_DASHBOARD` | Ver datos del dashboard |

### Swagger

La documentacion interactiva OpenAPI esta disponible en:

- **Local**: `http://localhost:3000/doc`
- **Produccion**: `http://tu-dominio.com/doc`
