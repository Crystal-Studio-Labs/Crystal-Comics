import express from 'express';
import cors from 'cors';
import { CONFIG } from './config.js';
import storageRoutes from './routes/storage.js';
import discordRoutes from './routes/discord.js';
import paymentRoutes from './routes/payment.js';
import { startKeepAliveScheduler, runKeepAlivePingAll } from './keep-alive-db.js';

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use('/api/storage', storageRoutes);
app.use('/api/discord', discordRoutes);
app.use('/api/payment', paymentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Crystal Comics API Backend',
    timestamp: new Date().toISOString()
  });
});

// Manual/External Cron Keep-Alive Ping endpoint
app.get('/api/keep-alive/ping', async (req, res) => {
  const results = await runKeepAlivePingAll();
  res.json({
    success: true,
    summary: 'Supabase heartbeat pings executed',
    results
  });
});

app.listen(CONFIG.PORT, () => {
  console.log(`⚡ Crystal Comics Express API Server running on port ${CONFIG.PORT}`);
  console.log(`➜ Health Check: http://localhost:${CONFIG.PORT}/api/health`);
  console.log(`➜ Keep-Alive Ping: http://localhost:${CONFIG.PORT}/api/keep-alive/ping`);
  
  // Start background 48-hour keep-alive scheduler
  startKeepAliveScheduler();
});
