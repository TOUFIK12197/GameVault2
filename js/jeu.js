// ============================================================
//  jeu.js — Page détail d'un jeu
// ============================================================

var jeuId            = null;
var modeAffichage    = 'vulnerable';
var noteSelectionnee = 0;

// ============================================================
//  Initialisation
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  var params = new URLSearchParams(window.location.search);
  jeuId      = params.get('id');

  if (!jeuId) { afficherIntrouvable(); return; }

  // Charger le jeu depuis Firestore
  getJeuById(jeuId, function(jeu) {
    if (!jeu) { afficherIntrouvable(); return; }
    afficherDetailJeu(jeu);
    afficherCommentaires(jeu.commentaires || []);
    initialiserFormCommentaire();
    initialiserCompteur();
    initialiserEtoilesHover();
  });
});

// ============================================================
//  Affichage du jeu
// ============================================================
function afficherDetailJeu(jeu) {
  document.getElementById('detail-contenu').style.display = 'block';
  document.title = jeu.titre + ' — GameVault';

  // Image
  var imgEl     = document.getElementById('detail-image');
  imgEl.src     = jeu.image || 'images/jeux/default.jpg';
  imgEl.alt     = jeu.titre;
  imgEl.onerror = function() { this.src = 'images/jeux/default.jpg'; };

  // Badges
  var badgesEl  = document.getElementById('detail-badges');
  badgesEl.innerHTML = '';

  var bPlat        = document.createElement('span');
  bPlat.className  = 'badge ' + badgePlateforme(jeu.plateforme);
  bPlat.textContent = jeu.plateforme;

  var bGenre        = document.createElement('span');
  bGenre.className  = 'badge badge-genre';
  bGenre.textContent = jeu.genre.charAt(0).toUpperCase() + jeu.genre.slice(1);

  var dc = { 'Facile':'badge-vert','Moyen':'badge-orange','Difficile':'badge-rouge' };
  var bDiff        = document.createElement('span');
  bDiff.className  = 'badge ' + (dc[jeu.difficulte] || 'badge-gris');
  bDiff.textContent = jeu.difficulte;

  badgesEl.appendChild(bPlat);
  badgesEl.appendChild(bGenre);
  badgesEl.appendChild(bDiff);

  // Textes (textContent = sécurisé)
  document.getElementById('detail-titre').textContent       = jeu.titre;
  document.getElementById('detail-dev').textContent         = jeu.developpeur;
  document.getElementById('detail-annee').textContent       = jeu.annee;
  document.getElementById('detail-plateforme').textContent  = jeu.plateforme;
  document.getElementById('detail-note').textContent        = jeu.note > 0 ? jeu.note : 'Non noté';
  document.getElementById('detail-description').textContent = jeu.description;
  document.getElementById('detail-nb-comments').textContent = (jeu.commentaires || []).length;

  mettreAJourBoutonFavori(jeu.favoris);

  afficherTelechargement(jeu);
}

// ============================================================
//  Commentaires — démo XSS
// ============================================================
function afficherCommentaires(commentaires) {
  var liste   = document.getElementById('commentaires-liste');
  var aucun   = document.getElementById('aucun-commentaire');
  var loading = document.getElementById('chargement-comments');

  if (loading) loading.style.display = 'none';
  liste.innerHTML = '';

  if (!commentaires || commentaires.length === 0) {
    if (aucun) aucun.style.display = 'block';
    return;
  }

  if (aucun) aucun.style.display = 'none';

  for (var i = 0; i < commentaires.length; i++) {
    var c       = commentaires[i];
    var article = document.createElement('article');
    article.className = 'commentaire-card';

    // Header — toujours sécurisé
    var header  = document.createElement('div');
    header.className = 'commentaire-header';

    var auteurEl  = document.createElement('span');
    auteurEl.className   = 'commentaire-auteur';
    auteurEl.textContent = c.auteur;

    var dateEl    = document.createElement('span');
    dateEl.className   = 'commentaire-date';
    dateEl.textContent = c.date;

    header.appendChild(auteurEl);
    header.appendChild(dateEl);

    // Corps — selon mode XSS
    var corps   = document.createElement('div');
    corps.className = 'commentaire-corps';

    if (modeAffichage === 'vulnerable') {
      corps.innerHTML  = c.texte; // ❌ XSS vulnérable
    } else {
      corps.textContent = c.texte; // ✅ XSS sécurisé
    }

    // Bouton supprimer
    var btnSupp   = document.createElement('button');
    btnSupp.className   = 'btn-suppr-commentaire';
    btnSupp.textContent = '🗑️';

    (function(cid) {
      btnSupp.addEventListener('click', function() {
        supprimerCeCommentaire(cid);
      });
    })(c.id);

    article.appendChild(header);
    article.appendChild(corps);
    article.appendChild(btnSupp);
    liste.appendChild(article);
  }
}

