import {
  Frame,
  FrameMessage,
  FrameRequestCommandList,
  FrameSendCommand,
} from '../../common/frames';
import { Client } from '../client';
import { Entity, EntityID } from '../gamestate/entity';
import { Server } from '../server';
import { WebMUDServerPlugin } from '../webmud-server-plugin';

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
          this.firstPersonName(client, id, 'You'),
          FrameMessage.field(' entered the room.')
        );
      });

      client.onEntityExitRoom(id => {
        const room = server.gs.nameOf(server.gs.getParentID(id));

        client.sendMessageFrame(
          this.firstPersonName(client, id, 'You'),
          FrameMessage.field(' moved to '),
          FrameMessage.field(room),
          FrameMessage.field('.')
        );
      });

      client.onMessage(({ msg, verb }) => {
        const id = msg.senderID;
        const name = msg.senderName;
        const content = msg.content;

        client.sendMessageFrame(
          FrameMessage.field(name, 'console-playername'),
          FrameMessage.field(` ${verb} `),
          FrameMessage.field(content)
        );
      });

      server.onClientJoin(joinedClient => {
        client.sendMessageFrame(
          this.firstPersonName(client, joinedClient.player),
          FrameMessage.field(' joined the game.')
        );
      });
    });
  }

  isFirstPerson(client: Client, id: EntityID) {
    if (client.player === id) return true;
  }

  firstPersonName(client: Client, id: EntityID, you: string = 'you') {
    if (this.isFirstPerson(client, id))
      return FrameMessage.field(you, 'console-playerself');
    return FrameMessage.field(client.gs.nameOf(id), 'console-playername');
  }

  addHandler<T extends Frame>(
    t: FrameClass<T>,
    fn: (frame: T, client: Client, server: Server) => void
  ) {
    this.handlers.set(t, fn);
  }

  incoming<T extends Frame>(frame: T, client: Client, server: Server) {
    const result = this.handlers.get(frame.constructor);
    if (!result) throw new Error(`cannot handle ${frame.type} frame`);

    result(frame, client, server);
  }
}
