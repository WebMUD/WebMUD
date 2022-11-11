import { roundTo } from "../../common/util";
import { Adjacent, Description, HierarchyChild, HierarchyContainer, Name, Player, Room, World } from "../gamestate/components";
import { Entity, EntityID } from "../gamestate/entity";
import { Server } from "../server";

export function util(server: Server) {
    server.commands.addCommand({
        command: 'clear',
        alias: [],
        usage: 'clear',
        about: 'clear the console',
    
        use(argv: string[]) {
          server.clear();
        }
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
        }
    });

    server.commands.addCommand({
        command: 'tps',
        alias: [],
        usage: 'tps',
        about: 'view current ticks per second',
    
        use(argv: string[]) {
          server.info(`@${roundTo(server.tps, 5)} tps`);
        }
    });

    server.commands.addCommand({
        command: 'help',
        alias: ['h'],
        usage: 'help [<command>]',
        about: 'get a list of commands, or specifiy a command to get more info about it',
    
        use(argv: string[], commands) {
          const cmd = argv.shift();
          if (!cmd) for (const cmd of commands.uniq.values()) server.print(`${cmd.command} - ${cmd.about}`);
          else {
            const command = commands.search(cmd);
            if (!command) return server.error(`Unkown command: ${cmd}`);

            server.print(`Help page for ${command.command} (${command.alias.join('|')}):`);
            server.small(` - usage: ${command.usage}`);
            server.small(` - ${command.about}`);
          }
        }
    });

    server.commands.addCommand({
        command: 'listclients',
        alias: ['lsc', 'lsclients'],
        usage: 'listclients',
        about: 'list the connected clients',
    
        use(argv: string[], commands) {
          server.bold('Clients: ' + Array.from(server.getClients()).map(client=>client.name).join(', '));
        }
    });
}

export function world(server: Server) {
    server.commands.addCommand({
        command: 'inspect',
        alias: ['i'],
        usage: 'inspect <entity>',
        about: 'inspect an entity',
    
        use(argv: string[]) {
            const id = argv.join(' ');
            if (!id) return server.error('Missing value for entity');
            const entity = server.gamestate.find(id);
            if (!entity) return server.error(`Unable to find an entity by the name of ${id}`);

            const e = server.gamestate.entity(entity);
            if (e.has(Player)) server.bold(`Player: "${server.gamestate.nameOf(entity)}":`)
            else if (e.has(Room)) server.bold(`Room: "${server.gamestate.nameOf(entity)}":`)
            else if (e.has(World)) server.bold(`World: "${server.gamestate.nameOf(entity)}":`)
            else server.bold(`Entity ${server.gamestate.nameOf(entity)}:`)

            server.print(` - id: ${entity}`);

            if (e.has(Description) && e.get(Description).data) server.print(` - Description: ${e.get(Description).data}`);
            if (e.has(Adjacent)) {
                server.print(' - Adjacent rooms:');
                const adjacent = e.get(Adjacent) as unknown as {[key: string]: string};
                const directions = ['north','south','east','west','up','down',];

                for (const direction of directions) {
                    if (adjacent[direction]) server.small(` -- ${direction}: ${server.gamestate.nameOf(adjacent[direction])} (${adjacent[direction]})`);
                }
                
            }
            if (e.has(HierarchyChild)) server.print(` - parent: ${server.gamestate.nameOf(server.gamestate.getParent(entity))}`);
            if (e.has(HierarchyContainer)) {
                const children = server.gamestate.getChildrenIDs(e.id);
                server.print(` - children:`);
                for (const child of children) {
                    server.small(` -- ${child}: ${server.gamestate.nameOf(child)}`);
                }
            }
        }
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
            if (!targetID) return server.error(`Unable to find an entity by the name of ${target}`);
            if (!parentID) return server.error(`Unable to find an entity by the name of ${parent}`);

            server.gamestate.move(targetID, parentID);
            server.info(`Moved ${server.gamestate.nameOf(targetID)} to ${server.gamestate.nameOf(parentID)}`);
        }
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
            if (!targetID) return server.error(`Unable to find an entity by the name of ${target}`);

            const name = server.gamestate.nameOf(targetID);
            server.gamestate.destroyEntity(targetID);
            server.warn(`Destroyed entity: ${name}`);
        }
    });
}