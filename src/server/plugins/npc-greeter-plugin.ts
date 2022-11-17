import { Server } from "../server";
import { WebMUDServerPlugin } from "../webmud-server-plugin"

export class NPCGreeterPlugin extends WebMUDServerPlugin {
    server: Server;

    init(server: Server) {
        this.server = server;
        
        // add create-npc-greeter command
        server.commands.addCommand({
            command: 'create-npc-greeter',
            alias: ['cnpc-greeter'],
            usage: 'create-npc-greeter <name> <message>',
            about: 'create a greeter npc',
      
            use(argv: string[]) {
                const name = argv.shift();
                const message = argv.shift();
                if (!name) return server.error(`Missing value for name`);
                if (!message) return server.error(`Missing value for message`);
                this.create(name, message);
            },
        });
    }

    create(name: string, message: string) {
        // create entity

        // listen to parent changing event
    }
}