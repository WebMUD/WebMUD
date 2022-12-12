import { ClientView } from './client-view';

import * as util from '../common/util';
import { Client } from './client';

declare global {
  interface Window {
    clientView: ClientView;
    client: Client;
  }
}

const el = util.getElements({
  output: 'console-output',
  input: 'console-input',
  debug: 'enable-debug',
});

const client = (window.client = new Client());

window.clientView = new ClientView({
  output: el.output,
  input: el.input,
  debug: el.debug,
  client,
});



const searchParams = new URLSearchParams(window.location.search);
const serverID = searchParams.get('server');
if (serverID) client.connect(serverID);
else window.clientView.error(`invalid url`);
