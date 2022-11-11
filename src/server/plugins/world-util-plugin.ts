import {
  Adjacent,
  Description,
  HierarchyChild,
  HierarchyContainer,
  Player,
  Room,
  World,
} from '../gamestate/components';
import { WebMUDServerPlugin } from '../webmud-server-plugin';
import { Server } from '../server';

export class WorldUtilPlugin extends WebMUDServerPlugin {
  init(server: Server) {
    server.commands.addCommand({
      command: 'inspect',
      alias: ['i'],
      usage: 'inspect <entity>',
      about: 'inspect an entity',

      use(argv: string[]) {
        const id = argv.join(' ');
        if (!id) return server.error('Missing value for entity');
        const entity = server.gamestate.find(id);
        if (!entity)
          return server.error(`Unable to find an entity by the name of ${id}`);

        const e = server.gamestate.entity(entity);
        if (e.has(Player))
          server.bold(`Player: "${server.gamestate.nameOf(entity)}":`);
        else if (e.has(Room))
          server.bold(`Room: "${server.gamestate.nameOf(entity)}":`);
        else if (e.has(World))
          server.bold(`World: "${server.gamestate.nameOf(entity)}":`);
        else server.bold(`Entity ${server.gamestate.nameOf(entity)}:`);

        server.print(` - id: ${entity}`);

        if (e.has(Description) && e.get(Description).data)
          server.print(` - Description: ${e.get(Description).data}`);
        if (e.has(Adjacent)) {
          server.print(' - Adjacent rooms:');
          const adjacent = e.get(Adjacent) as unknown as {
            [key: string]: string;
          };
          const directions = ['north', 'south', 'east', 'west', 'up', 'down'];

          for (const direction of directions) {
            if (adjacent[direction])
              server.small(
                ` -- ${direction}: ${server.gamestate.nameOf(
                  adjacent[direction]
                )} (${adjacent[direction]})`
              );
          }
        }
        if (e.has(HierarchyChild))
          server.print(
            ` - parent: ${server.gamestate.nameOf(
              server.gamestate.getParent(entity)
            )}`
          );
        if (e.has(HierarchyContainer)) {
          const children = server.gamestate.getChildrenIDs(e.id);
          server.print(` - children:`);
          for (const child of children) {
            server.small(` -- ${child}: ${server.gamestate.nameOf(child)}`);
          }
        }
      },
    });

    server.commands.addCommand({
      command: 'move',
      alias: ['mv', 'm'],
      usage: 'move <target> <parent>',
      about: 'move an entity',

      use(argv: string[]) {
        const target = argv.shift();
        const parent = argv.shift();
        if (!target) return server.error('Missing value for target');
        if (!parent) return server.error('Missing value for parent');
        const targetID = server.gamestate.find(target);
        const parentID = server.gamestate.find(parent);
        if (!targetID)
          return server.error(
            `Unable to find an entity by the name of ${target}`
          );
        if (!parentID)
          return server.error(
            `Unable to find an entity by the name of ${parent}`
          );

        server.gamestate.move(targetID, parentID);
        server.info(
          `Moved ${server.gamestate.nameOf(
            targetID
          )} to ${server.gamestate.nameOf(parentID)}`
        );
      },
    });

    server.commands.addCommand({
      command: 'destroy',
      alias: ['del', 'd'],
      usage: 'destroy <target>',
      about: 'destroy an entity',

      use(argv: string[]) {
        const target = argv.shift();
        if (!target) return server.error('Missing value for target');
        const targetID = server.gamestate.find(target);
        if (!targetID)
          return server.error(
            `Unable to find an entity by the name of ${target}`
          );

        const name = server.gamestate.nameOf(targetID);
        server.gamestate.destroyEntity(targetID);
        server.warn(`Destroyed entity: ${name}`);
      },
    });
  }
}
