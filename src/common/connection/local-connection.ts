import { ConnectionBase, ConnectionStatus } from './connection-base';

export class LocalConnection extends ConnectionBase {
  public connect(other: LocalConnection) {
    this.listen(other);
    this.target(other);
  }

  public send(data: string): undefined {
    return undefined;
  }

  public close() {}

  private listen(other: LocalConnection) {}

  private target(other: LocalConnection) {}

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
