import { v4 as uuidv4 } from 'uuid';
import {
  ConnectionBase,
  ConnectionStatus,
} from '../common/connection/connection-base';
import { EntityID } from './gamestate/entity';
import { Frame, FrameMessage, frames } from '../common/frames';
import { EventEmitter } from '../common/event-emitter';
import { ChatChannel, ChatMessage } from './gamestate/components/chat-channel';
import {
  HierarchyChild,
  HierarchyContainer,
  Name,
} from './gamestate/components';
import { Server } from './server';

export class Client {
  public readonly id: string = uuidv4();
  public player: EntityID;
  public server: Server;

  public onFrame = EventEmitter.channel<Frame>();
  public onMessage = EventEmitter.channel<{ msg: ChatMessage; verb: string }>();
  public onEntityEnterRoom = EventEmitter.channel<EntityID>();
  public onEntityExitRoom = EventEmitter.channel<EntityID>();

  public onConnectionClose = EventEmitter.channel<void>();
  public onRoomExit = EventEmitter.channel<void>();

  private connection: ConnectionBase | null;

  constructor(
    server: Server,
    connection: ConnectionBase | null,
    player: EntityID
  ) {
    this.server = server;
    this.player = player;
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
  }

  /**
   * Handle player movement events
   */
  public onMove() {
    // the onRoomExit event emitter is used to stop listening for events in the previous room when moving between rooms
    // onRoomExit.once() should be used rather than onRoomExit()
    this.onRoomExit.emit();

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
