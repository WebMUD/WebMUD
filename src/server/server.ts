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
  EntryRoom,
  HierarchyContainer,
  Player,
  Room,
  World,
} from './gamestate/components';
import { ServerCommands } from './server-commands';
import { WebMUDServerPlugin } from './webmud-server-plugin';
import { SaveStatePlugin } from './plugins/savestate-plugin';

export type ServerSystem = (server: Server, deltaTime: number) => void;

export interface ServerSettings {
  plugins: Array<WebMUDServerPlugin>;

  TICK_RATE: number;
  SPEED: number;
}

export type PluginClass<T extends WebMUDServerPlugin> = new (
  ...args: any[]
) => T;

/**
 * Encapsulates the game server
 */
export class Server extends Logger {
  public name: string;

  public gamestate: Gamestate;

  public commands = new ServerCommands(this);

  public onReady = EventEmitter.channel<void>();
  public onReset = EventEmitter.channel<void>();
  public onClientJoin = EventEmitter.channel<Client>();
  public onClientRejoin = EventEmitter.channel<Client>();

  private flags = new Set<string>();
  private options = new Map<string, number>();
  private settings = new Map<string, string>();

  private _discoveryID: string;
  private clients = new Collection<Client>();
  private connection: Peer;

  private _lastTick = Date.now();
  private _tickTimer: number | null = null;
  private _tps = 0;
  private _tc = 0;

  private systems = new Set<ServerSystem>();

  private plugins = new Map<Function, WebMUDServerPlugin>();

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
    for (const plugin of _settings.plugins) {
      this.plugins.set(Object.getPrototypeOf(plugin).constructor, plugin);
      plugin.init(this);
    }

