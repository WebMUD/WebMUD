/**
 * Generic type for event handler callbacks
 */
export type EventHandler<T> = (data: T) => void;

/**
 * the EventChannel interface abstracts EventEmitter to improve readability
 */
export interface EventChannel<T> {
  /** Call signature: listen for events */
  (cb: (data: T) => void): () => void;
  /** emit an event */
  emit: (data: T) => void;
  /** clear all listeners */
  clear: () => void;
  /** listen to one event only */
  once: (cb: (data: T) => void) => void;
}

/**
 * Simple event emitter
 */
export class EventEmitter<T> {
  protected handlers: EventHandler<T>[] = [];

  /**
   * Add an event handler
   * @param handler callback for when event is emitted
   */
  public add(handler: EventHandler<T>): void {
    this.handlers.push(handler);
  }

  /**
   * Remove an event handler
   * @param hander callback to remove
   */
  public remove(hander: EventHandler<T>) {
    this.handlers = this.handlers.filter(item => item !== hander);
  }

  /**
   * Clear all handlers
   */
  public clear(): void {
    this.handlers = [];
  }

  /**
   * Trigger an event
   * @param data data to call handlers with
   */
  public emit(data: T): void {
    for (const handler of this.handlers) handler(data);
  }

  /**
   * Create a new EventChannel
   */
  static channel<T>(): EventChannel<T> {
    const eventEmitter: EventEmitter<T> = new EventEmitter<T>();
    const result = (cb: (data: T) => void) => {
      eventEmitter.add(cb);
      return () => eventEmitter.remove(cb);
    };
    result.emit = (data: T) => eventEmitter.emit(data);
    result.clear = () => eventEmitter.clear();
    result.once = (cb: (data: T) => void) => {
      let stop: ()=>void;
      stop = result((data)=>{
        cb(data);
        stop();
      });
    }
    return result;
  }
}
