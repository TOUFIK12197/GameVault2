// ============================================================
//  catalogue.js
// ============================================================

var sqlTabActif  = 'vulnerable';
var tousLesJeux  = [];

function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  str = String(str);
  return str
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#039;');
}

function badgePlateforme(plateforme) {
  var c = {
    'PC'    : 'badge-pc',
    'PS5'   : 'badge-ps',
    'PS4'   : 'badge-ps',
    'Xbox'  : 'badge-xbox',
    'Switch': 'badge-switch',
    'Mobile': 'badge-mobile'
  };
  return c[plateforme] || 'badge-gris';
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

// ============================================================
//  Créer une carte jeu
// ============================================================
function creerCarteJeu(jeu) {
  var card = document.createElement('article');
  card.className = 'jeu-card';

  var diffClass = 'badge-gris';
  if (jeu.difficulte === 'Facile')    diffClass = 'badge-vert';
  if (jeu.difficulte === 'Moyen')     diffClass = 'badge-orange';
  if (jeu.difficulte === 'Difficile') diffClass = 'badge-rouge';

  var imgSrc  = jeu.image || 'images/jeux/default.jpg';
  var jeuId   = jeu.id || '';
  var noteText = jeu.note > 0 ? jeu.note + '/5' : 'Non noté';
  var nbComm  = jeu.commentaires ? jeu.commentaires.length : 0;

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

// ============================================================
//  Afficher les jeux
// ============================================================
function afficherJeux(liste) {
  var grid = document.getElementById('jeux-grid');
  var vide = document.getElementById('message-vide');
  var nbEl = document.getElementById('nb-resultats');

  if (!grid) return;

  grid.innerHTML = '';

  if (liste.length === 0) {
    if (vide) vide.style.display = 'flex';
    if (nbEl) nbEl.textContent   = '';
    return;
  }

  if (vide) vide.style.display = 'none';
  if (nbEl) nbEl.textContent   = liste.length + ' jeu(x) trouvé(s)';

  for (var i = 0; i < liste.length; i++) {
    grid.appendChild(creerCarteJeu(liste[i]));
  }
}

// ============================================================
//  Filtrer depuis le cache local
// ============================================================
function filtrerJeux() {
  var recherche  = document.getElementById('recherche')
    ? document.getElementById('recherche').value.trim().toLowerCase() : '';
  var genre      = document.getElementById('filtre-genre')
    ? document.getElementById('filtre-genre').value      : '';
  var plateforme = document.getElementById('filtre-plateforme')
    ? document.getElementById('filtre-plateforme').value : '';
  var noteMin    = document.getElementById('filtre-note')
    ? parseFloat(document.getElementById('filtre-note').value) || 0  : 0;
  var tri        = document.getElementById('filtre-tri')
    ? document.getElementById('filtre-tri').value        : 'recent';

  var btnClear = document.getElementById('btn-clear');
  if (btnClear) btnClear.style.display = recherche ? 'flex' : 'none';

  mettreAJourSQLDemo(recherche);

  var resultats = [];
  for (var i = 0; i < tousLesJeux.length; i++) {
    var j = tousLesJeux[i];

    var matchR =
      !recherche ||
      j.titre.toLowerCase().indexOf(recherche)       !== -1 ||
      j.genre.toLowerCase().indexOf(recherche)       !== -1 ||
      j.developpeur.toLowerCase().indexOf(recherche) !== -1 ||
      j.plateforme.toLowerCase().indexOf(recherche)  !== -1;

    var matchG = !genre      || j.genre      === genre;
    var matchP = !plateforme || j.plateforme === plateforme;
    var matchN = !noteMin    || j.note       >= noteMin;

    if (matchR && matchG && matchP && matchN) resultats.push(j);
  }

  if (tri === 'note')  resultats.sort(function(a,b){ return b.note-a.note; });
  if (tri === 'titre') resultats.sort(function(a,b){ return a.titre.localeCompare(b.titre); });

  afficherJeux(resultats);
}

// ============================================================
//  SQL Demo
// ============================================================
function mettreAJourSQLDemo(saisie) {
  var demo    = document.getElementById('sql-demo');
  var codeEl  = document.getElementById('sql-code');
  var warning = document.getElementById('sql-warning');
  if (!demo) return;

  if (!saisie) { demo.style.display = 'none'; return; }

  demo.style.display = 'block';
  var r = rechercherJeux(saisie);

  if (sqlTabActif === 'vulnerable') {
    codeEl.textContent = r.requeteVulnerable;
    codeEl.className   = 'sql-code sql-code-danger';
  } else {
    codeEl.textContent = r.requeteSecurisee;
    codeEl.className   = 'sql-code sql-code-success';
  }

  var u = saisie.toUpperCase();
  var injection =
    saisie.indexOf("'")  !== -1 || saisie.indexOf('"')   !== -1 ||
    saisie.indexOf('--') !== -1 || saisie.indexOf(';')   !== -1 ||
    u.indexOf(' OR ')    !== -1 || u.indexOf('DROP')     !== -1 ||
    u.indexOf('UNION')   !== -1 || u.indexOf('SELECT')   !== -1;

  if (warning) warning.style.display = injection ? 'block' : 'none';
}

function changerSQLTab(tab) {
  sqlTabActif = tab;
  var tabs    = document.querySelectorAll('.sql-tab');
  for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove('sql-tab-actif');
  if (tab === 'vulnerable' && tabs[0]) tabs[0].classList.add('sql-tab-actif');
  if (tab === 'secure'     && tabs[1]) tabs[1].classList.add('sql-tab-actif');
  var el = document.getElementById('recherche');
  mettreAJourSQLDemo(el ? el.value.trim() : '');
}

function clearRecherche() {
  var input = document.getElementById('recherche');
  if (input) { input.value = ''; input.focus(); }
  filtrerJeux();
}

// ============================================================
//  Favoris
// ============================================================
function basculerFavori(id, bouton) {
  toggleFavori(id, function(estFavori) {
    bouton.textContent = estFavori ? '❤️' : '🤍';
    if (estFavori) {
      bouton.classList.add('actif');
    } else {
      bouton.classList.remove('actif');
    }
    // Mettre à jour le cache local
    for (var i = 0; i < tousLesJeux.length; i++) {
      if (tousLesJeux[i].id === id) {
        tousLesJeux[i].favoris = estFavori;
        break;
      }
    }
  });
}

// ============================================================
//  Initialisation catalogue
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  var params = new URLSearchParams(window.location.search);
  var genre  = params.get('genre');

  if (genre) {
    var select = document.getElementById('filtre-genre');
    if (select) select.value = genre;
  }

  // Charger depuis Firestore
  initialiserDonnees(function() {
    getJeux(function(jeux) {
      tousLesJeux = jeux;
      afficherJeux(genre ? jeux.filter(function(j){ return j.genre === genre; }) : jeux);
    });
  });

  // Événements
  var els = {
    recherche : document.getElementById('recherche'),
    genre     : document.getElementById('filtre-genre'),
    plateforme: document.getElementById('filtre-plateforme'),
    note      : document.getElementById('filtre-note'),
    tri       : document.getElementById('filtre-tri')
  };

  if (els.recherche)  els.recherche.addEventListener('input',  filtrerJeux);
  if (els.genre)      els.genre.addEventListener('change',     filtrerJeux);
  if (els.plateforme) els.plateforme.addEventListener('change',filtrerJeux);
  if (els.note)       els.note.addEventListener('change',      filtrerJeux);
  if (els.tri)        els.tri.addEventListener('change',       filtrerJeux);
});