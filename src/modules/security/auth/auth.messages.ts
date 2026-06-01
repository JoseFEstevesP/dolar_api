import { userMessages } from '../user/user.messages';

export const authMessages = {
	// General messages
	credential: 'Credenciales no válidos.',
	loginSuccess: 'Sesión iniciada exitosamente.',
	findOne: 'No se ha encontrado ningún usuario.',
	logout: 'Sesión cerrada exitosamente.',
	userError: 'Usuario no encontrado.',
	refreshToken: 'No se encontró el token de refresco.',
	throttler: 'Demasiadas solicitudes. Intente de nuevo más tarde.',
	notAuthenticated: 'Sesión no autenticada.',

	// Log messages
	log: {
		login: 'Iniciando sesión...',
		loginSuccess: 'Sesión iniciada exitosamente...',
		logout: 'Cerrando sesión...',
		logoutSuccess: 'Sesión cerrada exitosamente...',
		sessionExisting: 'Sesión existente...',
		loginPassword: 'Contraseña de inicio de sesión no encontrada...',
		userError: 'Usuario no encontrado...',
		refreshTokenUser: 'El token no es igual al token actual.',
		refreshToken: 'Token de refresco no encontrado...',
	},
	msg: {
		loginSuccess: 'Sesión iniciada exitosamente.',
		...userMessages.msg,
	},
};
