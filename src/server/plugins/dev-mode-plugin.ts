import { Server } from '../server';
import { WebMUDServerPlugin } from '../webmud-server-plugin';

export class DevModePlugin extends WebMUDServerPlugin {
  init(server: Server) {
    server.commands.addCommand({
      command: 'id',
      alias: [],
      usage: 'id',
      about: 'get the server id',

      use(argv: string[]) {
        server.bold(server.discoveryID);
      },
    });

    server.commands.addCommand({
      command: 'join',
      alias: [],
      usage: 'join',
      about: 'open a client in a new tab',

      use(argv: string[]) {
        window.open(server.joinLink(), '_blank')?.focus();
      },
    });

    server.onReady(()=>server.start());
  }
}
