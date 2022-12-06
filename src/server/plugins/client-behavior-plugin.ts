import {
  Frame,
  FrameMessage,
  FrameRequestCommandList,
  FrameSendCommand,
} from '../../common/frames';
import { Client } from '../client';
import { Adjacent, Description, HierarchyChild, HierarchyContainer, Player } from '../gamestate/components';
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

  describeRoom(client: Client) {
    const room = client.gs.getParent(client.player);
    const roomName = client.gs.nameOf(room);
    const adjacent = room.get(Adjacent);

    client.sendMessageFrame(
      FrameMessage.field('...['),
      FrameMessage.field(roomName, 'room'),
      FrameMessage.field(']...'),
    );

    client.sendMessageFrame(
      FrameMessage.field(room.get(Description).data),
    );

    const players: string[] = [];
    const npcs: string[] = [];

    for (const child of room.get(HierarchyContainer).children) {
      if (client.gs.entity(child).has(Player) && child !== client.player) players.push(child);
      if (client.gs.entity(child).has(NPCComponent)) npcs.push(child);
    }

    for (const player of players)
      client.sendMessageFrame(
        FrameMessage.field(' * ', 'bullet'),
        this.formatName(client, player, 'You'),
        FrameMessage.field(' is here.')
      );

    for (const npc of npcs)
      client.sendMessageFrame(
        FrameMessage.field(' * ', 'bullet'),
        this.formatName(client, npc, 'You'),
        FrameMessage.field(' is here.')
      );

    client.sendMessageFrame(
      FrameMessage.field('exits:'),
    );

    for (const direction of Adjacent.directions) {
      const value = (adjacent as any)[direction];
      if (value) {
        client.sendMessageFrame(
          FrameMessage.field(' * '),
          FrameMessage.field(direction),
          FrameMessage.field(': '),
          FrameMessage.field(client.gs.nameOf(value)),
        );
      }
    }

    client.sendMessageFrame(
      FrameMessage.field('.'.repeat(8+roomName.length)),
    );
  }

  init(server: Server) {
    server.onClientJoin(client => {
      client.onFrame(frame => {
        this.incoming(frame, client, server);
      });

      client.onChangeRooms(()=>{
        this.describeRoom(client);
      });

      client.onEntityEnterRoom(id => {
        client.sendMessageFrame(
          this.formatName(client, id, 'You'),
          FrameMessage.field(' entered.')
        );
      });

      client.onEntityExitRoom(id => {
        const room = server.gs.getParentID(id);
        const roomName = server.gs.nameOf(room);

        // first person
        if (client.player === id) {
          client.sendMessageFrame(
            this.formatName(client, id, 'You'),
            FrameMessage.field(' moved to '),
            FrameMessage.field(roomName),
            FrameMessage.field('.')
          );
          return;
        }

        // third person
        const currentRoom = server.gs.getParentID(client.player);
        const adjacent = server.gs.entity(currentRoom).get(Adjacent);

        // if the player moved to an adjacent room
        for (const direction of Adjacent.directions) {
          if ((adjacent as any)[direction] === room)
            return client.sendMessageFrame(
                this.formatName(client, id, 'You'),
                FrameMessage.field(' moved '),
                FrameMessage.field(direction),
            );
        }

        // if the player teleported
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
