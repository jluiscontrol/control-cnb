import * as RutaVisibleModel from '../models/RutaVisible.Model.js';

export const createRutaVisible = async (req, res) => {
  const rutaVisible = await RutaVisibleModel.createRutaVisible(req.body);
  res.status(201).json(rutaVisible);
};

export const deleteRutaVisible = async (req, res) => {
  const rutaVisible = await RutaVisibleModel.deleteRutaVisible(req.params.id);
  if (rutaVisible) {
    res.status(200).json(rutaVisible);
  } else {
    res.status(404).json({ error: 'Ruta visible no encontrada' });
  }
};

export const getRutasVisibles = async (req, res) => {
  const rutasVisibles = await RutaVisibleModel.getRutasVisibles(req.params.id_usuario);
  res.status(200).json(rutasVisibles);
};