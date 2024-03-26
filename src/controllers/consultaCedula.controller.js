import * as consulta from '../models/consultaCedula.Model.js'

// Función para crear un arqueo
export const consultaCedula = async (req, res) => {
  const cliente = req.body; // Suponiendo que los datos del cliente están en el cuerpo de la solicitud

  try {
      // Insertar el cliente en la base de datos
      const idCliente = await consulta.insertarCliente(cliente);

      // Si se insertó correctamente, devolver el ID del cliente
      res.status(200).json({ idCliente });
  } catch (error) {
      // Si ocurrió un error, devolver un mensaje de error
      console.error('Error al insertar cliente:', error);
      res.status(500).json({ error: 'Error al insertar cliente en la base de datos' });
  }
};

