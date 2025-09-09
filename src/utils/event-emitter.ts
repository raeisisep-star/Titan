/**
 * TITAN Trading System - Event Emitter Polyfill
 * 
 * Simple EventEmitter implementation for Cloudflare Workers environment
 * since Node.js 'events' module is not available.
 */

export type EventListener = (...args: any[]) => void;

export class EventEmitter {
  private events: Map<string, EventListener[]> = new Map();
  private maxListeners: number = 10;

  /**
   * Add event listener
   */
  on(event: string, listener: EventListener): this {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    
    const listeners = this.events.get(event)!;
    listeners.push(listener);
    
    // Check max listeners
    if (listeners.length > this.maxListeners) {
      console.warn(`MaxListenersExceededWarning: Possible EventEmitter memory leak detected. ${listeners.length} ${event} listeners added.`);
    }
    
    return this;
  }

  /**
   * Add one-time event listener
   */
  once(event: string, listener: EventListener): this {
    const onceWrapper = (...args: any[]) => {
      this.removeListener(event, onceWrapper);
      listener.apply(this, args);
    };
    
    return this.on(event, onceWrapper);
  }

  /**
   * Remove event listener
   */
  removeListener(event: string, listener: EventListener): this {
    const listeners = this.events.get(event);
    if (!listeners) return this;
    
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
    
    if (listeners.length === 0) {
      this.events.delete(event);
    }
    
    return this;
  }

  /**
   * Remove all listeners for event
   */
  removeAllListeners(event?: string): this {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
    
    return this;
  }

  /**
   * Emit event
   */
  emit(event: string, ...args: any[]): boolean {
    const listeners = this.events.get(event);
    if (!listeners || listeners.length === 0) {
      return false;
    }
    
    // Create a copy to avoid issues if listeners are modified during emission
    const listenersCopy = [...listeners];
    
    for (const listener of listenersCopy) {
      try {
        listener.apply(this, args);
      } catch (error) {
        console.error(`Error in event listener for '${event}':`, error);
      }
    }
    
    return true;
  }

  /**
   * Get listener count for event
   */
  listenerCount(event: string): number {
    const listeners = this.events.get(event);
    return listeners ? listeners.length : 0;
  }

  /**
   * Get all listeners for event
   */
  listeners(event: string): EventListener[] {
    const listeners = this.events.get(event);
    return listeners ? [...listeners] : [];
  }

  /**
   * Get all event names
   */
  eventNames(): string[] {
    return Array.from(this.events.keys());
  }

  /**
   * Set max listeners
   */
  setMaxListeners(n: number): this {
    this.maxListeners = n;
    return this;
  }

  /**
   * Get max listeners
   */
  getMaxListeners(): number {
    return this.maxListeners;
  }
}

export default EventEmitter;