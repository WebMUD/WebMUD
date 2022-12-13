import {
  Frame,
  FrameMessage,
  FrameRequestCommandList,
  FrameSendCommand,
} from '../../common/frames';
import { Client } from '../client';
import {
  Adjacent,
  Description,
  HierarchyChild,
  HierarchyContainer,
  Item,
  Player,
  Prop,
} from '../gamestate/components';
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
  private commandHandlers = new Map<
    string,
    (frame: FrameSendCommand, client: Client, server: Server) => void
  >();

  constructor() {
    super();

    this.addCommand(
      'move',
      (frame: FrameSendCommand, client: Client, server: Server) => {
        let direction: null | string = null;
        for (const { name, value } of frame.arguements) {
          if (name === 'direction') direction = value;
        }

        const adjacent = client.gs.getParent(client.player).get(Adjacent);

        if (direction === null) throw new Error('missing target argument');

        const target = (adjacent as any)[direction];

        if (!target) {
          client.sendMessageFrame(
            FrameMessage.field(`No room ${direction} of you.`)
          );
          return;
        }

        const id = client.player;
        client.gs.move(id, target);
      }
    );

    this.addCommand(
      'whisper',
      (frame: FrameSendCommand, client: Client, server: Server) => {
        let playerName: null | string = null;
        let message: null | string = null;
        for (const { name, value } of frame.arguements) {
          if (name === 'username') playerName = value;
          if (name === 'message') message = value;
        }

        if (playerName === null) throw new Error('missing player argument');

        const recieverID = client.gs.findPlayer(playerName);
        const senderID = client.player;

        if (message === null) throw new Error('missing message argument');

        if (!recieverID) {
          client.sendMessageFrame(
            FrameMessage.field(`player ${playerName} could not be found!`)
          );
          return;
        }

        client.sendMessageFrame(
          this.formatName(client, senderID),
          FrameMessage.field(' whisper '),
          FrameMessage.field(`${message}`),
          FrameMessage.field(' to '),
          FrameMessage.field(`${client.gs.nameOf(recieverID)}`)
        );

        client.sendChat(recieverID, message);
      }
    );

    this.addCommand(
      'drop',
      (frame: FrameSendCommand, client: Client, server: Server) => {
        const room = server.gs.getParentID(client.player);

        let itemName: null | string = null;
        for (const { name, value } of frame.arguements) {
          if (name === 'item') itemName = value;
        }

        if (itemName === null) throw new Error('missing item argument');

        let item: null | string = null;
        for (const child of client.gs
          .entity(client.player)
          .get(HierarchyContainer).children) {
          if (client.gs.nameOf(child) === itemName) {
            item = child;
          }
        }

        if (item === null) {
          client.sendMessageFrame(
            FrameMessage.field(`You are not carrying ${itemName}.`)
          );
          return;
        }

        server.gs.move(item, room);
      }
    );

    this.addCommand(
      'take',
      (frame: FrameSendCommand, client: Client, server: Server) => {
        const room = server.gs.getParentID(client.player);

        let itemName: null | string = null;
        for (const { name, value } of frame.arguements) {
          if (name === 'item') itemName = value;
        }

        if (itemName === null) throw new Error('missing item argument');

        let item: null | string = null;

        const locateItem = (itemName: string, container: EntityID) => {
          for (const child of client.gs
            .entity(container)
            .get(HierarchyContainer).children) {
            if (!client.gs.entity(child).has(Prop)) continue;
            if (client.gs.nameEqual(client.gs.nameOf(child), itemName))
              item = child;
            else if (client.gs.entity(child).has(HierarchyContainer))
              locateItem(itemName, child);
          }
        };

        locateItem(itemName, room);

        if (!item) {
          client.sendMessageFrame(
            FrameMessage.field(`Could not find ${itemName}.`)
          );
          return;
        }

        if (!client.gs.entity(item).has(Item)) {
          client.sendMessageFrame(
            FrameMessage.field(`You cannot pick up ${itemName}.`)
          );
          return;
        }

        server.gs.pickUp(client.player, item);

        client.sendMessageFrame(FrameMessage.field(`You pick up ${itemName}.`));
      }
    );

    this.addCommand(
      'help',
      (frame: FrameSendCommand, client: Client, server: Server) => {
        const commands = {
          help: [
            'usage: (h)elp or (h)elp <command> ',
            ' Lists out the commands available to the player and can be used to get specific information about a specific command',
          ],
          move: [
            'usage: (m)ove <target> ',
            ' Can move to specific target, i.e. person place or thing. Alternatly can use cardinal directions. (north, east, south, or west)',
          ],
          exit: ['usage: (e)xit ', ' Tells you where all the exits are'],
          inventory: [
            'inventory ',
            'Usage: (i)nventory ',
            ' Lists out your inventory',
          ],
          say: [
            'usage: (s)ay <message> ',
            ' Sends a message to everyone in the room',
          ],
          whisper: [
            'usage: (w)hisper <player> <message> ',
            ' Sends a message only to the player designated',
          ],
          drop: [
            'usage: (d)rop <item> ',
            ' Drops the item from your inventory to the ground',
          ],
          take: ['usage: (t)ake <item> ', ' Grabs the specificed item'],
          look: [
            'usage: (l)ook <object>  ',
            ' Will give information on the room you are currently in, including which players reside there. If you input an object after look, it will give detailed information about the object',
          ],
        };

        for (const [commandName, helpLines] of Object.entries(commands)) {
          client.sendMessageFrame(FrameMessage.field(`${commandName}:`));
          for (const line of helpLines) {
            client.sendMessageFrame(FrameMessage.field(` * ${line}`));
          }
        }
      }
    );

    this.addCommand(
      'inventory',
      (frame: FrameSendCommand, client: Client, server: Server) => {
        const items = server.gs.getChildrenIDs(client.player);
        const itemNames = items.map(id => server.gs.nameOf(id));

        client.sendMessageFrame(FrameMessage.field(`You are carrying:`));
        for (const item of itemNames) {
          client.sendMessageFrame(FrameMessage.field(` * ${item}`));
        }
      }
    );

    this.addCommand(
      'say',
      (frame: FrameSendCommand, client: Client, server: Server) => {
        let message: null | string = null;
        for (const { name, value } of frame.arguements) {
          if (name === 'message') message = value;
        }

        if (message === null) throw new Error('missing message argument');

        client.sendChat(server.gs.getParentID(client.player), message);
      }
    );

    this.addCommand(
      'exits',
      (frame: FrameSendCommand, client: Client, server: Server) => {
        const room = client.gs.getParent(client.player);
        const roomName = client.gs.nameOf(room);
        const adjacent = room.get(Adjacent);
        client.sendMessageFrame(FrameMessage.field('exits:'));

        for (const direction of Adjacent.directions) {
          const value = (adjacent as any)[direction];
          if (value) {
            client.sendMessageFrame(
              FrameMessage.field(direction),
              FrameMessage.field(': '),
              FrameMessage.field(client.gs.nameOf(value))
            );
          }
        }
      }
    );

    this.addCommand(
      'look',
      (frame: FrameSendCommand, client: Client, server: Server) => {
        const room = server.gs.getParentID(client.player);

        let itemName: null | string = null;
        for (const { name, value } of frame.arguements) {
          if (name === 'object') itemName = value;
        }

        if (itemName === null || !itemName) return this.describeRoom(client);

        let item: null | string = null;

        const locateItem = (itemName: string, container: EntityID) => {
          for (const child of client.gs
            .entity(container)
            .get(HierarchyContainer).children) {
            if (!client.gs.entity(child).has(Prop)) continue;
            if (client.gs.nameEqual(client.gs.nameOf(child), itemName))
              item = child;
            else if (client.gs.entity(child).has(HierarchyContainer))
              locateItem(itemName, child);
          }
        };

        locateItem(itemName, room);

        if (item === null) {
          client.sendMessageFrame(
            FrameMessage.field(`Could not find ${itemName}.`)
          );
          return;
        }

        client.sendMessageFrame(
          FrameMessage.field(client.gs.entity(item).get(Description).data)
        );

        if (client.gs.entity(item).has(HierarchyContainer)) {
          client.sendMessageFrame(FrameMessage.field('Contains:'));
          for (const child of client.gs.entity(item).get(HierarchyContainer)
            .children) {
            client.sendMessageFrame(
              FrameMessage.field(' * '),
              FrameMessage.field(client.gs.nameOf(child))
            );
          }
        }
      }
    );

    this.addHandler(
      FrameSendCommand,
      (frame: FrameSendCommand, client, server) => {
        const handler = this.commandHandlers.get(frame.command);
        if (handler) handler(frame, client, server);
        else throw new Error(`No handler for command ${frame.command}`);
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

    client.sendMessageFrame(FrameMessage.field('\n'));

    client.sendMessageFrame(
      FrameMessage.field(roomName, 'room'),
      FrameMessage.field(': ')
    );

    client.sendMessageFrame(
      FrameMessage.field('  '),
      FrameMessage.field(room.get(Description).data),
      FrameMessage.field('\n')
    );

    client.sendMessageFrame(FrameMessage.field('\n'));

    client.sendMessageFrame(FrameMessage.field('You see:'));

    const players: string[] = [];
    const npcs: string[] = [];
    const props: string[] = [];

    for (const child of room.get(HierarchyContainer).children) {
      if (client.gs.entity(child).has(Player) && child !== client.player)
        players.push(child);
      if (client.gs.entity(child).has(NPCComponent)) npcs.push(child);
      if (client.gs.entity(child).has(Prop)) props.push(child);
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

    for (const prop of props)
      client.sendMessageFrame(
        FrameMessage.field(' * ', 'bullet'),
        FrameMessage.field(client.gs.nameOf(prop), 'console-propname')
      );

    client.sendMessageFrame(FrameMessage.field('\n'));

    client.sendMessageFrame(FrameMessage.field('exits:'));

    for (const direction of Adjacent.directions) {
      const value = (adjacent as any)[direction];
      if (value) {
        client.sendMessageFrame(
          FrameMessage.field(' * '),
          FrameMessage.field(direction),
          FrameMessage.field(': '),
          FrameMessage.field(client.gs.nameOf(value))
        );
      }
    }

    client.sendMessageFrame(FrameMessage.field('\n'));
  }

  init(server: Server) {
    server.onClientJoin(client => {
      client.onFrame(frame => {
        this.incoming(frame, client, server);
      });

      client.onChangeRooms(() => {
        this.describeRoom(client);
      });

      client.onEntityEnterRoom(id => {
        client.sendMessageFrame(
          this.formatName(client, id, 'You'),
          FrameMessage.field(' entered.')
        );
      });

      client.onEntityExitRoom(id => {
        if (
          !(
            client.gs.entity(id).has(Player) ||
            client.gs.entity(id).has(NPCComponent)
          )
        )
          return;

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
              FrameMessage.field(direction)
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

        const firstPersonVerbs: { [key: string]: string } = {
          says: 'say',
          shouts: 'shout',
          whispers: 'whisper',
        };

        if (this.isFirstPerson(client, id)) {
          verb = firstPersonVerbs[verb] ?? verb;
        }

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

  addCommand(
    command: string,
    callback: (frame: FrameSendCommand, client: Client, server: Server) => void
  ) {
    this.commandHandlers.set(command, callback);
  }
}