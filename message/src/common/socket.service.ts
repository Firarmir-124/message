import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

export class SocketService {
  private static instance: SocketService;
  private io: SocketIOServer;
  private connectionList: string[];

  constructor() {
    this.connectionList = [];
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public connectionSocket(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*',
      },
    });
    console.log('socket connected');
  }

  public listenConnection() {
    if (!this.io) {
      throw new Error('Socket not initialized. Call connectionSocket() first.');
    }

    this.io.on('connection', (socket: Socket) => {
      console.log('Подключился', socket.id);
      this.connectionList.push(socket.id);
      socket.on('disconnect', (reason) => {
        console.log('Отключился', socket.id);
        this.connectionList = this.connectionList.filter((item) => item !== socket.id);
      });
    });
  }

  public sendBroadcastMessage(message: any) {
    if (this.connectionList.length !== 0) {
      this.connectionList.forEach((item) => {
        if (this.connectionList.includes(item)) {
          this.io.to(item).emit('broadcast', message.data);
        } else {
          console.log('socket not fount');
        }
      });
      console.log('send message all');
    }
  }

  public sendPrivateMessage(message: any) {
    if (!this.connectionList.includes(message.user)) {
      throw new Error('socket not fount');
    }

    this.io.to(message.user).emit('private_message', message.data);

    console.log('send message');
  }

  public getSocket(): SocketIOServer {
    return this.io;
  }

  public getConnectionList() {
    return this.connectionList;
  }
}
