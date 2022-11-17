import {
  Frame,
  FrameMessage,
  FrameRequestCommandList,
  FrameSendCommand,
} from '../../common/frames';
import { Client } from '../client';
import { Adjacent, Player } from '../gamestate/components';
import { Entity, EntityID } from '../gamestate/entity';
import { Server } from '../server';
import { WebMUDServerPlugin } from '../webmud-server-plugin';
import { NPCComponent } from './npc-plugin';

export type FrameClass<T extends Frame> = new (...args: any[]) => T;
type Handler<T extends Frame> = (
  frame: T,
  client: Client,
  server: Server
) => void;

export class ClientBehaviorPlugin extends WebMUDServerPlugin {
  private handlers = new Map<Function, Handler<any>>();

  constructor() {
    super();

    this.addHandler(
      FrameSendCommand,
      (frame: FrameSendCommand, client, server) => {
        console.log(frame.command);
      }
    );

    this.addHandler(
      FrameRequestCommandList,
      (frame: FrameRequestCommandList, client, server) => {
        console.log(frame);
      }
    );
  }

  init(server: Server) {
    server.onClientJoin(client => {
      client.onFrame(frame => {
        this.incoming(frame, client, server);
      });

      client.onEntityEnterRoom(id => {
        client.sendMessageFrame(
          this.formatName(client, id, 'You'),
          FrameMessage.field(' entered.')
        );
      });

      client.onEntityExitRoom(id => {
        const currentRoom = server.gs.getParent(client.player);
        const adjacent = currentRoom.get(Adjacent);

        const roomID = server.gs.getParentID(id);
        const room = server.gs.nameOf(roomID);

        let directionMessage: string | null = null;
        if (adjacent.north === roomID) directionMessage = 'left to the north';
        if (adjacent.south === roomID) directionMessage = 'left to the south';
        if (adjacent.east === roomID) directionMessage = 'left to the east';
        if (adjacent.west === roomID) directionMessage = 'left to the west';
        if (adjacent.down === roomID) directionMessage = 'moved down';
        if (adjacent.up === roomID) directionMessage = 'moved up';

        if (directionMessage)
          client.sendMessageFrame(
            this.formatName(client, id, 'You'),
            FrameMessage.field(' ' + directionMessage + '.')
          );
        else if (client.player === id)
          client.sendMessageFrame(
            this.formatName(client, id, 'You'),
            FrameMessage.field(' teleported to '),
            FrameMessage.field(room),
            FrameMessage.field('.')
          );
        else
          client.sendMessageFrame(
            this.formatName(client, id, 'You'),
            FrameMessage.field(' vanished.')
          );
      });

      client.onMessage(({ msg, verb }) => {
        const id = msg.senderID;
        const name = msg.senderName;
        const content = msg.content;

        client.sendMessageFrame(
          this.formatName(client, id),
          FrameMessage.field(` ${verb} `),
          FrameMessage.field(`"${content}"`)
        );
      });

      server.onClientJoin(joinedClient => {
        client.sendMessageFrame(
          this.formatName(client, joinedClient.player),
          FrameMessage.field(' joined the game.')
        );
      });
    });
  }

  isFirstPerson(client: Client, id: EntityID) {
    if (client.player === id) return true;
  }

  /**
   * Format an entity name to be send in a server message frame
   */
  formatName(client: Client, id: EntityID, you: string = 'you') {
    const name = client.gs.nameOf(id);

    if (client.gs.entity(id).has(NPCComponent))
      return FrameMessage.field(name, 'console-npcname');
    if (this.isFirstPerson(client, id))
      return FrameMessage.field(you, 'console-playerself');
    if (client.gs.entity(id).has(Player))
      return FrameMessage.field(name, 'console-playername');

    return FrameMessage.field(name, 'console-entityname');
  }

  /**
   * Add a callback to handle a specific type of frame
   */
  addHandler<T extends Frame>(
    t: FrameClass<T>,
    fn: (frame: T, client: Client, server: Server) => void
  ) {
    this.handlers.set(t, fn);
  }

  /**
   * Submit an incoming frame to be handled
   */
  incoming<T extends Frame>(frame: T, client: Client, server: Server) {
    const result = this.handlers.get(frame.constructor);
    if (!result) throw new Error(`cannot handle ${frame.type} frame`);

    result(frame, client, server);
  }
}
