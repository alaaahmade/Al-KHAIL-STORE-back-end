// File upload/download routes
import express from 'express';
import multer from 'multer';
import { fileStorage } from '../utils/fileStorage.js';
const fileRoutes = express.Router();
const upload = multer();

// POST /api/v1/files/upload
fileRoutes.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const { buffer, originalname } = req.file;
    const result = await fileStorage.saveFile(buffer, originalname);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/v1/files/url/:fileName (returns signed or direct URL)
fileRoutes.get('/url/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    const url = await fileStorage.getFileUrl(fileName);
    res.json({ success: true, url });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/v1/files/:fileName
fileRoutes.delete('/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    const removed = await fileStorage.removeFile(fileName);
    res.json({ success: removed });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default fileRoutes;
