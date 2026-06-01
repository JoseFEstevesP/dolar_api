# 🚀 API Nest - Backend Robusto y Escalable

[![Node.js](https://img.shields.io/badge/Node.js-24.6.0+-green.svg)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.1.6-red.svg)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17+-blue.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-8.2.1+-red.svg)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

Una API REST moderna y escalable construida con **NestJS**, diseñada con arquitectura limpia y patrones de casos de uso para proporcionar un backend seguro, mantenible y de alto rendimiento.

## 📋 Tabla de Contenidos

- [🎯 Descripción del Proyecto](#-descripción-del-proyecto)
- [✨ Características Principales](#-características-principales)
- [🛠️ Stack Tecnológico](#%EF%B8%8F-stack-tecnológico)
- [🏗️ Arquitectura](#%EF%B8%8F-arquitectura)
- [⚡ Inicio Rápido](#-inicio-rápido)
- [🔧 Configuración Detallada](#-configuración-detallada)
- [🚀 Ejecución](#-ejecución)
- [📚 Documentación de la API](#-documentación-de-la-api)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [🔐 Seguridad](#-seguridad)
- [📊 Monitoreo y Logging](#-monitoreo-y-logging)
- [🐳 Docker](#-docker)
- [🤝 Contribución](#-contribución)
- [📄 Licencia](#-licencia)
- [🙋‍♂️ Soporte](#%EF%B8%8F-soporte)

## 🎯 Descripción del Proyecto

**API Nest** es una solución backend empresarial que implementa las mejores prácticas de desarrollo moderno. Construida con **arquitectura hexagonal** y **patrón de casos de uso**, ofrece una base sólida para aplicaciones que requieren:

- 🔐 **Autenticación y autorización robusta**
- 👥 **Gestión completa de usuarios y roles**
- 📝 **Sistema de auditoría integral**
- 📁 **Manejo seguro de archivos**
- 🚦 **Rate limiting y caché**
- 🔍 **Logging y monitoreo avanzado**

## ✨ Características Principales

### 🔒 Seguridad Avanzada

- **JWT Authentication** con refresh tokens
- **RBAC** (Control de Acceso Basado en Roles)
- **Rate Limiting** configurable
- **Helmet** para headers de seguridad
- **Validación de datos** con class-validator
- **Hashing seguro** con bcrypt

### 👤 Gestión de Usuarios

- Registro y activación de cuentas
- Recuperación de contraseñas
- Actualización de perfiles
- Gestión de roles y permisos
- Soft delete y reactivación

### 📊 Auditoría y Monitoreo

- Registro automático de acciones
- Logs estructurados con Winston
- Correlación de requests
- Health checks
- Métricas de rendimiento

### 🗄️ Gestión de Datos

- **PostgreSQL** como base de datos principal
- **Redis** para caché y sesiones
- **Sequelize ORM** con TypeScript
- Migraciones automáticas
- Transacciones seguras

### 📁 Gestión de Archivos

- Subida segura de archivos
- Validación de tipos y tamaños
- Almacenamiento organizado
- Eliminación automática

## 🛠️ Stack Tecnológico

### Backend Core

- **[NestJS](https://nestjs.com/)** - Framework Node.js progresivo
- **[TypeScript](https://www.typescriptlang.org/)** - Tipado estático
- **[Express](https://expressjs.com/)** - Servidor HTTP

### Base de Datos

- **[PostgreSQL](https://www.postgresql.org/)** - Base de datos relacional
- **[Sequelize](https://sequelize.org/)** - ORM con TypeScript
- **[Redis](https://redis.io/)** - Caché y almacén de sesiones

### Autenticación y Seguridad

- **[JWT](https://jwt.io/)** - JSON Web Tokens
- **[Passport](http://www.passportjs.org/)** - Estrategias de autenticación
- **[Bcrypt](https://www.npmjs.com/package/bcrypt)** - Hashing de contraseñas
- **[Helmet](https://helmetjs.github.io/)** - Headers de seguridad

### Herramientas de Desarrollo

- **[SWC](https://swc.rs/)** - Compilador rápido
- **[Oxlint](https://oxc-project.github.io/)** - Linter ultra-rápido
- **[Prettier](https://prettier.io/)** - Formateador de código
- **[Husky](https://typicode.github.io/husky/)** - Git hooks

### DevOps y Contenedores

- **[Docker](https://www.docker.com/)** - Contenedorización
- **[Docker Compose](https://docs.docker.com/compose/)** - Orquestación local
- **[pnpm](https://pnpm.io/)** - Gestor de paquetes eficiente

## 🏗️ Arquitectura

### Patrón de Casos de Uso (Use Cases)

El proyecto implementa **Clean Architecture** con el patrón de casos de uso, proporcionando:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Controllers   │───▶│   Use Cases     │───▶│  Repositories   │
│   (HTTP Layer)  │    │ (Business Logic)│    │  (Data Layer)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Beneficios:**

- ✅ **Responsabilidad única** por caso de uso
- ✅ **Testabilidad** mejorada
- ✅ **Mantenibilidad** a largo plazo
- ✅ **Desacoplamiento** de capas
- ✅ **Reutilización** de lógica de negocio

### Estructura Modular

```
src/
├── modules/
│   ├── security/           # Módulos de seguridad
│   │   ├── auth/          # Autenticación
│   │   ├── user/          # Gestión de usuarios
│   │   ├── rol/           # Gestión de roles
│   │   └── audit/         # Auditoría
│   ├── files/             # Gestión de archivos
│   └── health/            # Health checks
├── config/                # Configuración
├── services/              # Servicios globales
├── middlewares/           # Middlewares
├── interceptors/          # Interceptores
└── filters/               # Filtros de excepción
```

## ⚡ Inicio Rápido

### Prerrequisitos

- **Node.js** ≥ 24.6.0
- **pnpm** ≥ 10.14.0
- **Docker** y **Docker Compose**

### Instalación Express

```bash
# 1. Clonar el repositorio
git clone https://github.com/JoseFEstevesP/api-nest
cd api-nest

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# 4. Levantar servicios con Docker
docker compose up -d

# 5. Ejecutar migraciones
pnpm run migrate

# 6. Iniciar en modo desarrollo
pnpm run dev
```

🎉 **¡Listo!** La API estará disponible en `http://localhost:3000/api`

## 🔧 Configuración Detallada

### Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```env
# Servidor
PORT=3000
NODE_ENV=development
CORS=http://localhost:5173

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_REFRESH_SECRET=tu_refresh_secret_super_seguro

# Base de Datos
DATABASE_DIALECT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=tu_password_seguro
POSTGRES_DB=api_nest_db

# Redis
REDIS_POST=6379
REDIS_URL=redis://localhost:6379

# Email (para recuperación de contraseñas)
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password

# Rate Limiting
RATE_LIMIT_TTL=60000
RATE_LIMIT_LIMIT=100

# Configuración de Usuario
DEFAULT_ROL_FROM_USER=user
```

### Configuración de Base de Datos

#### Opción 1: Docker (Recomendado)

```bash
# Iniciar PostgreSQL y Redis
docker compose up -d db redis

# Verificar que los servicios estén corriendo
docker compose ps
```

#### Opción 2: Instalación Local

Si prefieres instalar PostgreSQL y Redis localmente:

```bash
# PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Redis (Ubuntu/Debian)
sudo apt install redis-server

# Crear base de datos
sudo -u postgres createdb api_nest_db
```

### Migraciones

```bash
# Ejecutar migraciones
pnpm run migrate

# Crear nueva migración
pnpm run migrate:create nombre-de-la-migracion

# Revertir última migración
pnpm run migrate:undo

# Revertir todas las migraciones
pnpm run migrate:undo:all
```

## 🚀 Ejecución

### Desarrollo

```bash
# Modo desarrollo con hot reload
pnpm run dev

# Modo debug
pnpm run start:debug
```

### Producción

```bash
# Compilar para producción
pnpm run build

# Ejecutar versión compilada
pnpm run start:prod
```

### Docker

Usa la variable `NODE_ENV` para seleccionar el modo:

```bash
# Desarrollo (sin Nginx)
docker compose up -d

# Producción (con Nginx)
NODE_ENV=production docker compose --profile prod up -d

# O usa el script helper (automático)
./docker-compose.sh up -d              # Desarrollo
NODE_ENV=production ./docker-compose.sh up -d  # Producción
```

**Scripts disponibles:**

- `./docker-compose.sh up -d` - Inicia servicios
- `./docker-compose.sh down` - Detiene servicios
- `./docker-compose.sh logs -f` - Ver logs
- `docker compose --profile migrate up -d` - Ejecutar migraciones

## 📚 Documentación de la API

### Documentación Detallada por Módulo

Consulta la documentación específica de cada módulo en la carpeta `docs/`:

| Módulo        | Descripción                | Archivo                            |
| ------------- | -------------------------- | ---------------------------------- |
| Autenticación | JWT, OAuth, Refresh Tokens | [`docs/auth.md`](docs/auth.md)     |
| Usuarios      | CRUD, roles, perfiles      | [`docs/user.md`](docs/user.md)     |
| Roles         | Permisos, RBAC             | [`docs/rol.md`](docs/rol.md)       |
| Auditoría     | Logs, tracking             | [`docs/audit.md`](docs/audit.md)   |
| Archivos      | Upload, validación         | [`docs/files.md`](docs/files.md)   |
| Health        | Health checks              | [`docs/health.md`](docs/health.md) |

### Guía de Uso

Consulta [`docs/README.md`](docs/README.md) para una visión general de toda la documentación.

### Swagger/OpenAPI

La documentación interactiva está disponible en:

- **Desarrollo**: `http://localhost:3000/doc`
- **Producción**: `https://tu-dominio.com/doc`

### Endpoints Principales

#### 🔐 Autenticación (`/auth`)

| Método | Endpoint              | Descripción    | Auth |
| ------ | --------------------- | -------------- | ---- |
| `POST` | `/auth/login`         | Iniciar sesión | ❌   |
| `POST` | `/auth/logout`        | Cerrar sesión  | ✅   |
| `POST` | `/auth/refresh-token` | Renovar token  | ✅   |

#### 👤 Usuarios (`/user`)

| Método   | Endpoint                   | Descripción           | Auth | Permisos |
| -------- | -------------------------- | --------------------- | ---- | -------- |
| `POST`   | `/user`                    | Registro público      | ❌   | -        |
| `POST`   | `/user/protect`            | Crear usuario (admin) | ✅   | Admin    |
| `GET`    | `/user`                    | Listar usuarios       | ✅   | Admin    |
| `GET`    | `/user/profile`            | Perfil actual         | ✅   | User     |
| `PATCH`  | `/user/profile/data`       | Actualizar perfil     | ✅   | User     |
| `PATCH`  | `/user/profile/email`      | Cambiar email         | ✅   | User     |
| `PATCH`  | `/user/profile/password`   | Cambiar contraseña    | ✅   | User     |
| `DELETE` | `/user/profile/unregister` | Desactivar cuenta     | ✅   | User     |
| `POST`   | `/user/recoveryPassword`   | Recuperar contraseña  | ❌   | -        |
| `POST`   | `/user/activated`          | Activar cuenta        | ❌   | -        |

#### 🛡️ Roles (`/rol`)

| Método   | Endpoint           | Descripción          | Auth | Permisos |
| -------- | ------------------ | -------------------- | ---- | -------- |
| `POST`   | `/rol`             | Crear rol            | ✅   | Admin    |
| `GET`    | `/rol`             | Listar roles         | ✅   | Admin    |
| `GET`    | `/rol/per`         | Permisos del usuario | ✅   | User     |
| `PATCH`  | `/rol`             | Actualizar rol       | ✅   | Admin    |
| `DELETE` | `/rol/delete/:uid` | Eliminar rol         | ✅   | Admin    |

#### 📊 Auditoría (`/audit`)

| Método   | Endpoint             | Descripción       | Auth | Permisos |
| -------- | -------------------- | ----------------- | ---- | -------- |
| `GET`    | `/audit`             | Logs de auditoría | ✅   | Admin    |
| `DELETE` | `/audit/delete/:uid` | Eliminar log      | ✅   | Admin    |

#### 📁 Archivos (`/files`)

| Método   | Endpoint        | Descripción      | Auth |
| -------- | --------------- | ---------------- | ---- |
| `POST`   | `/files/upload` | Subir archivo    | ✅   |
| `DELETE` | `/files/delete` | Eliminar archivo | ✅   |

### Ejemplos de Uso

#### Autenticación

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "password123"
  }'

# Respuesta
{
  "statusCode": 200,
  "message": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "uid": "uuid-del-usuario",
      "email": "usuario@ejemplo.com",
      "name": "Usuario Ejemplo"
    }
  }
}
```

#### Crear Usuario

```bash
# Registro público
curl -X POST http://localhost:3000/api/user \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nuevo Usuario",
    "email": "nuevo@ejemplo.com",
    "password": "password123"
  }'
```

### Estructura de Tests

```
test/
├── unit/                  # Tests unitarios
│   ├── services/
│   ├── use-cases/
│   └── repositories/
├── integration/           # Tests de integración
└── e2e/                  # Tests end-to-end
```

## 📁 Estructura del Proyecto

```
api-nest/
├── src/
│   ├── modules/                    # Módulos de la aplicación
│   │   ├── security/              # Módulos de seguridad
│   │   │   ├── auth/              # Autenticación y autorización
│   │   │   │   ├── dto/           # Data Transfer Objects
│   │   │   │   ├── guards/        # Guards de autenticación
│   │   │   │   ├── strategies/    # Estrategias de Passport
│   │   │   │   ├── use-case/      # Casos de uso
│   │   │   │   └── *.controller.ts
│   │   │   ├── user/              # Gestión de usuarios
│   │   │   │   ├── dto/
│   │   │   │   ├── entities/      # Modelos de Sequelize
│   │   │   │   ├── repository/    # Repositorios
│   │   │   │   ├── use-case/      # Casos de uso
│   │   │   │   └── *.controller.ts
│   │   │   ├── rol/               # Gestión de roles
│   │   │   ├── audit/             # Sistema de auditoría
│   │   │   └── valid-permission/  # Guards de permisos
│   │   ├── files/                 # Gestión de archivos
│   │   └── health/                # Health checks
│   ├── config/                    # Configuración
│   ├── services/                  # Servicios globales
│   │   ├── logger.service.ts      # Servicio de logging
│   │   ├── email.service.ts       # Servicio de email
│   │   └── config.service.ts      # Configuración
│   ├── middlewares/               # Middlewares globales
│   ├── interceptors/              # Interceptores
│   ├── filters/                   # Filtros de excepción
│   ├── functions/                 # Funciones utilitarias
│   ├── dto/                       # DTOs globales
│   ├── migrations/                # Migraciones de BD
│   ├── app.module.ts              # Módulo principal
│   └── main.ts                    # Punto de entrada
├── logs/                          # Archivos de log
├── uploads/                       # Archivos subidos
├── scripts/                       # Scripts de utilidad
├── docker-compose.yml             # Configuración Docker
├── dockerfile                     # Imagen Docker
└── README.md                      # Este archivo
```

### Convenciones de Nomenclatura

- **Archivos**: `kebab-case.extension.ts`
- **Clases**: `PascalCase`
- **Variables/Funciones**: `camelCase`
- **Constantes**: `UPPER_SNAKE_CASE`
- **Interfaces**: `IPascalCase`
- **Enums**: `EPascalCase`

## 🔐 Seguridad

### Medidas Implementadas

#### Autenticación y Autorización

- **JWT** con tokens de acceso y refresh
- **Estrategia Passport** para validación
- **Guards personalizados** para protección de rutas
- **RBAC** granular por endpoint

#### Protección de Datos

- **Hashing bcrypt** para contraseñas
- **Validación estricta** de entrada
- **Sanitización** de datos
- **Headers de seguridad** con Helmet

#### Rate Limiting

```typescript
// Configuración por defecto
{
  ttl: 60000,    // 1 minuto
  limit: 100     // 100 requests por minuto
}
```

#### Logging de Seguridad

- Registro de intentos de login
- Auditoría de acciones sensibles
- Detección de patrones sospechosos

### Mejores Prácticas

1. **Nunca hardcodear secretos** - Usar variables de entorno
2. **Validar toda entrada** - DTOs con class-validator
3. **Principio de menor privilegio** - Permisos mínimos necesarios
4. **Logs de auditoría** - Registrar acciones importantes
5. **Actualizaciones regulares** - Mantener dependencias actualizadas

## 📊 Monitoreo y Logging

### Sistema de Logging

#### Configuración Winston

```typescript
// Niveles de log
{
  error: 0,    // Errores críticos
  warn: 1,     // Advertencias
  info: 2,     // Información general
  debug: 3     // Información de debug
}
```

#### Archivos de Log

```
logs/
├── all/         # Todos los logs
├── error/       # Solo errores
└── info/        # Información general
```

#### Correlación de Requests

Cada request tiene un ID único para facilitar el debugging:

```
[2025-01-15 10:30:45] INFO [CorrelationId: abc-123-def] User login attempt: user@example.com
[2025-01-15 10:30:45] INFO [CorrelationId: abc-123-def] Login successful for user: user@example.com
```

### Health Checks

Endpoint de salud disponible en `/health`:

```json
{
	"status": "ok",
	"info": {
		"database": { "status": "up" },
		"redis": { "status": "up" }
	}
}
```

### Métricas

- **Response time** por endpoint
- **Error rate** por módulo
- **Throughput** de requests
- **Uso de memoria** y CPU

## 🐳 Docker

### Desarrollo

```bash
# Levantar solo servicios de infraestructura
docker compose up -d db redis

# Desarrollo completo con Docker
docker compose -f docker-compose.dev.yml up
```

### Producción

```bash
# Construir y ejecutar
docker compose up --build

# En background
docker compose up -d
```

### Configuración Docker

#### Dockerfile Multi-stage

```dockerfile
# Build stage
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN pnpm install
COPY . .
RUN pnpm run build

# Production stage
FROM node:24-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### Conventional Commits

```bash
# Ejemplos
feat: add user profile update endpoint
fix: resolve JWT token validation issue
docs: update API documentation
test: add unit tests for user service
refactor: improve error handling in auth module
```

### Scripts de Desarrollo

```bash
# Linting
pnpm run lint          # Verificar código
pnpm run lint:fix      # Corregir automáticamente

# Formateo
pnpm run format        # Formatear código

# Pre-commit hooks
pnpm run lintStaged    # Ejecutar en archivos staged
```

### Generación de Módulos

```bash
# Generar módulo básico (solo controller y module, como health)
pnpm run module:generate:basic nombre-del-modulo

# Generar módulo estándar (controller, messages, module, use-cases, como files)
pnpm run module:generate:standard nombre-del-modulo

# Generar módulo completo (estructura completa con DTOs, entities, etc.)
pnpm run module:generate nombre-del-modulo
# o
pnpm run module:generate:complete nombre-del-modulo
```

Tipos de módulos:

**Básico** (`--basic`):
- Controller
- Module

**Estándar** (`--standard`):
- Controller
- Messages
- Module
- Use cases básicos

**Completo** (default, `--complete`):
- Controller
- Messages
- Module
- DTOs (5 archivos)
- Entity
- Enums
- Repository
- Use cases (5 archivos)
- Migración automática
- Actualización de permisos

---

## 🧪 Testing

### Ejecutar Tests

```bash
# Tests unitarios y de integración
pnpm test

# Tests con configuración completa (genera .env.test si no existe)
pnpm test:all

# Tests en modo watch
pnpm test:watch

# Tests con coverage
pnpm test:cov
```

### Configuración de Tests

- **Framework**: Vitest
- **Configuración**: `vitest.config.ts`
- **Setup**: `test/setup-vitest.ts`

### Cobertura de Tests

```
test/
├── unit/                    # Tests unitarios
│   ├── functions/          # Funciones utilitarias
│   ├── files.usecases.spec.ts
│   ├── user.usecases.spec.ts
│   ├── rol.usecases.spec.ts
│   ├── audit.usecases.spec.ts
│   ├── user.repository.spec.ts
│   ├── valid-permission.spec.ts
│   └── health.controller.spec.ts
└── integration/            # Tests de integración (skipped)
    ├── auth.usecases.integration.spec.ts
    ├── audit.usecases.integration.spec.ts
    ├── rol.repository.integration.spec.ts
    └── user.repository.integration.spec.ts
```

**Resultados actuales:**

- ✅ 221 tests passing
- ⏭️ 51 tests skipped (integration tests)

---

## ⚙️ Mejoras Recientes

### 1. Optimización de Consultas de Base de Datos

**Paginación mejorada:**

- Límite máximo de 100 registros por página
- Validación de página mínima (1)
- Implementado en: `findAllUsers`, `findAllRols`, `findAllAudits`

**Índices compuestos agregados:**

```sql
-- Users
idx_user_status_rol (status + uidRol)
idx_user_status_active (status + activatedAccount)

-- Audit
idx_audit_user_created (uidUser + createdAt)
```

### 2. Control de Tasa (Rate Limiting)

**Múltiples niveles configurados:**

| Nombre   | TTL   | Límite | Uso                  |
| -------- | ----- | ------ | -------------------- |
| `short`  | 60s   | 100    | Endpoints generales  |
| `medium` | 5min  | 50     | Consultas frecuentes |
| `long`   | 10min | 20     | Operaciones lentas   |
| `auth`   | 15min | 5      | Login, recovery      |

**Decoradores disponibles:**

```typescript
@ThrottleShort()   // Rate limit estándar
@ThrottleMedium()  // Rate limit moderado
@ThrottleLong()   // Rate limit estricto
@ThrottleAuth()   // Rate limit para auth
@ThrottleStrict() // Rate limit muy estricto
```

### 3. Seguridad Mejorada

**Helmet configurado:**

- Content Security Policy (CSP)
- HSTS (HTTP Strict Transport Security)
- X-Content-Type-Options
- Referrer Policy
- Frameguard (previene clickjacking)

**Pipe de sanitización:**

- Elimina scripts maliciosos
- Elimina protocolos javascript: y data:
- Elimina event handlers (onclick, onload, etc.)

### 4. Monitoreo y Health Checks

**Endpoint `GET /api/health` retorna:**

```json
{
	"status": "ok",
	"details": {
		"database": { "status": "up", "responseTime": 15 },
		"redis": { "status": "up", "responseTime": 5 },
		"heap_used": { "status": "up", "used": "150MB", "limit": "300MB" },
		"system": { "status": "up", "cpu": 0.45, "memory": 65.2 }
	}
}
```

**Health Indicators personalizados:**

- `RedisHealthIndicator` - Verifica Redis
- `SystemHealthIndicator` - CPU y memoria
- `MemoryHealthIndicator` - Heap de Node.js

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 🙋‍♂️ Soporte

¿Tienes preguntas o necesitas ayuda?

- 📧 **Email**: [joseesteves199930@gmail.com](mailto:tu-email@ejemplo.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/JoseFEstevesP/api-nest/issues)

---

<div align="center">

**Hecho con ❤️ y ☕ por [José Esteves](https://github.com/JoseFEstevesP)**

⭐ ¡No olvides dar una estrella si te gustó el proyecto!

</div>
