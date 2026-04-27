const profilModel = require('../models/profileModel');

function obtenirProfil(req, res) {
  const uid = req.params.uid;
  const profil = profilModel.getProfil(uid);
  if (!profil) {
    return res.json({
      pseudo: 'GamerPro',
      email: '',
      avatar: '🎮',
      plateforme: 'PC',
      bio: ''
    });
  }
  res.json(profil);
}

function sauvegarderProfil(req, res) {
  const uid = req.params.uid;
  const profil = req.body;
  if (!profil || !uid) {
    return res.status(400).json({ error: 'Données de profil invalides.' });
  }
  const profilMiseAJour = profilModel.upsertProfil(uid, profil);
  res.json(profilMiseAJour);
}

module.exports = {
  obtenirProfil,
  sauvegarderProfil
};
