import { roundTo } from '../../common/util';
import { WebMUDServerPlugin } from '../webmud-server-plugin';
import { Server } from '../server';

export class UtilCommandsPlugin extends WebMUDServerPlugin {
  init(server: Server) {
    server.commands.addCommand({
      command: 'clear',
      alias: [],
      usage: 'clear',
      about: 'clear the console',

      use(argv: string[]) {
        server.clear();
      },
    });

    server.commands.addCommand({
      command: 'server',
      alias: [],
      usage: 'server [start|stop]',
      about: 'start or stop the game server',

      use(argv: string[]) {
        const target = argv.shift();
        if (!target) return server.error('Missing argument [start|stop]');
        if (target === 'start') {
          server.start();
        } else if (target === 'stop') {
          server.stop();
        } else {
          return server.error(`Unkown: ${target}`);
        }
      },
    });

    server.commands.addCommand({
      command: 'tps',
      alias: [],
      usage: 'tps',
      about: 'view current ticks per second',

      use(argv: string[]) {
        server.info(`@${roundTo(server.tps, 5)} tps`);
      },
    });

    server.commands.addCommand({
      command: 'help',
      alias: ['h'],
      usage: 'help [<command>]',
      about:
        'get a list of commands, or specifiy a command to get more info about it',

      use(argv: string[], commands) {
        const cmd = argv.shift();
        if (!cmd)
          for (const cmd of commands.uniq.values())
            server.print(`${cmd.command} - ${cmd.about}`);
        else {
          const command = commands.search(cmd);
          if (!command) return server.error(`Unkown command: ${cmd}`);

          server.print(
            `Help page for ${command.command} (${command.alias.join('|')}):`
          );
          server.small(` - usage: ${command.usage}`);
          server.small(` - ${command.about}`);
        }
      },
    });

    server.commands.addCommand({
      command: 'listclients',
      alias: ['lsc', 'lsclients'],
      usage: 'listclients',
      about: 'list the connected clients',

      use(argv: string[], commands) {
        server.bold(
          'Clients: ' +
            Array.from(server.getClients())
              .map(client => client.name)
              .join(', ')
        );
      },
    });
  }
}
