# Dolar API

API para consultar las tasas de cambio publicadas por el Banco Central de Venezuela (BCV).

## Tabla de Contenidos

- [Dolar API](#dolar-api)
  - [Tabla de Contenidos](#tabla-de-contenidos)
  - [Monedas Soportadas](#monedas-soportadas)
  - [Endpoints](#endpoints)
    - [GET /api/exchange-rate/current](#get-apiexchange-ratecurrent)
    - [GET /api/exchange-rate/current/:currency](#get-apiexchange-ratecurrentcurrency)
    - [GET /api/exchange-rate/date/:date](#get-apiexchange-ratedatedate)
    - [GET /api/exchange-rate/history](#get-apiexchange-ratehistory)
    - [GET /api/exchange-rate/convert](#get-apiexchange-rateconvert)
    - [GET /api/exchange-rate/last-update](#get-apiexchange-ratelast-update)
    - [GET /api/health](#get-apihealth)
  - [Cron Job](#cron-job)
  - [Persistencia y Rotación](#persistencia-y-rotación)
  - [Inicio Rápido](#inicio-rápido)
    - [Requisitos](#requisitos)
    - [Instalación](#instalación)
    - [Desarrollo](#desarrollo)
    - [Producción](#producción)
  - [Docker](#docker)
  - [Variables de Entorno](#variables-de-entorno)
  - [Documentación Swagger](#documentación-swagger)

## Monedas Soportadas

| Código | Moneda | ID en BCV |
|--------|--------|-----------|
| `usd` | Dólar estadounidense | `#dolar` |
| `eur` | Euro | `#euro` |
| `cny` | Yuan chino | `#yuan` |
| `try` | Lira turca | `#lira` |
| `rub` | Rublo ruso | `#rublo` |

Todas las tasas están expresadas en VES (Bolívar). Las conversiones entre monedas usan VES como puente.

## Endpoints

### GET /api/exchange-rate/current

Retorna todas las tasas de cambio actuales publicadas por el BCV.

```json
{
  "date": "2026-06-02",
  "rates": {
    "usd": 64.82,
    "eur": 70.15,
    "cny": 9.01,
    "try": 2.15,
    "rub": 0.75
  }
}
```

### GET /api/exchange-rate/current/:currency

Retorna la tasa de una moneda específica.

```json
{
  "date": "2026-06-02",
  "currency": "eur",
  "rate": 70.15
}
```

### GET /api/exchange-rate/date/:date

Retorna las tasas históricas para una fecha específica (formato `YYYY-MM-DD`).

```json
{
  "date": "2026-06-02",
  "rates": {
    "usd": 64.82,
    "eur": 70.15
  },
  "updatedAt": "2026-06-02T17:30:00.000Z"
}
```

### GET /api/exchange-rate/history

Retorna el historial completo de tasas recolectadas.

```json
{
  "count": 45,
  "history": [
    {
      "date": "2026-06-02",
      "rates": {
        "usd": 64.82,
        "eur": 70.15
      },
      "updatedAt": "2026-06-02T17:30:00.000Z"
    }
  ]
}
```

Si hubo eliminación por rotación, incluye un campo `notice`:

```json
{
  "count": 45,
  "history": [],
  "notice": "Registros anteriores a 2026-03-02 fueron eliminados por rotación (30 entradas)"
}
```

### GET /api/exchange-rate/convert

Convierte entre monedas usando VES como puente.

| Parámetro | Descripción | Ejemplo |
|-----------|-------------|---------|
| `from` | Moneda de origen | `usd`, `eur`, `ves` |
| `to` | Moneda de destino | `usd`, `eur`, `ves` |
| `amount` | Monto a convertir | `100` |

```json
{
  "from": "eur",
  "to": "usd",
  "amount": 100,
  "result": 108.22
}
```

### GET /api/exchange-rate/last-update

Retorna metadatos sobre la última actualización exitosa.

```json
{
  "lastDate": "2026-06-02",
  "updatedAt": "2026-06-02T17:30:00.000Z",
  "hasRates": true,
  "currencies": ["usd", "eur", "cny", "try", "rub"]
}
```

### GET /api/health

Estado del servidor.

```json
{
  "status": "ok",
  "uptime": 1234,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "system": {
    "cpu": 0.25,
    "memory": 45.5
  }
}
```

## Cron Job

El cron job se ejecuta automáticamente en el servidor sin intervención manual.

| Característica | Detalle |
|----------------|---------|
| Frecuencia | Cada 15 minutos (`*/15 * * * 1-5`) |
| Días | Lunes a viernes |
| Ventana horaria | 16:30 – 18:00 VET (UTC−4) |
| Condición | Solo persiste si la "Fecha Valor" del BCV cambia |
| Comportamiento | Si falla la conexión, omite silenciosamente y reintenta en 15 min |

## Persistencia y Rotación

- Los datos se almacenan en `data/rates.json` (archivo local, no requiere base de datos externa).
- El historial se acumula con cada nuevo valor de "Fecha Valor" detectado.
- **Rotación automática**: cada vez que se guarda un nuevo registro, se eliminan las entradas con más de 3 meses de antigüedad.
- El endpoint `/history` incluye un campo `notice` cuando se eliminan registros.

## Inicio Rápido

### Requisitos

- Node.js ≥ 20
- pnpm

### Instalación

```bash
pnpm install
```

### Desarrollo

```bash
pnpm dev
```

El servidor inicia en `http://localhost:3000/api`.

### Producción

```bash
pnpm build
pnpm start
```

## Docker

```bash
docker compose up --build
```

## Variables de Entorno

| Variable | Valor por defecto | Descripción |
|----------|-------------------|-------------|
| `PORT` | `3000` | Puerto del servidor |
| `NODE_ENV` | `development` | Entorno (`development`, `production`, `test`) |
| `CORS` | `*` | Origen permitido para CORS |

## Documentación Swagger

Disponible en `http://localhost:3000/doc` (solo en desarrollo).

Para generar el spec JSON:

```bash
pnpm build:dev
```
