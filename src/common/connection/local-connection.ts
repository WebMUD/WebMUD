import { ConnectionBase, ConnectionStatus } from './connection-base';

export class LocalConnection extends ConnectionBase {
  private pair: LocalConnection | null = null;

  public connect(other: LocalConnection) {
    this.pair = other;
  }

  public send(data: string): Error | undefined {
    if (!this.pair) throw new Error('not paired');
    this.pair.onData.emit(data);
    return undefined;
  }

  public close() {
    this.pair = null;
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
