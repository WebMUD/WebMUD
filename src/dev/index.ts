import * as util from '../common/util';

import { createServer } from '../server/main';

const server = createServer(true, [
  new WorldUtilPlugin(),
  new MapEditPlugin(),
  new UtilCommandsPlugin(),
]);

const world = server.gamestate.createWorld('TestWorld');
const rooms = {
  start: server.gamestate.createRoom(
    'WelcomeRoom',
    'Nothing to see here.',
    world
  ),
  north: server.gamestate.createRoom(
    'NorthRoom',
    'A room to the north.',
    world
  ),
};

server.gamestate.connectNorthSouth(rooms.north, rooms.start);

server.init(world, rooms.start);

import { ClientView } from '../client/client-view';
import { Client } from '../client/client';
import { VirtualClient } from './virtual-client';
import { create } from 'lodash';
import { MapEditPlugin } from '../server/plugins/map-edit-plugin';
import { WorldUtilPlugin } from '../server/plugins/world-util-plugin';
import { UtilCommandsPlugin } from '../server/plugins/util-commands-plugin';

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

  // window.server.onConnection(client.connection);
}

el.create.onclick = createClient;

for (let i = 0; i < NUM_CLIENTS; i++) createClient();

window.server.start();
