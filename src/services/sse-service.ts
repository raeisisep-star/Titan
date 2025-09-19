/**
 * Server-Sent Events (SSE) Service for Real-time Chat
 * Alternative to WebSocket that works with Cloudflare Workers
 */

interface SSEConnection {
  userId: string;
  conversationId: string;
  controller: ReadableStreamController<Uint8Array>;
  startTime: Date;
  lastPing: Date;
}

interface ChatEvent {
  type: 'message' | 'typing' | 'stop_typing' | 'user_join' | 'user_leave' | 'system' | 'ping';
  id?: string;
  userId: string;
  conversationId?: string;
  data: any;
  timestamp: string;
}

export class SSEService {
  private connections = new Map<string, SSEConnection>();
  private conversationRooms = new Map<string, Set<string>>(); // conversationId -> Set<connectionId>
  
  constructor() {
    // Note: No setInterval in constructor due to Cloudflare Workers restrictions
    // Cleanup will be handled by request handlers
  }

  /**
   * Create SSE stream for a user
   */
  createStream(userId: string, conversationId: string): Response {
    const connectionId = `sse_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const stream = new ReadableStream({
      start: (controller) => {
        const connection: SSEConnection = {
          userId,
          conversationId,
          controller,
          startTime: new Date(),
          lastPing: new Date()
        };

        // Store connection
        this.connections.set(connectionId, connection);
        
        // Join conversation room
        this.joinConversation(connectionId, conversationId);

        // Send welcome event
        this.sendToConnection(connectionId, {
          type: 'system',
          id: 'welcome',
          userId: 'system',
          conversationId,
          data: { message: 'اتصال برقرار شد', connectionId },
          timestamp: new Date().toISOString()
        });

        console.log(`SSE connection established: ${connectionId} for user ${userId}`);
      },
      cancel: () => {
        console.log(`SSE connection cancelled: ${connectionId}`);
        this.removeConnection(connectionId);
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    });
  }

  /**
   * Join conversation room
   */
  private joinConversation(connectionId: string, conversationId: string) {
    if (!this.conversationRooms.has(conversationId)) {
      this.conversationRooms.set(conversationId, new Set());
    }
    
    this.conversationRooms.get(conversationId)!.add(connectionId);
    
    // Notify others in the conversation
    const connection = this.connections.get(connectionId);
    if (connection) {
      this.broadcastToConversation(conversationId, {
        type: 'user_join',
        userId: connection.userId,
        conversationId,
        data: { message: 'کاربر به گفتگو پیوست' },
        timestamp: new Date().toISOString()
      }, connectionId);
    }
  }

  /**
   * Leave conversation room
   */
  private leaveConversation(connectionId: string) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    const conversationId = connection.conversationId;
    const room = this.conversationRooms.get(conversationId);
    
    if (room) {
      room.delete(connectionId);
      
      // Notify others user left
      this.broadcastToConversation(conversationId, {
        type: 'user_leave',
        userId: connection.userId,
        conversationId,
        data: { message: 'کاربر گفتگو را ترک کرد' },
        timestamp: new Date().toISOString()
      }, connectionId);

      // Remove room if empty
      if (room.size === 0) {
        this.conversationRooms.delete(conversationId);
      }
    }
  }

  /**
   * Broadcast new message to conversation
   */
  public broadcastNewMessage(conversationId: string, messageData: any, fromUserId: string) {
    this.broadcastToConversation(conversationId, {
      type: 'message',
      id: `msg_${Date.now()}`,
      userId: fromUserId,
      conversationId,
      data: messageData,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Broadcast typing indicator
   */
  public broadcastTyping(conversationId: string, userId: string, isTyping: boolean) {
    this.broadcastToConversation(conversationId, {
      type: isTyping ? 'typing' : 'stop_typing',
      userId,
      conversationId,
      data: { isTyping },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Broadcast to all users in a conversation
   */
  private broadcastToConversation(conversationId: string, event: ChatEvent, excludeConnectionId?: string) {
    const room = this.conversationRooms.get(conversationId);
    if (!room) return;

    room.forEach(connectionId => {
      if (connectionId !== excludeConnectionId) {
        this.sendToConnection(connectionId, event);
      }
    });
  }

  /**
   * Send event to specific connection
   */
  private sendToConnection(connectionId: string, event: ChatEvent) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    try {
      const data = `id: ${event.id || Date.now()}\n` +
                   `event: ${event.type}\n` +
                   `data: ${JSON.stringify(event)}\n\n`;

      const encoder = new TextEncoder();
      connection.controller.enqueue(encoder.encode(data));
      connection.lastPing = new Date();
    } catch (error) {
      console.error(`Failed to send SSE to connection ${connectionId}:`, error);
      this.removeConnection(connectionId);
    }
  }

  /**
   * Send ping to all connections to keep them alive
   */
  private sendPingToAll() {
    const pingEvent: ChatEvent = {
      type: 'ping',
      id: `ping_${Date.now()}`,
      userId: 'system',
      data: { timestamp: Date.now() },
      timestamp: new Date().toISOString()
    };

    this.connections.forEach((connection, connectionId) => {
      this.sendToConnection(connectionId, pingEvent);
    });
  }

  /**
   * Remove connection
   */
  private removeConnection(connectionId: string) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      // Leave conversation
      this.leaveConversation(connectionId);

      // Close controller
      try {
        connection.controller.close();
      } catch (error) {
        // Controller might already be closed
      }

      this.connections.delete(connectionId);
      console.log(`SSE connection removed: ${connectionId}`);
    }
  }

  /**
   * Cleanup stale connections
   */
  private cleanupConnections() {
    const now = new Date();
    const timeout = 5 * 60 * 1000; // 5 minutes

    this.connections.forEach((connection, connectionId) => {
      if (now.getTime() - connection.lastPing.getTime() > timeout) {
        console.log(`Cleaning up stale SSE connection: ${connectionId}`);
        this.removeConnection(connectionId);
      }
    });
  }

  /**
   * Get connection statistics
   */
  public getStats() {
    return {
      totalConnections: this.connections.size,
      activeConversations: this.conversationRooms.size,
      connections: Array.from(this.connections.entries()).map(([id, conn]) => ({
        connectionId: id,
        userId: conn.userId,
        conversationId: conn.conversationId,
        startTime: conn.startTime,
        lastPing: conn.lastPing
      })),
      rooms: Array.from(this.conversationRooms.entries()).map(([conversationId, connections]) => ({
        conversationId,
        connectionCount: connections.size
      }))
    };
  }

  /**
   * Broadcast system message to all connections
   */
  public broadcastSystem(message: string, data?: any) {
    const event: ChatEvent = {
      type: 'system',
      id: `system_${Date.now()}`,
      userId: 'system',
      data: { message, ...data },
      timestamp: new Date().toISOString()
    };

    this.connections.forEach((connection, connectionId) => {
      this.sendToConnection(connectionId, event);
    });
  }
}

// Singleton instance
export const sseService = new SSEService();