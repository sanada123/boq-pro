import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Routes
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import planReadingRoutes from './routes/planReadings.js';
import quantityItemRoutes from './routes/quantityItems.js';
import standardRoutes from './routes/standards.js';
import priceRoutes from './routes/prices.js';
import formulaRoutes from './routes/formulas.js';
import profileRoutes from './routes/profiles.js';
import uploadRoutes from './routes/upload.js';
import llmRoutes from './routes/llm.js';
import pdfRoutes from './routes/pdf.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Static files — uploaded files
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/plan-readings', planReadingRoutes);
app.use('/api/quantity-items', quantityItemRoutes);
app.use('/api/standards', standardRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/formulas', formulaRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/llm', llmRoutes);
app.use('/api/pdf', pdfRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Production: serve Vite-built frontend
const distPath = join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// SPA catch-all — must be after all API routes
app.get('*', (_req, res) => {
  res.sendFile(join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`BOQ Pro server running on http://localhost:${PORT}`);
});
