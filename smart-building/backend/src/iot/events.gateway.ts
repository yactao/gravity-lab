import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    handleConnection(client: Socket) {
        console.log(`[WebSocket] Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`[WebSocket] Client disconnected: ${client.id}`);
    }

    // Broadcaster une notification globale de rafraîchissement des données 
    // (pour un site ou de manière globale)
    broadcastDataRefresh(siteId?: string) {
        if (siteId) {
            this.server.emit('refresh_data', { siteId });
        } else {
            this.server.emit('refresh_data', { all: true });
        }
    }
}
