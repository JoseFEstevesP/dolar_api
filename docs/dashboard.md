# Modulo de Dashboard

## Descripcion

Provee datos analiticos y estadisticas para el panel de administracion del sistema.

## Arquitectura

```
DashboardController
  |-- GetDashboardDataUseCase -> Obtener datos agregados del dashboard
```

## Endpoints

### GET /api/dashboard

Obtiene datos estadisticos del sistema para el dashboard administrativo.

**Auth:** JWT + `DASHBOARD_DASHBOARD`

**Respuesta:** `DashboardResponseDTO` con datos como:

```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "activeUsers": 120,
    "inactiveUsers": 30,
    "activatedAccounts": 140,
    "unactivatedAccounts": 10,
    "usersByRole": [
      { "role": "Administrador", "count": 3 },
      { "role": "Usuario", "count": 100 },
      { "role": "Visor", "count": 47 }
    ],
    "activeSessions": 25
  }
}
```

## Permisos

Requiere el permiso `DASHBOARD_DASHBOARD` para acceder.
