import { WebMUDServerPlugin } from '../webmud-server-plugin';
import { Server } from '../server';

export class MapEditPlugin extends WebMUDServerPlugin {
  init(server: Server) {
    server.commands.addCommand({
      command: 'createworld',
      alias: ['cw'],
      usage: 'cworld <name>',
      about: 'create a world',

      use(argv: string[]) {
        const name = argv.shift();

        if (!name) return server.error(`Missing value for name`);

        server.gamestate.createWorld(name);

        server.info(`Created world: ${name}`);
      },
    });

    server.commands.addCommand({
      command: 'createroom',
      alias: ['cr'],
      usage: 'croom <name> <description> [<world>]',
      about: 'create a room',

      use(argv: string[]) {
        const name = argv.shift();
        const description = argv.shift() ?? '';
        const _world = argv.shift();
        let world;

        if (!name) return server.error(`Missing value for name`);

        if (!_world) world = server.world;
        else {
          world = server.gamestate.findWorld(_world);
          if (!world) return server.error(`World ${_world} does not exist`);
        }

        server.initRoom(server.gamestate.createRoom(name, description, world));

        server.info(`Created room: ${server.gamestate.nameOf(world)}/${name}`);
      },
    });

    server.commands.addCommand({
      command: 'createprop',
      alias: ['cp'],
      usage: 'cprop <name> <description> [<owner>]',
      about: 'create a prop',

      use(argv: string[]) {
        const name = argv.shift();
        const description = argv.shift() ?? '';
        const owner = argv.pop();
        let world;

        if (!name) return server.error(`Missing value for name`);

        const result = server.gamestate.createProp(name, description, false);
        if (owner) {
          const ownerID = server.gamestate.find(owner);
          if (!ownerID)
            return server.error(
              `Could not find entity by the name of ${owner}`
            );
          server.gamestate.move(result, ownerID);
          server.info(
            `Created prop: ${name} in ${server.gamestate.nameOf(ownerID)}`
          );
        } else {
          server.info(`Created prop: ${name}`);
        }
      },
    });

    server.commands.addCommand({
      command: 'link',
      alias: ['ln'],
      usage: 'link <first> [n|s|e|w] [of] <second>',
      about: 'link rooms',

      use(argv: string[]) {
        const first = argv.shift();
        const directionOf = argv.shift();
        const second = argv.pop();

        if (!first) return server.error('Missing value for first');
        if (!second) return server.error('Missing value for second');

        const firstID = server.gamestate.findRoom(first);
        const secondID = server.gamestate.findRoom(second);

        if (!firstID)
          return server.error(`Unable to find a room by the name of ${first}`);
        if (!secondID)
          return server.error(`Unable to find a room by the name of ${second}`);

        const firstName = server.gamestate.nameOf(firstID);
        const secondName = server.gamestate.nameOf(secondID);

        if (directionOf?.startsWith('n')) {
          server.gamestate.connectNorthSouth(firstID, secondID);
          server.info(`made ${firstName} north of ${secondName}`);
        }
        if (directionOf?.startsWith('s')) {
          server.gamestate.connectNorthSouth(secondID, firstID);
          server.info(`made ${firstName} south of ${secondName}`);
        }
        if (directionOf?.startsWith('e')) {
          server.gamestate.connectEastWest(firstID, secondID);
          server.info(`made ${firstName} east of ${secondName}`);
        }
        if (directionOf?.startsWith('w')) {
          server.gamestate.connectEastWest(secondID, firstID);
          server.info(`made ${firstName} west of ${secondName}`);
        }
      },
    });
  }
}
