/**
 * Generic type for event handler callbacks
 */
export type EventHandler<T> = (data: T) => void;

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
}
