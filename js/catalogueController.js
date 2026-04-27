// ============================================================
// catalogueController.js — logique de la page catalogue
// ============================================================

var sqlTabActif = 'vulnerable';
var tousLesJeux = [];

function filtrerJeux() {
  var recherche = document.getElementById('recherche')
    ? document.getElementById('recherche').value.trim().toLowerCase() : '';
  var genre = document.getElementById('filtre-genre')
    ? document.getElementById('filtre-genre').value : '';
  var plateforme = document.getElementById('filtre-plateforme')
    ? document.getElementById('filtre-plateforme').value : '';
  var noteMin = document.getElementById('filtre-note')
    ? parseFloat(document.getElementById('filtre-note').value) || 0 : 0;
  var tri = document.getElementById('filtre-tri')
    ? document.getElementById('filtre-tri').value : 'recent';

  var btnClear = document.getElementById('btn-clear');
  if (btnClear) btnClear.style.display = recherche ? 'flex' : 'none';

  mettreAJourSQLDemo(recherche);

  var resultats = [];
  for (var i = 0; i < tousLesJeux.length; i++) {
    var j = tousLesJeux[i];
    var matchR = !recherche ||
      j.titre.toLowerCase().indexOf(recherche) !== -1 ||
      j.genre.toLowerCase().indexOf(recherche) !== -1 ||
      j.developpeur.toLowerCase().indexOf(recherche) !== -1 ||
      j.plateforme.toLowerCase().indexOf(recherche) !== -1;
    var matchG = !genre || j.genre === genre;
    var matchP = !plateforme || j.plateforme === plateforme;
    var matchN = !noteMin || j.note >= noteMin;

    if (matchR && matchG && matchP && matchN) resultats.push(j);
  }

  if (tri === 'note') resultats.sort(function(a,b){ return b.note-a.note; });
  if (tri === 'titre') resultats.sort(function(a,b){ return a.titre.localeCompare(b.titre); });

  afficherJeux(resultats);
}

function mettreAJourSQLDemo(saisie) {
  var demo = document.getElementById('sql-demo');
  var codeEl = document.getElementById('sql-code');
  var warning = document.getElementById('sql-warning');
  if (!demo) return;

  if (!saisie) { demo.style.display = 'none'; return; }

  demo.style.display = 'block';
  var r = rechercherJeux(saisie);

  if (sqlTabActif === 'vulnerable') {
    codeEl.textContent = r.requeteVulnerable;
    codeEl.className = 'sql-code sql-code-danger';
  } else {
    codeEl.textContent = r.requeteSecurisee;
    codeEl.className = 'sql-code sql-code-success';
  }

  var u = saisie.toUpperCase();
  var injection =
    saisie.indexOf("'") !== -1 || saisie.indexOf('"') !== -1 ||
    saisie.indexOf('--') !== -1 || saisie.indexOf(';') !== -1 ||
    u.indexOf(' OR ') !== -1 || u.indexOf('DROP') !== -1 ||
    u.indexOf('UNION') !== -1 || u.indexOf('SELECT') !== -1;

  if (warning) warning.style.display = injection ? 'block' : 'none';
}

function changerSQLTab(tab) {
  sqlTabActif = tab;
  var tabs = document.querySelectorAll('.sql-tab');
  for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove('sql-tab-actif');
  if (tab === 'vulnerable' && tabs[0]) tabs[0].classList.add('sql-tab-actif');
  if (tab === 'secure' && tabs[1]) tabs[1].classList.add('sql-tab-actif');
  var el = document.getElementById('recherche');
  mettreAJourSQLDemo(el ? el.value.trim() : '');
}

function clearRecherche() {
  var input = document.getElementById('recherche');
  if (input) { input.value = ''; input.focus(); }
  filtrerJeux();
}

function basculerFavori(id, bouton) {
  toggleFavori(id, function(estFavori) {
    bouton.textContent = estFavori ? '❤️' : '🤍';
    if (estFavori) bouton.classList.add('actif');
    else bouton.classList.remove('actif');

    for (var i = 0; i < tousLesJeux.length; i++) {
      if (tousLesJeux[i].id === id) {
        tousLesJeux[i].favoris = estFavori;
        break;
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  var params = new URLSearchParams(window.location.search);
  var genre = params.get('genre');

  if (genre) {
    var select = document.getElementById('filtre-genre');
    if (select) select.value = genre;
  }

  initialiserDonnees(function() {
    getJeux(function(jeux) {
      tousLesJeux = jeux;
      afficherJeux(genre ? jeux.filter(function(j) { return j.genre === genre; }) : jeux);
    });
  });

  var els = {
    recherche: document.getElementById('recherche'),
    genre: document.getElementById('filtre-genre'),
    plateforme: document.getElementById('filtre-plateforme'),
    note: document.getElementById('filtre-note'),
    tri: document.getElementById('filtre-tri')
  };

  if (els.recherche) els.recherche.addEventListener('input', filtrerJeux);
  if (els.genre) els.genre.addEventListener('change', filtrerJeux);
  if (els.plateforme) els.plateforme.addEventListener('change', filtrerJeux);
  if (els.note) els.note.addEventListener('change', filtrerJeux);
  if (els.tri) els.tri.addEventListener('change', filtrerJeux);
});