// ============================================================
//  Changer onglet XSS
// ============================================================
function changerOnglet(mode) {
  modeAffichage = mode;

  var tV = document.getElementById('tab-vulnerable');
  var tS = document.getElementById('tab-secure');
  var bV = document.getElementById('bandeau-vulnerable');
  var bS = document.getElementById('bandeau-secure');

  if (mode === 'vulnerable') {
    tV.classList.add('tab-actif');    tS.classList.remove('tab-actif');
    bV.style.display = 'block';      bS.style.display = 'none';
  } else {
    tS.classList.add('tab-actif');    tV.classList.remove('tab-actif');
    bS.style.display = 'block';      bV.style.display = 'none';
  }

  getJeuById(jeuId, function(jeu) {
    if (jeu) afficherCommentaires(jeu.commentaires || []);
  });
}

// ============================================================
//  Formulaire commentaire
// ============================================================
function initialiserFormCommentaire() {
  var form = document.getElementById('form-commentaire');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!validerFormCommentaire()) return;

    var auteur  = document.getElementById('comment-auteur').value.trim();
    var texte   = document.getElementById('comment-texte').value.trim();
    var btnSub  = form.querySelector('button[type="submit"]');

    if (btnSub) btnSub.disabled = true;

    // ✅ Sauvegarder dans Firestore
    ajouterCommentaire(jeuId, { auteur: auteur, texte: texte }, function(commentaires) {
      form.reset();
      document.getElementById('compteur').textContent = '0 / 500';
      afficherCommentaires(commentaires);
      document.getElementById('detail-nb-comments').textContent = commentaires.length;
      if (btnSub) btnSub.disabled = false;
    });
  });
}

// ============================================================
//  Validation commentaire
// ============================================================
function validerFormCommentaire() {
  var valide = true;
  var auteur = document.getElementById('comment-auteur').value.trim();
  var texte  = document.getElementById('comment-texte').value.trim();
  var errA   = document.getElementById('err-auteur');
  var errT   = document.getElementById('err-texte');

  errA.textContent = ''; errA.style.display = 'none';
  errT.textContent = ''; errT.style.display = 'none';

  if (!/^[a-zA-ZÀ-ÿ0-9 _-]{2,40}$/.test(auteur)) {
    errA.textContent   = '⚠️ Pseudo invalide (2-40 caractères).';
    errA.style.display = 'block';
    valide = false;
  }

  if (texte.length < 5 || texte.length > 500) {
    errT.textContent   = '⚠️ Avis entre 5 et 500 caractères.';
    errT.style.display = 'block';
    valide = false;
  }

  return valide;
}

// ============================================================
//  Compteur
// ============================================================
function initialiserCompteur() {
  var ta  = document.getElementById('comment-texte');
  var cpt = document.getElementById('compteur');
  if (!ta || !cpt) return;

  ta.addEventListener('input', function() {
    var l        = ta.value.length;
    cpt.textContent = l + ' / 500';
    cpt.style.color = l > 450 ? '#ef4444' : '';
  });
}

// ============================================================
//  Supprimer un commentaire
// ============================================================
function supprimerCeCommentaire(commentaireId) {
  supprimerCommentaireDB(jeuId, commentaireId, function(nouveaux) {
    afficherCommentaires(nouveaux);
    document.getElementById('detail-nb-comments').textContent = nouveaux.length;
  });
}

// ============================================================
//  Notation
// ============================================================
function noterJeu(valeur) {
  noteSelectionnee = valeur;
  var etoiles = document.querySelectorAll('.etoile');
  for (var i = 0; i < etoiles.length; i++) {
    if (i < valeur) etoiles[i].classList.add('etoile-active');
    else            etoiles[i].classList.remove('etoile-active');
  }

  // ✅ Sauvegarder dans Firestore
  mettreAJourJeu(jeuId, { note: valeur }, function() {
    document.getElementById('detail-note').textContent = valeur;
    var msg = document.getElementById('notation-message');
    if (msg) msg.textContent = '✅ Vous avez noté ce jeu ' + valeur + '/5 !';
  });
}

