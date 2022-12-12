import { useFunc } from 'ajv/dist/compile/util';
import { Gamestate } from '../gamestate/gamestate';
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
        navigator.clipboard.writeText(self.serializeState());
        server.print('gamestate copied to clipboard.');
      },
    });

    server.commands.addCommand({
      command: 'load-savestate',
      alias: ['load'],
      usage: 'load-savestate',
      about: 'load the curent gamestate',

      use(argv: string[]) {
        setTimeout(() => {
          const data = prompt('Enter gamestate data');
          if (!data) return;
          console.log(JSON.parse(data));
          self.deserializeState(data);
        }, 100);
      },
    });
  }

  serializeState(): string {
    const clients: any = {};
    const entities: any = this.server.gamestate.seralize();
    const config: any = this.server.serializeConfig();

    // seralize clients
    for (const client of this.server.getClients()) {
      clients[client.id] = client.serialize();
    }

    return JSON.stringify({ entities, clients, config });
  }

  deserializeState(data: string) {
    this.server.purgeClients();
    this.server.gamestate.reset();

    const obj = JSON.parse(data);
    const clients = obj.clients as unknown;
    const entities = obj.entities as unknown;
    const config = obj.config as unknown;

    if (!clients || typeof clients !== 'object' || clients === null)
      throw new Error('invalid data');
    if (!entities || typeof entities !== 'object' || entities === null)
      throw new Error('invalid data');
    if (!config || typeof config !== 'object' || config === null)
      throw new Error('invalid data');

    this.server.gamestate.deseralize(entities);
    this.server.deseralizeConfig(config);

    this.server.init();

    for (const client of Object.values(clients)) {
      this.server.loadClient(client);
    }
  }

  // LocalStorage could be used to save and load multiple gamestates
  // https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
  saveToLocalStorage(saveName: string) {
    localStorage.setItem(saveName, this.serializeState());
  }

  loadFromLocalStorage(saveName: string) {
    if(localStorage.length == 0) return this.server.error('No saves available.');
    const data = localStorage.getItem(saveName);
    if(!data) return this.server.error(`Could not find saved gamestate ${saveName}`);
    console.log(JSON.parse(data));
    this.deserializeState(data);
  }

  listSaves(): string[] {
    if(localStorage.length == 0) return [];
    let saveList: string[] | null = [];
    //for(let i: number = 0; i < localStorage.length; i++) saveList.push(localStorage.key(i));

    return saveList;
  }

  // SessionStorage could be used for autosave so the tab can recover its state when reloaded
  // https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage
  saveToSessionStorage() {
    sessionStorage.setItem('gssave', this.serializeState());
  }

  recoverSessionStorage() {
    const data = sessionStorage.getItem('gssave');
    if(!data) return this.server.error('Could not find gamestate save data.');
    console.log(JSON.parse(data));
    this.deserializeState(data);
  }

  // local json files on disk could be used for longer-term backups of saves
  // https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications
  saveToDisk() {}

  loadFromDisk() {}
}
