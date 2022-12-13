import { v4 as uuidv4 } from 'uuid';
import * as Parser from '../client/parser/parser';
import {
  ConnectionBase,
  ConnectionStatus,
} from '../common/connection/connection-base';
import { EntityID } from './gamestate/entity';
import { Frame, FrameAssignToken, FrameMessage, frames } from '../common/frames';
import { EventEmitter } from '../common/event-emitter';
import { ChatChannel, ChatMessage } from './gamestate/components/chat-channel';
import {
  HierarchyChild,
  HierarchyContainer,
  Name,
} from './gamestate/components';
import { Server } from './server';
import { CommandName } from '../client/parser/commands';
import { Logger } from '../common/logger';

export interface SeralizedClient {
  type: 'client';
  id: string;
  player: string;
}

export class Client {
  public readonly id: string; // client secret
  public player: EntityID;
  public server: Server;

  public onFrame = EventEmitter.channel<Frame>();
  public onMessage = EventEmitter.channel<{ msg: ChatMessage; verb: string }>();
  public onEntityEnterRoom = EventEmitter.channel<EntityID>();
  public onEntityExitRoom = EventEmitter.channel<EntityID>();
  public onChangeRooms = EventEmitter.channel<void>();

  public onConnectionClose = EventEmitter.channel<void>();
  public onRoomExit = EventEmitter.channel<void>();

  private connection: ConnectionBase | null;
  private _name: string;

  constructor(
    server: Server,
    connection: ConnectionBase | null,
    player: EntityID,
    id?: string
  ) {
    this.server = server;
    this.player = player;
    this._name = this.name;
    this.id = id ?? uuidv4();
    this.useConnection(connection);
  }

  get gs() {
    return this.server.gamestate;
  }

  get name() {
    return this.gs.nameOf(this.player);
  }

  public useConnection(connection: ConnectionBase | null) {
    this.freeConnection();
    this.connection = connection;
  }

  public disconnect(reason: string) {
    this.sendMessageFrame({ text: reason, format: [] });
    this.connection?.close();
    this.freeConnection();
  }

  public freeConnection() {
    this.onRoomExit.emit();
    this.onRoomExit.clear();
    this.onConnectionClose.emit();
    this.onConnectionClose.clear();

    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }
  }

  public assignToken() {
    const data = new FrameAssignToken(this.id);
    console.log(data);
    this.sendFrame(data);
  }

  public isActive() {
    return this.connection !== null;
  }

  public stop() {
    this.onRoomExit.emit();
    this.onConnectionClose.emit();
  }

  public destroyPlayer() {
    this.gs.destroyEntity(this.player);
  }

  public remakePlayer() {
    const old = this.gs.findPlayer(this._name);
    if (old) this.gs.destroyEntity(old);

    const player = this.gs.createPlayer(this._name);
    this.player = player;
  }

  /**
   * Attach the connection to the gamestate and start listening for commands
   */
  public start(world: EntityID) {
    const closeCallbacks: Array<Function> = [];

    if (!this.connection) throw new Error('No attached connection');

    this.onConnectionClose.once(
      this.connection.onData(data => {
        const frame = frames.parse(data);
        if (!frame) throw new Error('Unable to parse incoming data: ' + data);
        this.onFrame.emit(frame);
      })
    );

    this.onConnectionClose.once(
      this.gs
        .entity(this.player)
        .get(HierarchyChild)
        .onMove(() => this.onMove())
    );

    this.onConnectionClose.once(
      this.gs
        .entity(world)
        .get(ChatChannel)
        .event(msg => {
          this.chatMessage(msg, 'shouts');
        })
    );

    this.onConnectionClose.once(
      this.gs
        .entity(this.player)
        .get(ChatChannel)
        .event(data => {
          this.chatMessage(data, 'whispers');
        })
    );

    if (this.gs.hasParent(this.player)) this.onMove();
  }

  /**
   * Handle player movement events
   */
  public onMove() {
    // the onRoomExit event emitter is used to stop listening for events in the previous room when moving between rooms
    // onRoomExit.once() should be used rather than onRoomExit()
    this.onRoomExit.emit();

    this.onChangeRooms.emit();

    this.onRoomExit.once(
      this.gs
        .getParent(this.player)
        .get(HierarchyContainer)
        .onJoin(id => {
          this.entityEnter(id);
        })
    );

    this.onRoomExit.once(
      this.gs
        .getParent(this.player)
        .get(HierarchyContainer)
        .onLeave(id => {
          this.entityExit(id);
        })
    );

    if (this.gs.getParent(this.player).has(ChatChannel)) {
      this.onRoomExit.once(
        this.gs
          .getParent(this.player)
          .get(ChatChannel)
          .event(msg => {
            this.chatMessage(msg, 'says');
          })
      );
    }
  }

  public chatMessage(msg: ChatMessage, verb: string = 'says') {
    this.onMessage.emit({ msg, verb });
  }

  public entityEnter(id: EntityID) {
    this.onEntityEnterRoom.emit(id);
  }

  public entityExit(id: EntityID) {
    this.onEntityExitRoom.emit(id);
  }

  public sendFrame(frame: Frame) {
    const data = frame.serialize();
    if (!this.connection || this.connection.status !== ConnectionStatus.OK)
      throw new Error('connection not available');
    this.connection.send(data);
  }

  public sendMessageFrame(...parts: { text: string; format: string[] }[]) {
    this.sendFrame(new FrameMessage(parts));
  }

  /**
   * Send a chat message
   * @param EntityID the channel to send the message, can be the world chat, room chat, or a player entity
   * @param content the message contents
   */
  public sendChat(entity: EntityID, content: string) {
    this.gs
      .entity(entity)
      .get(ChatChannel)
      .event.emit({
        senderID: this.player,
        senderName: this.gs.entity(this.player).get(Name).data,
        content,
      });
  }

  /**
   * Get the room the player is currently in
   */
  public getRoom(): EntityID {
    const room = this.gs.getParentID(this.player);
    return room;
  }
}
