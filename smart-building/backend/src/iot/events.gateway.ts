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
        // TEST TEST TEST
        client.emit('mqtt_stream', { topic: 'system/test', payload: 'Hello Test Handshake', time: new Date().toISOString() });
    }

    handleDisconnect(client: Socket) {
        console.log(`[WebSocket] Client disconnected: ${client.id}`);
    }

    broadcastDataRefresh(siteId?: string) {
        if (siteId) {
            this.server.emit('refresh_data', { siteId });
        } else {
            this.server.emit('refresh_data', { all: true });
        }
    }
}
