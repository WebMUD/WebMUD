import { Server } from '../server';
import { WebMUDServerPlugin } from '../webmud-server-plugin';

export class HelpCommandPluggin extends WebMUDServerPlugin {
  init(server: Server) {
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
  }
}
