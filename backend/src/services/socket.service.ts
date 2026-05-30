import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

class SocketService {
  private io: Server | null = null;
  private userSocketMap = new Map<string, string>(); // userId -> socketId

  public initialize(server: HttpServer) {
    const clientOrigins = [process.env.CLIENT_URL || 'http://localhost:3000', 'http://localhost:3001'];
    this.io = new Server(server, {
      cors: {
        origin: clientOrigins,
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.io.on('connection', (socket: Socket) => {
      const userId = socket.handshake.query.userId as string;
      if (userId) {
        this.userSocketMap.set(userId, socket.id);
        console.log(`User connected: ${userId} with socket ID: ${socket.id}`);
        this.io?.emit('user_status', { userId, status: 'online' });
      }

      socket.on('join_room', (roomId: string) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room: ${roomId}`);
      });

      socket.on('typing', (data: { roomId: string; userId: string; isTyping: boolean }) => {
        socket.to(data.roomId).emit('typing_status', data);
      });

      socket.on('disconnect', () => {
        if (userId) {
          this.userSocketMap.delete(userId);
          console.log(`User disconnected: ${userId}`);
          this.io?.emit('user_status', { userId, status: 'offline' });
        }
      });
    });
  }

  public getIO(): Server {
    if (!this.io) {
      throw new Error('Socket.IO is not initialized!');
    }
    return this.io;
  }

  public sendToUser(userId: string, event: string, data: any) {
    const socketId = this.userSocketMap.get(userId);
    if (socketId && this.io) {
      this.io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }

  public emitToRoom(roomId: string, event: string, data: any) {
    if (this.io) {
      this.io.to(roomId).emit(event, data);
    }
  }
}

export const socketService = new SocketService();
export default socketService;
