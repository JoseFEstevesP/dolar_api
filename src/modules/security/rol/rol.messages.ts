export const rolMessages = {
	// General messages
	findOne: 'No se ha encontrado ningún rol',
	findUserExit:
		'No se puede eliminar ya que un usuario está asignado a este rol',
	register: 'Rol registrado exitosamente',
	update: 'Rol actualizado exitosamente',
	delete: 'Rol eliminado',
	credential: 'Credenciales no válidos.',
	rolError: 'Rol no encontrado.',
	relationError: 'El rol esta relacionado con otros datos',

	// Validation messages
	validation: {
		disability: 'Este rol ya está registrado, pero está deshabilitado',
		default: 'Este rol ya está registrado',
		dto: {
			permission: 'La propiedad de permiso no es válida',
			empty: 'Este campo no puede estar vacío',
			defined: 'Este campo no está definido',
			stringValue: 'Este campo debe ser de tipo cadena de texto',
			enumValue: 'Valor no válido',
			lengthValue: 'Este campo debe tener entre 3 y 255 caracteres',
			arrayValue: 'Este campo debe ser un array',
			status: 'Este campo debe ser de tipo booleano',
			uid: {
				valid: 'El campo UID no es un UUID válido',
				empty: 'El campo UID no puede estar vacío',
			},
		},
	},

	// Log messages
	log: {
		create: 'Creando rol',
		createAut: 'Creando rol automático',
		createAutProcess: 'Proceso para crear rol automático',
		createAutVerify: 'Verificando existencia de rol automático',
		createAutSuccess: 'Rol automático creado exitosamente',
		createSuccess: 'Rol creado exitosamente',
		errorValidator: 'Falló la validación',
		rolError: 'Rol no encontrado',
		findOne: 'Encontrar rol con UID',
		findOneSuccess: 'Rol encontrado exitosamente',
		findAll: 'Encontrar o buscar rol',
		findAllSuccess: 'Rol encontrado o buscado exitosamente',
		update: 'Actualizar rol',
		updateSuccess: 'Rol actualizado exitosamente',
		remove: 'Eliminar rol',
		removeSuccess: 'Rol eliminado exitosamente',
		controller: {
			create: 'Registrando nuevo rol en el controlador con datos',
			login: 'Controlador de inicio de sesión de rol con datos',
			findOne: 'Encontrar controlador de rol con UID',
			findAll: 'Encontrar o buscar controlador de rol',
			valError: 'Error de validación del rol',
			update: 'Actualizar controlador de rol',
			remove: 'Eliminar controlador de rol',
		},
	},
};
