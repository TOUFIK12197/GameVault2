const express = require('express');
const router = express.Router();
const jeuxController = require('../controllers/jeuxController');

router.get('/', jeuxController.listerJeux);
router.get('/:id', jeuxController.obtenirJeu);
router.post('/', jeuxController.creerJeu);
router.put('/:id', jeuxController.modifierJeu);
router.delete('/:id', jeuxController.supprimerJeu);
router.post('/:id/commentaires', jeuxController.ajouterCommentaire);
router.delete('/:id/commentaires/:commentaireId', jeuxController.supprimerCommentaire);

module.exports = router;
