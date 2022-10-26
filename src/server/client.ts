import { uniqueId } from 'lodash';
import { ConnectionBase } from '../common/connection/connection-base';
import { EntityID } from './gamestate/entity';

export class Client {
  public readonly id: string = uniqueId('c-');
  public player: EntityID;

  private connection: ConnectionBase | null;

  constructor(connection: ConnectionBase | null, player: EntityID) {
    this.player = player;
    this.useConnection(connection);
  }

  private freeConnection() {
    if (this.connection) {
    }
    this.connection = null;
  }

  private useConnection(connection: ConnectionBase | null) {
    this.freeConnection();
    this.connection = connection;
    // initalize new connection
  }
}
