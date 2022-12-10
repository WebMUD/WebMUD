import * as util from '../common/util';

import { createServer } from '../server/main';
import { Client } from '../client/client';
import { VirtualClient } from './virtual-client';
import { MapEditPlugin } from '../server/plugins/map-edit-plugin';
import { WorldUtilPlugin } from '../server/plugins/world-util-plugin';
import { UtilCommandsPlugin } from '../server/plugins/util-commands-plugin';
import { DevModePlugin } from '../server/plugins/dev-mode-plugin';
import { LocalConnection } from '../common/connection/local-connection';


const NUM_CLIENTS = 2;

declare global {
  interface Window {
    clients: { [name: string]: VirtualClient };
  }
}

const el = util.getElements({
  create: 'create-client',
  clients: 'clients',
});

let i = 1;

function createClient() {
  const id = i++;
  const client = new Client();
  window.clients[`c${id}`] = new VirtualClient(
    el.clients,
    `Virtual Client ${id}`,
    client
  );

  const [serverConnection, clientConnection] = LocalConnection.create();

  window.server.onConnection(serverConnection);
  client.useConnection(clientConnection);

  client.join(`Player${id}`);
}

el.create.onclick = createClient;

window.setTimeout(() => {
  const server = createServer(true, [
    new WorldUtilPlugin(),
    new MapEditPlugin(),
    new UtilCommandsPlugin(),
    new DevModePlugin(),
  ]);

  window.server.onReady(() => {
    server.loadLevel('/levels/dev.json');

    window.setTimeout(() => {
      for (let i = 0; i < NUM_CLIENTS; i++) createClient();

      setTimeout(() => {
        const clients = Array.from(server.getClients());
      }, 1000);
    });
  });

  server.startDiscovery();
});
