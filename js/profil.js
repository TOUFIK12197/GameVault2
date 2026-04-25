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

// ============================================================
//  Affichage du profil
// ============================================================
function afficherProfil() {
  var profil = getProfil();
  if (!profil) return;

  // textContent = affichage sécurisé
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

  // Remplir le formulaire
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

  // Token CSRF
  var tokenInput   = document.getElementById('csrf-token');
  var tokenVisible = document.getElementById('csrf-token-visible');
  if (tokenInput)   tokenInput.value       = SESSION_TOKEN;
  if (tokenVisible) tokenVisible.textContent = SESSION_TOKEN;
}

// ============================================================
//  Affichage des favoris
// ============================================================
function demarrerFirebaseAuth() {
  if (typeof auth === 'undefined') return;
  auth.onAuthStateChanged(function(user) {
    if (!user) {
      connexionAnonyme(function() {
        afficherProfil();
      });
    } else {
      afficherProfil();
    }
  });
}

function afficherFavoris() {
  var jeux    = getJeux();
  var favoris = [];

  for (var i = 0; i < jeux.length; i++) {
    if (jeux[i].favoris) favoris.push(jeux[i]);
  }

  var grid  = document.getElementById('favoris-grid');
  var vide  = document.getElementById('favoris-vide');

  if (!grid) return;

  if (favoris.length === 0) {
    if (vide) vide.style.display = 'block';
    return;
  }

  if (vide) vide.style.display = 'none';

  for (var j = 0; j < favoris.length; j++) {
    grid.appendChild(creerCarteJeu(favoris[j]));
  }
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

    sauvegarderProfil({
      pseudo:     document.getElementById('profil-pseudo-input').value.trim(),
      avatar:     avatarInput ? avatarInput.value.trim() || '🎮' : '🎮',
      email:      document.getElementById('profil-email-input').value.trim(),
      bio:        document.getElementById('profil-bio-input').value.trim(),
      plateforme: platInput ? platInput.value : 'PC'
    });

    afficherProfil();

    if (errCSRF) errCSRF.style.display = 'none';
    if (succes) {
      succes.style.display = 'block';
      setTimeout(function() {
        succes.style.display = 'none';
      }, 3000);
    }
  });
});