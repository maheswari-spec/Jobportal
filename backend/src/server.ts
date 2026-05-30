import http from 'http';
import app from './app';
import { connectDB } from './config/db';
import { config } from './config/environment';
import { socketService } from './services/socket.service';

const server = http.createServer(app);

// Initialize DB and Services
connectDB().then(() => {
  socketService.initialize(server);
  
  server.listen(config.port, () => {
    console.log(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
  });
}).catch((error) => {
  console.error('Failed to initialize application:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: any) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
