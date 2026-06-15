// Servidor principal con Express y Socket.IO
// Similar a una clase @SpringBootApplication

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Cargar variables de entorno
dotenv.config();

// Importar rutas
import matchRoutes from './routes/matchRoutes';
import predictionRoutes from './routes/predictionRoutes';
import userRoutes from './routes/userRoutes';
import { setSocketIO } from './config/socket';

const app = express();
const httpServer = createServer(app);

// Configurar Socket.IO para notificaciones en tiempo real
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
});

// Hacer disponible io globalmente
setSocketIO(io);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
}));
app.use(express.json());

// Logger simple (similar a logback en Spring)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '🇦🇷 Prode Mundial 2026 - API funcionando correctamente',
    timestamp: new Date().toISOString(),
  });
});

// Rutas de API (similar a @RequestMapping base path)
app.use('/api/matches', matchRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/users', userRoutes);

// Ruta para obtener leaderboard (alias)
app.use('/api/leaderboard', userRoutes);

// Socket.IO para notificaciones en tiempo real
io.on('connection', (socket) => {
  console.log('👤 Usuario conectado:', socket.id);

  socket.on('disconnect', () => {
    console.log('👋 Usuario desconectado:', socket.id);
  });
});

// Middleware de manejo de errores (similar a @ControllerAdvice)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Error:', err);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    message: err.message,
  });
});

// Ruta 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    path: req.path,
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║  🇦🇷  PRODE MUNDIAL 2026 - Backend API  ⚽   ║');
  console.log('╚═══════════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 API Base: http://localhost:${PORT}/api`);
  console.log(`🔌 WebSocket disponible en puerto ${PORT}`);
  console.log('');
  console.log('Endpoints disponibles:');
  console.log('  GET    /api/matches - Obtener todos los partidos');
  console.log('  GET    /api/users - Obtener usuarios');
  console.log('  GET    /api/leaderboard/all - Tabla de posiciones');
  console.log('  POST   /api/predictions - Crear pronóstico');
  console.log('  POST   /api/matches/admin/sync - ⚠️ Sincronizar partidos');
  console.log('  PUT    /api/matches/admin/:id/result - ⚠️ Actualizar resultado');
  console.log('');
});



