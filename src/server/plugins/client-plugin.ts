import { Frame } from '../../common/frames';
import { FrameConnect } from '../../common/frames/frame-connect';
import { Client } from '../client';
import { Server } from '../server';
import { WebMUDServerPlugin } from '../webmud-server-plugin';

export type FrameClass<T extends Frame> = new (...args: any[]) => T;
type Handler<T extends Frame> = (
  frame: T,
  client: Client,
  server: Server
) => void;

export class ClientPlugin extends WebMUDServerPlugin {
  private handlers = new Map<Function, Handler<any>>();

  constructor() {
    super();

    this.addHandler(FrameConnect, (frame, client, server) => {
      console.log(frame.username);
    });
  }

  init(server: Server) {
    server.onClientJoin(client => {
      client.onFrame(frame => {
        this.incoming(frame, client, server);
      });

      client.onEntityEnterRoom(id => {
        const name = server.gs.nameOf(id);
      });

      client.onEntityExitRoom(id => {
        const name = server.gs.nameOf(id);
      });

      client.onMessage(msg => {
        const id = msg.senderID;
        const name = msg.senderName;
        const content = msg.content;

        // client.sendFrame(new FrameMessage(...));
      });
    });
  }

  addHandler<T extends Frame>(
    t: FrameClass<T>,
    fn: (frame: T, client: Client, server: Server) => void
  ) {
    this.handlers.set(t, fn);
  }

  incoming<T extends Frame>(frame: T, client: Client, server: Server) {
    const result = this.handlers.get(frame.constructor);
    if (!result) throw new Error();

    result(frame, client, server);
  }
}
