import permisos from '../models/permisos.Model.js'


export const createPermisos = async (req, res) => {

      try {
        // Extrae los datos del cuerpo de la solicitud
        const { id_usuario, estado, id_listapermisos } = req.body;
    
        // Llama a la función insertOrUpdatePermiso con los datos proporcionados
        const nuevoPermiso = await permisos.insertOrUpdatePermiso(id_usuario, estado, id_listapermisos);
    
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

export const getPermisos = async (req, res) => {
    try {
        // Llama a la función getAllPermisos para obtener todos los permisos
        const listapermisos = await permisos.getAllPermisos();
        
        // Envía una respuesta con todos los permisos
        res.status(200).json(listapermisos);
    } catch (error) {
        // Maneja los errores y envía una respuesta de error al cliente
        res.status(500).json({ error: error.message });
    }
}

export const getPermisosUsuario = async (req, res) => {
    try {   
        // Llama a la función getPermisosUsuario con el id_usuario proporcionado
        const permisosUsuario = await permisos.getPermisosUsuario(req.params.id_usuario);
        // Envía una respuesta con los permisos del usuario
        res.status(200).json(permisosUsuario);
    } catch (error) {
        // Maneja los errores y envía una respuesta de error al cliente
        res.status(500).json({ error: error.message });
    }
}