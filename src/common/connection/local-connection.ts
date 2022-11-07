import { ConnectionBase, ConnectionStatus } from './connection-base';

export class LocalConnection extends ConnectionBase {
  public connect(other: LocalConnection) {
    throw 'Not implemented';
  }

  public send(data: string): Error | undefined {
    throw 'Not implemented';
  }

  public close() {
    throw 'Not implemented';
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
