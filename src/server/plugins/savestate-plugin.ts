import { Server } from '../server';
import { WebMUDServerPlugin } from '../webmud-server-plugin';

export class SaveStatePlugin extends WebMUDServerPlugin {
  server: Server;

  init(server: Server) {
    this.server = server;
    // add commands for saving and loading states
  }

  serializeState(): string {
    return '';
  }

  deserializeState(data: string) {}

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
