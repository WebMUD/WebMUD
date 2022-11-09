import { v4 as uuidv4 } from 'uuid';
import { ConnectionBase } from '../common/connection/connection-base';
import { EntityID } from './gamestate/entity';
import { Gamestate } from './gamestate/gamestate';
import { frames } from '../common/frames';
import { EventEmitter } from '../common/event-emitter';
import { ChatChannel, ChatMessage } from './gamestate/components/chat-channel';
import { HierarchyChild, HierarchyContainer, Name, Room } from './gamestate/components';
import { Server } from './server';

export class Client {
  public readonly id: string = uuidv4();
  public player: EntityID;
  public server: Server;
  
  public onConnectionClose = EventEmitter.channel<void>();
  public onRoomExit = EventEmitter.channel<void>();

  private connection: ConnectionBase | null;

  constructor(server: Server, connection: ConnectionBase | null, player: EntityID) {
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
    this.close();

    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }
  }

  public close() {
    this.onRoomExit.emit();
    this.onRoomExit.clear();
    this.onConnectionClose.emit();
    this.onConnectionClose.clear();
  }

  /**
   * Attach the connection to the gamestate and start listening for commands
   */
  public start(world: EntityID) {

    const closeCallbacks: Array<Function> = [];

    if (!this.connection) throw new Error('No attached connection');

    this.onConnectionClose.once(this.connection.onData((data)=>{
      const frame = frames.parse(data);
      if (!frame) throw new Error('Unable to parse incoming data: ' + data);
      
      // handle client requests
    }));

    this.onConnectionClose.once(
      this.gs.entity(this.player).get(HierarchyChild).onMove(()=>this.onMove())
    );
    
    this.onConnectionClose.once(
      this.gs.entity(world).get(ChatChannel).event((msg)=>{
        this.chatMessage(msg);
      })
    );

    this.onConnectionClose.once(
      this.gs.entity(this.player).get(ChatChannel).event((data)=>{
        this.chatMessage(data);
      })
    );
  }

  /**
   * Handle player movement events
   * @param gamestate 
   */
  public onMove() {
    // the onRoomExit event emitter is used to stop listening for events in the previous room when moving between rooms
    // onRoomExit.once() should be used rather than onRoomExit()
    this.onRoomExit.emit();
    
    this.onRoomExit.once(
      this.gs.getParent(this.player).get(HierarchyContainer).onJoin((id)=>{
        this.entityEnter(id);
      })
    );

    this.onRoomExit.once(
      this.gs.getParent(this.player).get(HierarchyContainer).onLeave((id)=>{
        this.entityExit(id);
      })
    );
    
    if (this.gs.getParent(this.player).has(ChatChannel)) {
      this.onRoomExit.once(
        this.gs.getParent(this.player).get(ChatChannel).event((msg)=>{
          this.chatMessage(msg);
        })
      );
    }
  }

  public chatMessage(msg: ChatMessage) {
    // send over connection
    this.connection?.send(JSON.stringify(msg)); // todo: needs to use frames
  }
  
  public entityEnter(id: EntityID) {
    // send over connection
    const name = this.gs.nameOf(id);
    // {name} entered the room
  }

  public entityExit(id: EntityID) {
    // send over connection
    const name = this.gs.nameOf(id);
    const parentName = this.gs.nameOf(this.gs.getParent(id));
    // {name} moved to {parentName}
  }

  /**
   * Send a chat message
   * @param EntityID the channel to send the message, can be the world chat, room chat, or a player entity
   * @param content the message contents
   */
  public sendChat(entity: EntityID, content: string) {
    this.gs.entity(entity).get(ChatChannel).event.emit({
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
