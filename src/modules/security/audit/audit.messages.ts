export const auditMessages = {
	// General messages
	findOne: 'No se ha encontrado ningún registro de auditoría',
	register: 'Registro de auditoría creado exitosamente',
	update: 'Registro de auditoría actualizado exitosamente',
	remove: 'Registro de auditoría eliminado',
	relationError: 'El registro de auditoría esta relacionado con otros datos',

	// Validation messages
	validation: {
		disabled: 'Este registro de auditoría existe pero está deshabilitado',
		default: 'Este registro de auditoría ya existe',
		dto: {
			uidUser: 'El UID de usuario no es válido',
			refreshToken: 'El token de refresco no es válido',
			dataToken: 'Los datos del token no son válidos',
			status: 'El estado debe ser un valor booleano',
			// Add other common DTO validation messages if needed, e.g., from globalMsg
			empty: 'Este campo no puede estar vacío',
			defined: 'Este campo no está definido',
			stringValue: 'Este campo debe ser de tipo cadena de texto',
			enumValue: 'Valor no válido',
			lengthValue: 'Este campo debe tener entre 3 y 255 caracteres',
			uid: {
				valid: 'El campo UID no es un UUID válido',
				empty: 'El campo UID no puede estar vacío',
			},
		},
	},

	// Log messages
	log: {
		relationError: 'El registro de auditoría esta relacionado con otros datos',
		getTokenData: 'Obteniendo datos de token de auditoría',
		getTokenDataSuccess: 'Datos de token obtenidos exitosamente',
		create: 'Creando registro de auditoría',
		createSuccess: 'Registro de auditoría creado exitosamente',
		errorValidator: 'Error de validación de auditoría',
		error: 'Registro de auditoría no encontrado',
		findOne: 'Buscando registro de auditoría con UID',
		findOneSuccess: 'Registro de auditoría encontrado exitosamente',
		findAll: 'Buscando registros de auditoría',
		findAllSuccess: 'Registros de auditoría encontrados exitosamente',
		update: 'Actualizando registro de auditoría',
		updateSuccess: 'Registro de auditoría actualizado exitosamente',
		remove: 'Eliminando registro de auditoría',
		removeSuccess: 'Registro de auditoría eliminado exitosamente',
		findByUser: 'Buscando auditorías por usuario',
		findByUserSuccess: 'Auditorías por usuario encontradas exitosamente',
		controller: {
			getTokenData: 'Obteniendo datos de token desde controlador',
			create: 'Registrando nuevo controlador de auditoría',
			findOne: 'Buscando controlador con UID para auditoría',
			findAll: 'Buscando controlador de registros de auditoría',
			valError: 'Error de validación de auditoría',
			update: 'Actualizando controlador de auditoría',
			remove: 'Eliminando controlador de auditoría',
			findByUser: 'Buscando auditorías por usuario desde controlador',
			getOne: 'Obteniendo auditoría desde controlador',
		},
	},

	// Error messages (from service)
	errorService: {
		create: 'Error al crear auditoría',
		notFound: 'No se ha encontrado ningún registro de auditoría',
		update: 'Error al actualizar auditoría',
		remove: 'Error al eliminar auditoría',
		findOne: 'Error al buscar auditoría',
		findAll: 'Error al buscar auditorías',
	},
};
