export const globalMsg = {
	userUnauthorized: 'Usuario no autorizado',
	throttler: 'Demasiadas solicitudes. Intente de nuevo más tarde.',
	dto: {
		arrayValue: 'Este valor debe ser un array',
		uid: {
			valid: 'El campo UID no es un UUID válido',
			empty: 'El campo UID no puede estar vacío',
		},
		empty: 'Este campo no puede estar vacío',
		defined: 'Este campo no está definido',
		stringValue: 'Este campo debe ser de tipo cadena de texto',
		arrayStringValue: 'Este campo debe ser un array de cadenas de texto',
		status: 'Este campo debe ser de tipo booleano',
		enumValue: 'Valor no válido',
		lengthValue: 'Este campo debe tener entre 3 y 255 caracteres',
	},
	log: {
		recoveryPassword:
			'Se envió el correo para recuperar la contraseña a la dirección:',
		activatedAccount:
			'Se envió el correo para la activación de la cuenta a la dirección:',
	},
	swagger: {
		title: 'API REST - Gestión de Usuarios',
		description: `
## Acerca de la API

Esta API proporciona endpoints para la gestión de usuarios, autenticación y control de acceso.

### Autenticación

La API utiliza JWT (JSON Web Tokens) para la autenticación. Para acceder a endpoints protegidos:

1. Iniciar sesión con \`POST /api/auth/login\` para obtener tokens de acceso
2. Incluir el token en el header: \`Authorization: Bearer <access_token>\`
3. El token de acceso expira según configuración del servidor
4. Usar \`POST /api/auth/refresh-token\` para renovar el token

### Versionado

- **v1**: Versión actual de la API
- El versionado se indica en la URL: \`/api/v1/...\`

### Códigos de Estado

| Código | Descripción |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - Autenticación requerida |
| 403 | Forbidden - Acceso denegado |
| 404 | Not Found - Recurso no encontrado |
| 429 | Too Many Requests - Rate limit excedido |
| 500 | Internal Server Error - Error del servidor |

### Rate Limiting

La API implementa rate limiting con los siguientes límites:
- **Cortos**: 100 petitions/60s (consultas generales)
- **Medios**: 50 petitions/5min (búsquedas)
- **Largos**: 20 petitions/10min (operaciones pesadas)
- **Auth**: 5 petitions/15min (autenticación)

### Errores Comunes

\`\`\`json
{
  "statusCode": 400,
  "message": "El correo electrónico es requerido",
  "error": "Bad Request"
}
\`\`\`
		`,
		version: '1.0.0',
		contact: {
			name: 'Soporte API',
			email: 'soporte@ejemplo.com',
		},
		license: {
			name: 'MIT',
			url: 'https://opensource.org/licenses/MIT',
		},
		tags: {
			user: {
				name: 'User',
				description: 'Gestión de usuarios - Endpoints para CRUD de usuarios',
			},
			rol: {
				name: 'Rol',
				description: 'Gestión de roles y permisos - Control de acceso',
			},
			audit: {
				name: 'Audit',
				description: 'Registros de auditoría - Historial de acciones',
			},
			auth: {
				name: 'Auth',
				description: 'Autenticación - Login, logout, refresh token',
			},
			files: {
				name: 'Files',
				description: 'Gestión de archivos - Subida y descarga',
			},
			health: {
				name: 'Health',
				description: 'Estado del sistema - Health checks',
			},
		},
	},
	docs: {
		generateSuccess: 'Documentación generada en docs/swagger/swagger-spec.json',
	},
};
