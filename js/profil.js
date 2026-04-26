// ============================================================
//  profil.js — Gestion du profil + CSRF
// ============================================================

// ============================================================
//  Génération token CSRF
// ============================================================
function genererCSRFToken() {
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var token = '';
  for (var i = 0; i < 32; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

var SESSION_TOKEN = genererCSRFToken();

function afficherProfilData(profil) {
  if (!profil) return;

  var avatarEl = document.getElementById('profil-avatar');
  var pseudoEl = document.getElementById('profil-pseudo');
  var emailEl  = document.getElementById('profil-email');
  var bioEl    = document.getElementById('profil-bio');
  var platEl   = document.getElementById('profil-plateforme');

  if (avatarEl) avatarEl.textContent = profil.avatar    || '🎮';
  if (pseudoEl) pseudoEl.textContent = profil.pseudo    || '';
  if (emailEl)  emailEl.textContent  = profil.email     || '';
  if (bioEl)    bioEl.textContent    = profil.bio       || '';
  if (platEl)   platEl.textContent   = profil.plateforme || '';

  var pseudoInput = document.getElementById('profil-pseudo-input');
  var avatarInput = document.getElementById('profil-avatar-input');
  var emailInput  = document.getElementById('profil-email-input');
  var bioInput    = document.getElementById('profil-bio-input');
  var platInput   = document.getElementById('profil-plateforme-input');

  if (pseudoInput) pseudoInput.value = profil.pseudo    || '';
  if (avatarInput) avatarInput.value = profil.avatar    || '🎮';
  if (emailInput)  emailInput.value  = profil.email     || '';
  if (bioInput)    bioInput.value    = profil.bio       || '';
  if (platInput)   platInput.value   = profil.plateforme || 'PC';
}

// ============================================================
//  Affichage du profil
// ============================================================
function setAuthentificationUI(user) {
  var connexion = document.getElementById('connexion-section');
  var profilSection = document.getElementById('profil-section');
  var userEmail = document.getElementById('profil-user-email');

  if (!connexion || !profilSection) return;

  if (!user || user.isAnonymous) {
    connexion.style.display = 'block';
    profilSection.style.display = 'none';
    if (userEmail) userEmail.textContent = '';
    return;
  }

  connexion.style.display = 'none';
  profilSection.style.display = 'block';
  if (userEmail) userEmail.textContent = 'Connecté en tant que ' + (user.email || 'Utilisateur');
}

function afficherMessageConnexion(message, isErreur) {
  var messageEl = document.getElementById('connexion-message');
  if (!messageEl) return;
  messageEl.textContent = message;
  messageEl.style.display = 'block';
  messageEl.style.color = isErreur ? '#f44336' : '#00c853';
}

function afficherProfil() {
  var profil = getProfil();
  if (!profil) return;
  afficherProfilData(profil);
}

// ============================================================
//  Affichage des favoris
// ============================================================
function demarrerFirebaseAuth() {
  if (typeof auth === 'undefined') return;
  auth.onAuthStateChanged(function(user) {
    if (!user || user.isAnonymous) {
      setAuthentificationUI(null);
      return;
    }

    setAuthentificationUI(user);
    afficherFavoris();
    migrerProfilLocalStorage(user.uid, function() {
      getProfilFirestore(user.uid, function(profil) {
        if (!profil) {
          profil = {
            pseudo: 'GamerPro',
            email: user.email || '',
            bio: 'Passionné de jeux vidéo !',
            avatar: '🎮',
            plateforme: 'PC'
          };
          sauvegarderProfilFirestore(user.uid, profil, function() {
            afficherProfilData(profil);
          });
        } else {
          afficherProfilData(profil);
        }
      });
    });
  });
}

function afficherFavoris() {
  var grid  = document.getElementById('favoris-grid');
  var vide  = document.getElementById('favoris-vide');
  if (!grid) return;

  getJeux(function(jeux) {
    var favoris = [];

    for (var i = 0; i < jeux.length; i++) {
      if (jeux[i].favoris) favoris.push(jeux[i]);
    }

    if (favoris.length === 0) {
      if (vide) vide.style.display = 'block';
      grid.innerHTML = '';
      return;
    }

    if (vide) vide.style.display = 'none';
    grid.innerHTML = '';

    for (var j = 0; j < favoris.length; j++) {
      grid.appendChild(creerCarteJeu(favoris[j]));
    }
  });
}

// ============================================================
//  Validation profil
// ============================================================
function validerProfil() {
  var valide = true;

  var pseudo = document.getElementById('profil-pseudo-input').value.trim();
  var email  = document.getElementById('profil-email-input').value.trim();
  var avatar = document.getElementById('profil-avatar-input').value.trim();
  var bio    = document.getElementById('profil-bio-input').value.trim();

  var errPseudo = document.getElementById('err-pseudo');
  var errEmail  = document.getElementById('err-email');

  if (errPseudo) { errPseudo.textContent = ''; errPseudo.style.display = 'none'; }
  if (errEmail)  { errEmail.textContent  = ''; errEmail.style.display  = 'none'; }

  if (pseudo.length < 2 || pseudo.length > 40) {
    if (errPseudo) {
      errPseudo.textContent   = '⚠️ Pseudo entre 2 et 40 caractères.';
      errPseudo.style.display = 'block';
    }
    valide = false;
  }

  var regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regexEmail.test(email)) {
    if (errEmail) {
      errEmail.textContent   = '⚠️ Adresse email invalide.';
      errEmail.style.display = 'block';
    }
    valide = false;
  }

  if (avatar.length > 5) {
    var errAvatar = document.getElementById('err-avatar');
    if (errAvatar) {
      errAvatar.textContent   = '⚠️ Avatar trop long (max 5 caractères).';
      errAvatar.style.display = 'block';
    }
    valide = false;
  }

  if (bio.length > 200) {
    var errBio = document.getElementById('err-bio');
    if (errBio) {
      errBio.textContent   = '⚠️ Bio trop longue (max 200 caractères).';
      errBio.style.display = 'block';
    }
    valide = false;
  }

  return valide;
}

// ============================================================
//  Initialisation
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  demarrerFirebaseAuth();
  afficherFavoris();

  var tokenInput   = document.getElementById('csrf-token');
  var tokenVisible = document.getElementById('csrf-token-visible');
  if (tokenInput)   tokenInput.value       = SESSION_TOKEN;
  if (tokenVisible) tokenVisible.textContent = SESSION_TOKEN;

  var btnConnexion = document.getElementById('btn-connexion');
  var btnInscription = document.getElementById('btn-inscription');
  var btnDeconnexion = document.getElementById('btn-deconnexion');

  if (btnConnexion) {
    btnConnexion.addEventListener('click', function() {
      var email = document.getElementById('connexion-email').value.trim();
      var motDePasse = document.getElementById('connexion-password').value;
      if (!email || !motDePasse) {
        afficherMessageConnexion('Veuillez saisir un email et un mot de passe.', true);
        return;
      }
      connexionUtilisateur(email, motDePasse, function(user, err) {
        if (err) {
          afficherMessageConnexion('Erreur de connexion : ' + err.message, true);
          return;
        }
        afficherMessageConnexion('Connexion réussie.', false);
        afficherFavoris();
      });
    });
  }

  if (btnInscription) {
    btnInscription.addEventListener('click', function() {
      var email = document.getElementById('connexion-email').value.trim();
      var motDePasse = document.getElementById('connexion-password').value;
      if (!email || !motDePasse) {
        afficherMessageConnexion('Veuillez saisir un email et un mot de passe.', true);
        return;
      }
      inscrireUtilisateur(email, motDePasse, function(user, err) {
        if (err) {
          afficherMessageConnexion('Erreur d’inscription : ' + err.message, true);
          return;
        }
        afficherMessageConnexion('Compte créé. Vous êtes connecté.', false);
        afficherFavoris();
      });
    });
  }

  if (btnDeconnexion) {
    btnDeconnexion.addEventListener('click', function() {
      deconnexionUtilisateur(function(err) {
        if (err) {
          afficherMessageConnexion('Erreur de déconnexion : ' + err.message, true);
          return;
        }
        afficherMessageConnexion('Déconnecté.', false);
        afficherFavoris();
      });
    });
  }

  var form = document.getElementById('form-profil');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    var tokenRecu  = document.getElementById('csrf-token').value;
    var errCSRF    = document.getElementById('profil-csrf-error');
    var succes     = document.getElementById('profil-succes');

    // Vérification CSRF
    if (tokenRecu !== SESSION_TOKEN) {
      if (errCSRF) errCSRF.style.display = 'block';
      if (succes)  succes.style.display  = 'none';
      return;
    }

    if (!validerProfil()) return;

    var avatarInput = document.getElementById('profil-avatar-input');
    var platInput   = document.getElementById('profil-plateforme-input');

    var profil = {
      pseudo:     document.getElementById('profil-pseudo-input').value.trim(),
      avatar:     avatarInput ? avatarInput.value.trim() || '🎮' : '🎮',
      email:      document.getElementById('profil-email-input').value.trim(),
      bio:        document.getElementById('profil-bio-input').value.trim(),
      plateforme: platInput ? platInput.value : 'PC'
    };

    var user = typeof auth !== 'undefined' ? auth.currentUser : null;
    if (user) {
      sauvegarderProfilFirestore(user.uid, profil, function() {
        afficherProfilData(profil);
      });
    } else {
      sauvegarderProfil(profil);
      afficherProfilData(profil);
    }

    if (errCSRF) errCSRF.style.display = 'none';
    if (succes) {
      succes.style.display = 'block';
      setTimeout(function() {
        succes.style.display = 'none';
      }, 3000);
    }
  });
});
