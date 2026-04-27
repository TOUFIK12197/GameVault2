const profilModel = require('../models/profileModel');

// créer un profil à l'inscription
function creerProfil(req, res) {
  var donnees = req.body;

  if (!donnees || !donnees.uid || !donnees.email) {
    return res.status(400).json({ 
      error: 'uid et email sont requis.' 
    });
  }

  var existant = profilModel.getProfil(donnees.uid);
  if (existant) {
    return res.status(409).json({ 
      error: 'Profil déjà existant.' 
    });
  }

  var nouveauProfil = {
    uid: donnees.uid,
    email: donnees.email,
    prenom: donnees.prenom || '',
    nom: donnees.nom || '',
    pseudo: donnees.pseudo || 'GamerPro',
    dateNaissance: donnees.dateNaissance || null,
    ville: donnees.ville || null,
    plateforme: donnees.plateforme || 'PC',
    genresPreferes: donnees.genresPreferes || [],
    bio: donnees.bio || '',
    avatar: donnees.avatar || '🎮',
    dateInscription: donnees.dateInscription || new Date().toISOString(),
    emailConfirme: false
  };

  var profil = profilModel.upsertProfil(donnees.uid, nouveauProfil);
  res.status(201).json(profil);
}

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
  creerProfil,
  obtenirProfil,
  sauvegarderProfil
};
