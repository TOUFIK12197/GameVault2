const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', 'data', 'jeux.json');

function lireDonnees() {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

function ecrireDonnees(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function genererId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 8);
}

function getAllGames() {
  return lireDonnees();
}

function getGameById(id) {
  return lireDonnees().find((jeu) => jeu.id === id) || null;
}

function addGame(nouveauJeu) {
  const jeux = lireDonnees();
  const jeu = Object.assign({
    id: genererId(),
    note: 0,
    favoris: false,
    commentaires: [],
    dateAjout: new Date().toISOString()
  }, nouveauJeu);
  jeux.push(jeu);
  ecrireDonnees(jeux);
  return jeu;
}

function updateGame(id, donnees) {
  const jeux = lireDonnees();
  const index = jeux.findIndex((jeu) => jeu.id === id);
  if (index === -1) return null;
  jeux[index] = Object.assign({}, jeux[index], donnees);
  ecrireDonnees(jeux);
  return jeux[index];
}

function deleteGame(id) {
  const jeux = lireDonnees();
  const filtered = jeux.filter((jeu) => jeu.id !== id);
  if (filtered.length === jeux.length) return false;
  ecrireDonnees(filtered);
  return true;
}

function addComment(id, commentaire) {
  const jeux = lireDonnees();
  const index = jeux.findIndex((jeu) => jeu.id === id);
  if (index === -1) return null;
  const jeu = jeux[index];
  const nouveauCommentaire = Object.assign({
    id: Date.now(),
    date: new Date().toLocaleDateString('fr-FR')
  }, commentaire);
  jeu.commentaires = jeu.commentaires || [];
  jeu.commentaires.push(nouveauCommentaire);
  ecrireDonnees(jeux);
  return jeu.commentaires;
}

function deleteComment(id, commentaireId) {
  const jeux = lireDonnees();
  const index = jeux.findIndex((jeu) => jeu.id === id);
  if (index === -1) return null;
  const jeu = jeux[index];
  jeu.commentaires = (jeu.commentaires || []).filter((c) => c.id !== Number(commentaireId));
  ecrireDonnees(jeux);
  return jeu.commentaires;
}

module.exports = {
  getAllGames,
  getGameById,
  addGame,
  updateGame,
  deleteGame,
  addComment,
  deleteComment
};
