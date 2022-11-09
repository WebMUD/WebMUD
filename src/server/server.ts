import { Client } from './client';
import { Gamestate } from './gamestate/gamestate';
import { DataConnection, Peer } from 'peerjs';
import { EventEmitter } from '../common/event-emitter';
import { cloneDeep } from 'lodash';
import { ConnectionBase } from '../common/connection/connection-base';
import { Connection } from '../common/connection/connection';
import { Collection } from '../common/collection';
import { frames } from '../common/frames';
import { EntityID } from './gamestate/entity';
import { Logger } from '../common/logger';
import { ChatChannel, HierarchyContainer } from './gamestate/components';

export interface ServerSettings {}

/**
 * Encapsulates the game server
 */
export class Server extends Logger {
  public name: string;

  public gamestate: Gamestate;
  public world: EntityID;
  public startingRoom: EntityID;

  public onReady = EventEmitter.channel<void>();

  private settings: ServerSettings;
  private _discoveryID: string;
  private clients = new Collection<Client>();
  private connection: Peer;

  constructor(name: string, settings?: Partial<ServerSettings>) {
    super();
    this.name = name;
    this.settings = { ...cloneDeep(Server.defaultSettings), ...settings };
    this.gamestate = new Gamestate();
  }

  public init(world: EntityID) {
    this.info(`Initalizing world: ${this.gamestate.nameOf(world)}`);
    const prefix = `[${this.gamestate.nameOf(world)}]: `;

    this.gamestate.entity(this.world).get(ChatChannel).event(msg=>{
      this.print(prefix + `[${msg.senderName}]: ${msg.content}`);
    });

    for (const room of this.gamestate.getChildren(world)) {
      this.debug(`Initalizing room: ${this.gamestate.nameOf(room)}`);
      const roomPrefix = `[${this.gamestate.nameOf(room)}]: `;

      room.get(ChatChannel).event(msg=>{
        this.print(roomPrefix + `[${msg.senderName}]: ${msg.content}`);
      });

      room.get(HierarchyContainer).onLeave(id=>{
        this.print(roomPrefix + `${this.gamestate.nameOf(id)} moved to ${this.gamestate.nameOf(this.gamestate.getParent(id))}.`);
      });
    }
  }

  public start() {
    this.connection = new Peer();

    this.connection.on('connection', (conn: DataConnection) =>
      this.onConnection(new Connection(conn))
    );

    this.connection.on('open', (id: string) => {
      this.discoveryID = id;
      this.onReady.emit();
    });
  }

  public get discoveryID(): string {
    if (!this._discoveryID) throw new Error('discoveryID is not ready');
    return this._discoveryID;
  }

  private set discoveryID(value: string) {
    this._discoveryID = value;
  }

  public createClient(connection: ConnectionBase, username: string): Client {
    const player = this.gamestate.createPlayer(username);
    const client = new Client(this, connection, player);
    this.clients.add(client);
    client.start(this.world);
    this.gamestate.move(player, this.startingRoom);

    return client;
  }

  public reconnectClient(connection: ConnectionBase, token: string) {
    const client = this.clients.get(token);
    if (!client) throw new Error(`Unknown token ${token}`);

    client.useConnection(connection);
    client.start(this.world);

    return client;
  }

  private onConnection(connection: ConnectionBase) {
    const stop = connection.onData((data)=>{
      const frame = frames.parse(data);
      if (!frame) throw new Error('Unable to parse incoming data: ' + data);

      if (frame instanceof frames.FrameConnect) {
        const client = this.createClient(connection, frame.username);
        stop(); // incoming data can now be handled elsewhere
        return;
      }

      // if (frame instanceof frames.FrameReconnect) {
      //   const client = this.reconnectClient(connection, frame.token);
      //   stop(); // incoming data can now be handled elsewhere
      //   return;
      // }
      
      throw new Error(`Unexpected frame: ${data}`);
    });
  }

  static defaultSettings: ServerSettings = {};
}
