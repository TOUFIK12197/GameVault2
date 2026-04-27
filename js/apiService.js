// ============================================================
// apiService.js — couche de service front-end pour l’API back-end
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyCIsgMGrAktUHWwDQ_ecW7SBPLMcihfksU",
  authDomain: "gamevault-67e99.firebaseapp.com",
  projectId: "gamevault-67e99",
  storageBucket: "gamevault-67e99.firebasestorage.app",
  messagingSenderId: "640293950260",
  appId: "1:640293950260:web:782dbfb152b7c272ed0b61"
};

if (typeof firebase !== 'undefined' && firebase.apps && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

var auth = typeof firebase !== 'undefined' ? firebase.auth() : null;
var backendMode = window.location.protocol.indexOf('http') === 0;
var backendBaseUrl = '/api';

function backendFetch(route, options) {
  options = options || {};
  options.headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
  return fetch(backendBaseUrl + route, options)
    .then(function(response) {
      if (!response.ok) {
        return response.text().then(function(text) {
          throw new Error('API error ' + response.status + ': ' + (text || response.statusText));
        });
      }
      if (response.status === 204) return null;
      return response.json();
    });
}

function activerBackendApi(baseUrl) {
  backendMode = true;
  backendBaseUrl = baseUrl || '/api';
}

function getCurrentUserId() {
  return auth && auth.currentUser ? auth.currentUser.uid : null;
}

function connexionAnonyme(callback) {
  if (!auth) {
    console.error('Firebase Auth non initialisé.');
    if (callback) callback(null);
    return;
  }
  if (auth.currentUser) {
    if (callback) callback(auth.currentUser);
    return;
  }
  auth.signInAnonymously()
    .then(function(userCredential) {
      console.log('Connexion anonyme Firebase OK', userCredential.user.uid);
      if (callback) callback(userCredential.user);
    })
    .catch(function(error) {
      console.error('Erreur de connexion anonyme Firebase :', error);
      if (callback) callback(null);
    });
}

function inscrireUtilisateur(email, motDePasse, callback) {
  if (!auth) {
    if (callback) callback(null, new Error('Firebase Auth non initialisé.'));
    return;
  }
  auth.createUserWithEmailAndPassword(email, motDePasse)
    .then(function(userCredential) {
      console.log('Inscription réussie', userCredential.user.uid);
      if (callback) callback(userCredential.user, null);
    })
    .catch(function(error) {
      console.error('Erreur inscription Firebase :', error);
      if (callback) callback(null, error);
    });
}

function connexionUtilisateur(email, motDePasse, callback) {
  if (!auth) {
    if (callback) callback(null, new Error('Firebase Auth non initialisé.'));
    return;
  }
  auth.signInWithEmailAndPassword(email, motDePasse)
    .then(function(userCredential) {
      console.log('Connexion réussie', userCredential.user.uid);
      if (callback) callback(userCredential.user, null);
    })
    .catch(function(error) {
      console.error('Erreur de connexion Firebase :', error);
      if (callback) callback(null, error);
    });
}

function deconnexionUtilisateur(callback) {
  if (!auth) {
    if (callback) callback(new Error('Firebase Auth non initialisé.'));
    return;
  }
  auth.signOut()
    .then(function() {
      console.log('Déconnexion réussie');
      if (callback) callback(null);
    })
    .catch(function(error) {
      console.error('Erreur de déconnexion Firebase :', error);
      if (callback) callback(error);
    });
}

function initialiserDonnees(callback) {
  if (!backendMode) {
    if (callback) callback();
    return;
  }
  getJeux(callback);
}

function getJeux(callback) {
  if (!backendMode) {
    if (callback) callback([]);
    return;
  }
  backendFetch('/jeux')
    .then(function(jeux) {
      if (callback) callback(jeux);
    })
    .catch(function(err) {
      console.error('Erreur getJeux backend:', err);
      if (callback) callback([]);
    });
}

function getJeuById(id, callback) {
  if (!backendMode) {
    if (callback) callback(null);
    return;
  }
  backendFetch('/jeux/' + encodeURIComponent(id))
    .then(function(jeu) {
      if (callback) callback(jeu);
    })
    .catch(function(err) {
      console.error('Erreur getJeuById backend:', err);
      if (callback) callback(null);
    });
}

function ajouterJeu(nouveauJeu, callback) {
  if (!backendMode) {
    if (callback) callback(null);
    return;
  }
  nouveauJeu.commentaires = [];
  nouveauJeu.favoris = false;
  nouveauJeu.note = nouveauJeu.note || 0;
  nouveauJeu.image = nouveauJeu.image || 'images/jeux/default.jpg';
  nouveauJeu.dateAjout = new Date().toISOString();
  nouveauJeu.auteurId = getCurrentUserId();
  if (nouveauJeu.lienTelechargement === undefined || nouveauJeu.lienTelechargement === null) {
    nouveauJeu.lienTelechargement = '';
  }
  backendFetch('/jeux', {
    method: 'POST',
    body: JSON.stringify(nouveauJeu)
  })
    .then(function(result) {
      if (callback) callback(result ? result.id : null);
    })
    .catch(function(err) {
      console.error('Erreur ajouterJeu backend:', err);
    });
}

function mettreAJourJeu(id, donnees, callback) {
  if (!backendMode) {
    if (callback) callback();
    return;
  }
  backendFetch('/jeux/' + encodeURIComponent(id), {
    method: 'PUT',
    body: JSON.stringify(donnees)
  })
    .then(function() {
      if (callback) callback();
    })
    .catch(function(err) {
      console.error('Erreur mettreAJourJeu backend:', err);
    });
}

function supprimerJeu(id, callback) {
  if (!backendMode) {
    if (callback) callback();
    return;
  }
  backendFetch('/jeux/' + encodeURIComponent(id), {
    method: 'DELETE'
  })
    .then(function() {
      if (callback) callback();
    })
    .catch(function(err) {
      console.error('Erreur supprimerJeu backend:', err);
    });
}

function toggleFavori(id, callback) {
  getJeuById(id, function(jeu) {
    if (jeu) {
      var nouvelleValeur = !jeu.favoris;
      mettreAJourJeu(id, { favoris: nouvelleValeur }, function() {
        if (callback) callback(nouvelleValeur);
      });
    }
  });
}

function ajouterCommentaire(jeuId, commentaire, callback) {
  if (!backendMode) {
    if (callback) callback([]);
    return;
  }
  var payload = {
    auteur: commentaire.auteur,
    texte: commentaire.texte,
    auteurId: getCurrentUserId()
  };
  backendFetch('/jeux/' + encodeURIComponent(jeuId) + '/commentaires', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
    .then(function(commentaires) {
      if (callback) callback(commentaires);
    })
    .catch(function(err) {
      console.error('Erreur ajouterCommentaire backend:', err);
    });
}

function supprimerCommentaireDB(jeuId, commentaireId, callback) {
  if (!backendMode) {
    if (callback) callback([]);
    return;
  }
  backendFetch('/jeux/' + encodeURIComponent(jeuId) + '/commentaires/' + encodeURIComponent(commentaireId), {
    method: 'DELETE'
  })
    .then(function(commentaires) {
      if (callback) callback(commentaires);
    })
    .catch(function(err) {
      console.error('Erreur supprimerCommentaireDB backend:', err);
    });
}

function getProfil(uid, callback) {
  if (!backendMode) {
    if (callback) callback(getProfilLocal());
    return;
  }
  backendFetch('/profils/' + encodeURIComponent(uid))
    .then(function(profil) {
      if (callback) callback(profil);
    })
    .catch(function(err) {
      console.error('Erreur getProfil backend:', err);
      if (callback) callback(getProfilLocal());
    });
}

function sauvegarderProfil(uid, profil, callback) {
  if (!backendMode) {
    sauvegarderProfilLocal(profil);
    if (callback) callback();
    return;
  }
  backendFetch('/profils/' + encodeURIComponent(uid), {
    method: 'PUT',
    body: JSON.stringify(profil)
  })
    .then(function() {
      if (callback) callback();
    })
    .catch(function(err) {
      console.error('Erreur sauvegarderProfil backend:', err);
      if (callback) callback(err);
    });
}

function getProfilLocal() {
  var profil = localStorage.getItem('gamevault_profil');
  if (profil) return JSON.parse(profil);
  return {
    pseudo: 'GamerPro',
    email: 'gamer@gamevault.fr',
    bio: 'Passionné de jeux vidéo !',
    avatar: '🎮',
    plateforme: 'PC'
  };
}

function sauvegarderProfilLocal(profil) {
  localStorage.setItem('gamevault_profil', JSON.stringify(profil));
}

function migrerProfilLocalStorage(uid, callback) {
  var profilTexte = localStorage.getItem('gamevault_profil');
  if (!profilTexte) {
    if (callback) callback();
    return;
  }
  var profil;
  try {
    profil = JSON.parse(profilTexte);
  } catch (err) {
    localStorage.removeItem('gamevault_profil');
    if (callback) callback();
    return;
  }
  profil = profil || {};
  profil.pseudo = profil.pseudo || 'GamerPro';
  profil.email = profil.email || '';
  profil.avatar = profil.avatar || '🎮';
  profil.plateforme = profil.plateforme || 'PC';
  profil.bio = profil.bio || '';
  sauvegarderProfil(uid, profil, function() {
    localStorage.removeItem('gamevault_profil');
    if (callback) callback();
  });
}

function rechercherJeux(saisie) {
  return {
    requeteVulnerable:
      "SELECT * FROM jeux WHERE titre LIKE '%" + saisie +
      "%' OR genre = '" + saisie + "';",
    requeteSecurisee:
      "SELECT * FROM jeux WHERE titre LIKE ? OR genre = ?;\n" +
      "// Paramètres : ['%" + saisie + "%', '" + saisie + "']"
  };
}
