// ============================================================
//  data.js — Firebase Firestore
//  ⚠️ REMPLACE TON firebaseConfig CI-DESSOUS
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyCIsgMGrAktUHWwDQ_ecW7SBPLMcihfksU",
  authDomain: "gamevault-67e99.firebaseapp.com",
  projectId: "gamevault-67e99",
  storageBucket: "gamevault-67e99.firebasestorage.app",
  messagingSenderId: "640293950260",
  appId: "1:640293950260:web:782dbfb152b7c272ed0b61"
};

// Initialiser Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
var db = firebase.firestore();
var auth = firebase.auth();

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

// ============================================================
//  Profils Firestore
// ============================================================
function getProfilFirestore(uid, callback) {
  db.collection('utilisateurs').doc(uid).get()
    .then(function(doc) {
      if (doc.exists) {
        callback(doc.data());
      } else {
        callback(null);
      }
    })
    .catch(function(err) {
      console.error('Erreur getProfilFirestore:', err);
      callback(null);
    });
}

function sauvegarderProfilFirestore(uid, profil, callback) {
  db.collection('utilisateurs').doc(uid).set(profil, { merge: true })
    .then(function() {
      if (callback) callback();
    })
    .catch(function(err) {
      console.error('Erreur sauvegarderProfilFirestore:', err);
      if (callback) callback(err);
    });
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

  sauvegarderProfilFirestore(uid, profil, function() {
    localStorage.removeItem('gamevault_profil');
    if (callback) callback();
  });
}

// ============================================================
//  Jeux par défaut
// ============================================================
var JEUX_PAR_DEFAUT = [
  {
    titre:       "The Legend of Zelda: Tears of the Kingdom",
    genre:       "aventure",
    plateforme:  "Switch",
    annee:       2023,
    developpeur: "Nintendo",
    note:        4.9,
    difficulte:  "Moyen",
    description: "Un monde ouvert épique où Link explore Hyrule et les îles célestes. Construisez des machines, résolvez des énigmes et affrontez Ganondorf.",
    image:       "images/jeux/zelda.jpg",
    favoris:     false,
    commentaires: [],
    lienTelechargement: "https://www.nintendo.com/fr-fr/Jeux/Jeux-Nintendo-Switch/The-Legend-of-Zelda-Tears-of-the-Kingdom-1576884.html"
  },
  {
    titre:       "God of War Ragnarök",
    genre:       "action",
    plateforme:  "PS5",
    annee:       2022,
    developpeur: "Santa Monica Studio",
    note:        4.8,
    difficulte:  "Difficile",
    description: "Kratos et Atreus voyagent à travers les Neuf Royaumes pour éviter le Ragnarök.",
    image:       "images/jeux/god-of-war.jpg",
    favoris:     false,
    commentaires: [],
    lienTelechargement: "https://www.playstation.com/fr-fr/games/god-of-war-ragnarok/"
  },
  {
    titre:       "FIFA 23",
    genre:       "sport",
    plateforme:  "PC",
    annee:       2023,
    developpeur: "EA Sports",
    note:        3.8,
    difficulte:  "Facile",
    description: "La simulation de football ultime avec les vraies équipes et championnats.",
    image:       "images/jeux/fifa 23.jpg",
    favoris:     false,
    commentaires: [],
    lienTelechargement:"https://dodi-repacks.site/fifa-23/"
  },
  {
    titre:       "Elden Ring",
    genre:       "rpg",
    plateforme:  "PC",
    annee:       2022,
    developpeur: "FromSoftware",
    note:        4.9,
    difficulte:  "Difficile",
    description: "Un RPG d'action en monde ouvert créé par Hidetaka Miyazaki et George R.R. Martin.",
    image:       "images/jeux/elden-ring.jpg",
    favoris:     false,
    commentaires: [],
    lienTelechargement:"https://steamunlocked.org/elden-ring-free-download/"
  },
  {
    titre:       "Call of Duty: Modern Warfare III",
    genre:       "fps",
    plateforme:  "PC",
    annee:       2023,
    developpeur: "Sledgehammer Games",
    note:        3.5,
    difficulte:  "Moyen",
    description: "Le FPS emblématique de retour avec une campagne intense et un mode Zombies.",
    image:       "images/jeux/cod-mw3.jpg",
    favoris:     false,
    commentaires: [],
    lienTelechargement:"https://dodi-repacks.site/call-of-duty-modern-warfare-3/"
  },
  {
    titre:       "Forza Horizon 5",
    genre:       "course",
    plateforme:  "XBOX",
    annee:       2021,
    developpeur: "Playground Games",
    note:        4.7,
    difficulte:  "Facile",
    description: "Course en monde ouvert au Mexique avec plus de 500 voitures.",
    image:       "images/jeux/forza.jpg",
    favoris:     false,
    commentaires: [],
    lienTelechargement:"https://www.xbox.com/fr-FR/games/store/forza-horizon-5/9NKX70BBCDRN"
  }
];

// ============================================================
//  Initialiser Firestore avec les données par défaut
// ============================================================
function initialiserDonnees(callback) {
  db.collection('jeux').limit(1).get()
    .then(function(snapshot) {
      if (snapshot.empty) {
        console.log('Firestore vide → ajout des jeux par défaut...');
        var promesses = [];
        for (var i = 0; i < JEUX_PAR_DEFAUT.length; i++) {
          promesses.push(db.collection('jeux').add(JEUX_PAR_DEFAUT[i]));
        }
        return Promise.all(promesses);
      } else {
        console.log('Firestore déjà initialisé');
        return Promise.resolve();
      }
    })
    .then(function() {
      if (callback) callback();
    })
    .catch(function(err) {
      console.error('Erreur initialiserDonnees:', err);
      if (callback) callback();
    });
}

