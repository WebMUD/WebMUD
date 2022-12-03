import { Component } from '../gamestate/components/base/component';
import { Server } from '../server';
import { WebMUDServerPlugin } from '../webmud-server-plugin';

export class NPCComponent extends Component {
  serialize() {
    return {
      type: NPCComponent.type,
    }
  }

  static type = 'component-npc';
}

export class NPCPlugin extends WebMUDServerPlugin {
  init(server: Server) {}
}
