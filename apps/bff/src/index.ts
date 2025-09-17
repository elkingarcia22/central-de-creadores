import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import aiRoutes from './routes/ai';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    iaEnabled: process.env.IA_ENABLE_EXEC === 'true'
  });
});

// AI routes
app.use('/ai', aiRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`BFF server running on port ${PORT}`);
  console.log(`IA execution enabled: ${process.env.IA_ENABLE_EXEC === 'true'}`);
  console.log(`Embeddings dimension: ${process.env.IA_EMBEDDINGS_DIM || 768}`);
});

export default app;
