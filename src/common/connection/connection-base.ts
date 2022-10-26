import { EventEmitter } from '../event-emitter';

export enum ConnectionStatus {
  OK,
  CLOSE,
  ERROR,
}

export abstract class ConnectionBase {
  public onData = EventEmitter.channel<string>();
  public onClose = EventEmitter.channel<void>();
  public onError = EventEmitter.channel<Error>();
  public status: ConnectionStatus;
  public abstract send(data: string): Error | undefined;
  public abstract close(): void;
}
