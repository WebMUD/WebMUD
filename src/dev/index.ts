import * as util from '../common/util';

import '../server/index';

import { ClientView } from '../client/client-view';
import { Client } from '../client/client';
import { VirtualClient } from './virtual-client';
import { create } from 'lodash';

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
}

el.create.onclick = createClient;

for (let i = 0; i < NUM_CLIENTS; i++) createClient();
