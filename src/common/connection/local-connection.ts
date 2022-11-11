import { ConnectionBase, ConnectionStatus } from './connection-base';

export class LocalConnection extends ConnectionBase {
  private pair: LocalConnection | null = null;

  public connect(other: LocalConnection) {
    this.pair = other;
    this.status = ConnectionStatus.OK;
  }

  public send(data: string): Error | undefined {
    if (!this.pair) {
      this.status = ConnectionStatus.ERROR;
      return new Error('not paired');
    }
    
    this.pair.onData.emit(data);
    return undefined;
  }

  public close() {
    this.pair = null;
    ConnectionStatus.CLOSE;
  }

  /**
   * create a pair of LocalConnections linked to eachother
   */
  public static create(): [LocalConnection, LocalConnection] {
    return LocalConnection.link([new LocalConnection(), new LocalConnection()]);
  }

  private static link(
    pair: [LocalConnection, LocalConnection]
  ): [LocalConnection, LocalConnection] {
    pair[0].connect(pair[1]);
    pair[1].connect(pair[0]);
    return pair;
  }
}
