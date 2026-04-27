// ============================================================
// inscriptionController.js — logique de la page inscription
// ============================================================

// ============================================================
// STATE — données collectées étape par étape
// ============================================================
var state = {
  etapeActuelle: 1,
  email: '',
  motDePasse: '',
  prenom: '',
  nom: '',
  pseudo: '',
  dateNaissance: '',
  ville: '',
  plateforme: '',
  genresPreferes: [],
  bio: ''
};

// ============================================================
// NAVIGATION ENTRE ÉTAPES
// ============================================================
function allerEtape(numero) {
  // Cacher toutes les étapes
  var etapes = document.querySelectorAll('.etape');
  for (var i = 0; i < etapes.length; i++) {
    etapes[i].classList.add('cachee');
  }

  // Afficher la bonne étape
  var etapeCible = document.getElementById('etape-' + numero);
  if (etapeCible) etapeCible.classList.remove('cachee');

  // Mettre à jour la barre de progression
  mettreAJourProgression(numero);

  state.etapeActuelle = numero;

  // Scroll en haut
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function mettreAJourProgression(etapeActive) {
  for (var i = 1; i <= 3; i++) {
    var step = document.getElementById('step-' + i);
    var ligne = document.getElementById('ligne-' + i + '-' + (i + 1));

    if (!step) continue;

    // Reset classes
    step.classList.remove('active', 'complete');

    if (i < etapeActive) {
      step.classList.add('complete');
    } else if (i === etapeActive) {
      step.classList.add('active');
    }

    // Ligne entre étapes
    if (ligne) {
      if (i < etapeActive) {
        ligne.classList.add('complete');
      } else {
        ligne.classList.remove('complete');
      }
    }
  }
}

// ============================================================
// AFFICHAGE ERREURS
// ============================================================
function afficherErreur(idChamp, message) {
  var el = document.getElementById('err-' + idChamp);
  if (!el) return;
  el.textContent = message;
  el.classList.add('visible');

  // Mettre le champ en rouge
  var input = document.getElementById(idChamp);
  if (input) input.classList.add('invalide');
}

function effacerErreur(idChamp) {
  var el = document.getElementById('err-' + idChamp);
  if (el) {
    el.textContent = '';
    el.classList.remove('visible');
  }
  var input = document.getElementById(idChamp);
  if (input) input.classList.remove('invalide');
}

function effacerToutesErreurs(champs) {
  for (var i = 0; i < champs.length; i++) {
    effacerErreur(champs[i]);
  }
}

function afficherErreurGlobale(message) {
  var el = document.getElementById('erreur-globale');
  if (!el) return;
  el.textContent = message;
  el.classList.add('visible');
}

function cacherErreurGlobale() {
  var el = document.getElementById('erreur-globale');
  if (el) el.classList.remove('visible');
}

// ============================================================
// LOADER
// ============================================================
function afficherLoader(visible) {
  var loader = document.getElementById('loader');
  var btnEtape2 = document.getElementById('btn-etape2');

  if (!loader) return;

  if (visible) {
    loader.classList.add('visible');
    if (btnEtape2) btnEtape2.disabled = true;
  } else {
    loader.classList.remove('visible');
    if (btnEtape2) btnEtape2.disabled = false;
  }
}

// ============================================================
// FORCE MOT DE PASSE
// ============================================================
function calculerForceMdp(mdp) {
  var force = 0;
  if (mdp.length >= 8) force++;
  if (/[A-Z]/.test(mdp)) force++;
  if (/[0-9]/.test(mdp)) force++;
  if (/[^A-Za-z0-9]/.test(mdp)) force++;
  return force;
}

function afficherForceMdp(mdp) {
  var barre = document.getElementById('barre-force');
  var texte = document.getElementById('texte-force');
  if (!barre || !texte) return;

  var force = calculerForceMdp(mdp);

  // Reset
  barre.className = 'barre';
  texte.textContent = '';

  if (mdp.length === 0) return;

  var niveaux = ['', 'faible', 'moyen', 'bon', 'fort'];
  var labels  = ['', 'Faible', 'Moyen', 'Bon', 'Fort 💪'];

  barre.classList.add(niveaux[force]);
  texte.textContent = labels[force];
}

// ============================================================
// VALIDATION ÉTAPE 1
// ============================================================
function validerEtape1() {
  var valide = true;

  effacerToutesErreurs(['email', 'motDePasse', 'confirmerMdp', 'cgu']);
  cacherErreurGlobale();

  var email      = document.getElementById('email').value.trim();
  var mdp        = document.getElementById('motDePasse').value;
  var confirmer  = document.getElementById('confirmerMdp').value;
  var cgu        = document.getElementById('cgu').checked;

  // Email
  if (!email) {
    afficherErreur('email', '⚠️ L\'email est requis.');
    valide = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    afficherErreur('email', '⚠️ Format d\'email invalide.');
    valide = false;
  }

  // Mot de passe
  if (!mdp) {
    afficherErreur('motDePasse', '⚠️ Le mot de passe est requis.');
    valide = false;
  } else if (mdp.length < 8) {
    afficherErreur('motDePasse', '⚠️ Minimum 8 caractères.');
    valide = false;
  }

  // Confirmation
  if (mdp && confirmer !== mdp) {
    afficherErreur('confirmerMdp', '⚠️ Les mots de passe ne correspondent pas.');
    valide = false;
  }

  // CGU
  if (!cgu) {
    afficherErreur('cgu', '⚠️ Vous devez accepter les conditions.');
    valide = false;
  }

  return valide;
}

// ============================================================
// VALIDATION ÉTAPE 2
// ============================================================
function calculerAge(dateStr) {
  if (!dateStr) return 99;
  var today     = new Date();
  var naissance = new Date(dateStr);
  var age = today.getFullYear() - naissance.getFullYear();
  var mois = today.getMonth() - naissance.getMonth();
  if (mois < 0 || (mois === 0 && today.getDate() < naissance.getDate())) {
    age--;
  }
  return age;
}

function validerEtape2() {
  var valide = true;

  effacerToutesErreurs(['prenom', 'nom', 'pseudo', 'dateNaissance']);
  cacherErreurGlobale();

  var prenom        = document.getElementById('prenom').value.trim();
  var nom           = document.getElementById('nom').value.trim();
  var pseudo        = document.getElementById('pseudo').value.trim();
  var dateNaissance = document.getElementById('dateNaissance').value;

  // Prénom
  if (!prenom) {
    afficherErreur('prenom', '⚠️ Le prénom est requis.');
    valide = false;
  }

  // Nom
  if (!nom) {
    afficherErreur('nom', '⚠️ Le nom est requis.');
    valide = false;
  }

  // Pseudo
  if (!pseudo) {
    afficherErreur('pseudo', '⚠️ Le pseudo est requis.');
    valide = false;
  } else if (pseudo.length < 3) {
    afficherErreur('pseudo', '⚠️ Minimum 3 caractères.');
    valide = false;
  } else if (!/^[a-zA-Z0-9_\-]+$/.test(pseudo)) {
    afficherErreur('pseudo', '⚠️ Lettres, chiffres, _ et - uniquement.');
    valide = false;
  }

  // Age minimum 13 ans
  if (dateNaissance) {
    var age = calculerAge(dateNaissance);
    if (age < 13) {
      afficherErreur('dateNaissance', '⚠️ Vous devez avoir au moins 13 ans.');
      valide = false;
    }
  }

  return valide;
}

// ============================================================
// SOUMISSION FINALE — Créer le compte
// ============================================================
function soumettreInscription() {
  afficherLoader(true);
  cacherErreurGlobale();

  // Récupérer les genres cochés
  var genresCoches = document.querySelectorAll('input[name="genres"]:checked');
  var genres = [];
  for (var i = 0; i < genresCoches.length; i++) {
    genres.push(genresCoches[i].value);
  }

  // Sauvegarder dans state
  state.prenom        = document.getElementById('prenom').value.trim();
  state.nom           = document.getElementById('nom').value.trim();
  state.pseudo        = document.getElementById('pseudo').value.trim();
  state.dateNaissance = document.getElementById('dateNaissance').value || null;
  state.ville         = document.getElementById('ville').value.trim() || null;
  state.plateforme    = document.getElementById('plateforme').value || null;
  state.genresPreferes = genres;
  state.bio           = document.getElementById('bio').value.trim() || null;

  // 1. Créer le compte Firebase
  inscrireUtilisateur(state.email, state.motDePasse, function(user, err) {
    if (err) {
      afficherLoader(false);
      afficherErreurGlobale(traduireErreurFirebase(err.code));
      allerEtape(1); // Retour étape 1 si erreur Firebase
      return;
    }

    // 2. Envoyer l'email de vérification
    user.sendEmailVerification()
      .then(function() {
        console.log('Email de vérification envoyé à', user.email);
      })
      .catch(function(e) {
        console.warn('Erreur envoi email vérification:', e);
      });

    // 3. Créer le profil dans le backend
    var donneesBackend = {
      uid:             user.uid,
      email:           user.email,
      prenom:          state.prenom,
      nom:             state.nom,
      pseudo:          state.pseudo,
      dateNaissance:   state.dateNaissance,
      ville:           state.ville,
      plateforme:      state.plateforme || 'PC',
      genresPreferes:  state.genresPreferes,
      bio:             state.bio || '',
      avatar:          '🎮',
      dateInscription: new Date().toISOString(),
      emailConfirme:   false
    };

    // POST pour créer le profil
fetch('/api/profils', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(donneesBackend)
})
.then(function(response) {
  return response.json();
})
.then(function(result) {
  afficherLoader(false);
  console.log('Profil créé dans le backend:', result);

  // Afficher l'étape confirmation
  var emailAffiche = document.getElementById('email-affiche');
  if (emailAffiche) emailAffiche.textContent = user.email;

  allerEtape(3);
})
.catch(function(err) {
  afficherLoader(false);
  console.warn('Profil backend non sauvegardé:', err);

  // On continue quand même vers étape 3
  var emailAffiche = document.getElementById('email-affiche');
  if (emailAffiche) emailAffiche.textContent = user.email;

  allerEtape(3);
});

// ============================================================
// TRADUCTION ERREURS FIREBASE
// ============================================================
function traduireErreurFirebase(code) {
  var erreurs = {
    'auth/email-already-in-use': 'Cet email est déjà utilisé. Essayez de vous connecter.',
    'auth/weak-password':        'Mot de passe trop faible (minimum 6 caractères Firebase).',
    'auth/invalid-email':        'Adresse email invalide.',
    'auth/network-request-failed': 'Erreur réseau. Vérifiez votre connexion.',
    'auth/too-many-requests':    'Trop de tentatives. Réessayez dans quelques minutes.'
  };
  return erreurs[code] || 'Erreur : ' + (code || 'inconnue');
}

// ============================================================
// INIT — DOMContentLoaded
// ============================================================
document.addEventListener('DOMContentLoaded', function() {

  // ── Toggle mot de passe visible/caché ──
  var toggleBtn = document.getElementById('toggle-mdp');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function() {
      var input = document.getElementById('motDePasse');
      if (!input) return;
      if (input.type === 'password') {
        input.type = 'text';
        toggleBtn.textContent = '🙈';
      } else {
        input.type = 'password';
        toggleBtn.textContent = '👁️';
      }
    });
  }

  // ── Indicateur force mot de passe ──
  var mdpInput = document.getElementById('motDePasse');
  if (mdpInput) {
    mdpInput.addEventListener('input', function() {
      afficherForceMdp(this.value);
    });
  }

  // ── Compteur bio ──
  var bioInput = document.getElementById('bio');
  var compteur = document.getElementById('compteur-bio');
  if (bioInput && compteur) {
    bioInput.addEventListener('input', function() {
      compteur.textContent = this.value.length;
    });
  }

  // ── BOUTON ÉTAPE 1 → ÉTAPE 2 ──
  var btnEtape1 = document.getElementById('btn-etape1');
  if (btnEtape1) {
    btnEtape1.addEventListener('click', function() {
      if (!validerEtape1()) return;

      // Sauvegarder dans state
      state.email     = document.getElementById('email').value.trim();
      state.motDePasse = document.getElementById('motDePasse').value;

      allerEtape(2);
    });
  }

  // ── BOUTON RETOUR ÉTAPE 2 → ÉTAPE 1 ──
  var btnRetour1 = document.getElementById('btn-retour-1');
  if (btnRetour1) {
    btnRetour1.addEventListener('click', function() {
      allerEtape(1);
    });
  }

  // ── BOUTON ÉTAPE 2 → CRÉER LE COMPTE ──
  var btnEtape2 = document.getElementById('btn-etape2');
  if (btnEtape2) {
    btnEtape2.addEventListener('click', function() {
      if (!validerEtape2()) return;
      soumettreInscription();
    });
  }

  // ── BOUTON VÉRIFIER EMAIL ──
  var btnVerifier = document.getElementById('btn-verifier');
  if (btnVerifier) {
    btnVerifier.addEventListener('click', function() {
      var user = auth && auth.currentUser ? auth.currentUser : null;

      if (!user) {
        afficherMessageVerification('Aucun utilisateur connecté.', 'erreur');
        return;
      }

      // Recharger l'utilisateur pour avoir emailVerified à jour
      user.reload()
        .then(function() {
          if (user.emailVerified) {
            afficherMessageVerification('✅ Email confirmé ! Redirection...', 'succes');
            setTimeout(function() {
              window.location.href = 'profil.html';
            }, 2000);
          } else {
            afficherMessageVerification(
              '❌ Email pas encore confirmé. Vérifiez votre boîte mail.',
              'erreur'
            );
          }
        })
        .catch(function(e) {
          afficherMessageVerification('Erreur lors de la vérification.', 'erreur');
        });
    });
  }

  // ── BOUTON RENVOYER EMAIL ──
  var btnRenvoyer = document.getElementById('btn-renvoyer');
  if (btnRenvoyer) {
    btnRenvoyer.addEventListener('click', function() {
      var user = auth && auth.currentUser ? auth.currentUser : null;

      if (!user) {
        afficherMessageVerification('Aucun utilisateur connecté.', 'erreur');
        return;
      }

      user.sendEmailVerification()
        .then(function() {
          afficherMessageVerification('📨 Email renvoyé ! Vérifiez votre boîte mail.', 'succes');
        })
        .catch(function(e) {
          if (e.code === 'auth/too-many-requests') {
            afficherMessageVerification('Trop de tentatives. Attendez quelques minutes.', 'erreur');
          } else {
            afficherMessageVerification('Erreur lors de l\'envoi.', 'erreur');
          }
        });
    });
  }

});

// ============================================================
// AFFICHER MESSAGE VÉRIFICATION (étape 3)
// ============================================================
function afficherMessageVerification(message, type) {
  var el = document.getElementById('message-verification');
  if (!el) return;
  el.textContent = message;
  el.className = 'message-verification ' + type + ' visible';

  // Cacher après 5 secondes si c'est pas un succès de redirection
  if (type !== 'succes') {
    setTimeout(function() {
      el.classList.remove('visible');
    }, 5000);
  }
}
