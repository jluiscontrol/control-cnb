import * as consulta from '../models/consultaCedula.Model.js'

// Función para crear un arqueo
export const consultaCedula = async (req, res) => {
  const cliente = req.body; // Suponiendo que los datos del cliente están en el cuerpo de la solicitud

  try {
      // Consultar si la cédula del cliente está presente y no es vacía
      if (!cliente.cedula || cliente.cedula.trim() === '') {
          throw new Error('La cédula del cliente es requerida.');
      }

      // Insertar el cliente en la base de datos
      const idCliente = await consulta.insertarCliente(cliente);

      // Si se insertó correctamente, devolver el ID del cliente
      res.status(200).json({ idCliente  });
  } catch (error) {
   
    if (error.message.includes('Cédula incorrecta: verifique e ingrese nuevamente.')) {
      return res.status(400).json({ error: error.message });
    }
      // Si ocurrió un error, devolver un mensaje de error
      console.error('Error al insertar cliente:', error);
      res.status(500).json({ error: 'Error al insertar cliente en la base de datos' }, );
  }
};


