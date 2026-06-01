# Modulo de Health Checks

## Descripcion

Proporciona endpoints para monitorear el estado del sistema: base de datos, Redis, uso de memoria heap y salud general del sistema (CPU y memoria).

## Arquitectura

```
HealthController
  |-- SequelizeHealthIndicator   -> Ping a la base de datos PostgreSQL
  |-- RedisHealthIndicator       -> Ping a Redis via cache-manager
  |-- MemoryHealthIndicator      -> Verificar heap de Node.js
  |-- SystemHealthIndicator      -> Verificar CPU y memoria del sistema
```

## Health Indicators

### SequelizeHealthIndicator

- Verifica la conexion a PostgreSQL ejecutando un ping via Sequelize
- Timeout: 3000ms

### RedisHealthIndicator

- Verifica la conexion a Redis escribiendo y leyendo una clave de prueba
- Mide el tiempo de respuesta

### MemoryHealthIndicator

- Verifica que el heap de Node.js no exceda los 300MB

### SystemHealthIndicator

- Verifica la carga de CPU (promedio / nucleos < 2.0)
- Verifica el uso de memoria del sistema (< 90%)

## Endpoint

### GET /api/health

Obtiene el estado de salud de todos los componentes del sistema.

**Auth:** No requiere autenticacion

**Respuesta exitosa:**
```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    },
    "redis": {
      "status": "up",
      "responseTime": 5
    },
    "heap_used": {
      "status": "up",
      "used": "150MB",
      "limit": "300MB"
    },
    "system": {
      "status": "up",
      "cpu": 0.25,
      "memory": 45.5
    }
  },
  "error": {},
  "details": {
    "database": { "status": "up" },
    "redis": { "status": "up", "responseTime": 5 },
    "heap_used": { "status": "up" },
    "system": { "status": "up", "cpu": 0.25, "memory": 45.5 }
  }
}
```

**Respuesta con errores:**
```json
{
  "status": "error",
  "info": {},
  "error": {
    "redis": {
      "status": "down",
      "message": "Redis check failed: ..."
    }
  },
  "details": {
    "database": { "status": "up" },
    "redis": { "status": "down", "message": "Redis check failed: ..." },
    "heap_used": { "status": "up" },
    "system": { "status": "up", "cpu": 0.25, "memory": 45.5 }
  }
}
```

## Docker Healthcheck

En produccion, Docker usa este endpoint para verificar la salud del contenedor:

```yaml
healthcheck:
  test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/health"]
  interval: 30s
  timeout: 5s
  retries: 3
```
