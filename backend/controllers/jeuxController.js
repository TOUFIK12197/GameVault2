const jeuModel = require('../models/gameModel');

function listerJeux(req, res) {
  const jeux = jeuModel.getAllGames();
  res.json(jeux);
}

function obtenirJeu(req, res) {
  const jeu = jeuModel.getGameById(req.params.id);
  if (!jeu) return res.status(404).json({ error: 'Jeu non trouvé' });
  res.json(jeu);
}

function creerJeu(req, res) {
  const jeu = jeuModel.addGame(req.body);
  res.status(201).json(jeu);
}

function modifierJeu(req, res) {
  const jeu = jeuModel.updateGame(req.params.id, req.body);
  if (!jeu) return res.status(404).json({ error: 'Jeu non trouvé' });
  res.json(jeu);
}

function supprimerJeu(req, res) {
  const ok = jeuModel.deleteGame(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Jeu non trouvé' });
  res.status(204).end();
}

function ajouterCommentaire(req, res) {
  const commentaires = jeuModel.addComment(req.params.id, req.body);
  if (commentaires === null) return res.status(404).json({ error: 'Jeu non trouvé' });
  res.status(201).json(commentaires);
}

function supprimerCommentaire(req, res) {
  const commentaires = jeuModel.deleteComment(req.params.id, req.params.commentaireId);
  if (commentaires === null) return res.status(404).json({ error: 'Jeu non trouvé' });
  res.json(commentaires);
}

module.exports = {
  listerJeux,
  obtenirJeu,
  creerJeu,
  modifierJeu,
  supprimerJeu,
  ajouterCommentaire,
  supprimerCommentaire
};
