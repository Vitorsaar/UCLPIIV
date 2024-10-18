const Device = require('../models/device');

// Criar um novo dispositivo
const createDevice = async (req, res) => {
    try {
        const { name } = req.body;
        const device = new Device({ name });
        await device.save();
        res.status(201).json(device);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar o dispositivo.' });
    }
};

// Listar dispositivos
const listDevices = async (req, res) => {
    try {
        const devices = await Device.find().populate('playlist');
        res.json(devices);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar dispositivos.' });
    }
};

module.exports = { createDevice, listDevices };
