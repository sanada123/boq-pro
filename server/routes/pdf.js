import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { extractPdfText } from '../services/pdf.js';

const router = Router();
router.use(authenticateToken);

// POST /api/pdf/extract
router.post('/extract', async (req, res) => {
  try {
    const { file_url } = req.body;
    if (!file_url) {
      return res.status(400).json({ error: 'file_url is required' });
    }
    const result = await extractPdfText(file_url);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
