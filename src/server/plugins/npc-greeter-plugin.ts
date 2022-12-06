import {
  ChatChannel,
  HierarchyChild,
  HierarchyContainer,
  Name,
  Player,
} from '../gamestate/components';
import {
  Component,
  SerializedComponent,
} from '../gamestate/components/base/component';
import { Entity, EntityID } from '../gamestate/entity';
import { Gamestate } from '../gamestate/gamestate';
import { Manager } from '../gamestate/manager';
import { Server } from '../server';
import { WebMUDServerPlugin } from '../webmud-server-plugin';
import { NPCComponent } from './npc-plugin';

export type SerializedNPCGreeter = SerializedComponent & {
  type: 'component-npc-greeter';
  message: string;
  greeted: string[];
};

export class NPCGreeterComponent extends Component {
  // "%p" replaced with player name
  message: string;

  greeted = new Set<EntityID>();

  constructor(message: string) {
    super();
    this.message = message;
  }

  static deserialize(data: unknown): NPCGreeterComponent | false {
    if (NPCGreeterComponent.validate(data)) {
      const c = new NPCGreeterComponent(data.message);
      for (const greeted of data.greeted) c.greeted.add(greeted);
      return c;
    }
    return false;
  }

  static validate(data: any): data is SerializedNPCGreeter {
    if (!Component.validateType(NPCGreeterComponent.type, data)) return false;
    if (!(data.parent === undefined || typeof data.parent === 'string'))
      return false;
    if (!Array.isArray(data.greeted)) return false;
    for (const x of data.greeted) if (typeof x !== 'string') return false;
    return true;
  }

  serialize() {
    return {
      type: NPCGreeterComponent.type,
      message: this.message,
      greeted: Array.from(this.greeted.keys()),
    };
  }

  start(entity: string, gs: Manager | Gamestate) {
    if (gs instanceof Gamestate) {
      NPCGreeterPlugin.onNPCMove(gs, entity);
    }
  }

  static type = 'component-npc-greeter';
}

export class NPCGreeterPlugin extends WebMUDServerPlugin {
  server: Server;

  init(server: Server) {
    this.server = server;
    const self = this;

    server.gamestate.defineComponent(NPCGreeterComponent);

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
        self.create(name, message);
        server.info(`Created NPC ${name}`);
      },
    });
  }

  create(name: string, message: string) {
    const e = this.server.gs.createEntity();
    this.server.gs
      .entity(e)
      .add(new Name(name))
      .add(new NPCComponent())
      .add(new HierarchyChild())
      .add(new HierarchyContainer())
      .add(new NPCGreeterComponent(message));

    this.server.gs
      .entity(e)
      .get(HierarchyChild)
      .onMove(() => NPCGreeterPlugin.onNPCMove(this.server.gs, e));

    NPCGreeterPlugin.onNPCMove(this.server.gs, e);

    return e;
  }

  static onNPCMove(gs: Gamestate, e: EntityID) {
    if (!gs.hasParent(e)) return;
    const parent = gs.getParent(e);

    const stop = parent.get(HierarchyContainer).onJoin((target: EntityID) => {
      if (
        !(gs.entity(target).has(Player) && gs.entity(target).has(ChatChannel))
      )
        return;
      const greeterComponent = gs.entity(e).get(NPCGreeterComponent);
      if (greeterComponent.greeted.has(target)) return;
      greeterComponent.greeted.add(target);
      setTimeout(() => {
        gs.entity(target)
          .get(ChatChannel)
          .event.emit({
            senderID: e,
            senderName: gs.nameOf(e),
            content: greeterComponent.message.replace('%p', gs.nameOf(target)),
          });
      }, 1000);
    });
    gs.entity(e).get(HierarchyChild).onMove.once(stop);
  }
}