    this.onInput(data => this.commands.parse(data));
  }

  /**
   * load a level
   * @param url location of level data to load
   */
  async loadLevel(url: string) {
    try {
      const data = await fetch(url);
      const text = await data.text();
      this.loadGamestate(text);
    } catch (err) {
      this.error(`failed to load level data from ${url}`);
      throw err;
    }
  }

  /**
   * return a list of levels
   * @returns {name: string, location: string}[]
   */
  async enumerateLevels() {
    try {
      const data = await fetch('/levels/index.json');
      const json = await data.json();
      return Object.entries(json).map(([name, location]: [string, string]) => ({
        name,
        location,
      }));
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  loadGamestate(data: unknown) {
    this.broadcast({ text: `Server changing levels.`, format: [] });
    this.stopClients();
    this.onReset.emit();
    this.gamestate.deseralize(data);
    this.gamestate.scrub();
    this.init();
    this.startClients();
  }

  public init() {
    let worlds = Array.from(this.gamestate.filter(World));
    if (worlds.length === 1) {
      this.initWorld(worlds[0]);
    } else {
      if (worlds.length > 1) this.error('Found more than one world.');
      else this.error('Missing world entity.');
      const voidWorld = this.gamestate.createWorld('_voidworld');
      const voidRoom = this.gamestate.createRoom('Void', '', voidWorld);
      this.setting(Server.SETTINGS.ENTRY_ROOM, voidRoom);
      this.initWorld(voidWorld);
    }

    let entryRooms: string[] = Array.from(this.gs.filter(EntryRoom));

    if (entryRooms.length < 1) {
      this.error('Missing Entry Room');
      const rooms = Array.from(this.gamestate.filter(Room));
      if (rooms.length > 0) entryRooms = [rooms[0]];
    }

    if (entryRooms.length === 1) {
      this.gs.entity(entryRooms[0]).add(new EntryRoom());
      this.setting(Server.SETTINGS.ENTRY_ROOM, entryRooms[0]);
    } else {
      throw new Error('no rooms');
    }

    for (const client of this.getClients()) client.remakePlayer();
  }

  /**
   * Initialize a world
   * @param world id of the world entity
   */
  public initWorld(world: EntityID) {
    this.info(`Initalizing world: ${this.gs.nameOf(world)}`);
    this.broadcast(
      { text: '---', format: [] },
      { text: ` Welcome to `, format: [] },
      { text: this.gamestate.nameOf(world), format: ['bold'] },
      { text: ' ', format: [] },
      { text: '---', format: [] }
    );
    const prefix = `[${this.gs.nameOf(world)}]: `;

    this.gs
      .entity(world)
      .get(ChatChannel)
      .event(msg => {
        this.print(prefix + `[${msg.senderName}]: ${msg.content}`);
      });

    for (const room of this.gs.getChildrenIDs(world)) this.initRoom(room);

    this.setting(Server.SETTINGS.WORLD, world);
  }

  /**
   * Initalize a room
   */
  public initRoom(roomID: EntityID) {
    const room = this.gs.entity(roomID);
    this.debug(`Initalizing room: ${this.gs.nameOf(room)}`);
    const roomPrefix = `[${this.gs.nameOf(room)}]: `;

    this.onReset.once(
      room.get(ChatChannel).event(msg => {
        if (this.flag(Server.FLAGS.VERBOSE))
          this.print(roomPrefix + `[${msg.senderName}]: ${msg.content}`);
      })
    );

    this.onReset.once(
      room.get(HierarchyContainer).onLeave(id => {
        if (this.flag(Server.FLAGS.VERBOSE))
          this.print(
            roomPrefix +
              `${this.gs.nameOf(id)} moved to ${this.gs.nameOf(
                this.gs.getParent(id)
              )}.`
          );
      })
    );
  }

  /**
   * Start listining for incoming connections
   */
  public startDiscovery() {
    this.connection = new Peer({
      debug: 0,
    });

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

  stopClients() {
    for (const client of this.getClients()) {
      if (client.isActive()) client.stop();
    }
  }

  startClients() {
    for (const client of this.getClients()) {
      if (client.isActive()) this.startClient(client);
    }
  }

  public startClient(client: Client) {
    if (
      this.settings.has(Server.SETTINGS.WORLD) &&
      this.settings.has(Server.SETTINGS.ENTRY_ROOM)
    ) {
      client.start(this.setting(Server.SETTINGS.WORLD));
      this.gs.move(client.player, this.setting(Server.SETTINGS.ENTRY_ROOM));
    } else {
      this.error(`Failed to start client ${client.name}`);
    }
  }

  /**
   * create a new client
   */
  public createClient(connection: ConnectionBase, username: string): Client {
    this.info(`${username} joined the game`);

    const player = this.gs.createPlayer(username);
    const client = new Client(this, connection, player);

    this.clients.add(client);
    this.onClientJoin.emit(client);

    this.startClient(client);

    return client;
  }
/*
  public loadClient(data: unknown): Client {
    const client = Client.deseralize(this, data);
    if (!client) throw new Error('invalid client data');
    this.clients.add(client);
    return client;
  }
*/
  /**
   * reconnect an existing client
   * TODO: test
   */
  public reconnectClient(connection: ConnectionBase, token: string) {
    const client = this.clients.get(token);
    if (!client) throw new Error(`Unknown token ${token}`);

    client.useConnection(connection);
    const world = this.setting(Server.SETTINGS.WORLD);
    if (!world) throw new Error('SETTINGS.WORLD is not set');
    client.start(world);
    this.onClientRejoin.emit(client);

    return client;
  }

  /**
   * Start listening to an incoming connection and handle the handshake process
   */
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

  public getClients() {
    return this.clients.values();
  }

  /**
   * Start processing game ticks
   */
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

  /**
   * Stop processing game ticks
   */
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

  /**
   * Add a system to be processed each tick
   */
  public addSystem(system: ServerSystem) {
    this.systems.add(system);
  }

  /**
   * remove a system
   */
  public removeSystem(system: ServerSystem) {
    this.systems.delete(system);
  }

  /**
   * Get the value of a server setting
   * Enable / disable server settings
   */
  flag(flag: string, set?: boolean) {
    if (!(flag in Server.FLAGS)) throw new Error(`unkown flag ${flag}`);

    if (set === true) this.flags.add(flag);
    if (set === false) this.flags.delete(flag);
    return this.flags.has(flag);
  }

  /**
   * Get the value of a server setting
   * Set the numeric value for server settings
   */
  option(option: string, set?: number): number {
    if (!(option in Server.OPTIONS)) throw new Error(`unkown option ${option}`);
    if (set !== undefined) this.options.set(option, set);
    const value = this.options.get(option);
    if (!value) throw new Error(`OPTIONS.${option} is not set`);
    return value;
  }

  setting(setting: string, set?: string): string {
    if (!(setting in Server.SETTINGS))
      throw new Error(`unkown setting ${setting}`);
    if (set !== undefined) this.settings.set(setting, set);
    const value = this.settings.get(setting);
    if (!value) throw new Error(`SETTINGS.${setting} is not set`);
    return value;
  }

  /**
   * Get the URL to join the server
   */
  joinLink() {
    const origin = window.location.origin;
    return `${origin}/client?server=${this.discoveryID}`;
  }

  /**
   * Retrive a plugin instance
   */
  getPlugin<T extends WebMUDServerPlugin>(pluginClass: PluginClass<T>): T {
    const result = this.plugins.get(pluginClass);
    if (!result) throw new Error(`cannot get plugin`);
    return result as T;
  }

  // for testing
  getSaveStatePlugin() {
    return this.getPlugin(SaveStatePlugin);
  }

  kick(id: string, reason: string): boolean {
    const client = this.clients.get(id);
    if (!client) return false;
    client.disconnect(reason);
    this.clients.remove(client);
    return true;
  }

  purgeClients() {
    for (const client of this.getClients()) {
      this.gs.destroyEntity(client.player);
      this.kick(client.id, 'server closing');
    }
    this.clients.clear();
  }

  broadcast(...parts: { text: string; format: string[] }[]) {
    for (const client of this.getClients()) {
      if (client.isActive()) client.sendMessageFrame(...parts);
    }
  }

  serializeConfig() {
    return {
      flags: Array.from(this.flags.values()),
      options: Array.from(this.options.entries()),
      settings: Array.from(this.settings.entries()),
    };
  }

  deseralizeConfig(data: any) {
    if ('flags' in data) this._deseralizeFlags(data.flags);
    if ('options' in data) this._deseralizeOptions(data.options);
    if ('settings' in data) this._deseralizeSettings(data.settings);
  }

  private _deseralizeFlags(data: any) {
    if (!Array.isArray(data)) throw new Error('invalid flags data');
    this.flags.clear();
    for (const x of data) this.flag(x, true);
  }

  private _deseralizeOptions(data: any) {
    if (!Array.isArray(data)) throw new Error('invalid options data');
    for (const [key, value] of data) {
      this.option(key, value);
    }
  }

  private _deseralizeSettings(data: any) {
    if (!Array.isArray(data)) throw new Error('invalid settings data');
    for (const [key, value] of data) {
      this.setting(key, value);
    }
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

  static SETTINGS = {
    WORLD: 'WORLD',
    ENTRY_ROOM: 'ENTRY_ROOM',
  };
}
