import { AttributeTag } from "../gamestate/components/base/attribute-tag";
import { DataAttribute } from "../gamestate/components/base/data-attribute";
import { EntityID } from "../gamestate/entity";
import { Server } from "../server";

export class Clock extends DataAttribute<number> {}
export class ServerClock extends AttributeTag {}

function clockSystem(server: Server, dt: number) { 
    for (const clockEntity of server.gamestate.filter(Clock)) {
        server.gamestate.entity(clockEntity).get(Clock).data += dt;
    }
}

export function clock(server: Server) {
    function createServerClock() {
        const clock = server.gamestate.createEntity();
        server.gamestate.entity(clock)
            .add(new Clock(Date.now()))
            .add(new ServerClock());

        server.addSystem(clockSystem);

        return clock;
    }

    function getServerClocks() {
        return server.gamestate.filter(ServerClock);
    }

    function getServerClock() {
        return Array.from(getServerClocks())[0];
    }

    if (!getServerClock()) {
        createServerClock();
    }

    function getDate() {
        return new Date(server.gamestate.entity(getServerClock()).get(Clock).data);
    }

    server.commands.addCommand({
        command: 'timeset',
        alias: ['dateset'],
        usage: 'timeset [<timestamp>|@]',
        about: 'set the game clock',
    
        use(argv: string[]) {
            const x = argv.shift();
            if (!x) return server.error(`Missing argument for timestamp`);
            const timestamp = x === '@' ? Date.now() : parseInt(x);
            if (timestamp == NaN) return server.error(`Bad timestamp ${x}, must be number of milliseconds elapsed since January 1, 1970 00:00:00 UTC (unix timestamp)`);
            server.gamestate.entity(getServerClock()).get(Clock).data = timestamp;
            server.info(`Set the time to ${getDate().toLocaleDateString()} ${getDate().toLocaleTimeString()}`);
        }
    });

    server.commands.addCommand({
        command: 'time',
        alias: [],
        usage: 'time',
        about: 'get the server time',
    
        use(argv: string[]) {
            server.bold(`${getDate().toLocaleTimeString()}`);
        }
    });

    server.commands.addCommand({
        command: 'date',
        alias: [],
        usage: 'date',
        about: 'get the server date',
    
        use(argv: string[]) {
            server.bold(`${getDate().toLocaleDateString()}`);
        }
    });
}