const path = require('path');
const express = require('express');
const cors = require('cors');
const jeuxRoutes = require('./routes/jeuxRoutes');
const profilRoutes = require('./routes/profilRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/jeux', jeuxRoutes);
app.use('/api/profils', profilRoutes);

// Servir les fichiers statiques du front-end depuis la racine du projet
app.use(express.static(path.join(__dirname, '..')));

app.use((req, res) => {
  res.status(404).json({ error: 'Ressource introuvable' });
});

app.listen(port, () => {
  console.log(`GameVault backend démarré sur http://localhost:${port}`);
  console.log('Accédez ensuite à http://localhost:' + port + '/index.html');
});
