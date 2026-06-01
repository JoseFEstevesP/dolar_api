# Modulo de Archivos (Files)

## Descripcion

Gestion de subida y eliminacion de archivos. Soporta dos tipos: imagenes y documentos. Los archivos se almacenan en el sistema de archivos local bajo el directorio `uploads/`.

## Arquitectura

```
FilesController
  |-- SaveFileUseCase   -> Guardar archivo en disco
  |-- DeleteFileUseCase -> Eliminar archivo del disco
```

## Endpoints

### POST /api/files/upload

Sube un archivo al servidor.

**Method:** `POST` (multipart/form-data)

**Parametros:**
- `file` (archivo): El archivo a subir
- `type` (string): Tipo de archivo - `"image"` o `"document"`

**Respuesta exitosa:**
```json
{
  "filename": "uuid-nombre-archivo.ext",
  "message": "Archivo subido exitosamente."
}
```

**Codigos de error:**
| Codigo | Descripcion |
|--------|-------------|
| 400 | Archivo no proporcionado, tipo no especificado, o tipo invalido |

---

### DELETE /api/files/delete

Elimina un archivo del servidor.

**Parametros de consulta:**
- `filename` (string): Nombre del archivo a eliminar
- `type` (string): Tipo de archivo - `"image"` o `"document"`

**Respuesta exitosa:**
```json
{
  "deleted": true,
  "message": "Archivo eliminado exitosamente."
}
```

**Codigos de error:**
| Codigo | Descripcion |
|--------|-------------|
| 400 | Nombre de archivo o tipo no especificado |
| 404 | Archivo no encontrado |

## Archivos Estaticos

Los archivos se sirven estaticamente via `@nestjs/serve-static`:

- **Imagenes:** `/images/*`
- **Documentos:** `/documents/*`
