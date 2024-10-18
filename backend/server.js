const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI;


// Middleware CORS
app.use(cors({
  origin: 'http://localhost:3000', // Substitua pela URL do seu frontend, se necessário
  credentials: true,
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Conectar ao MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado ao MongoDB'))
  .catch((err) => console.error('Erro ao conectar ao MongoDB:', err));

// Definir o schema de Playlist
const playlistSchema = new mongoose.Schema({
  name: String,
  midias: [ // Mudando de media para midias
    {
      name: String,
      url: String
    }
  ]
});

// Criar o modelo de Playlist
const Playlist = mongoose.model('Playlist', playlistSchema);

// Rota de teste
app.get('/', (req, res) => {
  res.send('API do sistema de Mídia Indoor');
});

// Rota para buscar todas as playlists
app.get('/playlists', async (req, res) => {
  try {
    const playlists = await Playlist.find(); // Puxa as playlists do banco de dados
    console.log('Playlists encontradas:', playlists); // Log das playlists
    res.status(200).json(playlists); // Retorna as playlists como resposta
  } catch (error) {
    console.error('Erro ao buscar playlists:', error);
    res.status(500).json({ message: 'Erro ao buscar playlists' });
  }
});

app.post('/playlists', async (req, res) => {
  const { name } = req.body;

  try {
    const newPlaylist = new Playlist({ name }); // Aqui você só precisa passar o nome
    await newPlaylist.save();
    res.status(201).json({ message: 'Playlist criada com sucesso', playlist: newPlaylist });
  } catch (error) {
    console.error('Erro ao criar playlist:', error);
    res.status(500).json({ message: 'Erro ao criar playlist' });
  }
});


// Rota para excluir uma playlist
app.delete('/playlists/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Playlist.findByIdAndDelete(id);
    res.status(200).json({ message: 'Playlist excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir playlist:', error);
    res.status(500).json({ message: 'Erro ao excluir playlist' });
  }
});

// Configuração do multer para upload de mídia
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Pasta onde os arquivos serão armazenados
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nomeia o arquivo com timestamp
  }
});

const upload = multer({ storage: storage });

// Rota para upload de mídia para uma playlist
app.post('/playlists/:id/midias', upload.array('midias'), async (req, res) => {
  try {
    const { id } = req.params;
    const playlist = await Playlist.findById(id);

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist não encontrada' });
    }

    // Adiciona os nomes das mídias ao array de midias da playlist
    const midiasItems = req.files.map((file) => ({
      name: file.originalname,
      url: `/uploads/${file.filename}`,
    }));

    // Concatena as novas mídias à playlist
    playlist.midias = playlist.midias ? playlist.midias.concat(midiasItems) : midiasItems;
    await playlist.save();

    res.status(200).json({ midias: playlist.midias });
  } catch (error) {
    console.error('Erro ao fazer upload de mídia:', error); // Log detalhado
    res.status(500).json({ message: 'Erro ao fazer upload de mídia', error: error.message }); // Incluindo a mensagem de erro
  }
});

// Rota para excluir uma mídia de uma playlist
app.delete('/playlists/:playlistId/midias/:midiaId', async (req, res) => {
  const { playlistId, midiaId } = req.params;

  try {
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).send('Playlist não encontrada');
    }

    // Remove a mídia da lista de mídias da playlist
    playlist.midias = playlist.midias.filter((midia) => midia._id.toString() !== midiaId);
    await playlist.save();

    res.status(200).json({ midias: playlist.midias });
  } catch (error) {
    console.error('Erro ao excluir mídia:', error);
    res.status(500).send('Erro ao excluir mídia');
  }
});

const monitorSchema = new mongoose.Schema({
  name: String, // Nome do monitor
  playlist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Playlist' // Referência à playlist que será associada ao monitor
  }
});

const Monitor = mongoose.model('Monitor', monitorSchema);

app.get('/monitores', async (req, res) => {
  try {
    const monitores = await Monitor.find().populate({
      path: 'playlist',
      populate: { path: 'midias' }
    });
    res.status(200).send(monitores);
  } catch (error) {
    res.status(500).send({ message: 'Erro ao buscar monitores' });
  }
});

app.post('/monitores', async (req, res) => {
  const { name } = req.body;

  try {
    const newMonitor = new Monitor({ name });
    await newMonitor.save();
    res.status(201).json(newMonitor);
  } catch (error) {
    console.error('Erro ao criar monitor:', error);
    res.status(500).json({ message: 'Erro ao criar monitor' });
  }
});

app.delete('/monitores/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Tenta encontrar e excluir o monitor pelo ID
    const deletedMonitor = await Monitor.findByIdAndDelete(id);

    // Se o monitor não for encontrado, retorna 404
    if (!deletedMonitor) {
      return res.status(404).json({ message: 'Monitor não encontrado' });
    }

    res.status(200).json({ message: 'Monitor excluído com sucesso', deletedMonitor });
  } catch (error) {
    console.error('Erro ao excluir monitor:', error);
    res.status(500).json({ message: 'Erro ao excluir monitor' });
  }
});

// Endpoint para associar uma playlist a um monitor
app.post('/monitores/:monitorId/playlists', async (req, res) => {
  const { monitorId } = req.params;
  const { playlistId } = req.body;

  // Validação dos dados recebidos
  if (!playlistId) {
    return res.status(400).json({ message: 'O campo playlistId é obrigatório.' });
  }

  try {
    // Encontrar o monitor pelo ID
    const monitor = await Monitor.findById(monitorId);
    if (!monitor) {
      return res.status(404).json({ message: 'Monitor não encontrado.' });
    }

    // Verificar se a playlist já está associada ao monitor
    if (monitor.playlists.includes(playlistId)) {
      return res.status(400).json({ message: 'A playlist já está associada a este monitor.' });
    }

    // Adicionar a playlist ao monitor
    monitor.playlists.push(playlistId);
    await monitor.save();

    // Log de sucesso
    console.log('Playlist associada com sucesso ao monitor:', monitor);

    // Retorno da resposta
    return res.status(200).json(monitor);
  } catch (error) {
    // Log do erro
    console.error('Erro ao associar playlist ao monitor:', error.message || error);

    // Retorno de erro
    return res.status(500).json({ message: 'Erro ao associar playlist', error: error.message });
  }
});


// Exemplo de código Express para atualizar um monitor
app.put('/monitores/:monitorId/playlists', async (req, res) => {
  const { monitorId } = req.params;
  const { playlistId } = req.body;

  try {
    // Aqui você deve ter lógica para encontrar o monitor e atualizar a playlist
    const monitor = await Monitor.findById(monitorId); // Exemplo, ajuste conforme necessário
    if (!monitor) {
      return res.status(404).send('Monitor não encontrado');
    }

    // Atualiza a playlist do monitor
    monitor.playlistId = playlistId; // Ajuste conforme necessário
    await monitor.save();

    return res.status(200).json(monitor);
  } catch (error) {
    console.error('Erro ao atualizar monitor:', error);
    return res.status(500).send('Erro ao atualizar monitor');
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
