// ============================================================
//  formulaire.js — Ajout d'un jeu avec Firebase
// ============================================================

var GENRES_VALIDES      = ['action','rpg','fps','sport','course','strategie','aventure','simulation'];
var PLATEFORMES_VALIDES = ['PC','PS5','PS4','Xbox','Switch','Mobile'];
var DIFFICULTES_VALIDES = ['Facile','Moyen','Difficile'];

function afficherErreur(id, message) {
  var el = document.getElementById(id);
  if (!el) return;
  el.textContent   = message;
  el.style.display = message ? 'block' : 'none';
}

function effacerErreurs() {
  var erreurs = document.querySelectorAll('.erreur');
  for (var i = 0; i < erreurs.length; i++) {
    erreurs[i].textContent   = '';
    erreurs[i].style.display = 'none';
  }
}

function urlEstValide(value) {
  if (!value) return false;
  try {
    var url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

function validerFormulaire() {
  effacerErreurs();
  var valide = true;

  var titre       = document.getElementById('titre').value.trim();
  var genre       = document.getElementById('genre').value;
  var plateforme  = document.getElementById('plateforme').value;
  var developpeur = document.getElementById('developpeur').value.trim();
  var annee       = parseInt(document.getElementById('annee').value, 10);
  var diffRadio   = document.querySelector('input[name="difficulte"]:checked');
  var difficulte  = diffRadio ? diffRadio.value : '';
  var description = document.getElementById('description').value.trim();
  var lien        = document.getElementById('lien-telechargement').value.trim();

  if (titre.length < 2 || titre.length > 100) {
    afficherErreur('err-titre', '⚠️ Titre entre 2 et 100 caractères.');
    valide = false;
  }
  if (GENRES_VALIDES.indexOf(genre) === -1) {
    afficherErreur('err-genre', '⚠️ Sélectionnez un genre valide.');
    valide = false;
  }
  if (PLATEFORMES_VALIDES.indexOf(plateforme) === -1) {
    afficherErreur('err-plateforme', '⚠️ Sélectionnez une plateforme valide.');
    valide = false;
  }
  if (developpeur.length < 2 || developpeur.length > 80) {
    afficherErreur('err-developpeur', '⚠️ Développeur entre 2 et 80 caractères.');
    valide = false;
  }
  if (isNaN(annee) || annee < 1970 || annee > 2030) {
    afficherErreur('err-annee', '⚠️ Année entre 1970 et 2030.');
    valide = false;
  }
  if (DIFFICULTES_VALIDES.indexOf(difficulte) === -1) {
    afficherErreur('err-difficulte', '⚠️ Choisissez une difficulté.');
    valide = false;
  }
  if (description.length < 20 || description.length > 1000) {
    afficherErreur('err-description', '⚠️ Description entre 20 et 1000 caractères.');
    valide = false;
  }
  if (lien) {
    if (!urlEstValide(lien)) {
      afficherErreur('err-lien', '⚠️ Le lien doit être une URL http(s) valide.');
      valide = false;
    }
    if (lien.length > 500) {
      afficherErreur('err-lien', '⚠️ Lien trop long (maximum 500 caractères).');
      valide = false;
    }
  }

  return valide;
}

function construireJeu(imageSrc) {
  var diffRadio = document.querySelector('input[name="difficulte"]:checked');

  // ✅ Récupérer le lien de téléchargement
  var lienInput = document.getElementById('lien-telechargement');
  var lien      = lienInput ? lienInput.value.trim() : '';

  console.log('Lien saisi dans le formulaire :', lien);

  return {
    titre:               document.getElementById('titre').value.trim(),
    genre:               document.getElementById('genre').value,
    plateforme:          document.getElementById('plateforme').value,
    developpeur:         document.getElementById('developpeur').value.trim(),
    annee:               parseInt(document.getElementById('annee').value),
    difficulte:          diffRadio ? diffRadio.value : '',
    description:         document.getElementById('description').value.trim(),
    image:               imageSrc,
    lienTelechargement:  lien   // ✅ toujours inclus même si vide
  };
}

function afficherSucces() {
  var form      = document.getElementById('form-jeu');
  var succes    = document.getElementById('message-succes');
  var chargement= document.getElementById('message-chargement');
  if (form)       form.style.display       = 'none';
  if (succes)     succes.style.display     = 'block';
  if (chargement) chargement.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function() {

  // Prévisualisation image
  var inputImage = document.getElementById('image');
  if (inputImage) {
    inputImage.addEventListener('change', function() {
      var fichier = this.files[0];
      var preview = document.getElementById('image-preview');
      var erreur  = document.getElementById('err-image');

      erreur.textContent   = '';
      erreur.style.display = 'none';

      if (!fichier) { preview.src = 'images/jeux/default.jpg'; return; }

      var types  = ['image/jpeg','image/png','image/webp'];
      var typeOk = false;
      for (var i = 0; i < types.length; i++) {
        if (fichier.type === types[i]) { typeOk = true; break; }
      }

      if (!typeOk) {
        erreur.textContent   = '⚠️ Format non supporté (JPG, PNG, WEBP).';
        erreur.style.display = 'block';
        preview.src = 'images/jeux/default.jpg';
        this.value  = '';
        return;
      }

      if (fichier.size > 4 * 1024 * 1024) {
        erreur.textContent   = '⚠️ Image trop lourde (max 8 Mo).';
        erreur.style.display = 'block';
        preview.src = 'images/jeux/default.jpg';
        this.value  = '';
        return;
      }

      var reader    = new FileReader();
      reader.onload = function(e) { preview.src = e.target.result; };
      reader.readAsDataURL(fichier);
    });
  }

  // Soumission
  var form = document.getElementById('form-jeu');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!validerFormulaire()) return;

    if (typeof auth === 'undefined' || !auth.currentUser) {
      afficherErreur('err-lien', '⚠️ Vous devez être connecté pour ajouter un jeu.');
      return;
    }

    var chargement = document.getElementById('message-chargement');
    if (chargement) chargement.style.display = 'block';

    var btnSubmit = form.querySelector('button[type="submit"]');
    if (btnSubmit) btnSubmit.disabled = true;

    var inputImg   = document.getElementById('image');
    var fichierImg = inputImg ? inputImg.files[0] : null;

    if (fichierImg) {
      var reader    = new FileReader();
      reader.onload = function(e) {
        // ✅ Sauvegarde dans Firestore
        ajouterJeu(construireJeu(e.target.result), function() {
          afficherSucces();
        });
      };
      reader.readAsDataURL(fichierImg);
    } else {
      // ✅ Sauvegarde dans Firestore sans image
      ajouterJeu(construireJeu('images/jeux/default.jpg'), function() {
        afficherSucces();
      });
    }
  });
});

