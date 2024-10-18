const Playlist = require('../models/playlist');
const MediaFile = require('../models/mediaFile');
const Device = require('../models/device');

// Criar uma nova playlist
const createPlaylist = async (req, res) => {
    try {
        const { title, description, mediaFileIds, deviceIds } = req.body;
        const playlist = new Playlist({
            title,
            description,
            mediaFiles: mediaFileIds,
            devices: deviceIds,
        });
        await playlist.save();
        res.status(201).json(playlist);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar a playlist.' });
    }
};

// Listar todas as playlists
const listPlaylists = async (req, res) => {
    try {
        const playlists = await Playlist.find().populate('mediaFiles').populate('devices');
        res.json(playlists);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar as playlists.' });
    }
};

// Atualizar playlist de um dispositivo
const updateDevicePlaylist = async (req, res) => {
    try {
        const { deviceId, playlistId } = req.body;
        const device = await Device.findByIdAndUpdate(deviceId, { playlist: playlistId, lastUpdated: new Date() }, { new: true });
        res.json(device);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar a playlist do dispositivo.' });
    }
};

module.exports = { createPlaylist, listPlaylists, updateDevicePlaylist };
