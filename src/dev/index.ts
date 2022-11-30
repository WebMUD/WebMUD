import * as util from '../common/util';

import { createServer } from '../server/main';
import { ClientView } from '../client/client-view';
import { Client } from '../client/client';
import { VirtualClient } from './virtual-client';
import { MapEditPlugin } from '../server/plugins/map-edit-plugin';
import { WorldUtilPlugin } from '../server/plugins/world-util-plugin';
import { UtilCommandsPlugin } from '../server/plugins/util-commands-plugin';
import { DevModePlugin } from '../server/plugins/dev-mode-plugin';
import { LocalConnection } from '../common/connection/local-connection';
import { NPCGreeterPlugin } from '../server/plugins/npc-greeter-plugin';
import { SaveStatePlugin } from '../server/plugins/savestate-plugin';

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

  const world = server.gamestate.createWorld('TestWorld');
  const rooms = {
    lobby: server.gamestate.createRoom('Lobby', 'Welcome.', world),
    shop: server.gamestate.createRoom('Shop', 'A small store.', world),
    town_square: server.gamestate.createRoom('Town Square', '', world),
    road: server.gamestate.createRoom('Road', 'A very long road.', world),
  };

  window.server.onReady(() => {
    window.setTimeout(() => {
      for (let i = 0; i < NUM_CLIENTS; i++) createClient();

      setTimeout(() => {
        const clients = Array.from(server.getClients());
        server.gs.move(clients[1].player, rooms.town_square);
      }, 1000);
    });
  });

  server.gamestate.connectEastWest(rooms.town_square, rooms.shop);
  server.gamestate.connectNorthSouth(rooms.road, rooms.town_square);

  server.gamestate.adjacent(rooms.lobby).down = rooms.town_square;

  server.gamestate.adjacent(rooms.road).north = rooms.road;

  server.gs.move(
    server
      .getPlugin(NPCGreeterPlugin)
      .create('Guide', 'Welcome to the development server, %p.'),
    rooms.lobby
  );
  server.gs.move(
    server
      .getPlugin(NPCGreeterPlugin)
      .create('Shop Keeper', 'Welcome to the shop.'),
    rooms.shop
  );

  server.init(world, rooms.lobby);
});

// for testing
function getSaveStatePlugin() {
  return window.server.getPlugin(SaveStatePlugin);
}
