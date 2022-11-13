import { Client } from './client';
import { Gamestate } from './gamestate/gamestate';
import { DataConnection, Peer } from 'peerjs';
import { EventEmitter } from '../common/event-emitter';
import { cloneDeep, StringChain } from 'lodash';
import { ConnectionBase } from '../common/connection/connection-base';
import { Connection } from '../common/connection/connection';
import { Collection } from '../common/collection';
import { frames } from '../common/frames';
import { EntityID } from './gamestate/entity';
import { Logger } from '../common/logger';
import {
  ChatChannel,
  Description,
  HierarchyContainer,
} from './gamestate/components';
import { ServerCommands } from './server-commands';
import { WebMUDServerPlugin } from './webmud-server-plugin';

export type ServerSystem = (server: Server, deltaTime: number) => void;

export interface ServerSettings {
  plugins: Array<WebMUDServerPlugin>;

  TICK_RATE: number;
  SPEED: number;
}

/**
 * Encapsulates the game server
 */
export class Server extends Logger {
  public name: string;

  public gamestate: Gamestate;
  public world: EntityID;
  public startingRoom: EntityID;

  public commands = new ServerCommands(this);

  public onReady = EventEmitter.channel<void>();
  public onClientJoin = EventEmitter.channel<Client>();
  public onClientRejoin = EventEmitter.channel<Client>();

  private flags = new Set<string>();
  private options = new Map<string, number>();

  private _discoveryID: string;
  private clients = new Collection<Client>();
  private connection: Peer;

  private _lastTick = Date.now();
  private _tickTimer: number | null = null;
  private _tps = 0;
  private _tc = 0;

  private systems = new Set<ServerSystem>();

  constructor(
    name: string,
    settings?: Partial<ServerSettings>,
    flags?: string[]
  ) {
    super();
    this.name = name;
    const _settings = { ...cloneDeep(Server.defaultSettings), ...settings };
    this.gamestate = new Gamestate();

    this.option(Server.OPTIONS.TICK_RATE, _settings.TICK_RATE);
    this.option(Server.OPTIONS.SPEED, _settings.SPEED);

    if (flags) for (const flag of flags) this.flags.add(flag);
    for (const plugin of _settings.plugins) plugin.init(this);

    this.onInput(data => this.commands.parse(data));
  }

  /**
   * Initialize a world
   * @param world id of the world entity
   * @param startingRoom id of the room players should be placed in when joining
   */
  public init(world: EntityID, startingRoom: EntityID) {
    this.info(`Initalizing world: ${this.gs.nameOf(world)}`);
    const prefix = `[${this.gs.nameOf(world)}]: `;

    this.gs
      .entity(world)
      .get(ChatChannel)
      .event(msg => {
        this.print(prefix + `[${msg.senderName}]: ${msg.content}`);
      });

    for (const room of this.gs.getChildrenIDs(world)) this.initRoom(room);

    this.world = world;
    this.startingRoom = startingRoom;
  }

  public initRoom(roomID: EntityID) {
    const room = this.gs.entity(roomID);
    this.debug(`Initalizing room: ${this.gs.nameOf(room)}`);
    const roomPrefix = `[${this.gs.nameOf(room)}]: `;

    room.get(ChatChannel).event(msg => {
      if (this.flag(Server.FLAGS.VERBOSE))
        this.print(roomPrefix + `[${msg.senderName}]: ${msg.content}`);
    });

    room.get(HierarchyContainer).onLeave(id => {
      if (this.flag(Server.FLAGS.VERBOSE))
        this.print(
          roomPrefix +
            `${this.gs.nameOf(id)} moved to ${this.gs.nameOf(
              this.gs.getParent(id)
            )}.`
        );
    });
  }

  public startDiscovery() {
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
    this.info(`${username} joined the game`);

    const player = this.gs.createPlayer(username);
    const client = new Client(this, connection, player);
    this.clients.add(client);
    client.start(this.world);
    this.gs.move(player, this.startingRoom);

    this.onClientJoin.emit(client);

    return client;
  }

  public reconnectClient(connection: ConnectionBase, token: string) {
    const client = this.clients.get(token);
    if (!client) throw new Error(`Unknown token ${token}`);

    client.useConnection(connection);
    client.start(this.world);

    this.onClientRejoin.emit(client);

    return client;
  }

  public onConnection(connection: ConnectionBase) {
    if (this.flag(Server.FLAGS.VERBOSE)) this.debug('connection opened');

    const stop = connection.onData(data => {
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

  private handlePings(connection: ConnectionBase) {
    connection.onData(data => {
      const frame = frames.parse(data);
      if (!frame) throw new Error('Unable to parse incoming data: ' + data);

      if (frame instanceof frames.FrameConnect) {
      }

      throw new Error(`Unexpected frame: ${data}`);
    });
  }

  public getClients() {
    return this.clients.values();
  }

  public start() {
    if (this._tickTimer !== null) return;
    this.info('Starting Simulation');
    const now = Date.now();
    this._lastTick = now;

    this._tickTimer = window.setInterval(
      () => this.tick(),
      this.options.get(Server.OPTIONS.TICK_RATE)
    );
  }

  public stop() {
    if (this._tickTimer === null) return;
    this.info('Halting Simulation');
    window.clearInterval(this._tickTimer);
    this._tickTimer = null;
  }

  public restart() {
    this.stop();
    window.setTimeout(() => {
      this.start();
    });
  }

  private tick() {
    const now = Date.now();
    const dt = now - this._lastTick;
    this._tps = 1000 / dt;
    this._tc++;
    const speed = this.option(Server.OPTIONS.SPEED) ?? 1;
    for (const system of this.systems) system(this, dt * speed);
    this._lastTick = now;
  }

  public addSystem(system: ServerSystem) {
    this.systems.add(system);
  }

  public removeSystem(system: ServerSystem) {
    this.systems.delete(system);
  }

  flag(flag: string, set?: boolean) {
    if (!(flag in Server.FLAGS)) throw new Error(`unkown flag ${flag}`);

    if (set === true) this.flags.add(flag);
    if (set === false) this.flags.delete(flag);
    return this.flags.has(flag);
  }

  option(option: string, set?: number) {
    if (!(option in Server.OPTIONS)) throw new Error(`unkown option ${option}`);
    if (set !== undefined) this.options.set(option, set);
    return this.options.get(option);
  }

  joinLink() {
    const origin = window.location.origin;
    return `${origin}/client?server=${this.discoveryID}`;
  }

  get gs() {
    return this.gamestate;
  }

  get tps() {
    return this._tps;
  }

  set tps(x: number) {
    this.option(Server.OPTIONS.TICK_RATE, 1000 / x);
  }

  get tc() {
    return this._tc;
  }

  static defaultSettings: ServerSettings = {
    plugins: [],
    TICK_RATE: 500,
    SPEED: 1,
  };

  static FLAGS = {
    VERBOSE: 'VERBOSE',
    DEV_MODE: 'DEV_MODE',
  };

  static OPTIONS = {
    TICK_RATE: 'TICK_RATE',
    SPEED: 'SPEED',
  };
}
