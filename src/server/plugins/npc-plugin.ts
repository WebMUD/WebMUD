import {
  Component,
  SerializedComponent,
} from '../gamestate/components/base/component';
import { Server } from '../server';
import { WebMUDServerPlugin } from '../webmud-server-plugin';

export type SerializedNPCComponent = SerializedComponent & {
  type: 'component-npc';
  message: string;
  greeted: string[];
};

export class NPCComponent extends Component {
  static deserialize(data: unknown): NPCComponent | false {
    if (NPCComponent.validate(data)) return new NPCComponent();
    return false;
  }

  static validate(data: any): data is SerializedNPCComponent {
    if (!Component.validateType(NPCComponent.type, data)) return false;
    return true;
  }

  serialize() {
    return {
      type: NPCComponent.type,
    };
  }

  static type = 'component-npc';
}

export class NPCPlugin extends WebMUDServerPlugin {
  init(server: Server) {
    server.gamestate.defineComponent(NPCComponent);
  }
}
