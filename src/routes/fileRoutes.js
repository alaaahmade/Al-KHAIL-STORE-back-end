// File upload/download routes
import express from 'express';
import multer from 'multer';
import { fileStorage } from '../utils/fileStorage.js';
const fileRoutes = express.Router();
const upload = multer();

/**
 * @swagger
 * /api/v1/files/upload:
 *   post:
 *     summary: Upload a file
 *     tags: [Files]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 url:
 *                   type: string
 *                 fileName:
 *                   type: string
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/v1/files/url/{fileName}:
 *   get:
 *     summary: Get a signed or direct URL for a file
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: fileName
 *         schema:
 *           type: string
 *         required: true
 *         description: Name of the file
 *     responses:
 *       200:
 *         description: URL retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 url:
 *                   type: string
 *       404:
 *         description: File not found
 *       500:
 *         description: Server error
 */
fileRoutes.get('/url/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    const url = await fileStorage.getFileUrl(fileName);
    res.json({ success: true, url });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /api/v1/files/{fileName}:
 *   delete:
 *     summary: Delete a file
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: fileName
 *         schema:
 *           type: string
 *         required: true
 *         description: Name of the file to delete
 *     responses:
 *       200:
 *         description: File deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       404:
 *         description: File not found
 *       500:
 *         description: Server error
 */
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
