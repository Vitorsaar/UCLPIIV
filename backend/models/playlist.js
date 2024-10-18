const express = require('express');
const router = express.Router();
const Playlist = require('../models/playlist'); // Certifique-se de que o caminho está correto

// Criar nova playlist
router.post('/', async (req, res) => {
    const { title } = req.body;
    const newPlaylist = new Playlist({ title });

    try {
        await newPlaylist.save();
        res.status(201).json(newPlaylist);
    } catch (error) {
        console.error('Erro ao criar playlist:', error);
        res.status(500).json({ message: 'Erro ao criar a playlist' });
    }
});

// Obter todas as playlists
router.get('/', async (req, res) => {
    try {
        const playlists = await Playlist.find();
        res.status(200).json(playlists);
    } catch (error) {
        console.error('Erro ao buscar playlists:', error);
        res.status(500).json({ message: 'Erro ao buscar playlists' });
    }
});

// Obter mídias da playlist
router.get('/:id/media', async (req, res) => {
    const { id } = req.params;

    try {
        const playlist = await Playlist.findById(id).populate('mediaFiles'); // Popula os arquivos de mídia
        if (!playlist) return res.status(404).json({ message: 'Playlist não encontrada' });

        res.status(200).json(playlist.mediaFiles); // Retorna as mídias da playlist
    } catch (error) {
        console.error('Erro ao buscar mídias da playlist:', error);
        res.status(500).json({ message: 'Erro ao buscar mídias da playlist' });
    }
});

module.exports = router;
