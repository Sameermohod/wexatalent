import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { verifyConnection } from './config/neo4j';

// Import Routes
import authRoutes from './routes/auth.routes';
import developerRoutes from './routes/developer.routes';
import companyRoutes from './routes/company.routes';
import jobRoutes from './routes/job.routes';
import recommendationRoutes from './routes/recommendation.routes';
import graphRoutes from './routes/graph.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: '*', // Allow all during demo, or configure specifically if needed
  credentials: true
}));

// Body Parsers & Loggers
app.use(express.json());
import { neo4jSanitizer } from './middleware/sanitizer';
app.use(neo4jSanitizer);
app.use(morgan('dev'));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Register Api Routes
app.use('/api/auth', authRoutes);
app.use('/api/developers', developerRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/graph', graphRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start Server after DB validation
const startServer = async () => {
  const isConnected = await verifyConnection();
  if (!isConnected) {
    console.warn('WARNING: Running backend without an active CognoDB/Neo4j connection database! Some endpoints will fail.');
  }

  app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
  });
};

startServer();
