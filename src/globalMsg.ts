export const globalMsg = {
	swagger: {
		title: 'Dolar API - Tasa de Cambio BCV',
		description: `
## Acerca de la API

API para consultar la tasa de cambio publicada por el Banco Central de Venezuela (BCV).

### Monedas Soportadas

- \`usd\` — Dólar estadounidense
- \`eur\` — Euro
- \`cny\` — Yuan chino
- \`try\` — Lira turca
- \`rub\` — Rublo ruso

### Endpoints

- \`GET /api/exchange-rate/current\` — Todas las tasas actuales
- \`GET /api/exchange-rate/current/:currency\` — Tasa de una moneda específica
- \`GET /api/exchange-rate/date/:date\` — Tasas de una fecha del historial
- \`GET /api/exchange-rate/history\` — Historial completo de tasas
- \`GET /api/exchange-rate/convert?from=USD&to=EUR&amount=100\` — Conversión entre monedas
- \`GET /api/exchange-rate/last-update\` — Información de la última actualización
- \`GET /api/health\` — Estado del servidor

### Conversión

Todas las conversiones usan VES (Bolívar) como moneda puente.

### Rotación de Datos

Los registros del historial mayores a 3 meses son eliminados automáticamente al guardar nuevos datos.
		`,
		version: '1.1.0',
		contact: {
			name: 'Soporte API',
			email: 'soporte@ejemplo.com',
		},
		license: {
			name: 'MIT',
			url: 'https://opensource.org/licenses/MIT',
		},
		tags: {
			exchangeRate: {
				name: 'ExchangeRate',
				description: 'Tasas de cambio del BCV',
			},
			health: {
				name: 'Health',
				description: 'Estado del servidor',
			},
		},
	},
	docs: {
		generateSuccess: 'Documentación generada en docs/swagger/swagger-spec.json',
	},
};
