// ============================================================
// views.js — fonctions de rendu pour l’interface utilisateur
// ============================================================

function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  str = String(str);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function badgePlateforme(plateforme) {
  var classes = {
    'PC': 'badge-pc',
    'PS5': 'badge-ps',
    'PS4': 'badge-ps',
    'Xbox': 'badge-xbox',
    'Switch': 'badge-switch',
    'Mobile': 'badge-mobile'
  };
  return classes[plateforme] || 'badge-gris';
}

function genererEtoiles(note) {
  var html = '';
  for (var i = 1; i <= 5; i++) {
    html += i <= Math.round(note)
      ? '<span class="etoile-mini active">★</span>'
      : '<span class="etoile-mini">★</span>';
  }
  return html;
}

function creerCarteJeu(jeu) {
  var card = document.createElement('article');
  card.className = 'jeu-card';

  var diffClass = 'badge-gris';
  if (jeu.difficulte === 'Facile') diffClass = 'badge-vert';
  if (jeu.difficulte === 'Moyen') diffClass = 'badge-orange';
  if (jeu.difficulte === 'Difficile') diffClass = 'badge-rouge';

  var imgSrc = jeu.image || 'images/jeux/default.jpg';
  var jeuId = jeu.id || '';
  var noteText = jeu.note > 0 ? jeu.note + '/5' : 'Non noté';
  var nbComm = jeu.commentaires ? jeu.commentaires.length : 0;

  var imageWrapper = document.createElement('div');
  imageWrapper.className = 'card-image-wrapper';

  var img = document.createElement('img');
  img.className = 'card-image';
  img.src = escapeHTML(imgSrc);
  img.alt = jeu.titre ? jeu.titre : 'Image du jeu';
  img.onerror = function() { this.src = 'images/jeux/default.jpg'; };
  imageWrapper.appendChild(img);

  var favBtn = document.createElement('button');
  favBtn.className = 'btn-favori-overlay' + (jeu.favoris ? ' actif' : '');
  favBtn.type = 'button';
  favBtn.textContent = jeu.favoris ? '❤️' : '🤍';
  favBtn.addEventListener('click', function() {
    basculerFavori(jeuId, favBtn);
  });
  imageWrapper.appendChild(favBtn);

  var plateformeBadge = document.createElement('span');
  plateformeBadge.className = 'card-plateforme-overlay badge ' + badgePlateforme(jeu.plateforme);
  plateformeBadge.textContent = jeu.plateforme;
  imageWrapper.appendChild(plateformeBadge);

  card.appendChild(imageWrapper);

  var body = document.createElement('div');
  body.className = 'card-body';

  var titreEl = document.createElement('h3');
  titreEl.className = 'card-titre';
  titreEl.textContent = jeu.titre;
  body.appendChild(titreEl);

  var plateformesDiv = document.createElement('div');
  plateformesDiv.className = 'card-plateformes';

  var diffSpan = document.createElement('span');
  diffSpan.className = 'badge ' + diffClass;
  diffSpan.textContent = jeu.difficulte;
  plateformesDiv.appendChild(diffSpan);

  var anneeSpan = document.createElement('span');
  anneeSpan.className = 'card-annee';
  anneeSpan.textContent = '📅 ' + jeu.annee;
  plateformesDiv.appendChild(anneeSpan);

  body.appendChild(plateformesDiv);

  var desc = document.createElement('p');
  desc.className = 'card-description';
  desc.textContent = jeu.description;
  body.appendChild(desc);

  var dev = document.createElement('div');
  dev.className = 'card-dev';
  dev.textContent = '👾 ' + jeu.developpeur;
  body.appendChild(dev);

  var noteBlock = document.createElement('div');
  noteBlock.className = 'card-note';

  var etoiles = document.createElement('div');
  etoiles.className = 'etoiles-mini';
  etoiles.innerHTML = genererEtoiles(jeu.note);
  noteBlock.appendChild(etoiles);

  var noteValeur = document.createElement('span');
  noteValeur.className = 'note-valeur';
  noteValeur.textContent = noteText;
  noteBlock.appendChild(noteValeur);

  var commentaires = document.createElement('span');
  commentaires.className = 'nb-comments';
  commentaires.textContent = '💬 ' + nbComm;
  noteBlock.appendChild(commentaires);

  body.appendChild(noteBlock);
  card.appendChild(body);

  var footer = document.createElement('div');
  footer.className = 'card-footer';

  var detailLink = document.createElement('a');
  detailLink.className = 'btn btn-primary';
  detailLink.href = 'jeu-detail.html?id=' + encodeURIComponent(jeuId);
  detailLink.textContent = 'Voir la fiche →';
  footer.appendChild(detailLink);

  card.appendChild(footer);
  return card;
}

function afficherJeux(liste) {
  var grid = document.getElementById('jeux-grid');
  var vide = document.getElementById('message-vide');
  var nbEl = document.getElementById('nb-resultats');

  if (!grid) return;

  grid.innerHTML = '';

  if (liste.length === 0) {
    if (vide) vide.style.display = 'flex';
    if (nbEl) nbEl.textContent = '';
    return;
  }

  if (vide) vide.style.display = 'none';
  if (nbEl) nbEl.textContent = liste.length + ' jeu(x) trouvé(s)';

  for (var i = 0; i < liste.length; i++) {
    grid.appendChild(creerCarteJeu(liste[i]));
  }
}
