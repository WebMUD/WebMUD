import { send } from 'process';
import { arrayBuffer } from 'stream/consumers';
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
  messages: string[];
  greeted: string[];
  delay: number;
};

export class NPCGreeterComponent extends Component {
  // "%p" replaced with player name
  messages: string[];

  greeted = new Set<EntityID>();

  delay: number;

  constructor(messages: string[], delay: number = 1) {
    super();
    this.messages = messages;
    this.delay = delay;
  }

  static deserialize(data: unknown): NPCGreeterComponent | false {
    if (NPCGreeterComponent.validate(data)) {
      const c = new NPCGreeterComponent(data.messages, data.delay);
      for (const greeted of data.greeted) c.greeted.add(greeted);
      return c;
    }
    return false;
  }

  static validate(data: any): data is SerializedNPCGreeter {
    if (!Component.validateType(NPCGreeterComponent.type, data)) return false;
    if (!Array.isArray(data.messages)) return false;
    for (const message of data.messages)
      if (typeof message !== 'string') return false;
    if (!Array.isArray(data.greeted)) return false;
    for (const x of data.greeted) if (typeof x !== 'string') return false;
    if (typeof data.delay !== 'number') return false;
    return true;
  }

  serialize() {
    return {
      type: NPCGreeterComponent.type,
      messages: this.messages,
      greeted: Array.from(this.greeted.keys()),
      delay: this.delay,
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
      usage: 'create-npc-greeter <name> <delay> <messages>',
      about: 'create a greeter npc',

      use(argv: string[]) {
        const name = argv.shift();
        const delay = argv.shift();
        const messages = argv;
        if (!name) return server.error(`Missing value for name`);
        if (!delay) return server.error('No delay specified');
        if (!messages.length) return server.error(`Missing value for message`);
        const check = parseInt(delay);
        if (isNaN(check)) return server.error('Non-number delay');

        self.create(name, check, messages);
        server.info(`Created NPC ${name}`);
      },
    });
  }

  create(name: string, delay: number, messages: string[]) {
    const e = this.server.gs.createEntity();
    this.server.gs
      .entity(e)
      .add(new Name(name))
      .add(new NPCComponent())
      .add(new HierarchyChild())
      .add(new HierarchyContainer())
      .add(new NPCGreeterComponent(messages, delay));

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

      const unsentMessages = [...greeterComponent.messages];
      const sendMessage = () => {
        const nextMessage = unsentMessages.shift();
        if (nextMessage) {
          gs.entity(target)
            .get(ChatChannel)
            .event.emit({
              senderID: e,
              senderName: gs.nameOf(e),
              content: nextMessage.replace('%p', gs.nameOf(target)),
            });
          sendNext();
        }
      };

      const sendNext = () => {
        setTimeout(sendMessage, greeterComponent.delay * 1000);
      };
      setTimeout(sendMessage, 1000);
    });
    gs.entity(e).get(HierarchyChild).onMove.once(stop);
  }
}
