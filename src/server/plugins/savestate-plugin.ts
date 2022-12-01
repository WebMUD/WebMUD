import { json } from 'stream/consumers';
import { item } from '../../client/parser/parser';
import { Description, Item, Name, Player, Prop, Room, World } from '../gamestate/components';
import { SerializableComponentClass } from '../gamestate/components/base/component';
import { Server } from '../server';
import { WebMUDServerPlugin } from '../webmud-server-plugin';

export class SaveStatePlugin extends WebMUDServerPlugin {
  server: Server;

  init(server: Server) {
    this.server = server;
    // add commands for saving and loading states
  }

  serializeState(): string {
    const result:any = {};
    for (const entity of this.server.gs.all()) {
      console.log(entity)
      const serialized = {};
      for (const component of this.server.gs.entity(entity)) {
        console.log(component)
      }
      result[entity] =  serialized;
    }
    return JSON.stringify(result);
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

  static componentClasses: SerializableComponentClass[]=[ 
    World,
    Name,
    Room,
    Prop,
    Player,
    Item,
    Description,
    
  ]
}

