const express = require('express');
const router = express.Router();
const profilController = require('../controllers/profilController');

router.get('/:uid', profilController.obtenirProfil);
router.post('/', profilController.creerProfil);        //← NOUVEAU
router.put('/:uid', profilController.sauvegarderProfil);

module.exports = router;
