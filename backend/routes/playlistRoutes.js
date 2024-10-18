// backend/routes/playlist.js
const express = require('express');
const router = express.Router();
const Playlist = require('../models/playlist'); // Certifique-se de que o caminho está correto

router.post('/create-playlist', async (req, res) => {
  try {
    const { title, description, mediaFiles, devices } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'O título da playlist é obrigatório.' });
    }

    const newPlaylist = new Playlist({
      title,
      description: description || '', // Garantimos que seja uma string vazia se não for enviado
      mediaFiles: mediaFiles || [],   
      devices: devices || [],         
    });

    await newPlaylist.save();
    res.status(201).json({ message: 'Playlist criada com sucesso' });
  } catch (error) {
    console.error('Erro ao criar playlist:', error);
    res.status(500).json({ message: 'Erro ao criar a playlist', error: error.message });
  }
});

module.exports = router;
