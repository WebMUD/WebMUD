import { Client } from "./client";
import { Gamestate } from "./gamestate/gamestate";
import { DataConnection, Peer } from 'peerjs';
import { EventEmitter } from "../common/event-emitter";
import { cloneDeep } from "lodash";
import { ConnectionBase } from "../common/connection/connection-base";
import { Connection } from "../common/connection/connection";
import { Collection } from "../common/collection";

export interface ServerSettings {}

export class Server {
    public name: string;

    public onReady = EventEmitter.channel<void>();

    private settings: ServerSettings;

    private _discoveryID: string;

    private clients = new Collection<Client>();
    private gamestate: Gamestate;
    private connection: Peer;

    constructor(name: string, settings?: Partial<ServerSettings>) {
        this.name = name;
        this.settings = {...cloneDeep(Server.defaultSettings), ...settings};
    }

    public init() {
        this.connection = new Peer();
        this.gamestate = new Gamestate();

        this.connection.on('connection', (conn: DataConnection) => this.onConnection(new Connection(conn)));
        this.connection.on('open', (id: string) => {
            this.discoverID = id;
            this.onReady.emit();
        });
    }

    public get discoverID(): string {
        if (!this._discoveryID) throw new Error('discoveryID is not ready');
        return this._discoveryID;
    }

    private set discoverID(value: string) {
        this._discoveryID = value;
    }

    private onConnection(connection: ConnectionBase) {
        // handle opening new connections and reconnecting   
    }

    static defaultSettings: ServerSettings = {};
}