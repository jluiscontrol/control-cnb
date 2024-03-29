import permisos from '../models/permisos.Model.js'


export const createPermisos = async (req, res) => {

      try {
        // Extrae los datos del cuerpo de la solicitud
        const { id_rol, id_usuario, entidad, accion, permitido } = req.body;
    
        // Llama a la función insertOrUpdatePermiso con los datos proporcionados
        const nuevoPermiso = await permisos.insertOrUpdatePermiso(id_rol,id_usuario, entidad, accion, permitido);
    
        // Envía una respuesta con el nuevo permiso insertado o actualizado
        res.status(200).json(nuevoPermiso);
      } catch (error) {
        if (error.message.includes(`Error al insertar o actualizar permiso: ${error.message}`)) {
          return res.status(400).json({ error: error.message });
        }
        // Maneja los errores y envía una respuesta de error al cliente
        res.status(500).json({ error: error.message });
      }
}