// ============================================================
//  Récupérer tous les jeux
// ============================================================
function getJeux(callback) {
  db.collection('jeux').get()
    .then(function(snapshot) {
      var jeux = [];
      snapshot.forEach(function(doc) {
        var jeu          = doc.data();
        jeu.id           = doc.id;
        jeu.commentaires = jeu.commentaires || [];
        jeux.push(jeu);
      });
      console.log('Jeux récupérés : ' + jeux.length);
      if (callback) callback(jeux);
    })
    .catch(function(err) {
      console.error('Erreur getJeux:', err);
      if (callback) callback([]);
    });
}

// ============================================================
//  Récupérer un jeu par ID
// ============================================================
function getJeuById(id, callback) {
  db.collection('jeux').doc(id).get()
    .then(function(doc) {
      if (doc.exists) {
        var jeu          = doc.data();
        jeu.id           = doc.id;
        jeu.commentaires = jeu.commentaires || [];
        if (callback) callback(jeu);
      } else {
        if (callback) callback(null);
      }
    })
    .catch(function(err) {
      console.error('Erreur getJeuById:', err);
      if (callback) callback(null);
    });
}

// ============================================================
//  Ajouter un jeu
// ============================================================
function ajouterJeu(nouveauJeu, callback) {
  var user = auth.currentUser;
  if (!user) {
    console.error('Impossible d’ajouter un jeu : utilisateur non connecté.');
    return;
  }

  nouveauJeu.commentaires = [];
  nouveauJeu.favoris      = false;
  nouveauJeu.note         = nouveauJeu.note || 0;
  nouveauJeu.image        = nouveauJeu.image || 'images/jeux/default.jpg';
  nouveauJeu.dateAjout    = new Date().toISOString();
  nouveauJeu.auteurId     = user.uid;

  // ✅ S'assurer que lienTelechargement est toujours présent
  if (nouveauJeu.lienTelechargement === undefined ||
      nouveauJeu.lienTelechargement === null) {
    nouveauJeu.lienTelechargement = '';
  }

  console.log('Jeu à sauvegarder :', nouveauJeu);

  db.collection('jeux').add(nouveauJeu)
    .then(function(docRef) {
      console.log('Jeu ajouté avec ID :', docRef.id);
      if (callback) callback(docRef.id);
    })
    .catch(function(err) {
      console.error('Erreur ajouterJeu:', err);
    });
}

// ============================================================
//  Supprimer un jeu
// ============================================================
function supprimerJeu(id, callback) {
  db.collection('jeux').doc(id).delete()
    .then(function() {
      console.log('Jeu supprimé : ' + id);
      if (callback) callback();
    })
    .catch(function(err) {
      console.error('Erreur supprimerJeu:', err);
    });
}

// ============================================================
//  Mettre à jour un jeu
// ============================================================
function mettreAJourJeu(id, donnees, callback) {
  db.collection('jeux').doc(id).update(donnees)
    .then(function() {
      if (callback) callback();
    })
    .catch(function(err) {
      console.error('Erreur mettreAJourJeu:', err);
    });
}

// ============================================================
//  Favoris
// ============================================================
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

// ============================================================
//  Ajouter un commentaire
// ============================================================
function ajouterCommentaire(jeuId, commentaire, callback) {
  var user = auth.currentUser;
  getJeuById(jeuId, function(jeu) {
    if (jeu) {
      var commentaires = jeu.commentaires || [];
      commentaires.push({
        id:       Date.now(),
        auteur:   commentaire.auteur,
        auteurId: user ? user.uid : null,
        texte:    commentaire.texte,
        date:     new Date().toLocaleDateString('fr-FR')
      });
      mettreAJourJeu(jeuId, { commentaires: commentaires }, function() {
        if (callback) callback(commentaires);
      });
    }
  });
}

// ============================================================
//  Supprimer un commentaire
// ============================================================
function supprimerCommentaireDB(jeuId, commentaireId, callback) {
  getJeuById(jeuId, function(jeu) {
    if (jeu) {
      var nouveaux = [];
      for (var i = 0; i < jeu.commentaires.length; i++) {
        if (jeu.commentaires[i].id !== commentaireId) {
          nouveaux.push(jeu.commentaires[i]);
        }
      }
      mettreAJourJeu(jeuId, { commentaires: nouveaux }, function() {
        if (callback) callback(nouveaux);
      });
    }
  });
}

// ============================================================
//  Profil — reste en localStorage
// ============================================================
function getProfil() {
  var profil = localStorage.getItem('gamevault_profil');
  if (profil) return JSON.parse(profil);
  return {
    pseudo:     "GamerPro",
    email:      "gamer@gamevault.fr",
    bio:        "Passionné de jeux vidéo !",
    avatar:     "🎮",
    plateforme: "PC"
  };
}

function sauvegarderProfil(profil) {
  localStorage.setItem('gamevault_profil', JSON.stringify(profil));
}

// ============================================================
//  Démo injection SQL
// ============================================================
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
