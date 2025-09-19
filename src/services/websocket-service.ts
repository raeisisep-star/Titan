/**
 * WebSocket Service for Real-time Chat
 * Handles WebSocket connections for live chat functionality
 */

interface WebSocketConnection {
  userId: string;
  connectionId: string;
  socket: WebSocket;
  lastActivity: Date;
  subscriptions: Set<string>;
}

interface ChatEvent {
  type: 'message' | 'typing' | 'stop_typing' | 'user_join' | 'user_leave' | 'system';
  userId: string;
  conversationId?: string;
  data: any;
  timestamp: string;
}

export class WebSocketService {
  private connections = new Map<string, WebSocketConnection>();
  private conversationRooms = new Map<string, Set<string>>(); // conversationId -> Set<connectionId>
  
  constructor() {
    // Clean up inactive connections every 5 minutes
    setInterval(() => this.cleanupConnections(), 5 * 60 * 1000);
  }

  /**
   * Handle new WebSocket connection
   */
  handleConnection(socket: WebSocket, userId: string, conversationId?: string): string {
    const connectionId = `ws_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const connection: WebSocketConnection = {
      userId,
      connectionId,
      socket,
      lastActivity: new Date(),
      subscriptions: new Set()
    };

    // Store connection
    this.connections.set(connectionId, connection);

    // Join conversation room if provided
    if (conversationId) {
      this.joinConversation(connectionId, conversationId);
    }

    // Setup socket event handlers
    this.setupSocketHandlers(socket, connectionId, userId);

    console.log(`WebSocket connection established: ${connectionId} for user ${userId}`);
    
    // Send welcome message
    this.sendToConnection(connectionId, {
      type: 'system',
      userId: 'system',
      data: { message: 'اتصال WebSocket برقرار شد', connectionId },
      timestamp: new Date().toISOString()
    });

    return connectionId;
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupSocketHandlers(socket: WebSocket, connectionId: string, userId: string) {
    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(connectionId, userId, message);
      } catch (error) {
        console.error('Invalid WebSocket message:', error);
        this.sendError(connectionId, 'Invalid message format');
      }
    };

    socket.onclose = () => {
      console.log(`WebSocket connection closed: ${connectionId}`);
      this.removeConnection(connectionId);
    };

    socket.onerror = (error) => {
      console.error(`WebSocket error for ${connectionId}:`, error);
      this.removeConnection(connectionId);
    };

    // Ping-pong for connection health
    const pingInterval = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.ping();
      } else {
        clearInterval(pingInterval);
      }
    }, 30000); // Ping every 30 seconds
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(connectionId: string, userId: string, message: any) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Update last activity
    connection.lastActivity = new Date();

    switch (message.type) {
      case 'join_conversation':
        this.joinConversation(connectionId, message.conversationId);
        break;

      case 'leave_conversation':
        this.leaveConversation(connectionId, message.conversationId);
        break;

      case 'typing':
        this.broadcastTyping(connectionId, userId, message.conversationId, true);
        break;

      case 'stop_typing':
        this.broadcastTyping(connectionId, userId, message.conversationId, false);
        break;

      case 'chat_message':
        // This will be handled by the main chat API, WebSocket just broadcasts
        this.broadcastMessage(message.conversationId, {
          type: 'message',
          userId: userId,
          conversationId: message.conversationId,
          data: message.data,
          timestamp: new Date().toISOString()
        });
        break;

      case 'subscribe':
        if (message.channel) {
          connection.subscriptions.add(message.channel);
        }
        break;

      case 'unsubscribe':
        if (message.channel) {
          connection.subscriptions.delete(message.channel);
        }
        break;

      default:
        console.warn(`Unknown WebSocket message type: ${message.type}`);
    }
  }

  /**
   * Join a conversation room
   */
  private joinConversation(connectionId: string, conversationId: string) {
    if (!this.conversationRooms.has(conversationId)) {
      this.conversationRooms.set(conversationId, new Set());
    }
    
    this.conversationRooms.get(conversationId)!.add(connectionId);
    
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.subscriptions.add(`conversation:${conversationId}`);
      
      // Notify user joined
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
   * Leave a conversation room
   */
  private leaveConversation(connectionId: string, conversationId: string) {
    const room = this.conversationRooms.get(conversationId);
    if (room) {
      room.delete(connectionId);
      if (room.size === 0) {
        this.conversationRooms.delete(conversationId);
      }
    }

    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.subscriptions.delete(`conversation:${conversationId}`);
      
      // Notify user left
      this.broadcastToConversation(conversationId, {
        type: 'user_leave',
        userId: connection.userId,
        conversationId,
        data: { message: 'کاربر گفتگو را ترک کرد' },
        timestamp: new Date().toISOString()
      }, connectionId);
    }
  }

  /**
   * Broadcast typing indicator
   */
  private broadcastTyping(connectionId: string, userId: string, conversationId: string, isTyping: boolean) {
    this.broadcastToConversation(conversationId, {
      type: isTyping ? 'typing' : 'stop_typing',
      userId,
      conversationId,
      data: { isTyping },
      timestamp: new Date().toISOString()
    }, connectionId);
  }

  /**
   * Broadcast message to conversation
   */
  public broadcastMessage(conversationId: string, event: ChatEvent) {
    this.broadcastToConversation(conversationId, event);
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
   * Send message to specific connection
   */
  private sendToConnection(connectionId: string, event: ChatEvent) {
    const connection = this.connections.get(connectionId);
    if (connection && connection.socket.readyState === WebSocket.OPEN) {
      try {
        connection.socket.send(JSON.stringify(event));
      } catch (error) {
        console.error(`Failed to send to connection ${connectionId}:`, error);
        this.removeConnection(connectionId);
      }
    }
  }

  /**
   * Send error message
   */
  private sendError(connectionId: string, errorMessage: string) {
    this.sendToConnection(connectionId, {
      type: 'system',
      userId: 'system',
      data: { error: errorMessage },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Remove connection
   */
  private removeConnection(connectionId: string) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      // Leave all conversations
      this.conversationRooms.forEach((room, conversationId) => {
        if (room.has(connectionId)) {
          this.leaveConversation(connectionId, conversationId);
        }
      });

      // Close socket if still open
      if (connection.socket.readyState === WebSocket.OPEN) {
        connection.socket.close();
      }

      this.connections.delete(connectionId);
      console.log(`WebSocket connection removed: ${connectionId}`);
    }
  }

  /**
   * Cleanup inactive connections
   */
  private cleanupConnections() {
    const now = new Date();
    const timeout = 30 * 60 * 1000; // 30 minutes

    this.connections.forEach((connection, connectionId) => {
      if (now.getTime() - connection.lastActivity.getTime() > timeout) {
        console.log(`Cleaning up inactive connection: ${connectionId}`);
        this.removeConnection(connectionId);
      }
    });
  }

  /**
   * Get statistics
   */
  public getStats() {
    return {
      totalConnections: this.connections.size,
      activeConversations: this.conversationRooms.size,
      connections: Array.from(this.connections.entries()).map(([id, conn]) => ({
        connectionId: id,
        userId: conn.userId,
        lastActivity: conn.lastActivity,
        subscriptions: Array.from(conn.subscriptions)
      }))
    };
  }

  /**
   * Broadcast system message to all connections
   */
  public broadcastSystem(message: string, data?: any) {
    const event: ChatEvent = {
      type: 'system',
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
export const webSocketService = new WebSocketService();