function initialiserEtoilesHover() {
  var etoiles = document.querySelectorAll('.etoile');
  for (var i = 0; i < etoiles.length; i++) {
    (function(idx) {
      etoiles[idx].addEventListener('mouseenter', function() {
        for (var k = 0; k < etoiles.length; k++) {
          if (k <= idx) etoiles[k].classList.add('etoile-hover');
          else          etoiles[k].classList.remove('etoile-hover');
        }
      });
      etoiles[idx].addEventListener('mouseleave', function() {
        for (var k = 0; k < etoiles.length; k++) {
          etoiles[k].classList.remove('etoile-hover');
        }
      });
    })(i);
  }
}

// ============================================================
//  Favoris
// ============================================================
function toggleFavoriDetail() {
  toggleFavori(jeuId, function(estFavori) {
    mettreAJourBoutonFavori(estFavori);
  });
}

function mettreAJourBoutonFavori(estFavori) {
  var btn = document.getElementById('btn-favori');
  if (!btn) return;
  btn.textContent = estFavori ? '❤️ Retirer des favoris' : '🤍 Ajouter aux favoris';
  if (estFavori) btn.classList.add('btn-favori-actif');
  else           btn.classList.remove('btn-favori-actif');
}

// ============================================================
//  Supprimer le jeu
// ============================================================
function supprimerCeJeu() {
  if (!confirm('⚠️ Supprimer ce jeu ? Action irréversible.')) return;

  supprimerJeu(jeuId, function() {
    window.location.href = 'catalogue.html';
  });
}

// ============================================================
//  Introuvable
// ============================================================
function afficherIntrouvable() {
  var el = document.getElementById('jeu-introuvable');
  var ct = document.getElementById('detail-contenu');
  if (el) el.style.display = 'flex';
  if (ct) ct.style.display = 'none';
}

// ============================================================
//  Affichage du lien de téléchargement
// ============================================================
function afficherTelechargement(jeu) {
  var box = document.getElementById('telechargement-box');
  if (!box) return;

  box.innerHTML = '';

  var lien = '';

  // Récupérer le lien de façon sûre
  if (jeu.lienTelechargement) {
    lien = String(jeu.lienTelechargement).trim();
  }

  console.log('Lien téléchargement :', lien);

  // Pas de lien disponible
  if (lien === '') {
    var msg       = document.createElement('p');
    msg.className = 'aucun-lien';
    msg.textContent = '🚫 Aucun lien de téléchargement disponible.';
    box.appendChild(msg);
    return;
  }

  // Ajouter https:// si manquant
  if (
    lien.indexOf('http://') !== 0 &&
    lien.indexOf('https://') !== 0
  ) {
    lien = 'https://' + lien;
  }

  // Détecter la boutique
  var nomBoutique   = 'Télécharger le jeu';
  var iconeBoutique = '⬇️';

  if (lien.indexOf('store.steampowered.com') !== -1) {
    nomBoutique   = 'Télécharger sur Steam';
    iconeBoutique = '🎮';
  } else if (lien.indexOf('epicgames.com') !== -1) {
    nomBoutique   = 'Télécharger sur Epic Games';
    iconeBoutique = '🎯';
  } else if (lien.indexOf('playstation.com') !== -1) {
    nomBoutique   = 'Télécharger sur PlayStation Store';
    iconeBoutique = '🕹️';
  } else if (lien.indexOf('xbox.com') !== -1) {
    nomBoutique   = 'Télécharger sur Xbox Store';
    iconeBoutique = '🟩';
  } else if (lien.indexOf('nintendo.com') !== -1) {
    nomBoutique   = 'Télécharger sur Nintendo eShop';
    iconeBoutique = '🔴';
  } else if (lien.indexOf('gog.com') !== -1) {
    nomBoutique   = 'Télécharger sur GOG';
    iconeBoutique = '🌌';
  }

  // Créer le wrapper
  var wrapper       = document.createElement('div');
  wrapper.className = 'telechargement-wrapper';

  // ✅ Bouton avec le vrai lien directement
  var btnTel      = document.createElement('a');
  btnTel.href     = lien;                  // ← lien direct sans vérification bloquante
  btnTel.target   = '_blank';
  btnTel.rel      = 'noopener noreferrer';
  btnTel.className = 'btn btn-telecharger';
  btnTel.textContent = iconeBoutique + ' ' + nomBoutique;

  // URL affichée sous le bouton
  var urlAffichee       = document.createElement('p');
  urlAffichee.className = 'lien-url';
  urlAffichee.textContent = lien;

  wrapper.appendChild(btnTel);
  wrapper.appendChild(urlAffichee);
  box.appendChild(wrapper);
}
