import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { invokeLLM } from '../services/llm.js';

const router = Router();
router.use(authenticateToken);

// POST /api/llm/invoke
router.post('/invoke', async (req, res) => {
  try {
    const { prompt, file_urls, response_json_schema } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'prompt is required' });
    }

    const result = await invokeLLM({ prompt, file_urls, response_json_schema });
    res.json(result);
  } catch (err) {
    console.error('LLM error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
