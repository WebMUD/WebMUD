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
        } else if (target === 'restart') {
          server.restart();
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
        server.info(`${roundTo(server.tps, 5)} tps`);
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

    server.commands.addCommand({
      command: 'config',
      alias: ['cfg'],
      usage:
        'config [list | enable <flag> | disable <flag> | set <option> <value> | show <flag|option>]',
      about: 'configure server settings',

      use(argv: string[], commands) {
        const action = argv.shift() ?? 'list';
        
        if (action === 'list') {
          server.small('flags: ' + Object.values(Server.FLAGS).join(','));
          server.small('options: ' + Object.values(Server.OPTIONS).join(','));
          return;
        } else if (action === 'enable' || action === 'disable') {
          const flag = argv.shift();
          if (!flag) return server.error('Missing value for flag');
          if (!(flag in Server.FLAGS))
            return server.error(`Invalid flag ${flag}`);

          if (action === 'enable') {
            server.flag(flag, true);
            server.bold(`enabled ${flag}`);
          } else {
            server.flag(flag, false);
            server.bold(`disabled ${flag}`);
          }
        } else if (action === 'set') {
          const option = argv.shift();
          const value = argv.shift();
          if (!option) return server.error('Missing value for option');
          if (!value) return server.error('Missing value for value');

          if (!(option in Server.OPTIONS))
            return server.error(`Invalid option ${option}`);
          server.option(option, Number(value));
        } else if (action === 'show') {
          const x = argv.shift();
          if (!x) return server.error('Missing value for flag|option');
          
          if (x in Server.FLAGS)
            server.info(`${x} is set to ${server.flag(x)}`);
          if (x in Server.OPTIONS)
            server.info(`${x} is set to ${server.option(x)}`);
        }
      },
    });
  }
}
