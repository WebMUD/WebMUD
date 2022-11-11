import { AttributeTag } from '../gamestate/components/base/attribute-tag';
import { DataAttribute } from '../gamestate/components/base/data-attribute';
import { EntityID } from '../gamestate/entity';
import { WebMUDServerPlugin } from '../webmud-server-plugin';
import { Server } from '../server';

export class Clock extends DataAttribute<number> {}
export class GameClock extends AttributeTag {}

export class ClockPlugin extends WebMUDServerPlugin {
  server: Server;

  init(server: Server) {
    this.server = server;

    const self = this;
    if (!Array.from(this.getGameClocks()).length) this.createServerClock();

    server.commands.addCommand({
      command: 'timeset',
      alias: ['dateset'],
      usage: 'timeset [<timestamp>|@]',
      about: 'set the game clock',

      use(argv: string[]) {
        const x = argv.shift();
        if (!x) return server.error(`Missing argument for timestamp`);
        const timestamp = x === '@' ? Date.now() : parseInt(x);
        if (timestamp == NaN)
          return server.error(
            `Bad timestamp ${x}, must be number of milliseconds elapsed since January 1, 1970 00:00:00 UTC (unix timestamp)`
          );
        server.gamestate.entity(self.getGameClock()).get(Clock).data =
          timestamp;
        server.info(
          `Set the time to ${self.getDate().toLocaleDateString()} ${self
            .getDate()
            .toLocaleTimeString()}`
        );
      },
    });

    server.commands.addCommand({
      command: 'time',
      alias: [],
      usage: 'time',
      about: 'get the game time',

      use(argv: string[]) {
        server.bold(`${self.getDate().toLocaleTimeString()}`);
      },
    });

    server.commands.addCommand({
      command: 'date',
      alias: [],
      usage: 'date',
      about: 'get the game date',

      use(argv: string[]) {
        server.bold(`${self.getDate().toLocaleDateString()}`);
      },
    });
  }

  createServerClock() {
    const clock = this.server.gamestate.createEntity();
    this.server.gamestate
      .entity(clock)
      .add(new Clock(Date.now()))
      .add(new GameClock());

    this.server.addSystem(ClockPlugin.clockSystem);

    return clock;
  }

  getGameClocks() {
    return this.server.gamestate.filter(GameClock);
  }

  getDate() {
    if (this.getGameClock())
      return new Date(
        this.server.gamestate.entity(this.getGameClock()).get(Clock).data
      );
    else throw new Error('No game clock');
  }

  getGameClock() {
    const clock = Array.from(this.getGameClocks())[0];
    if (!clock) throw new Error('No game clock');
    return clock;
  }

  static clockSystem(server: Server, dt: number) {
    for (const clockEntity of server.gamestate.filter(Clock)) {
      server.gamestate.entity(clockEntity).get(Clock).data += dt;
    }
  }
}
