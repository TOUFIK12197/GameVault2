const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', 'data', 'profils.json');

function lireProfils() {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

function ecrireProfils(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function getProfil(uid) {
  const profils = lireProfils();
  return profils.find((profil) => profil.uid === uid) || null;
}

function upsertProfil(uid, profil) {
  const profils = lireProfils();
  const index = profils.findIndex((p) => p.uid === uid);
  const profilMiseAJour = Object.assign({ uid: uid }, profil);

  if (index === -1) {
    profils.push(profilMiseAJour);
  } else {
    profils[index] = Object.assign({}, profils[index], profilMiseAJour);
  }

  ecrireProfils(profils);
  return profilMiseAJour;
}

module.exports = {
  getProfil,
  upsertProfil
};
