import * as RutaVisibleModel from '../models/RutaVisible.Model.js';

export const createOrUpdate = async (req, res) => {
  try {
    const rutaVisible = await RutaVisibleModel.createOrUpdateRutaVisible(req.body);
    res.status(200).json(rutaVisible);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRutas = async (req, res) => {
  const rutas = await RutaVisibleModel.getAllRutas();
  res.status(200).json(rutas);
};

export const getRutasVisibles = async (req, res) => {
  const rutasVisibles = await RutaVisibleModel.getRutasVisibles(req.params.id_usuario);
  res.status(200).json(rutasVisibles);
};