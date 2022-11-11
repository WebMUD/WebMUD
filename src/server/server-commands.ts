import { parse } from "../common/commands";
import { Server } from "./server";

interface ServerCommand {
    command: string;
    alias: string[];
    usage: string;
    about: string;

    use: (argv: string[], commands: ServerCommands) => void;
}

export class ServerCommands {
    private server: Server;
    public commands = new Map<string, ServerCommand>();
    public uniq = new Set<ServerCommand>();

    constructor(server: Server) {
        this.server = server;
    }

    addCommand(obj: ServerCommand) {
        this.uniq.add(obj);
        this.commands.set(obj.command, obj);
        for (const alias of obj.alias) {
            this.commands.set(alias, obj);
        }
    }

    parse(input: string) {
        const parts = parse(input);
        const cmdName = parts.shift();
        const cmd = this.commands.get(cmdName??'');
        if (!cmd) return this.server.error(`Unknown command: ${cmdName}`);

        cmd.use(parts, this);
    }

    search(cmd: string) {
        return this.commands.get(cmd);
    }
}