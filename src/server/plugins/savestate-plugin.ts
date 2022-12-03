import { Server } from '../server';
import { WebMUDServerPlugin } from '../webmud-server-plugin';

export class SaveStatePlugin extends WebMUDServerPlugin {
  server: Server;

  init(server: Server) {
    this.server = server;
    const self = this;

    server.commands.addCommand({
      command: 'dump-savestate',
      alias: ['dump'],
      usage: 'dump-savestate',
      about: 'dump the curent gamestate',

      use(argv: string[]) {
        server.info(self.serializeState());
      },
    });
  }

  serializeState(): string {
    const entities: any = {};
    const clients: any = {};

    // seralize entites
    for (const entity of this.server.gs.all()) {
      const serialized = [];
      for (const component of this.server.gs.entity(entity)) {
        serialized.push(component.serialize());
      }
      entities[entity] = serialized;
    }

    // seralize clients
    for (const client of this.server.getClients()) {
      clients[client.id] = client.serialize();
    }

    return JSON.stringify({entities, clients});
  }

  deserializeState(data: string) {
    //parse the string
    //loop over all the components
    //try to deserialize the component by looping through all the component classes
  }

  // LocalStorage could be used to save and load multiple gamestates
  // https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
  saveToLocalStorage(saveName: string) {}

  loadFromLocalStorage(saveName: string) {}

  listSaves() {}

  // SessionStorage could be used for autosave so the tab can recover its state when reloaded
  // https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage
  saveToSessionStorage() {}

  recoverSessionStorage() {}

  // local json files on disk could be used for longer-term backups of saves
  // https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications
  saveToDisk() {}

  loadFromDisk() {}
}
